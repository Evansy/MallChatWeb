// 创建一个 eventHub.js 文件
import mitt from 'mitt'
import type { Emitter } from 'mitt'
import type { MsgReadUnReadCountType } from '@/services/types'

type Events = {
  focusMsgInput?: void
  onSelectPerson: { uid: number; ignoreCheck?: boolean }
  onAddReadCountTask: { msgId: number }
  onRemoveReadCountTask: { msgId: number }
  onGetReadCount: Map<number, MsgReadUnReadCountType>
}

const eventHub: Emitter<Events> = mitt<Events>()
export default eventHub
