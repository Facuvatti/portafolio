import { useEffect, useRef, useState } from 'react'

const VERTICES = `#version 300 es
void main() {
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}`

// Una tela que se pliega sola, iluminada desde el puntero: al mover el mouse no se mueve
// la imagen, se mueve la luz sobre los pliegues.
const FRAGMENTOS = `#version 300 es
precision highp float;
uniform vec2 uTamano;
uniform vec2 uPuntero;
uniform float uTiempo;
uniform float uFuerza;
uniform float uEntrada;
out vec4 color;

const vec3 FONDO = vec3(0.039, 0.035, 0.125);
const vec3 INDIGO = vec3(0.17, 0.14, 0.78);
const vec3 CLARO = vec3(0.66, 0.68, 1.0);

vec2 flecha(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

float ruido(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(dot(flecha(i), f), dot(flecha(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(flecha(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(flecha(i + vec2(1.0)), f - vec2(1.0)), u.x),
    u.y
  );
}

float altura(vec2 p, float t) {
  vec2 pliegue = vec2(ruido(p * 0.9 + vec2(t, 0.0)), ruido(p * 0.9 + vec2(4.1, 2.3) - t));
  vec2 q = p + pliegue * 1.5;
  return ruido(q * 1.1) + 0.42 * ruido(q * 2.3 + 7.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uTamano;
  float aspecto = uTamano.x / uTamano.y;
  vec2 p = vec2(uv.x * aspecto, uv.y);
  vec2 luz = vec2(uPuntero.x * aspecto, uPuntero.y);
  float t = uTiempo * 0.035;

  float h = altura(p, t);
  const float e = 0.006;
  vec3 normal = normalize(vec3(altura(p + vec2(e, 0.0), t) - h, altura(p + vec2(0.0, e), t) - h, e * 1.5));
  vec3 haciaLuz = normalize(vec3(luz - p, 0.42));
  float difusa = pow(max(dot(normal, haciaLuz), 0.0), 2.0);
  float brillo = pow(max(dot(normal, normalize(haciaLuz + vec3(0.0, 0.0, 1.0))), 0.0), 26.0);
  float cerca = exp(-dot(luz - p, luz - p) * mix(1.1, 2.4, uFuerza));

  // Más presente a la derecha y arriba, para no competir con el texto.
  float lugar = mix(0.34, 1.0, smoothstep(0.1, 0.8, uv.x)) * smoothstep(0.0, 0.3, uv.y);
  vec3 c = mix(FONDO, INDIGO, difusa * (0.28 + cerca * 0.8) * lugar);
  c += CLARO * brillo * (0.1 + cerca * 0.5) * lugar;
  c = mix(FONDO, c, uEntrada);
  c += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 170.0;
  color = vec4(c, 1.0);
}`

function compilar(gl, tipo, fuente) {
  const shader = gl.createShader(tipo)
  gl.shaderSource(shader, fuente)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader))
  return shader
}

export default function FondoVivo({ contenedor }) {
  const lienzo = useRef(null)
  const [disponible, setDisponible] = useState(true)

  useEffect(() => {
    const canvas = lienzo.current
    const padre = contenedor.current
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) {
      setDisponible(false)
      return
    }

    const programa = gl.createProgram()
    gl.attachShader(programa, compilar(gl, gl.VERTEX_SHADER, VERTICES))
    gl.attachShader(programa, compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTOS))
    gl.linkProgram(programa)
    gl.useProgram(programa)
    gl.bindVertexArray(gl.createVertexArray())
    const u = (nombre) => gl.getUniformLocation(programa, nombre)

    const calma = matchMedia('(prefers-reduced-motion: reduce)').matches
    const objetivo = { x: 0.72, y: 0.58, fuerza: 0 }
    const puntero = { ...objetivo }
    const inicio = performance.now()
    let visible = true
    let peticion = 0
    let ultimo = 0

    const dibujar = (ahora) => {
      // Resorte: la superficie llega al cursor un momento después, nunca de golpe.
      puntero.x += (objetivo.x - puntero.x) * 0.055
      puntero.y += (objetivo.y - puntero.y) * 0.055
      puntero.fuerza += (objetivo.fuerza - puntero.fuerza) * 0.05
      gl.uniform2f(u('uPuntero'), puntero.x, puntero.y)
      gl.uniform1f(u('uFuerza'), puntero.fuerza)
      gl.uniform1f(u('uTiempo'), calma ? 4 : ahora / 1000)
      gl.uniform1f(u('uEntrada'), calma ? 1 : Math.min((ahora - inicio) / 2000, 1))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const bucle = (ahora) => {
      peticion = requestAnimationFrame(bucle)
      if (!visible || ahora - ultimo < 30) return
      ultimo = ahora
      dibujar(ahora)
    }

    // La imagen es suave: una resolución menor no se nota y ahorra mucha GPU.
    const medir = () => {
      canvas.width = Math.max(Math.round(canvas.clientWidth * 0.75), 1)
      canvas.height = Math.max(Math.round(canvas.clientHeight * 0.75), 1)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(u('uTamano'), canvas.width, canvas.height)
      dibujar(performance.now())
    }

    const mover = (e) => {
      const r = canvas.getBoundingClientRect()
      objetivo.x = (e.clientX - r.left) / r.width
      objetivo.y = 1 - (e.clientY - r.top) / r.height
      objetivo.fuerza = 1
    }
    const salir = () => {
      objetivo.fuerza = 0
    }

    padre.addEventListener('pointermove', mover)
    padre.addEventListener('pointerleave', salir)
    const tamano = new ResizeObserver(medir)
    tamano.observe(canvas)
    const presencia = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    presencia.observe(canvas)
    if (!calma) peticion = requestAnimationFrame(bucle)

    return () => {
      cancelAnimationFrame(peticion)
      tamano.disconnect()
      presencia.disconnect()
      padre.removeEventListener('pointermove', mover)
      padre.removeEventListener('pointerleave', salir)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    // El fondo se arma una vez: los cambios de tamaño los resuelve el observador.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return disponible ? <canvas ref={lienzo} className="fondo-vivo" aria-hidden="true" /> : null
}
