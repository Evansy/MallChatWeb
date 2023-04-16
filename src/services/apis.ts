import type { ListResponse, UserItem, GroupStatisticType, MessageItemType } from '@/services/types'
import type { RequestBody } from 'alova'
import { alovaIns } from './request'
import urls from './urls'

export default {
  getGroupList: (params?: any) => alovaIns.Get<ListResponse<UserItem>, unknown>(urls.getGroupUserList, params),
  getMemberStatistic: () => alovaIns.Get<GroupStatisticType, unknown>(urls.getMemberStatistic),
  getMsgList: (params?: any) => alovaIns.Get<ListResponse<MessageItemType>, unknown>(urls.getMsgList, params),
  sendMsg: (data?: RequestBody) => alovaIns.Post<{ id: number }, unknown>(urls.sendMsg, data),
}
