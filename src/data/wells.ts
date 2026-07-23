export type Recurso = 'Petróleo' | 'Gas'
export type Estado = 'Activo' | 'Inactivo' | 'En perforación' | 'Abandonado'

export interface Well {
  objectId: number
  nombre: string
  cuenca: string
  operadora: string
  recurso: Recurso
  estado: Estado
  produccion: number
  profundidad: number
  lon: number
  lat: number
}

interface Cuenca {
  nombre: string
  lonMin: number
  lonMax: number
  latMin: number
  latMax: number
  peso: number
  recursoDominante: Recurso
}

/**
 * Extensiones aproximadas de las cinco cuencas productivas argentinas.
 * Los datos de pozos son simulados: no representan ubicaciones reales.
 */
const CUENCAS: Cuenca[] = [
  { nombre: 'Neuquina', lonMin: -70.4, lonMax: -67.2, latMin: -39.8, latMax: -36.4, peso: 0.42, recursoDominante: 'Gas' },
  { nombre: 'Golfo San Jorge', lonMin: -69.4, lonMax: -67.1, latMin: -46.9, latMax: -45.1, peso: 0.26, recursoDominante: 'Petróleo' },
  { nombre: 'Austral', lonMin: -69.9, lonMax: -67.6, latMin: -52.8, latMax: -50.6, peso: 0.14, recursoDominante: 'Gas' },
  { nombre: 'Cuyana', lonMin: -68.9, lonMax: -67.6, latMin: -33.9, latMax: -32.1, peso: 0.11, recursoDominante: 'Petróleo' },
  { nombre: 'Noroeste', lonMin: -64.9, lonMax: -63.1, latMin: -23.4, latMax: -21.6, peso: 0.07, recursoDominante: 'Gas' },
]

const OPERADORAS = [
  'Patagonia Energía',
  'Sur Petrolera',
  'Andes Oil & Gas',
  'Cuenca Norte SA',
  'Meseta Hidrocarburos',
  'Río Limay Energía',
]

const ESTADOS: { valor: Estado; peso: number }[] = [
  { valor: 'Activo', peso: 0.62 },
  { valor: 'En perforación', peso: 0.12 },
  { valor: 'Inactivo', peso: 0.18 },
  { valor: 'Abandonado', peso: 0.08 },
]

/** Generador congruencial lineal: datos estables entre recargas. */
function crearRandom(semilla: number) {
  let estado = semilla
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296
    return estado / 4294967296
  }
}

function elegirPonderado<T>(random: () => number, opciones: { valor: T; peso: number }[]): T {
  const objetivo = random()
  let acumulado = 0
  for (const opcion of opciones) {
    acumulado += opcion.peso
    if (objetivo <= acumulado) return opcion.valor
  }
  return opciones[opciones.length - 1].valor
}

export function generarPozos(cantidad = 280): Well[] {
  const random = crearRandom(20260728)
  const pozos: Well[] = []
  let objectId = 1

  for (const cuenca of CUENCAS) {
    const cantidadCuenca = Math.round(cantidad * cuenca.peso)

    for (let i = 0; i < cantidadCuenca; i++) {
      const estado = elegirPonderado(random, ESTADOS)
      const recurso: Recurso =
        random() < 0.72 ? cuenca.recursoDominante : cuenca.recursoDominante === 'Gas' ? 'Petróleo' : 'Gas'

      const produccionBase = estado === 'Activo' ? 40 + random() * 460 : estado === 'En perforación' ? random() * 40 : 0

      pozos.push({
        objectId: objectId++,
        nombre: `${cuenca.nombre.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
        cuenca: cuenca.nombre,
        operadora: OPERADORAS[Math.floor(random() * OPERADORAS.length)],
        recurso,
        estado,
        produccion: Math.round(produccionBase),
        profundidad: Math.round(1200 + random() * 3400),
        lon: Number((cuenca.lonMin + random() * (cuenca.lonMax - cuenca.lonMin)).toFixed(5)),
        lat: Number((cuenca.latMin + random() * (cuenca.latMax - cuenca.latMin)).toFixed(5)),
      })
    }
  }

  return pozos
}

export const NOMBRES_CUENCAS = CUENCAS.map((c) => c.nombre)
export const NOMBRES_ESTADOS = ESTADOS.map((e) => e.valor)
