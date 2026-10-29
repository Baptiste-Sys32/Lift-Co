/* Explicit pedestrian transfers, routed around structures on existing ground. */
window.LiftCoLiftTransfer=(()=>{
 'use strict';
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 function blocked(a,b,boxes,crosses,pad=3){return !window.LiftCoWalkCurves.clear(a,b,boxes,pad);}
 function walkable(a,b,height){const n=Math.max(1,Math.ceil(distance(a,b)/2));let y=height(a.x,a.z);for(let i=1;i<=n;i++){const t=i/n,h=height(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t);if(Math.abs(a.x+(b.x-a.x)*t)>1697||Math.abs(a.z+(b.z-a.z)*t)>1697||!Number.isFinite(h)||Math.abs(h-y)>distance(a,b)/n*.6+.01)return false;y=h;}return true;}
 function generate(from,to,{access,boxes,height}){
  if(from.definition.id===to.definition.id)return{error:'Choose stations on two different lifts.'};
  let best=null;
  for(const a of access.ports(from.definition,from.end))for(const b of access.ports(to.definition,to.end)){
   if(distance(a,b)>400)continue;
   const nearby=boxes.filter(box=>distance(box,a)+distance(box,b)<distance(a,b)+250),nodes=[a,b];
   for(const box of nearby)for(const x of [-1,1])for(const z of [-1,1])nodes.push({x:box.x+box.across.x*x*(box.halfWidth+3.2)+box.along.x*z*(box.halfLength+3.2),z:box.z+box.across.z*x*(box.halfWidth+3.2)+box.along.z*z*(box.halfLength+3.2)});
   const costs=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),remaining=new Set(nodes.map((_,i)=>i));costs[0]=0;
   while(remaining.size){let at=-1;for(const i of remaining)if(at<0||costs[i]<costs[at])at=i;if(!Number.isFinite(costs[at])||at===1)break;remaining.delete(at);for(const i of remaining){const next=costs[at]+distance(nodes[at],nodes[i]);if(next>=costs[i]||next>500||blocked(nodes[at],nodes[i],nearby,access.crosses)||!walkable(nodes[at],nodes[i],height))continue;costs[i]=next;previous[i]=at;}}
   if(!Number.isFinite(costs[1])||best&&best.length<=costs[1])continue;
   const points=[];for(let at=1;at>=0;at=previous[at])points.unshift({x:nodes[at].x,z:nodes[at].z});best={points,connections:[a.id,b.id],length:costs[1]};
  }
  return best||{error:'No walkable connection within 400 m. Move the stations closer or draw a footpath with passage points.'};
 }
 function segment(a,b,{boxes,height,width=3}){return !blocked(a,b,boxes,null,width/2+.65)&&walkable(a,b,height);}
 function valid(route,options){const width=Math.max(route.width||3,...route.points.map(p=>p.width||0));return route.samples.every((p,i)=>!i||segment(route.samples[i-1],p,{...options,width}));}
 return{generate,valid,segment};
})();
