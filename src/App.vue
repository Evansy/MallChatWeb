<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app_wrapper">
    <RouterView />
  </div>
</template>
<style scoped>
.app_wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-image: url(@/assets/login_bg.jpg);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
</style>
