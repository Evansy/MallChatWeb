import { computed, toValue } from 'vue'
import type { ComputedRef } from 'vue'
import { useCachedStore } from '@/stores/cached'

/**
 * 统一获取用户信息 hook
 * @param uid 用户 ID
 * @description 引入该Hook后，可响应式获取用户信息
 */
export const useUserInfo = (uid?: number | ComputedRef<number | undefined>) => {
  const cachedStore = useCachedStore()
  const userInfo = computed(() => (uid && cachedStore.userCachedList[toValue(uid as number)]) || {})
  return userInfo
}

/**
 * 统一获取用户徽章信息 hook
 * @param itemId 用户徽章ID
 * @description 引入该Hook后，可响应式获取用户徽章信息
 */
export const useBadgeInfo = (itemId?: number | ComputedRef<number | undefined>) => {
  const cachedStore = useCachedStore()
  const badgeInfo = computed(
    () => (itemId && cachedStore.badgeCachedList[toValue(itemId as number)]) || {},
  )
  return badgeInfo
}
