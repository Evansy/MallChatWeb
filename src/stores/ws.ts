import { ref } from 'vue'
import { defineStore } from 'pinia'

import wsIns from '@/utils/websocket'

export enum LoginStatus {
  Init,
  Waiting,
  Success
}

export const useWsLoginStore = defineStore('wsLogin', () => {
  const loginQrCode = ref<string>()
  const loginStatus = ref(LoginStatus.Init)
  function getLoginQrCode() {
    wsIns.send('{type:1}')
  }
  function resetLoginState() {
    loginQrCode.value = undefined
    loginStatus.value = LoginStatus.Init
  }

  return { loginQrCode, loginStatus, resetLoginState, getLoginQrCode }
})
