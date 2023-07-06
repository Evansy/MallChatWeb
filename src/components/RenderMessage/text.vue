<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { TextBody } from '@/services/types'

const props = defineProps({
  body: {
    type: Object as PropType<TextBody>,
    required: true,
  },
})

// 获取所有匹配的字符串
const urlMap = props.body.urlTitleMap || {}
const keys = Object.keys(urlMap)
// 使用匹配字符串创建动态正则表达式，并将文本拆分为片段数组
const fragments = computed(() => {
  let content = props.body.content || ''
  content = content.replace(/&nbsp;/g, '\u00A0')
  const regex = new RegExp(`(@\\S+\\s|${keys.join('|')}|\\S+\\s)`, 'g')
  return content.split(regex)
})

// 打开链接
const openUrl = (url: string) => {
  if (!url) return
  // 当没有协议时，自动添加协议
  window.open('//' + url, '_blank')
}
</script>

<template>
  <div class="text">
    <template v-for="(item, index) in fragments">
      <span
        v-if="item.startsWith('@') && item.trim() !== '' && item.trim() !== '@'"
        :key="item"
        class="text-mention"
      >
        {{ item }}
      </span>
      <template v-else>{{ item }}</template>
      <div
        v-if="keys.includes(item)"
        :key="item + index"
        rel="noopener noreferrer nofollow"
        target="_blank"
        class="text-card"
        @click="openUrl(item.trim())"
      >
        <span class="text-card-link ellipsis-1"> {{ item.trim() }}</span>
        <span class="text-card-title ellipsis-2"> {{ urlMap[item] }}</span>
        <span class="text-card-desc ellipsis-1">暂无描述</span>
      </div>
    </template>
  </div>
</template>
