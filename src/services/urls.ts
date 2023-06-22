// 本地配置到 .env 里面修改。生产配置在 .env.production 里面
const prefix = import.meta.env.PROD ? import.meta.env.VITE_API_PREFIX : ''
export default {
  getGroupUserList: `${prefix}/capi/chat/public/member/page`,
  getMemberStatistic: `${prefix}/capi/chat/public/member/statistic`,
  getUserInfoBatch: `${prefix}/capi/user/public/summary/userInfo/batch`,
  getBadgesBatch: `${prefix}/capi/user/public/badges/batch`,
  // 房间内的所有群成员列表-@专用
  getAllUserBaseInfo: `${prefix}/capi/chat/member/list`,
  getMsgList: `${prefix}/capi/chat/public/msg/page`,
  sendMsg: `${prefix}/capi/chat/msg`,
  // 获取用户信息详情
  getUserInfoDetail: `${prefix}/capi/user/userInfo`,
  // 修改用户名
  modifyUserName: `${prefix}/capi/user/name`,
  // 徽章列表
  getBadgeList: `${prefix}/capi/user/badges`,
  // 设置用户徽章
  setUserBadge: `${prefix}/capi/user/badge`,
  // 消息标记
  markMsg: `${prefix}/capi/chat/msg/mark`,
  // 拉黑用户
  blockUser: `${prefix}/capi/user/black`,
  // 撤回消息
  recallMsg: `${prefix}/capi/chat/msg/recall`,
}
