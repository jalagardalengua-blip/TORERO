// ================= ARRANQUE =================
R.fx={};
const QUAL={alta:{px:1,sh0:2048,sh1:2048,msaa:4,crowd:.85},media:{px:.85,sh0:2048,sh1:1024,msaa:4,crowd:.62},baja:{px:.62,sh0:1024,sh1:1024,msaa:0,crowd:.35}};
function setQuality(q){G.opts.q=q;Object.assign(R.q,QUAL[q]);rAlloc()}
function menuScene(){Object.assign(ENV,ENV_TARDE);if(W.trkBous){W.trkBous=0;trackInit();PART.length=0}R.pl=null;SCN.ch=[W.arena];TRK.off=0;if(!G.bullSel||G.bullSel.g!==GANADERIAS[G.opts.gan])G.bullSel=newBullData(G.opts.gan);C.data=G.bullSel;C.B=spawnBull(C.data);C.T=spawnTorero(G.opts.traje);
C.B.p=[4.5,0,3];C.B.h=-2.4;C.B.state='fijo';C.T.p=[-1.6,0,-1.8];C.T.hd=M.atan2(C.B.p[0]-C.T.p[0],C.B.p[2]-C.T.p[2]);placeCloth(C.T,true);
$('mGan').textContent=bullInfo(C.data)}

