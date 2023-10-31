<script setup lang="ts">
import type { VideoBody } from '@/services/types'
import { useVideoPreviewStore } from '@/stores/preview'
import { formatImage } from '@/utils'
import { useUserStore } from '@/stores/user'

const props = defineProps<{ body: VideoBody; id: number }>()

const videoStore = useVideoPreviewStore()
const userStore = useUserStore()
const getImageHeight = () => {
  const width = props.body.thumbWidth || 0
  const height = props.body.thumbHeight || 0
  return formatImage(width, height)
}
</script>

<template>
  <div
    class="video"
    :style="`height:${getImageHeight()}px`"
    @click="videoStore.open(body?.url)"
    :draggable="userStore.isSign ? 'true' : 'false'"
    :data-message-id="id"
  >
    <Icon icon="bofang" :size="30" />
    <img :src="body.thumbUrl" :alt="body.thumbUrl" />
  </div>
</template>
