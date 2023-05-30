import { defineComponent } from 'vue'

export default defineComponent({
  props: ['urlMap', 'text', 'isMe'],
  setup(props) {
    return () => {
      if (!props.urlMap || Object.keys(props.urlMap).length === 0) return props.text

      let result = props.text
      console.log(result)
      for (const [url, title] of Object.entries(props.urlMap)) {
        result = result?.replace(
          url,
          `<a rel="noopener noreferrer nofollow" target="_blank" class="msg-content-link" style="color: var(${
            props.isMe ? '#fff' : '--color-primary'
          });" href="${url.includes('http') ? url : `//${url}`}">${title}</a>`,
        )
      }
      return <div innerHTML={result} />
    }
  },
})
