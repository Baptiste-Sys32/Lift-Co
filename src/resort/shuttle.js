/* One automatic 24-seat vehicle. Simulation owns seats and motion, models do not. */
window.LiftCoShuttle=function(ctx){
 const {THREE:T,scene,doc,terrainY,height=terrainY}=ctx,R=window.LiftCoRoads;
 // This contract survives visual asset replacement. Anchors locate the avatar
 // origin for each seated passenger, rather than being inferred from meshes.
 const BUS={capacity:24,width:2.45,length:8.2,wheelRadius:.48,seatAnchors:Array.from({length:24},(_,i)=>new T.Vector3([-.88,-.43,.43,.88][i%4],.42,-3.15+Math.floor(i/4)*.92))};
 const buses=new Map();let roads=[],paths=new Map();
 function busModel(){const root=new T.Group(),wheels=[],front=[],doors=[],seats=[];
  const material=color=>new T.MeshStandardMaterial({color,roughness:.65});const paint=material(0xb75f44),glass=material(0x718d91),dark=material(0x303e41),ivory=material(0xe9e4d1);glass.transparent=true;glass.opacity=.48;glass.depthWrite=false;
  function box(w,h,d,x,y,z,m){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;root.add(o);return o;}
  box(2.45,.65,8.2,0,.9,0,paint);box(2.45,.25,8.2,0,2.9,0,ivory);box(2.4,1.6,.12,0,2,4,glass);box(2.4,1.6,.12,0,2,-4,glass);
  for(const side of [-1,1])for(let z=-3.3;z<4;z+=1.1)if(!(side===1&&z>1.5))box(.08,1.3,1,side*1.2,2,z,glass);
  for(const x of [-1.2,1.2])for(const z of [-2.6,2.6]){const knuckle=new T.Group(),rotor=new T.Group(),wheel=new T.Mesh(new T.CylinderGeometry(.48,.48,.25,12),dark);wheel.rotation.z=Math.PI/2;rotor.add(wheel);knuckle.add(rotor);knuckle.position.set(x,.48,z);root.add(knuckle);wheels.push(rotor);if(z>0)front.push(knuckle);}
  for(const z of [2.3,3.2]){const o=box(.1,2,.85,1.24,1.7,z,glass);doors.push(o);}
  // Six rows, two seats either side of the aisle. All 24 are explicit anchors.
  for(let row=0;row<6;row++)for(const x of [-.88,-.43,.43,.88]){const anchor=BUS.seatAnchors[seats.length].clone();seats.push(anchor);box(.4,.17,.48,x,1.25,anchor.z,dark);box(.4,.58,.12,x,1.58,anchor.z-.22,dark);}
  return{root,seats,wheels,front,doors,update(dt,speed,steer,door){for(const w of wheels)w.rotation.x+=speed*dt/BUS.wheelRadius;for(const f of front)f.rotation.y=steer;for(let i=0;i<doors.length;i++)doors[i].position.z=[2.3,3.2][i]+(i?1:-1)*door*.7;},dispose(){window.LiftCoVillage.dispose(root);}};
 }
 function compile(){roads=R.compile(T,doc,height);paths=new Map();for(const route of doc.shuttles){const p=R.path(T,doc,roads,...route.stops);if(p)paths.set(route.id,p);} }
 function geometry(s,direction){const path=paths.get(s.id);if(!path)return null;const source=doc.stops.find(x=>x.id===s.stops[direction===1?0:1]),target=doc.stops.find(x=>x.id===s.stops[direction===1?1:0]),a=R.stopInfo(source,roads,height),b=R.stopInfo(target,roads,height);if(!a||!b)return null;
  const samples=[];function add(p){if(!samples.length||R.distance(samples.at(-1),p)>.01)samples.push(p);}
  const sourceTangent=R.at(path,direction===1?0:path.length),targetTangent=R.at(path,direction===1?path.length:0),trim=Math.min(24,path.length/4);
  function terminal(info,arrive,tangent){const dx=tangent.dx*direction,dz=tangent.dz*direction,nx=info.dz*info.side,nz=-info.dx*info.side,right={x:dz*1.5,z:-dx*1.5};
   const end=arrive?[nx*28,nz*28]:[dx*trim+right.x,dz*trim+right.z],start=arrive?[-dx*trim+right.x,-dz*trim+right.z]:[nx*28,nz*28],pts=arrive?[start,[start[0]+dx*trim,start[1]+dz*trim],[end[0]+dx*14,end[1]+dz*14],end]:[start,[start[0]+dx*12,start[1]+dz*12],[end[0]-dx*8,end[1]-dz*8],end];
   const c=new T.CubicBezierCurve3(...pts.map(([x,z])=>new T.Vector3(info.x+x,info.y+.12,info.z+z)));return c.getSpacedPoints(50);}

  for(const p of terminal(a,false,sourceTangent))add(p);
  const n=Math.max(2,Math.ceil((path.length-2*trim)/2));for(let i=0;i<=n;i++){const d=trim+(path.length-2*trim)*i/n,p=R.at(path,direction===1?d:path.length-d);add({x:p.x+p.dz*direction*1.5,y:p.y+.12,z:p.z-p.dx*direction*1.5});}
  for(const p of terminal(b,true,targetTangent))add(p);const distances=[0];for(let i=1;i<samples.length;i++)distances.push(distances[i-1]+R.distance(samples[i-1],samples[i]));return{samples,distances,length:distances.at(-1),from:source.id,to:target.id};
 }

 function sync(){compile();const signature=()=>R.signature(doc);for(const [id,b]of buses)if(!doc.shuttles.some(s=>s.id===id)||!paths.has(id)||b.signature!==signature(doc.shuttles.find(s=>s.id===id))){b.model.dispose();buses.delete(id);}for(const s of doc.shuttles){const old=buses.get(s.id);if(old){old.definition=s;continue;}if(!paths.has(s.id))continue;const model=ctx.createShuttleModel?.(BUS)||busModel(),stop=doc.stops.find(x=>x.id===s.stops[0]),p=R.stopInfo(stop,roads,height);scene.add(model.root);model.root.position.set(p.board.x,p.y+.12,p.board.z);const tangent=R.at(geometry(s,1),0);model.root.rotation.y=Math.atan2(tangent.dx,tangent.dz);buses.set(s.id,{id:s.id,definition:s,signature:signature(s),model,riders:Array(BUS.capacity).fill(null),direction:1,at:stop.id,phase:'dwell',dwell:0,door:1,speed:0,distance:0,traveled:0});}
 }
 function release(s){for(const b of buses.values())for(let i=0;i<BUS.capacity;i++)if(b.riders[i]===s)b.riders[i]=null;s.busId=null;s.busSeat=-1;}
 function seatPoint(b,index,out=new T.Vector3()){b.model.root.updateMatrixWorld(true);return out.copy(BUS.seatAnchors[index]).applyMatrix4(b.model.root.matrixWorld);}
 function ready(b){return b.phase==='dwell'&&b.door>.99;}
 function update(dt){if(dt<=0)return;for(const b of buses.values()){b.frameDistance=0;
   if(b.phase==='dwell'){b.speed=0;b.door=Math.min(1,b.door+dt*1.7);b.dwell+=dt;
    const waiting=ctx.skiers.some(s=>s.state==='busQueue'&&s.edge?.shuttleId===b.id&&s.edge.from===b.at),busy=ctx.skiers.some(s=>s.busId===b.id&&['busBoard','busUnload'].includes(s.state)),unloading=b.riders.some(s=>s?.edge?.to===b.at);
    if(b.dwell>=8&&!busy&&!unloading&&(b.definition.open===false||!waiting||!b.riders.includes(null))){b.phase='closing';}
   }else if(b.phase==='closing'){b.door=Math.max(0,b.door-dt*1.7);if(b.door===0){b.trip=geometry(b.definition,b.direction);if(b.trip){b.phase='travel';b.at=null;b.distance=0;}else b.phase='dwell';}}
   else if(b.phase==='travel'){
    const left=b.trip.length-b.distance,p=R.at(b.trip,b.distance),q=R.at(b.trip,Math.min(b.trip.length,b.distance+5)),far=R.at(b.trip,Math.min(b.trip.length,b.distance+14)),yaw=Math.atan2(p.dx,p.dz),nextYaw=Math.atan2(far.dx,far.dz),bend=Math.abs(Math.atan2(Math.sin(nextYaw-yaw),Math.cos(nextYaw-yaw))),limit=Math.min(30/3.6,Math.sqrt(Math.max(0,2*1.3*left)),bend>.01?Math.sqrt(1.3*14/bend):Infinity);
    let anticipated=limit;for(let look=4;look<=56;look+=4){const x=R.at(b.trip,b.distance+look),y=R.at(b.trip,b.distance+look+4),turn=Math.abs(Math.atan2(x.dx*y.dz-x.dz*y.dx,x.dx*y.dx+x.dz*y.dz)),corner=Math.sqrt(1.3*4/Math.max(.001,turn));anticipated=Math.min(anticipated,Math.sqrt(corner*corner+2*1.3*look));}
    b.speed=Math.max(0,b.speed+clamp(anticipated-b.speed,-1.3*dt,.9*dt));const ds=Math.min(left,b.speed*dt);b.distance+=ds;b.traveled+=ds;b.frameDistance=ds;const pos=R.at(b.trip,b.distance);b.model.root.position.set(pos.x,height(pos.x,pos.z)+.12,pos.z);b.model.root.rotation.set(-Math.atan2(q.y-p.y,5),Math.atan2(pos.dx,pos.dz),0,'YXZ');b.steer=clamp(Math.atan(4.7*bend/14),-.55,.55)*Math.sign(Math.sin(nextYaw-yaw));
    if(left<.03||b.distance>=b.trip.length-.01){b.speed=0;b.at=b.trip.to;b.phase='dwell';b.dwell=0;b.direction*=-1;}
   }b.model.update(dt,b.frameDistance/dt,b.steer||0,b.door);
  }}
 const clamp=window.LiftCoResort.clamp;
 function stats(id){const b=buses.get(id),p=paths.get(id);if(!b||!p)return null;return{passengers:b.riders.filter(Boolean).length,waiting:ctx.skiers.filter(s=>s.edge?.shuttleId===id&&s.state==='busQueue').length,roundTrip:2*p.length/6+32,phase:b.phase,speed:b.speed};}
 function edges(network){for(const s of doc.shuttles){const p=paths.get(s.id);if(!p||s.open===false)continue;for(const [from,to]of [s.stops,[...s.stops].reverse()])network.edges.get(from)?.push({from,to,kind:'bus',shuttleId:s.id,cost:p.length/6+16+(2*p.length/6+32)/2});}}
 return{spec:BUS,sync,update,release,seatPoint,ready,stats,buses,edges,get paths(){return paths;}};
};
