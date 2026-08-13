// 人员薪酬规划 + HR 异动 的共享状态（模块级 ref，跨组件共享）。
// 真实环境这里应该走 Pinia / 后端接口；原型期直接放前端 mock。
import { ref } from 'vue'

// 人员薪酬规划最终记录（按人聚合，一个人可有多条历史任职段）
const initialPlanningList = [
  {
    id: 'P001', talentId: 'T00676', name: '张三', position: '推拿师',
    positionId: '1555014418742325250', positionCategory: '业务',
    coopMode: '劳动合同-全日制', city: '上海市',
    company: '常乐健康（上海）有限公司', store: '上海徐汇店',
    templateName: '全职推拿师模板',
    effectiveStart: '2025-01-01 00:00:00', effectiveEnd: '2026-08-15 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P002', talentId: 'T00676', name: '张三', position: '推拿师',
    positionId: '1555014418742325250', positionCategory: '业务',
    coopMode: '劳务合作-兼职', city: '深圳市',
    company: '常乐健康（深圳）有限公司', store: '南山京基百纳',
    templateName: '非全日制推拿师收入40',
    effectiveStart: '2026-08-20 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P003', talentId: 'T00680', name: '元元', position: '调理师',
    positionId: '1555014418742325250', positionCategory: '业务',
    coopMode: '非全日制', city: '深圳市',
    company: '-', store: '南山京基百纳',
    templateName: '非全日制推拿师收入40',
    effectiveStart: '2025-06-30 00:00:00', effectiveEnd: '2025-10-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P004', talentId: 'T00701', name: '怡珠', position: '客户经理',
    positionId: '1554317513916874754', positionCategory: '业务',
    coopMode: '正常', city: '广州市',
    company: '-', store: '佳兆业广场',
    templateName: '客户经理收入',
    effectiveStart: '2026-08-01 00:00:00', effectiveEnd: '2027-08-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P005', talentId: 'T00702', name: '从东', position: '调理师',
    positionId: '1555014418742325250', positionCategory: '业务',
    coopMode: '非全日制', city: '深圳市',
    company: '-', store: '地王大厦',
    templateName: '非日制推拿师收入44',
    effectiveStart: '2026-08-01 00:00:00', effectiveEnd: '2026-11-30 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P006', talentId: 'T00703', name: '乐乐', position: '调理师',
    positionId: '1555014418742325250', positionCategory: '业务',
    coopMode: '非全日制', city: '上海市',
    company: '-', store: 'BFC外滩金融中心',
    templateName: '非全日制推拿师收入40',
    effectiveStart: '2026-08-02 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P007', talentId: 'T00703', name: '乐乐', position: '调理师',
    positionId: '1555014418742325250', positionCategory: '业务',
    coopMode: '正常', city: '上海市',
    company: '-', store: 'BFC外滩金融中心',
    templateName: '7月全日制推拿师超产值获豆',
    effectiveStart: '2026-07-02 00:00:00', effectiveEnd: '2026-07-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P008', talentId: 'T00704', name: '汉波', position: '调理师',
    positionId: '1555014418742325250', positionCategory: '业务',
    coopMode: '非全日制', city: '重庆市',
    company: '-', store: '大竹林金科乐方店',
    templateName: '非全日制推拿师收入40',
    effectiveStart: '2026-08-02 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P009', talentId: 'T00704', name: '汉波', position: '调理师',
    positionId: '1555014418742325250', positionCategory: '业务',
    coopMode: '正常', city: '重庆市',
    company: '-', store: '大竹林金科乐方店',
    templateName: '7月全日制推拿师超产值获豆',
    effectiveStart: '2026-07-02 00:00:00', effectiveEnd: '2026-07-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P011', talentId: '503295581121282048', name: '蔡云航', position: '客户经理',
    positionId: '1554317513916874754', positionCategory: '业务',
    coopMode: '劳动合同-全日制', city: '上海市',
    company: '常乐健康（上海）有限公司', store: '上海徐汇店',
    templateName: '客户经理收入',
    effectiveStart: '2025-03-01 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P012', talentId: '177656681587540377', name: '张宁', position: '客户经理',
    positionId: '1554317513916874754', positionCategory: '业务',
    coopMode: '劳动合同-全日制', city: '成都市',
    company: '常乐健康（成都）有限公司', store: '成都春熙路店',
    templateName: '客户经理收入',
    effectiveStart: '2024-11-15 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P013', talentId: '844244899317452800', name: '曹娜娜', position: '客户经理',
    positionId: '1554317513916874754', positionCategory: '业务',
    coopMode: '劳动合同-全日制', city: '上海市',
    company: '常乐健康（上海）有限公司', store: '上海浦东店',
    templateName: '客户经理收入',
    effectiveStart: '2025-06-01 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P014', talentId: '581843801690083328', name: '李雪萍', position: '客户经理',
    positionId: '1554317513916874754', positionCategory: '业务',
    coopMode: '劳动合同-全日制', city: '深圳市',
    company: '常乐健康（深圳）有限公司', store: '深圳福田店',
    templateName: '客户经理收入',
    effectiveStart: '2025-09-01 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P015', talentId: '4266512070982656', name: '王玲', position: '客户经理',
    positionId: '1554317513916874754', positionCategory: '业务',
    coopMode: '劳动合同-全日制', city: '上海市',
    company: '常乐健康（上海）有限公司', store: '上海徐汇店',
    templateName: '客户经理收入',
    effectiveStart: '2025-04-10 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P010', talentId: 'T00705', name: '艳春', position: '调理师',
    positionId: '1555014418742325250', positionCategory: '业务',
    coopMode: '正常', city: '北京市',
    company: '-', store: '财富购物中心',
    templateName: '7月全日制推拿师超产值获豆',
    effectiveStart: '2026-08-02 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    sourceChangeId: null
  },
  // ====== 已确认异动对应的 active 旧记录（让自动步必然命中） ======
  {
    id: 'P016', talentId: '522721806595735552', name: '李雨微', position: '客户经理',
    positionId: '1554317513916874754', positionCategory: '业务',
    coopMode: '劳动合同-全日制', city: '深圳市',
    company: '常乐健康（深圳）有限公司', store: '深圳南山店',
    templateName: '客户经理收入',
    effectiveStart: '2025-01-01 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    sourceChangeId: null
  },
  {
    id: 'P017', talentId: '762624779915104256', name: '雷娟', position: '客户经理',
    positionId: '1554317513916874754', positionCategory: '业务',
    coopMode: '劳动合同-全日制', city: '深圳市',
    company: '常乐健康（深圳）有限公司', store: '深圳南山店',
    templateName: '客户经理收入',
    effectiveStart: '2024-09-01 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    sourceChangeId: null
  }
]

