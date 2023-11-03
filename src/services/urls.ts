// 本地配置到 .env 里面修改。生产配置在 .env.production 里面
const prefix = import.meta.env.PROD ? import.meta.env.VITE_API_PREFIX : ''
export default {
  getMemberStatistic: `${prefix}/capi/chat/public/member/statistic`,
  getUserInfoBatch: `${prefix}/capi/user/public/summary/userInfo/batch`,
  getBadgesBatch: `${prefix}/capi/user/public/badges/batch`,
  getAllUserBaseInfo: `${prefix}/capi/room/group/member/list`, // 房间内的所有群成员列表-@专用
  getMsgList: `${prefix}/capi/chat/public/msg/page`,
  sendMsg: `${prefix}/capi/chat/msg`,
  getUserInfoDetail: `${prefix}/capi/user/userInfo`, // 获取用户信息详情
  modifyUserName: `${prefix}/capi/user/name`, // 修改用户名
  getBadgeList: `${prefix}/capi/user/badges`, // 徽章列表
  setUserBadge: `${prefix}/capi/user/badge`, // 设置用户徽章
  markMsg: `${prefix}/capi/chat/msg/mark`, // 消息标记
  blockUser: `${prefix}/capi/user/black`, // 拉黑用户
  recallMsg: `${prefix}/capi/chat/msg/recall`, // 撤回消息
  fileUpload: `${prefix}/capi/oss/upload/url`, // 文件上传
  addEmoji: `${prefix}/capi/user/emoji`, // 增加表情
  deleteEmoji: `${prefix}/capi/user/emoji`, // 删除表情
  getEmoji: `${prefix}/capi/user/emoji/list`, // 查询表情包

  // -------------- 好友相关 ---------------
  getContactList: `${prefix}/capi/user/friend/page`, // 联系人列表
  requestFriendList: `${prefix}/capi/user/friend/apply/page`, // 好友申请列表
  sendAddFriendRequest: `${prefix}/capi/user/friend/apply`, // 申请好友
  deleteFriend: `${prefix}/capi/user/friend`, // 删除好友
  newFriendCount: `${prefix}/capi/user/friend/apply/unread`, // 申请未读数

  // -------------- 聊天室相关 ---------------
  getSessionList: `${prefix}/capi/chat/public/contact/page`, // 会话列表
  getMsgReadList: `${prefix}/capi/chat/msg/read/page`, // 消息的已读未读列表
  getMsgReadCount: `${prefix}/capi/chat/msg/read`, // 消息已读未读数
  createGroup: `${prefix}/capi/room/group`, // 新增群组
  getGroupUserList: `${prefix}/capi/room/public/group/member/page`,
  inviteGroupMember: `${prefix}/capi/room/group/member`, // 邀请群成员
  exitGroup: `${prefix}/capi/room/group/member/exit`, // 退群
  addAdmin: `${prefix}/capi/room/group/admin`, // 添加管理员
  revokeAdmin: `${prefix}/capi/room/group/admin`, // 添加管理员
  groupDetail: `${prefix}/capi/room/public/group`, // 群组详情
  sessionDetail: `${prefix}/capi/chat/public/contact/detail`, // 会话详情
  sessionDetailWithFriends: `${prefix}/capi/chat/public/contact/detail/friend`, // 会话详情(联系人列表发消息用)
}
