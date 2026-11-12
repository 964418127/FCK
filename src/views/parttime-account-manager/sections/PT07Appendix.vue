<template>
  <DocShell
    :toc-items="tocItems"
    title="七、附录：待决事项"
    subtitle="不在本场景拍板但必须显式挂起的事项：写明归属方与卡点，条件成熟时回收到对应章节"
    version="v1.0"
    date="2026-11-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="pt-issues" class="section">
      <div class="section-header">
        <h2>七、附录：待决事项</h2>
        <DocCopyButton section-id="pt-issues" />
      </div>
      <p class="doc-p">
        以下事项不在本场景拍板，但必须显式挂起：写明归属方与卡点，条件成熟时回收到对应章节。
        已有结论的不再列在这里 —— 例如任务的六类来源（见 6.3）、单段最长 4 小时（见 6.1）、
        周四 06:00 的发布时间窗（见 6.2）、移动端不展示具体打卡时间（见 6.6）、
        1 门店 = 1 结算主体（见 6.7）、配置只维护标准不做结算试算（见 6.7）、
        分配策略的档位 / 窗口 / 兜底全部由业务配置（见 6.1.3）、旧排班兜底逻辑停用（见 6.8.2）。
      </p>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th style="width: 250px;">事项</th>
            <th style="width: 140px;">归属</th>
            <th>卡在哪</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(q, i) in openIssues" :key="i">
            <td>{{ i + 1 }}</td>
            <td><strong>{{ q.title }}</strong></td>
            <td>{{ q.owner }}</td>
            <td>{{ q.why }}</td>
          </tr>
        </tbody>
      </table>

      <div class="note warn-note">
        <strong>处理原则：</strong>挂起不等于「先写着不管」。涉及<strong>能否接单</strong>与<strong>钱怎么算</strong>的两类，
        上线前必须由归属方给出结论；其余可在原型阶段按当前口径执行，但正文里要保住「暂定」两个字，不能写成定论。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const openIssues = [
  {
    title: '跨店通勤缓冲 30 分钟是暂定值',
    owner: '运营 / 门店主数据',
    why: '当前统一按 30 分钟兜底，用于校验同一人相邻任务是否冲突（见 6.5）。门店间的实际通行时间库尚未建立，两店路程差异大的城市会失真；接入门店间隔时间库后应改为按实际间隔取数，届时 30 分钟降级为缺省值'
  },
  {
    title: '「每段不超过 4 小时」与「每人单日累计不超过 4 小时」是否并存',
    owner: '运营 / 法务合规（用工时长）',
    why: '前者是任务与接班拆段的上限（见 6.1、6.3），后者来自现有业务文档。两条同时生效会互相限制：一个人一天最多接一段，取消重派与临时时段的可用人力会被压到很低。是保留其一、还是按岗位或城市差异化，未定'
  },
  {
    title: '计价事件日与任务排班日不同时，用哪一版单价',
    owner: '薪酬',
    why: '单价配置可改可作废，而新客、评价、客次事件可能晚于排班日甚至跨月补录、撤销。取排班日快照还是事件日快照、跨月补录与撤销如何冲回，需薪酬事件口径统一定义；本模块只保证配置留版本与结算快照（见 6.7）'
  },
  {
    title: '违规提前离场是否能自动触发「终止合作」',
    owner: '运营 / 人事',
    why: '当前打卡只留痕，迟到到店与提前离店在跟踪页以异常呈现，移动端不展示违规统计（见 6.6）。是否按次数阈值自动进入终止合作流程、阈值多少、由谁复核，都未定；本模块不擅自设置自动终止'
  },
  {
    title: '运营能否修改已生成任务的时段与名额',
    owner: '运营',
    why: '现规则不允许直接改：已生成任务使用生成时快照，缺人只能走 6.3 的临时时段，改需求只影响未来周期。是否为「明显录错」开口子、开多大、怎么留痕，未定；在此之前一律按作废需求 + 重新发布处理'
  },
  {
    title: '跨店承接的资格口径（含协议前置）',
    owner: '业务 / 运营 / 法务合规',
    why: '非全客户经理与门店签订非全日制合同，签约门店即本店（见 6.5）；门店所属商圈是门店的业务归组属性，由业务管理，不是签约对象。签约门店之外能否承接（含转发任务时「同商圈」候选的承接资格）未定 —— 是签约门店即服务门店，还是签约门店 + 同商圈其他门店，或按业务另配可服务门店清单。已明确的部分：<strong>跨店承接不进分配策略的人群候选</strong>，要让其他门店的人看到这条班次，必须先另签承接协议，协议口径定了再开这一档（见 6.1.3）；原型按「签约门店即服务门店」演示'
  }
]

const tocItems = [
  { id: 'pt-issues', label: '七、附录：待决事项' }
]
</script>

<style scoped src="./doc-base.css"></style>
