import { reactive, computed, ref } from 'vue'
import type { ComponentSchema } from '@/domain/schema/component'
import { useEditorStore } from '@/stores/editorStore'
/**组件通用设置参数*/
export interface UiConfig {
  /**表单项参数 smart-form-item级别*/
  id?: string //标识done
  cid?: string
  parent?: string
  col?: 1 | 2 | 3 | 4 //占父级容器的列数对应["一列","二列","三列","四列"]
  label: string //label done
  //switchChild?:boolean,//是否开启子表单
  errTip?: string //校验错误提示done
  helpTip?: string //帮助提示done
  validateStatus?: 0 | 1 | 2 | 3 //校验状态对应["error","success","loading","warning"]done
  size: 0 | 1 | 2 //尺寸对应["small","medium","large"]
  tip?: boolean //开启后标题旁边会有圆圈tip,内容是label名称done
  device: 0 | 1 | 2 //当前表单项用于哪个设备，对应["phone","tablet","desktop"]
  require?: boolean //是否必填done
  //fullWidth:boolean,//没看懂，待定
  preview?: boolean //是否在设计器中预览即时样式
  autoValidate?: boolean //是否自动校验

  /**组件参数 针对如input层级*/
  //preLabel?:string,//label在左或者上时，输入框内部左侧的文本
  defaultVal?: string //默认值
  placeholder?: string //输入提示done
  maxLength?: number //输入框的maxLength done
  clear?: boolean //输入框focus时内部右侧显示清除图标done
  disable?: boolean //输入框显示禁用 done
  //keepAll?:boolean,//输入框内容超出maxLength限制时是否显示
  //breakWord?:boolean,//输入框内容超出maxLength限制时是否截断不显示
  readonly?: boolean //是否只读
  hover?: boolean //综合hover disable readonly使用
  trim?: boolean //是否自动去除头尾空字符串 pending
  border: boolean //是否显示输入框边框done
  focus?: boolean //输入框是否自动聚焦done
  showIcon?: boolean //输入框内部右侧是否显示选择的图标done
  //beforeTxt?:string,//输入框内部左侧文字
  //afterTxt?:string,//输入框内部右侧文字
  //beforeBox?:string,//输入框外部左侧文字
  //afterBox?:string,//输入框外部右侧文字

  /**表单项直接父级容器设置参数*/
  tabStatus?: 0 | 1 //容器整体设置表单项状态 ["只读态","编辑态"]done
  tabLayout?: 1 | 2 | 3 | 4 //容器整体设置一行有几列表单项，对应["一列","二列","三列","四列"]
  labelPos: 'left' | 'top' | 'inner' //表单项的标签位置done
  labelAlign: 0 | 1 //容器整体设置表单项标签对齐位置标签["left","right"]done

  /**表单项inputBox层级的样式*/
  inlineStyle: Record<string, any> //设计器样式面板设置的样式最终会以字符串的形式拼接起来done
}
/**组件交互状态*/
export interface UiState {
  isFocus: boolean
}

export const useUiConfig = (initialConfig: Partial<UiConfig>) => {
  const editorStore = useEditorStore()
  const { findComponentById, updateComponentById } = editorStore
  const parentCom = ref<ComponentSchema>()
  const config = reactive<UiConfig>({
    label: '标签标题',
    size: 1,
    device: 2,
    showIcon: initialConfig.showIcon || false,
    border: true,
    ...initialConfig,
    labelPos: 'left',
    labelAlign: 1,
    inlineStyle: {},
  })
  //初始化更新每个组件的属性值
  if (config.id) {
    config.cid = config.id
    updateComponentById(config.cid, config)
  }
  if (config.parent) {
    parentCom.value = findComponentById(config.parent)
  }

  const state = reactive<UiState>({
    isFocus: false,
  })

  const uiByParent = {
    tabStatus: computed(() => parentCom.value?.props.tabStatus),
    labelPos: computed(() => parentCom.value?.props.labelPos || 'left'),
    labelAlign: computed(() => parentCom.value?.props.labelAlign || 1),
  }

  const uiClass = {
    item: computed(() => ({
      'flex flex-row': uiByParent.labelPos.value === 'left',
      'text-center': uiByParent.labelPos.value === 'top',
    })),
    outLabel: computed(() => ({
      'text-left': uiByParent.labelAlign.value === 0 && uiByParent.labelPos.value !== 'top',
      'text-right': uiByParent.labelAlign.value === 1 && uiByParent.labelPos.value !== 'top',
      'mb-0.5 text-center w-auto': uiByParent.labelPos.value === 'top',
    })),
    ctrl: computed(() => ({
      'flex-1': uiByParent.labelPos.value === 'left',
      'justify-center': uiByParent.labelPos.value === 'top',
    })),
    inputBox: computed(() => ({
      'border border-solid': config.border,
      'w-full': uiByParent.labelPos.value !== 'inner',
      'inner-input': uiByParent.labelPos.value === 'inner',
      /**'smart-inputBox-hover': config.hover,
      'smart-inputBox-focus':
        state.isFocus && !config.disable && !config.readonly && uiByParent.tabStatus.value !== 0,*/
      'smart-inputBox-error': config.validateStatus === 0 || config.errTip,
      'smart-inputBox-warning': config.validateStatus === 3,
      'smart-inputBox-disable': config.disable,
      'smart-inputBox-readonly':
        config.tabStatus === undefined ? config.readonly : !uiByParent.tabStatus.value,
    })),
    checkIcon: computed(() => ({
      'smart-checkbox-disable': config.disable,
      'smart-checkbox-readonly':
        uiByParent.tabStatus.value === undefined ? config.readonly : !uiByParent.tabStatus.value,
    })),
  }

  const uiStatic = {
    /**类输入框组件通用样式*/
    item: 'smart-form-item text-xs mb-4',
    outLabel: 'smart-form-item-label text-gray-500 leading-7 w-24 px-3 inline-block relative',
    ctrl: 'smart-form-item-control',
    inputBox: 'smart-form-item-inputBox rounded inline-table border-separate align-middle',
    innerLabel:
      'smart-form-item-innerLabel table-cell bg-transparent whitespace-nowrap text-left pl-2 text-gray-500 w-14 whitespace-nowrap align-middle relative',
    input: 'smart-form-item-input w-full px-2 outline-0 border-0 bg-transparent',
    icon: 'smart-form-item-icon table-cell pr-2 bg-transparent align-middle w-px',
    /**类复选框组件通用样式*/
    checkCtrl: 'smart-form-item-control flex flex-row items-center flex-1',
    checkbox: 'smart-form-item-checkbox smart-input bg-transparent inline-table',
    checkIcon: 'smart-form-item-checkIcon inline-block bg-transparent cursor-pointer',
  }

  const uiEvents = {
    focus: () => {
      state.isFocus = true
    },
    blur: () => {
      state.isFocus = false
    },
    mouseOver: () => {
      config.hover = !config.disable && !config.readonly && uiByParent.tabStatus.value !== 0
    },
    mouseLeave: () => {
      config.hover = false
    },
    change: () => {
      //处理trim
    },
  }

  const updateConfig = (newConfig: Partial<UiConfig>) => {
    Object.assign(config, newConfig)
  }

  const resetState = () => {
    state.isFocus = false
  }

  return {
    config,
    state,
    uiClass,
    uiStatic,
    uiEvents,
    uiByParent,
    updateConfig,
    resetState,
  }
}

export const defaultConfig: Partial<UiConfig> = {
  clear: false,
  showIcon: false,
  labelPos: 'left',
}
