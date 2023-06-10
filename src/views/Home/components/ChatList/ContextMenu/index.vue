<script setup lang="ts">
import { computed, type PropType } from 'vue'
import apis from '@/services/apis'
import {
  ContextMenu,
  ContextMenuSeparator,
  ContextMenuItem,
  type MenuOptions,
} from '@imengyu/vue3-context-menu'
import { useUserStore } from '@/stores/user'
import { copyToClip } from '@/utils/copy'
import { useChatStore } from '@/stores/chat'
import { PowerType, type MessageType } from '@/services/types'

const props = defineProps({
  // 消息体
  msg: {
    type: Object as PropType<MessageType>,
    required: true,
  },
  // 菜单设置-其它的参数透传
  options: {
    type: Object as PropType<MenuOptions>,
  },
})

const userInfo = useUserStore()?.userInfo
const chatStore = useChatStore()
const isCurrentUser = computed(() => props.msg?.fromUser.uid === userInfo.uid)
const isAdmin = computed(() => userInfo?.power === PowerType.Admin)

// 撤回
const onRecall = async () => {
  const { id } = props.msg.message
  if (id) {
    await apis.recallMsg({ roomId: 0, msgId: id }).send()
    chatStore.updateRecallStatus({ msgId: id })
  }
}

// 拉黑用户
const onBlockUser = async () => {
  const { uid } = props.msg.fromUser
  if (uid) {
    await apis.blockUser({ uid }).send()
  }
}

// 拷贝内容-(此版本未针对不同Body体进行处理)
const copyContent = () => {
  const content = props.msg.message.body?.content
  copyToClip(content)
}

const onDelete = () => chatStore.deleteMsg(props.msg.message.id)
</script>

<template>
  <ContextMenu
    :options="{
      theme: 'dark',
      x: 0,
      y: 0,
      ...props.options,
    }"
  >
    <ContextMenuItem label="复制" @click="copyContent">
      <template #icon>
        <IconCopy class="icon" />
      </template>
    </ContextMenuItem>
    <ContextMenuItem v-if="isCurrentUser || isAdmin" label="撤回消息" @click="onRecall">
      <template #icon>
        <IconRecall class="icon" />
      </template>
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem label="删除" @click="onDelete">
      <template #icon>
        <IconDelete class="icon" />
      </template>
    </ContextMenuItem>
    <ContextMenuItem v-if="isAdmin" label="拉黑(管理)" @click="onBlockUser">
      <template #icon>
        <IconShield class="icon" />
      </template>
    </ContextMenuItem>
  </ContextMenu>
</template>

<style lang="scss" src="./styles.scss" />
