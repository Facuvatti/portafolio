import * as THREE from 'three'
import { Lote, caja, matriz } from './lote.js'
import { texturaLogo } from './materiales.js'

const ANCHO = 0.29
const ALTO = 0.46
const FONDO = 0.44
const LADO = 0.12
const VUELTA = Math.PI * 2

export const BOTON = new THREE.Vector3(0.09, ALTO + 0.018, 0.165)

function geometriaMarco(lado, radio, prof) {
  const s = lado / 2
  const c = lado * 0.08
  const forma = new THREE.Shape()
  forma.moveTo(-s + c, -s)
  forma.lineTo(s - c, -s)
  forma.quadraticCurveTo(s, -s, s, -s + c)
  forma.lineTo(s, s - c)
  forma.quadraticCurveTo(s, s, s - c, s)
  forma.lineTo(-s + c, s)
  forma.quadraticCurveTo(-s, s, -s, s - c)
  forma.lineTo(-s, -s + c)
  forma.quadraticCurveTo(-s, -s, -s + c, -s)
  const hueco = new THREE.Path()
  hueco.absarc(0, 0, radio, 0, VUELTA, true)
  forma.holes.push(hueco)
  const g = new THREE.ExtrudeGeometry(forma, { depth: prof, bevelEnabled: false, curveSegments: 40 })
  g.translate(0, 0, -prof / 2)
  return g
}

// Rotor de 9 aspas torcidas: una superficie por aspa más el cubo central.
function geometriaRotor(radio) {
  const posiciones = []
  const indices = []
  const aspas = 9
  const pasosR = 4
  const pasosA = 6
  for (let b = 0; b < aspas; b++) {
    const base = (b / aspas) * VUELTA
    const inicio = posiciones.length / 3
    for (let i = 0; i <= pasosR; i++) {
      const r = radio * (0.34 + (0.64 * i) / pasosR)
      const abanico = 0.42 + 0.3 * (i / pasosR)
      const giro = 0.7 * (i / pasosR)
      for (let j = 0; j <= pasosA; j++) {
        const a = j / pasosA - 0.5
        const theta = base + giro + a * abanico * 1.5
        posiciones.push(Math.cos(theta) * r, Math.sin(theta) * r, a * radio * 0.28)
      }
    }
    for (let i = 0; i < pasosR; i++) {
      for (let j = 0; j < pasosA; j++) {
        const p = inicio + i * (pasosA + 1) + j
        indices.push(p, p + pasosA + 1, p + 1, p + 1, p + pasosA + 1, p + pasosA + 2)
      }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3))
  g.setIndex(indices)
  g.computeVertexNormals()
  return g
}

function ventilador(lote, mats, rotores, m, { orden, desfase = 0 }) {
  const anillo = new THREE.TorusGeometry(0.0565, 0.0024, 8, 72)
  lote.solido(geometriaMarco(LADO, 0.0575, 0.022), mats.chasis, m)
  lote.led(anillo, m, {
    orden,
    brillo: 4.2,
    fase: (p, u) => u + desfase,
  })
  const adelante = new THREE.Matrix4().multiplyMatrices(m, matriz(0, 0, 0.011))
  lote.led(anillo, adelante, {
    orden,
    brillo: 2.2,
    fase: (p, u) => u + desfase + 0.1,
  })
  lote.solido(new THREE.CylinderGeometry(0.019, 0.019, 0.02, 32), mats.plastico, new THREE.Matrix4().multiplyMatrices(m, matriz(0, 0, 0, Math.PI / 2)))
  rotores.push(m.clone())
}

