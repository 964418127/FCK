/**
 * Flow Chart Renderer
 * SVG-based flowchart drawing utility
 */

const FlowRenderer = {
  // Default dimensions
  nodeWidth: 140,
  nodeHeight: 50,
  diamondSize: 80,
  arrowSize: 8,
  padding: 40,

  // Colors
  colors: {
    primary: '#a40035',
    primaryBg: '#fff7f7',
    success: '#67c23a',
    successBg: '#f0f9eb',
    border: '#dcdfe6',
    text: '#333',
    textSecondary: '#666',
    line: '#999'
  },

  /**
   * Create SVG namespace
   */
  createSVG(width, height) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', height)
    return svg
  },

  /**
   * Create a rectangle node
   */
  createRect(x, y, text, options = {}) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', x)
    rect.setAttribute('y', y)
    rect.setAttribute('width', options.width || this.nodeWidth)
    rect.setAttribute('height', options.height || this.nodeHeight)
    rect.setAttribute('rx', 8)
    rect.setAttribute('fill', options.fill || '#fff')
    rect.setAttribute('stroke', options.stroke || this.colors.primary)
    rect.setAttribute('stroke-width', 2)

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    textEl.setAttribute('x', x + (options.width || this.nodeWidth) / 2)
    textEl.setAttribute('y', y + (options.height || this.nodeHeight) / 2 + 5)
    textEl.setAttribute('text-anchor', 'middle')
    textEl.setAttribute('fill', options.textColor || this.colors.text)
    textEl.setAttribute('font-size', '14')
    textEl.setAttribute('font-weight', '500')
    textEl.textContent = text

    group.appendChild(rect)
    group.appendChild(textEl)

    return {
      group,
      rect,
      text: textEl,
      x,
      y,
      width: options.width || this.nodeWidth,
      height: options.height || this.nodeHeight,
      centerX: x + (options.width || this.nodeWidth) / 2,
      centerY: y + (options.height || this.nodeHeight) / 2
    }
  },

  /**
   * Create a diamond (decision) node
   */
  createDiamond(x, y, text, options = {}) {
    const size = options.size || this.diamondSize
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const half = size / 2
    const points = [
      [x + half, y],
      [x + size, y + half],
      [x + half, y + size],
      [x, y + half]
    ].map(p => p.join(',')).join(' ')

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    polygon.setAttribute('points', points)
    polygon.setAttribute('fill', options.fill || this.colors.primaryBg)
    polygon.setAttribute('stroke', options.stroke || this.colors.primary)
    polygon.setAttribute('stroke-width', 2)

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    textEl.setAttribute('x', x + half)
    textEl.setAttribute('y', y + half + 5)
    textEl.setAttribute('text-anchor', 'middle')
    textEl.setAttribute('fill', options.textColor || this.colors.primary)
    textEl.setAttribute('font-size', '12')
    textEl.setAttribute('font-weight', '500')
    textEl.textContent = text

    group.appendChild(polygon)
    group.appendChild(textEl)

    return {
      group,
      polygon,
      text: textEl,
      x,
      y,
      size,
      centerX: x + half,
      centerY: y + half
    }
  },

  /**
   * Create a line with arrow
   */
  createArrow(x1, y1, x2, y2, options = {}) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // Line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x1)
    line.setAttribute('y1', y1)
    line.setAttribute('x2', x2)
    line.setAttribute('y2', y2)
    line.setAttribute('stroke', options.stroke || this.colors.line)
    line.setAttribute('stroke-width', 2)
    line.setAttribute('marker-end', 'url(#arrowhead)')

    // Label
    if (options.label) {
      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      textEl.setAttribute('x', (x1 + x2) / 2)
      textEl.setAttribute('y', (y1 + y2) / 2 - 8)
      textEl.setAttribute('text-anchor', 'middle')
      textEl.setAttribute('fill', this.colors.textSecondary)
      textEl.setAttribute('font-size', 12)
      textEl.textContent = options.label
      group.appendChild(textEl)
    }

    group.appendChild(line)

    return {
      group,
      line,
      x1,
      y1,
      x2,
      y2
    }
  },

  /**
   * Create arrowhead marker
   */
  createArrowhead(svg) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')

    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
    marker.setAttribute('id', 'arrowhead')
    marker.setAttribute('markerWidth', '10')
    marker.setAttribute('markerHeight', '10')
    marker.setAttribute('refX', '9')
    marker.setAttribute('refY', '3')
    marker.setAttribute('orient', 'auto')

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    polygon.setAttribute('points', '0 0, 10 3, 0 6')
    polygon.setAttribute('fill', this.colors.line)

    marker.appendChild(polygon)
    defs.appendChild(marker)
    svg.appendChild(defs)
  },

  /**
   * Draw a complete flowchart
   */
  drawFlowChart(container, nodes, options = {}) {
    const containerEl = document.querySelector(container)
    if (!containerEl) return

    // Calculate dimensions
    const cols = options.cols || 3
    const colWidth = (options.width || 800) / cols
    const rowHeight = options.rowHeight || 120

    // Create SVG
    const width = options.width || 800
    const height = nodes.length * rowHeight + this.padding * 2
    const svg = this.createSVG(width, height)

    // Add arrowhead
    this.createArrowhead(svg)

    // Layout nodes
    nodes.forEach((node, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)

      let el
      if (node.type === 'diamond') {
        el = this.createDiamond(
          col * colWidth + (colWidth - this.diamondSize) / 2,
          row * rowHeight + this.padding,
          node.text,
          node.options
        )
      } else {
        el = this.createRect(
          col * colWidth + (colWidth - this.nodeWidth) / 2,
          row * rowHeight + this.padding,
          node.text,
          node.options
        )
      }

      svg.appendChild(el.group)
    })

    containerEl.appendChild(svg)
    return svg
  }
}

// Export
window.FlowRenderer = FlowRenderer
