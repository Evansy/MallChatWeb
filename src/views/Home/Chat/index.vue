<script setup lang="ts">
import { useGlobalStore } from '@/stores/global'
import SideBar from './components/SideBar/index.vue'
import ChatBox from './components/ChatBox/index.vue'

const globalStore = useGlobalStore()

// 默认执行一次
globalStore.unReadMark.newMsgUnreadCount = 0
</script>

<template>
  <SideBar />
  <ChatBox />
</template>
