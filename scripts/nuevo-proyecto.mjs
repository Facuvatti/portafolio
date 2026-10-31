#!/usr/bin/env node
// Uso: npm run nuevo "Nombre del proyecto"
import fs from 'node:fs'
import path from 'node:path'

const titulo = process.argv.slice(2).join(' ').trim()

if (!titulo) {
  console.error('Falta el nombre. Ejemplo: npm run nuevo "Mi proyecto"')
  process.exit(1)
}

const slug = titulo
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const proyectos = path.join('contenido', 'proyectos')
const carpeta = path.join(proyectos, slug)

if (fs.existsSync(carpeta)) {
  console.error(`Ya existe ${carpeta}. Editá ese index.md o elegí otro nombre.`)
  process.exit(1)
}

const plantilla = fs.readFileSync(path.join(proyectos, '_plantilla', 'index.md'), 'utf8')

fs.mkdirSync(carpeta)
fs.writeFileSync(path.join(carpeta, 'index.md'), plantilla.replace('Nombre del proyecto', titulo))

console.log(`Listo: ${path.join(carpeta, 'index.md')}`)
console.log('Completalo, guardá la portada en esa carpeta y hacé push a main.')
