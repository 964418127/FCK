# 文档模板参考

本文档定义了生成 PRD 文档的标准模板，确保所有生成的文档具有一致的样式和交互体验。

---

## 📍 文档生成位置

**重要**：所有生成的文档都放在 `public/docs-h5/docs/[模块名]/` 目录下：

```
public/docs-h5/
├── index.html              ← 文档中心首页
├── md-viewer.html          ← MD 预览页
├── styles/                 ← CSS 公共文件（绝对路径 /docs-h5/styles/）
├── components/             ← JS 公共文件（绝对路径 /docs-h5/components/）
└── docs/                  ← 所有模块文档
    └── [模块名]/           ← 模块文件夹（中文命名）
        ├── index.html      ← 模块总览页
        ├── scene-a.html    ← 场景页A
        ├── scene-b.html    ← 场景页B
        ├── scene-a.md      ← 场景页 MD 版
        └── scene-b.md      ← 场景页 MD 版
```

## 📂 通用文件引用路径

所有文档使用**绝对路径**引用公共文件，路径统一以 `/docs-h5/` 开头：

| 文件类型 | 引用路径 |
|---------|---------|
| CSS 文件 | `/docs-h5/styles/variables.css?v=1.0.1` |
| CSS 文件 | `/docs-h5/styles/base.css?v=1.0.1` |
| CSS 文件 | `/docs-h5/styles/layout.css?v=1.0.1` |
| CSS 文件 | `/docs-h5/styles/components.css?v=1.0.1` |
| JS 文件 | `/docs-h5/components/app.js?v=1.0.6` |
| MD 预览 | `/docs-h5/md-viewer.html?path=/docs-h5/docs/[模块名]/[页面].md` |
| 首页链接 | `/docs-h5/index.html` |

---

## 一、完整模块总览页模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>模块名称 - PRD</title>
  <link rel="stylesheet" href="/docs-h5/styles/variables.css?v=1.0.1">
  <link rel="stylesheet" href="/docs-h5/styles/base.css?v=1.0.1">
  <link rel="stylesheet" href="/docs-h5/styles/layout.css?v=1.0.1">
  <link rel="stylesheet" href="/docs-h5/styles/components.css?v=1.0.1">
