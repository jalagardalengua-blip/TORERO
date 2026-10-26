// ================= BOUS AL CARRER: plaza de pueblo, recortadores y bou embolat =================
if(!V.d)V.d=(a,b)=>M.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const BOU={};
const BMOD=[
{id:'concurso',n:'Concurso de recortes',h:'Tarde · Plaça Major',d:'Concurso de retalladors: recorte, quiebro, salto y anillas. Tres jueces puntúan cada ejecución del 1 al 10.'},
{id:'embolat',n:'Bou embolat',h:'Noche · fuego en las astas',d:'El toro sale capllaçat al pal, le encienden las bolas y lo sueltan en la plaza. Recorta a la luz del fuego.'}];
// recinto transitable por el toro (plaza + Carrer Major + Carrer de Sant Roc)
const BR=[{x0:-18,x1:18,z0:-14,z1:14},{x0:-3.5,x1:3.5,z0:11.5,z1:46},{x0:-50,x1:-15.5,z0:-3.5,z1:3.5}];
const BCAGE=[[-9,-5],[9.5,5]];
const BSEG=(()=>{const S=[],a=(ax,az,bx,bz,nx,nz,t)=>S.push({a:[ax,az],b:[bx,bz],n:[nx,nz],t,L:M.hypot(bx-ax,bz-az)});
a(-18,14,-3.5,14,0,1,'cad');a(3.5,14,18,14,0,1,'cad');a(-18,-14,18,-14,0,-1,'cad');a(18,-14,18,14,1,0,'cad');a(-18,-14,-18,-3.5,-1,0,'cad');a(-18,3.5,-18,14,-1,0,'cad');
a(-3.5,14,-3.5,46,-1,0,'bar');a(3.5,14,3.5,46,1,0,'bar');a(-3.5,46,-1.25,46,0,1,'tij');a(1.25,46,3.5,46,0,1,'tij');
a(-50,-3.5,-18,-3.5,0,-1,'bar');a(-50,3.5,-18,3.5,0,1,'bar');a(-50,-3.5,-50,3.5,-1,0,'tij');return S})();
function bClamp(p,r){let best=null,bd=1e9;for(const q of BR){const x=clamp(p[0],q.x0+r,q.x1-r),z=clamp(p[2],q.z0+r,q.z1-r),d=(x-p[0])**2+(z-p[2])**2;if(d<1e-9)return{p,hit:0};if(d<bd){bd=d;best=[x,p[1]||0,z]}}
const l=M.sqrt(bd);return{p:best,hit:1,n:[(p[0]-best[0])/l,(p[2]-best[2])/l]}}
function bNearSeg(p){let o=null;for(const s of BSEG){const dx=s.b[0]-s.a[0],dz=s.b[1]-s.a[1],t=clamp(((p[0]-s.a[0])*dx+(p[2]-s.a[1])*dz)/(s.L*s.L),.03,.97),q=[s.a[0]+dx*t,0,s.a[1]+dz*t],d=M.hypot(p[0]-q[0],p[2]-q[2]);if(!o||d<o.d)o={s,q,d}}return o}
function bRefuge(p){const o=bNearSeg(p);let best=o?{d:o.d,front:V.madd(o.q,[o.s.n[0],0,o.s.n[1]],-.7),safe:V.madd(o.q,[o.s.n[0],0,o.s.n[1]],o.s.t=='cad'?.9:.8),n:o.s.n}:null;
for(const c of BCAGE){const d=M.hypot(p[0]-c[0],p[2]-c[1])-1;if(!best||d<best.d){const dir=V.norm([p[0]-c[0],0,p[2]-c[1]]);best={d,front:[c[0]+dir[0]*1.6,0,c[1]+dir[2]*1.6],safe:[c[0],0,c[1]],n:[-dir[0],-dir[2]],cage:1}}}return best}
const ENV_BOUS={sun:V.norm([.62,.27,-.74]),sunC:[5.3,3.8,2.5],skyT:[.12,.25,.6],skyH:[.96,.76,.56],gnd:[.42,.35,.27],fogC:[.86,.7,.55],fogD:.0042,cloud:.4,cloudC:[1.3,1.0,.82],exp:1.12,amb:.62};
const ENV_NOCHE={sun:V.norm([.35,.72,.45]),sunC:[.13,.17,.3],skyT:[.003,.006,.018],skyH:[.03,.028,.04],gnd:[.04,.035,.03],fogC:[.02,.018,.022],fogD:.0065,cloud:.12,cloudC:[.04,.04,.06],exp:1.85,amb:.32};
// ---------- construcción del pueblo ----------
function bBoxAt(arr,c,w,h,d,hd,col,extra){const m=extra?m4.mul(m4.id(),T(c,[0,hd,0]),extra):T(c,[0,hd,0]);arr.push(paint(xform(box(w,h,d),m),()=>col))}
function bFacade(F,A,B,fl,tint,nrm,o={}){const L=V.d2(A,B);if(L<.5)return;const bays=M.max(1,M.round(L/3)),dir=V.norm(V.sub(B,A)),hd=M.atan2(dir[0],dir[2])-PI/2,hn=M.atan2(nrm[0],nrm[2]),H=3.6+fl*3.1,tw=L/bays;
const quad=(p0,p1,ya,yb,u0,u1,v0,v1,col,arr,nn=nrm)=>{const g=new Geo();g.p=[p0[0],ya,p0[2],p1[0],ya,p1[2],p1[0],yb,p1[2],p0[0],yb,p0[2]];g.n=[...nn,...nn,...nn,...nn];g.u=[u0,v0,u1,v0,u1,v1,u0,v1];g.i=[0,1,2,0,2,3];g.c=[...col,0,...col,0,...col,0,...col,0];fixWinding(g);arr.push(g)};
quad(A,B,0,3.6,0,L/3,0,1.2,V.sc(tint,.82),F.gf);quad(A,B,3.6,H,0,bays,0,fl,tint,F.fac);
bBoxAt(F.trim,V.add(V.lerp(A,B,.5),[nrm[0]*.18,H+.1,nrm[2]*.18]),L+.3,.28,.4,hd,[...V.sc(tint,.78),0]);
bBoxAt(F.trim,V.add(V.lerp(A,B,.5),[nrm[0]*.08,3.55,nrm[2]*.08]),L,.14,.18,hd,[.7,.66,.6,0]);
{const back=V.madd(A,nrm,-8),backB=V.madd(B,nrm,-8),g=new Geo(),top=H+.2;g.p=[A[0],top,A[2],B[0],top,B[2],backB[0],top+2.4,backB[2],back[0],top+2.4,back[2]];g.n=[0,1,0,0,1,0,0,1,0,0,1,0];g.u=[0,0,1,0,1,1,0,1];g.i=[0,1,2,0,2,3];g.c=[.42,.19,.11,0,.42,.19,.11,0,.36,.16,.09,0,.36,.16,.09,0];fixWinding(g);F.roof.push(g)}
for(let k=0;k<bays;k++){const c=V.lerp(A,B,(k+.5)/bays);
 // puerta en planta baja
 if(M.random()<.5)bBoxAt(F.dark,V.add(c,[nrm[0]*.03,1.25,nrm[2]*.03]),1.15,2.5,.06,hd,[.09,.05,.03,0]);
 for(let f=0;f<fl;f++){const yw=3.6+(f+.49)*3.1;
  if(o.night!==false&&M.random()<.32)F.win.push(paint(xform(box(tw*.24,1.86,.02),T(V.add(c,[nrm[0]*.025,yw,nrm[2]*.025]),[0,hd,0])),()=>[1,1,1,0]));
  if(f>=0&&M.random()<.48){const yb=3.6+f*3.1+.5,base=V.madd(c,nrm,.3);bBoxAt(F.trim,[base[0],yb,base[2]],1.35,.1,.6,hd,[.62,.58,.52,0]);
   const fr=V.madd(c,nrm,.58);bBoxAt(F.iron,[fr[0],yb+.5,fr[2]],1.35,.95,.03,hd,[.04,.04,.045,0]);
   if(M.random()<.12){for(let s=0;s<9;s++){const off=(s-4)*.1;const p=V.add(V.madd(fr,dir,off),[nrm[0]*.03,yb-.15,nrm[2]*.03]);bBoxAt(F.cloth,p,.1,1.3,.01,hd,s%2?[.75,.05,.04,0]:[.95,.72,.05,0])}}
   if(M.random()<.6)F.seats.push([V.madd(c,nrm,.15),yb+.05,hn,M.random()<.5?2:1,.9])}}
 if(o.lamps&&k%3==1){const lp=V.add(V.madd(c,nrm,.55),[0,4.55,0]);bBoxAt(F.iron,V.add(V.madd(c,nrm,.3),[0,4.95,0]),.04,.04,.6,hn,[.03,.03,.03,0]);
  F.lampG.push(paint(xform(box(.26,.38,.26),T(lp,[0,hn,0])),()=>[1,1,1,0]));bBoxAt(F.iron,V.add(lp,[0,.24,0]),.34,.08,.34,hn,[.03,.03,.03,0]);F.lamps.push(V.add(lp,[0,-.05,0]))}}}
