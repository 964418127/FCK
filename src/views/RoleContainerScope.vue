<template>
  <div class="role-container-scope">
    <div class="page-header">
      <h2>岗位容器范围配置</h2>
      <p>配置岗位工作角色可以管理的业务容器范围，支持全国、大区、省、市、区、商圈、CBD、门店等层级</p>
    </div>
    
    <div class="page-content">
      <el-card shadow="hover" class="content-card">
        <template #header>
          <div class="card-header">
            <h3>{{ role.name }} - 容器范围配置</h3>
            <div class="header-info">
              <el-tag type="info" size="small">{{ role.description || '无描述' }}</el-tag>
            </div>
          </div>
        </template>
        
        <div class="container-config-section">
          <div class="section-header">
            <h4>选择可管理的业务容器范围</h4>
            <p>勾选角色可以管理的业务容器，支持多选，支持树形结构展示</p>
          </div>
          
          <!-- 容器类型过滤 -->
          <div class="container-filter">
            <el-select v-model="containerType" placeholder="请选择容器类型" style="width: 150px; margin-right: 20px">
              <el-option label="全部" value="" />
              <el-option label="全国" value="COUNTRY" />
              <el-option label="大区" value="REGION" />
              <el-option label="省" value="PROVINCE" />
              <el-option label="市" value="CITY" />
              <el-option label="区" value="DISTRICT" />
              <el-option label="商圈" value="BUSINESS_AREA" />
              <el-option label="CBD" value="CBD" />
              <el-option label="门店" value="STORE" />
            </el-select>
            <el-input v-model="searchKeyword" placeholder="请输入容器名称或编码" style="width: 250px" />
          </div>
          
          <!-- 业务容器树形展示 -->
          <div class="container-tree-container">
            <el-tree
              :data="filteredContainerTree"
              :props="treeProps"
              node-key="id"
              show-checkbox
              v-model:checked="selectedContainers"
              default-expand-all
              class="container-tree"
            >
              <template #default="{ node, data }">
                <div class="tree-node-content">
                  <div class="node-info">
                    <el-tag 
                      size="small" 
                      :type="getContainerTypeTagType(data.type)"
                      style="margin-right: 8px"
                    >
                      {{ getContainerTypeLabel(data.type) }}
                    </el-tag>
                    {{ node.label }}
                  </div>
                </div>
              </template>
            </el-tree>
          </div>
          
          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSave">保存配置</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { businessContainers as mockContainers } from '../mock/data.js'

// 路由相关
const route = useRoute()
const router = useRouter()

// 获取角色ID
const roleId = ref(route.params.id || '')

// 模拟角色数据，实际项目中应该从API获取
const role = ref({
  id: roleId.value,
  name: '测试角色',
  description: '测试角色描述',
  containerScope: []
})

// 响应式数据
const containers = ref([])
const containerType = ref('')
const searchKeyword = ref('')
const selectedContainers = ref([])

// 树形结构配置
const treeProps = {
  label: 'name',
  children: 'children'
}

// 生命周期钩子
onMounted(async () => {
  // 加载业务容器数据
  containers.value = [...mockContainers]
  
  // 加载角色现有容器范围配置
  loadRoleContainerScope()
})

// 构建树形结构
const buildTree = (containerList) => {
  const tree = []
  const map = new Map()
  
  // 先将所有业务容器放入map
  containerList.forEach(container => {
    map.set(container.id, { ...container, children: [] })
  })
  
  // 构建树形结构
  map.forEach(container => {
    if (!container.parentId) {
      // 根节点
      tree.push(container)
    } else {
      // 子节点，添加到父节点的children中
      const parent = map.get(container.parentId)
      if (parent) {
        parent.children.push(container)
      } else {
        // 如果找不到父节点，作为根节点处理
        tree.push(container)
      }
    }
  })
  
  return tree
}

// 过滤后的业务容器列表
const filteredContainersList = computed(() => {
  let result = [...containers.value]
  
  // 按搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(container => 
      container.name.toLowerCase().includes(keyword) || 
      container.code.toLowerCase().includes(keyword)
    )
  }
  
  // 按容器类型过滤
  if (containerType.value) {
    result = result.filter(container => container.type === containerType.value)
  }
  
  return result
})

// 业务容器树形结构
const filteredContainerTree = computed(() => {
  return buildTree(filteredContainersList.value)
})

// 获取容器类型标签类型
const getContainerTypeTagType = (type) => {
  const typeMap = {
    'COUNTRY': 'info',
    'REGION': 'primary',
    'PROVINCE': 'success',
    'CITY': 'warning',
    'DISTRICT': 'danger',
    'BUSINESS_AREA': 'info',
    'CBD': 'primary',
    'STORE': 'success'
  }
  return typeMap[type] || 'info'
}

// 获取容器类型标签文本
const getContainerTypeLabel = (type) => {
  const labelMap = {
    'COUNTRY': '全国',
    'REGION': '大区',
    'PROVINCE': '省',
    'CITY': '市',
    'DISTRICT': '区',
    'BUSINESS_AREA': '商圈',
    'CBD': 'CBD',
    'STORE': '门店'
  }
  return labelMap[type] || type
}

// 加载角色现有容器范围配置
const loadRoleContainerScope = () => {
  // 模拟从API获取角色容器范围配置
  // 实际项目中应该根据roleId从API获取
  selectedContainers.value = role.containerScope || []
}

// 保存容器范围配置
const handleSave = () => {
  // 模拟保存到API
  role.containerScope = [...selectedContainers.value]
  
  ElMessage.success('容器范围配置保存成功')
  router.push('/role-management')
}

// 取消操作
const handleCancel = () => {
  router.push('/role-management')
}
</script>

<style scoped>
.role-container-scope {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.page-header p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
}

/* 内容卡片 */
.content-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 容器配置区域 */
.container-config-section {
  padding: 20px 0;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-header p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

/* 过滤条件 */
.container-filter {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

/* 树形结构 */
.container-tree-container {
  margin: 20px 0;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}

.container-tree {
  background-color: #fff;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-info {
  display: flex;
  align-items: center;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .container-filter .el-select,
  .container-filter .el-input {
    margin-right: 0 !important;
    margin-bottom: 10px;
    width: 100% !important;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .tree-node-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>