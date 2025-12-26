// 流程权限服务
export class ProcessPermissionService {
  constructor(permissionService) {
    this.permissionService = permissionService
    // 权限分配日志，实际项目中应该存储到数据库
    this.permissionLogs = []
    // 当前用户临时权限存储，实际项目中应该存储到数据库或缓存
    this.temporaryPermissions = new Map()
  }

  // 分配流程环节权限
  assignNodePermissions(processId, nodeId, userIds, grantedBy = 'system') {
    const { allProcessNodes, allRoles, allPermissions } = this.permissionService
    
    // 获取流程环节信息
    const node = allProcessNodes.value.find(n => n.id === nodeId && n.processId === processId)
    if (!node) {
      console.error(`流程环节不存在: processId=${processId}, nodeId=${nodeId}`)
      return false
    }

    // 获取环节需要的角色和权限
    const { requiredRoles, permissions: nodePermissionIds } = node
    
    // 为每个用户分配权限
    userIds.forEach(userId => {
      // 获取用户当前角色
      // 实际项目中应该从用户服务获取
      
      // 查找与该环节关联的流程角色配置
      const roleConfigs = []
      requiredRoles.forEach(roleId => {
        const role = allRoles.value.find(r => r.id === roleId)
        if (role && role.processRoles) {
          role.processRoles.forEach(config => {
            if (config.processId === processId && config.nodeId === nodeId) {
              roleConfigs.push(config)
            }
          })
        }
      })

      // 合并所有权限
      const allPermissionIds = new Set()
      // 添加环节直接配置的权限
      nodePermissionIds.forEach(permId => allPermissionIds.add(permId))
      // 添加流程角色配置的权限
      roleConfigs.forEach(config => {
        config.permissionIds.forEach(permId => allPermissionIds.add(permId))
      })

      // 获取权限详情
      const permissions = Array.from(allPermissionIds)
        .map(permId => allPermissions.value.find(p => p.id === permId))
        .filter(Boolean)

      // 记录权限分配
      const grantedTime = new Date()
      this.recordPermissionLog({
        userId,
        processId,
        nodeId,
        action: 'assign',
        permissions: Array.from(allPermissionIds),
        grantedBy,
        grantedTime,
        validityType: node.validityType,
        validityDuration: node.validityType === 'temporary' ? 3600 : 0 // 默认1小时临时权限
      })

      // 存储临时权限
      if (node.validityType !== 'permanent') {
        const userTempPerms = this.temporaryPermissions.get(userId) || []
        userTempPerms.push({
          processId,
          nodeId,
          permissionIds: Array.from(allPermissionIds),
          grantedTime,
          validityType: node.validityType,
          validityDuration: node.validityType === 'temporary' ? 3600 : 0
        })
        this.temporaryPermissions.set(userId, userTempPerms)
      }

      console.log(`已为用户 ${userId} 分配流程 ${processId} 环节 ${nodeId} 的权限:`, permissions.map(p => p.name))
    })

    return true
  }

  // 回收流程环节权限
  revokeNodePermissions(processId, nodeId, userIds, revokedBy = 'system') {
    // 回收每个用户的权限
    userIds.forEach(userId => {
      // 获取用户临时权限
      const userTempPerms = this.temporaryPermissions.get(userId) || []
      
      // 过滤掉需要回收的权限
      const remainingPerms = userTempPerms.filter(perm => 
        !(perm.processId === processId && perm.nodeId === nodeId)
      )
      
      // 记录权限回收
      const revokedTime = new Date()
      this.recordPermissionLog({
        userId,
        processId,
        nodeId,
        action: 'revoke',
        revokedBy,
        revokedTime
      })

      // 更新用户临时权限
      if (remainingPerms.length > 0) {
        this.temporaryPermissions.set(userId, remainingPerms)
      } else {
        this.temporaryPermissions.delete(userId)
      }

      console.log(`已回收用户 ${userId} 流程 ${processId} 环节 ${nodeId} 的临时权限`)
    })

    return true
  }

  // 流程流转时的权限处理
  handleProcessTransition(instanceId, fromNodeId, toNodeId, userIds, transitionedBy = 'system') {
    const { allProcessInstances } = this.permissionService
    
    // 获取流程实例信息
    const instance = allProcessInstances?.value?.find(i => i.id === instanceId)
    if (!instance) {
      console.error(`流程实例不存在: instanceId=${instanceId}`)
      return false
    }

    const processId = instance.processId

    // 回收原环节的临时权限
    if (fromNodeId) {
      this.revokeNodePermissions(processId, fromNodeId, userIds, transitionedBy)
    }

    // 分配新环节的权限
    if (toNodeId) {
      this.assignNodePermissions(processId, toNodeId, userIds, transitionedBy)
    }

    return true
  }

