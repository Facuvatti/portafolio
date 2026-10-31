import { useState } from 'react'
import { perfil } from 'virtual:contenido'

// Una lista de áreas, no un rol: al elegir una se ve qué se hace ahí y con qué.
export default function Areas() {
  const [activa, setActiva] = useState(0)
  const area = perfil.areas[activa]
  if (!area) return null

  return (
    <section id="lo-que-hago" aria-labelledby="titulo-lo-que-hago" className="seccion">
      <h2 id="titulo-lo-que-hago" className="titulo-seccion" data-revelar="titulo">
        Lo que hago
      </h2>
      <div className="areas">
        <ul className="areas__lista">
          {perfil.areas.map((a, i) => (
            <li key={a.nombre} data-revelar style={{ '--orden': i + 1 }}>
              <button
                type="button"
                aria-pressed={i === activa}
                onClick={() => setActiva(i)}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActiva(i)}
                onFocus={() => setActiva(i)}
              >
                {a.nombre}
              </button>
            </li>
          ))}
        </ul>
        <div className="areas__detalle" aria-live="polite" data-revelar style={{ '--orden': 3 }}>
          <div key={area.nombre} className="areas__cambio">
            <p className="areas__texto">{area.texto}</p>
            <ul className="etiquetas">
              {area.herramientas.map((h, i) => (
                <li key={h} style={{ '--orden': i }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
