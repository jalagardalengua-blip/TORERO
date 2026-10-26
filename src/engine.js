// ================= MOTOR =================
'use strict';
const M=Math,PI=M.PI,TAU=PI*2;
const clamp=(x,a,b)=>x<a?a:x>b?b:x,lerp=(a,b,t)=>a+(b-a)*t;
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const rnd=(a=0,b=1)=>a+M.random()*(b-a);
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>PI)d-=TAU;if(d<-PI)d+=TAU;return d};
function mulberry(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=M.imul(s^s>>>15,1|s);t=t+M.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
// --- Ruido Perlin 3D ---
const NP=new Uint8Array(512);{const r=mulberry(11),p=[...Array(256).keys()];for(let i=255;i>0;i--){const j=(r()*(i+1))|0;const t=p[i];p[i]=p[j];p[j]=t}for(let i=0;i<512;i++)NP[i]=p[i&255]}
function _f(t){return t*t*t*(t*(t*6-15)+10)}
function _g(h,x,y,z){const u=h<8?x:y,v=h<4?y:(h==12||h==14?x:z);return((h&1)?-u:u)+((h&2)?-v:v)}
function noise3(x,y,z){const X=M.floor(x)&255,Y=M.floor(y)&255,Z=M.floor(z)&255;x-=M.floor(x);y-=M.floor(y);z-=M.floor(z);const u=_f(x),v=_f(y),w=_f(z);
const A=NP[X]+Y,AA=NP[A]+Z,AB=NP[A+1]+Z,B=NP[X+1]+Y,BA=NP[B]+Z,BB=NP[B+1]+Z;
return lerp(lerp(lerp(_g(NP[AA]&15,x,y,z),_g(NP[BA]&15,x-1,y,z),u),lerp(_g(NP[AB]&15,x,y-1,z),_g(NP[BB]&15,x-1,y-1,z),u),v),
lerp(lerp(_g(NP[AA+1]&15,x,y,z-1),_g(NP[BA+1]&15,x-1,y,z-1),u),lerp(_g(NP[AB+1]&15,x,y-1,z-1),_g(NP[BB+1]&15,x-1,y-1,z-1),u),v),w)}
function fbm3(x,y,z,o=4){let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*noise3(x*f,y*f,z*f);f*=2.03;a*=.5}return s}
// curva suave por tramos: pts=[[x,y],...]
function curve(x,pts){if(x<=pts[0][0])return pts[0][1];for(let i=1;i<pts.length;i++){if(x<=pts[i][0]){const a=pts[i-1],b=pts[i],t=(x-a[0])/(b[0]-a[0]);return lerp(a[1],b[1],t*t*(3-2*t))}}return pts[pts.length-1][1]}
// --- Vectores ---
const V={add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],sc:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],
dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
len:a=>M.hypot(a[0],a[1],a[2]),norm:a=>{const l=M.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]},
lerp:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],madd:(a,b,s)=>[a[0]+b[0]*s,a[1]+b[1]*s,a[2]+b[2]*s],
d2:(a,b)=>M.hypot(a[0]-b[0],a[2]-b[2])};
// --- Cuaterniones [x,y,z,w] ---
const Q={id:()=>[0,0,0,1],
mul:(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]],
axis:(ax,an)=>{const s=M.sin(an/2);return[ax[0]*s,ax[1]*s,ax[2]*s,M.cos(an/2)]},
norm:q=>{const l=M.hypot(q[0],q[1],q[2],q[3])||1;return[q[0]/l,q[1]/l,q[2]/l,q[3]/l]},
conj:q=>[-q[0],-q[1],-q[2],q[3]],
rot:(q,v)=>{const x=q[0],y=q[1],z=q[2],w=q[3],ix=w*v[0]+y*v[2]-z*v[1],iy=w*v[1]+z*v[0]-x*v[2],iz=w*v[2]+x*v[1]-y*v[0],iw=-x*v[0]-y*v[1]-z*v[2];
return[ix*w+iw*-x+iy*-z-iz*-y,iy*w+iw*-y+iz*-x-ix*-z,iz*w+iw*-z+ix*-y-iy*-x]},
fromUnit:(a,b)=>{const d=V.dot(a,b);if(d<-.999999){let ax=V.cross([1,0,0],a);if(V.len(ax)<1e-6)ax=V.cross([0,0,1],a);return Q.axis(V.norm(ax),PI)}const c=V.cross(a,b);return Q.norm([c[0],c[1],c[2],1+d])},
euler:(x,y,z)=>Q.mul(Q.mul(Q.axis([0,1,0],y),Q.axis([1,0,0],x)),Q.axis([0,0,1],z))};
// --- Matrices 4x4 (columna mayor) ---
const m4={id(){const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m},
mul(o,a,b){const r=m4._t;for(let c=0;c<4;c++)for(let w=0;w<4;w++)r[c*4+w]=a[w]*b[c*4]+a[4+w]*b[c*4+1]+a[8+w]*b[c*4+2]+a[12+w]*b[c*4+3];o.set(r);return o},
persp(o,fy,as,n,f){const t=1/M.tan(fy/2);o.fill(0);o[0]=t/as;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o},
ortho(o,l,r,b,t,n,f){o.fill(0);o[0]=2/(r-l);o[5]=2/(t-b);o[10]=-2/(f-n);o[12]=-(r+l)/(r-l);o[13]=-(t+b)/(t-b);o[14]=-(f+n)/(f-n);o[15]=1;return o},
look(o,e,c,u){const z=V.norm(V.sub(e,c)),x=V.norm(V.cross(u,z)),y=V.cross(z,x);
o[0]=x[0];o[1]=y[0];o[2]=z[0];o[3]=0;o[4]=x[1];o[5]=y[1];o[6]=z[1];o[7]=0;o[8]=x[2];o[9]=y[2];o[10]=z[2];o[11]=0;o[12]=-V.dot(x,e);o[13]=-V.dot(y,e);o[14]=-V.dot(z,e);o[15]=1;return o},
inv(o,a){const a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15],
b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
let d=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!d)return o;d=1/d;
o[0]=(a11*b11-a12*b10+a13*b09)*d;o[1]=(a02*b10-a01*b11-a03*b09)*d;o[2]=(a31*b05-a32*b04+a33*b03)*d;o[3]=(a22*b04-a21*b05-a23*b03)*d;
o[4]=(a12*b08-a10*b11-a13*b07)*d;o[5]=(a00*b11-a02*b08+a03*b07)*d;o[6]=(a32*b02-a30*b05-a33*b01)*d;o[7]=(a20*b05-a22*b02+a23*b01)*d;
o[8]=(a10*b10-a11*b08+a13*b06)*d;o[9]=(a01*b08-a00*b10-a03*b06)*d;o[10]=(a30*b04-a31*b02+a33*b00)*d;o[11]=(a21*b02-a20*b04-a23*b00)*d;
o[12]=(a11*b07-a10*b09-a12*b06)*d;o[13]=(a00*b09-a01*b07+a02*b06)*d;o[14]=(a31*b01-a30*b03-a32*b00)*d;o[15]=(a20*b03-a21*b01+a22*b00)*d;return o},
trsE(o,p,e,s){const cx=M.cos(e[0]),sx=M.sin(e[0]),cy=M.cos(e[1]),sy=M.sin(e[1]),cz=M.cos(e[2]),sz=M.sin(e[2]);
o[0]=(cy*cz+sy*sx*sz)*s;o[1]=cx*sz*s;o[2]=(-sy*cz+cy*sx*sz)*s;o[3]=0;
o[4]=(-cy*sz+sy*sx*cz)*s;o[5]=cx*cz*s;o[6]=(sy*sz+cy*sx*cz)*s;o[7]=0;
o[8]=sy*cx*s;o[9]=-sx*s;o[10]=cy*cx*s;o[11]=0;o[12]=p[0];o[13]=p[1];o[14]=p[2];o[15]=1;return o},
trsQ(o,p,q,s){const x=q[0],y=q[1],z=q[2],w=q[3],x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
o[0]=(1-(yy+zz))*s;o[1]=(xy+wz)*s;o[2]=(xz-wy)*s;o[3]=0;o[4]=(xy-wz)*s;o[5]=(1-(xx+zz))*s;o[6]=(yz+wx)*s;o[7]=0;
o[8]=(xz+wy)*s;o[9]=(yz-wx)*s;o[10]=(1-(xx+yy))*s;o[11]=0;o[12]=p[0];o[13]=p[1];o[14]=p[2];o[15]=1;return o},
pt:(m,v)=>[m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12],m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]],
dir:(m,v)=>[m[0]*v[0]+m[4]*v[1]+m[8]*v[2],m[1]*v[0]+m[5]*v[1]+m[9]*v[2],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]],
quat(m){const s=M.hypot(m[0],m[1],m[2])||1,a=m[0]/s,b=m[4]/s,c=m[8]/s,d=m[1]/s,e=m[5]/s,f=m[9]/s,g=m[2]/s,h=m[6]/s,i=m[10]/s,t=a+e+i;let q;
if(t>0){const S=M.sqrt(t+1)*2;q=[(h-f)/S,(c-g)/S,(d-b)/S,.25*S]}else if(a>e&&a>i){const S=M.sqrt(1+a-e-i)*2;q=[.25*S,(b+d)/S,(c+g)/S,(h-f)/S]}else if(e>i){const S=M.sqrt(1+e-a-i)*2;q=[(b+d)/S,.25*S,(f+h)/S,(c-g)/S]}else{const S=M.sqrt(1+i-a-e)*2;q=[(c+g)/S,(f+h)/S,.25*S,(d-b)/S]}return Q.norm(q)},
_t:new Float32Array(16)};
// --- Nodos de escena ---
class Node{constructor(mesh,mat){this.p=[0,0,0];this.r=[0,0,0];this.q=null;this.s=1;this.ch=[];this.mesh=mesh||null;this.mat=mat||null;this.l=m4.id();this.w=m4.id();this.vis=true;this.cast=true}
add(n){this.ch.push(n);n.par=this;return n}
upd(pw){if(this.q)m4.trsQ(this.l,this.p,this.q,this.s);else m4.trsE(this.l,this.p,this.r,this.s);if(pw)m4.mul(this.w,pw,this.l);else this.w.set(this.l);for(const c of this.ch)c.upd(this.w)}
collect(L){if(!this.vis)return;if(this.mesh){if(!this.mat){console.warn('nodo sin material');this.mat=R.miss||(R.miss=mat({base:[1,0,1]}))}L.push(this)}for(const c of this.ch)c.collect(L)}
wpos(){return[this.w[12],this.w[13],this.w[14]]}}
// --- Geometría ---
class Geo{constructor(){this.p=[];this.n=[];this.u=[];this.c=[];this.i=[]}get vc(){return this.p.length/3}}
function weldNormals(g,hint){const vc=g.vc,ac=new Float32Array(vc*3);
// orientar triángulos con la normal guía
if(hint)for(let t=0;t<g.i.length;t+=3){const a=g.i[t],b=g.i[t+1],c=g.i[t+2],P=g.p;
const e1=[P[b*3]-P[a*3],P[b*3+1]-P[a*3+1],P[b*3+2]-P[a*3+2]],e2=[P[c*3]-P[a*3],P[c*3+1]-P[a*3+1],P[c*3+2]-P[a*3+2]],fn=V.cross(e1,e2);
const h=[hint[a*3]+hint[b*3]+hint[c*3],hint[a*3+1]+hint[b*3+1]+hint[c*3+1],hint[a*3+2]+hint[b*3+2]+hint[c*3+2]];if(V.dot(fn,h)<0){g.i[t+1]=c;g.i[t+2]=b}}
for(let t=0;t<g.i.length;t+=3){const a=g.i[t],b=g.i[t+1],c=g.i[t+2],P=g.p;
const e1=[P[b*3]-P[a*3],P[b*3+1]-P[a*3+1],P[b*3+2]-P[a*3+2]],e2=[P[c*3]-P[a*3],P[c*3+1]-P[a*3+1],P[c*3+2]-P[a*3+2]],fn=V.cross(e1,e2);
for(const k of[a,b,c]){ac[k*3]+=fn[0];ac[k*3+1]+=fn[1];ac[k*3+2]+=fn[2]}}
const map=new Map(),key=k=>(M.round(g.p[k*3]*2e4))+','+(M.round(g.p[k*3+1]*2e4))+','+(M.round(g.p[k*3+2]*2e4));
for(let k=0;k<vc;k++){const s=key(k);let e=map.get(s);if(!e){e=[0,0,0,[]];map.set(s,e)}e[0]+=ac[k*3];e[1]+=ac[k*3+1];e[2]+=ac[k*3+2];e[3].push(k)}
g.n=new Array(vc*3);for(const e of map.values()){const n=V.norm(e);for(const k of e[3]){g.n[k*3]=n[0];g.n[k*3+1]=n[1];g.n[k*3+2]=n[2]}}return g}
function fixWinding(g){const P=g.p,N=g.n;for(let t=0;t<g.i.length;t+=3){const a=g.i[t],b=g.i[t+1],c=g.i[t+2];
const e1=[P[b*3]-P[a*3],P[b*3+1]-P[a*3+1],P[b*3+2]-P[a*3+2]],e2=[P[c*3]-P[a*3],P[c*3+1]-P[a*3+1],P[c*3+2]-P[a*3+2]],fn=V.cross(e1,e2);
if(fn[0]*(N[a*3]+N[b*3]+N[c*3])+fn[1]*(N[a*3+1]+N[b*3+1]+N[c*3+1])+fn[2]*(N[a*3+2]+N[b*3+2]+N[c*3+2])<0){g.i[t+1]=c;g.i[t+2]=b}}return g}
// esfera deformable (eje largo = z). fn(x,y,z)->[x,y,z]; col(P,u)->[r,g,b,a]
function blob(ws,hs,fn,col){const g=new Geo(),hint=[];for(let j=0;j<=hs;j++){const th=j/hs*PI;for(let i=0;i<=ws;i++){const ph=i/ws*TAU,u=[M.sin(th)*M.cos(ph),M.sin(th)*M.sin(ph),M.cos(th)],P=fn?fn(u[0],u[1],u[2]):u;
g.p.push(P[0],P[1],P[2]);hint.push(u[0],u[1],u[2]);g.u.push(i/ws,j/hs);if(col){const c=col(P,u);g.c.push(c[0],c[1],c[2],c[3]??0)}}}
for(let j=0;j<hs;j++)for(let i=0;i<ws;i++){const a=j*(ws+1)+i,b=a+ws+1;if(j>0)g.i.push(a,b,a+1);if(j<hs-1)g.i.push(a+1,b,b+1)}
weldNormals(g,hint);return g}
// torno: prof=[[r,y],...], recorrido hacia fuera/arriba; normal=(-dy,dr). smooth = normales suavizadas
function lathe(prof,seg,{smooth=false,uScale=1,col=null,a0=0,a1=TAU,flip=false}={}){const g=new Geo();
const pr=[];for(let k=0;k<prof.length-1;k++){const a=prof[k],b=prof[k+1],dr=b[0]-a[0],dy=b[1]-a[1],l=M.hypot(dr,dy)||1;pr.push([-dy/l,dr/l,l])}
const rows=[];let vlen=0;
if(smooth){for(let k=0;k<prof.length;k++){const n0=pr[M.max(0,k-1)],n1=pr[M.min(pr.length-1,k)];const n=[(n0[0]+n1[0])/2,(n0[1]+n1[1])/2];const l=M.hypot(n[0],n[1])||1;rows.push([prof[k],[n[0]/l,n[1]/l],vlen]);if(k<pr.length)vlen+=pr[k][2]}}
else{for(let k=0;k<pr.length;k++){rows.push([prof[k],pr[k],vlen],[prof[k+1],pr[k],vlen+pr[k][2]]);vlen+=pr[k][2]}}
const step=smooth?1:2;
for(let r=0;r<rows.length;r++){const[[R,Y],[nr,ny],vv]=rows[r];for(let i=0;i<=seg;i++){const ph=a0+(a1-a0)*i/seg,c=M.cos(ph),s=M.sin(ph);
g.p.push(R*c,Y,R*s);const f=flip?-1:1;g.n.push(nr*c*f,ny*f,nr*s*f);g.u.push((a1-a0)*i/seg*uScale*M.max(R,.001)/(uScale>0?1:1),vv);if(col){const q=col(R*c,Y,R*s,ph,vv);g.c.push(q[0],q[1],q[2],q[3]??0)}}}
const W=seg+1;for(let r=0;r<rows.length-1;r+=step){const a=r*W,b=(r+1)*W;for(let i=0;i<seg;i++)g.i.push(a+i,b+i,a+i+1,a+i+1,b+i,b+i+1)}
return fixWinding(g)}
// tubo por curva: pts = array de [x,y,z]; rad(t)
function tube(pts,rs,rad,col){const g=new Geo(),n=pts.length;let T0=V.norm(V.sub(pts[1],pts[0]));let Nn=M.abs(T0[1])<.9?V.norm(V.cross(T0,[0,1,0])):V.norm(V.cross(T0,[1,0,0]));
for(let k=0;k<n;k++){const T=V.norm(V.sub(pts[M.min(n-1,k+1)],pts[M.max(0,k-1)]));const B=V.norm(V.cross(T,Nn));Nn=V.norm(V.cross(B,T));const t=k/(n-1),r=rad(t);
for(let i=0;i<=rs;i++){const a=i/rs*TAU,dx=V.add(V.sc(Nn,M.cos(a)),V.sc(B,M.sin(a)));g.p.push(pts[k][0]+dx[0]*r,pts[k][1]+dx[1]*r,pts[k][2]+dx[2]*r);g.n.push(dx[0],dx[1],dx[2]);g.u.push(i/rs,t);if(col){const c=col(t,a);g.c.push(c[0],c[1],c[2],c[3]??0)}}}
const W=rs+1;for(let k=0;k<n-1;k++)for(let i=0;i<rs;i++){const a=k*W+i,b=a+W;g.i.push(a,b,a+1,a+1,b,b+1)}
// tapa final
const e=pts[n-1],ci=g.vc;g.p.push(e[0],e[1],e[2]);const te=V.norm(V.sub(pts[n-1],pts[n-2]));g.n.push(te[0],te[1],te[2]);g.u.push(.5,1);if(col){const c=col(1,0);g.c.push(c[0],c[1],c[2],c[3]??0)}
for(let i=0;i<rs;i++)g.i.push((n-1)*W+i,(n-1)*W+i+1,ci);
return fixWinding(g)}
function box(w,h,d,col){const g=new Geo(),x=w/2,y=h/2,z=d/2;
const F=[[[1,0,0],[[x,-y,-z],[x,y,-z],[x,y,z],[x,-y,z]]],[[-1,0,0],[[-x,-y,z],[-x,y,z],[-x,y,-z],[-x,-y,-z]]],[[0,1,0],[[-x,y,-z],[-x,y,z],[x,y,z],[x,y,-z]]],[[0,-1,0],[[-x,-y,z],[-x,-y,-z],[x,-y,-z],[x,-y,z]]],[[0,0,1],[[x,-y,z],[x,y,z],[-x,y,z],[-x,-y,z]]],[[0,0,-1],[[-x,-y,-z],[-x,y,-z],[x,y,-z],[x,-y,-z]]]];
for(const[n,vs]of F){const b=g.vc;vs.forEach((v,k)=>{g.p.push(...v);g.n.push(...n);const ax=n[0]?[v[2],v[1]]:n[1]?[v[0],v[2]]:[v[0],v[1]];g.u.push(ax[0],ax[1]);if(col){const c=col(v,n);g.c.push(c[0],c[1],c[2],c[3]??0)}});g.i.push(b,b+1,b+2,b,b+2,b+3)}
return fixWinding(g)}
function plane(w,d,nx,nz,fn){const g=new Geo();for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=(i/nx-.5)*w,z=(j/nz-.5)*d,y=fn?fn(x,z):0;g.p.push(x,y,z);g.n.push(0,1,0);g.u.push(x,z)}
for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;g.i.push(a,b,a+1,a+1,b,b+1)}return fixWinding(g)}
function disc(R,rings,seg){const g=new Geo();g.p.push(0,0,0);g.n.push(0,1,0);g.u.push(0,0);for(let r=1;r<=rings;r++){const rr=R*r/rings;for(let i=0;i<seg;i++){const a=i/seg*TAU,x=M.cos(a)*rr,z=M.sin(a)*rr;g.p.push(x,0,z);g.n.push(0,1,0);g.u.push(x,z)}}
for(let i=0;i<seg;i++)g.i.push(0,1+i,1+(i+1)%seg);for(let r=1;r<rings;r++){const a=1+(r-1)*seg,b=1+r*seg;for(let i=0;i<seg;i++){const j=(i+1)%seg;g.i.push(a+i,b+i,a+j,a+j,b+i,b+j)}}return fixWinding(g)}
function xform(g,m){const o=new Geo();for(let k=0;k<g.vc;k++){const p=m4.pt(m,[g.p[k*3],g.p[k*3+1],g.p[k*3+2]]),n=V.norm(m4.dir(m,[g.n[k*3],g.n[k*3+1],g.n[k*3+2]]));o.p.push(...p);o.n.push(...n)}o.u=g.u.slice();o.c=g.c.slice();o.i=g.i.slice();return o}
const T=(p,e=[0,0,0],s=1)=>m4.trsE(m4.id(),p,e,s);
function merge(list){const o=new Geo(),anyC=list.some(g=>g.c.length);for(const g of list){const b=o.vc;o.p.push(...g.p);o.n.push(...g.n);o.u.push(...(g.u.length?g.u:new Array(g.vc*2).fill(0)));
if(anyC){if(g.c.length)o.c.push(...g.c);else for(let k=0;k<g.vc;k++)o.c.push(1,1,1,0)}for(const i of g.i)o.i.push(i+b)}return o}
function paint(g,f){g.c=[];for(let k=0;k<g.vc;k++){const c=f(g.p[k*3],g.p[k*3+1],g.p[k*3+2],k);g.c.push(c[0],c[1],c[2],c[3]??0)}return g}
// ================= WEBGL =================
const CV=document.getElementById('gl');
const gl=CV.getContext('webgl2',{antialias:false,alpha:false,depth:true,stencil:false,powerPreference:'high-performance'});
const EXT_F=gl&&gl.getExtension('EXT_color_buffer_float');gl&&gl.getExtension('OES_texture_float_linear');
const ANI=gl&&(gl.getExtension('EXT_texture_filter_anisotropic'));
const HDR=!!EXT_F;
function sh(src,type){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(s);console.error(e,src.split('\n').map((l,i)=>(i+1)+': '+l).join('\n'));throw new Error('shader: '+e)}return s}
function prog(vs,fs){const p=gl.createProgram();gl.attachShader(p,sh(vs,gl.VERTEX_SHADER));gl.attachShader(p,sh(fs,gl.FRAGMENT_SHADER));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error('link: '+gl.getProgramInfoLog(p));p.u={};
const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i),nm=a.name.replace('[0]','');p.u[nm]=gl.getUniformLocation(p,a.name)}return p}
function makeMesh(g,dyn=false){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const m={vao,count:g.i.length,dyn};
const mk=(loc,data,sz)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data instanceof Float32Array?data:new Float32Array(data),dyn?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,sz,gl.FLOAT,false,0,0);return b};
m.bp=mk(0,g.p,3);m.bn=mk(1,g.n,3);m.bu=mk(2,g.u.length?g.u:new Float32Array(g.vc*2),2);if(g.c.length)m.bc=mk(3,g.c,4);
const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(g.i),gl.STATIC_DRAW);gl.bindVertexArray(null);return m}
function addInst(m,n){gl.bindVertexArray(m.vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,n*80,gl.DYNAMIC_DRAW);
for(let k=0;k<5;k++){gl.enableVertexAttribArray(4+k);gl.vertexAttribPointer(4+k,4,gl.FLOAT,false,80,k*16);gl.vertexAttribDivisor(4+k,1)}gl.bindVertexArray(null);m.ib=b;m.icap=n;m.icount=n;m.idata=new Float32Array(n*20);return m}
function instUpload(m){gl.bindBuffer(gl.ARRAY_BUFFER,m.ib);gl.bufferSubData(gl.ARRAY_BUFFER,0,m.idata,0,m.icount*20)}
function setInst(m,k,mat,c){m.idata.set(mat,k*20);m.idata[k*20+16]=c[0];m.idata[k*20+17]=c[1];m.idata[k*20+18]=c[2];m.idata[k*20+19]=c[3]??0}
function texC(c,{srgb=true,rep=true,mip=true}={}){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,srgb?gl.SRGB8_ALPHA8:gl.RGBA8,gl.RGBA,gl.UNSIGNED_BYTE,c);
const w=rep?gl.REPEAT:gl.CLAMP_TO_EDGE;gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,w);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,w);
if(mip){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR)}else gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);if(ANI&&mip)gl.texParameterf(gl.TEXTURE_2D,ANI.TEXTURE_MAX_ANISOTROPY_EXT,8);return t}
function texUpd(t,c,mip=true){gl.bindTexture(gl.TEXTURE_2D,t);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,c);if(mip)gl.generateMipmap(gl.TEXTURE_2D)}
function tex1(r,g,b,a=255){const c=document.createElement('canvas');c.width=c.height=2;const x=c.getContext('2d');x.fillStyle=`rgba(${r},${g},${b},${a/255})`;x.fillRect(0,0,2,2);return texC(c,{srgb:false,mip:false})}
// ---------- Shaders ----------
const SKYFN=`
uniform vec3 uSun,uSunC,uSkyT,uSkyH,uGnd;
vec3 skyCol(vec3 d){d=normalize(d);float h=d.y,sd=max(dot(d,uSun),0.);vec3 c;
if(h>=0.)c=mix(uSkyH,uSkyT,pow(h,.38));else c=mix(uSkyH*.85,uGnd*.7,smoothstep(0.,.3,-h));
c+=uSunC*(.03*pow(sd,5.)+.11*pow(sd,48.));c+=uSunC*.045*pow(1.-abs(h),10.)*(.4+.6*sd);return c;}`;
const VS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;layout(location=1) in vec3 aN;layout(location=2) in vec2 aU;layout(location=3) in vec4 aC;
layout(location=4) in vec4 i0;layout(location=5) in vec4 i1;layout(location=6) in vec4 i2;layout(location=7) in vec4 i3;layout(location=8) in vec4 iC;
uniform mat4 uVP,uM;uniform bool uInst;uniform int uAnim;uniform float uT,uExc,uPan,uStand;uniform vec3 uPanC;
out vec3 vW,vN;out vec2 vU;out vec4 vC;
float h1(float n){return fract(sin(n)*43758.5453);}
void main(){mat4 Mo=uInst?mat4(i0,i1,i2,i3):uM;vec3 p=aP,n=aN;vec4 col=aC;
if(uAnim==1){float sd=iC.a,part=aC.a;float stn=uStand*step(.22,h1(sd*8.9));float ex=clamp(max(uExc*(.55+.9*h1(sd*7.3)),stn*.8),0.,1.);
 float pan=step(h1(sd*13.1),uPan)*step(.25,h1(sd*3.7));
 float side=p.x>0.?1.:-1.;
 if(part>.6){vec2 pv=vec2(side*.17,.47);float w=sin(uT*(6.+h1(sd)*4.)+sd*40.);
  float ang=max(ex*2.5*(.8+.2*w)*(side>0.||h1(sd*2.1)>.5?1.:.35),pan*side*side*(2.6+.25*w));
  if(part>.9){p=mix(vec3(side*.19,.13,0.),p,pan);}
  vec2 q=p.xy-pv;float a=side*ang,c=cos(a),s=sin(a);q=vec2(q.x*c-q.y*s,q.x*s+q.y*c);p.xy=q+pv;n.xy=vec2(n.x*c-n.y*s,n.x*s+n.y*c);}
 float jp=max(0.,sin(uT*9.+sd*60.))*.13*ex*step(.55,h1(sd*5.7));p.y+=jp+stn*.32*(.85+.15*h1(sd*2.3));p.x+=sin(uT*1.3+sd*30.)*.015;
 vec3 sk=mix(vec3(.62,.38,.25),vec3(.95,.68,.52),h1(sd*9.1));vec3 hr=h1(sd*4.4)>.82?vec3(.85,.78,.55):(h1(sd*4.4)>.7?vec3(.9):vec3(.05,.035,.03));
 col.rgb=part<.12?iC.rgb:part<.37?sk:part<.62?hr:part<.9?iC.rgb*.9:uPanC;col.a=0.;}
if(uAnim==2){float w=aU.x;p.z+=sin(aU.x*7.-uT*7.+aU.y*2.)*.22*w;p.y+=sin(aU.x*5.-uT*5.)*.05*w;}
vec4 W=Mo*vec4(p,1.);vW=W.xyz;vN=normalize(mat3(Mo)*n);vU=aU;vC=col;gl_Position=uVP*W;}`;
const FS=`#version 300 es
precision highp float;precision highp sampler2DShadow;
in vec3 vW,vN;in vec2 vU;in vec4 vC;
uniform vec3 uBase,uBack,uSheenC,uEmis,uGold;uniform float uRough,uMetal,uSheen,uDetS,uAlpha,uEmb,uOut,uAmbK,uFogD,uT,uWet;
uniform vec2 uUvS,uDetUv;uniform int uMode;uniform bool uHasA,uHasD,uTransp;
uniform sampler2D tA,tD,tTr;uniform sampler2DShadow tS0,tS1;uniform mat4 uS0,uS1;uniform vec3 uS0b;
uniform vec3 uCam,uFogC;uniform vec4 uTrk;uniform int uPLn;uniform vec3 uPLp[8],uPLc[8];
out vec4 o;
${SKYFN}
vec3 pert(vec3 N,vec3 p,vec2 uv,vec3 mn){vec3 dp1=dFdx(p),dp2=dFdy(p);vec2 du1=dFdx(uv),du2=dFdy(uv);
vec3 d2p=cross(dp2,N),d1p=cross(N,dp1);vec3 Tt=d2p*du1.x+d1p*du2.x,B=d2p*du1.y+d1p*du2.y;float iv=inversesqrt(max(dot(Tt,Tt),dot(B,B))+1e-20);return normalize(mat3(Tt*iv,B*iv,N)*mn);}
float shad(vec3 W,vec3 Ng){vec2 d=abs(W.xz-uS0b.xy);bool c0=max(d.x,d.y)<uS0b.z*.94;
vec4 sp=(c0?uS0:uS1)*vec4(W+Ng*(c0?.025:.09),1.);sp.xyz=sp.xyz*.5+.5;
if(sp.x<0.||sp.y<0.||sp.x>1.||sp.y>1.||sp.z>1.)return 1.;float s=0.;
if(c0){vec2 ts=1./vec2(textureSize(tS0,0));float an=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)*6.2832;mat2 rot=mat2(cos(an),sin(an),-sin(an),cos(an));
const vec2 PD[12]=vec2[12](vec2(-.326,-.406),vec2(-.840,-.074),vec2(-.696,.457),vec2(-.203,.621),vec2(.962,-.195),vec2(.473,-.480),vec2(.519,.767),vec2(.185,-.893),vec2(.507,.064),vec2(.896,.412),vec2(-.322,-.933),vec2(-.792,-.598));
for(int i=0;i<12;i++)s+=texture(tS0,vec3(sp.xy+rot*PD[i]*ts*2.1,sp.z-.0004));return s/12.;}
else{vec2 ts=1./vec2(textureSize(tS1,0));for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)s+=texture(tS1,vec3(sp.xy+vec2(x,y)*ts*1.3,sp.z-.0012));}
return s/9.;}
void main(){vec3 Ng=normalize(vN);if(!gl_FrontFacing)Ng=-Ng;vec3 N=Ng;vec2 uv=vU*uUvS;
if(uMode==5){float r=length(uv);o=vec4(0.,0.,0.,uAlpha*pow(clamp(1.-r,0.,1.),1.8));return;}
vec3 alb=uBase*vC.rgb;float rough=uRough,metal=uMetal;
if(uMode==3&&!gl_FrontFacing)alb=uBack;
if(uHasA&&uMode!=1)alb*=texture(tA,uv).rgb;
if(uMode==2){vec2 tu=(vW.xz-uTrk.xy)/uTrk.z+.5;vec4 tr=texture(tTr,tu);alb=mix(alb,vec3(.92,.9,.85),tr.b*.9);alb*=1.-tr.r*.42;alb=mix(alb,alb*vec3(.72,.62,.55),tr.g);rough=mix(rough,.6,tr.g);}
if(uHasD){vec3 mn=texture(tD,uv*uDetUv).xyz*2.-1.;mn.xy*=uDetS;N=pert(N,vW,uv*uDetUv,normalize(mn));}
if(uMode==1){vec4 e=texture(tA,uv);float emb=vC.a>=.5?1.:0.;float g0=vC.a>=.5?(vC.a-.5)*2.:vC.a*2.;float g=clamp(g0+emb*e.r*uEmb,0.,1.);
 alb=mix(alb,uGold,g);metal=mix(metal,1.,g);rough=mix(rough,.22+.3*(1.-e.g),g);}
else if(vC.a>0.&&uMode!=3){alb=mix(alb,uGold,vC.a);metal=mix(metal,1.,vC.a);rough=mix(rough,.3,vC.a);}
vec3 V=normalize(uCam-vW);float NdV=max(dot(N,V),1e-3);vec3 L=uSun;float NdL=dot(N,L);
float sh=dot(Ng,L)>-.15?shad(vW,Ng):0.;
float a=max(rough*rough,.002);vec3 H=normalize(L+V);float NdH=max(dot(N,H),0.),VdH=max(dot(V,H),0.);
vec3 F0=mix(vec3(.04),alb,metal);vec3 F=F0+(1.-F0)*pow(1.-VdH,5.);
float D=a*a/(3.14159*pow(NdH*NdH*(a*a-1.)+1.,2.));float k=(rough+1.)*(rough+1.)/8.;float nl=max(NdL,0.);
float G=NdV/(NdV*(1.-k)+k)*nl/(nl*(1.-k)+k);vec3 spec=D*F*G/(4.*NdV*max(nl,1e-3));
vec3 kd=(1.-F)*(1.-metal);float wr=uMode==4?max((NdL+.4)/1.4,0.):nl;
vec3 col=(kd*alb/3.14159*wr+spec*nl)*uSunC*sh;
vec3 amb=mix(uGnd*.9,uSkyH*.55+uSkyT*.45,N.y*.5+.5)*mix(.5,1.,smoothstep(-.7,.5,N.y));
vec3 R=reflect(-V,N);vec3 env=mix(skyCol(R),amb,rough);vec3 Fr=F0+(max(vec3(1.-rough),F0)-F0)*pow(1.-NdV,5.);
col+=kd*alb*amb*uAmbK+env*Fr*uAmbK*(1.-rough*.6);
for(int i=0;i<8;i++){if(i>=uPLn)break;vec3 Lv=uPLp[i]-vW;float d2=dot(Lv,Lv);vec3 Ll=Lv*inversesqrt(d2);float nl2=uMode==4?max((dot(N,Ll)+.4)/1.4,0.):max(dot(N,Ll),0.);vec3 H2=normalize(Ll+V);float sp2=pow(max(dot(N,H2),0.),mix(6.,80.,1.-rough))*(1.-rough)*.6;col+=(kd*alb/3.14159*nl2+F0*sp2*nl2)*uPLc[i]/(1.+d2);}
if(uSheen>0.){float sv=pow(1.-NdV,2.5);col+=uSheenC*uSheen*sv*(uSunC*max(NdL*.6+.4,0.)*sh*.35+amb*.5);}
if(uMode==4){col+=alb*vec3(.5,.12,.06)*uSunC*.06*max(-NdL,0.);}
col+=uEmis;
float dist=length(uCam-vW);float f=1.-exp(-dist*uFogD);float sa=pow(max(dot(-V,uSun),0.),6.);
col=mix(col,uFogC+uSunC*.07*sa,f);
o=vec4(col*uOut,uTransp?uAlpha:0.);}`;
const VS_FS=`#version 300 es
out vec2 vUv;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vUv=p;gl_Position=vec4(p*2.-1.,0.,1.);}`;
const VS_SKY=`#version 300 es
out vec2 vUv;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vUv=p;gl_Position=vec4(p*2.-1.,1.,1.);}`;
const FS_SKY=`#version 300 es
precision highp float;in vec2 vUv;uniform mat4 uIVP;uniform vec3 uCam,uCloudC;uniform float uT,uOut,uCloud;out vec4 o;
${SKYFN}
float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2(1,0)),f.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){vec4 a=uIVP*vec4(vUv*2.-1.,1.,1.);vec3 d=normalize(a.xyz/a.w-uCam);vec3 c=skyCol(d);float sd=dot(d,uSun);
c+=uSunC*smoothstep(.99955,.9998,sd)*18.;
if(d.y>0.){vec2 q=d.xz/(d.y+.08)*.9+vec2(uT*.004,0.);float n=fb(q*1.3);float cov=smoothstep(.58-uCloud*.2,.86,n);
float lit=.5+.5*fb(q*1.3+uSun.xz*.08);vec3 cc=mix(uSkyH*.75,uCloudC,lit)+uSunC*.25*pow(max(sd,0.),6.);c=mix(c,cc,cov*smoothstep(.0,.2,d.y)*.85);}
o=vec4(c*uOut,1.);}`;
const FS_DEPTH=`#version 300 es
precision mediump float;void main(){}`;
const VS_PART=`#version 300 es
layout(location=0) in vec3 aP;layout(location=4) in vec4 iP;layout(location=5) in vec4 iC;
uniform mat4 uVP;uniform vec3 uR,uUp;out vec2 vQ;out vec4 vC;out vec3 vW;
void main(){vec3 w=iP.xyz+(uR*aP.x+uUp*aP.y)*iP.w;vW=w;vQ=aP.xy;vC=iC;gl_Position=uVP*vec4(w,1.);}`;
const FS_PART=`#version 300 es
precision highp float;in vec2 vQ;in vec4 vC;in vec3 vW;uniform vec3 uSunC,uAmb,uCam,uSun;uniform float uOut;out vec4 o;
void main(){float r=length(vQ);if(r>1.)discard;float a=(1.-r*r)*vC.a;vec3 v=normalize(vW-uCam);float ph=.55+.8*pow(max(dot(v,uSun),0.),3.);
o=vec4(vC.rgb*(uAmb*.7+uSunC*.18*ph)*uOut,a);}`;
const FS_BRIGHT=`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D tC;uniform float uTh,uIn;uniform vec2 uTx;out vec4 o;
void main(){vec3 c=vec3(0.);float sky=0.;for(int i=0;i<4;i++){vec2 of=vec2(float(i&1),float(i>>1))-.5;vec4 s=texture(tC,vUv+of*uTx);c+=s.rgb;sky+=s.a;}c=c/4.*uIn;sky/=4.;
float l=max(max(c.r,c.g),c.b);float k=max(l-uTh,0.)/(l+1e-4);o=vec4(c*k,sky);}`;
const FS_BLUR=`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D tC;uniform vec2 uDir;out vec4 o;
void main(){vec3 c=texture(tC,vUv).rgb*.227;c+=(texture(tC,vUv+uDir*1.385).rgb+texture(tC,vUv-uDir*1.385).rgb)*.316;c+=(texture(tC,vUv+uDir*3.23).rgb+texture(tC,vUv-uDir*3.23).rgb)*.07;o=vec4(c,1.);}`;
const FS_RAYS=`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D tC;uniform vec2 uSp;uniform float uK;out vec4 o;
void main(){vec2 d=(uSp-vUv)/40.;vec2 uv=vUv;vec3 c=vec3(0.);float w=1.;for(int i=0;i<40;i++){vec4 s=texture(tC,uv);c+=s.rgb*s.a*w;w*=.965;uv+=d;}o=vec4(c/40.*uK,1.);}`;
const FS_COMP=`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D tC,tB1,tB2,tR;uniform float uExp,uBloom,uRay,uVig,uGrain,uT,uCA,uSpd,uSat,uLet,uFade,uRed,uIn,uCon;uniform vec3 uLift,uGain;uniform vec2 uRes;uniform float uAA,uSharp;out vec4 o;
float Lm(vec3 x){x=x/(1.+x);return dot(x,vec3(.299,.587,.114));}
vec3 fxaa(vec2 uv){vec2 p=1./uRes;vec3 cM=texture(tC,uv).rgb;float lNW=Lm(texture(tC,uv+vec2(-p.x,-p.y)).rgb),lNE=Lm(texture(tC,uv+vec2(p.x,-p.y)).rgb),lSW=Lm(texture(tC,uv+vec2(-p.x,p.y)).rgb),lSE=Lm(texture(tC,uv+vec2(p.x,p.y)).rgb),lM=Lm(cM);
float mn=min(lM,min(min(lNW,lNE),min(lSW,lSE))),mx=max(lM,max(max(lNW,lNE),max(lSW,lSE)));if(mx-mn<max(.03,mx*.1))return cM;
vec2 d=vec2(-((lNW+lNE)-(lSW+lSE)),((lNW+lSW)-(lNE+lSE)));float rd=max((lNW+lNE+lSW+lSE)*.03125,.0078);float rm=1./(min(abs(d.x),abs(d.y))+rd);d=clamp(d*rm,-8.,8.)*p;
vec3 a=.5*(texture(tC,uv+d*(-1./6.)).rgb+texture(tC,uv+d*(1./6.)).rgb);vec3 b=a*.5+.25*(texture(tC,uv+d*-.5).rgb+texture(tC,uv+d*.5).rgb);float lb=Lm(b);return(lb<mn||lb>mx)?a:b;}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
float hh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 uv=vUv,cc=uv-.5;vec3 c;
float ca=uCA*(1.+uSpd*2.);
if(uSpd>.02){c=vec3(0.);for(int i=0;i<10;i++){float s=1.-uSpd*.05*float(i)/10.;vec2 u2=.5+cc*s;c+=vec3(texture(tC,.5+(u2-.5)*(1.+ca)).r,texture(tC,u2).g,texture(tC,.5+(u2-.5)*(1.-ca)).b);}c/=10.;}
else{c=uAA>0.?fxaa(uv):texture(tC,uv).rgb;if(ca>.0004){c.r=texture(tC,.5+cc*(1.+ca)).r;c.b=texture(tC,.5+cc*(1.-ca)).b;}
if(uSharp>0.){vec2 p=1./uRes;vec3 bl=(texture(tC,uv+vec2(p.x,0.)).rgb+texture(tC,uv-vec2(p.x,0.)).rgb+texture(tC,uv+vec2(0.,p.y)).rgb+texture(tC,uv-vec2(0.,p.y)).rgb)*.25;c=max(c+(c-bl)*uSharp,0.);}}
c*=uIn;c+=texture(tB1,uv).rgb*uBloom*.55+texture(tB2,uv).rgb*uBloom*.6+texture(tR,uv).rgb*uRay;
c*=uExp;c=aces(c);float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,uSat);
c=pow(c,vec3(1./2.2));c=(c-.5)*uCon+.5;c=c*uGain+uLift*(1.-c);
float v=smoothstep(.95,.25,length(cc*vec2(1.,.8)));c*=mix(1.,v,uVig);c=mix(c,c*vec3(1.,.25,.2),uRed*(1.-v));
c+=(hh(uv*uRes+fract(uT)*61.)-.5)*uGrain;if(abs(cc.y)>.5-uLet)c=vec3(0.);c*=1.-uFade;o=vec4(clamp(c,0.,1.),1.);}`;
// ---------- Renderizador ----------
const R={q:{px:1,sh0:2048,sh1:2048,msaa:4,crowd:1},scene:[],trans:[],items:[],T:0};
function rtTex(w,h,ifmt,fmt,type,filter=gl.LINEAR){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,ifmt,w,h,0,fmt,type,null);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t}
function fbo(tex,depthRB){const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);if(tex)gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);if(depthRB)gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depthRB);return f}
const CF=HDR?[gl.RGBA16F,gl.RGBA,gl.HALF_FLOAT]:[gl.RGBA8,gl.RGBA,gl.UNSIGNED_BYTE];
function shadowMap(sz){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,sz,sz);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL);
const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,t,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);return{t,f,sz,vp:m4.id()}}
function rInit(){R.P=prog(VS,FS);R.PD=prog(VS,FS_DEPTH);R.PS=prog(VS_SKY,FS_SKY);R.PP=prog(VS_PART,FS_PART);R.PB=prog(VS_FS,FS_BRIGHT);R.PBl=prog(VS_FS,FS_BLUR);R.PR=prog(VS_FS,FS_RAYS);R.PC=prog(VS_FS,FS_COMP);
R.vao=gl.createVertexArray();R.white=tex1(255,255,255);R.flatN=tex1(128,128,255);
gl.vertexAttrib4f(3,1,1,1,0);gl.vertexAttrib4f(8,1,1,1,0);
R.vp=m4.id();R.view=m4.id();R.proj=m4.id();R.ivp=m4.id();
// cuadrado para partículas
const g=new Geo();g.p=[-1,-1,0,1,-1,0,1,1,0,-1,1,0];g.n=[0,0,1,0,0,1,0,0,1,0,0,1];g.u=[0,0,1,0,1,1,0,1];g.i=[0,1,2,0,2,3];R.quad=makeMesh(g);
gl.bindVertexArray(R.quad.vao);R.pb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,R.pb);R.pmax=900;R.pdata=new Float32Array(R.pmax*8);gl.bufferData(gl.ARRAY_BUFFER,R.pdata.byteLength,gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(4);gl.vertexAttribPointer(4,4,gl.FLOAT,false,32,0);gl.vertexAttribDivisor(4,1);gl.enableVertexAttribArray(5);gl.vertexAttribPointer(5,4,gl.FLOAT,false,32,16);gl.vertexAttribDivisor(5,1);gl.bindVertexArray(null);
R.pcount=0;rAlloc()}
function rAlloc(){const q=R.q;const dpr=M.min(window.devicePixelRatio||1,2);const W=M.max(320,M.round(innerWidth*dpr*q.px)),H=M.max(200,M.round(innerHeight*dpr*q.px));
CV.width=W;CV.height=H;if(R.W===W&&R.H===H&&R.msaaUsed===q.msaa&&R.shs===q.sh0)return;R.W=W;R.H=H;
const del=x=>x&&gl.deleteTexture(x);[R.tC,R.tH,R.tQ1,R.tQ2,R.tE1,R.tE2,R.tRy].forEach(del);
R.tC=rtTex(W,H,...CF);R.rbD=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,R.rbD);
const ms=HDR?M.min(q.msaa,gl.getParameter(gl.MAX_SAMPLES)):0;R.msaaUsed=q.msaa;
if(ms>1){gl.renderbufferStorageMultisample(gl.RENDERBUFFER,ms,gl.DEPTH_COMPONENT24,W,H);R.rbC=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,R.rbC);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,ms,CF[0],W,H);
R.fMS=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,R.fMS);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,R.rbC);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,R.rbD);R.fC=fbo(R.tC)}
else{gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,W,H);R.fMS=null;R.fC=fbo(R.tC,R.rbD)}
const h=[W>>1,H>>1],qq=[W>>2,H>>2],e=[W>>3,H>>3];R.sz={h,q:qq,e};
R.tH=rtTex(...h,...CF);R.fH=fbo(R.tH);R.tRy=rtTex(...h,...CF);R.fRy=fbo(R.tRy);
R.tQ1=rtTex(...qq,...CF);R.fQ1=fbo(R.tQ1);R.tQ2=rtTex(...qq,...CF);R.fQ2=fbo(R.tQ2);R.tE1=rtTex(...e,...CF);R.fE1=fbo(R.tE1);R.tE2=rtTex(...e,...CF);R.fE2=fbo(R.tE2);
if(!R.S0||R.shs!==q.sh0){R.S0=shadowMap(q.sh0);R.S1=shadowMap(q.sh1);R.shs=q.sh0}gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
addEventListener('resize',()=>gl&&rAlloc());
// Entorno (luz)
const ENV={sun:V.norm([-.7,.42,.55]),sunC:[5,4.1,3.1],skyT:[.16,.33,.72],skyH:[.95,.82,.66],gnd:[.42,.33,.22],fogC:[.85,.74,.6],fogD:.0035,amb:1,exp:1,cloud:.5,cloudC:[1.25,1.05,.9],
sat:1.14,con:1.1,lift:[.012,.006,0],gain:[1.02,.99,.93],bloom:.42,ray:.8,vig:.6,grain:.035,ca:.0014,
sh0c:[0,0,0],sh0h:16,sh1c:[0,0,0],sh1h:75};
function sunVP(S,c,h){const lv=m4.look(m4.id(),[ENV.sun[0],ENV.sun[1],ENV.sun[2]],[0,0,0],M.abs(ENV.sun[1])>.98?[0,0,1]:[0,1,0]);const p=m4.pt(lv,c),tx=2*h/S.sz;p[0]=M.round(p[0]/tx)*tx;p[1]=M.round(p[1]/tx)*tx;
const pr=m4.ortho(m4.id(),p[0]-h,p[0]+h,p[1]-h,p[1]+h,-p[2]-200,-p[2]+200);m4.mul(S.vp,pr,lv)}
function setMat(P,m){const u=P.u;gl.uniform3fv(u.uBase,m.base||[1,1,1]);gl.uniform3fv(u.uBack,m.back||[1,1,1]);gl.uniform1f(u.uRough,m.rough??.7);gl.uniform1f(u.uMetal,m.metal||0);
gl.uniform1f(u.uSheen,m.sheen||0);gl.uniform3fv(u.uSheenC,m.sheenC||[1,1,1]);gl.uniform3fv(u.uEmis,m.emis||[0,0,0]);gl.uniform3fv(u.uGold,m.gold||[1,.72,.32]);gl.uniform1f(u.uEmb,m.emb||0);
gl.uniform2fv(u.uUvS,m.uv||[1,1]);gl.uniform2fv(u.uDetUv,m.duv||[1,1]);gl.uniform1f(u.uDetS,m.detS??1);gl.uniform1i(u.uMode,m.mode||0);
gl.uniform1i(u.uHasA,m.alb?1:0);gl.uniform1i(u.uHasD,m.det?1:0);gl.uniform1i(u.uAnim,m.anim||0);gl.uniform1i(u.uTransp,m.transp?1:0);gl.uniform1f(u.uAlpha,m.alpha??1);
gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,m.alb||R.white);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,m.det||R.flatN)}
const ID=m4.id();
function drawList(P,list,depth){let lastM=null;for(const n of list){const m=n.mesh;if(depth&&(!n.cast||n.mat.transp))continue;gl.bindVertexArray(m.vao);
if(!depth&&n.mat!==lastM){setMat(P,n.mat);lastM=n.mat}else if(depth){gl.uniform1i(P.u.uAnim,n.mat.anim||0)}
gl.uniformMatrix4fv(P.u.uM,false,n.w);gl.uniform1i(P.u.uInst,m.ib?1:0);
if(m.ib){if(m.icount>0)gl.drawElementsInstanced(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0,m.icount)}else gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0)}}
function commonU(P){const u=P.u;if(u.uPLn){const L=R.pl||[];gl.uniform1i(u.uPLn,L.length);if(L.length){const pp=new Float32Array(24),cc=new Float32Array(24);L.slice(0,8).forEach((l,i)=>{pp.set(l.p,i*3);cc.set(l.c,i*3)});gl.uniform3fv(u.uPLp,pp);gl.uniform3fv(u.uPLc,cc)}}gl.uniform1f(u.uT,R.T);gl.uniform1f(u.uExc,R.exc||0);gl.uniform1f(u.uPan,R.pan||0);gl.uniform1f(u.uStand,R.stand||0);gl.uniform3fv(u.uPanC,R.panC||[1,1,1])}
// cámara
const CAM={p:[0,5,-20],t:[0,1,0],fov:55,near:.1,far:900,up:[0,1,0]};
function render(root,extra){const W=R.W,H=R.H;R.items.length=0;root.upd(null);root.collect(R.items);
const op=[],tr=[];for(const n of R.items)(n.mat.transp?tr:op).push(n);
op.sort((a,b)=>(a.mat.id||0)-(b.mat.id||0));
m4.persp(R.proj,CAM.fov*PI/180,W/H,CAM.near,CAM.far);m4.look(R.view,CAM.p,CAM.t,CAM.up);m4.mul(R.vp,R.proj,R.view);m4.inv(R.ivp,R.vp);
// sombras
gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.disable(gl.CULL_FACE);
sunVP(R.S0,ENV.sh0c,ENV.sh0h);sunVP(R.S1,ENV.sh1c,ENV.sh1h);gl.useProgram(R.PD);commonU(R.PD);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.5,2);
for(const S of(R.frame%2?[R.S0,R.S1]:[R.S0])){gl.bindFramebuffer(gl.FRAMEBUFFER,S.f);gl.viewport(0,0,S.sz,S.sz);gl.clear(gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(R.PD.u.uVP,false,S.vp);drawList(R.PD,op,true)}
if(!R.frame){gl.bindFramebuffer(gl.FRAMEBUFFER,R.S1.f);gl.viewport(0,0,R.S1.sz,R.S1.sz);gl.clear(gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(R.PD.u.uVP,false,R.S1.vp);drawList(R.PD,op,true)}
gl.disable(gl.POLYGON_OFFSET_FILL);R.frame=(R.frame||0)+1;
// escena
gl.bindFramebuffer(gl.FRAMEBUFFER,R.fMS||R.fC);gl.viewport(0,0,W,H);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
const out=HDR?1:.25,P=R.P,u=P.u;gl.useProgram(P);commonU(P);
gl.uniformMatrix4fv(u.uVP,false,R.vp);gl.uniform3fv(u.uCam,CAM.p);gl.uniform3fv(u.uSun,ENV.sun);gl.uniform3fv(u.uSunC,ENV.sunC);gl.uniform3fv(u.uSkyT,ENV.skyT);gl.uniform3fv(u.uSkyH,ENV.skyH);gl.uniform3fv(u.uGnd,ENV.gnd);
gl.uniform3fv(u.uFogC,ENV.fogC);gl.uniform1f(u.uFogD,ENV.fogD);gl.uniform1f(u.uOut,out);gl.uniform1f(u.uAmbK,ENV.amb);
gl.uniformMatrix4fv(u.uS0,false,R.S0.vp);gl.uniformMatrix4fv(u.uS1,false,R.S1.vp);gl.uniform3f(u.uS0b,ENV.sh0c[0],ENV.sh0c[2],ENV.sh0h);gl.uniform4fv(u.uTrk,R.trk||[0,0,64,0]);
gl.uniform1i(u.tA,0);gl.uniform1i(u.tD,1);gl.uniform1i(u.tTr,2);gl.uniform1i(u.tS0,3);gl.uniform1i(u.tS1,4);
gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,R.trkTex||R.white);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,R.S0.t);gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D,R.S1.t);
drawList(P,op,false);
// cielo
gl.depthMask(false);gl.useProgram(R.PS);const s=R.PS.u;gl.uniformMatrix4fv(s.uIVP,false,R.ivp);gl.uniform3fv(s.uCam,CAM.p);gl.uniform3fv(s.uSun,ENV.sun);gl.uniform3fv(s.uSunC,ENV.sunC);gl.uniform3fv(s.uSkyT,ENV.skyT);gl.uniform3fv(s.uSkyH,ENV.skyH);gl.uniform3fv(s.uGnd,ENV.gnd);
gl.uniform3fv(s.uCloudC,ENV.cloudC);gl.uniform1f(s.uT,R.T);gl.uniform1f(s.uOut,out);gl.uniform1f(s.uCloud,ENV.cloud);gl.bindVertexArray(R.vao);gl.drawArrays(gl.TRIANGLES,0,3);
// transparentes
gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ZERO,gl.ONE);
if(tr.length){gl.useProgram(P);drawList(P,tr,false)}
if(R.pcount){gl.useProgram(R.PP);const pu=R.PP.u;gl.uniformMatrix4fv(pu.uVP,false,R.vp);const v=R.view;gl.uniform3f(pu.uR,v[0],v[4],v[8]);gl.uniform3f(pu.uUp,v[1],v[5],v[9]);
gl.uniform3fv(pu.uSunC,ENV.sunC);gl.uniform3fv(pu.uAmb,V.lerp(ENV.skyH,ENV.gnd,.4));gl.uniform3fv(pu.uCam,CAM.p);gl.uniform3fv(pu.uSun,ENV.sun);gl.uniform1f(pu.uOut,out);
gl.bindVertexArray(R.quad.vao);gl.bindBuffer(gl.ARRAY_BUFFER,R.pb);gl.bufferSubData(gl.ARRAY_BUFFER,0,R.pdata,0,R.pcount*8);gl.drawElementsInstanced(gl.TRIANGLES,6,gl.UNSIGNED_INT,0,R.pcount)}
gl.disable(gl.BLEND);gl.depthMask(true);
if(R.fMS){gl.bindFramebuffer(gl.READ_FRAMEBUFFER,R.fMS);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,R.fC);gl.blitFramebuffer(0,0,W,H,0,0,W,H,gl.COLOR_BUFFER_BIT,gl.NEAREST)}
post()}
function fsq(P,f,w,h){gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.viewport(0,0,w,h);gl.useProgram(P);gl.bindVertexArray(R.vao);return P.u}
function bind(i,t){gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t)}
function post(){gl.disable(gl.DEPTH_TEST);const{h,q,e}=R.sz,inv=HDR?1:4;
let u=fsq(R.PB,R.fH,...h);bind(0,R.tC);gl.uniform1i(u.tC,0);gl.uniform1f(u.uTh,1.5);gl.uniform1f(u.uIn,inv);gl.uniform2f(u.uTx,1/R.W,1/R.H);gl.drawArrays(gl.TRIANGLES,0,3);
// rayos de sol
const sp=m4.pt(R.vp,V.add(CAM.p,V.sc(ENV.sun,100)));const cw=R.vp[3]*(CAM.p[0]+ENV.sun[0]*100)+R.vp[7]*(CAM.p[1]+ENV.sun[1]*100)+R.vp[11]*(CAM.p[2]+ENV.sun[2]*100)+R.vp[15];
let sx=.5,sy=.5,vis=0;if(cw>0){sx=(sp[0]/cw)*.5+.5;sy=(sp[1]/cw)*.5+.5;vis=clamp(1.6-M.max(M.abs(sx-.5),M.abs(sy-.5))*1.6,0,1)}
u=fsq(R.PR,R.fRy,...h);bind(0,R.tH);gl.uniform1i(u.tC,0);gl.uniform2f(u.uSp,sx,sy);gl.uniform1f(u.uK,vis*ENV.ray);gl.drawArrays(gl.TRIANGLES,0,3);
// bloom
const blur=(src,dst,f,w,hh,dx,dy)=>{const u=fsq(R.PBl,f,w,hh);bind(0,src);gl.uniform1i(u.tC,0);gl.uniform2f(u.uDir,dx/w,dy/hh);gl.drawArrays(gl.TRIANGLES,0,3)};
blur(R.tH,null,R.fQ1,...q,1,0);blur(R.tQ1,null,R.fQ2,...q,0,1);blur(R.tQ2,null,R.fE1,...e,1.5,0);blur(R.tE1,null,R.fE2,...e,0,1.5);blur(R.tE2,null,R.fE1,...e,2.5,0);blur(R.tE1,null,R.fE2,...e,0,2.5);
u=fsq(R.PC,null,R.W,R.H);bind(0,R.tC);bind(1,R.tQ2);bind(2,R.tE2);bind(3,R.tRy);gl.uniform1i(u.tC,0);gl.uniform1i(u.tB1,1);gl.uniform1i(u.tB2,2);gl.uniform1i(u.tR,3);
const E=ENV,F=R.fx||{};gl.uniform1f(u.uExp,E.exp);gl.uniform1f(u.uBloom,E.bloom);gl.uniform1f(u.uRay,1);gl.uniform1f(u.uVig,E.vig+(F.vig||0));gl.uniform1f(u.uGrain,E.grain);gl.uniform1f(u.uT,R.T);
gl.uniform1f(u.uCA,E.ca);gl.uniform1f(u.uSpd,F.spd||0);gl.uniform1f(u.uSat,E.sat*(F.sat??1));gl.uniform1f(u.uLet,F.let||0);gl.uniform1f(u.uFade,F.fade||0);gl.uniform1f(u.uRed,F.red||0);gl.uniform1f(u.uIn,inv);gl.uniform1f(u.uCon,E.con);
gl.uniform3fv(u.uLift,E.lift);gl.uniform3fv(u.uGain,E.gain);gl.uniform1f(u.uAA,R.q.msaa?0:1);gl.uniform1f(u.uSharp,R.q.px<.98?clamp((1-R.q.px)*1.1,0,.45):.12);gl.uniform2f(u.uRes,R.W,R.H);gl.drawArrays(gl.TRIANGLES,0,3);gl.enable(gl.DEPTH_TEST)}
// partículas: lista {p,v,s,a,life,max,c}
const PART=[];
function emit(p,v,s,life,c,a=.5,g=0,gr=0){if(PART.length>=R.pmax)PART.shift();PART.push({p:[...p],v:[...v],s,life,max:life,c,a,g,gr})}
function updParts(dt){let k=0;for(let i=PART.length-1;i>=0;i--){const q=PART[i];q.life-=dt;if(q.life<=0){PART.splice(i,1);continue}q.p[0]+=q.v[0]*dt;q.p[1]+=q.v[1]*dt;q.p[2]+=q.v[2]*dt;if(q.g){q.v[1]-=q.g*dt;if(q.p[1]<.04){q.p[1]=.04;q.v[0]*=.5;q.v[1]=0;q.v[2]*=.5}}else{q.v[1]-=.15*dt;q.v[0]*=.985;q.v[2]*=.985;q.s+=dt*.6*(1-(q.gr||0))}}
for(const q of PART){const t=q.life/q.max,o=k*8;R.pdata[o]=q.p[0];R.pdata[o+1]=q.p[1];R.pdata[o+2]=q.p[2];R.pdata[o+3]=q.s;R.pdata[o+4]=q.c[0];R.pdata[o+5]=q.c[1];R.pdata[o+6]=q.c[2];R.pdata[o+7]=q.a*M.min(1,t*2)*M.min(1,(1-t)*6);k++}R.pcount=k}
