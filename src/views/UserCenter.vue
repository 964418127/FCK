<template>
  <div class="user-center">
    <div class="page-header">
      <h2>用户中心</h2>
      <p>以人为中心，管理用户的多重身份（平台身份和品牌角色）</p>
    </div>
    
    <div class="page-content">
      <div class="content-header">
        <el-button type="primary" @click="handleAddUser">
          <el-icon-plus /> 新增用户
        </el-button>
      </div>
      <div class="search-section">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索昵称、姓名、手机号、UID"
            style="width: 260px"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon-search />
            </template>
          </el-input>
          <el-select 
            v-model="searchForm.platformLayer" 
            placeholder="平台身份分层" 
            clearable
            style="width: 150px"
          >
            <el-option label="平台超管" value="platform-admin" />
            <el-option label="认证用户" value="certified" />
            <el-option label="访客用户" value="visitor" />
          </el-select>
          <el-select 
            v-model="searchForm.platformType" 
            placeholder="平台身份类型" 
            clearable
            :disabled="!searchForm.platformLayer"
            style="width: 180px"
          >
            <el-option 
              v-for="opt in platformTypeOptions" 
              :key="opt.value" 
              :label="opt.label" 
              :value="opt.value"
              :disabled="opt.layer !== searchForm.platformLayer"
            />
          </el-select>
          <el-select 
            v-model="searchForm.brandId" 
            placeholder="筛选品牌" 
            clearable
            style="width: 160px"
          >
            <el-option 
              v-for="brand in brands" 
              :key="brand.id" 
              :label="brand.name" 
              :value="brand.id"
            />
          </el-select>
          <el-select 
            v-model="searchForm.brandLayer" 
            placeholder="品牌角色分层" 
            clearable
            style="width: 150px"
          >
          <el-option label="品牌员工" value="brand-employee" />
          </el-select>
          <el-select 
            v-model="searchForm.brandRoleType" 
            placeholder="品牌角色类型" 
            clearable
            :disabled="!searchForm.brandLayer"
            style="width: 180px"
          >
            <el-option 
              v-for="opt in brandRoleTypeOptions" 
              :key="opt.value" 
              :label="opt.label" 
              :value="opt.value"
              :disabled="opt.layer !== searchForm.brandLayer"
            />
          </el-select>
          <el-button type="primary" @click="handleSearch">
            <el-icon-search /> 查询
          </el-button>
          <el-button @click="handleResetSearch">
            <el-icon-refresh /> 重置
          </el-button>
      </div>
      
      <el-table :data="filteredUsers" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="uid" label="用户UID" width="150" fixed="left" />
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar 
              :src="scope.row.avatar" 
              :size="40"
              :icon="scope.row.avatar ? undefined : 'UserFilled'"
            >
              <img v-if="!scope.row.avatar" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="用户昵称" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column label="账户状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="scope.row.accountStatus === 'active' ? 'success' : scope.row.accountStatus === 'disabled' ? 'danger' : 'info'"
              size="small"
            >
              {{ getAccountStatusText(scope.row.accountStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.registerTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最近登录" width="180">
          <template #default="scope">
            {{ scope.row.lastLoginTime ? formatDateTime(scope.row.lastLoginTime) : '-' }}
          </template>
        </el-table-column>
        
        <!-- 平台身份列 -->
        <el-table-column label="平台身份" min-width="280">
          <template #default="scope">
            <div class="identity-tags-wrapper">
              <!-- 平台超管身份 -->
              <template v-if="getPlatformAdminIdentities(scope.row).length">
                <el-tag 
                  v-for="admin in getPlatformAdminIdentities(scope.row)" 
                  :key="admin.id"
                  type="warning" 
                  size="small"
                  class="identity-tag"
                >
                  <span class="tag-prefix">超管</span>
                  <span class="tag-content">{{ admin.roleName }}</span>
                  <span v-if="admin.employeeNo" class="tag-meta">{{ admin.employeeNo }}</span>
                  <span v-if="admin.validityEndDate" class="tag-meta">至{{ formatDate(admin.validityEndDate) }}</span>
                </el-tag>
              </template>
              
              <!-- 认证用户身份 -->
              <template v-if="getCertifiedIdentities(scope.row).length">
                <el-tag 
                  v-for="cert in getCertifiedIdentities(scope.row)" 
                  :key="cert.id"
                  type="success" 
                  size="small"
                  class="identity-tag"
                >
                  <span class="tag-prefix">认证</span>
                  <span class="tag-content">{{ cert.professionalIdentity }}</span>
                  <span v-if="cert.validityEndDate" class="tag-meta">至{{ formatDate(cert.validityEndDate) }}</span>
                </el-tag>
              </template>
              
              <!-- 访客身份 -->
              <el-tag 
                v-if="hasVisitorIdentity(scope.row)"
                type="info" 
                size="small"
                class="identity-tag"
              >
                <span class="tag-prefix">访客</span>
                <span class="tag-content">{{ getVisitorIdentityType(scope.row) }}</span>
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <!-- 品牌角色列 -->
        <el-table-column label="品牌角色" min-width="280">
          <template #default="scope">
            <div class="identity-tags-wrapper">
              <el-tag 
                v-for="brandRole in getBrandRoles(scope.row)" 
                :key="brandRole.id"
                type="primary" 
                size="small"
                class="identity-tag"
              >
                <span class="tag-prefix">品牌员工</span>
                <span class="tag-content">{{ brandRole.brandName }}</span>
                <span class="tag-meta">{{ brandRole.roleName || '员工角色' }}</span>
                <span v-if="brandRole.departmentName" class="tag-meta">{{ brandRole.departmentName }}</span>
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleViewDetail(scope.row)"
              >
                详情
              </el-button>
              <el-dropdown trigger="click">
                <span class="more-link">
                  更多
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleViewLogs(scope.row)">动态日志</el-dropdown-item>
                    <el-dropdown-item @click="handleEditUser(scope.row)">编辑</el-dropdown-item>
                    <el-dropdown-item @click="handleDeleteUser(scope.row)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
    >
      <el-tabs v-model="activeFormTab">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px" style="margin-top: 20px">
            <el-form-item label="用户UID" prop="uid">
              <el-input v-model="formData.uid" placeholder="系统自动生成" :disabled="!!formData.id" />
              <div class="form-tip">用户唯一标识，系统自动生成</div>
            </el-form-item>
            <el-form-item label="用户头像" prop="avatar">
              <div class="avatar-upload-section">
                <el-avatar 
                  :src="formData.avatar" 
                  :size="80"
                  :icon="formData.avatar ? undefined : 'UserFilled'"
                  style="margin-right: 20px"
                >
                  <img v-if="!formData.avatar" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                </el-avatar>
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleAvatarChange"
                  accept="image/*"
                >
                  <el-button size="small" type="primary">上传头像</el-button>
                </el-upload>
                <el-button 
                  v-if="formData.avatar" 
                  size="small" 
                  type="danger" 
                  style="margin-left: 10px"
                  @click="formData.avatar = ''"
                >
                  清除
                </el-button>
              </div>
              <div class="form-tip">支持 JPG、PNG 格式，建议尺寸 200x200</div>
            </el-form-item>
            <el-form-item label="用户昵称" prop="nickname">
              <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
            </el-form-item>
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="个人邀请码" prop="inviteCode">
              <el-input v-model="formData.inviteCode" placeholder="系统自动生成" :disabled="!!formData.id" />
              <div class="form-tip">用户个人邀请码，系统自动生成，用于邀请其他用户注册</div>
            </el-form-item>
            <el-divider>个人信息</el-divider>
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="formData.personalInfo.idCard" placeholder="请输入身份证号" maxlength="18" />
            </el-form-item>
            <el-form-item label="出生年月日" prop="birthday">
              <el-date-picker
                v-model="formData.personalInfo.birthday"
                type="date"
                placeholder="请选择出生年月日"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.personalInfo.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
                <el-radio label="other">其他</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="健康证号" prop="healthCertificateNo">
              <el-input v-model="formData.personalInfo.healthCertificateNo" placeholder="请输入健康证号" />
            </el-form-item>
            <el-form-item label="健康证有效期" prop="healthCertificateExpiry">
              <el-date-picker
                v-model="formData.personalInfo.healthCertificateExpiry"
                type="date"
                placeholder="请选择健康证有效期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="银行卡号" prop="bankCardNo">
              <el-input v-model="formData.personalInfo.bankCardNo" placeholder="请输入银行卡号" />
            </el-form-item>
            <el-form-item label="开户银行" prop="bankName">
              <el-input v-model="formData.personalInfo.bankName" placeholder="请输入开户银行" />
            </el-form-item>
            <el-form-item label="开户人姓名" prop="bankAccountName">
              <el-input v-model="formData.personalInfo.bankAccountName" placeholder="请输入开户人姓名" />
            </el-form-item>
            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-input v-model="formData.personalInfo.emergencyContact" placeholder="请输入紧急联系人姓名" />
            </el-form-item>
            <el-form-item label="紧急联系人电话" prop="emergencyContactPhone">
              <el-input v-model="formData.personalInfo.emergencyContactPhone" placeholder="请输入紧急联系人电话" />
            </el-form-item>
            <el-form-item label="家庭住址" prop="address">
              <el-input v-model="formData.personalInfo.address" type="textarea" :rows="2" placeholder="请输入家庭住址" />
            </el-form-item>
            <el-form-item label="账户状态" prop="accountStatus">
              <el-select v-model="formData.accountStatus" placeholder="请选择账户状态" style="width: 100%">
                <el-option label="正常" value="active" />
                <el-option label="禁用" value="disabled" />
                <el-option label="冻结" value="frozen" />
              </el-select>
            </el-form-item>
            <el-form-item label="注册时间" v-if="formData.id">
              <el-input :value="formatDateTime(formData.registerTime)" disabled />
            </el-form-item>
            <el-form-item label="最近登录" v-if="formData.id">
              <el-input :value="formData.lastLoginTime ? formatDateTime(formData.lastLoginTime) : '从未登录'" disabled />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 平台身份 -->
        <el-tab-pane label="平台身份" name="platform-identity">
          <div style="margin-top: 20px">
            <div class="section-header">
              <h4>访客用户身份</h4>
            </div>
            <el-form-item label="访客身份类型" prop="visitorType">
              <el-radio-group v-model="formData.platformIdentities.visitor.type" :disabled="hasCertifiedIdentity()">
                <el-radio label="anonymous">匿名用户</el-radio>
                <el-radio label="normal">普通用户</el-radio>
              </el-radio-group>
              <div class="form-tip" v-if="hasCertifiedIdentity()">
                注意：用户已有认证身份，访客身份将自动取消
              </div>
            </el-form-item>
            <el-divider />
            
            <div class="section-header">
              <h4>认证用户身份（职业身份）</h4>
              <el-button type="primary" size="small" @click="handleAddCertifiedIdentity">
                <el-icon-plus /> 添加职业身份
              </el-button>
            </div>
            <div v-if="formData.platformIdentities.certified.length > 0" class="identity-list-form">
              <div 
                v-for="(cert, index) in formData.platformIdentities.certified" 
                :key="index"
                class="identity-item-form"
              >
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-select 
                      v-model="cert.professionalIdentity" 
                      placeholder="选择职业身份" 
                      style="width: 100%"
                    >
                      <el-option label="推拿师" value="推拿师" />
                      <el-option label="按摩技法讲师" value="按摩技法讲师" />
                      <el-option label="理疗师" value="理疗师" />
                      <el-option label="康复师" value="康复师" />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-date-picker
                      v-model="cert.certifiedDate"
                      type="date"
                      placeholder="认证日期"
                      style="width: 100%"
                    />
                  </el-col>
                  <el-col :span="6">
                    <el-input v-model="cert.certificateNo" placeholder="证书编号" />
                  </el-col>
                  <el-col :span="6">
                    <el-date-picker
                      v-model="cert.validityEndDate"
                      type="date"
                      placeholder="有效期至"
                      style="width: 100%"
                    />
                  </el-col>
                  <el-col :span="24" style="margin-top: 10px">
                    <el-button type="danger" size="small" @click="handleRemoveCertifiedIdentity(index)">
                      <el-icon-delete /> 删除
                    </el-button>
                  </el-col>
                </el-row>
              </div>
            </div>
            <el-empty v-else description="暂未添加职业身份" :image-size="80" />
            <el-divider />
            
            <div class="section-header">
              <h4>平台超管身份（工作角色身份）</h4>
              <el-button type="primary" size="small" @click="handleAddPlatformAdminIdentity">
                <el-icon-plus /> 添加工作角色身份
              </el-button>
            </div>
            <div v-if="formData.platformIdentities.platformAdmin.length > 0" class="identity-list-form">
              <div 
                v-for="(admin, index) in formData.platformIdentities.platformAdmin" 
                :key="index"
                class="identity-item-form"
              >
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-select 
                      v-model="admin.roleId" 
                      placeholder="选择工作角色" 
                      style="width: 100%"
                      @change="() => handlePlatformAdminRoleChange(index)"
                    >
                      <el-option 
                        v-for="role in platformRoles" 
                        :key="role.id" 
                        :label="role.name" 
                        :value="role.id"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-input v-model="admin.employeeNo" placeholder="工号（自动生成）" disabled />
                    <div class="form-tip">工号将根据工作角色自动生成</div>
                  </el-col>
                  <el-col :span="6">
                    <el-date-picker
                      v-model="admin.validityEndDate"
                      type="date"
                      placeholder="有效期至"
                      style="width: 100%"
                    />
                  </el-col>
                  <el-col :span="4">
                    <el-button type="danger" size="small" @click="handleRemovePlatformAdminIdentity(index)">
                      <el-icon-delete /> 删除
                    </el-button>
                  </el-col>
                </el-row>
              </div>
            </div>
            <el-empty v-else description="暂未添加平台超管身份" :image-size="80" />
          </div>
        </el-tab-pane>
        
        <!-- 品牌角色 -->
        <el-tab-pane label="品牌角色" name="brand-role">
          <div style="margin-top: 20px">
            <div class="section-header">
              <h4>品牌角色</h4>
              <el-button type="primary" size="small" @click="handleAddBrandRole">
                <el-icon-plus /> 添加品牌角色
              </el-button>
            </div>
            <div v-if="formData.brandRoles.length > 0" class="role-list-form">
              <div 
                v-for="(brandRole, index) in formData.brandRoles" 
                :key="index"
                class="role-item-form"
              >
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-select 
                      v-model="brandRole.brandId" 
                      placeholder="选择品牌" 
                      style="width: 100%"
                    >
                      <el-option 
                        v-for="brand in brands" 
                        :key="brand.id" 
                        :label="brand.name" 
                        :value="brand.id"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-select 
                      v-model="brandRole.roleType" 
                      placeholder="角色类型" 
                      style="width: 100%"
                      @change="handleBrandRoleTypeChange(index)"
                    >
                      <el-option label="工作角色" value="work-role" />
                    </el-select>
                  </el-col>
                  <el-col :span="6" v-if="brandRole.roleType === 'work-role'">
                    <el-select 
                      v-model="brandRole.roleId" 
                      placeholder="选择工作角色" 
                      style="width: 100%"
                    >
                      <el-option 
                        v-for="role in getBrandRolesByBrand(brandRole.brandId)" 
                        :key="role.id" 
                        :label="role.name" 
                        :value="role.id"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="6" v-if="brandRole.roleType === 'work-role'">
                    <el-input v-model="brandRole.departmentName" placeholder="部门（可选）" />
                  </el-col>
                  <el-col :span="4" v-if="brandRole.roleType === 'work-role'">
                    <el-input v-model="brandRole.employeeNo" placeholder="工号（可选）" />
                  </el-col>
                  <el-col :span="4">
                    <el-button type="danger" size="small" @click="handleRemoveBrandRole(index)">
                      <el-icon-delete /> 删除
                    </el-button>
                  </el-col>
                </el-row>
              </div>
            </div>
            <el-empty v-else description="暂未添加品牌角色" :image-size="80" />
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="detailDialogTitle"
      width="900px"
    >
      <div v-if="selectedUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户UID">{{ selectedUser.uid || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用户头像">
            <el-avatar 
              :src="selectedUser.avatar" 
              :size="60"
              :icon="selectedUser.avatar ? undefined : 'UserFilled'"
            >
              <img v-if="!selectedUser.avatar" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </el-avatar>
          </el-descriptions-item>
          <el-descriptions-item label="用户昵称">{{ selectedUser.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ selectedUser.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ selectedUser.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedUser.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="个人邀请码">{{ selectedUser.inviteCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="账户状态">
            <el-tag 
              :type="selectedUser.accountStatus === 'active' ? 'success' : selectedUser.accountStatus === 'disabled' ? 'danger' : 'info'"
              size="small"
            >
              {{ getAccountStatusText(selectedUser.accountStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatDateTime(selectedUser.registerTime) }}</el-descriptions-item>
          <el-descriptions-item label="最近登录">{{ selectedUser.lastLoginTime ? formatDateTime(selectedUser.lastLoginTime) : '从未登录' }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider />
        
        <h4>个人信息</h4>
        <el-descriptions :column="2" border style="margin-top: 10px">
          <el-descriptions-item label="身份证号">{{ selectedUser.personalInfo?.idCard || '-' }}</el-descriptions-item>
          <el-descriptions-item label="出生年月日">{{ selectedUser.personalInfo?.birthday ? formatDate(selectedUser.personalInfo.birthday) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ selectedUser.personalInfo?.gender === 'male' ? '男' : selectedUser.personalInfo?.gender === 'female' ? '女' : selectedUser.personalInfo?.gender === 'other' ? '其他' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="健康证号">{{ selectedUser.personalInfo?.healthCertificateNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="健康证有效期">{{ selectedUser.personalInfo?.healthCertificateExpiry ? formatDate(selectedUser.personalInfo.healthCertificateExpiry) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="银行卡号">{{ selectedUser.personalInfo?.bankCardNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="开户银行">{{ selectedUser.personalInfo?.bankName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="开户人姓名">{{ selectedUser.personalInfo?.bankAccountName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系人">{{ selectedUser.personalInfo?.emergencyContact || '-' }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系人电话">{{ selectedUser.personalInfo?.emergencyContactPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="家庭住址" :span="2">{{ selectedUser.personalInfo?.address || '-' }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider />
        
        <h4>平台身份</h4>
        <el-descriptions :column="1" border style="margin-top: 10px">
          <el-descriptions-item label="访客用户身份">
            <el-tag v-if="hasVisitorIdentity(selectedUser)" type="info">
              {{ getVisitorIdentityType(selectedUser) }}
            </el-tag>
            <span v-else class="text-muted">无</span>
          </el-descriptions-item>
          <el-descriptions-item label="认证用户身份" v-if="getCertifiedIdentities(selectedUser).length > 0">
            <div class="identity-list">
              <el-tag 
                v-for="cert in getCertifiedIdentities(selectedUser)" 
                :key="cert.id"
                type="success" 
                size="small"
                style="margin-right: 5px"
              >
                {{ cert.professionalIdentity }}
                <span v-if="cert.certifiedDate">（认证日期：{{ formatDate(cert.certifiedDate) }}）</span>
                <span v-if="cert.validityEndDate">（有效期至：{{ formatDate(cert.validityEndDate) }}）</span>
              </el-tag>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="平台超管身份" v-if="getPlatformAdminIdentities(selectedUser).length > 0">
            <div class="identity-list">
              <el-tag 
                v-for="admin in getPlatformAdminIdentities(selectedUser)" 
                :key="admin.id"
                type="warning" 
                size="small"
                style="margin-right: 5px"
              >
                {{ admin.roleName }}
                <span v-if="admin.employeeNo">（工号：{{ admin.employeeNo }}）</span>
                <span v-if="admin.validityEndDate">（有效期至：{{ formatDate(admin.validityEndDate) }}）</span>
              </el-tag>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        
        <el-divider />
        
        <h4>品牌角色</h4>
        <el-descriptions :column="1" border style="margin-top: 10px" v-if="getBrandRoles(selectedUser).length > 0">
          <el-descriptions-item 
            v-for="brandRole in getBrandRoles(selectedUser)" 
            :key="brandRole.id"
            :label="brandRole.brandName"
          >
            <el-tag 
              type="primary" 
              size="small"
            >
              <span>{{ brandRole.roleName }}</span>
              <span v-if="brandRole.departmentName">（{{ brandRole.departmentName }}）</span>
              <span v-if="brandRole.employeeNo"> - {{ brandRole.employeeNo }}</span>
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <el-empty v-else description="暂无品牌角色" :image-size="80" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { departments as mockDepartments, roles as mockRoles } from '../mock/data.js'

const router = useRouter()
import {
  Plus as ElIconPlus,
  Delete as ElIconDelete,
  Search as ElIconSearch,
  Refresh as ElIconRefresh,
  UserFilled,
  ArrowDown
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const detailDialogTitle = ref('用户详情')
const activeFormTab = ref('basic')
const formRef = ref(null)
const selectedUser = ref(null)

// 搜索表单
const searchForm = ref({
  keyword: '',
  platformLayer: '',
  platformType: '',
  brandId: '',
  brandLayer: '',
  brandRoleType: ''
})

// 模拟数据
const users = ref([
  {
    id: 'user-1',
    uid: 'uid-001',
    nickname: '张三三',
    name: '张三',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    inviteCode: 'INV001',
    accountStatus: 'active',
    registerTime: new Date('2024-01-10'),
    lastLoginTime: new Date('2024-03-15'),
    personalInfo: {
      idCard: '110101199001011234',
      birthday: '1990-01-01',
      gender: 'male',
      healthCertificateNo: 'JKZ2024001',
      healthCertificateExpiry: '2025-12-31',
      bankCardNo: '6222021234567890123',
      bankName: '中国工商银行',
      bankAccountName: '张三',
      emergencyContact: '张四',
      emergencyContactPhone: '13800138002',
      address: '北京市朝阳区xxx街道xxx号'
    },
    platformIdentities: {
      visitor: { type: null }, // 有认证身份时，访客身份自动取消
      certified: [
        { id: 'cert-1', professionalIdentity: '推拿师', certifiedDate: new Date('2024-01-15'), certificateNo: 'CERT001', validityEndDate: new Date('2025-01-15') }
      ],
      platformAdmin: []
    },
    brandRoles: []
  },
  {
    id: 'user-2',
    uid: 'uid-002',
    nickname: '李四四',
    name: '李四',
    avatar: '',
    phone: '13800138002',
    email: 'lisi@example.com',
    inviteCode: 'INV002',
    accountStatus: 'active',
    registerTime: new Date('2024-01-12'),
    lastLoginTime: new Date('2024-03-14'),
    personalInfo: {
      idCard: '110101199002021234',
      birthday: '1990-02-02',
      gender: 'female',
      healthCertificateNo: 'JKZ2024002',
      healthCertificateExpiry: '2025-12-31',
      bankCardNo: '6222021234567890124',
      bankName: '中国建设银行',
      bankAccountName: '李四',
      emergencyContact: '李五',
      emergencyContactPhone: '13800138003',
      address: '北京市海淀区xxx街道xxx号'
    },
    platformIdentities: {
      visitor: { type: 'normal' },
      certified: [],
      platformAdmin: [
        { id: 'admin-1', roleId: 'role-3', roleName: '运营专员', employeeNo: 'EMP001', validityEndDate: new Date('2025-01-12') }
      ]
    },
    brandRoles: [
      { id: 'brand-role-init-1', brandId: 'brand-1', brandName: '品牌A', roleType: 'work-role', roleId: 'brand-role-init-1', roleName: '员工初始角色', departmentName: '推拿部', employeeNo: 'BRAND001' }
    ]
  },
  {
    id: 'user-3',
    uid: 'uid-003',
    nickname: '王五五',
    name: '王五',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '13800138003',
    email: 'wangwu@example.com',
    inviteCode: 'INV003',
    accountStatus: 'disabled',
    registerTime: new Date('2024-01-15'),
    lastLoginTime: new Date('2024-03-10'),
    personalInfo: {
      idCard: '110101199003031234',
      birthday: '1990-03-03',
      gender: 'male',
      healthCertificateNo: 'JKZ2024003',
      healthCertificateExpiry: '2025-12-31',
      bankCardNo: '6222021234567890125',
      bankName: '中国农业银行',
      bankAccountName: '王五',
      emergencyContact: '王六',
      emergencyContactPhone: '13800138004',
      address: '北京市丰台区xxx街道xxx号'
    },
    platformIdentities: {
      visitor: { type: null }, // 有认证身份时，访客身份自动取消
      certified: [
        { id: 'cert-2', professionalIdentity: '按摩技法讲师', certifiedDate: new Date('2024-02-01'), certificateNo: 'CERT002', validityEndDate: new Date('2025-02-01') }
      ],
      platformAdmin: [],
    },
    brandRoles: [
      { id: 'brand-role-init-1', brandId: 'brand-1', brandName: '品牌A', roleType: 'employee-init', roleId: 'brand-role-init-1', roleName: '员工初始角色' }
    ]
  }
])

const departments = ref(mockDepartments)
const platformRoles = ref(mockRoles.filter(r => ['role-2', 'role-3', 'role-4'].includes(r.id))) // 平台工作角色
const brands = ref([
  { id: 'brand-1', name: '品牌A' },
  { id: 'brand-2', name: '品牌B' },
  { id: 'brand-3', name: '品牌C' }
])

// 平台身份类型选项
const platformTypeOptions = [
  { layer: 'platform-admin', value: 'platform-super-admin', label: '平台超级管理员' },
  { layer: 'platform-admin', value: 'platform-init', label: '平台初始身份' },
  { layer: 'platform-admin', value: 'platform-ops', label: '运营总监' },
  { layer: 'platform-admin', value: 'platform-admin-other', label: '其他平台超管' },
  { layer: 'certified', value: 'certified-professional', label: '职业身份' },
  { layer: 'visitor', value: 'anonymous', label: '匿名用户' },
  { layer: 'visitor', value: 'normal', label: '普通用户' }
]

// 品牌角色类型选项（仅品牌员工）
const brandRoleTypeOptions = [
  { layer: 'brand-employee', value: 'brand-employee-init', label: '员工初始角色' },
  { layer: 'brand-employee', value: 'brand-employee-ops', label: '品牌运营总监' },
  { layer: 'brand-employee', value: 'brand-employee-care', label: '客情维护专员' },
  { layer: 'brand-employee', value: 'brand-employee-other', label: '其他员工角色' }
]

// 品牌角色数据（模拟，仅品牌员工）
const brandRolesData = {
  'brand-1': [
    { id: 'brand-role-init-1', name: '员工初始角色', type: 'employee-init' },
    { id: 'brand-role-ops-1', name: '品牌运营总监', type: 'employee-ops' },
    { id: 'brand-role-care-1', name: '客情维护专员', type: 'employee-care' }
  ],
  'brand-2': [
    { id: 'brand-role-init-2', name: '员工初始角色', type: 'employee-init' },
    { id: 'brand-role-ops-2', name: '品牌运营总监', type: 'employee-ops' }
  ],
  'brand-3': [
    { id: 'brand-role-init-3', name: '员工初始角色', type: 'employee-init' }
  ]
}

// 树形配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 表单数据
const formData = ref({
  id: '',
  uid: '',
  nickname: '',
  name: '',
  avatar: '',
  phone: '',
  email: '',
  inviteCode: '',
  accountStatus: 'active',
  registerTime: null,
  lastLoginTime: null,
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
  },
  platformIdentities: {
    visitor: { type: 'normal' }, // 'anonymous' 匿名用户, 'normal' 普通用户, null 无访客身份（已有认证身份）
    certified: [],
    platformAdmin: []
  },
  brandRoles: []
})

// 表单验证规则
const rules = {
  nickname: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    { min: 1, max: 50, message: '昵称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  accountStatus: [
    { required: true, message: '请选择账户状态', trigger: 'change' }
  ]
}

// 过滤后的用户列表
const filteredUsers = computed(() => {
  let result = [...users.value]
  
  // 关键词搜索
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    result = result.filter(u => 
      (u.nickname && u.nickname.toLowerCase().includes(keyword)) ||
      (u.name && u.name.toLowerCase().includes(keyword)) ||
      u.phone.includes(keyword) ||
      (u.uid && u.uid.toLowerCase().includes(keyword))
    )
  }
  
  // 平台身份筛选
  if (searchForm.value.platformLayer) {
    result = result.filter(u => userHasPlatformLayer(u, searchForm.value.platformLayer))
  }
  if (searchForm.value.platformType) {
    result = result.filter(u => userHasPlatformType(u, searchForm.value.platformType))
  }
  
  // 品牌筛选
  if (searchForm.value.brandId) {
    result = result.filter(u => 
      u.brandRoles.some(br => br.brandId === searchForm.value.brandId)
    )
  }
  if (searchForm.value.brandLayer) {
    result = result.filter(u => userHasBrandLayer(u, searchForm.value.brandLayer))
  }
  if (searchForm.value.brandRoleType) {
    result = result.filter(u => userHasBrandRoleType(u, searchForm.value.brandRoleType))
  }
  
  return result
})

// 辅助函数：检查是否有访客身份
const hasVisitorIdentity = (user) => {
  // 如果有认证身份，则没有访客身份
  if (user.platformIdentities.certified && user.platformIdentities.certified.length > 0) {
    return false
  }
  return user.platformIdentities.visitor && user.platformIdentities.visitor.type
}

// 获取访客身份类型文本
const getVisitorIdentityType = (user) => {
  if (!hasVisitorIdentity(user)) {
    return ''
  }
  const type = user.platformIdentities.visitor.type
  return type === 'anonymous' ? '匿名用户' : type === 'normal' ? '普通用户' : ''
}

// 获取认证用户身份列表
const getCertifiedIdentities = (user) => {
  return user.platformIdentities.certified || []
}

// 获取平台超管身份列表
const getPlatformAdminIdentities = (user) => {
  return (user.platformIdentities.platformAdmin || []).map(admin => {
    const role = platformRoles.value.find(r => r.id === admin.roleId)
    return {
      ...admin,
      roleName: role ? role.name : admin.roleId,
      departmentName: undefined // 不显示部门信息
    }
  })
}

// 获取品牌角色列表
const getBrandRoles = (user) => {
  return (user.brandRoles || []).map(br => {
    const brand = brands.value.find(b => b.id === br.brandId)
    const roleOption = brandRolesData[br.brandId]?.find(r => r.id === br.roleId)
    return {
      ...br,
      brandName: brand ? brand.name : (br.brandName || br.brandId),
      roleName: roleOption?.name || br.roleName || br.roleId
    }
  })
}

// 检查是否有任何平台身份
const hasAnyPlatformIdentity = (user) => {
  return hasVisitorIdentity(user) ||
         (user.platformIdentities.certified && user.platformIdentities.certified.length > 0) ||
         (user.platformIdentities.platformAdmin && user.platformIdentities.platformAdmin.length > 0)
}

const mapPlatformAdminType = (admin) => {
  const name = (admin.roleName || admin.roleId || '').toLowerCase()
  if (name.includes('超级')) return 'platform-super-admin'
  if (name.includes('初始')) return 'platform-init'
  if (name.includes('运营')) return 'platform-ops'
  return 'platform-admin-other'
}

const getPlatformTypeValues = (user) => {
  const types = []
  ;(user.platformIdentities.platformAdmin || []).forEach(admin => {
    types.push(mapPlatformAdminType(admin))
  })
  if ((user.platformIdentities.certified || []).length > 0) {
    types.push('certified-professional')
  }
  if (hasVisitorIdentity(user)) {
    const type = user.platformIdentities.visitor.type
    if (type === 'anonymous' || type === 'normal') {
      types.push(type)
    }
  }
  return types
}

const userHasPlatformLayer = (user, layer) => {
  if (layer === 'platform-admin') {
    return (user.platformIdentities.platformAdmin || []).length > 0
  }
  if (layer === 'certified') {
    return (user.platformIdentities.certified || []).length > 0
  }
  if (layer === 'visitor') {
    return hasVisitorIdentity(user)
  }
  return true
}

const userHasPlatformType = (user, type) => {
  return getPlatformTypeValues(user).includes(type)
}

// 检查是否有认证身份
const hasCertifiedIdentity = () => {
  return formData.value.platformIdentities.certified && formData.value.platformIdentities.certified.length > 0
}

// 检查是否有任何品牌角色
const hasAnyBrandRole = (user) => {
  return user.brandRoles && user.brandRoles.length > 0
}

const mapBrandRoleType = (brandRole) => {
  const roleOption = brandRolesData[brandRole.brandId]?.find(r => r.id === brandRole.roleId)
  const resolvedType = brandRole.type || roleOption?.type
  const roleType = resolvedType
  const roleName = (brandRole.roleName || '').toLowerCase()
  if (roleType === 'employee-init' || roleName.includes('初始')) return 'brand-employee-init'
  if (roleType === 'employee-ops' || roleName.includes('运营总监')) return 'brand-employee-ops'
  if (roleType === 'employee-care' || roleName.includes('客情')) return 'brand-employee-care'
  if (roleName.includes('初始')) return 'brand-employee-init'
  return 'brand-employee-other'
}

const getBrandRoleTypes = (user) => {
  const types = []
  ;(user.brandRoles || []).forEach(br => {
    types.push(mapBrandRoleType(br))
  })
  return types
}

const userHasBrandLayer = (user, layer) => {
  if (layer === 'brand-employee') {
    return (user.brandRoles || []).length > 0
  }
  return true
}

const userHasBrandRoleType = (user, type) => {
  return getBrandRoleTypes(user).includes(type)
}

// 根据品牌获取角色列表
const getBrandRolesByBrand = (brandId) => {
  return brandRolesData[brandId] || []
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取账户状态文本
const getAccountStatusText = (status) => {
  const statusMap = {
    'active': '正常',
    'disabled': '禁用',
    'frozen': '冻结'
  }
  return statusMap[status] || status
}

// 处理头像上传
const handleAvatarChange = (file) => {
  // 这里可以处理图片上传逻辑
  // 暂时使用本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.avatar = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 搜索
const handleSearch = () => {
  ElMessage.success('查询完成')
}

// 重置搜索
const handleResetSearch = () => {
  searchForm.value = {
    keyword: '',
    platformLayer: '',
    platformType: '',
    brandId: '',
    brandLayer: '',
    brandRoleType: ''
  }
  ElMessage.success('已重置查询条件')
}

// 新增用户
const handleAddUser = () => {
  dialogTitle.value = '新增用户'
  formData.value = {
    id: '',
    uid: `uid-${Date.now()}`, // 自动生成
    nickname: '',
    name: '',
    avatar: '',
    phone: '',
    email: '',
    inviteCode: `INV${Date.now()}`, // 自动生成
    accountStatus: 'active',
    registerTime: new Date(),
    lastLoginTime: null,
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
    },
    platformIdentities: {
      visitor: { type: 'normal' }, // 默认普通用户
      certified: [],
      platformAdmin: []
    },
    brandRoles: []
  }
  activeFormTab.value = 'basic'
  dialogVisible.value = true
}

// 编辑用户
const handleEditUser = (row) => {
  dialogTitle.value = '编辑用户'
  formData.value = JSON.parse(JSON.stringify(row))
  activeFormTab.value = 'basic'
  dialogVisible.value = true
}

// 查看详情
const handleViewDetail = (row) => {
  selectedUser.value = row
  detailDialogTitle.value = '用户详情'
  detailDialogVisible.value = true
}

// 查看动态日志
const handleViewLogs = (row) => {
  router.push({
    name: 'user-logs',
    query: { userId: row.id, userName: row.name || row.nickname }
  })
}

// 删除用户
const handleDeleteUser = (row) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = users.value.findIndex(u => u.id === row.id)
    if (index > -1) {
      users.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

// 添加认证用户身份
const handleAddCertifiedIdentity = () => {
  formData.value.platformIdentities.certified.push({
    id: `cert-${Date.now()}`,
    professionalIdentity: '',
    certifiedDate: null,
    certificateNo: '',
    validityEndDate: null
  })
  // 添加认证身份后，自动取消访客身份
  formData.value.platformIdentities.visitor.type = null
}

// 移除认证用户身份
const handleRemoveCertifiedIdentity = (index) => {
  formData.value.platformIdentities.certified.splice(index, 1)
  // 如果没有认证身份了，恢复访客身份（默认为普通用户）
  if (formData.value.platformIdentities.certified.length === 0) {
    formData.value.platformIdentities.visitor.type = 'normal'
  }
}

// 添加平台超管身份
const handleAddPlatformAdminIdentity = () => {
  formData.value.platformIdentities.platformAdmin.push({
    id: `admin-${Date.now()}`,
    roleId: '',
    employeeNo: '', // 工号将根据工作角色自动生成
    validityEndDate: null
  })
}

// 处理平台超管工作角色变化
const handlePlatformAdminRoleChange = (index) => {
  const admin = formData.value.platformIdentities.platformAdmin[index]
  if (admin.roleId) {
    // 根据工作角色自动生成工号
    const role = platformRoles.value.find(r => r.id === admin.roleId)
    if (role) {
      // 生成工号格式：角色前缀 + 时间戳后6位
      const rolePrefix = role.name.substring(0, 2) || 'EMP'
      admin.employeeNo = `${rolePrefix}${Date.now().toString().slice(-6)}`
    }
  }
}

// 移除平台超管身份
const handleRemovePlatformAdminIdentity = (index) => {
  formData.value.platformIdentities.platformAdmin.splice(index, 1)
}

// 添加品牌角色
const handleAddBrandRole = () => {
  formData.value.brandRoles.push({
    id: `brand-role-${Date.now()}`,
    brandId: '',
    roleType: 'work-role',
    roleId: '',
    departmentName: '',
    employeeNo: ''
  })
}

// 移除品牌角色
const handleRemoveBrandRole = (index) => {
  formData.value.brandRoles.splice(index, 1)
}

// 品牌角色类型变化
const handleBrandRoleTypeChange = (index) => {
  const brandRole = formData.value.brandRoles[index]
  if (brandRole.roleType !== 'work-role') {
    brandRole.roleId = ''
    brandRole.departmentName = ''
    brandRole.employeeNo = ''
  }
}

// 保存用户
const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 处理平台超管身份的工号生成
      formData.value.platformIdentities.platformAdmin.forEach(admin => {
        if (admin.roleId && !admin.employeeNo) {
          const role = platformRoles.value.find(r => r.id === admin.roleId)
          if (role) {
            const rolePrefix = role.name.substring(0, 2) || 'EMP'
            admin.employeeNo = `${rolePrefix}${Date.now().toString().slice(-6)}`
          }
        }
      })
      
      if (formData.value.id) {
        // 编辑
        const index = users.value.findIndex(u => u.id === formData.value.id)
        if (index > -1) {
          users.value[index] = JSON.parse(JSON.stringify(formData.value))
          ElMessage.success('更新成功')
        }
      } else {
        // 新增
        users.value.push({
          ...formData.value,
          id: `user-${Date.now()}`
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

// 从员工管理同步数据到用户中心
const syncFromEmployeeManagement = (employeeData) => {
  // 查找是否已存在该用户（通过UID或手机号）
  const existingUserIndex = users.value.findIndex(u => 
    u.uid === employeeData.uid || u.phone === employeeData.phone
  )
  
  if (existingUserIndex >= 0) {
    // 更新现有用户，保留用户中心的特有字段，同步员工管理的字段
    const existingUser = users.value[existingUserIndex]
    users.value[existingUserIndex] = {
      ...existingUser,
      // 同步基本信息
      name: employeeData.name || existingUser.name,
      phone: employeeData.phone || existingUser.phone,
      email: employeeData.email || existingUser.email,
      // 同步个人信息
      personalInfo: {
        ...existingUser.personalInfo,
        ...employeeData.personalInfo
      },
      // 如果员工管理中有品牌角色信息，同步到用户中心
      brandRoles: employeeData.brandRoles || existingUser.brandRoles
    }
    ElMessage.success('已从员工管理同步数据到用户中心')
  } else {
    // 创建新用户
    const newUser = {
      id: `user-${Date.now()}`,
      uid: employeeData.uid || `uid-${Date.now()}`,
      nickname: employeeData.username || employeeData.name || '',
      name: employeeData.name,
      avatar: '',
      phone: employeeData.phone || '',
      email: employeeData.email || '',
      inviteCode: `INV${Date.now()}`,
      accountStatus: 'active',
      registerTime: new Date(),
      lastLoginTime: null,
      personalInfo: employeeData.personalInfo || {
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
      },
      platformIdentities: {
        visitor: { type: 'normal' },
        certified: [],
        platformAdmin: []
      },
      brandRoles: employeeData.brandRoles || []
    }
    users.value.push(newUser)
    ElMessage.success('已从员工管理创建新用户到用户中心')
  }
}

// 初始化
onMounted(() => {
  // 初始化数据
  // TODO: 实际项目中应该从API加载数据，并自动同步员工管理的数据
})
</script>

<style scoped>
.user-center {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.page-header p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
}

.page-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 12px;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.identity-list, .role-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.identity-detail, .role-detail {
  font-size: 12px;
  color: #909399;
  margin-left: 5px;
}

.text-muted {
  color: #909399;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.identity-list-form, .role-list-form {
  margin-top: 15px;
}

.identity-item-form, .role-item-form {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 10px;
}

/* 身份和角色标签样式 - 简洁紧凑设计 */
.identity-tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.identity-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 4px 8px;
  font-size: 12px;
  line-height: 1.4;
}

.identity-tag .tag-prefix {
  font-weight: 600;
  padding-right: 6px;
  margin-right: 4px;
  position: relative;
}

.identity-tag .tag-prefix::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 12px;
  background: currentColor;
  opacity: 0.3;
}

.identity-tag .tag-content {
  font-weight: 500;
}

.identity-tag .tag-meta {
  font-size: 11px;
  opacity: 0.75;
  padding-left: 6px;
  margin-left: 4px;
  position: relative;
}

.identity-tag .tag-meta::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 10px;
  background: currentColor;
  opacity: 0.2;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-upload-section {
  display: flex;
  align-items: center;
}

.user-detail {
  padding: 10px 0;
}

.user-detail h4 {
  margin: 20px 0 10px 0;
  color: #333;
  font-size: 16px;
}
</style>
