# 常乐豆使用明细页面 PRD

| 版本 | 日期 | 更新说明 | 作者 |
|-----|------|--------|-----|
| v1.0 | 2026-04-17 | 初始版本 | - |

---

## 1. 产品概述

### 1.1 产品背景

常乐豆是平台为员工提供的虚拟积分资产，可用于提现、消费及退货等场景。常乐豆使用明细页面为管理员和员工提供完整的交易记录查询能力，支持多维度筛选、数据导出和分页浏览，帮助各方清晰掌握常乐豆的收支变动情况。

### 1.2 产品目标

- 为管理员提供全平台常乐豆使用明细的查看与导出能力
- 为员工提供个人常乐豆交易记录的查询能力
- 支持多维度组合筛选，快速定位目标记录
- 实现数据导出，支持线下分析与存档

### 1.3 术语定义

| 术语 | 定义 |
|-----|------|
| 常乐豆 | 平台为员工发放的虚拟积分，可提现、消费或退货 |
| 余额账户 | 员工的常乐豆主账户类型 |
| 提现 | 员工将常乐豆兑换为现金的操作 |
| 消费 | 使用常乐豆购买商品或服务的操作 |
| 退货 | 因消费产生的常乐豆退还操作 |
| 结算 | 平台与员工之间的常乐豆结算操作 |

---

## 2. 用户角色与权限

| 角色 | 可见范围 | 可操作功能 |
|-----|---------|-----------|
| 管理员 | 全平台所有员工的明细记录 | 查询、筛选、导出 |
| 员工 | 仅本人（通过路由参数传入 employeeId）的明细记录 | 查询、筛选、导出（仅本人数据） |

> 实际权限控制需结合 ABAC 数据权限体系实现，详见 [ABAC数据权限设计案例](./ABAC数据权限设计案例.md)。

---

## 3. 页面结构

### 3.1 页面路径

| 路径 | 说明 |
|-----|------|
| `/bean-usage-detail` | 管理员视图：查看所有员工明细 |
| `/bean-usage-detail?employeeId=xxx&employeeName=xxx&month=YYYY-MM` | 员工个人视图：由其他页面跳转传入，带默认筛选条件 |

### 3.2 布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  [页面标题: 常乐豆使用明细]                    [导出按钮]    │  ← Card Header
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  月份 | 使用类型 | 单号 | 发起时间 | 完成时间 | ...  │   │  ← Search Section
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  表格 (18列)                                                │  ← Table Section
│  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬...             │
│  │月份│类型│单号│姓名│部门│岗位│工号│主服务│劳动关系│...  │
│  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴...             │
├─────────────────────────────────────────────────────────────┤
│                                    [分页组件: 10/20/50/100] │  ← Pagination
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 功能详细说明

### 4.1 搜索筛选

#### 4.1.1 筛选字段清单

| 字段名 | 控件类型 | 格式要求 | 默认值 | 说明 |
|-------|---------|---------|-------|------|
| 月份 | el-date-picker (month) | YYYY-MM | 透传 query.month 或空 | 按交易月份筛选 |
| 使用类型 | el-select | - | 空（全部） | 提现/消费/退货 |
| 单号 | el-input | 字符串 | 空 | 精确匹配交易单号 |
| 发起时间 | el-date-picker (datetime) | - | 空 | 交易发起时间范围起点 |
| 完成时间 | el-date-picker (datetime) | - | 空 | 交易发起时间范围终点 |
| 姓名&工号 | el-input | 字符串 | 透传 query.employeeName 或空 | 模糊匹配姓名或工号 |
| 部门 | el-input | 字符串 | 空 | 模糊匹配部门名称 |
| 岗位 | el-input | 字符串 | 空 | 模糊匹配岗位名称 |
| 主服务门店 | el-input | 名称或编码 | 空 | 模糊匹配主服务门店 |
| 劳动关系门店 | el-input | 名称或编码 | 空 | 模糊匹配劳动关系门店 |
| 合同主体 | el-input | 字符串 | 空 | 模糊匹配合同主体名称 |
| 状态 | el-select | - | 空（全部） | 见 4.1.2 状态枚举 |
| 账户类型 | el-select | - | balance | 目前仅支持余额账户 |

