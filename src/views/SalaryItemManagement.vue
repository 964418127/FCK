<template>
  <div class="salary-item-management">
    <div class="page-header">
      <h1>薪酬项配置</h1>
      <p class="tip">💡 配置薪酬计算规则，管理薪酬项的基础信息与计算公式</p>
    </div>

    <div class="content-section">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="searchForm.keyword" placeholder="搜索编号或名称" clearable style="width: 160px;" />
          <el-select v-model="searchForm.targetPost" placeholder="岗位对象" clearable style="width: 120px;">
            <el-option label="推拿师" value="推拿师" />
            <el-option label="客户经理" value="客户经理" />
            <el-option label="总部岗位" value="总部岗位" />
          </el-select>
          <el-select v-model="searchForm.type" placeholder="类型" clearable style="width: 100px;">
            <el-option label="补贴" value="补贴" />
            <el-option label="绩效" value="绩效" />
            <el-option label="奖金" value="奖金" />
            <el-option label="扣款" value="扣款" />
          </el-select>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
        <div class="toolbar-right">
          <el-button @click="openTypeConfig">类型配置</el-button>
          <el-button type="primary" @click="openAddDialog">+ 新增薪酬项</el-button>
        </div>
      </div>

      <!-- 薪酬项列表 -->
      <el-table :data="pagedRows" stripe style="width: 100%; margin-top: 16px;">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="薪酬项名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="postBelong" label="岗位归属" width="100">
          <template #default="{ row }">
            {{ row.postBelong }}
          </template>
        </el-table-column>
        <el-table-column prop="targetPost" label="岗位对象" width="120" />
        <el-table-column prop="cooperateMode" label="匹配合作模式" width="120" />
        <el-table-column prop="calcLevel" label="计算层级" width="100">
          <template #default="{ row }">
            第{{ row.calcLevel }}级
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="openDetailDialog(row)">详情</el-button>
            <el-button type="primary" size="small" link @click="openEditDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />

      <el-empty v-if="filteredSalaryItems.length === 0" description="暂无薪酬项" />
    </div>

    <!-- 新增/编辑薪酬项弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑薪酬项' : '新增薪酬项'"
      width="960px"
      @close="handleDialogClose"
      class="salary-item-dialog"
    >
      <div class="dialog-section">
        <div class="section-title">一、基础信息配置</div>

        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="薪酬项名称" prop="name">
                <el-input v-model="form.name" placeholder="如：超产值奖金（月）" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="薪酬项类型" prop="type">
                <el-select v-model="form.type" placeholder="请选择" style="width: 100%;">
                  <el-option label="补贴" value="补贴" />
                  <el-option label="绩效" value="绩效" />
                  <el-option label="奖金" value="奖金" />
                  <el-option label="扣款" value="扣款" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="岗位归属" prop="postBelong">
                <el-select v-model="form.postBelong" placeholder="请选择" style="width: 100%;">
                  <el-option label="业务" value="业务" />
                  <el-option label="职能" value="职能" />
                  <el-option label="管理" value="管理" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="岗位对象" prop="targetPost">
                <el-select v-model="form.targetPost" placeholder="请选择" style="width: 100%;">
                  <el-option label="推拿师" value="推拿师" />
                  <el-option label="客户经理" value="客户经理" />
                  <el-option label="总部岗位" value="总部岗位" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="匹配合作模式" prop="cooperateMode">
                <el-select v-model="form.cooperateMode" placeholder="请选择" style="width: 100%;">
                  <el-option label="劳务合作" value="劳务合作" />
                  <el-option label="劳动合同" value="劳动合同" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计算层级" prop="calcLevel">
                <el-select v-model="form.calcLevel" placeholder="请选择" style="width: 100%;">
                  <el-option label="第1级" :value="1" />
                  <el-option label="第2级" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="dialog-section">
        <div class="section-title">二、薪酬条件计算公式配置</div>

        <!-- 数据对象配置 -->
        <div class="sub-section">
          <div class="sub-section-header">
            <span class="sub-title">1. 配置数据对象</span>
            <el-button type="primary" link @click="addDataObject">+ 新增数据对象</el-button>
          </div>
          <el-table :data="form.dataObjects" border size="small" style="width: 100%;">
            <el-table-column label="编号" width="60" type="index" />
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-select v-model="row.objType" size="small">
                  <el-option label="系统" value="系统" />
                  <el-option label="订单" value="订单" />
                  <el-option label="人事" value="人事" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数据对象" min-width="150">
              <template #default="{ row }">
                <el-select v-model="row.objName" size="small" style="width: 100%;">
                  <el-option label="系统标准参数" value="系统标准参数" />
                  <el-option label="订单（通用标准）" value="订单（通用标准）" />
                  <el-option label="人事（绩效目标）" value="人事（绩效目标）" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="关联数据时间" min-width="120">
              <template #default="{ row }">
                <el-select v-model="row.relatedTimeField" size="small" style="width: 100%;">
                  <el-option label="订单日期" value="订单日期" />
                  <el-option label="结算日期" value="结算日期" />
                  <el-option label="创建日期" value="创建日期" />
                  <el-option label="完成日期" value="完成日期" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60">
              <template #default="{ row, $index }">
                <el-button type="danger" link size="small" @click="removeDataObject($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 综合筛选配置 -->
        <div class="sub-section">
          <div class="sub-section-header">
            <span class="sub-title">2. 综合筛选</span>
            <el-button type="primary" link @click="addFilterCondition">+ 新增筛选条件</el-button>
          </div>
          <el-table :data="form.filterConditions" border size="small" style="width: 100%;">
            <el-table-column label="编号" width="60" type="index" />
            <el-table-column label="字段" width="120">
              <template #default="{ row }">
                <el-select v-model="row.field" size="small">
                  <el-option label="人员" value="人员" />
                  <el-option label="订单类型" value="订单类型" />
                  <el-option label="订单状态" value="订单状态" />
                  <el-option label="社保购买状态" value="社保购买状态" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="判断符" width="100">
              <template #default="{ row }">
                <el-select v-model="row.operator" size="small">
                  <el-option label="等于" value="等于" />
                  <el-option label="不等于" value="不等于" />
                  <el-option label="大于" value="大于" />
                  <el-option label="小于" value="小于" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="值类型" width="100">
              <template #default="{ row }">
                <el-select v-model="row.valueType" size="small">
                  <el-option label="引用" value="引用" />
                  <el-option label="固定值" value="固定值" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="筛选值" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.filterValue" size="small" placeholder="筛选值" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60">
              <template #default="{ row, $index }">
                <el-button type="danger" link size="small" @click="removeFilterCondition($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="filter-tip">注：所有条件默认按"且"关系生效</div>
        </div>

        <!-- 薪酬项计算公式配置 -->
        <div class="sub-section">
          <div class="sub-section-header">
            <span class="sub-title">3. 薪酬项计算公式</span>
          </div>

          <!-- 计算规则配置 -->
          <div class="calc-rules">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="数据取整模式" size="small">
                  <el-select v-model="form.calcRule.roundingMode" style="width: 100%;">
                    <el-option label="四舍五入" value="四舍五入" />
                    <el-option label="向上取整" value="向上取整" />
                    <el-option label="向下取整" value="向下取整" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="数据格式" size="small">
                  <el-select v-model="form.calcRule.decimalPlaces" style="width: 100%;">
                    <el-option label="保留两位小数" value="2" />
                    <el-option label="保留一位小数" value="1" />
                    <el-option label="整数" value="0" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="发放形式" size="small">
                  <el-select v-model="form.calcRule.paymentForm" style="width: 100%;">
                    <el-option label="现金" value="现金" />
                    <el-option label="常乐豆" value="常乐豆" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 计算方式选择 -->
          <!-- 分支条件与计算公式 -->
          <div class="branch-section">
            <div class="branch-header">
              <span>分支条件与计算公式</span>
              <el-button type="primary" link @click="addBranch">+ 新增薪酬项计算分支</el-button>
            </div>

            <div v-for="(branch, bIdx) in form.branches" :key="bIdx" class="branch-item">
              <div class="branch-title">分支 {{ bIdx + 1 }}</div>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="条件类型" size="small">
                    <el-radio-group v-model="branch.conditionType" size="small">
                      <el-radio-button label="所有" value="所有" />
                      <el-radio-button label="字段筛选" value="字段筛选" />
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 字段筛选条件 -->
              <div v-if="branch.conditionType === '字段筛选'" class="branch-filter">
                <el-table :data="branch.filterConditions" border size="small" style="width: 100%;">
                  <el-table-column label="编号" width="60" type="index" />
                  <el-table-column label="字段" width="120">
                    <template #default="{ row }">
                      <el-select v-model="row.field" size="small">
                        <el-option label="人员" value="人员" />
                        <el-option label="订单类型" value="订单类型" />
                        <el-option label="订单状态" value="订单状态" />
                        <el-option label="社保购买状态" value="社保购买状态" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="判断符" width="100">
                    <template #default="{ row }">
                      <el-select v-model="row.operator" size="small">
                        <el-option label="等于" value="等于" />
                        <el-option label="不等于" value="不等于" />
                        <el-option label="大于" value="大于" />
                        <el-option label="小于" value="小于" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="值类型" width="100">
                    <template #default="{ row }">
                      <el-select v-model="row.valueType" size="small">
                        <el-option label="引用" value="引用" />
                        <el-option label="固定值" value="固定值" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="筛选值" min-width="120">
                    <template #default="{ row }">
                      <el-input v-model="row.filterValue" size="small" placeholder="筛选值" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="60">
                    <template #default="{ row, $index }">
                      <el-button type="danger" link size="small" @click="removeBranchFilter(bIdx, $index)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button type="primary" link size="small" @click="addBranchFilter(bIdx)" style="margin-top: 8px;">+ 新增筛选条件</el-button>
              </div>

              <el-row :gutter="20" style="margin-top: 12px;">
                <el-col :span="24">
                  <el-form-item label="计算公式" size="small">
                    <el-input v-model="branch.formula" placeholder="如：订单金额 × ((订单金额 - 目标产值) ÷ 1000 × 1%)" />
                  </el-form-item>
                  <div class="formula-helper">
                    <span class="helper-label">点击添加运算符：</span>
                    <el-button size="small" @click="insertFormula(branch, '(')">&#40;</el-button>
                    <el-button size="small" @click="insertFormula(branch, ')')">&#41;</el-button>
                    <el-button size="small" @click="insertFormula(branch, '+')">+</el-button>
                    <el-button size="small" @click="insertFormula(branch, '-')">-</el-button>
                    <el-button size="small" @click="insertFormula(branch, '*')">*</el-button>
                    <el-button size="small" @click="insertFormula(branch, '/')">/</el-button>
                    <el-button size="small" @click="insertFormula(branch, '求和()')">求和</el-button>
                    <el-button size="small" @click="insertFormula(branch, '平均值()')">平均值</el-button>
                    <el-button size="small" @click="insertFormula(branch, '最大值()')">最大值</el-button>
                    <el-button size="small" @click="insertFormula(branch, '最小值()')">最小值</el-button>
                    <el-button size="small" @click="insertFormula(branch, '向上取整()')">向上取整</el-button>
                    <el-button size="small" @click="insertFormula(branch, '向下取整()')">向下取整</el-button>
                    <!-- 数据源函数入口暂不开放：插入按钮隐藏，已有配置的 chip 仍可查看 -->
                    <el-button size="small" type="primary" plain @click="openParamFunctionDialog(branch, null)">通用参数</el-button>
                  </div>
                  <div v-if="branch.dsFunctions && branch.dsFunctions.length" class="ds-chips-row">
                    <span class="ds-chips-label">数据源函数：</span>
                    <span
                      v-for="dsf in branch.dsFunctions"
                      :key="dsf.uid"
                      class="ds-chip"
                      @click="openDsFunctionDialog(branch, dsf)"
                    >{{ dsf.token }}</span>
                  </div>
                  <div v-if="branch.paramFunctions && branch.paramFunctions.length" class="param-refs">
                    <div
                      v-for="pf in branch.paramFunctions"
                      :key="pf.uid"
                      class="param-ref"
                      @click="openParamFunctionDialog(branch, pf)"
                    >
                      <div class="param-ref-head">
                        <span class="param-ref-name">{{ paramRefName(pf) }}</span>
                        <span class="param-ref-ops">
                          <span class="param-ref-op" @click.stop="openParamFunctionDialog(branch, pf)">修改</span>
                          <span class="param-ref-op danger" @click.stop="removeParamRef(branch, pf)">移除</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
              <div class="branch-action">
                <el-button type="danger" link size="small" @click="removeBranch(bIdx)">删除分支</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据源函数配置弹窗 -->
      <el-dialog
        v-model="dsDialogVisible"
        title="插入数据源函数"
        width="800px"
        append-to-body
        destroy-on-close
      >
        <el-form label-width="100px" size="small">
          <el-form-item label="选择策略">
            <el-select v-model="dsForm.strategyId" placeholder="选择数据源策略" filterable style="width: 100%;" @change="onDsStrategyChange">
              <el-option
                v-for="s in storeStrategies"
                :key="s.id"
                :label="s.name"
                :value="s.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="dsForm.strategyId" label="可用返回值">
            <span v-for="k in dsReturnKeys" :key="k" class="return-key-chip">{{ k }}</span>
            <span v-if="!dsReturnKeys.length" class="strategy-hint">该策略暂无返回值</span>
          </el-form-item>
          <el-form-item v-if="dsForm.strategyId && dsForm.paramMappings.length" label="参数映射">
            <el-table :data="dsForm.paramMappings" border size="small" style="width: 100%;">
              <el-table-column label="策略参数" prop="name" width="140" />
              <el-table-column label="类型" prop="type" width="110">
                <template #default="{ row }">
                  {{ INPUT_PARAM_TYPE_LABELS[row.type] || row.type || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="说明" prop="desc" width="160" />
              <el-table-column label="传入值（订单字段）" min-width="180">
                <template #default="{ row }">
                  <el-select v-model="row.mappedField" placeholder="选择或输入字段" size="small" filterable allow-create default-first-option style="width: 100%;">
                    <el-option v-for="f in CONTEXT_FIELDS" :key="f" :label="f" :value="f" />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item v-if="dsForm.strategyId" label="返回值Key" required>
            <el-select v-model="dsForm.returnKey" placeholder="选择返回值Key" size="small" style="width: 100%;">
              <el-option v-for="k in dsReturnKeys" :key="k" :label="k" :value="k" />
            </el-select>
            <span v-if="!dsReturnKeys.length" class="strategy-hint">该策略暂无返回值定义</span>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dsDialogVisible = false">取消</el-button>
          <el-button v-if="dsEditingUid" type="danger" link @click="removeDsFunction">移除</el-button>
          <el-button type="primary" @click="confirmDsFunction">{{ dsEditingUid ? '更新' : '插入函数' }}</el-button>
        </template>
      </el-dialog>

      <!-- 通用参数插入弹窗 -->
      <el-dialog
        v-model="paramDialogVisible"
        title="插入通用参数"
        width="800px"
        append-to-body
        destroy-on-close
      >
        <el-form label-width="100px" size="small">
          <el-form-item label="选择参数">
            <el-select v-model="paramForm.paramId" placeholder="选择通用参数" filterable style="width: 100%;" @change="onParamChange">
              <el-option
                v-for="p in enabledParams"
                :key="p.id"
                :label="`${p.name}（数据表）`"
                :value="p.id"
              />
            </el-select>
            <span class="strategy-hint">只提供通用参数里的数据表：简单值没有取值要求，直接在公式框里写</span>
          </el-form-item>
          <el-form-item v-if="selectedParam && isParamTable" label="取值函数">
            <div class="prio-box">
              <el-radio-group v-model="paramForm.mode" size="small" class="prio-mode" @change="onParamModeChange">
                <el-radio value="single">取 1 列（第一个取到值的列生效）</el-radio>
                <el-radio value="sum">取多列相加（各自穿透后求和）</el-radio>
              </el-radio-group>
              <div class="rowmode-line">
                <span class="rowmode-label">取值列</span>
                <el-select v-model="paramForm.valueCols" multiple size="small" style="flex: 1;" placeholder="选择取值列">
                  <el-option v-for="c in valueColOptions" :key="c.name" :label="colOptionLabel(c)" :value="c.name" />
                </el-select>
              </div>
              <p v-if="paramForm.mode === 'sum' && !numericCols.length" class="strategy-hint warn">这张表没有数值列，不能相加。</p>
              <p class="strategy-hint block">{{ paramForm.mode === 'single'
                ? '按选择顺序，第一个有值的列生效；显式 0 也算值；所有列都取不到时按取不到值提示，不按 0 计。'
                : '只可选数值列；各列分别取第一个有值的再相加，取不到按 0。' }}</p>
            </div>
          </el-form-item>
          <el-form-item v-if="selectedParam && isParamTable" label="查询条件">
            <div class="cond-box">
              <div v-for="(row, i) in paramForm.conds" :key="i" class="cond-row">
                <el-select v-model="row.col" placeholder="条件列" size="small" class="cond-col" @change="onCondColChange(row)">
                  <el-option v-for="c in conditionColOptions(row)" :key="c.name" :label="c.name" :value="c.name" />
                </el-select>
                <el-select v-model="row.op" size="small" class="cond-op">
                  <el-option v-for="o in opsForRow(row)" :key="o.value" :label="`${o.symbol} ${o.label}`" :value="o.value" />
                </el-select>
                <el-select
                  v-model="row.fact"
                  placeholder="传入的值（上下文）"
                  size="small"
                  clearable
                  filterable
                  allow-create
                  default-first-option
                  class="cond-fact"
                >
                  <el-option v-for="f in CONTEXT_FIELDS" :key="f" :label="f" :value="f" />
                </el-select>
                <el-button size="small" link type="danger" @click="removeCondition(i)">删除</el-button>
              </div>
              <div v-if="!paramForm.conds.length" class="cond-empty">还没有查询条件</div>
              <el-button size="small" plain type="primary" :disabled="!conditionColOptions().length" @click="addCondition">+ 添加条件</el-button>
              <p v-if="uncoveredCols.length" class="strategy-hint block warn">
                这些列还没配条件，表里有值的行不会参与：{{ uncoveredCols.join('、') }}
              </p>
              <p class="strategy-hint block">
                按「条件列 符号 传入值」读：行里这一列有值就要传入并命中，留空不约束；都没命中就取条件列全空的通用行。
              </p>
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="paramDialogVisible = false">取消</el-button>
          <el-button v-if="paramEditingUid" type="danger" link @click="removeParamFunction">移除</el-button>
          <el-button type="primary" @click="confirmParamFunction">{{ paramEditingUid ? '更新' : '插入参数' }}</el-button>
        </template>
      </el-dialog>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

// 薪酬项列表数据
const salaryItems = ref([
  // 兼职薪酬项
  {
    id: 1,
    name: '兼职-计件提成',
    type: '绩效',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳务合作',
    calcLevel: 1,
    updateTime: '2026-01-15 10:30:00'
  },
  {
    id: 2,
    name: '兼职-超产值奖金',
    type: '补贴',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳务合作',
    calcLevel: 1,
    updateTime: '2026-01-15 10:30:00'
  },
  {
    id: 3,
    name: '兼职-超时加班费',
    type: '绩效',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳务合作',
    calcLevel: 1,
    updateTime: '2026-01-17 09:15:00'
  },
  {
    id: 4,
    name: '兼职-投诉扣款',
    type: '扣缴项',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳务合作',
    calcLevel: 1,
    updateTime: '2026-01-20 09:00:00'
  },
  // 全职薪酬项
  {
    id: 5,
    name: '全职-计件提成',
    type: '绩效',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳动合同',
    calcLevel: 1,
    updateTime: '2026-01-16 14:20:00'
  },
  {
    id: 6,
    name: '全职-超产值奖金',
    type: '补贴',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳动合同',
    calcLevel: 1,
    updateTime: '2026-01-16 14:25:00'
  },
  {
    id: 7,
    name: '全职-超时加班费',
    type: '绩效',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳动合同',
    calcLevel: 1,
    updateTime: '2026-01-17 09:15:00'
  },
  {
    id: 8,
    name: '全职-投诉扣款',
    type: '扣缴项',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳动合同',
    calcLevel: 1,
    updateTime: '2026-01-20 09:00:00'
  },
  // 补充项
  {
    id: 9,
    name: '保底获豆',
    type: '绩效',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳务合作',
    calcLevel: 2,
    updateTime: '2026-01-18 11:00:00'
  }
])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  targetPost: '',
  type: ''
})

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentEditId = ref(null)

