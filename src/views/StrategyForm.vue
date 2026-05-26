<template>
  <div class="strategy-form-page">
    <div class="page-header">
      <div class="header-back" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <h1>{{ isEdit ? '编辑依赖计算策略' : '新增依赖计算策略' }}</h1>
    </div>

    <div class="content-section">
      <el-form label-width="100px" class="strategy-form">
        <el-form-item label="策略名称">
          <el-input v-model="form.name" placeholder="请输入策略名称" style="width: 400px;" />
        </el-form-item>

        <el-form-item label="关联发放策略">
          <el-select v-model="form.strategyId" placeholder="请选择发放策略" style="width: 400px;" @change="handleStrategyChange">
            <el-option v-for="s in strategyList" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="有效期">
          <div class="date-range-split">
            <el-date-picker v-model="form.dateRange[0]" type="date" placeholder="开始日期" size="small" style="width: 110px;" />
            <span style="margin: 0 8px; color: #666;">至</span>
            <el-date-picker v-model="form.dateRange[1]" type="date" placeholder="结束日期" size="small" style="width: 110px;" />
          </div>
        </el-form-item>

        <el-divider content-position="left">计算规则</el-divider>

        <!-- 规则概览区域 -->
        <div class="rules-overview" v-if="form.rules.length > 0">
          <div v-for="(rule, index) in form.rules" :key="'overview_'+index" class="rule-summary-item" @click="rule.expanded = !rule.expanded">
            <span class="rule-index">{{ index + 1 }}</span>
            <el-input v-model="rule.name" placeholder="规则名称" style="width: 160px;" size="small" @click.stop />
            <span class="rule-summary-text">{{ getRuleSummary(rule) }}</span>
            <div class="rule-summary-actions" @click.stop>
              <el-button size="small" link @click="moveRule(index, -1)" :disabled="index === 0">上移</el-button>
              <el-button size="small" link @click="moveRule(index, 1)" :disabled="index === form.rules.length - 1">下移</el-button>
            </div>
          </div>
        </div>

        <div v-for="(rule, index) in form.rules" :key="index" class="rule-item">
          <div class="rule-header">
            <div class="rule-header-left">
              <el-icon v-if="!rule.expanded" @click="rule.expanded = true" class="expand-icon"><CaretRight /></el-icon>
              <el-icon v-else @click="rule.expanded = false" class="expand-icon"><CaretBottom /></el-icon>
              <span class="rule-title">规则 {{ index + 1 }}：{{ rule.name || '未命名' }}</span>
            </div>
            <el-button type="danger" size="small" link @click="removeRule(index)" v-if="form.rules.length > 1">删除规则</el-button>
          </div>

          <div class="rule-form" v-if="rule.expanded !== false">
            <el-form-item label="计算频率">
              <div class="frequency-config">
                <el-select v-model="rule.frequencyCycle" placeholder="计算周期" style="width: 140px;" @change="handleFrequencyCycleChange(rule)">
                  <el-option label="日（自然日）" value="daily" />
                  <el-option label="周（自然周）" value="weekly" />
                  <el-option label="月（自然月）" value="monthly_natural" />
                  <el-option label="月（业务周）" value="monthly_business" />
                </el-select>
                <el-select v-model="rule.frequencyNode" placeholder="计算日期节点" style="width: 160px;">
                  <el-option v-for="node in getFrequencyNodes(rule.frequencyCycle)" :key="node.value" :label="node.label" :value="node.value" />
                </el-select>
              </div>
            </el-form-item>

            <el-form-item label="依赖项">
              <div class="depend-items">
                <div class="depend-items-header">
                  <el-button type="primary" link @click="openDependItemSelector(rule)">+ 添加依赖项</el-button>
                </div>
                <div class="depend-items-content">
                  <template v-for="group in getDependItemGroups(rule.dependItems)" :key="group.name">
                    <div class="depend-group">
                      <span class="depend-group-label" :class="{ 'data-object-label': group.name === '数据对象' }">{{ group.name }}</span>
                      <el-tag
                        v-for="item in group.items"
                        :key="item.id"
                        closable
                        @close="removeDependItemById(rule, item.id)"
                        :type="group.name === '数据对象' ? 'default' : group.name === '常乐豆' ? 'warning' : 'default'"
                        class="depend-tag"
                      >
                        {{ item.name }}
                      </el-tag>
                    </div>
                  </template>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="跨规则依赖">
              <div class="cross-rule-deps">
                <div class="cross-rule-deps-header">
                  <el-button type="primary" link @click="openCrossRuleDepSelector(rule, index)">+ 添加跨规则依赖</el-button>
                </div>
                <div class="cross-rule-deps-content" v-if="rule.crossRuleDeps?.length">
                  <el-tag
                    v-for="depIdx in rule.crossRuleDeps"
                    :key="depIdx"
                    closable
                    @close="removeCrossRuleDep(rule, depIdx)"
                    class="depend-tag"
                  >
                    规则{{ depIdx + 1 }}: {{ form.rules[depIdx]?.name || '未命名' }}
                  </el-tag>
                </div>
                <div v-else class="cross-rule-deps-empty">
                  <span class="empty-text">无跨规则依赖</span>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="数据要求">
              <div class="result-name-row">
                <span class="inline-label">取整模式</span>
                <el-select v-model="rule.roundingMode" placeholder="选择" style="width: 110px;">
                  <el-option label="四舍五入" value="round" />
                  <el-option label="向上取整" value="ceil" />
                  <el-option label="向下取整" value="floor" />
                </el-select>
                <span class="inline-label">数据格式</span>
                <el-select v-model="rule.decimalPlaces" placeholder="选择" style="width: 120px;">
                  <el-option label="保留0位小数" value="0" />
                  <el-option label="保留1位小数" value="1" />
                  <el-option label="保留2位小数" value="2" />
                </el-select>
              </div>
            </el-form-item>

            <el-form-item label="计算公式">
              <div class="formula-steps">
                <div v-for="(step, sIdx) in rule.steps" :key="sIdx" class="step-item">
                  <div class="step-header">
                    <div class="step-header-left">
                      <el-icon v-if="step.expanded === false" @click="step.expanded = true" class="expand-icon"><CaretRight /></el-icon>
                      <el-icon v-else @click="step.expanded = false" class="expand-icon"><CaretBottom /></el-icon>
                      <span class="step-title">步骤 {{ sIdx + 1 }}</span>
                      <el-input v-model="step.resultAlias" placeholder="薪酬项名称" style="width: 140px;" />
                    </div>
                    <el-button type="danger" size="small" link @click="removeStep(rule, sIdx)" v-if="rule.steps.length > 1">删除</el-button>
                  </div>
                  <div v-if="step.expanded !== false" class="step-content">
                    <div class="step-config">
                      <span class="step-config-label">计算方式</span>
                      <el-radio-group v-model="step.stepType">
                        <el-radio value="internal">内部计算</el-radio>
                        <el-radio value="external">外部服务</el-radio>
                      </el-radio-group>
                    </div>
                    <div v-if="step.stepType === 'internal'" class="step-internal">
                      <div class="step-result-line">
                        <span class="result-name">{{ step.resultAlias || '步骤' + (sIdx + 1) }} =</span>
                      </div>
                      <div class="condition-config">
                        <div class="condition-header">
                          <span class="condition-title">条件分支</span>
                          <el-button type="primary" link @click="addBranch(step)" v-if="step.branches.length < 5">+ 添加分支</el-button>
                        </div>
                        <div v-for="(branch, bIdx) in step.branches" :key="bIdx" class="branch-item">
                          <div class="branch-header">
                            <span class="branch-title">分支 {{ bIdx + 1 }}</span>
                            <span class="branch-hint">条件配置（子条件间关系：且）</span>
                            <el-button type="danger" size="small" link @click="removeBranch(step, bIdx)" v-if="step.branches.length > 1">删除</el-button>
                          </div>
                          <div class="branch-conditions">
                            <div v-for="(cond, cIdx) in branch.conditions" :key="cIdx" class="condition-editor">
                              <div class="condition-row">
                                <span class="cond-label">字段</span>
                                <el-select v-model="cond.field" placeholder="选择" style="width: 140px;">
                                  <el-optgroup label="依赖项">
                                    <el-option v-for="item in rule.dependItems" :key="'dep_' + item.id" :label="item.name" :value="'dep_' + item.id" />
                                  </el-optgroup>
                                  <el-optgroup label="前序步骤">
                                    <el-option v-for="(prev, pIdx) in rule.steps.slice(0, sIdx)" :key="'step_' + pIdx" :label="prev.resultAlias || ('步骤' + (pIdx + 1))" :value="'step_' + pIdx" />
                                  </el-optgroup>
                                  <el-optgroup label="其他规则">
                                    <template v-for="(r, rIdx) in form.rules" :key="'rule_group_' + rIdx">
                                      <template v-if="rule.crossRuleDeps?.includes(rIdx)">
                                        <el-option
                                          v-for="(step, sIdx) in r.steps"
                                          :key="'rule_' + rIdx + '_' + sIdx"
                                          :label="'规则' + (rIdx + 1) + '/' + (step.resultAlias || '步骤' + (sIdx + 1))"
                                          :value="'rule_' + rIdx + '_' + sIdx"
                                        />
                                      </template>
                                    </template>
                                  </el-optgroup>
                                  <el-optgroup label="数据对象">
                                    <el-option
                                      v-for="item in dataObjectItems"
                                      :key="'obj_' + item.id"
                                      :label="item.name"
                                      :value="'obj_' + item.id"
                                    />
                                  </el-optgroup>
                                </el-select>
                                <span class="cond-label">判断符</span>
                                <el-select v-model="cond.operator" placeholder="选择" style="width: 100px;">
                                  <el-option label="等于" value="eq" />
                                  <el-option label="不等于" value="ne" />
                                  <el-option label="大于" value="gt" />
                                  <el-option label="大于等于" value="gte" />
                                  <el-option label="小于" value="lt" />
                                  <el-option label="小于等于" value="lte" />
                                  <el-option label="包含" value="contains" />
                                </el-select>
                                <span class="cond-label">值类型</span>
                                <el-select v-model="cond.valueType" placeholder="选择" style="width: 100px;" @change="handleCondValueTypeChange(cond)">
                                  <el-option label="上下文" value="context" />
                                  <el-option label="引用" value="ref" />
                                  <el-option label="输入" value="input" />
                                  <el-option label="选择" value="select" />
                                </el-select>
                                <span class="cond-label">筛选值</span>
                                <el-select v-if="cond.valueType === 'context'" v-model="cond.contextParam" placeholder="上下文参数" style="width: 140px;">
                                  <el-option label="当前人员" value="$currentUser" />
                                  <el-option label="当前时间" value="$currentTime" />
                                </el-select>
                                <el-select v-else-if="cond.valueType === 'ref'" v-model="cond.refField" placeholder="选择引用" style="width: 140px;">
                                  <el-optgroup label="依赖项">
                                    <el-option v-for="item in rule.dependItems" :key="'dep_' + item.id" :label="item.name" :value="'dep_' + item.id" />
                                  </el-optgroup>
                                  <el-optgroup label="前序步骤">
                                    <el-option v-for="(prev, pIdx) in rule.steps.slice(0, sIdx)" :key="'step_' + pIdx" :label="prev.resultAlias || ('步骤' + (pIdx + 1))" :value="'step_' + pIdx" />
                                  </el-optgroup>
                                  <el-optgroup label="其他规则">
                                    <template v-for="(r, rIdx) in form.rules" :key="'rule_group_' + rIdx">
                                      <template v-if="rule.crossRuleDeps?.includes(rIdx)">
                                        <el-option
                                          v-for="(step, sIdx) in r.steps"
                                          :key="'rule_' + rIdx + '_' + sIdx"
                                          :label="'规则' + (rIdx + 1) + '/' + (step.resultAlias || '步骤' + (sIdx + 1))"
                                          :value="'rule_' + rIdx + '_' + sIdx"
                                        />
                                      </template>
                                    </template>
                                  </el-optgroup>
                                  <el-optgroup label="数据对象">
                                    <el-option
                                      v-for="item in dataObjectItems"
                                      :key="'obj_' + item.id"
                                      :label="item.name"
                                      :value="'obj_' + item.id"
                                    />
                                  </el-optgroup>
                                </el-select>
                                <el-input v-else-if="cond.valueType === 'input'" v-model="cond.value" placeholder="手动输入" style="width: 140px;" />
                                <el-select v-else-if="cond.valueType === 'select'" v-model="cond.selectValue" placeholder="选择" style="width: 140px;">
                                  <template v-if="cond.field?.startsWith('obj_501_status')">
                                    <el-option label="在职" value="active" />
                                    <el-option label="离职" value="terminated" />
                                  </template>
                                  <template v-else-if="cond.field?.startsWith('obj_501')">
                                    <el-option label="在职" value="active" />
                                    <el-option label="离职" value="terminated" />
                                  </template>
                                  <template v-else>
                                    <el-option label="选项1" value="opt1" />
                                    <el-option label="选项2" value="opt2" />
                                  </template>
                                </el-select>
                                <el-button type="danger" link size="small" @click="removeBranchCondition(branch, cIdx)">×</el-button>
                              </div>
                            </div>
                            <el-button type="primary" link size="small" @click="addBranchCondition(branch)">+ 添加条件</el-button>
                          </div>
                          <div class="branch-formula-area">
                            <el-input v-model="branch.formula" placeholder="输入计算公式" style="width: 100%;" />
                            <div class="formula-hints">
                              <el-tag v-for="fn in formulaFunctions" :key="fn.value" size="small" class="formula-tag" @click="insertBranchFormula(branch, fn.value)">
                                {{ fn.label }}
                              </el-tag>
                              <span class="formula-sep">|</span>
                              <el-tag size="small" class="formula-tag" @click="insertBranchFormula(branch, '+')">+</el-tag>
                              <el-tag size="small" class="formula-tag" @click="insertBranchFormula(branch, '-')">-</el-tag>
                              <el-tag size="small" class="formula-tag" @click="insertBranchFormula(branch, '*')">*</el-tag>
                              <el-tag size="small" class="formula-tag" @click="insertBranchFormula(branch, '/')">/</el-tag>
                              <span class="formula-sep">|</span>
                              <el-tag size="small" class="formula-tag" @click="insertBranchFormula(branch, '(')">(</el-tag>
                              <el-tag size="small" class="formula-tag" @click="insertBranchFormula(branch, ')')">)</el-tag>
                              <el-tag size="small" class="formula-tag" @click="insertBranchFormula(branch, ',')">,</el-tag>
                            </div>
                            <div class="formula-refs-other-rules">
                              <template v-for="(r, rIdx) in form.rules" :key="rIdx">
                                <div v-if="rule.crossRuleDeps?.includes(rIdx)" class="formula-ref-group">
                                  <span class="ref-label">规则{{ rIdx + 1 }}</span>
                                  <el-tag
                                    v-for="(step, sIdx) in r.steps"
                                    :key="sIdx"
                                    size="small"
                                    class="formula-ref-tag"
                                    @click="insertBranchFormula(branch, '规则' + (rIdx + 1) + '/' + (step.resultAlias || '步骤' + (sIdx + 1)))"
                                  >
                                    {{ step.resultAlias || '步骤' + (sIdx + 1) }}
                                  </el-tag>
                                </div>
                              </template>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="step.stepType === 'external'" class="step-external">
                      <div class="external-config">
                        <div class="external-row">
                          <span class="external-label">服务</span>
                          <el-select v-model="step.externalService" placeholder="选择服务" style="width: 140px;">
                            <el-option label="申报个税" value="tax" />
                            <el-option label="负工资抵扣" value="negative_wage_deduct" />
                          </el-select>
                        </div>
                        <div class="external-row">
                          <span class="external-label">传入值</span>
                          <el-select v-model="step.externalInput" placeholder="选择" style="width: 140px;">
                            <el-option v-for="(prevStep, pIdx) in rule.steps.slice(0, sIdx)" :key="pIdx" :label="'步骤' + (pIdx + 1) + ' (' + (prevStep.resultAlias || '结果' + (pIdx + 1)) + ')'" :value="pIdx" />
                          </el-select>
                        </div>
                        <div class="external-row">
                          <span class="external-label">返回字段</span>
                          <el-select v-model="step.externalResultField" placeholder="选择字段" style="width: 180px;">
                            <el-option v-for="f in getServiceResultFields(step.externalService)" :key="f.value" :label="f.label" :value="f.value" />
                          </el-select>
                        </div>
                      </div>
                      <div class="step-result-display" style="margin-top: 8px;">
                        <span class="result-name">{{ step.resultAlias || '步骤' + (sIdx + 1) }} =</span>
                        <el-input :model-value="getExternalFormula(step)" readonly style="width: 280px; background: #fff;" />
                      </div>
                    </div>
                  </div>
                </div>
                <el-button type="primary" link @click="addStep(rule)">+ 添加步骤</el-button>
              </div>
            </el-form-item>

            <el-form-item label="结果嵌入">
              <div class="result-embedding">
                <el-table :data="rule.embeds" :key="'embed-table-' + rule.embeds.length" border style="width: 100%; min-width: 800px;" table-layout="fixed">
                  <el-table-column label="来源" min-width="180">
                    <template #default="{ row, $index }">
                      <el-select v-model="row.sourceStep" placeholder="选择" style="width: 100%;" @change="handleEmbedSourceChange(row, rule)">
                        <el-option v-for="(step, sIdx) in rule.steps" :key="sIdx" :label="'步骤' + (sIdx + 1) + ' - ' + (step.resultAlias || '未命名')" :value="sIdx" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="别名" min-width="140">
                    <template #default="{ row }">
                      <el-input v-model="row.name" placeholder="别名" style="width: 100%;" />
                    </template>
                  </el-table-column>
                  <el-table-column label="类型" min-width="120">
                    <template #default="{ row }">
                      <el-select v-model="row.resultType" placeholder="类型" style="width: 100%;">
                        <el-option label="薪酬项" value="salary" />
                        <el-option label="扣缴项" value="deduction" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="支付方式" min-width="120">
                    <template #default="{ row }">
                      <el-select v-model="row.paymentType" placeholder="支付" style="width: 100%;">
                        <el-option label="现金" value="cash" />
                        <el-option label="常乐豆" value="bean" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="工资条" min-width="140">
                    <template #default="{ row }">
                      <el-select v-model="row.targetPayslip" placeholder="工资条" style="width: 100%;">
                        <el-option v-for="p in payslipList" :key="p.id" :label="p.name" :value="p.id" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="分组" min-width="140">
                    <template #default="{ row }">
                      <el-select v-model="row.targetGroup" placeholder="分组" style="width: 100%;">
                        <el-option v-for="g in groupList" :key="g.id" :label="g.name" :value="g.id" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80" fixed="right">
                    <template #default="{ row, $index }">
                      <el-button type="danger" link size="small" @click="removeEmbed(rule, $index)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button type="primary" link @click="addEmbed(rule, 0)" style="margin-top: 8px;">+ 添加嵌入项</el-button>
              </div>
            </el-form-item>
          </div>
        </div>

        <el-button type="primary" link @click="addRule">+ 添加规则</el-button>

        <div class="form-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="saveStrategy">保存</el-button>
        </div>
      </el-form>
    </div>

    <!-- 依赖项选择弹窗 -->
    <el-dialog v-model="dependItemDialogVisible" title="选择依赖项" width="800px">
      <div class="search-box">
        <el-input v-model="dependSearchKeyword" placeholder="搜索依赖项" clearable style="width: 300px;">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="depend-item-list">
        <div v-for="group in filteredDependItemGroups" :key="group.group" class="depend-item-group">
          <div class="group-title">
            <el-tag size="small" :type="group.group === '薪酬' ? 'primary' : group.group === '常乐豆' ? 'warning' : group.group === '元数据' ? 'success' : 'info'">{{ group.group }}</el-tag>
          </div>
          <div class="group-items">
            <template v-if="group.group === '薪酬'">
              <div v-for="payslip in getPayslipGroups(group.items)" :key="payslip.name" class="payslip-sub-group">
                <div class="payslip-title">{{ payslip.name }}</div>
                <div class="payslip-items">
                  <div
                    v-for="item in payslip.items"
                    :key="item.id"
                    :class="['depend-item-option', { selected: selectedDependItems.some(s => s.id === item.id) }]"
                    @click="toggleDependItem(item)"
                  >
                    <span class="item-name">{{ item.name }}</span>
                    <el-tag :type="item.paymentType === '常乐豆' ? 'warning' : 'info'" size="small">{{ item.paymentType }}</el-tag>
                  </div>
                </div>
              </div>
            </template>
            <template v-else-if="group.group === '数据对象'">
              <div
                v-for="item in group.items"
                :key="item.id"
                :class="['depend-item-option', { selected: selectedDependItems.some(s => s.id === item.id) }]"
                @click="toggleDependItem(item)"
              >
                <span class="item-name">{{ item.name }}</span>
                <el-tag size="small">数据对象</el-tag>
              </div>
            </template>
            <template v-else>
              <div
                v-for="item in group.items"
                :key="item.id"
                :class="['depend-item-option', { selected: selectedDependItems.some(s => s.id === item.id) }]"
                @click="toggleDependItem(item)"
              >
                <span class="item-name">{{ item.name }}</span>
                <el-tag v-if="item.paymentType" :type="item.paymentType === '常乐豆' ? 'warning' : 'info'" size="small">{{ item.paymentType }}</el-tag>
                <el-tag v-else-if="item.type" type="success" size="small">{{ item.type }}</el-tag>
              </div>
            </template>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dependItemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDependItems">确认</el-button>
      </template>
    </el-dialog>

    <!-- 跨规则依赖选择弹窗 -->
    <el-dialog v-model="crossRuleDepDialogVisible" title="选择跨规则依赖" width="600px">
      <div class="cross-rule-dep-list">
        <div v-if="availableCrossRuleDeps.length === 0" class="empty-text">没有可用的前序规则</div>
        <div v-for="(r, rIdx) in availableCrossRuleDeps" :key="rIdx" class="cross-rule-dep-item">
          <div class="cross-rule-dep-header">
            <el-checkbox
              :model-value="selectedCrossRuleDeps.includes(r.ruleIndex)"
              @change="toggleCrossRuleDep(r.ruleIndex)"
            >
              <span class="cross-rule-name">规则{{ r.ruleIndex + 1 }}: {{ r.name }}</span>
            </el-checkbox>
          </div>
          <div class="cross-rule-dep-steps">
            <el-tag
              v-for="(step, sIdx) in r.steps"
              :key="sIdx"
              size="small"
              type="info"
            >
              {{ step.resultAlias || '步骤' + (sIdx + 1) }}
            </el-tag>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="crossRuleDepDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCrossRuleDeps">确认</el-button>
      </template>
    </el-dialog>

    <!-- 新建分组弹窗 -->
    <el-dialog v-model="addGroupDialogVisible" title="新建分组" width="400px">
      <el-form label-width="80px">
        <el-form-item label="分组名称">
          <el-input v-model="addGroupForm.name" placeholder="请输入分组名称" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="别名">
          <el-input v-model="addGroupForm.alias" placeholder="可选，用于显示别名" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addGroupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAddGroup">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Search, QuestionFilled, CaretRight, CaretBottom } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 策略列表数据（用于编辑时加载）
