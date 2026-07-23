<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import MapContainer from '@/components/MapContainer.vue'
import SidePanel from '@/components/SidePanel.vue'
</script>

<template>
  <div class="app calcite-mode-dark">
    <AppHeader />

    <main>
      <SidePanel />
      <MapContainer />
    </main>
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
}

main {
  display: grid;
  grid-template-columns: 21rem 1fr;
  min-height: 0;
  overflow: hidden;
}

/* Los grid items traen min-height: auto, así que la lista de pozos estiraría
   la fila y el MapView crearía un framebuffer del alto del contenido. */
main > * {
  min-height: 0;
}

@media (max-width: 720px) {
  main {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}
</style>
