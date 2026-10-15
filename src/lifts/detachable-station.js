// Approved tapered station housing, shared by the design study and the game.
// Local coordinates: rope at y=5, entry at z=0, rear turnaround at z=26.
// Platforms, rail machinery and cable contacts belong to the operational lift.
window.LiftCoDetachableStation={create(T,{parent,color=0xb7352c,name='Alpine terminal',straight=26,out=1,supportParent=parent}){
 const housing=new T.Group();housing.name='Lift Co. station housing';housing.rotation.y=out<0?Math.PI:0;housing.scale.z=straight/26;parent.add(housing);
 const mat=(color,roughness=.6,metalness=0,extra={})=>new T.MeshStandardMaterial({color,roughness,metalness,...extra});
 const bodyM=mat(color,.35,.15),edgeM=mat(0x2b3439,.52,.5),silver=mat(0x9ea8a9,.4,.7),roofM=mat(0x7a8181,.7,.35),glass=mat(0x526476,.17,.35,{transparent:true,opacity:.72,side:T.DoubleSide,depthWrite:false});
 const cache=new Map();function geo(key,fn){if(!cache.has(key))cache.set(key,fn());return cache.get(key);}
 function mesh(g,geometry,material,x=0,y=0,z=0){const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=!material.transparent;o.receiveShadow=true;g.add(o);return o;}
 function box(g,w,h,d,x,y,z,m){return mesh(g,geo('box'+[w,h,d],()=>new T.BoxGeometry(w,h,d)),m,x,y,z);}
 function beam(g,a,b,r,m){const p=new T.Vector3(...a),q=new T.Vector3(...b),delta=q.clone().sub(p),o=mesh(g,geo('bar'+r+','+delta.length().toFixed(4),()=>new T.CylinderGeometry(r,r,delta.length(),10)),m);o.position.copy(p).add(q).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;}
 function tube(g,points,r,m){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(16,points.length*5),r,8,false),m);}
// Two centre-line supports: front machinery frame and rear bullwheel bearing.
 const supports=new T.Group();supports.name='Station centre pillars';supports.rotation.y=housing.rotation.y;supports.scale.z=straight/26;supportParent.add(supports);
 const pillarM=mat(0x8f9b9d,.48,.5),footM=mat(0x929994,.95);
 for(const [z,top] of [[3.8,5.95],[26,4.04]]){
  box(supports,2.25,.4,2.35,0,.05,z,footM);
  box(supports,1.8,.14,1.85,0,.31,z,pillarM);
  const bottom=.38,height=top-bottom;
  mesh(supports,geo('central-pillar'+height,()=>new T.CylinderGeometry(.7,.88,height,16)),pillarM,0,bottom+height/2,z);
  for(const x of [-.7,.7])for(const dz of [-.7,.7])mesh(supports,geo('anchor-bolt',()=>new T.CylinderGeometry(.055,.055,.18,6)),silver,x,.42,z+dz);
  box(supports,10.8,.36,.65,0,6.05,z,pillarM);
 }
 // The rear pillar ends just below the existing rotating wheel; its central
 // bearing shaft carries the enclosed machinery without any perimeter posts.
 mesh(supports,new T.CylinderGeometry(.22,.22,2.02,12),pillarM,0,5.05,26);
// One egg-like cross-section drives the end faces, side skin and glazing.
// The lower cheeks swell out, then sweep inward into a narrower flat roof.
const profileSegments=[
 [[5.2,4.4],[6.2,4.4],[6.8,4.85],[6.55,5.95]],
 [[6.55,5.95],[6.35,7],[5.05,8.25],[4.55,8.86]],
 [[4.55,8.86],[4.28,9.16],[4.28,9.3],[4.05,9.3]]
];
const cross=new T.CurvePath();for(const segment of profileSegments)cross.add(new T.CubicBezierCurve3(...segment.map(([x,y])=>new T.Vector3(x,y,0))));
function outline(s){s.moveTo(-5.2,4.4);for(const [,a,b,c]of profileSegments)s.bezierCurveTo(-a[0],a[1],-b[0],b[1],-c[0],c[1]);s.lineTo(4.05,9.3);for(const [a,b,c]of profileSegments.slice().reverse())s.bezierCurveTo(c[0],c[1],b[0],b[1],a[0],a[1]);return s;}
function profile(){const s=outline(new T.Shape());s.closePath();return s;}
function face(z,front=false){const s=profile();if(front){
 // Cutouts are connected to the bottom edge of the shape so the cable mouths remain open.
 const frontShape=outline(new T.Shape());
 frontShape.lineTo(3.9,4.4);frontShape.lineTo(3.9,5.68);frontShape.lineTo(2.3,5.68);frontShape.lineTo(2.3,4.4);frontShape.lineTo(-2.3,4.4);frontShape.lineTo(-2.3,5.68);frontShape.lineTo(-3.9,5.68);frontShape.lineTo(-3.9,4.4);frontShape.closePath();
 const windowHole=new T.Path();windowHole.moveTo(-2.13,5.85);windowHole.lineTo(2.13,5.85);windowHole.lineTo(2.13,8.48);windowHole.lineTo(-2.13,8.48);windowHole.closePath();frontShape.holes.push(windowHole);
 const m=mesh(housing,new T.ExtrudeGeometry(frontShape,{depth:.22,bevelEnabled:true,bevelThickness:.04,bevelSize:.045,bevelSegments:2,curveSegments:24}),bodyM,0,0,z);return m;
 }return mesh(housing,new T.ExtrudeGeometry(s,{depth:.18,bevelEnabled:true,bevelThickness:.04,bevelSize:.045,bevelSegments:2,curveSegments:24}),bodyM,0,0,z);}
