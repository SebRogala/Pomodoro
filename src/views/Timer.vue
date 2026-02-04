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
          >{{ $t('timer.start') }}</v-btn>
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

      </v-list>
    </v-navigation-drawer>

    <v-btn
      v-if="settings.timerRunning"
      color="red-darken-2"
      :style="{ position: 'absolute', bottom: bottomOffset, right: '16px' }"
      variant="outlined"
      @click="stopTimer"
    >{{ $t('timer.stop') }}</v-btn>

    <v-btn
      v-if="!settings.timerRunning && !navOpen"
      color="green-darken-2"
      :style="{ position: 'absolute', bottom: bottomOffset, right: '16px' }"
      variant="outlined"
      icon
      @click="navOpen = true"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <TimerComponent :size="timerSize" />

    <v-btn
      :color="muteColor"
      variant="text"
      icon
      :style="{ position: 'absolute', bottom: bottomOffset, left: '16px' }"
      @click="settings.toggleMuted()"
    >
      <v-icon>{{ muteIcon }}</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { inject, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useTimerSize } from '@/composables/useTimerSize'
import { useSettingsControls } from '@/composables/useSettingsControls'
import { useAudio } from '@/composables/useAudio'
import TimerComponent from '@/components/Timer.vue'

export default {
  name: 'TimerView',
  components: {
    TimerComponent
  },
  setup() {
    const bus = inject('bus')
    const { settings, muteIcon, muteColor } = useSettingsControls()
    const { timerSize, calculateSize } = useTimerSize()
    const { initAudio, play: playFinishedSound } = useAudio(
      new URL('@/assets/timer-finish-ring.mp3', import.meta.url).href
    )

    const customTime = ref(settings.lastUsedTime)
    const navOpen = ref(true)

    const bottomOffset = computed(() => {
      return settings.timerRunning ? '16px' : '72px'
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
      // Set stopped size BEFORE changing state to avoid blink
      calculateSize(false)
      navOpen.value = true
      settings.setTimerRunning(false)
    }

    const timerStarted = () => {
      // Set running size BEFORE changing state to avoid blink
      calculateSize(true)
      navOpen.value = false
      settings.setTimerRunning(true)
    }

    onMounted(() => {
      initAudio()
      bus.on('clock-started', timerStarted)
      bus.on('clock-stopped', timerStopped)
    })

    onBeforeUnmount(() => {
      bus.off('clock-started', timerStarted)
      bus.off('clock-stopped', timerStopped)
      navOpen.value = false // Close drawer when leaving
    })

    return {
      settings,
      timerSize,
      customTime,
      navOpen,
      muteIcon,
      muteColor,
      bottomOffset,
      clearCustomTime,
      startCustom,
      triggerTimer,
      stopTimer
    }
  }
}
</script>
