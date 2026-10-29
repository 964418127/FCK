/**
 * Simulator Component
 * Creates interactive calculators for business scenarios
 */

/**
 * Create a simulator instance
 * @param {string} selector - CSS selector for container
 * @param {Object} options - Simulator options
 */
function createSimulator(selector, options) {
  const container = document.querySelector(selector)
  if (!container) return null

  const defaultOptions = {
    data: () => ({}),
    methods: {},
    computed: {},
    mounted: () => {}
  }

  const mergedOptions = { ...defaultOptions, ...options }

  // Extract template from container
  const template = container.innerHTML.trim()

  // Clear container for Vue to fill
  container.innerHTML = ''

  // Create Vue app
  const app = Vue.createApp({
    data() {
      return {
        ...mergedOptions.data(),
        // Internal state
        _initialized: false
      }
    },
    methods: {
      ...mergedOptions.methods,
      // Auto-calculate on any input change
      _triggerRecalc() {
        if (this._initialized && mergedOptions.methods.calculate) {
          mergedOptions.methods.calculate.call(this)
        }
      }
    },
    computed: {
      ...mergedOptions.computed
    },
    mounted() {
      this._initialized = true
      if (mergedOptions.methods.calculate) {
        mergedOptions.methods.calculate.call(this)
      }
      if (mergedOptions.mounted) {
        mergedOptions.mounted.call(this)
      }
    },
    template
  })

  return app.mount(selector)
}

/**
 * Pre-built simulator templates
 */
const SimulatorTemplates = {
  /**
   * 保底获豆计算器
   */
  guaranteeBean: {
    data: () => ({
      pieceCommission: 3000,
      overtimePay: 500,
      holidayPay: 300,
      minWage: 2360
    }),
    methods: {
      calculate() {
        const income = this.pieceCommission + this.overtimePay + this.holidayPay
        this.totalIncome = income
        this.gap = this.minWage - income
        this.guaranteeBean = this.gap > 0 ? this.gap : 0
        this.needSubsidy = this.gap > 0
      }
    }
  },

  /**
   * 个税计算器
   */
  taxCalculator: {
    data: () => ({
      week1Income: 2000,
      week2Income: 1800,
      week3Income: 2200,
      taxRate: 0.03
    }),
    methods: {
      calculate() {
        const totalIncome = this.week1Income + this.week2Income + this.week3Income
        this.totalIncome = totalIncome

        // 预扣税
        this.week1Tax = Math.round(this.week1Income * this.taxRate * 100) / 100
        this.week2Tax = Math.round(this.week2Income * this.taxRate * 100) / 100
        this.week3Tax = Math.round(this.week3Income * this.taxRate * 100) / 100
        this.totalWithheld = this.week1Tax + this.week2Tax + this.week3Tax

        // 实际税额（简化计算）
        this.actualTax = Math.round(totalIncome * 0.03 * 100) / 100

        // 退补
        this.difference = this.totalWithheld - this.actualTax
        this.isRefund = this.difference >= 0
        this.refundAmount = Math.abs(this.difference)
      }
    }
  },

  /**
   * 负工资抵扣计算器
   */
  negativeWageCalculator: {
    data: () => ({
      currentIncome: 3000,
      negativeBalance: 500,
      employeeStatus: 'active'
    }),
    methods: {
      calculate() {
        const maxDeduction = this.currentIncome * 0.2 // 最多扣20%

        if (this.negativeBalance <= 0) {
          this.deduction = 0
          this.remainingBalance = this.negativeBalance
          this.canDeduct = true
        } else if (maxDeduction >= this.negativeBalance) {
          this.deduction = this.negativeBalance
          this.remainingBalance = 0
          this.canDeduct = true
        } else {
          this.deduction = maxDeduction
          this.remainingBalance = this.negativeBalance - maxDeduction
          this.canDeduct = true
        }

        this.deduction = Math.round(this.deduction * 100) / 100
        this.remainingBalance = Math.round(this.remainingBalance * 100) / 100
        this.maxDeduction = Math.round(maxDeduction * 100) / 100
        this.deductFrom = this.employeeStatus === 'active' ? '现金工资条' : '常乐豆工资条'
      }
    }
  }
}

// Export for use
window.createSimulator = createSimulator
window.SimulatorTemplates = SimulatorTemplates