</head>
<body>
  <div class="doc-layout">
    <aside class="doc-aside"></aside>

    <main class="doc-main">
      <!-- 顶部导航栏 -->
      <header class="doc-header">
        <div class="doc-breadcrumb">
          <a href="/docs-h5/index.html">首页</a>
          <span>/</span>
          <span>模块名称</span>
        </div>
        <div class="doc-header-actions">
          <a href="/docs-h5/md-viewer.html?path=/docs-h5/docs/模块名/index.md" class="doc-btn doc-btn-ghost">📄</a>
          <button class="doc-btn doc-btn-ghost" id="theme-toggle">🌙</button>
        </div>
      </header>

      <!-- 主内容区 -->
      <div class="doc-content">

        <!-- ========== 页面头部 ========== -->
        <div class="doc-page-header">
          <div class="doc-version">
            <span class="doc-version-tag">v1.0</span>
            <span class="doc-version-date">2026-05-19</span>
          </div>
          <h1 class="doc-page-title">🧮 模块名称</h1>
          <p class="doc-page-desc">模块一句话描述，说明核心功能和业务价值</p>
        </div>

        <!-- ========== 一、版本信息 ========== -->
        <section class="doc-section">
          <h2 class="doc-section-title">一 版本信息</h2>
          <div class="doc-section-content">
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 150px;">项目</th>
                  <th>内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>当前版本号</strong></td>
                  <td>v1.0</td>
                </tr>
                <tr>
                  <td><strong>创建日期</strong></td>
                  <td>2026-05-19</td>
                </tr>
                <tr>
                  <td><strong>负责人</strong></td>
                  <td>姓名</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ========== 二、变更日志 ========== -->
        <section class="doc-section">
          <h2 class="doc-section-title">二 变更日志</h2>
          <div class="doc-section-content">
            <div class="doc-callout doc-callout-info">
              <div class="doc-callout-title">💡 说明</div>
              <p>重点包含创建文档、文档编辑留痕、需求评审修改或开发过程中发现的需要修改设计的记录。</p>
            </div>
            <table class="doc-table" style="margin-top: var(--spacing-lg);">
              <thead>
                <tr>
                  <th style="width: 120px;">时间</th>
                  <th style="width: 80px;">版本号</th>
                  <th style="width: 80px;">变更人</th>
                  <th style="width: 100px;">变更标记</th>
                  <th>主要变更内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2026-05-19</td>
                  <td>v1.0</td>
                  <td>姓名</td>
                  <td><span class="doc-tag doc-tag-success">创建</span></td>
                  <td>
                    <ul style="margin: 0; padding-left: 16px;">
                      <li>初始版本发布</li>
                      <li>功能点一</li>
                      <li>功能点二</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ========== 三、核心概念 ========== -->
        <section class="doc-section">
          <h2 class="doc-section-title">三 核心概念</h2>
          <div class="doc-section-content">
            <div class="doc-callout doc-callout-info">
              <div class="doc-callout-title">💡 核心概念</div>
              <p>简要说明模块要解决的核心问题和业务价值，让读者快速理解模块定位。</p>
            </div>
            <div class="doc-config-grid" style="margin-top: var(--spacing-lg);">
              <div class="doc-config-item">
                <div class="doc-config-label">🎯 解决什么问题</div>
                <div class="doc-config-value">具体描述业务问题</div>
              </div>
              <div class="doc-config-item">
                <div class="doc-config-label">👤 谁来使用</div>
                <div class="doc-config-value">使用角色描述</div>
              </div>
              <div class="doc-config-item">
                <div class="doc-config-label">📋 配置什么内容</div>
                <div class="doc-config-value">配置内容概述</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ========== 四、业务场景 ========== -->
        <section class="doc-section">
          <h2 class="doc-section-title">📚 业务场景</h2>
          <div class="doc-section-content">
            <div class="doc-cards">
              <a href="/docs-h5/docs/模块名/scene-guarantee.html" class="doc-card doc-card-link">
                <div class="doc-card-icon">🏦</div>
                <div class="doc-card-title">场景一：业务场景A</div>
                <div class="doc-card-desc">场景A一句话描述，说明解决什么业务问题</div>
                <div class="doc-card-meta">
                  <span class="doc-tag doc-tag-success">角色标签</span>
                  <span class="doc-tag doc-tag-info">特性标签</span>
                </div>
                <div class="doc-card-arrow">查看详情 →</div>
              </a>

              <a href="/docs-h5/docs/模块名/scene-tax.html" class="doc-card doc-card-link">
                <div class="doc-card-icon">💰</div>
                <div class="doc-card-title">场景二：业务场景B</div>
                <div class="doc-card-desc">场景B一句话描述，说明解决什么业务问题</div>
                <div class="doc-card-meta">
                  <span class="doc-tag doc-tag-warning">角色标签</span>
                  <span class="doc-tag doc-tag-primary">特性标签</span>
                </div>
                <div class="doc-card-arrow">查看详情 →</div>
              </a>
            </div>
          </div>
        </section>

        <!-- ========== 五、功能说明 ========== -->
        <section class="doc-section">
          <h2 class="doc-section-title">五 功能说明</h2>
          <div class="doc-section-content">
            <div class="doc-tabs">
              <div class="doc-tab-list">
                <button class="doc-tab active" onclick="showTab(this, 'tab-list')">列表页</button>
                <button class="doc-tab" onclick="showTab(this, 'tab-form')">表单页</button>
                <button class="doc-tab" onclick="showTab(this, 'tab-detail')">详情页</button>
              </div>

              <div class="doc-tab-content active" id="tab-list">
                <h3 style="font-size: 16px; margin: var(--spacing-lg) 0 var(--spacing-md);">列表页面功能</h3>
                <table class="doc-table">
                  <thead>
                    <tr>
                      <th style="width: 150px;">功能区域</th>
                      <th>功能说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>搜索筛选</strong></td>
                      <td>支持按关键字搜索，快速定位目标数据</td>
                    </tr>
                    <tr>
                      <td><strong>数据列表</strong></td>
                      <td>展示数据列表，支持分页浏览</td>
                    </tr>
                    <tr>
                      <td><strong>新增</strong></td>
                      <td>点击「新增」按钮，进入新增页面</td>
                    </tr>
                    <tr>
                      <td><strong>编辑</strong></td>
                      <td>点击操作栏的「编辑」按钮，进入编辑页面</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="doc-tab-content" id="tab-form">
                <h3 style="font-size: 16px; margin: var(--spacing-lg) 0 var(--spacing-md);">表单字段</h3>
                <table class="doc-table">
                  <thead>
                    <tr>
                      <th style="width: 150px;">字段</th>
                      <th>说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>名称</strong></td>
                      <td>必填，输入名称，限制50字以内</td>
                    </tr>
                    <tr>
                      <td><strong>类型</strong></td>
                      <td>必填，下拉选择类型A/B/C</td>
                    </tr>
                    <tr>
                      <td><strong>有效期</strong></td>
                      <td>必填，选择开始日期和结束日期</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="doc-tab-content" id="tab-detail">
                <div class="doc-callout doc-callout-info">
                  <div class="doc-callout-title">💡 功能入口</div>
                  <p>进入【菜单】→【功能名称】，查看详情。</p>
                </div>
                <h3 style="font-size: 16px; margin: var(--spacing-lg) 0 var(--spacing-md);">详情信息</h3>
                <table class="doc-table">
                  <thead>
                    <tr>
                      <th>字段</th>
                      <th>说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>基本信息</strong></td>
                      <td>显示名称、类型、状态、创建时间等</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- ========== 六、操作按钮 ========== -->
        <section class="doc-section">
          <h2 class="doc-section-title">六 操作按钮</h2>
          <div class="doc-section-content">
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 120px;">按钮</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>查询</strong></td>
                  <td>根据筛选条件搜索数据</td>
                </tr>
                <tr>
                  <td><strong>重置</strong></td>
                  <td>清空所有筛选条件</td>
                </tr>
                <tr>
                  <td><strong>导出</strong></td>
                  <td>导出当前筛选条件下的所有数据，格式为 Excel</td>
                </tr>
                <tr>
                  <td><strong>保存</strong></td>
                  <td>校验必填项，保存表单数据</td>
                </tr>
                <tr>
                  <td><strong>取消</strong></td>
                  <td>放弃当前操作，返回列表页</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>

      <!-- 底部 -->
      <footer class="doc-footer">
        <span id="doc-footer-text"></span>
        <span> | </span>
        <span>最后更新：2026-MM-DD</span>
      </footer>
    </main>
  </div>

  <script src="/docs-h5/components/app.js?v=1.0.6"></script>
  <script>
    function showTab(btn, tabId) {
      document.querySelectorAll('.doc-tab').forEach(t => t.classList.remove('active'))
      btn.classList.add('active')
      document.querySelectorAll('.doc-tab-content').forEach(c => c.classList.remove('active'))
      document.getElementById(tabId).classList.add('active')
    }
    document.getElementById('doc-footer-text').textContent = document.title.replace(' - PRD', '');
  </script>
