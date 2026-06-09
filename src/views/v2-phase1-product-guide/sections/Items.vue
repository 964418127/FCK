<template>
      <div id="items" class="section">
        <h2>五、薪酬项范围</h2>

        <!-- 全职 -->
        <div class="card">
          <h3>全职（劳动合同）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>计算公式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="4">第1级</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>订单金额 × 提成比例</td>
              </tr>
              <tr>
                <td>超产值奖金</td>
                <td>收入</td>
                <td>超出部分 × 奖励比例</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>加班时长 × 单价</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>投诉次数 × 单次扣款</td>
              </tr>
              <tr>
                <td>第2级</td>
                <td>保底获豆</td>
                <td>收入</td>
                <td>max(0, 最低工资标准 - 第1级收入之和)</td>
              </tr>
              <tr>
                <td rowspan="3">系统项</td>
                <td>代扣社保</td>
                <td>代扣社保</td>
                <td><strong>老系统接口返回值</strong></td>
              </tr>
              <tr>
                <td>代扣公积金</td>
                <td>代扣公积金</td>
                <td><strong>老系统接口返回值 - 常乐豆抵扣</strong></td>
              </tr>
              <tr>
                <td>代扣个税</td>
                <td>代扣个税</td>
                <td>百旺服务</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 非全日制 -->
        <div class="card">
          <h3>非全日制（劳务协议）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>计算公式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">第1级</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>订单金额 × 提成比例</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>加班时长 × 单价</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>投诉次数 × 单次扣款</td>
              </tr>
              <tr>
                <td>第2级（每工资条）</td>
                <td>个税预扣</td>
                <td>扣缴项</td>
                <td>(全部收入之和 - 全部扣缴之和) × 3%</td>
              </tr>
              <tr>
                <td>系统项（月末汇算）</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>百旺实际税额 - 已预扣合计</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 兼职 -->
        <div class="card">
          <h3>兼职（劳务合作）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>计算公式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">第1级</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>订单金额 × 提成比例</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>加班时长 × 单价</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>投诉次数 × 单次扣款</td>
              </tr>
              <tr>
                <td>第2级（每工资条）</td>
                <td>个税预扣</td>
                <td>扣缴项</td>
                <td>(全部收入之和 - 全部扣缴之和) × 3%</td>
              </tr>
              <tr>
                <td>系统项（月末汇算）</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>百旺实际税额 - 已预扣合计（倒序申报）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 返聘 -->
        <div class="card">
          <h3>返聘（劳务合作-退休返聘）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>计算公式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">第1级</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>订单金额 × 提成比例</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>加班时长 × 单价</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>投诉次数 × 单次扣款</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>代扣个税</td>
                <td>代扣个税</td>
                <td>百旺服务</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

</template>
