<template>
  <div class="welfare-guide">
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
          <span class="version-tag">v1.0</span>
          <span class="version-date">2026-05-25</span>
        </div>
        <h3>核心调整</h3>
        <ul>
          <li><strong>新增城市基准系数</strong>：按城市+薪资区间配置社保/公积金缴纳标准</li>
          <li><strong>建立福利保障体系</strong>：城市基准系数 → 岗位薪酬模板 → 员工福利保障 → 薪酬计算</li>
          <li><strong>支持个体微调Override</strong>：员工福利明细支持继承标准后的个体调整</li>
          <li><strong>月度缴费明细拆分</strong>：汇总（每人每月合计） + 流水明细（每条记录）</li>
        </ul>
        <h3>要点</h3>
        <ul class="conclusions">
          <li>系统项（社保/公积金）根据员工的城市和薪资基数<strong>自动获取</strong>，无需手动配置</li>
          <li>员工福利明细是最终计算依据，Override优先级最高</li>
          <li>三方服务未返回时，支持手动导入，月度缴费明细需标记数据来源</li>
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
          <li><a href="#template">三、岗位薪酬模板与福利关联</a></li>
          <li><a href="#employee-welfare">四、员工福利保障</a></li>
          <li><a href="#monthly-detail">五、月度缴费明细</a></li>
          <li><a href="#data-flow">六、数据流总览</a></li>
        </ul>
      </div>

      <!-- 名词解释 -->
      <div id="terms" class="section" style="margin-top: 24px;">
        <div class="card" style="background: hsl(var(--muted) / 0.3);">
          <h3 style="margin-bottom: 12px;">名词解释</h3>
          <div style="font-size: 13px; line-height: 1.8;">
            <div style="margin-bottom: 8px;"><strong>城市基准系数</strong>：各城市在不同薪资区间下的社保/公积金缴纳标准（基数、比例），由HR维护</div>
            <div style="margin-bottom: 8px;"><strong>系统项</strong>：薪酬模板中的社保、公积金、个税，由系统根据员工信息自动计算，无需手动填值</div>
            <div style="margin-bottom: 8px;"><strong>Override</strong>：员工福利明细继承岗位标准后的个体微调，Override后的值优先级最高</div>
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
                    <div class="arch-item-desc">城市 + 薪资区间 → 社保基数/比例、公积金基数/比例</div>
                  </div>
                  <div class="arch-item">
                    <div class="arch-item-title">配置者</div>
                    <div class="arch-item-desc">由 HR 根据政策配置，作为所有岗位的基准数据来源</div>
                  </div>
                </div>
              </div>
              <div class="arch-conn">→</div>
              <div class="arch-cell">
                <div class="arch-title">岗位薪酬模板</div>
                <div class="arch-items">
                  <div class="arch-item">
                    <div class="arch-item-title">关联方式</div>
                    <div class="arch-item-desc">岗位 → 归属城市 → 薪资区间 → 自动引用城市基准系数</div>
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
                    <div class="arch-item-desc">员工分配到岗位 → 继承岗位的薪资区间 → 自动生成员工福利明细</div>
                  </div>
                  <div class="arch-item highlight">
                    <div class="arch-item-title">Override机制</div>
                    <div class="arch-item-desc">支持个体微调基数、比例，记录调整原因和操作日志</div>
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
                    <div class="arch-item-desc">社保/公积金金额 = 缴纳基数 × 缴纳比例<br/>有Override → 使用员工配置的値<br/>无Override → 使用城市基准系数</div>
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
                <td>维护各城市+薪资区间的社保/公积金缴纳标准</td>
                <td>HR</td>
              </tr>
              <tr>
                <td>岗位薪酬模板</td>
                <td>配置岗位时引用薪资区间，系统项配置为自动获取</td>
                <td>HR/管理者</td>
              </tr>
              <tr>
                <td>员工福利保障</td>
                <td>员工入职时自动生成，支持Override微调</td>
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
                <td>薪资区间</td>
                <td>如：3000-5000、5000-10000、10000-20000</td>
              </tr>
              <tr>
                <td>缴纳类型</td>
                <td>社保 / 公积金</td>
              </tr>
              <tr>
                <td>缴纳基数</td>
                <td>根据薪资区间确定</td>
              </tr>
              <tr>
                <td>公司缴纳比例</td>
                <td>法定比例（如：社保16.5%）</td>
              </tr>
              <tr>
                <td>个人缴纳比例</td>
                <td>法定比例（如：社保8.5%）</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <h3>计算公式</h3>
          <div style="padding: 12px; background: hsl(var(--muted) / 0.3); border-radius: 4px; font-size: 13px;">
            <div style="margin-bottom: 8px;">
              <strong>公司缴纳 = 缴纳基数 × 公司缴纳比例</strong>
            </div>
            <div style="margin-bottom: 8px;">
              <strong>个人缴纳 = 缴纳基数 × 个人缴纳比例</strong>
            </div>
            <div>
              <strong>合计 = 公司缴纳 + 个人缴纳</strong>
            </div>
          </div>
        </div>
        <div class="card">
          <h3>示例</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>城市</th>
                <th>薪资区间</th>
                <th>缴纳类型</th>
                <th>缴纳基数</th>
                <th>公司比例</th>
                <th>个人比例</th>
                <th>公司缴纳</th>
                <th>个人缴纳</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>北京</td>
                <td>5000-10000</td>
                <td>社保</td>
                <td>8000</td>
                <td>16.5%</td>
                <td>8.5%</td>
                <td>1320</td>
                <td>680</td>
              </tr>
              <tr>
                <td>北京</td>
                <td>5000-10000</td>
                <td>公积金</td>
                <td>8000</td>
                <td>12%</td>
                <td>12%</td>
                <td>960</td>
                <td>960</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="note">
          <strong>说明：</strong>城市基准系数配置后，当城市政策调整时，只需更新基准库，已入职员工的福利明细不受影响（已生成独立记录），新入职员工使用最新基准
        </div>
      </div>

      <!-- 三、岗位薪酬模板与福利关联 -->
      <div id="template" class="section">
        <h2>三、岗位薪酬模板与福利关联</h2>
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
              2. 设置 <strong>薪资区间</strong>（如：5000-10000）
            </div>
            <div>
              3. 系统项（社保/公积金）配置为 <strong>"自动获取"</strong>
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
                <td>根据员工城市+薪资区间 → 查询城市基准系数</td>
              </tr>
              <tr>
                <td>代扣公积金（扣缴项）</td>
                <td>自动获取</td>
                <td>根据员工城市+薪资区间 → 查询城市基准系数</td>
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
          <strong>关键点：</strong>薪酬模板中的系统项只是"规则引用"，不是"固定值"。最终员工薪酬计算时，系统根据员工的城市+薪资自动获取缴纳标准
        </div>
      </div>

      <!-- 四、员工福利保障 -->
      <div id="employee-welfare" class="section">
        <h2>四、员工福利保障</h2>
        <div class="card">
          <h3>生成时机</h3>
          <div style="padding: 12px; background: hsl(var(--muted) / 0.3); border-radius: 4px; font-size: 13px; line-height: 1.8;">
            <div style="margin-bottom: 8px;"><strong>员工入职时</strong>，系统自动生成福利明细：</div>
            <div style="margin-bottom: 8px;">1. 根据岗位 → 找到薪酬模板</div>
            <div style="margin-bottom: 8px;">2. 根据岗位的薪资区间 → 找到城市基准系数</div>
            <div>3. 自动生成员工福利明细（初始状态，标记为"继承标准"）</div>
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
                <td>社保缴纳基数</td>
                <td>员工申请或公司政策调整</td>
              </tr>
              <tr>
                <td>社保缴纳比例</td>
                <td>员工申请提高缴纳比例</td>
              </tr>
              <tr>
                <td>公积金缴纳基数</td>
                <td>员工申请或公司政策调整</td>
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
                <strong>薪酬计算 → 获取员工ID → 查询员工福利明细</strong>
              </div>
              <div style="margin-bottom: 8px;">
                <span style="color: hsl(var(--primary));">有Override → 使用员工配置的値</span>
              </div>
              <div>
                <span style="color: hsl(var(--muted-foreground));">无Override → 使用城市基准系数</span>
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
                    <div class="arch-item-desc">城市 + 薪资区间 → 缴纳标准</div>
                  </div>
                  <div class="arch-item">
                    <div class="arch-item-title">配置岗位薪酬模板</div>
                    <div class="arch-item-desc">岗位 + 薪资区间 + 系统项（自动获取）</div>
                  </div>
                </div>
              </div>
              <div class="arch-conn">→</div>
              <div class="arch-cell">
                <div class="arch-title">员工入职</div>
                <div class="arch-items">
                  <div class="arch-item highlight">
                    <div class="arch-item-title">系统自动生成福利明细</div>
                    <div class="arch-item-desc">岗位 → 薪资区间 → 城市基准系数 → 员工福利明细</div>
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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