function bTris(arr,P,col){const g=new Geo();for(const p of P){g.p.push(...p);g.n.push(0,1,0);g.u.push(0,0)}g.i=[0,1,2];g.c=[];for(let i=0;i<3;i++)g.c.push(...col,0);arr.push(g)}
function bGarland(F,a,b,sag){const L=V.d2(a,b),n=M.floor(L/.36),cols=[[.75,.05,.04],[.95,.75,.06],[.1,.25,.65],[.08,.45,.15],[.85,.85,.82]];
for(let i=0;i<n;i++){const t=(i+.5)/n,p=V.lerp(a,b,t);p[1]-=sag*4*t*(1-t);const t2=(i+.5+.7)/n,p2=V.lerp(a,b,t2);p2[1]-=sag*4*t2*(1-t2);const m=V.lerp(p,p2,.5);bTris(F.flag,[p,p2,[m[0],m[1]-.3,m[2]]],cols[i%cols.length])}}
function buildPueblo(){const root=new Node(),F={fac:[],gf:[],roof:[],trim:[],iron:[],dark:[],cloth:[],win:[],lampG:[],lamps:[],seats:[],metal:[],wood:[],lona:[],flag:[],stone:[],tile:[],glass:[]};
const tints=[[1,.97,.92],[.98,.92,.8],[1,.88,.72],[.95,.95,.93],[.97,.85,.78],[.9,.93,.88],[1,.95,.82]];const tn=()=>tints[(M.random()*tints.length)|0];
// suelo: adoquín y arena sobre plaza y calles
{const g=plane(320,320,1,1);const n=new Node(makeMesh(g),mat({base:[.8,.78,.74],rough:.82,alb:TX.cobA,det:TX.cobN,uv:[.5,.5],detS:1.1}));n.cast=false;root.add(n);
 const sand=mat({base:[.93,.9,.86],rough:.95,alb:TX.arenaA,det:TX.arenaN,uv:[.4,.4],detS:1.2,mode:2});
 for(const q of BR){const g2=plane(q.x1-q.x0+.6,q.z1-q.z0+.6,1,1);for(let i=0;i<g2.vc;i++){g2.p[i*3]+=(q.x0+q.x1)/2;g2.p[i*3+2]+=(q.z0+q.z1)/2;g2.u[i*2]=g2.p[i*3];g2.u[i*2+1]=g2.p[i*3+2]}g2.p.forEach((v,i)=>{if(i%3==1)g2.p[i]=.012});const sn=new Node(makeMesh(g2),sand);sn.cast=false;root.add(sn)}}
// fachadas alrededor de la plaza
const FX=22.6,FZ=18.6;
const run=(A,B,nrm,fl,o)=>{const L=V.d2(A,B);let s=0;while(s<L-.5){const len=M.min(L-s,rnd(6.5,10.5));const a=V.lerp(A,B,s/L),b=V.lerp(A,B,(s+len)/L);bFacade(F,a,b,o&&o.fl?o.fl:(2+((M.random()*2.4)|0)),tn(),nrm,{lamps:1,...o});s+=len}};
run([-FX,0,FZ],[-6.5,0,FZ],[0,0,-1]);run([6.5,0,FZ],[FX,0,FZ],[0,0,-1]);
run([-FX,0,-FZ],[-14.5,0,-FZ],[0,0,1]);run([9.5,0,-FZ],[FX,0,-FZ],[0,0,1]);
run([FX,0,-FZ],[FX,0,-7.5],[-1,0,0]);run([FX,0,7.5],[FX,0,FZ],[-1,0,0]);
run([-FX,0,-FZ],[-FX,0,-6.5],[1,0,0]);run([-FX,0,6.5],[-FX,0,FZ],[1,0,0]);
// calles
run([-6.5,0,FZ],[-6.5,0,62],[1,0,0]);run([6.5,0,FZ],[6.5,0,62],[-1,0,0]);run([-6.5,0,62],[6.5,0,62],[0,0,-1],{fl:2});
run([-FX,0,-6.5],[-66,0,-6.5],[0,0,1]);run([-FX,0,6.5],[-66,0,6.5],[0,0,-1]);run([-66,0,-6.5],[-66,0,6.5],[1,0,0],{fl:2});
// iglesia (sur) con campanario y cúpula de teja azul
{const st=F.stone,zf=-FZ-.2,c=[0,0,zf-2.2];bBoxAt(st,[-2.5,8.5,zf-2.2],24,17,4.4,0,[.86,.8,.7,0]);
 bBoxAt(st,[-2.5,17.2,zf-2.2],9.2,9.2,4.2,0,[.86,.8,.7,0],m4.mul(m4.id(),T([0,0,0],[0,0,PI/4]),T([0,0,0])));
 bBoxAt(st,[-2.5,17.25,zf-.05],25,.5,.6,0,[.8,.74,.64,0]);
 for(const x of[-7.5,2.5])bBoxAt(st,[x,8,zf+.15],1.1,16,.5,0,[.8,.74,.64,0]);
 bBoxAt(st,[-2.5,3.2,zf+.2],4.6,6.6,.5,0,[.78,.72,.62,0]);bBoxAt(F.dark,[-2.5,2.6,zf+.47],3.1,5.2,.06,0,[.14,.08,.05,0]);
 F.dark.push(paint(xform(disc(1.55,2,24),T([-2.5,5.2,zf+.48],[PI/2,0,0])),()=>[.14,.08,.05,0]));
 F.glass.push(paint(xform(disc(1.5,3,28),T([-2.5,11.2,zf+.12],[PI/2,0,0])),()=>[1,1,1,0]));
 st.push(paint(xform(lathe([[1.5,-.12],[1.85,-.12],[1.85,.12],[1.5,.12]],28),T([-2.5,11.2,zf+.1],[PI/2,0,0])),()=>[.8,.74,.64,0]));
 // campanario
 const tx=-12.5,tz=zf-2.4;bBoxAt(st,[tx,13,tz],5,26,5,0,[.84,.78,.68,0]);bBoxAt(st,[tx,26.3,tz],5.6,.6,5.6,0,[.78,.72,.62,0]);bBoxAt(st,[tx,18.6,tz],5.4,.4,5.4,0,[.78,.72,.62,0]);
 for(const[dx,dz,w,d]of[[0,2.52,1.6,.05],[0,-2.52,1.6,.05],[2.52,0,.05,1.6],[-2.52,0,.05,1.6]])bBoxAt(F.dark,[tx+dx,21.6,tz+dz],w,4,d,0,[.03,.025,.02,0]);
 F.metal.push(paint(xform(lathe([[0,.9],[.25,.85],[.45,.4],[.55,0],[0,0]],16,{smooth:true}),T([tx,20.6,tz+2.2])),()=>[.55,.38,.15,0]));
 F.tile.push(paint(xform(lathe([[3.3,0],[0,4.2]],4),T([tx,26.6,tz],[0,PI/4,0])),()=>[.05,.2,.55,0]));
 bBoxAt(F.iron,[tx,31.6,tz],.08,1.6,.08,0,[.05,.05,.05,0]);bBoxAt(F.iron,[tx,32,tz],.8,.08,.08,0,[.05,.05,.05,0]);
 // cúpula
 const dc=[1.5,0,zf-9];st.push(paint(xform(lathe([[5.6,0],[5.6,4]],32),T([dc[0],16,dc[2]])),()=>[.84,.78,.68,0]));
 bBoxAt(st,[dc[0],8,dc[2]],10,16,10,0,[.82,.76,.66,0]);
 const dome=lathe(Array.from({length:12},(_,i)=>{const a=i/11*PI/2;return[M.cos(a)*5.9,M.sin(a)*5.6]}),48,{smooth:true});
 F.tile.push(paint(xform(dome,T([dc[0],20,dc[2]])),(x,y,z)=>{const a=M.atan2(z-dc[2],x-dc[0]);const rib=M.abs(M.sin(a*8))<.07;return rib?[.85,.8,.62,0]:(((y*3.2)|0)%2?[.04,.18,.55,0]:[.03,.14,.46,0])}));
 st.push(paint(xform(lathe([[.9,0],[.9,1.6],[1.1,1.7],[0,3]],12),T([dc[0],25.5,dc[2]])),()=>[.84,.78,.68,0]))}
// ayuntamiento (este) con soportales, balcón, banderas y reloj
{const st=F.stone,x=FX+.1;bBoxAt(st,[x+2.4,6.6,0],4.8,13.2,15,0,[.9,.82,.68,0]);bBoxAt(st,[x+.1,13.5,0],.8,.6,15.6,0,[.8,.72,.6,0]);
 for(const z of[-4.6,0,4.6]){bBoxAt(F.dark,[x+.02,1.7,z],.06,3.4,3,0,[.05,.04,.03,0]);F.dark.push(paint(xform(disc(1.5,2,20),T([x+.03,3.4,z],[0,0,PI/2])),()=>[.05,.04,.03,0]))}
 for(const z of[-5.5,5.5])bBoxAt(st,[x-.1,2.5,z+M.sign(z)*1.7],.5,5,.7,0,[.8,.72,.6,0]);
 bBoxAt(st,[x-.5,5,0],1,.18,11,0,[.75,.7,.62,0]);bBoxAt(F.iron,[x-.98,5.55,0],.03,.95,11,0,[.04,.04,.045,0]);
 for(const z of[-3.6,0,3.6]){bBoxAt(F.dark,[x+.02,7.4,z],.06,2.6,1.3,0,[.05,.05,.06,0])}
 for(const z of[-4.5,4.5])F.seats.push([[x-.3,0,z],5.06,-PI/2,2,.9]);
 F.seats.push([[x-.3,0,-1.2],5.06,-PI/2,2,.9]);
 F.glass.push(paint(xform(disc(.9,2,24),T([x-.05,11.3,0],[0,0,PI/2])),()=>[1,1,1,0]));
 // banderas
 for(const[zz,fl]of[[-2.2,'s'],[2.2,'p']]){bBoxAt(F.iron,[x-1.6,6.7,zz],.04,.04,.04,0,[0,0,0,0]);const pole=m4.mul(m4.id(),T([x-.6,6,zz],[0,0,.6]),T([0,1.2,0]));F.iron.push(paint(xform(box(.035,2.4,.035),pole),()=>[.85,.75,.4,0]));
  for(let s=0;s<9;s++){const c=fl=='s'?(s%2?[.75,.05,.04,0]:[.95,.72,.05,0]):(s<3?[.4,.05,.3,0]:s<6?[.85,.85,.82,0]:[.1,.4,.15,0]);const yy=6.9+(s-4)*.1;F.cloth.push(paint(xform(box(.02,.1,1.3),T([x-1.55,yy+1.1,zz+.66*(zz<0?1:-1)])),()=>c))}}}
// cadafals: andamios metálicos con tablado, barrotes y lonas
const lonaC=[[.6,.05,.05],[.05,.2,.55],[.9,.65,.05],[.08,.4,.15],[.85,.85,.82],[.4,.05,.3],[.95,.4,.05]];
for(const s of BSEG){const d=[(s.b[0]-s.a[0])/s.L,0,(s.b[1]-s.a[1])/s.L],n=[s.n[0],0,s.n[1]],hd=M.atan2(d[0],d[2])-PI/2,hn=M.atan2(-n[0],-n[2]);
 const at=(al,dp,y)=>[s.a[0]+d[0]*al+n[0]*dp,y,s.a[1]+d[2]*al+n[2]*dp];
 if(s.t=='cad'){const mods=M.max(1,M.round(s.L/3)),mw=s.L/mods;for(let k=0;k<mods;k++){const al=(k+.5)*mw,roof=M.random()<.45,H=roof?4.5:3.15,lc=lonaC[(M.random()*lonaC.length)|0];
  for(const ax of[-mw/2+.04,mw/2-.04])for(const dp of[.04,2.6])bBoxAt(F.metal,at(al+ax,dp,H/2),.07,H,.07,hd,[.62,.63,.65,0]);
  bBoxAt(F.wood,at(al,1.32,2),mw,.09,2.6,hd,[.62,.5,.36,0]);
  for(let i=0;i<M.floor(mw/.3);i++)bBoxAt(F.metal,at(al-mw/2+.15+i*.3,0,1),.045,2,.045,hd,[.6,.61,.63,0]);
  for(const y of[.06,1.0,1.94])bBoxAt(F.metal,at(al,0,y),mw,.05,.05,hd,[.6,.61,.63,0]);
  for(const y of[2.55,3.08])bBoxAt(F.metal,at(al,0,y),mw,.05,.05,hd,[.62,.63,.65,0]);bBoxAt(F.metal,at(al,2.6,3.08),mw,.05,.05,hd,[.62,.63,.65,0]);
  if(M.random()<.62)bBoxAt(F.lona,at(al,-.04,2.56),mw-.08,.86,.02,hd,[...lc,0]);
  if(roof){bBoxAt(F.lona,at(al,1.3,4.5),mw,.04,2.9,hd,[...lonaC[(k+2)%lonaC.length],0],T([0,0,0],[.06,0,0]))}
  for(const dp of[.5,1.25,1.95])for(let i=0;i<M.floor(mw/.62);i++)if(M.random()<.88)F.seats.push([at(al-mw/2+.32+i*.62,dp,0),2.05+(dp>1.5?.12:0),hn,1,1]);
  for(let i=0;i<M.floor(mw/.85);i++)if(M.random()<.5)F.seats.push([at(al-mw/2+.4+i*.85,.55,0),0,hn,1,1])}}
 else if(s.t=='bar'){const N=M.floor(s.L/.3);for(let i=0;i<=N;i++)bBoxAt(F.metal,at(i*.3,0,1.05),i%7==0?.08:.045,2.1,i%7==0?.08:.045,hd,[.55,.56,.58,0]);
  for(const y of[.07,1.05,2.07])bBoxAt(F.metal,at(s.L/2,0,y),s.L,.05,.05,hd,[.55,.56,.58,0]);
  for(let al=.4;al<s.L;al+=.55)if(M.random()<.72)F.seats.push([at(al,rnd(.5,1.4),0),M.random()<.12?.45:0,hn,1,1])}
 else{const N=M.max(1,M.floor(s.L/2));for(const y of[.4,.8,1.2,1.6])bBoxAt(F.wood,at(s.L/2,0,y),s.L,.22,.06,hd,[.55,.42,.28,0]);
  for(let i=0;i<=N;i++){const al=i*s.L/N;for(const sg of[-1,1])bBoxAt(F.wood,at(al,.35,.9),.1,2,.1,hd,[.5,.38,.25,0],T([0,0,0],[sg*.32,0,0]))}
  for(let al=.3;al<s.L;al+=.5)F.seats.push([at(al,rnd(.6,1.2),0),.0,hn,1,1])}}
// gàbies (jaulas refugio)
for(const[cx,cz]of BCAGE){for(let i=0;i<20;i++){const a=i/20*TAU,x=cx+M.cos(a)*1.0,z=cz+M.sin(a)*1.0;if(i%5!==0||1)F.metal.push(paint(xform(box(.05,2.2,.05),T([x,1.1,z])),()=>[.5,.52,.55,0]))}
 for(const y of[.08,1.1,2.2])F.metal.push(paint(xform(lathe([[.97,-.03],[1.03,-.03],[1.03,.03],[.97,.03]],24),T([cx,y,cz])),()=>[.5,.52,.55,0]));
 F.metal.push(paint(xform(disc(1.05,2,24),T([cx,2.24,cz])),()=>[.45,.47,.5,0]))}
// caixó (cajón del toro) al final del Carrer Major
{const z0=46.2;bBoxAt(F.metal,[0,1.35,z0+2.1],2.3,2.7,4.2,0,[.08,.15,.1,0]);for(let i=0;i<5;i++)bBoxAt(F.metal,[0,1.35,z0+.4+i*.85],2.38,2.74,.08,0,[.06,.11,.07,0]);
 bBoxAt(F.metal,[0,.25,z0+2.1],2.5,.5,4.6,0,[.04,.04,.04,0])}
// guirnaldas de banderitas
for(const x of[-13,-6,0,6,13])bGarland(F,[x,8.8,FZ-.3],[x*.9,8.8,-FZ+.3],1.6);
for(let z=FZ+5;z<60;z+=7)bGarland(F,[-6.3,7,z],[6.3,7,z+1.5],.9);for(let x=-FX-5;x>-62;x-=7)bGarland(F,[x,7,-6.3],[x-1.5,7,6.3],.9);
// pueblo lejano y campo
{const far=[];for(let i=0;i<70;i++){const a=rnd(0,TAU),r=rnd(80,150),h=rnd(7,15),w=rnd(8,18);bBoxAt(far,[M.cos(a)*r,h/2,M.sin(a)*r],w,h,rnd(8,14),a,[...V.sc(tn(),.75),0])}
 root.add(new Node(makeMesh(merge(far)),mat({base:[1,1,1],rough:.9})));
 const hills=lathe([[200,-1],[260,4],[330,14],[400,-1]],64);const hn=new Node(makeMesh(paint(hills,()=>[.32,.3,.22,0])),mat({base:[1,1,1],rough:1}));hn.cast=false;root.add(hn)}
// materiales y mallas
const facM=mat({base:[1,1,1],rough:.85,alb:TX.facA,det:TX.facN,uv:[1,1],detS:1}),gfM=mat({base:[1,1,1],rough:.9,alb:TX.stoneA,det:TX.stoneN,uv:[.6,.6]}),stM=mat({base:[1,1,1],rough:.82,alb:TX.stoneA,det:TX.stoneN,uv:[.35,.35],detS:1.2});
BOU.lampM=mat({base:[1,.92,.7],rough:.35});BOU.winM=mat({base:[.5,.42,.3],rough:.3});BOU.glassM=mat({base:[.08,.08,.1],rough:.15,metal:.3});
const L=[[F.fac,facM],[F.gf,gfM],[F.roof,mat({base:[1,1,1],rough:.75})],[F.trim,mat({base:[1,1,1],rough:.75})],[F.iron,mat({base:[1,1,1],rough:.45,metal:.6})],[F.dark,mat({base:[1,1,1],rough:.8})],
[F.cloth,mat({base:[1,1,1],rough:.7,sheen:.4,sheenC:[.6,.5,.4],mode:3,back:[.7,.4,.1]})],[F.metal,mat({base:[1,1,1],rough:.38,metal:.75})],[F.wood,mat({base:[1,1,1],rough:.8,alb:TX.woodA,uv:[.6,.6]})],
[F.lona,mat({base:[1,1,1],rough:.7,sheen:.35,sheenC:[.5,.5,.5],det:TX.clothN,detS:.4,duv:[3,3]})],[F.flag,mat({base:[1,1,1],rough:.65,mode:3,back:[.8,.8,.7]})],[F.stone,stM],[F.tile,mat({base:[1,1,1],rough:.2,sheen:.3,sheenC:[.6,.7,1]})]];
for(const[arr,m]of L)for(let i=0;i<arr.length;i+=500)if(arr.length)root.add(new Node(makeMesh(merge(arr.slice(i,i+500))),m));
if(F.lampG.length)root.add(new Node(makeMesh(merge(F.lampG)),BOU.lampM));
BOU.winN=new Node(makeMesh(merge(F.win)),BOU.winM);BOU.winN.cast=false;root.add(BOU.winN);
{const gn=new Node(makeMesh(merge(F.glass)),BOU.glassM);gn.cast=false;root.add(gn)}
BOU.lamps=F.lamps;
// público
const cm=makeMesh(crowdMesh());const pal=[[.85,.85,.83],[.85,.85,.83],[.55,.04,.04],[.15,.2,.4],[.3,.3,.3],[.85,.6,.2],[.2,.45,.6],[.6,.15,.35],[.1,.3,.15]];let nn=0;F.seats.forEach(q=>nn+=q[3]);addInst(cm,nn);let k=0;
for(const[p,y,h,c,sc]of F.seats)for(let j=0;j<c;j++){setInst(cm,k++,T([p[0]+j*.5*M.cos(h),y,p[2]-j*.5*M.sin(h)],[0,h+rnd(-.35,.35),0],rnd(.93,1.06)*(sc||1)),[...pal[(M.random()*pal.length)|0],M.random()])}instUpload(cm);
const cr=new Node(cm,mat({base:[1,1,1],rough:.8,anim:1}));cr.cast=false;root.add(cr);
// pal del bou embolat y cuerda
BOU.post=new Node(makeMesh(paint(merge([xform(lathe([[.16,0],[.15,2.2],[.12,2.3],[0,2.32]],12),T([0,0,0])),xform(box(.5,.2,.5),T([0,.1,0]))]),()=>[.42,.3,.2,0])),mat({base:[1,1,1],rough:.8,alb:TX.woodA,uv:[.5,.5]}));
BOU.post.p=[0,0,-2.6];root.add(BOU.post);
BOU.rope=new Node(makeMesh(paint(xform(box(.016,.016,1),T([0,0,.5])),()=>[.62,.52,.32,0])),mat({base:[1,1,1],rough:.9}));root.add(BOU.rope);
BOU.pole=new Node(makeMesh(paint(xform(box(.014,.014,1),T([0,0,.5])),()=>[.75,.62,.4,0])),mat({base:[1,1,1],rough:.5}));BOU.pole.vis=false;root.add(BOU.pole);
BOU.door=new Node(makeMesh(paint(box(2.3,2.6,.08),()=>[.06,.11,.07,0])),mat({base:[1,1,1],rough:.5,metal:.6}));BOU.door.p=[0,1.3,46.15];root.add(BOU.door);
return root}
// ---------- personajes ----------
const bRuedo=p=>[p[0],0,p[2]];
function bNewNpc(i){const pro=i<3;const h=buildHuman({kind:'mozo',skin:[rnd(.5,.66),rnd(.32,.44),rnd(.2,.3)]});if(h.paper)h.paper.vis=false;
const tint=pro?[[.25,.35,.75],[.15,.15,.18],[.75,.2,.15]][i]:[[1,1,1],[.4,.6,.9],[.9,.8,.5],[.5,.75,.5],[.85,.5,.5],[.6,.6,.62],[1,1,1]][i%7];h.suit.base=tint;
W.pueblo.add(h.root);BOU.actors.push(h.root);const a=rnd(0,TAU);return{h,p:[M.cos(a)*rnd(6,14),0,M.sin(a)*rnd(5,11)],hd:rnd(0,TAU),v:0,state:'free',t:rnd(0,3),bold:pro?.9:rnd(.15,.8),pro,aph:rnd(0,1),goal:null,y:0,vy:0,off:[0,0,0],wav:0}}
function bBody(o){return[o.p[0]+(o.off?o.off[0]:0),o.y||0,o.p[2]+(o.off?o.off[2]:0)]}
function segDist(q,a,b){const ab=V.sub(b,a),t=clamp(V.dot(V.sub(q,a),ab)/V.dot(ab,ab),0,1);return V.d(q,V.madd(a,ab,t))}
// ---------- inicio ----------
function startBous(mod){G.mode='bous';G.ai=false;G.cine=null;G.ts=1;R.fx={};BOU.mod=mod;const night=mod=='embolat';BOU.night=night;
Object.assign(ENV,night?ENV_NOCHE:ENV_BOUS);if(!W.pueblo)W.pueblo=buildPueblo();
BOU.lampM.emis=night?[14,9,3.6]:[0,0,0];BOU.winM.emis=night?[2.6,1.6,.62]:[0,0,0];BOU.winN.vis=night;BOU.glassM.emis=night?[1.6,.9,.35]:[0,0,0];
SCN.ch=[W.pueblo];TRK.off=0;TRK.x.globalCompositeOperation='source-over';TRK.x.fillStyle='#000';TRK.x.fillRect(0,0,TRK.S,TRK.S);TRK.dirty=1;W.trkBous=1;PART.length=0;
if(BOU.actors)W.pueblo.ch=W.pueblo.ch.filter(n=>!BOU.actors.includes(n));BOU.actors=[];
const d=G.bullSel||newBullData(G.opts.gan||0);const m=buildBull({capa:d.capa,size:d.g.size*(.97+d.peso/540*.03),seed:d.seed,horn:d.horn,darkHorn:d.g.dark,divisa:d.g.div});W.pueblo.add(m.root);BOU.actors.push(m.root);
BOU.B={m,d,p:night?[0,0,-1]:[0,0,44.6],h:PI,mh:PI,v:0,yr:0,state:night?'atado':'salida',stT:0,fuerza:1,brav:d.brav,nob:d.nob,fz:d.fz,ph:0,hum:0,der:0,paw:0,hd:[0,0,0,0],tgt:null,pick:0,rings:[]};
BOU.fire=[];if(night){for(let i=0;i<2;i++){const f=new Node(makeMesh(blob(10,8,(x,y,z)=>[x*.09,y*.09,z*.09])),mat({base:[1,.6,.2],rough:.5,emis:[0,0,0]}));W.pueblo.add(f);BOU.actors.push(f);BOU.fire.push(f)}}
BOU.post.vis=night;BOU.rope.vis=night;BOU.door.p=[0,1.3,46.15];BOU.lit=0;BOU.open=0;
const ph=buildHuman({kind:'mozo',skin:[.58,.38,.26]});if(ph.paper)ph.paper.vis=false;W.pueblo.add(ph.root);BOU.actors.push(ph.root);
BOU.P={h:ph,p:night?[0,0,8]:[0,0,4],hd:night?PI:0,v:0,vel:[0,0],y:0,vy:0,state:'ok',stam:1,aph:0,man:null,cool:0,off:[0,0,0],golpes:0,cite:0,t:0};
BOU.npcs=[];for(let i=0;i<10;i++)BOU.npcs.push(bNewNpc(i));
BOU.t=night?-7:-5;BOU.dur=night?240:300;BOU.score=0;BOU.best=null;BOU.cnt={1:0,2:0,3:0,4:0};BOU.revol=0;BOU.over=0;BOU.pass=null;BOU.obj=0;BOU.cy=BOU.P.hd;BOU.cd=99;BOU.last='';
$('hudTitle').textContent=night?'Bou embolat':'Bous al carrer';$('hudSub').textContent=`${night?'Plaça Major · nit de festes':'Concurso de recortes · Plaça Major'} · «${d.name}», ${CAPA_TXT[d.capa]} · ${d.g.n}`;
$('scoreLbl').textContent='Jurado';$('fzLbl').textContent='Aliento';$('score').textContent='0';$('combo').textContent='';$('avisos').textContent='';
$('keys').innerHTML=`<div class="kg"><b>W A S D</b> moverse · <b>Shift</b> correr · <b>E</b> citar (mantener) · <b>Espacio</b> barrera o gàbia</div><div class="kg"><span><b>1</b> recorte</span><span><b>2</b> quiebro</span><span><b>3</b> salto</span><span><b>4</b> anilla</span><span><b>5</b> reverso</span><span><b>6</b> engaño</span><span><b>7</b> quiebro de rodillas</span><span><b>8</b> garrocha</span></div>`;
show('hud');hide('menu');hide('result');crowdLevel(.2);R.exc=.35;R.pan=0;G.cam.yaw=0;G.cam.pitch=0;CAM.p=[0,3,-4];CAM.t=[0,1.5,10];musica(true);bObjShow();
say(night?'Capllaçat al pal: encienden las bolas':'La charanga toca: se abre el cajón',1)}
// ---------- objetivos que marcan el ritmo ----------
const BOBJ=[{t:'Cita al toro (mantén E) y haz un recorte (1)',m:j=>j.k==1},{t:'Quiebro: quieto, deja llegar al toro y pulsa 2',m:j=>j.k==2},{t:'Salto: arranca hacia el toro y pulsa 3 a tiempo',m:j=>j.k==3},
{t:'Coloca una anilla en el pitón (4) con el toro al lado',m:j=>j.k==4},{t:'Recorte de reverso: recorta girando sobre ti (5)',m:j=>j.k==5},{t:'Engaño en carrera: amaga y sal por el otro lado (6)',m:j=>j.k==6},{t:'Quiebro de rodillas (7): el más arriesgado',m:j=>j.k==7},{t:'Salto con garrocha (8): coge carrerilla',m:j=>j.k==8},{t:'Logra un 8 de algún juez',m:j=>j.j.some(x=>x>=8)},{t:'Ejecución de 27 puntos o más',m:j=>j.tot>=27},{t:'Concurso libre: suma puntos hasta el final',m:()=>false}];
function bObjShow(){const o=BOBJ[BOU.obj];$('goal').hidden=false;let t=o.t;if(simple())t=t.replace('Cita al toro (mantén E) y haz un recorte (1)','Corre hacia el toro y recorta (Espacio)').replace('Quiebro: quieto, deja llegar al toro y pulsa 2','Quiebro: quédate quieto y pulsa Espacio').replace('Salto: arranca hacia el toro y pulsa 3 a tiempo','Salto: pulsa X (o Salto) cuando venga').replace(' (4) con el toro al lado',' con el toro al lado (Espacio)');if(TOUCH&&simple())t=t.replace(' (Espacio)','').replace('pulsa Espacio','pulsa Recortar').replace('pulsa X (o Salto)','pulsa Salto');else if(TOUCH)t=t.replace('(mantén E)','(mantén Citar)').replace(' (1)',' (Recorte)').replace(' y pulsa 2',' y pulsa Quiebro').replace(' y pulsa 3 a tiempo',' y pulsa Salto a tiempo').replace(' (4)','');
if(TOUCH)t=t.replace(/\s\(\d\)/g,'');$('goalTxt').textContent=t;$('goalN').textContent=BOU.obj<BOBJ.length-1?`${BOU.obj+1} / ${BOBJ.length-1}`:'';$('goalBar').firstChild.style.width=(BOU.obj/(BOBJ.length-1)*100)+'%'}
// ---------- toro ----------
function bArr(B,p){const f=fwdOf(B.h);let cv=B.v;const P=BOU.P;if(P&&p===P.p&&P.vel)cv+=M.max(0,-(P.vel[0]*f[0]+P.vel[1]*f[2]));return(V.dot(V.sub(bRuedo(p),B.p),f)-1.5*B.m.sz)/M.max(cv,1)}
function bVmax(B){return(5.8+3.6*B.brav)*(.55+.45*B.fuerza)*(G.diff||1)}
function bPick(B){const P=BOU.P,f=fwdOf(B.h);let best=null,bs=.1;const cand=[];if(P.state=='ok')cand.push([P,1,P.cite?2.4:(P.v>3?1.3:.9)]);
for(const o of BOU.npcs)if(o.state=='free'||o.state=='cite'||o.state=='flee'||o.state=='recorte')cand.push([o,0,o.state=='cite'?2.2:o.state=='flee'?1.2:.75]);
for(const[o,isP,w]of cand){const dx=o.p[0]-B.p[0],dz=o.p[2]-B.p[2],d=M.hypot(dx,dz);if(d>(w>2?30:22)||d<1.2)continue;const ang=M.abs(angDiff(B.h,M.atan2(dx,dz)));
 const s=w/(1+d*.14)*(ang<1.1?1:ang<2.2?.45:.12)*rnd(.8,1.2);if(s>bs){bs=s;best={o,isP}}}return best}
