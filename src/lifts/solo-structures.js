// Approved Heavy Portal geometry reused by the complete Solo line study.
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
 }else box(wheel,.24,r*1.3,.04,0,0,0,M.edge);return wheel;}
function sidePlate(g,x,a,b,track,height){const positions=[],indices=[],steps=42;for(let i=0;i<=steps;i++){const z=a+(b-a)*i/steps,y=track(z);positions.push(x,y+.025,z,x,y-height,z);if(i<steps){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();mesh(g,geometry,M.guard);}
// Overhead haul-rope compression guide. The sliding wheel block clears the
// carriage clamp vertically, without diverting either rope sideways.
function holdDownBank(root,frame,{track,haulTrack,lane,first,last,count,worldZ}){
 const out=[],r=.26;
 for(const side of [-1,1]){
  const spine=[];
  for(let i=0;i<count;i++){
   const contact=first+(last-first)*i/(count-1),m=(haulTrack(contact+.01)-haulTrack(contact-.01))/.02,n=Math.hypot(1,m),offset=r+rig.haulRadius,z=contact-offset*m/n,y=haulTrack(contact)+offset/n,carrier=new T.Group();root.add(carrier);
   const wheel=roller(carrier,side*lane,y,z,r);
   for(const x of [side*(lane-.22),side*(lane+.22)]){
    box(frame,.1,.42,.12,x,y+.12,z,M.steel);
    box(carrier,.12,.13,.16,x,y,z,M.hub);
   }
   beam(carrier,[side*(lane-.25),y,z],[side*(lane+.25),y,z],.07,.07,M.edge);
   beam(frame,[side*(lane-.43),haulTrack(contact)+.82,contact],[side*(lane+.23),haulTrack(contact)+.82,contact],.1,.13);
   if(i===0||i===count-1)beam(frame,[side*(lane-.43),track(contact)-.95,contact],[side*(lane-.43),haulTrack(contact)+.82,contact],.13,.16);
   spine.push([side*(lane-.43),haulTrack(contact)+.82,contact]);
   out.push({wheel,carrier,worldZ:worldZ+contact,side,radius:r});
  }
  for(let i=1;i<spine.length;i++)beam(frame,spine[i-1],spine[i],.14,.18,M.edge);
 }
 return out;
}
function createTower({z,groundY,route,groundAt=()=>groundY}){
 const root=new T.Group(),frame=new T.Group(),guards=new T.Group(),head=new T.Group();root.position.set(0,groundY,z);root.add(frame,guards,head);
 const track=u=>route(z+u)-groundY,H=track(0),lane=5.1,half=5.1,d={height:H,base:8.4,depth:6.6,neck:4.2,head:10.2,levels:7,chord:.3,style:1};
 const needsHoldDown=((track(4.48)-track(3.98))/.5-(track(-3.98)-track(-4.48))/.5)>.002;
 const haulGap=rig.haulY-rig.trackY,haulTrack=u=>{const m=(track(u+.01)-track(u-.01))/.02;return track(u)+haulGap*Math.hypot(1,m);};
 function leg(y,sx,sz){const t=d.style===1?1-smooth(0,H*.3,y):1-smooth(0,H*.82,y);return[sx*(d.neck/2+(d.base-d.neck)/2*t),y+(groundAt(z+sz*d.depth/2)-groundY)*(1-smooth(0,H*.25,y)),sz*(d.neck*.42+(d.depth-d.neck*.84)/2*t)];}
 for(const sx of [-1,1])for(const sz of [-1,1]){const foot=leg(0,sx,sz);box(frame,2,.7,2,foot[0],foot[1]+.15,foot[2],M.concrete);box(frame,1.1,.15,1.1,foot[0],foot[1]+.58,foot[2],M.edge);for(let i=0;i<d.levels;i++){const a=(H-1.6)*i/d.levels,b=(H-1.6)*(i+1)/d.levels;beam(frame,leg(a,sx,sz),leg(b,sx,sz),d.chord,d.chord,M.steel);}}
 for(let i=0;i<d.levels;i++){const a=.65+(H-2.25)*i/d.levels,b=.65+(H-2.25)*(i+1)/d.levels;for(const side of [-1,1]){for(const axis of [0,1]){const p=(s,y)=>axis===0?leg(y,s,side):leg(y,side,s);beam(frame,p(-1,a),p(1,a),.11,.12);beam(frame,p(-1,a),p(1,b),d.style===1?.1:.085,.1);beam(frame,p(1,a),p(-1,b),d.style===1?.1:.085,.1);}}}
 // Low crosshead: two transverse girders carry longitudinal saddle/roller beams.
 // Keep the approved shaft and flared feet; no raised crown or full-width solid deck.

 for(const z of [-1.55,1.55]){
  beam(frame,[-5.22,H-1.18,z],[5.22,H-1.18,z],.34,.5,M.edge);
  for(const side of [-1,1])beam(frame,leg(H-4.1,side,Math.sign(z)),[side*4.65,H-1.38,z],.2,.25);
 }
 box(guards,2.8,.09,3.9,0,H-1.18,0,M.guard);

 const count=8,radius=.48,first=-half+.62,last=half-.62;
 for(const side of [-1,1]){
  // Narrow inner walkway leaves the rope, saddle and wheel faces visible.
  box(guards,.82,.09,d.head-.3,side*3.25,H-1.15,0,M.guard);
  for(const z of [-half+.2,-half*.5,0,half*.5,half-.2]){
   box(guards,.05,1.02,.05,side*2.85,H-.64,z,M.hub);
   beam(frame,[side*3.0,H-1.2,z],[side*5.18,H-1.2,z],.12,.16);
  }
  for(const y of [H-.13,H-.65])beam(guards,[side*2.85,y,-half+.2],[side*2.85,y,half-.2],.045,.045,M.hub);
  // Large wheels support the lower track rope from underneath.
  // The upper haul rope stays vertically aligned on a separate guide plate.
  const nodes=[];
  for(let i=0;i<count;i++){
   const z=first+(last-first)*i/(count-1),upper=track(z)-.95;
   nodes.push({z,upper});
   if(i){const prev=nodes[i-1];
    beam(frame,[side*4.67,prev.upper,prev.z],[side*4.67,upper,z],.17,.24,M.edge);
    beam(frame,[side*5.1,H-1.7,prev.z],[side*5.1,H-1.7,z],.14,.16);

   }
   if(i===1||i===count-2)beam(frame,[side*4.67,H-1.7,z],[side*4.67,upper,z],.13,.16);
  }
 }
 // Access ladder reaches the central landing, below the open crosshead.
 for(const x0 of [-.25,.25])for(let y=.6;y<H-1.3;y+=.7)beam(guards,[x0,y,leg(y,1,-1)[2]-.18],[x0,Math.min(H-1.2,y+.7),leg(Math.min(H-1.2,y+.7),1,-1)[2]-.18],.055,.055,M.hub);
 for(let y=.8;y<H-1.2;y+=.38){const z=leg(y,1,-1)[2]-.18;beam(guards,[-.25,y,z],[.25,y,z],.035,.035,M.hub);}
 const sheaves=[];
 for(const side of [-1,1]){
  for(let i=0;i<count;i++){
   const contactZ=first+(last-first)*i/(count-1),m=(track(contactZ+.01)-track(contactZ-.01))/.02,n=Math.hypot(1,m),offset=radius+rig.trackRadius,z=contactZ+offset*m/n,y=track(contactZ)-offset/n;
   const wheel=roller(head,side*lane,y,z,radius);
   // Fork bearings and through-axle visibly connect each wheel to its carrier.
   for(const x of [side*4.82,side*5.38]){
    beam(frame,[x,track(z)-.95,z],[x,y,z],.11,.17,M.steel);
    box(frame,.12,.22,.26,x,y,z,M.hub);
   }
   beam(frame,[side*4.67,track(z)-.95,z],[side*5.38,track(z)-.95,z],.09,.12);
   beam(frame,[side*4.73,y,z],[side*5.47,y,z],.095,.095,M.edge);
   sheaves.push({wheel,z,side,radius});
  }
 // Recessed upper-rope carrier with small saddle pads at cable height.
 // Full-length inboard backing plate follows the wheel row without hiding its outer faces.
 sidePlate(frame,side*(lane-.24),first-.42,last+.42,z=>track(z)-.13,1.02);
 if(!needsHoldDown){
 const guide=[];for(let z=-half;z<=half+.01;z+=.25)guide.push([side*lane,haulTrack(z)-.24,z]);
 for(let i=1;i<guide.length;i++)beam(frame,guide[i-1],guide[i],.13,.1,M.hub);
 for(const z of [-half+.4,-half*.5,0,half*.5,half-.4])box(frame,.09,.168,.23,side*lane,haulTrack(z)-.106,z,M.hub);
 for(const z of [-half+.5,0,half-.5]){
  beam(frame,[side*4.67,track(z)-.95,z],[side*4.67,haulTrack(z)-.30,z],.1,.12);
  beam(frame,[side*4.67,haulTrack(z)-.30,z],[side*lane,haulTrack(z)-.30,z],.12,.13);
 }
 }
 }
 const haulSheaves=needsHoldDown?holdDownBank(root,frame,{track,haulTrack,lane,first,last,count:8,worldZ:z}):[];
 root.userData.guideMode=needsHoldDown?'hold-down':'support';
 staticBatch(frame);staticBatch(guards);return {root,sheaves,haulSheaves};}

function createStation({z,groundY,route,inward,groundAt=()=>groundY}){
 const root=new T.Group(),frame=new T.Group(),guards=new T.Group();root.position.set(0,groundY,z);root.add(frame,guards);
 const lane=5.1,deck=.6,track=u=>route(z+u)-groundY,roof=u=>track(u)+2.1,a=Math.min(-6*inward,13*inward),b=Math.max(-6*inward,13*inward),deckA=Math.min(-8*inward,10*inward),deckB=Math.max(-8*inward,10*inward);
 // Fixed inclined guide cage projects beyond the platform toward the open span.
 // Its supports land on the deck; the upper deck cantilevers over the cliff.
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
  // Wheel contact uses the same profile and local normals as the visible cable.
  for(let contact=Math.min(-4*inward,12*inward);contact<=Math.max(-4*inward,12*inward);contact+=.8){
   const m=(track(contact+.01)-track(contact-.01))/.02,n=Math.hypot(1,m),r=.18,offset=r+rig.trackRadius,u=contact+offset*m/n,y=track(contact)-offset/n;
   roller(frame,side*lane,y,u,r);
   beam(frame,[side*(lane-.3),y-.2,u],[side*(lane-.3),roof(u),u],.07,.09);
   beam(frame,[side*(lane-.3),y,u],[side*lane,y,u],.08,.08);
  }
  const points=[];for(let u=a;u<=b+.01;u+=.25)points.push([side*(lane-.3),track(u)-.5,u]);
  for(let i=1;i<points.length;i++)beam(frame,points[i-1],points[i],.16,.2);
  box(frame,.5,.55,.3,side*lane,track(0)+.2,-inward*2.6,M.rubber);
 }
 const haulTrack=u=>{const m=(track(u+.01)-track(u-.01))/.02;return track(u)+(rig.haulY-rig.trackY)*Math.hypot(1,m);};
 const first=Math.min(6*inward,12*inward),last=Math.max(6*inward,12*inward),haulSheaves=holdDownBank(root,frame,{track,haulTrack,lane,first,last,count:7,worldZ:z});
 staticBatch(frame);staticBatch(guards);return {root,sheaves:[],haulSheaves};
}
return {createTower,createStation};}};
