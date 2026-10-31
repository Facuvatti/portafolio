import * as THREE from 'three'

// Todo el encendido es función pura del tiempo: el mismo t siempre da el mismo cuadro.
export const DURACION = 9.4
export const MARCAS = {
  pulsar: 1.0,
  arranque: 1.25,
  pantalla: 5.0,
  azul: 5.7,
  pagina: 6.1,
}

const VELOCIDAD_VENTILADOR = 16
const RAMPA_VENTILADOR = 2.2

export const acotar = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
export const suave = (a, b, x) => {
  const u = acotar((x - a) / (b - a))
  return u * u * (3 - 2 * u)
}

export const despertar = (t) => acotar((t - MARCAS.arranque) / 3.5, 0, 1.2)

// Ángulo acumulado de un ventilador que acelera desde cero.
export function anguloVentilador(t) {
  const x = Math.max(t - MARCAS.arranque, 0)
  if (x < RAMPA_VENTILADOR) return (VELOCIDAD_VENTILADOR * x * x) / (2 * RAMPA_VENTILADOR)
  return VELOCIDAD_VENTILADOR * (RAMPA_VENTILADOR / 2 + x - RAMPA_VENTILADOR)
}

// Hermite cúbica con tangentes de Catmull-Rom en el tiempo: la velocidad de la cámara
// es continua aunque las claves no estén equiespaciadas, y termina en cero.
export function crearCurva(claves) {
  const n = claves.length
  const tangentes = claves.map((c, i) => {
    if (i === 0 || i === n - 1) return new THREE.Vector3()
    const a = claves[i - 1]
    const b = claves[i + 1]
    return b.p.clone().sub(a.p).divideScalar(b.t - a.t)
  })

  return (t, salida) => {
    if (t <= claves[0].t) return salida.copy(claves[0].p)
    if (t >= claves[n - 1].t) return salida.copy(claves[n - 1].p)
    let i = 0
    while (t > claves[i + 1].t) i++
    const a = claves[i]
    const b = claves[i + 1]
    const h = b.t - a.t
    const u = (t - a.t) / h
    const u2 = u * u
    const u3 = u2 * u
    salida.set(0, 0, 0)
    salida.addScaledVector(a.p, 2 * u3 - 3 * u2 + 1)
    salida.addScaledVector(tangentes[i], (u3 - 2 * u2 + u) * h)
    salida.addScaledVector(b.p, -2 * u3 + 3 * u2)
    salida.addScaledVector(tangentes[i + 1], (u3 - u2) * h)
    return salida
  }
}

// Matriz CSS que lleva un rectángulo de ancho×alto a un cuadrilátero en pantalla.
// Un plano visto en perspectiva es exactamente una homografía, así que el DOM coincide
// con la pantalla 3D sin depender del FOV ni de CSS3DRenderer.
export function homografia(ancho, alto, q) {
  const [p0, p1, p2, p3] = q
  const dx1 = p1.x - p2.x
  const dx2 = p3.x - p2.x
  const dx3 = p0.x - p1.x + p2.x - p3.x
  const dy1 = p1.y - p2.y
  const dy2 = p3.y - p2.y
  const dy3 = p0.y - p1.y + p2.y - p3.y
  const det = dx1 * dy2 - dx2 * dy1
  const g = (dx3 * dy2 - dx2 * dy3) / det
  const h = (dx1 * dy3 - dx3 * dy1) / det
  const a = p1.x - p0.x + g * p1.x
  const b = p3.x - p0.x + h * p3.x
  const d = p1.y - p0.y + g * p1.y
  const e = p3.y - p0.y + h * p3.y
  const m = [a / ancho, d / ancho, 0, g / ancho, b / alto, e / alto, 0, h / alto, 0, 0, 1, 0, p0.x, p0.y, 0, 1]
  return `matrix3d(${m.map((v) => v.toFixed(10)).join(',')})`
}
