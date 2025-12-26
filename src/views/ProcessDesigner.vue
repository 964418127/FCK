<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h2>可视化流程设计 v1</h2>
        <p class="subtitle">按优先级落地：画布/节点库/连线/缩放/撤销重做/迷你图</p>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="handleNew">新建流程</el-button>
        <el-button size="small" @click="openTemplateDialog">模板库</el-button>
        <el-button size="small" @click="loadDraft">加载草稿</el-button>
        <el-button size="small" @click="exportJson">导出JSON</el-button>
        <el-button size="small" @click="validateProcess">校验流程</el-button>
        <el-button size="small" @click="handleSave">保存草稿</el-button>
        <el-button size="small" type="primary" @click="handlePublish">发布</el-button>
      </div>
    </div>

    <div class="designer-body">
      <!-- 左侧：节点库 & 属性 -->
      <div class="side-panel">
        <el-card shadow="hover" class="panel-card">
          <div class="card-header">
            <div class="title-row">
              <el-icon><Collection /></el-icon>
              <span>节点库（拖拽到画布）</span>
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
        </el-card>

        <el-card shadow="hover" class="panel-card">
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
                  <!-- 开始节点：流程启动条件 -->
                  <template v-if="selectedNode.type === 'start'">
                    <el-form-item label="触发类型">
                      <el-select v-model="selectedNode.triggerType" placeholder="选择触发方式" @change="emitNodeChange">
                        <el-option label="手动触发" value="manual" />
                        <el-option label="自动触发" value="auto" />
                        <el-option label="事件触发" value="event" />
                        <el-option label="定时触发" value="schedule" />
                      </el-select>
                    </el-form-item>
                    <el-form-item v-if="selectedNode.triggerType === 'event'" label="事件编码">
                      <el-input v-model="selectedNode.triggerEvent" placeholder="如：user.registered" @change="emitNodeChange" />
                    </el-form-item>
                    <el-form-item v-if="selectedNode.triggerType === 'schedule'" label="Cron表达式">
                      <el-input v-model="selectedNode.triggerCron" placeholder="如：0 0 * * * *" @change="emitNodeChange" />
                    </el-form-item>
                    <el-form-item label="启动条件">
                      <el-input
                        v-model="selectedNode.triggerCondition"
                        type="textarea"
                        :rows="2"
                        placeholder="如：user.type == 'public_masseur'"
                        @change="emitNodeChange"
                      />
                      <div class="tip">满足条件时才能启动流程</div>
                    </el-form-item>
                  </template>
                  <!-- 结束节点：流程结束条件 -->
                  <template v-if="selectedNode.type === 'end'">
                    <el-form-item label="结束条件">
                      <el-input
                        v-model="selectedNode.endCondition"
                        type="textarea"
                        :rows="2"
                        placeholder="如：certStatus == 'certified'"
                        @change="emitNodeChange"
                      />
                      <div class="tip">满足条件时流程结束</div>
                    </el-form-item>
                  </template>
                  <el-form-item>
                    <el-button size="small" type="danger" @click="deleteNode(selectedNode.id)">删除节点</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              
              <el-tab-pane label="规则" name="rules">
                <div class="config-section">
                  <div class="section-header">
                    <span>执行规则</span>
                    <el-button size="small" text type="primary" @click="openRuleSelector">选择规则</el-button>
                  </div>
                  <el-tag
                    v-for="rule in selectedNode.rules || []"
                    :key="rule"
                    closable
                    @close="removeRule(rule)"
                    style="margin: 4px 4px 4px 0"
                  >
                    {{ rule }}
                  </el-tag>
                  <el-empty v-if="!selectedNode.rules || selectedNode.rules.length === 0" description="未绑定规则" :image-size="60" />
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="事件" name="events">
                <div class="config-section">
                  <div class="section-header">
                    <span>触发事件</span>
                    <el-button size="small" text type="primary" @click="openEventSelector">选择事件</el-button>
                  </div>
                  <el-timeline v-if="selectedNode.events && selectedNode.events.length > 0">
                    <el-timeline-item
                      v-for="(evt, idx) in selectedNode.events"
                      :key="idx"
                      :timestamp="evt.triggerCondition || '立即'"
                      size="small"
                    >
                      <el-tag>{{ evt.eventCode }}</el-tag>
                      <el-button size="small" text type="danger" @click="removeEvent(idx)">删除</el-button>
                    </el-timeline-item>
                  </el-timeline>
                  <el-empty v-else description="未配置事件" :image-size="60" />
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="消息" name="messages">
                <div class="config-section">
                  <div class="section-header">
                    <span>消息通知</span>
                    <el-button size="small" text type="primary" @click="openMessageSelector">选择模板</el-button>
                  </div>
                  <el-timeline v-if="selectedNode.messages && selectedNode.messages.length > 0">
                    <el-timeline-item
                      v-for="(msg, idx) in selectedNode.messages"
                      :key="idx"
                      :timestamp="msg.triggerCondition || '节点完成'"
                      size="small"
                    >
                      <el-tag>{{ msg.templateCode }}</el-tag>
                      <span class="msg-channels">
                        <el-tag v-for="ch in msg.channels" :key="ch" size="small" style="margin-left: 4px">{{ ch }}</el-tag>
                      </span>
                      <el-button size="small" text type="danger" @click="removeMessage(idx)">删除</el-button>
                    </el-timeline-item>
                  </el-timeline>
                  <el-empty v-else description="未配置消息" :image-size="60" />
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="同步" name="sync">
                <div class="config-section">
                  <div class="section-header">
                    <span>数据同步</span>
                    <el-button size="small" text type="primary" @click="openSyncSelector">选择配置</el-button>
                  </div>
                  <el-tag
                    v-for="sync in selectedNode.dataSync || []"
                    :key="sync"
                    closable
                    @close="removeSync(sync)"
                    style="margin: 4px 4px 4px 0"
                  >
                    {{ sync }}
                  </el-tag>
                  <el-empty v-if="!selectedNode.dataSync || selectedNode.dataSync.length === 0" description="未配置同步" :image-size="60" />
                </div>
              </el-tab-pane>
              
              <el-tab-pane v-if="selectedNode.type === 'task' || selectedNode.type === 'approval' || selectedNode.type === 'auto' || selectedNode.type === 'script'" label="执行配置" name="execution">
                <el-form label-width="100px" size="small">
                  <!-- 任务节点和审批节点的权限配置 -->
                  <template v-if="selectedNode.type === 'task' || selectedNode.type === 'approval'">
                    <el-form-item label="权限配置">
                      <el-select v-model="selectedNode.assigneeType" placeholder="处理人类型" @change="emitNodeChange">
                        <el-option label="用户" value="user" />
                        <el-option label="角色" value="role" />
                        <el-option label="部门" value="dept" />
                        <el-option label="流程变量" value="process_variable" />
                      </el-select>
                      <el-input
                        v-if="selectedNode.assigneeType"
                        v-model="selectedNode.assignee"
                        placeholder="处理人/角色/部门ID或变量名"
                        style="margin-top: 8px"
                        @change="emitNodeChange"
                      />
                    </el-form-item>
                    <!-- 审批节点：多人审批配置 -->
                    <template v-if="selectedNode.type === 'approval'">
                      <el-form-item label="审批模式">
                        <el-radio-group v-model="selectedNode.approvalMode" @change="emitNodeChange">
                          <el-radio label="single">单人审批</el-radio>
                          <el-radio label="multi">多人审批</el-radio>
                        </el-radio-group>
                      </el-form-item>
                      <template v-if="selectedNode.approvalMode === 'multi'">
                        <el-form-item label="审批策略">
                          <el-radio-group v-model="selectedNode.approvalStrategy" @change="emitNodeChange">
                            <el-radio label="all">会签（全部通过）</el-radio>
                            <el-radio label="any">或签（任一通过）</el-radio>
                            <el-radio label="majority">多数通过</el-radio>
                          </el-radio-group>
                        </el-form-item>
                        <el-form-item v-if="selectedNode.approvalStrategy === 'majority'" label="通过比例">
                          <el-input-number
                            v-model="selectedNode.approvalRatio"
                            :min="0.5"
                            :max="1"
                            :step="0.1"
                            :precision="1"
                            placeholder="如：0.6表示60%"
                            @change="emitNodeChange"
                          />
                        </el-form-item>
                        <el-form-item label="审批人列表">
                          <el-input
                            v-model="selectedNode.approvers"
                            type="textarea"
                            :rows="3"
                            placeholder="多个审批人ID，用逗号分隔，如：user1,user2,user3 或 role:approver"
                            @change="emitNodeChange"
                          />
                          <div class="tip">支持用户ID、角色、部门，多个用逗号分隔</div>
                        </el-form-item>
                      </template>
                    </template>
                  </template>
                  <!-- 自动节点不需要权限配置 -->
                  <el-alert
                    v-if="selectedNode.type === 'auto' || selectedNode.type === 'script' || selectedNode.type === 'message' || selectedNode.type === 'sync'"
                    type="info"
                    :closable="false"
                    style="margin-bottom: 12px"
                  >
                    <template #title>
                      <div>该节点类型为自动执行，无需配置处理人</div>
                    </template>
                  </el-alert>
                  <el-form-item label="超时设置">
                    <el-input-number v-model="selectedNode.timeout" :min="0" :step="60" placeholder="超时时间（秒）" @change="emitNodeChange" />
                    <div class="tip">0表示不设置超时</div>
                  </el-form-item>
                  <el-form-item label="超时动作">
                    <el-select v-model="selectedNode.timeoutAction" placeholder="超时后的动作" @change="emitNodeChange">
                      <el-option label="提醒处理人" value="remind_assignee" />
                      <el-option label="自动跳过" value="auto_skip" />
                      <el-option label="转交他人" value="transfer" />
                      <el-option label="终止流程" value="terminate" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="重试策略">
                    <el-input-number v-model="selectedNode.retryCount" :min="0" :max="10" placeholder="重试次数" @change="emitNodeChange" />
                    <el-input-number
                      v-if="selectedNode.retryCount > 0"
                      v-model="selectedNode.retryInterval"
                      :min="1"
                      :step="60"
                      placeholder="重试间隔（秒）"
                      style="margin-top: 8px"
                      @change="emitNodeChange"
                    />
                  </el-form-item>
                  <el-form-item label="异常处理">
                    <el-select v-model="selectedNode.exceptionHandler" placeholder="异常处理方式" @change="emitNodeChange">
                      <el-option label="忽略继续" value="ignore" />
                      <el-option label="重试" value="retry" />
                      <el-option label="回滚" value="rollback" />
                      <el-option label="终止流程" value="terminate" />
                      <el-option label="转人工处理" value="manual" />
                    </el-select>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              
              <el-tab-pane v-if="selectedNode.type === 'subflow'" label="子流程" name="subflow">
                <el-form label-width="100px" size="small">
                  <el-form-item label="子流程编码">
                    <el-select v-model="selectedNode.subflowCode" filterable placeholder="选择子流程" @change="emitNodeChange">
                      <el-option label="推拿师身份迁移流程" value="masseur_migration" />
                      <el-option label="订单处理流程" value="order_process" />
                      <el-option label="退款处理流程" value="refund_process" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="变量映射">
                    <el-input
                      v-model="selectedNode.subflowVariables"
                      type="textarea"
                      :rows="4"
                      placeholder='JSON格式，如：{"userId": "${process.userId}", "orderId": "${process.orderId}"}'
                      @change="emitNodeChange"
                    />
                    <div class="tip">将当前流程变量映射到子流程变量</div>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              
              <el-tab-pane v-if="selectedNode.type === 'script'" label="脚本" name="script">
                <el-form label-width="100px" size="small">
                  <el-form-item label="脚本语言">
                    <el-select v-model="selectedNode.scriptLanguage" placeholder="选择语言" @change="emitNodeChange">
                      <el-option label="JavaScript" value="javascript" />
                      <el-option label="Python" value="python" />
                      <el-option label="Groovy" value="groovy" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="脚本内容">
                    <el-input
                      v-model="selectedNode.scriptContent"
                      type="textarea"
                      :rows="8"
                      placeholder="输入脚本代码"
                      @change="emitNodeChange"
                    />
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              
              <el-tab-pane v-if="selectedNode.type === 'condition'" label="条件分支" name="condition">
                <div class="config-section">
                  <div class="section-header">
                    <span>输出分支</span>
                    <el-button size="small" text type="primary" @click="addConditionBranch">添加分支</el-button>
                  </div>
                  <el-alert
                    type="info"
                    :closable="false"
                    style="margin-bottom: 12px"
                  >
                    <template #title>
                      <div>条件节点说明：</div>
                      <div style="font-size: 12px; margin-top: 4px;">
                        1. 条件节点必须配置多个输出分支<br/>
                        2. 每个分支需要配置不同的条件表达式<br/>
                        3. 系统按优先级顺序判断分支条件，第一个满足条件的分支将被执行
                      </div>
                    </template>
                  </el-alert>
                  <el-timeline v-if="getConditionBranches(selectedNode.id).length > 0">
                    <el-timeline-item
                      v-for="(branch, idx) in getConditionBranches(selectedNode.id)"
                      :key="branch.id"
                      :timestamp="`优先级: ${branch.priority}`"
                      size="small"
                    >
                      <div class="branch-item">
                        <el-tag>{{ branch.label || '未命名分支' }}</el-tag>
                        <span class="branch-condition">{{ branch.condition || '无条件' }}</span>
                        <el-button size="small" text type="danger" @click="removeConditionBranch(branch.id)">删除</el-button>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                  <el-empty v-else description="暂无分支，请添加输出连线并配置条件" :image-size="60" />
                </div>
              </el-tab-pane>
              
              <el-tab-pane v-if="selectedNode.type === 'parallel'" label="并行配置" name="parallel">
                <el-form label-width="120px" size="small">
                  <el-alert
                    type="info"
                    :closable="false"
                    style="margin-bottom: 12px"
                  >
                    <template #title>
                      <div>并行节点说明：</div>
                      <div style="font-size: 12px; margin-top: 4px;">
                        1. 并行节点会同时启动多个分支流程<br/>
                        2. 请创建多个输出连线，每个连线代表一个并行分支<br/>
                        3. 所有分支完成后，需要在汇聚节点汇聚
                      </div>
                    </template>
                  </el-alert>
                  <el-form-item label="并行分支数">
                    <el-input-number v-model="selectedNode.parallelCount" :min="2" :max="10" @change="emitNodeChange" />
                    <div class="tip">当前输出分支数：{{ getBranchCount(selectedNode.id) }}</div>
                  </el-form-item>
                  <el-form-item label="分支标签">
                    <el-input
                      v-model="selectedNode.parallelLabels"
                      type="textarea"
                      :rows="3"
                      placeholder="多个分支标签，用逗号分隔，如：分支A,分支B,分支C"
                      @change="emitNodeChange"
                    />
                  </el-form-item>
                  <el-form-item label="执行策略">
                    <el-radio-group v-model="selectedNode.parallelStrategy" @change="emitNodeChange">
                      <el-radio label="all">全部执行（默认）</el-radio>
                      <el-radio label="any">任一完成即继续</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="分支列表">
                    <el-timeline v-if="getParallelBranches(selectedNode.id).length > 0">
                      <el-timeline-item
                        v-for="(branch, idx) in getParallelBranches(selectedNode.id)"
                        :key="branch.id"
                        :timestamp="`分支 ${idx + 1}`"
                        size="small"
                      >
                        <div class="branch-item">
                          <el-tag>{{ branch.label || `分支${idx + 1}` }}</el-tag>
                          <span class="branch-condition">{{ findNodeLabel(branch.target) }}</span>
                        </div>
                      </el-timeline-item>
                    </el-timeline>
                    <el-empty v-else description="请创建多个输出连线作为并行分支" :image-size="60" />
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              
              <el-tab-pane v-if="selectedNode.type === 'converge'" label="汇聚配置" name="converge">
                <el-form label-width="120px" size="small">
                  <el-alert
                    type="info"
                    :closable="false"
                    style="margin-bottom: 12px"
                  >
                    <template #title>
                      <div>汇聚节点说明：</div>
                      <div style="font-size: 12px; margin-top: 4px;">
                        1. 汇聚节点用于汇聚并行分支<br/>
                        2. 请创建多个输入连线，每个连线代表一个并行分支<br/>
                        3. 根据汇聚策略决定何时继续执行
                      </div>
                    </template>
                  </el-alert>
                  <el-form-item label="汇聚策略">
                    <el-radio-group v-model="selectedNode.convergeStrategy" @change="emitNodeChange">
                      <el-radio label="all">全部完成（默认）</el-radio>
                      <el-radio label="any">任一完成即继续</el-radio>
                      <el-radio label="majority">多数完成</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item v-if="selectedNode.convergeStrategy === 'majority'" label="完成比例">
                    <el-input-number
                      v-model="selectedNode.convergeRatio"
                      :min="0.5"
                      :max="1"
                      :step="0.1"
                      :precision="1"
                      placeholder="如：0.6表示60%"
                      @change="emitNodeChange"
                    />
                  </el-form-item>
                  <el-form-item label="输入分支数">
                    <el-input-number v-model="selectedNode.convergeCount" :min="2" :max="10" @change="emitNodeChange" />
                    <div class="tip">当前输入分支数：{{ getConvergeBranches(selectedNode.id).length }}</div>
                  </el-form-item>
                  <el-form-item label="分支列表">
                    <el-timeline v-if="getConvergeBranches(selectedNode.id).length > 0">
                      <el-timeline-item
                        v-for="(branch, idx) in getConvergeBranches(selectedNode.id)"
                        :key="branch.id"
                        :timestamp="`分支 ${idx + 1}`"
                        size="small"
                      >
                        <div class="branch-item">
                          <el-tag>{{ branch.label || `分支${idx + 1}` }}</el-tag>
                          <span class="branch-condition">{{ findNodeLabel(branch.source) }}</span>
                        </div>
                      </el-timeline-item>
                    </el-timeline>
                    <el-empty v-else description="请创建多个输入连线作为汇聚分支" :image-size="60" />
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              
              <!-- 消息节点：主要配置消息 -->
              <el-tab-pane v-if="selectedNode.type === 'message'" label="消息配置" name="message-config">
                <el-alert
                  type="info"
                  :closable="false"
                  style="margin-bottom: 12px"
                >
                  <template #title>
                    <div>消息节点说明：</div>
                    <div style="font-size: 12px; margin-top: 4px;">
                      消息节点专门用于发送消息通知，请在"消息"标签页配置消息模板
                    </div>
                  </template>
                </el-alert>
                <el-form label-width="120px" size="small">
                  <el-form-item label="消息优先级">
                    <el-select v-model="selectedNode.messagePriority" placeholder="选择优先级" @change="emitNodeChange">
                      <el-option label="高" value="high" />
                      <el-option label="中" value="medium" />
                      <el-option label="低" value="low" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="是否阻塞">
                    <el-radio-group v-model="selectedNode.messageBlocking" @change="emitNodeChange">
                      <el-radio :label="false">异步发送（不阻塞）</el-radio>
                      <el-radio :label="true">同步发送（阻塞）</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              
              <!-- 数据同步节点：主要配置数据同步 -->
              <el-tab-pane v-if="selectedNode.type === 'sync'" label="同步配置" name="sync-config">
                <el-alert
                  type="info"
                  :closable="false"
                  style="margin-bottom: 12px"
                >
                  <template #title>
                    <div>数据同步节点说明：</div>
                    <div style="font-size: 12px; margin-top: 4px;">
                      数据同步节点专门用于执行数据同步操作，请在"同步"标签页配置同步规则
                    </div>
                  </template>
                </el-alert>
                <el-form label-width="120px" size="small">
                  <el-form-item label="同步模式">
                    <el-radio-group v-model="selectedNode.syncMode" @change="emitNodeChange">
                      <el-radio label="sync">同步执行（阻塞）</el-radio>
                      <el-radio label="async">异步执行（不阻塞）</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="失败策略">
                    <el-select v-model="selectedNode.syncFailureStrategy" placeholder="选择失败处理" @change="emitNodeChange">
                      <el-option label="忽略继续" value="ignore" />
                      <el-option label="重试" value="retry" />
                      <el-option label="终止流程" value="terminate" />
                    </el-select>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </div>
          <div v-else class="empty-tip">选择画布中的节点查看属性</div>
        </el-card>

        <el-card shadow="hover" class="panel-card">
          <div class="card-header">
            <div class="title-row">
              <el-icon><Connection /></el-icon>
              <span>连线列表</span>
            </div>
            <div class="actions">
              <el-button size="small" text type="primary" @click="openEdgeDialogForAdd">新增连线</el-button>
              <el-button size="small" text type="danger" @click="clearEdges">清空</el-button>
            </div>
          </div>
          <el-empty v-if="edges.length === 0" description="暂无连线" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="edge in edges"
              :key="edge.id"
              :color="'#409EFF'"
              size="small"
            >
              <div class="edge-row">
                <div class="edge-main">
                  <strong>{{ edge.label || '未命名' }}</strong>
                  <span class="edge-meta">{{ findNodeLabel(edge.source) }} → {{ findNodeLabel(edge.target) }}</span>
                  <span v-if="edge.condition" class="edge-meta">条件: {{ edge.condition }}</span>
                  <span v-if="edge.priority !== undefined" class="edge-meta">优先级: {{ edge.priority }}</span>
                </div>
                <div class="edge-actions">
                  <el-button size="small" text type="primary" @click="openEdgeDialog(edge)">编辑</el-button>
                  <el-button size="small" text type="danger" @click="deleteEdge(edge.id)">删除</el-button>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>

      <!-- 右侧：画布与工具 -->
      <div class="canvas-panel">
        <div class="canvas-toolbar">
          <div class="toolbar-left">
            <el-button size="small" @click="undo" :disabled="!canUndo">
              <el-icon><RefreshLeft /></el-icon>撤销
            </el-button>
            <el-button size="small" @click="redo" :disabled="!canRedo">
              <el-icon><RefreshRight /></el-icon>重做
            </el-button>
            <el-button size="small" @click="connectMode = !connectMode" :type="connectMode ? 'primary' : 'default'">
              <el-icon><Link /></el-icon>连线模式
            </el-button>
            <el-button size="small" type="warning" plain @click="reset">
              <el-icon><Refresh /></el-icon>重置画布
            </el-button>
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
          @dragover.prevent
          @drop.prevent="onCanvasDrop"
          @mousedown="onCanvasMouseDown"
          @mousemove="onCanvasMouseMove"
          @mouseup="onCanvasMouseUp"
        >
          <!-- 连线层（在节点下方，确保可见） -->
          <svg 
            class="edges-layer" 
            :width="svgDimensions.width" 
            :height="svgDimensions.height"
            :viewBox="`0 0 ${svgDimensions.width} ${svgDimensions.height}`"
            :key="`svg-${nodes.length}-${edges.length}-${nodes.map(n => `${n.id}-${n.x}-${n.y}`).join('-')}`"
          >
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
            </defs>
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
                class="edge-line"
                @click.stop="selectEdge(edge.id)"
              />
              <!-- 曲线（贝塞尔曲线） -->
              <path
                v-else-if="edge.lineType === 'curve'"
                :d="getCurvePath(edge)"
                stroke="#409eff"
                stroke-width="2"
                fill="none"
                marker-end="url(#arrow)"
                class="edge-line"
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
                class="edge-line"
                @click.stop="selectEdge(edge.id)"
              />
              <!-- 连线标签 -->
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
            <!-- 预览连线（连线模式中） -->
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
          <!-- 节点层（在连线上方） -->
          <div
            v-for="node in nodes"
            :key="node.id"
            class="canvas-node"
            :class="{ active: node.id === selectedNodeId, 'condition-node': node.type === 'condition', 'converge-node': node.type === 'converge' }"
            :style="nodeStyle(node)"
            @click.stop="handleNodeClick(node.id, $event)"
            @mousedown.stop="handleNodeMouseDown(node, $event)"
          >
            <span class="node-type" :style="{ background: getNodeColor(node.type) }">
              <span v-if="getNodeIcon(node.type)" class="node-icon">{{ getNodeIcon(node.type) }}</span>
            </span>
            <div class="node-label">{{ node.label }}</div>
            <!-- 条件节点显示分支提示 -->
            <div v-if="node.type === 'condition'" class="node-branches">
              {{ getBranchCount(node.id) }} 分支
            </div>
          </div>
        </div>

        <div class="mini-map">
          <div class="mini-title">
            <el-icon><Aim /></el-icon>
            <span>迷你图</span>
          </div>
          <div class="mini-canvas">
            <div
              v-for="node in nodes"
              :key="`mini-${node.id}`"
              class="mini-node"
              :style="miniStyle(node)"
              :title="node.label"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- 规则选择弹窗 -->
    <el-dialog v-model="ruleDialogVisible" title="选择规则" width="600px">
      <el-table :data="availableRules" @selection-change="handleRuleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="规则编码" width="160" />
        <el-table-column prop="name" label="规则名称" />
        <el-table-column prop="type" label="类型" width="120" />
      </el-table>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRules">确定</el-button>
      </template>
    </el-dialog>

    <!-- 事件选择弹窗 -->
    <el-dialog v-model="eventDialogVisible" title="选择事件" width="600px">
      <el-form label-width="100px" size="small">
        <el-form-item label="事件编码">
          <el-select v-model="eventForm.eventCode" filterable placeholder="选择事件">
            <el-option v-for="evt in availableEvents" :key="evt.code" :label="evt.name" :value="evt.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="触发条件">
          <el-input v-model="eventForm.triggerCondition" placeholder="如：success / result == 'approved'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="eventDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEvent">确定</el-button>
      </template>
    </el-dialog>

    <!-- 消息选择弹窗 -->
    <el-dialog v-model="messageDialogVisible" title="选择消息模板" width="600px">
      <el-form label-width="100px" size="small">
        <el-form-item label="模板编码">
          <el-select v-model="messageForm.templateCode" filterable placeholder="选择模板">
            <el-option v-for="tpl in availableMessages" :key="tpl.code" :label="tpl.name" :value="tpl.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="触发条件">
          <el-input v-model="messageForm.triggerCondition" placeholder="如：node.entered / success" />
        </el-form-item>
        <el-form-item label="发送通道">
          <el-checkbox-group v-model="messageForm.channels">
            <el-checkbox label="sms">短信</el-checkbox>
            <el-checkbox label="app_push">App推送</el-checkbox>
            <el-checkbox label="station_letter">站内信</el-checkbox>
            <el-checkbox label="email">邮件</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="messageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmMessage">确定</el-button>
      </template>
    </el-dialog>

    <!-- 数据同步选择弹窗 -->
    <el-dialog v-model="syncDialogVisible" title="选择数据同步配置" width="600px">
      <el-table :data="availableSyncs" @selection-change="handleSyncSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="配置编码" width="160" />
        <el-table-column prop="name" label="配置名称" />
        <el-table-column prop="syncStrategy" label="同步策略" width="120" />
      </el-table>
      <template #footer>
        <el-button @click="syncDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSyncs">确定</el-button>
      </template>
    </el-dialog>

    <!-- 模板库弹窗 -->
    <el-dialog v-model="templateDialogVisible" title="流程模板库" width="800px">
      <el-row :gutter="16">
        <el-col :span="8" v-for="tpl in processTemplates" :key="tpl.code">
          <el-card shadow="hover" class="template-card" @click="applyTemplate(tpl)">
            <div class="template-header">
              <h4>{{ tpl.name }}</h4>
              <el-tag size="small">{{ tpl.category }}</el-tag>
            </div>
            <p class="template-desc">{{ tpl.description }}</p>
            <div class="template-meta">
              <span>节点数: {{ tpl.nodeCount }}</span>
              <span>版本: {{ tpl.version }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- 连线配置弹窗 -->
    <el-dialog v-model="edgeDialogVisible" title="连线配置" width="480px" :close-on-click-modal="false">
      <el-form :model="edgeForm" label-width="90px">
        <el-form-item label="来源节点">
          <el-select v-model="edgeForm.source" placeholder="选择来源">
            <el-option v-for="n in nodes" :key="n.id" :label="n.label" :value="n.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标节点">
          <el-select v-model="edgeForm.target" placeholder="选择目标">
            <el-option v-for="n in nodes" :key="`t-${n.id}`" :label="n.label" :value="n.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="edgeForm.label" placeholder="如：通过/拒绝/并行A" />
        </el-form-item>
        <el-form-item label="线条类型">
          <el-radio-group v-model="edgeForm.lineType">
            <el-radio label="straight">直线</el-radio>
            <el-radio label="curve">曲线</el-radio>
            <el-radio label="polyline">折线</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="条件表达式">
          <el-input
            v-model="edgeForm.condition"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="示例：courseProgress >= 1 && examPassed === true"
          />
          <div class="tip">条件节点必须为每个输出分支配置不同的条件表达式</div>
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="edgeForm.priority" :min="0" :step="1" />
          <div class="tip">数字越大优先级越高，条件节点按优先级顺序判断分支</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="edgeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdge">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Plus,
  Collection,
  Setting,
  Connection,
  RefreshLeft,
  RefreshRight,
  Link,
  Refresh,
  Aim
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const palette = [
  { type: 'start', label: '开始', color: '#67C23A' },
  { type: 'task', label: '任务', color: '#409EFF' },
  { type: 'auto', label: '自动', color: '#409EFF', icon: '⚡' },
  { type: 'approval', label: '审批', color: '#E6A23C' },
  { type: 'condition', label: '条件', color: '#909399' },
  { type: 'parallel', label: '并行', color: '#8e44ad' },
  { type: 'converge', label: '汇聚', color: '#8e44ad', icon: '🔀' },
  { type: 'subflow', label: '子流程', color: '#00b894' },
  { type: 'message', label: '消息', color: '#52c41a' },
  { type: 'sync', label: '数据同步', color: '#1890ff' },
  { type: 'script', label: '脚本', color: '#722ed1' },
  { type: 'end', label: '结束', color: '#F56C6C' }
]

const nodes = ref([
  { id: 'start-1', type: 'start', label: '开始', x: 80, y: 160 },
  { id: 'end-1', type: 'end', label: '结束', x: 520, y: 160 }
])
const edges = ref([])
const selectedNodeId = ref('')
const draggedPaletteItem = ref(null)
const connectMode = ref(false)
const connectingSourceNode = ref(null)
const connectingPreviewLine = ref(null)
const draggingNode = ref(null)
const zoom = ref(100)
const edgeDialogVisible = ref(false)
const edgeForm = ref({
  id: '',
  source: '',
  target: '',
  label: '',
  condition: '',
  priority: 0,
  lineType: 'straight' // straight, curve, polyline
})

// 节点属性面板
const activeTab = ref('basic')

// 规则选择
const ruleDialogVisible = ref(false)
const selectedRules = ref([])
const availableRules = ref([
  { code: 'validate_phone_format', name: '手机号格式校验', type: 'validation' },
  { code: 'validate_phone_unique', name: '手机号唯一性校验', type: 'validation' },
  { code: 'validate_password_strength', name: '密码强度校验', type: 'validation' },
  { code: 'validate_id_card_complete', name: '身份证完整性校验', type: 'validation' },
  { code: 'validate_course_completion', name: '课程完成度校验', type: 'condition' },
  { code: 'validate_exam_score', name: '考试分数校验', type: 'condition' }
])

// 事件选择
const eventDialogVisible = ref(false)
const eventForm = ref({
  eventCode: '',
  triggerCondition: 'success'
})
const availableEvents = ref([
  { code: 'user.registered', name: '用户注册成功', type: 'business' },
  { code: 'identity.verified', name: '身份核验通过', type: 'business' },
  { code: 'identity.verification.failed', name: '身份核验失败', type: 'business' },
  { code: 'course.completed', name: '课程完成', type: 'business' },
  { code: 'exam.passed', name: '考试通过', type: 'business' },
  { code: 'exam.failed', name: '考试失败', type: 'business' },
  { code: 'masseur.certified', name: '认证推拿师完成', type: 'business' }
])

// 消息选择
const messageDialogVisible = ref(false)
const messageForm = ref({
  templateCode: '',
  triggerCondition: 'node.completed',
  channels: ['sms']
})
const availableMessages = ref([
  { code: 'register_success', name: '注册成功通知' },
  { code: 'identity_verified_success', name: '身份核验成功通知' },
  { code: 'identity_verified_failed', name: '身份核验失败通知' },
  { code: 'course_started', name: '课程开始通知' },
  { code: 'course_completed', name: '课程完成通知' },
  { code: 'exam_passed', name: '考试通过通知' },
  { code: 'exam_failed', name: '考试失败通知' },
  { code: 'certification_success', name: '认证成功通知' }
])

// 数据同步选择
const syncDialogVisible = ref(false)
const selectedSyncs = ref([])
const availableSyncs = ref([
  { code: 'sync_user_to_crm', name: '同步用户到CRM', syncStrategy: 'full' },
  { code: 'sync_learning_progress', name: '同步学习进度', syncStrategy: 'incremental' },
  { code: 'sync_exam_result', name: '同步考试成绩', syncStrategy: 'full' },
  { code: 'sync_certification_status', name: '同步认证状态', syncStrategy: 'full' },
  { code: 'sync_masseur_to_library', name: '同步推拿师到库', syncStrategy: 'full' }
])

// 模板库
const templateDialogVisible = ref(false)
const processTemplates = ref([
  {
    code: 'masseur_migration',
    name: '推拿师身份迁移流程',
    category: '用户认证',
    description: '从注册到认证推拿师的完整迁移流程',
    nodeCount: 6,
    version: '1.0',
    template: {
      nodes: [
        { id: 'start', type: 'start', label: '开始', x: 80, y: 160 },
        { id: 'register', type: 'auto', label: '注册', x: 200, y: 160 },
        { id: 'verify_identity', type: 'task', label: '核验身份', x: 320, y: 160 },
        { id: 'course_learning', type: 'task', label: '课程学习', x: 440, y: 160 },
        { id: 'certification_exam', type: 'task', label: '认证考试', x: 560, y: 160 },
        { id: 'become_certified', type: 'auto', label: '成为认证推拿师', x: 680, y: 160 },
        { id: 'end', type: 'end', label: '结束', x: 800, y: 160 }
      ],
      edges: [
        { source: 'start', target: 'register', label: '', condition: 'true', priority: 0 },
        { source: 'register', target: 'verify_identity', label: '', condition: 'registerResult == "success"', priority: 0 },
        { source: 'verify_identity', target: 'course_learning', label: '', condition: 'verificationResult == "approved"', priority: 0 },
        { source: 'course_learning', target: 'certification_exam', label: '', condition: 'courseProgress >= 1.0', priority: 0 },
        { source: 'certification_exam', target: 'become_certified', label: '', condition: 'examScore >= 60', priority: 0 },
        { source: 'become_certified', target: 'end', label: '', condition: 'true', priority: 0 }
      ]
    }
  }
])

// 流程版本
const processVersion = ref('1.0')
const processCode = ref('')
const processName = ref('未命名流程')

const history = ref([])
const historyIndex = ref(-1)

const canvasRef = ref(null)

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)
const selectedNode = computed(() => nodes.value.find(n => n.id === selectedNodeId.value) || null)

