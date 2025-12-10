//组件注册表：type → Vue 组件
import type { Component } from 'vue'
import * as UintUI from '@/components/UintUI'
import * as ContainerUI from '@/components/ContainerUI'
import type { ComponentType } from '@/domain/schema/component'
const registry: Record<ComponentType, Component> = {
  Text: UintUI.Text,
  Date: UintUI.Date,
  DateRange: UintUI.DateRange,
  SSelect: UintUI.SSelect,
  Switch: UintUI.Switch,
  Info: UintUI.Info,
  Number: UintUI.Number,
  Price: UintUI.Price,
  Qty: UintUI.Qty,
  Radio: UintUI.Radio,
  RadioGroup: UintUI.RadioGroup,
  SCheckbox: UintUI.SCheckbox,
  CheckboxGroup: UintUI.CheckboxGroup,
  TextArea: UintUI.TextArea,
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
