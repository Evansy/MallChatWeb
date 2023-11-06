<script setup lang="ts">
// 艾特功能参考自 https://github.com/MrHGJ/at-mentions
import {
  ref,
  reactive,
  toRefs,
  watch,
  watchEffect,
  onMounted,
  nextTick,
  type StyleValue,
  computed,
} from 'vue'
import type { IMention, INode } from './types'
import type { CacheUserItem } from '@/services/types'
import { NodeType } from './types'
import {
  getSelectionCoords,
  getEditorRange,
  transformMentionDataToNodeList,
  transformNodeListToMentionData,
  insertInputText,
} from './utils'
import { useGlobalStore } from '@/stores/global'
import { useCachedStore } from '@/stores/cached'
import VirtualList from '@/components/VirtualList'
import eventBus from '@/utils/eventBus'

import MentionItem from './item.vue'
import PasteImageDialog from '../PasteImageDialog/index.vue'

// 关闭透传 attrs 到组件根节点，传递到子节点  v-bind="$attrs"
defineOptions({ inheritAttrs: false })

interface Props {
  // 是否启用 contentEditable
  disabled?: boolean
  // v-model 的 value
  modelValue: string
  // 艾特 成员列表数据
  mentions?: IMention[]
  // 最大长度
  maxLength?: number
  // 劫持
  className?: string
  style?: object
}
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  modelValue: '',
  mentions: () => [],
  maxLength: -1,
})

// v-model
const emit = defineEmits([
  'update:modelValue',
  'change',
  'focus',
  'blur',
  'callBackRefAndRange',
  'send',
])

const { modelValue: value, mentions, maxLength, disabled } = toRefs(props)
const editorRef = ref<HTMLElement | null>()
const scrollRef = ref()
const cachedStore = useCachedStore()
const globalStore = useGlobalStore()

// 是否展示选人弹窗
const showDialog = ref(false)
const personList = ref<CacheUserItem[]>([])
const dialogPosition = reactive({ x: 0, y: 0 })
// 选人弹窗当前选中的人
const activeIndex = ref(0)
// @字符后的关键字，用于搜索人员列表
const searchKey = ref('')
// 编辑器是否已初始化过
const isInit = ref(false)
// 记录编辑器光标的位置
const editorRange = ref<{ range: Range; selection: Selection } | null>(null)
// 记录input文本内容
const inputStr = ref('')

const currentRoomId = computed(() => globalStore.currentSession.roomId)

inputStr.value = value.value

// 根据传入的数据初始化editor内容显示
const init = () => {
  const nodeList = transformMentionDataToNodeList(value?.value, mentions.value)
  if (!editorRef.value) return
  nodeList.forEach((item) => {
    if (item.type === NodeType.text) {
      const textNode = document.createTextNode(item.data as string)
      editorRef.value?.appendChild(textNode)
    }
    if (item.type === NodeType.at) {
      const btn = document.createElement('button')
      btn.dataset.person = JSON.stringify(item.data)
      btn.textContent = `@${(item.data as CacheUserItem).name}`
      btn.className = 'at_member'
      btn.contentEditable = 'false'
      btn.addEventListener(
        'click',
        () => {
          return false
        },
        false,
      )
      btn.tabIndex = 0
      editorRef.value?.appendChild(btn)
    }
  })
  isInit.value = true
}

watchEffect(() => {
  // 仅在加载时初始化
  if (value.value && value.value.length > 0 && !isInit.value) {
    init()
  }
  // 初始化value为空处理
  if (!(value.value && value.value.length > 0) && !isInit.value) {
    setTimeout(() => {
      init()
    }, 500)
  }
  // 清空输入
  if (!(value.value && value.value.length > 0) && isInit && editorRef.value) {
    while (editorRef.value?.firstChild) {
      editorRef.value.removeChild(editorRef.value.firstChild)
    }
  }
  inputStr.value = value.value
})

// 根据关键字搜索人员
watch(
  searchKey,
  () => {
    personList.value = cachedStore.filterUsers(searchKey.value) as CacheUserItem[]
  },
  // { immediate: true },
)
watch(
  currentRoomId,
  (val, oldVal) => {
    if (val !== oldVal) {
      inputStr.value = ''
      personList.value = cachedStore.currentAtUsersList as CacheUserItem[]
    }
  },
  { immediate: true },
)

// 关闭选人弹窗时，重置选择的人的位置
watch(showDialog, () => {
  if (!showDialog.value) {
    activeIndex.value = 0
  }
})

