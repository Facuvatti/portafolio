export default function Etiquetas({ lista }) {
  if (!lista.length) return null
  return (
    <ul className="etiquetas">
      {lista.map((t, i) => (
        <li key={t} data-revelar style={{ '--orden': i + 3 }}>
          {t}
        </li>
      ))}
    </ul>
  )
}
