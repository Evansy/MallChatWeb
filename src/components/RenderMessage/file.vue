<script setup lang="ts">
import type { PropType } from 'vue'
import { getFileSuffix, formatBytes } from '@/utils'
import type { FileBody } from '@/services/types'
import useDownload from '@/hooks/useDownload'

const { downloadFile: download, process, isDownloading } = useDownload()

const props = defineProps({
  body: {
    type: Object as PropType<FileBody>,
    required: true,
  },
})

// 下载文件
const downloadFile = () => {
  download(props.body.url, props.body.fileName)
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
