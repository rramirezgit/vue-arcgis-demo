import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { generarPozos, type Well } from '@/data/wells'

export const useWellsStore = defineStore('wells', () => {
  const pozos = ref<Well[]>(generarPozos())

  const cuenca = ref<string | null>(null)
  const estado = ref<string | null>(null)
  const recurso = ref<string | null>(null)
  const produccionMinima = ref(0)

  const seleccionadoId = ref<number | null>(null)

  /**
   * Cláusula SQL que se aplica al FeatureLayer via `definitionExpression`.
   * El filtrado ocurre del lado de la capa, no recorriendo el array en Vue.
   */
  const definitionExpression = computed(() => {
    const clausulas: string[] = []
    if (cuenca.value) clausulas.push(`cuenca = '${cuenca.value}'`)
    if (estado.value) clausulas.push(`estado = '${estado.value}'`)
    if (recurso.value) clausulas.push(`recurso = '${recurso.value}'`)
    if (produccionMinima.value > 0) clausulas.push(`produccion >= ${produccionMinima.value}`)
    return clausulas.length ? clausulas.join(' AND ') : null
  })

  /** Espejo en cliente del mismo filtro, para el panel lateral. */
  const pozosFiltrados = computed(() =>
    pozos.value.filter(
      (p) =>
        (!cuenca.value || p.cuenca === cuenca.value) &&
        (!estado.value || p.estado === estado.value) &&
        (!recurso.value || p.recurso === recurso.value) &&
        p.produccion >= produccionMinima.value,
    ),
  )

  const seleccionado = computed(() => pozos.value.find((p) => p.objectId === seleccionadoId.value) ?? null)

  /** Referencia para dibujar la barra de producción de cada ítem del listado. */
  const produccionMaxima = computed(() => Math.max(1, ...pozos.value.map((p) => p.produccion)))

  const kpis = computed(() => {
    const lista = pozosFiltrados.value
    const activos = lista.filter((p) => p.estado === 'Activo')
    const produccionTotal = lista.reduce((total, p) => total + p.produccion, 0)
    return {
      total: lista.length,
      activos: activos.length,
      produccionTotal,
      profundidadMedia: lista.length
        ? Math.round(lista.reduce((total, p) => total + p.profundidad, 0) / lista.length)
        : 0,
    }
  })

  const hayFiltros = computed(() => definitionExpression.value !== null)

  function limpiarFiltros() {
    cuenca.value = null
    estado.value = null
    recurso.value = null
    produccionMinima.value = 0
  }

  function seleccionar(objectId: number | null) {
    seleccionadoId.value = objectId
  }

  return {
    pozos,
    cuenca,
    estado,
    recurso,
    produccionMinima,
    seleccionadoId,
    seleccionado,
    produccionMaxima,
    definitionExpression,
    pozosFiltrados,
    kpis,
    hayFiltros,
    limpiarFiltros,
    seleccionar,
  }
})
