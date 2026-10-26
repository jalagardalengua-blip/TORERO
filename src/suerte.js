// ================= MATADORES (ficticios, con estilos reales) =================
const TOREROS=[
{n:'Curro Albero',a:'El Sevillano',est:'Artista',traje:'Grana y oro',arte:1.25,temple:1.2,valor:.8,espada:.85,poder:.85,skin:[.45,.27,.17],h:.98,desc:'Verónica lenta y muleta de cartel. Sufre con la espada.'},
{n:'Julián Bermejo',a:'Poderío',est:'Poderoso',traje:'Azul y oro',arte:1,temple:1,valor:1,espada:1.15,poder:1.3,skin:[.42,.25,.16],h:1.03,desc:'Manda en los toros: los lleva largos y templados.'},
{n:'Antonio Galván',a:'El Bravo',est:'De valor',traje:'Negro y azabache',arte:.95,temple:.95,valor:1.4,espada:1,poder:1,skin:[.4,.24,.15],h:1,desc:'Se pasa los pitones por la faja. Apura como nadie.'},
{n:'Diego Rondeño',a:'',est:'Clásico',traje:'Verde botella y oro',arte:1.1,temple:1.1,valor:1,espada:1.05,poder:1,skin:[.44,.27,.17],h:1.01,desc:'Pureza y cite de frente. Completo en todos los tercios.'},
{n:'Pepe Almonte',a:'Almonteño',est:'Lidiador',traje:'Tabaco y oro',arte:.9,temple:1,valor:1.05,espada:1.2,poder:1.15,skin:[.38,.22,.14],h:.99,desc:'Con oficio para los toros duros. Gran estoqueador.'},
{n:'Manuel Lucena',a:'El Lucentino',est:'Torero de arte cordobés',traje:'Purísima y oro',arte:1.2,temple:1.15,valor:.9,espada:.95,poder:.9,skin:[.46,.28,.18],h:.97,desc:'Naturales de mano baja y empaque.'},
{n:'Alejandro Salvatierra',a:'',est:'Joven figura',traje:'Blanco y plata',arte:1.05,temple:.95,valor:1.2,espada:1,poder:1.05,skin:[.47,.29,.19],h:1.02,desc:'Variedad de capote y quites espectaculares.'},
{n:'Rafael Montoro',a:'Niño de la Vega',est:'Novillero',traje:'Grana y oro',arte:.9,temple:.85,valor:1.1,espada:.85,poder:.85,skin:[.45,.28,.18],h:.96,desc:'Empieza su carrera: ganas de sobra, oficio por aprender.'}];
const TOR=()=>TOREROS[G.opts.tor||0]||TOREROS[0];
// más ganaderías (nombres ficticios, encastes reales)
GANADERIAS.push(
{n:'Los Alcornocales',enc:'Atanasio Fernández',capas:['negro','colorado','castano'],div:[[.05,.05,.05],[.85,.6,.05]],bravura:.78,nobleza:.7,fuerza:.75,size:1.06,horn:'cornidelantero'},
{n:'Dehesa del Prior',enc:'Murube',capas:['negro','negro'],div:[[.5,.02,.02],[.05,.2,.05]],bravura:.82,nobleza:.8,fuerza:.6,size:.97,horn:'veleto'},
{n:'Cerro Moreno',enc:'Saltillo',capas:['cardeno','cardeno','negro'],div:[[.85,.85,.85],[.05,.05,.3]],bravura:.88,nobleza:.45,fuerza:.7,size:.93,horn:'corniabierto',dark:1},
{n:'La Retamosa',enc:'Vega-Villar',capas:['cardeno','negro','berrendo'],div:[[.9,.55,.05],[.4,.02,.02]],bravura:.8,nobleza:.6,fuerza:.65,size:.98,horn:'veleto'},
{n:'Hnos. Requena',enc:'Contreras',capas:['negro','colorado'],div:[[.1,.3,.6],[.5,.03,.03]],bravura:.75,nobleza:.55,fuerza:.85,size:1.05,horn:'cornidelantero'},
{n:'Real Vacada del Duque',enc:'Veragua',capas:['jabonero','colorado','jabonero'],div:[[.85,.85,.85],[.6,.35,.03]],bravura:.7,nobleza:.65,fuerza:.8,size:1.08,horn:'veleto'});
// ================= ESTOCADA (suerte suprema) =================
let SWORD=null;
function swordNode(){if(SWORD)return SWORD;const st=mat({base:[.8,.82,.86],rough:.18,metal:1}),hd=mat({base:[.45,.03,.03],rough:.5});
const blade=xform(box(.014,.86,.006),T([0,-.43,0])),guard=xform(box(.13,.018,.02),T([0,0,0])),grip=xform(lathe([[0,.13],[.016,.12],[.016,.01],[0,0]],8,{smooth:true}),T([0,0,0]));
const n=new Node();n.add(new Node(makeMesh(merge([blade,guard])),st));n.add(new Node(makeMesh(grip),hd));SWORD=n;return n}
function attach(n,parent,p,r){if(n.par)n.par.ch=n.par.ch.filter(c=>c!==n);n.par=null;if(parent){parent.add(n);n.p=p;n.r=r}}
const KILL_TXT={full:'¡Estocada fulminante!',entera:'¡Estocada entera, en todo lo alto!',caida:'Estocada algo caída',pinch:'Pinchazo',hondo:'Pinchazo hondo'};
function killEnabled(){return G.opts.suerte!=='no'}
function canIndulto(){return C.score>=330&&C.B.brav>=.8&&C.B.fuerza>.2}
function tryKill(){if(!killEnabled()){endCorrida('faena');return}if(C.kill)return;
if(canIndulto()&&!C.askInd){C.askInd=G.t;R.pan=.8;R.panC=[1,.5,.1];say(TOUCH?'La plaza pide el indulto: Indultar o Matar':'La plaza pide el indulto: I para indultar, F para entrar a matar',1,'gold');return}
const T=C.T,B=C.B;if(T.pase||T.state!='ok')return;C.kill={ph:'cuadrar',t:0,tries:0,pinch:0,mk:-1,md:1,res:null};B.state='cuadrado';B.stT=0;T.cite=0;
clarin();say('El matador entra a matar',1);$('hudTitle').textContent='Suerte suprema';$('keys').innerHTML=`<div class="kg"><b>Espacio</b> entrar a matar cuando la marca pase por la cruz · <b>W/S</b> acortar o alargar distancia</div><div class="kg">Si el toro no está cuadrado, espera a que junte las manos</div>`;
$('goalTxt').textContent='Suerte suprema: cuadra al toro y entra a matar en la cruz';$('goalN').textContent='';$('goalBar').firstChild.style.width='100%';musica(false);attach(swordNode(),T.h.arms[0].wr,[0,-.06,.02],[0,0,0])}
function updKill(dt){const K=C.kill,T=C.T,B=C.B,tr=TOR();K.t+=dt;
const toB=M.atan2(B.p[0]-T.p[0],B.p[2]-T.p[2]),d=V.d2(B.p,T.p);
if(K.ph=='cuadrar'||K.ph=='perfil'){B.v=M.max(0,B.v-8*dt);const wantB=M.atan2(T.p[0]-B.p[0],T.p[2]-B.p[2]);B.h+=clamp(angDiff(B.h,wantB),-1,1)*dt*.9;B.hum=lerp(B.hum,.35,dt*2);
 // el matador se perfila a la distancia elegida
 K.dist=clamp((K.dist||3.3)+((key('KeyS')?1:0)-(key('KeyW')?1:0))*dt*1.2,2.4,4.5);const tgt=V.madd(B.p,fwdOf(B.h),K.dist+1.25);const dx=tgt[0]-T.p[0],dz=tgt[2]-T.p[2],l=M.hypot(dx,dz);
 T.spd=lerp(T.spd,l>.2?(l>3?3.4:1.3):0,M.min(1,5*dt));if(l>.2){T.p[0]+=dx/l*T.spd*dt;T.p[2]+=dz/l*T.spd*dt}T.hd+=clamp(angDiff(T.hd,toB),-3*dt,3*dt);
 const sq=M.abs(angDiff(B.h,wantB))<.18&&l<.4;if(K.ph=='cuadrar'&&sq&&K.t>1.2){K.ph='perfil';K.t=0;say('Toro cuadrado: ¡perfílate!')}
 if(K.ph=='perfil'){const sp=(1.25+K.tries*.25)/tr.espada*(G.diff||1);K.mk+=K.md*sp*dt*(1+.6*M.sin(K.t*3.1));if(K.mk>1){K.mk=1;K.md=-1}if(K.mk<-1){K.mk=-1;K.md=1}
  if(hit('Space')){K.acc=1-M.abs(K.mk);K.ph='entrada';K.t=0;K.from=[...T.p];snort()}}
 const zone=.16*tr.espada;$('meter').style.opacity=1;$('mk').style.left=((K.mk+1)/2*100)+'%';$('mz').style.left=(50-zone*50)+'%';$('mz').style.width=(zone*100)+'%';
 $('mtxt').textContent=K.ph=='cuadrar'?'Cuadrando al toro…':M.abs(K.mk)<zone?'¡En la cruz!':'Busca la cruz';rhythmCue(K.ph=='perfil'&&M.abs(K.mk)<zone)}
else if(K.ph=='entrada'){const u=M.min(1,K.t/.55);const tgt=V.madd(B.p,fwdOf(B.h),.55);T.p=V.lerp(K.from,[tgt[0],0,tgt[2]],u*.85);T.spd=3;T.hd=toB;
 if(u>=1){const a=K.acc,zone=.16*tr.espada,q=a>1-zone*.5?'full':a>1-zone?'entera':a>.55?'caida':a>.3?'pinch':'hondo';K.res=q;rhythmCue(false);
  if(q=='pinch'||q=='hondo'){K.pinch++;K.tries++;say(KILL_TXT[q],1,'red');gasp();if(q=='hondo'&&M.random()<.55){K.ph='cuadrar';K.t=0;B.der=1;cogida(T);return}
   if(K.tries>=4){K.ph='fin';endCorrida('pinchazos');return}K.ph='retira';K.t=0}
  else{K.ph='herido';K.t=0;$('meter').style.opacity=0;$('goalTxt').textContent='Espera a que el toro doble';K.tDob=q=='full'?1.6:q=='entera'?4.5:8;attach(SWORD,B.m.body,[0,.56*B.m.sz,.32*B.m.sz],[-.62,0,0]);say(KILL_TXT[q],1,'gold');ole(1.3);R.exc=1;shake(.3);cineStart(B.p,2.6,4.5,1)}}}
else if(K.ph=='retira'){const away=V.madd(B.p,fwdOf(B.h),4.5);T.p=V.lerp(T.p,[away[0],0,away[2]],M.min(1,2*dt));T.spd=1.5;if(K.t>1.6){K.ph='cuadrar';K.t=0;B.state='cuadrado'}}
else if(K.ph=='herido'){B.v=M.max(0,B.v-4*dt);B.hum=lerp(B.hum,.8,dt);B.wob=(B.wob||0)+dt;T.spd=0;T.p=V.lerp(T.p,V.madd(B.p,fwdOf(B.h),3),M.min(1,dt));
 if(K.t>K.tDob){K.ph='dobla';K.t=0;R.pan=0;say('El toro dobla',1)}}
else if(K.ph=='dobla'){B.dob=M.min(1,K.t/1.6);if(K.t>1.6&&!K.done){K.done=1;R.pan=1;R.panC=[1,1,1];ole(1.3)}if(K.t>4.2&&!C.over){K.ph='fin';endCorrida('muerte')}}
if(K.ph!='herido'&&K.ph!='dobla')bar('fzBar',B.fuerza)}
// trofeos
function trophies(){const K=C.kill,sc=C.score;const bonus={full:70,entera:40,caida:12}[K.res]||0;const tot=sc+bonus-K.pinch*35;let orejas=tot>=430&&K.res=='full'&&!K.pinch?3:tot>=300?2:tot>=200?1:0;
let title,sub;if(orejas==3){title='Dos orejas y rabo';sub='Triunfo histórico. Salida a hombros por la Puerta Grande.'}else if(orejas==2){title='Dos orejas: Puerta Grande';sub='El presidente saca dos veces el pañuelo blanco. Salida a hombros.'}
else if(orejas==1){title='Una oreja';sub='Petición mayoritaria y el presidente concede el trofeo.'}else if(tot>=140){title='Vuelta al ruedo';sub='Petición de oreja no atendida: el matador da la vuelta al ruedo.'}
else if(tot>=90){title='Ovación y saludos';sub='El matador saluda desde el tercio.'}else if(tot>=40){title='Palmas';sub='Faena correcta, sin terminar de romper.'}else if(K.pinch>=2){title='Pitos';sub='Se le fue el triunfo con la espada.'}else{title='Silencio';sub='No hubo acople entre toro y torero.'}
return{title,sub,orejas,tot}}
// ================= MUERTE DEL TORO (sin sangre) =================
function animDobla(B,dt){const m=B.m;if(B.wob){m.body.r[2]+=M.sin(B.wob*2.3)*.04;m.neck.r[0]=M.max(m.neck.r[0],.55)}
if(!B.dob)return;const u=sstep(0,1,B.dob),u2=sstep(.35,1,B.dob);
m.legs.forEach((L,i)=>{if(L.front){L.hip.r[0]=-.25*u;L.knee.r[0]=1.6*u}else{L.hip.r[0]=lerp(L.hip.r[0],-.9,u);L.knee.r[0]=lerp(L.knee.r[0],1.5,u)}L.hoof.r[0]=-(L.hip.r[0]+L.knee.r[0])*.6});
m.body.p[1]=m.sz*lerp(.95,.42,u);m.root.r[2]=u2*1.25;m.root.p[1]=u2*.12;m.neck.r[0]=lerp(m.neck.r[0],.25,u2);m.head.r[0]=lerp(m.head.r[0],.3,u2)}
// ================= APURAR =================
function apurarMax(){return clamp(.32*TOR().valor,.2,.55)}

// sombra de contacto (oclusión ambiental bajo toro y torero)
function aoMesh(ex){const g=disc(1,5,28);for(let k=0;k<g.vc;k++)g.p[k*3+2]*=ex;return makeMesh(g)}
function aoUpd(){if(!W.arena||!C.B||!C.T)return;if(!W.aoB){W.aoB=W.arena.add(new Node(aoMesh(2.3),mat({mode:5,transp:1,alpha:.62})));W.aoT=W.arena.add(new Node(aoMesh(1),mat({mode:5,transp:1,alpha:.5})));W.aoB.cast=W.aoT.cast=false}
const B=C.B,T=C.T,sz=B.m.sz||1;W.aoB.p=[B.p[0],.025,B.p[2]];W.aoB.r=[0,B.h,0];W.aoB.s=.62*sz*(1+(B.dob||0)*.5);
W.aoT.vis=T.state=='ok'||!!T.toss;W.aoT.p=[T.p[0],.03,T.p[2]];W.aoT.s=.42}
