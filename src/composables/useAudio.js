import { ref, onBeforeUnmount } from 'vue'
import { useSettingsStore } from '@/stores/settings'

/**
 * Composable for managing audio playback with automatic cleanup
 */
export function useAudio(audioUrl) {
  const settings = useSettingsStore()
  const audio = ref(null)

  // Initialize audio
  const initAudio = () => {
    if (!audio.value) {
      audio.value = new Audio(audioUrl)
    }
  }

  // Play sound if not muted
  const play = () => {
    if (audio.value && !settings.muted) {
      audio.value.currentTime = 0
      audio.value.play()
    }
  }

  // Cleanup to prevent memory leaks
  const cleanup = () => {
    if (audio.value) {
      audio.value.pause()
      audio.value.src = ''
      audio.value = null
    }
  }

  // Auto-cleanup on unmount
  onBeforeUnmount(cleanup)

  return {
    initAudio,
    play,
    cleanup
  }
}
