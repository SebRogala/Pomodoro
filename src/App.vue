<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
.v-main {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