function bSteer(B,tx,tz,spd,dt,tk){const want=M.atan2(tx-B.p[0],tz-B.p[2]);const mr=lerp(2.8,1.05,clamp(B.v/9,0,1))*tk,d=angDiff(B.h,want);
B.yr=lerp(B.yr,clamp(d*4,-mr,mr),M.min(1,7*dt));B.h+=B.yr*dt;const acc=spd>B.v?6.5:9;B.v+=clamp(spd-B.v,-acc*dt,acc*dt)}
function bMove(B,dt){const trac=lerp(16,3.4,clamp(B.v/9.5,0,1)),dm=angDiff(B.mh,B.h);B.mh+=dm*M.min(1,trac*dt);
if(M.abs(dm)>.3&&B.v>4.5){B.v*=1-.4*M.abs(dm)*dt;B.skid=(B.skid||0)+dt;if(B.skid>.06){B.skid=0;for(const L of B.m.legs){const hp=L.hoof.wpos();stamp(hp[0],hp[2],.2,30);emit([hp[0],.1,hp[2]],[rnd(-.5,.5),rnd(.3,.9),rnd(-.5,.5)],.3,1.4,BOU.night?[.3,.25,.2]:[.86,.7,.5],.28)}}}
const np=[B.p[0]+M.sin(B.mh)*B.v*dt,0,B.p[2]+M.cos(B.mh)*B.v*dt];
for(const c of BCAGE){const dx=np[0]-c[0],dz=np[2]-c[1],d=M.hypot(dx,dz);if(d<1.65){np[0]=c[0]+dx/d*1.65;np[2]=c[1]+dz/d*1.65;const dd=-(M.sin(B.h)*dx+M.cos(B.h)*dz)/d;if(dd>.55&&B.v>5)bDerrote(B,'gàbia')}}
const q=bClamp(np,.8);if(q.hit){const n=q.n,dx=M.sin(B.h),dz=M.cos(B.h),dd=dx*n[0]+dz*n[1];if(dd>.55&&B.v>5&&B.state=='arranca')bDerrote(B,'barrera');else if(dd>0){B.h=M.atan2(dx-n[0]*dd,dz-n[1]*dd);B.mh=B.h;B.v*=1-.5*dd*dt*8}B.p=q.p}else B.p=np}
function bDerrote(B,what){if(B.state=='derrote')return;B.state='derrote';B.stT=0;B.v*=.2;B.der=1;const c=AU.c;if(c){const t=c.currentTime;noiseHit(t,.35,what=='gàbia'?1800:2600,6,.55,'bandpass');noiseHit(t,.25,110,1,.6,'lowpass','brown')}
shake(V.d2(B.p,BOU.P.p)<8?.35:.12);gasp();R.exc=M.min(1,R.exc+.15);for(let i=0;i<8;i++)emit(V.add(B.p,[rnd(-.6,.6),.2,rnd(-.6,.6)]),[rnd(-1,1),rnd(.4,1.4),rnd(-1,1)],.35,1.3,BOU.night?[.25,.2,.17]:[.86,.7,.5],.3);if(BOU.pass)bEndPass()}
function bBull(dt){const B=BOU.B,P=BOU.P;B.stT+=dt;B.der=M.max(0,B.der-dt*1.4);B.paw=M.max(0,B.paw-dt*.5);const vm=bVmax(B);let spd=0,tg=null,tk=1;
if(B.state=='atado'){B.v=0;B.h=M.sin(G.t*1.3)*.45;B.mh=B.h;B.yr=M.cos(G.t*1.3)*.5;if(M.random()<dt*.6)B.paw=1;B.hum=.3+.2*M.sin(G.t*2);B.p=[M.sin(G.t*.7)*.35,0,.1+M.sin(G.t*1.1)*.12];
 const hp=hornTips(B),mid=V.lerp(hp[0],hp[1],.5),a=[0,1.9,-2.6],L=V.d(mid,a),dir=V.norm(V.sub(mid,a));BOU.rope.p=a;BOU.rope.r=[-M.asin(clamp(dir[1],-1,1)),M.atan2(dir[0],dir[2]),0];BOU.rope.s=L;if(BOU.t>=0){B.state='busca';B.stT=0;BOU.rope.vis=false;say('¡Sueltan el bou!',1,'red');cohete();R.exc=1;musica(false)}return}
if(B.state=='salida'){if(BOU.t<0){B.v=0;return}tg=[0,0,4];spd=vm*.85;if(B.p[2]<9){B.state='busca';B.stT=0}}
else if(B.state=='busca'){B.pick-=dt;B.fuerza=M.min(1,B.fuerza+dt*.025);B.hum=lerp(B.hum,.25,dt);if(B.pick<=0){B.pick=.35;const t=bPick(B);if(t&&B.fuerza>.25&&B.stT>(B.wait||1)){B.wait=rnd(1,2.8);B.tgt=t;B.last=bBody(t.o);B.state='arranca';B.stT=0;snort();if(t.isP)BOU.pass={minD:9,man:null,bv:0,t:0,start:G.t};return}}
 if(!B.wan||V.d2(B.p,B.wan)<2||B.stT>6){B.wan=[rnd(-13,13),0,rnd(-10,10)];B.stT=M.min(B.stT,3)}tg=B.wan;spd=B.stT<1?.8:1.9;if(B.fuerza<.22){B.state='parado';B.stT=0}}
else if(B.state=='arranca'){const o=B.tgt.o,safe=o.state=='safe'||o.state=='down'||o.state=='entering'||o.state=='toss';const bp=bBody(o),vel=o.vel?[o.vel[0],0,o.vel[1]]:[0,0,0];
 const d=V.d2(B.p,bp),qb=B.tgt.isP&&P.man&&(P.man.k==2||P.man.k==6||P.man.k==7);if(!safe&&!(qb&&P.man.t>(P.man.k==7?.2:P.man.k==6?.16:.14)))B.last=V.madd(bp,vel,clamp(d/M.max(B.v,3),0,.6)*.6);tg=B.last;tk=d>4.2?1.7:qb?.75:.62;spd=vm;B.hum=lerp(B.hum,d<5?1:.4,dt*4);B.fuerza=M.max(0,B.fuerza-dt*.028*(1.4-B.fz));
 const f=fwdOf(B.h),ahead=(bp[0]-B.p[0])*f[0]+(bp[2]-B.p[2])*f[2];if((ahead<-1.4&&B.stT>.4)||B.stT>6||(safe&&V.d2(B.p,B.last)<1.2)){B.state='pasado';B.stT=0;if(BOU.pass)bEndPass()}}
else if(B.state=='pasado'){spd=lerp(B.v,1.5,M.min(1,dt*1.2));tg=V.madd(B.p,fwdOf(B.h),5);if(B.stT>1.1){B.state='busca';B.stT=0;B.pick=.2}}
else if(B.state=='derrote'){B.v=M.max(0,B.v-12*dt);if(B.stT>1.5){B.state='busca';B.stT=.2;B.h+=PI*.7*(M.random()<.5?1:-1)}}
else if(B.state=='parado'){B.v=M.max(0,B.v-5*dt);B.hum=.5;B.fuerza+=dt*.07;if(M.random()<dt*.3)B.paw=1;if(B.stT>4&&B.fuerza>.45){B.state='busca';B.stT=0}}
if(tg)bSteer(B,tg[0],tg[2],spd,dt,tk);bMove(B,dt)}
function bEndPass(){const S=BOU.pass;BOU.pass=null;const P=BOU.P;if(!S||P.state!='ok'||S.hurt)return;
if(S.minD>1.9)return;if(!S.man){if(S.minD<1.1){BOU.score+=2;say('¡Por los pelos! +2',0);aplauso(.4,1.2)}return}
const K={1:{n:'Recorte',b:4.2,id:.26},2:{n:'Quiebro',b:5.4,id:.3},3:{n:'Salto',b:5.6,id:.36},4:{n:'Anilla',b:5,id:.3},5:{n:'Recorte de reverso',b:5.4,id:.26},6:{n:'Engaño',b:5.3,id:.32},7:{n:'Quiebro de rodillas',b:6.6,id:.32},8:{n:'Salto con garrocha',b:6.9,id:.45}}[S.man.k];let name=K.n,ex=0;
if(S.man.k==4&&!S.man.ok){say('Anilla fallida',0,'red');return}
if(S.man.k==1&&S.man.run>3){ex+=.8;name='Recorte en carrera'}if(S.man.k==2&&S.minD<.62){ex+=.4;name='Quiebro ceñido'}
const close=clamp((1.45-S.minD)/1.1,0,1)*2.3,agu=clamp(1-M.abs(S.man.lead-K.id)/(K.id*.55),0,1)*1.1,sp=clamp((S.bv-5)/4,0,1)*.5;let s=K.b+close+agu+sp+ex;
if(S.man.k==3&&s>8.4)name='Salto del ángel';if(S.man.k==8&&s>8.6)name='Garrocha de altura';const j=[0,1,2].map(()=>clamp(M.round(s+rnd(-.75,.75)),1,10)),tot=j[0]+j[1]+j[2];
BOU.score+=tot;BOU.cnt[S.man.k]=(BOU.cnt[S.man.k]||0)+1;if(!BOU.best||tot>BOU.best.tot)BOU.best={n:name,tot};
say(`${name} · ${j.join(' · ')}`,1,'gold');$('combo').textContent=`Jurado: ${j.join(' + ')} = ${tot}`;aplauso(clamp(tot/22,.4,1.4),tot>24?3:1.8);R.exc=M.min(1,R.exc+tot/45);if(tot>=25)PUB.standT=M.max(PUB.standT,2.5);
const o=BOBJ[BOU.obj];if(o.m({k:S.man.k,j,tot})&&BOU.obj<BOBJ.length-1){BOU.obj++;BOU.score+=5;setTimeout(()=>say('Objetivo cumplido +5',0,'gold'),900);bObjShow()}}
// ---------- jugador ----------
function bStartMan(k){const P=BOU.P,B=BOU.B;if(P.man||P.cool>0||P.state!='ok')return;const f=fwdOf(B.h),r=rightOf(B.h);const rel=V.sub(bRuedo(P.p),B.p),lat=V.dot(rel,r);let s=M.abs(lat)>.15?M.sign(lat):((key('KeyD')?1:0)-(key('KeyA')?1:0))||(M.random()<.5?1:-1);
if((k==2||k==7)&&P.v>1.4){say(k==7?'De rodillas hay que estar parado':'Para quebrar hay que estar parado',0);k=1}
if(k==6&&P.v<2.2){say('El engaño se hace en carrera',0);k=1}
if(k==8){const dB=V.d2(P.p,B.p);if(P.v<3.2||dB>9){say('Garrocha: coge carrerilla hacia el toro',0);return}}
P.man={k,t:0,s,r,run:P.v,ok:0};if(k==3){if(P.y>0){P.man=null;return}P.vy=5.7;const tb=M.atan2(B.p[0]-P.p[0],B.p[2]-P.p[2]);if(P.v<2){P.vel=[M.sin(tb)*2.2,M.cos(tb)*2.2]}}
if(k==1)P.man.dur=.6;else if(k==2)P.man.dur=1.0;else if(k==4)P.man.dur=.55;else if(k==5)P.man.dur=.8;else if(k==6)P.man.dur=.75;else if(k==7)P.man.dur=1.25;else P.man.dur=9;
if(k==8){P.vy=7.4;const tb=M.atan2(B.p[0]-P.p[0],B.p[2]-P.p[2]);P.vel=[M.sin(tb)*M.max(P.v,4),M.cos(tb)*M.max(P.v,4)];P.man.plant=V.madd(bRuedo(P.p),fwdOf(tb),1.3);BOU.pole.vis=true}
if(k==7)P.kn=0}
function bPlayer(dt){const P=BOU.P,B=BOU.B,live=G.mode=='bous'&&!BOU.over;P.cool-=dt;P.t+=dt;
if(P.state=='ok'){const ix=live?(key('KeyD')||key('ArrowRight')?1:0)-(key('KeyA')||key('ArrowLeft')?1:0):0,iz=live?(key('KeyW')||key('ArrowUp')?1:0)-(key('KeyS')||key('ArrowDown')?1:0):0;
 const run=live&&(key('ShiftLeft')||key('ShiftRight'))&&P.stam>.03;P.cite=live&&key('KeyE')&&!P.man?1:0;
 const inAir=P.man&&(P.man.k==3||P.man.k==8),planted=P.man&&(P.man.k==2||P.man.k==7);
 if(!inAir){const cy=CAM_YAW(),f=[M.sin(cy),M.cos(cy)],r=[-M.cos(cy),M.sin(cy)];let mx=f[0]*iz+r[0]*ix,mz=f[1]*iz+r[1]*ix;const l=M.hypot(mx,mz);if(l>.01){mx/=l;mz/=l}
  const tgt=planted?0:l>.01?(run?5.9:2.4)*(P.cite?.5:1):0;P.v=lerp(P.v,tgt,M.min(1,(tgt>P.v?5:8)*dt));if(l>.01&&!planted){P.vel=[mx*P.v,mz*P.v];P.hd+=clamp(angDiff(P.hd,M.atan2(mx,mz)),-9*dt,9*dt)}else P.vel=[P.vel[0]*M.max(0,1-8*dt),P.vel[1]*M.max(0,1-8*dt)]}
 if(run&&P.v>3)P.stam=M.max(0,P.stam-dt/7);else P.stam=M.min(1,P.stam+dt/(P.v<3?4:10));
 P.p[0]+=P.vel[0]*dt;P.p[2]+=P.vel[1]*dt;
 if((P.cite||P.v<.4)&&!inAir){const tb=M.atan2(B.p[0]-P.p[0],B.p[2]-P.p[2]);P.hd+=clamp(angDiff(P.hd,tb),-6*dt,6*dt)}
 if(live){if(hit('Digit1')||hit('Numpad1'))bStartMan(1);if(hit('Digit2')||hit('Numpad2'))bStartMan(2);if(hit('Digit3')||hit('Numpad3'))bStartMan(3);if(hit('Digit4')||hit('Numpad4'))bStartMan(4);for(let q=5;q<=8;q++)if(hit('Digit'+q)||hit('Numpad'+q))bStartMan(q);
  if(hit('Space')&&!P.man){const rf=bRefuge(P.p);if(rf&&rf.d<1.5){P.state='entering';P.t=0;P.from=[...P.p];P.to=rf.safe;P.front=rf.front;P.cage=rf.cage;P.v=0;say(rf.cage?'¡A la gàbia!':'¡A la barrera!')}else say('Acércate a la barrera o a una gàbia',0)}}
 // maniobras
 P.off=V.lerp(P.off,[0,0,0],M.min(1,6*dt));
 if(P.man){const m=P.man;m.t+=dt;const rr=m.r;
  if(m.k==1){if(m.t<.34){P.p[0]+=rr[0]*m.s*3.1*dt;P.p[2]+=rr[2]*m.s*3.1*dt}}
  else if(m.k==2){const t=m.t,o=t<.14?-.3*m.s*(t/.14):t<.3?lerp(-.3*m.s,.75*m.s,(t-.14)/.16):t<.8?.75*m.s:lerp(.75*m.s,0,(t-.8)/.2);P.off=[rr[0]*o,0,rr[2]*o]}
  else if(m.k==3){P.vy-=9.8*dt;P.y+=P.vy*dt;if(P.y<=0&&m.t>.2){P.y=0;P.vy=0;m.dur=0;emit([P.p[0],.1,P.p[2]],[0,.6,0],.4,1.2,BOU.night?[.3,.25,.2]:[.86,.7,.5],.3);stamp(P.p[0],P.p[2],.3,40)}}
  else if(m.k==5){if(m.t<.34){P.p[0]+=rr[0]*m.s*3.1*dt;P.p[2]+=rr[2]*m.s*3.1*dt}m.spin=-m.s*TAU*sstep(.12,.62,m.t)}
  else if(m.k==6){const t=m.t;if(t<.16){P.p[0]-=rr[0]*m.s*2.2*dt;P.p[2]-=rr[2]*m.s*2.2*dt}else if(t<.46){P.p[0]+=rr[0]*m.s*4.6*dt;P.p[2]+=rr[2]*m.s*4.6*dt}}
  else if(m.k==7){const t=m.t;P.kn=M.min(1,P.kn+dt*6);const o=t<.2?-.25*m.s*(t/.2):t<.38?lerp(-.25*m.s,.62*m.s,(t-.2)/.18):t<1?.62*m.s:lerp(.62*m.s,0,(t-1)/.25);P.off=[rr[0]*o,0,rr[2]*o];if(t>1.05)P.kn=M.max(0,P.kn-dt*5)}
  else if(m.k==8){P.vy-=9.8*dt;P.y+=P.vy*dt;if(P.y<=0&&m.t>.25){P.y=0;P.vy=0;m.dur=0;BOU.pole.vis=false;emit([P.p[0],.1,P.p[2]],[0,.7,0],.5,1.4,BOU.night?[.3,.25,.2]:[.86,.7,.5],.35);stamp(P.p[0],P.p[2],.35,45)}
   const hand=V.add(bRuedo(P.p),[0,P.y+1.9,0]),dir=V.norm(V.sub(hand,m.plant)),L=V.d(hand,m.plant);BOU.pole.p=m.plant;BOU.pole.r=[-M.asin(clamp(dir[1],-1,1)),M.atan2(dir[0],dir[2]),0];BOU.pole.s=M.max(L,.5)}
  else if(m.k==4){if(m.t<.38&&!m.ok&&B.v>1){const hand=V.add(bRuedo(P.p),[M.sin(P.hd)*.55,1.25,M.cos(P.hd)*.55]),tp=hornTips(B);for(let i=0;i<2;i++)if(V.d(hand,tp[i])<.85){m.ok=1;bRing(B,i);break}}}
  if(m.t>=m.dur){P.man=null;P.cool=.22;P.kn=0;if(BOU.pole)BOU.pole.vis=false}}
 // límites y jaulas
 if(!(P.man&&(P.man.k==3||P.man.k==8))){const q=bClamp(P.p,.35);P.p=q.p;for(const c of BCAGE){const dx=P.p[0]-c[0],dz=P.p[2]-c[1],d=M.hypot(dx,dz);if(d<1.15){P.p[0]=c[0]+dx/d*1.15;P.p[2]=c[1]+dz/d*1.15}}}}
else if(P.state=='entering'){P.t+=0;const u=M.min(1,(P.t)/.45);P.p=V.lerp(P.from,P.to,sstep(0,1,u));P.v=2;if(u>=1){P.state='safe';P.t=0;if(BOU.pass){BOU.pass=null}}}
else if(P.state=='safe'){P.v=0;P.cite=0;const tb=M.atan2(B.p[0]-P.p[0],B.p[2]-P.p[2]);P.hd+=clamp(angDiff(P.hd,tb),-4*dt,4*dt);
 if(live&&P.t>.5&&(hit('Space')||key('KeyW')&&P.t>1)){P.state='leaving';P.t=0;P.from=[...P.p];P.to=P.front}}
else if(P.state=='leaving'){const u=M.min(1,P.t/.4);P.p=V.lerp(P.from,P.to,sstep(0,1,u));P.v=2;if(u>=1){P.state='ok';P.vel=[0,0]}}
else if(P.state=='toss'){const q=P.toss;q.t+=dt;if(!q.down){q.vy-=14*dt;P.y+=q.vy*dt;q.rx+=dt*7;P.p[0]+=q.dir[0]*3*dt;P.p[2]+=q.dir[2]*3*dt;if(P.y<=0&&q.t>.3){P.y=0;q.down=1;q.tl=q.t;emit([P.p[0],.2,P.p[2]],[0,.8,0],.6,1.8,[.86,.7,.5],.45);shake(.3)}}
 else if(q.t-q.tl>2.2){P.state='ok';P.y=0;P.man=null;say(P.golpes>=2?'Último aviso del servicio médico':'Te levantas dolorido',0,'red')}
 const qq=bClamp(P.p,.35);P.p=qq.p}
// animación
const H=P.h,bp=bBody(P);H.root.p=[bp[0],P.y,bp[2]];
if(P.state=='toss'){const q=P.toss;H.root.r=q.down?[-PI/2*.97,P.hd,0]:[q.rx,P.hd,.3];P.aph=animHuman(H,{speed:0,ph:P.aph,free:[1,1]},dt);return}
const m=P.man,roll=m&&(m.k==2||m.k==7)?-V.dot(P.off,rightOf(P.hd))*.35:m&&(m.k==1||m.k==5||m.k==6)&&m.t<.4?-m.s*.25:0;H.root.r=[m&&m.k==8&&P.y>.3?-.35:0,P.hd+(m&&m.k==5?m.spin||0:0),roll];
const look=angDiff(P.hd,M.atan2(B.p[0]-P.p[0],B.p[2]-P.p[2]));const air=m&&m.k==3;
P.aph=animHuman(H,{speed:air?0:P.v,ph:P.aph,lean:P.v>4?.14:P.cite?-.08:0,look:clamp(look,-1.2,1.2),crouch:air?clamp(P.vy/6,0,1)*.6:0,kneel:P.kn||0,stance:P.cite||(m&&m.k==2)?.7:0,free:[!(P.cite||m),!(P.cite||m)]},dt);
const A=H.arms;if(P.cite){const w=M.sin(G.t*9);A[0].sh.q=Q.euler(-2.5+w*.25,0,-.35);A[1].sh.q=Q.euler(-2.5-w*.25,0,.35);A[0].el.q=Q.euler(-.4,0,0);A[1].el.q=Q.euler(-.4,0,0)}
else if(m){if(m.k==8){A[0].sh.q=Q.euler(-2.9,0,-.15);A[1].sh.q=Q.euler(-2.7,0,.15);A[0].el.q=A[1].el.q=Q.euler(-.15,0,0)}
 else if(m.k==7){A[0].sh.q=Q.euler(-.4,0,-1.3);A[1].sh.q=Q.euler(-.4,0,1.3);A[0].el.q=A[1].el.q=Q.euler(-.3,0,0)}
 else if(m.k==3){const sp=m.t>.2?1.45:.6;A[0].sh.q=Q.euler(-1.2,0,-sp);A[1].sh.q=Q.euler(-1.2,0,sp);A[0].el.q=A[1].el.q=Q.euler(-.1,0,0)}
 else if(m.k==4){A[0].sh.q=Q.euler(-1.55,0,-.1);A[0].el.q=Q.euler(-.1,0,0);A[1].sh.q=Q.euler(-.3,0,.5);A[1].el.q=Q.euler(-.6,0,0)}
 else{A[0].sh.q=Q.euler(-.6,0,-1.1);A[1].sh.q=Q.euler(-.6,0,1.1);A[0].el.q=A[1].el.q=Q.euler(-.5,0,0)}}}
