<template>
  <div
    ref="tableContainer"
    v-bind="$attrs"
    class="smart-edit-table edit-table mt-2.5 table-container relative overflow-x-auto overflow-y-hidden"
    :style="{ height: `${containerHeight + headHeight}px` }"
  >
    <div
      class="table-header flex flex-row border border-solid border-zinc-200 border-b-0 absolute"
      :style="{ 'line-height': headHeight + 'px' }"
    >
      <div class="header-cell pl-2.5 relative" :style="{ width: '40px' }">
        <PhSquare
          v-show="!selectAll"
          :size="20"
          weight="thin"
          class="text-zinc-400"
          @click="handleSelectAll"
        />
        <PhCheckSquare
          v-show="selectAll"
          :size="20"
          weight="thin"
          class="text-orange-300"
          @click="handleSelectAll"
        />
      </div>
      <div
        v-for="column in visibleColumns"
        :key="column.key"
        class="header-cell pl-2.5 text-zinc-500 relative"
        :style="{
          width: `${columnWidths[column.key]}px`,
        }"
      >
        <span>{{ column.name }}</span>
        <span
          class="resize-line cursor-ew-resize absolute h-full w-0.5 right-0 hover:bg-orange-300"
          @mousedown="(e) => handleColumnResize(e, column)"
        ></span>
      </div>
    </div>
    <div
      ref="scrollWrapper"
      class="absolute table-scroll-track overflow-auto"
      :style="{ height: `${containerHeight}px`, top: `${headHeight}px` }"
      @scroll="handleScrollEvt"
      @click="handleCanvasClick"
    >
      <div class="placeholder-scroller relative" :style="{ height: `${totalHeight}px` }"></div>
    </div>
    <div
      ref="canvasWrapperRef"
      class="canvas-wrapper pointer-events-none"
      :style="{ height: `${containerHeight}px`, top: `${headHeight}px` }"
    >
      <canvas ref="canvasRef" class="pointer-events-none" />
    </div>
  </div>
  <Teleport :to="editingCellClass">
    <FloatingEditor
      v-if="!!activeEditCell"
      :active-edit-cell="activeEditCell"
      class="fixed"
      :style="activeEditCellStyle"
      @cell-editor-change="handleEditorChange"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { PhSquare, PhCheckSquare } from '@phosphor-icons/vue'
import { ref, onMounted, watch, toRaw } from 'vue'
import { throttle } from 'lodash-es'
import FloatingEditor from './FloatingEditor.vue'
import { LayoutManager } from './core/LayoutManager'
import { useTableWorker } from './composables/useTableWorker'
import { useVirtualTable } from './composables/useVirtualTable'
import { useElementResize } from '@/composables/useElementResize'
import { useRowSelection } from './composables/useRowSelection'
import { CanvasTableRender } from './core/CanvasTableRender'
import { COMPONENT_DEFAULT_PROPS } from '@/domain/constants/props'
import { ComponentSchema, ComponentType, ColumnSchema } from '@/domain/schema'

const { initWorker, sendMessage } = useTableWorker()

const isGroup = true
const selectAll = ref(false)
const expandGroup = ref<string[]>([])
let canvasRender: CanvasTableRender = null
let rowSelection = null
//const canvasTableRef = ref<HTMLElement>()
const props = defineProps<{
  data: ComponentSchema
}>()

const activeEditCell = ref<{
  rowId: string
  editKey: string
  component: ColumnSchema
  value?: any
} | null>(null)
const activeEditCellStyle = ref<Record<string, any>>({})

let editingCellClass = 'body'

//表格组件容器
const tableContainer = ref<HTMLElement>()
const canvasWrapperRef = ref<HTMLElement>()
const scrollWrapper = ref<HTMLElement>()

//默认行高
const rowHeight = ref(40)
//默认表头高度
const headHeight = ref(40)
//默认表格高度
const containerHeight = ref<number>(200)
//获取表格列设置设局
const visibleColumns = ref<ColumnSchema[]>([
  {
    name: '公司',
    type: 'Text' as ComponentType,
    key: 'company',
    props: { ...COMPONENT_DEFAULT_PROPS, inTable: true },
  },
  {
    key: 'amount',
    name: '单据金额',
    type: 'Number' as ComponentType,
    props: { ...COMPONENT_DEFAULT_PROPS, inTable: true },
  },
  {
    key: 'currency',
    name: '币种',
    type: 'Text',
    props: { ...COMPONENT_DEFAULT_PROPS, inTable: true },
  },
  {
    key: 'progress',
    name: '完成进度',
    type: 'Progress' as ComponentType,
    props: { ...COMPONENT_DEFAULT_PROPS, inTable: true },
  },
  {
    key: 'date',
    name: '到账日期',
    type: 'Date' as ComponentType,
    props: { ...COMPONENT_DEFAULT_PROPS, inTable: true },
  },
  {
    key: 'operation',
    name: '操作',
    type: 'Operation' as ComponentType,
    props: { ...COMPONENT_DEFAULT_PROPS, inTable: true },
  },
])
const totalCount = ref<number>(0)
const totalHeight = ref<number>(0)
const visibleRowsData = ref<any[]>([])

