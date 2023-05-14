import { ref, reactive } from 'vue'
import apis from '@/services/apis'
import { defineStore } from 'pinia'
import type { UserItem } from '@/services/types'
import { pageSize } from './chat'
import cloneDeep from 'lodash/cloneDeep'
import { OnlineStatus } from '@/services/types'

const sorAction = (pre: UserItem, next: UserItem) => {
  if (pre.activeStatus === OnlineStatus.Online && next.activeStatus === OnlineStatus.Online) {
    return next.lastOptTime < pre.lastOptTime ? -1 : 1
  } else if (pre.activeStatus !== OnlineStatus.Online && next.activeStatus !== OnlineStatus.Online) {
    return next.lastOptTime < pre.lastOptTime ? -1 : 1
  } else if (pre.activeStatus === OnlineStatus.Online && next.activeStatus !== OnlineStatus.Online) {
    return -1
  } else if (pre.activeStatus !== OnlineStatus.Online && next.activeStatus === OnlineStatus.Online) {
    return 1
  } else {
    return next.lastOptTime < pre.lastOptTime ? -1 : 1
  }
}

export const useGroupStore = defineStore('group', () => {
  // 消息列表
  const userList = ref<UserItem[]>([])
  const isLast = ref(false)
  const loading = ref(true)
  const cursor = ref()
  const countInfo = reactive({ onlineNum: 0, totalNum: 0 })

  // 获取群成员
  const getGroupUserList = async () => {
    const data = await apis.getGroupList({ params: { pageSize, cursor: cursor.value } }).send()
    const tempNew = cloneDeep([...data.list, ...userList.value])
    tempNew.sort(sorAction)
    userList.value = tempNew
    cursor.value = data.cursor
    isLast.value = data.isLast
    loading.value = false
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

  const loadMore = async () => {
    if (isLast.value) return
    await getGroupUserList()
  }

  const batchUpdateUserStatus = (items: UserItem[]) => {
    const tempNew = cloneDeep(userList.value)
    for (let index = 0, len = items.length; index < len; index++) {
      const curUser = items[index]
      const findIndex = tempNew.findIndex((item) => item.uid === curUser.uid)
      findIndex > -1 && (tempNew[findIndex] = curUser)
    }
    tempNew.sort(sorAction)
    userList.value = tempNew
  }

  return { userList, loading, loadMore, getGroupUserList, countInfo, batchUpdateUserStatus }
})
