<script setup lang="ts">
import { ref, onMounted, nextTick, provide } from 'vue'
import throttle from 'lodash/throttle'
import { useChatStore } from '@/stores/chat'
import type { MessageType } from '@/services/types'
import VirtualList from '@/components/VirtualList/index'
import MsgItem from './MsgItem/index.vue'

const chatStore = useChatStore()
const virtualListRef = ref()

// 回到底部
const goToBottom = () => {
  if (virtualListRef.value) {
    virtualListRef.value.scrollToBottom()
    chatStore.clearNewMsgCount()
  }
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
const onTotop = throttle(async () => {
  const oldScrollTop = virtualListRef.value.getScrollSize()
  await chatStore.loadMore()
  nextTick(() => {
    const newScrollTop = virtualListRef.value.getScrollSize() - oldScrollTop
    virtualListRef.value.scrollToOffset(newScrollTop)
  })
}, 1600)

// 滚动时触发函数，主要处理新消息提示
const onScroll = throttle((eventData) => {
  const { offset, clientSize, scrollSize } = eventData

  if (!offset || !clientSize || !scrollSize) return

  // 是否已滚动到底部最后一个可视范围内
  const isScrollEnd = offset + clientSize >= scrollSize - clientSize
  if (isScrollEnd) {
    chatStore.isStartCount = false
    chatStore.clearNewMsgCount()
  } else {
    chatStore.isStartCount = true
  }
}, 100)

const getKey = (item: MessageType) => item.message.id
</script>

<template>
  <div class="chat-msg-list" @contextmenu.prevent>
    <el-icon v-if="chatStore.isLoading" :size="14" class="loading"><IEpLoading />消息加载中</el-icon>
    <VirtualList
      v-if="chatStore.chatMessageList?.length"
      ref="virtualListRef"
      class="virtual-list"
      dataPropName="msg"
      :data="chatStore.chatMessageList"
      :data-key="getKey"
      :item="MsgItem"
      :size="20"
      @totop="onTotop"
      @scroll="onScroll"
      @ok="goToBottom"
    />
    <template v-if="!chatStore.isLoading && chatStore.chatMessageList?.length === 0">
      <div class="empty">暂无消息，快来发送第一条消息吧~</div>
    </template>
    <span class="new-msgs-tips" v-show="chatStore.newMsgCount > 0" @click="goToBottom">
      {{ chatStore.newMsgCount }}条新消息
      <el-icon :size="10"><IEpArrowDownBold /></el-icon>
    </span>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
