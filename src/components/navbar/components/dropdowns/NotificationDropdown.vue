<template>
  <div class="notification-dropdown">
    <audio ref="notificationSound" preload="auto">
      <source src="../../../../assets/noti.wav" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>

    <div
      class="notification-icon"
      :class="{ 'has-unread': unreadCount > 0 }"
      @click="toggleDropdown"
    >
      <span class="bell-emoji">🔔 </span>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </div>

    <div v-if="isOpen" class="notification-content">
      <div class="header">
        <h3>الإشعارات ({{ totalNotifications }})</h3>
        <button v-if="messages.length > 0" class="clear-btn" @click="clearCurrentPageNotifications">
          حذف المعروضة
        </button>
      </div>

      <div v-if="loading" class="empty-state">
        جاري التحميل...
      </div>

      <div v-else-if="messages.length === 0" class="empty-state">
        لا توجد إشعارات
      </div>

      <div v-else class="messages-list" ref="messagesList">
        <div
          v-for="(msg, index) in messages"
          :key="msg.id"
          class="message-item"
          :class="{ unread: msg.unread }"
          @click="markAsRead(msg, index)"
        >
          <div class="message-header-row">
            <p class="message-title">
              <span class="msg-id">#{{ msg.id }}</span>: {{ msg.title }}
            </p>
            <button class="item-delete-btn" @click.stop="deleteSingleNotification(msg.notification_id)">
              🗑️
            </button>
          </div>
          <p class="message-body">{{ msg.body }}</p>
          <small class="message-time">{{ msg.time }}</small>
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="!loading && totalPages > 1" class="pagination-controls">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          السابق
        </button>

        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          التالي
        </button>
      </div>

      <div v-if="!loading && totalPages > 1" class="pagination-info">
        صفحة {{ currentPage }} من {{ totalPages }} • {{ totalNotifications }} إشعار
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import Pusher from 'pusher-js'
import { useRouter } from "vue-router";

const router = useRouter()
const messages = ref([])
const isOpen = ref(false)
const loading = ref(false)
const error = ref(null)
const messagesList = ref(null)
const notificationSound = ref(null) // Reference to <audio>

const currentPage = ref(1)
const totalPages = ref(1)
const totalNotifications = ref(0)
const perPage = ref(5)

const userId = ref(1)
try {
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}')
  userId.value = authUser?.id || 1
} catch (e) {
  console.warn('Cannot parse authUser', e)
}

const channelName = `private-admin.notifications.${userId.value}`
const unreadCount = ref(0)

let pusher = ref(null)
let channel = ref(null)

onMounted(async () => {
  await loadNotifications(currentPage.value)
  initPusher()
})

onUnmounted(() => {
  if (pusher.value) {
    channel.value?.unbind_all?.()
    channel.value?.unsubscribe?.()
    pusher.value.disconnect()
  }
})

function initPusher() {
  pusher.value = new Pusher('a8e2b9d879856b603476', {
    cluster: 'ap2',
    forceTLS: true,
    authEndpoint: 'https://api.shift7store.com/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        Accept: 'application/json'
      }
    }
  })

  channel.value = pusher.value.subscribe(channelName)
  channel.value.bind('notification.created', (data) => {
    addRealTimeNotification(data)
  })
}

