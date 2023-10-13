<script setup lang="ts" name="CreateGroupModal">
import { ref, watch, computed } from 'vue'
import { useContactStore } from '@/stores/contacts'
import Avatar from '@/components/Avatar/index.vue'
import { useGlobalStore } from '@/stores/global'
import type {
  renderContent,
  // TransferKey,
  // TransferDirection,
} from 'element-plus/es/components/transfer'
import { useUserInfo } from '@/hooks/useCached'

const globalStore = useGlobalStore()
const contactStore = useContactStore()
const data = ref<
  {
    label: number
    key: number
    initial: number
    disabled: boolean
  }[]
>([])

// const data = computed(() =>
//   contactStore.contactsList.map((item) => ({
//     label: item.uid,
//     key: item.uid,
//     initial: item.uid,
//   })),
// )
const contactsList = computed(() => contactStore.contactsList)
const selectedUid = computed(() => globalStore.createGroupModalInfo.selectedUid)
watch(
  contactsList,
  (val) => {
    data.value = val.map((item) => ({
      label: item.uid,
      key: item.uid,
      initial: item.uid,
      disabled: false,
    }))
  },
  { immediate: true, deep: true },
)
watch(
  selectedUid,
  (val) => {
    val.forEach((item) => {
      const dataItem = data.value.find((i) => i.key === item)
      if (dataItem) {
        dataItem.disabled = true
      }
    })
  },
  { immediate: true },
)
// const defaultChecked = computed(() => globalStore.createGroupModalInfo.selectedUid)
const selected = ref([])

const emit = defineEmits(['checked'])

const renderFunc: renderContent = (h, option) => {
  const user = useUserInfo(option.key)
  return h('div', { style: 'display:flex;align-items:center;gap:6px' }, [
    h(Avatar, { src: user.value.avatar, size: 20, class: 'avatar' }),
    h('div', { class: 'tem-info-name' }, user.value.name),
  ])
}
// const handleChange = (
//   value: TransferKey[],
//   direction: TransferDirection,
//   movedKeys: TransferKey[],
// ) => {
const handleChange = () => {
  emit('checked', Object.values(selected.value))
}
</script>

<template>
  <el-transfer
    v-model="selected"
    style="display: inline-block; text-align: left"
    :render-content="renderFunc"
    :titles="['Source', 'Target']"
    :format="{
      noChecked: '${total}',
      hasChecked: '${checked}/${total}',
    }"
    :data="data"
    @change="handleChange"
  >
  </el-transfer>
</template>

<style lang="scss" src="./styles.scss" scoped />
