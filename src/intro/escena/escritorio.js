import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { Lote, caja, matriz } from './lote.js'
import { crearHalo, texturaLogo } from './materiales.js'

export const ALTURA_MESA = 0.74
export const FONDO_PARED = -0.46

const U = 0.0189

// Fila, y por cada tecla su ancho en unidades. Un cero es un hueco de una unidad.
const TECLADO = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1, 1],
  [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1, 1],
]

function crearTeclado(mats, led) {
  const grupo = new THREE.Group()
  const lote = new Lote()
  const anchoTotal = 16 * U
  const fondoTotal = 6 * U

  lote.solido(caja(anchoTotal + 0.02, 0.016, fondoTotal + 0.02, 0.005), mats.metal, matriz(0, 0.008, 0))
  // Placa luminosa debajo de las teclas: se ve por las rendijas.
  lote.led(new THREE.PlaneGeometry(anchoTotal, fondoTotal), matriz(0, 0.0164, 0, -Math.PI / 2), {
    orden: 0.82,
    brillo: 2.2,
    fase: (p) => p.x * 2.6,
  })

  const unidad = new THREE.Matrix4()
  const teclas = []
  TECLADO.forEach((fila, f) => {
    let x = -anchoTotal / 2
    fila.forEach((ancho) => {
      const w = ancho * U
      const cx = x + w / 2
      const cz = -fondoTotal / 2 + (f + 0.5) * U
      teclas.push({ cx, cz, w })
      lote.led(new THREE.PlaneGeometry(0.0034, 0.0034), matriz(cx - w * 0.2, 0.0254, cz - 0.003, -Math.PI / 2), {
        orden: 0.82 + (cx / anchoTotal + 0.5) * 0.1,
        brillo: 3,
        fase: cx * 2.6,
      })
      x += w
    })
  })

  const base = caja(1, 0.0085, 0.0168, 0.0016)
  base.scale(U * 0.92, 1, 1)
  const cuerpo = new THREE.InstancedMesh(base, mats.tecla, teclas.length)
  teclas.forEach(({ cx, cz, w }, i) => {
    unidad.makeScale(w / U - (w > U ? 0.09 : 0), 1, 1).setPosition(cx, 0.0205, cz)
    cuerpo.setMatrixAt(i, unidad)
  })
  grupo.add(cuerpo)

  lote.construir(grupo, led)
  return grupo
}

function crearMouse(mats, led) {
  const grupo = new THREE.Group()
  const lote = new Lote()
  const forma = new THREE.SphereGeometry(1, 32, 20)
  forma.scale(0.031, 0.019, 0.058)
  lote.solido(forma, mats.tecla, matriz(0, 0.015, 0))
  lote.led(new THREE.TorusGeometry(1, 0.035, 8, 64).scale(0.0312, 0.0582, 0.035), matriz(0, 0.004, 0, Math.PI / 2), {
    orden: 0.93,
    brillo: 3.4,
    fase: (p, u) => u,
  })
  lote.led(caja(0.003, 0.002, 0.018, 0.0008), matriz(0, 0.0335, -0.022), { orden: 0.93, brillo: 3, fase: 0.2 })
  lote.construir(grupo, led)
  return grupo
}

function sombraSuave() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const r = g.createRadialGradient(64, 64, 10, 64, 64, 64)
  r.addColorStop(0, 'rgba(0,0,0,0.85)')
  r.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

