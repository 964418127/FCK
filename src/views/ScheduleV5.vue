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
          有配置改动 · 下一轮 {{ shortAt(v5.round.nextAt) }} 起生效
          <button @click="revert">撤销</button>
        </span>
        <span v-else class="clean">配置与当前轮一致</span>
        <el-button size="small" @click="$router.push('/v5/m')">移动端预览</el-button>
        <el-button v-if="isDev" size="small" @click="devResolveApply">申领截止（演示）</el-button>
      </div>
    </header>

    <!-- 时间锚点：现在处在哪一轮、改动什么时候生效 -->
    <div class="round-strip">
      <div class="rs-main">
        <span class="rs-tag">当前轮 {{ v5.round.id }}</span>
        <span>{{ shortAt(v5.round.publishedAt) }} 发布 · 覆盖 {{ short(v5.round.span[0]) }}–{{ short(v5.round.span[1]) }}</span>
        <span>清单开到第 {{ v5.round.k }} 档</span>
        <span class="rs-dl">{{ shortAt(v5.round.applyDeadline) }} 申领截止</span>
      </div>
      <div class="rs-side">
        <span class="rs-now">演示时刻 {{ v5.now }}</span>
        <span class="rs-next">下一轮 {{ shortAt(v5.round.nextAt) }} 生成 · 铺 {{ short(v5.round.nextSpan[0]) }}–{{ short(v5.round.nextSpan[1]) }}；配置改动到那时生效</span>
      </div>
    </div>

    <div class="v5-body">
      <aside class="space-rail">
        <el-input v-model="kw" placeholder="搜门店名称" clearable size="small" />
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
              <em>{{ slotCount(s.id) }} 个时段</em>
            </div>
          </button>
        </div>
      </aside>

      <main class="v5-main">
        <div class="tabs">
          <button :class="{ on: tab === 'def' }" @click="tab = 'def'">时段与清单</button>
          <button :class="{ on: tab === 'run' }" @click="tab = 'run'">轮与结果</button>
          <button :class="{ on: tab === 'fact' }" @click="tab = 'fact'">事实记录</button>
          <span class="cur-space">{{ curSpace?.name }} · {{ curSpace?.city }} · 营业 {{ curSpace?.bizStart }}–{{ curSpace?.bizEnd }}</span>
        </div>

        <!-- ① 定义段 -->
        <section v-if="tab === 'def'" class="pane">
          <div class="sub-tabs">
            <button :class="{ on: sub === 'cyc' }" @click="sub = 'cyc'">周期时段</button>
            <button :class="{ on: sub === 'tmp' }" @click="sub = 'tmp'">临时班次</button>
            <el-button link size="small" class="svc-link" @click="svcDlg = true">算法服务登记 · {{ v5.services.length }} 项 →</el-button>
            <span class="sub-spacer" />
            <el-button v-if="sub === 'cyc'" size="small" type="primary" @click="openNew">+ 新增班次</el-button>
          </div>

          <template v-if="sub === 'cyc'">
            <!-- 排班节奏：以前这四个参数写死在代码里，页面上没地方配 -->
            <div class="rhythm">
              <div class="rh-sum" @click="rhythmOpen = !rhythmOpen">
                <strong>排班节奏</strong>
                <span class="rh-label">{{ rhythmLabel }}</span>
                <span class="rh-next">下一轮 {{ shortAt(v5.round.nextAt) }} 生成 · 铺 {{ short(v5.round.nextSpan[0]) }}–{{ short(v5.round.nextSpan[1]) }}</span>
                <span class="rh-toggle">{{ rhythmOpen ? '收起' : '改' }}</span>
              </div>
              <div v-if="rhythmOpen" class="rh-body">
                <div class="rh-row">
                  <label>多久一轮</label>
                  <el-radio-group v-model="rhythm.cadence" size="small" @change="applyRhythm">
                    <el-radio-button value="weekly">每周</el-radio-button>
                    <el-radio-button value="monthly">每月</el-radio-button>
                  </el-radio-group>
                  <label>发布时点</label>
                  <el-select v-model="rhythm.publishDow" size="small" style="width: 90px" @change="applyRhythm">
                    <el-option v-for="(d, i) in DAY_NAMES" :key="i" :label="`周${d}`" :value="i" />
                  </el-select>
                  <el-input-number v-model="rhythm.publishHour" :min="0" :max="23" size="small" controls-position="right" style="width: 96px" @change="applyRhythm" />
                  <span class="rh-unit">点</span>
                </div>
                <div class="rh-row">
                  <label>覆盖跨度</label>
                  <el-input-number v-model="rhythm.spanWeeks" :min="1" :max="4" size="small" controls-position="right" style="width: 96px" @change="applyRhythm" />
                  <span class="rh-unit">周</span>
                  <label>申领截止</label>
                  <span class="rh-unit">发布后第</span>
                  <el-input-number v-model="rhythm.applyAheadDays" :min="1" :max="6" size="small" controls-position="right" style="width: 96px" @change="applyRhythm" />
                  <span class="rh-unit">天</span>
                  <el-input-number v-model="rhythm.applyHour" :min="0" :max="23" size="small" controls-position="right" style="width: 96px" @change="applyRhythm" />
                  <span class="rh-unit">点</span>
                </div>
                <div class="rh-note">改了节奏，下一次生成就按新节奏走；正在跑的当前轮不动，清单窗口跟着本轮发布时刻算。</div>
              </div>
            </div>

            <div class="hint-line">周期时段是模板：保存后从下一轮起生效，当前轮按已生成快照跑，不重算。</div>

            <!-- 编辑区：新建和编辑共用一份表单，永远开在列表上方 -->
            <article v-if="editing" class="slot-card edit-card">
              <header>
                <div class="sn">
                  <strong>{{ editing === 'new' ? '新建班次' : `编辑：${form.name}` }}</strong>
                  <span class="draft-tag">{{ editing === 'new' ? '尚未保存' : '保存后从下一轮起生效' }}</span>
                </div>
                <div class="sacts">
                  <el-button link size="small" @click="editing = null">收起</el-button>
                </div>
              </header>
              <div class="edit-box">
                <div class="er">
                  <label>名称</label><el-input v-model="form.name" size="small" placeholder="如：中班" style="width: 140px" />
                  <label>起</label><el-input v-model="form.start" size="small" placeholder="12:00" style="width: 80px" />
                  <label>止</label><el-input v-model="form.end" size="small" placeholder="16:00" style="width: 80px" />
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
                    <span>档位</span><span>谁</span><span>方式</span><span>开放窗口</span><span>上限</span><span />
                  </div>
                  <div v-for="(r, i) in form.list" :key="i" class="le-row">
                    <span class="lr-k">{{ i + 1 }}</span>
                    <el-select v-model="r.who" size="small" style="width: 130px">
                      <el-option v-for="w in WHO_LIST" :key="w" :label="w" :value="w" />
                    </el-select>
                    <el-select v-model="r.way" size="small" style="width: 120px">
                      <el-option label="直派轮转" value="direct" />
                      <el-option label="抢" value="grab" />
                      <el-option label="申领审核" value="apply" />
                    </el-select>
                    <el-select v-model="r.win" size="small" style="width: 180px">
                      <el-option label="发布即开" value="publish" />
                      <el-option label="周五 06:00 开" value="fri0600" />
                      <el-option label="开班前一天 20:00 开" value="day1" />
                    </el-select>
                    <el-input-number v-model="r.cap" :min="1" :max="6" size="small" controls-position="right"
                      style="width: 88px" placeholder="不限" />
                    <button class="del" @click="form.list.splice(i, 1)">移除</button>
                  </div>
                  <button class="add-row" @click="form.list.push({ who: '本店全员', way: 'grab', win: 'publish' })">+ 加一档</button>
                  <div class="le-note">上限留空=这一档能吃满全部名额；填了就封顶，剩下的名额留给下一档。</div>
                </div>

                <div v-if="formErrs.length" class="form-errs">
                  <strong>还有 {{ formErrs.length }} 处要改：</strong>
                  <span v-for="(e, i) in formErrs" :key="i">{{ e }}</span>
                </div>

                <div class="ea">
                  <span class="ea-hint">{{ editing === 'new' ? '新建后从下一轮起生效，当前轮不受影响' : '保存后从下一轮起生效，当前轮按快照跑' }}</span>
                  <el-button size="small" @click="editing = null">取消</el-button>
                  <el-button size="small" type="primary" @click="save">{{ editing === 'new' ? '新建' : '保存' }}</el-button>
                </div>
              </div>
            </article>

            <article v-for="s in spaceSlots" :key="s.id" class="slot-card" :class="{ 'being-edited': editing === s.id }">
              <header>
                <div class="sn">
                  <strong>{{ s.name }}</strong>
                  <span class="time">{{ s.start }}–{{ s.end }}</span>
                  <span class="days">{{ daysLabel(s.days) }}</span>
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
                  <span class="lr-who">{{ r.who }}</span>
                  <span class="lr-way" :class="'way-' + r.way">{{ wayLabel(r.way) }}</span>
                  <span class="lr-win">{{ windowLabel5(r) }}</span>
                  <span class="lr-cap">{{ r.cap ? `最多 ${r.cap} 人` : '不封顶' }}</span>
                </div>
              </div>

              <!-- 这一轮每天的名额：人事最常做的微调——只改这一天，不动模板 -->
              <div class="day-quota">
                <span class="dq-title">这一轮每天 <em>只改这一天，不动模板，也不进下一轮</em></span>
                <div class="dq-days">
                  <template v-for="d in WEEK_DATES" :key="d">
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

          <template v-else>
            <div class="hint-line">临时班次 = 特殊情况下的新增名额：只改那一天的容量，不进周期安排，保存即进当前窗口。</div>
            <div class="temp-list">
              <article v-for="t in spaceTemps" :key="t.id" class="temp-card">
                <div class="tc-l">
                  <strong>{{ t.name }}</strong>
                  <span class="time">{{ t.date }} · {{ t.start }}–{{ t.end }}</span>
                </div>
                <div class="tc-r">
                  <span class="quota-tag">名额 {{ t.snapN }}</span>
                  <span class="tc-occ">已占 {{ occupied(t.id, t.date) }}/{{ t.snapN }}</span>
                  <el-button v-if="occupied(t.id, t.date) < t.snapN" link size="small" @click="openGap(t, t.date)">补人 →</el-button>
                  <el-button link size="small" type="danger" @click="removeTemp(t.id)">删除</el-button>
                </div>
              </article>
              <div v-if="!spaceTemps.length" class="empty">还没有临时班次</div>
            </div>

            <div class="temp-form">
              <div class="tf-title">新增临时班次</div>
              <div class="er">
                <label>日期</label><el-input v-model="tempForm.date" size="small" style="width: 130px" />
                <label>名称</label><el-input v-model="tempForm.name" size="small" placeholder="如：周六晚加场" style="width: 160px" />
                <label>起止</label>
                <el-input v-model="tempForm.start" size="small" style="width: 76px" />
                <span class="dash">–</span>
                <el-input v-model="tempForm.end" size="small" style="width: 76px" />
                <label>名额</label><el-input-number v-model="tempForm.value" :min="1" :max="6" size="small" />
                <el-button size="small" type="primary" @click="saveTemp">保存并开放</el-button>
              </div>
              <div class="tf-note">默认清单一行：本店全员 · 抢 · 发布即开。要别的档位，先建周期时段再改。</div>
            </div>
          </template>
        </section>

        <!-- ② 获取段：轮与结果 -->
        <section v-else-if="tab === 'run'" class="pane">
          <div class="table-title">占用与缺口 <em>点缺人的格子直接补人；格子里的名字是当前占位的人</em></div>
          <div class="occ-wrap">
            <div class="occ-head">
              <span class="occ-corner">时段</span>
              <span v-for="d in WEEK_DATES" :key="d" class="occ-day">{{ d.slice(5) }}</span>
            </div>
            <div v-for="s in allSpaceSlots" :key="s.id" class="occ-row">
              <div class="occ-name">
                <strong>{{ s.name }}</strong>
                <em>{{ s.start }}–{{ s.end }} · 名额 {{ s.snapN }}</em>
              </div>
              <div v-for="d in WEEK_DATES" :key="d" class="occ-cell"
                :class="{ off: !onDay(s, d), gap: onDay(s, d) && occupied(s.id, d) < s.snapN, pointable: onDay(s, d) && occupied(s.id, d) < s.snapN }"
                @click="onDay(s, d) && occupied(s.id, d) < s.snapN && openGap(s, d)">
                <template v-if="onDay(s, d)">
                  <span class="oc-count">{{ occupied(s.id, d) }}/{{ s.snapN }}</span>
                  <span class="oc-names">{{ occupyNames(s.id, d) }}</span>
                  <span v-if="occupied(s.id, d) < s.snapN" class="oc-fill">补人</span>
                </template>
              </div>
            </div>
          </div>

          <div class="table-title">申领登记 <em>提交只登记；{{ shortAt(v5.round.applyDeadline) }} 截止后按综合分排序截断，人事不逐单审批</em></div>
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
                <td>{{ r.slotName }} {{ r.start }}–{{ r.end }}</td>
                <td>{{ r.person }}</td>
                <td>{{ r.way }}</td>
                <td>
                  <span v-if="r.factId" class="fact-link">{{ r.factId }} · {{ r.factType }}</span>
                  <span v-else class="muted">—</span>
                </td>
                <td>
                  <span v-if="r.status === 'active'" class="st-on">生效</span>
                  <span v-else class="st-off">已覆盖</span>
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
            <el-button size="small" @click="openAppoint()">指定顶班</el-button>
            <el-button size="small" @click="exitDlg = true">登记资格没了</el-button>
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

    <!-- 指定顶班 -->
    <el-dialog v-model="appointDlg" title="指定顶班" width="560px">
      <div class="svc-note">经营性安排：名额限定到这一个人，别人进不来；不需对方同意，通知即可。</div>
      <div v-if="gapInfo" class="gap-banner">
        <strong>{{ gapInfo.date.slice(5) }} {{ gapInfo.name }} {{ gapInfo.start }}–{{ gapInfo.end }}</strong>
        <span>现在 {{ gapInfo.occ }}/{{ gapInfo.n }}，这一格还缺 {{ gapInfo.n - gapInfo.occ }} 人</span>
      </div>
      <div class="dlg-row">
        <label>空位</label>
        <el-select v-model="appoint.gapKey" size="small" style="width: 340px" placeholder="先选一个有空位的时段">
          <el-option v-for="g in gaps" :key="g.slotId + g.date" :label="`${g.date.slice(5)} ${g.slot.name} ${g.slot.start}–${g.slot.end}（${g.occ}/${g.n}）`" :value="g.slotId + '|' + g.date" />
        </el-select>
      </div>
      <div class="dlg-row">
        <label>选人</label>
        <el-select v-model="appoint.personId" size="small" style="width: 340px" placeholder="符合这口坑、当时没班的人">
          <el-option v-for="p in appointCands" :key="p.id" :label="`${p.name} · ${p.position} · ${p.kind === 'fulltime' ? '全职' : '非全'} · 符合「${p.rowLabel}」`" :value="p.id" />
        </el-select>
      </div>
      <div class="dlg-hint">候选只列符合这一档、当时没班、时间不撞的人。</div>
      <template #footer>
        <el-button size="small" @click="appointDlg = false">取消</el-button>
        <el-button size="small" type="primary" @click="doAppoint">确认安排</el-button>
      </template>
    </el-dialog>

    <!-- 登记资格没了 -->
    <el-dialog v-model="exitDlg" title="登记资格没了" width="480px">
      <div class="svc-note">离职 / 长期假 / 调岗：不找人顶，这个人直接从 {{ WEEK_DATES[0] }} 起的结果里消失。复职 = 新的资格事实。</div>
      <div class="dlg-row">
        <label>谁</label>
        <el-select v-model="exitForm.personId" size="small" style="width: 260px">
          <el-option v-for="p in curSpacePeople" :key="p.id" :label="p.name" :value="p.id" />
        </el-select>
      </div>
      <div class="dlg-row">
        <label>情况</label>
        <el-radio-group v-model="exitForm.subtype" size="small">
          <el-radio-button value="离职">离职</el-radio-button>
          <el-radio-button value="长期假">长期假</el-radio-button>
          <el-radio-button value="调岗">调岗</el-radio-button>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button size="small" @click="exitDlg = false">取消</el-button>
        <el-button size="small" type="primary" @click="doExit">确认登记</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import TablePagination from '../components/TablePagination.vue'
