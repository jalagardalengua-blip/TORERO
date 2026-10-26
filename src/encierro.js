// ================= ENCIERRO DE SAN FERMÍN =================
const SEGS=[{n:'Cuesta de Santo Domingo',len:280,w:7.2,turn:-8,slope:.032,fence:0},{n:'Plaza del Ayuntamiento',len:50,w:13,turn:22,slope:0,fence:1},
{n:'Calle Mercaderes',len:95,w:7,turn:-14,slope:0,fence:0},{n:'Curva de Estafeta',len:11,w:7.6,turn:90,slope:0,fence:0,curve:1},
{n:'Calle Estafeta',len:304,w:5.6,turn:5,slope:.004,fence:0},{n:'Tramo de Telefónica',len:84,w:9.5,turn:-12,slope:-.02,fence:1},{n:'Callejón',len:24.6,w:5,turn:0,slope:-.03,fence:0}];
const PATH={ds:.5};
function buildPath(){const X=[],Z=[],Y=[],H=[],Wd=[],SG=[];let x=0,z=0,y=0,h=0,s=0;const d=PATH.ds;
SEGS.forEach((g,gi)=>{const n=M.round(g.len/d);for(let k=0;k<n;k++){const u=k/n,ww=gi>0?lerp(SEGS[gi-1].w,g.w,sstep(0,.18,u)):g.w;
const tr=g.curve?g.turn/n:(u<.3?g.turn/(n*.3):0);h-=tr*PI/180;X.push(x);Z.push(z);Y.push(y);H.push(h);Wd.push(ww);SG.push(gi);x+=M.sin(h)*d;z+=M.cos(h)*d;y+=g.slope*d;s+=d}});
X.push(x);Z.push(z);Y.push(y);H.push(h);Wd.push(SEGS[SEGS.length-1].w);SG.push(SEGS.length-1);Object.assign(PATH,{X,Z,Y,H,W:Wd,SG,L:(X.length-1)*d})}
function pAt(s){const d=PATH.ds,f=clamp(s/d,0,PATH.X.length-1.001),i=M.floor(f),t=f-i,P=PATH;
const h=lerp(P.H[i],P.H[i+1],t);return{x:lerp(P.X[i],P.X[i+1],t),z:lerp(P.Z[i],P.Z[i+1],t),y:lerp(P.Y[i],P.Y[i+1],t),h,w:lerp(P.W[i],P.W[i+1],t),seg:P.SG[i]}}
function sl2w(s,l){const a=pAt(s),r=rightOf(a.h);return[a.x+r[0]*l,a.y,a.z+r[2]*l]}
function buildStreet(){buildPath();const root=new Node();const P=PATH;
const cob=mat({base:[1,1,1],rough:.78,alb:TX.cobA,det:TX.cobN,uv:[.5,.5],detS:1.2});
// calzada
{const g=new Geo(),n=P.X.length;for(let k=0;k<n;k++){const h=P.H[k],r=rightOf(h),w=P.W[k]/2+.8;for(const sd of[-1,1]){g.p.push(P.X[k]+r[0]*w*sd,P.Y[k],P.Z[k]+r[2]*w*sd);g.n.push(0,1,0);g.u.push(w*sd,k*P.ds)}}
for(let k=0;k<n-1;k++){const a=k*2;g.i.push(a,a+2,a+1,a+1,a+2,a+3)}fixWinding(g);const nd=new Node(makeMesh(g),cob);nd.cast=false;root.add(nd)}
// edificios
const fac=[],gf=[],roofs=[],balc=[];const tints=[[1,.9,.72],[.98,.96,.92],[.92,.95,1],[1,.86,.8],[.95,.88,.7],[.9,.98,.9],[1,.96,.84]];const seats=[];
for(const sd of[-1,1]){let s=0;while(s<P.L-2){const len=rnd(6,10.5),s1=M.min(P.L,s+len);const a=pAt(s),b=pAt(s1);const ra=rightOf(a.h),rb=rightOf(b.h);
const wa=a.w/2+.8,wb=b.w/2+.8;const A=[a.x+ra[0]*wa*sd,0,a.z+ra[2]*wa*sd],B=[b.x+rb[0]*wb*sd,0,b.z+rb[2]*wb*sd];const y0=M.min(a.y,b.y)-.4,fl=((rnd(3,5.99))|0),Hh=3.6+fl*3.1+.4;
const tint=tints[(M.random()*tints.length)|0];const nrm=V.norm([-(ra[0]+rb[0])*sd,0,-(ra[2]+rb[2])*sd]);const L=V.d2(A,B);
const quad=(p0,p1,ya,yb,u0,u1,v0,v1,col,arr,nn=nrm)=>{const g=new Geo();g.p=[p0[0],ya,p0[2],p1[0],ya,p1[2],p1[0],yb,p1[2],p0[0],yb,p0[2]];g.n=[...nn,...nn,...nn,...nn];g.u=[u0,v0,u1,v0,u1,v1,u0,v1];g.i=[0,1,2,0,2,3];g.c=[...col,0,...col,0,...col,0,...col,0];fixWinding(g);arr.push(g)};
quad(A,B,y0,a.y+3.6,0,L/3,0,1.1,V.sc(tint,.82),gf);quad(A,B,a.y+3.6,y0+Hh,0,M.round(L/3)||1,0,fl,tint,fac);
const back=V.madd(A,nrm,-9),backB=V.madd(B,nrm,-9);quad(A,B,y0+Hh,y0+Hh,0,1,0,1,[.42,.2,.13],roofs,[0,1,0]);
{const g=new Geo(),top=y0+Hh;g.p=[A[0],top,A[2],B[0],top,B[2],backB[0],top+1.8,backB[2],back[0],top+1.8,back[2]];g.n=[0,1,0,0,1,0,0,1,0,0,1,0];g.u=[0,0,1,0,1,1,0,1];g.i=[0,1,2,0,2,3];g.c=[.4,.19,.12,0,.4,.19,.12,0,.36,.17,.1,0,.36,.17,.1,0];fixWinding(g);roofs.push(g)}
// balcones
const bays=M.max(1,M.round(L/3)),dir=V.norm(V.sub(B,A)),hh=M.atan2(dir[0],dir[2]);for(let f=1;f<fl;f++)for(let k=0;k<bays;k++){if(M.random()<.25)continue;const c=V.lerp(A,B,(k+.5)/bays),yy=a.y+3.6+f*3.1-2.65;const base=V.madd(c,nrm,.3);
const mt=T([base[0],yy,base[2]],[0,hh-PI/2,0]);balc.push(paint(xform(box(1.35,.1,.6),mt),()=>[.62,.58,.52,0]));for(const zz of[.28,-.28])balc.push(paint(xform(box(1.35,.95,.03),m4.mul(m4.id(),mt,T([0,.5,zz]))),()=>[.04,.04,.045,0]));
if(M.random()<.55)seats.push([V.madd(base,nrm,-.05),yy+.42,M.atan2(nrm[0],nrm[2]),M.random()<.5?2:1])}
s=s1}}
const facM=mat({base:[1,1,1],rough:.85,alb:TX.facA,det:TX.facN,uv:[1,1],detS:1}),gfM=mat({base:[1,1,1],rough:.9,alb:TX.stoneA,det:TX.stoneN,uv:[.6,.6]}),roofM=mat({base:[1,1,1],rough:.8}),balM=mat({base:[1,1,1],rough:.6,metal:.2});
for(const[arr,m]of[[fac,facM],[gf,gfM],[roofs,roofM],[balc,balM]]){for(let i=0;i<arr.length;i+=400)root.add(new Node(makeMesh(merge(arr.slice(i,i+400))),m))}
// vallado
const val=[];for(let s=0;s<P.L;s+=1.6){const a=pAt(s);if(!SEGS[a.seg].fence)continue;const r=rightOf(a.h);for(const sd of[-1,1])for(const off of[.5,1.4]){const l=(a.w/2-off)*sd,c=[a.x+r[0]*l,a.y,a.z+r[2]*l];const mt=T(c,[0,a.h,0]);
val.push(paint(xform(box(.13,1.55,.13),m4.mul(m4.id(),mt,T([0,.77,0]))),()=>[.42,.3,.18,0]));for(const yy of[.45,.9,1.35])val.push(paint(xform(box(.05,.14,1.6),m4.mul(m4.id(),mt,T([0,yy,.8]))),()=>[.5,.37,.22,0]))}}
const valM=mat({base:[1,1,1],rough:.8,alb:TX.woodA,uv:[.3,.3]});for(let i=0;i<val.length;i+=600)root.add(new Node(makeMesh(merge(val.slice(i,i+600))),mat({base:[1,1,1],rough:.85})));
// público tras el vallado
for(let s=0;s<P.L;s+=.7){const a=pAt(s);if(!SEGS[a.seg].fence)continue;const r=rightOf(a.h);for(const sd of[-1,1])if(M.random()<.8){const l=(a.w/2+.15)*sd;seats.push([[a.x+r[0]*l,0,a.z+r[2]*l],a.y+.75+rnd(0,.15),M.atan2(-r[0]*sd,-r[2]*sd),1])}}
const cm=makeMesh(crowdMesh());const pal=[[.85,.85,.83],[.85,.85,.83],[.85,.85,.83],[.55,.04,.04],[.15,.2,.4],[.3,.3,.3]];let n=0;seats.forEach(q=>n+=q[3]);addInst(cm,n);let k=0;
for(const[p,y,h,c]of seats)for(let j=0;j<c;j++){setInst(cm,k++,T([p[0]+j*.5*M.cos(h),y,p[2]-j*.5*M.sin(h)],[0,h+rnd(-.3,.3),0],rnd(.95,1.05)),[...pal[(M.random()*pal.length)|0],M.random()])}instUpload(cm);
const cr=new Node(cm,mat({base:[1,1,1],rough:.8,anim:1}));cr.cast=false;root.add(cr);
// plaza al final
const e=pAt(P.L),f=fwdOf(e.h),pc=[e.x+f[0]*41,e.y,e.z+f[2]*41];const brick=mat({base:[1,1,1],rough:.85,alb:TX.brickA,det:TX.brickN,uv:[.5,.5]});
const ext=new Node(makeMesh(lathe([[40,-1],[40,17],[41,17],[41,18.2]].map(p=>p),128,{flip:true})),brick);ext.p=pc;root.add(ext);
const tun=new Node(makeMesh(box(5.2,4.2,2)),mat({base:[.008,.006,.005],rough:1}));tun.p=[e.x+f[0]*.8,e.y+2.1,e.z+f[2]*.8];tun.r=[0,e.h,0];root.add(tun);
const gnd=new Node(makeMesh(disc(900,4,48)),mat({base:[.3,.27,.22],rough:1}));gnd.p=[P.X[M.floor(P.X.length/2)],-3,P.Z[M.floor(P.X.length/2)]];gnd.cast=false;root.add(gnd);
return root}
const E={};
function startEncierro(){G.mode='encierro';G.ai=false;Object.assign(ENV,ENV_MANANA);if(!W.street)W.street=buildStreet();TRK.off=1;SCN.ch=[W.street];
if(E.actors)W.street.ch=W.street.ch.filter(n=>!E.actors.includes(n));E.actors=[];
E.t=-4;E.pts=0;E.horn=0;E.over=0;E.coh=0;E.max=0;E.seg=-1;
const pl=buildHuman({kind:'mozo',skin:[.6,.4,.28]});W.street.add(pl.root);E.actors.push(pl.root);E.P={h:pl,s:46,l:0,v:0,vl:0,stam:1,state:'run',ft:0,aph:0,dodge:0,look:0};
E.mozos=[];for(let i=0;i<28;i++){const h=buildHuman({kind:'mozo',skin:[rnd(.5,.7),rnd(.32,.45),rnd(.2,.3)]});W.street.add(h.root);E.actors.push(h.root);E.mozos.push({h,s:rnd(20,260),l:rnd(-2.2,2.2),v:0,state:'run',ft:0,aph:rnd(0,1),bold:M.random(),seed:M.random()})}
E.bulls=[];const capas=['negro','negro','castano','negro','colorado','cardeno'];
for(let i=0;i<10;i++){const cab=i>=6;const m=buildBull(cab?{capa:['berrendo','colorado','jabonero','berrendo'][i-6],cabestro:true,size:1.08,seed:i*7}:{capa:capas[i],size:rnd(.98,1.06),seed:i*13,horn:['veleto','cornidelantero','corniabierto'][i%3]});
W.street.add(m.root);E.actors.push(m.root);E.bulls.push({m,s:-6-rnd(0,8)-(cab?rnd(0,6):0),l:rnd(-2,2),v:0,yr:0,ph:rnd(0,1),hum:0,der:0,paw:0,hd:[0,0,0,0],cab,slip:0,lag:M.random()<.2?rnd(.85,.93):1,p:[0,0,0],h:0,bell:0})}
$('hudTitle').textContent='Encierro de San Fermín';$('hudSub').textContent='848,6 m · 6 toros y 4 cabestros · de los corrales de Santo Domingo a la plaza';
$('keys').innerHTML=`<div class="kg"><b>W</b> correr · <b>Shift</b> esprintar · <b>A/D</b> apartarse · <b>S</b> frenar</div><div class="kg"><b>C</b> mirar atrás · <b>Espacio</b> saltar el vallado o quiebro</div>`;
$('scoreLbl').textContent='Carrera';show('hud');hide('menu');hide('result');crowdLevel(.18);R.exc=.4;R.pan=0;say('Faltan segundos para las ocho',1);G.cam.yaw=0;G.cam.pitch=0}
function encW(s,l){return sl2w(s,l)}
function animMozo(o,dt,look){const H=o.h,w=encW(o.s,o.l),a=pAt(o.s);let hh=a.h+M.atan2(o.vl||0,M.max(1,o.v));
H.root.p=[w[0],w[1]+(o.state=='fall'?.12:0),w[2]];H.root.r=o.state=='fall'?[-PI/2*.98,hh,0]:[0,hh,0];
o.aph=animHuman(H,{speed:o.state=='fall'?0:o.v,ph:o.aph,lean:o.v>5?.12:0,look:look||0,free:[1,1]},dt);
if(o.state!='fall'){const run=sstep(2,6,o.v),c=o.aph*TAU;H.arms[1].sh.q=Q.euler(-.4-run*.9+M.sin(c)*.4,0,-.15);H.arms[1].el.q=Q.euler(-1.2,0,0)}}
function updEncierro(dt,rdt){E.t+=dt;const P=E.P;
if(E.t<0){if(M.ceil(E.t)!==E.cd){E.cd=M.ceil(E.t);if(E.cd>0)say(String(E.cd),1)}}else if(!E.coh){E.coh=1;cohete();say('¡Cohete! Salen los toros',1,'red');R.exc=.9}
// jugador
if(P.state=='run'){const fw=key('KeyW')||key('ArrowUp'),bk=key('KeyS')||key('ArrowDown'),sp=(key('ShiftLeft')||key('ShiftRight'))&&P.stam>.02,lt=(key('KeyD')||key('ArrowRight')?1:0)-(key('KeyA')||key('ArrowLeft')?1:0);
let tv=fw?(sp?8.1:6):bk?0:2.2;P.v+=clamp(tv-P.v,-8*dt,(sp?5:3.5)*dt);if(sp&&fw)P.stam=M.max(0,P.stam-dt/6);else P.stam=M.min(1,P.stam+dt/(P.v<4?5:14));
P.vl=lerp(P.vl,-lt*2.8+(P.dodge>0?P.dsd*6:0),M.min(1,8*dt));P.dodge-=dt;
if(hit('Space')){const a=pAt(P.s);if(SEGS[a.seg].fence&&M.abs(P.l)>a.w/2-2.2){P.state='safe';P.ft=0;say('¡Al vallado!',1)}else if(P.dodge<-.6){P.dodge=.25;P.dsd=P.l>0?-1:1;if(lt)P.dsd=-lt}}
P.s+=P.v*dt;P.l+=P.vl*dt}
else if(P.state=='fall'){P.ft+=dt;P.v=M.max(0,P.v-10*dt);P.s+=P.v*dt;if(P.ft>1.6){P.state='run';say('¡Arriba!')}}
else if(P.state=='safe'){P.ft+=dt;const a=pAt(P.s);P.l=lerp(P.l,M.sign(P.l)*(a.w/2+.5),M.min(1,3*dt));if(P.ft>2.5&&!E.over)endEncierro('vallado')}
const ap=pAt(P.s);if(P.state!='safe')P.l=clamp(P.l,-ap.w/2+.45,ap.w/2-.45);
if(E.seg!==ap.seg){E.seg=ap.seg;$('hudTitle').textContent=SEGS[ap.seg].n}
// toros
const herd=E.bulls.filter(b=>!b.cab).reduce((a,b)=>a+b.s,0)/6;let lead=null;
for(const b of E.bulls){const a=pAt(b.s);if(E.t<0){b.v=0}else{let tv=(b.cab?7.3:7.0)*(G.diff||1)*b.lag;if(a.seg==0)tv*=.93;const ah=b.s-herd;if(ah>7)tv*=.88;if(ah<-9)tv*=1.12;
 if(b.slip>0){b.slip-=dt;tv=0;b.v*=.9}b.v+=clamp(tv-b.v,-6*dt,4*dt);
 let wl=0;for(const o of E.bulls)if(o!==b){const ds=o.s-b.s,dl=o.l-b.l;if(M.abs(ds)<2.6&&M.abs(dl)<1.3){wl-=M.sign(dl||.1)*(1.3-M.abs(dl))*2.2}}
 if(SEGS[a.seg].curve&&b.v>5){wl+=(SEGS[a.seg].turn>0?-1:1)*b.v*b.v/9*.55;if(M.abs(b.l)>a.w/2-.95&&M.random()<dt*1.2&&b.slip<=0){b.slip=1.5;shake(.2);gasp();say('¡Un toro resbala en la curva!')}}
 const tgt=P.state=='run'&&M.abs(P.s-b.s)<10&&!b.cab?(P.l-b.l)*.15:0;b.vl=lerp(b.vl||0,wl+tgt-b.l*.15,M.min(1,3*dt));b.s+=b.v*dt;b.l+=b.vl*dt;b.l=clamp(b.l,-a.w/2+.75,a.w/2-.75)}
 const w=encW(b.s,b.l);b.p=w;const nh=a.h+M.atan2(-(b.vl||0),M.max(1,b.v));b.yr=angDiff(b.h,nh)/M.max(dt,1e-3)*.2;b.h=nh;
 animBull(b,dt);b.m.root.p=[w[0],w[1],w[2]];b.m.root.r=[b.slip>0?.0:0,b.h,b.slip>0?.55:0];
 if(b.cab&&b.v>2){b.bell-=dt;if(b.bell<0){b.bell=rnd(.25,.45);const dd=M.abs(b.s-P.s);if(dd<40)bellS(.05*(1-dd/40))}}
 if(b.s<P.s+.5&&(!lead||b.s>lead.s))lead=b;
 // atropellos de mozos
 for(const o of E.mozos)if(o.state!='fall'&&M.abs(o.s-b.s-1.2)<.7&&M.abs(o.l-b.l)<.75&&b.v>3){o.state='fall';o.ft=0;o.v*=.3;R.exc=M.min(1,R.exc+.2);if(M.abs(o.s-P.s)<25)gasp()}
 // cogida al jugador
 if(P.state=='run'||P.state=='fall'){const ds=P.s-b.s,dl=M.abs(P.l-b.l);if(ds>.4&&ds<1.7&&dl<.6&&b.v>3&&!(P.state=='fall'&&M.random()<.5)){if(!E.over){E.over=1;P.state='cogido';P.ft=0;gasp();shake(.8);say('¡Cogida!',1,'red');cineStart(sl2w(P.s,P.l),2.4,4,1.2);setTimeout(()=>endEncierro('cogida'),2600)}}}}
// mozos
let gapLead=lead?P.s-lead.s:99;for(const o of E.mozos){const a=pAt(o.s);const bl=E.bulls.reduce((m,b)=>b.s<o.s+1&&o.s-b.s<m?o.s-b.s:m,99);
 if(o.state=='fall'){o.ft+=dt;o.v=M.max(0,o.v-9*dt);if(o.ft>2.2)o.state='run'}
 else{let tv=E.t<0?0:bl>45?3.6:bl>22?5.6:7+o.bold*1.2;let tl=o.l;if(bl<7&&o.bold<.6){tl=M.sign(o.l||1)*(a.w/2-.5);tv=M.min(tv,3)}
  if(bl<4&&M.random()<dt*.25){o.state='fall';o.ft=0}
  o.v+=clamp(tv-o.v,-7*dt,4*dt);o.vl=clamp((tl-o.l)*1.5,-2.5,2.5);
  for(const q of E.mozos)if(q!==o&&M.abs(q.s-o.s)<.8&&M.abs(q.l-o.l)<.6)o.vl+=(o.l>q.l?1:-1)*1.5}
 o.s+=o.v*dt;o.l=clamp(o.l+(o.vl||0)*dt,-a.w/2+.45,a.w/2-.45);
 if(P.state=='run'&&o.state!='fall'&&M.abs(o.s-P.s)<.55&&M.abs(o.l-P.l)<.5&&P.v>5.5&&P.v>o.v+1.5){if(M.random()<.45){P.state='fall';P.ft=0;say('¡Tropiezas!',1,'red');shake(.3)}else{P.v*=.6;o.state='fall';o.ft=0}}
 if(o.s<P.s-40||o.s>P.s+160||o.s>PATH.L-5){o.s=P.s+rnd(25,90);if(o.s>PATH.L-8)o.s=P.s-rnd(15,30);o.l=rnd(-2,2);o.v=4;o.state='run'}
 animMozo(o,dt,bl<15?(o.seed>.5?2.2:-2.2):0)}
// jugador animación
if(P.state!='cogido')animMozo(P,dt,key('KeyC')?2.6:0);else{const q=P.h;P.ft+=dt;const w=encW(P.s,P.l);q.root.p=[w[0],w[1]+M.max(0,M.sin(M.min(1,P.ft/1.1)*PI)*2.2),w[2]];q.root.r=[P.ft*6,pAt(P.s).h,0]}
// puntuación
if(P.state=='run'&&E.t>0){E.max=M.max(E.max,P.s-46);if(lead&&gapLead>.6&&gapLead<5){E.horn+=dt;E.pts+=dt*(6-gapLead)*4;$('combo').textContent='¡En los cuernos! '+gapLead.toFixed(1)+' m';R.exc=M.min(1,R.exc+dt*.3)}else $('combo').textContent=lead?`Toros a ${gapLead.toFixed(0)} m`:'Los toros te han pasado';E.pts+=P.v*dt*.12}
if(P.s>=PATH.L-1&&!E.over){E.over=1;E.pts+=150;say('¡Entras en la plaza!',1,'gold');R.exc=1;ole(1.2);setTimeout(()=>endEncierro('plaza'),1800)}
if(!E.over&&E.bulls.every(b=>b.s>PATH.L-2)){E.over=1;endEncierro('pasado')}
if(!E.over&&lead===null&&E.t>3&&E.bulls.every(b=>b.s>P.s+15)&&P.state!='safe'){E.over=1;setTimeout(()=>endEncierro('pasado'),1500)}
// HUD
encGoal(P);$('score').textContent=M.round(E.pts);bar('fzBar',P.stam);bar('amb',R.exc);$('clock').textContent=E.t<0?'7:59':fmtT(E.t);$('avisos').textContent='';$('fzLbl').textContent='Aliento';
const mt=$('meter');mt.style.opacity=1;$('mk').style.left=clamp((1-gapLead/30)*100,0,100)+'%';$('mz').style.left=(1-5/30)*100+'%';$('mz').style.width=(4.2/30*100)+'%';$('mtxt').textContent=lead?(gapLead<5?'¡En los cuernos!':'Distancia a los toros'):'';
R.exc=M.max(.15,R.exc-dt*.15);crowdLevel(.1+R.exc*.3);
// cámara
const wp=encW(P.s,P.l),pa=pAt(P.s),fd=fwdOf(pa.h);if(!cineUpd(rdt)){G.ts=lerp(G.ts,1,M.min(1,4*rdt));CAM.fov=lerp(CAM.fov,P.v>7?68:58,M.min(1,3*rdt));
 const back=key('KeyC');const yaw=pa.h+(back?PI:0);const focus=[wp[0],wp[1],wp[2]];const look=back?V.add(V.madd(wp,fd,-8),[0,1.2,0]):V.add(V.madd(wp,fd,7),[0,1.4,0]);
 camFollow(rdt,focus,look,back?3.2:4.4,wp[1]+2.3,yaw)}
R.fx.spd=clamp((P.v-6)/3,0,1)*.5;R.fx.vig=gapLead<3?.35:0;R.fx.red=gapLead<1.8?.25:0;
ENV.sh0c=[wp[0],0,wp[2]];ENV.sh0h=16;ENV.sh1c=V.madd(wp,fd,30);ENV.sh1h=80}
function endEncierro(why){if(G.mode=='result')return;G.prevMode='encierro';G.mode='result';const P=E.P;R.fx.red=0;
const t={plaza:['¡Dentro de la plaza!','Has llegado al ruedo delante de la manada.'],cogida:['Cogida','El toro te alcanzó. Los pastores apartan a la manada.'],vallado:['A salvo tras el vallado','Te has puesto a cubierto en el momento justo.'],pasado:['La manada pasó','Los toros han entrado en la plaza.']}[why];
$('rTitle').textContent=t[0];$('rSub').textContent=t[1];$('rPan').hidden=true;
stats([['Puntos de carrera',M.round(E.pts)],['Metros recorridos',M.round(E.max)+' m'],['Segundos en los cuernos',E.horn.toFixed(1)+' s'],['Tiempo',fmtT(M.max(0,E.t))]]);hide('hud');show('result');$('again').focus()}
const ENV_MANANA={sun:V.norm([.62,.33,-.71]),sunC:[4.6,4.0,3.3],skyT:[.17,.36,.76],skyH:[.86,.84,.8],gnd:[.36,.33,.29],fogC:[.78,.77,.75],fogD:.0028,cloud:.3,cloudC:[1.2,1.15,1.1],exp:1.15,amb:.6};