// SVG尺寸计算，用于强制更新连线
const svgDimensions = computed(() => {
  if (!canvasRef.value) return { width: 800, height: 540 }
  return {
    width: canvasRef.value.clientWidth,
    height: canvasRef.value.clientHeight
  }
})

const pushHistory = () => {
  const snapshot = {
    nodes: JSON.parse(JSON.stringify(nodes.value)),
    edges: JSON.parse(JSON.stringify(edges.value))
  }
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(snapshot)
  historyIndex.value = history.value.length - 1
}

onMounted(() => {
  pushHistory()
})

const handleNew = () => {
  nodes.value = [
    { id: 'start-1', type: 'start', label: '开始', x: 80, y: 160 },
    { id: 'end-1', type: 'end', label: '结束', x: 520, y: 160 }
  ]
  edges.value = []
  selectedNodeId.value = ''
  connectSourceId.value = ''
  connectMode.value = false
  pushHistory()
}

const handleSave = () => {
  const payload = JSON.stringify({ nodes: nodes.value, edges: edges.value })
  localStorage.setItem('visual-designer-draft', payload)
  ElMessage.success('已保存草稿到本地')
}

const handlePublish = async () => {
  const validation = validateProcess(true)
  if (!validation.valid) {
    ElMessageBox.alert(validation.errors.join('\n'), '流程校验失败', { type: 'error' })
    return
  }
  
  const result = await ElMessageBox.prompt('请输入流程编码和名称', '发布流程', {
    confirmButtonText: '发布',
    cancelButtonText: '取消',
    inputType: 'text',
    inputPlaceholder: '流程编码',
    inputValue: processCode.value || ''
  }).catch(() => null)
  
  if (!result) return
  
  processCode.value = result.value
  const payload = {
    code: processCode.value,
    name: processName.value,
    version: processVersion.value,
    nodes: nodes.value,
    edges: edges.value,
    createTime: new Date().toISOString()
  }
  
  console.info('发布流程', payload)
  ElMessage.success('模拟发布成功（待接后端）')
  
  // 保存到本地存储
  const published = JSON.parse(localStorage.getItem('visual-published-processes') || '[]')
  published.push(payload)
  localStorage.setItem('visual-published-processes', JSON.stringify(published))
}

