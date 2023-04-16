<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useWsLoginStore, LoginStatus } from '@/stores/ws'
import QrCode from 'qrcode.vue'

const loginStore = useWsLoginStore()
const visible = computed({
  get() {
    return loginStore.showLogin
  },
  set(value) {
    loginStore.showLogin = value
  },
})

const loginInfo = computed(() => loginStore.loginQrCode)
const loginStatus = computed(() => loginStore.loginStatus)

onMounted(() => {
  // 获取登录二维码
  loginStore.getLoginQrCode()
})
</script>

<template>
  <ElDialog class="login_box_modal" :width="376" v-model="visible" center>
    <div class="login_box">
      <h2 class="login_title">MallChat</h2>
      <p class="login_slogan">边聊边买，岂不快哉~</p>
      <div class="login_qrcode_wrapper" v-loading="!loginInfo">
        <QrCode class="login_qrcode" v-if="loginInfo" :value="loginInfo" :size="328" :margin="5" />
      </div>

      <p class="login_desc" v-if="loginStatus === LoginStatus.Waiting">
        <ElIcon :size="32" class="login_desc_icon" color="#67c23a"><IEpSuccessFilled /></ElIcon>
        扫码成功~，点击“登录”继续登录
      </p>
      <p class="login_desc" v-if="loginStatus === LoginStatus.Init">扫描二维码登录~</p>
    </div>
  </ElDialog>
</template>

<style lang="scss" src="./styles.scss" scoped />
