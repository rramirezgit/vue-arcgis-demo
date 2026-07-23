<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWellsStore } from '@/stores/wells'
import FilterBar from '@/components/FilterBar.vue'

const store = useWellsStore()
const { pozosFiltrados, seleccionadoId, kpis, produccionMaxima } = storeToRefs(store)

const numero = (valor: number) => valor.toLocaleString('es-AR')
</script>

<template>
  <aside class="panel">
    <div class="kpis">
      <div class="kpi">
        <strong>{{ numero(kpis.total) }}</strong>
        <span>pozos</span>
      </div>
      <div class="kpi">
        <strong>{{ numero(kpis.activos) }}</strong>
        <span>activos</span>
      </div>
      <div class="kpi">
        <strong>{{ numero(kpis.produccionTotal) }}</strong>
        <span>m³/d</span>
      </div>
      <div class="kpi">
        <strong>{{ numero(kpis.profundidadMedia) }}</strong>
        <span>m prom.</span>
      </div>
    </div>

    <FilterBar />

    <div class="encabezado-lista">
      <span>Listado</span>
      <span class="cantidad">{{ numero(pozosFiltrados.length) }}</span>
    </div>

    <p v-if="!pozosFiltrados.length" class="vacio">Ningún pozo cumple el filtro.</p>

    <ul v-else class="lista">
      <li
        v-for="pozo in pozosFiltrados"
        :key="pozo.objectId"
        :class="{ activo: pozo.objectId === seleccionadoId }"
        @click="store.seleccionar(pozo.objectId)"
      >
        <div class="fila">
          <strong>{{ pozo.nombre }}</strong>
          <span class="produccion">{{ numero(pozo.produccion) }}<em>m³/d</em></span>
        </div>
        <div class="meta">
          <span class="punto" :class="pozo.recurso === 'Gas' ? 'gas' : 'petroleo'" />
          <span>{{ pozo.cuenca }}</span>
          <span class="estado" :class="`e-${pozo.estado.split(' ')[0].toLowerCase()}`">{{ pozo.estado }}</span>
        </div>
        <div class="barra">
          <i :style="{ width: `${Math.round((pozo.produccion / produccionMaxima) * 100)}%` }" :class="pozo.recurso === 'Gas' ? 'gas' : 'petroleo'" />
        </div>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--superficie);
  border-right: 1px solid var(--borde);
}

.kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid var(--borde);
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.7rem 0.5rem;
  text-align: center;
  border-right: 1px solid var(--borde-suave);
}

.kpi:last-child {
  border-right: none;
}

.kpi strong {
  font-size: 0.9375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.kpi span {
  font-size: 0.5625rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--texto-suave);
}

.encabezado-lista {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.85rem;
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--texto-suave);
  border-bottom: 1px solid var(--borde-suave);
}

.cantidad {
  padding: 0.1rem 0.4rem;
  border-radius: 99px;
  background: var(--superficie-alta);
  color: var(--texto-medio);
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
}

.lista {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.lista li {
  padding: 0.6rem 0.85rem;
  border-bottom: 1px solid var(--borde-suave);
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: background var(--transicion), border-color var(--transicion);
}

.lista li:hover {
  background: var(--superficie-alta);
}

.lista li.activo {
  background: rgb(69 199 217 / 0.08);
  border-left-color: var(--acento);
}

.fila {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.fila strong {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.produccion {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: var(--texto-medio);
}

.produccion em {
  font-style: normal;
  font-size: 0.5625rem;
  color: var(--texto-suave);
  margin-left: 0.15rem;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.3rem;
  font-size: 0.625rem;
  color: var(--texto-suave);
}

.punto {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex: none;
}

.petroleo {
  background: var(--petroleo);
}

.gas {
  background: var(--gas);
}

.estado {
  margin-left: auto;
  padding: 0.05rem 0.35rem;
  border-radius: 99px;
  background: var(--superficie-alta);
  color: var(--texto-medio);
}

.e-activo {
  color: var(--ok);
  background: rgb(74 217 145 / 0.1);
}

.e-en {
  color: var(--petroleo);
  background: rgb(242 167 59 / 0.1);
}

.e-abandonado {
  color: var(--alerta);
  background: rgb(242 112 75 / 0.1);
}

.barra {
  height: 2px;
  margin-top: 0.45rem;
  background: var(--borde-suave);
  border-radius: 99px;
  overflow: hidden;
}

.barra i {
  display: block;
  height: 100%;
  border-radius: 99px;
  transition: width var(--transicion);
}

.vacio {
  padding: 2rem 0.85rem;
  text-align: center;
  color: var(--texto-suave);
  font-size: 0.75rem;
}
</style>
