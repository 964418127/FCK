<template>
  <div class="monthly-diff-page">
    <el-card class="page-card">
      <div class="page-header">
        <h3>月差异确认</h3>
        <p class="muted">用于查看与确认周期内的差异数据，决定是否继续发放工资。</p>
      </div>

      <el-form :inline="true" class="search-form" @submit.prevent>
        <el-form-item label="岗位">
          <el-select v-model="filters.post" placeholder="请选择岗位" clearable style="width:220px">
            <el-option label="客户经理" value="customer_manager" />
            <el-option label="推拿师" value="therapist" />
          </el-select>
        </el-form-item>
        <el-form-item label="校验周期">
          <el-select v-model="filters.period" placeholder="请选择周期" clearable style="width:160px">
            <el-option v-for="p in periods" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="confirm-box" style="margin-top:16px; display:flex; align-items:center; justify-content:space-between;">
        <div class="confirm-info">
          <el-tag type="info">确认可用条件：次月4日 16:00 之后 & 存在差异数据</el-tag>
          <div class="muted" style="margin-top:6px">若确认，差异将不阻断工资发放；未确认则停止该岗位发放计划。</div>
        </div>
        <div>
          <el-button type="primary" @click="onConfirm">确认差异</el-button>
          <el-button style="margin-left:8px" @click="onSearch">刷新</el-button>
        </div>
      </div>

      <!-- (已移除弹出/内联填写功能：点击确认将直接执行确认操作) -->

      <!-- 按岗位分组展示差异数据 -->
      <div v-for="(postData, index) in groupedData" :key="postData.post" class="post-group" :style="{ marginTop: index > 0 ? '24px' : '16px' }">
        <div class="post-header">
          <h4>{{ postData.postLabel }} - {{ postData.period || '最新周期' }}</h4>
          <el-tag :type="postData.hasDiff ? 'warning' : 'success'">
            {{ postData.hasDiff ? '存在差异' : '全部校验通过' }}
          </el-tag>
        </div>

        <!-- 差异确认表单 -->
        <div v-if="postData.hasDiff" class="diff-confirmation-form">
          <div class="form-header">
            <div class="form-title">
              <el-icon class="form-icon"><DocumentChecked /></el-icon>
              <span>差异确认单</span>
            </div>
            <div class="form-meta">
              <div class="meta-item">
                <span class="meta-label">岗位：</span>
                <span class="meta-value">{{ postData.postLabel }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">周期：</span>
                <span class="meta-value">{{ postData.period }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">差异数量：</span>
                <span class="meta-value">{{ postData.diffs.length }} 项</span>
              </div>
            </div>
          </div>

          <div class="form-body">
            <div class="diff-items-section">
              <h4 class="section-title">待确认差异项目</h4>

              <div class="diff-item-form" v-for="(diff, index) in postData.diffs" :key="diff.id">
                <div class="item-header">
                  <div class="item-number">项目 {{ index + 1 }}</div>
                  <el-tag :type="diff.result === '存在差异' ? 'danger' : 'success'" size="small">
                    {{ diff.result }}
                  </el-tag>
                </div>

              <div class="item-fields">
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">指标名称</label>
                    <div class="field-value">{{ diff.metric }}</div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">校验时间</label>
                    <div class="field-value">{{ diff.checkedAt }}</div>
                  </div>
                  <div class="field-action-inline">
                    <el-button type="text" size="small" @click="viewDetail(diff)" class="detail-link">
                      <el-icon><View /></el-icon>
                      查看详细数据
                    </el-button>
                  </div>
                </div>
              </div>
              </div>
            </div>

            <!-- 确认状态区域 -->
            <div class="confirmation-section">
              <h4 class="section-title">确认状态</h4>
              <div class="confirmation-status">
                <div class="status-indicator">
                  <el-tag :type="postData.isConfirmed ? 'success' : 'warning'" size="large">
                    {{ postData.isConfirmed ? '已确认' : '待确认' }}
                  </el-tag>
                </div>
                <div v-if="postData.isConfirmed" class="confirmation-details">
                  <div class="detail-row">
                    <span class="detail-label">确认人：</span>
                    <span class="detail-value">{{ postData.confirmedBy }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">确认时间：</span>
                    <span class="detail-value">{{ postData.confirmedAt }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">确认备注：</span>
                    <span class="detail-value">{{ postData.confirmedRemark }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-diff-message" style="padding: 20px; text-align: center; background: #f8f9fa; border-radius: 4px; margin-top: 12px;">
          <el-icon size="24" color="#67c23a"><CircleCheck /></el-icon>
          <p style="margin: 8px 0 0 0; color: #67c23a;">该岗位全部校验通过，无差异数据</p>
        </div>
      </div>

      <!-- 确认差异弹出框 -->
      <el-dialog
        v-model="confirmDialogVisible"
        title="确认差异"
        width="500px"
        :close-on-click-modal="false"
        :append-to-body="true"
        :z-index="3000"
      >
        <el-form :model="confirmForm" :rules="confirmRules" ref="confirmFormRef">
          <el-form-item label="确认备注" prop="remark" :label-width="formLabelWidth">
            <el-input
              v-model="confirmForm.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入确认差异的备注说明..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="confirmDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleConfirmSubmit" :loading="confirmLoading">
              确认差异
            </el-button>
          </span>
        </template>
      </el-dialog>

    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheck, DocumentChecked, View } from '@element-plus/icons-vue'

const router = useRouter()
  const loading = ref(false)
  const filters = ref({
    post: '',
    period: ''
  })
  const periods = ref(['2025.09', '2025.10', '2025.11'])
  const groupedData = ref([])
  const confirmRemark = ref('')

  // 确认差异弹出框相关
  const confirmDialogVisible = ref(false)
  const confirmFormRef = ref(null)
  const confirmLoading = ref(false)
  const formLabelWidth = '80px'
  const confirmForm = ref({
    remark: ''
  })
  const confirmRules = ref({
    remark: [
      { required: true, message: '请输入确认备注', trigger: 'blur' },
      { min: 2, max: 500, message: '备注长度在 2 到 500 个字符', trigger: 'blur' }
    ]
  })

  const canConfirm = computed(() => {
    // 检查是否有未确认的差异数据
    return groupedData.value.some(postData =>
      postData.hasDiff && postData.diffs.some(diff => !diff.confirmed)
    )
  })

  function mockFetchData(postFilter = '', periodFilter = '') {
    loading.value = true
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟原始数据
        const sample = [
          { id: 1, metric: '门店业绩指标', post: 'customer_manager', postLabel: '客户经理', result: '存在差异', period: '2025.10', checkedAt: '2025-11-05 09:24', confirmed: false },
          { id: 2, metric: '服务小时数', post: 'therapist', postLabel: '推拿师', result: '存在差异', period: '2025.10', checkedAt: '2025-11-05 09:28', confirmed: false },
          { id: 3, metric: '月活跃用户', post: 'customer_manager', postLabel: '客户经理', result: '已确认', period: '2025.09', checkedAt: '2025-10-05 11:12', confirmed: true, confirmedBy: '张三', confirmedAt: '2025-10-06 14:20', confirmedRemark: '人工复核确认无误' },
          { id: 4, metric: '客户满意度', post: 'customer_manager', postLabel: '客户经理', result: '存在差异', period: '2025.10', checkedAt: '2025-11-05 09:30', confirmed: false }
        ]

        // 按岗位分组
        const posts = [
          { value: 'customer_manager', label: '客户经理' },
          { value: 'therapist', label: '推拿师' }
        ]

        const grouped = posts
          .filter(p => !postFilter || p.value === postFilter)
          .map(post => {
            // 筛选该岗位的数据
            const postDiffs = sample.filter(d =>
              d.post === post.value &&
              (!periodFilter || d.period === periodFilter)
            )

            // 如果没有指定周期，使用最新周期的数据
            const latestPeriod = periodFilter || '2025.10'

            // 过滤指定周期的数据
            const periodDiffs = postDiffs.filter(d => d.period === latestPeriod)

            // 检查该岗位是否已确认（所有差异项都已确认）
            const isConfirmed = periodDiffs.length > 0 && periodDiffs.every(diff => diff.confirmed)
            const confirmedBy = isConfirmed ? periodDiffs.find(diff => diff.confirmed)?.confirmedBy : null
            const confirmedAt = isConfirmed ? periodDiffs.find(diff => diff.confirmed)?.confirmedAt : null
            const confirmedRemark = isConfirmed ? periodDiffs.find(diff => diff.confirmed)?.confirmedRemark : null

            return {
              post: post.value,
              postLabel: post.label,
              period: periodFilter || latestPeriod,
              hasDiff: periodDiffs.length > 0,
              diffs: periodDiffs,
              isConfirmed,
              confirmedBy,
              confirmedAt,
              confirmedRemark
            }
          })

        loading.value = false
        resolve(grouped)
      }, 300)
    })
  }

