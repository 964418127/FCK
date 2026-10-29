/**
 * 可用命令的单一数据源。
 *
 *   npm run dev      启动时打印
 *   npm run preview  启动时打印
 *   npm run static*  收尾时提示「全部命令见 npm run dev」
 *
 * 加新脚本时改这里一处，不要在各处手抄一份。
 */

export const COMMANDS = [
  {
    cmd: 'npm run dev',
    desc: '本地开发（热更新 + gate 服务端共享）',
    target: 'http://localhost:5178'
  },
  {
    cmd: 'npm run build',
    desc: '常规打包，不预渲染',
    target: 'dist/'
  },
  {
    cmd: 'npm run generate',
    desc: '预渲染文档白名单 16 页（CI/Pages 部署用）',
    target: 'dist/'
  },
  {
    cmd: 'npm run static',
    desc: '全站预渲染（135 路由全出真 HTML）',
    target: 'site/'
  },
  {
    cmd: 'npm run static:docs',
    desc: '只预渲染文档白名单，快（约 12s）',
    target: 'site/'
  },
  {
    cmd: 'npm run static:offline',
    desc: '离线包，双击 html 就能用（IIFE + hash 路由）',
    target: 'site-offline/'
  },
  {
    cmd: 'npm run static:serve',
    desc: '纯静态预览产物（clean URL，未知路径真 404）',
    target: 'http://localhost:3100'
  },
  {
    cmd: 'npm run static:open',
    desc: '构建 site/ 并起预览，一条龙',
    target: 'http://localhost:3100'
  },
  {
    cmd: 'npm run preview',
    desc: '预览 dist/ 构建产物',
    target: 'http://localhost:4173'
  }
]

// 统一前缀，flag 只写差异部分
const PARAM_PREFIX = 'npm run static -- '
export const PARAMS = [
  { flag: '--out=.tmp/x', desc: '换输出目录' },
  { flag: '--base=/FCK/', desc: '指定部署子路径（GitHub Pages）' },
  { flag: '--docs', desc: '只跑白名单（等同 static:docs）' },
  { flag: '--nav-only', desc: '只重写 pages.html 索引页' }
].map(p => ({ ...p, cmd: PARAM_PREFIX + p.flag }))

export const SHORTCUTS = [
  { cmd: '/gate', desc: '菜单门控配置（不进侧边栏，手输地址）' },
  { cmd: '/mobile-menu', desc: '移动端菜单总览' }
]

// ---------- 打印 ----------

const COLOR = process.stdout.isTTY && !process.env.NO_COLOR
const c = {
  dim: s => (COLOR ? `\x1b[2m${s}\x1b[0m` : s),
  gray: s => (COLOR ? `\x1b[90m${s}\x1b[0m` : s),
  bold: s => (COLOR ? `\x1b[1m${s}\x1b[0m` : s),
  cyan: s => (COLOR ? `\x1b[36m${s}\x1b[0m` : s),
  green: s => (COLOR ? `\x1b[32m${s}\x1b[0m` : s)
}

// 中文占两列，用 padEnd 会错位，按显示宽度补空格
const wide = /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/
const width = (s) => [...s].reduce((n, ch) => n + (wide.test(ch) ? 2 : 1), 0)
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - width(s)))
const maxW = (list) => Math.max(...list.map(width))

export function printCommandHelp ({ mode = 'dev', port, notes = [] } = {}) {
  // 端口被占用时 vite 会顺延，横幅里对应那条要跟着改
  const fixedPort = mode === 'preview' ? '4173' : '5178'
  const withPort = (t) => (port && t.includes(`localhost:${fixedPort}`)
    ? t.replace(`localhost:${fixedPort}`, `localhost:${port}`)
    : t)

  const cmdW = maxW(COMMANDS.map(x => x.cmd)) + 2
  const descW = maxW(COMMANDS.map(x => x.desc)) + 3
  const targetW = maxW(COMMANDS.map(x => withPort(x.target)))
  const paramW = maxW(PARAMS.map(x => x.cmd)) + 3
  const shortcutW = maxW(SHORTCUTS.map(x => x.cmd)) + 3

  const lineW = Math.max(
    2 + cmdW + descW + 3 + targetW,
    2 + 2 + paramW + maxW(PARAMS.map(x => x.desc)),
    2 + 2 + shortcutW + maxW(SHORTCUTS.map(x => x.desc)),
    2 + 2 + width('命令源：scripts/commands.mjs') + 3 + width('改这里即可同步本清单')
  )
  const LINE = c.dim('  ' + '─'.repeat(lineW))

  const head = mode === 'preview'
    ? c.bold('FCK · 可用命令') + c.gray('   （当前：vite preview，预览 dist/）')
    : c.bold('FCK · 可用命令') + c.gray('   （在项目根目录执行）')

  const out = ['', LINE, '  ' + head, LINE]

  for (const { cmd, desc, target } of COMMANDS) {
    out.push('  ' + c.cyan(pad(cmd, cmdW)) + pad(desc, descW) + c.gray('→  ' + withPort(target)))
  }

  out.push(LINE, '  ' + c.gray('常用参数'))
  for (const { cmd, desc } of PARAMS) {
    out.push('  ' + c.gray('· ') + c.gray(pad(cmd, paramW)) + c.gray(desc))
  }

  out.push(LINE, '  ' + c.gray('快捷入口'))
  for (const { cmd, desc } of SHORTCUTS) {
    out.push('  ' + c.gray('· ') + c.gray(pad(cmd, shortcutW)) + c.gray(desc))
  }

  if (notes.length) {
    out.push(LINE)
    for (const n of notes) out.push('  ' + c.green('✓ ') + c.gray(n))
  }

  out.push(LINE)
  out.push('  ' + c.green('命令源：scripts/commands.mjs') + c.gray('   改这里即可同步本清单'))
  out.push('')

  console.log(out.join('\n'))
}
