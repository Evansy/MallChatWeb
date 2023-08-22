import type { Directive } from 'vue'

import { useContactStore } from '@/stores/contacts'
const isMyFriend = (uid: number) => {
  const contactStore = useContactStore()
  return contactStore.contactsList.some((item) => item.uid === uid)
}

const vFriends: Directive = {
  mounted(el, binding) {
    if (isMyFriend(binding.value)) {
      el?.remove()
    }
  },
}

export default vFriends
