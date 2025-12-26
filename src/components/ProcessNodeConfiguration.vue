<template>
  <div class="process-node-configuration">
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="110px" class="node-form">
      <!-- 基本信息 -->
      <el-card shadow="hover" class="form-card compact-card">
        <template #header>
          <div class="card-title-row">
            <h4>基本信息</h4>
          </div>
        </template>
        <el-row :gutter="16" class="compact-grid">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="名称" prop="name">
              <el-input v-model="formData.name" placeholder="节点名称" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="类型" prop="type">
              <el-select v-model="formData.type" placeholder="类型">
                <el-option label="开始" value="start" />
                <el-option label="中间" value="middle" />
                <el-option label="结束" value="end" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="顺序" prop="order">
              <el-input-number v-model="formData.order" :min="1" :max="99" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述">
              <el-input 
                v-model="formData.description" 
                type="textarea" 
                rows="3" 
                placeholder="节点描述（选填）"
                maxlength="200" 
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 产品端配置 -->
      <el-card shadow="hover" class="form-card" style="margin-top: 20px">
        <template #header>
          <h4>产品端配置</h4>
          <el-button type="primary" size="small" @click="addProductPortConfig">
            <el-icon-plus /> 新增产品端
          </el-button>
        </template>

        <div v-if="formData.productConfigs.length > 0">
          <el-tabs v-model="activeProductId" type="card" class="product-tabs product-tabs-compact">
            <el-tab-pane
              v-for="(productConfig, index) in formData.productConfigs"
              :key="productConfig.id"
              :name="productConfig.id"
            >
              <template #label>
                <div class="product-tab-label">
                  <span class="product-tab-name">{{ productConfig.productPort || `产品端${index + 1}` }}</span>
                  <el-tag size="small" type="info" v-if="!productConfig.productPort">未选择</el-tag>
                  <el-button
                    text
                    type="danger"
                    size="small"
                    @click.stop="removeProductPortConfig(index)"
                  >
                    删除
                  </el-button>
                </div>
              </template>

              <el-row :gutter="16" class="product-config-grid two-col-layout">
                <!-- 左列：产品端 + 权限树 -->
                <el-col :xs="24" :sm="24" :md="10" :lg="9" :xl="8">
                  <div class="left-column">
                    <el-form-item label="产品端口" :prop="`productConfigs.${index}.productPort`" required class="tight-item">
                      <el-select 
                        v-model="productConfig.productPort" 
                        placeholder="请选择产品端口" 
                        filterable 
                        style="width: 100%"
                        @change="handleProductPortChange(productConfig)"
                      >
                        <el-option 
                          v-for="port in productPorts" 
                          :key="port" 
                          :label="port" 
                          :value="port"
                        />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="权限选择" class="tight-item">
                      <el-tree
                        :ref="el => setPermissionTreeRef(el, index)"
                        :data="permissionTreeCache[productConfig.id] || []"
                        :default-checked-keys="productConfig.permissionIds || []"
                        show-checkbox
                        node-key="id"
                        :check-strictly="false"
                        :props="permissionTreeProps"
                        class="permission-tree"
                        @check="handlePermissionCheck(productConfig, $event, $event2)"
                        @check-change="handlePermissionCheckChange(productConfig, $event, $event2, $event3)"
                        :expand-on-click-node="false"
                        :default-expanded-keys="productConfig.expandedKeys || []"
                        :empty-text="productConfig.productPort ? '暂无权限数据' : '请先选择产品端口'"
                      >
                        <template #default="{ node, data }">
                          <span class="permission-node">
                            <span>{{ node.label }}</span>
                            <span class="permission-type-tag">
                              ({{ data.type === 'DIRECTORY' ? '目录' : data.type === 'PAGE' ? '页面' : data.type === 'FUNCTION' ? '功能/按钮' : data.type === 'API' ? 'API' : data.type }})
                            </span>
                            <span v-if="data.code" class="permission-code">({{ data.code }})</span>
                            <span v-else-if="data.apiUrl" class="permission-url">({{ data.apiUrl }})</span>
                          </span>
                        </template>
                      </el-tree>
                    </el-form-item>
                  </div>
                </el-col>

                <!-- 右列：API配置 -->
                <el-col :xs="24" :sm="24" :md="14" :lg="15" :xl="16">
                  <div class="api-config-section pnc-api-section">
                    <div class="api-config-title">
                      <h6>API配置</h6>
                      <el-tag size="small" type="info" v-if="getApiPermissionsByConfig(productConfig).length === 0">未选择API</el-tag>
                    </div>
                    <div v-if="getApiPermissionsByConfig(productConfig).length > 0">
                      <el-tabs
                        v-model="activeApiTabs[productConfig.id]"
                        type="card"
                        tab-position="left"
                        class="api-tabs vertical-tabs"
                        @tab-change="(name) => handleApiTabChange(productConfig.id, name)"
                      >
                        <el-tab-pane 
                          v-for="api in getApiPermissionsByConfig(productConfig)" 
                          :key="api.id" 
                          :name="api.id"
                        >
                          <template #label>
                            <div class="pnc-api-tab-label">
                              <span class="pnc-api-tab-name" :title="api.name">{{ api.name }}</span>
                              <span class="pnc-api-tab-method" :class="`method-${(api.method || 'GET').toLowerCase()}`">
                                {{ api.method || 'GET' }}
                              </span>
                              <el-tag 
                                size="small" 
                                :type="getApiStatusTagType(api.id, productConfig.id)"
                                effect="plain"
                              >
                                {{ getApiStatusText(api.id, productConfig.id) }}
                              </el-tag>
                            </div>
                          </template>

                          <div class="api-config-item">
                            <div class="api-config-header">
                              <span class="api-name">{{ api.name }}</span>
                              <div class="api-url-row">
                                <span class="api-method-badge">{{ api.method || 'GET' }}</span>
                                <span class="api-url">{{ api.apiUrl }}</span>
                              </div>
                            </div>
                            
                            <!-- 数据模型信息 -->
                            <el-form-item label="数据模型" class="api-model-info">
                              <div v-if="getApiModel(api.id, productConfig.id).domainObjects && getApiModel(api.id, productConfig.id).domainObjects.length > 0">
                                <div v-for="(domainObj, index) in getApiModel(api.id, productConfig.id).domainObjects" :key="index" class="domain-object-item">
                                  <el-tag size="large" style="margin-right: 10px; margin-bottom: 10px">
                                    {{ domainObj.domainName }} - {{ domainObj.objectName }}({{ domainObj.table }})
                                  </el-tag>
                                </div>
                              </div>
                              <div v-else>
                                <el-alert
                                  title="提示"
                                  type="warning"
                                  description="该API未配置数据模型，请在权限注册页面进行配置"
                                  :closable="false"
                                  style="margin-top: 10px"
                                />
                              </div>
                            </el-form-item>
                            
                            <!-- 数据条件配置 -->
                            <el-form-item label="数据条件">
                              <div class="data-condition-wrapper">
                                <!-- 检查是否有数据模型 -->
                                <div v-if="!getApiModel(api.id, productConfig.id).domainObjects || getApiModel(api.id, productConfig.id).domainObjects.length === 0" class="no-model-tip">
                                  <el-alert
                                    title="提示"
                                    type="warning"
                                    description="该API未配置数据域和数据对象，请在权限注册页面进行配置"
                                    :closable="false"
                                    show-icon
                                  />
                                </div>
                                
                                <!-- 有数据模型时的配置区域 -->
                                <div v-else class="condition-editor-wrapper">
                                  <!-- 关联的数据对象标签（公共信息） -->
                                  <div class="condition-header-row">
                                    <div class="data-objects-tags">
                                      <el-tag 
                                        v-for="obj in getApiModel(api.id, productConfig.id).domainObjects" 
                                        :key="obj.objectId"
                                        effect="plain"
                                      >
                                        {{ obj.objectName }}({{ obj.table }})
                                      </el-tag>
                                    </div>
                                  </div>

                                  <!-- 每个数据对象单独选择“数据策略 / 自定义”模式 -->
                                  <div 
                                    v-for="(obj, objIndex) in getApiModel(api.id, productConfig.id).domainObjects" 
                                    :key="obj.objectId"
                                    class="object-condition-section"
                                  >
                                    <!-- 数据对象标题、启用开关、模式切换 -->
                                    <div class="object-condition-header">
                                      <div class="object-title-section">
                                        <span class="object-title">{{ obj.objectName }}({{ obj.table }})</span>
                                        <el-switch 
                                          v-model="getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].enabled"
                                          active-text="启用条件"
                                          inactive-text="禁用条件"
                                          size="small"
                                          @change="handleObjectConditionEnabledChange(api.id, productConfig.id, obj.objectId)"
                                        />
                                      </div>
                                      <div class="object-mode-section">
                                        <el-radio-group
                                          v-model="getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].mode"
                                          size="small"
                                        >
                                          <el-radio-button value="strategy">数据策略</el-radio-button>
                                          <el-radio-button value="custom">自定义</el-radio-button>
                                        </el-radio-group>
                                      </div>
                                    </div>

                                    <!-- 策略模式：为当前对象选择公共数据策略 -->
                                    <div 
                                      v-if="getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].enabled && getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].mode === 'strategy'"
                                      class="strategy-object-config-block"
                                    >
                                      <!-- 对象级数据策略选择（只展示与该对象关联的策略） -->
                                      <el-select
                                        v-model="getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].dataRuleId"
                                        placeholder="请选择数据策略"
                                        filterable
                                        clearable
                                        style="width: 100%; margin-top: 6px;"
                                        :disabled="!getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].enabled"
                                        @change="(val) => handleDataRuleChange(api.id, productConfig.id, obj.objectId, val)"
                                      >
                                        <el-option
                                          v-for="rule in getAvailableDataRules(api.id, productConfig.id, obj.objectId)"
                                          :key="rule.id"
                                          :label="`${rule.name}（${rule.description || '无描述'}）`"
                                          :value="rule.id"
                                        >
                                          <div class="data-rule-option">
                                            <div class="rule-name">{{ rule.name }}</div>
                                            <div class="rule-info">
                                              <span class="rule-domain">{{ getDomainLabel(rule.domain) }}</span>
                                              <span class="rule-separator">·</span>
                                              <span class="rule-object">{{ getObjectLabel(rule.domain, rule.objectId) }}</span>
                                            </div>
                                            <div v-if="rule.description" class="rule-description">{{ rule.description }}</div>
                                          </div>
                                        </el-option>
                                      </el-select>

                                      <!-- 当前对象所选策略的条件预览 -->
                                      <div
                                        v-if="getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].dataRuleId"
                                        class="strategy-preview-section object-preview-section"
                                      >
                                        <div class="strategy-preview-header">
                                          <span class="preview-title">应用的条件</span>
                                          <el-tag type="success" size="small">
                                            {{ getSelectedDataRuleName(api.id, productConfig.id, obj.objectId) }}
                                          </el-tag>
                                        </div>
                                        <div
                                          v-if="getApiModel(api.id, productConfig.id).objectConditions[obj.objectId]?.conditions && getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].conditions.length > 0"
                                          class="strategy-conditions-grid"
                                        >
                                          <div
                                            v-for="(condition, index) in getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].conditions"
                                            :key="`condition-${index}`"
                                            class="strategy-condition-card"
                                          >
                                            <span v-if="index > 0" class="condition-logic">{{ condition.relation }}</span>
                                            <div class="condition-content">
                                              <span class="condition-field">{{ getFieldLabelByValue(obj.table, condition.attribute) || condition.attribute }}</span>
                                              <span class="condition-op">{{ getOperatorLabel(condition.operator) }}</span>
                                              <span class="condition-val">{{ condition.value || '(空)' }}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div v-else class="no-conditions-tip">暂无条件</div>
                                      </div>
                                    </div>

                                    <!-- 自定义模式：当前对象自定义条件 -->
                                    <div 
                                      v-else-if="getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].enabled && getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].mode === 'custom'"
                                      class="object-conditions-content"
                                    >
                                      <!-- 工具栏：添加条件按钮 -->
                                      <div class="custom-condition-toolbar">
                                        <el-button 
                                          type="primary" 
                                          size="small" 
                                          @click="addObjectCondition(api.id, productConfig.id, obj.objectId)"
                                        >
                                          <el-icon-plus /> 添加条件
                                        </el-button>
                                      </div>
                                      <!-- 条件列表 -->
                                      <div class="object-conditions-list">
                                        <div 
                                          v-for="(condition, index) in getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].conditions" 
                                          :key="`condition-${index}`" 
                                          class="condition-item"
                                        >
                                          <el-row :gutter="16" align="middle" class="condition-row">
                                            <!-- 条件关系选择（除第一个条件外，每个条件前都有关系选择） -->
                                            <el-col v-if="index > 0" :xs="24" :sm="6" :md="5" :lg="4">
                                              <el-select 
                                                v-model="condition.relation" 
                                                placeholder="关系" 
                                                style="width: 100%"
                                                class="condition-relation-select"
                                              >
                                                <el-option label="AND" value="AND" />
                                                <el-option label="OR" value="OR" />
                                              </el-select>
                                            </el-col>
                                            
                                            <!-- 属性选择 -->
                                            <el-col :xs="24" :sm="index > 0 ? 5 : 7" :md="index > 0 ? 5 : 6" :lg="index > 0 ? 5 : 6">
                                              <el-select 
                                                v-model="condition.attribute" 
                                                placeholder="选择属性" 
                                                style="width: 100%"
                                                filterable
                                                class="condition-attribute-select"
                                              >
                                                <el-option 
                                                  v-for="field in getFieldsByTableForRules(obj.table)" 
                                                  :key="field.value" 
                                                  :label="field.label" 
                                                  :value="field.value"
                                                >
                                                  <div class="field-option">
                                                    <span>{{ field.label }}</span>
                                                    <span class="field-type">({{ field.type }})</span>
                                                  </div>
                                                </el-option>
                                              </el-select>
                                            </el-col>
                                            
                                            <!-- 操作符选择 -->
                                            <el-col :xs="24" :sm="index > 0 ? 5 : 6" :md="index > 0 ? 5 : 6" :lg="index > 0 ? 5 : 6">
                                              <el-select 
                                                v-model="condition.operator" 
                                                placeholder="选择操作符" 
                                                style="width: 100%"
                                                class="condition-operator-select"
                                              >
                                                <el-option label="等于" value="eq" />
                                                <el-option label="不等于" value="ne" />
                                                <el-option label="大于" value="gt" />
                                                <el-option label="小于" value="lt" />
                                                <el-option label="大于等于" value="gte" />
                                                <el-option label="小于等于" value="lte" />
                                                <el-option label="包含" value="in" />
                                                <el-option label="不包含" value="nin" />
                                                <el-option label="为空" value="null" />
                                                <el-option label="不为空" value="notnull" />
                                              </el-select>
                                            </el-col>
                                            
                                            <!-- 值输入框 -->
                                            <el-col :xs="24" :sm="index > 0 ? 6 : 8" :md="index > 0 ? 6 : 7" :lg="index > 0 ? 7 : 8">
                                              <el-input 
                                                v-model="condition.value" 
                                                placeholder="输入值（为空/不为空时无需输入）" 
                                                style="width: 100%"
                                                :disabled="condition.operator === 'null' || condition.operator === 'notnull'"
                                                clearable
                                                class="condition-value-input"
                                              />
                                            </el-col>
                                            
                                            <!-- 删除按钮 -->
                                            <el-col :xs="24" :sm="3" :md="3" :lg="2">
                                              <div class="condition-action">
                                                <el-button 
                                                  type="danger" 
                                                  plain
                                                  class="condition-delete-btn"
                                                  @click="removeObjectCondition(api.id, productConfig.id, obj.objectId, index)"
                                                  :icon="ElIconDelete"
                                                />
                                              </div>
                                            </el-col>
                                          </el-row>
                                        </div>
                                        
                                        <!-- 空状态提示 -->
                                        <div v-if="!getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].conditions || getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].conditions.length === 0" class="empty-conditions">
                                          <el-empty description="暂无条件，请点击上方添加条件按钮添加" :image-size="80" />
                                        </div>
                                      </div>
                                      
                                      <!-- 条件说明提示 -->
                                      <div v-if="getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].conditions && getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].conditions.length > 1" class="condition-tip">
                                        <el-icon><InfoFilled /></el-icon>
                                        <span>提示：第一个条件无需选择关系，后续条件可通过关系选择器设置与前一条件的关系（AND/OR）</span>
                                      </div>
                                    </div>

                                    <!-- 禁用状态提示 -->
                                    <div 
                                      v-else 
                                      class="disabled-condition-tip"
                                    >
                                      <el-alert
                                        title="该数据对象的条件配置已禁用"
                                        type="info"
                                        description="如需配置条件，请启用上方的开关"
                                        :closable="false"
                                        show-icon
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </el-form-item>
                            
                            <!-- 列权限配置 -->
                            <el-form-item label="列权限">
                              <div v-if="getApiModel(api.id, productConfig.id).domainObjects && getApiModel(api.id, productConfig.id).domainObjects.length > 0" class="column-permission-container">
                                <!-- 为每个数据对象显示列权限 -->
                                <div v-for="(obj, objIndex) in getApiModel(api.id, productConfig.id).domainObjects" :key="obj.objectId" class="column-permission-section">
                                  <div class="column-permission-header">
                                    <span class="column-permission-title">{{ obj.objectName }}({{ obj.table }}) - 列权限配置</span>
                                  </div>
                                  <div v-if="getApiColumnsByObject(api.id, productConfig.id, obj.objectId, obj.table).length > 0">
                                    <el-table 
                                      :data="getApiColumnsByObject(api.id, productConfig.id, obj.objectId, obj.table)" 
                                      style="width: 100%; margin-top: 10px" 
                                      border 
                                      size="small"
                                    >
                                      <el-table-column prop="fieldName" label="字段名称" width="180" />
                                      <el-table-column prop="fieldType" label="字段类型" width="100" />
                                      <el-table-column label="可见/隐藏" width="100" align="center">
                                        <template #default="scope">
                                          <el-switch 
                                            v-model="scope.row.visible" 
                                            active-text="可见"
                                            inactive-text="隐藏"
                                            inline-prompt
                                            style="--el-switch-on-color: #67c23a; --el-switch-off-color: #909399"
                                          />
                                        </template>
                                      </el-table-column>
                                      <el-table-column label="脱敏" width="100" align="center">
                                        <template #default="scope">
                                          <el-switch 
                                            v-model="scope.row.mask" 
                                            active-text="是"
                                            inactive-text="否"
                                            inline-prompt
                                            :disabled="!scope.row.visible"
                                            style="--el-switch-on-color: #e6a23c; --el-switch-off-color: #909399"
                                          />
                                        </template>
                                      </el-table-column>
                                      <el-table-column label="可编辑/只读" width="120" align="center">
                                        <template #default="scope">
                                          <el-switch 
                                            v-model="scope.row.editable" 
                                            active-text="可编辑"
                                            inactive-text="只读"
                                            inline-prompt
                                            :disabled="!scope.row.visible"
                                            style="--el-switch-on-color: #409eff; --el-switch-off-color: #909399"
                                          />
                                        </template>
                                      </el-table-column>
                                    </el-table>
                                  </div>
                                  <div v-else class="no-columns-tip">
                                    <el-alert
                                      title="提示"
                                      type="warning"
                                      :description="`该数据对象(${obj.table})的字段数据未配置，请在系统配置中添加表字段定义`"
                                      :closable="false"
                                      show-icon
                                    />
                                  </div>
                                </div>
                              </div>
                              <div v-else class="no-table-selected">
                                <el-alert
                                  title="提示"
                                  type="warning"
                                  description="该API未配置数据域和数据对象，请在权限注册页面进行配置"
                                  :closable="false"
                                  show-icon
                                />
                              </div>
                            </el-form-item>
                          </div>
                        </el-tab-pane>
                      </el-tabs>
                    </div>
                    <div v-else class="no-api-data">
                      请先选择API权限
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-else class="no-data">
          请点击上方"新增产品端"按钮开始配置
        </div>
      </el-card>
      
      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存节点</el-button>
      </div>
    </el-form>
    

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { permissions as allPermissions, dataRules } from '../mock/data'
import {
  Plus as ElIconPlus,
  Delete as ElIconDelete,
  InfoFilled
} from '@element-plus/icons-vue'

