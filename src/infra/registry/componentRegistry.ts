//组件注册表：type → Vue 组件
import type { Component } from 'vue'
import * as UnitUI from '@/components/UnitUI'
import * as ToolUI from '@/components/ToolUI'
import * as TableUI from '@/components/TableUI'
import * as ContainerUI from '@/components/ContainerUI'
import FormItem from '@/components/SlotUI/FormItem.vue'
import type { ComponentType } from '@/domain/schema/component'
const registry: Record<ComponentType, Component> = {
  FormItem: FormItem,

  Text: UnitUI.Text,
  Date: UnitUI.Date,
  DateRange: UnitUI.DateRange,
  SSelect: UnitUI.SSelect,
  Switch: UnitUI.Switch,
  Tips: ToolUI.Tips,
  Number: UnitUI.Number,
  Price: UnitUI.Price,
  Qty: UnitUI.Qty,
  Radio: UnitUI.Radio,
  RadioGroup: UnitUI.RadioGroup,
  SCheckbox: UnitUI.SCheckbox,
  CheckboxGroup: UnitUI.CheckboxGroup,
  TextArea: UnitUI.TextArea,
  Upload: UnitUI.Upload,
  Address: UnitUI.Address,
  Image: UnitUI.Image,
  Button: UnitUI.Button,
  MenuButton: UnitUI.MenuButton,
  ButtonGroup: UnitUI.ButtonGroup,
  Search: UnitUI.Search,
  Filter: UnitUI.Filter,
  CategorySearch: UnitUI.CategorySearch,
  Operation: UnitUI.Operation,

  EditTable: TableUI.EditTable,
  RelationTable: TableUI.RelationTable,
  GroupTable: TableUI.GroupTable,

  AdvanceForm: ContainerUI.AdvanceForm,
  Container: ContainerUI.Container,
  EvelatorForm: ContainerUI.EvelatorForm,
  Form: ContainerUI.Form,
}
export const componentRegistry = {
  get(type: ComponentType): Component {
    try {
      return registry[type]
    } catch (e) {
      console.log('找不到目标组件', e)
      return registry['Container']
    }
  },
  register(type: ComponentType, component: Component) {
    registry[type] = component
  },
  has(type: ComponentType): boolean {
    return type in registry
  },
}
