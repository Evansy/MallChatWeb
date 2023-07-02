<script setup lang="ts">
import { onMounted } from 'vue'
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'

onMounted(() => {
  new Player({
    id: 'xgplayer',
    width: 300,
    url: 'http://s2.pstatp.com/cdn/expire-1-M/byted-player-videos/1.0.0/xgplayer-demo.mp4',
    pip: true, // 画中画
    download: true, // 开启下载
    keyShortcut: true, // 键盘快捷键
    fitVideoSize: 'fixWidth',
    videoInit: true, // 显示首帧
    screenShot: {
      saveImg: true,
      quality: 0.92,
      type: 'image/png',
      format: '.png',
    },
    lang: 'zh-cn',
  })
})
</script>

<template>
  <div id="xgplayer" style="flex: auto"></div>
</template>