// 接收父组件传入的props
const props = defineProps({
  node: {
    type: Object,
    default: null
  },
  processId: {
    type: String,
    required: true
  },
  availableNodes: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['save', 'cancel'])

// 响应式数据
const formRef = ref(null)
const permissionTreeRefs = ref([]) // 权限树引用数组
const permissionTreeCache = ref({}) // 权限树缓存，防止树收缩
const activeApiTabs = ref({}) // 每个产品端的API选项卡激活状态
const activeProductId = ref('') // 当前激活的产品端Tab
const formData = ref({
  id: '',
  processId: props.processId,
  name: '',
  type: 'middle',
  order: 1,
  description: '',
  productConfigs: [], // 多产品端配置
  nextNodes: [],
  condition: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入节点名称', trigger: 'blur' },
    { min: 1, max: 50, message: '节点名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择节点类型', trigger: 'change' }
  ],
  order: [
    { required: true, message: '请输入节点顺序', trigger: 'blur' }
  ]
}

// 获取所有产品端口
const productPorts = computed(() => {
  const ports = new Set()
  allPermissions.forEach(perm => {
    if (perm.productPort) {
      ports.add(perm.productPort)
    }
  })
  return Array.from(ports).sort()
})

// 权限树属性配置
const permissionTreeProps = {
  children: 'children',
  label: 'name',
  disabled: false
}

// 数据域和数据对象定义（与Permission.vue保持一致）
const dataDomains = {
  'order': {
    name: '订单数据域',
    objects: [
      { id: 'order_order', name: '服务订单数据对象', table: 'orders' },
      { id: 'order_customer', name: '客户数据对象', table: 'customers' },
      { id: 'order_product', name: '产品数据对象', table: 'products' },
      { id: 'order_payment', name: '支付数据对象', table: 'payments' },
      { id: 'order_refund', name: '退款数据对象', table: 'refunds' }
    ]
  },
  'coupon': {
    name: '优惠券数据域',
    objects: [
      { id: 'coupon_coupon', name: '优惠券数据对象', table: 'coupons' },
      { id: 'coupon_campaign', name: '优惠券活动数据对象', table: 'coupon_campaigns' }
    ]
  },
  'service': {
    name: '服务数据域',
    objects: [
      { id: 'service_service', name: '服务数据对象', table: 'services' },
      { id: 'service_provider', name: '服务提供者数据对象', table: 'service_providers' },
      { id: 'service_feedback', name: '服务反馈数据对象', table: 'service_feedback' }
    ]
  },
  'hr': {
    name: 'HR数据域',
    objects: [
      { id: 'hr_candidate', name: '候选人数据对象', table: 'candidates' },
      { id: 'hr_employee', name: '员工数据对象', table: 'employees' },
      { id: 'hr_interview', name: '面试数据对象', table: 'interviews' },
      { id: 'hr_offer', name: 'Offer数据对象', table: 'offers' }
    ]
  },
  'permission': {
    name: '权限数据域',
    objects: [
      { id: 'permission_user', name: '用户数据对象', table: 'users' },
      { id: 'permission_role', name: '角色数据对象', table: 'roles' },
      { id: 'permission_permission', name: '权限数据对象', table: 'permissions' }
    ]
  },
  'learning': {
    name: '学习培训数据域',
    objects: [
      { id: 'learning_course', name: '课程数据对象', table: 'courses' },
      { id: 'learning_enrollment', name: '课程报名数据对象', table: 'course_enrollments' },
      { id: 'learning_progress', name: '学习进度数据对象', table: 'learning_progress' },
      { id: 'learning_record', name: '学习记录数据对象', table: 'learning_records' }
    ]
  },
  'exam': {
    name: '考试认证数据域',
    objects: [
      { id: 'exam_exam', name: '考试数据对象', table: 'exams' },
      { id: 'exam_enrollment', name: '考试报名数据对象', table: 'exam_enrollments' },
      { id: 'exam_answer', name: '考试答案数据对象', table: 'exam_answers' },
      { id: 'exam_score', name: '考试成绩数据对象', table: 'exam_scores' },
      { id: 'exam_certificate', name: '证书数据对象', table: 'certificates' }
    ]
  },
  'skill': {
    name: '技能提升数据域',
    objects: [
      { id: 'skill_assessment', name: '技能评估数据对象', table: 'skill_assessments' },
      { id: 'skill_plan', name: '提升计划数据对象', table: 'skill_plans' },
      { id: 'skill_certification', name: '技能认证数据对象', table: 'skill_certifications' }
    ]
  },
  'certificate': {
    name: '证书管理数据域',
    objects: [
      { id: 'certificate_certificate', name: '证书数据对象', table: 'certificates' },
      { id: 'certificate_renewal', name: '证书续期数据对象', table: 'certificate_renewals' }
    ]
  }
}

// 模拟表字段数据（列权限采用三组独立配置：visible/mask/editable）
const tableFields = {
  candidates: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'phone', fieldType: 'string', visible: true, mask: true, editable: true },
    { fieldName: 'email', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'experience', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'education', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'position', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true }
  ],
  resumes: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'candidateId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'fileName', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'fileUrl', fieldType: 'string', visible: false, mask: false, editable: false },
    { fieldName: 'uploadTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  interviews: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'candidateId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'interviewTime', fieldType: 'datetime', visible: true, mask: false, editable: true },
    { fieldName: 'interviewerId', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'result', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'score', fieldType: 'number', visible: true, mask: false, editable: true },
    { fieldName: 'comment', fieldType: 'string', visible: true, mask: false, editable: true }
  ],
  offers: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'candidateId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'position', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'salary', fieldType: 'number', visible: true, mask: true, editable: true },
    { fieldName: 'startDate', fieldType: 'date', visible: true, mask: false, editable: true },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true }
  ],
  employees: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'position', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'department', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'hireDate', fieldType: 'date', visible: true, mask: false, editable: false },
    { fieldName: 'salary', fieldType: 'number', visible: false, mask: false, editable: false }
  ],
  onboarding: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'employeeId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'documents', fieldType: 'array', visible: true, mask: false, editable: true },
    { fieldName: 'startDate', fieldType: 'date', visible: true, mask: false, editable: true }
  ],
  training: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'employeeId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'courseName', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'trainer', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'trainingDate', fieldType: 'date', visible: true, mask: false, editable: true },
    { fieldName: 'result', fieldType: 'string', visible: true, mask: false, editable: true }
  ],
  assessments: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'employeeId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'assessmentType', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'score', fieldType: 'number', visible: true, mask: false, editable: true },
    { fieldName: 'result', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'assessmentDate', fieldType: 'date', visible: true, mask: false, editable: false }
  ],
  orders: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'customerId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'amount', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'createTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  // 权限数据域相关表
  users: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'username', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'departmentId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'organizationId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'role', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'email', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'phone', fieldType: 'string', visible: true, mask: true, editable: false }
  ],
  roles: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'description', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'createTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  permissions: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'code', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'type', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'description', fieldType: 'string', visible: true, mask: false, editable: false }
  ],
  // 订单数据域相关表
  customers: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'phone', fieldType: 'string', visible: true, mask: true, editable: false },
    { fieldName: 'email', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'address', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'vipLevel', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'createTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  products: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'price', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'category', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'description', fieldType: 'string', visible: true, mask: false, editable: false }
  ],
  payments: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'orderId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'amount', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'paymentMethod', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'payTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  refunds: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'orderId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'amount', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'reason', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'refundTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  // 优惠券数据域相关表
  coupons: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'amount', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'type', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'expireTime', fieldType: 'datetime', visible: true, mask: false, editable: false },
    { fieldName: 'useTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  coupon_campaigns: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'description', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'startTime', fieldType: 'datetime', visible: true, mask: false, editable: false },
    { fieldName: 'endTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  // 服务数据域相关表
  services: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'type', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'duration', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'price', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true }
  ],
  service_providers: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'phone', fieldType: 'string', visible: true, mask: true, editable: false },
    { fieldName: 'level', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'rating', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true }
  ],
  service_feedback: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'orderId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'rating', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'comment', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'createTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  // C端学习培训数据域相关表
  courses: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'description', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'category', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'duration', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'createTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  course_enrollments: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'userId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'courseId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'enrollTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  learning_progress: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'userId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'courseId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'progress', fieldType: 'number', visible: true, mask: false, editable: true },
    { fieldName: 'lastStudyTime', fieldType: 'datetime', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true }
  ],
  learning_records: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'userId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'courseId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'action', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'duration', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'createTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  // C端考试认证数据域相关表
  exams: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'name', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'description', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'category', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'duration', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'passScore', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'createTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  exam_enrollments: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'userId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'examId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'enrollTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  exam_answers: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'userId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'examId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'questionId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'answer', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'submitTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  exam_scores: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'userId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'examId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'score', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'passStatus', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'examTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  certificates: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'userId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'examId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'certificateNo', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'issueDate', fieldType: 'date', visible: true, mask: false, editable: false },
    { fieldName: 'expireDate', fieldType: 'date', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true }
  ],
  // C端技能提升数据域相关表
  skill_assessments: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'userId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'skillType', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'score', fieldType: 'number', visible: true, mask: false, editable: false },
    { fieldName: 'level', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'assessTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  skill_plans: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'userId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'skillType', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'targetLevel', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'planContent', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'createTime', fieldType: 'datetime', visible: true, mask: false, editable: false }
  ],
  skill_certifications: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'userId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'skillType', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'certificateNo', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'level', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'issueDate', fieldType: 'date', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true }
  ],
  // C端证书管理数据域相关表
  certificate_renewals: [
    { fieldName: 'id', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'userId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'certificateId', fieldType: 'string', visible: true, mask: false, editable: false },
    { fieldName: 'applyTime', fieldType: 'datetime', visible: true, mask: false, editable: false },
    { fieldName: 'status', fieldType: 'string', visible: true, mask: false, editable: true },
    { fieldName: 'reviewTime', fieldType: 'datetime', visible: true, mask: false, editable: false },
    { fieldName: 'newExpireDate', fieldType: 'date', visible: true, mask: false, editable: false }
  ]
}

