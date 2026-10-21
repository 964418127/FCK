/**
 * 菜单门控（gate）的服务端存储 —— 真正的「全局生效」靠它。
 *
 * 为什么需要服务端：localStorage 是按「协议 + 域名 + 端口」隔离的。
 * 两个页签若开在不同端口（本仓 dev 5178 / dist 3000 都在跑）、或换一台电脑，彼此都读不到。
 * 所以配置必须落在「服务端的一份文件」里，所有客户端读同一份。
 *
 * 接口（挂在 /api/gate 下）：
 *   GET    /              → { hidden, order, updatedAt, keyIsDefault }  公开（客户端要读菜单开关）
 *   POST   /              → body { hidden, order }                      需登录，落盘并广播
 *   DELETE /              → 清空                                         需登录
 *   GET    /events        → SSE，任何一次写入都会推给所有在线客户端
 *   POST   /auth          → body { key } → { token }，密钥不对返回 401
 *   GET    /session       → 校验 token：{ ok: true }
 *   POST   /key           → body { oldKey, newKey }，需登录，改完签发新 token
 *   POST   /logout        → 作废当前 token
 *
 * 登录态只存在内存（服务重启后需重新登录），密钥本身以 sha256(salt + key) 落盘。
 * 默认密钥见 DEFAULT_KEY；首次使用（尚未改过密钥）时 keyIsDefault=true，前端会提示。
 *
 * 落盘文件：项目根 .gate-state.json（已 gitignore，属运行期状态）
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

const STATE_FILE = resolve(process.cwd(), '.gate-state.json')

/** 首次使用的默认密钥；改过之后 keyIsDefault 变 false，页面上就不再提示 */
const DEFAULT_KEY = 'fck2026'
const TOKEN_TTL = 12 * 60 * 60 * 1000 // 12 小时

let cache = null
const sessions = new Map() // token -> expiresAt
const sseClients = new Set()

const hashKey = (key, salt) => createHash('sha256').update(`${salt}:${key}`).digest('hex')

const TABS = ['web', 'mobile', 'doc']

/** 顺序表：每个端一份扁平 id 数组；缺省全空 = 按代码里的原始顺序 */
const emptyOrder = () => ({ web: [], mobile: [], doc: [] })

const normalizeOrder = (raw) => {
  const out = emptyOrder()
  if (raw && typeof raw === 'object') {
    TABS.forEach((tab) => {
      const list = raw[tab]
      if (Array.isArray(list)) out[tab] = list.filter((x) => typeof x === 'string')
    })
  }
  return out
}

function readState () {
  if (cache) return cache
  try {
    if (existsSync(STATE_FILE)) {
      const raw = JSON.parse(readFileSync(STATE_FILE, 'utf8'))
      cache = {
        hidden: Array.isArray(raw.hidden) ? raw.hidden.filter((x) => typeof x === 'string') : [],
        // 老状态文件里没有 order，按空处理 —— 行为与改造前完全一致
        order: normalizeOrder(raw.order),
        updatedAt: raw.updatedAt || null,
        keySalt: typeof raw.keySalt === 'string' ? raw.keySalt : null,
        keyHash: typeof raw.keyHash === 'string' ? raw.keyHash : null,
        keyIsDefault: raw.keyIsDefault !== false
      }
      return cache
    }
  } catch (e) {
    console.warn('[gate] 状态文件读取失败，按空配置处理:', e.message)
  }
  cache = { hidden: [], order: emptyOrder(), updatedAt: null, keySalt: null, keyHash: null, keyIsDefault: true }
  return cache
}

function persist () {
  try {
    mkdirSync(dirname(STATE_FILE), { recursive: true })
    writeFileSync(STATE_FILE, JSON.stringify(cache, null, 2), 'utf8')
  } catch (e) {
    console.warn('[gate] 状态文件写入失败（仅内存生效）:', e.message)
  }
}

/** 对外的公开视图：绝不带 salt / hash */
function publicState () {
  const s = readState()
  return { hidden: s.hidden, order: s.order, updatedAt: s.updatedAt, keyIsDefault: s.keyIsDefault }
}

/**
 * 整体覆盖写。order 缺省（undefined）时保留原顺序 ——
 * 这样老客户端只发 {hidden} 也不会把别人的排序清空。
 */
function writeConfig (hidden, order) {
  const s = readState()
  s.hidden = [...new Set((hidden || []).filter((x) => typeof x === 'string'))]
  if (order !== undefined) s.order = normalizeOrder(order)
  s.updatedAt = new Date().toISOString()
  persist()
  broadcast()
  return publicState()
}

/** 当前生效的密钥记录；还没设置过就用默认密钥 */
function currentKey () {
  const s = readState()
  if (s.keyHash && s.keySalt) return { salt: s.keySalt, hash: s.keyHash }
  const salt = 'default'
  return { salt, hash: hashKey(DEFAULT_KEY, salt) }
}

