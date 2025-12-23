<template>
  <div class="smart-upload bg-white">
    <div
      class="upload-action relative bg-zinc-100 border border-dashed border-zinc-300"
      tabindex="0"
      @paste="pasteFile"
      @drop="dropFile"
    >
      <div class="upload-area text-zinc-500 relative text-center">
        粘贴，拖拽文件至此区域上传或点击按钮上传
      </div>
      <input
        ref="fileSelectInput"
        type="file"
        :accept="ACCEPT_TYPE"
        class="upload-input absolute"
        @change="afterFileSelect"
      />
    </div>
    <div class="flex flex-row items-center justify-center text-white my-2">
      <span class="leading-6 bg-orange-300 rounded mr-5 px-2" @click="selectFile">选择文件</span>
      <span
        v-if="isMobileDevice && ishasCamera"
        class="leading-6 bg-orange-300 rounded ml-5 px-2"
        @click="captureEvt"
        >拍照上传</span
      >
    </div>
    <div class="file-list"></div>
  </div>
</template>
<script setup lang="ts">
import { useTemplateRef, ref, onMounted } from 'vue'
import { ComponentSchema } from '@/domain/schema/component'
import { useUiConfig } from '@/composables/useUiConfig'
import { isMobile, hasCamera } from '@/utils'

//上传文件接受类型
const ACCEPT_TYPE = 'image/*,.pdf,.word,.xlsx,.doc,.docx,.txt,.zip'
//文件最小切片
const CHUNK_SIZE = 2 * 1024 * 1024
const isMobileDevice = ref<boolean>(false)
const ishasCamera = ref(false)

onMounted(() => {
  isMobileDevice.value = isMobile()
  ishasCamera.value = Boolean(hasCamera())
})

//属性初始化
const props = defineProps<{
  data: ComponentSchema
}>()
useUiConfig(props.data.id)

//上传文件触发input
const fileSelectInput = useTemplateRef<HTMLInputElement>('fileSelectInput')

//按钮选择文件上传
const selectFile = () => {
  fileSelectInput.value.click()
}
//移动端拍照上传
const captureEvt = () => {}
//文件选择结束触发事件
const afterFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files[0]
  splitFileChunk(file)
}
//粘贴文件上传
const pasteFile = (e) => {
  const file = e.clipboardData.files[0]
  splitFileChunk(file)
}
//拖拽文件上传
const dropFile = (e) => {
  const file = e.dataTransfer.files[0]
  splitFileChunk(file)
}
//生成file hash
const generateFileHash = async (file: File) => {
  const buffer = await file.slice(0, 1024 * 1024).arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString().padStart(2, '0'))
    .join('')
}
//大文件切片处理
const splitFileChunk = async (file: File) => {
  const fileHash = await generateFileHash(file)
  //发送请求到后端 如果已经存在 终止上传操作 return

  const chunkNum = Math.ceil(file.size / CHUNK_SIZE)
  const chunkList = []
  for (let i = 0; i < chunkNum; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    chunkList.push({ index: i, file: file.slice(start, end), fileHash })
  }
  uploadChunk(chunkList)
}
//分片上传
const uploadChunk = async (chunkList) => {
  const uploadPromise = chunkList.map(async (chunk) => {
    const formData = new FormData()
    formData.append('index', chunk.index)
    formData.append('file', chunk.file)
    formData.append('fileHash', chunk.fileHash)
    formData.append('total', chunk.chunkNum)
    //发送请求到服务端上传文件切片
  })
  await Promise.all(uploadPromise)
  //发送请求到服务端通知合并文件切片
}
</script>
<style coped>
.upload-action {
  height: 7.5rem;
}
.upload-area {
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
  z-index: 1;
}
.upload-input {
  opacity: 0;
  width: 100%;
  height: 7.5rem;
  top: 0;
  left: 0;
  z-index: 3;
}
</style>
