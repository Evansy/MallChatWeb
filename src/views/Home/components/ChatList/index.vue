<script setup lang="ts">
import { watchEffect, ref, onMounted, nextTick, computed } from 'vue'
import { useChatStore, pageSize } from '@/stores/chat'

const chatListElRef = ref<HTMLDivElement>()
const msgLength = ref(0)
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

watchEffect(
  () => {
    // 滚动到最新消息
    if (
      (chatStore.chatMessageList?.length <= pageSize && chatListElRef.value) ||
      chatStore.chatMessageList?.length !== msgLength.value
    ) {
      chatListElRef.value?.scrollTo({ left: 0, top: chatListElRef.value.scrollHeight })
      msgLength.value = chatStore.chatMessageList?.length
    }
  },
  { flush: 'post' },
)

onMounted(() => {
  nextTick(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries?.[0]?.isIntersecting) {
          // 加载更多
          chatStore.loadMore()
        }
      },
      {
        // root: chatListElRef.value,
        rootMargin: '100px',
        threshold: 0.1,
      },
    )
    chatListLastElRef.value && observer.observe(chatListLastElRef.value)
  })
})
</script>

<template>
  <div class="chat-msg-list" ref="chatListElRef">
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
          <div class="msg-item-name">{{ msg.fromUser.username }}, msgId:{{ msg.message.id }}</div>
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
</template>

<style lang="scss" src="./styles.scss" scoped />