// 设置权限树引用
const setPermissionTreeRef = (el, index) => {
  if (el) {
    permissionTreeRefs.value[index] = el
  }
}

// 根据产品端口过滤权限
const getPermissionsByPort = (productPort) => {
  if (!productPort) {
    return []
  }
  return allPermissions.filter(perm => perm.productPort === productPort)
}

// 根据产品端口构建权限树
const getPermissionTreeByPort = (productPort) => {
  const perms = getPermissionsByPort(productPort)
  const tree = []
  
  // 按类型分组
  const directoryPerms = perms.filter(p => p.type === 'DIRECTORY')
  const pagePerms = perms.filter(p => p.type === 'PAGE')
  const functionPerms = perms.filter(p => p.type === 'FUNCTION')
  const apiPerms = perms.filter(p => p.type === 'API')
  
  // 构建目录节点
  directoryPerms.forEach(dir => {
    const dirNode = { ...dir, children: [] }
    
    // 添加页面节点
    const pages = pagePerms.filter(p => p.parentId === dir.id)
    pages.forEach(page => {
      const pageNode = { ...page, children: [] }
      
      // 添加功能按钮节点
      const funcs = functionPerms.filter(f => f.parentId === page.id)
      funcs.forEach(func => {
        const funcNode = { ...func, children: [] }
        
        // 添加API节点（API作为FUNCTION的子节点）
        const apis = apiPerms.filter(a => func.apiPermissions?.includes(a.id))
        apis.forEach(api => {
          funcNode.children.push({ ...api })
        })
        
        pageNode.children.push(funcNode)
      })
      
      dirNode.children.push(pageNode)
    })
    
    tree.push(dirNode)
  })
  
  return tree
}

