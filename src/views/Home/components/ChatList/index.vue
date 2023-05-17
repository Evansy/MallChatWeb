<script setup lang="ts">
import { watchEffect, ref, onMounted, nextTick, computed } from 'vue'
import apis from '@/services/apis'
import { useChatStore, pageSize } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { useWsLoginStore } from '@/stores/ws'
import { ActType, MarkType, IsYet } from '@/services/types'
import type { MessageItemType } from '@/services/types'
import throttle from 'lodash/throttle'

const chatListElRef = ref<HTMLDivElement>()
const chatListLastElRef = ref<HTMLDivElement>()

// 获取消息列表
// const getList = (cursor?: string) => apis.getMsgList({ params: { pageSize: 20, cursor, roomId: 1 } })
const chatStore = useChatStore()
const userStore = useUserStore()
const loginStore = useWsLoginStore()

const myId = computed(() => userStore?.userInfo.uid)
const isSign = computed(() => userStore.isSign)

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
    if (chatStore.chatMessageList?.length <= pageSize && chatListElRef.value && chatStore.chatListToBottomAction) {
      // 消息不满一屏不滚动
      if (chatListElRef.value.scrollHeight <= chatListElRef.value.offsetHeight) return
      // 滚动到消息列表底部
      chatStore.chatListToBottomAction()
      // 加载完列表再把加载更多放出来(一开始就放出来的话，会触发 2 次加载列表)
      setTimeout(() => {
        chatListLastElRef.value && (chatListLastElRef.value.style.display = 'block')
      }, 10)
    }
  },
  { flush: 'post' },
)

onMounted(() => {
  nextTick(() => {
    chatStore.chatListToBottomAction = () => {
      // 聊天列表滚动到底部
      chatListElRef.value?.scrollTo({ left: 0, top: chatListElRef.value.scrollHeight })
    }
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
  })
})

// click like
const onLikeMsg = async (actType: ActType, msg: MessageItemType['message']) => {
  // 没登录先登录
  if (!isSign.value) {
    loginStore.showLogin = true
    return
  }
  await apis.markMsg({ actType, markType: MarkType.Like, msgId: msg.id }).send()
  // 更新图标状态
  msg.messageMark.userLike = actType === ActType.Confirm ? IsYet.Yes : IsYet.No
  // 更新点赞数
  const likeCount = msg.messageMark.likeCount
  msg.messageMark.likeCount = actType === ActType.Confirm ? likeCount + 1 : likeCount - 1
}
// 倒赞
const onDisLikeMsg = async (actType: ActType, msg: MessageItemType['message']) => {
  // 没登录先登录
  if (!isSign.value) {
    loginStore.showLogin = true
    return
  }
  await apis.markMsg({ actType, markType: MarkType.DisLike, msgId: msg.id }).send()
  // 更新图标状态
  msg.messageMark.userDislike = actType === ActType.Confirm ? IsYet.Yes : IsYet.No
  // 更新点赞数
  const dislikeCount = msg.messageMark.dislikeCount
  msg.messageMark.dislikeCount = actType === ActType.Confirm ? dislikeCount + 1 : dislikeCount - 1
}
// 回复消息
const onReplyMsg = async (msgFromUser: MessageItemType) => {
  // 没登录先登录
  if (!isSign.value) {
    loginStore.showLogin = true
    return
  }
  if (!msgFromUser) return
  chatStore.currentMsgReply = msgFromUser
}
</script>

<template>
  <div class="chat-msg-list-wrapper">
    <div class="chat-msg-list" ref="chatListElRef" @scroll="onChangeListScroll">
      <div class="list-last-visible-el" ref="chatListLastElRef" />
      <div class="loading-line" :hidden="!chatStore.loading">
        <el-icon :size="14" class="loading-line-icon"><IEpLoading /></el-icon> 消息加载中
      </div>
      <template v-if="chatStore.chatMessageList?.length">
        <div class="msg-item" v-for="msg of chatStore.chatMessageList" :key="msg.message.id">
          <div class="msg-item-inner" :class="myId && myId === msg.fromUser.uid ? 'msg-item-me' : ''">
            <img class="msg-item-avatar" :src="msg.fromUser.avatar" />
            <div class="msg-item-box">
              <div class="msg-item-name">
                <el-tooltip
                  effect="dark"
                  :content="msg.fromUser?.badge?.describe"
                  :placement="myId && myId === msg.fromUser.uid ? 'top-end' : 'top-start'"
                >
                  <img class="setting_badge" :src="msg.fromUser?.badge?.img" v-show="msg.fromUser?.badge?.img" />
                </el-tooltip>
                {{ msg.fromUser.username }}
              </div>
              <div class="msg-item-info">
                {{ msg.message.content }}
              </div>
            </div>
            <div class="option-icons">
              <i class="chat_item_icon icon_reply" @click="onReplyMsg(msg)" title="回复" />
              <span class="chat_item_icon_wrapper" title="点赞">
                <i
                  class="chat_item_icon"
                  :class="msg.message.messageMark.userLike === IsYet.Yes ? 'icon_like_active' : 'icon_like'"
                  @click="
                    onLikeMsg(
                      msg.message.messageMark.userLike === IsYet.Yes ? ActType.Cancel : ActType.Confirm,
                      msg.message,
                    )
                  "
                />
                {{ msg.message.messageMark.likeCount }}
              </span>
              <span class="chat_item_icon_wrapper" title="不喜欢">
                <i
                  class="chat_item_icon icon_dislike"
                  :class="msg.message.messageMark.userDislike === IsYet.Yes ? 'icon_dislike_active' : 'icon_dislike'"
                  @click="
                    onDisLikeMsg(
                      msg.message.messageMark.userDislike === IsYet.Yes ? ActType.Cancel : ActType.Confirm,
                      msg.message,
                    )
                  "
                />
                {{ msg.message.messageMark.dislikeCount }}
              </span>
            </div>
          </div>
          <!-- TODO 点击回复消息跳转 -->
          <div
            class="msg-item-reply"
            :class="myId && myId === msg.fromUser.uid ? 'msg-item-me' : ''"
            v-if="msg.message.reply"
          >
            @{{ msg.message.reply.username }}: {{ msg.message.reply.content }}
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