function bRing(B,i){const cols=[[.95,.75,.1],[.8,.1,.1],[.1,.3,.8],[.1,.6,.2]];const rg=new Node(makeMesh(paint(lathe([[.05,-.012],[.075,-.012],[.075,.012],[.05,.012]],14),()=>[1,1,1,0])),mat({base:cols[B.rings.length%4],rough:.3,metal:.6}));
const s=B.m.sz;rg.p=[(i?1:-1)*.2*s,.32*s,.16*s];rg.r=[.5,0,(i?-1:1)*.7];B.m.head.add(rg);B.rings.push(rg);say('¡Anilla!',0,'gold')}
function bCogida(P,B,soft){const S=BOU.pass;if(S)S.hurt=1;P.state='toss';P.man=null;P.off=[0,0,0];P.golpes+=soft?.5:1;BOU.revol++;P.toss={t:0,vy:soft?3.2:6.4,rx:0,dir:fwdOf(B.h),down:0};P.y=M.max(P.y,.01);gasp();shake(soft?.35:.75);R.exc=1;PUB.standT=M.max(PUB.standT,1.4);
say(soft?'¡Revolcón!':'¡Cogida!',1,'red');
// los compañeros hacen el quite
const near=BOU.npcs.filter(o=>o.state=='free'||o.state=='cite').sort((a,b)=>V.d2(a.p,B.p)-V.d2(b.p,B.p))[0];if(near){near.state='cite';near.t=0;B.tgt={o:near,isP:0}}
if(P.golpes>=3&&!BOU.over){BOU.over=1;setTimeout(()=>endBous('enfermeria'),2600)}}
function bHits(){const B=BOU.B,P=BOU.P;if(B.v<2.3||B.state=='atado')return;const tp=hornTips(B),f=fwdOf(B.h),r=rightOf(B.h),sz=B.m.sz;
if(P.state=='ok'){const bp=bBody(P),a=[bp[0],P.y+.25,bp[2]],b=[bp[0],P.y+lerp(1.62,1.12,P.kn||0),bp[2]];const d=M.min(segDist(tp[0],a,b),segDist(tp[1],a,b));
 const S=BOU.pass;if(S&&d<S.minD){S.minD=d;S.bv=B.v;S.man=P.man?{k:P.man.k,lead:P.man.t,run:P.man.run,ok:P.man.ok}:null}
 if(d<.26){bCogida(P,B,0);return}
 const rel=V.sub(bRuedo(bp),B.p),al=V.dot(rel,f),lt=V.dot(rel,r);if(M.abs(al-.15*sz)<1.2*sz&&M.abs(lt)<.42*sz&&P.y<1.3*sz&&!(P.man&&P.man.k==8&&P.y>.6)){bCogida(P,B,1);return}}
for(const o of BOU.npcs){if(o.state=='safe'||o.state=='down'||o.state=='entering')continue;const bp=[o.p[0]+o.off[0],1,o.p[2]+o.off[2]];if(M.min(V.d(tp[0],bp),V.d(tp[1],bp))<.5){o.state='down';o.t=0;o.y=0;gasp();R.exc=M.min(1,R.exc+.25);if(V.d2(o.p,P.p)<20)say('¡Revuelca a un mozo!',0,'red')}}}
// ---------- mozos y recortadores del pueblo ----------
function bNpcs(dt){const B=BOU.B;for(const o of BOU.npcs){o.t+=dt;const dx=B.p[0]-o.p[0],dz=B.p[2]-o.p[2],d=M.hypot(dx,dz),tb=M.atan2(dx,dz);const tgtMe=B.tgt&&B.tgt.o===o&&B.state=='arranca';
 let want=null,sp=0;o.off=V.lerp(o.off,[0,0,0],M.min(1,5*dt));o.wav=0;
 const danger=(tgtMe&&d<11)||(B.v>4&&d<5.5&&M.abs(angDiff(B.h,tb+PI))<.6);
 if(o.state=='free'||o.state=='cite'){if(danger){if(o.pro&&tgtMe){o.state='recorte';o.t=0;o.rs=0}else{const rf=bRefuge(o.p);o.state='flee';o.rf=rf;o.t=0}}
  else if(o.state=='free'){if(!o.goal||V.d2(o.p,o.goal)<.8||o.t>8){let g;for(let k=0;k<6;k++){g=[rnd(-15,15),0,rnd(-11,11)];if(V.d2(g,B.p)>7)break}o.goal=g;o.t=0}want=o.goal;sp=o.t<.5?0:1.6;
   if(BOU.t>0&&d>6&&d<16&&M.random()<dt*.12*o.bold&&B.state!='arranca'){o.state='cite';o.t=0}}
  else{want=null;o.wav=1;o.hd+=clamp(angDiff(o.hd,tb),-5*dt,5*dt);if(o.t>rnd(2.5,4))o.state='free'}}
 else if(o.state=='recorte'){o.hd+=clamp(angDiff(o.hd,tb),-6*dt,6*dt);const arr=bArr(B,o.p);if(!o.rs&&arr<.3&&B.v>3){o.rs=1;o.rt=0;const r=rightOf(B.h),lat=V.dot(V.sub(o.p,B.p),r);o.rd=V.sc(r,(lat>=0?1:-1)*(M.random()<.88?1:.25))}
  if(o.rs){o.rt+=dt;if(o.rt<.34){o.p[0]+=o.rd[0]*3.2*dt;o.p[2]+=o.rd[2]*3.2*dt}if(o.rt>.9){o.state='free';o.t=0;if(V.d2(o.p,B.p)<3){aplauso(.6,1.4);R.exc=M.min(1,R.exc+.12)}}}
  else{want=V.madd(o.p,[dx/d,0,dz/d],1);sp=d>6?2.5:0}}
 else if(o.state=='flee'){want=o.rf.front;sp=5.4;if(V.d2(o.p,o.rf.front)<.7){o.state='entering';o.t=0;o.from=[...o.p]}}
 else if(o.state=='entering'){const u=M.min(1,o.t/.45);o.p=V.lerp(o.from,o.rf.safe,u);if(u>=1){o.state='safe';o.t=0;o.wait=rnd(3,9)}}
 else if(o.state=='safe'){o.hd+=clamp(angDiff(o.hd,tb),-4*dt,4*dt);o.wav=M.random()<.3?1:0;if(o.t>o.wait&&d>8&&BOU.t>0){o.state='leaving';o.t=0;o.from=[...o.p]}}
 else if(o.state=='leaving'){const u=M.min(1,o.t/.45);o.p=V.lerp(o.from,o.rf.front,u);if(u>=1){o.state='free';o.t=0;o.goal=null}}
 else if(o.state=='down'){if(o.t>2.4){o.state='flee';o.rf=bRefuge(o.p);o.t=0}}
 if(want){const wx=want[0]-o.p[0],wz=want[2]-o.p[2],l=M.hypot(wx,wz);if(l>.2){o.hd+=clamp(angDiff(o.hd,M.atan2(wx,wz)),-7*dt,7*dt);o.v=lerp(o.v,sp,M.min(1,4*dt))}else o.v=lerp(o.v,0,M.min(1,6*dt))}
 else if(o.state!='recorte')o.v=lerp(o.v,0,M.min(1,6*dt));
 if(o.state!='entering'&&o.state!='leaving'&&o.state!='safe'){o.p[0]+=M.sin(o.hd)*o.v*dt;o.p[2]+=M.cos(o.hd)*o.v*dt;o.p=bClamp(o.p,.35).p;
  for(const c of BCAGE){const ex=o.p[0]-c[0],ez=o.p[2]-c[1],e=M.hypot(ex,ez);if(e<1.15){o.p[0]=c[0]+ex/e*1.15;o.p[2]=c[1]+ez/e*1.15}}
  for(const q of BOU.npcs)if(q!==o){const ex=o.p[0]-q.p[0],ez=o.p[2]-q.p[2],e=M.hypot(ex,ez);if(e<.6&&e>1e-3){o.p[0]+=ex/e*(.6-e)*.5;o.p[2]+=ez/e*(.6-e)*.5}}}
 const H=o.h;H.root.p=[o.p[0],0,o.p[2]];
 if(o.state=='down'){H.root.r=[-PI/2*.97,o.hd,0];H.root.p[1]=.12;o.aph=animHuman(H,{speed:0,ph:o.aph,free:[1,1]},dt);continue}
 H.root.r=[0,o.hd,o.rs&&o.rt<.4?-.25:0];const lk=angDiff(o.hd,tb);o.aph=animHuman(H,{speed:o.v,ph:o.aph,lean:o.v>4?.14:0,look:clamp(lk,-1.1,1.1),stance:o.state=='recorte'?.6:0,free:[!o.wav,!o.wav]},dt);
 if(o.wav){const w=M.sin(G.t*8+o.aph*9);H.arms[0].sh.q=Q.euler(-2.4+w*.3,0,-.3);H.arms[1].sh.q=Q.euler(-2.4-w*.3,0,.3);H.arms[0].el.q=H.arms[1].el.q=Q.euler(-.4,0,0)}}}
