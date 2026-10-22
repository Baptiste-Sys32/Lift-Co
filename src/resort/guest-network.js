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
  motion.clear(s);s.stationWalk=null;s.exitNode=null;s.unloadCarrier=null;
  ctx.shuttle.release(s);
  for(const l of lifts)for(const c of l.cabins)for(let i=0;i<c.riders.length;i++)if(c.riders[i]===s)c.riders[i]=null;
  s.ability??=Math.floor(Math.random()*4);s.recent??=[];s.networkNode=home(s);s.away=false;s.hasOuting=false;s.plan=[];s.edge=null;s.edgeStage=0;s.state='networkIdle';s.t=0;s.chair=-1;s.seat=-1;s.g.scale.setScalar(1);s.g.rotation.set(0,0,0);
  const p=network.nodes.get(home(s));if(p){s.x=p.x;s.z=p.z;s.g.position.set(p.x,(ctx.skierSurfaceY?ctx.skierSurfaceY(p.x,p.z):ctx.terrainY(p.x,p.z)),p.z);}s.g.visible=!!p;s.networkRevision=revision;
 }
 function changed(removedIds=[]){revision++;let affected=0;for(const s of skiers){if(removedIds.some(id=>s.edge?.liftId===id||(s.edge?.route?.id===id||s.edge?.route?.pisteId===id)||s.networkNode?.startsWith(id+':'))){reset(s);affected++;}else if(!s.edge){s.plan=[];s.networkRevision=revision;}}if(affected)ctx.notice(affected+' guests returned home or to the resort entrance after construction.');}
 function release(s,lift){const c=lift?.cabins[s.chair];if(c?.riders[s.seat]===s)c.riders[s.seat]=null;s.chair=-1;s.seat=-1;}
 function info(lift,end,dest){
  if(lift.endInfo)return lift.endInfo(end,dest);
  const top=end==='top',half=ctx.liftFrame(lift.def).length/2,sign=top?-1:1;
  return{end,queuePoint:i=>lift.worldPoint(0,sign*(half+4+i*.9)),load:lift.worldPoint(0,sign*half),unload:lift.worldPoint(0,-sign*half)};
 }
 function safeWalk(s,target,dt,pace=2.8,key=null,tag='walk'){
  const station=ctx.stationAccess?.resolve(key);if(!station)return walkTo(s,target,dt,pace);
  let nav=s.stationWalk;const stamp=station.hub+':'+tag;
  if(!nav||nav.stamp!==stamp||Math.hypot(nav.x-target.x,nav.z-target.z)>.35){const points=ctx.stationAccess.route(station.definition,station.end,{x:s.x,z:s.z},target);if(!points)return false;nav=s.stationWalk={stamp,x:target.x,z:target.z,points,index:points.length>1?1:0};}
  const point=nav.points[Math.min(nav.index,nav.points.length-1)];if(!point)return walkTo(s,target,dt,pace);
  const y=ctx.skierSurfaceY?ctx.skierSurfaceY(point.x,point.z):ctx.terrainY(point.x,point.z),arrived=walkTo(s,new T.Vector3(point.x,y,point.z),dt,pace);
  if(!arrived)return false;if(nav.index<nav.points.length-1){nav.index++;return false;}s.stationWalk=null;return true;
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
  const e=s.edge;if(!e){s.g.position.set(s.x,(ctx.skierSurfaceY?ctx.skierSurfaceY(s.x,s.z):ctx.terrainY(s.x,s.z)),s.z);s.g.rotation.z=0;return;}
  if(e.kind==='bus'){busGuest(s,dt);return;}
  if(e.kind!=='lift'){
   if(e.route){const r=e.route;
    if(e.kind==='ski'||e.kind==='push')motion.advance(s,r,dt,e.kind==='push',!!e.reverse);
    else{s.distance=Math.min(r.length,s.distance+dt*2.8);const d=e.reverse?r.length-s.distance:s.distance;routePoint(r,d,a);routePoint(r,Math.max(0,Math.min(r.length,d+(e.reverse?-1:1))),b);s.x=a.x;s.z=a.z;s.g.position.set(a.x,(ctx.skierSurfaceY?ctx.skierSurfaceY(a.x,a.z):ctx.terrainY(a.x,a.z))+.1,a.z);s.g.rotation.set(0,Math.atan2(b.x-a.x,b.z-a.z),0);s.walking=dt>0;}
    if(s.distance>=r.length){if(e.kind==='ski'){servedRun();s.recent.push(r.id);if(s.recent.length>3)s.recent.shift();}complete(s);}
   }else{let target=network.nodes.get(e.to);if(!target){reset(s);return;}const next=s.plan[0],stationKey=e.stationKey||ctx.stationAccess?.resolve(e.to)?.hub||ctx.stationAccess?.resolve(e.from)?.hub;
    if(e.kind==='stationWalk'&&next?.kind==='lift'&&next.from===e.to){const lift=lifts.find(l=>l.def.id===next.liftId);if(lift)target=info(lift,next.end,next.dest).queuePoint(0);}
    if(safeWalk(s,target,dt,2.8,stationKey))complete(s);}

   if(s.state==='ski'||s.state==='skiPush')ctx.leaveSkiTracks?.(s);else s.lastTrack=null;if(lifts[s.liftIndex])updateSkierEquipment(s);if(s.state==='ski'||s.state==='skiPush')motion.pose(s);return;
  }
  const lift=lifts.find(l=>l.def.id===e.liftId);if(!lift){reset(s);return;}s.liftIndex=lifts.indexOf(lift);const dest=e.dest||(e.end==='base'?'top':'base'),station=info(lift,e.end,dest),arrival=info(lift,dest,e.end),moving=lift.operations.running;
  if(['queue','load'].includes(s.state)&&!lift.operations.open){release(s,lift);s.plan=[];s.edge=null;s.state='networkIdle';return;}
  if(s.state==='queue'){
   const line=skiers.filter(o=>o.edge?.liftId===e.liftId&&o.edge.end===e.end&&(e.end!=='mid'||o.edge.dest===dest)&&o.state==='queue').sort((a,b)=>a.ticket-b.ticket),index=line.indexOf(s),target=station.queuePoint(Math.max(0,index));
   const arrived=safeWalk(s,target,dt,2.8,e.from,'queue');s.qi=index;
   if(index===0&&arrived&&moving)for(let i=0;i<lift.cabins.length;i++){const c=lift.cabins[i];if(c.cameraOnly)continue;const seat=c.riders.indexOf(null);const ready=lift.LIFT.reversible?c.station===e.end&&c.door>.8&&c.dwellRemaining>3.4:lift.boardingWindow(c,e.end,'reserve',dest);if(ready&&seat>=0){c.riders[seat]=s;s.chair=i;s.seat=seat;s.state='load';s.t=0;s.seatedCabin=!!c.seatedCabin;break;}}
  }else if(s.state==='load'){
   const c=lift.cabins[s.chair];if(!c){reset(s);return;}
   const target=lift.LIFT.reversible&&lift.boardingPoint?lift.boardingPoint(s.seat,c):station.load;
   if(lift.LIFT.reversible&&!lift.endInfo&&e.end==='top'){target.x+=lift.def.top[0]-lift.def.base[0];target.z+=lift.def.top[1]-lift.def.base[1];}
   const arrived=safeWalk(s,target,moving?dt:0,4,e.from,'load');
   const ready=lift.LIFT.reversible?c.station===e.end&&c.door>=.92&&c.dwellRemaining>2.8:lift.boardingWindow(c,e.end,'board',dest);
   if(arrived&&ready&&moving){s.state='board';s.t=0;s.boardFrom=s.g.position.clone();}
   else if(s.t>6&&moving){release(s,lift);s.state='queue';s.ticket=ctx.nextTicket();s.t=0;}
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
  s.skis.visible=false;s.legs.visible=true;s.seatedLegs.visible=false;s.g.scale.setScalar(1);s.g.rotation.x=s.g.rotation.z=0;
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
 return{update,reset,changed,populate,infrastructureChanged,animate:motion.tick};
};
