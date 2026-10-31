function nombreRepositorio(url) {
  return url.replace(/\/$/, '').split('/').pop()
}

// Enlaces externos de un proyecto. Con un solo repositorio alcanza con decir "Código".
export default function Enlaces({ proyecto }) {
  const { url, codigo } = proyecto
  if (!url && !codigo.length) return null

  return (
    <p className="enlaces">
      {url && (
        <a href={url} target="_blank" rel="noreferrer">
          Abrir el sitio
        </a>
      )}
      {codigo.map((repo) => (
        <a key={repo} href={repo} target="_blank" rel="noreferrer">
          {codigo.length > 1 ? `Código de ${nombreRepositorio(repo)}` : 'Código'}
        </a>
      ))}
    </p>
  )
}
