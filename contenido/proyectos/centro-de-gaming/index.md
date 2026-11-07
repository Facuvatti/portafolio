---
titulo: Reservas para un centro de gaming
resumen: Un centro de gaming tenía mucha interacción en redes y ninguna página. Les propuse un sistema de reservas, pagos y membresías, y lo presenté con una demo funcionando.
estado: Demo presentada
stack:
  - TypeScript
  - Node.js
  - Express
  - BetterAuth
  - Mercado Pago API
  - Google Calendar API
orden: 2
---

## Antes de programar, escuché

El negocio tenía muy buena respuesta en redes, pero ningún lugar donde convertir esa atención en reservas. Antes de escribir una línea de código, hice scraping de los comentarios de sus reels para saber qué les gustaba a sus clientes, para reforzarlo, y qué no, para corregirlo.

Ahí apareció la clave: el lugar no funcionaba como un coworking sino como un club social. La gente iba a jugar y a conocer gente.

## Primero lo que hacía falta

La idea más atractiva era un sistema de matchmaking para reservar con desconocidos y hacer amigos, pero eso no era un primer paso. La demo arrancó por lo esencial: reservas por franja horaria, limitadas por la cantidad de computadoras disponibles.

Después le pregunté al dueño cómo trabajaba en la práctica. De esa charla salió el flujo de pagos real y un panel para que el administrador registre los cobros.

## Cómo está hecho

- Rutas separadas por funcionalidad: reservas, torneos, membresías, pagos, administración y autenticación.
- Inicio de sesión con BetterAuth, en lugar de reinventarlo.
- Permisos por rol con middlewares: administrador, miembro, miembro VIP y usuario registrado.
- Integraciones con Google Calendar y Mercado Pago, separadas del resto del código.

## Lo que me llevé

Me trabé más de una vez, y lo resolví con paciencia, diagramas y documentos para ordenar las ideas. También aprendí que la demo tendría que haber incluido una página de presentación cuidada: para un negocio que vive de su estética, cómo se ve importa tanto como lo que hace.
