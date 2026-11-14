<template>
  <div class="v4-page">
    <header class="v4-head">
      <div class="hl">
        <h1>排班策略 v4</h1>
        <p>空间为轴 · 名额跨岗位 · 逆向归事件系统 · 班次后续处理规则跟计划走</p>
      </div>
      <div class="hr">
        <div class="genbar">
          <span class="seq">第 {{ v4.gen.seq }} 批 · {{ v4.gen.at }}</span>
          <span v-if="pending.total" class="warn">{{ pending.total }} 项配置改动待生效</span>
          <span v-else class="ok">配置与这一批一致</span>
          <el-button v-if="pending.total" size="small" @click="revertChanges4()">撤销改动</el-button>
          <el-button size="small" type="primary" @click="doGenerate">立即生成</el-button>
        </div>
          <el-button size="small" @click="$router.push('/schedule-v4/events')">事件编排 →</el-button>
      </div>
    </header>

    <!-- 主从布局：左侧空间列表（200+ 规模按空间进详情），右侧内容全部跟着选中空间走 -->
    <div class="v4-body">
      <aside class="space-rail">
        <el-input v-model="kw" placeholder="搜名称 / 城市 / 标签 / 地址" clearable size="small" />
        <div class="chips">
          <button v-for="c in cities" :key="c" :class="{ on: city === c }" @click="city = city === c ? '' : c">{{ c }}</button>
        </div>
        <div class="rail-list">
          <button v-for="s in filteredSpaces" :key="s.id" class="rail-item" :class="{ on: s.id === selSpace }" @click="pickSpace(s.id)">
            <div class="ri-top">
              <strong>{{ s.name }}</strong>
              <i v-if="gapOfSpace(s.id)" class="gap-dot" title="有必选时段留空" />
            </div>
            <div class="ri-meta">
              <span class="mini-tag">{{ s.tag }}</span>
              <span>{{ s.city }}</span>
              <em>{{ spaceStats4(s.id).people }} 人 · {{ spaceStats4(s.id).plans }} 计划</em>
            </div>
          </button>
        </div>
        <div class="rail-foot">企业级搜索命中空间后进详情；空间列表只留定位信息，数据都在右侧</div>
      </aside>

      <main class="v4-main">
        <div class="tabs">
          <button v-for="t in tabs" :key="t.key" :class="{ on: tab === t.key }" @click="tab = t.key">
            {{ t.label }}
          </button>
          <span class="cur-space">{{ curSpace?.name }} · {{ curSpace?.city }} · {{ curSpace?.bizStart }}–{{ curSpace?.bizEnd }}</span>
        </div>

        <!-- ① 空间概览 -->
        <section v-if="tab === 'overview'" class="pane">
          <article class="ov-card">
            <header>
              <div class="sname">
                <strong>{{ curSpace?.name }}</strong>
                <span class="tag">{{ curSpace?.tag }}</span>
                <span class="city">{{ curSpace?.city }}</span>
              </div>
              <span class="biz">营业 {{ curSpace?.bizStart }}–{{ curSpace?.bizEnd }}</span>
            </header>
            <div class="addr">{{ curSpace?.address }}</div>
            <RulerBar :segs="rulerFor(selSpace)" :bars="barsFor(selSpace)" />
            <div class="pos-row">
              <span v-for="p in spaceStats4(selSpace).positions" :key="p.positionId" class="pos">
                {{ p.name }} <b>{{ p.total }}</b>
                <em>{{ p.fulltime }} 全 / {{ p.parttime }} 非</em>
              </span>
              <span v-if="!spaceStats4(selSpace).positions.length" class="pos muted">暂无在册人员</span>
            </div>
            <div class="ov-people">
              <span v-for="p in spacePeople" :key="p.id" class="pp">
                {{ p.name }}<em>{{ posName4(p.positionId) }} · {{ p.employ === 'fulltime' ? '全' : '非' }}</em>
              </span>
            </div>
            <footer>
              <span>{{ spaceStats4(selSpace).plans }} 个周期计划</span>
              <span>{{ spaceStats4(selSpace).people }} 人在册</span>
              <span>{{ spaceStats4(selSpace).rulers }} 条标准时间</span>
            </footer>
          </article>
        </section>

        <!-- ② 周期计划（只看这个空间） -->
        <section v-else-if="tab === 'plan'" class="pane">
          <div class="toolbar">
            <span class="hint">计划 = 空间 + 岗位 + 时段形态 + 名额来源 + 优先序列 + 资格 + 后续处理。改配置只影响下一批。</span>
            <div class="grow" />
            <el-button size="small" @click="openPlan()">新建计划</el-button>
          </div>

          <div class="plan-list">
            <article v-for="p in spacePlans" :key="p.id" class="plan-card">
              <header>
                <div class="pname">
                  <strong>{{ p.name }}</strong>
                  <span class="tag">{{ spaceOf4(p.spaceId)?.tag }}</span>
                  <span class="city">{{ spaceOf4(p.spaceId)?.city }}</span>
                  <span v-if="p.enabled === false" class="off">已停用</span>
                </div>
                <div class="pacts">
                  <el-button link size="small" @click="openPlan(p)">编辑</el-button>
                  <el-button link size="small" @click="togglePlan4(p.id)">{{ p.enabled === false ? '启用' : '停用' }}</el-button>
                  <el-button link size="small" type="danger" @click="removePlan(p)">删除</el-button>
                </div>
              </header>

              <div class="pmeta">
                <span class="kv"><em>岗位</em>{{ (p.positions || []).map(posName4).join('、') }}</span>
                <span class="kv"><em>节奏</em>{{ p.cadence.type === 'weekly' ? `每周${['日','一','二','三','四','五','六'][p.cadence.weekday]} ${p.cadence.time} · 铺${p.cadence.horizon === 'n3' ? '第三周' : '下一周'}` : `每月 ${p.cadence.day} 日 ${p.cadence.time} · 铺下月` }}</span>
                <span class="kv"><em>获取</em>{{ modeLabel(p.mode) }}</span>
                <span class="kv"><em>性质</em>{{ p.nature === 'required' ? '必选' : '可选' }}</span>
              </div>

              <div class="pforms">
                <span v-for="f in formsOf4(p)" :key="f.id" class="form-chip" :class="{ fb: f.fallback }">
                  {{ f.name }} {{ f.start }}–{{ f.end }}<em v-if="f.days?.length" class="days-em">{{ daysLabel(f) }}</em>
                </span>
              </div>

              <div class="quota-line">
                <span class="badge">名额来源</span>
                <template v-if="p.quota.source === 'manual'">
                  <span>人工固定 · 按时段</span>
                  <code>{{ formsOf4(p).map(f => `${f.name} ${f.quota?.value ?? p.quota.value} 个`).join(' / ') }}</code>
                </template>
                <template v-else>
                  <span>{{ quotaOf4(p, { form: formsOf4(p)[0] }).algoName }}</span>
                  <code>{{ quotaOf4(p, { form: formsOf4(p)[0] }).expr }}</code>
                  <span v-if="p.quota.adjusted" class="adj">人工调 {{ p.quota.adjusted.value }}（{{ p.quota.adjusted.by }}）· 初始 {{ quotaOf4(p, { form: formsOf4(p)[0] }).initial }}</span>
                </template>
              </div>

              <div class="ac-line">
                <span class="badge">后续处理</span>
                <span v-for="f in formsOf4(p)" :key="'ac' + f.id" class="ac-chip">
                  <b>{{ f.name }}</b>
                  <span :class="{ dim: !acBit(p, f, 'cancel').allow }">{{ acCancelLabel(p, f) }}</span>
                  <span :class="{ dim: !acBit(p, f, 'transfer').allow }">{{ acTransferLabel(p, f) }}</span>
                  <span :class="{ dim: !acBit(p, f, 'swap').allow }">{{ acSwapLabel(p, f) }}</span>
                </span>
              </div>

              <div class="tiers">
                <span class="badge">优先序列</span>
                <template v-for="(t, i) in nonFallback(p)" :key="t.id">
                  <span class="tier">{{ i + 1 }}. {{ t.label }}<em>{{ t.employ === 'any' ? '不限' : t.employ === 'fulltime' ? '全职' : '非全' }}{{ t.cap ? ` · 上限 ${t.cap}` : '' }}{{ t.open?.delayHours ? ` · 发布后${t.open.delayHours}h开放` : '' }}</em></span>
                  <span class="arrow">→</span>
                </template>
                <span v-if="fallbackOf(p)" class="tier fb">{{ fallbackOf(p).label }}</span>
                <span v-else class="tier none">无兜底</span>
              </div>

              <footer class="pfoot">
                <span>{{ p.cadence.note }}</span>
                <span class="hint2">{{ p.note }}</span>
              </footer>
            </article>
            <div v-if="!spacePlans.length" class="empty-text">这个空间还没有周期计划</div>
          </div>
        </section>

        <!-- ③ 名额视野（只看这个空间） -->
        <section v-else-if="tab === 'quota'" class="pane">
          <div class="toolbar">
            <div class="seg">
              <button :class="{ on: scope === 'week' }" @click="scope = 'week'">周视野</button>
              <button :class="{ on: scope === 'month' }" @click="scope = 'month'">月视野</button>
            </div>
            <span class="hint">{{ scope === 'week' ? '这一批铺出来的 7 天：名额从哪来、被谁吃掉、还剩多少' : `${monthLabel4()}：按月铺的计划在这里看得全` }}</span>
            <div class="grow" />
            <span class="legend-mini"><i class="dot ok" />已排满 <i class="dot part" />有余量 <i class="dot gap" />必选留空</span>
            <el-button size="small" type="primary" plain @click="openManual">+ 手动加班次</el-button>
          </div>

          <div class="slot-table">
            <div class="st-head">
              <b>时段明细</b>
              <span class="hint">这一空间的计划摊到时段：先看规则为什么是这个数，再看下面这批铺出来的名额剩多少</span>
            </div>
            <el-table :data="slotRows" size="small" border>
              <el-table-column label="时段" min-width="170">
                <template #default="{ row }">
                  <b>{{ row.f.name }}时段</b>
                  <div class="st-sub">{{ shortPlan(row.p.id) }}</div>
                </template>
              </el-table-column>
              <el-table-column label="起止 · 净工时" width="160">
                <template #default="{ row }">
                  {{ row.f.start }} – {{ row.f.end }}
                  <div class="st-sub ok">{{ netLabel(row.f) }} · 休 {{ row.f.breakMin ?? 60 }} 分</div>
                </template>
              </el-table-column>
              <el-table-column label="名额" min-width="180">
                <template #default="{ row }">
                  <b class="st-n">{{ quotaInfo(row.p, row.f).n }}</b>
                  <div class="st-sub">{{ quotaInfo(row.p, row.f).desc }}</div>
                  <div v-if="quotaInfo(row.p, row.f).expr" class="st-expr">{{ quotaInfo(row.p, row.f).expr }}</div>
                </template>
              </el-table-column>
              <el-table-column label="性质" width="72">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.p.nature === 'required' ? 'danger' : 'info'" effect="plain">
                    {{ row.p.nature === 'required' ? '必选' : '可选' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="星期" width="90">
                <template #default="{ row }">{{ daysLabel(row.f) }}</template>
              </el-table-column>
              <el-table-column label="生成" min-width="140">
                <template #default="{ row }">
                  <div class="st-sub">{{ row.p.cadence.note }}</div>
                </template>
              </el-table-column>
              <el-table-column label="获取规则" min-width="200">
                <template #default="{ row }">
                  <el-tag size="small" effect="plain" class="st-mode">{{ modeTag(row.p.mode) }}</el-tag>
                  <div class="st-sub">{{ ruleSummary(row.p) }}</div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div v-if="scope === 'week'" class="gen-grid">
            <div v-for="d in days" :key="d" class="gen-col">
              <header>
                <b>{{ d.slice(5) }}</b>
                <em>{{ weekdayLabel4(d) }}</em>
              </header>
              <div v-for="inst in spaceInstancesOf(d)" :key="inst.id" class="gen-card" :class="stateOf(inst)">
                <div class="gc-top">
                  <span class="gc-plan">{{ shortPlan(inst.planId) }}</span>
                  <span class="gc-form">{{ inst.form.name }}</span>
                </div>
                <div class="gc-mid">{{ inst.start }}–{{ inst.end }}</div>
                <div class="gc-bot">
                  <b>{{ inst.filled }}/{{ inst.quota.effective }}</b>
                  <span v-if="inst.makeup" class="mk">补班</span>
                  <span v-else-if="inst.manual" class="mk manual">手动</span>
                  <span v-else-if="inst.voided" class="mk void">可不用 · 空壳</span>
                  <span v-else-if="inst.voidedQuota" class="mk void">名额可不用 ×{{ inst.voidedQuota }}</span>
                  <span v-else-if="inst.left > 0">{{ inst.published === false ? '待发布' : '剩 ' + inst.left }}</span>
                  <span v-else>已分完</span>
                </div>
                <div v-if="inst.compensates" class="gc-comp">已弥补「{{ inst.compensates.formName }} {{ inst.compensates.start }}–{{ inst.compensates.end }}」的洞</div>
              </div>
              <div v-if="!spaceInstancesOf(d).length" class="col-empty">—</div>
            </div>
          </div>

          <div v-else class="month-grid">
            <div v-for="d in days" :key="d" class="mcell" :class="{ out: !inBatchRange(d) }">
              <div class="mday">{{ Number(d.slice(8)) }}<em>{{ weekdayLabel4(d).replace('周', '') }}</em></div>
              <div v-if="spaceInstancesOf(d).length" class="mstats">
                <span>{{ filledOf(d) }}/{{ quotaOf(d) }}</span>
                <i v-if="gapOf(d)" class="dot gap" />
              </div>
              <div v-else class="mempty">{{ inBatchRange(d) ? '—' : '未铺' }}</div>
            </div>
          </div>
        </section>

        <!-- ④ 排班结果（只看这个空间） -->
        <section v-else class="pane">
          <div class="stat-row">
            <div class="stat"><b>{{ spaceBatchStats.rows }}</b><em>排班记录</em></div>
            <div class="stat"><b>{{ spaceBatchStats.fallback }}</b><em>兜底补位</em></div>
            <div class="stat"><b>{{ spaceBatchStats.overtime }}</b><em>含加班</em></div>
            <div class="stat" :class="{ danger: spaceBatchStats.gaps }"><b>{{ spaceBatchStats.gaps }}</b><em>必选留空</em></div>
          </div>

          <div v-if="spaceBatchStats.gaps" class="gap-box">
            <div class="gap-title">必选时段没排满 —— 责任要落到人，不能就这么放着</div>
            <div class="gap-list">
              <span v-for="(g, i) in spaceBatchStats.gapList.slice(0, 8)" :key="i" class="gap-item">
                {{ g.date }} {{ g.space }} · {{ g.form }} 缺 {{ g.left }}
              </span>
            </div>
          </div>

          <el-table :data="resultRows" size="small" border max-height="520" class="res-table">
            <el-table-column label="日期" width="128">
              <template #default="{ row }">{{ row.date }} {{ weekdayLabel4(row.date) }}</template>
            </el-table-column>
            <el-table-column label="班次" width="150">
              <template #default="{ row }">{{ row.formName }} {{ row.start }}–{{ row.end }}</template>
            </el-table-column>
            <el-table-column label="人" width="90" prop="personName" />
            <el-table-column label="岗位" width="100" prop="positionName" />
            <el-table-column label="来源" width="104">
              <template #default="{ row }">
                <el-tag size="small" :type="row.fallback || row.fromEvent ? 'warning' : row.way === '审核通过' ? 'success' : 'info'" effect="plain">
                  {{ row.way }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="工时" width="80">
              <template #default="{ row }">{{ row.hours }} h</template>
            </el-table-column>
            <el-table-column label="超出尺子" width="110">
              <template #default="{ row }">
                <span v-if="row.overtimeMin" class="ot">+{{ (row.overtimeMin / 60).toFixed(1) }} h 加班</span>
                <span v-else class="muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="综合分" width="80">
              <template #default="{ row }">{{ row.score }}</template>
            </el-table-column>
          </el-table>

          <!-- 人的时间线：同一条记录链，换个人视角看（原计划 → 覆盖 → 补位 / 取消 / 转移） -->
          <div class="tl-box">
            <div class="tl-head">
              <span class="tl-title">人的时间线<span class="hint2">原计划 → 事件覆盖 → 补位 / 取消 / 转移，历史全保留</span></span>
              <el-select v-model="tlPerson" size="small" filterable style="width: 240px">
                <el-option v-for="p in v4.people" :key="p.id" :label="`${p.name} · ${posName4(p.positionId)} · ${spaceOf4(p.spaceId)?.name}`" :value="p.id" />
              </el-select>
            </div>
            <div v-if="tlRows.length" class="tl-rows">
              <div v-for="(e, i) in tlRows" :key="e.id + e.state + i" class="tl-row">
                <span class="tl-date">{{ e.date }} {{ weekdayLabel4(e.date) }}</span>
                <span :class="['tl-form', { strike: e.state === 'covered' }]">{{ e.formName }} {{ e.start }}–{{ e.end }}</span>
                <span :class="['tl-state', e.state]">{{ e.state === 'covered' ? '已释放' : e.transferPending ? '转移待接受' : '已排定' }}</span>
                <span class="tl-note">{{ e.note || (e.overtimeMin > 0 ? `超出尺子 +${(e.overtimeMin / 60).toFixed(1)}h 加班` : '') }}</span>
              </div>
            </div>
            <div v-else class="tl-empty">这个人没有排班记录</div>
          </div>
        </section>
      </main>
    </div>

    <!-- 计划编辑 -->
    <el-drawer v-model="planVisible" :title="planDraft?.id ? `编辑计划 · ${planDraft.id}` : '新建计划'" size="1080px">
      <div v-if="planDraft" class="editor">
        <div class="row2">
          <label>计划名称<el-input v-model="planDraft.name" size="small" /></label>
          <label>空间
            <el-select v-model="planDraft.spaceId" size="small" style="width: 100%">
              <el-option v-for="s in V4_SPACES" :key="s.id" :label="`${s.name}（${s.tag} · ${s.city}）`" :value="s.id" />
            </el-select>
          </label>
        </div>

        <div class="row3">
          <label>获取模式
            <el-select v-model="planDraft.mode" size="small">
              <el-option label="轮转直派" value="direct" />
              <el-option label="先到先得" value="grab" />
              <el-option label="审核截断" value="review" />
            </el-select>
          </label>
          <label>班次性质
            <el-radio-group v-model="planDraft.nature" size="small">
              <el-radio-button label="required">必选</el-radio-button>
              <el-radio-button label="optional">可选</el-radio-button>
            </el-radio-group>
          </label>
          <label>节奏
            <el-time-picker v-model="planDraft.cadence.time" value-format="HH:mm" format="HH:mm" size="small" style="width: 110px" placeholder="生成时刻" />
            <span class="hint2">{{ planDraft.cadence.type === 'weekly' ? `每周${['日','一','二','三','四','五','六'][planDraft.cadence.weekday]}：定时跑批铺 ${planDraft.cadence.horizon === 'n3' ? '第三周（周对周）' : '下一周'}` : `每月 ${planDraft.cadence.day} 日铺下月整月` }}</span>
          </label>
        </div>

        <div class="block">
          <div class="block-head">名额来源</div>
          <div class="quota-edit">
            <el-radio-group v-model="planDraft.quota.source" size="small">
              <el-radio-button label="algo">算法能力</el-radio-button>
              <el-radio-button label="manual">人工固定</el-radio-button>
            </el-radio-group>
            <el-select v-if="planDraft.quota.source === 'algo'" v-model="planDraft.quota.algoId" size="small" style="width: 200px">
              <el-option v-for="a in V4_ALGOS" :key="a.id" :label="a.name" :value="a.id" />
            </el-select>
            <template v-else>
              <el-input-number v-model="planDraft.quota.value" :min="1" :max="30" size="small" controls-position="right" style="width: 100px" />
              <span class="hint2">默认值；每个时段在下方「时段形态」里单独设数量</span>
            </template>
            <span v-if="planDraft.quota.source === 'algo'" class="hint2">改动期 {{ planDraft.quota.windowMin }} 分钟（最少 5）后生效</span>
          </div>
          <div class="chain">
            服务算 <b>{{ draftQuota.initial }}</b>
            <span class="arrow">→</span> 改动期 {{ planDraft.quota.windowMin }} 分钟（人事可调）
            <span class="arrow">→</span> 名额生效 <b>{{ draftQuota.effective }}</b>
          </div>
          <code class="expr">{{ draftQuota.expr }}</code>
        </div>

        <div class="block">
          <div class="block-head">时段形态<span class="hint2">适用星期可留空=计划全跑的日子都出；后续处理每个时段独立配置；超出标准时间记加班</span></div>
          <div v-for="(f, i) in planDraft.forms" :key="i" class="fs-item">
            <div class="fs-row">
              <el-input v-model="f.name" size="small" style="width: 96px" />
              <el-input v-model="f.start" size="small" style="width: 74px" />
              <span class="dash">–</span>
              <el-input v-model="f.end" size="small" style="width: 74px" />
              <el-select v-model="f.days" multiple collapse-tags size="small" placeholder="每天" style="width: 148px">
                <el-option v-for="(d, di) in ['周日','周一','周二','周三','周四','周五','周六']" :key="di" :label="d" :value="di" />
              </el-select>
              <el-input-number v-if="planDraft.quota.source === 'manual'" v-model="f.quota.value" :min="1" :max="30" size="small" controls-position="right" style="width: 86px" />
              <span class="ot-preview">{{ overtimePreview(f) }}</span>
              <el-button link size="small" @click="planDraft.forms.splice(i, 1)">删</el-button>
            </div>
            <div class="fs-ac">
              <span class="fs-ac-label">后续<br>处理</span>
              <div class="ac-grid">
                <div class="ac-cell" :class="{ off: !f.aftercare.cancel.allow }">
                  <el-checkbox v-model="f.aftercare.cancel.allow" size="small">可取消</el-checkbox>
                  <div v-if="f.aftercare.cancel.allow" class="ac-ctrl">
                    <span class="ac-item">前 <el-input-number v-model="f.aftercare.cancel.value" :min="f.aftercare.cancel.unit === 'h' ? 1 : 10" :max="4320" size="small" controls-position="right" style="width: 64px" @change="clampAc(f.aftercare.cancel)" />
                      <el-select v-model="f.aftercare.cancel.unit" size="small" style="width: 66px" @change="clampAc(f.aftercare.cancel, true)">
                        <el-option label="小时" value="h" />
                        <el-option label="分钟" value="min" />
                      </el-select></span>
                    <el-radio-group v-model="f.aftercare.cancel.mode" size="small">
                      <el-radio-button label="release">回池</el-radio-button>
                      <el-radio-button label="void">作废</el-radio-button>
                    </el-radio-group>
                  </div>
                </div>
                <div class="ac-cell" :class="{ off: !f.aftercare.transfer.allow }">
                  <el-checkbox v-model="f.aftercare.transfer.allow" size="small">可转移</el-checkbox>
                  <div v-if="f.aftercare.transfer.allow" class="ac-ctrl">
                    <span class="ac-item">等待 <el-input-number v-model="f.aftercare.transfer.value" :min="f.aftercare.transfer.unit === 'h' ? 1 : 10" :max="4320" size="small" controls-position="right" style="width: 64px" @change="clampAc(f.aftercare.transfer)" />
                      <el-select v-model="f.aftercare.transfer.unit" size="small" style="width: 66px" @change="clampAc(f.aftercare.transfer, true)">
                        <el-option label="小时" value="h" />
                        <el-option label="分钟" value="min" />
                      </el-select></span>
                    <el-checkbox v-model="f.aftercare.transfer.samePositionOnly" size="small">限同岗位</el-checkbox>
                  </div>
                </div>
                <div class="ac-cell" :class="{ off: !f.aftercare.swap.allow }">
                  <el-checkbox v-model="f.aftercare.swap.allow" size="small">可换班</el-checkbox>
                  <div v-if="f.aftercare.swap.allow" class="ac-ctrl">
                    <span class="ac-item">同意等待 <el-input-number v-model="f.aftercare.swap.value" :min="f.aftercare.swap.unit === 'h' ? 1 : 10" :max="4320" size="small" controls-position="right" style="width: 64px" @change="clampAc(f.aftercare.swap)" />
                      <el-select v-model="f.aftercare.swap.unit" size="small" style="width: 66px" @change="clampAc(f.aftercare.swap, true)">
                        <el-option label="小时" value="h" />
                        <el-option label="分钟" value="min" />
                      </el-select></span>
                    <el-checkbox v-model="f.aftercare.swap.samePositionOnly" size="small">同岗位对等</el-checkbox>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-button link size="small" @click="addForm">+ 加一段</el-button>
        </div>

        <div class="block">
          <div class="block-head">优先序列<span class="hint2">开放时间从名额发布（定时生成）那一刻起算：0 = 发布即开放，N = 发布 N 小时后该档才可见可领</span></div>
          <div v-for="(t, i) in nonFallback(planDraft)" :key="t.id" class="tier-row">
            <span class="idx">{{ i + 1 }}</span>
            <el-input v-model="t.label" size="small" style="width: 120px" />
            <el-select v-model="t.positionId" size="small" style="width: 112px">
              <el-option v-for="ps in V4_POSITIONS" :key="ps.id" :label="ps.name" :value="ps.id" />
            </el-select>
            <el-select v-model="t.employ" size="small" style="width: 84px">
              <el-option label="不限" value="any" />
              <el-option label="全职" value="fulltime" />
              <el-option label="非全" value="parttime" />
            </el-select>
            <el-input-number v-model="t.cap" :min="1" :max="30" size="small" controls-position="right" style="width: 88px" placeholder="上限" />
            <span class="open-cell">发布后 <el-input-number v-model="t.open.delayHours" :min="0" :max="72" size="small" controls-position="right" style="width: 62px" /> h 开放</span>
            <el-button link size="small" :disabled="i === 0" @click="moveTier(i, -1)">上移</el-button>
            <el-button link size="small" :disabled="i === nonFallback(planDraft).length - 1" @click="moveTier(i, 1)">下移</el-button>
            <el-button link size="small" @click="removeTier(i)">删</el-button>
          </div>
          <el-button link size="small" @click="addTier">+ 加一档</el-button>

          <div class="fb-row">
            <span class="fb-label">兜底承接</span>
            <el-switch v-model="draftFallbackOn" size="small" />
            <el-select v-if="draftFallbackOn" v-model="draftFallbackForm" size="small" style="width: 180px">
              <el-option v-for="f in planDraft.forms" :key="f.id" :label="`${f.name} ${f.start}-${f.end}`" :value="f.id" />
            </el-select>
            <span class="hint2">所有档位都满了还没排上的人，进这个时段</span>
          </div>
        </div>

        <div class="block">
          <div class="block-head">资格</div>
          <el-input v-model="planDraft.qualify.note" size="small" type="textarea" :rows="2" />
        </div>

        <div class="drawer-foot">
          <el-button size="small" @click="planVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="savePlan">保存（下一批生效）</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 手动加班次 -->
    <el-dialog v-model="manualVisible" title="手动补充班次" width="440px">
      <div class="manual-form">
        <p class="hint">临时性归人工：人事凭空建一个批外时段，挂在计划下（继承资格与档位），名额人工给定、立即发布可申领。</p>
        <label>挂在计划
          <el-select v-model="manualDraft.planId" size="small" style="width: 100%">
            <el-option v-for="p in spacePlans.filter(p => p.enabled !== false)" :key="p.id" :label="`${p.name}（${modeLabel(p.mode)}）`" :value="p.id" />
          </el-select>
        </label>
        <div class="row3">
          <label>日期<el-input v-model="manualDraft.date" size="small" placeholder="2026-11-18" /></label>
          <label>开始<el-input v-model="manualDraft.start" size="small" placeholder="18:00" /></label>
          <label>结束<el-input v-model="manualDraft.end" size="small" placeholder="22:00" /></label>
        </div>
        <div class="row2">
          <label>时段名称<el-input v-model="manualDraft.name" size="small" placeholder="临时晚段" /></label>
          <label>名额数<el-input-number v-model="manualDraft.quota" :min="1" :max="10" size="small" controls-position="right" style="width: 100%" /></label>
        </div>
      </div>
      <template #footer>
        <el-button size="small" @click="manualVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="doManual">创建并发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import RulerBar from '../components/v4/RulerBar.vue'
import {
  v4, generate4, pendingChanges4, revertChanges4, upsertPlan4, removePlan4, togglePlan4,
  spaceStats4, weekDays4, monthDays4, monthLabel4, instancesOfDate4, manualShift4,
  planOf4, spaceOf4, timelineOf4
} from '../mock/scheduleV4Store.js'
import {
  V4_SPACES, V4_POSITIONS, V4_ALGOS, searchSpaces4, cities4, rulerOf4, formsOf4,
  quotaOf4, posName4, weekdayLabel4, timeMin, overtimeMin4, DEFAULT_AFTERCARE, acMinutes4, fmtDur4
} from '../mock/scheduleV4.js'

const tabs = [
  { key: 'overview', label: '空间概览' },
  { key: 'plan', label: '周期计划' },
  { key: 'quota', label: '名额视野' },
  { key: 'result', label: '排班结果' }
]
const tab = ref('overview')
const kw = ref('')
const city = ref('')
const scope = ref('week')
const selSpace = ref('SP-01')
const planVisible = ref(false)
const planDraft = ref(null)
const draftFallbackOn = ref(false)
const draftFallbackForm = ref('')
const manualVisible = ref(false)

const pending = pendingChanges4
const cities = cities4()
const curSpace = computed(() => spaceOf4(selSpace.value))
const filteredSpaces = computed(() => searchSpaces4(kw.value).filter(s => !city.value || s.city === city.value))
const days = computed(() => (scope.value === 'week' ? weekDays4() : monthDays4()))
const spacePlans = computed(() => v4.plans.filter(p => p.spaceId === selSpace.value))
const spacePeople = computed(() => v4.people.filter(p => p.spaceId === selSpace.value && p.active !== false))

/* 名额视野顶部的时段明细表：行 = 空间里每个计划摊开的每个时段。
   先看规则（为什么是这个数），再看下面的周历（这批铺出来剩多少）。 */
const slotRows = computed(() => spacePlans.value.flatMap(p => formsOf4(p).map(f => ({ p, f }))))
const netLabel = f => {
  const gross = Math.max(0, timeMin(f.end) - timeMin(f.start))
  const brk = f.breakMin ?? 60
  const net = gross - brk
  return `净 ${Math.floor(net / 60)}h${net % 60 ? ` ${net % 60} 分` : ''}`
}
const quotaInfo = (p, f) => {
  if (p.quota.source === 'manual') return { n: f.quota?.value ?? p.quota.value, desc: '固定值', expr: '' }
  const q = quotaOf4(p, { form: f })
  return { n: q.initial ?? q.effective, desc: `${q.algoName} · 改动期 ${p.quota.windowMin} 分`, expr: q.expr }
}
const modeTag = m => ({ direct: '直派轮转', grab: '公布即抢', review: '申领审核' }[m] || m)
const ruleSummary = p => {
  const tiers = nonFallback(p).length
  const fb = fallbackOf(p)
  return `${modeLabel(p.mode)} · ${tiers} 档${fb ? ' · 余额：兜底序列' : ' · 无兜底'}`
}

const pickSpace = id => { selSpace.value = id }

const doGenerate = () => {
  generate4()
  ElMessage.success(`已生成第 ${v4.gen.seq} 批，配置改动按新一批生效`)
}

/* ---- 空间概览 ---- */
const rulerFor = spaceId => {
  const p = v4.plans.find(x => x.spaceId === spaceId)
  const pid = p ? (p.priority[0] || {}).positionId || p.positions[0] : null
  return pid ? rulerOf4(spaceId, pid) : rulerOf4(spaceId, '')
}
const barsFor = spaceId => {
  const bars = []
  for (const p of v4.plans.filter(x => x.spaceId === spaceId)) {
    const pid = (p.priority[0] || {}).positionId || p.positions[0]
    for (const f of formsOf4(p)) {
      bars.push({ name: f.name, start: f.start, end: f.end, overtimeMin: overtimeMin4(spaceId, pid, f.start, f.end) })
    }
  }
  return bars.slice(0, 4)
}

/* ---- 后续处理规则的展示文案（按时段；时段没单独配的回落计划级，再兜底默认） ---- */
const acBit = (p, f, k) => f.aftercare?.[k] || p.aftercare?.[k] || DEFAULT_AFTERCARE[k]
const acCancelLabel = (p, f) => {
  const c = acBit(p, f, 'cancel')
  if (!c?.allow) return '取消不允许'
  return `可取消（开班前 ${fmtDur4(acMinutes4(c))} · ${c.mode === 'void' ? '作废' : '回池'}）`
}
const acTransferLabel = (p, f) => {
  const t = acBit(p, f, 'transfer')
  if (!t?.allow) return '转移不允许'
  return `可转移（等待 ${fmtDur4(acMinutes4(t))}${t.samePositionOnly ? ' · 限同岗位' : ''}）`
}
const acSwapLabel = (p, f) => {
  const s = acBit(p, f, 'swap')
  if (!s?.allow) return '换班不允许'
  return `可换班（等同意 ${fmtDur4(acMinutes4(s))}${s.samePositionOnly ? ' · 同岗位' : ''}）`
}
/* 单位切换后把数值夹进合法区间：小时 ≥1，分钟 ≥10 */
const clampAc = (x, onUnit) => {
  if (!x) return
  if (x.unit === 'h' && (!onUnit || x.value < 1)) x.value = Math.max(1, Math.round(x.value || 1))
  if (x.unit === 'min' && (!onUnit || x.value < 10)) x.value = Math.max(10, Math.round(x.value || 10))
}
const WD = ['日', '一', '二', '三', '四', '五', '六']
const daysLabel = f => (f.days?.length ? `仅周${[...f.days].sort().map(d => WD[d]).join('、周')}` : '每天')

const modeLabel = m => ({ direct: '轮转直派', grab: '先到先得', review: '审核截断' }[m] || m)
const nonFallback = p => (p?.priority || []).filter(t => !t.fallback)
const fallbackOf = p => (p?.priority || []).find(t => t.fallback) || null
const shortPlan = id => {
  const p = planOf4(id)
  if (!p) return id
  return `${spaceOf4(p.spaceId)?.name?.slice(0, 3)}·${(p.positions || []).map(posName4).join('/')}`
}
const stateOf = inst => {
  if (inst.voided) return 'void'
  const plan = planOf4(inst.planId)
  if (inst.left > 0 && plan?.nature === 'required') return 'gap'
  if (inst.left > 0) return 'part'
  return 'ok'
}

/* ---- 名额视野 / 结果：全部按选中空间过滤 ---- */
const spaceInstancesOf = d => instancesOfDate4(d).filter(i => i.spaceId === selSpace.value)
const inBatchRange = d => d >= v4.range.from && d <= v4.range.to
const filledOf = d => spaceInstancesOf(d).reduce((a, b) => a + b.filled, 0)
const quotaOf = d => spaceInstancesOf(d).reduce((a, b) => a + b.quota.effective, 0)
const gapOf = d => spaceInstancesOf(d).some(i => {
  const plan = planOf4(i.planId)
  return i.left > 0 && plan?.nature === 'required'
})
const gapOfSpace = spaceId => (v4.batch?.instances || []).some(i => {
  if (i.spaceId !== spaceId) return false
  const plan = planOf4(i.planId)
  return i.left > 0 && plan?.nature === 'required'
})

const spaceBatchStats = computed(() => {
  const insts = (v4.batch?.instances || []).filter(i => i.spaceId === selSpace.value)
  const rows = (v4.batch?.results || []).filter(r => r.spaceId === selSpace.value)
  const gapList = insts.filter(i => {
    const plan = planOf4(i.planId)
    return i.left > 0 && plan?.nature === 'required'
  }).map(i => ({
    date: i.date, plan: planOf4(i.planId)?.name, space: spaceOf4(i.spaceId)?.name,
    form: i.form.name, left: i.left
  }))
  return {
    rows: rows.length,
    fallback: rows.filter(r => r.fallback).length,
    overtime: rows.filter(r => r.overtimeMin > 0).length,
    gaps: gapList.length,
    gapList
  }
})

const resultRows = computed(() => (v4.batch?.results || [])
  .filter(r => r.spaceId === selSpace.value)
  .sort((a, b) => (a.date + a.start + a.personId).localeCompare(b.date + b.start + b.personId)))

/* ---- 人的时间线（结果页的人视角；默认韩野——补位故事里被覆盖的人） ---- */
const tlPerson = ref('E-425')
const tlRows = computed(() => timelineOf4(tlPerson.value))

/* ---- 计划编辑 ---- */
const blankPlan = () => ({
  id: '', __new: true, spaceId: selSpace.value, name: '未命名计划',
  positions: ['PS-01'], mode: 'review', nature: 'required', enabled: true,
  cadence: { type: 'weekly', weekday: 4, time: '07:00', horizon: 'n1', note: '' },
  days: [1, 2, 3, 4, 5, 6, 0],
  forms: [{ id: 'SH-A', name: '早班', start: '10:00', end: '18:00' }],
  quota: { source: 'algo', algoId: 'AG-02', value: 1, windowMin: 10, adjusted: null },
  priority: [{ id: 'T1', positionId: 'PS-01', employ: 'any', cap: null, label: '第一档' }],
  qualify: { note: '本空间在册、非请假、当天无冲突' },
  aftercare: JSON.parse(JSON.stringify(DEFAULT_AFTERCARE)),
  note: ''
})

/* 打开抽屉前补齐每个时段/档位的结构默认值（后续处理每时段独立、名额人工按时段、档位开放时间） */
const ensureFormExtras = f => {
  f.aftercare = JSON.parse(JSON.stringify(f.aftercare || planDraft.value?.aftercare || DEFAULT_AFTERCARE))
  if (f.quota?.value == null) f.quota = { value: planDraft.value?.quota?.value || 1 }
  if (!Array.isArray(f.days)) f.days = []
}
const ensureTierExtras = t => { if (!t.open) t.open = { delayHours: 0 } }

const openPlan = p => {
  planDraft.value = p ? JSON.parse(JSON.stringify(p)) : blankPlan()
  planDraft.value.aftercare = JSON.parse(JSON.stringify(planDraft.value.aftercare || DEFAULT_AFTERCARE))
  planDraft.value.forms.forEach(ensureFormExtras)
  planDraft.value.priority.forEach(ensureTierExtras)
  const fb = (planDraft.value.priority || []).find(t => t.fallback)
  draftFallbackOn.value = !!fb
  draftFallbackForm.value = fb?.formId || planDraft.value.forms[0]?.id || ''
  planVisible.value = true
}

const draftQuota = computed(() => (planDraft.value ? quotaOf4(planDraft.value, { form: planDraft.value.forms[0] }) : { initial: 0, effective: 0, expr: '' }))

const addForm = () => {
  const f = { id: `SH-${Date.now().toString().slice(-4)}`, name: '新时段', start: '10:00', end: '18:00', days: [] }
  ensureFormExtras(f)
  planDraft.value.forms.push(f)
}
const addTier = () => {
  const t = {
    id: `T${Date.now().toString().slice(-4)}`,
    positionId: planDraft.value.positions[0] || 'PS-01',
    employ: 'any', cap: null, label: `第 ${nonFallback(planDraft.value).length + 1} 档`,
    open: { delayHours: 0 }
  }
  ensureTierExtras(t)
  planDraft.value.priority.push(t)
}
const removeTier = i => {
  const list = planDraft.value.priority
  const target = nonFallback(planDraft.value)[i]
  const idx = list.indexOf(target)
  if (idx !== -1) list.splice(idx, 1)
}
const moveTier = (i, dir) => {
  const tiers = nonFallback(planDraft.value)
  const a = tiers[i]
  const b = tiers[i + dir]
  if (!a || !b) return
  const list = planDraft.value.priority
  const ia = list.indexOf(a)
  const ib = list.indexOf(b)
  list.splice(ia, 1, b)
  list.splice(ib, 1, a)
}
const overtimePreview = f => {
  const plan = planDraft.value
  const pid = plannerPosition(plan)
  const segs = rulerOf4(plan.spaceId, pid)
  let cover = 0
  for (const g of segs) cover += Math.max(0, Math.min(timeMin(f.end), timeMin(g.end)) - Math.max(timeMin(f.start), timeMin(g.start)))
  const over = Math.max(0, timeMin(f.end) - timeMin(f.start) - cover)
  return over > 0 ? `超出尺子 ${(over / 60).toFixed(1)}h 加班` : '在标准时间内'
}
const plannerPosition = p => (p.priority[0] || {}).positionId || p.positions[0]

const savePlan = () => {
  const d = planDraft.value
  d.positions = [...new Set(nonFallback(d).map(t => t.positionId))]
  const tiers = nonFallback(d).map(t => ({ ...t }))
  if (draftFallbackOn.value) {
    tiers.push({ id: 'TF', fallback: true, formId: draftFallbackForm.value, label: '兜底承接' })
  }
  d.priority = tiers
  upsertPlan4(d)
  planVisible.value = false
  ElMessage.success('已保存，改动在下一批生成时生效（含后续处理规则）')
}

const removePlan = p => {
  removePlan4(p.id)
  ElMessage.info('计划已删除（已生成的批次不受影响）')
}

/* ---- 手动加班次 ---- */
const manualDraft = reactive({
  planId: '', date: '2026-11-18', name: '临时晚段', start: '18:00', end: '22:00', quota: 1
})
const openManual = () => {
  // 默认挂到本空间第一个启用中的计划，避免「先选一个计划」的空击
  manualDraft.planId = (spacePlans.value.find(p => p.enabled !== false) || spacePlans.value[0])?.id || ''
  manualVisible.value = true
}
const doManual = () => {
  if (!manualDraft.planId) {
    ElMessage.warning('先选一个挂靠的计划')
    return
  }
  const r = manualShift4({ ...manualDraft })
  if (!r.ok) {
    ElMessage.error(r.why)
    return
  }
  manualVisible.value = false
  ElMessage.success(`已创建并发布：${manualDraft.date} ${manualDraft.start}–${manualDraft.end}，名额 ${manualDraft.quota} 个（可申领）`)
}
</script>

<style scoped>
.v4-page { padding: 20px 24px 40px; background: #f5f6f8; min-height: 100%; }
.v4-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.v4-head h1 { margin: 0; font-size: 19px; font-weight: 600; color: #1f2329; }
.v4-head p { margin: 4px 0 0; font-size: 12px; color: #9096a0; }
.hr { display: flex; align-items: center; gap: 12px; }
.genbar { display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid #eef0f3; border-radius: 10px; padding: 8px 12px; }
.genbar .seq { font-size: 12px; color: #5f6570; }
.genbar .warn { font-size: 12px; color: #b8791a; background: #faeeda; padding: 2px 8px; border-radius: 999px; }
.genbar .ok { font-size: 12px; color: #2f7a5a; background: #e8f5ee; padding: 2px 8px; border-radius: 999px; }

/* 主从布局 */
.v4-body { display: flex; gap: 16px; align-items: flex-start; }
.space-rail { flex: none; width: 232px; background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 10px; position: sticky; top: 12px; max-height: calc(100vh - 120px); display: flex; flex-direction: column; gap: 8px; }
.chips { display: flex; gap: 5px; flex-wrap: wrap; }
.chips button { border: 1px solid #e4e7ec; background: #fff; border-radius: 999px; padding: 2px 9px; font-size: 11px; color: #5f6570; cursor: pointer; }
.chips button.on { border-color: #a40035; color: #a40035; background: #fdf2f5; }
.rail-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; min-height: 0; }
.rail-item { text-align: left; border: 1px solid #eef0f3; background: #fff; border-radius: 9px; padding: 8px 10px; cursor: pointer; font: inherit; }
.rail-item:hover { border-color: #d8c3cb; }
.rail-item.on { border-color: #a40035; background: #fdf2f5; }
.ri-top { display: flex; align-items: center; gap: 6px; }
.ri-top strong { font-size: 13px; color: #1f2329; font-weight: 600; }
.gap-dot { width: 7px; height: 7px; border-radius: 50%; background: #e24b4a; flex: none; margin-left: auto; }
.ri-meta { display: flex; align-items: center; gap: 6px; margin-top: 4px; font-size: 11px; color: #9096a0; }
.mini-tag { font-size: 10px; color: #185fa5; background: #e6f1fb; border-radius: 3px; padding: 0 5px; }
.ri-meta em { font-style: normal; margin-left: auto; font-size: 10px; color: #a8adb5; }
.rail-foot { font-size: 10.5px; color: #a8adb5; line-height: 1.6; border-top: 1px dashed #eef0f3; padding-top: 8px; }

.v4-main { flex: 1; min-width: 0; }
.tabs { display: flex; gap: 6px; margin-bottom: 14px; border-bottom: 1px solid #e9ebef; align-items: center; }
.tabs button { background: none; border: none; padding: 9px 14px; font-size: 13px; color: #5f6570; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.tabs button.on { color: #a40035; border-bottom-color: #a40035; font-weight: 500; }
.cur-space { margin-left: auto; font-size: 12px; color: #5f6570; background: #f7f8fa; border-radius: 999px; padding: 3px 12px; }

.pane { background: transparent; }
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.toolbar .grow { flex: 1; }
.hint { font-size: 12px; color: #9096a0; }
.hint2 { font-size: 11px; color: #a8adb5; }

/* 空间概览 */
.ov-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 16px 18px; }
.ov-card header { display: flex; align-items: center; justify-content: space-between; }
.sname { display: flex; align-items: center; gap: 8px; }
.sname strong { font-size: 16px; color: #1f2329; }
.tag { font-size: 11px; color: #185fa5; background: #e6f1fb; border-radius: 4px; padding: 1px 6px; }
.city { font-size: 11px; color: #6b7280; background: #f3f4f6; border-radius: 4px; padding: 1px 6px; }
.biz { font-size: 12px; color: #9096a0; }
.addr { font-size: 11px; color: #a8adb5; margin: 4px 0 10px; }
.pos-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 10px; }
.pos { font-size: 11px; color: #374151; background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 6px; padding: 2px 8px; }
.pos b { color: #a40035; margin: 0 2px; }
.pos em { color: #9aa0a6; font-style: normal; font-size: 10px; }
.pos.muted { color: #a8adb5; }
.ov-people { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.pp { font-size: 11px; color: #374151; background: #fff; border: 1px solid #e4e7ec; border-radius: 999px; padding: 2px 10px; }
.pp em { font-style: normal; color: #9aa0a6; margin-left: 4px; font-size: 10px; }
.ov-card footer { display: flex; gap: 14px; font-size: 11px; color: #9096a0; border-top: 1px dashed #eef0f3; padding-top: 10px; }

/* 计划卡片 */
.plan-list { display: flex; flex-direction: column; gap: 12px; }
.plan-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 14px 16px; }
.plan-card header { display: flex; align-items: center; justify-content: space-between; }
.pname { display: flex; align-items: center; gap: 8px; }
.pname strong { font-size: 14px; color: #1f2329; }
.off { font-size: 11px; color: #9aa0a6; background: #f3f4f6; padding: 1px 6px; border-radius: 4px; }
.pmeta { display: flex; flex-wrap: wrap; gap: 16px; margin: 10px 0 8px; }
.kv { font-size: 12px; color: #374151; }
.kv em { font-style: normal; color: #9096a0; margin-right: 6px; }
.pforms { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.form-chip { font-size: 11px; color: #0f6e56; background: #e1f5ee; border-radius: 4px; padding: 2px 8px; }
.form-chip.fb { color: #854f0b; background: #faeeda; }
.quota-line { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #374151; flex-wrap: wrap; margin-bottom: 6px; }
.badge { font-size: 10px; color: #9096a0; background: #f3f4f6; border-radius: 4px; padding: 1px 6px; }
.quota-line code, .expr { font-family: ui-monospace, Menlo, monospace; font-size: 11px; color: #6b7280; background: #f7f8fa; padding: 2px 6px; border-radius: 4px; }
.adj { font-size: 11px; color: #b8791a; }
.ac-line { display: flex; align-items: center; gap: 8px; font-size: 12px; flex-wrap: wrap; margin-bottom: 8px; }
.ac-chip { font-size: 11px; color: #6d3f8f; background: #f4eff9; border: 1px solid #e5dbef; border-radius: 4px; padding: 1px 8px; }
.ac-chip.dim { color: #9aa0a6; background: #f7f8fa; border-color: #eef0f3; }
.tiers { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 12px; }
.tier { color: #374151; background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 6px; padding: 2px 8px; }
.tier em { font-style: normal; color: #9aa0a6; font-size: 10px; margin-left: 4px; }
.tier.fb { color: #993c1d; background: #faece7; border-color: #f5c4b3; }
.tier.none { color: #9aa0a6; }
.arrow { color: #c3c7cf; font-size: 11px; }
.pfoot { display: flex; gap: 14px; margin-top: 10px; font-size: 11px; color: #9096a0; }
.empty-text { font-size: 13px; color: #a8adb5; padding: 30px 0; text-align: center; }

/* 名额视野 */
.seg { display: flex; border: 1px solid #e4e7ec; border-radius: 8px; overflow: hidden; background: #fff; }
.seg button { border: none; background: none; padding: 5px 12px; font-size: 12px; color: #5f6570; cursor: pointer; }
.seg button.on { background: #a40035; color: #fff; }
.legend-mini { font-size: 11px; color: #9096a0; display: flex; align-items: center; gap: 6px; }
.dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.dot.ok { background: #1d9e75; }
.dot.part { background: #ef9f27; }
.dot.gap { background: #e24b4a; }

.gen-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }

.slot-table { margin-bottom: 16px; }
.st-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
.st-head b { font-size: 13px; color: #3d4149; }
.st-sub { font-size: 11px; color: #8590a2; margin-top: 1px; }
.st-sub.ok { color: #2c8a5b; }
.st-n { font-size: 15px; color: #3d4149; }
.st-expr { font-size: 10px; color: #9298a3; margin-top: 1px; font-family: ui-monospace, monospace; }
.st-mode { color: #a40035; border-color: #e3b9c4; }
.gen-col { background: #fbfbfc; border: 1px solid #eef0f3; border-radius: 10px; padding: 8px; min-height: 260px; }
.gen-col header { display: flex; align-items: baseline; gap: 6px; padding-bottom: 6px; border-bottom: 1px solid #eef0f3; margin-bottom: 6px; }
.gen-col header b { font-size: 13px; color: #1f2329; }
.gen-col header em { font-style: normal; font-size: 11px; color: #9096a0; }
.col-empty { font-size: 11px; color: #c3c7cf; text-align: center; padding: 16px 0; }
.gen-card { background: #fff; border: 1px solid #eef0f3; border-left: 3px solid #1d9e75; border-radius: 6px; padding: 6px 8px; margin-bottom: 6px; }
.gen-card.part { border-left-color: #ef9f27; }
.gen-card.gap { border-left-color: #e24b4a; }
.gen-card.void { border-left-color: #9ca3af; opacity: .72; }
.gc-top { display: flex; justify-content: space-between; gap: 4px; }
.gc-plan { font-size: 10px; color: #9096a0; }
.gc-form { font-size: 11px; color: #1f2329; font-weight: 500; }
.gc-mid { font-size: 10px; color: #9aa0a6; margin: 2px 0; }
.gc-bot { display: flex; justify-content: space-between; font-size: 11px; color: #5f6570; }
.gc-bot b { color: #a40035; }
.mk { font-size: 9px; color: #993c1d; background: #faece7; border-radius: 3px; padding: 0 4px; }
.mk.void { color: #57606a; background: #eef0f3; }
.mk.manual { color: #6d3f8f; background: #f4eff9; }
.gc-comp { font-size: 9.5px; color: #0f6e56; background: #e1f5ee; border-radius: 3px; padding: 2px 5px; margin-top: 3px; }

.month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.mcell { background: #fff; border: 1px solid #eef0f3; border-radius: 8px; min-height: 62px; padding: 6px 8px; }
.mcell.out { background: #fafbfc; }
.mday { font-size: 12px; color: #1f2329; display: flex; justify-content: space-between; }
.mday em { font-style: normal; font-size: 10px; color: #a8adb5; }
.mstats { margin-top: 6px; font-size: 11px; color: #374151; display: flex; align-items: center; gap: 4px; }
.mempty { margin-top: 8px; font-size: 11px; color: #c3c7cf; }

/* 排班结果 */
.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; }
.stat { background: #fff; border: 1px solid #eef0f3; border-radius: 10px; padding: 10px 14px; }
.stat b { display: block; font-size: 20px; color: #1f2329; }
.stat em { font-style: normal; font-size: 11px; color: #9096a0; }
.stat.danger b { color: #e24b4a; }
.gap-box { background: #fdf2f5; border: 1px solid #f4c0d1; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; }
.gap-title { font-size: 12px; color: #993556; font-weight: 500; margin-bottom: 6px; }
.gap-list { display: flex; flex-wrap: wrap; gap: 8px; }
.gap-item { font-size: 11px; color: #993556; background: #fff; border: 1px solid #f4c0d1; border-radius: 4px; padding: 2px 8px; }
.res-table { background: #fff; border-radius: 10px; }
.ot { font-size: 11px; color: #993c1d; }
.muted { color: #c3c7cf; }

.tl-box { background: #fff; border: 1px solid #eef0f3; border-radius: 10px; padding: 12px 14px; margin-top: 14px; }
.tl-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.tl-title { font-size: 13px; font-weight: 500; color: #1f2329; display: flex; align-items: baseline; gap: 10px; }
.tl-rows { display: flex; flex-direction: column; }
.tl-row { display: flex; align-items: baseline; gap: 12px; padding: 7px 0; border-top: 1px dashed #f0f1f4; font-size: 12px; }
.tl-row:first-child { border-top: 0; }
.tl-date { flex: none; width: 104px; color: #5f6570; }
.tl-form { flex: none; width: 150px; color: #1f2329; }
.tl-form.strike { text-decoration: line-through; color: #9aa0a6; }
.tl-state { flex: none; font-size: 11px; border-radius: 999px; padding: 1px 8px; }
.tl-state.active { color: #2f7a5a; background: #e8f5ee; }
.tl-state.covered { color: #9aa0a6; background: #f3f4f6; }
.tl-note { flex: 1; color: #9096a0; font-size: 11px; }
.tl-empty { font-size: 12px; color: #a8adb5; padding: 8px 0; }

/* 计划编辑抽屉 */
.editor { display: flex; flex-direction: column; gap: 14px; }
.row2 { display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; }
.row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.editor label { display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: #5f6570; }
.block { border-top: 1px dashed #eef0f3; padding-top: 12px; }
.block-head { display: flex; align-items: baseline; gap: 10px; font-size: 13px; font-weight: 500; color: #1f2329; margin-bottom: 10px; }
.fs-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.dash { color: #c3c7cf; }
.ot-preview { font-size: 11px; color: #993c1d; width: 150px; }
.quota-edit { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.fs-item { border: 1px solid #f0e7ea; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; background: #fffdfa; }
.fs-item .fs-row { display: flex; align-items: center; gap: 8px; }
.fs-ac { display: flex; align-items: flex-start; gap: 10px; margin-top: 6px; padding-top: 8px; border-top: 1px dashed #f0e7ea; font-size: 12px; }
.fs-ac-label { color: #a40035; font-weight: 600; font-size: 12px; line-height: 1.5; flex: none; padding-top: 4px; }
.ac-grid { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; min-width: 0; }
.ac-cell { border: 1px solid #f5eef0; border-radius: 6px; padding: 6px 8px; background: #fff; min-width: 0; }
/* 主题里 el-checkbox 被设成 column 竖排，这里一律拉回横排 */
.ac-cell :deep(.el-checkbox) { display: inline-flex; flex-direction: row; align-items: center; width: auto; height: auto; }
.ac-cell.off { opacity: .55; background: #fafafa; }
.ac-ctrl { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 5px; }
.fs-ac .ac-item { color: #6b7280; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.days-em { font-style: normal; font-size: 11px; color: #92400e; background: #fef3c7; border-radius: 4px; padding: 0 4px; margin-left: 4px; }
.ac-chip b { color: #374151; margin-right: 4px; }
.open-cell { color: #6b7280; font-size: 12px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.chain { font-size: 12px; color: #374151; background: #f7f8fa; border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; }
.chain b { color: #a40035; }
.tier-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.idx { width: 18px; font-size: 11px; color: #9096a0; }
.fb-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eef0f3; }
.fb-label { font-size: 12px; color: #5f6570; }
.ac-edit { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; font-size: 12px; color: #374151; }
.ac-name { font-weight: 500; width: 96px; }
.ac-item { display: inline-flex; align-items: center; gap: 6px; color: #5f6570; }
.drawer-foot { display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px; }

/* 手动加班次 */
.manual-form { display: flex; flex-direction: column; gap: 12px; }
.manual-form label { display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: #5f6570; }
</style>
