<template>
  <div class="dependency-calculation">
    <div class="page-header">
      <h1>依赖计算</h1>
      <p class="tip">💡 配置依赖计算策略，管理薪酬项的依赖关系和外部服务调用</p>
    </div>

    <div class="content-section">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-select v-model="filterStrategy" placeholder="筛选发放策略" clearable style="width: 200px;">
            <el-option v-for="s in strategyList" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" @click="goToAdd">+ 新增策略</el-button>
        </div>
      </div>

      <!-- 策略列表 -->
      <div class="strategy-list">
        <div v-for="strategy in filteredStrategies" :key="strategy.id" class="strategy-card">
          <div class="strategy-header">
            <div class="strategy-info">
              <span class="strategy-name">{{ strategy.name }}</span>
              <el-tag size="small" type="success">发放策略：{{ strategy.strategyName }}</el-tag>
            </div>
            <div class="strategy-actions">
              <el-button type="primary" size="small" link @click="goToEdit(strategy)">编辑</el-button>
              <el-button type="danger" size="small" link @click="deleteStrategy(strategy)">删除</el-button>
            </div>
          </div>
          <div class="strategy-meta">
            <div class="meta-item-group">
              <span class="meta-label">有效期</span>
              <span class="meta-value">{{ strategy.startDate }} 至 {{ strategy.endDate }}</span>
            </div>
            <div class="meta-item-group">
              <span class="meta-label">规则数</span>
              <span class="meta-value rule-count">{{ strategy.rules.length }}</span>
            </div>
          </div>
        </div>

        <el-empty v-if="filteredStrategies.length === 0" description="暂无依赖计算策略" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 发放策略列表
const strategyList = ref([
  { id: 1, name: '2026年全职员工发放策略' },
  { id: 2, name: '2026年兼职员工发放策略' },
  { id: 3, name: '2026年全职员工负工资抵扣演示' }
])

// 薪酬项列表（真实业务项）
const salaryItems = ref([
  { id: 1, name: '计件提成' },
  { id: 2, name: '加班工资' },
  { id: 3, name: '超产值补贴' },
  { id: 4, name: '客户打赏' },
  { id: 5, name: '退单补贴' },
  { id: 6, name: '回头客获豆' },
  { id: 7, name: '内部介绍获豆' },
  { id: 8, name: '培训获豆' },
  { id: 9, name: '顶班获豆' },
  { id: 10, name: '住宿获豆' },
  { id: 11, name: '服务圈获豆' },
  { id: 12, name: '营销折扣获豆' },
  { id: 13, name: '三级合伙人获豆' },
  { id: 14, name: '人事手动补贴' },
  { id: 15, name: '投诉扣款' },
  { id: 16, name: '代扣个税' },
  { id: 17, name: '保底获豆' },
  { id: 18, name: '代扣社保' },
  { id: 19, name: '代扣公积金' }
])

// 筛选
const filterStrategy = ref(null)

