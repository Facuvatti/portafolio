import { useEffect, useRef, useState } from 'react'
import { Route, Router, Switch, useLocation } from 'wouter'
import Intro from './intro/Intro.jsx'
import useRevelar from './pagina/useRevelar.js'
import Navegacion from './pagina/Navegacion.jsx'
import Inicio from './pagina/Inicio.jsx'
import Proyecto from './pagina/Proyecto.jsx'
import NoEncontrada from './pagina/NoEncontrada.jsx'
import Pie from './pagina/Pie.jsx'

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

function Rutas() {
  const [ruta] = useLocation()
  const previa = useRef(ruta)
  useRevelar(ruta)

  useEffect(() => {
    if (previa.current !== ruta) window.scrollTo(0, 0)
    previa.current = ruta
  }, [ruta])

  return (
    <Switch>
      <Route path="/" component={Inicio} />
      <Route path="/proyectos/:slug" component={Proyecto} />
      <Route component={NoEncontrada} />
    </Switch>
  )
}

export default function App() {
  const [intro, setIntro] = useState(() => document.documentElement.hasAttribute('data-intro'))

  return (
    <Router base={BASE}>
      <div id="panel" aria-hidden="true" />
      <div id="pagina" inert={intro ? true : undefined}>
        <Navegacion />
        <Rutas />
        <Pie />
      </div>
      {intro && <Intro alTerminar={() => setIntro(false)} />}
    </Router>
  )
}
