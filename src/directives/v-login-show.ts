import type { Directive } from 'vue'
import { watchEffect } from 'vue'

import { useUserStore } from '@/stores/user'

const vLoginShow: Directive = {
  mounted(el: HTMLElement) {
    let display = ''
    const userStore = useUserStore()
    // 一开始获取到的 isSign 就是 false 如果用原始的 el.remove 等 isSign 变成 true 的时候 el 可无法创建出来
    watchEffect(() => {
      if (!userStore.isSign) {
        display = el.style.display
        el.style.display = 'none'
      } else {
        el.style.display = display || 'block'
      }
    })
  },
}

export default vLoginShow
