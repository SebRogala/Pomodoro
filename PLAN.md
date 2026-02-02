# Pomodoro App Modernization Plan

## Project Overview
Modernize the existing Vue 2 Pomodoro timer app to Vue 3 + Vuetify 3, dockerize it, set up auto-deploy to CapRover, fix existing bugs, and add new features including Sequence Timer (great for cooking!), multi-language support, screen wake lock, and reliable background operation with notifications.

**Target URL:** https://pomodoro.softsolution.pro
**Repository:** https://github.com/SebRogala/Pomodoro
**Server:** VPS with CapRover (domains already configured)

---

## Phase 1: Dockerization & Deployment Setup

### 1.1 Create Docker Configuration
- [ ] Create `Dockerfile` (multi-stage build: node for build, nginx for serve)
- [ ] Create `.dockerignore` (node_modules, dist, .git, etc.)
- [ ] Create `nginx.conf` for SPA routing (all routes → index.html)
- [ ] Create `captain-definition` for CapRover

### 1.2 Update Build Configuration
- [ ] Change `publicPath` in `vue.config.js` from `/timer` to `/`
- [ ] Update PWA manifest paths if needed

### 1.3 CapRover Setup
- [ ] Create app in CapRover: `pomodoro`
- [ ] Configure custom domain: `pomodoro.softsolution.pro`
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Set up GitHub webhook for auto-deploy:
  - Add webhook URL from CapRover to GitHub repo settings
  - Configure branch trigger (master/main)

### 1.4 Verify Deployment
- [ ] Push changes, verify auto-deploy works
- [ ] Test HTTPS and domain routing

---

## Phase 2: Vue 3 + Vuetify 3 Migration

### 2.1 Project Setup
**Dependencies to update:**
```json
{
  "vue": "^3.4",
  "vuetify": "^3.5",
  "vue-router": "^4.3",
  "pinia": "^2.1",
  "pinia-plugin-persistedstate": "^3.2",
  "vue-i18n": "^9.10",
  "luxon": "^3.4",
  "@vueuse/core": "^10"
}
```

### 2.2 Migration Steps
- [ ] Update `package.json` with Vue 3 dependencies
- [ ] Update `main.js` to Vue 3 createApp syntax
- [ ] Migrate Vuetify setup to v3 (new plugin syntax)
- [ ] Replace Vuex with Pinia for state management
- [ ] Remove `vue-bus` plugin (use Pinia or native events)
- [ ] Update Vue Router to v4 syntax
- [ ] Migrate components to Composition API

### 2.3 Component Migration
- [ ] `App.vue` - Update to Vue 3 syntax
- [ ] `Timer.vue` (component) - Canvas timer, update refs/lifecycle
- [ ] `Timer.vue` (view) - Main timer view, fix sidebar bug
- [ ] `router/index.js` - Vue Router 4 syntax
- [ ] `store/index.js` → `stores/*.js` (Pinia)

### 2.4 PWA Updates with Self-Update
- [ ] Update service worker registration for Vue 3
- [ ] **Implement self-update prompt:**
  - Detect when new service worker is available
  - Show "Update available" snackbar/banner
  - "Reload" button to activate new version
  - Use `skipWaiting()` and `clients.claim()` pattern
- [ ] Ensure workbox config handles cache versioning

---

## Phase 3: Bug Fixes

### 3.1 Sidebar Horizontal Scroll Bug
**Root Cause:** `v-navigation-drawer` with `absolute` positioning doesn't prevent body overflow.

**Fix:**
- [ ] Change drawer to `temporary` mode (overlay with backdrop)
- [ ] Or add `overflow-x: hidden` to parent container
- [ ] Ensure timer canvas recalculates size when drawer opens/closes
- [ ] Test on mobile viewports

---

## Phase 4: Core Features

### 4.1 State Persistence (Pinia + localStorage)
- [ ] Create `stores/settings.js`:
  - `muted` (boolean)
  - `markers` (number)
  - `lastUsedTime` (number)
  - `language` (string)
  - `keepScreenOn` (boolean)
  - `notificationsEnabled` (boolean)

