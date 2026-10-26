// ================= CARTEL: toreros, ganaderías, sorteo de toros =================
Object.assign(TRAJES,{'Rosa y oro':{c:[.62,.2,.3],g:[1,.72,.3]},'Celeste y plata':{c:[.22,.42,.66],g:[.85,.87,.9]},'Nazareno y oro':{c:[.11,.025,.13],g:[1,.72,.3]},
'Corinto y oro':{c:[.2,.015,.05],g:[1,.72,.3]},'Marino y plata':{c:[.015,.025,.09],g:[.85,.87,.9]},'Caña y oro':{c:[.55,.42,.22],g:[1,.72,.3]}});
TOREROS.push(
{n:'Marco Ibarra',a:'El Azteca',est:'Temple mexicano',traje:'Rosa y oro',arte:1.1,temple:1.3,valor:.95,espada:.95,poder:.95,skin:[.4,.24,.15],h:.97,desc:'Lentitud de seda: sus naturales parecen no acabar nunca.'},
{n:'Luis Ferrer',a:'Levante',est:'Tremendista',traje:'Celeste y plata',arte:.9,temple:.85,valor:1.5,espada:1,poder:.95,skin:[.46,.28,.18],h:1.02,desc:'Arrimones y puertas gayola. Apura hasta lo imposible, pero lo pagan las cogidas.'},
{n:'Tomás Herrera',a:'',est:'Torero de culto',traje:'Nazareno y oro',arte:1.3,temple:1.15,valor:.9,espada:.9,poder:.85,skin:[.44,.27,.17],h:.99,desc:'Pocas tardes, pero cuando sale el toro bueno la faena se recuerda para siempre.'},
{n:'Cristina Robles',a:'',est:'Matadora',traje:'Corinto y oro',arte:1.1,temple:1.1,valor:1.1,espada:1,poder:.95,skin:[.5,.31,.21],h:.93,desc:'Valor sereno y cabeza fría. Lidia completa y estocadas de ley.'},
{n:'Javier Olmedo',a:'Olmedito',est:'Gran estoqueador',traje:'Marino y plata',arte:.9,temple:.95,valor:1.05,espada:1.4,poder:1.05,skin:[.42,.26,.16],h:1.01,desc:'Mata como pocos: ancha la cruz y certero el volapié.'},
{n:'Paco Ruedas',a:'El Mozo de Espadas',est:'Veterano',traje:'Caña y oro',arte:1,temple:1.1,valor:.85,espada:1.15,poder:1.2,skin:[.43,.26,.17],h:1,desc:'Treinta temporadas de oficio. Lo sabe todo de los toros difíciles.'});
['Sevilla','Toledo','Albacete','Ronda','Huelva','Córdoba','Madrid','Granada','México','Valencia','Madrid','Salamanca','Valladolid','Jaén'].forEach((o,i)=>{if(TOREROS[i])TOREROS[i].orig=o});
GANADERIAS.push(
{n:'Casa Valverde',enc:'Parladé',capas:['negro','negro','castano'],div:[[.05,.35,.1],[.9,.9,.9]],bravura:.84,nobleza:.78,fuerza:.66,size:1.02,horn:'veleto',hornAlt:['cornivuelto']},
{n:'El Pizarral',enc:'Pablo Romero',capas:['cardeno','cardeno','ensabanado'],div:[[.15,.45,.75],[.95,.95,.95]],bravura:.8,nobleza:.62,fuerza:.78,size:1.08,horn:'cornidelantero',hornAlt:['brocho']},
{n:'Los Majuelos',enc:'Vazqueña',capas:['sardo','salinero','berrendo','jabonero','chorreado'],div:[[.95,.75,.05],[.05,.35,.12]],bravura:.74,nobleza:.66,fuerza:.72,size:1,horn:'playero',hornAlt:['veleto','cornivuelto']},
{n:'Ribera del Ebro',enc:'Casta navarra',capas:['colorado','colorado','chorreado'],div:[[.7,.05,.05],[.95,.95,.95]],bravura:.86,nobleza:.38,fuerza:.7,size:.86,horn:'brocho',hornAlt:['cornidelantero']},
{n:'La Serrezuela',enc:'Gamero Cívico',capas:['negro','castano','chorreado'],div:[[.45,.25,.05],[.9,.8,.1]],bravura:.79,nobleza:.6,fuerza:.8,size:1.01,horn:'corniabierto'},
{n:'Monte Hermoso',enc:'Coquilla',capas:['negro','negro'],div:[[.05,.05,.05],[.9,.3,.05]],bravura:.83,nobleza:.58,fuerza:.6,size:.9,horn:'cornivuelto'});
{const D={'Hnos. Valdecañas':'El encaste más extendido: toro noble, con fijeza y recorrido para el toreo moderno.','El Torreón':'Cárdenos finos, bravos y con picante. Hay que someterlos por abajo.',
'Monteviejo':'Toros altos, largos y listos. Aprenden rápido y no perdonan errores.','Las Albercas':'Cárdenos encastados de pitones oscuros. Bravura áspera y emoción.',
'Peñalara':'Calidad y transmisión: embiste con clase por ambos pitones.','Los Alcornocales':'Toros grandes y hondos; bravura con poder que hay que administrar.',
'Dehesa del Prior':'Nobleza extraordinaria, ideal para el toreo de arte. Fuerza justa.','Cerro Moreno':'Cárdenos agalgados, codiciosos y con mucha movilidad.',
'La Retamosa':'Encaste minoritario de capas vistosas y embestida irregular.','Hnos. Requena':'Mucho poder físico; se viene arriba en la pelea.',
'Real Vacada del Duque':'Jaboneros de sangre antigua, voluminosos y de embestida pausada.','Casa Valverde':'Toro serio y armónico, de buen son y fondo de bravura.',
'El Pizarral':'Los «guapos»: cárdenos de lámina preciosa, morrillo imponente y embestida exigente.','Los Majuelos':'Capas variadísimas —sardos, salineros, berrendos—. Toro imprevisible y con personalidad.',
'Ribera del Ebro':'Pequeños, colorados y ágiles como gatos. Bravura nerviosa y mucho sentido.','La Serrezuela':'Toro duro y con casta, de los que piden carnet al torero.',
'Monte Hermoso':'Negros, finos y bajos. Fieros de salida y exigentes en la muleta.'};GANADERIAS.forEach(g=>g.desc=D[g.n]||'')}
const HORN_TXT={veleto:'Veleto',cornidelantero:'Cornidelantero',corniabierto:'Corniabierto',brocho:'Brocho',playero:'Playero',cornivuelto:'Cornivuelto'};
const CAPA_COL={negro:'#151210',castano:'#4a2410',colorado:'#7a2a10',cardeno:'linear-gradient(135deg,#222 0 30%,#777 30% 55%,#333 55%)',berrendo:'linear-gradient(90deg,#141210 0 50%,#c9c0b0 50%)',
jabonero:'#a8875a',ensabanado:'#d8d2c4',salinero:'linear-gradient(135deg,#8a3a20 0 40%,#c9b8a8 40% 60%,#8a3a20 60%)',sardo:'linear-gradient(135deg,#151210 0 33%,#7a2a10 33% 66%,#c9c0b0 66%)',chorreado:'repeating-linear-gradient(90deg,#4a2410 0 5px,#140c08 5px 8px)'};
function caracter(d){if(d.brav>.86&&d.nob>.75)return'Bravo y noble: toro de indulto';if(d.brav>.84&&d.nob<.55)return'Encastado y con genio';if(d.nob>.8)return'Noble, de embestida suave';
if(d.fz>.85)return'Poderoso, se viene arriba';if(d.brav<.66)return'Manso: tiende a rajarse';if(d.nob<.45)return'Avisado: mira al torero';return'Pronto y codicioso'}
// sorteo: tres toros de la ganadería elegida
function newLote(){const u=[];C.lote=[0,1,2].map(()=>{const d=newBullData(G.opts.gan,u);u.push(d.name);return d});G.bullSel=C.lote[0]}
const pct=v=>clamp(v,0,1)*100;
const statBars=a=>`<div class="stt">${a.map(([k,v])=>`<span>${k}</span><i><b style="width:${pct(v).toFixed(0)}%"></b></i>`).join('')}</div>`;
const tStat=v=>(v-.7)/.75;
const swTraje=t=>{const q=TRAJES[t]||TRAJES['Azul y oro'],c=q.c.map(x=>M.round(M.min(1,M.pow(x,.55))*255)),g=q.g.map(x=>M.round(x*255));return`<em class="sw" style="background:rgb(${c});box-shadow:inset 0 0 0 3px rgb(${g})"></em>`};
const swDiv=g=>{const a=g.div[0].map(x=>M.round(M.pow(x,.6)*255)),b=g.div[1].map(x=>M.round(M.pow(x,.6)*255));return`<em class="dv" style="background:linear-gradient(90deg,rgb(${a}) 50%,rgb(${b}) 50%)"></em>`};
const swCapa=c=>`<em class="sw" style="background:${CAPA_COL[c]||'#222'}"></em>`;
function cartelSum(){const t=TOR(),g=GANADERIAS[G.opts.gan],d=G.bullSel;
$('sTor').innerHTML=`${swTraje(G.opts.traje)}<b>${t.n}${t.a?' «'+t.a+'»':''}</b><small>${t.est} · ${t.orig||''}</small>`;
$('sGan').innerHTML=`${swDiv(g)}<b>${g.n}</b><small>Encaste ${g.enc}</small>`;
$('sToro').innerHTML=d?`${swCapa(d.capa)}<b>Nº ${d.num} «${d.name}»</b><small>${CAPA_TXT[d.capa]} · ${d.peso} kg · ${HORN_TXT[d.horn]||''}</small>`:'';
$('sTraje').innerHTML=`${swTraje(G.opts.traje)}<b>${G.opts.traje}</b><small>Vestido para la tarde</small>`;$('mGan').textContent=d?bullInfo(d):''}
function reTorero(){C.T=spawnTorero(G.opts.traje);C.T.p=[-1.6,0,-1.8];C.T.hd=M.atan2(C.B.p[0]-C.T.p[0],C.B.p[2]-C.T.p[2]);placeCloth(C.T,true)}
let PICK=null;
function openPick(k){PICK=k;$('cmain').hidden=true;$('pick').hidden=false;G.menuFocus=k=='tor'||k=='traje'?'tor':'toro';renderPick();$('pList').scrollTop=0;$('pBack').focus()}
function closePick(){PICK=null;$('pick').hidden=true;$('cmain').hidden=false;G.menuFocus=null;cartelSum()}
function renderPick(){const L=$('pList');let h='',foot='';
if(PICK=='tor'){$('pTitle').textContent='Elige matador';h=TOREROS.map((t,i)=>`<button class="card${i==(G.opts.tor||0)?' sel':''}" data-i="${i}"><div class="ch">${swTraje(t.traje)}<div><b>${t.n}${t.a?' «'+t.a+'»':''}</b><small>${t.est} · ${t.orig||''}</small></div></div>
${statBars([['Arte',tStat(t.arte)],['Temple',tStat(t.temple)],['Valor',tStat(t.valor)],['Espada',tStat(t.espada)],['Poder',tStat(t.poder)]])}<p>${t.desc}</p></button>`).join('')}
else if(PICK=='gan'){$('pTitle').textContent='Elige ganadería';h=GANADERIAS.map((g,i)=>`<button class="card${i==G.opts.gan?' sel':''}" data-i="${i}"><div class="ch">${swDiv(g)}<div><b>${g.n}</b><small>Encaste ${g.enc} · ${[...new Set(g.capas)].map(c=>CAPA_TXT[c]).join(', ')}</small></div></div>
${statBars([['Bravura',(g.bravura-.3)/.65],['Nobleza',g.nobleza],['Fuerza',g.fuerza],['Trapío',(g.size-.8)/.32]])}<p>${g.desc}</p></button>`).join('')}
else if(PICK=='toro'){const g=GANADERIAS[G.opts.gan];$('pTitle').textContent='Sorteo de '+g.n;if(!C.lote||C.lote[0].g!==g)newLote();
h=C.lote.map((d,i)=>`<button class="card${d===G.bullSel?' sel':''}" data-i="${i}"><div class="ch">${swCapa(d.capa)}<div><b>Nº ${d.num} · «${d.name}»</b><small>${CAPA_TXT[d.capa]} · ${d.peso} kg · ${HORN_TXT[d.horn]||''} · ${d.edad==4?'Cuatreño':'Cinqueño'} (${d.nac})</small></div></div>
${statBars([['Bravura',(d.brav-.3)/.65],['Nobleza',d.nob],['Fuerza',d.fz],['Trapío',d.trapio]])}<p>Informe del mayoral: <i>${caracter(d)}</i></p></button>`).join('');foot='<button id="pSorteo">Nuevo sorteo</button>'}
else if(PICK=='bous'){$('pTitle').textContent='Bous al carrer';h=BMOD.map((b,i)=>`<button class="card bmod" data-i="${i}"><div class="ch"><em class="sw" style="background:${b.id=='embolat'?'radial-gradient(circle at 50% 40%,#ffd36a,#e0561a 45%,#1a0d08 75%)':'linear-gradient(135deg,#d9a24b,#9a1e14)'}"></em><div><b>${b.n}</b><small>${b.h}</small></div></div><p>${b.d}</p><span class="go">Salir a la plaza ›</span></button>`).join('')+`<p class="nota">Toro: «${G.bullSel?G.bullSel.name:''}» de ${GANADERIAS[G.opts.gan].n}. Cámbialo en la fila «Toro» del cartel.</p>`}
else{$('pTitle').textContent='Traje de luces';h=Object.keys(TRAJES).map(t=>`<button class="card mini${t==G.opts.traje?' sel':''}" data-t="${t}"><div class="ch">${swTraje(t)}<div><b>${t}</b></div></div></button>`).join('')}
L.innerHTML=h;$('pFoot').innerHTML=foot+'<button id="pOk">Listo</button>';
L.querySelectorAll('.card').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(PICK=='bous'){closePick();goBous(BMOD[i].id);return}
 if(PICK=='tor'){G.opts.tor=i;G.opts.traje=TOR().traje;reTorero()}
 else if(PICK=='gan'){if(G.opts.gan!==i){G.opts.gan=i;newLote();menuScene()}}
 else if(PICK=='toro'){G.bullSel=C.lote[i];menuScene()}
 else{G.opts.traje=b.dataset.t;reTorero()}
 save();L.querySelectorAll('.card').forEach(x=>x.classList.toggle('sel',x===b));cartelSum()});
