const DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const INT_UNITS = ['', '拾', '佰', '仟']
const BIG_UNITS = ['', '万', '亿', '兆']

// 4 位一节，把数字节转中文（如 1234 → "壹仟贰佰叁拾肆"，100 → "壹佰"，10 → "壹拾"）
function sectionToChinese(section) {
  if (section === 0) return ''
  let str = ''
  let zeroPending = false
  for (let i = 0; i < 4; i++) {
    const digit = Math.floor(section / Math.pow(10, 3 - i)) % 10
    const unit = INT_UNITS[3 - i]
    if (digit === 0) {
      zeroPending = true
    } else {
      if (zeroPending && str) str += '零'
      zeroPending = false
      str += DIGITS[digit] + unit
    }
  }
  return str
}

// 整数部分按 4 位一节组合大单位（万/亿/兆），section 间根据高位是否为 0 决定是否补"零"
function intToChinese(intStr) {
  if (/^0+$/.test(intStr)) return '零'
  const padLen = Math.ceil(intStr.length / 4) * 4
  const padded = intStr.padStart(padLen, '0')

  let result = ''
  for (let i = 0; i < padLen; i += 4) {
    const chunkStr = padded.slice(i, i + 4)
    const bigIdx = padLen / 4 - i / 4 - 1
    const chunkNum = parseInt(chunkStr, 10)
    if (chunkNum === 0) continue

    const chunkChinese = sectionToChinese(chunkNum)
    const hasLeadingZero = chunkStr[0] === '0'
    if (result && hasLeadingZero) result += '零'
    result += chunkChinese + BIG_UNITS[bigIdx]
  }
  return result
}

// 标准财务大写：元/角/分/整
export function numberToChineseMoney(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return ''
  const n = Number(num)
  if (n === 0) return '零元整'
  if (n < 0) return '负' + numberToChineseMoney(-n)

  const fixed = n.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const intStr = intToChinese(intPart)

  const jiao = parseInt(decPart[0], 10)
  const fen = parseInt(decPart[1], 10)
  let decStr = ''
  if (jiao === 0 && fen === 0) {
    decStr = '整'
  } else {
    if (jiao === 0) {
      decStr = '零'
    } else {
      decStr = DIGITS[jiao] + '角'
    }
    if (fen > 0) {
      decStr += DIGITS[fen] + '分'
    }
  }

  return intStr + '元' + decStr
}

// 点分隔格式：0.12 → "零点壹贰 元整"，100.5 → "壹佰点伍零 元整"，100 → "壹佰 元整"
export function numberToChineseMoneyDot(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return ''
  const n = Number(num)
  if (n === 0) return '零元整'
  if (n < 0) return '负' + numberToChineseMoneyDot(-n)

  const fixed = n.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const intStr = intToChinese(intPart)

  const jiao = parseInt(decPart[0], 10)
  const fen = parseInt(decPart[1], 10)
  const hasDecimal = jiao !== 0 || fen !== 0
  const decStr = hasDecimal ? '点' + DIGITS[jiao] + DIGITS[fen] : ''

  return intStr + decStr + ' 元整'
}