<script setup lang="ts">
import { computed, inject } from 'vue'
import apis from '@/services/apis'
import { useChatStore } from '@/stores/chat'
import type { PropType } from 'vue'
import type { MessageItemType } from '@/services/types'
import { ActType, MarkType, IsYet } from '@/services/types'

const props = defineProps({
  msg: {
    type: Object as PropType<MessageItemType>,
    required: true,
  },
})

const focusMsgInput = inject<() => void>('focusMsgInput')
const chatStore = useChatStore()

/**
 * 点赞或取消点赞
 */
const onLikeMsg = async (actType: ActType, msg: MessageItemType['message']) => {
  await apis.markMsg({ actType, markType: MarkType.Like, msgId: msg.id }).send()
  const { likeCount } = msg.messageMark
  msg.messageMark.userLike = actType === ActType.Confirm ? IsYet.Yes : IsYet.No
  msg.messageMark.likeCount = actType === ActType.Confirm ? likeCount + 1 : likeCount - 1
}

/**
 * 倒赞或取消倒赞
 */
const onDisLikeMsg = async (actType: ActType, msg: MessageItemType['message']) => {
  await apis.markMsg({ actType, markType: MarkType.DisLike, msgId: msg.id }).send()
  const { dislikeCount } = msg.messageMark
  msg.messageMark.userDislike = actType === ActType.Confirm ? IsYet.Yes : IsYet.No
  msg.messageMark.dislikeCount = actType === ActType.Confirm ? dislikeCount + 1 : dislikeCount - 1
}

/**
 * 回复消息
 */
const onReplyMsg = async (msgFromUser: MessageItemType) => {
  if (!msgFromUser) return
  chatStore.currentMsgReply = msgFromUser
  focusMsgInput?.()
}

// 是否已经点赞、倒赞
const isLikeActive = computed(() => props.msg.message.messageMark.userLike === IsYet.Yes)
const isDisLikeActive = computed(() => props.msg.message.messageMark.userDislike === IsYet.Yes)
</script>

<template>
  <div class="msg-option">
    <span class="msg-option-item" title="回复">
      <i class="icon reply" v-login="() => onReplyMsg(msg)" />
    </span>
    <span class="msg-option-item" title="点赞">
      <i
        :class="['icon like', { 'like-active': isLikeActive }]"
        v-login="() => onLikeMsg(isLikeActive ? ActType.Cancel : ActType.Confirm, msg.message)"
      />
      {{ msg.message.messageMark.likeCount }}
    </span>
    <span class="msg-option-item" title="不喜欢">
      <i
        :class="['icon dislike', { 'dislike-active': isDisLikeActive }]"
        v-login="() => onDisLikeMsg(isDisLikeActive ? ActType.Cancel : ActType.Confirm, msg.message)"
      />
      {{ msg.message.messageMark.dislikeCount }}
    </span>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
