<script setup lang="ts">
// import githubIcon from '@/assets/github.svg'
const onGithubIconClick = () =>{
  window.open("https://github.com/Evansy/MallChatWeb", "_blank")
}
</script>

<template>
  <aside class="side_toolbar">
    <ElAvatar
      size="large"
      src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
    />
    <i class="icon-github" @click="onGithubIconClick" />
  </aside>
</template>

<style lang="scss" src="./styles.scss" scoped />