  // 验证用户在流程环节的权限
  hasNodePermission(userId, processId, nodeId, permissionCode) {
    const { hasPermission, canAccessProcessNode } = this.permissionService
    
    // 首先检查用户是否有权限访问该流程环节
    if (!canAccessProcessNode(processId, nodeId)) {
      return false
    }

    // 检查是否有永久权限
    if (hasPermission(permissionCode)) {
      return true
    }

    // 检查是否有临时权限
    const userTempPerms = this.temporaryPermissions.get(userId) || []
    const relevantPerms = userTempPerms.filter(perm => 
      perm.processId === processId && perm.nodeId === nodeId
    )

    // 合并所有临时权限ID
    const tempPermissionIds = new Set()
    relevantPerms.forEach(perm => {
      perm.permissionIds.forEach(id => tempPermissionIds.add(id))
    })

    // 检查权限是否在有效期内
    const now = new Date()
    const validPerms = relevantPerms.filter(perm => {
      const { validityType, validityDuration, grantedTime } = perm
      if (validityType === 'nodeDuration') {
        // 环节期间权限，检查流程实例是否仍在该环节
        // 实际项目中应该从流程实例服务获取当前环节
        return true // 简化处理
      } else if (validityType === 'temporary' && validityDuration > 0) {
        const expirationTime = new Date(grantedTime.getTime() + validityDuration * 1000)
        return now <= expirationTime
      }
      return false
    })

    // 检查权限代码是否在临时权限中
    const { allPermissions } = this.permissionService
    const permission = allPermissions.value.find(p => p.code === permissionCode)
    if (!permission) return false

    return validPerms.some(perm => perm.permissionIds.includes(permission.id))
  }

  // 获取用户在流程环节的有效权限
  getUserNodePermissions(userId, processId, nodeId) {
    const { allPermissions } = this.permissionService
    const userTempPerms = this.temporaryPermissions.get(userId) || []
    
    const relevantPerms = userTempPerms.filter(perm => 
      perm.processId === processId && perm.nodeId === nodeId
    )

    // 检查权限是否在有效期内
    const now = new Date()
    const validPerms = relevantPerms.filter(perm => {
      const { validityType, validityDuration, grantedTime } = perm
      if (validityType === 'nodeDuration') {
        return true // 简化处理
      } else if (validityType === 'temporary' && validityDuration > 0) {
        const expirationTime = new Date(grantedTime.getTime() + validityDuration * 1000)
        return now <= expirationTime
      }
      return false
    })

    // 合并所有权限ID
    const permissionIds = new Set()
    validPerms.forEach(perm => {
      perm.permissionIds.forEach(id => permissionIds.add(id))
    })

    // 获取权限详情
    return Array.from(permissionIds)
      .map(permId => allPermissions.value.find(p => p.id === permId))
      .filter(Boolean)
  }

  // 记录权限日志
  recordPermissionLog(logData) {
    this.permissionLogs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...logData
    })
    // 实际项目中应该将日志存储到数据库
    console.log('权限日志记录:', logData)
  }

  // 清理过期的临时权限
  cleanupExpiredPermissions() {
    const now = new Date()
    let cleanedCount = 0

    for (const [userId, perms] of this.temporaryPermissions.entries()) {
      const validPerms = perms.filter(perm => {
        if (perm.validityType === 'temporary' && perm.validityDuration > 0) {
          const expirationTime = new Date(perm.grantedTime.getTime() + perm.validityDuration * 1000)
          return now <= expirationTime
        }
        return true
      })

      if (validPerms.length < perms.length) {
        cleanedCount += perms.length - validPerms.length
        if (validPerms.length > 0) {
          this.temporaryPermissions.set(userId, validPerms)
        } else {
          this.temporaryPermissions.delete(userId)
        }
      }
    }

    console.log(`已清理 ${cleanedCount} 条过期临时权限`)
    return cleanedCount
  }

  // 获取权限分配日志
  getPermissionLogs(filter = {}) {
    let logs = [...this.permissionLogs]
    
    // 应用过滤条件
    if (filter.userId) {
      logs = logs.filter(log => log.userId === filter.userId)
    }
    if (filter.processId) {
      logs = logs.filter(log => log.processId === filter.processId)
    }
    if (filter.nodeId) {
      logs = logs.filter(log => log.nodeId === filter.nodeId)
    }
    if (filter.action) {
      logs = logs.filter(log => log.action === filter.action)
    }
    if (filter.startTime) {
      const startTime = new Date(filter.startTime)
      logs = logs.filter(log => new Date(log.grantedTime || log.revokedTime) >= startTime)
    }
    if (filter.endTime) {
      const endTime = new Date(filter.endTime)
      logs = logs.filter(log => new Date(log.grantedTime || log.revokedTime) <= endTime)
    }

    // 按时间倒序排序
    return logs.sort((a, b) => {
      const timeA = new Date(a.grantedTime || a.revokedTime)
      const timeB = new Date(b.grantedTime || b.revokedTime)
      return timeB - timeA
    })
  }
}

// 创建单例实例
let processPermissionServiceInstance = null

export const getProcessPermissionService = (permissionService) => {
  if (!processPermissionServiceInstance && permissionService) {
    processPermissionServiceInstance = new ProcessPermissionService(permissionService)
  }
  return processPermissionServiceInstance
}

// 导出服务
const permissionService = {
  ProcessPermissionService,
  getProcessPermissionService
}

export default permissionService