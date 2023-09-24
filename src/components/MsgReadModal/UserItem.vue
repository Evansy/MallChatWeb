<script setup lang="ts" name="UserItem">
import { toRefs } from 'vue'
import { useUserInfo } from '@/hooks/useCached'

const props = defineProps<{ uid: number }>()

const { uid } = toRefs(props)
const user = useUserInfo(uid)
</script>

<template>
  <li class="person-item">
    <Avatar class="avatar" :src="user.avatar" :size="30" />
    <div class="person-item__name">
      {{ user.name }}
    </div>
  </li>
</template>

<style lang="scss" src="./styles.scss" scoped />
