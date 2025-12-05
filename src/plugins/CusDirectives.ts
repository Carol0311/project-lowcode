import type { DirectiveBinding } from 'vue'

//帮助提示弹出框
export const vDialog = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const pos = el.getBoundingClientRect()
    const wrapper = document.createElement('div')
    wrapper.innerText = binding.value
    wrapper.setAttribute('tid', binding.arg)
    wrapper.setAttribute(
      'class',
      'tip-dialog-wrapper absolute text-xs text-gray-500 bg-white py-2 px-4 rounded shadow-md hidden hover:block',
    )
    document.querySelector('body')?.appendChild(wrapper)
    const w = document.querySelector(`body .tip-dialog-wrapper[tid=${binding.arg}]`)
    w?.setAttribute('style', `;top:${pos.top - 8}px;left:${pos.left + 14}px;`)
    const wClass = w?.classList
    el.onmouseover = function () {
      wClass?.remove('hidden')
    }
    el.onmouseleave = function () {
      wClass?.add('hidden')
    }
  },
}
//focus
export const vFocus = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    if (binding.value) {
      el.focus()
    }
  },
}

export const directives = {
  dialog: vDialog,
  focus: vFocus,
}
