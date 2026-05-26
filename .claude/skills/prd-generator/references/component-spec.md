# 组件规格说明

## CSS 变量定义

```css
/* variables.css */
:root {
  /* 颜色系统 */
  --color-primary: #a40035;
  --color-primary-light: #c7214f;
  --color-primary-dark: #8a002c;

  --color-success: #67c23a;
  --color-warning: #e6a23c;
  --color-danger: #f56c6c;
  --color-info: #909399;

  --color-text-primary: #333;
  --color-text-regular: #666;
  --color-text-secondary: #999;

  --color-border: #dcdfe6;
  --color-border-light: #e4e7ed;
  --color-bg-page: #f5f5f5;
  --color-bg-card: #fff;
  --color-bg-hover: #fafafa;

  /* 尺寸 */
  --border-radius: 8px;
  --border-radius-sm: 4px;
  --border-radius-lg: 12px;

  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12);

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 布局 */
  --aside-width: 260px;
  --header-height: 56px;
  --main-max-width: 1200px;
}

/* 暗夜模式 */
[data-theme="dark"] {
  --color-primary: #c7214f;
  --color-text-primary: #fff;
  --color-text-regular: #ccc;
  --color-text-secondary: #999;
  --color-bg-page: #1a1a1a;
  --color-bg-card: #2d2d2d;
  --color-border: #404040;
}
```

## 布局组件

### DocLayout

```html
<div class="doc-layout">
  <aside class="doc-aside"></aside>
  <main class="doc-main"></main>
</div>
```

```css
.doc-layout {
  display: flex;
  min-height: 100vh;
}

.doc-aside {
  width: var(--aside-width);
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
}

.doc-main {
  flex: 1;
  margin-left: var(--aside-width);
  display: flex;
  flex-direction: column;
}
```

### DocHeader

```html
<header class="doc-header">
  <div class="doc-breadcrumb">首页 / 模块名 / 页面</div>
  <div class="doc-header-actions">
    <button class="doc-btn doc-btn-ghost" id="theme-toggle">🌙</button>
  </div>
</header>
```

## 文档组件

### DocCallout

```html
<div class="doc-callout doc-callout-info">
  <strong>💡 提示</strong>
  <p>这是提示内容</p>
</div>

<div class="doc-callout doc-callout-success">
  <strong>✅ 成功</strong>
  <p>成功信息</p>
</div>

<div class="doc-callout doc-callout-warning">
  <strong>⚠️ 警告</strong>
  <p>警告信息</p>
</div>

<div class="doc-callout doc-callout-danger">
  <strong>❌ 错误</strong>
  <p>错误信息</p>
</div>
```

```css
.doc-callout {
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  border-left: 4px solid;
  margin: var(--spacing-md) 0;
}

.doc-callout-info {
  background: #ecf5ff;
  border-color: #409eff;
}

.doc-callout-success {
  background: #f0f9eb;
  border-color: #67c23a;
}

.doc-callout-warning {
  background: #fdf6ec;
  border-color: #e6a23c;
}

.doc-callout-danger {
  background: #fef0f0;
  border-color: #f56c6c;
}
```

### DocCard

```html
<div class="doc-card">
  <div class="doc-card-icon">🏦</div>
  <div class="doc-card-title">标题</div>
  <div class="doc-card-desc">描述文字</div>
  <div class="doc-card-arrow">查看详情 →</div>
</div>
```

```css
.doc-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.doc-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow);
}

.doc-card-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-md);
}

.doc-card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.doc-card-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.doc-card-arrow {
  font-size: 14px;
  color: var(--color-primary);
}
```

### DocTable

```html
<table class="doc-table">
  <thead>
    <tr>
      <th>字段</th>
      <th>类型</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>name</td>
      <td>string</td>
      <td>名称</td>
    </tr>
  </tbody>
</table>
```

```css
.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.doc-table th,
.doc-table td {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
}

.doc-table th {
  background: var(--color-bg-page);
  font-weight: 600;
  color: var(--color-text-primary);
}

.doc-table tbody tr:nth-child(even) {
  background: var(--color-bg-hover);
}

.doc-table tbody tr:hover {
  background: #f5f5f5;
}
```

### DocTag

```html
<span class="doc-tag">标签一</span>
<span class="doc-tag doc-tag-primary">主要标签</span>
<span class="doc-tag doc-tag-success">成功</span>
<span class="doc-tag doc-tag-warning">警告</span>
<span class="doc-tag doc-tag-danger">危险</span>
```

