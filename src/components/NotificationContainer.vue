<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-full">
    <transition-group name="notification-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item animate-fade-in"
        :class="notificationClass(notification.type)"
      >
        <div class="flex items-start gap-3">
          <div class="h-5 w-5 flex-shrink-0 mt-0.5">
            <Icon :name="iconName(notification.type)" :class="iconClass(notification.type)" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-sm mb-1 truncate">{{ notification.title }}</h3>
            <p class="text-xs opacity-90 line-clamp-2">{{ notification.message }}</p>
          </div>
          <button
            @click="removeNotification(notification.id)"
            class="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <Icon name="X" class="h-4 w-4" />
          </button>
        </div>
        <div class="mt-2 h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-current transition-all duration-300 ease-linear"
            :style="{ transform: `translateX(-${progress}%)` }"
          ></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationStore } from '../stores/notification'
import Icon from './Icon.vue'

const notificationStore = useNotificationStore()
const notifications = computed(() => notificationStore.notifications)

const progress = computed(() => {
  // 返回一个固定的值表示进度条已走完
  return 0
})

function notificationClass(type: string) {
  const classes = {
    success: 'bg-green-900/30 border border-green-500/30 text-green-300',
    error: 'bg-red-900/30 border border-red-500/30 text-red-300',
    warning: 'bg-yellow-900/30 border border-yellow-500/30 text-yellow-300',
    info: 'bg-blue-900/30 border border-blue-500/30 text-blue-300'
  }
  return `${classes[type as keyof typeof classes] || classes.info} glass-panel backdrop-blur-xl`
}

function iconName(type: string) {
  const icons = {
    success: 'CheckCircle',
    error: 'AlertCircle',
    warning: 'AlertTriangle',
    info: 'Info'
  }
  return icons[type as keyof typeof icons] || 'Info'
}

function iconClass(type: string) {
  const classes = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }
  return `${classes[type as keyof typeof classes] || classes.info} h-5 w-5`
}

function removeNotification(id: string) {
  notificationStore.removeNotification(id)
}
</script>

<style scoped>
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}

.notification-list-enter-from,
.notification-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-list-move {
  transition: transform 0.3s ease;
}
</style>