/*
  排班策略 v5 · 数据与纯逻辑层
  设计依据：文档中心 → 人事中心 / 排班策略 → 五、需求范围（v3.7 三阶段：定义 / 获取 / 变化）
  四类事实：请假 / 顶班 / 换班 / 离职；名额是容量不是库存（N 不变，无回池）；
  求值 = 在已冻结的解上写事实 + 截短事实，每次重算留痕（解版本）。
*/

export const NOW = '2026-11-14 10:00'
export const TODAY = '2026-11-14'
export const WEEK_DATES = [
  '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'
]

export const SPACES5 = [
  { id: 'S-201', name: '蓝田店', city: '杭州', tag: '旗舰店', bizStart: '10:00', bizEnd: '22:00', xy: [0, 0] },
  { id: 'S-202', name: '滨江店', city: '杭州', tag: '社区店', bizStart: '10:00', bizEnd: '22:00', xy: [4.2, 1.8] },
  /* 坐标按城市分区（成都组整体 +50），否则「附近 N 公里」会把另一座城市的店也圈进来 */
  { id: 'S-203', name: '观澜店', city: '成都', tag: '标准店', bizStart: '11:00', bizEnd: '21:00', xy: [50, 50] },
  { id: 'S-204', name: '金牛店', city: '成都', tag: '社区店', bizStart: '11:00', bizEnd: '21:00', xy: [53.5, 52.2] },
  /* 兴隆湖店：把业务现行的四套策略原样配进同一个店（客经人数组合 / 推拿业务量 / 非全客经错峰 / 非全推拿签约÷2） */
  { id: 'S-205', name: '兴隆湖店', city: '成都', tag: '标准店', bizStart: '10:00', bizEnd: '22:00', xy: [51.6, 54.4],
    /* 类别 = 这一组时段共享同一条申领要求；规则里的「类」是「或」：类下任一条都算数 */
    categories: [{ id: 'A', name: 'A 类' }, { id: 'B', name: 'B 类' }] },
  /* 总部办公区：不是门店，是办公区——只有岗位和班次，没有营业高峰、没有抢单 */
  { id: 'S-206', name: '总部办公区', city: '杭州', tag: '办公区', bizStart: '09:30', bizEnd: '22:30', xy: [7.6, 5.4] }
]

/* 岗位字典：通用排班系统不写死某几个岗位，弹窗里从这里出 */
export const JOBS5 = ['推拿师', '客户经理', '店长', '前台', '保洁', '产品经理']

/* 人员属性标签：在职（默认，无标签）/ 试用 / 储备。
   档位的「谁」可以按标签圈人——业务上「储备客户经理缺口补位」「试用期不单独排」都靠它表达。
   口径：档位统一显式写「在职」= 正常上班的人（含试用），储备挡在外面（储备只在有缺时补，不参与获取）；
   要把储备放进来才显式改成「不限」。 */
export const TAGS5 = [
  { value: 'regular', label: '在职' },
  { value: 'probation', label: '试用' },
  { value: 'reserve', label: '储备' }
]

export const PEOPLE5 = [
  { id: 'E-107', name: '蓝田', spaceId: 'S-201', kind: 'fulltime', position: '推拿师', score: 86 },
  { id: 'E-113', name: '沈书', spaceId: 'S-201', kind: 'fulltime', position: '客户经理', score: 90 },
  { id: 'E-121', name: '阿禾', spaceId: 'S-201', kind: 'parttime', position: '推拿师', score: 78 },
  { id: 'E-126', name: '小满', spaceId: 'S-201', kind: 'parttime', position: '客户经理', score: 81 },
  { id: 'E-133', name: '陈晚', spaceId: 'S-202', kind: 'fulltime', position: '推拿师', score: 84 },
  { id: 'E-137', name: '石全', spaceId: 'S-201', kind: 'fulltime', position: '客户经理', score: 70 },
  { id: 'E-141', name: '周野', spaceId: 'S-202', kind: 'parttime', position: '推拿师', score: 75 },
  { id: 'E-150', name: '小唐', spaceId: 'S-203', kind: 'fulltime', position: '推拿师', score: 88 },
  { id: 'E-151', name: '阿橙', spaceId: 'S-203', kind: 'parttime', position: '客户经理', score: 79 },
  /* 兴隆湖店：3 在职 + 1 试用 + 1 储备的全职客经（3 人店形态：早/晚/中各 1 人），推拿 3，非全客经 3，非全推拿 4 */
  { id: 'E-201', name: '何川', spaceId: 'S-205', kind: 'fulltime', position: '客户经理', score: 88, tag: 'regular' },
  { id: 'E-202', name: '白露', spaceId: 'S-205', kind: 'fulltime', position: '客户经理', score: 82, tag: 'probation' },
  { id: 'E-203', name: '徐青', spaceId: 'S-205', kind: 'fulltime', position: '客户经理', score: 85, tag: 'regular' },
  { id: 'E-204', name: '岑岭', spaceId: 'S-205', kind: 'fulltime', position: '客户经理', score: 74, tag: 'reserve' },
  { id: 'E-205', name: '罗盘', spaceId: 'S-205', kind: 'fulltime', position: '推拿师', score: 90, tag: 'regular' },
  { id: 'E-206', name: '谷雨', spaceId: 'S-205', kind: 'fulltime', position: '推拿师', score: 86, tag: 'regular' },
  { id: 'E-207', name: '安然', spaceId: 'S-205', kind: 'fulltime', position: '推拿师', score: 80, tag: 'regular' },
  { id: 'E-208', name: '叶青', spaceId: 'S-205', kind: 'parttime', position: '客户经理', score: 80, tag: 'regular' },
  { id: 'E-209', name: '米朵', spaceId: 'S-205', kind: 'parttime', position: '客户经理', score: 78, tag: 'regular' },
  { id: 'E-210', name: '简宁', spaceId: 'S-205', kind: 'parttime', position: '客户经理', score: 76, tag: 'regular' },
  { id: 'E-211', name: '桃夭', spaceId: 'S-205', spaceIds: ['S-205', 'S-201'], kind: 'parttime', position: '推拿师', score: 82, tag: 'regular' },
  { id: 'E-212', name: '半夏', spaceId: 'S-205', kind: 'parttime', position: '推拿师', score: 79, tag: 'regular' },
  { id: 'E-213', name: '木木', spaceId: 'S-205', kind: 'parttime', position: '推拿师', score: 77, tag: 'regular' },
  { id: 'E-214', name: '星野', spaceId: 'S-205', kind: 'parttime', position: '推拿师', score: 75, tag: 'regular' },
  /* 总部办公区：产品经理 5 人，3 人白班 9:30–18:30、2 人晚班 14:00–22:30，按月排、排完直接分 */
  { id: 'E-301', name: '陆迟', spaceId: 'S-206', kind: 'fulltime', position: '产品经理', score: 90, tag: 'regular' },
  { id: 'E-302', name: '顾南', spaceId: 'S-206', kind: 'fulltime', position: '产品经理', score: 88, tag: 'regular' },
  { id: 'E-303', name: '时雨', spaceId: 'S-206', kind: 'fulltime', position: '产品经理', score: 86, tag: 'regular' },
  { id: 'E-304', name: '陶然', spaceId: 'S-206', kind: 'fulltime', position: '产品经理', score: 84, tag: 'regular' },
  { id: 'E-305', name: '谢临', spaceId: 'S-206', kind: 'fulltime', position: '产品经理', score: 82, tag: 'regular' },
  /* 非全产品经理：周末来顶晚班的人，名额要自己领（办公区唯一的获取段入口） */
  { id: 'E-306', name: '江遥', spaceId: 'S-206', kind: 'parttime', position: '产品经理', score: 76, tag: 'regular' }
]

/* 算法服务：只登记不实现。登记四门槛：输入可声明 / 算式可解释 / 可单独调用幂等 / 有版本号 */
export const SERVICES5 = [
  { id: 'AS-01', name: '按在岗人数', input: '人事在册状态', calc: '全员到岗基数 2 人，缺勤 1 人减 1', version: 'v1.3' },
  { id: 'AS-02', name: '按签约人数', input: '合作类型与签约数', calc: '签约非全 ÷ 2 向上取整', version: 'v1.0' },
  { id: 'AS-03', name: '按业务量', input: '业务系统预约量', calc: '每 6 单 1 人，最少 1', version: 'v2.1' }
]

/* 定义段：周期时段（归空间，不归岗位）。清单行 = 谁（范围+合作性质+岗位三个条件） · 方式 · 窗口 · 上限
   「谁」是圈人的搜索条件：{ scope: 'store'|'radius', km, kind: 'all'|'fulltime'|'parttime', pos: 'all'|'推拿师'|'客户经理' }
   范围默认本店；往外放用「附近 N 公里」（半径圈，含本店），不用「同城」这种粗旷说法 */
