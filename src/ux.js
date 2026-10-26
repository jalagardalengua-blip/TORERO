// ================= CONTROLES SENCILLOS: un botón de acción, citar automático y pase asistido =================
const AS={prev:0,buf:null,pi:0,kSig:'',lab:'',ring:0};
const PH={};addEventListener('keydown',e=>{PH[e.code]=1});addEventListener('keyup',e=>{PH[e.code]=0});addEventListener('blur',()=>{for(const k in PH)PH[k]=0});
const simple=()=>G.opts.ctrl!=='experto';
function asTap(code){G.keys[code]=1;G.prev[code]=0}
// el pase que toca según el objetivo de la lidia
function autoPase(T){const list=PASES[T.tool],st=dirStep();if(st&&st.need<999){const c=list.filter(p=>st.m(p));if(c.length)return c[0]}
const plan=PLAN[T.tool];return list.find(p=>p.id==plan[AS.pi%plan.length])||list[0]}
function asSide(T,B,def){if(def.side)return def.side;const f=fwdOf(B.h),toB=M.atan2(B.p[0]-T.p[0],B.p[2]-T.p[2]);const ahead=(T.p[0]-B.p[0])*f[0]+(T.p[2]-B.p[2])*f[2];
const q=[B.p[0]+f[0]*ahead-T.p[0],0,B.p[2]+f[2]*ahead-T.p[2]],lat=V.dot(q,rightOf(toB));if(M.abs(lat)>.35)return lat>0?1:-1;return(AS.s=-(AS.s||1))}
const CAT={capote:{1:['veronica'],2:['chicuelina','gaonera','delantal','farol'],3:['media','revolera'],4:['larga']},muleta:{1:['derechazo'],2:['natural'],3:['pecho','trincherilla'],4:['molinete','manoletina','ayudado','circular']}};
function catDef(T,i){const ids=CAT[T.tool][i];AS.rot=AS.rot||{};const id=ids[(AS.rot[T.tool+i]||0)%ids.length];return PASES[T.tool].find(p=>p.id==id)}
// pulsar el pase: si falta poco para la llegada se guarda y sale a tiempo; si es demasiado pronto, sale precipitado
function asPress(T,B,def,cat){AS.hold={def,cat};const d=V.d2(B.p,T.p),charging=B.state=='embiste'&&B.v>2.5,f=fwdOf(B.h),ahead=(T.p[0]-B.p[0])*f[0]+(T.p[2]-B.p[2])*f[2];
if(charging&&ahead>0){const arr=(d-1)/M.max(B.v,1.5),e=arr-def.dur*.42;if(e>.24){asFire(T,B,def,cat);say('¡Precipitado!',0,'red');return}}AS.buf={t:0,def,cat}}
function asFire(T,B,def,cat){startPase(T,def,asSide(T,B,def));T.keyK=def.k;if(cat){AS.rot=AS.rot||{};AS.rot[T.tool+cat]=(AS.rot[T.tool+cat]||0)+1}else AS.pi++;AS.buf=null}
function asTorero(dt,act,actHit){const T=C.T,B=C.B;if(!T||!B)return;G.keys.Space=0;
if(PH.KeyQ||G.keys.Ref){if(!AS.refH&&(nearBurl(T)||T.refugio))asTap('Space');AS.refH=1}else AS.refH=0;
if(C.kill){G.keys.Space=act?1:0;if(actHit)asTap('Space');AS.buf=null;AS.lab=C.kill.ph=='perfil'?'Estocada':'Cuadrando…';return}
if(C.askInd&&(PH.KeyI||G.keys.KeyI))asTap('KeyI');
if(T.state!='ok'||T.refugio){AS.buf=null;AS.lab='Torear';return}
const d=V.d2(B.p,T.p),charging=B.state=='embiste'&&B.v>2.5,f=fwdOf(B.h),ahead=(T.p[0]-B.p[0])*f[0]+(T.p[2]-B.p[2])*f[2];
if(!T.pase){

 const def=autoPase(T);AS.lab=TOUCH?'Torear':def.n.replace('Pase de ','');AS.sug=def.k;AS.ideal=(AS.buf?AS.buf.def:def).dur*.42;
 if(actHit)asPress(T,B,def,0);
 AS.dk=AS.dk||{};for(const q of PASES[T.tool]){const on=!!(PH['Digit'+q.k]||PH['Numpad'+q.k]||G.keys['T'+q.k]);if(on&&!AS.dk[q.k]&&!T.pase)asPress(T,B,q,0);AS.dk[q.k]=on;G.keys['Digit'+q.k]=0;G.keys['Numpad'+q.k]=0}
 AS.ck=AS.ck||{};for(let i=1;i<=4;i++){const on=!!G.keys['C'+i];if(on&&!AS.ck[i]&&!T.pase)asPress(T,B,catDef(T,i),i);AS.ck[i]=on}
 if(T.pase)return;
 if(charging&&ahead>0&&C.passCount<3&&AS.tut!==C.lastCharge&&d<11){AS.tut=C.lastCharge;say(TOUCH?'Pulsa un pase cuando el aro dorado se cierre':'Pulsa Espacio o 1-8 cuando el aro dorado se cierre',0)}
 const holdAny=act||[1,2,3,4].some(i=>G.keys['C'+i])||PASES[T.tool].some(q=>PH['Digit'+q.k]||G.keys['T'+q.k]);if(holdAny&&!charging){G.keys.KeyE=1;AS.toque=(AS.toque||0)+dt}
 if(holdAny&&!AS.buf&&AS.hold&&AS.hold.def&&PASES[T.tool].includes(AS.hold.def)&&G.t-(T.lastEnd||0)>.15){const hc=AS.hold.cat;AS.buf={t:0,def:hc?catDef(T,hc):AS.hold.def,cat:hc}}
 if(AS.buf){AS.buf.t+=dt;const arr=(d-1)/M.max(B.v,1.5);
  const bd=AS.buf.def;if(charging&&ahead>0&&arr<=bd.dur*.42+.02)asFire(T,B,bd,AS.buf.cat);
  else if(!charging&&AS.buf.t>1.8&&!holdAny)AS.buf=null}}
else{if(T.pase.u>.72&&charging&&ahead>0&&B.stT<1.5&&AS.hold&&AS.hold.def){const hc=AS.hold.cat,nd=hc?catDef(T,hc):AS.hold.def,arr=(d-1)/M.max(B.v,1.5);if(PASES[T.tool].includes(nd)&&arr<=nd.dur*.42+.02&&(act||[1,2,3,4].some(i=>G.keys['C'+i])||PASES[T.tool].some(q=>PH['Digit'+q.k]||G.keys['T'+q.k]))){endPase(T);asFire(T,B,nd,hc);return}}
 const held=act||[1,2,3,4].some(i=>G.keys['C'+i])||PASES[T.tool].some(q=>PH['Digit'+q.k]||G.keys['T'+q.k]);G.keys['Digit'+T.keyK]=held?1:0;T.temp=held;if(G.keys.KeyW||PH.ShiftLeft||PH.ShiftRight)G.keys.ShiftLeft=1;else G.keys.ShiftLeft=0;AS.lab='Templar';AS.buf=null}}
