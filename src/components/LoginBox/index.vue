<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useWsLoginStore, LoginStatus } from '@/stores/ws'
import { SuccessFilled } from '@element-plus/icons-vue'
import QrCode from 'qrcode.vue'
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const loginStore = useWsLoginStore()
const loginInfo = computed(() => loginStore.loginQrCode)
const loginStatus = computed(() => loginStore.loginStatus)

onMounted(() => {
  // 获取登录二维码
  loginStore.getLoginQrCode()
})
</script>

<template>
  <ElDialog class="login-box" v-model="visible" center>
    <div class="login_box">
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
    </div>
  </ElDialog>
</template>

<style lang="scss" src="./styles.scss" scoped />
