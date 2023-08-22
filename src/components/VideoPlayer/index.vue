<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Player from 'xgplayer'

const props = defineProps<{ url: string }>()

const player = ref<Player>()

const init = () => {
  if (!props.url) return
  if (player.value) {
    player.value.destroy()
  }
  player.value = new Player({
    id: 'xgplayer',
    url: props.url,
    width: '50%',
    fitVideoSize: 'fixWidth',
    videoInit: true, // 显示首帧
    miniplayer: true,
    miniplayerConfig: {
      bottom: 10,
      right: 10,
      width: 320,
      height: 180,
    },
    pip: true, // 画中画
    cssFullscreen: true, // 全屏样式
    screenShot: {
      saveImg: true,
    },
    ignores: ['replay', 'fullscreen'],
    lang: 'zh-cn',
  })
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  if (player.value) {
    player.value.destroy()
  }
})
</script>

<template>
  <div id="xgplayer"></div>
</template>
