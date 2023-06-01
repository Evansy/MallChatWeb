import { defineComponent } from 'vue'
// import DOMPurify from 'dompurify'
import md from '@/libs/markdown-it'

export default defineComponent({
  props: ['urlMap', 'text', 'isMe'],
  setup(props) {
    return () => {
      const html = md.render(props.text)
      return <div v-html={html} />
      // if (!props.urlMap || Object.keys(props.urlMap).length === 0) return props.text

      // let result = props.text
      // console.log(result)
      // for (const [url, title] of Object.entries(props.urlMap)) {
      //   result = result?.replace(
      //     url,
      //     `<a rel="noopener noreferrer nofollow" target="_blank" class="msg-content-link" style="color: ${
      //       props.isMe ? '#fff' : 'var(--color-primary)'
      //     };" href="${url.includes('http') ? url : `//${url}`}">${title}</a>`,
      //   )
      // }
      // const clean = DOMPurify.sanitize(result, {
      //   ALLOWED_TAGS: ['a'],
      //   ALLOWED_ATTR: ['style', 'href', 'rel', 'class', 'target'],
      // })
      // return <div v-html={clean} />
    }
  },
})
