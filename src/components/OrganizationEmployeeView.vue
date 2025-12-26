<template>
  <div class="organization-employee-view">
    <div class="view-header">
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索员工姓名、工号、岗位、用户名"
          style="width: 300px; margin-right: 10px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button @click="importDialogVisible = true" style="margin-right: 10px">
          导入
        </el-button>
        <el-button type="primary" @click="handleAddEmployeeToDept">
          <el-icon><Plus /></el-icon>
          添加员工
        </el-button>
      </div>
    </div>

    <div class="view-content">
      <div class="tree-panel">
        <el-card shadow="never" class="tree-card">
          <template #header>
            <div class="card-header">
              <span>组织架构树</span>
              <el-button 
                type="text" 
                size="small" 
                @click="expandAll"
              >
                {{ isAllExpanded ? '收起全部' : '展开全部' }}
              </el-button>
            </div>
          </template>
          <el-tree
            ref="treeRef"
            :data="displayTreeData"
            :props="treeProps"
            :default-expand-all="false"
            :default-expanded-keys="defaultExpandedKeys"
            :highlight-current="true"
            node-key="id"
            @node-click="handleNodeClick"
            class="organization-tree"
            :render-after-expand="false"
          >
            <template #default="{ node, data }">
              <div class="tree-node-wrapper">
                <!-- 员工节点 -->
                <div 
                  v-if="data.isEmployee" 
                  class="employee-node"
                  :class="{ 'highlighted': isHighlightedUser(data.employeeId) }"
                >
                  <el-tag
                    size="small"
                    :type="isHighlightedUser(data.employeeId) ? 'warning' : 'info'"
                    :effect="isHighlightedUser(data.employeeId) ? 'dark' : 'plain'"
                    class="employee-tag-inline"
                  >
                    {{ data.name }}
                  </el-tag>
                  <span v-if="data.positionName" class="employee-position-inline">
                    - {{ data.positionName }}
                  </span>
                </div>

                <!-- 工作岗位节点（显示 格式：空缺 - 岗位  或 姓名 - 岗位） -->
                <div v-else-if="data.isWorkPost" class="workpost-node">
                  <el-tag size="small" type="info" class="employee-tag-inline">
                    <template v-if="data.workPostData?.status === 'vacant'">
                      空缺
                    </template>
                    <template v-else>
                      {{ getUserName(data.workPostData.assignedUserId) || '在岗' }}
                    </template>
                  </el-tag>
                  <span style="margin-left:8px; color:#909399; font-size:12px">
                    - {{ data.positionName || getPositionNameFromWorkPost(data.workPostData) }}
                    <el-tag v-if="data.workPostData?.fromBudget && !data.workPostData?.departmentId" size="mini" type="info" style="margin-left:6px">预算</el-tag>
                    <template v-if="data.workPostData?.postCode" style="margin-left:8px">
                      <el-tooltip :content="`编号: ${data.workPostData.postCode}`" placement="top">
                        <i style="margin-left:8px; color:#909399; font-size:12px; cursor:help">编号</i>
                      </el-tooltip>
                    </template>
                  </span>
                </div>

                <!-- 部门节点 -->
                <div v-else class="tree-node-main">
                  <div class="node-header">
                    <div class="node-title-section">
                      <span class="node-label">{{ node.label }}</span>
                      <el-tag 
                        v-if="data.type" 
                        :type="getNodeTypeTagType(data.type)" 
                        size="small"
                        class="node-type-tag"
                      >
                        {{ getNodeTypeLabel(data.type) }}
                      </el-tag>
                      <span v-if="data.userCount > 0" class="user-count-badge">
                        {{ data.userCount }}人
                      </span>
                    </div>
                  <el-dropdown trigger="hover">
                    <el-button text size="small" class="add-child-btn">
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item v-if="canAddChildNode(data.type)" @click.stop="handleQuickAddChild(data)">
                          新增子节点
                        </el-dropdown-item>
                        <el-dropdown-item @click.stop="openMoveDialog(data)">
                          移动
                        </el-dropdown-item>
                        <el-dropdown-item @click.stop="openDissolveDialog(data)">
                          解散
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  </div>
                </div>
              </div>
            </template>
          </el-tree>
        </el-card>
      </div>

      <div class="employee-panel">
        <el-card shadow="never" class="employee-card">
          <template #header>
            <div class="card-header">
              <span>{{ currentDepartmentName || '全部员工' }}</span>
              <span v-if="filteredUsers.length > 0" class="employee-count">
                共 {{ filteredUsers.length }} 人
              </span>
            </div>
          </template>
          <el-table
            :data="displayedEntries"
            border
            stripe
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column label="姓名/岗位" min-width="200">
              <template #default="scope">
                <div>
                  <template v-if="scope.row.type === 'workpost'">
                    <el-tag size="small" type="info" class="employee-tag-inline">
                      <template v-if="scope.row.workPostData?.status === 'vacant'">空缺</template>
                      <template v-else>{{ getUserName(scope.row.workPostData?.assignedUserId) || '在岗' }}</template>
                    </el-tag>
                    <span style="color:#909399; margin-left:8px; font-size:12px">
                    - {{ scope.row.positionName || getPositionNameFromWorkPost(scope.row.workPostData) }}
                    <el-tag v-if="scope.row.workPostData?.fromBudget && !scope.row.workPostData?.departmentId" size="mini" type="info" style="margin-left:6px">预算</el-tag>
                    </span>
                  </template>
                  <template v-else>
                    <span>{{ scope.row.name }}</span>
                    <span v-if="scope.row.positionName" style="color:#909399; margin-left:8px">
                      - {{ scope.row.positionName }}
                    </span>
                  </template>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="工作岗位编号" min-width="160">
              <template #default="scope">
                <span v-if="scope.row.type === 'workpost'">
                  {{ scope.row.workPostCode || '' }}
                </span>
                <span v-else>
                  {{ getUserWorkPostCode(scope.row) || '' }}
                </span>
              </template>
            </el-table-column>

            <el-table-column prop="employeeNo" label="工号" min-width="120" />
            <el-table-column prop="username" label="用户名" min-width="150" />
            <el-table-column label="所属部门" min-width="180">
              <template #default="scope">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>{{ scope.row.departmentName }}</span>
                  <el-tag 
                    v-if="isDepartmentLeader(scope.row)" 
                    type="warning" 
                    size="small"
                  >
                    负责人
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="角色/状态" min-width="200">
              <template #default="scope">
                <template v-if="scope.row.type === 'workpost'">
                  <el-tag size="small" type="warning" v-if="scope.row.workPostData?.status === 'vacant'">空缺</el-tag>
                  <el-tag size="small" type="success" v-else>在岗</el-tag>
                </template>
                <template v-else>
                  <!-- 显示用户在岗/未分配/无岗位状态 -->
                  <div style="display:inline-block; margin-right:8px">
                    <template v-if="getUserWorkPostData(scope.row)">
                      <el-tag size="small" type="success">在岗</el-tag>
                    </template>
                    <template v-else-if="scope.row.positionId">
                      <el-tag size="small" type="warning">未分配岗位</el-tag>
                    </template>
                    <template v-else>
                      <el-tag size="small" type="info">无岗位</el-tag>
                    </template>
                  </div>
                  <el-tag 
                    v-for="roleItem in getRoleItems(scope.row.roles)" 
                    :key="roleItem.roleId" 
                    size="small" 
                    style="margin-right: 5px; margin-bottom: 5px"
                  >
                    {{ getRoleName(roleItem.roleId) }}
                    <span v-if="roleItem.expiryStart || roleItem.expiryEnd" class="role-expiry">
                      ({{ formatDateTime(roleItem.expiryStart) }} ~ {{ formatDateTime(roleItem.expiryEnd) }})
                    </span>
                  </el-tag>
                </template>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="160" fixed="right">
              <template #default="scope">
                <div class="action-buttons">
                  <template v-if="scope.row.type === 'workpost'">
                    <el-button type="primary" size="small" @click="openAssignDialog(scope.row)">分配</el-button>
                  </template>
                  <template v-else>
                    <el-button type="primary" size="small" @click="handleEditUser(scope.row)" style="margin-right:6px">编辑</el-button>
                    <el-dropdown trigger="click">
                      <span class="more-link compact">
                        更多
                        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item 
                            v-if="!isDepartmentLeader(scope.row)"
                            @click="handleSetLeader(scope.row)"
                          >
                            设置负责人
                          </el-dropdown-item>
                          <el-dropdown-item 
                            v-else
                            @click="handleRemoveLeader(scope.row)"
                          >
                            取消负责人
                          </el-dropdown-item>
                          <el-dropdown-item 
                            @click="handleRemoveFromDept(scope.row)"
                            divided
                          >
                            移除
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </template>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </div>

    <!-- 为部门添加员工对话框 -->
    <el-dialog
      v-model="addEmployeeDialogVisible"
      title="为部门添加员工"
      width="600px"
    >
      <div class="add-employee-container">
        <el-form-item label="选择部门">
          <el-select
            v-model="selectedDeptForAdd"
            placeholder="请选择部门"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option-group
              v-for="group in departmentOptions"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="dept in group.options"
                :key="dept.id"
                :label="dept.label"
                :value="dept.id"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="选择员工">
          <el-select
            v-model="selectedUserIds"
            placeholder="请选择员工（可多选）"
            multiple
            filterable
            style="width: 100%"
            :disabled="!selectedDeptForAdd"
          >
            <el-option
              v-for="user in availableUsers"
              :key="user.id"
              :label="`${user.name} (${user.employeeNo}) - ${user.departmentName || '未分配部门'}`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addEmployeeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveAddEmployee">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 快速新增子节点对话框 -->
    <el-dialog
      v-model="quickAddDialogVisible"
      :title="quickAddDialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="quickAddFormData"
        :rules="quickAddFormRules"
        ref="quickAddFormRef"
        label-width="100px"
      >
        <el-form-item label="上级节点">
          <el-input 
            :value="quickAddFormData.parentName" 
            disabled
            placeholder="已固定父级节点"
          />
        </el-form-item>
        <el-form-item label="节点类型" prop="type">
          <el-select
            v-model="quickAddFormData.type"
            placeholder="请选择节点类型"
            style="width: 100%"
          >
            <el-option
              v-for="(typeInfo, typeKey) in getAvailableChildNodeTypes(quickAddFormData.parentId)"
              :key="typeKey"
              :label="typeInfo.label"
              :value="typeKey"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="节点名称" prop="name">
          <el-input v-model="quickAddFormData.name" placeholder="请输入节点名称" />
        </el-form-item>
        <el-form-item label="节点描述">
          <el-input 
            v-model="quickAddFormData.description" 
            type="textarea" 
            rows="3" 
            placeholder="请输入节点描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="quickAddDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleQuickAddSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入组织与员工 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入组织与员工"
      width="600px"
      append-to-body
    >
      <el-button type="primary" link @click="handleDownloadTemplate" style="margin-bottom: 6px">
        下载Excel模板
      </el-button>
      <el-alert
        title="请粘贴包含 departments 和 users 的 JSON 数据，导入后将覆盖当前展示的数据。"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 12px"
      />
      <el-upload
        drag
        action=""
        :auto-upload="false"
        :show-file-list="true"
        :limit="1"
        accept=".xlsx,.xls,.csv,.json"
        :on-change="handleImportFileChange"
        :before-upload="() => false"
        style="margin-bottom: 12px"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          拖拽或点击上传（占位，不触发真实上传）
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持xlsx/xls/csv/json，建议使用模板填写
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImport">导入</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 解散组织节点 -->
    <el-dialog
      v-model="dissolveDialogVisible"
      title="解散组织节点"
      width="520px"
    >
      <el-alert
        v-if="actionNode"
        :title="`解散后，节点「${actionNode.name}」及其下员工将整体转移到指定节点，并从树中移除。`"
        type="warning"
        show-icon
        :closable="false"
        style="margin-bottom: 12px"
      />
      <el-form label-width="120px">
        <el-form-item label="当前节点">
          <el-input :value="actionNode?.name" disabled />
        </el-form-item>
        <el-form-item label="员工迁移至">
          <el-tree-select
            v-model="dissolveForm.targetDeptId"
            :data="departments"
            :props="treeProps"
            placeholder="选择接收员工的节点"
            style="width: 100%"
            :filter-node-method="(val,data) => filterTargetNode(val,data, actionNode?.id)"
            :disabled="!actionNode"
            check-strictly
            clearable
            :render-after-expand="false"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dissolveDialogVisible = false">取消</el-button>
          <el-button type="primary" :disabled="!dissolveForm.targetDeptId" @click="handleDissolveConfirm">确认解散</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 移动组织节点 -->
    <el-dialog
      v-model="moveDialogVisible"
      title="移动组织节点"
      width="520px"
    >
      <el-alert
        v-if="actionNode"
        :title="`请选择新的上级节点，并确认类型符合层级规则。`"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 12px"
      />
      <el-form label-width="120px">
        <el-form-item label="当前节点">
          <el-input :value="actionNode?.name" disabled />
        </el-form-item>
        <el-form-item label="新的上级">
          <el-tree-select
            v-model="moveForm.newParentId"
            :data="departments"
            :props="treeProps"
            placeholder="选择新的上级节点"
            style="width: 100%"
            :filter-node-method="(val,data) => filterMoveTarget(val,data, actionNode?.id)"
            :disabled="!actionNode"
            check-strictly
            clearable
            :render-after-expand="false"
          />
        </el-form-item>
        <el-form-item label="节点类型">
          <el-select
            v-model="moveForm.newType"
            placeholder="请选择节点类型"
            style="width: 100%"
            :disabled="!actionNode"
          >
            <el-option
              v-for="type in getAllowedTypesForParent(moveForm.newParentId)"
              :key="type.value"
              :label="type.label"
              :value="type.value"
              :disabled="type.disabled"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="moveDialogVisible = false">取消</el-button>
          <el-button type="primary" :disabled="!actionNode || !moveForm.newType" @click="handleMoveConfirm">确认移动</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑员工对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editDialogTitle"
      width="800px"
      append-to-body
    >
      <el-form :model="editFormData" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editFormData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="工号" prop="employeeNo">
          <el-input v-model="editFormData.employeeNo" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="用户UID" prop="uid">
          <el-input v-model="editFormData.uid" placeholder="自动生成，不可编辑" disabled />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editFormData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="所属部门" prop="departmentId">
          <el-tree-select
            v-model="editFormData.departmentId"
            :data="departments"
            :props="treeProps"
            placeholder="请选择所属部门"
            style="width: 100%"
            check-strictly
            :render-after-expand="false"
            default-expand-all
          />
        </el-form-item>
        <el-form-item label="岗位" prop="positionId">
          <el-select 
            v-model="editFormData.positionId" 
            placeholder="请选择岗位" 
            style="width: 100%"
            filterable
          >
            <el-option 
              v-for="position in allPositions" 
              :key="position.id" 
              :label="position.name" 
              :value="position.id"
            >
              <span>{{ position.name }}</span>
              <span style="color: #909399; font-size: 12px; margin-left: 10px">
                {{ position.description }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-divider>个人信息</el-divider>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editFormData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editFormData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="editFormData.personalInfo.idCard" placeholder="请输入身份证号" maxlength="18" />
        </el-form-item>
        <el-form-item label="出生年月日" prop="birthday">
          <el-date-picker
            v-model="editFormData.personalInfo.birthday"
            type="date"
            placeholder="请选择出生年月日"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="editFormData.personalInfo.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="健康证号" prop="healthCertificateNo">
          <el-input v-model="editFormData.personalInfo.healthCertificateNo" placeholder="请输入健康证号" />
        </el-form-item>
        <el-form-item label="健康证有效期" prop="healthCertificateExpiry">
          <el-date-picker
            v-model="editFormData.personalInfo.healthCertificateExpiry"
            type="date"
            placeholder="请选择健康证有效期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="银行卡号" prop="bankCardNo">
          <el-input v-model="editFormData.personalInfo.bankCardNo" placeholder="请输入银行卡号" />
        </el-form-item>
        <el-form-item label="开户银行" prop="bankName">
          <el-input v-model="editFormData.personalInfo.bankName" placeholder="请输入开户银行" />
        </el-form-item>
        <el-form-item label="开户人姓名" prop="bankAccountName">
          <el-input v-model="editFormData.personalInfo.bankAccountName" placeholder="请输入开户人姓名" />
        </el-form-item>
        <el-form-item label="紧急联系人" prop="emergencyContact">
          <el-input v-model="editFormData.personalInfo.emergencyContact" placeholder="请输入紧急联系人姓名" />
        </el-form-item>
        <el-form-item label="紧急联系人电话" prop="emergencyContactPhone">
          <el-input v-model="editFormData.personalInfo.emergencyContactPhone" placeholder="请输入紧急联系人电话" />
        </el-form-item>
        <el-form-item label="家庭住址" prop="address">
          <el-input v-model="editFormData.personalInfo.address" type="textarea" :rows="2" placeholder="请输入家庭住址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleEditSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, UploadFilled, MoreFilled, ArrowDown } from '@element-plus/icons-vue'
import { users as mockUsers, departments as mockDepartments, roles as mockRoles, positions as mockPositions, workPosts as mockWorkPosts } from '../mock/data.js'

// Props
const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  departments: {
    type: Array,
    default: () => []
  },
  workPosts: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:users', 'edit-user', 'quick-add-child', 'update:departments', 'update:work-posts'])

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const currentDepartmentId = ref(null)
const currentDepartmentName = ref('')
const isAllExpanded = ref(false)
const treeRef = ref(null)
const addEmployeeDialogVisible = ref(false)
const selectedDeptForAdd = ref(null)
const selectedUserIds = ref([])

// 快速新增子节点对话框
const quickAddDialogVisible = ref(false)
const quickAddDialogTitle = ref('新增子节点')
const quickAddFormData = ref({
  id: '',
  name: '',
  type: '',
  parentId: '',
  parentName: '',
  children: [],
  description: ''
})
const isEdit = ref(false)

// 编辑员工对话框
const editDialogVisible = ref(false)
const editDialogTitle = ref('编辑员工')
const isEditUser = ref(false)
const editFormData = ref({
  id: '',
  name: '',
  employeeNo: '',
  uid: '',
  username: '',
  phone: '',
  email: '',
  departmentId: '',
  positionId: '',
  roles: [],
  personalInfo: {
    idCard: '',
    birthday: null,
    gender: '',
    healthCertificateNo: '',
    healthCertificateExpiry: null,
    bankCardNo: '',
    bankName: '',
    bankAccountName: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    address: ''
  }
})
const editFormRef = ref(null)

// 导入组织与员工
const importDialogVisible = ref(false)
const importFileName = ref('')
const dissolveDialogVisible = ref(false)
const moveDialogVisible = ref(false)
const actionNode = ref(null)
const dissolveForm = ref({
  targetDeptId: ''
})
const moveForm = ref({
  newParentId: '',
  newType: ''
})

// 数据
const users = ref(mockUsers)
const departments = ref(mockDepartments)
const roles = ref(mockRoles)
const positions = ref(mockPositions)
const workPosts = ref(mockWorkPosts || [])

// 所有岗位
const allPositions = computed(() => positions.value)

// 编辑表单验证规则
const editFormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  employeeNo: [
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ]
}