// 获取数据库的表列表
const getTablesByDatabase = (database) => {
  if (!database) {
    return []
  }
  return databases[database]?.tables || []
}

// 添加产品端配置
const addProductPortConfig = () => {
  const newConfig = {
    id: `product-config-${Date.now()}`,
    productPort: '',
    permissionIds: [],
    permissions: [], // 页面权限
    buttonPermissions: [], // 按钮权限
    apiPermissions: [], // API权限
    apiConfigs: {}, // API配置，包含数据模型和列权限
    expandedKeys: [] // 扩展节点ID
  }
  formData.value.productConfigs.push(newConfig)
  
  // 初始化权限树缓存
  permissionTreeCache.value[newConfig.id] = []
  activeApiTabs.value[newConfig.id] = undefined
  activeProductId.value = newConfig.id
  
  // 初始化API配置
  newConfig.apiConfigs = {}
}

// 删除产品端配置
const removeProductPortConfig = (index) => {
  const config = formData.value.productConfigs[index]
  if (config) {
    delete permissionTreeCache.value[config.id]
    delete activeApiTabs.value[config.id]
  }
  formData.value.productConfigs.splice(index, 1)
  
  // 更新权限树引用数组
  permissionTreeRefs.value.splice(index, 1)
  
  // 重置激活的产品端
  if (formData.value.productConfigs.length > 0) {
    activeProductId.value = formData.value.productConfigs[0].id
  } else {
    activeProductId.value = ''
  }
}

// 处理产品端口变化
const handleProductPortChange = (productConfig) => {
  // 防止重复产品端
  if (productConfig.productPort) {
    const duplicated = formData.value.productConfigs.some(
      cfg => cfg !== productConfig && cfg.productPort === productConfig.productPort
    )
    if (duplicated) {
      ElMessage.warning('该产品端已添加，不能重复配置')
      productConfig.productPort = ''
      return
    }
  }

  // 清空之前的选择
  productConfig.permissionIds = []
  productConfig.permissions = []
  productConfig.buttonPermissions = []
  productConfig.apiPermissions = []
  productConfig.apiConfigs = {}
  activeApiTabs.value[productConfig.id] = undefined
  
  // 重新构建权限树并缓存
  if (productConfig.productPort) {
    const treeData = getPermissionTreeByPort(productConfig.productPort)
    permissionTreeCache.value[productConfig.id] = treeData
    
    // 初始化扩展节点
    const expandedKeys = []
    // 自动扩展目录和页面节点
    const collectExpandedKeys = (nodes) => {
      nodes.forEach(node => {
        if (node.type === 'DIRECTORY' || node.type === 'PAGE') {
          expandedKeys.push(node.id)
        }
        if (node.children && node.children.length > 0) {
          collectExpandedKeys(node.children)
        }
      })
    }
    collectExpandedKeys(treeData)
    productConfig.expandedKeys = expandedKeys
  } else {
    permissionTreeCache.value[productConfig.id] = []
    productConfig.expandedKeys = []
  }
}

// 处理权限选择
const handlePermissionCheck = (productConfig, data, treeObj) => {
  // 确保permissionIds是数组
  if (treeObj && treeObj.checkedKeys) {
    // 直接使用tree组件提供的checkedKeys，确保所有选中的权限都被包含
    productConfig.permissionIds = [...treeObj.checkedKeys]
    // 立即更新权限
    handlePermissionUpdate(productConfig)
  }
}

// 处理权限变化
const handlePermissionCheckChange = (productConfig, data, checked, indeterminate) => {
  // 获取当前产品配置在数组中的索引
  const index = formData.value.productConfigs.indexOf(productConfig)
  // 获取对应的权限树引用
  const treeRef = permissionTreeRefs.value[index]
  
  if (treeRef) {
    // 重新获取所有选中的权限ID
    productConfig.permissionIds = [...treeRef.getCheckedKeys()]
  }
  
  // 立即更新权限
  handlePermissionUpdate(productConfig)
}

