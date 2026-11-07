import { useEffect, useRef } from 'react'
import { Link } from 'wouter'
import { perfil, proyectos } from 'virtual:contenido'
import FondoVivo from './FondoVivo.jsx'
import Pantalla, { useInclinar } from './Pantalla.jsx'
import Etiquetas from './Etiquetas.jsx'
import Enlaces from './Enlaces.jsx'
import Actividad from './Actividad.jsx'
import Areas from './Areas.jsx'
import Recorrido from './Recorrido.jsx'
import IconoGithub from './IconoGithub.jsx'
import Decodificado from './Decodificado.jsx'
import PedirCv from './PedirCv.jsx'

const CV = perfil.cv ? `${import.meta.env.BASE_URL}${perfil.cv}` : null

function saltar(evento, id) {
  evento.preventDefault()
  document.getElementById(id)?.scrollIntoView()
}

function Fila({ proyecto }) {
  const ruta = `/proyectos/${proyecto.slug}`
  return (
    <article className="fila" style={proyecto.color ? { '--led': proyecto.color } : undefined}>
      <Link href={ruta} className="fila__imagen" tabIndex={-1} aria-hidden="true">
        <Pantalla proyecto={proyecto} />
      </Link>
      <div className="fila__texto">
        <h3 className="fila__titulo" data-revelar="titulo">
          <Link href={ruta}>{proyecto.titulo}</Link>
        </h3>
        {proyecto.estado && (
          <p className="estado" data-revelar style={{ '--orden': 1 }}>
            {proyecto.estado}
          </p>
        )}
        <p className="fila__resumen" data-revelar style={{ '--orden': 2 }}>
          {proyecto.resumen}
        </p>
        <Etiquetas lista={proyecto.stack} />
        <Enlaces proyecto={proyecto}>
          <Link href={ruta} className="boton boton--principal">
            Ver proyecto
          </Link>
        </Enlaces>
      </div>
    </article>
  )
}

function SinProyectos() {
  return (
    <div className="vacio">
      <p>Todavía no hay proyectos publicados.</p>
      {import.meta.env.DEV && (
        <p>
          Para agregar el primero, corré <code>pnpm nuevo "Nombre del proyecto"</code>
        </p>
      )}
    </div>
  )
}

function Retrato() {
  const caja = useInclinar()
  return (
    <figure ref={caja} className="retrato" data-revelar="pantalla" style={{ '--orden': 2 }}>
      <div className="retrato__marco">
        <img src={perfil.foto} alt={`Foto de ${perfil.nombre} ${perfil.apellido}`} width="800" height="1067" />
      </div>
    </figure>
  )
}

export default function Inicio() {
  const portada = useRef(null)

  useEffect(() => {
    document.title = `${perfil.nombre} ${perfil.apellido}`
  }, [])

  return (
    <main>
      <section id="inicio" ref={portada} className="portada">
        <FondoVivo contenedor={portada} />
        {perfil.foto && <Retrato />}
        <div className="portada__contenido">
          {perfil.disponibilidad && (
            <p className="disponible" data-revelar>
              {perfil.disponibilidad}
            </p>
          )}
          <h1 className="portada__nombre">
            <span data-revelar="titulo" style={{ '--orden': 1 }}>
              {perfil.nombre}
            </span>{' '}
            <span data-revelar="titulo" style={{ '--orden': 3 }}>
              {perfil.apellido}
            </span>
          </h1>
          {perfil.frase && (
            <p className="portada__frase" data-revelar style={{ '--orden': 7 }}>
              {perfil.frase}
            </p>
          )}
          {perfil.disciplinas.length > 0 && (
            <p className="portada__rol" data-revelar style={{ '--orden': 10 }}>
              <span className="portada__linea" data-revelar="linea" style={{ '--orden': 12 }} />
              <Decodificado textos={perfil.disciplinas} />
            </p>
          )}
          <p className="botones" data-revelar style={{ '--orden': 15 }}>
            <a className="boton boton--principal" href="#proyectos" onClick={(e) => saltar(e, 'proyectos')}>
              Ver proyectos
            </a>
            {CV ? (
              <a className="boton" href={CV} download>
                Descargar CV
              </a>
            ) : (
              <a className="boton" href="#contacto" onClick={(e) => saltar(e, 'contacto')}>
                Contacto
              </a>
            )}
          </p>
        </div>
        <a
          className="indicador"
          href="#proyectos"
          aria-label="Ir a los proyectos"
          onClick={(e) => saltar(e, 'proyectos')}
          data-revelar
          style={{ '--orden': 20 }}
        />
      </section>

      <section id="proyectos" aria-labelledby="titulo-proyectos" className="seccion proyectos">
        <h2 id="titulo-proyectos" className="titulo-seccion" data-revelar="titulo">
          Proyectos
        </h2>
        {proyectos.length ? proyectos.map((p) => <Fila key={p.slug} proyecto={p} />) : <SinProyectos />}
      </section>

      {perfil.html && (
        <section id="sobre-mi" aria-labelledby="titulo-sobre-mi" className="seccion sobre-mi">
          <div>
            <h2 id="titulo-sobre-mi" className="titulo-seccion" data-revelar="titulo">
              Sobre mí
            </h2>
            <div className="prosa" data-revelar style={{ '--orden': 2 }} dangerouslySetInnerHTML={{ __html: perfil.html }} />
          </div>
        </section>
      )}

      <Areas />
      <Recorrido />

      <Actividad />

      <section id="contacto" aria-labelledby="titulo-contacto" className="contacto">
        <h2 id="titulo-contacto" className="contacto__titulo" data-revelar="titulo">
          Hablemos
        </h2>
        <p className="contacto__texto" data-revelar style={{ '--orden': 2 }}>¿Un sistema que falla, una idea sin arrancar o un puesto para cubrir? Contámelo en dos líneas. Si no es para ahora, igual me interesa saber qué estás armando.</p>
        <p className="botones" data-revelar style={{ '--orden': 3 }}>
          {perfil.linkedin && (
            <a className="boton boton--principal" href={perfil.linkedin} target="_blank" rel="noreferrer">
              Escribime por LinkedIn
            </a>
          )}
          {CV && (
            <a className="boton" href={CV} download>
              Descargar CV
            </a>
          )}
          {perfil.email && (
            <a className="boton boton--principal" href={`mailto:${perfil.email}`}>
              Enviar un correo
            </a>
          )}
          {perfil.github && (
            <a className="boton" href={perfil.github} target="_blank" rel="noreferrer">
              <IconoGithub />
              GitHub
            </a>
          )}
        </p>
        {perfil.formulario && <PedirCv />}
      </section>
    </main>
  )
}
