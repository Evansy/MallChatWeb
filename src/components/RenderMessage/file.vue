<script setup lang="ts">
import { computed } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { formatBytes, getFileSuffix } from '@/utils'
import type { FileBody } from '@/services/types'
import useDownloadQuenuStore from '@/stores/downloadQuenu'

const { downloadObjMap, download, quenu, cancelDownload } = useDownloadQuenuStore()

const props = defineProps<{ body: FileBody }>()

// 下载文件
const downloadFile = () => {
  // 队列下载
  download(props.body.url)
}

const cancelDownloadFile = () => {
  cancelDownload(props.body.url)
}

// 目前使用url作为map的key 但是url可能会重复 后面可以考虑使用id 或者 url + id 的形式
const isDownloading = computed(() => {
  return downloadObjMap.get(props.body.url)?.isDownloading || false
})

const process = computed(() => {
  return downloadObjMap.get(props.body.url)?.process || 0
})

// 是否排队中
const isQuenu = computed(() => {
  return quenu.includes(props.body.url)
})
</script>

<template>
  <div class="file">
    <Icon :icon="getFileSuffix(body?.fileName)" :size="32" colorful />
    <div class="file-desc">
      <span class="file-name">{{ body?.fileName || '未知文件' }}</span>
      <span class="file-size">{{ formatBytes(body?.size) }}</span>
    </div>
    <el-text v-if="isQuenu" class="mx-1" size="small" type="warning" @click="cancelDownloadFile">
      等待下载
      <el-icon>
        <Close />
      </el-icon>
    </el-text>
    <Icon v-else-if="!isDownloading" icon="xiazai" :size="22" @click="downloadFile" />
    <el-progress
      v-else
      type="circle"
      :percentage="process"
      :width="22"
      :stroke-width="1"
      :show-text="false"
    />
  </div>
</template>
