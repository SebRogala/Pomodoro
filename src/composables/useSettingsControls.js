import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useSettingsControls() {
  const settings = useSettingsStore()

  const muteIcon = computed(() => {
    return settings.muted ? 'mdi-volume-variant-off' : 'mdi-volume-high'
  })

  const muteColor = computed(() => {
    return settings.muted ? 'grey-darken-2' : 'grey-lighten-1'
  })

  const screenLockIcon = computed(() => {
    return settings.keepScreenOn ? 'mdi-cellphone' : 'mdi-cellphone-off'
  })

  const screenLockColor = computed(() => {
    return settings.keepScreenOn ? 'green-darken-2' : 'grey-darken-2'
  })

  const langLabel = computed(() => {
    return settings.language.toUpperCase()
  })

  const toggleLanguage = () => {
    const newLang = settings.language === 'en' ? 'pl' : 'en'
    settings.setLanguage(newLang)
  }

  return {
    settings,
    muteIcon,
    muteColor,
    screenLockIcon,
    screenLockColor,
    langLabel,
    toggleLanguage
  }
}
