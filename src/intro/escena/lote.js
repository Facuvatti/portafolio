import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

const punto = new THREE.Vector3()

export function matriz(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, escala = 1) {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(escala, escala, escala),
  )
}

export function caja(ancho, alto, fondo, radio = 0.0015) {
  const r = Math.min(radio, ancho / 2.01, alto / 2.01, fondo / 2.01)
  return new RoundedBoxGeometry(ancho, alto, fondo, 2, r)
}

function normalizar(geometria, nombres) {
  const g = geometria.index ? geometria.toNonIndexed() : geometria.clone()
  for (const nombre of Object.keys(g.attributes)) {
    if (!nombres.includes(nombre)) g.deleteAttribute(nombre)
  }
  g.morphAttributes = {}
  return g
}

// Junta geometrías por material en una sola malla: una PC completa queda en pocas
// llamadas de dibujo y todos los LED comparten el mismo shader.
export class Lote {
  solidos = new Map()
  leds = []

  solido(geometria, material, m) {
    const g = normalizar(geometria, ['position', 'normal', 'uv'])
    if (!g.attributes.uv) {
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
    }
    if (m) g.applyMatrix4(m)
    if (!this.solidos.has(material)) this.solidos.set(material, [])
    this.solidos.get(material).push(g)
  }

  // fase ubica cada vértice sobre la tira: un número, o una función del punto local y de
  // la coordenada u, que en un toro da la vuelta sin costura.
  // orden indica cuándo despierta durante el encendido (0 a 1).
  led(geometria, m, { fase = 0, orden = 0, brillo = 1 } = {}) {
    const g = normalizar(geometria, ['position', 'uv'])
    const posiciones = g.attributes.position
    const uv = g.attributes.uv
    const n = posiciones.count
    const fases = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      fases[i] = typeof fase === 'function' ? fase(punto.fromBufferAttribute(posiciones, i), uv?.getX(i)) : fase
    }
    if (uv) g.deleteAttribute('uv')
    g.setAttribute('aFase', new THREE.BufferAttribute(fases, 1))
    g.setAttribute('aOrden', new THREE.BufferAttribute(new Float32Array(n).fill(orden), 1))
    g.setAttribute('aBrillo', new THREE.BufferAttribute(new Float32Array(n).fill(brillo), 1))
    if (m) g.applyMatrix4(m)
    this.leds.push(g)
  }

  construir(grupo, materialLed) {
    for (const [material, geometrias] of this.solidos) {
      const malla = new THREE.Mesh(mergeGeometries(geometrias), material)
      malla.castShadow = true
      malla.receiveShadow = true
      grupo.add(malla)
    }
    if (this.leds.length) grupo.add(new THREE.Mesh(mergeGeometries(this.leds), materialLed))
    for (const g of [...this.solidos.values()].flat().concat(this.leds)) g.dispose()
  }
}
