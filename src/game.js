// ================= JUEGO =================
const $=id=>document.getElementById(id);
const SCN=new Node();
const G={mode:'menu',t:0,ts:1,keys:{},prev:{},opts:{traje:'Azul y oro',gan:0,q:'media'},cam:{yaw:0,pitch:0,zoom:1,drag:0},cine:null,fps:60,fpsAcc:[],autoQ:0};
const key=c=>!!G.keys[c],hit=c=>!!G.keys[c]&&!G.prev[c];
addEventListener('keydown',e=>{if(['Space','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();G.keys[e.code]=1});
addEventListener('keyup',e=>{G.keys[e.code]=0});addEventListener('blur',()=>{G.keys={}});
CV.addEventListener('pointerdown',e=>{if(e.pointerType=='mouse'){G.cam.drag=1;G.cam.lx=e.clientX;G.cam.ly=e.clientY}});
addEventListener('pointerup',()=>G.cam.drag=0);addEventListener('pointermove',e=>{if(G.cam.drag){G.cam.yaw-=(e.clientX-G.cam.lx)*.005;G.cam.pitch=clamp(G.cam.pitch+(e.clientY-G.cam.ly)*.003,-.25,.6);G.cam.lx=e.clientX;G.cam.ly=e.clientY}});
CV.addEventListener('wheel',e=>{G.cam.zoom=clamp(G.cam.zoom+e.deltaY*.0008,.6,1.8)},{passive:true});
const GANADERIAS=[
{n:'Hnos. Valdecañas',enc:'Domecq',capas:['negro','negro','castano'],div:[[.5,.02,.02],[.85,.85,.85]],bravura:.85,nobleza:.85,fuerza:.6,size:1,horn:'veleto'},
{n:'El Torreón',enc:'Santa Coloma',capas:['cardeno','cardeno','negro'],div:[[.03,.25,.08],[.9,.65,.05]],bravura:.9,nobleza:.55,fuerza:.65,size:.94,horn:'cornidelantero'},
{n:'Monteviejo',enc:'Miura',capas:['castano','colorado','negro'],div:[[.4,.03,.25],[.02,.02,.02]],bravura:.72,nobleza:.35,fuerza:.95,size:1.1,horn:'corniabierto'},
{n:'Las Albercas',enc:'Albaserrada',capas:['cardeno','cardeno'],div:[[.08,.2,.55],[.9,.9,.9]],bravura:.82,nobleza:.5,fuerza:.75,size:.95,horn:'cornidelantero',dark:1},
{n:'Peñalara',enc:'Núñez',capas:['negro','colorado','berrendo'],div:[[.55,.35,.04],[.06,.06,.3]],bravura:.8,nobleza:.75,fuerza:.7,size:1.02,horn:'veleto'}];
const NOMBRES=['Jaranero','Bravío','Pajarito','Romerito','Cuchillero','Escribano','Lumbrero','Malagueño','Comisario','Granadino','Soberbio','Ratonero','Volantero','Arrogante','Carcelero','Chispero','Esparraguero','Mirlito','Perdigón','Recental','Trianero','Zapatero','Bonito','Feligrés','Manzanito','Embajador','Cartujano','Velador','Gavilán','Oropel','Lucero','Caramelo','Barbero','Ventolero','Rumboso','Pocapena','Bailador','Tabernero','Clavelito','Hortelano','Campanero','Gitanillo','Navajito','Cantinero','Lagartijo'];
const CAPA_TXT={negro:'Negro',castano:'Castaño',colorado:'Colorado',cardeno:'Cárdeno',berrendo:'Berrendo en negro',jabonero:'Jabonero',ensabanado:'Ensabanado',salinero:'Salinero',sardo:'Sardo',chorreado:'Castaño chorreado'};
function newBullData(gi,used){const g=GANADERIAS[gi],pk=a=>a[(M.random()*a.length)|0];let name;do{name=pk(NOMBRES)}while(used&&used.includes(name));const capa=pk(g.capas);
const v=k=>clamp(g[k]+rnd(-.12,.12),.2,1),edad=M.random()<.55?4:5,horn=g.hornAlt&&M.random()<.35?pk(g.hornAlt):g.horn;const peso=M.round(470+g.size*60+rnd(-15,35)+(edad-4)*22);
return{g,capa,name,num:((M.random()*90)|0)+2,peso,seed:rnd(0,99),brav:v('bravura'),nob:v('nobleza'),fz:v('fuerza'),horn,edad,nac:pk(['Enero','Febrero','Marzo','Abril','Mayo','Junio','Octubre','Noviembre','Diciembre'])+' de '+(2026-edad),trapio:clamp((peso-470)/120*.6+(/abierto|playero/.test(horn)?.35:.2)+(g.size-.9),0,1)}}
// ---------- AUDIO ----------
const AU={};
function auInit(){if(AU.c)return;try{const c=new(window.AudioContext||window.webkitAudioContext)();AU.c=c;AU.out=c.createDynamicsCompressor();AU.out.connect(c.destination);AU.m=c.createGain();AU.m.gain.value=.9;AU.m.connect(AU.out);
const len=c.sampleRate*3,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<len;i++){l=(l+.02*(M.random()*2-1))/1.02;d[i]=l*3.2}AU.brown=b;
const wb=c.createBuffer(1,c.sampleRate,c.sampleRate),wd=wb.getChannelData(0);for(let i=0;i<wd.length;i++)wd[i]=M.random()*2-1;AU.white=wb;
const s=c.createBufferSource();s.buffer=b;s.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=650;f.Q.value=.6;AU.crowd=c.createGain();AU.crowd.gain.value=0;s.connect(f);f.connect(AU.crowd);AU.crowd.connect(AU.m);s.start();
const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.23;lg.gain.value=180;lfo.connect(lg);lg.connect(f.frequency);lfo.start()}catch(e){AU.c=null}}
function crowdLevel(v){if(AU.c)AU.crowd.gain.setTargetAtTime(v,AU.c.currentTime,.4)}
function noiseHit(t,dur,freq,q,g,type='bandpass',src='white'){const c=AU.c;if(!c)return;const s=c.createBufferSource();s.buffer=AU[src];const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const a=c.createGain();
a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(g,t+.01);a.gain.exponentialRampToValueAtTime(.0005,t+dur);s.connect(f);f.connect(a);a.connect(AU.m);s.start(t,rnd(0,.5));s.stop(t+dur+.05);return f}
function ole(k=1){const c=AU.c;if(!c)return;const t=c.currentTime;const base=[147,165,175,196,220,247,262];for(let v=0;v<7;v++){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=base[v]*rnd(.98,1.02);
const f1=c.createBiquadFilter(),f2=c.createBiquadFilter();f1.type=f2.type='bandpass';f1.Q.value=6;f2.Q.value=8;f1.frequency.setValueAtTime(520,t);f2.frequency.setValueAtTime(880,t);f1.frequency.linearRampToValueAtTime(420,t+.45);f2.frequency.linearRampToValueAtTime(1900,t+.5);
const a=c.createGain();a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(.05*k,t+.18);a.gain.setValueAtTime(.05*k,t+.4);a.gain.exponentialRampToValueAtTime(.0005,t+1.3);o.connect(f1);o.connect(f2);f1.connect(a);f2.connect(a);a.connect(AU.m);o.start(t+rnd(0,.06));o.stop(t+1.4)}
noiseHit(t,1.4,700,.5,.5*k,'bandpass','brown')}
function gasp(){const c=AU.c;if(!c)return;const t=c.currentTime;const f=noiseHit(t,.9,900,1.2,.9,'bandpass','brown');if(f)f.frequency.exponentialRampToValueAtTime(380,t+.8)}
function clarin(){const c=AU.c;if(!c)return;let t=c.currentTime+.05;const notes=[[523,.18],[392,.18],[523,.18],[659,.36],[523,.18],[659,.18],[784,.7]];
for(const[f,d]of notes){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=f;const v=c.createOscillator(),vg=c.createGain();v.frequency.value=5.5;vg.gain.value=4;v.connect(vg);vg.connect(o.frequency);
const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;const a=c.createGain();a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(.12,t+.03);a.gain.setValueAtTime(.12,t+d*.8);a.gain.linearRampToValueAtTime(0,t+d);
o.connect(lp);lp.connect(a);a.connect(AU.m);o.start(t);v.start(t);o.stop(t+d+.02);v.stop(t+d+.02);t+=d}
noiseHit(c.currentTime+.05,.5,120,1,.5,'lowpass','brown')}
function hoof(g=.25){if(!AU.c)return;noiseHit(AU.c.currentTime,.09,140,1.5,g,'lowpass','white')}
function snort(){if(!AU.c)return;noiseHit(AU.c.currentTime,.5,420,.8,.35)}
function bellS(g=.06){const c=AU.c;if(!c)return;const t=c.currentTime;for(const f of[620,1010,1530,2240]){const o=c.createOscillator();o.frequency.value=f*rnd(.99,1.01);const a=c.createGain();a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.0005,t+.5);o.connect(a);a.connect(AU.m);o.start(t);o.stop(t+.55)}}
function cohete(){const c=AU.c;if(!c)return;const t=c.currentTime;const o=c.createOscillator();o.type='triangle';o.frequency.setValueAtTime(600,t);o.frequency.exponentialRampToValueAtTime(2400,t+1.1);const a=c.createGain();a.gain.setValueAtTime(.05,t);a.gain.linearRampToValueAtTime(0,t+1.1);o.connect(a);a.connect(AU.m);o.start(t);o.stop(t+1.15);noiseHit(t+1.15,1.6,300,.4,1.2,'lowpass','brown')}
// pasodoble sintetizado
const PASO={on:0,next:0,step:0};const MEL=[69,0,74,0,76,77,76,74,73,0,69,0,70,0,69,0,74,0,77,0,81,79,77,76,77,0,76,74,73,0,0,0,69,0,74,0,76,77,76,74,73,0,77,76,74,73,71,0,69,70,69,67,65,64,65,67,69,0,0,0,0,0,0,0];
const BAS=[50,0,57,0,50,0,57,0,45,0,52,0,45,0,52,0,50,0,57,0,50,0,57,0,45,0,52,0,45,0,52,0];
function pasoTick(){const c=AU.c;if(!c||!PASO.on)return;const sp=.16;while(PASO.next<c.currentTime+.25){const t=PASO.next,i=PASO.step%64,n=MEL[i],b=BAS[(i>>1)%32];
if(n){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=440*M.pow(2,(n-69)/12);const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2200;const a=c.createGain();
a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(.05,t+.02);a.gain.exponentialRampToValueAtTime(.002,t+sp*1.8);o.connect(lp);lp.connect(a);a.connect(AU.m);o.start(t);o.stop(t+sp*2)}
if(b&&i%2==0){const o=c.createOscillator();o.type='triangle';o.frequency.value=440*M.pow(2,(b-69)/12);const a=c.createGain();a.gain.setValueAtTime(.09,t);a.gain.exponentialRampToValueAtTime(.002,t+sp*1.6);o.connect(a);a.connect(AU.m);o.start(t);o.stop(t+sp*1.7)}
if(i%4==2)noiseHit(t,.09,2500,.8,.05,'highpass');PASO.next+=sp;PASO.step++}}
function musica(on){if(!AU.c)return;if(on&&!PASO.on){PASO.on=1;PASO.next=AU.c.currentTime+.1;PASO.step=0;say('¡Música, maestro!',1)}PASO.on=on?1:0}
// ---------- HUD ----------
function say(t,big=0,cls=''){const e=$('call');e.textContent=t;e.className='show '+(big?'big ':'')+cls;clearTimeout(say.t);say.t=setTimeout(()=>e.className='',big?1800:1200)}
function bar(id,v){$(id).style.width=(clamp(v,0,1)*100).toFixed(1)+'%'}
// ---------- ESCENA DE LA PLAZA ----------
const W={};
function buildArenaWorld(){W.arena=new Node();W.plaza=buildPlaza(W.arena,R.q);trackInit()}
function spawnBull(data){if(W.bullN)W.arena.ch=W.arena.ch.filter(n=>n!==W.bullN);const g=data.g;
const m=buildBull({capa:data.capa,size:g.size*(.97+data.peso/540*.03),seed:data.seed,horn:data.horn||g.horn,darkHorn:g.dark,divisa:g.div});W.bullN=m.root;W.arena.add(m.root);
return{m,d:data,p:[0,0,PLZ.R-2],h:PI,v:0,yr:0,state:'salida',stT:0,fuerza:1,brav:data.brav??g.bravura,nob:data.nob??g.nobleza,fz:data.fz??g.fuerza,ph:0,hum:0,der:0,paw:0,react:1,rec:0,passes:0,hd:[0,0,0,0],lastSn:0}}
function spawnTorero(traje){if(W.torN)W.arena.ch=W.arena.ch.filter(n=>n!==W.torN&&n!==W.capN&&n!==W.mulN);const tr=TOR();const h=buildHuman({kind:'torero',traje,skin:tr.skin});h.root.s=tr.h;W.torN=h.root;W.arena.add(h.root);
const cap=new Cloth(20,15,1.38,1.05,{mat:mat({base:[.75,.05,.32],back:[.95,.62,.03],rough:.62,sheen:.55,sheenC:[1,.6,.8],mode:3,det:TX.clothN,detS:.4,duv:[8,8]}),col:(u,v)=>v<.08?[.55,.04,.25,0]:[1,1,1,0]});
const mul=new Cloth(16,11,.95,.58,{mat:mat({base:[.5,.012,.018],back:[.42,.01,.015],rough:.7,sheen:.6,sheenC:[1,.3,.3],mode:3,det:TX.clothN,detS:.5,duv:[8,8]})});
W.capN=cap.node;W.mulN=mul.node;W.arena.add(cap.node);W.arena.add(mul.node);
return{h,cap,mul,p:[0,0,-4],h0:0,hd:0,vel:[0,0],tool:'capote',pase:null,cite:0,state:'ok',inv:0,cogidas:0,ph:0,spd:0,lastEnd:-9,lastPos:[0,0,0],combo:0,rep:{id:null,n:0},refugio:null,toss:null,dropped:0,twist:0,lean:0,kneel:0,spin:0,pts:0,log:[],moveAcc:0,ai:{t:0}}}
// ---------- PASES ----------
const ez=u=>u<.5?2*u*u:1-M.pow(-2*u+2,2)/2;
const PASES={
capote:[
{id:'veronica',n:'Verónica',k:'1',pts:6,dur:1.45,both:1,f:(u,s)=>{const e=ez(u);return{c:[s*lerp(.74,1.0,e),1.1-.06*M.sin(PI*u),lerp(.78,-.55,e)],th:s*lerp(.25,1.1,e),hw:.44,tw:-s*lerp(.05,.85,e),ln:.14}}},
{id:'chicuelina',n:'Chicuelina',k:'2',pts:9,dur:1.6,both:1,f:(u,s)=>{const e=ez(M.min(1,u/.62));const sp=sstep(.55,1,u);return{c:[s*lerp(.62,.75,e)*(1-sp*.45),1.08,lerp(.78,-.25,e)],th:s*lerp(.25,.9,e),hw:lerp(.44,.18,sp),tw:-s*lerp(.05,.6,e),ln:.1,spin:-s*TAU*sp*.92}}},
{id:'gaonera',n:'Gaonera',k:'3',pts:11,dur:1.6,both:1,back:1,f:(u,s)=>{const e=ez(u);return{c:[s*lerp(.55,1.0,e),1.02,lerp(.05,-.45,e)],th:s*lerp(-.2,.45,e),hw:.46,tw:-s*lerp(-.15,.35,e),ln:-.08}}},
{id:'media',n:'Media verónica',k:'4',pts:5,dur:1.05,both:1,remate:1,f:(u,s)=>{const e=ez(u);return{c:[s*lerp(.62,.55,e),lerp(1.1,.86,e),lerp(.75,-.2,e)],th:s*lerp(.25,1.45,e),hw:lerp(.44,.12,e),tw:-s*lerp(.05,.95,e),ln:.18}}},
{id:'larga',n:'Larga cambiada de rodillas',k:'5',pts:14,dur:1.7,kneel:1,f:(u,s)=>{const e=ez(u);return{c:[s*lerp(.95,-1.0,e),.72+.6*M.sin(PI*e),lerp(.75,-.5,e)],th:s*lerp(.3,-1.2,e),hw:0,one:'R',tw:-s*lerp(-.3,.6,e),ln:0}}},
{id:'delantal',n:'Delantal',k:'6',pts:8,dur:1.4,both:1,f:(u,s)=>{const e=ez(u);return{c:[s*lerp(.72,.98,e),.86-.05*M.sin(PI*u),lerp(.75,-.5,e)],th:s*lerp(.1,.95,e),hw:.34,tw:-s*lerp(0,.65,e),ln:.06}}},
{id:'farol',n:'Farol',k:'7',pts:11,dur:1.55,both:1,f:(u,s)=>{const e=ez(u);return{c:[s*(lerp(.74,.95,e)-.25*M.sin(PI*e)),1.1+.7*M.sin(PI*e),lerp(.78,-.45,e)],th:s*lerp(.25,1.7,e),hw:lerp(.44,.3,e),tw:-s*lerp(0,.55,e),ln:-.05}}},
{id:'revolera',n:'Revolera',k:'8',pts:7,dur:1.25,remate:1,one:'R',f:(u,s)=>{const e=ez(M.min(1,u/.5));const sp=sstep(.35,1,u);return{c:[s*lerp(.72,.62,e),lerp(1.1,1.3,sp),lerp(.72,-.2,e)],th:s*lerp(.3,1.2,e),hw:lerp(.44,.05,sp),tw:-s*.4,ln:.05,spin:-s*TAU*sp}}}],
muleta:[
{id:'derechazo',n:'Derechazo',k:'1',pts:7,dur:1.55,one:'R',side:1,f:(u,s)=>{const e=ez(u);return{c:[lerp(.68,1.0,e),.8+.08*M.sin(PI*u),lerp(.82,-.6,e)],th:lerp(1.1,.15,e),tw:-lerp(0,.9,e),ln:.12}}},
{id:'natural',n:'Natural',k:'2',pts:10,dur:1.6,one:'L',side:-1,f:(u,s)=>{const e=ez(u);return{c:[-lerp(.68,1.0,e),.8+.08*M.sin(PI*u),lerp(.82,-.6,e)],th:PI-lerp(1.1,.15,e),tw:lerp(0,.9,e),ln:.12}}},
{id:'pecho',n:'Pase de pecho',k:'3',pts:6,dur:1.2,one:'L',remate:1,f:(u,s)=>{const e=ez(u);return{c:[s*lerp(.55,.75,e),lerp(.95,1.65,M.sin(e*PI*.6)),lerp(.8,-.4,e)],th:s<0?PI-lerp(.9,.3,e):lerp(.9,.3,e),tw:-s*lerp(0,.6,e),ln:-.12}}},
{id:'molinete',n:'Molinete',k:'4',pts:12,dur:1.55,one:'R',f:(u,s)=>{const e=ez(M.min(1,u/.6));const sp=sstep(.4,1,u);return{c:[s*lerp(.7,.6,e)*(1-sp*.5),.95,lerp(.8,-.2,e)],th:s<0?PI-.6:.6,tw:-s*.3,ln:.05,spin:-s*TAU*sp}}},
{id:'manoletina',n:'Manoletina',k:'5',pts:11,dur:1.5,one:'R',back:1,f:(u,s)=>{const e=ez(u);return{c:[s*lerp(.6,.95,e),1.28,lerp(0,-.45,e)],th:s<0?PI-lerp(-.1,.5,e):lerp(-.1,.5,e),tw:-s*lerp(-.15,.3,e),ln:-.1,high:1}}},
{id:'ayudado',n:'Ayudado por alto',k:'6',pts:7,dur:1.35,one:'R',f:(u,s)=>{const e=ez(u);return{c:[s*lerp(.7,.92,e),lerp(1.15,1.5,M.sin(e*PI*.7)),lerp(.8,-.4,e)],th:s<0?PI-lerp(.9,.2,e):lerp(.9,.2,e),tw:-s*lerp(0,.45,e),ln:-.1,high:1}}},
{id:'trincherilla',n:'Trincherilla',k:'7',pts:10,dur:1.3,one:'R',remate:1,f:(u,s)=>{const e=ez(u);return{c:[s*lerp(.7,.92,e),lerp(.72,.38,e),lerp(.82,-.45,e)],th:s<0?PI-lerp(1,.1,e):lerp(1,.1,e),tw:-s*lerp(0,.7,e),ln:.22}}},
{id:'circular',n:'Circular',k:'8',pts:14,dur:1.95,one:'R',side:1,f:(u,s)=>{const e=ez(u);const sp=sstep(.55,1,u);return{c:[lerp(.68,.95,e),.78,lerp(.85,-.95,e)],th:lerp(1.1,-.2,e),tw:-lerp(0,1.1,e),ln:.14,spin:-.95*sp}}}]};
// ---------- ESTADO DE LA CORRIDA ----------
const C={};
function bullInfo(d){return`Nº ${d.num} · «${d.name}» · ${d.peso} kg · ${CAPA_TXT[d.capa]} · ${d.g.n} (encaste ${d.g.enc})`}
function startCorrida(mode){G.mode=mode;Object.assign(ENV,ENV_TARDE);SCN.ch=[W.arena];TRK.off=0;trackInit();
G.ai=mode=='toro';C.data=G.bullSel&&G.bullSel.g===GANADERIAS[G.opts.gan]?G.bullSel:newBullData(G.opts.gan);C.B=spawnBull(C.data);C.T=spawnTorero(G.opts.traje);C.t=0;C.tercio='capote';C.tT=0;C.avisos=0;C.score=0;C.brav=0;C.over=0;C.pan=0;C.musicOn=0;C.lastCharge=0;C.events=[];C.passCount=0;C.best=0;C.emb=0;C.cogT=0;C.kill=null;C.askInd=0;C.camY=undefined;C.fy=undefined;if(SWORD)attach(SWORD,null);
const B=C.B,Tt=C.T;B.p=[0,0,PLZ.R-1.2];B.h=PI;B.state='salida';B.stT=0;B.sal=[rnd(-8,8),0,-PLZ.R+5];Tt.p=mode=='toro'?[rnd(-3,3),0,-6]:[-3.5,0,-7];Tt.hd=0;Tt.tool='capote';
G.cam.yaw=0;G.cam.pitch=0;placeCloth(Tt,true);
$('hudTitle').textContent=mode=='toro'?'Eres el toro':'Tercio de capote';$('hudSub').textContent=bullInfo(C.data);
$('keys').innerHTML=mode=='toro'?keysToro():keysTorero();$('fzLbl').textContent='Fuerza del toro';$('scoreLbl').textContent=mode=='toro'?'Bravura':'Faena';
dirInit(mode);show('hud');hide('menu');hide('result');clarin();crowdLevel(.12);say(mode=='toro'?'¡Sale el toro!':'Sale «'+C.data.name+'»',1);R.exc=.3;R.pan=0}
function keysTorero(){const p=PASES[C.T?C.T.tool:'capote'];return`<div class="kg"><b>W A S D</b> moverse · <b>Shift</b> correr · <b>E</b> citar · <b>A/D</b> al iniciar el pase elige el pitón</div><div class="kg">${p.map(x=>`<span><b>${x.k}</b> ${x.n}</span>`).join('')}</div><div class="kg"><b>Mantén</b> la tecla del pase para templar · <b>Shift</b> durante el pase: apurar · <b>Tab</b> cambio de tercio · <b>Espacio</b> burladero · <b>F</b> ${killEnabled()?'entrar a matar':'terminar faena'}</div>`}
function keysToro(){return`<div class="kg"><b>W</b> avanzar · <b>S</b> frenar · <b>A/D</b> girar · <b>Espacio</b> embestir · <b>Shift</b> humillar al llegar al engaño</div><div class="kg">Arranca de lejos, humilla en el engaño y repite: así se gana el indulto</div>`}
function lureOf(T){if(T.state!='ok'||T.refugio||!T.lureT)return null;if(T.pase||T.cite>0)return V.madd(T.lureT,T.lureV||[0,0,0],.22);return null}
function hornTips(B){const s=B.m.sz;return[-1,1].map(k=>m4.pt(B.m.head.w,[k*.3*s,.4*s,.26*s]))}
// --- colocar la tela y las manos
function rightOf(h){return[-M.cos(h),0,M.sin(h)]}function fwdOf(h){return[M.sin(h),0,M.cos(h)]}
function loc(T,h,c){const r=rightOf(h),f=fwdOf(h);return[T.p[0]+r[0]*c[0]+f[0]*c[2],c[1]+(T.toss?T.toss.y:0),T.p[2]+r[2]*c[0]+f[2]*c[2]]}
function holdPose(T){const t=G.t;let P;
if(T.pase){const ps=T.pase,q=ps.def.f(ps.u,ps.s);if(ps.temp&&!q.high)q.c=[q.c[0],q.c[1]-.16*ps.temp*M.sin(PI*M.min(1,ps.u*1.2)),q.c[2]];if(ps.ap)q.c=[q.c[0]*(1-apurarMax()*ps.ap),q.c[1],q.c[2]];P={...q,h:ps.h0,one:q.one||ps.def.one,back:ps.def.back,high:q.high}}
else if(C.kill&&T.tool=='muleta'){const K=C.kill,en=K.ph=='entrada';P={c:[-.32,en?.55:.72,en?.6:.42],th:PI-.5,tw:en?-.2:0,ln:en?.35:.04,h:T.hd,one:'L'}}
else if(T.tool=='capote'){const cite=T.cite;const sh=M.sin(t*7)*.1*cite;const cs=-(T.lastSide||-1)*.32*cite;P={c:[sh+cs,lerp(1.0,1.12,cite),lerp(.42,.66,cite)],th:sh*.6,hw:lerp(.36,.44,cite),tw:0,ln:.06*cite,h:T.hd}}
else{const cite=T.cite;const sh=M.sin(t*6)*.08*cite;P={c:[lerp(-.28,.32,cite)+sh,lerp(.78,.92,cite),lerp(.25,.62,cite)],th:lerp(-1.3,-.3,cite),tw:0,ln:.05*cite,h:T.hd,one:'R'}}
if(!T.pase&&T.pp&&!C.kill){const tt=G.t-T.lastEnd,w=sstep(.35,1.0,tt);if(w<1){const pp=T.pp,q=pp.def.f(1,pp.s),E={...q,h:pp.h0,one:q.one||pp.def.one};
 const L=(a,b)=>lerp(a??0,b??0,w);P={...P,c:[L(E.c[0],P.c[0]),L(E.c[1],P.c[1]),L(E.c[2],P.c[2])],th:L(E.th,P.th),hw:P.hw!==undefined||E.hw!==undefined?L(E.hw??.44,P.hw??.44):undefined,tw:L(E.tw,P.tw),ln:L(E.ln,P.ln),h:E.h+angDiff(E.h,P.h)*w,one:w<.5?E.one:P.one}}else T.pp=null}
return P}
function capPins(cl,a,b){const o=[],n=cl.nx-5;for(let i=0;i<=n;i++){const t=i/n,p=V.lerp(a,b,t);p[1]-=.045*M.sin(PI*t);o.push([2+i,p])}return o}
function placeCloth(T,init){const P=holdPose(T),h=P.h+(P.spin||0)*0,c=loc(T,h,P.c);if(T.lureT&&!init){T.lureV=V.lerp(T.lureV||[0,0,0],V.sc(V.sub(c,T.lureT),1/M.max(G.dt||.016,.005)),.3)}else T.lureV=[0,0,0];T.lureT=c;const r=rightOf(h),f=fwdOf(h),wd=V.norm(V.add(V.sc(r,M.cos(P.th)),V.sc(f,M.sin(P.th))));
T.hands=null;const cl=T.tool=='capote'?T.cap:T.mul,other=T.tool=='capote'?T.mul:T.cap;
if(T.tool=='capote'){if(P.one){const hr=c;T.hands={R:hr,L:null};T.pins=[[2,V.madd(hr,wd,-.08)],[3,V.madd(hr,wd,.08)]]}
else{const span=(cl.nx-5)/(cl.nx-1)*1.38/2*clamp(P.hw/.44,.3,1.05);const hr=V.madd(c,wd,span),hl=V.madd(c,wd,-span);T.hands={R:hr,L:hl};T.pins=capPins(cl,hr,hl)}}
else{const hd=P.one=='L'?'L':'R';const st=V.norm(V.add(V.sc(r,M.cos(P.th)),V.sc(f,M.sin(P.th))));const hand=V.madd(c,st,-.38);T.hands={[hd]:hand};T.pins=[];for(let i=0;i<cl.nx;i++)T.pins.push([i,V.madd(V.add(hand,[0,.01,0]),st,-.04+i/(cl.nx-1)*.86)])}
if(init){cl.place((u,v)=>{const pa=T.pins[0][1],pb=T.pins[T.pins.length-1][1];return[lerp(pa[0],pb[0],u)*(1)+0,lerp(pa[1],pb[1],u)-v*(T.tool=='capote'?1.05:.58),lerp(pa[2],pb[2],u)]});
other.place(()=>[T.p[0],-5,T.p[2]])}}
// --- animación humana
function animHuman(Hm,A,dt){const sp=A.speed||0,asp=M.abs(sp),run=sstep(1.6,4.5,asp);const ph=(A.ph||0)+sp*dt/lerp(1.25,2.6,run);const c=ph*TAU,amp=clamp(asp/1.4,0,1)*lerp(.45,.85,run)*(sp<0?.7:1);const stp=A.step||0,hy=A.hy||0;Hm.hips.r=[0,hy,0];
const kn=A.kneel||0,st=(A.stance||0)*(1-run)*(1-kn);Hm.hips.p[1]=lerp(.93-.035*run+M.abs(M.sin(c))*.045*run-st*.05,.5,kn);
Hm.legs.forEach((L,i)=>{const s=i?1:-1,q=M.sin(c+(i?PI:0));const fw=M.sign(stp)==s?M.abs(stp):0,bk=M.sign(stp)==-s?M.abs(stp):0;L.th.r=[lerp(-q*amp,0,kn)-(A.crouch||0)*.5-st*.16-fw*.42+bk*.14,0,s*st*.16];L.kn.r=[lerp(M.max(0,-M.cos(c+(i?PI:0)))*amp*1.5+.05,PI/2,kn)+(A.crouch||0)*.9+st*.3+fw*.3,0,0];L.an.r=[lerp(0,-.3,kn)-st*.14,0,-s*st*.12]});
Hm.spine.r=[(A.lean||0)+run*.22+M.sin(G.t*1.6)*.012,(A.tw||0)-hy,(A.roll||0)];Hm.neck.r=[-(A.lean||0)*.5-run*.15,clamp(A.look||0,-1.1,1.1)*.6,0];Hm.head.r=[0,clamp(A.look||0,-1.1,1.1)*.4,0];
Hm.arms.forEach((a,i)=>{if(A.free&&A.free[i]){const q=M.sin(c+(i?0:PI));a.sh.q=Q.euler(q*amp*.8-.05,0,(i?-1:1)*-.12);a.el.q=Q.euler(-.3-run*1.1,0,0)}});return ph}
function poseTorero(T,dt){const Hm=T.h,P=holdPose(T);let h=P.h+(P.spin||0);if(!T.pase)h=T.hd;
Hm.root.p=[T.p[0],T.toss?T.toss.y:0,T.p[2]];Hm.root.r=[T.toss?T.toss.rx:0,h,T.toss?T.toss.rz:0];
const B=C.B;const look=angDiff(h,M.atan2(B.p[0]-T.p[0],B.p[2]-T.p[2]));
T.stum=M.max(0,(T.stum||0)-dt*1.6);const tpv=T.pase?T.pase.temp||0:0;T.twist=lerp(T.twist,(P.tw||0)*(1+.35*tpv),M.min(1,10*dt));T.lean=lerp(T.lean,(P.ln||0)+.1*tpv-T.stum*.35,M.min(1,8*dt));T.kneel=lerp(T.kneel,T.pase&&T.pase.def.kneel?1:0,M.min(1,6*dt));
const one=P.one,free=[!T.hands||!T.hands.R,!T.hands||!T.hands.L];
T.stance=lerp(T.stance||0,T.pase||C.kill?1+.4*(T.pase&&T.pase.temp||0):T.cite*.6,M.min(1,4*dt));
let wsp=T.pase?0:T.spd,hy=0;if(!T.pase&&T.spd>.25&&T.vel&&!T.toss){const mvA=M.atan2(T.vel[0],T.vel[1]),rel=angDiff(h,mvA);if(M.abs(rel)>PI*.6){wsp=-T.spd*.8;hy=clamp(angDiff(h,mvA+PI),-.8,.8)}else hy=clamp(rel,-.95,.95)}
const om=angDiff(T.prevH??h,h)/M.max(dt,1e-3);T.prevH=h;if(!T.pase&&T.spd<.3&&M.abs(om)>.7&&!T.toss)wsp=M.min(1.1,M.abs(om)*.3);T.hyS=lerp(T.hyS||0,hy,M.min(1,6*dt));
const stpT=T.pase?-T.pase.s*lerp(1,.2,sstep(.35,1,T.pase.u)):T.cite*.6*(T.lastSide||-1);T.stp=lerp(T.stp||0,stpT,M.min(1,5*dt));
T.aph=animHuman(Hm,{stance:T.stance,breath:1,speed:wsp,hy:T.hyS,step:T.stp,ph:T.aph,kneel:T.kneel,tw:T.twist,lean:T.lean,look:look-T.twist,free},dt);
Hm.root.upd(null);
if(T.hands){const pole=V.add([0,-1,0],V.sc(rightOf(h),.4));if(T.hands.R){armIK(Hm,Hm.arms[0],T.hands.R,P.back?V.add(fwdOf(h),[0,-.5,0]):V.add(pole,V.sc(rightOf(h),.6)))}
if(C.kill&&T.state=='ok'&&C.kill.ph!='herido'&&C.kill.ph!='dobla'){const K=C.kill,B=C.B;const st=K.ph=='entrada'?V.add(V.madd(B.m.body.wpos(),fwdOf(B.h),.3*B.m.sz),[0,.55*B.m.sz,0]):loc(T,h,[.12,1.38,.38]);armIK(Hm,Hm.arms[0],st,[0,-1,0])}
if(T.hands.L){armIK(Hm,Hm.arms[1],T.hands.L,P.back?V.add(fwdOf(h),[0,-.5,0]):V.add([0,-1,0],V.sc(rightOf(h),-1)))}}
Hm.root.upd(null);T.cap.node.vis=T.tool=='capote';T.mul.node.vis=T.tool=='muleta'}
// --- IA del toro (corrida)
function bullSteer(B,tx,tz,speed,dt,tk=1){const want=M.atan2(tx-B.p[0],tz-B.p[2]);const mr=lerp(2.8,1.05,clamp(B.v/9,0,1))*tk,d=angDiff(B.h,want);
B.yr=lerp(B.yr,clamp(d*4,-mr,mr),M.min(1,7*dt));B.h+=B.yr*dt;const acc=speed>B.v?6.5:9;B.v+=clamp(speed-B.v,-acc*dt,acc*dt);bullMove(B,dt)}
function bullMove(B,dt){if(B.mh===undefined)B.mh=B.h;const trac=lerp(16,3.4,clamp(B.v/9.5,0,1)),dm=angDiff(B.mh,B.h);B.mh+=dm*M.min(1,trac*dt);
if(M.abs(dm)>.3&&B.v>4.5){B.v*=1-.4*M.abs(dm)*dt;B.skid=(B.skid||0)+dt;if(B.skid>.06){B.skid=0;for(const L of B.m.legs){const hp=L.hoof.wpos();stamp(hp[0],hp[2],.2,30);emit([hp[0],.1,hp[2]],[rnd(-.5,.5),rnd(.3,.9),rnd(-.5,.5)],.3,1.4,[.86,.7,.5],.28)}}}
B.p[0]+=M.sin(B.mh)*B.v*dt;B.p[2]+=M.cos(B.mh)*B.v*dt;const r0=M.hypot(B.p[0],B.p[2]),lim=PLZ.R-1.1;
if(r0>lim){B.p[0]*=lim/r0;B.p[2]*=lim/r0;const rx=B.p[0]/r0,rz=B.p[2]/r0,dx=M.sin(B.h),dz=M.cos(B.h),dd=dx*rx+dz*rz;if(dd>0){const tx=dx-rx*dd,tz=dz-rz*dd;B.h=M.atan2(tx,tz);B.mh=B.h;B.v*=1-.6*dd*dt*8;if(dd>.6&&B.v>5){B.v*=.6;B.der=1;shake(.25)}}}}
function vmax(B){return(6.6+3.4*B.brav)*(.5+.5*B.fuerza)*(G.diff||1)}
// ---------- comportamiento del toro: carácter, arrancadas espontáneas, querencias ----------
function bullChar(B){if(B.ch)return B.ch;const d=B.d||{},brav=B.brav,nob=B.nob;
B.ch={pronto:clamp(brav*.95+rnd(-.18,.15),.15,1),piton:M.random()<.5?1:-1,vence:clamp((1-nob)*rnd(.5,1.1),0,.75),corto:clamp((1-brav)*.55+(1-nob)*.15,0,.5),recorr:clamp(.45+.6*brav*nob+rnd(-.1,.1),.3,1),
 quer:M.random()<(1-brav)*1.3?'tablas':'medios',gaz:nob<.6&&M.random()<.45,rev:brav>.8&&nob<.7&&M.random()<.6,suelto:clamp((1-brav)*.55,0,.4),hum:clamp(nob*.8+B.fz*.3,0,1),punt:clamp((1-nob)*.6,0,.45),told:0};return B.ch}
function bullReport(B){const c=bullChar(B);if(c.told)return;c.told=1;const pit=c.piton>0?'izquierdo':'derecho',bueno=c.piton>0?'derecho':'izquierdo';
const a=[];a.push(c.pronto>.75?'pronto, se arranca de largo':c.pronto<.45?'tardo, hay que insistirle':'acude al cite');if(c.vence>.35)a.push(`se vence por el pitón ${pit}: el bueno es el ${bueno}`);
if(c.hum>.7)a.push('humilla y mete la cara');else if(c.hum<.45)a.push('lleva la cara alta');if(c.rev)a.push('se revuelve rápido');if(c.quer=='tablas')a.push('tiene querencia a tablas');if(c.corto>.3)a.push('se queda corto');
toast('Lectura del toro: '+a.join(' · '))}
function bullArranca(B,tgtD){B.state='arranca';B.stT=0;B.cueT=rnd(.22,.55)*(1.35-bullChar(B).pronto);B.startD=tgtD;B.paw=M.max(B.paw,.6);if(M.random()<.6)snort()}
function bullAI(B,T,dt){B.stT+=dt;const ch=bullChar(B);const lure=lureOf(T),man=T.p,dM=V.d2(B.p,man);const free=T.state=='ok'&&!T.refugio;const att=lure||(free?man:null);
const fx=M.sin(B.h),fz=M.cos(B.h);B.cue=M.max(0,(B.cue||0)-dt*2);
switch(B.state){
case 'salida':{bullSteer(B,B.sal[0],B.sal[2],8.2,dt,.9);if(B.stT>3.2||V.d2(B.p,B.sal)<3){B.state='fijo';B.stT=0;B.react=1.2}break}
case 'fijo':{B.v=M.max(0,B.v-6*dt);if(!att){bullMove(B,dt);break}
 const want=M.atan2(att[0]-B.p[0],att[2]-B.p[2]),d=angDiff(B.h,want),da=V.d2(B.p,att),inView=M.abs(d)<1.1;
 B.h+=clamp(d*2,-1.4,1.4)*dt;if(M.abs(d)>.5){B.v=M.min(1,B.v+3*dt)}
 const cited=lure&&(T.cite>.5||T.pase);
 if(cited&&da<16&&da>1.8&&M.abs(d)<.55){const far=da>10?ch.pronto*ch.pronto:1;B.react-=dt*(.55+B.brav*.9)*(T.cite>.5?1.35:1)*far*(.6+.4*B.fuerza);if(B.react<=0){bullArranca(B,da);C.lastCharge=G.t}}
 else B.react=M.min(B.react+dt*.3,lerp(1.8,.45,ch.pronto));
 // arrancada espontánea: al bulto que se mueve o al engaño que ve
 if(!cited&&free&&inView&&B.stT>.9&&dM<13&&!(B.calmT>G.t)){const mov=T.spd>1.5?.9*(1.1-B.nob*.5):0;const h=(dM<9?ch.pronto*.28:0)+mov+(dM<4.5?(1-B.nob)*.6:0);if(M.random()<h*dt*(.4+.6*B.fuerza)){bullArranca(B,dM);if(!G.ai)say('¡Se arranca!',0,'red')}}
 // gazapeo y querencia
 if(!cited&&ch.gaz&&da>5.5&&B.stT>1.2&&B.fuerza>.3){B.v=lerp(B.v,M.sin(B.stT*3)>0?.8:.15,M.min(1,3*dt))}
 if(!cited&&ch.quer=='tablas'&&B.stT>3.5&&M.random()<dt*.25){B.state='suelto';B.stT=0;B.dest=[PLZ.toriles[0]+rnd(-4,4),0,PLZ.R-3];break}
 bullMove(B,dt);if(B.stT>9&&B.fuerza<.3){B.state='tablas';B.stT=0}
 if(!cited&&dM>4&&B.stT>2+B.nob*2&&M.random()<dt*.4)B.paw=1;break}
case 'arranca':{B.v=M.max(0,B.v-8*dt);B.cue=1;B.hum=lerp(B.hum,.7,M.min(1,6*dt));if(att){const d=angDiff(B.h,M.atan2(att[0]-B.p[0],att[2]-B.p[2]));B.h+=clamp(d*3,-2,2)*dt}bullMove(B,dt);
 if(B.stT>=B.cueT){B.state='embiste';B.stT=0;B.cv=rnd(.9,1.07);B.short=M.random()<ch.corto*(1.2-B.fuerza)?rnd(2.4,4.2):0;B.vSide=0}break}
case 'embiste':{const tgt0=lure||man;let tgt=tgt0;const sp=vmax(B)*(B.cv||1);const dd0=V.d2(B.p,tgt0);
 // se vence por un pitón: en los últimos metros busca el bulto
 if(lure&&free&&dM<3.6&&ch.vence>.05){const rx=fz,rz=-fx,lat=(man[0]-B.p[0])*rx+(man[2]-B.p[2])*rz;if(M.sign(lat)==ch.piton){const bad=T.pase?clamp(M.abs(T.pase.err||0)*2.2,0,1):.8;const k=ch.vence*(1-dM/3.6)*(.75+bad*.9);tgt=V.lerp(tgt0,man,k*.75);if(!B.vSide){B.vSide=1}}}
 {const ms=T.pase?1-clamp((M.abs(T.pase.err||0)-.1)*2.2,0,.75):1;bullSteer(B,tgt[0],tgt[2],sp*(T.pase&&T.pase.temp&&dd0<5?lerp(1,.68,T.pase.temp*(.5+.5*B.nob)):1),dt,lure?(dd0<7?2.3:1.2)*TOR().poder*ms:.9)}
 const dt_=V.d2(B.p,tgt0);const ly=lure?lure[1]:1.2,low=clamp((1.25-ly)/.6,0,1);B.hum=lerp(B.hum,dt_<5.5?lerp(.4,1.25,ch.hum*(.55+.45*low))*(.7+.3*B.fuerza):.2,M.min(1,5*dt));const ahead=(tgt0[0]-B.p[0])*fx+(tgt0[2]-B.p[2])*fz;
 // punteo: derrota al engaño
 if(T.pase&&dt_<1.2&&M.random()<ch.punt*dt*3){B.der=1;T.pase.hook=1}
 // se queda corto
 if(B.short&&dM<B.short&&dM>1.2){B.state='parado';B.stT=0;B.der=.8;B.v*=.35;for(const L of B.m.legs){const hp=L.hoof.wpos();stamp(hp[0],hp[2],.3,45);emit([hp[0],.1,hp[2]],[fx*2+rnd(-.5,.5),rnd(.3,1),fz*2+rnd(-.5,.5)],.35,1.5,[.86,.7,.5],.32)}if(!G.ai)say('Se queda corto',0);break}
 if((ahead<-.2&&dt_<3.5)||B.stT>6||(T.state!='ok'&&dt_<2)){B.state='pasado';B.stT=0;B.rec=0;B.recMax=lerp(2.6,9.5,B.brav*B.fuerza*ch.recorr)*(ch.rev?.45:1);B.fuerza=M.max(0,B.fuerza-.045*(1.25-B.fz));B.passes++;if(dt_<2)B.der=1;if(B.passes==2)bullReport(B)}
 break}
case 'pasado':{B.rec+=B.v*dt;B.hum=lerp(B.hum,0,M.min(1,3*dt));B.v=M.max(2.4,B.v-5*dt);bullMove(B,dt);if(lure){const d=angDiff(B.h,M.atan2(lure[0]-B.p[0],lure[2]-B.p[2]));B.h+=clamp(d,-1,1)*dt*.8}
 if(B.rec>B.recMax||B.v<=2.5){if(M.random()<ch.suelto*(1.3-B.fuerza)&&!T.pase){B.state='suelto';B.stT=0;const a=rnd(0,TAU);B.dest=[M.cos(a)*(PLZ.R-4),0,M.sin(a)*(PLZ.R-4)];if(!G.ai)say('El toro se va suelto',0)}else{B.state='vuelta';B.stT=0}}break}
case 'vuelta':{const a=att||[0,0,0];const vs=lerp(2.1,3.9,B.brav*B.fuerza)*(ch.rev?1.25:1);bullSteer(B,a[0],a[2],vs,dt,ch.rev?3.4:2.4);const d=angDiff(B.h,M.atan2(a[0]-B.p[0],a[2]-B.p[2]));
 if(M.abs(d)<.35||B.stT>2.6){const cited=lure&&(T.cite>.5||T.pase);const da=V.d2(B.p,a);if(cited&&da<12&&B.fuerza>.12&&M.random()<.55+.45*ch.pronto){bullArranca(B,da);B.cueT*=.4;C.lastCharge=G.t}else{B.state='fijo';B.stT=0;B.react=lerp(1.6,.45,ch.pronto)}}break}
case 'suelto':{bullSteer(B,B.dest[0],B.dest[2],lerp(2.6,4.5,B.fuerza),dt,1.4);if(V.d2(B.p,B.dest)<2||B.stT>5){B.state='fijo';B.stT=0;B.react=lerp(2,.8,ch.pronto)}
 if(lure&&T.cite>.5&&V.d2(B.p,lure)<9&&B.stT>1.5&&M.random()<dt*ch.pronto){bullArranca(B,V.d2(B.p,lure))}break}
case 'parado':{B.v=M.max(0,B.v-10*dt);bullMove(B,dt);if(B.stT>lerp(2.8,1.3,B.brav)*(1.6-B.fuerza*.6)&&!(B.calmT>G.t)){B.state='fijo';B.stT=0;B.react=.6}break}
case 'tablas':{const tq=[PLZ.toriles[0],0,PLZ.R-2.5];if(V.d2(B.p,tq)>2)bullSteer(B,tq[0],tq[2],3.2,dt,1.5);else{B.v=0;if(lure&&V.d2(B.p,lure)<5&&T.cite>.5&&M.random()<dt*.5){bullArranca(B,5)}}
 B.fuerza=M.min(.5,B.fuerza+dt*.01);if(B.fuerza>.32&&B.stT>8){B.state='fijo';B.stT=0}break}}
B.der=M.max(0,B.der-dt*2.5);B.paw=M.max(0,B.paw-dt*.45)}
// --- animación del toro
const WALK=[.25,.75,0,.5],GAL=[.45,.57,0,.12];
function animBull(B,dt){const m=B.m,v=B.v,w=M.max(sstep(2.4,5.5,v),B.state=='embiste'&&B.stT<.8&&v>.8?1-B.stT*.4:0);B.ph+=dt*v/lerp(1.4,3.1,w);const amp=clamp(v/1.2,0,1)*lerp(.32,.6,w);
m.root.p=[B.p[0],0,B.p[2]];m.root.r=[0,B.h,0];const c=B.ph*TAU;
const hu=B.hum||0,cu=B.cue||0;m.body.p[1]=m.sz*(1.0+M.abs(M.sin(c))*.05*w+M.sin(c*2)*.01*(1-w)*amp-.045*hu-.035*cu);m.body.r=[M.sin(c+.6)*.055*w+hu*.085-cu*.07,0,-B.yr*.07*clamp(v/4,0,1)];
m.legs.forEach((L,i)=>{const off=lerp(WALK[i],GAL[i],w),q=(B.ph+off)*TAU,s=M.sin(q),cs=M.cos(q);let hip=L.a0+s*amp*(L.front?1:.85),kn=L.k0+M.max(0,-cs)*amp*(L.front?1.5:.9);
if(i==0&&B.paw>0&&v<.5){hip=-.35+M.sin(G.t*9)*.45*B.paw;kn=.6+M.sin(G.t*9+1)*.5*B.paw;if(M.sin(G.t*9)>.95){const hp=L.hoof.wpos();stamp(hp[0],hp[2],.25,30);emit([hp[0],.1,hp[2]],[rnd(-.3,.3),.6,-.6],.25,1.2,[.86,.7,.5],.35)}}
if(L.front){hip-=hu*.12;kn+=hu*.16}L.hip.r=[hip,0,0];L.knee.r=[kn,0,0];L.hoof.r=[-(hip+kn)*.85,0,0];
if(v>1.2){const ph=(B.ph+off)%1;if(B.hd[i]>.8&&ph<.2){const hp=L.hoof.wpos();stamp(hp[0],hp[2],.12,40);if(w>.3&&M.random()<.7)emit([hp[0],.08,hp[2]],[rnd(-.4,.4)-M.sin(B.h)*v*.15,rnd(.3,.8),rnd(-.4,.4)-M.cos(B.h)*v*.15],.22,1.3,[.86,.7,.5],.22);if(i==2)hoof(.12+w*.2)}B.hd[i]=ph}});
m.neck.r=[.12+hu*.78-B.der*.6+M.sin(c*2)*.04*w,clamp(B.yr*.15,-.3,.3),0];m.head.r=[hu*.32-B.der*.4,0,B.der*.25];
if(C.B===B&&C.T&&(B.state=='embiste'||B.state=='pasado')){const lu=lureOf(C.T);if(lu&&V.d2(lu,B.p)<4.5){const la=clamp(angDiff(B.h,M.atan2(lu[0]-B.p[0],lu[2]-B.p[2])),-1,1);B.lf=lerp(B.lf||0,la,M.min(1,8*dt))}else B.lf=lerp(B.lf||0,0,M.min(1,4*dt))}else B.lf=lerp(B.lf||0,0,M.min(1,4*dt));m.neck.r[1]+=B.lf*.55;m.head.r[1]+=B.lf*.25;m.body.r[2]+=B.lf*.06;
m.tail.r=[-.15-w*.7-(B.cue||0)*.9,0,0];m.tl.r=[0,0,M.sin(G.t*2.7)*.22*(1-w)+M.sin(G.t*9)*.05*w];
{let lt=null;if(C.B===B&&C.T)lt=lureOf(C.T)||C.T.p;else if(typeof BOU!=='undefined'&&BOU.B===B&&BOU.P)lt=BOU.P.p;let la=0;if(lt&&v<3.8&&!B.dob){la=clamp(angDiff(B.h,M.atan2(lt[0]-B.p[0],lt[2]-B.p[2])),-.85,.85)}B.lk=lerp(B.lk||0,la,M.min(1,dt*3));m.neck.r[1]+=B.lk*.5;m.head.r[1]+=B.lk*.3;
 if(v<1&&M.random()<dt*.25)B.ear=1;B.ear=M.max(0,(B.ear||0)-dt*3);m.head.r[2]+=M.sin(B.ear*14)*.04*B.ear}
m.body.p[1]+=M.sin(G.t*1.7+B.ph)*.006*m.sz*(1-w);B.nsp=B.nsp||[0,0];const nt=m.neck.r[0];B.nsp[1]+=((nt-B.nsp[0])*60-B.nsp[1]*9)*dt;B.nsp[0]+=B.nsp[1]*dt;m.neck.r[0]=B.nsp[0];animDobla(B,dt)}
// --- cámara
function shake(k){G.shake=M.max(G.shake||0,k)}
function camFollow(dt,focus,look,dist,h,yaw){const cy=yaw+G.cam.yaw;dist*=G.cam.zoom;const tp=[focus[0]-M.sin(cy)*dist,h+G.cam.pitch*dist*.8,focus[2]-M.cos(cy)*dist];
const r=M.hypot(tp[0],tp[2]);if(SCN.ch[0]===W.arena&&r>PLZ.cal-.4){tp[0]*=(PLZ.cal-.4)/r;tp[2]*=(PLZ.cal-.4)/r;tp[1]=M.max(tp[1],2.6)}
const k=M.min(1,4.5*dt);CAM.p=V.lerp(CAM.p,tp,k);CAM.t=V.lerp(CAM.t,look,M.min(1,6*dt));
if(G.shake>0){G.shake=M.max(0,G.shake-dt*1.6);CAM.p=V.add(CAM.p,[rnd(-1,1)*G.shake*.25,rnd(-1,1)*G.shake*.25,rnd(-1,1)*G.shake*.25])}}
function cineStart(c,d=2.6,r=4.5,y=.9){G.cine={follow:G.mode=='torero'||G.mode=='result'&&G.prevMode=='torero',t:0,d,c:[...c],a:M.atan2(CAM.p[2]-c[2],CAM.p[0]-c[0]),r,y};R.fx.let=0}
function cineUpd(rdt){const q=G.cine;if(!q)return false;q.t+=rdt;const u=q.t/q.d;G.ts=lerp(G.ts,u<.7?.35:1,M.min(1,5*rdt));R.fx.let=lerp(R.fx.let,u<.85?.11:0,M.min(1,4*rdt));if(q.follow){if(q.t>q.d){G.cine=null;R.fx.let=0}return false}
let cc=q.c,rr=q.r;if(SCN.ch[0]===W.arena&&C.B&&C.T&&C.T.state=='ok'){cc=V.lerp(C.T.p,C.B.p,.5);rr=M.max(q.r,V.d2(C.T.p,C.B.p)*.9+4)*(innerWidth<innerHeight?1.7:1)}const a=q.a+u*.5;CAM.p=V.lerp(CAM.p,[cc[0]+M.cos(a)*rr,q.y+1+u*.4,cc[2]+M.sin(a)*rr],M.min(1,1.8*rdt));CAM.t=V.lerp(CAM.t,[cc[0],1.05,cc[2]],M.min(1,5*rdt));CAM.fov=lerp(CAM.fov,40,M.min(1,3*rdt));
if(q.t>q.d){G.cine=null;R.fx.let=0}return true}
// --- torero jugador
function CTRL_YAW(){return CAM_YAW()}
// cámara siempre tras el torero: gira despacio para no marear y se aleja lo justo para ver al toro
function camTorero(rdt,T,B,want){if(C.fy===undefined)C.fy=want;const busy=T.pase||B.state=='embiste'||B.state=='pasado'||B.state=='arranca';const rate=busy?.75:1.7;C.fy+=clamp(angDiff(C.fy,want),-rate*rdt,rate*rdt);
const dTB=V.d2(T.p,B.p),asp=innerWidth/M.max(1,innerHeight),mid=V.lerp(T.p,B.p,.3),dist=(6.6+clamp(dTB-6,0,10)*.22)*(asp<1?1.35:1);camFollow(rdt,T.p,[mid[0],1.15,mid[2]],dist,2.55+(asp<1?.6:0),C.fy)}
// plano general: siempre toro y torero en cuadro, giros lentos y sin saltos entre pases
function planoGeneral(rdt,T,B){const sep=V.d2(T.p,B.p),mid=V.lerp(T.p,B.p,.45),want=M.atan2(B.p[0]-T.p[0],B.p[2]-T.p[2]);if(C.camY===undefined||C.camReset){C.camY=want;C.camReset=0}
const busy=T.pase||B.state=='embiste'||B.state=='arranca'||B.state=='pasado';const rate=sep<1.5?0:busy?.1:.5;C.camY+=clamp(angDiff(C.camY,want),-rate*rdt,rate*rdt);
const vy=C.camY+.62+G.cam.yaw,asp=innerWidth/M.max(1,innerHeight),dist=clamp(sep*.95+5.2,7.5,19)*G.cam.zoom*(asp<1.2?lerp(1,1.85,clamp((1.2-asp)/.75,0,1)):1),h=2.3+dist*.17+G.cam.pitch*dist*.6;let tp=[mid[0]-M.sin(vy)*dist,h,mid[2]-M.cos(vy)*dist];
const r=M.hypot(tp[0],tp[2]);if(r>PLZ.cal-.5){tp[0]*=(PLZ.cal-.5)/r;tp[2]*=(PLZ.cal-.5)/r;tp[1]=M.max(tp[1],3.2)}
CAM.p=V.lerp(CAM.p,tp,M.min(1,2*rdt));CAM.t=V.lerp(CAM.t,[mid[0],1.05,mid[2]],M.min(1,2.6*rdt));CAM.fov=lerp(CAM.fov,48,M.min(1,2*rdt));
if(G.shake>0){G.shake=M.max(0,G.shake-rdt*1.6);CAM.p=V.add(CAM.p,[rnd(-1,1)*G.shake*.2,rnd(-1,1)*G.shake*.2,rnd(-1,1)*G.shake*.2])}}
function torMove(T,dt,ix,iz,run){const cy=CTRL_YAW();const f=[M.sin(cy),M.cos(cy)],r=[-M.cos(cy),M.sin(cy)];let mx=f[0]*iz+r[0]*ix,mz=f[1]*iz+r[1]*ix;const l=M.hypot(mx,mz);
const tgt=l>.01?(run?5.4:1.8):0;if(l>.01){mx/=l;mz/=l}T.spd=lerp(T.spd,tgt,M.min(1,6*dt));T.vel=[mx*T.spd,mz*T.spd];T.p[0]+=T.vel[0]*dt;T.p[2]+=T.vel[1]*dt;T.moveAcc+=T.spd*dt;
const r0=M.hypot(T.p[0],T.p[2]);if(r0>PLZ.R-.45){T.p[0]*=(PLZ.R-.45)/r0;T.p[2]*=(PLZ.R-.45)/r0}
const B=C.B,wantH=run&&l>.01?M.atan2(mx,mz):M.atan2(B.p[0]-T.p[0],B.p[2]-T.p[2]);T.hd+=clamp(angDiff(T.hd,wantH),-6*dt,6*dt)}
function CAM_YAW(){return M.atan2(CAM.t[0]-CAM.p[0],CAM.t[2]-CAM.p[2])}
function startPase(T,def,s){const B=C.B;T.lastSide=-s;T.desp=null;T.pase={def,s,u:0,h0:M.atan2(B.p[0]-T.p[0],B.p[2]-T.p[2]),minD:99,minL:99,eng:0,held:0,keyHeld:1,moved:0,t0:G.t,bd:V.d2(B.p,T.p),bs:B.state,bv:B.v};
const arr=B.state=='embiste'?(V.d2(B.p,T.p)-1)/M.max(B.v,1.5):9;T.pase.err=arr-def.dur*.42;T.pase.sd=B.state=='embiste'?B.startD||0:0;T.hd=T.pase.h0;if(!G.ai)say(def.n,0,'pase')}
function updPase(T,dt,holdKey){const ps=T.pase,B=C.B;const lpN=T.lureT?V.len(V.sub(T.lureT,B.m.head.wpos())):9,eng=lpN<2.3||ps.u<.45;const held=holdKey&&ps.u>.25&&eng;ps.temp=lerp(ps.temp||0,held?1:0,M.min(1,6*dt));ps.u+=dt/ps.def.dur*lerp(ps.u>.3?1.3:1,.62,ps.temp)*(ps.bs=='embiste'?clamp(B.v/7.5,.62,1.25):1);if(held&&ps.u<.85)ps.held+=dt;
const lp=T.lureT,dB=V.d2(B.p,T.p),dL=V.len(V.sub(lp,V.add(B.m.head.wpos(),[0,.1,0])));ps.minD=M.min(ps.minD,dB);ps.minL=M.min(ps.minL,dL);
if(ps.u>.2&&ps.u<.9&&dL<1.25&&B.v>3&&(B.state=='embiste'||B.state=='pasado'))ps.eng=1;
if(!ps.wh&&ps.u>.38){ps.wh=1;whoosh(T.tool=='capote'?1.1:.8);if(dL<1.6)for(let i=0;i<10;i++)emit(V.add(B.p,[rnd(-.8,.8),.15,rnd(-.8,.8)]),[rnd(-1.2,1.2)+M.sin(B.h)*B.v*.3,rnd(.4,1.3),rnd(-1.2,1.2)+M.cos(B.h)*B.v*.3],rnd(.3,.5),rnd(1.2,2),[.86,.7,.5],.3)}
if(ps.u>=1){endPase(T);return}}
function nombraTanda(t,rem){const c=id=>t.filter(x=>x==id).length,n=t.length;
if(c('veronica')>=3&&rem=='media')return['Lances a la verónica y media',22];if(c('chicuelina')>=2)return['Quite por chicuelinas',18];if(c('gaonera')>=2)return['Quite por gaoneras',20];
if(c('delantal')>=2)return['Quite por delantales',18];if(c('farol')>=2)return['Quite por faroles',18];if(c('veronica')>=2)return['Tanda de verónicas',14];
if(c('ayudado')>=2&&rem=='trincherilla')return['Inicio por ayudados y trincherilla',22];if(c('derechazo')>=2&&c('natural')>=1)return['Tanda con cambio de mano',26];
if(c('natural')>=3)return['Tanda al natural',28];if(c('derechazo')>=4)return['Tanda en redondo',24];if(c('circular')>=1&&n>=2)return['Tanda con circular',24];
if(c('molinete')+c('manoletina')>=1&&n>=2)return['Tanda adornada',20];if(c('derechazo')>=2)return['Tanda de derechazos',16];if(c('natural')>=2)return['Naturales ligados',20];if(n>=2)return['Serie ligada',12];return null}
function whoosh(k){const c=AU.c;if(!c)return;const f=noiseHit(c.currentTime,.38,700,1.1,.22*k,'bandpass');if(f)f.frequency.exponentialRampToValueAtTime(2600,c.currentTime+.3)}
function endPase(T){const ps=T.pase,B=C.B,d=ps.def;T.pase=null;T.lastEnd=G.t;T.pp={def:d,s:ps.s,h0:ps.h0+(d.f(1,ps.s).spin||0)};T.hd=T.pp.h0;
if(!ps.eng){if(!G.ai&&ps.bs!='embiste'&&B.state!='embiste')say('Pase al aire');return}
const cerc=ps.minD<.75?1.15:ps.minD<1.5?1:ps.minD<2.4?lerp(1,.45,(ps.minD-1.5)/.9):.3;const TS=G.ai?{arte:1.05,temple:1.15,valor:1}:TOR();const tim=1-clamp(M.abs(ps.err)/(.42*TS.temple),0,1)*.8;const apA=(ps.apA||0)/ps.def.dur;const temple=ps.held>.3?1.2:1;
const quiet=T.moveAcc<.4?1.12:.95;let combo=(G.t-T.lastEnd2<4.8&&V.d2(T.p,T.lastPos)<3.2)?T.combo+1:1;if(combo==1||!T.tanda)T.tanda=[];T.tanda.push(d.id);T.combo=combo;T.lastEnd2=G.t;T.lastPos=[...T.p];T.moveAcc=0;
if(T.rep.id===d.id)T.rep.n++;else{T.rep.id=d.id;T.rep.n=1}const vari=T.rep.n>3?.65:1;const bq=.7+.6*B.brav*(.4+.6*B.fuerza);
if(combo>7){combo=T.combo=1}let pts=d.pts*cerc*tim*temple*quiet*vari*bq*(1+.15*M.min(combo-1,4))*(1+(TS.arte-1)*.6)*(1+.75*clamp(apA,0,1));let txt=apA>.4?'¡Apurando!':'¡Olé!';
if(!T.used)T.used={};if(!T.used[d.id]){T.used[d.id]=1;pts+=3}
if(ps.sd>10){pts*=1.25;txt='¡Cite de largo!'}const chb=B.ch;if(chb&&chb.vence>.3&&!ps.hook){if(ps.s==-chb.piton&&ps.minD<1.6){pts*=1.15;txt='¡Por el pitón difícil!'}}
if(ps.hook){pts*=.55;txt=ps.ach?'Achuchón':'Enganchón'}
let comb=null;if(d.remate&&combo>=2){comb=nombraTanda(T.tanda.slice(0,-1),d.id);pts+=8+combo*1.5;txt='¡Remate de tanda!';T.combo=0;R.pan=M.min(1,R.pan+.15);if(comb){pts+=comb[1]*(.8+.2*TS.arte);T.tandas=(T.tandas||0)+1}}
if(d.remate){B.state='parado';B.stT=0;B.v*=.4;if(!G.ai&&G.mode=='torero'&&(combo>=3||pts>=12)){B.calmT=G.t+2.5;PUB.standT=M.max(PUB.standT,3)}}
pts=M.round(pts);C.score+=pts;try{pubPase(pts,0,!!d.remate)}catch(e){}C.passCount++;C.best=M.max(C.best,pts);R.exc=M.min(1,(R.exc||0)+pts/22);ole(clamp(pts/14,.4,1.3));
if(!G.ai){const gr=ps.hook?'':ps.minD<.75&&ps.held>.3?' · ceñido y templado':ps.minD<.75?' · ceñido':ps.held>.3?' · templado':'';
 if(comb){say(`${comb[0]} +${pts}`,1,'gold');cineStart(V.lerp(T.p,B.p,.5),2.8);ovacion(1.2,5);if(!C.musicOn&&G.mode=='torero'){C.musicOn=1;musica(true)}R.exc=1;setTimeout(()=>ole(1.4),350)}
 else{say(`${txt} ${d.n} +${pts}${combo>1&&!d.remate?' · ligado ×'+combo:''}${gr}`,1,pts>=14?'gold':'');if(d.remate&&combo>=3)cineStart(V.lerp(T.p,B.p,.5),2.4)}}
T.log.push({n:d.n,pts,combo});if(!G.ai)dirPase(d,combo);if(C.score>150&&!C.musicOn&&G.mode=='torero'){C.musicOn=1;musica(true)}}
function cogida(T){const B=C.B;T.state='toss';T.pase=null;T.cite=0;T.cogidas++;T.toss={t:0,y:0,vy:6.2,rx:0,rz:0,dir:fwdOf(B.h),down:0};T.dropped=1;gasp();shake(.7);PUB.standT=M.max(PUB.standT,1.6);R.exc=1;
if(G.mode=='torero'){C.score=M.max(0,C.score-12);say('¡Cogida!',1,'red')}else{say('Derrote al bulto: no suma bravura',1,'red')}
B.state='pasado';B.stT=0;B.rec=0;B.recMax=8;B.der=1}
function updToss(T,dt){const q=T.toss;q.t+=dt;if(!q.down){q.vy-=14*dt;q.y+=q.vy*dt;q.rx+=dt*7;T.p[0]+=q.dir[0]*3.2*dt;T.p[2]+=q.dir[2]*3.2*dt;if(q.y<=0&&q.t>.3){q.y=0;q.down=1;q.tl=q.t;q.rx=-PI/2;emit([T.p[0],.2,T.p[2]],[0,.8,0],.6,1.8,[.86,.7,.5],.45);shake(.3)}}
else{q.y=.12;q.rx=-PI/2+sstep(q.tl+1.2,q.tl+2,q.t)*PI/2;q.rz=0;if(q.t>q.tl+2){T.toss=null;T.state='ok';T.inv=2.5;T.dropped=0;placeCloth(T,true);
 if(G.mode=='torero'&&T.cogidas>=3){endCorrida('enfermeria')}}}}
// ---------- BUCLE DE LA CORRIDA ----------
function updCorrida(dt,rdt){const B=C.B,T=C.T;C.t+=dt;C.tT+=dt;
if(G.mode=='torero'&&C.kill){if(T.state=='ok'||C.kill.ph=='herido'||C.kill.ph=='dobla')updKill(dt)}
else if(G.mode=='torero'){
 if(T.state=='ok'&&!T.refugio){const ix=(key('KeyD')||key('ArrowRight')?1:0)-(key('KeyA')||key('ArrowLeft')?1:0),iz=(key('KeyW')||key('ArrowUp')?1:0)-(key('KeyS')||key('ArrowDown')?1:0);
  if(T.desp&&!T.pase){T.desp.t+=dt;if(ix||iz||T.desp.t>2.8||C.B.state=='embiste')T.desp=null;else{const aw=V.norm([T.p[0]-B.p[0],0,T.p[2]-B.p[2]]),sp=T.desp.t<2.1?1.25:0;T.spd=lerp(T.spd,sp,M.min(1,5*dt));T.vel=[aw[0]*T.spd,aw[2]*T.spd];T.p[0]+=T.vel[0]*dt;T.p[2]+=T.vel[1]*dt;T.hd+=clamp(angDiff(T.hd,M.atan2(aw[0],aw[2])),-3*dt,3*dt);T.cite=lerp(T.cite,0,M.min(1,4*dt))}}
  if(!T.pase&&!T.desp){torMove(T,dt,ix,iz,key('ShiftLeft')||key('ShiftRight'));T.cite=lerp(T.cite,key('KeyE')?1:0,M.min(1,8*dt));
   for(const def of PASES[T.tool]){if(hit('Digit'+def.k)||hit('Numpad'+def.k)||(def.k=='1'&&hit('Space')&&!nearBurl(T))){const s=def.side||(ix>0?-1:ix<0?1:(T.lastS=-(T.lastS||1)));startPase(T,def,s);T.keyK=def.k;break}}}
  else if(T.pase){T.spd=0;T.pase.ap=lerp(T.pase.ap||0,key('ShiftLeft')||key('ShiftRight')?1:0,M.min(1,6*dt));T.pase.apA=(T.pase.apA||0)+T.pase.ap*dt;updPase(T,dt,key('Digit'+T.keyK)||key('Numpad'+T.keyK)||(T.keyK=='1'&&key('Space')))}}
 if(hit('Space')&&nearBurl(T)&&!T.pase&&T.state=='ok'){if(T.refugio){T.p=[...T.refugio.out];T.refugio=null}else{const b=nearBurl(T);T.refugio={out:[...T.p]};T.p=[M.cos(b[3])*(PLZ.R-.25),0,M.sin(b[3])*(PLZ.R-.25)];T.hd=b[3]+PI;say('Al burladero')}placeCloth(T,true)}
 if(hit('Tab')&&C.tercio=='capote'&&!T.pase)cambioTercio();
 if(hit('KeyF')&&C.tercio=='muleta')tryKill();if(C.askInd&&hit('KeyI'))endCorrida('faena');if(C.askInd&&G.t-C.askInd>8)C.askInd=0;
 if(C.tercio=='capote'&&C.tT>100)cambioTercio();
 if(C.tercio=='muleta'){if(C.tT>150&&C.avisos<1){C.avisos=1;clarin();say('Primer aviso',1)}if(C.tT>190&&C.avisos<2){C.avisos=2;clarin();say('Segundo aviso',1)}if(C.tT>220)endCorrida('aviso3')}}
else{// modo toro
 bullPlayer(B,dt);torAI(T,dt);if(C.tercio=='capote'&&C.t>100)cambioTercio()}
dirTick(dt);
if(T.state=='toss')updToss(T,dt);T.inv-=dt;
if(G.mode=='torero'&&!C.kill)bullAI(B,T,dt);
// cogida
if(T.state=='ok'&&!T.refugio&&T.inv<=0&&B.v>2.6){const ht=hornTips(B).filter(h=>h[1]<1.75),dd=ht.length?M.min(...ht.map(h=>V.d2(h,T.p))):9;C.minHorn=dd;
 if(dd<(G.ai?.22:.27))cogida(T);else if(!G.ai&&dd<.38&&B.v>4&&!(T.achT>G.t)){T.achT=G.t+1.2;const aw=V.norm([T.p[0]-B.p[0],0,T.p[2]-B.p[2]]);T.p=V.madd(T.p,aw,.45);if(T.pase){T.pase.hook=1;T.pase.ach=1}T.stum=1;C.score=M.max(0,C.score-5);gasp();shake(.3);if(G.mode=='torero')say('¡Achuchón!',0,'red')}}
clothStep(T,B,dt);
// toro
animBull(B,dt);
if(T.toss)T.h.root.upd(null);
// marcas del torero
if(T.spd>.5&&!T.toss){T.stepAcc=(T.stepAcc||0)+T.spd*dt;if(T.stepAcc>.7){T.stepAcc=0;stamp(T.p[0]+rnd(-.08,.08),T.p[2]+rnd(-.08,.08),.07,22)}}
// ambiente
R.exc=M.max(0,(R.exc||0)-dt*.18);R.pan=M.max(0,R.pan-dt*.01);crowdLevel(.1+R.exc*.35);
if(G.mode=='torero'&&C.score>240)R.pan=M.max(R.pan,.5);
// HUD
const sc=G.mode=='toro'?C.brav:C.score;$('score').textContent=M.round(sc);{const ok=G.mode=='torero'&&T.tanda&&T.tanda.length&&G.t-T.lastEnd2<4.8&&T.combo>0;const tx=ok?'Tanda: '+T.tanda.map(id=>{const q=PASES[T.tool].find(p=>p.id==id)||PASES.capote.concat(PASES.muleta).find(p=>p.id==id);return q?q.n.replace('Pase de ','').replace(' verónica','').replace('Larga cambiada de rodillas','Larga'):id}).join(' › ')+(T.combo>=2?' — remata':' — liga'):'';const el=$('tanda');if(el.textContent!==tx){el.textContent=tx;el.hidden=!tx}if($('combo').textContent)$('combo').textContent=''}bar('fzBar',B.fuerza);bar('amb',R.exc);
const tl=G.mode=='toro'?240-C.t:(C.tercio=='capote'?100-C.tT:220-C.tT);$('clock').textContent=fmtT(M.max(0,tl));$('avisos').textContent=C.avisos?'●'.repeat(C.avisos):'';
// medidor de distancia
const dd=V.d2(B.p,T.p),charging=B.state=='embiste';const mt=$('meter');mt.style.opacity=G.mode=='torero'&&(charging||T.cite>.3)?1:.25;
const ideal=charging?1+B.v*(PASES[T.tool][0].dur*.42):6;$('mk').style.left=clamp((1-dd/14)*100,0,100)+'%';$('mz').style.left=clamp((1-(ideal+1.2)/14)*100,0,100)+'%';$('mz').style.width=clamp(2.4/14*100,0,100)+'%';
rhythmCue(G.mode=='torero'&&charging&&M.abs(dd-ideal)<1.2&&!T.pase);$('mtxt').textContent=charging?(M.abs(dd-ideal)<1.2?'¡Ahora!':dd>ideal?'Aguanta…':'¡Tarde!'):(B.state=='fijo'?(G.mode=='toro'?'':TOUCH?'Mantén Citar':'Cita con E'):B.state=='tablas'?'Toro aquerenciado':'');
// cámara
if(!cineUpd(rdt)){if(!G.cine)G.ts=lerp(G.ts,1,M.min(1,4*rdt));CAM.fov=lerp(CAM.fov,G.cine?40:G.mode=='toro'&&B.v>7?66:52,M.min(1,3*rdt));
 if(G.mode=='toro'){camFollow(rdt,B.p,V.add(V.madd(B.p,fwdOf(B.h),5),[0,1.2,0]),7.2,3.2,B.h)}
 else{const mid=V.lerp(T.p,B.p,.32),yaw=M.atan2(B.p[0]-T.p[0],B.p[2]-T.p[2]);
  camTorero(rdt,T,B,yaw)}}
R.fx.spd=G.mode=='toro'?clamp((B.v-7)/4,0,1)*.6:0;R.fx.vig=G.mode=='toro'&&B.v>7?.2:0;
ENV.sh0c=[T.p[0]*.5+B.p[0]*.5,0,T.p[2]*.5+B.p[2]*.5];ENV.sh0h=M.max(9,V.d2(T.p,B.p)*.6+5);ENV.sh1c=[0,0,0];ENV.sh1h=PLZ.outR+4;
// final modo toro
if(G.mode=='toro'){if(C.brav>=100&&C.tercio=='muleta'&&!C.over){C.over=1;R.pan=1;say('El presidente saca el pañuelo naranja',1,'gold');musica(true);setTimeout(()=>endCorrida('indulto'),4200)}if(C.t>240&&!C.over){C.over=1;endCorrida('tiempo')}}}
function clothStep(T,B,dt){const cl=T.tool=='capote'?T.cap:T.mul,ot=T.tool=='capote'?T.mul:T.cap;placeCloth(T,false);poseTorero(T,dt);
if(T.hands){const H=T.h;if(T.hands.R)T.hands.R=V.add(H.arms[0].wr.wpos(),[0,-.07,0]);if(T.hands.L)T.hands.L=V.add(H.arms[1].wr.wpos(),[0,-.07,0]);
 if(T.tool=='capote'){if(T.hands.L&&T.hands.R){T.pins=capPins(cl,T.hands.R,T.hands.L)}else{const hh=T.hands.R||T.hands.L,P=holdPose(T),wd=V.norm(V.add(V.sc(rightOf(P.h),M.cos(P.th)),V.sc(fwdOf(P.h),M.sin(P.th))));T.pins=[];for(let i=2;i<6;i++)T.pins.push([i,V.madd(hh,wd,(i-3.5)*.09)])}}
 else{const hh=T.hands.R||T.hands.L,P=holdPose(T),h=P.h+(P.spin||0),st=V.norm(V.add(V.sc(rightOf(h),M.cos(P.th)),V.sc(fwdOf(h),M.sin(P.th))));T.pins=[];for(let i=0;i<cl.nx;i++)T.pins.push([i,V.madd(hh,st,-.04+i/(cl.nx-1)*.86)])}}
const hp=B.m.head.wpos(),bvel=V.sc(fwdOf(B.h),B.v);cl.col=[{c:V.add(hp,V.sc(fwdOf(B.h),.2)),r:.42,v:bvel},{c:V.add(T.h.spine.wpos(),[0,.25,0]),r:.2}];
{const gu=1+1.6*M.max(0,M.sin(G.t*.31)*M.sin(G.t*1.7+1));cl.wind=[(M.sin(G.t*.7)*.8+M.sin(G.t*3.1)*.25)*gu,0,(M.cos(G.t*.5)*.6+M.cos(G.t*2.3)*.2)*gu]}const sub=2;for(let i=0;i<sub;i++)cl.step(M.min(dt,.033)/sub,T.dropped?[]:T.pins);cl.upload();
if(ot.P[1]>-4){ot.place(()=>[0,-5,0]);ot.upload()}
}
function nearBurl(T){for(const b of PLZ.burl)if(V.d2(T.p,b)<2.2)return b;return null}
function cambioTercio(){const T=C.T;if(C.tercio=='muleta')return;C.tercio='muleta';C.tT=0;T.tool='muleta';T.combo=0;placeCloth(T,true);clarin();say('Cambio de tercio: la muleta',1);$('hudTitle').textContent=G.mode=='toro'?'Eres el toro · Muleta':'Tercio de muleta';$('keys').innerHTML=G.mode=='toro'?keysToro():keysTorero();if(C.dir&&C.dir.mode=='torero'&&C.dir.i<3){C.dir.i=3;C.dir.n=0;dirShow()}
C.B.fuerza=M.max(.35,C.B.fuerza-.08)}
// toro jugador
function bullPlayer(B,dt){const T=C.T;const w=key('KeyW')||key('ArrowUp'),s=key('KeyS')||key('ArrowDown'),tn=(key('KeyA')||key('ArrowLeft')?1:0)-(key('KeyD')||key('ArrowRight')?1:0);
const ch=key('Space')&&B.fuerza>.05;let tv=w?3.2:0;if(ch)tv=vmax(B)*1.08;if(s)tv=0;
B.v+=clamp(tv-B.v,-(s?11:7)*dt,6.5*dt);const mr=lerp(2.6,1.15,clamp(B.v/9,0,1));B.yr=lerp(B.yr,tn*mr,M.min(1,6*dt));B.h+=B.yr*dt;bullMove(B,dt);
if(ch&&B.v>4)B.fuerza=M.max(0,B.fuerza-dt*.055*(1.3-B.fz));else B.fuerza=M.min(1,B.fuerza+dt*(B.v<1.5?.035:.012));
B.hum=lerp(B.hum,key('ShiftLeft')||key('ShiftRight')?1:0,M.min(1,8*dt));{const lu=lureOf(T);if(lu&&B.v>3){const dl=V.d2(B.p,lu);if(dl<6)B.h+=clamp(angDiff(B.h,M.atan2(lu[0]-B.p[0],lu[2]-B.p[2])),-1,1)*dt*(1.2+2.2*B.nob)*(tn?.45:1)}}if(hit('KeyQ'))B.der=1;
if(B.v<.3&&key('KeyE'))B.paw=1;
// embestidas al engaño
const lure=lureOf(T);if(lure&&B.v>4.2){const hp=B.m.head.wpos(),dl=V.len(V.sub(lure,V.add(hp,[0,.1,0])));if(dl<1.15&&G.t-(B.lastEmb||0)>1.6){B.lastEmb=G.t;const pts=M.round((1+B.v*.28)*(B.hum>.6?1.5:1)*(B.runD>10?1.3:1));if(B.hum>.6)aplauso(.6,1.4);dirEmb({far:B.runD>10,hum:B.hum>.6,lig:G.t-(B.prevEmb||-9)<6});B.prevEmb=G.t;C.brav+=pts;C.emb++;R.exc=M.min(1,R.exc+pts/14);ole(pts/9);
 say((B.hum>.6?'¡Humilla! ':'¡Embiste! ')+'+'+pts,1,pts>=9?'gold':'');}}
B.state=B.v>4?'embiste':'fijo';if(ch&&B.v>4)B.runD=(B.runD||0)+B.v*dt;else if(B.v<2)B.runD=0}
function fmtT(s){s=M.ceil(s);return M.floor(s/60)+':'+String(s%60).padStart(2,'0')}
// ---------- FINAL ----------
function endCorrida(why){if(G.mode=='result')return;const B=C.B,T=C.T,m=G.mode;G.prevMode=m;G.mode='result';musica(false);let title,sub,pan='';const sc=M.round(C.score);
if(m=='toro'){const b=M.round(C.brav);if(why=='indulto'){title='¡Indulto!';sub=`«${C.data.name}» vuelve a la dehesa de ${C.data.g.n}. El presidente sacó el pañuelo naranja.`;pan='naranja'}
 else if(b>=70){title='Vuelta al ruedo';sub='El pañuelo azul premia la bravura del toro.';pan='azul'}else if(b>=40){title='Palmas al toro';sub='Embestiste con codicia, pero faltó continuidad.'}else{title='Pitos: toro manso';sub='La plaza esperaba más bravura en el caballo… y en el engaño.'}
 stats([['Bravura',b],['Embestidas al engaño',C.emb],['Cogidas al torero',T.cogidas],['Fuerza restante',M.round(B.fuerza*100)+'%']])}
else{if(why=='enfermeria'){title='A la enfermería';sub='Tres cogidas. El matador pasa a la enfermería por su propio pie.'}
 else if(why=='muerte'||why=='pinchazos'){const tq=trophies();title=tq.title;sub=why=='pinchazos'?'Cuatro pinchazos: el toro es devuelto a los corrales. '+tq.sub:tq.sub;pan=tq.orejas>=1?'blanco':'';
  stats([['Puntos de faena',sc],['Espada',C.kill.res?KILL_TXT[C.kill.res].replace(/[¡!]/g,''):'Sin estocada'],['Pinchazos',C.kill.pinch],['Orejas',tq.orejas>=3?'2 y rabo':tq.orejas]])}
 else if(why=='aviso3'){title='Tercer aviso';sub='El toro vuelve a los corrales. La faena se alargó demasiado.'}
 else{const ind=sc>=330&&B.brav>=.8&&B.fuerza>.2;if(ind){title='¡Indulto y Puerta Grande!';sub=`La plaza pidió el indulto de «${C.data.name}» y el presidente sacó el pañuelo naranja.`;pan='naranja'}
  else if(sc>=260){title='Puerta Grande';sub='Salida a hombros. La plaza entera en pie.';pan='blanco'}else if(sc>=170){title='Vuelta al ruedo';sub='Faena de mérito, rematada con torería.'}else if(sc>=100){title='Ovación y saludos';sub='El matador saluda desde el tercio.'}else if(sc>=45){title='Palmas';sub='Faena correcta, sin terminar de romper.'}else{title='Silencio';sub='No hubo acople entre toro y torero.'}}
 if(why!='muerte'&&why!='pinchazos')stats([['Puntos de faena',sc],['Pases ligados',C.passCount],['Mejor pase',C.best],['Cogidas',T.cogidas]])}
$('rTitle').textContent=title;$('rSub').textContent=sub;$('rPan').className='pan '+pan;$('rPan').hidden=!pan;R.pan=pan?1:0;R.panC=pan=='naranja'?[1,.45,.05]:pan=='azul'?[.1,.3,.9]:[1,1,1];if(pan){ole(1.3);setTimeout(()=>ole(1.2),900)}
hide('hud');show('result');$('again').focus();{const tt=title||'';try{pubResult(/rabo|Dos orejas|Puerta Grande|Indulto/i.test(tt)?'gloria':/oreja|Vuelta|Ovación/i.test(tt)?'bien':/Pitos|aviso|Bronca|devuelto|manso/i.test(tt)?'bronca':'')}catch(e){}}}
function stats(a){$('rStats').innerHTML=a.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('')}
function show(id){$(id).hidden=false}function hide(id){$(id).hidden=true}
// entorno de tarde y de mañana
const ENV_TARDE={sun:V.norm([-.72,.4,.52]),sunC:[5.6,4.4,3.1],skyT:[.08,.2,.6],skyH:[.9,.75,.6],gnd:[.45,.35,.22],fogC:[.82,.7,.56],fogD:.0016,cloud:.45,cloudC:[1.3,1.08,.92],exp:1.12,amb:.55};
