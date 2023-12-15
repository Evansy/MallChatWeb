import type { Router } from 'vue-router'

import { useUserStore } from '@/stores/user'

// 白名单，未登录用户可以访问
const whiteList: Array<string | RegExp> = ['/']

const whiteListTest = (path: string) => {
  return whiteList.some((o) => {
    if (o instanceof RegExp) {
      return o.test(path)
    } else {
      return o === path
    }
  })
}

const createPermissionGuard = (router: Router) => {
  router.beforeEach(async (to, from, next) => {
    // 是否登录
    const userStore = useUserStore()
    const isSign = userStore.isSign

    if (whiteListTest(to.path) || isSign) {
      return next()
    } else {
      return next({ path: '/', replace: true })
    }
  })
}

export default createPermissionGuard
