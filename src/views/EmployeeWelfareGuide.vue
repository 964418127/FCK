<template>
  <div class="welfare-guide">
    <!-- 悬浮可折叠目录 -->
    <div class="floating-toc" :class="{ collapsed: !tocExpanded }">
      <button class="toc-toggle-btn" :title="tocExpanded ? '收起目录' : '展开目录'" @click="tocExpanded = !tocExpanded">
        <el-icon :size="18">
          <component :is="tocExpanded ? Fold : Expand" />
        </el-icon>
        <span v-show="tocExpanded" class="toc-toggle-label">目录</span>
      </button>
      <transition name="toc-slide">
        <div v-show="tocExpanded" class="toc-panel">
          <ul class="toc-list">
            <li
              v-for="item in tocItems"
              :key="item.id"
              :class="{ active: activeId === item.id }"
            >
              <a :href="'#' + item.id" @click.prevent="scrollToSection(item.id)">
                {{ item.label }}
              </a>
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <div class="page-header">
      <div class="page-header-left">
        <h1>员工福利保障产品需求说明</h1>
        <p class="tip">💡 说明城市基准系数、岗位薪酬模板、员工福利保障、薪酬计算之间的关系</p>
      </div>
      <div class="page-header-right">
        <el-button @click="copyToClipboard">复制</el-button>
        <el-button type="primary" @click="exportToPdf">导出 PDF</el-button>
      </div>
    </div>

    <div class="content-section">
      <!-- 版本日志 -->
      <div id="version" class="section version-log">
        <div class="version-info">
          <span class="version-tag">v2.0</span>
          <span class="version-date">2026-06-02</span>
        </div>
        <h3>核心调整（v1 → v2）</h3>
        <ul>
          <li><strong>废除薪资区间机制</strong>：v1 按"城市+薪资区间"配置基准系数的方式作废，v2 改为<strong>按每月实际收入</strong>申报（浮动基数，每月重新计算）</li>
          <li><strong>城市基准系数字段简化</strong>：去掉"薪资区间"和"固定缴纳基数"两个字段，仅保留<strong>城市 + 缴纳类型 + 公司比例 + 个人比例</strong>，无固定基数</li>
          <li><strong>基数确定时机：</strong>由"入职首月确定"改为"每月结算时按当月应发收入计算"——1月=1月工资，2月=2月工资，以此类推</li>
          <li><strong>Override 范围缩小：</strong>基数不再可 Override（每月浮动），仅保留<strong>公积金/社保 比例</strong>可个体调整</li>
          <li><strong>支持三种用工类型福利差异</strong>：全职（社保+公积金，按月实际收入 + <strong>商业险必选 1+</strong>） / 非全日制（<strong>社保（仅工伤保险）</strong>，按城市基数 + <strong>商业险可选</strong>） / 兼职（<strong>商业险必选 1+</strong>，公司全额）</li>
          <li><strong>新增【商业险】子页面</strong>：员工福利保障分组下，作为<strong>通用险种库</strong>（HR 维护：险种 / 适用城市（城市专属或全国通用）/ 保费 / 成本单元（月或年）/ 续保期）；<strong>入职时由办理入职人员按入职城市筛选项必选 1+</strong>（非全日制可选）；公司全额，<strong>不参与员工工资计算</strong></li>
          <li><strong>城市基准系数"缴纳类型"瘦身：</strong>移除"雇主险"项，归到【商业险】统一管理；保留 <strong>社保（全）/ 社保（仅工伤保险）/ 公积金</strong> 三种</li>
          <li><strong>取消"雇主险代替工伤险"逻辑：</strong>商业险与社保（仅工伤保险）<strong>并列存在</strong>，不互相替代</li>
          <li><strong>多主体申报支持</strong>：1 员工 N 门店 = N 申报主体，福利流水/汇总需按主体分行</li>
        </ul>
        <h3>要点</h3>
        <ul class="conclusions">
          <li>系统项（社保/公积金）根据员工<strong>当月实际收入</strong>自动计算，无须配置固定基数</li>
          <li>城市基准系数只维护<strong>法定比例</strong>（公司/个人），不再维护"基数"</li>
          <li>每月结算时基数 = 当月应发总和，调岗调薪不触发"重新计算基数"（因为每月都重算）</li>
          <li>三方服务未返回时支持手动导入，月度缴费明细需标记数据来源</li>
        </ul>
      </div>

      <!-- 目录 -->
      <div class="toc">
        <h2>目录</h2>
        <ul>
          <li><a href="#version">版本日志</a></li>
          <li><a href="#terms">名词解释</a></li>
          <li><a href="#architecture">一、整体架构</a></li>
          <li><a href="#city-standard">二、城市基准系数</a></li>
          <li><a href="#commercial-insurance">三、商业险</a></li>
          <li><a href="#template">四、岗位薪酬模板与福利关联</a></li>
          <li><a href="#employee-welfare">五、员工福利保障</a></li>
          <li><a href="#monthly-detail">六、月度缴费明细</a></li>
          <li><a href="#data-flow">七、数据流总览</a></li>
        </ul>
      </div>

      <!-- 名词解释 -->
      <div id="terms" class="section" style="margin-top: 24px;">
        <div class="card" style="background: hsl(var(--muted) / 0.3);">
          <h3 style="margin-bottom: 12px;">名词解释</h3>
          <div style="font-size: 13px; line-height: 1.8;">
            <div style="margin-bottom: 8px;"><strong>城市基准系数</strong>：各城市法定的<strong>社保（全）/ 社保（仅工伤保险）/ 公积金</strong> 缴纳比例（公司/个人），由 HR 维护。<strong>无固定基数</strong>，基数=当月实际收入。<strong>v2 已移除"雇主险"项</strong>（归到商业险统一管理）</div>
            <div style="margin-bottom: 8px;"><strong>社保（全）</strong>：五险（养老/医疗/失业/工伤/生育），<strong>全职</strong>足额缴纳</div>
            <div style="margin-bottom: 8px;"><strong>社保（仅工伤保险）</strong>：<strong>非全日制</strong>必须购买；工伤保险是社保五险之一，非独立险种</div>
            <div style="margin-bottom: 8px;"><strong>商业险</strong>：员工福利保障分组下的<strong>通用险种库</strong>（当前主用为雇主险）；HR 维护"险种 / 适用城市（城市专属或全国通用）/ 保险公司 / 保额 / 保费 / 成本单元（月或年）/ 续保期"；入职时由办理入职人员按城市筛选项<strong>必选 1+</strong>（非全日制可选）；公司全额，<strong>不参与员工工资计算</strong></div>
            <div style="margin-bottom: 8px;"><strong>系统项</strong>：薪酬模板中的社保、公积金、个税，由系统根据员工<strong>当月实际收入</strong>自动计算，无需手动填值</div>
            <div style="margin-bottom: 8px;"><strong>Override</strong>：员工福利明细中<strong>比例</strong>的个体微调（如公积金比例 5%→12%）。v2 已废除<strong>基数 Override</strong>，因基数按月浮动</div>
            <div style="margin-bottom: 8px;"><strong>三方服务</strong>：百旺等系统自动推送的社保/公积金/个税缴纳数据</div>
            <div><strong>手动导入</strong>：三方服务未及时返回时，人工录入的缴纳数据</div>
          </div>
        </div>
      </div>

      <!-- 一、整体架构 -->
      <div id="architecture" class="section">
        <h2>一、整体架构</h2>

        <div class="card architecture-card">
          <h2>模块关系图</h2>
          <div class="arch-diagram">
            <div class="arch-row">
              <div class="arch-cell">
                <div class="arch-title">城市基准系数</div>
                <div class="arch-items">
                  <div class="arch-item">
                    <div class="arch-item-title">配置内容</div>
                    <div class="arch-item-desc">城市 + 缴纳类型 → 社保（全）/ 社保（仅工伤）/ 公积金的<strong>法定比例</strong>（公司/个人），无固定基数</div>
                  </div>
                  <div class="arch-item">
                    <div class="arch-item-title">配置者</div>
                    <div class="arch-item-desc">由 HR 根据政策配置，作为所有岗位的基准数据来源</div>
                  </div>
                </div>
              </div>
              <div class="arch-conn">+</div>
              <div class="arch-cell">
                <div class="arch-title">商业险（员工福利保障分组下）</div>
                <div class="arch-items">
                  <div class="arch-item">
                    <div class="arch-item-title">配置内容</div>
                    <div class="arch-item-desc">险种 / 适用城市（<strong>城市专属或全国通用</strong>）/ 保费 / 成本单元（月或年）/ 续保期</div>
                  </div>
                  <div class="arch-item">
                    <div class="arch-item-title">入职时</div>
                    <div class="arch-item-desc">办理入职人员按入职城市筛选项<strong>必选 1+</strong>（非全日制可选）</div>
                  </div>
                </div>
              </div>
              <div class="arch-conn">→</div>
              <div class="arch-cell">
                <div class="arch-title">岗位薪酬模板</div>
                <div class="arch-items">
                  <div class="arch-item">
                    <div class="arch-item-title">关联方式</div>
                    <div class="arch-item-desc">岗位 → 归属城市 → 自动引用城市基准比例（<strong>无薪资区间、无固定基数</strong>）</div>
                  </div>
                  <div class="arch-item highlight">
                    <div class="arch-item-title">系统项配置</div>
                    <div class="arch-item-desc">代扣社保/公积金/个税（扣缴项） → 配置为"自动获取"</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-down"><span>▼ 入职自动生成</span></div>
            <div class="arch-row center">
              <div class="arch-cell highlight">
                <div class="arch-title">员工福利保障</div>
                <div class="arch-items">
                  <div class="arch-item">
                    <div class="arch-item-title">入职时生成</div>
                    <div class="arch-item-desc">员工分配到岗位 → 继承城市基准比例 → 自动生成员工福利明细（基数占位，每月结算时按当月实际收入计算）</div>
                  </div>
                  <div class="arch-item highlight">
                    <div class="arch-item-title">Override机制</div>
                    <div class="arch-item-desc">v2 范围缩小：仅<strong>比例</strong>可个体微调（基数按月浮动，无需 Override）</div>
                  </div>
                  <div class="arch-item">
                    <div class="arch-item-title">变更记录</div>
                    <div class="arch-item-desc">记录调整原因、操作人、时间，支持查看历史变更日志</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-down"><span>▼ 薪酬计算</span></div>
            <div class="arch-row center">
              <div class="arch-cell">
                <div class="arch-title">薪酬计算</div>
                <div class="arch-items">
                  <div class="arch-item">
                    <div class="arch-item-title">数据获取</div>
                    <div class="arch-item-desc">根据员工ID → 查询员工福利明细 → 直接用于薪酬计算</div>
                  </div>
                  <div class="arch-item highlight">
                    <div class="arch-item-title">计算逻辑</div>
                    <div class="arch-item-desc">社保/公积金金额 = <strong>当月应发收入</strong> × 缴纳比例<br/>有 Override 比例 → 使用员工配置的値<br/>无 Override 比例 → 使用城市基准比例</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>模块职责汇总</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>模块</th>
                <th>职责</th>
                <th>配置者</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>城市基准系数</td>
                <td>维护各城市法定的<strong>社保（全）/ 社保（仅工伤保险）/ 公积金</strong> 缴纳比例（公司/个人），无固定基数</td>
                <td>HR</td>
              </tr>
              <tr>
                <td>商业险</td>
                <td>通用险种库（险种 / 适用城市 / 保费 / 成本单元 / 续保期）；入职时由办理入职人员按入职城市筛选项<strong>必选 1+</strong>（非全日制可选）</td>
                <td>HR 维护 + 办理入职人员选择</td>
              </tr>
              <tr>
                <td>岗位薪酬模板</td>
                <td>配置岗位时关联城市（自动引用基准比例），系统项配置为自动获取</td>
                <td>HR/管理者</td>
              </tr>
              <tr>
                <td>员工福利保障</td>
                <td>员工入职时自动生成（含商业险），支持Override微调</td>
                <td>系统自动 + 员工个性化</td>
              </tr>
              <tr>
                <td>薪酬计算</td>
                <td>读取员工福利明细，直接计算系统项金额</td>
                <td>系统自动</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 二、城市基准系数 -->
      <div id="city-standard" class="section">
        <h2>二、城市基准系数</h2>
        <div class="card">
          <h3>数据结构</h3>
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
                <td><strong>社保（全）</strong> / <strong>社保（仅工伤保险）</strong> / <strong>公积金</strong>（v2 已移除"雇主险"）</td>
              </tr>
              <tr>
                <td>公司缴纳比例</td>
                <td>法定比例（如：社保 16.5%、公积金 12%）</td>
              </tr>
              <tr>
                <td>个人缴纳比例</td>
                <td>法定比例（如：社保 8.5%、公积金 12%）</td>
              </tr>
              <tr>
                <td>生效日期</td>
                <td>比例生效的日期，支持政策变更历史追溯</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <h3>计算公式（v2：按月实际收入）</h3>
          <div style="padding: 12px; background: hsl(var(--muted) / 0.3); border-radius: 4px; font-size: 13px;">
            <div style="margin-bottom: 8px;">
              <strong>当月申报基数 = 该月应发收入总和</strong>（不再是入职首月固定，每月浮动）
            </div>
            <div style="margin-bottom: 8px;">
              <strong>公司缴纳 = 当月申报基数 × 公司缴纳比例</strong>
            </div>
            <div style="margin-bottom: 8px;">
              <strong>个人缴纳 = 当月申报基数 × 个人缴纳比例</strong>
            </div>
            <div>
              <strong>合计 = 公司缴纳 + 个人缴纳</strong>
            </div>
          </div>
        </div>
        <div class="card">
          <h3>示例（按月实际收入）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>城市</th>
                <th>缴纳类型</th>
                <th>公司比例</th>
                <th>个人比例</th>
                <th>月份</th>
                <th>当月应发</th>
                <th>公司缴纳</th>
                <th>个人缴纳</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>北京</td>
                <td>社保</td>
                <td>16.5%</td>
                <td>8.5%</td>
                <td>2026-01</td>
                <td>8000</td>
                <td>1320</td>
                <td>680</td>
              </tr>
              <tr>
                <td>北京</td>
                <td>社保</td>
                <td>16.5%</td>
                <td>8.5%</td>
                <td>2026-02</td>
                <td>9500</td>
                <td>1567.5</td>
                <td>807.5</td>
              </tr>
              <tr>
                <td>北京</td>
                <td>公积金</td>
                <td>12%</td>
                <td>12%</td>
                <td>2026-01</td>
                <td>8000</td>
                <td>960</td>
                <td>960</td>
              </tr>
              <tr>
                <td>北京</td>
                <td>公积金</td>
                <td>12%</td>
                <td>12%</td>
                <td>2026-02</td>
                <td>9500</td>
                <td>1140</td>
                <td>1140</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>说明：</strong>同一员工 1 月和 2 月的"当月应发"不同，社保/公积金金额也按比例变化。<br/>
            <strong>关键变化：</strong>与 v1 不同——v1 同一薪资区间内基数固定，v2 每月基数都按当月实际收入重算。
          </div>
        </div>
        <div class="note">
          <strong>说明：</strong>城市基准系数配置后，当城市政策调整时，只需更新比例（不影响历史月度，过去的明细保留当时比例），已入职员工的福利明细不受影响（已生成独立记录），新入职员工使用最新比例
        </div>
      </div>

      <!-- 三、商业险 -->
      <div id="commercial-insurance" class="section">
        <h2>三、商业险</h2>

        <div class="card">
          <h3>定位（员工福利保障分组下的子页面）</h3>
          <p>商业险是员工福利保障的<strong>上游险种库</strong>，作为<strong>通用险种库</strong>——当前主用为雇主险，未来可扩展到意外险、医疗补充险、雇主责任险等。HR 维护险种清单，员工入职时由<strong>办理入职人员</strong>按入职城市筛选项<strong>必选 1 个或多个</strong>（非全日制可选）。</p>
          <div class="note">
            <strong>公司全额：</strong>所有商业险项均为<strong>公司全额</strong>负担，<strong>不参与员工工资计算</strong><br/>
            <strong>系统边界：</strong>入职模块不在本系统，<strong>本系统只做功能、数据提供和说明</strong>，商业险选择的"强制校验"由外部入职系统负责<br/>
            <strong>与城市基准系数的关系：</strong>城市基准系数"缴纳类型"已<strong>移除"雇主险"</strong>，归到【商业险】统一管理
          </div>
        </div>

        <div class="card">
          <h3>数据结构</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>字段</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>险种名称</td>
                <td>如：雇主责任险、意外险、医疗补充险</td>
              </tr>
              <tr>
                <td>适用城市</td>
                <td><strong>城市专属</strong>（1 个或多个城市）<strong>或 全国通用</strong>（不指定城市，所有城市可用）</td>
              </tr>
              <tr>
                <td>保险公司</td>
                <td>承保的商业保险公司</td>
              </tr>
              <tr>
                <td>保额</td>
                <td>保障额度</td>
              </tr>
              <tr>
                <td>保费 / 费率</td>
                <td>由 HR 按城市/产品维护</td>
              </tr>
              <tr>
                <td>成本单元</td>
                <td><strong>月</strong> 或 <strong>年</strong>（HR 设置）</td>
              </tr>
              <tr>
                <td>生效日期 / 到期日期</td>
                <td>支持续保和到期信息记录</td>
              </tr>
              <tr>
                <td>续保提醒</td>
                <td>到期前 N 天通知 HR 进行续保</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>入职时的选择流程</h3>
          <div style="padding: 12px; background: hsl(var(--primary) / 0.05); border: 1px solid hsl(var(--primary) / 0.15); border-radius: 4px; font-size: 13px; line-height: 1.8;">
            <div style="margin-bottom: 8px;"><strong>Step 1：</strong>HR 维护商业险库（险种 / 适用城市 / 保费 / 续保期）</div>
            <div style="margin-bottom: 8px;"><strong>Step 2：</strong>员工入职时，外部入职系统调用本系统查询"该城市可用商业险"</div>
            <div style="margin-bottom: 8px;"><strong>Step 3：</strong>本系统根据<strong>入职城市</strong>自动筛出"城市专属 + 全国通用"的可用商业险列表</div>
            <div style="margin-bottom: 8px;"><strong>Step 4：</strong>办理入职人员从列表中<strong>必选 1 个或多个</strong>（非全日制可选）</div>
            <div><strong>Step 5：</strong>本系统落库：员工福利保障（含商业险字段，<strong>与员工的关系入职时一次性建立</strong>）</div>
          </div>
        </div>

        <div class="card">
          <h3>用工类型 × 商业险约束矩阵</h3>
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
                <td><strong>必选 1+ 项</strong></td>
                <td>从商业险库中按入职城市筛选项选择 1+ 项；公司全额，不参与工资计算</td>
              </tr>
              <tr>
                <td>非全日制</td>
                <td><strong>可选</strong></td>
                <td>由办理入职人员决定；与"社保（仅工伤保险）"是<strong>并列项</strong>，不再有"代替"关系</td>
              </tr>
              <tr>
                <td>兼职</td>
                <td><strong>必选 1+ 项</strong></td>
                <td>从商业险库中按入职城市筛选项选择 1+ 项；公司全额，不参与工资计算</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>计算与归属</h3>
          <div class="note">
            <strong>成本单元 = 月：</strong>直接进月度福利明细<br/>
            <strong>成本单元 = 年：</strong>折算到月（保费 / 12）后进月度福利明细<br/>
            <strong>公司全额承担：</strong>不参与员工工资计算，<strong>不进工资条</strong>，归入公司成本<br/>
            <strong>续保：</strong>到期前通知 HR 续保；续保后重新计算成本单元
          </div>
        </div>

        <div class="card">
          <h3>示例：商业险库配置（节选）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>险种名称</th>
                <th>适用城市</th>
                <th>保费</th>
                <th>成本单元</th>
                <th>生效-到期</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>雇主责任险 - 基础版</td>
                <td>北京、上海</td>
                <td>1200 元/年</td>
                <td>年</td>
                <td>2026-01-01 ~ 2026-12-31</td>
              </tr>
              <tr>
                <td>雇主责任险 - 基础版</td>
                <td>深圳</td>
                <td>1500 元/年</td>
                <td>年</td>
                <td>2026-01-01 ~ 2026-12-31</td>
              </tr>
              <tr>
                <td>意外险 - 通勤版</td>
                <td>全国通用</td>
                <td>50 元/月</td>
                <td>月</td>
                <td>2026-01-01 ~ 长期</td>
              </tr>
              <tr>
                <td>医疗补充险 - 高端版</td>
                <td>全国通用</td>
                <td>200 元/月</td>
                <td>月</td>
                <td>2026-01-01 ~ 长期</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>说明：</strong>同险种在不同城市可能费用不同（如雇主责任险基础版在北京 1200/年，深圳 1500/年），HR 可针对同一险种在不同城市分别维护保费；也可选择"全国通用"配置，一份适用于所有城市。
          </div>
        </div>
      </div>

      <!-- 四、岗位薪酬模板与福利关联 -->
      <div id="template" class="section">
        <h2>四、岗位薪酬模板与福利关联</h2>
        <div class="card">
          <h3>关联方式</h3>
          <div style="padding: 12px; background: hsl(var(--muted) / 0.3); border-radius: 4px; font-size: 13px; line-height: 1.8;">
            <div style="margin-bottom: 8px;">
              <strong>岗位薪酬模板</strong>配置时：
            </div>
            <div style="margin-bottom: 8px;">
              1. 选择 <strong>岗位归属城市</strong>
            </div>
            <div style="margin-bottom: 8px;">
              2. <s>设置薪资区间（v1 已废除）</s>，v2 无需配置区间
            </div>
            <div>
              3. 系统项（社保/公积金）配置为 <strong>"自动获取"</strong>（基数 = 当月实际收入）
            </div>
          </div>
        </div>
        <div class="card">
          <h3>系统项配置</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>系统项</th>
                <th>配置方式</th>
                <th>数据来源</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>代扣社保（扣缴项）</td>
                <td>自动获取</td>
                <td>根据员工<strong>城市 + 当月实际收入</strong> → 查询城市基准比例，自动计算金额</td>
              </tr>
              <tr>
                <td>代扣公积金（扣缴项）</td>
                <td>自动获取</td>
                <td>根据员工<strong>城市 + 当月实际收入</strong> → 查询城市基准比例，自动计算金额</td>
              </tr>
              <tr>
                <td>代扣个税（扣缴项）</td>
                <td>自动计算</td>
                <td>根据税前工资 + 专项附加 + 政策规则计算</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="note">
          <strong>关键点：</strong>薪酬模板中的系统项只是"规则引用"，不是"固定值"。最终员工薪酬计算时，系统根据员工的城市比例 + <strong>当月实际收入</strong> 计算缴纳金额
        </div>
      </div>

      <!-- 五、员工福利保障 -->
      <div id="employee-welfare" class="section">
        <h2>五、员工福利保障</h2>
        <div class="card">
          <h3>生成时机</h3>
          <div style="padding: 12px; background: hsl(var(--muted) / 0.3); border-radius: 4px; font-size: 13px; line-height: 1.8;">
            <div style="margin-bottom: 8px;"><strong>员工入职时</strong>，系统自动生成福利明细：</div>
            <div style="margin-bottom: 8px;">1. 根据岗位 → 找到薪酬模板</div>
            <div style="margin-bottom: 8px;">2. 根据岗位的城市 → 找到城市基准比例（v2 无薪资区间）</div>
            <div>3. 自动生成员工福利明细（初始状态，标记为"继承标准"，<strong>基数占位待每月结算时确定</strong>）</div>
          </div>
        </div>
        <div class="card">
          <h3>Override机制</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>可Override项</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><s>社保缴纳基数</s></td>
                <td><s>员工申请或公司政策调整</s>（v2 废除：基数按月浮动）</td>
              </tr>
              <tr>
                <td>社保缴纳比例</td>
                <td>员工申请提高缴纳比例</td>
              </tr>
              <tr>
                <td><s>公积金缴纳基数</s></td>
                <td><s>员工申请或公司政策调整</s>（v2 废除：基数按月浮动）</td>
              </tr>
              <tr>
                <td>公积金缴纳比例</td>
                <td>员工自愿提高（如：从5%调到12%）</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <h3>Override记录</h3>
          <p>每次Override需记录：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>字段</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>调整字段</td>
                <td>如：公积金基数、社保比例</td>
              </tr>
              <tr>
                <td>原值</td>
                <td>Override前的值</td>
              </tr>
              <tr>
                <td>新值</td>
                <td>Override后的值</td>
              </tr>
              <tr>
                <td>调整原因</td>
                <td>员工申请 / 公司政策 / 薪资调整 / 其他</td>
              </tr>
              <tr>
                <td>操作人</td>
                <td>执行Override的管理员</td>
              </tr>
              <tr>
                <td>操作时间</td>
                <td>精确到分钟</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <h3>薪酬计算时的数据获取</h3>
          <div style="padding: 12px; background: hsl(var(--primary) / 0.05); border: 1px solid hsl(var(--primary) / 0.15); border-radius: 4px;">
            <div style="font-size: 13px; line-height: 2;">
              <div style="margin-bottom: 8px;">
                <strong>薪酬计算 → 获取员工ID → 查询员工福利明细 → 取当月应发收入</strong>
              </div>
              <div style="margin-bottom: 8px;">
                <span style="color: hsl(var(--primary));">基数 = 当月应发收入（每月浮动）</span>
              </div>
              <div style="margin-bottom: 8px;">
                <span style="color: hsl(var(--primary));">比例有 Override → 使用员工配置的値</span>
              </div>
              <div>
                <span style="color: hsl(var(--muted-foreground));">比例无 Override → 使用城市基准比例</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 五、月度缴费明细 -->
      <div id="monthly-detail" class="section">
        <h2>五、月度缴费明细</h2>
        <div class="card">
          <h3>页面类型</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>页面</th>
                <th>内容</th>
                <th>用途</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>月度汇总</td>
                <td>每人每月的缴纳合计（正常+补缴-退缴 = 本月合计）</td>
                <td>快速查看每人每月的总缴纳金额</td>
              </tr>
              <tr>
                <td>流水明细</td>
                <td>每条具体记录（正常/补缴/退缴各是多少）</td>
                <td>查看明细差异，支持手动导入</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <h3>数据来源</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>来源</th>
                <th>说明</th>
                <th>场景</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>三方服务</td>
                <td>百旺等系统自动推送</td>
                <td>正常情况</td>
              </tr>
              <tr>
                <td>手动导入</td>
                <td>人工录入当三方未及时返回时</td>
                <td>滞后/异常</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <h3>记录类型</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>正常</td>
                <td>当月正常缴纳</td>
              </tr>
              <tr>
                <td>补缴</td>
                <td>之前月份漏缴或基数调整补缴</td>
              </tr>
              <tr>
                <td>退缴</td>
                <td>多缴退还（基数下调等）</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <h3>示例：社保月度汇总</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>员工</th>
                <th>月份</th>
                <th>正常缴纳</th>
                <th>补缴</th>
                <th>退缴</th>
                <th>本月合计</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>张三</td>
                <td>2026-02</td>
                <td>800</td>
                <td>20</td>
                <td>0</td>
                <td>820</td>
              </tr>
              <tr>
                <td>李四</td>
                <td>2026-03</td>
                <td>500</td>
                <td>0</td>
                <td>50</td>
                <td>450</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <h3>示例：社保月度流水明细（张三，2026-01）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>员工</th>
                <th>费用类型</th>
                <th>费用产生月份</th>
                <th>费用归属月份</th>
                <th>费用实际缴纳月份</th>
                <th>类型</th>
                <th>金额</th>
                <th>来源</th>
                <th>调整原因</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>张三</td>
                <td>社保</td>
                <td>2026-01</td>
                <td>2026-01</td>
                <td>2026-02</td>
                <td><el-tag size="small" type="success">正常</el-tag></td>
                <td>800</td>
                <td><span class="source-tag third-party">三方服务</span></td>
                <td>-</td>
              </tr>
              <tr>
                <td>张三</td>
                <td>公积金</td>
                <td>2026-01</td>
                <td>2026-01</td>
                <td>2026-02</td>
                <td><el-tag size="small" type="success">正常</el-tag></td>
                <td>960</td>
                <td><span class="source-tag third-party">三方服务</span></td>
                <td>-</td>
              </tr>
              <tr>
                <td>张三</td>
                <td>个税</td>
                <td>2026-01</td>
                <td>2026-01</td>
                <td>2026-02</td>
                <td><el-tag size="small" type="success">正常</el-tag></td>
                <td>680</td>
                <td><span class="source-tag third-party">三方服务</span></td>
                <td>-</td>
              </tr>
              <tr>
                <td>张三</td>
                <td>滞纳金</td>
                <td>2026-01</td>
                <td>2026-01</td>
                <td>2026-03</td>
                <td><el-tag size="small" type="warning">滞纳</el-tag></td>
                <td>50</td>
                <td><span class="source-tag third-party">三方服务</span></td>
                <td>社保逾期未缴产生滞纳金</td>
              </tr>
              <tr>
                <td>张三</td>
                <td>滞纳金</td>
                <td>2026-01</td>
                <td>2026-01</td>
                <td>2026-03</td>
                <td><el-tag size="small" type="warning">滞纳</el-tag></td>
                <td>30</td>
                <td><span class="source-tag third-party">三方服务</span></td>
                <td>公积金逾期未缴产生滞纳金</td>
              </tr>
              <tr>
                <td>张三</td>
                <td>社保</td>
                <td>2026-02</td>
                <td>2026-02</td>
                <td>2026-02</td>
                <td><el-tag size="small" type="warning">补缴</el-tag></td>
                <td>20</td>
                <td><span class="source-tag third-party">三方服务</span></td>
                <td>基数调整补缴</td>
              </tr>
              <tr>
                <td>张三</td>
                <td>社保</td>
                <td>2026-03</td>
                <td>2026-03</td>
                <td>2026-03</td>
                <td><el-tag size="small" type="danger">退缴</el-tag></td>
                <td>50</td>
                <td><span class="source-tag manual">手动导入</span></td>
                <td>基数下调退缴</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 六、数据流总览 -->
      <div id="data-flow" class="section">
        <h2>六、数据流总览</h2>

        <div class="card architecture-card">
          <h2>完整数据流</h2>
          <div class="arch-diagram">
            <div class="arch-row">
              <div class="arch-cell">
                <div class="arch-title">HR / 管理员</div>
                <div class="arch-items">
                  <div class="arch-item">
                    <div class="arch-item-title">配置城市基准系数</div>
                    <div class="arch-item-desc">城市 + 缴纳类型 → <strong>法定比例</strong>（公司/个人），无固定基数</div>
                  </div>
                  <div class="arch-item">
                    <div class="arch-item-title">配置岗位薪酬模板</div>
                    <div class="arch-item-desc">岗位 + <strong>城市</strong> + 系统项（自动获取，<s>无薪资区间</s>）</div>
                  </div>
                </div>
              </div>
              <div class="arch-conn">→</div>
              <div class="arch-cell">
                <div class="arch-title">员工入职</div>
                <div class="arch-items">
                  <div class="arch-item highlight">
                    <div class="arch-item-title">系统自动生成福利明细</div>
                    <div class="arch-item-desc">岗位 → 城市 → 城市基准比例 → 员工福利明细（<strong>基数每月按当月实际收入计算</strong>）</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-down"><span>▼ 员工福利明细</span></div>
            <div class="arch-row center">
              <div class="arch-cell highlight">
                <div class="arch-title">员工福利明细</div>
                <div class="arch-items">
                  <div class="arch-item">
                    <div class="arch-item-title">继承标准</div>
                    <div class="arch-item-desc">初始状态，标记来源</div>
                  </div>
                  <div class="arch-item highlight">
                    <div class="arch-item-title">支持Override</div>
                    <div class="arch-item-desc">个体微调，记录日志</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-down"><span>▼ 薪酬计算</span></div>
            <div class="arch-row center">
              <div class="arch-cell">
                <div class="arch-title">薪酬计算</div>
                <div class="arch-items">
                  <div class="arch-item highlight">
                    <div class="arch-item-title">系统读取员工福利明细</div>
                    <div class="arch-item-desc">Override优先 → 无则用城市基准系数</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>三方 vs 手动</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>场景</th>
                <th>处理方式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>三方服务正常返回</td>
                <td>自动更新月度缴费明细，标记来源为"三方服务"</td>
              </tr>
              <tr>
                <td>三方服务未及时返回</td>
                <td>支持手动导入，标记来源为"手动导入"</td>
              </tr>
              <tr>
                <td>数据异常需修正</td>
                <td>在流水明细页面编辑，保留修改记录</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="note">
          <strong>总结：</strong>员工福利保障体系的核心是"标准继承 + 个体微调"。城市基准系数是最上游的标准化数据，岗位薪酬模板引用它形成岗位标准，员工入职时自动继承，特殊情况可Override。整个体系服务于薪酬计算，确保系统项（社保/公积金）能自动、准确地获取。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Fold, Expand } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// ===== 悬浮目录 =====