#### 4.1.2 状态枚举值

| 状态值 | 显示文本 | 适用类型 |
|-------|---------|---------|
| settlement_initiated | 结算发起 | 结算 |
| settlement_success | 结算成功 | 结算 |
| settlement_failed | 结算失败 | 结算 |
| withdrawal_frozen | 提现冻结 | 提现 |
| withdrawal_success | 提现成功 | 提现 |
| withdrawal_failed | 提现失败 | 提现 |
| consumption_frozen | 消费冻结 | 消费 |
| consumption_success | 消费成功 | 消费 |
| consumption_failed | 消费失败 | 消费 |
| refund_refunding | 退货中 | 退货 |
| refund_refunded | 退货成功 | 退货 |
| refund_refundFailed | 退货失败 | 退货 |

#### 4.1.3 操作按钮

| 按钮 | 行为 |
|-----|------|
| 查询 | 携带当前所有筛选条件，重新请求表格数据，重置分页到第1页 |
| 重置 | 清空所有筛选条件（账户类型恢复为 balance，姓名&工号恢复为 query.employeeName），分页重置为第1页 |

### 4.2 数据表格

#### 4.2.1 字段清单

| 字段名 | 宽度 | 内容渲染规则 |
|-------|-----|------------|
| 月份 | 120px | 文本直接展示，格式 YYYY-MM |
| 使用类型 | 120px | el-tag 展示：`warning`→提现，`primary`→消费，`success`→退货 |
| 单号 | 200px | 文本直接展示 |
| 姓名 | 100px | 文本直接展示 |
| 部门 | 150px | 文本直接展示 |
| 岗位 | 150px | 文本直接展示 |
| 工号 | 100px | 文本直接展示 |
| 主服务门店 | 150px | 文本直接展示 |
| 劳动关系门店 | 150px | 文本直接展示 |
| 合同主体 | 200px | 文本直接展示 |
| 数量 | 120px | `refund` 类型显示 `+{amount}`，其他类型显示 `-{amount}` |
| 交易前余额 | 120px | 文本直接展示 |
| 交易后余额 | 120px | el-tag `type="success"` 绿色标签展示 |
| 账户类型 | 120px | el-tag `type="info"` 蓝色标签，"balance" 显示为"余额账户" |
| 发起时间 | 180px | 文本，格式 YYYY-MM-DD HH:mm:ss |
| 完成时间 | 180px | 文本，格式 YYYY-MM-DD HH:mm:ss |
| 交易金额 | 120px | 文本直接展示 |
| 状态 | 120px | el-tag 展示，颜色规则见 4.2.2 |

#### 4.2.2 状态标签颜色规则

| 状态语义 | Tag Type |
|---------|-----------|
| frozen / refunding（进行中/冻结） | `warning` |
| success / refunded（成功） | `success` |
| failed / refundFailed（失败） | `danger` |
| 其他 | `info` |

#### 4.2.3 状态文本映射

| 状态值 | 类型=提现 | 类型=消费 | 类型=结算 | 类型=退货 |
|-------|---------|---------|---------|---------|
| frozen | 冻结 | 冻结 | 结算冻结 | 退货中 |
| success | 提现成功 | 消费成功 | 结算成功 | 退货成功 |
| failed | 提现失败 | 消费失败 | 结算失败 | 退货失败 |

### 4.3 分页

| 配置项 | 可选值 |
|-------|-------|
| 每页条数 | 10 / 20 / 50 / 100 |
| 布局 | total, sizes, prev, pager, next, jumper |
| 切换行为 | 切换每页数量时回到第1页；切换页码时加载对应页数据 |

### 4.4 导出

- 触发方式：点击卡片Header右侧「导出」按钮
- 导出范围：当前筛选条件下的**全部数据**（非仅当前页）
- 导出格式：Excel（.xlsx）
- 权限控制：管理员导出全部数据，员工仅能导出本人数据

---

## 5. 业务规则

### 5.1 数量显示规则

- **提现/消费**：数量前加 `-` 符号，表示扣除
- **退货**：数量前加 `+` 符号，表示返还

### 5.2 筛选联动规则

