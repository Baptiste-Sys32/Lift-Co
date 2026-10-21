// Dedicated two-span layouts. Distances are measured along the horizontal carrier
// centreline, including the supported transfer curve, never the base/top chord.
window.LiftCoNextAlignment=(()=>{
 const special=d=>['chair-panoramabahn','gondola-princesse8'].includes(d.type);
 const isNext=d=>['chair-arcabulle','chair-alps5','chair-panoramabahn','gondola-princesse8'].includes(d.type);
 const ends=d=>d.type==='gondola-princesse8'?['base','mid','top']:['base','top'];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const cache=new WeakMap();
 function make(d){
  const cached=cache.get(d);if(cached&&cached.type===d.type&&cached.a0===d.base?.[0]&&cached.a1===d.base?.[1]&&cached.b0===d.top?.[0]&&cached.b1===d.top?.[1]&&cached.m0===d.mid?.[0]&&cached.m1===d.mid?.[1])return cached.value;
  const a=d.base,b=d.top,m=special(d)&&d.mid;
  if(!a||!b)return null;
  const unit=(a,b)=>{const n=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return{x:(b[0]-a[0])/n,z:(b[1]-a[1])/n,length:n};};
  const u=unit(a,m||b),v=m?unit(m,b):u,half=d.type==='chair-panoramabahn'?10:14,corner=half/2;
  const angle=Math.atan2(u.z*v.x-u.x*v.z,u.x*v.x+u.z*v.z),yaw=Math.atan2(u.x,u.z);
  const samples=[],append=(x,z)=>{const prev=samples.at(-1);samples.push({x,z,d:prev?prev.d+Math.hypot(x-prev.x,z-prev.z):0});};
  append(...a);let midStart=null,midEnd=null;
  if(m){
   append(m[0]-u.x*half,m[1]-u.z*half);midStart=samples.at(-1).d;
   append(m[0]-u.x*corner,m[1]-u.z*corner);
   for(let i=1;i<=100;i++){const t=i/100;append(m[0]-(1-t)**2*u.x*corner+t*t*v.x*corner,m[1]-(1-t)**2*u.z*corner+t*t*v.z*corner);}
   append(m[0]+v.x*half,m[1]+v.z*half);midEnd=samples.at(-1).d;
  }
  append(...b);const length=samples.at(-1).d;
  function at(s,side=0){let p,t;
   if(s<=0){p={x:a[0]+u.x*s,z:a[1]+u.z*s};t=u;}
   else if(s>=length){p={x:b[0]+v.x*(s-length),z:b[1]+v.z*(s-length)};t=v;}
   else{let lo=0,hi=samples.length-1;while(hi-lo>1){const j=(lo+hi)>>1;if(samples[j].d<=s)lo=j;else hi=j;}const q=samples[lo],r=samples[hi],f=(s-q.d)/(r.d-q.d||1);p={x:q.x+(r.x-q.x)*f,z:q.z+(r.z-q.z)*f};t=unit([q.x,q.z],[r.x,r.z]);}
   return{x:p.x-t.z*side,z:p.z+t.x*side,dx:t.x,dz:t.z};
  }
  function project(x,z){let best=null;for(let i=1;i<samples.length;i++){const p=samples[i-1],q=samples[i],dx=q.x-p.x,dz=q.z-p.z,n=Math.hypot(dx,dz),f=clamp(((x-p.x)*dx+(z-p.z)*dz)/(n*n||1),0,1),px=p.x+f*dx,pz=p.z+f*dz,dist=Math.hypot(x-px,z-pz);if(!best||dist<best.error)best={distance:p.d+f*n,lateral:(-(x-px)*dz+(z-pz)*dx)/(n||1),error:dist,length};}return best;}
  const value={length,at,project,angle,yaw,u,v,half,midStart,midEnd,midDistance:m?(midStart+midEnd)/2:null,samples};cache.set(d,{type:d.type,a0:a[0],a1:a[1],b0:b[0],b1:b[1],m0:d.mid?.[0],m1:d.mid?.[1],value});return value;
 }
 function ensureMid(d){if(special(d)&&d.base&&d.top&&!d.mid){const u={x:d.top[0]-d.base[0],z:d.top[1]-d.base[1]},n=Math.hypot(u.x,u.z)||1,offset=n*Math.tan((d.type==='chair-panoramabahn'?35:15)*Math.PI/360)/2;d.mid=[(d.base[0]+d.top[0])/2-u.z/n*offset,(d.base[1]+d.top[1])/2+u.x/n*offset];}}
 function stationFrames(d){const p=make(d);if(!p)return[];if(p.frames)return p.frames;const result=[{end:'base',x:d.base[0],z:d.base[1],yaw:Math.atan2(-p.u.x,-p.u.z),length:d.type==='chair-alps5'?0:26}];if(special(d)&&d.mid)result.push({end:'mid',x:d.mid[0],z:d.mid[1],yaw:p.yaw,length:0});result.push({end:'top',x:d.top[0],z:d.top[1],yaw:Math.atan2(p.v.x,p.v.z),length:d.type==='chair-alps5'?0:26});p.frames=result;return result;}
 function footprint(d,frame,width=8){const p=make(d),out=[];if(frame.end==='mid'){for(let i=0;i<=12;i++)for(const side of [-width,0,width])out.push(p.at(p.midStart+(p.midEnd-p.midStart)*i/12,side));}else{const a=d.stationStyle==='princesse'?-4:d.type==='chair-alps5'?-6:0,b=d.stationStyle==='princesse'?34:d.type==='chair-alps5'?18:30;for(let i=0;i<=6;i++)for(const x of [-width,0,width]){const z=a+(b-a)*i/6;out.push({x:frame.x+Math.cos(frame.yaw)*x+Math.sin(frame.yaw)*z,z:frame.z-Math.sin(frame.yaw)*x+Math.cos(frame.yaw)*z});}}return out;}
 return{special,isNext,ends,make,ensureMid,stationFrames,footprint};
})();
