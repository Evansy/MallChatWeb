<script setup lang="ts">
import { computed, type PropType, inject } from 'vue'
import apis from '@/services/apis'
import { ContextMenu, ContextMenuItem, type MenuOptions } from '@imengyu/vue3-context-menu'
import { useUserStore } from '@/stores/user'
import { useCachedStore } from '@/stores/cached'
import { PowerEnum } from '@/enums'
import type { CacheUserItem } from '@/services/types'

const focusMsgInput = inject<() => void>('focusMsgInput')
const onSelectPerson =
  inject<(personItem: CacheUserItem, ignoreContentCheck?: boolean) => void>('onSelectPerson')

const props = defineProps({
  // 消息体
  uid: {
    type: Number,
    required: true,
  },
  // 菜单设置-其它的参数透传
  options: {
    type: Object as PropType<MenuOptions>,
  },
})

const userInfo = useUserStore()?.userInfo
const cachedStore = useCachedStore()
const isAdmin = computed(() => userInfo?.power === PowerEnum.ADMIN)

// 拉黑用户
const onBlockUser = async () => {
  const uid = props.uid
  if (uid) {
    await apis.blockUser({ uid }).send()
  }
}

// @ 用户
const onAtUser = () => {
  // 输入框获取焦点
  focusMsgInput?.()
  // 插入内容
  setTimeout(() => {
    const userItem = cachedStore.userCachedList[props.uid]
    userItem && onSelectPerson?.(userItem as CacheUserItem, true)
  }, 10)
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
    <ContextMenuItem label="at" @click="onAtUser" v-login-show>
      <template #icon> <span class="icon">@</span> </template>
    </ContextMenuItem>
    <ContextMenuItem v-if="isAdmin" label="拉黑(管理)" @click="onBlockUser">
      <template #icon>
        <Icon icon="lahei" :size="13" />
      </template>
    </ContextMenuItem>
  </ContextMenu>
</template>

<style lang="scss" src="./styles.scss" />
