// 权限验证组合式API
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 权限验证组合式API
export function usePermission() {
  // 当前用户信息（实际项目中应该从登录状态或API获取）
  const currentUser = ref(null)
  
  // 所有权限列表（实际项目中应该从API获取）
  const allPermissions = ref([])
  
  // 所有流程列表（实际项目中应该从API获取）
  const allProcesses = ref([])
  
  // 所有流程环节列表（实际项目中应该从API获取）
  const allProcessNodes = ref([])
  
  // 所有角色列表（实际项目中应该从API获取）
  const allRoles = ref([])
  
  // 初始化权限数据
  const initPermissions = (user, permissions, processes = [], processNodes = [], roles = []) => {
    currentUser.value = user
    allPermissions.value = permissions
    allProcesses.value = processes
    allProcessNodes.value = processNodes
    allRoles.value = roles
  }
  
  // 获取用户拥有的所有角色信息
  const getUserRoles = () => {
    if (!currentUser.value || !currentUser.value.roles) {
      return []
    }
    
    return currentUser.value.roles.map(roleId => {
      return allRoles.value.find(role => role.id === roleId) || null
    }).filter(Boolean)
  }
  
  // 获取用户拥有的所有权限ID
  const getUserPermissionIds = () => {
    if (!currentUser.value || !currentUser.value.roles) {
      return []
    }
    
    // 这里简化处理，实际项目中应该根据角色获取对应的权限
    // 并考虑角色继承关系和流程权限
    return currentUser.value.roles.flatMap(roleId => {
      // 查找角色对应的权限
      // 实际项目中应该从角色权限关联表中获取
      // 这里简化处理，直接返回角色关联的权限ID
      // 注意：这是模拟数据，实际项目中需要根据实际情况修改
      const role = {
        'role-1': allPermissions.value.map(p => p.id), // 超级管理员拥有所有权限
        'role-2': ['perm-1', 'perm-2', 'perm-3', 'perm-4', 'perm-6', 'perm-7', 'perm-api-1', 'perm-api-3', 'perm-api-4', 'perm-api-5', 'perm-api-6'],
        'role-3': ['perm-1', 'perm-6', 'perm-7', 'perm-api-5', 'perm-api-6'],
        'role-4': ['perm-1', 'perm-2', 'perm-3', 'perm-4', 'perm-api-1', 'perm-api-3', 'perm-api-4'],
        'role-5': ['perm-1']
      }[roleId] || []
      
      // 获取角色的流程权限
      const roleInfo = allRoles.value.find(r => r.id === roleId)
      if (roleInfo && roleInfo.processRoles) {
        roleInfo.processRoles.forEach(processRole => {
          // 添加流程环节的权限ID
          if (processRole.permissionIds) {
            processRole.permissionIds.forEach(permId => {
              if (!role.includes(permId)) {
                role.push(permId)
              }
            })
          }
        })
      }
      
      return role
    })
  }
  
  // 检查用户是否拥有某个权限
  const hasPermission = (permissionCode) => {
    if (!permissionCode) return false
    
    const userPermissionIds = getUserPermissionIds()
    
    // 查找权限对应的ID
    const permission = allPermissions.value.find(p => p.code === permissionCode)
    if (!permission) return false
    
    return userPermissionIds.includes(permission.id)
  }
  
  // 检查用户是否有权限访问某个页面
  const canAccessPage = (pagePath) => {
    if (!pagePath) return false
    
    // 查找页面对应的权限
    const pagePermission = allPermissions.value.find(p => 
      p.type === 'page' && p.path === pagePath
    )
    
    if (!pagePermission) {
      // 页面没有配置权限，默认不允许访问
      return false
    }
    
    return hasPermission(pagePermission.code)
  }
  
  // 检查用户是否有权限执行某个按钮操作
  const canAccessButton = (buttonCode) => {
    return hasPermission(buttonCode)
  }
  
  // 检查用户是否有权限访问某个API
  const canAccessApi = (apiUrl) => {
    if (!apiUrl) return false
    
    // 查找API对应的权限
    const apiPermission = allPermissions.value.find(p => 
      p.type === 'api' && p.apiUrl === apiUrl
    )
    
    if (!apiPermission) {
      // API没有配置权限，默认不允许访问
      return false
    }
    
    return hasPermission(apiPermission.code)
  }
  
  // 检查用户是否有权限访问某个流程
  const canAccessProcess = (processId) => {
    if (!processId) return false
    
    // 超级管理员拥有所有流程权限
    if (currentUser.value && currentUser.value.roles.includes('role-1')) {
      return true
    }
    
    // 获取用户角色
    const userRoles = getUserRoles()
    
    // 检查用户角色是否关联了该流程的任何环节
    for (const role of userRoles) {
      if (role.processRoles) {
        for (const processRole of role.processRoles) {
          if (processRole.processId === processId) {
            return true
          }
        }
      }
    }
    
    return false
  }
  
  // 检查用户是否有权限访问某个流程环节
  const canAccessProcessNode = (processId, nodeId) => {
    if (!processId || !nodeId) return false
    
    // 超级管理员拥有所有流程环节权限
    if (currentUser.value && currentUser.value.roles.includes('role-1')) {
      return true
    }
    
    // 获取用户角色
    const userRoles = getUserRoles()
    
    // 检查用户角色是否关联了该流程环节
    for (const role of userRoles) {
      if (role.processRoles) {
        for (const processRole of role.processRoles) {
          if (processRole.processId === processId && processRole.nodeId === nodeId) {
            return true
          }
        }
      }
    }
    
    // 检查流程环节是否配置了该角色
    const node = allProcessNodes.value.find(n => n.id === nodeId && n.processId === processId)
    if (node && node.requiredRoles) {
      return currentUser.value.roles.some(roleId => node.requiredRoles.includes(roleId))
    }
    
    return false
  }
  
  // 检查权限是否在有效期内
  const isPermissionValid = (validityType, validityDuration = 0, grantedTime = new Date()) => {
    if (validityType === 'permanent') {
      return true
    }
    
    if (validityType === 'temporary' && validityDuration > 0) {
      const now = new Date()
      const grantedDate = new Date(grantedTime)
      const expirationDate = new Date(grantedDate.getTime() + validityDuration * 1000)
      return now <= expirationDate
    }
    
    // nodeDuration类型需要结合流程实例状态判断，这里简化处理
    if (validityType === 'nodeDuration') {
      // 实际项目中需要检查流程实例当前是否处于该环节
      // 这里简化处理，假设当前环节的权限都是有效的
      return true
    }
    
    return false
  }
  
  // 获取用户在特定流程环节下的有效权限
  const getNodeValidPermissions = (processId, nodeId) => {
    if (!processId || !nodeId) return []
    
    const userRoles = getUserRoles()
    const validPermissions = []
    
    for (const role of userRoles) {
      if (role.processRoles) {
        for (const processRole of role.processRoles) {
          if (processRole.processId === processId && processRole.nodeId === nodeId) {
            // 检查权限是否在有效期内
            if (isPermissionValid(processRole.validityType, processRole.validityDuration)) {
              // 添加该流程环节的权限
              processRole.permissionIds.forEach(permId => {
                const permission = allPermissions.value.find(p => p.id === permId)
                if (permission && !validPermissions.some(vp => vp.id === permission.id)) {
                  validPermissions.push(permission)
                }
              })
            }
          }
        }
      }
    }
    
    return validPermissions
  }
  
  // 获取用户可访问的页面列表
  const getAccessiblePages = () => {
    const userPermissionIds = getUserPermissionIds()
    
    return allPermissions.value.filter(p => 
      p.type === 'page' && userPermissionIds.includes(p.id)
    )
  }
  
  // 获取用户可访问的按钮列表
  const getAccessibleButtons = () => {
    const userPermissionIds = getUserPermissionIds()
    
    return allPermissions.value.filter(p => 
      p.type === 'button' && userPermissionIds.includes(p.id)
    )
  }
  
  // 获取用户可访问的API列表
  const getAccessibleApis = () => {
    const userPermissionIds = getUserPermissionIds()
    
    return allPermissions.value.filter(p => 
      p.type === 'api' && userPermissionIds.includes(p.id)
    )
  }
  
  // 获取用户可访问的流程列表
  const getAccessibleProcesses = () => {
    return allProcesses.value.filter(process => canAccessProcess(process.id))
  }
  
  // 获取用户可访问的流程环节列表
  const getAccessibleProcessNodes = (processId) => {
    return allProcessNodes.value.filter(node => 
      node.processId === processId && canAccessProcessNode(processId, node.id)
    )
  }
  
  // 权限拦截器（用于路由守卫）
  const permissionGuard = (to, from, next) => {
    // 白名单路由，不需要权限验证
    const whiteList = ['/login', '/404', '/403']
    
    if (whiteList.includes(to.path)) {
      next()
      return
    }
    
    // 检查是否登录
    if (!currentUser.value) {
      next('/login')
      return
    }
    
    // 检查是否有权限访问该页面
    if (canAccessPage(to.path)) {
      next()
    } else {
      ElMessage.error('没有权限访问该页面')
      next('/403')
    }
  }
  
  return {
    currentUser,
    allPermissions,
    allProcesses,
    allProcessNodes,
    allRoles,
    initPermissions,
    hasPermission,
    canAccessPage,
    canAccessButton,
    canAccessApi,
    canAccessProcess,
    canAccessProcessNode,
    isPermissionValid,
    getNodeValidPermissions,
    getAccessiblePages,
    getAccessibleButtons,
    getAccessibleApis,
    getAccessibleProcesses,
    getAccessibleProcessNodes,
    permissionGuard
  }
}

// 全局权限指令
export const setupPermissionDirective = (app) => {
  // v-permission:button="'button-code'"
  app.directive('permission', {
    mounted(el, binding) {
      const { value, arg } = binding
      const { hasPermission } = usePermission()
      
      if (arg === 'button') {
        // 按钮权限控制
        if (!hasPermission(value)) {
          el.style.display = 'none'
        }
      } else {
        // 其他权限控制
        if (!hasPermission(value)) {
          el.style.display = 'none'
        }
      }
    }
  })
}
