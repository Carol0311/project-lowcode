import { reactive, computed } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { UI_STATIC } from '@/composables/constant/uiClass'
import { createDefaultProps } from '@/domain/editor/treeManager'
import { ComponentType } from '@/domain/schema'
import {
  PhGear,
  PhXCircle,
  PhCalendar,
  PhToggleRight,
  PhCheckSquare,
  PhCheckCircle,
  PhCaretCircleDown,
} from '@phosphor-icons/vue'

/**组件交互状态*/
export interface UiState {
  isFocus: boolean
}

export const useUiConfig = (componentId: string) => {
  const editorStore = useEditorStore()
  const { findComponentById, updateComponent } = editorStore

  const component = computed(() => {
    return findComponentById(componentId)
  })

  const defaultProps = createDefaultProps(component.value.type)
  const config = computed(() => {
    return {
      ...defaultProps,
      ...component.value.props,
      cid: component.value.id,
      parent: component.value.parentId,
    }
  })
  //初始化更新每个组件的属性值
  updateComponent(config.value.cid, config.value)

  const parentCom = computed(() => {
    return findComponentById(config.value.parent)
  })

  const state = reactive<UiState>({
    isFocus: false,
  })

  const uiByParent = {
    tabStatus: computed(() => parentCom.value?.props.tabStatus),
    labelPos: computed(() => {
      return parentCom.value?.props.labelPos || 'left'
    }),
    labelAlign: computed(() => parentCom.value?.props.labelAlign || 1),
  }

  const uiClass = {
    item: computed(() => ({
      'flex flex-row': uiByParent.labelPos.value === 'left',
      'text-center': uiByParent.labelPos.value === 'top',
    })),
    outLabel: computed(() => ({
      'text-left': !uiByParent.labelAlign.value && uiByParent.labelPos.value !== 'top',
      'text-right': uiByParent.labelAlign.value && uiByParent.labelPos.value !== 'top',
      'mb-0.5 text-center w-auto': uiByParent.labelPos.value === 'top',
    })),
    ctrl: computed(() => ({
      'flex-1': uiByParent.labelPos.value === 'left',
      'justify-center': uiByParent.labelPos.value === 'top',
    })),
    inputBox: computed(() => {
      return {
        'border border-solid': config.value.border,
        'w-full': uiByParent.labelPos.value !== 'inner',
        'inner-input': uiByParent.labelPos.value === 'inner',
        /**'smart-inputBox-hover': config.value.hover,
      'smart-inputBox-focus':
        state.isFocus && !config.value.disable && !config.value.readonly && uiByParent.tabStatus.value !== 0,*/
        'smart-inputBox-error': config.value.validateStatus === 0 || config.value.errTip,
        'smart-inputBox-warning': config.value.validateStatus === 3,
        'smart-inputBox-disable': config.value.disable,
        'smart-inputBox-readonly':
          config.value.tabStatus === undefined
            ? config.value.readonly
            : !uiByParent.tabStatus.value,
      }
    }),
    checkIcon: computed(() => ({
      'smart-checkbox-disable': config.value.disable,
      'smart-checkbox-readonly':
        uiByParent.tabStatus.value === undefined
          ? config.value.readonly
          : !uiByParent.tabStatus.value,
    })),
  }

  const uiEvents = {
    focus: () => {
      state.isFocus = true
    },
    blur: () => {
      state.isFocus = false
    },
    mouseOver: () => {
      config.value.hover =
        !config.value.disable && !config.value.readonly && uiByParent.tabStatus.value !== 0
    },
    mouseLeave: () => {
      config.value.hover = false
    },
    change: () => {
      //处理trim
    },
  }

  const resetState = () => {
    state.isFocus = false
  }
  const getIcon = (type: ComponentType) => {
    switch (type) {
      case 'Text':
      case 'TextArea':
        return config.value.clear ? PhXCircle : PhGear
      case 'SSelect':
        return config.value.clear ? PhXCircle : PhCaretCircleDown
      case 'Date':
      case 'DateRange':
        return config.value.clear ? PhXCircle : PhCalendar
      case 'Switch':
        return PhToggleRight
      case 'Radio':
      case 'RadioGroup':
        return PhCheckCircle
      case 'SCheckbox':
      case 'CheckboxGroup':
        return PhCheckSquare
      default:
        return PhGear
    }
  }

  return {
    config,
    state,
    uiClass,
    uiStatic: UI_STATIC,
    uiEvents,
    uiByParent,
    getIcon,
    resetState,
  }
}