// 树形配置
const treeProps = {
  children: 'children',
  label: 'name',
  value: 'id',
  isLeaf: (data) => {
    // 员工节点和没有子节点的部门节点都是叶子节点
    return data.isEmployee || !data.children || data.children.length === 0
  }
}

// 计算属性 - 将员工作为子节点添加到树结构中（原始树）
const rawTreeData = computed(() => {
  const processTree = (deptList) => {
    return deptList.map(dept => {
      // 获取该部门的直接员工（不包括子部门的员工）
      const directUsers = getDepartmentUsers(dept.id)
      
      // 获取该部门的工作岗位（工作岗位可能为空岗或已分配人员）
      const directWorkPosts = (workPosts.value || []).filter(w => w.departmentId === dept.id)
      // 将工作岗位按是否有 assignedUserId 分组
      const assignedWorkPostsMap = {}
      const vacantWorkPosts = []
      directWorkPosts.forEach(wp => {
        if (wp.assignedUserId) {
          assignedWorkPostsMap[wp.assignedUserId] = wp
        } else {
          vacantWorkPosts.push(wp)
        }
      })
      
      // 处理子部门
      let childDepartments = []
      if (dept.children && dept.children.length > 0) {
        childDepartments = processTree(dept.children)
      }
      
      // 将工作岗位作为虚拟子节点（显示岗位编号与状态）
      const workPostNodes = vacantWorkPosts.map(wp => {
        // try to resolve position by id first, then by mainPositionCode as fallback
        let pos = positions.value.find(p => p.id === wp.mainPositionId)
        if (!pos && wp.mainPositionCode) {
          pos = positions.value.find(p => p.code === wp.mainPositionCode)
        }
        if (!pos && !wp.mainPositionName) {
          console.warn(`[OrgView] workPost no matching position`, {
            workPostId: wp.id,
            mainPositionId: wp.mainPositionId,
            mainPositionCode: wp.mainPositionCode,
            positionsIds: positions.value.map(p => ({ id: p.id, code: p.code, name: p.name }))
          })
        }
        const displayName = wp.mainPositionName || pos?.name || wp.postCode || wp.mainPositionCode || '岗位'
        return {
          id: `workpost-${wp.id}`,
          name: displayName,
          positionName: pos ? pos.name : '',
          type: 'workpost',
          isWorkPost: true,
          workPostData: wp,
          parentId: dept.id,
          // children kept undefined
          children: undefined,
          userCount: 0
        }
      })

      // 将员工作为虚拟子节点（只显示直接属于该部门的员工）
      const employeeNodes = directUsers.map(user => {
        const assignedWp = assignedWorkPostsMap[user.id]
        return {
          id: `employee-${user.id}`,
          name: user.name,
          type: 'employee',
          isEmployee: true,
          employeeId: user.id,
          employeeData: user,
          positionName: user.positionName,
          parentId: dept.id,
          children: undefined, // 员工节点没有子节点
          userCount: 0,
          workPostData: assignedWp || null
        }
      })
      
      // 合并工作岗位、员工和子部门：优先展示工作岗位与员工，然后子节点
      const allChildren = [...workPostNodes, ...employeeNodes, ...childDepartments]
      
      // 计算总人数（包括子部门的人数）
      const childrenUserCount = childDepartments.reduce((sum, child) => sum + (child.userCount || 0), 0)
      const totalUserCount = directUsers.length + childrenUserCount
      
      return {
        ...dept,
        children: allChildren.length > 0 ? allChildren : undefined,
        userCount: totalUserCount
      }
    })
  }
  
  return processTree(departments.value)
})