// 更新权限列表
const handlePermissionUpdate = (productConfig) => {
  if (!productConfig || !productConfig.productPort) {
    return
  }
  
  const perms = getPermissionsByPort(productConfig.productPort)
  const pagePerms = []
  const buttonPerms = []
  const allApiPermissions = new Set()
  
  // 确保permissionIds是数组
  if (!Array.isArray(productConfig.permissionIds)) {
    productConfig.permissionIds = []
  }
  
  // 1. 收集所有直接选中的API权限
  productConfig.permissionIds.forEach(permId => {
    const perm = perms.find(p => p.id === permId)
    if (perm && perm.type === 'API') {
      allApiPermissions.add(permId)
    }
  })
  
  // 2. 收集所有FUNCTION权限关联的API权限
  productConfig.permissionIds.forEach(permId => {
    const perm = perms.find(p => p.id === permId)
    if (perm && perm.type === 'FUNCTION' && perm.apiPermissions) {
      perm.apiPermissions.forEach(apiId => {
        // 添加到permissionIds数组（如果不存在）
        if (!productConfig.permissionIds.includes(apiId)) {
          productConfig.permissionIds.push(apiId)
        }
        allApiPermissions.add(apiId)
      })
    }
  })
  
  // 3. 处理页面和按钮权限
  productConfig.permissionIds.forEach(permId => {
    const perm = perms.find(p => p.id === permId)
    if (perm) {
      switch (perm.type) {
        case 'PAGE':
          pagePerms.push(permId)
          break
        case 'FUNCTION':
          buttonPerms.push(permId)
          break
      }
    }
  })
  
  // 将Set转换为数组
  const finalApiPerms = Array.from(allApiPermissions)
  
  // 更新权限数组
  productConfig.permissions = pagePerms
  productConfig.buttonPermissions = buttonPerms
  productConfig.apiPermissions = finalApiPerms
  
  // 确保apiConfigs存在
  if (!productConfig.apiConfigs) {
    productConfig.apiConfigs = {}
  }
  
  // 初始化API配置
  finalApiPerms.forEach(apiId => {
    if (!productConfig.apiConfigs[apiId]) {
      // 从API权限定义中获取数据域和数据对象信息
      const productPort = productConfig.productPort
      const apiPerm = allPermissions.find(p => p.id === apiId && p.productPort === productPort)
      
      // 处理数据域和数据对象
      const domainObjects = []
      const objectConditions = {}
      if (apiPerm?.dataDomainObjects) {
        apiPerm.dataDomainObjects.forEach(item => {
          const domain = dataDomains[item.domain]
          if (domain) {
            const dataObject = domain.objects.find(obj => obj.id === item.objectId)
            if (dataObject) {
              domainObjects.push({
                domainName: domain.name,
                objectName: dataObject.name,
                table: dataObject.table,
                objectId: item.objectId
              })
              // 为每个数据对象初始化条件
              objectConditions[item.objectId] = {
                conditions: [],
                relation: 'AND', // 模型内条件默认关系为AND
                enabled: true, // 默认为启用状态
                mode: 'strategy', // 默认按数据策略模式
                dataRuleId: null // 对象级数据策略选择
              }
            }
          }
        })
      }
      
      productConfig.apiConfigs[apiId] = {
        domainObjects: domainObjects,
        objectConditions: objectConditions,
        modelRelation: 'AND', // 模型间默认关系为AND
        columns: [], // 兼容旧代码
        objectColumns: {}, // 按数据对象存储列配置
        conditionMode: 'strategy' // 默认数据策略模式（对象级策略）
      }
    }
  })
}

// 获取产品配置中的API权限列表
const getApiPermissionsByConfig = (productConfig) => {
  if (!productConfig || !productConfig.productPort) {
    return []
  }
  
  // 确保apiPermissions是数组
  if (!Array.isArray(productConfig.apiPermissions)) {
    productConfig.apiPermissions = []
  }
  
  const perms = getPermissionsByPort(productConfig.productPort)
  const apiList = perms.filter(p => p.type === 'API' && productConfig.apiPermissions.includes(p.id))
  // 初始化选中的API Tab，保证有默认值
  if (!activeApiTabs.value[productConfig.id] && apiList.length > 0) {
    activeApiTabs.value[productConfig.id] = apiList[0].id
  }
  return apiList
}

// API选项卡切换
const handleApiTabChange = (configId, apiId) => {
  activeApiTabs.value[configId] = apiId
}

// 获取API的数据模型配置
const getApiModel = (apiId, configId) => {
  const productConfig = formData.value.productConfigs.find(c => c.id === configId)
  if (productConfig) {
    if (!productConfig.apiConfigs) {
      productConfig.apiConfigs = {}
    }
    if (!productConfig.apiConfigs[apiId]) {
      // 从API权限定义中获取数据域和数据对象信息
      const productPort = productConfig.productPort
      const apiPerm = allPermissions.find(p => p.id === apiId && p.productPort === productPort)
      
      // 处理数据域和数据对象
      const domainObjects = []
      const objectConditions = {}
      if (apiPerm?.dataDomainObjects) {
        apiPerm.dataDomainObjects.forEach(item => {
          const domain = dataDomains[item.domain]
          if (domain) {
            const dataObject = domain.objects.find(obj => obj.id === item.objectId)
            if (dataObject) {
              domainObjects.push({
                domainName: domain.name,
                objectName: dataObject.name,
                table: dataObject.table,
                objectId: item.objectId
              })
              // 为每个数据对象初始化条件
              objectConditions[item.objectId] = {
                conditions: [],
                relation: 'AND', // 模型内条件默认关系为AND
                enabled: true, // 默认为启用状态
                mode: 'strategy', // 默认按数据策略模式
                dataRuleId: null // 对象级数据策略选择
              }
            }
          }
        })
      }
      
      productConfig.apiConfigs[apiId] = {
        domainObjects: domainObjects,
        objectConditions: objectConditions,
        modelRelation: 'AND', // 模型间默认关系为AND
        columns: [], // 兼容旧代码
        objectColumns: {}, // 按数据对象存储列配置
        conditionMode: 'strategy' // 默认数据策略模式（兼容字段）
      }
    }
    const apiConfig = productConfig.apiConfigs[apiId]

    // 兼容旧数据：为每个对象补充 mode 和 dataRuleId 默认值
    if (apiConfig && apiConfig.objectConditions) {
      Object.values(apiConfig.objectConditions).forEach(cond => {
        if (cond && cond.enabled === undefined) {
          cond.enabled = true
        }
        if (cond && !cond.mode) {
          cond.mode = 'strategy'
        }
        if (cond && cond.dataRuleId === undefined) {
          cond.dataRuleId = null
        }
      })
    }

    return apiConfig
  }
  // 默认值
  return { domainObjects: [], objectConditions: {}, modelRelation: 'AND', columns: [], objectColumns: {}, conditionMode: 'strategy' }
}

// 判断API是否已配置（用于Tab状态显示）
const isApiConfigured = (apiId, configId) => {
  const apiConfig = getApiModel(apiId, configId)
  if (!apiConfig) return false
  const hasEnabledConditions = apiConfig.domainObjects?.some(obj => {
    const cond = apiConfig.objectConditions?.[obj.objectId]
    return cond?.enabled && Array.isArray(cond.conditions) && cond.conditions.length > 0
  })
  const hasColumns = Object.values(apiConfig.objectColumns || {}).some(cols => Array.isArray(cols) && cols.length > 0)
  return !!(hasEnabledConditions || hasColumns)
}

const getApiStatusText = (apiId, configId) => (isApiConfigured(apiId, configId) ? '已配置' : '未配置')
const getApiStatusTagType = (apiId, configId) => (isApiConfigured(apiId, configId) ? 'success' : 'info')

// 处理表变化（自动从API权限定义获取）
const handleTableChange = (apiId, configId) => {
  const productConfig = formData.value.productConfigs.find(c => c.id === configId)
  if (productConfig && productConfig.apiConfigs[apiId]) {
    const apiConfig = productConfig.apiConfigs[apiId]
    // 从domainObjects中获取表信息，这里取第一个表
    if (apiConfig.domainObjects && apiConfig.domainObjects.length > 0) {
      const table = apiConfig.domainObjects[0].table
      if (table && tableFields[table]) {
        // 初始化列配置
        apiConfig.columns = JSON.parse(JSON.stringify(tableFields[table]))
      } else {
        apiConfig.columns = []
      }
    } else {
      apiConfig.columns = []
    }
  }
}

// 获取API的列配置（兼容旧代码，返回第一个数据对象的列）
const getApiColumns = (apiId, configId) => {
  const productConfig = formData.value.productConfigs.find(c => c.id === configId)
  if (productConfig && productConfig.apiConfigs[apiId]) {
    const apiConfig = productConfig.apiConfigs[apiId]
    // 从domainObjects中获取表信息，这里取第一个表
    if (apiConfig.domainObjects && apiConfig.domainObjects.length > 0) {
      const firstObj = apiConfig.domainObjects[0]
      return getApiColumnsByObject(apiId, configId, firstObj.objectId, firstObj.table)
    }
  }
  return []
}

// 根据数据对象获取列配置
const getApiColumnsByObject = (apiId, configId, objectId, table) => {
  const productConfig = formData.value.productConfigs.find(c => c.id === configId)
  if (productConfig && productConfig.apiConfigs[apiId]) {
    const apiConfig = productConfig.apiConfigs[apiId]
    
    // 确保objectColumns存在
    if (!apiConfig.objectColumns) {
      apiConfig.objectColumns = {}
    }
    
    // 如果该对象已有列配置，直接返回
    if (apiConfig.objectColumns[objectId] && apiConfig.objectColumns[objectId].length > 0) {
      return apiConfig.objectColumns[objectId]
    }
    
    // 初始化该对象的列配置
    if (table && tableFields[table]) {
      apiConfig.objectColumns[objectId] = JSON.parse(JSON.stringify(tableFields[table]))
      return apiConfig.objectColumns[objectId]
    } else {
      // 如果表字段数据不存在，返回空数组
      apiConfig.objectColumns[objectId] = []
      return []
    }
  }
  return []
}

