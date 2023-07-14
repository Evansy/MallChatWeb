<script setup lang="ts">
import { toRef, ref } from 'vue'
import type { PropType } from 'vue'
import { OnlineEnum } from '@/enums'
import type { UserItem } from '@/services/types'
import { useUserInfo } from '@/hooks/useCached'
import { useUserStore } from '@/stores/user'
import ContextMenu from '../ContextMenu/index.vue'
const props = defineProps({
  user: {
    type: Object as PropType<UserItem>,
    required: true,
  },
})
const user = toRef(props.user)
const userInfo = useUserInfo(user.value.uid)
const isShowMenu = ref(false) // 是否显示菜单
// 弹出定位
const menuOptions = ref({ x: 0, y: 0 })

/** 右键菜单 */
const handleRightClick = (e: MouseEvent) => {
  // 根据右键菜单上下文分析，未登录时禁用右键菜单功能
  if (!useUserStore().isSign) {
    return
  }

  // TODO：看它源码里提供了一个transformMenuPosition函数可以控制在容器范围内弹窗 我试验了一下报错
  // https://github.com/imengyu/vue3-context-menu/blob/f91a4140b4a425fa2770449a8be3570836cdfc23/examples/views/ChangeContainer.vue#LL242C5-L242C5
  const { x, y } = e
  menuOptions.value.x = x
  menuOptions.value.y = y
  isShowMenu.value = true
}
</script>

<template>
  <li class="user-list-item" :key="user.uid" @contextmenu.prevent.stop="handleRightClick($event)">
    <Avatar
      :src="userInfo.avatar"
      :size="24"
      showStatus
      :online="user.activeStatus === OnlineEnum.ONLINE"
    />
    {{ userInfo.name }}
    <ContextMenu v-model:show="isShowMenu" :options="menuOptions" :uid="(userInfo.uid as number)" />
  </li>
</template>

<style lang="scss" src="./styles.scss" scoped />
