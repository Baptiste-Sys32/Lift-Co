// Reusable Three.js rendering for a LiftBuilderCore.LiftLayout.
window.LiftBuilderView=class{
 constructor(THREE,scene){
  this.T=THREE;this.scene=scene;this.root=new THREE.Group();scene.add(this.root);this.picks=[];this.wheels=[];this.cabins=[];this.time=0;this.showRoofs=false;this.showCabins=true;this.selected=null;
  const standard=(color,roughness=.6,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  this.m={steel:standard(0x9aa6a7,.5,.55),dark:standard(0x46565b,.6,.4),rubber:standard(0x283438,.9),rim:standard(0xd1d6cf,.4,.55),wood:standard(0x93735a,.9),roof:standard(0x637d83,.8),snow:standard(0xf4f1e7,1),deck:standard(0x9a9c91,1),red:standard(0xc94e3f,.5,.1),cream:standard(0xf8edcf,.7),solar:standard(0x213d4d,.4,.4),glass:new THREE.MeshStandardMaterial({color:0xb6d8d7,transparent:true,opacity:.24,depthWrite:false,side:THREE.DoubleSide,roughness:.2}),gold:standard(0xe0a341,.55),support:standard(0x65826c,.7),compression:standard(0xb67753,.7)};
  this.cache=new Map();
 }
 geometry(key,build){if(!this.cache.has(key)){const geometry=build();geometry.userData.shared=true;this.cache.set(key,geometry);}return this.cache.get(key);}
 box(parent,w,h,d,x,y,z,material){const T=this.T,mesh=new T.Mesh(this.geometry('box:'+w+','+h+','+d,()=>new T.BoxGeometry(w,h,d)),material);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 bar(parent,a,b,w=.09,d=w,material=this.m.steel){const T=this.T,start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start),mesh=new T.Mesh(new T.BoxGeometry(w,delta.length(),d),material);mesh.position.copy(start).add(end).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());mesh.castShadow=true;parent.add(mesh);return mesh;}
 label(parent,text,x,y,z,selected=false){const T=this.T,canvas=document.createElement('canvas');canvas.width=512;canvas.height=112;const c=canvas.getContext('2d');c.fillStyle=selected?'#d8a04c':'#f6f1e5';c.fillRect(0,0,512,112);c.fillStyle='#34483d';c.font='36px Georgia';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,57,485);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false}));sprite.material.userData.ephemeral=true;sprite.position.set(x,y,z);sprite.scale.set(5.8,1.27,1);sprite.renderOrder=3;parent.add(sprite);}
 capsule(width,length,depth){const T=this.T,r=width/2,d=length/2-r,shape=new T.Shape();shape.moveTo(-r,-d);shape.lineTo(-r,d);shape.absarc(0,d,r,Math.PI,0,true);shape.lineTo(r,-d);shape.absarc(0,-d,r,0,-Math.PI,true);const geometry=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.1,bevelThickness:.1,bevelSegments:2,curveSegments:12,steps:1});geometry.rotateX(-Math.PI/2);return geometry;}
 station(layout,id){
  const T=this.T,m=this.m,s=id==='start'?0:layout.length,height=layout[id].height,out=id==='start'?-1:1,g=new T.Group(),centre=out*9;g.position.z=s;g.userData={id,kind:'station'};this.root.add(g);this.picks.push(g);
  const floor=Math.max(.25,height-4.64);
  this.box(g,3.6,.25,18,0,floor-.125,centre,m.deck);
  for(const side of [-1,1])this.box(g,.8,.25,18,side*4.6,floor-.125,centre,m.deck);
  for(const side of [-1,1])for(const z of [out*3,out*15])this.box(g,.16,height+1,.16,side*4.55,(height+1)/2,z,m.steel);
  if(this.showRoofs){for(const [width,length,depth,y,material] of [[10.2,21,.65,height+1.0,m.wood],[10.5,21.3,.22,height+1.75,m.roof],[10.5,21.3,.12,height+1.96,m.snow]]){const roof=new T.Mesh(this.capsule(width,length,depth),material);roof.position.set(0,y,centre);roof.castShadow=roof.receiveShadow=true;g.add(roof);}}
  const wheel=new T.Group();wheel.position.set(0,height,centre);g.add(wheel);
  const disc=new T.Mesh(this.geometry('bullwheel',()=>new T.CylinderGeometry(3.045,3.045,.25,40)),m.dark);wheel.add(disc);this.box(wheel,5.8,.12,.16,0,.14,0,m.steel);this.box(wheel,.16,.12,5.8,0,.14,0,m.steel);this.wheels.push({mesh:wheel,bull:true,sign:1,radius:3.045});
  this.label(g,id==='start'?'A · START':'B · END',0,height+3.4,centre,this.selected===id);
  if(this.selected===id)this.selectionRing(g);
 }
 selectionRing(parent){const T=this.T,geometry=new T.RingGeometry(1.4,1.58,48);geometry.rotateX(-Math.PI/2);const mesh=new T.Mesh(geometry,this.m.gold);mesh.position.y=.03;parent.add(mesh);}
 tower(layout,node,index){
  const T=this.T,m=this.m,h=node.height,s=node.distance,g=new T.Group(),floor=h-1.22,head=h+2.85;g.position.z=s;g.userData={id:node.id,kind:'tower'};this.root.add(g);this.picks.push(g);
  const mast=new T.Mesh(new T.CylinderGeometry(.38,.55,floor-.2,10),m.steel);mast.position.y=(floor+.2)/2;mast.castShadow=true;g.add(mast);this.box(g,1.6,.3,1.6,0,.1,0,m.deck);
  for(const x of [-2.25,2.25])this.bar(g,[x,floor-.1,-1.4],[x,floor-.1,1.4],.16,.16,m.dark);
  for(const z of [-1.4,1.4])this.bar(g,[-2.3,floor-.1,z],[2.3,floor-.1,z],.16,.16,m.dark);
  for(let x=-2.2;x<=2.21;x+=.28)this.box(g,.12,.04,2.8,x,floor,0,m.dark);
  for(const side of [-1,1]){
   for(const z of [-1.4,0,1.4])this.bar(g,[side*2.25,floor,z],[side*2.25,floor+1,z],.045);
   for(const y of [.5,1])this.bar(g,[side*2.25,floor+y,-1.4],[side*2.25,floor+y,1.4],.045);
   this.bar(g,[side*2.05,floor,0],[side*3.95,head,0],.26,.3,m.dark);
   this.bar(g,[side*.3,.3,.66],[side*.3,floor+1,.66],.055);
  }
  this.bar(g,[-4.35,head,0],[4.35,head,0],.3,.32,m.steel);
  for(let y=.5;y<floor+.8;y+=.32)this.bar(g,[-.3,y,.66],[.3,y,.66],.045);
  for(const x of [-.37,.37])this.bar(g,[x,floor,.12],[x,head+.2,.12],.045);
  for(let y=floor+.2;y<head;y+=.34)this.bar(g,[-.37,y,.12],[.37,y,.12],.04);
  const wheelGeometry=this.geometry('grooved-sheave',()=>{const profile=[[.12,-.16],[.34,-.16],[.38,-.13],[.38,-.07],[.34,-.045],[.34,.045],[.38,.07],[.38,.13],[.34,.16],[.12,.16]];const geometry=new T.LatheGeometry(profile.map(([r,x])=>new T.Vector2(r,x)),18);geometry.rotateZ(Math.PI/2);return geometry;});
  const hubGeometry=this.geometry('sheave-hub',()=>{const geometry=new T.CylinderGeometry(.26,.26,.35,12);geometry.rotateZ(Math.PI/2);return geometry;});
  const sign=node.compression?1:-1;
  for(const side of [-1,1]){
   const beam=[];const inset=side*(3.1-.38);
   for(let k=0;k<6;k++){
    const contactS=s+(k-2.5)*.84,slope=layout.slopeAt(contactS),ny=1/Math.hypot(1,slope),nz=-slope*ny,y=layout.heightAt(contactS),wheel=new T.Mesh(wheelGeometry,m.rubber);
    const cy=y+sign*.395*ny,cz=contactS-s+sign*.395*nz;wheel.position.set(side*3.1,cy,cz);wheel.castShadow=true;g.add(wheel);
    const hub=new T.Mesh(hubGeometry,m.rim);wheel.add(hub);this.box(wheel,.36,.49,.045,0,0,0,m.dark);this.wheels.push({mesh:wheel,sign:side*sign,radius:.34});
    const beamPoint=[inset,y-.75,contactS-s];beam.push(beamPoint);this.bar(g,[inset,cy,cz],beamPoint,.1,.14,m.steel);
   }
   for(let k=1;k<beam.length;k++)this.bar(g,beam[k-1],beam[k],.24,.2,m.steel);
   this.bar(g,[inset,h-.75,0],[inset,head,0],.14,.18,m.steel);
  }
  this.label(g,'T'+(index+1)+' · '+h.toFixed(1)+' m',0,head+1.5,0,this.selected===node.id);
  const type=new T.Mesh(new T.SphereGeometry(.17,10,8),node.compression?m.compression:m.support);type.position.set(0,head+.4,0);g.add(type);
  if(this.selected===node.id){
   this.selectionRing(g);this.bar(g,[5.1,.1,0],[5.1,h+2.4,0],.035,.035,m.gold);
   const handle=new T.Mesh(new T.SphereGeometry(.4,14,10),m.gold);handle.position.set(5.1,h+1.1,0);handle.userData={id:node.id,heightHandle:true};g.add(handle);
  }
 }
 makeCabin(){
  const T=this.T,m=this.m,g=new T.Group(),outline=[[-.78,-1.02],[.78,-1.02],[1.04,-.76],[1.04,.76],[.78,1.02],[-.78,1.02],[-1.04,.76],[-1.04,-.76]];
  function shell(rings){const p=[],ix=[];for(const [y,scale] of rings)for(const [x,z] of outline)p.push(x*scale,y,z*scale);for(let i=0;i<rings.length-1;i++)for(let k=0;k<8;k++){const a=i*8+k,b=i*8+(k+1)%8;ix.push(a,a+8,b,b,a+8,b+8);}for(let k=1;k<7;k++){ix.push(0,k,k+1);const a=(rings.length-1)*8;ix.push(a,a+k+1,a+k);}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));geometry.setIndex(ix);geometry.computeVertexNormals();return geometry;}
  const body=new T.Mesh(this.geometry('cabin-body',()=>shell([[-4.82,.83],[-4.64,.96],[-4.14,1]])),m.red);body.castShadow=true;g.add(body);
  g.add(new T.Mesh(this.geometry('cabin-roof',()=>shell([[-2.93,.9],[-2.8,.96],[-2.7,.88]])),m.dark));
  for(let i=0;i<8;i++){
   const a=outline[i],b=outline[(i+1)%8],geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([a[0],-4.14,a[1],b[0],-4.14,b[1],b[0]*.9,-2.93,b[1]*.9,a[0]*.9,-2.93,a[1]*.9],3));geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();g.add(new T.Mesh(geometry,m.glass));
   this.bar(g,[a[0],-4.14,a[1]],[a[0]*.9,-2.93,a[1]*.9],.035,.035,m.dark);
  }
  this.box(g,1.55,.09,1.6,0,-4.64,0,m.dark);
  for(const z of [-1.02,1.02])this.box(g,1.55,.1,.035,0,-4.27,z,m.cream);
  for(const side of [-1,1])this.box(g,.64,.055,1.14,side*.52,-2.67,0,m.solar);
  const hanger=new T.CatmullRomCurve3([new T.Vector3(0,-.1,0),new T.Vector3(-.14,-1,0),new T.Vector3(-.25,-1.8,0),new T.Vector3(.15,-2.72,0)]);g.add(new T.Mesh(new T.TubeGeometry(hanger,16,.06,6,false),m.steel));this.box(g,.3,.18,.6,0,-.02,0,m.steel);return g;
 }
 render(layout,selected){
  this.layout=layout;this.selected=selected;
  this.root.traverse(o=>{if(o.geometry&&!o.geometry.userData.shared)o.geometry.dispose();if(o.material?.userData.ephemeral){o.material.map?.dispose();o.material.dispose();}});this.root.clear();this.picks=[];this.wheels=[];this.cabins=[];
  if(!layout.start)return;
  this.root.position.set(layout.start.x,0,layout.start.z);this.root.rotation.y=Math.atan2(layout.dx,layout.dz);
  this.station(layout,'start');if(!layout.ready)return;this.station(layout,'end');
  const nodes=layout.nodes.filter(n=>n.kind==='tower');nodes.forEach((node,i)=>this.tower(layout,node,i));
  const T=this.T,points=[],total=2*(layout.length+18)+2*Math.PI*3.1;
  for(let s=0;s<total;s+=.3){const p=this.loopPoint(s);points.push(new T.Vector3(p.x,p.y,p.z));}
  const cable=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points,true),Math.ceil(total/.3),.055,8,true),this.m.dark);cable.castShadow=true;this.root.add(cable);
  if(this.showCabins)for(let i=0;i<6;i++){const cabin=this.makeCabin();this.root.add(cabin);this.cabins.push({g:cabin,s:i/6*total});}
  this.update(0);this.root.updateMatrixWorld(true);
 }
 loopPoint(s){const layout=this.layout,L=layout.length+18,R=3.1,turn=Math.PI*R,total=2*L+2*turn;let x,z;s=(s%total+total)%total;if(s<L){x=R;z=-9+s;}else if(s<L+turn){const a=(s-L)/R;x=Math.cos(a)*R;z=layout.length+9+Math.sin(a)*R;}else if(s<2*L+turn){x=-R;z=layout.length+9-(s-L-turn);}else{const a=(s-2*L-turn)/R;x=-Math.cos(a)*R;z=-9-Math.sin(a)*R;}return {x,y:layout.heightAt(z),z};}
 update(dt){if(!this.layout?.ready)return;for(const w of this.wheels){if(w.bull)w.mesh.rotation.y+=dt*3/w.radius;else w.mesh.rotation.x+=dt*3*w.sign/w.radius;}const T=this.T;for(const cabin of this.cabins){const p=this.loopPoint(cabin.s),onLine=p.z>0&&p.z<this.layout.length,speed=onLine?3.5:.9,slope=onLine?this.layout.slopeAt(p.z):0;cabin.s+=dt*speed/Math.hypot(1,slope);const here=this.loopPoint(cabin.s),ahead=this.loopPoint(cabin.s+.08);cabin.g.position.set(here.x,here.y,here.z);cabin.g.rotation.y=Math.atan2(ahead.x-here.x,ahead.z-here.z);}}
};
