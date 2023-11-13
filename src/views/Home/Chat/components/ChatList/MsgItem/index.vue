<script setup lang="ts">
import { computed, inject, nextTick, onMounted, reactive, ref, type Ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { pageSize, useChatStore } from '@/stores/chat'
import { formatTimestamp } from '@/utils/computedTime'
import { useBadgeInfo, useUserInfo } from '@/hooks/useCached'
import type { CacheUserItem, MessageType, MsgType } from '@/services/types'
import { useElementVisibility } from '@vueuse/core'
import type { TooltipTriggerType } from 'element-plus/es/components/tooltip/src/trigger'
import { useLikeToggle } from '@/hooks/useLikeToggle'
import { MsgEnum } from '@/enums'
import eventBus from '@/utils/eventBus'
import { useGlobalStore } from '@/stores/global'

import MsgOption from '../MsgOption/index.vue'
import ContextMenu from '../ContextMenu/index.vue'
import UserContextMenu from '../UserContextMenu/index.vue'
import UserCard from '@/views/Home/Chat/components/ChatList/MsgItem/components/UserCard/UserCard.vue'

const props = withDefaults(
  defineProps<{
    // 消息体
    msg: MessageType
    // 是否显示时间
    isShowTime?: boolean
    // 是否显示时间段
    isShowTimeBlock?: boolean
    // 消息气泡模式：左右分布-spread、左对齐-left、右对齐-right
    bubbleMode?: string
    // 消息气泡操作触发方式
    tooltipTrigger?: TooltipTriggerType
  }>(),
  {
    isShowTime: true,
    isShowTimeBlock: true,
    bubbleMode: 'spread',
    tooltipTrigger: () => 'hover',
  },
)

// 多根元素的时候，不加这个透传属性会报 warning
defineOptions({ inheritAttrs: false })

// 只能对一级 props 进行 toRefs 结构，否则会丢失响应
const message = computed(() => props.msg.message)
const fromUser = computed(() => props.msg.fromUser)

const userStore = useUserStore()
const chatStore = useChatStore()
const globalStore = useGlobalStore()
const userInfo = useUserInfo(fromUser.value.uid)
const wearingItemId = computed(() => userInfo?.value?.wearingItemId)
const badgeInfo = useBadgeInfo(wearingItemId)
const isCurrentUser = computed(() => fromUser.value.uid === userStore?.userInfo.uid)
const chatCls = computed(() => ({
  'chat-item': true,
  'is-me': isCurrentUser.value,
  'right': (isCurrentUser.value && props.bubbleMode === 'spread') || props.bubbleMode === 'right',
}))

const renderMsgRef = ref<HTMLElement | null>(null)
const boxRef = ref<HTMLElement | null>(null)
const tooltipPlacement = ref()
const readCount = reactive<{ read: number; unread: number | null }>({ read: 0, unread: null })
const virtualListRef = inject<Ref>('virtualListRef')
const isShowMenu = ref(false) // 是否显示菜单
const isShowUserMenu = ref(false) // 是否显示用户名及头像右键菜单
// 弹出定位
const menuOptions = ref({ x: 0, y: 0 })
const { isLike, isDisLike, likeCount, dislikeCount, onLike, onDisLike } = useLikeToggle(
  props.msg.message,
)
const isRecall = computed(() => [MsgEnum.RECALL, MsgEnum.SYSTEM].includes(message.value.type))

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
  // perf: 未登录时，禁用右键菜单功能
  if (!userStore.isSign) {
    return
  }

  // TODO：看它源码里提供了一个transformMenuPosition函数可以控制在容器范围内弹窗 我试验了一下报错
  // https://github.com/imengyu/vue3-context-menu/blob/f91a4140b4a425fa2770449a8be3570836cdfc23/examples/views/ChangeContainer.vue#LL242C5-L242C5
  const { x, y } = e
  menuOptions.value.x = x
  menuOptions.value.y = y
  isShowMenu.value = true
}

/** 右键菜单 */
const handleUserRightClick = (e: MouseEvent) => {
  // perf: 未登录时，禁用右键菜单功能
  if (!userStore.isSign || isCurrentUser.value) {
    return
  }

  // TODO：看它源码里提供了一个transformMenuPosition函数可以控制在容器范围内弹窗 我试验了一下报错
  // https://github.com/imengyu/vue3-context-menu/blob/f91a4140b4a425fa2770449a8be3570836cdfc23/examples/views/ChangeContainer.vue#LL242C5-L242C5
  const { x, y } = e
  menuOptions.value.x = x
  menuOptions.value.y = y
  isShowUserMenu.value = true
}

