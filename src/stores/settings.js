import { defineStore } from 'pinia'

// Detect browser language, default to 'en' if not Polish
function getDefaultLanguage() {
  const browserLang = navigator.language || navigator.userLanguage || 'en'
  return browserLang.startsWith('pl') ? 'pl' : 'en'
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    muted: false,
    lastUsedTime: 25,
    keepScreenOn: true,
    notificationsEnabled: false,
    language: getDefaultLanguage(),
    timerRunning: false // Not persisted
  }),

  actions: {
    toggleMuted() {
      this.muted = !this.muted
    },

    setLastUsedTime(time) {
      this.lastUsedTime = time
    },

    toggleKeepScreenOn() {
      this.keepScreenOn = !this.keepScreenOn
    },

    setNotificationsEnabled(enabled) {
      this.notificationsEnabled = enabled
    },

    setLanguage(lang) {
      this.language = lang
    },

    setTimerRunning(running) {
      this.timerRunning = running
    }
  },

  persist: {
    pick: ['muted', 'lastUsedTime', 'keepScreenOn', 'notificationsEnabled', 'language']
  }
})
