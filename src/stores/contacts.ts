import { reactive } from 'vue'
import { defineStore } from 'pinia'
import apis from '@/services/apis'
import type { ContactItem, RequestFriendItem } from '@/services/types'

export const pageSize = 20

export const useContactStore = defineStore('contact', () => {
  const contactsList = reactive<ContactItem[]>([])
  const requestFriendsList = reactive<RequestFriendItem[]>([])

  const contactsOptions = reactive({ isLast: false, isLoading: false, cursor: '' })
  const requestFriendsOptions = reactive({ isLast: false, isLoading: false, cursor: '' })

  const getContactList = async (isFresh = false) => {
    if (contactsOptions.isLast || contactsOptions.isLoading) return
    contactsOptions.isLoading = true
    const data = await apis
      .getContactList({
        // TODO 先写 100，稍后优化
        pageSize: 100,
        cursor: isFresh || !contactsOptions.cursor ? undefined : contactsOptions.cursor,
      })
      .send()
      .catch(() => {
        contactsOptions.isLoading = false
      })
    if (!data) return
    isFresh
      ? contactsList.splice(0, contactsList.length, ...data.list)
      : contactsList.push(...data.list)
    contactsOptions.cursor = data.cursor
    contactsOptions.isLast = data.isLast
    contactsOptions.isLoading = false
  }

  const getRequestFriendsList = async (isFresh = false) => {
    if (requestFriendsOptions.isLast || requestFriendsOptions.isLoading) return
    requestFriendsOptions.isLoading = true
    const data = await apis
      .requestFriendList({
        pageSize,
        cursor: isFresh || !requestFriendsOptions.cursor ? undefined : requestFriendsOptions.cursor,
      })
      .send()
      .catch(() => {
        requestFriendsOptions.isLoading = false
      })
    if (!data) return
    isFresh
      ? requestFriendsList.splice(0, requestFriendsList.length, ...data.list)
      : requestFriendsList.push(...data.list)
    requestFriendsOptions.cursor = data.cursor
    requestFriendsOptions.isLast = data.isLast
    requestFriendsOptions.isLoading = false
  }

  // 默认执行一次
  getContactList()
  getRequestFriendsList()

  /** 接受好友请求 */
  const onAcceptFriend = (applyId: number) => {
    // 同意好友申请
    apis
      .applyFriendRequest({ applyId })
      .send()
      .then(() => {
        // 刷新好友申请列表
        getRequestFriendsList(true)
        // 刷新好友列表
        getContactList(true)
      })
  }

  /** 删除好友 */
  const onDeleteContact = async (uid: number) => {
    if (!uid) return
    // 同意好友申请
    await apis.deleteFriend({ applyId: uid }).send()
    // 刷新好友申请列表
    // getRequestFriendsList(true)
    // 刷新好友列表
    getContactList(true)
  }

  return {
    getContactList,
    getRequestFriendsList,
    contactsList,
    requestFriendsList,
    contactsOptions,
    requestFriendsOptions,
    onAcceptFriend,
    onDeleteContact,
  }
})
