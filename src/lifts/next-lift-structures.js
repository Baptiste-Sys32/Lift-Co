// Reuse the game's approved detachable housing and fixed-foot mast.
// The corner shell is architectural adaptation, not a finished angle-station drive.
window.LiftCoNextStructures={createFactory(T,{makeCarrier,runtime=false}){
 const cache=new Map(),mat=(color,metalness=0,roughness=.65)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const steel=mat(0xa4b0ad,.65,.38),dark=mat(0x354342,.45),rubber=mat(0x202b2b),concrete=mat(0xb4baad),deckM=mat(0xd5d9cc),yellow=mat(0xbd9d52,.2);
 deckM.side=T.DoubleSide;concrete.side=T.DoubleSide;
 const geo=(key,build)=>{if(!cache.has(key))cache.set(key,build());return cache.get(key);};
 function mesh(p,g,m,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=!m.transparent;o.receiveShadow=true;p.add(o);return o;}
 const box=(p,w,h,d,x,y,z,m=steel)=>mesh(p,geo('box'+[w,h,d],()=>new T.BoxGeometry(w,h,d)),m,x,y,z);
 function beam(p,a,b,w=.08,d=w,m=steel){const va=new T.Vector3(...a),vb=new T.Vector3(...b),delta=vb.clone().sub(va),o=box(p,w,delta.length(),d,0,0,0,m);o.position.copy(va).add(vb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;}
 function cylinder(p,r,h,x,y,z,m=steel,axis='y'){const o=mesh(p,geo('cyl'+[r,h],()=>new T.CylinderGeometry(r,r,h,16)),m,x,y,z);if(axis==='x')o.rotation.z=Math.PI/2;return o;}
 function pipe(p,points,r,m=steel){if(runtime&&r===.018)return null;const curve=new T.CatmullRomCurve3(points.map(v=>Array.isArray(v)?new T.Vector3(...v):v));return mesh(p,new T.TubeGeometry(curve,Math.max(32,points.length*2),r,6,false),m);}
 function surface(p,rows,m){const n=rows[0].length,positions=[],indices=[];for(const row of rows)for(const q of row)positions.push(...q);for(let j=0;j<rows.length-1;j++)for(let i=0;i<n-1;i++){const a=j*n+i;indices.push(a,a+n,a+1,a+1,a+n,a+n+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return mesh(p,g,m);}
 const details=window.LiftCoStudyMachinery.createFactory(T,{geo,mesh,box,beam,cylinder,pipe,surface,steel,dark,rubber,concrete,yellow});
 const sheave=details.sheave;
 function addCarrier(root,id,position,yaw=0,opening=0){if(runtime)return null;const c=makeCarrier(id);c.root.position.copy(position);c.root.rotation.y=yaw;c.setOpening(opening);c.rope.visible=false;root.add(c.root);return c;}
 function pylon(id,{count:requestedCount,halfDeck}={}){
   const old=id==='alps5',gondola=id==='princesse',root=new T.Group(),head=new T.Group(),passengers=new T.Group(),paint=mat(old?0x68736b:gondola?0x9aa5a7:0x9baaa5,.55,old?.78:.45);root.add(head,passengers);
  root.name=old?'Period fixed-grip double support':gondola?'Game gondola support / six-sheave head':'Chairlift support / eight-sheave head';
  const ropeY=10.3,platformY=old?9.25:gondola?ropeY-1.22:8.8,headY=old?11.05:gondola?ropeY+2.85:12.35,railX=old?2.45:3.1,count=requestedCount??(old?4:gondola?6:8),cy=ropeY-.34;
  let mast;
  if(old){
   box(root,1.65,.40,1.65,0,.10,0,concrete);const shaft=mesh(root,geo('period-mast',()=>new T.CylinderGeometry(.34,.53,9.1,12)),paint,0,4.85,0);cylinder(root,.64,.10,0,.35,0,dark);
   for(let i=0;i<8;i++){const a=i*Math.PI/4;cylinder(root,.035,.10,Math.cos(a)*.53,.43,Math.sin(a)*.53,steel);}
   mast={root:shaft};beam(head,[-2.95,platformY,0],[2.95,platformY,0],.25,.32,paint);
   for(const side of [-1,1]){beam(head,[side*.55,platformY,0],[side*2.1,headY,0],.11,.12,steel);beam(head,[side*2.1,headY,0],[side*2.1,platformY,0],.10,.10,steel);}
   beam(head,[-3.0,headY,0],[3.0,headY,0],.14,.17,steel);
   for(const side of [-1,1]){for(const z of [-.62,.62])beam(head,[side*1.1,platformY+.08,z],[side*1.1,platformY+.92,z],.025);beam(head,[side*1.1,platformY+.92,-.62],[side*1.1,platformY+.92,.62],.025);}
  }else{
   mast=window.LiftCoTowerMast.create(T,{parent:root,headY:platformY-.15,groundAt:()=>0,steel:paint,concrete,dark});
   for(const side of [-1,1]){details.girder(head,[side*(gondola?2.05:1.65),platformY-.13,0],[side*4.05,headY,0],.24,.30,paint);beam(head,[side*.50,platformY-.65,0],[side*(gondola?2.1:1.7),platformY-.13,0],.15,.18,dark);}
   details.girder(head,[-4.4,headY,0],[4.4,headY,0],.30,.34,paint);
   if(gondola)for(const side of [-1,1]){beam(head,[side*4.05,headY,0],[side*4.05,headY-.3,.48],.065);const lamp=box(head,.55,.27,.22,side*4.05,headY-.35,.53,dark);box(lamp,.43,.16,.025,0,0,.125,deckM);}
  }
  const deckHalf=halfDeck??(old?.68:gondola?1.45:1.2),deckWidth=old?1.70:gondola?2.25:1.85;
  for(const x of [-deckWidth,deckWidth])details.girder(head,[x,platformY-.12,-deckHalf],[x,platformY-.12,deckHalf],.14,.18,dark);
  for(let x=-deckWidth+.05;x<deckWidth;x+=.18){if(Math.abs(x)<.34){box(head,.06,.035,deckHalf+.35,x,platformY,(-deckHalf+.35)/2,steel);if(deckHalf>.98)box(head,.06,.035,deckHalf-.98,x,platformY,(deckHalf+.98)/2,steel);}else box(head,.06,.035,deckHalf*2,x,platformY,0,steel);}
   if(!old)for(const side of [-1,1]){for(const z of [-deckHalf,0,deckHalf])beam(head,[side*deckWidth,platformY,z],[side*deckWidth,platformY+1.0,z],.035);for(const h of [.5,1])beam(head,[side*deckWidth,platformY+h,-deckHalf],[side*deckWidth,platformY+h,deckHalf],.035);}
   // Game gondola heads carry the same centre ladder and inner platform rails.
   if(gondola){for(const side of [-1,1])beam(head,[side*.37,platformY,.12],[side*.37,headY+.2,.12],.045,.045,paint);for(let y=platformY+.3;y<headY;y+=.32)beam(head,[-.37,y,.12],[.37,y,.12],.04,.04,paint);}
   if(gondola)for(const zz of [-deckHalf,deckHalf])for(const side of [-1,1]){beam(head,[side*.5,platformY,zz],[side*.5,platformY+1.02,zz],.045,.045,paint);for(const h of [.5,1.02])beam(head,[side*.5,platformY+h,zz],[side*deckWidth,platformY+h,zz],.045,.045,paint);}
  const wheels=[],frames=[],banks=[];
  for(const side of [-1,1]){
   const lane=side*railX,back=side*(railX-.43),bank=new T.Group();bank.name='Articulated inboard equalizers';head.add(bank);frames.push(bank);
   const pairs=Array.from({length:count/2},(_,i)=>(i-(count/2-1)/2)*1.52);
   details.girder(bank,[back,cy-.49,pairs[0]-.12],[back,cy-.49,pairs.at(-1)+.12],.15,.20,paint);
   for(const z of pairs){details.girder(bank,[back,cy-.14,z-.47],[back,cy-.14,z+.47],.12,.15,paint);cylinder(bank,.115,.21,back,cy-.25,z,steel,'x');beam(bank,[back,cy-.14,z],[back,cy-.49,z],.10,.13,paint);}
   for(let i=0;i<count;i++){const z=(i-(count-1)/2)*.76,wheel=sheave(head,lane,cy,z);wheels.push(wheel);box(bank,.16,.23,.22,back,cy,z,dark);cylinder(bank,.052,.61,(lane+back)/2,cy,z,steel,'x');beam(bank,[back,cy-.14,z],[back,cy,z],.10,.14,paint);}
   details.girder(bank,[back,cy-.49,0],[back,headY-.10,0],old?.11:.16,.19,paint);
   if(!old)for(const z of [-.65,.65])beam(bank,[back,cy+.45,0],[back,headY-.3,z],.065,.085,paint);
   pipe(root,[[lane,ropeY,-6],[lane,ropeY,6]],.018,dark);banks.push({side,lane,frameX:back,wheelY:cy,radius:.35,pitch:.76,count,axialClearance:.43-.08-.17});
  }
  for(const x of [-.29,.29])beam(root,[x,old?.45:platformY+.90,.66],[x,headY+.18,.66],.03);
  for(let y=old?.60:platformY+1.0;y<headY+.15;y+=.30)beam(root,[-.29,y,.66],[.29,y,.66],.023);
  if(old){const c=document.createElement('canvas');c.width=64;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#536059';ctx.fillRect(0,0,64,96);ctx.fillStyle='#e6e4d7';ctx.font='64px Georgia';ctx.textAlign='center';ctx.fillText('3',32,72);const map=new T.CanvasTexture(c);mesh(root,new T.PlaneGeometry(.28,.40),new T.MeshBasicMaterial({map}),0,8.3,.43);}
  const carrier=addCarrier(root,id,new T.Vector3(railX,ropeY-(gondola?4.2:5.2),.8));details.merge(head,new Set([...wheels,...(runtime?frames:[])]));
  return{root,roof:head,passengers,paint,wheels,frames,banks,carrier,mast,height:headY+1,title:old?'Period double-chair support':gondola?'Gondola head / game geometry':'Chairlift support',setOpening(){},setColor(c){paint.color.set(c);},setGlazing(){},setCutaway(q){head.visible=!q;}};
 }
 function route(angle=0,{half=14,corner=7,through=true}={}){
  if(!through)return t=>({x:0,z:t*26,nx:1,nz:0,yaw:0});
  const curve=new T.QuadraticBezierCurve(new T.Vector2(0,-corner),new T.Vector2(0,0),new T.Vector2(corner*Math.sin(angle),corner*Math.cos(angle))),leg=half-corner;
  return t=>{let p,d;if(t<1/3){p=new T.Vector2(0,-half+t*3*leg);d=new T.Vector2(0,1);}else if(t>2/3){const q=corner+(t*3-2)*leg;p=new T.Vector2(q*Math.sin(angle),q*Math.cos(angle));d=new T.Vector2(Math.sin(angle),Math.cos(angle));}else{const u=(t-1/3)*3;p=curve.getPoint(u);d=curve.getTangent(u);}return{x:p.x,z:p.y,nx:d.y,nz:-d.x,yaw:Math.atan2(d.x,d.y)};};
 }
 function deflection(parent,angle,trackY,{half=14}={}){
  const pulleys=[],paths=[],radius=.9,offset=1.3,y=trackY-.22,sign=Math.sign(angle)||1;
  for(const side of [-1,1]){const x=side*offset,vz=-x*Math.tan(angle/2),d=radius*Math.tan(Math.abs(angle)/2),cx=x+sign*radius,cz=vz-d;
   const rotor=details.bullwheel(parent,{x:cx,y,z:cz,radius,brakes:false});pulleys.push(rotor);details.bearing(parent,cx,y+.45,cz);cylinder(parent,.12,.45,cx,y+.225,cz,steel);details.girder(parent,[cx-.7,y+.75,cz],[cx+.7,y+.75,cz],.16,.20);
   const points=[];for(let i=0;i<=60;i++)points.push(new T.Vector3(x,y,-half+(cz+half)*i/60));for(let i=1;i<=64;i++){const a=(sign>0?Math.PI:0)-angle*i/64;points.push(new T.Vector3(cx+radius*Math.cos(a),y,cz+radius*Math.sin(a)));}const begin=points.at(-1),end=new T.Vector3(half*Math.sin(angle)+x*Math.cos(angle),y,half*Math.cos(angle)-x*Math.sin(angle));for(let i=1;i<=60;i++)points.push(begin.clone().lerp(end,i/60));pipe(parent,points,.018,dark);for(const dx of [-.55,.55])beam(parent,[cx+dx,y+.75,cz],[cx+dx,trackY+1.3,cz],.10,.14);details.girder(parent,[-4,trackY+1.3,cz],[4,trackY+1.3,cz],.20,.26);paths.push({center:[cx,y,cz],radius,points});
  }return{pulleys,paths};
 }
 function turnConveyor(parent,R,trackY){
  const rollers=[],rail=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI;rail.push(new T.Vector3((R-.20)*Math.cos(a),trackY-.11,26+(R-.20)*Math.sin(a)));}pipe(parent,rail,.04,details.alloy);
  const spine=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI;spine.push(new T.Vector3((R-.30)*Math.cos(a),trackY+.60,26+(R-.30)*Math.sin(a)));}pipe(parent,spine,.085,dark);
  for(let i=1;i<16;i++){const a=i/16*Math.PI,nx=Math.cos(a),nz=Math.sin(a),x=(R+.12)*nx,z=26+(R+.12)*nz;const tyre=details.tyre(parent,x,trackY+.33,z,-a);tyre.userData.laneSide=1;tyre.userData.turnAngle=a;rollers.push(tyre);beam(parent,[(R-.30)*nx,trackY+.33,26+(R-.30)*nz],[x,trackY+.33,z],.055,.055,steel);}
  return rollers;
 }
 function terminalDrive(parent,R=2.55,{z=26,y=4.98,small=false,shaftBase=y-.70,shaftTop=y+1.40}={}){
  const rotor=details.bullwheel(parent,{y,z,radius:R});details.bearing(parent,0,y-.55,z);cylinder(parent,.16,shaftTop-shaftBase,0,(shaftTop+shaftBase)/2,z,details.alloy);
  details.bearing(parent,0,y+.78,z);details.motor(parent,{y:y+1.70,z:z-4.0,scale:small?.65:1});beam(parent,[0,y+1.80,z-2.6],[0,y+1.80,z],.10,.10,details.alloy);details.gearbox(parent,0,y+1.57,z);return rotor;
 }
 function legacyStation(id){
  const root=new T.Group(),legacy=new T.Group(),mechanics=new T.Group(),passengers=new T.Group();root.add(legacy,mechanics,passengers);root.name='Classic fixed-grip station / period double';
  const model=window.LiftCoClassicStation.create(T,{root:legacy,half:0,straight:12,railX:2.2,base:{y:5.2},top:{y:5.2},ends:[1],driveAssembly:false});legacy.children[0].position.z=0;
  const rotor=terminalDrive(mechanics,2.2,{z:0,y:5.2,small:true}),points=[new T.Vector3(2.2,5.2,-17),new T.Vector3(2.2,5.2,0)];for(let i=1;i<=64;i++){const a=i/64*Math.PI;points.push(new T.Vector3(2.2*Math.cos(a),5.2,2.2*Math.sin(a)));}points.push(new T.Vector3(-2.2,5.2,-17));pipe(mechanics,points,.018,dark);
  const carrier=addCarrier(root,id,new T.Vector3(2.2,0,-7),0,1);let paint;legacy.traverse(o=>{if(o.material?.color?.getHex()===0x315b55)paint=o.material;});
  details.merge(mechanics,runtime?new Set([rotor]):new Set());return{root,roof:model.roofs[0],passengers,paint,mechanics,carrier,rollers:[],role:'terminal',through:false,allowAccess:true,fixedGrip:true,height:9,title:'Classic fixed-grip terminal',pulleys:[rotor],detailTarget:[0,5.8,-1],setOpening(){},setColor(c){paint.color.set(c);},setGlazing(){},setCutaway(q){model.roofs.forEach(r=>r.visible=!q);}};
 }
 function openAngleStation(id,angle=35*Math.PI/180){
  const root=new T.Group(),roof=new T.Group(),supports=new T.Group(),mechanics=new T.Group(),passengers=new T.Group(),paint=mat(0x37765e,.3,.55);root.add(roof,supports,mechanics,passengers);root.name='Open Leitner angle-transfer structure';
  const trackY=8.2,sample=route(angle,{half:10,corner:5}),samples=Array.from({length:181},(_,i)=>sample(i/180));
  const mechanism=details.conveyor(mechanics,samples,{trackY}),haul=deflection(mechanics,angle,trackY,{half:10});
  for(const t of [.16,.84]){const p=sample(t),height=trackY+1.25;box(supports,2.15,.45,2.15,p.x,.12,p.z,concrete);box(supports,1.35,height,1.35,p.x,height/2,p.z,concrete);details.girder(supports,[p.x-4.5*p.nx,height,p.z-4.5*p.nz],[p.x+4.5*p.nx,height,p.z+4.5*p.nz],.42,.45,steel);
   for(const side of [-1,1]){beam(supports,[p.x,height-1.8,p.z],[p.x+side*3.9*p.nx,height,p.z+side*3.9*p.nz],.22,.24,dark);beam(supports,[p.x+side*2.8*p.nx,trackY+.60,p.z+side*2.8*p.nz],[p.x+side*2.8*p.nx,height,p.z+side*2.8*p.nz],.13,.16,steel);}
  }
  for(const side of [-1,1])for(const [lo,hi]of [[0,.29],[.71,1]]){const rows=[];for(let j=0;j<=32;j++){const p=sample(lo+(hi-lo)*j/32);rows.push([[-.55,.62],[-.55,1.10],[-.30,1.35],[.30,1.35],[.55,1.10],[.55,.62]].map(([x,y])=>[p.x+(side*3.22+x)*p.nx,trackY+y,p.z+(side*3.22+x)*p.nz]));}surface(roof,rows,deckM);const fascia=[];for(let j=0;j<=24;j++){const p=sample(lo+(hi-lo)*j/24);fascia.push(new T.Vector3(p.x+side*3.78*p.nx,trackY+.65,p.z+side*3.78*p.nz));}pipe(roof,fascia,.055,paint);}
  const selected=samples.filter((p,i)=>i%15===0);for(const offset of [-1.70,1.70])details.walk(supports,selected.map(p=>({x:p.x+offset*p.nx,z:p.z+offset*p.nz})),.78,trackY+1.50);
  // The inspection ladder reaches the service gallery, never a passenger deck.
  const base=sample(.16);for(const side of [-1,1])beam(supports,[base.x+side*.27,.4,base.z+.84],[base.x+side*.27,trackY+2.3,base.z+.84],.032);for(let y=.6;y<trackY+2.2;y+=.3)beam(supports,[base.x-.27,y,base.z+.84],[base.x+.27,y,base.z+.84],.025);
  const p=sample(.14),carrier=addCarrier(root,id,new T.Vector3(p.x+3.1*p.nx,trackY-5.2,p.z+3.1*p.nz),p.yaw,0);details.merge(mechanics,runtime?new Set([...mechanism.rollers,...haul.pulleys]):new Set());details.merge(supports);
  return{root,roof,supports,mechanics,passengers,paint,carrier,rollers:mechanism.rollers,railPoints:mechanism.railPoints,pulleys:haul.pulleys,haulPaths:haul.paths,through:true,allowAccess:false,role:'intermediate',sample,trackY,R:3.1,height:12,detailTarget:[0,8.5,0],title:'Open angle-transfer structure',setOpening(){},setColor(c){paint.color.set(c);},setGlazing(){},setCutaway(q){roof.visible=!q;}};
 }
 function station(id,{role,angle:turnAngle}={}){
  if(id==='alps5')return legacyStation(id);
  const f=window.LiftCoNextStudies.families[id],special=f.layout!=='straight';role=role||(special?'intermediate':'terminal');const through=role==='intermediate';if(through&&id==='panoramabahn')return openAngleStation(id,turnAngle);
  const root=new T.Group(),roof=new T.Group(),passengers=new T.Group(),supports=new T.Group(),mechanics=new T.Group();root.name=through?'Single curved gondola passenger bay':'Approved detachable terminal';root.add(roof,passengers,supports,mechanics);
  const color=id==='panoramabahn'?0x37765e:id==='princesse'?0xd5d5ca:0xe2e2d8,shiftY=1.12,trackY=5.2,R=3.1,angle=turnAngle??15*Math.PI/180,sample=route(angle,{through}),housings=[];
  const shellRoot=new T.Group(),supportRoot=new T.Group();shellRoot.position.y=shiftY;roof.add(shellRoot);supports.add(supportRoot);const housing=window.LiftCoDetachableStation.create(T,{parent:shellRoot,supportParent:supportRoot,color,name:f.name,through,supportHeightOffset:shiftY});housings.push(housing);
  if(through){
   // Deform one complete approved through shell onto the shared centreline.
   // This preserves the glazing, ribbed roof and single front/rear portals.
   for(const parent of [roof,supports]){parent.updateWorldMatrix(true,true);const inverse=parent.matrixWorld.clone().invert(),meshes=[];parent.traverse(o=>{if(o.isMesh)meshes.push(o);});for(const o of meshes){const g=o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld)),positions=g.attributes.position;for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),p=sample(z/29.6);positions.setXYZ(i,p.x+x*p.nx,y,p.z+x*p.nz);}g.computeVertexNormals();g.computeBoundingSphere();o.geometry=g;parent.attach(o);o.position.set(0,0,0);o.quaternion.identity();o.scale.setScalar(1);}}
  }
  // The drive shaft replaces the placeholder from the rear pier to the upper
  // crossbeam, so the bearing stack and return frame have one continuous support.
  if(!through)housing.supports.traverse(o=>{if(o.geometry?.parameters?.radiusTop===.22)o.visible=false;});
  const samples=Array.from({length:181},(_,i)=>sample(i/180)),conveyor=details.conveyor(mechanics,samples,{trackY}),pulleys=[],haulPaths=[];if(through){const haul=deflection(mechanics,angle,trackY);pulleys.push(...haul.pulleys);haulPaths.push(...haul.paths);}else{conveyor.rollers.push(...turnConveyor(mechanics,R,trackY));pulleys.push(terminalDrive(mechanics,2.55,{shaftBase:4.04,shaftTop:7.17}));const points=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI;points.push(new T.Vector3(2.55*Math.cos(a),4.98,26+2.55*Math.sin(a)));}pipe(mechanics,points,.018,dark);for(const side of [-1,1])pipe(mechanics,[[side*2.55,4.98,0],[side*2.55,4.98,26]],.018,dark);}
  for(const z of [3.8,26]){const p=through?sample(z/29.6):{x:0,z,nx:1,nz:0};for(const side of [-1,1])beam(mechanics,[p.x+side*2.8*p.nx,trackY+.60,p.z+side*2.8*p.nz],[p.x+side*2.8*p.nx,7.17,p.z+side*2.8*p.nz],.13,.16,steel);}
  const platformY=id==='princesse'?1.19:.26;
  for(const side of [-1,1]){const strips=samples.map(p=>[5.2,7.2].map(x=>[p.x+side*x*p.nx,platformY,p.z+side*x*p.nz]));surface(root,strips,deckM);for(const x of [5.2,7.2])surface(root,samples.map(p=>[0,platformY].map(y=>[p.x+side*x*p.nx,y,p.z+side*x*p.nz])),concrete);pipe(root,samples.map(p=>new T.Vector3(p.x+side*7.05*p.nx,platformY+1.03,p.z+side*7.05*p.nz)),.03,steel);for(let i=0;i<=180;i+=18){const p=samples[i];beam(root,[p.x+side*7.05*p.nx,platformY,p.z+side*7.05*p.nz],[p.x+side*7.05*p.nx,platformY+1.03,p.z+side*7.05*p.nz],.03);}}
  if(through){const walk=samples.filter((p,i)=>i%15===0).map(p=>({x:p.x,z:p.z}));details.walk(mechanics,walk,1.20,6.75);}
  const p=sample(through?.18:.25),carrier=addCarrier(root,id,new T.Vector3(p.x+R*p.nx,trackY-(id==='princesse'?4.2:5.2),p.z+R*p.nz),p.yaw,1),paint=housing.materials.body;
  details.merge(mechanics,runtime?new Set([...conveyor.rollers,...pulleys]):new Set());details.merge(supports);return{root,roof,passengers,paint,housings,mechanics,rollers:conveyor.rollers,carrier,railPoints:conveyor.railPoints,pulleys,haulPaths,through,allowAccess:true,role,sample,trackY,R,height:11,title:through?'Single curved passenger mid-station':'Adapted detachable terminal',setOpening(){},setColor(c){housings.forEach(h=>h.setColor(c));},setGlazing(){},setCutaway(q){roof.visible=!q;}};
 }
 return{station,pylon};
}};