// 异动待处理（HR 人事模块按日汇入）
const initialChangeList = [
  {
    changeId: 'CHG-20260813-0001', talentId: '503295581121282048',
    name: '蔡云航', changeType: '换签主体', syncDate: '2026-08-13',
    oldCompany: '常乐健康（上海）有限公司', oldCoopMode: '劳动合同-全日制',
    oldPosition: '客户经理', oldStore: '上海徐汇店',
    oldEndTime: '2026-08-31 23:59:59',
    newCompany: '常乐健康（深圳）有限公司', newCoopMode: '劳动合同-全日制',
    newPosition: '客户经理', newStore: '深圳南山店',
    newStartTime: '2026-09-01 00:00:00',
    newEndTime: '2099-12-31 00:00:00',
    templateName: '', effectiveStart: '', effectiveEnd: '',
    status: '待确认'
  },
  {
    changeId: 'CHG-20260813-0002', talentId: '177656681587540377',
    name: '张宁', changeType: '换合作方式', syncDate: '2026-08-13',
    oldCompany: '常乐健康（成都）有限公司', oldCoopMode: '劳动合同-全日制',
    oldPosition: '客户经理', oldStore: '成都春熙路店',
    oldEndTime: '2026-08-25 23:59:59',
    newCompany: '常乐健康（成都）有限公司', newCoopMode: '劳动合同-非全日制',
    newPosition: '客户经理', newStore: '成都春熙路店',
    newStartTime: '2026-08-26 00:00:00',
    newEndTime: '2027-08-25 00:00:00',
    templateName: '', effectiveStart: '', effectiveEnd: '',
    status: '待确认'
  },
  {
    changeId: 'CHG-20260813-0003', talentId: '844244899317452800',
    name: '曹娜娜', changeType: '换岗位', syncDate: '2026-08-13',
    oldCompany: '常乐健康（上海）有限公司', oldCoopMode: '劳动合同-全日制',
    oldPosition: '客户经理', oldStore: '上海浦东店',
    oldEndTime: '2026-08-20 23:59:59',
    newCompany: '常乐健康（上海）有限公司', newCoopMode: '劳动合同-全日制',
    newPosition: '推拿师', newStore: '上海浦东店',
    newStartTime: '2026-08-21 00:00:00',
    newEndTime: '2099-12-31 00:00:00',
    templateName: '', effectiveStart: '', effectiveEnd: '',
    status: '待确认'
  },
  {
    changeId: 'CHG-20260813-0004', talentId: '581843801690083328',
    name: '李雪萍', changeType: '换签主体', syncDate: '2026-08-13',
    oldCompany: '常乐健康（深圳）有限公司', oldCoopMode: '劳动合同-全日制',
    oldPosition: '客户经理', oldStore: '深圳福田店',
    oldEndTime: '2026-08-29 23:59:59',
    newCompany: '常乐健康管理集团', newCoopMode: '劳动合同-全日制',
    newPosition: '客户经理', newStore: '总部',
    newStartTime: '2026-08-30 00:00:00',
    newEndTime: '2099-12-31 00:00:00',
    templateName: '', effectiveStart: '', effectiveEnd: '',
    status: '待确认'
  },
  {
    changeId: 'CHG-20260813-0005', talentId: '4266512070982656',
    name: '王玲', changeType: '换合作方式', syncDate: '2026-08-13',
    oldCompany: '常乐健康（上海）有限公司', oldCoopMode: '劳动合同-全日制',
    oldPosition: '客户经理', oldStore: '上海徐汇店',
    oldEndTime: '2026-08-18 23:59:59',
    newCompany: '合作主体', newCoopMode: '劳务合作-返聘',
    newPosition: '客户经理', newStore: '上海徐汇店',
    newStartTime: '2026-08-19 00:00:00',
    newEndTime: '2026-12-31 00:00:00',
    templateName: '', effectiveStart: '', effectiveEnd: '',
    status: '待确认'
  },
  {
    changeId: 'CHG-20260812-0008', talentId: '522721806595735552',
    name: '李雨微', changeType: '换签主体', syncDate: '2026-08-12',
    oldCompany: '常乐健康（深圳）有限公司', oldCoopMode: '劳动合同-全日制',
    oldPosition: '客户经理', oldStore: '深圳南山店',
    oldEndTime: '2026-08-31 23:59:59',
    newCompany: '常乐健康（成都）有限公司', newCoopMode: '劳动合同-全日制',
    newPosition: '客户经理', newStore: '成都春熙路店',
    newStartTime: '2026-09-01 00:00:00',
    templateName: '客户经理收入',
    effectiveStart: '2026-09-01 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    status: '已确认'
  },
  {
    changeId: 'CHG-20260811-0023', talentId: '762624779915104256',
    name: '雷娟', changeType: '换合作方式', syncDate: '2026-08-11',
    oldCompany: '常乐健康（深圳）有限公司', oldCoopMode: '劳动合同-全日制',
    oldPosition: '客户经理', oldStore: '深圳南山店',
    oldEndTime: '2026-08-14 23:59:59',
    newCompany: '常乐健康（深圳）有限公司', newCoopMode: '劳务合作-兼职',
    newPosition: '客户经理', newStore: '深圳南山店',
    newStartTime: '2026-08-15 00:00:00',
    templateName: '非全日制推拿师收入44',
    effectiveStart: '2026-08-15 00:00:00', effectiveEnd: '2099-12-31 00:00:00',
    status: '已确认'
  },
  // ===== 离职样例：业务上离职必然存在 active 旧记录，自动步必然命中（无未匹配示例） =====
  {
    changeId: 'CHG-20260813-0006', talentId: 'T00676',
    name: '张三', changeType: '离职', syncDate: '2026-08-13',
    oldCompany: '常乐健康（深圳）有限公司', oldCoopMode: '劳务合作-兼职',
    oldPosition: '推拿师', oldStore: '南山京基百纳',
    oldEndTime: '2026-08-31 23:59:59',
    templateName: '', effectiveStart: '', effectiveEnd: '',
    status: '已结束'
  }
]

