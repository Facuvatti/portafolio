import { useEffect } from 'react'
import { Link, useParams } from 'wouter'
import { perfil, proyectos } from 'virtual:contenido'
import Pantalla from './Pantalla.jsx'
import Etiquetas from './Etiquetas.jsx'
import Enlaces from './Enlaces.jsx'
import NoEncontrada from './NoEncontrada.jsx'

export default function Proyecto() {
  const { slug } = useParams()
  const indice = proyectos.findIndex((p) => p.slug === slug)
  const proyecto = proyectos[indice]

  useEffect(() => {
    if (proyecto) document.title = `${proyecto.titulo}, por ${perfil.nombre} ${perfil.apellido}`
  }, [proyecto])

  if (!proyecto) return <NoEncontrada />

  const siguiente = proyectos[(indice + 1) % proyectos.length]

  return (
    <main className="ficha" style={proyecto.color ? { '--led': proyecto.color } : undefined}>
      <div className="ficha__cabecera">
        <div>
          <Link href="/" className="volver">
            Volver al inicio
          </Link>
          <h1 className="ficha__titulo" data-revelar="titulo">
            {proyecto.titulo}
          </h1>
          {proyecto.estado && (
            <p className="estado" data-revelar style={{ '--orden': 1 }}>
              {proyecto.estado}
            </p>
          )}
          <p className="ficha__resumen" data-revelar style={{ '--orden': 2 }}>
            {proyecto.resumen}
          </p>
          <Etiquetas lista={proyecto.stack} />
          <Enlaces proyecto={proyecto} />
        </div>
        <Pantalla proyecto={proyecto} alt={`Captura de ${proyecto.titulo}`} />
      </div>

      {proyecto.html && <div className="prosa ficha__cuerpo" data-revelar dangerouslySetInnerHTML={{ __html: proyecto.html }} />}

      {siguiente.slug !== slug && (
        <Link href={`/proyectos/${siguiente.slug}`} className="siguiente" data-revelar>
          <span>Siguiente proyecto</span>
          <strong>{siguiente.titulo}</strong>
        </Link>
      )}
    </main>
  )
}
