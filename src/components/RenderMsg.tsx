import { defineComponent } from 'vue'
import DOMPurify from 'dompurify'

// FIXME https://github.com/Evansy/MallChatWeb/issues/45
// 此方法也是可以被bypass的，完全安全需要修改render方式，不使用v-html
const sanitize = (text: string) => DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })

export default defineComponent({
  props: ['urlMap', 'text', 'isMe'],
  setup(props) {
    return () => {
      if (!props.urlMap || Object.keys(props.urlMap).length === 0) return props.text

      // 先过滤所有标签
      const clean = sanitize(props.text)

      // 再替换标签，保证用户输入的内容是干净的
      let result = clean
      for (const [url, title] of Object.entries(props.urlMap)) {
        result = result?.replace(
          url,
          `<a rel="noopener noreferrer nofollow" target="_blank" class="msg-content-link" style="color: ${
            props.isMe ? 'var(--color-white)' : 'var(--color-primary)'
          };" href="${url.includes('http') ? url : `//${url}`}">${sanitize(title as string)}</a>`,
        )
      }
      return <div v-html={result} />
    }
  },
})
