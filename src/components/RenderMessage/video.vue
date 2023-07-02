<script setup lang="ts">
import type { PropType } from 'vue'
import type { VideoBody } from '@/services/types'

defineProps({
  body: {
    type: Object as PropType<VideoBody>,
    required: true,
  },
})
</script>

<template>
  <div class="video">
    <Icon icon="loading" :size="40" />
    <img :src="body.thumbUrl" :style="`width: ${body.thumbWidth}px;height:${body.thumbHeight}`" />
  </div>
</template>