const msgVisibleEl = ref(null)

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

    const targetIsVisible = useElementVisibility(msgVisibleEl)
    const msg = props.msg.message
    // 自己的消息, 且不是撤回/系统消息，才监听未读数计算
    if (
      isCurrentUser.value &&
      msgVisibleEl &&
      ![MsgEnum.RECALL, MsgEnum.SYSTEM].includes(msg.type)
    ) {
      // 做元素进入退出视口监听，在视口内的自己的消息就做
      // ~~5分钟内每10s中查询一次已读数~~
      watch(targetIsVisible, (visible) => {
        if (visible) {
          eventBus.emit('onAddReadCountTask', { msgId: props.msg.message.id })
        } else {
          eventBus.emit('onRemoveReadCountTask', { msgId: props.msg.message.id })
        }
      })
    }
  })

  // 已读数
  eventBus.on('onGetReadCount', (res) => {
    const currentMsgCount = res.get(props.msg.message.id)
    if (currentMsgCount) {
      readCount.read = currentMsgCount.readCount
      readCount.unread = currentMsgCount.unReadCount
    }
  })
})

const currentReadList = (msgId: number) => {
  // 全部已读禁止打开弹窗。
  if (readCount.unread === 0) return
  globalStore.currentReadUnreadList.msgId = msgId
  globalStore.currentReadUnreadList.show = true
}
</script>

<template>
  <span v-if="isShowTimeBlock && msg.timeBlock" class="send-time-block">{{ msg.timeBlock }}</span>
  <span v-if="isRecall" class="send-time-block">{{ message.body }}</span>
  <div ref="msgVisibleEl">
    <transition name="remove">
      <div :class="chatCls" v-if="!isRecall">
        <el-popover placement="right" trigger="hover">
          <template #reference>
            <!-- 用户头像 -->
            <Avatar
              :src="userInfo.avatar"
              @contextmenu.prevent.stop="handleUserRightClick($event)"
            />
          </template>
          <UserCard :user="userInfo as CacheUserItem" />
        </el-popover>
        <div class="chat-item-box" ref="boxRef">
          <div class="chat-item-user-info">
            <!-- 用户徽章悬浮说明 -->
            <el-tooltip
              effect="dark"
              :content="badgeInfo?.describe"
              :placement="isCurrentUser ? 'top-end' : 'top-start'"
              :teleported="false"
            >
              <!-- 用户徽章 -->
              <img v-show="badgeInfo?.img" class="user-badge" :src="badgeInfo?.img" />
            </el-tooltip>
            <!-- 用户名 -->
            <span class="user-name" @contextmenu.prevent.stop="handleUserRightClick($event)">
              {{ userInfo.name }}
            </span>
            <!-- 消息归属地 -->
            <span class="user-ip">({{ userInfo.locPlace || '未知' }})</span>
            <!-- 消息发送时间 -->
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
            :show-arrow="false"
            :teleported="false"
          >
            <!-- 消息的操作，点赞回复那些 -->
            <template #content>
              <MsgOption :msg="msg" />
            </template>
            <div
              ref="renderMsgRef"
              :class="['chat-item-content', { uploading: msg?.loading }]"
              @contextmenu.prevent.stop="handleRightClick($event)"
            >
              <!-- 这里是未读数计算 -->
              <div
                v-if="isCurrentUser"
                @click="currentReadList(msg.message.id)"
                class="chat-item-read-count"
                :class="{
                  'is-gray': readCount.unread === 0,
                }"
              >
                <span class="chat-item-read-count-text" v-if="readCount.unread !== 0">
                  {{ readCount.read }}
                </span>
                <el-icon v-else>
                  <IEpCheck />
                </el-icon>
              </div>
              <!-- 消息加载中 -->
              <Icon v-if="msg?.loading" icon="loading" :size="20" spin />
              <!-- 渲染消息内容体 -->
              <RenderMessage :message="message" />
            </div>
          </el-tooltip>
          <!-- 消息回复部分 -->
          <div
            v-if="message.body?.reply"
            class="chat-item-reply"
            :class="{ pointer: message.body.reply.canCallback }"
            @click="scrollToMsg(message)"
          >
            <Icon icon="totop" v-if="message.body.reply.canCallback" :size="12" />
            <span class="ellipsis">
              {{ message.body.reply.username }}: {{ message.body.reply.body }}
            </span>
          </div>
          <!-- 点赞数量和倒赞数量及动画 -->
          <div v-if="likeCount + dislikeCount > 0" class="extra">
            <transition name="fade">
              <span
                v-if="likeCount > 0"
                :class="['extra-item like', { active: isLike }]"
                v-login="onLike"
              >
                <Icon icon="like" />
                <transition name="count-up" mode="out-in">
                  <span class="count" :key="likeCount">{{ likeCount }}</span>
                </transition>
              </span>
            </transition>
            <transition name="fade">
              <span
                v-if="dislikeCount > 0"
                :class="['extra-item dlike', { active: isDisLike }]"
                v-login="onDisLike"
              >
                <Icon icon="dislike" :size="17" />
                <transition name="count-up" mode="out-in">
                  <span class="count" :key="dislikeCount">{{ dislikeCount }}</span>
                </transition>
              </span>
            </transition>
          </div>
        </div>
      </div>
    </transition>
  </div>
  <ContextMenu v-model:show="isShowMenu" :options="menuOptions" :msg="msg" />
  <UserContextMenu v-model:show="isShowUserMenu" :options="menuOptions" :uid="msg.fromUser.uid" />
</template>

<style lang="scss" src="./styles.scss" />

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
