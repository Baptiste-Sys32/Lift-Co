// The four approved B models share a circulating runtime. Only the two dedicated
// catalog entries have a transfer curve; only Palace8 has pedestrian mid access.
window.LiftCoNextRuntime=(()=>{
 const A=window.LiftCoNextAlignment,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const specFor=d=>window.LiftCoLiftTypes.find(s=>s.id===d.type);
 function layoutFor(def,ctx){
  ctx.prepare(def);const path=A.make(def),spec=specFor(def),L=path.length;
  const groundAt=(x,s)=>{const p=path.at(s,x);return(ctx.terrain||ctx.ground)(p.x,p.z);};
  const groups=window.LiftCoTowerMast.groups({towers:def.towers,length:L,threshold:def.groupDistance??7,groundAt});
  const midY=def.stationGround.mid+(spec.family==='panoramabahn'?8.2:5.2),startY=def.stationGround[1]+5.2,endY=def.stationGround[-1]+5.2;
  const members=groups.flatMap(g=>g.members),spans=path.midStart===null?[[0,L,startY,endY]]:[[0,path.midStart,startY,midY],[path.midEnd,L,midY,endY]];
  const layouts=spans.map(([start,end,a,b])=>{const towers=members.filter(m=>m.headDistance>start&&m.headDistance<end).map(m=>({id:m.tower.id,sourceIndex:m.sourceIndex,fraction:(m.headDistance-start)/(end-start),height:m.height,headDistance:m.headDistance,footDistance:m.distance,footGround:m.anchorGround,columnValid:m.valid}));const l=new window.LiftBuilderCore.LiftLayout({start:{x:0,z:0,height:a},end:{x:0,z:end-start,height:b},towers,sag:def.sag,tautTerminals:true,terminalGuides:true});return{start,end,layout:l};});
  function heightAt(s){if(path.midStart!==null&&s>=path.midStart&&s<=path.midEnd)return midY;const item=s<=(path.midStart??L)?layouts[0]:layouts.at(-1);return item.layout.heightAt(s-item.start);}
  const nodes=[{id:'start',kind:'station',distance:0,height:startY},...members.map(m=>({id:m.tower.id,kind:'tower',sourceIndex:m.sourceIndex,distance:m.headDistance,headDistance:m.headDistance,height:m.height,footDistance:m.distance,footGround:m.anchorGround,columnValid:m.valid,compression:heightAt(m.headDistance+.3)+heightAt(m.headDistance-.3)-2*heightAt(m.headDistance)>.0001})),...(path.midStart===null?[]:[{id:'mid-entry',kind:'station',distance:path.midStart,height:midY},{id:'mid-exit',kind:'station',distance:path.midEnd,height:midY}]),{id:'end',kind:'station',distance:L,height:endY}].sort((a,b)=>a.distance-b.distance);
  return{path,length:L,dx:path.u.x,dz:path.u.z,nodes,foundationGroups:groups,heightAt,slopeAt:s=>(heightAt(s+.05)-heightAt(s-.05))/.1,pointAt(s,side=0,height){const p=path.at(s,side);return{...p,y:height??heightAt(s)};},layouts};
 }
 function create(T,def,index,ctx){
  const spec=specFor(def),family=spec.family,isChair=!!spec.isChair,fixed=!!spec.fixedGrip,layout=layoutFor(def,ctx),path=layout.path,L=path.length,R=spec.railX||3.1,tail=fixed?12:26,turn=Math.PI*R,straight=L+2*tail,total=2*straight+2*turn;
  const root=new T.Group();root.name=def.name;ctx.scene.add(root);
  const study=window.LiftCoNextStudies.createFactory(T),structures=window.LiftCoNextStructures.createFactory(T,{makeCarrier:id=>study.make(id,1),runtime:true});
  const standardPylons=[],pylonFactory=family==='princesse'?window.LiftCoGondolaPylons.createFactory(T):null;
  const stationRoofs=[],stationModels=[],spinners=[],supports=layout.nodes.map(n=>({...n,z:L/2-n.distance,number:n.kind==='tower'?n.sourceIndex+1:undefined}));
  const ground=ctx.terrain||ctx.ground;
  const floorOffset=fixed?.645:family==='princesse'?1.19:.26;
  const LIFT={type:spec.id,isChair,fixedGrip:fixed,capacity:spec.capacity,carrierName:spec.carrierName,halfWidth:spec.halfWidth,halfLength:spec.halfLength,sideX:R,railX:R,cableSpeed:spec.cableSpeed,stationSpeed:spec.stationSpeed,base:new T.Vector3(...[def.base[0],def.stationGround[1]+5.2,def.base[1]]),top:new T.Vector3(def.top[0],def.stationGround[-1]+5.2,def.top[1])};
  const stationDatum=end=>def.stationGround[end==='base'?1:end==='top'?-1:'mid'];
  function worldPoint(x,z){const p=path.at(L/2-z,x);return new T.Vector3(p.x,ground(p.x,p.z),p.z);}
  function addBox(parent,w,h,d,x,y,z,color){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.8}));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
  for(const frame of A.stationFrames(def)){
   const mid=frame.end==='mid',model=!mid&&def.stationStyle==='delta'?window.LiftCoStationArchitecture.create('delta',{fixed:true,radius:R,role:frame.end==='base'?'valley':'summit'}):structures.station(family,{role:mid?'intermediate':'terminal',angle:path.angle}),datum=stationDatum(frame.end);
   if(!mid&&def.stationStyle==='princesse'){model.roof.removeFromParent();const architecture=window.LiftCoStationArchitecture.create('princesse',{length:26,boardingY:floorOffset,deckEnd:26,deckOuter:7.2});model.root.add(architecture.root);model.roof=architecture.roof;model.architecture=architecture;}

   model.root.position.set(frame.x,datum,frame.z);model.root.rotation.y=frame.yaw;
   if(fixed){model.root.position.add(new T.Vector3(Math.sin(frame.yaw)*tail,0,Math.cos(frame.yaw)*tail));}
   model.root.userData.stationEnd=frame.end;root.add(model.root);if(!mid&&def.stationStyle&&def.stationStyle!=='default')window.LiftCoStationArchitecture.support(model.architecture||model,ground);stationRoofs.push(model.roof);stationModels.push({frame,model,datum});
   for(const roller of model.rollers||[]){const rotor=new T.Group();roller.add(rotor);for(const child of [...roller.children])if(child!==rotor)rotor.add(child);spinners.push({node:rotor,axis:'x',radius:.24,conveyor:true,roller,frame,model,speed:spec.stationSpeed,sign:-(roller.userData.laneSide||Math.sign(roller.position.x)||1)});}
   for(const [i,wheel]of (model.pulleys||[]).entries())spinners.push({node:wheel,axis:'y',radius:mid?.9:fixed?2.2:2.55,speed:null,sign:mid?(i?1:-1)*(Math.sign(path.angle)||1):-1});
   for(const node of model.motorRotors||[])spinners.push({node,axis:'z',radius:R/48,speed:null,sign:-1});
   // Raised decks retain the hillside and carry their piers down to real ground.
   if(def.stationFoundations?.[frame.end]==='raised'){
    if(mid){const points=[],indices=[],inv=model.root.matrixWorld.clone();model.root.updateWorldMatrix(true,false);inv.copy(model.root.matrixWorld).invert();for(let i=0;i<=24;i++){const d=path.midStart+(path.midEnd-path.midStart)*i/24;for(const side of [-8,8]){const p=path.at(d,side),v=new T.Vector3(p.x,datum-.12,p.z).applyMatrix4(inv);points.push(v.x,v.y,v.z);}if(i<24){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));geo.setIndex(indices);geo.computeVertexNormals();model.root.add(new T.Mesh(geo,new T.MeshStandardMaterial({color:0xa8afa3,roughness:.8,side:T.DoubleSide})));}else addBox(model.root,16,.24,tail+13,0,-.12,fixed?-5:tail/2,0xa8afa3);
    for(const side of [-1,0,1])for(const z of (mid?[-8,8]:fixed?[-9.6,-1.9]:[3,tail-4])){const sample=mid?model.sample(z<0?.16:.84):{x:0,z,nx:1,nz:0},x=sample.x+side*5.8*sample.nx,localZ=sample.z+side*5.8*sample.nz;window.LiftCoFoundations.create(T,{parent:model.root,x,z:localZ,top:0,width:1.1,depth:1.5,groundAt:(x,z)=>{const p=model.root.localToWorld(new T.Vector3(x,0,z));return ctx.ground(p.x,p.z)-datum;},material:new T.MeshStandardMaterial({color:0xa8afa3,roughness:.8})});}
   }
   batch(model.roof);batch(model.root,new Set([model.roof,model.mechanics,model.supports].filter(Boolean)));
  }
  for(const group of layout.foundationGroups)if(group.shared){const centre=(group.start+group.end)/2,p=path.at(centre),g=new T.Group();g.position.set(p.x,0,p.z);g.rotation.y=Math.atan2(p.dx,p.dz);root.add(g);window.LiftCoFoundations.create(T,{parent:g,top:group.top,width:window.LiftCoFoundations.width(Math.max(...group.members.map(m=>m.tower.height)),group.width),depth:group.end-group.start,groundAt:(x,z)=>{const p=path.at(centre+z,-x);return ground(p.x,p.z);},material:new T.MeshStandardMaterial({color:0xaeb4aa,roughness:.95})});}
  for(const node of layout.nodes.filter(n=>n.kind==='tower')){
   if(pylonFactory){
    // Use the same procedural pylon as the straight gondolas. Its local +Z
    // points towards A; sampling converts that axis to this span's distance.
    const t=def.towers[node.sourceIndex],head=path.at(node.distance),foot=path.at(t.fraction*L),yaw=Math.atan2(-head.dx,-head.dz),g=new T.Group();g.name='Tower '+(node.sourceIndex+1);g.userData.towerId=t.id;g.position.set(head.x,0,head.z);g.rotation.y=yaw;root.add(g);
    const delta=new T.Vector3(foot.x-head.x,0,foot.z-head.z).applyAxisAngle(new T.Vector3(0,1,0),-yaw),groundAt=(x,z)=>ground(head.x+Math.cos(yaw)*x+Math.sin(yaw)*z,head.z-Math.sin(yaw)*x+Math.cos(yaw)*z),groundY=groundAt(0,0),shared=layout.foundationGroups.some(f=>f.shared&&f.members.some(m=>m.tower.id===t.id)),gap=Math.min(...layout.nodes.filter(n=>n!==node).map(n=>Math.abs(n.distance-node.distance)));
    const model=pylonFactory.create({parent:g,ropeY:node.height,ground:groundY,neighbourGap:gap,sideX:R,compression:node.compression,support:{number:node.sourceIndex+1,sharedFoundation:shared},towerDef:t,fixedFoot:{x:delta.x,y:node.footGround-(groundY-.25)-.05,z:delta.z,valid:node.columnValid!==false},groundAt,cableAt:z=>layout.heightAt(node.distance-z),preview:def.preview,lightFixtures:ctx.lightFixtures,lightingRoot:root,ropeContactRadius:.358});
    // One selectable owner for merged structure and moving wheel parts.
    delete model.root.userData.towerId;delete model.root.userData.number;
    const moving=new Set([...model.wheels.map(w=>w.m),...model.wheels.filter(w=>w.compression).flatMap(w=>[w.axle,w.mount]),...model.pairs.map(p=>p.mesh)]);batch(g,moving);
    for(const w of model.wheels)spinners.push({node:w.m,axis:'x',radius:.34,speed:null,sign:-w.dir,pylon:true});
    model.root.updateWorldMatrix(true,true);standardPylons.push({model,inverse:model.root.matrixWorld.clone().invert(),points:[]});continue;
   }

   const t=def.towers[node.sourceIndex],neighbours=layout.nodes.filter(n=>n.kind==='tower'&&n!==node),gap=Math.min(Infinity,...neighbours.map(n=>Math.abs(n.distance-node.distance))),normalCount=family==='alps5'?4:family==='princesse'?6:8,bankCount=Math.max(2,Math.min(normalCount,2*Math.floor(((gap-.7)/.76+1)/2))),model=structures.pylon(family,{count:bankCount,halfDeck:Math.min(family==='alps5'?.68:family==='princesse'?1.45:1.2,(gap-.12)/2)}),foot=path.at(t.fraction*L),head=path.at(node.distance),yaw=Math.atan2(head.dx,head.dz),g=new T.Group();g.name='Tower '+(node.sourceIndex+1);g.userData.towerId=t.id;g.position.set(head.x,0,head.z);g.rotation.y=yaw;root.add(g);
   // Keep the approved head at full size. The mast alone adapts in height/tilt,
   // with an explicit fixed footing and the saved shared-foundation datum.
   model.roof.removeFromParent();g.add(model.roof);model.roof.position.y=node.height-10.3;
   const delta=new T.Vector3(foot.x-head.x,0,foot.z-head.z).applyAxisAngle(new T.Vector3(0,1,0),-yaw);
   const offset=family==='alps5'?1.05:family==='princesse'?1.37:1.65;
   window.LiftCoTowerMast.create(T,{parent:g,headY:node.height-offset,groundAt:(x,z)=>ground(head.x+Math.cos(yaw)*x+Math.sin(yaw)*z,head.z-Math.sin(yaw)*x+Math.cos(yaw)*z),footOverride:{x:delta.x,y:node.footGround,z:delta.z},steel:model.paint,concrete:new T.MeshStandardMaterial({color:0xaeb4aa}),dark:new T.MeshStandardMaterial({color:0x354342}),foundation:!layout.foundationGroups.find(f=>f.members.some(m=>m.tower.id===t.id))?.shared});
   // Keep the crossbeam, deck and rails rigid and level. Only the inboard
   // sheave supports follow the cable, tapering to their fixed top attachments.
   // Reflecting arbitrary vertices of a merged head tears triangles into panels.
   const bankFrames=new Set(model.frames),headMeshes=[];
   model.roof.traverse(o=>{if(!o.isMesh||model.wheels.some(w=>{for(let p=o;p;p=p.parent)if(p===w)return true;return false;}))return;let bank=false;for(let p=o;p;p=p.parent)if(bankFrames.has(p))bank=true;headMeshes.push({mesh:o,bank});});
   model.roof.updateWorldMatrix(true,true);const inv=model.roof.matrixWorld.clone().invert(),attachment=family==='alps5'?10.95:family==='princesse'?13.05:12.25;
   for(const {mesh,bank}of headMeshes){const geo=mesh.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv,mesh.matrixWorld)),p=geo.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(family==='alps5')x*=R/2.45;if(bank){const weight=clamp((attachment-y)/(attachment-9.96),0,1),s=node.distance+z,slope=layout.slopeAt(s),n=Math.hypot(1,slope),contact=layout.heightAt(s)-node.height,dy=y-10.3,compression=node.compression?.68:0;y+=weight*(contact+dy/n-dy+compression/n);z-=weight*(dy+compression)*slope/n;}p.setXYZ(i,x,y,z);}geo.computeVertexNormals();geo.computeBoundingSphere();mesh.geometry=geo;model.roof.attach(mesh);mesh.position.set(0,0,0);mesh.rotation.set(0,0,0);mesh.scale.setScalar(1);}
   for(const wheel of model.wheels){const z=wheel.position.z,s=node.distance+z,slope=layout.slopeAt(s),normal=Math.hypot(1,slope),sign=node.compression?1:-1;wheel.position.x*=family==='alps5'?R/2.45:1;wheel.position.y=10.3+layout.heightAt(s)-node.height+sign*.34/normal;wheel.position.z=z-sign*.34*slope/normal;}

   batch(model.roof,new Set(model.wheels));
   batch(g,new Set([model.roof]));
   for(const wheel of model.wheels)spinners.push({node:wheel,axis:'x',radius:.322,speed:null,sign:wheel.position.x>0?1:-1,pylon:true});
  }
  const guideAdapters=[];for(const span of layout.layouts){const a=path.at(span.start),b=path.at(span.end),group=new T.Group();group.position.set((a.x+b.x)/2,0,(a.z+b.z)/2);group.rotation.y=Math.atan2(a.x-b.x,a.z-b.z);root.add(group);const guide=window.LiftCoStationGuides.create(T,{root:group,layout:span.layout,half:(span.end-span.start)/2,railX:R,fixedGrip:fixed,ropeRadius:.018});batch(guide.group,new Set(guide.wheels.flatMap(w=>[w.carrier,w.slider].filter(Boolean))));for(const w of guide.wheels)spinners.push({node:w.m,axis:'x',radius:w.radius,speed:null,sign:-w.dir});guideAdapters.push({guide,root:group,carriers:[]});}
  function stationInfo(s){s=((s%total)+total)%total;const forward=s<straight,dist=forward?s-tail:L+tail-(s-straight-turn);
   for(const [end,centre]of [['base',2*straight+turn],['top',straight]]){const delta=((s-centre+total/2)%total+total)%total-total/2;if(delta>=-tail&&delta<=turn+tail)return{end,phase:delta<0?'arrival':delta>turn?'departure':'turn',distance:delta<0?-delta:delta>turn?delta-turn:0};}
   if(path.midStart!==null&&dist>=path.midStart-12&&dist<=path.midEnd+12)return{end:'mid',phase:'through',distance:dist<path.midStart?path.midStart-dist:dist>path.midEnd?dist-path.midEnd:0,direction:forward?1:-1,along:dist,inside:Math.min(dist-path.midStart,path.midEnd-dist)};
   return null;
  }
  const targetSpeedAt=s=>{if(fixed)return LIFT.cableSpeed;const info=stationInfo(s);if(!info)return LIFT.cableSpeed;if(info.end==='mid'){const t=clamp(info.inside/4,0,1);return Math.min(LIFT.cableSpeed,spec.stationSpeed+(LIFT.cableSpeed-spec.stationSpeed)*(1-t*t*(3-2*t)));}const f=clamp((info.distance-(info.end==='mid'?0:tail-12))/12,0,1);return Math.min(LIFT.cableSpeed,spec.stationSpeed+(LIFT.cableSpeed-spec.stationSpeed)*f*f*(3-2*f));};
  const pos=(s,out)=>{s=((s%total)+total)%total;if(s<straight){const d=s-tail,p=path.at(d,-R);return out.set(p.x,layout.heightAt(d),p.z);}if(s<straight+turn){const a=(s-straight)/R,p=path.at(L+tail+Math.sin(a)*R,-Math.cos(a)*R);return out.set(p.x,LIFT.top.y,p.z);}if(s<2*straight+turn){const d=L+tail-(s-straight-turn),p=path.at(d,R);return out.set(p.x,layout.heightAt(d),p.z);}const a=(s-2*straight-turn)/R,p=path.at(-tail-Math.sin(a)*R,Math.cos(a)*R);return out.set(p.x,LIFT.base.y,p.z);};
  const va=new T.Vector3(),vb=new T.Vector3(),LOOP={total,straight,turn,pos,dir(s,out){pos(s-.03,va);pos(s+.03,vb);return out.subVectors(vb,va).normalize();}};
  // Carrier path and haul path are separate inside detachable stations. Transfer
  // grips remain on rails while the rope follows its supported internal pulleys.
  const midModel=stationModels.find(s=>s.frame.end==='mid')?.model;
  const haulTables=(midModel?.haulPaths||[]).map((p,index)=>{const side=index?1:-1,half=path.half,blendLength=half/2,smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);},points=p.points.map(original=>{const q=original.clone(),incoming=1-smooth((q.z+half)/blendLength),along=q.x*Math.sin(path.angle)+q.z*Math.cos(path.angle),outgoing=smooth((along-half+blendLength)/blendLength);q.x+=side*(R-1.3)*(incoming+outgoing*Math.cos(path.angle));q.z-=side*(R-1.3)*outgoing*Math.sin(path.angle);q.y+=.22*(incoming+outgoing);return q;}),distances=[0];for(let i=1;i<points.length;i++)distances.push(distances.at(-1)+points[i].distanceTo(points[i-1]));return{points,distances,length:distances.at(-1)};});root.updateMatrixWorld(true);
  function midHaul(side,t,out){const table=haulTables[side>0?1:0],d=clamp(t,0,1)*table.length;let lo=0,hi=table.distances.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(table.distances[m]<=d)lo=m;else hi=m;}out.copy(table.points[lo]).lerp(table.points[hi],(d-table.distances[lo])/(table.distances[hi]-table.distances[lo]||1));return midModel.root.localToWorld(out);}
  function ropePoint(s,out){pos(s,out);if(fixed)return out;const info=stationInfo(s);if(!info)return out;const project=path.project(out.x,out.z),d=project.distance;
   if(info.end==='mid'){
    const distance=s<straight?s-tail:L+tail-(s-straight-turn),side=s<straight?-1:1;if(distance>=path.midStart&&distance<=path.midEnd&&haulTables.length)return midHaul(-side,(distance-path.midStart)/(path.midEnd-path.midStart),out);
   }else{const end=info.end==='base'?0:L,tangent=info.end==='base'?path.u:path.v,origin=info.end==='base'?def.base:def.top,dx=out.x-origin[0],dz=out.z-origin[1],across=-tangent.z*dx+tangent.x*dz,along=tangent.x*dx+tangent.z*dz,release=1-clamp(info.distance/tail,0,1),r=R-.55*release;const adjusted=across*(r/R),sign=info.end==='base'?-1:1,centre=sign*tail,adjustedAlong=info.phase==='turn'?centre+(along-centre)*(r/R):along;out.x=origin[0]+tangent.x*adjustedAlong-tangent.z*adjusted;out.z=origin[1]+tangent.z*adjustedAlong+tangent.x*adjusted;out.y-=.22*release;}
   return out;
  }
  const ropePoints=[];for(let s=0;s<total;){ropePoints.push(ropePoint(s,new T.Vector3()));s+=stationInfo(s)?.06:.4;}
  // Dense rings around station wheels, coarser rings on open spans. A uniform
  // long-line TubeGeometry would either cut pulley corners or waste vertices.
  const ropePositions=[],ropeNormals=[],ropeIndices=[],right=new T.Vector3(),up=new T.Vector3(),tangent=new T.Vector3();for(let i=0;i<ropePoints.length;i++){tangent.subVectors(ropePoints[(i+1)%ropePoints.length],ropePoints[(i+ropePoints.length-1)%ropePoints.length]).normalize();right.set(tangent.z,0,-tangent.x).normalize();if(right.lengthSq()<.001)right.set(1,0,0);up.crossVectors(tangent,right).normalize();for(let j=0;j<5;j++){const angle=j/5*Math.PI*2,n=right.clone().multiplyScalar(Math.cos(angle)).addScaledVector(up,Math.sin(angle));ropeNormals.push(n.x,n.y,n.z);ropePositions.push(ropePoints[i].x+n.x*.018,ropePoints[i].y+n.y*.018,ropePoints[i].z+n.z*.018);const a=i*5+j,b=((i+1)%ropePoints.length)*5+j,c=i*5+(j+1)%5,d=((i+1)%ropePoints.length)*5+(j+1)%5;ropeIndices.push(a,c,b,c,d,b);}}
  const ropeGeometry=new T.BufferGeometry();ropeGeometry.setAttribute('position',new T.Float32BufferAttribute(ropePositions,3));ropeGeometry.setAttribute('normal',new T.Float32BufferAttribute(ropeNormals,3));ropeGeometry.setIndex(ropeIndices);ropeGeometry.computeBoundingSphere();const ropeMaterial=new T.MeshStandardMaterial({color:0x303a3c,metalness:.5,roughness:.6});root.add(new T.Mesh(ropeGeometry,ropeMaterial));
  const timetable={positions:[0],times:[0],duration:0};if(!def.preview){pos(0,va);for(let s=.3;s<total+.3;s+=.3){const at=Math.min(total,s);pos(at,vb);timetable.duration+=va.distanceTo(vb)/Math.max(.1,(targetSpeedAt(at)+targetSpeedAt(Math.max(0,at-.3)))/2);timetable.positions.push(at);timetable.times.push(timetable.duration);va.copy(vb);}}
  const max=Math.max(2,Math.floor(timetable.duration/(spec.stationPitch/spec.stationSpeed))),count=def.preview?0:Math.max(2,Math.min(max,Math.round(Number(def.operations?.count))||max));
  LIFT.cabins=count;
  const cabins=[],instanceSources=[];
  function batch(parent,excluded=new Set()){
   // Merge static regions by material while retaining bubble, bar and door roots.
   const dummy=window.LiftCoStudyMachinery.createFactory(T,{geo(){},mesh(p,g,m){const o=new T.Mesh(g,m);p.add(o);return o;}});dummy.merge(parent,excluded);
  }
  if(count){const model=study.make(family,1);model.passengers.removeFromParent();model.rope.removeFromParent();model.setColor(def.color??spec.defaultColor);model.root.name='body-frame';model.gear.name='runtime-grip';if(model.safety)model.safety.name='runtime-bar';model.roof.name='runtime-bubble';(model.doors||[]).forEach((d,i)=>d.name='runtime-door-'+i);
   const skiGroups=[];if(!isChair){const bladeG=new T.BoxGeometry(.035,1.5,.045),bindingG=new T.BoxGeometry(.07,.16,.075),paint=new T.MeshStandardMaterial({color:0xaf3930,roughness:.5}),dark=new T.MeshStandardMaterial({color:0x253633});for(let seat=0;seat<8;seat++){const g=new T.Group();g.userData.nextSkiSeat=seat;g.position.set(((seat%4)-1.5)*.10,.36,.22);g.visible=false;model.doors[seat<4?0:1].add(g);for(const x of [-.024,.024]){const blade=new T.Mesh(bladeG,paint);blade.position.set(x,.75,0);g.add(blade);const binding=new T.Mesh(bindingG,dark);binding.position.set(x,.68,.025);g.add(binding);}batch(g);skiGroups.push(g);}}
   const moving=[model.gear,model.safety,model.roof,...(model.doors||[])].filter(Boolean);for(const m of moving){const excluded=new Set();m.traverse(o=>{if(o.userData.nextGripJaw||o.userData.nextRunningWheel||o.userData.nextSkiSeat!==undefined)excluded.add(o);});batch(m,excluded);}batch(model.root,new Set(moving));
   const template=new T.Group(),suspension=new T.Group();suspension.name='suspension';template.add(suspension);const gear=model.gear;gear.removeFromParent();gear.position.y=0;template.add(gear);model.root.position.y=-(isChair?5.2:4.2);if(!isChair)model.root.rotation.y=Math.PI/2;suspension.add(model.root);
   const templateParts=[];template.traverse(o=>{if(o.isMesh){o.name='carrier-part-'+templateParts.length;templateParts.push(o);}});
   for(let i=0;i<count;i++){
    const g=template.clone(true),gripJaws=[],runningWheels=[],rackSkis=[];g.traverse(o=>{if(o.userData.nextGripJaw)gripJaws.push(o);if(o.userData.nextRunningWheel)runningWheels.push(o);if(o.userData.nextSkiSeat!==undefined)rackSkis[o.userData.nextSkiSeat]=o;});const gear=g.getObjectByName('runtime-grip'),suspension=g.getObjectByName('suspension'),frame=g.getObjectByName('body-frame'),bar=g.getObjectByName('runtime-bar'),bubble=g.getObjectByName('runtime-bubble'),doors=[g.getObjectByName('runtime-door-0'),g.getObjectByName('runtime-door-1')].filter(Boolean),parts=[];g.traverse(o=>{if(o.isMesh)parts[+o.name.slice(13)]=o;});root.add(g);
    const anchors=Array.from({length:spec.capacity},(_,seat)=>isChair?new T.Vector3((seat-(spec.capacity-1)/2)*model.variant.w/spec.capacity,1.35-.95*.75,-.02):new T.Vector3((seat<4?-1:1)*model.variant.w*.34,.71-.95*.75,((seat%4)-1.5)*model.variant.d*.18));
    const c={g,suspension,interiorFrame:frame,seatAnchors:anchors,seatYaw:anchors.map((p)=>isChair?0:p.x<0?Math.PI:0),eye:new T.Vector3(0,(isChair?2.4-5.2:1.65-4.2),.05),seatedCabin:!isChair,isChair,seatScale:.75,riders:Array(spec.capacity).fill(null),sway:0,swayVelocity:0,yaw:0,speed:0,door:0,parts,bar,bubble,doors,gear,gripJaws,runningWheels,rackSkis};
    const time=i/count*timetable.duration;let j=1;while(timetable.times[j]<time)j++;c.s=timetable.positions[j-1]+(timetable.positions[j]-timetable.positions[j-1])*(time-timetable.times[j-1])/(timetable.times[j]-timetable.times[j-1]);cabins.push(c);
   }
   for(let part=0;part<templateParts.length;part++){const source=templateParts[part],mesh=new T.InstancedMesh(source.geometry,source.material,count);mesh.name=spec.id+' carriers / '+part;mesh.userData.carrierInstances=true;mesh.frustumCulled=false;mesh.castShadow=!source.material.transparent;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(mesh);instanceSources.push({mesh,nodes:cabins.map(c=>c.parts[part])});}for(const c of cabins)for(const m of c.parts)m.visible=false;
  }
  // Repeated machinery parts share instanced geometry, but retain moving nodes.
  const conveyorStations=new WeakMap(),wheelGroups=new Map();for(const spin of spinners){if(def.preview&&spin.pylon)continue;spin.node.traverse(o=>{if(!o.isMesh)return;if(spin.conveyor)conveyorStations.set(o,spin.model.root);const key=o.geometry.uuid+'|'+o.material.uuid;if(!wheelGroups.has(key))wheelGroups.set(key,[]);wheelGroups.get(key).push(o);});}for(const nodes of wheelGroups.values()){const first=nodes[0],mesh=new T.InstancedMesh(first.geometry,first.material,nodes.length);mesh.frustumCulled=false;mesh.castShadow=true;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(mesh);instanceSources.push({mesh,nodes});for(const o of nodes)o.visible=false;}
  function gateInfo(end,dest){
   const forward=end==='base'||end==='mid'&&dest!=='base',direction=forward?1:-1;
   let loadD=end==='base'?-tail+14:end==='top'?L+tail-14:path.midDistance+direction*4;
   let unloadD=end==='base'?-tail+14:end==='top'?L+tail-14:path.midDistance-direction*4;
   if(fixed){loadD=end==='base'?-tail+6:L+tail-6;unloadD=loadD;}
   const toS=(d,fwd)=>fwd?tail+d:straight+turn+L+tail-d;
   const gate=toS(loadD,forward),unloadGate=toS(unloadD,!forward),p=path.at(loadD,-direction*(R+1.2)),q=path.at(unloadD,direction*(R+1.2)),y=stationDatum(end)+floorOffset;
   return{end,gate,unloadGate,load:new T.Vector3(p.x,y,p.z),unload:new T.Vector3(q.x,y,q.z),queuePoint(i){const t=path.at(loadD-direction*i*.85,-direction*(R+2.6));return new T.Vector3(t.x,y,t.z);}};
  }
  const wrapDist=(a,b)=>{const d=Math.abs(a-b)%total;return Math.min(d,total-d);};
  function openAt(s){const info=stationInfo(s);return !!info&&(info.end==='mid'?family==='princesse'&&info.inside>4:info.distance<(fixed?10:15));}
  const conveyorPoint=new T.Vector3();
  function conveyorPosition(w){const {roller,frame,model}=w,side=roller.userData.laneSide||Math.sign(roller.position.x)||1;if(roller.userData.turnAngle!==undefined)return(frame.end==='top'?straight:2*straight+turn)+roller.userData.turnAngle*R;if(frame.end==='mid'){model.root.localToWorld(conveyorPoint.copy(roller.position));const d=path.project(conveyorPoint.x,conveyorPoint.z).distance;return side>0?tail+d:straight+turn+L+tail-d;}const z=roller.position.z;return frame.end==='top'?(side>0?tail+L+z:straight+turn+tail-z):(side>0?straight+turn+L+tail+z:tail-z);}
  const matrix=new T.Matrix4();
  function update(dt){
   for(const w of spinners)w.node.rotation[w.axis]+=(w.sign||1)*dt*(w.conveyor?targetSpeedAt(conveyorPosition(w)):w.speed??LIFT.cableSpeed)/w.radius;
   for(const c of cabins){const old=c.speed;for(let remaining=dt;remaining>0;){const step=Math.min(.025,remaining);pos(c.s,va);pos(c.s+.05,vb);const metric=Math.max(.35,va.distanceTo(vb)/.05);c.s=(c.s+step*targetSpeedAt(c.s)/metric)%total;remaining-=step;}
    c.speed=targetSpeedAt(c.s);pos(c.s,c.g.position);LOOP.dir(c.s,vb);c.yaw=Math.atan2(vb.x,vb.z);c.g.rotation.y=c.yaw;c.gear.rotation.x=-Math.atan2(vb.y,Math.hypot(vb.x,vb.z));
    const info=stationInfo(c.s),release=fixed?0:info?info.end==='mid'?clamp(info.inside/2,0,1):1-clamp(info.distance/tail,0,1):0;c.detached=release;for(const jaw of c.gripJaws)jaw.position.x=-.16-release*.14;for(const wheel of c.runningWheels)wheel.rotation.x+=release*c.speed*dt/.09;
    const accel=dt?(c.speed-old)/dt:0;
    if(isChair&&!fixed)window.LiftCoChairSway.update(c,accel,dt);
    // Local +Z follows travel on both lanes; positive pitch moves the body
    // behind its grip during acceleration, negative pitch forward on braking.
    else {const target=clamp(accel*.025,-.09,.09);c.swayVelocity+=(target-c.sway)*10*dt-c.swayVelocity*4*dt;c.sway+=c.swayVelocity*dt;}
    c.suspension.rotation.x=c.sway;
    c.door=T.MathUtils.damp(c.door,openAt(c.s)&&(isChair||c.speed<1.15)?1:0,5,dt);if(dt===0)c.door=openAt(c.s)&&(isChair||c.speed<1.15)?1:0;if(c.bar)c.bar.rotation.x=-c.door*1.65;if(c.bubble&&isChair)c.bubble.rotation.x=-c.door*1.72;for(let seat=0;seat<c.rackSkis.length;seat++)c.rackSkis[seat].visible=!!c.riders[seat]&&['ride','board'].includes(c.riders[seat].state);for(let i=0;i<c.doors.length;i++)c.doors[i].position.x=(i===0?-1:1)*( (studyDoorWidth())/2+c.door*studyDoorWidth()*.92);
   }
   for(const pylon of standardPylons){while(pylon.points.length<cabins.length)pylon.points.push(new T.Vector3());pylon.points.length=cabins.length;for(let i=0;i<cabins.length;i++)pylon.points[i].copy(cabins[i].g.position).applyMatrix4(pylon.inverse);pylon.model.updateHoldDown(pylon.points);}
   root.updateMatrixWorld(true);for(const adapter of guideAdapters){while(adapter.carriers.length<cabins.length)adapter.carriers.push({g:{position:new T.Vector3()}});for(let i=0;i<cabins.length;i++)adapter.root.worldToLocal(adapter.carriers[i].g.position.copy(cabins[i].g.position));adapter.guide.update(adapter.carriers);}root.updateMatrixWorld(true);for(const {mesh,nodes}of instanceSources){for(let i=0;i<nodes.length;i++){const station=conveyorStations.get(nodes[i]);if(station){const gfx=window.LiftCoGraphics;if(gfx&&station.userData.gfxFrame!==gfx.frame){station.userData.gfxFrame=gfx.frame;station.getWorldPosition(conveyorPoint);station.userData.animateDetail=gfx.animateDetail(conveyorPoint);}if(gfx&&!station.userData.animateDetail)continue;}let visible=true;for(let p=nodes[i].parent;p&&p!==root;p=p.parent)if(!p.visible){visible=false;break;}mesh.setMatrixAt(i,visible?nodes[i].matrixWorld:matrix.makeScale(0,0,0));}mesh.instanceMatrix.needsUpdate=true;}
  }
  function studyDoorWidth(){const v=window.LiftCoNextStudies.families[family].variants[1];return(v.w-2*v.round)/2;}
  function platformY(x,z){for(const {frame,datum,model}of stationModels){if(!model.allowAccess)continue;const dx=x-frame.x,dz=z-frame.z,lx=Math.cos(frame.yaw)*dx-Math.sin(frame.yaw)*dz,lz=Math.sin(frame.yaw)*dx+Math.cos(frame.yaw)*dz;if(frame.end==='mid'){const q=path.project(x,z);if(q.distance>=path.midStart-4&&q.distance<=path.midEnd+4&&Math.abs(q.lateral)<9)return datum+floorOffset;}else if(Math.abs(lx)<9&&lz>=-8&&lz<=tail+4)return datum+floorOffset;}return null;}
  update(0);const base=gateInfo('base','top'),top=gateInfo('top','base');
  return{index,def,root,LIFT,layout,LOOP,cabins,supports,stationRoofs,stationModels,stationGuides:guideAdapters,timetable,targetSpeedAt,stationInfo,inStation:s=>!!stationInfo(s),wrapDist,endInfo:gateInfo,worldPoint,cableHeight:z=>layout.heightAt(L/2-z),platformY,update,S_LOAD:base.gate,S_UNLOAD:top.unloadGate,queuePoint:base.queuePoint,queueSlots:Array.from({length:18},(_,i)=>base.queuePoint(i)),load:base.load,unload:top.unload,exit:top.unload,skiOff:top.unload,routes:[],stationTyres:spinners};
 }
 return{layoutFor,create};
})();
