import { ref, onBeforeUnmount } from 'vue'

export function useWakeLock() {
  const wakeLock = ref(null)
  const isSupported = 'wakeLock' in navigator

  const acquire = async () => {
    if (!isSupported) {
      console.warn('Wake Lock API not supported')
      return false
    }

    // Already have an active wake lock
    if (wakeLock.value !== null) {
      return true
    }

    try {
      wakeLock.value = await navigator.wakeLock.request('screen')

      wakeLock.value.addEventListener('release', () => {
        wakeLock.value = null
      })

      return true
    } catch (err) {
      console.warn('Wake Lock request failed:', err.message)
      return false
    }
  }

  const release = async () => {
    if (wakeLock.value) {
      await wakeLock.value.release()
      wakeLock.value = null
    }
  }

  onBeforeUnmount(() => {
    release()
  })

  return {
    isSupported,
    isActive: () => wakeLock.value !== null,
    acquire,
    release
  }
}
