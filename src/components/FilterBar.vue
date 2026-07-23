<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWellsStore } from '@/stores/wells'
import { NOMBRES_CUENCAS, NOMBRES_ESTADOS } from '@/data/wells'
import { rgba } from '@/data/simbologia'

const store = useWellsStore()
// storeToRefs mantiene la reactividad al destructurar el store.
const { cuenca, estado, recurso, produccionMinima, definitionExpression, hayFiltros } = storeToRefs(store)

function alternar(campo: 'cuenca' | 'estado' | 'recurso', valor: string) {
  const actual = { cuenca, estado, recurso }[campo]
  actual.value = actual.value === valor ? null : valor
}
</script>

<template>
  <section class="filtros">
    <div class="grupo">
      <label>Cuenca</label>
      <div class="chips">
        <button
          v-for="nombre in NOMBRES_CUENCAS"
          :key="nombre"
          type="button"
          class="chip"
          :class="{ activo: cuenca === nombre }"
          @click="alternar('cuenca', nombre)"
        >
          {{ nombre }}
        </button>
      </div>
    </div>

    <div class="grupo">
      <label>Recurso</label>
      <div class="chips">
        <button
          type="button"
          class="chip recurso"
          :class="{ activo: recurso === 'Petróleo' }"
          @click="alternar('recurso', 'Petróleo')"
        >
          <i class="punto" :style="{ background: rgba('Petróleo', 0.9) }" /> Petróleo
        </button>
        <button
          type="button"
          class="chip recurso"
          :class="{ activo: recurso === 'Gas' }"
          @click="alternar('recurso', 'Gas')"
        >
          <i class="punto" :style="{ background: rgba('Gas', 0.9) }" /> Gas
        </button>
      </div>
    </div>

    <div class="grupo">
      <label>Estado</label>
      <div class="chips">
        <button
          v-for="nombre in NOMBRES_ESTADOS"
          :key="nombre"
          type="button"
          class="chip"
          :class="{ activo: estado === nombre }"
          @click="alternar('estado', nombre)"
        >
          {{ nombre }}
        </button>
      </div>
    </div>

    <div class="grupo">
      <label>
        Producción mínima
        <em>{{ produccionMinima }} m³/d</em>
      </label>
      <input v-model.number="produccionMinima" type="range" min="0" max="400" step="20" />
    </div>

    <div class="pie">
      <code class="sql" :class="{ vacio: !hayFiltros }">{{ definitionExpression ?? 'sin filtro' }}</code>
      <button type="button" class="limpiar" :disabled="!hayFiltros" @click="store.limpiarFiltros()">Limpiar</button>
    </div>
  </section>
</template>

<style scoped>
.filtros {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.9rem 0.85rem;
  border-bottom: 1px solid var(--borde);
}

.grupo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  display: flex;
  justify-content: space-between;
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--texto-suave);
}

label em {
  font-style: normal;
  text-transform: none;
  letter-spacing: 0;
  color: var(--texto-medio);
  font-variant-numeric: tabular-nums;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.55rem;
  border: 1px solid var(--borde);
  border-radius: 99px;
  background: var(--superficie-alta);
  color: var(--texto-medio);
  font-size: 0.6875rem;
  cursor: pointer;
  transition: all var(--transicion);
}

.chip:hover {
  border-color: #313a4a;
  color: var(--texto);
}

.chip.activo {
  background: rgb(69 199 217 / 0.13);
  border-color: rgb(69 199 217 / 0.55);
  color: var(--texto);
}

.punto {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

input[type='range'] {
  width: 100%;
  height: 3px;
  appearance: none;
  background: var(--borde);
  border-radius: 99px;
  cursor: pointer;
}

input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--acento);
  border: 2px solid var(--superficie);
  cursor: pointer;
}

.pie {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.sql {
  flex: 1;
  min-width: 0;
  padding: 0.35rem 0.5rem;
  border-radius: var(--radio-chico);
  background: var(--fondo);
  border: 1px solid var(--borde-suave);
  color: var(--gas);
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.625rem;
  line-height: 1.4;
  overflow-x: auto;
  white-space: nowrap;
}

.sql.vacio {
  color: var(--texto-suave);
}

.limpiar {
  padding: 0.35rem 0.55rem;
  border: 1px solid var(--borde);
  border-radius: var(--radio-chico);
  background: var(--superficie-alta);
  color: var(--texto-medio);
  font-size: 0.6875rem;
  cursor: pointer;
  transition: all var(--transicion);
}

.limpiar:hover:not(:disabled) {
  color: var(--texto);
  border-color: #313a4a;
}

.limpiar:disabled {
  opacity: 0.35;
  cursor: default;
}
</style>
