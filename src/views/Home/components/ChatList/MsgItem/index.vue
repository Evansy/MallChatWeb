<script setup lang="ts">
import { computed, nextTick, onMounted, ref, type Ref, type PropType, inject } from 'vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import { useUserStore } from '@/stores/user'
import { useChatStore, pageSize } from '@/stores/chat'
import { formatTimestamp } from '@/utils/computedTime'
import type { MessageItemType, MessageItemContentType } from '@/services/types'
import defaultAvatar from '@/assets/avatars/default.png'
import RenderMsg from '@/components/RenderMsg'
import MsgOption from '../MsgOption/index.vue'
import type { TooltipTriggerType } from 'element-plus/es/components/tooltip/src/trigger'
import { copyToClip } from '@/utils/copy'

const props = defineProps({
  // 消息体
  msg: {
    type: Object as PropType<MessageItemType>,
    required: true,
  },
  // 是否显示时间
  isShowTime: {
    type: Boolean,
    default: true,
  },
  // 是否显示时间段
  isShowTimeBlock: {
    type: Boolean,
    default: true,
  },
  // 消息气泡模式：左右分布-spread、左对齐-left、右对齐-right
  bubbleMode: {
    type: String,
    default: 'spread',
  },
  // 消息气泡操作触发方式
  tooltipTrigger: {
    type: [String, Array] as PropType<TooltipTriggerType | TooltipTriggerType[]>,
    default: 'hover',
  },
})

const userStore = useUserStore()
const chatStore = useChatStore()
const myBadge = computed(() => userStore?.userInfo.badge)
const isCurrentUser = computed(() => props.msg?.fromUser.uid === userStore?.userInfo.uid)
const chatCls = computed(() => ({
  'chat-item': true,
  'is-me': isCurrentUser.value,
  right: (isCurrentUser.value && props.bubbleMode === 'spread') || props.bubbleMode === 'right',
}))

const renderMsgRef = ref<HTMLElement | null>(null)
const boxRef = ref<HTMLElement | null>(null)
const tooltipPlacement = ref()
const virtualListRef = inject<Ref>('virtualListRef')

// 滚动到消息
const scrollToMsg = async (msg: MessageItemContentType) => {
  const { reply, id } = msg
  // 不允许跳转不跳转，目前是 100 条(后端配置)以内允许跳转
  if (!reply || !reply.canCallback) return
  // 如果消息已经加载过了，就直接跳转
  const index = chatStore.getMsgIndex(reply.id)
  if (index > -1) {
    virtualListRef?.value?.scrollToIndex(index, true)
  } else {
    // 如果没有加载过，就先加载，然后跳转
    const curMsgIndex = chatStore.getMsgIndex(id)
    // +1 是在 reply.gapCount - curMsgIndex 刚好是 pageSize 倍数的时候，跳转到的是第一条消息，会触发加载更多，样式会乱掉
    const needLoadPageSize = Math.ceil((reply.gapCount - curMsgIndex + 1) / pageSize) * pageSize
    // 加载数据
    await chatStore.loadMore(needLoadPageSize)
    // 跳转
    // FIXME 这时候新加载消息了，所以会有滚动冲突，故不加动画效果，否则会很怪异。
    setTimeout(virtualListRef?.value?.scrollToIndex(chatStore.getMsgIndex(reply.id), false), 0)
    // TODO 跳转到的消息 高亮一下
  }
}

/** 右键菜单 */
const handleRightClick = (e: MouseEvent, msg: MessageItemType) => {
  ContextMenu.showContextMenu({
    theme: 'mac dark',
    items: [
      {
        label: '复制',
        onClick: () => copyToClip(msg.message.content),
      },
    ],
    zIndex: 3,
    minWidth: 230,
    x: e.x,
    y: e.y,
  })
}

onMounted(() => {
  nextTick(() => {
    if (renderMsgRef.value && boxRef.value) {
      const renderMsgWidth = renderMsgRef.value.clientWidth
      const boxWidth = boxRef.value.clientWidth
      if (renderMsgWidth + 100 <= boxWidth) {
        tooltipPlacement.value = 'right-end'
      } else if (props.msg.message.reply) {
        tooltipPlacement.value = 'top-end'
      } else {
        tooltipPlacement.value = 'bottom-end'
      }
    }
  })
})
</script>

<template>
  <span v-if="isShowTimeBlock && msg.timeBlock" class="send-time-block">{{ msg.timeBlock }}</span>
  <div :class="chatCls">
    <div class="chat-item-avatar">
      <img :src="msg.fromUser.avatar || defaultAvatar" />
    </div>
    <div class="chat-item-box" ref="boxRef">
      <div class="chat-item-user-info">
        <el-tooltip
          effect="dark"
          :content="msg.fromUser?.badge?.describe"
          :placement="isCurrentUser ? 'top-end' : 'top-start'"
        >
          <img
            v-show="msg.fromUser?.badge?.img"
            class="user-badge"
            :src="(isCurrentUser ? myBadge : undefined) ?? msg.fromUser?.badge?.img"
          />
        </el-tooltip>
        <span class="user-name">{{ msg.fromUser.username }}</span>
        <span class="user-ip">({{ msg.fromUser.locPlace || '未知' }})</span>
        <span class="send-time" v-if="isShowTime">{{ formatTimestamp(msg.message.sendTime) }}</span>
      </div>
      <el-tooltip
        effect="light"
        popper-class="option-tooltip"
        :trigger="tooltipTrigger"
        :placement="tooltipPlacement || 'bottom-end'"
        :offset="0"
        :hide-after="0"
        :show-arrow="false"
        :teleported="false"
      >
        <template #content>
          <MsgOption :msg="msg" />
        </template>
        <div class="chat-item-content" ref="renderMsgRef" @contextmenu.prevent.stop="handleRightClick($event, msg)">
          <RenderMsg :text="msg.message.content.trim()" :url-map="msg.message.urlTitleMap" :is-me="isCurrentUser" />
        </div>
      </el-tooltip>
      <div
        v-if="msg.message.reply"
        class="chat-item-reply"
        :class="{ pointer: msg.message.reply.canCallback }"
        @click="scrollToMsg(msg.message)"
      >
        <i class="can-scroll-icon" v-if="msg.message.reply.canCallback" />
        <span class="ellipsis"> {{ msg.message.reply.username }}: {{ msg.message.reply.content }} </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />

<style lang="scss">
.option-tooltip {
  z-index: 3;
  padding: 0;
  color: #fff;
  background: none !important;
  border: none !important;
}
</style>
