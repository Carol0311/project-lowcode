import { ColumnSchema } from '@/domain/schema'
export interface WorkerMessage {
  type: 'INIT' | 'SCROLL' | 'UPDATE_CELL' | 'SORT' | 'FILTER'
  payload?: any
  requestId?: string
}

// Worker 内部管理数据
//const tableData: any[] = []
//const columns: any[] = []
let currentVisibleRange = { start: 0, end: 0 }
console.log(currentVisibleRange)

// 数据操作类（封装复杂逻辑）
class TableDataManager {
  private data: any[] = []
  private columns: ColumnSchema[] = []
  private filters: Map<string, any> = new Map()
  private sortConfig: { column: string; order: 'asc' | 'desc' } | null = null

  init(data: any[], columns: ColumnSchema[]) {
    this.data = data
    // 数据预处理：扁平化、索引构建等
    this.columns = columns
  }

  getVisibleData(start: number, end: number) {
    // 先在 Worker 中过滤、排序
    const processed = [...this.data]

    if (this.sortConfig) {
      processed.sort((a, b) => {
        // 升序
        return a - b
      })
    }

    // 只返回需要的数据
    return processed.slice(start, end)
  }

  updateCell(rowIndex: number, colKey: string, value: any) {
    this.data[rowIndex][colKey] = value
    // 返回更新后的行数据
    return this.data[rowIndex]
  }
}

const dataManager = new TableDataManager()

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, payload, requestId } = e.data

  switch (type) {
    case 'INIT':
      dataManager.init(payload.data, payload.columns)
      // 初始返回第一屏数据
      const firstScreen = dataManager.getVisibleData(0, 50)
      self.postMessage({
        type: 'DATA_UPDATE',
        payload: { data: firstScreen, start: 0, end: 50 },
        requestId,
      })
      break

    case 'SCROLL':
      currentVisibleRange = payload
      const visibleData = dataManager.getVisibleData(payload.start, payload.end)
      self.postMessage({
        type: 'DATA_UPDATE',
        payload: { data: visibleData, ...payload },
        requestId,
      })
      break

    case 'UPDATE_CELL':
      const updatedRow = dataManager.updateCell(payload.rowIndex, payload.colKey, payload.value)
      // 只返回更新的行
      self.postMessage({
        type: 'ROW_UPDATE',
        payload: { rowIndex: payload.rowIndex, rowData: updatedRow },
        requestId,
      })
      break
  }
}
