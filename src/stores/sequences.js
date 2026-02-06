import { defineStore } from 'pinia'

// Current migration version - increment when adding new defaults
const CURRENT_MIGRATION_VERSION = 1

export const useSequencesStore = defineStore('sequences', {
  state: () => ({
    sequences: [],
    migrationVersion: 0,

    // Active sequence state
    activeSequenceId: null,
    currentStepIndex: 0,
    currentRepeat: 1,
    stepEndTime: null,
    isRunning: false,
    isPaused: false,
    pausedTimeRemaining: null,
    waitingForConfirm: false,
    stepCompletedAt: null
  }),

  getters: {
    activeSequence(state) {
      return state.sequences.find(s => s.id === state.activeSequenceId) || null
    },

    currentStep(state) {
      const seq = this.activeSequence
      if (!seq) return null
      return seq.steps[state.currentStepIndex] || null
    },

    nextStep(state) {
      const seq = this.activeSequence
      if (!seq) return null
      return seq.steps[state.currentStepIndex + 1] || null
    },

    totalSteps(state) {
      const seq = this.activeSequence
      return seq ? seq.steps.length : 0
    },

    // Note: remainingTime is now a method in actions, not a getter
    // because Date.now() is not reactive

    isComplete(state) {
      const seq = this.activeSequence
      if (!seq) return false
      const isLastStep = state.currentStepIndex >= seq.steps.length - 1
      const isLastRepeat = seq.repeatCount > 0 && state.currentRepeat >= seq.repeatCount
      return isLastStep && isLastRepeat && !state.isRunning && !state.waitingForConfirm
    }
  },

  actions: {
    // Get remaining time (method, not getter, because Date.now() isn't reactive)
    getRemainingTime() {
      if (this.isPaused && this.pausedTimeRemaining !== null) {
        return this.pausedTimeRemaining
      }
      if (!this.isRunning || !this.stepEndTime) return 0
      return Math.max(0, this.stepEndTime - Date.now())
    },

    getOvertimeElapsed() {
      if (!this.stepCompletedAt) return 0
      return Math.max(0, Date.now() - this.stepCompletedAt)
    },

    // Sequence CRUD
    addSequence(sequence) {
      const newSeq = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        repeatCount: 1,
        autoAdvance: false,
        ...sequence
      }
      this.sequences.push(newSeq)
      return newSeq.id
    },

    updateSequence(id, updates) {
      const index = this.sequences.findIndex(s => s.id === id)
      if (index !== -1) {
        const updated = { ...this.sequences[index], ...updates }
        // Remove keys explicitly set to undefined (for removing nameKey on edit)
        Object.keys(updated).forEach(key => {
          if (updated[key] === undefined) delete updated[key]
        })
        // Also clean up steps
        if (updated.steps) {
          updated.steps = updated.steps.map(step => {
            const cleanStep = { ...step }
            Object.keys(cleanStep).forEach(key => {
              if (cleanStep[key] === undefined) delete cleanStep[key]
            })
            return cleanStep
          })
        }
        this.sequences[index] = updated
      }
    },

    deleteSequence(id) {
      this.sequences = this.sequences.filter(s => s.id !== id)
    },

    // Playback controls
    startSequence(sequenceId) {
      const seq = this.sequences.find(s => s.id === sequenceId)
      if (!seq || seq.steps.length === 0) return false

      this.activeSequenceId = sequenceId
      this.currentStepIndex = 0
      this.currentRepeat = 1
      this.isPaused = false
      this.pausedTimeRemaining = null
      this.waitingForConfirm = false

      this.startCurrentStep()
      return true
    },

    startCurrentStep() {
      const step = this.currentStep
      if (!step) return

      this.stepEndTime = Date.now() + (step.duration * 1000)
      this.isRunning = true
      this.waitingForConfirm = false
      this.stepCompletedAt = null
    },

    pauseSequence() {
      if (!this.isRunning) return
      this.pausedTimeRemaining = Math.max(0, this.stepEndTime - Date.now())
      this.isPaused = true
      this.isRunning = false
    },

    resumeSequence() {
      if (!this.isPaused || this.pausedTimeRemaining === null) return
      this.stepEndTime = Date.now() + this.pausedTimeRemaining
      this.isPaused = false
      this.isRunning = true
      this.pausedTimeRemaining = null
    },

    stopSequence() {
      this.activeSequenceId = null
      this.currentStepIndex = 0
      this.currentRepeat = 1
      this.stepEndTime = null
      this.isRunning = false
      this.isPaused = false
      this.pausedTimeRemaining = null
      this.waitingForConfirm = false
      this.stepCompletedAt = null
    },

    completeCurrentStep() {
      this.isRunning = false
      this.stepEndTime = null
      this.stepCompletedAt = Date.now()

      const seq = this.activeSequence
      if (!seq) return

      const isLastStep = this.currentStepIndex >= seq.steps.length - 1

      if (isLastStep) {
        // Check if we should repeat
        if (seq.repeatCount === 0 || this.currentRepeat < seq.repeatCount) {
          // More repeats to go
          this.currentRepeat++
          this.currentStepIndex = 0

          if (seq.autoAdvance) {
            this.startCurrentStep()
          } else {
            this.waitingForConfirm = true
          }
        }
        // else: sequence complete, isComplete getter will be true
      } else {
        // Move to next step
        this.currentStepIndex++

        if (seq.autoAdvance) {
          this.startCurrentStep()
        } else {
          this.waitingForConfirm = true
        }
      }
    },

    confirmNextStep() {
      if (!this.waitingForConfirm) return
      this.startCurrentStep()
    },

    skipStep() {
      if (!this.isRunning && !this.isPaused) return
      this.completeCurrentStep()
    },

    // Check if step completed (for background sync)
    checkStepCompletion() {
      if (this.isRunning && this.getRemainingTime() <= 0) {
        this.completeCurrentStep()
        return true
      }
      return false
    },

    // Run migrations to add default sequences
    runMigrations() {
      if (this.migrationVersion >= CURRENT_MIGRATION_VERSION) return

      // Migration 1: Initial default sequences (only if no sequences exist yet)
      if (this.migrationVersion < 1 && this.sequences.length === 0) {
        const defaults = [
          {
            nameKey: 'defaults.softBoiledEgg',
            category: 'cooking',
            steps: [{ id: '1', nameKey: 'defaults.steps.boil', duration: 360 }],
            repeatCount: 1
          },
          {
            nameKey: 'defaults.mediumBoiledEgg',
            category: 'cooking',
            steps: [{ id: '1', nameKey: 'defaults.steps.boil', duration: 480 }],
            repeatCount: 1
          },
          {
            nameKey: 'defaults.hardBoiledEgg',
            category: 'cooking',
            steps: [{ id: '1', nameKey: 'defaults.steps.boil', duration: 720 }],
            repeatCount: 1
          },
          {
            nameKey: 'defaults.dumplings',
            category: 'cooking',
            steps: [{ id: '1', nameKey: 'defaults.steps.boilBatch', duration: 90 }],
            repeatCount: 0
          },
          {
            nameKey: 'defaults.steakMedium',
            category: 'cooking',
            steps: [
              { id: '1', nameKey: 'defaults.steps.sideA', duration: 180 },
              { id: '2', nameKey: 'defaults.steps.sideB', duration: 180 },
              { id: '3', nameKey: 'defaults.steps.rest', duration: 60 }
            ],
            repeatCount: 1
          },
          {
            nameKey: 'defaults.classicPomodoro',
            category: 'productivity',
            steps: [
              { id: '1', nameKey: 'defaults.steps.focus', duration: 1500 },
              { id: '2', nameKey: 'defaults.steps.break', duration: 300 }
            ],
            repeatCount: 4
          },
          {
            nameKey: 'defaults.quickFocus',
            category: 'productivity',
            steps: [
              { id: '1', nameKey: 'defaults.steps.focus', duration: 900 },
              { id: '2', nameKey: 'defaults.steps.break', duration: 180 }
            ],
            repeatCount: 1
          }
        ]

        defaults.forEach(seq => this.addSequence(seq))
      }

      this.migrationVersion = CURRENT_MIGRATION_VERSION
    },

    // Legacy alias for backwards compatibility
    initDefaults() {
      this.runMigrations()
    }
  },

  persist: {
    pick: ['sequences', 'migrationVersion'] // Persist sequences and migration state, not active playback state
  }
})

// Helper to parse time strings like "1.5m", "90s", "5" (minutes)
export function parseTimeInput(input) {
  if (typeof input === 'number') return input * 60 // assume minutes

  const str = String(input).trim().toLowerCase()

  // Seconds: "90s", "90sec"
  const secMatch = str.match(/^([\d.]+)\s*s(ec)?$/)
  if (secMatch) return Math.round(parseFloat(secMatch[1]))

  // Minutes: "1.5m", "1.5min", "5"
  const minMatch = str.match(/^([\d.]+)\s*(m(in)?)?$/)
  if (minMatch) return Math.round(parseFloat(minMatch[1]) * 60)

  return null // invalid
}

// Format seconds to display string
export function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`
  if (seconds % 60 === 0) return `${seconds / 60}m`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

// Get display name for sequence or step (handles translation keys)
export function getDisplayName(item, t) {
  if (!item) return ''
  if (item.name) return item.name
  if (item.nameKey) return t(`sequences.${item.nameKey}`)
  return ''
}
