import { defineStore } from 'pinia'
import { ref, reactive, watch } from 'vue'
import { RoomTypeEnum } from '@/services/types'
import type { ContactItem, RequestFriendItem } from '@/services/types'
import { clearQueue } from '@/utils/readCountQueue'
import apis from '@/services/apis'

export const useGlobalStore = defineStore('global', () => {
  const currentReadUnreadList = reactive<{ show: boolean; msgId: number | null }>({
    show: false,
    msgId: null,
  })
  const currentSession = reactive<{ roomId: number; type: RoomTypeEnum }>({
    roomId: 1,
    type: RoomTypeEnum.Group,
  })
  /** 点击联系人选中的联系人项 */
  const currentSelectedContact = ref<ContactItem | RequestFriendItem>()
  const addFriendModalInfo = reactive<{ show: boolean; uid?: number }>({
    show: false,
    uid: undefined,
  })
  // 创建群聊
  const createGroupModalInfo = reactive<{ show: boolean }>({ show: false })

  // 初始化标记房间最新消息已读
  apis.markMsgRead({ roomId: currentSession.roomId }).send()

  // 切换会话的时候重置消息已读数查询
  watch(currentSession, (val) => {
    // 清理已读数查询
    clearQueue()
    // 标记房间最新消息已读
    apis.markMsgRead({ roomId: val.roomId }).send()
  })

  return {
    currentSession,
    addFriendModalInfo,
    currentSelectedContact,
    currentReadUnreadList,
    createGroupModalInfo,
  }
})
