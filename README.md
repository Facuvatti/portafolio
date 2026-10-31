# Portafolio

Sitio de Facundo Vattino: React, Vite y Three.js, publicado en GitHub Pages.

## Agregar un proyecto

Cada proyecto es una carpeta dentro de `contenido/proyectos/`. No hay que tocar código.

**Desde la computadora**

```bash
npm run nuevo "Nombre del proyecto"
```

Se crea `contenido/proyectos/nombre-del-proyecto/index.md`. Completalo, guardá la portada en esa misma carpeta y hacé push a `main`.

**Desde la web de GitHub**

Add file, Create new file, y escribí como nombre `contenido/proyectos/mi-proyecto/index.md`. Pegá el contenido de `contenido/proyectos/_plantilla/index.md`, completalo y confirmá el cambio. La imagen se sube con Add file, Upload files, en la misma carpeta.

Cada push a `main` publica el sitio solo.

| Campo | Para qué sirve |
| --- | --- |
| `titulo`, `resumen` | Obligatorios. |
| `estado` | Etiqueta opcional, por ejemplo `En desarrollo`. |
| `url` | Enlace al sitio. |
| `codigo` | Repositorio, o una lista si son varios. |
| `portada` | Nombre de la imagen dentro de la carpeta. |
| `stack` | Lista de tecnologías. |
| `orden` | Número para ordenar: el menor va primero. |
| `color` | Color del LED. Si falta, se asigna solo. |

El texto debajo del encabezado aparece en la página propia del proyecto.

Las carpetas `ejemplo-*` son proyectos ficticios: borralas cuando cargues los tuyos.

Tu nombre, tu rol, los enlaces de contacto y la sección "Sobre mí" están en `contenido/perfil.md`.

## Desarrollo

```bash
npm install
npm run dev
```

El sitio queda en `http://localhost:5173/portafolio/`. Para volver a ver el encendido, agregá `?intro` a la dirección. En desarrollo, `?intro&cuadro=6.5` congela la escena en ese segundo.

En un disco NTFS los binarios nativos de Vite no cargan: `node_modules` tiene que estar en un disco Linux, con un enlace simbólico desde el proyecto.
