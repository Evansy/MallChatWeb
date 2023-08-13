<script setup lang="ts" name="ContactItem">
import { toRefs, computed } from 'vue'
import { useUserInfo } from '@/hooks/useCached'
import type { ContactItem } from '@/services/types'
import type { TreeNode, TreeNodeData } from 'element-plus/es/components/tree-v2/src/types'

const props = defineProps<{ node: TreeNode; data: TreeNodeData & { item: ContactItem } }>()

const { item } = toRefs(props.data)

const currentUid = computed(() => item?.value?.uid)
const currentUser = useUserInfo(currentUid.value)
</script>

<template>
  <span v-if="!node.isLeaf">{{ node.label }}</span>
  <div class="item-info contact-item" v-else>
    <Avatar class="avatar" :src="currentUser.avatar" :size="40" />
    <div class="item-info-right">
      <span class="item-info-name"> {{ currentUser.name }}</span>
    </div>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
