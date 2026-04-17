<template>
  <div
    class="smart-image"
    :class="{ default: !data.props.inlineStyle.image }"
    :style="data.props.inlineStyle"
    :data-id="data.props.cid"
  ></div>
</template>
<script setup lang="ts">
import { ComponentSchema } from '@/domain/schema/component'
import { useUiConfig } from '@/composables/useUiConfig'
const props = defineProps<{
  data: ComponentSchema
}>()
useUiConfig(props.data.id)
</script>
<style coped>
.default {
  background-image: url('@/assets/images/default.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-color: rgb(228 228 231 / var(--tw-text-opacity, 1));
  width: 7.5rem;
  height: 7.5rem;
  display: inline-block;
}
</style>
