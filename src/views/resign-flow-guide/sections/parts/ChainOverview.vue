<template>
  <!-- 五章末：全链路总览（一次离职，从发起到入账） -->
  <div class="rf-flow-tag-legend">
    <span class="rfs-tag ours">离职模块（本场景）</span>
    <span class="rfs-tag dw">关联系统（被通知）</span>
    <span class="rfs-tag pay">薪酬 / 发放</span>
    <span class="rfs-tag tax">个税申报</span>
    <span class="rfs-tag bean">假勤（只出结果）</span>
  </div>

  <div class="chain">
    <!-- STEP 1 发起 -->
    <div class="chain-node">
      <div class="cn-rail">
        <span class="cn-no">STEP 1</span>
        <span class="cn-name">发起</span>
        <span class="cn-who">员工侧<br />移动端</span>
      </div>
      <div class="cn-body">
        <div class="cn-t">三类岗位各自发起，收敛为<strong>同一张「离职需求」</strong></div>
        <div class="persona-cols">
          <div class="persona-col">
            <div class="pct">推拿师</div>
            <div class="pcd">技法 · 等级 · 合同门店<br />→ 审核链由模板配置<br />（如人事经理 1 级，按城市指定到人）</div>
          </div>
          <div class="persona-col">
            <div class="pct">客户经理</div>
            <div class="pcd">合同门店（仅此一行）<br />→ 审核链由模板配置</div>
          </div>
          <div class="persona-col">
            <div class="pct">总部</div>
            <div class="pcd">所在部门（仅此一行）<br />→ 审核链由模板配置</div>
          </div>
        </div>
        <div class="cn-d">
          统一采集：<b>期望离职日期</b> · <b>离职原因</b>（枚举多选 + 可选补充说明） · <b>收款账户</b>（只读核对，来源新员工关系）。
          总部同样两步：申请 → 签字确认。
        </div>
      </div>
    </div>
    <div class="chain-arrow">↓</div>

    <!-- STEP 2 离职需求审核（v0.3 前移） -->
    <div class="chain-node">
      <div class="cn-rail">
        <span class="cn-no">STEP 2</span>
        <span class="cn-name">离职需求<br />审核</span>
        <span class="cn-who">审核人<br />（模板审核链）</span>
      </div>
      <div class="cn-body">
        <div class="cn-t">一次确认，两个效果（<strong>原审批内容全部前置到这里定稿</strong>）</div>
        <div class="cn-d">
          审核人逐级办结（1~3 级，多人或签 / 会签）。确认内容 = 原审批全部事项：核对员工基础信息、确认<strong>离职类型</strong>、
          定<strong>实际离职日期</strong>、处理<strong>补偿金</strong>与<strong>常乐豆出口</strong> —— 交接过程不影响这些值，所以一次定稿、后面不再重复确认。
        </div>
        <div class="cn-d">
          确认的两个效果：<b>① 进入交接流程</b>（按模板生成清单）；<b>② 预授权交接完成后系统自动推送离职合同</b>（无需再「确认发出」）。
          同时<strong>排班取消、接单截断即生效</strong> —— 不等交接走完。
        </div>
      </div>
    </div>
    <div class="chain-arrow">↓</div>

    <!-- STEP 3 交接 -->
    <div class="chain-node">
      <div class="cn-rail">
        <span class="cn-no">STEP 3</span>
        <span class="cn-name">交接</span>
        <span class="cn-who">各节点负责人<br />（按岗位模板）</span>
      </div>
      <div class="cn-body">
        <div class="cn-t">按岗位套模板生成交接清单，<strong>全部办结后自动推送离职合同</strong></div>
        <div class="cn-d">
          发起时按员工岗位匹配<strong>离职流程模板</strong>（快照版本）生成清单。清单是一张<strong>平铺的节点列表</strong>：
          <strong>没配前置的节点发起后同时开始办理、并行进行</strong>，配了前置的节点等前置节点全部办结后才能开始办理，
          每个节点由负责人逐事项确认 —— <b>结论 + 说明 + 证据附件</b>；负债检查、客诉纠纷等<strong>系统检查节点</strong>自动跑、自动落结论，不占人工。
        </div>
        <div class="cn-d">
          门禁：<b>必过</b>节点判「不通过」→ <strong>实时终止全部流程</strong>、单据作废（员工仍在职、需重新发起）；
          <b>可选</b>节点不通过只记录。系统检查取到「通过」立即办结；命中未通过批次到上限：必过终止、软性放行留痕。
          交接全部办结 → <strong>自动推送离职合同</strong>（员工在线签署，见 6.4），无需任何再次确认。
          被动离职（解除用工）走同一套模板，但人事可<strong>强制解除</strong>、清单转事后补录。
          <strong>未被任何模板命中的发起不拦截</strong>：审核确认后因无交接清单，系统直接自动推送合同（见 6.1）。
        </div>
      </div>
    </div>
    <div class="chain-arrow">↓</div>

    <!-- STEP 4 合同与签署 -->
    <div class="chain-node">
      <div class="cn-rail">
        <span class="cn-no">STEP 4</span>
        <span class="cn-name">合同签署</span>
        <span class="cn-who">员工侧<br />移动端</span>
      </div>
      <div class="cn-body">
        <div class="cn-t">离职合同<strong>自动推送、在线签署</strong>，走电子签、无公司用印</div>
        <div class="cn-d">
          交接完成（或未命中模板的审核确认后）系统自动发出离职合同；签署完成即补偿金<strong>协议成立</strong>（要不要发，
          不是金额生效 —— 真实金额次月 5 日冻结后跑批才算出，见 6.4）。
          拒签 / 作废 → 单据作废，需重新发起。
        </div>
      </div>
    </div>
    <div class="chain-arrow">↓</div>

    <!-- 结算锚点 -->
    <div class="chain-node anchor">
      <div class="cn-rail">
        <span class="cn-no">锚点</span>
        <span class="cn-name">结算点</span>
        <span class="cn-who">实际离职日期</span>
      </div>
      <div class="cn-body">
        <div class="cn-t">实际离职日期 —— 一切从这里切开</div>
        <div class="cn-d">
          工资算到这一天；排班以这一天为界取消；接单权限从这一天之后截断；
          假勤、社保、常乐豆各自按自己的规则取这个日期。三类岗位同一含义，不接受歧义。
        </div>
        <div class="chain-aside">
          <span class="ca-t">旁路取数（只读，不回写）</span>
          假勤额度结存 / 负工资账户余额 / 常乐豆三层余额 —— 只进「剩余资产」面板给人事判断，<b>不计算</b>；
          常乐豆的<b>冻结</b>不在审核这一步，而在次月 5 日<strong>按流程执行</strong>（见 6.5）。
        </div>
      </div>
    </div>
    <div class="chain-arrow">↓</div>

    <!-- STEP 5 通知 -->
    <div class="chain-node">
      <div class="cn-rail">
        <span class="cn-no">STEP 5</span>
        <span class="cn-name">通知</span>
        <span class="cn-who">关联系统<br />各自处理</span>
      </div>
      <div class="cn-body">
        <div class="cn-t">一套「离职事实 + 日期」发给三个系统，各处理自己那一环</div>
        <div class="cols-3">
          <div class="sys-box">
            <div class="sb-t"><span class="rfs-tag dw">排班</span></div>
            <div class="sb-d">
              <b>实际离职日期之后的排班全部取消</b>，不再排给本人，也不留在门店排班表里。
              由离职处理主动发起，不等下游发现
            </div>
          </div>
          <div class="sys-box">
            <div class="sb-t"><span class="rfs-tag dw">预约订单</span></div>
            <div class="sb-d">
              失去接单权限 → <b>不再接新单</b>；在途预约由预约系统按规则改派 / 取消 / 通知客户。
              <b>怎么处置不由离职决定</b>
            </div>
          </div>
          <div class="sys-box">
            <div class="sb-t"><span class="rfs-tag dw">新员工关系</span></div>
            <div class="sb-d">
              写入离职事实与实际离职日期，员工状态置为离职；<b>完整履职经历</b>留档
              （原有「员工档案」只是其中一部分）
            </div>
          </div>
        </div>
        <div class="cn-d">通知是单向的：我们只发事实与日期，不替下游做处置决策。</div>
      </div>
    </div>
    <div class="chain-arrow">↓</div>

    <!-- 结算节点 -->
    <div class="chain-node">
      <div class="cn-rail">
        <span class="cn-no">结算节点</span>
        <span class="cn-name">算钱</span>
        <span class="cn-who">薪酬侧<br />按各自规则</span>
      </div>
      <div class="cn-body">
        <div class="cn-t">离职模块不参与计算，只提供事实与人录金额</div>
        <ul class="chain-list">
          <li><b>最后工资</b> —— 算到实际离职日期；服务 / 订单事实数据照常计入，不因离职改变算法</li>
          <li><b>一次性补偿金</b> —— 用人事在流程内录入的协商金额（0 ～ 月均 ×（N+1），N+1 即唯一上限），后台只做取数、计税、组单</li>
          <li><b>常乐豆余额</b> —— 取 <strong>4 日晚充值进账户、5 日冻结锁定</strong>的余额（冻结之后不再变动），5 日跑批进补偿金计算</li>
          <li><b>假勤额度</b> —— <span class="rfs-tag bean">假勤</span> 出结果，薪酬按规则消费；离职侧只呈现「剩余资产」</li>
        </ul>
      </div>
    </div>
    <div class="chain-arrow">↓</div>

    <!-- 发放节点 -->
    <div class="chain-node">
      <div class="cn-rail">
        <span class="cn-no">发放节点</span>
        <span class="cn-name">出单与到账</span>
        <span class="cn-who">薪酬 → 税务<br />→ 银行</span>
      </div>
      <div class="cn-body">
        <div class="cn-t">按申报科目归集：两张单、两次申报、<strong>最多两笔付款</strong></div>
        <div class="pay-line">
          <span class="pl-item"><span class="rfs-tag pay">工资单</span><b>【工资薪金】</b></span>
          <span class="pl-op">+</span>
          <span class="pl-item"><span class="rfs-tag pay">补偿金单</span><b>【解除劳动合同一次性补偿金】</b></span>
          <span class="pl-op">→</span>
          <span class="pl-item"><span class="rfs-tag tax">个税申报</span><b>2 次</b></span>
          <span class="pl-op">→</span>
          <span class="pl-item"><span class="rfs-tag pay">付款单</span><b>≤ 2 笔 → 员工收款账户</b></span>
        </div>
        <div class="cn-d">
          <b>为什么付款单封顶 2 笔：</b>离职批次的款项只落<strong>两个申报科目</strong> —— 一个科目 → 一张单 → 一次申报 → 一笔付款；
          同科目不拆、跨科目不并（并了申报与到账就对不上，凭证 / 计提也分不开）。所以是 2 笔封顶，不随人数或月份累加。
        </div>
        <div class="cn-d">
          <b>时点顺序：</b><strong>6 日报税 → 工资单与补偿金单数据完善 → 出付款单 → 9 日到账</strong>。
          付款单在报税之后才出，不提前、也不与申报同一步。
        </div>
        <div class="cn-d">
          补偿金单不进「应发之和」等式，也不进社保 / 公积金清单；两类单据在人员薪酬明细里同月并列可查。
        </div>
      </div>
    </div>
    <div class="chain-arrow">↓</div>

    <!-- 计提节点：资金流的最后一步 -->
    <div class="chain-node">
      <div class="cn-rail">
        <span class="cn-no">计提节点</span>
        <span class="cn-name">财务入账</span>
        <span class="cn-who">财务<br />人工计提</span>
      </div>
      <div class="cn-body">
        <div class="cn-t">资金流的最后一步：<strong>财务人工计提科目</strong></div>
        <div class="cn-d">
          财务在财务系统按 <code>【解除劳动合同一次性补偿金】</code> 科目<strong>人工计提</strong> ——
          与个税申报科目一致，取数看补偿金单。
        </div>
        <div class="cn-d">
          这一步<strong>不随发薪自动产生</strong>，属财务手工做账；工资那部分的计提随工资走，不在本节点。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 纯静态展示，无逻辑
