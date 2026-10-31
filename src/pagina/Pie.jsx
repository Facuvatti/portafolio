import { perfil } from 'virtual:contenido'
import IconoGithub from './IconoGithub.jsx'

function verEncendido() {
  try {
    sessionStorage.removeItem('encendido')
  } catch {}
  location.assign(`${import.meta.env.BASE_URL}?intro`)
}

export default function Pie() {
  return (
    <footer className="pie">
      <p>
        {perfil.nombre} {perfil.apellido}, {new Date().getFullYear()}
      </p>
      <div className="pie__acciones">
        <button type="button" onClick={verEncendido}>
          Ver el encendido de nuevo
        </button>
        <button type="button" onClick={() => window.scrollTo({ top: 0 })}>
          Volver arriba
        </button>
        {perfil.github && (
          <a href={perfil.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <IconoGithub />
          </a>
        )}
      </div>
    </footer>
  )
}
