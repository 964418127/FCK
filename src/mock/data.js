// 模拟数据

// 部门数据（组织架构）
// 节点类型：headquarters(总公司), company(公司), subsidiary(子公司), branch(分公司), store(门店), department(部门), virtualTeam(虚拟团队)
export const departments = [
  {
    id: 'dept-1',
    name: '总公司',
    type: 'headquarters',
    parentId: null,
    description: '总公司（根节点）',
    children: [
      {
        id: 'dept-1-1',
        name: '华东子公司',
        type: 'subsidiary',
        parentId: 'dept-1',
        description: '华东地区子公司',
        children: [
          {
            id: 'dept-1-1-1',
            name: '上海分公司',
            type: 'branch',
            parentId: 'dept-1-1',
            description: '上海分公司',
            children: [
              {
                id: 'dept-1-1-1-1',
                name: '上海旗舰店',
                type: 'store',
                parentId: 'dept-1-1-1',
                description: '上海旗舰店',
                children: [
                  {
                    id: 'dept-1-1-1-1-1',
                    name: '销售部',
                    type: 'department',
                    parentId: 'dept-1-1-1-1',
                    description: '销售部门',
                    children: []
                  },
                  {
                    id: 'dept-1-1-1-1-2',
                    name: '客服部',
                    type: 'department',
                    parentId: 'dept-1-1-1-1',
                    description: '客服部门',
                    children: []
                  }
                ]
              },
              {
                id: 'dept-1-1-1-2',
                name: '上海二店',
                type: 'store',
                parentId: 'dept-1-1-1',
                description: '上海二店',
                children: []
              }
            ]
          },
          {
            id: 'dept-1-1-2',
            name: '杭州分公司',
            type: 'branch',
            parentId: 'dept-1-1',
            description: '杭州分公司',
            children: [
              {
                id: 'dept-1-1-2-1',
                name: '杭州西湖店',
                type: 'store',
                parentId: 'dept-1-1-2',
                description: '杭州西湖店',
                children: []
              }
            ]
          },
          {
            id: 'dept-1-1-3',
            name: '运营部',
            type: 'department',
            parentId: 'dept-1-1',
            description: '运营部门',
            children: [
              { 
                id: 'dept-1-1-3-1', 
                name: '运营一部', 
                type: 'department',
                parentId: 'dept-1-1-3', 
                description: '运营一部',
                children: [] 
              },
              { 
                id: 'dept-1-1-3-2', 
                name: '运营二部', 
                type: 'department',
                parentId: 'dept-1-1-3', 
                description: '运营二部',
                children: [] 
              },
              { 
                id: 'dept-1-1-3-3', 
                name: '运营三部', 
                type: 'department',
                parentId: 'dept-1-1-3', 
                description: '运营三部',
                children: [] 
              }
            ]
          },
          {
            id: 'dept-1-1-4',
            name: '市场推广组',
            type: 'virtualTeam',
            parentId: 'dept-1-1',
            description: '市场推广虚拟团队',
            children: []
          }
        ]
      },
      {
        id: 'dept-1-2',
        name: '华南子公司',
        type: 'subsidiary',
        parentId: 'dept-1',
        description: '华南地区子公司',
        children: [
          {
            id: 'dept-1-2-1',
            name: '广州分公司',
            type: 'branch',
            parentId: 'dept-1-2',
            description: '广州分公司',
            children: [
              {
                id: 'dept-1-2-1-1',
                name: '广州天河店',
                type: 'store',
                parentId: 'dept-1-2-1',
                description: '广州天河店',
                children: []
              },
              {
                id: 'dept-1-2-1-2',
                name: '广州越秀店',
                type: 'store',
                parentId: 'dept-1-2-1',
                description: '广州越秀店',
                children: []
              }
            ]
          },
          {
            id: 'dept-1-2-2',
            name: '深圳分公司',
            type: 'branch',
            parentId: 'dept-1-2',
            description: '深圳分公司',
            children: []
          }
        ]
      },
      {
        id: 'dept-1-3',
        name: '技术部',
        type: 'department',
        parentId: 'dept-1',
        description: '技术部门',
        children: [
          { 
            id: 'dept-1-3-1', 
            name: '前端开发', 
            type: 'department',
            parentId: 'dept-1-3', 
            description: '前端开发部门',
            children: [] 
          },
          { 
            id: 'dept-1-3-2', 
            name: '后端开发', 
            type: 'department',
            parentId: 'dept-1-3', 
            description: '后端开发部门',
            children: [] 
          },
          { 
            id: 'dept-1-3-3', 
            name: '测试部', 
            type: 'department',
            parentId: 'dept-1-3', 
            description: '测试部门',
            children: [] 
          },
          { 
            id: 'dept-1-3-4', 
            name: '运维部', 
            type: 'department',
            parentId: 'dept-1-3', 
            description: '运维部门',
            children: [] 
          }
        ]
      },
      {
        id: 'dept-1-4',
        name: '财务部',
        type: 'department',
        parentId: 'dept-1',
        description: '财务部门',
        children: []
      },
      {
        id: 'dept-1-5',
        name: '人事部',
        type: 'department',
        parentId: 'dept-1',
        description: '人事部门',
        children: [
          {
            id: 'dept-1-5-1',
            name: '招聘组',
            type: 'department',
            parentId: 'dept-1-5',
            description: '招聘组',
            children: []
          },
          {
            id: 'dept-1-5-2',
            name: '培训组',
            type: 'department',
            parentId: 'dept-1-5',
            description: '培训组',
            children: []
          }
        ]
      },
      {
        id: 'dept-1-6',
        name: '法务部',
        type: 'department',
        parentId: 'dept-1',
        description: '法务部门',
        children: []
      },
      {
        id: 'dept-1-7',
        name: '战略规划组',
        type: 'virtualTeam',
        parentId: 'dept-1',
        description: '战略规划虚拟团队',
        children: []
      }
    ]
  }
]

// 岗位数据
export const positions = [
  { id: 'pos-1', code: 'YY-01-001', name: '部门负责人', description: '负责部门全面工作' },
  { id: 'pos-2', code: 'YY-25-002', name: '运营专员', description: '负责日常运营工作' },
  { id: 'pos-3', code: 'YY-01-003', name: '技术总监', description: '负责技术部门管理' },
  { id: 'pos-4', code: 'YY-01-004', name: '前端工程师', description: '负责前端开发工作' },
  { id: 'pos-5', code: 'YY-01-005', name: '后端工程师', description: '负责后端开发工作' },
  { id: 'pos-6', code: 'YY-01-006', name: '财务主管', description: '负责财务部门管理' },
  { id: 'pos-7', code: 'YY-01-007', name: '会计', description: '负责日常会计工作' }
]

// 工作岗位（实例化的具体岗位编号，例如 YY-25-002-01）
// 由 users、positions 与 budgetPlans 生成：先为每个已有用户生成已分配的岗位，再根据预算补充空缺岗位
const _generateWorkPosts = () => {
  const posts = []
  const seqMap = {} // key = `${positionId}::${departmentId}` -> seq

  // 为每个有 positionId 的用户生成已分配的工作岗位
  for (const u of users) {
    if (!u.positionId) continue
    const key = `${u.positionId}::${u.departmentId || ''}`
    seqMap[key] = (seqMap[key] || 0) + 1
    const seq = seqMap[key]
    const pos = positions.find(p => p.id === u.positionId)
    const mainCode = pos?.code || u.positionId
    const suffix = String(seq).padStart(2, '0')
    const postCode = `${mainCode}-${suffix}`
    posts.push({
      id: `wp-${u.id}`,
      mainPositionId: u.positionId,
      mainPositionCode: mainCode,
      postCode,
      departmentId: u.departmentId || null,
      assignedUserId: u.id,
      status: 'filled'
    })
  }

  // 根据 budgetPlans 补充空缺岗位（未分配的）
  for (const plan of budgetPlans || []) {
    const positionId = plan.positionId
    const planned = plan.planned || 0
    // count existing posts for this position (across all depts)
    const existingCount = posts.filter(p => p.mainPositionId === positionId).length
    const need = planned - existingCount
    if (need > 0) {
      // append vacant posts (departmentId left null for demo or could be distributed)
      for (let i = 0; i < need; i++) {
        const key = `${positionId}::`
        seqMap[key] = (seqMap[key] || 0) + 1
        const seq = seqMap[key]
        const pos = positions.find(p => p.id === positionId)
        const mainCode = pos?.code || positionId
        const suffix = String(seq).padStart(2, '0')
        const postCode = `${mainCode}-${suffix}`
        posts.push({
          id: `wp-vacant-${positionId}-${seq}`,
          mainPositionId: positionId,
          mainPositionCode: mainCode,
          postCode,
          departmentId: null,
          assignedUserId: null,
          status: 'vacant'
        })
      }
    }
  }

  return posts
}

/*
  NOTE: workPosts are generated after the `users`, `positions` and `budgetPlans`
  definitions to avoid reference-before-initialization errors. See generation
  code appended after the `users` array.
*/
export let workPosts = [] // placeholder; will be populated after users are declared

// 预算编制计划（示例）：每条记录表示某年度某岗位计划编制数
export const budgetPlans = [
  { positionId: 'pos-1', year: 2025, planned: 1 },
  { positionId: 'pos-2', year: 2025, planned: 3 },
  { positionId: 'pos-3', year: 2025, planned: 1 },
  { positionId: 'pos-4', year: 2025, planned: 2 },
  { positionId: 'pos-5', year: 2025, planned: 2 },
  { positionId: 'pos-6', year: 2025, planned: 1 },
  { positionId: 'pos-7', year: 2025, planned: 1 }
]

