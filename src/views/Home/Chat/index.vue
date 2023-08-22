<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import SideBar from './components/SideBar/index.vue'
import ChatBox from './components/ChatBox/index.vue'

const chatStore = useChatStore()

// 默认执行一次
chatStore.getSessionList()
</script>

<template>
  <SideBar />
  <ChatBox />
</template>