$('pOk').onclick=closePick;if($('pSorteo'))$('pSorteo').onclick=()=>{newLote();menuScene();renderPick()}}
function cartelInit(){$('rowTor').onclick=()=>openPick('tor');$('rowGan').onclick=()=>openPick('gan');$('rowToro').onclick=()=>openPick('toro');$('rowTraje').onclick=()=>openPick('traje');
$('pBack').onclick=closePick;if(G.opts.tor>=TOREROS.length)G.opts.tor=0;if(G.opts.gan>=GANADERIAS.length)G.opts.gan=0;if(!TRAJES[G.opts.traje])G.opts.traje=TOR().traje;newLote();cartelSum()}

// ================= PÚBLICO: aplausos, palmas, «¡torero!», flashes, ovaciones y lanzamientos =================
const PUB={stand:0,standT:0,flash:0,tango:0,tNext:0,chantT:-99};
function clapBurst(t,n,dur,g){const c=AU.c;for(let i=0;i<n;i++){const tt=t+M.random()*dur;noiseHit(tt,.05+M.random()*.04,rnd(1400,3200),rnd(.8,1.6),g*rnd(.4,1),'bandpass','white')}}
function aplauso(k=1,dur=2.5){const c=AU.c;if(!c)return;const t=c.currentTime;clapBurst(t,M.round(70*k*dur/2.5),dur,.09);noiseHit(t,dur*.8,2200,.4,.08*k,'bandpass','white')}
function palmasTango(){const c=AU.c;if(!c)return;const t=c.currentTime;for(let b=0;b<8;b++)clapBurst(t+b*.42,14,.05,.12)}
function voz(t,dur,v,k){const c=AU.c;const F={o:[480,880],e:[420,1950],a:[750,1200]}[v];const base=[123,147,165,185,220];for(const f0 of base){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=f0*rnd(.97,1.03);
const f1=c.createBiquadFilter(),f2=c.createBiquadFilter();f1.type=f2.type='bandpass';f1.Q.value=7;f2.Q.value=9;f1.frequency.value=F[0];f2.frequency.value=F[1];const a=c.createGain();
a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(.032*k,t+.04);a.gain.setValueAtTime(.032*k,t+dur*.7);a.gain.linearRampToValueAtTime(0,t+dur);o.connect(f1);o.connect(f2);f1.connect(a);f2.connect(a);a.connect(AU.m);o.start(t);o.stop(t+dur+.02)}
noiseHit(t,dur,F[0]+200,.7,.12*k,'bandpass','brown')}
// «¡To-re-ro, to-re-ro!»
function chantTorero(){const c=AU.c;if(!c||G.t-PUB.chantT<12)return;PUB.chantT=G.t;let t=c.currentTime+.1;for(let r=0;r<3;r++){voz(t,.16,'o',1);voz(t+.2,.34,'e',1.25);voz(t+.58,.22,'o',1);t+=1.15}}
function lanzar(tipo,n){const rows=PLZ.rows||[];if(!rows.length)return;for(let i=0;i<n;i++){const row=rows[(M.random()*M.min(10,rows.length))|0],a=rnd(0,TAU),r=row[0];
 const p=[M.cos(a)*r,row[1]+1,M.sin(a)*r],tg=[M.cos(a)*rnd(8,20)+rnd(-3,3),0,M.sin(a)*rnd(8,20)+rnd(-3,3)],T=rnd(1.2,1.8);
 const v=[(tg[0]-p[0])/T,(0-p[1])/T+4.9*T,(tg[2]-p[2])/T];
 const C0=tipo=='flor'?(M.random()<.7?[2.2,.15,.12]:[2.4,2.2,2]):tipo=='sombrero'?(M.random()<.5?[.05,.04,.04]:[.9,.75,.45]):[.35,.5,.25];
 emit(p,v,tipo=='sombrero'?.32:tipo=='flor'?.16:.28,rnd(12,20),C0,1,9.8,1)}}
