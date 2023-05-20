import type {
  ListResponse,
  UserItem,
  GroupStatisticType,
  MessageItemType,
  MarkMsgReq,
  UserInfoType,
  BadgeType,
  SendMsgReq,
} from '@/services/types'
import { alovaIns } from './request'
import urls from './urls'

export default {
  getGroupList: (params?: any) => alovaIns.Get<ListResponse<UserItem>, unknown>(urls.getGroupUserList, params),
  getMemberStatistic: () => alovaIns.Get<GroupStatisticType, unknown>(urls.getMemberStatistic),
  getMsgList: (params?: any) => alovaIns.Get<ListResponse<MessageItemType>, unknown>(urls.getMsgList, params),
  sendMsg: (data?: SendMsgReq) => alovaIns.Post<MessageItemType, unknown>(urls.sendMsg, data),
  markMsg: (data?: MarkMsgReq) => alovaIns.Put<void, unknown>(urls.markMsg, data),
  getUserDetail: () => alovaIns.Get<UserInfoType, unknown>(urls.getUserInfoDetail, { localCache: 0 }),
  getBadgeList: () => alovaIns.Get<BadgeType[], unknown>(urls.getBadgeList, { localCache: 0 }),
  setUserBadge: (badgeId: number) => alovaIns.Put<void, unknown>(urls.setUserBadge, { badgeId }),
  modifyUserName: (name: string) => alovaIns.Put<void, unknown>(urls.modifyUserName, { name }),
}