import { usePager } from '../composables/usePager.js'
import {
  v5, WEEK_DATES, saveSlotEdit, revertConfig, addTemp, removeTemp,
  addSlot, copySlot, removeSlot, addService, checkSlotForm, setRoundConfig, setDayQuota, dayCap,
  appointV5, registerExit, resolveApplyDemo, gaps5, resultRows5, factRows5, applicationRows5
} from '../mock/scheduleV5Store.js'
import {
  slotById, personById, activeCount5, windowLabel5, matchWho5, personBusy5, slotsOn5
} from '../mock/scheduleV5.js'

const route = useRoute()
const isDev = computed(() => route.query.dev === '1')
const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']
/* 人群：雇佣类型和岗位都写在人群里——时段本身不带岗位 */
const WHO_LIST = ['本店全员', '本店全职', '本店非全', '本店推拿师', '本店客户经理', '同城推拿师', '同城客户经理']
const tab = ref('def')
const sub = ref('cyc')
const kw = ref('')
const city = ref('')
const selSpace = ref(v5.spaces[0].id)

const cities = computed(() => [...new Set(v5.spaces.map(s => s.city))])
const filteredSpaces = computed(() => v5.spaces.filter(s =>
  (!city.value || s.city === city.value) && (!kw.value || s.name.includes(kw.value))))
