import { TableDataManager } from './TableDataManager'
import { GroupTableManager } from './GroupTableManager'
export interface WorkerMessage {
  type:
    | 'INIT'
    | 'SCROLL'
    | 'UPDATE_CELL'
    | 'SORT'
    | 'FILTER'
    | 'INIT_GROUP'
    | 'SCROLL_GROUP'
    | 'UPDATE_CELL_IN_GROUP'
    | 'TOGGLE_GROUP'
    | 'GET_ROW_IN_GROUP'
  payload?: any
  requestId?: string
}

const dataManager = new TableDataManager()
const groupManager = new GroupTableManager()

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload, requestId } = e.data

  switch (type) {
    case 'INIT':
      const totalCount = await dataManager.init(payload.data, payload.columns)
      // 初始返回第一屏数据
      const firstScreen = dataManager.getVisibleData(0, payload.overscanCount || 10)
      self.postMessage({
        type: 'DATA_UPDATE',
        payload: { data: firstScreen, start: 0, end: 10, totalCount },
        requestId,
      })
      break
    case 'INIT_GROUP':
      await groupManager.init(payload.data, payload.groupBy)
      const totalGroupCount = groupManager.getTotalRows()
      const totalGroupNames = groupManager.getTotalGroupNames()
      const firstData = groupManager.getVisibleGroupData(
        0,
        payload.overscanCount || 10,
        new Set(totalGroupNames),
      )
      self.postMessage({
        type: 'GROUP_DATA_UPDATE',
        payload: {
          data: firstData,
          start: 0,
          end: payload.overscanCount || 10,
          totalCount: totalGroupCount,
          totalGroupNames,
        },
        requestId,
      })
      break

    case 'SCROLL':
      const visibleData = dataManager.getVisibleData(payload.start, payload.end)
      self.postMessage({
        type: 'DATA_UPDATE',
        payload: { data: visibleData, ...payload },
        requestId,
      })
      break
    case 'SCROLL_GROUP':
      const visibleGroupData = groupManager.getVisibleGroupData(
        payload.start,
        payload.end,
        new Set(payload.expandGroup),
      )
      self.postMessage({
        type: 'GROUP_DATA_UPDATE',
        payload: { data: visibleGroupData, ...payload },
        requestId,
      })
      break

    case 'UPDATE_CELL':
      const updatedRow = dataManager.updateCell(payload.rowId, payload.colKey, payload.value)
      // 只返回更新的行
      if (updatedRow) {
        self.postMessage({
          type: 'ROW_UPDATE',
          payload: { rowId: payload.rowId, updatedRow },
          requestId,
        })
      }
      break
    case 'UPDATE_CELL_IN_GROUP':
      const updatedGroupRow = groupManager.updateCellInGroup(
        payload.rowId,
        payload.colKey,
        payload.value,
      )
      // 只返回更新的行
      if (updatedGroupRow) {
        self.postMessage({
          type: 'GROUP_ROW_UPDATE',
          payload: { rowId: payload.rowId, updatedGroupRow },
          requestId,
        })
      }
      break
    case 'TOGGLE_GROUP':
      groupManager.toggleGroupExpand(new Set(payload.expandGroup))
      const groupData = groupManager.getVisibleGroupData(
        payload.start,
        payload.end,
        new Set(payload.expandGroup),
      )
      self.postMessage({
        type: 'GROUP_UPDATE',
        payload: { data: groupData, ...payload },
        requestId,
      })
      break
    case 'GET_ROW_IN_GROUP':
      const groupRow = groupManager.getItemByIndex(payload.rowIndex)
      self.postMessage({
        type: 'GET_FROM_GROUP',
        payload: { data: groupRow },
        requestId,
      })
  }
}
