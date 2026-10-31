function nombreRepositorio(url) {
  return url.replace(/\/$/, '').split('/').pop()
}

// Enlaces externos de un proyecto. Con un solo repositorio alcanza con decir "Código".
export default function Enlaces({ proyecto, children }) {
  const { url, codigo } = proyecto
  if (!url && !codigo.length && !children) return null

  return (
    <p className="botones" data-revelar style={{ '--orden': 4 }}>
      {children}
      {url && (
        <a className="boton" href={url} target="_blank" rel="noreferrer">
          Abrir el sitio
        </a>
      )}
      {codigo.map((repo) => (
        <a key={repo} className="boton" href={repo} target="_blank" rel="noreferrer">
          {codigo.length > 1 ? `Código de ${nombreRepositorio(repo)}` : 'Código'}
        </a>
      ))}
    </p>
  )
}