export const SLOTS5 = [
  {
    id: 'SL-01', spaceId: 'S-201', name: '早班', start: '10:00', end: '14:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'service', serviceId: 'AS-01' }, clamp: [1, 6], snapN: 3,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'fulltime', pos: 'all' }, way: 'direct', win: { base: 'publish', d: 0, t: '06:00' } },
      { k: 2, who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: 'all' }, way: 'grab', win: { base: 'week', dow: 5, t: '06:00' } },
      { k: 3, who: { tag: 'regular', scope: 'radius', km: 5, kind: 'all', pos: '推拿师' }, way: 'grab', win: { base: 'date', d: -1, t: '20:00' } }
    ]
  },
  {
    id: 'SL-02', spaceId: 'S-201', name: '晚班', start: '14:00', end: '22:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'manual', value: 2 }, clamp: [1, 6], snapN: 2,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'fulltime', pos: 'all' }, way: 'direct', win: { base: 'publish', d: 0, t: '06:00' } },
      { k: 2, who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: 'all' }, way: 'grab', win: { base: 'week', dow: 5, t: '06:00' } }
    ]
  },
  {
    id: 'SL-03', spaceId: 'S-201', name: '通班', start: '10:00', end: '22:00', days: [6, 0],
    quota: { source: 'manual', value: 2 }, clamp: [1, 6], snapN: 2,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'all', pos: 'all' }, way: 'apply', win: { base: 'publish', d: 0, t: '06:00' } }
    ]
  },
  {
    id: 'SL-04', spaceId: 'S-203', name: '晚市班', start: '17:00', end: '21:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'service', serviceId: 'AS-03' }, clamp: [1, 4], snapN: 2,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'all', pos: '推拿师' }, way: 'apply', win: { base: 'publish', d: 0, t: '06:00' } },
      { k: 2, who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: 'all' }, way: 'grab', win: { base: 'week', dow: 5, t: '06:00' } }
    ]
  },
  {
    id: 'SL-05', spaceId: 'S-203', name: '周末午市', start: '11:00', end: '15:00', days: [6, 0],
    quota: { source: 'manual', value: 3 }, clamp: [1, 4], snapN: 3,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'all', pos: 'all' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } }
    ]
  },
  {
    /* 收尾班次（兜底）：窗口排在同一天其他班次之后，直派到点执行——
       前面没排上班的人到这时还空着手，被它收进去；已排到班的时段重叠排不了 */
    id: 'SL-06', spaceId: 'S-201', name: '通班', start: '10:00', end: '22:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'manual', value: 2 }, clamp: [1, 6], snapN: 2,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'fulltime', pos: 'all' }, way: 'direct', win: { base: 'puboff', d: 2, t: '09:00' } }
    ]
  },

  /* ===================================================================
     兴隆湖店 S-205：业务现行四套策略原样落地（3 人店形态）
       ① 全职客户经理：人数组合 → 早 / 晚 / 中各 1 人；轮转直派在前，储备只在有缺时补
       ② 全职推拿师：业务量算名额 → 早 / 晚各 1 人；本店申领审核，同城先到先得在最后
       ③ 非全客户经理：时段需求固定名额 → 三档错峰累计开放
       ④ 非全推拿师：签约 4 人 ÷ 2 向上 = 2 → 必选·早 / 必选·晚 / 常规，仅本店非全先到先得
       名额来源写清：客经那 1 个位是人数组合给的，推拿那 1 个位是业务量给的，
       一条时段只有一个名额数，所以这里填合计（2），用每一档的「上限」把两个岗位的份切清楚。
     =================================================================== */

  /* 早班 10–18：客经 1（直派）+ 推拿 1（申领）= 2 */
  {
    id: 'SL-11', spaceId: 'S-205', name: '早班', start: '10:00', end: '18:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'manual', value: 2 }, clamp: [1, 6], snapN: 2,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'fulltime', tag: 'regular', pos: '客户经理' }, way: 'direct', win: { base: 'publish', d: 0, t: '06:00' }, cap: 1 },
      { k: 2, who: { tag: 'regular', scope: 'store', kind: 'fulltime', pos: '推拿师' }, way: 'apply', win: { base: 'publish', d: 0, t: '06:00' }, cap: 1 },
      { k: 3, who: { tag: 'regular', scope: 'radius', km: 5, kind: 'all', pos: '推拿师' }, way: 'grab', win: { base: 'date', d: -1, t: '06:00' }, cap: 1 }
    ]
  },
  /* 中班 12–20：推拿只排早/晚，中班只有客经 1 人 */
  {
    id: 'SL-12', spaceId: 'S-205', name: '中班', start: '12:00', end: '20:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'manual', value: 1 }, clamp: [1, 6], snapN: 1,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'fulltime', tag: 'regular', pos: '客户经理' }, way: 'direct', win: { base: 'publish', d: 0, t: '06:00' }, cap: 1 }
    ]
  },
  /* 晚班 14–22：客经 1（直派）+ 推拿 1（申领）= 2 */
  {
    id: 'SL-13', spaceId: 'S-205', name: '晚班', start: '14:00', end: '22:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'manual', value: 2 }, clamp: [1, 6], snapN: 2,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'fulltime', tag: 'regular', pos: '客户经理' }, way: 'direct', win: { base: 'publish', d: 0, t: '06:00' }, cap: 1 },
      { k: 2, who: { tag: 'regular', scope: 'store', kind: 'fulltime', pos: '推拿师' }, way: 'apply', win: { base: 'publish', d: 0, t: '06:00' }, cap: 1 },
      { k: 3, who: { tag: 'regular', scope: 'radius', km: 5, kind: 'all', pos: '推拿师' }, way: 'grab', win: { base: 'date', d: -1, t: '06:00' }, cap: 1 }
    ]
  },
  /* 通班 10–22：兜底——窗口排在早/中/晚之后，到点直派，收本店全职没排上的人 */
  {
    id: 'SL-14', spaceId: 'S-205', name: '通班', start: '10:00', end: '22:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'manual', value: 2 }, clamp: [1, 6], snapN: 2,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'fulltime', pos: 'all' }, way: 'direct', win: { base: 'puboff', d: 2, t: '09:00' } }
    ]
  },
  /* 非全客户经理的周期时段：门店提的时段需求，名额固定 3；三档错峰累计开放 */
  {
    id: 'SL-15', spaceId: 'S-205', name: '周期时段', start: '11:00', end: '15:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'manual', value: 3 }, clamp: [0, 6], snapN: 3,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: '客户经理' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } },
      { k: 2, who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: '推拿师' }, way: 'grab', win: { base: 'date', d: -3, t: '06:00' } },
      { k: 3, who: { tag: 'regular', scope: 'store', kind: 'fulltime', pos: '推拿师' }, way: 'grab', win: { base: 'date', d: -1, t: '06:00' } }
    ]
  },
  {
    id: 'SL-16', spaceId: 'S-205', name: '周期时段', start: '17:00', end: '21:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'manual', value: 3 }, clamp: [0, 6], snapN: 3,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: '客户经理' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } },
      { k: 2, who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: '推拿师' }, way: 'grab', win: { base: 'date', d: -3, t: '06:00' } },
      { k: 3, who: { tag: 'regular', scope: 'store', kind: 'fulltime', pos: '推拿师' }, way: 'grab', win: { base: 'date', d: -1, t: '06:00' } }
    ]
  },
  /* 非全推拿：签约 4 人 ÷ 2 向上 = 2 个位；仅本店非全推拿先到先得。
     时段本身不再叫「必选」——「至少要接几条 A 类」是人群上的规则（见 CLAIM_RULES5），
     类下任一条都算数，所以其中一条名额满了可以换同类的另一条。 */
  {
    id: 'SL-17', spaceId: 'S-205', name: '早班', category: 'A', start: '10:00', end: '14:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'service', serviceId: 'AS-02' }, clamp: [0, 4], snapN: 2,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: '推拿师' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } }
    ]
  },
  {
    id: 'SL-18', spaceId: 'S-205', name: '晚班', category: 'A', start: '18:00', end: '22:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'service', serviceId: 'AS-02' }, clamp: [0, 4], snapN: 2,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: '推拿师' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } }
    ]
  },
  {
    id: 'SL-19', spaceId: 'S-205', name: '常规', category: 'B', start: '14:00', end: '18:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'service', serviceId: 'AS-02' }, clamp: [0, 4], snapN: 2,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: '推拿师' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } }
    ]
  },

  /* ===================================================================
     总部办公区 S-206：产品经理 5 人，3 白 2 晚，按月排班，排完直接分
       · 名额按岗位人数 1:1 定：这个班要几个人就放几个名额，多一个不放（人工给定）
       · 获取方式只有一个：直派轮转——发布后系统按轮换次序把人分到白班和晚班，人只收通知
       · 白班 09:30–18:30 与晚班 14:00–22:30 中间重叠 4.5 小时：一个人同一天只能在一个班上，
         系统分人时按时间撞不撞来挡，所以 3 + 2 正好把这 5 个人分开
     =================================================================== */

  /* 白班 09:30–18:30：名额 3 */
  {
    id: 'SL-20', spaceId: 'S-206', name: '白班', start: '09:30', end: '18:30', days: [0, 1, 2, 3, 4, 5, 6],
    quota: { source: 'manual', value: 3 }, clamp: [1, 6], snapN: 3,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'fulltime', pos: '产品经理' }, way: 'direct', win: { base: 'publish', d: 0, t: '06:00' } }
    ]
  },
  /* 晚班 14:00–22:30：名额 2 */
  {
    id: 'SL-21', spaceId: 'S-206', name: '晚班', start: '14:00', end: '22:30', days: [0, 1, 2, 3, 4, 5, 6],
    quota: { source: 'manual', value: 2 }, clamp: [1, 6], snapN: 2,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'fulltime', pos: '产品经理' }, way: 'direct', win: { base: 'publish', d: 0, t: '06:00' } }
    ]
  },
  /* 周末晚班 14:00–22:30：留给非全的人来领，名额 1（跟上面那条晚班同一个钟点，靠人群分开） */
  {
    id: 'SL-22', spaceId: 'S-206', name: '晚班', start: '14:00', end: '22:30', days: [0, 6],
    quota: { source: 'manual', value: 1 }, clamp: [1, 3], snapN: 1,
    list: [
      { k: 1, who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: '产品经理' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } }
    ]
  }
]