export function crearEscritorio(mats, led, { xMonitor, xTorre }) {
  const grupo = new THREE.Group()
  const lote = new Lote()
  const y = ALTURA_MESA
  const largo = 2.1
  const profundidad = 0.86
  const zMesa = FONDO_PARED + profundidad / 2 + 0.02

  // Piso y pared de listones verticales.
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), mats.piso)
  piso.rotation.x = -Math.PI / 2
  grupo.add(piso)
  const pared = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), mats.pared)
  pared.position.set(0, 2.5, FONDO_PARED - 0.03)
  grupo.add(pared)

  const cantidad = 150
  const liston = new THREE.InstancedMesh(new THREE.BoxGeometry(0.024, 3.2, 0.028), mats.listones, cantidad)
  const m = new THREE.Matrix4()
  for (let i = 0; i < cantidad; i++) {
    m.makeTranslation((i - cantidad / 2) * 0.042, 1.6, FONDO_PARED - 0.014)
    liston.setMatrixAt(i, m)
  }
  liston.receiveShadow = true
  grupo.add(liston)

  // Mesa, con listón de luz escondido en el canto trasero.
  lote.solido(caja(largo, 0.036, profundidad, 0.006), mats.mesa, matriz(0, y - 0.018, zMesa))
  for (const lado of [-1, 1]) {
    lote.solido(caja(0.05, y - 0.036, 0.62, 0.004), mats.chasis, matriz(lado * (largo / 2 - 0.08), (y - 0.036) / 2, zMesa))
  }
  lote.solido(caja(0.5, 0.003, 0.3, 0.0015), mats.alfombra, matriz(xMonitor + 0.09, y + 0.0015, 0.2))

  // Tiras detrás de la mesa, sobre la pared.
  lote.led(caja(largo - 0.1, 0.006, 0.006, 0.002), matriz(0, y + 0.012, FONDO_PARED + 0.012), {
    orden: 0.72,
    brillo: 4.5,
    fase: (p) => p.x * 0.45,
  })
  lote.construir(grupo, led)

  const textura = sombraSuave()
  const sombra = (x, z, ancho, fondo, opacidad = 0.8) => {
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(ancho, fondo),
      new THREE.MeshBasicMaterial({ map: textura, transparent: true, opacity: opacidad, depthWrite: false, color: '#000000' }),
    )
    s.rotation.x = -Math.PI / 2
    s.position.set(x, y + 0.0035, z)
    grupo.add(s)
  }
  sombra(xTorre, -0.02, 0.62, 0.72)
  sombra(xMonitor, -0.1, 0.5, 0.34)

  const haloMesa = new THREE.Mesh(new THREE.PlaneGeometry(largo + 0.9, 1.2), crearHalo({ orden: 0.74, fuerza: 0.1, escalaFase: 0.8 }))
  haloMesa.position.set(0, y + 0.3, FONDO_PARED + 0.002)
  haloMesa.renderOrder = 3
  grupo.add(haloMesa)

  const teclado = crearTeclado(mats, led)
  teclado.position.set(xMonitor + 0.02, y + 0.003, 0.2)
  teclado.rotation.y = 0.015
  grupo.add(teclado)

  const mouse = crearMouse(mats, led)
  mouse.position.set(xMonitor + 0.28, y + 0.003, 0.21)
  mouse.rotation.y = -0.12
  grupo.add(mouse)

  return grupo
}

export function crearMonitor(mats, led, { ancho, alto }) {
  const grupo = new THREE.Group()
  const lote = new Lote()
  const prof = 0.016

  // Cuerpo con marco fino; la pantalla apoya en z = 0.
  lote.solido(caja(ancho + 0.012, alto + 0.012, prof, 0.004), mats.chasis, matriz(0, 0, -prof / 2 - 0.0002))
  lote.solido(caja(ancho * 0.6, alto * 0.6, 0.03, 0.012), mats.plastico, matriz(0, -0.01, -prof - 0.012))
  lote.led(
    new THREE.TorusGeometry(0.11, 0.0035, 8, 72),
    matriz(0, -0.005, -prof - 0.028),
    { orden: 0.78, brillo: 4, fase: (p, u) => u },
  )

  // Pie de aluminio.
  const base = alto / 2 + 0.11
  lote.solido(caja(0.05, 0.3, 0.018, 0.005), mats.aluminio, matriz(0, -alto / 2 - 0.0, -0.058))
  for (const lado of [-1, 1]) {
    lote.solido(caja(0.24, 0.006, 0.03, 0.002), mats.aluminio, matriz(lado * 0.1, -base - 0.003, -0.02, 0, lado * 0.42, 0))
  }

  lote.construir(grupo, led)

  const pantalla = new THREE.Mesh(
    new THREE.PlaneGeometry(ancho, alto),
    new THREE.MeshBasicMaterial({ color: '#000000', toneMapped: false }),
  )
  grupo.add(pantalla)

  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(alto * 0.4, alto * 0.4),
    new THREE.MeshBasicMaterial({ map: texturaLogo(), transparent: true, opacity: 0, toneMapped: false }),
  )
  logo.position.z = 0.0005
  grupo.add(logo)

  const halo = new THREE.Mesh(new THREE.PlaneGeometry(ancho * 2.1, alto * 2.5), crearHalo({ orden: 0.8, fuerza: 0.14, escalaFase: 0.45 }))
  halo.position.set(0, 0, -0.2)
  halo.renderOrder = 3
  grupo.add(halo)

  // Luz de la pantalla sobre el teclado y la mesa.
  RectAreaLightUniformsLib.init()
  const luz = new THREE.RectAreaLight('#3a44ff', 0, ancho, alto)
  luz.position.z = 0.01
  luz.lookAt(0, -0.4, 1)
  grupo.add(luz)

  return { grupo, pantalla, logo, luz }
}
