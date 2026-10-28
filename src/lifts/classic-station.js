// Approved compact Classic terminal. No detachment rails or conveyor tyres.
window.LiftCoClassicStation={create(T,{root,half,straight,railX:R,base,top,ends=[1,-1],driveAssembly=true}){
const roofs=[],bullwheels={},wheelParts=window.LiftCoWheelParts?.createFactory(T);
const M={},G=new Map();function mat(key,color,roughness=.7,metalness=0){return M[key]||(M[key]=new T.MeshStandardMaterial({color,roughness,metalness}));}function geo(key,fn){if(!G.has(key))G.set(key,fn());return G.get(key);}const green=mat('green',0x315b55,.6,.45),steel=mat('steel',0xa9b6b4,.4,.65),ivory=mat('ivory',0xeeeede,.6),dark=mat('dark',0x2e4042,.7,.3),black=mat('black',0x222e31),snow=mat('snow',0xe9ece4,1),concrete=mat('concrete',0x9da89b,1),glass=new T.MeshStandardMaterial({color:0x284c59,transparent:true,opacity:.68,roughness:.2,metalness:.15,side:T.DoubleSide});
function mesh(g,geometry,material,x=0,y=0,z=0){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;}
function box(g,w,h,d,x,y,z,m){return mesh(g,geo('b'+[w,h,d],()=>new T.BoxGeometry(w,h,d)),m,x,y,z);}
function bar(g,a,b,r,m){const p=new T.Vector3(...a),q=new T.Vector3(...b),d=q.clone().sub(p),o=mesh(g,geo('c'+r+','+d.length().toFixed(3),()=>new T.CylinderGeometry(r,r,d.length(),12)),m);o.position.copy(p).add(q).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
function coverPanel(g,z0,z1,rope,end){const points=[],indices=[],segments=18;for(let j=0;j<=1;j++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI;points.push(Math.cos(a)*3.45,rope+.65+Math.sin(a)*2.3,end*(j?z1:z0));}for(let i=0;i<segments;i++){const a=i,b=i+segments+1;indices.push(a,b,a+1,a+1,b,b+1);}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));geometry.setIndex(indices);geometry.computeVertexNormals();mesh(g,geometry,glass);}
function terminal(end){
 const z=end*(half+straight),rope=end===1?base.y:top.y,floor=rope-5,g=new T.Group();g.position.z=z;root.add(g);
 // Heavy green longitudinal beams and two central, inclined support pylons.
 for(const d of [-10.5,-2.8]){
  box(g,1.65,.35,1.9,0,floor+.09,end*(d+.9),concrete);
  bar(g,[0,floor+.2,end*(d+.9)],[0,rope+.25,end*(d-.6)],.51,green);
  for(const x of [-.6,.6])for(const dz of [-.55,.55])mesh(g,geo('foundation-bolt',()=>new T.CylinderGeometry(.055,.055,.16,6)),steel,x,floor+.3,end*(d+.9+dz));
  bar(g,[-4.1,rope+.35,end*d],[4.1,rope+.35,end*d],.28,green);
 }
 for(const x of [-2.4,2.4])bar(g,[x,rope+.5,end*-14],[x,rope+.5,end*3.4],.27,green);
 for(const x of [-2.4,2.4]){const cap=mesh(g,geo('beam-cap',()=>{const a=new T.CylinderGeometry(.25,.25,.025,24);a.rotateX(Math.PI/2);return a;}),steel,x,rope+.5,end*3.42);}
 box(g,5.7,.16,12.6,0,rope+.52,end*-4.2,dark);
 if(driveAssembly){
 const wheel=new T.Group();wheel.position.y=rope;g.add(wheel);bullwheels[end===1?'base':'top']=wheel;
 if(wheelParts)wheelParts.fill(wheel,{radius:R-.055,axis:'y',bull:true});else{
 const rim=mesh(wheel,geo('bullwheel-rim',()=>{const a=new T.TorusGeometry(R-.045,.075,8,64);a.rotateX(Math.PI/2);return a;}),green);
 mesh(wheel,geo('bullwheel-hub',()=>new T.CylinderGeometry(.45,.45,.38,20)),dark);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;bar(wheel,[.4*Math.cos(a),0,.4*Math.sin(a)],[(R-.12)*Math.cos(a),0,(R-.12)*Math.sin(a)],.075,steel);}
 }
 mesh(g,geo('drive-shaft',()=>new T.CylinderGeometry(.19,.19,1.2,12)),steel,0,rope+.57,0);box(g,1.7,.7,2,0,rope+1.12,end*-2.2,green);box(g,.9,.7,1,0,rope+.96,end*-4.2,steel);
 }
 // Ribbed curved glazing, with white end cheeks and a visible black service grille.
 const canopy=new T.Group();g.add(canopy);roofs.push(canopy);for(let d=-11;d<2.9;d+=2.3)coverPanel(canopy,d,Math.min(d+2.3,3),rope,end);
 for(const d of [-11,-8.7,-6.4,-4.1,-1.8,.5,3]){
  const ribs=[];for(let k=0;k<=24;k++){const a=k/24*Math.PI;ribs.push([Math.cos(a)*3.48,rope+.65+Math.sin(a)*2.33,end*d]);}for(let k=1;k<ribs.length;k++)bar(canopy,ribs[k-1],ribs[k],d===-11||d===3?.095:.045,ivory);
 }
 for(const side of [-1,1])box(canopy,.12,.16,14.2,side*3.45,rope+.66,end*-4,ivory);
 for(const d of [-11,3]){
  const shape=new T.Shape();shape.moveTo(-3.48,rope+.65);for(let k=0;k<=24;k++){const a=Math.PI-k/24*Math.PI;shape.lineTo(Math.cos(a)*3.48,rope+.65+Math.sin(a)*2.33);}shape.closePath();
  const geometry=new T.ExtrudeGeometry(shape,{depth:.1,bevelEnabled:false});mesh(canopy,geometry,ivory,0,0,end*d-.05);
  box(canopy,4.6,1.55,.14,0,rope+1.48,end*d+(end*d>0?.08:-.08),black);for(let x=-2.18;x<=2.2;x+=.24)box(canopy,.025,1.49,.16,x,rope+1.48,end*d+(end*d>0?.09:-.09),dark);
 }
 // A grated service walkway and ladder remain outside the chair envelope.
 box(g,1.3,.12,7,4.22,rope+.57,end*-4.5,steel);for(const d of [-8,-4.5,-1]){bar(g,[4.65,rope+.65,end*d],[4.65,rope+1.65,end*d],.035,steel);bar(g,[3.7,rope+.65,end*d],[4.65,rope+.55,end*d],.05,green);}for(const h of [.5,1])bar(g,[4.65,rope+.65+h,end*-8],[4.65,rope+.65+h,end*-1],.035,steel);
 for(const x of [4.15,4.65])bar(g,[x,floor+.2,end*-4.5],[x,rope+1.45,end*-4.5],.04,steel);for(let y=floor+.35;y<rope+1.4;y+=.29)bar(g,[4.15,y,end*-4.5],[4.65,y,end*-4.5],.032,steel);
 for(const side of [-1,1]){box(g,3,.35,15,side*6,floor+.27,end*-6.5,snow);const ramp=new T.Mesh(new T.BoxGeometry(2.8,.12,4),snow);ramp.position.set(side*6,floor+.18,end*-16);ramp.rotation.x=end*.08;ramp.receiveShadow=true;g.add(ramp);}
}
for(const end of ends)terminal(end);
return {roofs,bullwheels};
}};