- [ ] Create `stores/sequences.js`:
  - `savedSequences` (array)
  - `currentSequence` (active sequence)

- [ ] Add `pinia-plugin-persistedstate` for automatic localStorage sync

### 4.2 Screen Wake Lock (Keep Screen On)
- [ ] Use Screen Wake Lock API (`navigator.wakeLock`)
- [ ] Toggle in settings
- [ ] Auto-activate when timer is running
- [ ] Release lock when timer stops/completes
- [ ] Fallback message for unsupported browsers
- [ ] Re-acquire lock on visibility change (tab becomes visible again)

### 4.3 Multi-Language Support (i18n)
- [ ] Set up `vue-i18n` with Vue 3
- [ ] Create translation files:
  - `locales/en.json` - English (default)
  - `locales/pl.json` - Polish
- [ ] Language selector in settings
- [ ] Persist language preference
- [ ] Translate all UI elements

### 4.4 Background Timer & Notifications (CRITICAL)
Timer must continue running and notify user even when:
- Browser tab is in background
- Browser is minimized
- Phone screen is off
- User switched to another app

**Implementation Strategy:**

#### 4.4.1 Reliable Background Timing
- [ ] **Store absolute end time** instead of counting down
  - Save `endTime = Date.now() + remainingMs` in localStorage/state
  - On each tick, calculate `remaining = endTime - Date.now()`
  - This survives tab throttling, sleep, and visibility changes

- [ ] **Web Worker for consistent ticks** (optional backup)
  - Web Workers are not throttled like main thread timers
  - `timerWorker.js` runs `setInterval` and posts messages
  - Main thread receives updates even when throttled

- [ ] **Visibility change handler**
  - On `visibilitychange` → immediately recalculate time from stored `endTime`
  - If timer already expired while in background → trigger completion

#### 4.4.2 Browser Notifications
- [ ] **Request notification permission** on first timer start
  - Prompt: "Allow notifications to be alerted when timer finishes"
  - Store permission state

- [ ] **Send notification on timer complete**
  - Works even when tab is in background
  - Include sound in notification (where supported)
  - Notification actions: "Dismiss" | "Open App"

- [ ] **Notification content**
  - Simple timer: "Timer Complete! [X minutes] finished"
  - Sequence: "Step Complete: [Step Name] - Next: [Next Step]"

```javascript
// Example notification
new Notification('Timer Complete!', {
  body: 'Your 25-minute focus session is done.',
  icon: '/img/icons/android-chrome-192x192.png',
  tag: 'timer-complete',
  requireInteraction: true, // Stay until user interacts
  vibrate: [200, 100, 200], // Mobile vibration pattern
  actions: [
    { action: 'open', title: 'Open App' },
    { action: 'dismiss', title: 'Dismiss' }
  ]
});
```

#### 4.4.3 Audio in Background
- [ ] **Pre-load audio** on user interaction (required by browsers)
- [ ] **Play audio via Notification API** where supported
- [ ] **Fallback**: Play audio when tab becomes visible if missed
- [ ] **Mobile consideration**: Audio may not play in background on iOS/Android
  - Notification with vibration as primary alert
  - Audio as secondary when app is in foreground

#### 4.4.4 Service Worker Integration (for PWA)
- [ ] **Service Worker can show notifications** even when app is closed
- [ ] Store timer state in IndexedDB (accessible from SW)
- [ ] SW checks timer and shows notification if expired
- [ ] Note: Full implementation requires Push API for true background (future enhancement)

#### 4.4.5 Timer State Recovery
- [ ] On app load, check for running timer in localStorage
- [ ] Calculate remaining time from stored `endTime`
- [ ] If expired → show completion screen
- [ ] If still running → resume display
- [ ] Handle sequence state recovery similarly

---

## Phase 5: Sequence Timer Feature

### 5.1 Use Cases

