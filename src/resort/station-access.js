/* Exterior station connections and pedestrian paths around terminal envelopes. */
window.LiftCoStationAccess=(()=>{
 'use strict';
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 function create(ctx){
  const T=ctx.THREE,height=ctx.height;
  function spec(d){return window.LiftCoLiftTypes.find(s=>s.id===d.type)||window.LiftCoLiftTypes[0];}
  function box(d,end){const ends=window.LiftCoNextAlignment.ends(d),boxes=window.LiftCoPlacement.terminalBoxes(d,spec(d),ctx.stationSettings(d));return boxes[ends.indexOf(end)];}
  function resolve(key){for(const d of ctx.definitions())for(const end of window.LiftCoNextAlignment.ends(d)){const hub=d.id+':'+end;if(key===hub||key===hub+':left'||key===hub+':right')return{definition:d,end,hub,side:key===hub?null:key.slice(hub.length+1)};}return null;}
  function local(b,p){const dx=p.x-b.x,dz=p.z-b.z;return{x:dx*b.across.x+dz*b.across.z,z:dx*b.along.x+dz*b.along.z};}
  function world(b,p){const x=b.x+b.across.x*p.x+b.along.x*p.z,z=b.z+b.across.z*p.x+b.along.z*p.z;return{x,z,y:height(x,z)};}
  function ports(d,end){const b=box(d,end);if(!b)return[];return['left','right'].map((side,i)=>({...world(b,{x:(i?1:-1)*(b.halfWidth+12),z:0}),id:d.id+':'+end+':'+side,side,stationKey:d.id+':'+end}));}
  // Test the open rectangle interior. Walking along its boundary is permitted.
  function crosses(a,b,w,l){if(w<=0||l<=0)return false;let lo=0,hi=1;for(const [av,bv,min,max]of [[a.x,b.x,-w+1e-5,w-1e-5],[a.z,b.z,-l+1e-5,l-1e-5]]){const delta=bv-av;if(Math.abs(delta)<1e-8){if(av<=min||av>=max)return false;continue;}let p=(min-av)/delta,q=(max-av)/delta;if(p>q)[p,q]=[q,p];lo=Math.max(lo,p);hi=Math.min(hi,q);if(lo>=hi)return false;}return hi>1e-5&&lo<1-1e-5;}
  function route(d,end,start,finish){
   const bounds=box(d,end);if(!bounds)return[start,finish];const a=local(bounds,start),b=local(bounds,finish),w=bounds.halfWidth+1.6,l=bounds.halfLength+1.6,kind=spec(d),enclosed=end!=='mid'&&d.stationStyle==='princesse',core=kind.reversible?0:(kind.railX||ctx.stationSettings(d).railX||3.1)+.4;
   // Native boarding platforms are walkable along one lane. Crossing lanes uses the exterior.
   if(!enclosed&&((a.x*b.x>0&&Math.min(Math.abs(a.x),Math.abs(b.x))>core)||kind.reversible&&Math.abs(a.x)<3.6&&Math.abs(b.x)<3.6)&&!crosses(a,b,core,bounds.halfLength))return[start,finish];
   function lead(p,toward){const out=[p];if(Math.abs(p.x)>=w||Math.abs(p.z)>=l)return out;
    if(enclosed){const frames=window.LiftCoNextAlignment.stationFrames(d),f=frames.find(f=>f.end===end),rear=f?local(bounds,{x:f.x-Math.sin(f.yaw)*6,z:f.z-Math.cos(f.yaw)*6}).z:-l;const side=Math.sign(p.x)||Math.sign(toward.x)||1;out.push({x:side*Math.max(Math.abs(p.x),6.5),z:rear},{x:side*6.5,z:(Math.sign(rear)||-1)*l});}
    else if(Math.abs(p.x)<.8||kind.reversible&&Math.abs(p.x)<(kind.railX||5)+.5){out.push({x:p.x,z:Math.abs(p.z-l)<Math.abs(p.z+l)?l:-l});}
    else out.push({x:(Math.sign(p.x)||1)*w,z:p.z});return out;
   }
   const from=lead(a,b),to=lead(b,a),first=from.at(-1),last=to.at(-1),nodes=[first,last,{x:-w,z:-l},{x:w,z:-l},{x:w,z:l},{x:-w,z:l}],cost=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),remaining=new Set(nodes.map((_,i)=>i));cost[0]=0;
   while(remaining.size){let at=-1,best=Infinity;for(const i of remaining)if(cost[i]<best){best=cost[i];at=i;}if(at<0||at===1)break;remaining.delete(at);for(const i of remaining){if(crosses(nodes[at],nodes[i],w,l))continue;const next=best+distance(nodes[at],nodes[i]);if(next<cost[i]){cost[i]=next;prev[i]=at;}}}
   if(!Number.isFinite(cost[1]))return null;const middle=[];for(let at=1;at!==0;at=prev[at]){if(at<0)return null;middle.unshift(nodes[at]);}
   return[...from,...middle,...to.slice(0,-1).reverse()].map(p=>world(bounds,p)).filter((p,i,list)=>!i||distance(p,list[i-1])>.02);
  }
  function path(d,end,start,finish,id='station-walk'){const points=route(d,end,start,finish);if(!points)return null;const samples=[],distances=[0];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],steps=Math.max(1,Math.ceil(distance(a,b)));if(i===1)samples.push(new T.Vector3(a.x,height(a.x,a.z),a.z));for(let j=1;j<=steps;j++){const t=j/steps,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;samples.push(new T.Vector3(x,height(x,z),z));distances.push(distances.at(-1)+distance(samples.at(-2),samples.at(-1)));}}return{samples,distances,points,width:3,length:distances.at(-1),id,stationKey:d.id+':'+end};}
  function compilePath(r){
   if(!r)return r;let samples=r.samples;
   for(const end of [0,1]){const station=resolve(r.connections?.[end]);if(!station)continue;const bounds=box(station.definition,station.end),origin=end?samples.length-1:0,direction=end?-1:1;let cut=-1,travelled=0;
    for(let i=origin;i>=0&&i<samples.length;i+=direction){if(i!==origin)travelled+=distance(samples[i],samples[i-direction]);if(travelled>120)break;const p=local(bounds,samples[i]);if(Math.abs(p.x)<bounds.halfWidth+2&&Math.abs(p.z)<bounds.halfLength+2)cut=i;}
    if(cut<0)continue;cut=Math.max(0,Math.min(samples.length-1,cut+direction));const around=path(station.definition,station.end,end?samples[cut]:samples[0],end?samples.at(-1):samples[cut],r.id);if(!around?.samples.length)continue;samples=end?[...samples.slice(0,cut),...around.samples]:[...around.samples,...samples.slice(cut+1)];
   }
   const distances=[0];for(let i=1;i<samples.length;i++)distances.push(distances.at(-1)+distance(samples[i-1],samples[i]));return{...r,samples,distances,length:distances.at(-1)};
  }
  return{box,ports,resolve,canonical:key=>resolve(key)?.hub||key,route,path,crosses,compilePath};
 }
 return{create};
})();
