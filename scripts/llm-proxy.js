/**
 * LLM 中转 —— 让原型真的调用大模型，同时不让 key 进浏览器。
 *
 * 为什么必须有这一层：浏览器直连供应商会被 CORS 拦，且 key 会裸露在 Network 面板里。
 * 这里复用 gate 那套「vite 中间件 + 服务端文件」的模式，不额外起进程：
 *
 *   GET  /api/llm/config    → 当前配置（key 只回掩码）        免登录
 *   POST /api/llm/config    → 保存配置（改 key / 参数）        需 gate 登录
 *   POST /api/llm/test      → 连通性测试，返回延迟 + 回显      免登录
 *   POST /api/llm/generate  → SSE 流式生成，逐 token 下发       免登录
 *
 * 权限模型：key 永不离开服务端，读掩码 / 用已配好的 key 生成都不泄密，
 * 所以局域网内任何设备打开就能用，不必每台都登录；「写入 key」是唯一
 * 改变服务端状态的操作，才要求 gate 登录。
 *
 * 落盘：项目根 .llm-config.json（已 gitignore，权限 600，只在本机）
 *
 * 刻意不做的事：不内置 key、不写死服务商、不把 key 回传给前端。
 * 静态包（site/ / site-offline/）没有 Node，这几个接口都不存在 ——
 * 前端检测到 404 会退化为「回放归档结果」，见 src/composables/useLlmConfig.js。
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { LLM_DEFAULTS, presetOf } from '../src/config/llmPresets.js'
import { isValidToken } from './gate-store.js'

const CONFIG_FILE = resolve(process.cwd(), '.llm-config.json')

let cache = null

const readConfig = () => {
  if (cache) return cache
  try {
    if (existsSync(CONFIG_FILE)) {
      const raw = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'))
      cache = { ...LLM_DEFAULTS, ...raw }
      return cache
    }
  } catch (e) {
    console.warn('[llm] 配置读取失败，用默认值:', e.message)
  }
  cache = { ...LLM_DEFAULTS, apiKey: '' }
  return cache
}

const persist = () => {
  try {
    mkdirSync(dirname(CONFIG_FILE), { recursive: true })
    writeFileSync(CONFIG_FILE, JSON.stringify(cache, null, 2), 'utf8')
    try {
      chmodSync(CONFIG_FILE, 0o600)
    } catch (e) {
      /* Windows 上 chmod 不可用，忽略 */
    }
  } catch (e) {
    console.warn('[llm] 配置写入失败（仅内存生效）:', e.message)
  }
}

/** key 永不回传：只给「有没有」+ 头尾掩码 */
const maskKey = (key) => {
  const s = String(key || '')
  if (!s) return ''
  if (s.length <= 8) return '****'
  return `${s.slice(0, 3)}****${s.slice(-4)}`
}

const publicConfig = () => {
  const c = readConfig()
  return {
    provider: c.provider,
    baseUrl: c.baseUrl,
    model: c.model,
    temperature: c.temperature,
    maxTokens: c.maxTokens,
    timeoutMs: c.timeoutMs,
    jsonMode: c.jsonMode,
    reasoningEffort: c.reasoningEffort || 'auto',
    hasKey: Boolean(c.apiKey),
    keyMask: maskKey(c.apiKey),
    updatedAt: c.updatedAt || null
  }
}

function sendJson (res, code, obj) {
  const body = JSON.stringify(obj)
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Length', Buffer.byteLength(body))
  res.end(body)
}

