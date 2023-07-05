import type { Directive } from 'vue'

import { useUserStore } from '@/stores/user'
const isSign = () => {
  const userStore = useUserStore()
  return userStore.isSign
}

const vLoginShow: Directive = {
  mounted(el) {
    if (!isSign()) {
      el?.remove()
    }
  },
}

export default vLoginShow
