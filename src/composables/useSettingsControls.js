import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

/**
 * Composable for common settings-related UI controls
 */
export function useSettingsControls() {
  const settings = useSettingsStore()

  const muteIcon = computed(() => {
    return settings.muted ? 'mdi-volume-variant-off' : 'mdi-volume-high'
  })

  const muteColor = computed(() => {
    return settings.muted ? 'grey' : 'green-darken-2'
  })

  return {
    settings,
    muteIcon,
    muteColor
  }
}
