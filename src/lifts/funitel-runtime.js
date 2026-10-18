// Buildable Rocharbois: approved study geometry, placed support banks and loaded ropes.
window.LiftCoFunitelRuntime=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 const halfBank=3.48,flat=2.03,drop=.18,ropeHeight=3.60;
 const crown=z=>-.5*drop*Math.max(0,Math.min(Math.abs(z),halfBank)-flat)**2/(halfBank-flat);
 const slope=z=>-Math.sign(z)*drop*Math.max(0,Math.min(Math.abs(z),halfBank)-flat)/(halfBank-flat);
 function layoutFor(def,ctx){
  ctx.prepare(def);const f=ctx.frame(def),L=f.length,half=L/2;
  const nodes=[{id:'start',kind:'station',distance:0,height:def.stationGround[1]+.52+ropeHeight},...(def.towers||[]).map((t,i)=>{const p=ctx.planPoint(def,0,half-t.fraction*L);return{id:t.id??i+1,kind:'tower',fraction:t.fraction,distance:t.fraction*L,height:ctx.ground(p.x,p.z)+t.height};}).sort((a,b)=>a.distance-b.distance),{id:'end',kind:'station',distance:L,height:def.stationGround[-1]+.52+ropeHeight}];
  const radius=.28,wrap=radius*drop/Math.hypot(1,drop),a=9.5,b=L-9.5;
  const bank=[{start:a,end:a+wrap,y:z=>nodes[0].height-radius+Math.sqrt(Math.max(0,radius*radius-(z-a)**2)),slope:z=>-(z-a)/Math.sqrt(Math.max(1e-8,radius*radius-(z-a)**2))}];
  for(const n of nodes.slice(1,-1))bank.push({start:n.distance-halfBank,end:n.distance+halfBank,y:z=>n.height+crown(z-n.distance),slope:z=>slope(z-n.distance)});
  bank.push({start:b-wrap,end:b,y:z=>nodes.at(-1).height-radius+Math.sqrt(Math.max(0,radius*radius-(z-b)**2)),slope:z=>-(z-b)/Math.sqrt(Math.max(1e-8,radius*radius-(z-b)**2))});
  const spans=[];for(let i=0;i<bank.length-1;i++){const p=bank[i],q=bank[i+1],length=q.start-p.end;spans.push({a:p.end,b:q.start,y0:p.y(p.end),y1:q.y(q.start),length});}
  const maxSpan=Math.max(1,...spans.map(s=>s.length)),selfWeight=Math.min(.0009,4/maxSpan**2)*(def.sag??.55)/.55,carrierWeight=Math.min(.22,8/maxSpan);
  function atZ(z){
   if(z<=a)return{z,y:nodes[0].height,slope:0};if(z>=b)return{z,y:nodes.at(-1).height,slope:0};
   for(const p of bank)if(z>=p.start&&z<=p.end)return{z,y:p.y(z),slope:p.slope(z)};
   for(const p of spans)if(z>=p.a&&z<=p.b){const t=(z-p.a)/p.length,sag=selfWeight*p.length*p.length/8;return{z,y:p.y0+(p.y1-p.y0)*t-4*sag*t*(1-t),slope:(p.y1-p.y0)/p.length-4*sag*(1-2*t)/p.length};}
   return{z,y:nodes[0].height,slope:0};
  }
  const dx=(def.top[0]-def.base[0])/L,dz=(def.top[1]-def.base[1])/L;
  return{length:L,dx,dz,nodes,bank,spans,atZ,selfWeight,carrierWeight,ready:true,terminalGuides:true,guideLengths:{start:9.5,end:9.5},
   // Conservative moving-load envelope for construction clearance, zero inside terminals.
   heightAt(s){const p=spans.find(p=>s>p.a&&s<p.b);return atZ(s).y-(p?carrierWeight*p.length/4*Math.sin(Math.PI*(s-p.a)/p.length):0);},
   pointAt(s,side=0,height){return{x:def.base[0]+dx*s+dz*side,z:def.base[1]+dz*s-dx*side,y:height??this.heightAt(s)};},
   project(x,z){const distance=(x-def.base[0])*dx+(z-def.base[1])*dz;return{distance,fraction:distance/L,lateral:(x-def.base[0])*dz-(z-def.base[1])*dx};}};
 }
 function create(T,def,index,ctx){
  const layout=layoutFor(def,ctx),f=ctx.frame(def),L=f.length,half=L/2,root=new T.Group(),line=new T.Group(),factory=window.LiftCoFunitelStudy.createFactory(T);
  root.position.set(f.x,0,f.z);root.rotation.y=f.angle;line.position.z=half;line.rotation.y=Math.PI;root.add(line);ctx.scene.add(root);
  const cabins=[],towers=[],stations=[],ropes=[],stationRoofs=[];
  const groundAt=s=>{const p=ctx.planPoint(def,0,half-s);return ctx.ground(p.x,p.z);};
  for(const [end,variant,z,rotation] of [[1,0,-2,Math.PI],[-1,0,L+2,0]]){
   const station=factory.makeStation(variant,{deck:def.stationGround[end]+.52,stubs:false,role:'return'});station.root.position.z=z;station.root.rotation.y=rotation;line.add(station.root);stations.push(station);stationRoofs.push(station.roof,station.building);
   // Solid foundation under each deck, with recessed channels for the cabin floors.
   const g=def.stationGround[end],p=ctx.planPoint(def,0,end*half),foot=Math.min(g-1,ctx.ground(p.x,p.z)-1);
   for(const [x,w]of [[0,3.75],[-6.1,1.6],[6.1,1.6]])factory.box(station.root,w,g-foot,station.v.length,x,(g+foot)/2,0,factory.M.concrete);
  }
  for(const n of layout.nodes.slice(1,-1)){
   const ground=groundAt(n.distance),tower=factory.makeTower(0,{height:n.height-ground,stubs:false,groundAt:(x,z)=>{const p=ctx.planPoint(def,-x,half-n.distance-z);return ctx.terrain(p.x,p.z)-ground;}});tower.root.position.set(0,ground,n.distance);tower.root.userData.number=layout.nodes.indexOf(n);line.add(tower.root);towers.push(tower);
   for(const side of [-1,1]){
    const lamp=new T.Group(),target=new T.Object3D();lamp.position.set(side*4.2,n.height-ground+.15,.5);target.position.set(side*5,0,2);tower.root.add(lamp,target);lamp.lookAt(tower.root.localToWorld(target.position.clone()));
    factory.box(lamp,.66,.36,.2,0,0,0,factory.M.dark);const lensMaterial=new T.MeshStandardMaterial({color:0xf0e8d5,emissive:0xffdf9f,emissiveIntensity:0,roughness:.35});factory.box(lamp,.54,.25,.025,0,0,.112,lensMaterial);
    if(!def.preview)ctx.lightFixtures?.push({node:lamp,target,root,lensMaterial});
   }
  }
  const first=-4.35,last=L+4.35,steps=Math.min(1600,Math.max(220,Math.ceil(L/.6)));
  if(def.preview){for(const x of factory.ropeXs)factory.ropeCurve(line,x,layout.atZ,first,last,steps);}
  else{
   for(let i=0;i<2;i++){
    const model=factory.makeCabin(0,{stubs:false});model.root.position.x=(i?1:-1)*factory.lane;model.paint.color.set(def.color??0x355768);line.add(model.root);
    const c=Object.assign(model,{g:model.root,suspension:model.sections[1],isFunitel:true,riders:Array(75).fill(null),eye:new T.Vector3(0,1.65,0),yaw:Math.PI,sway:0,s:0,speed:0,station:null,dwellRemaining:0,door:0});
    c.passengerPoint=(seat,out)=>out.set((seat%5-2)*.43,.25,(Math.floor(seat%25/5)-2)*.42).applyMatrix4(model.sections[Math.floor(seat/25)].matrixWorld);
    cabins.push(c);ropes.push([-1,1].map(edge=>factory.dynamicRope(line,(i?1:-1)*factory.lane+edge*1.5,first,last,steps)));
   }
  }
  const loaded=def.preview?null:window.LiftCoLoadedRope.create(layout,{first,last,selfWeight:layout.selfWeight,carrierWeight:layout.carrierWeight,spacing:.75});
  // Arc-length table follows the unloaded line; both lanes share the same traction rope.
  const table=[{z:0,s:0}];for(let i=1,n=Math.max(100,Math.ceil(L));i<=n;i++){const z=L*i/n,p=table.at(-1);table.push({z,s:p.s+Math.hypot(z-p.z,layout.atZ(z).y-layout.atZ(p.z).y)});}
  const distance=table.at(-1).s,zAt=s=>{let lo=0,hi=table.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(table[m].s<=s)lo=m;else hi=m;}const a=table[lo],b=table[hi];return a.z+(b.z-a.z)*clamp((s-a.s)/(b.s-a.s),0,1);};
  const speed=5,accelTime=3,brakeTime=16,accelDistance=speed*accelTime/2,brakeDistance=speed*brakeTime/2,cruiseTime=(distance-accelDistance-brakeDistance)/speed,travelTime=accelTime+cruiseTime+brakeTime,dwell=12,amplitude=.65*Math.PI/180;
  let clock=0,lastDrive=0;
  function update(dt){
   if(def.preview){root.updateMatrixWorld(true);return;}clock+=dt;const duration=travelTime+dwell,reverse=Math.floor(clock/duration)%2===1,local=clock%duration,docked=local<dwell;let d=0,v=0,sway=0;
   if(docked){if(clock>=dwell)sway=(reverse?-1:1)*amplitude*Math.exp(-.8*local)*(Math.cos(4.2*local)+.8/4.2*Math.sin(4.2*local));}
   else{const t=local-dwell,remaining=travelTime-t;if(t<accelTime){d=.5*speed/accelTime*t*t;v=speed*t/accelTime;}else if(t<accelTime+cruiseTime){d=accelDistance+(t-accelTime)*speed;v=speed;}else{d=distance-.5*speed/brakeTime*remaining*remaining;v=speed*remaining/brakeTime;}sway=(reverse?1:-1)*amplitude*(1-smooth(0,3,remaining));}
   const drive=reverse?distance-d:d,ropeSpeed=dt>0?(drive-lastDrive)/dt:0;lastDrive=drive;
   cabins.forEach((c,i)=>{
    const z=zAt(i?distance-drive:drive),tilt=i?-sway:sway;
    if(c.loadedZ!==z||c.loadedSway!==tilt){const pose=loaded.solve({z,sections:c.loadSections,sway:tilt});c.setLoadedPose(pose);for(const rope of ropes[i])rope.update(pose.atZ,pose.knots);c.loadedProfile=pose.atZ;c.loadedZ=z;c.loadedSway=tilt;}
    c.s=z;c.speed=v;c.sway=tilt;c.station=docked?(z<L/2?'base':'top'):null;c.dwellRemaining=docked?dwell-local:0;c.door=docked?smooth(1.1,2,local)*(1-smooth(dwell-2,dwell-.5,local)):0;c.setOpen(c.door);
   });
   for(let i=0;i<stations.length;i++)stations[i].setDrive(drive);
   for(const tower of towers)tower.updateWheels(dt,ropeSpeed,cabins.map(c=>c.loadedProfile),cabins.map(c=>c.loadedZ));root.updateMatrixWorld(true);
  }
  const worldPoint=(x,z)=>{const p=ctx.planPoint(def,x,z);p.y=ctx.terrain(p.x,p.z,def.preview?def:null);return p;};
  const platformY=(x,z)=>{const dx=x-f.x,dz=z-f.z,lx=Math.cos(f.angle)*dx-Math.sin(f.angle)*dz,lz=Math.sin(f.angle)*dx+Math.cos(f.angle)*dz;for(const end of [1,-1]){const out=end*(lz-end*half),length=19;if(out>=2-length/2&&out<=length/2+4&&(Math.abs(lx)<1.88||Math.abs(lx)>5.3&&Math.abs(lx)<6.9))return def.stationGround[end]+.52;}return null;};
  const LIFT={type:'funitel-rocharbois',funitel:true,reversible:true,isChair:false,sideX:3.5,halfWidth:1.5,halfLength:4.25,capacity:75,cabins:2,carrierName:'funitel cabins',cableSpeed:5,stationSpeed:0,base:new T.Vector3(0,layout.nodes[0].height,half),top:new T.Vector3(0,layout.nodes.at(-1).height,-half)};
  update(0);return{index,def,root,LIFT,cabins,layout,supports:layout.nodes.map((n,i)=>({z:half-n.distance,y:n.height,number:i})),cableHeight:z=>layout.heightAt(half-z),stationRoofs,stationTyres:[],towerWheels:[],update,worldPoint,platformY,
   boardingPoint:(seat,c)=>worldPoint(c.g.position.x<0?1.75:-1.75,half-c.segments[Math.floor(seat/25)].centre),unloadPoint:c=>worldPoint(c.g.position.x<0?1.75:-1.75,-half),queuePoint:i=>worldPoint(0,half+4+i*.9),skiOff:worldPoint(0,half+5),load:worldPoint(0,half),unload:worldPoint(0,-half),exit:worldPoint(0,-half-8),routes:[],S_LOAD:0,S_UNLOAD:L,wrapDist:(a,b)=>Math.abs(a-b)};
 }
 return{create,layoutFor};
})();
