<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWsLoginStore } from '@/stores/ws'
import { useUserStore } from '@/stores/user'
import apis from '@/services/apis'

import UserList from '../UserList/index.vue'
import ChatList from '../ChatList/index.vue'

const isSelect = ref(false)

const inputMsg = ref('')
const sendMsgHandler = () => {
  // 空消息禁止发送
  if (!inputMsg.value?.length) {
    return
  }

  // 发送消息
  apis.sendMsg({ content: inputMsg.value, roomId: 1 }).send()
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
                <ElIcon class="icon-lock"><IEpLock /></ElIcon
                ><a class="login-link" @click="onShowLoginBoxHandler">点我登录</a>之后再发言~
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