**Primary: Cooking Timer**
- Boiling dumplings: 90s → sound → wait for confirm → repeat
- Cooking steak: 3m side A → flip sound → 2m side B → flip sound → 1m side A → done
- Pasta: 8m boil → drain
- Eggs: soft (6m), medium (8m), hard (12m)

**Secondary: Productivity**
- Pomodoro: 25m work → 5m break → repeat
- Deep work: 50m work → 10m break
- Study sessions: custom intervals

### 5.2 Data Model
```typescript
interface SequenceStep {
  id: string;
  name: string;           // e.g., "Side A", "Flip", "Boil"
  duration: number;       // in seconds (supports sub-minute like 90s)
  color?: string;         // optional color for progress bar segment
}

interface Sequence {
  id: string;
  name: string;           // e.g., "Dumplings", "Medium Steak"
  steps: SequenceStep[];
  repeatCount?: number;   // how many times to repeat (1 = run once, 0 = infinite)
  category?: 'cooking' | 'productivity' | 'custom';
  createdAt: number;
  isDefault?: boolean;
}

interface SequenceState {
  sequenceId: string;
  currentStepIndex: number;
  currentRepeat: number;
  stepEndTime: number;        // absolute timestamp when current step ends
  isRunning: boolean;
  isPaused: boolean;
  pausedTimeRemaining: number; // ms remaining when paused
  waitingForConfirm: boolean;
}
```

### 5.3 UI Components
- [ ] `views/SequenceTimer.vue` - Main sequence timer view
- [ ] `components/sequence/SequenceProgress.vue` - Linear progress bar
- [ ] `components/sequence/SequenceEditor.vue` - Create/edit sequences
- [ ] `components/sequence/SequenceList.vue` - Saved sequences list
- [ ] `components/sequence/StepConfirmDialog.vue` - "Ready for next step?"
- [ ] `components/sequence/SequenceComplete.vue` - End screen

### 5.4 Sequence Timer Flow

**1. Selection Screen**
- Categories: "Cooking" | "Productivity" | "My Sequences"
- List of saved sequences with quick-start button
- "Create New" button
- Import from URL (if shared link detected)

**2. Running a Sequence**
- Current step name prominently displayed
- Time remaining in large font
- Linear progress bar showing all steps
- Controls: Pause | Stop
- "Step 2 of 5" indicator

**3. Between Steps (Confirm Mode)**
- Play completion sound + notification
- Show: "Step Complete: [Step Name]"
- Preview: "Next: [Next Step Name] - [Duration]"
- Large "Start Next" button
- **Auto-start option** per sequence (skip confirm)

**4. Sequence Complete**
- Final completion sound + notification
- Summary display
- Options: "Start Again" | "Choose Another" | "Back to Timer"

### 5.5 URL Sharing Format
```
https://pomodoro.softsolution.pro/#seq=<base64-encoded-json>
```

Or human-readable:
```
#seq=SideA:3m,SideB:2m,SideA:1m&name=Steak&repeat=1
```

### 5.6 Default Sequences (Pre-loaded)

**Cooking:**
- Soft Boiled Egg: 6m
- Medium Boiled Egg: 8m
- Hard Boiled Egg: 12m
- Dumplings (batch): 90s → confirm → repeat
- Basic Steak: 3m → 3m → 1m rest

**Productivity:**
- Classic Pomodoro: 25m → 5m (×4), then 15m long break
- Quick Focus: 15m → 3m break

---

## Phase 6: UI/UX Improvements

### 6.1 Navigation
- [ ] Bottom navigation: "Timer" | "Sequences" | "Settings"
- [ ] Simple timer as default view
- [ ] Clear visual distinction between modes

### 6.2 Settings Page
- [ ] Sound on/off toggle
- [ ] Notifications on/off toggle
- [ ] Keep screen on toggle
- [ ] Language selector
- [ ] About/version info

### 6.3 Visual Design
- [ ] Consistent color scheme
- [ ] Cooking sequences: warm colors (orange/red)
- [ ] Productivity sequences: cool colors (blue/green)
- [ ] Smooth transitions
- [ ] Mobile-first responsive design

