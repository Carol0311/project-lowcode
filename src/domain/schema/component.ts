//component schema
export type ComponentType =
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
export interface ComponentSchema {
  id: string
  parentId: string | null
  type: ComponentType
  props: Record<string, any>
  children: string[] //保存子节点id
}
