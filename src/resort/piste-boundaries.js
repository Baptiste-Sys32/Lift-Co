/* Boundary ownership belongs to the outside of the combined ski corridor. */
window.LiftCoPisteBoundaries=(()=>{
 'use strict';
 function index(routes){
  const cells=new Map(),size=40;
  const width=(r,u)=>{const p=r.points,v=u*(p.length-1),i=Math.min(p.length-2,Math.floor(v)),t=v-i;return((p[i].width||r.width)*(1-t)+(p[i+1].width||r.width)*t)/2;};
  routes.forEach((r,order)=>{for(let i=1;i<r.samples.length;i++){const a=r.samples[i-1],b=r.samples[i],dx=b.x-a.x,dz=b.z-a.z,ds2=dx*dx+dz*dz;if(ds2<1e-8)continue;const wa=width(r,(i-1)/(r.samples.length-1)),wb=width(r,i/(r.samples.length-1)),w=Math.max(wa,wb)+1,segment={id:r.id,order,a,dx,dz,ds2,wa,wb};for(let x=Math.floor((Math.min(a.x,b.x)-w)/size);x<=Math.floor((Math.max(a.x,b.x)+w)/size);x++)for(let z=Math.floor((Math.min(a.z,b.z)-w)/size);z<=Math.floor((Math.max(a.z,b.z)+w)/size);z++){const key=x+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(segment);}}});
  const orders=new Map(routes.map((r,i)=>[r.id,i]));
  return{visible(id,x,z){for(const s of cells.get(Math.floor(x/size)+','+Math.floor(z/size))||[]){if(s.id===id)continue;const t=Math.max(0,Math.min(1,((x-s.a.x)*s.dx+(z-s.a.z)*s.dz)/s.ds2)),edge=Math.hypot(x-s.a.x-t*s.dx,z-s.a.z-t*s.dz)-(s.wa+(s.wb-s.wa)*t);if(edge<-.35||edge<=.35&&s.order<orders.get(id))return false;}return true;}};
 }
 return{index};
})();
