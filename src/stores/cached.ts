import { reactive } from 'vue'
import { defineStore } from 'pinia'
import apis from '@/services/apis'
import type { CacheUserItem, CacheUserReq, CacheBadgeItem, CacheBadgeReq } from '@/services/types'
import { isDiffNow10Min } from '@/utils/computedTime'

export const useCachedStore = defineStore(
  'cached',
  () => {
    const userCachedList = reactive<Record<number, Partial<CacheUserItem>>>({})
    const badgeCachedList = reactive<Record<number, Partial<CacheBadgeItem>>>({})

    /** 批量获取用户详细信息 */
    const getBatchUserInfo = async (users: CacheUserReq[]) => {
      // 没有 lastModifyTime 的要更新，lastModifyTime 距离现在 10 分钟已上的也要更新
      const result = users.filter(
        (item) => !item.lastModifyTime || isDiffNow10Min(item.lastModifyTime),
      )
      if (!result.length) return
      const itemIdSet: Set<number> = new Set()
      const itemIds: CacheBadgeReq[] = []
      const data = await apis.getUserInfoBatch(result).send()
      data?.forEach((item) => {
        // 更新最后更新时间。
        const curItemResult = {
          ...(item?.needRefresh ? item : userCachedList[item.uid]),
          needRefresh: undefined,
          lastModifyTime: Date.now(),
        }
        userCachedList[item.uid] = curItemResult

        // 收集徽章 id并缓存
        // 可以改成 itemIds，可以更快收集完成。
        const wearingItemId = item.wearingItemId
        if (wearingItemId && !itemIdSet.has(wearingItemId)) {
          const cacheUser = badgeCachedList[wearingItemId]
          itemIds.push({ itemId: wearingItemId, lastModifyTime: cacheUser?.lastModifyTime })
        }
      })
      // 批量请求徽章详情
      getBatchBadgeInfo(itemIds)
    }

    /** 批量获取用户徽章详细信息 */
    const getBatchBadgeInfo = async (badges: CacheBadgeReq[]) => {
      // 没有 lastModifyTime 的要更新，lastModifyTime 距离现在 10 分钟已上的也要更新
      const result = badges.filter(
        (item) => !item.lastModifyTime || isDiffNow10Min(item.lastModifyTime),
      )
      if (!result.length) return
      const data = await apis.getBadgesBatch(result).send()
      data?.forEach(
        (item) =>
          // 更新最后更新时间。
          (badgeCachedList[item.itemId] = {
            ...(item?.needRefresh ? item : badgeCachedList[item.itemId]),
            needRefresh: undefined,
            lastModifyTime: Date.now(),
          }),
      )
    }

    /** 全量初始化用户基础信息 */
    const initAllUserBaseInfo = async () => {
      if (localStorage.getItem('IS_INIT_USER_BASE') === null) {
        await getAllUserBaseInfo()
        localStorage.setItem('IS_INIT_USER_BASE', 'true')
      }
    }

    const getAllUserBaseInfo = async () => {
      const data = await apis.getAllUserBaseInfo({ params: { roomId: 1 } }).send()
      data?.forEach((item) => (userCachedList[item.uid] = item))
    }

    return {
      userCachedList,
      badgeCachedList,
      getBatchUserInfo,
      getBatchBadgeInfo,
      initAllUserBaseInfo,
    }
  },
  { persist: true },
)