function updMenu(dt,rdt){if(G.prevMode=='encierro'){updEncierro(dt,rdt);return}if(G.prevMode=='bous'){updBous(dt,rdt);return}const B=C.B,T=C.T;if(!B)return;
B.v=M.max(0,B.v-dt*3);if(M.random()<dt*.12)B.paw=1;const want=M.atan2(T.p[0]-B.p[0],T.p[2]-B.p[2]);B.h+=clamp(angDiff(B.h,want),-.6,.6)*dt;B.hum=lerp(B.hum,.25+.2*M.sin(G.t*.5),dt);animBull(B,dt);
if(T.state!='ok'||T.toss){T.toss=null;T.state='ok';T.dropped=0;placeCloth(T,true)}T.pase=null;T.cite=.55+.45*M.sin(G.t*.9);T.spd=0;T.hd=M.atan2(B.p[0]-T.p[0],B.p[2]-T.p[2]);clothStep(T,B,dt);
const fo=G.menuFocus,a=G.t*.05+.8,mid=fo=='tor'?T.p:fo=='toro'?B.p:V.lerp(T.p,B.p,.5),rr=fo=='tor'?4.2:fo=='toro'?6:9.5,ty=fo=='tor'?1.2:fo=='toro'?.9:1.15;CAM.p=V.lerp(CAM.p,[mid[0]+M.sin(a)*rr,1.6+M.sin(G.t*.13)*.5-(fo?.2:0),mid[2]+M.cos(a)*rr],M.min(1,2*rdt));const sh=fo&&innerWidth>700?rr*.42:0;CAM.t=V.lerp(CAM.t,[mid[0]-M.cos(a)*sh,ty,mid[2]+M.sin(a)*sh],M.min(1,3*rdt));CAM.fov=lerp(CAM.fov,40,M.min(1,2*rdt));
ENV.sh0c=[mid[0],0,mid[2]];ENV.sh0h=9;ENV.sh1c=[0,0,0];ENV.sh1h=PLZ.outR+4;R.exc=lerp(R.exc||0,.2,dt);R.fx.spd=0;R.fx.vig=0;R.fx.red=0}
function goMenu(){pauseOff();musica(false);G.mode='menu';G.prevMode=null;G.ts=1;G.cine=null;R.fx={};R.pan=0;hide('hud');hide('result');show('menu');menuScene();setTouch()}
let last=0,qT=0;
function frame(now){requestAnimationFrame(frame);const rdt=M.min(.05,last?(now-last)/1000:.016);last=now;G.fpsAcc.push(rdt);if(G.fpsAcc.length>90)G.fpsAcc.shift();
if(hit('Escape')||hit('KeyP')){if(G.paused)pauseOff();else if(['torero','toro','encierro','bous'].includes(G.mode))pauseOn();else if(G.mode=='result')goMenu()}
if(G.paused){try{render(SCN)}catch(e){}G.prev={...G.keys};return}
const dt=rdt*G.ts;G.dt=dt;G.t+=dt;R.T+=dt;
try{if(G.mode!='torero'){const tq=$('tanda');if(!tq.hidden)tq.hidden=true}assist(dt);if(G.mode=='torero'||G.mode=='toro')updCorrida(dt,rdt);else if(G.mode=='encierro')updEncierro(dt,rdt);else if(G.mode=='bous')updBous(dt,rdt);else updMenu(dt,rdt);if(G.mode!='bous'&&G.prevMode!='bous')R.pl=null;
 touchCtx();publicoTick(rdt);ambience(dt);updParts(dt);pasoTick();if(G.mode!='encierro'&&G.prevMode!='encierro'&&G.mode!='bous'&&G.prevMode!='bous')aoUpd();if(TRK.dirty&&R.frame%6==0){texUpd(R.trkTex,TRK.c);TRK.dirty=0}render(SCN)}catch(e){console.error(e);if(!frame.err){frame.err=1;$('err').hidden=false;$('err').textContent='Error: '+e.message}}
G.prev={...G.keys};
// calidad automática
qT+=rdt;if(qT>4&&G.mode!='menu'&&G.fpsAcc.length>=90){const avg=G.fpsAcc.reduce((a,b)=>a+b,0)/G.fpsAcc.length;if(1/avg<20&&R.q.px>.8){R.q.px=M.max(.78,R.q.px-.08);rAlloc();qT=0}else qT=0}}
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2600)}
// controles táctiles: joystick flotante + botonera en arco contextual
const TOUCH=matchMedia('(pointer:coarse)').matches;if(TOUCH)document.documentElement.classList.add('touch');
const TC={run:0,sig:'',held:{}};
const vib=()=>{try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}};
function setTouch(){const el=$('touch');if(!TOUCH){el.hidden=true;return}const m=G.mode;el.hidden=!(m=='torero'||m=='toro'||m=='encierro'||m=='bous');TC.sig='';TC.alt=0;for(const k of Object.values(TC.held))G.keys[k]=0;TC.held={};if(!el.hidden)touchCtx()}
// botonera según el momento: p principal, s arco de pases, x extras, l botones de mantener a la izquierda
const PSH={'Media verónica':'Media','Larga cambiada de rodillas':'Larga','Pase de pecho':'Pecho','Chicuelina':'Chicue-lina','Manoletina':'Mano-letina','Derechazo':'Derecha-zo','Ayudado por alto':'Ayudado','Trincherilla':'Trinche-rilla','Revolera':'Revo-lera','Circular':'Circu-lar'};
// mando virtual: cruceta de 4 botones (A B X Y), gatillo R para la segunda página de pases, L y botones pequeños
const short=n=>PSH[n]||n;
function padPases(T,code){const L=PASES[T.tool].map(q=>[code(q),short(q.n)]);return{face:{a:L[0],b:L[1],x:L[2],y:L[3]},alt:L.length>4?{a:L[4],b:L[5],x:L[6],y:L[7]}:null}}
function touchSpec(){const m=G.mode,sim=simple();
 if(m=='torero'){const T=C.T;if(!T)return null;
  if(C.kill){const ph=C.kill.ph;return{face:{a:ph=='perfil'?[sim?'Act':'Space','Estocada']:null},hint:ph=='perfil'?'Entra cuando la marca cruce el centro':ph=='cuadrar'?'Cuadrando al toro…':''}}
  const P=padPases(T,q=>(sim?'T':'Digit')+q.k);const mini=[];
  if(sim){if(C.tercio=='muleta')mini.push(['KeyF','Matar']);if(C.askInd)mini.push(['KeyI','Indultar','g']);return{face:{},grid:PASES[T.tool].map(q=>['T'+q.k,q.n.replace('Larga cambiada de rodillas','Larga de rodillas').replace('Ayudado por alto','Ayudado')]),L:['KeyE','Citar'],L2:['Ref','Refugio'],mini}}
  mini.push(['Space','Burladero']);mini.push(T.tool=='capote'?['Tab','Muleta']:['KeyF','Matar']);if(C.askInd)mini.push(['KeyI','Indultar','g']);return{...P,L:['KeyE','Citar'],L2:['ShiftLeft','Apurar'],mini}}
 if(m=='toro')return{face:{a:[sim?'Act':'Space','Embestir'],b:['ShiftLeft','Humillar'],x:['KeyQ','Derrote'],y:['KeyE','Escarbar']}};
 if(m=='encierro')return{face:{a:[sim?'Act':'Space','Esquivar'],b:['ShiftLeft','Esprint'],x:['KeyC','Mirar atrás']}};
 if(m=='bous'){if(sim)return{face:{},grid:[['B1','Recorte'],['B2','Quiebro'],['B3','Salto'],['B4','Anilla'],['B5','Reverso'],['B6','Engaño'],['B7','Quiebro de rodillas'],['B8','Garrocha']],L:['KeyE','Citar'],L2:['Ref','Barrera']};
  return{face:{a:['Digit1','Recorte'],b:['Digit2','Quiebro'],x:['Digit3','Salto'],y:['Digit4','Anilla']},alt:{a:['Digit5','Reverso'],b:['Digit6','Engaño'],x:['Digit7','De rodillas'],y:['Digit8','Garrocha']},L:['KeyE','Citar'],L2:['ShiftLeft','Correr'],mini:[['Space','Barrera']]}}
 return null}
