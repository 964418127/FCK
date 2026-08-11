// 门店薪酬策略 mock 数据（纯前端原型 v2）
// 输入参数：策略声明，带自动编号（P001...），可自定义新增；编辑时只可改名称和说明
// 输出项：由规则区域命中的输出动态产生，不固定
// 规则条件：自由组合，引用输入参数

// 时段档位 / 日期类型 / 技法 / 项目 / 门店 仍作为维度常量供条件选择参考
export const TIME_SLOTS = [
  { value: '10:00-14:00', label: '10:00-14:00' },
  { value: '14:00-18:00', label: '14:00-18:00' },
  { value: '18:00-22:00', label: '18:00-22:00' }
]
export const DATE_TYPES = [
  { value: '工作日', label: '工作日' },
  { value: '周末', label: '周末' },
  { value: '节假日', label: '节假日' }
]
export const TECHNIQUES = [
  { value: '推拿', label: '推拿' },
  { value: '经络', label: '经络' },
  { value: '足疗', label: '足疗' },
  { value: '整脊', label: '整脊' }
]
export const PROJECTS = [
  { value: '脊柱调整60分钟', label: '脊柱调整60分钟' },
  { value: '骨盆·调整60分钟', label: '骨盆·调整60分钟' },
  { value: '中式推拿60分钟', label: '中式推拿60分钟' },
  { value: '足疗40分钟', label: '足疗40分钟' },
  { value: '头疗30分钟', label: '头疗30分钟' },
  { value: '运动拉伸60分钟', label: '运动拉伸60分钟' }
]
export const STORES = [
  { id: 'ST001', value: 'in99银泰中心店', label: 'in99银泰中心店' },
  { id: 'ST002', value: '春熙路旗舰店', label: '春熙路旗舰店' },
  { id: 'ST003', value: '万象城店', label: '万象城店' },
  { id: 'ST004', value: '天府三街店', label: '天府三街店' }
]
export const stores = STORES

export const CITIES = [
  { id: 'C001', value: '成都', label: '成都' },
  { id: 'C002', value: '重庆', label: '重庆' },
  { id: 'C003', value: '西安', label: '西安' }
]
export const cities = CITIES

// 人员筛选运算符
export const PERSON_FILTER_OPS = ['包含', '不包含', '等于', '不等于']

// 输入参数类型（薪酬项侧声明）
export const INPUT_PARAM_TYPES = [
  { value: 'number', label: '数字' },
  { value: 'string', label: '字符串' },
  { value: 'date', label: '日期' },
  { value: 'date-time', label: '日期+时间' },
  { value: 'time-range', label: '时段范围' }
]
export const INPUT_PARAM_TYPE_LABELS = INPUT_PARAM_TYPES.reduce((m, t) => (m[t.value] = t.label, m), {})

// 各参数类型的示例值（薪酬项侧展示）
export const INPUT_PARAM_SAMPLES = {
  number: '123',
  string: 'BC1212',
  date: '2026-07-15',
  'date-time': '2026-07-15 14:30',
  'time-range': '10:00-14:00'
}

// 按参数类型限定运算符
export const PARAM_TYPE_OPS = {
  number: ['等于', '不等于', '≥', '≤', '>', '<'],
  string: ['等于', '不等于', '包含', '不包含'],
  date: ['等于', '不等于', '≥', '≤', '>', '<'],
  'date-time': ['等于', '不等于', '≥', '≤', '>', '<'],
  'time-range': ['包含', '不包含'],
  enum: ['包含', '不包含', '等于', '不等于']
}

// 条件字段类型：决定条件值的选择器
// param 引用输入参数；enum 从维度常量取值；number 区间
export const CONDITION_FIELD_TYPES = ['输入参数', '枚举值', '数值区间']

// 规则条件可选的枚举维度（供条件值选择）
export const ENUM_DIMENSIONS = {
  '时段': TIME_SLOTS.map(t => t.value),
  '日期类型': DATE_TYPES.map(t => t.value),
  '技法': TECHNIQUES.map(t => t.value),
  '项目': PROJECTS.map(p => p.value),
  '门店': STORES.map(s => s.value),
  '日期范围': []  // 特殊维度：值为日期区间，用日期范围选择器
}

// 枚举维度的字段类型（用于规则区域字段列展示）
export const ENUM_DIM_TYPES = {
  '时段': 'time-range',
  '日期类型': 'enum',
  '技法': 'enum',
  '项目': 'enum',
  '门店': 'enum',
  '日期范围': 'date'
}

// 日期范围维度，值格式为 '起始~结束'，如 '2026-07-01~2026-07-31'
export const DATE_RANGE_DIMENSION = '日期范围'