/* 临时班次 = 特殊情况下新增名额，不进周期安排，改的是那一天的容量 */
export const TEMPS5 = [
  {
    id: 'TL-01', spaceId: 'S-201', date: '2026-11-21', name: '周六晚加场', start: '18:00', end: '22:00',
    quota: { source: 'manual', value: 2 }, snapN: 2,
    list: [{ k: 1, who: { tag: 'regular', scope: 'store', kind: 'all', pos: 'all' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } }]
  }
]

/* ===== 排班时段选择规则（业务口径：现在只有非全推拿师配了） =====
   一条规则 = 管谁（人群）+ 管哪一组时段（某个类 / 全部）+ 计量（条数 or 分钟）+ 下限上限。
   规则里的「类」是「或」：类下任一条都算数——所以 A 类某条名额满了，换同类的另一条照样满足。
   没有配规则的人 → 直接放行（空规则 ≠ 配了 0）。
   校验对象是「这个人这一天最终占到的班」，不是「他勾了什么」。 */
export const CLAIM_RULES5 = [
  {
    id: 'CR-01', spaceId: 'S-205', name: '非全推拿 · A 类每天至少 1',
    who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: '推拿师' },
    scope: { type: 'category', id: 'A' }, unit: 'count', min: 1, max: null
  },
  {
    id: 'CR-02', spaceId: 'S-205', name: '非全推拿 · 每天 6–9 小时',
    who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: '推拿师' },
    scope: { type: 'all' }, unit: 'minute', min: 360, max: 540
  }
]

/* ===== 非全工时额度：按门店各算一套（业务口径），只控周和月 =====
   日维度不设合规上限（业务现状），日的要求在规则里配（如每日 6–9 小时）。 */
export const HOUR_LIMITS5 = [
  { spaceId: 'S-205', kind: 'parttime', week: 24, month: 96 }
]

export const ROUND5 = {
  id: 'R-1112', publishedAt: '2026-11-12 06:00', span: ['2026-11-16', '2026-11-22'], k: 2,
  applyDeadline: '2026-11-15 20:00',
  /* 下一轮：配置改动到这时才生效 */
  nextAt: '2026-11-19 06:00', nextSpan: ['2026-11-23', '2026-11-29'],
  /*
    排班节奏：通用抽象，四个参数，不写死周/月枚举
    cycle  = 循环周期：锚点（自然周一起 / 自然月 1 号 / 业务自定义起点）+ 长度（n 天 / n 周 / n 月）
    every  = 多久发一次（每期 = 1，隔一期 = 2）
    偏移   = 都相对「周期起点」：负数=提前，发布与申领截止各一条
    现行口径：自然周 + 提前 4 天 06:00 发（周四）+ 提前 1 天 20:00 申领截止（周日）
  */
  config: {
    cycle: { anchor: 'monday', unit: 'week', n: 1, start: '' },
    every: 1,
    publishOffsetDays: -4,
    publishHour: 6,
    applyOffsetDays: -1,
    applyHour: 20
  }
}

/*
  总部办公区按月排：自然月 1 号起头，提前 4 天 06:00 发下个月，提前 1 天 20:00 截止。
  当前这一期是 11 月整月（10-28 发），下一期是 12 月（11-27 发）。
  节奏不同不代表机制不同——还是同一套「发布 → 窗口 → 截止」，只是周期长度换了。
*/
export const ROUND_OFFICE5 = {
  id: 'R-2611', publishedAt: '2026-10-28 06:00', span: ['2026-11-01', '2026-11-30'], k: 1,
  applyDeadline: '2026-10-31 20:00',
  nextAt: '2026-11-27 06:00', nextSpan: ['2026-12-01', '2026-12-31'],
  config: {
    cycle: { anchor: 'monthStart', unit: 'month', n: 1, start: '' },
    every: 1,
    publishOffsetDays: -4,
    publishHour: 6,
    applyOffsetDays: -1,
    applyHour: 20
  }
}

