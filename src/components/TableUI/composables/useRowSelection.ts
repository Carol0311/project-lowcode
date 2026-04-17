import { ref, type Ref } from 'vue'
export function useRowSelection(totalRows: Ref<number>) {
  const selectedRows = ref<Map<string, any>>(new Map())
  const lastSelectedIndex = ref(-1)

  // 切换单行
  const toggleRow = (rowId: string, toggle: boolean, shiftKey: boolean = false) => {
    if (shiftKey && lastSelectedIndex.value !== -1) {
      // Shift 多选
      const rownum = Number(rowId.replace('data_', ''))
      const start = Math.min(lastSelectedIndex.value, rownum)
      const end = Math.max(lastSelectedIndex.value, rownum)
      for (let i = start; i <= end; i++) {
        selectedRows.value.set('data_' + i, { isSelected: true })
      }
    } else {
      if (toggle) {
        //单行选中正反选
        if (selectedRows.value.has(rowId)) {
          const isSelected = selectedRows.value.get(rowId).isSelected
          selectedRows.value.set(rowId, { isSelected: !isSelected, changed: true })
        } else {
          selectedRows.value.set(rowId, { isSelected: true })
        }
      } else {
        //单行选中不反选
        selectedRows.value.set(rowId, { isSelected: true })
      }
    }
    lastSelectedIndex.value = Number(rowId.replace('data_', ''))
  }
  const toggleGroupRows = (groupName: string, rowIds: string[]) => {
    let isSelected = false
    if (selectedRows.value.has(groupName)) {
      isSelected = selectedRows.value.get(groupName).isSelected
    }
    selectedRows.value.set(groupName, { isSelected: !isSelected, isGroup: true })
    for (let i = 0; i < rowIds.length; i++) {
      selectedRows.value.set(rowIds[i], { isSelected: !isSelected })
    }
  }

  // 全选
  const selectAll = () => {
    for (let i = 0; i < totalRows.value; i++) {
      selectedRows.value.set('data_' + i, { isSelected: true })
    }
  }

  // 反选
  const invertSelection = () => {
    const newSelection = new Map()
    for (let i = 0; i < totalRows.value; i++) {
      if (!selectedRows.value.has('data_' + i)) {
        newSelection.set('data_' + i, { isSelected: true, changed: true })
      }
    }
    selectedRows.value = newSelection
  }

  // 清空选中
  const clearSelection = () => {
    selectedRows.value.clear()
  }

  return {
    selectedRows,
    isSelected: (rowId: string) => {
      if (selectedRows.value.has(rowId)) {
        const row = selectedRows.value.get(rowId)
        return row.isSelected
      }
      return false
    },
    toggleRow,
    toggleGroupRows,
    selectAll,
    invertSelection,
    clearSelection,
  }
}