const strategies = ref([
  {
    id: 1,
    name: '全职员工保底获豆计算',
    strategyId: 1,
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
        crossRuleDeps: [],
        steps: [
          { resultAlias: '保底收入项', formula: '求和(计件提成, 超时加班费, 节假日加班费)', branches: [{ conditions: [], formula: '求和(计件提成, 超时加班费, 节假日加班费)' }] },
          { resultAlias: '保底获豆', formula: '条件判断', branches: [
            { conditions: [{ field: 'step_0', operator: 'lt', valueType: 'ref', refField: 'dep_401' }], formula: '最低工资标准 - 保底收入项' },
            { conditions: [{ field: 'step_0', operator: 'gte', valueType: 'ref', refField: 'dep_401' }], formula: '0' }
          ]}
        ],
        embeds: [{ name: '保底获豆', resultType: '薪酬项', paymentType: '常乐豆', targetPayslip: '常乐豆工资条', sourceStep: 1 }]
      }
    ]
  },
  {
    id: 2,
    name: '兼职员工个税计算',
    strategyId: 2,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    rules: [
      {
        name: '第1周预扣个税',
        frequency: '月（业务周）',
        frequencyNode: '当月 M1日',
        dependItems: [
          { id: 1, name: '基础提成', payslip: '第1周工资条', paymentType: '现金' },
          { id: 201, name: '绩效补贴', payslip: '第1周工资条', paymentType: '现金' },
          { id: 202, name: '夜班补贴', payslip: '第1周工资条', paymentType: '现金' }
        ],
        steps: [
          { resultAlias: '第1周预扣个税', formula: '(基础提成 + 绩效补贴 + 夜班补贴) * 0.03', branches: [{ conditions: [], formula: '(基础提成 + 绩效补贴 + 夜班补贴) * 0.03' }] }
        ],
        crossRuleDeps: [],
        embeds: [{ name: '预扣个税', resultType: '扣缴项', paymentType: '现金', targetPayslip: '第1周工资条', sourceStep: 0 }]
      },
      {
        name: '第2周预扣个税',
        frequency: '月（业务周）',
        frequencyNode: '当月 M1日',
        dependItems: [
          { id: 2, name: '回头客激励', payslip: '第2周工资条', paymentType: '现金' },
          { id: 203, name: '服务时长补贴', payslip: '第2周工资条', paymentType: '现金' }
        ],
        steps: [
          { resultAlias: '第2周预扣个税', formula: '(回头客激励 + 服务时长补贴) * 0.03', branches: [{ conditions: [], formula: '(回头客激励 + 服务时长补贴) * 0.03' }] }
        ],
        crossRuleDeps: [],
        embeds: [{ name: '预扣个税', resultType: '扣缴项', paymentType: '现金', targetPayslip: '第2周工资条', sourceStep: 0 }]
      },
      {
        name: '第3周预扣个税',
        frequency: '月（业务周）',
        frequencyNode: '当月 M1日',
        dependItems: [
          { id: 3, name: '周时长激励', payslip: '第3周工资条', paymentType: '现金' },
          { id: 204, name: '节假日补贴', payslip: '第3周工资条', paymentType: '现金' }
        ],
        steps: [
          { resultAlias: '第3周预扣个税', formula: '(周时长激励 + 节假日补贴) * 0.03', branches: [{ conditions: [], formula: '(周时长激励 + 节假日补贴) * 0.03' }] }
        ],
        crossRuleDeps: [],
        embeds: [{ name: '预扣个税', resultType: '扣缴项', paymentType: '现金', targetPayslip: '第3周工资条', sourceStep: 0 }]
      },
      {
        name: '月度个税汇总退补',
        frequency: '月（业务周）',
        frequencyNode: '当月 M1日',
        dependItems: [
          { id: 1, name: '基础提成' },
          { id: 2, name: '回头客激励' },
          { id: 3, name: '周时长激励' }
        ],
        crossRuleDeps: [0, 1, 2],
        steps: [
          { resultAlias: '税前收入合计', formula: '求和(基础提成, 回头客激励, 周时长激励)', branches: [{ conditions: [], formula: '求和(基础提成, 回头客激励, 周时长激励)' }] },
          { resultAlias: '实际税额', formula: '外部服务(TAX)', branches: [] },
          { resultAlias: '预扣税合计', formula: '求和(规则1/第1周预扣个税, 规则2/第2周预扣个税, 规则3/第3周预扣个税)', branches: [{ conditions: [], formula: '求和(规则1/第1周预扣个税, 规则2/第2周预扣个税, 规则3/第3周预扣个税)' }] },
          { resultAlias: '个税退补', formula: '条件判断', branches: [
            { conditions: [{ field: 'rule_0_0', operator: 'gt', valueType: 'ref', refField: 'step_1' }], formula: '规则1/第1周预扣个税 + 规则2/第2周预扣个税 + 规则3/第3周预扣个税 - 实际税额' },
            { conditions: [{ field: 'rule_0_0', operator: 'lte', valueType: 'ref', refField: 'step_1' }], formula: '规则1/第1周预扣个税 + 规则2/第2周预扣个税 + 规则3/第3周预扣个税 - 实际税额' }
          ]}
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
        crossRuleDeps: [],
        steps: [
          { resultAlias: '收入合计', formula: '求和(计件提成, 超时加班费, 节假日加班费)', branches: [{ conditions: [], formula: '求和(计件提成, 超时加班费, 节假日加班费)' }] },
          { resultAlias: '负工资抵扣', formula: '外部服务(负工资)', branches: [
            { conditions: [{ field: 'obj_501_status', operator: 'eq', valueType: 'select', selectValue: 'active' }], formula: '外部服务(负工资)' }
          ]}
        ],
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
        crossRuleDeps: [0],
        steps: [
          { resultAlias: '收入合计', formula: '求和(超产值补贴, 客户打赏)', branches: [{ conditions: [], formula: '求和(超产值补贴, 客户打赏)' }] },
          { resultAlias: '负工资抵扣', formula: '外部服务(负工资)', branches: [
            { conditions: [{ field: 'obj_501_status', operator: 'eq', valueType: 'select', selectValue: 'active' }], formula: '外部服务(负工资)' }
          ]}
        ],
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
        crossRuleDeps: [0, 1],
        steps: [
          { resultAlias: '常乐豆收入', formula: '保底获豆', branches: [{ conditions: [], formula: '保底获豆' }] },
          { resultAlias: '负工资抵扣', formula: '外部服务(负工资)', branches: [
            { conditions: [{ field: 'obj_501_status', operator: 'eq', valueType: 'select', selectValue: 'terminated' }], formula: '外部服务(负工资)' }
          ]}
        ],
        embeds: [
          { name: '负工资抵扣', resultType: '扣缴项', paymentType: '常乐豆', targetPayslip: '常乐豆工资条', sourceStep: 1 }
        ]
      }
    ]
  }
])