export const storeSalaryStrategies = [
  {
    id: 'SS-001',
    name: '推拿师-非全日制-基础提成策略',
    position: '推拿师',
    coopMode: '非全日制劳动合同',
    personFilter: { conditions: [
      { field: '城市', op: '包含', value: '成都' },
      { field: '职级', op: '包含', value: '初级' }
    ] },
    effectiveDate: '2026-07-01',
    effectiveEndDate: '',
    status: '生效中',
    updateTime: '2026-07-15 10:20',
    // 输入参数：编号自动生成，编辑时只改名称和说明
    inputParams: [
      { id: 'P001', name: '实付金额', type: 'number', desc: '订单实付金额' },
      { id: 'P002', name: '回头客次数', type: 'number', desc: '该客户在当前门店的回头次数' },
      { id: 'P003', name: '门店编码', type: 'string', desc: '订单所属门店编码' },
      { id: 'P005', name: '订单日期', type: 'date', desc: '订单发生日期' },
      { id: 'P006', name: '下单时间', type: 'date-time', desc: '订单下单完整时间' },
      { id: 'P007', name: '服务时段', type: 'time-range', desc: '订单所属服务时段' }
    ],
    // 输出项：动态，由规则命中产出（这里预填示例，实际可由用户在规则区定义）
    // 规则：自由组合条件 + 每个输出项的公式
    rules: [
      {
        id: 'R001',
        conditions: [
          { param: '回头客次数', op: '≥', value: '3' },
          { param: '门店编码', op: '等于', value: 'in99银泰中心店' },
          { param: '订单日期', op: '≥', value: '2026-07-01' },
          { param: '下单时间', op: '≥', value: '2026-07-01 09:00' },
          { param: '服务时段', op: '包含', value: '18:00-22:00' },
          { dimension: '时段', op: '包含', value: ['18:00-22:00'] },
          { dimension: '日期类型', op: '包含', value: ['节假日'] },
          { dimension: '技法', op: '包含', value: ['推拿', '经络'] },
          { dimension: '项目', op: '包含', value: ['中式推拿60分钟'] },
          { dimension: '门店', op: '包含', value: ['ST001'] },
          { dimension: '日期范围', op: '包含', value: ['2026-07-01 ~ 2026-07-10', '2026-07-15 ~ 2026-07-20'] }
        ],
        returnValues: [{ key: '提成率', value: 15 }]
      },
      {
        id: 'R002',
        conditions: [
          { param: '回头客次数', op: '≥', value: '1' }
        ],
        returnValues: [{ key: '提成率', value: 12 }]
      },
      {
        id: 'R003',
        conditions: [
          { param: '回头客次数', op: '等于', value: '0' },
          { dimension: '时段', op: '包含', value: ['10:00-14:00'] }
        ],
        returnValues: [{ key: '提成率', value: 10 }]
      }
    ]
  },
  {
    id: 'SS-002',
    name: 'in99银泰中心店-推拿师非全提成策略',
    position: '推拿师',
    coopMode: '非全日制劳动合同',
    personFilter: { conditions: [
      { field: '门店', op: '等于', value: 'in99银泰中心店' }
    ] },
    effectiveDate: '2026-07-01',
    effectiveEndDate: '',
    status: '生效中',
    updateTime: '2026-07-16 14:30',
    inputParams: [
      { id: 'P001', name: '实付金额', type: 'number', desc: '订单实付金额' },
      { id: 'P002', name: '回头客次数', type: 'number', desc: '该客户在当前门店的回头次数' },
      { id: 'P003', name: '门店编码', type: 'string', desc: '订单所属门店编码' },
      { id: 'P004', name: '原价', type: 'number', desc: '订单原价' }
    ],
    rules: [
      {
        id: 'R001',
        conditions: [
          { param: '回头客次数', op: '≥', value: '3' },
          { dimension: '技法', op: '等于', value: '经络' },
          { dimension: '时段', op: '等于', value: '18:00-22:00' },
          { dimension: '日期类型', op: '等于', value: '节假日' }
        ],
        returnValues: [{ key: '提成率', value: 18 }]
      },
      {
        id: 'R002',
        conditions: [
          { param: '回头客次数', op: '≥', value: '2' },
          { dimension: '时段', op: '等于', value: '18:00-22:00' }
        ],
        returnValues: [{ key: '提成率', value: 14 }]
      },
      {
        id: 'R003',
        conditions: [
          { dimension: '时段', op: '等于', value: '10:00-14:00' },
          { dimension: '日期类型', op: '等于', value: '工作日' }
        ],
        returnValues: [{ key: '提成率', value: 11 }]
      }
    ]
  },
  {
    id: 'SS-003',
    name: '张三-in99银泰中心店-个人提成策略',
    position: '推拿师',
    coopMode: '非全日制劳动合同',
    personFilter: { conditions: [
      { field: '门店', op: '等于', value: 'in99银泰中心店' },
      { field: '员工', op: '等于', value: '张三（100235）' }
    ] },
    effectiveDate: '2026-07-10',
    effectiveEndDate: '',
    status: '生效中',
    updateTime: '2026-07-18 09:15',
    inputParams: [
      { id: 'P001', name: '实付金额', type: 'number', desc: '订单实付金额' },
      { id: 'P002', name: '回头客次数', type: 'number', desc: '该客户在当前门店的回头次数' },
      { id: 'P003', name: '门店编码', type: 'string', desc: '订单所属门店编码' }
    ],
    rules: [
      {
        id: 'R001',
        conditions: [
          { param: '回头客次数', op: '≥', value: '4' },
          { dimension: '技法', op: '等于', value: '推拿' },
          { dimension: '日期类型', op: '等于', value: '节假日' }
        ],
        returnValues: [{ key: '提成率', value: 20 }, { key: '补贴额', value: 5 }]
      },
      {
        id: 'R002',
        conditions: [
          { dimension: '技法', op: '等于', value: '推拿' },
          { dimension: '日期类型', op: '等于', value: '工作日' }
        ],
        returnValues: [{ key: '提成率', value: 12 }]
      }
    ]
  },
  {
    id: 'SS-004',
    name: '春熙路旗舰店-推拿师非全提成策略',
    position: '推拿师',
    coopMode: '非全日制劳动合同',
    personFilter: { conditions: [
      { field: '门店', op: '等于', value: '春熙路旗舰店' }
    ] },
    effectiveDate: '2026-07-01',
    effectiveEndDate: '',
    status: '草稿',
    updateTime: '2026-07-20 16:00',
    inputParams: [
      { id: 'P001', name: '实付金额', type: 'number', desc: '订单实付金额' },
      { id: 'P002', name: '回头客次数', type: 'number', desc: '该客户在当前门店的回头次数' }
    ],
    rules: [
      {
        id: 'R001',
        conditions: [
          { param: '回头客次数', op: '≥', value: '3' },
          { dimension: '时段', op: '等于', value: '18:00-22:00' }
        ],
        returnValues: [{ key: '提成率', value: 14 }]
      },
      {
        id: 'R002',
        conditions: [
          { param: '回头客次数', op: '等于', value: '0' },
          { dimension: '时段', op: '等于', value: '14:00-18:00' }
        ],
        returnValues: [{ key: '提成率', value: 10 }]
      }
    ]
  },
  {
    id: 'SS-005',
    name: '客户经理-非全日制-基础策略',
    position: '客户经理',
    coopMode: '非全日制劳动合同',
    personFilter: { conditions: [
      { field: '城市', op: '包含', value: '成都' },
      { field: '职级', op: '包含', value: '初级' }
    ] },
    effectiveDate: '2026-07-01',
    effectiveEndDate: '',
    status: '生效中',
    updateTime: '2026-07-12 11:40',
    inputParams: [
      { id: 'P001', name: '实付金额', type: 'number', desc: '订单实付金额' },
      { id: 'P002', name: '回头客次数', type: 'number', desc: '该客户回头次数' }
    ],
    rules: [
      {
        id: 'R001',
        conditions: [{ param: '回头客次数', op: '≥', value: '2' }],
        returnValues: [{ key: '提成率', value: 8 }]
      },
      {
        id: 'R002',
        conditions: [
          { param: '回头客次数', op: '等于', value: '0' },
          { dimension: '时段', op: '等于', value: '10:00-14:00' }
        ],
        returnValues: [{ key: '提成率', value: 6 }]
      }
    ]
  }
]



