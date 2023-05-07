<script setup lang="ts">
import { watchEffect, ref, onMounted, nextTick, computed } from 'vue'
import { useChatStore, pageSize } from '@/stores/chat'
import throttle from 'lodash/throttle'

const chatListElRef = ref<HTMLDivElement>()
const chatListLastElRef = ref<HTMLDivElement>()

// 获取消息列表
// const getList = (cursor?: string) => apis.getMsgList({ params: { pageSize: 20, cursor, roomId: 1 } })
const chatStore = useChatStore()

const myId = computed(() => {
  let userInfo = { uid: null }
  try {
    userInfo = JSON.parse(localStorage.getItem('USER_INFO') || '{}')
  } catch (error) {
    userInfo = { uid: null }
  }
  return userInfo?.uid
})

const onChangeListScroll = throttle(
  () => {
    if (!chatListElRef.value) return
    // 滚动是否超过最新消息一屏。
    chatStore.isScrollAboveOneScreen =
      chatListElRef.value.scrollHeight - chatListElRef.value.scrollTop > chatListElRef.value.offsetHeight * 2
  },
  200,
  { leading: true, trailing: true },
)

watchEffect(
  () => {
    // 滚动到最新消息
    if (chatStore.chatMessageList?.length <= pageSize && chatListElRef.value) {
      // 加载列表了
      chatStore.chatListToBottomAction?.()
      // 加载完列表再把加载更多放出来(一开始就放出来的话，会触发 2 次加载列表)
      setTimeout(() => {
        chatListLastElRef.value && (chatListLastElRef.value.style.display = 'block')
      }, 0)
    }
  },
  { flush: 'post' },
)

onMounted(() => {
  nextTick(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries?.[0]?.isIntersecting) {
          // 获取第一条消息的位置
          const firstMsgRef = document.querySelector('.msg-item') as HTMLDivElement
          // 加载更多
          await chatStore.loadMore()
          // 保持滚动条位置。
          chatListElRef.value?.scrollTo({ left: 0, top: firstMsgRef?.offsetTop - 20 || 0 })
        }
      },
      {
        // root: chatListElRef.value,
        rootMargin: '100px',
        threshold: 0.1,
      },
    )

    // 元素可见性监听
    chatListLastElRef.value && observer.observe(chatListLastElRef.value)

    chatStore.chatListToBottomAction = () => {
      // 聊天列表滚动到底部
      chatListElRef.value?.scrollTo({ left: 0, top: chatListElRef.value.scrollHeight })
    }
  })
})
</script>

<template>
  <div class="chat-msg-list-wrapper">
    <div class="chat-msg-list" ref="chatListElRef" @scroll="onChangeListScroll">
      <div class="list-last-visible-el" ref="chatListLastElRef" />
      <div class="loading-line" :hidden="!chatStore.loading">
        <el-icon :size="14" class="loading-line-icon"><IEpLoading /></el-icon> 消息加载中
      </div>
      <template v-if="chatStore.chatMessageList?.length">
        <div
          class="msg-item"
          :class="myId && myId === msg.fromUser.uid ? 'msg-item-me' : ''"
          v-for="msg of chatStore.chatMessageList"
          :key="msg.message.id"
        >
          <img class="msg-item-avatar" :src="msg.fromUser.avatar" />
          <div class="msg-item-box">
            <div class="msg-item-name">{{ msg.fromUser.username }}</div>
            <div class="msg-item-info">
              {{ msg.message.content }}
            </div>
          </div>
        </div>
      </template>
      <template v-if="!chatStore.loading && chatStore.chatMessageList?.length === 0">
        <div class="list-no-data">暂无消息，快来发送第一条消息吧~</div>
      </template>
    </div>
    <!-- 滚动超过最新消息一屏时，新消息提醒 -->
    <div class="new-msgs-box" v-show="chatStore.newMsgCount > 0" @click="chatStore.chatListToBottomAction">
      <span class="new-msgs-tips">{{ chatStore.newMsgCount }}条新消息</span>
      <span>
        <el-icon :size="10"><IEpArrowDownBold /></el-icon>
      </span>
    </div>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
