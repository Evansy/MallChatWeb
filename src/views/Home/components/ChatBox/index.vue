<script setup lang="ts">
import { ref, computed } from 'vue'
import 'element-plus/es/components/message/style/css'
import { ElMessage } from 'element-plus'
import { useWsLoginStore } from '@/stores/ws'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import apis from '@/services/apis'

import UserList from '../UserList/index.vue'
import ChatList from '../ChatList/index.vue'

const chatStore = useChatStore()

const isSelect = ref(false)

const inputMsg = ref('')
const sendMsgHandler = () => {
  // 空消息禁止发送
  if (!inputMsg.value?.length) {
    return
  }

  // 发送消息
  apis
    .sendMsg({ content: inputMsg.value, roomId: 1 })
    .send()
    .then((res) => {
      // 消息列表新增一条消息
      chatStore.pushMsg(res)
      // 清空输入列表
      inputMsg.value = ''
    })
    .catch((error) => ElMessage.error(error.message || '消息发送失败请稍后重试'))
}

// 显示登录框
const loginStore = useWsLoginStore()
const onShowLoginBoxHandler = () => (loginStore.showLogin = true)

// 是否已登录
const userStore = useUserStore()
const isSign = computed(() => userStore.isSign)
</script>

<template>
  <div class="chat-box">
    <div class="chat-wrapper">
      <template v-if="isSelect">
        <ElIcon :size="160" color="#999"><IEpChatDotRound /></ElIcon>
      </template>
      <template v-else>
        <div class="chat">
          <ChatList />
          <div class="chat-msg-send">
            <div class="msg-input-wrapper">
              <input class="msg-input" type="text" v-model="inputMsg" @keyup.enter="sendMsgHandler" />
              <div class="chat-not-login-mask" :hidden="isSign">
                <ElIcon class="icon-lock"><IEpLock /></ElIcon>
                <a class="login-link" @click="onShowLoginBoxHandler">点我登录</a>之后再发言~
              </div>
            </div>
            <button class="send-button" :disabled="!inputMsg.length" @click="sendMsgHandler">🚀</button>
          </div>
        </div>
      </template>
    </div>
    <UserList />
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
