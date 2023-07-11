import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import apis from '@/services/apis'
import type { MessageType, MarkItemType, RevokedMsgType, CacheUserReq } from '@/services/types'
import { MarkEnum } from '@/enums'
import { computedTimeBlock } from '@/utils/computedTime'
import { useCachedStore } from '@/stores/cached'
import { useUserStore } from '@/stores/user'
import shakeTitle from '@/utils/shakeTitle'
import notify from '@/utils/notification'
import { MsgEnum, PowerEnum } from '@/enums'

export const pageSize = 20

export const useChatStore = defineStore('chat', () => {
  const cachedStore = useCachedStore()
  const userStore = useUserStore()
  const messageMap = reactive<Map<number, MessageType>>(new Map<number, MessageType>()) // 消息Map
  const replyMapping = reactive<Map<number, number[]>>(new Map<number, number[]>()) // 回复消息映射
  const userInfo = userStore.userInfo
  const isAdmin = computed(() => userInfo?.power === PowerEnum.ADMIN)

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
      .getMsgList({ params: { pageSize: size, cursor: cursor.value, roomId: 1 } })
      .send()
      .catch(() => {
        isLoading.value = false
      })
    if (!data) return
    const computedList = computedTimeBlock(data.list)

    /** 收集需要请求用户详情的 uid */
    const uidCollectYet: Set<number> = new Set() // 去重用
    const uidCollects: CacheUserReq[] = []
    const collectUidItem = (uid: number) => {
      // 去重 uid
      if (uidCollectYet.has(uid)) return
      // 尝试取缓存user, 如果有 lastModifyTime 说明缓存过了，没有就一定是要缓存的用户了
      const cacheUser = cachedStore.userCachedList[uid]
      uidCollects.push({ uid, lastModifyTime: cacheUser?.lastModifyTime })
      // 添加收集过的 uid
      uidCollectYet.add(uid)
    }
    computedList.forEach((msg) => {
      const replyItem = msg.message.body?.reply
      if (replyItem?.id) {
        const messageIds = replyMapping.get(replyItem.id) || []
        messageIds.push(msg.message.id)
        replyMapping.set(replyItem.id, messageIds)

        // 查询被回复用户的信息，被回复的用户信息里暂时无 uid
        // collectUidItem(replyItem.uid)
      }
      // 查询消息发送者的信息
      collectUidItem(msg.fromUser.uid)
    })
    // 获取用户信息缓存
    cachedStore.getBatchUserInfo(uidCollects)
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

    // 获取用户信息缓存
    // 尝试取缓存user, 如果有 lastModifyTime 说明缓存过了，没有就一定是要缓存的用户了
    const uid = msg.fromUser.uid
    const cacheUser = cachedStore.userCachedList[uid]
    cachedStore.getBatchUserInfo([{ uid, lastModifyTime: cacheUser?.lastModifyTime }])

    // 如果收到的消息里面是艾特自己的就发送系统通知
    if (msg.message.body.atUidList?.includes(userStore.userInfo.uid) && cacheUser) {
      notify({
        name: cacheUser.name as string,
        text: msg.message.body.content,
        icon: cacheUser.avatar as string,
      })
    }

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
        if (markType === MarkEnum.LIKE) {
          msgItem.message.messageMark.likeCount = markCount
        } else if (markType === MarkEnum.DISLIKE) {
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
      message.message.type = MsgEnum.RECALL

      // 如果消息是被管理员撤回，需要显示 管理员 xx 撤回了一条成员消息
      if (isAdmin.value) {
        message.message.body = `管理员"${userInfo.name}"撤回了一条成员消息` // 后期根据本地用户数据修改
      } else {
        // 如果被撤回的消息是消息发送者撤回，正常显示
        const uid = message.fromUser.uid
        const cacheUser = cachedStore.userCachedList[uid]
        message.message.body = `"${cacheUser.name}"撤回了一条消息` // 后期根据本地用户数据修改
      }
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
  // 更新消息
  const updateMsg = (msgId: number, newMessage: MessageType) => {
    deleteMsg(msgId)
    pushMsg(newMessage)
  }

  return {
    getMsgIndex,
    chatMessageList,
    pushMsg,
    deleteMsg,
    clearNewMsgCount,
    updateMarkCount,
    updateRecallStatus,
    updateMsg,
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
