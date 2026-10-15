<template>
  <DocShell
    :toc-items="tocItems"
    title="假勤重构 · 设计总览"
    subtitle="底座是员工时间线。假勤只负责「假」的规则与「勤」的比对，钱的后果交给薪酬，长假的结论交给员工福利。"
    version="预研稿 v2.2"
    date="2026-10-12"
    :breadcrumbs="breadcrumbs"
  >
    <!-- 性质声明：这不是结论 -->
    <div class="note" style="background: hsl(45 93% 47% / 0.08); border-left: 3px solid hsl(45 93% 47%); margin-bottom: 20px;">
      <strong>性质说明：本页是预研探路稿，不是正式结论。</strong>
      内容来自「先做一点看看」的推演，用于内部讨论和与相关方（员工时间线 / 打卡组）对齐口径；
      不作为需求基线、排期依据或对外承诺。文中「已确立」「核心模型」等表述均指<strong>本次推演的内部前提</strong>，随时可被推翻。
    </div>

    <!-- ========== 一、定位与边界 ========== -->
    <div id="lr-scope" class="section">
      <div class="section-header">
        <h2>一、定位与边界</h2>
        <DocCopyButton section-id="lr-scope" />
      </div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
        <strong>一句话定位：</strong>假勤系统不再是「假勤全流程的主人」，而是员工时间线的两个写入方之一（另一个是排班），同时向下喂薪酬、向员工福利输出长假结论。
      </div>

      <p class="doc-p">
        现有 6 个假勤原型（排班排假审核、临时假获取规则、客户经理请假扣款、顶班补贴、自主下线、移动端排班排假）一律视为<strong>可被推翻的旧设计</strong>，不再沿用其建模方式。旧设计的根本问题是坐标选错了：它把一切挂在「门店 × 日期」的名额上（供给侧视角），而时间线要求坐标换成「人 × 时间」（事实归属视角）。
      </p>

      <h3>四条设计前提</h3>
      <div class="lr-principles">
        <div class="lr-principle" v-for="p in principles" :key="p.title">
          <div class="lr-principle-title">{{ p.title }}</div>
          <div class="lr-principle-desc">{{ p.desc }}</div>
        </div>
      </div>

      <h3>四邻关系</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 140px;">相邻系统</th>
            <th style="width: 150px;">关系方向</th>
            <th>我们交付什么 / 我们依赖什么</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>员工时间线</strong>（人事组）</td>
            <td>写入 + 读取</td>
            <td>写入「排他占位事件」（排班 / 请假），读取冲突。粒度、排他判定方、审批中间态是否占位均<strong>待与对方组对齐</strong></td>
          </tr>
          <tr>
            <td><strong>打卡组</strong></td>
            <td>读取</td>
            <td>读取实际层事实（上下班打卡）。需确认给的是原始时刻还是仅「有效 / 无效」</td>
          </tr>
          <tr>
            <td><strong>薪酬</strong></td>
            <td>单向输出</td>
            <td>只出事实（缺勤天数 + 假种 + 起止），<strong>不下发金额</strong>；日标准工资基数属薪酬域，假勤不持有</td>
          </tr>
          <tr>
            <td><strong>员工福利</strong></td>
            <td>单向输出</td>
            <td>只出判定结论（是否达长假、建议处理方式）；社保公积金个人部分的处理方式由福利侧决定</td>
          </tr>
        </tbody>
      </table>

      <p class="doc-p">
        边界可以压成一句话：<strong>假勤只负责「谁在哪段时间被占了」以及「这段占用合不合规」</strong>，不负责「占了要扣多少钱」，也不负责「占了之后社保怎么算」。
      </p>
    </div>

    <!-- ========== 二、七个核心模型 ========== -->
    <div id="lr-models" class="section">
      <div class="section-header">
        <h2>二、七个核心模型</h2>
        <DocCopyButton section-id="lr-models" />
      </div>
      <p class="doc-p">
        推演时先把这七条假设固定下来，好让后面的页面和接口有个共同说法。它们是<strong>本次推演的临时前提，不是已定结论</strong>——页面可以推翻重画，这七条同样可以，只要先有新的替代说法。
      </p>
      <div class="lr-model-grid">
        <div class="lr-model" v-for="m in reformModels" :key="m.id">
          <div class="lr-model-top">
            <span class="lr-model-id">{{ m.id }}</span>
            <span class="lr-model-name">{{ m.name }}</span>
          </div>
          <p class="lr-model-brief">{{ m.brief }}</p>
          <span class="lr-model-owner">{{ m.owner }}</span>
        </div>
      </div>

      <h3>最容易做错的两处</h3>
      <ul class="lr-list">
        <li>
          <strong>把「名额」和「额度」当同一种东西</strong>——旧设计只有名额没有额度，于是员工永远不知道自己「还剩几天」。名额是组织容量（周期生成、共享、会被抢），额度是个人可休量（私有、只减不增），两条约束都要过，请假才算成立。
        </li>
        <li>
          <strong>把「长假」当事件而不是状态</strong>——时间线上的是事件（某段被占），给员工福利的却是<strong>结论</strong>（自 D1 起处于无薪长假状态，预计至 D2）。它是持续为真的状态，还带一个未决分支（个人部分走主动打款 or 挂账、复工后扣回），必须能被「复工」终止。
        </li>
      </ul>
    </div>

    <!-- ========== 三、文档结构规划 ========== -->
    <div id="lr-catalog" class="section">
      <div class="section-header">
        <h2>三、文档结构规划</h2>
        <DocCopyButton section-id="lr-catalog" />
      </div>
      <p class="doc-p">
        本模块计划固定为八个板块。其中<strong>板块 1、2、5 必须先落</strong>——概念与接口不定，页面画了必返工。
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 56px;">序号</th>
            <th style="width: 170px;">板块</th>
            <th>要写清楚的东西</th>
            <th style="width: 96px;">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td><strong>领域总览</strong></td>
            <td>定位与边界、四邻关系、概念地图 —— 即本页</td>
            <td><el-tag size="small" effect="plain" type="success">本页已含</el-tag></td>
          </tr>
          <tr>
            <td>2</td>
            <td><strong>核心模型</strong></td>
            <td>七个模型逐一展开：时间线占位与排他、三层事实、名额 vs 额度、配置双通道、分层继承与覆盖、薪酬结构分流、事实与结论</td>
            <td><el-tag size="small" effect="plain" type="success">本页已含</el-tag></td>
          </tr>
          <tr>
            <td>3</td>
            <td>业务流程</td>
            <td>请假全流程（额度校验 → 申请 → 审核分流 → 占位替换 → 后果分发 → 销假冲回）、名额周期生成、考勤比对、长假闭环</td>
            <td><el-tag size="small" effect="plain" type="info">待建</el-tag></td>
          </tr>
          <tr>
            <td>4</td>
            <td>规则手册</td>
            <td>假种规则表、额度规则（含业绩折算公式与可解释性）、审核规则与<strong>覆盖语义</strong>、后果规则、名额规则 —— 每条对应到配置页</td>
            <td><el-tag size="small" effect="plain" type="info">待建</el-tag></td>
          </tr>
          <tr class="lr-row-key">
            <td>5</td>
            <td><strong>跨系统接口</strong></td>
            <td>与时间线 / 打卡组 / 薪酬 / 员工福利的字段契约；含<strong>能力登记表</strong>（哪些能力是别人的、我们能改到什么程度）</td>
            <td><el-tag size="small" effect="plain" type="warning">最卡脖子</el-tag></td>
          </tr>
          <tr>
            <td>6</td>
            <td>数据与状态</td>
            <td>单据状态机、额度生命周期（发放/消耗/结转/清零/过期）、配置时间版本化、配置变更审计、名额周期分区</td>
            <td><el-tag size="small" effect="plain" type="info">待建</el-tag></td>
          </tr>
          <tr>
            <td>7</td>
            <td>与旧设计的关系</td>
            <td>六个老原型的逐个处置表（保留 / 重构 / 废弃），老概念（班次、假别、名额、日期类型）在新模型里的归位</td>
            <td><el-tag size="small" effect="plain" type="info">待建</el-tag></td>
          </tr>
          <tr>
            <td>8</td>
            <td>待决事项</td>
            <td>13 条待定项，每条标明责任方 —— 见本页第七节</td>
            <td><el-tag size="small" effect="plain" type="success">本页已含</el-tag></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ========== 四、交付形态与可配置度 ========== -->
    <div id="lr-delivery" class="section">
      <div class="section-header">
        <h2>四、交付形态与可配置度</h2>
        <DocCopyButton section-id="lr-delivery" />
      </div>

      <p class="doc-p">
        这套重构<strong>不是「把 19 个模块都做成新页面」</strong>。名额的生成与消耗跑在现有排班排假系统里，临时假的小时换算跑在现有额度模块里 —— 这些地方我们不重画页面，只交<strong>定义</strong>。
      </p>

      <div class="lr-form-grid">
        <div v-for="f in deliveryForms" :key="f.id" class="lr-form-col" :class="'lr-form-' + f.id">
          <div class="lr-form-head">
            <span class="lr-form-name">{{ f.name }}</span>
            <span class="lr-form-sub">{{ f.subtitle }}</span>
          </div>
          <ul class="lr-form-list">
            <li v-for="it in f.items" :key="it">{{ it }}</li>
          </ul>
          <div class="lr-form-owner">{{ f.owner }}</div>
          <p class="lr-form-note">{{ f.note }}</p>
        </div>
      </div>

      <h3>可配置度阶梯：配置只能作用于「值」，不能作用于「逻辑」</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 120px;">层级</th>
            <th style="width: 200px;">对象</th>
            <th>可配度</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>L0 领域模型</strong></td>
            <td>排他占位、名额 ≠ 额度、三层事实</td>
            <td>写死，<strong>0% 可配</strong></td>
          </tr>
          <tr>
            <td><strong>L1 算法</strong></td>
            <td>业绩折算、名额生成</td>
            <td>逻辑锁死，<strong>只暴露参数</strong>；且参数入口很可能在对方系统里</td>
          </tr>
          <tr>
            <td><strong>L2 业务规则</strong></td>
            <td>假种、额度值、审核条件与覆盖、后果策略</td>
            <td>我们建页，业务填值</td>
          </tr>
          <tr>
            <td><strong>L3 展示偏好</strong></td>
            <td>列、筛选、看板维度</td>
            <td>完全开放</td>
          </tr>
        </tbody>
      </table>

      <div class="card">
        <div class="lr-card-title">为什么不做 100% 可配</div>
        <p class="doc-p" style="margin-bottom: 8px;">
          配置本身有成本，而且成本随维度相乘：假种（约 10）× 层级（3）× 薪酬结构（2）× 审核条件（5）× 周期（3）—— 配到最后，没人能回答业务最常问的那句话：<strong>这个员工为什么走了人工</strong>。
        </p>
        <p class="doc-p" style="margin: 0;">
          所以覆盖方向锁定为<strong>单向收紧</strong>（默认自动，局部只能改成人工，不可放宽），本质是一条压制配置成本的机制：它把「假种 × 层级」的任意矩阵压成一个单调结构。
        </p>
      </div>
    </div>

    <!-- ========== 五、模块优先级 ========== -->
    <div id="lr-priority" class="section">
      <div class="section-header">
        <h2>五、模块优先级</h2>
        <DocCopyButton section-id="lr-priority" />
      </div>
      <p class="doc-p">
        排序依据：<strong>配置底座是所有页面的数据源</strong>，不定则后续必返工。下表只列<strong>原型侧需要交付的页面</strong>（带「查看」的可直接跳转，入口在主应用侧边栏「假勤重构」分组）；本页自身及其他文档内容属文档中心，不占原型模块名额。
      </p>
      <div class="lr-priority-board">
        <div class="lr-priority-col" v-for="g in modulePriorities" :key="g.level">
          <div class="lr-col-head" :class="'lr-lv-' + g.level.toLowerCase()">
            <div class="lr-col-head-top">
              <span class="lr-level-badge">{{ g.level }}</span>
              <span class="lr-col-name">{{ g.name }}</span>
            </div>
            <p class="lr-col-desc">{{ g.desc }}</p>
          </div>
          <div class="lr-col-body">
            <div v-for="m in g.items" :key="m.name" class="lr-mod-item" :class="{ built: m.built }">
              <span class="lr-mod-name">{{ m.name }}</span>
              <div class="lr-mod-meta">
                <el-tag size="small" effect="plain" :type="formTagType(m.form)">{{ m.form }}</el-tag>
                <el-button v-if="m.route" size="small" link type="primary" @click="go(m.route)">查看</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 六、能力登记表 ========== -->
    <div id="lr-capability" class="section">
      <div class="section-header">
        <h2>六、能力登记表</h2>
        <DocCopyButton section-id="lr-capability" />
      </div>
      <p class="doc-p">
        画页面前的第一件事：<strong>先确认哪些能力是别人的、我们能改到什么程度</strong>。「可配」与「我们建」是两回事 —— 有些参数可配，但配置入口在别人系统里，我们的交付物只是一句「这个参数在哪配、影响什么」。
      </p>
      <el-table :data="capabilityRegistry" size="small" style="width: 100%;">
        <el-table-column prop="id" label="编号" width="64" />
        <el-table-column prop="name" label="能力" width="150" />
        <el-table-column prop="owner" label="实现方" width="140" />
        <el-table-column prop="deliverable" label="我们的交付物" min-width="230" show-overflow-tooltip />
        <el-table-column prop="depends" label="依赖字段" width="180" show-overflow-tooltip />
        <el-table-column label="可改性" width="86" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" :type="row.modifiable === 'readonly' ? 'info' : 'warning'">
              {{ row.modifiable === 'readonly' ? '只读' : '待确认' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="needConfirm" label="待确认" min-width="200" show-overflow-tooltip />
      </el-table>
      <div class="note" style="margin-top: 12px;">
        <strong>信息缺口：</strong>表中多项标注「可改性 · 待确认」——现有排班排假系统、现有额度模块，我们是<strong>能要求它加字段 / 加接口</strong>，还是<strong>只能读它现在的输出</strong>？若是后者，很多校验逻辑（如「额度够不够」）会被迫放到我们这侧做补偿计算。这一条不确认，定义层就写不实。
      </div>
    </div>

    <!-- ========== 七、待决事项 ========== -->
    <div id="lr-issues" class="section">
      <div class="section-header">
        <h2>七、待决事项</h2>
        <DocCopyButton section-id="lr-issues" />
      </div>
      <p class="doc-p">
        多数不由假勤单方决定，需与时间线组、打卡组、薪酬、员工福利对齐。<strong>8.1 时间线粒度</strong>与 <strong>8.11 外部能力可改性</strong>是两条真正的阻塞项。
      </p>
      <ul class="lr-issue-list">
        <li v-for="it in openIssues" :key="it.id" class="lr-issue-item">
          <span class="lr-issue-id">{{ it.id }}</span>
          <div class="lr-issue-main">
            <div class="lr-issue-title">{{ it.title }}</div>
            <div class="lr-issue-desc">{{ it.desc }}</div>
          </div>
          <el-tag size="small" effect="plain" type="info">{{ it.owner }}</el-tag>
        </li>
      </ul>
    </div>
  </DocShell>
</template>

<script setup>
import { useRouter } from 'vue-router'
import DocShell from '../../docs/components/DocShell.vue'
import DocCopyButton from '../../docs/components/DocCopyButton.vue'
import {
  reformModels,
  deliveryForms,
  capabilityRegistry,
  openIssues,
  modulePriorities
} from '../../mock/leaveAttendance.js'

const router = useRouter()

const tocItems = [
  { id: 'lr-scope', label: '一、定位与边界' },
  { id: 'lr-models', label: '二、七个核心模型' },
  { id: 'lr-catalog', label: '三、文档结构规划' },
  { id: 'lr-delivery', label: '四、交付形态与可配置度' },
  { id: 'lr-priority', label: '五、模块优先级' },
  { id: 'lr-capability', label: '六、能力登记表' },
  { id: 'lr-issues', label: '七、待决事项' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '假勤重构', to: '/docs/leave-reform/overview' },
  { label: '一、设计总览' }
]

const principles = [
  {
    title: '底座是员工时间线',
    desc: '以人为中心，按「事件是否排他」管理时间；假勤只是写入方之一，不是全流程主人'
  },
  {
    title: '勤 = 两层事实的比对',
    desc: '计划（排班）＋ 实际（打卡），差异即异常；岗位决定「勤」有几层'
  },
  {
    title: '名额 ≠ 额度',
    desc: '名额是组织容量（周期生成、共享、会被抢）；额度是个人可休量（私有、只减不增）'
  },
  {
    title: '配置只能作用于「值」',
    desc: '领域模型写死、算法只开参数、业务规则才可配 —— 不做 100% 可配'
  }
]

const go = (name) => router.push({ name })

// 原型模块只有「新建 / 配置 / 定义」三种交付形态；文档类内容不进此表（归文档中心）
const formTagType = (form) => {
  if (form.includes('新建')) return 'primary'
  if (form.includes('配置')) return 'success'
  if (form.includes('定义')) return 'info'
  return 'warning'
}
</script>

<style scoped>
/* 正文段落：DocShell 的全局样式未覆盖 p，这里补齐 */
.doc-p {
  font-size: 14px;
  line-height: 1.8;
  color: hsl(var(--foreground));
  margin: 0 0 12px 0;
}

/* 四条前提 */
.lr-principles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  margin: 12px 0 20px;
}

.lr-principle {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-top: 3px solid hsl(var(--primary));
  border-radius: 8px;
  padding: 14px 16px;
}

.lr-principle-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 6px;
}

