import { defineComponent } from 'vue'
import DOMPurify from 'dompurify'

/**
 * @param {isFlash} props 是否是闪烁的消息,这里是单纯文字闪烁
 */
export default defineComponent({
  props: ['urlMap', 'text', 'isMe'],
  setup(props) {
    return () => {
      if (!props.urlMap || Object.keys(props.urlMap).length === 0) return props.text

      // 先过滤所有标签
      const clean = DOMPurify.sanitize(props.text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })

      // 再替换标签，保证用户输入的内容是干净的
      let result = clean
      for (const [url, title] of Object.entries(props.urlMap)) {
        result = result?.replace(
          url,
          `<a rel="noopener noreferrer nofollow" target="_blank" class="msg-content-link" style="color: ${
            props.isMe ? '#fff' : 'var(--color-primary)'
          };" href="${url.includes('http') ? url : `//${url}`}">${title}</a>`,
        )
      }
      return <div v-html={result} />
    }
  },
})
