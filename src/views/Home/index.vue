<script setup lang="ts">
import ToolBar from './components/ToolBar/index.vue'
import SideBar from './components/SideBar/index.vue'
import ChatBox from './components/ChatBox/index.vue'
</script>

<template>
  <main class="wrapper">
    <ToolBar />
    <SideBar />
    <ChatBox />
  </main>
</template>

<style lang="scss" src="./styles.scss" scoped />
