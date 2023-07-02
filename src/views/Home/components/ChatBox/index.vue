<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import type { ElInput } from 'element-plus'
import { useWsLoginStore } from '@/stores/ws'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { useUserInfo } from '@/hooks/useCached'
import MsgInput from './MsgInput/index.vue'
import { insertInputText } from './MsgInput/utils'
import apis from '@/services/apis'
import { judgeClient } from '@/utils/detectDevice'
import { emojis } from './constant'

import type { IMention } from './MsgInput/types'

const client = judgeClient()

import UserList from '../UserList/index.vue'
import ChatList from '../ChatList/index.vue'

const chatStore = useChatStore()
const isSelect = ref(false)
const isSending = ref(false)
const inputMsg = ref('')
const msg_input_ref = ref<typeof ElInput>()

const mentionList = ref<IMention[]>([])
const showEmoji = ref(false)

const focusMsgInput = () => {
  setTimeout(() => {
    if (!msg_input_ref.value) return
    msg_input_ref.value?.focus?.()

    const selection = msg_input_ref.value?.range?.selection as Selection
    selection?.selectAllChildren(msg_input_ref.value.input)
    selection?.collapseToEnd()
  }, 10)
}

provide('focusMsgInput', focusMsgInput)

const sendMsgHandler = (e: Event) => {
  // 处理输入法状态下的回车事件
  if ((e as KeyboardEvent).isComposing) {
    return e.preventDefault()
  }
  // 空消息或正在发送时禁止发送
  if (!inputMsg.value?.trim().length || isSending.value) {
    return
  }

  // 构造消息体
  const messageBody = {
    content: inputMsg.value,
    replyMsgId: currentMsgReply.value.message?.id,
    atUidList: mentionList.value.map((item) => item.uid),
  }

  isSending.value = true
  // 发送消息
  apis
    .sendMsg({ roomId: 1, msgType: 1, body: messageBody })
    .send()
    .then((res) => {
      chatStore.pushMsg(res) // 消息列表新增一条消息
      inputMsg.value = '' // 清空输入列表
      onClearReply() // 置空回复的消息
    })
    .finally(() => {
      isSending.value = false
      focusMsgInput() // 输入框重新获取焦点
      chatStore.chatListToBottomAction?.() // 滚动到消息列表底部
    })
}

// 显示登录框
const loginStore = useWsLoginStore()
const onShowLoginBoxHandler = () => (loginStore.showLogin = true)

// 是否已登录
const userStore = useUserStore()
const isSign = computed(() => userStore.isSign)
const currentMsgReply = computed(() => (userStore.isSign && chatStore.currentMsgReply) || {})
const currentReplUid = computed(() => currentMsgReply?.value.fromUser?.uid as number)
const currentReplyUser = useUserInfo(currentReplUid)

// 置空回复的消息
const onClearReply = () => (chatStore.currentMsgReply = {})

// 插入内容
const insertEmoji = (emoji: string) => {
  const input = msg_input_ref.value?.input
  const editRange = msg_input_ref.value?.range as {
    range: Range
    selection: Selection
  }
  if (!input || !editRange) return
  insertInputText({ content: emoji, ...editRange })
  // 需要更新以触发 onChang
  inputMsg.value = input.innerText
  // 关闭表情弹窗，一次只选一个表情
  showEmoji.value = false
  // 临时让获取焦点
  focusMsgInput()
}

const onInputChange = (val: string, mentions: IMention[]) => {
  mentionList.value = mentions
}
</script>

<template>
  <div class="chat-box">
    <div class="chat-wrapper">
      <template v-if="isSelect">
        <ElIcon :size="160" color="var(--font-light)"><IEpChatDotRound /></ElIcon>
      </template>
      <template v-else>
        <div class="chat">
          <ChatList @start-replying="focusMsgInput" />
          <div class="chat-msg-send">
            <div v-if="Object.keys(currentMsgReply).length" class="reply-msg-wrapper">
              <span>
                {{ currentReplyUser?.name }}: {{ currentMsgReply.message?.body.content }}</span
              >
              <el-icon class="reply-msg-icon" :size="14" @click="onClearReply">
                <IEpClose />
              </el-icon>
            </div>
            <div class="msg-input-box">
              <div class="msg-input-wrapper">
                <!-- @keydown.enter.prevent 阻止 textarea 默认换行事件 -->
                <MsgInput
                  ref="msg_input_ref"
                  autofocus
                  :tabindex="!isSign || isSending"
                  :disabled="!isSign || isSending"
                  v-model="inputMsg"
                  :placeholder="isSign ? (isSending ? '消息发送中' : '来聊点什么吧~') : ''"
                  :mentions="mentionList"
                  @change="onInputChange"
                  @send="sendMsgHandler"
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
                v-model:visible="showEmoji"
                :width="client === 'PC' ? 418 : '95%'"
                trigger="click"
              >
                <template #reference>
                  <button class="emoji-button" :disabled="!isSign">😊</button>
                </template>
                <ul class="emoji-list">
                  <li
                    class="emoji-item"
                    v-for="(emoji, $index) of emojis"
                    :key="$index"
                    v-login="() => insertEmoji(emoji)"
                  >
                    {{ emoji }}
                  </li>
                </ul>
              </el-popover>
              <button class="send-button" :disabled="!inputMsg.length" @click="sendMsgHandler"
                >🚀</button
              >
            </div>
          </div>
        </div>
      </template>
    </div>
    <UserList />
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
