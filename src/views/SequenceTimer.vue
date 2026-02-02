<template>
  <div class="sequence-timer">
    <!-- Sequence Selection -->
    <div v-if="!store.activeSequenceId" class="sequence-list pa-4">
      <h2 class="text-h5 mb-4">Sequences</h2>

      <v-tabs v-model="activeTab" color="green-darken-2" class="mb-4">
        <v-tab value="cooking">Cooking</v-tab>
        <v-tab value="productivity">Productivity</v-tab>
      </v-tabs>

      <v-list>
        <v-list-item
          v-for="seq in filteredSequences"
          :key="seq.id"
          @click="startSequence(seq.id)"
          class="mb-2"
        >
          <template v-slot:prepend>
            <v-icon :color="seq.category === 'cooking' ? 'orange-darken-2' : 'blue-darken-2'">
              {{ seq.category === 'cooking' ? 'mdi-pot-steam' : 'mdi-timer-outline' }}
            </v-icon>
          </template>

          <v-list-item-title>{{ seq.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ seq.steps.length }} step{{ seq.steps.length !== 1 ? 's' : '' }}
            <span v-if="seq.repeatCount === 0"> (repeat)</span>
            <span v-else-if="seq.repeatCount > 1"> (x{{ seq.repeatCount }})</span>
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-btn icon variant="text" size="small" @click.stop="editSequence(seq)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>

      <v-btn
        color="green-darken-2"
        variant="outlined"
        block
        class="mt-4"
        @click="showEditor = true"
      >
        <v-icon left>mdi-plus</v-icon>
        Create New
      </v-btn>
    </div>

    <!-- Active Sequence -->
    <div v-else class="active-sequence">
      <!-- Waiting for confirm -->
      <div v-if="store.waitingForConfirm" class="confirm-screen text-center pa-4">
        <v-icon size="64" color="green-darken-2" class="mb-4">mdi-check-circle</v-icon>
        <h2 class="text-h5 mb-2">Step Complete!</h2>
        <p class="text-h6 mb-4">{{ store.currentStep?.name }}</p>

        <div v-if="store.nextStep" class="next-step mb-6">
          <p class="text-subtitle-1 text-grey">Next:</p>
          <p class="text-h6">{{ store.nextStep.name }} - {{ formatDuration(store.nextStep.duration) }}</p>
        </div>
        <div v-else-if="hasMoreRepeats" class="next-step mb-6">
          <p class="text-subtitle-1 text-grey">Repeat {{ store.currentRepeat + 1 }} of {{ store.activeSequence?.repeatCount || '∞' }}</p>
          <p class="text-h6">{{ store.activeSequence?.steps[0]?.name }} - {{ formatDuration(store.activeSequence?.steps[0]?.duration) }}</p>
        </div>

        <v-btn
          color="green-darken-2"
          size="x-large"
          @click="store.confirmNextStep()"
          class="mb-4"
        >
          Start Next
        </v-btn>

        <v-btn variant="text" @click="store.stopSequence()">
          Stop Sequence
        </v-btn>
      </div>

      <!-- Sequence complete -->
      <div v-else-if="store.isComplete" class="complete-screen text-center pa-4">
        <v-icon size="64" color="green-darken-2" class="mb-4">mdi-trophy</v-icon>
        <h2 class="text-h5 mb-2">Sequence Complete!</h2>
        <p class="text-h6 mb-6">{{ store.activeSequence?.name }}</p>

        <v-btn
          color="green-darken-2"
          class="mb-2"
          @click="restartSequence"
        >
          Start Again
        </v-btn>
        <br>
        <v-btn variant="text" @click="store.stopSequence()">
          Choose Another
        </v-btn>
      </div>

      <!-- Running step -->
      <div v-else class="running-step">
        <div class="step-info text-center pa-4">
          <p class="text-subtitle-1 text-grey mb-2">
            Step {{ store.currentStepIndex + 1 }} of {{ store.totalSteps }}
            <span v-if="store.activeSequence?.repeatCount !== 1">
              (Round {{ store.currentRepeat }}<span v-if="store.activeSequence?.repeatCount > 0">/{{ store.activeSequence.repeatCount }}</span>)
            </span>
          </p>
          <h2 class="text-h4 mb-4">{{ store.currentStep?.name }}</h2>
          <p class="time-display text-h1 font-weight-bold">{{ formattedTime }}</p>
        </div>

        <!-- Progress bar -->
        <div class="progress-container pa-4">
          <v-progress-linear
            :model-value="progressPercent"
            color="green-darken-2"
            height="12"
            rounded
          ></v-progress-linear>
        </div>

        <!-- Controls -->
        <div class="controls text-center pa-4">
          <v-btn
            v-if="store.isRunning"
            color="orange-darken-2"
            size="large"
            @click="store.pauseSequence()"
            class="mr-2"
          >
            <v-icon>mdi-pause</v-icon>
            Pause
          </v-btn>
          <v-btn
            v-else-if="store.isPaused"
            color="green-darken-2"
            size="large"
            @click="store.resumeSequence()"
            class="mr-2"
          >
            <v-icon>mdi-play</v-icon>
            Resume
          </v-btn>

          <v-btn
            color="blue-darken-2"
            variant="outlined"
            size="large"
            @click="skipStep"
            class="mr-2"
          >
            <v-icon>mdi-skip-next</v-icon>
            Skip
          </v-btn>

          <v-btn
            color="red-darken-2"
            variant="outlined"
            size="large"
            @click="store.stopSequence()"
          >
            <v-icon>mdi-stop</v-icon>
            Stop
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Settings Controls -->
    <div class="settings-controls">
      <v-btn
        :color="muteColor"
        variant="text"
        icon
        @click="settings.toggleMuted()"
      >
        <v-icon>{{ muteIcon }}</v-icon>
      </v-btn>

      <v-btn
        :color="screenLockColor"
        variant="text"
        icon
        @click="settings.toggleKeepScreenOn()"
      >
        <v-icon>{{ screenLockIcon }}</v-icon>
      </v-btn>

      <v-btn
        color="grey-darken-2"
        variant="text"
        icon
        @click="toggleLanguage"
      >
        <span style="font-size: 12px; font-weight: bold;">{{ langLabel }}</span>
      </v-btn>
    </div>

    <!-- Editor Dialog -->
    <v-dialog v-model="showEditor" max-width="500" persistent>
      <v-card>
        <v-card-title>
          {{ editingSequence ? 'Edit Sequence' : 'New Sequence' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editorForm.name"
            label="Sequence Name"
            variant="outlined"
            density="compact"
            class="mb-3"
          ></v-text-field>

          <v-select
            v-model="editorForm.category"
            :items="[
              { title: 'Cooking', value: 'cooking' },
              { title: 'Productivity', value: 'productivity' }
            ]"
            label="Category"
            variant="outlined"
            density="compact"
            class="mb-3"
          ></v-select>

          <v-text-field
            v-model="editorForm.repeatCount"
            label="Repeat Count (0 = infinite)"
            type="number"
            min="0"
            variant="outlined"
            density="compact"
            class="mb-3"
          ></v-text-field>

          <v-switch
            v-model="editorForm.autoAdvance"
            label="Auto-advance steps"
            color="green-darken-2"
            density="compact"
            class="mb-3"
          ></v-switch>

          <h4 class="mb-2">Steps</h4>
          <div
            v-for="(step, index) in editorForm.steps"
            :key="step.id"
            class="step-row d-flex align-center mb-2"
          >
            <v-text-field
              v-model="step.name"
              label="Name"
              variant="outlined"
              density="compact"
              hide-details
              class="mr-2"
              style="flex: 2"
            ></v-text-field>
            <v-text-field
              v-model="step.durationInput"
              label="Duration"
              variant="outlined"
              density="compact"
              hide-details
              placeholder="e.g. 1.5m, 90s"
              class="mr-2"
              style="flex: 1"
            ></v-text-field>
            <v-btn
              icon
              variant="text"
              size="small"
              @click="removeStep(index)"
              :disabled="editorForm.steps.length <= 1"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-btn
            variant="text"
            size="small"
            @click="addStep"
            color="green-darken-2"
          >
            <v-icon left>mdi-plus</v-icon>
            Add Step
          </v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeEditor">Cancel</v-btn>
          <v-btn color="green-darken-2" @click="saveSequence">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSequencesStore, formatDuration, parseTimeInput } from '@/stores/sequences'
