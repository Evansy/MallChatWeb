<script setup lang="ts">
import { ContextMenu, ContextMenuItem, type MenuOptions } from '@imengyu/vue3-context-menu'
import { useGlobalStore } from '@/stores/global'
import eventBus from '@/utils/eventBus'

const props = defineProps<{
  // 用户id
  uid: number
  // 菜单设置-其它的参数透传
  options?: MenuOptions
}>()
const globalStore = useGlobalStore()

// 添加好友
const onAddFriend = async () => {
  globalStore.addFriendModalInfo.show = true
  globalStore.addFriendModalInfo.uid = props.uid
}

const onAtUser = (uid: number, ignoreCheck: boolean) =>
  eventBus.emit('onSelectPerson', { uid, ignoreCheck })
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
    <ContextMenuItem vLoginShow v-friends="uid" label="添加好友" @click="onAddFriend">
      <template #icon>
        <Icon icon="tianjia" :size="13" />
      </template>
    </ContextMenuItem>
    <!-- <ContextMenuItem vLoginShow label="发送消息" @click="onAddFriend">
      <template #icon>
        <Icon icon="tianjia" :size="13" />
      </template>
    </ContextMenuItem> -->
  </ContextMenu>
</template>

<style lang="scss" src="./styles.scss" />
