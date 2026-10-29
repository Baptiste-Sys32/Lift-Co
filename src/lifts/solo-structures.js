// Solo's Heavy Portal pylons and enclosed timber station halls.
window.LiftCoSoloStructures={createFactory(T,rig){
const cache=new Map(),mat=(color,r=.65,m=.25)=>new T.MeshStandardMaterial({color,roughness:r,metalness:m});
const M={steel:mat(0x66767b,.55,.6),edge:mat(0x3f5056,.6,.55),guard:mat(0x899596,.7,.45),hub:mat(0xb5bfba,.4,.6),rubber:mat(0x293337,.85,.15),concrete:mat(0xa5aa9d,1,0),cage:mat(0x766755,.65,.5)};M.guard.side=T.DoubleSide;
const smooth=(a,b,x)=>{const t=T.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function geo(k,fn){if(!cache.has(k))cache.set(k,fn());return cache.get(k);}function mesh(g,geometry,material,x=0,y=0,z=0){const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=!material.transparent;o.receiveShadow=true;g.add(o);return o;}
function box(g,w,h,d,x,y,z,m=M.steel){return mesh(g,geo('b'+[w,h,d],()=>new T.BoxGeometry(w,h,d)),m,x,y,z);}
function beam(g,a,b,w=.16,d=w,m=M.steel){const p=new T.Vector3(...a),q=new T.Vector3(...b),delta=q.clone().sub(p),o=mesh(g,geo('girder'+[w,d,delta.length().toFixed(4)],()=>new T.BoxGeometry(w,d,delta.length())),m);o.position.copy(p).add(q).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),delta.normalize());return o;}
function staticBatch(group){group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),batches=new Map();group.traverse(o=>{if(!o.isMesh)return;const key=o.material.uuid;if(!batches.has(key))batches.set(key,{material:o.material,p:[],n:[]});const out=batches.get(key),g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(inverse.clone().multiply(o.matrixWorld));out.p.push(...g.attributes.position.array);out.n.push(...g.attributes.normal.array);g.dispose();});group.clear();for(const b of batches.values()){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));mesh(group,g,b.material);}}
function roller(g,x,y,z,r=.18){const wheel=mesh(g,geo('roller'+r,()=>{const geometry=new T.LatheGeometry([[.055,-.1],[r,-.1],[r+.025,-.07],[r,-.035],[r,.035],[r+.025,.07],[r,.1],[.055,.1]].map(([a,b])=>new T.Vector2(a,b)),18);geometry.rotateZ(Math.PI/2);return geometry;}),M.rubber,x,y,z);mesh(wheel,geo('hub'+r,()=>{const g=new T.CylinderGeometry(r*.48,r*.48,.23,12);g.rotateZ(Math.PI/2);return g;}),M.hub);if(r>.3){
 const disc=geo('sheave-disc'+r,()=>{const g=new T.CylinderGeometry(r-.07,r-.07,.025,40);g.rotateZ(Math.PI/2);return g;});
 const ring=geo('sheave-rim'+r,()=>{const g=new T.TorusGeometry(r-.035,.035,6,40);g.rotateY(Math.PI/2);return g;});
 for(const x of [-.102,.102]){mesh(wheel,disc,M.hub,x,0,0);mesh(wheel,ring,M.hub,x,0,0);for(let i=0;i<6;i++){const angle=i*Math.PI/3;beam(wheel,[x,Math.cos(angle)*r*.24,Math.sin(angle)*r*.24],[x,Math.cos(angle)*(r-.07),Math.sin(angle)*(r-.07)],.045,.045,M.hub);}}
 }else {box(wheel,.24,r*1.3,.04,0,0,0,M.edge);for(const side of [-1,1])box(wheel,.012,r*.32,.025,side*.123,r*.7,0,M.hub);}return wheel;}
