<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import gsap from 'gsap'
// defineProps<{
//   msg: string
// }>()
const tweened = reactive({ number: 0 })

onMounted(() => {
  console.log(tweened)
  gsap.to(tweened, { duration: 0.5, number: 100 || 0 })
})
</script>

<template>
  <div>
    {{ tweened.number.toFixed(0) }}
  </div>
</template>