// AI 模拟生成数据源策略文案（自然语言描述，用于排班时查询对应日期/时段的政策）
// 汇总策略所有规则 -> 一段自然语言摘要，支持手动调整覆盖
export const generatePolicyText = (strategy) => {
  const rules = strategy.rules || []
  const parts = rules.map((rule) => {
    const conds = rule.conditions || []
    let condText

    if (!conds.length) {
      condText = '其余订单'
    } else {
      const items = conds.map(c => {
        const field = c.field || c.param || c.dimension || ''
        const op = c.op || ''
        const val = c.value || ''

        if (field === '回头客次数') return `回头客${val}次以上`
        if (field === '门店编码' || field === '门店') return `${val}门店`
        if (field === '时段') return `${val}时段`
        if (field === '日期类型') return val
        if (field === '技法') return `${val}项目`
        if (field === '项目') return val
        if (field === '日期范围') return `${val}期间`
        if (op === '≥') return `${field}≥${val}`
        if (op === '等于') return `${field}为${val}`
        return `${field}${op}${val}`
      })
      condText = items.join('、') + '的订单'
    }

    const rv = rule.returnValues || []
    let valueText
    if (!rv.length) {
      valueText = '无返回值'
    } else {
      valueText = '返回 ' + rv.map(v => `${v.key}=${v.value}`).join('、')
    }

    return `${condText}，${valueText}`
  })

  const name = strategy.name || '本策略'
  return `${name}：${parts.join('；')}。`
}

// 初始化：为所有策略生成默认政策文案
storeSalaryStrategies.forEach(s => {
  if (!s.policyText) s.policyText = generatePolicyText(s)
})
