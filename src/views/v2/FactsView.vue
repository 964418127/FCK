<!--
  起草依据：定义期喂给事件 Agent 的事实全集（只读）

  为什么单独成页，而不摆在对话页右侧：
    它是一份常量，不是这一轮对话的产物 —— 与「契约全文」成对：
      契约全文  规定模型能输出什么形状
      起草依据  规定模型能看见什么事实
    两样都只在核对时看，不需要占着对话的半屏。

  数据不在这里硬写：城市 / 门店 / 岗位 / 用工 / 权限基线取 base.js 与 model.js，
  原文取 prompt.js 的 designFactsText()，与真正拼进提示词的字符串同一份。
-->
<template>
  <div class="fv">
    <div class="page-header">
      <div class="header-main">
        <h1>起草依据</h1>
        <span class="sub">
          事件 Agent 在定义期能看见的全部事实 · 逐字进入提示词「## 事实」段
        </span>
      </div>
      <div class="head-right">
        <span class="ver-chip">{{ CONTRACT.id }} {{ CONTRACT.version }}</span>
        <span class="count-chip">{{ org.cities.length }} 城市 · {{ org.stores.length }} 门店 · {{ jobs.length }} 岗位</span>
      </div>
    </div>

    <div class="gist">
      <span class="gk">核心</span>
      <span class="gt">
        定义期只给组织与目录，不给任何具体员工。某个人此刻的账号、欠款、假勤余额逐人不同，属于触发后随单带进来的数据 ——
        拿一个人当样本，等于用他的数值替一群人拍口径，还会把「这一单的人」误当成「这类人」。
      </span>
    </div>

    <!-- 一 / 城市与责任人 -->
    <section class="card">
      <div class="c-head">
        <b>城市与责任人</b>
        <span class="c-sub">人事经理 / 城市总按城市解析，审核落到哪个城市就是谁</span>
        <em class="c-count">{{ org.cities.length }} 个城市</em>
      </div>
      <div class="tbl">
        <div class="t-head cols-city">
          <span>城市</span><span>大区</span><span>人事经理</span><span>城市总</span><span>门店</span><span class="r">占编制比</span>
        </div>
        <div v-for="c in org.cities" :key="c.name" class="t-row cols-city">
          <span class="strong">{{ c.name }}</span>
          <span class="muted">{{ c.region }}</span>
          <span>{{ c.hr }}</span>
          <span>{{ c.cityHead }}</span>
          <span class="muted">{{ c.stores.length }} 家</span>
          <span class="r">{{ cityShare(c.name) }}</span>
        </div>
      </div>
      <div class="c-note">城市编制在这里只作人数估算的权重，不与岗位编制相加（两者口径不同）。</div>
    </section>

    <!-- 二 / 门店与责任人 -->
    <section class="card">
      <div class="c-head">
        <b>门店与责任人</b>
        <span class="c-sub">店长 / 直属上级按门店解析；门店也决定店长这一角色在人群里是不是真的存在</span>
        <em class="c-count">{{ org.stores.length }} 家门店</em>
      </div>
      <div class="tbl narrow">
        <div class="t-head cols-store">
          <span>门店</span><span>城市</span><span>店长</span><span>直属上级</span>
        </div>
        <div v-for="s in org.stores" :key="s.name" class="t-row cols-store">
          <span class="strong">{{ s.name }}</span>
          <span class="muted">{{ s.city }}</span>
          <span>{{ s.manager }}</span>
          <span>{{ s.supervisor }}</span>
        </div>
      </div>
    </section>

    <!-- 三 / 岗位与用工 -->
    <section class="card">
      <div class="c-head">
        <b>岗位与编制</b>
        <span class="c-sub">人群人数按「岗位编制 × 城市占比 × 用工占比」估算，不信模型自己给的人数</span>
      </div>
      <div class="grid2">
        <div class="tbl">
          <div class="t-head cols-two"><span>岗位</span><span class="r">编制</span></div>
          <div v-for="j in jobs" :key="j.key" class="t-row cols-two">
            <span class="strong">{{ j.key }}</span>
            <span class="r">{{ j.headcount }}</span>
          </div>
        </div>
        <div class="tbl">
          <div class="t-head cols-two"><span>用工类型</span><span class="r">编制</span></div>
          <div v-for="e in employTypes" :key="e.key" class="t-row cols-two">
            <span class="strong">{{ e.key }}</span>
            <span class="r">{{ e.headcount }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 四 / 岗位权限基线 -->
    <section class="card">
      <div class="c-head">
        <b>岗位权限基线</b>
        <span class="c-sub">该岗位离职时「应有尽除」的账号清单 —— 是基线，不是某个人当前实际持有的账号</span>
      </div>
      <div class="perm-rows">
        <div v-for="(keys, job) in jobPerms" :key="job" class="perm-row">
          <span class="perm-job">{{ job }}</span>
          <span class="perm-chips">
            <span v-for="k in keys" :key="k" class="pchip">
              {{ permName(k) }}<em>{{ permSide(k) }}</em>
            </span>
          </span>
        </div>
      </div>
      <div class="c-note">
        逐人实际账号逐单不同：超基线持有（例如推拿师多一个 Web 后台 · 门店报表）要到触发后才知道，定义期不假设。
      </div>
    </section>

    <!-- 五 / 角色解析口径 -->
    <section class="card">
      <div class="c-head">
        <b>角色解析口径</b>
        <span class="c-sub">编排里人办与审核只写角色 key，落不到人的角色等于这一步不成立</span>
        <em class="c-count">{{ roles.length }} 个角色</em>
      </div>
      <div class="tbl">
        <div class="t-head cols-role"><span>角色</span><span>解析方式</span><span>例</span></div>
        <div v-for="r in roleRules" :key="r.key" class="t-row cols-role">
          <span class="strong">{{ r.label }}</span>
          <span>{{ r.by }}</span>
          <span class="muted">{{ r.eg }}</span>
        </div>
      </div>
    </section>

    <!-- 六 / 不喂什么 -->
    <section class="card">
      <div class="c-head">
        <b>不喂什么</b>
        <span class="c-sub">这些要触发后随单带入；写进定义期就会被当成口径</span>
      </div>
      <div class="neg-rows">
        <div v-for="n in notFed" :key="n.t" class="neg-row">
          <span class="neg-mark">×</span>
          <span class="neg-t">{{ n.t }}</span>
          <span class="neg-w">{{ n.why }}</span>
        </div>
      </div>
    </section>

    <!-- 七 / 原文 -->
    <section class="card">
      <div class="c-head">
        <b>喂给模型的原文</b>
        <span class="c-sub">与提示词里「## 事实（已从系统查到，只能用这些）」完全同一份，改数据请改 base.js / model.js</span>
      </div>
      <pre class="raw">{{ rawFacts }}</pre>
      <div class="c-note">
        目录类内容（触点、组织维度取值、系统检查项、动作、系统权限目录）不在这里 ——
        <router-link :to="{ name: 'v2-sys-items' }">系统项目录</router-link>
        ；
        形状约束（对象、字段、不变式、纪律）见
        <router-link :to="{ name: 'v2-contract' }">契约全文</router-link>。
      </div>
    </section>
  </div>
</template>

<script setup>
import { org, jobPerms, permName, permSide } from '../../v2/base.js'
import { jobs, cities, employTypes, roles, roleLabel } from '../../v2/model.js'
import { designFactsText } from '../../v2/prompt.js'
import { CONTRACT } from '../../v2/contract.js'

const rawFacts = designFactsText()

const cityShare = (name) => {
  const total = cities.reduce((a, b) => a + b.headcount, 0)
  const c = cities.find((x) => x.key === name)
  return c ? `${Math.round((c.headcount / total) * 100)}%` : '—'
}

/** 每个角色怎么落地 —— 与 prompt.js 里「角色解析口径」那句一致 */
const RULE = {
  employee: { by: '按触发人', eg: '触发那件事上的人' },
  'store-manager': { by: '按门店解析', eg: `${org.stores[0].name} → ${org.stores[0].manager}` },
  supervisor: { by: '按门店解析', eg: `${org.stores[0].name} → ${org.stores[0].supervisor}` },
  hr: { by: '按城市解析', eg: `${org.cities[0].name} → ${org.cities[0].hr}` },
  'city-head': { by: '按城市解析', eg: `${org.cities[0].name} → ${org.cities[0].cityHead}` },
  it: { by: '总部固定责任人', eg: `总部 → ${org.hq.it}` },
  finance: { by: '总部固定责任人', eg: `总部 → ${org.hq.finance}` },
  'region-head': { by: '总部固定责任人', eg: `总部 → ${org.hq.regionHead}` },
  gm: { by: '总部固定责任人', eg: `总部 → ${org.hq.gm}` }
}
const roleRules = roles.map((r) => ({ key: r.key, label: roleLabel(r.key), ...(RULE[r.key] || { by: '未定义', eg: '—' }) }))

const notFed = [
  { t: '某个人的系统账号清单', why: '逐人不同，且会中途变化；基线在岗，实际持有在单' },
  { t: '欠款 / 备用金 / 报销合计', why: '金额随单变动，是判定项批次的取数结果' },
  { t: '假勤剩余（年假 / 调休 / 病假）', why: '同上，且清算是下游系统的活' },
  { t: '这一单是谁、期望离职日期', why: '由申请单在触发时带入（取数契约只写取什么，不写取到多少）' }
]
</script>

<style scoped>
.fv { padding: 18px 22px 34px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
.header-main h1 { margin: 0 0 4px; font-size: 20px; }
.header-main .sub { font-size: 12.5px; color: #8a8f99; }
.head-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ver-chip { font-size: 12px; color: #534ab7; background: #eeedfe; border-radius: 9px; padding: 3px 10px; font-family: ui-monospace, monospace; }
.count-chip { font-size: 12px; color: #5f6368; background: #f1f2f5; border-radius: 9px; padding: 3px 10px; }

.gist { display: flex; gap: 10px; align-items: flex-start; background: #f7f8fa; border: 1px solid #ececf0; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; }
.gk { flex-shrink: 0; font-size: 12px; font-weight: 600; color: #534ab7; background: #eeedfe; border-radius: 8px; padding: 2px 8px; }
.gt { font-size: 12.5px; color: #5f6368; line-height: 1.7; }

.card { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; }
.c-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.c-head b { font-size: 14px; color: #2b2b33; }
.c-sub { font-size: 11.5px; color: #a3a0a1; line-height: 1.6; }
.c-count { margin-left: auto; font-style: normal; font-size: 11.5px; color: #8a8f99; background: #f5f6f8; border-radius: 8px; padding: 2px 9px; }
.c-note { font-size: 11.5px; color: #8a8f99; line-height: 1.75; margin-top: 10px; }
.c-note a { color: #534ab7; text-decoration: none; }

.tbl { display: flex; flex-direction: column; }
.tbl.narrow { max-width: 620px; }
.t-head, .t-row { display: grid; gap: 8px; align-items: center; padding: 6px 0; }
.cols-city { grid-template-columns: 90px 100px 100px 100px 1fr 80px; }
.cols-store { grid-template-columns: 220px 90px 120px 120px; }
.cols-two { grid-template-columns: 1fr 72px; }
.cols-role { grid-template-columns: 130px 150px 1fr; }
.t-head span { font-size: 10.5px; color: #b0aebe; }
.t-row { border-top: 1px solid #f4f4f7; font-size: 12.5px; color: #4a4959; }
.t-row .strong { color: #2b2b33; font-weight: 500; }
.t-row .muted { color: #8a8f99; }
.t-head .r, .t-row .r { text-align: right; }

.grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 320px)); gap: 0 56px; justify-content: start; }
.grid2 > .tbl + .tbl { border-left: 1px solid #f2f2f6; padding-left: 28px; }

.perm-rows { display: flex; flex-direction: column; }
.perm-row { display: flex; align-items: flex-start; gap: 12px; padding: 7px 0; border-top: 1px solid #f4f4f7; }
.perm-row:first-child { border-top: none; }
.perm-job { flex: none; width: 76px; font-size: 12.5px; font-weight: 500; color: #2b2b33; line-height: 1.9; }
.perm-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.pchip { font-size: 11.5px; color: #4a4959; background: #f5f6f8; border: 1px solid #eceef2; border-radius: 7px; padding: 2px 8px; }
.pchip em { font-style: normal; font-size: 10.5px; color: #b0aebe; margin-left: 5px; }

.neg-rows { display: flex; flex-direction: column; }
.neg-row { display: grid; grid-template-columns: 18px 220px 1fr; gap: 8px; align-items: start; padding: 7px 0; border-top: 1px solid #f4f4f7; }
.neg-row:first-child { border-top: none; }
.neg-mark { font-size: 12px; color: #c9a0a0; line-height: 1.7; }
.neg-t { font-size: 12.5px; color: #4a4959; }
.neg-w { font-size: 11.5px; color: #8a8f99; line-height: 1.7; }

.raw {
  margin: 0; padding: 12px 14px; background: #fafafb; border: 1px solid #f0f0f4; border-radius: 9px;
  font-size: 12px; line-height: 1.9; color: #4a4959; white-space: pre-wrap; font-family: inherit;
}
</style>
