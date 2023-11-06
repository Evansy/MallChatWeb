<script setup lang="ts" name="SendBar">
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref } from 'vue'
import type { ElInput } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useWsLoginStore } from '@/stores/ws'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { useGlobalStore } from '@/stores/global'
import { useGroupStore } from '@/stores/group'
import { useUserInfo } from '@/hooks/useCached'
import MsgInput from '../MsgInput/index.vue'
import { insertInputText } from '../MsgInput/utils'
import apis from '@/services/apis'
import { judgeClient } from '@/utils/detectDevice'
import { emojis } from '../constant'
import { useEmojiStore } from '@/stores/emoji'
import { MsgEnum, RoleEnum } from '@/enums'

import type { IMention } from '../MsgInput/types'
import { useFileDialog } from '@vueuse/core'
import { useUpload } from '@/hooks/useUpload'
import { useEmojiUpload } from '@/hooks/useEmojiUpload'
import { useRecording } from '@/hooks/useRecording'
import { useMockMessage } from '@/hooks/useMockMessage'
import { generateBody } from '@/utils'
import renderReplyContent from '@/utils/renderReplyContent'
import eventBus from '@/utils/eventBus'
import throttle from 'lodash/throttle'

const client = judgeClient()

const chatStore = useChatStore()
const globalStore = useGlobalStore()
const isSending = ref(false)
const inputMsg = ref('')
const mentionRef = ref<typeof ElInput>()
const mentionList = ref<IMention[]>([])
const isAudio = ref(false)
const isHovered = ref(false)
const tempMessageId = ref(0)
const showEmoji = ref(false)
const nowMsgType = ref<MsgEnum>(MsgEnum.FILE)
const panelIndex = ref(0)
const isUpEmoji = ref(false)
const tempEmojiId = ref(-1)

const focusMsgInput = () => {
  setTimeout(() => {
    if (!mentionRef.value) return
    mentionRef.value?.focus?.()
    const selection = mentionRef.value?.range?.selection as Selection
    selection?.selectAllChildren(mentionRef.value.input)
    selection?.collapseToEnd()
  })
}
// 艾特
const onSelectPerson = ({ uid, ignoreCheck }: { uid: number; ignoreCheck?: boolean }) => {
  mentionRef.value?.onSelectPerson?.(uid, ignoreCheck)
  isAudio.value = false
}

onMounted(() => {
  eventBus.on('onSelectPerson', onSelectPerson)
  eventBus.on('focusMsgInput', focusMsgInput)
})
onBeforeUnmount(() => {
  eventBus.off('onSelectPerson', onSelectPerson)
  eventBus.off('focusMsgInput', focusMsgInput)
})

// 发送消息
const send = (msgType: MsgEnum, body: any) => {
  apis
    .sendMsg({ roomId: globalStore.currentSession.roomId, msgType, body })
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

      // 发完消息就要刷新会话列表，
      //  FIXME 如果当前会话已经置顶了，可以不用刷新
      chatStore.updateSessionLastActiveTime(globalStore.currentSession.roomId)
    })
    .finally(() => {
      isSending.value = false
      focusMsgInput() // 输入框重新获取焦点
      chatStore.chatListToBottomAction?.() // 滚动到消息列表底部
    })
}

const sendMsgHandler = () => {
  // 空消息或正在发送时禁止发送
  if (!inputMsg.value?.trim().length || isSending.value) {
    return
  }

  isSending.value = true
  send(MsgEnum.TEXT, {
    content: inputMsg.value,
    replyMsgId: currentMsgReply.value.message?.id,
    atUidList: mentionList.value.map((item) => item.uid),
  })
}

const loginStore = useWsLoginStore() // 显示登录框
const userStore = useUserStore() // 是否已登录
const emojiStore = useEmojiStore()
const groupStore = useGroupStore()
const isSign = computed(() => userStore.isSign)
const currentMsgReply = computed(() => (userStore.isSign && chatStore.currentMsgReply) || {})
const currentReplUid = computed(() => currentMsgReply?.value.fromUser?.uid as number)
const currentReplyUser = useUserInfo(currentReplUid)
const emojiList = computed(() => emojiStore.emojiList)

// 是否被提出群聊
const isRemoved = computed(() => groupStore.countInfo.role === RoleEnum.REMOVED)

// 计算展示的回复消息的内容
const showReplyContent = () => {
  const name = currentReplyUser?.value.name
  const type = currentMsgReply?.value.message?.type
  return renderReplyContent(name, type, currentMsgReply?.value.message?.body?.content)
}

