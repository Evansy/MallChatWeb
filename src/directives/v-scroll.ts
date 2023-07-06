import { throttle } from 'lodash'
import type { Directive } from 'vue'

let timer: number | undefined

const handleScroll = throttle((el) => {
  if (timer) {
    clearTimeout(timer)
  }
  if (el.classList.contains('auto-hide-scroll')) {
    el.classList.remove('auto-hide-scroll')
  }
  if (!el.classList.contains('auto-show-scroll')) {
    el.classList.add('auto-show-scroll')
  }
  timer = setTimeout(() => {
    el.classList.remove('auto-show-scroll')
    el.classList.add('auto-hide-scroll')
  }, 2000)
}, 200)

const vScroll: Directive = {
  mounted(el) {
    el.fn = handleScroll.bind(null, el)
    el.classList.add('auto-hide-scroll')
    el.addEventListener('wheel', el.fn)
  },
  unmounted(el) {
    if (timer) {
      clearTimeout(timer)
    }
    el.removeEventListener('wheel', el.fn)
  },
}

export default vScroll
