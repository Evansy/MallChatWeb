import type { Directive } from 'vue'
import { watchEffect } from 'vue'

import { useUserStore } from '@/stores/user'

const vLoginShow: Directive = {
  mounted(el) {
    const userStore = useUserStore()
    watchEffect(() => {
      if (!userStore.isSign) {
        el?.remove()
      }
    })
  },
}

export default vLoginShow