// 模拟表字段数据
const tableFieldsForRules = {
  candidates: [
    { label: '候选人ID', value: 'id', type: 'string' },
    { label: '姓名', value: 'name', type: 'string' },
    { label: '电话', value: 'phone', type: 'string' },
    { label: '邮箱', value: 'email', type: 'string' },
    { label: '工作经验', value: 'experience', type: 'number' },
    { label: '教育程度', value: 'education', type: 'string' },
    { label: '应聘岗位', value: 'position', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '城市', value: 'city', type: 'string' }
  ],
  resumes: [
    { label: '简历ID', value: 'id', type: 'string' },
    { label: '候选人ID', value: 'candidateId', type: 'string' },
    { label: '文件名', value: 'fileName', type: 'string' },
    { label: '文件URL', value: 'fileUrl', type: 'string' },
    { label: '上传时间', value: 'uploadTime', type: 'datetime' }
  ],
  interviews: [
    { label: '面试ID', value: 'id', type: 'string' },
    { label: '候选人ID', value: 'candidateId', type: 'string' },
    { label: '面试时间', value: 'interviewTime', type: 'datetime' },
    { label: '面试官ID', value: 'interviewerId', type: 'string' },
    { label: '面试结果', value: 'result', type: 'string' },
    { label: '面试评分', value: 'score', type: 'number' },
    { label: '面试评价', value: 'comment', type: 'string' }
  ],
  offers: [
    { label: 'OfferID', value: 'id', type: 'string' },
    { label: '候选人ID', value: 'candidateId', type: 'string' },
    { label: '岗位', value: 'position', type: 'string' },
    { label: '薪资', value: 'salary', type: 'number' },
    { label: '入职日期', value: 'startDate', type: 'date' },
    { label: '状态', value: 'status', type: 'string' }
  ],
  employees: [
    { label: '员工ID', value: 'id', type: 'string' },
    { label: '姓名', value: 'name', type: 'string' },
    { label: '岗位', value: 'position', type: 'string' },
    { label: '部门', value: 'department', type: 'string' },
    { label: '入职日期', value: 'hireDate', type: 'date' },
    { label: '薪资', value: 'salary', type: 'number' }
  ],
  onboarding: [
    { label: '入职ID', value: 'id', type: 'string' },
    { label: '员工ID', value: 'employeeId', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '入职材料', value: 'documents', type: 'array' },
    { label: '开始日期', value: 'startDate', type: 'date' }
  ],
  training: [
    { label: '培训ID', value: 'id', type: 'string' },
    { label: '员工ID', value: 'employeeId', type: 'string' },
    { label: '课程名称', value: 'courseName', type: 'string' },
    { label: '培训师', value: 'trainer', type: 'string' },
    { label: '培训日期', value: 'trainingDate', type: 'date' },
    { label: '培训结果', value: 'result', type: 'string' }
  ],
  assessments: [
    { label: '考核ID', value: 'id', type: 'string' },
    { label: '员工ID', value: 'employeeId', type: 'string' },
    { label: '考核类型', value: 'assessmentType', type: 'string' },
    { label: '考核分数', value: 'score', type: 'number' },
    { label: '考核结果', value: 'result', type: 'string' },
    { label: '考核日期', value: 'assessmentDate', type: 'date' }
  ],
  orders: [
    { label: '订单ID', value: 'id', type: 'string' },
    { label: '客户ID', value: 'customerId', type: 'string' },
    { label: '金额', value: 'amount', type: 'number' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '创建时间', value: 'createTime', type: 'datetime' },
    { label: '门店ID', value: 'storeId', type: 'string' }
  ],
  users: [
    { label: '用户ID', value: 'id', type: 'string' },
    { label: '姓名', value: 'name', type: 'string' },
    { label: '部门ID', value: 'departmentId', type: 'string' },
    { label: '组织ID', value: 'organizationId', type: 'string' },
    { label: '角色', value: 'role', type: 'string' },
    { label: '状态', value: 'status', type: 'string' }
  ]
}

// 根据表获取可用属性列表
const getFieldsByTableForRules = (table) => {
  if (!table) {
    return []
  }
  return tableFieldsForRules[table] || []
}

// 可用的下一节点列表
const availableNextNodes = computed(() => {
  // 排除当前节点自身
  return props.availableNodes.filter(node => node.id !== formData.value.id)
})

// 添加数据条件
const addDataCondition = (apiId, configId) => {
  // 兼容旧的调用方式，实际使用addObjectCondition
  const apiModel = getApiModel(apiId, configId)
  if (apiModel.domainObjects && apiModel.domainObjects.length > 0) {
    addObjectCondition(apiId, configId, apiModel.domainObjects[0].objectId)
  }
}

// 移除数据条件
const removeDataCondition = (apiId, configId, index) => {
  // 兼容旧的调用方式，实际使用removeObjectCondition
  const apiModel = getApiModel(apiId, configId)
  if (apiModel.domainObjects && apiModel.domainObjects.length > 0) {
    removeObjectCondition(apiId, configId, apiModel.domainObjects[0].objectId, index)
  }
}

// 检查是否有启用的数据对象条件
const hasEnabledObjectConditions = (apiId, configId) => {
  const apiConfig = getApiModel(apiId, configId)
  if (!apiConfig || !apiConfig.domainObjects) {
    return false
  }
  return apiConfig.domainObjects.some(obj => {
    const conditionConfig = apiConfig.objectConditions[obj.objectId]
    return conditionConfig && conditionConfig.enabled
  })
}

// 处理数据对象条件启用状态变化
const handleObjectConditionEnabledChange = (apiId, configId, objectId) => {
  const apiConfig = getApiModel(apiId, configId)
  if (apiConfig && apiConfig.objectConditions[objectId]) {
    const conditionConfig = apiConfig.objectConditions[objectId]
    // 如果禁用，清空所有条件
    if (!conditionConfig.enabled) {
      conditionConfig.conditions = []
    }
  }
}

// 为指定数据对象添加条件
const addObjectCondition = (apiId, configId, objectId) => {
  const apiConfig = getApiModel(apiId, configId)
  if (apiConfig && apiConfig.objectConditions[objectId]) {
    if (!apiConfig.objectConditions[objectId].conditions) {
      apiConfig.objectConditions[objectId].conditions = []
    }
    const conditions = apiConfig.objectConditions[objectId].conditions
    // 第一个条件不需要relation，后续条件默认使用AND
    const newCondition = {
      attribute: '',
      operator: 'eq',
      value: '',
      relation: conditions.length > 0 ? 'AND' : undefined // 第一个条件没有relation
    }
    conditions.push(newCondition)
  }
}

// 移除指定数据对象的条件
const removeObjectCondition = (apiId, configId, objectId, index) => {
  const apiConfig = getApiModel(apiId, configId)
  if (apiConfig && apiConfig.objectConditions[objectId] && apiConfig.objectConditions[objectId].conditions) {
    apiConfig.objectConditions[objectId].conditions.splice(index, 1)
  }
}

// 获取数据域标签
const getDomainLabel = (domain) => {
  if (!domain) return ''
  return dataDomains[domain]?.name || domain
}

// 获取数据对象标签
const getObjectLabel = (domain, objectId) => {
  if (!domain || !objectId) return ''
  const domainObj = dataDomains[domain]
  if (!domainObj) return objectId
  
  const obj = domainObj.objects.find(o => o.id === objectId)
  return obj ? `${obj.name}(${obj.table})` : objectId
}

// 获取可用的数据策略列表
// 当传入objectId时，只返回与该数据对象关联的策略；否则按原逻辑根据API的数据域和对象过滤
const getAvailableDataRules = (apiId, configId, objectId) => {
  // 对象级策略：严格按对象ID过滤
  if (objectId) {
    return dataRules.filter(rule => rule.objectId === objectId)
  }

  // 兼容：按API级别过滤（暂时保留，用于可能的其他调用场景）
  const apiConfig = getApiModel(apiId, configId)
  if (!apiConfig || !apiConfig.domainObjects || apiConfig.domainObjects.length === 0) {
    return []
  }
  
  const apiDomains = new Set()
  const apiObjectIds = new Set()
  apiConfig.domainObjects.forEach(obj => {
    const parts = obj.objectId.split('_')
    if (parts.length >= 2) {
      const domain = parts[0]
      apiDomains.add(domain)
    }
    apiObjectIds.add(obj.objectId)
  })
  
  return dataRules.filter(rule => apiDomains.has(rule.domain) && apiObjectIds.has(rule.objectId))
}

