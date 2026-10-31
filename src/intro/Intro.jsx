import { useEffect, useRef } from 'react'

const ESPERA_MAXIMA = 8000

function marcarVisto() {
  try {
    sessionStorage.setItem('encendido', '1')
  } catch {}
}

// Muestra el encendido de la PC y deja la página tal como queda en pantalla. Si algo
// falla (sin WebGL, carga lenta, ventana redimensionada), se pasa directo a la página.
export default function Intro({ alTerminar }) {
  const lienzo = useRef(null)
  const terminar = useRef(() => {})

  useEffect(() => {
    const raiz = document.documentElement
    const pagina = document.getElementById('pagina')
    const panel = document.getElementById('panel')
    let escena = null
    let cerrado = false

    const alPresionar = (e) => {
      if (e.key === 'Escape') terminar.current()
    }
    const limite = setTimeout(() => terminar.current(), ESPERA_MAXIMA)

    terminar.current = () => {
      if (cerrado) return
      cerrado = true
      clearTimeout(limite)
      window.removeEventListener('keydown', alPresionar)
      escena?.destruir()
      pagina.removeAttribute('style')
      panel.removeAttribute('style')
      raiz.removeAttribute('style')
      raiz.removeAttribute('data-intro')
      window.dispatchEvent(new Event('pantalla-encendida'))
      marcarVisto()
      alTerminar()
    }

    window.addEventListener('keydown', alPresionar)

    Promise.all([import('./escena/index.js'), document.fonts.ready])
      .then(([{ crearEscena }]) => {
        if (cerrado) return
        escena = crearEscena({ lienzo: lienzo.current, pagina, panel, alTerminar: () => terminar.current() })
        clearTimeout(limite)
      })
      .catch((error) => {
        console.warn('Encendido omitido:', error)
        terminar.current()
      })

    return () => terminar.current()
    // Se monta una sola vez: la escena vive hasta que el encendido termina.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="intro">
      <canvas ref={lienzo} className="intro__lienzo" aria-hidden="true" />
      <button type="button" className="intro__saltar" onClick={() => terminar.current()}>
        Saltar el encendido
      </button>
    </div>
  )
}