function bindHold(b,k0){b.onpointerdown=e=>{e.preventDefault();const k=b.dataset.k||k0;if(!k)return;try{b.setPointerCapture(e.pointerId)}catch(_){}b.classList.add('on');vib();TC.held[e.pointerId]=k;G.keys[k]=1};
 const up=e=>{const kk=TC.held[e.pointerId];if(kk){delete TC.held[e.pointerId];if(!Object.values(TC.held).includes(kk))G.keys[kk]=0}b.classList.remove('on')};b.onpointerup=b.onpointercancel=b.onlostpointercapture=up;b.oncontextmenu=e=>e.preventDefault()}
function padInit(){if($('pad'))return;const pad=document.createElement('div');pad.id='pad';$('touch').appendChild(pad);
 const mk=(cls,inner)=>{const b=document.createElement('button');b.className=cls;b.innerHTML=inner;pad.appendChild(b);return b};
 TC.f={};for(const[k,l]of[['a','A'],['b','B'],['x','X'],['y','Y']]){const b=mk('fb k'+k,`<i>${l}</i><span></span>`);bindHold(b);TC.f[k]=b}
 const r=mk('sh sr','<i>R</i><span>Más pases</span>');r.onpointerdown=e=>{e.preventDefault();try{r.setPointerCapture(e.pointerId)}catch(_){}TC.alt=1;r.classList.add('on');vib()};const ru=()=>{TC.alt=0;r.classList.remove('on')};r.onpointerup=r.onpointercancel=r.onlostpointercapture=ru;TC.r=r;
 TC.l=mk('sh sl','<i>L</i><span></span>');bindHold(TC.l);TC.l2=mk('sh sl2','<i>L2</i><span></span>');bindHold(TC.l2);
 TC.mini=[0,1,2].map(i=>{const b=mk('mini m'+i,'<span></span>');bindHold(b);return b});TC.g=[0,1,2,3,4,5,6,7].map(i=>{const b=mk('pg g'+i,'<span></span>');bindHold(b);return b})}
function padSet(b,e,cls){if(!e){if(!b.hidden)b.hidden=true;return}if(b.hidden)b.hidden=false;if(b.dataset.k!==e[0]){const old=b.dataset.k;b.dataset.k=e[0];if(old&&b.classList.contains('on')){/* el dedo sigue apoyado: se mantiene la tecla antigua hasta soltar */}}
 const sp=b.querySelector('span');const t=e[1].replace('-','­');if(sp.textContent!==t)sp.textContent=t;b.classList.toggle('gold',e[2]=='g');b.classList.toggle('long',e[1].length>9)}
function touchCtx(){if(!TOUCH||$('touch').hidden)return;padInit();const sp=touchSpec();if(!sp)return;
 TC.g.forEach((b,i)=>padSet(b,(sp.grid||[])[i]));const set=TC.alt&&sp.alt?sp.alt:sp.face;for(const k of['a','b','x','y'])padSet(TC.f[k],set[k]);
 TC.r.hidden=!sp.alt;{const rl=G.mode=='bous'?'Más figuras':'Más pases',rs=TC.r.querySelector('span');if(rs.textContent!==rl)rs.textContent=rl}TC.r.classList.toggle('on',!!TC.alt);padSet(TC.l,sp.L);padSet(TC.l2,sp.L2);TC.mini.forEach((b,i)=>padSet(b,(sp.mini||[])[i]));
 $('thint').textContent=sp.hint||'';$('thint').hidden=!sp.hint;
 // correr empujando el joystick al tope (sin pisar el botón mantenido)
 const shH=Object.values(TC.held).includes('ShiftLeft');
 if(G.mode=='torero'&&C.T&&!C.kill)G.keys.ShiftLeft=shH||(TC.run&&!C.T.pase)?1:0;
 else if(G.mode=='encierro'||G.mode=='bous')G.keys.ShiftLeft=shH||TC.run?1:0}
