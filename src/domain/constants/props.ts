import { ComponentProps } from '@/domain/schema'
export const COMPONENT_DEFAULT_PROPS: ComponentProps = {
  cid: '',
  parent: '',
  col: 2,
  label: '标签标题',
  errTip: '',
  helpTip: '',
  validateStatus: 1,
  size: 1,
  tip: false,
  device: 2,
  require: false,
  preview: false,
  autoValidate: false,

  defaultVal: '',
  placeholder: '',
  maxLength: Infinity,
  clear: false,
  disable: false,
  readonly: false,
  hover: false,
  trim: true,
  border: true,
  focus: false,
  showIcon: false,

  tabStatus: 1,
  tabLayout: 2,
  labelPos: 'left',
  labelAlign: 0,

  isContainer: false,
  parentDirect: 'column',

  inlineStyle: {},
}