// 弹窗展示时，根据光标更新位置
watch(showDialog, () => {
  if (showDialog.value) {
    // 获取光标的位置
    const { x: cursorX, y: cursorY } = getSelectionCoords()
    if (editorRef.value) {
      const editorWidth = editorRef.value.offsetWidth
      const editorLeft = editorRef.value.getBoundingClientRect().left
      const editorRight = editorLeft + editorWidth
      const dialogWidth = 300
      // 弹窗超出右边界处理
      if (cursorX + dialogWidth > editorRight) {
        dialogPosition.x = editorRight - dialogWidth
        dialogPosition.y = cursorY
        // setDialogPosition({ x: editorRight - dialogWidth, y: cursorY })
      } else {
        dialogPosition.x = cursorX
        dialogPosition.y = cursorY
      }
    } else {
      dialogPosition.x = cursorX
      dialogPosition.y = cursorY
    }
  }
})

// 禁用解除后自动获取焦点。
watch(disabled, (newVal) => {
  if (!newVal) {
    setTimeout(() => {
      editorRef.value?.focus()
    })
  }
})

onMounted(() => {
  nextTick(() => {
    editorRef.value?.focus()
  })
})

// 当输入框值发生变化时，解析它的数据，并回传
const onDataChangeCallBack = () => {
  if (editorRef.value) {
    // const buttons = [].slice.call(editorRef.current.querySelectorAll('button'))
    const nodeList: INode[] = []
    const editorChildNodes = [].slice.call(
      editorRef.value.childNodes,
    ) as unknown as NodeListOf<ChildNode>
    if (editorChildNodes.length > 0) {
      editorChildNodes.forEach((element) => {
        // 文本
        if (element.nodeName === '#text') {
          const el = element as Text
          if (el.data && el.data.length > 0) {
            nodeList.push({
              type: NodeType.text,
              data: el.data,
            })
          }
        }
        // br换行
        if (element.nodeName === 'BR') {
          nodeList.push({
            type: NodeType.br,
            data: '\n',
          })
        }
        // button
        if (element.nodeName === 'BUTTON') {
          const el = element as HTMLButtonElement
          const personInfo = JSON.parse(el.dataset.person as string)
          nodeList.push({
            type: NodeType.at,
            data: personInfo,
          })
        }
      })
    }
    const { pureString, mentionList } = transformNodeListToMentionData(nodeList)
    // 文本末尾换行出现两个换行符处理
    if (pureString.length > 0 && pureString.charAt(pureString.length - 1) === '\n') {
      emit('change', pureString.substring(0, pureString.length - 1), mentionList)
    } else {
      emit('change', pureString, mentionList)
    }
  }
}

// @字符输入检测  是否展示选人弹窗
const checkIsShowSelectDialog = () => {
  const rangeInfo = getEditorRange()
  if (!rangeInfo || !rangeInfo.range || !rangeInfo.selection) {
    showDialog.value = false
    return
  }
  const curNode = rangeInfo.range.endContainer
  if (!curNode || !curNode.textContent || curNode.nodeName !== '#text') {
    showDialog.value = false
    return
  }
  const searchStr = curNode.textContent.slice(0, rangeInfo.selection.focusOffset)
  // 判断光标位置前方是否有at，只有一个at则展示默认dialog，除了at还有关键字则展示searchDialog
  const keywords = /@([^@]*)$/.exec(searchStr)
  if (keywords && keywords.length >= 2) {
    // 展示搜索选人
    const [, keyWord] = keywords
    // const allMathStr = keywords[0]
    // 搜索关键字不超过20个字符
    if (keyWord && keyWord.length > 20) {
      showDialog.value = false
      searchKey.value = ''
      personList.value = []
      return
    }
    showDialog.value = true
    searchKey.value = keyWord
    // 记下弹窗前光标位置range
    editorRange.value = rangeInfo
  } else {
    // 关掉选人
    searchKey.value = ''
    showDialog.value = false
  }
}