// 发放策略列表
const strategyList = ref([
  { id: 1, name: '2026年全职员工发放策略' },
  { id: 2, name: '2026年兼职员工发放策略' },
  { id: 1, name: '2026年全职员工负工资抵扣演示' }
])

// 工资条列表
const payslipList = ref([
  { id: 1, name: '常乐豆工资条' },
  { id: 2, name: '基本工资条' },
  { id: 3, name: '绩效工资条' },
  { id: 4, name: '奖金工资条' },
  { id: 5, name: '第1周工资条' },
  { id: 6, name: '第2周工资条' },
  { id: 7, name: '第3周工资条' },
  { id: 8, name: '第4周工资条' }
])

// 分组列表
const groupList = ref([
  { id: 1, name: '应发收入', alias: '' },
  { id: 2, name: '代扣税', alias: '' },
  { id: 3, name: '实发收入', alias: '' },
  { id: 4, name: '税前扣除', alias: '' }
])

// 依赖项分组数据
const dependItemGroups = ref([
  {
    group: '薪酬',
    items: [
      // 全职
      { id: 1, name: '计件提成', payslip: '计件工资条', paymentType: '现金' },
      { id: 2, name: '超时加班费', payslip: '加班工资条', paymentType: '现金' },
      { id: 3, name: '节假日加班费', payslip: '加班工资条', paymentType: '现金' },
      { id: 4, name: '超产值补贴', payslip: '补贴工资条', paymentType: '现金' },
      { id: 5, name: '客户打赏', payslip: '补贴工资条', paymentType: '现金' },
      { id: 6, name: '退单补贴', payslip: '补贴工资条', paymentType: '现金' },
      { id: 14, name: '人事手动补贴', payslip: '补贴工资条', paymentType: '现金' },
      { id: 15, name: '投诉扣款', payslip: '补贴工资条', paymentType: '现金' },
      { id: 16, name: '代扣个税', payslip: '补贴工资条', paymentType: '现金' },
      { id: 18, name: '代扣社保', payslip: '补贴工资条', paymentType: '现金' },
      { id: 19, name: '代扣公积金', payslip: '补贴工资条', paymentType: '现金' },
      // 兼职
      { id: 101, name: '基础提成', payslip: '兼职工资条', paymentType: '现金' },
      { id: 102, name: '回头客激励', payslip: '兼职工资条', paymentType: '现金' },
      { id: 103, name: '周时长激励', payslip: '兼职工资条', paymentType: '现金' },
      { id: 104, name: '退单补贴', payslip: '兼职工资条', paymentType: '现金' },
      { id: 105, name: '打赏', payslip: '兼职工资条', paymentType: '现金' },
      { id: 106, name: '人事手动补贴', payslip: '兼职工资条', paymentType: '现金' },
      { id: 107, name: '内部介绍', payslip: '兼职工资条', paymentType: '现金' },
      { id: 108, name: '面试激励', payslip: '兼职工资条', paymentType: '现金' },
      { id: 109, name: '知识萃取', payslip: '兼职工资条', paymentType: '现金' },
      { id: 110, name: '投诉扣款', payslip: '兼职工资条', paymentType: '现金' },
      { id: 111, name: '时长不足扣提成', payslip: '兼职工资条', paymentType: '现金' },
      { id: 112, name: '人事手动扣款', payslip: '兼职工资条', paymentType: '现金' }
    ]
  },
  {
    group: '常乐豆',
    items: [
      { id: 201, name: '保底获豆', paymentType: '常乐豆' },
      { id: 202, name: '回头客获豆', paymentType: '常乐豆' },
      { id: 203, name: '内部介绍获豆', paymentType: '常乐豆' },
      { id: 204, name: '培训获豆', paymentType: '常乐豆' },
      { id: 205, name: '顶班获豆', paymentType: '常乐豆' },
      { id: 206, name: '住宿获豆', paymentType: '常乐豆' },
      { id: 207, name: '服务圈获豆', paymentType: '常乐豆' },
      { id: 208, name: '营销折扣获豆', paymentType: '常乐豆' },
      { id: 209, name: '三级合伙人获豆', paymentType: '常乐豆' }
    ]
  },
  {
    group: '元数据',
    items: [
      { id: 301, name: '员工工龄', type: '计数' },
      { id: 302, name: '门店技师数', type: '计数' },
      { id: 303, name: '本月出勤天数', type: '计数' },
      { id: 304, name: '当前余额', type: '金额' },
      { id: 305, name: '累计收益', type: '金额' },
      { id: 306, name: '门店评分', type: '数值' },
      { id: 307, name: '客户满意度', type: '数值' },
      { id: 308, name: '入职日期', type: '时间' },
      { id: 309, name: '业务周期开始', type: '时间' },
      { id: 310, name: '业务周期结束', type: '时间' }
    ]
  },
  {
    group: '配置参数',
    items: [
      { id: 401, name: '最低工资标准', value: '2360' },
      { id: 402, name: '社保基数上限', value: '30000' },
      { id: 403, name: '公积金基数上限', value: '25000' },
      { id: 404, name: '个税起征点', value: '5000' },
      { id: 405, name: '加班费率', value: '1.5' },
      { id: 406, name: '节假日费率', value: '2.0' },
      { id: 407, name: '保底月工时', value: '176' },
      { id: 408, name: '常乐豆兑换比率', value: '1:1' }
    ]
  },
  {
    group: '数据对象',
    items: [
      { id: 501, name: '员工' },
      { id: 502, name: '订单' },
      { id: 503, name: '门店' },
      { id: 504, name: '客户' }
    ]
  }
])

