<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWellsStore } from '@/stores/wells'

const store = useWellsStore()
const { seleccionado } = storeToRefs(store)

const numero = (valor: number) => valor.toLocaleString('es-AR')
</script>

<template>
  <Transition name="subir">
    <article v-if="seleccionado" class="detalle">
      <header>
        <span class="punto" :class="seleccionado.recurso === 'Gas' ? 'gas' : 'petroleo'" />
        <h2>{{ seleccionado.nombre }}</h2>
        <button type="button" aria-label="Cerrar" @click="store.seleccionar(null)">✕</button>
      </header>

      <p class="operadora">{{ seleccionado.operadora }}</p>

      <dl>
        <div>
          <dt>Cuenca</dt>
          <dd>{{ seleccionado.cuenca }}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{{ seleccionado.estado }}</dd>
        </div>
        <div>
          <dt>Producción</dt>
          <dd>{{ numero(seleccionado.produccion) }} <em>m³/d</em></dd>
        </div>
        <div>
          <dt>Profundidad</dt>
          <dd>{{ numero(seleccionado.profundidad) }} <em>m</em></dd>
        </div>
      </dl>

      <footer>
        {{ seleccionado.lat.toFixed(4) }}, {{ seleccionado.lon.toFixed(4) }}
        <span>WGS84</span>
      </footer>
    </article>
  </Transition>
</template>

<style scoped>
.detalle {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  width: 15rem;
  padding: 0.75rem 0.85rem;
  background: rgb(18 22 29 / 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid var(--borde);
  border-radius: var(--radio);
  box-shadow: var(--sombra);
}

header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

h2 {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  flex: 1;
}

header button {
  border: none;
  background: transparent;
  color: var(--texto-suave);
  cursor: pointer;
  font-size: 0.6875rem;
  padding: 0.15rem;
  line-height: 1;
}

header button:hover {
  color: var(--texto);
}

.punto {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.petroleo {
  background: var(--petroleo);
}

.gas {
  background: var(--gas);
}

.operadora {
  margin: 0.15rem 0 0.6rem;
  font-size: 0.6875rem;
  color: var(--texto-suave);
}

dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem 0.5rem;
  margin: 0;
}

dt {
  font-size: 0.5625rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--texto-suave);
}

dd {
  margin: 0.1rem 0 0;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

dd em {
  font-style: normal;
  font-size: 0.5625rem;
  color: var(--texto-suave);
}

footer {
  display: flex;
  justify-content: space-between;
  margin-top: 0.7rem;
  padding-top: 0.55rem;
  border-top: 1px solid var(--borde-suave);
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.5625rem;
  color: var(--texto-suave);
}

.subir-enter-active,
.subir-leave-active {
  transition: opacity var(--transicion), transform var(--transicion);
}

.subir-enter-from,
.subir-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