function asToro(dt,act){const B=C.B,T=C.T;if(!B)return;AS.lab='Embestir';if(!act){G.keys.Space=0;return}
const tg0=lureOf(T)||T.lureT||V.madd(T.p,rightOf(T.hd),1.6),aw=V.norm([tg0[0]-T.p[0],0,tg0[2]-T.p[2]]),tg=V.madd(tg0,aw,.7),d=V.d2(B.p,tg),ang=angDiff(B.h,M.atan2(tg[0]-B.p[0],tg[2]-B.p[2]));
G.keys.KeyW=1;G.keys.Space=B.fuerza>.05?1:0;AS.lab='Embestir'}
function asEncierro(dt,act,actHit){if(!E.P)return;if(!G.keys.KeyS)G.keys.KeyW=1;G.keys.Space=actHit?1:0;if(actHit)G.prev.Space=0;
const P=E.P,a=pAt(P.s);AS.lab=SEGS[a.seg].fence&&M.abs(P.l)>a.w/2-2.2?'Vallado':'Esquivar'}
function asBous(dt,act,actHit){const P=BOU.P,B=BOU.B;if(!P)return;G.keys.Space=0;
if(PH.KeyQ||G.keys.Ref){if(!AS.refH)asTap('Space');AS.refH=1}else AS.refH=0;
if(P.state!='ok'){AS.buf=null;AS.lab=P.state=='safe'?'Salir':'Recortar';if(P.state=='safe'&&actHit)asTap('Space');return}
const tgtMe=B.state=='arranca'&&B.tgt&&B.tgt.isP,d=V.d2(B.p,P.p),f=fwdOf(B.h),r=rightOf(B.h),rel=V.sub(bRuedo(P.p),B.p),al=V.dot(rel,f),lt=V.dot(rel,r);

const beside=M.abs(lt)<1.7&&al>-.2&&al<1.8*B.m.sz&&B.v>1;const k=beside?4:(P.v>2.2?1:2);AS.lab=k==4?'Anilla':k==1?'Recorte':'Quiebro';AS.ideal={1:.3,2:.36,3:.5,4:0}[k];
const garr=P.v>3.2&&d>4&&d<10,fig=P.v>2.2?6:7;AS.bl={salto:garr?'Garrocha':'Salto',fig:fig==6?'Engaño':'De rodillas'};
AS.fk=AS.fk||{};const FIG={3:PH.KeyX||(G.keys.Salto&&!garr)||PH.Digit3||G.keys.B3,4:G.keys.B4,5:PH.KeyR||G.keys.Rev||PH.Digit5||G.keys.B5,6:PH.Digit6||G.keys.Eng||(G.keys.Fig&&fig==6)||G.keys.B6,7:PH.KeyK||G.keys.Rod||(G.keys.Fig&&fig==7)||PH.Digit7||G.keys.B7,8:PH.KeyG||G.keys.Garr||(G.keys.Salto&&garr)||PH.Digit8||G.keys.B8,1:PH.Digit1||G.keys.B1,2:PH.Digit2||G.keys.Q2||G.keys.B2};
for(const kk in FIG){const on=!!FIG[kk];G.keys['Digit'+kk]=0;if(on&&!AS.fk[kk]){if(kk=='4')asTap('Digit4');else AS.buf={t:0,k:+kk,fix:1}}AS.fk[kk]=on}
if(actHit){if(k==4){asTap('Digit4');AS.buf=null}else AS.buf={t:0,k}}
if(AS.buf&&!P.man){AS.buf.t+=dt;const kk=AS.buf.fix?AS.buf.k:(k==4?1:k);const ideal={1:.3,2:.36,3:.45,5:.3,6:.4,7:.4,8:.46}[kk];AS.ideal=ideal;
 if(tgtMe){const arr=bArr(B,P.p);if(arr<=ideal+.02){asTap('Digit'+kk);AS.buf=null}}
 else if(AS.buf.t>.25&&(!tgtMe&&d<5)){asTap('Digit'+kk);AS.buf=null}else if(AS.buf.t>2.6)AS.buf=null}}
