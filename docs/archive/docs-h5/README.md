# 文档中心说明

## 概述

文档中心用于生成面向业务方的交互式 PRD 文档，支持卡片导航、流程图、模拟器等交互元素。

## 目录结构

```
public/docs-h5/
├── index.html           # 文档库首页（自动从 <title> 读取项目名）
├── md-viewer.html       # MD 预览页
├── styles/              # CSS 公共文件
├── components/          # JS 公共文件
│   ├── app.js           # 主应用（自动从 document.title 读取项目名）
│   ├── flow.js          # 流程图绘制
│   └── simulator.js     # 模拟器助手
└── docs/                # 各模块文档（由 skill 自动生成）
    └── [模块名]/
        ├── index.html   # 模块总览页
        ├── scene-*.html # 场景页
        └── scene-*.md   # MD 版（用于飞书导入）
```

## 新项目初始化

### 1. 复制文件

从模板项目复制以下目录：
```bash
cp -r [模板项目]/public/docs-h5 [新项目]/public/
cp -r [模板项目]/.claude/skills [新项目]/.claude/
```

### 2. 修改 index.html 的标题

编辑 `public/docs-h5/index.html`，修改 `<title>` 标签：
```html
<title>你的项目名 文档中心</title>
```

### 3. 更新 settings.json 路径

编辑 `.claude/settings.json`，全局替换以下内容：

| 查找 | 替换为 |
|-----|-------|
| `/Users/mac/[原项目]/` | `/Users/mac/[新项目]/` |
| `localhost:原端口` | `localhost:新端口` （如有） |

### 4. 添加路由

编辑 `src/router/index.js`，在路由数组中添加：
```javascript
{
  path: '/docs',
  redirect: '/docs-h5/index.html'
}
```

## 生成的文档结构

skill 生成的文档会放在 `public/docs-h5/docs/[模块名]/` 下：

- `index.html` - 模块总览页
- `scene-{场景标识}.html` - 场景页
- `scene-{场景标识}.md` - MD 版（用于飞书导入）

**注意**：场景文件命名必须使用业务场景的英文/拼音标识，禁止使用无意义编号（scene-1、scene-2）。

## 访问方式

- 通过路由：`/docs` → `/docs-h5/index.html`
- 直接访问：`http://localhost:[端口]/docs-h5/index.html`

## 相关文件

- Skill 配置：`.claude/skills/prd-generator/SKILL.md`
- Skill 配置：`.claude/skills/proto-to-prd/SKILL.md`
- Skill 配置：`.claude/skills/proto-reader/SKILL.md`