async function onSearch() {
  loading.value = true
  const data = await mockFetchData(filters.value.post, filters.value.period)
  groupedData.value = data
  loading.value = false
}

function onReset() {
  filters.value.post = ''
  filters.value.period = ''
  groupedData.value = []
}

function viewDetail(row) {
  // 跳转到校验结果详情页（示例：尚未实现详情页面）
  router.push({ name: 'data-check-detail', params: { id: row.id } }).catch(() => {
    // 如果没有实现详情页，弹窗提示
    window.alert('打开校验结果明细（示例）: ' + row.metric)
  })
}

function onConfirm() {
  // 显示确认差异弹出框
  confirmDialogVisible.value = true
  // 重置表单
  confirmForm.value.remark = ''
  if (confirmFormRef.value) {
    confirmFormRef.value.clearValidate()
  }
}

function handleConfirmSubmit() {
  if (!confirmFormRef.value) return

  confirmFormRef.value.validate(async (valid) => {
    if (valid) {
      confirmLoading.value = true
      try {
        await doConfirm(confirmForm.value.remark)
        confirmDialogVisible.value = false
      } catch (error) {
        console.error('确认差异失败:', error)
      } finally {
        confirmLoading.value = false
      }
    }
  })
}

async function doConfirm(remark) {
  // 检查是否有未确认的差异数据
  const hasUnconfirmedDiffs = groupedData.value.some(postData =>
    postData.hasDiff && postData.diffs.some(diff => !diff.confirmed)
  )

  if (!hasUnconfirmedDiffs) {
    try { ElMessage.warning('没有需要确认的差异数据') } catch (e) { window.alert('没有需要确认的差异数据') }
    return
  }

  // 使用传入的备注进行确认所有未确认的差异
  const now = new Date()
  const formatNow = now.toISOString().replace('T', ' ').slice(0, 19)

  groupedData.value = groupedData.value.map(postData => {
    if (postData.hasDiff && !postData.isConfirmed) {
      const updatedDiffs = postData.diffs.map(diff => ({
        ...diff,
        confirmed: true,
        confirmedBy: '张小林-人事经理',
        confirmedAt: formatNow,
        confirmedRemark: remark || '已确认'
      }))

      return {
        ...postData,
        diffs: updatedDiffs,
        isConfirmed: true,
        confirmedBy: '张小林-人事经理',
        confirmedAt: formatNow,
        confirmedRemark: remark || '已确认'
      }
    }
    return postData
  })

  confirmRemark.value = ''
  try { ElMessage?.success?.('已确认所有差异数据') } catch (e) { window.alert('已确认所有差异数据') }
}