function placaDeVideo(lote, mats, rotores) {
  const x = 0.045
  const y = 0.205
  const z = -0.005
  const largo = 0.3
  const alto = 0.125
  const zonas = [-0.098, -0.002, 0.094]

  lote.solido(caja(0.05, alto, largo, 0.004), mats.chasis, matriz(x + 0.004, y, z))

  const forma = new THREE.Shape()
  forma.moveTo(-largo / 2 + 0.008, -alto / 2)
  forma.lineTo(largo / 2, -alto / 2)
  forma.lineTo(largo / 2, alto / 2 - 0.008)
  forma.lineTo(largo / 2 - 0.008, alto / 2)
  forma.lineTo(-largo / 2, alto / 2)
  forma.lineTo(-largo / 2, -alto / 2 + 0.008)
  forma.closePath()
  for (const zona of zonas) {
    const hueco = new THREE.Path()
    hueco.absarc(zona, 0, 0.0435, 0, VUELTA, true)
    forma.holes.push(hueco)
  }
  const tapa = new THREE.ExtrudeGeometry(forma, {
    depth: 0.008,
    bevelEnabled: true,
    bevelSize: 0.001,
    bevelThickness: 0.001,
    bevelSegments: 2,
    curveSegments: 40,
  })
  lote.solido(tapa, mats.metal, matriz(x - 0.027, y, z, 0, -Math.PI / 2, 0))

  const anillo = new THREE.TorusGeometry(0.0445, 0.0017, 8, 64)
  zonas.forEach((zona, i) => {
    const m = matriz(x - 0.0355, y, z + zona, 0, -Math.PI / 2, 0)
    lote.led(anillo, m, {
      orden: 0.3 + i * 0.03,
      brillo: 3.6,
      fase: (p, u) => u + i * 0.12,
    })
    rotores.push(new THREE.Matrix4().multiplyMatrices(matriz(x - 0.026, y, z + zona, 0, -Math.PI / 2, 0), matriz(0, 0, 0, 0, 0, 0, 0.8)))
    lote.solido(new THREE.CylinderGeometry(0.015, 0.015, 0.016, 28), mats.plastico, matriz(x - 0.026, y, z + zona, 0, 0, Math.PI / 2))
  })

  // Barra de luz sobre el canto y dos filetes de aluminio en la tapa.
  lote.led(caja(0.003, 0.004, largo - 0.02, 0.001), matriz(x - 0.028, y + alto / 2 + 0.003, z), {
    orden: 0.34,
    brillo: 5,
    fase: (p) => p.z * 3,
  })
  lote.solido(caja(0.002, 0.002, 0.08), mats.aluminio, matriz(x - 0.037, y - 0.055, z + 0.09))
  lote.solido(caja(0.002, 0.002, 0.08), mats.aluminio, matriz(x - 0.037, y + 0.055, z - 0.09))
}

function placaMadre(lote, mats) {
  const x = 0.13
  lote.solido(new THREE.PlaneGeometry(0.32, 0.33), mats.placa, matriz(x, 0.27, -0.045, 0, -Math.PI / 2, 0))

  // Disipadores de los VRM.
  lote.solido(caja(0.026, 0.036, 0.16, 0.003), mats.metal, matriz(x - 0.014, 0.405, -0.075))
  lote.solido(caja(0.026, 0.11, 0.032, 0.003), mats.metal, matriz(x - 0.014, 0.335, -0.19))
  lote.solido(caja(0.018, 0.09, 0.09, 0.003), mats.metal, matriz(x - 0.01, 0.13, 0.06))

  // Memorias con su barra de luz hacia el vidrio.
  for (let i = 0; i < 4; i++) {
    const z = 0.022 + i * 0.0105
    lote.solido(caja(0.04, 0.128, 0.0062, 0.0012), mats.metal, matriz(x - 0.022, 0.345, z))
    lote.led(caja(0.005, 0.124, 0.0052, 0.001), matriz(x - 0.0445, 0.345, z), {
      orden: 0.46 + i * 0.012,
      brillo: 4,
      fase: (p) => p.y * 2.4 + i * 0.05,
    })
  }

  // Bomba de la refrigeración líquida.
  const pz = -0.07
  const py = 0.325
  lote.solido(new THREE.CylinderGeometry(0.036, 0.04, 0.03, 48), mats.chasis, matriz(x - 0.02, py, pz, 0, 0, Math.PI / 2))
  lote.led(new THREE.TorusGeometry(0.0345, 0.0022, 8, 64), matriz(x - 0.0355, py, pz, 0, Math.PI / 2, 0), {
    orden: 0.55,
    brillo: 4.5,
    fase: (p, u) => u,
  })

  // Mangueras hasta el radiador.
  const manguera = (z0, z1) =>
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(x - 0.02, py + 0.03, pz + z0),
        new THREE.Vector3(x - 0.05, py + 0.055, pz + z0 + 0.01),
        new THREE.Vector3(x - 0.06, 0.4, pz + z1),
        new THREE.Vector3(x - 0.09, 0.415, pz + z1 + 0.03),
      ]),
      24,
      0.0052,
      10,
    )
  lote.solido(manguera(-0.012, -0.03), mats.goma)
  lote.solido(manguera(0.012, 0.0), mats.goma)

  // Cable principal de la placa: una trenza de hilos paralelos.
  for (let i = 0; i < 10; i++) {
    const dz = i * 0.0036
    const curva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x - 0.002, 0.3, 0.116 + dz * 0.2),
      new THREE.Vector3(x - 0.028, 0.285, 0.122 + dz * 0.5),
      new THREE.Vector3(x - 0.035 - dz * 0.2, 0.2, 0.143 + dz * 0.3),
      new THREE.Vector3(x - 0.02, 0.1, 0.15 + dz * 0.3),
      new THREE.Vector3(x + 0.012, 0.088, 0.15 + dz * 0.3),
    ])
    lote.solido(new THREE.TubeGeometry(curva, 18, 0.0016, 6), mats.cable)
  }
}

