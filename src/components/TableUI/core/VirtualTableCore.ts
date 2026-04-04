// components/UintUI/Table/core/VirtualTableCore.ts
// 这个类是纯逻辑，不依赖 Vue，可以在任何地方测试

export interface VirtualTableOptions {
  rowHeight: number
  totalRows: number
  overscanCount?: number // 预渲染行数
}

export class VirtualTableCore {
  private rowHeight: number
  private totalRows: number
  private overscanCount: number
  private scrollTop = 0
  private containerHeight = 0

  constructor(options: VirtualTableOptions) {
    this.rowHeight = options.rowHeight
    this.totalRows = options.totalRows
    this.overscanCount = options.overscanCount || 5
  }

  // 计算需要渲染的行范围
  calculateVisibleRange(scrollTop?: number, containerHeight?: number) {
    const top = scrollTop ?? this.scrollTop
    const height = containerHeight ?? this.containerHeight

    const startIndex = Math.floor(top / this.rowHeight)
    const endIndex = Math.min(startIndex + Math.ceil(height / this.rowHeight), this.totalRows)

    // 添加 overscan，预渲染一些行
    const start = Math.max(0, startIndex - this.overscanCount)
    const end = Math.min(this.totalRows, endIndex + this.overscanCount)

    return { start, end, startIndex, endIndex }
  }

  // 计算偏移量（用于 transform）
  getOffsetY(scrollTop: number) {
    const start = Math.floor(scrollTop / this.rowHeight)
    return start * this.rowHeight
  }

  // 更新滚动位置
  updateScroll(scrollTop: number, containerHeight: number) {
    this.scrollTop = scrollTop
    this.containerHeight = containerHeight
    return this.calculateVisibleRange(scrollTop, containerHeight)
  }

  // 更新总行数（数据变化时）
  updateTotalRows(totalRows: number) {
    this.totalRows = totalRows
  }
}