function flashes(rate,dt){const rows=PLZ.rows||[];if(!rows.length||M.random()>rate*dt)return;const row=rows[(M.random()*rows.length)|0],a=rnd(0,TAU);emit([M.cos(a)*row[0],row[1]+.9,M.sin(a)*row[0]],[0,0,0],.35,.12,[60,60,55],1,0,1)}
function ovacion(k=1,dur=5){PUB.standT=dur;aplauso(1.4*k,M.min(dur,4))}
function publicoTick(dt){const m=G.mode,corr=m=='torero'||m=='toro'||(m=='result'&&G.prevMode!=='encierro'&&G.prevMode!=='bous'),live=m=='torero'||m=='toro';
 PUB.standT-=dt;R.stand=lerp(R.stand||0,PUB.standT>0?1:0,M.min(1,dt*(PUB.standT>0?3:1.2)));if(!corr)return;
 flashes(1.5+10*(R.exc||0)+(PUB.standT>0?14:0),dt);
 if(live&&C.dir&&C.dir.idle>9&&!C.kill&&C.B.state!='salida'&&G.t>PUB.tNext){PUB.tNext=G.t+11;palmasTango()}}
// enganches en los momentos clave
function pubPase(pts,combo,remate){if(pts>=10||remate)aplauso(clamp(pts/18,.4,1.3),remate?3.2:1.6);if(remate&&pts>=14)PUB.standT=M.max(PUB.standT,2.2);if(C.score>=180&&remate)chantTorero()}
function pubResult(kind){if(kind=='gloria'){ovacion(1.3,9);lanzar('flor',40);lanzar('sombrero',14);setTimeout(chantTorero,1200)}
 else if(kind=='bien'){ovacion(1,5);lanzar('flor',12)}else if(kind=='bronca'){pitos();lanzar('almohadilla',30)}}
