import { ref } from 'vue'
import { defineStore } from 'pinia'
import apis from '@/services/apis'
import { useRequest } from 'alova'
import type { MessageItemType } from '@/services/types'

export const pageSize = 20

export const useChatStore = defineStore('chat', () => {
  const chatMessageList = ref<MessageItemType[]>([])
  const chatListToBottomAction = ref<() => void>()
  const isLast = ref(false)
  const loading = ref(true)
  const cursor = ref()

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

    // 聊天列表滚动到底部
    setTimeout(() => {
      chatListToBottomAction.value?.()
    }, 0)
  }

  const loadMore = async () => {
    if (isLast.value) return
    await send(cursor.value)
  }

  return { chatMessageList, pushMsg, chatListToBottomAction, loading, isLast, loadMore }
})
