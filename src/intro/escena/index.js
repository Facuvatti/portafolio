import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { crearLed, crearMateriales, uniformes, AZUL_PAGINA } from './materiales.js'
import { crearTorre, BOTON } from './torre.js'
import { ALTURA_MESA, crearEscritorio, crearMonitor } from './escritorio.js'
import { DURACION, MARCAS, acotar, anguloVentilador, crearCurva, despertar, homografia, suave } from './linea.js'

const FOV = 30
const X_MONITOR = -0.2
const X_TORRE = 0.6
const Z_MONITOR = -0.12
const GIRO_TORRE = 0.38
const AREA_PANEL = 0.29
const ALTURA_PANEL = ALTURA_MESA + 0.34

// El panel adopta la proporción de la ventana dentro de lo que existe como monitor.
// Si la ventana es más angosta, la página queda inscripta en el panel: la cámara se
// detiene con todo el encuadre adentro de la pantalla y nunca llega a ver el marco.
function medirPantalla(proporcion) {
  const a = acotar(proporcion, 1.6, 2.34)
  const alto = Math.sqrt(AREA_PANEL / a)
  const ancho = alto * a
  const paginaAlto = proporcion >= a ? ancho / proporcion : alto
  return { ancho, alto, paginaAncho: paginaAlto * proporcion, paginaAlto }
}

function medirBarra() {
  const sonda = document.createElement('div')
  sonda.style.cssText = 'position:absolute;top:-999px;width:100px;height:100px;overflow:scroll'
  document.body.append(sonda)
  const barra = sonda.offsetWidth - sonda.clientWidth
  sonda.remove()
  return barra
}

function crearClaves(torre, pantalla, proporcion) {
  const distancia = pantalla.paginaAlto / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2))
  const local = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(torre.matrixWorld)
  const boton = local(BOTON.x, BOTON.y, BOTON.z)
  const centro = new THREE.Vector3(X_MONITOR, ALTURA_PANEL, Z_MONITOR)
  // En vertical el encuadre es angosto: los planos generales se alejan para entrar.
  const lejos = Math.max(1, 1.35 / proporcion)
  const general = (x, y, z, mira) => new THREE.Vector3(x, y, z).sub(mira).multiplyScalar(lejos).add(mira)

  const miraGeneral = new THREE.Vector3(X_MONITOR + 0.32, ALTURA_MESA + 0.26, Z_MONITOR)
  const miraMonitor = centro.clone().setY(ALTURA_PANEL - 0.03)

  return {
    posicion: [
      { t: 0, p: local(-0.02, 0.6, 0.27) },
      { t: 1.2, p: local(0.01, 0.56, 0.25) },
      { t: 2.5, p: local(-0.5, 0.52, 0.42) },
      { t: 3.8, p: local(-0.62, 0.3, 0.2) },
      { t: 5, p: general(0.5, 1.2, 1.15, miraGeneral) },
      { t: 6.3, p: general(0.05, 1.2, 1.5, miraGeneral) },
      { t: 7.6, p: general(X_MONITOR, ALTURA_PANEL + 0.03, 1.05, miraMonitor) },
      { t: 8.7, p: centro.clone().setZ(Z_MONITOR + distancia + 0.035) },
      { t: DURACION, p: centro.clone().setZ(Z_MONITOR + distancia) },
    ],
    mira: [
      { t: 0, p: boton },
      { t: 1.2, p: boton },
      { t: 2.5, p: local(0.05, 0.27, 0) },
      { t: 3.8, p: local(0.05, 0.22, 0) },
      { t: 5, p: miraGeneral.clone().setX(X_MONITOR + 0.6) },
      { t: 6.3, p: miraGeneral },
      { t: 7.6, p: miraMonitor },
      { t: 8.7, p: centro },
      { t: DURACION, p: centro },
    ],
  }
}