```css
.doc-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  font-size: 12px;
  background: #f0f0f0;
  color: var(--color-text-regular);
}

.doc-tag-primary { background: #fff7f7; color: var(--color-primary); }
.doc-tag-success { background: #f0f9eb; color: var(--color-success); }
.doc-tag-warning { background: #fdf6ec; color: var(--color-warning); }
.doc-tag-danger { background: #fef0f0; color: var(--color-danger); }
```

### DocTabs

```html
<div class="doc-tabs">
  <div class="doc-tab-list">
    <button class="doc-tab" :class="{ active: activeTab === 1 }" @click="activeTab = 1">
      Tab 1
    </button>
    <button class="doc-tab" :class="{ active: activeTab === 2 }" @click="activeTab = 2">
      Tab 2
    </button>
  </div>
  <div class="doc-tab-content">
    <div v-show="activeTab === 1">内容 1</div>
    <div v-show="activeTab === 2">内容 2</div>
  </div>
</div>
```

### DocFlow 流程图组件

流程图使用 SVG 绘制，基本图形：

```javascript
// flow.js
const FlowRenderer = {
  // 绘制矩形节点
  drawRect(x, y, w, h, text, options = {}) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', x)
    rect.setAttribute('y', y)
    rect.setAttribute('width', w)
    rect.setAttribute('height', h)
    rect.setAttribute('rx', 8)
    rect.setAttribute('fill', options.fill || '#fff')
    rect.setAttribute('stroke', options.stroke || '#a40035')
    rect.setAttribute('stroke-width', 2)

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    textEl.setAttribute('x', x + w / 2)
    textEl.setAttribute('y', y + h / 2 + 5)
    textEl.setAttribute('text-anchor', 'middle')
    textEl.setAttribute('fill', '#333')
    textEl.textContent = text

    return { rect, text: textEl }
  },

  // 绘制菱形（判断节点）
  drawDiamond(x, y, w, h, text) {
    const points = `${x + w/2},${y} ${x + w},${y + h/2} ${x + w/2},${y + h} ${x},${y + h/2}`
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    polygon.setAttribute('points', points)
    polygon.setAttribute('fill', '#fff7f7')
    polygon.setAttribute('stroke', '#a40035')
    polygon.setAttribute('stroke-width', 2)

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    textEl.setAttribute('x', x + w / 2)
    textEl.setAttribute('y', y + h / 2 + 5)
    textEl.setAttribute('text-anchor', 'middle')
    textEl.setAttribute('fill', '#a40035')
    textEl.textContent = text

    return { polygon, text: textEl }
  },

  // 绘制连接线
  drawLine(x1, y1, x2, y2, text = '') {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x1)
    line.setAttribute('y1', y1)
    line.setAttribute('x2', x2)
    line.setAttribute('y2', y2)
    line.setAttribute('stroke', '#999')
    line.setAttribute('stroke-width', 2)

    if (text) {
      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      textEl.setAttribute('x', (x1 + x2) / 2)
      textEl.setAttribute('y', (y1 + y2) / 2 - 5)
      textEl.setAttribute('text-anchor', 'middle')
      textEl.setAttribute('fill', '#999')
      textEl.setAttribute('font-size', 12)
      textEl.textContent = text
      return { line, text: textEl }
    }
    return { line }
  },

  // 绘制箭头
  drawArrow(x1, y1, x2, y2) {
    // 返回带箭头的线
  }
}
```

### DocSimulator 模拟器组件

```html
<div class="doc-simulator" id="simulator">
  <div class="doc-simulator-title">🧮 计算模拟器</div>

  <div class="doc-simulator-inputs">
    <div class="doc-input-group">
      <label>输入字段1</label>
      <input type="number" v-model="form.field1">
      <span>元</span>
    </div>
  </div>

  <div class="doc-simulator-result">
    <div class="doc-result-box">
      <div class="doc-result-item">
        <span class="doc-result-label">计算结果</span>
        <span class="doc-result-value">{{ result }}</span>
      </div>
    </div>
  </div>
</div>
```

```css
.doc-simulator {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
}

.doc-simulator-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.doc-simulator-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.doc-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.doc-input-group label {
  min-width: 80px;
  color: var(--color-text-secondary);
}

.doc-input-group input {
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
}

.doc-result-box {
  background: #fff7f7;
  border: 1px solid var(--color-primary);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
}

.doc-result-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
}

.doc-result-value {
  font-weight: 600;
  color: var(--color-primary);
}
```

## app.js 主应用逻辑