/***表格自适应处理start***/
const tableLayout = new LayoutManager(visibleColumns.value)
const columnWidths = ref<Record<string, number>>({})

// 虚拟滚动处理
const { offsetY, visibleRange, isFastScrolling, handleScroll, updateTotalRows } = useVirtualTable({
  rowHeight: 40,
  totalRows: totalCount.value,
  overscanCount: 0,
  mode: 'CANVAS',
})

onMounted(() => {
  //初始化表格列
  columnWidths.value = { ...tableLayout.getColumnWidths() }
  //初始化table worker处理数据
  initWorker()

  const action = isGroup ? 'INIT_GROUP' : 'INIT'
  const actionParams = isGroup
    ? {
        data: [],
        overscanCount: 20,
        groupBy: ['amount', 'date'],
      }
    : { data: [], columns: toRaw(visibleColumns.value), overscanCount: 20 }
  sendMessage(action, actionParams).then((result) => {
    visibleRowsData.value = result.data
    totalCount.value = result.totalCount
    totalHeight.value = totalCount.value * rowHeight.value
    if (isGroup) {
      expandGroup.value = result.totalGroupNames
    }
    updateTotalRows(totalCount.value)
    //if (!canvasTableRef.value) return
    canvasRender = new CanvasTableRender(canvasWrapperRef.value, {
      columns: toRaw(visibleColumns.value),
      rowHeight: rowHeight.value,
      headHeight: headHeight.value,
      data: toRaw(visibleRowsData.value),
      columnWidths: toRaw(columnWidths.value),
      totalCount: totalCount.value,
    })
    canvasRender.render(visibleRange.value, toRaw(visibleRowsData.value))
    rowSelection = useRowSelection(totalCount)
  })
})

//表格自适应resize处理
let isResizing = false
const handleResize = throttle(() => {
  //防止循环调用
  if (isResizing) return

  isResizing = true

  try {
    let hasChange = false

    tableLayout.resize(tableContainer.value.clientWidth)
    const newWidth = tableLayout.getColumnWidths()
    for (const key in newWidth) {
      if (columnWidths.value[key] !== newWidth[key]) {
        hasChange = true
        break
      }
    }
    if (hasChange) {
      columnWidths.value = { ...newWidth }
    }
  } catch (e) {
  } finally {
    setTimeout(() => {
      isResizing = false
    }, 50)
  }
}, 100)

useElementResize(tableContainer, handleResize)

