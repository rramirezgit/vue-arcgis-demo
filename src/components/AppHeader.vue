<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/map'

const { zoom, featuresEnCapa, actualizando, listo } = storeToRefs(useMapStore())
</script>

<template>
  <header>
    <div class="marca">
      <span class="monograma">AR</span>
      <div>
        <h1>Pozos · cuencas argentinas</h1>
        <p>Vue 3 · Pinia · ArcGIS Maps SDK for JavaScript 5.1</p>
      </div>
    </div>

    <div class="estado">
      <span class="dato">
        <em>{{ featuresEnCapa }}</em>
        features en la capa
      </span>
      <span class="sep" />
      <span class="dato"><em>z{{ zoom }}</em> zoom</span>
      <span class="sep" />
      <span class="pulso" :class="{ activo: actualizando, listo }">
        <i />
        {{ !listo ? 'iniciando' : actualizando ? 'dibujando' : 'en línea' }}
      </span>
    </div>
  </header>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1rem;
  height: 56px;
  background: var(--superficie);
  border-bottom: 1px solid var(--borde);
}

.marca {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.monograma {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(140deg, var(--gas), #2b7f99);
  color: #06212a;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

h1 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.marca p {
  margin: 0.1rem 0 0;
  font-size: 0.6875rem;
  color: var(--texto-suave);
}

.estado {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-size: 0.6875rem;
  color: var(--texto-suave);
}

.dato em {
  font-style: normal;
  font-weight: 600;
  color: var(--texto);
  font-variant-numeric: tabular-nums;
  margin-right: 0.25rem;
}

.sep {
  width: 1px;
  height: 14px;
  background: var(--borde);
}

.pulso {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.pulso i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--texto-suave);
}

.pulso.listo i {
  background: var(--ok);
  box-shadow: 0 0 0 3px rgb(74 217 145 / 0.15);
}

.pulso.activo i {
  background: var(--petroleo);
  box-shadow: 0 0 0 3px rgb(242 167 59 / 0.15);
  animation: latir 1s ease-in-out infinite;
}

@keyframes latir {
  50% {
    opacity: 0.35;
  }
}

@media (max-width: 720px) {
  .marca p,
  .sep,
  .dato:first-of-type {
    display: none;
  }
}
</style>
