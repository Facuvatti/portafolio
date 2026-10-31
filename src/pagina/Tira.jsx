import { useEffect, useState } from 'react'
import { Link } from 'wouter'

// La tira LED es la navegación: un LED por destino, encendido el que está en pantalla.
export default function Tira({ leds }) {
  const [activo, setActivo] = useState(leds[0]?.id)

  useEffect(() => {
    const secciones = leds.map((l) => document.getElementById(l.id)).filter(Boolean)
    if (!secciones.length) return
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setActivo(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    secciones.forEach((s) => observador.observe(s))
    return () => observador.disconnect()
  }, [leds])

  return (
    <nav className="tira" aria-label="Secciones">
      {leds.map((led) => {
        const contenido = (
          <>
            <span className="tira__led" aria-hidden="true" />
            <span className="tira__nombre">{led.nombre}</span>
          </>
        )
        const props = {
          className: 'tira__punto',
          style: { '--led': led.color },
          'data-activo': activo === led.id || undefined,
          'aria-current': activo === led.id ? 'true' : undefined,
        }
        return led.href ? (
          <Link key={led.id} href={led.href} {...props}>
            {contenido}
          </Link>
        ) : (
          <a key={led.id} href={`#${led.id}`} {...props}>
            {contenido}
          </a>
        )
      })}
    </nav>
  )
}