// 过滤后的依赖项（根据策略类型和搜索关键词）
const filteredDependItemGroups = computed(() => {
  let groups = dependItemGroups.value.map(group => {
    // 兼职策略时，常乐豆分组不显示
    if (form.strategyId === 2 && group.group === '常乐豆') {
      return { ...group, items: [] }
    }
    return group
  })

  // 按搜索关键词过滤
  if (dependSearchKeyword.value) {
    groups = groups
      .map(group => ({
        group: group.group,
        items: group.items.filter(item => item.name.includes(dependSearchKeyword.value))
      }))
      .filter(group => group.items.length > 0)
  }

  return groups
})

// 数据对象列表（用于条件选择）
const dataObjectItems = computed(() => {
  const objGroup = dependItemGroups.value.find(g => g.group === '数据对象')
  if (!objGroup) return []
  // 为每个数据对象生成其可用字段选项
  const fieldsMap = {
    '员工': [
      { id: 'obj_501_status', name: '员工.在职状态' },
      { id: 'obj_501_department', name: '员工.部门' },
      { id: 'obj_501_position', name: '员工.岗位' },
      { id: 'obj_501_hireDate', name: '员工.入职日期' },
      { id: 'obj_501_terminationDate', name: '员工.离职日期' },
      { id: 'obj_501_negativeBalance', name: '员工.负工资余额' }
    ],
    '订单': [
      { id: 'obj_502_status', name: '订单.状态' },
      { id: 'obj_502_amount', name: '订单.金额' },
      { id: 'obj_502_date', name: '订单.日期' }
    ],
    '门店': [
      { id: 'obj_503_name', name: '门店.名称' },
      { id: 'obj_503_region', name: '门店.地区' }
    ],
    '客户': [
      { id: 'obj_504_name', name: '客户.名称' },
      { id: 'obj_504_level', name: '客户.等级' }
    ]
  }
  const items = []
  for (const obj of objGroup.items) {
    const fields = fieldsMap[obj.name] || []
    items.push(...fields)
  }
  return items
})

