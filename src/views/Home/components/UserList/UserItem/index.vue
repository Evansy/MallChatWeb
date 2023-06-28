<script setup lang="ts">
import { toRef } from 'vue'
import type { PropType } from 'vue'
import { OnlineStatus } from '@/services/types'
import type { UserItem } from '@/services/types'
import { useUserInfo } from '@/hooks/useCached'
const props = defineProps({
  user: {
    type: Object as PropType<UserItem>,
    required: true,
  },
})
const user = toRef(props.user)
const userInfo = useUserInfo(user.value.uid)
</script>

<template>
  <li
    class="user-list-item"
    :class="user.activeStatus === OnlineStatus.Online ? 'item-online' : ''"
    :key="user.uid"
  >
    <div class="item-avatar-wrapper">
      <img class="item-avatar" :src="userInfo.avatar" />
      <i class="item-online-status" />
    </div>
    {{ userInfo.name }}
  </li>
</template>

<style lang="scss" src="./styles.scss" scoped />
