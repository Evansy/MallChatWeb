import type {
  ListResponse,
  UserItem,
  GroupStatisticType,
  MessageType,
  MarkMsgReq,
  UserInfoType,
  BadgeType,
  MessageReq,
  CacheUserItem,
  CacheBadgeItem,
  CacheUserReq,
  CacheBadgeReq,
  EmojiItem,
} from '@/services/types'
import { alovaIns } from './request'
import urls from './urls'

const getRequest = <T>(url: string, config?: any) => alovaIns.Get<T>(url, config)
const postRequest = <T>(url: string, params?: any) => alovaIns.Post<T, unknown>(url, params)
const putRequest = <T>(url: string, params?: any) => alovaIns.Put<T, unknown>(url, params)
const deleteRequest = <T>(url: string, params?: any) => alovaIns.Delete<T, unknown>(url, params)

export default {
  /** 获取群成员列表 */
  getGroupList: (params?: any) => getRequest<ListResponse<UserItem>>(urls.getGroupUserList, params),
  /** 获取群成员统计 */
  getMemberStatistic: () => getRequest<GroupStatisticType>(urls.getMemberStatistic),
  /** 房间内的所有群成员列表-@专用 */
  getAllUserBaseInfo: (params?: any) =>
    getRequest<Pick<CacheUserItem, 'avatar' | 'name' | 'uid'>[]>(urls.getAllUserBaseInfo, params),
  /** 批量获取成员详细信息 */
  getUserInfoBatch: (users: CacheUserReq[]) =>
    postRequest<CacheUserItem[]>(urls.getUserInfoBatch, { reqList: users }),
  /** 批量获取徽章信息 */
  getBadgesBatch: (badges: CacheBadgeReq[]) =>
    postRequest<CacheBadgeItem[]>(urls.getBadgesBatch, { reqList: badges }),
  /** 获取消息列表 */
  getMsgList: (params?: any) => getRequest<ListResponse<MessageType>>(urls.getMsgList, params),
  /** 发送消息 */
  sendMsg: (data?: MessageReq) => postRequest<MessageType>(urls.sendMsg, data),
  /** 标记消息，点赞等 */
  markMsg: (data?: MarkMsgReq) => alovaIns.Put<void>(urls.markMsg, data),
  /** 获取用户详细信息 */
  getUserDetail: () => getRequest<UserInfoType>(urls.getUserInfoDetail, { localCache: 0 }),
  /** 获取勋章列表 */
  getBadgeList: () => getRequest<BadgeType[]>(urls.getBadgeList, { localCache: 0 }),
  /** 设置用户勋章 */
  setUserBadge: (badgeId: number) => putRequest<void>(urls.setUserBadge, { badgeId }),
  /** 修改用户名 */
  modifyUserName: (name: string) => putRequest<void>(urls.modifyUserName, { name }),
  /** 撤回消息 */
  recallMsg: (data: { msgId: number; roomId: number }) => putRequest<void>(urls.recallMsg, data),
  /** 拉黑用户 */
  blockUser: (data: { uid: number }) => putRequest<void>(urls.blockUser, data),
  /** 获取临时上传链接 */
  getUploadUrl: (params: any) =>
    getRequest<{ downloadUrl: string; uploadUrl: string }>(urls.fileUpload, { params }),
  /** 新增表情包 */
  addEmoji: (data: { uid: number; expressionUrl: string }) =>
    postRequest<MessageType>(urls.addEmoji, data),
  /** 获取表情 **/
  getEmoji: (params: { uid: number }) => getRequest<EmojiItem[]>(urls.getEmoji, params),
  /** 删除id */
  deleteEmoji: (params: { id: number }) => deleteRequest<EmojiItem[]>(urls.deleteEmoji, params),
}
