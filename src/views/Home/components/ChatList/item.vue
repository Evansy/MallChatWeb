<script setup lang="ts">
import MsgItem from './MsgItem/index.vue'
import type { MessageItemType } from '@/services/types'
import type { PropType } from 'vue'

defineProps({
  source: {
    type: Object as PropType<MessageItemType>,
    required: true,
  },
})
</script>

<template>
  <div>
    <MsgItem bubble-mode="spread" :msg="source" />
  </div>
</template>
