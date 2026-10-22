/* Bounded terrain search. Generated geometry and earthworks remain feature-owned. */
window.LiftCoPistePlanner=(()=>{
 'use strict';
 const profiles={green:{angle:8,width:18},blue:{angle:16,width:15},red:{angle:25,width:12},black:{angle:42,width:10}};
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 class Heap{
  constructor(){this.items=[];}
  push(v){const a=this.items;let i=a.length;a.push(v);while(i){const p=(i-1)>>1;if(a[p].score<=v.score)break;a[i]=a[p];i=p;}a[i]=v;}
  pop(){const a=this.items,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let j=i*2+1;if(j+1<a.length&&a[j+1].score<a[j].score)j++;if(a[j].score>=last.score)break;a[i]=a[j];i=j;}a[i]=last;}return first;}
 }
 function search(start,end,options){
  const {height,blocked,angle,width=12,limit=1690}=options,step=12,grade=Math.tan(angle*Math.PI/180)*.86;
  const margin=Math.min(700,Math.max(180,distance(start,end)*.65)),x0=Math.max(-limit,Math.min(start.x,end.x)-margin),z0=Math.max(-limit,Math.min(start.z,end.z)-margin),nx=Math.ceil((Math.min(limit,Math.max(start.x,end.x)+margin)-x0)/step)+1,nz=Math.ceil((Math.min(limit,Math.max(start.z,end.z)+margin)-z0)/step)+1;
  const cell=p=>({i:Math.max(0,Math.min(nx-1,Math.round((p.x-x0)/step))),j:Math.max(0,Math.min(nz-1,Math.round((p.z-z0)/step)))}),a=cell(start),b=cell(end),key=(i,j)=>j*nx+i,origin=key(a.i,a.j),goal=key(b.i,b.j),heap=new Heap(),cost=new Map([[origin,0]]),parent=new Map(),cache=new Map();
  const point=(i,j)=>{const k=key(i,j);if(!cache.has(k)){const p={x:x0+i*step,z:z0+j*step};p.y=height(p.x,p.z);p.blocked=blocked(p);cache.set(k,p);}return cache.get(k);};
  heap.push({i:a.i,j:a.j,k:origin,g:0,score:0});let visits=0;
  const directions=[];for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++)if((Math.abs(i)===1||Math.abs(j)===1)&&Math.abs(i)+Math.abs(j)>0)directions.push([i,j]);
  while(heap.items.length&&visits++<90000){const at=heap.pop();if(at.g!==cost.get(at.k))continue;if(at.k===goal){const path=[end];for(let k=goal;k!==origin;k=parent.get(k))path.push(point(k%nx,Math.floor(k/nx)));path.push(start);return path.reverse().filter((p,i,list)=>!i||distance(p,list[i-1])>.1);}
   const p=point(at.i,at.j);for(const [di,dj]of directions){const i=at.i+di,j=at.j+dj;if(i<0||j<0||i>=nx||j>=nz)continue;const q=point(i,j),k=key(i,j);if(q.blocked&&k!==goal&&k!==origin)continue;
    const ds=distance(p,q),drop=p.y-q.y,excess=Math.max(0,drop/ds-grade),up=Math.max(0,-drop/ds);
    // Small local undulations can be graded, but sustained steep faces need a detour.
    if(drop/ds>grade+.003||up>.08)continue;
    let obstructed=false;for(let t=.2;t<1;t+=.2)if(blocked({x:p.x+(q.x-p.x)*t,z:p.z+(q.z-p.z)*t})){obstructed=true;break;}if(obstructed)continue;
    const nxSide=(q.z-p.z)/ds,nzSide=-(q.x-p.x)/ds,w=width/2,cross=Math.abs(height(q.x+nxSide*w,q.z+nzSide*w)-height(q.x-nxSide*w,q.z-nzSide*w))/(2*w);
    if(cross>Math.tan(25*Math.PI/180)+4/w)continue;
    let bend=0;const prev=parent.get(at.k);if(prev!==undefined){const r=point(prev%nx,Math.floor(prev/nx));bend=1-((p.x-r.x)*(q.x-p.x)+(p.z-r.z)*(q.z-p.z))/(distance(r,p)*ds||1);}
    const g=at.g+ds*(1+excess*35+up*50+bend*1.8+cross*cross*2);if(g>=(cost.get(k)??Infinity))continue;cost.set(k,g);parent.set(k,at.k);heap.push({i,j,k,g,score:g+distance(q,end)});
   }
  }return null;
 }
 function generate(T,feature,options){
  const plan=feature.autoPiste,profile=profiles[feature.sign]||profiles.blue,anchors=[plan.start,...plan.guides,plan.end];
  if(!plan.start||!plan.end)return{error:'Choose a departure and an arrival on the mountain.'};
  if(anchors.some(p=>Math.abs(p.x)>1690||Math.abs(p.z)>1690))return{error:'Keep both ends and passage points inside the build area.'};
  if(distance(plan.start,plan.end)<30)return{error:'Choose endpoints at least 30 m apart.'};
  if(feature.testTerrain){const curve=new T.CatmullRomCurve3(anchors.map(p=>new T.Vector3(p.x,0,p.z)),false,'centripetal'),points=curve.getSpacedPoints(Math.min(1800,Math.max(20,Math.ceil(curve.getLength()/4)))).map(p=>({x:p.x,z:p.z,height:options.height(p.x,p.z)}));return{points,layer:layer(feature,points,options),length:curve.getLength()};}
  if(options.height(plan.start.x,plan.start.z)<options.height(plan.end.x,plan.end.z)+2)return{error:'The departure must be higher than the arrival. Swap the ends or choose a lower arrival.'};
  const protectedAt=p=>options.blocked(p,feature.width/2+3),blocked=p=>{
   // A short snow approach on skis is allowed at connected stations only.
   if(plan.start.connection&&distance(p,plan.start)<65||plan.end.connection&&distance(p,plan.end)<65)return options.blocked(p,feature.width/2+3,true);
   return protectedAt(p);
  };
  let path=[];for(let i=1;i<anchors.length;i++){const part=search(anchors[i-1],anchors[i],{height:options.height,blocked,angle:profile.angle,width:feature.width});if(!part)return{error:'No moderate-earthworks route found for this difficulty. Move a passage point, move an endpoint, or try a harder run.'};path.push(...part.slice(i===1?0:1));}
  // Relax grid corners without changing mandatory passages or entering obstacles.
  for(let pass=0;pass<3;pass++){const next=path.map(p=>({...p}));for(let i=1;i<path.length-1;i++){if(anchors.some(a=>distance(a,path[i])<.1))continue;const p={x:(path[i-1].x+2*path[i].x+path[i+1].x)/4,z:(path[i-1].z+2*path[i].z+path[i+1].z)/4};if(!blocked(p))next[i]=p;}path=next;}
  const curve=new T.CatmullRomCurve3(path.map(p=>new T.Vector3(p.x,0,p.z)),false,'centripetal'),samples=curve.getSpacedPoints(Math.min(1800,Math.max(20,Math.ceil(curve.getLength()/4))));
  const maxCut=5,grade=Math.tan(profile.angle*Math.PI/180)*.86,low=[],high=[],levels=[],natural=samples.map(p=>options.height(p.x,p.z));
  // Feasible elevation intervals enforce downhill grading within five metres of the old ground.
  for(let i=0;i<samples.length;i++){if(blocked(samples[i]))return{error:'The smoothed corridor meets a building, road or lift foundation. Add a passage point to guide it around.'};low[i]=natural[i]-maxCut;high[i]=natural[i]+maxCut;if(i){const ds=distance(samples[i-1],samples[i]);low[i]=Math.max(low[i],low[i-1]-grade*ds);high[i]=Math.min(high[i],high[i-1]);}if(low[i]>high[i])return{error:'This route needs more than 5 m of cut or fill. Add a wider detour or choose a harder difficulty.'};}
  levels[samples.length-1]=Math.max(low.at(-1),Math.min(high.at(-1),natural.at(-1)));
  for(let i=samples.length-2;i>=0;i--){const lo=Math.max(low[i],levels[i+1]),hi=Math.min(high[i],levels[i+1]+grade*distance(samples[i],samples[i+1]));levels[i]=Math.max(lo,Math.min(hi,natural[i]));}
  const points=samples.map((p,i)=>({x:p.x,z:p.z,height:levels[i]}));
  return{points,layer:layer(feature,points,options),length:samples.reduce((n,p,i)=>n+(i?distance(p,samples[i-1]):0),0)};
 }
 function layer(feature,points,options){
  return{id:'earthworks:'+feature.id,owner:feature.id,type:'piste-corridor',width:feature.width,maxChange:5,protectedBoxes:options.boxes||[],points};
 }

 return{profiles,generate,layer};
})();
