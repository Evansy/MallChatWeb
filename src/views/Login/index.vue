<script setup lang="ts">
import { onMounted, computed, watchEffect, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useWsLoginStore, LoginStatus } from '@/stores/ws'
import { SuccessFilled } from '@element-plus/icons-vue'
import QrCode from 'qrcode.vue'

const loginStore = useWsLoginStore()
const router = useRouter()
const loginInfo = computed(() => loginStore.loginQrCode)
const loginStatus = computed(() => loginStore.loginStatus)

onMounted(() => {
  // 获取登录二维码
  loginStore.getLoginQrCode()
})
// 监听登录成功
watchEffect(() => {
  if (loginStatus.value === LoginStatus.Success) {
    router.replace('/')
  }
})
// 离开登录页销毁登录 state
onBeforeUnmount(() => {
  loginStore.resetLoginState()
})
</script>

<template>
  <main class="login_box">
    <h2 class="login_title">MallChat</h2>
    <p class="login_slogan">边聊边买，岂不快哉~</p>
    <div class="login_qrcode_wrapper" v-loading="!loginInfo">
      <QrCode class="login_qrcode" v-if="loginInfo" :value="loginInfo" :size="328" :margin="5" />
    </div>

    <p class="login_desc" v-if="loginStatus === LoginStatus.Waiting">
      <ElIcon :size="32" class="login_desc_icon" color="#67c23a"><SuccessFilled /></ElIcon>
      扫码成功~，点击“登录”继续登录
    </p>
    <p class="login_desc" v-if="loginStatus === LoginStatus.Init">扫描二维码登录~</p>
  </main>
</template>

<style lang="scss" src="./styles.scss" scoped />
