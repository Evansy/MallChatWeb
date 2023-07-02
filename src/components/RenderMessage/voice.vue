<script setup lang="ts">
import { ref, type PropType, onBeforeUnmount } from 'vue'
import type { VoiceBody } from '@/services/types'

const props = defineProps({
  body: {
    type: Object as PropType<VoiceBody>,
    required: true,
  },
})
const audioRef = ref<HTMLAudioElement | null>(null) // 引用保存 Audio 元素
const isPlaying = ref(false)
const progress = ref(0) // 进度条

// 播放结束
const onEnded = () => {
  isPlaying.value = false
}
// 更新播放进度
const timeupdate = (event: Event) => {
  const audioElement = event.target as HTMLAudioElement
  progress.value = Math.floor(audioElement.currentTime)
}

/**
 * 释放内存资源
 */
const release = () => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
    audioRef.value.removeEventListener('timeupdate', timeupdate)
    audioRef.value.removeEventListener('ended', onEnded)
  }
}

/**
 * 播放音频
 */
const playAudio = () => {
  release()

  const audio = new Audio(props.body.url)
  audioRef.value = audio // 保存引用
  audio.addEventListener('timeupdate', timeupdate)
  audio.addEventListener('ended', onEnded)
  audio.play()
  isPlaying.value = true
}

onBeforeUnmount(() => {
  release()
})
</script>

<template>
  <div class="voice" :style="`${body?.second * 0.78}em`" @click="playAudio">
    <div class="saying">
      <span :class="['shelter', { play: isPlaying }]" />
      <Icon icon="saying" :size="18" />
    </div>
    <span class="num">{{ progress || body?.second }}s</span>
  </div>
</template>
