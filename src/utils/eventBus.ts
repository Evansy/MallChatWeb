// 创建一个 eventHub.js 文件
import mitt from 'mitt'
import type { Emitter } from 'mitt'

type Events = {
  focusMsgInput?: void
  onSelectPerson: { uid: number; ignoreCheck?: boolean }
}

const eventHub: Emitter<Events> = mitt<Events>()
export default eventHub
