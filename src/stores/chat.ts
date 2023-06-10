import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import apis from '@/services/apis'
import type { MessageType, MarkItemType, RevokedMsgType } from '@/services/types'
import { MarkType } from '@/services/types'
import { computedTimeBlock } from '@/utils/computedTime'
import shakeTitle from '@/utils/shakeTitle'

export const pageSize = 20

export const useChatStore = defineStore('chat', () => {
  const messageMap = reactive<Map<number, MessageType>>(new Map<number, MessageType>()) // 消息Map
  const replyMapping = reactive<Map<number, number[]>>(new Map<number, number[]>()) // 回复消息映射

  const chatListToBottomAction = ref<() => void>() // 外部提供消息列表滚动到底部事件
  const isLast = ref(false) // 是否到底了
  const isLoading = ref(false) // 是否正在加载
  const isStartCount = ref(false) // 是否开始计数
  const cursor = ref()
  const newMsgCount = ref(0) // 新消息计数

  // 当前消息回复
  const currentMsgReply = reactive<Partial<MessageType>>({})

  // 将消息列表转换为数组
  const chatMessageList = computed(() => Array.from(messageMap.values()))

  const getMsgList = async (size = pageSize) => {
    isLoading.value = true
    const data = await apis
      .getMsgList({
        params: { pageSize: size, cursor: cursor.value, roomId: 1 },
      })
      .send()
    if (!data) return
    const computedList = computedTimeBlock(data.list)
    computedList.forEach((msg) => {
      const replyId = msg.message.body?.reply?.id
      if (replyId) {
        const messageIds = replyMapping.get(replyId) || []
        messageIds.push(msg.message.id)
        replyMapping.set(replyId, messageIds)
      }
    })
    // 为保证获取的历史消息在前面
    const newList = [...computedList, ...chatMessageList.value]
    messageMap.clear() // 清空Map
    newList.forEach((msg) => {
      messageMap.set(msg.message.id, msg)
    })

    cursor.value = data.cursor
    isLast.value = data.isLast
    isLoading.value = false
  }

  // 默认执行一次
  getMsgList()

  const pushMsg = (msg: MessageType) => {
    messageMap.set(msg.message.id, msg)

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
    messageMap.forEach((msg) => {
      if (msg.fromUser.uid === uid) {
        messageMap.delete(msg.message.id)
      }
    })
  }

  const loadMore = async (size?: number) => {
    if (isLast.value && isLoading.value) return
    await getMsgList(size)
  }

  const clearNewMsgCount = () => {
    newMsgCount.value = 0
  }

  // 查找消息在列表里面的索引
  const getMsgIndex = (msgId: number) => {
    if (!msgId || isNaN(Number(msgId))) return -1
    const keys = Array.from(messageMap.keys())
    return keys.findIndex((key) => key === msgId)
  }

  // 更新点赞、举报数
  const updateMarkCount = (markList: MarkItemType[]) => {
    markList.forEach((mark: MarkItemType) => {
      const { msgId, markType, markCount } = mark

      const msgItem = messageMap.get(msgId)
      if (msgItem) {
        if (markType === MarkType.Like) {
          msgItem.message.messageMark.likeCount = markCount
        } else if (markType === MarkType.DisLike) {
          msgItem.message.messageMark.dislikeCount = markCount
        }
      }
    })
  }
  // 更新消息撤回状态
  const updateRecallStatus = (data: RevokedMsgType) => {
    const { msgId } = data
    const message = messageMap.get(msgId)
    if (message) {
      message.message.type = 2
      message.message.body = `撤回了一条消息` // 后期根据本地用户数据修改
    }
    // 更新与这条撤回消息有关的消息
    const messageList = replyMapping.get(msgId)
    messageList?.forEach((id) => {
      const msg = messageMap.get(id)
      if (msg) {
        msg.message.body.reply.body = `原消息已被撤回`
      }
    })
  }
  // 删除消息
  const deleteMsg = (msgId: number) => {
    messageMap.delete(msgId)
  }

  return {
    getMsgIndex,
    chatMessageList,
    pushMsg,
    deleteMsg,
    clearNewMsgCount,
    updateMarkCount,
    updateRecallStatus,
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
