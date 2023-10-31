<script setup lang="ts">
import { ref } from 'vue'
import type { EmojiBody } from '@/services/types'
import { useUserStore } from '@/stores/user'

defineProps<{ body: EmojiBody; id: number }>()

const userStore = useUserStore()

const hasLoadError = ref(false)
const isLoading = ref(true)

const handleError = () => {
  isLoading.value = false
  hasLoadError.value = true
}
</script>

<template>
  <div class="image emoji" :draggable="userStore.isSign ? 'true' : 'false'" :data-message-id="id">
    <div v-if="hasLoadError" class="image-slot">
      <Icon icon="dazed" :size="36" colorful />
      加载失败
    </div>
    <template v-else>
      <img v-if="body?.url" :src="body?.url" @error="handleError" :alt="body.url" />
    </template>
  </div>
</template>
