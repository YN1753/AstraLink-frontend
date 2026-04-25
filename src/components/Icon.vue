<template>
  <component
    :is="lucideIcon"
    :size="size"
    :stroke-width="strokeWidth"
    :class="iconClasses"
  />
</template>

<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: number
  strokeWidth?: number
  class?: string
}>(), {
  size: 20,
  strokeWidth: 2,
  class: ''
})

const lucideIcon = computed(() => {
  const iconName = props.name as keyof typeof LucideIcons
  const icon = LucideIcons[iconName] || LucideIcons.AlertCircle
  return icon as any
})

const iconClasses = computed(() => {
  return ['inline-block', props.class].join(' ')
})
</script>