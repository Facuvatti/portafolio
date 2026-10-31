import { actividad, perfil } from 'virtual:contenido'

const NIVELES = [0.08, 0.32, 0.55, 0.78, 1]

function fechaLegible(fecha) {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function texto({ cantidad, fecha }) {
  if (!cantidad) return `Sin contribuciones el ${fechaLegible(fecha)}`
  return `${cantidad} ${cantidad === 1 ? 'contribución' : 'contribuciones'} el ${fechaLegible(fecha)}`
}

// El calendario público de GitHub: cada cuadrado es un día, más claro cuanta más actividad.
export default function Actividad() {
  if (!actividad) return null
  const { dias, total } = actividad
  const relleno = new Date(`${dias[0].fecha}T12:00:00`).getDay()

  return (
    <section id="actividad" aria-labelledby="titulo-actividad" className="seccion actividad">
      <div className="actividad__encabezado">
        <h2 id="titulo-actividad" className="titulo-seccion" data-revelar="titulo">
          Actividad
        </h2>
        <p className="actividad__total" data-revelar style={{ '--orden': 2 }}>
          {total} contribuciones en GitHub durante el último año.{' '}
          <a href={perfil.github} target="_blank" rel="noreferrer">
            Ver el perfil
          </a>
        </p>
      </div>
      <div className="matriz" data-revelar="ola" role="img" aria-label={`Calendario de contribuciones: ${total} en el último año`}>
        {Array.from({ length: relleno }, (_, i) => (
          <span key={`vacio-${i}`} className="matriz__hueco" />
        ))}
        {dias.map((dia, i) => (
          <span
            key={dia.fecha}
            className="matriz__dia"
            title={texto(dia)}
            style={{
              '--luz': NIVELES[dia.nivel],
              '--columna': Math.floor((i + relleno) / 7),
            }}
          />
        ))}
      </div>
    </section>
  )
}
