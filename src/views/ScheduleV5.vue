<!--
  排班策略 v5 · Web 配置台
  三页签跟着三段走：时段与清单（定义）· 轮与结果（获取）· 事实记录（变化）。
  体验约定：周期时段是模板，改动只影响下一轮；临时班次是某一天新增名额，保存即进当前窗口——两件事两个入口，不混表单。
-->
<template>
  <div class="v5-page">
    <header class="v5-head">
      <div class="hl">
        <h1>排班策略 v5</h1>
        <p>时段归空间 · 名额是容量 · 谁能拿由清单说 · 变化写事实重算</p>
      </div>
      <div class="hr">
        <span v-if="v5.configDirty" class="dirty">
          有配置改动 · 下一轮 {{ shortAt(round.nextAt) }} 起生效
          <button @click="revert">撤销</button>
        </span>
        <span v-else class="clean">配置与当前轮一致</span>
        <el-button v-if="isDev" size="small" @click="devResolveApply">申领截止（演示）</el-button>
      </div>
    </header>

    <!-- 时间锚点：现在处在哪一轮、改动什么时候生效 -->
    <div class="round-strip">
      <div class="rs-main">
        <span class="rs-tag">当前轮 {{ round.id }}</span>
        <span>{{ shortAt(round.publishedAt) }} 发布 · 覆盖 {{ short(round.span[0]) }}–{{ short(round.span[1]) }}</span>
        <span>清单开到第 {{ round.k }} 档</span>
        <span class="rs-dl">{{ shortAt(round.applyDeadline) }} 申领截止</span>
      </div>
      <div class="rs-side">
        <span class="rs-now">演示时刻 {{ v5.now }}</span>
        <span class="rs-next">下一轮 {{ shortAt(round.nextAt) }} 生成 · 铺 {{ short(round.nextSpan[0]) }}–{{ short(round.nextSpan[1]) }}；配置改动到那时生效</span>
      </div>
    </div>

    <!-- 一级导航：排班跟着空间走；系统服务是公共资产，不挂在空间下 -->
    <div class="main-tabs">
      <button :class="{ on: mainTab === 'schedule' }" @click="mainTab = 'schedule'">排班</button>
      <button :class="{ on: mainTab === 'svc' }" @click="mainTab = 'svc'">系统服务</button>
    </div>

    <div class="v5-body" v-show="mainTab === 'schedule'">
      <aside class="space-rail">
        <el-input v-model="kw" placeholder="搜名称 / 城市 / 标签" clearable size="small" />
        <div class="chips">
          <button v-for="c in cities" :key="c" :class="{ on: city === c }" @click="city = city === c ? '' : c">{{ c }}</button>
        </div>
        <div class="rail-list">
          <button v-for="s in filteredSpaces" :key="s.id" class="rail-item" :class="{ on: s.id === selSpace }" @click="pickSpace(s.id)">
            <div class="ri-top">
              <strong>{{ s.name }}</strong>
              <i v-if="gapsOf(s.id)" class="gap-dot" />
            </div>
            <div class="ri-meta">
              <span class="mini-tag">{{ s.tag }}</span>
              <span>{{ s.city }}</span>
              <em>{{ peopleOf(s.id) }}人 · {{ slotCount(s.id) }}时段</em>
            </div>
          </button>
        </div>
      </aside>

      <main class="v5-main">
        <div class="tabs">
          <button :class="{ on: tab === 'def' }" @click="tab = 'def'">时段与清单</button>
          <button :class="{ on: tab === 'run' }" @click="tab = 'run'">轮与结果</button>
          <button :class="{ on: tab === 'fact' }" @click="tab = 'fact'">事实记录</button>
          <span class="cur-space">{{ curSpace?.name }} · {{ curSpace?.city }} · {{ curSpace?.tag === '办公区' ? '作业' : '营业' }} {{ curSpace?.bizStart }}–{{ curSpace?.bizEnd }}</span>
        </div>

        <!-- ① 定义段 -->
        <section v-if="tab === 'def'" class="pane">
          <div class="sub-tabs">
            <button :class="{ on: sub === 'cyc' }" @click="sub = 'cyc'">周期时段</button>
            <button :class="{ on: sub === 'tmp' }" @click="sub = 'tmp'">临时班次</button>
            <button :class="{ on: sub === 'rule' }" @click="sub = 'rule'">申领规则</button>
            <span class="sub-spacer" />
            <el-button v-if="sub === 'cyc'" size="small" type="primary" @click="openNew">+ 新增班次</el-button>
          </div>

          <template v-if="sub === 'cyc'">
            <!-- 排班节奏：以前这四个参数写死在代码里，页面上没地方配 -->
            <div class="rhythm">
              <div class="rh-sum" @click="rhythmOpen = !rhythmOpen">
                <span class="rh-caret">{{ rhythmOpen ? '▾' : '▸' }}</span>
                <strong>排班节奏</strong>
                <span class="rh-label">{{ rhythmLabel }}</span>
                <span class="rh-next">下一轮 {{ shortAt(round.nextAt) }} 生成 · 铺 {{ short(round.nextSpan[0]) }}–{{ short(round.nextSpan[1]) }}</span>
                <span class="rh-toggle">{{ rhythmOpen ? '收起' : '展开 · 改' }}</span>
              </div>
              <div v-if="rhythmOpen" class="rh-body">
                <div class="rh-row">
                  <label>循环周期</label>
                  <el-radio-group v-model="rhythm.cycle.anchor" size="small" @change="onAnchor">
                    <el-radio-button value="monday">自然周</el-radio-button>
                    <el-radio-button value="monthStart">自然月</el-radio-button>
                    <el-radio-button value="custom">业务自定义</el-radio-button>
                  </el-radio-group>
                  <template v-if="rhythm.cycle.anchor === 'custom'">
                    <span class="rh-unit">起点</span>
                    <el-date-picker v-model="rhythm.cycle.start" type="date" size="small" value-format="YYYY-MM-DD"
                      style="width: 140px" @change="applyRhythm" />
                    <span class="rh-unit">长度</span>
                    <el-input-number v-model="rhythm.cycle.n" :min="1" :max="12" size="small" controls-position="right"
                      style="width: 84px" @change="applyRhythm" />
                    <el-select v-model="rhythm.cycle.unit" size="small" style="width: 84px" @change="applyRhythm">
                      <el-option label="天" value="day" />
                      <el-option label="周" value="week" />
                      <el-option label="月" value="month" />
                    </el-select>
                  </template>
                  <template v-else>
                    <span class="rh-unit">每</span>
                    <el-input-number v-model="rhythm.cycle.n" :min="1" :max="4" size="small" controls-position="right"
                      style="width: 84px" @change="applyRhythm" />
                    <span class="rh-unit">{{ rhythm.cycle.anchor === 'monthStart' ? '个月' : '周' }}</span>
                  </template>
                </div>
                <div class="rh-row">
                  <label>多久发一次</label>
                  <el-select v-model="rhythm.every" size="small" style="width: 110px" @change="applyRhythm">
                    <el-option label="每期都发" :value="1" />
                    <el-option label="隔一期发" :value="2" />
                    <el-option label="隔两期发" :value="3" />
                  </el-select>
                  <label>发布</label>
                  <span class="rh-unit">周期开始前</span>
                  <el-input-number v-model="publishAhead" :min="0" :max="15" size="small" controls-position="right"
                    style="width: 84px" @change="applyRhythm" />
                  <span class="rh-unit">天</span>
                  <el-input-number v-model="rhythm.publishHour" :min="0" :max="23" size="small" controls-position="right"
                    style="width: 84px" @change="applyRhythm" />
                  <span class="rh-unit">点</span>
                </div>
                <div class="rh-row">
                  <label>申领截止</label>
                  <span class="rh-unit">周期开始前</span>
                  <el-input-number v-model="applyAhead" :min="0" :max="15" size="small" controls-position="right"
                    style="width: 84px" @change="applyRhythm" />
                  <span class="rh-unit">天</span>
                  <el-input-number v-model="rhythm.applyHour" :min="0" :max="23" size="small" controls-position="right"
                    style="width: 84px" @change="applyRhythm" />
                  <span class="rh-unit">点</span>
                </div>

                <!-- 节奏长什么样：一条时间轴，发布旗标 / 覆盖区间 / 申领截止 / 今天 -->
                <svg class="rh-timeline" viewBox="0 0 680 132" role="img"
                  aria-label="节奏时间轴：发布时刻、覆盖区间、申领截止与今天的位置">
                  <line x1="40" y1="78" x2="640" y2="78" stroke="#D8DBE0" stroke-width="1" />
                  <rect :x="rp.startX" y="66" :width="rp.width" height="24" rx="4" fill="#EAF3DE" stroke="#97C459" stroke-width="0.8" />
                  <text :x="rp.startX + rp.width / 2" y="82" text-anchor="middle" font-size="11" fill="#27500A">
                    这一轮铺 {{ short(round.nextSpan[0]) }} – {{ short(round.nextSpan[1]) }}
                  </text>
                  <!-- 发布 -->
                  <line :x1="rp.pubX" y1="50" :x2="rp.pubX" y2="78" stroke="#a40035" stroke-width="1.2" />
                  <circle :cx="rp.pubX" cy="48" r="3.5" fill="#a40035" />
                  <text :x="rp.pubX" y="40" text-anchor="middle" font-size="11" font-weight="600" fill="#a40035">发布 {{ shortAt(round.nextAt) }}</text>
                  <!-- 申领截止 -->
                  <line :x1="rp.dlX" y1="90" :x2="rp.dlX" y2="112" stroke="#854F0B" stroke-width="1" stroke-dasharray="3 2" />
                  <text :x="rp.dlX" y="126" text-anchor="middle" font-size="11" fill="#854F0B">申领截止 {{ rp.dlText }}</text>
                  <!-- 今天 -->
                  <line :x1="rp.nowX" y1="30" :x2="rp.nowX" y2="112" stroke="#2C2C2A" stroke-width="0.8" stroke-dasharray="2 3" />
                  <text :x="rp.nowX" y="24" text-anchor="middle" font-size="10.5" fill="#6a6a75">今天</text>
                </svg>
                <div class="rh-note">改了节奏，下一次生成就按新节奏走；正在跑的当前轮不动，清单窗口跟着本轮发布时刻算。</div>
              </div>
            </div>

            <div class="hint-line">周期时段是模板：保存后从下一轮起生效，当前轮按已生成快照跑，不重算。</div>

            <!-- 视图切换：按班次（配置对象是班次）/ 按周期（节奏铺下来的每一天） -->
            <div class="cyc-switch">
              <button :class="{ on: cycView === 'cycle' }" @click="cycView = 'cycle'">按周期</button>
              <button :class="{ on: cycView === 'list' }" @click="cycView = 'list'">按班次</button>
            </div>

            <!-- 编辑区：抽屉承载，不再往下挤页面 -->
            <el-drawer :model-value="!!editing" size="840px"
              :title="editing === 'new' ? '新建班次' : `编辑：${form.name}`"
              @update:model-value="v => { if (!v) editing = null }">
              <div class="drawer-tag">{{ editing === 'new' ? '尚未保存，新建后从下一轮起生效' : '保存后从下一轮起生效，当前轮按已生成快照跑' }}</div>
              <div class="edit-box drawer-box">
                <div class="er">
                  <label>名称</label><el-input v-model="form.name" size="small" placeholder="如：中班" style="width: 140px" />
                  <label>起</label><el-input v-model="form.start" size="small" placeholder="12:00" style="width: 80px" />
                  <label>止</label><el-input v-model="form.end" size="small" placeholder="16:00" style="width: 80px" />
                  <label>类别</label>
                  <el-select v-model="form.category" size="small" clearable
                    placeholder="不分类" style="width: 120px">
                    <el-option v-for="c in categoriesOf5(curSpace)" :key="c.id" :label="c.name" :value="c.id" />
                  </el-select>
                  <el-button link size="small" @click="openCatDlg">{{ categoriesOf5(curSpace).length ? '管理' : '建类别' }}</el-button>
                </div>
                <div class="er">
                  <label>星期</label>
                  <span class="day-picks">
                    <button v-for="(d, i) in DAY_NAMES" :key="i" :class="{ on: form.days.includes(i) }"
                      @click="toggleDay(i)">{{ d }}</button>
                  </span>
                </div>
                <div class="er">
                  <label>名额来源</label>
                  <el-radio-group v-model="form.quota.source" size="small">
                    <el-radio-button value="manual">人工给定</el-radio-button>
                    <el-radio-button value="service">挂算法服务</el-radio-button>
                  </el-radio-group>
                  <el-input-number v-if="form.quota.source === 'manual'" v-model="form.quota.value" :min="1" :max="6" size="small" />
                  <template v-else>
                    <el-select v-model="form.quota.serviceId" size="small" style="width: 170px" placeholder="选一个已登记的服务">
                      <el-option v-for="v in v5.services" :key="v.id" :label="v.name" :value="v.id" />
                    </el-select>
                    <span class="preview">{{ editing === 'new' ? '下一轮按算法给数' : `本轮快照 ${snapOf(editing)} 人` }}</span>
                  </template>
                </div>
                <div class="list-editor">
                  <div class="le-head">
                    <span>档位</span><span>谁</span><span>方式</span><span>开放窗口</span><span>上限<em class="le-quota">名额 {{ quotaN || '?' }}</em></span><span />
                  </div>
                  <div v-for="(r, i) in form.list" :key="i" class="le-row">
                    <span class="lr-k">{{ i + 1 }}</span>
                    <!-- 界面只显示组合结果；点开弹窗去设三个条件 -->
                    <button class="who-chip" type="button" @click="openWho(i)" title="点开设置这一档开放给谁">
                      <span class="who-chip-txt">{{ whoLabel5(r.who) }}</span>
                      <span class="who-chip-edit">改</span>
                    </button>
                    <el-select v-model="r.way" size="small" style="width: 104px">
                      <el-option label="直派轮转" value="direct" />
                      <el-option label="先到先得" value="grab" />
                      <el-option label="申领审核" value="apply" />
                    </el-select>
                    <!-- 开放窗口 = 锚点 + 偏移；配置选锚点，下面一行实时落成具体日期时间 -->
                    <div class="win-cell">
                      <div class="win-line">
                        <el-select :model-value="winKind(r)" size="small" style="width: 104px" @change="onWinKind(r, $event)">
                          <el-option label="发布即开" value="publish" />
                          <el-option label="发布后推" value="pubOff" />
                          <el-option label="发布后的周几" value="week" />
                          <el-option label="开班日前" value="date" />
                        </el-select>
                        <el-input-number v-if="winKind(r) === 'pubOff'" v-model="r.win.d" :min="0" :max="14" size="small" controls-position="right" style="width: 62px" />
                        <span v-if="winKind(r) === 'pubOff'" class="win-u">天</span>
                        <el-select v-if="winKind(r) === 'week'" v-model="r.win.dow" size="small" style="width: 74px">
                          <el-option v-for="(n, i) in DAY_NAMES" :key="i" :label="'周' + n" :value="i" />
                        </el-select>
                        <el-input-number v-if="winKind(r) === 'date'" v-model="r.win.d" :min="-7" :max="0" size="small" controls-position="right" style="width: 62px" />
                        <span v-if="winKind(r) === 'date'" class="win-u">天前</span>
                        <el-time-select v-if="winKind(r) !== 'publish'" v-model="r.win.t" size="small" style="width: 92px" start="00:00" step="00:30" end="23:30" placeholder="时刻" />
                      </div>
                      <div class="win-preview">{{ winPreview(r) }}</div>
                    </div>
                    <el-input-number v-model="r.cap" :min="1" :max="quotaN || 99" size="small" controls-position="right"
                      style="width: 88px" placeholder="不限" />
                    <button class="del" @click="form.list.splice(i, 1)">移除</button>
                  </div>
                  <button class="add-row" @click="form.list.push({ who: { tag: 'regular', scope: 'store', kind: 'all', pos: 'all' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } })">+ 加一档</button>
                  <div class="le-ways">
                    <div class="way-row"><span class="way-name">直派轮转</span><span class="way-desc">系统把这一档的人群<em>按轮换次序轮流排</em>（这次你、下次他），到这一档窗口开放时执行。没有申领入口，人只收通知。</span></div>
                    <div class="way-row"><span class="way-name">先到先得</span><span class="way-desc">窗口一开自己点，点了就成，位满即关；成不了当场说原因。</span></div>
                    <div class="way-row"><span class="way-name">申领审核</span><span class="way-desc">窗口内提交申领，截止后按综合分排序截断，人事不逐单审批。</span></div>
                  </div>
                  <div class="le-note">上限 = 这一档最多占掉多少个名额（不能超过名额 {{ quotaN || '?' }}）；留空 = 不封顶，能吃满全部名额。这一档吃剩的名额留给下一档。</div>
                </div>

                <div v-if="formErrs.length" class="form-errs">
                  <strong>还有 {{ formErrs.length }} 处要改：</strong>
                  <span v-for="(e, i) in formErrs" :key="i">{{ e }}</span>
                </div>

                <div class="ea">
                  <el-button size="small" @click="editing = null">取消</el-button>
                  <el-button size="small" type="primary" @click="save">{{ editing === 'new' ? '新建' : '保存' }}</el-button>
                </div>
              </div>
            </el-drawer>

            <template v-if="cycView === 'list'">
            <article v-for="s in spaceSlots" :key="s.id" class="slot-card" :class="{ 'being-edited': editing === s.id }">
              <header>
                <div class="sn">
                  <strong>{{ s.name }}</strong>
                  <span class="time">{{ s.start }}–{{ s.end }}</span>
                  <span class="days">{{ daysLabel(s.days) }}</span>
                  <span v-if="s.category" class="cat-tag">{{ catName5(curSpace, s.category) }}</span>
                  <span v-if="s.start < curSpace.bizStart || s.end > curSpace.bizEnd" class="out-tag">
                    含{{ curSpace.tag === '办公区' ? '作业' : '营业' }}时段外
                  </span>
                  <span v-if="s.start < curSpace.bizStart || s.end > curSpace.bizEnd" class="out-tag">
                    含{{ curSpace.tag === '办公区' ? '作业' : '营业' }}时段外
                  </span>
                </div>
                <div class="sacts">
                  <span class="quota-tag">{{ quotaLabel(s) }}</span>
                  <el-button link size="small" @click="openEdit(s)">编辑</el-button>
                  <el-button link size="small" @click="doCopy(s)">复制</el-button>
                  <el-button link size="small" type="danger" @click="doRemove(s)">删除</el-button>
                </div>
              </header>

              <div class="list-rows">
                <div v-for="r in s.list" :key="r.k" class="lr">
                  <span class="lr-k">{{ r.k }}</span>
                  <span class="lr-who">{{ whoLabel5(r.who) }}</span>
                  <span class="lr-way" :class="'way-' + r.way">{{ wayLabel(r.way) }}</span>
                  <span class="lr-win">{{ windowLabel5(r, s) }}</span>
                  <span class="lr-cap">{{ r.cap ? `上限 ${r.cap} 个名额` : '不封顶' }}</span>
                </div>
              </div>

              <!-- 这一轮每天的名额：人事最常做的微调——只改这一天，不动模板 -->
              <div class="day-quota">
                <span class="dq-title">这一轮每天 <em>只改这一天，不动模板，也不进下一轮</em></span>
                <div class="dq-days">
                  <template v-for="d in roundDates" :key="d">
                    <span v-if="onDay(s, d)" class="dq-day" :class="{ full: occupied(s.id, d) >= dayCap(s.id, d) }">
                      <em>{{ d.slice(5) }}</em>
                      <b>{{ occupied(s.id, d) }}/{{ dayCap(s.id, d) }}</b>
                      <button class="dq-btn" @click="bumpDay(s, d, 1)">＋</button>
                      <button class="dq-btn" :disabled="dayCap(s.id, d) <= occupied(s.id, d)" @click="bumpDay(s, d, -1)">－</button>
                    </span>
                  </template>
                </div>
              </div>

            </article>

            <div v-if="!spaceSlots.length && !editing" class="empty">
              <p>这个空间还没有周期时段</p>
              <el-button size="small" type="primary" @click="openNew">配第一个班次</el-button>
            </div>
            </template>

            <!-- 按周期：先配好一天，复制/覆盖到其他天；点班次照常进编辑 -->
            <template v-else>
              <div class="cyc-strip">
                <strong>下一轮铺 {{ short(round.nextSpan[0]) }}–{{ short(round.nextSpan[1]) }}</strong>
                <span>先配好一天，再把这一天复制 / 覆盖到其他天。班次按星期几定义，复制会落在每周的同一天。</span>
              </div>
              <div class="cyc-days">
                <div v-for="d in cycleDays" :key="d.date" class="cyc-day" :class="{ none: !d.slots.length }">
                  <div class="cd-head">
                    <strong>{{ short(d.date) }}<em>周{{ DAY_NAMES[d.dow] }}</em></strong>
                    <button class="cd-copy" @click="openDayCopy(d.dow)">复制到…</button>
                  </div>
                  <div class="cd-slots">
                    <button v-for="s in d.slots" :key="s.id" class="cd-slot" @click="openEdit(s)">
                      <strong>{{ s.name }}</strong>
                      <span>{{ s.start }}–{{ s.end }}</span>
                      <em>{{ quotaLabel(s) }}</em>
                    </button>
                    <span v-if="!d.slots.length" class="cd-none">这天没有班次</span>
                  </div>
                </div>
              </div>
              <div v-if="!spaceSlots.length && !editing" class="empty">
                <p>这个空间还没有周期时段</p>
                <el-button size="small" type="primary" @click="openNew">配第一个班次</el-button>
              </div>
            </template>
          </template>

          <template v-else-if="sub === 'tmp'">
            <div class="hint-line">临时班次 = 特殊情况下的新增名额：只改那一天的容量，不进周期安排，保存即进当前窗口。</div>
            <div class="temp-list">
              <article v-for="t in spaceTemps" :key="t.id" class="temp-card">
                <div class="tc-l">
                  <strong>{{ t.name }}</strong>
                  <span class="time">{{ t.date }} · {{ t.start }}–{{ t.end }}</span>
                  <!-- 名额分配结果：这几个人最后得到了 -->
                  <span class="tc-got">
                    名额 {{ t.snapN }} ·
                    <template v-if="occupantsOf(t.id, t.date).length">
                      已定
                      <em v-for="o in occupantsOf(t.id, t.date)" :key="o.id" class="tc-who">{{ o.id }} {{ o.name }}</em>
                    </template>
                    <template v-else>还没定人</template>
                    <span v-if="occupied(t.id, t.date) < t.snapN" class="tc-gap">还缺 {{ t.snapN - occupied(t.id, t.date) }}</span>
                  </span>
                </div>
                <div class="tc-r">
                  <span class="tc-occ">{{ occupied(t.id, t.date) }}/{{ t.snapN }}</span>
                  <el-button v-if="occupied(t.id, t.date) < t.snapN && !runReadonly" link size="small" @click="goDefinePeople(t.date)">去结果里定人 →</el-button>
                  <el-button link size="small" type="danger" @click="removeTemp(t.id)">删除</el-button>
                </div>
              </article>
              <div v-if="!spaceTemps.length" class="empty">还没有临时班次</div>
            </div>

            <el-button size="small" type="primary" @click="openTempDrawer">+ 新增临时班次</el-button>

            <el-drawer :model-value="tempDrawer" size="560px" title="新增临时班次"
              @update:model-value="v => { if (!v) tempDrawer = false }">
              <div class="drawer-tag">保存即进当前窗口。这里只定「这一天要几个人」，谁来做在「轮与结果」里定。</div>
              <div class="edit-box drawer-box">
                <div class="er">
                  <label>日期</label><el-input v-model="tempForm.date" size="small" style="width: 130px" />
                  <label>名称</label><el-input v-model="tempForm.name" size="small" placeholder="如：周六晚加场" style="width: 200px" />
                </div>
                <div class="er">
                  <label>起止</label>
                  <el-input v-model="tempForm.start" size="small" style="width: 80px" />
                  <span class="dash">–</span>
                  <el-input v-model="tempForm.end" size="small" style="width: 80px" />
                  <label>名额</label>
                  <el-input-number v-model="tempForm.value" :min="1" :max="6" size="small" controls-position="right" style="width: 96px" />
                </div>
                <div class="ea">
                  <el-button size="small" @click="tempDrawer = false">取消</el-button>
                  <el-button size="small" type="primary" @click="saveTemp">保存并开放</el-button>
                </div>
              </div>
            </el-drawer>
          </template>

          <!-- 申领规则：挂人群，不挂时段。空规则放行；类下任一条都算数 -->
          <template v-else>
            <ul class="hint-list">
              <li>规则挂「人群」，不挂时段</li>
              <li>一条规则 = 管谁 + 管哪一类（或全部）+ 计量（条数 / 分钟）+ 下限和上限</li>
              <li>两项计量都按这一天合计，不跨天累加</li>
              <li>没配规则的人直接放行；类下任一条都算数（名额满了可换同类的另一条）</li>
              <li>改了立即用于试算，正式生效下一轮</li>
            </ul>

            <!-- 类别是空间的字典：规则按类管，类下任一条都算数 -->
            <div class="cat-row">
              <span class="cr-label">空间类别</span>
              <span v-for="c in categoriesOf5(curSpace)" :key="c.id" class="cat-pill">{{ c.name }}</span>
              <span v-if="!categoriesOf5(curSpace).length" class="lc-none">还没设类别：规则只能管「全部时段」</span>
              <el-button link size="small" @click="openCatDlg">管理类别</el-button>
            </div>

            <div class="rule-list">
              <article v-for="r in spaceRules" :key="r.id" class="rule-card">
                <div class="rc-main">
                  <strong>{{ r.name }}</strong>
                  <span class="rc-who">{{ whoLabel5(r.who) }}</span>
                  <span class="rc-scope">{{ r.scope.type === 'all' ? '全部时段' : (catName5(curSpace, r.scope.id) || r.scope.id) }}</span>
                  <span class="rc-need">{{ ruleNeedText(r) }}</span>
                </div>
                <div class="rc-acts">
                  <el-button link size="small" @click="openRule(r)">编辑</el-button>
                  <el-button link size="small" type="danger" @click="doRemoveRule(r)">删除</el-button>
                </div>
              </article>
              <div v-if="!spaceRules.length" class="empty">
                <p>这个空间没有申领规则：所有人不受选择约束，直接放行</p>
              </div>
              <el-button size="small" type="primary" @click="openRule(null)">+ 新增规则</el-button>
              <el-button v-if="isDev" size="small" @click="devAdvanceRound">发布下一轮（演示）</el-button>
            </div>

            <el-drawer :model-value="ruleEditing" size="520px"
              :title="ruleForm.id ? '编辑规则' : '新增规则'"
              @update:model-value="v => { if (!v) ruleEditing = false }">
              <div class="drawer-tag">改了立即用于试算，正式生效下一轮</div>
              <div class="edit-box drawer-box">
                <div class="er">
                  <label>名称</label>
                  <el-input v-model="ruleForm.name" size="small" placeholder="如：非全推拿 · A 类每天至少 1" style="width: 260px" />
                </div>
                <div class="er">
                  <label>管谁</label>
                  <button class="who-chip" type="button" @click="openWhoFor(ruleForm)" title="点开设置这条规则管哪些人">
                    <span class="who-chip-txt">{{ whoLabel5(ruleForm.who) }}</span>
                    <span class="who-chip-edit">改</span>
                  </button>
                </div>
                <div class="er">
                  <label>管哪类</label>
                  <el-select v-model="ruleForm.scopeType" size="small" style="width: 140px">
                    <el-option label="全部时段" value="all" />
                    <el-option v-for="c in categoriesOf5(curSpace)" :key="c.id" :label="c.name" :value="c.id" />
                  </el-select>
                  <span v-if="!categoriesOf5(curSpace).length" class="form-hint">这个空间还没设类别，只能管全部时段</span>
                </div>
                <div class="er">
                  <label>计量</label>
                  <el-radio-group v-model="ruleForm.unit" size="small">
                    <el-radio-button value="count">条数</el-radio-button>
                    <el-radio-button value="minute">分钟</el-radio-button>
                  </el-radio-group>
                  <label>下限</label>
                  <el-input-number v-model="ruleForm.min" :min="0" :max="1440" size="small" controls-position="right" style="width: 96px" />
                  <label>上限</label>
                  <el-input-number v-model="ruleForm.max" :min="0" :max="1440" size="small" controls-position="right" style="width: 96px" />
                  <span class="form-hint">上限留空或 0 = 不封顶；条数和分钟都按这一天合计，不跨天累加</span>
                </div>
                <div v-if="ruleErr" class="rule-err">{{ ruleErr }}</div>
                <div class="er">
                  <el-button size="small" @click="ruleEditing = false">取消</el-button>
                  <el-button size="small" type="primary" @click="saveRule">保存</el-button>
                </div>
              </div>
            </el-drawer>

            <div class="limit-card">
              <strong>非全工时额度</strong>
              <span class="lc-note">按门店各算一套，只控周和月；日的要求在上面规则里配</span>
              <template v-if="limitEditing">
                <span class="lc-line">
                  本周 <el-input-number v-model="limitForm.week" :min="0" :max="80" size="small" controls-position="right" style="width: 90px" /> 小时
                  · 本月 <el-input-number v-model="limitForm.month" :min="0" :max="400" size="small" controls-position="right" style="width: 90px" /> 小时
                </span>
                <el-button size="small" type="primary" @click="applyLimits">保存</el-button>
                <el-button size="small" @click="limitEditing = false">取消</el-button>
              </template>
              <template v-else>
                <span class="lc-line">
                  <template v-if="curLimit">本周 {{ curLimit.week }} 小时 · 本月 {{ curLimit.month }} 小时</template>
                  <template v-else><em class="lc-none">这家店还没配额度：非全不受周/月限制</em></template>
                </span>
                <el-button link size="small" @click="openLimitEdit">编辑</el-button>
              </template>
            </div>

            <div class="trial-card">
              <strong>试算</strong>
              <span class="lc-note">按「这个人这天最终占到的班」判，不是按勾了什么</span>
              <el-select v-model="trialPerson" size="small" filterable style="width: 140px">
                <el-option v-for="p in curSpacePeople" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
              <el-date-picker v-model="trialDate" type="date" size="small" value-format="YYYY-MM-DD" style="width: 140px" />
              <div v-if="trial" class="trial-body">
                <div v-if="!trial.hasRule" class="trial-line muted">这个人没命中任何规则：直接放行</div>
                <div v-for="i in trial.items" :key="i.id" class="trial-line" :class="{ bad: !i.ok }">
                  <span class="tl-dot" />{{ i.name }}：{{ i.actual }}，要求 {{ i.need }}{{ i.ok ? '（满足）' : '（差）' }}
                </div>
                <div v-for="l in trial.limits" :key="l.name" class="trial-line" :class="{ bad: !l.ok }">
                  <span class="tl-dot" />{{ l.name }}：{{ l.used }} / {{ l.cap }} 小时{{ l.ok ? '' : '（超了）' }}
                </div>
              </div>
            </div>
          </template>
        </section>

        <!-- ② 获取段：轮与结果 -->
        <section v-else-if="tab === 'run'" class="pane">
          <!-- 轮次：已经生成的轮都在这里，切着看；没到发布时刻的下一轮只给预告 -->
          <div class="run-bar">
            <div class="rb-tabs">
              <button v-for="r in roundList(selSpace)" :key="r.id" :class="{ on: shownRound && shownRound.id === r.id }" @click="pickRound(r.id)">
                <strong>{{ short(r.span[0]) }}–{{ short(r.span[1]) }}</strong>
                <em :class="['rb-badge', r.status]">{{ roundStatusLabel(r.status) }}</em>
              </button>
            </div>
            <span class="rb-note">{{ runNote }}</span>
            <span v-if="nextPub" class="rb-next">下一轮 {{ shortAt(nextPub.at) }} 生成 · 铺 {{ short(nextPub.span[0]) }}–{{ short(nextPub.span[1]) }}</span>
          </div>

          <div class="run-switch">
            <button :class="{ on: runView === 'grid' }" @click="runView = 'grid'">占用矩阵</button>
            <button :class="{ on: runView === 'axis' }" @click="runView = 'axis'">空间时间轴</button>
            <span class="rs-hint">{{ runView === 'grid' ? '格子里是当前占位的人；点空格直接定人' : '这一天每个时段上是谁、几点到几点；空格缺口点开就是定人' }}</span>
          </div>

          <template v-if="runView === 'grid'">
          <div class="occ-wrap">
            <div class="occ-head" :style="{ gridTemplateColumns: occCols }">
              <span class="occ-corner">时段</span>
              <span v-for="d in runDates" :key="d" class="occ-day">{{ d.slice(5) }}</span>
            </div>
            <div v-for="s in runSlots" :key="s.id" class="occ-row" :style="{ gridTemplateColumns: occCols }">
              <div class="occ-name">
                <strong>{{ s.name }}<em v-if="s.tmp" class="tmp-tag">临时</em></strong>
                <em>{{ s.start }}–{{ s.end }} · 名额 {{ s.snapN }}</em>
              </div>
              <div v-for="d in runDates" :key="d" class="occ-cell"
                :class="{ off: !onDay(s, d), gap: onDay(s, d) && occupied(s.id, d) < s.snapN, pointable: onDay(s, d) && occupied(s.id, d) < s.snapN && !runReadonly }"
                @click="onDay(s, d) && occupied(s.id, d) < s.snapN && !runReadonly && openGap(s, d)">
                <template v-if="onDay(s, d)">
                  <span class="oc-count">{{ occupied(s.id, d) }}/{{ s.snapN }}</span>
                  <span class="oc-names">{{ occupyNames(s.id, d) }}</span>
                  <span v-if="occupied(s.id, d) < s.snapN && !runReadonly" class="oc-fill">定人</span>
                </template>
              </div>
            </div>
          </div>
          </template>

          <!-- 空间时间轴：这一天所有时段（周期 + 临时）画在钟点上，行内是占位的人 -->
          <template v-else>
            <div class="ax-days">
              <button v-for="d in runDates" :key="d" :class="{ on: axisDay === d }" @click="axisDay = d">
                {{ d.slice(5) }}<em>周{{ DAY_NAMES[new Date(d + 'T00:00:00').getDay()] }}</em>
              </button>
            </div>
            <div class="ax-box">
              <div class="ax-row ax-head">
                <div class="ax-label" />
                <div class="ax-track">
                  <b v-for="t in axTicks" :key="t" class="ax-tick-label" :style="{ left: axPct(t) + '%' }">{{ String(Math.floor(t / 60)).padStart(2, '0') }}:00</b>
                </div>
              </div>
              <div v-for="s in axSlots" :key="s.id" class="ax-row">
                <div class="ax-label">
                  <strong>{{ s.name }}</strong>
                  <span>{{ s.start }}–{{ s.end }}</span>
                  <em :class="['ax-src', s.tmp ? 'tmp' : 'cyc']">{{ s.tmp ? '临时' : '周期' }}</em>
                </div>
                <div class="ax-track">
                  <i v-for="t in axTicks" :key="'g' + t" class="ax-grid" :style="{ left: axPct(t) + '%' }" />
                  <div :class="['ax-band', s.tmp ? 'tmp' : 'cyc']" :style="{ left: axPct(toMin(s.start)) + '%', width: (axPct(toMin(s.end)) - axPct(toMin(s.start))) + '%' }">
                    <span v-for="p in occupantsOf(s.id, axisDay)" :key="p.id" class="ax-person">{{ p.id }} {{ p.name }}</span>
                    <span v-if="axisGap(s) > 0" :class="['ax-gap', { pointable: !runReadonly }]" @click="!runReadonly && openGap(s, axisDay)">还缺 {{ axisGap(s) }} 人 · 定人</span>
                  </div>
                </div>
              </div>
              <div v-if="!axSlots.length" class="ax-empty">这一天没有时段</div>
            </div>
          </template>

          <div class="table-title">申领登记 <em>提交只登记；{{ shortAt(round.applyDeadline) }} 截止后按综合分排序截断，人事不逐单审批</em></div>
          <table class="data-table">
            <thead>
              <tr><th style="width: 90px;">日期</th><th style="width: 150px;">时段</th><th style="width: 90px;">人</th><th style="width: 80px;">综合分</th><th style="width: 110px;">登记时间</th><th>截止后会怎样</th></tr>
            </thead>
            <tbody>
              <tr v-for="a in applies" :key="a.id">
                <td>{{ a.date.slice(5) }}</td>
                <td>{{ a.slotName }} {{ a.start }}–{{ a.end }}</td>
                <td>{{ a.person }}</td>
                <td class="mono">{{ a.score }}</td>
                <td class="mono">{{ a.at.slice(5) }}</td>
                <td>
                  <span v-if="a.wouldPick" class="st-on">排上 · 第 {{ a.order }} 位（名额 {{ a.sn }}）</span>
                  <span v-else class="st-off">落选 · 可等下一轮再申领</span>
                </td>
              </tr>
              <tr v-if="!applies.length"><td colspan="6" class="empty-cell">这个空间这一轮没有申领登记</td></tr>
            </tbody>
          </table>

          <div class="table-title">排班结果表 <em>唯一记录口：谁在上面、怎么排上的、被哪条事实动过</em></div>
          <table class="data-table">
            <thead>
              <tr><th style="width: 100px;">日期</th><th style="width: 150px;">时段</th><th style="width: 90px;">人</th><th>怎么排上的</th><th style="width: 170px;">来路（事实）</th><th style="width: 100px;">状态</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in rows" :key="r.id" :class="{ covered: r.status === 'covered', pointable: !!r.factId }" @click="r.factId && jumpFact(r.factId)">
                <td>{{ r.date.slice(5) }}</td>
                <td>{{ r.slotName }} {{ r.start }}–{{ r.end }}<em v-if="r.isTmp" class="tmp-tag">临时</em></td>
                <td><span class="p-code">{{ r.personCode }}</span>{{ r.person }}<em v-if="r.duty" class="duty-note">→ {{ r.duty }} 履约</em></td>
                <td>{{ r.way }}</td>
                <td>
                  <span v-if="r.factId" class="fact-link">{{ r.factId }} · {{ r.factType }}</span>
                  <span v-else class="muted">—</span>
                </td>
                <td>
                  <span v-if="r.status === 'active'" class="st-on">生效</span>
                  <span v-else class="st-off">时间被占用</span>
                </td>
              </tr>
            </tbody>
          </table>
          <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
        </section>

        <!-- ③ 变化段：事实与记录 -->
        <section v-else class="pane">
          <div class="fact-acts">
            <span class="fa-hint">变化只走事实：写一条，重算一次，留一个解版本。一条事实有两个时间——<b>发生时间</b>（谁在什么时候报的）和<b>影响的班次</b>（哪一天哪一班）。</span>
            <el-button size="small" @click="openAppoint()">定人</el-button>
            <span class="fa-note">离职不在这里登记：由离职流程模块写入事实，排班只承接结果</span>
          </div>

          <!-- 个人时间线：横轴是这个人当天的时间，纵向是班次条/事实条/补位条——请假可能只占一小时 -->
          <div class="tl-box">
            <div class="tl-head">
              <strong>个人时间线</strong>
              <span>横轴是这个人当天的时间，往下看这段时间怎么被占住又被占据：班次条、事实条（请假可能只占一小时）、补位条；班次记录本身不动。</span>
              <el-select :model-value="tlPid" size="small" style="width: 130px" @change="tlPidRaw = $event; tlDayRaw = ''">
                <el-option v-for="p in tlPeople" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
              <el-select :model-value="tlDay" size="small" style="width: 128px" @change="tlDayRaw = $event">
                <el-option v-for="d in tlDayOpts" :key="d" :label="`${d.slice(5)} 周${DAY_NAMES[new Date(d + 'T00:00:00').getDay()]}`" :value="d" />
              </el-select>
            </div>
            <template v-if="tlDay">
              <div class="tl-row tl-axis-row">
                <div class="tl-rowlabel" />
                <div class="tl-track">
                  <b v-for="h in tlAxis.labels" :key="h" class="tl-ticklabel" :style="{ left: tlPct(h) }">{{ String(Math.floor(h / 60)).padStart(2, '0') }}:00</b>
                </div>
              </div>
              <div v-for="row in tlBands" :key="row.label" class="tl-row">
                <div class="tl-rowlabel">{{ row.label }}</div>
                <div class="tl-track">
                  <i v-for="h in tlAxis.ticks" :key="h" class="tl-tick" :style="{ left: tlPct(h) }" />
                  <div v-for="b in row.bands" :key="b.text + b.s" class="tl-band" :class="b.cls" :style="{ left: tlPct(b.s), width: tlW(b) }">
                    <i v-for="(m, i) in b.marks || []" :key="'m' + i" class="tl-occ" :style="{ left: ((m.s - b.s) / (b.e - b.s) * 100) + '%', width: ((m.e - m.s) / (b.e - b.s) * 100) + '%' }" />
                    <strong>{{ b.text }}</strong>
                    <span v-if="b.sub">{{ b.sub }}</span>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="tl-empty">这个人这一轮还没有班，也没有事实</div>
            <div v-if="tlRelated.length" class="tl-rel">
              相关的人：
              <button v-for="r in tlRelated" :key="r.id" @click="tlPidRaw = r.id">{{ r.name }}</button>
            </div>
          </div>

          <!-- 待人事处理：求值没人顶时发给人事的待办，顶上后自动销掉 -->
          <div v-if="hrTodos.length" class="hr-todo">
            <strong>待人事处理（{{ hrTodos.length }}）</strong>
            <div v-for="n in hrTodos" :key="n.id" class="hrt-row">
              <span class="hrt-text">{{ n.text }}<em>{{ n.detail }}</em></span>
              <el-button size="small" type="primary" @click="openGapFromNotice(n)">处理：定人</el-button>
              <el-button size="small" @click="ackNotice(n.id)">先不管</el-button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr><th style="width: 120px;">发生时间</th><th style="width: 90px;">类型</th><th style="width: 76px;">谁</th><th style="width: 190px;">影响的班次</th><th>结果</th><th style="width: 70px;">留痕</th></tr>
            </thead>
            <tbody>
              <template v-for="f in facts" :key="f.id">
                <tr :class="{ hl: hlFact === f.id }">
                  <td class="mono">{{ f.at.slice(5) }}</td>
                  <td><span class="ftype">{{ f.type }}</span></td>
                  <td>{{ f.person }}</td>
                  <td>
                    <span v-if="f.slotName">{{ f.date?.slice(5) }} {{ f.slotName }} <span class="muted">{{ f.slotTime }}</span></span>
                    <span v-else class="muted">不指向具体班次</span>
                  </td>
                  <td>{{ f.result }}</td>
                  <td><el-button link size="small" @click="openFact = openFact === f.id ? '' : f.id">展开</el-button></td>
                </tr>
                <tr v-if="openFact === f.id" class="trace-row">
                  <td colspan="6">
                    <div class="trace">
                      <span class="tr-title">这一条事实带动的班次：</span>
                      <span v-for="pid in f.placements" :key="pid" class="tr-item">
                        {{ traceLine(pid) }}
                      </span>
                      <span v-if="!f.placements?.length" class="tr-item muted">无（不找人顶）</span>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

          <div class="ver-title">解版本</div>
          <div class="vers">
            <div v-for="x in v5.versions" :key="x.v" class="ver">
              <span class="v-no">v{{ x.v }}</span>
              <span class="v-at">{{ x.at.slice(5) }}</span>
              <span class="v-note">{{ x.note }}</span>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- ② 系统服务：算法服务登记在这里，不跟某个空间走 -->
    <section v-show="mainTab === 'svc'" class="svc-pane">
      <div class="svc-head">
        <p>算法服务是公共的：登记的是「读什么数、怎么算、版本号」。登记完，各空间的时段在名额来源里就能挂它；一项服务可以被多个时段、多个空间同时引用。</p>
        <el-button size="small" type="primary" @click="svcDlg = true">登记一项</el-button>
      </div>
      <table class="data-table">
        <thead><tr><th style="width: 140px;">服务</th><th style="width: 170px;">读什么数</th><th>怎么算</th><th style="width: 80px;">版本</th><th style="width: 150px;">被引用</th></tr></thead>
        <tbody>
          <tr v-for="v in v5.services" :key="v.id">
            <td><strong>{{ v.name }}</strong></td>
            <td>{{ v.input }}</td>
            <td>{{ v.calc }}</td>
            <td class="mono">{{ v.version }}</td>
            <td>{{ serviceUsage(v.id) ? `挂在 ${serviceUsage(v.id)} 个时段上` : '还没被引用' }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 把这一天复制到其他天：覆盖式，先看加减预览再确认 -->
    <el-dialog v-model="copyDlg" title="把这一天复制到…" width="580px">
      <div class="cp-src">源天：每周周{{ DAY_NAMES[copySrcDow] }} · 覆盖式——目标天会变得和源天一样</div>
      <div class="cp-targets">
        <el-checkbox-group v-model="copyTargets">
          <el-checkbox v-for="d in copyDowOptions" :key="d.dow" :value="d.dow" class="cp-t">每周周{{ DAY_NAMES[d.dow] }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <div v-if="copyTargets.length" class="cp-plan">
        <div class="cp-line add" v-if="copyPlan.adds.length">将加上：{{ copyPlan.adds.map(a => `${a.name} → 周${DAY_NAMES[a.dow]}`).join('、') }}</div>
        <div class="cp-line" v-else>没有要新增的班次</div>
        <div class="cp-line rm" v-if="copyPlan.removes.length">将移出：{{ copyPlan.removes.map(a => `${a.name} → 周${DAY_NAMES[a.dow]}`).join('、') }}</div>
        <div class="cp-line" v-else>没有会被移出的班次</div>
      </div>
      <template #footer>
        <el-button size="small" @click="copyDlg = false">取消</el-button>
        <el-button size="small" type="primary" @click="doDayCopy">覆盖应用</el-button>
      </template>
    </el-dialog>

    <!-- 算法服务登记 -->
    <el-dialog v-model="svcDlg" title="算法服务登记" width="660px">
      <div class="svc-note">算法只登记不实现：登记的是「读什么数、怎么算、版本号」。供数统一到时段级，A 时段挂算法一、B 时段挂算法二是合法配置。</div>
      <table class="data-table">
        <thead><tr><th style="width: 130px;">服务</th><th style="width: 150px;">读什么数</th><th>怎么算</th><th style="width: 70px;">版本</th></tr></thead>
        <tbody>
          <tr v-for="v in v5.services" :key="v.id">
            <td><strong>{{ v.name }}</strong></td>
            <td>{{ v.input }}</td>
            <td>{{ v.calc }}</td>
            <td class="mono">{{ v.version }}</td>
          </tr>
        </tbody>
      </table>

      <div class="svc-form">
        <div class="sf-title">登记一项新服务 <em>四项都要填：读什么数、怎么算、能单独调、有版本号</em></div>
        <div class="sf-grid">
          <label>服务名称</label>
          <el-input v-model="svcForm.name" size="small" placeholder="如：按预约量" style="width: 190px" />
          <label>读什么数</label>
          <el-input v-model="svcForm.input" size="small" placeholder="如：业务系统预约量" style="width: 190px" />
          <label>版本号</label>
          <el-input v-model="svcForm.version" size="small" placeholder="如：v1.0" style="width: 110px" />
        </div>
        <div class="sf-row">
          <label>怎么算</label>
          <el-input v-model="svcForm.calc" size="small" placeholder="用业务话写清算式，如：每 6 单 1 人，最少 1" />
        </div>
        <div class="sf-row">
          <el-checkbox v-model="svcForm.idempotent">可以单独调用，同样的输入给同样的结果</el-checkbox>
        </div>
        <div v-if="svcErrs.length" class="form-errs">
          <span v-for="(e, i) in svcErrs" :key="i">{{ e }}</span>
        </div>
      </div>

      <template #footer>
        <el-button size="small" @click="svcDlg = false">关闭</el-button>
        <el-button size="small" type="primary" @click="doAddService">登记一项</el-button>
      </template>
    </el-dialog>

    <!-- 这一档开放给谁：三个条件单独设置，界面只显示组合结果 -->
    <el-dialog v-model="whoDlg" :title="whoTitle" width="440px">
      <div class="wr">
        <label>范围</label>
        <el-radio-group v-model="whoEdit.scope" size="small">
          <el-radio-button value="store">本店</el-radio-button>
          <el-radio-button value="radius">附近</el-radio-button>
        </el-radio-group>
        <template v-if="whoEdit.scope === 'radius'">
          <el-input-number v-model="whoEdit.km" :min="1" :max="20" size="small" controls-position="right" style="width: 90px" />
          <span class="wr-unit">公里</span>
        </template>
      </div>
      <div class="wr">
        <label>合作性质</label>
        <el-radio-group v-model="whoEdit.kind" size="small">
          <el-radio-button value="all">不限</el-radio-button>
          <el-radio-button value="fulltime">全职</el-radio-button>
          <el-radio-button value="parttime">非全</el-radio-button>
        </el-radio-group>
      </div>
      <div class="wr">
        <label>人员标签</label>
        <el-radio-group v-model="whoEdit.tag" size="small">
          <el-radio-button value="all">不限</el-radio-button>
          <el-radio-button value="regular">在职</el-radio-button>
          <el-radio-button value="probation">试用</el-radio-button>
          <el-radio-button value="reserve">储备</el-radio-button>
        </el-radio-group>
      </div>
      <div class="wr">
        <label>岗位</label>
        <el-radio-group v-model="whoEdit.pos" size="small">
          <el-radio-button value="all">不限</el-radio-button>
          <el-radio-button v-for="j in JOBS5" :key="j" :value="j">{{ j }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="who-preview">这一档开放给：<strong>{{ whoLabel5(whoEdit) }}</strong></div>
      <template #footer>
        <el-button size="small" @click="whoDlg = false">取消</el-button>
        <el-button size="small" type="primary" @click="saveWho">确定</el-button>
      </template>
    </el-dialog>

    <!-- 管理类别：空间的字典，业务自己起名；删除要挡「还有班次 / 规则在用」 -->
    <el-dialog v-model="catDlg" title="管理类别" width="560px">
      <div class="cat-dlg-hint">类别只是把「同一句要求」套到一组班次上；类下任一条都算数，所以某条名额满了可以换同类的另一条。</div>
      <div v-for="c in categoriesOf5(curSpace)" :key="c.id" class="cat-dlg-row">
        <span class="cd-id">{{ c.id }}</span>
        <div class="cd-main">
          <el-input :model-value="c.name" size="small" @change="val => doRenameCat(c, val)" />
          <span class="cd-use">{{ catUseText(c.id) }}</span>
        </div>
        <el-button link size="small" type="danger" @click="doRemoveCat(c)">删除</el-button>
      </div>
      <div v-if="!categoriesOf5(curSpace).length" class="empty"><p>这家店还没有类别</p></div>
      <div class="cat-dlg-row add">
        <el-input v-model="newCatName" size="small" placeholder="新类别名字，如 C 类 / 高峰班" style="flex: 1" @keyup.enter="doAddCat" />
        <el-button size="small" type="primary" @click="doAddCat">添加</el-button>
      </div>
    </el-dialog>

    <!-- 定人：一次把空着的名额选够 -->
    <el-dialog v-model="appointDlg" title="定人" width="600px">
      <div v-if="gapInfo" class="gap-banner">
        <strong>{{ gapInfo.date.slice(5) }} {{ gapInfo.name }} {{ gapInfo.start }}–{{ gapInfo.end }}</strong>
        <em :class="['gb-src', gapInfo.tmp ? 'tmp' : 'cyc']">{{ gapInfo.tmp ? '临时班次' : '周期时段' }}</em>
        <span>名额 {{ gapInfo.n }}，已定 {{ gapInfo.occ }} 人，还缺 {{ gapInfo.n - gapInfo.occ }} 个</span>
      </div>
      <div v-if="gapInfo" class="gap-why">{{ gapWhy }}</div>
      <div class="dlg-row">
        <label>空位</label>
        <el-select v-model="appoint.gapKey" size="small" style="width: 380px" placeholder="先选一个有空位的时段">
          <el-option v-for="g in gaps" :key="g.slotId + g.date" :label="`${g.date.slice(5)} ${g.slot.name} ${g.slot.start}–${g.slot.end}（${g.occ}/${g.n}）`" :value="g.slotId + '|' + g.date" />
        </el-select>
      </div>
      <div class="dlg-row align-top">
        <label>定人</label>
        <div class="pb-list dlg-pick">
          <label v-for="p in appointCands" :key="p.id" :class="['pb-item', { on: appoint.personIds.includes(p.id), off: !appoint.personIds.includes(p.id) && appoint.personIds.length >= gapRemain }]">
            <input type="checkbox" :checked="appoint.personIds.includes(p.id)"
              :disabled="!appoint.personIds.includes(p.id) && appoint.personIds.length >= gapRemain"
              @change="toggleAppointPerson(p.id)" />
            <span class="pb-code">{{ p.id }}</span>
            <span class="pb-name">{{ p.name }}</span>
            <span class="pb-meta">{{ p.position }} · {{ p.kind === 'fulltime' ? '全职' : '非全' }} · {{ p.rowLabel }}</span>
          </label>
          <span v-if="!appointCands.length" class="pb-none">这个人这时候没班、时间不撞的人</span>
        </div>
      </div>
      <div class="dlg-hint">候选只列符合这一档、当时没班、时间不撞的人；一次最多选 {{ gapRemain }} 个（还缺几个名额就选几个）。</div>
      <div v-if="appoint.personIds.length" class="pb-sum">已选 {{ appoint.personIds.length }} / {{ gapRemain }} 人：{{ appoint.personIds.map(id => `${id} ${personById(v5, id)?.name}`).join('、') }}</div>
      <template #footer>
        <el-button size="small" @click="appointDlg = false">取消</el-button>
        <el-button size="small" type="primary" @click="doAppoint">确认安排</el-button>
      </template>
    </el-dialog>

    <!-- 登记离职已移除：离职入口在离职流程模块，它写事实，排班只承接结果 -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import TablePagination from '../components/TablePagination.vue'
import { usePager } from '../composables/usePager.js'
import {
  v5, WEEK_DATES, saveSlotEdit, revertConfig, addTemp, removeTemp,
  addSlot, copySlot, removeSlot, addService, checkSlotForm, setRoundConfig, setDayQuota, dayCap,
  appointV5, resolveApplyDemo, gaps5, resultRows5, factRows5, applicationRows5, copyDay5, ackNotice,
  roundOf, rulesOfSpace, saveRule5, removeRule5, trialClaim, limitsOfSpace, setHourLimits, advanceRoundDemo,
  roundList, pickRound, viewRound, viewRoundDates, roundOfDate, nextPublish,
  addCategory5, renameCategory5, removeCategory5, categoryUsage
} from '../mock/scheduleV5Store.js'
import {
  slotById, personById, activeCount5, windowLabel5, normWin5, matchWho5, whoLabel5, personBusy5, slotsOn5, JOBS5, applyDeadlineOf,
  dayCopyPlan5, datesOfRound5, categoriesOf5, catName5, claimRulesOf5, dutyPersonId5, snapN5
} from '../mock/scheduleV5.js'

const route = useRoute()
const isDev = computed(() => route.query.dev === '1')
const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']
/* 人群：雇佣类型和岗位都写在人群里——时段本身不带岗位 */
/* 「谁」是三个条件组合（范围/合作性质/岗位），不是平铺清单 */
const tab = ref('def')
const sub = ref(['cyc', 'tmp', 'rule'].includes(route.query.sub) ? route.query.sub : 'cyc')
/* 一级导航：排班 / 系统服务（算法服务是公共资产） */
const mainTab = ref('schedule')
const kw = ref('')
const city = ref('')
const selSpace = ref(v5.spaces.some(s => s.id === (route.query.space || (route.query.sub === 'rule' ? 'S-205' : ''))) ? (route.query.space || (route.query.sub === 'rule' ? 'S-205' : '')) : v5.spaces[0].id)
/* 每个空间有自己的轮：门店按周发一轮，办公区按月发一期——页面上一律按选中空间显示 */
const round = computed(() => roundOf(v5, selSpace.value))
/* 这一轮铺到了哪些天：门店七天、办公区整月——矩阵和逐日名额都按它走 */
const roundDates = computed(() => datesOfRound5(round.value))
/* 结果层看的是选中的那一轮：默认落在「正在选班次」的那轮，可切到执行中 / 已结束 */
const shownRound = computed(() => viewRound(selSpace.value))
const runDates = computed(() => viewRoundDates(selSpace.value))
const runReadonly = computed(() => shownRound.value?.status === 'ended')
const occCols = computed(() => `150px repeat(${runDates.value.length}, minmax(78px, 1fr))`)
/* 状态就是「此刻落在这轮的哪一段」：申领窗口 / 等开始 / 正在上 / 过完了 */
function roundStatusLabel(st) {
  return st === 'applying' ? '申领中' : st === 'locked' ? '已截止 · 待开始' : st === 'running' ? '执行中' : st === 'ended' ? '已结束' : ''
}
/* 下一轮还没生成：只说什么时候发，不给假数据 */
const nextPub = computed(() => nextPublish(selSpace.value))

/* ===== 空间时间轴：这一天所有时段画在钟点上，行内是占位的人 ===== */
const runView = ref('grid')
const axisDay = ref('')
watch(() => [selSpace.value, shownRound.value?.id], () => {
  axisDay.value = runDates.value.includes(v5.today) ? v5.today : (runDates.value[0] || '')
}, { immediate: true })
const axSlots = computed(() => axisDay.value
  ? slotsOn5(v5, axisDay.value).filter(s => s.spaceId === selSpace.value).sort((a, b) => a.start.localeCompare(b.start))
  : [])
const axRange = computed(() => {
  let lo = toMin(curSpace.value.bizStart), hi = toMin(curSpace.value.bizEnd)
  axSlots.value.forEach(s => { lo = Math.min(lo, toMin(s.start)); hi = Math.max(hi, toMin(s.end)) })
  return [Math.floor(lo / 60) * 60, Math.ceil(hi / 60) * 60]
})
function axPct(min) {
  const [lo, hi] = axRange.value
  return Math.max(0, Math.min(100, (min - lo) / (hi - lo) * 100))
}
const axTicks = computed(() => { const [lo, hi] = axRange.value; const out = []; for (let m = lo; m <= hi; m += 60) out.push(m); return out })
function axisGap(s) { return Math.max(0, snapN5(v5, s.id, axisDay.value) - activeCount5(v5, s.id, axisDay.value)) }
const runNote = computed(() => {
  const r = shownRound.value
  if (!r) return ''
  if (r.status === 'applying') return `${shortAt(r.publishedAt)} 发布，${shortAt(r.applyDeadline)} 申领截止——现在正在选班次`
  if (r.status === 'locked') return `${shortAt(r.applyDeadline)} 已截止，${short(r.span[0])} 起执行；缺口现在就可以定人`
  if (r.status === 'running') return `${short(r.span[0])}–${short(r.span[1])} 这几天正在上；临时缺人点空格定人`
  return `${short(r.span[0])}–${short(r.span[1])} 已经过完，只能查看，不能再改人`
})

const cities = computed(() => [...new Set(v5.spaces.map(s => s.city))])
const filteredSpaces = computed(() => v5.spaces.filter(s => {
  const k = kw.value.trim()
  const hit = !k || s.name.includes(k) || s.city.includes(k) || (s.tag && s.tag.includes(k))
  return (!city.value || s.city === city.value) && hit
}))
const curSpace = computed(() => v5.spaces.find(s => s.id === selSpace.value))
const spaceSlots = computed(() => v5.slots.filter(s => s.spaceId === selSpace.value))
const spaceTemps = computed(() => v5.temps.filter(t => t.spaceId === selSpace.value))
const allSpaceSlots = computed(() => [...spaceSlots.value, ...spaceTemps.value.map(t => ({ ...t, tmp: true }))])
/* 结果层只列落在这一轮里的临时班次：别的轮次的临时班次不该出现 */
const runSlots = computed(() => [...spaceSlots.value, ...spaceTemps.value.filter(t => runDates.value.includes(t.date)).map(t => ({ ...t, tmp: true }))])
const curSpacePeople = computed(() => v5.people.filter(p => p.spaceId === selSpace.value))

function pickSpace(id) { selSpace.value = id; editing.value = null; syncRhythm(); syncLimits(); initTrial() }

/* 时间展示：日期只到日，时刻带上时分 */
function short(d) { return `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}` }
function shortAt(at) { return `${Number(at.slice(5, 7))}/${Number(at.slice(8, 10))} ${at.slice(11, 16)}` }
function slotCount(id) { return v5.slots.filter(s => s.spaceId === id).length + v5.temps.filter(t => t.spaceId === id).length }
function peopleOf(id) { return v5.people.filter(p => p.spaceId === id).length }
/* 按周期视图：下一轮覆盖区间，每天列出当天会跑的班次（周期班次按星期几 + 临时班次按日期） */
const cycView = ref('cycle') /* 默认按周期：配置人员按天干活 */
const cycleDays = computed(() => {
  const [a, b] = round.value.nextSpan
  const out = []
  const pad = n => String(n).padStart(2, '0')
  const d = new Date(`${a}T00:00:00`)
  const end = new Date(`${b}T00:00:00`)
  while (d <= end) {
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    out.push({ date, dow: d.getDay(), slots: slotsOn5(v5, date).filter(sl => sl.spaceId === selSpace.value) })
    d.setDate(d.getDate() + 1)
  }
  return out
})

/* 天级复制/覆盖 */
const copyDlg = ref(false)
const copySrcDow = ref(1)
const copyTargets = ref([])
const copyDowOptions = computed(() => {
  const seen = new Map()
  for (const d of cycleDays.value) if (!seen.has(d.dow)) seen.set(d.dow, d.dow)
  return [...seen].filter(([dow]) => dow !== copySrcDow.value).map(([dow]) => ({ dow }))
})
const copyPlan = computed(() => dayCopyPlan5(v5.slots, copySrcDow.value, copyTargets.value))
function openDayCopy(dow) { copySrcDow.value = dow; copyTargets.value = []; copyDlg.value = true }
function doDayCopy() {
  if (!copyTargets.value.length) { ElMessage.warning('勾选要复制到哪几天'); return }
  const plan = copyDay5(copySrcDow.value, copyTargets.value)
  copyDlg.value = false
  ElMessage.success(`已覆盖：加上 ${plan.adds.length} 处 · 移出 ${plan.removes.length} 处；从下一轮起生效`)
}

/* 服务被引用数：全空间口径（服务是公共的） */
function serviceUsage(id) {
  return [...v5.slots, ...v5.temps].filter(s => s.quota?.source === 'service' && s.quota?.serviceId === id).length
}
function gapsOf(id) {
  const dates = datesOfRound5(roundOf(v5, id))
  return [...v5.slots.filter(s => s.spaceId === id), ...v5.temps.filter(t => t.spaceId === id)]
    .some(s => {
      const ds = s.date ? [s.date] : dates
      return ds.some(d => onDay(s, d) && activeCount5(v5, s.id, d) < s.snapN)
    })
}
function daysLabel(days) {
  if (days.length === 7) return '每天'
  if (days.length === 5 && [1, 2, 3, 4, 5].every(d => days.includes(d))) return '周一到周五'
  return '周' + days.slice().sort().map(d => DAY_NAMES[d]).join('、')
}
function quotaLabel(s) {
  if (s.quota.source === 'manual') return `人工给定 ${s.quota.value}`
  const svc = v5.services.find(x => x.id === s.quota.serviceId)
  return `${svc?.name || '算法'} · 本轮 ${s.snapN}`
}
function wayLabel(w) { return w === 'direct' ? '直派轮转' : w === 'grab' ? '先到先得' : '申领审核' }
function onDay(s, d) {
  if (s.date) return s.date === d
  return s.days.includes(new Date(`${d}T00:00:00`).getDay())
}
function occupied(slotId, date) { return activeCount5(v5, slotId, date) }
/* 名额分配结果：这几个人最后得到了（按履约人算，换出去的显示接手的人） */
function occupantsOf(slotId, date) {
  return v5.placements
    .filter(p => p.slotId === slotId && p.date === date && p.status === 'active')
    .map(p => personById(v5, dutyPersonId5(p)))
    .filter(Boolean)
}
function occupyNames(slotId, date) {
  return v5.placements
    .filter(p => p.slotId === slotId && p.date === date && p.status === 'active')
    .map(p => personById(v5, p.personId)?.name).join('、')
}

function bumpDay(s, d, delta) {
  const r = setDayQuota(s.id, d, dayCap(s.id, d) + delta)
  if (!r.ok) ElMessage.warning(r.reason)
  else ElMessage.success(r.text)
}

/* 排班节奏：周期（锚点+长度）、多久发一次、发布与截止相对周期起点的偏移
   节奏跟着空间走：切了空间就换成那个空间自己的节奏 */
const rhythmOpen = ref(false)
const rhythm = reactive({
  cycle: { ...round.value.config.cycle },
  every: round.value.config.every || 1,
  publishOffsetDays: round.value.config.publishOffsetDays ?? -4,
  publishHour: round.value.config.publishHour ?? 6,
  applyOffsetDays: round.value.config.applyOffsetDays ?? -1,
  applyHour: round.value.config.applyHour ?? 20
})
function syncRhythm() {
  const c = round.value.config
  Object.assign(rhythm.cycle, c.cycle)
  Object.assign(rhythm, {
    every: c.every || 1,
    publishOffsetDays: c.publishOffsetDays ?? -4,
    publishHour: c.publishHour ?? 6,
    applyOffsetDays: c.applyOffsetDays ?? -1,
    applyHour: c.applyHour ?? 20
  })
}
/* 界面上说「提前几天」，内部存负数偏移 */
const publishAhead = computed({
  get: () => Math.abs(rhythm.publishOffsetDays),
  set: v => { rhythm.publishOffsetDays = -Math.abs(v || 0) }
})
const applyAhead = computed({
  get: () => Math.abs(rhythm.applyOffsetDays),
  set: v => { rhythm.applyOffsetDays = -Math.abs(v || 0) }
})
function onAnchor(a) {
  if (a === 'monday') Object.assign(rhythm.cycle, { unit: 'week', n: 1 })
  else if (a === 'monthStart') Object.assign(rhythm.cycle, { unit: 'month', n: 1 })
  else Object.assign(rhythm.cycle, { unit: 'day', n: 7, start: rhythm.cycle.start || round.value.nextSpan[0] })
  applyRhythm()
}
const cycleText = computed(() => {
  const c = round.value.config.cycle
  if (c.anchor === 'monday') return c.n > 1 ? `每 ${c.n} 周` : '自然周'
  if (c.anchor === 'monthStart') return c.n > 1 ? `每 ${c.n} 个月` : '自然月'
  const unit = c.unit === 'week' ? '周' : c.unit === 'month' ? '个月' : '天'
  return `自定义 ${c.n} ${unit}（起 ${short(c.start)}）`
})
const rhythmLabel = computed(() => {
  const c = round.value.config
  const every = c.every > 1 ? `隔 ${c.every - 1} 期发 · ` : ''
  return `${cycleText.value} · ${every}提前 ${Math.abs(c.publishOffsetDays)} 天 ${String(c.publishHour).padStart(2, '0')}:00 发 · 申领截止提前 ${Math.abs(c.applyOffsetDays)} 天 ${String(c.applyHour).padStart(2, '0')}:00`
})
/* 时间轴预览：发布 / 覆盖区间 / 申领截止 / 今天 */
const rp = computed(() => {
  const c = round.value.config
  const span = round.value.nextSpan
  const day = s => new Date(`${String(s).slice(0, 10)}T00:00:00`).getTime()
  const pubAt = day(round.value.nextAt)
  const startT = day(span[0])
  const endT = day(span[1])
  const dlT = day(applyDeadlineOf(c, span[0]))
  const nowT = day(v5.now)
  const lo = Math.min(nowT, pubAt, dlT) - 2 * 86400000
  const hi = Math.max(endT, nowT) + 2 * 86400000
  const x = t => 40 + ((t - lo) / (hi - lo)) * 600
  return {
    pubX: x(pubAt), startX: x(startT), width: x(endT) - x(startT), dlX: x(dlT), nowX: x(nowT),
    dlText: shortAt(applyDeadlineOf(c, span[0]))
  }
})
function applyRhythm() {
  setRoundConfig({
    cycle: { ...rhythm.cycle },
    every: rhythm.every,
    publishOffsetDays: rhythm.publishOffsetDays,
    publishHour: rhythm.publishHour,
    applyOffsetDays: rhythm.applyOffsetDays,
    applyHour: rhythm.applyHour
  }, selSpace.value)
  ElMessage.success('节奏已改：下一轮按新节奏生成')
}

/* 编辑周期时段：新建和编辑共用一份表单 */
const editing = ref(null)
const formErrs = ref([])
const blankForm = () => ({
  name: '', category: '', start: '10:00', end: '14:00', days: [1, 2, 3, 4, 5],
  quota: { source: 'manual', value: 2 },
  list: [{ who: { tag: 'regular', scope: 'store', kind: 'all', pos: 'all' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } }]
})
const form = reactive(blankForm())
/* 开放窗口：配置存锚点+偏移，界面展示一律落成具体日期时间 */
function winKind(r) {
  const w = normWin5(r.win)
  if (w.base === 'puboff') return 'pubOff'
  return w.base === 'publish' ? (w.d ? 'pubOff' : 'publish') : w.base
}
function onWinKind(r, kind) {
  r.win = kind === 'publish' ? { base: 'publish', d: 0, t: '06:00' }
    : kind === 'pubOff' ? { base: 'puboff', d: 0, t: '09:00' }
    : kind === 'week' ? { base: 'week', dow: 5, t: '06:00' }
    : { base: 'date', d: -1, t: '20:00' }
}
function winPreview(r) {
  return windowLabel5(r, { days: form.days?.length ? form.days : [0, 1, 2, 3, 4, 5, 6] })
}
function openNew() {
  editing.value = 'new'
  Object.assign(form, blankForm())
  formErrs.value = []
}
function openEdit(s) {
  editing.value = s.id
  form.name = s.name
  form.category = s.category || ''
  form.start = s.start
  form.end = s.end
  form.days = [...s.days]
  form.quota = { ...s.quota }
  form.list = s.list.map(r => ({ ...r }))
  formErrs.value = []
}
function toggleDay(i) {
  form.days = form.days.includes(i) ? form.days.filter(d => d !== i) : [...form.days, i]
}
function snapOf(id) {
  const s = slotById(v5, id)
  return s ? s.snapN : 0
}
/* 名额数：上限跟着它封顶。手动=表单值；挂服务=本轮快照；新班次挂服务=下一轮才出数 */
const quotaN = computed(() => form.quota.source === 'manual'
  ? (form.quota.value || 0)
  : (editing.value !== 'new' ? snapOf(editing.value) : 0))
function doCopy(s) {
  const r = copySlot(s.id)
  if (r.ok) ElMessage.success(`已复制「${s.name}」：改名、改时间后保存，就是新班次`)
}
async function doRemove(s) {
  const n = v5.placements.filter(p => p.slotId === s.id && p.status === 'active').length
  try {
    await ElMessageBox.confirm(
      n ? `「${s.name}」上还挂着 ${n} 条生效中的班次，删掉这个时段，这些班次也会一起消失。` : `删掉「${s.name}」？`,
      '删除班次',
      { type: 'warning', confirmButtonText: '删掉', cancelButtonText: '再想想' }
    )
  } catch { return }
  if (editing.value === s.id) editing.value = null
  const r = removeSlot(s.id)
  ElMessage.success(`已删除${r.dropped ? `，同时清掉 ${r.dropped} 条班次` : ''}`)
}
function save() {
  const errs = checkSlotForm(selSpace.value, form, editing.value === 'new' ? '' : editing.value)
  formErrs.value = errs
  if (errs.length) { ElMessage.warning(`还有 ${errs.length} 处要改`); return }
  const isNew = editing.value === 'new'
  if (isNew) addSlot(selSpace.value, JSON.parse(JSON.stringify(form)))
  else saveSlotEdit(editing.value, JSON.parse(JSON.stringify(form)))
  editing.value = null
  formErrs.value = []
  ElMessage.success(isNew ? '已新建：从下一轮起生效' : '已保存：从下一轮起生效')
}
function revert() { revertConfig(); ElMessage.success('已撤销，回到当前轮的配置') }

/* 临时班次 */
const tempForm = reactive({ date: '2026-11-21', name: '', start: '18:00', end: '22:00', value: 2 })
const tempDrawer = ref(false)
function openTempDrawer() {
  tempForm.name = ''
  tempDrawer.value = true
}
function saveTemp() {
  if (!tempForm.name) { ElMessage.warning('给这个临时班次起个名'); return }
  const row = addTemp({
    spaceId: selSpace.value, date: tempForm.date, name: tempForm.name,
    start: tempForm.start, end: tempForm.end, quota: { source: 'manual', value: tempForm.value }
  })
  tempForm.name = ''
  tempDrawer.value = false
  ElMessage.success(`已新增：这一天多出 ${row.snapN} 个名额，去「轮与结果」里定人`)
}
/* 配置层不选人：跳到结果层对应轮次的那一天，由结果层定人 */
function goDefinePeople(date) {
  const r = roundOfDate(selSpace.value, date)
  if (r) pickRound(r.id)
  tab.value = 'run'
  runView.value = 'axis'
  nextTick(() => { axisDay.value = date })
}

/* 结果表分页 */
const resultList = computed(() => resultRows5(selSpace.value, runDates.value))
const { page, pageSize, total, rows } = usePager(resultList)

/* 申领登记（人事只看不审批） */
const applies = computed(() => applicationRows5(selSpace.value).filter(a => runDates.value.includes(a.date)))

/* 事实与版本 */
const facts = computed(() => factRows5())

/* 个人时间线：横轴是这个人当天的时间，纵向班次条/事实条/补位条；支持只占一部分时间的请假 */
const tlPidRaw = ref('')
const tlPid = computed(() => tlPidRaw.value || curSpacePeople.value[0]?.id || '')
const tlDates = computed(() => {
  const [a, b] = round.value.span
  const out = []
  const pad = n => String(n).padStart(2, '0')
  const d = new Date(`${a}T00:00:00`)
  const end = new Date(`${b}T00:00:00`)
  while (d <= end) {
    out.push({ date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, dow: d.getDay() })
    d.setDate(d.getDate() + 1)
  }
  return out
})
const tlPeople = computed(() => {
  const ids = new Set(curSpacePeople.value.map(p => p.id))
  const extra = tlRelated.value.filter(p => !ids.has(p.id))
  return [...curSpacePeople.value, ...extra]
})
/* 选哪一天：这个人有班或有事实的日子 */
const tlDayRaw = ref('')
const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const tlDayOpts = computed(() => {
  const pid = tlPid.value
  if (!pid) return []
  const ds = new Set()
  v5.placements.filter(p => p.personId === pid || dutyPersonId5(p) === pid).forEach(p => ds.add(p.date))
  v5.facts.filter(f => f.by === pid && f.date).forEach(f => ds.add(f.date))
  return [...ds].filter(d => tlDates.value.some(x => x.date === d)).sort()
})
const tlDay = computed(() => tlDayRaw.value || tlDayOpts.value[0] || '')
/* 三条带：班次条 / 事实条（可能只占一小时，没写时段=占整班）/ 补位条（另一个人的新区间） */
function tlBandsFor(day) {
  const pid = tlPid.value
  if (!pid || !day) return []
  const rows = []
  const shifts = v5.placements.filter(p => (p.personId === pid || dutyPersonId5(p) === pid) && p.date === day).map(p => {
    const s = slotById(v5, p.slotId)
    if (!s) return null
    const fac = p.status === 'covered' ? v5.facts.find(f => f.placementId === p.id || f.placements?.includes(p.id)) : null
    if (p.status === 'covered') return { s: toMin(s.start), e: toMin(s.end), text: `${s.name} ${s.start}–${s.end}`, sub: `时间被${fac?.type || '事实'}占用`, cls: 'covered' }
    /* 换班：事件占住时段，履约人换成了对方 */
    if (p.swap) {
      const to = personById(v5, p.swap.personId)?.name || ''
      const who = p.personId === pid ? `换给 ${to}` : `${personById(v5, p.personId)?.name || ''} 换入`
      return { s: toMin(s.start), e: toMin(s.end), text: `${s.name} ${s.start}–${s.end}`, sub: `换班 · ${who}`, cls: 'covered' }
    }
    /* 部分占用：这条班里被事实占据的段，蓝块上叠出来 */
    const segs = v5.facts.filter(f => f.by === pid && f.date === day && f.slotId === p.slotId && f.type === '请假').map(f => {
      const st = f.start || s.start
      const en = f.end || s.end
      return st < en ? { s: toMin(st), e: toMin(en), label: `${st}–${en}` } : null
    }).filter(Boolean)
    const sub = segs.length ? `${p.way} · 其中 ${segs.map(x => x.label).join('、')} 被占用` : p.way
    return { s: toMin(s.start), e: toMin(s.end), text: `${s.name} ${s.start}–${s.end}`, sub, marks: segs, cls: 'shift' }
  }).filter(Boolean)
  if (shifts.length) rows.push({ label: '班次', bands: shifts })
  const facts = v5.facts.filter(f => f.by === pid && f.date === day).map(f => {
    const s = f.slotId ? slotById(v5, f.slotId) : null
    const st = f.start || s?.start
    const en = f.end || s?.end
    if (!st || !en) return null
    const whole = s && st === s.start && en === s.end
    const sub = !s ? `占用 ${st}–${en}`
      : whole ? `${s.name}整班被占用（${st}–${en}）`
      : `${s.name}只占 ${st}–${en}，其余时间照常`
    return { s: toMin(st), e: toMin(en), text: `${f.type}（${f.at.slice(5, 16)} 提交）`, sub, cls: 'fact' }
  }).filter(Boolean)
  if (facts.length) rows.push({ label: '事实', bands: facts })
  const makes = []
  v5.facts.filter(f => f.by === pid && f.date === day).forEach(f => {
    v5.placements.filter(p => p.fromFact === f.id).forEach(p => {
      const s = slotById(v5, p.slotId)
      if (!s) return
      makes.push({ s: toMin(s.start), e: toMin(s.end), text: `${personById(v5, p.personId)?.name || ''} 顶上`, sub: `${s.start}–${s.end}`, cls: 'makeup' })
    })
  })
  if (makes.length) rows.push({ label: '补位', bands: makes })
  return rows
}
const tlBands = computed(() => tlBandsFor(tlDay.value))
/* 时间轴：包住当天所有区间，前后各留 1 小时 */
const tlAxis = computed(() => {
  let t0 = 24 * 60
  let t1 = 0
  tlBands.value.forEach(r => r.bands.forEach(b => { t0 = Math.min(t0, b.s); t1 = Math.max(t1, b.e) }))
  if (t1 <= t0) return { t0: 480, t1: 1320, ticks: [], labels: [] }
  t0 = Math.max(0, Math.floor((t0 - 60) / 60) * 60)
  t1 = Math.min(24 * 60, Math.ceil((t1 + 60) / 60) * 60)
  const ticks = []
  for (let m = t0; m <= t1; m += 60) ticks.push(m)
  return { t0, t1, ticks, labels: ticks.filter(m => m % 120 === 0) }
})
function tlPct(m) { const a = tlAxis.value; return (((m - a.t0) / (a.t1 - a.t0)) * 100).toFixed(2) + '%' }
function tlW(b) { const a = tlAxis.value; return (((b.e - b.s) / (a.t1 - a.t0)) * 100).toFixed(2) + '%' }
/* 相关的人：请假的人 ↔ 顶班的人，互相可跳 */
const tlRelated = computed(() => {
  const pid = tlPid.value
  if (!pid) return []
  const ids = new Set()
  v5.facts.filter(f => f.by === pid).forEach(f => {
    v5.placements.filter(p => p.fromFact === f.id).forEach(p => ids.add(p.personId))
  })
  v5.placements.filter(p => p.personId === pid && p.fromFact).forEach(p => {
    const f = v5.facts.find(x => x.id === p.fromFact)
    if (f?.by) ids.add(f.by)
  })
  return [...ids].filter(id => id !== pid).map(id => personById(v5, id)).filter(Boolean)
})
const openFact = ref('')
const hlFact = ref('')
function jumpFact(id) {
  tab.value = 'fact'
  hlFact.value = id
  nextTick(() => document.querySelector('.data-table tr.hl')?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
  setTimeout(() => { if (hlFact.value === id) hlFact.value = '' }, 2600)
}
function traceLine(pid) {
  const p = v5.placements.find(x => x.id === pid)
  if (!p) return ''
  const nm = personById(v5, p.personId)?.name
  const s = slotById(v5, p.slotId)
  return `${p.date.slice(5)} ${s?.name} · ${nm} · ${p.status === 'covered' ? '时间被占用' : p.way}`
}

/* 定人：从缺口格子直接进来，时段和日期已经带好；空几个名额就一次选几个 */
const appointDlg = ref(false)
const appoint = reactive({ gapKey: '', personIds: [] })
const gaps = computed(() => gaps5(selSpace.value))
const gapInfo = computed(() => {
  const [slotId, date] = appoint.gapKey.split('|')
  if (!slotId || !date) return null
  const s = slotById(v5, slotId)
  const tmp = v5.temps.some(t => t.id === slotId)
  const r = shownRound.value
  const open = !!(r && r.applyDeadline && v5.now < r.applyDeadline)
  const covered = v5.placements.filter(p => p.slotId === slotId && p.date === date && p.status === 'covered').length
  return { date, name: s?.name, start: s?.start, end: s?.end, occ: occupied(slotId, date), n: s?.snapN, tmp, open, covered }
})
/* 这口缺口是怎么来的：临时加的位 / 没人请假留下的 / 获取段没排满 */
const gapWhy = computed(() => {
  const g = gapInfo.value
  if (!g) return ''
  if (g.tmp) return g.open ? '那天临时加的名额，还在开放；你定人就直接占掉一个位' : '那天临时加的名额，还缺人'
  if (g.covered) return `有 ${g.covered} 人请假留下的洞`
  if (g.open) return '这一轮还在选班次，缺的位一般是等截止后补'
  return '这一轮的获取段排完还缺人'
})
const gapRemain = computed(() => gapInfo.value ? Math.max(0, gapInfo.value.n - gapInfo.value.occ) : 0)
const appointCands = computed(() => {
  const [slotId, date] = appoint.gapKey.split('|')
  if (!slotId) return []
  const slot = slotById(v5, slotId)
  return v5.people.filter(p =>
    slot.list.some(r => matchWho5(v5, p, slot, r.who))
    && !personBusy5(v5, p.id, date, slot.start, slot.end)
    && !v5.placements.some(x => x.slotId === slotId && x.date === date && x.personId === p.id && x.status === 'active'))
    .map(p => {
      const row = slot.list.find(r => matchWho5(v5, p, slot, r.who))
      return { ...p, rowLabel: whoLabel5(row?.who) }
    })
})
function openAppoint(gap) {
  appoint.gapKey = gap ? `${gap.slotId}|${gap.date}` : ''
  appoint.personIds = []
  appointDlg.value = true
}
function openGap(slot, date) { openAppoint({ slotId: slot.id, date }) }
/* 换了空位就清空已选的人：还缺几个名额，下面按新的坑重算 */
watch(() => appoint.gapKey, () => { appoint.personIds = [] })
/* 待人事处理：从通知直接进定人，时段和日期已经带好 */
const hrTodos = computed(() => v5.notices.filter(n => n.kind === 'hr' && !n.acked))
function openGapFromNotice(n) { openAppoint({ slotId: n.slotId, date: n.date }) }
function toggleAppointPerson(id) {
  if (appoint.personIds.includes(id)) appoint.personIds = appoint.personIds.filter(x => x !== id)
  else if (appoint.personIds.length < gapRemain.value) appoint.personIds.push(id)
}
function doAppoint() {
  if (!appoint.gapKey || !appoint.personIds.length) { ElMessage.warning('选空位、选人'); return }
  const [slotId, date] = appoint.gapKey.split('|')
  const ids = appoint.personIds.slice(0, gapRemain.value)
  const fails = []
  let done = 0
  ids.forEach(id => {
    const r = appointV5(slotId, date, id)
    if (r.ok) done += 1
    else fails.push(`${personById(v5, id)?.name || id}：${r.reason}`)
  })
  if (!done) { ElMessage.error(fails.join('；')); return }
  appointDlg.value = false
  ElMessage.success(fails.length
    ? `已定 ${done} 人；${fails.join('；')}`
    : `已定 ${done} 人：名额满了，别人进不来`)
}

/* 「这一档开放给谁」弹窗：几个条件在这里设，清单行只显示组合结果 */
const whoDlg = ref(false)
const whoEditIdx = ref(-1)
const whoTarget = ref(null)
const whoTitle = ref('这一档开放给谁')
const whoEdit = reactive({ scope: 'store', km: 3, kind: 'all', tag: 'regular', pos: 'all' })
function openWho(i) {
  whoEditIdx.value = i
  whoTarget.value = null
  whoTitle.value = '这一档开放给谁'
  Object.assign(whoEdit, { scope: 'store', km: 3, kind: 'all', tag: 'regular', pos: 'all', ...(form.list[i]?.who || {}) })
  whoDlg.value = true
}
/* 规则的人群也用同一个弹窗，写回它自己的 who */
function openWhoFor(obj) {
  whoEditIdx.value = -1
  whoTarget.value = obj
  whoTitle.value = '这条规则管谁'
  Object.assign(whoEdit, { scope: 'store', km: 3, kind: 'all', tag: 'regular', pos: 'all', ...(obj.who || {}) })
  whoDlg.value = true
}
function saveWho() {
  if (whoEditIdx.value >= 0) form.list[whoEditIdx.value].who = { ...whoEdit }
  if (whoTarget.value) whoTarget.value.who = { ...whoEdit }
  whoDlg.value = false
}

/* ===== 申领规则（配置层）：管谁 + 管哪类 + 计量 + 上下限 ===== */
const spaceRules = computed(() => rulesOfSpace(selSpace.value))
const ruleEditing = ref(false)
const ruleErr = ref('')
const ruleForm = reactive({
  id: '', name: '', who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: 'all' },
  scopeType: 'all', unit: 'count', min: 1, max: 0
})
function ruleNeedText(r) {
  const body = r.unit === 'count'
    ? [r.min ? `至少 ${r.min} 条` : '', r.max ? `至多 ${r.max} 条` : ''].filter(Boolean).join(' · ')
    : (r.min && r.max ? `${r.min}–${r.max} 分钟` : r.min ? `至少 ${r.min} 分钟` : `至多 ${r.max} 分钟`)
  return `每天 ${body}`
}
function openRule(r) {
  ruleErr.value = ''
  if (r) {
    Object.assign(ruleForm, {
      id: r.id, name: r.name, who: { ...r.who },
      scopeType: r.scope.type === 'all' ? 'all' : r.scope.id, unit: r.unit, min: r.min || 0, max: r.max || 0
    })
  } else {
    Object.assign(ruleForm, {
      id: '', name: '', who: { tag: 'regular', scope: 'store', kind: 'parttime', pos: 'all' },
      scopeType: 'all', unit: 'count', min: 1, max: 0
    })
  }
  ruleEditing.value = true
}
/* 类别管理：空间的字典，增 / 改名 / 删（删要挡还有班次或规则在用） */
const catDlg = ref(false)
const newCatName = ref('')
function openCatDlg() { newCatName.value = ''; catDlg.value = true }
function catUseText(id) {
  const u = categoryUsage(selSpace.value, id)
  return u.slots || u.rules ? `${u.slots} 条班次 · ${u.rules} 条规则在用` : '没人用'
}
function doAddCat() {
  const r = addCategory5(selSpace.value, newCatName.value)
  if (!r.ok) { ElMessage.warning(r.reason); return }
  newCatName.value = ''
  ElMessage.success('类别已添加')
}
function doRenameCat(c, val) {
  const r = renameCategory5(selSpace.value, c.id, val)
  if (!r.ok) { ElMessage.warning(r.reason); return }
  ElMessage.success('改名已保存')
}
function doRemoveCat(c) {
  const r = removeCategory5(selSpace.value, c.id)
  if (!r.ok) { ElMessage.warning(r.reason); return }
  ElMessage.success('类别已删除')
}

function saveRule() {
  const e = []
  if (!ruleForm.name.trim()) e.push('名称没填')
  if (!ruleForm.min && !ruleForm.max) e.push('下限和上限至少填一个')
  if (ruleForm.max && ruleForm.min > ruleForm.max) e.push('下限比上限大')
  if (ruleForm.scopeType !== 'all' && !spaceSlots.value.some(s => s.category === ruleForm.scopeType)) e.push('这个类下还没有时段')
  /* 圈到的人得在这个空间里真的有人，否则规则永远管不到任何人 */
  if (!curSpacePeople.value.some(p => matchWho5(v5, p, { spaceId: selSpace.value }, ruleForm.who))) e.push('这条规则圈到的人在这个空间里没有')
  ruleErr.value = e.join('；')
  if (e.length) return
  saveRule5({
    id: ruleForm.id, spaceId: selSpace.value, name: ruleForm.name.trim(),
    who: { ...ruleForm.who },
    scope: ruleForm.scopeType === 'all' ? { type: 'all' } : { type: 'category', id: ruleForm.scopeType },
    unit: ruleForm.unit, min: ruleForm.min || 0, max: ruleForm.max || null
  })
  ruleEditing.value = false
  ElMessage.success('规则已保存：立即用于试算，正式生效下一轮')
}
function doRemoveRule(r) {
  removeRule5(r.id)
  ElMessage.success('规则已删除，这些人恢复直接放行')
}
const limitForm = reactive({ week: 24, month: 96 })
const limitEditing = ref(false)
const curLimit = computed(() => limitsOfSpace(selSpace.value))
function syncLimits() {
  const l = limitsOfSpace(selSpace.value)
  limitForm.week = l ? l.week : 24
  limitForm.month = l ? l.month : 96
  limitEditing.value = false
}
function openLimitEdit() {
  syncLimits()
  limitEditing.value = true
}
async function devAdvanceRound() {
  const r = advanceRoundDemo()
  if (r.ok) ElMessage.success(`已推进到下一轮发布：铺 ${r.span[0]} – ${r.span[1]}，规则按刚保存的配置生效`)
  else ElMessage.warning(r.reason)
}
function applyLimits() {
  setHourLimits(selSpace.value, limitForm.week, limitForm.month)
  limitEditing.value = false
  ElMessage.success('额度已保存：按门店各算一套，只控周和月')
}
const trialPerson = ref('')
const trialDate = ref('')
const trial = computed(() => (trialPerson.value && trialDate.value
  ? trialClaim(trialPerson.value, selSpace.value, trialDate.value) : null))
function initTrial() {
  trialDate.value = roundDates.value[0] || ''
  /* 优先选一个命中规则的人，试算一打开就有内容 */
  const hit = curSpacePeople.value.find(p => claimRulesOf5(v5, selSpace.value, p).length)
  trialPerson.value = (hit || curSpacePeople.value[0])?.id || ''
}
initTrial()

/* 算法服务登记：四门槛必填，登记完时段的名额来源里就能选到 */
const svcDlg = ref(false)
const svcErrs = ref([])
const svcForm = reactive({ name: '', input: '', calc: '', version: '', idempotent: false })
function doAddService() {
  const e = []
  if (!svcForm.name.trim()) e.push('服务名称没填')
  if (!svcForm.input.trim()) e.push('没写读什么数')
  if (!svcForm.calc.trim()) e.push('没写怎么算')
  if (!/^v\d+(\.\d+)*$/.test(svcForm.version.trim())) e.push('版本号写成 v1.0 这样')
  if (!svcForm.idempotent) e.push('要确认能单独调用、同样的输入给同样的结果')
  svcErrs.value = e
  if (e.length) return
  addService({ name: svcForm.name.trim(), input: svcForm.input.trim(), calc: svcForm.calc.trim(), version: svcForm.version.trim() })
  Object.assign(svcForm, { name: '', input: '', calc: '', version: '', idempotent: false })
  svcErrs.value = []
  ElMessage.success('已登记：时段的名额来源里就能选到它了')
}

/* 演示：申领截止（按当前空间所有申领逐组截断） */
function devResolveApply() {
  const keys = [...new Set(applicationRows5(selSpace.value).map(a => `${a.slotId}|${a.date}`))]
  if (!keys.length) { ElMessage.warning('这个空间这一轮没有申领登记'); return }
  let picked = 0, rejected = 0
  keys.forEach(k => {
    const [slotId, date] = k.split('|')
    const r = resolveApplyDemo(slotId, date)
    picked += r.picked.length
    rejected += r.rejected.length
  })
  ElMessage.success(`截断完成：排上 ${picked} 人，落选 ${rejected} 人`)
}
</script>

<style scoped>
.v5-page { min-height: 100%; background: #f7f6f4; padding: 16px 18px 28px; }
.v5-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.v5-head h1 { font-size: 17px; font-weight: 600; margin: 0 0 4px; color: #2c2c2a; }
.v5-head p { margin: 0; font-size: 12px; color: #7a7a85; }
.hr { display: flex; align-items: center; gap: 8px; }
.dirty { font-size: 12px; color: #a35b00; background: #fdf3e6; border: 1px solid #efd6ad; border-radius: 6px; padding: 4px 8px; }
.dirty button { border: none; background: none; color: #a40035; font-size: 12px; cursor: pointer; text-decoration: underline; }
.clean { font-size: 12px; color: #4d7c3a; }
.v5-body { display: grid; grid-template-columns: 226px minmax(0, 1fr); gap: 12px; }
.space-rail { background: #fff; border: 1px solid #eee6e8; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chips button { font-size: 12px; padding: 2px 9px; border-radius: 10px; border: 1px solid #e6dfe1; background: #fff; color: #6a6a75; cursor: pointer; }
.chips button.on { border-color: #a40035; color: #a40035; background: #fdf1f4; }
.rail-list { display: flex; flex-direction: column; gap: 6px; }
.rail-item { text-align: left; border: 1px solid #eee6e8; background: #fff; border-radius: 8px; padding: 8px 10px; cursor: pointer; }
.rail-item.on { border-color: #a40035; background: #fdf6f8; }
.ri-top { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #2c2c2a; }
.gap-dot { width: 6px; height: 6px; border-radius: 50%; background: #d33; }
.ri-meta { display: flex; gap: 6px; align-items: center; font-size: 11px; color: #9a9fa9; margin-top: 3px; }
.mini-tag { border: 1px solid #eee6e8; border-radius: 4px; padding: 0 4px; }
.ri-meta em { font-style: normal; margin-left: auto; }
.v5-main { background: #fff; border: 1px solid #eee6e8; border-radius: 10px; padding: 12px 14px 18px; min-width: 0; }
.tabs { display: flex; gap: 4px; align-items: center; border-bottom: 1px solid #f0eaec; padding-bottom: 8px; }
/* 一级导航：排班 / 系统服务 */
.main-tabs { display: flex; gap: 4px; align-items: center; margin-bottom: 10px; }
.main-tabs button { border: 1px solid #eee6e8; background: #fff; padding: 6px 16px; border-radius: 18px; font-size: 13px; color: #6a6a75; cursor: pointer; }
.main-tabs button.on { background: #a40035; border-color: #a40035; color: #fff; font-weight: 500; }
.svc-pane { border: 1px solid #f0eaec; border-radius: 12px; background: #fff; padding: 16px 18px; }
/* 视图切换与按周期视图 */
.cyc-switch { display: inline-flex; border: 1px solid #eee6e8; border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
.cyc-switch button { border: none; background: #fff; padding: 5px 14px; font-size: 12.5px; color: #6a6a75; cursor: pointer; }
.cyc-switch button + button { border-left: 1px solid #eee6e8; }
.cyc-switch button.on { background: #fdf1f4; color: #a40035; font-weight: 500; }
.cyc-strip { display: flex; align-items: baseline; gap: 10px; margin: 2px 0 10px; }
.cyc-strip strong { font-size: 13px; color: #2c2c2a; }
.cyc-strip span { font-size: 12px; color: #9a9fa9; }
.cyc-days { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 10px; }
.cyc-day { border: 1px solid #f0eaec; border-radius: 10px; background: #fff; padding: 8px 10px; min-height: 96px; }
.cyc-day.none { background: #fcfcfa; }
.cd-head { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed #f0eaec; padding-bottom: 5px; margin-bottom: 6px; }
.cd-head strong { font-size: 12.5px; color: #2c2c2a; }
.cd-head em { font-style: normal; font-size: 11px; color: #9a9fa9; margin-left: 5px; }
.cd-copy { border: none; background: none; font-size: 11px; color: #a40035; cursor: pointer; padding: 0; }
.cd-copy:hover { text-decoration: underline; }
.cd-slots { display: flex; flex-direction: column; gap: 5px; }
.cd-slot { border: 1px solid #eee6e8; background: #fcfbfc; border-radius: 7px; padding: 5px 8px; text-align: left; cursor: pointer; }
.cd-slot:hover { border-color: #a40035; }
.cd-slot strong { display: block; font-size: 12px; color: #2c2c2a; }
.cd-slot span { font-size: 11px; color: #6a6a75; margin-right: 6px; }
.cd-slot em { font-style: normal; font-size: 10.5px; color: #3B6D11; }
.cd-none { font-size: 11.5px; color: #b0b3ba; }
.cp-src { font-size: 12.5px; color: #2c2c2a; margin-bottom: 10px; }
.cp-targets { display: flex; flex-wrap: wrap; gap: 4px 14px; padding: 8px 10px; border: 1px solid #f0eaec; border-radius: 8px; margin-bottom: 10px; }
.cp-plan { border: 1px solid #f0eaec; border-radius: 8px; padding: 8px 10px; background: #fcfbfc; }
.cp-line { font-size: 12px; color: #6a6a75; line-height: 1.8; }
.cp-line.add { color: #27500A; }
.cp-line.rm { color: #a40035; }
.svc-head { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 12px; }
.svc-head p { flex: 1; margin: 0; font-size: 12.5px; color: #8a8a95; line-height: 1.7; }
.tabs button { border: none; background: none; padding: 5px 10px; border-radius: 6px; font-size: 13px; color: #6a6a75; cursor: pointer; }
.tabs button.on { background: #fdf1f4; color: #a40035; font-weight: 500; }
.cur-space { margin-left: auto; font-size: 12px; color: #9a9fa9; }
.pane { padding-top: 10px; }
.sub-tabs { display: flex; gap: 4px; align-items: center; }
.sub-tabs > button { border: 1px solid #eee6e8; background: #fff; padding: 4px 10px; font-size: 12.5px; border-radius: 6px; color: #6a6a75; cursor: pointer; }
.sub-tabs > button.on { border-color: #a40035; color: #a40035; background: #fdf6f8; }
.sub-spacer { flex: 1; }
.rhythm { border: 1px solid #eadfe3; border-radius: 8px; margin: 12px 0 10px; background: #fcfbfc; }
.rh-timeline { width: 100%; height: auto; display: block; margin: 8px 0 2px; }
.rh-timeline { width: 100%; height: auto; display: block; margin: 8px 0 2px; }
.rh-sum { display: flex; align-items: center; gap: 10px; padding: 10px 12px; cursor: pointer; font-size: 12.5px; color: #3d3d47; }
.rh-caret { color: #a40035; font-size: 11px; width: 12px; }
.rh-sum strong { color: #a40035; }
.rh-label { color: #6a6a75; }
.rh-next { margin-left: auto; color: #9a9aa4; font-size: 11.5px; }
.rh-toggle { color: #a40035; font-size: 11.5px; border: 1px solid #f0d3db; border-radius: 4px; padding: 1px 7px; }
.rh-body { border-top: 1px dashed #f0eaec; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
.rh-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6a6a75; flex-wrap: wrap; }
.rh-row label { color: #3d3d47; }
.rh-unit { color: #9a9aa4; }
.rh-note { font-size: 11.5px; color: #9a9aa4; line-height: 1.6; }
.day-quota { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #f4eef0; }
.dq-title { font-size: 11.5px; color: #6a6a75; }
.dq-title em { font-style: normal; color: #a8a8b2; margin-left: 6px; }
.dq-days { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.dq-day { display: inline-flex; align-items: center; gap: 4px; border: 1px solid #f0eaec; border-radius: 6px; padding: 2px 6px; font-size: 11.5px; color: #6a6a75; background: #fff; }
.dq-day em { font-style: normal; color: #9a9aa4; }
.dq-day b { color: #3d3d47; font-weight: 600; }
.dq-day.full { background: #fbf7f8; }
.dq-day.full b { color: #a40035; }
.dq-btn { border: 1px solid #eee6e8; background: #fff; border-radius: 4px; width: 18px; height: 18px; line-height: 1; font-size: 11px; color: #a40035; cursor: pointer; padding: 0; }
.dq-btn:disabled { color: #d8d8de; border-color: #f2f2f4; cursor: not-allowed; }
.day-quota { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #f4eef0; }
.dq-title { font-size: 11.5px; color: #6a6a75; }
.dq-title em { font-style: normal; color: #a8a8b2; margin-left: 6px; }
.dq-days { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.dq-day { display: inline-flex; align-items: center; gap: 4px; border: 1px solid #f0eaec; border-radius: 6px; padding: 2px 6px; font-size: 11.5px; color: #6a6a75; background: #fff; }
.dq-day em { font-style: normal; color: #9a9aa4; }
.dq-day b { color: #3d3d47; font-weight: 600; }
.dq-day.full { background: #fbf7f8; }
.dq-day.full b { color: #a40035; }
.dq-btn { border: 1px solid #eee6e8; background: #fff; border-radius: 4px; width: 18px; height: 18px; line-height: 1; font-size: 11px; color: #a40035; cursor: pointer; padding: 0; }
.dq-btn:disabled { color: #d8d8de; border-color: #f2f2f4; cursor: not-allowed; }
.draft-tag { font-size: 11.5px; color: #a40035; background: #fdf2f5; border-radius: 4px; padding: 1px 6px; margin-left: 8px; }
.edit-card { border-color: #e6c9d2; background: #fffcfd; box-shadow: 0 2px 10px rgba(164, 0, 53, 0.05); }
.drawer-tag { font-size: 12px; color: #854F0B; background: #fdf6ec; border: 1px solid #f3e3c3; border-radius: 6px; padding: 6px 10px; margin-bottom: 12px; }
.drawer-box { margin-top: 0; border-top: none; padding-top: 0; }
.drawer-box .er label { flex: none; }
.drawer-box .ea { margin-top: 6px; padding-top: 10px; border-top: 1px dashed #f0eaec; }
.slot-card.being-edited { border-color: #e6c9d2; }
.lr-cap { font-size: 11.5px; color: #9a9aa4; margin-left: 8px; }
.le-ways { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #f0eaec; }
.way-row { display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; color: #6a6a75; line-height: 1.6; }
.way-name { flex: none; background: #fdf1f4; color: #a40035; border-radius: 4px; padding: 1px 8px; font-size: 11px; white-space: nowrap; margin-top: 1px; }
.way-desc em { font-style: normal; color: #a40035; }
.le-note { font-size: 11.5px; color: #9a9aa4; margin-top: 6px; line-height: 1.6; }
.le-quota { font-style: normal; color: #a40035; font-weight: 500; margin-left: 4px; }
.lr-empty { font-size: 12px; color: #9a9aa4; }
.form-errs { display: flex; flex-direction: column; gap: 3px; background: #fff7f8; border: 1px solid #f3d7dd; border-radius: 8px; padding: 8px 10px; font-size: 12px; color: #a40035; line-height: 1.7; }
.form-errs strong { font-size: 12px; }
.svc-form { margin-top: 14px; border-top: 1px dashed #f0eaec; padding-top: 12px; }
.sf-title { font-size: 12.5px; color: #3d3d47; margin-bottom: 10px; }
.sf-title em { font-style: normal; color: #9a9aa4; font-size: 11.5px; margin-left: 6px; }
.sf-grid { display: grid; grid-template-columns: 70px auto 70px auto 70px auto; gap: 6px 8px; align-items: center; font-size: 12px; color: #6a6a75; }
.sf-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 12px; color: #6a6a75; }
.sf-row label { width: 70px; }
.sf-row .el-input { flex: 1; }
.svc-link { margin-left: auto; }
.hint-line { font-size: 12px; color: #8a8a95; margin: 8px 0 10px; }
.hint-list { margin: 8px 0 10px; padding: 10px 12px 10px 26px; border: 1px solid #f0eaec; border-radius: 8px; background: #fcfbfc; font-size: 12px; color: #6a6a75; line-height: 1.9; }
.hint-list li::marker { color: #a40035; }

/* 这天的时间轴 */
.day-axis { border: 1px solid #eee6e8; border-radius: 8px; background: #fff; padding: 8px 10px 7px; margin-bottom: 12px; }
.da-head { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
.da-head strong { font-size: 12.5px; color: #2C2C2A; }
.da-tabs { display: inline-flex; border: 1px solid #eee6e8; border-radius: 6px; overflow: hidden; }
.da-tabs button { border: none; background: #fff; padding: 2px 8px; font-size: 11.5px; color: #6a6a75; cursor: pointer; }
.da-tabs button + button { border-left: 1px solid #eee6e8; }
.da-tabs button.on { background: #fdf1f4; color: #a40035; font-weight: 500; }
.da-svg { width: 100%; max-width: 680px; display: block; margin: 0 auto; }
.da-legend { display: flex; gap: 16px; font-size: 11px; color: #8a8a95; margin-top: 3px; flex-wrap: wrap; }
.da-legend .sw { display: inline-block; width: 12px; height: 8px; border-radius: 2px; margin-right: 4px; vertical-align: -1px; }
.sw-ruler { background: #FDF3E3; border: 1px dashed #C99B4A; }
.sw-band { background: #B7E5CF; border: 1px solid #6FBF97; }
.sw-tmp { background: #CFE0F5; border: 1px solid #7FA6D9; }
.sw-out { background: #EDEFF2; border: 1px dashed #B4B9C2; }

/* 申领规则 */
.cat-tag { font-size: 11px; color: #6a4b8a; background: #f4eefb; border: 1px solid #e0d2f2; border-radius: 4px; padding: 0 5px; }
.rule-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; align-items: flex-start; }
.rule-card { width: 100%; display: flex; align-items: center; justify-content: space-between; border: 1px solid #eee6e8; border-radius: 8px; background: #fff; padding: 8px 12px; }
.rc-main { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.rc-main strong { font-size: 13px; color: #2C2C2A; }
.rc-who { font-size: 12px; color: #6a6a75; }
.rc-scope { font-size: 11.5px; color: #6a4b8a; background: #f4eefb; border-radius: 4px; padding: 1px 6px; }
.rc-need { font-size: 12px; color: #a40035; font-weight: 500; }
.limit-card, .trial-card { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border: 1px solid #eee6e8; border-radius: 8px; background: #fff; padding: 9px 12px; margin-bottom: 10px; font-size: 12.5px; }
.limit-card strong, .trial-card strong { font-size: 13px; color: #2C2C2A; }
.lc-note { font-size: 11.5px; color: #9a9fa9; }
.lc-line { display: inline-flex; align-items: center; gap: 6px; }
.lc-none { font-size: 12px; color: #9a9fa9; font-style: normal; }
.trial-body { width: 100%; display: flex; flex-direction: column; gap: 4px; margin-top: 2px; }
.trial-line { font-size: 12px; color: #2f6f4f; display: flex; align-items: center; gap: 6px; }
.trial-line.bad { color: #a4441d; }
.trial-line.muted { color: #9a9fa9; }
.tl-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; display: inline-block; }
.rule-err { font-size: 12px; color: #a40035; margin: 4px 0; }
.cat-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; font-size: 12.5px; }
.cr-label { color: #6a6a75; }
.cat-pill { font-size: 11.5px; color: #6a4b8a; background: #f4eefb; border: 1px solid #e0d2f2; border-radius: 10px; padding: 1px 9px; }
.cat-dlg-hint { font-size: 12px; color: #8a8a95; margin-bottom: 10px; line-height: 1.6; }
.cat-dlg-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.cat-dlg-row.add { margin-top: 12px; padding-top: 10px; border-top: 1px dashed #eee6e8; }
.cd-id { width: 18px; font-size: 12px; color: #a40035; font-weight: 600; line-height: 24px; }
.cd-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.cd-use { font-size: 11.5px; color: #9a9fa9; white-space: nowrap; line-height: 18px; }
.cat-dlg-row { align-items: flex-start; }

.slot-card { border: 1px solid #f0eaec; border-radius: 10px; padding: 10px 12px; margin-bottom: 8px; }
.slot-card header { display: flex; justify-content: space-between; align-items: center; }
.sn { display: flex; align-items: baseline; gap: 8px; }
.sn strong { font-size: 13.5px; color: #2c2c2a; }
.time { font-size: 12.5px; color: #a40035; font-variant-numeric: tabular-nums; }
.days { font-size: 12px; color: #9a9fa9; }
.sacts { display: flex; align-items: center; gap: 8px; }
.quota-tag { font-size: 11.5px; color: #0f6e56; background: #eaf6f1; border-radius: 4px; padding: 2px 6px; }
.list-rows { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.lr { display: flex; align-items: center; gap: 6px; border: 1px solid #f0eaec; border-radius: 6px; padding: 3px 8px; font-size: 12px; color: #4a4a55; }
.lr-k { width: 14px; height: 14px; border-radius: 50%; background: #f2f2ee; color: #7a7a85; font-size: 10.5px; display: inline-flex; align-items: center; justify-content: center; }
.lr-way { font-size: 11px; border-radius: 3px; padding: 1px 5px; }
.way-direct { background: #eef3fb; color: #24587f; }
.way-grab { background: #eaf6f1; color: #0f6e56; }
.way-apply { background: #f7f0fa; color: #6b3f86; }
.lr-win { color: #9a9fa9; font-size: 11.5px; }
.edit-box { margin-top: 10px; border-top: 1px dashed #f0eaec; padding-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.er { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; color: #6a6a75; }
.er label { color: #8a8a95; }
.day-picks { display: flex; gap: 4px; }
.day-picks button { width: 26px; height: 24px; border: 1px solid #eee6e8; background: #fff; border-radius: 5px; font-size: 12px; color: #6a6a75; cursor: pointer; }
.day-picks button.on { border-color: #a40035; background: #fdf1f4; color: #a40035; }
.preview { font-size: 11.5px; color: #0f6e56; }
.list-editor { border: 1px solid #f2eef0; border-radius: 8px; padding: 8px; }
.le-head { display: grid; grid-template-columns: 44px 196px 112px minmax(280px, 1fr) 92px 44px; font-size: 11px; color: #9a9fa9; padding: 0 2px 4px; }
.le-head span:last-child { text-align: right; }
.le-row { display: grid; grid-template-columns: 44px 196px 112px minmax(280px, 1fr) 92px 44px; align-items: center; gap: 6px; padding: 3px 0 22px; }
.win-cell { display: flex; flex-direction: column; gap: 2px; min-width: 0; position: relative; }
.win-line { display: flex; align-items: center; gap: 6px; }
.win-u { font-size: 11px; color: #9a9fa9; white-space: nowrap; }
.win-preview { position: absolute; top: calc(100% + 1px); left: 2px; font-size: 11px; color: #3B6D11; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: calc(100% - 4px); }
.who-chip { display: flex; align-items: center; gap: 6px; width: 100%; border: 1px solid #dcdfe6; border-radius: 6px; background: #fff; padding: 4px 8px; font-size: 12px; color: #2c2c2a; cursor: pointer; text-align: left; }
.who-chip:hover { border-color: #a40035; }
.who-chip-txt { flex: 1; min-width: 0; line-height: 1.5; }
.who-chip-edit { font-size: 11px; color: #b0b3ba; flex-shrink: 0; }
.wr { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.wr > label { font-size: 12.5px; color: #6a6a75; width: 64px; }
.wr-unit { font-size: 12.5px; color: #6a6a75; }
.who-preview { border: 1px dashed #e6dfe1; border-radius: 8px; padding: 8px 10px; font-size: 12.5px; color: #6a6a75; }
.who-preview strong { color: #a40035; font-weight: 600; }
.le-row .del, .add-row { border: none; background: none; color: #a40035; font-size: 12px; cursor: pointer; justify-self: end; padding: 0; }
.add-row { margin-top: 4px; }
.ea { display: flex; align-items: center; gap: 8px; }
.ea-hint { font-size: 11.5px; color: #a35b00; margin-right: auto; }
.temp-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.temp-card { display: flex; justify-content: space-between; align-items: center; border: 1px solid #f0eaec; border-radius: 8px; padding: 8px 12px; }
.tc-l { display: flex; flex-direction: column; gap: 2px; }
.tc-l strong { font-size: 13px; color: #2c2c2a; }
.tc-got { font-size: 11.5px; color: #6a6a75; }
.tc-got em { color: #854F0B; font-style: normal; }
.tc-who { display: inline-block; margin: 0 2px; padding: 1px 6px; border: 1px solid #eee6e8; border-radius: 4px; background: #fbfaf9; font-size: 11.5px; color: #4a4a54; }
.tc-gap { color: #854F0B; margin-left: 4px; }
.pb-code { font-size: 10.5px; color: #a0a0aa; }
.tc-r { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #6a6a75; }
.temp-form { margin-top: 12px; border: 1px dashed #e6dfe1; border-radius: 10px; padding: 10px 12px; }
/* 一次选够名额的人选列表 */
.pick-box { border: 1px solid #f2eef0; border-radius: 8px; padding: 10px 12px; }
.pb-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
.pb-head strong { font-size: 12.5px; color: #2c2c2a; }
.pb-head span { font-size: 11.5px; color: #9a9fa9; }
.pb-list { display: flex; flex-wrap: wrap; gap: 6px; }
.pb-item { display: flex; align-items: center; gap: 6px; border: 1px solid #eee6e8; border-radius: 6px; padding: 5px 9px; font-size: 12px; color: #4a4a54; cursor: pointer; background: #fff; }
.pb-item.on { border-color: #a40035; background: #fdf6f8; color: #a40035; }
.pb-item.off { opacity: .45; cursor: not-allowed; }
.pb-item input { margin: 0; accent-color: #a40035; }
.pb-name { font-weight: 500; }
.pb-meta { font-size: 11px; color: #9a9fa9; }
.pb-none { font-size: 11.5px; color: #9a9fa9; }
.pb-sum { font-size: 11.5px; color: #a40035; margin-top: 8px; }
.dlg-pick { max-height: 260px; overflow: auto; }
.dlg-row.align-top { align-items: flex-start; }
.tf-title { font-size: 12.5px; font-weight: 500; color: #2c2c2a; margin-bottom: 8px; }
.tf-note { font-size: 11.5px; color: #9a9fa9; margin-top: 6px; }
.dash { color: #9a9fa9; }
.round-bar { display: flex; gap: 14px; align-items: center; font-size: 12px; color: #6a6a75; background: #fbfaf9; border: 1px solid #f0eaec; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; flex-wrap: wrap; }
.rb-id { font-weight: 600; color: #2c2c2a; }
.rb-k { color: #0f6e56; background: #eaf6f1; border-radius: 4px; padding: 2px 6px; }
.rb-dl { color: #a35b00; }
.occ-wrap { border: 1px solid #f0eaec; border-radius: 10px; overflow: auto; }
.occ-head, .occ-row { display: grid; grid-template-columns: 150px repeat(7, minmax(78px, 1fr)); }.occ-head { background: #fbfaf9; border-bottom: 1px solid #f0eaec; }
.occ-corner, .occ-day { font-size: 11px; color: #9a9fa9; padding: 6px 8px; }
.occ-day { text-align: center; }
.occ-row { border-bottom: 1px solid #f6f2f3; }
.occ-name { padding: 8px; display: flex; flex-direction: column; gap: 2px; }
.occ-name strong { font-size: 12.5px; color: #2c2c2a; }
.occ-name em { font-style: normal; font-size: 11px; color: #9a9fa9; }
.occ-cell { padding: 6px 8px; border-left: 1px solid #f6f2f3; display: flex; flex-direction: column; gap: 1px; min-height: 40px; }
.occ-cell.off { background: #fbfaf9; }
.occ-cell.gap .oc-count { color: #c0392b; }
.oc-count { font-size: 11.5px; font-variant-numeric: tabular-nums; color: #2c2c2a; }
.oc-names { font-size: 11px; color: #8a8a95; line-height: 1.4; }
.table-title { font-size: 13px; font-weight: 500; color: #2c2c2a; margin: 16px 0 6px; }
.table-title em { font-style: normal; font-size: 11.5px; color: #9a9fa9; font-weight: 400; margin-left: 6px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.data-table th, .data-table td { border-bottom: 1px solid #f2eef0; padding: 7px 8px; text-align: left; vertical-align: top; }
.data-table th { font-size: 11.5px; color: #8a8a95; font-weight: 500; background: #fbfaf9; }
tr.covered td { color: #9a9fa9; }
.st-on { color: #0f6e56; }
.st-off { color: #9a9fa9; }
.fact-acts { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.fa-hint { font-size: 12px; color: #8a8a95; margin-right: auto; }
.fa-note { font-size: 11.5px; color: #b0b3ba; }
/* 个人时间线 */
.tl-box { border: 1px solid #f0eaec; border-radius: 10px; background: #fff; padding: 10px 12px 8px; margin-bottom: 14px; }
/* 待人事处理：求值没人顶时发给人事的待办 */
.hr-todo { background: #faeeda; border: 1px solid #ecd9b0; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 8px; }
.hr-todo > strong { font-size: 12.5px; color: #854F0B; }
.hrt-row { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #6a6a75; }
.hrt-text { flex: 1; min-width: 0; color: #633806; }
.hrt-text em { display: block; font-style: normal; color: #9a8a6a; font-size: 11.5px; margin-top: 2px; }
.tl-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
.tl-head strong { font-size: 13px; color: #2c2c2a; }
.tl-head > span { font-size: 12px; color: #8a8a95; margin-right: auto; }
.tl-row { display: grid; grid-template-columns: 56px 1fr; gap: 8px; align-items: stretch; margin-bottom: 5px; }
.tl-rowlabel { font-size: 11.5px; color: #8a8a95; display: flex; align-items: center; justify-content: flex-end; }
.tl-track { position: relative; height: 36px; background: #fbfbf9; border-radius: 6px; }
.tl-axis-row .tl-track { height: 16px; background: none; }
.tl-tick { position: absolute; top: 0; bottom: 0; width: 1px; background: #ececea; }
.tl-ticklabel { position: absolute; top: 0; font-size: 10px; color: #b0b0b8; transform: translateX(-50%); font-weight: 400; }
.tl-band { position: absolute; top: 3px; bottom: 3px; border-radius: 5px; padding: 2px 7px; font-size: 11px; line-height: 1.3; overflow: hidden; }
.tl-band strong { display: block; font-size: 11px; white-space: nowrap; }
.tl-band span { display: block; color: inherit; opacity: 0.75; font-size: 10.5px; white-space: nowrap; }
.tl-band.shift { background: #eef3fb; color: #24587f; }
.tl-occ { position: absolute; top: 0; bottom: 0; background: repeating-linear-gradient(45deg, rgba(138, 77, 11, 0.30), rgba(138, 77, 11, 0.30) 4px, rgba(251, 233, 210, 0.65) 4px, rgba(251, 233, 210, 0.65) 8px); border-right: 1px solid rgba(138, 77, 11, 0.35); border-left: 1px solid rgba(138, 77, 11, 0.35); }
.tl-band.covered { background: #f7f7f4; color: #8a8a95; border: 1px dashed #c9c9c2; }
.tl-band.fact { background: repeating-linear-gradient(45deg, #fdf3e7, #fdf3e7 4px, #fbe9d2 4px, #fbe9d2 8px); color: #8a4d0b; }
.tl-band.makeup { background: #eaf6f1; color: #0f6e56; }
.tl-empty { font-size: 12px; color: #9a9fa9; padding: 10px 2px; }
.tl-rel { margin-top: 6px; font-size: 12px; color: #8a8a95; }
.tl-rel button { border: 1px solid #eee6e8; background: #fcfbfc; border-radius: 12px; padding: 1px 10px; font-size: 11.5px; color: #a40035; cursor: pointer; margin-left: 4px; }
.tl-rel button:hover { border-color: #a40035; }
.ftype { font-size: 11.5px; background: #fdf1f4; color: #a40035; border-radius: 4px; padding: 2px 6px; }
.trace-row td { background: #fbfaf9; }
.trace { display: flex; flex-wrap: wrap; gap: 8px; font-size: 11.5px; color: #6a6a75; }
.tr-title { color: #9a9fa9; }
.tr-item { border: 1px solid #f0eaec; border-radius: 4px; padding: 1px 6px; background: #fff; }
.tr-item.muted { color: #9a9fa9; }
.ver-title { font-size: 13px; font-weight: 500; margin: 18px 0 8px; color: #2c2c2a; }
.vers { display: flex; flex-direction: column; gap: 6px; }
.ver { display: flex; gap: 10px; align-items: baseline; font-size: 12px; color: #6a6a75; }
.v-no { color: #a40035; font-weight: 600; width: 28px; }
.v-at { color: #9a9fa9; font-variant-numeric: tabular-nums; width: 74px; }
.empty { font-size: 12px; color: #9a9fa9; padding: 14px 0; }
.svc-note { font-size: 12px; color: #6a6a75; background: #fbfaf9; border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; line-height: 1.7; }
.dlg-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 12.5px; color: #6a6a75; }
.dlg-row > label { width: 42px; flex: none; color: #8a8a95; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; }
.muted { color: #9a9fa9; }

/* 时间锚点条 */
.round-strip { display: flex; justify-content: space-between; align-items: center; gap: 12px; background: #fff; border: 1px solid #eee6e8; border-radius: 10px; padding: 8px 12px; margin-bottom: 10px; flex-wrap: wrap; }
.rs-main { display: flex; gap: 12px; align-items: center; font-size: 12px; color: #6a6a75; flex-wrap: wrap; }
.rs-tag { font-weight: 600; color: #2c2c2a; }
.rs-dl { color: #a35b00; }
.rs-side { display: flex; flex-direction: column; gap: 2px; align-items: flex-end; }
.rs-now { font-size: 11.5px; color: #8a8a95; font-variant-numeric: tabular-nums; }
.rs-next { font-size: 11.5px; color: #0f6e56; }

/* 缺口格可点补人 */
.occ-cell.pointable { cursor: pointer; }
.occ-cell.pointable:hover { background: #fdf6f8; }
.oc-fill { font-size: 10.5px; color: #a40035; opacity: 0; transition: opacity 0.12s; }
.occ-cell.pointable:hover .oc-fill { opacity: 1; }

/* 结果表跳事实 */
tr.pointable { cursor: pointer; }
tr.pointable:hover td { background: #fdf8f9; }
.fact-link { color: #a40035; font-size: 11.5px; }
.duty-note { margin-left: 4px; color: #a4441d; font-size: 11px; font-style: normal; }
.p-code { color: #a0a0aa; font-size: 11px; margin-right: 5px; }
tr.hl td { background: #fdf3e6 !important; }
.empty-cell { text-align: center; color: #9a9fa9; font-size: 12px; padding: 14px 0; }

/* 顶班弹窗 */
.gap-banner { display: flex; align-items: baseline; gap: 10px; background: #fdf6f8; border: 1px solid #f3d3db; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; font-size: 12px; color: #6a6a75; }
.gap-banner strong { font-size: 13px; color: #a40035; }
.gb-src { font-style: normal; font-size: 10.5px; padding: 0 5px; border-radius: 3px; }
.gb-src.cyc { background: #eaf3de; color: #27500A; }
.gb-src.tmp { background: #e8eef8; color: #2B5286; }
.gap-why { font-size: 11.5px; color: #8a8a95; margin: -4px 0 10px; }
.gb-src { font-style: normal; font-size: 10.5px; padding: 0 5px; border-radius: 3px; }
.gb-src.cyc { background: #eaf3de; color: #27500A; }
.gb-src.tmp { background: #e8eef8; color: #2B5286; }
.gap-why { font-size: 11.5px; color: #8a8a95; margin: -4px 0 10px; }
.dlg-hint { font-size: 11.5px; color: #9a9fa9; margin-top: -2px; }

/* ===== 结果层：轮次切换 + 两个视图 ===== */
.run-bar { display: flex; align-items: center; gap: 12px; border: 1px solid #f0eaec; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; flex-wrap: wrap; background: #fcfbfc; }
.rb-tabs { display: flex; gap: 6px; }
.rb-tabs button { display: flex; align-items: center; gap: 6px; border: 1px solid #eee6e8; background: #fff; border-radius: 6px; padding: 4px 10px; font-size: 12px; color: #6a6a75; cursor: pointer; }
.rb-tabs button strong { font-weight: 500; }
.rb-tabs button.on { border-color: #a40035; color: #a40035; background: #fdf6f8; }
.rb-badge { font-style: normal; font-size: 10.5px; padding: 0 5px; border-radius: 3px; background: #f2f2f4; color: #8a8a95; }
.rb-badge.applying { background: #fdf6f8; color: #a40035; }
.rb-badge.locked { background: #fdf3e3; color: #854F0B; }
.rb-badge.running { background: #eaf6f1; color: #0f6e56; }
.rb-badge.ended { background: #f4f4f5; color: #9a9fa9; }
.rb-note { font-size: 11.5px; color: #9a9fa9; }
.rb-next { font-size: 11.5px; color: #b0b0ba; margin-left: auto; }
.run-switch { display: flex; align-items: center; gap: 4px; margin-bottom: 10px; }
.run-switch button { border: 1px solid #eee6e8; background: #fff; border-radius: 6px; padding: 4px 10px; font-size: 12.5px; color: #6a6a75; cursor: pointer; }
.run-switch button.on { border-color: #a40035; color: #a40035; background: #fdf6f8; }
.rs-hint { font-size: 11.5px; color: #9a9fa9; margin-left: 8px; }

/* 空间时间轴 */
.ax-days { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
.ax-days button { border: 1px solid #eee6e8; background: #fff; border-radius: 6px; padding: 3px 8px; font-size: 12px; color: #6a6a75; cursor: pointer; }
.ax-days button em { font-style: normal; color: #a0a0aa; font-size: 11px; margin-left: 3px; }
.ax-days button.on { border-color: #a40035; color: #a40035; background: #fdf6f8; }
.ax-days button.on em { color: #a40035; }
.ax-box { border: 1px solid #f0eaec; border-radius: 8px; padding: 8px 10px; }
.ax-row { display: flex; align-items: center; gap: 10px; padding: 3px 0; }
.ax-label { width: 132px; flex: none; display: flex; flex-direction: column; gap: 1px; font-size: 12px; color: #2c2c2a; }
.ax-label span { font-size: 11px; color: #9a9fa9; }
.ax-src { font-style: normal; font-size: 10px; align-self: flex-start; padding: 0 4px; border-radius: 3px; }
.ax-src.cyc { background: #eaf3de; color: #27500A; }
.ax-src.tmp { background: #e8eef8; color: #2B5286; }
.ax-track { position: relative; flex: 1; height: 30px; }
.ax-head .ax-track { height: 18px; }
.ax-tick-label { position: absolute; transform: translateX(-50%); font-size: 10px; color: #a0a0aa; font-weight: 400; }
.ax-grid { position: absolute; top: 0; bottom: 0; width: 1px; background: #f4f0f1; }
.ax-band { position: absolute; top: 3px; bottom: 3px; border-radius: 5px; display: flex; align-items: center; gap: 6px; padding: 0 8px; overflow: hidden; font-size: 11.5px; }
.ax-band.cyc { background: #eef7f2; border: 1px solid #b7e5cf; }
.ax-band.tmp { background: #eef3fb; border: 1px dashed #7FA6D9; }
.ax-person { background: #fff; border: 1px solid #e4e0e2; border-radius: 4px; padding: 1px 6px; color: #3d3d47; white-space: nowrap; }
.ax-gap { color: #a40035; white-space: nowrap; }
.ax-gap.pointable { cursor: pointer; text-decoration: underline; }
.ax-empty { font-size: 12px; color: #9a9fa9; padding: 10px 0; }
.out-tag { font-size: 10.5px; color: #854F0B; background: #fdf3e3; border-radius: 3px; padding: 0 5px; }
.out-tag { font-size: 10.5px; color: #854F0B; background: #fdf3e3; border-radius: 3px; padding: 0 5px; }
.tmp-tag { font-style: normal; font-size: 10px; color: #2B5286; background: #e8eef8; border-radius: 3px; padding: 0 4px; margin-left: 4px; }

</style>
