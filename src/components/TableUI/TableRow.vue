<template>
  <div
    class="table-row bg-white border-b border-solid border-zinc-200 flex hover:bg-zinc-100"
    :class="`table-row-${rowData.rowId}`"
    :style="{ 'line-height': rowHeight + 'px' }"
  >
    <div
      v-for="(column, index) in columns"
      :key="column.key"
      class="table-cell px-2.5 text-zinc-500 relative align-middle"
      :class="{
        editable: !column.props.readonly,
        hoverable: !column.props.readonly,
        [`cell_${rowData.rowId}_${index}`]: true,
      }"
      :style="{ width: `${columnWidths[column.key]}px` }"
      @click="(e) => handleCellClick(e, column)"
      @hover="(e) => handleCellClick(e, column)"
    >
      <TableCell :column="column" :row-id="rowData.rowId" :cell-value="rowData[column.key]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TableCell from './TableCell.vue'
import { ColumnSchema } from '@/domain/schema'
const props = defineProps<{
  rowData: any
  columns: any[]
  columnWidths: Record<string, number>
  rowHeight: number
}>()

const emit = defineEmits<{
  (e: 'startEdit', payload: { rowId: string; colKey: string; value: any }): void
}>()

//可编辑单元格点击浮层加载对应组件
const handleCellClick = (e: Event, column: ColumnSchema) => {
  if (column.props.readonly) return

  emit('startEdit', {
    rowId: props.rowData.rowId,
    colKey: column.key,
    value: props.rowData[column.key],
  })
}
</script>

<style scoped>
.table-row {
  contain: content;
  content-visibility: auto;
  contain-intrinsic-size: 0 40px;
}
.table-row:last-child {
  border-bottom: 0;
}
</style>
