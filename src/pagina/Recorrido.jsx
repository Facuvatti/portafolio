import { perfil } from 'virtual:contenido'

export default function Recorrido() {
  if (!perfil.recorrido.length) return null

  return (
    <section id="recorrido" aria-labelledby="titulo-recorrido" className="seccion">
      <h2 id="titulo-recorrido" className="titulo-seccion" data-revelar="titulo">
        Recorrido
      </h2>
      <ol className="recorrido">
        {perfil.recorrido.map((hito) => (
          <li key={`${hito.fecha}-${hito.titulo}`} data-revelar>
            <p className="recorrido__fecha">{hito.fecha}</p>
            <div>
              <h3 className="recorrido__titulo">{hito.titulo}</h3>
              <p className="recorrido__detalle">{hito.detalle}</p>
            </div>
          </li>
        ))}
      </ol>
      {perfil.certificados.length > 0 && (
        <div className="certificados" data-revelar>
          <h3 className="recorrido__titulo">Certificados</h3>
          <ul className="etiquetas">
            {perfil.certificados.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
