<template>
  <div class="lowcode-left relative">
    <div class="menu-list w-12 h-full bg-white">
      <div class="menu">
        <PhTreeView :size="20" weight="thin" v-dialog:[domTree]="text" />
      </div>
      <div class="menu" @click="() => (showDetl = true)">
        <PhPuzzlePiece :size="20" weight="thin" v-dialog:[comTree]="text2" />
      </div>
    </div>
    <Transition name="panel">
      <div
        v-show="showDetl"
        @click="() => (showDetl = !showDetl)"
        :class="{ show: showDetl }"
        class="flex flex-col menu-detl-panel w-80 absolute top-0 text-gray-500 left-12 h-full bg-white border-l border-solid border-zinc-300 shadow-md"
      >
        <div class="flex flex-row justify-between items-center px-4 h-12">
          <span>组件库</span>
          <div>
            <PhResize :size="20" weight="thin" />
            <PhX :size="20" weight="thin" />
          </div>
        </div>
        <div class="px-4 py-3">
          <div
            class="border border-solid border-zinc-300 rounded flex flex-row h-7 items-center px-2"
          >
            <input
              type="text"
              class="border-0 flex-1"
              placeholder="搜索组件"
              @input.stop="searchEvt"
              @click.stop=""
            />
            <PhMagnifyingGlass :size="16" weight="thin" />
          </div>
        </div>
        <div class="flex flex-row text-center ui-tab">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="flex-1"
            :class="{ active: activeTab === tab.id }"
            @click.stop="() => (activeTab = tab.id)"
          >
            {{ tab.name }}
          </div>
        </div>
        <div
          class="flex-1 overflow-auto"
          v-for="group in comGroup"
          :key="group.id"
          v-show="group.id === activeTab"
        >
          <div v-for="(item, index) of group.children" :key="index">
            <div v-show="item.show">
              <div
                class="border-t border-solid border-zinc-300 h-10 flex flex-row justify-between items-center px-4"
              >
                <span>{{ item.name }}</span>
                <PhCaretDown
                  :size="16"
                  weight="thin"
                  v-if="!item.open"
                  @click.stop="
                    () => {
                      item.open = !item.open
                    }
                  "
                />
                <PhCaretUp
                  :size="16"
                  weight="thin"
                  v-if="item.open"
                  @click.stop="() => (item.open = !item.open)"
                />
              </div>
              <div
                v-if="item.open"
                class="grid ui-group border-t border-solid border-zinc-300"
                style="grid-template-columns: repeat(3, minmax(0, 1fr))"
              >
                <div
                  class="ui-item flex flex-col items-center justify-between border-l border-b border-solid border-zinc-300 p-3.5 h-28"
                  v-for="(child, cindex) of item.children"
                  v-show="child.show"
                  :key="cindex"
                >
                  <component
                    :is="child.icon"
                    :size="36"
                    weight="light"
                    :dragable="true"
                    @dragStart="dragStart"
                  />
                  <span>{{ child.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { vDialog } from '@/plugins/CusDirectives'
import {
  PhTreeView,
  PhPuzzlePiece,
  PhMagnifyingGlass,
  PhResize,
  PhX,
  PhCaretDown,
  PhCaretUp,
} from '@phosphor-icons/vue'
import tabDatas from './LeftMenu'
const { tabs, comGroup } = tabDatas
const text = ref('大纲树')
const text2 = ref('组件库')
const domTree = ref('domTree')
const comTree = ref('comTree')
const activeTab = ref('advance')
const showDetl = ref(false)
const searchEvt = function (e: any) {
  const searchText = e.target.value.trim()
  comGroup.value = comGroup.value.map((group) => {
    return {
      ...group,
      children: group.children.map((child) => {
        const items = child.children.map((item) => {
          return {
            ...item,
            show: item.name.toLowerCase().includes(searchText.toLowerCase()),
          }
        })
        const fitems = items.filter((item) => item.show)
        return {
          ...child,
          show: fitems.length > 0,
          children: items,
        }
      }),
    }
  })
}
//拖拽事件
const dragStart = () => {}
</script>
<style scoped>
.menu-list {
  position: relative;
  z-index: 3;
}
.menu-detl-panel {
  z-index: 1;
}
/**组件面板动画设置*/
.panel-enter-active,
.panel-leave-active {
  transition-property: transform;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
}
.panel-enter-from,
.panel-leave-to {
  transform: translateX(-20rem);
}
.panel-enter-to,
.panel-leave-from {
  transform: translateX(0);
}
.menu {
  line-height: 3rem;
  text-align: center;
}
.ui-group {
  transition-property: height;
  transition-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  transition-duration: 0.5s;
}
.ui-group .ui-item:nth-child(3n + 1) {
  border-left: none;
}
.ui-group .ui-item:nth-last-child(-n + 3) {
  border-bottom: none;
}
.ui-tab > div {
  padding: 0.75rem 0;
  position: relative;
}
.ui-tab .active {
  color: rgb(253 186 116 / var(--tw-text-opacity, 1));
}
.ui-tab .active::after {
  content: '';
  display: inline-block;
  position: absolute;
  left: 0;
  top: 100%;
  width: 100%;
  height: 1px;
  background-color: rgb(253 186 116 / var(--tw-text-opacity, 1));
}
</style>
