<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useGroupStore } from '@/stores/group'
import defaultAvatar from '@/assets/avatars/default.png'
const visible = ref(false)
const userStore = useUserStore()
const groupStore = useGroupStore()

const avatar = computed(() => userStore?.userInfo.avatar)

const showSettingBox = () => (visible.value = true)
const onToMallChat = () => window.open('https://github.com/zongzibinbin/MallChat', '_blank')
const onToMallChatWeb = () => window.open('https://github.com/Evansy/MallChatWeb', '_blank')
const toggleGroupListShow = () => (groupStore.showGroupList = !groupStore.showGroupList)
</script>

<template>
  <aside class="side_toolbar">
    <ElAvatar size="large" class="side_toolbar_avatar" :src="avatar || defaultAvatar" v-login="showSettingBox" />

    <div class="operate-icons">
      <a
        class="operate-icon-link"
        href="https://www.yuque.com/snab/planet/cef1mcko4fve0ur3"
        target="_blank"
        rel="noopener noreferrer"
        title="语雀"
      >
        <i class="operate-icon icon-yuque" /><span class="operate-icon-text">项目文档</span>
      </a>
      <a
        class="operate-icon-link"
        href="https://space.bilibili.com/146719540"
        target="_blank"
        rel="noopener noreferrer"
        title="bilibili"
      >
        <i class="operate-icon icon-bilibili" />
      </a>
      <a
        class="operate-icon-link"
        href="https://mp.weixin.qq.com/s/m1SRsBG96kLJW5mPe4AVGA"
        target="_blank"
        rel="noopener noreferrer"
        title="wechat"
      >
        <i class="operate-icon icon-wechat" />
      </a>
      <a
        class="operate-icon-link"
        target="_blank"
        rel="noopener noreferrer"
        title="MallChatWeb Server"
        v-login="onToMallChat"
      >
        <i class="operate-icon icon-github" /><span class="operate-icon-text">后端源码</span>
      </a>
      <a
        class="operate-icon-link"
        target="_blank"
        rel="noopener noreferrer"
        title="MallChatWeb Web"
        v-login="onToMallChatWeb"
      >
        <i class="operate-icon icon-github" /><span class="operate-icon-text">前端源码</span>
      </a>
    </div>

    <el-icon class="menu-icon" color="#fff" :size="32" @click="toggleGroupListShow"><IEpFold /></el-icon>

    <UserSettingBox v-model="visible" />
  </aside>
</template>

<style lang="scss" src="./styles.scss" scoped />