// 过滤后的树（搜索时只展示相关节点）
const displayTreeData = computed(() => {
  if (!searchKeyword.value) return rawTreeData.value
  const keyword = searchKeyword.value.toLowerCase()

  const matchNode = (node) => {
    // 匹配部门名、员工名或岗位名/岗位编号
    const nameMatch = node.name?.toLowerCase().includes(keyword)
    const positionMatch = (node.positionName || node.workPostData?.postCode || node.workPostData?.mainPositionName)?.toLowerCase().includes(keyword)
    const employeeMatch = node.isEmployee && (nameMatch || positionMatch)
    const deptMatch = !node.isEmployee && (nameMatch || positionMatch)

    let childrenMatches = []
    if (node.children && node.children.length > 0) {
      childrenMatches = node.children
        .map(child => matchNode(child))
        .filter(Boolean)
    }

    if (employeeMatch || deptMatch || childrenMatches.length > 0) {
      return {
        ...node,
        children: childrenMatches.length > 0 ? childrenMatches : undefined
      }
    }
    return null
  }

  return rawTreeData.value
    .map(node => matchNode(node))
    .filter(Boolean)
})

// 默认展开的根节点（一级展开）
const defaultExpandedKeys = computed(() => {
  return departments.value
    .filter(dept => !dept.parentId)
    .map(dept => dept.id)
})

