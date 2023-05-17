<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWsLoginStore } from '@/stores/ws'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import apis from '@/services/apis'

import UserList from '../UserList/index.vue'
import ChatList from '../ChatList/index.vue'

const chatStore = useChatStore()
const isSelect = ref(false)
const isSending = ref(false)
const inputMsg = ref('')
const msg_input_ref = ref<HTMLInputElement>()
const currentMsgReply = computed(() => (userStore.isSign && chatStore.currentMsgReply) || {})

const sendMsgHandler = () => {
  // 空消息禁止发送
  if (!inputMsg.value?.length) {
    return
  }

  // 标记消息发送中
  isSending.value = true

  // 发送消息
  apis
    .sendMsg({ content: inputMsg.value, replyMsgId: currentMsgReply.value.message?.id, roomId: 1 })
    .send()
    .then((res) => {
      // 消息列表新增一条消息
      chatStore.pushMsg(res)
      // 清空输入列表
      inputMsg.value = ''
      // 置空回复的消息
      onClearReply()
    })
    .finally(() => {
      isSending.value = false
      // 输入框重新获取焦点
      setTimeout(() => msg_input_ref.value?.focus(), 10)
      // 滚动到消息列表底部
      chatStore.chatListToBottomAction?.()
    })
}

// 显示登录框
const loginStore = useWsLoginStore()
const onShowLoginBoxHandler = () => (loginStore.showLogin = true)

// 是否已登录
const userStore = useUserStore()
const isSign = computed(() => userStore.isSign)
// 置空回复的消息
const onClearReply = () => (chatStore.currentMsgReply = {})
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
            <div v-if="Object.keys(currentMsgReply).length" class="reply-msg-wrapper">
              <span>{{ currentMsgReply.fromUser?.username }}: {{ currentMsgReply.message?.content }}</span>
              <el-icon class="reply-msg-icon" :size="14" @click="onClearReply"><IEpClose /></el-icon>
            </div>
            <div class="msg-input-box">
              <div class="msg-input-wrapper">
                <input
                  class="msg-input"
                  type="text"
                  ref="msg_input_ref"
                  autofocus
                  v-model="inputMsg"
                  :disabled="!isSign || isSending"
                  :placeholder="isSign ? (isSending ? '消息发送中' : '来聊点什么吧~') : ''"
                  @keyup.enter="sendMsgHandler"
                />
                <div class="chat-not-login-mask" :hidden="isSign">
                  <ElIcon class="icon-lock"><IEpLock /></ElIcon>
                  <a class="login-link" @click="onShowLoginBoxHandler">点我登录</a>之后再发言~
                </div>
              </div>
              <button class="send-button" :disabled="!inputMsg.length" @click="sendMsgHandler">🚀</button>
            </div>
          </div>
        </div>
      </template>
    </div>
    <UserList />
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
