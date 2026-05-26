/**
 * Doc App - Main application logic
 * 完全接管侧边栏渲染，菜单配置只在一处
 */
const DocApp = {
  config: {
    themeKey: 'doc-theme',
    defaultTheme: 'light'
  },

  /**
   * Initialize the application
   */
  init() {
    this.initTheme()
    this.renderSidebar()
    this.bindNavToggle()
    this.bindMobileToggle()
    this.highlightActive()
  },

  /**
   * Initialize theme from localStorage
   */
  initTheme() {
    const savedTheme = localStorage.getItem(this.config.themeKey) || this.config.defaultTheme
    document.documentElement.setAttribute('data-theme', savedTheme)

    const btn = document.getElementById('theme-toggle')
    if (btn) {
      btn.textContent = savedTheme === 'dark' ? '☀️' : '🌙'
      btn.addEventListener('click', () => this.toggleTheme())
    }
  },

  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'

    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem(this.config.themeKey, next)

    const btn = document.getElementById('theme-toggle')
    if (btn) {
      btn.textContent = next === 'dark' ? '☀️' : '🌙'
    }
  },

  /**
   * Get current page info from URL
   */
  getPageInfo() {
    const path = decodeURIComponent(window.location.pathname)
    const menuData = this.getMenuData()

    for (const group of menuData) {
      if (group.children) {
        for (const child of group.children) {
          const childPath = child.path
          if (path === childPath || path.endsWith(childPath)) {
            return {
              module: group.title,
              page: child.title,
              breadcrumb: [group.title, child.title]
            }
          }
        }
      }
      if (group.path && (path === group.path || path.endsWith(group.path))) {
        return {
          module: group.title,
          page: group.title,
          breadcrumb: [group.title]
        }
      }
    }

    return {
      module: '首页',
      page: '首页',
      breadcrumb: ['首页']
    }
  },

  /**
   * Render complete sidebar
   */
  renderSidebar() {
    const aside = document.querySelector('.doc-aside')
    if (!aside) return

    const pageInfo = this.getPageInfo()
    const isHome = pageInfo.page === '首页'

    aside.innerHTML = `
      <div class="doc-aside-header">
        <span class="doc-logo">📋</span>
        <span class="doc-title">${isHome ? document.title.replace(' 文档中心', '') : '文档中心'}</span>
      </div>
      <nav class="doc-nav">
        ${this.renderMenuItems(this.getMenuData())}
      </nav>
    `
  },

  /**
   * Bind navigation group toggle
   */
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
      item.addEventListener('click', (e) => {
        e.stopPropagation()
      })
    })
  },

  /**
   * Highlight active menu item based on current URL
   * Expand parent group if collapsed
   */
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
  },

  /**
   * Get menu data structure
   * 菜单配置只在一处管理，新增模块只需修改这里
   */
  getMenuData() {
    return [
      {
        title: '🏠 首页',
        path: '/docs-h5/index.html'
      },
      {
        title: '🧮 依赖计算策略',
        children: [
          { title: '📖 总览', path: '/docs-h5/docs/依赖计算策略/index.html' },
          { title: '场景一：保底获豆', path: '/docs-h5/docs/依赖计算策略/scene-guarantee.html' },
          { title: '场景二：个税计算', path: '/docs-h5/docs/依赖计算策略/scene-tax.html' },
          { title: '场景三：负工资抵扣', path: '/docs-h5/docs/依赖计算策略/scene-deduction.html' }
        ]
      },
      {
        title: '🗺️ 门店路线间隔时间库',
        children: [
          { title: '📖 总览', path: '/docs-h5/docs/门店路线间隔时间库/index.html' },
          { title: '场景一：批量更新耗时', path: '/docs-h5/docs/门店路线间隔时间库/场景-批量更新耗时.html' },
          { title: '场景二：单条路线更新', path: '/docs-h5/docs/门店路线间隔时间库/场景-单条路线更新.html' },
          { title: '场景三：自动更新', path: '/docs-h5/docs/门店路线间隔时间库/场景-自动更新.html' }
        ]
      },
      {
        title: '🏦 账户月度信息',
        children: [
          { title: '📖 总览', path: '/docs-h5/docs/账户月度信息/index.html' },
          { title: '场景一：月度账户查询', path: '/docs-h5/docs/账户月度信息/scene-query.html' },
          { title: '场景二：推拿师结算明细', path: '/docs-h5/docs/账户月度信息/scene-settlement-therapist.html' },
          { title: '场景三：客户经理结算明细', path: '/docs-h5/docs/账户月度信息/scene-settlement-account-manager.html' },
          { title: '场景四：总部岗位结算明细', path: '/docs-h5/docs/账户月度信息/scene-settlement-headquarter.html' },
          { title: '场景五：常乐豆使用明细', path: '/docs-h5/docs/账户月度信息/scene-usage.html' }
        ]
      },
      {
        title: '🛡️ 社保公积金个税',
        children: [
          { title: '📖 总览', path: '/docs-h5/社保公积金个税/index.html' },
          { title: '场景一：社保月度汇总', path: '/docs-h5/社保公积金个税/scene-security-summary.html' },
          { title: '场景二：社保月度流水', path: '/docs-h5/社保公积金个税/scene-security-record.html' },
          { title: '场景三：公积金月度汇总', path: '/docs-h5/社保公积金个税/scene-housing-fund-summary.html' },
          { title: '场景四：公积金月度流水', path: '/docs-h5/社保公积金个税/scene-housing-fund-record.html' },
          { title: '场景五：个税月度汇总', path: '/docs-h5/社保公积金个税/scene-individual-tax-summary.html' },
          { title: '场景六：个税月度流水', path: '/docs-h5/社保公积金个税/scene-individual-tax-record.html' }
        ]
      }
          ]
  },

  /**
   * Render menu items
   */
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

  /**
   * Bind mobile menu toggle
   */
  bindMobileToggle() {
    const toggle = document.getElementById('mobile-nav-toggle')
    const aside = document.querySelector('.doc-aside')

    if (toggle && aside) {
      toggle.addEventListener('click', () => {
        aside.classList.toggle('open')
      })

      document.addEventListener('click', (e) => {
        if (!aside.contains(e.target) && !toggle.contains(e.target)) {
          aside.classList.remove('open')
        }
      })
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => DocApp.init())