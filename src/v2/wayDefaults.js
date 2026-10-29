/**
 * 取数频率的默认值规则（流程侧）
 *
 * 两层频率别混：
 *   ① 检查方跑批节奏（catalog 的 fetch.cadenceHint）—— 归检查方，流程侧不配；
 *   ② 流程侧取数频率（way.fetch）—— 归模板节点，默认值来自被引用判定项的 defaultFetch。
 *
 * 这里只做第 ②：引用判定项时把该条的默认值带出来。用户明确改过的合法值保留，
 * 不被默认覆盖；模型漏写或写了非法值，按目录兜住。
 */

const FREQ_RE = /^(none|\d+[mhd])$/

/** 目录里没有这条（或没登记默认）时，给一个保守兜底 */
export const FALLBACK_FETCH = { freq: '1d', maxRuns: 5 }

export const isValidFreq = (f) => FREQ_RE.test(String(f || ''))

export function defaultFetchOf (checks = [], key) {
  const d = (checks || []).find((c) => c.key === key)?.defaultFetch
  return {
    freq: isValidFreq(d?.freq) ? d.freq : FALLBACK_FETCH.freq,
    maxRuns: Number(d?.maxRuns) > 0 ? Number(d.maxRuns) : FALLBACK_FETCH.maxRuns
  }
}

/** 只处理 system 路径：别的类型没有取数频率 */
export function normalizeWay (w, checks = []) {
  if (!w || w.type !== 'system') return w
  const def = defaultFetchOf(checks, w.sysKey)
  const cur = w.fetch || {}
  return {
    ...w,
    fetch: {
      ...cur,
      fetchFreq: isValidFreq(cur.fetchFreq) ? cur.fetchFreq : def.freq,
      maxRuns: Number(cur.maxRuns) > 0 ? Number(cur.maxRuns) : def.maxRuns
    }
  }
}
