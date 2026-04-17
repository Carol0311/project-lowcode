<template>
  <div
    v-bind="$attrs"
    ref="tableContainer"
    class="smart-edit-table edit-table mt-2.5 table-container"
  >
    <div
      class="table-header flex flex-row border border-solid border-zinc-200 border-b-0"
      :style="{ 'line-height': rowHeight + 'px' }"
    >
      <div
        v-for="column in visibleColumns"
        :key="column.key"
        class="header-cell px-2.5 text-zinc-500 relative"
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
      ref="tbContainer"
      class="table-body overflow-auto virtual-table"
      :style="{ height: containerHeight + 'px' }"
      @scroll="handleScroll"
    >
      <div class="table-spacer" :style="{ height: totalHeight + 'px' }">
        <div
          class="table-content border border-solid border-zinc-200"
          :style="{ transform: `translateY(${offsetY}px)` }"
        >
          <template v-if="isFastScrolling"
            ><div
              v-for="line in visibleRowsData.length"
              :key="line"
              class="bg-zinc-200 rounded-3xl m-2.5"
              :style="{ height: `${rowHeight - 20}px` }"
            ></div
          ></template>
          <template v-else>
            <template v-for="row in visibleRowsData" :key="row.rowId">
              <div
                v-if="row.isGroup"
                class="group-header text-orange-300 px-2.5 flex flex-row items-center"
                :style="{ height: `${rowHeight}px` }"
              >
                {{ row.name }}
              </div>
              <TableRow
                v-else
                :row-id="row.rowId"
                :row-data="row"
                :columns="visibleColumns"
                :column-widths="columnWidths"
                :row-height="rowHeight"
                @start-edit="handleStartEdit"
              />
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
  <Teleport :to="editingCellClass">
    <FloatingEditor
      v-if="!!activeEditCell"
      :active-edit-cell="activeEditCell"
      @cell-editor-change="handleEditorChange"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, toRaw } from 'vue'
import { throttle } from 'lodash-es'
import TableRow from './TableRow.vue'
import FloatingEditor from './FloatingEditor.vue'
import { LayoutManager } from './core/LayoutManager'
import { useTableWorker } from './composables/useTableWorker'
import { useVirtualTable } from './composables/useVirtualTable'
import { useElementResize } from '@/composables/useElementResize'
import { COMPONENT_DEFAULT_PROPS } from '@/domain/constants/props'
import { ComponentSchema, ComponentType, ColumnSchema } from '@/domain/schema'

const { initWorker, sendMessage } = useTableWorker()

const isGroup = true
const expandGroup = ref<string[]>([])
const props = defineProps<{
  data: ComponentSchema
}>()

const activeEditCell = ref<{
  rowId: string
  editKey: string
  component: ColumnSchema
  value?: any
} | null>(null)

let editingCellClass = 'body'

//表格组件容器
const tableContainer = ref<HTMLElement>()
//table body 容器
const tbContainer = ref<HTMLElement>()

//默认行高
const rowHeight = ref(40)
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
  overscanCount: 20,
  tbContainer,
  mode: 'DOM',
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
    console.log(result)
    visibleRowsData.value = result.data
    totalCount.value = result.totalCount
    totalHeight.value = totalCount.value * rowHeight.value
    if (isGroup) {
      expandGroup.value = result.totalGroupNames
    }
    updateTotalRows(totalCount.value)
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
    const newWidth = tableLayout.resizeColumn(col.key, newColWidth)

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
    }
  })
}

watch(visibleRange, (newRange, oldRange) => {
  if (newRange !== oldRange) {
    const action = isGroup ? 'SCROLL_GROUP' : 'SCROLL'
    const actionParams = isGroup
      ? { ...toRaw(newRange), expandGroup: toRaw(expandGroup.value) }
      : toRaw(newRange)
    sendMessage(action, actionParams).then((result) => {
      visibleRowsData.value = result.data
    })
  }
})
</script>
<style scoped>
.virtual-table {
  will-change: transform;
  contain: strict;
}
.virtual-table .table-content {
  will-change: transform;
}
</style>
