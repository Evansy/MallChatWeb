import type { Directive } from 'vue'

import { useUserStore } from '@/stores/user'
import { useWsLoginStore } from '@/stores/ws'
const handler = (fn: Function) => {
  const userStore = useUserStore()
  const loginStore = useWsLoginStore()
  // 没登录先登录
  if (!userStore.isSign) {
    loginStore.showLogin = true
    return
  }
  fn?.()
}

const vLogin: Directive = {
  mounted(el, binding) {
    if (typeof binding.value !== 'function') return
    el.addEventListener('click', handler.bind(null, binding.value))
  },
  unmounted(el, binding) {
    if (typeof binding.value !== 'function') return
    el.removeEventListener('click', handler.bind(null, binding.value))
  },
}

export default vLogin