// 岗位薪酬模板候选（name + position 用于按岗位筛选）
export const templateOptions = [
  { name: '客户经理收入', position: '客户经理' },
  { name: '全职推拿师模板', position: '推拿师' },
  { name: '非全日制推拿师收入40', position: '推拿师' },
  { name: '非全日制推拿师收入42', position: '推拿师' },
  { name: '非全日制推拿师收入44', position: '推拿师' },
  { name: '非日制推拿师收入44', position: '推拿师' },
  { name: '非全日制推拿师收入50', position: '推拿师' },
  { name: '全日制推拿师基础提成20模板', position: '推拿师' },
  { name: '全日制推拿师基础提成24模板', position: '推拿师' },
  { name: '7月全日制推拿师超产值获豆', position: '推拿师' },
  { name: '7月全日制推拿师超产值补贴', position: '推拿师' },
  { name: '非全日制推拿师收入40', position: '调理师' },
  { name: '非全日制推拿师收入42', position: '调理师' },
  { name: '非全日制推拿师收入44', position: '调理师' },
  { name: '非全日制推拿师收入50', position: '调理师' },
  { name: '非日制推拿师收入44', position: '调理师' },
  { name: '全日制推拿师基础提成20模板', position: '调理师' },
  { name: '全日制推拿师基础提成24模板', position: '调理师' },
  { name: '7月全日制推拿师超产值获豆', position: '调理师' },
  { name: '7月全日制推拿师超产值补贴', position: '调理师' },
  { name: '理疗师基础模板', position: '理疗师' },
  { name: '理疗师专项补贴', position: '理疗师' }
]

