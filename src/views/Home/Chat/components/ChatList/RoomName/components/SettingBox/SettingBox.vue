<script setup lang="ts">
import AdvancedSetting from './components/AdvancedSetting/AdvancedSetting.vue'
import DeadZoneSetting from './components/DeadZoneSetting/DeadZoneSetting.vue'
</script>

<template>
  <div class="setting-box">
    <el-divider content-position="left">高级</el-divider>
    <div class="advanced">
      <AdvancedSetting />
    </div>
    <el-divider content-position="left">危险区</el-divider>
    <div class="dead-zone">
      <DeadZoneSetting />
    </div>
  </div>
</template>
