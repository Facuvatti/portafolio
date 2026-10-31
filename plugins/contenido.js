import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { marked } from 'marked'

const ID = 'virtual:contenido'
const RESUELTO = '\0' + ID
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONTENIDO = path.join(RAIZ, 'contenido')
const PROYECTOS = path.join(CONTENIDO, 'proyectos')

function escapar(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function leerMarkdown(archivo) {
  const { data, content } = matter(fs.readFileSync(archivo, 'utf8'))
  const texto = content.replace(/<!--[\s\S]*?-->/g, '').trim()
  return { datos: data, html: texto ? marked.parse(texto) : '' }
}

function leerPerfil() {
  const { datos, html } = leerMarkdown(path.join(CONTENIDO, 'perfil.md'))
  const foto = datos.foto ? path.join(CONTENIDO, datos.foto) : null
  if (foto && !fs.existsSync(foto)) throw new Error(`contenido/perfil.md: no existe la imagen ${datos.foto}`)
  return { disciplinas: [], areas: [], recorrido: [], certificados: [], ...datos, html, foto }
}

// El calendario público de GitHub, para mostrarlo como panel LED. Si no se puede leer,
// la sección de actividad no aparece y el sitio se publica igual.
let actividadGuardada

async function leerActividad(github) {
  if (actividadGuardada !== undefined) return actividadGuardada
  actividadGuardada = null
  const usuario = github?.replace(/\/$/, '').split('/').pop()
  if (!usuario) return null
  try {
    const respuesta = await fetch(`https://github.com/users/${usuario}/contributions`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!respuesta.ok) return null
    const html = await respuesta.text()
    const cantidades = new Map(
      [...html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>\s*(\d+|No) contribution/g)].map(([, id, n]) => [
        id,
        n === 'No' ? 0 : Number(n),
      ]),
    )
    const dias = [...html.matchAll(/<td[^>]*data-date="([^"]+)"[^>]*>/g)]
      .map(([celda, fecha]) => ({
        fecha,
        nivel: Number(celda.match(/data-level="(\d)"/)?.[1] ?? 0),
        cantidad: cantidades.get(celda.match(/ id="([^"]+)"/)?.[1]) ?? 0,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
    if (!dias.length) return null
    actividadGuardada = { usuario, total: dias.reduce((n, d) => n + d.cantidad, 0), dias }
  } catch (error) {
    console.warn('No se pudo leer la actividad de GitHub:', error.message)
  }
  return actividadGuardada
}

function leerProyectos() {
  const carpetas = fs
    .readdirSync(PROYECTOS, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_'))

  const proyectos = carpetas.map(({ name: slug }) => {
    const archivo = path.join(PROYECTOS, slug, 'index.md')
    if (!fs.existsSync(archivo)) {
      throw new Error(`contenido/proyectos/${slug}: falta el archivo index.md`)
    }
    const { datos, html } = leerMarkdown(archivo)
    for (const campo of ['titulo', 'resumen']) {
      if (!datos[campo]) {
        throw new Error(`contenido/proyectos/${slug}/index.md: falta el campo "${campo}"`)
      }
    }
    const portada = datos.portada ? path.join(PROYECTOS, slug, datos.portada) : null
    if (portada && !fs.existsSync(portada)) {
      throw new Error(`contenido/proyectos/${slug}: no existe la imagen ${datos.portada}`)
    }
    return {
      slug,
      titulo: String(datos.titulo),
      resumen: String(datos.resumen),
      estado: datos.estado ?? null,
      url: datos.url ?? null,
      codigo: [datos.codigo ?? []].flat(),
      stack: datos.stack ?? [],
      orden: datos.orden ?? 999,
      color: datos.color ?? null,
      html,
      portada,
    }
  })

  return proyectos.sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo, 'es'))
}

// Convierte contenido/ en un módulo de JavaScript. Agregar una carpeta alcanza para
// que el proyecto aparezca: no hay que tocar código ni registrar nada a mano.
export default function contenido() {
  return {
    name: 'contenido',

    resolveId(id) {
      if (id === ID) return RESUELTO
    },

    async load(id) {
      if (id !== RESUELTO) return
      this.addWatchFile(path.join(CONTENIDO, 'perfil.md'))

      const proyectos = leerProyectos()
      const imports = []
      const lista = proyectos.map((p, i) => {
        const { portada, ...resto } = p
        this.addWatchFile(path.join(PROYECTOS, p.slug, 'index.md'))
        if (!portada) return `{...${JSON.stringify(resto)},portada:null}`
        imports.push(`import portada${i} from ${JSON.stringify(portada)}`)
        return `{...${JSON.stringify(resto)},portada:portada${i}}`
      })

      const { foto, ...perfil } = leerPerfil()
      if (foto) imports.push(`import foto from ${JSON.stringify(foto)}`)

      return [
        ...imports,
        `export const perfil = {...${JSON.stringify(perfil)},foto:${foto ? 'foto' : 'null'}}`,
        `export const actividad = ${JSON.stringify(await leerActividad(perfil.github))}`,
        `export const proyectos = [${lista.join(',')}]`,
      ].join('\n')
    },

    configureServer(server) {
      server.watcher.add(CONTENIDO)
      const recargar = (archivo) => {
        if (!path.resolve(archivo).startsWith(CONTENIDO)) return
        const modulo = server.moduleGraph.getModuleById(RESUELTO)
        if (modulo) server.moduleGraph.invalidateModule(modulo)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', recargar)
      server.watcher.on('change', recargar)
      server.watcher.on('unlink', recargar)
    },

    // GitHub Pages sirve archivos estáticos: cada proyecto necesita su propio HTML para
    // abrirse por enlace directo y mostrar su título al compartirse.
    closeBundle() {
      const dist = path.join(RAIZ, 'dist')
      const indice = path.join(dist, 'index.html')
      if (!fs.existsSync(indice)) return
      const html = fs.readFileSync(indice, 'utf8')
      const { nombre, apellido } = leerPerfil()

      fs.writeFileSync(path.join(dist, '404.html'), html)

      for (const p of leerProyectos()) {
        const destino = path.join(dist, 'proyectos', p.slug)
        const titulo = escapar(`${p.titulo}, por ${nombre} ${apellido}`)
        const descripcion = escapar(p.resumen)
        fs.mkdirSync(destino, { recursive: true })
        fs.writeFileSync(
          path.join(destino, 'index.html'),
          html
            .replace(/<title>.*?<\/title>/, `<title>${titulo}</title>`)
            .replace(/(<meta name="description" content=")[^"]*/, `$1${descripcion}`)
            .replace(/(<meta property="og:title" content=")[^"]*/, `$1${titulo}`)
            .replace(/(<meta property="og:description" content=")[^"]*/, `$1${descripcion}`),
        )
      }
    },
  }
}
