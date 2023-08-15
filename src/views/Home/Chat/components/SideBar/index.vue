<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { IsAllUserEnum } from '@/services/types'
import { formatTimestamp } from '@/utils/computedTime'

// 选中的聊天对话
const activeChat = ref(1)
const chatStore = useChatStore()

// mock数据等后端接口完成后变动0
const mockData = computed(() => {
  // const message = lastMassage.value?.message
  // {
  //   roomId: 1,
  //   name: 'MallChat 用户群',
  //   avatar: mallChatLogo,
  //   tag: '官方',
  //   // TODO 接收到艾特的时候，当前聊天没有被选中的时候，显示红色文本
  //   lastMsg:
  //     message?.type === 2
  //       ? '撤回了一条消息'
  //       : `${lastUserInfo?.value?.name}:` + message?.body?.content || '欢迎使用MallChat',
  //   lastMsgTime: formatTimestamp(message?.sendTime),
  // },
  return chatStore.sessionList.map((item) => ({
    roomId: item.roomId,
    name: item.name,
    tag: item.hot_Flag === IsAllUserEnum.Yes ? '官方' : '',
    avatar: item.avatar,
    lastMsg: item.text || '欢迎使用MallChat',
    lastMsgTime: formatTimestamp(item?.activeTime),
  }))
})
</script>

<template>
  <div class="chat-message">
    <div
      v-for="(item, index) in mockData"
      :key="index"
      :class="['chat-message-item ', { active: activeChat === item.roomId }]"
      @click="activeChat = item.roomId"
    >
      <el-avatar shape="circle" :size="38" :src="item.avatar" />
      <div class="message-info">
        <div style="white-space: nowrap">
          <span class="person">{{ item.name }}</span>
          <span v-if="item.tag" class="tag">{{ item.tag }}</span>
        </div>
        <div class="message-message">{{ item.lastMsg }}</div>
      </div>
      <span class="message-time">{{ item.lastMsgTime }}</span>
    </div>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
