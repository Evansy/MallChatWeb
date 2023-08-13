<script setup lang="ts" name="NewFriendItem">
import { toRefs, computed } from 'vue'
import { useContactStore } from '@/stores/contacts'
import { RequestFriendAgreeStatus } from '@/services/types'
import type { RequestFriendItem } from '@/services/types'
import { useUserInfo } from '@/hooks/useCached'
import type { TreeNode, TreeNodeData } from 'element-plus/es/components/tree-v2/src/types'

const props = defineProps<{ node: TreeNode; data: TreeNodeData & { item: RequestFriendItem } }>()

const { item } = toRefs(props.data)

const contactStore = useContactStore()

const currentUid = computed(() => item?.value?.uid)
const currentUser = useUserInfo(currentUid.value)
</script>

<template>
  <span v-if="!node.isLeaf">{{ node.label }}</span>
  <div class="item-info" v-else>
    <Avatar class="avatar" :src="currentUser.avatar" :size="40" />
    <div class="item-info-right">
      <span class="item-info-name">
        {{ currentUser.name }}
        <template v-if="node.isLeaf && data.item">
          <button
            class="item-info-accept-btn"
            v-if="data.item.status === RequestFriendAgreeStatus.Waiting"
            @click="contactStore.onAcceptFriend(data.item.applyId)"
          >
            接受
          </button>
          <span class="item-info-accept-text" v-else>已添加</span>
        </template></span
      >
      <span class="item-info-msg">{{ data.item?.msg }}</span>
    </div>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
