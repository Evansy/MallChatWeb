<script setup lang="ts">
import { computed } from 'vue'
import type { VoiceBody } from '@/services/types'
import { useVoicePreviewStore } from '@/stores/preview'

const props = defineProps<{ body: VoiceBody }>()
const voiceStore = useVoicePreviewStore()

// 判断当前这个消息组件是否正在播放
const isPlay = computed(() => voiceStore.previewUrl === props.body.url && voiceStore.isPlaying)
</script>

<template>
  <div class="voice" @click="voiceStore.open(body.url)">
    <div class="saying">
      <span :class="['shelter', { play: isPlay }]" />
      <Icon icon="saying" :size="18" />
    </div>
    <span class="num">{{ body?.second }}"</span>
  </div>
</template>
