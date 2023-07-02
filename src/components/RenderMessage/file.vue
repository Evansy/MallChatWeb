<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { getFileSuffix, formatBytes } from '@/utils'
import type { FileBody } from '@/services/types'

const props = defineProps({
  body: {
    type: Object as PropType<FileBody>,
    required: true,
  },
})

const isDownloading = ref(false)
// 下载文件
const downloadFile = () => {
  isDownloading.value = true
  const a = document.createElement('a')
  a.href = props.body.url
  a.download = props.body.fileName
  a.target = '_blank'
  a.click()
  a.remove()
  setTimeout(() => {
    isDownloading.value = false
  }, 500)
}
</script>

<template>
  <div class="file">
    <Icon :icon="getFileSuffix(body?.fileName)" :size="32" colorful />
    <div class="file-desc">
      <span class="file-name">{{ body?.fileName || '未知文件' }}</span>
      <span class="file-size">{{ formatBytes(body?.size) }}</span>
    </div>
    <Icon v-if="!isDownloading" icon="xiazai" :size="22" @click="downloadFile" />
    <Icon v-else icon="loading" :size="22" spin />
  </div>
</template>
