<script setup lang="ts">
import { ref, computed, reactive, provide } from 'vue'
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
import { useFileDialog } from '@vueuse/core'
import { useUpload } from '@/hooks/useUpload'
import { useRecording } from '@/hooks/useRecording'
import { MsgEnum } from '@/enums'
import { useMockMessage } from '@/hooks/useMockMessage'
import { generateBody } from '@/utils'
import { ElMessage } from 'element-plus'

const client = judgeClient()

import UserList from '../UserList/index.vue'
import ChatList from '../ChatList/index.vue'

const chatStore = useChatStore()
const isSelect = ref(false)
const isSending = ref(false)
const inputMsg = ref('')
const msg_input_ref = ref<typeof ElInput>()
const mentionList = ref<IMention[]>([])
const isAudio = ref(false)
const isHovered = ref(false)
const tempMessageId = ref(0)
const showEmoji = ref(false)
const nowMsgType = ref<MsgEnum>(MsgEnum.FILE)

const focusMsgInput = () => {
  setTimeout(() => {
    if (!msg_input_ref.value) return
    msg_input_ref.value?.focus?.()
    const selection = msg_input_ref.value?.range?.selection as Selection
    selection?.selectAllChildren(msg_input_ref.value.input)
    selection?.collapseToEnd()
  })
}

provide('focusMsgInput', focusMsgInput)

const send = (msgType: MsgEnum, body: any, roomId = 1) => {
  apis
    .sendMsg({ roomId, msgType, body })
    .send()
    .then((res) => {
      if (res.message.type === MsgEnum.TEXT) {
        chatStore.pushMsg(res) // 消息列表新增一条消息
      } else {
        // 更新上传状态下的消息
        chatStore.updateMsg(tempMessageId.value, res)
      }
      inputMsg.value = '' // 清空输入列表
      onClearReply() // 置空回复的消息
    })
    .finally(() => {
      isSending.value = false
      focusMsgInput() // 输入框重新获取焦点
      chatStore.chatListToBottomAction?.() // 滚动到消息列表底部
    })
}

const sendMsgHandler = (e: Event) => {
  // 处理输入法状态下的回车事件
  if ((e as KeyboardEvent).isComposing) {
    return e.preventDefault()
  }
  // 空消息或正在发送时禁止发送
  if (!inputMsg.value?.trim().length || isSending.value) {
    return
  }

  isSending.value = true
  send(1, {
    content: inputMsg.value,
    replyMsgId: currentMsgReply.value.message?.id,
    atUidList: mentionList.value.map((item) => item.uid),
  })
}

const loginStore = useWsLoginStore() // 显示登录框
const userStore = useUserStore() // 是否已登录
const isSign = computed(() => userStore.isSign)
const currentMsgReply = computed(() => (userStore.isSign && chatStore.currentMsgReply) || {})
const currentReplUid = computed(() => currentMsgReply?.value.fromUser?.uid as number)
const currentReplyUser = useUserInfo(currentReplUid)

// 计算展示的回复消息的内容
const showReplyContent = () => {
  const name = currentReplyUser?.value.name
  const type = currentMsgReply?.value.message?.type
  if (type === MsgEnum.TEXT) {
    return `${name}: ${currentMsgReply?.value.message?.body?.content}`
  }
  if (type === MsgEnum.IMAGE) {
    return `${name}: [图片]`
  }
  if (type === MsgEnum.FILE) {
    return `${name}: [文件]`
  }
  if (type === MsgEnum.VOICE) {
    return `${name}: [语音]`
  }
  if (type === MsgEnum.VIDEO) {
    return `${name}: [视频]`
  }
  return ''
}

// 置空回复的消息
const onClearReply = () => (chatStore.currentMsgReply = {})
// 插入表情
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
const options = reactive({ multiple: false, accept: '.jpg,.png' })

const { open, reset, onChange } = useFileDialog(options)
const { isUploading, fileInfo, uploadFile, onStart, onChange: useUploadChange } = useUpload()
const { isRecording, start, stop, onEnd, second } = useRecording()
const { mockMessage } = useMockMessage()

const openFileSelect = (fileType: string) => {
  if (fileType === 'img') {
    nowMsgType.value = MsgEnum.IMAGE
    options.accept = '.jpg,.png,.gif,.jpeg,.webp'
  }
  if (fileType === 'file') {
    nowMsgType.value = MsgEnum.FILE
    options.accept = '*' // 任意文件
  }
  open()
}