const tocExpanded = ref(false)
const activeId = ref('version')
const tocItems = [
  { id: 'version', label: '版本日志' },
  { id: 'terms', label: '名词解释' },
  { id: 'architecture', label: '一、整体架构' },
  { id: 'city-standard', label: '二、城市基准系数' },
  { id: 'template', label: '三、岗位薪酬模板与福利关联' },
  { id: 'employee-welfare', label: '四、员工福利保障' },
  { id: 'monthly-detail', label: '五、月度缴费明细' },
  { id: 'data-flow', label: '六、数据流总览' }
]

let observer = null
onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .map(e => ({ id: e.target.id, top: e.boundingClientRect.top }))
      .sort((a, b) => a.top - b.top)
    if (visible.length > 0) {
      activeId.value = visible[0].id
    }
  }, {
    rootMargin: '-10% 0px -70% 0px',
    threshold: 0
  })
  tocItems.forEach(item => {
    const el = document.getElementById(item.id)
    if (el) observer.observe(el)
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}

const copyToClipboard = async () => {
  const element = document.querySelector('.content-section')
  try {
    const htmlContent = element.innerHTML
    const textContent = element.innerText
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const clipboardItem = new ClipboardItem({
      'text/html': blob,
      'text/plain': new Blob([textContent], { type: 'text/plain' })
    })
    await navigator.clipboard.write([clipboardItem])
    ElMessage.success('已复制到剪贴板，可直接粘贴到飞书')
  } catch (error) {
    // fallback to plain text
    try {
      await navigator.clipboard.writeText(element.innerText)
      ElMessage.success('已复制纯文本到剪贴板')
    } catch (err) {
      ElMessage.error('复制失败')
    }
  }
}

const exportToPdf = async () => {
  const element = document.querySelector('.content-section')
  try {
    ElMessage.info('正在生成PDF，请稍候...')
    const canvas = await html2canvas(element, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 190
    const pageHeight = 277
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 10

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    pdf.save('员工福利保障产品需求说明.pdf')
    ElMessage.success('PDF导出成功')
  } catch (error) {
    ElMessage.error('PDF导出失败')
  }
}
</script>

<style scoped>
.welfare-guide {
  padding: 0;
}

/* ===== 悬浮可折叠目录 ===== */
.floating-toc {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: width 0.25s ease, height 0.25s ease, border-radius 0.25s ease, background 0.25s ease, border-color 0.25s ease;
  overflow: hidden;
}

.floating-toc.collapsed {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.floating-toc:not(.collapsed) {
  width: 240px;
  max-width: calc(100vw - 40px);
}

.toc-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 44px;
  padding: 0 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  transition: all 0.2s;
}

.floating-toc.collapsed .toc-toggle-btn {
  color: hsl(var(--primary-foreground));
  padding: 0;
}

.floating-toc:not(.collapsed) .toc-toggle-btn {
  border-bottom: 1px solid hsl(var(--border));
  color: hsl(var(--primary));
}

.toc-toggle-btn:hover {
  opacity: 0.85;
}

.toc-toggle-label {
  font-size: 14px;
  font-weight: 600;
}

.toc-panel {
  max-height: calc(100vh - 160px);
  overflow-y: auto;
}

.toc-list {
  list-style: none;
  padding: 6px 0;
  margin: 0;
}

.toc-list li {
  margin: 0;
}

.toc-list li a {
  display: block;
  padding: 7px 16px 7px 14px;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  font-size: 13px;
  line-height: 1.4;
  border-left: 2px solid transparent;
  transition: all 0.15s ease;
  cursor: pointer;
}

.toc-list li a:hover {
  background: hsl(var(--muted) / 0.4);
  color: hsl(var(--foreground));
}

.toc-list li.active a {
  color: hsl(var(--primary));
  border-left-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.06);
  font-weight: 500;
}

.toc-panel::-webkit-scrollbar { width: 4px; }
.toc-panel::-webkit-scrollbar-track { background: transparent; }
.toc-panel::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 2px; }
.toc-panel::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }

.toc-slide-enter-active, .toc-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.toc-slide-enter-from, .toc-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 1200px) {
  .floating-toc:not(.collapsed) {
    width: 200px;
  }
}
@media (max-width: 768px) {
  .floating-toc {
    right: 12px;
    top: 50%;
  }
  .floating-toc:not(.collapsed) {
    width: 180px;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.page-header-left {
  flex: 1;
}

.page-header-right {
  display: flex;
  gap: 8px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: hsl(var(--foreground));
}

.page-header .tip {
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  margin: 0;
}

.content-section {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.section {
  margin-top: 32px;
}

.section:first-of-type {
  margin-top: 0;
}

.section h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: hsl(var(--foreground));
  padding-bottom: 8px;
  border-bottom: 2px solid hsl(var(--border));
}

.version-log {
  background: hsl(var(--muted) / 0.3);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.version-tag {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.version-date {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.version-log h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: hsl(var(--foreground));
}

.version-log ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.8;
  color: hsl(var(--foreground));
}

.conclusions {
  background: hsl(var(--primary) / 0.08);
  padding: 12px 16px;
  border-radius: 4px;
  border-left: 3px solid hsl(var(--primary));
}

.toc {
  margin-top: 24px;
  padding: 16px;
  background: hsl(var(--muted) / 0.3);
  border-radius: 8px;
}

.toc h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: hsl(var(--foreground));
}

.toc ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.toc li {
  margin-bottom: 8px;
}

.toc a {
  color: hsl(var(--primary));
  text-decoration: none;
  font-size: 14px;
}

.toc a:hover {
  text-decoration: underline;
}

.card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.card h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: hsl(var(--foreground));
}

.card p {
  font-size: 13px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
  margin: 0;
}

.architecture-card {
  background: hsl(var(--muted) / 0.2);
}

.arch-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 16px 0;
}

