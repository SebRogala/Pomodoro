<template>
  <div class="overtime-display mb-6">
    <p class="text-caption text-grey mb-1">{{ $t('sequences.overtime') }}</p>
    <p class="overtime-time">+{{ formatted }}</p>
  </div>
</template>

<script>
export default {
  name: 'OvertimeDisplay',
  props: {
    formatted: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.overtime-time {
  font-size: 3rem;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  color: #E65100;
  line-height: 1;
}
</style>