async function loadNotifications(page = 1) {
  if (page < 1 || (totalPages.value && page > totalPages.value)) return

  loading.value = true
  error.value = null

  try {
    const res = await axios.get('/api/user-notification', {
      params: { page },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    unreadCount.value = res.data.data.unread_count;
    const pagination = res.data.data || {}
    currentPage.value = pagination.current_page || 1
    totalPages.value = pagination.last_page || 1
    totalNotifications.value = pagination.total || 0
    perPage.value = pagination.per_page || 5

    messages.value = (pagination.data || []).map(item => mapNotification(item))

    nextTick(() => {
      if (messagesList.value) messagesList.value.scrollTop = 0
    })
  } catch (err) {
    error.value = 'تعذر تحميل الإشعارات'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function mapNotification(item) {
  return {
    id: item.meta_data?.order_id || item.id || Math.floor(Math.random() * 100000),
    title: item.title || 'إشعار جديد',
    body: item.body || '',
    unread: item.is_seen === 0,
    notification_id: item.id,
    time: formatArabicDate(item.created_at || new Date()),
  }
}

function addRealTimeNotification(data) {
  const notification = mapNotification({
    id: data.payload.id || Math.floor(Math.random() * 100000),
    title: data.payload.title || 'إشعار فوري',
    body: data.payload.body || data.payload.message || 'محتوى جديد',
    is_seen: 0,
    created_at: new Date()
  })

  // Avoid duplicates
  if (!messages.value.some(m => m.id === notification.id)) {
    messages.value.unshift(notification)
    totalNotifications.value += 1

    // Play sound when new notification arrives
    playNotificationSound()

    if (isOpen.value) {
      nextTick(() => {
        if (messagesList.value) messagesList.value.scrollTop = 0
      })
    }
  }
}

function playNotificationSound() {
  if (notificationSound.value) {
    notificationSound.value.currentTime = 0 // Rewind to start
    notificationSound.value.play().catch(err => {
      console.warn('Could not play notification sound (possibly autoplay blocked):', err)
    })
  }
}

async function markAsRead(msg, index) {
  console.log('Notification clicked:', msg)
  router.push({ name: 'order-show', params: { id: msg.id } })
  if (!msg.unread) return
  try {
    await axios.post(`/api/user-notification/${msg.id}/mark-as-read`)
    messages.value[index].unread = false
  } catch (err) {
    console.error('Mark as read failed:', err)
  }
}

/**
 * Global/Bulk delete API workflow handler
 * @param {Array<number|string>} ids
 */
async function deleteNotificationsFromApi(ids) {
  if (!ids || ids.length === 0) return

  try {
    // Converts array into comma separated query parameters format: ?ids=1,2,3
    const idsParam = ids.join(',')
    await axios.post(`/api/user-notification/delete/notifications?ids=${idsParam}`)

    // Refresh the list seamlessly from current page or pull down remaining count items
    if (messages.value.length === ids.length && currentPage.value > 1) {
      await loadNotifications(currentPage.value - 1)
    } else {
      await loadNotifications(currentPage.value)
    }
  } catch (err) {
    console.error('Delete request failed:', err)
    error.value = 'تعذر حذف الإشعارات من الخادم'
  }
}

function clearCurrentPageNotifications() {
  const allIdsOnPage = messages.value.map(m => m.notification_id)
  deleteNotificationsFromApi(allIdsOnPage)
}

function deleteSingleNotification(id) {
  console.log('Deleting notification with ID:', id)
  deleteNotificationsFromApi([id])
}

function changePage(page) {
  if (page === currentPage.value) return
  loadNotifications(page)
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function formatArabicDate(dateInput) {
  const date = new Date(dateInput)
  return date.toLocaleString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  })
}
</script>

<style lang="scss" scoped>
.notification-dropdown {
  position: relative;
  direction: rtl;
  font-family: sans-serif;
}

.notification-icon {
  cursor: pointer;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  &.has-unread {
    background: #fff3e0;
  }
}

.badge {
  background: #e53935;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.notification-content {
  position: absolute;
  top: 50px;
  left: 0;
  width: 350px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;

  h3 { margin: 0; font-size: 1.1rem; }
  .clear-btn {
    background: none; border: none; color: #e53935; cursor: pointer; font-size: 0.85rem;
    &:hover { text-decoration: underline; }
  }
}

.messages-list {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 10px;
  }
}

.message-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: #f9f9f9; }

  &.unread {
    background: #f0f7ff;
    border-right: 4px solid #2196f3;
  }
}

.message-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.item-delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 2px 4px;
  opacity: 0.5;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.message-title {
  margin: 0 0 5px;
  font-weight: bold;
  font-size: 0.95rem;
  color: #333;
  flex-grow: 1;

  .msg-id {
    color: #2196f3;
    font-family: monospace;
  }
}

.message-body {
  margin: 0 0 5px;
  font-size: 0.85rem;
  color: #666;
}

.message-time {
  font-size: 0.75rem;
  color: #999;
}

.empty-state, .error-message {
  padding: 20px;
  text-align: center;
  color: #888;
}

.error-message {
  color: #e53935;
}

.pagination-info {
  padding: 8px;
  background: #f8f8f8;
  font-size: 0.8rem;
  text-align: center;
  color: #777;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 36px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f0f0f0;
    border-color: #bbb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: #2196f3;
    color: white;
    border-color: #2196f3;
  }
}
</style>