// 新增：补充一些未分配工作岗位的员工（模拟用户存在岗位但无工作岗位分配）
export const extraUsersWithoutWorkPost = [
  {
    id: 'user-23',
    name: '李二十三',
    username: 'li23',
    employeeNo: 'EMP023',
    uid: '',
    departmentId: 'dept-1-1-3-1',
    departmentName: '运营一部',
    positionId: 'pos-2',
    positionName: '运营专员',
    roles: ['role-3'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-24',
    name: '王二十四',
    username: 'wang24',
    employeeNo: 'EMP024',
    uid: '',
    departmentId: 'dept-1-3-2',
    departmentName: '后端开发',
    positionId: 'pos-5',
    positionName: '后端工程师',
    roles: ['role-5'],
    attributes: {},
    processTasks: []
  }
]

// 业务容器数据
export const businessContainers = [
  // 根节点 - 服务订单系统
  { id: 'container-1', name: '全国', type: 'COUNTRY', parentId: null, description: '全国', productPort: '服务订单系统(web)' },
  
  // 大区层级 - 服务订单系统
  { id: 'container-2', name: '西南大区', type: 'REGION', parentId: 'container-1', description: '西南大区', productPort: '服务订单系统(web)' },
  { id: 'container-3', name: '华北大区', type: 'REGION', parentId: 'container-1', description: '华北大区', productPort: '服务订单系统(web)' },
  { id: 'container-15', name: '华东大区', type: 'REGION', parentId: 'container-1', description: '华东大区', productPort: '服务订单系统(web)' },
  { id: 'container-25', name: '华南大区', type: 'REGION', parentId: 'container-1', description: '华南大区', productPort: '服务订单系统(web)' },
  
  // 西南大区 - 四川省 - 服务订单系统
  { id: 'container-4', name: '四川省', type: 'PROVINCE', parentId: 'container-2', description: '四川省', productPort: '服务订单系统(web)' },
  { id: 'container-6', name: '成都市', type: 'CITY', parentId: 'container-4', description: '成都市', productPort: '服务订单系统(web)' },
  { id: 'container-7', name: '锦江区', type: 'DISTRICT', parentId: 'container-6', description: '锦江区', productPort: '服务订单系统(web)' },
  { id: 'container-8', name: '春熙路商圈', type: 'BUSINESS_AREA', parentId: 'container-7', description: '春熙路商圈', productPort: '服务订单系统(web)' },
  { id: 'container-9', name: 'IFS CBD', type: 'CBD', parentId: 'container-8', description: 'IFS CBD', productPort: '服务订单系统(web)' },
  { id: 'container-10', name: 'IFS店', type: 'STORE', parentId: 'container-9', description: 'IFS店', productPort: '服务订单系统(web)' },
  { id: 'container-11', name: '太古里店', type: 'STORE', parentId: 'container-8', description: '太古里店', productPort: '服务订单系统(web)' },
  { id: 'container-12', name: '武侯区', type: 'DISTRICT', parentId: 'container-6', description: '武侯区', productPort: '服务订单系统(web)' },
  { id: 'container-13', name: '双楠商圈', type: 'BUSINESS_AREA', parentId: 'container-12', description: '双楠商圈', productPort: '服务订单系统(web)' },
  { id: 'container-14', name: '双楠店', type: 'STORE', parentId: 'container-13', description: '双楠店', productPort: '服务订单系统(web)' },
  
  // 华北大区 - 北京市 - 服务订单系统
  { id: 'container-5', name: '北京市', type: 'CITY', parentId: 'container-3', description: '北京市', productPort: '服务订单系统(web)' },
  { id: 'container-35', name: '朝阳区', type: 'DISTRICT', parentId: 'container-5', description: '朝阳区', productPort: '服务订单系统(web)' },
  { id: 'container-36', name: '三里屯商圈', type: 'BUSINESS_AREA', parentId: 'container-35', description: '三里屯商圈', productPort: '服务订单系统(web)' },
  { id: 'container-37', name: '三里屯CBD', type: 'CBD', parentId: 'container-36', description: '三里屯CBD', productPort: '服务订单系统(web)' },
  { id: 'container-38', name: '三里屯店', type: 'STORE', parentId: 'container-37', description: '三里屯店', productPort: '服务订单系统(web)' },
  { id: 'container-39', name: '王府井店', type: 'STORE', parentId: 'container-36', description: '王府井店', productPort: '服务订单系统(web)' },
  
  // 华东大区 - 江苏省 - 服务订单系统
  { id: 'container-16', name: '江苏省', type: 'PROVINCE', parentId: 'container-15', description: '江苏省', productPort: '服务订单系统(web)' },
  { id: 'container-17', name: '南京市', type: 'CITY', parentId: 'container-16', description: '南京市', productPort: '服务订单系统(web)' },
  { id: 'container-18', name: '鼓楼区', type: 'DISTRICT', parentId: 'container-17', description: '鼓楼区', productPort: '服务订单系统(web)' },
  { id: 'container-19', name: '新街口商圈', type: 'BUSINESS_AREA', parentId: 'container-18', description: '新街口商圈', productPort: '服务订单系统(web)' },
  { id: 'container-20', name: '新街口CBD', type: 'CBD', parentId: 'container-19', description: '新街口CBD', productPort: '服务订单系统(web)' },
  { id: 'container-21', name: '新街口店', type: 'STORE', parentId: 'container-20', description: '新街口店', productPort: '服务订单系统(web)' },
  { id: 'container-22', name: '夫子庙店', type: 'STORE', parentId: 'container-19', description: '夫子庙店', productPort: '服务订单系统(web)' },
  
  // 华东大区 - 浙江省 - 服务订单系统
  { id: 'container-23', name: '浙江省', type: 'PROVINCE', parentId: 'container-15', description: '浙江省', productPort: '服务订单系统(web)' },
  { id: 'container-24', name: '宁波市', type: 'CITY', parentId: 'container-23', description: '宁波市', productPort: '服务订单系统(web)' },
  { id: 'container-40', name: '鄞州区', type: 'DISTRICT', parentId: 'container-24', description: '鄞州区', productPort: '服务订单系统(web)' },
  { id: 'container-41', name: '鄞州中心区商圈', type: 'BUSINESS_AREA', parentId: 'container-40', description: '鄞州中心区商圈', productPort: '服务订单系统(web)' },
  { id: 'container-42', name: '鄞州CBD', type: 'CBD', parentId: 'container-41', description: '鄞州CBD', productPort: '服务订单系统(web)' },
  { id: 'container-43', name: '鄞州店', type: 'STORE', parentId: 'container-42', description: '鄞州店', productPort: '服务订单系统(web)' },
  { id: 'container-44', name: '天一广场店', type: 'STORE', parentId: 'container-41', description: '天一广场店', productPort: '服务订单系统(web)' },
  
  // 华南大区 - 广东省 - 服务订单系统
  { id: 'container-26', name: '广东省', type: 'PROVINCE', parentId: 'container-25', description: '广东省', productPort: '服务订单系统(web)' },
  
  // 华南大区 - 广州市 - 服务订单系统
  { id: 'container-27', name: '广州市', type: 'CITY', parentId: 'container-26', description: '广州市', productPort: '服务订单系统(web)' },
  { id: 'container-28', name: '天河区', type: 'DISTRICT', parentId: 'container-27', description: '天河区', productPort: '服务订单系统(web)' },
  { id: 'container-29', name: '珠江新城商圈', type: 'BUSINESS_AREA', parentId: 'container-28', description: '珠江新城商圈', productPort: '服务订单系统(web)' },
  { id: 'container-30', name: '珠江新城CBD', type: 'CBD', parentId: 'container-29', description: '珠江新城CBD', productPort: '服务订单系统(web)' },
  { id: 'container-31', name: '珠江新城店', type: 'STORE', parentId: 'container-30', description: '珠江新城店', productPort: '服务订单系统(web)' },
  { id: 'container-32', name: '北京路店', type: 'STORE', parentId: 'container-29', description: '北京路店', productPort: '服务订单系统(web)' },
  
  // 华南大区 - 深圳市 - 服务订单系统
  { id: 'container-33', name: '深圳市', type: 'CITY', parentId: 'container-26', description: '深圳市', productPort: '服务订单系统(web)' },
  { id: 'container-34', name: '南山区', type: 'DISTRICT', parentId: 'container-33', description: '南山区', productPort: '服务订单系统(web)' },
  { id: 'container-45', name: '科技园商圈', type: 'BUSINESS_AREA', parentId: 'container-34', description: '科技园商圈', productPort: '服务订单系统(web)' },
  { id: 'container-46', name: '科技园CBD', type: 'CBD', parentId: 'container-45', description: '科技园CBD', productPort: '服务订单系统(web)' },
  { id: 'container-47', name: '科技园店', type: 'STORE', parentId: 'container-46', description: '科技园店', productPort: '服务订单系统(web)' },
  { id: 'container-48', name: '万象城店', type: 'STORE', parentId: 'container-45', description: '万象城店', productPort: '服务订单系统(web)' },
  { id: 'container-49', name: '华强北店', type: 'STORE', parentId: 'container-45', description: '华强北店', productPort: '服务订单系统(web)' },
  
  // 更多门店数据 - 服务订单系统
  { id: 'container-50', name: '广州天河城店', type: 'STORE', parentId: 'container-29', description: '广州天河城店', productPort: '服务订单系统(web)' },
  { id: 'container-51', name: '深圳海岸城店', type: 'STORE', parentId: 'container-45', description: '深圳海岸城店', productPort: '服务订单系统(web)' },
  { id: 'container-52', name: '南京河西万达店', type: 'STORE', parentId: 'container-19', description: '南京河西万达店', productPort: '服务订单系统(web)' },
  { id: 'container-53', name: '宁波鄞州万达店', type: 'STORE', parentId: 'container-41', description: '宁波鄞州万达店', productPort: '服务订单系统(web)' },
  { id: 'container-54', name: '北京西单店', type: 'STORE', parentId: 'container-36', description: '北京西单店', productPort: '服务订单系统(web)' },
  { id: 'container-55', name: '成都环球中心店', type: 'STORE', parentId: 'container-8', description: '成都环球中心店', productPort: '服务订单系统(web)' }
]

// 权限数据（目录、页面、功能/按钮、API）
export const permissions = [
  // 目录权限
  { id: 'perm-directory-1', name: '系统管理', type: 'DIRECTORY', code: 'system', parentId: null, description: '系统管理目录', productPort: '服务订单系统(web)' },
  { id: 'perm-directory-2', name: '订单管理', type: 'DIRECTORY', code: 'order', parentId: null, description: '订单管理目录', productPort: '服务订单系统(app)' },
  { id: 'perm-directory-3', name: '人事招聘', type: 'DIRECTORY', code: 'recruit', parentId: null, description: '人事招聘目录', productPort: '服务订单系统(web)' },
  { id: 'perm-directory-4', name: 'C端学习培训', type: 'DIRECTORY', code: 'c-learning', parentId: null, description: 'C端学习培训目录', productPort: 'C端学习系统(app)' },
  { id: 'perm-directory-5', name: 'C端考试认证', type: 'DIRECTORY', code: 'c-exam', parentId: null, description: 'C端考试认证目录', productPort: 'C端学习系统(app)' },
  { id: 'perm-directory-6', name: 'C端技能提升', type: 'DIRECTORY', code: 'c-skill', parentId: null, description: 'C端技能提升目录', productPort: 'C端学习系统(app)' },
  { id: 'perm-directory-7', name: 'C端证书管理', type: 'DIRECTORY', code: 'c-certificate', parentId: null, description: 'C端证书管理目录', productPort: 'C端学习系统(app)' },
  
  // 系统管理下的页面权限
  { id: 'perm-1', name: '仪表盘', type: 'PAGE', code: 'dashboard', parentId: 'perm-directory-1', path: '/dashboard', component: 'Dashboard', description: '仪表盘页面', productPort: '服务订单系统(web)' },
  { id: 'perm-2', name: '组织管理', type: 'PAGE', code: 'organization', parentId: 'perm-directory-1', path: '/organization', component: 'Organization', description: '组织管理页面', productPort: '服务订单系统(web)' },
  { id: 'perm-3', name: '角色管理', type: 'PAGE', code: 'role', parentId: 'perm-directory-1', path: '/role', component: 'Role', description: '角色管理页面', productPort: '服务订单系统(web)' },
  { id: 'perm-4', name: '用户管理', type: 'PAGE', code: 'user', parentId: 'perm-directory-1', path: '/user', component: 'User', description: '用户管理页面', productPort: '服务订单系统(web)' },
  { id: 'perm-5', name: '数据规则管理', type: 'PAGE', code: 'data-rule', parentId: 'perm-directory-1', path: '/data-rule', component: 'DataRule', description: '数据规则管理页面', productPort: '服务订单系统(web)' },
  
  // 订单管理下的页面权限
  { id: 'perm-6', name: '订单管理', type: 'PAGE', code: 'order', parentId: 'perm-directory-2', path: '/order', component: 'Order', description: '订单管理页面', productPort: '服务订单系统(app)' },
  
  // 人事招聘下的页面权限
  { id: 'perm-7', name: '招聘管理', type: 'PAGE', code: 'recruit', parentId: 'perm-directory-3', path: '/recruit', component: 'Recruit', description: '招聘管理页面', productPort: '服务订单系统(web)' },
  { id: 'perm-8', name: '入职管理', type: 'PAGE', code: 'onboard', parentId: 'perm-directory-3', path: '/onboard', component: 'Onboard', description: '入职管理页面', productPort: '服务订单系统(web)' },
  
  // C端学习培训下的页面权限
  { id: 'perm-9', name: '课程中心', type: 'PAGE', code: 'course-center', parentId: 'perm-directory-4', path: '/course-center', component: 'CourseCenter', description: '课程中心页面', productPort: 'C端学习系统(app)' },
  { id: 'perm-10', name: '我的学习', type: 'PAGE', code: 'my-learning', parentId: 'perm-directory-4', path: '/my-learning', component: 'MyLearning', description: '我的学习页面', productPort: 'C端学习系统(app)' },
  { id: 'perm-11', name: '学习记录', type: 'PAGE', code: 'learning-record', parentId: 'perm-directory-4', path: '/learning-record', component: 'LearningRecord', description: '学习记录页面', productPort: 'C端学习系统(app)' },
  
  // C端考试认证下的页面权限
  { id: 'perm-12', name: '考试中心', type: 'PAGE', code: 'exam-center', parentId: 'perm-directory-5', path: '/exam-center', component: 'ExamCenter', description: '考试中心页面', productPort: 'C端学习系统(app)' },
  { id: 'perm-13', name: '我的考试', type: 'PAGE', code: 'my-exam', parentId: 'perm-directory-5', path: '/my-exam', component: 'MyExam', description: '我的考试页面', productPort: 'C端学习系统(app)' },
  { id: 'perm-14', name: '成绩查询', type: 'PAGE', code: 'score-query', parentId: 'perm-directory-5', path: '/score-query', component: 'ScoreQuery', description: '成绩查询页面', productPort: 'C端学习系统(app)' },
  { id: 'perm-15', name: '证书中心', type: 'PAGE', code: 'certificate-center', parentId: 'perm-directory-5', path: '/certificate-center', component: 'CertificateCenter', description: '证书中心页面', productPort: 'C端学习系统(app)' },
  
  // C端技能提升下的页面权限
  { id: 'perm-16', name: '技能评估', type: 'PAGE', code: 'skill-assessment', parentId: 'perm-directory-6', path: '/skill-assessment', component: 'SkillAssessment', description: '技能评估页面', productPort: 'C端学习系统(app)' },
  { id: 'perm-17', name: '提升计划', type: 'PAGE', code: 'improvement-plan', parentId: 'perm-directory-6', path: '/improvement-plan', component: 'ImprovementPlan', description: '提升计划页面', productPort: 'C端学习系统(app)' },
  { id: 'perm-18', name: '技能认证', type: 'PAGE', code: 'skill-certification', parentId: 'perm-directory-6', path: '/skill-certification', component: 'SkillCertification', description: '技能认证页面', productPort: 'C端学习系统(app)' },
  
  // C端证书管理下的页面权限
  { id: 'perm-19', name: '我的证书', type: 'PAGE', code: 'my-certificate', parentId: 'perm-directory-7', path: '/my-certificate', component: 'MyCertificate', description: '我的证书页面', productPort: 'C端学习系统(app)' },
  { id: 'perm-20', name: '证书续期', type: 'PAGE', code: 'certificate-renewal', parentId: 'perm-directory-7', path: '/certificate-renewal', component: 'CertificateRenewal', description: '证书续期页面', productPort: 'C端学习系统(app)' },
  
  // 组织管理下的功能/按钮权限
  { id: 'perm-2-1', name: '新增部门', type: 'FUNCTION', code: 'department-add', parentId: 'perm-2', description: '新增部门按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-1', 'perm-api-2'] },
  { id: 'perm-2-2', name: '编辑部门', type: 'FUNCTION', code: 'department-edit', parentId: 'perm-2', description: '编辑部门按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-2'] },
  { id: 'perm-2-3', name: '删除部门', type: 'FUNCTION', code: 'department-delete', parentId: 'perm-2', description: '删除部门按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-2'] },
  { id: 'perm-2-4', name: '新增岗位', type: 'FUNCTION', code: 'position-add', parentId: 'perm-2', description: '新增岗位按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-1', 'perm-api-2'] },
  { id: 'perm-2-5', name: '编辑岗位', type: 'FUNCTION', code: 'position-edit', parentId: 'perm-2', description: '编辑岗位按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-2'] },
  { id: 'perm-2-6', name: '删除岗位', type: 'FUNCTION', code: 'position-delete', parentId: 'perm-2', description: '删除岗位按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-2'] },
  
  // 角色管理下的功能/按钮权限
  { id: 'perm-3-1', name: '新增角色', type: 'FUNCTION', code: 'role-add', parentId: 'perm-3', description: '新增角色按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-3', 'perm-api-3-1'] },
  { id: 'perm-3-2', name: '编辑角色', type: 'FUNCTION', code: 'role-edit', parentId: 'perm-3', description: '编辑角色按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-3', 'perm-api-3-2'] },
  { id: 'perm-3-3', name: '删除角色', type: 'FUNCTION', code: 'role-delete', parentId: 'perm-3', description: '删除角色按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-3', 'perm-api-3-3'] },
  { id: 'perm-3-4', name: '配置权限', type: 'FUNCTION', code: 'role-permission', parentId: 'perm-3', description: '配置角色权限按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-3', 'perm-api-3-4'] },
  
  // 用户管理下的功能/按钮权限
  { id: 'perm-4-1', name: '新增用户', type: 'FUNCTION', code: 'user-add', parentId: 'perm-4', description: '新增用户按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-4', 'perm-api-4-1'] },
  { id: 'perm-4-2', name: '编辑用户', type: 'FUNCTION', code: 'user-edit', parentId: 'perm-4', description: '编辑用户按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-4', 'perm-api-4-2'] },
  { id: 'perm-4-3', name: '删除用户', type: 'FUNCTION', code: 'user-delete', parentId: 'perm-4', description: '删除用户按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-4', 'perm-api-4-3'] },
  { id: 'perm-4-4', name: '分配角色', type: 'FUNCTION', code: 'user-role', parentId: 'perm-4', description: '分配用户角色按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-4', 'perm-api-3', 'perm-api-4-4'] },
  
  // 订单管理下的功能/按钮权限
  { id: 'perm-6-1', name: '创建订单', type: 'FUNCTION', code: 'order-create', parentId: 'perm-6', description: '创建订单按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-7'] },
  { id: 'perm-6-2', name: '查看订单详情', type: 'FUNCTION', code: 'order-detail', parentId: 'perm-6', description: '查看订单详情按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6'] },
  { id: 'perm-6-3', name: '处理订单', type: 'FUNCTION', code: 'order-process', parentId: 'perm-6', description: '处理订单按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-7'] },
  { id: 'perm-6-4', name: '完成订单', type: 'FUNCTION', code: 'order-complete', parentId: 'perm-6', description: '完成订单按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-7'] },
  { id: 'perm-6-5', name: '取消订单', type: 'FUNCTION', code: 'order-cancel', parentId: 'perm-6', description: '取消订单按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-7'] },
  { id: 'perm-6-6', name: '退款订单', type: 'FUNCTION', code: 'order-refund', parentId: 'perm-6', description: '退款订单按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-8'] },
  { id: 'perm-6-7', name: '触达用户', type: 'FUNCTION', code: 'order-user-reach', parentId: 'perm-6', description: '触达待使用超过7天的用户', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-9'] },
  { id: 'perm-6-8', name: '开始服务', type: 'FUNCTION', code: 'order-service-start', parentId: 'perm-6', description: '开始服务按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-7'] },
  { id: 'perm-6-9', name: '完成服务', type: 'FUNCTION', code: 'order-service-complete', parentId: 'perm-6', description: '完成服务按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-7'] },
  { id: 'perm-6-10', name: '自动评价', type: 'FUNCTION', code: 'order-auto-rate', parentId: 'perm-6', description: '自动评价按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-10'] },
  { id: 'perm-6-11', name: '标记已评价', type: 'FUNCTION', code: 'order-mark-rated', parentId: 'perm-6', description: '标记订单已评价按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-10'] },
  { id: 'perm-6-12', name: '标记售后', type: 'FUNCTION', code: 'order-mark-aftersale', parentId: 'perm-6', description: '标记订单需售后处理按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-11'] },
  { id: 'perm-6-13', name: '完成售后', type: 'FUNCTION', code: 'order-aftersale-complete', parentId: 'perm-6', description: '完成售后处理按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-11'] },
  { id: 'perm-6-14', name: '发送优惠券', type: 'FUNCTION', code: 'order-send-coupon', parentId: 'perm-6', description: '发送优惠券促下单按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-12'] },
  { id: 'perm-6-15', name: '服务保障', type: 'FUNCTION', code: 'order-service-guarantee', parentId: 'perm-6', description: '服务保障按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-13'] },
  { id: 'perm-6-16', name: '发放好评福利', type: 'FUNCTION', code: 'order-good-review-benefit', parentId: 'perm-6', description: '发放好评福利按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-14'] },
  { id: 'perm-6-17', name: '差评安抚', type: 'FUNCTION', code: 'order-bad-review-comfort', parentId: 'perm-6', description: '差评安抚处理按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-15'] },
  { id: 'perm-6-18', name: '售后跟进', type: 'FUNCTION', code: 'order-aftersale-follow', parentId: 'perm-6', description: '售后跟进处理按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-16'] },
  { id: 'perm-6-19', name: '复购引导', type: 'FUNCTION', code: 'order-repeat-purchase', parentId: 'perm-6', description: '复购引导按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-17'] },
  { id: 'perm-6-20', name: '归档订单', type: 'FUNCTION', code: 'order-archive', parentId: 'perm-6', description: '归档订单按钮', productPort: '服务订单系统(app)', apiPermissions: ['perm-api-6', 'perm-api-18'] },
  
  // 招聘管理下的功能/按钮权限
  { id: 'perm-7-1', name: '搜索简历', type: 'FUNCTION', code: 'resume-search', parentId: 'perm-7', description: '搜索简历按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-19', 'perm-api-20'] },
  { id: 'perm-7-2', name: '浏览简历', type: 'FUNCTION', code: 'resume-browse', parentId: 'perm-7', description: '浏览简历按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-19', 'perm-api-21'] },
  { id: 'perm-7-3', name: '下载简历', type: 'FUNCTION', code: 'resume-download', parentId: 'perm-7', description: '下载简历按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-19', 'perm-api-22'] },
  { id: 'perm-7-4', name: '发起面试邀约', type: 'FUNCTION', code: 'interview-invite', parentId: 'perm-7', description: '发起面试邀约按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-19', 'perm-api-23'] },
  { id: 'perm-7-5', name: '记录面试结果', type: 'FUNCTION', code: 'interview-record', parentId: 'perm-7', description: '记录面试结果按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-19', 'perm-api-24'] },
  { id: 'perm-7-6', name: '发送offer', type: 'FUNCTION', code: 'send-offer', parentId: 'perm-7', description: '发送offer按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-19', 'perm-api-25'] },
  { id: 'perm-7-7', name: '转入人才库', type: 'FUNCTION', code: 'talent-pool', parentId: 'perm-7', description: '转入人才库按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-19', 'perm-api-26'] },
  
  // 入职管理下的功能/按钮权限
  { id: 'perm-8-1', name: '准备入职资料', type: 'FUNCTION', code: 'onboard-prepare', parentId: 'perm-8', description: '准备入职资料按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-19', 'perm-api-27'] },
  { id: 'perm-8-2', name: '安排入职培训', type: 'FUNCTION', code: 'onboard-training', parentId: 'perm-8', description: '安排入职培训按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-19', 'perm-api-28'] },
  { id: 'perm-8-3', name: '进行上岗考核', type: 'FUNCTION', code: 'onboard-assessment', parentId: 'perm-8', description: '进行上岗考核按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-19', 'perm-api-29'] },
  { id: 'perm-8-4', name: '完成入职', type: 'FUNCTION', code: 'onboard-complete', parentId: 'perm-8', description: '完成入职按钮', productPort: '服务订单系统(web)', apiPermissions: ['perm-api-19', 'perm-api-30'] },
  
  // C端学习培训下的功能/按钮权限
  { id: 'perm-9-1', name: '浏览课程', type: 'FUNCTION', code: 'course-browse', parentId: 'perm-9', description: '浏览课程按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-31', 'perm-api-32'] },
  { id: 'perm-9-2', name: '搜索课程', type: 'FUNCTION', code: 'course-search', parentId: 'perm-9', description: '搜索课程按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-31', 'perm-api-33'] },
  { id: 'perm-9-3', name: '报名课程', type: 'FUNCTION', code: 'course-enroll', parentId: 'perm-9', description: '报名课程按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-31', 'perm-api-34'] },
  { id: 'perm-10-1', name: '开始学习', type: 'FUNCTION', code: 'learning-start', parentId: 'perm-10', description: '开始学习按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-31', 'perm-api-35'] },
  { id: 'perm-10-2', name: '继续学习', type: 'FUNCTION', code: 'learning-continue', parentId: 'perm-10', description: '继续学习按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-31', 'perm-api-35'] },
  { id: 'perm-10-3', name: '完成学习', type: 'FUNCTION', code: 'learning-complete', parentId: 'perm-10', description: '完成学习按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-31', 'perm-api-36'] },
  { id: 'perm-11-1', name: '查看学习记录', type: 'FUNCTION', code: 'learning-record-view', parentId: 'perm-11', description: '查看学习记录按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-31', 'perm-api-37'] },
  
  // C端考试认证下的功能/按钮权限
  { id: 'perm-12-1', name: '浏览考试', type: 'FUNCTION', code: 'exam-browse', parentId: 'perm-12', description: '浏览考试按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-38', 'perm-api-39'] },
  { id: 'perm-12-2', name: '搜索考试', type: 'FUNCTION', code: 'exam-search', parentId: 'perm-12', description: '搜索考试按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-38', 'perm-api-40'] },
  { id: 'perm-13-1', name: '考试报名', type: 'FUNCTION', code: 'exam-enroll', parentId: 'perm-13', description: '考试报名按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-38', 'perm-api-41'] },
  { id: 'perm-13-2', name: '参加考试', type: 'FUNCTION', code: 'exam-take', parentId: 'perm-13', description: '参加考试按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-38', 'perm-api-42'] },
  { id: 'perm-13-3', name: '提交答案', type: 'FUNCTION', code: 'exam-submit', parentId: 'perm-13', description: '提交答案按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-38', 'perm-api-43'] },
  { id: 'perm-14-1', name: '查询成绩', type: 'FUNCTION', code: 'score-query', parentId: 'perm-14', description: '查询成绩按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-38', 'perm-api-44'] },
  { id: 'perm-15-1', name: '查看证书', type: 'FUNCTION', code: 'certificate-view', parentId: 'perm-15', description: '查看证书按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-38', 'perm-api-45'] },
  { id: 'perm-15-2', name: '下载证书', type: 'FUNCTION', code: 'certificate-download', parentId: 'perm-15', description: '下载证书按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-38', 'perm-api-46'] },
  
  // C端技能提升下的功能/按钮权限
  { id: 'perm-16-1', name: '开始评估', type: 'FUNCTION', code: 'assessment-start', parentId: 'perm-16', description: '开始评估按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-47', 'perm-api-48'] },
  { id: 'perm-16-2', name: '提交评估', type: 'FUNCTION', code: 'assessment-submit', parentId: 'perm-16', description: '提交评估按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-47', 'perm-api-49'] },
  { id: 'perm-17-1', name: '查看计划', type: 'FUNCTION', code: 'plan-view', parentId: 'perm-17', description: '查看计划按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-47', 'perm-api-50'] },
  { id: 'perm-17-2', name: '选择方向', type: 'FUNCTION', code: 'plan-select', parentId: 'perm-17', description: '选择方向按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-47', 'perm-api-51'] },
  { id: 'perm-18-1', name: '申请认证', type: 'FUNCTION', code: 'certification-apply', parentId: 'perm-18', description: '申请认证按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-47', 'perm-api-52'] },
  { id: 'perm-18-2', name: '查看认证结果', type: 'FUNCTION', code: 'certification-result', parentId: 'perm-18', description: '查看认证结果按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-47', 'perm-api-53'] },
  
  // C端证书管理下的功能/按钮权限
  { id: 'perm-19-1', name: '查看证书详情', type: 'FUNCTION', code: 'certificate-detail', parentId: 'perm-19', description: '查看证书详情按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-54', 'perm-api-55'] },
  { id: 'perm-20-1', name: '申请续期', type: 'FUNCTION', code: 'renewal-apply', parentId: 'perm-20', description: '申请续期按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-54', 'perm-api-56'] },
  { id: 'perm-20-2', name: '查看续期状态', type: 'FUNCTION', code: 'renewal-status', parentId: 'perm-20', description: '查看续期状态按钮', productPort: 'C端学习系统(app)', apiPermissions: ['perm-api-54', 'perm-api-57'] },
  
  // API权限
  { id: 'perm-api-1', name: '获取部门列表', type: 'API', code: 'api-department-list', parentId: null, apiUrl: '/api/departments', description: '获取部门列表API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'permission', objectId: 'permission_user' }, { domain: 'permission', objectId: 'permission_role' }] },
  { id: 'perm-api-2', name: '新增部门API', type: 'API', code: 'api-department-add', parentId: null, apiUrl: '/api/departments', description: '新增部门API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'permission', objectId: 'permission_user' }] },
  { id: 'perm-api-3', name: '获取角色列表', type: 'API', code: 'api-role-list', parentId: null, apiUrl: '/api/roles', description: '获取角色列表API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'permission', objectId: 'permission_role' }] },
  { id: 'perm-api-3-1', name: '新增角色API', type: 'API', code: 'api-role-add', parentId: null, apiUrl: '/api/roles', description: '新增角色API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'permission', objectId: 'permission_role' }] },
  { id: 'perm-api-3-2', name: '编辑角色API', type: 'API', code: 'api-role-edit', parentId: null, apiUrl: '/api/roles', description: '编辑角色API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'permission', objectId: 'permission_role' }] },
  { id: 'perm-api-3-3', name: '删除角色API', type: 'API', code: 'api-role-delete', parentId: null, apiUrl: '/api/roles', description: '删除角色API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'permission', objectId: 'permission_role' }] },
  { id: 'perm-api-3-4', name: '配置角色权限API', type: 'API', code: 'api-role-permission', parentId: null, apiUrl: '/api/roles/permissions', description: '配置角色权限API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'permission', objectId: 'permission_role' }, { domain: 'permission', objectId: 'permission_permission' }] },
  { id: 'perm-api-4', name: '获取用户列表', type: 'API', code: 'api-user-list', parentId: null, apiUrl: '/api/users', description: '获取用户列表API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'permission', objectId: 'permission_user' }] },
  { id: 'perm-api-4-1', name: '新增用户API', type: 'API', code: 'api-user-add', parentId: null, apiUrl: '/api/users', description: '新增用户API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'permission', objectId: 'permission_user' }] },
  { id: 'perm-api-4-2', name: '编辑用户API', type: 'API', code: 'api-user-edit', parentId: null, apiUrl: '/api/users', description: '编辑用户API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'permission', objectId: 'permission_user' }] },
  { id: 'perm-api-4-3', name: '删除用户API', type: 'API', code: 'api-user-delete', parentId: null, apiUrl: '/api/users', description: '删除用户API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'permission', objectId: 'permission_user' }] },
  { id: 'perm-api-4-4', name: '分配用户角色API', type: 'API', code: 'api-user-role', parentId: null, apiUrl: '/api/users/roles', description: '分配用户角色API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'permission', objectId: 'permission_user' }, { domain: 'permission', objectId: 'permission_role' }] },
  { id: 'perm-api-5', name: '获取订单列表', type: 'API', code: 'api-order-list', parentId: null, apiUrl: '/api/orders', description: '获取订单列表API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'order', objectId: 'order_order' }, { domain: 'order', objectId: 'order_customer' }] },
  { id: 'perm-api-6', name: '获取订单列表(app)', type: 'API', code: 'api-order-list-app', parentId: null, apiUrl: '/api/app/orders', description: '获取订单列表API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'order', objectId: 'order_order' }] },
  { id: 'perm-api-7', name: '获取优惠券列表', type: 'API', code: 'api-coupon-list', parentId: null, apiUrl: '/api/coupons', description: '获取优惠券列表API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'coupon', objectId: 'coupon_coupon' }] },
  { id: 'perm-api-8', name: '发放福利API', type: 'API', code: 'api-benefit-issue', parentId: null, apiUrl: '/api/benefits', description: '发放福利API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'order', objectId: 'order_customer' }] },
  { id: 'perm-api-9', name: '差评处理API', type: 'API', code: 'api-bad-review-handle', parentId: null, apiUrl: '/api/reviews/bad', description: '差评处理API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'service', objectId: 'service_feedback' }] },
  { id: 'perm-api-10', name: '复购引导API', type: 'API', code: 'api-repeat-purchase', parentId: null, apiUrl: '/api/orders/repeat', description: '复购引导API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'order', objectId: 'order_order' }] },
  { id: 'perm-api-11', name: '售后处理API', type: 'API', code: 'api-aftersale-process', parentId: null, apiUrl: '/api/orders/aftersale', description: '售后处理API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'order', objectId: 'order_order' }, { domain: 'order', objectId: 'order_refund' }] },
  { id: 'perm-api-12', name: '优惠券发送API', type: 'API', code: 'api-coupon-send', parentId: null, apiUrl: '/api/coupons/send', description: '优惠券发送API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'coupon', objectId: 'coupon_coupon' }, { domain: 'order', objectId: 'order_customer' }] },
  { id: 'perm-api-13', name: '服务保障API', type: 'API', code: 'api-service-guarantee', parentId: null, apiUrl: '/api/orders/guarantee', description: '服务保障API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'service', objectId: 'service_service' }] },
  { id: 'perm-api-14', name: '福利发放API', type: 'API', code: 'api-benefit-issue', parentId: null, apiUrl: '/api/benefits/issue', description: '福利发放API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'order', objectId: 'order_customer' }] },
  { id: 'perm-api-15', name: '差评安抚API', type: 'API', code: 'api-bad-review-comfort', parentId: null, apiUrl: '/api/reviews/comfort', description: '差评安抚API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'service', objectId: 'service_feedback' }] },
  { id: 'perm-api-16', name: '售后跟进API', type: 'API', code: 'api-aftersale-follow', parentId: null, apiUrl: '/api/orders/follow', description: '售后跟进API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'order', objectId: 'order_order' }, { domain: 'order', objectId: 'order_refund' }] },
  { id: 'perm-api-17', name: '复购引导API', type: 'API', code: 'api-repeat-purchase', parentId: null, apiUrl: '/api/orders/repeat', description: '复购引导API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'order', objectId: 'order_order' }] },
  { id: 'perm-api-18', name: '订单归档API', type: 'API', code: 'api-order-archive', parentId: null, apiUrl: '/api/orders/archive', description: '订单归档API', productPort: '服务订单系统(app)', dataDomainObjects: [{ domain: 'order', objectId: 'order_order' }] },
  
  // 人事招聘相关API
  { id: 'perm-api-19', name: '招聘管理API', type: 'API', code: 'api-recruit-manage', parentId: null, apiUrl: '/api/recruit', description: '招聘管理API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'hr', objectId: 'hr_candidate' }] },
  { id: 'perm-api-20', name: '搜索简历API', type: 'API', code: 'api-resume-search', parentId: null, apiUrl: '/api/recruit/resumes/search', description: '搜索简历API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'hr', objectId: 'hr_candidate' }] },
  { id: 'perm-api-21', name: '浏览简历API', type: 'API', code: 'api-resume-browse', parentId: null, apiUrl: '/api/recruit/resumes', description: '浏览简历API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'hr', objectId: 'hr_candidate' }] },
  { id: 'perm-api-22', name: '下载简历API', type: 'API', code: 'api-resume-download', parentId: null, apiUrl: '/api/recruit/resumes/download', description: '下载简历API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'hr', objectId: 'hr_candidate' }] },
  { id: 'perm-api-23', name: '面试邀约API', type: 'API', code: 'api-interview-invite', parentId: null, apiUrl: '/api/recruit/interviews/invite', description: '面试邀约API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'hr', objectId: 'hr_candidate' }, { domain: 'hr', objectId: 'hr_interview' }] },
  { id: 'perm-api-24', name: '面试记录API', type: 'API', code: 'api-interview-record', parentId: null, apiUrl: '/api/recruit/interviews/record', description: '面试记录API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'hr', objectId: 'hr_interview' }] },
  { id: 'perm-api-25', name: '发送offerAPI', type: 'API', code: 'api-send-offer', parentId: null, apiUrl: '/api/recruit/offers/send', description: '发送offerAPI', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'hr', objectId: 'hr_offer' }] },
  { id: 'perm-api-26', name: '人才库API', type: 'API', code: 'api-talent-pool', parentId: null, apiUrl: '/api/recruit/talent-pool', description: '人才库API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'hr', objectId: 'hr_candidate' }] },
  { id: 'perm-api-27', name: '入职资料API', type: 'API', code: 'api-onboard-materials', parentId: null, apiUrl: '/api/onboard/materials', description: '入职资料API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'hr', objectId: 'hr_employee' }] },
  { id: 'perm-api-28', name: '入职培训API', type: 'API', code: 'api-onboard-training', parentId: null, apiUrl: '/api/onboard/training', description: '入职培训API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'hr', objectId: 'hr_employee' }] },
  { id: 'perm-api-29', name: '上岗考核API', type: 'API', code: 'api-onboard-assessment', parentId: null, apiUrl: '/api/onboard/assessment', description: '上岗考核API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'hr', objectId: 'hr_employee' }] },
  { id: 'perm-api-30', name: '入职完成API', type: 'API', code: 'api-onboard-complete', parentId: null, apiUrl: '/api/onboard/complete', description: '入职完成API', productPort: '服务订单系统(web)', dataDomainObjects: [{ domain: 'hr', objectId: 'hr_employee' }] },
  
  // C端学习培训相关API
  { id: 'perm-api-31', name: '学习培训管理API', type: 'API', code: 'api-learning-manage', parentId: null, apiUrl: '/api/learning', method: 'GET', description: '学习培训管理API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'learning', objectId: 'learning_course' }] },
  { id: 'perm-api-32', name: '浏览课程API', type: 'API', code: 'api-course-browse', parentId: null, apiUrl: '/api/learning/courses', method: 'GET', description: '浏览课程API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'learning', objectId: 'learning_course' }] },
  { id: 'perm-api-33', name: '搜索课程API', type: 'API', code: 'api-course-search', parentId: null, apiUrl: '/api/learning/courses/search', method: 'GET', description: '搜索课程API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'learning', objectId: 'learning_course' }] },
  { id: 'perm-api-34', name: '报名课程API', type: 'API', code: 'api-course-enroll', parentId: null, apiUrl: '/api/learning/courses/enroll', method: 'POST', description: '报名课程API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'learning', objectId: 'learning_enrollment' }] },
  { id: 'perm-api-35', name: '学习课程API', type: 'API', code: 'api-course-learn', parentId: null, apiUrl: '/api/learning/courses/learn', method: 'POST', description: '学习课程API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'learning', objectId: 'learning_progress' }] },
  { id: 'perm-api-36', name: '完成学习API', type: 'API', code: 'api-learning-complete', parentId: null, apiUrl: '/api/learning/complete', method: 'POST', description: '完成学习API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'learning', objectId: 'learning_progress' }] },
  { id: 'perm-api-37', name: '学习记录API', type: 'API', code: 'api-learning-record', parentId: null, apiUrl: '/api/learning/records', method: 'GET', description: '学习记录API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'learning', objectId: 'learning_record' }] },
  
  // C端考试认证相关API
  { id: 'perm-api-38', name: '考试认证管理API', type: 'API', code: 'api-exam-manage', parentId: null, apiUrl: '/api/exam', method: 'GET', description: '考试认证管理API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'exam', objectId: 'exam_exam' }] },
  { id: 'perm-api-39', name: '浏览考试API', type: 'API', code: 'api-exam-browse', parentId: null, apiUrl: '/api/exam/exams', method: 'GET', description: '浏览考试API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'exam', objectId: 'exam_exam' }] },
  { id: 'perm-api-40', name: '搜索考试API', type: 'API', code: 'api-exam-search', parentId: null, apiUrl: '/api/exam/exams/search', method: 'GET', description: '搜索考试API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'exam', objectId: 'exam_exam' }] },
  { id: 'perm-api-41', name: '考试报名API', type: 'API', code: 'api-exam-enroll', parentId: null, apiUrl: '/api/exam/exams/enroll', method: 'POST', description: '考试报名API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'exam', objectId: 'exam_enrollment' }] },
  { id: 'perm-api-42', name: '参加考试API', type: 'API', code: 'api-exam-take', parentId: null, apiUrl: '/api/exam/exams/take', method: 'POST', description: '参加考试API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'exam', objectId: 'exam_answer' }] },
  { id: 'perm-api-43', name: '提交答案API', type: 'API', code: 'api-exam-submit', parentId: null, apiUrl: '/api/exam/exams/submit', method: 'POST', description: '提交答案API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'exam', objectId: 'exam_answer' }] },
  { id: 'perm-api-44', name: '查询成绩API', type: 'API', code: 'api-score-query', parentId: null, apiUrl: '/api/exam/scores', method: 'GET', description: '查询成绩API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'exam', objectId: 'exam_score' }] },
  { id: 'perm-api-45', name: '查看证书API', type: 'API', code: 'api-certificate-view', parentId: null, apiUrl: '/api/exam/certificates', method: 'GET', description: '查看证书API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'exam', objectId: 'exam_certificate' }] },
  { id: 'perm-api-46', name: '下载证书API', type: 'API', code: 'api-certificate-download', parentId: null, apiUrl: '/api/exam/certificates/download', method: 'GET', description: '下载证书API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'exam', objectId: 'exam_certificate' }] },
  
  // C端技能提升相关API
  { id: 'perm-api-47', name: '技能提升管理API', type: 'API', code: 'api-skill-manage', parentId: null, apiUrl: '/api/skill', method: 'GET', description: '技能提升管理API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'skill', objectId: 'skill_assessment' }] },
  { id: 'perm-api-48', name: '开始评估API', type: 'API', code: 'api-assessment-start', parentId: null, apiUrl: '/api/skill/assessment/start', method: 'POST', description: '开始评估API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'skill', objectId: 'skill_assessment' }] },
  { id: 'perm-api-49', name: '提交评估API', type: 'API', code: 'api-assessment-submit', parentId: null, apiUrl: '/api/skill/assessment/submit', method: 'POST', description: '提交评估API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'skill', objectId: 'skill_assessment' }] },
  { id: 'perm-api-50', name: '查看计划API', type: 'API', code: 'api-plan-view', parentId: null, apiUrl: '/api/skill/plans', method: 'GET', description: '查看计划API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'skill', objectId: 'skill_plan' }] },
  { id: 'perm-api-51', name: '选择方向API', type: 'API', code: 'api-plan-select', parentId: null, apiUrl: '/api/skill/plans/select', method: 'POST', description: '选择方向API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'skill', objectId: 'skill_plan' }] },
  { id: 'perm-api-52', name: '申请认证API', type: 'API', code: 'api-certification-apply', parentId: null, apiUrl: '/api/skill/certification/apply', method: 'POST', description: '申请认证API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'skill', objectId: 'skill_certification' }] },
  { id: 'perm-api-53', name: '查看认证结果API', type: 'API', code: 'api-certification-result', parentId: null, apiUrl: '/api/skill/certification/result', method: 'GET', description: '查看认证结果API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'skill', objectId: 'skill_certification' }] },
  
  // C端证书管理相关API
  { id: 'perm-api-54', name: '证书管理API', type: 'API', code: 'api-certificate-manage', parentId: null, apiUrl: '/api/certificate', method: 'GET', description: '证书管理API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'certificate', objectId: 'certificate_certificate' }] },
  { id: 'perm-api-55', name: '查看证书详情API', type: 'API', code: 'api-certificate-detail', parentId: null, apiUrl: '/api/certificate/detail', method: 'GET', description: '查看证书详情API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'certificate', objectId: 'certificate_certificate' }] },
  { id: 'perm-api-56', name: '申请续期API', type: 'API', code: 'api-renewal-apply', parentId: null, apiUrl: '/api/certificate/renewal/apply', method: 'POST', description: '申请续期API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'certificate', objectId: 'certificate_renewal' }] },
  { id: 'perm-api-57', name: '查看续期状态API', type: 'API', code: 'api-renewal-status', parentId: null, apiUrl: '/api/certificate/renewal/status', method: 'GET', description: '查看续期状态API', productPort: 'C端学习系统(app)', dataDomainObjects: [{ domain: 'certificate', objectId: 'certificate_renewal' }] }
]



// 数据规则数据
export const dataRules = [
  {
    id: 'rule-1',
    name: '本人用户数据规则',
    type: 'user',
    domain: 'permission',
    objectId: 'permission_user',
    conditions: [
      { attribute: 'userId', operator: 'eq', value: '$currentUser.id' }
    ],
    scope: 'self',
    description: '只能查看本人数据'
  },
  {
    id: 'rule-2',
    name: '部门用户数据规则',
    type: 'user',
    domain: 'permission',
    objectId: 'permission_user',
    conditions: [
      { attribute: 'departmentId', operator: 'eq', value: '$currentUser.departmentId' }
    ],
    scope: 'department',
    description: '可以查看部门内所有数据'
  },
  {
    id: 'rule-3',
    name: '待面试简历规则',
    type: 'recruit',
    domain: 'hr',
    objectId: 'hr_candidate',
    conditions: [
      { attribute: 'status', operator: 'eq', value: 'pending_interview' }
    ],
    scope: 'custom',
    description: '只能查看待面试状态的简历'
  },
  {
    id: 'rule-4',
    name: '已通过面试规则',
    type: 'recruit',
    domain: 'hr',
    objectId: 'hr_candidate',
    conditions: [
      { attribute: 'interviewResult', operator: 'eq', value: 'passed' }
    ],
    scope: 'custom',
    description: '只能查看已通过面试的候选人'
  },
  {
    id: 'rule-5',
    name: '待入职员工规则',
    type: 'onboard',
    domain: 'hr',
    objectId: 'hr_employee',
    conditions: [
      { attribute: 'status', operator: 'eq', value: 'pending' }
    ],
    scope: 'custom',
    description: '只能查看待入职状态的员工'
  },
  {
    id: 'rule-6',
    name: '培训中员工规则',
    type: 'onboard',
    domain: 'hr',
    objectId: 'hr_employee',
    conditions: [
      { attribute: 'status', operator: 'eq', value: 'training' }
    ],
    scope: 'custom',
    description: '只能查看培训中状态的员工'
  },
  {
    id: 'rule-7',
    name: '待考核员工规则',
    type: 'onboard',
    domain: 'hr',
    objectId: 'hr_employee',
    conditions: [
      { attribute: 'status', operator: 'eq', value: 'pending_assessment' }
    ],
    scope: 'custom',
    description: '只能查看待考核状态的员工'
  },
  // 面试记录（interviews）相关公共策略
  {
    id: 'rule-hr-interview-1',
    name: '本周面试记录',
    type: 'interview',
    domain: 'hr',
    objectId: 'hr_interview',
    conditions: [
      { attribute: 'interviewTime', operator: 'gte', value: '$startOfWeek' },
      { attribute: 'interviewTime', operator: 'lte', value: '$endOfWeek' }
    ],
    scope: 'custom',
    description: '只查看本周内的所有面试记录'
  },
  {
    id: 'rule-hr-interview-2',
    name: '指定面试官的通过记录',
    type: 'interview',
    domain: 'hr',
    objectId: 'hr_interview',
    conditions: [
      { attribute: 'interviewerId', operator: 'eq', value: '$currentUser.id' },
      { attribute: 'result', operator: 'eq', value: 'passed' }
    ],
    scope: 'custom',
    description: '查看当前面试官负责且结果为通过的面试记录'
  },
  {
    id: 'rule-hr-interview-3',
    name: '高分候选人面试记录',
    type: 'interview',
    domain: 'hr',
    objectId: 'hr_interview',
    conditions: [
      { attribute: 'score', operator: 'gte', value: 80 },
      { attribute: 'result', operator: 'ne', value: 'failed' },
      { attribute: 'comment', operator: 'notnull', value: null }
    ],
    scope: 'custom',
    description: '筛选面试评分较高且有评价的面试记录'
  },
  {
    id: 'rule-8',
    name: '推拿师岗位规则',
    type: 'recruit',
    domain: 'hr',
    objectId: 'hr_candidate',
    conditions: [
      { attribute: 'position', operator: 'eq', value: '推拿师' }
    ],
    scope: 'custom',
    description: '只能查看推拿师岗位的招聘数据'
  },
  {
    id: 'rule-9',
    name: '高级人才规则',
    type: 'recruit',
    domain: 'hr',
    objectId: 'hr_candidate',
    conditions: [
      { attribute: 'experience', operator: 'gte', value: 3 },
      { attribute: 'education', operator: 'eq', value: '本科及以上' }
    ],
    scope: 'custom',
    description: '只能查看高级人才的招聘数据'
  },
  {
    id: 'rule-10',
    name: '招聘完成规则',
    type: 'recruit',
    domain: 'hr',
    objectId: 'hr_candidate',
    conditions: [
      { attribute: 'status', operator: 'eq', value: 'completed' }
    ],
    scope: 'custom',
    description: '只能查看已完成的招聘数据'
  },
  {
    id: 'rule-11',
    name: '入职完成规则',
    type: 'onboard',
    domain: 'hr',
    objectId: 'hr_employee',
    conditions: [
      { attribute: 'status', operator: 'eq', value: 'completed' }
    ],
    scope: 'custom',
    description: '只能查看已完成的入职数据'
  },
  {
    id: 'rule-12',
    name: '广州地区订单规则',
    type: 'recruit',
    domain: 'order',
    objectId: 'order_order',
    conditions: [
      { attribute: 'city', operator: 'eq', value: '广州市' }
    ],
    scope: 'custom',
    description: '只能查看广州地区的订单数据'
  }
]

// 业务数据
export const businesses = [
  {
    id: 'business-1',
    name: '人事招聘',
    description: '人事招聘相关业务',
    status: 'active',
    createTime: new Date('2024-01-01'),
    updateTime: new Date('2024-01-01')
  },
  {
    id: 'business-2',
    name: '订单管理',
    description: '订单管理相关业务',
    status: 'active',
    createTime: new Date('2024-01-02'),
    updateTime: new Date('2024-01-02')
  },
  // C端业务
  {
    id: 'business-c-1',
    name: '旅程类业务',
    description: '用户旅程相关的业务功能，适用于C端用户',
    status: 'active',
    createTime: new Date('2024-01-03'),
    updateTime: new Date('2024-01-03')
  },
  {
    id: 'business-c-2',
    name: '课程类业务',
    description: '课程相关的业务功能，适用于C端用户',
    status: 'active',
    createTime: new Date('2024-01-04'),
    updateTime: new Date('2024-01-04')
  },
  {
    id: 'business-c-3',
    name: '预约类业务',
    description: '预约相关的业务功能，适用于C端用户',
    status: 'active',
    createTime: new Date('2024-01-05'),
    updateTime: new Date('2024-01-05')
  },
  {
    id: 'business-c-4',
    name: '社区类业务',
    description: '社区相关的业务功能，适用于C端用户',
    status: 'active',
    createTime: new Date('2024-01-06'),
    updateTime: new Date('2024-01-06')
  },
  {
    id: 'business-c-5',
    name: '学习培训业务',
    description: '推拿师等垂直行业人员的学习培训业务，包括课程学习、技能提升等',
    status: 'active',
    createTime: new Date('2024-01-07'),
    updateTime: new Date('2024-01-07')
  },
  {
    id: 'business-c-6',
    name: '考试认证业务',
    description: '推拿师等垂直行业人员的考试认证业务，包括考试报名、成绩查询、证书颁发等',
    status: 'active',
    createTime: new Date('2024-01-08'),
    updateTime: new Date('2024-01-08')
  },
  {
    id: 'business-c-7',
    name: '技能提升业务',
    description: '推拿师等垂直行业人员的技能提升业务，包括技能评估、学习提升、技能认证等',
    status: 'active',
    createTime: new Date('2024-01-09'),
    updateTime: new Date('2024-01-09')
  },
  {
    id: 'business-c-8',
    name: '证书管理业务',
    description: '推拿师等垂直行业人员的证书管理业务，包括证书查看、续期申请、证书更新等',
    status: 'active',
    createTime: new Date('2024-01-10'),
    updateTime: new Date('2024-01-10')
  }
]

// 业务流程数据
export const businessProcesses = [
  {
    id: 'process-1',
    businessId: 'business-1',
    name: '推拿师招聘流程',
    description: '推拿师从简历筛选到入职的完整招聘流程',
    status: 'active',
    createTime: new Date('2024-01-01'),
    updateTime: new Date('2024-01-01')
  },
  {
    id: 'process-2',
    businessId: 'business-2',
    name: '服务行业订单流程',
    description: '服务行业订单从创建到归档的完整生命周期流程',
    status: 'active',
    createTime: new Date('2024-01-02'),
    updateTime: new Date('2024-01-02')
  },
  {
    id: 'process-3',
    businessId: 'business-1',
    name: '推拿师入职流程',
    description: '推拿师从入职准备到正式上岗的完整流程',
    status: 'active',
    createTime: new Date('2024-01-03'),
    updateTime: new Date('2024-01-03')
  },
  // C端业务流程
  {
    id: 'process-c-1',
    businessId: 'business-c-1',
    name: '用户旅程流程',
    description: 'C端用户在旅程类业务中的完整流程',
    status: 'active',
    createTime: new Date('2024-01-07'),
    updateTime: new Date('2024-01-07')
  },
  {
    id: 'process-c-2',
    businessId: 'business-c-2',
    name: '课程学习流程',
    description: 'C端用户学习课程的完整流程',
    status: 'active',
    createTime: new Date('2024-01-08'),
    updateTime: new Date('2024-01-08')
  },
  {
    id: 'process-c-3',
    businessId: 'business-c-3',
    name: '服务预约流程',
    description: 'C端用户预约服务的完整流程',
    status: 'active',
    createTime: new Date('2024-01-09'),
    updateTime: new Date('2024-01-09')
  },
  {
    id: 'process-c-4',
    businessId: 'business-c-5',
    name: '学习培训流程',
    description: '推拿师等垂直行业人员的学习培训完整流程，从课程浏览到完成学习',
    status: 'active',
    createTime: new Date('2024-01-11'),
    updateTime: new Date('2024-01-11')
  },
  {
    id: 'process-c-5',
    businessId: 'business-c-6',
    name: '考试认证流程',
    description: '推拿师等垂直行业人员的考试认证完整流程，从考试报名到证书颁发',
    status: 'active',
    createTime: new Date('2024-01-12'),
    updateTime: new Date('2024-01-12')
  },
  {
    id: 'process-c-6',
    businessId: 'business-c-7',
    name: '技能提升流程',
    description: '推拿师等垂直行业人员的技能提升完整流程，从技能评估到技能认证',
    status: 'active',
    createTime: new Date('2024-01-13'),
    updateTime: new Date('2024-01-13')
  },
  {
    id: 'process-c-7',
    businessId: 'business-c-8',
    name: '证书管理流程',
    description: '推拿师等垂直行业人员的证书管理完整流程，从证书查看到证书更新',
    status: 'active',
    createTime: new Date('2024-01-14'),
    updateTime: new Date('2024-01-14')
  }
]

// 流程环节数据
export const processNodes = [
  // 推拿师招聘流程环节
  {
    id: 'node-1-1',
    processId: 'process-1',
    name: '人才匹配',
    type: 'start',
    order: 1,
    description: '搜索、浏览简历，挑选符合人才需求的简历，并下载简历',
    requiredRoles: ['role-2', 'role-3'],
    permissions: ['perm-7'],
    buttonPermissions: ['perm-7-1', 'perm-7-2', 'perm-7-3'],
    apiPermissions: ['perm-api-19', 'perm-api-20', 'perm-api-21', 'perm-api-22'],
    dataRules: ['rule-1'],
    nextNodes: ['node-1-2'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-1-2',
    processId: 'process-1',
    name: '面试邀约',
    type: 'middle',
    order: 2,
    description: '从下载的简历中，再次筛选人员，发起面试邀约',
    requiredRoles: ['role-2', 'role-3'],
    permissions: ['perm-7'],
    buttonPermissions: ['perm-7-2', 'perm-7-4', 'perm-7-5'],
    apiPermissions: ['perm-api-19', 'perm-api-23', 'perm-api-24'],
    dataRules: ['rule-2'],
    nextNodes: ['node-1-3'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-1-3',
    processId: 'process-1',
    name: '人才面试',
    type: 'middle',
    order: 3,
    description: '对接受面试邀约的人才，进行面试，记录面试结果，评定将面试人员，后决定是否转入人才库存，发送offer',
    requiredRoles: ['role-2', 'role-3'],
    permissions: ['perm-7'],
    buttonPermissions: ['perm-7-2', 'perm-7-5', 'perm-7-6', 'perm-7-7'],
    apiPermissions: ['perm-api-19', 'perm-api-24', 'perm-api-25', 'perm-api-26'],
    dataRules: ['rule-3'],
    nextNodes: ['node-1-4'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-1-4',
    processId: 'process-1',
    name: '招聘完成',
    type: 'end',
    order: 4,
    description: '招聘流程完成，将合适的人才转入入职流程',
    requiredRoles: ['role-2'],
    permissions: ['perm-7'],
    buttonPermissions: ['perm-7-2', 'perm-7-6'],
    apiPermissions: ['perm-api-19', 'perm-api-25'],
    dataRules: [],
    nextNodes: [],
    condition: '',
    validityType: 'permanent'
  },
  
  // 服务行业订单流程 - 基于业务干预点设计的工作环节
  {
    id: 'node-2-1',
    processId: 'process-2',
    name: '促下单',
    type: 'start',
    order: 1,
    description: '针对特定条件的未支付订单进行促下单操作',
    requiredRoles: ['role-3'],
    permissions: ['perm-6'],
    buttonPermissions: ['perm-6-2', 'perm-6-14'],
    apiPermissions: ['perm-api-5', 'perm-api-7'],
    dataRules: ['rule-6'],
    nextNodes: ['node-2-2', 'node-2-8'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-2-2',
    processId: 'process-2',
    name: '激活使用',
    type: 'middle',
    order: 2,
    description: '针对已支付但长时间未使用的订单进行激活使用操作',
    requiredRoles: ['role-3'],
    permissions: ['perm-6'],
    buttonPermissions: ['perm-6-2', 'perm-6-7'],
    apiPermissions: ['perm-api-5'],
    dataRules: ['rule-7'],
    nextNodes: ['node-2-3', 'node-2-8'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-2-3',
    processId: 'process-2',
    name: '服务保障',
    type: 'middle',
    order: 3,
    description: '针对服务中订单进行服务保障和质量管控',
    requiredRoles: ['role-2', 'role-3'],
    permissions: ['perm-6'],
    buttonPermissions: ['perm-6-2', 'perm-6-8', 'perm-6-9', 'perm-6-15'],
    apiPermissions: ['perm-api-5'],
    dataRules: ['rule-11'],
    nextNodes: ['node-2-4', 'node-2-5'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-2-4',
    processId: 'process-2',
    name: '好评福利',
    type: 'middle',
    order: 4,
    description: '针对高评分订单进行福利发放和客户维系',
    requiredRoles: ['role-3'],
    permissions: ['perm-6'],
    buttonPermissions: ['perm-6-2', 'perm-6-16'],
    apiPermissions: ['perm-api-5', 'perm-api-8'],
    dataRules: ['rule-8'],
    nextNodes: ['node-2-8'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-2-5',
    processId: 'process-2',
    name: '差评维护',
    type: 'middle',
    order: 5,
    description: '针对低评分订单进行投诉处理和客户安抚',
    requiredRoles: ['role-3'],
    permissions: ['perm-6'],
    buttonPermissions: ['perm-6-2', 'perm-6-12', 'perm-6-17'],
    apiPermissions: ['perm-api-5', 'perm-api-9'],
    dataRules: ['rule-9'],
    nextNodes: ['node-2-6'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-2-6',
    processId: 'process-2',
    name: '售后跟进',
    type: 'middle',
    order: 6,
    description: '针对售后订单进行跟进处理和问题解决',
    requiredRoles: ['role-3'],
    permissions: ['perm-6'],
    buttonPermissions: ['perm-6-2', 'perm-6-13', 'perm-6-18'],
    apiPermissions: ['perm-api-5'],
    dataRules: ['rule-12'],
    nextNodes: ['node-2-7'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-2-7',
    processId: 'process-2',
    name: '复购引导',
    type: 'middle',
    order: 7,
    description: '针对已完成一段时间的订单进行复购引导',
    requiredRoles: ['role-3'],
    permissions: ['perm-6'],
    buttonPermissions: ['perm-6-2', 'perm-6-19'],
    apiPermissions: ['perm-api-5', 'perm-api-10'],
    dataRules: ['rule-10'],
    nextNodes: ['node-2-8'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-2-8',
    processId: 'process-2',
    name: '订单归档',
    type: 'end',
    order: 8,
    description: '将符合条件的订单进行归档处理',
    requiredRoles: ['role-2'],
    permissions: ['perm-6'],
    buttonPermissions: ['perm-6-2', 'perm-6-20'],
    apiPermissions: ['perm-api-5'],
    dataRules: ['rule-13'],
    nextNodes: [],
    condition: '',
    validityType: 'permanent'
  },
  
  // C端业务流程节点
  // 用户旅程流程节点（使用通用权限，因为旅程类业务是通用业务）
  {
    id: 'node-c-1-1',
    processId: 'process-c-1',
    name: '旅程开始',
    type: 'start',
    order: 1,
    description: '用户开始旅程',
    requiredRoles: [],
    permissions: ['perm-9'],
    buttonPermissions: ['perm-9-1'],
    apiPermissions: ['perm-api-31', 'perm-api-32'],
    dataRules: [],
    nextNodes: ['node-c-1-2'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-1-2',
    processId: 'process-c-1',
    name: '旅程进行中',
    type: 'middle',
    order: 2,
    description: '用户进行旅程中的各种操作',
    requiredRoles: [],
    permissions: ['perm-10'],
    buttonPermissions: ['perm-10-1', 'perm-10-2'],
    apiPermissions: ['perm-api-31', 'perm-api-35'],
    dataRules: [],
    nextNodes: ['node-c-1-3'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-1-3',
    processId: 'process-c-1',
    name: '旅程完成',
    type: 'end',
    order: 3,
    description: '用户完成旅程',
    requiredRoles: [],
    permissions: ['perm-11'],
    buttonPermissions: ['perm-11-1'],
    apiPermissions: ['perm-api-31', 'perm-api-37'],
    dataRules: [],
    nextNodes: [],
    condition: '',
    validityType: 'permanent'
  },
  
  // 课程学习流程节点（使用学习培训权限）
  {
    id: 'node-c-2-1',
    processId: 'process-c-2',
    name: '课程浏览',
    type: 'start',
    order: 1,
    description: '用户浏览课程列表',
    requiredRoles: [],
    permissions: ['perm-9'],
    buttonPermissions: ['perm-9-1', 'perm-9-2'],
    apiPermissions: ['perm-api-31', 'perm-api-32', 'perm-api-33'],
    dataRules: [],
    nextNodes: ['node-c-2-2'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-2-2',
    processId: 'process-c-2',
    name: '课程学习',
    type: 'middle',
    order: 2,
    description: '用户学习课程内容',
    requiredRoles: [],
    permissions: ['perm-10'],
    buttonPermissions: ['perm-10-1', 'perm-10-2'],
    apiPermissions: ['perm-api-31', 'perm-api-35'],
    dataRules: [],
    nextNodes: ['node-c-2-3'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-2-3',
    processId: 'process-c-2',
    name: '课程完成',
    type: 'end',
    order: 3,
    description: '用户完成课程学习',
    requiredRoles: [],
    permissions: ['perm-10', 'perm-11'],
    buttonPermissions: ['perm-10-3', 'perm-11-1'],
    apiPermissions: ['perm-api-31', 'perm-api-36', 'perm-api-37'],
    dataRules: [],
    nextNodes: [],
    condition: '',
    validityType: 'permanent'
  },
  
  // 服务预约流程节点（使用通用权限）
  {
    id: 'node-c-3-1',
    processId: 'process-c-3',
    name: '服务选择',
    type: 'start',
    order: 1,
    description: '用户选择需要预约的服务',
    requiredRoles: [],
    permissions: ['perm-9'],
    buttonPermissions: ['perm-9-1', 'perm-9-2'],
    apiPermissions: ['perm-api-31', 'perm-api-32', 'perm-api-33'],
    dataRules: [],
    nextNodes: ['node-c-3-2'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-3-2',
    processId: 'process-c-3',
    name: '预约确认',
    type: 'middle',
    order: 2,
    description: '用户确认预约信息',
    requiredRoles: [],
    permissions: ['perm-9'],
    buttonPermissions: ['perm-9-3'],
    apiPermissions: ['perm-api-31', 'perm-api-34'],
    dataRules: [],
    nextNodes: ['node-c-3-3'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-3-3',
    processId: 'process-c-3',
    name: '预约完成',
    type: 'end',
    order: 3,
    description: '用户完成服务预约',
    requiredRoles: [],
    permissions: ['perm-11'],
    buttonPermissions: ['perm-11-1'],
    apiPermissions: ['perm-api-31', 'perm-api-37'],
    dataRules: [],
    nextNodes: [],
    condition: '',
    validityType: 'permanent'
  },
  
  // 学习培训流程节点
  {
    id: 'node-c-4-1',
    processId: 'process-c-4',
    name: '课程浏览',
    type: 'start',
    order: 1,
    description: '推拿师浏览可学习的课程列表',
    requiredRoles: [],
    permissions: ['perm-9'],
    buttonPermissions: ['perm-9-1', 'perm-9-2'],
    apiPermissions: ['perm-api-31', 'perm-api-32', 'perm-api-33'],
    dataRules: [],
    nextNodes: ['node-c-4-2'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-4-2',
    processId: 'process-c-4',
    name: '课程报名',
    type: 'middle',
    order: 2,
    description: '推拿师选择并报名感兴趣的课程',
    requiredRoles: [],
    permissions: ['perm-9'],
    buttonPermissions: ['perm-9-3'],
    apiPermissions: ['perm-api-31', 'perm-api-34'],
    dataRules: [],
    nextNodes: ['node-c-4-3'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-4-3',
    processId: 'process-c-4',
    name: '学习课程',
    type: 'middle',
    order: 3,
    description: '推拿师开始学习课程内容，记录学习进度',
    requiredRoles: [],
    permissions: ['perm-10'],
    buttonPermissions: ['perm-10-1', 'perm-10-2'],
    apiPermissions: ['perm-api-31', 'perm-api-35'],
    dataRules: [],
    nextNodes: ['node-c-4-4'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-4-4',
    processId: 'process-c-4',
    name: '完成学习',
    type: 'end',
    order: 4,
    description: '推拿师完成课程学习，获得学习证书',
    requiredRoles: [],
    permissions: ['perm-10', 'perm-11'],
    buttonPermissions: ['perm-10-3', 'perm-11-1'],
    apiPermissions: ['perm-api-31', 'perm-api-36', 'perm-api-37'],
    dataRules: [],
    nextNodes: [],
    condition: '',
    validityType: 'permanent'
  },
  
  // 考试认证流程节点
  {
    id: 'node-c-5-1',
    processId: 'process-c-5',
    name: '考试浏览',
    type: 'start',
    order: 1,
    description: '推拿师浏览可报名的考试列表',
    requiredRoles: [],
    permissions: ['perm-12'],
    buttonPermissions: ['perm-12-1', 'perm-12-2'],
    apiPermissions: ['perm-api-38', 'perm-api-39', 'perm-api-40'],
    dataRules: [],
    nextNodes: ['node-c-5-2'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-5-2',
    processId: 'process-c-5',
    name: '考试报名',
    type: 'middle',
    order: 2,
    description: '推拿师选择并报名需要参加的考试',
    requiredRoles: [],
    permissions: ['perm-13'],
    buttonPermissions: ['perm-13-1'],
    apiPermissions: ['perm-api-38', 'perm-api-41'],
    dataRules: [],
    nextNodes: ['node-c-5-3'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-5-3',
    processId: 'process-c-5',
    name: '参加考试',
    type: 'middle',
    order: 3,
    description: '推拿师参加考试并提交答案',
    requiredRoles: [],
    permissions: ['perm-13'],
    buttonPermissions: ['perm-13-2', 'perm-13-3'],
    apiPermissions: ['perm-api-38', 'perm-api-42', 'perm-api-43'],
    dataRules: [],
    nextNodes: ['node-c-5-4'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-5-4',
    processId: 'process-c-5',
    name: '成绩查询',
    type: 'middle',
    order: 4,
    description: '推拿师查询考试成绩',
    requiredRoles: [],
    permissions: ['perm-14'],
    buttonPermissions: ['perm-14-1'],
    apiPermissions: ['perm-api-38', 'perm-api-44'],
    dataRules: [],
    nextNodes: ['node-c-5-5'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-5-5',
    processId: 'process-c-5',
    name: '证书颁发',
    type: 'end',
    order: 5,
    description: '推拿师获得考试认证证书',
    requiredRoles: [],
    permissions: ['perm-15'],
    buttonPermissions: ['perm-15-1', 'perm-15-2'],
    apiPermissions: ['perm-api-38', 'perm-api-45', 'perm-api-46'],
    dataRules: [],
    nextNodes: [],
    condition: '',
    validityType: 'permanent'
  },
  
  // 技能提升流程节点
  {
    id: 'node-c-6-1',
    processId: 'process-c-6',
    name: '技能评估',
    type: 'start',
    order: 1,
    description: '推拿师进行技能水平评估',
    requiredRoles: [],
    permissions: ['perm-16'],
    buttonPermissions: ['perm-16-1', 'perm-16-2'],
    apiPermissions: ['perm-api-47', 'perm-api-48', 'perm-api-49'],
    dataRules: [],
    nextNodes: ['node-c-6-2'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-6-2',
    processId: 'process-c-6',
    name: '选择提升方向',
    type: 'middle',
    order: 2,
    description: '推拿师根据评估结果选择技能提升方向',
    requiredRoles: [],
    permissions: ['perm-17'],
    buttonPermissions: ['perm-17-1', 'perm-17-2'],
    apiPermissions: ['perm-api-47', 'perm-api-50', 'perm-api-51'],
    dataRules: [],
    nextNodes: ['node-c-6-3'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-6-3',
    processId: 'process-c-6',
    name: '学习提升',
    type: 'middle',
    order: 3,
    description: '推拿师按照提升计划进行学习',
    requiredRoles: [],
    permissions: ['perm-10'],
    buttonPermissions: ['perm-10-1', 'perm-10-2'],
    apiPermissions: ['perm-api-31', 'perm-api-35'],
    dataRules: [],
    nextNodes: ['node-c-6-4'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-6-4',
    processId: 'process-c-6',
    name: '技能认证',
    type: 'end',
    order: 4,
    description: '推拿师申请并获得技能认证',
    requiredRoles: [],
    permissions: ['perm-18'],
    buttonPermissions: ['perm-18-1', 'perm-18-2'],
    apiPermissions: ['perm-api-47', 'perm-api-52', 'perm-api-53'],
    dataRules: [],
    nextNodes: [],
    condition: '',
    validityType: 'permanent'
  },
  
  // 证书管理流程节点
  {
    id: 'node-c-7-1',
    processId: 'process-c-7',
    name: '证书查看',
    type: 'start',
    order: 1,
    description: '推拿师查看已获得的证书',
    requiredRoles: [],
    permissions: ['perm-19'],
    buttonPermissions: ['perm-19-1'],
    apiPermissions: ['perm-api-54', 'perm-api-55'],
    dataRules: [],
    nextNodes: ['node-c-7-2'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-7-2',
    processId: 'process-c-7',
    name: '证书续期申请',
    type: 'middle',
    order: 2,
    description: '推拿师申请证书续期',
    requiredRoles: [],
    permissions: ['perm-20'],
    buttonPermissions: ['perm-20-1'],
    apiPermissions: ['perm-api-54', 'perm-api-56'],
    dataRules: [],
    nextNodes: ['node-c-7-3'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-7-3',
    processId: 'process-c-7',
    name: '续期审核',
    type: 'middle',
    order: 3,
    description: '系统审核证书续期申请',
    requiredRoles: [],
    permissions: ['perm-20'],
    buttonPermissions: ['perm-20-2'],
    apiPermissions: ['perm-api-54', 'perm-api-57'],
    dataRules: [],
    nextNodes: ['node-c-7-4'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-c-7-4',
    processId: 'process-c-7',
    name: '证书更新',
    type: 'end',
    order: 4,
    description: '推拿师证书续期成功，证书信息更新',
    requiredRoles: [],
    permissions: ['perm-19'],
    buttonPermissions: ['perm-19-1'],
    apiPermissions: ['perm-api-54', 'perm-api-55'],
    dataRules: [],
    nextNodes: [],
    condition: '',
    validityType: 'permanent'
  },
  
  // 推拿师入职流程环节
  {
    id: 'node-3-1',
    processId: 'process-3',
    name: '入职准备',
    type: 'start',
    order: 1,
    description: '为新入职员工准备相关资料和手续',
    requiredRoles: ['role-3'],
    permissions: ['perm-8'],
    buttonPermissions: ['perm-8-1'],
    apiPermissions: ['perm-api-19', 'perm-api-27'],
    dataRules: ['rule-1'],
    nextNodes: ['node-3-2'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-3-2',
    processId: 'process-3',
    name: '入职培训',
    type: 'middle',
    order: 2,
    description: '对新员工进行岗位培训和技能考核',
    requiredRoles: ['role-3'],
    permissions: ['perm-8'],
    buttonPermissions: ['perm-8-2'],
    apiPermissions: ['perm-api-19', 'perm-api-28'],
    dataRules: ['rule-2'],
    nextNodes: ['node-3-3'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-3-3',
    processId: 'process-3',
    name: '上岗考核',
    type: 'middle',
    order: 3,
    description: '对培训后的员工进行上岗考核',
    requiredRoles: ['role-2', 'role-3'],
    permissions: ['perm-8'],
    buttonPermissions: ['perm-8-3'],
    apiPermissions: ['perm-api-19', 'perm-api-29'],
    dataRules: ['rule-3'],
    nextNodes: ['node-3-4'],
    condition: '',
    validityType: 'nodeDuration'
  },
  {
    id: 'node-3-4',
    processId: 'process-3',
    name: '正式上岗',
    type: 'end',
    order: 4,
    description: '员工通过考核，正式上岗',
    requiredRoles: ['role-2'],
    permissions: ['perm-8'],
    buttonPermissions: ['perm-8-4'],
    apiPermissions: ['perm-api-19', 'perm-api-30'],
    dataRules: ['rule-4'],
    nextNodes: [],
    condition: '',
    validityType: 'permanent'
  }
]

// 流程实例数据
export const processInstances = [
  {
    id: 'instance-1',
    processId: 'process-1',
    businessId: 'recruit-1',
    currentNodeId: 'node-1-2',
    status: 'running',
    createTime: new Date('2024-01-10'),
    completedTime: null,
    participants: ['user-1', 'user-2']
  },
  {
    id: 'instance-2',
    processId: 'process-2',
    businessId: 'order-1',
    currentNodeId: 'node-2-3',
    status: 'completed',
    createTime: new Date('2024-01-05'),
    completedTime: new Date('2024-01-06'),
    participants: ['user-1', 'user-2']
  },
  {
    id: 'instance-3',
    processId: 'process-3',
    businessId: 'onboard-1',
    currentNodeId: 'node-3-2',
    status: 'running',
    createTime: new Date('2024-01-15'),
    completedTime: null,
    participants: ['user-2', 'user-3']
  },
  {
    id: 'instance-4',
    processId: 'process-1',
    businessId: 'recruit-2',
    currentNodeId: 'node-1-3',
    status: 'running',
    createTime: new Date('2024-01-20'),
    completedTime: null,
    participants: ['user-3', 'user-4']
  }
]

// 流程任务数据
export const processTasks = [
  {
    id: 'task-1',
    instanceId: 'instance-1',
    nodeId: 'node-1-2',
    assigneeId: 'user-2',
    status: 'pending',
    createTime: new Date('2024-01-10'),
    completedTime: null,
    action: ''
  },
  {
    id: 'task-2',
    instanceId: 'instance-2',
    nodeId: 'node-2-3',
    assigneeId: 'user-1',
    status: 'completed',
    createTime: new Date('2024-01-05'),
    completedTime: new Date('2024-01-06'),
    action: 'complete'
  },
  {
    id: 'task-3',
    instanceId: 'instance-3',
    nodeId: 'node-3-2',
    assigneeId: 'user-3',
    status: 'pending',
    createTime: new Date('2024-01-15'),
    completedTime: null,
    action: ''
  },
  {
    id: 'task-4',
    instanceId: 'instance-4',
    nodeId: 'node-1-3',
    assigneeId: 'user-4',
    status: 'pending',
    createTime: new Date('2024-01-20'),
    completedTime: null,
    action: ''
  }
]

// 角色数据（更新）
export const roles = [
  {
    id: 'role-1',
    name: '超级管理员',
    description: '拥有所有权限',
    permissions: permissions.map(p => p.id), // 超级管理员拥有所有权限
    dataRules: [],
    inheritRoleId: null,
    processRoles: [],
    permissionValidity: {
      defaultValidityType: 'permanent'
    }
  },
  {
    id: 'role-2',
    name: '运营总监',
    description: '运营部门负责人，拥有运营相关权限',
    permissions: ['perm-1', 'perm-2', 'perm-3', 'perm-4', 'perm-6', 'perm-7', 'perm-8', 'perm-api-1', 'perm-api-3', 'perm-api-4', 'perm-api-5', 'perm-api-6', 'perm-api-19', 'perm-api-20', 'perm-api-21', 'perm-api-22', 'perm-api-23', 'perm-api-24', 'perm-api-25', 'perm-api-26', 'perm-api-27', 'perm-api-28', 'perm-api-29', 'perm-api-30'],
    dataRules: [],
    inheritRoleId: null,
    processRoles: [
      {
        processId: 'process-1',
        nodeId: 'node-1-1',
        permissionIds: ['perm-7', 'perm-api-19', 'perm-api-20', 'perm-api-21', 'perm-api-22'],
        dataRuleIds: ['rule-3'],
        validityType: 'nodeDuration',
        validityDuration: 0,
        description: '人才匹配环节权限'
      },
      {
        processId: 'process-1',
        nodeId: 'node-1-3',
        permissionIds: ['perm-7', 'perm-api-19', 'perm-api-24', 'perm-api-25', 'perm-api-26'],
        dataRuleIds: [],
        validityType: 'permanent',
        validityDuration: 0,
        description: '人才面试环节权限'
      }
    ],
    permissionValidity: {
      defaultValidityType: 'permanent'
    }
  },
  {
    id: 'role-3',
    name: '运营专员',
    description: '负责日常运营工作',
    permissions: ['perm-1', 'perm-6', 'perm-7', 'perm-8', 'perm-api-5', 'perm-api-6', 'perm-api-19', 'perm-api-20', 'perm-api-21', 'perm-api-22', 'perm-api-23', 'perm-api-24', 'perm-api-27', 'perm-api-28', 'perm-api-29'],
    dataRules: [],
    inheritRoleId: null,
    processRoles: [
      {
        processId: 'process-1',
        nodeId: 'node-1-1',
        permissionIds: ['perm-7', 'perm-api-19', 'perm-api-20', 'perm-api-21', 'perm-api-22'],
        dataRuleIds: ['rule-3'],
        validityType: 'nodeDuration',
        validityDuration: 0,
        description: '人才匹配环节权限'
      }
    ],
    permissionValidity: {
      defaultValidityType: 'nodeDuration'
    }
  },
  {
    id: 'role-4',
    name: '技术总监',
    description: '技术部门负责人',
    permissions: ['perm-1', 'perm-2', 'perm-3', 'perm-4', 'perm-api-1', 'perm-api-3', 'perm-api-4'],
    dataRules: [],
    inheritRoleId: null,
    processRoles: [],
    permissionValidity: {
      defaultValidityType: 'permanent'
    }
  },
  {
    id: 'role-5',
    name: '平台初始身份',
    description: '拥有基础权限',
    permissions: ['perm-1'],
    dataRules: [],
    inheritRoleId: null,
    processRoles: [],
    permissionValidity: {
      defaultValidityType: 'permanent'
    }
  }
]

// 用户数据
export const users = [
  {
    id: 'user-1',
    name: '张三',
    username: 'zhangsan',
    employeeNo: 'EMP001',
    uid: '',
    departmentId: 'dept-1-1-3',
    departmentName: '运营部',
    positionId: 'pos-1',
    positionName: '部门负责人',
    roles: ['role-2'],
    attributes: {
      manageScope: 'southwest',
      business节点: 'operation'
    },
    processTasks: ['task-2']
  },
  {
    id: 'user-2',
    name: '李四',
    username: 'lisi',
    employeeNo: 'EMP002',
    uid: 'uid-002',
    departmentId: 'dept-1-1-3-1',
    departmentName: '运营一部',
    positionId: 'pos-2',
    positionName: '运营专员',
    roles: ['role-3'],
    attributes: {
      manageScope: 'sichuan',
      business节点: 'operation'
    },
    processTasks: ['task-1']
  },
  {
    id: 'user-3',
    name: '王五',
    username: 'wangwu',
    employeeNo: 'EMP003',
    uid: '',
    departmentId: 'dept-1-3',
    departmentName: '技术部',
    positionId: 'pos-3',
    positionName: '技术总监',
    roles: ['role-4'],
    attributes: {
      manageScope: 'all',
      business节点: 'technology'
    },
    processTasks: []
  },
  {
    id: 'user-4',
    name: '赵六',
    username: 'zhaoliu',
    employeeNo: 'EMP004',
    uid: '',
    departmentId: 'dept-1-3-1',
    departmentName: '前端开发',
    positionId: 'pos-4',
    positionName: '前端工程师',
    roles: ['role-5'],
    attributes: {
      manageScope: 'frontend',
      business节点: 'development'
    },
    processTasks: []
  },
  {
    id: 'user-5',
    name: '孙七',
    username: 'sunqi',
    employeeNo: 'EMP005',
    uid: '',
    departmentId: 'dept-1-4',
    departmentName: '财务部',
    positionId: 'pos-6',
    positionName: '财务主管',
    roles: ['role-5'],
    attributes: {
      manageScope: 'finance',
      business节点: 'finance'
    },
    processTasks: []
  },
  {
    id: 'user-6',
    name: '周八',
    username: 'zhouba',
    employeeNo: 'EMP006',
    uid: '',
    departmentId: 'dept-1-1-3-2',
    departmentName: '运营二部',
    positionId: 'pos-2',
    positionName: '运营专员',
    roles: ['role-3'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-7',
    name: '吴九',
    username: 'wujiu',
    employeeNo: 'EMP007',
    uid: '',
    departmentId: 'dept-1-1-3-3',
    departmentName: '运营三部',
    positionId: 'pos-2',
    positionName: '运营专员',
    roles: ['role-3'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-8',
    name: '郑十',
    username: 'zhengshi',
    employeeNo: 'EMP008',
    uid: '',
    departmentId: 'dept-1-3-2',
    departmentName: '后端开发',
    positionId: 'pos-5',
    positionName: '后端工程师',
    roles: ['role-5'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-9',
    name: '钱十一',
    username: 'qianshiyi',
    employeeNo: 'EMP009',
    uid: '',
    departmentId: 'dept-1-3-1',
    departmentName: '前端开发',
    positionId: 'pos-4',
    positionName: '前端工程师',
    roles: ['role-5'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-10',
    name: '孙十二',
    username: 'sunshier',
    employeeNo: 'EMP010',
    uid: '',
    departmentId: 'dept-1-3-3',
    departmentName: '测试部',
    positionId: 'pos-4',
    positionName: '测试工程师',
    roles: ['role-5'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-11',
    name: '李十三',
    username: 'lishisan',
    employeeNo: 'EMP011',
    uid: '',
    departmentId: 'dept-1-3-4',
    departmentName: '运维部',
    positionId: 'pos-4',
    positionName: '运维工程师',
    roles: ['role-5'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-12',
    name: '王十四',
    username: 'wangshisi',
    employeeNo: 'EMP012',
    uid: '',
    departmentId: 'dept-1-5',
    departmentName: '人事部',
    positionId: 'pos-6',
    positionName: '人事主管',
    roles: ['role-5'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-13',
    name: '张十五',
    username: 'zhangshiwu',
    employeeNo: 'EMP013',
    uid: '',
    departmentId: 'dept-1-5-1',
    departmentName: '招聘组',
    positionId: 'pos-7',
    positionName: '招聘专员',
    roles: ['role-5'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-14',
    name: '赵十六',
    username: 'zhaoshiliu',
    employeeNo: 'EMP014',
    uid: '',
    departmentId: 'dept-1-5-2',
    departmentName: '培训组',
    positionId: 'pos-7',
    positionName: '培训专员',
    roles: ['role-5'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-15',
    name: '刘十七',
    username: 'liushiqi',
    employeeNo: 'EMP015',
    uid: '',
    departmentId: 'dept-1-1-1-1',
    departmentName: '销售部',
    positionId: 'pos-2',
    positionName: '销售专员',
    roles: ['role-5'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-16',
    name: '陈十八',
    username: 'chenshiba',
    employeeNo: 'EMP016',
    uid: '',
    departmentId: 'dept-1-1-1-1',
    departmentName: '销售部',
    positionId: 'pos-2',
    positionName: '销售专员',
    roles: ['role-5'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-17',
    name: '杨十九',
    username: 'yangshijiu',
    employeeNo: 'EMP017',
    uid: '',
    departmentId: 'dept-1-1-1-2',
    departmentName: '客服部',
    positionId: 'pos-2',
    positionName: '客服专员',
    roles: ['role-5'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-18',
    name: '黄二十',
    username: 'huangershi',
    employeeNo: 'EMP018',
    uid: '',
    departmentId: 'dept-1-1-1-1',
    departmentName: '销售部',
    positionId: 'pos-1',
    positionName: '部门负责人',
    roles: ['role-2'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-19',
    name: '徐二一',
    username: 'xuereryi',
    employeeNo: 'EMP019',
    uid: '',
    departmentId: 'dept-1-1-1-2',
    departmentName: '客服部',
    positionId: 'pos-1',
    positionName: '部门负责人',
    roles: ['role-2'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-20',
    name: '朱二二',
    username: 'zhuerer',
    employeeNo: 'EMP020',
    uid: '',
    departmentId: 'dept-1-1-2-1',
    departmentName: '杭州西湖店',
    positionId: 'pos-2',
    positionName: '店长',
    roles: ['role-3'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-21',
    name: '林二三',
    username: 'linersan',
    employeeNo: 'EMP021',
    uid: '',
    departmentId: 'dept-1-2-1-1',
    departmentName: '广州天河店',
    positionId: 'pos-2',
    positionName: '店长',
    roles: ['role-3'],
    attributes: {},
    processTasks: []
  },
  {
    id: 'user-22',
    name: '何二四',
    username: 'heersi',
    employeeNo: 'EMP022',
    uid: '',
    departmentId: 'dept-1-2-1-2',
    departmentName: '广州越秀店',
    positionId: 'pos-2',
    positionName: '店长',
    roles: ['role-3'],
    attributes: {},
    processTasks: []
  }
]

// 薪酬模板数据
export const compensationTemplates = [
  {
    id: '1109491319435526144',
    name: '全职推拿师模板',
    templateType: '标准',
    position: '推拿师',
    belongTo: '业务',
    coopMode: '劳动合同-全职',
    personCount: 12,
    updateTime: '2026-05-20 14:42:24',
    incomeItems: [
      { name: '计件提成', level: '1', formula: '订单金额 × 提成比例' },
      { name: '超产值奖金', level: '1', formula: '超出部分 × 奖励比例' },
      { name: '超时加班费', level: '1', formula: '加班时长 × 单价' },
      { name: '保底获豆', level: '2', formula: 'max(0, 最低工资 - 第1级收入)' }
    ],
    deductItems: [
      { name: '投诉扣款', level: '1', formula: '投诉次数 × 单次扣款' },
      { name: '代扣社保', level: '系统', formula: '自动获取（城市基准系数）' },
      { name: '代扣公积金', level: '系统', formula: '自动获取（城市基准系数）' },
      { name: '代扣个税', level: '系统', formula: '百旺服务计算' }
    ],
    companyCostItems: []
  },
  {
    id: '1109491319435526147',
    name: '非全日制推拿师模板',
    templateType: '标准',
    position: '推拿师',
    belongTo: '业务',
    coopMode: '非全日制劳动合同',
    personCount: 6,
    updateTime: '2026-05-21 09:15:30',
    incomeItems: [
      { name: '计件提成', level: '1', formula: '订单金额 × 提成比例' },
      { name: '超产值奖金', level: '1', formula: '超出部分 × 奖励比例' },
      { name: '超时加班费', level: '1', formula: '加班时长 × 单价' }
    ],
    deductItems: [
      { name: '预扣个税', level: '系统', formula: '(收入-扣缴) × 3%' },
      { name: '代扣个税', level: '系统', formula: '百旺服务计算（月末汇算）' }
    ],
    companyCostItems: [
      { name: '工伤险', insuranceType: '工伤险', burden: '公司全额' }
    ]
  },
  {
    id: '1109491319435526145',
    name: '兼职推拿师模板',
    templateType: '标准',
    position: '推拿师',
    belongTo: '业务',
    coopMode: '劳务合作-兼职',
    personCount: 8,
    updateTime: '2026-05-19 10:20:15',
    incomeItems: [
      { name: '计件提成', level: '1', formula: '订单金额 × 提成比例' },
      { name: '超时加班费', level: '1', formula: '加班时长 × 单价' }
    ],
    deductItems: [
      { name: '预扣个税', level: '系统', formula: '(收入-扣缴) × 3%' },
      { name: '代扣个税', level: '系统', formula: '百旺服务计算（月末汇算）' }
    ],
    companyCostItems: [
      { name: '雇主险', insuranceType: '雇主险', burden: '公司全额' }
    ]
  },
  {
    id: '1109491319435526148',
    name: '全职客户经理模板',
    templateType: '标准',
    position: '客户经理',
    belongTo: '业务',
    coopMode: '劳动合同-全职',
    personCount: 5,
    updateTime: '2026-05-18 16:30:00',
    incomeItems: [
      { name: '计件提成', level: '1', formula: '订单金额 × 提成比例' },
      { name: '超产值奖金', level: '1', formula: '超出部分 × 奖励比例' },
      { name: '超时加班费', level: '1', formula: '加班时长 × 单价' },
      { name: '保底获豆', level: '2', formula: 'max(0, 最低工资 - 第1级收入)' }
    ],
    deductItems: [
      { name: '投诉扣款', level: '1', formula: '投诉次数 × 单次扣款' },
      { name: '代扣社保', level: '系统', formula: '自动获取（城市基准系数）' },
      { name: '代扣公积金', level: '系统', formula: '自动获取（城市基准系数）' },
      { name: '代扣个税', level: '系统', formula: '百旺服务计算' }
    ],
    companyCostItems: []
  },
  {
    id: '1109491319435526149',
    name: '全职总部岗位模板',
    templateType: '标准',
    position: '总部职能',
    belongTo: '职能',
    coopMode: '劳动合同-全职',
    personCount: 10,
    updateTime: '2026-05-17 11:00:00',
    incomeItems: [
      { name: '基本工资', level: '1', formula: '固定金额' },
      { name: '绩效奖金', level: '1', formula: '根据考核结果' },
      { name: '加班费', level: '1', formula: '加班时长 × 单价' }
    ],
    deductItems: [
      { name: '代扣社保', level: '系统', formula: '自动获取（城市基准系数）' },
      { name: '代扣公积金', level: '系统', formula: '自动获取（城市基准系数）' },
      { name: '代扣个税', level: '系统', formula: '百旺服务计算' }
    ],
    companyCostItems: []
  }
]

// 薪酬发放策略数据源
export const distributionStrategies = [
  {
    id: '1109493788878143489',
    name: '全职推拿师发放策略（v1和v2具有营销折扣获豆和回头客补贴）',
    business: '业务',
    position: '推拿师',
    templateId: '1109491319435526144',
    templateName: '全职推拿师模板',
    coopMode: '劳动合同-全职',
    validityType: 'longterm',
    validityPeriod: '长期有效',
    dateRange: null,
    personCount: 1080,
    updateTime: '2026-05-19 10:30:00',
    conditions: [
      { field: 'employmentType', operator: '=', valueType: 'reference', value: 'fulltime' },
      { field: 'position', operator: '=', valueType: 'reference', value: '推拿师' },
      { field: 'level', operator: '<', valueType: 'input', value: '3' }
    ],
    payrollSlips: [
      {
        name: '推拿师计件',
        frequency: '月',
        calculateDate: '次月/10日',
        dataDateStart: '本月/1日',
        dataDateEnd: '本月/末日',
        notifyDate: '次月1日',
        paymentDate: '次月2日',
        delayConfirm: '次日发放',
        paymentEntity: '合同主体',
        incomeGroups: [
          {
            name: '计件收入',
            items: [
              { id: 1, displayName: '计件提成', category: '全职推拿师提成13', itemName: '计件提成' },
              { id: 2, displayName: '超产奖金', category: '全职推拿师提成13', itemName: '超产值奖金' }
            ]
          }
        ],
        deductGroups: [
          {
            name: '代扣社保/公积金',
            items: [
              { id: 1, displayName: '代扣社保', category: '全职推拿师扣缴13', itemName: '代扣社保' },
              { id: 2, displayName: '代扣公积金', category: '全职推拿师扣缴13', itemName: '代扣公积金' }
            ]
          }
        ]
      },
      {
        name: '推拿师加班',
        frequency: '月',
        calculateDate: '次月/10日',
        dataDateStart: '本月/1日',
        dataDateEnd: '本月/末日',
        notifyDate: '次月1日',
        paymentDate: '次月3日',
        delayConfirm: '次日发放',
        paymentEntity: '合同主体',
        incomeGroups: [
          {
            name: '加班费',
            items: [
              { id: 1, displayName: '超时加班费', category: '全职推拿师提成13', itemName: '超时加班费' }
            ]
          }
        ],
        deductGroups: [
          {
            name: '代扣个税',
            items: [
              { id: 1, displayName: '代扣个税', category: '系统代扣13', itemName: '代扣个税' }
            ]
          }
        ]
      }
    ],
    beanSlips: [
      {
        name: '常乐豆发放',
        frequency: '月',
        calculateDate: '次月/10日',
        dataDateStart: '本月/1日',
        dataDateEnd: '本月/末日',
        notifyDate: '次月30日',
        paymentDate: '次月31日',
        paymentEntity: '合同主体',
        settlementAccount: '余额账户',
        incomeGroups: [
          {
            name: '常乐豆',
            items: [
              { id: 1, displayName: '回头客补贴', category: '全职推拿师获豆13', itemName: '回头客补贴' },
              { id: 2, displayName: '营销折扣补贴', category: '全职推拿师获豆13', itemName: '营销折扣补贴' }
            ]
          }
        ],
        deductGroups: [
          {
            name: '扣豆',
            items: [
              { id: 1, displayName: '卫生扣豆', category: '扣豆项13', itemName: '卫生未打扫扣豆' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '1109493788878143500',
    name: '全职推拿师发放策略（v3没有营销折扣获豆和回头客补贴）',
    business: '业务',
    position: '推拿师',
    templateId: '1109491319435526144',
    templateName: '全职推拿师模板',
    coopMode: '劳动合同-全职',
    validityType: 'longterm',
    validityPeriod: '长期有效',
    dateRange: null,
    personCount: 606,
    updateTime: '2026-05-19 10:32:00',
    conditions: [
      { field: 'employmentType', operator: '=', valueType: 'reference', value: 'fulltime' },
      { field: 'position', operator: '=', valueType: 'reference', value: '推拿师' },
      { field: 'level', operator: '>=', valueType: 'input', value: '3' }
    ],
    payrollSlips: [
      {
        name: '推拿师计件',
        frequency: '月',
        calculateDate: '次月/10日',
        dataDateStart: '本月/1日',
        dataDateEnd: '本月/末日',
        notifyDate: '次月1日',
        paymentDate: '次月2日',
        delayConfirm: '次日发放',
        paymentEntity: '合同主体',
        incomeGroups: [
          {
            name: '计件收入',
            items: [
              { id: 1, displayName: '计件提成', category: '全职推拿师提成13', itemName: '计件提成' },
              { id: 2, displayName: '超产奖金', category: '全职推拿师提成13', itemName: '超产值奖金' }
            ]
          }
        ],
        deductGroups: [
          {
            name: '代扣社保/公积金',
            items: [
              { id: 1, displayName: '代扣社保', category: '全职推拿师扣缴13', itemName: '代扣社保' },
              { id: 2, displayName: '代扣公积金', category: '全职推拿师扣缴13', itemName: '代扣公积金' }
            ]
          }
        ]
      },
      {
        name: '推拿师加班',
        frequency: '月',
        calculateDate: '次月/10日',
        dataDateStart: '本月/1日',
        dataDateEnd: '本月/末日',
        notifyDate: '次月1日',
        paymentDate: '次月3日',
        delayConfirm: '次日发放',
        paymentEntity: '合同主体',
        incomeGroups: [
          {
            name: '加班费',
            items: [
              { id: 1, displayName: '超时加班费', category: '全职推拿师提成13', itemName: '超时加班费' }
            ]
          }
        ],
        deductGroups: [
          {
            name: '代扣个税',
            items: [
              { id: 1, displayName: '代扣个税', category: '系统代扣13', itemName: '代扣个税' }
            ]
          }
        ]
      }
    ],
    beanSlips: []
  },
  {
    id: '1109493788878143491',
    name: '非全日制推拿师发放策略（没有常乐豆）',
    business: '业务',
    position: '推拿师',
    templateId: '1109491319435526147',
    templateName: '非全日制推拿师模板',
    coopMode: '非全日制劳动合同',
    validityType: 'longterm',
    validityPeriod: '长期有效',
    dateRange: null,
    personCount: 86,
    updateTime: '2026-05-21 09:15:30',
    conditions: [
      { field: 'employmentType', operator: '=', valueType: 'reference', value: 'parttime' },
      { field: 'position', operator: '=', valueType: 'reference', value: '推拿师' }
    ],
    payrollSlips: [
      {
        name: '非全日制周工资',
        frequency: '周',
        calculateDate: '次周/1日',
        dataDateStart: '本周/1日',
        dataDateEnd: '本周/末日',
        notifyDate: '次周/1日',
        paymentDate: '次周/2日',
        delayConfirm: '次日发放',
        paymentEntity: '业绩归属主体',
        incomeGroups: [
          {
            name: '计件收入',
            items: [
              { id: 1, displayName: '计件提成', category: '非全日制推拿师提成13', itemName: '计件提成' }
            ]
          },
          {
            name: '加班费',
            items: [
              { id: 1, displayName: '超时加班费', category: '非全日制推拿师提成13', itemName: '超时加班费' }
            ]
          }
        ],
        deductGroups: [
          {
            name: '预扣个税',
            items: [
              { id: 1, displayName: '预扣个税', category: '系统代扣13', itemName: '预扣个税（3%）' }
            ]
          }
        ]
      }
    ],
    beanSlips: []
  },
  {
    id: '1109493788878143488',
    name: '兼职推拿师发放策略（无常乐豆）',
    business: '业务',
    position: '推拿师',
    templateId: '1109491319435526145',
    templateName: '兼职推拿师模板',
    coopMode: '劳务合作-兼职',
    validityType: 'longterm',
    validityPeriod: '长期有效',
    dateRange: null,
    personCount: 54,
    updateTime: '2026-05-20 14:52:13',
    conditions: [
      { field: 'employmentType', operator: '=', valueType: 'reference', value: 'flexible' },
      { field: 'position', operator: '=', valueType: 'reference', value: '推拿师' }
    ],
    payrollSlips: [
      {
        name: '兼职周结算',
        frequency: '周',
        calculateDate: '次周/1日',
        dataDateStart: '本周/1日',
        dataDateEnd: '本周/末日',
        notifyDate: '次周/1日',
        paymentDate: '次周/2日',
        delayConfirm: '次日发放',
        paymentEntity: '业绩归属主体',
        incomeGroups: [
          {
            name: '计件收入',
            items: [
              { id: 1, displayName: '计件提成', category: '兼职推拿师提成13', itemName: '计件提成' }
            ]
          },
          {
            name: '加班费',
            items: [
              { id: 1, displayName: '超时加班费', category: '兼职推拿师提成13', itemName: '超时加班费' }
            ]
          }
        ],
        deductGroups: [
          {
            name: '预扣个税',
            items: [
              { id: 1, displayName: '预扣个税', category: '系统代扣13', itemName: '预扣个税（3%）' }
            ]
          }
        ]
      }
    ],
    beanSlips: []
  },
  {
    id: '1109493788878143490',
    name: '全职客户经理发放策略',
    business: '业务',
    position: '客户经理',
    templateId: '1109491319435526148',
    templateName: '全职客户经理模板',
    coopMode: '劳动合同-全职',
    validityType: 'fixed',
    validityPeriod: '2026-01-01 至 2026-12-31',
    dateRange: ['2026-01-01', '2026-12-31'],
    personCount: 364,
    updateTime: '2026-05-18 16:45:22',
    conditions: [
      { field: 'employmentType', operator: '=', valueType: 'reference', value: 'fulltime' },
      { field: 'position', operator: '=', valueType: 'reference', value: '客户经理' }
    ],
    payrollSlips: [
      {
        name: '客户经理基本工资',
        frequency: '月',
        calculateDate: '次月/10日',
        dataDateStart: '本月/1日',
        dataDateEnd: '本月/末日',
        notifyDate: '次月1日',
        paymentDate: '次月2日',
        delayConfirm: '次日发放',
        paymentEntity: '合同主体',
        incomeGroups: [
          {
            name: '基本工资',
            items: [
              { id: 1, displayName: '基本工资', category: '客户经理收入13', itemName: '基本工资' }
            ]
          }
        ],
        deductGroups: [
          {
            name: '代扣社保/公积金',
            items: [
              { id: 1, displayName: '代扣社保', category: '客户经理扣缴13', itemName: '代扣社保' },
              { id: 2, displayName: '代扣公积金', category: '客户经理扣缴13', itemName: '代扣公积金' }
            ]
          }
        ]
      },
      {
        name: '客户经理提成',
        frequency: '月',
        calculateDate: '次月/15日',
        dataDateStart: '本月/1日',
        dataDateEnd: '本月/末日',
        notifyDate: '次月10日',
        paymentDate: '次月11日',
        delayConfirm: '次日发放',
        paymentEntity: '合同主体',
        incomeGroups: [
          {
            name: '业绩提成',
            items: [
              { id: 1, displayName: '业绩提成', category: '客户经理收入13', itemName: '业绩提成' },
              { id: 2, displayName: '超产奖金', category: '客户经理收入13', itemName: '超产奖金' }
            ]
          }
        ],
        deductGroups: [
          {
            name: '代扣个税',
            items: [
              { id: 1, displayName: '代扣个税', category: '系统代扣13', itemName: '代扣个税' }
            ]
          }
        ]
      }
    ],
    beanSlips: [
      {
        name: '常乐豆发放',
        frequency: '月',
        calculateDate: '次月/10日',
        dataDateStart: '本月/1日',
        dataDateEnd: '本月/末日',
        notifyDate: '次月30日',
        paymentDate: '次月31日',
        paymentEntity: '合同主体',
        settlementAccount: '余额账户',
        incomeGroups: [
          {
            name: '常乐豆',
            items: [
              { id: 1, displayName: '管理津贴获豆', category: '客户经理获豆13', itemName: '管理津贴获豆' }
            ]
          }
        ],
        deductGroups: []
      }
    ]
  },
  {
    id: '1109493788878143501',
    name: '总部其他全职岗位发放策略',
    business: '职能',
    position: '总部职能',
    templateId: '1109491319435526149',
    templateName: '全职总部岗位模板',
    coopMode: '劳动合同-全职',
    validityType: 'longterm',
    validityPeriod: '长期有效',
    dateRange: null,
    personCount: 48,
    updateTime: '2026-05-17 11:30:00',
    conditions: [
      { field: 'employmentType', operator: '=', valueType: 'reference', value: 'fulltime' },
      { field: 'position', operator: '=', valueType: 'reference', value: '总部职能' }
    ],
    payrollSlips: [
      {
        name: '总部岗位月工资',
        frequency: '月',
        calculateDate: '次月/10日',
        dataDateStart: '本月/1日',
        dataDateEnd: '本月/末日',
        notifyDate: '次月1日',
        paymentDate: '次月2日',
        delayConfirm: '次日发放',
        paymentEntity: '合同主体',
        incomeGroups: [
          {
            name: '基本收入',
            items: [
              { id: 1, displayName: '基本工资', category: '总部岗位收入13', itemName: '基本工资' },
              { id: 2, displayName: '绩效奖金', category: '总部岗位收入13', itemName: '绩效奖金' }
            ]
          },
          {
            name: '加班费',
            items: [
              { id: 1, displayName: '加班费', category: '总部岗位收入13', itemName: '加班费' }
            ]
          }
        ],
        deductGroups: [
          {
            name: '代扣社保/公积金',
            items: [
              { id: 1, displayName: '代扣社保', category: '总部岗位扣缴13', itemName: '代扣社保' },
              { id: 2, displayName: '代扣公积金', category: '总部岗位扣缴13', itemName: '代扣公积金' }
            ]
          },
          {
            name: '代扣个税',
            items: [
              { id: 1, displayName: '代扣个税', category: '系统代扣13', itemName: '代扣个税' }
            ]
          }
        ]
      }
    ],
    beanSlips: []
  }
]

// 生成并导出 workPosts（依赖 users、positions、budgetPlans）
workPosts = _generateWorkPosts()

 