import { MsgEnum } from '@/enums'

// 计算展示的回复消息的内容
const renderReplyContent = (name?: string, type?: MsgEnum, content?: string) => {
  switch (type) {
    case MsgEnum.SYSTEM:
    case MsgEnum.TEXT: {
      return `${name}:${content}`
    }
    case MsgEnum.IMAGE: {
      return `${name}: [图片]`
    }
    case MsgEnum.FILE: {
      return `${name}: [文件]`
    }
    case MsgEnum.VOICE: {
      return `${name}: [语音]`
    }
    case MsgEnum.VIDEO: {
      return `${name}: [视频]`
    }
    case MsgEnum.EMOJI: {
      return `${name}: [表情]`
    }
    default: {
      return ''
    }
  }
}
export default renderReplyContent
