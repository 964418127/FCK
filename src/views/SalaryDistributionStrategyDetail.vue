<template>
  <div class="strategy-detail-page">
    <!-- 顶部导航 -->
    <div class="detail-header">
      <div class="header-left">
        <el-button link @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <h2>{{ isEdit ? '编辑发放策略' : '发放策略详情' }}</h2>
      </div>
      <div class="header-right" v-if="!isEdit">
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </div>

    <div class="content-section" v-if="strategyData">
      <!-- 基础信息 -->
      <div class="card">
        <h3>基础信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">策略编号</span>
            <span class="info-value">{{ strategyData.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">策略名称</span>
            <span class="info-value" v-if="!isEdit">{{ strategyData.name }}</span>
            <el-input v-else v-model="strategyData.name" style="width: 200px;" />
          </div>
          <div class="info-item">
            <span class="info-label">合作模式</span>
            <span class="info-value">
              <el-tag :type="strategyData.coopMode === '劳动合同-全职' ? 'success' : 'warning'" size="small">
                {{ strategyData.coopMode }}
              </el-tag>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">业务</span>
            <span class="info-value" v-if="!isEdit">{{ strategyData.business }}</span>
            <el-select v-else v-model="strategyData.business" style="width: 120px;">
              <el-option label="业务" value="业务" />
              <el-option label="职能" value="职能" />
            </el-select>
          </div>
          <div class="info-item">
            <span class="info-label">岗位</span>
            <span class="info-value" v-if="!isEdit">{{ strategyData.position }}</span>
            <el-select v-else v-model="strategyData.position" style="width: 120px;">
              <el-option label="推拿师" value="推拿师" />
              <el-option label="客户经理" value="客户经理" />
              <el-option label="理疗师" value="理疗师" />
            </el-select>
          </div>
          <div class="info-item">
            <span class="info-label">薪酬模板</span>
            <span class="info-value" v-if="!isEdit">{{ strategyData.templateName }}</span>
            <el-select v-else v-model="strategyData.templateId" style="width: 200px;">
              <el-option label="全职推拿师模板" value="template2" />
              <el-option label="非全日制推拿师模板" value="template4" />
              <el-option label="兼职推拿师模板" value="template1" />
            </el-select>
          </div>
          <div class="info-item">
            <span class="info-label">策略有效期</span>
            <span class="info-value" v-if="!isEdit">{{ strategyData.validityPeriod }}</span>
            <div v-else class="validity-edit">
              <el-select v-model="strategyData.validityType" style="width: 120px;">
                <el-option label="长期有效" value="longterm" />
                <el-option label="固定周期" value="fixed" />
              </el-select>
              <el-date-picker
                v-if="strategyData.validityType === 'fixed'"
                v-model="strategyData.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 260px; margin-left: 8px;"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 匹配人员 -->
      <div class="card">
        <div class="card-header">
          <h3>匹配人员</h3>
          <span class="person-count">共 {{ matchedPersonCount }} 人</span>
        </div>
        <div v-if="!isEdit">
          <div class="condition-tags" v-if="strategyData.conditions && strategyData.conditions.length">
            <el-tag v-for="(cond, index) in strategyData.conditions" :key="index" size="small" style="margin-right: 8px; margin-bottom: 4px;">
              {{ cond.field }} {{ cond.operator }} {{ cond.valueType === 'reference' ? '引用:' : '' }}{{ cond.value }}
            </el-tag>
          </div>
          <div v-else class="empty-tip">无筛选条件，匹配全部人员</div>
        </div>
        <div v-else class="condition-edit">
          <div class="condition-header">
            <div class="condition-header-left">
              <span class="condition-relation">条件之间关系为：<strong>且</strong></span>
              <span class="condition-suggestion">建议按排除逻辑设置条件</span>
            </div>
            <div class="condition-header-right">
              <el-button type="primary" size="small" link @click="addCondition">+ 添加条件</el-button>
            </div>
          </div>

          <div class="condition-table">
            <div class="condition-table-header">
              <span class="col-index">#</span>
              <span class="col-field text-left">字段</span>
              <span class="col-operator text-left">判断符</span>
              <span class="col-value-type text-left">值类型</span>
              <span class="col-value text-left">筛选值</span>
              <span class="col-actions text-left">操作</span>
            </div>
            <div v-for="(cond, index) in strategyData.conditions" :key="index" class="condition-row">
              <span class="col-index">{{ index + 1 }}</span>
              <el-select v-model="cond.field" size="small" placeholder="选择字段">
                <el-option label="年龄" value="age" />
                <el-option label="入职时间" value="hireDate" />
                <el-option label="用工类型" value="employmentType" />
                <el-option label="岗位" value="position" />
                <el-option label="部门" value="department" />
                <el-option label="入职时长" value="tenure" />
              </el-select>
              <el-select v-model="cond.operator" size="small" placeholder="判断符">
                <el-option label="等于" value="=" />
                <el-option label="不等于" value="!=" />
                <el-option label="大于" value=">" />
                <el-option label="小于" value="<" />
                <el-option label="大于等于" value=">=" />
                <el-option label="小于等于" value="<=" />
                <el-option label="包含" value="contains" />
              </el-select>
              <el-select v-model="cond.valueType" size="small" placeholder="值类型">
                <el-option label="输入" value="input" />
                <el-option label="引用" value="reference" />
              </el-select>
              <el-input v-if="cond.valueType === 'input'" v-model="cond.value" size="small" placeholder="请输入" />
              <el-select v-else v-model="cond.value" size="small" placeholder="选择引用">
                <el-option label="全职" value="fulltime" />
                <el-option label="兼职" value="parttime" />
                <el-option label="试用期" value="probation" />
                <el-option label="正式" value="regular" />
              </el-select>
              <div class="col-actions">
                <el-button type="default" size="small" link @click="toggleConditionExpand(index)">
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
                <el-button type="danger" size="small" link @click="removeCondition(index)">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <div class="condition-footer">
            <span class="match-count">匹配人数：{{ matchedPersonCount }}</span>
            <el-button type="primary" size="small" link @click="refreshMatchCount">刷新</el-button>
          </div>
        </div>
      </div>

      <!-- 工资单映射 / 常乐豆映射 Tab -->
      <div class="card">
        <el-tabs v-model="activeTab">
          <!-- 工资单映射 -->
          <el-tab-pane label="工资单映射" name="payroll">
            <div class="mapping-section">
              <!-- 工资单配置 - 左右结构 -->
              <div class="payroll-mapping-layout">
                <!-- 左侧：工资单列表 -->
                <div class="payroll-list-panel">
                  <div class="panel-header">
                    <span class="panel-title">工资单列表</span>
                  </div>
                  <div class="payroll-slip-list">
                    <div
                      v-for="(slip, index) in payrollSlips"
                      :key="index"
                      :class="['payroll-slip-item', { active: currentPayrollSlipIndex === index }]"
                      @click="selectPayrollSlip(index)"
                    >
                      <span class="slip-name">{{ slip.name }}</span>
                    </div>
                  </div>
                  <div class="panel-footer">
                    <el-button v-if="isEdit" type="primary" size="small" link @click="addPayrollSlip">+ 新增工资单</el-button>
                  </div>
                </div>

                <!-- 右侧：工资单详情 -->
                <div class="payroll-detail-panel" v-if="currentPayrollSlip">
                  <!-- 工资单标题栏 -->
                  <div class="detail-header-bar">
                    <template v-if="editingSlipIndex === 'header' && isEdit">
                      <el-input v-model="currentPayrollSlip.name" size="default" style="width: 160px;" @keyup.enter="editingSlipIndex = -1" @blur="editingSlipIndex = -1" />
                    </template>
                    <template v-else>
                      <span class="detail-title" @dblclick="editingSlipIndex = 'header'">{{ currentPayrollSlip.name }}</span>
                    </template>
                    <el-button v-if="isEdit" type="danger" size="small" link @click="removePayrollSlip(currentPayrollSlipIndex)">解散工资条</el-button>
                  </div>
                  <!-- 工资单基础配置 -->
                  <div class="detail-config-block">
                    <h5>工资单基础配置</h5>
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-label">计算周期频次</span>
                        <span class="info-value" v-if="!isEdit">{{ currentPayrollSlip.frequency }}</span>
                        <el-select v-else v-model="currentPayrollSlip.frequency" style="width: 80px;">
                          <el-option label="月" value="月" />
                          <el-option label="周" value="周" />
                        </el-select>
                      </div>
                      <div class="info-item">
                        <span class="info-label">计算日期节点</span>
                        <span class="info-value" v-if="!isEdit">{{ currentPayrollSlip.calculateDate }}</span>
                        <el-input v-else v-model="currentPayrollSlip.calculateDate" style="width: 90px;" />
                      </div>
                      <div class="info-item">
                        <span class="info-label">数据日期起</span>
                        <span class="info-value" v-if="!isEdit">{{ currentPayrollSlip.dataDateStart }}</span>
                        <el-input v-else v-model="currentPayrollSlip.dataDateStart" style="width: 90px;" />
                      </div>
                      <div class="info-item">
                        <span class="info-label">数据日期止</span>
                        <span class="info-value" v-if="!isEdit">{{ currentPayrollSlip.dataDateEnd }}</span>
                        <el-input v-else v-model="currentPayrollSlip.dataDateEnd" style="width: 90px;" />
                      </div>
                    </div>
                  </div>

                  <div class="detail-section">
                    <div class="section-header">
                      <h5>薪酬项分组</h5>
                      <el-button v-if="isEdit" type="primary" size="small" link @click="addIncomeGroup('payroll')">+ 新增分组</el-button>
                    </div>
                    <div class="group-list">
                      <div v-for="(group, gIndex) in currentPayrollSlip.incomeGroups" :key="gIndex" class="group-card">
                        <div class="group-header" @click="toggleGroup('payroll', gIndex)">
                          <div class="group-title">
                            <el-icon class="expand-icon" :class="{ expanded: expandedGroups.payrollIncome === gIndex }"><ArrowRight /></el-icon>
                            <template v-if="editingGroupIndex.payrollIncome === gIndex && isEdit">
                              <el-input v-model="group.name" size="small" style="width: 120px;" @keyup.enter="editingGroupIndex.payrollIncome = -1" @blur="editingGroupIndex.payrollIncome = -1" />
                            </template>
                            <template v-else>
                              <span class="group-name" @dblclick.stop="editingGroupIndex.payrollIncome = gIndex">{{ group.name }}</span>
                            </template>
                            <el-tag size="small" style="margin-left: 8px;">{{ group.items.length }}项</el-tag>
                          </div>
                          <el-button v-if="isEdit" type="danger" size="small" link @click.stop="removeIncomeGroup('payroll', gIndex)">解散</el-button>
                        </div>
                        <div class="group-content" v-show="expandedGroups.payrollIncome === gIndex">
                          <el-table :data="group.items" size="small" border style="width: 100%;">
                            <el-table-column prop="id" label="编号" width="50" align="center" />
                            <el-table-column prop="displayName" label="映射展示名称" min-width="120">
                              <template #default="{ row }">
                                <el-input v-if="isEdit" v-model="row.displayName" size="small" />
                                <span v-else>{{ row.displayName }}</span>
                              </template>
                            </el-table-column>
                            <el-table-column prop="category" label="薪酬项类型" min-width="120" />
                            <el-table-column prop="itemName" label="薪酬项名称" min-width="120" />
                            <el-table-column label="支付形式" width="80" align="center">
                              <template #default>
                                <el-tag size="small">现金</el-tag>
                              </template>
                            </el-table-column>
                            <el-table-column label="来源" width="70" align="center">
                              <template #default>
                                <span class="source-text">自动</span>
                              </template>
                            </el-table-column>
                            <el-table-column v-if="isEdit" label="操作" width="60" align="center">
                              <template #default>
                                <el-button type="danger" size="small" link>移除</el-button>
                              </template>
                            </el-table-column>
                          </el-table>
                          <div v-if="isEdit" class="add-item-row">
                            <el-button type="primary" size="small" link>+ 关联薪酬项</el-button>
                          </div>
                        </div>
                      </div>
                      <div v-if="!currentPayrollSlip.incomeGroups.length" class="empty-group">
                        暂无分组，点击上方按钮添加
                      </div>
                    </div>
                  </div>

                  <div class="detail-section">
                    <div class="section-header">
                      <h5>扣缴项分组</h5>
                      <el-button v-if="isEdit" type="primary" size="small" link @click="addDeductGroup('payroll')">+ 新增分组</el-button>
                    </div>
                    <div class="group-list">
                      <div v-for="(group, gIndex) in currentPayrollSlip.deductGroups" :key="gIndex" class="group-card">
                        <div class="group-header" @click="toggleGroup('payrollDeduct', gIndex)">
                          <div class="group-title">
                            <el-icon class="expand-icon" :class="{ expanded: expandedGroups.payrollDeduct === gIndex }"><ArrowRight /></el-icon>
                            <template v-if="editingGroupIndex.payrollDeduct === gIndex && isEdit">
                              <el-input v-model="group.name" size="small" style="width: 120px;" @keyup.enter="editingGroupIndex.payrollDeduct = -1" @blur="editingGroupIndex.payrollDeduct = -1" />
                            </template>
                            <template v-else>
                              <span class="group-name" @dblclick.stop="editingGroupIndex.payrollDeduct = gIndex">{{ group.name }}</span>
                            </template>
                            <el-tag size="small" style="margin-left: 8px;">{{ group.items.length }}项</el-tag>
                          </div>
                          <el-button v-if="isEdit" type="danger" size="small" link @click.stop="removeDeductGroup('payroll', gIndex)">解散</el-button>
                        </div>
                        <div class="group-content" v-show="expandedGroups.payrollDeduct === gIndex">
                          <el-table :data="group.items" size="small" border style="width: 100%;">
                            <el-table-column prop="id" label="编号" width="50" align="center" />
                            <el-table-column prop="displayName" label="映射展示名称" min-width="120">
                              <template #default="{ row }">
                                <el-input v-if="isEdit" v-model="row.displayName" size="small" />
                                <span v-else>{{ row.displayName }}</span>
                              </template>
                            </el-table-column>
                            <el-table-column prop="category" label="扣缴项类型" min-width="120" />
                            <el-table-column prop="itemName" label="扣缴项名称" min-width="120" />
                            <el-table-column label="支付形式" width="80" align="center">
                              <template #default>
                                <el-tag size="small">现金</el-tag>
                              </template>
                            </el-table-column>
                            <el-table-column label="来源" width="70" align="center">
                              <template #default>
                                <span class="source-text">自动</span>
                              </template>
                            </el-table-column>
                            <el-table-column v-if="isEdit" label="操作" width="60" align="center">
                              <template #default>
                                <el-button type="danger" size="small" link>移除</el-button>
                              </template>
                            </el-table-column>
                          </el-table>
                          <div v-if="isEdit" class="add-item-row">
                            <el-button type="primary" size="small" link>+ 关联扣缴项</el-button>
                          </div>
                        </div>
                      </div>
                      <div v-if="!currentPayrollSlip.deductGroups.length" class="empty-group">
                        暂无分组，点击上方按钮添加
                      </div>
                    </div>
                  </div>

                  <!-- 发放策略配置 -->
                  <div class="detail-config-block">
                    <h5>发放策略配置</h5>
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-label">工资单通知</span>
                        <span class="info-value" v-if="!isEdit">{{ currentPayrollSlip.notifyDate }}</span>
                        <el-input v-else v-model="currentPayrollSlip.notifyDate" style="width: 90px;" />
                      </div>
                      <div class="info-item">
                        <span class="info-label">工资发放时间</span>
                        <span class="info-value" v-if="!isEdit">{{ currentPayrollSlip.paymentDate }}</span>
                        <el-input v-else v-model="currentPayrollSlip.paymentDate" style="width: 90px;" />
                      </div>
                      <div class="info-item">
                        <span class="info-label">延迟确认发放</span>
                        <span class="info-value" v-if="!isEdit">{{ currentPayrollSlip.delayConfirm }}</span>
                        <el-select v-else v-model="currentPayrollSlip.delayConfirm" style="width: 90px;">
                          <el-option label="次日发放" value="次日发放" />
                          <el-option label="当月发放" value="当月发放" />
                        </el-select>
                      </div>
                      <div class="info-item">
                        <span class="info-label">发放主体</span>
                        <span class="info-value" v-if="!isEdit">{{ currentPayrollSlip.paymentEntity }}</span>
                        <el-select v-else v-model="currentPayrollSlip.paymentEntity" style="width: 130px;">
                          <el-option label="合同主体" value="合同主体" />
                          <el-option label="业绩归属主体" value="业绩归属主体" />
                        </el-select>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="payroll-detail-panel empty" v-else>
                  <div class="empty-tip">请选择工资单查看详情</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 常乐豆映射 -->
          <el-tab-pane :label="hasBeanSlips ? '常乐豆映射' : '常乐豆映射（未配置）'" name="bean">
            <div v-if="!hasBeanSlips" class="empty-tip" style="padding: 40px; text-align: center;">
              <el-icon style="font-size: 32px; color: hsl(var(--muted-foreground));"><InfoFilled /></el-icon>
              <p style="margin-top: 8px;">该合作模式下未配置常乐豆</p>
            </div>
            <div v-else class="mapping-section">
              <!-- 常乐豆配置 - 左右结构 -->
              <div class="payroll-mapping-layout">
                <!-- 左侧：常乐豆单列表 -->
                <div class="payroll-list-panel">
                  <div class="panel-header">
                    <span class="panel-title">常乐豆单列表</span>
                  </div>
                  <div class="payroll-slip-list">
                    <div
                      v-for="(slip, index) in beanSlips"
                      :key="index"
                      :class="['payroll-slip-item', { active: currentBeanSlipIndex === index }]"
                      @click="selectBeanSlip(index)"
                    >
                      <span class="slip-name">{{ slip.name }}</span>
                    </div>
                  </div>
                  <div class="panel-footer">
                    <el-button v-if="isEdit" type="primary" size="small" link @click="addBeanSlip">+ 新增常乐豆单</el-button>
                  </div>
                </div>

                <!-- 右侧：常乐豆单详情 -->
                <div class="payroll-detail-panel" v-if="currentBeanSlip">
                  <!-- 常乐豆单标题栏 -->
                  <div class="detail-header-bar">
                    <template v-if="editingBeanSlipIndex === 'header' && isEdit">
                      <el-input v-model="currentBeanSlip.name" size="default" style="width: 160px;" @keyup.enter="editingBeanSlipIndex = -1" @blur="editingBeanSlipIndex = -1" />
                    </template>
                    <template v-else>
                      <span class="detail-title" @dblclick="editingBeanSlipIndex = 'header'">{{ currentBeanSlip.name }}</span>
                    </template>
                    <el-button v-if="isEdit" type="danger" size="small" link @click="removeBeanSlip(currentBeanSlipIndex)">解散工资条</el-button>
                  </div>

                  <!-- 常乐豆基础配置 -->
                  <div class="detail-config-block">
                    <h5>常乐豆基础配置</h5>
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-label">计算周期频次</span>
                        <span class="info-value" v-if="!isEdit">{{ currentBeanSlip.frequency }}</span>
                        <el-select v-else v-model="currentBeanSlip.frequency" style="width: 80px;">
                          <el-option label="月" value="月" />
                          <el-option label="周" value="周" />
                        </el-select>
                      </div>
                      <div class="info-item">
                        <span class="info-label">计算日期节点</span>
                        <span class="info-value" v-if="!isEdit">{{ currentBeanSlip.calculateDate }}</span>
                        <el-input v-else v-model="currentBeanSlip.calculateDate" style="width: 90px;" />
                      </div>
                      <div class="info-item">
                        <span class="info-label">数据日期起</span>
                        <span class="info-value" v-if="!isEdit">{{ currentBeanSlip.dataDateStart }}</span>
                        <el-input v-else v-model="currentBeanSlip.dataDateStart" style="width: 90px;" />
                      </div>
                      <div class="info-item">
                        <span class="info-label">数据日期止</span>
                        <span class="info-value" v-if="!isEdit">{{ currentBeanSlip.dataDateEnd }}</span>
                        <el-input v-else v-model="currentBeanSlip.dataDateEnd" style="width: 90px;" />
                      </div>
                    </div>
                  </div>

                  <div class="detail-section">
                    <div class="section-header">
                      <h5>获豆分组</h5>
                      <el-button v-if="isEdit" type="primary" size="small" link @click="addIncomeGroup('bean')">+ 新增分组</el-button>
                    </div>
                    <div class="group-list">
                      <div v-for="(group, gIndex) in currentBeanSlip.incomeGroups" :key="gIndex" class="group-card">
                        <div class="group-header" @click="toggleGroup('beanIncome', gIndex)">
                          <div class="group-title">
                            <el-icon class="expand-icon" :class="{ expanded: expandedGroups.beanIncome === gIndex }"><ArrowRight /></el-icon>
                            <template v-if="editingGroupIndex.beanIncome === gIndex && isEdit">
                              <el-input v-model="group.name" size="small" style="width: 120px;" @keyup.enter="editingGroupIndex.beanIncome = -1" @blur="editingGroupIndex.beanIncome = -1" />
                            </template>
                            <template v-else>
                              <span class="group-name" @dblclick.stop="editingGroupIndex.beanIncome = gIndex">{{ group.name }}</span>
                            </template>
                            <el-tag size="small" style="margin-left: 8px;">{{ group.items.length }}项</el-tag>
                          </div>
                          <el-button v-if="isEdit" type="danger" size="small" link @click.stop="removeIncomeGroup('bean', gIndex)">解散</el-button>
                        </div>
                        <div class="group-content" v-show="expandedGroups.beanIncome === gIndex">
                          <el-table :data="group.items" size="small" border style="width: 100%;">
                            <el-table-column prop="id" label="编号" width="50" align="center" />
                            <el-table-column prop="displayName" label="映射展示名称" min-width="120">
                              <template #default="{ row }">
                                <el-input v-if="isEdit" v-model="row.displayName" size="small" />
                                <span v-else>{{ row.displayName }}</span>
                              </template>
                            </el-table-column>
                            <el-table-column prop="category" label="获豆项类型" min-width="120" />
                            <el-table-column prop="itemName" label="获豆项名称" min-width="120" />
                            <el-table-column label="支付形式" width="80" align="center">
                              <template #default>
                                <el-tag size="small">常乐豆</el-tag>
                              </template>
                            </el-table-column>
                            <el-table-column label="来源" width="70" align="center">
                              <template #default>
                                <span class="source-text">自动</span>
                              </template>
                            </el-table-column>
                            <el-table-column v-if="isEdit" label="操作" width="60" align="center">
                              <template #default>
                                <el-button type="danger" size="small" link>移除</el-button>
                              </template>
                            </el-table-column>
                          </el-table>
                          <div v-if="isEdit" class="add-item-row">
                            <el-button type="primary" size="small" link>+ 关联获豆项</el-button>
                          </div>
                        </div>
                      </div>
                      <div v-if="!currentBeanSlip.incomeGroups.length" class="empty-group">
                        暂无分组，点击上方按钮添加
                      </div>
                    </div>
                  </div>

                  <div class="detail-section">
                    <div class="section-header">
                      <h5>扣豆分组</h5>
                      <el-button v-if="isEdit" type="primary" size="small" link @click="addDeductGroup('bean')">+ 新增分组</el-button>
                    </div>
                    <div class="group-list">
                      <div v-for="(group, gIndex) in currentBeanSlip.deductGroups" :key="gIndex" class="group-card">
                        <div class="group-header" @click="toggleGroup('beanDeduct', gIndex)">
                          <div class="group-title">
                            <el-icon class="expand-icon" :class="{ expanded: expandedGroups.beanDeduct === gIndex }"><ArrowRight /></el-icon>
                            <template v-if="editingGroupIndex.beanDeduct === gIndex && isEdit">
                              <el-input v-model="group.name" size="small" style="width: 120px;" @keyup.enter="editingGroupIndex.beanDeduct = -1" @blur="editingGroupIndex.beanDeduct = -1" />
                            </template>
                            <template v-else>
                              <span class="group-name" @dblclick.stop="editingGroupIndex.beanDeduct = gIndex">{{ group.name }}</span>
                            </template>
                            <el-tag size="small" style="margin-left: 8px;">{{ group.items.length }}项</el-tag>
                          </div>
                          <el-button v-if="isEdit" type="danger" size="small" link @click.stop="removeDeductGroup('bean', gIndex)">解散</el-button>
                        </div>
                        <div class="group-content" v-show="expandedGroups.beanDeduct === gIndex">
                          <el-table :data="group.items" size="small" border style="width: 100%;">
                            <el-table-column prop="id" label="编号" width="50" align="center" />
                            <el-table-column prop="displayName" label="映射展示名称" min-width="120">
                              <template #default="{ row }">
                                <el-input v-if="isEdit" v-model="row.displayName" size="small" />
                                <span v-else>{{ row.displayName }}</span>
                              </template>
                            </el-table-column>
                            <el-table-column prop="category" label="扣豆项类型" min-width="120" />
                            <el-table-column prop="itemName" label="扣豆项名称" min-width="120" />
                            <el-table-column label="支付形式" width="80" align="center">
                              <template #default>
                                <el-tag size="small">常乐豆</el-tag>
                              </template>
                            </el-table-column>
                            <el-table-column label="来源" width="70" align="center">
                              <template #default>
                                <span class="source-text">自动</span>
                              </template>
                            </el-table-column>
                            <el-table-column v-if="isEdit" label="操作" width="60" align="center">
                              <template #default>
                                <el-button type="danger" size="small" link>移除</el-button>
                              </template>
                            </el-table-column>
                          </el-table>
                          <div v-if="isEdit" class="add-item-row">
                            <el-button type="primary" size="small" link>+ 关联扣豆项</el-button>
                          </div>
                        </div>
                      </div>
                      <div v-if="!currentBeanSlip.deductGroups.length" class="empty-group">
                        暂无分组，点击上方按钮添加
                      </div>
                    </div>
                  </div>

                  <!-- 发放策略配置 -->
                  <div class="detail-config-block">
                    <h5>发放策略配置</h5>
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-label">结算通知</span>
                        <span class="info-value" v-if="!isEdit">{{ currentBeanSlip.notifyDate }}</span>
                        <el-input v-else v-model="currentBeanSlip.notifyDate" style="width: 90px;" />
                      </div>
                      <div class="info-item">
                        <span class="info-label">到账时间</span>
                        <span class="info-value" v-if="!isEdit">{{ currentBeanSlip.paymentDate }}</span>
                        <el-input v-else v-model="currentBeanSlip.paymentDate" style="width: 90px;" />
                      </div>
                      <div class="info-item">
                        <span class="info-label">发放主体</span>
                        <span class="info-value" v-if="!isEdit">{{ currentBeanSlip.paymentEntity }}</span>
                        <el-select v-else v-model="currentBeanSlip.paymentEntity" style="width: 130px;">
                          <el-option label="合同主体" value="合同主体" />
                          <el-option label="业绩归属主体" value="业绩归属主体" />
                        </el-select>
                      </div>
                      <div class="info-item">
                        <span class="info-label">结算账户</span>
                        <span class="info-value" v-if="!isEdit">{{ currentBeanSlip.settlementAccount }}</span>
                        <el-input v-else v-model="currentBeanSlip.settlementAccount" style="width: 100px;" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="payroll-detail-panel empty" v-else>
                  <div class="empty-tip">请选择常乐豆单查看详情</div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 编辑操作 -->
      <div v-if="isEdit" class="edit-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Close, InfoFilled } from '@element-plus/icons-vue'
import { distributionStrategies } from '../mock/data.js'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const activeTab = ref('payroll')
const editingSlipIndex = ref(-1)
const editingBeanSlipIndex = ref(-1)

// 分组展开/编辑状态
const expandedGroups = reactive({
  payrollIncome: 0,
  payrollDeduct: 0,
  beanIncome: 0,
  beanDeduct: 0
})

const editingGroupIndex = reactive({
  payrollIncome: -1,
  payrollDeduct: -1,
  beanIncome: -1,
  beanDeduct: -1
})

// 根据策略ID获取策略数据
const getStrategyById = (id) => {
  return distributionStrategies.find(s => s.id === id) || distributionStrategies[0]
}

const sourceStrategy = getStrategyById(route.params.id)

// 策略数据（深拷贝避免直接修改源数据）
const strategyData = ref(JSON.parse(JSON.stringify(sourceStrategy)))

// 工资单列表（独立拷贝，便于编辑时增删）
const currentPayrollSlipIndex = ref(0)
const payrollSlips = ref(JSON.parse(JSON.stringify(strategyData.value.payrollSlips || [])))

// 常乐豆单列表（独立拷贝，便于编辑时增删）
const currentBeanSlipIndex = ref(0)
const beanSlips = ref(JSON.parse(JSON.stringify(strategyData.value.beanSlips || [])))

const matchedPersonCount = ref(sourceStrategy.personCount || 0)

// 计算属性
const currentPayrollSlip = computed(() => payrollSlips.value[currentPayrollSlipIndex.value])
const currentBeanSlip = computed(() => beanSlips.value[currentBeanSlipIndex.value])
const hasBeanSlips = computed(() => beanSlips.value.length > 0)

// 返回列表
const goBack = () => {
  router.push({ name: 'salary-distribution-strategy' })
}

// 编辑
const handleEdit = () => {
  router.push({ name: 'salary-distribution-strategy-detail', params: { id: route.params.id }, query: { mode: 'edit' } })
}

// 取消
const handleCancel = () => {
  router.push({ name: 'salary-distribution-strategy-detail', params: { id: route.params.id } })
}

// 保存
const handleSave = () => {
  router.push({ name: 'salary-distribution-strategy-detail', params: { id: route.params.id } })
}

// 添加条件
const addCondition = () => {
  strategyData.value.conditions.push({ field: 'age', operator: '=', valueType: 'input', value: '' })
}

// 删除条件
const removeCondition = (index) => {
  strategyData.value.conditions.splice(index, 1)
}

// 展开/收起条件高级配置
const toggleConditionExpand = (index) => {
  // 预留扩展
}

// 刷新匹配人数
const refreshMatchCount = () => {
  // 模拟刷新
  matchedPersonCount.value = Math.floor(Math.random() * 100) + 10
}

// 工资单操作
const selectPayrollSlip = (index) => {
  currentPayrollSlipIndex.value = index
}

const addPayrollSlip = () => {
  payrollSlips.value.push({
    name: '新工资单',
    frequency: '月',
    calculateDate: '次月/10日',
    dataDateStart: '本月/1日',
    dataDateEnd: '本月/31日',
    notifyDate: '次月1日',
    paymentDate: '次月2日',
    delayConfirm: '次日发放',
    paymentEntity: '合同主体',
    incomeGroups: [],
    deductGroups: []
  })
  currentPayrollSlipIndex.value = payrollSlips.value.length - 1
  editingSlipIndex.value = 'header'
}

const removePayrollSlip = (index) => {
  payrollSlips.value.splice(index, 1)
  if (currentPayrollSlipIndex.value >= payrollSlips.value.length) {
    currentPayrollSlipIndex.value = Math.max(0, payrollSlips.value.length - 1)
  }
}

// 常乐豆单操作
const selectBeanSlip = (index) => {
  currentBeanSlipIndex.value = index
}

const addBeanSlip = () => {
  beanSlips.value.push({
    name: '新常乐豆单',
    frequency: '月',
    calculateDate: '次月/10日',
    dataDateStart: '本月/1日',
    dataDateEnd: '本月/31日',
    notifyDate: '次月30日',
    paymentDate: '次月31日',
    paymentEntity: '合同主体',
    settlementAccount: '余额账户',
    incomeGroups: [],
    deductGroups: []
  })
  currentBeanSlipIndex.value = beanSlips.value.length - 1
  editingBeanSlipIndex.value = 'header'
}

const removeBeanSlip = (index) => {
  beanSlips.value.splice(index, 1)
  if (currentBeanSlipIndex.value >= beanSlips.value.length) {
    currentBeanSlipIndex.value = Math.max(0, beanSlips.value.length - 1)
  }
}

// 分组操作
const toggleGroup = (type, index) => {
  expandedGroups[type] = expandedGroups[type] === index ? -1 : index
}

const addIncomeGroup = (type) => {
  const slip = type === 'payroll' ? currentPayrollSlip.value : currentBeanSlip.value
  const groupType = type === 'payroll' ? 'payrollIncome' : 'beanIncome'
  slip.incomeGroups.push({
    name: '新分组',
    items: []
  })
  const newIndex = slip.incomeGroups.length - 1
  expandedGroups[groupType] = newIndex
  editingGroupIndex[groupType] = newIndex
}

const addDeductGroup = (type) => {
  const slip = type === 'payroll' ? currentPayrollSlip.value : currentBeanSlip.value
  const groupType = type === 'payroll' ? 'payrollDeduct' : 'beanDeduct'
  slip.deductGroups.push({
    name: '新分组',
    items: []
  })
  const newIndex = slip.deductGroups.length - 1
  expandedGroups[groupType] = newIndex
  editingGroupIndex[groupType] = newIndex
}

const removeIncomeGroup = (type, index) => {
  const slip = type === 'payroll' ? currentPayrollSlip.value : currentBeanSlip.value
  slip.incomeGroups.splice(index, 1)
}

const removeDeductGroup = (type, index) => {
  const slip = type === 'payroll' ? currentPayrollSlip.value : currentBeanSlip.value
  slip.deductGroups.splice(index, 1)
}

onMounted(() => {
  if (route.query.mode === 'edit') {
    isEdit.value = true
  }
})
</script>

<style scoped>
.strategy-detail-page {
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

.person-count {
  font-size: 13px;
  color: hsl(var(--primary));
  font-weight: 600;
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

.validity-edit {
  display: flex;
  align-items: center;
}

.condition-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-tip {
  color: hsl(var(--muted-foreground));
  font-size: 14px;
}

.condition-edit {
  background: hsl(var(--muted) / 0.2);
  border-radius: 8px;
  padding: 12px;
}

.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid hsl(var(--border));
}

.condition-header-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.condition-header-right {
  display: flex;
}

.condition-relation {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.condition-suggestion {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  font-style: italic;
}

.condition-table {
  background: hsl(var(--muted) / 0.15);
  border-radius: 6px;
  overflow: hidden;
}

.condition-table-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: hsl(var(--muted) / 0.1);
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  border-bottom: 1px solid hsl(var(--border));
}

.condition-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid hsl(var(--border));
  gap: 8px;
}

.condition-row:last-child {
  border-bottom: none;
}

.col-index {
  width: 30px;
  text-align: center;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.col-field {
  width: 120px;
}

.col-operator {
  width: 100px;
}

.text-left {
  text-align: left;
}

.col-value-type {
  width: 80px;
}

.col-value {
  flex: 1;
}

.col-actions {
  width: 70px;
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.condition-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed hsl(var(--border));
  display: flex;
  align-items: center;
  gap: 12px;
}

.match-count {
  font-size: 13px;
  color: hsl(var(--foreground));
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-card {
  background: hsl(var(--muted) / 0.15);
  border-radius: 6px;
  overflow: hidden;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  background: hsl(var(--muted) / 0.1);
}

.group-header:hover {
  background: hsl(var(--muted) / 0.2);
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  transition: transform 0.2s;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.group-name {
  font-weight: 500;
  font-size: 14px;
}

.group-content {
  padding: 12px;
  border-top: 1px solid hsl(var(--border));
}

.add-item-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed hsl(var(--border));
  text-align: center;
}

.empty-group {
  text-align: center;
  padding: 20px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  background: hsl(var(--muted) / 0.15);
  border-radius: 6px;
}

.mapping-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 工资单/常乐豆 映射布局 - 左右结构 */
.payroll-mapping-layout {
  display: flex;
  gap: 16px;
  min-height: 400px;
}

.payroll-list-panel {
  width: 200px;
  flex-shrink: 0;
  background: hsl(var(--muted) / 0.2);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid hsl(var(--border));
}

.panel-title {
  font-weight: 600;
  font-size: 14px;
}

.payroll-slip-list {
  flex: 1;
  overflow-y: auto;
}

.panel-footer {
  padding-top: 12px;
  border-top: 1px solid hsl(var(--border));
  margin-top: 12px;
}

.payroll-slip-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: background-color 0.2s;
}

.payroll-slip-item:hover {
  background: hsl(var(--muted) / 0.3);
}

.payroll-slip-item.active {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.slip-name {
  font-size: 14px;
}

.payroll-detail-panel {
  flex: 1;
  background: hsl(var(--muted) / 0.2);
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
}

.payroll-detail-panel.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.detail-config-block {
  background: hsl(var(--muted) / 0.15);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.detail-config-block h5 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: hsl(var(--foreground));
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h5 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: hsl(var(--foreground));
}

.add-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed hsl(var(--border));
  text-align: center;
}

.source-text {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
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