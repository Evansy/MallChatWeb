<script setup lang="ts">
import ToolBar from './components/ToolBar/index.vue'
import SideBar from './components/SideBar/index.vue'
import ChatBox from './components/ChatBox/index.vue'
import { useImgPreviewStore, useVideoPreviewStore } from '@/stores/preview'
import { onUnmounted, watch } from 'vue'

const imageStore = useImgPreviewStore()
const videoStore = useVideoPreviewStore()

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    videoStore.close()
  }
}

watch(
  () => videoStore.isPlaying,
  (newValue) => {
    if (newValue) {
      window.addEventListener('keydown', handleKeyDown)
    } else {
      window.removeEventListener('keydown', handleKeyDown)
    }
  },
)

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <main class="home">
    <div class="wrapper">
      <ToolBar />
      <SideBar />
      <ChatBox />
    </div>
    <footer class="footer">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">闽ICP备2023004110号</a>
    </footer>
    <el-image-viewer
      v-if="imageStore.isShowing"
      :z-index="5000"
      :initial-index="0"
      :zoom-rate="1.1"
      :hide-on-click-modal="true"
      :url-list="[imageStore.previewUrl]"
      @close="imageStore.close()"
    />
    <div v-if="videoStore.isPlaying" class="video-play" style="pointer-events: none">
      <VideoPlayer :url="videoStore.previewUrl" style="pointer-events: auto"></VideoPlayer>
    </div>
    <LoginBox />
  </main>
</template>

<style lang="scss" src="./styles.scss" scoped />