export function crearTorre(mats, led) {
  const grupo = new THREE.Group()
  const lote = new Lote()
  const rotores = []

  // Chasis: piso, techo, fondo y lateral. El frente y el lado izquierdo son vidrio.
  lote.solido(caja(ANCHO, 0.014, FONDO, 0.003), mats.chasis, matriz(0, 0.018, 0))
  lote.solido(caja(ANCHO, 0.016, FONDO, 0.004), mats.chasis, matriz(0, ALTO + 0.01, 0))
  lote.solido(caja(0.008, ALTO, FONDO, 0.002), mats.chasis, matriz(ANCHO / 2 - 0.004, ALTO / 2 + 0.012, 0))
  lote.solido(caja(ANCHO, ALTO, 0.008, 0.002), mats.chasis, matriz(0, ALTO / 2 + 0.012, -FONDO / 2 + 0.004))
  lote.solido(caja(0.006, ALTO, 0.006, 0.002), mats.metal, matriz(-ANCHO / 2 + 0.003, ALTO / 2 + 0.012, FONDO / 2 - 0.003))
  for (const [px, pz] of [[-0.12, -0.18], [0.12, -0.18], [-0.12, 0.18], [0.12, 0.18]]) {
    lote.solido(new THREE.CylinderGeometry(0.012, 0.014, 0.012, 16), mats.goma, matriz(px, 0.006, pz))
  }

  // Ventilación del techo.
  for (let i = 0; i < 26; i++) {
    lote.solido(caja(0.18, 0.001, 0.005, 0.0004), mats.goma, matriz(-0.03, ALTO + 0.0185, -0.19 + i * 0.0128))
  }

  // Botón de encendido y puertos.
  lote.solido(new THREE.CylinderGeometry(0.0085, 0.0085, 0.004, 32), mats.aluminio, matriz(BOTON.x, ALTO + 0.019, BOTON.z))
  for (let i = 0; i < 2; i++) {
    lote.solido(caja(0.014, 0.002, 0.006, 0.0005), mats.goma, matriz(BOTON.x, ALTO + 0.0185, BOTON.z - 0.03 - i * 0.012))
  }

  placaMadre(lote, mats)
  placaDeVideo(lote, mats, rotores)

  // Ventiladores: tres abajo que empujan aire, tres arriba contra el radiador, uno atrás.
  ;[-0.13, -0.008, 0.114].forEach((z, i) => {
    ventilador(lote, mats, rotores, matriz(-0.03, 0.05, z, -Math.PI / 2), { orden: 0.02 + i * 0.05, desfase: i * 0.1 })
    ventilador(lote, mats, rotores, matriz(-0.03, 0.41, z, Math.PI / 2), { orden: 0.66 + i * 0.04, desfase: 0.3 + i * 0.1 })
  })
  ventilador(lote, mats, rotores, matriz(0.03, 0.31, -FONDO / 2 + 0.022), { orden: 0.6, desfase: 0.5 })

  lote.solido(caja(0.125, 0.028, 0.37, 0.002), mats.radiador, matriz(-0.03, 0.44, -0.012))

  // Tiras a lo largo de las aristas interiores.
  lote.led(caja(ANCHO - 0.03, 0.0025, 0.0025, 0.001), matriz(0, 0.032, FONDO / 2 - 0.012), {
    orden: 0.14,
    brillo: 5,
    fase: (p) => p.x * 2,
  })
  lote.led(caja(0.0025, ALTO - 0.05, 0.0025, 0.001), matriz(ANCHO / 2 - 0.012, ALTO / 2 + 0.01, FONDO / 2 - 0.012), {
    orden: 0.25,
    brillo: 5,
    fase: (p) => p.y * 2,
  })

  lote.construir(grupo, led)

  const logo = new THREE.Mesh(
    new THREE.CircleGeometry(0.031, 48),
    new THREE.MeshBasicMaterial({ map: texturaLogo('#050514') }),
  )
  logo.position.set(0.0945, 0.325, -0.07)
  logo.rotation.y = -Math.PI / 2
  grupo.add(logo)

  // Vidrios por separado: son transparentes y se dibujan al final.
  const vidrioFrente = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, ALTO), mats.vidrio)
  vidrioFrente.position.set(0, ALTO / 2 + 0.012, FONDO / 2)
  vidrioFrente.renderOrder = 5
  const vidrioLado = new THREE.Mesh(new THREE.PlaneGeometry(FONDO, ALTO), mats.vidrio)
  vidrioLado.position.set(-ANCHO / 2, ALTO / 2 + 0.012, 0)
  vidrioLado.rotation.y = -Math.PI / 2
  vidrioLado.renderOrder = 5
  grupo.add(vidrioFrente, vidrioLado)

  const aspas = new THREE.InstancedMesh(geometriaRotor(0.054), mats.aspa, rotores.length)
  aspas.frustumCulled = false
  grupo.add(aspas)
  const giro = new THREE.Matrix4()
  const instancia = new THREE.Matrix4()
  const girar = (angulo) => {
    rotores.forEach((base, i) => {
      giro.makeRotationZ(angulo * (i % 2 ? 1 : 1.07) + i * 0.7)
      aspas.setMatrixAt(i, instancia.multiplyMatrices(base, giro))
    })
    aspas.instanceMatrix.needsUpdate = true
  }
  girar(0)

  const anilloBoton = new THREE.Mesh(
    new THREE.TorusGeometry(0.0095, 0.0011, 8, 40),
    new THREE.MeshBasicMaterial({ color: '#000000' }),
  )
  anilloBoton.position.set(BOTON.x, ALTO + 0.0212, BOTON.z)
  anilloBoton.rotation.x = Math.PI / 2
  grupo.add(anilloBoton)

  // Lo único prendido antes de arrancar: el LED de reposo alumbra el techo del gabinete.
  const luzBoton = new THREE.PointLight('#ffb36b', 0, 0.5, 2)
  luzBoton.position.set(BOTON.x - 0.03, ALTO + 0.075, BOTON.z + 0.02)
  grupo.add(luzBoton)

  const luces = [
    { posicion: [-0.03, 0.12, 0.06], orden: 0.1 },
    { posicion: [-0.04, 0.25, 0], orden: 0.32 },
    { posicion: [-0.02, 0.37, -0.02], orden: 0.6 },
  ].map(({ posicion, orden }, i) => {
    const luz = new THREE.PointLight('#000000', 0, 1.6, 1.8)
    luz.position.set(...posicion)
    grupo.add(luz)
    return { luz, orden, fase: i * 0.18, intensidad: 0.1 }
  })

  return { grupo, girar, anilloBoton, luzBoton, luces }
}
