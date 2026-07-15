export const strategies = [
  {
    id: '1109493788878143489',
    name: '全职推拿师 v1/v2（营销折扣获豆+回头客补贴）',
    position: '推拿师',
    coopMode: '劳动合同-全日制',
    templateName: '全职推拿师模板',
    frequency: 'biweekly',
    slips: [
      { key: 's1', name: '工资单1', periodRule: 'day_1_15' },
      { key: 's2', name: '工资单2', periodRule: 'day_16_eom' }
    ],
    incomeGroupDefs: [
      { key: 'piecework', label: '计件提成' },
      { key: 'overtime', label: '加班工资' },
      { key: 'incentive', label: '激励补贴' },
      { key: 'tips', label: '打赏' }
    ],
    deductionGroupDefs: [
      { key: 'biz', label: '业务扣款' },
      { key: 'stat', label: '代扣代缴' }
    ]
  },
  {
    id: '1109493788878143500',
    name: '全职推拿师 v3（无豆无补贴）',
    position: '推拿师',
    coopMode: '劳动合同-全日制',
    templateName: '全职推拿师模板',
    frequency: 'biweekly',
    slips: [
      { key: 's1', name: '工资单1', periodRule: 'day_1_15' },
      { key: 's2', name: '工资单2', periodRule: 'day_16_eom' }
    ],
    incomeGroupDefs: [
      { key: 'piecework', label: '计件提成' },
      { key: 'overtime', label: '加班工资' },
      { key: 'incentive', label: '激励补贴' },
      { key: 'tips', label: '打赏' }
    ],
    deductionGroupDefs: [
      { key: 'biz', label: '业务扣款' },
      { key: 'stat', label: '代扣代缴' }
    ]
  },
  {
    id: '1109493788878143491',
    name: '非全日制推拿师（无豆）',
    position: '推拿师',
    coopMode: '非全日制劳动合同',
    templateName: '非全日制推拿师模板',
    frequency: 'weekly',
    slips: [
      { key: 'w1', name: '工资单1', periodRule: 'week_1' },
      { key: 'w2', name: '工资单2', periodRule: 'week_2' },
      { key: 'w3', name: '工资单3', periodRule: 'week_3' },
      { key: 'w4', name: '工资单4', periodRule: 'week_4' },
      { key: 'w5', name: '工资单5', periodRule: 'week_5' }
    ],
    incomeGroupDefs: [
      { key: 'base', label: '基础提成' },
      { key: 'overtime', label: '加班工资' }
    ],
    deductionGroupDefs: [
      { key: 'biz', label: '业务扣款' }
    ]
  },
  {
    id: '1109493788878143488',
    name: '兼职推拿师（无豆）',
    position: '推拿师',
    coopMode: '劳务合作-兼职',
    templateName: '兼职推拿师模板',
    frequency: 'per_order',
    slips: [
      { key: 'o1', name: '工资单1', periodRule: 'order_1' },
      { key: 'o2', name: '工资单2', periodRule: 'order_2' }
    ],
    incomeGroupDefs: [
      { key: 'piecework', label: '计件提成' }
    ],
    deductionGroupDefs: [
      { key: 'biz', label: '业务扣款' }
    ]
  },
  {
    id: '1109493788878143490',
    name: '全职客户经理',
    position: '客户经理',
    coopMode: '劳动合同-全日制',
    templateName: '全职客户经理模板',
    frequency: 'monthly',
    slips: [
      { key: 'm1', name: '工资单1', periodRule: 'full_month' }
    ],
    incomeGroupDefs: [
      { key: 'visit', label: '客次提成' },
      { key: 'overtime', label: '加班工资' },
      { key: 'incentive', label: '激励补贴' }
    ],
    deductionGroupDefs: [
      { key: 'biz', label: '业务扣款' },
      { key: 'stat', label: '代扣代缴' }
    ]
  },
  {
    id: '1109493788878143501',
    name: '总部其他全职',
    position: '总部职能',
    coopMode: '劳动合同-全日制',
    templateName: '全职总部岗位模板',
    frequency: 'monthly',
    slips: [
      { key: 'm1', name: '工资单1', periodRule: 'full_month' }
    ],
    incomeGroupDefs: [
      { key: 'base', label: '基本工资' },
      { key: 'allowance', label: '岗位津贴' }
    ],
    deductionGroupDefs: [
      { key: 'biz', label: '业务扣款' },
      { key: 'stat', label: '代扣代缴' }
    ]
  },
  {
    id: '1109493788878143502',
    name: '返聘推拿师（无豆无补贴）',
    position: '推拿师',
    coopMode: '劳务合作-返聘',
    templateName: '返聘推拿师模板',
    frequency: 'biweekly',
    slips: [
      { key: 's1', name: '工资单1', periodRule: 'day_1_15' },
      { key: 's2', name: '工资单2', periodRule: 'day_16_eom' }
    ],
    incomeGroupDefs: [
      { key: 'piecework', label: '计件提成' }
    ],
    deductionGroupDefs: [
      { key: 'biz', label: '业务扣款' }
    ]
  }
]