//列拖拽设置宽度处理
const handleColumnResize = (e: MouseEvent, col: ColumnSchema) => {
  let rafId: number | null = null
  const startX = e.clientX
  const startWidth = columnWidths.value[col.key]

  const onMouseMove = (e: MouseEvent) => {
    const dist = e.clientX - startX
    const newColWidth = Math.max(70, startWidth + dist)
    const newWidth = tableLayout.resizeColumn(col.key, Math.round(newColWidth))

    if (rafId) {
      cancelAnimationFrame(rafId)
    }

    //requestAnimationFrame节流
    rafId = requestAnimationFrame(() => {
      columnWidths.value = { ...newWidth }
      rafId = null
    })
  }
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    canvasRender.resizeCanvas(toRaw(columnWidths.value))
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
/***表格自适应处理end***/

//可编辑单元格点击加载对应组件事件
const handleStartEdit = ({ rowId, colKey, value, position }) => {
  const index = visibleColumns.value.findIndex((column) => column.key === colKey)
  const column = visibleColumns.value[index]
  if (index === -1 || column.props.readonly) return
  activeEditCell.value = {
    rowId,
    editKey: `${rowId}_${colKey}`,
    value,
    component: column,
  }
  editingCellClass = `[data-id="${props.data.id}"] .cell_${rowId}_${index}`
}
//可编辑单元格数据变化事件处理
const handleEditorChange = (changeData: Record<string, any>) => {
  const action = isGroup ? 'UPDATE_CELL_IN_GROUP' : 'UPDATE_CELL'
  sendMessage(action, changeData).then((result) => {
    const index = visibleRowsData.value.findIndex((r) => r.rowId === result.rowId)
    if (index !== -1) {
      visibleRowsData.value[index] = result.updatedRow
      if (activeEditCell.value) {
        const x = Number(activeEditCellStyle.value.left.replace('px', ''))
        const y = Number(activeEditCellStyle.value.top.replace('px', ''))
        canvasRender.renderCell(x, y - rowHeight.value, {
          rowIndex: index,
          colKey: changeData.colKey,
          value: changeData.value,
        })
      }
    }
  })
}
const handleScrollEvt = (e: MouseEvent) => {
  activeEditCellStyle.value = { ...activeEditCellStyle.value, opacity: 0 }
  handleScroll(e)
}
//canvas单击处理
const handleCanvasClick = async (e: MouseEvent) => {
  activeEditCell.value = null
  activeEditCellStyle.value = {}
  const rect = scrollWrapper.value.getBoundingClientRect()
  const { rowIndex, colIndex, startX } = canvasRender.getCellIndexFromClick(
    rect,
    e.clientX,
    e.clientY,
  )

  if (colIndex === -2 || rowIndex === -1) return
  let rowData = null
  if (isGroup) {
    await sendMessage('GET_ROW_IN_GROUP', { rowIndex }).then((res) => {
      rowData = res.data
    })
  } else {
    rowData = visibleRowsData.value.find((row) => row.rowId === 'data_' + rowIndex)
  }
  if (!rowData || (rowData.isGroup && colIndex !== -1)) return

  if (colIndex === -1) {
    //复选框单元格点击--正反选
    if (rowData.isGroup) {
      rowSelection.toggleGroupRows(rowData.name, rowData.ids, true)
    } else {
      rowSelection.toggleRow(rowData.rowId, true)
    }
  } else {
    //非复选框单元格点击--不反选
    rowSelection.toggleRow(rowData.rowId, false)

    const column = visibleColumns.value[colIndex]
    if (!rowData.isGroup && column && !column.props.readonly) {
      //对应可编辑组件加载
      activeEditCell.value = {
        rowId: rowData.rowId,
        editKey: `${rowData.rowId}_${column.key}`,
        value: rowData[column.key],
        component: column,
      }
      editingCellClass = `[data-id="${props.data.id}"]`
      activeEditCellStyle.value = {
        top: `${1 + rowHeight.value * Math.max(rowIndex - visibleRange.value.start + 1, 0)}px`,
        left: `${startX}px`,
        width: `${columnWidths.value[column.key]}px`,
        height: `${rowHeight.value - 2}px`,
        zIndex: 3,
      }
    }
  }
  //重绘选中行
  canvasRender.renderSelectRow(rowSelection.selectedRows.value)
}

//全选与反全选
const handleSelectAll = () => {
  selectAll.value = !selectAll.value
  if (selectAll.value) {
    rowSelection.selectAll()
    canvasRender.renderSelectRow(rowSelection.selectedRows.value)
  } else {
    rowSelection.clearSelection()
    canvasRender.render(visibleRange.value, toRaw(visibleRowsData.value))
  }
}

const resetFloatEdit = () => {
  if (!activeEditCell.value) return
  const rowId = activeEditCell.value?.rowId
  const index = visibleRowsData.value.findIndex((row) => row.rowId === rowId)
  if (index !== -1) {
    activeEditCellStyle.value = {
      ...activeEditCellStyle.value,
      top: `${rowHeight.value * (index + 1)}px`,
    }
  }
  activeEditCellStyle.value = { ...activeEditCellStyle.value, opacity: index === -1 ? 0 : 1 }
}

watch(visibleRange, (newRange, oldRange) => {
  if (
    (newRange && oldRange && newRange.start !== oldRange.start) ||
    (!oldRange && newRange !== oldRange)
  ) {
    console.log(newRange)
    const action = isGroup ? 'SCROLL_GROUP' : 'SCROLL'
    const actionParams = isGroup
      ? { ...toRaw(newRange), expandGroup: toRaw(expandGroup.value) }
      : toRaw(newRange)
    sendMessage(action, actionParams).then((result) => {
      visibleRowsData.value = result.data
      if (canvasRender) {
        canvasRender.render(visibleRange.value, toRaw(visibleRowsData.value))
      }
    })
  }
  resetFloatEdit()
})
</script>
<style>
.table-container .table-header {
  z-index: 3;
}
.table-container .table-header .header-cell {
  display: inline-block;
}
.table-container .table-header span {
  user-select: none;
}
.table-container .table-scroll-track {
  top: 0;
  width: 100%;
  left: 0;
  bottom: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background: transparent;
  z-index: 2;
}
.table-container .table-scroll-track:hover {
  opacity: 0.5;
}
.table-container .placeholder-scroller {
  width: 100%;
}
.table-container .canvas-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
  transform: translateZ(0);
  will-change: transform;
}
.table-container .canvas-wrapper canvas {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
}
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .table-container .canvas-wrapper canvas {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}
</style>