// 策略列表数据
const strategies = ref([
  {
    id: 1,
    name: '全职员工保底获豆计算',
    strategyId: 1,
    strategyName: '2026年全职员工发放策略',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    rules: [
      {
        name: '月度保底获豆计算',
        frequency: '月（自然月）',
        frequencyNode: '当月 M1日',
        dependItems: [
          { id: 1, name: '计件提成', payslip: '计件工资条', paymentType: '现金' },
          { id: 2, name: '超时加班费', payslip: '加班工资条', paymentType: '现金' },
          { id: 3, name: '节假日加班费', payslip: '加班工资条', paymentType: '现金' },
          { id: 401, name: '最低工资标准', value: '2360' }
        ],
        steps: [
          { resultAlias: '保底收入项', formula: '求和(计件提成, 超时加班费, 节假日加班费)' },
          { resultAlias: '保底获豆', formula: '条件判断' }
        ],
        crossRuleDeps: [],
        embeds: [{ name: '保底获豆', resultType: '薪酬项', paymentType: '常乐豆', targetPayslip: '常乐豆工资条', sourceStep: 1 }]
      }
    ]
  },
  {
    id: 2,
    name: '兼职员工个税计算',
    strategyId: 2,
    strategyName: '2026年兼职员工发放策略',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    rules: [
      {
        name: '第1周预扣个税',
        frequency: '月（业务周）',
        frequencyNode: '当月 M1日',
        dependItems: [
          { id: 101, name: '基础提成', payslip: '第1周工资条', paymentType: '现金' },
          { id: 201, name: '绩效补贴', payslip: '第1周工资条', paymentType: '现金' },
          { id: 202, name: '夜班补贴', payslip: '第1周工资条', paymentType: '现金' }
        ],
        steps: [
          { resultAlias: '第1周预扣个税', formula: '(基础提成 + 绩效补贴 + 夜班补贴) * 0.03' }
        ],
        crossRuleDeps: [],
        embeds: [{ name: '预扣个税', resultType: '扣缴项', paymentType: '现金', targetPayslip: '第1周工资条', sourceStep: 0 }]
      },
      {
        name: '第2周预扣个税',
        frequency: '月（业务周）',
        frequencyNode: '当月 M1日',
        dependItems: [
          { id: 102, name: '回头客激励', payslip: '第2周工资条', paymentType: '现金' },
          { id: 203, name: '服务时长补贴', payslip: '第2周工资条', paymentType: '现金' }
        ],
        steps: [
          { resultAlias: '第2周预扣个税', formula: '(回头客激励 + 服务时长补贴) * 0.03' }
        ],
        crossRuleDeps: [],
        embeds: [{ name: '预扣个税', resultType: '扣缴项', paymentType: '现金', targetPayslip: '第2周工资条', sourceStep: 0 }]
      },
      {
        name: '第3周预扣个税',
        frequency: '月（业务周）',
        frequencyNode: '当月 M1日',
        dependItems: [
          { id: 103, name: '周时长激励', payslip: '第3周工资条', paymentType: '现金' },
          { id: 204, name: '节假日补贴', payslip: '第3周工资条', paymentType: '现金' }
        ],
        steps: [
          { resultAlias: '第3周预扣个税', formula: '(周时长激励 + 节假日补贴) * 0.03' }
        ],
        crossRuleDeps: [],
        embeds: [{ name: '预扣个税', resultType: '扣缴项', paymentType: '现金', targetPayslip: '第3周工资条', sourceStep: 0 }]
      },
      {
        name: '月度个税汇总退补',
        frequency: '月（业务周）',
        frequencyNode: '当月 M1日',
        dependItems: [
          { id: 101, name: '基础提成' },
          { id: 102, name: '回头客激励' },
          { id: 103, name: '周时长激励' }
        ],
        crossRuleDeps: [0, 1, 2],
        steps: [
          { resultAlias: '税前收入合计', formula: '求和(基础提成, 回头客激励, 周时长激励)' },
          { resultAlias: '实际税额', formula: '外部服务(TAX)' },
          { resultAlias: '预扣税合计', formula: '求和(规则1/第1周预扣个税, 规则2/第2周预扣个税, 规则3/第3周预扣个税)' },
          { resultAlias: '个税退补', formula: '条件判断' }
        ],
        embeds: [
          { name: '个税退税', resultType: '薪酬项', paymentType: '现金', targetPayslip: '第4周工资条', sourceStep: 3 },
          { name: '个税补缴', resultType: '扣缴项', paymentType: '现金', targetPayslip: '第4周工资条', sourceStep: 3 }
        ]
      }
    ]
  },
  {
    id: 3,
    name: '全职员工负工资抵扣演示',
    strategyId: 1,
    strategyName: '2026年全职员工发放策略（负工资演示）',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    rules: [
      {
        name: '计件工资条抵扣',
        frequency: '月（自然月）',
        frequencyNode: '当月 M1日',
        dependItems: [
          { id: 1, name: '计件提成', payslip: '计件工资条', paymentType: '现金' },
          { id: 2, name: '超时加班费', payslip: '计件工资条', paymentType: '现金' },
          { id: 3, name: '节假日加班费', payslip: '计件工资条', paymentType: '现金' },
          { id: 501, name: '员工' }
        ],
        steps: [
          { resultAlias: '收入合计', formula: '求和(计件提成, 超时加班费, 节假日加班费)' },
          { resultAlias: '负工资抵扣', formula: '外部服务(负工资)' }
        ],
        crossRuleDeps: [],
        embeds: [
          { name: '负工资抵扣', resultType: '扣缴项', paymentType: '现金', targetPayslip: '计件工资条', sourceStep: 1 }
        ]
      },
      {
        name: '补贴工资条抵扣',
        frequency: '月（自然月）',
        frequencyNode: '当月 M1日',
        dependItems: [
          { id: 4, name: '超产值补贴', payslip: '补贴工资条', paymentType: '现金' },
          { id: 5, name: '客户打赏', payslip: '补贴工资条', paymentType: '现金' },
          { id: 501, name: '员工' }
        ],
        steps: [
          { resultAlias: '收入合计', formula: '求和(超产值补贴, 客户打赏)' },
          { resultAlias: '负工资抵扣', formula: '外部服务(负工资)' }
        ],
        crossRuleDeps: [0],
        embeds: [
          { name: '负工资抵扣', resultType: '扣缴项', paymentType: '现金', targetPayslip: '补贴工资条', sourceStep: 1 }
        ]
      },
      {
        name: '加班工资条抵扣',
        frequency: '月（自然月）',
        frequencyNode: '当月 M1日',
        dependItems: [
          { id: 201, name: '保底获豆', paymentType: '常乐豆' },
          { id: 501, name: '员工' }
        ],
        steps: [
          { resultAlias: '常乐豆收入', formula: '保底获豆' },
          { resultAlias: '负工资抵扣', formula: '外部服务(负工资)' }
        ],
        crossRuleDeps: [0, 1],
        embeds: [
          { name: '负工资抵扣', resultType: '扣缴项', paymentType: '常乐豆', targetPayslip: '常乐豆工资条', sourceStep: 1 }
        ]
      }
    ]
  }
])

// 过滤后的策略
const filteredStrategies = computed(() => {
  if (!filterStrategy.value) return strategies.value
  return strategies.value.filter(s => s.strategyId === filterStrategy.value)
})

// 跳转新增
const goToAdd = () => {
  router.push('/strategy-form')
}

// 跳转编辑
const goToEdit = (strategy) => {
  router.push(`/strategy-form?id=${strategy.id}`)
}

// 删除策略
const deleteStrategy = (strategy) => {
  ElMessageBox.confirm(`确定要删除策略「${strategy.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    strategies.value = strategies.value.filter(s => s.id !== strategy.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}
</script>

<style scoped>
.dependency-calculation {
  padding: 20px;
  background: #f5f5f5;
}

.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.tip {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.content-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.strategy-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

.strategy-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.strategy-card:hover {
  border-color: #a40035;
  box-shadow: 0 2px 12px rgba(164, 0, 53, 0.1);
}

.strategy-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.strategy-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.strategy-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.strategy-strategy {
  font-size: 13px;
  color: #999;
}

.strategy-sub-tag {
  flex-shrink: 0;
}

.strategy-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.strategy-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  font-size: 13px;
}

.meta-item-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-label {
  color: #999;
}

.meta-value {
  color: #666;
}

.strategy-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.strategy-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
}

.meta-item-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-label {
  color: #999;
}

.meta-value {
  color: #666;
}

.meta-value.rule-count {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
</style>