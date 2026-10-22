/* Grooming lives on the terrain itself. There is no second snow sheet to intersect. */
window.LiftCoPisteSurface=(()=>{
 'use strict';
 function index(routes,padding=8){
  const cells=new Map(),step=40,key=(i,j)=>i+','+j;
  for(const r of routes)for(let i=1;i<r.samples.length;i++){
   const a=r.samples[i-1],b=r.samples[i],dx=b.x-a.x,dz=b.z-a.z,ds2=dx*dx+dz*dz;if(ds2<1e-8)continue;
   const u=(i-.5)/(r.samples.length-1),v=u*(r.points?.length-1||0),at=Math.min((r.points?.length||2)-2,Math.floor(v)),t=v-at,w=r.points?.length>1?((r.points[at].width||r.width)*(1-t)+(r.points[at+1].width||r.width)*t)/2:r.width/2;
   const segment={a,b,dx,dz,ds2,width:w,route:r},radius=w+padding;
   for(let z=Math.floor((Math.min(a.z,b.z)-radius)/step);z<=Math.floor((Math.max(a.z,b.z)+radius)/step);z++)for(let x=Math.floor((Math.min(a.x,b.x)-radius)/step);x<=Math.floor((Math.max(a.x,b.x)+radius)/step);x++){const k=key(x,z);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(segment);}
  }
  function nearest(x,z){let best=null;for(const s of cells.get(key(Math.floor(x/step),Math.floor(z/step)))||[]){const t=Math.max(0,Math.min(1,((x-s.a.x)*s.dx+(z-s.a.z)*s.dz)/s.ds2)),px=x-s.a.x-t*s.dx,pz=z-s.a.z-t*s.dz,distance=Math.hypot(px,pz),edge=distance-s.width;if(!best||edge<best.edge)best={...s,distance,edge,across:(px*s.dz-pz*s.dx)/Math.sqrt(s.ds2)};}return best;}
  return{nearest,sample(x,z){const p=nearest(x,z);if(!p)return{weight:0,across:0};const feather=3.5+Math.sin(x*.13+z*.09)*.5,t=Math.max(0,Math.min(1,(p.distance-(p.width-feather))/(feather*2)));return{weight:1-t*t*(3-2*t),across:p.across};}};
 }
 function material(m){
  if(m.userData.pisteGrooming)return;m.userData.pisteGrooming=true;
  const prior=m.onBeforeCompile;
  m.onBeforeCompile=(shader,renderer)=>{prior?.call(m,shader,renderer);
   shader.vertexShader='attribute vec2 pisteGroom;\nvarying vec2 vPisteGroom;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPisteGroom=pisteGroom;');
   shader.fragmentShader='varying vec2 vPisteGroom;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
float groom=smoothstep(0.0,1.0,vPisteGroom.x);
float groomPhase=vPisteGroom.y*25.0;
float groomDetail=1.0-smoothstep(0.35,1.5,fwidth(groomPhase));
// Fine corduroy fades with distance; packed snow keeps the surrounding snow colour.
diffuseColor.rgb*=1.0+groom*(-0.012+sin(groomPhase)*0.009*groomDetail);`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.88,smoothstep(0.0,1.0,vPisteGroom.x));');
   shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(mix(normal,nonPerturbedNormal,smoothstep(0.0,1.0,vPisteGroom.x)*0.55));');
  };
  m.customProgramCacheKey=()=> 'liftco-terrain-grooming-1';m.needsUpdate=true;
 }
 return{index,material};
})();
