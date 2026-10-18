/* Guests only cross the mountain through confirmed network edges. */
window.LiftCoGuestNetwork=function(ctx){
 const {THREE:T,lifts,skiers,network,walkTo,cabinInterior,updateSkierEquipment,routePoint,servedRun}=ctx;
 const a=new T.Vector3(),b=new T.Vector3();
 let revision=0;
 function entrance(){return network.nodes.get(network.entrance);}
 function reset(s,notify=false){
  for(const l of lifts)for(const c of l.cabins)for(let i=0;i<c.riders.length;i++)if(c.riders[i]===s)c.riders[i]=null;
  s.ability??=Math.floor(Math.random()*4);s.recent??=[];s.networkNode=network.entrance;s.away=false;s.hasOuting=false;s.plan=[];s.edge=null;s.state='networkIdle';s.t=0;s.chair=-1;s.seat=-1;s.g.scale.setScalar(1);s.g.rotation.set(0,0,0);
  const p=entrance();if(p){s.x=p.x;s.z=p.z;s.g.position.set(p.x,ctx.terrainY(p.x,p.z),p.z);}s.g.visible=!!p;s.networkRevision=revision;
 }
 function changed(removedIds=[]){revision++;let affected=0;for(const s of skiers){if(removedIds.some(id=>s.edge?.liftId===id||s.edge?.route?.id===id||s.networkNode?.startsWith(id+':'))){reset(s);affected++;}else if(!s.edge){s.plan=[];s.networkRevision=revision;}}if(affected)ctx.notice(affected+' guests returned to the resort entrance after construction.');}
 function release(s,lift){const c=lift?.cabins[s.chair];if(c?.riders[s.seat]===s)c.riders[s.seat]=null;s.chair=-1;s.seat=-1;}
 function info(lift,end){
  if(lift.endInfo)return lift.endInfo(end);
  const top=end==='top',half=ctx.liftFrame(lift.def).length/2,sign=top?-1:1;
  return{end,queuePoint:i=>lift.worldPoint(0,sign*(half+4+i*.9)),load:lift.worldPoint(0,sign*half),unload:lift.worldPoint(0,-sign*half)};
 }
 function complete(s){s.networkNode=s.edge.to;if(s.networkRevision!==revision){s.plan=[];s.networkRevision=revision;}s.edge=null;s.state='networkIdle';s.t=0;if(s.networkNode===network.entrance&&!s.plan.length&&s.hasOuting){s.state='networkAway';s.away=true;}s.g.scale.setScalar(1);s.g.rotation.x=s.g.rotation.z=0;}
 function queueCost(e){if(e.kind!=='lift')return 0;const lift=lifts.find(l=>l.def.id===e.liftId);if(!lift)return 1e6;if(!lift.operations.running)return 1e5;return skiers.filter(s=>s.edge?.liftId===e.liftId&&s.edge.end===e.end&&s.state==='queue').length*8/lift.LIFT.capacity;}
 function update(s,dt){
  if(!s.networkNode)reset(s);
  const entry=entrance();if(!entry||!lifts.length){s.g.visible=false;return;}
  if(dt<=0)return;
  s.t+=dt;s.walking=false;
  if(s.state==='networkAway'){if(s.t>5)reset(s);return;}
  if(s.state==='networkIdle'){
   if(s.networkRevision!==revision){s.plan=[];s.networkRevision=revision;}
   if(!s.plan.length&&s.t>2){const outing=network.outing(s.networkNode,s.ability,s.recent,queueCost);s.hasOuting=!!outing;s.plan=outing||network.shortest(s.networkNode,network.entrance,s.ability,queueCost)||[];s.t=0;}
   if(s.plan.length){const edge=s.plan.shift();const exists=(network.edges.get(edge.from)||[]).some(e=>e.to===edge.to&&e.kind===edge.kind);if(!exists){s.plan=[];return;}s.edge=edge;s.distance=0;s.edgeStage=0;s.state=edge.kind==='lift'?'queue':edge.kind==='ski'?'ski':'networkWalk';s.t=0;if(edge.kind==='lift'){s.liftIndex=lifts.findIndex(l=>l.def.id===edge.liftId);s.ticket=ctx.nextTicket();}}
  }
  const e=s.edge;if(!e){s.g.position.set(s.x,ctx.terrainY(s.x,s.z),s.z);s.g.rotation.z=0;return;}
  if(e.kind!=='lift'){
   if(e.route){const r=e.route;s.distance=Math.min(r.length,s.distance+dt*(e.kind==='ski'?s.speed:2.8));const d=e.reverse?r.length-s.distance:s.distance;routePoint(r,d,a);routePoint(r,Math.max(0,Math.min(r.length,d+(e.reverse?-1:1))),b);s.x=a.x;s.z=a.z;s.g.position.set(a.x,ctx.terrainY(a.x,a.z)+.1,a.z);s.g.rotation.set(0,Math.atan2(b.x-a.x,b.z-a.z),e.kind==='ski'?Math.sin(s.distance*.12+s.wob)*.1:0);s.walking=e.kind!=='ski'&&dt>0;
    if(s.distance>=r.length){if(e.kind==='ski'){servedRun();s.recent.push(r.id);if(s.recent.length>3)s.recent.shift();}complete(s);}
   }else{const target=network.nodes.get(e.to);if(!target){reset(s);return;}if(walkTo(s,target,dt))complete(s);}
   if(s.state==='ski')ctx.leaveSkiTracks?.(s);else s.lastTrack=null;if(lifts[s.liftIndex])updateSkierEquipment(s);return;
  }
  const lift=lifts.find(l=>l.def.id===e.liftId);if(!lift){reset(s);return;}s.liftIndex=lifts.indexOf(lift);const station=info(lift,e.end),dest=e.end==='base'?'top':'base',moving=lift.operations.running;
  if(['queue','load'].includes(s.state)&&!lift.operations.open){release(s,lift);s.plan=[];s.edge=null;s.state='networkIdle';return;}
  if(s.state==='queue'){
   const line=skiers.filter(o=>o.edge?.liftId===e.liftId&&o.edge.end===e.end&&o.state==='queue').sort((a,b)=>a.ticket-b.ticket),index=line.indexOf(s),target=station.queuePoint(Math.max(0,index));
   const arrived=walkTo(s,target,dt);s.qi=index;
   if(index===0&&arrived&&moving)for(let i=0;i<lift.cabins.length;i++){const c=lift.cabins[i];if(c.cameraOnly)continue;const seat=c.riders.indexOf(null);const ready=lift.LIFT.reversible?c.station===e.end&&c.door>.8&&c.dwellRemaining>2:lift.boardingWindow(c,e.end,'reserve');if(ready&&seat>=0){c.riders[seat]=s;s.chair=i;s.seat=seat;s.state='load';s.t=0;s.seatedCabin=!!c.seatedCabin;break;}}
  }else if(s.state==='load'){
   const c=lift.cabins[s.chair];if(!c){reset(s);return;}
   const target=lift.LIFT.reversible&&lift.boardingPoint?lift.boardingPoint(s.seat,c):station.load;
   if(lift.LIFT.reversible&&!lift.endInfo&&e.end==='top'){target.x+=lift.def.top[0]-lift.def.base[0];target.z+=lift.def.top[1]-lift.def.base[1];}
   const arrived=walkTo(s,target,moving?dt:0,4);
   const ready=lift.LIFT.reversible?c.station===e.end&&c.door>.7:lift.boardingWindow(c,e.end,'board');
   if(arrived&&ready&&moving){s.state='board';s.t=0;s.boardFrom=s.g.position.clone();}
   else if(s.t>6&&moving){release(s,lift);s.state='queue';s.ticket=ctx.nextTicket();s.t=0;}
  }else if(s.state==='board'){
   if(!moving){s.t-=dt;return;}const c=lift.cabins[s.chair];cabinInterior(c,s.seat,a);const t=Math.min(1,s.t/.5);s.g.position.copy(s.boardFrom).lerp(a,t);s.g.scale.setScalar(1-.25*t);if(t>=1){s.state='ride';s.t=0;}
  }else if(s.state==='ride'){
   const c=lift.cabins[s.chair];cabinInterior(c,s.seat,a);s.g.position.copy(a);s.g.rotation.set(c.sway||0,c.yaw+lift.root.rotation.y+(c.seatYaw?.[s.seat]||0),c.swayRoll||0,'YXZ');
   const arrived=lift.LIFT.reversible?c.station===dest&&c.door>.8:lift.wrapDist(c.s,station.unloadGate)<1.2;
   if(arrived&&moving){s.unloadFrom=s.g.position.clone();s.unloadTo=lift.LIFT.reversible&&lift.unloadPoint?lift.unloadPoint(c):station.unload;if(lift.LIFT.reversible&&!lift.endInfo&&dest==='base')s.unloadTo=lift.worldPoint(0,ctx.liftFrame(lift.def).length/2);release(s,lift);s.state='unload';s.t=0;}
  }else if(s.state==='unload'){
   const t=Math.min(1,s.t/.8);s.g.position.copy(s.unloadFrom).lerp(s.unloadTo,t);s.g.scale.setScalar(.75+.25*t);s.x=s.g.position.x;s.z=s.g.position.z;if(t>=1){s.state='networkExit';s.g.rotation.x=s.g.rotation.z=0;}
  }else if(s.state==='networkExit'){
   const target=network.nodes.get(e.to);if(target&&walkTo(s,target,dt))complete(s);
  }
  updateSkierEquipment(s);
 }
 return{update,reset,changed};
};
