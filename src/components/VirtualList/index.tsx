import {
  defineComponent,
  onActivated,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import Virtual from './virtual'
import Item from './item'

interface Range {
  start: number
  end: number
  padFront: number
  padBehind: number
}

interface DataSource {
  [key: string]: any
}

export default defineComponent({
  name: 'VirtualList',
  props: {
    // 数据
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
    // 唯一标识键值
    dataKey: {
      type: [String, Function],
      required: true,
    },
    // 数据项组件
    item: {
      type: [Object, Function],
      required: true,
    },
    // 可视区域内保留的数据项个数
    keeps: {
      type: Number,
      default: 30,
    },
    size: {
      type: Number,
      default: 50,
    },
    // 起始索引-用来指定默认从哪里开始渲染
    start: {
      type: Number,
      default: 0,
    },
    // 偏移量
    offset: {
      type: Number,
      default: 0,
    },
    // 顶部触发阈值
    topThreshold: {
      type: Number,
      default: 0,
    },
    // 底部触发阈值
    bottomThreshold: {
      type: Number,
      default: 0,
    },
    // Item项的Props
    itemProps: {
      type: Object,
    },
    // 指定用什么名字传递数据
    dataPropName: {
      type: String,
      default: 'source',
    },
  },
  setup(props, { emit, expose }) {
    const range = ref<Range | null>(null)
    const rootRef = ref<HTMLElement | null>()
    const shepherd = ref<HTMLDivElement | null>(null)
    let virtual: Virtual

    // 监听数据数组长度变化 更新数据
    watch(
      () => props.data.length,
      () => {
        virtual.updateParam('uniqueIds', getUniqueIdFromDataSources())
        virtual.handleDataSourcesChange()
      },
    )
    watch(
      () => props.keeps,
      (newValue) => {
        virtual.updateParam('keeps', newValue)
        virtual.handleSlotSizeChange()
      },
    )
    watch(
      () => props.start,
      (newValue) => {
        scrollToIndex(newValue)
      },
    )
    watch(
      () => props.offset,
      (newValue) => scrollToOffset(newValue),
    )

    // 根据id获取数据项大小
    const getSize = (id: string) => {
      return virtual.sizes.get(id)
    }
    // 获取滚动条偏移量
    const getOffset = () => {
      return rootRef.value ? Math.ceil(rootRef.value.scrollTop) : 0
    }
    // 获取可视区域大小
    const getClientSize = () => {
      const key = 'clientHeight'
      return rootRef.value ? Math.ceil(rootRef.value[key]) : 0
    }
    // 获取滚动条总高度
    const getScrollSize = () => {
      const key = 'scrollHeight'
      return rootRef.value ? Math.ceil(rootRef.value[key]) : 0
    }

    // 统一处理向外暴露事件
    const emitEvent = (offset: number, clientSize: number, scrollSize: number) => {
      emit('scroll', { offset, clientSize, scrollSize })

      if (virtual.isFront() && !!props.data.length && offset - props.topThreshold <= 0) {
        emit('totop')
      } else if (virtual.isBehind() && offset + clientSize + props.bottomThreshold >= scrollSize) {
        emit('tobottom')
      }
    }
    const onScroll = () => {
      const offset = getOffset()
      const clientSize = getClientSize()
      const scrollSize = getScrollSize()
      if (offset < 0 || offset + clientSize > scrollSize + 1 || !scrollSize) {
        return
      }

      virtual.handleScroll(offset)
      emitEvent(offset, clientSize, scrollSize)
    }

    // 获取数据源中的唯一标识
    const getUniqueIdFromDataSources = () => {
      const { dataKey, data = [] } = props
      // 如果dataKey是函数 则调用传入的函数执行获取唯一标识
      return data.map((dataSource: any) =>
        typeof dataKey === 'function' ? dataKey(dataSource) : dataSource[dataKey],
      )
    }
    const onRangeChanged = (newRange: any) => {
      range.value = newRange
    }
    /**
     * 初始化一个virtual实例
     * @description 详细参数见virtual.ts
     */
    const installVirtual = () => {
      virtual = new Virtual(
        {
          slotHeaderSize: 0,
          slotFooterSize: 0,
          keeps: props.keeps,
          estimateSize: props.size,
          buffer: Math.round(props.keeps / 3),
          uniqueIds: getUniqueIdFromDataSources(),
        },
        onRangeChanged,
      )

      range.value = virtual.getRange()
    }

    /**
     * 滚动到指定索引
     * @param index 索引值
     * @param smooth 是否平滑滚动
     * @param topDistance 顶部间隔距离
     * @description 如果索引值大于等于数据长度说明到底了则滚动到底部
     */
    const scrollToIndex = (index: number, smooth?: boolean, topDistance = 0) => {
      if (index >= props.data.length - 1) {
        scrollToBottom()
      } else {
        const offset = virtual.getOffset(index) - topDistance
        scrollToOffset(offset, smooth)
      }
    }

    /**
     * 滚动到指定偏移量
     * @param offset 滚动条偏移量
     */
    const scrollToOffset = (offset: number, smooth = false) => {
      if (rootRef.value) {
        // rootRef.value.scrollTop = offset
        rootRef.value.scroll({
          left: 0,
          top: offset,
          behavior: smooth ? 'smooth' : 'auto',
        })
      }
    }

    /**
     * 渲染插槽列表-（重点函数）
     * @returns {VNode[]} 插槽列表
     */
    const getRenderSlots = () => {
      const slots = []
      const { start, end } = range.value! // 解构获取范围的起始、结束索引
      const { data, dataKey, item, itemProps, dataPropName } = props
      for (let index = start; index <= end; index++) {
        const dataSource = data[index] as DataSource // 获取当前索引的数据项
        if (dataSource) {
          // 取这个项里面的唯一标识拿来做key
          const uniqueKey =
            typeof dataKey === 'function' ? dataKey(dataSource) : dataSource[dataKey]
          // 如果唯一标识是字符串或者数字则渲染
          if (typeof uniqueKey === 'string' || typeof uniqueKey === 'number') {
            slots.push(
              <Item
                index={index}
                uniqueKey={uniqueKey}
                source={dataSource}
                component={item}
                itemProps={itemProps}
                dataPropName={dataPropName}
                onItemResize={onItemResized}
              />,
            )
          }
        }
      }
      return slots
    }

    // 数据项大小改变时触发
    const onItemResized = (id: string, size: number) => {
      virtual.saveSize(id, size)
      emit('resized', id, size)
    }

    // 滚动到底部
    const scrollToBottom = (smooth?: boolean) => {
      if (shepherd.value) {
        const offset = shepherd.value.offsetTop
        scrollToOffset(offset, smooth)
        setTimeout(() => {
          if (getOffset() + getClientSize() < getScrollSize()) {
            scrollToBottom(smooth)
          }
        }, 3)
      }
    }

    const getSizes = () => {
      return virtual.sizes.size
    }

    onBeforeMount(() => {
      installVirtual()
    })

    onActivated(() => {
      scrollToOffset(virtual.offset)
    })

    onMounted(() => {
      if (props.start) {
        scrollToIndex(props.start)
      } else if (props.offset) {
        scrollToOffset(props.offset)
      }
      emit('ok')
    })

    onUnmounted(() => {
      virtual.destroy()
    })

    expose({
      scrollToBottom,
      getSizes,
      getSize,
      getOffset,
      getScrollSize,
      getClientSize,
      scrollToOffset,
      scrollToIndex,
    })

    return () => {
      const { padFront, padBehind } = range.value!
      return (
        <div ref={rootRef} onScroll={onScroll}>
          <div style={{ padding: `${padFront}px 0px ${padBehind}px` }}>{getRenderSlots()}</div>
          <div ref={shepherd} style={{ width: '100%', height: '0px' }} />
        </div>
      )
    }
  },
})
