// Approved cabin skins on the existing detachable line. One shared, merged
// template per line; instances render the carriers while their transforms animate.
window.LiftCoGondolaRuntime={createFactory(T,spec,{color=spec.defaultColor}={}){
 const family=window.LiftCoGondolaStudies.families[spec.cabinFamily];
 const variantIndex=family.variants.findIndex(v=>v.id===spec.cabinVariant);
 if(variantIndex<0)throw Error('Cabin model unavailable: '+spec.label);
 const v=family.variants[variantIndex],isJaillet=spec.cabinFamily==='jaillet',isArbois=spec.cabinFamily==='arbois';
 // On station rails the rope/track is 5.16 m above the foundation; the deck is
 // 0.52 m high. Set every cabin floor 4.64 m below the running gear.
 const floorY=isJaillet?.16:.1825,ropeHeight=4.64+floorY;
 const studyFactory=window.LiftCoGondolaStudies.createFactory(T,{ropeHeight,runtime:true});
 const model=studyFactory.make(spec.cabinFamily,variantIndex);model.setColor(color??0xe8e8df);
 model.passengers.parent.remove(model.passengers);model.root.remove(model.rope);
 const g=new T.Group(),suspension=new T.Group();suspension.position.y=-.18;g.add(suspension);
 const grip=model.gear.getObjectByName('cabin-grip');model.gear.remove(grip);grip.position.set(0,0,0);grip.rotation.y=model.gear.rotation.y;g.add(grip);
 model.root.name='cabin-coordinate-frame';model.root.position.y=.18-ropeHeight;suspension.add(model.root);
 const moving=[],skiGroups=[],placeholders=[];
 g.traverse(o=>{if(o.userData.cabinMotion)moving.push(o);if(o.userData.cabinSkiPlaceholder)placeholders.push(o);});
 const skiPaint=new T.MeshStandardMaterial({color:0xb7352c,roughness:.48}),skiDark=new T.MeshStandardMaterial({color:0x263234,roughness:.75}),skiAlloy=new T.MeshStandardMaterial({color:0xa1adae,metalness:.6,roughness:.45});
 const bladeG=new T.BoxGeometry(.045,1.58,.054),bindingG=new T.BoxGeometry(.068,.17,.075),tipG=new T.BoxGeometry(.045,.13,.054);
 function skiPair(parent,x,z,seat){
  const group=new T.Group();group.name='runtime-ski-seat-'+seat;group.position.set(x,.17,z);group.visible=false;parent.add(group);skiGroups.push(group);
  for(const dz of [-.035,.035]){
   const blade=new T.Mesh(bladeG,skiPaint);blade.position.set(0,.79,dz);group.add(blade);
   const binding=new T.Mesh(bindingG,skiDark);binding.position.set(-.025,.68,dz);group.add(binding);
   const heel=new T.Mesh(bindingG,skiAlloy);heel.scale.y=.45;heel.position.set(-.025,.93,dz);group.add(heel);
   const tip=new T.Mesh(tipG,skiPaint);tip.position.set(-.012,1.63,dz);tip.rotation.z=-.18;group.add(tip);
  }
 }
 if(isArbois){
  let seat=0;
  for(const original of placeholders){
   const parent=original.parent,x=original.children[0].position.x,z=(original.children[0].position.z+original.children[4].position.z)/2;
   parent.remove(original);for(const dz of [-.085,.085])skiPair(parent,x,z+dz,seat++);
  }
 }else if(isJaillet){
  for(let seat=0;seat<4;seat++)skiPair(model.body,(seat%2?1:-1)*v.w*.17,(seat<2?1:-1)*(v.w*.46+.10),seat);
 }else{
  for(let seat=0;seat<4;seat++)skiPair(model.body,v.w*.54+.015,(seat-1.5)*.23,seat);
 }
 const jaws=[grip.getObjectByName('grip-jaw-left'),grip.getObjectByName('grip-jaw-right')];
 const wheels=[grip.getObjectByName('grip-running-wheel-front'),grip.getObjectByName('grip-running-wheel-rear')];
 // Merge each static region separately so doors, shell halves, skis and running
 // gear retain their own transforms. Transparent glazing is a separate material.
 function batch(parent,excluded=new Set()){
  g.updateMatrixWorld(true);const inverse=parent.matrixWorld.clone().invert(),groups=new Map();
  function visit(o){
   if(excluded.has(o))return;
   if(o.isMesh){const key=o.material.uuid+'|'+o.castShadow+'|'+o.receiveShadow;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);}
   for(const child of o.children)visit(child);
  }
  for(const child of parent.children)visit(child);
  for(const meshes of groups.values()){
   const positions=[],normals=[],uvs=[];
   for(const node of meshes){
    const geometry=(node.geometry.index?node.geometry.toNonIndexed():node.geometry.clone()).applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,node.matrixWorld));
    const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
    for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));uvs.push(uv?uv.getX(i):0,uv?uv.getY(i):0);}geometry.dispose();
   }
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.computeBoundingSphere();
   const merged=new T.Mesh(geometry,meshes[0].material);merged.castShadow=meshes[0].castShadow;merged.receiveShadow=meshes[0].receiveShadow;
   for(const node of meshes)node.parent.remove(node);parent.add(merged);
  }
 }
 for(const ski of skiGroups)batch(ski);
 for(const part of moving)batch(part,new Set(skiGroups));
 batch(suspension,new Set([...moving,...skiGroups]));batch(grip,new Set([...jaws,...wheels]));
 const templateParts=[];g.traverse(o=>{if(o.isMesh){o.name='runtime-part-'+templateParts.length;templateParts.push(o);}});
 // Preserve named moving grip pieces after assigning render-part names.
 jaws.forEach((jaw,i)=>jaw.userData.gripJaw=i+1);wheels.forEach((wheel,i)=>wheel.userData.runningWheel=i+1);
 const quat=new T.Quaternion();
 function create(){
  const clone=g.clone(true),suspended=clone.children.find(o=>o!==clone.getObjectByName('cabin-grip'));
  const frame=clone.getObjectByName('cabin-coordinate-frame'),motions=[],rackSkis=[],gripJaws=[],runningWheels=[],parts=[];
  clone.traverse(o=>{
   if(o.userData.cabinMotion){const data=o.userData.cabinMotion;motions.push({node:o,data,axis:data.axis?new T.Vector3(...data.axis):null,rest:data.restYaw!==undefined?new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),data.restYaw):null});}
   if(o.name.startsWith('runtime-ski-seat-'))rackSkis[+o.name.slice('runtime-ski-seat-'.length)]=o;
   if(o.userData.gripJaw)gripJaws[o.userData.gripJaw-1]=o;
   if(o.userData.runningWheel)runningWheels[o.userData.runningWheel-1]=o;
   if(o.isMesh)parts[+o.name.slice('runtime-part-'.length)]=o;
  });
  const seatHeight=isJaillet?.685:.675,seatY=seatHeight-.95*.75;
  const seatAnchors=Array.from({length:4},(_,seat)=>new T.Vector3((seat%2?1:-1)*v.w*.18,seatY,(seat<2?1:-1)*(isJaillet?.22:v.d*.27)));
  const seatYaw=Array.from({length:4},(_,seat)=>isJaillet?(seat<2?0:Math.PI):(seat<2?Math.PI:0));
  const eye=new T.Vector3(-v.w*.18,.18-ropeHeight+1.39,isJaillet?.22:-v.d*.27);
  function updateModel(open){for(const {node,data,axis,rest} of motions){
   if(data.kind==='shell'){const t=T.MathUtils.clamp(open,0,1),sweep=t*t*(3-2*t);quat.setFromAxisAngle(axis,data.end*data.angle*sweep);node.quaternion.copy(quat).multiply(rest);}
   else if(data.kind==='parallel'){node.position.set(-.36*open,0,-1.04*open);node.rotation.y=-.16*open;}
   else{node.position.set(-.07*open,0,data.sign*.62*open);}
  }}
  return{g:clone,suspension:suspended,interiorFrame:frame,seatAnchors,seatYaw,eye,seatedCabin:true,gripJaws,runningWheels,rackSkis,doors:[],riders:Array(4).fill(null),door:0,updateModel,renderParts:parts};
 }
 let instances=[],lineRoot=null,carriers=[];
 const inverse=new T.Matrix4(),matrix=new T.Matrix4(),hidden=new T.Matrix4().makeScale(0,0,0);
 function bindInstances(root,cabins){
  lineRoot=root;carriers=cabins;
  instances=templateParts.map((part,index)=>{
   const mesh=new T.InstancedMesh(part.geometry,part.material,carriers.length);mesh.name=spec.id+' carriers / '+index;mesh.userData.carrierInstances=true;mesh.castShadow=part.castShadow;mesh.receiveShadow=part.receiveShadow;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(mesh);return mesh;
  });
  for(const carrier of carriers)for(const part of carrier.renderParts){part.userData.instancedPart=true;part.visible=false;}
  updateInstances();
 }
 function updateInstances(){
  if(!lineRoot)return;inverse.copy(lineRoot.matrixWorld).invert();
  for(let partIndex=0;partIndex<instances.length;partIndex++){
   const mesh=instances[partIndex];
   for(let i=0;i<carriers.length;i++){
    const part=carriers[i].renderParts[partIndex];let visible=true;
    for(let p=part.parent;p&&p!==lineRoot;p=p.parent)if(!p.visible&&!p.userData.instancedPart){visible=false;break;}
    mesh.setMatrixAt(i,visible?matrix.multiplyMatrices(inverse,part.matrixWorld):hidden);
   }
   mesh.instanceMatrix.needsUpdate=true;
  }
 }
 return{create,bindInstances,updateInstances};
}};
