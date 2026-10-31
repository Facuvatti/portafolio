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
  return { tecnologias: [], ...datos, html }
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

  proyectos.sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo, 'es'))

  // Cada proyecto recibe un tramo del espectro, salvo el azul, que es el fondo del sitio.
  return proyectos.map((p, i) => ({
    ...p,
    color: p.color ?? `hsl(${(325 + (i * 215) / Math.max(proyectos.length - 1, 1)) % 360} 100% 68%)`,
  }))
}

// Convierte contenido/ en un módulo de JavaScript. Agregar una carpeta alcanza para
// que el proyecto aparezca: no hay que tocar código ni registrar nada a mano.
export default function contenido() {
  return {
    name: 'contenido',

    resolveId(id) {
      if (id === ID) return RESUELTO
    },

    load(id) {
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

      return [
        ...imports,
        `export const perfil = ${JSON.stringify(leerPerfil())}`,
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
