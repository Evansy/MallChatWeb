<script setup lang="ts" name="ContactSide">
import { computed } from 'vue'
import { useContactStore } from '@/stores/contacts'
import type { ContactItem as ContactItemType } from '@/services/types'
import type Node from 'element-plus/es/components/tree/src/model/node'
import type { TreeData, TreeOptionProps } from 'element-plus/es/components/tree/src/tree.type'

import ContactItem from './ContactItem.vue'
import NewFriendItem from './NewFriendItem.vue'

const contactStore = useContactStore()

const data = computed(() => contactStore.contactSideTree || [])
const props: TreeOptionProps = {
  label: 'label',
  children: 'children',
  class: (_, node: Node) => (node.isLeaf ? 'contact-tree-item' : ''),
}

const onNodeClick = (data: TreeData & { item: ContactItemType }) => {
  // console.log(node, data)
  contactStore.selectedContact = data.item
}
</script>

<template>
  <el-tree
    class="contact-tree"
    :data="data"
    :props="props"
    @node-click="onNodeClick"
    default-expand-all
  >
    <template #default="{ node, data }">
      <NewFriendItem v-if="data.type === 'newFriends'" :node="node" :data="data" />
      <ContactItem v-if="data.type === 'myContacts'" :node="node" :data="data" />
    </template>
  </el-tree>
</template>

<style lang="scss" src="./styles.scss" scoped />

<style lang="scss">
.contact-tree-item .el-tree-node__content {
  width: 100%;
  height: 60px;
}
</style>
