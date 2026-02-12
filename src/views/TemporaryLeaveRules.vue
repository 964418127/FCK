<template>
  <div class="temporary-leave-rules">
    <div class="page-header">
      <h1>临时假获取规则</h1>
      <p>配置临时假获取规则</p>
    </div>
    
    <div class="content-section">
      <div class="left-section">
        <div class="config-group">
          <div class="config-header">
            <h3>城市配置</h3>
            <el-button type="primary" size="small" @click="openAddCityDialog">+ 新增城市</el-button>
          </div>
          <div class="config-content">
            <el-table :data="configTableData" border style="width: 100%">
              <el-table-column prop="type" label="类型" width="120"></el-table-column>
              <el-table-column label="临时休假时长获取" min-width="300">
                <template #default="scope">
                  <div v-if="scope.row.turnoverRate" class="config-item">
                    <span class="config-label">回头率</span>
                    <span class="condition-text">每高出 {{ scope.row.turnoverRate.percent }}%</span>
                    <span class="reward-text">时长+{{ scope.row.turnoverRate.hours }}小时</span>
                  </div>
                  <div v-if="scope.row.churnRate" class="config-item">
                    <span class="config-label">流失率</span>
                    <span class="condition-text">每低于 {{ scope.row.churnRate.percent }}%</span>
                    <span class="reward-text">时长+{{ scope.row.churnRate.hours }}小时</span>
                  </div>
                  <div v-if="scope.row.revenue" class="config-item">
                    <span class="config-label">产值差异</span>
                    <span class="condition-text">每高出 {{ scope.row.revenue.amount }}元</span>
                    <span class="reward-text">时长+{{ scope.row.revenue.hours }}小时</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="maxHours" label="获取上限" width="120">
                <template #default="scope">
                  {{ scope.row.maxHours }}小时/月
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="editConfig(scope.row)">编辑</el-button>
                  <el-button v-if="scope.row.type !== '通用配置'" type="danger" size="small" @click="deleteCity(scope.row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      
      <div class="right-section">
        <div class="config-group">
          <div class="config-header">
            <h3>门店配置</h3>
            <el-button type="primary" size="small" @click="openAddStoreDialog">+ 新增门店</el-button>
          </div>
          <div class="config-content">
            <el-table :data="storeTableData" border style="width: 100%">
              <el-table-column prop="storeName" label="门店名称" width="150"></el-table-column>
              <el-table-column prop="cityName" label="所属城市" width="120"></el-table-column>
              <el-table-column label="临时休假时长获取" min-width="300">
                <template #default="scope">
                  <div v-if="scope.row.turnoverRate" class="config-item">
                    <span class="config-label">回头率</span>
                    <span class="condition-text">每高出 {{ scope.row.turnoverRate.percent }}%</span>
                    <span class="reward-text">时长+{{ scope.row.turnoverRate.hours }}小时</span>
                  </div>
                  <div v-if="scope.row.churnRate" class="config-item">
                    <span class="config-label">流失率</span>
                    <span class="condition-text">每低于 {{ scope.row.churnRate.percent }}%</span>
                    <span class="reward-text">时长+{{ scope.row.churnRate.hours }}小时</span>
                  </div>
                  <div v-if="scope.row.revenue" class="config-item">
                    <span class="config-label">产值差异</span>
                    <span class="condition-text">每高出 {{ scope.row.revenue.amount }}元</span>
                    <span class="reward-text">时长+{{ scope.row.revenue.hours }}小时</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="maxHours" label="获取上限" width="120">
                <template #default="scope">
                  {{ scope.row.maxHours }}小时/月
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="editStore(scope.row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="deleteStore(scope.row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="editDialogVisible" :title="editForm.id === 0 ? '编辑通用配置' : `编辑${editForm.cityName}配置`" width="600px">
      <el-form label-width="140px">
        <el-form-item label="配置类型">
          <span>{{ editForm.id === 0 ? '通用' : '城市' }}</span>
        </el-form-item>
        <el-form-item v-if="editForm.id !== 0" label="城市名称">
          <el-select v-model="editForm.cityName" placeholder="请选择城市" style="width: 100%;">
            <el-option label="成都市" value="成都市"></el-option>
            <el-option label="德阳市" value="德阳市"></el-option>
            <el-option label="绵阳市" value="绵阳市"></el-option>
            <el-option label="重庆市" value="重庆市"></el-option>
            <el-option label="深圳市" value="深圳市"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="回头率：每高出">
          <el-input v-model="editForm.turnoverRate.percent" type="number" style="width: 100px;" min="0" max="100">
            <template #suffix>%</template>
          </el-input>
          <span style="margin: 0 10px;">获得休假时长</span>
          <el-input v-model="editForm.turnoverRate.hours" type="number" style="width: 100px;" min="0" step="0.1">
            <template #suffix>小时</template>
          </el-input>
        </el-form-item>
        <el-form-item label="流失率：每低于">
          <el-input v-model="editForm.churnRate.percent" type="number" style="width: 100px;" min="0" max="100">
            <template #suffix>%</template>
          </el-input>
          <span style="margin: 0 10px;">获得休假时长</span>
          <el-input v-model="editForm.churnRate.hours" type="number" style="width: 100px;" min="0" step="0.1">
            <template #suffix>小时</template>
          </el-input>
        </el-form-item>
        <el-form-item label="产值差异：每高出">
          <el-input v-model="editForm.revenue.amount" type="number" style="width: 100px;" min="0">
            <template #suffix>元</template>
          </el-input>
          <span style="margin: 0 10px;">获得休假时长</span>
          <el-input v-model="editForm.revenue.hours" type="number" style="width: 100px;" min="0" step="0.1">
            <template #suffix>小时</template>
          </el-input>
        </el-form-item>
        <el-form-item label="最多可获休假时长">
          <el-input v-model="editForm.maxHours" type="number" style="width: 150px;" min="1" max="100">
            <template #suffix>小时/月</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="addCityDialogVisible" title="新增城市配置" width="600px">
      <el-form label-width="140px">
        <el-form-item label="选择城市">
          <el-select v-model="addCityForm.cityName" placeholder="请选择城市" style="width: 100%;">
            <el-option label="成都市" value="成都市"></el-option>
            <el-option label="德阳市" value="德阳市"></el-option>
            <el-option label="绵阳市" value="绵阳市"></el-option>
            <el-option label="重庆市" value="重庆市"></el-option>
            <el-option label="深圳市" value="深圳市"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="回头率：每高出">
          <el-input v-model="addCityForm.turnoverRate.percent" type="number" style="width: 100px;" min="0" max="100">
            <template #suffix>%</template>
          </el-input>
          <span style="margin: 0 10px;">获得休假时长</span>
          <el-input v-model="addCityForm.turnoverRate.hours" type="number" style="width: 100px;" min="0" step="0.1">
            <template #suffix>小时</template>
          </el-input>
        </el-form-item>
        <el-form-item label="流失率：每低于">
          <el-input v-model="addCityForm.churnRate.percent" type="number" style="width: 100px;" min="0" max="100">
            <template #suffix>%</template>
          </el-input>
          <span style="margin: 0 10px;">获得休假时长</span>
          <el-input v-model="addCityForm.churnRate.hours" type="number" style="width: 100px;" min="0" step="0.1">
            <template #suffix>小时</template>
          </el-input>
        </el-form-item>
        <el-form-item label="产值差异：每高出">
          <el-input v-model="addCityForm.revenue.amount" type="number" style="width: 100px;" min="0">
            <template #suffix>元</template>
          </el-input>
          <span style="margin: 0 10px;">获得休假时长</span>
          <el-input v-model="addCityForm.revenue.hours" type="number" style="width: 100px;" min="0" step="0.1">
            <template #suffix>小时</template>
          </el-input>
        </el-form-item>
        <el-form-item label="最多可获休假时长">
          <el-input v-model="addCityForm.maxHours" type="number" style="width: 150px;" min="1" max="100">
            <template #suffix>小时/月</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addCityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addCity">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="addStoreDialogVisible" title="新增门店配置" width="600px">
      <el-form label-width="140px">
        <el-form-item label="选择门店">
          <el-select v-model="addStoreForm.storeName" placeholder="请选择门店" style="width: 100%;">
            <el-option label="天府凯德店" value="天府凯德店"></el-option>
            <el-option label="春熙路店" value="春熙路店"></el-option>
            <el-option label="交大店" value="交大店"></el-option>
            <el-option label="环球中心店" value="环球中心店"></el-option>
            <el-option label="万象城店" value="万象城店"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="回头率：每高出">
          <el-input v-model="addStoreForm.turnoverRate.percent" type="number" style="width: 100px;" min="0" max="100">
            <template #suffix>%</template>
          </el-input>
          <span style="margin: 0 10px;">获得休假时长</span>
          <el-input v-model="addStoreForm.turnoverRate.hours" type="number" style="width: 100px;" min="0" step="0.1">
            <template #suffix>小时</template>
          </el-input>
        </el-form-item>
        <el-form-item label="流失率：每低于">
          <el-input v-model="addStoreForm.churnRate.percent" type="number" style="width: 100px;" min="0" max="100">
            <template #suffix>%</template>
          </el-input>
          <span style="margin: 0 10px;">获得休假时长</span>
          <el-input v-model="addStoreForm.churnRate.hours" type="number" style="width: 100px;" min="0" step="0.1">
            <template #suffix>小时</template>
          </el-input>
        </el-form-item>
        <el-form-item label="产值差异：每高出">
          <el-input v-model="addStoreForm.revenue.amount" type="number" style="width: 100px;" min="0">
            <template #suffix>元</template>
          </el-input>
          <span style="margin: 0 10px;">获得休假时长</span>
          <el-input v-model="addStoreForm.revenue.hours" type="number" style="width: 100px;" min="0" step="0.1">
            <template #suffix>小时</template>
          </el-input>
        </el-form-item>
        <el-form-item label="最多可获休假时长">
          <el-input v-model="addStoreForm.maxHours" type="number" style="width: 150px;" min="1" max="100">
            <template #suffix>小时/月</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addStoreDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addStore">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="editStoreDialogVisible" :title="`编辑${editStoreForm.storeName}配置`" width="600px">
      <el-form label-width="140px">
        <el-form-item label="门店名称">
          <el-input v-model="editStoreForm.storeName" placeholder="请输入门店名称"></el-input>
        </el-form-item>
        <el-form-item label="所属城市">
          <el-select v-model="editStoreForm.cityName" placeholder="请选择城市" style="width: 100%;">
            <el-option label="成都市" value="成都市"></el-option>
            <el-option label="德阳市" value="德阳市"></el-option>
            <el-option label="绵阳市" value="绵阳市"></el-option>
            <el-option label="重庆市" value="重庆市"></el-option>
            <el-option label="深圳市" value="深圳市"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="回头率：每高出">
          <el-input v-model="editStoreForm.turnoverRate.percent" type="number" style="width: 100px;" min="0" max="100">
            <template #suffix>%</template>
          </el-input>
          <span style="margin: 0 10px;">获得休假时长</span>
          <el-input v-model="editStoreForm.turnoverRate.hours" type="number" style="width: 100px;" min="0" step="0.1">
            <template #suffix>小时</template>
          </el-input>
        </el-form-item>
        <el-form-item label="流失率：每低于">
          <el-input v-model="editStoreForm.churnRate.percent" type="number" style="width: 100px;" min="0" max="100">
            <template #suffix>%</template>
          </el-input>
          <span style="margin: 0 10px;">获得休假时长</span>
          <el-input v-model="editStoreForm.churnRate.hours" type="number" style="width: 100px;" min="0" step="0.1">
            <template #suffix>小时</template>
          </el-input>
        </el-form-item>
        <el-form-item label="产值差异：每高出">
          <el-input v-model="editStoreForm.revenue.amount" type="number" style="width: 100px;" min="0">
            <template #suffix>元</template>
          </el-input>
          <span style="margin: 0 10px;">获得休假时长</span>
          <el-input v-model="editStoreForm.revenue.hours" type="number" style="width: 100px;" min="0" step="0.1">
            <template #suffix>小时</template>
          </el-input>
        </el-form-item>
        <el-form-item label="最多可获休假时长">
          <el-input v-model="editStoreForm.maxHours" type="number" style="width: 150px;" min="1" max="100">
            <template #suffix>小时/月</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editStoreDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStore">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

const globalConfig = reactive({
  turnoverRate: {
    percent: 10,
    hours: 1
  },
  churnRate: {
    percent: 10,
    hours: 1
  },
  revenue: {
    amount: 2000,
    hours: 1
  },
  maxHours: 16
})

const cityConfigs = ref([
  {
    id: 1,
    cityName: '成都市',
    turnoverRate: {
      percent: 10,
      hours: 1
    },
    churnRate: {
      percent: 10,
      hours: 1
    },
    revenue: {
      amount: 2000,
      hours: 1
    },
    maxHours: 16
  }
])

const storeConfigs = ref([
  {
    id: 1,
    storeName: '天府凯德店',
    cityName: '成都市',
    turnoverRate: {
      percent: 10,
      hours: 1
    },
    churnRate: {
      percent: 10,
      hours: 1
    },
    revenue: {
      amount: 2000,
      hours: 1
    },
    maxHours: 16
  }
])

const editDialogVisible = ref(false)
const addCityDialogVisible = ref(false)
const addStoreDialogVisible = ref(false)
const editStoreDialogVisible = ref(false)

const editForm = reactive({
  id: 0,
  turnoverRate: {
    percent: 10,
    hours: 1
  },
  churnRate: {
    percent: 10,
    hours: 1
  },
  revenue: {
    amount: 2000,
    hours: 1
  },
  maxHours: 16
})

const addCityForm = reactive({
  cityName: '',
  turnoverRate: {
    percent: 10,
    hours: 1
  },
  churnRate: {
    percent: 10,
    hours: 1
  },
  revenue: {
    amount: 2000,
    hours: 1
  },
  maxHours: 16
})

const addStoreForm = reactive({
  storeName: '',
  cityName: '',
  turnoverRate: {
    percent: 10,
    hours: 1
  },
  churnRate: {
    percent: 10,
    hours: 1
  },
  revenue: {
    amount: 2000,
    hours: 1
  },
  maxHours: 16
})

const editStoreForm = reactive({
  id: 0,
  storeName: '',
  cityName: '',
  turnoverRate: {
    percent: 10,
    hours: 1
  },
  churnRate: {
    percent: 10,
    hours: 1
  },
  revenue: {
    amount: 2000,
    hours: 1
  },
  maxHours: 16
})

const configTableData = computed(() => {
  const data = [
    {
      id: 0,
      type: '通用配置',
      turnoverRate: globalConfig.turnoverRate,
      churnRate: globalConfig.churnRate,
      revenue: globalConfig.revenue,
      maxHours: globalConfig.maxHours
    }
  ]
  cityConfigs.value.forEach(city => {
    data.push({
      id: city.id,
      type: city.cityName,
      turnoverRate: city.turnoverRate,
      churnRate: city.churnRate,
      revenue: city.revenue,
      maxHours: city.maxHours
    })
  })
  return data
})

const storeTableData = computed(() => storeConfigs.value)

const editConfig = (row) => {
  editForm.id = row.id
  editForm.turnoverRate.percent = row.turnoverRate.percent
  editForm.turnoverRate.hours = row.turnoverRate.hours
  editForm.churnRate.percent = row.churnRate.percent
  editForm.churnRate.hours = row.churnRate.hours
  editForm.revenue.amount = row.revenue.amount
  editForm.revenue.hours = row.revenue.hours
  editForm.maxHours = row.maxHours
  editDialogVisible.value = true
}

const saveConfig = () => {
  if (editForm.id === 0) {
    globalConfig.turnoverRate.percent = editForm.turnoverRate.percent
    globalConfig.turnoverRate.hours = editForm.turnoverRate.hours
    globalConfig.churnRate.percent = editForm.churnRate.percent
    globalConfig.churnRate.hours = editForm.churnRate.hours
    globalConfig.revenue.amount = editForm.revenue.amount
    globalConfig.revenue.hours = editForm.revenue.hours
    globalConfig.maxHours = editForm.maxHours
  } else {
    const cityIndex = cityConfigs.value.findIndex(c => c.id === editForm.id)
    if (cityIndex !== -1) {
      cityConfigs.value[cityIndex].turnoverRate.percent = editForm.turnoverRate.percent
      cityConfigs.value[cityIndex].turnoverRate.hours = editForm.turnoverRate.hours
      cityConfigs.value[cityIndex].churnRate.percent = editForm.churnRate.percent
      cityConfigs.value[cityIndex].churnRate.hours = editForm.churnRate.hours
      cityConfigs.value[cityIndex].revenue.amount = editForm.revenue.amount
      cityConfigs.value[cityIndex].revenue.hours = editForm.revenue.hours
      cityConfigs.value[cityIndex].maxHours = editForm.maxHours
    }
  }
  editDialogVisible.value = false
}

const openAddCityDialog = () => {
  addCityForm.cityName = ''
  addCityForm.turnoverRate.percent = 10
  addCityForm.turnoverRate.hours = 1
  addCityForm.churnRate.percent = 10
  addCityForm.churnRate.hours = 1
  addCityForm.revenue.amount = 2000
  addCityForm.revenue.hours = 1
  addCityForm.maxHours = 16
  addCityDialogVisible.value = true
}

const addCity = () => {
  if (!addCityForm.cityName) {
    return
  }
  const newCity = {
    id: Date.now(),
    cityName: addCityForm.cityName,
    turnoverRate: {
      percent: addCityForm.turnoverRate.percent,
      hours: addCityForm.turnoverRate.hours
    },
    churnRate: {
      percent: addCityForm.churnRate.percent,
      hours: addCityForm.churnRate.hours
    },
    revenue: {
      amount: addCityForm.revenue.amount,
      hours: addCityForm.revenue.hours
    },
    maxHours: addCityForm.maxHours
  }
  cityConfigs.value.push(newCity)
  addCityDialogVisible.value = false
}

const deleteCity = (id) => {
  const index = cityConfigs.value.findIndex(c => c.id === id)
  if (index !== -1) {
    cityConfigs.value.splice(index, 1)
  }
}

const openAddStoreDialog = () => {
  addStoreForm.storeName = '天府凯德店'
  addStoreForm.cityName = '成都市'
  addStoreForm.turnoverRate.percent = 10
  addStoreForm.turnoverRate.hours = 1
  addStoreForm.churnRate.percent = 10
  addStoreForm.churnRate.hours = 1
  addStoreForm.revenue.amount = 2000
  addStoreForm.revenue.hours = 1
  addStoreForm.maxHours = 16
  addStoreDialogVisible.value = true
}

const addStore = () => {
  if (!addStoreForm.storeName || !addStoreForm.cityName) {
    return
  }
  const newStore = {
    id: Date.now(),
    storeName: addStoreForm.storeName,
    cityName: addStoreForm.cityName,
    turnoverRate: {
      percent: addStoreForm.turnoverRate.percent,
      hours: addStoreForm.turnoverRate.hours
    },
    churnRate: {
      percent: addStoreForm.churnRate.percent,
      hours: addStoreForm.churnRate.hours
    },
    revenue: {
      amount: addStoreForm.revenue.amount,
      hours: addStoreForm.revenue.hours
    },
    maxHours: addStoreForm.maxHours
  }
  storeConfigs.value.push(newStore)
  addStoreDialogVisible.value = false
}

const editStore = (row) => {
  editStoreForm.id = row.id
  editStoreForm.storeName = row.storeName
  editStoreForm.cityName = row.cityName
  editStoreForm.turnoverRate.percent = row.turnoverRate.percent
  editStoreForm.turnoverRate.hours = row.turnoverRate.hours
  editStoreForm.churnRate.percent = row.churnRate.percent
  editStoreForm.churnRate.hours = row.churnRate.hours
  editStoreForm.revenue.amount = row.revenue.amount
  editStoreForm.revenue.hours = row.revenue.hours
  editStoreForm.maxHours = row.maxHours
  editStoreDialogVisible.value = true
}

const saveStore = () => {
  const storeIndex = storeConfigs.value.findIndex(s => s.id === editStoreForm.id)
  if (storeIndex !== -1) {
    storeConfigs.value[storeIndex].storeName = editStoreForm.storeName
    storeConfigs.value[storeIndex].cityName = editStoreForm.cityName
    storeConfigs.value[storeIndex].turnoverRate.percent = editStoreForm.turnoverRate.percent
    storeConfigs.value[storeIndex].turnoverRate.hours = editStoreForm.turnoverRate.hours
    storeConfigs.value[storeIndex].churnRate.percent = editStoreForm.churnRate.percent
    storeConfigs.value[storeIndex].churnRate.hours = editStoreForm.churnRate.hours
    storeConfigs.value[storeIndex].revenue.amount = editStoreForm.revenue.amount
    storeConfigs.value[storeIndex].revenue.hours = editStoreForm.revenue.hours
    storeConfigs.value[storeIndex].maxHours = editStoreForm.maxHours
  }
  editStoreDialogVisible.value = false
}

const deleteStore = (id) => {
  const index = storeConfigs.value.findIndex(s => s.id === id)
  if (index !== -1) {
    storeConfigs.value.splice(index, 1)
  }
}
</script>

<style scoped>
.temporary-leave-rules {
  padding: 20px;
  background: #f5f5f5;
}

.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.page-header p {
  margin: 0;
  color: #999;
}

.content-section {
  display: flex;
  gap: 20px;
}

.left-section, .right-section {
  flex: 1;
}

.config-group {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.config-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.config-content {
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.config-item {
  margin-bottom: 12px;
  line-height: 1.6;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-label {
  font-weight: bold;
  color: #333;
  margin-right: 8px;
}

.condition-text {
  color: #666;
  margin-right: 8px;
}

.reward-text {
  color: #409EFF;
  font-weight: bold;
  margin-left: 8px;
}
</style>