const form = reactive({
  name: '',
  type: '',
  postBelong: '',
  targetPost: '',
  cooperateMode: '',
  calcLevel: 1,
  // 数据对象
  dataObjects: [
    { objType: '系统', objName: '系统标准参数', relatedTimeField: '订单日期' }
  ],
  // 综合筛选
  filterConditions: [
    { field: '人员', operator: '等于', valueType: '引用', filterValue: '销售/业务人员', description: '限定计算对象' }
  ],
  // 计算规则
  calcRule: {
    roundingMode: '四舍五入',
    decimalPlaces: '2',
    paymentForm: '现金'
  },
  paramMappings: [
    { paramKey: '实付金额', orderField: '实付金额', paramDesc: '订单实付金额' },
    { paramKey: '原价', orderField: '', paramDesc: '订单原价' },
    { paramKey: '订单数量', orderField: '', paramDesc: '周期内订单数' }
  ],
  // 分支条件
  branches: [
    { conditionType: '所有', filterConditions: [], formula: '', logicDesc: '', dsFunctions: [] }
  ]
})

const rules = {
  name: [{ required: true, message: '请输入薪酬项名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择薪酬项类型', trigger: 'change' }],
  postBelong: [{ required: true, message: '请选择岗位归属', trigger: 'change' }],
  targetPost: [{ required: true, message: '请选择岗位对象', trigger: 'change' }],
  cooperateMode: [{ required: true, message: '请选择匹配合作模式', trigger: 'change' }]
}

