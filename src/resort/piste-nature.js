/* Deterministic, feature-owned planting. Models are borrowed from the existing forest. */
window.LiftCoPisteNature=(()=>{
 'use strict';
 function random(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h=(h+0x6D2B79F5)|0;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
 function settings(f){return{density:'natural',seed:0,groves:[],...f.nature};}
 function placements(routes,{height,blocked=()=>false,existing=[],corridors=routes,budget=900}){
  const index=window.LiftCoPisteSurface.index(corridors,10),occupied=new Map(),trees=[],rocks=[],cell=8;
  function store(p){const key=Math.floor(p.x/cell)+','+Math.floor(p.z/cell);if(!occupied.has(key))occupied.set(key,[]);occupied.get(key).push(p);}
  for(const p of existing)store(p);
  function crowded(p,radius){const x=Math.floor(p.x/cell),z=Math.floor(p.z/cell);for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if((occupied.get((x+i)+','+(z+j))||[]).some(q=>Math.hypot(q.x-p.x,q.z-p.z)<radius))return true;return false;}
  for(const r of [...routes].sort((a,b)=>a.id.localeCompare(b.id))){const config=settings(r),rng=random(r.id+':'+config.seed),startTrees=trees.length,startRocks=rocks.length;
   function place(x,z,type){if(trees.length>=budget&&type==='tree'||rocks.length>=400&&type==='rock')return;if(Math.abs(x)>1680||Math.abs(z)>1680)return;const y=height(x,z),slope=Math.hypot(height(x+1,z)-height(x-1,z),height(x,z+1)-height(x,z-1))/2,size=type==='tree'?5+rng()*6:.5+rng()*1.5,canopy=type==='tree'?size*.22:size,near=index.nearest(x,z);
    if(near&&near.edge<canopy+3||blocked({x,z,y,height:size,radius:canopy})||slope>(type==='tree'?.8:1.15)||crowded({x,z},canopy+2))return;
    if(type==='tree'&&(y>920||rng()<Math.max(0,(y-650)/300)))return;
    const p={x,z,y,height:size,width:.8+rng()*.3,angle:rng()*Math.PI*2,variant:Math.floor(rng()*6),owner:r.id};(type==='tree'?trees:rocks).push(p);store(p);
   }
   if(config.density!=='none'){
    const spacing=config.density==='woodland'?12:config.density==='sparse'?42:24;
    for(let d=22;d<r.length-22;d+=spacing*(.7+rng()*.7)){
     let i=1;while(i<r.distances.length-1&&r.distances[i]<d)i++;const a=r.samples[i-1],b=r.samples[i],t=(d-r.distances[i-1])/(r.distances[i]-r.distances[i-1]||1),x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,ds=Math.hypot(b.x-a.x,b.z-a.z)||1,nx=(b.z-a.z)/ds,nz=-(b.x-a.x)/ds;
     // Islands and open gaps, rather than a regularly spaced avenue.
     if(rng()<.22)continue;const side=rng()<.5?-1:1,cluster=1+Math.floor(rng()*4);
     for(let k=0;k<cluster;k++){const offset=r.width/2+8+rng()*25,jitter=(rng()-.5)*18;place(x+nx*offset*side+(b.x-a.x)/ds*jitter,z+nz*offset*side+(b.z-a.z)/ds*jitter,rng()<.14?'rock':'tree');}
     if(trees.length-startTrees>=240||rocks.length-startRocks>=90)break;
    }
   }
   for(const grove of config.groves||[]){for(let k=0;k<(grove.type==='rocks'?7:12);k++){const angle=rng()*Math.PI*2,radius=Math.sqrt(rng())*14;place(grove.x+Math.cos(angle)*radius,grove.z+Math.sin(angle)*radius,grove.type==='rocks'?'rock':'tree');}}
  }return{trees,rocks};
 }
 function create({THREE:T,scene,prototypes=[],height,existing=[]}){
  const root=new T.Group();root.name='Piste nature';scene.add(root);let last='',quality=-1,current={trees:[],rocks:[]};
  const rockGeometry=new T.IcosahedronGeometry(1,1),rockMaterial=new T.MeshStandardMaterial({color:0x848c85,roughness:1,flatShading:true}),snowGeometry=new T.IcosahedronGeometry(1,1),snowMaterial=new T.MeshStandardMaterial({color:0xe9ece3,roughness:1}),dummy=new T.Object3D();
  function clear(){for(const mesh of [...root.children]){root.remove(mesh);mesh.dispose?.();}}
  function mesh(geometry,material,list,kind){if(!list.length)return;const m=new T.InstancedMesh(geometry,material,list.length);m.name='Piste '+kind;m.userData.scenery=kind==='trees'?'vegetation':'rocks';
   list.forEach((p,i)=>{dummy.position.set(p.x,p.y-(kind==='trees'?.08:0),p.z);dummy.rotation.set(0,p.angle,0);dummy.scale.set(p.height*p.width,p.height,p.height*p.width);if(kind==='rocks'){dummy.position.y+=p.height*.12;dummy.scale.y*=.6;}if(kind==='snowcaps'){dummy.position.y+=p.height*.45;dummy.scale.y*=.18;dummy.scale.x*=.88;dummy.scale.z*=.88;}dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});m.userData.rawMatrices=list.map((_,i)=>{const matrix=new T.Matrix4();m.getMatrixAt(i,matrix);return matrix;});m.receiveShadow=true;m.castShadow=false;m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere();root.add(m);
  }
  function applyQuality(){const value=window.LiftCoGraphics?.settings?.vegetation??100;if(value===quality)return;quality=value;for(const mesh of root.children.filter(m=>m.userData.scenery==='vegetation')){let count=0;for(const matrix of mesh.userData.rawMatrices){const e=matrix.elements,v=Math.sin(e[12]*12.9898+e[14]*78.233)*43758.5453;if(v-Math.floor(v)<quality/100)mesh.setMatrixAt(count++,matrix);}mesh.count=count;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}}
  return{quality:applyQuality,sync(routes,options){const signature=JSON.stringify([routes.map(r=>[r.id,r.nature,r.points]),options.signature]);if(signature===last)return;last=signature;current=placements(routes,{height,existing,...options});clear();for(let i=0;i<prototypes.length;i++)mesh(prototypes[i].geometry,prototypes[i].material,current.trees.filter(p=>p.variant%prototypes.length===i),'trees');mesh(rockGeometry,rockMaterial,current.rocks,'rocks');mesh(snowGeometry,snowMaterial,current.rocks,'snowcaps');quality=-1;applyQuality();},stats:()=>({trees:current.trees.length,rocks:current.rocks.length,drawCalls:root.children.length}),dispose(){clear();root.removeFromParent();rockGeometry.dispose();rockMaterial.dispose();snowGeometry.dispose();snowMaterial.dispose();}};
 }
 return{settings,placements,create};
})();
