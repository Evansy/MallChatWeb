/**
 * 这个文件负责渲染出传入自定义组件项
 * 主要作用和逻辑：
 * 1. 监听元素尺寸变化 - (耗性能可以考虑在高度固定的情况下不监听)
 * 2. 通知父组件当前项的高度-（这样做的目的是解决聊天信息这样不固定高度项的）
 * 3. 渲染出传入自定义组件项
 */
import { defineComponent, onMounted, onUnmounted, onUpdated, ref } from 'vue'
export default defineComponent({
  name: 'VirtualListItem',
  props: {
    // 下标
    index: {
      type: Number,
    },
    // 数据源
    source: {
      type: Object,
    },
    // 数据项组件
    component: {
      type: [Object, Function],
    },
    // 唯一标识键值
    uniqueKey: {
      type: [String, Number],
    },
    itemProps: {
      type: Object,
      default: () => {},
    },
    dataPropName: {
      type: String,
      default: 'source',
    },
  },
  emits: ['itemResize'],
  setup(props, { emit }) {
    const rootRef = ref<HTMLElement | null>(null) // 根节点
    // ResizeObserver实例 参考文档：https://developer.mozilla.org/zh-CN/docs/Web/API/ResizeObserver
    let resizeObserver: ResizeObserver | null = null

    /**
     * 尺寸变化事件
     * @description: 通知父组件当前项的高度
     */
    const dispatchSizeChange = () => {
      const { uniqueKey } = props
      const size = rootRef.value ? rootRef.value.offsetHeight : 0 // 当前项的高度
      emit('itemResize', uniqueKey, size)
    }

    onMounted(() => {
      if (typeof ResizeObserver !== 'undefined') {
        // 监听元素尺寸变化
        resizeObserver = new ResizeObserver(() => {
          dispatchSizeChange()
        })
        // 创建观察者实例并传入回调函数
        rootRef.value && resizeObserver.observe(rootRef.value as HTMLElement)
      }
    })

    onUpdated(() => {
      dispatchSizeChange()
    })

    // 组件卸载时关闭观察者监听实例
    onUnmounted(() => {
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
    })

    return () => {
      const { component: Comp, index, source, uniqueKey, itemProps, dataPropName } = props
      const merged = {
        ...itemProps,
        index,
        [dataPropName]: source, // 数据源给到指定属性上
      }
      // 渲染出传入自定义组件项-这里的Comp就是传入的自定义组件 (ts-ignore避免类型警告)
      return (
        <div key={uniqueKey} ref={rootRef} {...{ index }}>
          {/* @ts-ignore */}
          <Comp {...merged} />
        </div>
      )
    }
  },
})