const filteredUsers = computed(() => {
  let result = users.value
  
  // 按部门过滤
  if (currentDepartmentId.value) {
    result = result.filter(user => {
      // 检查用户是否属于当前部门或其子部门
      return isUserInDepartment(user, currentDepartmentId.value)
    })
  }
  
  // 按关键词搜索（支持姓名/工号/用户名/岗位名/工作岗位编号）
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(user => {
      const posName = (user.positionName || '').toLowerCase()
      const wp = getUserWorkPostData(user)
      const wpPosName = (wp?.mainPositionName || wp?.positionName || '').toLowerCase()
      const wpCode = (wp?.postCode || '').toLowerCase()
      return (
        user.name?.toLowerCase().includes(keyword) ||
        user.employeeNo?.toLowerCase().includes(keyword) ||
        user.username?.toLowerCase().includes(keyword) ||
        posName.includes(keyword) ||
        wpPosName.includes(keyword) ||
        wpCode.includes(keyword)
      )
    })
  }
  
  return result
})

const availableUsers = computed(() => {
  // 返回所有用户，包括已分配和未分配的
  return users.value
})

// 部门选项（用于下拉选择）
const departmentOptions = computed(() => {
  const buildOptions = (deptList, level = 0, prefix = '') => {
    const options = []
    deptList.forEach(dept => {
      const indent = '　'.repeat(level)
      const label = `${indent}${dept.name} [${getNodeTypeLabel(dept.type)}]`
      options.push({
        id: dept.id,
        label: label,
        type: dept.type,
        name: dept.name
      })
      if (dept.children && dept.children.length > 0) {
        options.push(...buildOptions(dept.children, level + 1, prefix))
      }
    })
    return options
  }
  
  // 按类型分组
  const grouped = {
    headquarters: [],
    subsidiary: [],
    branch: [],
    store: [],
    department: [],
    virtualTeam: []
  }
  
  const allOptions = buildOptions(departments.value)
  allOptions.forEach(opt => {
    if (grouped[opt.type]) {
      grouped[opt.type].push(opt)
    }
  })
  
  const result = []
  if (grouped.headquarters.length > 0) {
    result.push({ label: '总公司', options: grouped.headquarters })
  }
  if (grouped.subsidiary.length > 0) {
    result.push({ label: '子公司', options: grouped.subsidiary })
  }
  if (grouped.branch.length > 0) {
    result.push({ label: '分公司', options: grouped.branch })
  }
  if (grouped.store.length > 0) {
    result.push({ label: '门店', options: grouped.store })
  }
  if (grouped.department.length > 0) {
    result.push({ label: '部门', options: grouped.department })
  }
  if (grouped.virtualTeam.length > 0) {
    result.push({ label: '虚拟团队', options: grouped.virtualTeam })
  }
  
  return result
})

const highlightedUserIds = computed(() => {
  if (!searchKeyword.value) return []
  
  const keyword = searchKeyword.value.toLowerCase()
  return users.value
    .filter(user => {
      return (
        user.name?.toLowerCase().includes(keyword) ||
        user.employeeNo?.toLowerCase().includes(keyword) ||
        user.username?.toLowerCase().includes(keyword)
      )
    })
    .map(user => user.id)
})

// 方法
const getDepartmentUserCount = (departmentId) => {
  return users.value.filter(user => user.departmentId === departmentId).length
}

const isUserInDepartment = (user, departmentId) => {
  if (user.departmentId === departmentId) return true
  
  // 检查是否在子部门中
  const findDepartment = (deptList, targetId) => {
    for (const dept of deptList) {
      if (dept.id === departmentId) {
        // 找到目标部门，检查用户是否在其子部门中
        const checkChildren = (children) => {
          if (!children) return false
          for (const child of children) {
            if (user.departmentId === child.id) return true
            if (checkChildren(child.children)) return true
          }
          return false
        }
        return checkChildren(dept.children)
      }
      if (dept.children && dept.children.length > 0) {
        if (findDepartment(dept.children, targetId)) return true
      }
    }
    return false
  }
  
  return findDepartment(departments.value)
}

const getDepartmentUsers = (departmentId) => {
  // 获取直接属于该部门的员工（不包括子部门）
  return users.value.filter(user => user.departmentId === departmentId)
}

const isHighlightedUser = (userId) => {
  return highlightedUserIds.value.includes(userId)
}

const getHighlightedUsers = (departmentId) => {
  if (!searchKeyword.value) return []
  
  return highlightedUserIds.value.filter(userId => {
    const user = users.value.find(u => u.id === userId)
    return user && isUserInDepartment(user, departmentId)
  })
}

const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user?.name || ''
}

// 获取用户对应的工作岗位编号（如果有）
const getUserWorkPostCode = (user) => {
  if (!user || !workPosts.value) return ''
  const wp = workPosts.value.find(w => w.assignedUserId === user.id)
  return wp ? wp.postCode : ''
}

// 弹窗：为工作岗位分配人员
const assignDialogVisible = ref(false)
const assignTargetWorkPost = ref(null)
const assignSelectedUser = ref('')

const openAssignDialog = (workPostRow) => {
  assignTargetWorkPost.value = workPostRow.workPostData || null
  assignSelectedUser.value = ''
  assignDialogVisible.value = true
}

const availableUsersForAssign = computed(() => {
  // 返回未被分配到任何工作岗位的用户
  const assignedUserIds = new Set((workPosts.value || []).filter(w => w.assignedUserId).map(w => w.assignedUserId))
  return users.value.filter(u => !assignedUserIds.has(u.id))
})

