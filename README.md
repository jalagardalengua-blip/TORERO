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
Los controles son siempre los mismos; solo se elige la dificultad (Novillero, Matador o Figura).
- **Táctil:** joystick a la izquierda (aparece donde apoyas el pulgar; empújalo al borde para correr) y cuatro botones A/B/X/Y a la derecha. En la plaza cada botón es un tipo de pase: A pase principal (verónica / derechazo), B quite o natural, X remate, Y larga o adorno. Mantén el botón durante el pase para templar y apurar. L es el refugio y «Matar» aparece en la muleta.
- **Teclado:** W A S D para moverte, Shift para correr, Espacio para el pase sugerido, 1-8 para cada pase, Q refugio, F entrar a matar, Esc o P para pausar.
- El aro dorado indica cuándo pulsar: si te adelantas mucho el pase sale precipitado y el toro te busca.

## Archivos
| Archivo | Para qué sirve |
|---|---|
| `index.html` | El juego completo ya montado (se genera con `tools/build.py`) |
| `src/` | Código fuente por módulos: motor, modelos, corrida, estocada, cartel, bous al carrer, controles, encierro |
| `tools/build.py` | Junta `src/` en `index.html` y comprueba la sintaxis |
| `app.js` | Instalación como app, modo sin conexión y pantalla completa |
| `sw.js` | Guarda el juego en el móvil para jugar sin internet |
| `manifest.webmanifest` | Nombre, icono y colores de la app instalada |
| `icons/` | Iconos de la app |
| `fonts/` | Tipografías del juego, incluidas para jugar sin conexión |
| `.github/workflows/pages.yml` | Publica el juego en GitHub Pages automáticamente |

## Desarrollo
1. Edita los archivos de `src/`.
2. Ejecuta `python3 tools/build.py` para regenerar `index.html`.
3. Sube el número de `VERSION` en `sw.js` para que los móviles descarguen la versión nueva.
