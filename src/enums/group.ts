import { RoleEnum } from '@/enums/index'

/**
 * 群组角色映射
 */
export const GROUP_ROLE_MAP: Record<string, { text: string; class: string }> = {
  [RoleEnum.LORD]: {
    text: '群主',
    class: 'lord',
  },
  [RoleEnum.ADMIN]: {
    text: '管理员',
    class: 'admin',
  },
}
