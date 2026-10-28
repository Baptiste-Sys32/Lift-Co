/* Shared resort data, reversible earthworks and explicit guest connectivity. */
window.LiftCoResort=(()=>{
 'use strict';
 const pisteLimits={maxRise:3};
 const copy=v=>JSON.parse(JSON.stringify(v)),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const id=prefix=>prefix+'-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
 function migrate(saved,lifts){
  const doc={version:3,world:copy(saved?.world||{mapId:'upper-snowfields-v1',generatorRevision:'twin-summit-snowfields-1',width:3600,depth:3600}),buildings:copy(saved?.buildings||[]),roads:copy(saved?.roads||[]),stops:copy(saved?.stops||[]),shuttles:copy(saved?.shuttles||[]),lifts:copy(lifts),pistes:copy(saved?.pistes||[]),paths:copy(saved?.paths||[]),junctions:copy(saved?.junctions||[]),terrainLayers:copy(saved?.terrainLayers||[]),entranceStation:saved?.entranceStation||null};
  for(const lift of doc.lifts){lift.towers.forEach((t,i)=>t.id??=lift.id+'-tower-'+(i+1));lift.operations??={open:true,running:true,speed:null,count:null};}
  doc.entranceStation??=doc.lifts[0]?doc.lifts[0].id+':base':null;
  return doc;
 }
 class History{
  constructor(){this.past=[];this.future=[];}
  record(before,after){if(JSON.stringify(before)===JSON.stringify(after))return;this.past.push(copy(before));if(this.past.length>60)this.past.shift();this.future=[];}
  undo(current){if(!this.past.length)return null;this.future.push(copy(current));return this.past.pop();}
  redo(current){if(!this.future.length)return null;this.past.push(copy(current));return this.future.pop();}
 }
 // A cached height field is authoritative for rendering, scenery and simulation.
 // Layers are replayed in order, so removing one feature restores other owners.
 class Terrain{
  constructor(base,half=1800,step=5){this.base=base;this.half=half;this.step=step;this.n=2*half/step+1;this.grid=new Float32Array(this.n*this.n);this.layers=[];this.rebuild([]);}
  sample(x,z){const gx=clamp((x+this.half)/this.step,0,this.n-1),gz=clamp((z+this.half)/this.step,0,this.n-1),i=Math.min(this.n-2,Math.floor(gx)),j=Math.min(this.n-2,Math.floor(gz)),u=gx-i,v=gz-j,k=j*this.n+i;return this.grid[k]*(1-u)*(1-v)+this.grid[k+1]*u*(1-v)+this.grid[k+this.n]*(1-u)*v+this.grid[k+this.n+1]*u*v;}
  rebuild(layers){this.layers=layers;for(let j=0;j<this.n;j++)for(let i=0;i<this.n;i++)this.grid[j*this.n+i]=this.base(i*this.step-this.half,j*this.step-this.half);for(const layer of layers){if(layer.type==='piste-corridor'){this.corridor(layer);continue;}this.layerReference=layer.maxChange?this.grid.slice():null;this.layerProtection=layer.protectedBoxes||[];this.layerMaxChange=layer.maxChange;for(const s of layer.samples||[])this.stamp(s);}this.layerReference=null;this.layerProtection=[];this.layerMaxChange=null;}
  corridor(layer){
   const w=layer.width/2,outer=w+12,values=new Map(),points=layer.points;
   for(let n=1;n<points.length;n++){const a=points[n-1],b=points[n],dx=b.x-a.x,dz=b.z-a.z,ds2=dx*dx+dz*dz;if(ds2<.0001)continue;
    const i0=clamp(Math.floor((Math.min(a.x,b.x)-outer+this.half)/this.step),0,this.n-1),i1=clamp(Math.ceil((Math.max(a.x,b.x)+outer+this.half)/this.step),0,this.n-1),j0=clamp(Math.floor((Math.min(a.z,b.z)-outer+this.half)/this.step),0,this.n-1),j1=clamp(Math.ceil((Math.max(a.z,b.z)+outer+this.half)/this.step),0,this.n-1);
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=i*this.step-this.half,z=j*this.step-this.half,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/ds2,0,1),distance=Math.hypot(x-a.x-t*dx,z-a.z-t*dz),k=j*this.n+i;if(distance>=outer||distance>=(values.get(k)?.distance??Infinity))continue;values.set(k,{x,z,distance,height:a.height+(b.height-a.height)*t});}
   }
   for(const [k,p]of values){if((layer.protectedBoxes||[]).some(b=>{const dx=p.x-b.x,dz=p.z-b.z;return Math.abs(dx*b.along.x+dz*b.along.z)<=b.halfLength+2&&Math.abs(dx*b.across.x+dz*b.across.z)<=b.halfWidth+2;}))continue;const weight=p.distance<=w+3?1:(1-((p.distance-w-3)/(outer-w-3))**2)**2,y=this.grid[k],target=clamp(p.height,y-(layer.maxChange||5),y+(layer.maxChange||5));this.grid[k]=y+(target-y)*weight;}
  }
  stamp(s){const r=clamp(s.radius||10,2,150),i0=clamp(Math.floor((s.x-r+this.half)/this.step),0,this.n-1),i1=clamp(Math.ceil((s.x+r+this.half)/this.step),0,this.n-1),j0=clamp(Math.floor((s.z-r+this.half)/this.step),0,this.n-1),j1=clamp(Math.ceil((s.z+r+this.half)/this.step),0,this.n-1),values=[];
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=i*this.step-this.half,z=j*this.step-this.half,d=Math.hypot(x-s.x,z-s.z)/r;if((this.layerProtection||[]).some(b=>{const dx=x-b.x,dz=z-b.z;return Math.abs(dx*b.along.x+dz*b.along.z)<=b.halfLength+2&&Math.abs(dx*b.across.x+dz*b.across.z)<=b.halfWidth+2;})||d>=1||(s.clipPlanes||[]).some(p=>(x-p.x)*p.dx+(z-p.z)*p.dz<0))continue;const inner=clamp((s.innerRadius||0)/r,0,.99),weight=d<=inner?1:(1-((d-inner)/(1-inner))**2)**2,k=j*this.n+i,y=this.grid[k];let target=y;
    if(s.mode==='raise'||s.mode==='lower')target=y+(s.mode==='raise'?1:-1)*(s.strength||1);
    else if(s.mode==='flatten')target=s.height+(s.gradeX||0)*(x-s.x)+(s.gradeZ||0)*(z-s.z);
    else {target=(this.sample(x-this.step,z)+this.sample(x+this.step,z)+this.sample(x,z-this.step)+this.sample(x,z+this.step))/4;}
    if(this.layerReference)target=clamp(target,this.layerReference[k]-this.layerMaxChange,this.layerReference[k]+this.layerMaxChange);
    values.push([k,y+(target-y)*weight*(s.mode==='raise'||s.mode==='lower'?1:clamp(s.strength??.5,0,1))]);
   }for(const [k,v]of values)this.grid[k]=v;
  }
 }
 function route(T,feature,height){
  if(feature.points.length<2)return null;
  const curve=new T.CatmullRomCurve3(feature.points.map(p=>new T.Vector3(p.x,0,p.z)),false,'centripetal');
  const count=clamp(Math.ceil(curve.getLength()/2),20,1600),samples=feature.liftTransfer?feature.points.flatMap((p,i,list)=>{if(!i)return[new T.Vector3(p.x,0,p.z)];const a=list[i-1],n=Math.max(1,Math.ceil(Math.hypot(p.x-a.x,p.z-a.z)/2));return Array.from({length:n},(_,j)=>new T.Vector3(a.x+(p.x-a.x)*(j+1)/n,0,a.z+(p.z-a.z)*(j+1)/n));}):curve.getSpacedPoints(count),distances=[0];
  for(let i=0;i<samples.length;i++){samples[i].y=height(samples[i].x,samples[i].z);if(i)distances.push(distances[i-1]+Math.hypot(samples[i].x-samples[i-1].x,samples[i].z-samples[i-1].z));}
  return{...feature,samples,distances,length:distances.at(-1),width:feature.width||10};
 }
 function measure(r,height){
  let maxAngle=0,crossSlope=0,rise=0,climbStart=0,maxRise=0,maxClimb=0,maxRiseStart=0,maxRiseEnd=0;
  for(let i=1;i<r.samples.length;i++){
   const a=r.samples[i-1],b=r.samples[i],dy=b.y-a.y,ds=r.distances[i]-r.distances[i-1];
   if(dy>.015){if(!rise)climbStart=r.distances[i-1];rise+=dy;if(rise>maxRise){maxRise=rise;maxRiseStart=climbStart;maxRiseEnd=r.distances[i];}maxClimb=Math.max(maxClimb,r.distances[i]-climbStart);}else if(dy<-.015)rise=0;
   const dx=(b.x-a.x)/Math.max(.001,ds),dz=(b.z-a.z)/Math.max(.001,ds),w=(r.width||10)/2;
   crossSlope=Math.max(crossSlope,Math.atan2(Math.abs(height(b.x+dz*w,b.z-dx*w)-height(b.x-dz*w,b.z+dx*w)),w*2)*180/Math.PI);
   if(r.distances[i]>=25){let j=i-1;while(j>0&&r.distances[i]-r.distances[j]<25)j--;const u=(r.distances[i]-25-r.distances[j])/(r.distances[j+1]-r.distances[j]);const y=r.samples[j].y+(r.samples[j+1].y-r.samples[j].y)*u;maxAngle=Math.max(maxAngle,Math.atan2(Math.max(0,y-b.y),25)*180/Math.PI);}
  }
  if(r.length<25)maxAngle=Math.atan2(Math.max(0,r.samples[0].y-r.samples.at(-1).y),r.length)*180/Math.PI;
  const ability=maxAngle<=8+1e-8?0:maxAngle<=16+1e-8?1:maxAngle<=25+1e-8?2:3;
  const terrainValid=maxRise<=pisteLimits.maxRise+.01&&crossSlope<=25;return{maxAngle,crossSlope,maxRise,maxClimb,maxRiseStart,maxRiseEnd,maxRiseDistance:maxRiseEnd-maxRiseStart,netDrop:r.samples[0].y-r.samples.at(-1).y,measuredAbility:ability,ability:r.testTerrain?0:ability,suggestion:['green','blue','red','black'][ability],terrainValid,valid:!!r.testTerrain||terrainValid};
 }
 function remapConnections(routes,mapping){const remap=key=>Object.hasOwn(mapping,key)?mapping[key]:key;for(const f of routes){if(f.connections)f.connections=f.connections.map(remap);if(f.autoPiste)for(const anchor of [f.autoPiste.start,...f.autoPiste.guides,f.autoPiste.end])if(anchor)anchor.connection=remap(anchor.connection);}}
 function reverseRoute(feature,routes=[]){feature.points.reverse();feature.connections=[feature.connections?.[1]||null,feature.connections?.[0]||null];if(feature.autoPiste){const p=feature.autoPiste;[p.start,p.end]=[p.end,p.start];p.guides.reverse();}const a=feature.id+':start',b=feature.id+':end';remapConnections(routes.filter(f=>f!==feature),{[a]:b,[b]:a});return feature;}
 function shaping(T,feature,height){
  if(!feature.points.some(p=>Number.isFinite(p.height)))return null;
  const curve=new T.CatmullRomCurve3(feature.points.map(p=>new T.Vector3(p.x,p.height??height?.(p.x,p.z)??0,p.z)),false,'centripetal');const n=clamp(Math.ceil(curve.getLength()/3),2,1800);
  return{id:'earthworks:'+feature.id,owner:feature.id,samples:curve.getSpacedPoints(n).map((p,i)=>({mode:'flatten',x:p.x,z:p.z,height:p.y,radius:(feature.points[Math.round(i/n*(feature.points.length-1))]?.width||feature.width||10)*.8,strength:.65}))};
 }
 class Network{
  rebuild(doc,routes,stationPoint,stationAccess=null){
   this.nodes=new Map();this.edges=new Map();this.doc=doc;this.routes=routes;
   const addNode=(key,p)=>{this.nodes.set(key,p);if(!this.edges.has(key))this.edges.set(key,[]);};
   const edge=(from,to,data)=>{if(this.nodes.has(from)&&this.nodes.has(to))this.edges.get(from).push({from,to,...data});};
   for(const lift of doc.lifts)for(const end of (window.LiftCoNextAlignment?.ends(lift)||['base','top'])){const hub=lift.id+':'+end,origin=stationPoint(lift,end);addNode(hub,origin);for(const port of stationAccess?.ports(lift,end)||[]){addNode(port.id,port);const walk=stationAccess.path(lift,end,origin,port),cost=(walk?.length||Math.hypot(port.x-origin.x,port.z-origin.z))/1.7;edge(hub,port.id,{kind:'stationWalk',stationKey:hub,cost});edge(port.id,hub,{kind:'stationWalk',stationKey:hub,cost});}}
   for(const j of doc.junctions)addNode(j.id,j);
   for(const b of doc.buildings||[])addNode(b.id+':home',window.LiftCoVillage.entrance(b));
   const roads=window.LiftCoRoads?.compile(globalThis.THREE||window.LiftCoThree,doc,()=>0)||[];
   for(const s of doc.stops||[]){const p=window.LiftCoRoads.stopInfo(s,roads,()=>0);if(!p)continue;addNode(s.id+':ped',p.ped);addNode(s.id,p.board);edge(s.id+':ped',s.id,{kind:'access',cost:5/1.7});edge(s.id,s.id+':ped',{kind:'access',cost:5/1.7});}
   for(const f of [...doc.paths,...doc.pistes]){if(f.points.length<2)continue;const r=routes.find(r=>r.id===f.id);addNode(f.id+':start',r?.samples[0]||f.points[0]);addNode(f.id+':end',r?.samples.at(-1)||f.points.at(-1));}
   for(const f of [...doc.paths,...doc.pistes]){
    if(f.points.length<2)continue;const a=f.id+':start',b=f.id+':end',r=routes.find(r=>r.id===f.id);for(const [i,key,target]of [[0,a,f.connections?.[0]],[1,b,f.connections?.[1]]])if(target){const access=r?.stationAccess?.[i];if(access){edge(key,target,{kind:'push',route:access,reverse:i===0,cost:access.length/2.8});edge(target,key,{kind:'push',route:access,reverse:i===1,cost:access.length/2.8});}else{edge(key,target,{kind:'access',cost:1});edge(target,key,{kind:'access',cost:1});}}
    if(!r||r.length<.1||f.open===false||r.walkingBlocked)continue;
    if(doc.paths.includes(f)){edge(a,b,{kind:'walk',route:r,cost:r.length/1.7});edge(b,a,{kind:'walk',route:r,reverse:true,cost:r.length/1.7});}
    else if(r.rating.valid)edge(a,b,{kind:'ski',route:r,ability:r.rating.ability,cost:r.length/7});
   }
   for(const lift of doc.lifts){if(lift.operations?.open===false)continue;const ends=window.LiftCoNextAlignment?.ends(lift)||['base','top'],path=window.LiftCoNextAlignment?.make(lift),distance=end=>end==='base'?0:end==='mid'?path.midDistance:path?.length??Math.hypot(lift.base[0]-lift.top[0],lift.base[1]-lift.top[1]);for(const a of ends)for(const b of ends)if(a!==b)edge(lift.id+':'+a,lift.id+':'+b,{kind:'lift',liftId:lift.id,end:a,dest:b,cost:Math.abs(distance(a)-distance(b))/(lift.operations?.speed||5)+20});}
   this.entrance=doc.entranceStation;
  }
  shortest(from,to,ability=3,penalty=()=>0){if(!this.nodes.has(from)||!this.nodes.has(to))return null;const dist=new Map([[from,0]]),prev=new Map(),remaining=new Set(this.nodes.keys());while(remaining.size){let at=null,best=Infinity;for(const k of remaining)if((dist.get(k)??Infinity)<best){at=k;best=dist.get(k);}if(at===null)break;remaining.delete(at);if(at===to)break;for(const e of this.edges.get(at)||[]){if((e.ability??0)>ability)continue;const d=best+e.cost+penalty(e);if(d<(dist.get(e.to)??Infinity)){dist.set(e.to,d);prev.set(e.to,e);}}}if(!dist.has(to))return null;const result=[];for(let k=to;k!==from;){const e=prev.get(k);if(!e)return null;result.unshift(e);k=e.from;}return result;}
  homeStatus(home,abilities=[0,1,2,3]){
   const result=(code,connected=false)=>({code,connected,ready:code==='ready'}),doc=this.doc;
   if(!doc?.lifts.length)return result('lift_missing');
   const reachable=doc.lifts.filter(l=>(window.LiftCoNextAlignment?.ends(l)||['base','top']).some(end=>this.shortest(home,l.id+':'+end,3)!==null));
   if(!reachable.length)return result('path_missing');
   if(!doc.pistes.length)return result('piste_missing',true);
   if(!doc.pistes.some(p=>p.open!==false))return result('piste_closed',true);
   const descents=[...this.edges.values()].flat().filter(e=>e.kind==='ski');
   if(!descents.length)return result('piste_invalid',true);
   if(reachable.every(l=>l.operations?.open===false))return result('lift_closed',true);
   const accessible=descents.filter(e=>this.shortest(home,e.from,3)!==null);
   if(!accessible.length)return result('piste_connections',true);
   const returning=accessible.filter(e=>this.shortest(e.to,home,3)!==null);
   if(!returning.length)return result('return_missing',true);
   const suitable=returning.some(e=>abilities.some(a=>e.ability<=a&&this.shortest(home,e.from,a)!==null&&this.shortest(e.to,home,a)!==null));
   return result(suitable?'ready':'ability',true);
  }
  outing(from,ability,recent=[],queue=()=>0,home=this.entrance){let best=null,score=Infinity;for(const edges of this.edges.values())for(const e of edges){if(e.kind!=='ski'||e.ability>ability)continue;const there=this.shortest(from,e.from,ability,queue),back=this.shortest(e.to,home,ability,queue);if(!there||!back)continue;const candidate=[...there,e,...back],cost=candidate.reduce((n,v)=>n+v.cost+queue(v),0)*(recent.includes(e.route.id)?2.5:1)*(1+Math.random()*.4);if(cost<score){best=candidate;score=cost;}}return best;}
 }
 return{copy,id,clamp,migrate,History,Terrain,route,measure,pisteLimits,remapConnections,reverseRoute,shaping,Network};
})();
