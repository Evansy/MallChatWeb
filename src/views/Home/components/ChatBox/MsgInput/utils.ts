import { NodeType } from './types'
import type { IPerson, INode, IMention } from './types'

// 数据类型转换  NodeList => MentionData
export const transformNodeListToMentionData = (nodeList: INode[]) => {
  let pureString = ''
  const mentionList: IMention[] = []
  nodeList.forEach((item) => {
    if (item.type === NodeType.text || item.type === NodeType.br) {
      pureString += item.data
    }
    if (item.type === NodeType.at) {
      const { uid = 0, name = '', avatar = '' } = item.data as IPerson
      mentionList.push({
        uid,
        name,
        avatar,
        length: name.length + 1,
        offset: pureString.length,
      })
      pureString += '@' + name
    }
  })
  return { pureString, mentionList }
}

// 数据类型转换 MentionData => NodeList
export const transformMentionDataToNodeList = (
  pureString: string,
  mentionList: IMention[],
): INode[] => {
  let cutStart: number = 0
  const nodeList: INode[] = []
  if (mentionList.length > 0) {
    mentionList.forEach((item) => {
      const { offset, length: nameLength } = item
      const textPart = pureString.slice(cutStart, offset)
      if (textPart.length > 0) {
        nodeList.push({
          type: NodeType.text,
          data: textPart,
        })
      }
      nodeList.push({
        type: NodeType.at,
        data: {
          uid: item.uid,
          name: item.name,
          avatar: item.avatar,
        },
      })
      cutStart = offset + nameLength
    })
    const remainText = pureString.slice(cutStart)
    if (remainText.length > 0) {
      nodeList.push({
        type: NodeType.text,
        data: remainText,
      })
    }
  } else {
    if (pureString.length > 0) {
      nodeList.push({
        type: NodeType.text,
        data: pureString,
      })
    }
  }
  return nodeList
}

// 获取当前光标选取的信息（即在弹出选人之前，把输入框中此刻的光标位置先记下来）
export const getEditorRange = () => {
  let range = null
  let selection = null
  if (window.getSelection) {
    selection = window.getSelection()
    if (selection && selection.getRangeAt && selection.rangeCount) {
      range = selection.getRangeAt(0)
      return {
        range,
        selection,
      }
    } else {
      return null
    }
  } else {
    return null
  }
}

// 重新设置光标的位置
export const resetRange = (range: Range) => {
  if (range) {
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
      // @ts-ignore
    } else if (range.select) {
      // @ts-ignore
      range.select()
    }
  }
}

// 获取光标坐标
export const getSelectionCoords = () => {
  const win = window
  const doc = win.document
  // @ts-ignore 兼容 IE
  let sel = doc.selection
  let range
  let rects
  let rect
  let x = 0
  let y = 0
  if (sel) {
    if (sel.type !== 'Control') {
      range = sel.createRange()
      range.collapse(true)
      x = range.boundingLeft
      y = range.boundingTop
    }
  } else if (win.getSelection) {
    sel = win.getSelection()
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange()
      if (range.getClientRects) {
        range.collapse(true)
        rects = range.getClientRects()
        if (rects.length > 0) {
          rect = rects[0]
        }
        // 光标在行首时，rect为undefined
        if (rect) {
          x = rect.left
          y = rect.top
        }
      }
      if ((x === 0 && y === 0) || rect === undefined) {
        const span = doc.createElement('span')
        if (span.getClientRects) {
          span.appendChild(doc.createTextNode('\u200b'))
          range.insertNode(span)
          rect = span.getClientRects()[0]
          x = rect.left
          y = rect.top
          const spanParent = span.parentNode
          spanParent?.removeChild(span)
          spanParent?.normalize()
        }
      }
    }
  }
  return { x: x, y: y }
}

export const insertInputText = ({
  content,
  selection,
  range,
}: {
  content?: string
  selection?: Selection
  range?: Range
}) => {
  if (!selection || !range || !content) return
  if (selection.getRangeAt(0) && selection.rangeCount) {
    range.deleteContents()
    const el = document.createElement('div')
    const text = document.createTextNode(content)
    el.appendChild(text)
    // el.innerText = content;
    const frag = document.createDocumentFragment()
    let node
    let lastNode
    while ((node = el.firstChild)) {
      lastNode = frag.appendChild(node)
    }
    range.insertNode(frag)
    if (lastNode) {
      const newRange = range.cloneRange()
      if (!newRange) return
      newRange.setStartAfter(lastNode)
      newRange.collapse(true)
      selection.removeAllRanges()
      selection.addRange(newRange)
    }
  }
}
