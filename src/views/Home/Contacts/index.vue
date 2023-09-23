<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useContactStore } from '@/stores/contacts'
import ContactList from './components/ContactList/index.vue'

const contactStore = useContactStore()
onBeforeMount(() => {
  // 默认执行一次
  contactStore.getContactList(true)
  contactStore.getRequestFriendsList(true)
})
</script>

<template><ContactList /></template>
