<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import type { ElInput } from 'element-plus'
import { useWsLoginStore } from '@/stores/ws'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import apis from '@/services/apis'
import { judgeClient } from '@/utils/detectDevice'
import { emojis } from './constant'

const client = judgeClient()

import UserList from '../UserList/index.vue'
import ChatList from '../ChatList/index.vue'

const chatStore = useChatStore()
const isSelect = ref(false)
const isSending = ref(false)
const inputMsg = ref('')
const msg_input_ref = ref<typeof ElInput>()

const focusMsgInput = () => {
  setTimeout(() => msg_input_ref.value?.focus(), 10)
}

provide('focusMsgInput', focusMsgInput)

const sendMsgHandler = (e: Event | KeyboardEvent) => {
  // 中文输入法的时候，按 ENTER，会直接提交，不是选中输入法的选项
  // https://www.zhangxinxu.com/wordpress/2023/02/js-enter-submit-compositionupdate
  const event = e as KeyboardEvent
  if (typeof event.keyCode === 'number' && event.keyCode !== 13) return
  // 空消息禁止发送
  if (!inputMsg.value?.trim().length) {
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
      focusMsgInput()
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
const currentMsgReply = computed(() => (userStore.isSign && chatStore.currentMsgReply) || {})

// 置空回复的消息
const onClearReply = () => (chatStore.currentMsgReply = {})
// 插入换行符
const onWrap = () => insertText('\n')
// 插入内容
const insertText = (emoji: string) => {
  let input = msg_input_ref.value?.textarea
  if (!input) return
  let startPos = input.selectionStart as number
  let endPos = input.selectionEnd as number
  let resultText = input.value.substring(0, startPos) + emoji + input.value.substring(endPos)
  // 需要保留，否则光标位置不正确。
  input.value = resultText
  // 需要更新以触发 onChang
  inputMsg.value = resultText
  input.focus()
  input.selectionStart = startPos + emoji.length
  input.selectionEnd = startPos + emoji.length
  //临时让获取焦点
  focusMsgInput()
}
</script>

<template>
  <div class="chat-box">
    <div class="chat-wrapper">
      <template v-if="isSelect">
        <ElIcon :size="160" color="#999"><IEpChatDotRound /></ElIcon>
      </template>
      <template v-else>
        <div class="chat">
          <ChatList @start-replying="focusMsgInput" />
          <div class="chat-msg-send">
            <div v-if="Object.keys(currentMsgReply).length" class="reply-msg-wrapper">
              <span>{{ currentMsgReply.fromUser?.username }}: {{ currentMsgReply.message?.content }}</span>
              <el-icon class="reply-msg-icon" :size="14" @click="onClearReply"><IEpClose /></el-icon>
            </div>
            <div class="msg-input-box">
              <div class="msg-input-wrapper">
                <!-- @keydown.enter.prevent 阻止 textarea 默认换行事件 -->
                <el-input
                  name="input_content"
                  :autosize="{ minRows: 1, maxRows: 4 }"
                  class="msg-input"
                  type="textarea"
                  ref="msg_input_ref"
                  autofocus
                  v-model="inputMsg"
                  :disabled="!isSign || isSending"
                  :placeholder="isSign ? (isSending ? '消息发送中' : '来聊点什么吧~') : ''"
                  @keydown.enter.prevent.exact
                  @keydown.enter.exact="sendMsgHandler"
                  @keydown.shift.enter.exact="onWrap"
                  @keydown.ctrl.enter.exact="onWrap"
                  @keydown.meta.enter.exact="onWrap"
                />
                <div class="chat-not-login-mask" :hidden="isSign">
                  <ElIcon class="icon-lock"><IEpLock /></ElIcon>
                  <a class="login-link" @click="onShowLoginBoxHandler">点我登录</a>之后再发言~
                </div>
              </div>
              <el-popover
                placement="top-end"
                effect="dark"
                title=""
                :width="client === 'PC' ? 418 : '95%'"
                trigger="click"
              >
                <template #reference>
                  <button class="emoji-button">😊</button>
                </template>
                <ul class="emoji-list">
                  <li
                    class="emoji-item"
                    v-for="(emoji, $index) of emojis"
                    :key="$index"
                    v-login="() => insertText(emoji)"
                  >
                    {{ emoji }}
                  </li>
                </ul>
              </el-popover>
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
