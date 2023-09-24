import { ref, reactive, computed } from 'vue'
import apis from '@/services/apis'
import { defineStore } from 'pinia'
import { useCachedStore } from '@/stores/cached'
import { useGlobalStore } from '@/stores/global'
import type { UserItem, GroupDetailReq } from '@/services/types'
import { pageSize } from './chat'
import cloneDeep from 'lodash/cloneDeep'
import { OnlineEnum } from '@/enums'
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
  const globalStore = useGlobalStore()
  // 消息列表
  const userList = ref<UserItem[]>([])
  const userListOptions = reactive({ isLast: false, loading: true, cursor: '' })
  const currentRoomId = computed(() => globalStore.currentSession.roomId)
  const countInfo = ref<GroupDetailReq>({
    avatar: '',
    groupName: '',
    onlineNum: 0,
    role: 0,
    roomId: currentRoomId.value,
  })

  // 移动端控制显隐
  const showGroupList = ref(false)

  // 获取群成员
  const getGroupUserList = async (refresh = false) => {
    const data = await apis
      .getGroupList({
        params: {
          pageSize,
          cursor: refresh ? undefined : userListOptions.cursor,
          roomId: currentRoomId.value,
        },
      })
      .send()
    if (!data) return
    const tempNew = cloneDeep(
      uniqueUserList(refresh ? data.list : [...data.list, ...userList.value]),
    )
    tempNew.sort(sorAction)
    userList.value = tempNew
    userListOptions.cursor = data.cursor
    userListOptions.isLast = data.isLast
    userListOptions.loading = false

    /** 收集需要请求用户详情的 uid */
    const uidCollectYet: Set<number> = new Set() // 去重用
    data.list?.forEach((user) => uidCollectYet.add(user.uid))
    // 获取用户信息缓存
    cachedStore.getBatchUserInfo([...uidCollectYet])
  }

  // 获取群成员数量统计
  const getCountStatistic = async () => {
    const data = await apis.groupDetail({ id: currentRoomId.value }).send()
    countInfo.value = data
  }

  // 加载更多群成员
  const loadMore = async () => {
    if (userListOptions.isLast) return
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
    userListOptions,
    loadMore,
    getGroupUserList,
    getCountStatistic,
    countInfo,
    batchUpdateUserStatus,
    showGroupList,
    filterUser,
  }
})