onMounted(async () => {
  // 初始查询：默认加载最新周期数据
  groupedData.value = await mockFetchData()
})
</script>

<style scoped>
.page-card { padding: 16px; }
.page-header h3 { margin: 0 0 6px 0; font-size: 18px; }
.muted { color: var(--muted-foreground); margin-left:8px; }
.search-form { margin-top: 12px; }
.confirm-box .muted { margin-left: 8px; color: var(--muted-foreground); }

.post-group {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  background: #fafafa;
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.post-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.diff-confirmation-form {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.form-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 16px 20px;
  border-bottom: 2px solid #dee2e6;
}

.form-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.form-title .el-icon {
  color: hsl(var(--primary));
  font-size: 20px;
}

.form-title span {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.form-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.meta-value {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
}

.form-body {
  padding: 16px 20px;
}

.diff-items-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid hsl(var(--primary));
}

.diff-item-form {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafbfc;
  margin-bottom: 12px;
  overflow: hidden;
}

.diff-item-form:last-child {
  margin-bottom: 0;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.item-number {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.item-fields {
  padding: 8px 12px;
}

.field-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 0;
}

.field-group {
  flex: 1;
  min-width: 180px;
}

.field-action-inline {
  display: flex;
  align-items: flex-end;
  padding-bottom: 6px;
  flex-shrink: 0;
}

.field-label {
  display: block;
  font-size: 11px;
  color: #909399;
  font-weight: 500;
  margin-bottom: 3px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-value {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  padding: 4px 6px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  min-height: 16px;
  line-height: 1.3;
}

.detail-link {
  color: hsl(var(--primary));
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.detail-link:hover {
  color: hsl(var(--primary-hover));
  background-color: hsl(var(--primary) / 0.1);
}

.detail-link .el-icon {
  margin-right: 3px;
}

.confirmation-section {
  border-top: 2px solid #f0f0f0;
  padding-top: 12px;
}

.confirmation-status {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
}

.status-indicator {
  margin-bottom: 8px;
}

.confirmation-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 3px;
  border: 1px solid #f0f0f0;
}

.detail-label {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
  min-width: 60px;
}

.detail-value {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
}

.no-diff-message {
  text-align: center;
  background: #f0f9ff;
  border: 1px solid #b3e5fc;
  border-radius: 4px;
}

/* inline confirm removed */
</style>


