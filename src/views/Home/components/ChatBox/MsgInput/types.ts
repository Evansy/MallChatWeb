import type { CacheUserItem } from '@/services/types'

export interface IPerson extends Partial<CacheUserItem> {}

export interface IMention extends Pick<IPerson, 'uid' | 'name' | 'avatar'> {
  offset: number
  length: number
}

export enum NodeType {
  text = 'text',
  br = 'br',
  at = 'at',
}

export interface INode {
  type: NodeType
  data: IPerson | string
}