// 缓存扁平 name 列表（兼容按 name 检索）
export const templateNameList = templateOptions.map(t => t.name)

// 给定岗位，筛出可选模板（用于异动处理页按岗位过滤）
export const getTemplatesByPosition = (position) =>
  templateOptions.filter(t => t.position === position).map(t => t.name)

// 自动步：结束旧关系（无 UI 介入，既成事实）。
// 模块级函数：在异动进入列表时（初始化 / 按日汇入）自动执行；找不到匹配记录则 no-op。
function autoApplyEndOfOldRelation(change) {
  const activeRecord = planningList.value.find(r =>
    r.talentId === change.talentId &&
    r.company === change.oldCompany &&
    r.coopMode === change.oldCoopMode &&
    r.position === change.oldPosition &&
    r.effectiveEnd === '2099-12-31 00:00:00'
  )
  if (activeRecord) {
    activeRecord.effectiveEnd = change.oldEndTime
    change.inheritedFields = {
      positionId: activeRecord.positionId,
      positionCategory: activeRecord.positionCategory,
      city: activeRecord.city,
      store: activeRecord.store
    }
    change.oldRelationTruncated = true
    change.oldTruncatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  } else {
    change.inheritedFields = {}
    change.oldRelationTruncated = false
    // 业务上不该发生：HR 报过来的异动必能在规划里找到对应 active 旧记录。
    // 出现这条说明数据不一致，需要排查 HR / 规划两边数据是否脱钩。
    console.warn('[HR异动自动截尾] 未匹配到 active 旧记录，请排查:', change.changeId, change.name, {
      talentId: change.talentId, position: change.oldPosition, coopMode: change.oldCoopMode,
      company: change.oldCompany, store: change.oldStore, oldEndTime: change.oldEndTime
    })
  }
  return change.oldRelationTruncated
}

const planningList = ref([...initialPlanningList])
const changeList = ref([...initialChangeList])

