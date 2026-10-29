/* Circular pedestrian bends and exact corridor clearance around oriented boxes. */
window.LiftCoWalkCurves=(()=>{
 'use strict';
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function clean(points){return points.filter((p,i)=>Number.isFinite(p.x)&&Number.isFinite(p.z)&&(!i||distance(p,points[i-1])>.01)).map(p=>({...p}));}
 function boxDistance(a,b,box){
  const local=p=>{const x=p.x-box.x,z=p.z-box.z;return{x:x*box.across.x+z*box.across.z,z:x*box.along.x+z*box.along.z};},p=local(a),q=local(b),w=box.halfWidth,l=box.halfLength,dx=q.x-p.x,dz=q.z-p.z,ds=dx*dx+dz*dz;
  let lo=0,hi=1;for(const [start,delta,half]of [[p.x,dx,w],[p.z,dz,l]]){if(Math.abs(delta)<1e-9){if(Math.abs(start)>half){lo=2;break;}}else{let t0=(-half-start)/delta,t1=(half-start)/delta;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);}}
  if(lo<=hi)return 0;
  let best=Math.min(...[p,q].map(v=>Math.hypot(Math.max(0,Math.abs(v.x)-w),Math.max(0,Math.abs(v.z)-l))));
  for(const x of [-w,w])for(const z of [-l,l]){const t=clamp(((x-p.x)*dx+(z-p.z)*dz)/(ds||1),0,1);best=Math.min(best,Math.hypot(x-p.x-t*dx,z-p.z-t*dz));}return best;
 }
 function clear(a,b,boxes,padding){return boxes.every(box=>boxDistance(a,b,box)>=padding-1e-5);}
 function round(input,{radius=6,valid=()=>true}={}){
  const points=clean(input);if(points.length<3)return points;const out=[points[0]];
  for(let i=1;i<points.length-1;i++){
   const a=points[i-1],p=points[i],b=points[i+1],la=distance(a,p),lb=distance(p,b),ux=(p.x-a.x)/la,uz=(p.z-a.z)/la,vx=(b.x-p.x)/lb,vz=(b.z-p.z)/lb,turn=Math.atan2(ux*vz-uz*vx,ux*vx+uz*vz),angle=Math.abs(turn);
   if(angle<.015||angle>Math.PI-.08){out.push(p);continue;}
   const tangent=Math.tan(angle/2),max=Math.min(radius,la*.44/tangent,lb*.44/tangent);let accepted=null;
   for(let r=max;r>=.15;r*=.78){const trim=r*tangent,start={x:p.x-ux*trim,z:p.z-uz*trim},finish={x:p.x+vx*trim,z:p.z+vz*trim},sign=Math.sign(turn),cx=start.x-uz*sign*r,cz=start.z+ux*sign*r,first=Math.atan2(start.z-cz,start.x-cx),steps=Math.max(3,Math.ceil(angle*r/.45)),curve=[start];for(let j=1;j<steps;j++){const at=first+turn*j/steps;curve.push({x:cx+Math.cos(at)*r,z:cz+Math.sin(at)*r});}curve.push(finish);const candidate=[out.at(-1),...curve,b];if(candidate.every((q,j)=>!j||valid(candidate[j-1],q))){accepted=curve;break;}}
   out.push(...(accepted||[p]));
  }
  out.push(points.at(-1));return clean(out);
 }
 function sample(T,points,height,step=.65){const samples=[],distances=[0];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.max(1,Math.ceil(distance(a,b)/step));if(!samples.length)samples.push(new T.Vector3(a.x,height(a.x,a.z),a.z));for(let j=1;j<=n;j++){const t=j/n,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,p=new T.Vector3(x,height(x,z),z);if(distance(samples.at(-1),p)<1e-6)continue;distances.push(distances.at(-1)+distance(samples.at(-1),p));samples.push(p);}}return{samples,distances,length:distances.at(-1)};}
 return{round,sample,clear,boxDistance};
})();
