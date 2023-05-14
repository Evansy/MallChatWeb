const prefix = import.meta.env.PROD ? 'https://api.mallchat.cn' : ''
export default {
  getGroupUserList: `${prefix}/capi/chat/public/member/page`,
  getMemberStatistic: `${prefix}/capi/chat/public/member/statistic`,
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
}
