import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Estado del MapView expuesto a la UI. El composable lo escribe desde los
 * watchers del SDK; los componentes solo lo leen.
 *
 * Vive en un store y no en el composable porque lo consumen componentes de
 * ramas distintas del árbol (el header y el propio contenedor del mapa).
 */
export const useMapStore = defineStore('map', () => {
  const listo = ref(false)
  const actualizando = ref(false)
  const zoom = ref(4)
  const featuresEnCapa = ref(0)
  const capaVisible = ref(true)

  return { listo, actualizando, zoom, featuresEnCapa, capaVisible }
})