function readBody (req) {
  return new Promise((resolveBody, reject) => {
    let raw = ''
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 2 * 1024 * 1024) {
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

const parseBody = async (req) => {
  const raw = await readBody(req)
  return raw ? JSON.parse(raw) : {}
}

const authFail = (res) =>
  sendJson(res, 401, { error: 'unauthorized', message: '请先在 /gate 登录后再配置模型' })

/** 把上游错误折成一句人话（供应商的报错原文也带上，方便排 key） */
const describeError = (status, text) => {
  if (status === 401 || status === 403) return `鉴权失败（${status}）：key 不对或没有该模型权限`
  if (status === 404) return `接口不存在（404）：检查 Base URL 是否带 /v1`
  if (status === 429) return '限流或额度用尽（429）'
  if (status >= 500) return `上游服务异常（${status}）`
  return `请求失败（${status}）${text ? '：' + text.slice(0, 200) : ''}`
}

const buildUrl = (baseUrl, path) => {
  const base = String(baseUrl || '').replace(/\/+$/, '')
  return `${base}${path}`
}

const headersOf = (cfg) => {
  const h = { 'Content-Type': 'application/json' }
  // Ollama 不需要 key，有才带
  if (cfg.apiKey) h.Authorization = `Bearer ${cfg.apiKey}`
  return h
}

// ============== 连通性测试 ==============
async function handleTest (req, res) {
  const cfg = readConfig()
  if (!cfg.baseUrl || !cfg.model) {
    return sendJson(res, 400, { error: 'incomplete', message: 'Base URL 与模型名都要填' })
  }
  if (cfg.provider !== 'ollama' && !cfg.apiKey) {
    return sendJson(res, 400, { error: 'no key', message: '还没填 API Key' })
  }

  const started = Date.now()
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), Math.min(cfg.timeoutMs || 30000, 30000))
  try {
    const r = await fetch(buildUrl(cfg.baseUrl, '/chat/completions'), {
      method: 'POST',
      headers: headersOf(cfg),
      signal: ctrl.signal,
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: 'user', content: '只回复两个字：可用' }],
        max_tokens: 16,
        temperature: 0
      })
    })
    const text = await r.text()
    const latency = Date.now() - started
    if (!r.ok) {
      return sendJson(res, 200, { ok: false, latency, message: describeError(r.status, text), raw: text.slice(0, 400) })
    }
    let reply = ''
    let usage = null
    try {
      const data = JSON.parse(text)
      reply = data?.choices?.[0]?.message?.content || ''
      usage = data?.usage || null
    } catch (e) {
      reply = text.slice(0, 120)
    }
    return sendJson(res, 200, { ok: true, latency, model: cfg.model, reply: String(reply).trim().slice(0, 60), usage })
  } catch (e) {
    const latency = Date.now() - started
    const msg = e.name === 'AbortError'
      ? `超时（${Math.round(latency / 1000)}s）：域名不通或被墙`
      : `连接失败：${e.message}`
    return sendJson(res, 200, { ok: false, latency, message: msg })
  } finally {
    clearTimeout(timer)
  }
}

// ============== 拉取可用模型 ==============
/**
 * 厂商模型名改动频繁（DeepSeek 2026-07 就换掉了一整批），
 * 所以不指望预置列表永远对：能问就问一次 GET {baseUrl}/models。
 * 有些厂商不实现这个接口，返回 ok:false 由前端提示手填。
 */
async function handleModels (req, res) {
  const cfg = readConfig()
  if (!cfg.baseUrl) {
    return sendJson(res, 400, { error: 'incomplete', message: '先填 Base URL' })
  }
  if (cfg.provider !== 'ollama' && !cfg.apiKey) {
    return sendJson(res, 400, { error: 'no key', message: '还没填 API Key' })
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000)
  try {
    const r = await fetch(buildUrl(cfg.baseUrl, '/models'), {
      headers: headersOf(cfg),
      signal: ctrl.signal
    })
    const text = await r.text()
    if (!r.ok) {
      return sendJson(res, 200, { ok: false, message: describeError(r.status, text) })
    }
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      return sendJson(res, 200, { ok: false, message: '返回不是 JSON，该服务可能不支持 /models' })
    }
    const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    const models = list
      .map((m) => (typeof m === 'string' ? m : m?.id))
      .filter((x) => typeof x === 'string' && x)
    return sendJson(res, 200, {
      ok: true,
      count: models.length,
      models: [...new Set(models)].sort()
    })
  } catch (e) {
    return sendJson(res, 200, {
      ok: false,
      message: e.name === 'AbortError' ? '拉取超时（20s）' : `拉取失败：${e.message}`
    })
  } finally {
    clearTimeout(timer)
  }
}

