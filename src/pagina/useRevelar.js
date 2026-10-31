import { useEffect } from 'react'

// Marca con data-visible cada [data-revelar] al entrar en pantalla; el CSS hace el resto.
// Durante el encendido espera a que prenda el monitor, para que la página entre ahí.
export default function useRevelar(ruta) {
  useEffect(() => {
    const raiz = document.documentElement
    const calma = matchMedia('(prefers-reduced-motion: reduce)').matches
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue
          e.target.setAttribute('data-visible', '')
          observador.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    const observar = () => {
      for (const e of document.querySelectorAll('[data-revelar]:not([data-visible])')) {
        if (calma) e.setAttribute('data-visible', '')
        else observador.observe(e)
      }
    }

    if (raiz.hasAttribute('data-intro')) window.addEventListener('pantalla-encendida', observar, { once: true })
    else observar()

    return () => {
      observador.disconnect()
      window.removeEventListener('pantalla-encendida', observar)
    }
  }, [ruta])
}
