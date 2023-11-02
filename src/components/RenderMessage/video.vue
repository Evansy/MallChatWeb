<script setup lang="ts">
import type { VideoBody } from '@/services/types'
import { useVideoPreviewStore } from '@/stores/preview'
import { formatImage } from '@/utils'

const props = defineProps<{ body: VideoBody }>()

const videoStore = useVideoPreviewStore()
const getImageHeight = () => {
  const width = props.body.thumbWidth || 0
  const height = props.body.thumbHeight || 0
  return formatImage(width, height)
}
</script>

<template>
  <div class="video" :style="`height:${getImageHeight()}px`" @click="videoStore.open(body?.url)">
    <Icon icon="bofang" :size="30" />
    <img :src="body.thumbUrl" :alt="body.thumbUrl" />
  </div>
</template>
