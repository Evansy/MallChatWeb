<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
// import githubIcon from '@/assets/github.svg'
const visible = ref(false)
const userStore = useUserStore()

const avatar = computed(() => userStore?.userInfo.avatar)

const onGithubIconClick = () => {
  window.open('https://github.com/Evansy/MallChatWeb', '_blank')
}
const showSettingBox = () => {
  // 登录了才允许设置个人信息
  userStore.isSign && (visible.value = true)
}
</script>

<template>
  <aside class="side_toolbar">
    <ElAvatar
      size="large"
      class="side_toolbar_avatar"
      :src="avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
      @click="showSettingBox"
    />
    <i class="icon-github" @click="onGithubIconClick" />

    <UserSettingBox v-model="visible" />
  </aside>
</template>

<style lang="scss" src="./styles.scss" scoped />
