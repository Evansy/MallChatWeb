import type { MessageType } from '@/services/types'
import { computed } from 'vue'
import { useGlobalStore } from '@/stores/global'

/**
 * Mock 消息 Hook
 */
export const useMockMessage = () => {
  const globalStore = useGlobalStore()
  // 获取本地存储的用户信息
  const userInfo = computed(() => JSON.parse(localStorage.getItem('USER_INFO') || '{}'))
  const currentRoomId = computed(() => globalStore.currentSession.roomId)

  /**
   * 模拟消息生成
   * @param type 消息类型
   * @param body 消息体
   * @param messageMark 互动信息
   * @returns 服务器格式消息
   */
  const mockMessage = (type: number, body: any, messageMark?: any): MessageType => {
    const currentTimeStamp: number = Date.now()
    const random: number = Math.floor(Math.random() * 15)
    // 唯一id 后五位时间戳+随机数
    const uniqueId: number = Number(String(currentTimeStamp).slice(-7) + random)
    const content = type === 1 ? body.content : null
    const { uid, name: username, avatar } = userInfo.value

    const data = {
      fromUser: {
        username,
        uid,
        avatar,
        locPlace: 'XX',
      },
      message: {
        id: uniqueId,
        roomId: currentRoomId.value,
        sendTime: Number(currentTimeStamp),
        content,
        urlContentMap: {},
        type: type,
        body,
        messageMark: {
          likeCount: 0,
          userLike: 0,
          dislikeCount: 0,
          userDislike: 0,
          ...messageMark,
        },
      },
      sendTime: String(currentTimeStamp),
      loading: true,
    }
    return data
  }

  return {
    mockMessage,
  }
}
