<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRefs, type Ref, type PropType, inject } from 'vue'
import { useUserStore } from '@/stores/user'
import { useChatStore, pageSize } from '@/stores/chat'
import { formatTimestamp } from '@/utils/computedTime'
import { useUserInfo, useBadgeInfo } from '@/hooks/useCached'
import type { MessageType, MsgType } from '@/services/types'
import defaultAvatar from '@/assets/avatars/default.png'
import RenderMsg from '@/components/RenderMsg.vue'
import MsgOption from '../MsgOption/index.vue'
import ContextMenu from '../ContextMenu/index.vue'
import type { TooltipTriggerType } from 'element-plus/es/components/tooltip/src/trigger'
import { useLikeToggle } from '@/hooks/useLikeToggle'
import { MsgTypeType } from '@/services/types'

const props = defineProps({
  // 消息体
  msg: {
    type: Object as PropType<MessageType>,
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

const { message, fromUser } = toRefs(props.msg)

const userStore = useUserStore()
const chatStore = useChatStore()
const userInfo = useUserInfo(fromUser.value.uid)
const wearingItemId = computed(() => userInfo?.value?.wearingItemId)
const badgeInfo = useBadgeInfo(wearingItemId)
const isCurrentUser = computed(() => props.msg?.fromUser.uid === userStore?.userInfo.uid)
const chatCls = computed(() => ({
  'chat-item': true,
  'is-me': isCurrentUser.value,
  'right': (isCurrentUser.value && props.bubbleMode === 'spread') || props.bubbleMode === 'right',
}))

const renderMsgRef = ref<HTMLElement | null>(null)
const boxRef = ref<HTMLElement | null>(null)
const tooltipPlacement = ref()
const virtualListRef = inject<Ref>('virtualListRef')
const isShowMenu = ref(false) // 是否显示菜单
// 弹出定位
const menuOptions = ref({
  x: 0,
  y: 0,
})
const { isLike, isDisLike, likeCount, dislikeCount, onLike, onDisLike } = useLikeToggle(
  props.msg.message,
)
const isRecall = computed(() => message.value.type === MsgTypeType.Recall)

// 滚动到消息
const scrollToMsg = async (msg: MsgType) => {
  const { id } = msg
  const { reply } = msg.body
  // 不允许跳转不跳转，目前是 100 条(后端配置)以内允许跳转
  if (!reply || !reply.canCallback) return
  // 如果消息已经加载过了，就直接跳转
  const index = chatStore.getMsgIndex(reply.id)
  if (index > -1) {
    virtualListRef?.value?.scrollToIndex(index, true, 12)
  } else {
    // 如果没有加载过，就先加载，然后跳转
    const curMsgIndex = chatStore.getMsgIndex(id)
    // +1 是在 reply.gapCount - curMsgIndex 刚好是 pageSize 倍数的时候，跳转到的是第一条消息，会触发加载更多，样式会乱掉
    const needLoadPageSize = Math.ceil((reply.gapCount - curMsgIndex + 1) / pageSize) * pageSize
    // 加载数据
    await chatStore.loadMore(needLoadPageSize)
    // 跳转
    // FIXME 这时候新加载消息了，所以会有滚动冲突，故不加动画效果，否则会很怪异。
    setTimeout(virtualListRef?.value?.scrollToIndex(chatStore.getMsgIndex(reply.id), false, 12), 0)
    // TODO 跳转到的消息 高亮一下
  }
}

/** 右键菜单 */
const handleRightClick = (e: MouseEvent) => {
  // TODO：看它源码里提供了一个transformMenuPosition函数可以控制在容器范围内弹窗 我试验了一下报错
  // https://github.com/imengyu/vue3-context-menu/blob/f91a4140b4a425fa2770449a8be3570836cdfc23/examples/views/ChangeContainer.vue#LL242C5-L242C5
  const { x, y } = e
  menuOptions.value.x = x
  menuOptions.value.y = y
  isShowMenu.value = true
}

onMounted(() => {
  nextTick(() => {
    if (renderMsgRef.value && boxRef.value) {
      const renderMsgWidth = renderMsgRef.value.clientWidth
      const boxWidth = boxRef.value.clientWidth
      if (renderMsgWidth + 150 <= boxWidth) {
        tooltipPlacement.value = 'right-start'
      } else if (props.msg.message.body.reply) {
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
  <span v-if="isRecall" class="send-time-block">{{ message.body }}</span>
  <transition name="remove">
    <div :class="chatCls" v-if="!isRecall">
      <div class="chat-item-avatar">
        <img :src="userInfo.avatar || defaultAvatar" />
      </div>
      <div class="chat-item-box" ref="boxRef">
        <div class="chat-item-user-info">
          <el-tooltip
            effect="dark"
            :content="badgeInfo?.describe"
            :placement="isCurrentUser ? 'top-end' : 'top-start'"
          >
            <img v-show="badgeInfo?.img" class="user-badge" :src="badgeInfo?.img" />
          </el-tooltip>
          <span class="user-name">{{ userInfo.name }}</span>
          <span class="user-ip">({{ userInfo.locPlace || '未知' }})</span>
          <span class="send-time" v-if="isShowTime">
            {{ formatTimestamp(msg.message.sendTime) }}
          </span>
        </div>
        <el-tooltip
          effect="light"
          popper-class="option-tooltip"
          :trigger="tooltipTrigger"
          :placement="tooltipPlacement || 'bottom-end'"
          :offset="2"
          :hide-after="30"
          :show-arrow="false"
          :teleported="false"
        >
          <template #content>
            <MsgOption :msg="msg" />
          </template>
          <div
            class="chat-item-content"
            ref="renderMsgRef"
            @contextmenu.prevent.stop="handleRightClick($event)"
          >
            <RenderMsg
              :text="message.body.content"
              :url-map="message.body.urlTitleMap"
              :is-me="isCurrentUser"
            />
          </div>
        </el-tooltip>
        <div
          v-if="message.body.reply"
          class="chat-item-reply"
          :class="{ pointer: message.body.reply.canCallback }"
          @click="scrollToMsg(message)"
        >
          <i class="can-scroll-icon" v-if="message.body.reply.canCallback" />
          <span class="ellipsis">
            {{ message.body.reply.username }}: {{ message.body.reply.body }}
          </span>
        </div>
        <div v-if="likeCount + dislikeCount > 0" class="extra">
          <transition name="fade">
            <span
              v-if="likeCount > 0"
              :class="['extra-item like', { active: isLike }]"
              @click="onLike"
            >
              <IconLike />
              <transition name="count-up" mode="out-in">
                <span class="count" :key="likeCount">{{ likeCount }}</span>
              </transition>
            </span>
          </transition>
          <transition name="fade">
            <span
              v-if="dislikeCount > 0"
              :class="['extra-item dlike', { active: isDisLike }]"
              @click="onDisLike"
            >
              <IconDislike />
              <transition name="count-up" mode="out-in">
                <span class="count" :key="dislikeCount">{{ dislikeCount }}</span>
              </transition>
            </span>
          </transition>
        </div>
      </div>
    </div>
  </transition>
  <ContextMenu v-model:show="isShowMenu" :options="menuOptions" :msg="msg" />
</template>

<style lang="scss" src="./styles.scss" scoped />

<style lang="scss">
.option-tooltip {
  z-index: 3;
  padding: 0;
  line-height: 12px;
  color: var(--font-main);
  background-color: var(--background-2) !important;
  border: none !important;
}
</style>
