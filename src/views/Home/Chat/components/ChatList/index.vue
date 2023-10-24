<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref } from 'vue'
import throttle from 'lodash/throttle'
import { useChatStore } from '@/stores/chat'
import type { MessageType } from '@/services/types'
import VirtualList from '@/components/VirtualList'
import MsgItem from './MsgItem/index.vue'
import RoomName from './RoomName/index.vue'

const chatStore = useChatStore()
const virtualListRef = ref()
const messageOptions = computed(() => chatStore.currentMessageOptions)
const chatMessageList = computed(() => chatStore.chatMessageList)
const currentNewMsgCount = computed(() => chatStore.currentNewMsgCount)

// 回到底部
const goToBottom = () => {
  if (virtualListRef.value) {
    virtualListRef.value.scrollToBottom()
    chatStore.clearNewMsgCount()
  }
}

// 回到最新消息
const goToNewMessage = () => {
  // 未读消息数 = 总数 - 新消息数
  virtualListRef.value.scrollToIndex(
    chatMessageList.value.length - (currentNewMsgCount.value?.count || 0),
  )
  chatStore.clearNewMsgCount()
}

// 提供虚拟列表 ref 给子组件使用
provide('virtualListRef', virtualListRef)

onMounted(() => {
  nextTick(() => {
    chatStore.chatListToBottomAction = () => {
      goToBottom()
    }
  })
})

// 到顶部时触发函数 记录旧的滚动高度，加载更多消息后滚动回加载时那条消息的位置
const onToTop = async () => {
  if (messageOptions.value?.isLoading) return
  const oldIndex = virtualListRef.value.getSizes()
  await chatStore.loadMore()
  virtualListRef.value.scrollToIndex(virtualListRef.value.getSizes() - oldIndex)
}

// 滚动时触发函数，主要处理新消息提示
const onScroll = throttle((eventData) => {
  const { offset, clientSize, scrollSize } = eventData

  if (!offset || !clientSize || !scrollSize) return

  // 是否已滚动到底部最后一个可视范围内
  const isScrollEnd = offset + clientSize >= scrollSize - clientSize
  if (isScrollEnd) {
    currentNewMsgCount.value && (currentNewMsgCount.value.isStart = false)
    chatStore.clearNewMsgCount()
  } else {
    currentNewMsgCount.value && (currentNewMsgCount.value.isStart = true)
  }
}, 100)

const getKey = (item: MessageType) => item.message.id
</script>

<template>
  <div class="chat-msg-list" @contextmenu.prevent>
    <RoomName />
    <el-icon v-if="messageOptions?.isLoading" :size="14" class="loading">
      <IEpLoading />
      消息加载中
    </el-icon>
    <VirtualList
      v-if="chatMessageList?.length"
      ref="virtualListRef"
      class="virtual-list scroll-hover"
      dataPropName="msg"
      :data="chatMessageList"
      :data-key="getKey"
      :item="MsgItem"
      :size="20"
      @totop="onToTop"
      @scroll="onScroll"
      @ok="goToBottom"
    />
    <!-- <VideoPlayer></VideoPlayer> -->
    <template v-if="!messageOptions?.isLoading && chatMessageList?.length === 0">
      <div class="empty">暂无消息，快来发送第一条消息吧~</div>
    </template>
    <span
      class="new-msgs-tips"
      v-show="currentNewMsgCount?.count && currentNewMsgCount.count > 0"
      @click="goToNewMessage"
    >
      {{ currentNewMsgCount?.count }} 条新消息
      <el-icon :size="10"><IEpArrowDownBold /></el-icon>
    </span>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
