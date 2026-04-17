import { ColumnSchema } from '@/domain/schema'
export class TableDataManager {
  private rawData: any[] = []
  private columns: ColumnSchema[] = []
  private filters: Map<string, any> = new Map()
  private sortConfig: { column: string; order: 'asc' | 'desc' } | null = null

  async init(data: any[], columns: ColumnSchema[]) {
    const largeData = await this.generateLargeData(30000)
    //this.data = data
    this.rawData = largeData
    // 数据预处理：扁平化、索引构建等
    this.columns = columns
    return this.rawData.length
  }

  async generateLargeData(largeCount: number) {
    const chunkSize = 1000
    const chunks = []

    for (let start = 0; start < largeCount; start += chunkSize) {
      await new Promise((resolve) => {
        const chunk = Array.from({ length: Math.min(chunkSize, largeCount - start) }, (_, i) => ({
          rowId: `data_${start + i}`,
          company: `XXXX技术有限公司${start + i}`,
          amount: 3456.0 + i,
          currency: 'CNY',
          progress: '100%',
          date: '2025-3-25',
          operation: ['edit', 'delete'],
        }))
        chunks.push(...chunk)
        resolve(1)
      })
    }
    return chunks
  }

  getVisibleData(start: number, end: number) {
    // 先在 Worker 中过滤、排序
    const processed = [...this.rawData]

    if (this.sortConfig) {
      processed.sort((a, b) => {
        // 升序
        return a - b
      })
    }

    // 只返回需要的数据
    return processed.slice(start, end)
  }

  updateCell(rowId: number, colKey: string, value: any) {
    const index = this.rawData.findIndex((d) => d.rowId === rowId)
    if (index !== -1) {
      this.rawData[index][colKey] = value
      return this.rawData[index]
    }
    return null
  }
}