const loadDraft = () => {
  const raw = localStorage.getItem('visual-designer-draft')
  if (!raw) {
    ElMessage.info('暂无草稿')
    return
  }
  try {
    const data = JSON.parse(raw)
    nodes.value = data.nodes || []
    edges.value = data.edges || []
    selectedNodeId.value = ''
    pushHistory()
    ElMessage.success('已加载草稿')
  } catch (e) {
    ElMessage.error('草稿数据损坏')
  }
}

const exportJson = () => {
  const blob = new Blob([JSON.stringify({ nodes: nodes.value, edges: edges.value }, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'visual-process.json'
  a.click()
  URL.revokeObjectURL(url)
}

const onPaletteDragStart = (item) => {
  draggedPaletteItem.value = item
}

const onCanvasDrop = (e) => {
  if (!draggedPaletteItem.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const scale = zoom.value / 100
  const x = (e.clientX - rect.left) / scale
  const y = (e.clientY - rect.top) / scale
  const newNode = {
    id: `${draggedPaletteItem.value.type}-${Date.now()}`,
    type: draggedPaletteItem.value.type,
    label: draggedPaletteItem.value.label,
    x,
    y
  }
  nodes.value.push(newNode)
  selectNode(newNode.id)
  pushHistory()
  draggedPaletteItem.value = null
}

const nodeStyle = (node) => ({
  left: `${node.x}px`,
  top: `${node.y}px`,
  transform: `scale(${zoom.value / 100})`
})

const miniStyle = (node) => {
  const w = 180
  const h = 120
  const canvasW = (canvasRef.value?.clientWidth || 1)
  const canvasH = (canvasRef.value?.clientHeight || 1)
  return {
    left: `${(node.x / canvasW) * w}px`,
    top: `${(node.y / canvasH) * h}px`,
    background: getNodeColor(node.type)
  }
}

const getNodeColor = (type) => {
  const found = palette.find(p => p.type === type)
  return found ? found.color : '#409eff'
}

// 处理节点点击
const handleNodeClick = (id, e) => {
  if (connectMode.value) {
    // 连线模式下，节点点击由onCanvasMouseDown处理，这里不处理
    return
  }
  // 非连线模式，正常选择节点
  selectNode(id)
}

const selectNode = (id) => {
  selectedNodeId.value = id
}

const addEdge = (source, target) => {
  const exists = edges.value.some(e => e.source === source && e.target === target)
  if (exists) return
  edges.value.push({ id: `e-${Date.now()}`, source, target, label: '', condition: '', priority: 0 })
  pushHistory()
}

const clearEdges = () => {
  edges.value = []
  pushHistory()
}

const findNodeLabel = (id) => nodes.value.find(n => n.id === id)?.label || id

// 获取节点中心（保留用于其他用途）
const getNodeCenter = (id) => {
  const node = nodes.value.find(n => n.id === id)
  if (!node) return { x: 0, y: 0 }
  return { x: node.x + 60, y: node.y + 24 }
}

const getNodeIcon = (type) => {
  const iconMap = {
    auto: '⚡',
    converge: '🔀',
    script: '📜'
  }
  return iconMap[type] || ''
}

const getBranchCount = (nodeId) => {
  return edges.value.filter(e => e.source === nodeId).length
}

const selectEdge = (edgeId) => {
  const edge = edges.value.find(e => e.id === edgeId)
  if (edge) {
    openEdgeDialog(edge)
  }
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

// 计算折线路径
const getPolylinePoints = (edge) => {
  const start = getLineStartPoint(edge)
  const end = getLineEndPoint(edge)
  const midX = (start.x + end.x) / 2
  return `${start.x},${start.y} ${midX},${start.y} ${midX},${end.y} ${end.x},${end.y}`
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

const emitNodeChange = () => {
  pushHistory()
}

const deleteNode = (id) => {
  nodes.value = nodes.value.filter(n => n.id !== id)
  edges.value = edges.value.filter(e => e.source !== id && e.target !== id)
  if (selectedNodeId.value === id) selectedNodeId.value = ''
  pushHistory()
}

const deleteEdge = (id) => {
  edges.value = edges.value.filter(e => e.id !== id)
  pushHistory()
}

const openEdgeDialogForAdd = () => {
  edgeForm.value = {
    id: '',
    source: nodes.value[0]?.id || '',
    target: nodes.value[1]?.id || '',
    label: '',
    condition: '',
    priority: 0,
    lineType: 'straight'
  }
  edgeDialogVisible.value = true
}

const openEdgeDialog = (edge) => {
  edgeForm.value = { ...edge }
  edgeDialogVisible.value = true
}

const saveEdge = () => {
  if (!edgeForm.value.source || !edgeForm.value.target) {
    ElMessage.warning('请选择来源和目标节点')
    return
  }
  if (edgeForm.value.source === edgeForm.value.target) {
    ElMessage.warning('来源与目标不能相同')
    return
  }
  if (edgeForm.value.id) {
    const idx = edges.value.findIndex(e => e.id === edgeForm.value.id)
    if (idx > -1) {
      edges.value[idx] = { ...edgeForm.value }
    }
  } else {
    edges.value.push({ ...edgeForm.value, id: `e-${Date.now()}` })
  }
  pushHistory()
  edgeDialogVisible.value = false
}

const undo = () => {
  if (!canUndo.value) return
  historyIndex.value -= 1
  const snapshot = history.value[historyIndex.value]
  nodes.value = JSON.parse(JSON.stringify(snapshot.nodes))
  edges.value = JSON.parse(JSON.stringify(snapshot.edges))
}

const redo = () => {
  if (!canRedo.value) return
  historyIndex.value += 1
  const snapshot = history.value[historyIndex.value]
  nodes.value = JSON.parse(JSON.stringify(snapshot.nodes))
  edges.value = JSON.parse(JSON.stringify(snapshot.edges))
}

const reset = () => {
  zoom.value = 100
  selectedNodeId.value = ''
  connectMode.value = false
  connectingSourceNode.value = null
  connectingPreviewLine.value = null
}

// 节点拖拽移动（画布内）
const onCanvasMouseDown = (e) => {
  if (!connectMode.value) {
    // 非连线模式，检查是否点击了节点
    const clickedNode = findNodeAtPosition(e)
    if (clickedNode) {
      selectNode(clickedNode.id)
    }
    draggingNode.value = null
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
      // 选中节点以便显示
      selectedNodeId.value = clickedNode.id
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
            id: `e-${Date.now()}`,
            source: connectingSourceNode.value.id,
            target: clickedNode.id,
            label: '',
            condition: '',
            priority: 0,
            lineType: 'curve' // 默认曲线
          }
          edges.value.push(newEdge)
          pushHistory()
          ElMessage.success('连线创建成功')
        } else {
          ElMessage.warning('连线已存在')
        }
      }
      // 重置连线状态，准备下一次连线
      connectingSourceNode.value = null
      connectingPreviewLine.value = null
      // 选中目标节点
      selectedNodeId.value = clickedNode.id
    }
  } else {
    // 点击空白处，取消连线
    if (connectingSourceNode.value) {
      connectingSourceNode.value = null
      connectingPreviewLine.value = null
    }
  }
  draggingNode.value = null
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
            id: `e-${Date.now()}`,
            source: connectingSourceNode.value.id,
            target: node.id,
            label: '',
            condition: '',
            priority: 0,
            lineType: 'curve' // 默认曲线
          }
          edges.value.push(newEdge)
          pushHistory()
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
}

const startDragNode = (node, e) => {
  const scale = zoom.value / 100
  draggingNode.value = {
    id: node.id,
    offsetX: (e.offsetX || 0) / scale,
    offsetY: (e.offsetY || 0) / scale
  }
}

const onCanvasMouseMove = (e) => {
  if (draggingNode.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    const scale = zoom.value / 100
    const x = (e.clientX - rect.left) / scale - draggingNode.value.offsetX
    const y = (e.clientY - rect.top) / scale - draggingNode.value.offsetY
    const node = nodes.value.find(n => n.id === draggingNode.value.id)
    if (node) {
      // 使用Vue的响应式更新，确保连线能实时更新
      const canvasWidth = canvasRef.value?.clientWidth || 800
      const canvasHeight = canvasRef.value?.clientHeight || 540
      node.x = Math.max(0, Math.min(x, canvasWidth - 120))
      node.y = Math.max(0, Math.min(y, canvasHeight - 48))
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
  if (draggingNode.value) {
    pushHistory()
  }
  draggingNode.value = null
}

// 规则选择
const openRuleSelector = () => {
  if (!selectedNode.value) return
  selectedRules.value = (selectedNode.value.rules || []).map(r => availableRules.value.find(ar => ar.code === r)).filter(Boolean)
  ruleDialogVisible.value = true
}

const handleRuleSelectionChange = (selection) => {
  selectedRules.value = selection
}

const confirmRules = () => {
  if (!selectedNode.value) return
  selectedNode.value.rules = selectedRules.value.map(r => r.code)
  emitNodeChange()
  ruleDialogVisible.value = false
  ElMessage.success('规则绑定成功')
}

const removeRule = (ruleCode) => {
  if (!selectedNode.value) return
  selectedNode.value.rules = (selectedNode.value.rules || []).filter(r => r !== ruleCode)
  emitNodeChange()
}

// 事件选择
const openEventSelector = () => {
  if (!selectedNode.value) return
  eventForm.value = { eventCode: '', triggerCondition: 'success' }
  eventDialogVisible.value = true
}

const confirmEvent = () => {
  if (!selectedNode.value || !eventForm.value.eventCode) {
    ElMessage.warning('请选择事件')
    return
  }
  if (!selectedNode.value.events) selectedNode.value.events = []
  selectedNode.value.events.push({ ...eventForm.value })
  emitNodeChange()
  eventDialogVisible.value = false
  ElMessage.success('事件配置成功')
}

const removeEvent = (index) => {
  if (!selectedNode.value || !selectedNode.value.events) return
  selectedNode.value.events.splice(index, 1)
  emitNodeChange()
}

// 消息选择
const openMessageSelector = () => {
  if (!selectedNode.value) return
  messageForm.value = { templateCode: '', triggerCondition: 'node.completed', channels: ['sms'] }
  messageDialogVisible.value = true
}

const confirmMessage = () => {
  if (!selectedNode.value || !messageForm.value.templateCode) {
    ElMessage.warning('请选择消息模板')
    return
  }
  if (!selectedNode.value.messages) selectedNode.value.messages = []
  selectedNode.value.messages.push({ ...messageForm.value })
  emitNodeChange()
  messageDialogVisible.value = false
  ElMessage.success('消息配置成功')
}

const removeMessage = (index) => {
  if (!selectedNode.value || !selectedNode.value.messages) return
  selectedNode.value.messages.splice(index, 1)
  emitNodeChange()
}

// 数据同步选择
const openSyncSelector = () => {
  if (!selectedNode.value) return
  selectedSyncs.value = (selectedNode.value.dataSync || []).map(s => availableSyncs.value.find(as => as.code === s)).filter(Boolean)
  syncDialogVisible.value = true
}

const handleSyncSelectionChange = (selection) => {
  selectedSyncs.value = selection
}

const confirmSyncs = () => {
  if (!selectedNode.value) return
  selectedNode.value.dataSync = selectedSyncs.value.map(s => s.code)
  emitNodeChange()
  syncDialogVisible.value = false
  ElMessage.success('数据同步配置成功')
}

const removeSync = (syncCode) => {
  if (!selectedNode.value) return
  selectedNode.value.dataSync = (selectedNode.value.dataSync || []).filter(s => s !== syncCode)
  emitNodeChange()
}

// 条件分支管理
const getConditionBranches = (nodeId) => {
  return edges.value.filter(e => e.source === nodeId).map(e => ({
    id: e.id,
    label: e.label,
    condition: e.condition,
    priority: e.priority,
    target: e.target
  })).sort((a, b) => (b.priority || 0) - (a.priority || 0))
}

// 并行分支管理
const getParallelBranches = (nodeId) => {
  return edges.value.filter(e => e.source === nodeId).map(e => ({
    id: e.id,
    label: e.label,
    target: e.target
  }))
}

// 汇聚分支管理
const getConvergeBranches = (nodeId) => {
  return edges.value.filter(e => e.target === nodeId).map(e => ({
    id: e.id,
    label: e.label,
    source: e.source
  }))
}

const addConditionBranch = () => {
  if (!selectedNode.value || selectedNode.value.type !== 'condition') return
  ElMessageBox.prompt('请输入分支标签', '添加条件分支', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '如：通过/拒绝/其他'
  }).then(({ value }) => {
    if (!value) return
    // 提示用户需要先创建连线
    ElMessageBox.confirm('请先创建从条件节点到目标节点的连线，然后在连线配置中设置条件表达式', '提示', {
      confirmButtonText: '知道了',
      showCancelButton: false
    })
  }).catch(() => {})
}

const removeConditionBranch = (edgeId) => {
  deleteEdge(edgeId)
}

// 模板库
const openTemplateDialog = () => {
  templateDialogVisible.value = true
}

const applyTemplate = (template) => {
  ElMessageBox.confirm('应用模板将覆盖当前画布内容，是否继续？', '确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const timestamp = Date.now()
    const idMap = {}
    // 创建节点并建立ID映射
    nodes.value = template.template.nodes.map(n => {
      const newId = `${n.id}-${timestamp}`
      idMap[n.id] = newId
      return { ...n, id: newId }
    })
    // 创建连线，使用映射后的ID
    edges.value = template.template.edges.map(e => ({
      ...e,
      id: `e-${timestamp}-${Math.random()}`,
      source: idMap[e.source] || e.source,
      target: idMap[e.target] || e.target
    }))
    processName.value = template.name
    processCode.value = template.code
    processVersion.value = template.version
    selectedNodeId.value = ''
    pushHistory()
    templateDialogVisible.value = false
    ElMessage.success('模板应用成功')
  }).catch(() => {})
}

// 流程校验
const validateProcess = (silent = false) => {
  const errors = []
  
  // 检查是否有开始和结束节点
  const hasStart = nodes.value.some(n => n.type === 'start')
  const hasEnd = nodes.value.some(n => n.type === 'end')
  if (!hasStart) errors.push('缺少开始节点')
  if (!hasEnd) errors.push('缺少结束节点')
  
  // 并行/汇聚规则
  nodes.value.forEach(n => {
    if (n.type === 'parallel') {
      const out = edges.value.filter(e => e.source === n.id)
      if (out.length < 2) errors.push(`并行节点"${n.label}"需要至少2条输出连线`)
    }
    if (n.type === 'converge') {
      const incoming = edges.value.filter(e => e.target === n.id)
      if (incoming.length < 2) errors.push(`汇聚节点"${n.label}"需要至少2条输入连线`)
    }
  })
  
  // 检查节点是否有孤立节点（无连线）
  const connectedNodeIds = new Set()
  edges.value.forEach(e => {
    connectedNodeIds.add(e.source)
    connectedNodeIds.add(e.target)
  })
  nodes.value.forEach(n => {
    if (n.type !== 'start' && n.type !== 'end' && !connectedNodeIds.has(n.id)) {
      errors.push(`节点"${n.label}"未连接到流程中`)
    }
  })
  
  // 检查是否有未命名的节点
  nodes.value.forEach(n => {
    if (!n.label || n.label.trim() === '') {
      errors.push(`存在未命名的节点（ID: ${n.id}）`)
    }
  })
  
  // 检查连线是否有循环引用（简单检查）
  const visited = new Set()
  const checkCycle = (nodeId) => {
    if (visited.has(nodeId)) {
      errors.push(`检测到循环引用（节点ID: ${nodeId}）`)
      return
    }
    visited.add(nodeId)
    edges.value.filter(e => e.source === nodeId).forEach(e => {
      checkCycle(e.target)
    })
    visited.delete(nodeId)
  }
  const startNode = nodes.value.find(n => n.type === 'start')
  if (startNode) checkCycle(startNode.id)
  
  if (!silent) {
    if (errors.length === 0) {
      ElMessage.success('流程校验通过')
    } else {
      ElMessageBox.alert(errors.join('\n'), '流程校验失败', { type: 'error' })
    }
  }
  
  return { valid: errors.length === 0, errors }
}
</script>

<style scoped>
.page-wrapper {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header h2 {
  margin: 0;
}

.subtitle {
  margin: 4px 0 0;
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.designer-body {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 12px;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-card {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.palette {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  background: #fafafa;
  cursor: grab;
}

.palette-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.form-body {
  padding-right: 6px;
}

.xy {
  display: flex;
  gap: 8px;
}

.empty-tip {
  color: #909399;
  text-align: center;
  padding: 12px 0;
}

.canvas-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-label {
  color: #606266;
  font-size: 13px;
}

.canvas {
  position: relative;
  height: 540px;
  background: #f8fafc;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
}

.canvas-node {
  position: absolute;
  width: 120px;
  min-height: 48px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  cursor: move;
  transform-origin: top left;
  transition: box-shadow 0.15s;
}

.canvas-node.active {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.node-type {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}

.node-label {
  font-size: 14px;
  color: #303133;
}

.edges-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: stroke;
  overflow: visible;
}

.canvas-node {
  position: absolute;
  width: 120px;
  min-height: 48px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  cursor: move;
  transform-origin: top left;
  transition: box-shadow 0.15s;
  z-index: 2;
}

.mini-map {
  width: 220px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 8px;
  background: #fafafa;
}

.mini-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #606266;
  font-size: 13px;
}

.mini-canvas {
  position: relative;
  width: 200px;
  height: 140px;
  background: #fff;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}

.mini-node {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.config-section {
  padding: 8px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
}

.template-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 12px;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.template-header h4 {
  margin: 0;
  font-size: 16px;
}

.template-desc {
  color: #606266;
  font-size: 13px;
  margin: 8px 0;
  min-height: 40px;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.msg-channels {
  margin-left: 8px;
}

.node-icon {
  font-size: 16px;
  line-height: 1;
}

.node-branches {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.condition-node {
  border: 2px dashed #909399;
}

.converge-node {
  border: 2px solid #8e44ad;
}

.edge-line {
  cursor: pointer;
  transition: stroke-width 0.2s;
}

.edge-line:hover {
  stroke-width: 3;
}

.edge-label {
  pointer-events: none;
  user-select: none;
}

.branch-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.branch-condition {
  flex: 1;
  font-size: 12px;
  color: #606266;
  word-break: break-all;
}

.tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

@media (max-width: 1100px) {
  .designer-body {
    grid-template-columns: 1fr;
  }

  .canvas-panel {
    order: -1;
  }

  .mini-map {
    width: 100%;
  }
}
</style>