// 选择人员后插入@人员样式
const insertHtmlAtCaret = (
  [btn, bSpaceNode]: [HTMLButtonElement, Text],
  selection: Selection,
  range: Range,
) => {
  if (selection.getRangeAt(0) && selection.rangeCount) {
    if (selection.focusNode?.parentNode?.nodeName === 'BUTTON') return
    range.deleteContents()
    const el = document.createElement('div')
    el.appendChild(btn)
    if (bSpaceNode) {
      el.appendChild(bSpaceNode)
    }
    const frag = document.createDocumentFragment()
    let node
    let lastNode
    while ((node = el.firstChild)) {
      lastNode = frag.appendChild(node)
    }
    range.insertNode(frag)
    if (lastNode) {
      range = range.cloneRange()
      range.setStartAfter(lastNode)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}

// 选择@的人。替换原来的检索文案，并插入新的@标签<button/>
const selectPerson = (personItem: CacheUserItem, ignore = false) => {
  // 选择人员后关闭并重置选人框，重置搜索词
  showDialog.value = false
  // 滚动到候选框顶部
  scrollRef.value?.scrollToIndex(0)
  const editor = editorRef.value
  if (editor) {
    editor.focus()
    const myEditorRange = editorRange?.value?.range
    if (!myEditorRange) return
    const textNode = myEditorRange.endContainer // 拿到末尾文本节点
    const endOffset = myEditorRange.endOffset // 光标位置
    // 找出光标前的@符号位置
    const textNodeValue = textNode.nodeValue as string
    const expRes = /@([^@]*)$/.exec(textNodeValue)
    if ((expRes && expRes.length > 1) || ignore) {
      if (!ignore && expRes?.length) {
        myEditorRange.setStart(textNode, expRes.index)
        myEditorRange.setEnd(textNode, endOffset)
        myEditorRange.deleteContents() // 删除草稿end
      }
      const btn = document.createElement('button')
      btn.dataset.person = JSON.stringify(personItem)
      btn.textContent = `@${personItem.name}`
      btn.className = 'at_member'
      btn.contentEditable = 'false'
      btn.addEventListener(
        'click',
        () => {
          return false
        },
        false,
      )
      btn.tabIndex = 0
      // const bSpaceNode = document.createTextNode('\u200b') // 不可见字符，为了放光标方便
      const bSpaceNode = document.createTextNode('\u00A0') // 插入空格字符
      insertHtmlAtCaret(
        [btn, bSpaceNode],
        editorRange?.value?.selection as Selection,
        editorRange?.value?.range as Range,
      )
    }
    onDataChangeCallBack()
  }
}

// 键盘弹起
const onInputKeyUp = (e: KeyboardEvent) => {
  // 输入了@，直接弹选人浮层
  // keyCode 2:50
  if (e.key === '2' && e.shiftKey) {
    showDialog.value = true
  } else {
    // 这里是输入的不是@，但是可能前方有@，因此需要进行检测看看是否要展示选人浮层
    checkIsShowSelectDialog()
  }
}

const handleArrow = (direction: 'up' | 'down') => {
  if (!scrollRef.value) return

  let newIndex = 0
  if (direction === 'up') {
    newIndex = activeIndex.value - 1
    if (newIndex < 0) return
    newIndex < scrollRef.value.getOffset() / 34 && scrollRef.value.scrollToIndex(newIndex)
  }
  if (direction === 'down') {
    newIndex = activeIndex.value + 1
    if (newIndex > personList.value.length + 1) return
    newIndex > 6 && scrollRef.value.scrollToIndex(newIndex - 6)
  }
  activeIndex.value = newIndex
}

// 键盘按下
const onInputKeyDown = (e: KeyboardEvent) => {
  // 设置maxLength后，限制字符数输入
  if (maxLength.value && maxLength.value > 0) {
    if ((e.target as HTMLInputElement).innerText.length >= maxLength.value) {
      // 不屏蔽删除键
      // keyCode Backspace:8 Delete:46
      if (!(e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault()
      }
    }
  }

  if (showDialog.value && personList.value.length > 0) {
    // 向下移动光标，调整dialog选中的人--keyCode 40
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleArrow('down')
    }
    // 向上移动光标，调整dialog选中的人--keyCode 38 ArrowUp
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleArrow('up')
    }
    // 按Enter键，确认选择当前人--keyCode 13 Enter
    if (e.key === 'Enter') {
      e.preventDefault()
      // 选择当前人
      selectPerson(personList.value[activeIndex.value])
      // 更新输入框同步值
      onInputText()
    }
  } else {
    // 禁止默认换行
    if (
      (e.ctrlKey && e.key === 'Enter') ||
      (e.shiftKey && e.key === 'Enter') ||
      (e.metaKey && e.key === 'Enter')
    ) {
      e.preventDefault()
      onWrap()
      return
    }
    // 处理输入法状态下的回车事件
    if ((e as KeyboardEvent).isComposing) {
      return e.preventDefault()
    }
    // 禁止默认换行
    if (e.key === 'Enter') {
      e.preventDefault()
      emit('send', e)
    }
  }
  // 去除Crtl+b/Ctrl+i/Ctrl+u等快捷键
  // e.metaKey for mac
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'B': // 66: ctrl+B
      case '2': // 98: ctrl+b
      case 'I': // 73: ctrl+I
      case '9': // 105: ctrl+i
      case 'U': // 85: ctrl+U
      case 'F6': {
        //  117: ctrl+u
        e.preventDefault()
        break
      }
    }
  }
  // tab键插入两个空格
  // keyCode 9  Tab
  if (e.key === 'Tab') {
    e.preventDefault()
    document.execCommand('insertHTML', false, '  ')
  }
}

