import { perfil } from 'virtual:contenido'

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
      <button type="button" onClick={verEncendido}>
        Ver el encendido de nuevo
      </button>
    </footer>
  )
}