// 是否编辑模式
const isEdit = computed(() => !!route.query.id)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  strategyId: null,
  dateRange: [],
  rules: []
})

// 依赖项选择
const dependItemDialogVisible = ref(false)
const dependSearchKeyword = ref('')
const currentRule = ref(null)
const selectedDependItems = ref([])

// 按工资条分组（用于薪酬展示）
const getPayslipGroups = (items) => {
  const groups = {}
  items.forEach(item => {
    if (!groups[item.payslip]) {
      groups[item.payslip] = { name: item.payslip, items: [] }
    }
    groups[item.payslip].items.push(item)
  })
  return Object.values(groups)
}

const openDependItemSelector = (rule) => {
  currentRule.value = rule
  selectedDependItems.value = [...rule.dependItems]
  dependSearchKeyword.value = ''
  dependItemDialogVisible.value = true
}

const toggleDependItem = (item) => {
  const idx = selectedDependItems.value.findIndex(s => s.id === item.id)
  if (idx !== -1) {
    selectedDependItems.value.splice(idx, 1)
  } else {
    selectedDependItems.value.push(item)
  }
}

const confirmDependItems = () => {
  currentRule.value.dependItems = [...selectedDependItems.value]
  dependItemDialogVisible.value = false
}

const removeDependItem = (rule, index) => {
  rule.dependItems.splice(index, 1)
}

const removeDependItemById = (rule, id) => {
  const idx = rule.dependItems.findIndex(item => item.id === id)
  if (idx !== -1) {
    rule.dependItems.splice(idx, 1)
  }
}

