<template>
      <div id="welfare" class="section">
        <h2>二、员工福利保障配置</h2>

        <div class="card">
          <h3>各类型福利保障配置（用工类型 × 福利项矩阵）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>社保（全）</th>
                <th>社保（仅工伤保险）</th>
                <th>公积金</th>
                <th>商业险</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>全职</strong></td>
                <td>足额缴纳（按每月实际薪酬申报基数，浮动）</td>
                <td>无（已包含在社保全中）</td>
                <td>足额缴纳（按每月实际薪酬申报基数，浮动）</td>
                <td><strong>必选 1+ 项</strong>（入职时由办理入职人员从商业险库中按入职城市筛选项选择）</td>
              </tr>
              <tr>
                <td><strong>非全日制</strong></td>
                <td>不交社保</td>
                <td><strong>必须购买</strong>（城市不支持单独购买时仍需独立购买）</td>
                <td>不交公积金</td>
                <td><strong>可选</strong>（由办理入职人员决定）</td>
              </tr>
              <tr>
                <td><strong>兼职</strong></td>
                <td>不交社保</td>
                <td>无</td>
                <td>不交公积金</td>
                <td><strong>必选 1+ 项</strong>（入职时由办理入职人员从商业险库中按入职城市筛选项选择）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>商业险（员工福利保障分组下的子页面，通用险种库）</h3>
          <p>商业险是员工福利保障的<strong>上游险种库</strong>，由 HR 维护，办理入职人员在入职时按城市筛选并<strong>必选 1 个或多个</strong>（非全日制可选），公司全额，<strong>不参与员工工资计算</strong>。</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>用工类型</th>
                <th>商业险约束</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>全职</td>
                <td>必选 1+ 项</td>
                <td>公司全额负担，主要险种为雇主险</td>
              </tr>
              <tr>
                <td>非全日制</td>
                <td>可选</td>
                <td>由办理入职人员决定；<strong>与"社保（仅工伤保险）"是并列项</strong>，不再有"代替"关系</td>
              </tr>
              <tr>
                <td>兼职</td>
                <td>必选 1+ 项</td>
                <td>公司全额负担，主要险种为雇主险</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>商业险库字段：</strong>险种名称 / 适用城市（<strong>城市专属 1+N 个 / 全国通用</strong>）/ 保险公司 / 保额 / 保费或费率 / <strong>成本单元（月 / 年）</strong> / <strong>生效日期 / 到期日期 / 续保提醒</strong><br/>
            <strong>计算口径：</strong>成本单元 = 月 → 直接进月度福利明细；成本单元 = 年 → 折算到月（保费 / 12）后进月度福利明细<br/>
            <strong>通用性：</strong>当前主用为雇主险，未来可扩展到意外险、医疗补充险、雇主责任险等
          </div>
        </div>

        <div class="card">
          <h3>非全日制社保（仅工伤保险）说明</h3>
          <div class="note">
            <strong>必须购买：</strong>非全日制用工<strong>必须购买社保（仅工伤保险）</strong>，工伤保险是社保五险之一，<strong>非独立险种</strong>。<br/><br/>
            <strong>无"雇主险代替"逻辑：</strong>v2 取消了"雇主险代替工伤险"的设计——商业险（含雇主险）是独立的"商业险"项，与社保（仅工伤保险）<strong>并列存在</strong>，<strong>不互相替代</strong>。<br/><br/>
            <strong>独立性：</strong>商业险（含雇主险）是独立于社保之外的<strong>商业保险</strong>，<strong>不包含在社保体系中</strong>，由商业保险公司承保。
          </div>
        </div>

        <div class="card">
          <h3>社保申报基数</h3>
          <div class="note">
            <strong>全职社保：</strong>按<strong>每月实际收入</strong>（即当月应发总和）作为申报基数，非最低工资标准。每月基数随当月收入浮动。<br/><br/>
            <strong>推拿师特殊说明：</strong>全职推拿师 Lv3 及以上员工不再发放营销折扣补贴、回头客补贴。
          </div>
        </div>

        <div class="card">
          <h3>保障明细生成时机</h3>
          <p>员工福利保障明细由以下事件触发，按用工类型分别处理：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>触发事件</th>
                <th>触发时机</th>
                <th>明细内容</th>
                <th>影响范围</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>员工入职</td>
                <td>入职当日</td>
                <td>生成社保/公积金申报明细（基数占位，待每月结算时按当月应发收入计算）；生成商业险 ↔ 员工关系（必选 1+，非全日制可选）</td>
                <td>全职 / 非全日制 / 兼职</td>
              </tr>
              <tr>
                <td>月度结算</td>
                <td>每月末</td>
                <td>生成当月社保/公积金明细（按城市基准系数）</td>
                <td>全职</td>
              </tr>
              <tr>
                <td>周/月度结算</td>
                <td>每周 / 每月末</td>
                <td>生成商业险明细（按商业险库配置；年付折算到月）</td>
                <td>全职 / 兼职 / 非全日制（选了商业险的）</td>
              </tr>
              <tr>
                <td>调岗调薪</td>
                <td>调整生效日</td>
                <td>重新计算社保/公积金申报基数</td>
                <td>全职</td>
              </tr>
              <tr>
                <td>城市 / 政策变更</td>
                <td>城市生效日</td>
                <td>重新拉取城市基准系数配置</td>
                <td>全职 / 非全日制 / 兼职</td>
              </tr>
              <tr>
                <td>员工离职</td>
                <td>离职当日</td>
                <td>社保/公积金转出；商业险到期</td>
                <td>全职 / 非全日制 / 兼职</td>
              </tr>
              <tr>
                <td>商业险续保</td>
                <td>到期前 N 天</td>
                <td>续保提醒 → HR 操作续保</td>
                <td>全职 / 非全日制 / 兼职</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>说明：</strong>保障明细记录到「员工福利保障」模块，<strong>独立于工资条</strong>，仅用于公司成本统计与员工保障查询。其中：
            <ul>
              <li><strong>社保/公积金 个人部分</strong> → <strong>参与</strong>工资条扣款（作为代扣社保/公积金从员工实发中扣除）</li>
              <li><strong>社保/公积金 公司部分</strong> → 不参与工资条扣款，归入公司成本</li>
              <li><strong>商业险</strong>（含雇主险）→ 不参与工资条扣款，公司全额负担，归入公司成本</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <h3>全额交纳 vs 按基数交纳</h3>
          <p>根据城市基准系数配置，每种保障类型可选择以下交纳模式：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>模式</th>
                <th>适用类型</th>
                <th>计算公式</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>全额交纳</strong></td>
                <td>社保 / 公积金（全职）</td>
                <td>实际薪酬 × 比例</td>
                <td>无下限，按实际工资计算；高薪酬高保障</td>
              </tr>
              <tr>
                <td><strong>按基数交纳</strong></td>
                <td>社保 / 公积金（全职）</td>
                <td>城市标准基数 × 比例（与实际薪酬无关）</td>
                <td>有标准基数限制；统一标准，便于合规</td>
              </tr>
              <tr>
                <td>按基数交纳</td>
                <td>社保（仅工伤保险，非全日制）</td>
                <td>城市标准基数 × 比例</td>
                <td>公司全额负担，与员工实际薪酬无关</td>
              </tr>
              <tr>
                <td>商业险库（独立配置）</td>
                <td>商业险（所有用工类型）</td>
                <td>按商业险库配置（城市专属或全国通用）</td>
                <td><strong>公司全额</strong>，<strong>不参与员工工资计算</strong>；成本单元 = 月 直接进；成本单元 = 年 折算到月（保费 / 12）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>典型配置（示例）：</strong>
            <ul>
              <li>北京社保（全）全额：5000 元 × 16.5%（公司）+ 8.5%（个人）</li>
              <li>北京社保（全）按基数：8000 元 × 16.5%（公司）+ 8.5%（个人）</li>
              <li>北京社保（仅工伤保险，非全日制）：5000 元 × 0.8%（公司全额，个人不缴）</li>
              <li>北京商业险 - 雇主责任险（年付）：1200 元/年 → 月度折算 100 元（公司全额）</li>
              <li>全国通用商业险 - 意外险（月付）：50 元/月（公司全额）</li>
            </ul>
            以上为示例数字，实际以城市基准系数 + 商业险库配置为准。
          </div>
        </div>

        <div class="card">
          <h3>保障模式选择决策</h3>
          <div class="decision-tree">
            <div class="tree-node root">员工福利保障配置</div>
            <div class="tree-children">
              <div class="tree-question">Q: 用工类型？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">全职 → 社保（全）+ 公积金（按城市基准系数）+ 商业险（必选 1+）</div>
                <div class="tree-leaf-sub">  └ 社保/公积金：默认 <strong>全额交纳</strong>（按<strong>每月实际收入</strong>浮动计算）</div>
                <div class="tree-leaf-sub">  └ 特殊政策可配置为 <strong>按基数交纳</strong>（有最低限制，城市标准基数）</div>
                <div class="tree-leaf-sub">  └ 商业险：入职时按入职城市筛选项<strong>必选 1+</strong>（公司全额，不进工资条）</div>
                <div class="tree-leaf primary">非全日制 → 社保（仅工伤保险）必选 + 商业险可选</div>
                <div class="tree-leaf-sub">  └ 社保（仅工伤保险）：<strong>按基数交纳</strong>（公司全额，与实际薪酬无关）</div>
                <div class="tree-leaf-sub">  └ 商业险：<strong>可选</strong>（由办理入职人员决定）</div>
                <div class="tree-leaf-sub">  └ <strong>无"代替"关系</strong>：工伤保险 ≠ 商业险，两者并列</div>
                <div class="tree-leaf primary">兼职 → 商业险（必选 1+）</div>
                <div class="tree-leaf-sub">  └ 商业险：入职时按入职城市筛选项<strong>必选 1+</strong>（公司全额，不进工资条）</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>数据源与获取时机</h3>
          <p>员工福利保障明细的"数据源"和"获取时机"决定了明细的生成规则：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>数据项</th>
                <th>数据源</th>
                <th>获取时机</th>
                <th>触发主体</th>
                <th>多主体支持</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>社保（全）/ 社保（仅工伤保险）/ 公积金</td>
                <td><strong>城市基准系数</strong>（config 表）</td>
                <td>员工入职 / 城市变更 / 政策调整</td>
                <td>HR / 系统配置</td>
                <td>否（1 个员工 1 个城市 1 套系数）</td>
              </tr>
              <tr>
                <td>商业险（含雇主险等）</td>
                <td><strong>商业险库</strong>（独立配置：险种 / 适用城市 / 保费 / 成本单元 / 续保期）</td>
                <td>员工入职时按城市筛选 → 必选 1+（非全日制可选）</td>
                <td>HR 维护 + 办理入职人员选择</td>
                <td>否（1 个员工 1 个入职城市 1 套商业险选择）</td>
              </tr>
              <tr>
                <td>代扣个税（全职）</td>
                <td><strong>百旺服务</strong>（第三方税务 API）</td>
                <td>月末（结算周期结束后）</td>
                <td>百旺服务调用</td>
                <td>否（1 个员工 1 个合同主体）</td>
              </tr>
              <tr>
                <td>代扣个税（非全日制 / 兼职）</td>
                <td>百旺服务（按累计应税收入计算，<strong>不含已预扣</strong>）+ 系统倒序申报</td>
                <td>月末（所有门店周工资条生成后）</td>
                <td>百旺服务调用 + 系统分配</td>
                <td><strong>是</strong>（按申报主体 N 个；<strong>1 门店 = 1 主体</strong>，详见「全局说明」）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>交纳模式变更的影响</h3>
          <p>城市基准系数中每种保障类型的"交纳模式"（全额 / 按基数）可独立配置。模式变更会触发保障明细重算：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>模式变更场景</th>
                <th>触发时机</th>
                <th>影响范围</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>城市政策调整（如社保局变更基数下限 / 调整比例）</td>
                <td>政策生效日</td>
                <td>该城市所有员工</td>
              </tr>
              <tr>
                <td>城市基准系数配置变更（HR 调整 mode / 基数 / 比例）</td>
                <td>配置生效日</td>
                <td>该城市所有员工</td>
              </tr>
              <tr>
                <td>员工城市变更（调店）</td>
                <td>城市生效日</td>
                <td>该员工</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>关键说明：</strong>
            <ul>
              <li>全职社保的<strong>申报基数</strong> = <strong>每月实际收入</strong>，每月随当月应发收入浮动计算（不再是入职首月固定）</li>
              <li>城市基准系数中的<strong>城市标准基数</strong>（按基数交纳用）由城市政策决定，按城市配置周期生效</li>
              <li>模式变更只影响<strong>后续月份</strong>的明细，已生成的过往明细不回溯重算</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <h3>非全日制 / 兼职多主体个税汇总（倒序申报）</h3>
          <p>非全日制 / 兼职员工在 N 个门店产生业绩时，个税按"跨主体累计算税 + 倒序申报"规则处理：</p>

          <div class="decision-tree">
            <div class="tree-node root">月末所有门店周工资条生成完毕</div>
            <div class="tree-children">
              <div class="tree-question">Step 1: 系统汇总所有申报主体的应税收入</div>
              <div class="tree-leaf-sub">  └ <strong>1 门店 = 1 申报主体</strong></div>
              <div class="tree-leaf-sub">  └ 每主体应税收入 = 该门店（主体）下该月（门店总第1级收入 + 门店总第2级收入 - 门店总第1级扣款 - 门店总第2级扣款非预扣）之和（<strong>不含第2级扣款（个税预扣）</strong>，详见「应税收入计算规则」）</div>
              <div class="tree-leaf-sub">  └ <strong>合计累计应税收入</strong> = Σ 各主体应税收入（跨主体累加）</div>

              <div class="tree-question">Step 2: 按<strong>应税收入从大到小</strong>对主体排序（倒序申报排序）</div>
              <div class="tree-leaf-sub">  └ 高应税主体 <strong>先申报</strong> → 累计基数高 → 该主体扣税多</div>
              <div class="tree-leaf-sub">  └ 低应税主体 <strong>后申报</strong> → 按补差计算 → 该主体补缴少（避免大额补缴导致工资条无法发放）</div>

              <div class="tree-question">Step 3: <strong>按倒序依次调用百旺</strong>（每主体 1 次）</div>
              <div class="tree-leaf-sub">  └ 百旺限制：<strong>1 次调用只能申报 1 个主体</strong>，不能跨主体</div>
              <div class="tree-leaf-sub">  └ 每次调用传入：<strong>截至本主体</strong>的累计应税收入 = 本主体应税收入 + 前面已申报所有主体的应税收入之和（实现累进税率的逐级累加）</div>
              <div class="tree-leaf-sub">  └ 百旺按累计预扣预缴表计算 <strong>截至本主体的累计应纳个税</strong>（含前面所有已申报主体）</div>
              <div class="tree-leaf-sub">  └ 返回：<strong>截至本主体的累计应纳个税</strong>（不含已预扣）</div>

              <div class="tree-question">Step 4: 系统侧计算每主体的补缴 / 退税</div>
              <div class="tree-leaf-sub">  └ <strong>本主体补缴 / 退税 = 本次百旺返回的累计应纳个税 − 前面已申报所有主体的累计税额之和</strong></div>
              <div class="tree-leaf-sub">  └ &gt; 0 → 补缴 ｜ &lt; 0 → 退税</div>
              <div class="tree-leaf-sub">  └ 可能跳档：后申报主体补缴额因累进税率跳档而突变</div>

              <div class="tree-question">Step 5: 写入各主体最后一周工资条</div>
              <div class="tree-leaf-sub">  └ 每主体的补缴 / 退税 <strong>作为该主体最后一周工资条的一个扣缴 / 收入项</strong>出现</div>
              <div class="tree-leaf-sub">  └ 不单独生成汇算工资条</div>
            </div>
          </div>

          <div class="note">
            <strong>重要说明（多主体个税）：</strong>
            <ul>
              <li><strong>1 门店 = 1 申报主体</strong></li>
              <li>百旺服务的调用是<strong>按主体 N 次</strong>（<strong>每次 1 个主体</strong>），不是 1 次跨主体调用；累进税通过每次传入"<strong>截至本主体</strong>的累计应税收入"实现逐级累加</li>
              <li>"倒序申报"是<strong>系统侧处理逻辑</strong>，不是百旺直接返回的——百旺只算"截至本主体的累计应纳个税"，分配到各主体的补缴 / 退税由系统算</li>
              <li>每主体独立结算，补缴 / 退税归属该主体，<strong>不与其他主体互抵</strong></li>
              <li>补缴 / 退税从该主体最后一周工资条实发中扣 / 加，<strong>不累积为负工资余额</strong></li>
              <li><strong>倒序申报的业务目的：</strong>累进税率下"高累进段先填满"，使每张工资条的"代扣个税"分布均匀，避免单主体出现大额补缴 / 退税影响工资发放</li>
            </ul>
          </div>
        </div>

        <!-- 城市基准系数（v2：按月实际收入，无固定基数） -->
        <div class="card">
          <h3>城市基准系数（HR 维护，体系最上游）</h3>
          <p>由 HR 维护各城市的社保/公积金<strong>法定缴纳比例</strong>，<strong>无固定基数</strong>，基数 = 每月实际应发收入。</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>字段</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>城市</td>
                <td>如：北京、上海、深圳、杭州</td>
              </tr>
              <tr>
                <td>缴纳类型</td>
                <td>社保 / 公积金</td>
              </tr>
              <tr>
                <td>公司缴纳比例</td>
                <td>法定比例（如：社保 16.5%）</td>
              </tr>
              <tr>
                <td>个人缴纳比例</td>
                <td>法定比例（如：社保 8.5%）</td>
              </tr>
              <tr>
                <td>生效日期</td>
                <td>比例生效的日期，支持政策变更历史追溯</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>计算公式（v2 按月实际收入）：</strong>当月申报基数 = 该月应发收入总和；公司缴纳 = 当月申报基数 × 公司比例；个人缴纳 = 当月申报基数 × 个人比例<br/>
            <strong>示例：</strong>北京社保 1 月应发 8000 → 16.5% × 8000 = 1320（公司）/ 8.5% × 8000 = 680（个人）；2 月应发 9500 → 1567.5/807.5（按比例变化）
          </div>
        </div>

        <!-- 补充：员工福利保障明细 Override 机制 -->
        <div class="card">
          <h3>员工福利保障明细（Override 机制）</h3>
          <p>员工入职时系统自动生成福利明细（初始状态标记为"继承标准"）。<strong>v2 仅"比例"可 Override</strong>，基数按月浮动无需 Override。</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>可 Override 项</th>
                <th>说明</th>
                <th>适用类型</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><s>社保缴纳基数</s></td>
                <td><s>员工申请或公司政策调整</s>（v2 废除：基数按月浮动）</td>
                <td>全职</td>
              </tr>
              <tr>
                <td>社保缴纳比例</td>
                <td>员工申请提高缴纳比例</td>
                <td>全职</td>
              </tr>
              <tr>
                <td><s>公积金缴纳基数</s></td>
                <td><s>员工申请或公司政策调整</s>（v2 废除：基数按月浮动）</td>
                <td>全职</td>
              </tr>
              <tr>
                <td>公积金缴纳比例</td>
                <td>员工自愿提高（如：从 5% 调到 12%）</td>
                <td>全职</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>Override 记录字段：</strong>调整字段 / 原值 / 新值 / 调整原因（员工申请 / 公司政策 / 其他） / 操作人 / 操作时间<br/>
            <strong>薪酬计算时的数据获取：</strong>基数 = 当月应发收入（每月浮动）；比例有 Override → 使用员工配置的值；无 Override → 使用城市基准比例
          </div>
        </div>

        <!-- 补充：月度缴费明细 -->
        <div class="card">
          <h3>月度缴费明细（汇总 + 流水）</h3>
          <p>每月生成 2 份页面，配套展示缴费情况：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>页面</th>
                <th>内容</th>
                <th>用途</th>
                <th>粒度</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>月度汇总</td>
                <td>每人每月的缴纳合计（正常 + 补缴 - 退缴 = 本月合计）</td>
                <td>快速查看每人每月的总缴纳金额</td>
                <td>1 人 1 月 1 行</td>
              </tr>
              <tr>
                <td>流水明细</td>
                <td>每条具体记录（正常/补缴/退缴各是多少）</td>
                <td>查看明细差异，支持手动导入</td>
                <td>1 人 1 月 N 条（按业务发生）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 补充：3 个核心时间字段 -->
        <div class="card">
          <h3>3 个核心时间字段（流水必备，缺一不可）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>字段</th>
                <th>含义</th>
                <th>典型场景示例</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>费用产生月份</strong></td>
                <td>这笔费用"应该归属的月份"（业务发生月）</td>
                <td>2026-01 工资 1 月社保 = 2026-01</td>
              </tr>
              <tr>
                <td><strong>费用归属月份</strong></td>
                <td>这笔费用会计上归属的月份（损益归属月）</td>
                <td>同上，正常情况 = 费用产生月份；补缴时 = 实际业务月</td>
              </tr>
              <tr>
                <td><strong>费用实际缴纳月份</strong></td>
                <td>三方服务实际扣款 / 入账的月份</td>
                <td>2026-01 工资 1 月社保 → 2026-02 实际缴纳</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>滞纳金场景：</strong>费用产生月份 = 2026-01（应缴月），费用归属月份 = 2026-01（损益归属），费用实际缴纳月份 = 2026-03（<strong>滞纳金数据由申报方返回的月份</strong>）—— 三个时间点解耦，体现"逾期未缴"的业务含义
          </div>
        </div>

        <!-- 补充：feeType 划分 + 滞纳金作衍生项 -->
        <div class="card">
          <h3>feeType 划分（流水页分类依据）</h3>
          <p>不同类型的费用走不同的流水页（互相独立）：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>feeType</th>
                <th>对应流水页</th>
                <th>含滞纳金？</th>
                <th>适用对象</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>社保</td>
                <td>社保月度流水</td>
                <td>是（作为衍生项，标注在某条社保记录上）</td>
                <td>全职</td>
              </tr>
              <tr>
                <td>公积金</td>
                <td>公积金月度流水</td>
                <td>是（作为衍生项，标注在某条公积金记录上）</td>
                <td>全职</td>
              </tr>
              <tr>
                <td>社保（仅工伤保险）</td>
                <td>工伤险流水（合入社保或独立）</td>
                <td>否（按基数交纳，无滞纳金）</td>
                <td>非全日制</td>
              </tr>
              <tr>
                <td>商业险</td>
                <td>商业险流水（独立）</td>
                <td>否（公司全额，无滞纳金）</td>
                <td>全职 / 兼职（必选） / 非全日制（可选）</td>
              </tr>
              <tr>
                <td>个税</td>
                <td>个税月度流水</td>
                <td>是（个税滞纳金作为衍生项）</td>
                <td>全职 / 非全日制 / 兼职</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>重要修正（v1 错误 → v2 正确）：</strong><br/>
            v1 旧文档中滞纳金被作为独立 <code>feeType</code> 与 社保/公积金/个税 并列出现在同一张流水里。<br/>
            <strong>v2 正确处理：</strong>滞纳金<strong>不是独立 feeType</strong>，而是<strong>衍生项</strong>——它必须挂在某条已存在的标准缴纳记录上（如"社保滞纳金"、"公积金滞纳金"、"个税滞纳金"），通过该条记录的「调整原因」字段或备注体现。<br/>
            <strong>业务含义：</strong>滞纳金只能"因为"某条标准未按时缴纳才会产生，单独一条"滞纳金"无业务意义。
          </div>
        </div>

        <!-- 补充：数据来源与记录类型 -->
        <div class="card">
          <h3>数据来源 &amp; 记录类型</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>维度</th>
                <th>类型</th>
                <th>说明</th>
                <th>场景</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="2"><strong>数据来源</strong></td>
                <td>三方服务</td>
                <td>百旺等系统自动推送</td>
                <td>正常情况</td>
              </tr>
              <tr>
                <td>手动导入</td>
                <td>人工录入当三方未及时返回时</td>
                <td>滞后/异常</td>
              </tr>
              <tr>
                <td rowspan="3"><strong>记录类型</strong></td>
                <td>正常</td>
                <td>当月正常缴纳</td>
                <td>常规</td>
              </tr>
              <tr>
                <td>补缴</td>
                <td>之前月份漏缴或基数调整补缴</td>
                <td>异常修正</td>
              </tr>
              <tr>
                <td>退缴</td>
                <td>多缴退还（基数下调等）</td>
                <td>异常修正</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>申报主体字段：</strong>流水/汇总必须记录<strong>申报主体</strong>（= 业绩归属主体 = 1 门店对应的法人，详见「全局说明」），多主体员工按主体分行。<br/>
            <strong>门店字段：</strong>展示业绩归属门店（1 门店 = 1 主体，门店即主体）。
          </div>
        </div>

        <!-- 补充：数据流总览 -->
        <div class="card">
          <h3>数据流总览（HR 配置 → 员工福利 → 薪酬计算）</h3>
          <div class="note">
            <ol>
              <li><strong>HR 配置城市基准系数：</strong>城市 + 缴纳类型 → 法定比例（公司/个人），<s>无固定基数</s></li>
              <li><strong>HR 配置岗位薪酬模板：</strong>岗位 + 城市 + 系统项（自动获取，<s>无薪资区间</s>）</li>
              <li><strong>员工入职：</strong>系统按"岗位 → 城市基准 → 员工福利明细"自动生成（标记"继承标准"）</li>
              <li><strong>Override（可选）：</strong>个体微调基数/比例，记录调整原因和操作日志</li>
              <li><strong>薪酬计算：</strong>系统读取员工福利明细，Override 优先；无则用城市基准</li>
              <li><strong>三方服务 / 手动导入：</strong>实际缴费数据回写 → 月度汇总 + 流水明细</li>
            </ol>
            <strong>总结：</strong>员工福利保障体系核心 = "标准继承 + 个体微调"。城市基准系数是最上游的标准化数据，岗位模板引用它形成岗位标准，员工入职时自动继承，特殊情况 Override，整个体系服务于薪酬计算。
          </div>
        </div>
      </div>
</template>
