<script setup lang="ts">
import { watchEffect, ref, onMounted, nextTick, computed } from 'vue'
import { useRequest } from 'alova'
import apis from '@/services/apis'

const chatListElRef = ref<HTMLDivElement>()
const chatListLastElRef = ref<HTMLDivElement>()

// 获取消息列表
const getList = () => apis.getMsgList({ params: { pageSize: 20, roomId: 1 } })
const { loading, data } = useRequest(getList())

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
    if (data.value?.list?.length && chatListElRef.value) {
      chatListElRef.value?.scrollTo({ left: 0, top: chatListElRef.value.scrollHeight })
    }
  },
  { flush: 'post' },
)

onMounted(() => {
  nextTick(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries?.[0]?.isIntersecting) {
          console.log('完全显示出来了')
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
  <div class="chat-msg-list" v-loading.lock="loading" ref="chatListElRef">
    <div class="list-last-visible-el" ref="chatListLastElRef" />
    <template v-if="data?.list?.length">
      <div
        class="msg-item"
        :class="myId && myId === msg.fromUser.uid ? 'msg-item-me' : ''"
        v-for="msg of data?.list"
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
    <template v-else>
      <div class="list-no-data">暂无消息，快来发送第一条消息吧~</div>
    </template>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