// ===== 跨规则依赖 =====
const crossRuleDepDialogVisible = ref(false)
const currentRuleIndexForCrossDep = ref(-1)
const selectedCrossRuleDeps = ref([])

// 当前规则可选的前序规则列表
const availableCrossRuleDeps = computed(() => {
  if (currentRuleIndexForCrossDep.value < 0) return []
  const deps = []
  for (let i = 0; i < currentRuleIndexForCrossDep.value; i++) {
    const r = form.rules[i]
    if (r) {
      deps.push({
        ruleIndex: i,
        name: r.name || '未命名',
        steps: r.steps || []
      })
    }
  }
  return deps
})

const openCrossRuleDepSelector = (rule, ruleIndex) => {
  currentRuleIndexForCrossDep.value = ruleIndex
  selectedCrossRuleDeps.value = [...(rule.crossRuleDeps || [])]
  crossRuleDepDialogVisible.value = true
}

const toggleCrossRuleDep = (ruleIndex) => {
  const idx = selectedCrossRuleDeps.value.indexOf(ruleIndex)
  if (idx !== -1) {
    selectedCrossRuleDeps.value.splice(idx, 1)
  } else {
    selectedCrossRuleDeps.value.push(ruleIndex)
  }
  selectedCrossRuleDeps.value.sort((a, b) => a - b)
}

const confirmCrossRuleDeps = () => {
  const rule = form.rules[currentRuleIndexForCrossDep.value]
  if (rule) {
    rule.crossRuleDeps = [...selectedCrossRuleDeps.value]
  }
  crossRuleDepDialogVisible.value = false
}

const removeCrossRuleDep = (rule, depIdx) => {
  const idx = rule.crossRuleDeps?.indexOf(depIdx)
  if (idx !== -1 && idx !== undefined) {
    rule.crossRuleDeps.splice(idx, 1)
  }
}

// 按分组展示已选依赖项
const getDependItemGroups = (items) => {
  const groups = { '薪酬': [], '常乐豆': [], '元数据': [], '配置参数': [], '数据对象': [] }
  items.forEach(item => {
    if (item.paymentType === '常乐豆') {
      groups['常乐豆'].push(item)
    } else if (item.value !== undefined) {
      groups['配置参数'].push(item)
    } else if (item.type !== undefined) {
      groups['元数据'].push(item)
    } else if (item.payslip !== undefined) {
      groups['薪酬'].push(item)
    } else {
      // 没有 payslip/value/type/paymentType 的就是数据对象
      groups['数据对象'].push(item)
    }
  })
  return Object.entries(groups)
    .filter(([name, items]) => items.length > 0)
    .map(([name, items]) => ({ name, items }))
}

// 新建分组
const addGroupDialogVisible = ref(false)
const addGroupForm = reactive({
  name: '',
  alias: ''
})

const openAddGroupDialog = () => {
  addGroupForm.name = ''
  addGroupForm.alias = ''
  addGroupDialogVisible.value = true
}

const saveAddGroup = () => {
  if (!addGroupForm.name) {
    ElMessage.warning('请输入分组名称')
    return
  }
  const newId = Date.now()
  groupList.value.push({
    id: newId,
    name: addGroupForm.name,
    alias: addGroupForm.alias
  })
  addGroupDialogVisible.value = false
  ElMessage.success('分组已添加')
}

// 规则操作
const createDefaultStep = () => ({
  stepType: 'internal',
  resultAlias: '',
  expanded: true,
  branches: [
    { conditions: [], formula: '' }
  ],
  externalService: '',
  externalInput: null,
  externalResultField: ''
})

const getExternalFormula = (step) => {
  if (step.stepType === 'external' && step.externalService) {
    return `${step.externalService === 'tax' ? 'TAX' : '负工资服务'}(${step.externalInput !== null ? '步骤' + (step.externalInput + 1) : '?'})`
  }
  return ''
}

const insertFormula = (step, text) => {
  // unused for internal steps now, branches have their own formula
}

const insertBranchFormula = (branch, text) => {
  branch.formula = (branch.formula || '') + text
}

const addBranch = (step) => {
  if (step.branches.length >= 5) return
  step.branches.push({
    conditions: [{ field: '', operator: 'eq', valueType: 'input', value: '', refField: '', contextParam: '' }],
    formula: ''
  })
}

const removeBranch = (step, index) => {
  step.branches.splice(index, 1)
}

const formulaFunctions = [
  { label: '求和', value: 'SUM()' },
  { label: '平均值', value: 'AVG()' },
  { label: '最大值', value: 'MAX()' },
  { label: '最小值', value: 'MIN()' },
  { label: '取整', value: 'ROUND()' }
]

const addBranchCondition = (branch) => {
  branch.conditions.push({
    field: '',
    operator: 'eq',
    valueType: 'input',
    value: '',
    refField: '',
    contextParam: '',
    selectValue: ''
  })
}

const handleCondValueTypeChange = (cond) => {
  cond.value = ''
  cond.refField = ''
  cond.contextParam = ''
  cond.selectValue = ''
}

const removeBranchCondition = (branch, index) => {
  branch.conditions.splice(index, 1)
}

const getConditionLabel = (cond, rule, sIdx) => {
  if (!cond || !cond.field) return ''
  let label = ''
  if (cond.field.startsWith('dep_')) {
    const item = rule.dependItems.find(d => 'dep_' + d.id === cond.field)
    label = item ? item.name : cond.field
  } else if (cond.field.startsWith('step_')) {
    const idx = parseInt(cond.field.split('_')[1])
    const prev = rule.steps[idx]
    label = prev ? (prev.resultAlias || '步骤' + (idx + 1)) : cond.field
  }
  const opMap = { eq: '=', ne: '!=', gt: '>', gte: '>=', lt: '<', lte: '<=', contains: '包含' }
  const op = opMap[cond.operator] || cond.operator || ''
  if (cond.valueType === 'input' && cond.refField) {
    if (cond.refField.startsWith('dep_')) {
      const item = rule.dependItems.find(d => 'dep_' + d.id === cond.refField)
      label += ` ${op} ${item ? item.name : cond.refField}`
    } else if (cond.refField.startsWith('step_')) {
      const idx = parseInt(cond.refField.split('_')[1])
      const prev = rule.steps[idx]
      label += ` ${op} ${prev ? (prev.resultAlias || '步骤' + (idx + 1)) : cond.refField}`
    }
  } else if (cond.value) {
    label += ` ${op} ${cond.value}`
  } else {
    label = label || '未配置'
  }
  return label
}

const addCondition = (step) => {
  // deprecated, now using branches
}

const handleValueTypeChange = (cond) => {
  cond.value = ''
  cond.refField = ''
  cond.contextParam = ''
}

const createDefaultEmbed = (stepIdx = 0) => ({
  sourceStep: stepIdx,
  name: '',
  resultType: 'salary',
  paymentType: 'cash',
  targetPayslip: null,
  targetGroup: null
})

const handleEmbedSourceChange = (embed, rule) => {
  const step = rule.steps[embed.sourceStep]
  if (step) {
    embed.name = step.resultAlias || ''
  }
}

const addEmbed = (rule, stepIdx = 0) => {
  const embed = createDefaultEmbed(stepIdx)
  const step = rule.steps[stepIdx]
  if (step) {
    embed.name = step.resultAlias || ''
  }
  rule.embeds.push(embed)
}

const addStep = (rule) => {
  rule.steps.push(createDefaultStep())
}

const removeStep = (rule, index) => {
  rule.steps.splice(index, 1)
}

const removeEmbed = (rule, index) => {
  rule.embeds.splice(index, 1)
}

const addRule = () => {
  form.rules.push({
    name: '',
    expanded: true,
    frequencyCycle: 'monthly_natural',
    frequencyNode: 'current_m1',
    dependItems: [],
    crossRuleDeps: [],
    roundingMode: 'round',
    decimalPlaces: '0',
    steps: [createDefaultStep()],
    embeds: [createDefaultEmbed()],
    hasExternal: false,
    externalService: '',
    externalResultField: ''
  })
}

