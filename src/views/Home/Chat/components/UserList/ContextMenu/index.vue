<script setup lang="ts">
import { computed } from 'vue'
import apis from '@/services/apis'
import { ContextMenu, ContextMenuItem, type MenuOptions } from '@imengyu/vue3-context-menu'
import { useUserStore } from '@/stores/user'
import { useGlobalStore } from '@/stores/global'
import { PowerEnum } from '@/enums'
import eventBus from '@/utils/eventBus'

const props = defineProps<{
  // 消息体
  uid: number
  // 菜单设置-其它的参数透传
  options?: MenuOptions
}>()

const userInfo = useUserStore()?.userInfo
const globalStore = useGlobalStore()
const isAdmin = computed(() => userInfo?.power === PowerEnum.ADMIN)
const onAtUser = (uid: number, ignoreCheck: boolean) =>
  eventBus.emit('onSelectPerson', { uid, ignoreCheck })

// 拉黑用户
const onBlockUser = async () => {
  const uid = props.uid
  if (uid) {
    await apis.blockUser({ uid }).send()
  }
}
// 添加好友
const onAddFriend = async () => {
  globalStore.addFriendModalInfo.show = true
  globalStore.addFriendModalInfo.uid = props.uid
}
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
    <ContextMenuItem label="艾特Ta" @click="onAtUser?.(props.uid, true)" v-login-show>
      <template #icon> <span class="icon">@</span> </template>
    </ContextMenuItem>
    <ContextMenuItem v-if="isAdmin" label="拉黑(管理)" @click="onBlockUser">
      <template #icon>
        <Icon icon="lahei" :size="13" />
      </template>
    </ContextMenuItem>
    <ContextMenuItem vLoginShow label="添加好友" @click="onAddFriend">
      <template #icon>
        <Icon icon="tianjia" :size="13" />
      </template>
    </ContextMenuItem>
  </ContextMenu>
</template>

<style lang="scss" src="./styles.scss" />