function sidePlate(g,x,a,b,track,height){const positions=[],indices=[],steps=42;for(let i=0;i<=steps;i++){const z=a+(b-a)*i/steps,y=track(z);positions.push(x,y+.025,z,x,y-height,z);if(i<steps){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();mesh(g,geometry,M.guard);}
// A swept groove supplies continuous contact under a fixed support rope.
function saddle(g,x,a,b,profile,radius){
 const section=[[-.13,-.19],[.13,-.19],[.13,-radius*.5],[radius*1.12,-radius*.5],[radius*.8,-radius*.8],[0,-radius],[-radius*.8,-radius*.8],[-radius*1.12,-radius*.5],[-.13,-radius*.5]],positions=[],indices=[],steps=Math.ceil((b-a)/.12),count=section.length;
 for(let i=0;i<=steps;i++){const z=a+(b-a)*i/steps,m=(profile(z+.002)-profile(z-.002))/.004,n=Math.hypot(1,m);for(const [dx,dy]of section)positions.push(x+dx,profile(z)+dy/n,z-dy*m/n);}
 for(let i=0;i<steps;i++)for(let k=0;k<count;k++){const a=i*count+k,b=i*count+(k+1)%count;indices.push(a,b,a+count,b,b+count,a+count);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();const shoe=mesh(g,geometry,M.hub);shoe.userData.fixedSaddle=true;return shoe;
}
function haulBank(frame,head,sheaves,x,a,b,profile,pitch=.8){
 const radius=.18,count=Math.ceil((b-a)/pitch)+1,contacts=[],outer=Math.abs(x)>5.1,cheeks=outer?[Math.sign(x)*.15]:[-.15,.15];
 for(let i=0;i<count;i++){
  const contact=a+(b-a)*i/(count-1),m=(profile(contact+.002)-profile(contact-.002))/.004,n=Math.hypot(1,m),offset=radius+rig.haulRadius,z=contact+offset*m/n,y=profile(contact)-offset/n;
  const wheel=roller(head,x,y,z,radius);wheel.name='Recessed haul roller';sheaves.push({wheel,z,side:Math.sign(x),radius,rope:'haul',contact,profile});contacts.push({y,z});
  if(outer)box(frame,.03,.09,.09,x+Math.sign(x)*.13,y,z,M.hub);
  for(const dx of cheeks){box(frame,.065,.15,.17,x+dx,y,z,M.hub);beam(frame,[x+dx,profile(z)-.42,z],[x+dx,y,z],.055,.08);}
 }
 // Cantilever the outer haul bank from its outside cheek: the single hanger
 // passes the open inner face. Inner haul banks retain their two-sided bearings.
 for(const dx of cheeks){sidePlate(frame,x+dx,a-.16,b+.16,z=>profile(z)-.17,.3);}
 // Hang the banks from outside the carriage envelope. No low cross-member
 // crosses the hanger blade or the compact nose collars.
 const laneX=Math.sign(x)*5.1,dropX=laneX+Math.sign(x-laneX)*1.18;
 for(const contact of [a,(a+b)/2,b]){const m=(profile(contact+.002)-profile(contact-.002))/.004,n=Math.hypot(1,m),z=contact+(radius+rig.haulRadius)*m/n,y=profile(contact)-(radius+rig.haulRadius)/n;beam(frame,[dropX,profile(z)+.46,z],[dropX,y,z],.07,.09);beam(frame,[dropX,y,z],[x+Math.sign(dropX-x)*.15,y,z],.075,.075);}
 return contacts;
}
// Keep the individual animation handles, but draw repeated rollers as instances.
function packRollers(head,sheaves){
 const buckets=new Map();for(const {wheel}of sheaves){wheel.removeFromParent();wheel.updateMatrixWorld(true);wheel.traverse(o=>{if(!o.isMesh)return;const key=o.geometry.uuid+o.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);});}
 const batches=[];for(const sources of buckets.values()){const first=sources[0],instances=new T.InstancedMesh(first.geometry,first.material,sources.length);instances.instanceMatrix.setUsage(T.DynamicDrawUsage);instances.castShadow=instances.receiveShadow=true;instances.frustumCulled=false;head.add(instances);batches.push({sources,instances});}
 const sync=()=>{for(const {wheel}of sheaves)wheel.updateMatrixWorld(true);for(const {sources,instances}of batches){sources.forEach((o,i)=>instances.setMatrixAt(i,o.matrixWorld));instances.instanceMatrix.needsUpdate=true;}};sync();return sync;
}
function createTower({z,groundY,route,haul,groundAt=()=>groundY}){
 const root=new T.Group(),frame=new T.Group(),guards=new T.Group(),head=new T.Group();root.position.set(0,groundY,z);root.add(frame,guards,head);
 const track=u=>route(z+u)-groundY,H=track(0),lane=5.1,half=5.1,d={height:H,base:8.4,depth:6.6,neck:4.2,head:10.2,levels:Math.max(7,Math.ceil(H/5)),chord:.3,style:1};
 const haulGap=rig.haulY-rig.trackY,haulTrack=u=>haul?haul(z+u)-groundY:track(u)+haulGap*Math.hypot(1,(track(u+.01)-track(u-.01))/.02);
 function leg(y,sx,sz){const t=d.style===1?1-smooth(0,H*.3,y):1-smooth(0,H*.82,y);return[sx*(d.neck/2+(d.base-d.neck)/2*t),y+(groundAt(z+sz*d.depth/2,sx*d.base/2)-groundY)*(1-smooth(0,H*.25,y)),sz*(d.neck*.42+(d.depth-d.neck*.84)/2*t)];}
 for(const sx of [-1,1])for(const sz of [-1,1]){const foot=leg(0,sx,sz);if(window.LiftCoFoundations)window.LiftCoFoundations.create(T,{parent:frame,x:foot[0],z:foot[2],top:foot[1]+.5,width:window.LiftCoFoundations.width(H,2),groundAt:(x,u)=>groundAt(z+u,x)-groundY,material:M.concrete});else box(frame,2,.7,2,foot[0],foot[1]+.15,foot[2],M.concrete);box(frame,1.1,.15,1.1,foot[0],foot[1]+.58,foot[2],M.edge);for(let i=0;i<d.levels;i++){const a=(H-1.6)*i/d.levels,b=(H-1.6)*(i+1)/d.levels;beam(frame,leg(a,sx,sz),leg(b,sx,sz),d.chord,d.chord,M.steel);}}
 if(window.LiftCoFoundations&&H>=40){const feet=[leg(0,-1,-1),leg(0,-1,1),leg(0,1,-1),leg(0,1,1)];window.LiftCoFoundations.create(T,{parent:frame,top:Math.min(...feet.map(f=>f[1]))-.25,width:d.base+3,depth:d.depth+3,groundAt:(x,u)=>groundAt(z+u,x)-groundY,material:M.concrete,embed:1.5});}
 for(let i=0;i<d.levels;i++){const a=.65+(H-2.25)*i/d.levels,b=.65+(H-2.25)*(i+1)/d.levels;for(const side of [-1,1]){for(const axis of [0,1]){const p=(s,y)=>axis===0?leg(y,s,side):leg(y,side,s);beam(frame,p(-1,a),p(1,a),.11,.12);beam(frame,p(-1,a),p(1,b),d.style===1?.1:.085,.1);beam(frame,p(1,a),p(-1,b),d.style===1?.1:.085,.1);}}}
 // Low crosshead: two transverse girders carry longitudinal saddle/roller beams.
 // Keep the approved shaft and flared feet; no raised crown or full-width solid deck.

 for(const z of [-1.55,1.55]){
  beam(frame,[-5.22,track(z)-1.18,z],[5.22,track(z)-1.18,z],.34,.5,M.edge);
  for(const side of [-1,1])beam(frame,leg(H-4.1,side,Math.sign(z)),[side*4.65,track(z)-1.38,z],.2,.25);
 }
 box(guards,2.8,.09,3.9,0,H-1.18,0,M.guard);

 const count=8,first=-half+.62,last=half-.62;
 for(const side of [-1,1]){
  // Narrow inner walkway leaves the rope, saddle and wheel faces visible.
  box(guards,.82,.09,d.head-.3,side*3.25,H-1.15,0,M.guard);
  for(const z of [-half+.2,-half*.5,0,half*.5,half-.2]){
   box(guards,.05,1.02,.05,side*2.85,H-.64,z,M.hub);
   beam(frame,[side*3.0,track(z)-1.2,z],[side*5.18,track(z)-1.2,z],.12,.16);
  }
  for(const y of [H-.13,H-.65])beam(guards,[side*2.85,y,-half+.2],[side*2.85,y,half-.2],.045,.045,M.hub);
  // Lower girder webs carry the saddle and both recessed haul banks.
  const nodes=[];
  for(let i=0;i<count;i++){
   const z=first+(last-first)*i/(count-1),upper=track(z)-.95;
   nodes.push({z,upper});
   if(i){const prev=nodes[i-1];
    beam(frame,[side*4.67,prev.upper,prev.z],[side*4.67,upper,z],.17,.24,M.edge);
    beam(frame,[side*5.1,track(prev.z)-1.2,prev.z],[side*5.1,track(z)-1.2,z],.14,.16);

   }
   if(i===1||i===count-2)beam(frame,[side*4.67,H-1.7,z],[side*4.67,upper,z],.13,.16);
  }
 }
 // Access ladder reaches the central landing, below the open crosshead.
 for(const x0 of [-.25,.25])for(let y=.6;y<H-1.3;y+=.7)beam(guards,[x0,y,leg(y,1,-1)[2]-.18],[x0,Math.min(H-1.2,y+.7),leg(Math.min(H-1.2,y+.7),1,-1)[2]-.18],.055,.055,M.hub);
 for(let y=.8;y<H-1.2;y+=.38){const z=leg(y,1,-1)[2]-.18;beam(guards,[-.25,y,z],[.25,y,z],.035,.035,M.hub);}
 const sheaves=[];
 for(const side of [-1,1]){
  // The stationary carrying rope rests on a continuous saddle; the moving
  // traction pair uses separate low, recessed roller banks beside it.
  saddle(frame,side*lane,-4.48,4.48,track,rig.trackRadius);
  sidePlate(frame,side*(lane-.2),-4.65,4.65,u=>track(u)-.2,.86);
  for(const u of [-4.48,0,4.48]){
   beam(frame,[side*4.67,track(u)-1.2,u],[side*lane,track(u)-.19,u],.13,.16);
   beam(frame,[side*4.67,track(u)-.45,u],[side*5.28,track(u)-.45,u],.12,.12);
  }
  for(const offset of rig.haulOffsets||[-.85,.85])haulBank(frame,head,sheaves,side*lane+offset,-4.48,4.48,haulTrack);
  for(const u of [-4.48,0,4.48]){const inner=side*(lane-1.18),outer=side*(lane+1.18),y=haulTrack(u)+.46;beam(frame,[inner,track(u)-1.2,u],[inner,y,u],.12,.14);beam(frame,[inner,y,u],[outer,y,u],.1,.12);}
 }
 const haulSheaves=[];
 root.userData.guideMode='saddle';
 const syncRollers=packRollers(head,sheaves);staticBatch(frame);staticBatch(guards);return {root,sheaves,haulSheaves,syncRollers};}

// Timber screens and a concrete podium inspired by Stalden–Gspon (AZARCH).
// The front contains two real, open-bottom cabin portals, not painted openings.
function stationBuilding(root,{deck,eave,inward,groundY,z,groundAt}){
 const building=new T.Group(),panels=new T.Group();building.name='Solo timber station hall';building.rotation.y=inward<0?Math.PI:0;building.add(panels);root.add(building);
 const W=20.4,half=W/2,rear=-12,front=15.5,length=front-rear,mid=(rear+front)/2,ridge=eave+.85,portalTop=eave-1.45;
 const timber=[0xa88b66,0x9b7b57,0xb09370].map(c=>mat(c,.88,.02)),backing=mat(0x554d41,.9,.04),plinth=mat(0xc4c5b9,1,0),charcoal=mat(0x344240,.7,.3),roofM=mat(0x46514f,.72,.25),glass=new T.MeshStandardMaterial({color:0x74918b,roughness:.25,metalness:.22,transparent:true,opacity:.72,depthWrite:false,side:T.DoubleSide});
 function cladding(width,height,x,y,v,side=false){
  box(panels,side?.18:width,height,side?width:.18,x,y,v,backing);
  const count=Math.ceil(width/.24),pitch=width/count,outward=side?Math.sign(x):Math.sign(v-mid);
  for(let i=0;i<count;i++){const at=(i+.5)*pitch-width/2;box(panels,side?.13:pitch*.76,height,side?pitch*.76:.13,x+(side?outward*.14:at),y,v+(side?at:outward*.14),timber[i%timber.length]);}
 }
 function pane(width,height,x,y,v,side=false){
  box(panels,side?.07:width,height,side?width:.07,x,y,v,glass);
  for(const edge of [-1,1]){box(panels,side?.12:width+.16,.1,side?width+.16:.12,x,y+edge*height/2,v,charcoal);box(panels,side?.12:.09,height,side?.09:.12,x+(side?0:edge*width/2),y,v+(side?edge*width/2:0),charcoal);}
 }
 function label(text,sub,w,h,x,y,v,angle=0){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#eee9db';c.textAlign='center';c.textBaseline='middle';c.font='180px Georgia';c.fillText(text,512,100,970);c.font='26px sans-serif';c.fillText(sub,512,219,970);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const sign=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide}));sign.position.set(x,y,v);sign.rotation.y=angle;building.add(sign);
 }
 // Extend the podium around the retained boarding channels and pedestrian deck.
 box(panels,7.2,.7,5.5,0,deck-.35,12.75,plinth);
 // Flare the approach slab away from the hanger before the cabin reaches floor level.
 for(const side of [-1,1]){const shape=new T.Shape();shape.moveTo(side*6.15,10);shape.lineTo(side*8.65,10);shape.lineTo(side*8.65,15.5);shape.lineTo(side*6.95,15.5);shape.closePath();const geometry=new T.ExtrudeGeometry(shape,{depth:.7,bevelEnabled:false});geometry.applyMatrix4(new T.Matrix4().set(1,0,0,0,0,0,-1,deck,0,1,0,0,0,0,0,1));mesh(panels,geometry,plinth);}
 for(const side of [-1,1])box(panels,2,.7,length,side*9.3,deck-.35,mid,plinth);
 box(panels,W,.7,4,0,deck-.35,-10,plinth);
 box(panels,5.4,.28,3,0,deck-.14,-13.5,plinth);
 for(let i=0;i<2;i++)box(panels,4.2,.2*(i+1),.5,0,deck-.6+.1*(i+1),-15.25+i*.5,plinth);
 for(const x of [-8.4,8.4]){
  const rearGround=groundAt(z+inward*(-8))-groundY,depth=Math.max(.5,deck-rearGround);
  box(panels,1.4,depth,2,x,deck-depth/2,-8,plinth);
  beam(panels,[x,deck-2.8,-7],[x,deck-.55,front-.5],.3,.4,charcoal);
 }
 // Opaque upper walls hide the machinery; a lower ribbon lights the boarding hall.
 const glassBottom=deck+1.25,glassTop=deck+3.8;
 for(const side of [-1,1]){
  box(panels,.32,1.3,length,side*half,deck+.65,mid,plinth);
  cladding(length,eave-glassTop,side*half,(eave+glassTop)/2,mid,true);
  const bays=8,pitch=length/bays;
  for(let i=0;i<bays;i++)pane(pitch-.12,glassTop-glassBottom,side*(half+.02),(glassTop+glassBottom)/2,rear+(i+.5)*pitch,true);
  box(panels,.42,.16,length,side*half,glassTop,mid,charcoal);
 }
 // Three façade piers leave both carriage lanes open through the full lower face.
 const wing=half-7;
 for(const x of [-half+wing/2,half-wing/2]){
  box(panels,wing,1.35,.4,x,deck+.675,front,plinth);
  cladding(wing,portalTop-deck-1.35,x,(portalTop+deck+1.35)/2,front);
 }
 box(panels,6.4,1.35,.4,0,deck+.675,front,plinth);
 pane(4.9,2.45,0,deck+2.65,front+.035);
 for(const x of [-2.85,2.85])cladding(.7,2.75,x,deck+2.725,front);
 cladding(6.4,portalTop-deck-4,0,(portalTop+deck+4)/2,front);
 cladding(W,eave-portalTop,0,(eave+portalTop)/2,front);
 for(const side of [-1,1]){
  for(const x of [side*3.2,side*7])box(panels,.18,portalTop-deck+.35,.42,x,(portalTop+deck-.35)/2,front+.04,charcoal);
  box(panels,3.98,.22,.45,side*5.1,portalTop,front+.04,charcoal);
  box(panels,1.9,.6,.08,side*5.1,portalTop+.65,front+.25,charcoal);
  label(side>0?'01':'02','EMBARQUEMENT',1.7,.48,side*5.1,portalTop+.65,front+.31);
 }
 box(panels,4.9,1.32,.12,0,deck+7.15,front+.18,charcoal);
 label('SOLO',inward===1?'VALLEY STATION':'SUMMIT STATION',4.45,1.12,0,deck+7.15,front+.26);
 // Rear entrance and service façade, on the solid side of the mountain shelf.
 cladding(W,eave-deck-3.5,0,(eave+deck+3.5)/2,rear);
 for(const side of [-1,1]){
  box(panels,7.9,1.3,.3,side*6.25,deck+.65,rear,plinth);
  pane(6.9,2.05,side*6.25,deck+2.45,rear-.04);
 }
 pane(3.1,3.3,0,deck+1.65,rear-.12);box(panels,.08,3.3,.14,0,deck+1.65,rear-.18,charcoal);
 box(panels,3,.75,.08,0,deck+4.2,rear-.25,charcoal);
 label('ENTRÉE','SOLO',2.7,.62,0,deck+4.2,rear-.31,Math.PI);
 // Shallow standing-seam roof, with a full overhang and a solid gable at each end.
 const roofHalf=half+.6,roofRear=rear-.65,roofFront=front+.8,shape=new T.Shape();
 shape.moveTo(-roofHalf,eave);shape.lineTo(0,ridge);shape.lineTo(roofHalf,eave);shape.lineTo(roofHalf,eave+.2);shape.lineTo(0,ridge+.2);shape.lineTo(-roofHalf,eave+.2);shape.closePath();
 const roofGeometry=new T.ExtrudeGeometry(shape,{depth:roofFront-roofRear,bevelEnabled:false,steps:1});roofGeometry.translate(0,0,roofRear);mesh(panels,roofGeometry,roofM);
 for(const end of [rear,front]){
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([-half,eave,end,half,eave,end,0,ridge,end],3));geometry.setIndex(end===front?[0,1,2]:[2,1,0]);geometry.computeVertexNormals();mesh(panels,geometry,timber[0]);
 }
 for(let x=-roofHalf+.7;x<roofHalf;x+=.85){const y=eave+.22+(1-Math.abs(x)/roofHalf)*.85;beam(panels,[x,y,roofRear],[x,y,roofFront],.025,.035,charcoal);}
 for(const side of [-1,1])beam(panels,[side*roofHalf,eave+.05,roofRear],[side*roofHalf,eave+.05,roofFront],.14,.18,charcoal);
 staticBatch(panels);building.userData.footprint={width:W,rear,front};return building;
}

function createStation({z,groundY,route,haul,inward,guideLength=12,flatArrival=false,groundAt=()=>groundY}){
 const root=new T.Group(),frame=new T.Group(),guards=new T.Group(),head=new T.Group(),sheaves=[];root.position.set(0,groundY,z);root.add(frame,guards,head);
 head.name='Solo station rope rollers';
 const compact=inward<0&&flatArrival,frameFront=compact?15.5:guideLength+1;
 const lane=5.1,deck=.6,track=u=>route(z+u)-groundY,roof=u=>track(u)+2.1,a=Math.min(-6*inward,frameFront*inward),b=Math.max(-6*inward,frameFront*inward),deckA=Math.min(-8*inward,10*inward),deckB=Math.max(-8*inward,10*inward);
 // The docking cage lands on the deck. For a compact flat arrival it stays
 // inside the hall; an embedded lattice portal carries the short external head.
 for(const x of [-7.2,7.2]){
  for(const u of [-5*inward,8*inward]){
   beam(frame,[x,deck,u],[x,roof(u),u],.32,.35,M.cage);
   box(frame,.7,.15,.7,x,deck+.075,u,M.edge);
  }
  beam(frame,[x,roof(a),a],[x,roof(b),b],.24,.35,M.cage);
  beam(frame,[x,roof(a)-1.35,a],[x,roof(b)-1.35,b],.15,.2,M.cage);
  const bays=4;
  for(let i=0;i<bays;i++){
   const p=a+(b-a)*i/bays,q=a+(b-a)*(i+1)/bays;
   beam(frame,[x,roof(p)-1.35,p],[x,roof(q),q],.1,.13,M.cage);
   beam(frame,[x,roof(p),p],[x,roof(p)-1.35,p],.1,.13,M.cage);
  }
 }
 for(let u=a;u<=b+.01;u+=4.5)beam(frame,[-7.2,roof(u),u],[7.2,roof(u),u],.2,.28,M.cage);
 const center=(deckA+deckB)/2;
 box(frame,7.2,.7,deckB-deckA,0,deck-.35,center,M.concrete);
 // Back anchor on solid terrain, plus exposed cantilever beams toward the cage.
 const rear=-7*inward,rearGround=groundAt(z+rear)-groundY;
 box(frame,17,.8,3,0,deck-.4,rear,M.concrete);
 for(const x of [-7.2,0,7.2]){
  beam(frame,[x,deck-.8,deckA],[x,deck-.8,deckB],.3,.45,M.edge);
  const depth=Math.max(.4,deck-.8-rearGround);
  box(frame,.9,depth,1.3,x,deck-.8-depth/2,rear,M.concrete);
 }
 for(const side of [-1,1]){
  box(frame,2.5,.7,deckB-deckA,side*7.4,deck-.35,center,M.concrete);
  for(let u=deckA;u<=deckB;u+=2)box(guards,.06,1,.06,side*8.55,deck+.5,u,M.cage);
  beam(guards,[side*8.55,deck+1,deckA],[side*8.55,deck+1,deckB],.05,.05,M.cage);
  // Saddle brackets use the same profile and local normals as the fixed cable.
  for(let contact=Math.min(-4*inward,guideLength*inward);contact<=Math.max(-4*inward,guideLength*inward);contact+=compact?1.6:.8){
   const m=(track(contact+.01)-track(contact-.01))/.02,n=Math.hypot(1,m),r=.18,offset=r+rig.trackRadius,u=contact+offset*m/n,y=track(contact)-offset/n;
   // Keep the carrying saddle supported by the internal frame or compact portal.
   // A fixed carrying rope uses a continuous saddle, as on the pylons.
   // These brackets support that saddle; there is no idle support-wheel bank.
   if(!compact||contact*inward<=15.5){beam(frame,[side*(lane-1.25),y-.2,u],[side*(lane-1.25),roof(u),u],.07,.09);beam(frame,[side*(lane-1.25),y,u],[side*lane,y,u],.08,.08);}
  }
  const points=[];for(let u=a;u<=b+.01;u+=.25)points.push([side*(lane-.3),track(u)-.5,u]);
  for(let i=1;i<points.length;i++)beam(frame,points[i-1],points[i],.16,.2);
  box(frame,.5,.55,.3,side*lane,track(0)+.2,-inward*2.6,M.rubber);
 }
 const haulTrack=u=>haul?haul(z+u)-groundY:track(u)+(rig.haulY-rig.trackY)*Math.hypot(1,(track(u+.01)-track(u-.01))/.02);
 for(const side of [-1,1]){
  saddle(frame,side*lane,Math.min(-4*inward,guideLength*inward),Math.max(-4*inward,guideLength*inward),track,rig.trackRadius);
  for(const offset of rig.haulOffsets||[-.85,.85]){
   const x=side*lane+offset,lo=inward>0?-3:-guideLength,hi=inward>0?guideLength:3;haulBank(frame,head,sheaves,x,lo,hi,haulTrack,compact?1.4:.8);
   for(const u of [lo,0,hi]){const inner=side*(lane-1.18),outer=side*(lane+1.18),y=haulTrack(u)+.46;if(compact&&u*inward>10)beam(frame,[inner,track(u)-1.2,u],[inner,y,u],.12,.14);else beam(frame,[inner,y,u],[inner,roof(u),u],.07,.09);beam(frame,[inner,y,u],[outer,y,u],.1,.12);}
  }
 }
 // A short Heavy Portal-style mast is embedded in the front podium. Its
 // flared feet and X-bracing support the crosshead from below; the guide nose
 // projects only 2.75 m beyond the 15.5 m facade, with no suspended roof cage.
 if(compact){
  const portal=new T.Group();portal.name='Embedded Heavy Portal arrival support';root.add(portal);
  const mid=12.8,footY=deck-.3,levels=4;
  const leg=(t,sx,sz)=>{const u=(mid+sz*1.55)*inward,top=track(u)-1.35;return[sx*(2.8-.7*t),footY+(top-footY)*t,u];};
  for(const sx of [-1,1])for(const sz of [-1,1]){
   const p=leg(0,sx,sz);box(portal,.9,.5,1.1,p[0],footY-.1,p[2],M.concrete);
   for(let i=0;i<levels;i++)beam(portal,leg(i/levels,sx,sz),leg((i+1)/levels,sx,sz),.25,.25,M.steel);
  }
  for(let i=0;i<levels;i++)for(const side of [-1,1])for(const axis of [0,1]){
   const p=(s,t)=>axis?leg(t,side,s):leg(t,s,side),a=i/levels,b=(i+1)/levels;
   beam(portal,p(-1,a),p(1,a),.1,.12,M.steel);beam(portal,p(-1,a),p(1,b),.1,.1,M.steel);beam(portal,p(1,a),p(-1,b),.1,.1,M.steel);
  }
  for(const v of [11.25,14.35]){
   const u=v*inward;beam(portal,[-5.22,track(u)-1.18,u],[5.22,track(u)-1.18,u],.34,.5,M.edge);
   for(const side of [-1,1])beam(portal,leg(.75,side,v<mid?-1:1),[side*4.65,track(u)-1.38,u],.2,.25,M.steel);
  }
  for(const side of [-1,1]){
   for(let v=10;v<18.25;v+=.5){const a=v*inward,b=Math.min(18.25,v+.5)*inward;
    beam(portal,[side*4.67,track(a)-.95,a],[side*4.67,track(b)-.95,b],.17,.24,M.edge);
    beam(portal,[side*5.1,track(a)-1.2,a],[side*5.1,track(b)-1.2,b],.14,.16,M.edge);
   }
   sidePlate(portal,side*(lane-.2),18.25*inward,10*inward,u=>track(u)-.2,.86);
   for(const v of [14.35,18]){const u=v*inward;beam(portal,[side*(lane-1.18),track(u)-1.2,u],[side*5.22,track(u)-1.2,u],.14,.16,M.edge);beam(portal,[side*4.67,track(u)-1.2,u],[side*lane,track(u)-.19,u],.13,.16);beam(portal,[side*4.67,track(u)-.45,u],[side*5.28,track(u)-.45,u],.12,.12);}
  }
  // The girder web stays beneath the carriage running line.
  staticBatch(portal);
 }
 const haulSheaves=[];
 const machineryTop=Math.max(...Array.from({length:25},(_,i)=>roof(a+(b-a)*i/24))),frontRope=track(15.5*inward)+(rig.haulY-rig.trackY)*Math.hypot(1,(track(15.51*inward)-track(15.49*inward))/.02);
 const building=stationBuilding(root,{deck,eave:Math.max(machineryTop+.65,frontRope+1.9),inward,groundY,z,groundAt});
 const syncRollers=packRollers(head,sheaves);staticBatch(frame);staticBatch(guards);for(const m of frame.children)if(m.material===M.concrete)m.userData.cutawayFoundation=true;return {root,sheaves,haulSheaves,building,syncRollers};
}
return {createTower,createStation};}};
