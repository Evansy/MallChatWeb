import { ref, reactive } from 'vue'
import apis from '@/services/apis'
import { defineStore } from 'pinia'
import { useCachedStore } from '@/stores/cached'
import type { UserItem } from '@/services/types'
import { pageSize } from './chat'
import cloneDeep from 'lodash/cloneDeep'
import { OnlineEnum } from '@/enums'
import type { CacheUserReq } from '@/services/types'
import { uniqueUserList } from '@/utils/unique'

const sorAction = (pre: UserItem, next: UserItem) => {
  if (pre.activeStatus === OnlineEnum.ONLINE && next.activeStatus === OnlineEnum.ONLINE) {
    return next.lastOptTime < pre.lastOptTime ? -1 : 1
  } else if (pre.activeStatus !== OnlineEnum.ONLINE && next.activeStatus !== OnlineEnum.ONLINE) {
    return next.lastOptTime < pre.lastOptTime ? -1 : 1
  } else if (pre.activeStatus === OnlineEnum.ONLINE && next.activeStatus !== OnlineEnum.ONLINE) {
    return -1
  } else if (pre.activeStatus !== OnlineEnum.ONLINE && next.activeStatus === OnlineEnum.ONLINE) {
    return 1
  } else {
    return next.lastOptTime < pre.lastOptTime ? -1 : 1
  }
}

export const useGroupStore = defineStore('group', () => {
  const cachedStore = useCachedStore()
  // 消息列表
  const userList = ref<UserItem[]>([])
  const isLast = ref(false)
  const loading = ref(true)
  const cursor = ref()
  const countInfo = reactive({ onlineNum: 0, totalNum: 0 })

  // 移动端控制显隐
  const showGroupList = ref(false)

  // 获取群成员
  const getGroupUserList = async () => {
    const data = await apis.getGroupList({ params: { pageSize, cursor: cursor.value } }).send()
    if (!data) return
    const tempNew = cloneDeep(uniqueUserList([...data.list, ...userList.value]))
    tempNew.sort(sorAction)
    userList.value = tempNew
    cursor.value = data.cursor
    isLast.value = data.isLast
    loading.value = false

    /** 收集需要请求用户详情的 uid */
    const uidCollectYet: Set<number> = new Set() // 去重用
    const uidCollects: CacheUserReq[] = []
    const collectUidItem = (uid: number) => {
      if (uidCollectYet.has(uid)) return
      const cacheUser = cachedStore.userCachedList[uid]
      uidCollects.push({ uid, lastModifyTime: cacheUser?.lastModifyTime })
      // 添加收集过的 uid
      uidCollectYet.add(uid)
    }
    data.list?.forEach((user) => collectUidItem(user.uid))
    // 获取用户信息缓存
    cachedStore.getBatchUserInfo(uidCollects)
  }

  // 获取群成员数量统计
  const getCountStatistic = async () => {
    const data = await apis.getMemberStatistic().send()
    countInfo.onlineNum = data.onlineNum
    countInfo.totalNum = data.totalNum
  }

  // 默认执行一次
  getGroupUserList()
  getCountStatistic()

  // 加载更多群成员
  const loadMore = async () => {
    if (isLast.value) return
    await getGroupUserList()
  }

  // 更新用户在线状态
  const batchUpdateUserStatus = (items: UserItem[]) => {
    const tempNew = cloneDeep(userList.value)
    for (let index = 0, len = items.length; index < len; index++) {
      const curUser = items[index]
      const findIndex = tempNew.findIndex((item) => item.uid === curUser.uid)
      findIndex > -1 && (tempNew[findIndex].activeStatus = curUser.activeStatus)
    }
    tempNew.sort(sorAction)
    userList.value = tempNew
  }

  // 过滤掉小黑子
  const filterUser = (uid: number) => {
    if (typeof uid !== 'number') return
    userList.value = userList.value.filter((item) => item.uid !== uid)
  }

  return {
    userList,
    loading,
    loadMore,
    getGroupUserList,
    countInfo,
    batchUpdateUserStatus,
    showGroupList,
    filterUser,
  }
})
