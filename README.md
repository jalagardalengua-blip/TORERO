# Embestida

Juego de toros en 3D para el navegador: funciona en móvil, tablet y ordenador, y se puede instalar como app.

**Jugar:** https://jalagardalengua-blip.github.io/TORERO/

## Modos
- **Torear**: capote, muleta y espada.
- **Ser el toro**: bravura hasta el indulto.
- **Encierro**: San Fermín, 848,6 m.
- **Bous al carrer**: recortes y bou embolat.

## Instalar en el móvil
- **Android (Chrome):** abre el enlace, menú ⋮ → *Instalar app* (o *Añadir a pantalla de inicio*).
- **iPhone (Safari):** abre el enlace, botón Compartir → *Añadir a pantalla de inicio*.

Una vez abierto, el juego funciona también sin conexión.

## Controles
- **Táctil:** joystick a la izquierda (aparece donde apoyas el pulgar), botones A/B/X/Y a la derecha, arrastra sobre la plaza para girar la cámara.
- **Teclado:** WASD para moverte, números para los pases, Esc o P para pausar.

## Archivos
| Archivo | Para qué sirve |
|---|---|
| `index.html` | El juego completo (motor WebGL2, sonido, menús, controles) |
| `app.js` | Instalación como app, modo sin conexión y pantalla completa |
| `sw.js` | Guarda el juego en el móvil para jugar sin internet |
| `manifest.webmanifest` | Nombre, icono y colores de la app instalada |
| `icons/` | Iconos de la app |
| `fonts/` | Tipografías del juego, incluidas para jugar sin conexión |
| `.github/workflows/pages.yml` | Publica el juego en GitHub Pages automáticamente |

Al publicar cambios, sube el número de `VERSION` en `sw.js` para que los móviles descarguen la versión nueva.