```javascript
// app.js - 完全接管侧边栏渲染
const DocApp = {
  config: {
    themeKey: 'doc-theme',
    defaultTheme: 'light'
  },

  init() {
    this.initTheme()
    this.renderSidebar()      // 完全接管 <aside>
    this.bindNavToggle()
    this.bindMobileToggle()
    this.highlightActive()    // 根据 URL 自动展开当前分组
  },

  initTheme() {
    const savedTheme = localStorage.getItem(this.config.themeKey) || this.config.defaultTheme
    document.documentElement.setAttribute('data-theme', savedTheme)

    const btn = document.getElementById('theme-toggle')
    if (btn) {
      btn.textContent = savedTheme === 'dark' ? '☀️' : '🌙'
      btn.addEventListener('click', () => this.toggleTheme())
    }
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem(this.config.themeKey, next)
    const btn = document.getElementById('theme-toggle')
    if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙'
  },

  // 完全接管侧边栏渲染
  renderSidebar() {
    const aside = document.querySelector('.doc-aside')
    if (!aside) return

    aside.innerHTML = `
      <div class="doc-aside-header">
        <span class="doc-logo">📋</span>
        <span class="doc-title">文档中心</span>
      </div>
      <nav class="doc-nav">
        ${this.renderMenuItems(this.getMenuData())}
      </nav>
    `
  },

  // 菜单配置（唯一数据源）
  getMenuData() {
    return [
      { title: '🏠 首页', path: '/docs-h5/index.html' },
      {
        title: '🧮 依赖计算策略',
        children: [
          { title: '📖 总览', path: '/docs-h5/docs/依赖计算策略/index.html' },
          { title: '场景一：保底获豆', path: '/docs-h5/docs/依赖计算策略/scene-guarantee.html' },
          { title: '场景二：个税计算', path: '/docs-h5/docs/依赖计算策略/scene-tax.html' },
          { title: '场景三：负工资抵扣', path: '/docs-h5/docs/依赖计算策略/scene-deduction.html' }
        ]
      },
      // 更多模块...
    ]
  },

  renderMenuItems(items) {
    return items.map(item => {
      if (item.children) {
        return `
          <div class="doc-nav-group collapsed">
            <div class="doc-nav-group-title collapsed">
              <span class="toggle-icon">▶</span>
              ${item.title}
            </div>
            <div class="doc-nav-group-items" style="max-height: 0; opacity: 0;">
              ${item.children.map(child => `
                <a href="${child.path}" class="doc-nav-item">${child.title}</a>
              `).join('')}
            </div>
          </div>
        `
      }
      return `<a href="${item.path}" class="doc-nav-item">${item.title}</a>`
    }).join('')
  },

  // 绑定分组折叠
  bindNavToggle() {
    document.querySelectorAll('.doc-nav-group-title').forEach(title => {
      title.addEventListener('click', (e) => {
        e.stopPropagation()
        const group = title.closest('.doc-nav-group')
        const items = group.querySelector('.doc-nav-group-items')
        const isCollapsed = group.classList.contains('collapsed')

        if (isCollapsed) {
          items.style.maxHeight = items.scrollHeight + 'px'
          items.style.opacity = '1'
          title.classList.remove('collapsed')
          group.classList.remove('collapsed')
        } else {
          items.style.maxHeight = ''
          items.style.opacity = ''
          title.classList.add('collapsed')
          group.classList.add('collapsed')
        }
      })
    })

    document.querySelectorAll('.doc-nav-item').forEach(item => {
      item.addEventListener('click', (e) => e.stopPropagation())
    })
  },

  // 根据 URL 自动高亮并展开
  highlightActive() {
    const currentPath = decodeURIComponent(window.location.pathname)

    document.querySelectorAll('.doc-nav-item').forEach(item => {
      const itemPath = item.getAttribute('href')
      const normalizedItemPath = '/' + itemPath.replace(/^\//, '')
      const isActive = currentPath === normalizedItemPath ||
                       currentPath.endsWith(itemPath) ||
                       normalizedItemPath.endsWith(currentPath)

      if (isActive) {
        item.classList.add('active')
        const group = item.closest('.doc-nav-group')
        if (group && group.classList.contains('collapsed')) {
          const title = group.querySelector('.doc-nav-group-title')
          const items = group.querySelector('.doc-nav-group-items')
          title.classList.remove('collapsed')
          group.classList.remove('collapsed')
          items.style.maxHeight = items.scrollHeight + 'px'
          items.style.opacity = '1'
        }
      }
    })
  }
}

document.addEventListener('DOMContentLoaded', () => DocApp.init())
```

## simulator.js 模拟器助手

```javascript
// simulator.js
function createSimulator(selector, options) {
  const container = document.querySelector(selector)
  if (!container) return

  Vue.createApp({
    data() {
      return options.data()
    },
    methods: {
      ...options.methods
    },
    mounted() {
      if (options.mounted) options.mounted()
    },
    template: container.innerHTML
  }).mount(selector)
}
```