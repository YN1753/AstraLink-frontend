import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timeout?: number
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const maxNotifications = 5

  function addNotification(notification: Omit<Notification, 'id'>) {
    const id = Date.now().toString()
    const newNotification: Notification = {
      id,
      ...notification,
      timeout: notification.timeout || 4000
    }

    // 添加到列表开头
    notifications.value.unshift(newNotification)

    // 保持最大数量限制
    if (notifications.value.length > maxNotifications) {
      notifications.value = notifications.value.slice(0, maxNotifications)
    }

    // 自动移除通知
    setTimeout(() => {
      removeNotification(id)
    }, newNotification.timeout)
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clearAllNotifications() {
    notifications.value = []
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  }
})