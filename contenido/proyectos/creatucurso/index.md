---
titulo: Creá tu curso
resumen: Una plataforma para que cualquier docente venda sus cursos online con su propio nombre, los arme conversando con su asistente de IA y cobre directo en su Mercado Pago.
estado: En desarrollo
url: https://creatucurso.com.ar
portada: portada.jpg
stack:
  - Servidor MCP
  - OAuth
  - Mercado Pago API
  - Cloudflare
orden: 1
---

## El problema

Quien enseña algo y quiere venderlo online suele terminar en un catálogo, compitiendo con miles de cursos y entregando una parte grande de cada venta. Creá tu curso le da a cada docente su propia academia, en su dirección, y el dinero entra en su cuenta de Mercado Pago.

## Armar un curso conversando

La plataforma tiene su propio servidor MCP con inicio de sesión OAuth. El docente conecta Claude, ChatGPT, Gemini o Kimi a su academia, le pasa el temario y sus notas, y el asistente crea el curso, los módulos y las clases y sube los archivos. Todo queda en borrador hasta que el docente lo revisa.

Cada conexión pide permisos separados para leer y para editar, y cada acción del asistente queda registrada en el panel.

## Clases que se juegan

Además de videos, una clase puede ser una actividad web: un juego, una simulación o un ejercicio. Cuando el alumno termina, la actividad envía su puntaje y cuenta para el certificado. Para que nadie apruebe desde el navegador, la actividad puede mandar el resultado firmado desde su propio servidor.

## Videos difíciles de robar

- Cada video se convierte en pedazos cifrados, cada uno con su propia clave: no queda un archivo para descargar.
- La clave se entrega solo mientras un alumno inscripto está mirando.
- Las direcciones de los videos vencen a las 3 horas.
- La inscripción se revisa cada 30 segundos: si hay un reembolso, el acceso se corta en menos de un minuto.

## Cobros y planes

Los alumnos pagan con Mercado Pago y los datos de la tarjeta nunca pasan por la plataforma. Hay tres planes, pensados para cada etapa: solo comisión para empezar sin costo fijo, uno híbrido y un fijo por curso para quien ya vende. La página de precios incluye una calculadora que recomienda el más conveniente.