// 模块初始化时，对所有异动自动应用"结束旧关系"。
// 截尾状态表达的是"HR 异动事实是否在本系统的【人员薪酬规划】里如实反映"——
// 跟异动是否已确认无关：已确认异动同样需要被截尾（流程结清不等于同步完成）。
// 业务上可能出现"未匹配"，那是 HR 数据和本系统规划数据不一致的边界态，应当显式呈现。
changeList.value
  .forEach(autoApplyEndOfOldRelation)

// 手动步：薪酬专员确认新关系

export function usePlanningRecords() {

  // 手动步：薪酬专员确认新关系（填模板 + 计算有效期）
  // 此处只 ADD 新记录，不再次截尾（旧关系已在自动步处理）
  const confirmNewRelation = (changeId, params) => {
    const change = changeList.value.find(c => c.changeId === changeId)
    if (!change || change.status !== '待确认') return false

    const effStart = params.effectiveStart || change.newStartTime
    // 优先用薪酬专员填的；否则用 HR 给的合同结束时间；最后兜底 2099-12-31
    const effEnd = params.effectiveEnd || change.newEndTime || '2099-12-31 00:00:00'
    const inherited = change.inheritedFields || {}

    planningList.value.push({
      id: 'P' + Date.now() + Math.floor(Math.random() * 1000),
      talentId: change.talentId,
      name: change.name,
      position: change.newPosition,
      positionId: inherited.positionId || '',
      positionCategory: inherited.positionCategory || '业务',
      coopMode: change.newCoopMode,
      city: inherited.city || '',
      company: change.newCompany,
      store: change.newStore || inherited.store || '',
      templateName: params.templateName,
      effectiveStart: effStart,
      effectiveEnd: effEnd,
      sourceChangeId: change.changeId
    })

    change.status = '已确认'
    change.templateName = params.templateName
    change.effectiveStart = effStart
    change.effectiveEnd = effEnd
    change.appliedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')

    return true
  }

  // 兼容旧名称（同步页用的就是这个名字）
  const applyChange = (changeId, params) => confirmNewRelation(changeId, params)

  const addPlanningRecord = (record) => {
    planningList.value.push({
      id: 'P' + Date.now() + Math.floor(Math.random() * 1000),
      sourceChangeId: null,
      ...record
    })
  }

  const simulateSync = () => {
    const today = new Date().toISOString().slice(0, 10)
    const baseId = 'CHG-' + today.replace(/-/g, '') + '-'
    const newRows = [
      {
        changeId: baseId + '9001', talentId: '900000000000000001',
        name: '新增人员A', changeType: '换签主体', syncDate: today,
        oldCompany: '常乐健康（上海）有限公司', oldCoopMode: '劳动合同-全日制',
        oldPosition: '调理师', oldStore: '上海徐汇店',
        oldEndTime: today + ' 23:59:59',
        newCompany: '常乐健康（深圳）有限公司', newCoopMode: '劳动合同-全日制',
        newPosition: '调理师', newStore: '深圳南山店',
        newStartTime: today + ' 00:00:00',
        newEndTime: '2099-12-31 00:00:00',
        templateName: '', effectiveStart: '', effectiveEnd: '',
        status: '待确认'
      },
      {
        changeId: baseId + '9002', talentId: '900000000000000002',
        name: '新增人员B', changeType: '换合作方式', syncDate: today,
        oldCompany: '常乐健康（成都）有限公司', oldCoopMode: '劳动合同-全日制',
        oldPosition: '客户经理', oldStore: '成都春熙路店',
        oldEndTime: today + ' 23:59:59',
        newCompany: '常乐健康（成都）有限公司', newCoopMode: '劳动合同-非全日制',
        newPosition: '客户经理', newStore: '成都春熙路店',
        newStartTime: today + ' 00:00:00',
        newEndTime: '2027-08-25 00:00:00',
        templateName: '', effectiveStart: '', effectiveEnd: '',
        status: '待确认'
      }
    ]
    // 自动步：每条新异动先自动结束旧关系
    newRows.forEach(autoApplyEndOfOldRelation)
    changeList.value.unshift(...newRows)
    return newRows.length
  }

  return {
    planningList,
    changeList,
    autoApplyEndOfOldRelation,
    confirmNewRelation,
    applyChange, // 兼容旧名 = confirmNewRelation
    addPlanningRecord,
    simulateSync
  }
}
