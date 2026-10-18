// Rochebrune-inspired twin traction: lower drive, upper return/tension.
// Dimensions are fitted to Solo. Circles and their tangent leads share one path.
window.LiftCoSoloMachinery={create(T,{parent,length,lane=5.1,route,haul:haulProfile,guides=[],slope,rig,baseGround,topGround}){
 const root=new T.Group(),fixed=new T.Group(),ropes=new T.Group(),markers=new T.Group();root.name='Solo drive and cable circuits';root.add(fixed,ropes,markers);parent.add(root);markers.visible=false;
 const V=(x,y,z)=>new T.Vector3(x,y,z),Z=V(0,0,1),X=V(1,0,0),Y=V(0,1,0),cache=new Map(),rotors=[],circuits=[],contactArcs=[],brakes=[];
 const mat=(color,r=.65,m=.25)=>new T.MeshStandardMaterial({color,roughness:r,metalness:m});
 const M={blue:mat(0x3c7289),steel:mat(0x71838b,.5,.6),dark:mat(0x354243),yellow:mat(0xd5aa3b,.5,.35),red:mat(0xa84e3f),silver:mat(0xb0b9b4,.4,.6),rubber:mat(0x263333,.85),concrete:mat(0xaeb4aa,1,0),haulA:mat(0x329b91,.5,.4),haulB:mat(0x617da3,.5,.4),tension:mat(0xc77e4d,.6,.3)};
 const geo=(key,make)=>{if(!cache.has(key))cache.set(key,make());return cache.get(key);};
 function mesh(group,geometry,material,p=V(0,0,0)){const m=new T.Mesh(geometry,material);m.position.copy(p);m.castShadow=m.receiveShadow=true;group.add(m);return m;}
 function box(group,w,h,d,p,material=M.steel){return mesh(group,geo('box'+[w,h,d],()=>new T.BoxGeometry(w,h,d)),material,p);}
 function rod(group,a,b,r,material=M.silver){const delta=b.clone().sub(a),m=mesh(group,geo('rod'+r+','+delta.length().toFixed(5),()=>new T.CylinderGeometry(r,r,delta.length(),10)),material,a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(Y,delta.normalize());return m;}
 function beam(a,b,w=.14,material=M.steel){const d=b.clone().sub(a),m=box(fixed,w,w,d.length(),a.clone().add(b).multiplyScalar(.5),material);m.quaternion.setFromUnitVectors(Z,d.normalize());return m;}
 function hose(points,r=.04){return mesh(fixed,new T.TubeGeometry(new T.CatmullRomCurve3(points),32,r,6,false),M.dark);}
 function batch(group){group.updateMatrixWorld(true);const inv=group.matrixWorld.clone().invert(),batches=new Map();group.traverse(o=>{if(!o.isMesh)return;let b=batches.get(o.material);if(!b)batches.set(o.material,b={p:[],n:[]});const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(inv.clone().multiply(o.matrixWorld));b.p.push(...g.attributes.position.array);b.n.push(...g.attributes.normal.array);g.dispose();});group.clear();for(const [material,b]of batches){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));mesh(group,g,material);}}
 const line=(a,b)=>({length:a.distanceTo(b),at:t=>a.clone().lerp(b,t),kind:'line'});
 function arc(center,normal,start,angle){const radius=start.length();return{kind:'arc',center,normal,radius,start,angle,length:Math.abs(angle)*radius,at:t=>center.clone().add(start.clone().applyAxisAngle(normal,angle*t))};}
 const reverse=p=>({...p,at:t=>p.at(1-t)});
 // Circular fillets between straight tangent sections. No free-space spline bends.
 function fillet(points,radius){
  const corners=[];
  for(let i=1;i<points.length-1;i++){
   const p=points[i],u=points[i-1].clone().sub(p).normalize(),v=points[i+1].clone().sub(p).normalize(),a=Math.acos(T.MathUtils.clamp(u.dot(v),-1,1));
   const trim=Math.min(radius/Math.tan(a/2),points[i-1].distanceTo(p)*.32,points[i+1].distanceTo(p)*.32),r=trim*Math.tan(a/2),center=p.clone().addScaledVector(u.clone().add(v).normalize(),r/Math.sin(a/2)),first=p.clone().addScaledVector(u,trim),last=p.clone().addScaledVector(v,trim),start=first.clone().sub(center),end=last.clone().sub(center),normal=start.clone().cross(end).normalize();
   corners.push({first,last,part:arc(center,normal,start,Math.acos(T.MathUtils.clamp(start.dot(end)/(r*r),-1,1)))});
  }
  const parts=[];let previous=points[0];for(const c of corners){parts.push(line(previous,c.first),c.part);previous=c.last;}parts.push(line(previous,points.at(-1)));return parts;
 }
 function path(parts,material,kind,radius=rig.haulRadius,travel=false){
  const ends=[];let total=0;for(const p of parts){total+=p.length;ends.push(total);}
  function point(distance,out=new T.Vector3()){const d=T.MathUtils.clamp(distance,0,total);let i=ends.findIndex(e=>d<=e);if(i<0)i=ends.length-1;const start=i?ends[i-1]:0;return out.copy(parts[i].at((d-start)/Math.max(1e-9,parts[i].length)));}
  // Build each tangent/arc separately so all hardware contacts are sampled exactly.
  for(const p of parts){class Segment extends T.Curve{getPoint(t,out=new T.Vector3()){return out.copy(p.at(t));}}const count=p.kind==='span'?Math.max(2,Math.ceil(p.length/.9)):p.kind==='guide'?Math.max(2,Math.ceil(p.length/.12)):Math.max(2,Math.ceil(p.length*(p.kind==='arc'?14:3)));const m=mesh(ropes,new T.TubeGeometry(new Segment(),count,radius,6,false),material);m.userData.ropeKind=kind;}
  const dots=[];if(travel)for(let i=0;i<8;i++){const dot=mesh(markers,geo('travel-sleeve',()=>new T.SphereGeometry(.065,8,6)),material);dots.push(dot);}
  const result={parts,length:total,point,dots};if(travel)circuits.push(result);return result;
 }
 // Grooved wheels have perforated webs, flanges, hubs, axles and bearing frames.
 function wheel(center,normal,radius,{grooves=[0],direction=1,bearingSide=1,name='Deflection sheave'}={}){
  const mount=new T.Group(),rotor=new T.Group();mount.position.copy(center);mount.quaternion.setFromUnitVectors(Z,normal);mount.add(rotor);root.add(mount);mount.name=name;
  for(const level of grooves){
   const profile=[[radius-.15,-.09],[radius+.035,-.09],[radius+.035,-.045],[radius-rig.haulRadius,-.018],[radius-rig.haulRadius,.018],[radius+.035,.045],[radius+.035,.09],[radius-.15,.09]].map(([r,z])=>new T.Vector2(r,z));
   const rim=geo('rim'+radius,()=>{const g=new T.LatheGeometry(profile,64);g.rotateX(Math.PI/2);return g;});mesh(rotor,rim,M.yellow,V(0,0,level));
  }
  if(grooves.length>1){const lo=Math.min(...grooves)-.09,hi=Math.max(...grooves)+.09,profile=[[radius-.22,lo],[radius-.14,lo],[radius-.14,hi],[radius-.22,hi],[radius-.22,lo]].map(([r,z])=>new T.Vector2(r,z)),drum=new T.LatheGeometry(profile,64);drum.rotateX(Math.PI/2);mesh(rotor,drum,M.yellow);}
  const web=geo('web'+radius,()=>{const s=new T.Shape();s.absarc(0,0,radius-.13,0,Math.PI*2,false);for(let i=0;i<8;i++){const a=i*Math.PI/4,hole=new T.Path();hole.absarc(Math.cos(a)*radius*.58,Math.sin(a)*radius*.58,radius*.12,0,Math.PI*2,true);s.holes.push(hole);}const g=new T.ExtrudeGeometry(s,{depth:.1,bevelEnabled:false,curveSegments:16});g.translate(0,0,-.05);return g;});mesh(rotor,web,M.yellow);
  rod(rotor,V(0,0,-.2),V(0,0,.2),Math.min(.25,radius*.22));
  for(let i=0;i<8;i++){const a=i*Math.PI/4;box(rotor,.05,.05,.05,V(Math.cos(a)*radius*.24,Math.sin(a)*radius*.24,.16),M.dark);}
  box(rotor,.07,.12,.04,V(radius*.8,0,.105),M.silver);batch(rotor);
  for(const distance of [.34,.58]){box(mount,.48,.45,.16,V(0,0,bearingSide*distance),M.blue);rod(mount,V(0,0,bearingSide*.2),V(0,0,bearingSide*.72),.1);}
  rotors.push({rotor,radius,direction,name});return{mount,rotor,center,normal,radius,bearingSide};
 }
 function contactWheel(part,direction,name){contactArcs.push(part);const bearingSide=Math.abs(part.normal.x)>.1?Math.sign(part.normal.x*part.center.x)||1:1;return wheel(part.center,part.normal,part.radius,{direction,name,bearingSide});}
 function curveWheelSupports(w){
  const floor=(w.center.z>length/2?topGround:baseGround)+.6;
  // A cantilever on the outer axle keeps its column out of both rope grooves.
  // Carry the inlet axle beyond the other incoming strand before dropping a column.
  let reach=w.radius+.8;
  if(w.center.z<0&&w.center.z>-5&&Math.abs(w.normal.x)>.8)reach=Math.max(reach,(lane+Math.max(...(rig.haulOffsets||[-.85,.85]).map(Math.abs))+.4-Math.abs(w.center.x))/Math.abs(w.normal.x));
  const p=w.center.clone().addScaledVector(w.normal,w.bearingSide*.72),q=w.center.clone().addScaledVector(w.normal,w.bearingSide*reach);
  rod(fixed,p,q,.1);beam(q,V(q.x,floor,q.z),.14,M.blue);box(fixed,.45,.16,.45,V(q.x,floor+.08,q.z),M.steel);
 }

 const offsets=rig.haulOffsets||[-.85,.85],gap=rig.haulY-rig.trackY,haul=haulProfile|| (s=>route(s)+gap*Math.hypot(1,slope(s))),driveR=2.3,driveZ=-9.3,driveY=baseGround+.6+1.85,grooveLevels=[-.36,.36],returnY=topGround+.6+1.5;
 const drive=wheel(V(0,driveY,driveZ),Y,driveR,{grooves:grooveLevels,bearingSide:-1,name:'Double-groove drive bullwheel'});
 // Gearbox, electric motor and connected fast/slow shafts.
 box(fixed,1.7,.32,1.8,V(0,baseGround+.76,driveZ),M.concrete);
 box(fixed,1.4,1.0,1.3,V(0,baseGround+1.42,driveZ),M.blue);
 rod(fixed,V(0,baseGround+1.7,driveZ),V(0,driveY,driveZ),.19);
 const motorCenter=V(3.0,baseGround+1.35,driveZ),motor=new T.Group();motor.name='Main electric motor';root.add(motor);
 rod(motor,motorCenter.clone().add(V(-.9,0,0)),motorCenter.clone().add(V(.9,0,0)),.47,M.blue);
 for(let i=0;i<12;i++)rod(motor,V(2.2+i*.14,motorCenter.y,driveZ),V(2.23+i*.14,motorCenter.y,driveZ),.51,M.blue);
 box(motor,1.1,.55,.75,motorCenter.clone().add(V(.2,.65,0)),M.blue);
 box(motor,2.0,.22,1.15,motorCenter.clone().add(V(0,-.48,0)),M.steel);
 const fastShaft=new T.Group();fastShaft.position.set(1.55,motorCenter.y,driveZ);root.add(fastShaft);rod(fastShaft,V(-.85,0,0),V(.85,0,0),.09);
 for(const x of [-.3,.3]){rod(fastShaft,V(x-.06,0,0),V(x+.06,0,0),.28,M.yellow);box(fastShaft,.1,.09,.15,V(x,.22,0),M.red);}batch(fastShaft);batch(motor);
 // Two rim brakes and a guarded ring gear; the service brake is on the fast shaft.
 for(const side of [-1,1]){
  const brake=new T.Group();brake.position.set(side*(driveR-.04),driveY-.72,driveZ);root.add(brake);box(brake,.36,.3,.6,V(0,0,0),M.red);box(brake,.2,.12,.36,V(0,.19,0),M.dark);brakes.push(brake);
  box(fixed,.34,.28,.5,V(1.55,motorCenter.y,driveZ+side*.3),M.red);
 }
 for(let i=0;i<64;i++){const a=i*Math.PI/32;const tooth=box(drive.rotor,.12,.1,.1,V(Math.cos(a)*(driveR-.18),Math.sin(a)*(driveR-.18),-.48),M.silver);tooth.rotation.z=a;}
 batch(drive.rotor);
 // Standby hydraulic pinion and a compact V12-shaped power unit, not a second main drive.
 box(fixed,.6,.45,.7,V(-driveR+.23,driveY-.8,driveZ),M.blue);
 rod(fixed,V(-driveR+.23,driveY-.68,driveZ),V(-driveR+.23,driveY-.4,driveZ),.15,M.silver);
 box(fixed,1.4,.55,2,V(-3.25,baseGround+.98,-7.2),M.blue);
 for(const side of [-1,1])for(let i=0;i<6;i++){const a=V(-3.25,baseGround+1.15,-7.95+i*.29),b=a.clone().add(V(side*.43,.45,0));rod(fixed,a,b,.11,M.steel);}
 box(fixed,1.4,1.0,.24,V(-3.25,baseGround+1.25,-8.35),M.dark);
 box(fixed,1.2,.9,1.3,V(-3.1,baseGround+1.05,-4.9),M.blue);
 for(const side of [-1,1]){rod(fixed,V(-3.6,baseGround+1.7,-4.9+side*.2),V(-2.8,baseGround+1.7,-4.9+side*.2),.13,M.blue);}
 for(const side of [-1,1])hose([V(-3.1,baseGround+1.7,-4.9+side*.1),V(-2.7,baseGround+1.9,-5.5+side*.1),V(-2.7,baseGround+1.9,driveZ+side*.1),V(-driveR+.23,driveY-.8,driveZ+side*.1)]);
 hose([V(-3.25,baseGround+1.3,-6.3),V(-3.8,baseGround+.8,-5.9),V(-3.5,baseGround+1.1,-4.9)],.05);
 box(fixed,.9,2,.6,V(6.9,baseGround+1.6,-10),M.steel);
 box(fixed,.62,.38,.05,V(6.9,baseGround+2,-9.68),M.dark);
 for(const side of [-1,1])box(fixed,.09,.09,.06,V(6.9+side*.17,baseGround+1.55,-9.67),side<0?M.red:M.blue);
 hose([V(3.2,baseGround+2.1,driveZ),V(4.7,baseGround+2.4,driveZ),V(6.9,baseGround+2.4,-9.7),V(6.9,baseGround+2.35,-10)],.035);
 // Drive guard cage, kept outside the running grooves.
 for(let i=0;i<20;i++){const a=i*Math.PI/10,p=V(Math.cos(a)*2.65,driveY+.5,driveZ+Math.sin(a)*2.65),q=V(Math.cos(a+Math.PI/10)*2.65,driveY+.5,driveZ+Math.sin(a+Math.PI/10)*2.65);rod(fixed,p,q,.035,M.red);if(i%2===0)rod(fixed,p,p.clone().add(V(0,-1.3,0)),.035,M.steel);}
 // Twin return wheels are staggered fore/aft and share a weighted carriage.
 const topEntries=[],returns=[],baseLeads=[];
 for(let k=0;k<2;k++){
  const offset=offsets[k],level=grooveLevels[k],zCenter=length+6.8+k*1.25,R=.95,beta=Math.atan(slope(length)),contactZ=zCenter-R*Math.sin(beta),centerY=haul(contactZ)-R*Math.cos(beta),planeZ=zCenter+R;
  const upperArcs=[];
  for(const side of [-1,1]){
   const c=V(side*lane+offset,centerY,zCenter),part=arc(c,X,V(0,R*Math.cos(beta),-R*Math.sin(beta)),Math.PI/2+beta);upperArcs.push(part);curveWheelSupports(contactWheel(part,side<0?1:-1,'Upper deflection '+(k+1)+' / '+(side<0?'left':'right')));
   // Cross above the carrying-rope sockets, then stagger the two descent planes
   // so the sheaves and their bearing shafts stay outside the other rope.
   const p=V(side*lane+offset,haul(-3),-3),q=V(side*lane+offset,haul(-4.35),-4.35),r=V(side*(k?4.15:3.5),haul(k?-6.9:-5.4)+level,k?-6.9:-5.4),s=V(side*driveR,driveY+level,k?-7.7:-6.8),t=V(side*driveR,driveY+level,driveZ),lead=fillet([p,q,r,s,t],.62);
   for(const bend of lead.filter(p=>p.kind==='arc'))curveWheelSupports(contactWheel(bend,side<0?-1:1,'Lower traction deflection'));
   baseLeads.push(lead);
  }
  const returnArc=arc(V(offset,returnY,planeZ),Z,V(-lane,0,0),Math.PI);returns.push(contactWheel(returnArc,1,'Staggered return '+(k+1)));topEntries.push(upperArcs);
  const leftEnd=upperArcs[0].at(1),rightEnd=upperArcs[1].at(1),leftTop=V(-lane+offset,returnY,planeZ),rightTop=V(lane+offset,returnY,planeZ);
  const span=(side,back=false)=>{
   const knots=[-3,...guides.flatMap(g=>[g.a,g.b]),length+3].sort((a,b)=>a-b),parts=[];
   for(let k=1;k<knots.length;k++){
    const a=knots[k-1],b=knots[k],guided=guides.some(g=>(a+b)/2>=g.a&&(a+b)/2<=g.b),samples=Math.max(2,Math.ceil((b-a)/(guided ? .1 : .5))),pts=Array.from({length:samples+1},(_,i)=>{const z=a+(b-a)*i/samples;return V(side*lane+offset,haul(z),z);}),distances=[0];
    for(let i=1;i<pts.length;i++)distances.push(distances.at(-1)+pts[i].distanceTo(pts[i-1]));const d=distances.at(-1);
    parts.push({kind:guided?'guide':'span',length:d,at:t=>{const target=t*d;let lo=0,hi=samples;while(hi-lo>1){const m=(lo+hi)>>1;if(distances[m]<=target)lo=m;else hi=m;}const u=T.MathUtils.clamp((target-distances[lo])/(distances[hi]-distances[lo]),0,1),z=pts[lo].z+(pts[hi].z-pts[lo].z)*u;return V(side*lane+offset,haul(z),z);}});
   }
   return back?parts.reverse().map(reverse):parts;
  };
  const leftLead=baseLeads[k*2],rightLead=baseLeads[k*2+1],driveArc=arc(V(0,driveY+level,driveZ),Y,V(driveR,0,0),Math.PI);
  const parts=[...span(-1),line(V(-lane+offset,haul(length+3),length+3),upperArcs[0].at(0)),upperArcs[0],line(leftEnd,leftTop),returnArc,line(rightTop,rightEnd),reverse(upperArcs[1]),line(upperArcs[1].at(0),V(lane+offset,haul(length+3),length+3)),...span(1,true),...rightLead,driveArc,...leftLead.slice().reverse().map(reverse)];
  path(parts,k?M.haulB:M.haulA,k?'haulB':'haulA',rig.haulRadius,true);
 }
 const planeMid=(returns[0].center.z+returns[1].center.z)/2;
 box(fixed,6.3,2.2,.65,V(0,returnY-.4,planeMid),M.concrete);
 for(const w of returns){
  const frameZ=w.center.z+.85;
  rod(fixed,w.center.clone().add(V(0,0,.72)),V(w.center.x,w.center.y,frameZ),.12);
  beam(V(-lane-.5,returnY+lane+.4,frameZ),V(lane+.5,returnY+lane+.4,frameZ),.23,M.blue);
  for(const side of [-1,1]){beam(V(side*(lane+.5),returnY-2,frameZ),V(side*(lane+.5),returnY+lane+.4,frameZ),.23,M.blue);beam(V(side*2.4,returnY+1.2,frameZ),V(w.center.x,w.center.y,frameZ),.18,M.blue);}
 }

 for(const side of [-1,1])for(const v of [length+5.8,length+10.5])beam(V(side*6.3,topGround-4,v),V(side*6.3,topGround+10,v),.18,M.steel);
 // Fixed track ropes end separately: upper anchors, lower sockets and tension chains.
 for(const side of [-1,1]){
  const x=side*lane,top=V(x,route(length+4.5),length+4.5),bottom=V(x,route(-4.5),-4.5);
  for(const p of [top,bottom]){
   const tangent=V(0,slope(p.z),1).normalize(),end=p.clone().addScaledVector(tangent,p===top?.3:-.3);
   rod(fixed,p.clone().addScaledVector(tangent,-.2),p.clone().addScaledVector(tangent,.2),.11,M.silver);
   const socket=box(fixed,.44,.5,.18,end,M.steel);socket.quaternion.setFromUnitVectors(Z,tangent);
  }
  const anchor=top.clone().addScaledVector(V(0,slope(top.z),1).normalize(),.85);
  rod(fixed,top,anchor,.085,M.silver);
  beam(anchor.clone().add(V(-.7,0,0)),anchor.clone().add(V(.7,0,0)),.24,M.blue);
  for(const dx of [-.7,.7])beam(anchor.clone().add(V(dx,0,0)),V(x+dx,topGround+.6,anchor.z),.2,M.blue);
  const chainParts=fillet([bottom,V(x,route(-7),-7),V(x,baseGround-2.3,-7)],1.15),chain=path(chainParts,M.tension,'tension',.045);
  const curved=chainParts.find(p=>p.kind==='arc');
  for(const dx of [-.17,.17]){
   const pts=Array.from({length:45},(_,i)=>curved.at(i/44).add(V(dx,0,0)));for(let i=1;i<pts.length;i++)beam(pts[i-1],pts[i],.1,M.red);
  }
  for(let d=0;d<chain.length;d+=.22){const p=chain.point(d),q=chain.point(Math.min(chain.length,d+.14));for(const dx of [-.1,.1])rod(fixed,p.clone().add(V(dx,0,0)),q.clone().add(V(dx,0,0)),.035,M.steel);rod(fixed,p.clone().add(V(-.13,0,0)),p.clone().add(V(.13,0,0)),.055,M.silver);}
  box(fixed,1.8,2.4,1.8,V(x,baseGround-3.5,-7),M.concrete);
  for(const dx of [-1.05,1.05])beam(V(x+dx,baseGround-5,-7),V(x+dx,baseGround+1,-7),.13,M.blue);
 }
 batch(fixed);
 const motorRatio=1100/(10.25/driveR*60/(2*Math.PI));
 const api={root,rotors,circuits,contactArcs,drive,returns,topEntries,rpm:0,motorRPM:0,brakesApplied:true,
  setDrive(displacement,velocity=0){for(const r of rotors)r.rotor.rotation.z=r.direction*displacement/r.radius;fastShaft.rotation.x=displacement/driveR*motorRatio;api.rpm=Math.abs(velocity)/driveR*60/(2*Math.PI);api.motorRPM=api.rpm*motorRatio;api.brakesApplied=Math.abs(velocity)<.001;for(const b of brakes)b.scale.y=api.brakesApplied?1: .8;for(const c of circuits)c.dots.forEach((dot,i)=>c.point(((displacement+i*c.length/8)%c.length+c.length)%c.length,dot.position));},
  setMarkers(value){markers.visible=!!value;},
  setColours(value){M.haulA.color.set(value?0x329b91:0x475254);M.haulB.color.set(value?0x617da3:0x66777c);M.tension.color.set(value?0xc77e4d:0x6c7370);}
 };
 api.setDrive(0);return api;
}};
