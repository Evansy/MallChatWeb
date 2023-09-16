<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { useGlobalStore } from '@/stores/global'
import SideBar from './components/SideBar/index.vue'
import ChatBox from './components/ChatBox/index.vue'

const chatStore = useChatStore()
const globalStore = useGlobalStore()

// 默认执行一次
chatStore.getSessionList(true)

globalStore.unReadMark.newMsgUnreadCount = 0
</script>

<template>
  <SideBar />
  <ChatBox />
</template>