const handleAssignConfirm = () => {
  if (!assignTargetWorkPost.value || !assignSelectedUser.value) {
    ElMessage.warning('请选择要分配的员工')
    return
  }
  // 更新 workPosts（若存在父组件同步会通过事件更新）
  const wpIndex = workPosts.value.findIndex(w => w.id === assignTargetWorkPost.value.id)
  if (wpIndex !== -1) {
    workPosts.value[wpIndex] = {
      ...workPosts.value[wpIndex],
      assignedUserId: assignSelectedUser.value,
      status: 'filled'
    }
  }
  // 更新用户的部门/岗位信息
  const userIndex = users.value.findIndex(u => u.id === assignSelectedUser.value)
  if (userIndex !== -1) {
    users.value[userIndex] = {
      ...users.value[userIndex],
      departmentId: assignTargetWorkPost.value.departmentId || users.value[userIndex].departmentId,
      departmentName: getDepartmentName(assignTargetWorkPost.value.departmentId) || users.value[userIndex].departmentName,
      positionId: assignTargetWorkPost.value.mainPositionId || users.value[userIndex].positionId,
      positionName: getPositionName(assignTargetWorkPost.value.mainPositionId) || users.value[userIndex].positionName
    }
  }
  // 通知父组件保存更新
  emit('update:users', users.value)
  emit('update:work-posts', workPosts.value)
  assignDialogVisible.value = false
  ElMessage.success('分配成功')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const getRoleItems = (roles) => {
  if (!roles || roles.length === 0) return []
  return roles.map(role => {
    if (typeof role === 'string') {
      return { roleId: role, expiryDate: null }
    }
    return role
  })
}

const getRoleName = (roleId) => {
  const role = roles.value.find(r => r.id === roleId)
  return role?.name || roleId
}

// 获取用户对应的工作岗位对象（如果有）
const getUserWorkPostData = (user) => {
  if (!user || !workPosts.value) return null
  return workPosts.value.find(w => w.assignedUserId === user.id) || null
}

// 根据 workPost 对象解析岗位名称（优先按 id，再按 code 回退）
const getPositionNameFromWorkPost = (workPost) => {
  if (!workPost) return ''
  if (workPost.mainPositionName) return workPost.mainPositionName
  let pos = positions.value.find(p => p.id === workPost.mainPositionId)
  if (!pos && workPost.mainPositionCode) {
    pos = positions.value.find(p => p.code === workPost.mainPositionCode)
  }
  return pos ? pos.name : ''
}

// 节点类型定义（与DepartmentManagement保持一致）
const nodeTypes = {
  headquarters: { label: '总公司', value: 'headquarters' },
  company: { label: '公司', value: 'company' },
  subsidiary: { label: '子公司', value: 'subsidiary' },
  branch: { label: '分公司', value: 'branch' },
  store: { label: '门店', value: 'store' },
  department: { label: '部门', value: 'department' },
  virtualTeam: { label: '虚拟团队', value: 'virtualTeam' }
}

// 节点类型层级规则
const nodeTypeRules = {
  headquarters: { allowedChildren: ['subsidiary', 'branch', 'store', 'department', 'virtualTeam'] },
  subsidiary: { allowedChildren: ['branch', 'store', 'department', 'virtualTeam'] },
  branch: { allowedChildren: ['store', 'department', 'virtualTeam'] },
  store: { allowedChildren: ['department'] },
  department: { allowedChildren: ['department'] },
  virtualTeam: { allowedChildren: [] },
  company: { allowedChildren: ['subsidiary', 'branch', 'store', 'department', 'virtualTeam'] }
}

// 获取节点类型标签
const getNodeTypeLabel = (type) => {
  return nodeTypes[type]?.label || type || '部门'
}

// 获取节点类型标签颜色
const getNodeTypeTagType = (type) => {
  const typeMap = {
    headquarters: 'danger',
    company: 'warning',
    subsidiary: 'success',
    branch: 'info',
    store: 'primary',
    department: '',
    virtualTeam: 'warning'
  }
  return typeMap[type] || ''
}

const handleNodeClick = (data) => {
  // 如果是员工节点或工作岗位节点，不切换到部门视图（视为单个员工/空岗交互）
  if (data.isEmployee || data.isWorkPost) {
    return
  }
  currentDepartmentId.value = data.id
  currentDepartmentName.value = data.name
}

const handleSearch = () => {
  // 搜索时自动展开到包含匹配员工的节点
  if (searchKeyword.value && treeRef.value) {
    // 找到所有包含匹配员工的部门ID
    const matchedDeptIds = new Set()
    highlightedUserIds.value.forEach(userId => {
      const user = users.value.find(u => u.id === userId)
      if (user && user.departmentId) {
        matchedDeptIds.add(user.departmentId)
        // 同时添加所有父部门
        const addParentDepts = (deptId, deptList) => {
          for (const dept of deptList) {
            if (dept.id === deptId) {
              if (dept.parentId) {
                matchedDeptIds.add(dept.parentId)
                addParentDepts(dept.parentId, deptList)
              }
              break
            }
            if (dept.children && dept.children.length > 0) {
              addParentDepts(deptId, dept.children)
            }
          }
        }
        // 扁平化部门列表以便查找
        const flattenDepts = (deptList) => {
          let result = []
          deptList.forEach(dept => {
            result.push(dept)
            if (dept.children && dept.children.length > 0) {
              result = result.concat(flattenDepts(dept.children))
            }
          })
          return result
        }
        const flatDepts = flattenDepts(departments.value)
        addParentDepts(user.departmentId, flatDepts)
      }
    })
    
    // 展开所有匹配的部门节点
    if (matchedDeptIds.size > 0 && treeRef.value) {
      matchedDeptIds.forEach(deptId => {
        treeRef.value.store.getNode(deptId)?.expand()
      })
    }
  } else if (!searchKeyword.value && treeRef.value) {
    // 清除搜索时，恢复默认展开状态
    isAllExpanded.value = false
  }
}

// 搜索结果时展开命中的节点
const expandMatchedNodes = () => {
  if (!treeRef.value) return
  const expandRecursively = (nodes) => {
    nodes.forEach(item => {
      const treeNode = treeRef.value.store.getNode(item.id)
      if (treeNode) {
        treeNode.expanded = true
      }
      if (item.children && item.children.length > 0) {
        expandRecursively(item.children)
      }
    })
  }
  expandRecursively(displayTreeData.value)
}

watch(
  () => ({ keyword: searchKeyword.value, tree: displayTreeData.value }),
  ({ keyword, tree }) => {
    if (keyword && tree && tree.length) {
      nextTick(() => expandMatchedNodes())
    }
  },
  { deep: true }
)

const expandAll = () => {
  isAllExpanded.value = !isAllExpanded.value
  if (treeRef.value) {
    const expandNode = (node) => {
      if (node.expanded !== undefined) {
        node.expanded = isAllExpanded.value
      }
      if (node.childNodes) {
        node.childNodes.forEach(child => expandNode(child))
      }
    }
    treeRef.value.store._getAllNodes().forEach(node => expandNode(node))
  }
}

const handleAddEmployeeToDept = () => {
  selectedDeptForAdd.value = null
  selectedUserIds.value = []
  addEmployeeDialogVisible.value = true
}

const handleSaveAddEmployee = () => {
  if (!selectedDeptForAdd.value) {
    ElMessage.warning('请选择部门')
    return
  }
  
  if (selectedUserIds.value.length === 0) {
    ElMessage.warning('请选择至少一个员工')
    return
  }
  
  // 从部门选项中查找部门信息
  const findDepartmentInfo = (deptId) => {
    for (const group of departmentOptions.value) {
      const dept = group.options.find(opt => opt.id === deptId)
      if (dept) {
        return { name: dept.name, type: dept.type }
      }
    }
    return null
  }
  
  // 如果选项中没有，从树形结构中查找
  const getDepartmentNameFromTree = (deptId, deptList) => {
    for (const dept of deptList) {
      if (dept.id === deptId) return dept.name
      if (dept.children && dept.children.length > 0) {
        const name = getDepartmentNameFromTree(deptId, dept.children)
        if (name) return name
      }
    }
    return ''
  }
  
  const deptInfo = findDepartmentInfo(selectedDeptForAdd.value)
  const deptName = deptInfo ? deptInfo.name : getDepartmentNameFromTree(selectedDeptForAdd.value, departments.value)
  
  if (!deptName) {
    ElMessage.error('未找到部门信息')
    return
  }
  
  // 更新用户部门
  const updatedUsers = users.value.map(user => {
    if (selectedUserIds.value.includes(user.id)) {
      return {
        ...user,
        departmentId: selectedDeptForAdd.value,
        departmentName: deptName
      }
    }
    return user
  })
  
  users.value = updatedUsers
  emit('update:users', updatedUsers)
  addEmployeeDialogVisible.value = false
  ElMessage.success('员工添加成功')
  
  // 刷新当前视图
  if (currentDepartmentId.value === selectedDeptForAdd.value) {
    handleNodeClick({ id: selectedDeptForAdd.value, name: deptName })
  }
}

const handleEditUser = (user) => {
  // 打开编辑对话框
  isEditUser.value = true
  editDialogTitle.value = '编辑员工'
  const ensureUid = () => `UID-${Date.now()}`
  editFormData.value = {
    id: user.id,
    name: user.name,
    employeeNo: user.employeeNo,
    uid: user.uid || ensureUid(),
    username: user.username,
    phone: user.phone || '',
    email: user.email || '',
    departmentId: user.departmentId || '',
    positionId: user.positionId || '',
    roles: user.roles || [],
    personalInfo: user.personalInfo || {
      idCard: '',
      birthday: null,
      gender: '',
      healthCertificateNo: '',
      healthCertificateExpiry: null,
      bankCardNo: '',
      bankName: '',
      bankAccountName: '',
      emergencyContact: '',
      emergencyContactPhone: '',
      address: ''
    }
  }
  editDialogVisible.value = true
}

const handleRemoveFromDept = (user) => {
  ElMessageBox.confirm('确定要将该员工移出部门吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const updatedUser = {
      ...user,
      departmentId: '',
      departmentName: ''
    }
    
    const updatedUsers = users.value.map(u => {
      if (u.id === user.id) {
        return updatedUser
      }
      return u
    })
    
    users.value = updatedUsers
    emit('update:users', updatedUsers)
    ElMessage.success('员工已移出部门')
  }).catch(() => {})
}

