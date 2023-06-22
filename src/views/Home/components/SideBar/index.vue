<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useUserInfo } from '@/hooks/useCached'
import { formatTimestamp } from '@/utils/computedTime'
import mallChatLogo from '@/assets/logo.jpeg'

// 选中的聊天对话
const activeChat = ref(1)
const chatStore = useChatStore()

// 计算最后一条消息
const lastMassage = computed(
  () => chatStore.chatMessageList?.[chatStore.chatMessageList?.length - 1],
)
const lastUid = computed(() => lastMassage.value?.fromUser.uid)
const lastUserInfo = useUserInfo(lastUid)

// mock数据等后端接口完成后变动0
const mockData = computed(() => {
  const message = lastMassage.value?.message
  return [
    {
      id: 1,
      msgName: 'MallChat 用户群',
      name: lastUserInfo.value.name,
      avatar: mallChatLogo,
      tag: '官方',
      lastMsg: message.type === 2 ? '撤回了一条消息' : message.body?.content || '欢迎使用MallChat',
      lastMsgTime: formatTimestamp(message?.sendTime),
    },
    {
      id: 2,
      msgName: '通知',
      name: '机器人',
      avatar: mallChatLogo,
      tag: '机器人',
      lastMsg: '欢迎使用MallChat',
      lastMsgTime: '13:54',
    },
  ]
})
</script>

<template>
  <div class="chat-message">
    <div
      v-for="(item, index) in mockData"
      :key="index"
      :class="['chat-message-item ', { active: activeChat === item.id }]"
      @click="activeChat = item.id"
    >
      <el-avatar shape="circle" :size="38" :src="item.avatar" />
      <div class="message-info">
        <div style="white-space: nowrap">
          <span class="person">{{ item.msgName }}</span>
          <span v-if="item.tag" class="tag">{{ item.tag }}</span>
        </div>
        <div class="message-message">{{ (item.name || '') + '：' + item.lastMsg }}</div>
      </div>
      <span class="message-time">{{ item.lastMsgTime }}</span>
    </div>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
