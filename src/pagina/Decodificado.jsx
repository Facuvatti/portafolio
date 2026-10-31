import { useEffect, useState } from 'react'

const SIGNOS = 'ABCDEFGHKMNPRSTUVXYZ0123456789'
const DURACION = 1100

function azar() {
  return SIGNOS[Math.floor(Math.random() * SIGNOS.length)]
}

// El texto arranca como ruido y se resuelve letra por letra. Si hay encendido, espera a
// que la pantalla prenda; así se decodifica dentro del monitor.
export default function Decodificado({ texto }) {
  const [resueltas, setResueltas] = useState(() =>
    document.documentElement.hasAttribute('data-intro') ? 0 : texto.length,
  )
  const [, sortear] = useState(0)

  useEffect(() => {
    if (resueltas >= texto.length) return
    let cuadro
    const correr = () => {
      const inicio = performance.now()
      const paso = (ahora) => {
        const avance = Math.min((ahora - inicio) / DURACION, 1)
        setResueltas(Math.floor(avance * texto.length))
        sortear((n) => n + 1)
        if (avance < 1) cuadro = requestAnimationFrame(paso)
      }
      cuadro = requestAnimationFrame(paso)
    }
    const raiz = document.documentElement
    if (!raiz.hasAttribute('data-intro')) correr()
    else window.addEventListener('pantalla-encendida', correr, { once: true })
    return () => {
      cancelAnimationFrame(cuadro)
      window.removeEventListener('pantalla-encendida', correr)
    }
    // Se decodifica una sola vez por visita.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (resueltas >= texto.length) return texto

  return (
    <span aria-label={texto}>
      {[...texto].map((letra, i) => (
        <span key={i} className="letra" aria-hidden="true">
          <span className="letra__medida">{letra}</span>
          <span className="letra__signo">{i < resueltas ? letra : azar()}</span>
        </span>
      ))}
    </span>
  )
}
