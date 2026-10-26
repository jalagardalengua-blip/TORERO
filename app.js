// Capa de app: instalación (PWA), juego sin conexión y pantalla completa en móvil
'use strict';
(()=>{
// service worker: guarda el juego para jugar sin conexión
if('serviceWorker' in navigator&&location.protocol!=='file:'){
 addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(e=>console.warn('SW:',e))});
}
// pantalla completa: solo en táctiles, fuera de la app instalada y si el navegador lo permite
const de=document.documentElement;
const standalone=matchMedia('(display-mode: standalone),(display-mode: fullscreen)').matches||navigator.standalone;
const canFs=!!(de.requestFullscreen||de.webkitRequestFullscreen);
const isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
const goFs=()=>{if(isFs())return;try{const r=(de.requestFullscreen||de.webkitRequestFullscreen).call(de,{navigationUI:'hide'});r&&r.catch&&r.catch(()=>{})}catch(e){}};
if(!matchMedia('(pointer:coarse)').matches||standalone||!canFs)return;
const b=document.createElement('button');b.id='fsBtn';b.type='button';b.textContent='⛶ Jugar a pantalla completa';const cartel=document.querySelector('.cartel');cartel.insertBefore(b,cartel.firstChild);
const menu=document.getElementById('menu');
const sync=()=>{b.hidden=isFs()||menu.hidden};
b.onclick=goFs;
// al empezar una partida se pasa a pantalla completa
document.addEventListener('click',e=>{if(e.target.closest('.mode,#pOk,.card.bmod,#again'))goFs()},true);
document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);
new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['hidden']});
sync();
})();
