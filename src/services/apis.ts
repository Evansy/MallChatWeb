import type {
  ListResponse,
  UserItem,
  GroupStatisticType,
  MessageItemType,
  MarkMsgReq,
  UserInfoType,
  BadgeType,
} from '@/services/types'
import type { RequestBody } from 'alova'
import { alovaIns } from './request'
import urls from './urls'

export default {
  getGroupList: (params?: any) => alovaIns.Get<ListResponse<UserItem>, unknown>(urls.getGroupUserList, params),
  getMemberStatistic: () => alovaIns.Get<GroupStatisticType, unknown>(urls.getMemberStatistic),
  getMsgList: (params?: any) => alovaIns.Get<ListResponse<MessageItemType>, unknown>(urls.getMsgList, params),
  sendMsg: (data?: RequestBody) => alovaIns.Post<MessageItemType, unknown>(urls.sendMsg, data),
  markMsg: (data?: RequestBody) => alovaIns.Put<MarkMsgReq, unknown>(urls.markMsg, data),
  getUserDetail: () => alovaIns.Get<UserInfoType, unknown>(urls.getUserInfoDetail),
  getBadgeList: () => alovaIns.Get<BadgeType[], unknown>(urls.getBadgeList),
  setUserBadge: (badgeId: number) => alovaIns.Put<void, unknown>(urls.setUserBadge, { badgeId }),
  modifyUserName: (name: string) => alovaIns.Put<void, unknown>(urls.modifyUserName, { name }),
}
