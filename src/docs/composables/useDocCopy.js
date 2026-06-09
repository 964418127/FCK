import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function useDocCopy() {
  // 复制整个 .content-section（整页 = 单个章节的页面下，整页即一个章节）
  const copyToClipboard = async () => {
    const element = document.querySelector('.content-section')
    if (!element) {
      ElMessage.error('复制失败：未找到内容区域')
      return
    }
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
      try {
        await navigator.clipboard.writeText(element.innerText)
        ElMessage.success('已复制纯文本到剪贴板（部分格式可能丢失）')
      } catch {
        ElMessage.error('复制失败，请手动选择内容复制')
      }
    }
  }

  // 按 id 复制指定 section（首页下挂多个 section 时按需调用）
  const copySectionAsHtml = async (sectionId) => {
    const el = document.getElementById(sectionId)
    if (!el) {
      ElMessage.error('复制失败：未找到章节')
      return
    }
    const buttons = el.querySelectorAll('.copy-section-btn')
    const prevDisplay = []
    buttons.forEach((b, i) => {
      prevDisplay[i] = b.style.display
      b.style.display = 'none'
    })
    try {
      const range = document.createRange()
      range.selectNodeContents(el)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
      const ok = document.execCommand('copy')
      sel.removeAllRanges()
      if (ok) {
        ElMessage.success('章节已复制为富文本，可粘贴到飞书/Notion/Word')
      } else {
        ElMessage.warning('浏览器不支持富文本复制，请手动选中后 Ctrl+C')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('复制失败：' + (error.message || '未知错误'))
    } finally {
      buttons.forEach((b, i) => { b.style.display = prevDisplay[i] || '' })
    }
  }

  const exportToPdf = async () => {
    const element = document.querySelector('.content-section')
    if (!element) {
      ElMessage.error('导出失败：未找到内容区域')
      return
    }
    try {
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
        pdf.addImage(imgData, 'PNG', position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      pdf.save('V2阶段1产品说明.pdf')
      ElMessage.success('PDF 导出成功')
    } catch (error) {
      ElMessage.error('导出失败，请重试')
      console.error(error)
    }
  }

  return { copyToClipboard, copySectionAsHtml, exportToPdf }
}
