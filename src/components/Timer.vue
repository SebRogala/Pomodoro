<template>
  <div class="timer-wrapper">
    <canvas ref="canvasRef" :width="size" :height="size"></canvas>
    <img class="timer__background" :width="size" :src="timerBackground">
  </div>
</template>

<script>
import { inject, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { DateTime, Interval } from 'luxon'
import timerBackgroundImg from '@/assets/timer-background-960.png'

export default {
  name: 'TimerComponent',
  props: {
    size: {
      type: [Number, String],
      default: 0
    }
  },
  setup(props) {
    const bus = inject('bus')

    const minutes = ref(0)
    const timerIsOn = ref(false)
    const canvasRef = ref(null)
    const ctx = ref(null)
    const endTime = ref(null)
    const intervalId = ref(0)
    const constantsColor = '#000000'
    const strokeColor = '#950703'

    const timerBackground = timerBackgroundImg

    const lineWidth = computed(() => {
      return (props.size / 2) - props.size * 0.115
    })

    const degToRad = (degree) => {
      const factor = Math.PI / 180
      return degree * factor
    }

    const renderConstants = () => {
      ctx.value.strokeStyle = constantsColor
      ctx.value.lineWidth = 10
      ctx.value.beginPath()
      ctx.value.arc(props.size / 2, props.size / 2, 5, degToRad(0), degToRad(360))
      ctx.value.stroke()
    }

    const renderTime = () => {
      const interval = Interval.fromDateTimes(DateTime.local(), endTime.value)
      const mils = interval.length('milliseconds')

      if (isNaN(mils)) {
        stopClock()
        return
      }

      const min = interval.length('minutes')

      ctx.value.fillStyle = 'white'
      ctx.value.fillRect(0, 0, props.size, props.size)

      ctx.value.lineWidth = lineWidth.value
      ctx.value.strokeStyle = strokeColor
      ctx.value.beginPath()
      ctx.value.arc(props.size / 2, props.size / 2, lineWidth.value / 2, degToRad(-(min * 6) - 90), degToRad(-90))
      ctx.value.stroke()

      renderConstants()
    }

    const runClock = () => {
      timerIsOn.value = true
      endTime.value = DateTime.local().plus({ minutes: minutes.value })
      intervalId.value = setInterval(renderTime, 300)
      bus.emit('clock-started')
    }

    const stopClock = () => {
      timerIsOn.value = false
      clearInterval(intervalId.value)
      bus.emit('clock-stopped')
    }

    const onStartTimer = (mins) => {
      minutes.value = mins
      runClock()
    }

    const onStopTimer = () => {
      endTime.value = DateTime.local()
      renderTime()
      stopClock()
    }

    onMounted(() => {
      ctx.value = canvasRef.value.getContext('2d')
      endTime.value = DateTime.local()
      renderTime()

      bus.on('start-timer', onStartTimer)
      bus.on('stop-timer', onStopTimer)
    })

    onBeforeUnmount(() => {
      clearInterval(intervalId.value)
      bus.off('start-timer', onStartTimer)
      bus.off('stop-timer', onStopTimer)
    })

    return {
      canvasRef,
      timerBackground
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

canvas {
  display: block;
}

.timer__background {
  position: absolute;
}
</style>
