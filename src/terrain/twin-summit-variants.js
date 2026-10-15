// Approved Twin Summit Pass, with localized upper terrain and ski-face alternatives.
window.LiftCoTwinSummitVariants=(()=>{
 const source=window.LiftCoMountainMaps,base=source.create('saddle'),raw=base.height;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
 function peak(x0,x1,z0,z1){let best={x:0,z:0,y:-Infinity};for(let z=z0;z<=z1;z+=20)for(let x=x0;x<=x1;x+=20){const y=raw(x,z);if(y>best.y)best={x,z,y};}return best;}
 const west=peak(-1350,-550,-1400,-500),east=peak(550,1350,-1450,-550);
 const original=source.designs.find(d=>d.id==='saddle');
 const definitions=[
 {id:'terraces',name:'Summit Terraces',kicker:'01 / COMPACT HIGH-ALTITUDE TERRACES',description:'The selected pass with two compact summit caps and a lower shoulder below each. Broad west and east ski faces descend past the original saddle.',features:['Two gently sloping summit caps','Lower high-altitude station shoulders','Five broad, naturally rolling ski faces'],caps:[[west,-20,25,160,125,65,.025,.008],[east,0,30,160,125,55,-.018,.008],[west,100,225,170,130,0,.04,.04],[east,-85,240,165,125,0,-.025,.045]],bowls:[],faceScale:1,roll:5},
 {id:'bowls',name:'High Bowl Rims',kicker:'02 / SNOW BOWLS BELOW THE SUMMITS',description:'Open snow bowls sit just below the summits. Gentler rim terraces hold high-altitude buildings, while the bowl floors feed long, varied slopes.',features:['Two high bowls with curved headwalls','Flatter upper rims overlooking the bowls','Open bowl exits and lower ski faces'],caps:[[west,-130,80,175,125,55,.02,.015],[east,140,30,175,125,45,-.025,.015],[west,-100,310,150,115,0,.025,.025]],bowls:[[west,100,280,300,335,85],[east,-80,280,300,340,75]],faceScale:1.12,roll:7},
 {id:'balconies',name:'Ridge Balconies',kicker:'03 / STEPPED HIGH RIDGE SHELVES',description:'A sequence of upper balconies follows the mountain shoulders toward the pass. Steeper broken ridges remain behind them, with skiable fans between the shelves.',features:['Several modest high mountain balconies','Sharp ridges retained above the shelves','Alternating steep fans and easier shoulders'],caps:[[west,-55,95,210,105,68,.025,.005],[east,45,110,205,105,60,-.02,.005],[west,170,300,185,110,0,.025,.025],[east,-165,330,185,110,0,-.02,.025]],bowls:[],faceScale:.9,roll:8},
 {id:'snowfields',name:'Upper Snowfields',kicker:'04 / WIDE UPPER SLOPES & SUMMIT SHELVES',description:'Broader, gentler snowfields spread below the twin peaks. Small upper station terraces overlook roomy ski faces, rolling midslopes and the original lower valley.',features:['Roomier upper snowfields below both peaks','Small flat areas near the highest ground','Wider ski faces with gentle terrain rolls'],caps:[[west,15,65,210,155,82,.018,.012],[east,-15,75,210,155,75,-.018,.012],[west,100,280,235,160,0,.035,.04],[east,-60,300,235,160,0,-.035,.04]],bowls:[],faceScale:1.42,roll:4}
 ];
 const designs=definitions.map((d,i)=>({...original,...d,camera:[2800,2150,2850],target:[0,360,0],sites:[],summit:[west.x,west.y,west.z]}));
 function ellipse(x,z,zone){const dx=x-zone.x,dz=z-zone.z,c=Math.cos(zone.angle||0),s=Math.sin(zone.angle||0),u=(dx*c+dz*s)/zone.rx,v=(-dx*s+dz*c)/zone.rz;return{dx,dz,r:Math.hypot(u,v)};}
 function create(id){const design=designs.find(d=>d.id===id)||designs[0];
  const bowls=design.bowls.map(([p,dx,dz,rx,rz,depth])=>({x:p.x+dx,z:p.z+dz,rx,rz,depth}));
  function bowlHeight(x,z){let y=raw(x,z);for(const b of bowls){const r=ellipse(x,z,b).r;y-=b.depth*Math.exp(-r*r*2.2);}return y;}
  // Summit caps primarily cut the tips, with a limited apron fill on their lower edge.
  // Shoulder sites begin on the existing mountainside and blend over a broad apron.
  const caps=design.caps.map(([p,dx,dz,rx,rz,cut,gx,gz],i)=>{const x=p.x+dx,z=p.z+dz;return{x,z,rx,rz,y:cut>0?Math.min(p.y-cut,bowlHeight(x,z)-12):bowlHeight(x,z)-6,gx,gz,cut:cut>0,angle:i%2?.12:-.12,name:i<2?(i===0?'West summit terrace':'East summit terrace'):(i===2?'West upper shoulder':'East upper shoulder')};});
  function upperHeight(x,z){let y=bowlHeight(x,z);for(const cap of caps){const {dx,dz,r}=ellipse(x,z,cap),w=1-smooth(.57,1.55,r);if(w<=0)continue;const plane=cap.y+cap.gx*dx+cap.gz*dz,difference=plane-y;y+=w*(cap.cut?clamp(difference,-120,35):clamp(difference,-42,25));}return y;}
  // Distributed ski faces are broad pieces of mountainside, not drawn piste strips.
  const facePlans=[
   ['West upper face',west.x+90,west.z+300,165,330,.1],
   ['East upper face',east.x-60,east.z+300,170,340,-.08],
   ['West mid-mountain',-920,-40,190,360,-.16],
   ['East mid-mountain',850,40,190,350,.18],
   ['Lower rolling slopes',-170,780,235,300,.4]
  ];
  if(design.id==='bowls')facePlans.push(['Pass snow bowl',-30,-430,215,270,.05]);
  if(design.id==='balconies')facePlans.push(['East balcony fan',east.x-170,east.z+470,145,270,-.24]);
  const faces=facePlans.map(([name,x,z,rx,rz,angle],i)=>{
   rx*=design.faceScale;rz*=design.id==='snowfields'?1.12:1;
   const y=upperHeight(x,z),gy=clamp((upperHeight(x,z+rz*.6)-upperHeight(x,z-rz*.6))/(rz*1.2),-.58,-.13),gx=clamp((upperHeight(x+rx*.6,z)-upperHeight(x-rx*.6,z))/(rx*1.2),-.17,.17);
   return{name,x,z,rx,rz,angle,y,gx,gz:gy,roll:design.roll,index:i};
  });
  function height(x,z){let y=upperHeight(x,z);for(const face of faces){const {dx,dz,r}=ellipse(x,z,face),w=(1-smooth(.42,1.45,r))*.84;if(w<=0)continue;const roll=face.roll*(Math.sin(dz/105+face.index)-Math.sin(face.index))*.65+face.roll*.4*Math.sin(dx/140)*Math.sin(dz/180),plane=face.y+face.gx*dx+face.gz*dz+roll;y+=clamp(plane-y,-46,32)*w;}
   // Reapply upper shelf surfaces after ski-face shaping so their cores stay gentle.
   for(const cap of caps){const {dx,dz,r}=ellipse(x,z,cap),w=1-smooth(.52,1.25,r);if(w>0){const plane=cap.y+cap.gx*dx+cap.gz*dz;y+=w*(cap.cut?clamp(plane-y,-90,35):clamp(plane-y,-35,25));}}
   return y;
  }
  const sites=caps.map(c=>({...c,y:height(c.x,c.z),high:true}));
  // Keep lower lift-building possibilities from the approved pass in the same places.
  for(const s of base.sites.filter(s=>s.name!=='Summit shoulder'))sites.push({...s,y:height(s.x,s.z),high:false});
  return{design,height,sites,faces,bowls,size:source.size,half:source.half,baseId:'saddle',baseHeight:raw};
 }
 return{designs,create,size:source.size,half:source.half,preferred:'terraces',baseId:'saddle'};
})();
