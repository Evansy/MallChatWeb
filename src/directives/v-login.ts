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
    el.fn = handler.bind(el, binding.value)
    el.addEventListener('click', el.fn)
  },
  unmounted(el, binding) {
    if (typeof binding.value !== 'function') return
    el.removeEventListener('click', el.fn)
  },
}

export default vLogin