const curSpace = computed(() => v5.spaces.find(s => s.id === selSpace.value))
const spaceSlots = computed(() => v5.slots.filter(s => s.spaceId === selSpace.value))
const spaceTemps = computed(() => v5.temps.filter(t => t.spaceId === selSpace.value))
const allSpaceSlots = computed(() => [...spaceSlots.value, ...spaceTemps.value])
const curSpacePeople = computed(() => v5.people.filter(p => p.spaceId === selSpace.value))

function pickSpace(id) { selSpace.value = id; editing.value = null }
/* 时间展示：日期只到日，时刻带上时分 */
function short(d) { return `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}` }
function shortAt(at) { return `${Number(at.slice(5, 7))}/${Number(at.slice(8, 10))} ${at.slice(11, 16)}` }
function slotCount(id) { return v5.slots.filter(s => s.spaceId === id).length + v5.temps.filter(t => t.spaceId === id).length }
function gapsOf(id) {
  return [...v5.slots.filter(s => s.spaceId === id), ...v5.temps.filter(t => t.spaceId === id)]
    .some(s => {
      const dates = s.date ? [s.date] : WEEK_DATES
      return dates.some(d => onDay(s, d) && activeCount5(v5, s.id, d) < s.snapN)
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
function wayLabel(w) { return w === 'direct' ? '直派轮转' : w === 'grab' ? '抢' : '申领审核' }
function onDay(s, d) {
  if (s.date) return s.date === d
  return s.days.includes(new Date(`${d}T00:00:00`).getDay())
}
function occupied(slotId, date) { return activeCount5(v5, slotId, date) }
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

/* 排班节奏 */
const rhythmOpen = ref(false)
const rhythm = reactive({ ...v5.round.config })
const rhythmLabel = computed(() => {
  const c = v5.round.config
  const cad = c.cadence === 'monthly' ? '每月' : `每周${DAY_NAMES[c.publishDow]}`
  return `${cad} ${String(c.publishHour).padStart(2, '0')}:00 发布 · 铺 ${c.spanWeeks} 周 · 申领截止发布后第 ${c.applyAheadDays} 天 ${String(c.applyHour).padStart(2, '0')}:00`
})
function applyRhythm() {
  setRoundConfig({ ...rhythm })
  ElMessage.success('节奏已改：下一轮按新节奏生成')
}

/* 编辑周期时段：新建和编辑共用一份表单 */
const editing = ref(null)
const formErrs = ref([])
const blankForm = () => ({
  name: '', start: '10:00', end: '14:00', days: [1, 2, 3, 4, 5],
  quota: { source: 'manual', value: 2 },
  list: [{ who: '本店全员', way: 'grab', win: 'publish' }]
})
const form = reactive(blankForm())
function openNew() {
  editing.value = 'new'
  Object.assign(form, blankForm())
  formErrs.value = []
}
function openEdit(s) {
  editing.value = s.id
  form.name = s.name
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
function saveTemp() {
  if (!tempForm.name) { ElMessage.warning('给这个临时班次起个名'); return }
  addTemp({
    spaceId: selSpace.value, date: tempForm.date, name: tempForm.name,
    start: tempForm.start, end: tempForm.end, quota: { source: 'manual', value: tempForm.value }
  })
  tempForm.name = ''
  ElMessage.success('已新增：这一天多出名额，当前窗口就能拿')
}

/* 结果表分页 */
const resultList = computed(() => resultRows5(selSpace.value))
const { page, pageSize, total, rows } = usePager(resultList)

/* 申领登记（人事只看不审批） */
const applies = computed(() => applicationRows5(selSpace.value))

/* 事实与版本 */
const facts = computed(() => factRows5())
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
  return `${p.date.slice(5)} ${s?.name} · ${nm} · ${p.status === 'covered' ? '已覆盖' : p.way}`
}

/* 指定顶班：从缺口格子直接进来，时段和日期已经带好 */
const appointDlg = ref(false)
const appoint = reactive({ gapKey: '', personId: '' })
const gaps = computed(() => gaps5(selSpace.value))
const gapInfo = computed(() => {
  const [slotId, date] = appoint.gapKey.split('|')
  if (!slotId || !date) return null
  const s = slotById(v5, slotId)
  return { date, name: s?.name, start: s?.start, end: s?.end, occ: occupied(slotId, date), n: s?.snapN }
})
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
      return { ...p, rowLabel: row?.who || '' }
    })
})
function openAppoint(gap) {
  appoint.gapKey = gap ? `${gap.slotId}|${gap.date}` : ''
  appoint.personId = ''
  appointDlg.value = true
}
function openGap(slot, date) { openAppoint({ slotId: slot.id, date }) }
function doAppoint() {
  if (!appoint.gapKey || !appoint.personId) { ElMessage.warning('选空位、选人'); return }
  const [slotId, date] = appoint.gapKey.split('|')
  const r = appointV5(slotId, date, appoint.personId)
  if (!r.ok) { ElMessage.error(r.reason); return }
  appointDlg.value = false
  ElMessage.success(r.text)
}

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

