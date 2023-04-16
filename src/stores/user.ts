import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({})
  const isSign = ref(false)

  return { userInfo, isSign }
})
