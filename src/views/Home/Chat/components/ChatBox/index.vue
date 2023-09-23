<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGlobalStore } from '@/stores/global'
import { RoomTypeEnum } from '@/enums'

import UserList from '../UserList/index.vue'
import ChatList from '../ChatList/index.vue'
import SendBar from './SendBar/index.vue'

const isSelect = ref(false)
const globalStore = useGlobalStore()
const currentSession = computed(() => globalStore.currentSession)
</script>

<template>
  <div class="chat-box">
    <div class="chat-wrapper">
      <template v-if="isSelect">
        <ElIcon :size="160" color="var(--font-light)"><IEpChatDotRound /></ElIcon>
      </template>
      <div v-else class="chat">
        <ChatList />
        <SendBar />
      </div>
    </div>
    <UserList v-show="currentSession.type === RoomTypeEnum.Group" />
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
