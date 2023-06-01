import hljs from '@/libs/hljs'
import MarkdownIt from 'markdown-it'

const md: MarkdownIt = MarkdownIt({
  breaks: true,
  highlight: function(code: string, lang: string) {
    let result = code
    if(!['java', 'javascript', 'json'].includes(lang)) return result = md.utils.escapeHtml(code) // 限制支持的语言
    if(lang && hljs.getLanguage(lang)) {
      try {
        result = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
      } catch (__) {
        result = md.utils.escapeHtml(code)
      }
    }
    return `<pre class="hljs"><code class="${this.langPrefix}${lang}">${result}</code></pre>`
  }
})

export default md
