import { Link } from 'wouter'

export default function NoEncontrada() {
  return (
    <main className="ficha">
      <h1 className="ficha__titulo">Esta página no existe</h1>
      <p className="ficha__resumen">La dirección puede estar mal escrita o el proyecto puede haber cambiado de nombre.</p>
      <p className="botones">
        <Link href="/" className="boton boton--principal">
          Ir al inicio
        </Link>
      </p>
    </main>
  )
}
