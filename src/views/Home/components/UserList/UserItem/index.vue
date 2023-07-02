<script setup lang="ts">
import { toRef } from 'vue'
import type { PropType } from 'vue'
import { OnlineEnum } from '@/enums'
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
  <li class="user-list-item" :key="user.uid">
    <Avatar
      :src="userInfo.avatar"
      :size="24"
      showStatus
      :online="user.activeStatus === OnlineEnum.ONLINE"
    />
    {{ userInfo.name }}
  </li>
</template>

<style lang="scss" src="./styles.scss" scoped />
