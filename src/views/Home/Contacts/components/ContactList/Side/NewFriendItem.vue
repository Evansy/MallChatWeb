<script setup lang="ts" name="NewFriendItem">
import { toRefs, computed } from 'vue'
import { useContactStore } from '@/stores/contacts'
import { RequestFriendAgreeStatus } from '@/services/types'
import type { RequestFriendItem } from '@/services/types'
import { useUserInfo } from '@/hooks/useCached'

const props = defineProps<{ item: RequestFriendItem }>()

const { item } = toRefs(props)

const contactStore = useContactStore()

const currentUid = computed(() => item?.value?.uid)
const currentUser = useUserInfo(currentUid.value)
</script>

<template>
  <div class="item-info">
    <Avatar class="avatar" :src="currentUser.avatar" :size="40" />
    <div class="item-info-right">
      <span class="item-info-name">
        {{ currentUser.name }}
        <button
          class="item-info-accept-btn"
          v-if="item.status === RequestFriendAgreeStatus.Waiting"
          @click="contactStore.onAcceptFriend(item.applyId)"
        >
          接受
        </button>
        <span class="item-info-accept-text" v-else>已添加</span>
      </span>
      <span class="item-info-msg">{{ item?.msg }}</span>
    </div>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
