// 核心数据模型定义

// 部门模型
export const Department = {
  id: String,
  name: String,
  parentId: String,
  children: Array,
  description: String
}

// 岗位模型
export const Position = {
  id: String,
  name: String,
  description: String
}

// 权限模型 - RBAC
// 类型：page（页面）、button（按钮）、api（API）
export const Permission = {
  id: String,
  name: String,
  type: String,
  code: String,
  parentId: String,
  path: String, // 页面路径
  component: String, // 页面组件
  apiUrl: String, // API地址
  description: String
}

// 角色模型
export const Role = {
  id: String,
  name: String,
  description: String,
  permissions: Array, // 关联的权限ID列表
  dataRules: Array, // 关联的数据规则ID列表
  inheritRoleId: String, // 继承的角色ID
  processRoles: Array, // 关联的流程角色配置
  permissionValidity: Object // 权限有效期配置
}

// 流程角色配置模型
export const ProcessRoleConfig = {
  processId: String, // 关联的流程ID
  nodeId: String, // 关联的流程环节ID
  permissionIds: Array, // 该流程环节下的权限ID列表
  dataRuleIds: Array, // 该流程环节下的数据规则ID列表
  validityType: String, // 有效期类型：permanent（永久）、temporary（临时）、nodeDuration（环节期间）
  validityDuration: Number, // 有效期时长（秒）
  description: String
}

// 业务模型
export const Business = {
  id: String,
  name: String,
  description: String,
  status: String, // active, inactive
  createTime: Date,
  updateTime: Date
}

// 业务流程模型
export const BusinessProcess = {
  id: String,
  businessId: String, // 关联的业务ID
  name: String,
  description: String,
  status: String, // active, inactive
  createTime: Date,
  updateTime: Date
}

// 流程环节模型
export const ProcessNode = {
  id: String,
  processId: String, // 所属流程ID
  name: String,
  type: String, // start, middle, end
  order: Number, // 环节顺序
  description: String,
  requiredRoles: Array, // 该环节需要的角色ID列表
  permissions: Array, // 该环节需要的权限ID列表
  dataRules: Array, // 该环节需要的数据规则ID列表
  nextNodes: Array, // 下一环节ID列表
  condition: String, // 流转条件
  validityType: String // 权限有效期类型：permanent, temporary, nodeDuration
}

// 流程实例模型
export const ProcessInstance = {
  id: String,
  processId: String,
  businessId: String, // 关联的业务ID
  currentNodeId: String, // 当前环节ID
  status: String, // running, completed, suspended
  createTime: Date,
  completedTime: Date,
  participants: Array // 参与人员信息
}

// 流程任务模型
export const ProcessTask = {
  id: String,
  instanceId: String,
  nodeId: String,
  assigneeId: String, // 任务执行人ID
  status: String, // pending, completed, rejected
  createTime: Date,
  completedTime: Date,
  action: String // 执行动作
}

// 数据规则模型 - ABAC
export const DataRule = {
  id: String,
  name: String,
  type: String, // 规则类型
  conditions: Array, // 条件表达式
  scope: String, // 数据访问范围：self（本人）、department（部门）、organization（组织）、custom（自定义）
  description: String
}

// 用户模型
export const User = {
  id: String,
  name: String,
  username: String,
  departmentId: String,
  departmentName: String,
  positionId: String,
  positionName: String,
  roles: Array, // 关联的角色ID列表
  attributes: Object, // ABAC属性
  processTasks: Array // 关联的流程任务ID列表
}

// 权限条件模型
export const Condition = {
  attribute: String, // 属性名
  operator: String, // 操作符：eq（等于）、ne（不等于）、gt（大于）、lt（小于）、in（包含）、nin（不包含）
  value: Any // 属性值
}