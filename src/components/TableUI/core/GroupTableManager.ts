import { ColumnSchema } from '@/domain/schema'

export class GroupTableManager {
  //原始数据
  private rawData: any[] = []
  //列字段数组
  private columns: ColumnSchema[] = []
  //分组字段
  private groupFields: string[] = []
  //分组索引  分组字段---下标---数据
  private groupCache = new Map<string, { ids: string[]; data: any[] }>()
  //扁平索引----原始数据索引映射
  private flatIndexCache: any[] = []

  async init(data: any[], groupBy: string[]) {
    const largeData = await this.generateLargeData(300)
    this.rawData = largeData
    this.groupFields = groupBy
    this.buildGroupCache()
  }

  async generateLargeData(largeCount: number) {
    const chunkSize = 1000
    const chunks = []

    for (let start = 0; start < largeCount; start += chunkSize) {
      await new Promise((resolve) => {
        const chunk = Array.from({ length: Math.min(chunkSize, largeCount - start) }, (_, i) => ({
          rowId: `data_${start + i}`,
          company: `XXXX技术有限公司${start + i}`,
          amount: 3456.0 + (i % 10),
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

  buildGroupCache() {
    //分组字段---索引映射
    const tempGroup = new Map<string, string[]>()

    this.rawData.forEach((item) => {
      const groupKey = this.groupFields
        .map((key) => {
          return item[key]
        })
        .join('_')
      if (!tempGroup.has(groupKey)) {
        tempGroup.set(groupKey, [])
      }
      tempGroup.get(groupKey).push(item.rowId)
    })

    //存储分组数据
    for (const [groupKey, idsArr] of tempGroup) {
      this.groupCache.set(groupKey, {
        ids: idsArr,
        data: idsArr.map((rowId) => {
          const i = Number(rowId.replace('data_', ''))
          return this.rawData[i]
        }),
      })
    }

    //构建扁平索引
    let flatIndex = 0
    for (const [_, group] of this.groupCache) {
      //分组表头
      this.flatIndexCache[flatIndex++] = -1

      for (let i = 0; i < group.ids.length; i++) {
        this.flatIndexCache[flatIndex++] = group.ids[i]
      }
    }
  }

  rebuildFlatCache(expandGroup: Set<string>) {
    let flatIndex = 0
    for (const [groupName, group] of this.groupCache) {
      //分组表头
      if (expandGroup.has(groupName)) {
        this.flatIndexCache[flatIndex++] = -1

        for (let i = 0; i < group.ids.length; i++) {
          this.flatIndexCache[flatIndex++] = group.ids[i]
        }
      }
    }
  }

  //根据索引获取目标数据
  getItemByIndex(rowIndex: number) {
    const flatId = this.flatIndexCache[rowIndex]
    //获取对应的分组表头信息
    if (flatId === -1) {
      return this.getGroupHeaderByIndex(rowIndex)
    }
    return this.rawData.find((row) => row.rowId === flatId)
  }

  //根据索引获取表头信息
  getGroupHeaderByIndex(flatIndex: number) {
    let currentIndex = 0
    for (const [groupName, group] of this.groupCache) {
      if (flatIndex === currentIndex) {
        return { isGroup: true, name: groupName, count: group.ids.length, ids: group.ids }
      }
      currentIndex += group.ids.length + 1
      if (flatIndex < currentIndex) break
    }
    return null
  }
  getTotalRows() {
    return this.flatIndexCache.length
  }

  getTotalGroupNames() {
    return [...this.groupCache.keys()]
  }

  getVisibleGroupData(start: number, end: number, expandGroup: Set<string>) {
    const result: any[] = []
    let currentIndex = 0
    for (const [groupName, group] of this.groupCache) {
      const isExpanded = expandGroup.has(groupName)
      const groupCount = 1 + (isExpanded ? group.ids.length : 0)

      if (currentIndex + groupCount > start && currentIndex < end) {
        if (currentIndex >= start) {
          result.push({ isGroup: true, name: groupName, count: group.ids.length })
        }
        //如果此组数据是展开的
        if (isExpanded) {
          const _start = Math.max(0, start - currentIndex - 1)
          const _end = Math.min(end - currentIndex - 1, group.ids.length)
          for (let i = _start; i < _end; i++) {
            result.push(group.data[i])
          }
        }
      }
      currentIndex += groupCount
    }
    return result
  }
  updateCellInGroup(rowId: number, colKey: string, value: any) {
    const index = this.rawData.findIndex((row) => row.rowId === rowId)
    if (index !== -1) {
      this.rawData[index][colKey] = value
      this.buildGroupCache()
      return this.rawData[index][colKey]
    }
    return null
  }
  toggleGroupExpand(expandGroup: Set<string>) {
    this.rebuildFlatCache(expandGroup)
  }
}
