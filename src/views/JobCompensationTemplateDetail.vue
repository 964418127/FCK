<template>
  <div class="template-detail-page">
    <!-- 顶部导航 -->
    <div class="detail-header">
      <div class="header-left">
        <el-button link @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <h2>{{ isEdit ? '编辑岗位模板' : '岗位模板详情' }}</h2>
      </div>
      <div class="header-right" v-if="!isEdit">
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </div>

    <div class="content-section" v-if="templateData">
      <!-- 基础信息 -->
      <div class="card">
        <h3>基础信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">岗位模板名称</span>
            <span class="info-value" v-if="!isEdit">{{ templateData.name }}</span>
            <el-input v-else v-model="templateData.name" style="width: 200px;" />
          </div>
          <div class="info-item">
            <span class="info-label">模板类型</span>
            <span class="info-value" v-if="!isEdit">
              <el-tag :type="templateData.templateType === '标准' ? 'success' : 'warning'" size="small">
                {{ templateData.templateType }}
              </el-tag>
            </span>
            <el-select v-else v-model="templateData.templateType" style="width: 120px;">
              <el-option label="标准" value="标准" />
              <el-option label="自定义" value="自定义" />
            </el-select>
          </div>
          <div class="info-item">
            <span class="info-label">岗位归属</span>
            <span class="info-value" v-if="!isEdit">{{ templateData.belongTo }}</span>
            <el-select v-else v-model="templateData.belongTo" style="width: 120px;">
              <el-option label="业务" value="业务" />
              <el-option label="职能" value="职能" />
            </el-select>
          </div>
          <div class="info-item">
            <span class="info-label">关联岗位</span>
            <span class="info-value" v-if="!isEdit">{{ templateData.position }}</span>
            <el-select v-else v-model="templateData.position" style="width: 140px;">
              <el-option label="推拿师" value="推拿师" />
              <el-option label="客户经理" value="客户经理" />
              <el-option label="理疗师" value="理疗师" />
            </el-select>
          </div>
          <div class="info-item">
            <span class="info-label">合作模式</span>
            <span class="info-value" v-if="!isEdit">{{ templateData.coopMode }}</span>
            <el-select v-else v-model="templateData.coopMode" style="width: 180px;">
              <el-option label="劳动合同-全职" value="劳动合同-全职" />
              <el-option label="劳务合作-兼职" value="劳务合作-兼职" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 关联薪酬项 -->
      <div class="card">
        <div class="card-header">
          <h3>关联薪酬项</h3>
          <span class="item-count">共 {{ incomeItems.length }} 项</span>
        </div>
        <el-table :data="incomeItems" border style="width: 100%">
          <el-table-column prop="id" label="编号" width="80" align="center" />
          <el-table-column prop="category" label="薪酬项类型" min-width="160" />
          <el-table-column prop="name" label="薪酬项名称" min-width="180" />
          <el-table-column prop="level" label="计算层级" width="100" align="center">
            <template #default="{ row }">
              <el-tooltip v-if="row.level === '系统'" content="第1级、第2级计算完成后，按固定顺序计算：代扣个税 → 代扣社保 → 代扣公积金" placement="top">
                <el-tag type="warning" size="small">末级</el-tag>
              </el-tooltip>
              <el-tag v-else type="info" size="small">第{{ row.level }}级</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isSystem" label="是否系统项" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isSystem ? 'warning' : 'info'" size="small">
                {{ row.isSystem ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="paymentForm" label="支付形式" width="100" align="center">
            <template #default>
              <span>现金</span>
            </template>
          </el-table-column>
          <el-table-column v-if="isEdit" label="操作" width="80" align="center">
            <template #default>
              <el-button type="danger" size="small" link>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="isEdit" class="add-item-row">
          <el-button type="primary" size="small" link>+ 添加薪酬项</el-button>
        </div>
      </div>

      <!-- 关联扣缴项 -->
      <div class="card">
        <div class="card-header">
          <h3>关联扣缴项</h3>
          <span class="item-count">共 {{ deductItems.length }} 项</span>
        </div>
        <el-table :data="deductItems" border style="width: 100%">
          <el-table-column prop="id" label="编号" width="80" align="center" />
          <el-table-column prop="category" label="扣缴项类型" min-width="160" />
          <el-table-column prop="name" label="扣缴项名称" min-width="180" />
          <el-table-column prop="level" label="计算层级" width="100" align="center">
            <template #default="{ row }">
              <el-tooltip v-if="row.level === '系统'" content="第1级、第2级计算完成后，按固定顺序计算：代扣个税 → 代扣社保 → 代扣公积金" placement="top">
                <el-tag type="warning" size="small">末级</el-tag>
              </el-tooltip>
              <el-tag v-else type="info" size="small">第{{ row.level }}级</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isSystem" label="是否系统项" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isSystem ? 'warning' : 'info'" size="small">
                {{ row.isSystem ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="paymentForm" label="支付形式" width="100" align="center">
            <template #default>
              <span>现金</span>
            </template>
          </el-table-column>
          <el-table-column v-if="isEdit" label="操作" width="80" align="center">
            <template #default>
              <el-button type="danger" size="small" link>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="isEdit" class="add-item-row">
          <el-button type="primary" size="small" link>+ 添加扣缴项</el-button>
        </div>
      </div>

      <!-- 公司成本项 已迁移到【岗位福利保障】 -->

      <!-- 编辑操作 -->
      <div v-if="isEdit" class="edit-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { compensationTemplates } from '../mock/data.js'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)

// 根据模板ID获取模板数据
const getTemplateById = (id) => {
  return compensationTemplates.find(t => t.id === id) || compensationTemplates[0]
}

// 模板数据
const templateData = ref(getTemplateById(route.params.id))

// 薪酬项数据
const incomeItems = ref(templateData.value.incomeItems.map((item, index) => ({
  id: index + 1,
  category: templateData.value.name,
  name: item.name,
  level: item.level,
  isSystem: item.level === '系统'
})))

// 扣缴项数据
const deductItems = ref(templateData.value.deductItems.map((item, index) => ({
  id: index + 1,
  category: templateData.value.name,
  name: item.name,
  level: item.level,
  isSystem: item.level === '系统'
})))

// 公司成本项已迁移到【岗位福利保障】
const companyCostItems = ref([])

// 返回列表
const goBack = () => {
  router.push({ name: 'job-compensation-template' })
}

// 编辑
const handleEdit = () => {
  router.push({ name: 'job-compensation-template-detail', params: { id: route.params.id }, query: { mode: 'edit' } })
}

// 取消
const handleCancel = () => {
  router.push({ name: 'job-compensation-template-detail', params: { id: route.params.id } })
}

// 保存
const handleSave = () => {
  router.push({ name: 'job-compensation-template-detail', params: { id: route.params.id } })
}

onMounted(() => {
  // 根据路由参数判断是查看还是编辑
  if (route.query.mode === 'edit') {
    isEdit.value = true
  }
})
</script>

<style scoped>
.template-detail-page {
  padding: 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: 8px;
}

.content-section {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.card {
  background: hsl(var(--muted) / 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.card h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: hsl(var(--foreground));
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
}

.item-count {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.add-item-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed hsl(var(--border));
  text-align: center;
}

.edit-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid hsl(var(--border));
}
</style>
