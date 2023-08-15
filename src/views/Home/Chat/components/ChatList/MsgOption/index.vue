<script setup lang="ts">
import { useLikeToggle } from '@/hooks/useLikeToggle'
import { useChatStore } from '@/stores/chat'
import type { MessageType } from '@/services/types'
import eventBus from '@/utils/eventBus'

const props = defineProps<{ msg: MessageType }>()

const chatStore = useChatStore()

const { isLike, isDisLike, onLike, onDisLike } = useLikeToggle(props.msg.message)

/**
 * 回复消息
 */
const onReplyMsg = async (msgFromUser: MessageType) => {
  if (!msgFromUser) return
  chatStore.currentMsgReply = msgFromUser
  eventBus.emit('focusMsgInput')
}
</script>

<template>
  <div class="msg-option" v-if="!msg.loading">
    <span class="msg-option-item" title="回复">
      <Icon icon="reply" :size="14" v-login="() => onReplyMsg(msg)" />
    </span>
    <span class="msg-option-item" title="点赞">
      <Icon icon="like" :size="14" :class="[{ 'like-active': isLike }]" v-login="() => onLike()" />
    </span>
    <span class="msg-option-item" title="不喜欢">
      <Icon
        icon="dislike"
        :size="15"
        :class="[{ 'dislike-active': isDisLike }]"
        v-login="() => onDisLike()"
      />
    </span>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
