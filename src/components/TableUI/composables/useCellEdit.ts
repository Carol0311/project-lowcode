import { ComponentSchema } from '@/domain/schema'

export const useCellEdit = () => {
  //编辑单元格
  const editingCell = () => {}
  //编辑组件
  const editingComponent = () => {
    return <ComponentSchema>{
      id: 'table-cell-1',
      parentId: 'table',
      type: 'Text',
      props: {},
      children: [], //保存子节点id}
    }
  }
  //编辑位置
  const editingPosition = () => {}
  //开始编辑
  const startEdit = () => {}
  //结束编辑
  const stopEdit = () => {}
  return {
    editingCell,
    editingComponent,
    editingPosition,
    startEdit,
    stopEdit,
  }
}
