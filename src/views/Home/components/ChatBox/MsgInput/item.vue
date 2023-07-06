<script setup lang="ts">
import type { PropType } from 'vue'
import type { CacheUserItem } from '@/services/types'

const props = defineProps({
  // 消息体
  item: {
    type: Object as PropType<CacheUserItem>,
    required: true,
  },
  activeIndex: {
    type: Number,
  },
  index: {
    type: Number,
  },
  onSelect: Function,
})

const emit = defineEmits(['select'])

const onClick = () => {
  props.onSelect?.(props.item)
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