// 输入框文本改变时触发
const onInputText = () => {
  if (editorRef.value) {
    const text = editorRef.value.innerText
    inputStr.value = text
    emit('update:modelValue', text)
  }
  onDataChangeCallBack()
}

// 输入框失去焦点
const onInputBlur = () => {
  emit('blur')
  editorRange.value = getEditorRange()
  emit('callBackRefAndRange', editorRef.value, editorRange.value)
  // onDataChangeCallBack()
  // 加一段延时。防止选人时，未来得及执行选人点击事件就直接隐藏对话框
  setTimeout(() => {
    showDialog.value = false
    scrollRef.value?.scrollToIndex(0)
    // personList.value = []
    setTimeout(() => {
      searchKey.value = ''
    }, 0)
  }, 300)
}

// 插入换行符
const onWrap = () => {
  const rangeInfo = getEditorRange()
  if (!rangeInfo || !rangeInfo.range || !rangeInfo.selection) return
  insertInputText({
    content: '\n',
    selection: rangeInfo.selection,
    range: rangeInfo.range,
  })
}

const onInputFocus = () => {
  emit('focus')
  // 聚焦时是否展示选人弹窗
  checkIsShowSelectDialog()
}

// 拦截粘贴，只允许粘贴文本
const onPaste = (e: ClipboardEvent) => {
  e.preventDefault()
  let pastedText
  // @ts-ignore
  if (window.clipboardData && window.clipboardData.getData) {
    // IE
    // @ts-ignore
    pastedText = window.clipboardData.getData('Text')
  } else if (e.clipboardData && e.clipboardData.getData) {
    pastedText = e.clipboardData.getData('text/plain')
  }
  document.execCommand('insertHTML', false, pastedText)
  return false
}

//
const onSelectPerson = (uid: number, ignore = false) => {
  if (!uid) return
  eventBus.emit('focusMsgInput')
  setTimeout(() => {
    const userItem = cachedStore.userCachedList[uid]
    userItem && selectPerson?.(userItem as CacheUserItem, ignore)
  }, 10)
}

// 暴露 ref 属性
defineExpose({ input: editorRef, range: editorRange, onSelectPerson })

const getKey = (item: CacheUserItem) => item.uid
</script>

<template>
  <div
    class="input-wrapper"
    :class="[className, $attrs.class]"
    :style="[style as StyleValue, $attrs.style as StyleValue]"
  >
    <!-- 输入框 -->
    <div
      ref="editorRef"
      v-bind="$attrs"
      class="input"
      id="at-mentions-input"
      :text="modelValue"
      :contenteditable="!disabled"
      @input="onInputText"
      @keyup="onInputKeyUp"
      @keydown="onInputKeyDown"
      @blur="onInputBlur"
      @focus="onInputFocus"
      @mouseup="checkIsShowSelectDialog"
      @paste="onPaste"
      :data-room-id="globalStore.currentSession?.roomId"
    />

    <!-- 人员选择浮层 -->
    <div
      v-show="showDialog"
      className="at-mentions__dialog"
      :style="{ top: `${dialogPosition.y - 14}px`, left: `${dialogPosition.x || 0}px` }"
    >
      <VirtualList
        v-if="personList?.length"
        ref="scrollRef"
        class="person-wrapper"
        dataPropName="item"
        :itemProps="{ activeIndex, onSelect: onSelectPerson }"
        :data="personList"
        :data-key="getKey"
        :item="MentionItem"
        :size="20"
      />
    </div>

    <!-- 粘贴图片弹窗 -->
    <PasteImageDialog />
  </div>
</template>

<style>
.at_member {
  padding: 0;
  font-size: inherit;
  line-height: 1;
  color: var(--color-primary);
  background: transparent;
  border: none;
}
</style>

<style lang="scss" src="./styles.scss" scoped />
