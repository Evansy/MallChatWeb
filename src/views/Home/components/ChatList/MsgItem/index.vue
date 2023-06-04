<script setup lang="ts">
import { computed, nextTick, onMounted, ref, type PropType } from 'vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import { useUserStore } from '@/stores/user'
import { formatTimestamp } from '@/utils/computedTime'
import type { MessageItemType } from '@/services/types'
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

/** 右键菜单 */
function handleRightClick(e: MouseEvent, msg: MessageItemType) {
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
      if (renderMsgWidth + 85 <= boxWidth) {
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
        :appendToBody="false"
      >
        <template #content>
          <MsgOption :msg="msg" />
        </template>
        <div class="chat-item-content" ref="renderMsgRef" @contextmenu.prevent.stop="handleRightClick($event, msg)">
          <RenderMsg :text="msg.message.content.trim()" :url-map="msg.message.urlTitleMap" :is-me="isCurrentUser" />
        </div>
      </el-tooltip>
      <div v-if="msg.message.reply" class="chat-item-reply">
        <span class="ellipsis"> {{ msg.message.reply.username }}: {{ msg.message.reply.content }} </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />

<style lang="scss">
.option-tooltip {
  color: #fff;
  padding: 0;
  border: none !important;
  background: none !important;
  z-index: 3;
}
</style>
