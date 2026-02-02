import { ref, onBeforeUnmount } from 'vue'

export function useWakeLock() {
  const wakeLock = ref(null)
  const isSupported = 'wakeLock' in navigator

  const acquire = async () => {
    if (!isSupported) {
      console.warn('Wake Lock API not supported')
      return false
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

  // Re-acquire wake lock when page becomes visible again
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && wakeLock.value === null) {
      // Only re-acquire if we had it before (handled by caller)
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
