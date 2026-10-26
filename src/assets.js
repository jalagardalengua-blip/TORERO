// ================= TEXTURAS PROCEDURALES =================
function cnv(w,h=w){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function hsh(x,y,s){let h=(x*374761393+y*668265263+s*982451653)|0;h=M.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function tnoise(x,y,P,s=0){const ix=M.floor(x),iy=M.floor(y),fx=x-ix,fy=y-iy,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy),w=k=>((k%P)+P)%P;
const a=hsh(w(ix),w(iy),s),b=hsh(w(ix+1),w(iy),s),c=hsh(w(ix),w(iy+1),s),d=hsh(w(ix+1),w(iy+1),s);return lerp(lerp(a,b,ux),lerp(c,d,ux),uy)}
function tfbm(x,y,P,o=5,s=0){let v=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){v+=a*tnoise(x*f,y*f,P*f,s+i);n+=a;a*=.5;f*=2}return v/n}
function nrmFromH(H,w,h,str){const c=cnv(w,h),x=c.getContext('2d'),im=x.createImageData(w,h),d=im.data;
for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=(H[j*w+(i+1)%w]-H[j*w+(i-1+w)%w])*str,dy=(H[((j+1)%h)*w+i]-H[((j-1+h)%h)*w+i])*str,l=M.hypot(dx,dy,1),o=(j*w+i)*4;
d[o]=(-dx/l*.5+.5)*255;d[o+1]=(-dy/l*.5+.5)*255;d[o+2]=(1/l*.5+.5)*255;d[o+3]=255}x.putImageData(im,0,0);return c}
function fromF(w,h,f){const c=cnv(w,h),x=c.getContext('2d'),im=x.createImageData(w,h),d=im.data;for(let j=0;j<h;j++)for(let i=0;i<w;i++){const v=f(i,j),o=(j*w+i)*4;d[o]=v[0];d[o+1]=v[1];d[o+2]=v[2];d[o+3]=255}x.putImageData(im,0,0);return c}
const TX={};
function makeTextures(){
// --- Albero (arena) 512 px = 2.5 m ---
{const S=512,H=new Float32Array(S*S),A=[];for(let j=0;j<S;j++)for(let i=0;i<S;i++){const n=tfbm(i/64,j/64,8,5,1),g=hsh(i,j,7),pb=tnoise(i/5,j/5,103,3);
let h=n*.6+g*.25+(pb>.82?(pb-.82)*4:0);H[j*S+i]=h;A.push([n,g,pb])}
TX.arenaA=texC(fromF(S,S,(i,j)=>{const[n,g,pb]=A[j*S+i];let r=200+n*40-28+g*22,gg=152+n*34-24+g*18,b=88+n*22-18+g*12;if(pb>.84){const k=.65+hsh(i>>2,j>>2,9)*.5;r*=k;gg*=k;b*=k*.95}if(g>.985){r+=30;gg+=28;b+=24}return[r,gg,b]}));
TX.arenaN=texC(nrmFromH(H,S,S,3.2),{srgb:false})}
// --- Pelo del toro (normal) ---
{const S=256,c=cnv(S),x=c.getContext('2d');x.fillStyle='#808080';x.fillRect(0,0,S,S);const r=mulberry(3);
for(let k=0;k<5200;k++){const px=r()*S,py=r()*S,l=6+r()*12,v=(r()*120+60)|0;x.strokeStyle=`rgb(${v},${v},${v})`;x.lineWidth=1+r();x.beginPath();x.moveTo(px,py);x.lineTo(px+(r()-.5)*2,py+l);x.stroke();
if(py+l>S){x.beginPath();x.moveTo(px,py-S);x.lineTo(px,py+l-S);x.stroke()}}
const d=x.getImageData(0,0,S,S).data,H=new Float32Array(S*S);for(let k=0;k<S*S;k++)H[k]=d[k*4]/255;TX.furN=texC(nrmFromH(H,S,S,1.6),{srgb:false})}
// --- Bordado de oro (máscara R oro, G lentejuela) ---
{const S=512,c=cnv(S),x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,S,S);x.strokeStyle='#fff';x.fillStyle='#fff';x.lineCap='round';const r=mulberry(21);
const cell=64;for(let cy=0;cy<S;cy+=cell)for(let cx=0;cx<S;cx+=cell){const ox=cx+cell/2,oy=cy+cell/2;x.lineWidth=2.2;
for(const s of[-1,1]){x.beginPath();for(let t=0;t<5.5;t+=.12){const rr=4+t*4.2,a=t*1.9*s;x.lineTo(ox+M.cos(a)*rr*s,oy+M.sin(a)*rr)}x.stroke()}
x.lineWidth=2;x.beginPath();x.arc(ox,oy,5,0,TAU);x.fill();for(let k=0;k<8;k++){const a=k/8*TAU;x.beginPath();x.arc(ox+M.cos(a)*27,oy+M.sin(a)*27,2.4,0,TAU);x.fill()}
x.beginPath();x.moveTo(cx,cy);x.quadraticCurveTo(ox,cy+8,cx+cell,cy);x.stroke()}
const d=x.getImageData(0,0,S,S).data,H=new Float32Array(S*S);const out=fromF(S,S,(i,j)=>{const m=d[(j*S+i)*4];H[j*S+i]=m/255;return[m,m>40?((hsh(i>>1,j>>1,5)*255)|0):0,m]});
TX.emb=texC(out,{srgb:false});TX.embN=texC(nrmFromH(H,S,S,2.2),{srgb:false})}
// --- Madera pintada de la barrera (2 m) ---
{const S=512,H=new Float32Array(S*S);const pw=S/14;TX.woodA=texC(fromF(S,S,(i,j)=>{const pl=M.floor(i/pw),fx=(i%pw)/pw,gap=fx<.04||fx>.96,g=tfbm(i/20,j/90,25,4,pl),wear=tfbm(i/30,j/30,17,4,9);
H[j*S+i]=gap?0:.5+g*.2;let r=132+g*30,gg=26+g*8,b=18+g*6;if(wear>.68){const k=(wear-.68)*3;r=lerp(r,120,k);gg=lerp(gg,88,k);b=lerp(b,60,k)}if(j>S*.92){r=lerp(r,90,.4);gg=lerp(gg,70,.4);b=lerp(b,50,.4)}return gap?[36,14,10]:[r,gg,b]}));
TX.woodN=texC(nrmFromH(H,S,S,3),{srgb:false})}
// --- Piedra encalada / hormigón ---
{const S=512,H=new Float32Array(S*S);TX.stoneA=texC(fromF(S,S,(i,j)=>{const n=tfbm(i/50,j/50,10,5,4),f=hsh(i,j,2),st=tfbm(i/120,j/30,4,3,8);H[j*S+i]=n*.5+f*.15;
const k=.88+n*.14+f*.05-(st>.62?(st-.62)*.6:0);return[214*k,205*k,188*k]}));TX.stoneN=texC(nrmFromH(H,S,S,1.4),{srgb:false})}
// --- Ladrillo neomudéjar con arcos de herradura ---
{const S=512,bw=S/8,bh=S/32,H=new Float32Array(S*S);TX.brickA=texC(fromF(S,S,(i,j)=>{const row=M.floor(j/bh),off=row%2?bw/2:0,bx=((i+off)%bw),by=j%bh,mort=bx<3||by<2;
const id=M.floor((i+off)/bw)+row*31,v=hsh(id,row,3),n=tfbm(i/16,j/16,32,3,6);H[j*S+i]=mort?0:.6+n*.2;
if(mort)return[150,140,124];return[158+v*40+n*20,72+v*18+n*10,46+v*14]}));TX.brickN=texC(nrmFromH(H,S,S,2.5),{srgb:false})}
// --- Tela (trama) ---
{const S=128,H=new Float32Array(S*S);for(let j=0;j<S;j++)for(let i=0;i<S;i++)H[j*S+i]=(M.sin(i/S*TAU*32)*.5+.5)*(M.sin(j/S*TAU*32+PI*((i>>2)&1))*.5+.5);TX.clothN=texC(nrmFromH(H,S,S,1.2),{srgb:false})}
// --- Adoquín ---
{const S=512,H=new Float32Array(S*S),cs=S/10,pts=[];const rr=mulberry(5);for(let j=0;j<10;j++)for(let i=0;i<10;i++)pts.push([(i+.25+rr()*.5)*cs,(j+.25+rr()*.5)*cs,rr()]);
TX.cobA=texC(fromF(S,S,(i,j)=>{let d1=1e9,d2=1e9,v=0;const ci=M.floor(i/cs),cj=M.floor(j/cs);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const ii=((ci+a)%10+10)%10,jj=((cj+b)%10+10)%10,p=pts[jj*10+ii];
const px=p[0]+(ci+a-ii)*cs,py=p[1]+(cj+b-jj)*cs,dd=M.hypot(i-px,j-py);if(dd<d1){d2=d1;d1=dd;v=p[2]}else if(dd<d2)d2=dd}
const e=d2-d1,h=clamp(e/10,0,1),n=tfbm(i/24,j/24,21,3,2);H[j*S+i]=M.sqrt(h)+n*.1;const k=e<2.5?.45:.75+v*.3+n*.15;return[118*k,112*k,104*k]}));TX.cobN=texC(nrmFromH(H,S,S,3.5),{srgb:false})}
// --- Fachada (1 vano: 3 m x 3.2 m) ---
{const W=256,Hh=272,H=new Float32Array(W*Hh);TX.facA=texC(fromF(W,Hh,(i,j)=>{const n=tfbm(i/30,j/30,8,4,3),x=i/W,y=j/Hh;let c=[235,228,214];let h=.5+n*.05;
const inWin=x>.3&&x<.7&&y>.18&&y<.86,frame=x>.27&&x<.73&&y>.15&&y<.89;if(frame&&!inWin){c=[205,196,178];h=.62}
if(inWin){const sh=x<.38||x>.62;if(sh){c=[52,92,62];if(((j>>2)&1))c=[44,80,54];h=.45}else{c=[24,26,30];h=.2;if(y>.8)c=[60,40,30]}}
if(y>.86&&y<.9&&x>.22&&x<.78){c=[180,170,150];h=.7}const k=.92+n*.12;return[c[0]*k,c[1]*k,c[2]*k]},),{});
for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){const x=i/W,y=j/Hh;H[j*W+i]=(x>.3&&x<.7&&y>.18&&y<.86)?0:(x>.27&&x<.73&&y>.15&&y<.89)?.8:.5}
TX.facN=texC(nrmFromH(H,W,Hh,2.4),{srgb:false})}
}
// ================= MATERIALES =================
let MID=0;const mat=o=>Object.assign({id:++MID},o);
// ================= TORO =================
const CAPAS={negro:{c:[.019,.017,.016],sh:[.32,.26,.22]},castano:{c:[.10,.04,.016],sh:[.5,.28,.15]},colorado:{c:[.2,.055,.02],sh:[.55,.26,.15]},
cardeno:{c:[.2,.2,.2],sh:[.45,.45,.45],pat:1},berrendo:{c:[.7,.66,.6],sh:[.6,.55,.5],pat:2},jabonero:{c:[.6,.47,.3],sh:[.75,.62,.45]},ensabanado:{c:[.74,.71,.65],sh:[.85,.82,.78]},salinero:{c:[.4,.2,.12],sh:[.6,.45,.4],pat:3},sardo:{c:[.2,.08,.04],sh:[.5,.35,.3],pat:4},chorreado:{c:[.1,.04,.016],sh:[.5,.28,.15],pat:5}};
function coat(capa,x,y,z,seed){const C=CAPAS[capa]||CAPAS.negro;let c=C.c;
if(C.pat==1){const n=noise3(x*16+seed,y*16,z*16)+noise3(x*40,y*40+seed,z*40)*.5;c=n>.05?[.02,.019,.018]:n>-.25?[.16,.16,.15]:[.55,.55,.52]}
if(C.pat==2){const n=fbm3(x*1.6+seed,y*1.6,z*1.6,3);c=n>.05?[.02,.018,.017]:[.72,.68,.62]}
if(C.pat==3){const n=noise3(x*34+seed,y*34,z*34)+noise3(x*70,y*70+seed,z*70)*.5;c=n>.1?[.34,.09,.035]:n>-.2?[.55,.33,.25]:[.74,.68,.6]}
if(C.pat==4){const n=fbm3(x*2.4+seed,y*2.4,z*2.4,3),n2=noise3(x*9+seed,y*9,z*9);c=n>.12?[.02,.018,.017]:n>-.12?(n2>0?[.3,.08,.03]:[.2,.06,.025]):[.72,.68,.62]}
if(C.pat==5){const s=M.sin(z*26+noise3(x*3+seed,y*3,z*3)*5+y*3);c=s>.35?[.025,.018,.014]:C.c}
return c}
function crPts(c,n){const o=[];for(let k=0;k<n;k++){const t=k/(n-1)*(c.length-1),i=M.min(c.length-2,M.floor(t)),f=t-i,p0=c[M.max(0,i-1)],p1=c[i],p2=c[i+1],p3=c[M.min(c.length-1,i+2)];
o.push([0,1,2].map(a=>.5*((2*p1[a])+(-p0[a]+p2[a])*f+(2*p0[a]-5*p1[a]+4*p2[a]-p3[a])*f*f+(-p0[a]+3*p1[a]-3*p2[a]+p3[a])*f*f*f)))}return o}
const HORNS={veleto:[[.1,.13,.02],[.21,.15,.03],[.31,.21,.09],[.35,.32,.17],[.3,.42,.24]],cornidelantero:[[.1,.13,.02],[.22,.14,.06],[.32,.17,.16],[.35,.24,.28],[.29,.3,.38]],
corniabierto:[[.1,.13,.02],[.24,.14,.02],[.38,.18,.07],[.47,.27,.14],[.46,.37,.2]],cabestro:[[.1,.13,.02],[.26,.14,.0],[.44,.2,.02],[.58,.33,.08],[.62,.5,.12]],brocho:[[.1,.13,.02],[.2,.17,.02],[.26,.26,.06],[.25,.36,.12],[.18,.44,.14]],playero:[[.1,.13,.02],[.25,.16,0],[.4,.24,.02],[.5,.36,.08],[.55,.48,.12]],cornivuelto:[[.1,.13,.02],[.22,.16,.04],[.32,.26,.08],[.34,.38,.06],[.28,.46,-.02]]};
function buildBull(o={}){const capa=o.capa||'negro',sz=o.size||1,seed=o.seed||1,cab=!!o.cabestro,C=CAPAS[capa];
const fur=mat({base:[1,1,1],rough:.44,sheen:.5,sheenC:C.sh,det:TX.furN,detS:.5,duv:[9,9],uv:[1,1]});
const hornM=mat({base:[1,1,1],rough:.32}),blk=mat({base:[.012,.011,.01],rough:.36}),eyeM=mat({base:[.01,.008,.008],rough:.04}),bell=mat({base:[.55,.38,.16],rough:.35,metal:1});
const cf=(P)=>{const c=coat(capa,P[0],P[1],P[2],seed);return[c[0],c[1],c[2],0]};
const root=new Node();const body=root.add(new Node());body.p=[0,.95,0];
// cuerpo esculpido
const bodyG=blob(64,44,(x,y,z)=>{const top=curve(z,[[-1,.18],[-.85,.34],[-.6,.38],[-.2,.34],[.2,.38],[.5,(cab?.48:.55)],[.78,.52],[1,.32]]),bot=curve(z,[[-1,.16],[-.8,.32],[-.4,.36],[0,.43],[.45,.5],[.75,.46],[1,.28]]),
wid=curve(z,[[-1,.17],[-.75,.34],[-.45,.31],[0,.4],[.45,.37],[.8,.33],[1,.2]]);let X=x*wid,Y=y>0?y*top:y*bot,Z=z<0?-M.pow(-z,.82)*1.04:z*1.06;
const sc=M.exp(-((M.abs(x)-.75)**2+(y-.25)**2+(z-.45)**2)/.06)*.035,th=M.exp(-((M.abs(x)-.7)**2+(y+.05)**2+(z+.72)**2)/.05)*.04;const nn=noise3(x*3,y*3,z*3)*.012;
const k=1+(sc+th+nn)/M.max(.2,M.hypot(X,Y));return[X*k*sz,Y*k*sz,Z*sz]},(P)=>cf(P));
body.add(new Node(makeMesh(bodyG),fur));
// cuello
const neck=body.add(new Node());neck.p=[0,.2*sz,.7*sz];neck.r=[.1,0,0];
neck.add(new Node(makeMesh(blob(36,28,(x,y,z)=>{const w=curve(z,[[-1,.28],[0,.23],[1,.16]]),tp=curve(z,[[-1,.32],[0,.24],[1,.15]]),bt=curve(z,[[-1,.34],[-.2,cab?.36:.33],[.4,.27],[1,.16]]),Z=z*.32+.18;
return[x*w*sz,(y>0?y*tp:y*bt)*sz-Z*.25*sz,Z*sz]},cf)),fur));
if(cab){const b=blob(16,12,(x,y,z)=>[x*.09,y*.13,z*.07]);neck.add(new Node(makeMesh(xform(b,T([0,-.42*sz,.25*sz]))),bell))}
const head=neck.add(new Node());head.p=[0,-.12*sz,.46*sz];
const hG=blob(44,32,(x,y,z)=>{const w=curve(z,[[-1,.14],[-.5,.16],[.2,.125],[.7,.1],[.92,.105],[1,.09]]),ht=curve(z,[[-1,.12],[-.3,.13],[.5,.1],[1,.085]]),hb=curve(z,[[-1,.12],[0,.13],[.6,.11],[1,.095]]);
let Y=y>0?y*ht:y*hb;if(y>0)Y*=1-.18*M.pow(M.max(0,y),6);return[x*w,Y,z*.22+.12]},(P)=>{const c=cf(P);const mz=sstep(.33,.4,P[2]);return[lerp(c[0],.045,mz),lerp(c[1],.04,mz),lerp(c[2],.04,mz),0]});
const HR=T([0,0,0],[.85,0,0],sz);const eyes=merge([-1,1].map(s=>xform(blob(10,8,(x,y,z)=>[x*.022,y*.02,z*.02]),T([s*.122,.05,.03]))));
const ears=merge([-1,1].map(s=>xform(blob(12,8,(x,y,z)=>[x*.09,y*.022,z*.045]),T([s*.18,.07,-.06],[0,s*.2,s*.1]))));
const tuft=blob(16,10,(x,y,z)=>{const k=1+noise3(x*6,y*6,z*6)*.35;return[x*.07*k,y*.035*k,z*.06*k]},cf);
head.add(new Node(makeMesh(xform(merge([hG,paint(ears,(x,y,z)=>cf([x,y,z])),xform(tuft,T([0,.11,-.07]))]),HR)),fur));
head.add(new Node(makeMesh(xform(eyes,HR)),eyeM));
// astas
const hs=HORNS[cab?'cabestro':(o.horn||'veleto')],dark=o.darkHorn?1:0;
const hornG=merge([-1,1].map(s=>tube(crPts(hs.map(p=>[p[0]*s,p[1],p[2]]),18),10,t=>.048*M.pow(1-t,.85)+.003,(t)=>{const b=[.42,.38,.3],m=[.8,.74,.62],k=sstep(.55,.92,t);let c=V.lerp(b,m,sstep(0,.4,t));if(dark)c=V.lerp(c,[.05,.045,.04],.7);c=V.lerp(c,[.03,.028,.026],k);return[c[0],c[1],c[2],0]})));
head.add(new Node(makeMesh(xform(hornG,T([0,0,0],[0,0,0],sz))),hornM));
// patas
const legs=[];const ell=g=>xform(g,m4.trsE(m4.id(),[0,0,0],[0,0,0],1));
const mkLeg=(x,y,z,front,side)=>{const hip=body.add(new Node());hip.p=[x*sz,y*sz,z*sz];
const up=front?[[0,.2],[.14,.16],[.15,0],[.13,-.13],[.095,-.27],[.072,-.37],[.078,-.41],[0,-.45]]:[[0,.24],[.17,.18],[.185,0],[.16,-.16],[.11,-.32],[.075,-.45],[.08,-.5],[0,-.54]];
const ug=xform(lathe(up,20,{smooth:true}),T([0,0,front?0:.03],[0,0,0],sz));paint(ug,(X,Y,Z)=>cf([X,Y-.5,Z]));hip.add(new Node(makeMesh(ug),fur));
const knee=hip.add(new Node());knee.p=[0,-(front?.42:.5)*sz,0];
const lo=lathe([[0,.04],[.058,.03],[.06,0],[.05,-.12],[.047,-.22],[.056,-.27],[.05,-.31],[0,-.34]],14,{smooth:true});paint(lo,(X,Y,Z)=>{const c=cf([X,Y-.9,Z]);return capa=='berrendo'||capa=='jabonero'?[c[0]*.4,c[1]*.4,c[2]*.4,0]:c});
knee.add(new Node(makeMesh(xform(lo,T([0,0,0],[0,0,0],sz))),fur));
const hoof=knee.add(new Node());hoof.p=[0,-(front?.31:.34)*sz,0];
hoof.add(new Node(makeMesh(merge([-1,1].map(s=>xform(blob(10,8,(x,y,z)=>[x*.03,y*.05,(z*.07+.025)*(y<0?1.1:1)]),T([s*.031*sz,-.05*sz,.02*sz],[0,0,0],sz))))),blk));
const L={hip,knee,hoof,front,side,a0:front?0:-.25,k0:front?0:.55};legs.push(L);return L};
mkLeg(-.2,-.12,.58,1,-1);mkLeg(.2,-.12,.58,1,1);mkLeg(-.18,-.05,-.72,0,-1);mkLeg(.18,-.05,-.72,0,1);
// cola
const tail=body.add(new Node());tail.p=[0,.3*sz,-1.0*sz];const tl=tail.add(new Node());
tl.add(new Node(makeMesh(merge([tube([[0,0,0],[0,-.12,-.08],[0,-.35,-.1],[0,-.62,-.08]],8,t=>.035-.016*t,()=>[...cf([0,0,-1]),0]),paint(xform(blob(10,8,(x,y,z)=>[x*.045,y*.13,z*.045]),T([0,-.72,-.08])),()=>[.02,.018,.017,0])].map(g=>xform(g,T([0,0,0],[0,0,0],sz))))),fur));
// divisa (cintas de la ganadería)
if(o.divisa){const dv=mat({base:[1,1,1],rough:.6,sheen:.4,sheenC:[1,1,1]});const g=merge(o.divisa.map((c,i)=>paint(tube([[0,0,0],[.03*(i?1:-1),.05,-.05],[.06*(i?1:-1),.02,-.17]],5,t=>.012,()=>[...c,0]),()=>[...c,0])));
body.add(new Node(makeMesh(xform(g,T([.04*sz,.55*sz,.38*sz]))),dv))}
root.upd(null);return{root,body,neck,head,legs,tail,tl,sz,fur,cab}}
// ================= HUMANO (torero / mozo) =================
function loft(keys,seg,col,rows=24){const g=new Geo(),hint=[];const y0=keys[0][0],y1=keys[keys.length-1][0];const ch=k=>keys.map(q=>[q[0],q[k]]);
const RX=ch(1),RZ=ch(2),CZ=ch(3);for(let r=0;r<=rows;r++){const y=lerp(y0,y1,r/rows),rx=M.max(.0005,curve(y,RX)),rz=M.max(.0005,curve(y,RZ)),cz=curve(y,CZ);
for(let i=0;i<=seg;i++){const a=i/seg*TAU,x=M.cos(a)*rx,z=M.sin(a)*rz+cz;g.p.push(x,y,z);hint.push(M.cos(a),r==0?-1:r==rows?1:0,M.sin(a));g.u.push(i/seg,r/rows);if(col){const c=col(x,y,z,a);g.c.push(c[0],c[1],c[2],c[3]??0)}}}
for(let r=0;r<rows;r++)for(let i=0;i<seg;i++){const a=r*(seg+1)+i,b=a+seg+1;g.i.push(a,b,a+1,a+1,b,b+1)}
// tapas
for(const[r,s]of[[0,-1],[rows,1]]){const c=g.vc,y=lerp(y0,y1,r/rows);g.p.push(0,y,curve(y,CZ));hint.push(0,s,0);g.u.push(.5,r/rows);if(col){const q=col(0,y,curve(y,CZ),0);g.c.push(q[0],q[1],q[2],q[3]??0)}for(let i=0;i<seg;i++)g.i.push(r*(seg+1)+i,r*(seg+1)+i+1,c)}
weldNormals(g,hint);return g}
const TRAJES={'Azul y oro':{c:[.03,.06,.22],g:[1,.72,.3]},'Grana y oro':{c:[.3,.015,.03],g:[1,.72,.3]},'Verde botella y oro':{c:[.01,.09,.04],g:[1,.72,.3]},
'Tabaco y oro':{c:[.17,.08,.03],g:[1,.72,.3]},'Blanco y plata':{c:[.75,.74,.72],g:[.85,.87,.9]},'Purísima y oro':{c:[.26,.31,.48],g:[1,.72,.3]},'Negro y azabache':{c:[.012,.012,.014],g:[.08,.08,.09]}};
function buildHuman(o={}){const kind=o.kind||'torero',tr=TRAJES[o.traje||'Azul y oro'],tc=tr.c,mozo=kind=='mozo';
const white=[.82,.82,.8],skinC=o.skin||[.62,.4,.28],red=[.55,.03,.03],pink=[.82,.36,.42];
const suit=mozo?mat({base:[1,1,1],rough:.78,sheen:.35,sheenC:[.55,.55,.55],det:TX.clothN,detS:.6,duv:[7,7]}):mat({base:[1,1,1],rough:.5,sheen:.45,sheenC:V.add(V.sc(tc,1.2),[.08,.08,.08]),mode:1,alb:TX.emb,emb:.75,gold:tr.g,det:TX.embN,detS:.8,uv:[3,3],duv:[1,1]});
const skin=mat({base:skinC,rough:.55,mode:4,sheen:.12,sheenC:[.8,.6,.5]}),black=mat({base:[.012,.011,.012],rough:.5,sheen:.6,sheenC:[.25,.25,.28]}),shoes=mat({base:[.015,.015,.015],rough:.25});
const root=new Node(),hips=root.add(new Node());hips.p=[0,.93,0];
// pelvis / taleguilla
const pel=loft([[-.17,.11,.085,0],[-.09,.16,.105,0],[0,.155,.1,0],[.1,.145,.095,0]],24,(x,y,z)=>{if(mozo)return y>.02?[...red,0]:[...white,0];
if(y>.035&&y<.095)return[.5,.02,.03,0];return[...tc,M.abs(x)>.13&&M.abs(z)<.04?1:.55]});
hips.add(new Node(makeMesh(pel),suit));
const spine=hips.add(new Node());spine.p=[0,.06,0];
const tor=loft([[0,.145,.1,0],[.1,.15,.105,0],[.22,.17,.115,.01],[.32,.185,.12,.015],[.4,.19,.11,0],[.45,.16,.09,0],[.48,.06,.055,0]],32,(x,y,z)=>{
if(mozo){return[...white,0]}const fr=z>.04,ax=M.abs(x);
if(fr&&ax<.008&&y>.18)return[.01,.01,.01,0];if(fr&&ax<.035&&y>.2)return[...white,0];if(fr&&ax<.08)return[...tc,.5+.5*.55];if(fr&&ax<.105)return[...tc,1];if(y<.05)return[...tc,1];return[...tc,.5]},26);
spine.add(new Node(makeMesh(tor),suit));
if(!mozo){const hb=merge([-1,1].map(s=>xform(blob(16,10,(x,y,z)=>[x*.075,y*.035,z*.07*(1+.3*M.max(0,-y))]),T([s*.165,.445,0],[0,0,s*-.25]))));paint(hb,()=>[...tc,1]);
const fr=[];for(const s of[-1,1])for(let k=0;k<9;k++){const a=k/8*PI-PI/2;fr.push(paint(xform(lathe([[.0,.0],[.006,-.002],[.006,-.05],[.0,-.055]],5,{smooth:true}),T([s*(.165+M.cos(a)*.075),.43,M.sin(a)*.065])),()=>[...tc,1]))}
spine.add(new Node(makeMesh(merge([hb,...fr])),suit))}
const chest=spine.add(new Node());chest.p=[0,.3,0];
// cuello y cabeza
const neck=spine.add(new Node());neck.p=[0,.46,0];
neck.add(new Node(makeMesh(lathe([[0,.1],[.048,.09],[.05,0],[0,-.02]],14,{smooth:true})),skin));
if(!mozo)neck.add(new Node(makeMesh(paint(lathe([[.052,.035],[.058,.03],[.06,0],[.05,-.01]],16,{smooth:true}),()=>[...white,0])),suit));
else neck.add(new Node(makeMesh(paint(lathe([[.055,.05],[.07,.04],[.072,0],[.055,-.01]],16,{smooth:true}),()=>[...red,0])),suit));
const head=neck.add(new Node());head.p=[0,.09,0];
const hg=loft([[0,.045,.05,.0],[.04,.068,.078,.012],[.09,.077,.094,.01],[.14,.08,.1,0],[.19,.074,.094,-.005],[.225,.05,.06,-.01],[.237,.008,.01,-.01]],24,(x,y,z)=>{
const hair=(y>.17&&z<.06)||(y>.12&&z<-.06);if(hair)return[.03,.022,.018,0];
if(z>.05&&M.abs(M.abs(x)-.032)<.013&&M.abs(y-.14)<.008)return[.06,.04,.03,0];if(z>.06&&M.abs(M.abs(x)-.032)<.018&&M.abs(y-.158)<.004)return[.08,.05,.03,0];
if(z>.07&&M.abs(x)<.02&&M.abs(y-.07)<.006)return[.5,.18,.16,0];return[1,1,1,0]},20);
for(let k=0;k<hg.vc;k++){const x=hg.p[k*3],y=hg.p[k*3+1],z=hg.p[k*3+2];if(z>.06&&M.abs(x)<.022&&y>.08&&y<.15)hg.p[k*3+2]+=.018*(1-M.abs(x)/.022)*M.sin((y-.08)/.07*PI)}
weldNormals(hg);const skinHead=mat({...skin,id:++MID,base:[1,1,1]});const oc=hg.c.slice();const hgc=paint(hg,(x,y,z,k)=>{const c=[oc[k*4],oc[k*4+1],oc[k*4+2]];return c[0]==1?[...skinC,0]:[...c,0]});
head.add(new Node(makeMesh(hgc),skinHead));
head.add(new Node(makeMesh(merge([-1,1].map(e=>xform(blob(10,8,(x,y,z)=>[x*.011,y*.03,z*.02]),T([e*.079,.125,-.008],[0,e*.25,0]))))),skin));
{const eyeW=mat({base:[.86,.84,.8],rough:.12}),irisM=mat({base:[.04,.025,.015],rough:.08});const ew=merge([-1,1].map(e=>xform(blob(10,8,(x,y,z)=>[x*.0115,y*.0105,z*.009]),T([e*.031,.14,.083])))),ir=merge([-1,1].map(e=>xform(blob(8,6,(x,y,z)=>[x*.0062,y*.0062,z*.003]),T([e*.031,.14,.0915]))));head.add(new Node(makeMesh(ew),eyeW));head.add(new Node(makeMesh(ir),irisM))}
if(mozo){const hc=[[.03,.022,.016],[.06,.04,.025],[.015,.012,.01],[.11,.075,.045]][(M.random()*4)|0],vol=rnd(.9,1.12);const hair=blob(18,12,(x,y,z)=>[x*.084*vol,M.max(y,-.15)*.07*vol+.168,z*.1*vol-.01]);
 head.add(new Node(makeMesh(hair),mat({base:hc,rough:.5,sheen:.75,sheenC:[.32,.28,.22],det:TX.furN,detS:.7,duv:[5,5]})))}
if(!mozo){const mon=blob(24,16,(x,y,z)=>{const lob=M.exp(-((M.abs(x)-.8)**2+(y+.2)**2)/.12)*.35;return[x*.135*(1+lob),y*.05*(1+lob*.5)+.01,z*.11]});
head.add(new Node(makeMesh(xform(mon,T([0,.225,-.005],[-.08,0,0]))),black));head.add(new Node(makeMesh(xform(blob(10,8,(x,y,z)=>[x*.035,y*.03,z*.012]),T([0,.12,-.1]))),black))}
// brazos
const arms=[-1,1].map(s=>{const sh=chest.add(new Node());sh.p=[s*.185,.12,0];sh.q=Q.id();
const ug=lathe([[0,.04],[.06,.025],[.06,0],[.056,-.07],[.05,-.15],[.044,-.25],[.046,-.28],[.0,-.3]],20,{smooth:true});paint(ug,(x,y,z)=>mozo?[...white,0]:[...tc,.5]);sh.add(new Node(makeMesh(ug),suit));
const el=sh.add(new Node());el.p=[0,-.29,0];el.q=Q.id();
const fg=lathe([[0,.02],[.047,.01],[.047,-.05],[.043,-.12],[.034,-.21],[.036,-.24],[0,-.26]],20,{smooth:true});paint(fg,(x,y,z)=>mozo?[...white,0]:y<-.2?[...white,0]:y<-.16?[...tc,1]:[...tc,.5]);el.add(new Node(makeMesh(fg),suit));
const wr=el.add(new Node());wr.p=[0,-.26,0];{const parts=[blob(12,8,(x,y,z)=>[x*.017,y*.045-.045,z*.04*(1-.15*y)])];for(let f=0;f<4;f++){const fz=-.027+f*.018,L=.062+(f==1||f==2?.01:0)-(f==3?.012:0);parts.push(xform(lathe([[0,0],[.0095,-.004],[.0088,-L*.5],[.008,-L+.006],[0,-L]],8,{smooth:true}),T([0,-.085,fz],[0,0,s*.25])))}
 parts.push(xform(lathe([[0,0],[.011,-.005],[.0095,-.03],[0,-.05]],8,{smooth:true}),T([s*-.012,-.04,.035],[-.6,0,s*.5])));wr.add(new Node(makeMesh(merge(parts)),skin))}
return{sh,el,wr,s}});
// piernas
const legs=[-1,1].map(s=>{const th=hips.add(new Node());th.p=[s*.09,-.05,0];
const tg=lathe([[0,.05],[.085,.03],[.09,0],[.086,-.08],[.075,-.2],[.062,-.33],[.056,-.4],[.055,-.44],[0,-.46]],22,{smooth:true});paint(tg,(x,y,z)=>{if(mozo)return[...white,0];const out=x*s/M.max(.001,M.hypot(x,z));return[...tc,out>.82?1:y<-.4?1:.55]});th.add(new Node(makeMesh(tg),suit));
const kn=th.add(new Node());kn.p=[0,-.44,0];
const sg=lathe([[0,.02],[.054,.01],[.055,-.06],[.05,-.12],[.04,-.22],[.031,-.34],[.029,-.38],[.034,-.42],[0,-.44]],20,{smooth:true});paint(sg,(x,y,z)=>mozo?[...white,0]:y>-.05?[...tc,1]:[...pink,0]);kn.add(new Node(makeMesh(sg),suit));
const an=kn.add(new Node());an.p=[0,-.43,0];an.add(new Node(makeMesh(xform(blob(14,8,(x,y,z)=>[x*.042,y*.035*(y>0?1:.6),z*.115]),T([0,-.03,.045]))),mozo?mat({base:[.75,.72,.66],rough:.8}):shoes));
return{th,kn,an,s}});
// periódico enrollado (mozo)
let paper=null;if(mozo){paper=arms[1].wr.add(new Node(makeMesh(xform(lathe([[0,.2],[.02,.19],[.02,-.19],[0,-.2]],8),T([0,-.08,0],[PI/2,0,0]))),mat({base:[.75,.72,.62],rough:.9})))}
root.upd(null);return{root,hips,spine,chest,neck,head,arms,legs,kind,suit,paper}}
// IK de dos huesos (brazo). target en coordenadas de mundo
function armIK(H,arm,target,pole){const chest=arm.sh.par;const inv=m4.inv(m4.id(),chest.w);const t=m4.pt(inv,target),s=arm.sh.p,d=V.sub(t,s),L1=.29,L2=.3;
let dl=V.len(d);const dn=V.norm(d);dl=clamp(dl,.12,L1+L2-.005);const pl=V.norm(m4.dir(inv,pole||[0,-1,0]));
const ca=clamp((L1*L1+dl*dl-L2*L2)/(2*L1*dl),-1,1),a=M.acos(ca);let bn=V.sub(pl,V.sc(dn,V.dot(pl,dn)));if(V.len(bn)<1e-4)bn=V.norm(V.cross(dn,[1,0,0]));bn=V.norm(bn);
const ud=V.norm(V.add(V.sc(dn,M.cos(a)),V.sc(bn,M.sin(a))));const e=V.add(s,V.sc(ud,L1));const fd=V.norm(V.sub(V.add(s,V.sc(dn,dl)),e));
arm.sh.q=Q.fromUnit([0,-1,0],ud);const lf=Q.rot(Q.conj(arm.sh.q),fd);arm.el.q=Q.fromUnit([0,-1,0],lf)}
// ================= TELA (Verlet) =================
class Cloth{constructor(nx,ny,w,h,o={}){this.nx=nx;this.ny=ny;const n=nx*ny;this.P=new Float32Array(n*3);this.O=new Float32Array(n*3);this.pin=new Uint8Array(n);this.C=[];
for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const k=j*nx+i;this.P[k*3]=(i/(nx-1)-.5)*w;this.P[k*3+1]=1.5-j/(ny-1)*h;this.P[k*3+2]=0}this.O.set(this.P);
const add=(a,b)=>{const dx=this.P[a*3]-this.P[b*3],dy=this.P[a*3+1]-this.P[b*3+1],dz=this.P[a*3+2]-this.P[b*3+2];this.C.push(a,b,M.hypot(dx,dy,dz))};
for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const k=j*nx+i;if(i<nx-1)add(k,k+1);if(j<ny-1)add(k,k+nx);if(i<nx-1&&j<ny-1){add(k,k+nx+1);add(k+1,k+nx)}if(i<nx-2)add(k,k+2);if(j<ny-2)add(k,k+2*nx)}
const g=new Geo();for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){g.p.push(0,0,0);g.n.push(0,0,1);g.u.push(i/(nx-1)*w,j/(ny-1)*h)}
for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i;g.i.push(a,a+nx,a+1,a+1,a+nx,a+nx+1)}
if(o.col){g.c=[];for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const c=o.col(i/(nx-1),j/(ny-1));g.c.push(c[0],c[1],c[2],c[3]??0)}}
this.mesh=makeMesh(g,true);this.N=new Float32Array(n*3);this.node=new Node(this.mesh,o.mat);this.node.cast=true;this.wind=[0,0,0];this.col=[]}
place(f){for(let j=0;j<this.ny;j++)for(let i=0;i<this.nx;i++){const k=j*this.nx+i,p=f(i/(this.nx-1),j/(this.ny-1));this.P.set(p,k*3);this.O.set(p,k*3)}}
step(dt,pins){const P=this.P,O=this.O,n=this.nx*this.ny,dt2=dt*dt,dmp=.982;
for(let k=0;k<n;k++){const x=P[k*3],y=P[k*3+1],z=P[k*3+2];let vx=(x-O[k*3])*dmp,vy=(y-O[k*3+1])*dmp,vz=(z-O[k*3+2])*dmp;const vl=vx*vx+vy*vy+vz*vz;if(vl>.0025){const f=.05/M.sqrt(vl);vx*=f;vy*=f;vz*=f}O[k*3]=x;O[k*3+1]=y;O[k*3+2]=z;
P[k*3]=x+vx+this.wind[0]*dt2;P[k*3+1]=y+vy-9.8*dt2;P[k*3+2]=z+vz+this.wind[2]*dt2}
for(let it=0;it<5;it++){const C=this.C;for(let c=0;c<C.length;c+=3){const a=C[c]*3,b=C[c+1]*3,r=C[c+2];const dx=P[b]-P[a],dy=P[b+1]-P[a+1],dz=P[b+2]-P[a+2],d=M.sqrt(dx*dx+dy*dy+dz*dz)||1e-6,f=(d-r)/d*.5;
P[a]+=dx*f;P[a+1]+=dy*f;P[a+2]+=dz*f;P[b]-=dx*f;P[b+1]-=dy*f;P[b+2]-=dz*f}
for(const[k,p]of pins){P[k*3]=p[0];P[k*3+1]=p[1];P[k*3+2]=p[2]}
for(const s of this.col){for(let k=0;k<n;k++){const dx=P[k*3]-s.c[0],dy=P[k*3+1]-s.c[1],dz=P[k*3+2]-s.c[2],d=M.sqrt(dx*dx+dy*dy+dz*dz);if(d<s.r&&d>1e-5){const f=(s.r-d)/d;P[k*3]+=dx*f;P[k*3+1]+=dy*f;P[k*3+2]+=dz*f;
if(s.v){P[k*3]+=s.v[0]*dt*.5;P[k*3+1]+=s.v[1]*dt*.5;P[k*3+2]+=s.v[2]*dt*.5}}}}
for(let k=0;k<n;k++)if(P[k*3+1]<.015)P[k*3+1]=.015}}
upload(){const P=this.P,N=this.N,nx=this.nx,ny=this.ny;N.fill(0);for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx;
const e1=[P[c*3]-P[a*3],P[c*3+1]-P[a*3+1],P[c*3+2]-P[a*3+2]],e2=[P[b*3]-P[a*3],P[b*3+1]-P[a*3+1],P[b*3+2]-P[a*3+2]],f=V.cross(e1,e2);for(const k of[a,b,c,c+1]){N[k*3]+=f[0];N[k*3+1]+=f[1];N[k*3+2]+=f[2]}}
for(let k=0;k<nx*ny;k++){const l=M.hypot(N[k*3],N[k*3+1],N[k*3+2])||1;N[k*3]/=l;N[k*3+1]/=l;N[k*3+2]/=l}
gl.bindBuffer(gl.ARRAY_BUFFER,this.mesh.bp);gl.bufferSubData(gl.ARRAY_BUFFER,0,P);gl.bindBuffer(gl.ARRAY_BUFFER,this.mesh.bn);gl.bufferSubData(gl.ARRAY_BUFFER,0,N)}
center(){let x=0,y=0,z=0;const n=this.nx*this.ny;for(let k=0;k<n;k++){x+=this.P[k*3];y+=this.P[k*3+1];z+=this.P[k*3+2]}return[x/n,y/n,z/n]}}
// ================= PÚBLICO (mesh instanciada) =================
function crowdMesh(){const parts=[];const P=(g,c)=>parts.push(paint(g,()=>[1,1,1,c]));
P(loft([[.08,.14,.1,0],[.25,.16,.11,0],[.42,.17,.1,0],[.5,.08,.06,0]],8,null,4),0);
P(xform(blob(8,6,(x,y,z)=>[x*.085,y*.105,z*.095]),T([0,.62,0])),.25);
P(xform(blob(8,4,(x,y,z)=>[x*.09,M.max(y,-.1)*.06,z*.1]),T([0,.69,-.01])),.5);
for(const s of[-1,1])P(xform(lathe([[0,0],[.045,-.01],[.04,-.3],[0,-.34]],5,{smooth:true}),T([s*.17,.47,0])),.75);
const pq=new Geo();pq.p=[.17,.1,0,.28,.1,0,.28,-.1,0,.17,-.1,0];pq.n=[0,0,1,0,0,1,0,0,1,0,0,1];pq.u=[0,0,1,0,1,1,0,1];pq.i=[0,1,2,0,2,3,0,2,1,0,3,2];P(xform(pq,T([.02,-.12,0])),1);
return merge(parts)}
// ================= PLAZA DE TOROS =================
const PLZ={R:30,barH:1.6,cal:31.9};
function buildPlaza(scene,q){const g=new Node();scene.add(g);const R=PLZ.R;
const ruedo=mat({base:[1,1,1],rough:.95,alb:TX.arenaA,det:TX.arenaN,uv:[.4,.4],detS:1.2,mode:2});
const floor=new Node(makeMesh(disc(R+.05,40,160)),ruedo);floor.cast=false;g.add(floor);
const wood=mat({base:[1,1,1],rough:.55,alb:TX.woodA,det:TX.woodN,uv:[.5,.6],detS:1});
const bar=lathe([[R,0],[R,PLZ.barH],[R+.14,PLZ.barH],[R+.14,0]],256,{uScale:1});g.add(new Node(makeMesh(bar),wood));
const step=lathe([[R-.001,.38],[R-.12,.38],[R-.12,.44],[R-.001,.44]],256);g.add(new Node(makeMesh(step),wood));
const stone=mat({base:[1,1,1],rough:.92,alb:TX.stoneA,det:TX.stoneN,uv:[.35,.35],detS:.8});
// callejón + tendidos + gradas (perfil hacia fuera y arriba)
const pr=[[R+.14,0],[PLZ.cal,0],[PLZ.cal,2.2],[PLZ.cal+.5,2.2]];let r=PLZ.cal+.5,y=2.2;const rowsT=22;PLZ.rows=[];
for(let k=0;k<rowsT;k++){pr.push([r,y+.42]);y+=.42;PLZ.rows.push([r+.12,y]);pr.push([r+.85,y]);r+=.85;if(k==11){pr.push([r,y+.15]);y+=.15;pr.push([r+1.1,y]);r+=1.1}}
const gradR=r;pr.push([r,y+1.1]);y+=1.1;pr.push([r+.4,y]);r+=.4;const gy=y;
for(let k=0;k<6;k++){pr.push([r,y+.5]);y+=.5;PLZ.rows.push([r+.12,y]);pr.push([r+.8,y]);r+=.8}pr.push([r,y+4.4]);
const stands=lathe(pr,192,{uScale:1});g.add(new Node(makeMesh(stands),stone));PLZ.outR=r+.3;PLZ.roofY=y+4.4;
// techo de gradas
const roof=lathe([[r+.6,y+4.9],[gradR+.2,y+4.4],[gradR+.2,y+4.15],[r+.6,y+4.6]],256,{flip:true});const roofM=mat({base:[.5,.2,.12],rough:.8});g.add(new Node(makeMesh(roof),roofM));
// columnas y friso de las gradas
const colG=lathe([[.0,y+4.2-gy+.1],[.2,y+4.2-gy],[.17,3.7],[.17,.35],[.24,.2],[.24,0],[0,0]],10);const cols=makeMesh(colG);const nc=96;addInst(cols,nc);
for(let i=0;i<nc;i++){const a=i/nc*TAU;setInst(cols,i,T([M.cos(a)*(gradR+.25),gy,M.sin(a)*(gradR+.25)]),[1,1,1,0])}instUpload(cols);g.add(new Node(cols,stone));
const brick=mat({base:[1,1,1],rough:.85,alb:TX.brickA,det:TX.brickN,uv:[.5,.5],detS:1});
g.add(new Node(makeMesh(lathe([[gradR+.05,y+3.4],[gradR+.05,y+4.2],[gradR+.45,y+4.2],[gradR+.45,y+3.4]],256)),brick));
// fachada exterior
g.add(new Node(makeMesh(lathe([[PLZ.outR,y+5],[PLZ.outR,-.5]].reverse().map(p=>p),256,{flip:true})),brick));
g.add(new Node(makeMesh(lathe([[PLZ.outR-.3,y+5.3],[PLZ.outR+.5,y+5.3],[PLZ.outR+.5,y+4.6]],256,{flip:false})),stone));
// burladeros
const bg=box(2,1.6,.12),bmesh=makeMesh(bg);PLZ.burl=[];for(const a of[PI*.25,PI*.75,PI*1.25,PI*1.75]){const n=new Node(bmesh,wood);n.p=[M.cos(a)*(R-.9),.8,M.sin(a)*(R-.9)];n.r=[0,-a+PI/2,0];g.add(n);PLZ.burl.push([M.cos(a)*(R-.55),0,M.sin(a)*(R-.55),a])}
// toriles y puerta grande
const doorM=mat({base:[.09,.03,.02],rough:.7,alb:TX.woodA,uv:[.5,.6]});const dg=makeMesh(box(2.6,1.62,.1));
for(const[a,nm]of[[PI/2,'toriles'],[-PI/2,'grande']]){const n=new Node(dg,doorM);n.p=[M.cos(a)*(R-.06),.81,M.sin(a)*(R-.06)];n.r=[0,-a+PI/2,0];g.add(n)}
PLZ.toriles=[0,0,R-1];
// palco presidencial con colgadura
const palA=PI*1.0,pr2=PLZ.rows[16];const pal=new Node();pal.p=[M.cos(palA)*(pr2[0]-.6),pr2[1]+.3,M.sin(palA)*(pr2[0]-.6)];pal.r=[0,-palA-PI/2,0];g.add(pal);
pal.add(new Node(makeMesh(box(5,.25,1.6)),stone));const cg=mat({base:[.42,.02,.03],rough:.7,sheen:.6,sheenC:[.8,.2,.2]});
const colg=plane(4.6,1.2,10,6);pal.add(new Node(makeMesh(paint(xform(colg,T([0,-.75,.82],[PI/2,0,0])),(x,y,z)=>[1,1,1,y<-1.25?1:0])),cg));
// banderas en la cubierta
const flagM=mat({base:[1,1,1],rough:.7,anim:2,sheen:.3,sheenC:[1,1,1]}),poleM=mat({base:[.7,.7,.7],rough:.3,metal:1});
const fg=plane(1.6,1.0,12,8);for(let k=0;k<fg.vc;k++){const x=fg.p[k*3],z=fg.p[k*3+2];fg.p[k*3]=0;fg.p[k*3+1]=-z;fg.p[k*3+2]=x+.8;fg.n[k*3]=1;fg.n[k*3+1]=0;fg.n[k*3+2]=0;fg.u[k*2]=(x+.8)/1.6;fg.u[k*2+1]=z}
paint(fg,(x,y,z)=>{const v=-y;return(v<-.17||v>.17)?[.55,.02,.02,0]:[.9,.62,.02,0]});const fmesh=makeMesh(fg),pmesh=makeMesh(lathe([[.04,3],[.04,0]],6,{flip:true}));
for(let k=0;k<8;k++){const a=k/8*TAU+.2,p=new Node(pmesh,poleM);p.p=[M.cos(a)*(PLZ.outR-.2),PLZ.roofY+.6,M.sin(a)*(PLZ.outR-.2)];g.add(p);const f=new Node(fmesh,flagM);f.p=[0,2.5,0];f.r=[0,rnd(0,TAU),0];f.cast=false;p.add(f)}
// público
const cm=makeMesh(crowdMesh());const pal8=[[.8,.8,.78],[.12,.2,.45],[.55,.06,.05],[.85,.7,.25],[.1,.1,.1],[.3,.45,.65],[.75,.35,.45],[.25,.4,.22],[.9,.88,.86],[.55,.42,.3]];
const seats=[];for(const[rr,yy]of PLZ.rows){const n=M.floor(TAU*rr/.62);for(let i=0;i<n;i++){const a=(i+(yy*7)%1)/n*TAU;if(M.abs(angDiff(a,palA))<.06&&yy>8)continue;seats.push([a,rr,yy])}}
const dens=q.crowd;const chosen=seats.filter(()=>M.random()<dens);addInst(cm,chosen.length);
chosen.forEach((s,i)=>{const[a,rr,yy]=s,j=rnd(-.05,.05);setInst(cm,i,T([M.cos(a)*(rr+.12),yy+.02,M.sin(a)*(rr+.12)],[0,-a-PI/2+j,0],rnd(.92,1.06)),[...pal8[(M.random()*pal8.length)|0],M.random()])});instUpload(cm);
const crowd=new Node(cm,mat({base:[1,1,1],rough:.8,anim:1,sheen:.2,sheenC:[.5,.5,.5]}));crowd.cast=false;g.add(crowd);
// suelo exterior
const out=new Node(makeMesh(disc(400,6,64)),mat({base:[.35,.3,.24],rough:1}));out.p=[0,-.5,0];out.cast=false;g.add(out);
return g}
// rastro del ruedo (canvas 1024 = 64 m)
const TRK={S:1024,W:64};
function trackInit(){const c=cnv(TRK.S),x=c.getContext('2d');TRK.c=c;TRK.x=x;x.fillStyle='#000';x.fillRect(0,0,TRK.S,TRK.S);const k=TRK.S/TRK.W,cx=TRK.S/2;
x.globalCompositeOperation='lighter';
for(let i=0;i<40;i++){const a=rnd(0,TAU),r=rnd(3,26),s=rnd(2,6)*k;const g=x.createRadialGradient(cx+M.cos(a)*r*k,cx+M.sin(a)*r*k,0,cx+M.cos(a)*r*k,cx+M.sin(a)*r*k,s);g.addColorStop(0,'rgba(0,70,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,TRK.S,TRK.S)}
x.lineWidth=.12*k;x.strokeStyle='rgba(0,0,255,.9)';for(const r of[PLZ.R-7,PLZ.R-9]){x.beginPath();x.arc(cx,cx,r*k,0,TAU);x.stroke()}
x.lineWidth=.06*k;x.strokeStyle='rgba(14,0,0,1)';for(let r=2;r<PLZ.R;r+=.55){x.beginPath();x.arc(cx,cx,r*k,rnd(0,TAU),rnd(0,TAU)+rnd(2,5));x.stroke()}
if(R.trkTex)texUpd(R.trkTex,c);else R.trkTex=texC(c,{srgb:false,rep:false});R.trk=[0,0,TRK.W,0];TRK.dirty=0}
function stamp(x,z,r,amt,ch='r'){if(TRK.off)return;const k=TRK.S/TRK.W,px=TRK.S/2+x*k,pz=TRK.S/2+z*k,X=TRK.x;const col=ch=='r'?`rgba(${amt|0},0,0,1)`:`rgba(0,${amt|0},0,1)`;
const g=X.createRadialGradient(px,pz,0,px,pz,r*k);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=g;X.fillRect(px-r*k,pz-r*k,r*k*2,r*k*2);TRK.dirty=1}