// 过滤后的薪酬项列表
const router = useRouter()
import { storeSalaryStrategies as storeStrategies, INPUT_PARAM_TYPE_LABELS } from '../mock/storeSalaryStrategies.js'
import { paramList } from '../mock/generalParamStore.js'
import { opsForType } from '../mock/generalParams.js'
import { usePager } from '../composables/usePager.js'
import TablePagination from '../components/TablePagination.vue'
// ============ 数据源函数弹窗 ============
const dsDialogVisible = ref(false)
const dsTargetBranch = ref(null)
const dsEditingUid = ref(null)
const dsForm = reactive({
  strategyId: '',
  paramMappings: [],
  returnKey: ''
})
let dsUidCounter = 0

const dsReturnKeys = computed(() => {
  if (!dsForm.strategyId) return []
  const s = storeStrategies.find(x => x.id === dsForm.strategyId)
  if (!s || !s.rules) return []
  const keys = new Set()
  s.rules.forEach(r => {
    (r.returnValues || []).forEach(rv => {
      if (rv.key) keys.add(rv.key)
    })
  })
  return [...keys]
})

const onDsStrategyChange = () => {
  const s = storeStrategies.find(x => x.id === dsForm.strategyId)
  if (!s || !s.inputParams) { dsForm.paramMappings = []; return }
  dsForm.paramMappings = s.inputParams.map(p => ({
    name: p.name, type: p.type || 'string', desc: p.desc || '', mappedField: p.name
  }))
  dsForm.returnKey = ''
}

