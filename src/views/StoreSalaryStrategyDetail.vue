<template>
  <div class="strategy-detail-page">
    <!-- 顶部导航 -->
    <div class="detail-header">
      <div class="header-left">
        <el-button link @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <h2>{{ isNew ? '新增数据源策略' : (isEdit ? '编辑数据源策略' : '数据源策略详情') }}</h2>
        <el-tag v-if="isEdit && (isNew || data?.status === '草稿')" size="small" type="info" class="draft-tag">草稿</el-tag>
      </div>
      <div class="header-right">
        <template v-if="isEdit">
          <el-button @click="handleCancel">取消</el-button>
          <el-button @click="handleDraft">暂存草稿</el-button>
          <el-button type="primary" @click="handlePublish">发布</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </template>
      </div>
    </div>

    <div class="content-section" v-if="data">
      <!-- 一、基础信息 -->
      <div class="card">
        <h3>基础信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">策略名称</span>
            <span class="info-value" v-if="!isEdit">{{ data.name }}</span>
            <el-input v-else v-model="data.name" placeholder="请输入策略名称" size="small" style="width: 280px;" />
          </div>
          <div class="info-item">
            <span class="info-label">岗位</span>
            <span class="info-value" v-if="!isEdit">{{ data.position || '-' }}</span>
            <el-select v-else v-model="data.position" placeholder="选择" size="small" style="width: 140px;">
              <el-option label="推拿师" value="推拿师" />
              <el-option label="客户经理" value="客户经理" />
            </el-select>
          </div>
          <div class="info-item">
            <span class="info-label">合作模式</span>
            <span class="info-value" v-if="!isEdit">{{ data.coopMode || '-' }}</span>
            <el-select v-else v-model="data.coopMode" placeholder="选择" size="small" style="width: 180px;">
              <el-option label="非全日制劳动合同" value="非全日制劳动合同" />
              <el-option label="劳务合作-兼职" value="劳务合作-兼职" />
            </el-select>
          </div>
          <div class="info-item">
            <span class="info-label">生效开始</span>
            <span class="info-value" v-if="!isEdit">{{ data.effectiveDate || '-' }}</span>
            <el-date-picker v-else v-model="data.effectiveDate" type="date" value-format="YYYY-MM-DD" size="small" style="width: 180px;" />
          </div>
          <div class="info-item">
            <span class="info-label">生效结束</span>
            <span class="info-value" v-if="!isEdit">{{ data.effectiveEndDate || '长期' }}</span>
            <el-date-picker v-else v-model="data.effectiveEndDate" type="date" value-format="YYYY-MM-DD" size="small" style="width: 180px;" placeholder="留空=长期" />
          </div>
          <div class="info-item" v-if="!isNew">
            <span class="info-label">状态</span>
            <span class="info-value">
              <el-tag :type="data.status === '生效中' ? 'success' : 'info'" size="small">{{ data.status }}</el-tag>
            </span>
          </div>
        </div>
      </div>

      <!-- 二、输入参数 -->
      <div class="card">
        <div class="card-header">
          <h3>输入参数</h3>
          <span class="item-count">策略声明所需参数，薪酬项侧映射订单字段传入；规则公式中引用参数名</span>
        </div>
        <el-table :data="data.inputParams" border size="small" style="width: 100%;">
          <el-table-column label="编号" width="90">
            <template #default="{ row }">
              <span v-if="row.id">{{ row.id }}</span>
              <span v-else class="pending-id">保存后生成</span>
            </template>
          </el-table-column>
          <el-table-column label="参数名称" min-width="80">
            <template #default="{ row }">
              <span v-if="!isEdit">{{ row.name }}</span>
              <el-input v-else v-model="row.name" size="small" placeholder="如 实付金额" />
            </template>
          </el-table-column>
          <el-table-column label="类型" width="160">
            <template #default="{ row }">
              <span v-if="!isEdit">{{ INPUT_PARAM_TYPE_LABELS[row.type] || '-' }}</span>
              <el-select v-else v-model="row.type" size="small" style="width: 100%;">
                <el-option v-for="t in INPUT_PARAM_TYPES" :key="t.value" :label="t.label" :value="t.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="示例" width="280">
            <template #default="{ row }">
              <span class="sample-text">{{ INPUT_PARAM_SAMPLES[row.type] || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="说明" min-width="180">
            <template #default="{ row }">
              <span v-if="!isEdit">{{ row.desc || '-' }}</span>
              <el-input v-else v-model="row.desc" size="small" placeholder="参数说明" />
            </template>
          </el-table-column>
          <el-table-column v-if="isEdit" label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" @click="removeParam($index)">删</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button v-if="isEdit" type="primary" link size="small" @click="addParam" style="margin-top: 8px;">+ 新增参数</el-button>
        <div v-if="isEdit" class="param-tip">
          <el-icon><InfoFilled /></el-icon>
          新增参数保存后自动生成编号；编辑时只可修改名称和说明，编号不可改。参数越多，规则可引用的条件和公式变量越灵活。
        </div>
      </div>

      <!-- 三、适用范围 -->
      <div class="card">
        <h3>适用范围</h3>
        <div class="scope-intro">
          <el-icon><InfoFilled /></el-icon>
          通过筛选条件圈定适用人员，条件越多范围越窄。不设任何条件即为基础策略，适用于所有门店所有人。
        </div>

        <div v-if="!isEdit">
          <span v-if="!data.personFilter.conditions.length" class="empty-text">无筛选条件（所有人员，基础策略）</span>
          <el-table v-else :data="data.personFilter.conditions" border size="small" style="width: 100%;">
            <el-table-column label="字段" prop="field" width="120" />
            <el-table-column label="运算符" prop="op" width="100" />
            <el-table-column label="值" min-width="280">
              <template #default="{ row }">
                <template v-if="row.importedItems && row.importedItems.length && isImportField(row.field)">
                  <span class="ro-import-summary">
                    已选 {{ row.importedItems.length }} 项：
                    <template v-if="row.field === '人才ID'">
                      <span v-for="(it, i) in row.importedItems" :key="i" class="ro-talent">
                        <el-avatar :size="18" class="chip-avatar">{{ it.name?.[0] }}</el-avatar>
                        <span>{{ it.name }}</span>
                        <span class="ro-sub">{{ it.id }} · {{ it.position }} · {{ it.store }}</span>
                      </span>
                    </template>
                    <template v-else>
                      <span v-for="(it, i) in row.importedItems" :key="i" class="ro-chip">{{ it.id }} · {{ it.name }}</span>
                    </template>
                  </span>
                </template>
                <template v-else>{{ row.value }}</template>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else>
          <el-table :data="data.personFilter.conditions" border size="small" style="width: 100%;">
            <el-table-column label="字段" width="120">
              <template #default="{ row }">
                <el-select v-model="row.field" size="small" style="width: 100%;" @change="onPersonFieldChange(row)">
                  <el-option v-for="f in PERSON_FIELDS" :key="f.value" :label="f.label" :value="f.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="运算符" width="100">
              <template #default="{ row }">
                <el-select v-model="row.op" size="small" style="width: 100%;">
                  <el-option v-for="op in personFilterOps" :key="op" :label="op" :value="op" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="值类型" width="90">
              <template #default="{ row }">
                <el-select v-model="row.valueType" size="small" style="width: 100%;" @change="onPersonValueTypeChange(row)">
                  <el-option v-for="vt in PERSON_FIELD_VT_OPTIONS[row.field] || ['input']" :key="vt" :label="VALUE_TYPE_LABELS[vt]" :value="vt" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="值" min-width="280">
              <template #default="{ row }">
                <!-- 入职日期：日期选择器 -->
                <el-date-picker v-if="row.field === '入职日期'" v-model="row.value" type="date" value-format="YYYY-MM-DD" size="small" style="width: 100%;" />
                <!-- 选择（多选） -->
                <el-select v-else-if="row.valueType === 'select' && row.field === '城市'" v-model="row.value" multiple filterable placeholder="选择城市" size="small" style="width: 100%;">
                  <el-option v-for="ci in cities" :key="ci.value" :label="ci.label" :value="ci.value" />
                </el-select>
                <el-select v-else-if="row.valueType === 'select' && row.field === '门店'" v-model="row.value" multiple filterable placeholder="选择门店" size="small" style="width: 100%;">
                  <el-option v-for="s in stores" :key="s.value" :label="s.label" :value="s.value" />
                </el-select>
                <el-select v-else-if="row.valueType === 'select' && row.field === '部门'" v-model="row.value" multiple filterable placeholder="选择部门" size="small" style="width: 100%;">
                  <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
                </el-select>
                <el-select v-else-if="row.valueType === 'select' && row.field === '员工'" v-model="row.value" multiple filterable placeholder="选择员工" size="small" style="width: 100%;">
                  <el-option v-for="e in employees" :key="e.id" :label="e.name" :value="e.name" />
                </el-select>
                <!-- 输入 + 导入按钮（ID 类字段） -->
                <div v-else-if="row.valueType === 'input' && isImportField(row.field)" class="input-with-import">
                  <el-input v-model="row.value" size="small" placeholder="输入或导入" />
                  <el-button size="small" type="primary" plain @click="openImportDialog(row)">
                    <el-icon><Plus /></el-icon> 导入
                  </el-button>
                  <div v-if="row.importedItems && row.importedItems.length" class="imported-list">
                    <span v-for="(it, i) in row.importedItems" :key="i" class="imported-chip" :class="{ 'is-talent': row.field === '人才ID' }">
                      <template v-if="row.field === '人才ID'">
                        <el-avatar :size="22" class="chip-avatar">{{ it.name?.[0] }}</el-avatar>
                        <span class="chip-text">
                          <span class="chip-name">{{ it.name }}</span>
                          <span class="chip-sub">{{ it.id }} · {{ it.position }} · {{ it.store }}</span>
                        </span>
                      </template>
                      <template v-else>
                        <span class="chip-text">
                          <span class="chip-name">{{ it.id }}</span>
                          <span class="chip-sub">{{ it.name }}</span>
                        </span>
                      </template>
                      <el-icon class="chip-close" @click.stop="removeImportedItem(row, i)"><Close /></el-icon>
                    </span>
                  </div>
                </div>
                <!-- 输入 -->
                <el-input v-else v-model="row.value" size="small" placeholder="输入值" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" align="center">
              <template #default="{ $index }">
                <el-button type="danger" link size="small" @click="removePersonCondition($index)">删</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" link size="small" @click="addPersonCondition" style="margin-top: 8px;">+ 新增筛选条件</el-button>
        </div>
      </div>

      <!-- 四、规则配置 -->
      <div class="card">
        <h3>规则配置</h3>
        <div class="card-desc">自由组合条件（引用输入参数或维度枚举），命中后按公式计算。维度枚举支持时段、日期类型、日期范围等，引擎从传入的原始时间自动派生匹配。规则从上到下依次匹配，命中第 1 条即退出，不再继续匹配后续规则。</div>

        <!-- 规则列表（只读） -->
        <template v-if="!isEdit">
          <div v-for="(rule, ri) in data.rules" :key="rule.id || ri" class="rule-card-readonly">
            <div class="rule-card-head">
              <span class="rule-no">规则 {{ ri + 1 }}</span>
              <span v-if="!rule.conditions.length" class="rule-fallback">兜底规则</span>
            </div>
            <div v-if="rule.conditions.length" class="rule-conditions">
              <span v-for="(cond, ci) in rule.conditions" :key="ci" class="cond-chip">
                {{ condLabel(cond) }}
              </span>
            </div>
            <div v-else class="rule-conditions">
              <span class="cond-chip muted">无条件（始终命中）</span>
            </div>
            <div class="rule-return-display">
              <span class="return-label">返回值：</span>
              <span v-for="(rv, vi) in (rule.returnValues || [])" :key="vi" class="return-chip">{{ rv.key }} = {{ rv.value }}</span>
              <span v-if="!(rule.returnValues && rule.returnValues.length)" class="return-empty">无返回值</span>
            </div>
          </div>
        </template>

        <!-- 规则编辑器 -->
        <template v-else>
          <div class="rules-editor-tip">
            <el-icon><InfoFilled /></el-icon>
            每条规则可自由添加条件行。条件可引用输入参数（如 回头客次数 ≥ 3）或维度枚举（如 时段 = 18:00-22:00、日期范围 = 2026-07-01~2026-07-31）。规则从上到下依次匹配，命中第 1 条即退出，不再继续匹配。
          </div>
          <div v-for="(rule, ri) in data.rules" :key="ri" class="rule-card-edit">
            <div class="rule-card-head">
              <span class="rule-no">规则 {{ ri + 1 }}</span>
              <div class="rule-card-actions">
                <el-button link size="small" @click="duplicateRule(ri)">复制新增</el-button>
                <el-button link size="small" :disabled="ri === 0" @click="moveRule(ri, -1)">↑</el-button>
                <el-button link size="small" :disabled="ri === data.rules.length - 1" @click="moveRule(ri, 1)">↓</el-button>
                <el-button type="danger" link size="small" @click="removeRule(ri)">删除规则</el-button>
              </div>
            </div>

            <!-- 条件区 -->
            <div class="rule-section-label">条件（AND）</div>
            <el-table :data="rule.conditions" border size="small" style="width: 100%;">
              <el-table-column label="类型" width="110">
                <template #default="{ row }">
                  <el-select v-model="row.type" size="small" style="width: 100%;" @change="onCondTypeChange(row)">
                    <el-option label="输入参数" value="param" />
                    <el-option label="维度枚举" value="enum" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="字段" width="200">
                <template #default="{ row }">
                  <el-select v-if="row.type === 'param'" v-model="row.field" size="small" filterable allow-create placeholder="选择或输入参数" style="width: 100%;">
                    <el-option v-for="p in data.inputParams" :key="p.id || p.name" :label="p.name" :value="p.name">
                      <div class="field-option">
                        <span>{{ p.name }}</span>
                        <span class="field-type-tag">{{ INPUT_PARAM_TYPE_LABELS[p.type] || '-' }}</span>
                      </div>
                    </el-option>
                  </el-select>
                  <el-select v-else v-model="row.field" size="small" placeholder="选择维度" style="width: 100%;" @change="onEnumFieldChange(row)">
                    <el-option v-for="d in enumDimensionKeys" :key="d" :label="d" :value="d">
                      <div class="field-option">
                        <span>{{ d }}</span>
                        <span class="field-type-tag">{{ INPUT_PARAM_TYPE_LABELS[ENUM_DIM_TYPES[d]] || '-' }}</span>
                      </div>
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="运算符" width="100">
                <template #default="{ row }">
                  <el-select v-model="row.op" size="small" style="width: 100%;">
                    <el-option v-for="op in opsForRow(row)" :key="op" :label="op" :value="op" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="值类型" width="90">
                <template #default="{ row }">
                  <el-select v-model="row.valueType" size="small" style="width: 100%;" @change="onCondValueTypeChange(row)">
                    <el-option label="输入" value="input" />
                    <el-option label="选择" value="select" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="值" min-width="280">
                <template #default="{ row }">
                  <!-- number / string -->
                  <el-input-number v-if="fieldTypeOf(row) === 'number'" v-model="row.value" :min="0" size="small" controls-position="right" style="width: 100%;" />
                  <el-input v-else-if="fieldTypeOf(row) === 'string'" v-model="row.value" size="small" placeholder="输入值" />
                  <!-- date（多值） -->
                  <div v-else-if="fieldTypeOf(row) === 'date'" class="range-list">
                    <template v-for="(_, i) in rangesValue(row)" :key="i">
                      <span v-if="i > 0" class="range-sep">+</span>
                      <div class="range-row">
                        <el-date-picker :model-value="parseDateStart(rangesValue(row)[i])" @update:model-value="(v) => updateDateRange(row, i, 0, v)" type="date" value-format="YYYY-MM-DD" placeholder="日期" size="small" style="width: 150px;" />
                        <el-button link size="small" @click="removeRangeValue(row, i)">删</el-button>
                      </div>
                    </template>
                    <span v-if="rangesValue(row).length" class="range-sep">+</span>
                    <el-button link size="small" type="primary" @click="addRangeValue(row)">+ 添加日期</el-button>
                  </div>
                  <!-- date-time（多值） -->
                  <div v-else-if="fieldTypeOf(row) === 'date-time'" class="range-list">
                    <template v-for="(_, i) in rangesValue(row)" :key="i">
                      <span v-if="i > 0" class="range-sep">+</span>
                      <div class="range-row">
                        <el-date-picker :model-value="parseDateTimeSingle(rangesValue(row)[i])" @update:model-value="(v) => updateDateTimeSingle(row, i, v)" type="datetime" value-format="YYYY-MM-DD HH:mm" placeholder="日期+时间" size="small" style="width: 180px;" />
                        <el-button link size="small" @click="removeRangeValue(row, i)">删</el-button>
                      </div>
                    </template>
                    <span v-if="rangesValue(row).length" class="range-sep">+</span>
                    <el-button link size="small" type="primary" @click="addRangeValue(row)">+ 添加日期+时间</el-button>
                  </div>
                  <!-- time-range（多值） -->
                  <div v-else-if="fieldTypeOf(row) === 'time-range'" class="range-list">
                    <template v-for="(_, i) in rangesValue(row)" :key="i">
                      <span v-if="i > 0" class="range-sep">+</span>
                      <div class="range-row">
                        <el-time-select :model-value="parseTimeStart(rangesValue(row)[i])" @update:model-value="(v) => updateTimeRange(row, i, 0, v)" start="00:00" end="24:00" step="01:00" format="HH:mm" value-format="HH:mm" placeholder="起始" size="small" style="width: 100px;" />
                        <span class="dash">-</span>
                        <el-time-select :model-value="parseTimeEnd(rangesValue(row)[i])" @update:model-value="(v) => updateTimeRange(row, i, 1, v)" start="00:00" end="24:00" step="01:00" format="HH:mm" value-format="HH:mm" placeholder="结束" size="small" style="width: 100px;" />
                        <el-button link size="small" @click="removeRangeValue(row, i)">删</el-button>
                      </div>
                    </template>
                    <span v-if="rangesValue(row).length" class="range-sep">+</span>
                    <el-button link size="small" type="primary" @click="addRangeValue(row)">+ 添加时段</el-button>
                  </div>
                  <!-- 门店：多选 + 导入 -->
                  <div v-else-if="row.field === '门店' && row.type === 'enum'" class="multi-import-cell">
                    <el-select v-model="row.value" multiple filterable placeholder="选择门店" size="small" style="width: 100%;">
                      <el-option v-for="s in stores" :key="s.id" :label="s.label" :value="s.id" />
                    </el-select>
                    <el-button size="small" type="primary" plain @click="openRuleImportDialog(row)">+ 导入</el-button>
                  </div>
                  <!-- 其他 enum（日期类型/技法/项目）：多选 -->
                  <el-select v-else-if="row.type === 'enum' && enumValues(row.field).length" v-model="row.value" multiple filterable placeholder="选择值" size="small" style="width: 100%;">
                    <el-option v-for="v in enumValues(row.field)" :key="v" :label="v" :value="v" />
                  </el-select>
                  <!-- 输入兜底 -->
                  <el-input v-else v-model="row.value" size="small" placeholder="输入值" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" link size="small" @click="removeCondition(rule, $index)">删</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" link size="small" @click="addCondition(rule)" style="margin-top: 6px;">+ 新增条件</el-button>

            <!-- 计算公式 -->
            <div class="rule-section-label" style="margin-top: 12px;">返回值（命中后返回以下值，薪酬项公式通过 key 引用）</div>
            <el-table :data="rule.returnValues" border size="small" style="width: 100%;">
              <el-table-column label="Key" min-width="140">
                <template #default="{ row }">
                  <el-input v-model="row.key" size="small" placeholder="如 提成率" />
                </template>
              </el-table-column>
              <el-table-column label="返回值" min-width="120">
                <template #default="{ row }">
                  <el-input v-model="row.value" size="small" placeholder="纯数字" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" link size="small" @click="removeReturnValue(rule, $index)">删</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" link size="small" @click="addReturnValue(rule)" style="margin-top: 6px;">+ 新增返回值</el-button>
          </div>
          <el-button type="primary" @click="addRule" style="margin-top: 10px;">+ 新增规则</el-button>
        </template>
      </div>

      <!-- 五、策略文案 -->
      <div class="card">
        <div class="card-header">
          <h3>策略文案</h3>
          <span class="item-count">用于排班时查询对应日期/时段适用的政策。保存时自动 AI 解读生成，可在弹层中确认或调整</span>
        </div>
        <template v-if="!isEdit">
          <div v-if="data.policyText" class="policy-display-readonly">{{ data.policyText }}</div>
          <span v-else class="empty-text">未生成</span>
        </template>
        <template v-else>
          <div class="policy-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>策略文案在保存时由 AI 自动解读生成。点击「保存」后会弹出预览层，可确认或调整文案。</span>
          </div>
        </template>
      </div>

    </div>

    <div v-else class="empty">未找到该策略</div>

    <!-- 导入弹窗 -->
    <el-dialog
      v-model="importDialogVisible"
      :title="`导入${(PERSON_FIELDS.find(f => f.value === importTargetRow?.field) || {}).label || ''}`"
      width="640px"
      append-to-body
      destroy-on-close
    >
      <div class="import-toolbar">
        <el-input v-model="importSearch" placeholder="搜索 ID 或名称" clearable size="small" style="width: 240px;">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <span class="import-hint">已选 {{ importSelected.length }} 项</span>
      </div>
      <el-table
        :data="importCandidates"
        @selection-change="onImportSelectionChange"
        max-height="400"
        border
        size="small"
      >
        <el-table-column type="selection" width="44" />
        <template v-if="importTargetRow?.field === '人才ID'">
          <el-table-column label="人才ID" prop="id" width="120" />
          <el-table-column label="头像" width="64">
            <template #default="{ row }">
              <el-avatar :size="24" class="chip-avatar">{{ row.name?.[0] }}</el-avatar>
            </template>
          </el-table-column>
          <el-table-column label="姓名" prop="name" width="100" />
          <el-table-column label="岗位" prop="position" width="100" />
          <el-table-column label="门店" prop="store" />
        </template>
        <template v-else-if="importTargetRow?.field === '员工'">
          <el-table-column label="头像" width="64">
            <template #default="{ row }">
              <el-avatar :size="24" class="chip-avatar">{{ row.name?.[0] }}</el-avatar>
            </template>
          </el-table-column>
          <el-table-column label="姓名" prop="name" width="120" />
          <el-table-column label="工号" prop="id" width="120" />
          <el-table-column label="岗位" prop="position" width="100" />
          <el-table-column label="门店" prop="store" />
        </template>
        <template v-else>
          <el-table-column label="ID" prop="id" width="120" />
          <el-table-column label="名称" prop="name" />
        </template>
      </el-table>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport">导入 ({{ importSelected.length }})</el-button>
      </template>
    </el-dialog>

    <!-- 策略文案 AI 解读弹窗 -->
    <el-dialog
      v-model="policyAIDialogVisible"
      title="AI 解读策略文案"
      width="640px"
      append-to-body
      destroy-on-close
    >
      <div class="policy-ai-tip">
        <el-icon><MagicStick /></el-icon>
        <span>AI 根据规则自动解读生成如下文案。可直接确认保存，或手动调整后再保存。</span>
      </div>
      <el-input v-model="policyAIDraft" type="textarea" :rows="10" placeholder="策略文案" />
      <div class="policy-ai-actions">
        <el-button size="small" @click="aiRegeneratePolicy">
          <el-icon><MagicStick /></el-icon> 重新生成
        </el-button>
      </div>
      <template #footer>
        <el-button @click="onPolicyAISkip">跳过，直接保存</el-button>
        <el-button type="primary" @click="onPolicyAIConfirm">确认并保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, InfoFilled, Close, Plus, Search } from '@element-plus/icons-vue'
import {
  storeSalaryStrategies, stores, cities,
  PERSON_FILTER_OPS, ENUM_DIMENSIONS, DATE_RANGE_DIMENSION,
  INPUT_PARAM_TYPES, INPUT_PARAM_TYPE_LABELS, INPUT_PARAM_SAMPLES, PARAM_TYPE_OPS, ENUM_DIM_TYPES,
  generatePolicyText
} from '../mock/storeSalaryStrategies.js'
import { departments } from '../mock/departments.js'
import { employees } from '../mock/employees.js'

const route = useRoute()
const router = useRouter()
const goBack = () => router.push('/store-salary-strategy')

const personFilterOps = PERSON_FILTER_OPS
const condOperators = ['等于', '不等于', '≥', '≤', '>', '<', '包含', '不包含']
const enumDimensionKeys = Object.keys(ENUM_DIMENSIONS)

// 适用范围字段选项
const PERSON_FIELDS = [
  { value: '城市', label: '城市' },
  { value: '门店', label: '门店' },
  { value: '部门', label: '部门' },
  { value: '人才ID', label: '人才ID' },
  { value: '员工', label: '员工' },
  { value: '工号', label: '工号' },
  { value: '职级', label: '职级' },
  { value: '入职日期', label: '入职日期' }
]

// 值类型：输入 / 选择
// 字段 → 默认值类型 + 可选值类型列表
const PERSON_FIELD_DEFAULT_VT = {
  '城市': 'select', '门店': 'select', '部门': 'select', '员工': 'select',
  '人才ID': 'input', '工号': 'input', '职级': 'input', '入职日期': 'select'
}
const PERSON_FIELD_VT_OPTIONS = {
  '城市': ['input', 'select'],
  '门店': ['input', 'select'],
  '部门': ['input', 'select'],
  '人才ID': ['input'],
  '员工': ['input', 'select'],
  '工号': ['input'],
  '职级': ['input'],
  '入职日期': ['select']
}
const VALUE_TYPE_LABELS = { input: '输入', select: '选择' }

// 支持导入的字段（ID 类）
const PERSON_IMPORT_FIELDS = ['城市', '门店', '部门', '人才ID', '员工']
const isImportField = (field) => PERSON_IMPORT_FIELDS.includes(field)

// 导入值类型字段专用的候选项
const importSourceForField = (field) => {
  if (field === '城市') return cities.map(c => ({ id: c.id, name: c.label }))
  if (field === '门店') return stores.map(s => ({ id: s.id, name: s.label }))
  if (field === '部门') return departments.map(d => ({ id: d.id, name: d.name }))
  if (field === '人才ID') return employees.map(e => ({ id: e.id, name: e.name, position: e.position, store: e.storeName }))
  if (field === '员工') return employees.map(e => ({ id: e.id, name: e.name, position: e.position, store: e.storeName }))
  return []
}

const enumValues = (field) => ENUM_DIMENSIONS[field] || []

const isNew = route.params.id === 'new'
const isEdit = ref(route.query.mode === 'edit')

// 加载或创建空白策略
const createBlank = () => ({
  id: '',
  name: '', position: '', coopMode: '非全日制劳动合同',
  position: '', coopMode: '非全日制劳动合同',
  personFilter: { conditions: [] },
  effectiveDate: '',
  effectiveEndDate: '',
  status: '草稿',
  inputParams: [
    { id: '', name: '实付金额', type: 'number', desc: '订单实付金额' },
    { id: '', name: '回头客次数', type: 'number', desc: '该客户在当前门店的回头次数' }
  ],
  rules: [
    {
      conditions: [],
      returnValues: [{ key: '提成率', value: 10 }]
    }
  ],
  policyText: ''
})

const raw = isNew ? createBlank() : storeSalaryStrategies.find(s => s.id === route.params.id)
const data = ref(raw ? JSON.parse(JSON.stringify(raw)) : null)

// 默认值类型：适用范围条件按字段推断；规则条件按类型推断
const defaultPersonValueType = (field) => PERSON_FIELD_DEFAULT_VT[field] || 'input'
const defaultCondValueType = (type) => type === 'enum' ? 'select' : 'input'

// 编辑态规范化：补 valueType / type / field / value 形态
if (data.value) {
  data.value.personFilter.conditions.forEach(c => {
    if (!c.valueType) c.valueType = defaultPersonValueType(c.field)
    // 适用范围：select 字段 value 改为数组（多选），字符串兼容
    if (c.valueType === 'select' && ['城市', '门店', '部门', '员工'].includes(c.field)) {
      if (c.value && !Array.isArray(c.value)) c.value = [c.value]
      if (!Array.isArray(c.value)) c.value = []
    }
  })
  data.value.rules.forEach(r => {
    r.conditions.forEach(c => {
      if (!c.type) c.type = c.param ? 'param' : (c.dimension ? 'enum' : 'param')
      if (c.param && !c.field) c.field = c.param
      if (c.dimension && !c.field) c.field = c.dimension
      if (!c.valueType) c.valueType = defaultCondValueType(c.type)
      // enum 条件 value 改为数组；param 保持单值
      if (c.type === 'enum') {
        if (c.value && !Array.isArray(c.value)) c.value = [c.value]
        if (!Array.isArray(c.value)) c.value = []
      } else {
        if (Array.isArray(c.value)) c.value = c.value[0] || ''
      }
      // 清除旧字段
      delete c.dateRange
    })
  })
}

const handleEdit = () => {
  router.replace(`/store-salary-strategy/${route.params.id}?mode=edit`)
  isEdit.value = true
}
const handleCancel = () => {
  if (isNew) { router.push('/store-salary-strategy'); return }
  router.replace(`/store-salary-strategy/${route.params.id}`)
  isEdit.value = false
  // reload from source
  const src = storeSalaryStrategies.find(s => s.id === route.params.id)
  if (src) data.value = JSON.parse(JSON.stringify(src))
}
// 策略文案 AI 解读弹窗
const policyAIDialogVisible = ref(false)
const pendingStatus = ref('草稿')
const policyAIDraft = ref('')

const handleDraft = () => {
  if (!data.value.name) { ElMessage.warning('请填写策略名称'); return }
  pendingStatus.value = '草稿'
  policyAIDraft.value = generatePolicyText(data.value)
  policyAIDialogVisible.value = true
}

const handlePublish = () => {
  if (!data.value.name) { ElMessage.warning('请填写策略名称'); return }
  pendingStatus.value = '生效中'
  policyAIDraft.value = generatePolicyText(data.value)
  policyAIDialogVisible.value = true
}

const aiRegeneratePolicy = () => {
  policyAIDraft.value = generatePolicyText(data.value)
  ElMessage.success('已重新生成')
}

const onPolicyAIConfirm = () => {
  data.value.policyText = policyAIDraft.value
  policyAIDialogVisible.value = false
  executeSave()
}

const onPolicyAISkip = () => {
  policyAIDialogVisible.value = false
  executeSave()
}

const executeSave = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  data.value.updateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`

  // 落库前按按钮意图写入目标状态
  data.value.status = pendingStatus.value

  if (isNew) {
    const seq = storeSalaryStrategies.length + 1
    data.value.id = 'SS-' + String(seq).padStart(3, '0')
    data.value.inputParams.forEach((p, i) => {
      if (!p.id) p.id = 'P' + String(i + 1).padStart(3, '0')
    })
    storeSalaryStrategies.push(JSON.parse(JSON.stringify(data.value)))
    router.replace(`/store-salary-strategy/${data.value.id}`)
  } else {
    let maxP = 0
    data.value.inputParams.forEach(p => {
      if (p.id) { const n = parseInt(p.id.slice(1)); if (n > maxP) maxP = n }
    })
    data.value.inputParams.forEach(p => {
      if (!p.id) { maxP++; p.id = 'P' + String(maxP).padStart(3, '0') }
    })
    const idx = storeSalaryStrategies.findIndex(s => s.id === data.value.id)
    if (idx > -1) storeSalaryStrategies[idx] = JSON.parse(JSON.stringify(data.value))
    router.replace(`/store-salary-strategy/${route.params.id}`)
  }
  ElMessage.success(pendingStatus.value === '生效中' ? '已发布' : '已暂存草稿')
  isEdit.value = false
}
// 人员筛选
const addPersonCondition = () => {
  const field = '员工'
  const valueType = defaultPersonValueType(field)
  const value = valueType === 'select' ? [] : ''
  data.value.personFilter.conditions.push({ field, op: '等于', valueType, value, importedItems: [] })
}
const removePersonCondition = (idx) => data.value.personFilter.conditions.splice(idx, 1)
const onPersonFieldChange = (row) => {
  const vt = defaultPersonValueType(row.field)
  row.value = vt === 'select' ? [] : ''
  row.importedItems = []
  row.valueType = vt
}
const onPersonValueTypeChange = (row) => {
  row.value = row.valueType === 'select' ? [] : ''
  row.importedItems = []
}

// 导入弹窗
const importDialogVisible = ref(false)
const importTargetRow = ref(null)
const importSearch = ref('')
const importSelected = ref([])

const openImportDialog = (row) => {
  importTargetRow.value = row
  importSearch.value = ''
  importSelected.value = (row.importedItems || []).map(x => x.id)
  importDialogVisible.value = true
}

const importCandidates = computed(() => {
  if (!importTargetRow.value) return []
  const all = importSourceForField(importTargetRow.value.field)
  const kw = importSearch.value.trim().toLowerCase()
  if (!kw) return all
  return all.filter(x => x.id.toLowerCase().includes(kw) || x.name.toLowerCase().includes(kw))
})

const onImportSelectionChange = (sel) => {
  importSelected.value = sel.map(s => s.id)
}

const confirmImport = () => {
  const row = importTargetRow.value
  if (!row) return
  const all = importSourceForField(row.field)
  const items = all.filter(x => importSelected.value.includes(x.id))
  row.importedItems = items
  // 适用范围：value 字符串；规则条件门店：value 数组
  row.value = Array.isArray(row.value)
    ? items.map(x => x.id)
    : items.map(x => x.id).join(',')
  importDialogVisible.value = false
  ElMessage.success(`已导入 ${items.length} 项`)
}

const removeImportedItem = (row, idx) => {
  row.importedItems.splice(idx, 1)
  row.value = row.importedItems.map(x => x.id).join(',')
}

  // 输入参数
  const addParam = () => {
    data.value.inputParams.push({ id: '', name: '', type: 'string', desc: '' })
  }
  const removeParam = (idx) => data.value.inputParams.splice(idx, 1)

// 条件操作
const onCondTypeChange = (row) => {
  row.field = ''
  row.value = row.type === 'enum' ? [] : ''
  row.valueType = defaultCondValueType(row.type)
}
const onEnumFieldChange = (row) => { row.value = [] }
const onCondValueTypeChange = (row) => {
  row.value = row.type === 'enum' ? [] : ''
}

// 时段 / 日期范围：解析与更新（兼容数组 enum 维度 与 字符串 param）
const padTime = (t) => t ? String(t).padStart(5, '0') : ''
const parseTimeStart = (s) => s && s.includes('-') ? padTime(s.split('-')[0]) : ''
const parseTimeEnd = (s) => s && s.includes('-') ? padTime(s.split('-')[1]) : ''
const parseDateStart = (s) => s && s.includes('~') ? s.split('~')[0] : ''
const parseDateEnd = (s) => s && s.includes('~') ? s.split('~')[1] : ''
const parseDateTimeSingle = (s) => s || ''

const updateTimeRange = (row, i, idx, v) => {
  if (Array.isArray(row.value)) {
    const parts = (row.value[i] || '').split('-')
    parts[idx] = padTime(v)
    row.value[i] = parts.filter(Boolean).join('-')
  } else {
    const parts = (row.value || '').split('-')
    parts[idx] = padTime(v)
    row.value = parts.filter(Boolean).join('-')
  }
}
const updateDateRange = (row, i, idx, v) => {
  if (Array.isArray(row.value)) {
    const parts = (row.value[i] || '').split('~')
    parts[idx] = v || ''
    row.value[i] = parts.filter(Boolean).join('~')
  } else {
    const parts = (row.value || '').split('~')
    parts[idx] = v || ''
    row.value = parts.filter(Boolean).join('~')
  }
}
const updateDateTimeSingle = (row, i, v) => {
  if (Array.isArray(row.value)) {
    row.value[i] = v || ''
  } else {
    row.value = v || ''
  }
}
const addRangeValue = (row) => {
  if (!Array.isArray(row.value)) row.value = row.value ? [row.value] : []
  row.value.push('')
}
const removeRangeValue = (row, i) => {
  if (Array.isArray(row.value)) {
    row.value.splice(i, 1)
    // 收缩成单值或空
    if (row.value.length === 1) row.value = row.value[0]
    else if (row.value.length === 0) row.value = ''
  }
}
const rangesValue = (row) => Array.isArray(row.value) ? row.value : (row.value ? [row.value] : [])

// 规则条件字段类型：param 取 inputParams.type，enum 取 ENUM_DIM_TYPES
const paramTypeOf = (row) => {
  const p = data.value.inputParams.find(p => p.name === row.field)
  return p ? p.type : 'string'
}
const fieldTypeOf = (row) => {
  if (row.type === 'param') return paramTypeOf(row)
  if (row.type === 'enum') return ENUM_DIM_TYPES[row.field] || 'enum'
  return 'string'
}
// 按 param 类型给定运算符
const opsForRow = (row) => {
  if (row.type === 'param') return PARAM_TYPE_OPS[paramTypeOf(row)] || PARAM_TYPE_OPS.string
  if (row.type === 'enum') return PARAM_TYPE_OPS.enum
  return condOperators
}

// 规则条件：门店导入（复用导入弹窗，但同步到 value 数组）
const openRuleImportDialog = (row) => {
  importTargetRow.value = row
  importSearch.value = ''
  importSelected.value = Array.isArray(row.value) ? [...row.value] : []
  importDialogVisible.value = true
}

const addCondition = (rule) => {
  rule.conditions.push({ type: 'param', field: '', op: '等于', valueType: 'input', value: '' })
}
const removeCondition = (rule, idx) => rule.conditions.splice(idx, 1)

// 输出操作
// 规则操作
const addRule = () => {
  data.value.rules.push({ conditions: [], returnValues: [{ key: '', value: '' }] })
}
const removeRule = (idx) => data.value.rules.splice(idx, 1)
const duplicateRule = (idx) => {
  const src = data.value.rules[idx]
  const copy = JSON.parse(JSON.stringify(src))
  // 复制出的规则不携带原 id（避免与未来的服务端 ID 冲突）
  copy.id = ''
  data.value.rules.splice(idx + 1, 0, copy)
}
const moveRule = (idx, dir) => {
  const arr = data.value.rules
  const t = idx + dir
  if (t < 0 || t >= arr.length) return
  ;[arr[idx], arr[t]] = [arr[t], arr[idx]]
}

const addReturnValue = (rule) => {
  if (!rule.returnValues) rule.returnValues = []
  rule.returnValues.push({ key: '', value: '' })
}
const removeReturnValue = (rule, idx) => rule.returnValues.splice(idx, 1)


// 条件标签
const condLabel = (cond) => {
  const field = cond.field || cond.param || cond.dimension || '?'
  const v = Array.isArray(cond.value) ? cond.value.filter(Boolean).join('、') : (cond.value || '?')
  return `${field} ${cond.op} ${v}`
}

</script>

<style scoped>
.strategy-detail-page { padding: 0; }
.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-left h2 { margin: 0; font-size: 20px; font-weight: 600; }
.draft-tag { margin-left: -8px; }
.layer-tag { margin-left: -8px; }
.header-right { display: flex; gap: 8px; }
.content-section { background: hsl(var(--background)); border-radius: 8px; padding: 24px; box-shadow: var(--shadow-sm); }
.card { background: hsl(var(--muted) / 0.3); border-radius: 8px; padding: 20px; margin-bottom: 16px; }
.card h3 { font-size: 16px; font-weight: 600; margin: 0 0 16px 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.card-header h3 { margin: 0; }
.card-desc { font-size: 13px; color: hsl(var(--muted-foreground)); margin-bottom: 16px; }
.item-count { font-size: 13px; color: hsl(var(--muted-foreground)); }
.info-grid { display: flex; flex-wrap: wrap; gap: 24px; }
.info-item { display: flex; flex-direction: column; gap: 6px; }
.info-label { font-size: 13px; color: hsl(var(--muted-foreground)); }
.info-value { font-size: 14px; font-weight: 500; }
.range-section { margin-top: 16px; }
.scope-intro {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.5);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 16px;
}
.scope-row { margin-bottom: 16px; }
.scope-field { display: flex; flex-direction: column; gap: 6px; }
.scope-label { font-size: 13px; color: hsl(var(--muted-foreground)); }
.scope-value { font-size: 14px; font-weight: 500; }
.range-label { font-size: 14px; font-weight: 500; margin-bottom: 8px; }
.range-desc { font-size: 12px; color: hsl(var(--muted-foreground)); font-weight: normal; margin-left: 8px; }
.range-value { font-size: 14px; }
.empty-text { font-size: 13px; color: hsl(var(--muted-foreground)); }
.pending-id { color: hsl(var(--muted-foreground)); font-size: 12px; font-style: italic; }
.sample-text { font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 12px; color: hsl(var(--muted-foreground)); }
.param-tip { display: flex; align-items: center; gap: 6px; font-size: 12px; color: hsl(var(--muted-foreground)); margin-top: 10px; }

/* 适用范围：导入类已选展示 */
.input-with-import { display: flex; gap: 8px; align-items: center; }
.input-with-import .el-input { flex: 1; }
.imported-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.field-option { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.field-type-tag { font-size: 11px; color: hsl(var(--muted-foreground)); background: hsl(var(--muted) / 0.6); padding: 1px 6px; border-radius: 3px; }
.imported-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: hsl(var(--muted) / 0.5);
  border-radius: 16px;
  padding: 3px 10px 3px 6px;
  font-size: 12px;
  max-width: 100%;
}
.imported-chip.is-talent { padding: 4px 10px 4px 4px; }
.chip-avatar { background: hsl(var(--primary) / 0.15); color: hsl(var(--primary)); font-size: 12px; font-weight: 600; flex-shrink: 0; }
.chip-text { display: inline-flex; flex-direction: column; line-height: 1.2; gap: 1px; }
.chip-name { font-weight: 600; color: hsl(var(--foreground)); }
.chip-sub { font-size: 11px; color: hsl(var(--muted-foreground)); }
.chip-close { color: hsl(var(--muted-foreground)); cursor: pointer; flex-shrink: 0; }
.chip-close:hover { color: hsl(var(--destructive)); }

/* 只读模式：导入项展示 */
.ro-import-summary { display: inline-flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 13px; }
.ro-chip { background: hsl(var(--muted) / 0.6); border-radius: 4px; padding: 2px 8px; font-size: 12px; }
.ro-talent { display: inline-flex; align-items: center; gap: 6px; background: hsl(var(--muted) / 0.5); border-radius: 16px; padding: 3px 10px 3px 4px; margin: 2px 0; }
.ro-talent .chip-avatar { width: 22px; height: 22px; }
.ro-talent:not(:last-child) { margin-right: 6px; }

/* 规则条件：多项录入 */
.multi-value-cell, .multi-import-cell { display: flex; flex-direction: column; gap: 6px; }
.multi-import-cell { flex-direction: row; align-items: center; gap: 8px; }
.multi-import-cell .el-select { flex: 1; }
.range-row { display: flex; align-items: center; gap: 6px; }
.range-list { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.range-sep { color: hsl(var(--muted-foreground)); font-size: 12px; }
.dash { color: hsl(var(--muted-foreground)); font-size: 12px; }

/* 导入弹窗 */
.import-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.import-hint { font-size: 12px; color: hsl(var(--muted-foreground)); }
/* 规则只读 */
.rule-card-readonly { background: white; border: 1px solid hsl(var(--border)); border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; }
.rule-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.rule-no { font-weight: 600; font-size: 14px; }
.rule-fallback { font-size: 12px; color: hsl(var(--muted-foreground)); background: hsl(var(--muted)); padding: 2px 8px; border-radius: 4px; }
.rule-conditions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.cond-chip { background: hsl(var(--muted)); border-radius: 4px; padding: 3px 10px; font-size: 12px; }
.cond-chip.muted { color: hsl(var(--muted-foreground)); }
.rule-return-display { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.return-label { font-weight: 500; font-size: 13px; }
.return-chip { background: hsl(var(--muted)); border-radius: 4px; padding: 3px 10px; font-size: 12px; font-family: 'SF Mono', monospace; }
.return-empty { font-size: 12px; color: hsl(var(--muted-foreground)); }
.policy-display-readonly { background: hsl(var(--muted) / 0.4); border-radius: 6px; padding: 12px 16px; font-size: 14px; line-height: 1.8; white-space: pre-wrap; }
.policy-editor { display: flex; gap: 8px; align-items: flex-start; }
.policy-editor .el-button { flex-shrink: 0; }
.policy-hint { display: flex; align-items: center; gap: 6px; background: hsl(var(--muted) / 0.5); border-radius: 6px; padding: 10px 12px; font-size: 12px; color: hsl(var(--muted-foreground)); }

.policy-ai-tip { display: flex; align-items: flex-start; gap: 6px; background: #fff0f4; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; font-size: 12px; color: #a40035; line-height: 1.6; }
.policy-ai-actions { margin-top: 8px; display: flex; justify-content: flex-end; }
.out-formula-text { font-family: 'SF Mono', monospace; font-size: 14px; color: hsl(var(--foreground)); }
.rule-output-item { font-size: 13px; }
.out-name { font-weight: 500; }
.out-formula { font-family: 'SF Mono', monospace; color: hsl(var(--foreground)); }
/* 规则编辑 */
.rules-editor-tip { display: flex; align-items: center; gap: 6px; font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 12px; }
.rule-card-edit { background: white; border: 1px solid hsl(var(--border)); border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; }
.rule-card-actions { display: flex; gap: 4px; }
.rule-section-label { font-size: 13px; font-weight: 500; color: hsl(var(--muted-foreground)); margin-bottom: 6px; }
/* 预览 */
.hit-box { background: hsl(120 50% 95%); border: 1px solid hsl(120 50% 80%); border-radius: 8px; padding: 16px; }
.hit-header { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 15px; margin-bottom: 12px; }
.hit-conditions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.hit-conditions .cond-chip { background: white; }
.hit-outputs { display: flex; gap: 24px; }
.hit-output { display: flex; flex-direction: column; }
.out-label { font-size: 12px; color: hsl(var(--muted-foreground)); }
.out-value { font-size: 22px; font-weight: 700; }
.no-hit { display: flex; align-items: center; gap: 6px; color: hsl(var(--muted-foreground)); font-size: 13px; }
.empty { text-align: center; color: hsl(var(--muted-foreground)); padding: 60px 0; }
</style>
