import { 
  defineComponent,
  onActivated,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  watch
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
    [key: string]: any;
}

export default defineComponent({
  name: 'VirtualList',
  props: {
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
    dataKey: {
        type: [String, Function],
        required: true,
    },
    item: {
      type: [Object, Function],
      required: true,
    },
    keeps: {
      type: Number,
      default: 30,
    },
    size: {
      type: Number,
      default: 50,
    },
    start: {
      type: Number,
      default: 0,
    },
    offset: {
      type: Number,
      default: 0,
    },
    topThreshold: {
      type: Number,
      default: 0,
    },
    bottomThreshold: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { emit, expose }) {
    const range = ref<Range | null>(null)
    const rootRef = ref<HTMLElement | null>()
    const shepherd = ref<HTMLDivElement | null>(null)
    let virtual: Virtual

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

    const getSize = (id: string) => {
      return virtual.sizes.get(id)
    }
    const getOffset = () => {
        return rootRef.value ? Math.ceil(rootRef.value.scrollTop) : 0
    }
    const getClientSize = () => {
      const key = 'clientHeight'
      return rootRef.value ? Math.ceil(rootRef.value[key]) : 0
    }
    const getScrollSize = () => {
      const key = 'scrollHeight'
      return rootRef.value ? Math.ceil(rootRef.value[key]) : 0
    }

    const emitEvent = (offset:number, clientSize:number, scrollSize :number) => {
      emit('scroll', {offset, clientSize, scrollSize})
      
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

    const getUniqueIdFromDataSources = () => {
      const { dataKey, data = [] } = props
      return data.map((dataSource: any) =>
        typeof dataKey === 'function' ? dataKey(dataSource) : dataSource[dataKey],
      )
    }
    const onRangeChanged = (newRange: any) => {
      range.value = newRange
    }
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

    const scrollToIndex = (index: number) => {
      if (index >= props.data.length - 1) {
        scrollToBottom()
      } else {
        const offset = virtual.getOffset(index)
        scrollToOffset(offset)
      }
    }

    const scrollToOffset = (offset: number) => {
        if (rootRef.value) {
            rootRef.value.scrollTop = offset
        }
    }

    const getRenderSlots = () => {
      const slots = []
      const { start, end } = range.value!
      const { data, dataKey, item } = props
      for (let index = start; index <= end; index++) {
        const dataSource = data[index] as DataSource
        if (dataSource) {
          const uniqueKey = typeof dataKey === 'function' ? dataKey(dataSource) : dataSource[dataKey]
          if (typeof uniqueKey === 'string' || typeof uniqueKey === 'number') {
            slots.push(
              <Item
                index={index}
                uniqueKey={uniqueKey}
                source={dataSource}
                component={item}
                onItemResize={onItemResized}
              />,
            )
          }
        }
      }
      return slots
    }

    const onItemResized = (id: string, size: number) => {
      virtual.saveSize(id, size)
      emit('resized', id, size)
    }

    const scrollToBottom = () => {
      if (shepherd.value) {
        const offset = shepherd.value.offsetTop
        scrollToOffset(offset)
        setTimeout(() => {
          if (getOffset() + getClientSize() < getScrollSize()) {
            scrollToBottom()
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
          <div style={{padding: `${padFront}px 0px ${padBehind}px`}}>
            {getRenderSlots()}
          </div>
          <div ref={shepherd} style={{ width: '100%', height: '0px' }}/>
        </div>
      )
    }
  },
})