import { useSettingsControls } from '@/composables/useSettingsControls'

export default {
  name: 'SequenceTimer',
  setup() {
    const store = useSequencesStore()
    const {
      settings,
      muteIcon,
      muteColor,
      screenLockIcon,
      screenLockColor,
      langLabel,
      toggleLanguage
    } = useSettingsControls()

    const activeTab = ref('cooking')
    const showEditor = ref(false)
    const editingSequence = ref(null)
    const tickInterval = ref(null)
    const ringingSound = ref(null)
    const tickCounter = ref(0) // Forces reactivity for time display

    const editorForm = ref({
      name: '',
      category: 'cooking',
      repeatCount: 1,
      autoAdvance: false,
      steps: [{ id: '1', name: '', durationInput: '' }]
    })

    const filteredSequences = computed(() => {
      return store.sequences.filter(s => s.category === activeTab.value)
    })

    const formattedTime = computed(() => {
      // tickCounter dependency forces re-computation
      const _ = tickCounter.value
      const ms = store.getRemainingTime()
      const totalSecs = Math.ceil(ms / 1000)
      const mins = Math.floor(totalSecs / 60)
      const secs = totalSecs % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    })

    const progressPercent = computed(() => {
      // tickCounter dependency forces re-computation
      const _ = tickCounter.value
      const step = store.currentStep
      if (!step) return 0
      const total = step.duration * 1000
      const remaining = store.getRemainingTime()
      return ((total - remaining) / total) * 100
    })

    const hasMoreRepeats = computed(() => {
      const seq = store.activeSequence
      if (!seq) return false
      return seq.repeatCount === 0 || store.currentRepeat < seq.repeatCount
    })

    const startSequence = (id) => {
      store.startSequence(id)
    }

    const restartSequence = () => {
      const id = store.activeSequenceId
      store.stopSequence()
      store.startSequence(id)
    }

    const skipStep = () => {
      store.skipStep()
      playSound()
    }

    const editSequence = (seq) => {
      editingSequence.value = seq
      editorForm.value = {
        name: seq.name,
        category: seq.category || 'cooking',
        repeatCount: seq.repeatCount || 1,
        autoAdvance: seq.autoAdvance || false,
        steps: seq.steps.map(s => ({
          id: s.id,
          name: s.name,
          durationInput: formatDuration(s.duration)
        }))
      }
      showEditor.value = true
    }

    const addStep = () => {
      editorForm.value.steps.push({
        id: crypto.randomUUID(),
        name: '',
        durationInput: ''
      })
    }

    const removeStep = (index) => {
      editorForm.value.steps.splice(index, 1)
    }

    const closeEditor = () => {
      showEditor.value = false
      editingSequence.value = null
      editorForm.value = {
        name: '',
        category: 'cooking',
        repeatCount: 1,
        autoAdvance: false,
        steps: [{ id: '1', name: '', durationInput: '' }]
      }
    }

    const saveSequence = () => {
      const steps = editorForm.value.steps
        .filter(s => s.name && s.durationInput)
        .map(s => ({
          id: s.id,
          name: s.name,
          duration: parseTimeInput(s.durationInput) || 60
        }))

      if (!editorForm.value.name || steps.length === 0) return

      const data = {
        name: editorForm.value.name,
        category: editorForm.value.category,
        repeatCount: parseInt(editorForm.value.repeatCount) || 1,
        autoAdvance: editorForm.value.autoAdvance,
        steps
      }

      if (editingSequence.value) {
        store.updateSequence(editingSequence.value.id, data)
      } else {
        store.addSequence(data)
      }

      closeEditor()
    }

    const playSound = () => {
      if (ringingSound.value && !settings.muted) {
        ringingSound.value.currentTime = 0
        ringingSound.value.play()
      }
    }

    const tick = () => {
      tickCounter.value++ // Force reactive updates
      if (store.isRunning) {
        const completed = store.checkStepCompletion()
        if (completed) {
          playSound()
        }
      }
    }

    onMounted(() => {
      store.initDefaults()
      ringingSound.value = new Audio(new URL('@/assets/timer-finish-ring.mp3', import.meta.url).href)
      tickInterval.value = setInterval(tick, 100)
    })

    onBeforeUnmount(() => {
      clearInterval(tickInterval.value)
    })

    return {
      store,
      settings,
      activeTab,
      showEditor,
      editingSequence,
      editorForm,
      filteredSequences,
      formattedTime,
      progressPercent,
      hasMoreRepeats,
      formatDuration,
      startSequence,
      restartSequence,
      skipStep,
      editSequence,
      addStep,
      removeStep,
      closeEditor,
      saveSequence,
      muteIcon,
      muteColor,
      screenLockIcon,
      screenLockColor,
      langLabel,
      toggleLanguage
    }
  }
}
</script>

<style lang="scss" scoped>
.sequence-timer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sequence-list {
  flex: 1;
  overflow-y: auto;
}

.active-sequence {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.time-display {
  font-variant-numeric: tabular-nums;
}

.confirm-screen,
.complete-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.running-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.settings-controls {
  position: absolute;
  bottom: 72px;
  left: 16px;
  display: flex;
  gap: 8px;
}
</style>
