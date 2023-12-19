import type { Router } from 'vue-router'
import createPermissionGuard from './permissionGuard'

const createGuard = (router: Router) => {
  createPermissionGuard(router)
}

export default createGuard
