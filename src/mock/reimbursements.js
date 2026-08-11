// 个人报销模拟数据（列表页与详情页共享，reactive 以便跨页面同步状态变更）
import { reactive } from 'vue'

export const reimbursements = reactive([
  {
    id: 1,
    no: 'BX20260718001',
    type: '差旅费',
    amount: 1280.00,
    applicant: '张三',
    employeeNo: '100235',
    department: '总部 / 信息技术部',
    subject: '成都常乐健康管理有限公司',
    expenseDate: '2026-07-16',
    submitAt: '2026-07-18 10:22',
    status: '待审核',
    remark: '成都出差往返高铁票及市内交通费用。',
    attachments: {
      invoices: ['高铁票-成都往返.pdf', '出租车发票.jpg'],
      others: ['行程单.pdf'],
      vouchers: ['微信支付截图.png']
    },
    payee: { name: '张三', bank: '兴业银行', cardNo: '6229 0843 3251 7097 10' },
    timeline: [
      { label: '提交申请', time: '2026-07-18 10:22', done: true }
    ]
  },
  {
    id: 2,
    no: 'BX20260715003',
    type: '差旅费',
    amount: 560.50,
    applicant: '张三',
    employeeNo: '100235',
    department: '总部 / 信息技术部',
    subject: '成都常乐健康管理有限公司',
    expenseDate: '2026-07-13',
    submitAt: '2026-07-15 14:08',
    status: '待付款',
    remark: '客户拜访差旅住宿费用。',
    attachments: {
      invoices: ['酒店住宿发票.pdf'],
      others: [],
      vouchers: ['支付宝支付截图.png']
    },
    payee: { name: '张三', bank: '兴业银行', cardNo: '6229 0843 3251 7097 10' },
    timeline: [
      { label: '提交申请', time: '2026-07-15 14:08', done: true },
      { label: '审核通过', time: '2026-07-16 09:30', done: true }
    ]
  },
  {
    id: 3,
    no: 'BX20260710007',
    type: '差旅费',
    amount: 320.00,
    applicant: '张三',
    employeeNo: '100235',
    department: '总部 / 信息技术部',
    subject: '成都常乐健康管理有限公司',
    expenseDate: '2026-07-08',
    submitAt: '2026-07-10 09:41',
    status: '已付款',
    remark: '异地培训交通费。',
    attachments: {
      invoices: ['机票行程单.pdf'],
      others: [],
      vouchers: ['微信支付截图.png']
    },
    payee: { name: '张三', bank: '兴业银行', cardNo: '6229 0843 3251 7097 10' },
    timeline: [
      { label: '提交申请', time: '2026-07-10 09:41', done: true },
      { label: '审核通过', time: '2026-07-10 15:20', done: true },
      { label: '完成打款', time: '2026-07-11 11:00', done: true }
    ]
  },
  {
    id: 4,
    no: 'BX20260708002',
    type: '差旅费',
    amount: 88.00,
    applicant: '张三',
    employeeNo: '100235',
    department: '总部 / 信息技术部',
    subject: '成都常乐健康管理有限公司',
    expenseDate: '2026-07-07',
    submitAt: '2026-07-08 18:30',
    status: '已付款',
    remark: '市内公务出行打车费。',
    attachments: {
      invoices: ['出租车发票.jpg'],
      others: [],
      vouchers: ['支付宝支付截图.png']
    },
    payee: { name: '张三', bank: '兴业银行', cardNo: '6229 0843 3251 7097 10' },
    timeline: [
      { label: '提交申请', time: '2026-07-08 18:30', done: true },
      { label: '审核通过', time: '2026-07-09 10:12', done: true },
      { label: '完成打款', time: '2026-07-09 16:40', done: true }
    ]
  },
  {
    id: 5,
    no: 'BX20260705005',
    type: '差旅费',
    amount: 2450.00,
    applicant: '张三',
    employeeNo: '100235',
    department: '总部 / 信息技术部',
    subject: '成都常乐健康管理有限公司',
    expenseDate: '2026-07-02',
    submitAt: '2026-07-05 11:15',
    status: '待审核',
    remark: '跨省出差机票、酒店及餐饮费用合计。',
    attachments: {
      invoices: ['机票行程单.pdf', '酒店住宿发票.pdf', '餐饮发票.jpg'],
      others: ['出差审批单.pdf'],
      vouchers: ['微信支付截图.png', '银行卡支付截图.png']
    },
    payee: { name: '张三', bank: '兴业银行', cardNo: '6229 0843 3251 7097 10' },
    timeline: [
      { label: '提交申请', time: '2026-07-05 11:15', done: true }
    ]
  },
  {
    id: 6,
    no: 'BX20260703004',
    type: '差旅费',
    amount: 760.00,
    applicant: '张三',
    employeeNo: '100235',
    department: '总部 / 信息技术部',
    subject: '成都常乐健康管理有限公司',
    expenseDate: '2026-07-01',
    submitAt: '2026-07-03 16:48',
    status: '未通过',
    remark: '出差住宿费用报销。',
    rejectReason: '发票抬头与费用所属主体不一致，请重新提交。',
    attachments: {
      invoices: ['酒店住宿发票.pdf'],
      others: [],
      vouchers: ['微信支付截图.png']
    },
    payee: { name: '张三', bank: '兴业银行', cardNo: '6229 0843 3251 7097 10' },
    timeline: [
      { label: '提交申请', time: '2026-07-03 16:48', done: true },
      { label: '审核未通过', time: '2026-07-04 10:05', done: true }
    ]
  }
])
