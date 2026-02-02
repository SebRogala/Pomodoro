<template>
  <div class="timer">
    <v-navigation-drawer
      location="right"
      temporary
      v-model="navOpen"
      width="200"
    >
      <v-list>
        <v-list-item>
          <v-text-field
            v-model="customTime"
            color="green-darken-2"
            density="compact"
            clearable
            variant="outlined"
            hide-details
            @blur="clearCustomTime"
          ></v-text-field>
          <v-btn
            class="mt-2 mb-5"
            @click="startCustom"
            block
            variant="outlined"
            color="green-darken-2"
          >Start</v-btn>
        </v-list-item>

        <v-list-item>
          <v-btn
            @click="triggerTimer(5)"
            block
            variant="outlined"
            color="blue-darken-2"
          >5</v-btn>
        </v-list-item>

        <v-list-item>
          <v-btn
            @click="triggerTimer(25)"
            block
            variant="outlined"
            color="green-darken-2"
          >25</v-btn>
        </v-list-item>

        <v-list-item>
          <v-btn
            @click="triggerTimer(30)"
            block
            variant="outlined"
            color="blue-darken-2"
          >30</v-btn>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item v-if="markers > 0">
          <div>
            <v-badge
              v-for="marker in markers"
              :key="marker"
              color="pink"
              dot
              inline
            />
          </div>
          <v-btn
            @click="restartMarkers"
            block
            variant="outlined"
            color="orange-accent-3"
          >Reset markers</v-btn>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-btn
      color="red-darken-2"
      style="position: absolute; bottom: 16px; right: 16px;"
      variant="outlined"
      @click="stopTimer"
    >Stop</v-btn>

    <TimerComponent :size="timerSize" />

    <v-btn
      :color="muteColor"
      variant="text"
      icon
      style="position: absolute; bottom: 16px; left: 16px;"
      @click="settings.toggleMuted()"
    >
      <v-icon>{{ muteIcon }}</v-icon>
    </v-btn>

    <v-btn
      :color="screenLockColor"
      variant="text"
      icon
      style="position: absolute; bottom: 16px; left: 64px;"
      @click="settings.toggleKeepScreenOn()"
    >
      <v-icon>{{ screenLockIcon }}</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { inject, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import TimerComponent from '@/components/Timer.vue'

export default {
  name: 'TimerView',
  components: {
    TimerComponent
  },
  setup() {
    const bus = inject('bus')
    const settings = useSettingsStore()

    const timerSize = ref(0)
    const customTime = ref(settings.lastUsedTime)
    const markers = ref(0)
    const navOpen = ref(true)
    const ringingSound = ref(null)

    const muteIcon = computed(() => {
      return settings.muted ? 'mdi-volume-variant-off' : 'mdi-volume-high'
    })

    const muteColor = computed(() => {
      return navOpen.value ? 'grey-darken-2' : 'grey-lighten-1'
    })

    const screenLockIcon = computed(() => {
      return settings.keepScreenOn ? 'mdi-cellphone' : 'mdi-cellphone-off'
    })

    const screenLockColor = computed(() => {
      if (settings.keepScreenOn) {
        return 'green-darken-2'
      }
      return navOpen.value ? 'grey-darken-2' : 'grey-lighten-1'
    })

    const clearCustomTime = () => {
      if (isNaN(customTime.value) || !customTime.value) {
        customTime.value = 0
      }
    }

    const startCustom = () => {
      triggerTimer(customTime.value)
    }

    const triggerTimer = (time) => {
      settings.setLastUsedTime(time)
      bus.emit('start-timer', time)
    }

    const stopTimer = () => {
      bus.emit('stop-timer')
    }

    const timerStopped = () => {
      playFinishedSound()
      navOpen.value = true
    }

    const timerStarted = () => {
      navOpen.value = false
    }

    const restartMarkers = () => {
      markers.value = 0
    }

    const setTimerSize = () => {
      const height = window.innerHeight
      const width = window.innerWidth
      timerSize.value = height > width ? width : height
    }

    const playFinishedSound = () => {
      if (ringingSound.value && !settings.muted) {
        ringingSound.value.play()
      }
    }

    onMounted(() => {
      ringingSound.value = new Audio(new URL('@/assets/timer-finish-ring.mp3', import.meta.url).href)
      restartMarkers()
      setTimerSize()
      window.addEventListener('resize', setTimerSize)

      bus.on('clock-started', timerStarted)
      bus.on('clock-stopped', timerStopped)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', setTimerSize)
      bus.off('clock-started', timerStarted)
      bus.off('clock-stopped', timerStopped)
    })

    return {
      settings,
      timerSize,
      customTime,
      markers,
      navOpen,
      muteIcon,
      muteColor,
      screenLockIcon,
      screenLockColor,
      clearCustomTime,
      startCustom,
      triggerTimer,
      stopTimer,
      restartMarkers
    }
  }
}
</script>
