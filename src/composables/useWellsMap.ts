import { onBeforeUnmount, onMounted, shallowRef, watch, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import type Basemap from '@arcgis/core/Basemap'
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import type MapView from '@arcgis/core/views/MapView'
import { useWellsStore } from '@/stores/wells'
import { useMapStore } from '@/stores/map'
import { COLORES, PARADAS_TAMANO } from '@/data/simbologia'
import type { Well } from '@/data/wells'

const CENTRO_ARGENTINA: [number, number] = [-66.5, -40.5]
const ZOOM_INICIAL = 4

/**
 * Algunos componentes heredados no exponen tokens de Calcite para su fondo,
 * así que se les adosa una hoja de estilo dentro del shadow root. Es la vía
 * soportada por la plataforma: `adoptedStyleSheets` sobre el propio shadow.
 */
function tematizar(elemento: HTMLElement, css: string, intentos = 20) {
  const raiz = elemento.shadowRoot
  if (!raiz) {
    if (intentos > 0) requestAnimationFrame(() => tematizar(elemento, css, intentos - 1))
    return
  }
  const hoja = new CSSStyleSheet()
  hoja.replaceSync(css)
  raiz.adoptedStyleSheets = [...raiz.adoptedStyleSheets, hoja]
}

const CSS_ESCALA = `
  .root, .esri-widget { background: transparent !important; }
  .label { color: #626c7b !important; font-size: 10px !important; }
  .line, .line-top {
    border-width: 1px !important;
    border-color: #4a5361 !important;
    background: transparent !important;
  }
`

/* La leyenda delega su contenido en sub-componentes con shadow propio, así que
   desde acá solo se alcanza su contenedor. */
const CSS_LEYENDA = `
  .root, .esri-widget, .esri-widget--panel { background: transparent !important; }
`

/* Los botones traen 36x32; sin esto quedan descentrados dentro del stack. */
const CSS_BOTON = `
  .root, .arcgis-button, calcite-button {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
  }
`

/** Contenedores donde se montan los componentes web del SDK. */
export interface RanurasWidgets {
  leyenda: Ref<HTMLElement | null>
  galeriaBasemaps: Ref<HTMLElement | null>
  home: Ref<HTMLElement | null>
  escala: Ref<HTMLElement | null>
  capas: Ref<HTMLElement | null>
  pantallaCompleta: Ref<HTMLElement | null>
}

/** Teselas públicas: ninguna de estas fuentes requiere API key. */
const FONDOS = [
  { id: 'carto-dark', titulo: 'Oscuro', tipo: 'xyz', ruta: 'dark_all' },
  { id: 'carto-light', titulo: 'Claro', tipo: 'xyz', ruta: 'light_all' },
  { id: 'carto-voyager', titulo: 'Calles', tipo: 'xyz', ruta: 'rastertiles/voyager' },
  { id: 'esri-imagery', titulo: 'Satélite', tipo: 'mapserver', ruta: 'World_Imagery' },
  { id: 'esri-topo', titulo: 'Topográfico', tipo: 'mapserver', ruta: 'World_Topo_Map' },
  { id: 'esri-terrain', titulo: 'Relieve', tipo: 'mapserver', ruta: 'World_Terrain_Base' },
] as const

const BASE_CARTO = 'https://{subDomain}.basemaps.cartocdn.com'
const BASE_ESRI = 'https://services.arcgisonline.com/ArcGIS/rest/services'

/**
 * Encapsula todo el ciclo de vida del MapView.
 *
 * Regla número uno de la integración: ni el Map, ni el MapView, ni las capas
 * se guardan en `ref()` o `reactive()`. El Proxy de Vue envolvería el grafo de
 * objetos del SDK y rompería su sistema Accessor, además de destrozar la
 * performance. Se usa `shallowRef`, que guarda la referencia sin volverla
 * reactiva por dentro.
 */
export function useWellsMap(contenedor: Ref<HTMLDivElement | null>, ranuras: RanurasWidgets) {
  const store = useWellsStore()
  const mapStore = useMapStore()
  // El conteo de `featuresEnCapa` lo devuelve la propia capa: prueba que el
  // filtro se aplicó al SDK y no solo al array de Vue.
  const { listo, actualizando, zoom, capaVisible, featuresEnCapa } = storeToRefs(mapStore)

  const view = shallowRef<MapView | null>(null)
  const capa = shallowRef<FeatureLayer | null>(null)
  const fondos = shallowRef<Basemap[]>([])

  onMounted(async () => {
    if (!contenedor.value) return

    // Import dinámico: @arcgis/core es pesado, no debe entrar en el bundle inicial.
    const [
      { default: EsriMap },
      { default: EsriMapView },
      { default: EsriFeatureLayer },
      { default: Graphic },
      { default: Point },
      { default: EsriBasemap },
      { default: WebTileLayer },
      { default: TileLayer },
    ] = await Promise.all([
      import('@arcgis/core/Map.js'),
      import('@arcgis/core/views/MapView.js'),
      import('@arcgis/core/layers/FeatureLayer.js'),
      import('@arcgis/core/Graphic.js'),
      import('@arcgis/core/geometry/Point.js'),
      import('@arcgis/core/Basemap.js'),
      import('@arcgis/core/layers/WebTileLayer.js'),
      import('@arcgis/core/layers/TileLayer.js'),
    ])

    // Basemaps propios: los del catálogo de Esri ("topo-vector", "arcgis/streets")
    // requieren API key. Los servicios XYZ de CARTO se consumen con WebTileLayer
    // y los MapServer públicos de ArcGIS Online con TileLayer, que además trae
    // metadatos y atribución del propio servicio.
    const crearBasemap = (fondo: (typeof FONDOS)[number]) =>
      new EsriBasemap({
        id: fondo.id,
        title: fondo.titulo,
        thumbnailUrl:
          fondo.tipo === 'xyz'
            ? `https://a.basemaps.cartocdn.com/${fondo.ruta}/4/5/9.png`
            : `${BASE_ESRI}/${fondo.ruta}/MapServer/tile/4/9/5`,
        baseLayers: [
          fondo.tipo === 'xyz'
            ? new WebTileLayer({
                urlTemplate: `${BASE_CARTO}/${fondo.ruta}/{level}/{col}/{row}.png`,
                subDomains: ['a', 'b', 'c'],
                copyright: '© OpenStreetMap contributors © CARTO',
              })
            : new TileLayer({ url: `${BASE_ESRI}/${fondo.ruta}/MapServer` }),
        ],
      })

    const listaFondos = FONDOS.map(crearBasemap)
    const oscuro = listaFondos[0]
    fondos.value = listaFondos

    const features = store.pozos.map(
      (pozo: Well) =>
        new Graphic({
          geometry: new Point({ longitude: pozo.lon, latitude: pozo.lat }),
          attributes: { ...pozo },
        }),
    )

    // FeatureLayer client-side: mismos renderers, consultas y definitionExpression
    // que un servicio remoto. Para apuntar a un FeatureServer real basta con
    // reemplazar `source`/`fields` por `url`.
    const capaPozos = new EsriFeatureLayer({
      title: 'Pozos',
      source: features,
      objectIdField: 'objectId',
      geometryType: 'point',
      spatialReference: { wkid: 4326 },
      fields: [
        { name: 'objectId', type: 'oid' },
        { name: 'nombre', type: 'string', alias: 'Pozo' },
        { name: 'cuenca', type: 'string', alias: 'Cuenca' },
        { name: 'operadora', type: 'string', alias: 'Operadora' },
        { name: 'recurso', type: 'string', alias: 'Recurso' },
        { name: 'estado', type: 'string', alias: 'Estado' },
        { name: 'produccion', type: 'double', alias: 'Producción' },
        { name: 'profundidad', type: 'double', alias: 'Profundidad' },
      ],
      // Autocast: el SDK convierte estos objetos planos en instancias de
      // UniqueValueRenderer, SimpleMarkerSymbol y PopupTemplate.
      renderer: {
        type: 'unique-value',
        field: 'recurso',
        legendOptions: { title: 'Recurso' },
        uniqueValueInfos: (['Petróleo', 'Gas'] as const).map((recurso) => ({
          value: recurso,
          label: recurso,
          symbol: {
            type: 'simple-marker',
            color: [...COLORES[recurso], 0.85],
            outline: { color: [12, 16, 22, 0.9], width: 0.7 },
          },
        })),
        visualVariables: [
          {
            type: 'size',
            field: 'produccion',
            legendOptions: { title: 'Producción (m³/d)' },
            stops: PARADAS_TAMANO.map((p) => ({ value: p.valor, size: p.tamano, label: p.etiqueta })),
          },
        ],
      },
      popupTemplate: {
        title: '{nombre}',
        content: [
          {
            type: 'fields',
            fieldInfos: [
              { fieldName: 'cuenca' },
              { fieldName: 'operadora' },
              { fieldName: 'recurso' },
              { fieldName: 'estado' },
              { fieldName: 'produccion', format: { digitSeparator: true, places: 0 } },
              { fieldName: 'profundidad', format: { digitSeparator: true, places: 0 } },
            ],
          },
        ],
      },
    })

    const mapa = new EsriMap({ basemap: oscuro, layers: [capaPozos] })

    const mapView = new EsriMapView({
      container: contenedor.value,
      map: mapa,
      center: CENTRO_ARGENTINA,
      zoom: ZOOM_INICIAL,
      constraints: { rotationEnabled: false },
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      popup: { dockEnabled: false },
    })

    // Los widgets se posicionan con CSS propio, no con la UI del view.
    mapView.ui.components = []

    capa.value = capaPozos
    view.value = mapView

    await mapView.when()
    listo.value = true
    featuresEnCapa.value = await capaPozos.queryFeatureCount()

    await montarWidgets(mapView, listaFondos)

    const reactiveUtils = await import('@arcgis/core/core/reactiveUtils.js')

    // Del mapa hacia Vue: los cambios del SDK se observan con reactiveUtils
    // y se copian a refs para que el template pueda mostrarlos.
    reactiveUtils.watch(
      () => mapView.zoom,
      (valor) => {
        zoom.value = Math.round((valor ?? 0) * 10) / 10
      },
      { initial: true },
    )

    reactiveUtils.watch(
      () => mapView.updating,
      (valor) => {
        actualizando.value = valor
      },
    )

    mapView.on('click', async (evento) => {
      const resultado = await mapView.hitTest(evento, { include: [capaPozos] })
      const grafico = resultado.results.find((r) => r.type === 'graphic')
      store.seleccionar(grafico && 'graphic' in grafico ? grafico.graphic.attributes.objectId : null)
    })
  })

  /**
   * Componentes web de @arcgis/map-components. Reemplazan a los widgets
   * clásicos desde la versión 4.31 y aceptan el `view` por propiedad, así que
   * conviven con un MapView creado de forma imperativa.
   */
  async function montarWidgets(mapView: MapView, listaFondos: Basemap[]) {
    const [, , , , , , { default: LocalBasemapsSource }] = await Promise.all([
      import('@arcgis/map-components/components/arcgis-legend'),
      import('@arcgis/map-components/components/arcgis-basemap-gallery'),
      import('@arcgis/map-components/components/arcgis-home'),
      import('@arcgis/map-components/components/arcgis-scale-bar'),
      import('@arcgis/map-components/components/arcgis-layer-list'),
      import('@arcgis/map-components/components/arcgis-fullscreen'),
      import('@arcgis/core/widgets/BasemapGallery/support/LocalBasemapsSource.js'),
    ])

    const crear = <T extends HTMLElement>(
      tag: string,
      host: HTMLElement | null,
      props: Record<string, unknown> = {},
      css?: string,
    ) => {
      if (!host) return null
      const elemento = document.createElement(tag) as T
      Object.assign(elemento, { view: mapView }, props)
      host.replaceChildren(elemento)
      if (css) tematizar(elemento, css)
      return elemento
    }

    crear('arcgis-legend', ranuras.leyenda.value, { hideLayersNotInCurrentView: false }, CSS_LEYENDA)
    // Sin `source` la galería intentaría leer los basemaps del portal, que
    // requieren autenticación. Con LocalBasemapsSource usa solo los propios.
    crear('arcgis-basemap-gallery', ranuras.galeriaBasemaps.value, {
      source: new LocalBasemapsSource({ basemaps: listaFondos }),
    })
    crear('arcgis-home', ranuras.home.value, {}, CSS_BOTON)
    crear('arcgis-scale-bar', ranuras.escala.value, { unit: 'metric' }, CSS_ESCALA)
    crear('arcgis-layer-list', ranuras.capas.value)
    crear('arcgis-fullscreen', ranuras.pantallaCompleta.value, { element: contenedor.value }, CSS_BOTON)
  }

  onBeforeUnmount(() => {
    // Sin destroy() el MapView queda vivo al cambiar de ruta: fuga de memoria
    // y contextos WebGL huérfanos.
    view.value?.destroy()
    view.value = null
    capa.value = null
  })

  // De Vue hacia el mapa: el filtro se aplica sobre la capa, que devuelve
  // solamente los features que cumplen la cláusula.
  watch(
    () => store.definitionExpression,
    async (expresion) => {
      if (!capa.value) return
      capa.value.definitionExpression = expresion ?? undefined
      featuresEnCapa.value = await capa.value.queryFeatureCount()
    },
  )

  watch(capaVisible, (visible) => {
    if (capa.value) capa.value.visible = visible
  })

  watch(
    () => store.seleccionado,
    (pozo) => {
      if (!pozo || !view.value) return
      view.value.goTo({ center: [pozo.lon, pozo.lat], zoom: 11 }, { duration: 700 })
    },
  )

  function irAExtensionCompleta() {
    view.value?.goTo({ center: CENTRO_ARGENTINA, zoom: ZOOM_INICIAL }, { duration: 700 })
  }

  return { view, capa, listo, actualizando, zoom, capaVisible, featuresEnCapa, irAExtensionCompleta }
}
