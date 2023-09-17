<script setup lang="ts">
import ToolBar from './components/ToolBar/index.vue'
import { useImgPreviewStore, useVideoPreviewStore } from '@/stores/preview'
import { useUserStore } from '@/stores/user'
import { onUnmounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import AddFriendModal from '@/components/AddFriendModal/index.vue'
import MsgReadModal from '@/components/MsgReadModal/index.vue'
import CreateGroupModal from '@/components/CreateGroupModal/index.vue'
import { initListener, readCountQueue, clearListener } from '@/utils/readCountQueue'

const imageStore = useImgPreviewStore()
const videoStore = useVideoPreviewStore()
const userStore = useUserStore()

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

watch(
  () => userStore.isSign,
  (newValue) => {
    if (newValue) {
      initListener()
      readCountQueue()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  clearListener()
})
</script>

<template>
  <main class="home">
    <div class="wrapper">
      <ToolBar />
      <RouterView />
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
      <Icon icon="guanbi1" class="close" :size="30" @click="videoStore.close()" />
      <VideoPlayer :url="videoStore.previewUrl" style="pointer-events: auto" />
    </div>
    <AddFriendModal />
    <LoginBox />
    <MsgReadModal />
    <CreateGroupModal />
  </main>
</template>

<style lang="scss" src="./styles.scss" scoped />
