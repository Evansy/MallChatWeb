import { defineComponent, onMounted, onUnmounted, ref, nextTick, computed } from 'vue'
import { debounce } from 'lodash'
import DOMPurify from 'dompurify'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import './renderMsg.scss'

export default defineComponent({
  props: ['urlMap', 'text', 'isMe', 'msg'],
  emits: ['updateTooltip'],
  setup(props, ctx) {
    const divRef = ref()
    // 渲染的html字符串
    const result = ref('')
    // 是否需要显示展开收起的按钮，取决于文字行数
    const needCollapse = ref(false)
    const collapseIcon = computed(() =>
      props.msg.message.isCollapse ? <ArrowDown class="collapse-icon" /> : <ArrowUp class="collapse-icon" />,
    )
    const isPlainText = !props.urlMap || !Object.keys(props.urlMap).length

    if (isPlainText) {
      result.value = ref(props.text)
    }
    result.value = DOMPurify.sanitize(props.text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    for (const [url, title] of Object.entries(props.urlMap)) {
      result.value = result.value?.replace(
        url,
        `<a rel="noopener noreferrer nofollow" target="_blank" class="msg-content-link" style="color: ${
          props.isMe ? '#fff' : 'var(--color-primary)'
        };" href="${url.includes('http') ? url : `//${url}`}">${title}</a>`,
      )
    }

    const isNeedCollapse = () => {
      // TODO: 这里未来可以考虑更好的方法去判断行数
      nextTick(() => {
        divRef.value && (needCollapse.value = +(divRef.value.clientHeight / 22.5).toFixed(0) > 5)
      })
    }
    const isNeedCollapseDebounce = debounce(isNeedCollapse, 300)

    onMounted(() => {
      // 刚开始渲染的时候不能用防抖
      isNeedCollapse()
      window.addEventListener('resize', isNeedCollapseDebounce)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', isNeedCollapseDebounce)
    })

    const onToggleCollapse = () => {
      // 由于使用了虚拟列表所以需要在数据源上设置是否展开的标志位，
      // TODO: 这里改变props的方式也不是太好，未来有可能改成emit，或者去状态中取;但目前来看比较方便
      // eslint-disable-next-line vue/no-mutating-props
      props.msg.message.isCollapse = !props.msg.message.isCollapse
      nextTick(() => {
        ctx.emit('updateTooltip')
      })
    }

    return () => {
      return (
        <>
          <div
            v-html={result.value}
            ref={divRef}
            class={{
              'msg-item': true,
              collapse: needCollapse.value && props.msg.message.isCollapse,
            }}
          />
          {needCollapse.value ? (
            <div class="collapse-box" onClick={onToggleCollapse}>
              {collapseIcon.value}
            </div>
          ) : null}
        </>
      )
    }
  },
})
