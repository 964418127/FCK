---
name: prd-generator
description: 根据标准模板生成面向业务方的交互式 PRD 文档。将需求转化为结构清晰、视觉直观、可交互的 HTML 文档。
tools: Read, Glob, Grep, Write, Edit, Bash, Agent
---

# PRD Generator

将技术化的需求文档转换为面向业务方的交互式 PRD 文档。

## 工作流程

### Phase 1: 需求理解

与用户确认以下信息：

1. **模块名称** - 文档的顶层分类
2. **核心功能** - 该模块解决什么问题
3. **目标用户** - 谁会使用这个文档（业务方 / 技术人员）
4. **业务场景数量** - 需要描述几个典型场景
5. **是否需要模拟器** - 是否需要参数输入+结果展示的交互功能

### Phase 2: 内容规划

根据需求设计文档结构：

```
[项目目录]/public/docs-h5/
├── index.html                    # 文档库首页（模块入口卡片）← 首次生成时创建
├── md-viewer.html                # MD 预览页
├── styles/
│   ├── variables.css            # CSS 变量
│   ├── base.css
│   ├── layout.css
│   └── components.css
├── components/
│   ├── app.js                   # 主应用（完全接管侧边栏）
│   ├── flow.js                  # 流程图绘制
│   └── simulator.js            # 模拟器助手
└── docs/
    └── [模块名]/
        ├── index.html            # 模块总览页
        ├── scene-{场景标识}.html  # 场景页（英文/拼音命名）
        └── scene-{场景标识}.md    # 场景页 MD 版（用于飞书导入）
```

## 输入方式

### 方式一：手动输入
```
用户提供：模块名称、场景列表、功能描述
```

### 方式二：从 proto-reader 接收
```
proto-reader 输出结构化信息 → 粘贴到 prd-generator
```

输出格式：
```
模块：XXX
场景1：XXX - XXX
场景2：XXX - XXX
需要模拟器：否
```

### 方式三：联合调用（proto-to-prd）
```
用户：帮我生成 [URL] 的 PRD 文档
       ↓
proto-to-prd 自动串联 proto-reader + prd-generator
```

### Phase 3: 生成文档

按以下顺序生成：

1. **文档框架** - CSS + 布局 + 组件 JS
2. **总览页** - 模块介绍 + 场景入口卡片（header 加 MD 预览按钮）
3. **场景页** - 每个场景独立 HTML（header 加 MD 预览按钮）
4. **MD 文件** - 每个页面生成对应的 .md 文件，用于飞书导入
5. **交互组件** - 流程图、模拟器（如需要）
6. **更新首页** - 在 `/docs-h5/index.html` 中添加新模块的卡片入口
7. **更新菜单** - 在 `app.js` 的 `getMenuData()` 中添加新模块

**重要：每个 HTML 页面的 header 必须包含 MD 预览按钮**：
```html
<a href="/docs-h5/md-viewer.html?path=/docs-h5/docs/模块名/页面名.md" class="doc-btn doc-btn-ghost">📄</a>
```

## 文档结构规范

每个 PRD 文档必须包含：

| 章节 | 内容要求 |
|-----|---------|
| 版本信息 | 版本号、日期、作者、变更日志 |
| 文档说明 | 目的、目标读者、术语定义 |
| 需求背景 | 业务痛点、设计目标 |
| 需求范围 | 功能范围、适用角色、关联系统 |
| 业务场景 | 2-3 个典型场景，每个包含：业务描述、计算逻辑、配置要点 |
| 解决方案 | 产品架构、核心概念、数据对象说明 |
| 功能说明 | 页面布局、字段说明、交互细节 |
| 数据结构 | TypeScript 接口定义 |
| 验收标准 | 可检查的 Checklist |

## 视觉规范

| 项目 | 规范 |
|-----|-----|
| 主色调 | `#a40035`（品牌色） |
| 辅助色 | 灰 `#666` + 背景 `#f5f5f5` |
| 圆角 | `8px` |
| 阴影 | `0 2px 8px rgba(0,0,0,0.1)` |
| 字体 | 系统默认字体栈 |

## 可复用组件

| 组件 | 用途 | 关键实现 |
|-----|------|---------|
| DocHeader | 页面标题区 | 版本标签 + 最后更新时间 |
| DocAside | 侧边菜单 | 折叠 + 多级嵌套 |
| DocSection | 章节容器 | 展开/收起 |
| DocCard | 场景卡片 | 图标 + 标题 + 描述 + 链接 |
| DocTable | 表格 | 斑马纹 + 固定表头 |
| DocTabs | Tab 切换 | 分组展示 |
| DocFlow | 流程图 | SVG 绘制 |
| DocTree | 决策树 | 条件分支可视化 |
| DocSimulator | 模拟器 | 输入 + 实时计算 |
| DocCallout | 提示框 | info/success/warning/danger |
| DocCode | 代码块 | 语法高亮 + 复制 |
| DocBreadcrumb | 面包屑 | 路径导航 |

## 输出要求

1. **生成位置**：`public/docs-h5/` 目录下（即 `/Users/mac/[项目名]/public/docs-h5/`）
2. **文件命名**：模块文件夹使用中文命名，如 `docs/依赖计算策略/`
3. **场景文件命名**：使用业务场景的英文/拼音标识，禁止使用无意义编号
   - ❌ 错误：scene-1.html、scene-2.html
   - ✅ 正确：scene-guarantee.html、scene-tax.html
4. **资源引用**：使用绝对路径 `/docs-h5/...`，避免相对路径解析问题
5. **响应式**：支持 Pad 端查看
6. **可独立运行**：双击 HTML 即可预览

## 调用示例

```
用户：帮我生成一个「会员等级」模块的 PRD 文档

助手：
1. 确认需求细节（几个场景？需要模拟器吗？）
2. 调用 prd-generator skill 生成文档
3. 输出文档路径和主要结构说明
```

## 相关文件

- [references/doc-template.md](references/doc-template.md) - 文档模板参考
- [references/component-spec.md](references/component-spec.md) - 组件规格说明