</script>

<style scoped>
/* ===== 全链路总览 ===== */
.rf-flow-tag-legend { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 10px; }
.rfs-tag {
  font-size: 10.5px; padding: 1px 7px; border-radius: 9px;
  white-space: nowrap; vertical-align: middle;
}
.rfs-tag.ours { color: hsl(var(--primary)); background: hsl(var(--primary) / 0.1); }
.rfs-tag.dw { color: hsl(210 70% 40%); background: hsl(210 70% 50% / 0.12); }
.rfs-tag.bean { color: hsl(38 85% 32%); background: hsl(38 92% 45% / 0.14); }
.rfs-tag.pay { color: hsl(150 45% 30%); background: hsl(150 45% 42% / 0.13); }
.rfs-tag.tax { color: hsl(275 45% 42%); background: hsl(275 45% 50% / 0.12); }

.chain { margin: 16px 0 14px; }
.chain-node {
  display: grid; grid-template-columns: 108px 1fr;
  border: 1px solid hsl(var(--border)); border-radius: 12px;
  overflow: hidden; background: hsl(var(--card));
  box-shadow: 0 1px 2px hsl(0 0% 0% / 0.03);
}
.cn-rail {
  background: hsl(var(--muted) / 0.3);
  border-right: 1px solid hsl(var(--border));
  padding: 13px 12px;
  display: flex; flex-direction: column; gap: 5px;
}
.cn-no {
  align-self: flex-start;
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 999px; padding: 1px 8px;
}
.cn-name { font-size: 14px; font-weight: 700; line-height: 1.35; color: hsl(var(--foreground)); }
.cn-who { font-size: 11px; line-height: 1.55; color: hsl(var(--muted-foreground)); }
.cn-body { padding: 13px 16px 14px; min-width: 0; }
.cn-t { font-size: 13.5px; font-weight: 600; line-height: 1.55; color: hsl(var(--foreground)); }
.cn-d { font-size: 12.5px; line-height: 1.75; color: hsl(var(--foreground) / 0.62); margin-top: 7px; }
.cn-d b { color: hsl(var(--foreground)); font-weight: 600; }