.lr-principle-desc {
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}

/* 模型网格 */
.lr-model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  margin: 12px 0 20px;
}

.lr-model {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 14px;
  transition: border-color 0.2s;
}

.lr-model:hover {
  border-color: hsl(var(--primary) / 0.4);
}

.lr-model-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.lr-model-id {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.08);
  border-radius: 4px;
  padding: 1px 6px;
}

.lr-model-name {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.lr-model-brief {
  font-size: 13px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
  margin: 0 0 10px 0;
}

.lr-model-owner {
  font-size: 12px;
  color: hsl(var(--muted-foreground) / 0.85);
}

/* 列表 */
.lr-list {
  margin: 12px 0;
  padding-left: 20px;
}

.lr-list li {
  font-size: 13px;
  line-height: 1.8;
  color: hsl(var(--foreground));
  margin-bottom: 10px;
}

.lr-list li strong {
  color: hsl(var(--primary));
}

/* 交付形态三列 */
.lr-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin: 12px 0 20px;
}

.lr-form-col {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
  background: hsl(var(--muted) / 0.4);
}

.lr-form-definition { border-left: 3px solid hsl(var(--muted-foreground)); }
.lr-form-config { border-left: 3px solid hsl(var(--primary) / 0.55); }
.lr-form-new { border-left: 3px solid hsl(var(--primary)); }

