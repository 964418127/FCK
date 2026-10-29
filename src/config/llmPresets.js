/**
 * LLM 服务商预设 —— 服务端（scripts/llm-proxy.js）与配置页共用这一份。
 *
 * 只收「OpenAI 兼容」的端点：一个适配器覆盖全部，不做多协议分支。
 * 国内几家都提供 /v1/chat/completions 兼容层，换 baseUrl + model 即可。
 */
export const LLM_PRESETS = [
  {
    key: 'deepseek',
    label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-v4-flash',
    models: ['deepseek-v4-flash', 'deepseek-v4-pro'],
    note: 'v4 系列；旧名 deepseek-chat / reasoner 已于 2026-07-24 弃用'
  },
  {
    key: 'qwen',
    label: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    models: ['qwen-plus', 'qwen-max', 'qwen-turbo'],
    note: '阿里云百炼控制台取 key'
  },
  {
    key: 'kimi',
    label: 'Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'kimi-k2-0905-preview',
    models: ['kimi-k2-0905-preview', 'moonshot-v1-32k', 'moonshot-v1-8k'],
    note: '长文本友好'
  },
  {
    key: 'zhipu',
    label: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4.6',
    models: ['glm-5', 'glm-4.7', 'glm-4.6', 'glm-4.5', 'glm-4.5-air'],
    note: 'GLM-5 为旗舰；glm-4.6 日常够用'
  },
  {
    key: 'minimax',
    label: 'MiniMax',
    baseUrl: 'https://api.minimaxi.com/v1',
    model: 'MiniMax-M2.7',
    models: ['MiniMax-M2.7', 'MiniMax-M2.7-highspeed', 'MiniMax-M2.5', 'MiniMax-M2.1', 'MiniMax-M2', 'MiniMax-M3', 'MiniMax-M3.1-Flash'],
    note: '强制思考型模型：思考强度必须选 low 否则正文为空',
    reasoningEffort: 'low'
  },
  {
    key: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
    note: '国内访问可能不通，测试按钮会告诉你'
  },
  {
    key: 'ollama',
    label: 'Ollama 本地',
    baseUrl: 'http://localhost:11434/v1',
    model: 'qwen2.5:7b',
    models: ['qwen2.5:7b', 'llama3.1:8b', 'qwen2.5:14b'],
    note: '本机跑，不产生费用，无需 key'
  },
  {
    key: 'custom',
    label: '自定义（OpenAI 兼容）',
    baseUrl: '',
    model: '',
    models: [],
    note: '任何兼容 /v1/chat/completions 的服务'
  }
]

export const presetOf = (key) => LLM_PRESETS.find((p) => p.key === key) || LLM_PRESETS[0]

/** 服务端默认值；配置页首次打开时也用这份 */
export const LLM_DEFAULTS = {
  provider: 'deepseek',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-v4-flash',
  temperature: 0.2,
  /** 输出预算要留够：推理型模型的思考 token 也算在这里面 */
  maxTokens: 8000,
  timeoutMs: 180000,
  jsonMode: false,
  /** 'auto' = 不发该参数（普通模型）；low/medium/high = 发给推理型模型 */
  reasoningEffort: 'auto'
}
