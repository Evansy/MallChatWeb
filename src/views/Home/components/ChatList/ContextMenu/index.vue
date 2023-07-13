<script setup lang="ts">
import { computed, type PropType, inject } from 'vue'
import { ElMessage } from 'element-plus'
import apis from '@/services/apis'
import {
  ContextMenu,
  ContextMenuSeparator,
  ContextMenuItem,
  type MenuOptions,
} from '@imengyu/vue3-context-menu'
import { useUserStore } from '@/stores/user'
import { copyToClip, handleCopyImg } from '@/utils/copy'
import { useChatStore } from '@/stores/chat'
import type { MessageType } from '@/services/types'
import { MsgEnum, PowerEnum } from '@/enums'
import { useEmojiStore } from '@/stores/emoji'
import { useEmojiUpload } from '@/hooks/useEmojiUpload'
import { urlToFile } from '@/utils'

const onAtUser = inject<(uid: number, ignore: boolean) => void>('onSelectPerson')

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

const emojiStore = useEmojiStore()
const { uploadEmoji } = useEmojiUpload()
const userStore = useUserStore()
const userInfo = userStore?.userInfo
const chatStore = useChatStore()
// FIXME 未登录到登录这些监听没有变化。需处理
const isCurrentUser = computed(() => props.msg?.fromUser.uid === userInfo.uid)
const isAdmin = computed(() => userInfo?.power === PowerEnum.ADMIN)
const isShowMenuSeparator = computed(() => userStore.isSign)

// 撤回
const onRecall = async () => {
  const { id } = props.msg.message
  if (id) {
    await apis.recallMsg({ roomId: 1, msgId: id }).send()
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
  const msg = props.msg.message
  if (msg.type === MsgEnum.TEXT) {
    const content = msg.body?.content
    copyToClip(content)
    ElMessage.success('复制成功~')
  }
  if (msg.type === MsgEnum.IMAGE) {
    handleCopyImg(msg.body.url)
    ElMessage.success('复制成功~')
  }
}

// 下载
const download = () => {
  const { body } = props.msg.message
  const url = body?.url
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = body.fileName || '未知文件'
  a.click()
  a.remove()
}

const onAddEmoji = () => {
  const { type, body } = props.msg.message
  if (type === MsgEnum.EMOJI) {
    emojiStore.addEmoji(body.url)
  } else {
    urlToFile(body.url).then((file) => {
      uploadEmoji(file)
    })
  }
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
    <ContextMenuItem label="艾特Ta" @click="onAtUser?.(msg.fromUser.uid, true)" v-login-show>
      <template #icon> <span class="icon">@</span> </template>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="msg.message.type === MsgEnum.TEXT || msg.message.type === MsgEnum.IMAGE"
      label="复制"
      @click="copyContent"
    >
      <template #icon>
        <Icon icon="copy" :size="13" />
      </template>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="
        (msg.message.type === MsgEnum.EMOJI || msg.message.type === MsgEnum.IMAGE) &&
        !isCurrentUser &&
        emojiStore.emojiList.length < 50
      "
      label="添加到表情"
      @click="onAddEmoji"
    >
      <template #icon>
        <Icon icon="aixin" :size="13" />
      </template>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="(isCurrentUser || isAdmin) && !msg.loading"
      label="撤回消息"
      @click="onRecall"
    >
      <template #icon>
        <Icon icon="chehui" :size="14" />
      </template>
    </ContextMenuItem>
    <ContextMenuItem
      v-if="
        (msg.message.type === MsgEnum.FILE || msg.message.type === MsgEnum.IMAGE) && !msg.loading
      "
      label="下载"
      @click="download"
    >
      <template #icon>
        <Icon icon="xiazai" :size="15" />
      </template>
    </ContextMenuItem>
    <ContextMenuSeparator v-if="isShowMenuSeparator" />
    <ContextMenuItem label="删除" @click="onDelete" v-login-show>
      <template #icon>
        <Icon icon="shanchu" :size="13" />
      </template>
    </ContextMenuItem>
    <ContextMenuItem v-if="isAdmin" label="拉黑(管理)" @click="onBlockUser">
      <template #icon>
        <Icon icon="lahei" :size="13" />
      </template>
    </ContextMenuItem>
  </ContextMenu>
</template>

<style lang="scss" src="./styles.scss" />
