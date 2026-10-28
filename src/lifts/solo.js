// Approved Solo cabin and single-track carriage, extracted for structure studies.
// Cabin floor is y=.18; the running rope is trolleyY + rig.trackY.
window.LiftCoSolo={createFactory(T){
const definition={id:'S1',name:'Solo',family:0,length:4.5,width:2.05,height:3.15,sill:.95,chamfer:.16,color:0xc84b37,roof:0x3d4848,trim:0x263a3b,tint:0x32494c,arm:0xe0dfce,armWidth:.38,armBend:.9,style:'solo',description:'A longer Solo: the same narrow red front, stacked end windows and single ivory plate arm, with an extended cabin along the cable and an extra side-window bay.'};
const materials={},geometries=new Map();function mat(key,color,roughness=.7,metalness=0){return materials[key]||(materials[key]=new T.MeshStandardMaterial({color,roughness,metalness}));}function geo(key,make){if(!geometries.has(key))geometries.set(key,make());return geometries.get(key);}
const steel=mat('steel',0x8f9d9e,.43,.65),dark=mat('dark',0x303e42,.56,.35),rubber=mat('rubber',0x273235,.9),floorM=mat('floor',0x535e5b,.95),cream=mat('cream',0xeee8d8),snow=mat('snow',0xf1efe5),deck=mat('deck',0xb8bcae),wood=mat('wood',0x91735b),blue=mat('blue',0x59717a),gold=mat('gold',0xc59c58);
function mesh(parent,geometry,material,x=0,y=0,z=0){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
function box(parent,w,h,d,x,y,z,material){return mesh(parent,geo('b'+[w,h,d],()=>new T.BoxGeometry(w,h,d)),material,x,y,z);}
function bar(parent,a,b,r,material){const p=new T.Vector3(...a),q=new T.Vector3(...b),delta=q.clone().sub(p),m=mesh(parent,geo('c'+r+','+delta.length().toFixed(4),()=>new T.CylinderGeometry(r,r,delta.length(),8)),material);m.position.copy(p).add(q).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
function tube(parent,points,r,material){return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal'),60,r,8,false),material);}
function face(parent,points,material){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return mesh(parent,g,material);}
function outline(w,l,c,y){return[[-w/2+c,y,-l/2],[w/2-c,y,-l/2],[w/2,y,-l/2+c],[w/2,y,l/2-c],[w/2-c,y,l/2],[-w/2+c,y,l/2],[-w/2,y,l/2-c],[-w/2,y,-l/2+c]];}
function shell(parent,rings,material,skipSides=false){const vertices=rings.flat(2),indices=[];for(let row=0;row<rings.length-1;row++)for(let k=0;k<8;k++){if(skipSides&&(k===2||k===6))continue;const a=row*8+k,b=row*8+(k+1)%8;indices.push(a,b,a+8,b,b+8,a+8);}const top=(rings.length-1)*8;for(let i=1;i<7;i++){indices.push(0,i+1,i);if(!skipSides)indices.push(top,top+i,top+i+1);}for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return mesh(parent,geometry,material);}
function textPlane(parent,text,w,h,x,y,z,angle,color='#eee9da',background=null){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=128;const c=canvas.getContext('2d');if(background){c.fillStyle=background;c.fillRect(0,0,768,128);}c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.font='46px Georgia';c.fillText(text,384,65,730);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:!background,side:T.DoubleSide,depthWrite:false}));m.position.set(x,y,z);m.rotation.y=angle;parent.add(m);return m;}
function passenger(g,x,z,i){const p=new T.Group();p.position.set(x,.18,z);g.add(p);const colors=[0xb7644b,0xd0a34d,0x627f75,0x60778b,0x91846d],coat=mat('coat'+i%5,colors[i%5]),pants=mat('pants',0x3b4952),skin=mat('skin',0xe0b997);
 for(const side of [-1,1]){box(p,.14,.73,.17,side*.13,.47,0,pants);box(p,.18,.13,.3,side*.13,.08,.06,dark);bar(p,[side*.3,1.29,0],[side*.34,.85,.08],.085,coat);}box(p,.48,.62,.32,0,1.15,0,coat);mesh(p,geo('head',()=>new T.SphereGeometry(.17,12,8)),skin,0,1.65,0);mesh(p,geo('hat',()=>new T.SphereGeometry(.18,12,8,0,Math.PI*2,0,Math.PI*.53)),mat('hat'+i%5,colors[(i+2)%5]),0,1.7,0);return p;}
// The support rope sits below the wheel grooves. Two haul ropes are gripped
// by paired attachments on the carriage cross-brace.
const SOLO_RIG={trackX:0,wheelY:-.12,wheelRadius:.16,trackRadius:.033,frameY:.23,haulY:.18,haulRadius:.022,haulOffsets:[-.85,.85]};
SOLO_RIG.trackY=SOLO_RIG.wheelY-SOLO_RIG.wheelRadius-SOLO_RIG.trackRadius;
function makeCabin(def=definition,number=1,showPassengers=false){
 const g=new T.Group(),body=new T.Group();g.add(body);const {width:w,length:l,height:h,sill,chamfer:c}=def,paint=mat('paint'+def.id,def.color,.46,.18),roofMat=mat('roof'+def.id,def.roof,.55,.25),trim=mat('trim'+def.id,def.trim,.5,.4),windowTrim=def.style==='heritage'?cream:trim;
 const glass=new T.MeshStandardMaterial({color:def.tint,transparent:true,opacity:def.style==='glacier'?.62:def.family===1?.78:.68,roughness:.2,metalness:.12,side:T.DoubleSide,depthWrite:false});
 const doorWidth=def.family?1.42:1.07,doorHalf=doorWidth/2;
 const bottom=outline(w*.94,l*.97,c,.14),waist=outline(w,l,c,sill),top=outline(w*(def.family?.97:1),l*(def.style==='massif'?.945:.99),c,h-.18);
 const paintDouble=paint.clone();paintDouble.side=T.DoubleSide;
 shell(body,[bottom,waist],paintDouble,true);shell(body,[outline(w*.94,l*.97,c,.04),outline(w*.94,l*.97,c,.16)],trim);
 box(body,w*.91,.1,l*.94,0,.13,0,floorM);
 // Two long sides, each with an actual sliding-door aperture.
 for(const side of [-1,1]){
  const x=side*w/2,zLimit=l/2-c;
  for(const [a,b]of [[-zLimit,-doorHalf],[doorHalf,zLimit]]){
   face(body,[[side*w*.47,.15,a],[side*w*.47,.15,b],[x,sill,b],[x,sill,a]],paintDouble);
   const divisions=def.style==='solo'?Math.max(1,Math.ceil((b-a)/1.35)):def.style==='heritage'?2:def.family?Math.max(1,Math.round((b-a)/1.25)):1;
   for(let i=0;i<divisions;i++){
    const z0=a+(b-a)*i/divisions,z1=a+(b-a)*(i+1)/divisions,tx=side*w*(def.family?.485:.5);
    face(body,[[x,sill,z0],[x,sill,z1],[tx,h-.18,z1],[tx,h-.18,z0]],glass);
    bar(body,[x,sill,z0],[tx,h-.18,z0],def.style==='heritage'?.038:.025,windowTrim);
   }
   bar(body,[x,sill,a],[x,sill,b],.035,windowTrim);bar(body,[side*w*(def.family?.485:.5),h-.18,a],[side*w*(def.family?.485:.5),h-.18,b],.035,windowTrim);
   bar(body,[x,sill,b],[side*w*(def.family?.485:.5),h-.18,b],.028,windowTrim);
   if(def.style==='alpine')box(body,.025,.11,b-a,x+side*.012,sill-.16,(a+b)/2,cream);
   if(def.style==='heritage')for(let z=a+.12;z<b-.08;z+=.18)box(body,.022,.37,.022,x+side*.01,.4,z,mat('rib',0xa76f55));
  }
 }
 // The short ends and corner panes wrap around the long rectangular body.
 for(const k of [0,1,3,4,5,7]){
  const next=(k+1)%8,a=waist[k],b=waist[next],ta=top[k],tb=top[next];
  const divisions=1;
  for(let i=0;i<divisions;i++){const mix=(a,b,t)=>a.map((v,j)=>v+(b[j]-v)*t),p=mix(a,b,i/divisions),q=mix(a,b,(i+1)/divisions),r=mix(ta,tb,(i+1)/divisions),s=mix(ta,tb,i/divisions);face(body,[p,q,r,s],glass);bar(body,p,s,def.family?.025:.033,windowTrim);}
  bar(body,a,b,.032,windowTrim);bar(body,ta,tb,.035,windowTrim);bar(body,b,tb,.03,windowTrim);
 }
 // Coloured perimeter: more pronounced on the panoramic reference family.
 for(let k=0;k<8;k++){const next=(k+1)%8;if(def.family&&[1,3,5,7].includes(k))bar(body,bottom[k],top[k],def.style==='glacier'?.07:.052,def.style==='glacier'?blue:paint);}
 shell(body,[top,outline(w*.99,l*.985,c,h+.01),outline(w*.95,l*.96,c,h+.13)],roofMat);
 if(def.style==='heritage')shell(body,[outline(w,l*.99,c,h-.24),outline(w,l*.99,c,h-.13)],cream);
 for(let k=0;k<8;k++)bar(body,top[k],top[(k+1)%8],def.style==='solo'?.06:.045,def.style==='traverse'?blue:paint);
 if(def.style==='massif')for(const side of [-1,1])for(const end of [-1,1])for(const offset of [-.055,.055])bar(body,[side*w/2,sill,end*l*.26+offset],[side*w*.485,h-.18,end*l*.26+offset],.032,trim);
 const doors=[];
 for(const side of [-1,1])for(const direction of [-1,1]){
  const door=new T.Group();door.position.set(side*(w/2+.035),0,direction*doorWidth/4);body.add(door);const half=doorWidth/4;
  box(door,.045,sill-.15,doorWidth/2-.025,0,(sill+.15)/2,0,paint);
  face(door,[[0,sill,-half+.015],[0,sill,half-.015],[0,h-.2,half-.015],[0,h-.2,-half+.015]],glass);
  for(const z of [-half,half])bar(door,[0,.16,z],[0,h-.2,z],.025,windowTrim);
  bar(door,[0,sill,-half],[0,sill,half],.025,windowTrim);bar(door,[0,h-.2,-half],[0,h-.2,half],.026,windowTrim);bar(door,[side*.05,1.1,-direction*(half-.09)],[side*.05,1.35,-direction*(half-.09)],.019,steel);
  doors.push({g:door,closed:direction*doorWidth/4,open:direction*(doorWidth*.75+.045)});
 }
 for(const side of [-1,1]){box(body,.08,.11,doorWidth*2.1,side*(w/2+.08),h-.11,0,trim);textPlane(body,def.style==='heritage'?'LIFT CO.':'LIFT CO.',Math.min(1.65,l*.32),.26,side*(w/2+.025),Math.max(.3,sill*.52),l*.31,side*Math.PI/2,def.style==='glacier'?'#3b5860':'#eee8d8');}
 for(const end of [-1,1]){const bumper=outline(w*.98,l*.99,c,.08);bar(body,[-w*.38,.04,end*l*.49],[w*.38,.04,end*l*.49],.065,rubber);if(!def.family){mesh(body,geo('badge',()=>{const a=new T.CylinderGeometry(.085,.085,.015,20);a.rotateX(Math.PI/2);return a;}),cream,0,sill*.55,end*l*.498);}else{for(const side of [-1,1])box(body,.2,.055,.025,side*w*.31,.25,end*l*.495,cream);}}
 // Roof equipment and the tall, bent suspension. The trolley always runs along Z.
 box(body,w*.64,.16,l*.48,0,h+.18,0,dark);
 const vents=def.family?7:4;for(let i=0;i<vents;i++)box(body,w*.43,.06,.09,0,h+.3,(i-(vents-1)/2)*.17,steel);
 const suspension=new T.Group();g.add(suspension);const trolleyY=h+4.05;
 // A single solid plate in the front-view XY plane. Its root is offset across
 // the roof; its upper end hooks onto the outside of one trolley beam.
 const armMaterial=mat('arm'+def.id,def.arm,.54,.28),anchor=w*.27,armMountX=SOLO_RIG.trackX+.4;
 const centreline=new T.CatmullRomCurve3([
  new T.Vector3(anchor,h+.28,0),new T.Vector3(Math.max(def.armBend,armMountX+.28),h+1.08,0),
  new T.Vector3(armMountX+.32,h+2.05,0),new T.Vector3(armMountX+.18,trolleyY-.55,0),new T.Vector3(armMountX,trolleyY+SOLO_RIG.frameY,0)
 ],false,'centripetal');
 const left=[],right=[];
 for(let i=0;i<=32;i++){const t=i/32,p=centreline.getPoint(t),half=def.armWidth*(1-.28*t)/2;left.push([p.x-half,p.y]);right.push([p.x+half,p.y]);}
 const shape=new T.Shape();shape.moveTo(...left[0]);for(const p of left.slice(1))shape.lineTo(...p);for(const p of right.reverse())shape.lineTo(...p);shape.closePath();
 const bladeGeometry=new T.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2,steps:1});bladeGeometry.translate(0,0,-.08);mesh(suspension,bladeGeometry,armMaterial);
 const washerGeometry=geo('arm-washer',()=>{const a=new T.CylinderGeometry(.065,.065,.023,16);a.rotateX(Math.PI/2);return a;}),boltGeometry=geo('arm-bolt',()=>{const a=new T.CylinderGeometry(.031,.031,.035,6);a.rotateX(Math.PI/2);return a;});
 for(const t of [.08,.25,.43,.61,.79,.94]){const p=centreline.getPoint(t);for(const front of [-1,1]){mesh(suspension,washerGeometry,steel,p.x,p.y,front*.112);mesh(suspension,boltGeometry,rubber,p.x,p.y,front*.133);}}
 box(suspension,w*.78,.15,1.5,0,h+.23,0,dark);box(suspension,.62,.15,.75,anchor,h+.3,0,armMaterial);
 const pivot=mesh(suspension,geo('arm-pivot',()=>{const a=new T.CylinderGeometry(.16,.16,.23,24);a.rotateX(Math.PI/2);return a;}),steel,anchor,h+.36,0);
 for(const front of [-1,1])mesh(suspension,boltGeometry,rubber,anchor,h+.36,front*.14);
 // One strong end-window crossbar, matching the stacked panes in the new photo.
 for(const end of [-1,1]){const y=sill+(h-.18-sill)*.42,z=end*(l/2*(1-.01*.42));bar(body,[-w/2+c,y,z],[w/2-c,y,z],.035,trim);}
 if(def.style==='traverse')for(const end of [-1,1])box(body,w*.82,.11,.03,0,sill-.17,end*l*.495,blue);
 const trolley=new T.Group();trolley.position.y=trolleyY;suspension.add(trolley);
 const originalLength=def.family?3.2:2.65,originalCount=def.family?8:6;
 // Preserve the original wheel spacing and add one complete axle at each end.
 const wheelPitch=(originalLength-.3)/(originalCount-1),trolleyLength=originalLength+2*wheelPitch;
 const wheels=[],rig=SOLO_RIG;
 // A slim continuous beam surrounds the axles, exposing both upper and lower
 // wheel rims. Wheel centres and the rope contact datum remain unchanged.
 const count=originalCount+2;
 const webBottom=rig.wheelY-.095,webTop=rig.wheelY+.095,webHeight=webTop-webBottom;
 for(const side of [-1,1])box(trolley,.09,webHeight,trolleyLength,side*.16,(webTop+webBottom)/2,0,steel);
 for(let i=0;i<count;i++){
  const z=(i-(count-1)/2)*(trolleyLength-.3)/(count-1);
  const wheel=mesh(trolley,geo('solo-grooved-wheel',()=>{
   const profile=[[.06,-.075],[.16,-.075],[.19,-.055],[.19,-.035],[.16,-.022],[.16,.022],[.19,.035],[.19,.055],[.16,.075],[.06,.075]];
   const geometry=new T.LatheGeometry(profile.map(([r,x])=>new T.Vector2(r,x)),24);geometry.rotateZ(Math.PI/2);return geometry;
  }),rubber,0,rig.wheelY,z);
  mesh(wheel,geo('solo-wheelhub',()=>{const a=new T.CylinderGeometry(.085,.085,.17,12);a.rotateZ(Math.PI/2);return a;}),steel);
  for(const side of [-1,1]){
   const cap=mesh(trolley,geo('solo-recessed-axle-cap',()=>{const a=new T.CylinderGeometry(.044,.044,.018,12);a.rotateZ(Math.PI/2);return a;}),dark,side*.213,rig.wheelY,z);
   cap.name='Flush carriage axle cap';
  }
  wheels.push(wheel);
 }
 for(const z of [-originalLength*.36,originalLength*.36]){
  box(trolley,.78,.13,.14,0,rig.frameY,z,steel);
  const bridgeTop=rig.frameY-.065;
  for(const side of [-1,1])box(trolley,.08,bridgeTop-webTop,.14,side*.2,(bridgeTop+webTop)/2,z,steel);
 }
 // The hanger attaches to the outer side of one running beam. The upper arm
 // stays outboard of the support rope and wheels before hooking into this lug.
 const armLug=new T.Group();armLug.name='Offset side-mounted hanger attachment';trolley.add(armLug);
 for(const front of [-1,1]){
  const lugTop=rig.frameY+.2;
  box(armLug,.49,lugTop-rig.wheelY,.06,armMountX-.055,(lugTop+rig.wheelY)/2,front*.17,steel);
  mesh(armLug,boltGeometry,rubber,armMountX,rig.frameY,front*.26);
 }
 mesh(armLug,geo('hanger-side-pin',()=>{const a=new T.CylinderGeometry(.105,.105,.47,20);a.rotateX(Math.PI/2);return a;}),steel,armMountX,rig.frameY,0);
 // Low split collars bolt into a compact front cross-brace, above the roller
 // rims. The side gussets continue the running beams; there is no overhead hook.
 const gripZ=-originalLength*.36,headY=rig.haulY+.12,haulGrips=[];
 box(trolley,1.95,.1,.32,0,headY,gripZ,steel);
 for(const side of [-1,1]){
  const profile=new T.Shape();profile.moveTo(gripZ-.24,webBottom);profile.lineTo(gripZ+.24,webBottom);profile.lineTo(gripZ+.24,webTop);profile.lineTo(gripZ+.10,headY+.05);profile.lineTo(gripZ-.24,headY+.05);profile.closePath();
  const geometry=new T.ExtrudeGeometry(profile,{depth:.07,bevelEnabled:false});
  // Shape coordinates are longitudinal Z / height Y; extrude along the axle X.
  geometry.applyMatrix4(new T.Matrix4().set(0,0,-1,side*.16+.035,0,1,0,0,1,0,0,0,0,0,0,1));
  mesh(trolley,geometry,steel);
  for(const z of [gripZ-.15,gripZ+.12])mesh(trolley,geo('nose-bolt',()=>{const g=new T.CylinderGeometry(.035,.035,.02,6);g.rotateZ(Math.PI/2);return g;}),dark,side*.205,headY-.02,z);
 }
 for(const offset of rig.haulOffsets){
  const hitch=new T.Group();hitch.name='Flush haul collar on front cross-brace';hitch.position.set(offset,0,gripZ);trolley.add(hitch);
  const stemHeight=.08,stem=box(hitch,.14,stemHeight,.22,0,headY,0,steel),bridge=box(hitch,.19,.05,.36,0,rig.haulY+.12,0,steel);
  for(const side of [-1,1]){
   box(hitch,.028,.095,.35,side*.031,rig.haulY+.0595,0,dark);
   mesh(hitch,geo('haul-clamp-bolt',()=>{const a=new T.CylinderGeometry(.025,.025,.16,6);a.rotateZ(Math.PI/2);return a;}),gold,0,rig.haulY+.11,.12*side);
  }
  haulGrips.push({g:hitch,stem,bridge,stemHeight,stemY:stem.position.y});
 }
 textPlane(trolley,String(number).padStart(2,'0'),.26,.15,.24,rig.wheelY,.65,Math.PI/2,'#354d3e','#eae5d5');
 // The interior remains visible through the glass and the real door opening.
 for(const side of [-1,1]){bar(body,[side*w*.37,.18,-l*.36],[side*w*.37,1.3,-l*.36],.025,steel);bar(body,[side*w*.37,1.3,-l*.36],[side*w*.37,1.3,l*.36],.025,steel);}
 for(const z of [-l*.3,l*.3])bar(body,[-w*.34,h-.33,z],[w*.34,h-.33,z],.025,steel);
 // Folded end perches preserve the twelve standing positions and door aisle.
 const interior=new T.Group();interior.name='Solo interior';body.add(interior);
 for(const end of [-1,1])for(const x of [-.38,.38]){box(interior,.62,.46,.075,x,.77,end*(l/2-.16),blue);box(interior,.62,.075,.20,x,.48,end*(l/2-.21),rubber);for(const dx of [-.24,.24])bar(interior,[x+dx,.25,end*(l/2-.14)],[x+dx,1.08,end*(l/2-.14)],.018,steel);}
 for(let z=-l*.36;z<=l*.36;z+=.16)box(interior,w*.82,.008,.015,0,.185,z,rubber);
 for(const x of [-w*.28,w*.28])box(interior,.035,.025,l*.64,x,h-.195,0,cream);
 // Four shared material batches keep the extra interior detail inexpensive.
 interior.updateMatrixWorld(true);const inverse=interior.matrixWorld.clone().invert(),parts=new Map();interior.traverse(o=>{if(o.isMesh){if(!parts.has(o.material))parts.set(o.material,[]);parts.get(o.material).push(o);}});interior.clear();
 for(const [material,nodes]of parts){const geometry=geo('interior:'+def.id+':'+material.uuid,()=>{const positions=[],normals=[];for(const node of nodes){const g=(node.geometry.index?node.geometry.toNonIndexed():node.geometry.clone()).applyMatrix4(inverse.clone().multiply(node.matrixWorld));positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);g.dispose();}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));return g;});mesh(interior,geometry,material);}
 const people=new T.Group();body.add(people);const rows=def.family?4:2;for(let i=0;i<rows;i++)for(const side of [-1,1])passenger(people,side*w*.21,(i-(rows-1)/2)*(def.family?.9:.95),(i*2+(side+1)/2));people.visible=showPassengers;
 return{g,body,suspension,trolley,trolleyY,doors,people,wheels,haulGrips,def};
}
return {create:makeCabin,definition,rig:SOLO_RIG,materials,geometries};
}};