</body>
</html>
```

---

## 二、完整场景详情页模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>场景一 - 模块名称 - PRD</title>
  <link rel="stylesheet" href="/docs-h5/styles/variables.css?v=1.0.1">
  <link rel="stylesheet" href="/docs-h5/styles/base.css?v=1.0.1">
  <link rel="stylesheet" href="/docs-h5/styles/layout.css?v=1.0.1">
  <link rel="stylesheet" href="/docs-h5/styles/components.css?v=1.0.1">
</head>
<body>
  <div class="doc-layout">
    <aside class="doc-aside"></aside>

    <main class="doc-main">
      <!-- 顶部导航栏 -->
      <header class="doc-header">
        <div class="doc-breadcrumb">
          <a href="/docs-h5/index.html">首页</a>
          <span>/</span>
          <a href="/docs-h5/docs/模块名/index.html">模块名称</a>
          <span>/</span>
          <span>场景一</span>
        </div>
        <div class="doc-header-actions">
          <a href="/docs-h5/md-viewer.html?path=/docs-h5/docs/模块名/scene-guarantee.md" class="doc-btn doc-btn-ghost">📄</a>
          <button class="doc-btn doc-btn-ghost" id="theme-toggle">🌙</button>
        </div>
      </header>

      <!-- 主内容区 -->
      <div class="doc-content">

        <!-- ========== 页面头部 ========== -->
        <div class="doc-page-header">
          <div class="doc-version">
            <span class="doc-version-tag">场景一</span>
            <span class="doc-version-date">场景副标题/适用条件</span>
          </div>
          <h1 class="doc-page-title">🏦 场景标题</h1>
          <p class="doc-page-desc">场景一句话描述，说明解决什么业务问题</p>
        </div>

        <!-- ========== 一、业务描述 ========== -->
        <section class="doc-section">
          <h2 class="doc-section-title">一 业务描述</h2>
          <div class="doc-section-content">
            <div class="doc-callout doc-callout-info">
              <div class="doc-callout-title">💡 业务背景</div>
              <p>详细描述业务背景和业务规则，让读者理解为什么要这个功能。</p>
            </div>
            <div class="doc-config-grid" style="margin-top: var(--spacing-lg);">
              <div class="doc-config-item">
                <div class="doc-config-label">适用对象</div>
                <div class="doc-config-value">描述适用的人群或条件</div>
              </div>
              <div class="doc-config-item">
                <div class="doc-config-label">发放形式</div>
                <div class="doc-config-value">描述发放形式</div>
              </div>
              <div class="doc-config-item">
                <div class="doc-config-label">计算周期</div>
                <div class="doc-config-value">描述计算周期</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ========== 二、业务流程 ========== -->
        <section class="doc-section">
          <h2 class="doc-section-title">二 业务流程</h2>
          <div class="doc-section-content">
            <div class="doc-callout doc-callout-success">
              <div class="doc-callout-title">✅ 适用条件</div>
              <p>满足以下条件时触发此场景：</p>
              <ul style="margin: var(--spacing-sm) 0 0 var(--spacing-xl);">
                <li>条件一</li>
                <li>条件二</li>
              </ul>
            </div>
            <div class="doc-flow" style="margin-top: var(--spacing-lg);">
              <svg viewBox="0 0 500 300" width="500" height="300">
                <!-- 示例：输入节点 -->
                <rect x="30" y="120" width="100" height="50" rx="8" fill="#fff" stroke="#a40035" stroke-width="2"/>
                <text x="80" y="150" text-anchor="middle" fill="#333" font-size="13">输入A</text>
                <!-- 箭头 -->
                <line x1="130" y1="145" x2="170" y2="145" stroke="#999" stroke-width="2" marker-end="url(#arrow)"/>
                <!-- 判断节点 -->
                <rect x="170" y="105" width="100" height="80" rx="8" fill="#fff7f7" stroke="#a40035" stroke-width="2"/>
                <text x="220" y="145" text-anchor="middle" fill="#a40035" font-size="13">条件判断</text>
                <!-- 箭头 -->
                <line x1="270" y1="145" x2="310" y2="145" stroke="#999" stroke-width="2" marker-end="url(#arrow)"/>
                <!-- 输出节点 -->
                <rect x="310" y="120" width="100" height="50" rx="8" fill="#f0f9eb" stroke="#67c23a" stroke-width="2"/>
                <text x="360" y="150" text-anchor="middle" fill="#333" font-size="13">结果</text>
                <!-- 箭头定义 -->
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#999"/>
                  </marker>
                </defs>
              </svg>
            </div>
            <ol style="margin: var(--spacing-lg) 0; padding-left: var(--spacing-xl); line-height: 1.8;">
              <li style="margin-bottom: var(--spacing-sm);">步骤一：描述</li>
              <li style="margin-bottom: var(--spacing-sm);">步骤二：描述</li>
              <li>步骤三：描述</li>
            </ol>
          </div>
        </section>

        <!-- ========== 三、配置要点 ========== -->
        <section class="doc-section">
          <h2 class="doc-section-title">三 配置要点</h2>
          <div class="doc-section-content">
            <div class="doc-config-grid">
              <div class="doc-config-item">
                <div class="doc-config-label">依赖项</div>
                <div class="doc-config-tags">
                  <span class="doc-tag doc-tag-primary">依赖项A</span>
                  <span class="doc-tag doc-tag-primary">依赖项B</span>
                </div>
              </div>
              <div class="doc-config-item">
                <div class="doc-config-label">计算频率</div>
                <div class="doc-config-value">月（自然月）当月 M1日</div>
              </div>
              <div class="doc-config-item">
                <div class="doc-config-label">结果嵌入</div>
                <div class="doc-config-value">工资条 → 分组</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ========== 四、计算逻辑 ========== -->
        <section class="doc-section">
          <h2 class="doc-section-title">四 计算逻辑</h2>
          <div class="doc-section-content">
            <div class="doc-formula">
              <pre><code>如果 月度收入 < 最低工资标准:
    保底获豆 = 最低工资标准 - 月度收入
否则:
    保底获豆 = 0</code></pre>
            </div>
          </div>
        </section>

        <!-- ========== 五、模拟器 ========== -->
        <section class="doc-section">
          <h2 class="doc-section-title">🧮 模拟器</h2>
          <div class="doc-section-content">
            <div class="doc-simulator" id="simulator">
              <div class="doc-simulator-title">参数输入</div>
              <div class="doc-simulator-inputs">
                <div class="doc-input-group">
                  <label>参数A</label>
                  <input type="number" v-model="form.paramA" @input="calculate" placeholder="请输入">
                  <span>元</span>
                </div>
                <div class="doc-input-group">
                  <label>参数B</label>
                  <input type="number" v-model="form.paramB" @input="calculate" placeholder="请输入">
                  <span>%</span>
                </div>
              </div>
              <div class="doc-simulator-result">
                <div class="doc-result-label">计算结果</div>
                <div class="doc-result-box">
                  <div class="doc-result-item">
                    <span class="doc-result-label">结果A</span>
                    <span class="doc-result-value">{{ result.valueA }}</span>
                  </div>
                  <div class="doc-result-item">
                    <span class="doc-result-label">结果B</span>
                    <span class="doc-result-value">{{ result.valueB }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <!-- 底部 -->
      <footer class="doc-footer">
        <span id="doc-footer-text"></span>
        <span> | </span>
        <span>最后更新：2026-MM-DD</span>
      </footer>
    </main>
  </div>

  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script src="/docs-h5/components/app.js?v=1.0.6"></script>
  <script>
    function showTab(btn, tabId) {
      document.querySelectorAll('.doc-tab').forEach(t => t.classList.remove('active'))
      btn.classList.add('active')
      document.querySelectorAll('.doc-tab-content').forEach(c => c.classList.remove('active'))
      document.getElementById(tabId).classList.add('active')
    }
    document.getElementById('doc-footer-text').textContent = document.title.replace(' - PRD', '');

    // 模拟器 Vue 实例
    const simulator = {
      data() {
        return {
          form: { paramA: 0, paramB: 0 },
          result: { valueA: 0, valueB: 0 }
        }
      },
      methods: {
        calculate() {
          this.result.valueA = this.form.paramA * 1
          this.result.valueB = this.form.paramB * 0.01 * this.form.paramA
        }
      }
    }
    Vue.createApp(simulator).mount('#simulator')
  </script>
</body>
</html>
```

