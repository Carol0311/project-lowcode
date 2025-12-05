import type { Component } from 'vue'
import { markRaw } from 'vue'
import * as UintUI from '@/components/UintUI'
import * as ContainerUI from '@/components/ContainerUI'
//Record类型定义组件名称
type componentName =
  | 'Text'
  | 'Date'
  | 'DateRange'
  | 'SSelect'
  | 'Switch'
  | 'Info'
  | 'Number'
  | 'Price'
  | 'Qty'
  | 'Radio'
  | 'RadioGroup'
  | 'SCheckbox'
  | 'CheckboxGroup'
  | 'TextArea'
  | 'AdvanceForm'
  | 'Container'
  | 'EvelatorForm'
  | 'Form'
export const useDynComponent = () => {
  const registry: Record<componentName, Component> = {
    Text: markRaw(UintUI.Text),
    Date: markRaw(UintUI.Date),
    DateRange: markRaw(UintUI.DateRange),
    SSelect: markRaw(UintUI.SSelect),
    Switch: markRaw(UintUI.Switch),
    Info: markRaw(UintUI.Info),
    Number: markRaw(UintUI.Number),
    Price: markRaw(UintUI.Price),
    Qty: markRaw(UintUI.Qty),
    Radio: markRaw(UintUI.Radio),
    RadioGroup: markRaw(UintUI.RadioGroup),
    SCheckbox: markRaw(UintUI.SCheckbox),
    CheckboxGroup: markRaw(UintUI.CheckboxGroup),
    TextArea: markRaw(UintUI.TextArea),
    AdvanceForm: markRaw(ContainerUI.AdvanceForm),
    Container: markRaw(ContainerUI.Container),
    EvelatorForm: markRaw(ContainerUI.EvelatorForm),
    Form: markRaw(ContainerUI.Form),
  }
  //注册新组件
  const registerComponent = (name: componentName, component: Component) => {
    registry[name] = component
  }

  //根据名称获取组件
  const getComponent = (name: componentName) => {
    if (name in registry) {
      return registry[name]
    }
    if (name in UintUI) {
      return (UintUI as any)[name] //类型断言
    }
    if (name in ContainerUI) {
      return (ContainerUI as any)[name]
    }
  }
  //判断组件是否在注册列表内
  const hasComponent = (name: componentName) => {
    return name in registry
  }
  return {
    registerComponent,
    getComponent,
    hasComponent,
  }
}
