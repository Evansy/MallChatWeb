<script setup lang="ts">
import ToolBar from './components/ToolBar/index.vue'
import SideBar from './components/SideBar/index.vue'
import ChatBox from './components/ChatBox/index.vue'
// import LoginBox from '@/components/LoginBox/index.vue'
</script>

<template>
  <main class="home">
    <div class="wrapper">
      <ToolBar />
      <SideBar />
      <ChatBox />
    </div>
    <footer class="footer">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">闽ICP备2023004110号</a>
    </footer>

    <LoginBox />
  </main>
</template>

<style lang="scss" src="./styles.scss" scoped />