const openDsFunctionDialog = (branch, existing) => {
  dsTargetBranch.value = branch
  if (!branch.dsFunctions) branch.dsFunctions = []
  if (existing) {
    dsEditingUid.value = existing.uid
    dsForm.strategyId = existing.strategyId
    dsForm.returnKey = existing.returnKey
    dsForm.paramMappings = JSON.parse(JSON.stringify(existing.paramMappings))
  } else {
    dsEditingUid.value = null
    dsForm.strategyId = ''
    dsForm.paramMappings = []
    dsForm.returnKey = ''
  }
  dsDialogVisible.value = true
}

const buildToken = (strategyId, returnKey) => {
  const s = storeStrategies.find(x => x.id === strategyId)
  const name = s ? s.name : strategyId
  return `DS(${name}).${returnKey}`
}

const confirmDsFunction = () => {
  if (!dsForm.strategyId) { ElMessage.warning('请选择策略'); return }
  if (!dsForm.returnKey) { ElMessage.warning('请选择返回值Key'); return }
  const branch = dsTargetBranch.value
  if (!branch.dsFunctions) branch.dsFunctions = []
  const token = buildToken(dsForm.strategyId, dsForm.returnKey)

  if (dsEditingUid.value) {
    // Edit: replace old token in formula, update dsFunctions entry
    const idx = branch.dsFunctions.findIndex(d => d.uid === dsEditingUid.value)
    if (idx > -1) {
      const oldToken = branch.dsFunctions[idx].token
      branch.formula = branch.formula.replaceAll(oldToken, token)
      branch.dsFunctions[idx] = {
        uid: dsEditingUid.value,
        strategyId: dsForm.strategyId,
        paramMappings: JSON.parse(JSON.stringify(dsForm.paramMappings)),
        returnKey: dsForm.returnKey,
        token
      }
    }
    ElMessage.success('已更新数据源函数')
  } else {
    // New: append token to formula, add to dsFunctions
    dsUidCounter++
    branch.formula += (branch.formula ? ' ' : '') + token
    branch.dsFunctions.push({
      uid: 'dsf_' + dsUidCounter,
      strategyId: dsForm.strategyId,
      paramMappings: JSON.parse(JSON.stringify(dsForm.paramMappings)),
      returnKey: dsForm.returnKey,
      token
    })
    ElMessage.success('已插入数据源函数')
  }
  dsDialogVisible.value = false
}

