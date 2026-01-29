<template>
  <div class="chat-wrapper flex flex-col fixed bg-white w-80">
    <div class="chat-title inline-flex items-center h-10 shadow">
      <PhXCircle :size="24" weight="duotone" class="text-orange-300" @click="stopChat" />
      <PhListStar
        :size="24"
        weight="duotone"
        class="text-orange-300"
        @click="() => (showHistory = true)"
      />
      <div class="flex-1 text-center">对话标题</div>
      <PhPlusCircle :size="24" weight="duotone" class="text-orange-300" @click="startChatEvt" />
    </div>
    <div class="message-wrapper flex flex-col flex-1 p-2.5 text-gray-600 overflow-auto">
      <div v-if="receivedInfo && receivedInfo.progress === 0" class="text-center m-auto">
        <div
          class="robot-icon inline-block w-20 h-20 bg-orange-100 flex items-center justify-center m-auto"
        >
          <PhRobot :size="36" weight="duotone" class="text-orange-300" />
        </div>
        <pre class="leading-6 mt-2.5">{{ receivedInfo.reply }}</pre>
      </div>
      <template v-if="receivedInfo && receivedInfo.progress > 0">
        <div
          v-for="msg in messageList"
          :key="msg.id"
          :class="{ 'text-left': msg.role === 'assitant', 'text-right': msg.role === 'user' }"
          class="flex flex-col"
        >
          <div>
            <PhRobot
              v-show="msg.role === 'assitant'"
              :size="30"
              weight="duotone"
              class="text-orange-300"
            />
            <PhUserCircleGear
              v-show="msg.role === 'user'"
              :size="30"
              weight="duotone"
              class="text-blue-500"
            />
          </div>
          <div class="my-2.5" :class="msg.role">{{ msg.content }}</div>
        </div>
      </template>
    </div>
    <div class="input-wrapper flex flex-row items-center h-24 m-2.5">
      <textarea
        ref="userQst"
        type="text"
        class="flex-1 h-full p-2 resize-none text-gray-600"
        @keypress="keyEvt"
      />
      <PhArrowCircleUp :size="24" weight="duotone" class="text-orange-300" @click="sendMessage" />
    </div>
    <ChatHistory
      v-show="showHistory"
      class="absoluter"
      :class="{ show: showHistory, hide: showHistory }"
      :data="[]"
      @open-history="() => (showHistory = false)"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import {
  PhArrowCircleUp,
  PhPlusCircle,
  PhListStar,
  PhXCircle,
  PhRobot,
  PhUserCircleGear,
} from '@phosphor-icons/vue'
import { ChatHistory } from '@/views/layout'
import { startChat, continueChat, deleteChat } from '@/infra/http/aiApi'
import { ReplyData } from '@/domain/schema/request'

export interface MessageInfo {
  id: number
  role: string
  content: string
}

const emit = defineEmits(['open-chat', 'start-chat'])
const showHistory = ref(false)
const userQst = useTemplateRef('userQst')

const messageList = ref<MessageInfo[]>([])

const sessionId = ref('')
const receivedInfo = ref<ReplyData>()
const getSessionId = () => {
  if (localStorage.getItem('session-id')) {
    sessionId.value = localStorage.getItem('session-id')
  } else {
    sessionId.value = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('session-id', sessionId.value)
  }
}
onMounted(() => {
  getSessionId()
  startChat({ sessionId: sessionId.value }).then((res) => {
    if (res.success && res.data) {
      receivedInfo.value = res.data
    }
  })
})

const stopChat = () => {
  deleteChat({ sessionId: sessionId.value })
  localStorage.removeItem('session-id')
  emit('open-chat', false)
}
//新建会话窗口
const startChatEvt = () => {
  sessionId.value = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  localStorage.setItem('session-id', sessionId.value)
  startChat({ sessionId: sessionId.value }).then((res) => {
    if (res.success && res.data) {
      receivedInfo.value = res.data
    }
  })
}

const keyEvt = (e: KeyboardEvent) => {
  if (e.code === 'Enter' && !e.ctrlKey) {
    sendMessage()
  }
}
//继续会话
const sendMessage = () => {
  const qstMsg = userQst.value.value
  userQst.value.value = ''
  messageList.value.push({ id: messageList.value.length + 1, role: 'user', content: qstMsg })
  continueChat({ userInput: qstMsg, sessionId: sessionId.value }).then((res) => {
    if (res.success) {
      receivedInfo.value = res.data
      messageList.value.push({
        id: messageList.value.length + 1,
        role: 'assitant',
        content: res.data.reply,
      })
      console.log(messageList.value)
    }
  })
}
</script>
<style scoped>
.chat-wrapper {
  bottom: 0;
  top: 38px;
  z-index: 10;
  animation: right-to-left 0.4s linear forwards;
  animation-play-state: paused;
}
.chat-wrapper.show {
  animation-play-state: running;
  animation-direction: normal;
}
.chat-wrapper.hide {
  animation-play-state: running;
  animation-direction: reverse;
  animation-fill-mode: forwards;
}
.message-wrapper .assitant {
  padding-right: 30%;
  text-align: left;
}
.message-wrapper .user {
  padding-left: 30%;
  text-align: right;
}
.input-wrapper {
  border-radius: 20px 20px 0 0;
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px -1px rgb(0 0 0 / 0.1);
}
.robot-icon {
  border-radius: 100%;
}
@keyframes right-to-left {
  0% {
    transform: translateX(20rem);
  }
  25% {
    transform: translateX(15rem);
  }
  50% {
    transform: translateX(10rem);
  }
  75% {
    transform: translateX(5rem);
  }
  100% {
    transform: translateX(-9rem);
  }
}
</style>
