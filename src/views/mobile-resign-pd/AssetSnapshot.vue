<template>
  <div class="asset-panel">
    <!-- 常乐豆：账面 / 待结 / 可提取，三层分开（全部为预估） -->
    <div class="asset-block">
      <div class="asset-block-head">
        <span class="ab-name">常乐豆<span class="est-pill">预估</span></span>
        <span class="ab-src">来源：常乐豆系统 / 薪酬结算</span>
      </div>
      <div class="asset-row"><span>当前账面余额</span><b class="est">约 ¥ {{ snap.bean.onBook }}</b></div>
      <div class="asset-row"><span>待结数量</span><b class="est">约 ¥ {{ snap.bean.pending }}</b></div>
      <div class="asset-row hl">
        <span>预估可提取（负工资处理后）</span>
        <b v-if="snap.bean.settled" class="est">约 ¥ {{ snap.bean.withdrawable }}</b>
        <b v-else class="pending-text">待负工资结算后确认</b>
      </div>
    </div>

    <!-- 负工资账户：仅展示余额 -->
    <div class="asset-block">
      <div class="asset-block-head">
        <span class="ab-name">负工资账户<span class="est-pill">预估</span></span>
        <span class="ab-src">来源：薪酬</span>
      </div>
      <div class="asset-row">
        <span>账户余额</span>
        <b class="est" :class="{ danger: snap.negative.account < 0 }">约 ¥ {{ snap.negative.account }}</b>
      </div>
    </div>

    <!-- 剩余福利假额 -->
    <div class="asset-block">
      <div class="asset-block-head">
        <span class="ab-name">剩余福利假额</span>
        <span class="ab-src">来源：假勤</span>
      </div>
      <div v-for="q in snap.quota.rows" :key="q.name" class="asset-row">
        <span>{{ q.name }}剩余</span>
        <b>{{ q.remain }} {{ q.unit }}</b>
      </div>
    </div>

    <!-- 在途协商扣缴（如有） -->
    <div v-if="snap.consult" class="asset-block warn-block">
      <div class="asset-block-head">
        <span class="ab-name">在途协商扣缴</span>
        <span class="ab-src">来源：薪酬扣缴协商</span>
      </div>
      <div class="asset-row"><span>协议总额</span><b>¥ {{ snap.consult.total }}</b></div>
      <div class="asset-row"><span>每月扣除</span><b>¥ {{ snap.consult.perMonth }}</b></div>
      <div class="asset-row"><span>剩余未扣</span><b class="danger">¥ {{ snap.consult.remain }}</b></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  snap: { type: Object, required: true }
})
</script>

<style scoped>
.asset-block { border-top: 1px solid #f5f5f5; padding-top: 12px; margin-top: 12px; }
.asset-block:first-of-type { border-top: none; margin-top: 0; padding-top: 0; }
.asset-block-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; }
.ab-name { font-size: 13.5px; font-weight: 600; color: #333; }
.est-pill { font-size: 10px; font-weight: 600; color: #b45309; background: #fef3c7; border-radius: 8px; padding: 0 6px; margin-left: 5px; vertical-align: 1px; }
.ab-src { font-size: 10.5px; color: #b0aaac; }
.asset-row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; padding: 6px 0; font-size: 13px; }
.asset-row span { color: #888; }
.asset-row b { color: #333; font-weight: 600; }
.asset-row b.est { color: #4b4b4b; }
.asset-row.hl { background: #fff8fa; border-radius: 8px; padding: 8px 10px; margin: 4px -2px; }
.asset-row.hl b { color: #a40035; font-size: 15px; }
.asset-row.hl b.est { color: #a40035; }
.asset-row b.danger { color: #b91c1c; }
.pending-text { color: #b45309 !important; font-size: 12.5px !important; font-weight: 500 !important; }

.warn-block { background: #fef7ec; border-radius: 10px; padding: 12px; margin-top: 12px; border-top: none; }
.warn-block .ab-name { color: #92400e; }
</style>