const removeDsFunction = () => {
  const branch = dsTargetBranch.value
  if (!branch.dsFunctions || !dsEditingUid.value) return
  const idx = branch.dsFunctions.findIndex(d => d.uid === dsEditingUid.value)
  if (idx > -1) {
    const oldToken = branch.dsFunctions[idx].token
    branch.formula = branch.formula.replaceAll(oldToken, '').trim()
    branch.dsFunctions.splice(idx, 1)
  }
  ElMessage.success('已移除数据源函数')
  dsDialogVisible.value = false
}

// ============ 通用参数弹窗 ============
const paramDialogVisible = ref(false)
const paramTargetBranch = ref(null)
const paramEditingUid = ref(null)
const paramForm = reactive({ paramId: '', mode: 'single', valueCols: [], conds: [] })
let paramUidCounter = 0

/** 插入通用参数只提供数据表：简单值没有取值要求，直接写在公式里 */
const enabledParams = computed(() => paramList.filter(p => p.enabled && p.kind === 'table'))
const selectedParam = computed(() => paramList.find(p => p.id === paramForm.paramId) || null)
const isParamTable = computed(() => selectedParam.value?.kind === 'table')

/** 结算上下文常用字段池（可自由输入扩展） */
const CONTEXT_FIELDS = ['门店所在城市', '门店名称', '门店人数', '当月客次', '回头客次数', '日期类型', '岗位', '员工工号', '结算周']

/** 列名到常用取数上下文的默认映射，减少手选 */
const PARAM_FIELD_DEFAULTS = {
  '城市': '门店所在城市',
  '门店': '门店名称',
  '岗位': '岗位',
  '回头客次数': '回头客次数',
  '日期类型': '日期类型',
  '门店人数': '门店人数',
  '月均客次': '当月客次',
  '客次量档': '当月客次',
  '天均客次档': '当月客次',
  '客次下限': '当月客次',
  '客次上限': '当月客次',
  '次数下限': '回头客次数',
  '次数上限': '回头客次数',
  '人数档': '门店人数',
  '工号': '员工工号'
}

/** 条件映射清单：按需添加，只在配置者主动「添加条件」时出现 */
const buildConds = () => []

/** 数值列：相加只允许数值列（文本 / 日期列无法求和） */
const numericCols = computed(() => (selectedParam.value?.columns || []).filter(c => c.type === 'number'))

/** 取值列候选：相加模式只列数值列；取 1 列模式列全部列 */
const valueColOptions = computed(() => {
  const cols = selectedParam.value?.columns || []
  return paramForm.mode === 'sum' ? cols.filter(c => c.type === 'number') : cols
})

const colOptionLabel = (c) => {
  if (paramForm.mode !== 'sum') return c.name
  return `${c.name}（数值）`
}

/** 切换取值方式：相加模式把已选的文本 / 日期列剔掉，空了就给一个数值列默认值 */
const onParamModeChange = () => {
  if (paramForm.mode !== 'sum') return
  const numeric = new Set(numericCols.value.map(c => c.name))
  paramForm.valueCols = paramForm.valueCols.filter(n => numeric.has(n))
  if (!paramForm.valueCols.length && numericCols.value.length) {
    paramForm.valueCols = [numericCols.value[numericCols.value.length - 1].name]
  }
  pruneConditions()
}

/** 换参数时给一份开箱可用的默认取值函数：默认取最后一列、单值模式；查询条件留空待按需添加 */
const onParamChange = () => {
  const p = selectedParam.value
  if (p && p.kind === 'table') {
    const cols = p.columns || []
    paramForm.mode = 'single'
    paramForm.valueCols = cols.length ? [cols[cols.length - 1].name] : []
    paramForm.conds = buildConds()
  } else {
    paramForm.mode = 'single'
    paramForm.valueCols = []
    paramForm.conds = []
  }
}

const colTypeOf = (name) => (selectedParam.value?.columns || []).find(c => c.name === name)?.type

/** 这一行能配的符号：跟着条件列的类型走（文本只能 = / ≠） */
const opsForRow = (row) => opsForType(colTypeOf(row.col))

/** 条件列候选：排除取值列、排除其他条件行已占用的列 */
const conditionColOptions = (current) => {
  const valueSet = new Set(paramForm.valueCols)
  const used = new Set()
  paramForm.conds.forEach(m => {
    if (m === current) return
    if (String(m.col ?? '').trim()) used.add(String(m.col).trim())
  })
  return (selectedParam.value?.columns || []).filter(c => !valueSet.has(c.name) && !used.has(c.name))
}