.arch-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.arch-row.center {
  justify-content: center;
}

.arch-cell {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 12px 20px;
  text-align: center;
  min-width: 240px;
  max-width: 280px;
}

.arch-cell.highlight {
  background: hsl(var(--primary) / 0.08);
  border-color: hsl(var(--primary) / 0.3);
  box-shadow: 0 0 0 1px hsl(var(--primary) / 0.15);
}

.arch-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
}

.arch-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.arch-item {
  padding: 6px 8px;
  background: hsl(var(--muted) / 0.3);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
}

.arch-item.highlight {
  background: hsl(var(--primary) / 0.08);
  border: 1px solid hsl(var(--primary) / 0.2);
}

.arch-item-title {
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 2px;
}

.arch-item-desc {
  color: hsl(var(--muted-foreground));
}

.arch-sub {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-bottom: 6px;
}

.arch-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.arch-conn {
  font-size: 20px;
  color: hsl(var(--primary));
  font-weight: 600;
}

.arch-down {
  text-align: center;
  padding: 6px 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.arch-arrow {
  text-align: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  padding: 2px 0;
  letter-spacing: -2px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-top: 8px;
}

.data-table th,
.data-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid hsl(var(--border));
}

.data-table th {
  background: hsl(var(--muted) / 0.3);
  font-weight: 600;
  color: hsl(var(--foreground));
}

.data-table td {
  color: hsl(var(--foreground));
}

.data-table tbody tr:hover {
  background: hsl(var(--muted) / 0.2);
}

.note {
  background: hsl(var(--primary) / 0.08);
  border-left: 3px solid hsl(var(--primary));
  padding: 12px 16px;
  border-radius: 0 4px 4px 0;
  font-size: 13px;
  line-height: 1.6;
  color: hsl(var(--foreground));
  margin-top: 16px;
}

.source-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}
.source-tag.third-party { background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); }
.source-tag.manual { background: hsl(var(--warning) / 0.1); color: hsl(var(--warning)); }
</style>