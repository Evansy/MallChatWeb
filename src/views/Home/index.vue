<script setup lang="ts">
import ToolBar from './components/ToolBar/index.vue'
import { useImgPreviewStore, useVideoPreviewStore } from '@/stores/preview'
import { useUserStore } from '@/stores/user'
import { h, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import AddFriendModal from '@/components/AddFriendModal/index.vue'
import MsgReadModal from '@/components/MsgReadModal/index.vue'
import CreateGroupModal from '@/components/CreateGroupModal/index.vue'
import { clearListener, initListener, readCountQueue } from '@/utils/readCountQueue'
import { useChatStore } from '@/stores/chat'
import { ElMessageBox } from 'element-plus'
import apis from '@/services/apis'
import PostCard from './components/PostCard/PostCard.vue'

type TContainerDListener = {
  messageId: number | null
  dragStart: (e: DragEvent) => any
  dragOver: (e: DragEvent) => any
  dragLeave: (e: DragEvent) => any
  drop: (e: DragEvent) => any
}

const imageStore = useImgPreviewStore()
const videoStore = useVideoPreviewStore()
const userStore = useUserStore()
const chatStore = useChatStore()
const container = ref<HTMLDivElement>()

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

const containerDragListener: TContainerDListener = {
  messageId: null,
  dragStart(e) {
    const target = e.target as HTMLDivElement
    this.messageId = Number(target.dataset.messageId)
  },
  dragOver(e) {
    e.preventDefault()
    const target = e.target as HTMLDivElement
    if (target.dataset.roomId) {
      target.style.backgroundColor = 'var(--hover-bg-1)'
    }
  },
  dragLeave(e) {
    e.preventDefault()
    const target = e.target as HTMLDivElement
    if (target.dataset.roomId) {
      target.style.backgroundColor = ''
    }
  },
  drop(e) {
    const target = e.target as HTMLDivElement
    if (target.dataset.roomId && this.messageId) {
      target.style.backgroundColor = ''
      // 获取消息体
      const message = chatStore.getMessage(Number(this.messageId))
      const session = chatStore.getSession(Number(target.dataset.roomId))
      if (message && session) {
        // 发送消息
        ElMessageBox.confirm(h(PostCard, { session, message }), '发送给: ', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          draggable: true,
          dangerouslyUseHTMLString: true,
        }).then(() => {
          // 发送消息
          apis
            .sendMsg({
              roomId: Number(target.dataset.roomId),
              msgType: message.message.type,
              body: message.message.body,
            })
            .send()
            .then((res) => {
              chatStore.pushMsg(res)
              // // 发完消息就要刷新会话列表，
              // //  FIXME 如果当前会话已经置顶了，可以不用刷新
              chatStore.updateSessionLastActiveTime(Number(target.dataset.roomId))
            })
        })
      }
    }
  },
}

const initListeners = () => {
  container.value?.addEventListener('dragstart', containerDragListener.dragStart)
  container.value?.addEventListener('dragover', containerDragListener.dragOver)
  container.value?.addEventListener('dragleave', containerDragListener.dragLeave)
  container.value?.addEventListener('drop', containerDragListener.drop)
}
const removeListeners = () => {
  container.value?.removeEventListener('dragstart', containerDragListener.dragStart)
  container.value?.removeEventListener('dragover', containerDragListener.dragOver)
  container.value?.removeEventListener('dragleave', containerDragListener.dragLeave)
  container.value?.removeEventListener('drop', containerDragListener.drop)
}

onMounted(() => {
  initListeners()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  removeListeners()
  clearListener()
})
</script>

<template>
  <main class="home">
    <div class="wrapper" ref="container">
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
