# 归档文档

这里放**已下线、不再被应用引用**的文档源文件，保留是为了内容还能查，不要指望它们能通过站点访问。

## docs-h5/

最早那套「文档中心」：45 个手写 HTML + 自有 `styles/` `components/app.js`，不经 Vue 构建。

- 2026-10-22 从 `public/docs-h5/` 移到此处。原先放在 `public/` 下会被 Vite 原样拷进 `dist/` 一起部署，但**全库没有任何入口链接到它**（`src/`、路由、菜单里 0 处引用），属于随产物上线的死目录。
- 现在 Vue 侧的文档中心（`src/views/docs/`，路由 `/docs/*`）是唯一在用的文档线，静态化由 `npm run static` / `npm run static:offline` 负责。
- 这些页面里的链接是绝对路径（`/docs-h5/...`），移出 `public/` 后不会再被服务；需要看内容直接本地打开 `index.html`。

要恢复成可访问：把目录移回 `public/docs-h5/` 即可（会和 `dist/` 一起发布）。
