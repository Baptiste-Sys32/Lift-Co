/* Guests only cross the mountain through confirmed network edges. */
window.LiftCoGuestNetwork=function(ctx){
 const {THREE:T,lifts,skiers,network,walkTo,cabinInterior,updateSkierEquipment,routePoint,servedRun}=ctx;
 const a=new T.Vector3(),b=new T.Vector3(),motion=window.LiftCoSkiMotion.create(ctx);
 let revision=0,fillClock=0;
 const home=s=>s.homeBuilding&&ctx.doc.buildings.some(b=>b.id===s.homeBuilding)?s.homeBuilding+':home':network.entrance;
 function retire(s){for(const l of lifts)for(const c of l.cabins)for(let i=0;i<c.riders.length;i++)if(c.riders[i]===s)c.riders[i]=null;ctx.shuttle.release(s);s.retired=true;s.g.visible=false;}
 function populate(dt){if(dt<=0)return;for(let i=skiers.length-1;i>=0;i--)if(skiers[i].retired){const s=skiers[i];s.g.removeFromParent();const geometries=new Set(),materials=new Set();s.g.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m);});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();skiers.splice(i,1);}
  fillClock=Math.min(1,fillClock+dt);if(fillClock<1||skiers.length>=120)return;const homes=ctx.doc.buildings.map(b=>({b,count:skiers.filter(s=>s.homeBuilding===b.id).length,beds:window.LiftCoVillage.spec(b).beds})).filter(x=>x.count<x.beds).sort((a,b)=>a.count/a.beds-b.count/b.beds);if(!homes.length)return;fillClock=0;const s=ctx.makeSkier();s.homeBuilding=homes[0].b.id;skiers.push(s);reset(s);
 }
 function infrastructureChanged(before){let affected=0,retired=0;const returned=[];const transport=window.LiftCoRoads.signature(before)!==window.LiftCoRoads.signature(ctx.doc),buildingGeometry=b=>b?[b.x,b.z,b.yaw,b.floor,b.type]:null;for(const s of skiers){const deletedHome=s.homeBuilding&&!ctx.doc.buildings.some(b=>b.id===s.homeBuilding),movedHome=s.homeBuilding&&before.buildings.some(b=>b.id===s.homeBuilding&&JSON.stringify(buildingGeometry(b))!==JSON.stringify(buildingGeometry(ctx.doc.buildings.find(n=>n.id===b.id))));if(deletedHome){s.homeBuilding=null;if(!ctx.doc.lifts.some(l=>(window.LiftCoNextAlignment?.ends(l)||['base','top']).some(end=>l.id+':'+end===ctx.doc.entranceStation))){retire(s);affected++;retired++;continue;}}if(deletedHome||movedHome||transport&&(s.edge?.kind==='bus'||s.plan?.some(e=>e.kind==='bus'))){reset(s);returned.push(s);affected++;}}if(affected)ctx.notice(affected+' guests relocated or removed after infrastructure changes.');return {returned,count:affected,retired};}
 function entrance(){return network.nodes.get(network.entrance);}
 function reset(s,notify=false){
  motion.clear(s);s.stationWalk=null;s.exitNode=null;s.unloadCarrier=null;s.rejoinQueue=false;
  ctx.shuttle.release(s);
  for(const l of lifts)for(const c of l.cabins)for(let i=0;i<c.riders.length;i++)if(c.riders[i]===s)c.riders[i]=null;
  s.ability??=Math.floor(Math.random()*4);s.recent??=[];s.networkNode=home(s);s.away=false;s.hasOuting=false;s.plan=[];s.edge=null;s.edgeStage=0;s.state='networkIdle';s.t=0;s.chair=-1;s.seat=-1;s.g.scale.setScalar(1);s.g.rotation.set(0,0,0);
  const p=network.nodes.get(home(s));if(p){s.x=p.x;s.z=p.z;s.g.position.set(p.x,(ctx.skierSurfaceY?ctx.skierSurfaceY(p.x,p.z):ctx.terrainY(p.x,p.z)),p.z);}s.g.visible=!!p;s.networkRevision=revision;
 }
 function changed(removedIds=[]){revision++;let affected=0;for(const s of skiers){if(removedIds.some(id=>s.edge?.liftId===id||(s.edge?.route?.id===id||s.edge?.route?.pisteId===id)||s.networkNode?.startsWith(id+':'))){reset(s);affected++;}else if(!s.edge){s.plan=[];s.networkRevision=revision;}else if(s.edge.kind==='walk'){const route=network.routes.find(r=>r.id===s.edge.route?.id);if(route)s.edge.route=route;}}if(affected)ctx.notice(affected+' guests returned home or to the resort entrance after construction.');}
 function release(s,lift){const c=lift?.cabins[s.chair];if(c?.riders[s.seat]===s)c.riders[s.seat]=null;s.chair=-1;s.seat=-1;}
 function info(lift,end,dest){
  if(lift.endInfo)return lift.endInfo(end,dest);
  const top=end==='top',half=ctx.liftFrame(lift.def).length/2,sign=top?-1:1;
  return{end,queuePoint:i=>lift.worldPoint(0,sign*(half+4+i*.9)),load:lift.worldPoint(0,sign*half),unload:lift.worldPoint(0,-sign*half)};
 }
 function stationRoute(station,start,target,dest){const flow=lifts.find(l=>l.def.id===station.definition.id)?.passengerFlow;return flow?flow.walkRoute(station.end,start,target,dest):ctx.stationAccess.route(station.definition,station.end,start,target);}
 function navigation(s,target,key,tag){
  const station=ctx.stationAccess?.resolve(key),queueLift=tag==='queue'?lifts.find(l=>l.def.id===s.edge?.liftId&&l.passengerFlow):null,exitLift=tag==='exit'?lifts.find(l=>l.def.id===s.edge?.liftId&&l.passengerFlow):null;
  if(!station&&!queueLift&&!exitLift)return null;
  let nav=s.stationWalk;const stamp=(station?.hub||key)+':'+tag+(queueLift?':'+s.qi+(s.rejoinQueue?':rejoin':''):'');
  if(!nav||nav.stamp!==stamp||Math.hypot(nav.x-target.x,nav.z-target.z)>.35){const start={x:s.x,z:s.z},points=queueLift&&!s.rejoinQueue?queueLift.passengerFlow.queueRoute(s.edge.end,start,s.qi,s.edge.dest):exitLift?exitLift.passengerFlow.exitRoute(s.edge.dest||s.edge.to.split(':').at(-1),start,target,s.edge.end):station?stationRoute(station,start,target,s.edge?.dest):[start,target];if(!points)return false;nav=s.stationWalk={stamp,x:target.x,z:target.z,points,index:points.length>1?1:0};}
  while(nav.index<nav.points.length-1&&Math.hypot(s.x-nav.points[nav.index].x,s.z-nav.points[nav.index].z)<.04)nav.index++;
  return nav;
 }
 function safeWalk(s,target,dt,pace=2.8,key=null,tag='walk'){
  const nav=navigation(s,target,key,tag);if(nav===false)return false;if(!nav)return walkTo(s,target,dt,pace);
  const point=nav.points[Math.min(nav.index,nav.points.length-1)];if(!point)return walkTo(s,target,dt,pace);
  const y=ctx.skierSurfaceY?ctx.skierSurfaceY(point.x,point.z):ctx.terrainY(point.x,point.z),arrived=walkTo(s,new T.Vector3(point.x,y,point.z),dt,pace);
  if(!arrived)return false;if(nav.index<nav.points.length-1){nav.index++;return false;}if(tag!=='queue')s.stationWalk=null;return true;
 }
 function queueWalk(s,target,dt,key){
  if(Math.hypot(s.x-target.x,s.z-target.z)<.035){s.walking=false;return true;}
  const nav=navigation(s,target,key,'queue');if(nav===false)return false;const next=nav?.points[nav.index]||target;
  if(nav?.points.joining&&nav.index<nav.points.length-1)return safeWalk(s,target,dt,2.8,key,'queue');
  let duration=dt;const pace=window.LiftCoGuestWalking.speed(s,2.8);
  for(const ahead of skiers){if(ahead===s||ahead.ticket>=s.ticket||ahead.edge?.liftId!==s.edge?.liftId||ahead.edge?.end!==s.edge?.end||s.edge.end==='mid'&&ahead.edge.dest!==s.edge.dest||!['queue','load','board'].includes(ahead.state))continue;
   const dx=s.x-ahead.x,dz=s.z-ahead.z,d=Math.hypot(dx,dz);if(d>2.5||dx*(next.x-s.x)+dz*(next.z-s.z)>1e-4)continue;duration=Math.min(duration,Math.max(0,d-1.05)/(pace||1));
  }
  if(duration<=0){s.walking=false;return false;}return safeWalk(s,target,duration,2.8,key,'queue');
 }
 function complete(s){if(s.skiPose)s.g.rotation.set(0,s.heading||0,0);motion.clear(s);s.stationWalk=null;s.networkNode=s.edge.to;if(s.networkRevision!==revision){s.plan=[];s.networkRevision=revision;}s.edge=null;s.state='networkIdle';s.t=0;if(s.networkNode===home(s)&&!s.plan.length&&s.hasOuting){s.state='networkAway';s.away=true;}s.g.scale.setScalar(1);s.g.rotation.x=s.g.rotation.z=0;}
 function queueCost(e){if(e.kind==='bus')return (ctx.shuttle.stats(e.shuttleId)?.waiting||0)*2;if(e.kind!=='lift')return 0;const lift=lifts.find(l=>l.def.id===e.liftId);if(!lift)return 1e6;if(!lift.operations.running)return 1e5;return skiers.filter(s=>s.edge?.liftId===e.liftId&&s.edge.end===e.end&&s.state==='queue').length*8/lift.LIFT.capacity;}
 function update(s,dt){
  if(s.retired)return;if(!s.networkNode)reset(s);
  const entry=network.nodes.get(home(s));if(!entry){s.g.visible=false;return;}s.g.visible=true;
  if(dt<=0)return;
  s.t+=dt;s.walking=false;
  if(s.state==='networkAway'){if(s.t>5){if(ctx.doc.buildings.length&&!s.homeBuilding)retire(s);else reset(s);}return;}
  if(s.state==='networkIdle'){
   if(s.networkRevision!==revision){s.plan=[];s.networkRevision=revision;}
   if(!s.plan.length&&s.t>2){const outing=network.outing(s.networkNode,s.ability,s.recent,queueCost,home(s));s.hasOuting=!!outing;s.plan=outing||network.shortest(s.networkNode,home(s),s.ability,queueCost)||[];s.t=0;}
   if(s.plan.length){const edge=s.plan.shift();const exists=(network.edges.get(edge.from)||[]).some(e=>e.to===edge.to&&e.kind===edge.kind);if(!exists){s.plan=[];return;}s.edge=edge;s.distance=0;s.edgeStage=0;s.state=edge.kind==='bus'?'busQueue':edge.kind==='lift'?'queue':edge.kind==='ski'?'ski':edge.kind==='push'?'skiPush':'networkWalk';s.t=0;if(edge.kind==='bus')s.ticket=ctx.nextTicket();if(edge.kind==='lift'){s.liftIndex=lifts.findIndex(l=>l.def.id===edge.liftId);s.ticket=ctx.nextTicket();}}
  }
  const e=s.edge;if(!e){s.g.position.set(s.x,(ctx.skierSurfaceY?ctx.skierSurfaceY(s.x,s.z):ctx.terrainY(s.x,s.z)),s.z);s.g.rotation.z=0;updateSkierEquipment(s);return;}
  if(e.kind==='bus'){busGuest(s,dt);return;}
  if(e.kind!=='lift'){
   if(e.route){const r=e.route;
    if(e.kind==='ski'||e.kind==='push')motion.advance(s,r,dt,e.kind==='push',!!e.reverse);
    else{s.distance=Math.min(r.length,s.distance+dt*window.LiftCoGuestWalking.speed(s));const d=e.reverse?r.length-s.distance:s.distance;routePoint(r,d,a);routePoint(r,Math.max(0,Math.min(r.length,d+(e.reverse?-1:1))),b);s.x=a.x;s.z=a.z;s.g.position.set(a.x,e.kind==='walk'&&window.LiftCoFootpaths?window.LiftCoFootpaths.walkY(r,d,ctx.skierSurfaceY||ctx.terrainY):(ctx.skierSurfaceY?ctx.skierSurfaceY(a.x,a.z):ctx.terrainY(a.x,a.z))+.1,a.z);s.g.rotation.set(0,Math.atan2(b.x-a.x,b.z-a.z),0);s.walking=dt>0;}
    if(s.distance>=r.length){if(e.kind==='ski'){servedRun();s.recent.push(r.id);if(s.recent.length>3)s.recent.shift();}complete(s);}
   }else{let target=network.nodes.get(e.to);if(!target){reset(s);return;}const next=s.plan[0],stationKey=e.stationKey||ctx.stationAccess?.resolve(e.to)?.hub||ctx.stationAccess?.resolve(e.from)?.hub;
    if(e.kind==='stationWalk'&&next?.kind==='lift'&&next.from===e.to){const lift=lifts.find(l=>l.def.id===next.liftId);if(lift)target=info(lift,next.end,next.dest).queueEntry||info(lift,next.end,next.dest).queuePoint(0);}
    if(safeWalk(s,target,dt,2.8,stationKey))complete(s);}

   if(s.state==='ski'||s.state==='skiPush')ctx.leaveSkiTracks?.(s);else s.lastTrack=null;updateSkierEquipment(s);if(s.state==='ski'||s.state==='skiPush')motion.pose(s);return;
  }
  const lift=lifts.find(l=>l.def.id===e.liftId);if(!lift){reset(s);return;}s.liftIndex=lifts.indexOf(lift);const dest=e.dest||(e.end==='base'?'top':'base'),station=info(lift,e.end,dest),arrival=info(lift,dest,e.end),moving=lift.operations.running;
  if(['queue','load'].includes(s.state)&&!lift.operations.open){release(s,lift);s.plan=[];s.edge=null;s.state='networkIdle';return;}
  if(s.state==='queue'){
   const line=skiers.filter(o=>o.edge?.liftId===e.liftId&&o.edge.end===e.end&&(e.end!=='mid'||o.edge.dest===dest)&&o.state==='queue').sort((a,b)=>a.ticket-b.ticket),index=line.indexOf(s),target=station.queuePoint(Math.max(0,index));
   s.qi=index;const arrived=queueWalk(s,target,dt,e.from);if(arrived)s.rejoinQueue=false;
   const loadingAhead=skiers.some(o=>o!==s&&o.edge?.liftId===e.liftId&&o.edge.end===e.end&&(e.end!=='mid'||o.edge.dest===dest)&&o.state==='load'&&o.ticket<s.ticket);
   if(index===0&&arrived&&moving&&!loadingAhead)for(let i=0;i<lift.cabins.length;i++){const c=lift.cabins[i];if(c.cameraOnly)continue;const seat=c.riders.indexOf(null);const staging=lift.LIFT.reversible&&lift.boardingPoint?lift.boardingPoint(Math.max(0,seat),c):station.load,approach=Math.hypot(s.x-staging.x,s.z-staging.z)/window.LiftCoGuestWalking.speed(s,4);const ready=lift.LIFT.reversible?c.station===e.end&&c.door>.8&&c.dwellRemaining>Math.max(3.4,approach+2.95):lift.boardingWindow(c,e.end,'reserve',dest);if(ready&&seat>=0){c.riders[seat]=s;s.chair=i;s.seat=seat;s.state='load';s.t=0;s.seatedCabin=!!c.seatedCabin;break;}}
  }else if(s.state==='load'){
   const c=lift.cabins[s.chair];if(!c){reset(s);return;}
   const target=lift.LIFT.reversible&&lift.boardingPoint?lift.boardingPoint(s.seat,c):station.load;
   if(lift.LIFT.reversible&&!lift.endInfo&&e.end==='top'){target.x+=lift.def.top[0]-lift.def.base[0];target.z+=lift.def.top[1]-lift.def.base[1];}
   const arrived=safeWalk(s,target,moving?dt:0,4,e.from,'load');
   const ready=lift.LIFT.reversible?c.station===e.end&&c.door>=.92&&c.dwellRemaining>2.8:lift.boardingWindow(c,e.end,'board',dest);
   if(arrived&&ready&&moving){s.state='board';s.t=0;s.boardFrom=s.g.position.clone();}
   else if(s.t>6&&moving){release(s,lift);s.state='queue';s.rejoinQueue=true;s.t=0;}
  }else if(s.state==='board'){
   if(!moving){s.t-=dt;return;}const c=lift.cabins[s.chair];if(!c){reset(s);return;}cabinInterior(c,s.seat,a);const t=Math.min(1,s.t/.5);s.g.position.copy(s.boardFrom).lerp(a,t);s.g.scale.setScalar(1-.25*t);if(t>=1){s.state='ride';s.t=0;}
  }else if(s.state==='ride'){
   const c=lift.cabins[s.chair];if(!c){reset(s);return;}cabinInterior(c,s.seat,a);s.g.position.copy(a);s.g.rotation.set(c.sway||0,c.yaw+lift.root.rotation.y+(c.seatYaw?.[s.seat]||0),c.swayRoll||0,'YXZ');
   const arrived=lift.unloadingWindow?lift.unloadingWindow(c,dest,e.end):c.door>=.92&&(lift.LIFT.reversible?c.station===dest&&c.dwellRemaining>2.8:lift.wrapDist(c.s,arrival.unloadGate)<.6);
   if(arrived&&moving){s.unloadFrom=s.g.position.clone();s.unloadTo=lift.LIFT.reversible&&lift.unloadPoint?lift.unloadPoint(c):arrival.unload;if(lift.LIFT.reversible&&!lift.endInfo&&dest==='base'){s.unloadTo.x+=lift.def.base[0]-lift.def.top[0];s.unloadTo.z+=lift.def.base[1]-lift.def.top[1];s.unloadTo.y=ctx.skierSurfaceY?ctx.skierSurfaceY(s.unloadTo.x,s.unloadTo.z):ctx.terrainY(s.unloadTo.x,s.unloadTo.z);}s.unloadTo=s.unloadTo.clone();if(ctx.skierSurfaceY)s.unloadTo.y=ctx.skierSurfaceY(s.unloadTo.x,s.unloadTo.z);s.unloadCarrier=c;s.state='unload';s.t=0;}
  }else if(s.state==='unload'){
   const t=Math.min(1,s.t/.8);if(s.unloadCarrier)cabinInterior(s.unloadCarrier,s.seat,s.unloadFrom);s.g.position.copy(s.unloadFrom).lerp(s.unloadTo,t);s.g.scale.setScalar(.75+.25*t);s.x=s.g.position.x;s.z=s.g.position.z;if(t>=1){release(s,lift);s.unloadCarrier=null;s.state='networkExit';const next=s.plan[0];s.exitNode=next?.kind==='stationWalk'&&next.from===e.to?next.to:e.to;s.g.rotation.x=s.g.rotation.z=0;}
  }else if(s.state==='networkExit'){
   const chosen=s.exitNode||e.to,target=network.nodes.get(chosen);if(!target){reset(s);return;}if(safeWalk(s,target,dt,2.8,e.to,'exit')){const next=s.plan[0];complete(s);if(next===s.plan[0]&&next?.kind==='stationWalk'&&next.to===chosen){s.plan.shift();s.networkNode=chosen;}s.exitNode=null;}
  }
  updateSkierEquipment(s);
 }
 function busGuest(s,dt){const e=s.edge,bus=ctx.shuttle.buses.get(e.shuttleId);if(!bus){reset(s);return;}
  s.equipmentCarried=1;s.skis.visible=false;s.legs.visible=true;s.seatedLegs.visible=false;s.g.scale.setScalar(1);s.g.rotation.x=s.g.rotation.z=0;
  if(s.state==='busQueue'){
   if(bus.definition.open===false){s.plan=[];s.edge=null;s.state='networkIdle';return;}
   const line=skiers.filter(o=>o.state==='busQueue'&&o.edge?.shuttleId===e.shuttleId&&o.edge.from===e.from).sort((a,b)=>a.ticket-b.ticket),i=line.indexOf(s),p=network.nodes.get(e.from+':ped')||network.nodes.get(e.from),target=new T.Vector3(p.x+(i%3)*.8,ctx.terrainY(p.x,p.z),p.z+Math.floor(i/3)*.9),arrived=walkTo(s,target,dt);
   const seat=bus.riders.indexOf(null);if(i===0&&arrived&&ctx.shuttle.ready(bus)&&bus.at===e.from&&seat>=0){bus.riders[seat]=s;s.busId=bus.id;s.busSeat=seat;s.state='busBoard';s.t=0;}
  }else if(s.state==='busBoard'){
   const door=bus.model.root.localToWorld(new T.Vector3(1.5,.2,2.7));if(s.edgeStage===0){if(walkTo(s,door,dt,2.8)){s.edgeStage=1;s.t=0;s.boardFrom=s.g.position.clone();}}else{const target=ctx.shuttle.seatPoint(bus,s.busSeat),u=Math.min(1,s.t/.8);s.g.position.copy(s.boardFrom).lerp(target,u);if(u>=1){s.state='busRide';s.t=0;}}
  }else if(s.state==='busRide'){
   s.g.position.copy(ctx.shuttle.seatPoint(bus,s.busSeat));s.g.rotation.y=bus.model.root.rotation.y;s.legs.visible=false;s.seatedLegs.visible=true;if(bus.at===e.to&&ctx.shuttle.ready(bus)){s.state='busUnload';s.t=0;s.unloadFrom=s.g.position.clone();}
  }else if(s.state==='busUnload'){
   const p=network.nodes.get(e.to),target=new T.Vector3(p.x,ctx.terrainY(p.x,p.z),p.z),u=Math.min(1,s.t/.8);s.g.position.copy(s.unloadFrom).lerp(target,u);if(u>=1){s.x=target.x;s.z=target.z;ctx.shuttle.release(s);complete(s);}
  }
 }
 function takeControl(s){
  if(s.retired||s.edge?.kind==='bus')return false;
  s.playerControlled=true;s.plan=[];s.away=false;s.hasOuting=false;
  if(s.edge?.kind==='lift')return true;
  motion.clear(s);s.edge=null;s.state='playerWalk';s.t=0;s.g.scale.setScalar(1);s.g.rotation.x=s.g.rotation.z=0;return true;
 }
 function playerCabins(s,lift,end,dest){
  if(!s.playerControlled||s.edge||!lift.operations.open||!lift.operations.running)return [];
  const station=info(lift,end,dest),options=[];
  for(let index=0;index<lift.cabins.length;index++){
   const carrier=lift.cabins[index];if(carrier.cameraOnly)continue;
   const stationInfo=lift.LIFT.reversible?null:lift.stationInfo?.(carrier.s),atStation=lift.LIFT.reversible?false:stationInfo?stationInfo.end===end&&(lift.LIFT.isChair||Math.abs(carrier.speed||0)<1.2):lift.boardingWindow(carrier,end,'board',dest);
   const ready=carrier.door>=.92&&(lift.LIFT.reversible?carrier.station===end&&carrier.dwellRemaining>1:atStation);
   if(!ready)continue;carrier.g.updateWorldMatrix(true,true);
   const points=carrier.riders.map((_,i)=>cabinInterior(carrier,i,new T.Vector3())),target=lift.LIFT.reversible&&lift.boardingPoint?lift.boardingPoint(0,carrier):station.load,nearSeat=Math.min(...points.map(p=>p.distanceTo(s.g.position))),nearDoor=Math.hypot(s.x-target.x,s.z-target.z),level=ctx.skierSurfaceY?ctx.skierSurfaceY(target.x,target.z):target.y;
   if(nearSeat>7&&!(nearDoor<7&&Math.abs(s.g.position.y-level)<1.8))continue;
   options.push({carrier,index,points,target,distance:Math.min(nearSeat,nearDoor)});
  }
  return options.sort((a,b)=>a.distance-b.distance);
 }
 function boardPlayer(s,lift,end,dest,queue=false,choice=null){
  if(!s.playerControlled||s.edge||!lift.operations.open||!lift.operations.running||!network.nodes.has(lift.def.id+':'+end))return false;
  let carrier=null,index=-1,seat=-1;
  if(!queue){
   for(const option of playerCabins(s,lift,end,dest)){
    const c=option.carrier;if(choice&&choice.carrier!==c)continue;
    const free=choice?choice.seat:c.riders.indexOf(null);
    if(!Number.isInteger(free)||free<0||free>=c.riders.length||c.riders[free]!==null)continue;
    const target=lift.LIFT.reversible&&lift.boardingPoint?lift.boardingPoint(free,c):option.target,nearSeat=option.points[free].distanceTo(s.g.position),nearDoor=Math.hypot(s.x-target.x,s.z-target.z);
    if(nearSeat>3.5&&!(nearDoor<3.5&&(!ctx.skierSurfaceY||Math.abs(s.g.position.y-ctx.skierSurfaceY(target.x,target.z))<1.5)))continue;
    carrier=c;index=option.index;seat=free;break;
   }
   if(!carrier)return false;
  }
  motion.clear(s);s.stationWalk=null;s.networkNode=lift.def.id+':'+end;s.edge={kind:'lift',liftId:lift.def.id,from:s.networkNode,to:lift.def.id+':'+dest,end,dest};s.liftIndex=lifts.indexOf(lift);s.t=0;s.ticket=ctx.nextTicket();s.plan=[];
  if(queue)s.state='queue';else{carrier.riders[seat]=s;s.chair=index;s.seat=seat;s.seatedCabin=!!carrier.seatedCabin;s.state='board';s.boardFrom=s.g.position.clone();}
  return true;
 }
 function cancelPlayerBoarding(s){
  if(!s.playerControlled||s.edge?.kind!=='lift'||!['queue','load'].includes(s.state))return false;
  release(s,lifts.find(l=>l.def.id===s.edge.liftId));s.stationWalk=null;s.edge=null;s.plan=[];s.state='playerWalk';s.t=0;motion.clear(s);return true;
 }
 function resumePlayerWalking(s){
  if(!s.playerControlled||s.edge?.kind!=='lift'||s.state!=='networkExit'||s.chair>=0||s.unloadCarrier)return false;
  s.networkNode=s.edge.to;s.edge=null;s.plan=[];s.stationWalk=null;s.exitNode=null;s.unloadFrom=null;s.unloadTo=null;
  motion.clear(s);s.state='playerWalk';s.t=0;s.walking=false;s.g.scale.setScalar(1);s.g.rotation.x=s.g.rotation.z=0;return true;
 }
 function releasePlayer(s){
  s.playerControlled=false;
  if(s.edge?.kind==='lift'){s.plan=network.shortest(s.edge.to,home(s),s.ability,queueCost)||[];return;}
  // Resume an actual nearby network edge; arbitrary off-network positions return home.
  let nearest=null;
  for(const edges of network.edges.values())for(const edge of edges){const r=edge.route;if(!r||!['walk','ski'].includes(edge.kind)||(edge.ability??0)>(s.ability??3))continue;
   for(let i=1;i<r.samples.length;i++){const a=r.samples[i-1],b=r.samples[i],dx=b.x-a.x,dz=b.z-a.z,u=Math.max(0,Math.min(1,((s.x-a.x)*dx+(s.z-a.z)*dz)/(dx*dx+dz*dz||1))),distance=Math.hypot(s.x-a.x-u*dx,s.z-a.z-u*dz);if(distance>Math.max(2,r.width/2)||nearest&&distance>=nearest.distance)continue;nearest={edge,distance,d:r.distances[i-1]+u*(r.distances[i]-r.distances[i-1])};}
  }
  motion.clear(s);
  if(nearest){const {edge,d}=nearest;s.edge=edge;s.networkNode=edge.from;s.distance=edge.reverse?edge.route.length-d:d;s.state=edge.kind==='ski'?'ski':'networkWalk';s.plan=network.shortest(edge.to,home(s),s.ability,queueCost)||[];s.t=0;}
  else{reset(s);ctx.notice('Guest returned home after leaving control away from a route.');}
 }
 return{update,reset,changed,populate,infrastructureChanged,takeControl,playerCabins,boardPlayer,cancelPlayerBoarding,resumePlayerWalking,releasePlayer,stationInfo:info,pose:motion.pose,clearPose:motion.clear,animate:motion.tick};
};