- 员工视图下（存在 query.employeeId），「姓名&工号」字段由路由参数预填充且**禁止修改**
- 切换「月份」时，若员工当月无数据，表格显示空

### 5.3 权限数据隔离规则

| 角色 | 数据范围 |
|-----|---------|
| 管理员 | 可查询全平台所有员工的所有字段 |
| 员工 | 仅能查询本人（匹配 employeeId）的记录，且部分敏感字段可能需脱敏展示 |

---

## 6. 数据结构

### 6.1 搜索表单 Model

```typescript
interface SearchForm {
  month: string           // YYYY-MM
  type: '' | 'withdrawal' | 'consumption' | 'refund'
  orderNo: string
  startTime: string       // datetime
  endTime: string         // datetime
  nameOrId: string
  department: string
  position: string
  mainServiceStore: string
  laborRelationStore: string
  contractEntity: string
  status: string
  accountType: 'balance'
}
```

### 6.2 表格行数据 Model

```typescript
interface UsageRecord {
  month: string
  type: 'withdrawal' | 'consumption' | 'refund' | 'settlement'
  orderNo: string
  name: string
  department: string
  position: string
  employeeId: string
  mainServiceStore: string
  laborRelationStore: string
  contractEntity: string
  amount: number
  beforeBalance: number
  afterBalance: number
  transactionAmount: number
  accountType: 'balance'
  initiateTime: string    // YYYY-MM-DD HH:mm:ss
  completeTime: string    // YYYY-MM-DD HH:mm:ss
  status: string
}
```

### 6.3 分页 Model

```typescript
interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}
```

---

## 7. API 契约

### 7.1 获取使用明细列表

```
GET /api/bean/usage/detail
```

**Query Parameters:**

同 SearchForm Model，额外携带分页参数：

| 参数 | 类型 | 说明 |
|-----|------|------|
| page | number | 当前页码，从1开始 |
| pageSize | number | 每页条数 |

**Response:**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [/* UsageRecord[] */],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "total": 100
    }
  }
}
```

### 7.2 导出使用明细

```
GET /api/bean/usage/detail/export
```

**Query Parameters:** 同搜索表单全部字段（不含分页参数）

**Response:** 文件流（Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet）

---

## 8. 异常处理

| 场景 | 前端表现 |
|-----|---------|
| 网络错误 | ElMessage.error('网络请求失败，请稍后重试') |
| 请求超时 | ElMessage.error('请求超时，请稍后重试') |
| 接口返回 code ≠ 0 | ElMessage.error(message) |
| 数据为空 | 表格区域展示空状态插图与文案"暂无数据" |
| 导出失败 | ElMessage.error('导出失败，请稍后重试') |

---

## 9. 页面交互细节

| 交互 | 行为 |
|-----|------|
| 首次进入页面 | 自动携带路由 query 参数填充搜索表单并发起查询 |
| 打开页面但未点击查询 | 展示 mock 演示数据（原型阶段） |
| 点击查询 | 发起真实 API 请求，加载真实数据 |
| 点击重置 | 清空表单后自动触发一次查询 |
| 切换每页条数 | 当前页重置为1，重新加载数据 |
| 切换页码 | 加载对应页数据 |

---

## 10. 验收标准

- [ ] 页面标题正确显示为"常乐豆使用明细"
- [ ] 导出按钮位于卡片右上角，带下载图标
- [ ] 所有12个筛选字段均可正常操作
- [ ] 使用类型下拉包含：全部/提现/消费/退货
- [ ] 状态下拉包含全部12种状态选项
- [ ] 表格展示18个字段，列宽与字段定义一致
- [ ] 使用类型标签颜色：提现=warning, 消费=primary, 退货=success
- [ ] 数量字段：提现/消费显示`-`，退货显示`+`
- [ ] 交易后余额以绿色标签展示
- [ ] 分页支持 10/20/50/100 四种规格
- [ ] 从其他页面带参数跳转进入时，姓名&工号字段正确预填充
- [ ] 点击查询/重置/分页/导出均有对应业务逻辑（非空实现）
- [ ] 响应式布局正常，表格在小屏幕下出现横向滚动
