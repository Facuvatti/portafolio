import { useEffect, useState } from 'react'

const SIGNOS = 'ABCDEF0123456789/<>=#'
const DURACION = 700
const PAUSA = 3200

function ruido(destino, resueltas) {
  return [...destino].map((letra, i) => (i < resueltas ? letra : SIGNOS[Math.floor(Math.random() * SIGNOS.length)])).join('')
}

// Rota entre varios textos: cada uno aparece como ruido y se resuelve letra por letra.
export default function Decodificado({ textos }) {
  const [indice, setIndice] = useState(0)
  const [visible, setVisible] = useState(textos[0])

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const destino = textos[indice]
    const inicio = performance.now()
    let cuadro
    let espera

    const paso = (ahora) => {
      const avance = Math.min((ahora - inicio) / DURACION, 1)
      setVisible(ruido(destino, Math.floor(avance * destino.length)))
      if (avance < 1) cuadro = requestAnimationFrame(paso)
      else espera = setTimeout(() => setIndice((i) => (i + 1) % textos.length), PAUSA)
    }
    cuadro = requestAnimationFrame(paso)

    return () => {
      cancelAnimationFrame(cuadro)
      clearTimeout(espera)
    }
  }, [indice, textos])

  return (
    <span className="decodificado" aria-label={textos.join(', ')}>
      <span aria-hidden="true">{visible}</span>
    </span>
  )
}