// 置空回复的消息
const onClearReply = () => (chatStore.currentMsgReply = {})
// 插入表情
const insertEmoji = (emoji: string) => {
  const input = mentionRef.value?.input
  const editRange = mentionRef.value?.range as {
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
const { uploadEmoji, isEmojiUp } = useEmojiUpload()
const { isRecording, start, stop, onEnd, second } = useRecording()
const { mockMessage } = useMockMessage()

const openFileSelect = (fileType: string, isEmoji = false) => {
  if (fileType === 'img') {
    nowMsgType.value = MsgEnum.IMAGE
    options.accept = '.jpg,.png,.gif,.jpeg,.webp'
  }
  if (fileType === 'file') {
    nowMsgType.value = MsgEnum.FILE
    options.accept = '*' // 任意文件
  }
  isUpEmoji.value = isEmoji
  open()
}

const selectAndUploadFile = async (files?: FileList | null) => {
  if (!files?.length) return
  const file = files[0]
  if (nowMsgType.value === MsgEnum.IMAGE) {
    if (!file.type.includes('image')) {
      return ElMessage.error('请选择图片文件')
    }
  }
  if (isUpEmoji.value) {
    await uploadEmoji(file)
  } else {
    await uploadFile(file)
  }
}

// 选中文件上传并发送消息
provide('onChangeFile', selectAndUploadFile)
// 设置消息类型
provide('onChangeMsgType', (msgType: MsgEnum) => {
  nowMsgType.value = msgType
})

onChange(selectAndUploadFile)

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

const handleRightClick = (event: Event, id: number) => {
  event.preventDefault()
  tempEmojiId.value = tempEmojiId.value === id ? -1 : id
}

const sendEmoji = throttle((url: string) => {
  send(MsgEnum.EMOJI, { url })
  showEmoji.value = false
}, 1000)
</script>

<template>
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
        ref="mentionRef"
        autofocus
        :tabindex="!isSign || isSending"
        :disabled="!isSign || isSending"
        :placeholder="isSign ? (isSending ? '消息发送中' : '来聊点什么吧~') : ''"
        :mentions="mentionList"
        @change="onInputChange"
        @send="sendMsgHandler"
      />
      <el-popover
        placement="top"
        effect="dark"
        title=""
        v-model:visible="showEmoji"
        popper-class="emoji-warpper"
        :show-arrow="false"
        :width="client === 'PC' ? 385 : '95%'"
        trigger="click"
      >
        <template #reference>
          <div class="action" @mouseover="isHovered = true" @mouseleave="isHovered = false">
            <Icon v-if="isHovered" icon="shocked" :size="18" colorful />
            <Icon v-else icon="happy1" :size="18" colorful />
          </div>
        </template>
        <div class="emoji-panel">
          <div v-show="panelIndex === 0" class="emoji-panel-content">
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
          </div>
          <div v-show="panelIndex === 1" class="emoji-panel-content">
            <div
              v-for="emoji in emojiList"
              :key="emoji.id"
              class="item"
              @click="sendEmoji(emoji.expressionUrl)"
              @contextmenu="handleRightClick($event, emoji.id)"
            >
              <img :src="emoji.expressionUrl" />
              <Icon
                v-if="emoji.id === tempEmojiId"
                icon="guanbi1"
                class="del"
                @click.stop="emojiStore.deleteEmoji(emoji.id)"
              />
            </div>
            <Icon
              v-if="emojiList.length < 50 && !isEmojiUp"
              class="cursor-pointer item-add"
              icon="tianjia"
              :size="30"
              @click="openFileSelect('img', true)"
            />
            <div v-else class="item-add">
              <Icon icon="loading" spin :size="30" />
            </div>
          </div>
          <div class="footer">
            <Icon
              :class="['cursor-pointer', 'footer-act', { active: panelIndex === 0 }]"
              icon="biaoqing"
              :size="18"
              @click="panelIndex = 0"
            />
            <Icon
              :class="['cursor-pointer', 'footer-act', { active: panelIndex === 1 }]"
              icon="aixin"
              :size="18"
              @click="panelIndex = 1"
            />
          </div>
        </div>
      </el-popover>
      <Icon
        class="action"
        icon="at"
        :size="20"
        colorful
        @click="insertInputText({ content: '@', ...mentionRef?.range })"
      />
      <Icon
        :class="['action', { disabled: isUploading }]"
        icon="tupian"
        :size="18"
        colorful
        @click="openFileSelect('img')"
      />
      <Icon class="action" icon="wenjianjia2" :size="20" colorful @click="openFileSelect('file')" />
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
    <span v-if="isSign && isRemoved" class="tips"> 您已被踢出群聊，无法再发送消息 </span>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />

<style lang="scss">
.emoji-warpper {
  padding: 4px !important;
  padding-top: 8px !important;
  color: var(--font-main) !important;
  background-color: var(--background-wrapper) !important;
  border: none !important;
}
</style>