/* 按空间取轮：配了自己的节奏就用自己那份，没配的沿用门店的周节奏 */
export const ROUNDS5 = { 'S-206': ROUND_OFFICE5 }
export function roundOf(state, spaceId) {
  const bySpace = state?.rounds?.[spaceId]
  if (bySpace) return bySpace
  return state?.round || ROUND5
}
/* 这一轮铺到了哪些天：门店七天，办公区整月——从覆盖区间按自然日展开 */
export function datesOfRound5(round) {
  const out = []
  const d = new Date(`${(round || ROUND5).span[0]}T00:00:00`)
  const end = new Date(`${(round || ROUND5).span[1]}T00:00:00`)
  while (d <= end) {
    out.push(fmtDate(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}

/* 往后的第 N 个星期几（含当天） */
export function nextDow(fromDate, dow) {
  const d = new Date(`${fromDate}T00:00:00`)
  const add = (dow - d.getDay() + 7) % 7
  d.setDate(d.getDate() + add)
  return fmtDate(d)
}
export function addDays(date, n) {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + n)
  return fmtDate(d)
}

/* ===== 节奏计算：周期起点 / 终点 / 期号 / 下一轮预告 ===== */
const DAY_MS = 86400000
const at0 = s => new Date(`${s}T00:00:00`)
function blockDays(cycle) {
  return (cycle.unit === 'week' ? 7 : 1) * (cycle.n || 1)
}
/* 期号从哪一天起算：自然周从 2026-01-05（周一）、自然月从 2026-01、自定义从起点 */
function cycleBase(cycle) {
  if (cycle.anchor === 'monday') return '2026-01-05'
  if (cycle.anchor === 'monthStart') return '2026-01-01'
  return cycle.start
}
export function cycleStartOf(cycle, dateStr) {
  const dt = at0(dateStr)
  const base = at0(cycleBase(cycle))
  const n = cycle.n || 1
  if (cycle.unit === 'month') {
    /* 按月切块，但保留起点那天（自定义 26 日 – 次月 25 日这种） */
    const months = (dt.getFullYear() - base.getFullYear()) * 12 + (dt.getMonth() - base.getMonth())
    let k = Math.floor(months / n) * n
    let cand = monthAnchor(base, k)
    if (cand > dt) { k -= n; cand = monthAnchor(base, k) }
    return fmtDate(cand)
  }
  if (cycle.anchor === 'monday') {
    const dow = (dt.getDay() + 6) % 7 // 周一=0
    const mon = new Date(dt)
    mon.setDate(mon.getDate() - dow)
    if (n === 1) return fmtDate(mon)
    const len = blockDays(cycle)
    const k = Math.floor((mon - base) / (DAY_MS * len))
    return fmtDate(new Date(base.getTime() + k * DAY_MS * len))
  }
  const len = blockDays(cycle)
  const k = Math.floor((dt - base) / (DAY_MS * len))
  return fmtDate(new Date(base.getTime() + k * DAY_MS * len))
}
/* 第 k 个月的锚点日（31 日这种不存在的日子落到当月最后一天） */
function monthAnchor(base, k) {
  const y = base.getFullYear()
  const m = base.getMonth() + k
  const last = new Date(y, m + 1, 0).getDate()
  return new Date(y, m, Math.min(base.getDate(), last))
}
export function cycleEndOf(cycle, startStr) {
  const s = at0(startStr)
  if (cycle.unit === 'month') {
    const next = monthAnchor(s, cycle.n || 1)
    next.setDate(next.getDate() - 1)
    return fmtDate(next)
  }
  return fmtDate(new Date(s.getTime() + (blockDays(cycle) - 1) * DAY_MS))
}
export function cycleIndex(cycle, startStr) {
  const base = at0(cycleBase(cycle))
  if (cycle.unit === 'month') {
    const s = at0(startStr)
    return (s.getFullYear() - base.getFullYear()) * 12 + (s.getMonth() - base.getMonth())
  }
  return Math.round((at0(startStr) - base) / (DAY_MS * blockDays(cycle)))
}
function shiftCycle(cycle, startStr, k = 1) {
  const s = at0(startStr)
  if (cycle.unit === 'month') return fmtDate(monthAnchor(s, (cycle.n || 1) * k))
  return fmtDate(new Date(s.getTime() + blockDays(cycle) * k * DAY_MS))
}
/* 发布时刻相对周期起点算 */
export function publishAtOf(config, cycleStart) {
  const d = at0(cycleStart)
  d.setDate(d.getDate() + (config.publishOffsetDays || 0))
  return `${fmtDate(d)} ${String(config.publishHour ?? 6).padStart(2, '0')}:00`
}
export function applyDeadlineOf(config, cycleStart) {
  const d = at0(cycleStart)
  d.setDate(d.getDate() + (config.applyOffsetDays || 0))
  return `${fmtDate(d)} ${String(config.applyHour ?? 20).padStart(2, '0')}:00`
}
/* 下一个「会真正发布」的期：隔期发的期号跳过 */
export function nextRoundPlan(config, now = NOW) {
  let start = cycleStartOf(config.cycle, now.slice(0, 10))
  const every = config.every || 1
  for (let i = 0; i < 400; i++) {
    const pub = publishAtOf(config, start)
    if (pub >= now && cycleIndex(config.cycle, start) % every === 0) {
      return { nextAt: pub, nextSpan: [start, cycleEndOf(config.cycle, start)], cycleStart: start }
    }
    start = shiftCycle(config.cycle, start, 1)
  }
  return null
}

/* 按节奏配置重算「下一轮什么时候生成、铺哪一段」——改了节奏，预告立刻跟着变 */
export function recalcRound(state, spaceId = "") {
  const round = spaceId ? roundOf(state, spaceId) : state.round
  const plan = nextRoundPlan(round.config || ROUND5.config, state.now)
  if (plan) {
    round.nextAt = plan.nextAt
    round.nextSpan = plan.nextSpan
  }
  return round
}

/* 把配置层的申领规则 / 工时额度刷进这个空间的快照——判定跑的是快照，不是配置层。
   快照按空间各存一份（默认轮被多空间共用，快照不能挂在轮对象上）。 */
function applyRoundSnapshots5(state, spaceId) {
  state.ruleSnapshots = state.ruleSnapshots || {}
  state.ruleSnapshots[spaceId] = {
    rules: (state.claimRules || []).filter(r => r.spaceId === spaceId),
    hourLimits: (state.hourLimits || []).filter(l => l.spaceId === spaceId)
  }
}

/* 到点翻轮：过了 nextAt 就自动生成下一轮，新轮快照按当时的配置层刷——
   「改动下一轮生效」由这条机制兑现；轮自动跑，不拆业务按钮。 */
export function runDueRounds5(state, now = state.now) {
  const ownSpaces = new Set(Object.keys(state.rounds || {}))
  const allSpaces = new Set(['', ...state.slots.map(x => x.spaceId)])
  /* 主轮被多空间共用：翻主轮时，所有没有自己轮的空间快照都要刷 */
  const defaultSpaces = [...allSpaces].filter(id => !ownSpaces.has(id))
  ;[['', state.round, defaultSpaces], ...Object.entries(state.rounds || {}).map(([id, r]) => [id, r, [id]])]
    .forEach(([spaceId, round, refresh]) => {
      let guard = 0
      while (round.nextAt && String(now) >= round.nextAt && guard++ < 40) {
        const cfg = round.config || ROUND5.config
        const span = round.nextSpan
        round.id = 'R-' + span[0].slice(5).replace('-', '')
        round.k = (round.k || 1) + 1
        round.publishedAt = round.nextAt
        round.span = span
        round.applyDeadline = applyDeadlineOf(cfg, span[0])
        refresh.forEach(id => applyRoundSnapshots5(state, id))
        recalcRound(state, spaceId)
      }
    })
  return state
}

const P = (id, slotId, date, personId, way, extra = {}) => ({
  id, slotId, date, personId, way, status: 'active', at: '2026-11-12 06:00', history: [], ...extra
})

/* 获取段结果（解的基线，v1 于发布时生成） */
export const PLACEMENTS5 = [
  P('P-01', 'SL-01', '2026-11-16', 'E-113', '直派 · 第1档'),
  P('P-03', 'SL-01', '2026-11-16', 'E-133', '抢 · 第3档'),
  P('P-04', 'SL-01', '2026-11-17', 'E-113', '直派 · 第1档'),
  P('P-05', 'SL-01', '2026-11-17', 'E-107', '直派 · 第1档', {
    status: 'covered', coveredAt: '2026-11-13 09:12',
    history: [{ note: '2026-11-13 09:12 蓝田提交请假，11-17 早班由陈晚顶上' }]
  }),
  P('P-06', 'SL-01', '2026-11-17', 'E-133', '顶班 · 补位', { fromFact: 'F-01' }),
  P('P-07', 'SL-01', '2026-11-17', 'E-126', '抢 · 第2档'),
  P('P-08', 'SL-01', '2026-11-18', 'E-113', '直派 · 第1档'),
  P('P-09', 'SL-01', '2026-11-18', 'E-107', '直派 · 第1档'),
  P('P-10', 'SL-01', '2026-11-19', 'E-107', '直派 · 第1档'),
  P('P-11', 'SL-01', '2026-11-19', 'E-126', '抢 · 第2档'),
  P('P-12', 'SL-01', '2026-11-20', 'E-113', '直派 · 第1档'),
  P('P-13', 'SL-01', '2026-11-20', 'E-107', '直派 · 第1档'),
  P('P-14', 'SL-02', '2026-11-16', 'E-107', '直派 · 第1档'),
  P('P-15', 'SL-02', '2026-11-16', 'E-121', '抢 · 第2档'),
  P('P-16', 'SL-02', '2026-11-17', 'E-107', '直派 · 第1档'),
  P('P-17', 'SL-02', '2026-11-17', 'E-121', '抢 · 第2档'),
  P('P-18', 'SL-02', '2026-11-18', 'E-107', '直派 · 第1档'),
  P('P-19', 'SL-02', '2026-11-18', 'E-121', '抢 · 第2档'),
  P('P-20', 'SL-02', '2026-11-19', 'E-107', '直派 · 第1档'),
  P('P-21', 'SL-02', '2026-11-19', 'E-121', '抢 · 第2档'),
  P('P-22', 'SL-02', '2026-11-20', 'E-107', '直派 · 第1档'),
  P('P-23', 'SL-02', '2026-11-20', 'E-121', '抢 · 第2档')
]

/*
  兴隆湖店：整周铺满，用来验业务现行四套规则
  客经的直派位、通班的兜底位由 runDueDirect5 到点生成（不写死在这里，否则看不出「到点才分人」）；
  这里只放申领排上的、和非全自己抢到的。
*/
WEEK_DATES.slice(0, 5).forEach((d, i) => {
  const rows = [
    ['SL-11', 'E-205', '申领 · 排上（综合分90）'],   // 全职推拿 · 早班申领排上
    ['SL-13', 'E-206', '申领 · 排上（综合分86）'],   // 全职推拿 · 晚班申领排上
    ['SL-15', 'E-208', '抢 · 第1档'],               // 非全客经 · 午段
    ['SL-15', 'E-209', '抢 · 第1档'],
    ['SL-16', 'E-210', '抢 · 第1档'],               // 非全客经 · 晚段
    ['SL-17', 'E-211', '抢 · 第1档'],               // 非全推拿 · 必选早（签约 4÷2=2 个位）
    ['SL-17', 'E-212', '抢 · 第1档'],
    ['SL-18', 'E-213', '抢 · 第1档'],               // 非全推拿 · 必选晚
    ['SL-18', 'E-214', '抢 · 第1档']
  ]
  rows.forEach(([slotId, personId, way], j) => {
    PLACEMENTS5.push(P(`P-XL${i}-${j}`, slotId, d, personId, way))
  })
})

/* 申领登记：提交只登记，截止后按综合分排序截断 */
export const APPLICATIONS5 = [
  { id: 'A-01', slotId: 'SL-03', date: '2026-11-21', personId: 'E-107', at: '2026-11-12 08:10' },
  { id: 'A-02', slotId: 'SL-03', date: '2026-11-21', personId: 'E-121', at: '2026-11-12 09:02' },
  { id: 'A-03', slotId: 'SL-03', date: '2026-11-21', personId: 'E-126', at: '2026-11-12 11:40' }
]

/* 变化段：事实清单 */
export const FACTS5 = [
  { id: 'F-01', type: '请假', at: '2026-11-13 09:12', by: 'E-107', slotId: 'SL-01', date: '2026-11-17',
    result: '班次由陈晚顶上（补位）', placements: ['P-05', 'P-06'] },
  { id: 'F-02', type: '请假', at: '2026-11-14 09:30', by: 'E-107', slotId: 'SL-01', date: '2026-11-19', start: '10:00', end: '11:00',
    result: '只占 10:00–11:00，剩余时间不动；少的时间要不要补人待业务拍板', placements: [] }
]

export const VERSIONS5 = [
  { v: 1, at: '2026-11-12 06:00', note: '第 R-1112 轮发布，生成基线解', facts: [] },
  { v: 2, at: '2026-11-13 09:12', note: '事实 F-01（请假）重算：11-17 早班由陈晚顶上', facts: ['F-01'] },
  { v: 3, at: '2026-11-14 09:30', note: '事实 F-02（请假 1 小时）重算：只占一段，剩余时间不动', facts: ['F-02'] }
]

export const NOTICES5 = [
  { id: 'N-01', to: 'E-133', kind: 'makeup', acked: false, date: '2026-11-17', at: '2026-11-13 09:12',
    text: '补位通知：11-17 早班 10:00-14:00（蓝田店）需要你顶上',
    detail: '蓝田 11-13 09:12 提交请假；你是附近 5km 推拿师档里当时有空、没冲突的人' }
]

/* 演示用：一条还没答复的换班请求（罗盘拿 11-16 早班换谷雨 11-17 晚班） */
export const SWAP_REQUESTS5 = [
  { id: 'SR-01', from: 'E-205', to: 'E-206', placementId: 'P-XL0-0', partnerPlacementId: 'P-XL1-1',
    at: '2026-11-14 21:10', status: 'pending' }
]

/* ===== 纯逻辑 ===== */

export function slotById(state, id) {
  return state.slots.find(s => s.id === id) || state.temps.find(s => s.id === id)
}
export function personById(state, id) {
  return state.people.find(p => p.id === id)
}
export function spaceById(state, id) {
  return state.spaces.find(s => s.id === id)
}
/*
  名额快照：默认取时段模板上的 N；
  某一天被单独调过（人事在这一天加减人），就取这一天的数——只影响那一天，不动模板。
*/
export function snapN5(state, slotId, date = '') {
  const s = slotById(state, slotId)
  if (!s) return 0
  const k = `${slotId}|${date}`
  if (date && state.dayQuota && state.dayQuota[k] != null) return state.dayQuota[k]
  return s.snapN
}
export function activeCount5(state, slotId, date) {
  return state.placements.filter(p => p.slotId === slotId && p.date === date && p.status === 'active').length
}
export function slotsOn5(state, date) {
  const dow = new Date(`${date}T00:00:00`).getDay()
  return [...state.slots.filter(s => s.days.includes(dow)), ...state.temps.filter(t => t.date === date)]
}

/*
  天级复制/覆盖：把一天配好的班次照搬（覆盖）到其他天。
  同名同起止才算同一个班次；源天有、目标天没有 → 目标天加上；源天没有、目标天有 → 从目标天移出。
  模板按星期几定义，所以复制按星期几生效——影响每周的同一天，不只是那一格日期。
*/
function sameSlotDef(a, b) { return a.name === b.name && a.start === b.start && a.end === b.end }
export function dayCopyPlan5(slots, srcDow, targetDows) {
  const srcDefs = slots.filter(s => s.days.includes(srcDow))
  const adds = [], removes = []
  for (const t of targetDows) {
    for (const s of slots) {
      const inSrc = srcDefs.some(x => sameSlotDef(x, s))
      const inTgt = s.days.includes(t)
      const label = `${s.name} ${s.start}–${s.end}`
      if (inSrc && !inTgt) adds.push({ name: label, dow: t })
      if (!inSrc && inTgt) removes.push({ name: label, dow: t })
    }
  }
  return { adds, removes }
}
export function applyDayCopy5(slots, srcDow, targetDows) {
  const srcDefs = slots.filter(s => s.days.includes(srcDow))
  for (const t of targetDows) {
    for (const s of slots) {
      const inSrc = srcDefs.some(x => sameSlotDef(x, s))
      const has = s.days.includes(t)
      if (inSrc && !has) s.days = [...s.days, t].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
      if (!inSrc && has) s.days = s.days.filter(d => d !== t)
    }
  }
}

/*
  清单行的「谁」：范围（本店/附近 N 公里）+ 合作性质（不限/全职/非全）+ 人员标签（不限/在职/试用/储备）+ 岗位
  条件组合圈人，不写在时段上——「一个时段 A 岗位先挑、B 岗位隔一会儿加入」能成立的前提。
  范围半径按门店坐标算（含本店）。
*/
export function whoLabel5(who) {
  if (!who) return ''
  if (typeof who === 'string') return who // 兼容旧字符串口径
  const scope = who.scope === 'radius' ? `附近 ${who.km}km` : '本店'
  const kind = who.kind === 'fulltime' ? '全职' : who.kind === 'parttime' ? '非全' : ''
  const tag = who.tag === 'reserve' ? '储备' : who.tag === 'probation' ? '试用' : who.tag === 'regular' ? '在职' : ''
  const pos = who.pos && who.pos !== 'all' ? who.pos : ''
  const body = [kind, tag, pos].filter(Boolean)
  if (!body.length) return scope === '本店' ? '本店全员' : `${scope}全员`
  return [scope, ...body].join(' · ')
}
export function matchWho5(state, person, slot, who) {
  if (!person || !slot) return false
  if (typeof who === 'string') who = { scope: who.startsWith('同城') ? 'radius' : 'store', km: 999, kind: 'all', pos: who.includes('推拿师') ? '推拿师' : who.includes('客户经理') ? '客户经理' : who.includes('全职') ? 'fulltime' : who.includes('非全') ? 'parttime' : 'all' }
  const space = spaceById(state, slot.spaceId)
  const personSpace = spaceById(state, person.spaceId)
  if (who.scope === 'store') {
    /* 本店 = 签约集合里有这家店（非全可签多店；spaceId 是主店，spaceIds 是全部签约店） */
    const signed = person.spaceIds && person.spaceIds.length ? person.spaceIds : [person.spaceId]
    if (!signed.includes(slot.spaceId)) return false
  } else {
    const dist = Math.hypot(space.xy[0] - personSpace.xy[0], space.xy[1] - personSpace.xy[1])
    if (dist > (who.km || 0)) return false
  }
  if (who.kind && who.kind !== 'all' && person.kind !== who.kind) return false
  /* 人员标签：在职（默认，含试用期）/ 试用 / 储备。
     选「在职」= 正常上班的人（含试用），把储备挡在外面；储备只在有缺时才补（缺口响应，排班不做） */
  if (who.tag && who.tag !== 'all') {
    const t = person.tag || 'regular'
    if (who.tag === 'regular') { if (t === 'reserve') return false }
    else if (t !== who.tag) return false
  }
  if (who.pos && who.pos !== 'all' && person.position !== who.pos) return false
  return true
}

/* 开放窗口 = 锚点 + 偏移。锚点：publish=发布时刻 / week=发布后的某个星期几 / date=开班日；
   配置里只存锚点和偏移，展示一律落成具体日期时间（windowLabel5） */
export function normWin5(w) {
  if (typeof w === 'string') {
    if (w === 'fri0600') return { base: 'week', dow: 5, t: '06:00' }
    if (w === 'day1') return { base: 'date', d: -1, t: '20:00' }
    return { base: 'publish', d: 0, t: '06:00' }
  }
  return { d: 0, dow: 1, t: '06:00', ...w }
}
/* 档位挂的时段在这一轮的第一天（开班日相对的窗口用它落具体日期） */
export function slotFirstDate5(slot) {
  if (slot?.date) return slot.date
  return WEEK_DATES.find(d => slot?.days?.includes(new Date(`${d}T00:00:00`).getDay())) || WEEK_DATES[0]
}
/* 窗口开放时刻：按当前轮推算成具体时间 */
export function openAt5(row, round, date = null) {
  const R = round || ROUND5
  const w = normWin5(row.win)
  const pub = R.publishedAt
  if (w.base === 'publish') {
    if (!w.d) return pub
    const d0 = new Date(`${pub.slice(0, 10)}T00:00:00`)
    d0.setDate(d0.getDate() + w.d)
    return `${fmtDate(d0)} ${w.t}`
  }
  /* 发布后推（含 0 天）：落在发布日 + d 天的 t 点；不早于发布时刻，早了就取发布时刻 */
  if (w.base === 'puboff') {
    const d0 = new Date(`${pub.slice(0, 10)}T00:00:00`)
    d0.setDate(d0.getDate() + (w.d || 0))
    const at = `${fmtDate(d0)} ${w.t}`
    return at < pub ? pub : at
  }
  if (w.base === 'week') return `${nextDow(pub.slice(0, 10), w.dow)} ${w.t}`
  if (!date) return null
  const d0 = new Date(`${date}T00:00:00`)
  d0.setDate(d0.getDate() + (w.d || 0))
  return `${fmtDate(d0)} ${w.t}`
}
export function windowOpen5(row, date, now = NOW, round = null) {
  const at = openAt5(row, round, date)
  return at ? now >= at : false
}
/* 展示成用户可读的具体日期时间：给 date 按那天算，给 slot 取这一轮第一天 */
export function windowLabel5(row, slot = null, date = null, round = null) {
  const R = round || ROUND5
  const w = normWin5(row.win)
  const at = openAt5(row, R, date || (slot ? slotFirstDate5(slot) : null))
  const short = at ? at.slice(5, 16) : ''
  if (w.base === 'publish' && !w.d) return `发布即开（${short}）`
  if (w.base === 'publish') return `${short} 开（发布后 ${w.d} 天）`
  if (w.base === 'puboff') {
    const clamped = w.d === 0 && w.t <= R.publishedAt.slice(11)
    return `${short} 开（发布后推 ${w.d || 0} 天${clamped ? '，不早于发布，取发布时刻' : ''}）`
  }
  if (w.base === 'week') return `${short} 开（发布后的周${'日一二三四五六'[w.dow]}）`
  const rel = w.d === 0 ? '开班当天' : w.d < 0 ? `开班前 ${-w.d} 天` : `开班后 ${w.d} 天`
  return `${short} 开（${rel}）`
}

export function gateLabel5(row, slot, round = null) {
  if (row.way === 'direct') return '到点直派，不用抢'
  if (row.way === 'apply') return `截止 ${(round || ROUND5).applyDeadline} · 按综合分排序截断`
  return `开班（${slot.start}）即关闸`
}

/* 时段重叠冲突（首尾相接可以） */
export function overlap5(aS, aE, bS, bE) {
  return aS < bE && bS < aE
}
export function hours5(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em - (sh * 60 + sm)) / 60
}
export function personBusy5(state, personId, date, start, end, exceptId = null) {
  return state.placements.some(p => p.personId === personId && p.date === date && p.status === 'active'
    && p.id !== exceptId && overlap5(start, end, slotById(state, p.slotId).start, slotById(state, p.slotId).end))
}
/* 工时不由排班判断——排班只负责记下这一个班是几点到几点。
   业务口径：非全一店一天 4 小时、一店一周 24 小时；全职正常上班 8 小时，超出部分计加班。
   能不能接、多少算正常上班、多少算加班，由获取端背后的服务与薪酬侧判定，排班这里不算、也不拦。 */
export function worktimeOk5() {
  return { ok: true, overtime: false }
}
/* 这一个班有多长（小时）—— 排班只提供这个数，怎么解读是别人的事 */
export function shiftHours5(start, end) {
  return hours5(start, end)
}

/* ===== 排班时段选择规则：判定 =====
   校验对象是「这个人这天最终占到的班」（占位表里的），不是「他勾了什么」。
   命中规则才校验；没配规则的人直接放行。 */
function fmtDate5(dt) {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}
/* 自然周：周一到周日 */
export function weekRange5(date) {
  const [y, m, d] = date.split('-').map(Number)
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7
  return [fmtDate5(new Date(y, m - 1, d - dow)), fmtDate5(new Date(y, m - 1, d - dow + 6))]
}
/* 自然月 */
export function monthRange5(date) {
  const [y, m] = date.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return [`${date.slice(0, 7)}-01`, `${date.slice(0, 7)}-${String(last).padStart(2, '0')}`]
}
export function categoriesOf5(space) { return space?.categories || [] }
export function catName5(space, id) { return (categoriesOf5(space).find(c => c.id === id) || {}).name || '' }
function minutesOfSlot5(slot) { return Math.round(hours5(slot.start, slot.end) * 60) }

/* 已占合计：只认占位表里状态为 active 的；按「人 × 空间（门店）× 日期区间」算 */
export function usedMinutes5(state, personId, spaceId, from, to) {
  return state.placements
    .filter(p => p.personId === personId && p.status === 'active'
      && p.date >= from && p.date <= to
      && slotById(state, p.slotId)?.spaceId === spaceId)
    .reduce((s, p) => s + minutesOfSlot5(slotById(state, p.slotId)), 0)
}
/* 这个人这天在这家店占到的班 */
export function claimedSlots5(state, personId, spaceId, date) {
  return state.placements
    .filter(p => p.personId === personId && p.status === 'active' && p.date === date)
    .map(p => slotById(state, p.slotId))
    .filter(s => s && s.spaceId === spaceId)
}
/* 命中的规则：规则的人群圈到这个人 */
export function claimRulesOf5(state, spaceId, person) {
  return (state.claimRules || []).filter(r => r.spaceId === spaceId && matchWho5(state, person, { spaceId }, r.who))
}
/* 判一次：规则逐条 + 周/月额度。items 里带「差什么」，好直接给人看 */
export function claimCheck5(state, spaceId, personId, date, opts = {}) {
  const person = personById(state, personId)
  /* 正式判定按这一轮的快照（改动下一轮生效）；试算按刚改过的配置层 */
  const snap = (state.ruleSnapshots || {})[spaceId]
  const pool = opts.config ? (state.claimRules || []) : (snap?.rules || state.claimRules || [])
  const limitPool = opts.config ? (state.hourLimits || []) : (snap?.hourLimits || state.hourLimits || [])
  const rules = pool.filter(r => r.spaceId === spaceId && matchWho5(state, person, { spaceId }, r.who))
  const got = claimedSlots5(state, personId, spaceId, date)
  const dayUsed = got.reduce((s, sl) => s + minutesOfSlot5(sl), 0)
  const items = rules.map(r => {
    if (r.unit === 'count') {
      const hit = got.filter(sl => r.scope.type === 'all' || sl.category === r.scope.id)
      const ok = hit.length >= (r.min || 0) && (!r.max || hit.length <= r.max)
      const need = [r.min ? `至少 ${r.min} 条` : '', r.max ? `至多 ${r.max} 条` : ''].filter(Boolean).join(' · ')
      return { id: r.id, name: r.name, actual: `${hit.length} 条`, need, ok }
    }
    const ok = dayUsed >= (r.min || 0) && (!r.max || dayUsed <= r.max)
    const need = r.min && r.max ? `${r.min}–${r.max} 分钟` : r.min ? `至少 ${r.min} 分钟` : `至多 ${r.max} 分钟`
    return { id: r.id, name: r.name, actual: `${dayUsed} 分钟`, need, ok }
  })
  const lim = limitPool.find(l => l.spaceId === spaceId && l.kind === person?.kind)
  let limits = []
  if (lim) {
    const [ws, we] = weekRange5(date)
    const [ms, me] = monthRange5(date)
    const wUsed = usedMinutes5(state, personId, spaceId, ws, we)
    const mUsed = usedMinutes5(state, personId, spaceId, ms, me)
    limits = [
      { name: '本周额度', used: Math.round(wUsed / 60 * 10) / 10, cap: lim.week, ok: wUsed <= lim.week * 60 },
      { name: '本月额度', used: Math.round(mUsed / 60 * 10) / 10, cap: lim.month, ok: mUsed <= lim.month * 60 }
    ]
  }
  return {
    hasRule: rules.length > 0, rules, dayUsed, got,
    items, limits,
    ok: items.every(i => i.ok) && limits.every(l => l.ok)
  }
}

/* 单条动作前能预判的门：接了这条会不会超（上限可预判，下限不行——集合的事，见 6.2.3 文档）
   只拦「超」，不拦「还差」；读的是这一轮的快照。 */
export function claimGate5(state, slotId, date, personId) {
  const slot = slotById(state, slotId)
  const person = personById(state, personId)
  const snap = (state.ruleSnapshots || {})[slot.spaceId]
  const rules = (snap?.rules || state.claimRules || [])
    .filter(r => matchWho5(state, person, { spaceId: slot.spaceId }, r.who))
    .filter(r => r.scope.type === 'all' || r.scope.id === slot.category)
  const own = minutesOfSlot5(slot)
  for (const r of rules) {
    if (r.unit !== 'minute' || !r.max) continue
    const got = claimedSlots5(state, personId, slot.spaceId, date)
      .filter(sl => r.scope.type === 'all' || sl.category === r.scope.id)
    const total = got.reduce((sum, sl) => sum + minutesOfSlot5(sl), 0) + own
    if (total > r.max) {
      return { ok: false, reason: `接了这条今天合计 ${Math.round(total / 6) / 10} 小时，超过每天 ${Math.round(r.max / 60)} 小时上限` }
    }
  }
  const lim = (snap?.hourLimits || state.hourLimits || []).find(l => l.kind === person?.kind)
  if (lim) {
    const [ws, we] = weekRange5(date)
    const [ms, me] = monthRange5(date)
    const wUsed = usedMinutes5(state, personId, slot.spaceId, ws, we) + own
    if (wUsed > lim.week * 60) return { ok: false, reason: `本周非全工时上限 ${lim.week} 小时已满` }
    const mUsed = usedMinutes5(state, personId, slot.spaceId, ms, me) + own
    if (mUsed > lim.month * 60) return { ok: false, reason: `本月工时上限 ${lim.month} 小时已到` }
  }
  return { ok: true }
}

/* 可获取清单：窗口已开、关闸未到、人群匹配、还有空位 */
export function openOffers5(state, personId, now = NOW) {
  const person = personById(state, personId)
  const out = []
  const all = [...state.slots, ...state.temps]
  all.forEach(slot => {
    WEEK_DATES.filter(d => slotsOn5(state, d).some(s => s.id === slot.id) || slot.date === d)
      .forEach(date => {
        slot.list.forEach(row => {
          if (!matchWho5(state, person, slot, row.who)) return
          if (row.way === 'direct') return
          if (!windowOpen5(row, date, now, roundOf(state, slot.spaceId))) return
          if (row.way === 'grab' && now >= `${date}T${slot.start}:00`.replace('T', ' ')) return
          if (state.placements.some(p => p.slotId === slot.id && p.date === date && p.personId === personId && p.status === 'active')) return
          const occ = activeCount5(state, slot.id, date)
          if (row.way === 'grab' && occ >= snapN5(state, slot.id, date)) return
          if (row.way === 'apply' && state.applications.some(a => a.slotId === slot.id && a.date === date && a.personId === personId)) return
          out.push({ slotId: slot.id, date, row, slot })
        })
      })
  })
  return out
}

/* 这一档已经占到几个（按人群算，不是按档号猜） */
export function rowUsed5(state, slotId, date, slot, row) {
  return state.placements.filter(p =>
    p.slotId === slotId && p.date === date && p.status === 'active' &&
    matchWho5(state, personById(state, p.personId), slot, row.who)
  ).length
}

/*
  直派到点执行：直派分人的时刻 = 那一档窗口开放的时刻，不是发布那一刻。
  窗口开了才分人——这时候前面先开的班次都跑完了，落空的人自然被收尾班次（通班）收进去；
  已排到班的人时段重叠排不了，被冲突检查挡在外面。位满即停，装不下的人事当场安排。
  执行过的档记进 state.directDone，重跑不重复分（幂等）。
  跑的范围是「这个空间那一轮铺了哪些天」：门店一周、办公区一个月——不是写死七天的演示窗口。
*/
export function runDueDirect5(state, now = state.now) {
  const all = [...state.slots, ...state.temps]
  all.forEach(slot => {
    const round = roundOf(state, slot.spaceId)
    datesOfRound5(round).filter(d => slotsOn5(state, d).some(s => s.id === slot.id) || slot.date === d).forEach(date => {
      /* 轮转：本店的人每天顺延一位起头，轮到谁是谁（业务上按上周倒班轮，原型用这个表达） */
      const local = state.people.filter(p => p.spaceId === slot.spaceId)
      const k = local.length ? Math.max(0, datesOfRound5(round).indexOf(date)) % local.length : 0
      const ordered = [...local.slice(k), ...local.slice(0, k), ...state.people.filter(p => p.spaceId !== slot.spaceId)]
      slot.list.forEach(row => {
        if (row.way !== 'direct') return
        const key = `${slot.id}|${date}|${row.k}`
        if (state.directDone.has(key)) return
        const at = openAt5(row, roundOf(state, slot.spaceId), date)
        if (!at || now < at) return // 还没到点，不分
        state.directDone.add(key)
        ordered.forEach(person => {
          if (!matchWho5(state, person, slot, row.who)) return
          if (activeCount5(state, slot.id, date) >= snapN5(state, slot.id, date)) return
          if (row.cap && rowUsed5(state, slot.id, date, slot, row) >= row.cap) return
          if (personBusy5(state, person.id, date, slot.start, slot.end)) return
          state.placements.push({
            id: `P-${state.seq++}`, slotId: slot.id, date, personId: person.id,
            way: `直派 · 第${row.k}档`, status: 'active', at, history: []
          })
        })
      })
    })
  })
}

/* 能不能拿：可见 ≠ 可拿，可拿层要给具体原因（员工侧同一套判定，抢单时不会再变） */
export function canTake5(state, slotId, date, personId, way = 'grab', now = NOW) {
  const slot = slotById(state, slotId)
  const person = personById(state, personId)
  if (!slot || !person) return { ok: false, reason: '这个时段不存在' }
  const rows = slot.list.filter(r => r.way === way)
  if (!rows.length) return { ok: false, reason: way === 'apply' ? '这个时段不走申领' : '这个时段不靠抢' }
  const row = rows.find(r => matchWho5(state, person, slot, r.who))
  if (!row) return { ok: false, reason: '这一档不是你的档' }
  if (!windowOpen5(row, date, now, roundOf(state, slot.spaceId))) return { ok: false, reason: `还没开：${windowLabel5(row, null, date, roundOf(state, slot.spaceId))}` }
  /* 行上限：这一档给几个就几个，多的留给下一档 */
  if (row.cap && rowUsed5(state, slotId, date, slot, row) >= row.cap) {
    return { ok: false, reason: `这一档只留 ${row.cap} 个，已经满了` }
  }
  if (way === 'grab') {
    if (now >= `${date}T${slot.start}:00`.replace('T', ' ')) return { ok: false, reason: '已开班，闸关了' }
    if (activeCount5(state, slotId, date) >= snapN5(state, slotId, date)) return { ok: false, reason: '位已占满' }
    if (personBusy5(state, personId, date, slot.start, slot.end)) return { ok: false, reason: '和已有班次时间撞了' }
    /* 工时不在排班判断：接不接得起由获取端背后的服务算，这里只记录班次起止 */
  } else {
    if (now >= roundOf(state, slot.spaceId).applyDeadline) return { ok: false, reason: "申领已截止" }
    if (state.applications.some(a => a.slotId === slotId && a.date === date && a.personId === personId)) return { ok: false, reason: '已登记过' }
  }
  return { ok: true, row }
}

/* 抢：点了就成，成不了当场说原因 */
export function grab5(state, slotId, date, personId, now = NOW) {
  const chk = canTake5(state, slotId, date, personId, 'grab', now)
  if (!chk.ok) return chk
  const gate = claimGate5(state, slotId, date, personId)
  if (!gate.ok) return gate
  state.placements.push(P(`P-${state.seq++}`, slotId, date, personId, `抢 · 第${chk.row.k}档`, { at: now }))
  return { ok: true }
}

/* 申领：提交只登记，截止后按综合分排序截断 */
export function applyFor5(state, slotId, date, personId, now = NOW) {
  const chk = canTake5(state, slotId, date, personId, 'apply', now)
  if (!chk.ok) return chk
  const gate = claimGate5(state, slotId, date, personId)
  if (!gate.ok) return gate
  state.applications.push({ id: `A-${state.seq++}`, slotId, date, personId, at: now })
  return { ok: true }
}

/* 截止：按综合分排序截断，落选仍可等下一轮（k 不动） */
export function resolveApplications5(state, date, slotId) {
  const slot = slotById(state, slotId)
  const row = slot.list.find(r => r.way === 'apply')
  const apps = state.applications
    .filter(a => a.slotId === slotId && a.date === date)
    .sort((a, b) => personById(state, b.personId).score - personById(state, a.personId).score)
  const picked = []
  apps.forEach(a => {
    if (picked.length >= snapN5(state, slotId, date)) return
    if (personBusy5(state, a.personId, date, slot.start, slot.end)) return
    picked.push(a)
  })
  picked.forEach(a => {
    state.placements.push(P(`P-${state.seq++}`, slotId, date, a.personId, `申领 · 排上（综合分${personById(state, a.personId).score}）`))
  })
  state.applications = state.applications.filter(a => !apps.some(x => x.id === a.id && x.date === date && x.slotId === slotId))
  return { picked: picked.map(a => a.personId), rejected: apps.filter(a => !picked.includes(a)).map(a => a.personId) }
}

function fmtDate(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/* 找有空、没冲突的人顶（按清单顺位找匹配人群） */
export function pickReplacement5(state, slotId, date, exceptPersonId = null) {
  const slot = slotById(state, slotId)
  for (const row of slot.list) {
    const cands = state.people.filter(p =>
      matchWho5(state, p, slot, row.who)
      && p.id !== exceptPersonId
      && !personBusy5(state, p.id, date, slot.start, slot.end))
    if (cands.length) return { person: cands[0], row }
  }
  return null
}

function bumpVersion5(state, note, factId) {
  const v = state.versions[state.versions.length - 1].v + 1
  state.versions.push({ v, at: NOW, note, facts: factId ? [factId] : [] })
  return v
}

/* 求值：写事实 + 截短事实。一个事实 = 一次重算 = 一个解版本 */
export function addFact5(state, fact) {
  state.facts.push(fact)
  const touched = []
  if (fact.type === '请假') {
    const target = state.placements.find(p => p.id === fact.placementId && p.status === 'active')
    const slot = slotById(state, fact.slotId)
    /* 只请一部分时间（如 1 小时）：班次还在这个人身上，只把那段画进事实；少的时间要不要补人待业务拍板 */
    const partial = target && slot && fact.start && fact.end && (fact.start > slot.start || fact.end < slot.end)
    if (target && partial) {
      fact.result = `只占 ${fact.start}–${fact.end}，剩余时间不动；少的时间要不要补人待业务拍板`
    } else if (target) {
      target.status = 'covered'
      target.history.push({ note: `${fact.at} ${personById(state, fact.by)?.name || ''} 提交请假，这段时间被请假占用` })
      const rep = pickReplacement5(state, target.slotId, target.date, fact.by)
      if (rep) {
        const np = P(`P-${state.seq++}`, target.slotId, target.date, rep.person.id, '顶班 · 补位', { fromFact: fact.id, at: fact.at })
        state.placements.push(np)
        touched.push(target, np)
        fact.result = `班次由 ${rep.person.name} 顶上（补位）`
        state.notices.unshift({
          id: `N-${state.seq++}`, to: rep.person.id, kind: 'makeup', acked: false, date: target.date,
          text: `补位通知：${target.date} ${slotById(state, target.slotId).name} ${slotById(state, target.slotId).start}-${slotById(state, target.slotId).end} 需要你顶上`,
          detail: `${personById(state, fact.by).name} ${fact.at.slice(11)} 提交请假；你是清单里当时有空、没冲突的人`
        })
      } else {
        fact.result = '时段留空，已通知人事处理'
        state.notices.unshift({
          id: `N-${state.seq++}`, to: 'HR', kind: 'hr', acked: false, date: target.date, slotId: target.slotId,
          text: `待处理：${target.date} ${slotById(state, target.slotId).name} 没人能顶`,
          detail: `${personById(state, fact.by).name} ${fact.at.slice(11)} 提交请假；顺位里没有有空、没冲突的人，时段留空，请人事找人顶班`
        })
      }
    }
  } else if (fact.type === '顶班') {
    const np = P(`P-${state.seq++}`, fact.slotId, fact.date, fact.personId, '顶班', { fromFact: fact.id, at: fact.at })
    state.placements.push(np)
    touched.push(np)
    fact.result = `${personById(state, fact.personId).name} 已被安排顶班（经营性安排，通知即可）`
    state.notices.unshift({
      id: `N-${state.seq++}`, to: fact.personId, kind: 'appoint', acked: false, date: fact.date,
      text: `排班安排：${fact.date} ${slotById(state, fact.slotId).name} ${slotById(state, fact.slotId).start}-${slotById(state, fact.slotId).end}`,
      detail: '人事的经营性安排，不需你同意；如有实际困难联系门店人事'
    })
    /* 顶上之后，这个时段的「待人事处理」自动销掉 */
    state.notices.forEach(n => {
      if (n.kind === 'hr' && !n.acked && n.slotId === fact.slotId && n.date === fact.date) n.acked = true
    })
  } else if (fact.type === '换班') {
    const a = state.placements.find(p => p.id === fact.placementId)
    const b = state.placements.find(p => p.id === fact.partnerPlacementId)
    if (a && b) {
      const pa = a.personId
      const pb = b.personId
      a.personId = pb
      b.personId = pa
      a.history.push({ note: `${fact.at} 与 ${personById(state, pb).name} 换班` })
      b.history.push({ note: `${fact.at} 与 ${personById(state, pa).name} 换班` })
      fact.result = '两条班次已对调，同时生效'
      touched.push(a, b)
    }
  } else if (fact.type === '离职') {
    state.placements.forEach(p => {
      if (p.personId === fact.by && p.date >= fact.date && p.status === 'active') {
        p.status = 'covered'
        p.history.push({ note: `${fact.at} ${fact.subtype}：人直接出结果，不找人顶` })
        touched.push(p)
      }
    })
    fact.result = `${personById(state, fact.by).name} 从 ${fact.date} 起的结果里直接消失；复职 = 新的资格事实`
  }
  bumpVersion5(state, `事实 ${fact.id}（${fact.type}）重算`, fact.id)
  fact.placements = touched.map(t => t.id)
  return fact
}

export function buildV5State() {
  const state = {
    seq: 100,
    now: NOW,
    today: TODAY,
    spaces: JSON.parse(JSON.stringify(SPACES5)),
    people: JSON.parse(JSON.stringify(PEOPLE5)),
    services: JSON.parse(JSON.stringify(SERVICES5)),
    slots: JSON.parse(JSON.stringify(SLOTS5)),
    temps: JSON.parse(JSON.stringify(TEMPS5)),
    claimRules: JSON.parse(JSON.stringify(CLAIM_RULES5)),
    hourLimits: JSON.parse(JSON.stringify(HOUR_LIMITS5)),
    round: JSON.parse(JSON.stringify(ROUND5)),
    /* 自己的节奏自己那份轮；没配的空间沿用上面那份门店周节奏 */
    rounds: JSON.parse(JSON.stringify(ROUNDS5)),
    placements: JSON.parse(JSON.stringify(PLACEMENTS5)),
    applications: JSON.parse(JSON.stringify(APPLICATIONS5)),
    facts: JSON.parse(JSON.stringify(FACTS5)),
    versions: JSON.parse(JSON.stringify(VERSIONS5)),
    notices: JSON.parse(JSON.stringify(NOTICES5)),
    swapRequests: JSON.parse(JSON.stringify(SWAP_REQUESTS5)),
    dayQuota: {},
    configDirty: false,
    /* 种子里的直派（早班/晚班第 1 档，发布即开）在 11-12 06:00 已执行 */
    directDone: new Set()
  }
  ;['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20'].forEach(d => {
    state.directDone.add(`SL-01|${d}|1`)
    state.directDone.add(`SL-02|${d}|1`)
  })
  /* 直派到点执行：窗口已开的档现在分人（通班 11-14 09:00 开，NOW 之前已到点） */
  runDueDirect5(state, state.now)
  /* 初始轮快照按种子配置刷：轮跑的是快照 */
  const snapSpaces = new Set(['', ...Object.keys(state.rounds || {}), ...state.slots.map(x => x.spaceId)])
  snapSpaces.forEach(id => applyRoundSnapshots5(state, id))
  return state
}
