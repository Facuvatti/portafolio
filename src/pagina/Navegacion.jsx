import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { actividad, perfil } from 'virtual:contenido'
import IconoGithub from './IconoGithub.jsx'
import IconoEncendido from './IconoEncendido.jsx'

const BASE = import.meta.env.BASE_URL
const destinos = [
  { id: 'inicio', nombre: 'Inicio' },
  { id: 'proyectos', nombre: 'Proyectos' },
  ...(perfil.html ? [{ id: 'sobre-mi', nombre: 'Sobre mí' }] : []),
  ...(perfil.areas.length ? [{ id: 'lo-que-hago', nombre: 'Lo que hago' }] : []),
  ...(perfil.recorrido.length ? [{ id: 'recorrido', nombre: 'Recorrido' }] : []),
  ...(actividad ? [{ id: 'actividad', nombre: 'Actividad' }] : []),
  { id: 'contacto', nombre: 'Contacto' },
]

function llevarA(id) {
  if (id === 'inicio') window.scrollTo({ top: 0 })
  else document.getElementById(id)?.scrollIntoView()
}

export default function Navegacion() {
  const [ruta, navegar] = useLocation()
  const [activo, setActivo] = useState('inicio')
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (ruta !== '/') {
      setActivo(null)
      return
    }
    const secciones = destinos.map((d) => document.getElementById(d.id)).filter(Boolean)
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setActivo(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    secciones.forEach((s) => observador.observe(s))
    return () => observador.disconnect()
  }, [ruta])

  useEffect(() => {
    if (!abierto) return
    const cerrar = (e) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', cerrar)
    return () => window.removeEventListener('keydown', cerrar)
  }, [abierto])

  const ir = (evento, id) => {
    evento.preventDefault()
    setAbierto(false)
    if (ruta === '/') return llevarA(id)
    navegar('/')
    setTimeout(() => llevarA(id), 80)
  }

  return (
    <header className="riel" data-abierto={abierto || undefined}>
      <a className="riel__marca" href={BASE} onClick={(e) => ir(e, 'inicio')} aria-label={`${perfil.nombre} ${perfil.apellido}, inicio`}>
        <IconoEncendido />
        <span className="riel__nombre">
          {perfil.nombre} {perfil.apellido}
        </span>
      </a>

      <button type="button" className="riel__menu" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
        {abierto ? 'Cerrar' : 'Menú'}
      </button>

      <nav className="riel__enlaces" aria-label="Secciones">
        {destinos.map((d, i) => (
          <a
            key={d.id}
            data-revelar="lado"
            href={`${BASE}#${d.id}`}
            style={{ '--orden': i + 2 }}
            data-activo={activo === d.id || undefined}
            aria-current={activo === d.id ? 'true' : undefined}
            onClick={(e) => ir(e, d.id)}
          >
            {d.nombre}
          </a>
        ))}
      </nav>

      {perfil.github && (
        <a className="riel__red" href={perfil.github} target="_blank" rel="noreferrer" aria-label="GitHub">
          <IconoGithub />
        </a>
      )}
    </header>
  )
}
