<template>
  <div class="message-type">
    <div class="page-header">
      <h2>消息类型配置</h2>
      <p>统一管理消息类型，为模板配置、规则配置提供类型维度筛选</p>
    </div>
    
    <div class="page-content">
      <!-- 类型列表 -->
      <el-table :data="typeList" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="code" label="类型编码" width="150" />
        <el-table-column prop="name" label="类型名称" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              :type="scope.row.status === 'enabled' ? 'warning' : 'success'"
              link 
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const loading = ref(false)

// 类型列表
const typeList = ref([
  {
    id: '1',
    code: 'verify',
    name: '验证码',
    description: '用于身份验证的验证码消息',
    status: 'enabled'
  },
  {
    id: '2',
    code: 'notice',
    name: '通知',
    description: '系统通知类消息',
    status: 'enabled'
  },
  {
    id: '3',
    code: 'marketing',
    name: '营销',
    description: '营销推广类消息',
    status: 'enabled'
  },
  {
    id: '4',
    code: 'other',
    name: '其他',
    description: '其他类型消息',
    status: 'enabled'
  }
])

// 操作函数
const handleToggleStatus = (row) => {
  row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  ElMessage.success(`消息类型已${row.status === 'enabled' ? '启用' : '禁用'}`)
}
</script>

<style scoped>
.message-type {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.page-header p {
  margin: 0;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
}

.page-content {
  background: hsl(var(--background));
  border-radius: var(--radius-lg);
  padding: 20px;
}
</style>