---

## File Structure (After Migration)

```
/var/www/pomodoro/
├── Dockerfile
├── nginx.conf
├── captain-definition
├── .dockerignore
├── package.json
├── vite.config.js
├── index.html
├── public/
│   ├── img/icons/
│   ├── sounds/
│   │   ├── timer-finish.mp3
│   │   └── step-complete.mp3
│   └── locales/
│       ├── en.json
│       └── pl.json
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── components/
│   │   ├── timer/
│   │   │   ├── CircularTimer.vue
│   │   │   └── TimerControls.vue
│   │   ├── sequence/
│   │   │   ├── SequenceProgress.vue
│   │   │   ├── SequenceEditor.vue
│   │   │   ├── SequenceList.vue
│   │   │   ├── StepConfirmDialog.vue
│   │   │   └── SequenceComplete.vue
│   │   └── common/
│   │       ├── AppNavigation.vue
│   │       ├── UpdatePrompt.vue
│   │       └── NotificationPermission.vue
│   ├── views/
│   │   ├── SimpleTimer.vue
│   │   ├── SequenceTimer.vue
│   │   └── Settings.vue
│   ├── stores/
│   │   ├── settings.js
│   │   ├── sequences.js
│   │   └── timer.js
│   ├── composables/
│   │   ├── useTimer.js
│   │   ├── useAudio.js
│   │   ├── useWakeLock.js
│   │   └── useNotifications.js
│   ├── workers/
│   │   └── timerWorker.js
│   ├── router/
│   │   └── index.js
│   ├── i18n/
│   │   └── index.js
│   └── utils/
│       └── urlEncoder.js
└── ...
```

---

## Implementation Order

1. **Phase 1: Docker + Deploy** - CI/CD pipeline first
2. **Phase 2: Vue 3 Migration** - Foundation
3. **Phase 3: Bug Fix** - Sidebar scroll
4. **Phase 4: Core Features** - Persistence, wake lock, i18n, **background timer + notifications**
5. **Phase 5: Sequence Timer** - Main new feature
6. **Phase 6: Polish** - UI/UX

---

## Technical Notes

### Background Timer - Key Implementation
```javascript
// Store absolute end time, not remaining time
const timerStore = defineStore('timer', {
  state: () => ({
    endTime: null,      // Date.now() + duration
    isRunning: false,
    // ...
  }),

  actions: {
    startTimer(durationMs) {
      this.endTime = Date.now() + durationMs;
      this.isRunning = true;
      this.persistState(); // Save to localStorage
    },

    getRemainingTime() {
      if (!this.isRunning || !this.endTime) return 0;
      return Math.max(0, this.endTime - Date.now());
    },

    checkCompletion() {
      if (this.isRunning && this.getRemainingTime() <= 0) {
        this.onTimerComplete();
      }
    }
  }
});

// On app load / visibility change
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    timerStore.checkCompletion();
  }
});
```

### Notification Permission Flow
1. On first timer start → show permission dialog
2. If granted → enable notifications in settings
3. If denied → show fallback message, rely on audio when in foreground

---

## Open Questions

1. **Build Tool:** Migrate to Vite? (Recommended for Vue 3)
2. **Vibration:** Use Vibration API on mobile?
3. **Different sounds:** Distinct sounds for step complete vs final complete?

---

## Success Criteria

- [ ] App accessible at https://pomodoro.softsolution.pro
- [ ] Auto-deploys on push to master
- [ ] PWA shows update prompt when new version available
- [ ] No horizontal scroll bug
- [ ] Simple timer works as before
- [ ] **Timer continues in background and notifies when complete**
- [ ] Screen stays on during active timer (when enabled)
- [ ] Sequence timer fully functional
- [ ] Sequences persist in localStorage
- [ ] Sequences shareable via URL
- [ ] Works offline (PWA)
- [ ] English and Polish language support
- [ ] Responsive on mobile devices
