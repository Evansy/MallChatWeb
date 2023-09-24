<script setup lang="ts" name="ContactItem">
import { toRefs, computed } from 'vue'
import { OnlineEnum } from '@/enums'
import { useUserInfo } from '@/hooks/useCached'
import type { ContactItem } from '@/services/types'

const props = defineProps<{ item: ContactItem }>()

const { item } = toRefs(props)

const currentUid = computed(() => item?.value?.uid)
const currentUser = useUserInfo(currentUid.value)
</script>

<template>
  <div class="item-info contact-item">
    <Avatar
      class="avatar"
      :src="currentUser.avatar"
      :size="40"
      showStatus
      :online="item.activeStatus === OnlineEnum.ONLINE"
    />
    <div class="item-info-right">
      <span class="item-info-name"> {{ currentUser.name }}</span>
    </div>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