// ============== 流式生成 ==============
async function handleGenerate (req, res) {
  const cfg = readConfig()
  if (!cfg.baseUrl || !cfg.model) {
    return sendJson(res, 400, { error: 'incomplete', message: '模型还没配置，去 /gate 填一下' })
  }

  let body
  try {
    body = await parseBody(req)
  } catch (e) {
    return sendJson(res, 400, { error: 'bad request', message: e.message })
  }

  const messages = Array.isArray(body.messages) ? body.messages : []
  if (!messages.length) {
    return sendJson(res, 400, { error: 'no messages', message: '缺少 messages' })
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  })
  const send = (obj) => {
    try {
      res.write(`data: ${JSON.stringify(obj)}\n\n`)
    } catch (e) {
      /* 客户端已断开 */
    }
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), cfg.timeoutMs || 120000)
  const started = Date.now()
  let full = ''
  let usage = null

  try {
    const payload = {
      model: body.model || cfg.model,
      messages,
      temperature: typeof body.temperature === 'number' ? body.temperature : cfg.temperature,
      max_tokens: body.maxTokens || cfg.maxTokens,
      stream: true,
      stream_options: { include_usage: true }
    }
    // JSON 模式：支持的供应商会强制输出合法 JSON；不支持的靠提示词 + 校验兜底
    if (body.jsonMode ?? cfg.jsonMode) payload.response_format = { type: 'json_object' }
    // 推理型模型（MiniMax M3 系列等）强制思考，调低强度才不至于把预算全花在思考上；
    // 普通模型不能收这个参数，所以默认 'auto' = 不发
    if (cfg.reasoningEffort && cfg.reasoningEffort !== 'auto') {
      payload.reasoning_effort = cfg.reasoningEffort
    }

    const upstream = await fetch(buildUrl(cfg.baseUrl, '/chat/completions'), {
      method: 'POST',
      headers: headersOf(cfg),
      signal: ctrl.signal,
      body: JSON.stringify(payload)
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      send({ type: 'error', message: describeError(upstream.status, text), raw: text.slice(0, 600) })
      res.write('data: [DONE]\n\n')
      return res.end()
    }

    send({ type: 'start', model: payload.model })

    const reader = upstream.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      // 最后一段可能是半行，留到下一轮
      buf = lines.pop() || ''
      for (const line of lines) {
        const s = line.trim()
        if (!s || !s.startsWith('data:')) continue
        const chunk = s.slice(5).trim()
        if (chunk === '[DONE]') continue
        try {
          const obj = JSON.parse(chunk)
          const delta = obj?.choices?.[0]?.delta?.content
          if (delta) {
            full += delta
            send({ type: 'delta', text: delta })
          }
          if (obj?.usage) usage = obj.usage
        } catch (e) {
          /* 心跳或非标准帧，跳过 */
        }
      }
    }

    send({ type: 'done', text: full, usage, latency: Date.now() - started })
    res.write('data: [DONE]\n\n')
    res.end()
  } catch (e) {
    const msg = e.name === 'AbortError'
      ? `生成超时（${Math.round((Date.now() - started) / 1000)}s），可在 /gate 调大超时`
      : `生成失败：${e.message}`
    send({ type: 'error', message: msg })
    res.write('data: [DONE]\n\n')
    res.end()
  } finally {
    clearTimeout(timer)
  }
}

// ============== 路由 ==============
/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {string} [forcedPath]
 */
export async function llmMiddleware (req, res, forcedPath) {
  let url = typeof forcedPath === 'string' ? forcedPath : (req.url || '/').split('?')[0]
  url = url.replace(/^\/api\/llm(?=\/|$)/, '') || '/'
  if (!url.startsWith('/')) url = '/' + url
  const method = (req.method || 'GET').toUpperCase()

  // 静态托管没有这一层，前端据此判断「能不能真调」
  if (method === 'GET' && url === '/ping') {
    return sendJson(res, 200, { ok: true, ready: Boolean(readConfig().apiKey) || readConfig().provider === 'ollama' })
  }

  if (method === 'GET' && (url === '/config' || url === '/')) {
    return sendJson(res, 200, publicConfig())
  }

  // 只有「写 key / 改配置」要登录；读掩码、测试、生成都免登录（key 不出服务端）
  if (method === 'POST' && url === '/config') {
    if (!isValidToken(req.headers.authorization?.replace(/^Bearer\s+/i, ''))) {
      return authFail(res)
    }
    try {
      const body = await parseBody(req)
      const cur = readConfig()
      const next = { ...cur }

      if (typeof body.provider === 'string' && body.provider) next.provider = body.provider
      if (typeof body.baseUrl === 'string') next.baseUrl = body.baseUrl.trim()
      if (typeof body.model === 'string') next.model = body.model.trim()
      if (typeof body.temperature === 'number') next.temperature = Math.min(1, Math.max(0, body.temperature))
      if (typeof body.maxTokens === 'number') next.maxTokens = Math.min(16000, Math.max(256, body.maxTokens))
      if (typeof body.timeoutMs === 'number') next.timeoutMs = Math.min(300000, Math.max(10000, body.timeoutMs))
      if (typeof body.jsonMode === 'boolean') next.jsonMode = body.jsonMode
      if (typeof body.reasoningEffort === 'string') next.reasoningEffort = body.reasoningEffort

      // 空字符串 = 不修改；传入掩码形态也视为「没改」，避免把 **** 存成 key
      if (typeof body.apiKey === 'string') {
        const k = body.apiKey.trim()
        if (k && !k.includes('****')) next.apiKey = k
      }
      if (body.clearKey === true) next.apiKey = ''

      // 换服务商但没改 baseUrl/model 时，跟上预设默认值
      if (body.provider && body.provider !== cur.provider) {
        const p = presetOf(body.provider)
        if (!body.baseUrl && p.baseUrl) next.baseUrl = p.baseUrl
        if (!body.model && p.model) next.model = p.model
      }

      next.updatedAt = new Date().toISOString()
      cache = next
      persist()
      return sendJson(res, 200, publicConfig())
    } catch (e) {
      return sendJson(res, 400, { error: 'bad request', message: e.message })
    }
  }

  if (method === 'POST' && url === '/test') return handleTest(req, res)
  if (method === 'POST' && url === '/models') return handleModels(req, res)
  if (method === 'POST' && url === '/generate') return handleGenerate(req, res)

  return sendJson(res, 404, { error: 'not found' })
}
