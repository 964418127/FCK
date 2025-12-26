<template>
  <div class="brand-management">
    <div class="page-header">
      <h2>品牌管理</h2>
      <p>管理平台入驻的品牌信息</p>
    </div>
    
    <div class="page-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleAddBrand">
          <el-icon><Plus /></el-icon>
          新增品牌
        </el-button>
        <el-button type="success" @click="handleImportBrands">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
      </div>
      
      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索品牌编码、品牌名称、统一社会信用代码"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="searchForm.category" placeholder="品牌分类" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="餐饮" value="catering" />
          <el-option label="零售" value="retail" />
          <el-option label="服务" value="service" />
          <el-option label="其他" value="other" />
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
      
      <!-- 品牌列表 -->
      <el-table :data="filteredBrands" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="brandCode" label="品牌编码" width="150" />
        <el-table-column prop="brandName" label="品牌名称" min-width="150" />
        <el-table-column label="品牌LOGO" width="100">
          <template #default="scope">
            <el-avatar 
              :src="scope.row.brandLogo" 
              :size="50"
              shape="square"
            >
              <img v-if="!scope.row.brandLogo" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="品牌分类" width="120">
          <template #default="scope">
            <el-tag :type="getCategoryTagType(scope.row.category)" size="small">
              {{ getCategoryLabel(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contactPerson" label="品牌联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系方式" width="150" />
        <el-table-column prop="creditCode" label="统一社会信用代码" width="200" show-overflow-tooltip />
        <el-table-column prop="headquartersAddress" label="总部地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="applicationTime" label="申请时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.applicationTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="entryTime" label="入驻时间" width="180">
          <template #default="scope">
            {{ scope.row.entryTime ? formatDateTime(scope.row.entryTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="品牌应用" min-width="200">
          <template #default="scope">
            <el-tag 
              v-for="app in scope.row.applications" 
              :key="app"
              size="small"
              style="margin-right: 5px"
            >
              {{ getApplicationLabel(app) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleEditBrand(scope.row)">
                编辑
              </el-button>
              <el-dropdown trigger="click">
                <span class="more-link">
                  更多
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleViewDetail(scope.row)">详情</el-dropdown-item>
                    <el-dropdown-item @click="handleDeleteBrand(scope.row)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    
    <!-- 品牌表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="品牌编码" prop="brandCode">
          <el-input v-model="formData.brandCode" placeholder="请输入品牌编码" :disabled="!!formData.id" />
        </el-form-item>
        <el-form-item label="品牌名称" prop="brandName">
          <el-input v-model="formData.brandName" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="品牌LOGO" prop="brandLogo">
          <el-upload
            class="logo-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="handleUpload"
          >
            <img v-if="formData.brandLogo" :src="formData.brandLogo" class="logo-preview" />
            <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="form-tip">支持 JPG、PNG 格式，建议尺寸 200x200px</div>
        </el-form-item>
        <el-form-item label="品牌介绍" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入品牌介绍"
          />
        </el-form-item>
        <el-form-item label="总部地址" prop="headquartersAddress">
          <el-input v-model="formData.headquartersAddress" placeholder="请输入总部地址" />
        </el-form-item>
        <el-form-item label="联系方式" prop="contactPhone">
          <el-input v-model="formData.contactPhone" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="统一社会信用代码" prop="creditCode">
          <el-input v-model="formData.creditCode" placeholder="请输入统一社会信用代码" />
        </el-form-item>
        <el-form-item label="品牌分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择品牌分类" style="width: 100%">
            <el-option label="餐饮" value="catering" />
            <el-option label="零售" value="retail" />
            <el-option label="服务" value="service" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌联系人" prop="contactPerson">
          <el-input v-model="formData.contactPerson" placeholder="请输入品牌联系人" />
        </el-form-item>
        <el-form-item label="申请时间" prop="applicationTime">
          <el-date-picker
            v-model="formData.applicationTime"
            type="datetime"
            placeholder="选择申请时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="入驻时间" prop="entryTime">
          <el-date-picker
            v-model="formData.entryTime"
            type="datetime"
            placeholder="选择入驻时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="品牌应用">
          <el-select
            v-model="formData.applications"
            multiple
            placeholder="请选择品牌应用（产品端口）"
            style="width: 100%"
          >
            <el-option label="Web端" value="web" />
            <el-option label="移动端（iOS）" value="ios" />
            <el-option label="移动端（Android）" value="android" />
            <el-option label="小程序" value="miniprogram" />
            <el-option label="H5" value="h5" />
          </el-select>
          <div class="form-tip">可多选，对应产品的不同端口</div>
        </el-form-item>
        <el-form-item label="营业执照" prop="businessLicense">
          <el-upload
            class="license-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeUploadLicense"
            :http-request="handleUploadLicense"
          >
            <img v-if="formData.businessLicense" :src="formData.businessLicense" class="license-preview" />
            <div v-else class="upload-placeholder">
              <el-icon class="license-uploader-icon"><Plus /></el-icon>
              <div class="upload-text">点击上传营业执照</div>
            </div>
          </el-upload>
          <div class="form-tip">支持 JPG、PNG、PDF 格式，文件大小不超过 5MB</div>
        </el-form-item>
        <el-form-item label="法人姓名" prop="legalPersonName">
          <el-input v-model="formData.legalPersonName" placeholder="请输入法人姓名" />
        </el-form-item>
        <el-form-item label="法人身份证号" prop="legalPersonIdCard">
          <el-input v-model="formData.legalPersonIdCard" placeholder="请输入法人身份证号" />
        </el-form-item>
        <el-form-item label="法人联系方式" prop="legalPersonPhone">
          <el-input v-model="formData.legalPersonPhone" placeholder="请输入法人联系方式" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="品牌详情"
      width="800px"
    >
      <el-descriptions :column="2" border v-if="selectedBrand">
        <el-descriptions-item label="品牌编码">{{ selectedBrand.brandCode }}</el-descriptions-item>
        <el-descriptions-item label="品牌名称">{{ selectedBrand.brandName }}</el-descriptions-item>
        <el-descriptions-item label="品牌LOGO" :span="2">
          <el-avatar 
            :src="selectedBrand.brandLogo" 
            :size="80"
            shape="square"
          >
            <img v-if="!selectedBrand.brandLogo" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          </el-avatar>
        </el-descriptions-item>
        <el-descriptions-item label="品牌分类">
          <el-tag :type="getCategoryTagType(selectedBrand.category)" size="small">
            {{ getCategoryLabel(selectedBrand.category) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="品牌联系人">{{ selectedBrand.contactPerson }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ selectedBrand.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="统一社会信用代码">{{ selectedBrand.creditCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="总部地址" :span="2">{{ selectedBrand.headquartersAddress }}</el-descriptions-item>
        <el-descriptions-item label="品牌介绍" :span="2">{{ selectedBrand.description }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ formatDateTime(selectedBrand.applicationTime) }}</el-descriptions-item>
        <el-descriptions-item label="入驻时间">
          {{ selectedBrand.entryTime ? formatDateTime(selectedBrand.entryTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="品牌应用" :span="2">
          <el-tag 
            v-for="app in selectedBrand.applications" 
            :key="app"
            size="small"
            style="margin-right: 5px"
          >
            {{ getApplicationLabel(app) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="营业执照" :span="2">
          <el-image
            v-if="selectedBrand.businessLicense"
            :src="selectedBrand.businessLicense"
            style="max-width: 400px; max-height: 300px"
            fit="contain"
            :preview-src-list="[selectedBrand.businessLicense]"
          />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="法人姓名">{{ selectedBrand.legalPersonName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="法人身份证号">{{ selectedBrand.legalPersonIdCard || '-' }}</el-descriptions-item>
        <el-descriptions-item label="法人联系方式">{{ selectedBrand.legalPersonPhone || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Search, Refresh, ArrowDown } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const dialogTitle = ref('新增品牌')
const formRef = ref(null)
const selectedBrand = ref(null)

// 搜索表单
const searchForm = ref({
  keyword: '',
  category: ''
})

// 分页
const pagination = ref({
  page: 1,
  size: 20,
  total: 0
})

// 表单数据
const formData = ref({
  id: null,
  brandCode: '',
  brandName: '',
  brandLogo: '',
  description: '',
  creditCode: '',
  headquartersAddress: '',
  contactPhone: '',
  category: '',
  contactPerson: '',
  applicationTime: '',
  entryTime: '',
  applications: [],
  businessLicense: '',
  legalPersonName: '',
  legalPersonIdCard: '',
  legalPersonPhone: ''
})

// 表单验证规则
const rules = {
  brandCode: [
    { required: true, message: '请输入品牌编码', trigger: 'blur' }
  ],
  brandName: [
    { required: true, message: '请输入品牌名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择品牌分类', trigger: 'change' }
  ],
  contactPerson: [
    { required: true, message: '请输入品牌联系人', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系方式', trigger: 'blur' }
  ],
  creditCode: [
    { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
    { pattern: /^[0-9A-Z]{18}$/, message: '统一社会信用代码需为18位大写字母或数字', trigger: 'blur' }
  ],
  applicationTime: [
    { required: true, message: '请选择申请时间', trigger: 'change' }
  ]
}

// 模拟品牌数据
const brands = ref([
  {
    id: 'brand-1',
    brandCode: 'BRAND001',
    brandName: '品牌A',
    brandLogo: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    description: '这是一个优秀的品牌，专注于提供高质量的产品和服务。',
    creditCode: '91310000MA1ABCDE1',
    headquartersAddress: '上海市浦东新区XX路XX号',
    contactPhone: '021-12345678',
    category: 'catering',
    contactPerson: '张三',
    applicationTime: new Date('2024-01-01 10:00:00'),
    entryTime: new Date('2024-01-15 10:00:00'),
    applications: ['web', 'ios', 'android'],
    businessLicense: '',
    legalPersonName: '王五',
    legalPersonIdCard: '310101199001011234',
    legalPersonPhone: '13800138000'
  },
  {
    id: 'brand-2',
    brandCode: 'BRAND002',
    brandName: '品牌B',
    brandLogo: '',
    description: '品牌B致力于创新和卓越。',
    creditCode: '91110000MA1FGHIJ2',
    headquartersAddress: '北京市朝阳区XX街XX号',
    contactPhone: '010-87654321',
    category: 'retail',
    contactPerson: '李四',
    applicationTime: new Date('2024-01-05 14:00:00'),
    entryTime: null,
    applications: ['web', 'miniprogram'],
    businessLicense: '',
    legalPersonName: '赵六',
    legalPersonIdCard: '110101199002021234',
    legalPersonPhone: '13900139000'
  }
])

// 过滤后的品牌列表
const filteredBrands = computed(() => {
  let result = brands.value
  
  // 关键词搜索
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    result = result.filter(brand => 
      brand.brandCode.toLowerCase().includes(keyword) ||
      brand.brandName.toLowerCase().includes(keyword) ||
      (brand.creditCode || '').toLowerCase().includes(keyword)
    )
  }
  
  // 分类筛选
  if (searchForm.value.category) {
    result = result.filter(brand => brand.category === searchForm.value.category)
  }
  
  // 更新总数
  pagination.value.total = result.length
  
  // 分页
  const start = (pagination.value.page - 1) * pagination.value.size
  const end = start + pagination.value.size
  return result.slice(start, end)
})

// 获取分类标签
const getCategoryLabel = (category) => {
  const map = {
    catering: '餐饮',
    retail: '零售',
    service: '服务',
    other: '其他'
  }
  return map[category] || category
}

// 获取分类标签颜色
const getCategoryTagType = (category) => {
  const map = {
    catering: 'success',
    retail: 'primary',
    service: 'warning',
    other: 'info'
  }
  return map[category] || ''
}

// 获取应用标签
const getApplicationLabel = (app) => {
  const map = {
    web: 'Web端',
    ios: '移动端（iOS）',
    android: '移动端（Android）',
    miniprogram: '小程序',
    h5: 'H5'
  }
  return map[app] || app
}

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 新增品牌
const handleAddBrand = () => {
  dialogTitle.value = '新增品牌'
  formData.value = {
    id: null,
    brandCode: '',
    brandName: '',
    brandLogo: '',
    description: '',
    creditCode: '',
    headquartersAddress: '',
    contactPhone: '',
    category: '',
    contactPerson: '',
    applicationTime: '',
    entryTime: '',
    applications: [],
    businessLicense: '',
    legalPersonName: '',
    legalPersonIdCard: '',
    legalPersonPhone: ''
  }
  dialogVisible.value = true
}

// 编辑品牌
const handleEditBrand = (row) => {
  dialogTitle.value = '编辑品牌'
  formData.value = JSON.parse(JSON.stringify(row))
  formData.value.applicationTime = formatDateTime(row.applicationTime)
  formData.value.entryTime = row.entryTime ? formatDateTime(row.entryTime) : ''
  dialogVisible.value = true
}

// 查看详情
const handleViewDetail = (row) => {
  selectedBrand.value = row
  detailDialogVisible.value = true
}

// 删除品牌
const handleDeleteBrand = (row) => {
  ElMessageBox.confirm('确定要删除该品牌吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = brands.value.findIndex(b => b.id === row.id)
    if (index > -1) {
      brands.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

// 保存品牌
const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (formData.value.id) {
        // 编辑
        const index = brands.value.findIndex(b => b.id === formData.value.id)
        if (index > -1) {
          brands.value[index] = {
            ...formData.value,
            applicationTime: new Date(formData.value.applicationTime),
            entryTime: formData.value.entryTime ? new Date(formData.value.entryTime) : null
          }
          ElMessage.success('更新成功')
        }
      } else {
        // 新增
        brands.value.push({
          ...formData.value,
          id: `brand-${Date.now()}`,
          applicationTime: new Date(formData.value.applicationTime),
          entryTime: formData.value.entryTime ? new Date(formData.value.entryTime) : null
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

// 上传前检查
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理上传
const handleUpload = (options) => {
  // 这里应该调用实际的上传API
  // 模拟上传成功
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.brandLogo = e.target.result
    ElMessage.success('上传成功')
  }
  reader.readAsDataURL(options.file)
}

// 营业执照上传前检查
const beforeUploadLicense = (file) => {
  const isImage = file.type.startsWith('image/')
  const isPdf = file.type === 'application/pdf'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage && !isPdf) {
    ElMessage.error('只能上传图片或PDF文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过 5MB!')
    return false
  }
  return true
}

// 处理营业执照上传
const handleUploadLicense = (options) => {
  // 这里应该调用实际的上传API
  // 模拟上传成功
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.businessLicense = e.target.result
    ElMessage.success('上传成功')
  }
  reader.readAsDataURL(options.file)
}

// 批量导入
const handleImportBrands = () => {
  ElMessage.info('批量导入功能开发中')
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
}

// 重置
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    category: ''
  }
  pagination.value.page = 1
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.page = 1
}

const handlePageChange = (page) => {
  pagination.value.page = page
}

// 初始化
onMounted(() => {
  // 可以在这里加载数据
})
</script>

<style scoped>
.brand-management {
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

.action-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-section {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.logo-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.logo-uploader:hover {
  border-color: #409eff;
}

.logo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.license-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.license-uploader:hover {
  border-color: #409eff;
}

.license-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.license-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
  color: #8c939d;
}
</style>

