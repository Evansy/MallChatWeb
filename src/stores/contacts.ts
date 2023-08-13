import { reactive, computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { TreeData } from 'element-plus/es/components/tree-v2/src/types'
import apis from '@/services/apis'
import type { ContactItem, RequestFriendItem } from '@/services/types'

export const pageSize = 20

export const useContactStore = defineStore('contact', () => {
  const contactsList = reactive<ContactItem[]>([])
  const requestFriendsList = reactive<RequestFriendItem[]>([])
  /** 点击联系人选中的联系人项 */
  const selectedContact = ref<ContactItem | RequestFriendItem>()

  const contactsOptions = reactive({ isLast: false, isLoading: false, cursor: '' })
  const requestFriendsOptions = reactive({ isLast: false, isLoading: false, cursor: '' })

  const contactSideTree = computed<TreeData>(() => [
    {
      label: '新的朋友',
      value: 1,
      type: 'newFriends',
      children: requestFriendsList.map((item) => ({
        label: item.uid,
        value: item.uid,
        item,
        type: 'newFriends',
      })),
    },
    {
      label: '联系人',
      value: 2,
      type: 'myContacts',
      children: contactsList.map((item) => ({
        label: item.uid,
        value: item.uid,
        item,
        type: 'myContacts',
      })),
    },
  ])

  const getContactList = async (isFresh = false) => {
    contactsOptions.isLoading = true
    const data = await apis
      .getContactList({
        params: {
          pageSize,
          cursor: isFresh || !contactsOptions.cursor ? undefined : contactsOptions.cursor,
        },
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
    requestFriendsOptions.isLoading = true
    const data = await apis
      .requestFriendList({
        params: {
          pageSize,
          cursor:
            isFresh || !requestFriendsOptions.cursor ? undefined : requestFriendsOptions.cursor,
        },
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
    contactSideTree,
    selectedContact,
    onAcceptFriend,
    onDeleteContact,
  }
})