// joystick flotante: aparece donde se apoya el pulgar
{const z=$('tzone'),base=$('stick'),knob=$('knob');let id=null,cx=0,cy=0;const R0=46;
 const set=(dx,dy)=>{const k=.3;G.keys.KeyW=dy<-k?1:0;G.keys.KeyS=dy>k?1:0;G.keys.KeyA=dx<-k?1:0;G.keys.KeyD=dx>k?1:0;TC.run=M.hypot(dx,dy)>.92?1:0;knob.style.transform=`translate(${dx*R0}px,${dy*R0}px)`};
 z.addEventListener('pointerdown',e=>{if(id!==null)return;id=e.pointerId;z.setPointerCapture(id);cx=e.clientX;cy=e.clientY;base.style.left=cx+'px';base.style.top=cy+'px';base.classList.add('live');vib()});
 z.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;let dx=(e.clientX-cx)/R0,dy=(e.clientY-cy)/R0;const l=M.hypot(dx,dy);
  if(l>1.6){cx+=(e.clientX-cx)*(1-1.6/l);cy+=(e.clientY-cy)*(1-1.6/l);base.style.left=cx+'px';base.style.top=cy+'px';dx=(e.clientX-cx)/R0;dy=(e.clientY-cy)/R0}
  const l2=M.hypot(dx,dy);if(l2>1){dx/=l2;dy/=l2}set(dx,dy)});
 const up=e=>{if(e.pointerId!==id)return;id=null;set(0,0);base.classList.remove('live');base.style.left='';base.style.top=''};z.addEventListener('pointerup',up);z.addEventListener('pointercancel',up)}
// cámara: arrastrar con un dedo sobre la escena
{let id=null,lx=0,ly=0;CV.addEventListener('pointerdown',e=>{if(e.pointerType=='mouse'||id!==null)return;id=e.pointerId;lx=e.clientX;ly=e.clientY});
 addEventListener('pointermove',e=>{if(e.pointerId!==id)return;G.cam.yaw-=(e.clientX-lx)*.006;G.cam.pitch=clamp(G.cam.pitch+(e.clientY-ly)*.004,-.25,.6);lx=e.clientX;ly=e.clientY});
 const up=e=>{if(e.pointerId===id)id=null};addEventListener('pointerup',up);addEventListener('pointercancel',up)}
// menú
function setCtrl(v){v='facil';G.opts.ctrl=v;document.documentElement.classList.toggle('simple',true);TC.sig='';AS.kSig='';if(v=='experto'&&C.T&&(G.mode=='torero'||G.mode=='toro'))$('keys').innerHTML=G.mode=='toro'?keysToro():keysTorero();save()}
function fillMenu(){cartelInit();setCtrl('facil');G.opts.cam='torero';G.opts.suerte='si';G.opts.q='alta';$('optDif').value=String(G.opts.dif||1);G.diff=+(G.opts.dif||1);
$('optDif').onchange=e=>{G.diff=+e.target.value;G.opts.dif=G.diff;save()};
const go=m=>{auInit();if(AU.c&&AU.c.state=='suspended')AU.c.resume();hide('menu');if(m=='encierro'){$('loadTxt').textContent='Engalanando la calle Estafeta…';show('load');setTimeout(()=>{startEncierro();hide('load');setTouch()},40)}else{startCorrida(m);setTouch()}};
window.goBous=id=>{auInit();if(AU.c&&AU.c.state=='suspended')AU.c.resume();hide('menu');$('loadTxt').textContent=W.pueblo?'Sale el toro…':'Montando los cadafals…';show('load');setTimeout(()=>{startBous(id);hide('load');setTouch()},40)};
$('bBous').onclick=()=>openPick('bous');$('bTorero').onclick=()=>go('torero');$('bToro').onclick=()=>go('toro');$('bEnc').onclick=()=>go('encierro');
$('pauseBtn').onclick=()=>pauseOn();$('pResume').onclick=pauseOff;$('pMenu').onclick=goMenu;
$('pRestart').onclick=()=>{const m=G.mode;pauseOff();musica(false);G.cine=null;G.ts=1;R.fx={};if(m=='encierro')startEncierro();else if(m=='bous')startBous(BOU.mod);else startCorrida(m);setTouch()};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseOn()});
$('again').onclick=()=>{const m=G.prevMode;G.prevMode=null;if(m=='encierro'){hide('result');startEncierro()}else if(m=='bous'){hide('result');startBous(BOU.mod)}else startCorrida(m);setTouch()};$('toMenu').onclick=goMenu}
function save(){try{localStorage.setItem('embestida',JSON.stringify(G.opts))}catch(e){}}
function load(){try{const o=JSON.parse(localStorage.getItem('embestida')||'null');if(o)Object.assign(G.opts,o)}catch(e){}}
async function boot(){if(!gl){$('loadTxt').textContent='Tu navegador no tiene WebGL2. Prueba con Chrome, Edge, Firefox o Safari actualizados.';return}
load();G.opts.q='alta';G.diff=+(G.opts.dif||1);
const step=t=>new Promise(r=>{$('loadTxt').textContent=t;setTimeout(r,30)});
try{await step('Tejiendo el capote…');makeTextures();rInit();setQuality('alta');
await step('Levantando los tendidos…');buildArenaWorld();
await step('Embarcando al toro…');fillMenu();menuScene();CAM.p=[8,2,8];
hide('load');show('menu');requestAnimationFrame(frame)}catch(e){console.error(e);$('loadTxt').textContent='No se pudo iniciar: '+e.message}}
window.__G=G;boot();