.chain-node.anchor {
  border-color: hsl(var(--primary) / 0.45);
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.06);
}
.chain-node.anchor .cn-rail { background: hsl(var(--primary) / 0.07); border-right-color: hsl(var(--primary) / 0.18); }
.chain-node.anchor .cn-no { color: #fff; background: hsl(var(--primary)); border-color: hsl(var(--primary)); }
.chain-node.anchor .cn-name { color: hsl(var(--primary)); }

.chain-arrow {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 3px 0; color: hsl(var(--primary) / 0.4);
  font-size: 12px; line-height: 1;
}
.chain-arrow::before {
  content: ''; width: 1px; height: 10px;
  background: hsl(var(--primary) / 0.28);
}

.persona-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin-top: 11px; }
.persona-col {
  border: 1px solid hsl(var(--border)); border-radius: 10px;
  background: hsl(var(--card)); overflow: hidden;
}
.pct {
  font-size: 12.5px; font-weight: 700; color: hsl(var(--foreground));
  padding: 6px 11px; background: hsl(var(--muted) / 0.42);
  border-bottom: 1px solid hsl(var(--border));
}
.pcd { font-size: 12px; line-height: 1.7; color: hsl(var(--foreground) / 0.6); padding: 8px 11px 10px; }

.cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin-top: 11px; }
.sys-box {
  border: 1px solid hsl(210 70% 50% / 0.3); border-left: 3px solid hsl(210 70% 50% / 0.55);
  border-radius: 10px; background: hsl(210 70% 50% / 0.03); overflow: hidden;
}
.sb-t {
  padding: 6px 11px; background: hsl(210 70% 50% / 0.07);
  border-bottom: 1px solid hsl(210 70% 50% / 0.16);
}
.sb-d { font-size: 12px; line-height: 1.72; color: hsl(var(--foreground) / 0.62); padding: 8px 11px 10px; }
.sb-d b { color: hsl(var(--foreground)); font-weight: 600; }

