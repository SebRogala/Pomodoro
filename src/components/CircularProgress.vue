<template>
  <div class="circular-progress">
    <canvas ref="canvasRef" :width="size" :height="size"></canvas>
    <img class="background" :width="size" :src="timerBackground">
  </div>
</template>

<script>
import { ref, watch, onMounted, nextTick } from 'vue'
import timerBackgroundImg from '@/assets/timer-background-960.png'

export default {
  name: 'CircularProgress',
  props: {
    size: {
      type: Number,
      default: 300
    },
    remainingSeconds: {
      type: Number,
      required: true
    },
    totalSeconds: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const canvasRef = ref(null)
    const ctx = ref(null)
    const timerBackground = timerBackgroundImg
    const strokeColor = '#950703'
    const constantsColor = '#000000'

    const degToRad = (degree) => {
      return degree * (Math.PI / 180)
    }

    const render = () => {
      if (!ctx.value || props.size <= 0) return

      const lineWidth = (props.size / 2) - props.size * 0.115

      // Clear canvas
      ctx.value.fillStyle = 'white'
      ctx.value.fillRect(0, 0, props.size, props.size)

      // Calculate minutes remaining for clock-like display
      const minutesRemaining = props.remainingSeconds / 60

      // Only draw arc if there's time to show
      if (minutesRemaining > 0) {
        ctx.value.lineWidth = lineWidth
        ctx.value.strokeStyle = strokeColor
        ctx.value.beginPath()
        ctx.value.arc(
          props.size / 2,
          props.size / 2,
          lineWidth / 2,
          degToRad(-(minutesRemaining * 6) - 90),
          degToRad(-90)
        )
        ctx.value.stroke()
      }

      // Draw center dot
      ctx.value.strokeStyle = constantsColor
      ctx.value.lineWidth = 10
      ctx.value.beginPath()
      ctx.value.arc(props.size / 2, props.size / 2, 5, degToRad(0), degToRad(360))
      ctx.value.stroke()
    }

    onMounted(async () => {
      await nextTick()
      ctx.value = canvasRef.value.getContext('2d')
      render()
    })

    // Rely on Vue reactivity - watch props changes instead of polling
    watch(() => props.size, render)
    watch(() => props.remainingSeconds, render)
    watch(() => props.totalSeconds, render)

    return {
      canvasRef,
      timerBackground
    }
  }
}
</script>

<style lang="scss" scoped>
.circular-progress {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  display: block;
  transition: width 0.2s ease, height 0.2s ease;
}

.background {
  position: absolute;
  pointer-events: none;
  transition: width 0.2s ease;
}
</style>
