import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    urlMap: {
      type: Object,
      default: () => ({}),
    },
    text: {
      type: String,
      default: '',
    },
    isMe: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return () => {
      // 获取所有匹配的字符串
      const keys = Object.keys(props.urlMap)
      // 使用匹配字符串创建动态正则表达式，并将文本拆分为片段数组
      const fragments = props.text.split(new RegExp(`(${keys.join('|')})`))
      const color = props.isMe ? '#fff' : 'var(--color-primary)'
      const chunks = fragments.map((item) =>
        keys.includes(item) ? (
          <a
            rel="noopener noreferrer nofollow"
            target="_blank"
            class="msg-content-link"
            style={{ color }}
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