function verifyKey (key) {
  if (typeof key !== 'string' || !key) return false
  const cur = currentKey()
  const a = Buffer.from(hashKey(key, cur.salt), 'hex')
  const b = Buffer.from(cur.hash, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

function issueToken () {
  const token = randomBytes(24).toString('hex')
  sessions.set(token, Date.now() + TOKEN_TTL)
  return token
}

function dropToken (token) {
  sessions.delete(token)
}

function tokenOf (req) {
  const raw = req.headers.authorization || ''
  const m = /^Bearer\s+(.+)$/i.exec(raw)
  return m ? m[1].trim() : ''
}

function requireAuth (req, res) {
  const token = tokenOf(req)
  const exp = token ? sessions.get(token) : 0
  if (!token || !exp || exp < Date.now()) {
    if (token) sessions.delete(token)
    sendJson(res, 401, { error: 'unauthorized', message: '登录已失效，请重新登录' })
    return null
  }
  return token
}

/** 改密钥时顺手清掉别人手里的旧 token */
function invalidateSessions () {
  sessions.clear()
}

function broadcast () {
  const payload = `data: ${JSON.stringify(publicState())}\n\n`
  for (const res of sseClients) {
    try {
      res.write(payload)
    } catch (e) {
      sseClients.delete(res)
    }
  }
}

function readBody (req) {
  return new Promise((resolveBody, reject) => {
    let raw = ''
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      // 一份菜单 id 列表不该超过 256KB，超了直接掐断
      if (size > 256 * 1024) {
        reject(new Error('payload too large'))
        req.destroy()
        return
      }
      raw += chunk
    })
    req.on('end', () => resolveBody(raw))
    req.on('error', reject)
  })
}

function sendJson (res, code, obj) {
  const body = JSON.stringify(obj)
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Length', Buffer.byteLength(body))
  res.end(body)
}

const parseBody = async (req) => {
  const raw = await readBody(req)
  return raw ? JSON.parse(raw) : {}
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {string} [forcedPath] 自行挂载时传入已剥掉前缀的路径（connect 挂载会自动剥，不用传）
 */
export async function gateMiddleware (req, res, forcedPath) {
  // 注意：connect 调用中间件时第三参是 next（函数），只有自建服务器挂载时才传字符串路径
  // connect 的 use(path) 通常会剥掉挂载前缀，但不同宿主行为不一，这里再兜一次
  let url = typeof forcedPath === 'string' ? forcedPath : (req.url || '/').split('?')[0]
  url = url.replace(/^\/api\/gate(?=\/|$)/, '') || '/'
  if (!url.startsWith('/')) url = '/' + url
  const method = (req.method || 'GET').toUpperCase()

  // ---- 公开读 ----
  if (method === 'GET' && (url === '/' || url === '')) {
    return sendJson(res, 200, publicState())
  }

  // ---- SSE ----
  if (method === 'GET' && url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    })
    // 连上先给一次当前值，避免客户端要等下一次变更才对齐
    res.write(`data: ${JSON.stringify(publicState())}\n\n`)
    sseClients.add(res)
    const heartbeat = setInterval(() => {
      try {
        res.write(': ping\n\n')
      } catch (e) {
        /* 连接已断，close 事件里会清理 */
      }
    }, 25000)
    req.on('close', () => {
      clearInterval(heartbeat)
      sseClients.delete(res)
    })
    return
  }

  // ---- 登录 ----
  if (method === 'POST' && url === '/auth') {
    try {
      const body = await parseBody(req)
      if (!verifyKey(body.key)) {
        return sendJson(res, 401, { error: 'bad key', message: '密钥不对' })
      }
      return sendJson(res, 200, { token: issueToken(), keyIsDefault: readState().keyIsDefault })
    } catch (e) {
      return sendJson(res, 400, { error: 'bad request', message: e.message })
    }
  }

  // ---- 校验登录态 ----
  if (method === 'GET' && url === '/session') {
    const token = requireAuth(req, res)
    if (!token) return
    return sendJson(res, 200, { ok: true, keyIsDefault: readState().keyIsDefault })
  }

  if (method === 'POST' && url === '/logout') {
    const token = requireAuth(req, res)
    if (!token) return
    dropToken(token)
    return sendJson(res, 200, { ok: true })
  }

  // ---- 改密钥 ----
  if (method === 'POST' && url === '/key') {
    const token = requireAuth(req, res)
    if (!token) return
    try {
      const body = await parseBody(req)
      if (!verifyKey(body.oldKey)) {
        return sendJson(res, 401, { error: 'bad key', message: '当前密钥不对' })
      }
      const next = typeof body.newKey === 'string' ? body.newKey.trim() : ''
      if (next.length < 4) {
        return sendJson(res, 400, { error: 'too short', message: '新密钥至少 4 位' })
      }
      const salt = randomBytes(8).toString('hex')
      const s = readState()
      s.keySalt = salt
      s.keyHash = hashKey(next, salt)
      s.keyIsDefault = false
      persist()
      invalidateSessions()
      return sendJson(res, 200, { token: issueToken(), keyIsDefault: false })
    } catch (e) {
      return sendJson(res, 400, { error: 'bad request', message: e.message })
    }
  }

  // ---- 写配置 ----
  if (method === 'POST' && (url === '/' || url === '')) {
    if (!requireAuth(req, res)) return
    try {
      const body = await parseBody(req)
      return sendJson(res, 200, writeConfig(body.hidden, body.order))
    } catch (e) {
      return sendJson(res, 400, { error: 'bad request', message: e.message })
    }
  }

  if (method === 'DELETE') {
    if (!requireAuth(req, res)) return
    return sendJson(res, 200, writeConfig([], emptyOrder()))
  }

  return sendJson(res, 404, { error: 'not found' })
}
