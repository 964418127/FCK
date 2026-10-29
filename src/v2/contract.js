/**
 * 契约配置（内部文件，界面不展示）
 *
 * 契约是三个东西的共同来源：
 *   1. 提示词 —— renderSystemPrompt() 把它渲染成系统提示词给 LLM
 *   2. 校验   —— 程序按 objects / enums / invariants 检查产出是否合规
 *   3. 审阅   —— 页面按对象结构展示定义（展示的是实例，不是本文件）
 *
 * 因此改契约只改这里，不回去改提示词字符串。
 *
 * exposeToModel 决定哪些对象进入提示词：
 *   一次生成要产出「一件事」的四件东西 —— 触点、人群、子事件（含兑现路径 / 事项 / 字段）；
 *   覆盖与实例属于运行期，不交给模型表达。
 */

import { NEEDS, BASE_NEEDS } from './skeleton.js'

export const CONTRACT = {
  id: 'event-orchestration',
  version: 'v3.9',
  updatedAt: '2026-10-30',
  gist: '一件事 = 一套提示词 + 一份骨架 + 一个触点。定义期不生成树：根事件触发后，系统按这一单的人与事实生成子事件，事实取不到那一条就不存在。子事件不按人机分型：人做要说清事项与表单组件，系统做要说清判定项与取数频率。传统审批既不是节点也不是路径类型：它就是一条「已审核通过」的结论 + 人给结论，几级审核就写几条结论，前后关系由前置表达；等对方回话的结论必须写清回执字段。',

  /* ---------------- 枚举 ---------------- */

  enums: {
    verdicts: ['通过', '软性', '未通过'],
    gates: [
      { key: 'must', label: '必过', effect: '未通过 → 终止全部流程' },
      { key: 'optional', label: '可选', effect: '未取得结论 → 放行并留痕' }
    ],
    wayTypes: [
      { key: 'human', label: '人办理', effect: '某个角色去办并交东西；审核也是这一种，只是结论写成「已审核通过」' },
      { key: 'system', label: '系统判定', effect: '调用已登记的系统检查项，只出结论、不改数据' },
      { key: 'action', label: '系统执行', effect: '调用已登记的动作，真的改数据或发出东西，拿回执' },
      { key: 'external', label: '外部回执', effect: '对方的人要动手，我方只能等它回话' }
    ],
    fieldTypes: ['text', 'textarea', 'number', 'date', 'select', 'multiselect', 'person', 'file'],
    triggerTypes: [
      { key: 'business', label: '业务事件', effect: '某张单据提交后系统接住，自动触发；必须落到登记过的事件点' },
      { key: 'manual', label: '人工发起', effect: '人在指定入口点「发起」才触发；必须限定角色与入口' },
      { key: 'schedule', label: '定时', effect: '按周期巡检触发；只做提醒型，不替代业务判断' }
    ],
    needs: NEEDS.map((n) => ({ key: n.key, label: n.label, hint: n.hint })),
    needsBase: BASE_NEEDS.map((n) => n.key),
    /** 载荷用途：不是「字段重要性」，是「这个值要走到哪里去」 */
    payloadUse: [
      { key: 'intake', label: '取数入参', effect: '引擎拿它去查员工档案；不进表单' },
      { key: 'show', label: '实例回看', effect: '在实例顶部能看到，不参与流程' },
      { key: 'bind', label: '预填子事件', effect: '子事件的事项字段以它为默认值，人来确认或改' }
    ],
    /** 对岸能发的字段类型：比事项字段少 —— 单据带过来的是值，不是附件；multi = 多选（如离职原因） */
    payloadTypes: ['text', 'date', 'number', 'enum', 'multi', 'bool'],
    gapKinds: [
      { key: 'touch', label: '触点缺口' },
      { key: 'crowd', label: '人群缺口' },
      { key: 'contract', label: '契约缺口' },
      { key: 'data', label: '数据联想' }
    ],
    itemProof: ['none', 'optional', 'must']
  },

  /* ---------------- 对象 ---------------- */

  objects: [
    {
      key: 'intake',
      name: '触发前取数（引擎内置）',
      exposeToModel: false,
      purpose: '所有根事件触发时都天然执行的一层：先确认「这个人是谁」，再取这个人的逐人事实，然后才拿它去生成树。它不是链路上的一步，因此不进骨架、不在树上、没有承担者、也没有任何开关或配置项。',
      fields: [
        { key: 'ok', type: 'boolean', note: '档案取不到就不生成 —— 不知道人是谁，树没有依据' },
        { key: 'at', type: 'string', note: '取数时间；一定早于生成时间' },
        { key: 'empNo', type: 'string', note: '按工号查；没有工号就取不到档案' },
        { key: 'steps', type: 'array', note: '固定两步：employee（员工档案）+ facts（逐人事实）；每步记 query / result / ok / at，用于解释「树是拿什么长出来的」' },
        { key: 'emp', type: 'object', note: '补全后的员工：姓名 / 岗位 / 城市 / 门店 / 用工类型 / 入职日 / 合同主体' },
        { key: 'facts', type: 'object', note: '逐人事实；它是生成树的唯一差异来源' },
        { key: 'reason', type: 'string', note: '失败原因（ok = false 时给出，触发直接不成立）' }
      ]
    },
    {
      key: 'event',
      name: '根事件（一套提示词）',
      exposeToModel: false,
      purpose: '一件业务上的事。定义期只写两件事：这件事怎么触发（触点 + 适用范围）、这张单要交付什么（提示词正文 + 骨架清单）。不写树 —— 树在触发时按这一单的人与事实长出来。',
      fields: [
        { key: 'key', type: 'string', note: '系统生成短码，发布后不变' },
        { key: 'name', type: 'string', note: '业务名词（离职、调岗），不写步骤' },
        { key: 'scope', type: 'object', ref: 'scope', note: '适用范围：只用来选这套提示词，不决定树' },
        { key: 'trigger', type: 'object', ref: 'trigger', note: '触点：这张单从哪开出来' },
        { key: 'body', type: 'string', note: '提示词正文（人写）：这件事是什么 / 必须交付的结论 / 差异怎么判断 / 表单怎么给 / 不要做什么' },
        { key: 'skeleton', type: 'array', ref: 'skeleton', note: '骨架：必须交付的结论清单，是生成的下限' },
        { key: 'facts', type: 'array', ref: 'fact', note: '本事件自己声明的事实（基础表之外）：只有声明过的事实才能当 needs' },
        { key: 'versions', type: 'array', note: '版本只记提示词与骨架的变更，树不在版本里' },
        { key: 'status', type: 'enum', values: ['active', 'disabled'] }
      ]
    },
    {
      key: 'skeleton',
      name: '骨架',
      exposeToModel: true,
      purpose: '这套提示词不许漏的结论。它不是模板：没有树、没有顺序、没有实例，只有「必须交付什么」与「什么情况下才有这一条」。依赖、表单、承担者都在触发时按这一单算。',
      fields: [
        { key: 'key', type: 'string', required: true, note: '短码；生成的子事件按它回填 skeletonKey，用于校验有没有漏' },
        { key: 'goal', type: 'string', required: true, note: '一条可判定的结论；写成「审核 / 处理 / 办理」而不给达成状态即不合格' },
        { key: 'needs', type: 'enum | string[]', values: 'needs', required: true, note: '这一条成立需要的事实：只能取基础事实表 + 本事件 facts[] 里声明过的键；取不到就不长出来（不是模型裁量，是可核查的推导）' },
        { key: 'gate', type: 'enum', values: 'gates', required: true },
        { key: 'after', type: 'string[]', note: '必须等哪些骨架 key（且）；被裁掉的前置自动跳过，不悬空' },
        { key: 'afterAny', type: 'string[]', note: '或组：任一办结即可' },
        { key: 'paths', type: 'array', ref: 'way', required: true, note: '兑现路径：人给结论 / 系统判定 / 系统执行 / 外部回执' },
        { key: 'note', type: 'string', note: '给人看的一句话，不参与执行' }
      ]
    },
    {
      key: 'fact',
      name: '事实（needs 的可选值）',
      exposeToModel: true,
      purpose: '一个能被查出来、有确定口径的人事事实，骨架靠它决定某一条成立不成立。基础事实表跨事件通用；某件事专用的事实由这套提示词自己声明 —— 词表不能被一件事的口径写死，否则换一件事就会拿到不适用的事实。',
      fields: [
        { key: 'key', type: 'string', required: true, note: '短码；不能覆盖基础表里已有的键（要改基础事实就改基础表，不在事件里打补丁）' },
        { key: 'label', type: 'string', required: true, note: '肯定说法：持有 AACB / 带团队；出现在骨架与预览的条件标签上' },
        { key: 'absent', type: 'string', required: true, note: '否定说法：无 AACB / 不带团队；用来解释「这一单为什么没有这一条」' },
        { key: 'hint', type: 'string', note: '这个事实从哪查、什么口径，给人看' }
      ]
    },
    {
      key: 'scope',
      name: '适用范围',
      exposeToModel: true,
      purpose: '这套提示词管谁 —— 只用于触发时选提示词，不决定树。触发之后已经知道是谁了，差异由这一单的事实决定。空维度表示不限；人数由系统按编制估算，不许自己编。',
      fields: [
        { key: 'jobs', type: 'string[]', required: true, note: '岗位；只能取组织维度里给的值，至少一项（或给门店）' },
        { key: 'cities', type: 'string[]', note: '城市；空 = 不限' },
        { key: 'stores', type: 'string[]', note: '门店；空 = 不限' },
        { key: 'employTypes', type: 'string[]', note: '用工类型；空 = 不限' },
        { key: 'estimate', type: 'number', note: '预估人数，系统按岗位编制 × 城市占比 × 用工占比算出；模型不要填' }
      ]
    },
    {
      key: 'trigger',
      name: '触点',
      exposeToModel: true,
      purpose: '这件事从哪触发：谁在哪个入口做什么、系统从哪个业务事件点接住、带哪些字段进来。触点决定一张单在什么时候存在。',
      fields: [
        { key: 'type', type: 'enum', values: 'triggerTypes', required: true },
        { key: 'entry', type: 'string', required: true, note: '触点入口：端 + 位置，如「员工自助端 · 我的 · 离职申请」。只写「业务触发」不合格' },
        { key: 'eventPoint', type: 'string', note: 'business 用：业务事件点，只能取触点目录里登记过的值' },
        { key: 'payload', type: 'array', note: 'business 用：从登记字段里挑用哪些 [{ field, use }]。field 只能是登记过的 key；use = intake 取数入参 / show 实例回看 / bind 预填子事件。类型、必传、可选值一律来自登记，不在这里重写' },
        { key: 'who', type: 'object', note: 'manual 用：{ roles, resolveBy } 可发起角色与数据范围；发起人填什么由入口子事件的事项承担，不在这里重复' },
        { key: 'cron', type: 'string', note: 'schedule 用：周期，如「每月 1 日 09:00」' }
      ]
    },
    {
      key: 'eventPoint',
      name: '业务事件点（对岸注册，我方只读）',
      exposeToModel: false,
      purpose: '业务系统承诺「在这个时刻我会发出这些字段」。由业务开发在开放平台注册，我方只读 —— 我们编不出对岸不发的字段。选它作为触发源时，字段清单整份带出，人再从里面挑。',
      fields: [
        { key: 'key', type: 'string', required: true, note: '事件点标识，如 resign.apply.submitted' },
        { key: 'label', type: 'string', required: true, note: '对岸的叫法' },
        { key: 'source', type: 'string', required: true, note: '哪个系统发的' },
        { key: 'entry', type: 'string', note: '登记入口：端 + 位置' },
        { key: 'payload', type: 'array', required: true, note: '字段契约 [{ key, label, type, required, options?, role?, default?, note? }]；type = text / date / number / enum / bool；role = empNo 表示引擎拿它去查员工档案；default 支持 today / today+Nd' }
      ]
    },
    {
      key: 'sub',
      name: '子事件',
      exposeToModel: true,
      purpose: '一条可判定的结论。不是动作 —— 别人看了要能判断达成没达成。',
      fields: [
        { key: 'id', type: 'string', required: true, note: '树内唯一，生成后保持稳定' },
        { key: 'goal', type: 'string', required: true, note: '一句结论，必须可判定；写成「审核 / 处理 / 办理」而不给达成状态即不合格' },
        { key: 'gate', type: 'enum', values: 'gates', required: true },
        { key: 'deps', type: 'string[]', required: true, note: '前置子事件 id；空数组表示无前置；支持或组 ["se.a",["se.b","se.c"]]' },
        { key: 'ways', type: 'array', ref: 'way', required: true, note: '至少一条' },
        { key: 'biz', type: 'string', note: '给人看的一句话，不参与执行' }
      ]
    },
    {
      key: 'owner',
      name: '负责人',
      exposeToModel: true,
      purpose: '这一条结论由谁负责：负责核对、签收并填写结果的人，不是动手的人。交接这一步动手的是离职员工本人（写进事项的完成口径），负责人是店长。可以写角色（该角色的人都能看见、都能办），也可以写指定的人（只有他能看见、能办）。',
      fields: [
        { key: 'kind', type: 'enum', values: ['role', 'person'], required: true, note: 'role 角色 / person 指定的人' },
        { key: 'role', type: 'string', ref: 'role', note: 'kind = role 用；取角色目录里的 key，不写人名' },
        { key: 'name', type: 'string', note: 'kind = person 用；只能取定义期事实里出现过的责任人（总部固定责任人 / 城市与门店责任人）' }
      ]
    },
    {
      key: 'way',
      name: '兑现路径',
      exposeToModel: true,
      purpose: '说明这条结论由谁达成。没有 kind 字段 —— 人工与系统写在 way 里，不写在子事件上。',
      variants: [
        { when: 'type = human', fields: ['type', 'owner', 'items'] },
        { when: 'type = system', fields: ['type', 'sysKey', 'fetch'] },
        { when: 'type = action', fields: ['type', 'actionKey', 'targets', 'retry'] },
        { when: 'type = external', fields: ['type', 'party', 'via', 'receipt', 'writeBack', 'timeout'] }
      ],
      fields: [
        { key: 'type', type: 'enum', values: 'wayTypes', required: true },
        { key: 'owner', type: 'object', ref: 'owner', note: 'human 用：这一条结论的负责人（审核就是审核人 —— 核对并给结论的人，不是动手的人）' },
        { key: 'items', type: 'array', ref: 'item', note: 'human 用，至少一项；动手的人写在事项的完成口径里（如「员工本人交还工服，店长逐项核对」），不另设字段。审核意见也是一个普通字段，不单设控件' },
        { key: 'sysKey', type: 'string', note: 'system 用，必须取自系统检查项目录' },
        { key: 'fetch', type: 'object', ref: 'fetch', note: 'system 用：取数策略' },
        { key: 'actionKey', type: 'string', note: 'action 用，必须取自动作目录' },
        { key: 'targets', type: 'string', note: 'action 用：对谁逐个执行。取事实里的清单（如该员工名下账号）、载荷字段或上游结论；留空表示整单执行一次' },
        { key: 'retry', type: 'object', note: 'action 用：{ times, interval, onExhaust: human|stop }' },
        { key: 'party', type: 'string', note: 'external 用：回执方（哪个平台 / 哪一方的人要动手）' },
        { key: 'via', type: 'string', note: 'external 用：这次等的是哪个动作招来的回执（actionKey）。回执不会凭空来 —— 我方先推出去，对方才可能回话；写清 via，才查得到「这一步在等谁、等的是哪一次推送」' },
        { key: 'receipt', type: 'array', note: 'external 用：回执字段清单 [{ key, label, type?, values? }]，至少要有一个能判定的字段（如 signState 员工签署状态）。写成一句话（「员工签署状态」）不算约定：下游引用不到、也无法判达成' },
        { key: 'writeBack', type: 'string', note: 'external 用：回执写回这条结论的哪个结果字段（如 signState）。下游按「结果：<这条结论> · <字段>」引用；不写就等于回执只落在页面上，流程用不上' },
        { key: 'timeout', type: 'string', note: 'external 用：多久没有回执算超时；超时不等于完成' }
      ]
    },
    {
      key: 'item',
      name: '事项',
      exposeToModel: true,
      purpose: '人要办的一件具体事。事项 = 做什么（一条完成口径）+ 交什么（一组表单组件）。两者缺一，办事的人不知道要交什么才算完成。',
      fields: [
        { key: 'title', type: 'string', required: true, note: '动宾短语，如「交还工服」' },
        { key: 'require', type: 'string', required: true, note: '做到什么算完成，可判定' },
        { key: 'fields', type: 'array', ref: 'field', note: '表单组件：人填什么、传什么。文本 / 数字 / 日期 / 单选 / 人员 / 附件 / 引用，证据要求就是其中 type=file 的组件' }
      ]
    },
    {
      key: 'field',
      name: '字段（表单组件）',
      exposeToModel: true,
      purpose: '只描述人要交的东西，一个字段就是一个控件。系统算出来的值不进字段 —— 那是系统检查项的产出；看已有单据与上游结论属展示，也不进字段。',
      fields: [
        { key: 'label', type: 'string', required: true },
        { key: 'type', type: 'enum', values: 'fieldTypes', required: true, note: 'text 单行文本 / number 数字 / date 日期选择 / select 单选 / person 人员选择 / file 附件上传' },
        { key: 'required', type: 'boolean' },
        { key: 'rule', type: 'string', note: '区间 / 精度 / 正则 / 选项集；不允许写脚本' },
        { key: 'from', type: 'string', note: "预填来源，形如 payload.expectDate：这一格的默认值是触发单据带进来的那个字段。只是默认值，人仍可改 —— 不等于替他拍板" }
      ]
    },
    {
      key: 'fetch',
      name: '取数策略',
      exposeToModel: true,
      purpose: '流程侧多久去一次系统判定项的结果里取结论。默认取该条目登记的 defaultFetch（编排时带出），可改；不配置检查方多久跑一批。',
      fields: [
        { key: 'fetchFreq', type: 'string', note: "none 或 <n><m|h|d>，如 1d / 6h；缺省时按引用条目的 defaultFetch.freq" },
        { key: 'maxRuns', type: 'number', note: '最多消费几个「不同的未通过批次」；不按取数次数计；缺省时按 defaultFetch.maxRuns' }
      ]
    },
    {
      key: 'sys',
      name: '系统检查项',
      exposeToModel: 'reference',
      catalogRef: 'src/v2/catalog.js · systemChecks',
      purpose: '他方资产，只读引用。条件、阈值、批次归检查方，流程侧只见镜像。生成时只能选 key 并调取数频率。',
      fields: [
        { key: 'key', type: 'string', note: '引用时只能从这里取' },
        { key: 'source', type: 'string', note: '取数来源系统' },
        { key: 'pass', type: 'object', note: '通过条件；条目写中文名，不写英文 key' },
        { key: 'soft', type: 'object', note: '软性区间，可为空；条目同样写中文名' },
        { key: 'fetch', type: 'object', note: '取数字段 [{ key: 来源系统原字段, label: 业务中文名 }]；条件与界面只用 label' },
        { key: 'defaultFetch', type: 'object', note: '流程侧取数默认值 { freq, maxRuns }：编排引用时直接带出，可改；与检查方跑批节奏是两回事' },
        { key: 'mirror', type: 'object', note: '只读镜像：生效版本、配置人、上线时间' },
        { key: 'batches', type: 'array', note: '批次日志（快照，不改写）：批次号、执行时间、当批条件版本与上线时间、扫/通/软/未/异汇总、note、逐单 verdict（人 + 判定 + 指标原值）' }
      ]
    },
    {
      key: 'action',
      name: '动作',
      exposeToModel: 'reference',
      catalogRef: 'src/v2/catalog.js · actions',
      purpose: '系统能替人做的事：改数据、发通知、交文件。执行过并拿到回执，才算这条结论达成。只引用，不生成。动作不分「中途」与「终点」—— 位次由拓扑决定：被收尾子事件引用就是终点动作。',
      fields: [
        { key: 'key', type: 'string', note: '引用时只能从这里取' },
        { key: 'name', type: 'string', note: '业务叫法，如「撤销系统权限」' },
        { key: 'source', type: 'string', note: '执行方：哪个系统真的去改' },
        { key: 'mode', type: 'enum', values: ['execute', 'notify', 'deliver'], note: 'execute 改数据 / notify 发通知 / deliver 交文件' },
        { key: 'target', type: 'string', note: '逐个执行的单位（账号 / 人 / 单据）；无目标表示整单执行一次' },
        { key: 'args', type: 'array', note: '入参 [{ key, label, from: facts|payload|verdict|receipt|input }]；receipt 指上游动作拿到的回执字段' },
        { key: 'receipt', type: 'array', note: '回执字段 [{ key, label }]，逐目标各一条' },
        { key: 'idempotent', type: 'string', note: '幂等键取什么：重复触发不重复执行' },
        { key: 'fallback', type: 'string', note: '失败兜底：转人工 / 重试后终止' }
      ]
    },
    {
      key: 'instance',
      name: '实例',
      exposeToModel: false,
      purpose: '发起那一刻的快照。改定义不影响在途单。',
      fields: [
        { key: 'snapshot', type: 'object', note: '版本 + 解析后的树与契约' },
        { key: 'records', type: 'array', note: '每事项 { verdict, values, files, note, by, at }' },
        { key: 'polls / failBatches', type: 'number', note: '取数次数 / 已消费的不同未通过批次，两者不等说明白等' }
      ]
    }
  ],

  /* ---------------- 不变式（同时用于提示词与校验） ---------------- */

  invariants: [
    { key: 'three-parts', rule: '一件事由三部分组成：触点（从哪触发）+ 人群（对谁生效）+ 子事件（谁把哪条结论做实）；只生成子事件不算生成了一件事' },
    { key: 'trigger-required', rule: '没有触点就不会触发：业务事件必须落到登记过的事件点并给出入口，人工发起必须限定角色与入口，定时必须给周期' },
    { key: 'crowd-required', rule: '人群必须给四维与预估人数：空维度表示不限，但不许用「全体员工」代替；人数由系统按编制估算，不由模型编' },
    { key: 'no-content-in-root', rule: '根事件不承载内容：出现字段、角色、步骤即越界' },
    { key: 'position-by-topology', rule: '位次不落库：无前置即可开始，无人依赖即收尾；触发源不参与子事件位次判定' },
    { key: 'one-conclusion', rule: '一个子事件一条结论；多路兑现时先给出终局结论者定，其余冻结留痕' },
    { key: 'def-instance-split', rule: '定义与实例分离：定义期没有树，树是每一单触发时生成的产物；生成后跟着这张单走，改提示词与骨架不动在途单' },
    { key: 'intake-builtin', rule: '触发前取数是引擎内置的固定一层，所有根事件都跑：先取员工档案与逐人事实，再生成树。它不进骨架（它不是结论，是生成结论清单的输入）、不在树上（没有承担者、不给结论，摆上树会被误认为能排在交接之后）、不可调整（没有开关、没人能跳过或改执行时机）。档案取不到即触发不成立 —— 不知道人是谁，树没有依据' },
    { key: 'payload-registered', rule: '载荷字段的形状只由事件点登记决定（业务系统注册：key / 中文名 / 类型 / 必传 / 可选值 / 默认值），提示词只管「用哪些、各自走到哪」（intake / show / bind），不许重写类型、必传与选项。写了登记表没有的键即错误：对岸不会发它，触发时必然取不到。触发时按同一条登记校验，缺必传或取值不对就拒单 —— 不留半张单，也不猜一个值补上' },
    { key: 'payload-value-only', rule: '载荷只参与值，不参与结构：它决定「某一格默认填什么」，不决定「这棵树该长几条」。树形只由事实决定 —— 否则同一件事会因为一单的参数长出不同的树，就退回按单定制' },
    { key: 'skeleton-floor', rule: '骨架是生成的下限：必办项缺一条即不合格（重试；仍不合格按必办项降级生成并标「降级」），多出不适用的项只提醒不拦' },
    { key: 'generated-per-instance', rule: '同一套提示词对不同的人可以长出不同的树：树是这一单的产物，不是定义的副本，因此不能把「上一版树」套到新单上' },
    { key: 'mid-adjust', rule: '树跟着这一单走，所以允许在运行中调整：加一条、删一条、改前置，层级按新树重算（位次本就不落库）。已办结的环节锁住 —— 它是事实，有记录有附件，不许删也不许改结论、门禁、前置与事项。每次调整留痕，但只记录与提示、不拦流程；同类调整在多张单上反复出现，说明缺的是骨架条目或事实，该回定义层改，而不是每单手调' },
    { key: 'condition-single-owner', rule: '条件只存在于系统检查项，流程侧只见镜像与批次留痕' },
    { key: 'two-frequencies', rule: '两层频率不混：检查方多久跑一批归检查方，流程侧取数频率归节点；批次上限只计消费到的不同未通过批次' },
    { key: 'field-is-human-input', rule: '字段只描述人要交的东西：系统算出来的一律进批次结果' },
    { key: 'system-two-jobs', rule: '系统只做两件事：判定给结论、执行给回执。判定不改数据，执行不自己定通过口径；两者都不许由人代办来冒充' },
    { key: 'action-position', rule: '动作不分中途与终点：被收尾子事件引用即为终点动作，位次仍由拓扑推导' },
    { key: 'difference-by-fact', rule: '差异只有一个来源：这一单取到的事实。事实满足 needs 才有这一条，不满足就不长出来；不按岗位想象事实，不在树上打补丁，也不复制第二棵树。承担者解析不到人时同样不成立' },
    { key: 'needs-declared', rule: '骨架的 needs 只能取「基础事实表 + 本事件 facts[] 声明过」的键：基础表跨事件通用，某件事专用的事实由这套提示词自带；用了没声明的键即不合格（触发时永远取不到，那一条会静默消失）。基础表一旦被某件事的口径污染，换一件事就会拿到不适用的事实' },
    { key: 'review-is-conclusion', rule: '审核不单设类型与层级：一条审核 = 一条结论（已××通过）+ 人给结论 + 核对字段与意见字段。几级审核就几条结论，用前置串成先后；会签 = 几条结论同一前置、都要过。这样「审完没有」只看这一条结论的达成状态，不靠节点数量猜；或签（任一）需要「任一人办」的承担者语义，当前不支持，不要用一条结论含糊过去' },
    { key: 'owner-is-verifier', rule: '负责人是对结论负责并填结果的人，不是动手的人：谁动手写在事项的完成口径里，不占字段；负责人写角色则同角色的人都能看见能办，写指定的人则只有他能看见能办' },
    { key: 'facts-scope', rule: '定义期不查人：提示词与骨架只写「取什么」，不写「取到多少」。逐人的账号、欠款、资产、团队由触发前取数带回（引擎内置、不配），才决定这一单长哪几条' }
  ],

  /* ---------------- 生成纪律（红线） ---------------- */

  discipline: [
    '不许编造事实：涉及人、权限、金额、余额、日期，只能使用给定事实；没有就提问',
    '骨架只写「必须交付什么」：不在骨架里写依赖链、表单字段与承担者 —— 那些在触发时按这一单算',
    '不许为了「流程完整」补一条事实不存在的结论：取不到就不用办，这一步本就不属于这个人',
    '不许替业务拍口径：多少算通过、要不要传证据、这一步必须过吗，拿不准必须问',
    '触点必须落到具体入口：只说「业务触发」「系统发起」不合格，要写清事件点与端内位置（如「员工自助端 · 我的 · 离职申请」）；入口说不清就提问',
    '载荷只能从事件点登记的字段里挑，写 key 不写中文名，不自己加字段、不重写类型与必传：对岸发什么是对岸决定的，我们编一个只会让触发时取不到',
    '子事件要用到单据上的值时，写字段的 from（payload.xxx），不要在事项里再让人填一遍同一个东西',
    '人群只能取组织维度里给的值，并说明为什么是这批人；拿不准就提问，不许默认「全体员工」，也不许拿一个样本人反推',
    '定义期不假设具体员工：不许写「张三欠款 320 所以这一步要卡」，只能写「欠款是否结清」由判定项在触发后按批次给结论',
    '逐人数据写「取什么」不写「取到多少」：账号清单、欠款金额、假勤余额由实例载荷或判定项结果带入，不在这里拍数',
    '人办路径要说清事项与表单组件：每个事项一条完成口径 + 至少一个组件；组件只能取文本 / 数字 / 日期选择 / 单选 / 人员选择 / 附件上传',
    '审核不是节点，也不是路径类型：它就是一条结论（goal 写「×× 已审核通过」，带达成状态）+ 人给结论。谁审写在负责人上（写角色不写人名，确需指定人时用 kind=person 且取事实里的责任人），审核意见只是事项里的一个文本字段',
    '几级审核就写几条结论，前后用 after 串起来（城市总先、人事后，就是两条）；会签 = 几条结论同前置、都要过。或签（任一）当前不支持 —— 不许用一条结论含糊过去，也不许拆成「提交审核」「审核通过」两条：那等于同一个环节占两个节点',
    '不许把 goal 写成「离职需求审核」「审批」「处理」这种动作：判不出通过与否。模板与生成自检都按这条判不合格',
    '谁做由提示词定，契约只管形状：人要交东西就给事项字段（要凭证就必传附件并写允许格式）；系统做就是系统项（判定 / 执行），没有人工表单、没有意见框，也不许留一条「人工确认」并列兜底 —— 多条路径是「或」关系，等于系统没成功、人点一下也算达成',
    '等对方回话的结论（external）必须写清三样：party 谁动手、via 这个回执由哪个动作招来、receipt 回执字段清单（含 key 与可能取值）；再加 writeBack 说回执落回哪个结果字段。缺 receipt 字段等于没约定，下游引用不到、也判不出达成',
    '动作的回执只证明「送达 / 执行过」，不证明「对方完成了」：签署、确认、接收这类要由对方完成的结论，另立一条 external —— 不许拿推送的送达结果冒充签署完成',
    '负责人写「核对并填结果的人」，不写动手的人：交接类节点写店长 / 直属上级，员工本人交还在事项的完成口径里说清',
    '字段只收人要填要传的东西：引用别的单据、看上游结论都属展示，不进字段（展示归页面，不进事项表单）',
    '系统判定路径的取数频率照抄该判定项登记的默认值（多久取一次 + 批次上限），不许留空，也不许把检查方跑批节奏写进来',
    '不许生成系统检查项与动作，只能引用目录里已有的 key；选不中就回来登记，不许现编一个',
    '不许输出结构之外的字段：不自创 type、不加 kind、不给字段标判定标记',
    '不许把动作写成结论：goal 必须含一个可判定的达成状态',
    '写操作一律用 action：移除权限、停用账号、冻结发放、推送、通知、归档，都不许写成 human 事项让人去点，也不许写成 external 回执',
    'external 只用于对方的人要动手、我方只能等（如员工在电子签平台签署）；我方发起调用的，一律 action',
    '撤销权限的目标默认是员工名下全部账号：岗位标准之外多挂的账号不能漏，要么列进 targets，要么在 recap 里说明为什么保留',
    'goal 用人话且不罗列清单：不写账号 key、接口名、系统代号；账号与目标清单放 targets，goal 只写结论',
    'targets 用业务名称（门店收银系统、企业微信、Web 后台 · 排班管理），不写 pos / web.shift 这类内部 key'
  ],

  /* ---------------- 系统项 Agent 的纪律（不是编排 Agent 的） ----------------
     编排 Agent 只挑 key、配频率；系统项 Agent 才定「怎么判、怎么执行」。
     两边纪律分开写，避免编排侧被允许去改条件。 */

  sysDiscipline: [
    '判定项的条件必须可执行：字段 + 比较符 + 阈值，禁止「视情况」「合理」「原则上」这类无法落地的说法',
    '条件条目、取数字段一律写中文业务名（如「面谈记录编号 = 非空」）；英文 key 只用于对接来源系统，不许出现在条件与界面上',
    '取数字段必须成对给：key（来源系统原字段，机器用）+ label（中文名，人看；条件里只引用它）',
    '默认取数频率要跟条目走：defaultFetch 是该判定项被流程引用时的默认值（多久取一次、最多消费几个未通过批次），不是检查方跑批节奏',
    '通过条件与软性区间不许重叠：先判 pass，再判 soft，都不命中判未通过；重叠会让同一单既通过又软性',
    '软性区间只在业务允许弹性时给；给不出可量化边界就留空，不要为了凑结构编一条',
    '来源系统必须真实存在：只能从给定来源清单里选，不许编「数据中台」「大数据平台」这类不存在的系统',
    '批次是快照，不许回填：人名、岗位、归属、条件版本、指标都是当时的值，判完再改版本不改老批次',
    '判定项的每个批次都要逐单到人（empNo + 姓名 + 岗位 + 判定 + 指标原值），只给汇总的批次无法回答「这单当时怎么判的」',
    '执行项必须写清 target（逐个执行的单位）、targetFrom（范围怎么取）、receipt（回执字段）、idempotent（幂等键）、fallback（失败兜底），缺一不可',
    '执行项不许写通过条件：执行只给回执，通过与否由引用它的子事件按门禁判',
    'key 发布后不改；新建项只给语义化短名（英文小写或短横线），不带 check. / act. 前缀'
  ],

  sysIo: {
    check: {
      step: 'check',
      key: 'semantic-short-name',
      name: '业务叫法',
      source: '来源系统',
      desc: '一句话说明查什么',
      pass: { logic: 'and | or', items: ['中文名字段 比较符 阈值'] },
      soft: { logic: 'and | or', items: ['中文名字段 比较符 阈值'] },
      fetch: { fields: [{ key: '来源系统原字段', label: '业务中文名' }], cadenceHint: '建议多久跑一批（由检查方定，流程侧不配）' },
      defaultFetch: { freq: '1d | 2h | none', maxRuns: 5 },
      batch: {
        batchNo: 'B-20261024-01',
        ranAt: '2026-10-24 08:30',
        version: 'v3',
        condAt: '该条件版本上线时间',
        configuredBy: '配置人',
        scanned: 4,
        passN: 2,
        softN: 0,
        failN: 2,
        errN: 0,
        note: '本批说明（改了什么口径）',
        verdicts: [{
          empNo: '员工工号',
          name: '姓名（快照）',
          job: '岗位（快照）',
          store: '门店 / 归属（快照）',
          result: '通过 | 软性命中 | 未通过 | 取数异常',
          metrics: '指标原值，并写明与阈值的差距'
        }]
      },
      recap: ['为什么这么定条件']
    },
    action: {
      step: 'action',
      key: 'semantic-short-name',
      name: '业务叫法',
      source: '执行方系统',
      mode: 'execute | notify | deliver',
      target: '账号 | 人 | 单据 | 班次 | 系统',
      targetFrom: '逐个执行的范围怎么取',
      args: [{ key: 'empNo', label: '员工工号', from: 'facts | payload | verdict | receipt | input' }],
      receipt: [{ key: 'result', label: '回执字段' }],
      idempotent: '幂等键取什么',
      fallback: '失败兜底',
      recap: []
    }
  },

  /* ---------------- 生成流程 ---------------- */

  generation: {
    steps: [
      {
        key: 'ask',
        name: '缺口识别',
        rule: '只提问，不生成树',
        sources: [
          { key: 'touch', name: '触点缺口', desc: '从哪触发不明 / 事件点没登记 / 入口说不清 / 带什么字段进来没讲' },
          { key: 'crowd', name: '人群缺口', desc: '对哪些岗位、城市、门店、用工类型生效不明；说了「所有人」但没说是不是真的全体' },
          { key: 'contract', name: '契约缺口', desc: '缺判定口径 / 缺承担人 / 缺证据要求 / 前置不明 / 表单组件不明' },
          { key: 'data', name: '数据联想', desc: '目录与组织里有、用户没提到、且会卡住流程的事实（该城市没有对应角色、该岗位缺权限基线、目录里已有现成判定项可复用）' }
        ],
        levels: [
          { key: 'hard', name: '必答', desc: '不回答就无法发布' },
          { key: 'soft', name: '建议', desc: '可先不管' }
        ],
        requirement: '每条问题必须说明缺什么、不问会怎样，并给选项或默认值'
      },
      {
        key: 'compose',
        name: '起草提示词与骨架',
        rule: '把回答与事实一起落成「提示词正文 + 骨架清单 + 本事件声明的事实」；不生成树。骨架里用到的基础表之外的键，必须先在 facts 里声明（附肯定 / 否定两种说法），否则触发时取不到。每个影响业务的选择都要在 recap 里写明依据'
      }
    ]
  },

  /* ---------------- 输出形状 ---------------- */

  io: {
    ask: {
      step: 'ask',
      understood: '一句话复述你理解的这件事：从哪触发、对谁、分几步',
      gaps: [
        {
          id: 'q1',
          level: 'hard | soft',
          kind: 'touch | crowd | contract | data',
          about: '缺口的落点，如「触点入口」「覆盖人群」「离职信息确认」',
          question: '要问的话',
          why: '不问会怎样',
          options: ['选项'],
          default: '默认值'
        }
      ]
    },
    compose: {
      step: 'compose',
      name: '事件名',
      summary: '一句话',
      trigger: {
        type: 'business | manual | schedule',
        entry: '触点入口：端 + 位置',
        eventPoint: 'business 用：只能取触点目录里的 key',
        payload: [{ field: '载荷字段', from: '来源单据上的字段' }],
        who: { roles: ['employee'], resolveBy: 'store' }
      },
      coverage: { jobs: ['推拿师'], cities: [], stores: [], employTypes: ['全职', '试用'] },
      body: '提示词正文，分五段：这件事是什么 / 必须交付的结论 / 差异怎么判断 / 表单怎么给 / 不要做什么',
      facts: [
        { key: 'semantic-key', label: '肯定说法（持有 AACB）', absent: '否定说法（无 AACB）', hint: '这个事实从哪查、什么口径' }
      ],
      skeleton: [
        {
          key: 'semantic-key',
          goal: '一句可判定的结论',
          needs: 'always | clients | tasks | team | assets | cash | debt | accounts，或自己在 facts 里声明的键',
          gate: 'must | optional',
          after: ['另一个骨架 key'],
          afterAny: [],
          paths: [
            { type: 'human', role: 'store-manager', items: [{ title: '事项', require: '做到什么算完成（谁动手写在这里）', fields: [{ label: '归还照片', type: 'file', required: true }] }] },
            { type: 'system', sysKey: 'debt', fetch: { fetchFreq: '1d', maxRuns: 5 } },
            { type: 'action', actionKey: 'act.revokePerm', targets: '该员工名下全部系统账号', retry: { times: 3, interval: '30m', onExhaust: 'human' } },
            { type: 'external', party: '电子签平台', receipt: '员工签署状态', timeout: '7d' }
          ],
          note: '给人看的一句话'
        }
      ],
      recap: ['判断依据']
    }
  },

  /** 角色枚举（用于把「谁办」落成人） */
  roles: ['employee', 'store-manager', 'supervisor', 'hr', 'city-head', 'it', 'finance', 'region-head', 'gm']
}

