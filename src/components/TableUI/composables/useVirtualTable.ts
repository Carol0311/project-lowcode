//虚拟滚动逻辑

import { ref, computed, Ref } from 'vue'
import { VirtualTableCore } from '../core/VirtualTableCore'

export function useVirtualTable(options: {
  rowHeight: number
  totalRows: number
  tbContainer: Ref<HTMLElement | null>
}) {
  const scrollTop = ref(0)
  const containerHeight = ref(0)
  const visibleRange = ref({ start: 0, end: 0 })

  const core = new VirtualTableCore({
    rowHeight: options.rowHeight,
    totalRows: options.totalRows,
  })

  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    scrollTop.value = target.scrollTop
    containerHeight.value = target.clientHeight

    const range = core.updateScroll(scrollTop.value, containerHeight.value)
    visibleRange.value = { start: range.start, end: range.end }
  }

  const updateTotalRows = (totalRows: number) => {
    core.updateTotalRows(totalRows)
  }

  // 计算偏移量
  const offsetY = computed(() => {
    return core.getOffsetY(scrollTop.value)
  })

  return {
    visibleRange,
    offsetY,
    handleScroll,
    updateTotalRows,
  }
}
