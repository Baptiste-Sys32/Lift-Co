/* Shared resort data, reversible earthworks and explicit guest connectivity. */
window.LiftCoResort=(()=>{
 'use strict';
 const copy=v=>JSON.parse(JSON.stringify(v)),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const id=prefix=>prefix+'-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
 function migrate(saved,lifts){
  const doc={version:2,lifts:copy(lifts),pistes:copy(saved?.pistes||[]),paths:copy(saved?.paths||[]),junctions:copy(saved?.junctions||[]),terrainLayers:copy(saved?.terrainLayers||[]),entranceStation:saved?.entranceStation||null};
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
  rebuild(layers){this.layers=layers;for(let j=0;j<this.n;j++)for(let i=0;i<this.n;i++)this.grid[j*this.n+i]=this.base(i*this.step-this.half,j*this.step-this.half);for(const layer of layers)for(const s of layer.samples||[])this.stamp(s);}
  stamp(s){const r=clamp(s.radius||10,2,150),i0=clamp(Math.floor((s.x-r+this.half)/this.step),0,this.n-1),i1=clamp(Math.ceil((s.x+r+this.half)/this.step),0,this.n-1),j0=clamp(Math.floor((s.z-r+this.half)/this.step),0,this.n-1),j1=clamp(Math.ceil((s.z+r+this.half)/this.step),0,this.n-1),values=[];
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=i*this.step-this.half,z=j*this.step-this.half,d=Math.hypot(x-s.x,z-s.z)/r;if(d>=1)continue;const weight=(1-d*d)**2,k=j*this.n+i,y=this.grid[k];let target=y;
    if(s.mode==='raise'||s.mode==='lower')target=y+(s.mode==='raise'?1:-1)*(s.strength||1);
    else if(s.mode==='flatten')target=s.height;
    else {target=(this.sample(x-this.step,z)+this.sample(x+this.step,z)+this.sample(x,z-this.step)+this.sample(x,z+this.step))/4;}
    values.push([k,y+(target-y)*weight*(s.mode==='raise'||s.mode==='lower'?1:clamp(s.strength??.5,0,1))]);
   }for(const [k,v]of values)this.grid[k]=v;
  }
 }
 function route(T,feature,height){
  if(feature.points.length<2)return null;
  const curve=new T.CatmullRomCurve3(feature.points.map(p=>new T.Vector3(p.x,0,p.z)),false,'centripetal');
  const count=clamp(Math.ceil(curve.getLength()/2),20,1600),samples=curve.getSpacedPoints(count),distances=[0];
  for(let i=0;i<samples.length;i++){samples[i].y=height(samples[i].x,samples[i].z);if(i)distances.push(distances[i-1]+Math.hypot(samples[i].x-samples[i-1].x,samples[i].z-samples[i-1].z));}
  return{...feature,samples,distances,length:distances.at(-1),width:feature.width||10};
 }
 function measure(r,height){
  let maxAngle=0,crossSlope=0,rise=0,climbStart=0,maxRise=0,maxClimb=0;
  for(let i=1;i<r.samples.length;i++){
   const a=r.samples[i-1],b=r.samples[i],dy=b.y-a.y,ds=r.distances[i]-r.distances[i-1];
   if(dy>.015){if(!rise)climbStart=r.distances[i-1];rise+=dy;maxRise=Math.max(maxRise,rise);maxClimb=Math.max(maxClimb,r.distances[i]-climbStart);}else if(dy<-.015)rise=0;
   const dx=(b.x-a.x)/Math.max(.001,ds),dz=(b.z-a.z)/Math.max(.001,ds),w=(r.width||10)/2;
   crossSlope=Math.max(crossSlope,Math.atan2(Math.abs(height(b.x+dz*w,b.z-dx*w)-height(b.x-dz*w,b.z+dx*w)),w*2)*180/Math.PI);
   if(r.distances[i]>=25){let j=i-1;while(j>0&&r.distances[i]-r.distances[j]<25)j--;const u=(r.distances[i]-25-r.distances[j])/(r.distances[j+1]-r.distances[j]);const y=r.samples[j].y+(r.samples[j+1].y-r.samples[j].y)*u;maxAngle=Math.max(maxAngle,Math.atan2(Math.max(0,y-b.y),25)*180/Math.PI);}
  }
  if(r.length<25)maxAngle=Math.atan2(Math.max(0,r.samples[0].y-r.samples.at(-1).y),r.length)*180/Math.PI;
  const ability=maxAngle<=8+1e-8?0:maxAngle<=16+1e-8?1:maxAngle<=25+1e-8?2:3;
  return{maxAngle,crossSlope,maxRise,maxClimb,ability,suggestion:['green','blue','red','black'][ability],valid:maxRise<=2.01&&maxClimb<=20.01&&crossSlope<=25};
 }
 function shaping(T,feature,height){
  if(!feature.points.some(p=>Number.isFinite(p.height)))return null;
  const curve=new T.CatmullRomCurve3(feature.points.map(p=>new T.Vector3(p.x,p.height??height?.(p.x,p.z)??0,p.z)),false,'centripetal');const n=clamp(Math.ceil(curve.getLength()/3),2,1800);
  return{id:'earthworks:'+feature.id,owner:feature.id,samples:curve.getSpacedPoints(n).map((p,i)=>({mode:'flatten',x:p.x,z:p.z,height:p.y,radius:(feature.points[Math.round(i/n*(feature.points.length-1))]?.width||feature.width||10)*.8,strength:.65}))};
 }
 class Network{
  rebuild(doc,routes,stationPoint){
   this.nodes=new Map();this.edges=new Map();this.doc=doc;this.routes=routes;
   const addNode=(key,p)=>{this.nodes.set(key,p);if(!this.edges.has(key))this.edges.set(key,[]);};
   const edge=(from,to,data)=>{if(this.nodes.has(from)&&this.nodes.has(to))this.edges.get(from).push({from,to,...data});};
   for(const lift of doc.lifts)for(const end of (window.LiftCoNextAlignment?.ends(lift)||['base','top']))addNode(lift.id+':'+end,stationPoint(lift,end));
   for(const j of doc.junctions)addNode(j.id,j);
   for(const f of [...doc.paths,...doc.pistes]){if(f.points.length<2)continue;addNode(f.id+':start',f.points[0]);addNode(f.id+':end',f.points.at(-1));}
   for(const f of [...doc.paths,...doc.pistes]){
    if(f.points.length<2)continue;const a=f.id+':start',b=f.id+':end';for(const [key,target]of [[a,f.connections?.[0]],[b,f.connections?.[1]]])if(target){edge(key,target,{kind:'access',cost:1});edge(target,key,{kind:'access',cost:1});}
    const r=routes.find(r=>r.id===f.id);if(!r||f.open===false)continue;
    if(doc.paths.includes(f)){edge(a,b,{kind:'walk',route:r,cost:r.length/2.8});edge(b,a,{kind:'walk',route:r,reverse:true,cost:r.length/2.8});}
    else if(r.rating.valid)edge(a,b,{kind:'ski',route:r,ability:r.rating.ability,cost:r.length/7});
   }
   for(const lift of doc.lifts){if(lift.operations?.open===false)continue;const ends=window.LiftCoNextAlignment?.ends(lift)||['base','top'],path=window.LiftCoNextAlignment?.make(lift),distance=end=>end==='base'?0:end==='mid'?path.midDistance:path?.length??Math.hypot(lift.base[0]-lift.top[0],lift.base[1]-lift.top[1]);for(const a of ends)for(const b of ends)if(a!==b)edge(lift.id+':'+a,lift.id+':'+b,{kind:'lift',liftId:lift.id,end:a,dest:b,cost:Math.abs(distance(a)-distance(b))/(lift.operations?.speed||5)+20});}
   this.entrance=doc.entranceStation;
  }
  shortest(from,to,ability=3,penalty=()=>0){const dist=new Map([[from,0]]),prev=new Map(),remaining=new Set(this.nodes.keys());while(remaining.size){let at=null,best=Infinity;for(const k of remaining)if((dist.get(k)??Infinity)<best){at=k;best=dist.get(k);}if(at===null)break;remaining.delete(at);if(at===to)break;for(const e of this.edges.get(at)||[]){if((e.ability??0)>ability)continue;const d=best+e.cost+penalty(e);if(d<(dist.get(e.to)??Infinity)){dist.set(e.to,d);prev.set(e.to,e);}}}if(!dist.has(to))return null;const result=[];for(let k=to;k!==from;){const e=prev.get(k);if(!e)return null;result.unshift(e);k=e.from;}return result;}
  outing(from,ability,recent=[],queue=()=>0){let best=null,score=Infinity;for(const edges of this.edges.values())for(const e of edges){if(e.kind!=='ski'||e.ability>ability)continue;const there=this.shortest(from,e.from,ability,queue),back=this.shortest(e.to,this.entrance,ability,queue);if(!there||!back)continue;const candidate=[...there,e,...back],cost=candidate.reduce((n,v)=>n+v.cost+queue(v),0)*(recent.includes(e.route.id)?2.5:1)*(1+Math.random()*.4);if(cost<score){best=candidate;score=cost;}}return best;}
 }
 return{copy,id,clamp,migrate,History,Terrain,route,measure,shaping,Network};
})();
