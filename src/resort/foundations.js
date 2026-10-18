/* Visual spread footings. Dimensions are a game rule, not a structural design. */
window.LiftCoFoundations={
 width(height,base=1.65){return Math.max(base,Math.min(6,base+Math.max(0,height-28)*.085));},
 create(T,{parent,x=0,z=0,top,width=1.65,depth=width,groundAt,material,embed=.8}){
  const ring=[],steps=Math.max(4,Math.ceil(Math.max(width,depth)/.5));
  for(let edge=0;edge<4;edge++)for(let i=0;i<steps;i++){const t=i/steps;ring.push(edge===0?[x-width/2+width*t,z-depth/2]:edge===1?[x+width/2,z-depth/2+depth*t]:edge===2?[x+width/2-width*t,z+depth/2]:[x-width/2,z+depth/2-depth*t]);}
  const bottom=ring.map(([px,pz])=>Math.min(top-.4,groundAt(px,pz)-embed)),p=[x,top,z,x,Math.min(...bottom),z],idx=[],N=ring.length;
  ring.forEach(([px,pz],i)=>p.push(px,top,pz,px,bottom[i],pz));
  for(let i=0;i<N;i++){const j=(i+1)%N,a=2+i*2,b=2+j*2;idx.push(0,b,a,1,a+1,b+1,a,b,a+1,b,b+1,a+1);}
  let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);const flat=g.toNonIndexed();g.dispose();g=flat;g.computeVertexNormals();g.computeBoundingSphere();const mesh=new T.Mesh(g,material);mesh.castShadow=mesh.receiveShadow=true;mesh.userData.foundation=true;mesh.userData.contact={top,width,depth,minimumBottom:Math.min(...bottom),maximumBottom:Math.max(...bottom)};parent.add(mesh);return mesh;
 },
 // Adapts already-approved multi-leg / train geometry before it is batched.
 replaceBox(T,mesh,groundAt){const p=mesh.geometry.parameters;if(!p?.width||!p?.height||!p?.depth)return;const parent=mesh.parent,x=mesh.position.x,z=mesh.position.z,top=mesh.position.y+p.height/2;const replacement=this.create(T,{parent,x,z,top,width:p.width,depth:p.depth,groundAt,material:mesh.material});mesh.removeFromParent();mesh.geometry.dispose();return replacement;}
};
