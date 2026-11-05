# Portafolio

Sitio de Facundo Vattino: React, Vite y Three.js, publicado en GitHub Pages.

## Agregar un proyecto

Cada proyecto es una carpeta dentro de `contenido/proyectos/`. No hay que tocar código.

**Desde la computadora**

```bash
pnpm nuevo "Nombre del proyecto"
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

Tu nombre, la frase de la portada, tu foto, las áreas de "Lo que hago", el recorrido, los certificados y los enlaces de contacto están en `contenido/perfil.md`. El texto debajo del encabezado es la sección "Sobre mí".

La actividad de GitHub se lee al compilar y el sitio se vuelve a publicar una vez por día para mantenerla al día.

## Desarrollo

```bash
pnpm install
pnpm dev
```

El sitio queda en `http://localhost:5173/`. Para volver a ver el encendido, agregá `?intro` a la dirección. En desarrollo, `?intro&cuadro=6.5` congela la escena en ese segundo.

En un disco NTFS los binarios nativos de Vite no cargan: `node_modules` tiene que estar en un disco Linux, con un enlace simbólico desde el proyecto.

Las dependencias se instalan con pnpm y `ignore-scripts=true` (en `.npmrc`): ningún paquete corre scripts al instalarse.