/* ---------------- 渲染器：契约 → 系统提示词 ---------------- */

const enumText = (c, v) => {
  const list = c.enums[v]
  if (!list) return ''
  return list.map((x) => (typeof x === 'string' ? x : `${x.key}（${x.label}：${x.effect}）`)).join(' / ')
}

const fieldLine = (c, f) => {
  const parts = [`- **${f.key}**`]
  parts.push(f.required ? '必填' : '选填')
  if (f.type === 'enum' && f.values) parts.push(`取值 ${enumText(c, f.values)}`)
  else if (Array.isArray(f.values)) parts.push(`取值 ${f.values.join(' / ')}`)
  else parts.push(f.type)
  if (f.ref) parts.push(`结构见 ${f.ref}`)
  if (f.note) parts.push(f.note)
  return parts.join('，')
}

export function renderSystemPrompt (c = CONTRACT) {
  const lines = []
  lines.push('你是「事件编排生成器」。业务人员用一段话描述一件事在他们公司怎么走，你把它变成可执行、可审阅的编排。')
  lines.push('')
  lines.push(`核心：${c.gist}`)
  lines.push('')

  lines.push('## 你能表达的东西')
  c.objects
    .filter((o) => o.exposeToModel === true || o.exposeToModel === 'reference')
    .forEach((o) => {
      lines.push('')
      lines.push(`### ${o.name}（${o.key}）${o.exposeToModel === 'reference' ? ' · 只读引用' : ''}`)
      lines.push(o.purpose)
      if (o.variants?.length) {
        lines.push('按 type 取不同字段：')
        o.variants.forEach((v) => lines.push(`- ${v.when} → ${v.fields.join(' / ')}`))
      }
      lines.push('字段：')
      o.fields.forEach((f) => lines.push(fieldLine(c, f)))
    })

  lines.push('')
  lines.push('## 不许做的事')
  c.discipline.forEach((d, i) => lines.push(`${i + 1}. ${d}`))

  lines.push('')
  lines.push('## 工作分两步，不要合并')
  c.generation.steps.forEach((s) => {
    lines.push('')
    lines.push(`### ${s.name}（${s.key}）`)
    lines.push(s.rule)
    if (s.sources) s.sources.forEach((x) => lines.push(`- ${x.name}：${x.desc}`))
    if (s.levels) lines.push(`分档：${s.levels.map((l) => `${l.key}=${l.name}（${l.desc}）`).join('；')}`)
    if (s.requirement) lines.push(`要求：${s.requirement}`)
  })

  lines.push('')
  lines.push('## 输出格式')
  lines.push('第一步只输出：')
  lines.push(JSON.stringify(c.io.ask))
  lines.push('')
  lines.push('第二步只输出：')
  lines.push(JSON.stringify(c.io.compose))
  lines.push('')
  lines.push('只输出 JSON，不要解释，不要 markdown 代码块。')
  lines.push('')
  lines.push(`（契约 ${c.id} ${c.version}）`)
  return lines.join('\n')
}