/** 配了条件却还有列在表里有值 → 试探提示：那些行会因为没有条件而不参与 */
const uncoveredCols = computed(() => {
  const p = selectedParam.value
  if (!p || p.kind !== 'table') return []
  const valueSet = new Set(paramForm.valueCols)
  const declared = new Set(paramForm.conds.map(c => String(c.col ?? '').trim()).filter(Boolean))
  return (p.columns || [])
    .filter(c => !valueSet.has(c.name) && !declared.has(c.name))
    .filter(c => (p.rows || []).some(r => String(r.cells?.[c.name] ?? '').trim() !== ''))
    .map(c => c.name)
})

const addCondition = () => {
  const next = conditionColOptions()[0]
  paramForm.conds.push({
    col: next?.name || '',
    op: 'eq',
    fact: next ? (PARAM_FIELD_DEFAULTS[next.name] || next.name) : ''
  })
}

/** 换条件列：带入默认上下文；符号不适用这个列类型时回到等于 */
const onCondColChange = (row) => {
  row.fact = PARAM_FIELD_DEFAULTS[row.col] || row.col
  if (!opsForRow(row).some(o => o.value === row.op)) row.op = 'eq'
}

const removeCondition = (index) => {
  paramForm.conds.splice(index, 1)
}

/** 取值列变了之后，把已经成为取值列的条件行去掉 */
const pruneConditions = () => {
  const valueSet = new Set(paramForm.valueCols)
  paramForm.conds = paramForm.conds.filter(m => !valueSet.has(String(m.col ?? '').trim()))
}

// 取值列改动后，条件行里不能留着同一列（值列与条件列互斥）
watch(() => paramForm.valueCols.slice(), pruneConditions)

/** 公式里的引用写法：数据表名.取值列（多列相加用 +）。不用符号包裹，写出来就是表名 */
const buildParamToken = (param) => {
  if (param.kind !== 'table' || !paramForm.valueCols.length) return param.name
  return `${param.name}.${paramForm.valueCols.join('+')}`
}

const paramOfRef = (pf) => paramList.find(p => p.id === pf.paramId) || null

/** 引用在薪酬项上的显示名：表名 · 取值列 */
const paramRefName = (pf) => {
  const p = paramOfRef(pf)
  if (!p) return '（参数已删除）'
  const cols = (pf.valueCols || []).join(' + ')
  return cols ? `${p.name} · ${cols}` : p.name
}

/** 从薪酬项上摘掉一条引用：公式里对应的文字一起删，不留悬空写法 */
const removeParamRef = (branch, pf) => {
  const list = branch.paramFunctions || []
  const idx = list.findIndex(d => d.uid === pf.uid)
  if (idx < 0) return
  branch.formula = String(branch.formula || '').replace(pf.token, '').replace(/\s{2,}/g, ' ').trim()
  list.splice(idx, 1)
  ElMessage.success('已移除，公式里对应的文字也删掉了')
}

const openParamFunctionDialog = (branch, existing) => {
  paramTargetBranch.value = branch
  if (!branch.paramFunctions) branch.paramFunctions = []
  if (existing) {
    paramEditingUid.value = existing.uid
    paramForm.paramId = existing.paramId
    paramForm.conds = (existing.conds || []).map(c => ({ col: c.col, op: c.op || 'eq', fact: c.fact || '' }))
    paramForm.mode = existing.mode || 'single'
    const numeric = new Set(
      (paramList.find(p => p.id === existing.paramId)?.columns || [])
        .filter(c => c.type === 'number').map(c => c.name)
    )
    paramForm.valueCols = (existing.valueCols || []).filter(n => paramForm.mode !== 'sum' || numeric.has(n))
  } else {
    paramEditingUid.value = null
    paramForm.paramId = ''
    paramForm.mode = 'single'
    paramForm.valueCols = []
    paramForm.conds = []
  }
  paramDialogVisible.value = true
}

const confirmParamFunction = () => {
  const param = selectedParam.value
  if (!param) { ElMessage.warning('请选择通用参数'); return }
  if (param.kind === 'table' && !paramForm.valueCols.length) { ElMessage.warning('请选择取值列'); return }
  if (param.kind === 'table' && paramForm.mode === 'sum') {
    const numeric = new Set(numericCols.value.map(c => c.name))
    if (paramForm.valueCols.some(n => !numeric.has(n))) { ElMessage.warning('相加只支持数值列，请重新选择'); return }
  }
  const branch = paramTargetBranch.value
  if (!branch.paramFunctions) branch.paramFunctions = []
  const token = buildParamToken(param)
  // 数据表：取值列 / 相加方式 / 查询条件一起存进取值函数配置；条件没填全的不存（= 那几列不参与身份检查之外，也不约束）
  const mode = param.kind === 'table' ? paramForm.mode : ''
  const valueCols = param.kind === 'table' ? [...paramForm.valueCols] : []
  const condRows = paramForm.conds.filter(c => String(c.col ?? '').trim())
  const badCond = condRows.find(c => !String(c.fact ?? '').trim())
  if (param.kind === 'table' && badCond) { ElMessage.warning(`「${badCond.col}」这条条件要指定传入的值`); return }
  const conds = param.kind === 'table'
    ? condRows.map(c => ({ col: String(c.col).trim(), op: c.op || 'eq', fact: String(c.fact).trim() }))
    : []

  if (paramEditingUid.value) {
    const idx = branch.paramFunctions.findIndex(d => d.uid === paramEditingUid.value)
    if (idx > -1) {
      const oldToken = branch.paramFunctions[idx].token
      branch.formula = branch.formula.replaceAll(oldToken, token)
      branch.paramFunctions[idx] = {
        uid: paramEditingUid.value,
        paramId: param.id,
        mode,
        valueCols,
        conds,
        token
      }
    }
    ElMessage.success('已更新通用参数')
  } else {
    paramUidCounter++
    branch.formula += (branch.formula ? ' ' : '') + token
    branch.paramFunctions.push({
      uid: 'pf_' + paramUidCounter,
      paramId: param.id,
      mode,
      valueCols,
      conds,
      token
    })
    ElMessage.success('已插入通用参数')
  }
  paramDialogVisible.value = false
}