export function crearEscena({ lienzo, pagina, panel, alTerminar }) {
  const ancho = window.innerWidth
  const alto = window.innerHeight
  // Al terminar aparece la barra de scroll: la página ya se proyecta con el ancho que
  // va a tener, y el panel cubre esa franja para que el último cuadro no se mueva.
  const anchoPagina = ancho - medirBarra()
  const proporcion = ancho / alto
  const movil = Math.min(ancho, alto) < 600

  const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: false, powerPreference: 'high-performance' })
  let resolucion = Math.min(window.devicePixelRatio, movil ? 1.25 : 1.75)
  renderer.setPixelRatio(resolucion)
  renderer.setSize(ancho, alto, false)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  renderer.shadowMap.enabled = !movil
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.setClearColor('#000000')

  const escena = new THREE.Scene()
  const camara = new THREE.PerspectiveCamera(FOV, proporcion, 0.02, 30)

  const generador = new THREE.PMREMGenerator(renderer)
  const entorno = new RoomEnvironment()
  const reflejos = generador.fromScene(entorno, 0.04).texture
  entorno.dispose?.()
  escena.environment = reflejos
  escena.environmentIntensity = 0

  const mats = crearMateriales()
  const led = crearLed()

  const medida = medirPantalla(proporcion)
  const torre = crearTorre(mats, led)
  torre.grupo.position.set(X_TORRE, ALTURA_MESA, -0.02)
  torre.grupo.rotation.y = GIRO_TORRE
  torre.grupo.updateMatrixWorld(true)
  escena.add(torre.grupo)

  escena.add(crearEscritorio(mats, led, { xMonitor: X_MONITOR, xTorre: X_TORRE }))

  const monitor = crearMonitor(mats, led, medida)
  monitor.grupo.position.set(X_MONITOR, ALTURA_PANEL, Z_MONITOR)
  monitor.grupo.updateMatrixWorld(true)
  escena.add(monitor.grupo)

  // Luz de ambiente del cuarto: tenue, recorta los volúmenes y da sombras de contacto.
  const cenital = new THREE.SpotLight('#b9c4ff', 0, 5, 0.7, 0.8, 1.2)
  cenital.position.set(0.1, 2.5, 1)
  cenital.target.position.set(0.1, 0.8, -0.1)
  cenital.castShadow = !movil
  cenital.shadow.mapSize.set(1024, 1024)
  cenital.shadow.bias = -0.0004
  escena.add(cenital, cenital.target)

  const lucesPared = [-0.7, 0, 0.75].map((x, i) => {
    const luz = new THREE.PointLight('#000000', 0, 1.8, 1.7)
    // Debajo del plano de la mesa: bañan la pared sin dejar manchas sobre la madera.
    luz.position.set(x, ALTURA_MESA - 0.03, -0.4)
    escena.add(luz)
    return { luz, orden: 0.72, fase: 0.5 + x * 0.45, intensidad: 0.5 }
  })
  const lucesRgb = [...torre.luces, ...lucesPared]

  const claves = crearClaves(torre.grupo, medida, proporcion)
  const curvaPosicion = crearCurva(claves.posicion)
  const curvaMira = crearCurva(claves.mira)

  const objetivo = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: movil ? 0 : 4 })
  const composer = new EffectComposer(renderer, objetivo)
  composer.setPixelRatio(resolucion)
  composer.setSize(ancho, alto)
  composer.addPass(new RenderPass(escena, camara))
  const brillo = new UnrealBloomPass(new THREE.Vector2(ancho / 2, alto / 2), 0.26, 0.6, 1)
  composer.addPass(brillo)
  composer.addPass(new OutputPass())

  let usarComposer = true
  if (renderer.shadowMap.enabled) renderer.shadowMap.needsUpdate = true

  // Esquinas en mundo, en sentido horario desde arriba a la izquierda.
  const esquinas = (w, h, recorte = 1) =>
    [
      [-w / 2, h / 2],
      [w * (recorte - 0.5), h / 2],
      [w * (recorte - 0.5), -h / 2],
      [-w / 2, -h / 2],
    ].map(([x, y]) => new THREE.Vector3(X_MONITOR + x, ALTURA_PANEL + y, Z_MONITOR))
  const esquinasPagina = esquinas(medida.paginaAncho, medida.paginaAlto, anchoPagina / ancho)
  const esquinasPanel = esquinas(medida.ancho, medida.alto)
  const auxiliar = new THREE.Vector3()
  const aPantalla = (p) => {
    auxiliar.copy(p).project(camara)
    return { x: ((auxiliar.x + 1) / 2) * ancho, y: ((1 - auxiliar.y) / 2) * alto }
  }

  const azul = new THREE.Color(AZUL_PAGINA)
  const color = new THREE.Color()
  const fondoCamara = new THREE.Vector3()
  const miraCamara = new THREE.Vector3()
  let avisado = false

  function actualizar(t) {
    uniformes.uTiempo.value = t
    uniformes.uDespertar.value = despertar(t)

    const encendida = suave(MARCAS.pulsar, MARCAS.pulsar + 0.12, t)
    const reposo = (1 - encendida) * (0.55 + 0.45 * Math.sin(t * 4.5))
    torre.anilloBoton.material.color.setRGB(reposo * 2.4 + encendida * 6, reposo * 1.1 + encendida * 6, reposo * 0.3 + encendida * 7)
    torre.luzBoton.intensity = 0.02 + reposo * 0.05 + encendida * 0.03
    torre.girar(anguloVentilador(t))

    const w = uniformes.uDespertar.value
    for (const { luz, orden, fase, intensidad } of lucesRgb) {
      const prendida = suave(orden, orden + 0.1, w)
      color.setHSL(((fase - t * 0.16) % 1 + 1) % 1, 1, 0.5)
      luz.color.copy(color)
      luz.intensity = prendida * intensidad
    }
    escena.environmentIntensity = 0.015 + 0.13 * suave(0, 1, w)
    cenital.intensity = 0.7 + 7 * suave(0.5, 1.1, w)

    const prendePantalla = suave(MARCAS.pantalla, MARCAS.pantalla + 0.3, t)
    const azulPantalla = suave(MARCAS.azul - 0.2, MARCAS.azul, t)
    monitor.pantalla.material.color.copy(azul).multiplyScalar(prendePantalla)
    monitor.logo.material.opacity = prendePantalla * (1 - suave(MARCAS.pagina - 0.2, MARCAS.pagina, t))
    monitor.luz.intensity = 5 * prendePantalla + 3 * azulPantalla

    curvaPosicion(t, fondoCamara)
    curvaMira(t, miraCamara)
    camara.position.copy(fondoCamara)
    camara.up.set(0, 1, 0)
    camara.lookAt(miraCamara)
    camara.updateMatrixWorld(true)

    const visible = suave(MARCAS.pagina - 0.3, MARCAS.pagina, t)
    if (visible > 0) {
      pagina.style.opacity = visible
      panel.style.opacity = visible
      pagina.style.transform = homografia(anchoPagina, alto, esquinasPagina.map(aPantalla))
      panel.style.transform = homografia(ancho, alto, esquinasPanel.map(aPantalla))
      const cristal = 1 - suave(7.6, DURACION - 0.25, t)
      pagina.style.setProperty('--cristal', cristal)
      panel.style.setProperty('--cristal', cristal)
    }
    if (!avisado && t >= MARCAS.pagina - 0.1) {
      avisado = true
      window.dispatchEvent(new Event('pantalla-encendida'))
    }
  }

  function dibujar() {
    if (usarComposer) composer.render()
    else renderer.render(escena, camara)
  }

  // Si el equipo no llega, baja resolución, saca el bloom y, como último recurso, corta
  // el encendido: nadie tiene que esperar un minuto para ver la página.
  let lentos = 0
  function vigilar(dt) {
    // Un cuadro de más de 100 ms pesa como varios: en un equipo muy lento no hay que esperar.
    lentos = dt > 0.1 ? lentos + 8 : dt > 0.038 ? lentos + 1 : Math.max(0, lentos - 1)
    if (lentos < 24) return
    lentos = 0
    if (resolucion > 1) {
      resolucion = 1
      renderer.setPixelRatio(1)
      composer.setPixelRatio(1)
    } else if (usarComposer) {
      usarComposer = false
    } else if (!paciente) {
      alTerminar()
    }
  }

  const parametros = new URLSearchParams(location.search)
  const congelado = import.meta.env.DEV ? parametros.get('cuadro') : null
  const paciente = import.meta.env.DEV && parametros.has('paciente')
  let tiempo = 0
  let previo = 0
  let peticion = 0
  let activa = true

  function bucle(ahora) {
    if (!activa) return
    const dt = previo ? Math.min((ahora - previo) / 1000, 0.25) : 0
    previo = ahora
    tiempo = congelado !== null ? Number(congelado) : tiempo + dt
    if (congelado === null && tiempo >= DURACION) {
      actualizar(DURACION)
      alTerminar()
      return
    }
    actualizar(tiempo)
    dibujar()
    vigilar(dt)
    peticion = requestAnimationFrame(bucle)
  }

  // La geometría se calculó para esta ventana: si cambia, se pasa directo a la página.
  const alCambiarTamano = () => {
    if (window.innerWidth !== ancho || Math.abs(window.innerHeight - alto) > 80) alTerminar()
  }
  window.addEventListener('resize', alCambiarTamano)

  pagina.style.width = `${anchoPagina}px`
  // Sin barra de scroll 1vw mide de más: el diseño se calcula con el ancho definitivo.
  pagina.style.setProperty('--vw', `${anchoPagina / 100}px`)
  actualizar(0)
  peticion = requestAnimationFrame(bucle)

  return {
    destruir() {
      activa = false
      cancelAnimationFrame(peticion)
      window.removeEventListener('resize', alCambiarTamano)
      escena.traverse((o) => {
        o.geometry?.dispose()
        o.material?.map?.dispose()
        o.material?.dispose?.()
      })
      reflejos.dispose()
      generador.dispose()
      objetivo.dispose()
      composer.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}
