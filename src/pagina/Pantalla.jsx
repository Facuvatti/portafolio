import { useEffect, useRef } from 'react'

const RESORTE = 0.1

// El monitor sigue al mouse con un resorte, como el objeto 3D de la portada de Hamish
// Williams, y el reflejo del vidrio se desplaza con él.
export function useInclinar() {
  const caja = useRef(null)

  useEffect(() => {
    const elemento = caja.current
    if (!matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return
    const objetivo = { x: 0, y: 0 }
    const actual = { x: 0, y: 0 }
    let cuadro = 0

    const paso = () => {
      actual.x += (objetivo.x - actual.x) * RESORTE
      actual.y += (objetivo.y - actual.y) * RESORTE
      elemento.style.setProperty('--rx', `${(-actual.y * 7).toFixed(2)}deg`)
      elemento.style.setProperty('--ry', `${(actual.x * 9).toFixed(2)}deg`)
      elemento.style.setProperty('--gx', `${(50 + actual.x * 50).toFixed(1)}%`)
      elemento.style.setProperty('--gy', `${(50 + actual.y * 50).toFixed(1)}%`)
      const quieto = Math.abs(objetivo.x - actual.x) + Math.abs(objetivo.y - actual.y) < 0.002
      cuadro = quieto ? 0 : requestAnimationFrame(paso)
    }
    const arrancar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(paso)
    }
    const mover = (e) => {
      const r = elemento.getBoundingClientRect()
      objetivo.x = ((e.clientX - r.left) / r.width - 0.5) * 2
      objetivo.y = ((e.clientY - r.top) / r.height - 0.5) * 2
      arrancar()
    }
    const salir = () => {
      objetivo.x = 0
      objetivo.y = 0
      arrancar()
    }

    elemento.addEventListener('pointermove', mover)
    elemento.addEventListener('pointerleave', salir)
    return () => {
      cancelAnimationFrame(cuadro)
      elemento.removeEventListener('pointermove', mover)
      elemento.removeEventListener('pointerleave', salir)
    }
  }, [])

  return caja
}

// Un monitor chico con la captura del proyecto. El brillo detrás es la luz de su LED.
export default function Pantalla({ proyecto, alt = '' }) {
  const caja = useInclinar()

  return (
    <figure ref={caja} className="pantalla" data-revelar="pantalla">
      <div className="pantalla__marco">
        {proyecto.portada ? (
          <img src={proyecto.portada} alt={alt} loading="lazy" />
        ) : (
          <span className="pantalla__sin-imagen">{proyecto.titulo}</span>
        )}
      </div>
      <div className="pantalla__pie" aria-hidden="true" />
    </figure>
  )
}
