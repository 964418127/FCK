<template>
  <div class="schedule-strategy-detail">
    <div class="detail-head">
      <div class="head-left">
        <el-button link @click="goBack"><el-icon><ArrowLeft /></el-icon>返回列表</el-button>
        <span class="head-title">{{ form.name || '未命名策略' }}</span>
        <el-tag size="small" :type="form.enabled ? 'success' : 'danger'" effect="plain">{{ form.enabled ? '已启用' : '已停用' }}</el-tag>
      </div>
      <div class="head-actions">
        <el-switch v-model="form.enabled" active-text="启用" />
        <el-button type="primary" @click="onSave">保存</el-button>
      </div>
    </div>

    <el-alert class="top-tip" type="info" :closable="false"
      title="本期策略中心只集中定义，生成引擎暂不读取本配置 —— 各线排班照现有逻辑运行。" />

    <div class="slot-grid">
      <!-- ① 适用人群 -->
      <el-card shadow="never" class="slot-card">
        <template #header>① 适用人群</template>
        <el-form label-width="88px" size="default">
          <el-form-item label="策略名称">
            <el-input v-model="form.name" placeholder="如：产品经理" />
          </el-form-item>
          <el-form-item label="适用岗位">
            <el-select v-model="form.position" style="width: 100%">
              <el-option v-for="p in positions" :key="p" :label="p" :value="p" />
            </el-select>
          </el-form-item>
          <el-form-item label="合作性质">
            <el-radio-group v-model="form.cooperation">
              <el-radio-button v-for="c in cooperations" :key="c" :value="c">{{ c }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="策略说明">
            <el-input v-model="form.scopeDesc" placeholder="如：研发不区分城市门店" />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- ② 生效范围 -->
      <el-card shadow="never" class="slot-card">
        <template #header>② 生效范围</template>
        <el-form label-width="88px" size="default">
          <el-form-item label="范围层级">
            <el-radio-group v-model="form.scopeLevel">
              <el-radio-button v-for="s in scopeLevels" :key="s.value" :value="s.value">{{ s.label }}</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="form.scopeLevel === 'global'" label="对象">
            <span class="form-hint">全公司默认值；城市 / 门店 / 个人配置会覆盖它</span>
          </el-form-item>

          <el-form-item v-else-if="form.scopeLevel === 'city'" label="城市">
            <el-select v-model="form.scopeTargets.cities" multiple placeholder="选择城市" style="width: 100%">
              <el-option v-for="c in orgCities" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>

          <el-form-item v-else-if="form.scopeLevel === 'store'" label="门店">
            <el-select v-model="form.scopeTargets.stores" multiple placeholder="选择门店" style="width: 100%">
              <el-option-group v-for="g in storesByCity" :key="g.city" :label="g.city">
                <el-option v-for="st in g.list" :key="st.id" :label="st.name" :value="st.id" />
              </el-option-group>
            </el-select>
          </el-form-item>

          <el-form-item v-else label="人员">
            <el-select v-model="form.scopeTargets.people" multiple placeholder="选择人员" style="width: 100%">
              <el-option v-for="p in orgPeople" :key="p.id" :label="`${p.name}（${p.position} · ${p.store}）`" :value="p.id" />
            </el-select>
          </el-form-item>

          <el-form-item label=" ">
            <span class="form-hint">覆盖链：通用 → 城市 → 门店 → 个人，下层覆盖上层同类参数</span>
          </el-form-item>
          <el-form-item label="当前摘要">
            <span class="form-hint">{{ scopeSummary(form) }}</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- ③ 生成计划 -->
      <el-card shadow="never" class="slot-card">
        <template #header>③ 生成计划</template>
        <el-form label-width="88px" size="default">
          <el-form-item label="触发方式">
            <el-radio-group v-model="form.trigger.type">
              <el-radio-button v-for="t in triggerTypes" :key="t.value" :value="t.value">{{ t.label }}</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <template v-if="form.trigger.type === 'cron'">
            <el-form-item label="重复频率">
              <el-radio-group v-model="form.trigger.freq">
                <el-radio-button v-for="f in cronFreqs" :key="f.value" :value="f.value">{{ f.label }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.trigger.freq === 'weekly'" label="星期">
              <el-checkbox-group v-model="form.trigger.weekdays">
                <el-checkbox v-for="w in weekdays" :key="w.value" :value="w.value">{{ w.label }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item v-if="form.trigger.freq === 'monthly'" label="日期">
              <el-radio-group v-model="form.trigger.monthDay">
                <el-radio v-for="d in 31" :key="d" :value="d">{{ d }} 日</el-radio>
                <el-radio value="last">最后一天</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.trigger.freq === 'yearly'" label="月日">
              <el-input-number v-model="form.trigger.month" :min="1" :max="12" controls-position="right" style="width: 90px" />
              <span class="form-hint">月</span>
              <el-input-number v-model="form.trigger.monthDayYear" :min="1" :max="31" controls-position="right" style="width: 90px; margin-left: 8px" />
              <span class="form-hint">日</span>
            </el-form-item>
            <el-form-item v-if="form.trigger.freq !== 'yearly'" label="时刻">
              <el-time-select v-model="form.trigger.time" start="00:00" step="00:15" end="23:45" style="width: 120px" />
            </el-form-item>
            <el-form-item label="cron 预览">
              <span class="cron-preview">{{ cronExpr || '参数不全' }}</span>
              <span class="form-hint">{{ cronText }}</span>
            </el-form-item>
            <el-form-item label="允许手动">
              <el-switch v-model="form.trigger.manualAllowed" />
              <span class="form-hint">{{ form.trigger.manualAllowed ? '定时之外，运营可随时手动触发一次' : '只按定时跑' }}</span>
            </el-form-item>
          </template>

          <el-form-item v-if="form.trigger.type === 'event'" label="业务事件">
            <el-select v-model="form.trigger.events" multiple placeholder="选择触发的事件" style="width: 100%">
              <el-option v-for="e in eventOptions" :key="e" :label="e" :value="e" />
            </el-select>
          </el-form-item>

          <el-form-item label="生成跨度">
            <el-radio-group v-model="form.trigger.span">
              <el-radio-button v-for="s in spans" :key="s" :value="s">{{ s }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="生成范围">
            <span class="form-hint">从当前往后</span>
            <el-input-number v-model="form.trigger.ahead.count" :min="1" :max="12" controls-position="right" style="width: 90px; margin: 0 8px" />
            <el-select v-model="form.trigger.ahead.unit" style="width: 80px">
              <el-option v-for="u in aheadUnits" :key="u" :label="u" :value="u" />
            </el-select>
            <span class="form-hint">（{{ aheadText }}）</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- ④ 班次时段 -->
      <el-card shadow="never" class="slot-card">
        <template #header>
          <div class="card-head-row">
            <span>④ 班次时段（时段是承接的原子）</span>
            <el-button size="small" plain type="primary" @click="addSlot">添加时段</el-button>
          </div>
        </template>
        <el-form label-width="88px" size="default">
          <el-form-item label="时段来源">
            <el-select v-model="form.shiftStructure.timeSource" style="width: 100%">
              <el-option v-for="t in timeSources" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
          </el-form-item>
          <el-table :data="form.shiftStructure.slots" border size="small">
            <el-table-column label="时段名称" width="120">
              <template #default="{ row }">
                <el-input v-model="row.name" size="small" placeholder="早班" />
              </template>
            </el-table-column>
            <el-table-column label="起" width="112">
              <template #default="{ row }">
                <el-time-select v-model="row.start" size="small" start="06:00" step="00:30" end="23:30" :disabled="!timeFixed" :placeholder="timePlaceholder" />
              </template>
            </el-table-column>
            <el-table-column label="止" width="112">
              <template #default="{ row }">
                <el-time-select v-model="row.end" size="small" start="06:00" step="00:30" end="23:30" :disabled="!timeFixed" :placeholder="timePlaceholder" />
              </template>
            </el-table-column>
            <el-table-column label="休息(分)" width="92">
              <template #default="{ row }">
                <el-input-number v-model="row.breakMin" size="small" :min="0" :max="240" :step="30" controls-position="right" :disabled="form.shiftStructure.timeSource === 'demand'" />
              </template>
            </el-table-column>
            <el-table-column label="净工时" width="88" align="center">
              <template #default="{ row }">
                <span v-if="slotNetHours(row) !== null" class="net-hours">{{ slotNetHours(row) }}h</span>
                <span v-else class="form-hint">按门店</span>
              </template>
            </el-table-column>
            <el-table-column label="名额" width="92">
              <template #default="{ row }">
                <el-input-number v-model="row.seats" size="small" :min="0" :max="20" controls-position="right" placeholder="按⑤" />
              </template>
            </el-table-column>
            <el-table-column label="必选" width="64" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.required" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="" width="56" align="center">
              <template #default="{ $index }">
                <el-button link type="danger" @click="removeSlot($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="form-hint block-hint">
            净工时 = 止 − 起 − 休息（行政班 09:00–18:00 休息 60 分 = 8h）。时段来源选营业时段 / 时段需求时，起止由门店侧决定，策略只定名称、名额与必选。
            名额留空 = 按 ⑤ 算，填了以填的为准（1 人店全天班 12:00–22:00 就是一条时段）。
          </div>
        </el-form>
      </el-card>

      <!-- ⑤ 名额规则 -->
      <el-card shadow="never" class="slot-card">
        <template #header>⑤ 名额规则（只作用于④里名额留空的时段）</template>
        <el-form label-width="88px" size="default">
          <el-form-item label="名额算法">
            <el-select v-model="form.quota.algo" style="width: 100%">
              <el-option v-for="a in quotaAlgos" :key="a.value" :label="a.label" :value="a.value" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="form.quota.algo === 'slot-fixed'" label=" ">
            <span class="form-hint">不套算法：名额全部在 ④ 的时段上逐个填</span>
          </el-form-item>

          <template v-else-if="form.quota.algo === 'establishment'">
            <el-form-item label="编制来源">
              <el-select v-model="form.quota.estSource" style="width: 200px">
                <el-option v-for="s in estSources" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
            <el-form-item label="缺员释放">
              <el-switch v-model="form.quota.releaseWhenVacant" />
              <span class="form-hint">{{ form.quota.releaseWhenVacant ? '有缺员时按空位释放名额' : '缺员不释放名额' }}</span>
            </el-form-item>
          </template>

          <template v-else-if="form.quota.algo === 'workload'">
            <el-form-item label="业务指标">
              <el-select v-model="form.quota.metric" style="width: 200px">
                <el-option v-for="m in workloadMetrics" :key="m" :label="m" :value="m" />
              </el-select>
            </el-form-item>
            <el-form-item label="统计口径">
              <el-select v-model="form.quota.window" style="width: 220px">
                <el-option v-for="w in workloadWindows" :key="w" :label="w" :value="w" />
              </el-select>
            </el-form-item>
            <el-form-item v-for="(th, i) in form.quota.thresholds" :key="i" :label="`档位 ${i + 1}`">
              <span class="form-hint">低于</span>
              <el-input-number v-model="th.value" :min="0" controls-position="right" style="width: 110px; margin: 0 6px" />
              <span class="form-hint">释放</span>
              <el-input-number v-model="th.release" :min="0" controls-position="right" style="width: 90px; margin: 0 6px" />
              <span class="form-hint">个名额</span>
              <el-button link type="danger" style="margin-left: 8px" @click="form.quota.thresholds.splice(i, 1)">删除</el-button>
            </el-form-item>
            <el-form-item label=" ">
              <el-button size="small" @click="form.quota.thresholds.push({ value: 0, release: 1 })">添加档位</el-button>
              <span class="form-hint">从上往下第一条命中生效；不低于最高档 = 全量释放</span>
            </el-form-item>
          </template>

          <template v-else-if="form.quota.algo === 'ratio'">
            <el-form-item label="名额基数">
              <el-select v-model="form.quota.base" style="width: 220px">
                <el-option v-for="b in ratioBases" :key="b" :label="b" :value="b" />
              </el-select>
            </el-form-item>
            <el-form-item label="除数">
              <span class="form-hint">基数 ÷</span>
              <el-input-number v-model="form.quota.divisor" :min="1" controls-position="right" style="width: 90px; margin-left: 6px" />
            </el-form-item>
            <el-form-item label="取整">
              <el-select v-model="form.quota.rounding" style="width: 140px">
                <el-option v-for="r in roundings" :key="r" :label="r" :value="r" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="form.quota.secondary" label="常规名额">
              <span class="form-hint">按</span>
              <el-input v-model="form.quota.secondary.base" style="width: 140px; margin: 0 6px" />
              <span class="form-hint">每 1 份释放</span>
              <el-input-number v-model="form.quota.secondary.per" :min="1" controls-position="right" style="width: 80px; margin-left: 6px" />
              <span class="form-hint">个名额</span>
              <el-button link type="danger" style="margin-left: 8px" @click="form.quota.secondary = null">移除</el-button>
            </el-form-item>
            <el-form-item v-else label=" ">
              <el-button size="small" @click="form.quota.secondary = { base: '传位数', per: 1 }">添加常规名额规则</el-button>
            </el-form-item>
          </template>

          <template v-else-if="form.quota.algo === 'headcount-form'">
            <el-form-item v-for="(f, i) in form.quota.forms" :key="i" :label="`形态 ${i + 1}`">
              <span class="form-hint">配置</span>
              <el-input-number v-model="f.headcount" :min="1" :max="10" controls-position="right" style="width: 90px; margin: 0 6px" />
              <span class="form-hint">人 →</span>
              <el-select v-model="f.combo" multiple style="width: 240px; margin-left: 6px" placeholder="选择时段组合">
                <el-option v-for="n in slotNames" :key="n" :label="n" :value="n" />
              </el-select>
              <el-button link type="danger" style="margin-left: 8px" @click="form.quota.forms.splice(i, 1)">删除</el-button>
            </el-form-item>
            <el-form-item label=" ">
              <el-button size="small" @click="form.quota.forms.push({ headcount: 2, combo: [] })">添加形态</el-button>
              <span class="form-hint">时段组合来自 ④；缺岗派生形态（长班/通班）在 ⑧ 配置</span>
            </el-form-item>
          </template>

          <el-form-item label="名额钳制">
            <span class="form-hint">每时段最少</span>
            <el-input-number v-model="form.quota.clamp.min" :min="0" :max="20" controls-position="right" style="width: 88px; margin: 0 6px" />
            <span class="form-hint">最多</span>
            <el-input-number v-model="form.quota.clamp.max" :min="0" :max="20" controls-position="right" style="width: 88px; margin: 0 6px" />
            <span class="form-hint">个（算法算出超限即钳住）</span>
          </el-form-item>

          <el-form-item label="名额试算">
            <template v-if="tryable">
              <span class="form-hint">{{ tryLabel }}</span>
              <el-input-number v-model="tryValue" :min="0" controls-position="right" style="width: 120px; margin: 0 6px" />
              <span v-if="tryResult" class="try-result">
                释放 <strong>{{ tryResult.released }}</strong> 个
                <span class="form-hint">（原始 {{ tryResult.raw }}{{ tryResult.clamped ? '，已被钳制' : '' }} · {{ tryResult.basis }}）</span>
              </span>
              <span v-else class="form-hint">填一个门店的指标值即可看到会释放几个名额</span>
            </template>
            <span v-else class="form-hint">该算法不试算：名额直接写在 ④ 的时段上，或由配置人数形态决定</span>
          </el-form-item>

          <el-form-item label="个人模式">
            <el-switch v-model="form.quota.personalMode" />
            <span class="form-hint">可单独针对个人挂一套覆盖配置</span>
          </el-form-item>
          <el-form-item label="生成后可改">
            <el-switch v-model="form.quota.editable" active-text="名额可手改" />
            <span class="form-hint">{{ form.quota.editable ? '手改后立即生效' : '名额锁定，只能改策略' }}</span>
          </el-form-item>
          <el-form-item v-if="form.quota.editable" label="手改幅度">
            <span class="form-hint">允许 ±</span>
            <el-input-number v-model="form.quota.adjustRange" :min="0" :max="20" controls-position="right" style="width: 90px; margin: 0 6px" />
            <span class="form-hint">个（改动留痕：谁改、何时、原因）</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- ⑥ 承接顺位 -->
      <el-card shadow="never" class="slot-card slot-wide">
        <template #header>
          <div class="card-head-row">
            <span>⑥ 承接顺位（有序档位：哪个时段先给谁，第 1 顺位没接谁顶上）</span>
            <el-button size="small" plain type="primary" @click="addTier">添加顺位</el-button>
          </div>
        </template>
        <el-table :data="form.tiers" border size="small" empty-text="还没有承接顺位">
          <el-table-column label="#" width="48" align="center">
            <template #default="{ $index }">{{ $index + 1 }}</template>
          </el-table-column>
          <el-table-column label="承接人群" width="170">
            <template #default="{ row }">
              <el-select v-model="row.crowd" size="small" filterable>
                <el-option v-for="c in crowdOptions" :key="c" :label="c" :value="c" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="承接方式" width="140">
            <template #default="{ row }">
              <el-select v-model="row.method" size="small" @change="onMethodChange(row)">
                <el-option v-for="m in takeoverMethods" :key="m.value" :label="m.label" :value="m.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="细分规则" width="170">
            <template #default="{ row }">
              <el-select v-model="row.rule" size="small">
                <el-option v-for="r in methodRules[row.method] || []" :key="r" :label="r" :value="r" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="适用时段" min-width="210">
            <template #default="{ row }">
              <el-select v-model="row.slots" multiple size="small" placeholder="全部时段">
                <el-option v-for="n in slotNames" :key="n" :label="n" :value="n" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="开放起点" width="170">
            <template #default="{ row }">
              <el-select v-model="row.openFrom" size="small" :disabled="row.method === 'assign'">
                <el-option v-for="o in openFroms" :key="o" :label="o" :value="o" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="名额" width="96">
            <template #default="{ row }">
              <el-input-number v-model="row.seats" size="small" :min="0" :max="20" controls-position="right" placeholder="继承" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130">
            <template #default="{ $index }">
              <el-button link :disabled="$index === 0" @click="moveTier($index, -1)">上移</el-button>
              <el-button link :disabled="$index === form.tiers.length - 1" @click="moveTier($index, 1)">下移</el-button>
              <el-button link type="danger" @click="form.tiers.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="tier-footer">
          <div class="no-taker">
            <span class="form-hint">所有顺位都没人接 →</span>
            <el-select v-model="form.noTaker" size="small" style="width: 170px">
              <el-option v-for="n in noTakerActions" :key="n" :label="n" :value="n" />
            </el-select>
            <span class="form-hint">（⑦ 优先级只作用于「自选 / 自选+审核」档位的排序）</span>
          </div>
        </div>
      </el-card>

      <!-- ⑦ 优先级 -->
      <el-card shadow="never" class="slot-card">
        <template #header>⑦ 优先级（有序规则，从上到下依次比较）</template>
        <el-form label-width="88px" size="default">
          <el-form-item label="启用优先级">
            <el-switch v-model="form.priority.enabled" />
            <span class="form-hint">{{ form.priority.enabled ? '自选/审核档位按下列规则排序' : '无排序（先到先得或倒班即公平）' }}</span>
          </el-form-item>
          <template v-if="form.priority.enabled">
            <el-form-item v-for="(rule, i) in form.priority.rules" :key="i" :label="`第 ${i + 1} 条`">
              <div class="priority-rule">
                <div class="rule-row">
                  <el-select v-model="rule.kind" style="width: 180px">
                    <el-option v-for="k in priorityKinds" :key="k.value" :label="k.label" :value="k.value" />
                  </el-select>
                  <el-select v-if="rule.kind === 'metric'" v-model="rule.metric" style="width: 120px; margin-left: 8px">
                    <el-option v-for="m in priorityMetrics" :key="m" :label="m" :value="m" />
                  </el-select>
                  <el-select v-if="rule.kind !== 'first-come'" v-model="rule.dir" style="width: 160px; margin-left: 8px">
                    <el-option v-for="d in priorityDirs" :key="d.value" :label="d.label" :value="d.value" />
                  </el-select>
                </div>
                <div v-if="rule.kind === 'composite'" class="rule-parts">
                  <div v-for="(p, j) in rule.parts" :key="j" class="part-row">
                    <el-select v-model="p.metric" style="width: 110px">
                      <el-option v-for="m in priorityMetrics" :key="m" :label="m" :value="m" />
                    </el-select>
                    <span class="form-hint">权重</span>
                    <el-input-number v-model="p.weight" :min="0" :max="100" controls-position="right" style="width: 90px" />
                    <span class="form-hint">%</span>
                    <el-button link type="danger" @click="rule.parts.splice(j, 1)">移除</el-button>
                  </div>
                  <el-button size="small" link type="primary" @click="rule.parts.push({ metric: '回头率', weight: 10 })">+ 指标</el-button>
                  <span class="form-hint">合计 {{ partsSum(rule) }}%</span>
                </div>
                <div class="rule-row">
                  <span class="form-hint">打平进入下一条；本条为末档时：</span>
                  <el-select v-model="rule.tail" style="width: 130px">
                    <el-option v-for="t in tailActions" :key="t.value" :label="t.label" :value="t.value" />
                  </el-select>
                </div>
                <div class="rule-ops">
                  <el-button link :disabled="i === 0" @click="moveRule(i, -1)">上移</el-button>
                  <el-button link :disabled="i === form.priority.rules.length - 1" @click="moveRule(i, 1)">下移</el-button>
                  <el-button link type="danger" @click="form.priority.rules.splice(i, 1)">删除</el-button>
                </div>
              </div>
            </el-form-item>
            <el-form-item label=" ">
              <el-button size="small" @click="addRule">添加规则</el-button>
              <span class="form-hint">同「分配策略」的有序档位：前一条打平才看下一条</span>
            </el-form-item>
          </template>
        </el-form>
      </el-card>

      <!-- ⑧ 缺口响应 -->
      <el-card shadow="never" class="slot-card slot-wide">
        <template #header>
          <div class="card-head-row">
            <span>⑧ 缺口响应（缺口类型 → 处置动作 → 动作参数）</span>
            <el-button size="small" type="primary" plain @click="addGapRule">添加一行</el-button>
          </div>
        </template>
        <el-table :data="form.gapRules" border size="default" empty-text="该岗位缺口不处理（如产品经理请假不补人）">
          <el-table-column label="缺口类型" width="130">
            <template #default="{ row }">
              <el-select v-model="row.gapType">
                <el-option v-for="g in gapTypes" :key="g" :label="g" :value="g" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="处置动作" width="140">
            <template #default="{ row }">
              <el-select v-model="row.action">
                <el-option v-for="a in gapActions" :key="a.value" :label="a.label" :value="a.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="动作参数" min-width="330">
            <template #default="{ row }">
              <div v-if="row.action === 'substitute'" class="gap-params">
                <el-select v-model="row.crowd" style="width: 170px" placeholder="补位人群">
                  <el-option v-for="c in substituteCrowds" :key="c" :label="c" :value="c" />
                </el-select>
                <el-select v-model="row.order" style="width: 130px" placeholder="顺位">
                  <el-option v-for="o in substituteOrders" :key="o" :label="o" :value="o" />
                </el-select>
                <el-select v-model="row.noGap" style="width: 150px" placeholder="无缺时">
                  <el-option v-for="n in noGapActions" :key="n" :label="n" :value="n" />
                </el-select>
              </div>
              <el-select v-else-if="row.action === 'reshape'" v-model="row.reshapeResult" style="width: 260px">
                <el-option v-for="r in reshapeResults" :key="r" :label="r" :value="r" />
              </el-select>
              <span v-else class="form-hint">—</span>
            </template>
          </el-table-column>
          <el-table-column label="口径说明" min-width="180">
            <template #default="{ row }">
              <el-input v-model="row.note" placeholder="补充口径（可留空）" />
            </template>
          </el-table-column>
          <el-table-column label="" width="60" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" @click="form.gapRules.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- ⑨ 兜底动作 -->
      <el-card shadow="never" class="slot-card">
        <template #header>⑨ 兜底动作</template>
        <el-form label-width="88px" size="default">
          <el-form-item label="兜底动作">
            <el-select v-model="form.fallback" style="width: 100%">
              <el-option v-for="f in fallbacks" :key="f" :label="f" :value="f" />
            </el-select>
          </el-form-item>
          <el-form-item label=" ">
            <span class="form-hint">顺位落空、缺口响应都走完之后，这一档排班怎么收尾</span>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- ⑩ 工时约束 -->
      <el-card shadow="never" class="slot-card slot-wide">
        <template #header>
          <div class="card-head-row">
            <span>⑩ 工时约束（人一天 / 一周最多能干多久，生成与承接时校验）</span>
            <el-button size="small" plain type="primary" @click="addWorkHour">添加约束</el-button>
          </div>
        </template>
        <el-table :data="form.workHours" border size="small" empty-text="不设上限">
          <el-table-column label="维度" width="170">
            <template #default="{ row }">
              <el-select v-model="row.dim" size="small">
                <el-option v-for="d in workHourDims" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="上限（小时）" width="150">
            <template #default="{ row }">
              <el-input-number v-model="row.limit" size="small" :min="0" :max="200" :step="0.5" controls-position="right" style="width: 110px" />
            </template>
          </el-table-column>
          <el-table-column label="计入口径" width="150">
            <template #default="{ row }">
              <el-select v-model="row.basis" size="small">
                <el-option v-for="b in workHourBasis" :key="b.value" :label="b.label" :value="b.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="超限处置" width="200">
            <template #default="{ row }">
              <el-select v-model="row.onExceed" size="small">
                <el-option v-for="a in exceedActions" :key="a.value" :label="a.label" :value="a.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="" width="60" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" @click="form.workHours.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="form-hint block-hint">
          同一张表两种取值：非全 = 单店单日 4h、单周 24h、硬拦（可去别的门店，但这家当天不能再排）；办公岗 = 单店单日 8h、超出计为加班。
          判定发生在生成与承接那一刻 —— 列表可见，点承接才拦并给原因。
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import {
  POSITIONS, COOPERATIONS, SCOPE_LEVELS, ORG_CITIES, ORG_STORES, ORG_PEOPLE,
  TRIGGER_TYPES, CRON_FREQS, WEEKDAYS, EVENT_OPTIONS, AHEAD_UNITS, SPANS,
  cronOf, cronSummary, scopeSummary, TIME_SOURCES, slotNetHours,
  QUOTA_ALGOS, EST_SOURCES, WORKLOAD_METRICS, WORKLOAD_WINDOWS, RATIO_BASES, ROUNDINGS,
  simulateRelease,
  CROWD_OPTIONS, TAKEOVER_METHODS, METHOD_RULES, OPEN_FROMS, NO_TAKER_ACTIONS,
  PRIORITY_KINDS, PRIORITY_METRICS, PRIORITY_DIRS, TAIL_ACTIONS,
  GAP_TYPES, GAP_ACTIONS, SUBSTITUTE_CROWDS, SUBSTITUTE_ORDERS, NOGAP_ACTIONS,
  RESHAPE_RESULTS, FALLBACKS,
  WORK_HOUR_DIMS, WORK_HOUR_BASIS, EXCEED_ACTIONS
} from '../mock/scheduleStrategies.js'
import { findStrategy, nowText } from '../mock/scheduleStrategyStore.js'

const route = useRoute()
const router = useRouter()

const positions = POSITIONS
const cooperations = COOPERATIONS
const scopeLevels = SCOPE_LEVELS
const orgCities = ORG_CITIES
const orgPeople = ORG_PEOPLE
const triggerTypes = TRIGGER_TYPES
const cronFreqs = CRON_FREQS
const weekdays = WEEKDAYS
const eventOptions = EVENT_OPTIONS
const aheadUnits = AHEAD_UNITS
const spans = SPANS
const timeSources = TIME_SOURCES
const quotaAlgos = QUOTA_ALGOS
const estSources = EST_SOURCES
const workloadMetrics = WORKLOAD_METRICS
const workloadWindows = WORKLOAD_WINDOWS
const ratioBases = RATIO_BASES
const roundings = ROUNDINGS
const crowdOptions = CROWD_OPTIONS
const takeoverMethods = TAKEOVER_METHODS
const methodRules = METHOD_RULES
const openFroms = OPEN_FROMS
const noTakerActions = NO_TAKER_ACTIONS
const priorityKinds = PRIORITY_KINDS
const priorityMetrics = PRIORITY_METRICS
const priorityDirs = PRIORITY_DIRS
const tailActions = TAIL_ACTIONS
const gapTypes = GAP_TYPES
const gapActions = GAP_ACTIONS
const substituteCrowds = SUBSTITUTE_CROWDS
const substituteOrders = SUBSTITUTE_ORDERS
const noGapActions = NOGAP_ACTIONS
const reshapeResults = RESHAPE_RESULTS
const fallbacks = FALLBACKS
const workHourDims = WORK_HOUR_DIMS
const workHourBasis = WORK_HOUR_BASIS
const exceedActions = EXCEED_ACTIONS

const emptyTrigger = () => ({ type: 'cron', freq: 'weekly', weekdays: [], time: '09:00', monthDay: 1, month: 1, monthDayYear: 1, events: [], manualAllowed: false, span: '月', ahead: { count: 1, unit: '月' } })

const form = reactive({
  id: '', name: '', enabled: false,
  position: '', cooperation: '', scopeLevel: 'global',
  scopeTargets: { cities: [], stores: [], people: [] },
  scopeDesc: '',
  trigger: emptyTrigger(),
  shiftStructure: { timeSource: 'fixed', slots: [] },
  quota: { algo: 'establishment', editable: false, personalMode: false, thresholds: [], forms: [], clamp: { min: 0, max: 10 }, adjustRange: null },
  tiers: [],
  noTaker: '不做处理',
  priority: { enabled: false, rules: [] },
  gapRules: [],
  fallback: '无',
  workHours: [],
  updatedAt: ''
})

const dirty = ref(false)
let loading = false

const load = () => {
  const src = findStrategy(route.params.id)
  if (!src) {
    ElMessage.error('策略不存在')
    router.replace({ name: 'schedule-strategy' })
    return
  }
  loading = true
  Object.assign(form, JSON.parse(JSON.stringify(src)))
  // 槽位对象整体替换并补齐缺省字段，避免残留上一条的引用或读空
  const t = src.trigger || {}
  form.trigger = { ...emptyTrigger(), ...t, ahead: { ...emptyTrigger().ahead, ...(t.ahead || {}) } }
  form.scopeTargets = { cities: [], stores: [], people: [], ...(JSON.parse(JSON.stringify(src.scopeTargets || {}))) }
  form.shiftStructure = { timeSource: 'fixed', slots: [], ...JSON.parse(JSON.stringify(src.shiftStructure || {})) }
  form.shiftStructure.slots = (form.shiftStructure.slots || []).map(x => ({ breakMin: 0, seats: null, required: false, ...x }))
  form.quota = { personalMode: false, thresholds: [], forms: [], adjustRange: null, clamp: { min: 0, max: 10 }, ...JSON.parse(JSON.stringify(src.quota || {})) }
  if (!form.quota.clamp) form.quota.clamp = { min: 0, max: 10 }
  form.tiers = (src.tiers || []).map(r => ({ ...r, slots: [...(r.slots || [])] }))
  form.priority = { enabled: false, rules: [], ...JSON.parse(JSON.stringify(src.priority || {})) }
  form.gapRules = (src.gapRules || []).map(r => ({ ...r }))
  form.workHours = (src.workHours || []).map(r => ({ ...r }))
  tryValue.value = defaultTryValue()
  slotNameSnapshot.value = (form.shiftStructure.slots || []).map(s => s.name)
  loading = false
}

watch(form, () => { if (!loading) dirty.value = true }, { deep: true })

/* ---- ② 生效范围 ---- */
const storesByCity = computed(() => orgCities
  .map(city => ({ city, list: ORG_STORES.filter(s => s.city === city) }))
  .filter(g => g.list.length))

/* ---- ③ cron 预览 ---- */
const cronExpr = computed(() => cronOf(form.trigger))
const cronText = computed(() => cronSummary(form.trigger))
const aheadText = computed(() => {
  const a = form.trigger.ahead || {}
  return a.unit === '周' ? `即第 n+${a.count} 周` : a.unit === '月' ? `即往后第 ${a.count} 个月` : `即往后第 ${a.count} 天`
})

/* ---- ④ 时段 ---- */
const timeFixed = computed(() => form.shiftStructure.timeSource === 'fixed')
const timePlaceholder = computed(() => (form.shiftStructure.timeSource === 'store' ? '按门店' : '按需求'))
const slotNames = computed(() => (form.shiftStructure.slots || []).map(s => s.name).filter(Boolean))
const addSlot = () => form.shiftStructure.slots.push({ name: '', start: '', end: '', breakMin: 0, seats: null, required: false })
// 时段改名时，顺位里对它的引用同步改名，避免悬空
const slotNameSnapshot = ref([])
watch(() => (form.shiftStructure.slots || []).map(s => s.name), (names) => {
  if (loading) { slotNameSnapshot.value = [...names]; return }
  const prev = slotNameSnapshot.value
  names.forEach((n, i) => {
    const old = prev[i]
    if (old && n !== old) form.tiers.forEach(t => { t.slots = (t.slots || []).map(x => (x === old ? n : x)) })
  })
  slotNameSnapshot.value = [...names]
})
const removeSlot = (i) => {
  const name = form.shiftStructure.slots[i]?.name
  form.shiftStructure.slots.splice(i, 1)
  if (!name) return
  // 时段删了，顺位里对它的引用也要摘掉，避免悬空
  form.tiers.forEach(t => { t.slots = (t.slots || []).filter(n => n !== name) })
}

/* ---- ⑤ 名额试算 ---- */
const tryable = computed(() => ['workload', 'ratio', 'establishment'].includes(form.quota.algo))
const tryLabel = computed(() => {
  if (form.quota.algo === 'workload') return `取一个门店的「${form.quota.metric || '业务指标'}」`
  if (form.quota.algo === 'ratio') return `取一个门店的「${form.quota.base || '名额基数'}」`
  return '取编制缺口人数'
})
const defaultTryValue = () => (form.quota.algo === 'workload' ? 500 : form.quota.algo === 'ratio' ? 6 : 2)
const tryValue = ref(500)
const tryResult = computed(() => (tryable.value ? simulateRelease(form.quota, tryValue.value) : null))
watch(() => form.quota.algo, (a) => {
  if (loading) return
  tryValue.value = a === 'workload' ? 500 : a === 'ratio' ? 6 : 2
})

/* ---- ⑩ 工时约束 ---- */
const addWorkHour = () => form.workHours.push({ dim: 'store-day', limit: 8, basis: 'net', onExceed: 'overtime' })

/* ---- ⑥ 承接顺位 ---- */
const addTier = () => form.tiers.push({ crowd: '本店全职客户经理', method: 'assign', rule: '按上周倒班轮转', slots: [], openFrom: '立即', seats: null })
const onMethodChange = (row) => {
  const list = methodRules[row.method] || []
  row.rule = list[0] || ''
  row.openFrom = row.method === 'assign' ? '立即' : '发布即可见'
}
const moveTier = (i, delta) => {
  const target = i + delta
  if (target < 0 || target >= form.tiers.length) return
  ;[form.tiers[i], form.tiers[target]] = [form.tiers[target], form.tiers[i]]
}

/* ---- ⑦ 优先级规则 ---- */
const partsSum = (rule) => (rule.parts || []).reduce((acc, p) => acc + (Number(p.weight) || 0), 0)
const moveRule = (i, delta) => {
  const rules = form.priority.rules
  const target = i + delta
  if (target < 0 || target >= rules.length) return
  ;[rules[i], rules[target]] = [rules[target], rules[i]]
}
const addRule = () => form.priority.rules.push({ kind: 'metric', metric: '综合评分', dir: 'desc', tail: 'none', parts: [] })

const addGapRule = () => {
  form.gapRules.push({ gapType: '临时休假', action: 'none', crowd: '', order: '', noGap: '', reshapeResult: '', note: '' })
}

const goBack = () => router.push({ name: 'schedule-strategy' })

const onSave = () => {
  const src = findStrategy(form.id)
  if (!src) return
  if (!form.name.trim()) return ElMessage.warning('策略名称不能为空')
  if (form.scopeLevel !== 'global') {
    const t = form.scopeTargets
    const picked = form.scopeLevel === 'city' ? t.cities : form.scopeLevel === 'store' ? t.stores : t.people
    if (!(picked || []).length) return ElMessage.warning('选择范围层级后要指定具体对象')
  }
  if (form.trigger.type === 'cron') {
    if (!form.trigger.time) return ElMessage.warning('定时触发需要选择时刻')
    if (form.trigger.freq === 'weekly' && !(form.trigger.weekdays || []).length) return ElMessage.warning('每周触发需要勾选星期')
  }
  if (form.trigger.type === 'event' && !(form.trigger.events || []).length) return ElMessage.warning('业务事件触发需要至少选择一个事件')
  // ④ 时段：名称必填唯一；固定时刻必须给出起止且净工时 > 0
  const slots = form.shiftStructure.slots || []
  const names = slots.map(s => (s.name || '').trim())
  if (names.some(n => !n)) return ElMessage.warning('时段名称不能为空')
  if (new Set(names).size !== names.length) return ElMessage.warning('时段名称不能重复')
  if (form.shiftStructure.timeSource === 'fixed') {
    const bad = slots.find(s => { const h = slotNetHours(s); return h === null || h <= 0 })
    if (bad) return ElMessage.warning(`固定时刻的时段要填起止且净工时大于 0：${bad.name || '未命名时段'}`)
  }
  // ⑤ 钳制
  const clamp = form.quota.clamp || {}
  if (Number(clamp.min) > Number(clamp.max)) return ElMessage.warning('名额钳制的下限不能大于上限')
  // ⑥ 顺位不能引用已删除/已改名的时段
  if (form.tiers.some(t => (t.slots || []).some(n => !names.includes(n)))) {
    return ElMessage.warning('承接顺位里引用了不存在的时段，请重新选择适用时段')
  }
  // ⑩ 工时约束
  if ((form.workHours || []).some(w => !w.limit || Number(w.limit) <= 0)) return ElMessage.warning('工时约束的上限要大于 0')
  if (form.priority.enabled && form.priority.rules.some(r => r.kind === 'composite' && partsSum(r) !== 100)) {
    return ElMessage.warning('综合分各指标的权重合计应为 100%')
  }
  Object.assign(src, JSON.parse(JSON.stringify(form)), { updatedAt: nowText() })
  dirty.value = false
  ElMessage.success('已保存（本期仅存定义，不影响现有排班）')
}

onBeforeRouteLeave(async () => {
  if (!dirty.value) return true
  try {
    await ElMessageBox.confirm('有未保存的修改，离开将丢失。确定离开？', '未保存提醒', {
      confirmButtonText: '离开', cancelButtonText: '留在本页', type: 'warning'
    })
    return true
  } catch { return false }
})

onMounted(load)
</script>

<style scoped>
.schedule-strategy-detail {
  padding: 16px;
}
.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.head-title {
  font-size: 17px;
  font-weight: 500;
}
.head-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}
.top-tip {
  margin-bottom: 12px;
}
.slot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.slot-card :deep(.el-card__header) {
  font-weight: 500;
  padding: 10px 16px;
}
.slot-wide {
  grid-column: 1 / -1;
}
.card-head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.form-hint {
  color: #999;
  font-size: 12px;
}
.block-hint {
  margin-top: 8px;
  line-height: 1.6;
}
.cron-preview {
  font-family: Menlo, Consolas, monospace;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 13px;
}
.priority-rule {
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rule-row {
  display: flex;
  align-items: center;
}
.rule-parts {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: #fafbfc;
  border-radius: 4px;
}
.part-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.rule-ops {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}
.gap-params {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.net-hours {
  font-weight: 500;
  color: #a40035;
}
.try-result {
  font-size: 13px;
}
.tier-footer {
  margin-top: 10px;
}
.no-taker {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
