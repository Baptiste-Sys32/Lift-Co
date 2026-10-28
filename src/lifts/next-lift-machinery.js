// Detailed, shared visual machinery for the isolated lift studies.
// Geometry is estimated from the report photos, not manufacturing drawings.
window.LiftCoStudyMachinery={createFactory(T,h){
 const {geo,mesh,box,beam,cylinder,pipe,steel,dark,rubber,yellow}=h;
 const sharedWheels=window.LiftCoWheelParts?.createFactory(T);
 const alloy=new T.MeshStandardMaterial({color:0xc6ccc7,metalness:.72,roughness:.38}),cast=new T.MeshStandardMaterial({color:0x788783,metalness:.6,roughness:.5}),red=new T.MeshStandardMaterial({color:0x98473e,metalness:.3,roughness:.6});
 function disc(key,r,depth,hole,holes=0){return geo(key,()=>{const s=new T.Shape();s.absarc(0,0,r,0,Math.PI*2,false);const bore=new T.Path();bore.absarc(0,0,hole,0,Math.PI*2,true);s.holes.push(bore);for(let i=0;i<holes;i++){const a=i/holes*Math.PI*2,p=new T.Path();p.absarc(Math.cos(a)*r*.65,Math.sin(a)*r*.65,r*.14,0,Math.PI*2,true);s.holes.push(p);}const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.007,bevelThickness:.005,bevelSegments:1,curveSegments:10});g.translate(0,0,-depth/2);return g;});}
 function boltRing(parent,{axis='x',radius=.15,count=6,offset=.045,size=.022,material=alloy}={}){
  const geometry=geo('bolts'+[axis,radius,count,offset,size],()=>{const positions=[],normals=[];for(const sign of [-1,1])for(let i=0;i<count;i++){const a=i/count*Math.PI*2,g=new T.CylinderGeometry(size,size,.024,6);if(axis==='x'){g.rotateZ(Math.PI/2);g.translate(sign*offset,Math.cos(a)*radius,Math.sin(a)*radius);}else g.translate(Math.cos(a)*radius,sign*offset,Math.sin(a)*radius);const b=g.toNonIndexed(),p=b.attributes.position,n=b.attributes.normal;positions.push(...p.array);normals.push(...n.array);g.dispose();b.dispose();}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));return g;});return mesh(parent,geometry,material);
 }
 function sheave(parent,x,y,z){
  const root=new T.Group();root.name='Cast sheave / rubber groove / bolted hub';root.position.set(x,y,z);parent.add(root);if(sharedWheels){sharedWheels.fill(root,{radius:.322});root.userData.radius=.322;root.userData.axialHalfWidth=.17;return root;}
  const profile=[[.266,-.12],[.33,-.12],[.35,-.09],[.35,-.065],[.31,-.035],[.31,.035],[.35,.065],[.35,.09],[.33,.12],[.266,.12]].map(([r,a])=>new T.Vector2(r,a));
  mesh(root,geo('cast-sheave-rim',()=>{const g=new T.LatheGeometry(profile,36);g.rotateZ(Math.PI/2);return g;}),alloy);
  const web=mesh(root,disc('sheave-web',.269,.045,.084,6),cast);web.rotation.y=Math.PI/2;
  const tread=mesh(root,geo('sheave-rubber',()=>new T.TorusGeometry(.307,.015,8,36)),rubber);tread.rotation.y=Math.PI/2;
  cylinder(root,.105,.29,0,0,0,alloy,'x');for(const sign of [-1,1])cylinder(root,.067,.025,sign*.157,0,0,dark,'x');boltRing(root);
  root.userData={radius:.322,axialHalfWidth:.17};return root;
 }
 function girder(parent,a,b,w=.24,d=.30,material=steel){const web=beam(parent,a,b,w*.32,d,material),length=web.geometry.parameters.height;for(const sign of [-1,1])box(web,w,length,.045,0,0,sign*d/2,material);return web;}
 function bullwheel(parent,{x=0,y=5,z=0,radius=2.55,color=cast,brakes=true}={}){
  const root=new T.Group();root.name='Grooved bullwheel / perforated web / bolted hub';root.position.set(x,y,z);parent.add(root);const r=radius;
  const profile=[[r-.20,-.14],[r+.07,-.14],[r+.08,-.10],[r-.018,-.045],[r-.018,.045],[r+.08,.10],[r+.07,.14],[r-.20,.14]].map(([r,y])=>new T.Vector2(r,y));
  mesh(root,geo('bullwheel-rim'+r,()=>new T.LatheGeometry(profile,72)),color);
  const tyre=mesh(root,geo('bullwheel-tread'+r,()=>new T.TorusGeometry(r-.033,.015,8,72)),rubber);tyre.rotation.x=Math.PI/2;
  const web=mesh(root,disc('bullwheel-web'+r,r-.195,.10,.27,8),color);web.rotation.x=Math.PI/2;cylinder(root,.38,.50,0,0,0,alloy);boltRing(root,{axis:'y',radius:.50,count:12,offset:.085,size:.034});
  if(brakes)for(const sign of [-1,1]){const g=new T.Group();g.position.set(x+sign*(r+.23),y,z+.40);parent.add(g);box(g,.20,.55,.32,0,0,0,red);for(const sy of [-1,1])box(g,.42,.12,.28,-sign*.19,sy*.20,0,cast);box(g,.12,.11,.23,-sign*.35,.15,0,rubber);cylinder(g,.075,.25,.0,.42,0,alloy);}
  root.userData={radius:r};return root;
 }
 function motor(parent,{x=0,y=6.7,z=21,scale=1}={}){
  const root=new T.Group();root.name='Finned motor / coupling / reduction gearbox';root.position.set(x,y,z);root.scale.setScalar(scale);parent.add(root);
  box(root,1.55,.16,3.1,0,-.42,.15,dark);for(const sx of [-.52,.52])for(const zz of [-.8,1.0]){box(root,.28,.18,.24,sx,-.27,zz,cast);cylinder(root,.037,.04,sx,-.16,zz,alloy);}
  const body=cylinder(root,.37,1.35,0,.08,-.25,cast);body.rotation.x=Math.PI/2;
  for(let i=0;i<14;i++){const fin=mesh(root,geo('motor-fin',()=>new T.TorusGeometry(.38,.016,5,28)),cast,0,.08,-.85+i*.09);}
  const cap=cylinder(root,.40,.10,0,.08,-.99,dark);cap.rotation.x=Math.PI/2;for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(root,[Math.cos(a)*.12,.08+Math.sin(a)*.12,-1.05],[Math.cos(a)*.32,.08+Math.sin(a)*.32,-1.05],.018,.022,alloy);}
  const reducer=cylinder(root,.39,.90,0,.02,1.07,cast,'x');for(const side of [-1,1]){const cover=cylinder(root,.32,.065,side*.47,.02,1.07,alloy,'x');for(let i=0;i<8;i++){const a=i*Math.PI/4;const bolt=cylinder(root,.024,.025,side*.51,.02+Math.cos(a)*.25,1.07+Math.sin(a)*.25,dark,'x');}}
  box(root,1.02,.08,1.18,0,-.30,1.07,alloy);for(const sx of [-.36,.36])for(const zz of [.65,1.47])cylinder(root,.035,.05,sx,-.23,zz,alloy);
  const shaft=cylinder(root,.085,.44,0,.08,.66,alloy);shaft.rotation.x=Math.PI/2;box(root,.45,.33,.40,0,.10,.55,yellow);box(root,.12,.05,.42,.0,.29,.55,dark);
  cylinder(root,.18,.85,0,-.42,1.23,alloy);return root;
 }
 function gearbox(parent,x,y,z){
  const root=new T.Group();root.name='Right-angle reducer / bolted inspection covers';root.position.set(x,y,z);parent.add(root);cylinder(root,.36,.68,0,0,0,cast,'x');
  for(const side of [-1,1]){cylinder(root,.31,.055,side*.37,0,0,alloy,'x');for(let i=0;i<8;i++){const a=i*Math.PI/4;cylinder(root,.024,.025,side*.41,Math.cos(a)*.25,Math.sin(a)*.25,dark,'x');}}
  cylinder(root,.23,.40,0,-.27,0,cast);box(root,.64,.08,.64,0,-.47,0,alloy);const input=cylinder(root,.16,.30,0,0,-.36,alloy);input.rotation.x=Math.PI/2;return root;
 }
 function bearing(parent,x,y,z){box(parent,.75,.18,.75,x,y,z,cast);cylinder(parent,.25,.30,x,y+.19,z,alloy);for(const sx of [-.27,.27])for(const sz of [-.27,.27])cylinder(parent,.035,.06,x+sx,y+.12,z+sz,alloy);}
 function tyre(parent,x,y,z,yaw=0){
  const root=new T.Group();root.name='Pneumatic drive tyre / pressed alloy rim';root.position.set(x,y,z);root.rotation.y=yaw;parent.add(root);
  const profile=[[.12,-.13],[.19,-.13],[.23,-.10],[.24,-.06],[.24,.06],[.23,.10],[.19,.13],[.12,.13]].map(([r,a])=>new T.Vector2(r,a));
  mesh(root,geo('pneumatic-tyre',()=>{const g=new T.LatheGeometry(profile,28);g.rotateZ(Math.PI/2);return g;}),rubber);
  const web=mesh(root,disc('tyre-rim',.166,.04,.045,5),alloy);web.rotation.y=Math.PI/2;cylinder(root,.065,.30,0,0,0,cast,'x');boltRing(root,{radius:.09,count:5,offset:.04,size:.016});
  for(const x of [-.045,.045]){const line=mesh(root,geo('tyre-tread-line',()=>new T.TorusGeometry(.2405,.003,4,28)),dark,x,0,0);line.rotation.y=Math.PI/2;}
  return root;
 }
 function conveyor(parent,samples,{railX=3.1,trackY=5.2}={}){
  const rollers=[],rails=[],frames=[],spacing=.63;
  // Carrier running wheels ride the rail; overhead tyres press on its grip pad.
  for(const side of [-1,1]){
   const points=samples.map(p=>new T.Vector3(p.x+side*(railX-.20)*p.nx,trackY-.11,p.z+side*(railX-.20)*p.nz));rails.push(points);pipe(parent,points,.04,alloy);
   const spine=samples.map(p=>new T.Vector3(p.x+side*(railX-.30)*p.nx,trackY+.60,p.z+side*(railX-.30)*p.nz));for(let j=0;j<spine.length-1;j+=8)frames.push(girder(parent,spine[j],spine[Math.min(j+8,spine.length-1)],.16,.22,dark));
   let distance=0,last=-1;for(let i=1;i<samples.length-1;i++){
    distance+=Math.hypot(samples[i].x-samples[i-1].x,samples[i].z-samples[i-1].z);if(distance-last<spacing)continue;last=distance;
    const p=samples[i],x=p.x+side*(railX+.12)*p.nx,z=p.z+side*(railX+.12)*p.nz,cy=trackY+.33;
    const wheel=tyre(parent,x,cy,z,p.yaw);wheel.userData.laneSide=side;rollers.push(wheel);const back=railX-.30,ax=p.x+side*back*p.nx,az=p.z+side*back*p.nz;
    beam(parent,[ax,cy,az],[x,cy,z],.055,.055,alloy);box(parent,.19,.22,.23,ax,cy,az,cast);beam(parent,[ax,cy,az],[ax,trackY+.60,az],.075,.11,steel);
    if(rollers.length%4===0){const g=new T.Group();g.position.set(ax,cy,az);g.rotation.y=p.yaw;parent.add(g);const pulley=mesh(g,geo('belt-pulley',()=>new T.TorusGeometry(.13,.022,6,20)),alloy);pulley.rotation.y=Math.PI/2;
     const previous=samples[Math.max(0,i-6)],a=new T.Vector3(previous.x+side*back*previous.nx,cy,previous.z+side*back*previous.nz),b=new T.Vector3(ax,cy,az);pipe(parent,[a.clone().add(new T.Vector3(0,.14,0)),b.clone().add(new T.Vector3(0,.14,0))],.014,rubber);pipe(parent,[a.clone().add(new T.Vector3(0,-.14,0)),b.clone().add(new T.Vector3(0,-.14,0))],.014,rubber);
    }
   }
  }
  // Cross ties and cam rails are supported above the moving carrier envelope.
  for(let i=5;i<samples.length;i+=16){const p=samples[i];girder(parent,[p.x-4.0*p.nx,trackY+1.2,p.z-4.0*p.nz],[p.x+4.0*p.nx,trackY+1.2,p.z+4.0*p.nz],.20,.23);for(const side of [-1,1]){const x=p.x+side*(railX-.30)*p.nx,z=p.z+side*(railX-.30)*p.nz;beam(parent,[x,trackY+.60,z],[x,trackY+1.2,z],.10,.13,steel);box(parent,.28,.08,.30,x,trackY+1.16,z,cast);}}
  return{rollers,railPoints:rails,frames};
 }
 function walk(parent,points,width=.9,y=6.55){
  const g=new T.Group();g.name='Open grated service walk';parent.add(g);
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),nx=dz/len,nz=-dx/len;
   for(const side of [-1,1])girder(g,[a.x+side*width/2*nx,y-.13,a.z+side*width/2*nz],[b.x+side*width/2*nx,y-.13,b.z+side*width/2*nz],.10,.16);
   for(let s=0;s<len;s+=.16){const t=s/len,x=a.x+dx*t,z=a.z+dz*t;beam(g,[x-width/2*nx,y,z-width/2*nz],[x+width/2*nx,y,z+width/2*nz],.035,.045,steel);}
   const side=1;for(let j=0;j<=Math.ceil(len/1.6);j++){const t=j/Math.ceil(len/1.6),x=a.x+dx*t+side*width/2*nx,z=a.z+dz*t+side*width/2*nz;beam(g,[x,y,z],[x,y+1.05,z],.035);}
   for(const h of [.5,1.05])beam(g,[a.x+width/2*nx,y+h,a.z+width/2*nz],[b.x+width/2*nx,y+h,b.z+width/2*nz],.035);
  }return g;
 }
 function merge(parent,excluded=new Set()){
  parent.updateWorldMatrix(true,true);const inv=parent.matrixWorld.clone().invert(),groups=new Map();function visit(o){if(!o.visible||excluded.has(o))return;if(o.isMesh&&!o.isInstancedMesh){if(!groups.has(o.material))groups.set(o.material,[]);groups.get(o.material).push(o);}for(const c of o.children)visit(c);}for(const o of parent.children)visit(o);
  for(const [material,nodes]of groups){const p=[],n=[],uv=[];for(const o of nodes){const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);const u=g.attributes.uv;if(u)uv.push(...u.array);else for(let i=0;i<g.attributes.position.count;i++)uv.push(0,0);g.dispose();}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeBoundingSphere();nodes.forEach(o=>o.parent.remove(o));mesh(parent,g,material);}
 }
 return{sheave,girder,bullwheel,motor,gearbox,bearing,tyre,conveyor,walk,merge,alloy,cast,red};
}};
