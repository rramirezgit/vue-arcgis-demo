<script setup lang="ts">
import { ref } from 'vue'
import { useWellsMap } from '@/composables/useWellsMap'
import WellDetail from '@/components/WellDetail.vue'

const contenedor = ref<HTMLDivElement | null>(null)

// Ranuras donde el composable monta los componentes web del SDK.
const leyenda = ref<HTMLElement | null>(null)
const galeriaBasemaps = ref<HTMLElement | null>(null)
const home = ref<HTMLElement | null>(null)
const escala = ref<HTMLElement | null>(null)
const capas = ref<HTMLElement | null>(null)
const pantallaCompleta = ref<HTMLElement | null>(null)

const { listo, capaVisible, irAExtensionCompleta } = useWellsMap(contenedor, {
  leyenda,
  galeriaBasemaps,
  home,
  escala,
  capas,
  pantallaCompleta,
})

type Panel = 'capas' | 'fondo' | null
const panelAbierto = ref<Panel>(null)

function alternarPanel(panel: Exclude<Panel, null>) {
  panelAbierto.value = panelAbierto.value === panel ? null : panel
}
</script>

<template>
  <div class="mapa-wrapper">
    <div ref="contenedor" class="mapa" />

    <Transition name="fundido">
      <div v-if="!listo" class="cargando">
        <span class="spinner" />
        Iniciando el mapa
      </div>
    </Transition>

    <!-- Controles propios, arriba a la izquierda -->
    <div class="panel-flotante superior-izq">
      <label class="toggle">
        <input v-model="capaVisible" type="checkbox" />
        <span>Pozos</span>
      </label>
      <button
        type="button"
        class="mini"
        :class="{ activo: panelAbierto === 'capas' }"
        @click="alternarPanel('capas')"
      >
        Capas
      </button>
      <button
        type="button"
        class="mini"
        :class="{ activo: panelAbierto === 'fondo' }"
        @click="alternarPanel('fondo')"
      >
        Fondo
      </button>
      <button type="button" class="mini" @click="irAExtensionCompleta">País</button>
    </div>

    <!-- Panel con los componentes del SDK: lista de capas y leyenda generada
         a partir del renderer -->
    <div v-show="panelAbierto === 'capas'" class="panel-flotante superior-izq-2">
      <div class="seccion">
        <span class="rotulo">Capas</span>
        <div ref="capas" class="widget-sdk" />
      </div>
      <div class="seccion">
        <span class="rotulo">Simbología</span>
        <div ref="leyenda" class="widget-sdk leyenda-sdk" />
      </div>
    </div>

    <!-- La galería se mantiene montada: recrearla obligaría a recargar las
         miniaturas en cada apertura. -->
    <div v-show="panelAbierto === 'fondo'" class="panel-flotante superior-izq-2 panel-fondo">
      <span class="rotulo">Mapa base</span>
      <div ref="galeriaBasemaps" class="widget-sdk" />
    </div>

    <!-- Componentes web del SDK, arriba a la derecha -->
    <div class="widgets superior-der">
      <div ref="home" class="boton-sdk" />
      <div ref="pantallaCompleta" class="boton-sdk" />
    </div>

    <div ref="escala" class="escala" />

    <WellDetail />
  </div>
</template>

<style scoped>
.mapa-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.mapa {
  height: 100%;
  width: 100%;
}

.cargando {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: var(--fondo);
  color: var(--texto-suave);
  font-size: 0.8125rem;
  z-index: 5;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--borde);
  border-top-color: var(--acento);
  border-radius: 50%;
  animation: girar 0.7s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

.fundido-leave-active {
  transition: opacity 250ms ease;
}

.fundido-leave-to {
  opacity: 0;
}

.panel-flotante {
  position: absolute;
  z-index: 3;
  background: rgb(18 22 29 / 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  box-shadow: var(--sombra);
}

.superior-izq {
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.55rem;
  font-size: 0.6875rem;
}

.superior-izq-2 {
  top: 3.1rem;
  left: 0.75rem;
  width: 14.5rem;
  max-height: 62%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.3rem 0;
}

.seccion + .seccion {
  border-top: 1px solid var(--borde-suave);
  margin-top: 0.35rem;
  padding-top: 0.35rem;
}

.rotulo {
  display: block;
  padding: 0.25rem 0.7rem;
  font-size: 0.5625rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--texto-suave);
}

/* Los componentes traen su propio dimensionado; acá se acotan al panel. */
.widget-sdk {
  overflow: hidden;
  zoom: 0.85;
}

.leyenda-sdk {
  max-height: 16rem;
  overflow-y: auto;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  color: var(--texto-medio);
}

.toggle input {
  accent-color: var(--acento);
}

.mini {
  padding: 0.2rem 0.45rem;
  border: 1px solid var(--borde);
  border-radius: var(--radio-chico);
  background: var(--superficie-alta);
  color: var(--texto-medio);
  font-size: 0.6875rem;
  cursor: pointer;
  transition: all var(--transicion);
}

.mini:hover {
  color: var(--texto);
  border-color: #313a4a;
}

.mini.activo {
  background: rgb(69 199 217 / 0.13);
  border-color: rgb(69 199 217 / 0.55);
  color: var(--texto);
}

.widgets {
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.superior-der {
  top: 0.75rem;
  right: 0.75rem;
}

/* Cada componente trae su propio tamaño intrínseco; el stack los normaliza. */
.boton-sdk {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  overflow: hidden;
}

/* Los ítems de la galería traen un ancho fijo de 250px: el panel se ajusta a
   ellos en lugar de recortarlos. */
.panel-fondo {
  width: 17.5rem;
  padding-bottom: 0.35rem;
}

.escala {
  position: absolute;
  z-index: 3;
  bottom: 1.15rem;
  left: 0.9rem;
}

@media (max-width: 720px) {
  .superior-izq-2 {
    display: none;
  }
}
</style>

<style>
/* Los componentes web traen su propio fondo; acá se integran al panel. */
.mapa-wrapper arcgis-legend,
.mapa-wrapper arcgis-layer-list {
  --calcite-color-foreground-1: transparent;
  --calcite-color-foreground-2: transparent;
  background: transparent;
}

.mapa-wrapper .boton-sdk > * {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: var(--radio-chico);
  overflow: hidden;
  box-shadow: var(--sombra);
  border: 1px solid var(--borde);
}

.mapa-wrapper .esri-widget {
  background: transparent;
  color: var(--texto-medio);
}

.mapa-wrapper .esri-legend__service-label {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--texto-suave);
  font-weight: 500;
}

.mapa-wrapper .esri-legend__layer-caption {
  font-size: 0.625rem;
  color: var(--texto-suave);
}

.mapa-wrapper .esri-legend__layer-cell--info,
.mapa-wrapper .esri-legend__layer-cell {
  font-size: 0.6875rem;
  color: var(--texto-medio);
}

.mapa-wrapper .esri-scale-bar__label {
  color: var(--texto-medio);
  font-size: 0.5625rem;
}

.mapa-wrapper .esri-scale-bar__line {
  border-color: var(--texto-suave);
}
</style>
