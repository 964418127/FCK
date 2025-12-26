<template>
  <div class="message-channel">
    <div class="page-header">
      <h2>消息通道配置</h2>
      <p>管理消息发送通道，支持站内信、App推送、邮件、微信模板消息、短信</p>
    </div>
    
    <div class="page-content">
      <!-- 通道列表 -->
      <el-table :data="channelList" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="code" label="通道编码" width="150" />
        <el-table-column prop="name" label="通道名称" width="150" />
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

// 通道列表
const channelList = ref([
  {
    id: '1',
    code: 'inbox',
    name: '站内信',
    description: '系统内部消息通知',
    status: 'enabled'
  },
  {
    id: '2',
    code: 'push',
    name: 'App推送',
    description: '移动应用推送通知',
    status: 'enabled'
  },
  {
    id: '3',
    code: 'email',
    name: '邮件',
    description: '电子邮件通知',
    status: 'enabled'
  },
  {
    id: '4',
    code: 'wechat',
    name: '微信模板消息',
    description: '微信公众号模板消息',
    status: 'enabled'
  },
  {
    id: '5',
    code: 'sms',
    name: '短信',
    description: '短信通知',
    status: 'enabled'
  }
])

// 操作函数
const handleToggleStatus = (row) => {
  row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  ElMessage.success(`通道已${row.status === 'enabled' ? '启用' : '禁用'}`)
}
</script>

<style scoped>
.message-channel {
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

