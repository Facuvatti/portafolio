import { useEffect } from 'react'
import { Link } from 'wouter'
import { perfil, proyectos } from 'virtual:contenido'
import Tira from './Tira.jsx'
import Enlaces from './Enlaces.jsx'
import Decodificado from './Decodificado.jsx'

const leds = [
  { id: 'inicio', nombre: 'Inicio', color: '#ffffff' },
  ...(proyectos.length
    ? proyectos.map((p) => ({ id: p.slug, nombre: p.titulo, color: p.color }))
    : [{ id: 'proyectos', nombre: 'Proyectos', color: '#ffffff' }]),
  ...(perfil.html ? [{ id: 'sobre-mi', nombre: 'Sobre mí', color: '#ffffff' }] : []),
  { id: 'contacto', nombre: 'Contacto', color: '#ffffff' },
]

function Fila({ proyecto }) {
  const ruta = `/proyectos/${proyecto.slug}`
  return (
    <article id={proyecto.slug} className="fila" style={{ '--led': proyecto.color }}>
      <div className="fila__texto">
        <h3 className="fila__titulo">
          <Link href={ruta}>{proyecto.titulo}</Link>
        </h3>
        {proyecto.estado && <p className="estado">{proyecto.estado}</p>}
        <p className="fila__resumen">{proyecto.resumen}</p>
        {proyecto.stack.length > 0 && <p className="stack">{proyecto.stack.join(', ')}</p>}
        <Enlaces proyecto={proyecto} />
      </div>
      {proyecto.portada && (
        <Link href={ruta} className="fila__portada" tabIndex={-1} aria-hidden="true">
          <img src={proyecto.portada} alt="" loading="lazy" />
        </Link>
      )}
    </article>
  )
}

function SinProyectos() {
  return (
    <div className="vacio">
      <p>Todavía no hay proyectos publicados.</p>
      {import.meta.env.DEV && (
        <p className="stack">
          Para agregar el primero, corré <code>npm run nuevo "Nombre del proyecto"</code>
        </p>
      )}
    </div>
  )
}

export default function Inicio() {
  useEffect(() => {
    document.title = `${perfil.nombre} ${perfil.apellido}`
  }, [])

  return (
    <>
      <Tira leds={leds} />
      <main>
        <header id="inicio" className="portada">
          <h1 className="portada__nombre">
            <span>
              <Decodificado texto={perfil.nombre} />
            </span>{' '}
            <span>
              <Decodificado texto={perfil.apellido} />
            </span>
          </h1>
          <div className="portada__pie">
            <p className="portada__rol">{perfil.rol}</p>
            {perfil.frase && <p className="portada__frase">{perfil.frase}</p>}
          </div>
        </header>

        <section id="proyectos" aria-labelledby="titulo-proyectos" className="proyectos">
          <h2 id="titulo-proyectos" className="titulo-seccion">
            Proyectos
          </h2>
          {proyectos.length ? proyectos.map((p) => <Fila key={p.slug} proyecto={p} />) : <SinProyectos />}
        </section>

        {perfil.html && (
          <section id="sobre-mi" aria-labelledby="titulo-sobre-mi" className="columnas">
            <h2 id="titulo-sobre-mi" className="titulo-seccion">
              Sobre mí
            </h2>
            <div>
              <div className="prosa" dangerouslySetInnerHTML={{ __html: perfil.html }} />
              {perfil.tecnologias.length > 0 && <p className="stack">{perfil.tecnologias.join(', ')}</p>}
            </div>
          </section>
        )}

        <section id="contacto" aria-labelledby="titulo-contacto" className="columnas">
          <h2 id="titulo-contacto" className="titulo-seccion">
            Contacto
          </h2>
          <p className="contacto">
            {perfil.email && <a href={`mailto:${perfil.email}`}>{perfil.email}</a>}
            {perfil.linkedin && <a href={perfil.linkedin}>LinkedIn</a>}
            {perfil.github && <a href={perfil.github}>GitHub</a>}
          </p>
        </section>
      </main>
    </>
  )
}