const removeRule = (index) => {
  form.rules.splice(index, 1)
}

const moveRule = (index, direction) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= form.rules.length) return
  const rule = form.rules.splice(index, 1)[0]
  form.rules.splice(newIndex, 0, rule)
}

const getRuleSummary = (rule) => {
  const depNames = rule.dependItems.map(d => d.name).slice(0, 3).join(', ')
  const stepName = rule.steps[0]?.resultAlias || '未命名'
  const embedName = rule.embeds[0]?.name || ''
  return `${depNames || '无依赖'} → ${stepName} → ${embedName}`
}

// 跨规则引用解析
const parseCrossRuleRef = (ref) => {
  const parts = ref.split('_')
  return {
    ruleIndex: parseInt(parts[1]),
    stepIndex: parseInt(parts[2])
  }
}

const getCrossRuleLabel = (ruleIndex, stepIndex) => {
  const rule = form.rules[ruleIndex]
  const step = rule?.steps[stepIndex]
  return `规则${ruleIndex + 1}/${step?.resultAlias || '步骤' + (stepIndex + 1)}`
}

// 循环依赖检测
const hasCircularDependency = (fromRule, toRule, visited) => {
  if (fromRule === toRule) return true
  if (visited.has(fromRule)) return false
  visited.add(fromRule)

  const rule = form.rules[fromRule]
  if (!rule) return false

  for (const step of rule.steps) {
    for (const branch of step.branches) {
      for (const cond of branch.conditions) {
        if (cond.field?.startsWith('rule_')) {
          const { ruleIndex } = parseCrossRuleRef(cond.field)
          if (hasCircularDependency(ruleIndex, toRule, visited)) return true
        }
      }
    }
  }
  return false
}

const validateCircularDependency = () => {
  for (let i = 0; i < form.rules.length; i++) {
    const rule = form.rules[i]

    for (let j = 0; j < rule.steps.length; j++) {
      const step = rule.steps[j]

      for (const branch of step.branches) {
        for (const cond of branch.conditions) {
          if (cond.field?.startsWith('rule_')) {
            const { ruleIndex } = parseCrossRuleRef(cond.field)
            if (hasCircularDependency(ruleIndex, i, new Set())) {
              ElMessage.error(`规则${i + 1}与规则${ruleIndex + 1}存在循环依赖`)
              return false
            }
          }
        }
      }
    }
  }
  return true
}

// 插入其他规则的结果到公式
const insertFormulaFromOtherRule = (branch, refText) => {
  if (branch) {
    branch.formula = (branch.formula || '') + refText
  }
}

// 当前激活的分支（用于公式插入）
const setActiveBranch = (branch) => {
  activeBranch = branch
}

// 变更处理
const handleStrategyChange = () => {}

const handleFrequencyCycleChange = (rule) => {
  rule.frequencyNode = ''
}

const getFrequencyNodes = (cycle) => {
  if (cycle === 'daily') {
    return [{ label: '次日', value: 'next_day' }]
  }
  if (cycle === 'weekly') {
    return [
      { label: '次周 周一', value: 'next_week_mon' },
      { label: '次周 周二', value: 'next_week_tue' },
      { label: '次周 周三', value: 'next_week_wed' },
      { label: '次周 周四', value: 'next_week_thu' },
      { label: '次周 周五', value: 'next_week_fri' },
      { label: '次周 周六', value: 'next_week_sat' },
      { label: '次周 周日', value: 'next_week_sun' }
    ]
  }
  if (cycle === 'monthly_natural' || cycle === 'monthly_business') {
    return [
      { label: '当月 M1日', value: 'current_m1' },
      { label: '次月 M1日', value: 'next_m1' }
    ]
  }
  return []
}

const handlePayslipChange = (rule) => {
  rule.targetGroup = null
}

const getServiceResultFields = (serviceType) => {
  const fields = {
    tax: [
      { label: '税额 (tax_amount)', value: 'tax_amount' },
      { label: '税率 (tax_rate)', value: 'tax_rate' },
      { label: '应税收入 (taxable_income)', value: 'taxable_income' },
      { label: '速算扣除数 (quick_deduction)', value: 'quick_deduction' }
    ],
    negative_wage_deduct: [
      { label: '抵扣前余额 (before)', value: 'before' },
      { label: '本次抵扣金额 (deduction)', value: 'deduction' },
      { label: '剩余余额 (remaining)', value: 'remaining' },
      { label: '状态 (status)', value: 'status' }
    ]
  }
  return fields[serviceType] || []
}

// 保存
const saveStrategy = () => {
  if (!form.name) {
    ElMessage.warning('请输入策略名称')
    return
  }
  if (!form.strategyId) {
    ElMessage.warning('请选择关联发放策略')
    return
  }
  if (form.dateRange.length !== 2) {
    ElMessage.warning('请选择有效期')
    return
  }
  // 检查循环依赖
  if (!validateCircularDependency()) {
    return
  }
  // 规则名称检查（可选，只要有步骤结果即可）
  for (let i = 0; i < form.rules.length; i++) {
    const rule = form.rules[i]
    const stepCount = rule.steps.filter(s => s.resultAlias).length
    if (stepCount === 0) {
      ElMessage.warning(`规则${i + 1}：请至少添加一个步骤并输入结果名称`)
      return
    }
  }

  ElMessage.success('保存成功')
  router.push('/dependency-calculation')
}

// 返回
const goBack = () => {
  router.push('/dependency-calculation')
}

// 初始化
onMounted(() => {
  if (isEdit.value) {
    form.id = route.query.id
    // 根据ID加载对应的模拟数据
    const strategyData = strategies.value.find(s => s.id === Number(route.query.id))
    if (strategyData) {
      form.name = strategyData.name
      form.strategyId = strategyData.strategyId
      form.dateRange = [strategyData.startDate, strategyData.endDate]
      // 转换列表数据为表单格式
      form.rules = strategyData.rules.map(r => ({
        name: r.name || '',
        expanded: true,
        frequencyCycle: r.frequency.includes('自然') ? 'monthly_natural' : 'monthly_business',
        frequencyNode: r.frequencyNode || 'current_m1',
        dependItems: r.dependItems || [],
        crossRuleDeps: r.crossRuleDeps || [],
        roundingMode: 'round',
        decimalPlaces: '0',
        steps: r.steps.map((s, idx) => {
          const isExternal = s.formula?.includes('TAX') || s.formula?.includes('外部服务') || s.formula?.includes('负工资')
          const isNegativeWage = s.formula?.includes('负工资')
          return {
            stepType: isExternal ? 'external' : 'internal',
            resultAlias: s.resultAlias || '',
            branches: s.branches || [{ conditions: [], formula: s.formula || '' }],
            externalService: isExternal ? (isNegativeWage ? 'negative_wage_deduct' : 'tax') : '',
            externalInput: isExternal ? 0 : null,
            externalResultField: isNegativeWage ? 'deduction' : 'tax_amount'
          }
        }),
        embeds: r.embeds.map(e => ({
          sourceStep: e.sourceStep !== undefined ? e.sourceStep : 0,
          name: e.name || '',
          resultType: e.resultType === '薪酬项' ? 'salary' : 'deduction',
          paymentType: e.paymentType === '常乐豆' ? 'bean' : 'cash',
          targetPayslip: e.targetPayslip === '常乐豆工资条' ? 1 : e.targetPayslip === '兼职工资条1' ? 5 : e.targetPayslip === '兼职工资条2' ? 6 : e.targetPayslip === '兼职工资条3' ? 7 : e.targetPayslip === '兼职工资条4' ? 8 : 1,
          targetGroup: 1
        }))
      }))
    }
  } else {
    form.rules = [{
      name: '',
      expanded: true,
      frequencyCycle: 'monthly_natural',
      frequencyNode: 'current_m1',
      dependItems: [],
      roundingMode: 'round',
      decimalPlaces: '0',
      steps: [createDefaultStep()],
      embeds: [createDefaultEmbed()]
    }]
  }
})
</script>

