import type { Recurso } from '@/data/wells'

/**
 * Colores y escalas del renderer, fuera del composable para tenerlos en un
 * solo lugar y poder reutilizarlos desde la interfaz.
 */
export const COLORES: Record<Recurso, [number, number, number]> = {
  'Petróleo': [242, 167, 59],
  Gas: [69, 199, 217],
}

export const PARADAS_TAMANO = [
  { valor: 0, tamano: 4, etiqueta: 'Sin producción' },
  { valor: 250, tamano: 13, etiqueta: '250' },
  { valor: 500, tamano: 24, etiqueta: '500 o más' },
] as const

export const rgba = (recurso: Recurso, alfa = 1) => `rgb(${COLORES[recurso].join(' ')} / ${alfa})`
