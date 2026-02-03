<template>
  <div class="page-container">
    <div class="page-list pa-4">
      <h2 class="text-h5 mb-4">{{ $t('settings.title') }}</h2>

      <v-list>
        <!-- Sound -->
        <v-list-item class="list-item" rounded>
        <template v-slot:prepend>
          <v-icon :color="settings.muted ? 'grey' : 'green-darken-2'">
            {{ settings.muted ? 'mdi-volume-variant-off' : 'mdi-volume-high' }}
          </v-icon>
        </template>
        <v-list-item-title>{{ $t('settings.sound') }}</v-list-item-title>
        <template v-slot:append>
          <v-switch
            :model-value="!settings.muted"
            @update:model-value="settings.toggleMuted()"
            color="green-darken-2"
            hide-details
            density="compact"
          ></v-switch>
        </template>
      </v-list-item>

      <!-- Keep Screen On -->
      <v-list-item class="list-item" rounded>
        <template v-slot:prepend>
          <v-icon :color="settings.keepScreenOn ? 'green-darken-2' : 'grey'">
            {{ settings.keepScreenOn ? 'mdi-cellphone' : 'mdi-cellphone-off' }}
          </v-icon>
        </template>
        <v-list-item-title>{{ $t('settings.keepScreenOn') }}</v-list-item-title>
        <template v-slot:append>
          <v-switch
            :model-value="settings.keepScreenOn"
            @update:model-value="settings.toggleKeepScreenOn()"
            color="green-darken-2"
            hide-details
            density="compact"
          ></v-switch>
        </template>
      </v-list-item>

      <!-- Language -->
      <v-list-item class="list-item" rounded>
        <template v-slot:prepend>
          <v-icon color="green-darken-2">mdi-translate</v-icon>
        </template>
        <v-list-item-title>{{ $t('settings.language') }}</v-list-item-title>
        <template v-slot:append>
          <v-btn-toggle
            :model-value="settings.language"
            @update:model-value="settings.setLanguage($event)"
            mandatory
            density="compact"
            color="green-darken-2"
          >
            <v-btn value="en" size="small">EN</v-btn>
            <v-btn value="pl" size="small">PL</v-btn>
          </v-btn-toggle>
        </template>
      </v-list-item>
      </v-list>

      <!-- About Section -->
      <v-divider class="my-6"></v-divider>

      <div class="about text-center text-grey">
        <p class="text-body-2 mb-1">{{ $t('settings.about') }}</p>
        <p class="text-caption">v1.0.0</p>
        <p class="text-caption mt-2">
          <a href="https://github.com/SebRogala/Pomodoro" target="_blank" class="text-grey">
            <v-icon size="small">mdi-github</v-icon>
            GitHub
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useSettingsStore } from '@/stores/settings'

export default {
  name: 'SettingsView',
  setup() {
    const settings = useSettingsStore()

    return {
      settings
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/shared.scss';

.about a {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
