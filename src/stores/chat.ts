import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import apis from '@/services/apis'
import { useRequest } from 'alova'
import type { MessageItemType } from '@/services/types'

export const pageSize = 20

export const useChatStore = defineStore('chat', () => {
  // 消息列表滚动到底部事件
  const chatListToBottomAction = ref<() => void>()

  // 消息列表
  const chatMessageList = ref<MessageItemType[]>([])
  const isLast = ref(false)
  const loading = ref(true)
  const cursor = ref()

  // 离最新消息是否滚动超过一屏
  const isScrollAboveOneScreen = ref(false)

  // 新消息计数
  const newMsgCount = ref(0)

  const getList = (cursor?: string) => apis.getMsgList({ params: { pageSize, cursor, roomId: 1 } })
  const { send, onSuccess } = useRequest(getList, { immediate: true })

  onSuccess(({ data }) => {
    chatMessageList.value = [...data.list, ...chatMessageList.value]
    cursor.value = data.cursor
    isLast.value = data.isLast
    loading.value = false
  })

  const pushMsg = (msg: MessageItemType) => {
    chatMessageList.value.push(msg)

    if (isScrollAboveOneScreen.value) {
      newMsgCount.value++
      return
    }

    // 聊天列表滚动到底部
    setTimeout(() => {
      // 如果超过一屏了，不自动滚动到最新消息。
      chatListToBottomAction.value?.()
    }, 0)
  }

  const loadMore = async () => {
    if (isLast.value) return
    await send(cursor.value)
  }

  // 如果滚动超过一屏了，来了新消息要计数标识，滚动到一屏内的时候，清空计数
  watch(isScrollAboveOneScreen, (val) => {
    if (!val) {
      newMsgCount.value = 0
    }
  })

  return {
    chatMessageList,
    pushMsg,
    chatListToBottomAction,
    isScrollAboveOneScreen,
    newMsgCount,
    loading,
    isLast,
    loadMore,
  }
})
