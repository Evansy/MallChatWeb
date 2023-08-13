import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useGlobalStore = defineStore('global', () => {
  const currentView = ref()
  const currentSession = ref()
  const addFriendModalInfo = reactive<{ show: boolean; uid?: number }>({
    show: false,
    uid: undefined,
  })

  return {
    currentView,
    currentSession,
    addFriendModalInfo,
  }
})