const removeParamFunction = () => {
  const branch = paramTargetBranch.value
  if (!branch.paramFunctions || !paramEditingUid.value) return
  const idx = branch.paramFunctions.findIndex(d => d.uid === paramEditingUid.value)
  if (idx > -1) {
    const oldToken = branch.paramFunctions[idx].token
    branch.formula = branch.formula.replaceAll(oldToken, '').trim()
    branch.paramFunctions.splice(idx, 1)
  }
  ElMessage.success('已移除通用参数')
  paramDialogVisible.value = false
}

const filteredSalaryItems = computed(() => {
  return salaryItems.value.filter(item => {
    // 编号或名称搜索
    const matchKeyword = !searchForm.keyword ||
      String(item.id).includes(searchForm.keyword) ||
      item.name.includes(searchForm.keyword)
    // 岗位对象筛选
    const matchPost = !searchForm.targetPost || item.targetPost === searchForm.targetPost
    // 类型筛选
    const matchType = !searchForm.type || item.type === searchForm.type

    return matchKeyword && matchPost && matchType
  })
})

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.targetPost = ''
  searchForm.type = ''
}

// 执行搜索（筛选已经通过computed自动响应，这里仅供扩展）
const handleSearch = () => {
  // 筛选已由 computed 自动完成，这里可扩展其他逻辑
}

// 打开新增弹窗
const openAddDialog = () => {
  isEdit.value = false
  currentEditId.value = null
  resetForm()
  dialogVisible.value = true
}

// 打开类型配置
const openTypeConfig = () => {
  ElMessage.info('类型配置功能开发中')
}

// 打开详情弹窗
const openDetailDialog = (row) => {
  isEdit.value = false
  currentEditId.value = row.id
  Object.assign(form, {
    name: row.name,
    type: row.type,
    postBelong: row.postBelong,
    targetPost: row.targetPost,
    cooperateMode: row.cooperateMode
  })
  dialogVisible.value = true
}

// 打开编辑弹窗
const openEditDialog = (row) => {
  isEdit.value = true
  currentEditId.value = row.id

  if (row.name === '保底获豆') {
    // 保底获豆的完整配置 - 计算层级2级，引用1级薪酬项
    Object.assign(form, {
      name: row.name,
      type: row.type,
      postBelong: row.postBelong,
      targetPost: row.targetPost,
      cooperateMode: row.cooperateMode,
      calcLevel: row.calcLevel,
      dataObjects: [
        { objType: '系统', objName: '系统标准参数', relatedTimeField: '' }
      ],
      filterConditions: [
        { field: '人员', operator: '等于', valueType: '引用', filterValue: '销售/业务人员' }
      ],
      calcRule: {
        roundingMode: '四舍五入',
        decimalPlaces: '2',
        paymentForm: '常乐豆'
      },
      branches: [
        {
          conditionType: '所有',
          filterConditions: [],
          formula: '最大值(0, 最低工资标准 - 求和(计件提成, 超时加班费, 节假日加班费))'
        }
      ]
    })
  } else if (row.name === '兼职个税预扣') {
    // 兼职个税预扣 - 第2级计算，引用1级收入项，预扣率3%
    Object.assign(form, {
      name: row.name,
      type: row.type,
      postBelong: row.postBelong,
      targetPost: row.targetPost,
      cooperateMode: row.cooperateMode,
      calcLevel: 2,
      dataObjects: [
        { objType: '系统', objName: '系统标准参数', relatedTimeField: '' }
      ],
      filterConditions: [
        { field: '人员', operator: '等于', valueType: '引用', filterValue: '劳务人员' }
      ],
      calcRule: {
        roundingMode: '四舍五入',
        decimalPlaces: '2',
        paymentForm: '现金'
      },
      branches: [
        {
          conditionType: '所有',
          filterConditions: [],
          formula: '求和(计件提成, 超时加班费, 节假日加班费) * 0.03'
        }
      ]
    })
  } else if (row.name === '投诉扣款') {
    // 投诉扣款 - 第1级扣缴项，按投诉次数或固定金额扣除
    Object.assign(form, {
      name: row.name,
      type: row.type,
      postBelong: row.postBelong,
      targetPost: row.targetPost,
      cooperateMode: row.cooperateMode,
      calcLevel: 1,
      dataObjects: [
        { objType: '系统', objName: '系统标准参数', relatedTimeField: '' },
        { objType: '人事', objName: '人事（绩效目标）', relatedTimeField: '结算日期' }
      ],
      filterConditions: [
        { field: '人员', operator: '等于', valueType: '引用', filterValue: '销售/业务人员' }
      ],
      calcRule: {
        roundingMode: '四舍五入',
        decimalPlaces: '2',
        paymentForm: '现金'
      },
      branches: [
        {
          conditionType: '所有',
          filterConditions: [],
          formula: '投诉次数 * 单次扣款金额'
        }
      ]
    })
  } else {
    // 其他薪酬项的默认配置
    Object.assign(form, {
      name: row.name,
      type: row.type,
      postBelong: row.postBelong,
      targetPost: row.targetPost,
      cooperateMode: row.cooperateMode,
      calcLevel: row.calcLevel,
      dataObjects: [{ objType: '系统', objName: '系统标准参数', relatedTimeField: '订单日期' }],
      filterConditions: [{ field: '人员', operator: '等于', valueType: '引用', filterValue: '销售/业务人员' }],
      calcRule: { roundingMode: '四舍五入', decimalPlaces: '2', paymentForm: '现金' },
      branches: [{ conditionType: '所有', filterConditions: [], formula: '' }]
    })
  }
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  form.name = ''
  form.type = ''
  form.postBelong = ''
  form.targetPost = ''
  form.cooperateMode = ''
  form.calcLevel = 1
  form.dataObjects = [{ objType: '系统', objName: '系统标准参数', relatedTimeField: '订单日期' }]
  form.filterConditions = [{ field: '人员', operator: '等于', valueType: '引用', filterValue: '销售/业务人员' }]
  form.calcRule = { roundingMode: '四舍五入', decimalPlaces: '2', paymentForm: '现金' }
  form.branches = [{ conditionType: '所有', filterConditions: [], formula: '' }]
}

// 弹窗关闭时重置表单
const handleDialogClose = () => {
  formRef.value?.resetFields()
  resetForm()
}

// 数据对象操作
const addDataObject = () => {
  form.dataObjects.push({ objType: '系统', objName: '系统标准参数', relatedTimeField: '订单日期' })
}

