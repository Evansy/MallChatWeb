<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
const visible = ref(false)
const userStore = useUserStore()

const avatar = computed(() => userStore?.userInfo.avatar)
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
    <div class="operate-icons">
      <a
        class="operate-icon-link"
        href="https://github.com/zongzibinbin/MallChat"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="icon-github" /><span class="operate-icon-text">(server)</span>
      </a>
      <a
        class="operate-icon-link"
        href="https://github.com/Evansy/MallChatWeb"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="icon-github" /><span class="operate-icon-text">(web)</span>
      </a>
    </div>

    <UserSettingBox v-model="visible" />
  </aside>
</template>

<style lang="scss" src="./styles.scss" scoped />
