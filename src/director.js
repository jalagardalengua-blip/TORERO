// ================= DIRECTOR DE LIDIA (ritmo de la partida) =================
const DIR={
torero:[
{t:'Cita al toro con E y dale el primer lance',need:1,m:p=>true},
{t:'Lancea a la verónica',need:3,m:p=>p.id=='veronica',link:1},
{t:'Remata con una media verónica',need:1,m:p=>p.id=='media',bonus:12,cambio:1},
{t:'Tanda por la derecha: derechazos ligados',need:4,m:p=>p.id=='derechazo',link:1},
{t:'Remata la tanda con el pase de pecho',need:1,m:p=>p.id=='pecho',bonus:15},
{t:'Tanda al natural, con la izquierda',need:3,m:p=>p.id=='natural',link:1},
{t:'Remata con el pase de pecho',need:1,m:p=>p.id=='pecho',bonus:15},
{t:'Adorno: un molinete o una manoletina',need:1,m:p=>p.id=='molinete'||p.id=='manoletina',bonus:10},
{t:'Faena libre: sigue toreando o entra a matar con F',need:999,m:()=>true}],
toro:[
{t:'Arranca de lejos al capote',need:1,m:e=>e.far},
{t:'Embiste al capote',need:3,m:e=>true},
{t:'Humilla en el engaño con Shift',need:2,m:e=>e.hum,cambio:1},
{t:'Sigue la muleta: embestidas ligadas',need:4,m:e=>e.lig},
{t:'Humilla y repite hasta el indulto',need:999,m:e=>true}]};
const ENC_OBJ=['Sube la cuesta sin que la manada te alcance','Busca hueco: el vallado está a los lados','Prepárate para la curva','Pégate al interior: los toros resbalan hacia fuera','Aguanta delante de los pitones','Último tramo: aprieta hacia el callejón','¡Entra en la plaza!'];
function dirInit(mode){C.dir={mode,i:0,n:0,idle:0,imp:0};dirShow()}
function dirStep(){return C.dir&&DIR[C.dir.mode][C.dir.i]}
function dirShow(){const s=dirStep();if(!s)return;$('goal').hidden=false;$('goalTxt').textContent=(typeof simple=='function'&&simple())?s.t.replace(' con E y',' y').replace(' (Citar)','').replace('con Shift','al llegar').replace(' con F',TOUCH?' (Matar)':' con F'):TOUCH?s.t.replace(' con E',' (mantén Citar)').replace(' con Shift',' (Humillar)').replace(' con F',' (Matar)'):s.t;$('goalN').textContent=s.need<999?`${C.dir.n} / ${s.need}`:'';$('goalBar').firstChild.style.width=(s.need<999?C.dir.n/s.need*100:100)+'%'}
function dirAdvance(){const s=dirStep();if(s.bonus){if(G.mode=='torero'){C.score+=s.bonus;say(`Objetivo cumplido +${s.bonus}`,1,'gold')}else C.brav+=4}
C.dir.i=M.min(C.dir.i+1,DIR[C.dir.mode].length-1);C.dir.n=0;if(s.cambio)setTimeout(()=>{if((G.mode=='torero'||G.mode=='toro')&&C.tercio=='capote'){say('El presidente ordena el cambio de tercio',1);cambioTercio()}},1600);dirShow()}
// llamado al terminar un pase válido (modo torero)
function dirPase(def,combo){if(!C.dir||C.dir.mode!='torero')return;C.dir.idle=0;const s=dirStep();if(C.tercio=='muleta'&&C.dir.i<3){C.dir.i=3;C.dir.n=0}
if(s.m(def)){if(s.link&&combo<=1&&C.dir.n>0){C.dir.n=0;say('Se rompió la tanda: liga sin moverte')}C.dir.n++;if(C.dir.n>=s.need)dirAdvance();else dirShow()}
else if(s.link&&C.dir.n>0&&!def.remate){C.dir.n=0;dirShow()}}
// llamado en cada embestida al engaño (modo toro)
function dirEmb(e){if(!C.dir||C.dir.mode!='toro')return;C.dir.idle=0;const s=dirStep();if(s.m(e)){C.dir.n++;if(C.dir.n>=s.need)dirAdvance();else dirShow()}}
function dirTick(dt){if(!C.dir||C.over||C.kill)return;C.dir.idle+=dt;C.dir.imp-=dt;
if(C.dir.idle>14&&C.dir.imp<=0&&C.B.state!='salida'){C.dir.imp=9;R.exc=M.max(0,R.exc-.3);pitos();say(G.mode=='toro'?'El público pide bravura: ¡arranca!':'El público se impacienta: ¡torea!',1,'red')}}
function pitos(){const c=AU.c;if(!c)return;const t=c.currentTime;for(let i=0;i<9;i++){const o=c.createOscillator();o.type='square';o.frequency.setValueAtTime(rnd(1800,2800),t+i*.05);o.frequency.linearRampToValueAtTime(rnd(1400,2200),t+i*.05+.5);const a=c.createGain();a.gain.setValueAtTime(0,t+i*.05);a.gain.linearRampToValueAtTime(.012,t+i*.05+.05);a.gain.linearRampToValueAtTime(0,t+i*.05+.6);o.connect(a);a.connect(AU.m);o.start(t+i*.05);o.stop(t+i*.05+.65)}}
// pulso de ritmo: señal cuando el toro entra en la ventana ideal
function rhythmCue(on){const mt=$('meter');if(on&&!mt.classList.contains('now')){mt.classList.add('now');if(AU.c){const c=AU.c,o=c.createOscillator(),a=c.createGain();o.frequency.value=880;a.gain.setValueAtTime(.05,c.currentTime);a.gain.exponentialRampToValueAtTime(.0005,c.currentTime+.12);o.connect(a);a.connect(AU.m);o.start();o.stop(c.currentTime+.13)}}else if(!on)mt.classList.remove('now')}
function encGoal(P){const a=pAt(P.s);$('goal').hidden=false;$('goalTxt').textContent=ENC_OBJ[a.seg];$('goalN').textContent=`${M.round(M.max(0,P.s))} / 848,6 m`;$('goalBar').firstChild.style.width=clamp(P.s/PATH.L*100,0,100)+'%'}
// ================= TORERO PROFESIONAL (modo toro) =================
const PLAN={capote:['veronica','veronica','veronica','media','delantal','chicuelina','chicuelina','revolera','gaonera','farol','veronica','media'],
muleta:['ayudado','ayudado','trincherilla','derechazo','derechazo','derechazo','derechazo','pecho','natural','natural','natural','natural','pecho','circular','derechazo','molinete','manoletina','pecho']};
function torAI(T,dt){const B=C.B,ai=T.ai;if(T.state!='ok')return;if(T.tool!==C.tercio){T.tool=C.tercio;ai.i=0;placeCloth(T,true)}
const d=V.d2(B.p,T.p),toB=M.atan2(B.p[0]-T.p[0],B.p[2]-T.p[2]);ai.rest=(ai.rest||0)-dt;ai.q=(ai.q||0)-dt;
if(T.pase){const fx=M.sin(B.h),fz=M.cos(B.h),rx=T.p[0]-B.p[0],rz=T.p[2]-B.p[2],ahead=rx*fx+rz*fz,lat=rx*fz-rz*fx,tt=ahead/M.max(B.v,.5);
 if(B.v>3&&ahead>.3&&M.abs(lat)<.75&&tt<.6&&T.pase.u<.8){const sd=lat>0?1:-1;T.pase=null;ai.qd=V.sc([fz,0,-fx],sd);ai.q=.32;T.inv=M.max(T.inv,.5);ai.after=.8;return}
 updPase(T,dt,true);if(!T.pase){ai.after=1.2}return}
ai.after=(ai.after||0)-dt;
const charging=B.state=='embiste'&&B.v>2.5,fx=M.sin(B.h),fz=M.cos(B.h);
// quiebro de emergencia
if(ai.q>0){const r=ai.qd;T.p[0]+=r[0]*6*dt;T.p[2]+=r[2]*6*dt;T.spd=5;T.hd+=clamp(angDiff(T.hd,toB),-6*dt,6*dt);clampT(T);return}
T.hd+=clamp(angDiff(T.hd,toB),-5*dt,5*dt);
const list=PASES[T.tool],plan=PLAN[T.tool],id=plan[(ai.i||0)%plan.length],def=list.find(p=>p.id==id)||list[0];
if(charging){T.cite=lerp(T.cite,1,M.min(1,8*dt));T.spd=lerp(T.spd,0,M.min(1,8*dt));const arr=(d-1)/M.max(B.v,1.5);
 const ahead=(T.p[0]-B.p[0])*fx+(T.p[2]-B.p[2])*fz;
 if(ahead>0&&d<9&&arr<=def.dur*.42+rnd(-.025,.025)){let s=def.side||(id=='veronica'||id=='chicuelina'?(ai.s=-(ai.s||1)):(ai.s||1));
  const q=[B.p[0]+fx*ahead-T.p[0],0,B.p[2]+fz*ahead-T.p[2]],lat=V.dot(q,rightOf(toB));if(!def.side&&M.abs(lat)>.5)s=lat>0?1:-1;
  startPase(T,def,s);ai.i=(ai.i||0)+1;if(def.remate){ai.rest=rnd(2.5,4)}return}
 {const rx=T.p[0]-B.p[0],rz=T.p[2]-B.p[2],lat=rx*fz-rz*fx;if(d<2.6&&ahead>0&&M.abs(lat)<.8){const sd=lat>0?1:-1;ai.qd=V.sc([fz,0,-fx],sd);ai.q=.32;T.inv=M.max(T.inv,.5)}}
 return}
// colocación: citar a 5,5 m cruzado en el pitón contrario
let tgt=null;const want=5.5,bf=fwdOf(B.h);
if(B.state=='pasado'){const ahead=(T.p[0]-B.p[0])*fx+(T.p[2]-B.p[2])*fz,lat=(T.p[0]-B.p[0])*fz-(T.p[2]-B.p[2])*fx;if(ahead>0&&M.abs(lat)<1.3&&d<7){const r=rightOf(B.h);tgt=V.madd(T.p,r,lat>0?-1.5:1.5)}}
else if(ai.rest>0&&d<7){tgt=V.madd(T.p,[(T.p[0]-B.p[0])/d,0,(T.p[2]-B.p[2])/d],2)}
else if(B.state!='embiste'&&ai.after<=0&&(d>want+2||d<want-2)){tgt=V.madd(B.p,bf,want)}
T.cite=lerp(T.cite,ai.rest<=0&&(B.state=='fijo'||B.state=='vuelta'||B.v<3)&&d<12?1:0,M.min(1,4*dt));
if(tgt){const r0=M.hypot(tgt[0],tgt[2]);if(r0>PLZ.R-3.5){tgt[0]*=(PLZ.R-3.5)/r0;tgt[2]*=(PLZ.R-3.5)/r0}const dx=tgt[0]-T.p[0],dz=tgt[2]-T.p[2],l=M.hypot(dx,dz);
 const sp=B.state=='pasado'?4.5:l>3?2.2:1.2;T.spd=lerp(T.spd,l>.3?sp:0,M.min(1,5*dt));if(l>.3){T.p[0]+=dx/l*T.spd*dt;T.p[2]+=dz/l*T.spd*dt}}
else T.spd=lerp(T.spd,0,M.min(1,5*dt));clampT(T)}
function clampT(T){const r0=M.hypot(T.p[0],T.p[2]);if(r0>PLZ.R-.6){T.p[0]*=(PLZ.R-.6)/r0;T.p[2]*=(PLZ.R-.6)/r0}}
// ================= PAUSA =================
function pauseOn(){if(!['torero','toro','encierro','bous'].includes(G.mode)||G.paused)return;G.paused=true;$('pKeys').innerHTML=$('keys').innerHTML;$('pMode').textContent=G.mode=='bous'?(BOU.night?'Bou embolat':'Bous al carrer'):G.mode=='encierro'?'Encierro de San Fermín':G.mode=='toro'?'Eres el toro':(C.tercio=='muleta'?'Tercio de muleta':'Tercio de capote');
show('pause');if(AU.c)AU.c.suspend();$('pResume').focus()}
function pauseOff(){if(!G.paused)return;G.paused=false;hide('pause');if(AU.c)AU.c.resume();G.keys={}}
