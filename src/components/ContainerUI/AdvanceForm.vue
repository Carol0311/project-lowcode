<template>
  <div>
    <component v-for="com in initComponents" :is="com.name" :key="com.id" />
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { Text } from '@/components/UintUI'
const initComponents = ref([
  { id: 'f1', name: Text },
  { id: 'f2', name: Text },
  { id: 'f3', name: Text },
  { id: 'f4', name: Text },
  { id: 'f5', name: Text },
  { id: 'f6', name: Text },
  { id: 'f7', name: Text },
  { id: 'f8', name: Text },
])
</script>
<style scoped></style>
