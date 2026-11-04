import { useState } from 'react'
import { perfil } from 'virtual:contenido'

// El visitante deja su correo y el pedido llega por Formspree; el CV se manda a mano.
export default function PedirCv() {
  const [estado, setEstado] = useState('listo')

  const enviar = async (evento) => {
    evento.preventDefault()
    setEstado('enviando')
    try {
      const respuesta = await fetch(perfil.formulario, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(evento.currentTarget),
      })
      setEstado(respuesta.ok ? 'enviado' : 'error')
    } catch {
      setEstado('error')
    }
  }

  if (estado === 'enviado') {
    return <p className="pedir-cv__aviso">Pedido enviado. Te mando el CV a ese correo.</p>
  }

  return (
    <form className="pedir-cv" onSubmit={enviar}>
      <label htmlFor="correo-cv">¿Preferís recibir el CV por correo?</label>
      <input id="correo-cv" name="email" type="email" required placeholder="tu@correo.com" autoComplete="email" />
      <input type="hidden" name="_subject" value="Pedido de CV desde el portafolio" />
      <button className="boton" type="submit" disabled={estado === 'enviando'}>
        {estado === 'enviando' ? 'Enviando…' : 'Pedir el CV'}
      </button>
      {estado === 'error' && (
        <p className="pedir-cv__aviso" role="alert">
          No se pudo enviar el pedido. Revisá tu conexión y probá de nuevo, o descargá el CV desde el botón de arriba.
        </p>
      )}
    </form>
  )
}
