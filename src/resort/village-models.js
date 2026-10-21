/* Alpine architecture. Appearance stays independent of beds and access nodes. */
window.LiftCoVillageModels=(()=>{
 function building(T,b,height,preview=false){
  const V=window.LiftCoVillage,t=V.spec(b),root=new T.Group(),floor=b.floor??height(b.x,b.z);
  root.name=t.name;root.position.set(b.x,floor,b.z);root.rotation.y=b.yaw||0;
  const cube=new T.BoxGeometry(1,1,1),palette={stone:0xa69e8b,plaster:0xeee4cf,timber:0x82634b,beam:0x574537,roof:0x59656a,snow:0xf5f2e8,glass:0x527b7b,trim:0xd3bf95,metal:0x384f4e,green:0x566c4d,light:0xf7d895};
  const mats=Object.fromEntries(Object.entries(palette).map(([k,color])=>[k,new T.MeshStandardMaterial({color,roughness:k==='glass'?.32:.86,metalness:k==='glass'?.12:0,...(k==='light'?{emissive:color,emissiveIntensity:.4}:{})})]));
  function box(w,h,d,x,y,z,mat='timber',rx=0,ry=0){const mesh=new T.Mesh(cube,mats[mat]);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.rotation.set(rx,ry,0);root.add(mesh);return mesh;}
  function roof(w,d,x,y,z,rise){
   // A true pitched roof with two snow-covered eaves and closed gables.
   const half=w/2+.65,angle=Math.atan2(rise,half),slope=Math.hypot(half,rise);
   for(const sign of [-1,1]){const side=box(slope,.24,d+1.6,x+sign*half/2,y+rise/2,z,'roof');side.rotation.z=-sign*angle;const snow=box(slope+.08,.17,d+1.72,x+sign*half/2,y+rise/2+.2,z,'snow');snow.rotation.z=-sign*angle;}
   const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,rise);shape.lineTo(w/2,0);shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:false});
   for(const sign of [-1,1]){const face=new T.Mesh(g,mats.timber);face.position.set(x,y,z+sign*d/2-.09);root.add(face);}
   box(w+.7,.25,.25,x,y,z+d/2+.4,'beam');
  }
  function window(x,y,z,w=1.25,h=1.45,side=1){
   box(w+.25,h+.25,.13,x,y,z,'beam');box(w,h,.16,x,y,z+side*.07,'glass');
   box(.065,h,.05,x,y,z+side*.18,'trim');box(w,.065,.05,x,y,z+side*.18,'trim');box(w+.4,.13,.36,x,y-h/2-.1,z,'snow');
  }
  function balcony(x,y,z,w){
   box(w,.22,1.55,x,y,z+.55,'beam');box(w,.12,.13,x,y+1.05,z+1.3,'trim');
   for(let a=-w/2;a<=w/2+.01;a+=.5)box(.07,.95,.07,x+a,y+.52,z+1.3,'timber');
   for(const side of [-1,1])box(.12,1.1,1.4,x+side*w/2,y+.5,z+.55,'beam');
   box(w*.5,.35,.35,x,y+.15,z+1.38,'timber');box(w*.48,.22,.3,x,y+.42,z+1.38,'green');
  }
  const chalet=b.type==='chalet',hotel=b.type==='hotel',eave=t.height-(chalet?1.5:hotel?2.4:2),floors=chalet?2:hotel?4:3;
  box(t.width,.8,t.depth,0,.3,0,'stone');box(t.width,eave-.6,t.depth,0,(eave+.6)/2,0,'plaster');
  box(t.width+.1,eave*.47,t.depth+.1,0,eave*.765,0,'timber');
  // Stone joints, timber courses and expressed corner posts.
  for(let y=.35;y<1.2;y+=.38)box(t.width+.12,.035,t.depth+.12,0,y,0,'beam');
  for(let y=eave*.54;y<eave;y+=.48)box(t.width+.16,.045,t.depth+.16,0,y,0,'beam');
  for(const x of [-t.width/2+.2,t.width/2-.2])for(const z of [-t.depth/2-.02,t.depth/2+.02])box(.26,eave,.24,x,eave/2,z,'beam');
  roof(t.width,t.depth,0,eave,0,chalet?2:hotel?2.7:2.4);
  const bays=chalet?2:hotel?6:4,pitch=t.width/(bays+1);
  for(let level=0;level<floors;level++){const y=1.65+level*(eave-2.1)/Math.max(1,floors-1);for(let i=1;i<=bays;i++){const x=-t.width/2+i*pitch;for(const side of [-1,1])if(!(level===0&&Math.abs(x)<2.2))window(x,y,side*(t.depth/2+.09),chalet?1.25:1.4,1.4,side);}if(level>0)balcony(0,y-.95,t.depth/2+.15,t.width-1.4);}
  // Entrance canopy, glazed timber doors and a connected terrace.
  box(1.8,2.35,.25,0,1.2,t.depth/2+.12,'beam');window(0,1.35,t.depth/2+.27,1.2,1.75);
  box(4.4,.18,2.5,0,2.7,t.depth/2+1,'roof');box(4.55,.16,2.65,0,2.88,t.depth/2+1,'snow');
  for(const x of [-1.9,1.9])box(.14,2.7,.14,x,1.35,t.depth/2+1.9,'beam');
  box(5.2,.22,5,0,-.04,t.depth/2+2.5,'stone');
  for(const x of [-2.1,2.1]){box(.65,.75,.65,x,.38,t.depth/2+3.8,'timber');box(.6,.5,.6,x,1,t.depth/2+3.8,'green');box(.75,.12,.75,x,1.3,t.depth/2+3.8,'snow');}
  box(.85,1.7,.85,t.width*.27,eave+1.2,-t.depth*.2,'stone');box(1.1,.16,1.1,t.width*.27,eave+2.1,-t.depth*.2,'metal');box(1.15,.12,1.15,t.width*.27,eave+2.25,-t.depth*.2,'snow');
  if(hotel){box(6.2,.65,.2,0,3.5,t.depth/2+.4,'metal');for(let x=-2.4;x<=2.4;x+=1.2)box(.35,.35,.12,x,3.5,t.depth/2+.56,'light');}
  for(const x of [-1,1])for(const z of [-1,1]){const p=V.world(b,x*(t.width/2-.45),z*(t.depth/2-.45)),h=Math.max(.4,floor-height(p.x,p.z));box(.85,h+.4,.85,x*(t.width/2-.45),-h/2+.1,z*(t.depth/2-.45),'stone');}
  // A handful of material batches replaces hundreds of independent boxes.
  root.updateMatrixWorld(true);for(const mat of Object.values(mats)){const pieces=root.children.filter(o=>o.geometry===cube&&o.material===mat);if(!pieces.length)continue;const batch=new T.InstancedMesh(cube,mat,pieces.length);for(let i=0;i<pieces.length;i++){pieces[i].updateMatrix();batch.setMatrixAt(i,pieces[i].matrix);root.remove(pieces[i]);}batch.castShadow=batch.receiveShadow=true;batch.frustumCulled=false;root.add(batch);}
  root.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});
  return root;
 }
 function stop(T,info,name){
  const root=new T.Group(),geometry=new T.BoxGeometry(),materials={stone:new T.MeshStandardMaterial({color:0xa9a28f,roughness:1}),wood:new T.MeshStandardMaterial({color:0x705540}),metal:new T.MeshStandardMaterial({color:0x375e59}),snow:new T.MeshStandardMaterial({color:0xf5f1e7}),glass:new T.MeshStandardMaterial({color:0x90aaa5,transparent:true,opacity:.5})};
  root.position.set(info.board.x,info.y+.2,info.board.z);root.rotation.y=Math.atan2(info.dx,info.dz);
  function box(w,h,d,x,y,z,m){const mesh=new T.Mesh(geometry,materials[m]);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.castShadow=true;root.add(mesh);}
  box(5,.2,2.5,0,0,0,'stone');for(const x of [-2.1,2.1])box(.15,2.7,.15,x,1.35,-.8,'metal');box(4.5,1.9,.08,0,1.5,-.85,'glass');box(5, .2,2.9,0,2.8,0,'wood');box(5.2,.16,3.1,0,3,0,'snow');box(3.6,.16,.5,0,.6,-.35,'wood');for(const x of [-1.3,1.3])box(.12,.65,.12,x,.3,-.35,'metal');box(.12,3.7,.12,3.5,1.85,0,'metal');box(1,.85,.12,3.5,3.4,0,'snow');box(.65,.5,.15,3.5,3.4,.1,'metal');return root;
 }
 return{building,stop};
})();
