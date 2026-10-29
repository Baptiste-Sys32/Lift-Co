/* One grooved, perforated wheel vocabulary for pylons and terminal machinery. */
window.LiftCoWheelParts={createFactory(T){
 const cache=new Map(),alloy=new T.MeshStandardMaterial({color:0xb8c4bf,metalness:.72,roughness:.37}),cast=new T.MeshStandardMaterial({color:0x748381,metalness:.6,roughness:.5}),rubber=new T.MeshStandardMaterial({color:0x263034,roughness:.86});
 function geo(key,make){if(!cache.has(key))cache.set(key,make());return cache.get(key);}
 function fill(parent,{radius=.34,axis='x',bull=false,tyre=false}={}){
  const r=radius,width=tyre?.22:bull?.28:.32,hub=tyre?.08:bull?.35:.105,flange=bull?.065:.04,rot=new T.Matrix4();if(axis==='x')rot.makeRotationZ(Math.PI/2);else if(axis==='z')rot.makeRotationX(Math.PI/2);
  function part(key,make,material,name){const geometry=geo(key+':'+[r,axis,bull,tyre],()=>make().applyMatrix4(rot)),mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  part('rim',()=>new T.LatheGeometry((tyre?[[r-.10,-width/2],[r-.04,-width/2],[r,-width*.36],[r,width*.36],[r-.04,width/2],[r-.10,width/2]]:[[r-.075,-width/2],[r,-width/2],[r+flange,-width*.32],[r+flange,-width*.18],[r,-width*.1],[r,width*.1],[r+flange,width*.18],[r+flange,width*.32],[r,width/2],[r-.075,width/2]]).map(([a,b])=>new T.Vector2(a,b)),bull?64:24),tyre?rubber:cast,tyre?'Rounded conveyor tyre':'Flanged cast rim');
  if(!tyre)part('tread',()=>{const g=new T.TorusGeometry(r-.01,.014,6,bull?64:24);g.rotateX(Math.PI/2);return g;},rubber,'Rubber running groove');
  part('web',()=>{const s=new T.Shape();s.absarc(0,0,r-.06,0,Math.PI*2,false);const bore=new T.Path();bore.absarc(0,0,hub*.8,0,Math.PI*2,true);s.holes.push(bore);const count=bull?8:6;for(let i=0;i<count;i++){const a=i/count*Math.PI*2,p=new T.Path();p.absarc(Math.cos(a)*r*.61,Math.sin(a)*r*.61,r*.13,0,Math.PI*2,true);s.holes.push(p);}const g=new T.ExtrudeGeometry(s,{depth:.05,bevelEnabled:false,curveSegments:8});g.translate(0,0,-.025);g.rotateX(Math.PI/2);return g;},alloy,'Perforated wheel web');
  part('hub',()=>{const positions=[],normals=[];function add(g){const n=g.index?g.toNonIndexed():g;positions.push(...n.attributes.position.array);normals.push(...n.attributes.normal.array);if(n!==g)n.dispose();g.dispose();}add(new T.CylinderGeometry(hub,hub,width+.07,12));for(const side of [-1,1])for(let i=0;i<6;i++){const a=i/6*Math.PI*2,g=new T.CylinderGeometry(bull?.032:.019,bull?.032:.019,.025,6);g.translate(Math.cos(a)*hub*.72,side*(width/2+.045),Math.sin(a)*hub*.72);add(g);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));return g;},alloy,'Bolted bearing hub');
  parent.userData.wheelRadius=r;parent.userData.wheelAxis=axis;return parent;
 }
 return{fill};
}};
