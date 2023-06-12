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
      const result = clean
      const keys = Object.keys(props.urlMap) // 获取所有匹配的字符串

      // 使用匹配字符串创建动态正则表达式，并将文本拆分为片段数组
      const fragments = result.split(new RegExp(`(${keys.join('|')})`))
      const color = props.isMe ? '#fff' : 'var(--color-primary)'
      const chunks = fragments.map((item) =>
        keys.includes(item) ? (
          <a
            rel="noopener noreferrer nofollow"
            target="_blank"
            class="msg-content-link"
            style={color}
          >
            {props.urlMap[item]}
          </a>
        ) : (
          item
        ),
      )
      return chunks
    }
  },
})
