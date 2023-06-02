import { defineComponent, onMounted, onUnmounted, onUpdated, ref } from 'vue'
export default defineComponent({
  name: 'VirtualListItem',
  props: {
    index: {
      type: Number,
    },
    source: {
      type: Object,
    },
    component: {
      type: [Object, Function],
    },
    uniqueKey: {
      type: [String, Number],
    },
  },
  emits: ['itemResize'],
  setup(props, { emit }) {
    const rootRef = ref<HTMLElement | null>(null)
    let resizeObserver: ResizeObserver | null = null

    const dispatchSizeChange = () => {
      const { uniqueKey } = props
      const size = rootRef.value ? rootRef.value.offsetHeight : 0
      emit('itemResize', uniqueKey, size)
    }

    onMounted(() => {
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          dispatchSizeChange()
        })
        rootRef.value && resizeObserver.observe(rootRef.value as HTMLElement)
      }
    })

    onUpdated(() => {
      dispatchSizeChange()
    })

    onUnmounted(() => {
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
    })

    return () => {
      const { component: Comp, index, source, uniqueKey } = props
      
      return (
        <div key={uniqueKey} ref={rootRef}>
            {/* @ts-ignore */}
          <Comp {...{source,index}} />
        </div>
      )
    }
  },
})
