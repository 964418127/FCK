<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>排班策略 v3 <span class="ver">设计基线</span></h1>
        <p>容器承接时段，时段只描述时间形态；谁能领、怎么领、余额怎么办，全部挂在独立的「获取规则」上；结算完直接写排班结果。</p>
      </div>
      <el-button plain size="small" class="m-entry" @click="router.push({ name: 'v3-mobile' })">移动端预览</el-button>
    </header>

    <!-- 配置改动 → 生成批次：改动不回溯，等下一轮或手动生成 -->
    <div class="genbar" :class="{ dirty: pending.total > 0 }">
      <template v-if="pending.total">
        <span class="gb-dot" />
        <strong>{{ pending.total }} 项配置改动待生效</strong>
        <span class="gb-sub">时段 {{ pending.slots }} · 规则 {{ pending.rules }} · 挂载 {{ pending.mounts }}；不会回溯已生成的批次</span>
        <el-button size="small" type="primary" @click="onGenerate">立即生成（第 {{ v3.gen.seq + 1 }} 批）</el-button>
        <el-button size="small" text @click="onDiscard">撤销改动</el-button>
      </template>
      <template v-else>
        <span class="gb-dot quiet" />
        <strong>当前是第 {{ v3.gen.seq }} 批</strong>
        <span class="gb-sub">{{ v3.gen.at }} 生成 · 配置与批次快照一致；改动下一轮（周四 06:00）或手动生成时生效</span>
        <el-button size="small" plain @click="onGenerate">手动生成一批</el-button>
      </template>
    </div>

    <div class="tabs" role="tablist">
      <button v-for="t in tabs" :key="t.value" role="tab" :class="{ active: tab === t.value }" @click="tab = t.value">{{ t.label }}</button>
    </div>

    <!-- 时段 -->
    <div v-if="tab === 'slot'" class="layout">
      <aside class="cont-list">
        <div class="cont-head"><span>编码</span><span>容器</span></div>
        <button
          v-for="c in containers" :key="c.id"
          :class="['cont-item', { on: contId === c.id }]"
          @click="contId = c.id"
        >
          <span class="cont-id">{{ c.id }}</span>
          <strong>{{ c.name }}<small>{{ typeLabel(c.type) }}</small></strong>
        </button>
      </aside>

      <main class="main">
        <div class="sec-head">
          <div>
            <h2>{{ curCont?.name }} <span class="sub">{{ typeLabel(curCont?.type) }}容器</span></h2>
            <p>营业 {{ curCont?.open }} – {{ curCont?.close }} · 时段只管时间形态，「谁先领」在获取规则里</p>
          </div>
          <el-button type="primary" @click="onAddSlot">新增时段</el-button>
        </div>

        <el-table :data="slotsHere" border size="small" empty-text="这个容器还没有时段">
          <el-table-column label="时段" min-width="150">
            <template #default="{ row }">
              <span class="name">{{ row.name }}</span>
              <el-tag v-if="row.source === 'custom'" size="small" type="warning" effect="plain" class="tag">门店自建</el-tag>
              <div class="sub">{{ row.note }}</div>
            </template>
          </el-table-column>
          <el-table-column label="起止 · 净工时" width="164">
            <template #default="{ row }">
              {{ sh(row).start }} – {{ sh(row).end }}
              <span class="net">净 {{ netHours3(sh(row)) }}h</span>
              <div class="sub">{{ sh(row).breakMin ? `休 ${sh(row).breakMin} 分` : '无休息' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="名额" width="120">
            <template #default="{ row }">
              <strong>{{ row.capacity }}</strong>
              <div class="sub">{{ quotaText(row) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="性质" width="76" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.nature === 'optional' ? 'info' : 'success'" effect="plain">{{ natureLabel(row.nature) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="星期" width="88">
            <template #default="{ row }">{{ daysText(row.days) }}</template>
          </el-table-column>
          <el-table-column label="生成" width="140">
            <template #default="{ row }"><span class="sub">{{ genText(row.generation) }}</span></template>
          </el-table-column>
          <el-table-column label="获取规则" min-width="210">
            <template #default="{ row }">
              <template v-if="ruleOf(row)">
                <span class="rule-name">{{ ruleOf(row).name }}</span>
                <el-tag size="small" effect="plain" class="tag">{{ modeLabel(ruleOf(row)) }}</el-tag>
                <div class="sub">{{ ruleSummary3(ruleOf(row)) }} · 余额：{{ balanceSummary3(ruleOf(row)) }}</div>
              </template>
              <el-tag v-else size="small" type="info" effect="plain">兜底承接（不单独发布）</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="72" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="goSlot(row)">配置</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 名额生成视野：上面是配置（一条时段一行），下面是这批铺出来的名额实例（按天） -->
        <div class="gen-view">
          <div class="gen-head">
            <h3>名额生成视野 · {{ genScope === 'week' ? '下一批（一周）' : monthLabel }}</h3>
            <div class="gen-switch" role="tablist" aria-label="生成视野切换">
              <button type="button" role="tab" :aria-selected="genScope === 'week'" :class="{ on: genScope === 'week' }" @click="genScope = 'week'">周视野</button>
              <button type="button" role="tab" :aria-selected="genScope === 'month'" :class="{ on: genScope === 'month' }" @click="genScope = 'month'">月视野</button>
            </div>
            <span>{{ genScope === 'week' ? `按第 ${v3.gen.seq} 批快照（${v3.gen.at}）铺出的名额，已领人数随结算变化；改配置要重新生成才反映到这里` : '按月节奏铺出的整月名额实例；周内铺的时段不进月视野' }}</span>
          </div>

          <!-- 周视野 -->
          <div v-if="genScope === 'week'" class="gen-grid">
            <div v-for="c in weekCells" :key="c.date" class="gen-col">
              <strong>{{ c.label }}</strong>
              <div v-for="card in c.cards" :key="card.key" class="gen-card" :class="card.cls">
                <span>{{ card.name }}</span>
                <small>{{ card.note }}</small>
              </div>
              <em v-if="!c.cards.length">—</em>
            </div>
          </div>

          <!-- 月视野：按月节奏铺出的整月名额实例 -->
          <template v-else>
            <div v-if="monthCells.length" class="gen-month-head">
              <span v-for="d in ['日','一','二','三','四','五','六']" :key="d">周{{ d }}</span>
            </div>
            <div v-if="monthCells.length" class="gen-month">
              <div v-for="(c, i) in monthCells" :key="i" class="gen-month-cell" :class="{ empty: c.empty }">
                <b v-if="!c.empty">{{ c.day }}</b>
                <div v-for="card in c.cards" :key="card.key" class="gen-card mini" :class="card.cls">
                  <span>{{ card.name }}</span>
                  <small>{{ card.note }}</small>
                </div>
              </div>
            </div>
            <p v-if="!monthCells.length" class="gen-note">这个容器没有按月铺的时段，名额实例都在周批次里——切回「周视野」看。</p>
          </template>

          <p v-if="genScope === 'week' && monthOnly.length" class="gen-note">
            {{ monthOnly.map(s => s.name).join('、') }}按月铺整月，不进周视野——切到「月视野」看；手动发布的时段不铺名额。
          </p>
          <p v-else-if="genScope === 'month' && weekOnly.length && monthCells.length" class="gen-note">
            {{ weekOnly.map(s => s.name).join('、') }}按周铺下一批，不进月视野——切到「周视野」看。
          </p>
        </div>
      </main>
    </div>

    <!-- 时段模板：全局只读 + 门店引入后自有 -->
    <div v-else-if="tab === 'tpl'" class="wrap">
      <div class="sec-head">
        <div>
          <h2>时段模板 <span class="sub">纯时间形态 · 不含任何「谁能领」</span></h2>
          <p>全局模板由平台维护、门店只读；「引入到本店」后复制成门店自有模板，从此归本店改。模板只是起稿的底稿：新建时段按它落地成一条时段，改模板不影响已建的时段。</p>
        </div>
        <el-button type="primary" @click="openTplEditor(null)">新建门店模板</el-button>
      </div>

      <div class="tpl-group">
        <div class="group-head">
          <h3>全局模板 <span class="sub">{{ globalTpls.length }} 条 · 只读</span></h3>
          <span class="sub">平台统一维护，门店只能引入</span>
        </div>
        <div class="grid">
          <div v-for="t in globalTpls" :key="t.id" class="tpl">
            <div class="tpl-head">
              <strong>{{ t.name }}</strong>
              <el-tag size="small" type="info" effect="plain">{{ t.scope }}</el-tag>
            </div>
            <div class="tpl-meta">
              <span>班次：{{ tplShift(t).name }} {{ tplShift(t).start }}–{{ tplShift(t).end }}</span>
              <span>{{ daysText(t.days) }} · {{ natureLabel(t.nature) }} · {{ t.capacity }} 个名额（{{ quotaCalc(t).serviceLabel }}）</span>
              <span>生成：{{ genText(t.generation) }}</span>
            </div>
            <div class="tpl-actions">
              <span class="sub">本店已引用 {{ tplUsage(t.id) }} 条时段</span>
              <el-button size="small" plain @click="onAdopt(t)">引入到{{ curCont?.name }}</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="tpl-group">
        <div class="group-head">
          <h3>{{ curCont?.name }} 自有模板 <span class="sub">{{ ownTpls.length }} 条 · 可改可删</span></h3>
          <span class="sub">改它只影响以后新建的时段</span>
        </div>
        <div v-if="ownTpls.length" class="grid">
          <div v-for="t in ownTpls" :key="t.id" class="tpl own">
            <div class="tpl-head">
              <strong>{{ t.name }}</strong>
              <el-tag size="small" type="success" effect="plain">门店自有</el-tag>
            </div>
            <div class="tpl-meta">
              <span>班次：{{ tplShift(t).name }} {{ tplShift(t).start }}–{{ tplShift(t).end }}</span>
              <span>{{ daysText(t.days) }} · {{ natureLabel(t.nature) }} · {{ t.capacity }} 个名额（{{ quotaCalc(t).serviceLabel }}）</span>
              <span>生成：{{ genText(t.generation) }}</span>
              <span v-if="t.derivedFrom" class="sub">引入自 {{ findTplIn(t.derivedFrom)?.name || t.derivedFrom }}</span>
            </div>
            <div class="tpl-actions">
              <span class="sub">引用 {{ tplUsage(t.id) }} 条时段</span>
              <div>
                <el-button size="small" plain @click="openTplEditor(t)">编辑</el-button>
                <el-button size="small" text type="danger" @click="onRemoveTpl(t)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="gen-note">{{ curCont?.name }} 还没有自有模板：从上面全局模板「引入到本店」，或直接新建。</p>
      </div>
    </div>

    <!-- 获取规则 -->
    <div v-else-if="tab === 'rule'" class="wrap">
      <div class="sec-head">
        <div>
          <h2>名额获取规则 <span class="sub">独立对象 · 可挂到多条时段</span></h2>
          <p>三种模式：系统直派（无申领）、公布即抢（即时生效）、申领审核（截止在申领人里按业绩截断）。余额三选：再开一轮 / 兜底序列 / 不管。名称按「配法」起，不按岗位起。</p>
        </div>
        <el-button type="primary" @click="openRuleEditor(null)">新建规则</el-button>
      </div>
      <div class="grid two">
        <div v-for="r in rules" :key="r.id" class="rule-card">
          <div class="rule-head">
            <strong>{{ r.name }}</strong>
            <el-tag size="small" :type="r.mode === 'review' ? 'warning' : r.mode === 'grab' ? 'success' : 'info'" effect="plain">{{ modeLabel(r) }}</el-tag>
          </div>
          <div class="rule-line">挂在：{{ slotNamesOf(r) }}</div>
          <div v-for="(rd, i) in r.rounds" :key="rd.id" class="round">
            <span class="round-idx">第 {{ i + 1 }} 轮</span>
            <span class="round-body">
              {{ rd.crowds.join('、') || '—' }} · {{ timeNote(rd.open) }}<template v-if="rd.close"> → 截止 {{ timeNote(rd.close) }}</template>
              <template v-else> · 无截止</template>
              <span class="dot">·</span>{{ rd.settle === 'instant' ? '即时结算' : '截止结算' }}
            </span>
          </div>
          <div v-if="r.mode === 'review' && r.rounds[0]?.audit" class="audit-line">
            审核：{{ r.rounds[0].audit.metrics.map(m => `${m.name}${m.weight}`).join(' + ') }} → {{ r.rounds[0].audit.tiebreak }}破平 · 取数 {{ r.rounds[0].audit.period }}
          </div>
          <div class="bal-line">
            余额：<strong>{{ balanceSummary3(r) }}</strong><span class="sub">{{ r.balanceNote }}</span>
          </div>
          <div class="card-actions">
            <el-button size="small" plain @click="openRuleEditor(r)">编辑</el-button>
            <el-button size="small" text type="danger" @click="onRemoveRule(r)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 排班结果 -->
    <div v-else class="wrap">
      <div class="sec-head">
        <div>
          <h2>排班结果 <span class="sub">既有记录表 · 审核通过 / 兜底安排都写这一张</span></h2>
          <p>「怎么来的」区分：审核通过 / 先到先得自领 / 轮转排定 / 系统直派 / 兜底·某班次。结果是第 {{ v3.gen.seq }} 批快照跑出来的，配置改动要重新生成才进结果。</p>
        </div>
        <div class="filters">
          <el-select v-model="resScope" size="small" style="width: 110px">
            <el-option label="本周" value="current" />
            <el-option label="下一批" value="next" />
            <el-option label="下月" value="month" />
            <el-option label="全部" value="all" />
          </el-select>
          <el-select v-model="resCont" size="small" style="width: 130px">
            <el-option label="全部容器" value="all" />
            <el-option v-for="c in containers" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
          <el-switch v-model="onlyFallback" size="small" active-text="只看兜底" />
        </div>
      </div>

      <el-table :data="resRows" border size="small" max-height="560" empty-text="这个范围内还没有结算结果">
        <el-table-column label="日期" width="104">
          <template #default="{ row }">{{ shortDate(row.date) }}</template>
        </el-table-column>
        <el-table-column label="容器" width="96">
          <template #default="{ row }">{{ containerName3(row.containerId) }}</template>
        </el-table-column>
        <el-table-column label="时段" min-width="150">
          <template #default="{ row }">
            {{ row.shiftName }}<span class="sub">{{ row.start }}–{{ row.end }} · 净 {{ row.hours }}h</span>
          </template>
        </el-table-column>
        <el-table-column label="人员" width="80">
          <template #default="{ row }">{{ row.personName }}</template>
        </el-table-column>
        <el-table-column label="岗位" width="112">
          <template #default="{ row }">{{ row.crowd }}</template>
        </el-table-column>
        <el-table-column label="怎么排上的" min-width="220">
          <template #default="{ row }">
            <el-tag size="small" :type="wayType(row)" effect="plain">{{ row.way }}</el-tag>
            <span v-if="row.score" class="score">综合分 {{ row.score }}</span>
            <span v-if="row.fallback" class="sub">从 {{ slotNameOf(row.fromSlotId) }} 漏下来</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="unfilled" :class="{ warn: unfilledRows.length }">
        <template v-if="unfilledRows.length">
          此刻已结算时段的余量 {{ unfilledRows.length }} 条（还在申领中的时段不算）：
          {{ unfilledRows.slice(0, 4).map(u => `${shortDate(u.date)} ${u.shiftName} 剩 ${u.rest}`).join('，') }}
        </template>
        <template v-else>此刻已结算时段没有余量。</template>
      </div>
    </div>

    <!-- 新增时段：选模板 + 选规则（时段与规则解耦，建完可换） -->
    <el-dialog v-model="addVisible" title="新增时段" width="480">
      <el-form label-width="88px">
        <el-form-item label="容器">
          <span class="plain-val">{{ curCont?.name }}（{{ typeLabel(curCont?.type) }}）</span>
        </el-form-item>
        <el-form-item label="时段模板">
          <el-select v-model="addTplId" style="width: 100%">
            <el-option-group label="全局模板（只读）">
              <el-option v-for="t in globalTpls" :key="t.id" :label="t.name" :value="t.id" />
            </el-option-group>
            <el-option-group v-if="ownTpls.length" :label="`${curCont?.name} 自有`">
              <el-option v-for="t in ownTpls" :key="t.id" :label="t.name" :value="t.id" />
            </el-option-group>
          </el-select>
          <div class="dlg-hint">模板只有时间形态，不含谁能领</div>
        </el-form-item>
        <el-form-item label="获取规则">
          <el-select v-model="addRuleId" style="width: 100%" clearable placeholder="先空着（做兜底承接时段）">
            <el-option v-for="r in rules" :key="r.id" :label="`${r.name}（${modeLabel(r)}）`" :value="r.id" />
          </el-select>
          <div class="dlg-hint">规则可以之后再挂或换掉</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd">创建并配置</el-button>
      </template>
    </el-dialog>

    <!-- 模板编辑（门店自有）：全局模板只读，只能引入 -->
    <el-dialog v-model="tplVisible" :title="tplDraft?.id ? '编辑门店模板' : '新建门店模板'" width="640">
      <el-form v-if="tplDraft" label-width="88px" class="tpl-form">
        <el-form-item label="模板名称">
          <el-input v-model="tplDraft.name" placeholder="如：兴隆湖 · 早班 · 8 个名额" />
        </el-form-item>
        <el-form-item label="班次">
          <el-select v-model="tplDraft.shiftTemplateId" style="width: 300px">
            <el-option v-for="s in shiftTpls" :key="s.id" :label="`${s.name}（${s.start}–${s.end}）`" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="生效星期">
          <div class="days">
            <button
              v-for="(n, i) in weekDays" :key="i" type="button"
              :class="{ on: tplDraft.days.includes(i) }" @click="toggleDraftDay(i)"
            >{{ n }}</button>
          </div>
        </el-form-item>
        <el-form-item label="性质">
          <el-radio-group v-model="tplDraft.nature" size="small">
            <el-radio-button v-for="n in natures" :key="n.value" :value="n.value">{{ n.label }}</el-radio-button>
          </el-radio-group>
          <div class="dlg-hint">{{ natures.find(n => n.value === tplDraft.nature)?.hint }}</div>
        </el-form-item>
        <el-form-item label="名额来源">
          <QuotaField v-model="tplDraft.quota" />
        </el-form-item>
        <el-form-item label="生成节奏">
          <el-radio-group v-model="tplDraft.generation.cadence" size="small">
            <el-radio-button value="weekly">每周</el-radio-button>
            <el-radio-button value="monthly">每月</el-radio-button>
          </el-radio-group>
          <el-select v-if="tplDraft.generation.cadence === 'weekly'" v-model="tplDraft.generation.weekday" size="small" style="width: 90px; margin-left: 8px">
            <el-option v-for="(n, i) in weekDays" :key="i" :label="n" :value="i" />
          </el-select>
          <el-input-number v-else v-model="tplDraft.generation.day" :min="1" :max="28" size="small" controls-position="right" style="width: 90px; margin-left: 8px" />
          <el-time-select v-model="tplDraft.generation.time" start="00:00" end="23:30" step="00:30" size="small" style="width: 100px; margin-left: 8px" />
          <el-select v-model="tplDraft.generation.horizon" size="small" style="width: 110px; margin-left: 8px">
            <el-option label="铺下一批" value="n1" />
            <el-option label="铺整月" value="month" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tplVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTpl">保存</el-button>
      </template>
    </el-dialog>

    <!-- 规则编辑：新增 / 编辑同一套表单 -->
    <el-drawer v-model="ruleVisible" :title="ruleDraft?.id ? `编辑规则 · ${ruleDraft.id}` : '新建获取规则'" size="640px">
      <div v-if="ruleDraft" class="rule-form">
        <el-form label-width="72px">
          <el-form-item label="名称">
            <el-input v-model="ruleDraft.name" placeholder="按配法起名，如「两轮审核+兜底晚班再通班」">
              <template #append><el-button @click="usePatternName">按配法命名</el-button></template>
            </el-input>
            <div class="dlg-hint">名字要能看出「怎么分」：几轮、有没有审核、余额去哪</div>
          </el-form-item>

          <el-form-item label="模式">
            <el-radio-group v-model="ruleDraft.mode" size="small" @change="onModeChange">
              <el-radio-button v-for="m in modes" :key="m.value" :value="m.value">{{ m.label }}</el-radio-button>
            </el-radio-group>
            <div class="dlg-hint">{{ modes.find(m => m.value === ruleDraft.mode)?.hint }}</div>
          </el-form-item>

          <el-form-item label="轮">
            <div class="rounds-edit">
              <div v-for="(rd, i) in ruleDraft.rounds" :key="i" class="round-edit">
                <div class="re-head">
                  <strong>第 {{ i + 1 }} 轮</strong>
                  <el-input v-model="rd.name" size="small" style="width: 140px" placeholder="轮名称" />
                  <el-button v-if="ruleDraft.rounds.length > 1" link type="danger" size="small" @click="removeRound(i)">删掉</el-button>
                </div>
                <div class="re-row">
                  <span class="k">人群</span>
                  <el-select v-model="rd.crowds" multiple collapse-tags size="small" style="width: 100%">
                    <el-option v-for="c in crowds" :key="c" :label="c" :value="c" />
                  </el-select>
                </div>
                <div class="re-row">
                  <span class="k">开放</span>
                  <el-select v-model="rd.open.kind" size="small" style="width: 130px" @change="onOpenKind(rd)">
                    <el-option label="排班日 N 天前" value="d" />
                    <el-option label="生成即开放" value="generated" />
                  </el-select>
                  <template v-if="rd.open.kind === 'd'">
                    <el-input-number v-model="rd.open.before" :min="0" :max="14" size="small" controls-position="right" style="width: 80px" />
                    <span class="k">天前</span>
                    <el-time-select v-model="rd.open.time" start="00:00" end="23:30" step="00:30" size="small" style="width: 100px" />
                  </template>
                </div>
                <div class="re-row">
                  <span class="k">截止</span>
                  <el-switch :model-value="!!rd.close" size="small" @update:model-value="toggleClose(rd)" />
                  <template v-if="rd.close">
                    <el-input-number v-model="rd.close.before" :min="0" :max="14" size="small" controls-position="right" style="width: 80px" />
                    <span class="k">天前</span>
                    <el-time-select v-model="rd.close.time" start="00:00" end="23:30" step="00:30" size="small" style="width: 100px" />
                    <span class="k">截止时结算</span>
                  </template>
                  <span v-else class="k">无截止，符合条件即时生效</span>
                </div>
                <div v-if="ruleDraft.mode === 'review'" class="re-audit">
                  <div class="k">审核口径</div>
                  <div class="metrics">
                    <div v-for="(m, mi) in rd.audit?.metrics || []" :key="mi" class="metric">
                      <el-input v-model="m.name" size="small" style="width: 84px" />
                      <el-input-number v-model="m.weight" :min="0" :max="100" :step="5" size="small" controls-position="right" style="width: 78px" />
                    </div>
                  </div>
                  <div class="re-row">
                    <span class="k">破平</span>
                    <el-select v-model="rd.audit.tiebreak" size="small" style="width: 110px">
                      <el-option v-for="m in rd.audit?.metrics || []" :key="m.name" :label="m.name" :value="m.name" />
                    </el-select>
                    <span class="k">取数</span>
                    <el-input v-model="rd.audit.period" size="small" style="width: 190px" />
                  </div>
                </div>
              </div>
              <el-button size="small" plain @click="addRound">加一轮</el-button>
            </div>
          </el-form-item>

          <el-form-item label="余额">
            <div style="width: 100%">
              <el-radio-group v-model="ruleDraft.balance" size="small">
                <el-radio v-for="b in balances" :key="b.value" :value="b.value">{{ b.label }}</el-radio>
              </el-radio-group>
              <div class="dlg-hint">{{ balances.find(b => b.value === ruleDraft.balance)?.hint }}</div>
              <el-select
                v-if="ruleDraft.balance === 'sequence'"
                v-model="ruleDraft.fallbackSlotIds" multiple size="small"
                style="width: 100%; margin-top: 8px" placeholder="按顺序选兜底时段（先选的先吃）"
              >
                <el-option v-for="s in v3.slots" :key="s.id" :label="`${containerName3(s.containerId)} · ${s.name}`" :value="s.id" />
              </el-select>
              <el-input v-if="ruleDraft.balance !== 'none'" v-model="ruleDraft.balanceNote" size="small" style="margin-top: 8px" placeholder="余额处理的口径说明（会显示在规则卡上）" />
            </div>
          </el-form-item>
        </el-form>

        <div v-if="ruleErrs.length" class="errs">
          <strong>还不能保存：</strong>
          <ul><li v-for="e in ruleErrs" :key="e">{{ e }}</li></ul>
        </div>
        <p class="hint">保存后只改配置：已生成的批次不动，下一轮生成或点「立即生成」才生效。</p>
      </div>
      <template #footer>
        <el-button @click="ruleVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存规则</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import QuotaField from '../components/v3/QuotaField.vue'
import {
  V3_CONTAINERS, V3_CONTAINER_TYPES, V3_MODES, BALANCE_MODES, V3_SHIFT_TPL, V3_NATURES, V3_CROWDS,
  containerName3, netHours3, timeNote, weekdayLabel3, findSlot3, findRule3, modeOf3,
  batchOf3, weekdayOf, parseDate, monthLabel3, quotaCalc3, natureOf3,
  blankRule3, validateRule3, ruleNamePattern3
} from '../mock/scheduleV3.js'
import {
  v3, batch3, ruleSummary3, balanceSummary3, shiftOf3Row as sh, createSlot3,
  pendingChanges3, generate3, globalTpls3, ownTpls3, tplUsage3, adoptTemplate3,
  createTemplate3, updateTemplate3, removeTemplate3, upsertRule3, removeRule3
} from '../mock/scheduleV3Store.js'

const router = useRouter()
const tabs = [
  { value: 'slot', label: '时段' },
  { value: 'tpl', label: '时段模板' },
  { value: 'rule', label: '获取规则' },
  { value: 'result', label: '排班结果' }
]
const tab = ref('slot')
const containers = V3_CONTAINERS
const modes = V3_MODES
const balances = BALANCE_MODES
const natures = V3_NATURES
const crowds = V3_CROWDS
const shiftTpls = V3_SHIFT_TPL
const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const rules = computed(() => v3.rules)
const typeLabel = v => (V3_CONTAINER_TYPES.find(t => t.value === v) || {}).label || v

const contId = ref(V3_CONTAINERS[0].id)
const curCont = computed(() => containers.find(c => c.id === contId.value))
const slotsHere = computed(() => v3.slots.filter(s => s.containerId === contId.value))
const ruleOf = slot => findRule3(v3.ruleOf[slot.id])
const modeLabel = rule => modeOf3(rule.mode).label
const natureLabel = v => natureOf3(v).label

/* ---- 生成批次 ---- */
const pending = pendingChanges3
const onGenerate = () => {
  generate3()
  ElMessage.success(`已生成第 ${v3.gen.seq} 批：按当前配置冻结快照，名额与规则以这一批为准`)
}
const onDiscard = () => {
  v3.slots = JSON.parse(JSON.stringify(v3.snapshot.slots))
  v3.rules = JSON.parse(JSON.stringify(v3.snapshot.rules))
  v3.ruleOf = { ...v3.snapshot.ruleOf }
  ElMessage.info('已撤回到第 ' + v3.gen.seq + ' 批的配置')
}

/* ---- 展示口径 ---- */
const daysText = days => {
  const d = [...new Set(days || [])].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
  if (d.length === 7) return '每天'
  if (d.join(',') === '1,2,3,4,5') return '工作日'
  return d.map(x => `周${'日一二三四五六'[x]}`).join('、')
}
const genText = g => {
  if (!g) return '不生成'
  const t = `${g.cadence === 'weekly' ? `每周${'日一二三四五六'[g.weekday]}` : `每月 ${g.day} 日`} ${g.time}`
  return `${t} · ${g.horizon === 'month' ? '铺整月' : '铺下一批'}`
}
const tplShift = t => V3_SHIFT_TPL.find(s => s.id === t.shiftTemplateId) || { name: '—', start: '--:--', end: '--:--' }
const quotaCalc = t => quotaCalc3(t)
const quotaText = slot => {
  const q = quotaCalc3(slot)
  return `${q.serviceLabel}算 ${q.computed} · 改动期 ${q.windowMin} 分`
}

/* 名额生成视野：下一批（一周）每天铺出的名额实例。
   filled 从结果表现算（含兜底排进来的），不信任 runBatch3 的 inst.filled（兜底在其后发生）。 */
const stateNote = (inst, filled) => {
  const cap = inst.slot.capacity
  const rest = Math.max(0, cap - filled)
  const optional = inst.slot.nature === 'optional'
  if (!inst.rule) return filled ? `已排 ${filled}/${cap} · 兜底承接时段` : `${cap} 个名额 · 兜底承接，暂无人排入`
  if (inst.state === 'pending') return `${cap} 个名额 · 待开放`
  if (inst.state === 'open') return `${cap} 个名额 · 剩 ${rest} · 申领中`
  if (rest === 0) return `${cap} 个名额 · 已分完`
  return optional ? `${cap} 个名额 · 剩 ${rest} · 可选班次留空` : `${cap} 个名额 · 剩 ${rest} · 余额：${balanceSummary3(inst.rule)}`
}
const weekCells = computed(() => {
  const b = batch3.value
  const filledOf = (slotId, date) => b.results.filter(r => r.slotId === slotId && r.date === date).length
  return batchOf3(new Date(v3.now)).map(date => ({
    date,
    label: `周${'日一二三四五六'[weekdayOf(date)]} · ${date.slice(5)}`,
    cards: b.instances
      .filter(i => i.date === date && i.slot.containerId === contId.value)
      .map(i => ({
        key: `${i.slot.id}|${date}`,
        name: `${sh(i.slot).name} ${sh(i.slot).start}–${sh(i.slot).end}`,
        note: stateNote(i, filledOf(i.slot.id, date)),
        cls: 'st-' + String(i.state || 'norule').replace('-', '')
      }))
  }))
})
const monthOnly = computed(() => slotsHere.value.filter(s => s.generation?.horizon === 'month'))
const weekOnly = computed(() => slotsHere.value.filter(s => s.generation?.horizon !== 'month' && s.generation && s.generation.cadence !== 'manual'))

/* 月视野：按月节奏铺出的下月整月实例，排成日历（周日起头） */
const pad2n = n => String(n).padStart(2, '0')
const monthCells = computed(() => {
  const b = batch3.value
  const insts = b.instances.filter(i => i.slot.containerId === contId.value && i.slot.generation?.horizon === 'month')
  if (!insts.length) return []
  const filledOf = (slotId, date) => b.results.filter(r => r.slotId === slotId && r.date === date).length
  const d0 = parseDate(insts[0].date)
  const y = d0.getFullYear(); const m = d0.getMonth()
  const cells = Array.from({ length: new Date(y, m, 1).getDay() }, () => ({ empty: true }))
  for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
    const date = `${y}-${pad2n(m + 1)}-${pad2n(d)}`
    cells.push({
      day: d,
      cards: insts.filter(i => i.date === date).map(i => ({
        key: `${i.slot.id}|${date}`,
        name: sh(i.slot).name,
        note: stateNote(i, filledOf(i.slot.id, date)).replace(' 个名额', '名额')
      }))
    })
  }
  return cells
})
const monthLabel = monthLabel3(new Date(v3.now))
/* 默认视野：本周铺了实例看周，只有按月实例（或都还没铺）看月 */
const genScope = ref(
  weekCells.value.some(c => c.cards.length) || !monthCells.value.length ? 'week' : 'month'
)

const goSlot = row => router.push({ name: 'schedule-v3-slot', params: { id: row.id } })

/* ---- 新增时段 ---- */
const addVisible = ref(false)
const addTplId = ref('')
const addRuleId = ref('')
const globalTpls = computed(() => globalTpls3())
const ownTpls = computed(() => ownTpls3(contId.value))
const onAddSlot = () => { addTplId.value = (globalTpls.value[0] || {}).id; addRuleId.value = ''; addVisible.value = true }
const confirmAdd = () => {
  const s = createSlot3(contId.value, addTplId.value, addRuleId.value || null)
  addVisible.value = false
  router.push({ name: 'schedule-v3-slot', params: { id: s.id } })
}

/* ---- 模板：引入 / 新建 / 编辑 / 删除 ---- */
const tplVisible = ref(false)
const tplDraft = ref(null)
const findTplIn = id => v3.templates.find(t => t.id === id)
const tplUsage = id => tplUsage3(id)
const blankTpl = () => ({
  id: '', name: `${curCont.value?.name || ''} · 新模板`, shiftTemplateId: 'SH-01',
  days: [1, 2, 3, 4, 5, 6, 0], nature: 'required',
  quota: { service: 'headcount', params: { headcount: 8, factor: 0.75 }, windowMin: 10, adjusted: null },
  generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true }
})
const openTplEditor = t => {
  tplDraft.value = t ? JSON.parse(JSON.stringify(t)) : blankTpl()
  tplVisible.value = true
}
const toggleDraftDay = i => {
  const d = tplDraft.value.days
  const k = d.indexOf(i)
  k === -1 ? d.push(i) : d.splice(k, 1)
}
const saveTpl = () => {
  if (!tplDraft.value.name.trim()) return ElMessage.warning('模板名称不能为空')
  if (!tplDraft.value.days.length) return ElMessage.warning('至少选一天')
  const cap = quotaCalc3({ quota: tplDraft.value.quota }).effective
  if (tplDraft.value.id) {
    updateTemplate3(tplDraft.value.id, tplDraft.value)
    ElMessage.success(`模板已改：名额 ${cap} 个。已建的时段不动，下次按它建时段才用新口径`)
  } else {
    createTemplate3(contId.value, tplDraft.value)
    ElMessage.success(`已建门店自有模板：名额 ${cap} 个`)
  }
  tplVisible.value = false
}
const onAdopt = t => {
  const copy = adoptTemplate3(t.id, contId.value)
  if (!copy) return ElMessage.warning('只有全局模板可以引入')
  ElMessage.success(`已引入到${curCont.value?.name}：${copy.name}（现在归本店，可改可删）`)
}
const onRemoveTpl = async t => {
  try {
    await ElMessageBox.confirm(`删除模板「${t.name}」？已建的时段不受影响。`, '删除门店模板', { type: 'warning' })
  } catch { return }
  const r = removeTemplate3(t.id)
  r.ok ? ElMessage.success('已删除') : ElMessage.warning(r.reason)
}

/* ---- 规则：新增 / 编辑 ---- */
const ruleVisible = ref(false)
const ruleDraft = ref(null)
const ruleErrs = ref([])
const slotNamesOf = r => v3.slots.filter(s => v3.ruleOf[s.id] === r.id).map(s => s.name).join('、') || '未挂载'
const slotNameOf = id => findSlot3(id)?.name || id

const openRuleEditor = r => {
  ruleDraft.value = r ? JSON.parse(JSON.stringify(r)) : blankRule3('grab')
  ruleErrs.value = []
  ruleVisible.value = true
}
const onModeChange = mode => {
  const d = ruleDraft.value
  for (const rd of d.rounds) {
    if (mode === 'direct') {
      rd.open = { kind: 'generated' }
      rd.close = null
      rd.settle = 'instant'
      rd.audit = null
    } else if (mode === 'grab') {
      if (rd.open.kind === 'generated') rd.open = { kind: 'generated' }
      rd.close = null
      rd.settle = 'instant'
      rd.audit = null
    } else {
      if (rd.open.kind === 'generated') rd.open = { kind: 'd', before: 4, time: '06:00' }
      if (!rd.close) rd.close = { kind: 'd', before: 1, time: '22:00' }
      rd.settle = 'onClose'
      if (!rd.audit) rd.audit = blankRule3('review').rounds[0].audit
    }
  }
  if (mode === 'direct') d.balance = 'none'
}
const onOpenKind = rd => {
  if (rd.open.kind === 'd' && rd.open.before == null) { rd.open.before = 4; rd.open.time = '06:00' }
}
const toggleClose = rd => {
  if (rd.close) { rd.close = null; rd.settle = 'instant' }
  else { rd.close = { kind: 'd', before: 1, time: '22:00' }; rd.settle = 'onClose' }
}
const addRound = () => {
  const d = ruleDraft.value
  const base = JSON.parse(JSON.stringify(d.rounds[d.rounds.length - 1]))
  base.name = `第 ${d.rounds.length + 1} 轮`
  base.crowds = []
  d.rounds.push(base)
}
const removeRound = i => ruleDraft.value.rounds.splice(i, 1)
const usePatternName = () => {
  ruleDraft.value.name = ruleNamePattern3(ruleDraft.value, slotNameOf)
}
const saveRule = () => {
  ruleErrs.value = validateRule3(ruleDraft.value)
  if (ruleErrs.value.length) return
  const saved = upsertRule3(ruleDraft.value)
  ruleVisible.value = false
  ElMessage.success(`规则「${saved.name}」已保存：下一轮生成或「立即生成」后生效`)
}
const onRemoveRule = async r => {
  try {
    await ElMessageBox.confirm(`删除规则「${r.name}」？`, '删除获取规则', { type: 'warning' })
  } catch { return }
  const res = removeRule3(r.id)
  res.ok ? ElMessage.success('已删除') : ElMessage.warning(res.reason)
}

/* 结果 */
const resScope = ref('current')
const resCont = ref('all')
const onlyFallback = ref(false)
const shortDate = d => `${d.slice(5)} ${weekdayLabel3(d)}`
const wayType = r => r.way === '审核通过' ? 'warning' : r.way.startsWith('兜底') ? 'danger' : r.way === '先到先得自领' ? 'success' : 'info'
const resRows = computed(() => batch3.value.results.filter(r => {
  if (resCont.value !== 'all' && r.containerId !== resCont.value) return false
  if (onlyFallback.value && !r.fallback) return false
  if (resScope.value === 'all') return true
  if (resScope.value === 'month') return r.date >= '2026-12-01' && r.date <= '2026-12-31'
  if (resScope.value === 'next') return r.date >= '2026-11-16' && r.date <= '2026-11-22'
  return r.date >= '2026-11-09' && r.date <= '2026-11-15'
}))
const unfilledRows = computed(() => batch3.value.unfilled)
</script>

<style scoped>
.page { padding: 20px 24px 60px; }
.page-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.page-head h1 { margin: 0 0 6px; font-size: 20px; }
.ver { font-size: 12px; font-weight: 400; color: #0f6e56; border: 1px solid #9fe1cb; background: #e1f5ee; border-radius: 10px; padding: 2px 8px; margin-left: 6px; vertical-align: middle; }
.page-head p { margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; max-width: 780px; }

/* 配置改动条 */
.genbar { display: flex; align-items: center; gap: 10px; margin: 12px 0 0; padding: 8px 14px; border-radius: 8px; background: #f9fafb; border: 1px solid #f3f4f6; font-size: 13px; color: #374151; flex-wrap: wrap; }
.genbar.dirty { background: #fef3c7; border-color: #fde68a; color: #92400e; }
.genbar strong { font-weight: 500; }
.gb-sub { font-size: 12px; color: #9ca3af; }
.genbar.dirty .gb-sub { color: #b45309; }
.gb-dot { width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; flex: none; }
.gb-dot.quiet { background: #10b981; }
.genbar .el-button { margin-left: auto; }

.tabs { display: flex; gap: 4px; margin: 14px 0; border-bottom: 1px solid #e5e7eb; }
.tabs button { border: 0; background: none; padding: 8px 16px; font-size: 14px; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; }
.tabs button.active { color: #0f6e56; font-weight: 500; border-bottom-color: #0f6e56; }

.layout { display: flex; gap: 16px; align-items: flex-start; }
.cont-list { width: 210px; flex: none; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; background: #fff; }
.cont-head { display: flex; justify-content: space-between; padding: 9px 12px; font-size: 12px; color: #9ca3af; background: #f9fafb; }
.cont-item { display: flex; gap: 8px; width: 100%; border: 0; background: none; padding: 10px 12px; text-align: left; cursor: pointer; border-bottom: 1px solid #f3f4f6; }
.cont-id { font-size: 12px; color: #9ca3af; }
.cont-item strong { font-size: 13px; color: #1f2937; display: flex; flex-direction: column; gap: 2px; font-weight: 500; }
.cont-item small { font-size: 11px; color: #9ca3af; font-weight: 400; }
.cont-item.on { background: #e1f5ee; }
.cont-item.on strong { color: #0f6e56; }

.main { flex: 1; min-width: 0; }
.wrap { max-width: 1080px; }
.sec-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 12px; }
.sec-head h2 { margin: 0 0 4px; font-size: 16px; }
.sec-head p { margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.6; max-width: 720px; }
.sub { font-size: 12px; color: #9ca3af; font-weight: 400; margin-left: 4px; }
.name { font-weight: 500; }
.tag { margin-left: 6px; }
.net { font-size: 12px; color: #0f6e56; margin-left: 6px; }
.rule-name { font-size: 13px; }
.score { font-size: 12px; color: #0f6e56; margin-left: 8px; }
.filters { display: flex; align-items: center; gap: 8px; flex: none; }
.unfilled { margin-top: 10px; font-size: 12px; color: #6b7280; background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 6px; padding: 8px 12px; line-height: 1.6; }
.unfilled.warn { color: #92400e; background: #fef3c7; border-color: #fde68a; }

.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.tpl, .rule-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
.tpl.own { border-color: #9fe1cb; }
.tpl-head, .rule-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.tpl-head strong, .rule-head strong { font-size: 14px; font-weight: 500; }
.tpl-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #374151; background: #f9fafb; border-radius: 6px; padding: 8px 10px; }
.tpl-actions, .card-actions { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.tpl-group { margin-bottom: 22px; }
.group-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; }
.group-head h3 { margin: 0; font-size: 14px; font-weight: 500; }
.rule-line { font-size: 12px; color: #6b7280; }
.round { display: flex; gap: 8px; font-size: 12px; color: #374151; }
.round-idx { flex: none; color: #0f6e56; }
.round-body { line-height: 1.7; }
.dot { color: #d1d5db; margin: 0 4px; }
.audit-line { font-size: 12px; color: #6b7280; background: #f9fafb; border-radius: 6px; padding: 6px 10px; }
.bal-line { font-size: 12px; color: #374151; }
.bal-line strong { color: #0f6e56; }

.plain-val { font-size: 13px; color: #1f2937; }
.dlg-hint { font-size: 12px; color: #9ca3af; margin-top: 4px; line-height: 1.6; }
.hint { font-size: 12px; color: #9ca3af; line-height: 1.6; margin: 10px 0 0; }
.days { display: flex; gap: 6px; flex-wrap: wrap; }
.days button { border: 1px solid #e5e7eb; background: #fff; border-radius: 14px; padding: 4px 12px; font-size: 12px; color: #374151; cursor: pointer; }
.days button.on { background: #0f6e56; border-color: #0f6e56; color: #fff; }
.tpl-form :deep(.el-form-item) { margin-bottom: 14px; }

/* 规则编辑器 */
.rule-form { padding-right: 6px; }
.rounds-edit { width: 100%; display: flex; flex-direction: column; gap: 10px; }
.round-edit { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; background: #fafafa; }
.re-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.re-head strong { font-size: 13px; font-weight: 500; }
.re-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
.re-audit { margin-top: 10px; padding-top: 8px; border-top: 1px dashed #e5e7eb; }
.k { font-size: 12px; color: #6b7280; }
.metrics { display: flex; gap: 8px; margin: 6px 0; flex-wrap: wrap; }
.metric { display: flex; align-items: center; gap: 4px; }
.errs { margin-top: 12px; padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; font-size: 12px; color: #b91c1c; }
.errs ul { margin: 6px 0 0; padding-left: 18px; line-height: 1.8; }

/* 名额生成视野（周网格）：配置表的下文，铺出来的名额实例按天看 */
.gen-view { margin-top: 18px; }
.gen-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 8px; }
.gen-head h3 { margin: 0; font-size: 14px; }
.gen-head span { font-size: 12px; color: #9ca3af; }
.gen-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.gen-col { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 8px; min-height: 72px; }
.gen-col strong { font-size: 12px; color: #374151; display: block; margin-bottom: 6px; }
.gen-card { background: #fff; border: 1px solid #e5e7eb; border-left: 3px solid hsl(var(--primary)); border-radius: 6px; padding: 5px 8px; margin-bottom: 5px; }
.gen-card span { font-size: 11px; display: block; color: #1f2937; }
.gen-card small { font-size: 10px; color: #9ca3af; }
.gen-card.st-pending, .gen-card.st-norule { border-left-color: #d1d5db; }
.gen-card.st-norule { border-style: dashed; }
.gen-col em { font-size: 11px; color: #d1d5db; font-style: normal; }
.gen-note { margin: 8px 0 0; font-size: 12px; color: #9ca3af; line-height: 1.6; }
.gen-switch { display: flex; gap: 0; flex: none; }
.gen-switch button { border: 1px solid #e5e7eb; background: #fff; font-size: 12px; color: #6b7280; padding: 3px 12px; cursor: pointer; }
.gen-switch button:first-child { border-radius: 12px 0 0 12px; }
.gen-switch button:last-child { border-radius: 0 12px 12px 0; border-left: 0; }
.gen-switch button.on { background: hsl(var(--primary)); border-color: hsl(var(--primary)); color: #fff; }
.gen-month-head { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 4px; }
.gen-month-head span { font-size: 11px; color: #9ca3af; text-align: center; padding: 2px 0; }
.gen-month { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.gen-month-cell { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 6px; padding: 5px; min-height: 56px; }
.gen-month-cell.empty { background: transparent; border-color: transparent; }
.gen-month-cell b { font-size: 11px; color: #9ca3af; display: block; margin-bottom: 4px; font-weight: 400; }
.gen-card.mini { margin-bottom: 4px; padding: 4px 6px; }
.gen-card.mini span { font-size: 10px; }
.gen-card.mini small { font-size: 9.5px; }
</style>