// 判断用户是否为当前部门的负责人
const isDepartmentLeader = (user) => {
  if (!currentDepartmentId.value || !user.departmentId) {
    return false
  }
  if (user.departmentId !== currentDepartmentId.value) {
    return false
  }
  const dept = getDepartmentById(currentDepartmentId.value)
  return dept && dept.leaderId === user.id
}

// 更新部门树中的部门信息
const updateDepartmentInTree = (tree, deptId, updates) => {
  return tree.map(node => {
    if (node.id === deptId) {
      return {
        ...node,
        ...updates
      }
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateDepartmentInTree(node.children, deptId, updates)
      }
    }
    return node
  })
}

// 设置负责人
const handleSetLeader = (user) => {
  if (!currentDepartmentId.value) {
    ElMessage.warning('请先选择部门节点')
    return
  }
  if (user.departmentId !== currentDepartmentId.value) {
    ElMessage.warning('该员工不属于当前部门')
    return
  }
  
  ElMessageBox.confirm(`确定要将 ${user.name} 设置为当前部门的负责人吗？`, '设置负责人', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const updatedDepartments = updateDepartmentInTree(departments.value, currentDepartmentId.value, {
      leaderId: user.id
    })
    departments.value = updatedDepartments
    emit('update:departments', updatedDepartments)
    ElMessage.success(`已将 ${user.name} 设置为负责人`)
  }).catch(() => {})
}

// 取消负责人
const handleRemoveLeader = (user) => {
  if (!currentDepartmentId.value) {
    ElMessage.warning('请先选择部门节点')
    return
  }
  
  ElMessageBox.confirm(`确定要取消 ${user.name} 的负责人身份吗？`, '取消负责人', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const updatedDepartments = updateDepartmentInTree(departments.value, currentDepartmentId.value, {
      leaderId: null
    })
    departments.value = updatedDepartments
    emit('update:departments', updatedDepartments)
    ElMessage.success('已取消负责人身份')
  }).catch(() => {})
}

// 判断是否可以添加子节点
const canAddChildNode = (type) => {
  const allowed = nodeTypeRules[type]?.allowedChildren || []
  return allowed.length > 0
}

// 快速新增子节点
const handleQuickAddChild = (nodeData) => {
  // 在当前页面打开新增子节点对话框
  isEdit.value = false
  quickAddDialogTitle.value = '新增子节点'
  quickAddFormData.value = {
    id: `dept-${Date.now()}`,
    name: '',
    type: '',
    parentId: nodeData.id,
    parentName: nodeData.name,
    children: [],
    description: ''
  }
  quickAddDialogVisible.value = true
}