// paso de asistencia: se ejecuta antes de la lógica de cada modo
function assist(dt){const m=G.mode;if(!['torero','toro','encierro','bous'].includes(m)){AS.prev=0;return}
if(!simple()){ringUpd();return}
const act=!!(PH.Space||PH.Enter||PH.NumpadEnter||G.keys.Act),actHit=act&&!AS.prev;AS.prev=act;
if(m=='torero')asTorero(dt,act,actHit);else if(m=='toro')asToro(dt,act);else if(m=='encierro')asEncierro(dt,act,actHit);else asBous(dt,act,actHit);
const b=document.querySelector('#pad .ka');if(b&&b.dataset.k=='Act'&&m!='torero'){const sp=b.querySelector('span');if(sp&&sp.textContent!==AS.lab)sp.textContent=AS.lab;b.classList.toggle('armed',!!AS.buf)}
document.querySelectorAll('#pad .fb,#pad .pg').forEach(x=>{x.classList.toggle('sug',m=='torero'&&x.dataset.k=='T'+AS.sug);x.classList.toggle('armed',!!(AS.buf&&AS.buf.def&&x.dataset.k=='T'+AS.buf.def.k))});
keysSimple();ringUpd();$('meter').classList.toggle('keep',!!(m=='torero'&&C.kill))}
function keysSimple(){const m=G.mode;const sig=m+(C.tercio||'')+(m=='torero'&&C.kill?'k':'');if(sig===AS.kSig&&$('keys').innerHTML===AS.kHtml)return;AS.kSig=sig;let h='';
const mv='<b>W A S D</b> moverse · <b>Shift</b> correr';
if(m=='torero')h=C.kill?`<div class="kg"><b>Espacio</b> entrar a matar cuando la marca cruce el centro · <b>W/S</b> distancia</div>`:`<div class="kg">${mv} · el torero cita solo</div><div class="kg"><b>Espacio</b> pase sugerido · ${PASES[C.T?C.T.tool:'capote'].map(q=>`<b>${q.k}</b> ${q.n.replace('Pase de ','')}`).join(' ')} (pulsa antes y sale a tiempo) · mantén <b>Espacio</b> en el pase para apurar · <b>Q</b> burladero${C.tercio=='muleta'?' · <b>F</b> entrar a matar':''}</div>`;
else if(m=='toro')h=`<div class="kg">Mantén <b>Espacio</b>: el toro busca el engaño, arranca y humilla solo · <b>A/D</b> para corregir · <b>Q</b> derrote</div>`;
else if(m=='encierro')h=`<div class="kg">Corres solo · <b>A/D</b> apartarse · <b>Shift</b> esprintar · <b>Espacio</b> esquivar o subir al vallado · <b>C</b> mirar atrás</div>`;
else h=`<div class="kg">${mv} · quieto, citas solo</div><div class="kg"><b>Espacio</b> recortar (corriendo: recorte · parado: quiebro · al lado del toro: anilla) · <b>X</b> salto · <b>R</b> reverso · <b>6</b> engaño · <b>K</b> quiebro de rodillas · <b>G</b> garrocha · <b>Q</b> barrera o gàbia</div>`;
$('keys').innerHTML=h;AS.kHtml=$('keys').innerHTML}
// anillo de tiempo: se cierra al ritmo de la llegada del toro
function ringUpd(){const el=$('ring');let show=0,arr=9,ideal=.4,p=null;const m=G.mode;
if(m=='torero'&&C.T&&C.B&&!C.kill){const T=C.T,B=C.B,f=fwdOf(B.h),ahead=(T.p[0]-B.p[0])*f[0]+(T.p[2]-B.p[2])*f[2];if(B.state=='embiste'&&B.v>2.5&&ahead>0&&T.state=='ok'&&!T.pase){arr=(V.d2(B.p,T.p)-1)/M.max(B.v,1.5);ideal=(AS.buf?AS.buf.def:autoPase(T)).dur*.42;p=[T.p[0],1.1,T.p[2]];show=arr<1.9}}
else if(m=='bous'&&BOU.P&&BOU.B){const P=BOU.P,B=BOU.B;if(B.state=='arranca'&&B.tgt&&B.tgt.isP&&P.state=='ok'&&!P.man){arr=bArr(B,P.p);ideal=AS.ideal||.3;p=[P.p[0],1.1,P.p[2]];show=arr<1.9&&arr>-.1}}
if(!show||!p){if(AS.ring){el.classList.remove('on');AS.ring=0}return}
const v=R.vp,X=p[0],Y=p[1],Z=p[2],w=v[3]*X+v[7]*Y+v[11]*Z+v[15];if(w<=.1){el.classList.remove('on');return}
const sx=((v[0]*X+v[4]*Y+v[8]*Z+v[12])/w*.5+.5)*innerWidth,sy=(1-((v[1]*X+v[5]*Y+v[9]*Z+v[13])/w*.5+.5))*innerHeight;
const rIn=30,rOut=rIn+clamp((arr-ideal)/1.4,0,1)*70,now=M.abs(arr-ideal)<.11||(arr<ideal&&arr>ideal-.11);
el.style.transform=`translate(${sx}px,${sy}px)`;el.firstChild.style.width=el.firstChild.style.height=rOut*2+'px';el.classList.add('on');el.classList.toggle('now',now);el.classList.toggle('armed',!!AS.buf);AS.ring=1}
// ambiente: motas de polvo al sol y vaho del toro en la noche
function ambience(dt){const m=G.mode;if(R.q.px<.6)return;const arena=SCN.ch[0]===W.arena,pueblo=SCN.ch[0]===W.pueblo;
if((arena||(pueblo&&!BOU.night))&&M.random()<dt*14){const c=V.lerp(CAM.p,CAM.t,.5);emit([c[0]+rnd(-6,6),rnd(.4,3.5),c[2]+rnd(-6,6)],[rnd(-.08,.08),rnd(-.02,.05),rnd(-.08,.08)],rnd(.012,.022),rnd(3,6),[2.4,2.1,1.6],.5,0,1)}
if(pueblo&&BOU.night&&BOU.B&&M.random()<dt*2.2){const B=BOU.B,tp=hornTips(B),mid=V.lerp(tp[0],tp[1],.5),f=fwdOf(B.h);const n=[mid[0]+f[0]*.32*B.m.sz,mid[1]-.42*B.m.sz,mid[2]+f[2]*.32*B.m.sz];
 for(let i=0;i<3;i++)emit(n,[f[0]*.6+rnd(-.1,.1)+M.sin(B.mh)*B.v*.5,rnd(-.05,.1),f[2]*.6+rnd(-.1,.1)+M.cos(B.mh)*B.v*.5],.08,rnd(.8,1.3),[.5,.5,.55],.18)}}
