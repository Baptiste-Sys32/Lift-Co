import * as T from 'three';
import {mergeGeometries} from '../../assets/vendor/three/BufferGeometryUtils.js';
import {referenceFactory} from './station-reference-buildings.js';

export function makeStationStudy(lift,variant,role){
 if(!variant)throw Error('No station design retained for '+lift.group);
 const root=new T.Group(),shell=new T.Group(),carriers=new T.Group(),mechanical=new T.Group();root.add(mechanical,shell,carriers);
 const fixed=lift.category==='fixed',isSolo=lift.category==='tram',train=lift.category==='funitel',current=false;
 let core,track=5.2,centerZ=0,animate=()=>{},detail=new T.Vector3();
 const mat=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness,side:T.DoubleSide});
 const mats={paint:mat(0x4c746b,.48,.3),steel:mat(0x83908d,.5,.65),ivory:mat(0xeeeade),dark:mat(0x303d3c,.5,.4),concrete:mat(0xb9b9ab,1),wood:mat(0x886342,.85),woodLight:mat(0xb19066,.85),rubber:mat(0x252b2b,.95),yellow:mat(0xc2a347,.5,.3),red:mat(0xac493c,.5,.3),glass:new T.MeshStandardMaterial({color:0x658784,roughness:.18,metalness:.2,transparent:true,opacity:.63,depthWrite:false,side:T.DoubleSide})};
 const box=(p,w,h,d,x,y,z,m=mats.steel)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);p.add(o);return o;};
 const beam=(p,a,b,w=.1,d=w,m=mats.steel)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av),o=box(p,w,delta.length(),d,0,0,0,m);o.position.copy(av).add(bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;};
 const surface=(p,rows,m)=>{const n=rows[0].length,vertices=rows.flat(2),index=[];for(let j=0;j<rows.length-1;j++)for(let i=0;i<n-1;i++){const a=j*n+i;index.push(a,a+1,a+n,a+1,a+n+1,a+n);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(index);g.computeVertexNormals();const o=new T.Mesh(g,m);p.add(o);return o;};
 function plaque(text,width,x,y,z,parent=shell){const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e8e4d7';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#2d4641';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 45px Barlow, sans-serif';ctx.fillText(text.toUpperCase(),512,64,970);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(width,width/8),new T.MeshBasicMaterial({map,side:T.DoubleSide}));o.position.set(x,y,z);o.rotation.y=Math.PI;parent.add(o);return o;}
 const megeve=['arbois','jaillet','panorama','touring'].includes(lift.carrier),family=lift.carrier==='arbois'?'arbois':lift.carrier==='jaillet'?'jaillet':'princesse',cabDef=megeve?window.LiftCoGondolaStudies.families[family].variants[lift.carrier==='touring'?1:0]:null;
 const bodyHalf=lift.carrier==='gondola'?1.1816:lift.carrier==='princesse'?1.1817:cabDef?cabDef.w*Math.max(1,cabDef.belly||1)/2+.04:1.2;
 const boardingY=lift.carrier==='gondola'?5.2-3.8*1.12:lift.carrier==='princesse'?5.2-4.2+.245:5.2-4.82+.1825;
 const reference=referenceFactory({root,shell,mechanical,mats,box,beam,surface,plaque,batch,boardingY,gearLift:megeve?.05:0,bodyHalf});
 const vehicles=[],motion={phase:'Running',velocity:0,displacement:0},extraDynamic=new Set();
 const curve=(parent,fn,a,b,r,material)=>{class Profile extends T.Curve{getPoint(t,out=new T.Vector3()){return out.copy(fn(T.MathUtils.lerp(a,b,t)));}}const o=new T.Mesh(new T.TubeGeometry(new Profile(),160,r,7,false),material);parent.add(o);return o;};
 function addCarrier(kind,x,ropeY,z,yaw=0){
  let model,asset,origin=0;
  if(['arcabulle','alps5','panoramabahn','princesse'].includes(kind)){model=window.LiftCoNextStudies.createFactory(T).make(kind,1);model.rope.removeFromParent();asset=model.root;origin=kind==='princesse'?4.2:5.2;}
  else if(kind==='ridge'||kind==='classic'){model=(kind==='ridge'?window.LiftCoRidge:window.LiftCoClassic).createFactory(T).create();asset=model.g;}
  else if(kind==='solo'){const f=window.LiftCoSolo.createFactory(T);model=f.create();asset=model.g;origin=model.trolleyY+f.rig.trackY;}
  else if(kind==='train'){model=window.LiftCoFunitelStudy.createFactory(T).makeCabin(0,{stubs:false});asset=model.root;origin=3.6;}
  else if(kind==='gondola'){
   const temporary=new T.Scene(),line=window.createGondolaLift(T,{scene:temporary,heightAt:()=>0,definition:{name:'Study',base:[0,0],top:[0,100],cabins:2,color:lift.color,towers:[30,70]}});
   model=line.cabins[0];asset=model.g;asset.removeFromParent();asset.position.set(0,0,0);asset.quaternion.identity();asset.scale.setScalar(1.12);disposeTree(temporary,asset);
  }else{const family=kind==='arbois'?'arbois':kind==='jaillet'?'jaillet':'princesse';model=window.LiftCoGondolaStudies.createFactory(T,{ropeHeight:4.82,runtime:true}).make(family,kind==='touring'?1:0);model.rope.removeFromParent();asset=model.root;origin=4.82;}
  // Solo uses the same root and hierarchy as its production runtime. Its
  // trolley must never be under the pendulum pivot or baked into the root.
  const pose=kind==='solo'?asset:new T.Group();pose.name='Carrier / '+kind;carriers.add(pose);
  if(kind!=='solo'){pose.add(asset);asset.position.y=-origin;}
  pose.position.set(x,ropeY-(kind==='solo'?origin:0),z);pose.rotation.y=yaw;
  const runningWheels=[...(model.runningWheels||[])];asset.traverse(o=>{if(o.userData.nextRunningWheel||o.name.startsWith('grip-running-wheel')||kind==='gondola'&&o.geometry?.type==='CylinderGeometry'&&o.geometry.parameters.radiusTop===.09)runningWheels.push(o);});
  for(const w of runningWheels){const valve=new T.Mesh(new T.BoxGeometry(.018,.015,.015),mats.steel);if(Math.abs(w.rotation.z)>.1)valve.position.set(.075,0,.04);else valve.position.set(.045,.075,0);w.add(valve);}
  const record={root:pose,asset,model,origin,kind,yaw,initialZ:z,runningWheels};
  if(kind==='solo'){
   const rig=window.LiftCoSolo.createFactory(T).rig,hingeHeight=model.trolleyY+rig.frameY;
   asset.add(model.trolley);record.hanging=new T.Group();record.hanging.name='Solo suspension hinge';asset.add(record.hanging);
   record.hanging.add(model.suspension);model.suspension.add(model.body);model.suspension.position.set(-.4,-hingeHeight,0);record.hanging.position.set(.4,hingeHeight,0);
  }
  vehicles.push(record);return record;
 }
 function shuttle(seconds,span){
  const hold=2.8,travel=16,half=hold+travel,phase=((seconds%(half*2))+half*2)%(half*2),reverse=phase>=half,u=phase%half;
  if(u<hold)return{q:reverse?1:0,velocity:0,acceleration:0,doors:T.MathUtils.smoothstep(u,0,.7)*(1-T.MathUtils.smoothstep(u,hold-.9,hold)),phase:'Boarding / dwell'};
  const t=(u-hold)/travel,sign=reverse?-1:1,q=(1-Math.cos(Math.PI*t))/2;
  return{q:reverse?1-q:q,velocity:sign*span*Math.PI*Math.sin(Math.PI*t)/(2*travel),acceleration:sign*span*Math.PI*Math.PI*Math.cos(Math.PI*t)/(2*travel*travel),phase:reverse?'Return approach':'Outbound / departure'};
 }
 function openDoors(record,value){
  if(record.model.setOpen)record.model.setOpen(value);
  else if(record.kind==='solo')for(const d of record.model.doors)d.g.position.z=T.MathUtils.lerp(d.closed,d.open,value);
 }
 if(isSolo){
  const rig=window.LiftCoSolo.createFactory(T).rig,summit=role==='summit';
  const slope=z=>summit?0:.21*T.MathUtils.clamp((z-8)/8,0,1),route=z=>{const u=Math.max(0,z-8);return 7.31+(summit?0:u<8?.21*u*u/16:.21*(u-4));},haul=z=>route(z)+(rig.haulY-rig.trackY)*Math.hypot(1,slope(z));
  const carriageProfile={heightAt:route,slopeAt:slope,
   offsetHeightAt(z,gap){let contact=z;for(let i=0;i<12;i++){const m=slope(contact);contact=z+gap*m/Math.hypot(1,m);}return route(contact)+gap/Math.hypot(1,slope(contact));},
   tractionProfile(){return{heightAt:haul};}
  };
  const distances=[0];for(let i=1;i<=440;i++){const a=1+(i-1)/20,b=1+i/20;distances.push(distances.at(-1)+Math.hypot(b-a,route(b)-route(a)));}
  const travel=distances.at(-1),zAt=d=>{let lo=0,hi=440;while(hi-lo>1){const mid=(lo+hi)>>1;if(distances[mid]<=d)lo=mid;else hi=mid;}return 1+(lo+T.MathUtils.clamp((d-distances[lo])/(distances[hi]-distances[lo]),0,1))/20;};
  core=window.LiftCoSoloStructures.createFactory(T,rig).createStation({z:summit?100:0,groundY:0,route,haul,inward:summit?-1:1,flatArrival:summit,groundAt:()=>0});core.root.position.z=0;if(summit)core.root.rotation.y=Math.PI;mechanical.add(core.root);core.building.visible=false;centerZ=2;track=7.31;detail.set(5.1,7.8,8);
  // A summit must use its own constant profile at both ends of this isolated
  // adapter, not a valley slope accidentally evaluated at world Z=100.
  const machinery=window.LiftCoSoloMachinery.create(T,{parent:mechanical,length:100,lane:5.1,route,haul,guides:[],slope,rig,baseGround:0,topGround:0});
  if(summit){machinery.root.rotation.y=Math.PI;machinery.root.position.z=100;}
  // Fixed carrying ropes continue beyond the saddle. They do not move with
  // the haul ropes, and their sampled height also positions the carriages.
  for(const side of [-1,1])curve(mechanical,z=>new T.Vector3(side*5.1,route(z),z),-4.5,30,rig.trackRadius,mats.dark);
  const A=addCarrier('solo',5.1,route(1),1),B=addCarrier('solo',-5.1,route(23),23,Math.PI);
  animate=seconds=>{
   const run=shuttle(seconds,travel),d=run.q*travel;Object.assign(motion,{phase:run.phase,velocity:run.velocity,displacement:d});
   for(const [c,z,dir]of [[A,zAt(d),1],[B,zAt(travel-d),-1]]){
    const pitch=-Math.atan(slope(z)),index=dir<0?1:0,asset=c.model.g;
    asset.position.set(asset.position.x,route(z)-rig.trackY*Math.cos(pitch)-c.model.trolleyY,z-rig.trackY*Math.sin(pitch));asset.rotation.set(0,c.yaw,0);c.model.trolley.rotation.x=index?-pitch:pitch;
    window.LiftCoSoloRuntime.seatCarriage(c.model,index,carriageProfile,rig);
    const angle=c.model.trolley.rotation.x;c.hanging.position.set(.4,c.model.trolleyY+rig.frameY*Math.cos(angle),rig.frameY*Math.sin(angle));c.hanging.rotation.x=-Math.atan2(run.acceleration*dir*Math.cos(c.yaw),9.81)*.35;

    for(const w of c.model.wheels)w.rotation.x=d/.16;openDoors(c,Math.abs(run.velocity)<.001&&z<1.05?run.doors||0:0);
   }
   for(const w of core.sheaves)w.wheel.rotation.x=d*w.side/w.radius;core.syncRollers();machinery.setDrive(d,run.velocity);
  };
  core.drive=machinery;core.carriageProfile=carriageProfile;core.route=route;core.haul=haul;
 }else if(train){
  if(variant.form==='bouquetin')core=reference.funitelCore(role);
  else{core=window.LiftCoFunitelStudy.createFactory(T).makeStation(variant.form==='rocharbois'?0:1,{stubs:true,role:role==='valley'?'drive':'return'});mechanical.add(core.root);core.roof.visible=false;core.building.visible=false;}
  track=core.ropeY;detail.set(0,4.3,8);
  const A=addCarrier('train',3.5,track,-1),B=addCarrier('train',-3.5,track,-19,Math.PI);
  animate=seconds=>{const run=shuttle(seconds,18),d=18*run.q;Object.assign(motion,{phase:run.phase,velocity:run.velocity,displacement:d});A.root.position.z=-1-d;B.root.position.z=-19+d;openDoors(A,Math.abs(run.velocity)<.001&&run.q<.001?run.doors||0:0);openDoors(B,Math.abs(run.velocity)<.001&&run.q>.999?run.doors||0:0);core.setDrive(d);};
 }else{
  core=fixed?reference.fixedCore(variant.form,role):reference.terminalCore(variant.form,lift.category,role);track=core.trackY;centerZ=core.centerZ;detail.set(...core.detailTarget);
  // Keep each yawed axle mount fixed; rotate a child in its local axle frame.
  core.rollerSpinners=(core.rollers||[]).map(mount=>{const rotor=new T.Group();rotor.name='Tyre rotor / local axle X';for(const part of [...mount.children])rotor.add(part);mount.add(rotor);return{mount,rotor};});
  const vehicle=addCarrier(lift.carrier,fixed?core.contactR:3.1,track,4);
  animate=seconds=>{
   const speed=fixed?1.2:.65,d=seconds*speed,p=core.sample(d+(fixed?8:14));vehicle.root.position.set(p.x,track,p.z);vehicle.root.rotation.y=p.yaw+(megeve?Math.PI:0);vehicle.root.visible=p.visible;for(const w of vehicle.runningWheels)w.rotation.x=d/(megeve?.10:.09);
   const ropeDistance=seconds*(fixed?speed:3);for(const w of core.pulleys)w.rotation.y=-ropeDistance/(fixed?core.contactR:w.userData.radius+.008);
   for(const {mount,rotor}of core.rollerSpinners)rotor.rotation.x=-(mount.userData.laneSide||1)*d/.24;
   for(const r of core.motorRotors||[])r.rotation.z=ropeDistance/(fixed?core.contactR:2.558)*48;
   Object.assign(motion,{phase:fixed?'Fixed grip / constant speed':'Detached station crawl',velocity:speed,displacement:d});
  };
 }
 reference.build(variant.form,core.length);animate(0);root.updateMatrixWorld(true);if(isSolo)cropStation(mechanical,-15.5,31);
 const dynamic=new Set([...(core.pulleys||[]),...(core.rollers||[]),...(core.motorRotors||[])]);
 // Native reversible cores retain their coupled rotor handles and instancing.
 if(!isSolo&&(!train||variant.form==='bouquetin'))batch(mechanical,dynamic);batch(shell);
 for(const c of vehicles){
  const keep=new Set([...(c.model.wheels||[]),...c.runningWheels,...(c.model.doors||[]).map(d=>d.g||d.group||d.m||d)]);if(c.hanging){keep.add(c.hanging);keep.add(c.model.trolley);for(const grip of c.model.haulGrips)keep.add(grip.g);}
  if(c.kind==='train')continue;batch(c.asset,keep);if(c.hanging){batch(c.hanging,keep);batch(c.model.trolley,keep);}
 }
 const person=new T.Group();box(person,.45,.65,.3,0,1.15,0,mats.paint);const head=new T.Mesh(new T.SphereGeometry(.16,12,8),mats.ivory);head.position.y=1.7;person.add(head);for(const x of [-.13,.13])box(person,.14,.75,.17,x,.45,0,mats.dark);person.position.set(train?0:fixed?-4.7:isSolo?0:5.1,train?.2275:isSolo?.6:fixed?0:boardingY,0);carriers.add(person);
 root.traverse(o=>{if(o.isMesh){o.castShadow=!o.material?.transparent;o.receiveShadow=true;}});
 root.updateMatrixWorld(true);const bounds=new T.Box3();root.traverse(o=>{if(o.isMesh&&visible(o)){o.geometry.computeBoundingBox();bounds.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));}});bounds.min.y=Math.max(-.6,bounds.min.y);
 const center=bounds.getCenter(new T.Vector3());root.position.set(-center.x,0,-centerZ);detail.add(root.position);bounds.translate(root.position);
 const syncWheels=!isSolo?instanceMovingMeshes(mechanical,dynamic):()=>{};syncWheels();
 return{root,shell,carriers,vehicles,motion,bounds,detail,animate(seconds){animate(seconds);syncWheels();},core,form:variant.form,fixed,track,boardingY,cutaway(on){shell.visible=!on;},dispose(){disposeTree(root);reference.disposeCache();}};
}
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
function cropStation(parent,z0,z1){
 // The shared Solo machinery batches both endpoints into some single meshes.
 // Clip triangles, rather than hiding that whole batch and losing local frames.
 parent.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!visible(o))return;o.geometry.computeBoundingBox();const bounds=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);if(bounds.min.z>=z0&&bounds.max.z<=z1)return;if(bounds.max.z<z0||bounds.min.z>z1){o.visible=false;return;}
  const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(),p=g.attributes.position,point=new T.Vector3(),keep=[];
  for(let i=0;i<p.count;i+=3){let inside=true;for(let j=0;j<3;j++){point.fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld);if(point.z<z0||point.z>z1)inside=false;}if(inside)keep.push(i,i+1,i+2);}
  if(!keep.length){o.visible=false;g.dispose();return;}const clipped=new T.BufferGeometry();for(const [name,a]of Object.entries(g.attributes)){const array=new Float32Array(keep.length*a.itemSize);keep.forEach((at,i)=>{for(let k=0;k<a.itemSize;k++)array[i*a.itemSize+k]=a.array[at*a.itemSize+k];});clipped.setAttribute(name,new T.BufferAttribute(array,a.itemSize));}o.geometry=clipped;g.dispose();
 });
}
function instanceMovingMeshes(parent,handles){
 const groups=new Map();for(const handle of handles)handle.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||!o.visible)return;const key=o.geometry.uuid+o.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);o.visible=false;});
 const batches=[];for(const sources of groups.values()){const instances=new T.InstancedMesh(sources[0].geometry,sources[0].material,sources.length);instances.instanceMatrix.setUsage(T.DynamicDrawUsage);instances.frustumCulled=false;parent.add(instances);batches.push({instances,sources});}
 const inverse=new T.Matrix4(),matrix=new T.Matrix4();return()=>{parent.updateWorldMatrix(true,true);inverse.copy(parent.matrixWorld).invert();for(const {instances,sources}of batches){sources.forEach((o,i)=>instances.setMatrixAt(i,matrix.multiplyMatrices(inverse,o.matrixWorld)));instances.instanceMatrix.needsUpdate=true;}};
}
function batch(root,keep=new Set()){
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),groups=new Map(),remove=[];
 root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||!visible(o))return;for(let p=o;p&&p!==root;p=p.parent)if(keep.has(p))return;const geometry=o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));if(!o.material.map)geometry.deleteAttribute('uv');geometry.deleteAttribute('color');if(!geometry.index){const indices=Array.from({length:geometry.attributes.position.count},(_,i)=>i);geometry.setIndex(indices);}const key=o.material.uuid;if(!groups.has(key))groups.set(key,{material:o.material,geometries:[]});groups.get(key).geometries.push(geometry);remove.push(o);});
 for(const {material,geometries}of groups.values()){const merged=mergeGeometries(geometries);if(!merged)throw Error('Station mesh batching failed');const mesh=new T.Mesh(merged,material);mesh.castShadow=!material.transparent;mesh.receiveShadow=true;root.add(mesh);geometries.forEach(g=>g.dispose());}remove.forEach(o=>{o.removeFromParent();o.geometry.dispose();});
}
function disposeTree(root,exclude=null){const retained=new Set();exclude?.traverse(o=>{if(o.geometry)retained.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){retained.add(m);if(m.map)retained.add(m.map);}});const resources=new Set();root.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){resources.add(m);if(m.map)resources.add(m.map);}});resources.forEach(r=>{if(!retained.has(r))r.dispose();});}
