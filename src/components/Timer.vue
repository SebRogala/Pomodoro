<template>
  <div class="timer-wrapper">
    <CircularProgress
      :size="Number(size)"
      :remaining-seconds="remainingSeconds"
      :total-seconds="totalSeconds"
    />
  </div>
</template>

<script>
import { inject, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { DateTime, Interval } from 'luxon'
import { useSettingsStore } from '@/stores/settings'
import { useWakeLock } from '@/composables/useWakeLock'
import CircularProgress from '@/components/CircularProgress.vue'

export default {
  name: 'TimerComponent',
  components: {
    CircularProgress
  },
  props: {
    size: {
      type: [Number, String],
      default: 0
    }
  },
  setup(props) {
    const bus = inject('bus')
    const settings = useSettingsStore()
    const wakeLock = useWakeLock()

    const minutes = ref(0)
    const timerIsOn = ref(false)
    const endTime = ref(null)
    const intervalId = ref(0)
    const tickCounter = ref(0)

    const remainingSeconds = computed(() => {
      const _ = tickCounter.value // Force reactivity
      if (!endTime.value) return 0
      const interval = Interval.fromDateTimes(DateTime.local(), endTime.value)
      const secs = interval.length('seconds')
      return isNaN(secs) ? 0 : Math.max(0, secs)
    })

    const totalSeconds = computed(() => minutes.value * 60)

    const tick = () => {
      tickCounter.value++
      if (timerIsOn.value && remainingSeconds.value <= 0) {
        stopClock()
      }
    }

    const runClock = async () => {
      timerIsOn.value = true
      endTime.value = DateTime.local().plus({ minutes: minutes.value })
      intervalId.value = setInterval(tick, 300)

      // Acquire wake lock if enabled
      if (settings.keepScreenOn) {
        await wakeLock.acquire()
      }

      bus.emit('clock-started')
    }

    const stopClock = async () => {
      timerIsOn.value = false
      clearInterval(intervalId.value)

      // Release wake lock
      await wakeLock.release()

      bus.emit('clock-stopped')
    }

    const onStartTimer = (mins) => {
      minutes.value = mins
      runClock()
    }

    const onStopTimer = () => {
      endTime.value = DateTime.local()
      stopClock()
    }

    // Handle visibility change - sync timer and re-acquire wake lock
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && timerIsOn.value) {
        // Force re-render to sync display
        tickCounter.value++

        // Check if timer completed while in background
        if (remainingSeconds.value <= 0) {
          stopClock()
          return
        }

        // Re-acquire wake lock if enabled
        if (settings.keepScreenOn) {
          await wakeLock.acquire()
        }
      }
    }

    onMounted(() => {
      endTime.value = DateTime.local()
      bus.on('start-timer', onStartTimer)
      bus.on('stop-timer', onStopTimer)
      document.addEventListener('visibilitychange', handleVisibilityChange)
    })

    onBeforeUnmount(() => {
      clearInterval(intervalId.value)
      bus.off('start-timer', onStartTimer)
      bus.off('stop-timer', onStopTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })

    return {
      remainingSeconds,
      totalSeconds
    }
  }
}
</script>

<style lang="scss" scoped>
.timer-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