// 处理数据策略选择变化（支持对象级）
// 当传入objectId和ruleId时，应用到指定对象；否则兼容旧逻辑（按API级别）
const handleDataRuleChange = (apiId, configId, objectId, ruleId) => {
  const apiConfig = getApiModel(apiId, configId)
  if (!apiConfig) {
    return
  }
  
  // 对象级应用策略
  if (objectId && ruleId) {
    const selectedRule = dataRules.find(rule => rule.id === ruleId)
    if (!selectedRule) {
      return
    }
    
    const conditionConfig = apiConfig.objectConditions[objectId]
    if (!conditionConfig) {
      return
    }
    
    conditionConfig.enabled = true
    conditionConfig.dataRuleId = ruleId
    
    if (selectedRule.conditions && selectedRule.conditions.length > 0) {
      conditionConfig.conditions = selectedRule.conditions.map((cond, index) => ({
        attribute: cond.attribute,
        operator: cond.operator,
        value: cond.value,
        relation: index > 0 ? 'AND' : undefined
      }))
    } else {
      conditionConfig.conditions = []
    }
    
    ElMessage.success(`已应用数据策略"${selectedRule.name}"的条件`)
    return
  }
  
  // 兼容：旧的API级别应用（目前界面已不再使用）
  if (!apiConfig.dataRuleId) {
    return
  }
  
  const selectedRule = dataRules.find(rule => rule.id === apiConfig.dataRuleId)
  if (!selectedRule) {
    return
  }
  
  const targetObjectId = selectedRule.objectId
  if (apiConfig.objectConditions[targetObjectId]) {
    const conditionConfig = apiConfig.objectConditions[targetObjectId]
    conditionConfig.enabled = true
    if (selectedRule.conditions && selectedRule.conditions.length > 0) {
      conditionConfig.conditions = selectedRule.conditions.map((cond, index) => ({
        attribute: cond.attribute,
        operator: cond.operator,
        value: cond.value,
        relation: index > 0 ? 'AND' : undefined
      }))
    } else {
      conditionConfig.conditions = []
    }
    ElMessage.success(`已应用数据策略"${selectedRule.name}"的条件`)
  }
}

// 处理条件模式切换
const handleConditionModeChange = (apiId, configId) => {
  const apiConfig = getApiModel(apiId, configId)
  if (!apiConfig) return
  // 切换模式时目前不自动清空或自动应用策略，交给用户显式选择
}

// 获取已选择的数据策略名称
// 当传入objectId时返回该对象选中的策略名，否则兼容旧逻辑
const getSelectedDataRuleName = (apiId, configId, objectId) => {
  const apiConfig = getApiModel(apiId, configId)
  if (!apiConfig) {
    return ''
  }
  
  // 对象级
  if (objectId) {
    const cond = apiConfig.objectConditions?.[objectId]
    const ruleId = cond?.dataRuleId
    if (!ruleId) return ''
    const rule = dataRules.find(r => r.id === ruleId)
    return rule ? rule.name : ''
  }
  
  // 兼容旧逻辑（目前界面已不再使用）
  if (!apiConfig.dataRuleId) {
    return ''
  }
  const rule = dataRules.find(r => r.id === apiConfig.dataRuleId)
  return rule ? rule.name : ''
}

// 根据字段值获取字段标签
const getFieldLabelByValue = (table, value) => {
  const fields = getFieldsByTableForRules(table)
  const field = fields.find(f => f.value === value)
  return field ? field.label : value
}

// 获取操作符标签
const getOperatorLabel = (operator) => {
  const operatorMap = {
    'eq': '等于',
    'ne': '不等于',
    'gt': '大于',
    'lt': '小于',
    'gte': '大于等于',
    'lte': '小于等于',
    'in': '包含',
    'nin': '不包含',
    'null': '为空',
    'notnull': '不为空'
  }
  return operatorMap[operator] || operator
}

// 监听节点变化，初始化表单数据
watch(() => props.node, (newNode) => {
  if (newNode) {
    formData.value = JSON.parse(JSON.stringify(newNode))
    // 确保新字段存在
    if (!formData.value.productConfigs) {
      formData.value.productConfigs = []
    }
    
    // 如果节点使用旧格式（permissions, buttonPermissions, apiPermissions），转换为新格式
    if ((formData.value.permissions || formData.value.buttonPermissions || formData.value.apiPermissions) && formData.value.productConfigs.length === 0) {
      // 收集所有权限ID
      const allPermissionIds = new Set()
      if (formData.value.permissions) {
        formData.value.permissions.forEach(id => allPermissionIds.add(id))
      }
      if (formData.value.buttonPermissions) {
        formData.value.buttonPermissions.forEach(id => allPermissionIds.add(id))
      }
      if (formData.value.apiPermissions) {
        formData.value.apiPermissions.forEach(id => allPermissionIds.add(id))
      }
      
      // 按产品端口分组权限
      const portPermissions = {}
      Array.from(allPermissionIds).forEach(permId => {
        const perm = allPermissions.find(p => p.id === permId)
        if (perm && perm.productPort) {
          if (!portPermissions[perm.productPort]) {
            portPermissions[perm.productPort] = []
          }
          portPermissions[perm.productPort].push(permId)
        }
      })
      
      // 为每个产品端口创建配置
      Object.keys(portPermissions).forEach(productPort => {
        const config = {
          id: `product-config-${Date.now()}-${productPort}`,
          productPort: productPort,
          permissionIds: portPermissions[productPort],
          permissions: formData.value.permissions?.filter(id => {
            const perm = allPermissions.find(p => p.id === id)
            return perm && perm.productPort === productPort && perm.type === 'PAGE'
          }) || [],
          buttonPermissions: formData.value.buttonPermissions?.filter(id => {
            const perm = allPermissions.find(p => p.id === id)
            return perm && perm.productPort === productPort && perm.type === 'FUNCTION'
          }) || [],
          apiPermissions: formData.value.apiPermissions?.filter(id => {
            const perm = allPermissions.find(p => p.id === id)
            return perm && perm.productPort === productPort && perm.type === 'API'
          }) || [],
          apiConfigs: {},
          expandedKeys: []
        }
        
        // 初始化API配置
        config.apiPermissions.forEach(apiId => {
          const apiPerm = allPermissions.find(p => p.id === apiId && p.type === 'API')
          if (apiPerm) {
            const domainObjects = []
            const objectConditions = {}
            if (apiPerm.dataDomainObjects) {
              apiPerm.dataDomainObjects.forEach(item => {
                const domain = dataDomains[item.domain]
                if (domain) {
                  const dataObject = domain.objects.find(obj => obj.id === item.objectId)
                  if (dataObject) {
                    domainObjects.push({
                      domainName: domain.name,
                      objectName: dataObject.name,
                      table: dataObject.table,
                      objectId: item.objectId
                    })
                    objectConditions[item.objectId] = {
                      conditions: [],
                      relation: 'AND',
                      enabled: true
                    }
                  }
                }
              })
            }
            config.apiConfigs[apiId] = {
              domainObjects: domainObjects,
              objectConditions: objectConditions,
              modelRelation: 'AND',
              columns: [],
              objectColumns: {}
            }
          }
        })
        
        formData.value.productConfigs.push(config)
      })
    }
    
    // 初始化每个产品配置的API配置和扩展节点
    formData.value.productConfigs.forEach(config => {
      if (!config.apiConfigs) {
        config.apiConfigs = {}
      }
      if (!config.expandedKeys) {
        config.expandedKeys = []
      }
      // 构建并缓存权限树
      if (config.productPort) {
        permissionTreeCache.value[config.id] = getPermissionTreeByPort(config.productPort)
        // 初始化扩展节点
        const expandedKeys = []
        const collectExpandedKeys = (nodes) => {
          nodes.forEach(node => {
            if (node.type === 'DIRECTORY' || node.type === 'PAGE') {
              expandedKeys.push(node.id)
            }
            if (node.children && node.children.length > 0) {
              collectExpandedKeys(node.children)
            }
          })
        }
        collectExpandedKeys(permissionTreeCache.value[config.id])
        config.expandedKeys = expandedKeys
      } else {
        permissionTreeCache.value[config.id] = []
      }
    })
  } else {
    // 重置表单
    formData.value = {
      id: `node-${Date.now()}`,
      processId: props.processId,
      name: '',
      type: 'middle',
      order: 1,
      description: '',
      productConfigs: [],
      nextNodes: [],
      condition: ''
    }
    permissionTreeCache.value = {}
    permissionTreeRefs.value = []
  }
}, { immediate: true, deep: true })

// 保存节点
const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      emit('save', formData.value)
      ElMessage.success('节点保存成功')
    }
  })
}

// 取消操作
const handleCancel = () => {
  emit('cancel')
}

// 初始化
onMounted(() => {
  // 初始化默认产品端配置
  if (formData.value.productConfigs.length === 0) {
    addProductPortConfig()
  } else {
    // 设置默认激活的产品端
    activeProductId.value = formData.value.productConfigs[0].id
    // 对已有产品端配置初始化权限树缓存
    formData.value.productConfigs.forEach(config => {
      if (config.productPort) {
        permissionTreeCache.value[config.id] = getPermissionTreeByPort(config.productPort)
        // 初始化扩展节点
        const expandedKeys = []
        const collectExpandedKeys = (nodes) => {
          nodes.forEach(node => {
            if (node.type === 'DIRECTORY' || node.type === 'PAGE') {
              expandedKeys.push(node.id)
            }
            if (node.children && node.children.length > 0) {
              collectExpandedKeys(node.children)
            }
          })
        }
        collectExpandedKeys(permissionTreeCache.value[config.id])
        config.expandedKeys = expandedKeys
      } else {
        permissionTreeCache.value[config.id] = []
      }
    })
  }
})
</script>

