import type { Directive } from 'vue'

import { useContactStore } from '@/stores/contacts'
import { useUserStore } from '@/stores/user'
const isMyFriend = (uid: number) => {
  const contactStore = useContactStore()
  const userStore = useUserStore()
  const myUid = userStore.userInfo.uid
  // 好友和自己不显示添加好友菜单
  return contactStore.contactsList.some((item) => item.uid === uid) || uid === myUid
}

const vFriends: Directive = {
  mounted(el, binding) {
    if (isMyFriend(binding.value)) {
      el?.remove()
    }
  },
}

export default vFriends
