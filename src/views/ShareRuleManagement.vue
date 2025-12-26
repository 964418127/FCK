<template>
  <div class="share-rule-management">
    <div class="page-header">
      <h2>分享活动</h2>
      <p>管理分享推荐奖励活动</p>
    </div>
    
    <div class="page-content">
      <!-- 操作栏 -->
      <div class="action-bar">
          <el-button type="primary" @click="handleAddRule">
          <el-icon><Plus /></el-icon>
          新增活动
        </el-button>
      </div>
      
      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索活动名称"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
      
      <!-- 活动列表 -->
      <el-table :data="filteredRules" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="ruleName" label="活动名称" min-width="200" />
        <el-table-column label="有效期范围" width="280">
          <template #default="scope">
            {{ formatDateRange(scope.row.validityStart, scope.row.validityEnd) }}
          </template>
        </el-table-column>
        <el-table-column label="奖励规则" min-width="300">
          <template #default="scope">
            <div class="reward-rules-preview">
              <div v-if="scope.row.rewardRules.inviter" class="reward-item">
                <span class="reward-label">邀请人：</span>
                <span>{{ formatInviterReward(scope.row.rewardRules.inviter) }}</span>
              </div>
              <div v-if="scope.row.rewardRules.invitee" class="reward-item">
                <span class="reward-label">被邀请人：</span>
                <span>{{ formatInviteeReward(scope.row.rewardRules.invitee) }}</span>
              </div>
              <div v-if="scope.row.rewardRules.inviterSuperior" class="reward-item">
                <span class="reward-label">邀请人上级：</span>
                <span>{{ formatInviterSuperiorReward(scope.row.rewardRules.inviterSuperior) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分享对象" width="200">
          <template #default="scope">
            <div>
              <div>类型：{{ formatShareObjectType(scope.row.shareObject.type) }}</div>
              <div v-if="scope.row.shareObject.type === 'user'">
                {{ scope.row.shareObject.inviteCodeType === 'self' ? '本人邀请码' : '指定邀请码列表' }}
              </div>
              <div v-else-if="scope.row.shareObject.type === 'course' || scope.row.shareObject.type === 'course_lecturer'">
                ID列表：{{ scope.row.shareObject.idList || scope.row.shareObject.id || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" link @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="primary" link @click="handleViewDetail(scope.row)">
                详情
              </el-button>
              <el-button type="danger" link @click="handleDelete(scope.row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 新增/编辑活动对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="ruleDialogTitle"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="ruleFormRules"
        label-width="140px"
      >
        <el-form-item label="活动名称" prop="ruleName">
          <el-input v-model="ruleForm.ruleName" placeholder="请输入活动名称" />
        </el-form-item>
        
        <el-form-item label="分享对象" required>
          <div style="display: flex; flex-direction: column; gap: 12px; width: 100%">
            <el-form-item prop="shareObject.type" style="margin-bottom: 0">
              <el-select 
                v-model="ruleForm.shareObject.type" 
                placeholder="请选择分享对象类型" 
                style="width: 100%"
                @change="handleShareObjectTypeChange"
              >
                <el-option label="不限" value="unlimited" />
                <el-option label="课程" value="course" />
                <el-option label="课程讲师" value="course_lecturer" />
                <el-option label="用户" value="user" />
              </el-select>
            </el-form-item>
            <el-form-item 
              v-if="ruleForm.shareObject.type === 'user'" 
              prop="shareObject.inviteCodeType" 
              style="margin-bottom: 0"
            >
              <el-radio-group v-model="ruleForm.shareObject.inviteCodeType">
                <el-radio label="self">本人邀请码</el-radio>
                <el-radio label="list">指定邀请码列表</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item 
              v-if="ruleForm.shareObject.type === 'user' && ruleForm.shareObject.inviteCodeType === 'list'"
              prop="shareObject.inviteCodeList" 
              style="margin-bottom: 0"
            >
              <el-input 
                v-model="ruleForm.shareObject.inviteCodeList" 
                type="textarea"
                :rows="3"
                placeholder="请输入邀请码列表，每行一个" 
              />
            </el-form-item>
            <el-form-item 
              v-if="ruleForm.shareObject.type === 'course' || ruleForm.shareObject.type === 'course_lecturer'"
              prop="shareObject.idList" 
              style="margin-bottom: 0"
            >
              <el-input 
                v-model="ruleForm.shareObject.idList" 
                type="textarea"
                :rows="3"
                placeholder="请输入对象ID，每行一个" 
              />
            </el-form-item>
          </div>
        </el-form-item>
        
        <el-form-item label="有效期范围" prop="validityRange">
          <el-date-picker
            v-model="ruleForm.validityRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 400px"
            class="validity-range-picker"
          />
        </el-form-item>
        
        <el-divider>奖励规则</el-divider>
        
        <!-- 邀请人奖励 -->
        <div class="reward-config-section">
          <div class="reward-section-header">
            <h4>邀请人奖励</h4>
          </div>
          <div class="reward-section-content">
            <el-form-item label="邀请人身份限定" label-width="140px">
              <el-select 
                v-model="ruleForm.rewardRules.inviter.identityLimit" 
                placeholder="请选择身份类型"
                style="width: 100%"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                @change="handleIdentityLimitChange('inviter', $event)"
              >
                <el-option label="不限" value="unlimited" />
                <el-option
                  v-for="identity in certifiedIdentities"
                  :key="identity.code"
                  :label="identity.name"
                  :value="identity.code"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="奖励类型" label-width="140px">
              <el-radio-group v-model="ruleForm.rewardRules.inviter.rewardType">
                <el-radio label="gradient">梯度区间固定奖励</el-radio>
                <el-radio label="fixed">按人固定奖励值</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item 
              v-if="ruleForm.rewardRules.inviter.rewardType === 'gradient'"
              label="奖励发放时间"
              label-width="140px"
            >
              <el-select v-model="ruleForm.rewardRules.inviter.rewardTime" style="width: 100%">
                <el-option label="计划结束" value="plan_end" />
              </el-select>
            </el-form-item>
            <el-form-item 
              v-if="ruleForm.rewardRules.inviter.rewardType === 'fixed'"
              label="固定奖励值"
              label-width="140px"
            >
              <div style="display: flex; align-items: center; gap: 8px; width: 100%">
                <el-input-number 
                  v-model="ruleForm.rewardRules.inviter.fixedReward" 
                  :min="0"
                  style="flex: 1"
                />
                <span style="color: #606266; font-size: 14px;">常乐豆</span>
              </div>
            </el-form-item>
            <el-form-item 
              v-if="ruleForm.rewardRules.inviter.rewardType === 'fixed'"
              label="奖励上限"
              label-width="140px"
            >
              <div class="limit-inputs">
                <div class="limit-row">
                  <el-switch v-model="ruleForm.rewardRules.inviter.rewardLimit.enabled" />
                  <span class="limit-tip">开启后限制单个邀请人累计获得的固定奖励</span>
                </div>
                <div 
                  v-if="ruleForm.rewardRules.inviter.rewardLimit.enabled" 
                  class="limit-values"
                >
                  <div class="limit-row">
                    <span class="limit-label">总上限</span>
                    <el-input-number 
                      v-model="ruleForm.rewardRules.inviter.rewardLimit.totalCap" 
                      :min="0"
                      controls-position="right"
                      style="flex: 1"
                    />
                    <span class="limit-unit">常乐豆</span>
                  </div>
                  <div class="limit-row">
                    <span class="limit-label">每日上限</span>
                    <el-input-number 
                      v-model="ruleForm.rewardRules.inviter.rewardLimit.dailyCap" 
                      :min="0"
                      controls-position="right"
                      style="flex: 1"
                    />
                    <span class="limit-unit">常乐豆/天</span>
                  </div>
                </div>
              </div>
            </el-form-item>
            <el-form-item 
              v-if="ruleForm.rewardRules.inviter.rewardType === 'gradient'"
              label="梯度区间"
              label-width="140px"
            >
              <div class="gradient-ranges">
                <div 
                  v-for="(range, index) in ruleForm.rewardRules.inviter.gradientRanges" 
                  :key="index"
                  class="gradient-range-item"
                >
                  <el-input-number 
                    v-model="range.min" 
                    :min="0"
                    placeholder="最小值"
                    style="width: 120px"
                  />
                  <span style="margin: 0 8px">-</span>
                  <el-input-number 
                    v-model="range.max" 
                    :min="0"
                    placeholder="最大值"
                    style="width: 120px"
                  />
                  <span style="margin: 0 8px">奖励：</span>
                  <el-input-number 
                    v-model="range.reward" 
                    :min="0"
                    placeholder="奖励值"
                    style="width: 120px"
                  />
                  <span style="margin-left: 4px; color: #606266; font-size: 14px;">常乐豆</span>
                  <el-button 
                    type="danger" 
                    link 
                    @click="removeGradientRange('inviter', index)"
                    style="margin-left: 8px"
                  >
                    删除
                  </el-button>
                </div>
                <el-button 
                  type="primary" 
                  link 
                  @click="addGradientRange('inviter')"
                  style="margin-top: 8px"
                >
                  + 添加梯度区间
                </el-button>
              </div>
            </el-form-item>
          </div>
        </div>
        
        <!-- 被邀请人奖励 -->
        <div class="reward-config-section">
          <div class="reward-section-header">
            <h4>被邀请人奖励</h4>
          </div>
          <div class="reward-section-content">
            <el-form-item label="被邀请人身份限定" label-width="140px">
              <el-select 
                v-model="ruleForm.rewardRules.invitee.identityLimit" 
                placeholder="请选择身份类型"
                style="width: 100%"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                @change="handleIdentityLimitChange('invitee', $event)"
              >
                <el-option label="不限" value="unlimited" />
                <el-option
                  v-for="identity in certifiedIdentities"
                  :key="identity.code"
                  :label="identity.name"
                  :value="identity.code"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="固定奖励值" label-width="140px">
              <div style="display: flex; align-items: center; gap: 8px; width: 100%">
                <el-input-number 
                  v-model="ruleForm.rewardRules.invitee.fixedReward" 
                  :min="0"
                  style="flex: 1"
                />
                <span style="color: #606266; font-size: 14px;">常乐豆</span>
              </div>
            </el-form-item>
          </div>
        </div>
        
        <!-- 邀请人上级奖励（可选） -->
        <div class="reward-config-section">
          <div class="reward-section-header">
            <h4>邀请人上级奖励（可选）</h4>
            <el-switch v-model="ruleForm.enableInviterSuperior" />
          </div>
          <div v-if="ruleForm.enableInviterSuperior" class="reward-section-content">
            <el-form-item label="邀请人上级身份限定" label-width="140px">
              <el-select 
                v-model="ruleForm.rewardRules.inviterSuperior.identityLimit" 
                placeholder="请选择身份类型"
                style="width: 100%"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                @change="handleIdentityLimitChange('inviterSuperior', $event)"
              >
                <el-option label="不限" value="unlimited" />
                <el-option
                  v-for="identity in certifiedIdentities"
                  :key="identity.code"
                  :label="identity.name"
                  :value="identity.code"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="奖励类型" label-width="140px">
              <el-radio-group v-model="ruleForm.rewardRules.inviterSuperior.rewardType">
                <el-radio label="gradient">梯度区间固定奖励</el-radio>
                <el-radio label="fixed">按数量固定奖励值</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item 
              v-if="ruleForm.rewardRules.inviterSuperior.rewardType === 'gradient'"
              label="奖励发放时间"
              label-width="140px"
            >
              <el-select v-model="ruleForm.rewardRules.inviterSuperior.rewardTime" style="width: 100%">
                <el-option label="计划结束" value="plan_end" />
              </el-select>
            </el-form-item>
            <el-form-item 
              v-if="ruleForm.rewardRules.inviterSuperior.rewardType === 'fixed'"
              label="固定奖励值"
              label-width="140px"
            >
              <div style="display: flex; align-items: center; gap: 8px; width: 100%">
                <el-input-number 
                  v-model="ruleForm.rewardRules.inviterSuperior.fixedReward" 
                  :min="0"
                  style="flex: 1"
                />
                <span style="color: #606266; font-size: 14px;">常乐豆</span>
              </div>
            </el-form-item>
            <el-form-item 
              v-if="ruleForm.rewardRules.inviterSuperior.rewardType === 'fixed'"
              label="奖励上限"
              label-width="140px"
            >
              <div class="limit-inputs">
                <div class="limit-row">
                  <el-switch v-model="ruleForm.rewardRules.inviterSuperior.rewardLimit.enabled" />
                  <span class="limit-tip">开启后限制单个邀请人上级的累计奖励</span>
                </div>
                <div 
                  v-if="ruleForm.rewardRules.inviterSuperior.rewardLimit.enabled" 
                  class="limit-values"
                >
                  <div class="limit-row">
                    <span class="limit-label">总上限</span>
                    <el-input-number 
                      v-model="ruleForm.rewardRules.inviterSuperior.rewardLimit.totalCap" 
                      :min="0"
                      controls-position="right"
                      style="flex: 1"
                    />
                    <span class="limit-unit">常乐豆</span>
                  </div>
                  <div class="limit-row">
                    <span class="limit-label">每日上限</span>
                    <el-input-number 
                      v-model="ruleForm.rewardRules.inviterSuperior.rewardLimit.dailyCap" 
                      :min="0"
                      controls-position="right"
                      style="flex: 1"
                    />
                    <span class="limit-unit">常乐豆/天</span>
                  </div>
                </div>
              </div>
            </el-form-item>
            <el-form-item 
              v-if="ruleForm.rewardRules.inviterSuperior.rewardType === 'gradient'"
              label="梯度区间"
              label-width="140px"
            >
              <div class="gradient-ranges">
                <div 
                  v-for="(range, index) in ruleForm.rewardRules.inviterSuperior.gradientRanges" 
                  :key="index"
                  class="gradient-range-item"
                >
                  <el-input-number 
                    v-model="range.min" 
                    :min="0"
                    placeholder="最小值"
                    style="width: 120px"
                  />
                  <span style="margin: 0 8px">-</span>
                  <el-input-number 
                    v-model="range.max" 
                    :min="0"
                    placeholder="最大值"
                    style="width: 120px"
                  />
                  <span style="margin: 0 8px">奖励：</span>
                  <el-input-number 
                    v-model="range.reward" 
                    :min="0"
                    placeholder="奖励值"
                    style="width: 120px"
                  />
                  <span style="margin-left: 4px; color: #606266; font-size: 14px;">常乐豆</span>
                  <el-button 
                    type="danger" 
                    link 
                    @click="removeGradientRange('inviterSuperior', index)"
                    style="margin-left: 8px"
                  >
                    删除
                  </el-button>
                </div>
                <el-button 
                  type="primary" 
                  link 
                  @click="addGradientRange('inviterSuperior')"
                  style="margin-top: 8px"
                >
                  + 添加梯度区间
                </el-button>
              </div>
            </el-form-item>
          </div>
        </div>
      </el-form>
      
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRule">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="detailDialogTitle"
      width="700px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="活动名称" :span="2">{{ selectedRule?.ruleName }}</el-descriptions-item>
        <el-descriptions-item label="有效期范围" :span="2">
          {{ selectedRule ? formatDateRange(selectedRule.validityStart, selectedRule.validityEnd) : '' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="selectedRule?.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ selectedRule?.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="分享对象类型" :span="2">
          {{ formatShareObjectType(selectedRule?.shareObject?.type) }}
          <span v-if="selectedRule?.shareObject?.type === 'user'">
            （{{ selectedRule?.shareObject?.inviteCodeType === 'self' ? '本人邀请码' : '指定邀请码列表' }}）
          </span>
        </el-descriptions-item>
        <el-descriptions-item 
          v-if="selectedRule?.shareObject?.type === 'course' || selectedRule?.shareObject?.type === 'course_lecturer'"
          label="对象ID列表" 
          :span="2"
        >
          {{ selectedRule?.shareObject?.idList || selectedRule?.shareObject?.id || '-' }}
        </el-descriptions-item>
        <el-descriptions-item 
          v-if="selectedRule?.shareObject?.type === 'user' && selectedRule?.shareObject?.inviteCodeType === 'list'"
          label="邀请码列表" 
          :span="2"
        >
          {{ selectedRule?.shareObject?.inviteCodeList }}
        </el-descriptions-item>
        <el-descriptions-item label="奖励规则" :span="2">
          <div class="reward-rules-detail">
            <div v-if="selectedRule?.rewardRules.inviter" class="reward-item">
              <strong>邀请人：</strong>
              <div>{{ formatInviterReward(selectedRule.rewardRules.inviter) }}</div>
            </div>
            <div v-if="selectedRule?.rewardRules.invitee" class="reward-item">
              <strong>被邀请人：</strong>
              <div>{{ formatInviteeReward(selectedRule.rewardRules.invitee) }}</div>
            </div>
            <div v-if="selectedRule?.rewardRules.inviterSuperior" class="reward-item">
              <strong>邀请人上级：</strong>
              <div>{{ formatInviterSuperiorReward(selectedRule.rewardRules.inviterSuperior) }}</div>
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const searchForm = ref({
  keyword: '',
  status: ''
})

// 认证用户身份类型数据（从身份管理-认证用户配置中获取）
const certifiedIdentities = ref([
  {
    id: 'cert-1',
    name: '推拿师',
    code: 'MASSAGE_THERAPIST',
    description: '具备推拿技能的专业人员'
  },
  {
    id: 'cert-2',
    name: '理疗师',
    code: 'PHYSIOTHERAPIST',
    description: '具备理疗技能的专业人员'
  },
  {
    id: 'cert-3',
    name: '康复师',
    code: 'REHABILITATION_THERAPIST',
    description: '具备康复技能的专业人员'
  },
  {
    id: 'cert-4',
    name: '经络讲师',
    code: 'MERIDIAN_LECTURER',
    description: '具备经络知识教学能力的专业人员'
  }
])

// 模拟数据
const rules = ref([
  {
    id: '1',
    ruleName: '新用户注册奖励规则',
    validityStart: new Date('2024-01-01 00:00:00'),
    validityEnd: new Date('2024-12-31 23:59:59'),
    status: 'enabled',
    shareObject: {
      type: 'user',
      id: 'all'
    },
    rewardRules: {
      inviter: {
        identityLimit: ['MASSAGE_THERAPIST'],
        rewardType: 'fixed',
        fixedReward: 10,
        rewardLimit: {
          enabled: true,
          totalCap: 200,
          dailyCap: 50
        }
      },
      invitee: {
        identityLimit: ['MASSAGE_THERAPIST'],
        fixedReward: 5
      },
      inviterSuperior: null
    }
  },
  {
    id: '2',
    ruleName: '品牌推广奖励规则',
    validityStart: new Date('2024-01-01 00:00:00'),
    validityEnd: new Date('2024-06-30 23:59:59'),
    status: 'enabled',
    shareObject: {
      type: 'brand',
      id: 'brand-001'
    },
    rewardRules: {
      inviter: {
        identityLimit: ['PHYSIOTHERAPIST'],
        rewardType: 'gradient',
        rewardTime: 'plan_end',
        gradientRanges: [
          { min: 1, max: 10, reward: 5 },
          { min: 11, max: 50, reward: 8 },
          { min: 51, max: 100, reward: 10 }
        ],
        rewardLimit: {
          enabled: false,
          totalCap: null,
          dailyCap: null
        }
      },
      invitee: {
        identityLimit: ['PHYSIOTHERAPIST'],
        fixedReward: 3
      },
      inviterSuperior: {
        identityLimit: ['REHABILITATION_THERAPIST'],
        rewardType: 'fixed',
        fixedReward: 2,
        rewardLimit: {
          enabled: true,
          totalCap: 80,
          dailyCap: 20
        }
      }
    }
  }
])

// 对话框
const ruleDialogVisible = ref(false)
const ruleDialogTitle = ref('新增活动')
const detailDialogVisible = ref(false)
const detailDialogTitle = ref('活动详情')
const selectedRule = ref(null)

// 表单引用
const ruleFormRef = ref(null)

const createDefaultRewardLimit = () => ({
  enabled: false,
  totalCap: null,
  dailyCap: null
})

// 表单数据
const ruleForm = ref({
  id: '',
  ruleName: '',
  shareObject: {
    type: '',
    id: '',
    idList: '',
    inviteCodeType: 'self',
    inviteCodeList: ''
  },
  validityRange: null,
  enableInviterSuperior: false,
  rewardRules: {
    inviter: {
      identityLimit: [],
      rewardType: 'fixed',
      rewardTime: 'plan_end',
      fixedReward: 0,
      gradientRanges: [],
      rewardLimit: createDefaultRewardLimit()
    },
    invitee: {
      identityLimit: [],
      fixedReward: 0
    },
    inviterSuperior: {
      identityLimit: [],
      rewardType: 'fixed',
      rewardTime: 'plan_end',
      fixedReward: 0,
      gradientRanges: [],
      rewardLimit: createDefaultRewardLimit()
    }
  }
})

// 表单验证规则
const ruleFormRules = {
  ruleName: [
    { required: true, message: '请输入活动名称', trigger: 'blur' }
  ],
  'shareObject.type': [
    { required: true, message: '请选择分享对象类型', trigger: 'change' }
  ],
  validityRange: [
    { required: true, message: '请选择有效期范围', trigger: 'change' }
  ]
}

// 过滤后的规则列表
const filteredRules = computed(() => {
  let list = [...rules.value]
  
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    list = list.filter(item => item.ruleName.toLowerCase().includes(keyword))
  }
  
  if (searchForm.value.status) {
    list = list.filter(item => item.status === searchForm.value.status)
  }
  
  return list
})

// 格式化日期范围
const formatDateRange = (start, end) => {
  if (!start || !end) return '-'
  const startDate = new Date(start).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
  const endDate = new Date(end).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${startDate} ~ ${endDate}`
}

// 获取身份类型名称
const getIdentityName = (codeOrArray) => {
  if (!codeOrArray) return '-'
  if (codeOrArray === 'unlimited') return '不限'
  if (Array.isArray(codeOrArray)) {
    if (codeOrArray.length === 0) return '-'
    if (codeOrArray.includes('unlimited')) return '不限'
    return codeOrArray.map(code => {
      const identity = certifiedIdentities.value.find(item => item.code === code)
      return identity ? identity.name : code
    }).join('、')
  }
  const identity = certifiedIdentities.value.find(item => item.code === codeOrArray)
  return identity ? identity.name : codeOrArray
}

const normalizeRewardLimit = (limit) => ({
  enabled: !!limit?.enabled,
  totalCap: limit?.totalCap ?? null,
  dailyCap: limit?.dailyCap ?? null
})

const formatRewardLimit = (limit) => {
  if (!limit?.enabled) return '上限：未启用（风险开关关闭）'
  const total = limit.totalCap ?? '未设置'
  const daily = limit.dailyCap ?? '未设置'
  const totalText = total === '未设置' ? total : `${total} 常乐豆`
  const dailyText = daily === '未设置' ? daily : `${daily} 常乐豆/天`
  return `上限：总${totalText}，每日${dailyText}`
}

const cloneGradientRanges = (ranges) => ranges ? ranges.map(range => ({ ...range })) : []

// 格式化邀请人奖励
const formatInviterReward = (inviter) => {
  if (!inviter) return '-'
  const identityName = getIdentityName(inviter.identityLimit)
  if (inviter.rewardType === 'fixed') {
    const limitText = formatRewardLimit(inviter.rewardLimit)
    return `身份限定：${identityName}，固定奖励：${inviter.fixedReward} 常乐豆；${limitText}`
  } else if (inviter.rewardType === 'gradient') {
    const ranges = inviter.gradientRanges?.map(r => `${r.min}-${r.max}人: ${r.reward} 常乐豆`).join(', ') || ''
    const limitText = formatRewardLimit(inviter.rewardLimit)
    return `身份限定：${identityName}，梯度奖励：${ranges}；${limitText}`
  }
  return '-'
}

// 格式化被邀请人奖励
const formatInviteeReward = (invitee) => {
  if (!invitee) return '-'
  const identityName = getIdentityName(invitee.identityLimit)
  return `身份限定：${identityName}，固定奖励：${invitee.fixedReward} 常乐豆`
}

// 格式化邀请人上级奖励
const formatInviterSuperiorReward = (superior) => {
  if (!superior) return '-'
  const identityName = getIdentityName(superior.identityLimit)
  if (superior.rewardType === 'fixed') {
    const limitText = formatRewardLimit(superior.rewardLimit)
    return `身份限定：${identityName}，固定奖励：${superior.fixedReward} 常乐豆；${limitText}`
  } else if (superior.rewardType === 'gradient') {
    const ranges = superior.gradientRanges?.map(r => `${r.min}-${r.max}人: ${r.reward} 常乐豆`).join(', ') || ''
    const limitText = formatRewardLimit(superior.rewardLimit)
    return `身份限定：${identityName}，梯度奖励：${ranges}；${limitText}`
  }
  return '-'
}

// 添加梯度区间
const addGradientRange = (type) => {
  ruleForm.value.rewardRules[type].gradientRanges.push({
    min: 0,
    max: 0,
    reward: 0
  })
}

// 删除梯度区间
const removeGradientRange = (type, index) => {
  ruleForm.value.rewardRules[type].gradientRanges.splice(index, 1)
}

// 处理身份限定选择变化（处理"不限"选项的互斥逻辑）
const handleIdentityLimitChange = (type, value) => {
  if (!Array.isArray(value)) return
  
  const hasUnlimited = value.includes('unlimited')
  const identityCodes = certifiedIdentities.value.map(item => item.code)
  
  if (hasUnlimited) {
    // 如果选择了"不限"，只保留"不限"
    ruleForm.value.rewardRules[type].identityLimit = ['unlimited']
  } else {
    // 如果选择了其他选项，移除"不限"
    ruleForm.value.rewardRules[type].identityLimit = value.filter(v => v !== 'unlimited')
  }
}

// 格式化分享对象类型
const formatShareObjectType = (type) => {
  const typeMap = {
    'unlimited': '不限',
    'course': '课程',
    'course_lecturer': '课程讲师',
    'user': '用户'
  }
  return typeMap[type] || type || '-'
}

// 处理分享对象类型变化
const handleShareObjectTypeChange = (value) => {
  // 重置相关字段
  ruleForm.value.shareObject.id = ''
  ruleForm.value.shareObject.idList = ''
  ruleForm.value.shareObject.inviteCodeType = 'self'
  ruleForm.value.shareObject.inviteCodeList = ''
}

// 搜索
const handleSearch = () => {
  // 搜索逻辑已在 computed 中实现
}

// 重置
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    status: ''
  }
}

// 新增活动
const handleAddRule = () => {
  ruleDialogTitle.value = '新增活动'
  ruleForm.value = {
    id: '',
    ruleName: '',
    shareObject: {
      type: '',
      id: '',
      idList: '',
      inviteCodeType: 'self',
      inviteCodeList: ''
    },
    validityRange: null,
    enableInviterSuperior: false,
    rewardRules: {
      inviter: {
        identityLimit: [],
        rewardType: 'fixed',
        rewardTime: 'plan_end',
        fixedReward: 0,
        gradientRanges: [],
        rewardLimit: createDefaultRewardLimit()
      },
      invitee: {
        identityLimit: [],
        fixedReward: 0
      },
      inviterSuperior: {
        identityLimit: [],
        rewardType: 'fixed',
        rewardTime: 'plan_end',
        fixedReward: 0,
        gradientRanges: [],
        rewardLimit: createDefaultRewardLimit()
      }
    }
  }
  ruleDialogVisible.value = true
}

// 编辑活动
const handleEdit = (row) => {
  ruleDialogTitle.value = '编辑活动'
  // 将旧数据中的字符串转换为数组（兼容旧数据）
  const convertToArray = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    return [value]
  }
  
  ruleForm.value = {
    id: row.id,
    ruleName: row.ruleName,
    shareObject: {
      type: row.shareObject?.type || '',
      id: row.shareObject?.id || '',
      idList: row.shareObject?.idList || row.shareObject?.id || '',
      inviteCodeType: row.shareObject?.inviteCodeType || 'self',
      inviteCodeList: row.shareObject?.inviteCodeList || ''
    },
    validityRange: [row.validityStart, row.validityEnd],
    enableInviterSuperior: !!row.rewardRules.inviterSuperior,
    rewardRules: {
      inviter: {
        ...row.rewardRules.inviter,
        identityLimit: convertToArray(row.rewardRules.inviter?.identityLimit),
        gradientRanges: row.rewardRules.inviter?.gradientRanges ? [...row.rewardRules.inviter.gradientRanges] : [],
        rewardLimit: normalizeRewardLimit(row.rewardRules.inviter?.rewardLimit)
      },
      invitee: {
        ...row.rewardRules.invitee,
        identityLimit: convertToArray(row.rewardRules.invitee?.identityLimit)
      },
      inviterSuperior: row.rewardRules.inviterSuperior ? {
        ...row.rewardRules.inviterSuperior,
        identityLimit: convertToArray(row.rewardRules.inviterSuperior?.identityLimit),
        gradientRanges: row.rewardRules.inviterSuperior.gradientRanges ? [...row.rewardRules.inviterSuperior.gradientRanges] : [],
        rewardLimit: normalizeRewardLimit(row.rewardRules.inviterSuperior?.rewardLimit)
      } : {
        identityLimit: [],
        rewardType: 'fixed',
        rewardTime: 'plan_end',
        fixedReward: 0,
        gradientRanges: [],
        rewardLimit: createDefaultRewardLimit()
      }
    }
  }
  ruleDialogVisible.value = true
}

// 查看详情
const handleViewDetail = (row) => {
  selectedRule.value = row
  detailDialogTitle.value = '活动详情'
  detailDialogVisible.value = true
}

// 删除活动
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该活动吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = rules.value.findIndex(r => r.id === row.id)
    if (index > -1) {
      rules.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 提交活动
const handleSubmitRule = async () => {
  if (!ruleFormRef.value) return
  
  try {
    await ruleFormRef.value.validate()
    
    const ruleData = {
      id: ruleForm.value.id || `rule-${Date.now()}`,
      ruleName: ruleForm.value.ruleName,
      validityStart: ruleForm.value.validityRange[0],
      validityEnd: ruleForm.value.validityRange[1],
      status: 'enabled',
      shareObject: { ...ruleForm.value.shareObject },
      rewardRules: {
        inviter: { 
          ...ruleForm.value.rewardRules.inviter,
          gradientRanges: cloneGradientRanges(ruleForm.value.rewardRules.inviter.gradientRanges),
          rewardLimit: normalizeRewardLimit(ruleForm.value.rewardRules.inviter.rewardLimit)
        },
        invitee: { ...ruleForm.value.rewardRules.invitee },
        inviterSuperior: ruleForm.value.enableInviterSuperior 
          ? { 
              ...ruleForm.value.rewardRules.inviterSuperior,
              gradientRanges: cloneGradientRanges(ruleForm.value.rewardRules.inviterSuperior.gradientRanges),
              rewardLimit: normalizeRewardLimit(ruleForm.value.rewardRules.inviterSuperior.rewardLimit)
            }
          : null
      }
    }
    
    if (ruleForm.value.id) {
      // 编辑
      const index = rules.value.findIndex(r => r.id === ruleForm.value.id)
      if (index > -1) {
        rules.value[index] = ruleData
        ElMessage.success('编辑成功')
      }
    } else {
      // 新增
      rules.value.push(ruleData)
      ElMessage.success('新增成功')
    }
    
    ruleDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 初始化
onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped>
.share-rule-management {
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

.action-bar {
  margin-bottom: 20px;
}

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.reward-rules-preview {
  font-size: 13px;
}

.reward-item {
  margin-bottom: 4px;
}

.reward-label {
  font-weight: 500;
  color: hsl(var(--foreground));
}

.reward-section {
  background: hsl(var(--muted));
  padding: 16px;
  border-radius: var(--radius-md);
}

.reward-config-section {
  margin-bottom: 24px;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
  overflow: hidden;
}

.reward-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: hsl(var(--muted));
  border-bottom: 1px solid hsl(var(--border));
}

.reward-section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.reward-section-content {
  padding: 16px;
  background: hsl(var(--background));
}

.gradient-ranges {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gradient-range-item {
  display: flex;
  align-items: center;
}

.limit-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.limit-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.limit-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.limit-label {
  width: 70px;
  color: #606266;
}

.limit-unit {
  color: #909399;
  font-size: 13px;
}

.limit-tip {
  color: #909399;
  font-size: 13px;
}

.reward-rules-detail {
  font-size: 14px;
}

.reward-rules-detail .reward-item {
  margin-bottom: 12px;
}

.reward-rules-detail .reward-item strong {
  display: block;
  margin-bottom: 4px;
  color: hsl(var(--foreground));
}

/* 限制有效期组件宽度 */
:deep(.validity-range-picker) {
  width: 400px !important;
  max-width: 400px !important;
}

:deep(.validity-range-picker.el-input) {
  width: 400px !important;
  max-width: 400px !important;
}

:deep(.validity-range-picker .el-input__wrapper) {
  width: 100% !important;
  max-width: 100% !important;
}
</style>

