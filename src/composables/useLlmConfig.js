/**
 * LLM 配置与调用的前端入口。
 *
 * 三条原则：
 * 1. key 只往服务端送，永不回读 —— 页面拿到的永远是 hasKey + 掩码
 * 2. 所有请求带 gate 的 Bearer token（/api/llm 复用同一份登录态）
 * 3. 接口不存在（静态包 site/、file://）时 available=false，调用方自行退化为回放
 */
import { reactive } from 'vue'
import { gateState } from './useGateConfig.js'
import { LLM_DEFAULTS, presetOf } from '../config/llmPresets.js'

const API = '/api/llm'

export const llmState = reactive({
  /** null = 还没探测；false = 没有中转（静态包），只能回放 */
  available: null,
  ready: false,
/**
 * 区分「没配 key」和「写配置被拦」：
 * 读配置已免登录（key 不出服务端），只有保存配置失败时才会置 true
 */
authRequired: false,
  config: { ...LLM_DEFAULTS, hasKey: false, keyMask: '', updatedAt: null },
  checking: false,
  testing: false,
  /** 最近一次连通性测试结果 { ok, latency, reply, message } */
  lastTest: null,
  lastError: '',
  /** 从供应商 /models 拉到的真实模型列表（比预置列表可靠） */
  models: [],
  modelsLoading: false,
  modelsMessage: ''
})

const authHeaders = () => {
  const t = gateState.token || ''
  return t ? { Authorization: `Bearer ${t}` } : {}
}

const parseJson = async (res) => {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch (e) {
    return { error: 'bad response', message: text.slice(0, 200) }
  }
}

/** 探测中转是否存在（不需要登录） */
export async function probeLlm () {
  if (llmState.available !== null) return llmState.available
  try {
    const res = await fetch(`${API}/ping`, { headers: authHeaders() })
    if (!res.ok) throw new Error(String(res.status))
    const data = await parseJson(res)
    llmState.available = Boolean(data.ok)
    llmState.ready = Boolean(data.ready)
  } catch (e) {
    llmState.available = false
    llmState.lastError = '当前环境没有 LLM 中转（静态包或离线打开），生成将走回放'
  }
  return llmState.available
}

export async function loadLlmConfig () {
  await probeLlm()
  if (!llmState.available) return llmState.config
  llmState.checking = true
  try {
    // 读配置免登录：key 永不回传，只给 hasKey + 掩码，局域网内任何设备可直接读
    const res = await fetch(`${API}/config`, { headers: authHeaders() })
    llmState.authRequired = false
    const data = await parseJson(res)
    if (res.ok) llmState.config = { ...llmState.config, ...data }
  } catch (e) {
    llmState.lastError = e.message
  } finally {
    llmState.checking = false
  }
  return llmState.config
}

export async function saveLlmConfig (patch) {
  if (!llmState.available) return { ok: false, message: '当前环境没有中转，配置无法保存' }
  try {
    const res = await fetch(`${API}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(patch)
    })
    const data = await parseJson(res)
    if (!res.ok) {
      if (res.status === 401) {
        llmState.authRequired = true
        return { ok: false, message: '修改模型配置需要先在 /gate 登录（读取不受影响）' }
      }
      return { ok: false, message: data.message || '保存失败' }
    }
    llmState.config = { ...llmState.config, ...data }
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}

export async function testLlm () {
  if (!llmState.available) return { ok: false, message: '当前环境没有中转' }
  llmState.testing = true
  llmState.lastTest = null
  try {
    const res = await fetch(`${API}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() }
    })
    const data = await parseJson(res)
    llmState.lastTest = data
    return data
  } catch (e) {
    const out = { ok: false, message: e.message }
    llmState.lastTest = out
    return out
  } finally {
    llmState.testing = false
  }
}

/**
 * 向供应商要一次真实模型列表（GET {baseUrl}/models）。
 * 厂商模型名变动频繁，这条比预置列表可靠；不支持的厂商会回 ok:false，手填即可。
 */
export async function fetchLlmModels () {
  if (!llmState.available) return { ok: false, message: '当前环境没有中转' }
  llmState.modelsLoading = true
  llmState.modelsMessage = ''
  try {
    const res = await fetch(`${API}/models`, {
      method: 'POST',
      headers: authHeaders()
    })
    const data = await parseJson(res)
    if (data.ok) {
      llmState.models = data.models || []
      llmState.modelsMessage = `拉到 ${data.count} 个模型`
    } else {
      llmState.models = []
      llmState.modelsMessage = data.message || '拉取失败，手动填模型名'
    }
    return data
  } catch (e) {
    llmState.models = []
    llmState.modelsMessage = e.message
    return { ok: false, message: e.message }
  } finally {
    llmState.modelsLoading = false
  }
}

/**
 * 流式生成。返回完整文本；出错抛异常（调用方决定是否回放）。
 * @param {{messages: Array, temperature?: number, jsonMode?: boolean, onDelta?: (t:string)=>void, onStart?: (m:any)=>void}} opts
 */
export async function generateStream (opts) {
  const { messages, temperature, jsonMode, onDelta, onStart, signal } = opts
  if (!llmState.available) throw new Error('NO_PROXY')

  const res = await fetch(`${API}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ messages, temperature, jsonMode }),
    signal
  })

  if (!res.ok) {
    const data = await parseJson(res)
    if (res.status === 401) {
      llmState.authRequired = true
      throw new Error('菜单配置登录已失效：去 /gate 重新登录后再生成')
    }
    throw new Error(data.message || `生成接口返回 ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let full = ''
  let failure = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() || ''
    for (const line of lines) {
      const s = line.trim()
      if (!s.startsWith('data:')) continue
      const chunk = s.slice(5).trim()
      if (chunk === '[DONE]') continue
      let evt
      try {
        evt = JSON.parse(chunk)
      } catch (e) {
        continue
      }
      if (evt.type === 'start') onStart?.(evt)
      else if (evt.type === 'delta') {
        full += evt.text
        onDelta?.(evt.text)
      } else if (evt.type === 'done') {
        full = evt.text || full
      } else if (evt.type === 'error') {
        failure = evt.message || '生成失败'
      }
    }
  }

  if (failure) throw new Error(failure)
  return full
}

/** 快捷：某个预设的默认值 */
export const presetDefaults = (key) => {
  const p = presetOf(key)
  return { provider: p.key, baseUrl: p.baseUrl, model: p.model }
}
