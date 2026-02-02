import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    muted: true,
    lastUsedTime: 25,
    keepScreenOn: false,
    notificationsEnabled: false,
    language: 'en'
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
    }
  },

  persist: true
})
