<template>
  <v-app>
    <v-main :class="{ 'no-nav': settings.timerRunning }">
      <router-view />
    </v-main>

    <v-bottom-navigation
      v-if="!settings.timerRunning"
      v-model="currentRoute"
      grow
      color="green-darken-2"
    >
      <v-btn value="/" @click="$router.push('/')">
        <v-icon>mdi-timer</v-icon>
        <span>{{ $t('nav.timer') }}</span>
      </v-btn>

      <v-btn value="/sequences" @click="$router.push('/sequences')">
        <v-icon>mdi-playlist-play</v-icon>
        <span>{{ $t('nav.sequences') }}</span>
      </v-btn>

      <v-btn value="/settings" @click="$router.push('/settings')">
        <v-icon>mdi-cog</v-icon>
        <span>{{ $t('nav.settings') }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const settings = useSettingsStore()
    const currentRoute = ref(route.path)

    watch(() => route.path, (newPath) => {
      currentRoute.value = newPath
    })

    return {
      currentRoute,
      settings
    }
  }
}
</script>

<style lang="scss">
.v-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 56px !important;

  &.no-nav {
    padding-bottom: 0 !important;
  }
}

.v-bottom-navigation {
  z-index: 2100 !important; // Above drawer overlay (2000)
}
</style>
