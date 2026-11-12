<!--
  移动端 · 排班通知（v3 独立入口）
  从排班页拆出来的系统通知：被挤出 / 兜底安排 / 系统直派 / 待审，按身份过滤。
  视觉对齐 MobileParttimeTasks：全屏页、白色页头、#f5f5f5 底、白卡 12px、品牌红 #a40035。
-->
<template>
  <div class="m-page">
    <header class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>排班通知</h1>
      <div class="ps-slot"><PersonaSwitch3 /></div>
    </header>

    <div class="content-container">
      <div v-for="n in notices" :key="n.id" :class="['notice-card', n.kind]">
        <div class="nc-head">
          <strong>{{ n.title }}</strong>
          <span class="nc-date">{{ n.date.slice(5) }}</span>
        </div>
        <p>{{ n.desc }}</p>
      </div>
      <div v-if="!notices.length" class="empty-text">没有新通知</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { me3, noticesOf3 } from '../mock/scheduleV3Store.js'
import PersonaSwitch3 from '../components/v3/PersonaSwitch3.vue'

const router = useRouter()
const me = computed(() => me3())

/** 返回：一律回移动端菜单（移动端自己的桌面），不回 web 配置台 */
const goBack = () => router.replace({ name: 'mobile-menu' })

const notices = computed(() => noticesOf3(me.value.id))
</script>

<style scoped>
.m-page { min-height: 100vh; height: 100vh; display: flex; flex-direction: column; background: #f5f5f5; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0, 0, 0, .06); }
.back-icon { font-size: 22px; color: #333; cursor: pointer; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }
.ps-slot { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); }
.content-container { flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 12px 15px 30px; }

/* 通知卡（对齐 incoming-card 风格） */
.notice-card { background: #fff; border: 1px solid #eee; border-left: 3px solid #d8d3d5; border-radius: 10px; padding: 13px 14px; margin-bottom: 10px; }
.notice-card.lost { border-left-color: #a40035; }
.notice-card.fallback { border-left-color: #e0a300; }
.notice-card.assigned { border-left-color: #247354; }
.notice-card.pending { border-left-color: #e0a300; }
.nc-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.nc-head strong { font-size: 13.5px; color: #333; }
.nc-date { font-size: 11px; color: #aaa; }
.notice-card p { margin: 8px 0 0; padding: 8px 10px; border-radius: 6px; background: #f9f9f9; font-size: 12px; line-height: 1.65; color: #777; }

.empty-text { font-size: 13px; color: #999; padding: 30px 0; text-align: center; }
</style>
