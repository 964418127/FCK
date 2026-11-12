<template>
  <div class="page">
    <div class="page-header">
      <div class="head-left">
        <el-button link @click="goBack"><el-icon><ArrowLeft /></el-icon> 返回</el-button>
        <h1>{{ curShift?.name || '未命名时段' }}</h1>
        <el-tag size="small" effect="plain">{{ containerLabel(slot.containerId) }}</el-tag>
        <el-tag size="small" :type="slot.kind === 'temp' ? 'warning' : 'primary'" effect="plain">{{ kindLabel(slot.kind) }}</el-tag>
        <el-tag v-for="f in curFlags" :key="f" size="small" type="warning" effect="plain">{{ f }}</el-tag>
        <el-tag size="small" type="info" effect="plain">{{ slot.id }}</el-tag>
      </div>
      <div class="head-right">
        <el-button @click="goBack">返回列表</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </div>
    </div>

    <!-- ① 班次与时间（店级班次库） -->
    <el-card shadow="never" class="block">
      <template #header><span class="card-title">① 班次与时间 —— 时段挂本容器的班次；改名、调时间都在班次上改，容器级生效</span></template>
      <el-form label-width="92px" class="compact">
        <div class="form-grid">
          <el-form-item label="挂的班次">
            <el-select v-model="slot.shiftId" style="width: 220px">
              <el-option v-for="sh in placeShifts" :key="sh.id" :label="`${sh.name}（${sh.start}–${sh.end}）`" :value="sh.id" />
            </el-select>
            <el-tag v-for="f in curFlags" :key="f" size="small" type="warning" effect="plain" class="flag-tag">{{ f }}</el-tag>
            <span v-if="curShift?.templateId" class="te-hint">跨店比对按模板「{{ templateName(curShift.templateId) }}」，名字可以随便改</span>
          </el-form-item>
          <el-form-item label="类型">
            <el-radio-group v-model="slot.kind">
              <el-radio v-for="k in slotKinds" :key="k.value" :value="k.value">{{ k.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="slot.kind === 'cycle'" label="生效星期">
            <div class="weekday-picker">
              <button
                v-for="(n, i) in weekdayNames" :key="i" type="button"
                :class="{ on: (slot.days || []).includes(i) }"
                @click="toggleDay(i)"
              >周{{ n }}</button>
            </div>
          </el-form-item>
          <el-form-item v-if="slot.kind === 'temp'" label="日期">
            <el-date-picker v-model="slot.date" type="date" value-format="YYYY-MM-DD" placeholder="临时时段只生效一天" style="width: 160px" />
          </el-form-item>
          <el-form-item label="覆盖要求">
            <el-switch v-model="slot.required" active-text="名额必须分完（兜底不能留空）" />
          </el-form-item>
        </div>
        <div class="hint">时段挂在容器上（门店是容器类型之一，列表只是因为门店相对固定才直接罗列）；该容器的打卡考勤将来按容器归属关联，不挂时段。引用的班次：名称可改（比对仍按模板）、起止可调（模板不动）；自建班次只属于本容器。同一个班次被多个时段挂用时，改一次全体生效。</div>
      </el-form>

      <div class="shift-lib">
        <div class="lib-head">
          <span class="lib-title">本容器班次库（{{ placeShifts.length }} 条）</span>
          <div class="lib-actions">
            <el-select v-model="refTemplateId" size="small" style="width: 130px" placeholder="选模板">
              <el-option v-for="t in templates" :key="t.id" :label="t.name" :value="t.id" />
            </el-select>
            <el-button size="small" plain type="primary" :disabled="!refTemplateId" @click="addRefShift">引用模板</el-button>
            <el-button size="small" plain @click="addSelfShift">自建班次</el-button>
          </div>
        </div>
        <el-table :data="placeShifts" size="small" border>
          <el-table-column label="名称" min-width="130">
            <template #default="{ row }"><el-input v-model="row.name" size="small" placeholder="班次名称" /></template>
          </el-table-column>
          <el-table-column label="来源" width="130">
            <template #default="{ row }">
              <span v-if="row.templateId" class="cell-sub">引用 · {{ templateName(row.templateId) }}</span>
              <el-tag v-else size="small" type="info" effect="plain">门店自定义</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="起" width="104">
            <template #default="{ row }"><el-time-select v-model="row.start" start="00:00" step="00:30" end="23:30" size="small" style="width: 92px" /></template>
          </el-table-column>
          <el-table-column label="止" width="104">
            <template #default="{ row }"><el-time-select v-model="row.end" start="00:00" step="00:30" end="23:59" size="small" style="width: 92px" /></template>
          </el-table-column>
          <el-table-column label="休息" width="110">
            <template #default="{ row }"><el-input-number v-model="row.breakMin" :min="0" :max="240" :step="15" size="small" controls-position="right" style="width: 92px" /></template>
          </el-table-column>
          <el-table-column label="净工时" width="76" align="center">
            <template #default="{ row }">{{ netHOf(row) }}h</template>
          </el-table-column>
          <el-table-column label="标记" min-width="140">
            <template #default="{ row }">
              <el-tag v-for="f in flagsOfRow(row)" :key="f" size="small" type="warning" effect="plain" class="flag-tag">{{ f }}</el-tag>
              <span v-if="!flagsOfRow(row).length" class="cell-sub">与模板一致</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- ② 名额 -->
    <el-card shadow="never" class="block">
      <template #header><span class="card-title">② 名额 —— 这个时段最多能上几个人（一个数字，人事确认/微调后发布）</span></template>
      <el-form label-width="92px" class="compact">
        <div class="form-grid">
          <el-form-item label="名额数">
            <el-input-number v-model="slot.capacity.value" :min="1" :max="99" controls-position="right" style="width: 120px" />
          </el-form-item>
          <el-form-item label="口径说明">
            <el-input v-model="slot.capacity.note" placeholder="为什么是这个数，如：3 张床 / 编制 2 人 / 营业面积÷120" style="width: 340px" />
          </el-form-item>
        </div>
        <div class="hint">名额就是一个数字，没有「来源」下拉——为什么是这个数，写在口径说明里给人看，系统不读。名额随业务指标自动计算（名额自动化）本期不做：业务波动大时门店直接重新调整名额。每个分配层可在此基础上再限自己的配额（如「签约人数 ÷ 2」），在下面每一层里单独配。</div>
      </el-form>
    </el-card>

    <!-- ③ 生成与领取 -->
    <el-card shadow="never" class="block">
      <template #header><span class="card-title">③ 生成与领取 —— 定义什么时候铺出名额、领的时候有什么约束</span></template>
      <el-form label-width="92px" class="compact">
        <template v-if="slot.kind === 'cycle'">
          <div class="form-grid">
            <el-form-item label="生成节奏">
              <el-radio-group v-model="slot.generation.cadence" @change="onCadenceChange">
                <el-radio v-for="c in genCadences" :key="c.value" :value="c.value">{{ c.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <template v-if="slot.generation.cadence === 'weekly'">
              <el-form-item label="生成时刻">
                <el-select v-model="slot.generation.weekday" style="width: 92px">
                  <el-option v-for="(n, i) in weekdayNames" :key="i" :label="'周' + n" :value="i" />
                </el-select>
                <el-input v-model="slot.generation.time" style="width: 92px; margin-left: 8px" placeholder="06:00" />
              </el-form-item>
            </template>
            <template v-else-if="slot.generation.cadence === 'monthly'">
              <el-form-item label="生成时刻">
                <span class="te-plus">每月</span>
                <el-input-number v-model="slot.generation.day" :min="1" :max="28" controls-position="right" style="width: 92px" />
                <span class="te-plus">日</span>
                <el-input v-model="slot.generation.time" style="width: 92px; margin-left: 8px" placeholder="09:00" />
              </el-form-item>
            </template>
            <el-form-item label="生成视野">
              <el-select v-model="slot.generation.horizon" style="width: 140px">
                <el-option v-for="h in genHorizons" :key="h.value" :label="h.label" :value="h.value" />
              </el-select>
              <span class="te-hint">{{ genHorizons.find(h => h.value === slot.generation.horizon)?.hint }}</span>
            </el-form-item>
            <el-form-item label="幂等">
              <el-switch v-model="slot.generation.idempotent" active-text="重复跑结果一致（全量覆盖）" />
            </el-form-item>
          </div>
        </template>
        <div v-else class="hint">临时时段不设生成规则：发布即铺出名额，一次性。</div>
        <el-form-item label="领取方式">
          <el-radio-group v-model="slot.claim.granularity">
            <el-radio v-for="g in claimGran" :key="g.value" :value="g.value">{{ g.label }}</el-radio>
          </el-radio-group>
          <template v-if="slot.claim.granularity === 'split'">
            <span class="te-plus">最少</span>
            <el-input-number v-model="slot.claim.minHours" :min="1" :max="8" controls-position="right" style="width: 92px" />
            <span class="te-plus">小时起领</span>
          </template>
        </el-form-item>
        <el-form-item label="个人单日">
          <el-input-number v-model="slot.claim.perDay" :min="0" :max="12" controls-position="right" style="width: 110px" />
          <span class="te-plus">小时上限</span>
          <span class="te-hint">0 = 不限；超了领不了（领取资格的前置，如非全「单日累计 4 小时」）</span>
        </el-form-item>
        <div class="hint">生成铺出的是「名额实例」（时段定义 × 具体日期 × 名额数），不是排班结果；名额按下面的层消化完成后，直接写入现有排班结果记录（写入链路不变，重构范围限定）。</div>
      </el-form>
    </el-card>

    <!-- ④ 分配窗口 × 层 -->
    <el-card shadow="never" class="block">
      <template #header>
        <div class="card-head-row">
          <span class="card-title">④ 名额怎么分 —— 按层消化，逐层往下流（点层看规则字段）</span>
          <el-button size="small" plain type="primary" @click="addWindow">添加窗口</el-button>
        </div>
      </template>

      <div v-for="(w, wi) in slot.windows" :key="w.id" class="window-block">
        <div class="window-head">
          <span class="window-order">窗口 {{ wi + 1 }}</span>
          <el-input v-model="w.label" size="small" style="width: 160px" placeholder="窗口名称" />
          <el-select v-model="w.openAt.anchor" size="small" style="width: 108px" placeholder="周期">
            <el-option v-for="a in windowAnchors" :key="a.value" :label="a.label" :value="a.value" />
          </el-select>
          <template v-if="w.openAt.anchor === 'weekly'">
            <el-select v-model="w.openAt.weekday" size="small" style="width: 88px">
              <el-option v-for="(n, i) in weekdayNames" :key="i" :label="'周' + n" :value="i" />
            </el-select>
            <el-input v-model="w.openAt.time" size="small" style="width: 84px" placeholder="06:00" />
          </template>
          <template v-else-if="w.openAt.anchor === 'monthly'">
            <span class="te-plus">每月</span>
            <el-input-number v-model="w.openAt.day" size="small" :min="1" :max="28" controls-position="right" style="width: 84px" />
            <span class="te-plus">日</span>
            <el-input v-model="w.openAt.time" size="small" style="width: 84px" placeholder="09:00" />
          </template>
          <span class="win-label">{{ windowOpenText(w.openAt) }}</span>
          <el-button v-if="slot.windows.length > 1" link type="danger" size="small" @click="removeWindow(wi)">删除窗口</el-button>
        </div>
        <div class="rerun-row">
          <el-input v-model="w.rerunNote" size="small" placeholder="重跑说明（如：上一窗口落选者自动进入）。非重跑窗口留空" />
        </div>

        <!-- 漏斗可视化：宽度递减，可选=蓝 / 必选=琥珀 -->
        <div class="funnel">
          <template v-for="(t, ti) in w.tiers" :key="t.id">
            <div
              :class="['funnel-bar', t.obligation, { open: expanded.has(t.id) }]"
              :style="{ width: funnelWidth(ti) }"
              @click="toggle(t.id)"
            >
              <div class="fb-line1">
                <span class="fb-order">层 {{ ti + 1 }}</span>
                <span class="fb-crowds">{{ (t.crowds || []).join(' → ') || '未设人群' }}</span>
                <span :class="['fb-tag', t.obligation]">{{ obligationLabel(t.obligation) }}</span>
                <span class="fb-tag model">{{ openModelLabel(t.openModel) }}</span>
              </div>
              <div class="fb-line2">{{ tierSentence(t) }}</div>
            </div>
            <div class="funnel-arrow" />
          </template>
          <div class="funnel-end" :style="{ width: funnelWidth(w.tiers.length) }">漏完仍空 → {{ slot.leftover }}</div>
        </div>

        <!-- 错峰时间轴（并行层） -->
        <div v-if="parallelTiers(w).length" class="mini-axis">
          <div class="axis-title">错峰时间轴（相对窗口开放）—— 到点即可领取，窗口开了不关</div>
          <div class="axis-lane" v-for="t in parallelTiers(w)" :key="'ax' + t.id">
            <span class="axis-crowd">{{ (t.crowds || []).join('/') }}</span>
            <div class="axis-track">
              <span class="axis-node" :style="{ left: pct(t.openAt.offsetH, w) }" />
            </div>
            <span class="axis-offset">+{{ t.openAt.offsetH }}h 开放</span>
          </div>
          <div class="axis-scale">
            <span v-for="h in axisHours(w)" :key="h" class="axis-tick" :style="{ left: pct(h, w) }">+{{ h }}h</span>
          </div>
        </div>

        <!-- 层编辑 -->
        <div v-for="(t, ti) in w.tiers" :key="'ed' + t.id" v-show="expanded.has(t.id)" class="tier-editor">
          <div class="te-title">层 {{ ti + 1 }} 配置</div>
          <div class="te-sentence">业务说法：{{ tierSentence(t) }}</div>
          <el-form label-width="92px" class="compact" size="small">
            <el-form-item label="候选人群">
              <el-select v-model="t.crowds" multiple style="width: 100%" placeholder="1 种或多种岗位 × 合作形式，按选择顺序即优先顺序">
                <el-option v-for="c in crowds" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
            <el-form-item label="裁决键">
              <el-select v-model="t.key.type" style="width: 120px" @change="onKeyTypeChange(t)">
                <el-option v-for="k in keyTypes" :key="k.value" :label="k.label" :value="k.value" />
              </el-select>
              <el-select v-model="t.key.mode" style="width: 160px; margin-left: 8px" @change="onKeyModeChange(t)">
                <el-option v-for="m in modesOf(t.key.type)" :key="m.value" :label="m.label" :value="m.value" />
              </el-select>
              <span class="te-hint">{{ modeHint(t.key) }}</span>
            </el-form-item>

            <!-- 绩效键 · 综合分加权：指标 + 权重 + 破平 -->
            <el-form-item v-if="t.key.type === 'perf' && t.key.mode === 'composite'" label="指标权重">
              <div class="weights">
                <div v-for="(m, mi) in t.key.params.metrics" :key="mi" class="weight-row">
                  <el-select v-model="m.name" size="small" style="width: 110px">
                    <el-option v-for="p in perfMetrics" :key="p" :label="p" :value="p" />
                  </el-select>
                  <el-input-number v-model="m.weight" size="small" :min="0" :max="100" :step="5" controls-position="right" style="width: 100px" />
                  <span class="weight-pct">%</span>
                </div>
                <div class="weight-sum" :class="{ bad: weightSum(t) !== 100 }">合计 {{ weightSum(t) }}%（需 = 100）</div>
              </div>
              <div class="tiebreak-row">
                <span class="tb-label">破平指标</span>
                <el-select v-model="t.key.params.tiebreak" size="small" style="width: 110px">
                  <el-option v-for="p in perfMetrics" :key="p" :label="p" :value="p" />
                </el-select>
                <span class="te-hint">综合分相同时按它再排一次</span>
              </div>
            </el-form-item>

            <!-- 绩效键 · 单指标 -->
            <el-form-item v-if="t.key.type === 'perf' && t.key.mode === 'single'" label="指标">
              <el-select v-model="t.key.params.metric" size="small" style="width: 130px">
                <el-option v-for="p in perfMetrics" :key="p" :label="p" :value="p" />
              </el-select>
              <el-radio-group v-model="t.key.params.dir" size="small" style="margin-left: 10px">
                <el-radio value="desc">高者优先</el-radio>
                <el-radio value="asc">低者优先</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 状态键 · 轮转 -->
            <el-form-item v-if="t.key.type === 'state'" label="轮转顺序">
              <el-select v-model="t.key.params.order" multiple size="small" style="width: 260px" placeholder="按顺序选择，如 早班→晚班">
                <el-option v-for="tp in templates" :key="tp.id" :label="tp.name" :value="tp.name" />
              </el-select>
              <div class="tiebreak-row">
                <span class="tb-label">轮转锚点</span>
                <el-select v-model="t.key.params.anchor" size="small" style="width: 200px">
                  <el-option v-for="a in rotateAnchors" :key="a" :label="a" :value="a" />
                </el-select>
              </div>
            </el-form-item>

            <el-form-item label="配额">
              <el-select v-model="t.quota.mode" style="width: 180px">
                <el-option v-for="q in quotaModes" :key="q.value" :label="q.label" :value="q.value" />
              </el-select>
              <el-input-number v-if="t.quota.mode === 'count'" v-model="t.quota.value" :min="1" size="small" controls-position="right" style="width: 110px; margin-left: 8px" />
              <template v-if="t.quota.mode === 'ratio'">
                <el-input v-model="t.quota.base" size="small" placeholder="基数，如：门店签约非全人数" style="width: 200px; margin-left: 8px" />
                <el-input-number v-model="t.quota.divisor" :min="2" :max="10" size="small" controls-position="right" style="width: 100px; margin-left: 8px" />
              </template>
            </el-form-item>
            <el-form-item label="班次性质">
              <el-radio-group v-model="t.obligation">
                <el-radio v-for="o in obligations" :key="o.value" :value="o.value">{{ o.label }}</el-radio>
              </el-radio-group>
              <span class="te-hint">{{ obligationHint(t.obligation) }}</span>
            </el-form-item>
            <el-form-item label="开放时刻">
              <el-select v-model="t.openAt.anchor" style="width: 130px" @change="onAnchorChange(t)">
                <el-option v-for="a in openAnchors" :key="a.value" :label="a.label" :value="a.value" />
              </el-select>
              <template v-if="!openAnchorOf(t.openAt.anchor).fixed">
                <el-input v-model="t.openAt.time" size="small" style="width: 130px; margin-left: 8px" placeholder="06:00，可写 25:00" />
                <span class="te-hint">{{ timeNote(t.openAt.time) }}</span>
              </template>
              <template v-if="t.openAt.anchor === 'window'">
                <span class="te-plus">+ 错峰</span>
                <el-input-number v-model="t.openAt.offsetH" :min="0" :max="72" size="small" controls-position="right" style="width: 100px" />
                <span class="te-hint">小时（到点即可领取；并行层错峰用它）</span>
              </template>
            </el-form-item>
            <el-form-item label="开放模型">
              <el-radio-group v-model="t.openModel">
                <el-radio v-for="m in openModels" :key="m.value" :value="m.value">{{ m.label }}</el-radio>
              </el-radio-group>
              <span class="te-hint">{{ openModelHint(t.openModel) }}</span>
            </el-form-item>
            <el-form-item label="补充说明">
              <el-input v-model="t.note" style="width: 100%" />
            </el-form-item>
            <el-form-item label=" ">
              <el-button size="small" :disabled="ti === 0" @click="moveTier(w, ti, -1)">上移</el-button>
              <el-button size="small" :disabled="ti === w.tiers.length - 1" @click="moveTier(w, ti, 1)">下移</el-button>
              <el-button size="small" type="danger" plain :disabled="w.tiers.length <= 1" @click="removeTier(w, ti)">删除层</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-button size="small" plain class="add-tier" @click="addTier(w)">+ 添加层（漏斗下一级）</el-button>
      </div>
    </el-card>

    <!-- ⑤ 覆盖兜底 -->
    <el-card shadow="never" class="block">
      <template #header><span class="card-title">⑤ 覆盖兜底 —— 时间必须被铺满，漏完的名额去哪</span></template>
      <el-form label-width="92px" class="compact">
        <el-form-item label="兜底动作">
          <el-radio-group v-model="slot.leftover">
            <el-radio v-for="l in leftovers" :key="l" :value="l">{{ l }}</el-radio>
          </el-radio-group>
          <span v-if="slot.required" class="te-hint">「必须分完」的时段兜底不能选「留空」</span>
        </el-form-item>
        <el-form-item label="口径说明">
          <el-input v-model="slot.leftoverNote" style="width: 100%" placeholder="如：周四没操作 / 周五被挤出 / 抢不到名额 → 通班" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import {
  KEY_TYPES, SHIFT_TEMPLATES, SLOT_KINDS, CROWDS, QUOTA_MODES, OBLIGATIONS, OPEN_MODELS,
  WINDOW_ANCHORS, WEEKDAY_NAMES, OPEN_ANCHORS, openAnchorOf, parseOpenTime,
  LEFTOVERS, PERF_METRICS, ROTATE_ANCHORS,
  GEN_CADENCES, GEN_HORIZONS, CLAIM_GRANULARITY,
  netHours, containerLabel, tierSentence, windowOpenLabel, templateName, shiftFlags,
  obligationOf, openModelOf, kindOf
} from '../mock/slotModel.js'
import { findSlot, validateSlot, containerShiftList, shiftsOf, ensureShiftFromTemplate, addCustomShift } from '../mock/slotModelStore.js'

const route = useRoute()
const router = useRouter()

const slot = findSlot(route.params.id)
if (!slot) {
  ElMessage.error('时段不存在')
  router.replace({ name: 'slot-model' })
}

const templates = SHIFT_TEMPLATES
const slotKinds = SLOT_KINDS
const keyTypes = KEY_TYPES
const crowds = CROWDS
const quotaModes = QUOTA_MODES
const obligations = OBLIGATIONS
const openModels = OPEN_MODELS
const windowAnchors = WINDOW_ANCHORS
const weekdayNames = WEEKDAY_NAMES
const openAnchors = OPEN_ANCHORS
const leftovers = LEFTOVERS
const perfMetrics = PERF_METRICS
const rotateAnchors = ROTATE_ANCHORS

const kindLabel = v => kindOf(v).label
const genCadences = GEN_CADENCES
const genHorizons = GEN_HORIZONS
const claimGran = CLAIM_GRANULARITY
/** 本容器班次库（响应式）：本容器的班次 + 当前时段挂的班次 */
const placeShifts = computed(() => shiftsOf(slot.containerId))
const curShift = computed(() => containerShiftList.find(p => p.id === slot.shiftId))
const curFlags = computed(() => shiftFlags(curShift.value))
const flagsOfRow = row => shiftFlags(row)
const netHOf = row => netHours(row).toFixed(1).replace(/\.0$/, '')
const refTemplateId = ref('')
const addRefShift = () => {
  if (refTemplateId.value) ensureShiftFromTemplate(slot.containerId, refTemplateId.value)
}
const addSelfShift = () => addCustomShift(slot.containerId)
/** 切换生成节奏时给默认值（weekly→周四 06:00，monthly→25 日 09:00） */
const onCadenceChange = () => {
  const g = slot.generation
  if (g.cadence === 'weekly') { g.weekday ??= 4; g.time ||= '06:00' }
  if (g.cadence === 'monthly') { g.day ??= 25; g.time ||= '09:00' }
}

const netH = computed(() => netHOf(curShift.value || {}))

const toggleDay = d => {
  const days = slot.days || (slot.days = [])
  const i = days.indexOf(d)
  i === -1 ? days.push(d) : days.splice(i, 1)
}

const expanded = reactive(new Set())
const toggle = id => { expanded.has(id) ? expanded.delete(id) : expanded.add(id) }

/* ---- 漏斗 ---- */
const funnelWidth = ti => `calc(100% - ${Math.min(ti, 8) * 36}px)`
const windowOpenText = o => windowOpenLabel(o)
/** 跨日时刻的实时归一提示：25:00 → 「= 次日 01:00」 */
const timeNote = t => {
  const p = parseOpenTime(t)
  if (!p) return 'HH:MM，HH 可到 47'
  if (p.h < 24) return ''
  return `= 次日 ${String(p.h - 24).padStart(2, '0')}:${String(p.m).padStart(2, '0')}`
}
const onAnchorChange = t => {
  const a = openAnchorOf(t.openAt.anchor)
  if (a.fixed) t.openAt.time = ''
  else if (!t.openAt.time) t.openAt.time = '06:00'
}
const obligationLabel = v => obligationOf(v).label
const obligationHint = v => obligationOf(v).hint
const openModelLabel = v => openModelOf(v).label
const openModelHint = v => openModelOf(v).hint
const modesOf = type => (keyTypes.find(k => k.value === type) || {}).modes || []
const modeHint = k => ((keyTypes.find(x => x.value === k.type) || {}).modes || []).find(m => m.value === k.mode)?.hint || ''
const weightSum = t => (t.key.params?.metrics || []).reduce((a, m) => a + (Number(m.weight) || 0), 0)

const parallelTiers = w => (w.tiers || []).filter(t => t.openModel === 'parallel' && t.openAt.anchor === 'window')
const axisMax = w => Math.max(12, ...parallelTiers(w).map(t => t.openAt.offsetH)) + 2
const axisHours = w => Array.from({ length: Math.floor(axisMax(w) / 3) + 1 }, (_, i) => i * 3).filter(h => h <= axisMax(w))
const pct = (h, w) => (Math.min(h, axisMax(w)) / axisMax(w) * 100) + '%'

/* ---- 编辑动作 ---- */
let uid = 0
const genId = prefix => `${prefix}-${Date.now().toString(36)}-${++uid}`
const addWindow = () => slot.windows.push({ id: genId('W'), label: '新窗口', openAt: { anchor: 'weekly', weekday: 4, time: '06:00' }, rerunNote: '', tiers: [blankTier()] })
const removeWindow = wi => slot.windows.splice(wi, 1)
const defaultParams = (type, mode) => {
  if (type === 'perf' && mode === 'composite') {
    return { metrics: [{ name: '产值', weight: 40 }, { name: '回头率', weight: 30 }, { name: '预约率', weight: 30 }], tiebreak: '回头率' }
  }
  if (type === 'perf' && mode === 'single') return { metric: '回头率', dir: 'desc' }
  if (type === 'state') return { order: [], anchor: ROTATE_ANCHORS[0] }
  return {}
}
const onKeyTypeChange = t => {
  const first = modesOf(t.key.type)[0]
  t.key.mode = first?.value || ''
  t.key.params = defaultParams(t.key.type, t.key.mode)
}
const onKeyModeChange = t => { t.key.params = defaultParams(t.key.type, t.key.mode) }
const blankTier = () => ({
  id: genId('T'), order: 0,
  crowds: [],
  key: { type: 'time', mode: 'first', params: {} },
  quota: { mode: 'all' },
  obligation: 'right',
  openAt: { anchor: 'window', time: '', offsetH: 0 },
  openModel: 'serial', note: ''
})
const addTier = w => {
  const t = blankTier()
  w.tiers.push(t)
  expanded.add(t.id)
}
const removeTier = (w, ti) => w.tiers.splice(ti, 1)
const moveTier = (w, ti, d) => {
  const arr = w.tiers
  const [t] = arr.splice(ti, 1)
  arr.splice(ti + d, 0, t)
}

const goBack = () => router.push({ name: 'slot-model' })
const onSave = () => {
  const err = validateSlot(slot)
  if (err) return ElMessage.warning(err)
  ElMessage.success('已保存（原型仅内存态）')
}
</script>

<style scoped>
.page { padding: 20px 24px 60px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.head-left { display: flex; align-items: center; gap: 10px; }
.head-left h1 { margin: 0; font-size: 20px; }
.head-right { display: flex; gap: 8px; }

.block { margin-bottom: 16px; }
.card-title { font-size: 14px; font-weight: 500; }
.card-head-row { display: flex; justify-content: space-between; align-items: center; }
.compact :deep(.el-form-item) { margin-bottom: 12px; }
.form-grid { display: flex; flex-wrap: wrap; gap: 0 24px; }
.form-grid :deep(.el-form-item) { margin-right: 0; }
.net-badge { font-size: 15px; font-weight: 500; color: #185fa5; }
.net-badge.bad { color: #a32d2d; }
.hint { font-size: 12px; color: #9ca3af; line-height: 1.6; padding-left: 92px; }

.window-block { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px 16px; margin-bottom: 16px; background: #fafafa; }
.window-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.window-order { font-size: 13px; font-weight: 500; color: #534ab7; white-space: nowrap; }
.win-label { font-size: 12px; color: #6b7280; white-space: nowrap; }
.rerun-row { margin-bottom: 12px; }

.funnel { display: flex; flex-direction: column; align-items: center; margin: 4px 0 6px; }
.funnel-bar { border-radius: 8px; padding: 8px 14px; cursor: pointer; transition: box-shadow 0.15s; }
.funnel-bar.right { background: #e6f1fb; border: 1px solid #185fa5; }
.funnel-bar.duty { background: #faeeda; border: 1px solid #854f0b; }
.funnel-bar.open { box-shadow: 0 0 0 2px #534ab7 inset; }
.funnel-bar:hover { box-shadow: 0 0 0 2px #85b7eb inset; }
.funnel-bar.duty:hover { box-shadow: 0 0 0 2px #ef9f27 inset; }
.fb-line1 { display: flex; align-items: center; gap: 8px; }
.fb-order { font-size: 12px; font-weight: 500; color: #374151; white-space: nowrap; }
.fb-crowds { font-size: 13px; font-weight: 500; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fb-tag { font-size: 11px; padding: 1px 8px; border-radius: 10px; white-space: nowrap; }
.fb-tag.right { background: #b5d4f4; color: #0c447c; }
.fb-tag.duty { background: #fac775; color: #633806; }
.fb-tag.model { background: #f1efe8; color: #5f5e5a; }
.fb-line2 { font-size: 12px; color: #6b7280; margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.funnel-arrow { width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #b4b2a9; margin: 3px 0; }
.funnel-end { text-align: center; font-size: 12px; color: #6b7280; background: #f1efe8; border: 1px dashed #888780; border-radius: 8px; padding: 6px 0; }

.mini-axis { margin: 10px 0 4px; padding: 10px 12px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
.axis-title { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
.axis-lane { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.axis-crowd { width: 130px; font-size: 12px; color: #374151; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.axis-track { position: relative; flex: 1; height: 18px; background: #f3f4f6; border-radius: 4px; }
.axis-node { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; border-radius: 3px; background: #534ab7; }
.axis-offset { width: 130px; font-size: 11px; color: #9ca3af; white-space: nowrap; }
.axis-scale { position: relative; height: 16px; margin-left: 140px; margin-right: 140px; }
.axis-tick { position: absolute; font-size: 11px; color: #b4b2a9; transform: translateX(-50%); }

.tier-editor { background: #fff; border: 1px solid #d3d1c7; border-radius: 8px; padding: 12px 16px 4px; margin: 10px 0 4px; }
.te-title { font-size: 13px; font-weight: 500; color: #534ab7; margin-bottom: 4px; }
.te-sentence { font-size: 12px; color: #374151; background: #f0eefc; border-radius: 6px; padding: 6px 10px; margin-bottom: 10px; line-height: 1.6; }
.weekday-picker { display: flex; gap: 6px; }
.weekday-picker button { border: 1px solid #d3d1c7; background: #fff; border-radius: 14px; padding: 4px 12px; font-size: 12px; color: #374151; cursor: pointer; }
.weekday-picker button.on { background: #534ab7; border-color: #534ab7; color: #fff; }
.shift-lib { margin-top: 4px; border-top: 1px dashed #e5e7eb; padding-top: 10px; }
.lib-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.lib-title { font-size: 13px; font-weight: 500; color: #374151; }
.lib-actions { display: flex; gap: 8px; align-items: center; }
.flag-tag { margin-right: 6px; }
.te-hint { font-size: 12px; color: #9ca3af; margin-left: 10px; }
.te-plus { font-size: 12px; color: #6b7280; margin: 0 6px 0 2px; }
.add-tier { width: 100%; margin-top: 6px; }

.weights { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.weight-row { display: flex; align-items: center; gap: 6px; }
.weight-pct { font-size: 12px; color: #6b7280; }
.weight-sum { font-size: 12px; color: #185fa5; }
.weight-sum.bad { color: #a32d2d; font-weight: 500; }
.tiebreak-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; width: 100%; }
.tb-label { font-size: 12px; color: #6b7280; white-space: nowrap; }
</style>
