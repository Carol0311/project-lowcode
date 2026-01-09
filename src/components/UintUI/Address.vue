<template>
  <FormItem :data="data" class="smart-address relative">
    <template #main="{ config, ui, icon }">
      <input
        v-focus="config.focus"
        :class="[ui.uiStatic.input]"
        autocomplete="false"
        :placeholder="config.placeholder"
        :maxlength="config.maxLength"
        :disabled="config.disable"
        :readonly="true"
        :value="addressInfo"
        @click="() => (showAddress = !showAddress)"
      />
      <span v-if="config.clear || config.showIcon" :class="[ui.uiStatic.icon]">
        <component :is="icon" weight="duotone" size="16" class="text-zinc-400 cursor-pointer" />
      </span>
      <div v-show="showAddress" class="address-list absolute bg-white text-zinc-500 flex flex-row">
        <div class="province item">
          <div
            v-for="province in provinceList"
            :key="province.id"
            :class="{ selected: selected[0] === province.id }"
            @click="selectedAddress(0, province.id, province.name)"
          >
            {{ province.name }}
          </div>
        </div>
        <div v-show="selected[0]" class="city item" :style="{ width: selected[0] ? '7.5rem' : 0 }">
          <div
            v-for="city in cityList"
            :key="city.id"
            :class="{ selected: selected[1] === city.id }"
            @click="selectedAddress(1, city.id, city.name)"
          >
            {{ city.name }}
          </div>
        </div>
        <div
          v-show="selected[1]"
          class="district item"
          :style="{ width: selected[1] ? '7.5rem' : 0 }"
        >
          <div
            v-for="district in districtList"
            :key="district.id"
            :class="{ selected: selected[2] === district.id }"
            @click="selectedAddress(2, district.id, district.name)"
          >
            {{ district.name }}
          </div>
        </div>
        <div
          v-show="selected[2]"
          class="county item"
          :style="{ width: selected[2] ? '7.5rem' : 0 }"
        >
          <div
            v-for="county in countyList"
            :key="county.id"
            :class="{ selected: selected[3] === county.id }"
            @click="selectedAddress(3, county.id, county.name)"
          >
            {{ county.name }}
          </div>
        </div>
      </div>
    </template>
  </FormItem>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { vFocus } from '@/plugins/CusDirectives'
import { ComponentSchema } from '@/domain/schema/component'
import { useUiConfig } from '@/composables/useUiConfig'
import FormItem from '../SlotUI/FormItem.vue'
import { getProvince, getCity, getDistrict, getCounty } from '@/infra/http/commonApi'
export interface AddressList {
  id: string
  parentid: string
  name: string
  children?: []
}

const showAddress = ref(false)
const addressInfo = ref('')
const selectedInfo = ref(['', '', '', ''])
const selected = ref([null, null, null, null])
const provinceList = ref<AddressList[]>([])
const cityList = ref<AddressList[]>([])
const districtList = ref<AddressList[]>([])
const countyList = ref<AddressList[]>([])

getProvince().then((res) => {
  provinceList.value = res.data
})

const props = defineProps<{
  data: ComponentSchema
}>()
useUiConfig(props.data.id)

const selectedAddress = (level: number, id: string, name: string) => {
  selected.value[level] = id
  selectedInfo.value[level] = name
  if (level === 0) {
    //select province,load city
    cityList.value = []
    districtList.value = []
    countyList.value = []
    getCity({ provinceId: selected.value[0] }).then((res) => {
      cityList.value = res.data
    })
  }
  if (level === 1) {
    //select city,load district
    districtList.value = []
    countyList.value = []
    getDistrict({ cityId: selected.value[1] }).then((res) => {
      districtList.value = res.data
    })
  }
  if (level === 2) {
    //select district,load county
    countyList.value = []
    getCounty({ districtId: selected.value[2] }).then((res) => {
      countyList.value = res.data
    })
  }
  if (level === 3) {
    //select county,compolete select
    showAddress.value = false
    addressInfo.value = selectedInfo.value.join('')
  }
}
</script>
<style scoped>
.address-list {
  height: 12.5rem;
  margin-top: 1px;
}
.address-list .item {
  height: 100%;
  width: 7.5rem;
  border-left: 1px solid rgb(212 212 216 / var(--tw-text-opacity, 1));
  overflow: auto;
}
.address-list .item:first-child {
  border-left: 0;
}
.address-list .item div {
  line-height: 1.5rem;
  padding: 0 0.75rem;
}
.address-list .item div:hover {
  color: rgb(253 186 116 / var(--tw-text-opacity, 1));
}
.address-list .item div.selected {
  color: #ffffff;
  background: rgb(253 186 116 / var(--tw-text-opacity, 1));
}
</style>
