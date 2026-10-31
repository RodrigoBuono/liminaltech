(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Si se llega con un ancla (/#serv-1), el navegador scrollea la página hasta ahí
  // ANTES de que se active el modo escenas, y ese desplazamiento queda congelado:
  // todo se ve corrido. Se toma el ancla, se quita de la URL y la navegación la hace el motor.
  let initialHash='';
  if(!reduce && location.hash.length>1){
    initialHash=decodeURIComponent(location.hash.slice(1));
    history.replaceState(null,'',location.pathname+location.search);
  }
  if('scrollRestoration' in history) history.scrollRestoration='manual';
  const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
  let vw=innerWidth, vh=innerHeight;
  let deck=false;            // modo escenas (desktop)
  let idx=0, busy=false;     // escena actual
  let scenes=[], TOT=0;
  const priceBase=document.getElementById('precios');
  let priceScenes=[], splitState=null;

  /* En móvil cada tarjeta de precios pasa a ser su propia escena */
  function splitPricing(on){
    if(on && !priceScenes.length){
      const cards=[...priceBase.querySelectorAll('.pcard')];
      const head=priceBase.querySelector('.pr-head');
      const note=priceBase.querySelector('.pr-note');
      cards.forEach((c,i)=>{
        const sc=document.createElement('section');
        sc.className='scene pr-scene';
        sc.id='precio-'+(i+1);
        sc.dataset.org='2';
        sc.dataset.name='Precios '+(i+1)+'/'+cards.length;
        sc.dataset.word='Exponencialidad';
        const inner=document.createElement('div'); inner.className='scene-inner';
        if(i===0 && head) inner.appendChild(head.cloneNode(true));
        const cnt=document.createElement('span'); cnt.className='pr-count';
        cnt.innerHTML='<b>'+('0'+(i+1)).slice(-2)+'</b> / '+('0'+cards.length).slice(-2);
        inner.appendChild(cnt);
        inner.appendChild(c.cloneNode(true));
        if(i===cards.length-1 && note) inner.appendChild(note.cloneNode(true));
        sc.appendChild(inner);
        priceBase.parentNode.insertBefore(sc,priceBase);
        priceScenes.push(sc);
      });
      priceBase.classList.add('scene-off');
    }else if(!on && priceScenes.length){
      priceScenes.forEach(s=>s.remove()); priceScenes=[];
      priceBase.classList.remove('scene-off');
    }
    scenes=[...document.querySelectorAll('.scene:not(.scene-off)')];
    TOT=scenes.length;
  }
  splitPricing(false);

  /* ============================================================
     EL ORGANISMO — pantalla completa
     ============================================================ */
  const cvs=document.getElementById('org'), ctx=cvs.getContext('2d');
  // en celulares se limita la densidad de píxeles: el cielo y el organismo se ven igual y consumen la mitad
  const dprCap=()=>innerWidth<=980?1.5:2;
  let DPR=Math.min(devicePixelRatio||1,dprCap());
  let W=0,H=0,N=0, parts=[], shapes=[], dust=[], waves=[], linkDist=90;
  const PHASES=[
    {name:'Red neuronal', color:[143,180,201]},
    {name:'Columna vertebral', color:[201,166,121]},
    {name:'Ecoaldea', color:[134,163,122]}
  ];
  function rnd(a,b){ return a+Math.random()*(b-a); }
  function gauss(){ return (Math.random()+Math.random()+Math.random()-1.5)/1.5; }

  /* ============================================================
     EL CIELO — estrellas, Vía Láctea, nebulosas y galaxias
     ============================================================ */
  const sky=document.getElementById('sky'), sctx=sky.getContext('2d');
  let SW=0,SH=0, lFar=null,lMid=null,lNear=null,lNeb=null,lMilky=null;
  let galx=[], twinks=[], meteors=[], nextMeteor=0, sats=[], nextSat=0, rockets=[], nextRocket=0;

  function starColor(t){
    if(t<.15) return [160,185,255];
    if(t<.45) return [205,218,255];
    if(t<.78) return [255,246,236];
    if(t<.93) return [255,224,182];
    return [255,192,150];
  }
  function paintStar(x2,px,py,r,cr,cg,cb,a,halo){
    if(halo){
      const g=x2.createRadialGradient(px,py,0,px,py,r*7);
      g.addColorStop(0,`rgba(${cr},${cg},${cb},${(a*.9).toFixed(3)})`);
      g.addColorStop(.25,`rgba(${cr},${cg},${cb},${(a*.22).toFixed(3)})`);
      g.addColorStop(1,'rgba(0,0,0,0)');
      x2.fillStyle=g; x2.beginPath(); x2.arc(px,py,r*7,0,6.283); x2.fill();
      x2.strokeStyle=`rgba(${cr},${cg},${cb},${(a*.45).toFixed(3)})`;
      x2.lineWidth=Math.max(1,r*.26);
      x2.beginPath(); x2.moveTo(px-r*8.5,py); x2.lineTo(px+r*8.5,py);
      x2.moveTo(px,py-r*8.5); x2.lineTo(px,py+r*8.5); x2.stroke();
    }
    x2.fillStyle=`rgba(${cr},${cg},${cb},${a.toFixed(3)})`;
    x2.beginPath(); x2.arc(px,py,r,0,6.283); x2.fill();
  }
  function makeStars(n,maxR,haloFrac){
    const c=document.createElement('canvas'); c.width=SW; c.height=SH;
    const x2=c.getContext('2d');
    for(let i=0;i<n;i++){
      const px=Math.random()*SW, py=Math.random()*SH;
      const r=(Math.pow(Math.random(),3)*maxR+0.35)*DPR;
      const col=starColor(Math.random());
      const a=.22+Math.random()*.72;
      paintStar(x2,px,py,r,col[0],col[1],col[2],a, r>maxR*DPR*.6 && Math.random()<haloFrac);
    }
    return c;
  }
  function makeNebula(){
    const c=document.createElement('canvas'); c.width=SW; c.height=SH;
    const x2=c.getContext('2d');
    const hues=[[45,75,150],[95,65,150],[45,125,125],[135,115,85],[70,90,160]];
    for(let i=0;i<26;i++){
      const h=hues[i%hues.length];
      const px=Math.random()*SW, py=Math.random()*SH;
      const rad=SW*.08+Math.random()*SW*.16;
      const g=x2.createRadialGradient(px,py,0,px,py,rad);
      const a=.03+Math.random()*.055;
      g.addColorStop(0,`rgba(${h[0]},${h[1]},${h[2]},${a.toFixed(3)})`);
      g.addColorStop(1,'rgba(0,0,0,0)');
      x2.fillStyle=g; x2.beginPath(); x2.arc(px,py,rad,0,6.283); x2.fill();
    }
    return c;
  }
  function makeMilky(){
    const c=document.createElement('canvas'); c.width=SW; c.height=SH;
    const x2=c.getContext('2d');
    const ang=-.42, mcx=SW*.5, mcy=SH*.42, len=Math.hypot(SW,SH)*1.15;
    const dx=Math.cos(ang), dy=Math.sin(ang);
    for(let i=0;i<70;i++){
      const t=(Math.random()-.5)*len, off=gauss()*SH*.06;
      const px=mcx+dx*t-dy*off, py=mcy+dy*t+dx*off;
      const rad=(30+Math.random()*90)*DPR;
      const g=x2.createRadialGradient(px,py,0,px,py,rad);
      const a=.018+Math.random()*.032;
      g.addColorStop(0,`rgba(190,205,235,${a.toFixed(3)})`);
      g.addColorStop(1,'rgba(0,0,0,0)');
      x2.fillStyle=g; x2.beginPath(); x2.arc(px,py,rad,0,6.283); x2.fill();
    }
    const n=Math.round(SW*SH/(2600*DPR*DPR));
    for(let i=0;i<n;i++){
      const t=(Math.random()-.5)*len, off=gauss()*SH*.075;
      const px=mcx+dx*t-dy*off, py=mcy+dy*t+dx*off;
      if(px<0||px>SW||py<0||py>SH) continue;
      const r=(Math.pow(Math.random(),2.6)*1.1+.3)*DPR;
      const col=starColor(Math.random());
      x2.fillStyle=`rgba(${col[0]},${col[1]},${col[2]},${(.1+Math.random()*.38).toFixed(3)})`;
      x2.beginPath(); x2.arc(px,py,r,0,6.283); x2.fill();
    }
    return c;
  }
  function makeGalaxy(size,tint){
    const c=document.createElement('canvas'); c.width=c.height=size*2;
    const x2=c.getContext('2d'); const gx=size, gy=size;
    let g=x2.createRadialGradient(gx,gy,0,gx,gy,size*.22);
    g.addColorStop(0,'rgba(255,250,235,.95)');
    g.addColorStop(.4,`rgba(${tint[0]},${tint[1]},${tint[2]},.35)`);
    g.addColorStop(1,'rgba(0,0,0,0)');
    x2.fillStyle=g; x2.beginPath(); x2.arc(gx,gy,size*.22,0,6.283); x2.fill();
    for(let arm=0;arm<2;arm++){
      const a0=arm*Math.PI;
      for(let i=0;i<420;i++){
        const t=i/420*3.1*Math.PI;
        const r=size*.07*Math.exp(.155*t*2);
        if(r>size*.96) break;
        const jit=gauss()*size*.028*(r/size+.35);
        const px=gx+Math.cos(t+a0)*(r+jit);
        const py=gy+Math.sin(t+a0)*(r+jit)*.55;
        const fade=(1-r/size);
        const white=Math.random()<.4;
        const cr=white?255:tint[0], cg=white?250:tint[1], cb=white?240:tint[2];
        x2.fillStyle=`rgba(${cr},${cg},${cb},${(fade*.22*(0.5+Math.random()*.8)).toFixed(3)})`;
        const rr=(Math.random()*1.3+.5)*DPR*(size/(90*DPR));
        x2.beginPath(); x2.arc(px,py,rr,0,6.283); x2.fill();
      }
    }
    return c;
  }
  function buildSky(){
    SW=sky.width=Math.floor(innerWidth*1.06*DPR); SH=sky.height=Math.floor(innerHeight*1.06*DPR);
    const area=innerWidth*innerHeight;
    const k=innerWidth<=980?.55:1;
    lNeb=makeNebula(); lMilky=makeMilky();
    lFar=makeStars(Math.round(clamp(area/1500,500,1500)*k),1.0,.02);
    lMid=makeStars(Math.round(clamp(area/3200,250,700)*k),1.6,.05);
    lNear=makeStars(Math.round(clamp(area/9000,90,260)*k),2.3,.12);
    galx=[ {sp:makeGalaxy(Math.round(95*DPR),[150,170,220]), x:.14,y:.22, rot:.4, spd:.000010},
           {sp:makeGalaxy(Math.round(62*DPR),[215,175,145]), x:.80,y:.66, rot:-.6, spd:-.000013},
           {sp:makeGalaxy(Math.round(46*DPR),[175,150,215]), x:.70,y:.12, rot:.9, spd:.000016} ];
    twinks=[]; const nT=Math.round(110*k);
    for(let i=0;i<nT;i++) twinks.push({x:Math.random()*SW,y:Math.random()*SH,r:(Math.random()*1.4+.6)*DPR,ph:rnd(0,6.28),sp:rnd(.6,2.2),c:starColor(Math.random())});
    meteors=[]; nextMeteor=0; sats=[]; nextSat=0; rockets=[]; nextRocket=0;
  }
  function renderSky(time,p,nx,ny){
    sctx.clearRect(0,0,SW,SH);
    const drift=Math.sin(time*.00003)*14*DPR;
    const py=p*30*DPR;
    sctx.drawImage(lNeb,  nx*-4*DPR+drift*.2,  ny*-3*DPR - py*.15);
    sctx.drawImage(lMilky,nx*-6*DPR+drift*.3,  ny*-5*DPR - py*.25);
    sctx.drawImage(lFar,  nx*-8*DPR+drift*.45, ny*-6*DPR - py*.4);
    sctx.drawImage(lMid,  nx*-14*DPR+drift*.7, ny*-10*DPR - py*.65);
    sctx.drawImage(lNear, nx*-22*DPR+drift,    ny*-16*DPR - py);
    for(const G of galx){
      sctx.save();
      sctx.translate(G.x*SW + nx*-10*DPR, G.y*SH + ny*-8*DPR - py*.5);
      sctx.rotate(G.rot + time*G.spd);
      sctx.globalAlpha=.85;
      sctx.drawImage(G.sp, -G.sp.width/2, -G.sp.height/2);
      sctx.restore();
    }
    sctx.globalAlpha=1;
    for(const T of twinks){
      const a=.2+.8*Math.pow(Math.sin(time*.001*T.sp+T.ph)*.5+.5,2);
      sctx.fillStyle=`rgba(${T.c[0]},${T.c[1]},${T.c[2]},${a.toFixed(3)})`;
      sctx.beginPath(); sctx.arc(T.x + nx*-14*DPR, T.y + ny*-10*DPR - py*.6, T.r,0,6.283); sctx.fill();
    }
    if(time>nextMeteor){
      meteors.push({x:Math.random()*SW*.8+SW*.1, y:Math.random()*SH*.3,
        vx:(4+Math.random()*7)*DPR*(Math.random()<.5?-1:1), vy:(2.5+Math.random()*4)*DPR, life:1});
      nextMeteor=time+2200+Math.random()*4200;
    }
    for(let i=meteors.length-1;i>=0;i--){
      const M=meteors[i]; M.x+=M.vx; M.y+=M.vy; M.life-=.016;
      if(M.life<=0){ meteors.splice(i,1); continue; }
      const tx=M.x-M.vx*9, tyy=M.y-M.vy*9;
      const g=sctx.createLinearGradient(M.x,M.y,tx,tyy);
      g.addColorStop(0,`rgba(255,255,255,${(.85*M.life).toFixed(3)})`);
      g.addColorStop(1,'rgba(255,255,255,0)');
      sctx.strokeStyle=g; sctx.lineWidth=1.6*DPR;
      sctx.beginPath(); sctx.moveTo(M.x,M.y); sctx.lineTo(tx,tyy); sctx.stroke();
    }
    // satélites Starlink: trenes de puntos cruzando lento y en línea recta
    if(time>nextSat){
      const fromLeft=Math.random()<.5;
      const speed=(0.9+Math.random()*0.9)*DPR;
      const ang=(Math.random()*.5-.25) + (fromLeft?0:Math.PI);
      const y0=SH*(0.08+Math.random()*0.7);
      sats.push({
        x: fromLeft? -30*DPR : SW+30*DPR, y: y0,
        vx: Math.cos(ang)*speed, vy: Math.sin(ang)*speed*.6,
        n: Math.random()<.35 ? 1 : 4+Math.floor(Math.random()*4),
        gap:(15+Math.random()*8)*DPR, ph:Math.random()*6.28, dist:0,
        total: SW+120*DPR
      });
      nextSat=time+8000+Math.random()*12000;
    }
    for(let i=sats.length-1;i>=0;i--){
      const S=sats[i];
      S.x+=S.vx; S.y+=S.vy; S.dist+=Math.abs(S.vx);
      const trainLen=S.gap*S.n;
      if(S.dist>S.total+trainLen){ sats.splice(i,1); continue; }
      const t=clamp(S.dist/S.total,0,1);
      const fade=Math.min(1,Math.sin(Math.PI*t)*1.6);
      const ux=-S.vx/Math.hypot(S.vx,S.vy||.001), uy=-(S.vy||0)/Math.hypot(S.vx,S.vy||.001);
      for(let k2=0;k2<S.n;k2++){
        const px=S.x+ux*S.gap*k2, py=S.y+uy*S.gap*k2;
        if(px<-20||px>SW+20||py<-20||py>SH+20) continue;
        const blink=.75+.25*Math.sin(time*.004+S.ph+k2*1.3);
        const a=(fade*blink*.8);
        const g2=sctx.createRadialGradient(px,py,0,px,py,4*DPR);
        g2.addColorStop(0,`rgba(230,240,255,${a.toFixed(3)})`);
        g2.addColorStop(1,'rgba(230,240,255,0)');
        sctx.fillStyle=g2; sctx.beginPath(); sctx.arc(px,py,4*DPR,0,6.283); sctx.fill();
        sctx.fillStyle=`rgba(240,246,255,${a.toFixed(3)})`;
        sctx.beginPath(); sctx.arc(px,py,1.1*DPR,0,6.283); sctx.fill();
      }
    }
    renderRockets(time);
  }

  /* --- COHETES: despegan desde la base y suben --- */
  function spawnRocket(){
    const x=SW*(0.12+Math.random()*0.76);
    const R={ x, y:SH+10*DPR, vy:0.25*DPR, lean:(Math.random()-.5)*0.30*DPR,
      size:(0.85+Math.random()*0.5), smoke:[], t:0, ground:[] };
    for(let i=0;i<14;i++){
      R.ground.push({ x:x+gauss()*16*DPR, y:SH-2*DPR+gauss()*5*DPR,
        vx:(Math.random()-.5)*0.9*DPR, vy:-(0.05+Math.random()*0.2)*DPR,
        r:(7+Math.random()*13)*DPR, a:.30+Math.random()*.22 });
    }
    rockets.push(R);
  }
  function puff(p,warm){
    const g=sctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
    const c=warm?'255,214,158':'214,220,232';
    g.addColorStop(0,`rgba(${c},${(p.a*.8).toFixed(3)})`);
    g.addColorStop(.55,`rgba(${c},${(p.a*.3).toFixed(3)})`);
    g.addColorStop(1,'rgba(0,0,0,0)');
    sctx.fillStyle=g; sctx.beginPath(); sctx.arc(p.x,p.y,p.r,0,6.283); sctx.fill();
  }
  function renderRockets(time){
    if(time>nextRocket){ spawnRocket(); nextRocket=time+14000+Math.random()*16000; }
    for(let i=rockets.length-1;i>=0;i--){
      const R=rockets[i];
      R.t++;
      R.vy=Math.min(R.vy+0.0275*DPR, 3.5*DPR);
      R.y-=R.vy; R.x+=R.lean*Math.min(1,R.t/180);
      const s=R.size*DPR;

      // humo del despegue
      for(let k=R.ground.length-1;k>=0;k--){
        const p=R.ground[k];
        p.x+=p.vx; p.y+=p.vy; p.r+=0.55*DPR; p.a*=0.982;
        if(p.a<0.012){ R.ground.splice(k,1); continue; }
        puff(p, p.y>SH-60*DPR);
      }
      // estela
      if(R.t%2===0 && R.y>-60*DPR){
        R.smoke.push({ x:R.x+gauss()*2.5*DPR, y:R.y+11*s,
          vx:(Math.random()-.5)*0.35*DPR, vy:0.25*DPR,
          r:(3.5+Math.random()*3.5)*DPR, a:.34 });
      }
      for(let k=R.smoke.length-1;k>=0;k--){
        const p=R.smoke[k];
        p.x+=p.vx; p.y+=p.vy; p.r+=0.42*DPR; p.a*=0.965;
        if(p.a<0.012){ R.smoke.splice(k,1); continue; }
        puff(p,false);
      }

      if(R.y<-90*DPR && !R.smoke.length && !R.ground.length){ rockets.splice(i,1); continue; }
      if(R.y<-90*DPR) continue;

      // llama
      const flick=0.82+0.18*Math.sin(time*0.05+R.t*0.7);
      const len=(16+R.vy*6.8)*flick;
      const gy=R.y+6*s;
      const halo=sctx.createRadialGradient(R.x,gy,0,R.x,gy,len*1.5);
      halo.addColorStop(0,'rgba(255,238,200,.55)');
      halo.addColorStop(.35,'rgba(255,178,90,.20)');
      halo.addColorStop(1,'rgba(255,150,60,0)');
      sctx.fillStyle=halo; sctx.beginPath(); sctx.arc(R.x,gy,len*1.5,0,6.283); sctx.fill();

      const fl=sctx.createLinearGradient(R.x,gy,R.x,gy+len);
      fl.addColorStop(0,'rgba(255,255,250,.98)');
      fl.addColorStop(.3,'rgba(255,226,160,.85)');
      fl.addColorStop(.7,'rgba(255,150,60,.45)');
      fl.addColorStop(1,'rgba(255,110,40,0)');
      sctx.fillStyle=fl;
      sctx.beginPath();
      sctx.moveTo(R.x-2.1*s,gy);
      sctx.quadraticCurveTo(R.x,gy+len*.65,R.x,gy+len);
      sctx.quadraticCurveTo(R.x,gy+len*.65,R.x+2.1*s,gy);
      sctx.closePath(); sctx.fill();

      // cuerpo
      sctx.fillStyle='rgba(226,230,238,.95)';
      sctx.beginPath();
      sctx.moveTo(R.x,R.y-9*s);
      sctx.lineTo(R.x+1.9*s,R.y-3.5*s);
      sctx.lineTo(R.x+1.9*s,R.y+6*s);
      sctx.lineTo(R.x-1.9*s,R.y+6*s);
      sctx.lineTo(R.x-1.9*s,R.y-3.5*s);
      sctx.closePath(); sctx.fill();
      sctx.fillStyle='rgba(120,128,142,.9)';
      sctx.fillRect(R.x-1.9*s,R.y+1.6*s,3.8*s,1.5*s);
      sctx.fillStyle='rgba(255,232,190,.55)';
      sctx.fillRect(R.x-1.9*s,R.y-3.5*s,1.1*s,9.5*s);
    }
  }

  function shapeNeurons(n,w,h){
    const pts=[]; const cx=w*0.5, cy=h*0.5, R=Math.min(w,h)*0.46;
    const hubs=[]; const NH=9;
    for(let i=0;i<NH;i++){ const a=i/NH*Math.PI*2+rnd(-.3,.3); const r=R*rnd(.3,.95);
      hubs.push([cx+Math.cos(a)*r*1.25, cy+Math.sin(a)*r*.8]); }
    hubs.push([cx,cy]);
    for(let i=0;i<n;i++){ const hb=hubs[i%hubs.length];
      pts.push([hb[0]+gauss()*R*.3, hb[1]+gauss()*R*.26]); }
    return pts;
  }
  function shapeSpine(n,w,h){
    const pts=[]; const cx=w*0.5;
    const top=h*0.04, bot=h*0.96;
    for(let i=0;i<n;i++){
      const r=Math.random();
      if(r<0.45){ const t=Math.random();
        const x=cx+Math.sin(t*Math.PI*2.2)*w*0.09;
        pts.push([x+gauss()*9, top+(bot-top)*t+gauss()*9]);
      }else if(r<0.9){ const seg=Math.floor(Math.random()*19); const t=seg/18;
        const x=cx+Math.sin(t*Math.PI*2.2)*w*0.09;
        const y=top+(bot-top)*t;
        const side=Math.random()<0.5?-1:1;
        const len=(Math.min(w,h)*0.085)*(1+Math.sin(t*Math.PI)*0.9);
        pts.push([x+side*len*(0.3+Math.random()*0.7), y+gauss()*7]);
      }else{ const t=Math.random();
        const x=cx+Math.sin(t*Math.PI*2.2)*w*0.09;
        pts.push([x+gauss()*w*0.16, top+(bot-top)*t+gauss()*22]);
      }
    }
    return pts;
  }
  function shapeVillage(n,w,h){
    const pts=[]; const cx=w*0.5, cy=h*0.5, R=Math.min(w,h)*0.42;
    const NH=8; const houses=[];
    for(let i=0;i<NH;i++){ const a=i/NH*Math.PI*2-Math.PI/2;
      houses.push([cx+Math.cos(a)*R*1.15, cy+Math.sin(a)*R*0.85]); }
    for(let i=0;i<n;i++){
      const r=Math.random();
      if(r<0.16){ const a=rnd(0,Math.PI*2), rr=Math.sqrt(Math.random())*R*0.17;
        pts.push([cx+Math.cos(a)*rr, cy+Math.sin(a)*rr*0.85]);
      }else if(r<0.60){ const hs=houses[Math.floor(Math.random()*NH)];
        const a=rnd(0,Math.PI*2), rr=R*0.15*Math.sqrt(Math.random());
        pts.push([hs[0]+Math.cos(a)*rr, hs[1]+Math.sin(a)*rr*0.9]);
      }else if(r<0.86){ const hs=houses[Math.floor(Math.random()*NH)]; const t=Math.random();
        pts.push([lerp(cx,hs[0],t)+gauss()*7, lerp(cy,hs[1],t)+gauss()*7]);
      }else{ const a=rnd(0,Math.PI*2); const rr=R*1.38;
        pts.push([cx+Math.cos(a)*rr+gauss()*6, cy+Math.sin(a)*rr*0.8+gauss()*6]); }
    }
    return pts;
  }

  function buildShapes(){
    W=cvs.width=Math.floor(innerWidth*1.06*DPR); H=cvs.height=Math.floor(innerHeight*1.06*DPR);
    const area=innerWidth*innerHeight;
    N=Math.round(clamp(area/2100, 260, 760));
    if(innerWidth<=980) N=Math.round(N*0.5);
    linkDist=Math.min(innerWidth,innerHeight)*0.09*DPR;
    shapes=[ shapeNeurons(N,W,H), shapeSpine(N,W,H), shapeVillage(N,W,H) ];
    if(parts.length!==N){
      parts=[];
      for(let i=0;i<N;i++) parts.push({ x:shapes[0][i][0], y:shapes[0][i][1], vx:0, vy:0,
        ph:rnd(0,Math.PI*2), sp:rnd(0.4,1.1), sz:rnd(0.9,2.4) });
      dust=[];
      for(let i=0;i<130;i++) dust.push({ x:rnd(0,W), y:rnd(0,H), s:rnd(.5,1.4), v:rnd(.08,.3), a:rnd(.05,.16) });
    }
  }

  /* cámara del organismo: rota y respira por escena */
  const cam={ rot:0, rotT:0, scale:1, scaleT:1 };
  const ROTS=[0,-.05,.06,-.06,.06,-.05,.05,.04,0];

  let morphT=0, morphTarget=0;
  let colNow=[...PHASES[0].color];
  const phaseName=document.getElementById('phaseName');
  let lastPhase=0;

  function organism(time,mouseX,mouseY,mouseOn){
    morphT=lerp(morphT,morphTarget,0.055);
    cam.rot=lerp(cam.rot,cam.rotT,0.04);
    cam.scale=lerp(cam.scale,cam.scaleT,0.05);
    cam.scaleT=lerp(cam.scaleT,1,0.02);

    const k=morphT<1?0:1;
    const f=clamp(morphT-k,0,1);
    const A=shapes[k], B=shapes[Math.min(k+1,2)];
    const ca=PHASES[k].color, cb=PHASES[Math.min(k+1,2)].color;
    for(let j=0;j<3;j++) colNow[j]=Math.round(lerp(ca[j],cb[j],f));

    ctx.clearRect(0,0,W,H);
    const cx=W/2, cy=H/2;
    ctx.save();
    ctx.translate(cx,cy); ctx.rotate(cam.rot); ctx.scale(cam.scale,cam.scale); ctx.translate(-cx,-cy);

    // mouse en coords del organismo (inversa de la cámara)
    const cosr=Math.cos(-cam.rot), sinr=Math.sin(-cam.rot);
    let mxo=(mouseX-cx)/cam.scale, myo=(mouseY-cy)/cam.scale;
    const mrx=mxo*cosr-myo*sinr+cx, mry=mxo*sinr+myo*cosr+cy;
    const mR=150*DPR;

    for(let i=0;i<N;i++){
      const P=parts[i];
      const tx=lerp(A[i][0],B[i][0],f), ty=lerp(A[i][1],B[i][1],f);
      const wob=Math.sin(time*0.0008*P.sp+P.ph)*7*DPR;
      const dx=tx+wob-P.x, dy=ty+Math.cos(time*0.0007*P.sp+P.ph)*6*DPR-P.y;
      P.vx=P.vx*0.87+dx*0.012; P.vy=P.vy*0.87+dy*0.012;
      if(mouseOn){
        const mdx=P.x-mrx, mdy=P.y-mry, md=Math.hypot(mdx,mdy);
        if(md<mR && md>0.01){ const fr=(1-md/mR)*2.6*DPR; P.vx+=mdx/md*fr; P.vy+=mdy/md*fr; }
      }
      P.x+=P.vx; P.y+=P.vy;
    }

    const cell=linkDist, cols=Math.ceil(W/cell)+2, grid=new Map();
    for(let i=0;i<N;i++){ const gx=(parts[i].x/cell)|0, gy=(parts[i].y/cell)|0, key=gx+gy*cols;
      (grid.get(key)||grid.set(key,[]).get(key)).push(i); }
    const [r,g,b]=colNow;
    ctx.lineWidth=1.1*DPR;
    for(let i=0;i<N;i++){
      const P=parts[i]; const gx=(P.x/cell)|0, gy=(P.y/cell)|0;
      let links=0;
      for(let ox=0;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){
        if(ox===0&&oy<0)continue;
        const bkt=grid.get((gx+ox)+(gy+oy)*cols); if(!bkt)continue;
        for(const j of bkt){ if(j<=i&&ox===0&&oy===0)continue;
          const Q=parts[j]; const dx=P.x-Q.x, dy=P.y-Q.y; const d2=dx*dx+dy*dy;
          if(d2<linkDist*linkDist){
            const d=Math.sqrt(d2); const a=(1-d/linkDist)*0.42;
            ctx.strokeStyle=`rgba(${r},${g},${b},${a.toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(P.x,P.y); ctx.lineTo(Q.x,Q.y); ctx.stroke();
            if(++links>4) break;
          }
        }
        if(links>4) break;
      }
    }
    for(let i=0;i<N;i++){
      const P=parts[i];
      const tw=0.55+0.45*Math.sin(time*0.002*P.sp+P.ph);
      ctx.fillStyle=`rgba(${r},${g},${b},${(0.55*tw+0.3).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(P.x,P.y,P.sz*DPR*(0.8+tw*0.45),0,6.283); ctx.fill();
    }
    // pulsos sinápticos
    for(let s=0;s<16;s++){
      const i=(s*97)%N, j=(s*211+37)%N;
      const tt=(time*0.00025+s/16)%1;
      const dd=Math.hypot(parts[i].x-parts[j].x,parts[i].y-parts[j].y);
      if(dd<linkDist*3.4){
        const x=lerp(parts[i].x,parts[j].x,tt), y=lerp(parts[i].y,parts[j].y,tt);
        ctx.fillStyle=`rgba(${r},${g},${b},${(0.9*(1-Math.abs(tt-0.5)*2)).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x,y,2.4*DPR,0,6.283); ctx.fill();
      }
    }
    ctx.restore();

    // polvo ambiental (fuera de cámara, capa de profundidad)
    for(const D of dust){
      D.y-=D.v*DPR; if(D.y<-4) { D.y=H+4; D.x=rnd(0,W); }
      ctx.fillStyle=`rgba(${r},${g},${b},${D.a})`;
      ctx.beginPath(); ctx.arc(D.x,D.y,D.s*DPR,0,6.283); ctx.fill();
    }
    // ondas expansivas de transición
    for(let i=waves.length-1;i>=0;i--){
      const w0=waves[i];
      w0.r+=22*DPR; w0.a*=0.94;
      if(w0.a<0.01){ waves.splice(i,1); continue; }
      ctx.strokeStyle=`rgba(${r},${g},${b},${w0.a.toFixed(3)})`;
      ctx.lineWidth=1.6*DPR;
      ctx.beginPath(); ctx.arc(w0.x,w0.y,w0.r,0,6.283); ctx.stroke();
    }
  }

  /* ============================================================
     MOTOR DE ESCENAS
     ============================================================ */
  const stage=document.getElementById('stagewrap');
  const sweep=document.getElementById('sweep');
  const pct=document.getElementById('pct'), ptot=document.getElementById('ptot'),
        dlab=document.getElementById('dlab'), bar=document.getElementById('bar');
  const snLinks=[...document.querySelectorAll('#scenenav a')];


  const EASE='cubic-bezier(.16,1,.3,1)', DUR=880, LOCK=340;

  function setScene(el,tf,op,blur,instant){
    el.style.transition=instant?'none':`transform ${DUR}ms ${EASE}, opacity ${DUR*0.82}ms ${EASE}, filter ${DUR*0.82}ms ${EASE}`;
    el.style.transform=tf; el.style.opacity=op; el.style.filter=`blur(${blur}px)`;
  }
  function playReveals(scene){
    const ws=scene.querySelectorAll('.htitle .w');
    ws.forEach(w=>{ w.style.transition='none'; w.style.transform='translateY(115%)'; });
    const rs=scene.querySelectorAll('.reveal');
    rs.forEach(el=>{ el.classList.remove('in'); });
    void scene.offsetWidth;
    ws.forEach((w,i)=>{ w.style.transition=`transform .9s ${EASE} ${i*0.07+0.25}s`; w.style.transform='translateY(0)'; });
    rs.forEach((el,i)=>{ el.style.transitionDelay=(i*70+250)+'ms'; el.classList.add('in'); });
  }
  function updateHud(){
    document.documentElement.classList.toggle('pull-ok', idx===0);
    const sc=scenes[idx];
    ptot.textContent='/'+('0'+TOT).slice(-2);
    pct.textContent=('0'+(idx+1)).slice(-2);
    dlab.textContent=sc.dataset.name||'';
    phaseName.textContent=sc.dataset.word||'';
    bar.style.width=(idx/(TOT-1)*100)+'%';
    const cid=sc.id;
    snLinks.forEach(a=>{
      const t=a.getAttribute('href').slice(1);
      const on = cid===t || (t==='precios'&&cid.startsWith('precio')) || (t==='serv-1'&&cid.startsWith('serv-'));
      a.classList.toggle('active',on);
    });
    morphTarget=parseFloat(sc.dataset.org)||0;
    cam.rotT=ROTS[idx%ROTS.length]||0;
  }
  function go(n,instant){
    n=clamp(n,0,TOT-1);
    if(deck===false){ // modo scroll: saltar al ancla
      scenes[n].scrollIntoView({behavior:instant?'auto':'smooth'}); return;
    }
    if(busy||n===idx) return;
    busy=true;
    const dir=n>idx?1:-1;
    const cur=scenes[idx], nxt=scenes[n];

    // organismo reacciona: ráfaga + onda + zoom de cámara
    for(const P of parts){ P.vx+=gauss()*5*DPR; P.vy+=gauss()*5*DPR; }
    waves.push({x:W/2, y:H/2, r:40*DPR, a:0.4});
    cam.scaleT=1.07;
    sweep.classList.remove('go'); void sweep.offsetWidth; sweep.classList.add('go');

    if(nxt._hideT){ clearTimeout(nxt._hideT); nxt._hideT=null; }
    nxt.classList.add('on');
    // al volver hacia atrás a una sección larga, se entra por su final
    nxt.scrollTop = dir<0 ? nxt.scrollHeight : 0;
    setScene(nxt, `translateY(${dir*62}vh) translateZ(-620px) rotateX(${-dir*17}deg) scale(.92)`, 0, 14, true);
    void nxt.offsetWidth;
    setScene(nxt, 'translateY(0) translateZ(0) rotateX(0) scale(1)', 1, 0, false);
    setScene(cur, `translateY(${-dir*46}vh) translateZ(-480px) rotateX(${dir*14}deg) scale(.94)`, 0, 12, false);
    playReveals(nxt);
    idx=n; updateHud();
    if(cur._hideT) clearTimeout(cur._hideT);
    cur._hideT=setTimeout(()=>{ if(scenes[idx]!==cur) cur.classList.remove('on'); cur._hideT=null; }, DUR+60);
    // desbloqueo rápido: se puede encadenar escenas sin esperar el final de la animación
    setTimeout(()=>{ busy=false; }, LOCK);
  }

  /* input: rueda / teclado / touch — siempre una escena completa */
  let acc=0, lastWheel=0, lastAbs=0, wheelArmed=true;
  // ¿la sección actual todavía tiene contenido para recorrer en esa dirección?
  function canScrollInside(el,dir){
    if(!el || el.scrollHeight-el.clientHeight<=4) return false;
    return dir>0 ? el.scrollTop+el.clientHeight < el.scrollHeight-2 : el.scrollTop>2;
  }
  addEventListener('wheel',e=>{
    if(!deck || menu.classList.contains('open')) return;
    const dir=Math.sign(e.deltaY); if(!dir) return;
    const now=performance.now(), a=Math.abs(e.deltaY), gap=now-lastWheel;
    if(canScrollInside(scenes[idx],dir)){ wheelArmed=false; lastWheel=now; lastAbs=a; return; }
    e.preventDefault();
    // tras un salto se ignora la inercia del trackpad hasta que el gesto termina
    // (pausa o un impulso nuevo); la rueda del mouse, de pasos iguales, sigue respondiendo al instante
    if(!wheelArmed && (gap>160 || a>lastAbs*1.4+4 || (a>=50 && a===lastAbs))) wheelArmed=true;
    lastWheel=now; lastAbs=a;
    if(busy||!wheelArmed){ acc=0; return; }
    if(gap>180) acc=0;
    acc+=e.deltaY;
    if(Math.abs(acc)>60){ go(idx+(acc>0?1:-1)); acc=0; wheelArmed=false; }
  },{passive:false});
  addEventListener('keydown',e=>{
    if(e.key==='Escape' && menu.classList.contains('open')){ setMenu(false); return; }
    if(!deck || menu.classList.contains('open')) return;
    const t=e.target, onCtl=t && (t.tagName==='A'||t.tagName==='BUTTON');
    let dir=0;
    if(e.key==='ArrowDown'||e.key==='PageDown'||(e.key===' '&&!onCtl&&!e.shiftKey)) dir=1;
    if(e.key==='ArrowUp'||e.key==='PageUp'||(e.key===' '&&!onCtl&&e.shiftKey)) dir=-1;
    if(dir){
      e.preventDefault();
      const el=scenes[idx];
      if(canScrollInside(el,dir)) el.scrollBy({top:dir*el.clientHeight*.75,behavior:'smooth'});
      else go(idx+dir);
    }
    if(e.key==='Home'){ e.preventDefault(); go(0); }
    if(e.key==='End'){ e.preventDefault(); go(TOT-1); }
  });
  let ty0=null, tx0=null, tTop=true, tBot=true;
  addEventListener('touchstart',e=>{
    ty0=e.touches[0].clientY; tx0=e.touches[0].clientX;
    // se registra si la sección estaba en su borde AL EMPEZAR el gesto,
    // para no saltar de sección en el mismo deslizamiento que llegó al final
    const el=scenes[idx];
    if(el){ tTop=el.scrollTop<=2; tBot=el.scrollTop+el.clientHeight>=el.scrollHeight-2; }
  },{passive:true});
  addEventListener('touchend',e=>{
    if(!deck||ty0===null) return;
    const dy=ty0-e.changedTouches[0].clientY;
    const dx=tx0-e.changedTouches[0].clientX;
    ty0=null; tx0=null;
    if(menu.classList.contains('open')) return;
    if(Math.abs(dy)<55 || Math.abs(dx)>Math.abs(dy)) return;   // gesto horizontal: es el carrusel
    const el=scenes[idx];
    if(el.scrollHeight-el.clientHeight>4){                     // sección más alta que la pantalla
      if(dy>0 && !tBot) return;                                // todavía quedaba contenido abajo
      if(dy<0 && !tTop) return;
    }
    go(idx+(dy>0?1:-1));
  },{passive:true});

  function indexOfTarget(id){
    let i=scenes.findIndex(s=>s.id===id);
    if(i<0) i=scenes.findIndex(s=>s.id.startsWith(id.replace(/-\d+$/,'')));
    if(i<0 && id==='precios') i=scenes.findIndex(s=>s.id.startsWith('precio'));
    return i;
  }
  document.querySelectorAll('[data-go]').forEach(a=>a.addEventListener('click',e=>{
    if(deck){
      const i=indexOfTarget(a.getAttribute('href').slice(1));
      if(i>=0){ e.preventDefault(); go(i); }
    }
    setMenu(false);
  }));

  /* modo según viewport */
  function setMode(){
    // hasta 1180px (tablets horizontales, laptops chicas) cada tarjeta de precio es su propia escena
    const want=!reduce, wantSplit=innerWidth<=1180;
    if(want===deck && wantSplit===splitState) return;
    splitState=wantSplit; deck=want;
    document.body.classList.toggle('deck',deck);
    splitPricing(wantSplit);
    idx=Math.max(0,Math.min(idx,TOT-1));
    if(deck){ document.documentElement.scrollTop=0; document.body.scrollTop=0; stage.scrollTop=0; }
    scenes.forEach((s,i)=>{
      s.classList.toggle('on', !deck||i===idx);
      if(deck){ setScene(s, i===idx?'none':'translateY(62vh)', i===idx?1:0, 0, true); }
      else{ s.style.transform=''; s.style.opacity=''; s.style.filter=''; s.style.transition=''; }
    });
    if(deck){ updateHud(); playReveals(scenes[idx]); }
  }

  /* Seguimiento del mouse/tacto: alimenta el organismo y el parallax (sin cursor personalizado) */
  let mx=vw/2,my=vh/2, nmx=0,nmy=0, mouseOn=false;
  addEventListener('mousemove',e=>{ mx=e.clientX; my=e.clientY; mouseOn=true;
    nmx=(mx/vw-0.5)*2; nmy=(my/vh-0.5)*2; });
  addEventListener('mouseleave',()=>mouseOn=false);
  // el organismo también reacciona al tacto
  addEventListener('touchmove',e=>{ const t=e.touches[0]; mx=t.clientX; my=t.clientY;
    nmx=(mx/vw-0.5)*2; nmy=(my/vh-0.5)*2; mouseOn=true; },{passive:true});
  addEventListener('touchstart',e=>{ const t=e.touches[0]; mx=t.clientX; my=t.clientY; mouseOn=true; },{passive:true});
  document.addEventListener('touchend',()=>{ setTimeout(()=>{ mouseOn=false; },300); },{passive:true});

  /* NAV mobile */
  const burger=document.getElementById('burger'), menu=document.getElementById('menu');
  const navEl=document.querySelector('nav');
  function setMenu(open){
    burger.classList.toggle('on',open);
    menu.classList.toggle('open',open);
    navEl.classList.toggle('menu-open',open);
  }
  burger.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
  document.getElementById('menuX').addEventListener('click',()=>setMenu(false));
  menu.addEventListener('click',e=>{ if(!e.target.closest('a')) setMenu(false); });

  /* REVEAL para modo scroll (mobile) */
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); } }),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  addEventListener('load',()=>{ if(!deck) document.querySelectorAll('.htitle .w').forEach((w,i)=>{
    w.style.transition=`transform .9s ${EASE} ${i*0.08+0.15}s`; w.style.transform='translateY(0)'; }); });

  /* FONDO */
  const bgStops=[[0,[10,12,16]],[0.3,[16,15,13]],[0.55,[19,16,11]],[0.8,[12,16,11]],[1,[10,15,10]]];
  function sample(st,t){ for(let i=0;i<st.length-1;i++){ const[a,ca]=st[i],[b,cb]=st[i+1]; if(t>=a&&t<=b){ const k=(t-a)/(b-a||1); return ca.map((v,j)=>Math.round(lerp(v,cb[j],k))); } } return st[st.length-1][1]; }
  const bg=document.getElementById('bg');

  /* TILT + MAGNETIC + PAY */
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('mousemove',e=>{ if(vw<=980)return; const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5;
      card.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*8}deg)`; });
    card.addEventListener('mouseleave',()=>card.style.transform='');
  });
  document.querySelectorAll('.mbtn,.pay').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{ const r=btn.getBoundingClientRect(); btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*0.18}px,${(e.clientY-r.top-r.height/2)*0.25}px)`; });
    btn.addEventListener('mouseleave',()=>btn.style.transform='');
  });
  /* Si la foto no carga, queda el recuadro de respaldo */
  const pImg=document.querySelector('#portrait img');
  if(pImg){
    const fail=()=>{ const b=pImg.closest('.about-portrait'); if(b) b.classList.add('noimg'); (pImg.closest('picture')||pImg).remove(); };
    if(pImg.complete && !pImg.naturalWidth) fail(); else pImg.addEventListener('error',fail,{once:true});
  }

  /* Aviso flotante */
  const toastEl=document.createElement('div'); toastEl.className='toast'; document.body.appendChild(toastEl);
  let toastT=null;
  function toast(msg){ toastEl.textContent=msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT=setTimeout(()=>toastEl.classList.remove('show'),3600); }

  /* El botón de mail: si no hay cliente de correo configurado, el navegador ignora
     el mailto sin avisar. Copiamos la dirección y abrimos Gmail como respaldo. */
  const MAIL='contacto@rodrigobuono.com';
  const GMAIL='https://mail.google.com/mail/?view=cm&fs=1&to='+MAIL
    +'&su='+encodeURIComponent('Consulta desde la web')
    +'&body='+encodeURIComponent('Hola Rodrigo,\n\nte escribo porque...');
  document.querySelectorAll('a[href^="mailto:"]').forEach(a=>a.addEventListener('click',()=>{
    if(navigator.clipboard) navigator.clipboard.writeText(MAIL).catch(()=>{});
    let left=false;
    const mark=()=>{ left=true; };
    addEventListener('blur',mark,{once:true});
    document.addEventListener('visibilitychange',mark,{once:true});
    setTimeout(()=>{
      removeEventListener('blur',mark);
      if(left||document.hidden||!document.hasFocus()) return;   // el correo se abrió: no tocamos nada
      toast('Dirección copiada: '+MAIL+' · abriendo Gmail…');
      setTimeout(()=>{ location.href=GMAIL; },900);
    },1500);
  }));

  document.querySelectorAll('[data-pay]').forEach(a=>a.addEventListener('click',e=>{
    if(a.getAttribute('href')==='#'){ e.preventDefault(); location.href='mailto:contacto@rodrigobuono.com?subject=Reserva: '+a.dataset.pay; }
  }));

  function measure(){ vw=innerWidth; vh=innerHeight; DPR=Math.min(devicePixelRatio||1,dprCap()); buildShapes(); buildSky(); if(reduce) renderSky(0,0,0,0); setMode(); }

  const portrait=document.getElementById('portrait');
  function tick(time){
    // fondo según progreso de escena (deck) o scroll (mobile)
    let p;
    if(deck) p=idx/(TOT-1);
    else{ const ms=Math.max(1,document.documentElement.scrollHeight-vh); p=clamp((scrollY||0)/ms,0,1);
      // morph continuo en mobile
      morphTarget=p<0.35? p/0.35 : 1+(p-0.35)/0.65; }
    const c=sample(bgStops,p); bg.style.background=`rgb(${c[0]},${c[1]},${c[2]})`;
    if(!deck) bar.style.width=(p*100)+'%';

    if(!reduce) renderSky(time,p,nmx,nmy);
    if(!reduce) organism(time, (mx+innerWidth*0.03)*DPR, (my+innerHeight*0.03)*DPR, mouseOn);

    // parallax sutil del lienzo con el mouse
    cvs.style.transform=`translate(${nmx*-14}px,${nmy*-11}px)`;

    if(portrait && vw>980) portrait.style.transform=`perspective(800px) rotateY(${nmx*5}deg) rotateX(${-nmy*5}deg)`;

    requestAnimationFrame(tick);
  }

  // En móvil, mostrar/ocultar la barra del navegador dispara 'resize' constantemente.
  // Reconstruir el cielo en cada uno hacía que el fondo se volviera loco: lo filtramos.
  let lastW=innerWidth, lastH=innerHeight, rzT=null;
  addEventListener('resize',()=>{
    const dw=Math.abs(innerWidth-lastW), dh=Math.abs(innerHeight-lastH);
    vw=innerWidth; vh=innerHeight;                 // el layout se actualiza siempre
    if(dw===0 && dh<160){ lastH=innerHeight; return; }  // solo se movió la barra: no tocar el cielo
    clearTimeout(rzT);
    rzT=setTimeout(()=>{ lastW=innerWidth; lastH=innerHeight; measure(); },220);
  });
  measure();
  requestAnimationFrame(tick);

  // al terminar la intro de la esclusa, el título se anima en el momento en que la web aparece
  addEventListener('intro:reveal',()=>{ if(deck) playReveals(scenes[idx]); });

  // Guardián: en modo escenas el fondo NUNCA se desplaza. Cualquier scroll del documento
  // o del contenedor (ancla, foco del teclado, extensión del navegador) se devuelve a cero.
  // Las escenas que scrollean por dentro no se tocan.
  const pin=()=>{
    if(!deck) return;
    const de=document.documentElement, b=document.body;
    if(de.scrollTop) de.scrollTop=0;
    if(b.scrollTop) b.scrollTop=0;
    if(stage.scrollTop) stage.scrollTop=0;
    if(de.scrollLeft||b.scrollLeft){ de.scrollLeft=0; b.scrollLeft=0; }
  };
  document.addEventListener('scroll',e=>{
    const t=e.target;
    if(t===document||t===document.documentElement||t===document.body||t===stage) pin();
  },true);
  addEventListener('load',pin);
  pin();

  // si se llegó con un ancla (p. ej. /#precios desde Mis cuadernos), se viaja a esa sección
  if(initialHash){
    const i=indexOfTarget(initialHash);
    if(i>0) setTimeout(()=>go(i),450);
  }
})();
