<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  urlMap: {
    type: Object,
    default: () => ({}),
  },
  text: {
    type: String,
    default: '',
  },
  isMe: {
    type: Boolean,
    default: false,
  },
})

// 获取所有匹配的字符串
const urlMap = props.urlMap || {}
const keys = Object.keys(urlMap)
// 使用匹配字符串创建动态正则表达式，并将文本拆分为片段数组
const fragments = computed(() => props.text?.split(new RegExp(`(${keys.join('|')})`)) || [])
</script>

<template>
  <template v-for="item in fragments">
    <a
      v-if="keys.includes(item)"
      :key="item"
      rel="noopener noreferrer nofollow"
      target="_blank"
      class="msg-content-link"
      :href="item"
      :style="{ color: `var(${props.isMe ? '--color-link' : '--color-primary'})` }"
    >
      {{ urlMap[item] }}
    </a>
    <template v-else>{{ item }}</template>
  </template>
</template>
