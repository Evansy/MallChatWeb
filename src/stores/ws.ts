import { ref } from 'vue'
import { defineStore } from 'pinia'

import wsIns from '@/utils/websocket'
import { WsRequestMsgType } from '@/utils/wsType'

export enum LoginStatus {
  Init,
  Waiting,
  Success,
}

export const useWsLoginStore = defineStore('wsLogin', () => {
  const loginQrCode = ref<string>()
  const showLogin = ref(false)
  const loginStatus = ref(LoginStatus.Init)
  function getLoginQrCode() {
    wsIns.send({ type: WsRequestMsgType.RequestLoginQrCode })
  }
  function resetLoginState() {
    loginQrCode.value = undefined
    loginStatus.value = LoginStatus.Init
  }

  return {
    loginQrCode,
    loginStatus,
    showLogin,
    resetLoginState,
    getLoginQrCode,
  }
})