// 快速新增表单验证规则
const quickAddFormRules = {
  type: [
    { required: true, message: '请选择节点类型', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入节点名称', trigger: 'blur' },
    { min: 1, max: 50, message: '节点名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 获取可用的子节点类型
const getAvailableChildNodeTypes = (parentId) => {
  if (!parentId) {
    return {}
  }
  
  // 查找父节点（递归查找）
  const findParentNode = (deptList, targetId) => {
    for (const dept of deptList) {
      if (dept.id === targetId) {
        return dept
      }
      if (dept.children && dept.children.length > 0) {
        const found = findParentNode(dept.children, targetId)
        if (found) return found
      }
    }
    return null
  }
  
  const parentNode = findParentNode(departments.value, parentId)
  if (!parentNode || !parentNode.type) {
    ElMessage.warning('未找到父节点')
    return {}
  }
  
  const allowedTypes = nodeTypeRules[parentNode.type]?.allowedChildren || []
  const result = {}
  allowedTypes.forEach(typeKey => {
    if (nodeTypes[typeKey]) {
      result[typeKey] = nodeTypes[typeKey]
    }
  })
  
  return result
}

// 快速新增提交
const handleQuickAddSubmit = () => {
  if (!quickAddFormRef.value) return
  
  quickAddFormRef.value.validate((valid) => {
    if (valid) {
      // 验证层级关系
      const findParent = (deptList, parentId) => {
        for (const dept of deptList) {
          if (dept.id === parentId) {
            return dept
          }
          if (dept.children && dept.children.length > 0) {
            const found = findParent(dept.children, parentId)
            if (found) return found
          }
        }
        return null
      }
      
      const parent = findParent(departments.value, quickAddFormData.value.parentId)
      if (parent) {
        const allowedTypes = nodeTypeRules[parent.type]?.allowedChildren || []
        if (!allowedTypes.includes(quickAddFormData.value.type)) {
          ElMessage.error(`"${getNodeTypeLabel(parent.type)}"下不能创建"${getNodeTypeLabel(quickAddFormData.value.type)}"类型的子节点`)
          return
        }
      }
      
      // 添加新节点到树结构
      const addDepartmentToTree = (tree, department) => {
        if (!department.parentId) {
          return [...tree, department]
        }
        
        return tree.map(node => {
          if (node.id === department.parentId) {
            return {
              ...node,
              children: [...(node.children || []), department]
            }
          }
          if (node.children && node.children.length) {
            return {
              ...node,
              children: addDepartmentToTree(node.children, department)
            }
          }
          return node
        })
      }
      
      const newDepartment = {
        id: quickAddFormData.value.id,
        name: quickAddFormData.value.name,
        type: quickAddFormData.value.type,
        parentId: quickAddFormData.value.parentId,
        children: [],
        description: quickAddFormData.value.description || ''
      }
      
      const newDepartments = addDepartmentToTree(departments.value, newDepartment)
      departments.value = newDepartments
      emit('update:departments', newDepartments)
      
      quickAddDialogVisible.value = false
      ElMessage.success('子节点新增成功')
    }
  })
}

const quickAddFormRef = ref(null)

// 导入组织与员工
const handleImport = () => {
  ElMessage.info('示例占位：实际导入逻辑尚未接通')
  importDialogVisible.value = false
}

// 选择文件（占位）
const handleImportFileChange = (file) => {
  importFileName.value = file.name || ''
  ElMessage.info('已选择文件，导入逻辑未接通')
}

// 下载Excel模板（占位，辅助说明）
const handleDownloadTemplate = () => {
  const deptHeader = ['节点名称', '节点类型', '上级节点ID(可空)', '描述']
  const deptSample = [
    ['总公司', 'headquarters', '', '根节点示例'],
    ['华东子公司', 'subsidiary', 'dept-1', '子公司示例'],
    ['上海分公司', 'branch', 'dept-1-1', '分公司示例']
  ]
  const userHeader = ['姓名', '工号', '用户名', '所属部门ID', '岗位ID']
  const userSample = [
    ['张三', 'E1001', 'zhangsan', 'dept-1-1-1', 'pos-1'],
    ['李四', 'E1002', 'lisi', 'dept-1-3', 'pos-2']
  ]
  const csvContent = [
    ['【部门表】'],
    deptHeader,
    ...deptSample,
    [''],
    ['【员工表】'],
    userHeader,
    ...userSample
  ].map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '组织与员工导入模板.csv'
  link.click()
  URL.revokeObjectURL(url)
}

// 打开解散对话框
const openDissolveDialog = (node) => {
  actionNode.value = node
  dissolveForm.value.targetDeptId = ''
  dissolveDialogVisible.value = true
}

// 打开移动对话框
const openMoveDialog = (node) => {
  actionNode.value = node
  moveForm.value = {
    newParentId: node.parentId || '',
    newType: node.type || 'department'
  }
  moveDialogVisible.value = true
}

// 收集子树所有ID
const collectSubtreeIds = (node) => {
  const ids = []
  const walk = (n) => {
    ids.push(n.id)
    if (n.children && n.children.length) {
      n.children.forEach(child => walk(child))
    }
  }
  walk(node)
  return ids
}

// 判断 candidateId 是否在 targetParentId 子树下
const isDescendant = (candidateId, targetParentId, tree = departments.value) => {
  const dfs = (list) => {
    for (const item of list) {
      if (item.id === targetParentId) {
        const ids = collectSubtreeIds(item)
        return ids.includes(candidateId)
      }
      if (item.children && item.children.length) {
        const found = dfs(item.children)
        if (found) return true
      }
    }
    return false
  }
  return dfs(tree)
}

// 从树中删除节点
const removeDepartmentFromTree = (tree, targetId) => {
  return tree
    .filter(node => node.id !== targetId)
    .map(node => ({
      ...node,
      children: node.children ? removeDepartmentFromTree(node.children, targetId) : undefined
    }))
}

// 获取节点
const getDepartmentById = (deptId, tree = departments.value) => {
  for (const node of tree) {
    if (node.id === deptId) return node
    if (node.children && node.children.length) {
      const found = getDepartmentById(deptId, node.children)
      if (found) return found
    }
  }
  return null
}

// 获取部门名称（简单版，返回节点名称）
const getDepartmentName = (deptId) => {
  if (!deptId) return ''
  const node = getDepartmentById(deptId)
  return node ? node.name : ''
}

// 过滤目标节点（解散/移动时避免选择自身及子级）
const filterTargetNode = (value, data, currentId) => {
  if (currentId && (data.id === currentId || isDescendant(data.id, currentId))) {
    return false
  }
  if (!value) return true
  return data.name?.includes(value)
}

const filterMoveTarget = (value, data, currentId) => {
  if (currentId && (data.id === currentId || isDescendant(data.id, currentId))) {
    return false
  }
  if (!value) return true
  return data.name?.includes(value)
}

// 获取上级允许的类型
const getAllowedTypesForParent = (parentId) => {
  if (!parentId) {
    return Object.values(nodeTypes).map(t => ({ ...t, disabled: t.value !== 'headquarters' }))
  }
  const parent = getDepartmentById(parentId)
  if (!parent) {
    return Object.values(nodeTypes)
  }
  const allowed = nodeTypeRules[parent.type]?.allowedChildren || []
  return Object.values(nodeTypes).map(t => ({
    ...t,
    disabled: !allowed.includes(t.value)
  }))
}

// 确认解散
const handleDissolveConfirm = () => {
  if (!actionNode.value || !dissolveForm.value.targetDeptId) return
  const targetDept = getDepartmentById(dissolveForm.value.targetDeptId)
  if (!targetDept) {
    ElMessage.error('未找到接收节点')
    return
  }
  const sourceNode = getDepartmentById(actionNode.value.id)
  if (!sourceNode) return
  const ids = collectSubtreeIds(sourceNode)
  const updatedUsers = users.value.map(user => {
    if (ids.includes(user.departmentId)) {
      return {
        ...user,
        departmentId: targetDept.id,
        departmentName: targetDept.name
      }
    }
    return user
  })
  users.value = updatedUsers
  emit('update:users', updatedUsers)
  const newDepartments = removeDepartmentFromTree(departments.value, actionNode.value.id)
  departments.value = newDepartments
  emit('update:departments', newDepartments)
  dissolveDialogVisible.value = false
  actionNode.value = null
  ElMessage.success('解散完成，员工已迁移')
}

// 将节点移动到新父节点
const moveDepartmentInTree = (tree, targetId, newParentId, newType) => {
  let movedNode = null
  const detach = (list) => {
    const result = []
    for (const node of list) {
      if (node.id === targetId) {
        movedNode = { ...node }
        continue
      }
      const newChildren = node.children ? detach(node.children) : undefined
      result.push({ ...node, children: newChildren })
    }
    return result
  }
  const withoutNode = detach(tree)
  if (!movedNode) return tree
  movedNode = {
    ...movedNode,
    parentId: newParentId || null,
    type: newType || movedNode.type
  }
  if (!newParentId) {
    return [...withoutNode, movedNode]
  }
  const attach = (list) => {
    return list.map(node => {
      if (node.id === newParentId) {
        return {
          ...node,
          children: [...(node.children || []), movedNode]
        }
      }
      if (node.children && node.children.length) {
        return {
          ...node,
          children: attach(node.children)
        }
      }
      return node
    })
  }
  return attach(withoutNode)
}

// 确认移动
const handleMoveConfirm = () => {
  if (!actionNode.value) return
  const newParentId = moveForm.value.newParentId || null
  const newType = moveForm.value.newType || actionNode.value.type
  if (newParentId) {
    const parent = getDepartmentById(newParentId)
    if (parent) {
      const allowed = nodeTypeRules[parent.type]?.allowedChildren || []
      if (!allowed.includes(newType)) {
        ElMessage.error(`"${getNodeTypeLabel(parent.type)}"下不能挂载"${getNodeTypeLabel(newType)}"`)
      return
    }
      if (isDescendant(newParentId, actionNode.value.id)) {
        ElMessage.error('不能将节点移动到其子节点下')
        return
      }
    }
  } else if (newType !== 'headquarters') {
    ElMessage.error('根节点必须是总公司类型')
    return
  }
  const newDepartments = moveDepartmentInTree(departments.value, actionNode.value.id, newParentId, newType)
  departments.value = newDepartments
  emit('update:departments', newDepartments)
  moveDialogVisible.value = false
  actionNode.value = null
  ElMessage.success('节点移动完成')
}

// 编辑员工提交
const handleEditSubmit = () => {
  if (!editFormRef.value) return
  
  editFormRef.value.validate((valid) => {
    if (valid) {
      const dept = getDepartmentById(editFormData.value.departmentId)
      const position = allPositions.value.find(p => p.id === editFormData.value.positionId)
      
      const updatedUser = {
        ...editFormData.value,
        departmentName: dept ? dept.name : '',
        positionName: position ? position.name : ''
      }
      
      // 更新员工列表
      const updatedUsers = users.value.map(u => {
        if (u.id === updatedUser.id) {
          return updatedUser
        }
        return u
      })
      
      users.value = updatedUsers
      emit('update:users', updatedUsers)
      emit('edit-user', updatedUser)
      
      // 同步到用户中心（通过事件通知）
      // TODO: 实际项目中应该调用用户中心的API进行数据同步
      ElMessage.success('员工信息已更新，并同步到用户中心')
      editDialogVisible.value = false
    }
  })
}

// 生命周期
onMounted(() => {
  if (props.users && props.users.length > 0) {
    users.value = props.users
  }
  if (props.departments && props.departments.length > 0) {
    departments.value = props.departments
  }
  if (props.positions && props.positions.length > 0) {
    positions.value = props.positions
  }
  if (props.workPosts && props.workPosts.length > 0) {
    workPosts.value = props.workPosts
  }
})

// 当父组件的 workPosts 变化时同步
watch(() => props.workPosts, (val) => {
  workPosts.value = val || []
})

// 当父组件的 positions 变化时同步（确保新建岗位能被解析到）
watch(() => props.positions, (val) => {
  positions.value = val || []
})

// 组合显示项：先工作岗位（包括空缺），再员工
const displayedEntries = computed(() => {
  const deptFilterIds = currentDepartmentId.value ? collectSubtreeIds(getDepartmentById(currentDepartmentId.value) || { id: currentDepartmentId.value, children: [] }) : null

  // 选择符合部门（或无部门筛选）的工作岗位（只显示空缺岗位）
  let posts = (workPosts.value || []).filter(wp => {
    // only consider vacant, non-assigned posts that are already assigned to a department
    if (wp.assignedUserId) return false
    // exclude unallocated budget-only posts (departmentId == null) from the general employee list
    if (!wp.departmentId) return false
    if (!deptFilterIds) return true
    return deptFilterIds.includes(wp.departmentId)
  })

  // 搜索关键字过滤（如果有）
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    posts = posts.filter(p => {
      const pos = positions.value.find(pp => pp.id === p.mainPositionId)
      const posName = pos?.name?.toLowerCase() || ''
      const code = (p.postCode || '').toLowerCase()
      return posName.includes(kw) || code.includes(kw)
    })
  }

  const postsMapped = posts.map(p => {
    // resolve position by id then by code as fallback; prefer explicit mainPositionName on workPost
    let pos = positions.value.find(pp => pp.id === p.mainPositionId)
    if (!pos && p.mainPositionCode) {
      pos = positions.value.find(pp => pp.code === p.mainPositionCode)
    }
    if (!pos && !p.mainPositionName) {
      console.warn(`[OrgView] postsMapped no matching position`, {
        workPostId: p.id,
        mainPositionId: p.mainPositionId,
        mainPositionCode: p.mainPositionCode,
        positionsIds: positions.value.map(pp => ({ id: pp.id, code: pp.code }))
      })
    }
    const displayLabel = p.mainPositionName || pos?.name || p.postCode || p.mainPositionCode || '岗位'
    const positionName = p.mainPositionName || pos?.name || ''
    return {
      id: `wp-${p.id}`,
      type: 'workpost',
      displayLabel,
      positionName,
      workPostCode: p.postCode,
      workPostData: p,
      departmentName: getDepartmentName(p.departmentId)
    }
  })

  // 员工列表（复用 filteredUsers，已包含部门与关键词过滤）
  const usersList = filteredUsers.value.map(u => ({
    ...u,
    type: 'user'
  }))

  return [...postsMapped, ...usersList]
})
</script>

<style scoped>
.organization-employee-view {
  padding: 20px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.view-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 200px);
}

.tree-panel {
  width: 350px;
  flex-shrink: 0;
}

.employee-panel {
  flex: 1;
  min-width: 0;
}

.tree-card,
.employee-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-card :deep(.el-card__body),
.employee-card :deep(.el-card__body) {
  flex: 1;
  overflow: auto;
  padding: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.employee-count {
  color: #909399;
  font-size: 14px;
  font-weight: normal;
}

.organization-tree {
  font-size: 14px;
}

/* 重新设计树节点样式 */
.organization-tree :deep(.el-tree-node) {
  margin-bottom: 6px;
}

.organization-tree :deep(.el-tree-node__content) {
  height: auto !important;
  min-height: auto !important;
  padding: 10px 8px !important;
  line-height: 1.4 !important;
  margin-bottom: 6px;
  border-radius: var(--radius);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  align-items: flex-start !important;
}

.organization-tree :deep(.el-tree-node__content:hover) {
  background-color: hsl(var(--accent));
}

.organization-tree :deep(.el-tree-node__expand-icon) {
  margin-right: 10px;
  padding: 4px;
  font-size: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}

.organization-tree :deep(.el-tree-node__label) {
  width: 100%;
  padding-left: 0;
  display: block;
  flex: 1;
  min-width: 0;
}

.organization-tree :deep(.el-tree-node__children) {
  padding-left: 24px;
  margin-top: 6px;
}

/* 确保展开图标和节点内容分开 */
.organization-tree :deep(.el-tree-node__content) {
  display: flex;
  align-items: flex-start;
}

.organization-tree :deep(.el-tree-node__expand-icon.is-leaf) {
  visibility: hidden;
  width: 0;
  margin: 0;
}

/* 优化搜索高亮样式 */
.employee-node.highlighted .employee-tag-inline {
  animation: pulse-highlight 2s ease-in-out infinite;
}

@keyframes pulse-highlight {
  0%, 100% {
    box-shadow: 0 0 0 0 hsl(var(--warning) / 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px hsl(var(--warning) / 0.1);
  }
}

.tree-node-wrapper {
  width: 100%;
  padding: 0;
}

.tree-node-main {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.node-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.node-label {
  font-weight: 600;
  font-size: 14px;
  color: hsl(var(--foreground));
  flex-shrink: 0;
}

.node-type-tag {
  flex-shrink: 0;
}

.user-count-badge {
  background-color: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.add-child-btn {
  flex-shrink: 0;
  padding: 4px 8px;
  color: hsl(var(--primary));
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-child-btn:hover {
  background-color: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

/* 员工节点样式（作为树节点的子节点） */
.employee-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  line-height: 1.5;
}

.employee-tag-inline {
  margin: 0 !important;
  flex-shrink: 0;
}

.employee-position-inline {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  flex-shrink: 0;
  white-space: nowrap;
}

.tree-node {
  display: flex;
  align-items: flex-start;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 50px;
  padding: 8px 0;
  line-height: 1.8;
  box-sizing: border-box;
}

.node-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 8px;
  gap: 8px;
  line-height: 1.5;
}

.node-label {
  display: inline-block;
  font-weight: 500;
  font-size: 14px;
  margin-right: 0;
  white-space: nowrap;
}

.user-count {
  color: #909399;
  font-size: 12px;
  margin-left: 0;
  white-space: nowrap;
  font-weight: normal;
}

.employee-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
  width: 100%;
  gap: 6px;
  padding-left: 0;
  align-items: flex-start;
}

.employee-tags .el-tag {
  margin-left: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.role-expiry {
  font-size: 11px;
  color: #909399;
  margin-left: 4px;
}

.add-employee-container {
  padding: 10px 0;
}

.add-employee-container .el-form-item {
  margin-bottom: 20px;
}

.text-muted {
  color: #909399;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-buttons .el-button {
  padding: 4px 8px;
  font-size: 13px;
}

/* Use global .more-link from theme.css to ensure consistent theme styling */
</style>
