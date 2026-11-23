/**
 * 已生成的单文档离线包清单（/docs/offline-manifest.json）。
 *
 * 清单由 `npm run static:doc -- --doc=/docs/x` 在打包结束时写入 public，随站点一起发布。
 * 目录页据此决定是否显示下载入口 —— 没打过包的文档不显示，避免出现点了 404 的死链。
 *
 * 离线包内部（file:// 打开）没有同源服务，fetch 会失败，静默返回空清单：
 * 包里本来也不需要「下载自己」，所以这个降级是期望行为。
 */
import { ref } from 'vue'

const packages = ref([])
let loading = null

const base = import.meta.env.BASE_URL || '/'
/** 清单里的路径是站点绝对路径（/docs/x/x-offline.zip），部署在子目录时要补上 base */
const withBase = (p) => `${base.replace(/\/$/, '')}/${String(p || '').replace(/^\//, '')}`

function load() {
  if (loading) return loading
  const url = `${base}docs/offline-manifest.json`
  loading = fetch(url)
    .then((r) => (r.ok ? r.json() : { packages: [] }))
    .then((data) => {
      const list = Array.isArray(data.packages) ? data.packages : []
      packages.value = list.map((p) => ({
        ...p,
        home: p.home || p.scope,
        file: withBase(p.file)
      }))
    })
    .catch(() => { packages.value = [] })
  return loading
}

/** 按文档入口 path 找包：精确匹配，或文档页在 scope 之下（/docs/x/overview 也算 /docs/x） */
export function findOfflinePackage(path) {
  if (!path) return null
  return packages.value.find((p) => p.scope === path || String(path).startsWith(p.scope + '/')) || null
}

export function useOfflinePackages() {
  load()
  return { packages, findOfflinePackage, loading: () => loading }
}
