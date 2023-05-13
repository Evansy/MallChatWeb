const prefix = import.meta.env.PROD ? 'https://api.mallchat.cn' : ''
export default {
  getGroupUserList: `${prefix}/capi/chat/public/member/page`,
  getMemberStatistic: `${prefix}/capi/chat/public/member/statistic`,
  getMsgList: `${prefix}/capi/chat/public/msg/page`,
  sendMsg: `${prefix}/capi/chat/msg`,
}
