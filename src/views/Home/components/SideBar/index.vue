<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { formatTimestamp } from '@/utils/computedTime'
import mallChatLogo from '@/assets/logo.jpeg'

// 选中的聊天对话
const activeChat = ref(1)
const chatStore = useChatStore()

// 计算最后一条消息
const lastMassage = computed(() => {
  return chatStore.chatMessageList?.[chatStore.chatMessageList?.length - 1]
})

// mock数据等后端接口完成后变动
const mockData = ref([
  {
    id: 1,
    msgName: 'MallChat 用户群',
    name: lastMassage.value?.fromUser?.username,
    avatar: mallChatLogo,
    tag: '官方',
    lastMsg: lastMassage.value?.message?.content || '欢迎使用MallChat',
    lastMsgTime: formatTimestamp(lastMassage.value?.message?.sendTime),
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
])

// 最后一条消息变化就把MoakData更新
watch(lastMassage, (newVal) => {
  mockData.value[0].name = newVal?.fromUser?.username
  mockData.value[0].lastMsg = newVal?.message?.content
  mockData.value[0].lastMsgTime = formatTimestamp(newVal?.message?.sendTime)
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
        <div class="message-message">{{ item.name + '：' + item.lastMsg }}</div>
      </div>
      <span class="message-time">{{ item.lastMsgTime }}</span>
    </div>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
