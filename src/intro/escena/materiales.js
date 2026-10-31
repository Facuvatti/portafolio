import * as THREE from 'three'

export const AZUL_PAGINA = '#0a0920'

export const uniformes = {
  uTiempo: { value: 0 },
  uDespertar: { value: 0 },
}

const RAINBOW = /* glsl */ `
  uniform float uTiempo;
  uniform float uDespertar;
  vec3 arcoiris(float h) {
    vec3 k = abs(fract(h + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0;
    return clamp(k, 0.0, 1.0);
  }
  // Cada LED despierta con un destello blanco y después cae a su color.
  vec3 encendido(float fase, float orden) {
    float prendido = smoothstep(orden, orden + 0.05, uDespertar);
    float destello = prendido * (1.0 - smoothstep(orden + 0.03, orden + 0.15, uDespertar));
    return mix(arcoiris(fase - uTiempo * 0.16), vec3(1.0), destello * 0.9) * prendido;
  }
`

export function crearLed() {
  return new THREE.ShaderMaterial({
    uniforms: uniformes,
    vertexShader: /* glsl */ `
      attribute float aFase;
      attribute float aOrden;
      attribute float aBrillo;
      varying float vFase;
      varying float vOrden;
      varying float vBrillo;
      void main() {
        vFase = aFase;
        vOrden = aOrden;
        vBrillo = aBrillo;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      ${RAINBOW}
      varying float vFase;
      varying float vOrden;
      varying float vBrillo;
      void main() {
        gl_FragColor = vec4(encendido(vFase, vOrden) * vBrillo * 0.6, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
}

// Baño de luz sobre la pared: más barato y más controlable que luces reales.
export function crearHalo({ orden = 0.8, fuerza = 0.5, escalaFase = 0.6 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...uniformes,
      uOrden: { value: orden },
      uFuerza: { value: fuerza },
      uEscala: { value: escalaFase },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      ${RAINBOW}
      uniform float uOrden;
      uniform float uFuerza;
      uniform float uEscala;
      varying vec2 vUv;
      void main() {
        vec2 c = vUv * 2.0 - 1.0;
        float caida = pow(max(1.0 - dot(c * c, vec2(1.0)), 0.0), 2.2);
        vec3 color = encendido(vUv.x * uEscala + vUv.y * 0.12, uOrden);
        gl_FragColor = vec4(color * caida * uFuerza, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
}

function lienzo(ancho, alto, dibujar) {
  const c = document.createElement('canvas')
  c.width = ancho
  c.height = alto
  dibujar(c.getContext('2d'), ancho, alto)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

export function texturaMadera() {
  const t = lienzo(1024, 512, (g, w, h) => {
    g.fillStyle = '#2a1a12'
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < 900; i++) {
      const y = Math.random() * h
      const claro = Math.random() > 0.55
      g.strokeStyle = claro ? `rgba(120,78,48,${Math.random() * 0.1})` : `rgba(10,5,3,${Math.random() * 0.22})`
      g.lineWidth = 0.5 + Math.random() * 2.2
      g.beginPath()
      g.moveTo(0, y)
      const onda = Math.random() * 7
      for (let x = 0; x <= w; x += 64) g.lineTo(x, y + Math.sin(x * 0.006 + i) * onda)
      g.stroke()
    }
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

export function texturaPlaca() {
  return lienzo(512, 512, (g, w, h) => {
    g.fillStyle = '#0c0e14'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = 'rgba(70,84,110,0.32)'
    g.lineWidth = 1
    for (let i = 0; i < 160; i++) {
      let x = Math.random() * w
      let y = Math.random() * h
      g.beginPath()
      g.moveTo(x, y)
      for (let s = 0; s < 3; s++) {
        if (Math.random() > 0.5) x += (Math.random() - 0.5) * 140
        else y += (Math.random() - 0.5) * 140
        g.lineTo(x, y)
      }
      g.stroke()
    }
    g.fillStyle = 'rgba(190,200,220,0.5)'
    g.font = '11px sans-serif'
    for (const [texto, x, y] of [['CPU_FAN', 60, 40], ['PCIE_1', 40, 330], ['M.2_1', 300, 300], ['DDR5_A1', 400, 120], ['SYS_FAN2', 330, 480]]) {
      g.fillText(texto, x, y)
    }
  })
}

export function texturaAletas() {
  const t = lienzo(64, 64, (g, w, h) => {
    g.fillStyle = '#16171c'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#05060a'
    for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 4, h)
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(30, 3)
  return t
}

export function texturaLogo(fondo = AZUL_PAGINA) {
  return lienzo(512, 512, (g, w, h) => {
    g.fillStyle = fondo
    g.fillRect(0, 0, w, h)
    // Símbolo de encendido, el mismo del sitio.
    const r = w * 0.27
    g.strokeStyle = '#ffffff'
    g.lineWidth = w * 0.062
    g.lineCap = 'round'
    g.beginPath()
    g.arc(w / 2, h * 0.53, r, -Math.PI / 2 + 0.72, -Math.PI / 2 - 0.72 + Math.PI * 2)
    g.stroke()
    g.beginPath()
    g.moveTo(w / 2, h * 0.2)
    g.lineTo(w / 2, h * 0.5)
    g.stroke()
  })
}

function texturaReflejo() {
  return lienzo(256, 256, (g, w, h) => {
    const c = g.createLinearGradient(0, 0, w, h)
    c.addColorStop(0, '#000000')
    c.addColorStop(0.36, '#10121c')
    c.addColorStop(0.42, '#7d86b8')
    c.addColorStop(0.47, '#14162a')
    c.addColorStop(0.62, '#2a2e4a')
    c.addColorStop(0.65, '#050508')
    c.addColorStop(1, '#14161f')
    g.fillStyle = c
    g.fillRect(0, 0, w, h)
  })
}

export function crearMateriales() {
  const estandar = (o) => new THREE.MeshStandardMaterial(o)
  return {
    chasis: estandar({ color: '#14151b', metalness: 0.75, roughness: 0.42 }),
    metal: estandar({ color: '#2c2e38', metalness: 0.9, roughness: 0.32 }),
    aluminio: estandar({ color: '#8c8f99', metalness: 1, roughness: 0.3 }),
    plastico: estandar({ color: '#0d0e13', metalness: 0.1, roughness: 0.55 }),
    goma: estandar({ color: '#08080a', metalness: 0, roughness: 0.85 }),
    cable: estandar({ color: '#34363f', metalness: 0.1, roughness: 0.7 }),
    tecla: estandar({ color: '#191a22', metalness: 0.05, roughness: 0.42 }),
    alfombra: estandar({ color: '#0e0f15', metalness: 0, roughness: 0.95 }),
    pared: estandar({ color: '#14141d', metalness: 0, roughness: 0.8 }),
    listones: estandar({ color: '#4a3324', map: texturaMadera(), metalness: 0, roughness: 0.55 }),
    mesa: estandar({ color: '#a98468', map: texturaMadera(), metalness: 0, roughness: 0.58 }),
    piso: estandar({ color: '#0a0a0f', metalness: 0.1, roughness: 0.6 }),
    placa: estandar({ map: texturaPlaca(), metalness: 0.4, roughness: 0.5 }),
    radiador: estandar({ map: texturaAletas(), metalness: 0.7, roughness: 0.5 }),
    aspa: estandar({ color: '#1a1b23', metalness: 0.2, roughness: 0.4, side: THREE.DoubleSide }),
    // Reflejo pintado: un vidrio físico devuelve las luces interiores como manchas blancas.
    vidrio: new THREE.MeshBasicMaterial({
      map: texturaReflejo(),
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  }
}
