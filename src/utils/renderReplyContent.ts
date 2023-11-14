import { MsgEnum } from '@/enums'
import { MSG_REPLY_TEXT_MAP } from '@/constant/message'

// 计算展示的回复消息的内容
const renderReplyContent = (name?: string, type?: MsgEnum, content?: string) => {
  switch (type) {
    case MsgEnum.SYSTEM:
    case MsgEnum.TEXT: {
      return `${name}:${content}`
    }
    case MsgEnum.IMAGE: {
      return `${name}: ${MSG_REPLY_TEXT_MAP[MsgEnum.IMAGE]}`
    }
    case MsgEnum.FILE: {
      return `${name}: ${MSG_REPLY_TEXT_MAP[MsgEnum.FILE]}`
    }
    case MsgEnum.VOICE: {
      return `${name}: ${MSG_REPLY_TEXT_MAP[MsgEnum.VOICE]}`
    }
    case MsgEnum.VIDEO: {
      return `${name}: ${MSG_REPLY_TEXT_MAP[MsgEnum.VIDEO]}`
    }
    case MsgEnum.EMOJI: {
      return `${name}: ${MSG_REPLY_TEXT_MAP[MsgEnum.EMOJI]}`
    }
    default: {
      return ''
    }
  }
}
export default renderReplyContent