face(0,true);face(29.6);
// The side shell is a curved ribbon, with a continuous large glazing aperture.
function sideSurface(side,z0,z1,t0,t1,material,offset=0){const positions=[],indices=[],across=40;for(let j=0;j<=1;j++)for(let i=0;i<=across;i++){const p=cross.getPoint(t0+(t1-t0)*i/across);positions.push(side*(p.x+offset),p.y,j?z1:z0);}for(let i=0;i<across;i++){const a=i,b=i+across+1;indices.push(a,b,a+1,a+1,b,b+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return mesh(housing,g,material);}
const bodyDouble=bodyM.clone();bodyDouble.side=T.DoubleSide;const sideColors=[bodyDouble];
for(const side of [-1,1]){
 sideSurface(side,.22,29.6,0,.34,bodyDouble);sideSurface(side,.22,29.6,.91,1,bodyDouble);
 sideSurface(side,.22,1.4,.34,.91,bodyDouble);sideSurface(side,28.2,29.6,.34,.91,bodyDouble);
 sideSurface(side,1.4,28.2,.34,.91,glass,.018);
 for(const t of [.34,.91]){const p=cross.getPoint(t);beam(housing,[side*(p.x+.027),p.y,1.4],[side*(p.x+.027),p.y,28.2],.032,edgeM);}
 for(let z=1.4;z<=28.21;z+=1.34){const ps=[];for(let i=0;i<=16;i++){const p=cross.getPoint(.34+.57*i/16);ps.push([side*(p.x+.03),p.y,z]);}tube(housing,ps,.024,edgeM);}
 // The lower sill follows the swollen cheek instead of adding a square ledge.
 sideSurface(side,.22,29.6,.035,.075,bodyDouble,.012);
}
// Orange roof margins frame the inset ribbed grey roof panel.
box(housing,8.1,.16,29.6,0,9.24,14.8,bodyM);
box(housing,7.52,.12,25.6,0,9.36,14.8,roofM);
for(let z=2.3;z<27.7;z+=.72)box(housing,7.37,.038,.045,0,9.439,z,edgeM);
for(const x of [-3.77,3.77])box(housing,.045,.12,25.7,x,9.4,14.8,silver);
// Recessed front glazing: a proper opening, mullions and the small central grille.
box(housing,4.25,2.62,.045,0,7.165,-.025,glass);
for(const x of [-2.17,-.72,.72,2.17])box(housing,.065,2.75,.11,x,7.165,-.08,edgeM);
for(const y of [5.8,6.76,8.53])box(housing,4.4,.065,.11,0,y,-.08,edgeM);
box(housing,.68,.68,.1,0,7.45,-.1,silver);for(let y=7.15;y<7.77;y+=.07)box(housing,.59,.025,.025,0,y,-.165,edgeM);
// Restrained side and front lettering; branding stays on the solid lower fascia.
function label(text,w,h){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#f3eee0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 68px Georgia';ctx.fillText(text,512,65,990);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide}));}
const frontLabel=label('LIFT CO.',1.4,.2);frontLabel.position.set(0,5.28,-.09);frontLabel.rotation.y=Math.PI;housing.add(frontLabel);
for(const side of [-1,1]){const text=label(name.toUpperCase()+'  /  LIFT CO.',8.3,.14),p=cross.getPoint(.055),t=cross.getTangent(.055).normalize(),normal=new T.Vector3(side*t.y,-t.x,0),up=new T.Vector3(side*t.x,t.y,0);text.position.set(side*p.x,p.y,15).addScaledVector(normal,.035);text.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,0,-side),up,normal));housing.add(text);}
return {root:housing,supports,setColor(value){bodyM.color.set(value);sideColors.forEach(m=>m.color.set(value));}};
}};