.chain-aside {
  margin-top: 10px; padding: 9px 12px;
  border: 1px dashed hsl(var(--primary) / 0.3); border-radius: 9px;
  background: hsl(var(--primary) / 0.03);
  font-size: 12px; line-height: 1.72; color: hsl(var(--foreground) / 0.62);
}
.chain-aside .ca-t {
  display: inline-block; margin-right: 9px; padding-right: 9px;
  border-right: 1px solid hsl(var(--border));
  font-weight: 700; color: hsl(var(--primary));
}
.chain-aside b { color: hsl(var(--foreground)); font-weight: 600; }

.chain-list { margin: 9px 0 0; padding-left: 20px; }
.chain-list li { font-size: 12.5px; line-height: 1.85; color: hsl(var(--foreground) / 0.62); }
.chain-list li + li { margin-top: 2px; }
.chain-list li::marker { color: hsl(var(--primary) / 0.5); }
.chain-list li b { color: hsl(var(--foreground)); font-weight: 600; }

.pay-line {
  display: flex; align-items: center; flex-wrap: wrap; gap: 7px;
  margin-top: 10px;
}
.pl-item {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border)); border-radius: 999px;
  background: hsl(var(--card)); padding: 6px 12px;
  box-shadow: 0 1px 1px hsl(0 0% 0% / 0.03);
}
.pl-item b { font-weight: 600; }
.pl-op { font-size: 12.5px; color: hsl(var(--foreground) / 0.35); }

@media (max-width: 960px) {
  .persona-cols, .cols-3 { grid-template-columns: 1fr; }
  .chain-node { grid-template-columns: 1fr; }
  .cn-rail { flex-direction: row; align-items: center; gap: 8px; border-right: none; border-bottom: 1px solid hsl(var(--border)); }
  .chain-arrow { transform: rotate(90deg); }
  .chain-arrow::before { display: none; }
}
</style>
