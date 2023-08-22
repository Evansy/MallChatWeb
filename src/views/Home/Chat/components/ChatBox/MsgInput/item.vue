<script setup lang="ts">
import type { CacheUserItem } from '@/services/types'

interface Props {
  item: CacheUserItem
  activeIndex: number
  index: number
  onSelect?: (uid: number) => void
}
const props = defineProps<Props>()

const onClick = () => {
  props.onSelect?.(props.item.uid)
}
</script>

<template>
  <div
    class="person-item"
    :class="{ 'person-item--active': activeIndex === index }"
    @click="onClick"
  >
    <Avatar class="avatar" :src="item.avatar" :size="26" />
    <div class="person-item__name">
      {{ item.name }}
    </div>
  </div>
</template>

<style lang="scss" src="./styles.scss" />
