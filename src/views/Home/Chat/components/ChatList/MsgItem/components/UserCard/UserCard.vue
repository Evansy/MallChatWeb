<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { CacheUserItem } from '@/services/types'
import apis from '@/services/apis'
import { RoomTypeEnum } from '@/enums'
import { useChatStore } from '@/stores/chat'
import { useGlobalStore } from '@/stores/global'
import { useCachedStore } from '@/stores/cached'
import { useUserStore } from '@/stores/user'

const chatStore = useChatStore()
const globalStore = useGlobalStore()
const cacheStore = useCachedStore()
const userStore = useUserStore()

const props = defineProps<{
  user: CacheUserItem
}>()

const userCard = ref<HTMLDivElement>()

const sendMsg = async () => {
  const result = await apis.sessionDetailWithFriends({ uid: props.user.uid }).send()
  globalStore.currentSession.roomId = result.roomId
  globalStore.currentSession.type = RoomTypeEnum.Single
  chatStore.updateSessionLastActiveTime(result.roomId, result)
}

onMounted(() => {
  cacheStore.getBatchBadgeInfo(props.user.itemIds || [])
})
</script>

<template>
  <div ref="userCard" class="user-card">
    <div class="user-card_top">
      <div class="user-card_top-avatar">
        <el-avatar shape="square" :size="55" :src="user.avatar" />
      </div>
      <div class="user-card_top-info">
        <el-tooltip effect="dark" :content="user.name" placement="top-start">
          <div class="user-card_top-info_name">昵称：{{ user.name }}</div>
        </el-tooltip>
        <div class="user-card_top-info_id">uid：{{ user.uid }}</div>
        <div class="user-card_top-info_place">地区：{{ user.locPlace }}</div>
      </div>
    </div>
    <div class="user-card_badge" v-if="user.itemIds?.length">
      <div class="user-card_badge-item" v-for="itemId in user.itemIds" :key="itemId">
        <el-badge v-if="user.wearingItemId === itemId" is-dot>
          <img
            class="user-card_badge-item"
            :src="cacheStore.badgeCachedList[itemId]?.img"
            :alt="cacheStore.badgeCachedList[itemId]?.describe"
            :title="cacheStore.badgeCachedList[itemId]?.describe"
          />
        </el-badge>
        <img
          v-else
          class="user-card_badge-item"
          :src="cacheStore.badgeCachedList[itemId]?.img"
          :alt="cacheStore.badgeCachedList[itemId]?.describe"
          :title="cacheStore.badgeCachedList[itemId]?.describe"
        />
      </div>
    </div>
    <div class="user-card_other">
      <div
        class="user-card_other-item user-card_other_send"
        @click="sendMsg"
        v-if="userStore.isSign"
      >
        <Icon class="tool-icon" icon="chat" :size="28" />
        <span>发消息</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./styles.scss"></style>