onChange((files) => {
  if (!files?.length) return
  const file = files[0]
  if (nowMsgType.value === MsgEnum.IMAGE) {
    if (!file.type.includes('image')) {
      return ElMessage.error('请选择图片文件')
    }
  }
  uploadFile(file)
})

onStart(() => {
  if (!fileInfo.value) return

  // 如果文件是视频就把消息类型改为视频
  if (fileInfo.value.type.includes('video')) {
    nowMsgType.value = MsgEnum.VIDEO
  }

  const { type, body } = generateBody(fileInfo.value, nowMsgType.value, true)
  const res = mockMessage(type, body)
  tempMessageId.value = res.message.id // 记录下上传状态下的消息id
  chatStore.pushMsg(res) // 消息列表新增一条消息
  chatStore.chatListToBottomAction?.() // 滚动到消息列表底部
})

useUploadChange((status) => {
  if (status === 'success') {
    if (!fileInfo.value) return
    const { body, type } = generateBody(fileInfo.value, nowMsgType.value)
    send(type, body)
  }
  reset()
})

onEnd((audioFile: any) => uploadFile(audioFile))

const onStartRecord = () => {
  nowMsgType.value = MsgEnum.VOICE
  start()
}
</script>

<template>
  <div class="chat-box">
    <div class="chat-wrapper">
      <template v-if="isSelect">
        <ElIcon :size="160" color="var(--font-light)"><IEpChatDotRound /></ElIcon>
      </template>
      <div v-else class="chat">
        <ChatList />
        <div class="chat-edit">
          <div v-show="Object.keys(currentMsgReply).length" class="reply-msg-wrapper">
            <span> {{ showReplyContent() }} </span>
            <ElIcon class="reply-msg-icon" :size="14" @click="onClearReply">
              <IEpClose />
            </ElIcon>
          </div>
          <div class="msg-input">
            <div class="action" @click="isAudio = !isAudio">
              <Icon v-show="!isAudio" icon="voice" class="audio" />
              <Icon v-show="isAudio" icon="jianpan" />
            </div>
            <div
              v-show="isAudio"
              class="recorded"
              @mousedown="onStartRecord()"
              @mouseup="stop()"
              @touchstart.passive="onStartRecord()"
              @touchend.passive="stop()"
            >
              <div class="recorded-tips">{{ isRecording ? `录制中 ${second}s` : '按住说话' }}</div>
            </div>
            <MsgInput
              class="m-input"
              v-show="!isAudio"
              v-model="inputMsg"
              ref="msg_input_ref"
              autofocus
              :tabindex="!isSign || isSending"
              :disabled="!isSign || isSending"
              :placeholder="isSign ? (isSending ? '消息发送中' : '来聊点什么吧~') : ''"
              :mentions="mentionList"
              @change="onInputChange"
              @send="sendMsgHandler"
            />
            <el-popover
              placement="top-end"
              effect="dark"
              title=""
              v-model:visible="showEmoji"
              :width="client === 'PC' ? 418 : '95%'"
              trigger="click"
            >
              <template #reference>
                <div class="action" @mouseover="isHovered = true" @mouseleave="isHovered = false">
                  <Icon v-if="isHovered" icon="shocked" :size="18" colorful />
                  <Icon v-else icon="happy1" :size="18" colorful />
                </div>
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
            <Icon class="action" icon="at" :size="20" colorful />
            <Icon
              :class="['action', { disabled: isUploading }]"
              icon="tupian"
              :size="18"
              colorful
              @click="openFileSelect('img')"
            />
            <Icon
              class="action"
              icon="wenjianjia2"
              :size="20"
              colorful
              @click="openFileSelect('file')"
            />
            <div class="divider" />
            <div
              :class="['action', { 'is-edit': inputMsg.length, 'disabled': !inputMsg.length }]"
              @click="sendMsgHandler"
            >
              <Icon class="send" icon="huojian" :size="20" />
            </div>
          </div>
          <span v-if="!isSign" class="tips" @click="loginStore.showLogin = true">
            <ElIcon class="icon-lock"><IEpLock /></ElIcon>
            点我<span class="tips-text">登录</span>之后再发言~
          </span>
        </div>
      </div>
    </div>
    <UserList />
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