<style scoped>
.process-node-configuration {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.configuration-header {
  margin-bottom: 20px;
}

.configuration-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.node-form {
  width: 100%;
}

.compact-card {
  margin-bottom: 10px;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.compact-grid :deep(.el-form-item) {
  margin-bottom: 12px;
}

.form-card {
  margin-bottom: 20px;
}

.product-tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
}

.product-tabs-compact :deep(.el-tabs__item) {
  padding: 8px 12px;
  border-radius: 4px;
}

.product-tabs-compact :deep(.el-tabs__item.is-active) {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 600;
  border-color: #c6e2ff;
}

.product-tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-tab-name {
  font-weight: 600;
  color: #333;
}

.vertical-tabs {
  display: flex;
}

.vertical-tabs :deep(.el-tabs__header) {
  width: auto;
  min-width: 260px;
  margin-right: 8px;
}

.vertical-tabs :deep(.el-tabs__content) {
  flex: 1;
  min-width: 0;
}

.vertical-tabs :deep(.el-tabs__item) {
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 6px;
  display: block;
  width: 100%;
  min-width: 240px;
  text-align: left;
  border: 1px solid transparent;
  line-height: 18px;
}

.vertical-tabs :deep(.el-tabs__item.is-active) {
  background-color: var(--el-color-primary-light-9, #ecf5ff);
  color: var(--el-color-primary, #409eff);
  font-weight: 600;
  border-color: var(--el-color-primary-light-7, #c6e2ff);
  box-shadow: inset 3px 0 0 var(--el-color-primary, #409eff);
}

.vertical-tabs :deep(.el-tabs__item:hover) {
  background-color: #f5f7fa;
}

.pnc-api-tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 260px;
  padding-right: 4px;
}

.pnc-api-tab-name {
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 140px;
}

.pnc-api-tab-method {
  font-size: 12px;
  padding: 0 6px;
  border-radius: 4px;
  background: #f2f6fc;
  color: #606266;
}

.pnc-api-tab-method.method-post { background: #fef0f0; color: #f56c6c; }
.pnc-api-tab-method.method-put { background: #fdf6ec; color: #e6a23c; }
.pnc-api-tab-method.method-delete { background: #fef0f0; color: #f56c6c; }
.pnc-api-tab-method.method-get { background: #ecf5ff; color: #409eff; }

/* 主题色兜底，防止变量缺失时样式失效 */
:root {
  --el-color-primary: #409eff;
  --el-color-primary-light-7: #c6e2ff;
  --el-color-primary-light-9: #ecf5ff;
}

.form-card :deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-card :deep(.el-card__body) {
  padding: 20px;
}

.form-actions {
  margin-top: 30px;
  text-align: right;
}

.form-actions .el-button {
  margin-left: 10px;
}

/* 产品端配置样式 */
.product-config-item {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.product-config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ebeef5;
}

.product-config-grid {
  align-items: flex-start;
}

.tight-item :deep(.el-form-item__content) {
  width: 100%;
}

.product-config-header h5 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.permission-tree {
  max-height: 520px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  background-color: #fff;
  width: 100%;
}

.permission-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.permission-code,
.permission-url {
  font-size: 12px;
  color: #909399;
}

/* API配置样式 */
.api-config-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.api-config-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.api-tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
}

.api-tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-tab-name {
  font-weight: 600;
  color: #333;
}

.api-tab-url {
  font-size: 12px;
  color: #606266;
}

.api-config-section h6 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.pnc-api-section .api-config-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9fafc;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.pnc-api-section .api-config-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.pnc-api-section .api-name {
  font-weight: 600;
  color: #333;
}

/* API URL样式 */
.pnc-api-section .api-url {
  font-size: 12px;
  color: #606266;
  background-color: #ecf5ff;
  padding: 2px 8px;
  border-radius: 3px;
}

.pnc-api-section .api-url-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pnc-api-section .api-method-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #ecf5ff;
  color: var(--el-color-primary, #409eff);
  border: 1px solid var(--el-color-primary-light-7, #c6e2ff);
  font-weight: 600;
}

/* 权限类型标签样式 */
.permission-type-tag {
  font-size: 12px;
  color: #67c23a;
  font-weight: 500;
  margin: 0 5px;
}

/* API模型选择样式 */
.api-model-select :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

/* 列权限表格样式 */
.api-config-item :deep(.el-table) {
  margin-top: 10px;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.no-api-data {
  text-align: center;
  color: #909399;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.no-table-selected {
  text-align: center;
  color: #909399;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.field-option,
.rule-option,
.node-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-type,
.rule-desc,
.node-type {
  font-size: 12px;
  color: #909399;
}

.column-permission-container {
  margin-top: 10px;
}

.data-rule-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 数据条件配置区域样式优化 */
.data-condition-wrapper {
  width: 100%;
}

.no-model-tip {
  width: 100%;
}

.condition-editor-wrapper {
  width: 100%;
  background-color: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
}

.condition-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.data-objects-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ebeef5;
  font-weight: 600;
  color: #303133;
}

.condition-item {
  margin-bottom: 15px;
  padding: 12px 15px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  transition: all 0.3s;
}

.condition-item:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.condition-row {
  width: 100%;
  align-items: center;
}

.condition-relation-select {
  min-width: 100px;
}

.condition-relation-select :deep(.el-input__inner) {
  font-weight: 500;
}

.condition-attribute-select,
.condition-operator-select,
.condition-value-input {
  min-width: 120px;
}

.condition-action {
  display: flex;
  justify-content: center;
  align-items: center;
}

.condition-action :deep(.el-button) {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.condition-delete-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 4px;
}

.conditions-list {
  margin-top: 10px;
}

.empty-conditions {
  padding: 20px;
  text-align: center;
  color: #909399;
}

/* 条件删除按钮样式优化 */
.condition-item :deep(.el-button--danger) {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.condition-item :deep(.el-button--danger:hover) {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

/* 条件配置区域按钮样式优化 */
.condition-header .el-button {
  margin-top: 0;
}

/* 数据条件容器样式 */
.data-condition-container {
  margin-top: 10px;
}

/* 模型间关系选择样式 */
.model-relation-section {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f0f9ff;
  border: 1px solid #ecf5ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.relation-label {
  font-weight: 600;
  color: #303133;
}

/* 数据对象条件区域样式 */
.object-condition-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.object-condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ebeef5;
}

.object-relation {
  display: flex;
  align-items: center;
  gap: 10px;
}

.object-conditions-list {
  margin-top: 10px;
}

.object-conditions-content {
  margin-top: 15px;
}

.object-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.object-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

/* 对象模式切换与按钮区域 */
.object-mode-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-condition-toolbar {
  margin-bottom: 10px;
}

.disabled-condition-tip {
  margin-top: 15px;
}

.condition-tip {
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-size: 13px;
}

.condition-tip .el-icon {
  font-size: 16px;
}

.relation-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

/* 数据策略模式样式 */
.strategy-mode-content {
  width: 100%;
}

.strategy-preview-section {
  margin-top: 16px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px 16px;
}

.strategy-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.strategy-preview-header .preview-title {
  font-weight: 600;
  color: #303133;
  font-size: 13px;
}

.strategy-object-block {
  margin-bottom: 12px;
  padding: 10px 12px;
  background-color: #f9fafc;
  border-radius: 4px;
}

.strategy-object-block:last-child {
  margin-bottom: 0;
}

.strategy-object-title {
  font-weight: 500;
  color: #606266;
  font-size: 13px;
  margin-bottom: 8px;
}

.strategy-conditions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.strategy-condition-card {
  display: flex;
  align-items: center;
  gap: 6px;
}

.strategy-condition-card .condition-logic {
  padding: 2px 8px;
  background-color: hsl(345 100% 32% / 0.1);
  color: hsl(345 100% 32%);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.strategy-condition-card .condition-content {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.strategy-condition-card .condition-field {
  font-weight: 500;
  color: #303133;
  font-size: 13px;
}

.strategy-condition-card .condition-op {
  color: hsl(345 100% 32%);
  font-size: 12px;
  padding: 0 4px;
}

.strategy-condition-card .condition-val {
  color: #606266;
  font-size: 13px;
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.no-conditions-tip {
  color: #909399;
  font-size: 13px;
  text-align: center;
  padding: 8px;
}

/* 自定义模式样式 */
.custom-mode-content {
  width: 100%;
}

.data-rule-option {
  padding: 6px 0;
}

.data-rule-option .rule-name {
  font-weight: 600;
  color: #303133;
}

.data-rule-option .rule-info {
  font-size: 12px;
  color: #909399;
}

.data-rule-option .rule-separator {
  margin: 0 6px;
}

.data-rule-option .rule-description {
  font-size: 12px;
  color: #606266;
}



/* 列权限配置样式 */
.column-permission-container {
  margin-top: 10px;
}

.column-permission-section {
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f9fafc;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.column-permission-section:last-child {
  margin-bottom: 0;
}

.column-permission-header {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ebeef5;
}

.column-permission-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.no-columns-tip {
  margin-top: 10px;
}
</style>