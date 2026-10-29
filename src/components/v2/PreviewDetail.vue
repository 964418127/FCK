<!-- 预览详情：画布点中哪一条，这里就把这一条要交什么写全 -->
<template>
  <div :class="['pd', { embed: headless }]">
    <template v-if="row">
      <div v-if="!headless" class="pd-top">
        <span class="pd-lv">第 {{ row.level + 1 }} 步</span>
        <span class="pd-goal">{{ row.goal }}</span>
        <span :class="['pd-gate', row.gate]">{{ row.gate === 'optional' ? '可选' : '必过' }}</span>
      </div>

      <div v-for="(w, wi) in row.ways" :key="wi" class="pd-way" :class="w.kind">
        <div class="pd-wl">
          <span :class="['pd-kind', w.kind]">{{ w.kindLabel }}</span>
          <span class="pd-who">{{ w.who }}</span>
        </div>
        <div v-if="w.freq" class="pd-freq">{{ w.freq }}</div>

        <div v-for="(itx, ii) in w.items" :key="ii" class="pd-item">
          <div class="pd-it"><b>{{ itx.title }}</b><span>{{ itx.require }}</span></div>
          <div v-if="itx.fields.length" class="pd-fields">
            <span v-for="fd in itx.fields" :key="fd.key" :class="['fchip', { req: fd.required }]">
              {{ fd.label }}<i>{{ fd.typeText }}</i>
            </span>
          </div>
        </div>
      </div>

      <div class="pd-dep">
        <span class="pd-k">{{ row.deps.length ? '等这些办结' : '没有前置（发起即可办）' }}</span>
        <span v-if="row.deps.length" class="pd-v">{{ row.deps.join('、') }}</span>
      </div>
    </template>
    <div v-else class="pd-empty">点左边任意一张卡片，看这一步到底要交什么。</div>
  </div>
</template>

<script setup>
defineProps({
  /** { level, goal, gate, ways[], deps[] } */
  row: { type: Object, default: null },
  /** 嵌在某一行的卡片里时用它：结论与门禁外面已经显示过了，不再重复一遍 */
  headless: { type: Boolean, default: false }
})
</script>

<style scoped>
.pd { padding: 10px 13px 14px; }
.pd.embed { padding: 2px 0 2px 0; }
.pd-top { display: flex; align-items: baseline; gap: 6px; }
.pd-lv { flex: none; font-size: 9.5px; font-weight: 600; color: #a40035; background: #fbeef3; border-radius: 4px; padding: 0 5px; }
.pd-goal { flex: 1; min-width: 0; font-size: 13px; font-weight: 600; color: #2c2a33; line-height: 1.45; }
.pd-gate { flex: none; font-size: 9.5px; border-radius: 4px; padding: 0 5px; color: #8a6a2a; background: #fdf3e2; }
.pd-gate.optional { color: #7b7a86; background: #f4f3f7; }

.pd-way { margin-top: 10px; border-left: 2px solid #e7e4f8; padding-left: 9px; }
.pd-way.system { border-color: #d6ece2; }
.pd-way.action { border-color: #dbe7f6; }
.pd-way.external { border-color: #f3e7d2; }
.pd-wl { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
.pd-kind { flex: none; font-size: 9px; line-height: 1.7; padding: 0 5px; border-radius: 4px; color: #3f5fa8; background: #eef4ff; }
.pd-kind.system { color: #1d7a55; background: #e8f6ef; }
.pd-kind.action { color: #534ab7; background: #f1ecfd; }
.pd-kind.external { color: #9a6a1e; background: #fdf3e2; }
.pd-who { font-size: 11.5px; color: #5b5762; }
.pd-freq { margin-top: 2px; font-size: 10.5px; color: #1d7a55; }
.pd-item { margin-top: 5px; }
.pd-it { font-size: 11.5px; line-height: 1.6; color: #7a7480; }
.pd-it b { margin-right: 6px; font-weight: 600; color: #4a4750; }
.pd-fields { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 3px; }
.fchip { font-size: 9.5px; line-height: 1.7; color: #6b6570; background: #f6f5f9; border-radius: 4px; padding: 0 5px; }
.fchip.req { color: #a4144a; background: #fdeef2; }
.fchip i { font-style: normal; color: #a3a0a1; margin-left: 3px; }
.pd-dep { margin-top: 12px; padding-top: 9px; border-top: 1px dashed #f0eef4; font-size: 11px; }
.pd-k { color: #8a8489; }
.pd-v { display: block; margin-top: 3px; color: #5b5762; line-height: 1.6; }
.pd-empty { padding: 26px 6px; font-size: 12px; color: #b0aebe; text-align: center; }
</style>