.lr-form-head { margin-bottom: 12px; }

.lr-form-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.lr-form-sub {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.lr-form-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
}

.lr-form-list li {
  font-size: 13px;
  color: hsl(var(--foreground));
  padding: 5px 0 5px 14px;
  position: relative;
  line-height: 1.5;
}

.lr-form-list li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 12px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: hsl(var(--primary) / 0.6);
}

.lr-form-owner {
  font-size: 12px;
  color: hsl(var(--primary));
  padding-top: 10px;
  border-top: 1px dashed hsl(var(--border));
  margin-bottom: 8px;
}

.lr-form-note {
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
  margin: 0;
}

/* 卡片小标题 */
.lr-card-title {
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 10px;
}

/* 优先级板 */
.lr-priority-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-top: 12px;
}

.lr-priority-col {
  display: flex;
  flex-direction: column;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  overflow: hidden;
}

.lr-col-head {
  padding: 12px 14px;
  background: hsl(var(--muted) / 0.6);
  border-bottom: 1px solid hsl(var(--border));
}

.lr-col-head-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.lr-level-badge {
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
  padding: 1px 6px;
  color: hsl(var(--background));
  background: hsl(var(--muted-foreground));
}

.lr-lv-p0 .lr-level-badge { background: hsl(var(--primary)); }
.lr-lv-p1 .lr-level-badge { background: hsl(var(--primary) / 0.62); }
.lr-lv-p2 .lr-level-badge { background: hsl(var(--primary) / 0.4); }
.lr-lv-p3 .lr-level-badge { background: hsl(var(--muted-foreground) / 0.6); }

.lr-col-name {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.lr-col-desc {
  font-size: 12px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
  margin: 0;
}

.lr-col-body {
  padding: 10px;
  flex: 1;
  background: hsl(var(--background));
}

.lr-mod-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid hsl(var(--border));
}

.lr-mod-item:last-child { margin-bottom: 0; }

.lr-mod-item.built {
  border-color: hsl(var(--primary) / 0.35);
  background: hsl(var(--primary) / 0.04);
}

.lr-mod-name {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.lr-mod-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

/* 强调行 */
.lr-row-key td {
  background: hsl(var(--warning) / 0.06);
}

/* 待决事项 */
.lr-issue-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 10px;
}

.lr-issue-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.lr-issue-id {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  padding-top: 1px;
  flex-shrink: 0;
}

.lr-issue-main {
  flex: 1;
  min-width: 0;
}

.lr-issue-title {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin-bottom: 3px;
}

.lr-issue-desc {
  font-size: 12px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}
</style>
