import { ColumnSchema } from '@/domain/schema'
export class LayoutManager {
  private columnWidths = <Record<string, number>>{}
  private containerWidth = 0
  private mode: 'grid' | 'canvas' = 'grid'

  constructor(private columns: ColumnSchema[]) {
    this.initColumnWidths()
  }

  // 初始化列宽策略
  private initColumnWidths() {
    this.columns.forEach((col) => {
      if (col.props.width) {
        // 固定宽度
        this.columnWidths[col.key] = this.parseWidth(col.props.width)
      } else if (col.props.minWidth) {
        // 最小宽度，可拉伸
        this.columnWidths[col.key] = Number(col.props.minWidth)
      } else {
        // 默认宽度
        this.columnWidths[col.key] = 100
      }
    })
  }

  // 响应容器宽度变化
  resize(containerWidth: number) {
    this.containerWidth = containerWidth

    // 计算固定宽度的总和
    let fixedTotal = 0
    const flexColumns: ColumnSchema[] = []

    this.columns.forEach((col) => {
      if (col.props.width && !col.props.width.toString().includes('%')) {
        fixedTotal += this.columnWidths[col.key]!
      } else {
        flexColumns.push(col)
      }
    })

    // 将剩余宽度均分给自适应列
    const remainingWidth = containerWidth - fixedTotal
    const flexWidth = remainingWidth / flexColumns.length

    flexColumns.forEach((col) => {
      this.columnWidths[col.key] = Math.max(Number(col.props.minWidth) || 80, flexWidth)
    })
  }

  // 手动调整列宽
  resizeColumn(colKey: string, newWidth: number) {
    this.columnWidths[colKey] = newWidth

    // 更新列配置
    const col = this.columns.find((c) => c.key === colKey)
    if (col) {
      col.props.width = newWidth
    }

    // 触发重新布局（但不重新渲染所有数据）
    return this.columnWidths
  }

  private parseWidth(width: string | number): number {
    if (typeof width === 'number') return width
    if (width.endsWith('px')) return parseFloat(width)
    if (width.endsWith('%')) {
      // 百分比需要容器宽度
      return this.containerWidth * (parseFloat(width) / 100)
    }
    return 100
  }

  // 获取当前所有列宽
  getColumnWidths(): Record<string, number> {
    return this.columnWidths
  }
}