const removeDataObject = (index) => {
  form.dataObjects.splice(index, 1)
}

// 筛选条件操作
const addFilterCondition = () => {
  form.filterConditions.push({ field: '', operator: '等于', valueType: '引用', filterValue: '', description: '' })
}

const removeFilterCondition = (index) => {
  form.filterConditions.splice(index, 1)
}

// 分支操作
const addBranch = () => {
  form.branches.push({ conditionType: '所有', filterConditions: [], formula: '', logicDesc: '', dsFunctions: [] })
}

const removeBranch = (index) => {
  if (form.branches.length > 1) {
    form.branches.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一个分支')
  }
}

// 分支内筛选条件操作
const addBranchFilter = (branchIdx) => {
  form.branches[branchIdx].filterConditions.push({ field: '', operator: '等于', valueType: '引用', filterValue: '' })
}

const removeBranchFilter = (branchIdx, filterIdx) => {
  form.branches[branchIdx].filterConditions.splice(filterIdx, 1)
}

// 公式辅助输入
const insertFormula = (branch, text) => {
  branch.formula += text
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = salaryItems.value.findIndex(item => item.id === currentEditId.value)
        if (index !== -1) {
          salaryItems.value[index] = {
            ...salaryItems.value[index],
            name: form.name,
            type: form.type,
            postBelong: form.postBelong,
            targetPost: form.targetPost,
            cooperateMode: form.cooperateMode,
            cycle: form.cycle,
            calcTimePoint: form.calcTimePoint
          }
          ElMessage.success('编辑成功')
        }
      } else {
        const newId = Math.max(...salaryItems.value.map(item => item.id), 0) + 1
        salaryItems.value.push({
          id: newId,
          name: form.name,
          type: form.type,
          postBelong: form.postBelong,
          targetPost: form.targetPost,
          cooperateMode: form.cooperateMode,
          updateTime: new Date().toLocaleString('zh-CN')
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

/* 分页：数据已筛选 / 排序，这里只切片 */
const { page: page, pageSize: pageSize, total: total, rows: pagedRows } = usePager(filteredSalaryItems)
</script>

<style scoped>
.salary-item-management {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: hsl(var(--foreground));
}

.page-header .tip {
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  margin: 0;
}

.content-section {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
}

/* 弹窗样式 */
.dialog-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid hsl(var(--primary));
}

.sub-section {
  margin-bottom: 20px;
  padding: 16px;
  background: hsl(var(--muted) / 0.5);
  border-radius: 8px;
}

.sub-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sub-title {
  font-weight: 500;
  color: hsl(var(--foreground));
}

.filter-tip {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-top: 8px;
}

.calc-rules {
  margin-bottom: 16px;
}

.branch-section {
  margin-top: 16px;
}

.branch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
}

.branch-item {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.formula-helper {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.helper-label {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-right: 4px;
}

.branch-filter {
  margin-top: 12px;
  padding: 12px;
  background: hsl(var(--muted) / 0.3);
  border-radius: 6px;
}

.branch-title {
  font-weight: 500;
  margin-bottom: 12px;
  color: hsl(var(--primary));
}

.branch-action {
  text-align: right;
  margin-top: 8px;
}

.salary-item-dialog :deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}
.filter-tip {
  font-size: 12px;
  color: #999;
}
.calc-method-section { margin-bottom: 12px; }
.strategy-bind-section {
  background: #f8faff;
  border: 1px solid #e0eaff;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
}
.return-key-chip { background: #f0f0f5; border: 1px solid #d8d8e0; border-radius: 4px; padding: 3px 10px; font-size: 12px; font-family: 'SF Mono', monospace; }
.return-key-chip.active { background: #a40035; border-color: #a40035; color: #fff; }
.param-chip { background: #eef4fb; border-color: #a9c8ea; color: #185FA5; }
.prio-box { width: 100%; padding: 10px 12px; border: 1px solid #e4e7ed; border-radius: 6px; background: #fafafa; }
.prio-mode { margin-bottom: 10px; }
.rowmode-line { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.rowmode-label { flex: none; font-size: 12px; color: #606266; }
.strategy-hint.block { display: block; margin: 6px 0 0; line-height: 1.6; }
.strategy-hint.warn { color: #c45656; }
.cond-box { width: 100%; padding: 10px 12px; border: 1px solid #e4e7ed; border-radius: 6px; background: #fafafa; }
.cond-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.cond-col { width: 132px; flex: none; }
.cond-op { width: 112px; flex: none; }
.cond-fact { flex: 1 1 120px; min-width: 108px; }
.cond-empty { font-size: 12px; color: #909399; margin-bottom: 8px; }
.prio-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.prio-order { width: 20px; text-align: center; color: #909399; font-size: 12px; flex: none; }
.prio-col { min-width: 88px; font-size: 13px; font-weight: 500; flex: none; }
.prio-bind { flex: 1; }
.level-warn { width: 100%; margin-top: 8px; }
.ds-chips-row { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.ds-chips-label { font-size: 12px; color: #999; }
.ds-chip { background: #fff0f3; border: 1px solid #f5b0c0; border-radius: 4px; padding: 3px 10px; font-size: 12px; font-family: 'SF Mono', monospace; cursor: pointer; transition: all 0.15s; color: #a40035; }
.ds-chip:hover { background: #a40035; color: #fff; border-color: #a40035; }
.param-refs { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; max-width: 640px; }
.param-ref { border: 1px solid #f2e3e7; background: #fffbfc; border-radius: 6px; padding: 6px 10px; cursor: pointer; transition: all 0.15s; }
.param-ref:hover { border-color: #a40035; background: #fff0f3; }
.param-ref-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.param-ref-name { font-size: 13px; font-weight: 600; color: #a40035; }
.param-ref-ops { display: flex; gap: 10px; flex: none; }
.param-ref-op { font-size: 12px; color: #a40035; cursor: pointer; }
.param-ref-op:hover { text-decoration: underline; }
.param-ref-op.danger { color: #999; }
.param-ref-op.danger:hover { color: #c0392b; }
.strategy-hint {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}
.param-mapping {
  margin-top: 12px;
}
.param-mapping-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}
</style>