// ---------- fuego del bou embolat ----------
function bFire(dt){const B=BOU.B;if(!BOU.night)return[];const tp=hornTips(B);const lit=BOU.t>-3.2;if(lit&&!BOU.lit){BOU.lit=1;say('¡Foc a les boles!',1,'red');R.exc=M.min(1,R.exc+.3)}
const L=[];BOU.fire.forEach((f,i)=>{const p=V.add(tp[i],[0,.02,0]);f.p=p;f.vis=true;f.mat.emis=lit?[22,9,2.2]:[0,0,0];
 if(lit){const fl=.75+.25*M.sin(G.t*23+i*2)+.15*M.sin(G.t*37+i);for(let k=0;k<3;k++)emit(V.add(p,[rnd(-.06,.06),rnd(0,.08),rnd(-.06,.06)]),[rnd(-.25,.25)-M.sin(B.mh)*B.v*.35,rnd(.9,1.8),rnd(-.25,.25)-M.cos(B.mh)*B.v*.35],rnd(.14,.24),rnd(.22,.4),[rnd(9,14),rnd(3.4,5),rnd(.6,1.1)],.95);
  if(M.random()<.35)emit(V.add(p,[0,.25,0]),[rnd(-.2,.2),rnd(.5,1),rnd(-.2,.2)],.35,1.4,[.05,.045,.04],.25);if(M.random()<.12)emit(p,[rnd(-1,1),rnd(1.5,3),rnd(-1,1)],.03,1.1,[20,8,2],1,4);
  L.push({p:V.add(p,[0,.35,0]),c:[34*fl,15*fl,3.6*fl]})}});
if(lit&&AU.c&&M.random()<dt*14)noiseHit(AU.c.currentTime,.05,rnd(2500,5000),2,.05,'bandpass');return L}
// ---------- bucle ----------
function updBous(dt,rdt){const P=BOU.P,B=BOU.B,live=G.mode=='bous';if(live&&!BOU.over)BOU.t+=dt;
if(BOU.t<0&&live){const c=M.ceil(-BOU.t);if(c!==BOU.cd){BOU.cd=c;if(c<=3)say(String(c),1)}}
if(!BOU.night&&BOU.t>=0&&B.state=='salida'&&!BOU.open){BOU.open=1;cohete();say('¡Sale el toro!',1,'red');musica(false);R.exc=.9}
if(BOU.t<0)BOU.open=0;BOU.door.p[1]=lerp(BOU.door.p[1],BOU.open?3.9:1.3,M.min(1,3*dt));
bBull(dt);bPlayer(dt);bNpcs(dt);if(live&&!BOU.over)bHits();
const B2=BOU.B;animBull(B2,dt);B2.m.root.p=[B2.p[0],0,B2.p[2]];B2.m.root.r=[0,B2.h,0];
const fireL=bFire(dt);
// luces nocturnas: fuego + farolas cercanas
if(BOU.night){const c=[P.p[0],0,P.p[2]];const ls=BOU.lamps.map(p=>[p,V.d2(p,c)]).sort((a,b)=>a[1]-b[1]).slice(0,8-fireL.length).map(([p])=>({p,c:[30,19,8]}));R.pl=[...fireL,...ls]}else R.pl=null;
// HUD
if(live){const rem=M.max(0,BOU.dur-M.max(0,BOU.t));$('clock').textContent=BOU.t<0?fmtT(BOU.dur):fmtT(rem);$('score').textContent=BOU.score;bar('fzBar',P.stam);bar('amb',R.exc);
 $('avisos').textContent=P.golpes>0?'✚'.repeat(M.ceil(P.golpes)):'';
 const mt=$('meter');if(B.state=='arranca'&&B.tgt&&B.tgt.isP&&P.state=='ok'){const arr=bArr(B,P.p);mt.style.opacity=1;$('mk').style.left=clamp((1-arr/1.6)*100,0,100)+'%';$('mz').style.left=(1-.5/1.6)*100+'%';$('mz').style.width=(.28/1.6*100)+'%';
  const now=arr<.5&&arr>.22;$('mtxt').textContent=now?'¡Ahora!':arr>.5?'Aguanta…':'';rhythmCue(now)}else{mt.style.opacity=0;rhythmCue(false)}
 if(rem<=0&&!BOU.over&&BOU.t>0){BOU.over=1;say('¡Fin del concurso!',1,'gold');setTimeout(()=>endBous('tiempo'),1800)}
 R.exc=M.max(.15,R.exc-dt*.05);crowdLevel(.12+R.exc*.32)}
// cámara
if(!cineUpd(rdt)){G.ts=lerp(G.ts,1,M.min(1,4*rdt));const pp=bRuedo(P.p),db=V.d2(pp,B.p);const want=db<34?M.atan2(B.p[0]-pp[0],B.p[2]-pp[2]):P.hd;BOU.cy+=angDiff(BOU.cy,want)*M.min(1,2.2*rdt);
 const look=V.lerp(V.add(pp,[0,1.35+P.y*.5,0]),V.add(B.p,[0,1,0]),clamp(.45-db/80,.1,.4));CAM.fov=lerp(CAM.fov,P.v>4.5?64:58,M.min(1,3*rdt));
 camFollow(rdt,[pp[0],P.y,pp[2]],look,P.state=='safe'?3.4:5.4,2.35+P.y*.6,BOU.cy);const q=bClamp(CAM.p,-1.4);CAM.p=[q.p[0],M.max(CAM.p[1],.6),q.p[2]]}
R.fx.vig=B.state=='arranca'&&B.tgt&&B.tgt.isP&&V.d2(B.p,P.p)<4?.3:BOU.night?.25:0;R.fx.red=P.state=='toss'?.25:0;R.fx.spd=0;
ENV.sh0c=[P.p[0],0,P.p[2]];ENV.sh0h=15;ENV.sh1c=[0,0,4];ENV.sh1h=62}
function endBous(why){if(G.mode=='result')return;G.prevMode='bous';G.mode='result';BOU.over=1;R.fx.red=0;R.fx.vig=0;rhythmCue(false);const sc=BOU.score,night=BOU.night;let title,sub;
if(why=='enfermeria'){title='A la enfermería';sub='Tres golpes son demasiados: el servicio médico te retira de la plaza.'}
else if(sc>=600){title=night?'Rey de la nit':'Campeón del concurso';sub='El jurado te da el primer premio y la plaza te aclama en los cadafals.';ovacion(1.3,8)}
else if(sc>=400){title='Segundo premio';sub='Gran actuación: recortes ajustados y aplauso unánime.';ovacion(1,5)}
else if(sc>=220){title='Tercer premio';sub='Buen concurso, con alguna ejecución de mérito.';aplauso(1,3)}
else if(sc>=80){title='Mención del jurado';sub='Has dejado detalles, pero falta ajustarse más al toro.';aplauso(.6,2)}
else{title='Sin premio';sub='El toro se ha impuesto esta vez.'}
$('rTitle').textContent=title;$('rSub').textContent=sub;$('rPan').hidden=true;const c=BOU.cnt;
stats([['Puntos del jurado',sc],['Mejor ejecución',BOU.best?`${BOU.best.n} (${BOU.best.tot})`:'—'],['Recortes · Reversos · Engaños',`${c[1]||0} · ${c[5]||0} · ${c[6]||0}`],['Quiebros (de rodillas)',`${c[2]||0} (${c[7]||0})`],['Saltos · Garrocha · Anillas',`${c[3]||0} · ${c[8]||0} · ${c[4]||0}`],['Revolcones',BOU.revol],['Modalidad',night?'Bou embolat':'Concurso']]);
hide('hud');show('result');$('again').focus()}