/** 程序侧取对象定义 */
export const objectOf = (key) => CONTRACT.objects.find((o) => o.key === key) || null
/** 程序侧取枚举值 */
export const enumOf = (key) => CONTRACT.enums[key] || []

/**
 * 系统项 Agent 的系统提示词：同一个 CONTRACT 的另一面。
 *
 * 与 renderSystemPrompt 的区别只在「产物」：
 *   编排 Agent 产出树（子事件 / 事项 / 频率）；
 *   系统项 Agent 产出目录条目（判定条件 / 执行参数）。
 * 两者共用 objects / 纪律，但各自只暴露自己那一段，避免越界。
 */
export function renderSystemItemPrompt (c = CONTRACT) {
  const sysObj = c.objects.find((o) => o.key === 'sys')
  const actObj = c.objects.find((o) => o.key === 'action')
  const lines = []

  lines.push('你是「系统项 Agent」。系统项是流程里「系统替人做的那部分」，只有两类：')
  lines.push('')
  lines.push('## 一、判定项（check）—— 只出结论，不改数据')
  lines.push(`流程侧把它挂在子事件上，作为 way.type = system 的一条达成路径。${sysObj?.purpose || ''}`)
  ;(sysObj?.fields || []).forEach((f) => {
    lines.push(`- ${f.key}（${f.type}${f.note ? '，' + f.note : ''}）`)
  })
  lines.push('')
  lines.push('## 二、执行项（action）—— 真的改数据或发出东西，拿回执')
  lines.push(`流程侧把它挂在子事件上，作为 way.type = action 的一条达成路径。${actObj?.purpose || ''}`)
  ;(actObj?.fields || []).forEach((f) => {
    lines.push(`- ${f.key}（${f.type}${f.note ? '，' + f.note : ''}）`)
  })

  lines.push('')
  lines.push('## 不许做的事')
  c.sysDiscipline.forEach((d, i) => lines.push(`${i + 1}. ${d}`))

  lines.push('')
  lines.push('## 输出格式')
  lines.push('判定项只输出下面这个形状：')
  lines.push(JSON.stringify(c.sysIo.check))
  lines.push('')
  lines.push('执行项只输出下面这个形状：')
  lines.push(JSON.stringify(c.sysIo.action))
  lines.push('')
  lines.push('只输出 JSON，不要解释，不要 markdown 代码块。')
  lines.push('')
  lines.push(`（契约 ${c.id} ${c.version} · 系统项）`)
  return lines.join('\n')
}