---

## 三、标签类型说明

| 类型 | 类名 | 用途 |
|------|------|------|
| 默认灰 | `doc-tag` | 普通标签 |
| 主色调 | `doc-tag-primary` | 主要标签、重点 |
| 成功绿 | `doc-tag-success` | 成功、新建、全职 |
| 警告橙 | `doc-tag-warning` | 警告、兼职 |
| 危险红 | `doc-tag-danger` | 危险、负数 |
| 信息灰蓝 | `doc-tag-info` | 信息、中性 |

**使用示例**：
```html
<span class="doc-tag">默认</span>
<span class="doc-tag doc-tag-primary">主要</span>
<span class="doc-tag doc-tag-success">成功</span>
<span class="doc-tag doc-tag-warning">警告</span>
<span class="doc-tag doc-tag-danger">危险</span>
<span class="doc-tag doc-tag-info">信息</span>
```

---

## 四、提示框类型说明

| 类型 | 类名 | 用途 |
|------|------|------|
| 信息蓝 | `doc-callout-info` | 说明、提示、背景介绍 |
| 成功绿 | `doc-callout-success` | 成功场景、适用条件 |
| 警告橙 | `doc-callout-warning` | 注意事项、重要提示 |
| 危险红 | `doc-callout-danger` | 错误、危险操作 |

