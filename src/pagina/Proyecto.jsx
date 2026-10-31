import { useEffect } from 'react'
import { Link, useParams } from 'wouter'
import { perfil, proyectos } from 'virtual:contenido'
import Tira from './Tira.jsx'
import Enlaces from './Enlaces.jsx'
import NoEncontrada from './NoEncontrada.jsx'

export default function Proyecto() {
  const { slug } = useParams()
  const proyecto = proyectos.find((p) => p.slug === slug)

  useEffect(() => {
    if (proyecto) document.title = `${proyecto.titulo}, por ${perfil.nombre} ${perfil.apellido}`
  }, [proyecto])

  if (!proyecto) return <NoEncontrada />

  const leds = proyectos.map((p) => ({
    id: p.slug === slug ? 'proyecto' : p.slug,
    nombre: p.titulo,
    color: p.color,
    href: `/proyectos/${p.slug}`,
  }))

  return (
    <>
      <Tira key={slug} leds={leds} />
      <main id="proyecto" className="ficha" style={{ '--led': proyecto.color }}>
        <p>
          <Link href="/" className="volver">
            Volver al inicio
          </Link>
        </p>
        <h1 className="ficha__titulo">{proyecto.titulo}</h1>
        {proyecto.estado && <p className="estado">{proyecto.estado}</p>}
        <p className="ficha__resumen">{proyecto.resumen}</p>
        {proyecto.stack.length > 0 && <p className="stack">{proyecto.stack.join(', ')}</p>}
        <Enlaces proyecto={proyecto} />
        {proyecto.portada && <img className="ficha__portada" src={proyecto.portada} alt={`Captura de ${proyecto.titulo}`} />}
        {proyecto.html && <div className="prosa" dangerouslySetInnerHTML={{ __html: proyecto.html }} />}
      </main>
    </>
  )
}
