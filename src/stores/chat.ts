import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import apis from '@/services/apis'
import type { MessageItemType, MarkItemType } from '@/services/types'
import { MarkType } from '@/services/types'
import { computedTimeBlock } from '@/utils/computedTime'
import shakeTitle from '@/utils/shakeTitle'

export const pageSize = 20

export const useChatStore = defineStore('chat', () => {
  // 消息列表
  const chatListToBottomAction = ref<() => void>() // 外部提供消息列表滚动到底部事件
  const chatMessageList = ref<MessageItemType[]>([])
  const isLast = ref(false) // 是否到底了
  const isLoading = ref(false) // 是否正在加载
  const isStartCount = ref(false) // 是否开始计数
  const cursor = ref()

  // 新消息计数
  const newMsgCount = ref(0)

  // 当前消息回复
  const currentMsgReply = reactive<Partial<MessageItemType>>({})

  const getMsgList = async (size = pageSize) => {
    isLoading.value = true
    const data = await apis.getMsgList({ params: { pageSize: size, cursor: cursor.value, roomId: 1 } }).send()
    if (!data) return
    chatMessageList.value = [...computedTimeBlock(data.list), ...chatMessageList.value]
    cursor.value = data.cursor
    isLast.value = data.isLast
    isLoading.value = false
  }

  // 默认执行一次
  getMsgList()

  const pushMsg = (msg: MessageItemType) => {
    chatMessageList.value.push(
      ...computedTimeBlock([chatMessageList.value[chatMessageList.value.length - 1], msg], false),
    )

    // tab 在后台获得新消息，就开始闪烁！
    if (document.hidden && !shakeTitle.isShaking) {
      shakeTitle.start()
    }

    if (isStartCount.value) {
      newMsgCount.value++
      return
    }
    // 聊天列表滚动到底部
    setTimeout(() => {
      // 如果超过一屏了，不自动滚动到最新消息。
      chatListToBottomAction.value?.()
    }, 0)
  }

  // 过滤掉小黑子的发言
  const filterUser = (uid: number) => {
    if (typeof uid !== 'number') return
    chatMessageList.value = chatMessageList.value.filter((item) => item.fromUser.uid !== uid)
  }

  const loadMore = async (size?: number) => {
    if (isLast.value && isLoading.value) return
    await getMsgList(size)
  }

  const clearNewMsgCount = () => {
    newMsgCount.value = 0
  }

  // 查找消息在列表里面的索引，倒过来的索引
  const getMsgIndex = (msgId: number) => {
    if (!msgId || isNaN(Number(msgId))) return -1
    return chatMessageList.value.findIndex((item) => item.message.id === msgId)
  }

  // 更新点赞、举报数
  const updateMarkCount = (markList: MarkItemType[]) => {
    // 循环更新点赞数
    console.log('点赞、倒赞消息通知更新', markList)
    markList.forEach((mark: MarkItemType) => {
      const { msgId, markType, markCount } = mark

      const msgItem = chatMessageList.value.find((item) => item.message.id === msgId)
      if (msgItem) {
        if (markType === MarkType.Like) {
          msgItem.message.messageMark.likeCount = markCount
        } else if (markType === MarkType.DisLike) {
          msgItem.message.messageMark.dislikeCount = markCount
        }
      }
    })
  }

  return {
    getMsgIndex,
    chatMessageList,
    pushMsg,
    clearNewMsgCount,
    updateMarkCount,
    chatListToBottomAction,
    newMsgCount,
    isLoading,
    isStartCount,
    isLast,
    loadMore,
    currentMsgReply,
    filterUser,
  }
})