**使用示例**：
```html
<div class="doc-callout doc-callout-info">
  <div class="doc-callout-title">💡 说明</div>
  <p>提示内容</p>
</div>
```

---

## 五、标签页切换函数

每个包含标签页的文档都需要在 `<script>` 中定义 `showTab` 函数：

```javascript
function showTab(btn, tabId) {
  document.querySelectorAll('.doc-tab').forEach(t => t.classList.remove('active'))
  btn.classList.add('active')
  document.querySelectorAll('.doc-tab-content').forEach(c => c.classList.remove('active'))
  document.getElementById(tabId).classList.add('active')
}
```

---

## 六、场景文件命名规范

**重要**：场景文件名必须使用业务场景的英文/拼音标识，禁止使用无意义编号。

| 场景类型 | 文件命名 |
|---------|---------|
| 保底获豆 | `scene-guarantee.html` |
| 个税计算 | `scene-tax.html` |
| 负工资抵扣 | `scene-deduction.html` |

---

## 七、MD 文件模板

每个 HTML 页面需要生成对应的 `.md` 文件，用于飞书导入。

```markdown
# [页面标题]

---

## 版本信息

| 项目 | 内容 |
|-----|------|
| 当前版本号 | v1.0 |
| 创建日期 | YYYY-MM-DD |
| 负责人 | - |

---

## 变更日志

| 时间 | 版本号 | 变更人 | 变更标记 | 主要变更内容 |
|-----|--------|-------|---------|-------------|
| YYYY-MM-DD | v1.0 | - | 创建 | 初始版本 |

---

## 核心概念

[简要说明]

---

## 功能说明

### 筛选条件

| 字段 | 说明 | 控件类型 | 业务说明 |
|------|------|---------|---------|
| 字段1 | 说明 | 输入框 | 业务含义 |

### 表格列

| 列名 | 说明 | 业务说明 |
|------|------|---------|
| 列1 | 说明 | 业务含义 |

### 操作按钮

| 按钮 | 功能 | 详细说明 |
|------|------|---------|
| 查询 | 根据条件搜索 | 支持按字段A、B筛选 |
| 重置 | 清空条件 | 将所有筛选条件恢复默认值 |
| 导出 | 导出数据 | 导出当前条件下所有数据，格式为 Excel |

---

## 业务流程

[描述业务流程]

---

## 配置要点

| 配置项 | 说明 |
|--------|------|
| 依赖项 | 依赖项A、依赖项B |
| 计算频率 | 月（自然月）当月 M1日 |
| 结果嵌入 | 工资条 → 分组 |
```

---

## 八、样式规范速查

### 间距（使用 CSS 变量）
- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 16px
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px
- `--spacing-xxl`: 48px

### 字体大小
- 页面标题: 28px (`doc-page-title`)
- 章节标题: 20px (`doc-section-title`)
- 正文: 14px (默认)
- 辅助文字: 13px
- 标签: 12px

### 颜色
- 主色: `#a40035`
- 成功: `#67c23a`
- 警告: `#e6a23c`
- 危险: `#f56c6c`
- 信息: `#909399`