<style scoped>
.strategy-form-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-back {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  cursor: pointer;
  font-size: 14px;
}

.header-back:hover {
  color: #a40035;
}

.page-header h1 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.content-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 100%;
  overflow-x: auto;
}

.strategy-form {
  max-width: 1400px;
  width: 100%;
}

.date-range-split {
  display: flex;
  align-items: center;
}

.rule-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.rules-overview {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.rule-summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
  cursor: pointer;
}

.rule-summary-item:hover {
  background: #f5f5f5;
}

.rule-summary-item:last-of-type {
  border-bottom: none;
}

.rule-index {
  width: 24px;
  height: 24px;
  background: #a40035;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.rule-summary-text {
  flex: 1;
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rule-summary-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rule-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  cursor: pointer;
  margin-right: 8px;
  font-size: 14px;
  color: #666;
}

.expand-icon:hover {
  color: #a40035;
}

.rule-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.rule-form .el-form-item {
  margin-bottom: 16px;
}

.result-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.inline-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

.frequency-config {
  display: flex;
  align-items: center;
  gap: 8px;
}

.depend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.depend-items-header {
  width: 100%;
  border-bottom: 1px dashed #eee;
  padding-bottom: 8px;
}

.depend-items-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.depend-group {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 12px;
  margin-bottom: 6px;
}

.depend-group-label {
  font-size: 12px;
  color: #999;
  padding: 2px 6px;
  background: #f5f5f5;
  border-radius: 4px;
}

.depend-tag {
  background: #fff7f7;
  border-color: #a40035;
  color: #a40035;
}

.cross-rule-deps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.cross-rule-deps-header {
  width: 100%;
  border-bottom: 1px dashed #eee;
  padding-bottom: 8px;
}

.cross-rule-deps-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cross-rule-deps-empty {
  padding: 4px 0;
}

.empty-text {
  font-size: 13px;
  color: #999;
}

.cross-rule-dep-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cross-rule-dep-item {
  padding: 8px 12px;
  border: 1px solid #eee;
  border-radius: 6px;
}

.cross-rule-dep-header {
  margin-bottom: 6px;
}

.cross-rule-name {
  font-weight: 500;
  color: #333;
}

.cross-rule-dep-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-left: 22px;
}

.formula-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 10px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.step-config {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-config-label {
  font-size: 13px;
  color: #666;
}

.step-type-group {
  margin-bottom: 0;
}

.step-internal {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-formula-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff7f7;
  border-radius: 4px;
  margin-bottom: 4px;
}

.step-type-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.step-type-label {
  font-size: 13px;
  color: #666;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.step-result-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #fff7f7;
  border-radius: 4px;
  margin-bottom: 6px;
}

.result-name {
  font-size: 15px;
  font-weight: 600;
  color: #a40035;
}

.result-hint {
  font-size: 12px;
  color: #666;
}

.condition-config {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 6px;
  max-width: 1000px;
}

.step-result-line {
  padding: 4px 0;
  margin-bottom: 4px;
}

.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.condition-title {
  font-size: 12px;
  color: #666;
}

.condition-empty {
  padding: 4px 0;
  text-align: center;
}

.no-condition-hint {
  font-size: 12px;
  color: #999;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.branch-item {
  background: #fff;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 6px;
  border-left: 3px solid #a40035;
}

.branch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.branch-title {
  font-size: 13px;
  font-weight: 600;
  color: #a40035;
  padding: 2px 8px;
  background: #fff7f7;
  border-radius: 4px;
  margin-right: 8px;
}

.branch-hint {
  font-size: 12px;
  color: #999;
  flex: 1;
}

.branch-conditions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.branch-conditions-hint {
  font-size: 12px;
  color: #666;
  padding: 4px 0;
}

.hint-text {
  color: #666;
}

.cond-tag {
  cursor: default;
}

.condition-editor {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cond-label {
  font-size: 12px;
  color: #666;
  min-width: 32px;
}

.branch-formula-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 1000px;
}

.formula-hints {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.formula-tag {
  cursor: pointer;
  font-size: 12px;
}

.formula-tag:hover {
  background: #a40035;
  color: #fff;
}

.formula-sep {
  color: #ddd;
  margin: 0 2px;
}

.formula-refs-other-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #eee;
}

.formula-ref-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ref-label {
  font-size: 11px;
  color: #999;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.formula-ref-tag {
  cursor: pointer;
  background: #f0f0f0;
  border-color: #ccc;
}

.formula-ref-tag:hover {
  background: #a40035;
  color: #fff;
  border-color: #a40035;
}

.branch-formula-label {
  font-size: 14px;
  font-weight: 500;
  color: #a40035;
  white-space: nowrap;
  min-width: 80px;
}

.step-formula-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

.step-formula-display {
  font-size: 14px;
  font-weight: 500;
  color: #a40035;
  white-space: nowrap;
  min-width: 80px;
}

.step-formula {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  margin-top: 8px;
}

.formula-tools {
  margin-left: 4px;
}

.formula-popover {
  padding: 4px 0;
}

.formula-group-title {
  font-size: 12px;
  color: #999;
  padding: 4px 12px;
  margin-bottom: 4px;
}

.formula-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 0 12px;
}

.formula-btns .el-button {
  margin: 0;
}

.formula-refs {
  padding: 0 12px;
}

.formula-ref-group {
  margin-bottom: 8px;
}

.ref-label {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.ref-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ref-tag {
  cursor: pointer;
  font-size: 11px;
}

.step-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.step-external {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #fff7f7;
  border-radius: 4px;
  border-left: 3px solid #a40035;
}

.external-config {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.external-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.external-label {
  font-size: 12px;
  color: #666;
  min-width: 50px;
}

.result-embedding {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-x: hidden;
}

.embed-form-header {
  display: flex;
  gap: 16px;
  padding: 0 8px;
}

.embed-col-label {
  font-size: 12px;
  color: #666;
  flex: 1.5;
  min-width: 150px;
}

.embed-item {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;
  overflow-x: auto;
}

.embed-form {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.embed-form > .el-select,
.embed-form > .el-input {
  flex: 1;
  min-width: 120px;
}

.embed-form > .el-select:nth-child(3),
.embed-form > .el-select:nth-child(4) {
  flex: 0;
  min-width: 100px;
}

.embed-form > .el-select:nth-child(5),
.embed-form > .el-select:nth-child(6) {
  flex: 0;
  min-width: 120px;
}

.embed-form > .el-button {
  flex: 0;
  min-width: auto;
  margin-left: auto;
}

.embed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.embed-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.embed-label {
  font-size: 13px;
  color: #666;
}

.embed-arrow {
  color: #666;
  margin: 0 4px;
}

.external-service {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.external-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.service-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-hint {
  font-size: 12px;
  color: #666;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  border-left: 3px solid #a40035;
}

.service-result {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-label {
  font-size: 13px;
  color: #666;
}

.form-actions {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 12px;
}

.search-box {
  margin-bottom: 16px;
}

.depend-item-list {
  max-height: 400px;
  overflow-y: auto;
}

.depend-item-group {
  margin-bottom: 16px;
}

.group-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 8px;
}

.payslip-sub-group {
  margin-bottom: 12px;
}

.payslip-title {
  font-size: 12px;
  color: #999;
  padding: 4px 0;
  margin-left: 8px;
}

.payslip-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-left: 8px;
}

.payslip-items .depend-item-option {
  min-width: 160px;
  padding: 10px 14px;
}

.group-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.depend-item-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 160px;
}

.depend-item-option:hover {
  border-color: #a40035;
  background: #fff7f7;
}

.depend-item-option.selected {
  border-color: #a40035;
  background: #fff7f7;
}

.item-name {
  font-size: 14px;
  color: #333;
}
</style>