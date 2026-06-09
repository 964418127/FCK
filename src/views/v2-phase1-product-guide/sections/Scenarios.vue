<template>
      <div id="scenarios" class="section">
        <h2>九、典型业务场景决策树</h2>

        <div class="card">
          <h3>用工类型选择</h3>
          <div class="decision-tree">
            <div class="tree-node root">新员工入职配置</div>
            <div class="tree-children">
              <div class="tree-question">Q1: 每天工时 ≤ 4 小时 + 周薪制（间隔 ≤ 15 天）？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">✓ 是 → 非全日制用工（劳务协议）</div>
                <div class="tree-leaf-sub">  └ <strong>社保（仅工伤保险）</strong>由老系统单独记账（公司全额，不进工资条）</div>
                <div class="tree-leaf-sub">  └ <strong>商业险默认机制</strong>（不显示）</div>
                <div class="tree-leaf-sub">  └ 多主体（1 门店 = 1 主体）：每主体独立结算，按各主体发薪</div>
                <div class="tree-leaf-sub">  └ 无常乐豆、无社保（全）、无公积金</div>
                <div class="tree-leaf muted">  ✗ 否 ↓</div>
              </div>
              <div class="tree-question">Q2: 需要社保 + 公积金？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">✓ 是 → 全职用工（劳动合同）</div>
                <div class="tree-leaf-sub">  └ <strong>社保（全）+ 公积金</strong>：<strong>个人部分金额从老系统接口读取</strong>（公司部分由老系统记账）</div>
                <div class="tree-leaf-sub">  └ <strong>商业险默认机制</strong>（公司全额，不参与工资计算；不显示）</div>
                <div class="tree-leaf-sub">  └ 单一合同主体，不能挂店</div>
                <div class="tree-leaf-sub">  └ 有常乐豆（仅消费，离职时全部提现）</div>
                <div class="tree-leaf muted">  ✗ 否 ↓</div>
              </div>
              <div class="tree-question">Q3: 临时/项目制用工？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">✓ 是 → 兼职用工（劳务合作）</div>
                <div class="tree-leaf-sub">  └ <strong>商业险默认机制</strong>（公司全额，不参与工资计算；不显示）</div>
                <div class="tree-leaf-sub">  └ 多主体倒序申报（应税金额大者先报，可能跳档）</div>
                <div class="tree-leaf-sub">  └ 无常乐豆、无社保、无公积金</div>
                <div class="tree-leaf muted">  ✗ 否 ↓</div>
              </div>
              <div class="tree-question">Q4: 退休返聘（已达法定退休年龄）？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">✓ 是 → 返聘用工（劳务合作-退休返聘）</div>
                <div class="tree-leaf-sub">  └ <strong>商业险默认机制</strong>（公司全额，不参与工资计算；不显示）</div>
                <div class="tree-leaf-sub">  └ 单一劳务合作主体，不能挂店</div>
                <div class="tree-leaf-sub">  └ 无常乐豆、无社保（达到退休年龄不再缴纳）、无公积金</div>
                <div class="tree-leaf muted">  ✗ 否 → 全职用工（默认）</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>推拿师特殊处理</h3>
          <div class="decision-tree">
            <div class="tree-node root">推拿师入职</div>
            <div class="tree-children">
              <div class="tree-question">Q: 推拿师等级 Lv？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">Lv1 ~ Lv2</div>
                <div class="tree-leaf-sub">  └ 享受营销折扣获豆 + 回头客补贴（常乐豆形式）</div>
                <div class="tree-leaf-sub">  └ 可转非全日制（按非全日制规则）</div>
                <div class="tree-leaf primary">Lv3+</div>
                <div class="tree-leaf-sub">  └ <strong>不再发放</strong>营销折扣补贴 + 回头客补贴</div>
                <div class="tree-leaf-sub">  └ <strong>不接受</strong>转非全日制（保持全职）</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>多主体兼职场景（1 门店 = 1 主体）</h3>
          <div class="decision-tree">
            <div class="tree-node root">兼职员工在 N 个门店产生业绩</div>
            <div class="tree-children">
              <div class="tree-question">Q: 个税申报顺序？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">应税金额倒序申报（大者先报）</div>
                <div class="tree-leaf-sub">  └ 每门店独立计算预扣个税（每周 3%）</div>
                <div class="tree-leaf-sub">  └ 月末百旺服务累计计算实际税额</div>
                <div class="tree-leaf-sub">  └ 申报门店 = 补缴 / 退税主体</div>
                <div class="tree-leaf-sub">  └ 每门店最后一周工资条包含汇算补缴/退税</div>
              </div>
            </div>
          </div>
        </div>
      </div>

</template>
