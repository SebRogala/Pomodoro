import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import i18n from './i18n'
import mitt from 'mitt'

// Create event bus
const emitter = mitt()

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(i18n)

// Provide event bus globally
app.config.globalProperties.$bus = emitter
app.provide('bus', emitter)

app.mount('#app')

// Register service worker with auto-reload on update (deferred if any timer is active)
import { registerSW } from 'virtual:pwa-register'
import { useSequencesStore } from './stores/sequences'
const sequences = useSequencesStore()

const isTimerActive = () => sequences.activeSequenceId || settings.timerRunning

registerSW({
  onNeedRefresh() {
    if (!isTimerActive()) {
      window.location.reload()
    } else {
      const unwatch = watch(isTimerActive, (active) => {
        if (!active) {
          unwatch()
          window.location.reload()
        }
      })
    }
  }
})

// Sync language from settings store after mount
import { useSettingsStore } from './stores/settings'
const settings = useSettingsStore()
i18n.global.locale.value = settings.language

// Watch for language changes
watch(() => settings.language, (newLang) => {
  i18n.global.locale.value = newLang
})
