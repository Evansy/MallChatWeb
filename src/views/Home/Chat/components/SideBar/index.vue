<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useGlobalStore } from '@/stores/global'
import { IsAllUserEnum } from '@/services/types'
import { MsgEnum, RoomTypeEnum } from '@/enums'
import { useUserInfo } from '@/hooks/useCached'
import { formatTimestamp } from '@/utils/computedTime'
import renderReplyContent from '@/utils/renderReplyContent'

const chatStore = useChatStore()
const globalStore = useGlobalStore()

onBeforeMount(() => {
  // 请求回话列表
  chatStore.getSessionList()
})

// 选中的聊天对话
const currentSession = computed(() => globalStore.currentSession)

const sessionList = computed(() =>
  chatStore.sessionList.map((item) => {
    // 最后一条消息内容
    const lastMsg = Array.from(chatStore.messageMap.get(item.roomId)?.values() || [])?.slice(
      -1,
    )?.[0]
    let LastUserMsg = ''
    if (lastMsg) {
      const lastMsgUserName = useUserInfo(lastMsg.fromUser.uid)
      LastUserMsg =
        lastMsg.message?.type === MsgEnum.RECALL
          ? `${lastMsgUserName.value.name}:'撤回了一条消息'`
          : renderReplyContent(
              lastMsgUserName.value.name,
              lastMsg.message?.type,
              lastMsg.message?.body?.content || lastMsg.message?.body,
            )
    }
    return {
      ...item,
      tag: item.hot_Flag === IsAllUserEnum.Yes ? '官方' : '',
      lastMsg: LastUserMsg || item.text || '欢迎使用MallChat',
      lastMsgTime: formatTimestamp(item?.activeTime),
    }
  }),
)
// 选中会话
const onSelectSelectSession = (roomId: number, roomType: RoomTypeEnum) => {
  globalStore.currentSession.roomId = roomId
  globalStore.currentSession.type = roomType
}

// 加载更多
const load = () => {
  chatStore.getSessionList()
}
</script>

<template>
  <ul class="chat-message" v-infinite-scroll="load" :infinite-scroll-immediate="false">
    <li
      v-for="(item, index) in sessionList"
      :key="index"
      :data-room-id="item.roomId"
      :class="['chat-message-item', { active: currentSession.roomId === item.roomId }]"
      @click="onSelectSelectSession(item.roomId, item.type)"
    >
      <div class="item-wrapper">
        <el-badge :value="item.unreadCount" :max="999" :hidden="item.unreadCount < 1" class="item">
          <el-avatar shape="circle" :size="38" :src="item.avatar" />
        </el-badge>
        <div class="message-info">
          <div style="white-space: nowrap">
            <span class="person">{{ item.name }}</span>
            <span v-if="item.tag" class="tag">{{ item.tag }}</span>
          </div>
          <div class="message-message">{{ item.lastMsg }}</div>
        </div>
        <span class="message-time">{{ item.lastMsgTime }}</span>
      </div>
    </li>
  </ul>
</template>

<style lang="scss" src="./styles.scss" scoped />
