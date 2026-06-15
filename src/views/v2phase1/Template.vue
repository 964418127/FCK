<template>
  <DocShell
    :toc-items="tocItems"
    title="四、岗位薪酬模板（含四·附录：动态薪酬项）"
    subtitle='4 种用工类型（全职/非全日制/兼职/返聘）的岗位薪酬模板 + 业务流转产生的动态项'
    version="v2.1-phase1"
    date="2026-06-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="template" class="section">
      <h2>四、岗位薪酬模板（含四·附录：动态薪酬项）</h2>
        <div class="note" style="background: hsl(var(--primary) / 0.08); border-left: 3px solid hsl(var(--primary)); padding: 10px 12px; margin-bottom: 12px; font-size: 13px; border-radius: 4px;">
          <strong>📌 职责边界：</strong>岗位薪酬模板<strong>只管工资条项</strong>（薪酬项 + 扣缴项 + 系统项）。其中<strong>系统项</strong>包含<strong>代扣社保 / 代扣公积金 / 代扣个税</strong>，金额由<strong>老系统接口 / 百旺服务</strong>返回（个人部分从老系统接口读取、个税由百旺按月计算）；<strong>商业险</strong><strong>暂不进入系统</strong>（由线下购买，成本归公司），也不在薪酬模板里配置。
        </div>
        <div class="note" style="background: hsl(var(--warning) / 0.08); border-left: 3px solid hsl(var(--warning)); padding: 10px 12px; margin-bottom: 12px; font-size: 13px; border-radius: 4px;">
          <strong>⚠ 2 级薪酬项配置规则：</strong>第 2 级薪酬项是<strong>自定义配置</strong>（与 1 级独立），但配置内容<strong>只能使用第 1 级薪酬项、元数据和配置参数</strong>，<strong>不可引用</strong>其他 2 级或更低层级数据。
        </div>

        <div class="card">
          <h3 id="template-1">模板项类型</h3>
          <p>薪酬模板由以下类型组成（<strong>仅工资条相关项</strong>）：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>说明</th>
                <th>进入薪酬计算</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>薪酬项</td>
                <td>收入类，如：计件提成、超产值奖金、保底获豆</td>
                <td>✅ 是（增加应发）</td>
              </tr>
              <tr>
                <td>扣缴项</td>
                <td>扣款类，如：投诉扣款</td>
                <td>✅ 是（减少应发）</td>
              </tr>
              <tr>
                <td>代扣社保</td>
                <td>社保扣缴（全职），员工个人部分；<strong>金额 = 老系统接口返回值</strong></td>
                <td>✅ 是</td>
              </tr>
              <tr>
                <td>代扣公积金</td>
                <td>公积金扣缴（全职），员工<strong>个人部分</strong>；<strong>金额 = 老系统接口返回值</strong>（员工<strong>足额自付</strong>，<strong>不参与常乐豆抵扣</strong>）</td>
                <td>✅ 是</td>
              </tr>
              <tr>
                <td>预扣个税</td>
                <td>第2级，每工资条计算时预扣（兼职/非全日制：每周，3%）</td>
                <td>✅ 是</td>
              </tr>
              <tr>
                <td>代扣个税</td>
                <td>月末汇算后生成退税/补缴，作为<strong>最后一条工资条</strong>的一个扣缴/收入项（<strong>不单独生成"汇算工资条"</strong>）</td>
                <td>✅ 是</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>已移除的旧版"公司成本项"：</strong>原 V1 模板中的"公司成本项"分类（商业险等）在 V2 已<strong>整体拆出</strong>，v2-1 阶段<strong>不引入薪酬模板</strong>——理由：
            <ul style="margin: 4px 0 0 16px; line-height: 1.8;">
              <li>社保 / 公积金 / 商业险<strong>本质是福利保障</strong>，v2-1 由线下购买处理，不在本系统维护</li>
              <li>福利项<strong>不参与工资条扣款</strong>，与薪酬项的"按月计算按条分配"逻辑不同源</li>
            </ul>
          </div>
        </div>

        <!-- 全职模板 -->
        <div class="card">
          <h3 id="template-2">全职模板（劳动合同）</h3>
          <p><strong>计算周期（示例）：</strong>每月1次，N个工资条/月（示例：3个），单一主体</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>层级</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="4">薪酬项</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超产值奖金</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>薪酬项</td>
                <td>保底获豆</td>
                <td>收入</td>
                <td>第2级</td>
              </tr>
              <tr>
                <td rowspan="3">系统项</td>
                <td>代扣社保</td>
                <td>代扣社保</td>
                <td>末级（金额 = 老系统接口）</td>
              </tr>
              <tr>
                <td>代扣公积金</td>
                <td>代扣公积金</td>
                <td>末级（金额 = 老系统接口，<strong>个人部分</strong>）</td>
              </tr>
              <tr>
                <td>代扣个税</td>
                <td>代扣个税</td>
                <td>末级（百旺服务）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>系统项：</strong>代扣社保、代扣公积金、代扣个税（按月计算，按工资条分配）<br/>
            <strong>无预扣个税：</strong>全职个税直接使用百旺服务计算，不再预扣<br/>
            <strong>福利保障：</strong>社保（全）+ 公积金 <strong>从老系统接口读取个人部分金额</strong>（员工<strong>足额自付</strong>，不参与常乐豆抵扣）；商业险<strong>暂不进入系统</strong>（不进工资条）
          </div>
        </div>

        <!-- 非全日制模板 -->
        <div class="card">
          <h3 id="template-3">非全日制模板（劳务协议）</h3>
          <p><strong>计算周期（示例）：</strong>每周1次，每主体独立结算（N个工资条可配，示例：1个）</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>层级</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">薪酬项</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>第2级</td>
                <td>个税预扣</td>
                <td>扣缴项</td>
                <td>第2级（每工资条按 3% 预扣）</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>系统项（月末汇算，作为最后一条工资条的一项）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>福利保障：</strong>社保（仅工伤保险）由<strong>老系统单独记账</strong>，<strong>不进入员工工资条</strong>；商业险<strong>暂不进入系统</strong>（线下购买）<br/>
            <strong>无社保/无公积金代扣项：</strong>非全日制模板中<strong>不包含</strong>代扣社保/代扣公积金系统项——因为公司全额承担，个人不缴
          </div>
        </div>

        <!-- 兼职模板 -->
        <div class="card">
          <h3 id="template-4">兼职模板（劳务合作）</h3>
          <p><strong>计算周期（示例）：</strong>每周1次，每主体独立结算（N个工资条可配，示例：1个）</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>层级</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">薪酬项</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>第2级</td>
                <td>个税预扣</td>
                <td>扣缴项</td>
                <td>第2级（每工资条按 3% 预扣）</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>系统项（月末汇算，作为最后一条工资条的一项）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>福利保障：</strong>商业险<strong>暂不进入系统</strong>（线下购买，成本归公司）<br/>
            <strong>多主体申报：</strong>按应税金额大的先报，可能跳档
          </div>
        </div>

        <!-- 返聘模板 -->
        <div class="card">
          <h3 id="template-5">返聘模板（劳务合作-退休返聘）</h3>
          <p><strong>计算周期（示例）：</strong>每月1次，N个工资条/月（示例：1个），单一劳务合作主体</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>层级</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">薪酬项</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>代扣个税</td>
                <td>代扣个税</td>
                <td>末级（百旺服务计算）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>福利保障：</strong>无社保（达到退休年龄不再缴纳）、无公积金、<strong>商业险（暂不进入系统）</strong>（不进工资条）<br/>
            <strong>无常乐豆：</strong>返聘员工不享有常乐豆<br/>
            <strong>无预扣个税：</strong>返聘无周薪，个税直接由百旺服务按月计算（参考全职逻辑）
          </div>
        </div>
      </div>

      <!-- 四·附录：动态薪酬项 / 扣缴项（业务流转产生，非模板固定配置） -->
      <div id="dynamic-items" class="section">
        <div class="section-header">
          <h2>四·附录：动态薪酬项 / 扣缴项（业务流转产生）</h2>
          <el-button size="small" plain @click="copySectionAsHtml('dynamic-items')" class="copy-section-btn">
            <span style="margin-right: 4px;">📋</span>复制章节
          </el-button>
        </div>
        <div class="note" style="background: hsl(var(--primary) / 0.08); border-left: 3px solid hsl(var(--primary)); padding: 10px 12px; margin-bottom: 12px; font-size: 13px; border-radius: 4px;">
          <strong>📌 与"模板固定项"的区别：</strong>上一节【岗位薪酬模板】列出的薪酬项 / 扣缴项是<strong>HR 预先在模板中配置</strong>的。本节列出的项是<strong>在业务执行/计算流转过程中，按条件动态产生</strong>的——<strong>不固定配置在模板中</strong>，而是<strong>触发式动态项</strong>。
        </div>

        <!-- 1. 触发条件表 -->
        <div class="card">
          <h3 id="template-6">① 动态项全景</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 180px;">动态项</th>
                <th style="width: 220px;">触发条件 / 业务环节</th>
                <th>适用用工类型</th>
                <th>出现位置</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>个税补缴</strong></td>
                <td>月末百旺汇算：实际税额 &gt; 已预扣合计（多退少补中的"补"）</td>
                <td>非全日制 / 兼职</td>
                <td>当月<strong>最后一条工资条</strong>的一个扣缴项（不单独生成汇算工资条）</td>
              </tr>
              <tr>
                <td><strong>个税退税</strong></td>
                <td>月末百旺汇算：实际税额 &lt; 已预扣合计（多退少补中的"退"）</td>
                <td>非全日制 / 兼职</td>
                <td>当月<strong>最后一条工资条</strong>的一个收入项（不单独生成汇算工资条）</td>
              </tr>
              <tr>
                <td><strong>负工资抵扣</strong></td>
                <td>工资条<strong>应发 &gt; 0</strong> 且员工存在<strong>负工资余额</strong>时触发</td>
                <td>全职 / 非全日制 / 兼职 / 返聘（所有类型）</td>
                <td>任意可触发的工资条（<strong>可叠加多条</strong>）</td>
              </tr>
              <tr>
                <td><strong>激励补贴</strong>（常乐豆代缴公积金个人部分的名义收入）</td>
                <td>常乐豆<strong>优先抵公司部分后，剩余继续抵个人部分</strong>，且实际抵掉金额 &gt; 0 时触发；金额 = 常乐豆代缴个人部分金额</td>
                <td><strong>仅全职</strong></td>
                <td><strong>第 1 个工资条</strong>的一个收入项；与「代扣公积金」按全额显示相配合，<strong>保持工资条净到手 = 员工实收</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. 按合作模式 / 业务环节分述 -->
        <div class="card">
          <h3 id="template-7">② 各合作模式下的动态项分布</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 110px;">用工类型</th>
                <th>可能产生的动态项</th>
                <th>业务环节</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>全职</strong></td>
                <td>
                  · <strong>负工资抵扣</strong>（应发 &gt; 0 且有余额时）<br/>
                  · <strong>激励补贴</strong>（常乐豆代缴公积金个人部分时触发；仅全职）<br/>
                  · <em>无个税补缴/退税</em>（个税直接由百旺按月计算，不预扣）<br/>
                  · <em>无【公积金个人扣款】</em>（v2-1 已取消；工资条上「代扣公积金」按老系统接口读取的全额显示，员工现金补差 = 全额 − 常乐豆代缴金额）
                </td>
                <td>
                  ① 工资条应发计算 → 应发 &gt; 0 触发负工资抵扣<br/>
                  ② 常乐豆<strong>优先抵公积金公司部分</strong>（公司侧独立资金流，<strong>不进员工工资条</strong>）<br/>
                  ③ 常乐豆<strong>剩余继续抵公积金个人部分</strong> → 触发<strong>「激励补贴」动态项</strong>（作为收入项加入<strong>第 1 个工资条</strong>，<strong>计入应税收入</strong>）
                </td>
              </tr>
              <tr>
                <td><strong>非全日制</strong></td>
                <td>
                  · <strong>个税补缴</strong> 或 <strong>个税退税</strong>（月末汇算）<br/>
                  · <strong>负工资抵扣</strong>（应发 &gt; 0 且有余额时）<br/>
                  · <em>无常乐豆</em>
                </td>
                <td>
                  ① 每周预扣个税 → 累计已预扣合计<br/>
                  ② 月末百旺汇算 → 实际税额 vs 已预扣合计 → 补缴/退税 → 附加到当月最后一条工资条<br/>
                  ③ 工资条应发 &gt; 0 触发负工资抵扣
                </td>
              </tr>
              <tr>
                <td><strong>兼职</strong></td>
                <td>
                  · <strong>个税补缴</strong> 或 <strong>个税退税</strong>（月末多主体倒序汇算）<br/>
                  · <strong>负工资抵扣</strong>（每主体独立）<br/>
                  · <em>无常乐豆</em>
                </td>
                <td>
                  ① 每周每主体预扣个税<br/>
                  ② 月末按主体应税倒序申报 → 每主体 1 次百旺调用 → 每主体 1 个补缴/退税 → 附加到该主体最后一条工资条<br/>
                  ③ 每主体工资条应发 &gt; 0 触发负工资抵扣（<strong>每主体独立</strong>，不跨主体）
                </td>
              </tr>
              <tr>
                <td><strong>返聘</strong></td>
                <td>
                  · <strong>负工资抵扣</strong>（应发 &gt; 0 且有余额时）<br/>
                  · <em>无个税补缴/退税</em>（无周薪无预扣）<br/>
                  · <em>无社保/无公积金/无常乐豆</em>
                </td>
                <td>
                  ① 无社保/无公积金/无常乐豆 + 商业险（暂不进入系统）（不进工资条）<br/>
                  ② 工资条应发 &gt; 0 触发负工资抵扣
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. 与"模板固定项"的协同 -->
        <div class="card" style="background: hsl(var(--warning) / 0.05);">
          <h3 id="template-8">③ 与"模板固定项"的协同关系</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 200px;">维度</th>
                <th>模板固定项（薪酬模板配置）</th>
                <th>动态项（业务流转产生）</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>配置位置</td>
                <td>【岗位薪酬模板】</td>
                <td><strong>无模板配置</strong>，由系统在计算时按规则产生</td>
              </tr>
              <tr>
                <td>名称</td>
                <td>HR 自定义（如：投诉扣款、计件提成）</td>
                <td><strong>系统固定名称</strong>（如：负工资抵扣、个税补缴/退税）</td>
              </tr>
              <tr>
                <td>出现时机</td>
                <td>每条工资条都出现（按层级计算）</td>
                <td><strong>触发式</strong>（条件满足才出现）</td>
              </tr>
              <tr>
                <td>是否影响应税收入</td>
                <td>第 1 级 + 第 2 级（非预扣）→ 计入应税收入<br/>预扣个税 → 不计入</td>
                <td>
                  · 负工资抵扣 → <strong>不计入</strong>（动态项，不是收入）<br/>
                  · 个税补缴/退税 → <strong>不计入</strong>（个税汇算结果）<br/>
                  · <strong>激励补贴 → 计入应税收入</strong>（作为 1 级收入项；常乐豆代缴公积金个人部分的名义收入）<br/>
                  · <em>【公积金个人扣款】v2-1 已取消</em>
                </td>
              </tr>
              <tr>
                <td>与应发的关系</td>
                <td>直接参与应发计算（+/- 应发）</td>
                <td>
                  · 负工资抵扣 → 减少应发（触发时抵扣）<br/>
                  · 个税补缴 → 减少应发 ｜ 个税退税 → 增加应发<br/>
                  · <strong>激励补贴 → 增加应发</strong>（收入项）
                </td>
              </tr>
            </tbody>
          </table>
        </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'

const tocItems = [
    { id: 'template-1', label: '模板项类型' },
    { id: 'template-2', label: '全职模板（劳动合同）' },
    { id: 'template-3', label: '非全日制模板（劳务协议）' },
    { id: 'template-4', label: '兼职模板（劳务合作）' },
    { id: 'template-5', label: '返聘模板（劳务合作-退休返聘）' },
    { id: 'template-6', label: '① 动态项全景' },
    { id: 'template-7', label: '② 各合作模式下的动态项分布' },
    { id: 'template-8', label: '③ 与"模板固定项"的协同关系' }
  ]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '产品需求v2（阶段1）', to: '/docs/product-v2-phase1' },
  { label: '四、岗位薪酬模板 + 动态项' }
]
</script>
