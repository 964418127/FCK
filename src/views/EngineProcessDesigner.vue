<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <div class="header-breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ name: 'engine-business' }">引擎业务</el-breadcrumb-item>
            <el-breadcrumb-item v-if="businessInfo.name">{{ businessInfo.name }}</el-breadcrumb-item>
            <el-breadcrumb-item v-if="processInfo.name">{{ processInfo.name }}</el-breadcrumb-item>
            <el-breadcrumb-item>流程设计</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <h2>引擎流程设计</h2>
        <p class="subtitle" v-if="businessInfo.name && processInfo.name" style="display: inline-block; margin-right: 8px;">
          业务：{{ businessInfo.name }} | 流程：{{ processInfo.name }}
        </p>
        <p class="subtitle" v-else style="display: inline-block; margin-right: 8px;">自动化引擎流程可视化设计</p>
        <el-tooltip content="流程执行逻辑：完全事件驱动。流程由事件触发启动，节点执行完成后产生事件触发后续节点，连线是事件订阅关系。自动化节点立即执行，人工节点暂停等待操作。" placement="bottom">
          <el-icon style="color: #409eff; cursor: help; font-size: 18px; vertical-align: middle;"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="goBack">返回业务</el-button>
        <el-button size="small" @click="loadDraft">加载草稿</el-button>
        <el-button size="small" @click="exportJson">导出JSON</el-button>
        <el-button size="small" @click="validateProcess">校验流程</el-button>
        <el-button size="small" @click="handleSave">保存草稿</el-button>
        <el-button size="small" type="primary" @click="handlePublish">发布</el-button>
      </div>
    </div>

    <div class="designer-body">
      <!-- 左侧：节点库 -->
      <div class="left-panel">
        <el-card shadow="hover" class="panel-card">
          <div class="card-header">
            <div class="title-row">
              <el-icon><Collection /></el-icon>
              <span>节点库（拖拽）</span>
            </div>
          </div>
          <div class="palette">
            <div
              v-for="item in palette"
              :key="item.type"
              class="palette-item"
              draggable="true"
              @dragstart="onPaletteDragStart(item)"
            >
              <span class="dot" :style="{ background: item.color }"></span>
              <span>{{ item.label }}</span>
            </div>
          </div>
          <div class="palette-tip">
            <el-alert type="info" :closable="false" style="margin-top: 12px">
              <template #title>
                <div style="font-size: 12px;">
                  <div>• 拖拽节点到画布</div>
                  <div>• 点击"连线模式"后，点击两个节点创建连线</div>
                </div>
              </template>
            </el-alert>
          </div>
        </el-card>
      </div>

      <!-- 中间：画布 -->
      <div class="canvas-panel">
        <div class="canvas-toolbar">
          <div class="toolbar-left">
            <!-- 连线模式下的简化工具栏 -->
            <template v-if="connectMode">
              <el-button size="small" type="primary" @click="connectMode = false">
                <el-icon><Link /></el-icon>退出连线模式
              </el-button>
              <el-tooltip content="连线操作：点击源节点，再点击目标节点创建连线" placement="bottom">
                <el-icon style="margin-left: 8px; color: #909399; cursor: help; font-size: 16px;"><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
            <!-- 正常模式下的完整工具栏 -->
            <template v-else>
              <el-button size="small" @click="undo" :disabled="!canUndo">
                <el-icon><RefreshLeft /></el-icon>撤销
              </el-button>
              <el-button size="small" @click="redo" :disabled="!canRedo">
                <el-icon><RefreshRight /></el-icon>重做
              </el-button>
              <el-button size="small" @click="connectMode = true">
                <el-icon><Link /></el-icon>连线模式
              </el-button>
              <el-button size="small" type="warning" plain @click="reset">
                <el-icon><Refresh /></el-icon>重置画布
              </el-button>
              <el-button size="small" type="primary" @click="showProcessConfig = true">
                <el-icon><Setting /></el-icon>触发器
              </el-button>
              <el-tooltip content="配置流程的触发方式（事件触发、定时触发、手动触发）" placement="bottom">
                <el-icon style="margin-left: 8px; color: #909399; cursor: help; font-size: 16px;"><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
          </div>
          <div class="toolbar-right">
            <span class="zoom-label">缩放</span>
            <el-slider v-model="zoom" :min="50" :max="150" :step="10" style="width: 140px" />
            <el-button size="small" @click="zoom = 100">100%</el-button>
          </div>
        </div>

        <div
          class="canvas"
          ref="canvasRef"
          tabindex="0"
          @dragover.prevent
          @drop.prevent="onCanvasDrop"
          @mousedown="onCanvasMouseDown"
          @mousemove="onCanvasMouseMove"
          @mouseup="onCanvasMouseUp"
          @keydown="handleCanvasKeydown"
        >
          <!-- 入口提示占位：提醒存在全局触发器配置，并提供快捷入口 -->
          <div class="trigger-hint">
            <div class="trigger-card">
              <div class="trigger-card__header">
                <div class="trigger-card__title">
                  <el-icon class="trigger-card__icon"><Connection /></el-icon>
                  <el-tag size="small" type="info">触发器</el-tag>
                  <span class="trigger-card__summary">{{ triggerSummary }}</span>
                </div>
                <el-button size="small" type="primary" text @click.stop="showProcessConfig = true">配置触发器</el-button>
              </div>
              <div class="trigger-card__desc">{{ triggerDetail }}</div>
            </div>
          </div>
          <!-- 连线层 -->
          <svg class="edges-layer" :width="svgWidth" :height="svgHeight">
            <defs>
              <!-- 优雅的小箭头标记 -->
              <marker 
                id="arrow" 
                markerWidth="8" 
                markerHeight="8" 
                refX="7" 
                refY="4" 
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M0,0 L8,4 L0,8 z" fill="#409eff" />
              </marker>
              <!-- 曲线箭头标记 -->
              <marker 
                id="arrow-curve" 
                markerWidth="8" 
                markerHeight="8" 
                refX="7" 
                refY="4" 
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M0,0 L8,4 L0,8 z" fill="#409eff" />
              </marker>
            </defs>
            <!-- 已存在的连线 -->
            <g v-for="edge in edges" :key="edge.id">
              <!-- 直线 -->
              <line
                v-if="!edge.lineType || edge.lineType === 'straight'"
                :x1="getLineStartPoint(edge).x"
                :y1="getLineStartPoint(edge).y"
                :x2="getLineEndPoint(edge).x"
                :y2="getLineEndPoint(edge).y"
                stroke="#409eff"
                stroke-width="2"
                marker-end="url(#arrow)"
                :class="['edge-line', { 'edge-selected': selectedEdgeId === edge.id }]"
                @click.stop="selectEdge(edge.id)"
              />
              <!-- 曲线（贝塞尔曲线） -->
              <path
                v-else-if="edge.lineType === 'curve'"
                :d="getCurvePath(edge)"
                stroke="#409eff"
                stroke-width="2"
                fill="none"
                marker-end="url(#arrow-curve)"
                :class="['edge-line', { 'edge-selected': selectedEdgeId === edge.id }]"
                @click.stop="selectEdge(edge.id)"
              />
              <!-- 折线 -->
              <polyline
                v-else-if="edge.lineType === 'polyline'"
                :points="getPolylinePoints(edge)"
                stroke="#409eff"
                stroke-width="2"
                fill="none"
                marker-end="url(#arrow)"
                :class="['edge-line', { 'edge-selected': selectedEdgeId === edge.id }]"
                @click.stop="selectEdge(edge.id)"
              />
              <text
                v-if="edge.label"
                :x="(getLineStartPoint(edge).x + getLineEndPoint(edge).x) / 2"
                :y="(getLineStartPoint(edge).y + getLineEndPoint(edge).y) / 2 - 5"
                fill="#606266"
                font-size="12"
                text-anchor="middle"
                class="edge-label"
              >
                {{ edge.label }}
              </text>
            </g>
            <!-- 预览连线（连线模式中，使用曲线） -->
            <path
              v-if="connectingPreviewLine"
              :d="getPreviewCurvePath(connectingPreviewLine)"
              stroke="#409eff"
              stroke-width="2"
              stroke-dasharray="5,5"
              fill="none"
              opacity="0.6"
              class="preview-line"
            />
          </svg>
          <!-- 节点层 -->
          <div
            v-for="node in nodes"
            :key="node.id"
            class="canvas-node"
            :class="{ 
              active: node.id === selectedNodeId,
              'condition-node': node.type === 'condition'
            }"
            :style="nodeStyle(node)"
            @click.stop="handleNodeClick(node.id, $event)"
            @dblclick.stop="handleNodeDoubleClick(node.id, $event)"
            @mousedown.stop="handleNodeMouseDown(node, $event)"
          >
            <span class="node-type" :style="{ background: getNodeColor(node.type) }"></span>
            <span class="node-icon" v-if="getNodeIcon(node.type)">{{ getNodeIcon(node.type) }}</span>
            <div class="node-label">{{ node.label }}</div>
            <div v-if="node.type === 'condition' && getConditionBranchCount(node.id) > 0" class="branch-count">
              {{ getConditionBranchCount(node.id) }} 分支
            </div>
          </div>
        </div>
      </div>

      <!-- 触发器配置弹窗 -->
      <el-dialog v-model="showProcessConfig" title="触发器" width="900px" :close-on-click-modal="false">
        <el-tabs v-model="processConfigTab">
          <!-- 流程触发配置 -->
          <el-tab-pane label="触发配置" name="trigger">
            <el-form :model="processTriggerConfig" label-width="140px">
              <el-form-item label="触发类型" required>
                <el-select v-model="processTriggerConfig.triggerType" placeholder="选择触发方式" @change="onProcessTriggerChange" style="width: 100%">
                  <el-option label="手动触发" value="manual">
                    <div>
                      <div>手动触发</div>
                      <div style="font-size: 12px; color: #909399;">通过API或界面手动启动流程</div>
                    </div>
                  </el-option>
                  <el-option label="事件触发" value="event">
                    <div>
                      <div>事件触发</div>
                      <div style="font-size: 12px; color: #909399;">由特定事件自动触发流程</div>
                    </div>
                  </el-option>
                  <el-option label="定时触发" value="schedule">
                    <div>
                      <div>定时触发</div>
                      <div style="font-size: 12px; color: #909399;">基于Cron表达式定时启动流程</div>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>

              <!-- 事件触发配置 -->
              <template v-if="processTriggerConfig.triggerType === 'event'">
                <el-form-item label="触发事件" required>
                  <div style="display: flex; gap: 8px; align-items: flex-start;">
                    <el-select 
                      v-model="processTriggerConfig.triggerEventCode" 
                      placeholder="选择事件" 
                      filterable
                      @change="onTriggerEventChange"
                      style="flex: 1"
                    >
                      <el-option-group
                        v-for="group in eventGroups"
                        :key="group.type"
                        :label="group.label"
                      >
                        <el-option
                          v-for="event in group.events"
                          :key="event.code"
                          :label="`${event.code} - ${event.name}`"
                          :value="event.code"
                        >
                          <div>
                            <div>{{ event.code }}</div>
                            <div style="font-size: 12px; color: #909399;">{{ event.name }}</div>
                          </div>
                        </el-option>
                      </el-option-group>
                    </el-select>
                    <el-button size="small" type="primary" @click="openEventManager">
                      <el-icon><Connection /></el-icon>管理事件
                    </el-button>
                  </div>
                  <div class="tip">选择已有事件，或前往事件中心创建新事件</div>
                </el-form-item>
                
                <el-form-item label="事件条件">
                  <el-alert
                    type="info"
                    :closable="false"
                    style="margin-bottom: 8px"
                  >
                    <template #title>
                      <div style="font-size: 12px;">
                        <div><strong>事件条件说明：</strong></div>
                        <div>• 用于过滤事件，只有满足条件的事件才会触发流程</div>
                        <div>• 可以使用事件数据：event.code（事件编码）、event.payload（事件数据）</div>
                        <div>• 示例：event.payload.status === 'active' && event.payload.amount > 100</div>
                      </div>
                    </template>
                  </el-alert>
                  <el-input
                    v-model="processTriggerConfig.triggerCondition"
                    type="textarea"
                    :rows="4"
                    placeholder="事件触发条件表达式，留空则无条件触发"
                    @change="onProcessConfigChange"
                  />
                </el-form-item>
                
                <el-form-item label="参数映射">
                  <el-alert
                    type="info"
                    :closable="false"
                    style="margin-bottom: 12px"
                  >
                    <template #title>
                      <div style="font-size: 12px;">
                        <div><strong>参数映射说明：</strong></div>
                        <div>• 将事件数据（event.payload）映射到流程的输入参数</div>
                        <div>• 格式：流程参数名 = 事件数据路径，如：userId = event.payload.userId</div>
                        <div>• 支持嵌套路径，如：orderId = event.payload.order.id</div>
                      </div>
                    </template>
                  </el-alert>
                  <el-table :data="processTriggerConfig.triggerParamMapping || []" style="width: 100%" size="small" border>
                    <el-table-column prop="paramName" label="流程参数" width="200">
                      <template #default="scope">
                        <el-select
                          v-model="scope.row.paramName"
                          size="small"
                          placeholder="选择参数"
                          @change="onProcessConfigChange"
                          style="width: 100%"
                          filterable
                        >
                          <el-option
                            v-for="param in getStartNodeInputParams()"
                            :key="param.name"
                            :label="param.name"
                            :value="param.name"
                          >
                            <div>
                              <div>{{ param.name }}</div>
                              <div style="font-size: 11px; color: #909399;">{{ param.type }} - {{ param.description || '无描述' }}</div>
                            </div>
                          </el-option>
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column prop="eventField" label="事件数据字段" min-width="250">
                      <template #default="scope">
                        <el-select
                          v-model="scope.row.eventField"
                          size="small"
                          placeholder="选择事件数据字段"
                          @change="onProcessConfigChange"
                          style="width: 100%"
                          filterable
                          allow-create
                          default-first-option
                        >
                          <el-option-group
                            v-if="getSelectedEventDataFields().length > 0"
                            label="事件数据字段"
                          >
                            <el-option
                              v-for="field in getSelectedEventDataFields()"
                              :key="field.name"
                              :label="field.name"
                              :value="`event.payload.${field.name}`"
                            >
                              <div>
                                <div>{{ field.name }}</div>
                                <div style="font-size: 11px; color: #909399;">{{ field.type }} - {{ field.description || '无描述' }}</div>
                              </div>
                            </el-option>
                          </el-option-group>
                          <el-option
                            v-if="getSelectedEventDataFields().length === 0"
                            label="请先选择事件"
                            value=""
                            disabled
                          />
                        </el-select>
                        <div class="tip" style="margin-top: 4px; font-size: 11px;">
                          从事件的数据字段中选择，或手动输入路径（如：event.payload.order.id）
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column prop="defaultValue" label="默认值" min-width="150">
                      <template #default="scope">
                        <el-input
                          v-model="scope.row.defaultValue"
                          size="small"
                          placeholder="可选：默认值"
                          @change="onProcessConfigChange"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                      <template #default="scope">
                        <el-button size="small" text type="danger" @click="removeProcessTriggerParamMapping(scope.$index)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-button size="small" text type="primary" @click="addProcessTriggerParamMapping" style="margin-top: 8px">
                    <el-icon><Plus /></el-icon>
                    添加映射
                  </el-button>
                </el-form-item>
              </template>

              <!-- 定时触发配置 -->
              <template v-if="processTriggerConfig.triggerType === 'schedule'">
                <el-alert
                  type="info"
                  :closable="false"
                  style="margin-bottom: 12px"
                  title="推荐使用可视化配置，系统自动生成 Cron；Cron 输入保留给高级用户"
                />
                <div class="cron-quick">
                  <div class="cron-quick__header">
                    <span>可视化配置（推荐）</span>
                    <el-tag size="small" type="info">自动生成 Cron</el-tag>
                  </div>
                  <div class="cron-quick__modes">
                    <el-radio-group v-model="scheduleQuick.mode" size="small" @change="applyScheduleQuickCron">
                      <el-radio-button label="daily">每天</el-radio-button>
                      <el-radio-button label="weekly">每周</el-radio-button>
                      <el-radio-button label="monthly">每月</el-radio-button>
                      <el-radio-button label="hourly">每N小时</el-radio-button>
                      <el-radio-button label="minutes">每N分钟</el-radio-button>
                    </el-radio-group>
                  </div>
                  <div class="cron-quick__body">
                    <template v-if="scheduleQuick.mode === 'daily'">
                      <div class="cron-row">
                        <span class="label">时间</span>
                        <el-input-number v-model="scheduleQuick.hour" :min="0" :max="23" size="small" @change="applyScheduleQuickCron" /> 时
                        <el-input-number v-model="scheduleQuick.minute" :min="0" :max="59" size="small" @change="applyScheduleQuickCron" /> 分
                      </div>
                    </template>
                    <template v-if="scheduleQuick.mode === 'weekly'">
                      <div class="cron-row">
                        <span class="label">星期</span>
                        <el-select v-model="scheduleQuick.weekday" size="small" style="width: 140px" @change="applyScheduleQuickCron">
                          <el-option v-for="w in 7" :key="w-1" :label="['周日','周一','周二','周三','周四','周五','周六'][w-1]" :value="w-1" />
                        </el-select>
                        <span class="label">时间</span>
                        <el-input-number v-model="scheduleQuick.hour" :min="0" :max="23" size="small" @change="applyScheduleQuickCron" /> 时
                        <el-input-number v-model="scheduleQuick.minute" :min="0" :max="59" size="small" @change="applyScheduleQuickCron" /> 分
                      </div>
                    </template>
                    <template v-if="scheduleQuick.mode === 'monthly'">
                      <div class="cron-row">
                        <span class="label">日期</span>
                        <el-input-number v-model="scheduleQuick.dayOfMonth" :min="1" :max="28" size="small" @change="applyScheduleQuickCron" /> 日
                        <span class="label">时间</span>
                        <el-input-number v-model="scheduleQuick.hour" :min="0" :max="23" size="small" @change="applyScheduleQuickCron" /> 时
                        <el-input-number v-model="scheduleQuick.minute" :min="0" :max="59" size="small" @change="applyScheduleQuickCron" /> 分
                      </div>
                    </template>
                    <template v-if="scheduleQuick.mode === 'hourly'">
                      <div class="cron-row">
                        <span class="label">每</span>
                        <el-input-number v-model="scheduleQuick.intervalHours" :min="1" :max="24" size="small" @change="applyScheduleQuickCron" /> 小时
                        <span class="label">的</span>
                        <el-input-number v-model="scheduleQuick.minute" :min="0" :max="59" size="small" @change="applyScheduleQuickCron" /> 分
                      </div>
                    </template>
                    <template v-if="scheduleQuick.mode === 'minutes'">
                      <div class="cron-row">
                        <span class="label">每</span>
                        <el-input-number v-model="scheduleQuick.intervalMinutes" :min="1" :max="59" size="small" @change="applyScheduleQuickCron" /> 分钟
                      </div>
                    </template>
                  </div>
                </div>
                <el-form-item label="Cron表达式（高级）">
                  <el-input
                    v-model="processTriggerConfig.triggerCron"
                    placeholder="如：0 0 * * * * (每天0点执行)"
                    @change="onProcessConfigChange"
                  />
                  <div class="tip">
                    Cron表达式格式：秒 分 时 日 月 周<br/>
                    示例：0 0 9 * * * (每天9点) | 0 0 */2 * * * (每2小时) | 0 0 0 1 * * (每月1号)
                  </div>
                </el-form-item>
                <el-form-item label="时区">
                  <el-select v-model="processTriggerConfig.triggerTimezone" @change="onProcessConfigChange" style="width: 100%">
                    <el-option label="系统时区" value="system" />
                    <el-option label="UTC" value="UTC" />
                    <el-option label="Asia/Shanghai (中国标准时间)" value="Asia/Shanghai" />
                  </el-select>
                </el-form-item>
              </template>

              <!-- 手动触发说明 -->
              <template v-if="processTriggerConfig.triggerType === 'manual'">
                <el-alert type="info" :closable="false">
                  <template #title>
                    <div style="font-size: 13px;">
                      <div style="margin-bottom: 8px;"><strong>手动触发说明：</strong></div>
                      <div>• 通过API接口手动启动流程实例</div>
                      <div>• 需要提供流程所需的输入参数</div>
                      <div>• 适用于需要人工干预或外部系统调用的场景</div>
                    </div>
                  </template>
                </el-alert>
              </template>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <template #footer>
          <el-button @click="showProcessConfig = false">关闭</el-button>
          <el-button type="primary" @click="saveProcessConfig">保存配置</el-button>
        </template>
      </el-dialog>

      <!-- 权限配置弹窗 -->
      <el-dialog v-model="permissionConfigDialogVisible" title="权限配置" fullscreen :close-on-click-modal="false">
        <div v-if="selectedNode" class="permission-config-dialog-content">
          <el-alert
            type="warning"
            :closable="false"
            style="margin-bottom: 20px"
          >
            <template #title>
              <div style="font-size: 13px; line-height: 1.6;">
                <div style="font-weight: 600; margin-bottom: 6px;">人工节点权限说明</div>
                <div style="color: #606266;">人工节点会暂停流程执行，等待有权限的用户操作。只有配置了相应权限的用户才能操作该节点。用户操作完成后，节点产生事件，触发后续节点继续执行。</div>
                <div style="color: #606266; margin-top: 4px;">权限配置：在此配置节点所需的产品端权限。角色分配请前往【自动化引擎-工作权限】页面进行配置。</div>
              </div>
            </template>
          </el-alert>

          <!-- 产品端配置 -->
          <el-card shadow="hover" class="form-card" style="margin-top: 20px">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin: 0;">产品端配置</h4>
                <el-button type="primary" size="small" @click="addProductConfig">
                  <el-icon><Plus /></el-icon>
                  新增产品端
                </el-button>
              </div>
            </template>

            <div v-if="(selectedNode.productConfigs || []).length > 0">
              <el-tabs v-model="activeProductConfigId" type="card" class="product-tabs product-tabs-compact">
                <el-tab-pane
                  v-for="(productConfig, index) in (selectedNode.productConfigs || [])"
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
                        @click.stop="removeProductConfig(index)"
                      >
                        删除
                      </el-button>
                    </div>
                  </template>

                  <el-row :gutter="16" class="product-config-grid two-col-layout">
                    <!-- 左列：产品端 + 权限树 -->
                    <el-col :xs="24" :sm="24" :md="10" :lg="9" :xl="8">
                      <div class="left-column">
                        <el-form-item label="产品端口" class="tight-item">
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
                                    <div v-for="(domainObj, idx) in getApiModel(api.id, productConfig.id).domainObjects" :key="idx" class="domain-object-item">
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
                                
                                <!-- 数据条件配置（与流程节点配置保持一致的对象级模式） -->
                                <el-form-item label="数据条件">
                                  <div class="data-condition-wrapper">
                                    <!-- 检查是否有数据模型 -->
                                    <div
                                      v-if="!getApiModel(api.id, productConfig.id).domainObjects || getApiModel(api.id, productConfig.id).domainObjects.length === 0"
                                      class="no-model-tip"
                                    >
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
                                              <el-icon><Plus /></el-icon>
                                              添加条件
                                            </el-button>
                                          </div>
                                          <div class="object-conditions-list">
                                            <div
                                              v-for="(condition, index) in getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].conditions"
                                              :key="`condition-${index}`"
                                              class="condition-item"
                                            >
                                              <el-row :gutter="16" align="middle" class="condition-row">
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

                                                <el-col :xs="24" :sm="3" :md="3" :lg="2">
                                                  <div class="condition-action">
                                                    <el-button
                                                      type="danger"
                                                      plain
                                                      class="condition-delete-btn"
                                                      @click="removeObjectCondition(api.id, productConfig.id, obj.objectId, index)"
                                                      :icon="Delete"
                                                    />
                                                  </div>
                                                </el-col>
                                              </el-row>
                                            </div>

                                            <div
                                              v-if="!getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].conditions || getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].conditions.length === 0"
                                              class="empty-conditions"
                                            >
                                              <el-empty description="暂无条件，请点击上方添加条件按钮添加" :image-size="80" />
                                            </div>
                                          </div>

                                          <div
                                            v-if="getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].conditions && getApiModel(api.id, productConfig.id).objectConditions[obj.objectId].conditions.length > 1"
                                            class="condition-tip"
                                          >
                                            <el-icon><InfoFilled /></el-icon>
                                            <span>提示：第一个条件无需选择关系，后续条件可通过关系选择器设置与前一条件的关系（AND/OR）</span>
                                          </div>
                                        </div>

                                        <!-- 禁用状态提示 -->
                                        <div v-else class="disabled-condition-tip">
                                          <el-alert
                                            title="已禁用该对象的数据条件"
                                            type="info"
                                            description="开启“启用条件”开关后，可为该对象配置数据过滤规则"
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
                                    <div v-for="(obj, objIdx) in getApiModel(api.id, productConfig.id).domainObjects" :key="obj.objectId" class="column-permission-section">
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
                                          <el-table-column label="可见/隐藏" width="110" align="center">
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
                                          <el-table-column label="脱敏" width="90" align="center">
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
                                          <el-table-column label="可编辑/只读" width="130" align="center">
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
        </div>
        <template #footer>
          <el-button @click="permissionConfigDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="savePermissionConfig">保存配置</el-button>
        </template>
      </el-dialog>

      <!-- 连线编辑弹窗 -->
      <el-dialog v-model="edgeDialogVisible" title="编辑连线（事件订阅关系）" width="700px">
        <el-alert
          type="info"
          :closable="false"
          style="margin-bottom: 16px"
        >
          <template #title>
            <div style="font-size: 12px;">
              <div><strong>连线本质：事件订阅关系</strong></div>
              <div>• 源节点执行完成后产生事件，目标节点订阅该事件</div>
              <div>• 当事件产生且满足条件时，触发目标节点执行</div>
              <div>• 如果源节点未配置产生事件，将使用默认事件：process.node.completed.{nodeId}</div>
            </div>
          </template>
        </el-alert>
        <el-form :model="edgeForm" label-width="140px">
          <el-form-item label="订阅的事件">
            <el-select v-model="edgeForm.subscribeEventCode" placeholder="选择或输入事件编码" filterable allow-create style="width: 100%">
              <el-option
                v-for="event in getSourceNodeEvents()"
                :key="event.code"
                :label="event.label"
                :value="event.code"
              />
            </el-select>
            <div class="tip">订阅源节点产生的事件，留空则使用默认事件</div>
          </el-form-item>
          <el-form-item label="事件条件">
            <el-input
              v-model="edgeForm.condition"
              type="textarea"
              :rows="3"
              placeholder="事件条件表达式，如：event.payload.status === 'approved'，留空则无条件触发"
            />
            <div class="tip">只有满足条件的事件才会触发目标节点</div>
          </el-form-item>
          <el-form-item label="连线标签">
            <el-input v-model="edgeForm.label" placeholder="连线标签（可选）" />
          </el-form-item>
          <el-form-item label="优先级">
            <el-input-number v-model="edgeForm.priority" :min="0" />
            <div class="tip">数值越大优先级越高（当多个连线订阅同一事件时）</div>
          </el-form-item>
          <el-form-item label="连线样式">
            <el-radio-group v-model="edgeForm.lineType">
              <el-radio label="straight">直线</el-radio>
              <el-radio label="curve">曲线</el-radio>
              <el-radio label="polyline">折线</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="edgeDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteEdge">删除连线</el-button>
          <el-button type="primary" @click="saveEdge">保存</el-button>
        </template>
      </el-dialog>

      <!-- 右侧：节点属性面板 -->
      <div class="right-panel" :class="{ collapsed: panelCollapsed }" :style="{ width: rightPanelWidth }">
        <div class="panel-toggle" :title="panelCollapsed ? '展开属性面板' : '收起属性面板'" @click="togglePanel">
          <el-icon>
            <component :is="panelCollapsed ? ArrowLeftBold : ArrowRightBold" />
          </el-icon>
        </div>
        <el-card v-show="!panelCollapsed" shadow="hover" class="panel-card">
          <div class="card-header">
            <div class="title-row">
              <el-icon><Setting /></el-icon>
              <span>节点属性</span>
            </div>
          </div>
          <div v-if="selectedNode" class="form-body">
            <el-tabs v-model="activeTab" type="border-card">
              <el-tab-pane label="基础" name="basic">
                <el-form label-width="80px" size="small">
                  <el-form-item label="名称">
                    <el-input v-model="selectedNode.label" @change="emitNodeChange" />
                  </el-form-item>
                  <el-form-item label="类型">
                    <el-tag type="info">{{ selectedNode.type }}</el-tag>
                  </el-form-item>
                  <el-form-item label="X / Y">
                    <div class="xy">
                      <el-input-number v-model="selectedNode.x" :min="0" :step="10" @change="emitNodeChange" />
                      <el-input-number v-model="selectedNode.y" :min="0" :step="10" @change="emitNodeChange" />
                    </div>
                  </el-form-item>
                  <el-form-item label="描述">
                    <el-input v-model="selectedNode.description" type="textarea" :rows="2" placeholder="节点描述" @change="emitNodeChange" />
                  </el-form-item>
                  <el-form-item>
                    <el-button size="small" type="danger" @click="deleteNode(selectedNode.id)">删除节点</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 开始节点：输入参数和变量 -->
              <el-tab-pane v-if="selectedNode.type === 'start'" label="输入参数" name="input">
                <div class="config-section">
                  <div class="section-header">
                    <span>输入参数</span>
                    <el-button size="small" text type="primary" @click="addInputParam">添加参数</el-button>
                  </div>
                  <el-table :data="selectedNode.inputParams || []" style="width: 100%" size="small">
                    <el-table-column prop="name" label="参数名" width="120">
                      <template #default="scope">
                        <el-input v-model="scope.row.name" size="small" placeholder="参数名" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="type" label="类型" width="100">
                      <template #default="scope">
                        <el-select v-model="scope.row.type" size="small" @change="emitNodeChange">
                          <el-option label="String" value="string" />
                          <el-option label="Number" value="number" />
                          <el-option label="Boolean" value="boolean" />
                          <el-option label="Object" value="object" />
                          <el-option label="Array" value="array" />
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column prop="required" label="必填" width="80">
                      <template #default="scope">
                        <el-checkbox v-model="scope.row.required" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="defaultValue" label="默认值" min-width="120">
                      <template #default="scope">
                        <el-input v-model="scope.row.defaultValue" size="small" placeholder="默认值" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="描述" min-width="150">
                      <template #default="scope">
                        <el-input v-model="scope.row.description" size="small" placeholder="参数描述" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                      <template #default="scope">
                        <el-button size="small" text type="danger" @click="removeInputParam(scope.$index)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-empty v-if="!selectedNode.inputParams || selectedNode.inputParams.length === 0" description="暂无输入参数" :image-size="60" />
                </div>
                <div class="config-section" style="margin-top: 20px">
                  <div class="section-header">
                    <span>流程变量</span>
                    <el-button size="small" text type="primary" @click="addVariable">添加变量</el-button>
                  </div>
                  <el-alert
                    type="info"
                    :closable="false"
                    style="margin-bottom: 12px"
                  >
                    <template #title>
                      <div style="font-size: 12px;">
                        <div><strong>流程变量说明：</strong></div>
                        <div>• 流程变量是在整个流程执行过程中可用的全局变量</div>
                        <div>• 变量在流程启动时初始化，可以在后续所有节点中使用</div>
                        <div>• 后续节点可以通过【节点名.变量名】的方式引用，如：开始节点.变量名</div>
                        <div>• 变量值可以在流程执行过程中被修改和更新</div>
                      </div>
                    </template>
                  </el-alert>
                  <el-table :data="selectedNode.variables || []" style="width: 100%" size="small">
                    <el-table-column prop="name" label="变量名" width="150">
                      <template #default="scope">
                        <el-input v-model="scope.row.name" size="small" placeholder="变量名" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="type" label="类型" width="100">
                      <template #default="scope">
                        <el-select v-model="scope.row.type" size="small" @change="emitNodeChange">
                          <el-option label="String" value="string" />
                          <el-option label="Number" value="number" />
                          <el-option label="Boolean" value="boolean" />
                          <el-option label="Object" value="object" />
                          <el-option label="Array" value="array" />
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column prop="value" label="初始值" min-width="200">
                      <template #default="scope">
                        <el-input v-model="scope.row.value" size="small" placeholder="初始值" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="描述" min-width="150">
                      <template #default="scope">
                        <el-input v-model="scope.row.description" size="small" placeholder="变量描述" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                      <template #default="scope">
                        <el-button size="small" text type="danger" @click="removeVariable(scope.$index)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-empty v-if="!selectedNode.variables || selectedNode.variables.length === 0" description="暂无流程变量" :image-size="60" />
                </div>
              </el-tab-pane>

              <!-- 结束节点：输出结果 -->
              <el-tab-pane v-if="selectedNode.type === 'end'" label="输出结果" name="output">
                <div class="config-section">
                  <div class="section-header">
                    <span>输出结果</span>
                    <el-button size="small" text type="primary" @click="addOutputResult">添加结果</el-button>
                  </div>
                  <el-table :data="selectedNode.outputResults || []" style="width: 100%" size="small">
                    <el-table-column prop="name" label="结果名" width="150">
                      <template #default="scope">
                        <el-input v-model="scope.row.name" size="small" placeholder="结果名" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="type" label="类型" width="100">
                      <template #default="scope">
                        <el-select v-model="scope.row.type" size="small" @change="emitNodeChange">
                          <el-option label="String" value="string" />
                          <el-option label="Number" value="number" />
                          <el-option label="Boolean" value="boolean" />
                          <el-option label="Object" value="object" />
                          <el-option label="Array" value="array" />
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column prop="value" label="值/表达式" min-width="200">
                      <template #default="scope">
                        <el-input v-model="scope.row.value" size="small" placeholder="值或表达式，如：${process.result}" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="描述" min-width="150">
                      <template #default="scope">
                        <el-input v-model="scope.row.description" size="small" placeholder="结果描述" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                      <template #default="scope">
                        <el-button size="small" text type="danger" @click="removeOutputResult(scope.$index)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-empty v-if="!selectedNode.outputResults || selectedNode.outputResults.length === 0" description="暂无输出结果" :image-size="60" />
                </div>
              </el-tab-pane>

              <!-- 任务节点：外部完成事件配置 -->
              <template v-if="selectedNode.type === 'task'">
                <el-tab-pane label="任务完成回执" name="task-complete">
                  <div class="config-section">
                    <el-alert
                      type="info"
                      :closable="false"
                      style="margin-bottom: 16px"
                      title="任务完成回执：外部系统完成后回传事件，匹配成功即视为任务完成并继续流转"
                    />
                    <el-form label-width="120px" size="small">
                      <el-form-item label="完成事件编码">
                        <el-select
                          v-model="selectedNode.waitEventCode"
                          placeholder="选择或输入事件编码"
                          filterable
                          allow-create
                          default-first-option
                          style="width: 100%"
                          @change="onWaitEventCodeChange"
                        >
                          <el-option-group
                            v-for="group in eventGroups"
                            :key="group.type"
                            :label="group.label"
                          >
                            <el-option
                              v-for="event in group.events"
                              :key="event.code"
                              :label="`${event.code} - ${event.name}`"
                              :value="event.code"
                            />
                          </el-option-group>
                        </el-select>
                        <div class="tip">外部系统完成任务时发送该事件，匹配成功后本节点完成，继续后续节点/事件产生</div>
                      </el-form-item>
                    </el-form>

                    <div style="margin-top: 12px;">
                      <div style="font-weight: 600; margin-bottom: 8px;">回传数据映射（固定）</div>
                      <div class="tip" style="margin-bottom: 8px;">外部事件 payload 按任务输出字段同名回传，路径默认 event.payload.xxx</div>
                      <el-table :data="selectedNode.waitEventDataMapping || []" style="width: 100%" size="small" border>
                        <el-table-column prop="taskField" label="任务输出字段" width="220">
                          <template #default="scope">
                            <el-input v-model="scope.row.taskField" size="small" disabled />
                          </template>
                        </el-table-column>
                        <el-table-column prop="eventField" label="事件字段路径" min-width="200">
                          <template #default="scope">
                            <el-input v-model="scope.row.eventField" size="small" disabled />
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </div>
                </el-tab-pane>
              </template>

              <!-- 事件产生配置（有输出节点） -->
              <el-tab-pane label="事件产生" name="event-produce">
                <div class="config-section">
                  <el-alert
                    type="info"
                    :closable="false"
                    style="margin-bottom: 20px"
                  >
                    <template #title>
                      <div style="font-size: 13px; line-height: 1.6;">
                        <div style="font-weight: 600; margin-bottom: 6px;">事件产生说明</div>
                        <div style="color: #606266;">节点执行完成后可以产生事件，用于触发后续节点。如果节点配置了产生事件，后续节点可以订阅该事件；如果未配置，将使用默认事件：<code style="background: #f0f2f5; padding: 2px 6px; border-radius: 3px; font-size: 12px;">process.node.completed.{nodeId}</code></div>
                        <div style="color: #606266; margin-top: 4px;">人工节点（任务、审批）会产生特定事件：<code style="background: #f0f2f5; padding: 2px 6px; border-radius: 3px; font-size: 12px;">task.completed</code>、<code style="background: #f0f2f5; padding: 2px 6px; border-radius: 3px; font-size: 12px;">approval.approved/rejected</code></div>
                      </div>
                    </template>
                  </el-alert>
                  
                  <!-- 产生事件开关 -->
                  <div style="margin-bottom: 24px; padding: 16px; background: #fafbfc; border-radius: 6px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <span style="font-size: 14px; font-weight: 500; color: #303133; min-width: 90px;">产生事件</span>
                      <el-switch :disabled="!hasOutputParamsForEvent" v-model="selectedNode.produceEvent" @change="onProduceEventToggle" />
                      <span style="font-size: 13px; color: #909399; margin-left: 4px;">启用后，节点执行完成会产生事件</span>
                    </div>
                    <div v-if="!hasOutputParamsForEvent" class="tip" style="margin-top: 8px; color: #f56c6c;">该节点无可用输出，无法产生事件数据</div>
                  </div>

                  <!-- 事件编码配置 -->
                  <template v-if="selectedNode.produceEvent">
                    <div style="margin-bottom: 24px;">
                      <div style="font-size: 14px; font-weight: 500; color: #303133; margin-bottom: 10px;">事件编码</div>
                      <el-input
                        v-model="selectedNode.produceEventCode"
                        placeholder="如：order.validated 或 process.node.completed.{nodeId}"
                        @change="emitNodeChange"
                        style="width: 100%"
                      />
                      <div style="font-size: 12px; color: #909399; margin-top: 6px;">自定义事件编码，留空则使用默认事件</div>
                    </div>

                    <!-- 事件数据映射 -->
                    <div style="margin-bottom: 24px;">
                      <div style="font-size: 14px; font-weight: 500; color: #303133; margin-bottom: 10px;">事件数据映射</div>
                      <div style="font-size: 12px; color: #606266; margin-bottom: 12px; padding: 8px 12px; background: #f0f9ff; border-left: 3px solid #409eff; border-radius: 3px;">
                        将节点输出结果映射到事件数据（event.payload），格式：事件字段 = 节点输出参数
                      </div>
                      <el-table :data="selectedNode.produceEventData || []" style="width: 100%" size="small" border>
                        <el-table-column prop="eventField" label="事件字段" width="200">
                          <template #default="scope">
                            <el-input v-model="scope.row.eventField" size="small" placeholder="事件字段名" @change="emitNodeChange" />
                          </template>
                        </el-table-column>
                        <el-table-column prop="nodeParam" label="节点输出参数" min-width="200">
                          <template #default="scope">
                            <el-select
                              v-model="scope.row.nodeParam"
                              size="small"
                              placeholder="选择输出参数"
                              @change="emitNodeChange"
                              style="width: 100%"
                              filterable
                            >
                              <el-option
                                v-for="param in eventMappingSourceParams"
                                :key="`${param.fromNodeId || 'self'}:${param.name}`"
                                :label="param.displayLabel"
                                :value="param.displayLabel"
                              >
                                <div>
                                  <div style="font-size: 13px;">{{ param.displayLabel }}</div>
                                  <div style="font-size: 11px; color: #909399;">
                                    {{ param.type }} - {{ param.description || '无描述' }}
                                  </div>
                                </div>
                              </el-option>
                            </el-select>
                          </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80">
                          <template #default="scope">
                            <el-button size="small" text type="danger" @click="removeEventDataMapping(scope.$index)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-button size="small" text type="primary" @click="addEventDataMapping" style="margin-top: 10px">
                        <el-icon><Plus /></el-icon>
                        添加映射
                      </el-button>
                    </div>
                  </template>

                  <!-- 未启用时的提示 -->
                  <template v-else>
                    <div style="padding: 20px; background: #f5f7fa; border-radius: 6px; border: 1px solid #e4e7ed;">
                      <div v-if="isHumanNode(selectedNode.type)" style="font-size: 13px; color: #606266; line-height: 1.8;">
                        <div style="font-weight: 500; color: #303133; margin-bottom: 10px;">人工节点（{{ selectedNode.type === 'task' ? '任务' : '审批' }}）会产生特定事件：</div>
                        <div v-if="selectedNode.type === 'task'" style="padding-left: 12px;">
                          <code style="background: #fff; padding: 3px 8px; border-radius: 3px; font-size: 12px;">task.completed.{nodeId}</code> - 任务完成事件
                        </div>
                        <div v-else-if="selectedNode.type === 'approval'" style="padding-left: 12px;">
                          <div><code style="background: #fff; padding: 3px 8px; border-radius: 3px; font-size: 12px;">approval.approved.{nodeId}</code> - 审批通过事件</div>
                          <div style="margin-top: 4px;"><code style="background: #fff; padding: 3px 8px; border-radius: 3px; font-size: 12px;">approval.rejected.{nodeId}</code> - 审批拒绝事件</div>
                        </div>
                      </div>
                      <div v-else style="font-size: 13px; color: #606266;">
                        未启用事件产生时，将使用默认事件：<code style="background: #fff; padding: 3px 8px; border-radius: 3px; font-size: 12px;">process.node.completed.{nodeId}</code>
                      </div>
                    </div>
                  </template>
                </div>
              </el-tab-pane>

              <!-- 权限配置（人工节点：task） -->
              <el-tab-pane v-if="isHumanNode(selectedNode.type)" label="权限配置" name="permission">
                <div class="config-section">
                  <el-alert
                    type="warning"
                    :closable="false"
                    style="margin-bottom: 16px"
                  >
                    <template #title>
                      <div style="font-size: 12px;">
                        <div><strong>人工节点权限说明：</strong></div>
                        <div>• 人工节点会暂停流程执行，等待有权限的用户操作</div>
                        <div>• 只有配置了相应角色和权限的用户才能操作该节点</div>
                        <div>• 用户操作完成后，节点产生事件，触发后续节点继续执行</div>
                        <div>• 权限有效期：nodeDuration（节点期间有效，流程离开该节点后权限回收）</div>
                      </div>
                    </template>
                  </el-alert>
                  <div style="text-align: center; padding: 40px 20px;">
                    <el-icon style="font-size: 48px; color: #409eff; margin-bottom: 16px;"><Setting /></el-icon>
                    <div style="font-size: 14px; color: #606266; margin-bottom: 8px;">权限配置需要在弹窗中进行，提供更大的配置空间</div>
                    <div style="font-size: 12px; color: #909399; margin-bottom: 24px;">点击下方按钮打开权限配置弹窗，可配置产品端、权限树等</div>
                    <el-button type="primary" @click="openPermissionConfigDialog">
                      <el-icon><Setting /></el-icon>
                      打开权限配置
                    </el-button>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 条件节点：输入参数和分支配置 -->
              <el-tab-pane v-if="selectedNode.type === 'condition'" label="输入参数" name="condition-input">
                <div class="config-section">
                  <div class="section-header">
                    <span>输入参数</span>
                    <el-button size="small" text type="primary" @click="addConditionInputParam">添加参数</el-button>
                  </div>
                  <el-alert
                    type="info"
                    :closable="false"
                    style="margin-bottom: 12px"
                  >
                    <template #title>
                      <div style="font-size: 12px;">
                        参数值来源：从前置节点的输出参数中获取，格式为【节点名称.参数名】
                      </div>
                    </template>
                  </el-alert>
                  <el-table :data="selectedNode.inputParams || []" style="width: 100%" size="small">
                    <el-table-column prop="name" label="参数名" width="120">
                      <template #default="scope">
                        <el-input v-model="scope.row.name" size="small" placeholder="参数名" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="source" label="参数来源" min-width="200">
                      <template #default="scope">
                        <el-select
                          v-model="scope.row.source"
                          size="small"
                          filterable
                          allow-create
                          default-first-option
                          placeholder="选择或输入【节点名.参数名】"
                          @change="emitNodeChange"
                          style="width: 100%"
                        >
                          <el-option-group
                            v-for="preNode in getPredecessorNodes(selectedNode.id)"
                            :key="preNode.id"
                            :label="`${preNode.label} 的输出参数`"
                          >
                            <el-option
                              v-for="param in getNodeOutputParams(preNode)"
                              :key="param.name"
                              :label="`${preNode.label}.${param.name}`"
                              :value="`${preNode.label}.${param.name}`"
                            >
                              <div>
                                <div>{{ preNode.label }}.{{ param.name }}</div>
                                <div style="font-size: 11px; color: #909399;">{{ param.type }} - {{ param.description || '无描述' }}</div>
                              </div>
                            </el-option>
                          </el-option-group>
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column prop="type" label="类型" width="100">
                      <template #default="scope">
                        <el-select v-model="scope.row.type" size="small" @change="emitNodeChange">
                          <el-option label="String" value="string" />
                          <el-option label="Number" value="number" />
                          <el-option label="Boolean" value="boolean" />
                          <el-option label="Object" value="object" />
                          <el-option label="Array" value="array" />
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="描述" min-width="150">
                      <template #default="scope">
                        <el-input v-model="scope.row.description" size="small" placeholder="参数描述" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                      <template #default="scope">
                        <el-button size="small" text type="danger" @click="removeConditionInputParam(scope.$index)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-empty v-if="!selectedNode.inputParams || selectedNode.inputParams.length === 0" description="暂无输入参数" :image-size="60" />
                </div>
              </el-tab-pane>

              <!-- 条件分支节点：分支配置 -->
              <el-tab-pane v-if="selectedNode.type === 'condition'" label="分支配置" name="condition-branches">
                <div class="config-section">
                  <div class="section-header">
                    <span>条件分支</span>
                    <el-button size="small" text type="primary" @click="addConditionBranch">添加分支</el-button>
                  </div>
                  <el-alert
                    type="info"
                    :closable="false"
                    style="margin-bottom: 12px"
                  >
                    <template #title>
                      <div>条件分支说明：</div>
                      <div style="font-size: 12px; margin-top: 4px;">
                        1. 条件分支节点根据输入参数的不同情况，走不同的后续节点<br/>
                        2. 每个分支需要配置条件规则和对应的目标节点<br/>
                        3. 条件之间应该是互斥的，确保每个输入情况都有唯一对应的分支路径
                      </div>
                    </template>
                  </el-alert>
                  <el-table :data="selectedNode.conditionBranches || []" style="width: 100%" size="small">
                    <el-table-column prop="label" label="分支名称" width="120">
                      <template #default="scope">
                        <el-input v-model="scope.row.label" size="small" placeholder="分支名称" @change="emitNodeChange" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="condition" label="条件规则" min-width="300">
                      <template #default="scope">
                        <div class="condition-builder">
                          <div class="condition-row" v-for="(cond, idx) in (scope.row.conditions || [])" :key="idx">
                            <el-select
                              v-model="cond.field"
                              size="small"
                              placeholder="选择参数"
                              style="width: 140px"
                              @change="emitNodeChange"
                            >
                              <el-option
                                v-for="param in (selectedNode.inputParams || [])"
                                :key="param.name"
                                :label="param.name"
                                :value="param.name"
                              />
                            </el-select>
                            <el-select
                              v-model="cond.operator"
                              size="small"
                              placeholder="操作符"
                              style="width: 100px"
                              @change="emitNodeChange"
                            >
                              <el-option label="等于" value="==" />
                              <el-option label="不等于" value="!=" />
                              <el-option label="大于" value=">" />
                              <el-option label="大于等于" value=">=" />
                              <el-option label="小于" value="<" />
                              <el-option label="小于等于" value="<=" />
                              <el-option label="包含" value="includes" />
                              <el-option label="不包含" value="!includes" />
                            </el-select>
                            <el-input
                              v-model="cond.value"
                              size="small"
                              placeholder="值"
                              style="flex: 1"
                              @change="emitNodeChange"
                            />
                            <el-button
                              size="small"
                              text
                              type="danger"
                              @click="removeConditionRule(scope.$index, idx)"
                              v-if="scope.row.conditions && scope.row.conditions.length > 1"
                            >
                              删除
                            </el-button>
                          </div>
                          <div v-if="!scope.row.conditions || scope.row.conditions.length === 0" class="empty-condition">
                            <el-button size="small" text type="primary" @click="addConditionRule(scope.$index)">添加条件</el-button>
                          </div>
                          <div v-else class="condition-actions">
                            <el-button size="small" text type="primary" @click="addConditionRule(scope.$index)">添加条件</el-button>
                            <el-select
                              v-model="scope.row.logic"
                              size="small"
                              style="width: 80px; margin-left: 8px"
                              @change="emitNodeChange"
                            >
                              <el-option label="并且" value="&&" />
                              <el-option label="或者" value="||" />
                            </el-select>
                          </div>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column prop="targetNodeId" label="目标节点" width="150">
                      <template #default="scope">
                        <el-select
                          v-model="scope.row.targetNodeId"
                          size="small"
                          placeholder="选择目标节点"
                          filterable
                          @change="onConditionBranchTargetChange(scope.$index)"
                        >
                          <el-option
                            v-for="node in getAvailableTargetNodes(selectedNode.id)"
                            :key="node.id"
                            :label="node.label"
                            :value="node.id"
                          />
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                      <template #default="scope">
                        <el-button size="small" text type="danger" @click="removeConditionBranch(scope.$index)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-empty v-if="!selectedNode.conditionBranches || selectedNode.conditionBranches.length === 0" description="暂无条件分支，请添加分支并配置条件" :image-size="60" />
                </div>
              </el-tab-pane>

              <!-- 消息节点：模板配置 -->
              <el-tab-pane v-if="selectedNode.type === 'message'" label="消息配置" name="message-config">
                <div class="config-section">
                  <el-form label-width="100px" size="small">
                    <el-form-item label="消息模板">
                      <el-select
                        v-model="selectedNode.messageTemplateId"
                        placeholder="选择消息模板"
                        filterable
                        @change="onMessageTemplateChange"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="template in messageTemplates"
                          :key="template.id"
                          :label="`${template.templateCode} - ${template.templateTitle}`"
                          :value="template.id"
                        >
                          <div>
                            <div>{{ template.templateCode }} - {{ template.templateTitle }}</div>
                            <div style="font-size: 11px; color: #909399;">{{ template.templateType }} | {{ template.messageType }}</div>
                          </div>
                        </el-option>
                      </el-select>
                    </el-form-item>
                    <el-alert
                      v-if="selectedNode.messageTemplateId && selectedMessageTemplate"
                      type="info"
                      :closable="false"
                      style="margin-bottom: 12px"
                    >
                      <template #title>
                        <div style="font-size: 12px;">
                          <div><strong>模板内容：</strong>{{ selectedMessageTemplate.content }}</div>
                          <div v-if="selectedMessageTemplate.usedParameters && selectedMessageTemplate.usedParameters.length > 0" style="margin-top: 4px;">
                            <strong>模板参数：</strong>
                            <span v-for="(param, index) in selectedMessageTemplate.usedParameters" :key="param">
                              <el-tag size="small" style="margin-left: 4px;">
                                {{ getParamLabel(param) }} {{ '{' + param + '}' }}
                              </el-tag>
                            </span>
                          </div>
                        </div>
                      </template>
                    </el-alert>
                  </el-form>
                  
                  <div v-if="selectedNode.messageTemplateId && selectedMessageTemplate && selectedMessageTemplate.usedParameters && selectedMessageTemplate.usedParameters.length > 0" class="config-section" style="margin-top: 20px">
                    <div class="section-header">
                      <span>参数值来源配置</span>
                    </div>
                    <el-alert
                      type="info"
                      :closable="false"
                      style="margin-bottom: 12px"
                    >
                      <template #title>
                        <div style="font-size: 12px;">
                          为消息模板的每个参数指定值的来源，格式为【节点名称.参数名】
                        </div>
                      </template>
                    </el-alert>
                    <el-table :data="selectedNode.messageParams || []" style="width: 100%" size="small">
                      <el-table-column prop="paramName" label="参数名" width="200">
                        <template #default="scope">
                          <el-tag size="small" type="info">
                            {{ getParamLabel(scope.row.paramName) }} {{ '{' + scope.row.paramName + '}' }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column prop="source" label="参数来源" min-width="200">
                        <template #default="scope">
                          <el-select
                            v-model="scope.row.source"
                            size="small"
                            filterable
                            allow-create
                            default-first-option
                            placeholder="选择或输入【节点名.参数名】"
                            @change="emitNodeChange"
                            style="width: 100%"
                          >
                            <el-option-group
                              v-for="preNode in getPredecessorNodes(selectedNode.id)"
                              :key="preNode.id"
                              :label="`${preNode.label} 的输出参数`"
                            >
                              <el-option
                                v-for="param in getNodeOutputParams(preNode)"
                                :key="param.name"
                                :label="`${preNode.label}.${param.name}`"
                                :value="`${preNode.label}.${param.name}`"
                              >
                                <div>
                                  <div>{{ preNode.label }}.{{ param.name }}</div>
                                  <div style="font-size: 11px; color: #909399;">{{ param.type }} - {{ param.description || '无描述' }}</div>
                                </div>
                              </el-option>
                            </el-option-group>
                          </el-select>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 消息节点：输出结果 -->
              <el-tab-pane v-if="selectedNode.type === 'message'" label="输出结果" name="message-output">
                <div class="config-section">
                  <div class="section-header">
                    <span>输出结果</span>
                  </div>
                  <el-alert
                    type="info"
                    :closable="false"
                    style="margin-bottom: 12px"
                  >
                    <template #title>
                      <div style="font-size: 12px;">
                        消息节点的输出结果固定为：messageId（消息ID）、status（发送状态）、result（发送结果）
                      </div>
                    </template>
                  </el-alert>
                  <el-table :data="getMessageOutputResults()" style="width: 100%" size="small" border>
                    <el-table-column prop="name" label="结果名" width="150">
                      <template #default="scope">
                        <el-tag size="small">{{ scope.row.name }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="type" label="类型" width="100">
                      <template #default="scope">
                        <el-tag type="info" size="small">{{ scope.row.type }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="描述" min-width="200">
                      <template #default="scope">
                        {{ scope.row.description }}
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>

              <!-- API调用节点：API配置 -->
              <el-tab-pane v-if="selectedNode.type === 'api'" label="API配置" name="api-config">
                <div class="config-section">
                  <el-form label-width="100px" size="small">
                    <el-form-item label="HTTP方法">
                      <el-select v-model="selectedNode.apiMethod" @change="emitNodeChange" style="width: 100%">
                        <el-option label="GET" value="GET" />
                        <el-option label="POST" value="POST" />
                        <el-option label="PUT" value="PUT" />
                        <el-option label="DELETE" value="DELETE" />
                        <el-option label="PATCH" value="PATCH" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="请求URL">
                      <el-input
                        v-model="selectedNode.apiUrl"
                        placeholder="请输入API地址，如：https://api.example.com/users"
                        @change="emitNodeChange"
                      />
                    </el-form-item>
                    <el-form-item label="请求头">
                      <div class="section-header">
                        <span>请求头参数</span>
                        <el-button size="small" text type="primary" @click="addApiHeader">添加请求头</el-button>
                      </div>
                      <el-table :data="selectedNode.apiHeaders || []" style="width: 100%" size="small">
                        <el-table-column prop="name" label="参数名" width="150">
                          <template #default="scope">
                            <el-input v-model="scope.row.name" size="small" placeholder="参数名" @change="emitNodeChange" />
                          </template>
                        </el-table-column>
                        <el-table-column prop="source" label="参数来源" min-width="200">
                          <template #default="scope">
                            <el-select
                              v-model="scope.row.source"
                              size="small"
                              filterable
                              allow-create
                              default-first-option
                              placeholder="选择或输入【节点名.参数名】"
                              @change="emitNodeChange"
                              style="width: 100%"
                            >
                              <el-option-group
                                v-for="preNode in getPredecessorNodes(selectedNode.id)"
                                :key="preNode.id"
                                :label="`${preNode.label} 的参数`"
                              >
                                <el-option
                                  v-for="param in getNodeAllParams(preNode)"
                                  :key="`${param.name}-${param.paramType}`"
                                  :label="`${preNode.label}.${param.name}`"
                                  :value="`${preNode.label}.${param.name}`"
                                >
                                  <div>
                                    <div>{{ preNode.label }}.{{ param.name }} <el-tag size="small" type="info" style="margin-left: 4px;">{{ param.paramType === 'input' ? '输入' : param.paramType === 'output' ? '输出' : '变量' }}</el-tag></div>
                                    <div style="font-size: 11px; color: #909399;">{{ param.type }} - {{ param.description || '无描述' }}</div>
                                  </div>
                                </el-option>
                              </el-option-group>
                            </el-select>
                          </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80">
                          <template #default="scope">
                            <el-button size="small" text type="danger" @click="removeApiHeader(scope.$index)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-form-item>
                    <el-form-item v-if="selectedNode.apiMethod === 'GET' || selectedNode.apiMethod === 'DELETE'" label="URL参数">
                      <div class="section-header">
                        <span>URL参数</span>
                        <el-button size="small" text type="primary" @click="addApiParam">添加参数</el-button>
                      </div>
                      <el-table :data="selectedNode.apiParams || []" style="width: 100%" size="small">
                        <el-table-column prop="name" label="参数名" width="150">
                          <template #default="scope">
                            <el-input v-model="scope.row.name" size="small" placeholder="参数名" @change="emitNodeChange" />
                          </template>
                        </el-table-column>
                        <el-table-column prop="source" label="参数来源" min-width="200">
                          <template #default="scope">
                            <el-select
                              v-model="scope.row.source"
                              size="small"
                              filterable
                              allow-create
                              default-first-option
                              placeholder="选择或输入【节点名.参数名】"
                              @change="emitNodeChange"
                              style="width: 100%"
                            >
                              <el-option-group
                                v-for="preNode in getPredecessorNodes(selectedNode.id)"
                                :key="preNode.id"
                                :label="`${preNode.label} 的参数`"
                              >
                                <el-option
                                  v-for="param in getNodeAllParams(preNode)"
                                  :key="`${param.name}-${param.paramType}`"
                                  :label="`${preNode.label}.${param.name}`"
                                  :value="`${preNode.label}.${param.name}`"
                                >
                                  <div>
                                    <div>{{ preNode.label }}.{{ param.name }} <el-tag size="small" type="info" style="margin-left: 4px;">{{ param.paramType === 'input' ? '输入' : param.paramType === 'output' ? '输出' : '变量' }}</el-tag></div>
                                    <div style="font-size: 11px; color: #909399;">{{ param.type }} - {{ param.description || '无描述' }}</div>
                                  </div>
                                </el-option>
                              </el-option-group>
                            </el-select>
                          </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80">
                          <template #default="scope">
                            <el-button size="small" text type="danger" @click="removeApiParam(scope.$index)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-form-item>
                    <el-form-item v-if="selectedNode.apiMethod === 'POST' || selectedNode.apiMethod === 'PUT' || selectedNode.apiMethod === 'PATCH'" label="请求体参数">
                      <div class="section-header">
                        <span>请求体参数</span>
                        <el-button size="small" text type="primary" @click="addApiBodyParam">添加参数</el-button>
                      </div>
                      <el-table :data="selectedNode.apiBodyParams || []" style="width: 100%" size="small">
                        <el-table-column prop="name" label="参数名" width="150">
                          <template #default="scope">
                            <el-input v-model="scope.row.name" size="small" placeholder="参数名" @change="emitNodeChange" />
                          </template>
                        </el-table-column>
                        <el-table-column prop="source" label="参数来源" min-width="200">
                          <template #default="scope">
                            <el-select
                              v-model="scope.row.source"
                              size="small"
                              filterable
                              allow-create
                              default-first-option
                              placeholder="选择或输入【节点名.参数名】"
                              @change="emitNodeChange"
                              style="width: 100%"
                            >
                              <el-option-group
                                v-for="preNode in getPredecessorNodes(selectedNode.id)"
                                :key="preNode.id"
                                :label="`${preNode.label} 的参数`"
                              >
                                <el-option
                                  v-for="param in getNodeAllParams(preNode)"
                                  :key="`${param.name}-${param.paramType}`"
                                  :label="`${preNode.label}.${param.name}`"
                                  :value="`${preNode.label}.${param.name}`"
                                >
                                  <div>
                                    <div>{{ preNode.label }}.{{ param.name }} <el-tag size="small" type="info" style="margin-left: 4px;">{{ param.paramType === 'input' ? '输入' : param.paramType === 'output' ? '输出' : '变量' }}</el-tag></div>
                                    <div style="font-size: 11px; color: #909399;">{{ param.type }} - {{ param.description || '无描述' }}</div>
                                  </div>
                                </el-option>
                              </el-option-group>
                            </el-select>
                          </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80">
                          <template #default="scope">
                            <el-button size="small" text type="danger" @click="removeApiBodyParam(scope.$index)">删除</el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>

              <!-- API调用节点：输出结果 -->
              <el-tab-pane v-if="selectedNode.type === 'api'" label="输出结果" name="api-output">
                <div class="config-section">
                  <div class="section-header">
                    <span>输出结果</span>
                  </div>
                  <el-alert
                    type="info"
                    :closable="false"
                    style="margin-bottom: 12px"
                  >
                    <template #title>
                      <div style="font-size: 12px;">
                        API节点的输出结果固定为：statusCode（状态码）、headers（响应头）、body（响应数据）、message（错误信息）
                      </div>
                    </template>
                  </el-alert>
                  <el-table :data="getApiOutputResults()" style="width: 100%" size="small" border>
                    <el-table-column prop="name" label="结果名" width="150">
                      <template #default="scope">
                        <el-tag size="small">{{ scope.row.name }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="type" label="类型" width="100">
                      <template #default="scope">
                        <el-tag type="info" size="small">{{ scope.row.type }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="描述" min-width="200">
                      <template #default="scope">
                        {{ scope.row.description }}
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          <div v-else class="empty-tip">选择画布中的节点查看属性</div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Collection, Setting, RefreshLeft, RefreshRight, Link, Refresh, Plus, QuestionFilled, Connection, InfoFilled, Delete, Fold, Expand, ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue'
import { permissions as allPermissions, dataRules } from '../mock/data'
import { getEngineEvents } from '../mock/engineEvents'

const route = useRoute()
const router = useRouter()

// 业务和流程信息
const businessInfo = ref({
  id: null,
  code: '',
  name: ''
})

const processInfo = ref({
  id: null,
  code: '',
  name: '',
  version: '1.0.0'
})

// 节点库（移除审批节点）
const palette = ref([
  { type: 'start', label: '开始', color: '#67c23a' },
  { type: 'end', label: '结束', color: '#f56c6c' },
  { type: 'condition', label: '条件', color: '#409eff' },
  { type: 'message', label: '消息', color: '#e6a23c' },
  { type: 'api', label: 'API', color: '#9c27b0' },
  { type: 'task', label: '任务', color: '#ff9800' }
])

// 画布数据
const nodes = ref([])
const edges = ref([])
const selectedNodeId = ref(null)
const selectedEdgeId = ref(null)
const panelCollapsed = ref(true)
const activeTab = ref('basic')
const zoom = ref(100)
const connectMode = ref(false)
const canvasRef = ref(null)
const draggingNode = ref(null)

// 历史记录
const history = ref([])
const historyIndex = ref(-1)

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const selectedNode = computed(() => {
  return nodes.value.find(n => n.id === selectedNodeId.value)
})

const svgWidth = computed(() => {
  if (!canvasRef.value) return 2000
  return Math.max(2000, ...nodes.value.map(n => n.x + 200))
})

const svgHeight = computed(() => {
  if (!canvasRef.value) return 2000
  return Math.max(2000, ...nodes.value.map(n => n.y + 200))
})

// 右侧属性面板宽度（根据是否选中节点自适应）
const rightPanelWidth = computed(() => {
  if (panelCollapsed.value) return '48px'
  return selectedNodeId.value ? '480px' : '360px'
})

// 事件产生可用的参数源：当前节点的动态输出 + 上游节点参数
const eventMappingSourceParams = computed(() => {
  if (!selectedNode.value) return []
  const result = []
  const pushNodeParams = (node, isSelf) => {
    if (!node) return
    const nodeLabel = node.label || node.name || node.id
    const baseParams = isSelf ? getNodeOutputParams(node) : getNodeAllParams(node)
    baseParams.forEach(p => {
      result.push({
        ...p,
        fromNodeId: node.id,
        fromNodeLabel: nodeLabel,
        displayLabel: isSelf ? p.name : `${nodeLabel}.${p.name}`
      })
    })
  }

  const selfNode = selectedNode.value
  pushNodeParams(selfNode, true)

  const predecessors = getPredecessorNodes(selfNode.id)
  predecessors.forEach(n => pushNodeParams(n, false))

  return result
})

// 当前节点是否存在可映射的输出，用于控制事件产生开关
const hasOutputParamsForEvent = computed(() => {
  return eventMappingSourceParams.value.length > 0
})

// 触发器提示文案
const triggerSummary = computed(() => {
  if (processTriggerConfig.value.triggerType === 'event') {
    return '事件触发'
  }
  if (processTriggerConfig.value.triggerType === 'schedule') {
    return '定时触发'
  }
  return '手动触发'
})

const triggerDetail = computed(() => {
  const config = processTriggerConfig.value
  if (config.triggerType === 'event') {
    if (config.triggerEventCode) {
      return `监听事件：${config.triggerEventCode}` + (config.triggerCondition ? '（含条件）' : '')
    }
    return '监听事件：待配置'
  }
  if (config.triggerType === 'schedule') {
    if (config.triggerCron) {
      return formatCronHuman(config.triggerCron)
    }
    return '定时规则：待配置'
  }
  return '通过界面或 API 手动启动流程'
})

// 定时触发快捷配置
const scheduleQuick = ref({
  mode: 'daily', // daily | weekly | monthly | hourly | minutes
  hour: 9,
  minute: 0,
  weekday: 1, // 0-6，周日=0
  dayOfMonth: 1,
  intervalHours: 1,
  intervalMinutes: 15
})

const clamp = (val, min, max) => {
  const n = Number(val) || 0
  return Math.min(max, Math.max(min, n))
}

const ensureWaitEventMappingArray = () => {
  if (!selectedNode.value) return
  if (!Array.isArray(selectedNode.value.waitEventDataMapping)) {
    selectedNode.value.waitEventDataMapping = []
  }
}

// 构建任务完成回执的默认映射：基于引擎事件管理中选定事件的 dataFields
const buildDefaultWaitEventMapping = () => {
  if (!selectedNode.value || selectedNode.value.type !== 'task') return
  ensureWaitEventMappingArray()

  const code = selectedNode.value.waitEventCode
  if (!code) {
    selectedNode.value.waitEventDataMapping = []
    return
  }

  const ev = events.value.find(e => e.code === code)
  if (!ev || !Array.isArray(ev.dataFields) || ev.dataFields.length === 0) {
    selectedNode.value.waitEventDataMapping = []
    return
  }

  selectedNode.value.waitEventDataMapping = ev.dataFields.map(f => ({
    taskField: f.name,
    eventField: `event.payload.${f.name}`,
    type: f.type || 'string',
    description: f.description || ''
  }))
}

const onWaitEventCodeChange = () => {
  buildDefaultWaitEventMapping()
  emitNodeChange()
}

const pad = (n) => n.toString().padStart(2, '0')

const formatCronHuman = (cron) => {
  if (!cron) return '定时规则：待配置'
  const parts = cron.trim().split(/\s+/)
  if (parts.length < 6) return `Cron：${cron}`
  const [s, m, h, dom, mon, dow] = parts

  // 每N分钟：0 */N * * * *
  if (s === '0' && m.startsWith('*/') && h === '*' && dom === '*' && mon === '*' && dow === '*') {
    return `每${m.replace('*/', '')}分钟`
  }

  // 每N小时：0 mm */N * * *
  if (s === '0' && h.startsWith('*/') && dom === '*' && mon === '*' && dow === '*') {
    return `每${h.replace('*/', '')}小时的${pad(m)}分`
  }

  // 每天：0 mm HH * * *
  if (s === '0' && dom === '*' && mon === '*' && dow === '*') {
    return `每天${pad(h)}:${pad(m)}`
  }

  // 每周：0 mm HH * * DOW
  if (s === '0' && dom === '*' && mon === '*' && dow !== '*') {
    const weekday = ['周日','周一','周二','周三','周四','周五','周六']
    const w = Number(dow)
    const wLabel = Number.isNaN(w) ? dow : (weekday[w] || `周${dow}`)
    return `每${wLabel} ${pad(h)}:${pad(m)}`
  }

  // 每月：0 mm HH DOM * *
  if (s === '0' && dom !== '*' && mon === '*' && dow === '*') {
    return `每月${dom}日 ${pad(h)}:${pad(m)}`
  }

  return `Cron：${cron}`
}

const applyScheduleQuickCron = () => {
  const q = scheduleQuick.value
  const h = clamp(q.hour, 0, 23)
  const m = clamp(q.minute, 0, 59)
  let cron = ''
  switch (q.mode) {
    case 'weekly':
      cron = `0 ${m} ${h} * * ${clamp(q.weekday, 0, 6)}`
      break
    case 'monthly':
      cron = `0 ${m} ${h} ${clamp(q.dayOfMonth, 1, 28)} * *`
      break
    case 'hourly':
      cron = `0 ${m} */${clamp(q.intervalHours, 1, 24)} * * *`
      break
    case 'minutes':
      cron = `0 */${clamp(q.intervalMinutes, 1, 59)} * * * *`
      break
    default: // daily
      cron = `0 ${m} ${h} * * *`
  }
  processTriggerConfig.value.triggerCron = cron
  onProcessConfigChange()
}

// 当选中 / 取消选中节点时，自动展开或收起属性面板
watch(selectedNodeId, (newVal) => {
  if (newVal) {
    panelCollapsed.value = false
  } else {
    panelCollapsed.value = true
  }
})

// 确保事件数据映射为数组，避免切换开关时的显示错乱
const ensureProduceEventDataArray = () => {
  if (!selectedNode.value) return
  if (!Array.isArray(selectedNode.value.produceEventData)) {
    selectedNode.value.produceEventData = []
  }
}

// 选中节点后进行一次结构归一化
const normalizeSelectedNode = () => {
  if (!selectedNode.value) return
  ensureProduceEventDataArray()
  ensureWaitEventMappingArray()
  if (!selectedNode.value.outputResults) {
    selectedNode.value.outputResults = []
  }
  if (selectedNode.value.produceEventCode === undefined || selectedNode.value.produceEventCode === null) {
    selectedNode.value.produceEventCode = ''
  }
  if (selectedNode.value.type === 'task') {
    if (!selectedNode.value.waitEventCode) {
      selectedNode.value.waitEventCode = `task.completed.${selectedNode.value.id || 'task'}`
    }
    buildDefaultWaitEventMapping()
  }
}

// 节点样式
const nodeStyle = (node) => {
  const scale = zoom.value / 100
  return {
    left: `${node.x * scale}px`,
    top: `${node.y * scale}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left'
  }
}

const getNodeColor = (type) => {
  const colors = {
    start: '#67c23a',
    end: '#f56c6c',
    condition: '#409eff',
    message: '#e6a23c',
    api: '#9c27b0',
    task: '#ff9800'
  }
  return colors[type] || '#409eff'
}

const getNodeIcon = (type) => {
  const icons = {
    start: '▶',
    end: '■',
    condition: '◇',
    message: '✉',
    api: '🔌',
    task: '📋'
  }
  return icons[type] || ''
}

// 判断节点是否为自动化节点（立即执行）
const isAutoNode = (type) => {
  return ['start', 'end', 'condition', 'message', 'api'].includes(type)
}

// 判断节点是否为人工节点（暂停执行，等待人工操作）
const isHumanNode = (type) => {
  return ['task'].includes(type)
}

// 节点操作
const onPaletteDragStart = (item) => {
  // 拖拽开始，数据存储在dataTransfer中
}

const onCanvasDrop = (e) => {
  const type = e.dataTransfer.getData('nodeType')
  if (!type) return

  const rect = canvasRef.value.getBoundingClientRect()
  const scale = zoom.value / 100
  const x = (e.clientX - rect.left) / scale
  const y = (e.clientY - rect.top) / scale

  const newNode = {
    id: `node_${Date.now()}`,
    type,
    label: type === 'start' ? '开始' : type === 'end' ? '结束' : type === 'condition' ? '条件' : type === 'message' ? '消息' : type === 'api' ? 'API' : type === 'task' ? '任务' : '节点',
    x: Math.max(0, x - 60),
    y: Math.max(0, y - 24),
    description: '',
    inputParams: type === 'start' || type === 'condition' || type === 'message' || type === 'api' || type === 'task' ? [] : undefined,
    variables: type === 'start' ? [] : undefined,
    outputResults: type === 'end' || type === 'message' || type === 'api' || type === 'task' ? [] : undefined,
    // 条件节点特有属性
    conditionBranches: type === 'condition' ? [] : undefined,
    // 消息节点特有属性
    messageTemplateId: type === 'message' ? null : undefined,
    messageTemplateCode: type === 'message' ? '' : undefined,
    messageParams: type === 'message' ? [] : undefined,
    // API调用节点特有属性
    apiMethod: type === 'api' ? 'GET' : undefined,
    apiUrl: type === 'api' ? '' : undefined,
    apiHeaders: type === 'api' ? [] : undefined,
    apiParams: type === 'api' ? [] : undefined,
    apiBodyParams: type === 'api' ? [] : undefined,
    // 人工节点特有属性（任务）
    requiredRoles: type === 'task' ? [] : undefined,
    validityType: type === 'task' ? 'nodeDuration' : undefined,
    // 产品端配置（参考流程节点配置）
    productConfigs: type === 'task' ? [] : undefined,
    // 任务节点：外部完成事件配置
    waitEventCode: type === 'task' ? '' : undefined,
    waitEventDataMapping: type === 'task' ? [] : undefined,
    // 所有节点：事件产生配置（节点执行完成后产生的事件）
    produceEvent: false, // 是否产生事件
    produceEventCode: '', // 产生的事件编码（如：process.node.completed.{nodeId} 或自定义）
    produceEventData: [], // 事件数据映射
    // 开始节点：触发配置
    triggerType: type === 'start' ? 'manual' : undefined,
    triggerEventCode: type === 'start' ? '' : undefined,
    triggerCondition: type === 'start' ? '' : undefined,
    triggerParamMapping: type === 'start' ? [] : undefined,
    triggerCron: type === 'start' ? '' : undefined,
    triggerTimezone: type === 'start' ? 'system' : undefined
  }

  nodes.value.push(newNode)
  saveHistory()
  selectNode(newNode.id)
}

// 修复拖拽事件
const onPaletteDragStartFixed = (e, item) => {
  e.dataTransfer.setData('nodeType', item.type)
}

// 更新palette的拖拽事件
const paletteItems = computed(() => {
  return palette.value.map(item => ({
    ...item,
    onDragStart: (e) => onPaletteDragStartFixed(e, item)
  }))
})

// 连线操作
const connectingEdge = ref(null)
const connectingSourceNode = ref(null)
const connectingPreviewLine = ref(null)

const onCanvasMouseDown = (e) => {
  // 点击画布时获取焦点，便于响应键盘事件
  if (canvasRef.value) {
    canvasRef.value.focus()
  }

  if (!connectMode.value) {
    // 非连线模式，检查是否点击了节点
    const clickedNode = findNodeAtPosition(e)
    if (clickedNode) {
      selectNode(clickedNode.id)
      // 单击只选中，不强制展开，保持当前面板状态
    } else {
      // 点击空白区域时取消节点选择并收起属性面板
      selectedNodeId.value = null
      panelCollapsed.value = true
    }
    return
  }
  
  // 连线模式：检查是否点击了节点
  const clickedNode = findNodeAtPosition(e)
  if (clickedNode) {
    if (!connectingSourceNode.value) {
      // 开始连线：选择源节点
      connectingSourceNode.value = clickedNode
      connectingPreviewLine.value = {
        source: clickedNode.id,
        x1: getNodeCenter(clickedNode.id).x,
        y1: getNodeCenter(clickedNode.id).y,
        x2: 0,
        y2: 0
      }
    } else {
      // 完成连线：选择目标节点
      if (connectingSourceNode.value.id !== clickedNode.id) {
        // 检查是否已存在连线
        const existingEdge = edges.value.find(
          e => e.source === connectingSourceNode.value.id && e.target === clickedNode.id
        )
        if (!existingEdge) {
          // 创建新连线
          const newEdge = {
            id: `edge_${Date.now()}`,
            source: connectingSourceNode.value.id,
            target: clickedNode.id,
            label: '',
            condition: '',
            priority: 0,
            lineType: 'curve' // 默认曲线
          }
          edges.value.push(newEdge)
          saveHistory()
          ElMessage.success('连线创建成功')
        } else {
          ElMessage.warning('连线已存在')
        }
      }
      // 重置连线状态
      connectingSourceNode.value = null
      connectingPreviewLine.value = null
    }
  } else {
    // 点击空白处，取消连线
    if (connectingSourceNode.value) {
      connectingSourceNode.value = null
      connectingPreviewLine.value = null
    }
  }
}

// 查找点击位置的节点
const findNodeAtPosition = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  const scale = zoom.value / 100
  const x = (e.clientX - rect.left) / scale
  const y = (e.clientY - rect.top) / scale
  
  // 检查是否点击了某个节点
  for (const node of nodes.value) {
    const nodeCenter = getNodeCenter(node.id)
    const nodeWidth = 120
    const nodeHeight = 48
    if (
      x >= nodeCenter.x - nodeWidth / 2 &&
      x <= nodeCenter.x + nodeWidth / 2 &&
      y >= nodeCenter.y - nodeHeight / 2 &&
      y <= nodeCenter.y + nodeHeight / 2
    ) {
      return node
    }
  }
  return null
}

const onCanvasMouseMove = (e) => {
  if (draggingNode.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    const scale = zoom.value / 100
    const x = (e.clientX - rect.left) / scale - draggingNode.value.offsetX
    const y = (e.clientY - rect.top) / scale - draggingNode.value.offsetY
    const node = nodes.value.find(n => n.id === draggingNode.value.id)
    if (node) {
      node.x = Math.max(0, x)
      node.y = Math.max(0, y)
    }
  } else if (connectMode.value && connectingSourceNode.value && connectingPreviewLine.value) {
    // 更新预览连线
    const rect = canvasRef.value.getBoundingClientRect()
    const scale = zoom.value / 100
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale
    connectingPreviewLine.value.x2 = x
    connectingPreviewLine.value.y2 = y
  }
}

const onCanvasMouseUp = () => {
  draggingNode.value = null
  // 注意：连线完成在onCanvasMouseDown中处理，这里不需要重置
}

// 处理节点鼠标按下事件
const handleNodeMouseDown = (node, e) => {
  // 连线模式下，直接处理连线逻辑
  if (connectMode.value) {
    e.stopPropagation() // 阻止冒泡，避免画布的onCanvasMouseDown也处理
    if (!connectingSourceNode.value) {
      // 开始连线：选择源节点
      connectingSourceNode.value = node
      connectingPreviewLine.value = {
        source: node.id,
        x1: getNodeCenter(node.id).x,
        y1: getNodeCenter(node.id).y,
        x2: 0,
        y2: 0
      }
      // 选中节点以便显示
      selectedNodeId.value = node.id
    } else {
      // 完成连线：选择目标节点
      if (connectingSourceNode.value.id !== node.id) {
        // 检查是否已存在连线
        const existingEdge = edges.value.find(
          edge => edge.source === connectingSourceNode.value.id && edge.target === node.id
        )
        if (!existingEdge) {
          // 创建新连线
          const newEdge = {
            id: `edge_${Date.now()}`,
            source: connectingSourceNode.value.id,
            target: node.id,
            label: '',
            condition: '',
            priority: 0,
            lineType: 'curve' // 默认曲线
          }
          edges.value.push(newEdge)
          saveHistory()
          ElMessage.success('连线创建成功')
        } else {
          ElMessage.warning('连线已存在')
        }
      }
      // 重置连线状态，准备下一次连线
      connectingSourceNode.value = null
      connectingPreviewLine.value = null
      // 选中目标节点
      selectedNodeId.value = node.id
    }
    return
  }
  // 非连线模式，正常拖拽
  startDragNode(node, e)
  // 拖拽前先选中节点并让画布获得焦点，方便后续使用删除键
  selectNode(node.id)
  if (canvasRef.value) {
    canvasRef.value.focus()
  }
}

const startDragNode = (node, e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  const scale = zoom.value / 100
  draggingNode.value = {
    id: node.id,
    offsetX: (e.clientX - rect.left) / scale - node.x,
    offsetY: (e.clientY - rect.top) / scale - node.y
  }
}

// 处理节点点击
const handleNodeClick = (id, e) => {
  if (connectMode.value) {
    // 连线模式下，节点点击由onCanvasMouseDown处理，这里不处理
    return
  }
  // 非连线模式，正常选择节点
  selectNode(id)
  // 点击节点时让画布获取焦点，方便使用键盘删除
  if (canvasRef.value) {
    canvasRef.value.focus()
  }
}

const handleNodeDoubleClick = (id, e) => {
  selectNode(id)
  panelCollapsed.value = false
  if (canvasRef.value) {
    nextTick(() => canvasRef.value?.focus())
  }
}

const selectNode = (id) => {
  selectedNodeId.value = id
  normalizeSelectedNode()
}

const togglePanel = () => {
  panelCollapsed.value = !panelCollapsed.value
}

const onProduceEventToggle = (val) => {
  if (val) {
    ensureProduceEventDataArray()
    if (!selectedNode.value.produceEventCode) {
      selectedNode.value.produceEventCode = `process.node.completed.${selectedNode.value.id || 'node'}`
    }
  }
  emitNodeChange()
}

// 画布键盘事件处理（支持 Delete / Backspace 删除选中节点）
const handleCanvasKeydown = (e) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedNodeId.value) {
      deleteNode(selectedNodeId.value)
    }
  }
}

const deleteNode = (id) => {
  ElMessageBox.confirm('确定要删除该节点吗？', '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(() => {
    nodes.value = nodes.value.filter(n => n.id !== id)
    edges.value = edges.value.filter(e => e.source !== id && e.target !== id)
    if (selectedNodeId.value === id) {
      selectedNodeId.value = null
    }
    saveHistory()
  }).catch(() => {})
}

const selectEdge = (id) => {
  selectedEdgeId.value = id
  // 可以在这里打开连线编辑弹窗
  openEdgeDialog(id)
}

// 权限配置弹窗
const permissionConfigDialogVisible = ref(false)

// 打开权限配置弹窗
const openPermissionConfigDialog = () => {
  permissionConfigDialogVisible.value = true
  // 如果没有产品端配置，初始化一个
  if (!selectedNode.value.productConfigs || selectedNode.value.productConfigs.length === 0) {
    addProductConfig()
  } else {
    // 初始化已有产品端配置的权限树缓存
    selectedNode.value.productConfigs.forEach(config => {
      if (config.productPort && !permissionTreeCache.value[config.id]) {
        const treeData = getPermissionTreeByPort(config.productPort)
        permissionTreeCache.value[config.id] = treeData
        
        // 初始化扩展节点
        if (!config.expandedKeys) {
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
          collectExpandedKeys(treeData)
          config.expandedKeys = expandedKeys
        }
      }
    })
  }
}

// 保存权限配置
const savePermissionConfig = () => {
  emitNodeChange()
  ElMessage.success('权限配置已保存')
  permissionConfigDialogVisible.value = false
}

// 获取API方法的标签类型
const getApiMethodTagType = (method) => {
  const methodUpper = (method || 'GET').toUpperCase()
  const map = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger',
    'PATCH': 'info'
  }
  return map[methodUpper] || 'info'
}

// 打开连线编辑弹窗
const edgeDialogVisible = ref(false)
const edgeForm = ref({
  id: null,
  subscribeEventCode: '', // 订阅的事件编码
  condition: '', // 事件条件
  label: '',
  priority: 0,
  lineType: 'curve' // 默认曲线
})

// 流程配置
const showProcessConfig = ref(false)
const processConfigTab = ref('trigger')
const processTriggerConfig = ref({
  triggerType: 'manual', // manual, event, schedule
  triggerEventCode: '',
  triggerCondition: '',
  triggerParamMapping: [],
  triggerCron: '',
  triggerTimezone: 'system'
})

const openEdgeDialog = (edgeId) => {
  const edge = edges.value.find(e => e.id === edgeId)
  if (edge) {
    const sourceNode = nodes.value.find(n => n.id === edge.source)
    edgeForm.value = {
      id: edge.id,
      subscribeEventCode: edge.subscribeEventCode || (sourceNode?.produceEventCode || ''),
      condition: edge.condition || '',
      label: edge.label || '',
      priority: edge.priority || 0,
      lineType: edge.lineType || 'curve'
    }
    edgeDialogVisible.value = true
  }
}

const saveEdge = () => {
  const edge = edges.value.find(e => e.id === edgeForm.value.id)
  if (edge) {
    edge.subscribeEventCode = edgeForm.value.subscribeEventCode
    edge.condition = edgeForm.value.condition
    edge.label = edgeForm.value.label
    edge.priority = edgeForm.value.priority
    edge.lineType = edgeForm.value.lineType
    saveHistory()
    ElMessage.success('连线配置已保存')
    edgeDialogVisible.value = false
  }
}

// 获取源节点产生的事件列表（用于连线配置）
const getSourceNodeEvents = () => {
  const edge = edges.value.find(e => e.id === edgeForm.value.id)
  if (!edge) return []
  
  const sourceNode = nodes.value.find(n => n.id === edge.source)
  if (!sourceNode) return []
  
  const events = []
  
  // 如果源节点配置了产生事件
  if (sourceNode.produceEvent && sourceNode.produceEventCode) {
    events.push({
      code: sourceNode.produceEventCode,
      label: `${sourceNode.produceEventCode}（节点配置）`
    })
  }
  
  // 默认事件
  const defaultEvent = `process.node.completed.${sourceNode.id}`
  events.push({
    code: defaultEvent,
    label: `${defaultEvent}（默认事件）`
  })
  
  // 人工节点特定事件
  if (isHumanNode(sourceNode.type) && sourceNode.type === 'task') {
    events.push({
      code: `task.completed.${sourceNode.id}`,
      label: `task.completed.${sourceNode.id}（任务完成事件）`
    })
  }
  
  return events
}

const deleteEdge = () => {
  const edge = edges.value.find(e => e.id === edgeForm.value.id)
  if (edge) {
    edges.value = edges.value.filter(e => e.id !== edge.id)
    saveHistory()
    ElMessage.success('连线已删除')
    edgeDialogVisible.value = false
    selectedEdgeId.value = null
  }
}

// 计算曲线路径（优化的贝塞尔曲线）
const getCurvePath = (edge) => {
  const start = getLineStartPoint(edge)
  const end = getLineEndPoint(edge)
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // 根据距离动态调整控制点偏移，使曲线更优雅
  const controlOffset = Math.min(Math.max(distance * 0.25, 30), 80)
  
  // 计算控制点，使曲线更优雅
  let cp1x, cp1y, cp2x, cp2y
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // 水平方向为主
    cp1x = start.x + dx * 0.5
    cp1y = start.y - (dy >= 0 ? controlOffset : -controlOffset)
    cp2x = start.x + dx * 0.5
    cp2y = end.y + (dy >= 0 ? controlOffset : -controlOffset)
  } else {
    // 垂直方向为主
    cp1x = start.x - (dx >= 0 ? controlOffset : -controlOffset)
    cp1y = start.y + dy * 0.5
    cp2x = end.x + (dx >= 0 ? controlOffset : -controlOffset)
    cp2y = start.y + dy * 0.5
  }
  
  return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`
}

// 计算预览曲线路径
const getPreviewCurvePath = (previewLine) => {
  const start = { x: previewLine.x1, y: previewLine.y1 }
  const end = { x: previewLine.x2, y: previewLine.y2 }
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  const controlOffset = Math.min(Math.max(distance * 0.25, 30), 80)
  
  let cp1x, cp1y, cp2x, cp2y
  
  if (Math.abs(dx) > Math.abs(dy)) {
    cp1x = start.x + dx * 0.5
    cp1y = start.y - (dy >= 0 ? controlOffset : -controlOffset)
    cp2x = start.x + dx * 0.5
    cp2y = end.y + (dy >= 0 ? controlOffset : -controlOffset)
  } else {
    cp1x = start.x - (dx >= 0 ? controlOffset : -controlOffset)
    cp1y = start.y + dy * 0.5
    cp2x = end.x + (dx >= 0 ? controlOffset : -controlOffset)
    cp2y = start.y + dy * 0.5
  }
  
  return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`
}

// 计算折线路径
const getPolylinePoints = (edge) => {
  const start = getLineStartPoint(edge)
  const end = getLineEndPoint(edge)
  const midX = (start.x + end.x) / 2
  return `${start.x},${start.y} ${midX},${start.y} ${midX},${end.y} ${end.x},${end.y}`
}

// 连线计算
const getNodeCenter = (id) => {
  const node = nodes.value.find(n => n.id === id)
  if (!node) return { x: 0, y: 0 }
  return { x: node.x + 60, y: node.y + 24 }
}

// 计算节点边界上的连接点（箭头指向边缘中间）
const getLineStartPoint = (edge) => {
  const sourceNode = nodes.value.find(n => n.id === edge.source)
  const targetNode = nodes.value.find(n => n.id === edge.target)
  if (!sourceNode || !targetNode) return { x: 0, y: 0 }
  
  const sourceCenter = getNodeCenter(edge.source)
  const targetCenter = getNodeCenter(edge.target)
  
  // 节点宽度和高度
  const nodeWidth = 120
  const nodeHeight = 48
  
  // 计算从源节点中心到目标节点中心的方向
  const dx = targetCenter.x - sourceCenter.x
  const dy = targetCenter.y - sourceCenter.y
  
  // 确定源节点应该从哪个面出发（上、下、左、右）
  // 根据目标节点相对于源节点的位置决定
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  
  let startX, startY
  
  if (absDx > absDy) {
    // 水平方向为主：从左侧或右侧出发
    if (dx > 0) {
      // 目标在右侧，从源节点右侧中间出发
      startX = sourceCenter.x + nodeWidth / 2
      startY = sourceCenter.y
    } else {
      // 目标在左侧，从源节点左侧中间出发
      startX = sourceCenter.x - nodeWidth / 2
      startY = sourceCenter.y
    }
  } else {
    // 垂直方向为主：从顶部或底部出发
    if (dy > 0) {
      // 目标在下侧，从源节点底部中间出发
      startX = sourceCenter.x
      startY = sourceCenter.y + nodeHeight / 2
    } else {
      // 目标在上侧，从源节点顶部中间出发
      startX = sourceCenter.x
      startY = sourceCenter.y - nodeHeight / 2
    }
  }
  
  return { x: startX, y: startY }
}

const getLineEndPoint = (edge) => {
  const sourceNode = nodes.value.find(n => n.id === edge.source)
  const targetNode = nodes.value.find(n => n.id === edge.target)
  if (!sourceNode || !targetNode) return { x: 0, y: 0 }
  
  const sourceCenter = getNodeCenter(edge.source)
  const targetCenter = getNodeCenter(edge.target)
  
  // 节点宽度和高度
  const nodeWidth = 120
  const nodeHeight = 48
  
  // 计算从源节点中心到目标节点中心的方向
  const dx = targetCenter.x - sourceCenter.x
  const dy = targetCenter.y - sourceCenter.y
  
  // 确定目标节点应该从哪个面接收（上、下、左、右）
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  
  let endX, endY
  
  if (absDx > absDy) {
    // 水平方向为主：从左侧或右侧接收
    if (dx > 0) {
      // 源在左侧，目标节点从左侧中间接收
      endX = targetCenter.x - nodeWidth / 2
      endY = targetCenter.y
    } else {
      // 源在右侧，目标节点从右侧中间接收
      endX = targetCenter.x + nodeWidth / 2
      endY = targetCenter.y
    }
  } else {
    // 垂直方向为主：从顶部或底部接收
    if (dy > 0) {
      // 源在上侧，目标节点从顶部中间接收
      endX = targetCenter.x
      endY = targetCenter.y - nodeHeight / 2
    } else {
      // 源在下侧，目标节点从底部中间接收
      endX = targetCenter.x
      endY = targetCenter.y + nodeHeight / 2
    }
  }
  
  return { x: endX, y: endY }
}

// 开始节点：输入参数和变量
const addInputParam = () => {
  if (!selectedNode.value.inputParams) {
    selectedNode.value.inputParams = []
  }
  selectedNode.value.inputParams.push({
    name: '',
    type: 'string',
    required: false,
    defaultValue: '',
    description: ''
  })
  emitNodeChange()
}

const removeInputParam = (index) => {
  selectedNode.value.inputParams.splice(index, 1)
  emitNodeChange()
}

const addVariable = () => {
  if (!selectedNode.value.variables) {
    selectedNode.value.variables = []
  }
  selectedNode.value.variables.push({
    name: '',
    type: 'string',
    value: '',
    description: ''
  })
  emitNodeChange()
}

const removeVariable = (index) => {
  selectedNode.value.variables.splice(index, 1)
  emitNodeChange()
}

// 结束节点：输出结果
const addOutputResult = () => {
  ensureProduceEventDataArray()
  if (!selectedNode.value.outputResults) {
    selectedNode.value.outputResults = []
  }
  selectedNode.value.outputResults.push({
    name: '',
    type: 'string',
    value: '',
    description: ''
  })
  emitNodeChange()
}

const removeOutputResult = (index) => {
  selectedNode.value.outputResults.splice(index, 1)
  emitNodeChange()
}

// 获取前置节点（有连线指向当前节点的节点）
const getPredecessorNodes = (nodeId) => {
  const visited = new Set()
  const queue = []
  // 先加入直接前置
  edges.value
    .filter(e => e.target === nodeId)
    .forEach(e => queue.push(e.source))
  
  const result = []
  while (queue.length > 0) {
    const currentId = queue.shift()
    if (visited.has(currentId)) continue
    visited.add(currentId)
    const currentNode = nodes.value.find(n => n.id === currentId)
    if (currentNode) {
      result.push(currentNode)
      // 继续向上收集祖先节点
      edges.value
        .filter(e => e.target === currentId)
        .forEach(e => {
          if (!visited.has(e.source)) {
            queue.push(e.source)
          }
        })
    }
  }
  return result
}

// 获取节点的所有可用参数（包括输入参数和输出结果）
const getNodeAllParams = (node) => {
  const params = []
  
  // 开始节点：返回输入参数和流程变量
  if (node.type === 'start') {
    if (node.inputParams) {
      params.push(...node.inputParams.map(p => ({ ...p, paramType: 'input', source: 'inputParams' })))
    }
    if (node.variables) {
      params.push(...node.variables.map(v => ({ ...v, paramType: 'variable', source: 'variables' })))
    }
  }
  
  // 所有节点：返回输出结果
  if (node.outputResults) {
    params.push(...node.outputResults.map(r => ({ ...r, paramType: 'output', source: 'outputResults' })))
  }
  
  // API节点：返回固定的输出结果
  if (node.type === 'api') {
    params.push(
      { name: 'statusCode', type: 'number', description: 'HTTP状态码', paramType: 'output', source: 'api' },
      { name: 'headers', type: 'object', description: '响应头对象', paramType: 'output', source: 'api' },
      { name: 'body', type: 'object', description: '响应数据', paramType: 'output', source: 'api' },
      { name: 'message', type: 'string', description: '错误信息', paramType: 'output', source: 'api' }
    )
  }
  
  // 消息节点：返回固定的输出结果
  if (node.type === 'message') {
    params.push(
      { name: 'messageId', type: 'string', description: '消息ID', paramType: 'output', source: 'message' },
      { name: 'status', type: 'string', description: '发送状态', paramType: 'output', source: 'message' },
      { name: 'result', type: 'object', description: '发送结果', paramType: 'output', source: 'message' }
    )
  }

  // 任务节点：基于选定的完成回执事件动态返回输出字段
  if (node.type === 'task') {
    // 优先使用已构建的映射（包含类型和描述）
    if (Array.isArray(node.waitEventDataMapping) && node.waitEventDataMapping.length > 0) {
      params.push(
        ...node.waitEventDataMapping.map(m => ({
          name: m.taskField,
          type: m.type || 'string',
          description: m.description || '',
          paramType: 'output',
          source: 'taskReceipt'
        }))
      )
    } else if (node.waitEventCode) {
      // 兜底：根据事件中心的 dataFields 推导（例如历史数据中还没有映射）
      const ev = events.value.find(e => e.code === node.waitEventCode)
      if (ev && Array.isArray(ev.dataFields)) {
        params.push(
          ...ev.dataFields.map(f => ({
            name: f.name,
            type: f.type || 'string',
            description: f.description || '',
            paramType: 'output',
            source: 'taskReceipt'
          }))
        )
      }
    }
  }
  
  // 条件节点：返回输入参数（这些参数来自前置节点）
  if (node.type === 'condition' && node.inputParams) {
    params.push(...node.inputParams.map(p => ({ ...p, paramType: 'input', source: 'inputParams' })))
  }
  
  return params
}

// 获取节点的输出参数（保持向后兼容）
const getNodeOutputParams = (node) => {
  return getNodeAllParams(node).filter(p => p.paramType === 'output' || p.source === 'inputParams' || p.source === 'variables')
}

// 条件分支节点：输入参数管理
const addConditionInputParam = () => {
  if (!selectedNode.value.inputParams) {
    selectedNode.value.inputParams = []
  }
  selectedNode.value.inputParams.push({
    name: '',
    source: '', // 参数来源：格式为【节点名称.参数名】
    type: 'string',
    description: ''
  })
  emitNodeChange()
}

const removeConditionInputParam = (index) => {
  selectedNode.value.inputParams.splice(index, 1)
  emitNodeChange()
}

// 条件分支节点：分支管理
const addConditionBranch = () => {
  if (!selectedNode.value.conditionBranches) {
    selectedNode.value.conditionBranches = []
  }
  selectedNode.value.conditionBranches.push({
    id: `branch_${Date.now()}`,
    label: `分支${selectedNode.value.conditionBranches.length + 1}`,
    conditions: [
      {
        field: '',
        operator: '==',
        value: ''
      }
    ],
    logic: '&&', // 默认并且
    targetNodeId: ''
  })
  emitNodeChange()
}

// 添加条件规则
const addConditionRule = (branchIndex) => {
  if (!selectedNode.value.conditionBranches[branchIndex].conditions) {
    selectedNode.value.conditionBranches[branchIndex].conditions = []
  }
  selectedNode.value.conditionBranches[branchIndex].conditions.push({
    field: '',
    operator: '==',
    value: ''
  })
  emitNodeChange()
}

// 删除条件规则
const removeConditionRule = (branchIndex, conditionIndex) => {
  selectedNode.value.conditionBranches[branchIndex].conditions.splice(conditionIndex, 1)
  emitNodeChange()
}

const removeConditionBranch = (index) => {
  const branch = selectedNode.value.conditionBranches[index]
  // 删除对应的连线
  if (branch.targetNodeId) {
    edges.value = edges.value.filter(e => 
      !(e.source === selectedNode.value.id && e.target === branch.targetNodeId)
    )
  }
  selectedNode.value.conditionBranches.splice(index, 1)
  emitNodeChange()
}

// 将条件规则转换为表达式（用于显示和保存）
const buildConditionExpression = (branch) => {
  if (!branch.conditions || branch.conditions.length === 0) {
    return ''
  }
  const logic = branch.logic || '&&'
  return branch.conditions.map(cond => {
    const field = cond.field || '?'
    const operator = cond.operator || '=='
    const value = cond.value || ''
    return `${field} ${operator} ${value}`
  }).join(` ${logic} `)
}

// 条件分支目标节点变化
const onConditionBranchTargetChange = (index) => {
  const branch = selectedNode.value.conditionBranches[index]
  if (branch.targetNodeId) {
    // 检查是否已存在连线
    const existingEdge = edges.value.find(
      e => e.source === selectedNode.value.id && e.target === branch.targetNodeId
    )
    if (!existingEdge) {
      // 创建新连线
      const newEdge = {
        id: `edge_${Date.now()}`,
        source: selectedNode.value.id,
        target: branch.targetNodeId,
        label: branch.label || '',
        condition: buildConditionExpression(branch),
        lineType: 'curve' // 默认曲线
      }
      edges.value.push(newEdge)
      saveHistory()
    }
  }
  emitNodeChange()
}

// 获取可用的目标节点（排除当前节点和开始节点）
const getAvailableTargetNodes = (excludeNodeId) => {
  return nodes.value.filter(n => n.id !== excludeNodeId && n.type !== 'start')
}

// 获取条件节点的分支数量
const getConditionBranchCount = (nodeId) => {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node || !node.conditionBranches) return 0
  return node.conditionBranches.length
}

// 消息模板相关
const messageTemplates = ref([])

// 参数标签映射（与消息中心保持一致）
const paramLabelMap = {
  userName: '用户姓名',
  orderId: '订单编号',
  orderAmount: '订单金额',
  orderTime: '订单时间',
  productName: '商品名称',
  phone: '手机号',
  email: '邮箱',
  verifyCode: '验证码'
}

// 获取参数中文标签
const getParamLabel = (paramCode) => {
  return paramLabelMap[paramCode] || paramCode
}

// 加载消息模板列表
const loadMessageTemplates = async () => {
  // TODO: 从API加载消息模板列表
  // 模拟数据（与消息中心模板配置保持一致）
  messageTemplates.value = [
    {
      id: 'tpl-1',
      templateCode: 'TPL001',
      templateTitle: '预约失效通知模板',
      templateType: 'sms',
      messageType: 'notice',
      content: '尊敬的{userName}，您的预约已失效，请重新预约。订单号：{orderId}',
      usedParameters: ['userName', 'orderId']
    },
    {
      id: 'tpl-2',
      templateCode: 'TPL002',
      templateTitle: '订单支付成功通知',
      templateType: 'sms',
      messageType: 'notice',
      content: '您好{userName}，您的订单{orderId}已支付成功，金额{orderAmount}元，订单时间{orderTime}。感谢您的支持！',
      usedParameters: ['userName', 'orderId', 'orderAmount', 'orderTime']
    },
    {
      id: 'tpl-3',
      templateCode: 'TPL003',
      templateTitle: '商品发货通知',
      templateType: 'sms',
      messageType: 'notice',
      content: '您好{userName}，您购买的商品{productName}已发货，订单号{orderId}，请注意查收。',
      usedParameters: ['userName', 'productName', 'orderId']
    },
    {
      id: 'tpl-4',
      templateCode: 'TPL004',
      templateTitle: '验证码短信',
      templateType: 'sms',
      messageType: 'verify',
      content: '您的验证码是{verifyCode}，有效期5分钟，请勿泄露给他人。',
      usedParameters: ['verifyCode']
    },
    {
      id: 'tpl-5',
      templateCode: 'TPL005',
      templateTitle: '课程开课提醒',
      templateType: 'sms',
      messageType: 'notice',
      content: '您好{userName}，您预约的课程{productName}将于{orderTime}开始，请准时参加。',
      usedParameters: ['userName', 'productName', 'orderTime']
    },
    {
      id: 'tpl-6',
      templateCode: 'TPL006',
      templateTitle: '营销活动推广',
      templateType: 'sms',
      messageType: 'marketing',
      content: '尊敬的{userName}，限时优惠活动正在进行中！{productName}现价{orderAmount}元，活动时间{orderTime}，快来抢购吧！',
      usedParameters: ['userName', 'productName', 'orderAmount', 'orderTime']
    },
    {
      id: 'tpl-7',
      templateCode: 'TPL007',
      templateTitle: '账户余额变动通知',
      templateType: 'sms',
      messageType: 'notice',
      content: '您好{userName}，您的账户余额已变动，当前余额{orderAmount}元。如有疑问，请联系客服{phone}。',
      usedParameters: ['userName', 'orderAmount', 'phone']
    },
    {
      id: 'tpl-8',
      templateCode: 'TPL008',
      templateTitle: '会员到期提醒',
      templateType: 'sms',
      messageType: 'notice',
      content: '尊敬的{userName}，您的会员将于{orderTime}到期，续费可享受更多权益。',
      usedParameters: ['userName', 'orderTime']
    }
  ]
}

// 事件列表相关（共用引擎事件管理数据）
const events = ref([])

// 加载事件列表
const loadEvents = async () => {
  events.value = getEngineEvents()
}

// 事件分组（按类型）
const filteredEvents = computed(() => {
  const bizId = businessInfo.value.id
  if (!bizId) return events.value
  return events.value.filter(e => e.businessId === bizId || e.businessId === null || e.businessId === undefined)
})

const eventGroups = computed(() => {
  const groups = {
    process: { type: 'process', label: '流程事件', events: [] },
    business: { type: 'business', label: '业务事件', events: [] },
    system: { type: 'system', label: '系统事件', events: [] },
    external: { type: 'external', label: '外部事件', events: [] }
  }
  
  filteredEvents.value.forEach(event => {
    if (groups[event.type]) {
      groups[event.type].events.push(event)
    }
  })
  
  return Object.values(groups).filter(g => g.events.length > 0)
})

// 添加触发参数映射
const addTriggerParamMapping = () => {
  if (!selectedNode.value.triggerParamMapping) {
    selectedNode.value.triggerParamMapping = []
  }
  selectedNode.value.triggerParamMapping.push({
    paramName: '',
    eventField: ''
  })
  emitNodeChange()
}

// 删除触发参数映射
const removeTriggerParamMapping = (index) => {
  selectedNode.value.triggerParamMapping.splice(index, 1)
  emitNodeChange()
}

// 流程配置相关函数
const onProcessTriggerChange = () => {
  if (processTriggerConfig.value.triggerType === 'event') {
    if (!processTriggerConfig.value.triggerParamMapping) {
      processTriggerConfig.value.triggerParamMapping = []
    }
  }
  if (processTriggerConfig.value.triggerType === 'schedule') {
    // 若未填写Cron，使用快捷配置生成一个默认值
    if (!processTriggerConfig.value.triggerCron) {
      applyScheduleQuickCron()
    }
  }
}

const onTriggerEventChange = () => {
  onProcessConfigChange()
}

const onProcessConfigChange = () => {
  // 配置变更时自动保存到流程数据
  saveProcessConfigToData()
}

const saveProcessConfigToData = () => {
  // 将流程配置保存到流程数据中（可以保存到processInfo或单独的配置对象）
  // TODO: 保存到后端
  
  // 临时保存到本地存储
  const configKey = `engine_process_config_${businessInfo.value.id}_${processInfo.value.id || 'new'}`
  const config = {
    trigger: { ...processTriggerConfig.value }
  }
  localStorage.setItem(configKey, JSON.stringify(config))
}

const saveProcessConfig = () => {
  // 验证配置
  if (processTriggerConfig.value.triggerType === 'event' && !processTriggerConfig.value.triggerEventCode) {
    ElMessage.warning('请选择触发事件')
    return
  }
  if (processTriggerConfig.value.triggerType === 'schedule' && !processTriggerConfig.value.triggerCron) {
    ElMessage.warning('请填写Cron表达式')
    return
  }
  
  saveProcessConfigToData()
  ElMessage.success('事件配置已保存')
  showProcessConfig.value = false
}

const addProcessTriggerParamMapping = () => {
  if (!processTriggerConfig.value.triggerParamMapping) {
    processTriggerConfig.value.triggerParamMapping = []
  }
  processTriggerConfig.value.triggerParamMapping.push({
    paramName: '',
    eventField: '',
    defaultValue: ''
  })
}

const removeProcessTriggerParamMapping = (index) => {
  processTriggerConfig.value.triggerParamMapping.splice(index, 1)
}

// 获取开始节点的输入参数
const getStartNodeInputParams = () => {
  const startNode = nodes.value.find(n => n.type === 'start')
  return startNode?.inputParams || []
}

// 获取选中事件的数据字段
const getSelectedEventDataFields = () => {
  if (!processTriggerConfig.value.triggerEventCode) {
    return []
  }
  const selectedEvent = events.value.find(e => e.code === processTriggerConfig.value.triggerEventCode)
  return selectedEvent?.dataFields || []
}

// 打开事件管理页面
const openEventManager = () => {
  router.push({ name: 'engine-event' })
}

// 跳转到流程节点配置页面（新标签页打开）
const goToProcessNodeConfig = () => {
  // 检查流程信息是否存在
  if (!processInfo.value || !processInfo.value.id) {
    ElMessage.warning('流程信息不完整，无法跳转到权限配置页面')
    return
  }
  
  // 在新标签页打开业务流程管理页面，并传递流程信息
  // 路由名称是 'process'
  try {
    const routeData = router.resolve({
      name: 'process',
      query: {
        processId: processInfo.value.id,
        processCode: processInfo.value.code || '',
        nodeId: selectedNode.value.id,
        nodeName: selectedNode.value.label
      }
    })
    window.open(routeData.href, '_blank')
  } catch (error) {
    console.error('跳转失败:', error)
    ElMessage.error('跳转失败，请检查路由配置')
  }
}

// 权限配置相关
const activeProductConfigId = ref('')
const activeApiTabs = ref({})
const permissionTreeCache = ref({}) // 权限树缓存，防止树收缩
const permissionTreeRefs = ref([]) // 权限树引用数组

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

// 根据产品端口获取权限列表
const getPermissionsByPort = (productPort) => {
  if (!productPort) return []
  return allPermissions.filter(p => p.productPort === productPort)
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

// 添加产品端配置
const addProductConfig = () => {
  if (!selectedNode.value.productConfigs) {
    selectedNode.value.productConfigs = []
  }
  const newConfig = {
    id: `product-config-${Date.now()}`,
    productPort: '',
    permissionIds: [],
    permissions: [],
    buttonPermissions: [],
    apiPermissions: [],
    apiConfigs: {},
    expandedKeys: []
  }
  selectedNode.value.productConfigs.push(newConfig)
  activeProductConfigId.value = newConfig.id
  activeApiTabs.value[newConfig.id] = undefined
  // 初始化权限树缓存
  permissionTreeCache.value[newConfig.id] = []
  emitNodeChange()
}

// 删除产品端配置
const removeProductConfig = (index) => {
  const config = selectedNode.value.productConfigs[index]
  if (config) {
    delete activeApiTabs.value[config.id]
  }
  selectedNode.value.productConfigs.splice(index, 1)
  if (selectedNode.value.productConfigs.length > 0) {
    activeProductConfigId.value = selectedNode.value.productConfigs[0].id
  } else {
    activeProductConfigId.value = ''
  }
  emitNodeChange()
}

// 设置权限树引用
const setPermissionTreeRef = (el, index) => {
  if (el) {
    permissionTreeRefs.value[index] = el
  }
}

// 产品端口变化
const handleProductPortChange = (productConfig) => {
  // 防止重复产品端
  if (productConfig.productPort) {
    const duplicated = (selectedNode.value.productConfigs || []).some(
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
  if (!productConfig.expandedKeys) {
    productConfig.expandedKeys = []
  }
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
  
  emitNodeChange()
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
  const index = (selectedNode.value.productConfigs || []).indexOf(productConfig)
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
                enabled: true // 默认为启用状态
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
        conditionMode: 'strategy', // 默认数据策略模式
        dataRuleId: null
      }
    }
  })
  
  emitNodeChange()
}

// 获取产品端配置中的API权限
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

// 数据域和数据对象定义（与ProcessNodeConfiguration.vue保持一致）
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

// 模拟表字段数据（用于数据条件配置）
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
  ],
  customers: [
    { label: '客户ID', value: 'id', type: 'string' },
    { label: '姓名', value: 'name', type: 'string' },
    { label: '电话', value: 'phone', type: 'string' },
    { label: '邮箱', value: 'email', type: 'string' },
    { label: '地址', value: 'address', type: 'string' },
    { label: 'VIP等级', value: 'vipLevel', type: 'string' },
    { label: '创建时间', value: 'createTime', type: 'datetime' }
  ],
  products: [
    { label: '产品ID', value: 'id', type: 'string' },
    { label: '产品名称', value: 'name', type: 'string' },
    { label: '价格', value: 'price', type: 'number' },
    { label: '分类', value: 'category', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '描述', value: 'description', type: 'string' }
  ],
  payments: [
    { label: '支付ID', value: 'id', type: 'string' },
    { label: '订单ID', value: 'orderId', type: 'string' },
    { label: '金额', value: 'amount', type: 'number' },
    { label: '支付方式', value: 'paymentMethod', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '支付时间', value: 'payTime', type: 'datetime' }
  ],
  refunds: [
    { label: '退款ID', value: 'id', type: 'string' },
    { label: '订单ID', value: 'orderId', type: 'string' },
    { label: '金额', value: 'amount', type: 'number' },
    { label: '原因', value: 'reason', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '退款时间', value: 'refundTime', type: 'datetime' }
  ],
  coupons: [
    { label: '优惠券ID', value: 'id', type: 'string' },
    { label: '名称', value: 'name', type: 'string' },
    { label: '金额', value: 'amount', type: 'number' },
    { label: '类型', value: 'type', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '过期时间', value: 'expireTime', type: 'datetime' },
    { label: '使用时间', value: 'useTime', type: 'datetime' }
  ],
  coupon_campaigns: [
    { label: '活动ID', value: 'id', type: 'string' },
    { label: '名称', value: 'name', type: 'string' },
    { label: '描述', value: 'description', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '开始时间', value: 'startTime', type: 'datetime' },
    { label: '结束时间', value: 'endTime', type: 'datetime' }
  ],
  services: [
    { label: '服务ID', value: 'id', type: 'string' },
    { label: '服务名称', value: 'name', type: 'string' },
    { label: '类型', value: 'type', type: 'string' },
    { label: '时长', value: 'duration', type: 'number' },
    { label: '价格', value: 'price', type: 'number' },
    { label: '状态', value: 'status', type: 'string' }
  ],
  service_providers: [
    { label: '提供者ID', value: 'id', type: 'string' },
    { label: '名称', value: 'name', type: 'string' },
    { label: '电话', value: 'phone', type: 'string' },
    { label: '等级', value: 'level', type: 'string' },
    { label: '评分', value: 'rating', type: 'number' },
    { label: '状态', value: 'status', type: 'string' }
  ],
  service_feedback: [
    { label: '反馈ID', value: 'id', type: 'string' },
    { label: '订单ID', value: 'orderId', type: 'string' },
    { label: '评分', value: 'rating', type: 'number' },
    { label: '评论', value: 'comment', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '创建时间', value: 'createTime', type: 'datetime' }
  ],
  courses: [
    { label: '课程ID', value: 'id', type: 'string' },
    { label: '课程名称', value: 'name', type: 'string' },
    { label: '描述', value: 'description', type: 'string' },
    { label: '分类', value: 'category', type: 'string' },
    { label: '时长', value: 'duration', type: 'number' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '创建时间', value: 'createTime', type: 'datetime' }
  ],
  course_enrollments: [
    { label: '报名ID', value: 'id', type: 'string' },
    { label: '用户ID', value: 'userId', type: 'string' },
    { label: '课程ID', value: 'courseId', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '报名时间', value: 'enrollTime', type: 'datetime' }
  ],
  learning_progress: [
    { label: '进度ID', value: 'id', type: 'string' },
    { label: '用户ID', value: 'userId', type: 'string' },
    { label: '课程ID', value: 'courseId', type: 'string' },
    { label: '进度', value: 'progress', type: 'number' },
    { label: '最后学习时间', value: 'lastStudyTime', type: 'datetime' },
    { label: '状态', value: 'status', type: 'string' }
  ],
  learning_records: [
    { label: '记录ID', value: 'id', type: 'string' },
    { label: '用户ID', value: 'userId', type: 'string' },
    { label: '课程ID', value: 'courseId', type: 'string' },
    { label: '操作', value: 'action', type: 'string' },
    { label: '时长', value: 'duration', type: 'number' },
    { label: '创建时间', value: 'createTime', type: 'datetime' }
  ],
  exams: [
    { label: '考试ID', value: 'id', type: 'string' },
    { label: '考试名称', value: 'name', type: 'string' },
    { label: '描述', value: 'description', type: 'string' },
    { label: '分类', value: 'category', type: 'string' },
    { label: '时长', value: 'duration', type: 'number' },
    { label: '及格分数', value: 'passScore', type: 'number' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '创建时间', value: 'createTime', type: 'datetime' }
  ],
  exam_enrollments: [
    { label: '报名ID', value: 'id', type: 'string' },
    { label: '用户ID', value: 'userId', type: 'string' },
    { label: '考试ID', value: 'examId', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '报名时间', value: 'enrollTime', type: 'datetime' }
  ],
  exam_answers: [
    { label: '答案ID', value: 'id', type: 'string' },
    { label: '用户ID', value: 'userId', type: 'string' },
    { label: '考试ID', value: 'examId', type: 'string' },
    { label: '题目ID', value: 'questionId', type: 'string' },
    { label: '答案', value: 'answer', type: 'string' },
    { label: '提交时间', value: 'submitTime', type: 'datetime' }
  ],
  exam_scores: [
    { label: '成绩ID', value: 'id', type: 'string' },
    { label: '用户ID', value: 'userId', type: 'string' },
    { label: '考试ID', value: 'examId', type: 'string' },
    { label: '分数', value: 'score', type: 'number' },
    { label: '通过状态', value: 'passStatus', type: 'string' },
    { label: '考试时间', value: 'examTime', type: 'datetime' }
  ],
  certificates: [
    { label: '证书ID', value: 'id', type: 'string' },
    { label: '用户ID', value: 'userId', type: 'string' },
    { label: '考试ID', value: 'examId', type: 'string' },
    { label: '证书编号', value: 'certificateNo', type: 'string' },
    { label: '颁发日期', value: 'issueDate', type: 'date' },
    { label: '过期日期', value: 'expireDate', type: 'date' },
    { label: '状态', value: 'status', type: 'string' }
  ],
  skill_assessments: [
    { label: '评估ID', value: 'id', type: 'string' },
    { label: '用户ID', value: 'userId', type: 'string' },
    { label: '技能类型', value: 'skillType', type: 'string' },
    { label: '分数', value: 'score', type: 'number' },
    { label: '等级', value: 'level', type: 'string' },
    { label: '评估时间', value: 'assessTime', type: 'datetime' }
  ],
  skill_plans: [
    { label: '计划ID', value: 'id', type: 'string' },
    { label: '用户ID', value: 'userId', type: 'string' },
    { label: '技能类型', value: 'skillType', type: 'string' },
    { label: '目标等级', value: 'targetLevel', type: 'string' },
    { label: '计划内容', value: 'planContent', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '创建时间', value: 'createTime', type: 'datetime' }
  ],
  skill_certifications: [
    { label: '认证ID', value: 'id', type: 'string' },
    { label: '用户ID', value: 'userId', type: 'string' },
    { label: '技能类型', value: 'skillType', type: 'string' },
    { label: '证书编号', value: 'certificateNo', type: 'string' },
    { label: '等级', value: 'level', type: 'string' },
    { label: '颁发日期', value: 'issueDate', type: 'date' },
    { label: '状态', value: 'status', type: 'string' }
  ],
  certificate_renewals: [
    { label: '续期ID', value: 'id', type: 'string' },
    { label: '用户ID', value: 'userId', type: 'string' },
    { label: '证书ID', value: 'certificateId', type: 'string' },
    { label: '申请时间', value: 'applyTime', type: 'datetime' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '审核时间', value: 'reviewTime', type: 'datetime' },
    { label: '新过期日期', value: 'newExpireDate', type: 'date' }
  ]
}

// 根据表获取可用属性列表
const getFieldsByTableForRules = (table) => {
  if (!table) {
    return []
  }
  return tableFieldsForRules[table] || []
}

// 获取API的数据模型配置
const getApiModel = (apiId, configId) => {
  const productConfig = (selectedNode.value.productConfigs || []).find(c => c.id === configId)
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
              // 为每个数据对象初始化条件（对象级：带 mode 和 dataRuleId）
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

// 检查是否有启用的数据对象条件（暂保留，供其他地方使用）
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
  emitNodeChange()
}

// 为指定数据对象添加条件（对象级）
const addObjectCondition = (apiId, configId, objectId) => {
  const apiConfig = getApiModel(apiId, configId)
  if (apiConfig && apiConfig.objectConditions[objectId]) {
    if (!apiConfig.objectConditions[objectId].conditions) {
      apiConfig.objectConditions[objectId].conditions = []
    }
    const conditions = apiConfig.objectConditions[objectId].conditions
    const newCondition = {
      attribute: '',
      operator: 'eq',
      value: '',
      relation: conditions.length > 0 ? 'AND' : undefined
    }
    conditions.push(newCondition)
  }
  emitNodeChange()
}

// 移除指定数据对象的条件
const removeObjectCondition = (apiId, configId, objectId, index) => {
  const apiConfig = getApiModel(apiId, configId)
  if (apiConfig && apiConfig.objectConditions[objectId] && apiConfig.objectConditions[objectId].conditions) {
    apiConfig.objectConditions[objectId].conditions.splice(index, 1)
  }
  emitNodeChange()
}

// 模拟表字段数据（用于列权限配置，初始仍以 permission 枚举表示，将在运行时转换为 visible/mask/editable 三组配置）
const tableFields = {
  candidates: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'phone', fieldType: 'string', permission: 'MASKED' },
    { fieldName: 'email', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'experience', fieldType: 'number', permission: 'READONLY' },
    { fieldName: 'education', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'position', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' }
  ],
  resumes: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'candidateId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'fileName', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'fileUrl', fieldType: 'string', permission: 'HIDDEN' },
    { fieldName: 'uploadTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  interviews: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'candidateId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'interviewTime', fieldType: 'datetime', permission: 'EDITABLE' },
    { fieldName: 'interviewerId', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'result', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'score', fieldType: 'number', permission: 'EDITABLE' },
    { fieldName: 'comment', fieldType: 'string', permission: 'EDITABLE' }
  ],
  offers: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'candidateId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'position', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'salary', fieldType: 'number', permission: 'EDITABLE' },
    { fieldName: 'startDate', fieldType: 'date', permission: 'EDITABLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' }
  ],
  employees: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'position', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'department', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'hireDate', fieldType: 'date', permission: 'READONLY' },
    { fieldName: 'salary', fieldType: 'number', permission: 'HIDDEN' }
  ],
  orders: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'customerId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'amount', fieldType: 'number', permission: 'READONLY' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'createTime', fieldType: 'datetime', permission: 'READONLY' },
    { fieldName: 'storeId', fieldType: 'string', permission: 'VISIBLE' }
  ],
  users: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'username', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'departmentId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'organizationId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'role', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'email', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'phone', fieldType: 'string', permission: 'MASKED' }
  ],
  roles: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'description', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'createTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  permissions: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'code', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'type', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'description', fieldType: 'string', permission: 'VISIBLE' }
  ],
  customers: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'phone', fieldType: 'string', permission: 'MASKED' },
    { fieldName: 'email', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'address', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'vipLevel', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'createTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  products: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'price', fieldType: 'number', permission: 'VISIBLE' },
    { fieldName: 'category', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'description', fieldType: 'string', permission: 'VISIBLE' }
  ],
  payments: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'orderId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'amount', fieldType: 'number', permission: 'READONLY' },
    { fieldName: 'paymentMethod', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'payTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  refunds: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'orderId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'amount', fieldType: 'number', permission: 'READONLY' },
    { fieldName: 'reason', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'refundTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  coupons: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'amount', fieldType: 'number', permission: 'VISIBLE' },
    { fieldName: 'type', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'expireTime', fieldType: 'datetime', permission: 'VISIBLE' },
    { fieldName: 'useTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  coupon_campaigns: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'description', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'startTime', fieldType: 'datetime', permission: 'VISIBLE' },
    { fieldName: 'endTime', fieldType: 'datetime', permission: 'VISIBLE' }
  ],
  services: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'type', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'duration', fieldType: 'number', permission: 'VISIBLE' },
    { fieldName: 'price', fieldType: 'number', permission: 'VISIBLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' }
  ],
  service_providers: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'phone', fieldType: 'string', permission: 'MASKED' },
    { fieldName: 'level', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'rating', fieldType: 'number', permission: 'READONLY' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' }
  ],
  service_feedback: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'orderId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'rating', fieldType: 'number', permission: 'READONLY' },
    { fieldName: 'comment', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'createTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  courses: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'description', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'category', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'duration', fieldType: 'number', permission: 'VISIBLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'createTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  course_enrollments: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'userId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'courseId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'enrollTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  learning_progress: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'userId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'courseId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'progress', fieldType: 'number', permission: 'EDITABLE' },
    { fieldName: 'lastStudyTime', fieldType: 'datetime', permission: 'READONLY' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' }
  ],
  learning_records: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'userId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'courseId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldType: 'action', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'duration', fieldType: 'number', permission: 'READONLY' },
    { fieldName: 'createTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  exams: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'name', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'description', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'category', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'duration', fieldType: 'number', permission: 'VISIBLE' },
    { fieldName: 'passScore', fieldType: 'number', permission: 'VISIBLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'createTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  exam_enrollments: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'userId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'examId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'enrollTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  exam_answers: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'userId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'examId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'questionId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'answer', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'submitTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  exam_scores: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'userId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'examId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'score', fieldType: 'number', permission: 'READONLY' },
    { fieldName: 'passStatus', fieldType: 'string', permission: 'READONLY' },
    { fieldName: 'examTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  certificates: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'userId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'examId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'certificateNo', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'issueDate', fieldType: 'date', permission: 'READONLY' },
    { fieldName: 'expireDate', fieldType: 'date', permission: 'VISIBLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' }
  ],
  skill_assessments: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'userId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'skillType', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'score', fieldType: 'number', permission: 'READONLY' },
    { fieldName: 'level', fieldType: 'string', permission: 'READONLY' },
    { fieldName: 'assessTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  skill_plans: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'userId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'skillType', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'targetLevel', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'planContent', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'createTime', fieldType: 'datetime', permission: 'READONLY' }
  ],
  skill_certifications: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'userId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'skillType', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'certificateNo', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'level', fieldType: 'string', permission: 'READONLY' },
    { fieldName: 'issueDate', fieldType: 'date', permission: 'READONLY' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' }
  ],
  certificate_renewals: [
    { fieldName: 'id', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'userId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'certificateId', fieldType: 'string', permission: 'VISIBLE' },
    { fieldName: 'applyTime', fieldType: 'datetime', permission: 'READONLY' },
    { fieldName: 'status', fieldType: 'string', permission: 'EDITABLE' },
    { fieldName: 'reviewTime', fieldType: 'datetime', permission: 'READONLY' },
    { fieldName: 'newExpireDate', fieldType: 'date', permission: 'VISIBLE' }
  ]
}

// 根据数据对象获取列配置
const getApiColumnsByObject = (apiId, configId, objectId, table) => {
  const productConfig = (selectedNode.value.productConfigs || []).find(c => c.id === configId)
  if (productConfig && productConfig.apiConfigs && productConfig.apiConfigs[apiId]) {
    const apiConfig = productConfig.apiConfigs[apiId]
    
    // 确保objectColumns存在
    if (!apiConfig.objectColumns) {
      apiConfig.objectColumns = {}
    }
    
    // 如果该对象已有列配置，做一次兼容转换（permission -> visible/mask/editable），然后直接返回
    if (apiConfig.objectColumns[objectId] && apiConfig.objectColumns[objectId].length > 0) {
      const cols = apiConfig.objectColumns[objectId]
      if (cols.length > 0 && typeof cols[0].visible === 'undefined') {
        apiConfig.objectColumns[objectId] = cols.map(col => {
          const perm = col.permission || 'VISIBLE'
          // 映射规则：
          // - HIDDEN: 不可见
          // - MASKED: 可见+脱敏
          // - EDITABLE: 可见+可编辑
          // - READONLY/VISIBLE: 可见+只读
          const visible = perm !== 'HIDDEN'
          const mask = perm === 'MASKED'
          const editable = perm === 'EDITABLE'
          return {
            ...col,
            visible,
            mask,
            editable
          }
        })
      }
      return apiConfig.objectColumns[objectId]
    }
    
    // 初始化该对象的列配置（从模拟表字段数据中克隆，并将 permission 转为 visible/mask/editable）
    if (table && tableFields[table]) {
      const raw = JSON.parse(JSON.stringify(tableFields[table]))
      apiConfig.objectColumns[objectId] = raw.map(col => {
        const perm = col.permission || 'VISIBLE'
        const visible = perm !== 'HIDDEN'
        const mask = perm === 'MASKED'
        const editable = perm === 'EDITABLE'
        return {
          ...col,
          visible,
          mask,
          editable
        }
      })
      return apiConfig.objectColumns[objectId]
    } else {
      // 如果表字段数据不存在，返回空数组
      apiConfig.objectColumns[objectId] = []
      return []
    }
  }
  return []
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

// 获取可用的数据策略列表（根据当前接口的数据域和数据对象过滤）
// 获取可用的数据规则（支持对象级）
const getAvailableDataRules = (apiId, configId, objectId) => {
  const apiConfig = getApiModel(apiId, configId)
  if (!apiConfig || !apiConfig.domainObjects || apiConfig.domainObjects.length === 0) {
    return []
  }

  // 对象级：严格按对象ID过滤
  if (objectId) {
    return dataRules.filter(rule => rule.objectId === objectId)
  }

  // 兼容：按API级别过滤（保留以防其他地方调用）
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

  // 兼容：旧的API级别应用（目前界面已不再使用，但保留逻辑）
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

// 获取已选择的数据策略名称（支持对象级）
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
    eq: '等于',
    ne: '不等于',
    gt: '大于',
    lt: '小于',
    gte: '大于等于',
    lte: '小于等于',
    in: '包含',
    nin: '不包含',
    null: '为空',
    notnull: '不为空'
  }
  return operatorMap[operator] || operator
}

// 选中的消息模板
const selectedMessageTemplate = computed(() => {
  if (!selectedNode.value || !selectedNode.value.messageTemplateId) return null
  return messageTemplates.value.find(t => t.id === selectedNode.value.messageTemplateId)
})

// 消息模板变化
const onMessageTemplateChange = () => {
  const template = selectedMessageTemplate.value
  if (template && template.usedParameters) {
    // 初始化消息参数配置
    selectedNode.value.messageParams = template.usedParameters.map(paramName => ({
      paramName: paramName,
      source: ''
    }))
    // 保存模板编码
    selectedNode.value.messageTemplateCode = template.templateCode
  }
  emitNodeChange()
}

// 消息节点：获取固定的输出结果
const getMessageOutputResults = () => {
  return [
    {
      name: 'messageId',
      type: 'string',
      description: '消息ID，消息发送后返回的唯一标识'
    },
    {
      name: 'status',
      type: 'string',
      description: '发送状态，如：success、failed等'
    },
    {
      name: 'result',
      type: 'object',
      description: '发送结果，包含详细的发送信息'
    }
  ]
}

// API调用节点：请求头管理
const addApiHeader = () => {
  if (!selectedNode.value.apiHeaders) {
    selectedNode.value.apiHeaders = []
  }
  selectedNode.value.apiHeaders.push({
    name: '',
    source: ''
  })
  emitNodeChange()
}

const removeApiHeader = (index) => {
  selectedNode.value.apiHeaders.splice(index, 1)
  emitNodeChange()
}

// API调用节点：URL参数管理
const addApiParam = () => {
  if (!selectedNode.value.apiParams) {
    selectedNode.value.apiParams = []
  }
  selectedNode.value.apiParams.push({
    name: '',
    source: ''
  })
  emitNodeChange()
}

const removeApiParam = (index) => {
  selectedNode.value.apiParams.splice(index, 1)
  emitNodeChange()
}

// API调用节点：获取固定的输出结果
const getApiOutputResults = () => {
  return [
    {
      name: 'statusCode',
      type: 'number',
      description: 'HTTP状态码，如：200、404、500等'
    },
    {
      name: 'headers',
      type: 'object',
      description: '响应头对象，包含所有响应头信息'
    },
    {
      name: 'body',
      type: 'object',
      description: '响应数据，API返回的JSON数据'
    },
    {
      name: 'message',
      type: 'string',
      description: '错误信息，如果请求失败则包含错误描述'
    }
  ]
}

// API调用节点：请求体参数管理
const addApiBodyParam = () => {
  if (!selectedNode.value.apiBodyParams) {
    selectedNode.value.apiBodyParams = []
  }
  selectedNode.value.apiBodyParams.push({
    name: '',
    source: ''
  })
  emitNodeChange()
}

const removeApiBodyParam = (index) => {
  selectedNode.value.apiBodyParams.splice(index, 1)
  emitNodeChange()
}


const emitNodeChange = () => {
  // 触发节点变更
}

// 历史记录
const saveHistory = () => {
  const state = {
    nodes: JSON.parse(JSON.stringify(nodes.value)),
    edges: JSON.parse(JSON.stringify(edges.value))
  }
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(state)
  historyIndex.value = history.value.length - 1
  if (history.value.length > 50) {
    history.value.shift()
    historyIndex.value--
  }
}

const undo = () => {
  if (canUndo.value) {
    historyIndex.value--
    const state = history.value[historyIndex.value]
    nodes.value = JSON.parse(JSON.stringify(state.nodes))
    edges.value = JSON.parse(JSON.stringify(state.edges))
  }
}

const redo = () => {
  if (canRedo.value) {
    historyIndex.value++
    const state = history.value[historyIndex.value]
    nodes.value = JSON.parse(JSON.stringify(state.nodes))
    edges.value = JSON.parse(JSON.stringify(state.edges))
  }
}

const reset = () => {
  ElMessageBox.confirm('确定要重置画布吗？所有内容将被清空', '提示', {
    type: 'warning',
    confirmButtonText: '重置',
    cancelButtonText: '取消'
  }).then(() => {
    nodes.value = []
    edges.value = []
    selectedNodeId.value = null
    saveHistory()
  }).catch(() => {})
}

// 工具栏操作
const goBack = () => {
  router.push({ name: 'engine-business' })
}

const handleSave = () => {
  const data = {
    businessId: businessInfo.value.id,
    processId: processInfo.value.id,
    nodes: nodes.value,
    edges: edges.value
  }
  const key = `engine_process_draft_${businessInfo.value.id}_${processInfo.value.id || 'new'}`
  localStorage.setItem(key, JSON.stringify(data))
  ElMessage.success('草稿已保存')
}

const loadDraft = () => {
  const key = `engine_process_draft_${businessInfo.value.id}_${processInfo.value.id || 'new'}`
  const data = localStorage.getItem(key)
  if (data) {
    try {
      const parsed = JSON.parse(data)
      nodes.value = parsed.nodes || []
      edges.value = parsed.edges || []
      saveHistory()
      ElMessage.success('草稿已加载')
    } catch (e) {
      ElMessage.error('加载草稿失败')
    }
  } else {
    ElMessage.info('没有找到草稿')
  }
}

const exportJson = () => {
  const data = {
    nodes: nodes.value,
    edges: edges.value
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `engine_process_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

const validateProcess = () => {
  const startNodes = nodes.value.filter(n => n.type === 'start')
  const endNodes = nodes.value.filter(n => n.type === 'end')
  
  if (startNodes.length === 0) {
    ElMessage.warning('流程缺少开始节点')
    return
  }
  if (startNodes.length > 1) {
    ElMessage.warning('流程只能有一个开始节点')
    return
  }
  if (endNodes.length === 0) {
    ElMessage.warning('流程缺少结束节点')
    return
  }
  
  ElMessage.success('流程校验通过')
}

const handlePublish = () => {
  validateProcess()
  ElMessageBox.confirm('确定要发布该流程吗？', '提示', {
    type: 'warning',
    confirmButtonText: '发布',
    cancelButtonText: '取消'
  }).then(() => {
    // TODO: 调用API发布
    ElMessage.success('发布成功')
  }).catch(() => {})
}

// 加载业务和流程信息
const loadBusinessAndProcess = () => {
  const businessId = route.query.businessId
  const businessCode = route.query.businessCode
  const processId = route.query.processId
  const processCode = route.query.processCode

  if (businessId || businessCode) {
    // TODO: 从API加载业务信息
    businessInfo.value = {
      id: businessId || 1,
      code: businessCode || 'order_process',
      name: '订单处理业务' // TODO: 从API获取
    }
  }

  if (processId && processId !== 'new') {
    // TODO: 从API加载流程信息
    processInfo.value = {
      id: processId,
      code: processCode || 'order_create_flow',
      name: '订单创建流程', // TODO: 从API获取
      version: '1.0.0'
    }
    
    // 加载流程定义
    loadProcessDefinition()
  } else {
    processInfo.value = {
      id: null,
      code: processCode || '',
      name: '新流程',
      version: '1.0.0'
    }
  }
}

// 加载流程定义
const loadProcessDefinition = () => {
  // TODO: 从API加载流程定义（节点和连线）
  // 示例：
  // const definition = await api.getProcessDefinition(processInfo.value.id)
  // nodes.value = definition.nodes || []
  // edges.value = definition.edges || []
  
  // 加载流程配置（触发配置等）
  // const config = await api.getProcessConfig(processInfo.value.id)
  // if (config && config.trigger) {
  //   processTriggerConfig.value = { ...config.trigger }
  // }
  
  // 从本地存储加载流程配置（临时方案）
  const configKey = `engine_process_config_${businessInfo.value.id}_${processInfo.value.id || 'new'}`
  const savedConfig = localStorage.getItem(configKey)
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig)
      if (config.trigger) {
        processTriggerConfig.value = { ...config.trigger }
      }
    } catch (e) {
      console.error('加载流程配置失败', e)
    }
  }
}

// 事件数据映射
const addEventDataMapping = () => {
  ensureProduceEventDataArray()
  selectedNode.value.produceEventData.push({
    eventField: '',
    nodeParam: ''
  })
  emitNodeChange()
}

const removeEventDataMapping = (index) => {
  selectedNode.value.produceEventData.splice(index, 1)
  emitNodeChange()
}

// 品牌角色加载占位（身份面板已移除）
const loadBrandRoles = async () => []

// 品牌变化（身份面板已移除）
const onBrandChange = () => {}

onMounted(() => {
  // 加载业务和流程信息
  loadBusinessAndProcess()
  
  // 加载消息模板
  loadMessageTemplates()
  
  // 加载事件列表
  loadEvents()
  
  // 初始化拖拽事件
  const paletteItems = document.querySelectorAll('.palette-item')
  paletteItems.forEach((item, index) => {
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('nodeType', palette.value[index].type)
    })
  })
  
  saveHistory()
})
</script>

<style scoped>
.page-wrapper {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-breadcrumb {
  margin-bottom: 8px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.designer-body {
  display: flex;
  flex: 1;
  gap: 20px;
  overflow: hidden;
}

.left-panel {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.right-panel {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.right-panel.collapsed {
  width: 48px !important;
}

.panel-toggle {
  position: absolute;
  top: 50%;
  right: -16px;
  transform: translateY(-50%);
  z-index: 2;
  width: 36px;
  height: 64px;
  border-radius: 0 18px 18px 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-left: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 2px 0 6px rgba(0,0,0,0.08);
}

.panel-toggle:hover {
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.panel-toggle :deep(.el-icon) {
  font-size: 16px;
}

.trigger-hint {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  pointer-events: none;
}

.trigger-card {
  pointer-events: auto;
  background: #fff;
  border: 1px solid #e4e7ed;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-radius: 8px;
  padding: 12px 14px;
  min-width: 240px;
}

.trigger-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.trigger-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.trigger-card__icon {
  color: #409eff;
  font-size: 16px;
}

.trigger-card__summary {
  font-size: 13px;
  color: #606266;
}

.trigger-card__desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.cron-quick {
  margin: 12px 0 16px;
  padding: 12px;
  background: #f9fafc;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
}

.cron-quick__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #303133;
}

.cron-quick__modes {
  margin-bottom: 10px;
}

.cron-quick__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cron-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
}

.cron-row .label {
  color: #606266;
}

.right-panel .panel-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.right-panel .form-body {
  flex: 1;
  overflow-y: auto;
}

.panel-card {
  flex-shrink: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.palette {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: move;
  user-select: none;
}

.palette-item:hover {
  background-color: #f5f7fa;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.form-body {
  max-height: 600px;
  overflow-y: auto;
}

.empty-tip {
  padding: 40px;
  text-align: center;
  color: #909399;
}

.config-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
}

.tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.permission-tree {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
  background: #fff;
}

.permission-node {
  font-size: 13px;
}

.xy {
  display: flex;
  gap: 8px;
}

.canvas-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.canvas-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-bottom: 1px solid #dcdfe6;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-label {
  font-size: 12px;
  color: #606266;
  margin-right: 8px;
}

.canvas {
  flex: 1;
  position: relative;
  overflow: auto;
  background-image: 
    linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

.edges-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: all;
}

.canvas-node {
  position: absolute;
  width: 120px;
  min-height: 48px;
  background: white;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: move;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.canvas-node.active {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
}

.node-type {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.node-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.node-label {
  flex: 1;
  font-size: 14px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.condition-node {
  border-style: dashed;
}

.branch-count {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  text-align: center;
}

.edge-line {
  cursor: pointer;
}

.edge-line:hover {
  stroke-width: 3;
}

.edge-label {
  pointer-events: none;
}

.edge-selected {
  stroke-width: 3;
  stroke: #67c23a;
}

.preview-line {
  pointer-events: none;
}

/* 条件构建器样式 */
.condition-builder {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.condition-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.empty-condition {
  padding: 8px 0;
}

.condition-actions {
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.palette-tip {
  margin-top: 12px;
}
/* 权限配置弹窗样式 */
.permission-config-dialog-content {
  padding: 20px;
}

/* 产品端配置样式 */
.product-tabs {
  margin-top: 10px;
}

.product-tabs-compact :deep(.el-tabs__header) {
  margin-bottom: 10px;
}

.product-tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-tab-name {
  font-weight: 500;
}

.product-config-grid {
  align-items: flex-start;
}

.tight-item :deep(.el-form-item__content) {
  width: 100%;
}

.left-column {
  padding-right: 10px;
}

.permission-tree {
  max-height: 600px;
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

.permission-type-tag {
  font-size: 12px;
  color: #67c23a;
  font-weight: 500;
  margin: 0 5px;
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

.api-config-title h6 {
  margin: 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
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

.api-tabs.vertical-tabs {
  min-height: 500px;
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

.pnc-api-tab-method.method-get {
  background: #ecf5ff;
  color: #409eff;
}

.pnc-api-tab-method.method-post {
  background: #fef0f0;
  color: #f56c6c;
}

.pnc-api-tab-method.method-put {
  background: #fdf6ec;
  color: #e6a23c;
}

.pnc-api-tab-method.method-delete {
  background: #fef0f0;
  color: #f56c6c;
}

.pnc-api-tab-method.method-patch {
  background: #f3e5f5;
  color: #9c27b0;
}

.data-condition-wrapper {
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

.object-mode-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-condition-toolbar {
  margin-bottom: 10px;
}

.api-config-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9fafc;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.api-config-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.api-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.api-url-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-method-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #ecf5ff;
  color: var(--el-color-primary, #409eff);
  border: 1px solid var(--el-color-primary-light-7, #c6e2ff);
  font-weight: 600;
}

.api-url {
  font-size: 12px;
  color: #606266;
  background-color: #ecf5ff;
  padding: 2px 8px;
  border-radius: 3px;
}

.api-model-info {
  margin-top: 15px;
}

.domain-object-item {
  margin-bottom: 8px;
}

/* 数据条件配置区域样式 */
.data-condition-container {
  margin-top: 10px;
}

.no-model-tip {
  margin-top: 10px;
}

.condition-editor {
  min-height: 150px;
  background-color: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
}

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

.relation-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

/* 数据策略模式样式（与节点配置页保持一致） */
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
}

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

.object-conditions-content {
  margin-top: 15px;
}

.object-conditions-list {
  margin-top: 10px;
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

.condition-delete-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 4px;
}

.condition-delete-btn :deep(.el-button) {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.empty-conditions {
  padding: 20px;
  text-align: center;
  color: #909399;
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

.no-data {
  text-align: center;
  color: #909399;
  padding: 40px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.no-api-data {
  text-align: center;
  color: #909399;
  padding: 40px;
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

.field-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-type {
  font-size: 12px;
  color: #909399;
}

.two-col-layout {
  display: flex;
}

</style>