/* 资格没了 */
const exitDlg = ref(false)
const exitForm = reactive({ personId: '', subtype: '离职' })
function doExit() {
  if (!exitForm.personId) { ElMessage.warning('选一个人'); return }
  const r = registerExit(exitForm.personId, exitForm.subtype)
  exitDlg.value = false
  ElMessage.success(r.text)
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
.tabs button { border: none; background: none; padding: 5px 10px; border-radius: 6px; font-size: 13px; color: #6a6a75; cursor: pointer; }
.tabs button.on { background: #fdf1f4; color: #a40035; font-weight: 500; }
.cur-space { margin-left: auto; font-size: 12px; color: #9a9fa9; }
.pane { padding-top: 10px; }
.sub-tabs { display: flex; gap: 4px; align-items: center; }
.sub-tabs > button { border: 1px solid #eee6e8; background: #fff; padding: 4px 10px; font-size: 12.5px; border-radius: 6px; color: #6a6a75; cursor: pointer; }
.sub-tabs > button.on { border-color: #a40035; color: #a40035; background: #fdf6f8; }
.sub-spacer { flex: 1; }
.rhythm { border: 1px solid #f0eaec; border-radius: 10px; margin-bottom: 10px; background: #fcfbfc; }
.rh-sum { display: flex; align-items: center; gap: 12px; padding: 9px 12px; cursor: pointer; font-size: 12.5px; color: #3d3d47; }
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
.slot-card.being-edited { border-color: #e6c9d2; }
.lr-cap { font-size: 11.5px; color: #9a9aa4; margin-left: 8px; }
.le-note { font-size: 11.5px; color: #9a9aa4; margin-top: 4px; line-height: 1.6; }
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
.le-head { display: grid; grid-template-columns: 44px 140px 130px 190px 1fr; font-size: 11px; color: #9a9fa9; padding: 0 2px 4px; }
.le-row { display: grid; grid-template-columns: 44px 140px 130px 190px 1fr; align-items: center; gap: 6px; padding: 3px 0; }
.le-row .del, .add-row { border: none; background: none; color: #a40035; font-size: 12px; cursor: pointer; justify-self: start; }
.add-row { margin-top: 4px; }
.ea { display: flex; align-items: center; gap: 8px; }
.ea-hint { font-size: 11.5px; color: #a35b00; margin-right: auto; }
.temp-list { display: flex; flex-direction: column; gap: 6px; }
.temp-card { display: flex; justify-content: space-between; align-items: center; border: 1px solid #f0eaec; border-left: 3px solid #a40035; border-radius: 8px; padding: 8px 12px; }
.tc-l { display: flex; flex-direction: column; gap: 2px; }
.tc-l strong { font-size: 13px; color: #2c2c2a; }
.tc-r { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #6a6a75; }
.temp-form { margin-top: 12px; border: 1px dashed #e6dfe1; border-radius: 10px; padding: 10px 12px; }
.tf-title { font-size: 12.5px; font-weight: 500; color: #2c2c2a; margin-bottom: 8px; }
.tf-note { font-size: 11.5px; color: #9a9fa9; margin-top: 6px; }
.dash { color: #9a9fa9; }
.round-bar { display: flex; gap: 14px; align-items: center; font-size: 12px; color: #6a6a75; background: #fbfaf9; border: 1px solid #f0eaec; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; flex-wrap: wrap; }
.rb-id { font-weight: 600; color: #2c2c2a; }
.rb-k { color: #0f6e56; background: #eaf6f1; border-radius: 4px; padding: 2px 6px; }
.rb-dl { color: #a35b00; }
.occ-wrap { border: 1px solid #f0eaec; border-radius: 10px; overflow: auto; }
.occ-head, .occ-row { display: grid; grid-template-columns: 150px repeat(7, minmax(78px, 1fr)); }
.occ-head { background: #fbfaf9; border-bottom: 1px solid #f0eaec; }
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
.dlg-row label { width: 42px; color: #8a8a95; }
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
tr.hl td { background: #fdf3e6 !important; }
.empty-cell { text-align: center; color: #9a9fa9; font-size: 12px; padding: 14px 0; }

/* 顶班弹窗 */
.gap-banner { display: flex; align-items: baseline; gap: 10px; background: #fdf6f8; border: 1px solid #f3d3db; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; font-size: 12px; color: #6a6a75; }
.gap-banner strong { font-size: 13px; color: #a40035; }
.dlg-hint { font-size: 11.5px; color: #9a9fa9; margin-top: -2px; }
</style>
