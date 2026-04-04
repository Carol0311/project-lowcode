<template>
  <span v-if="['ButtonGroup', 'Operation'].includes(column.type)">
    <span
      v-for="btn in cellValue"
      :key="btn"
      class="mr-3"
      :class="{ 'text-orange-500': !column.props.readonly }"
      >{{ btn }}</span
    >
  </span>
  <span v-else-if="column.type === 'Switch'">
    <PhToggleRight v-if="Boolean(cellValue)" :size="16" weight="thin" />
    <PhToggleLeft v-else :size="16" weight="thin" />
  </span>
  <span v-else-if="column.type === 'SCheckbox'">
    <PhCheckSquare v-if="Boolean(cellValue)" :size="16" weight="thin" />
    <PhSquare v-else :size="16" weight="thin" />
  </span>
  <span v-else class="cell-content">
    {{ formatCellValue(cellValue, column) }}
  </span>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ColumnSchema } from '@/domain/schema'
import { formatDate, formatDateRange } from '@/utils/index'
import { PhToggleLeft, PhToggleRight, PhCheckSquare, PhSquare } from '@phosphor-icons/vue'
const props = defineProps<{
  rowId: string
  cellValue: any
  column: ColumnSchema
}>()

const formatCellValue = (value: any, column: any) => {
  switch (column.type) {
    case 'Text':
    case 'TextArea':
    case 'SSelect':
      return value
    case 'Number':
      return value
    case 'Qty':
      return value
    case 'Price':
      return value
    case 'Address':
      return value
    case 'Date':
      return formatDate(value)
    case 'DateRange':
      return formatDateRange(value)
    case 'Button':
      return value
    default:
      return value
  }
}
</script>
