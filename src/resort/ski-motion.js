/* Terrain frames, individual ski lines and a small articulated downhill pose. */
window.LiftCoSkiMotion=(()=>{
 'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a||1),0,1);return t*t*(3-2*t);},damp=(a,b,k,dt)=>mix(a,b,1-Math.exp(-k*dt));
 function random(seed){let h=seed|0;return()=>{h=(h+0x6D2B79F5)|0;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
 function personality(s){
  if(s.skiPersonality)return s.skiPersonality;const seed=s.skiSeed??=Math.floor(Math.random()*4294967296),rng=random(seed),pick=(seed>>>0)%10,style=pick<2?'direct':pick<5?'cruiser':pick<8?'carver':'short-turns',ability=clamp(s.ability??1,0,3);
  const profile={direct:[.06,.12,70,105],cruiser:[.43,.63,36,56],carver:[.64,.81,53,81],'short-turns':[.29,.47,22,35]}[style];
  return s.skiPersonality={style,amplitude:mix(profile[0],profile[1],rng()),wavelength:mix(profile[2],profile[3],rng()),phase:rng()*Math.PI*2,bias:(rng()-.5)*.20,pace:4.8+ability*1.3+rng()*1.3+(style==='direct'?1.5:0),seed};
 }
 function attachRig(T,s){
  const source=s.legs,pants=source.material,original=new T.Group(),legs=new T.Group(),detail=new T.Group(),parts=[],axis=new T.Vector3(0,1,0),delta=new T.Vector3();source.removeFromParent();source.geometry.dispose();legs.add(original,detail);s.g.add(legs);s.legs=legs;
  const kneeGeometry=new T.SphereGeometry(.085,7,5),thighGeometry=new T.CylinderGeometry(.10,.085,1,6),shinGeometry=new T.CylinderGeometry(.08,.065,1,6),bootGeometry=s.bootGeometry||window.LiftCoGuestBoots.geometry(T),bootMaterial=s.bootMaterial||new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.63});
  for(const side of [-1,1]){const thigh=new T.Mesh(thighGeometry,pants),shin=new T.Mesh(shinGeometry,pants),boot=new T.Mesh(bootGeometry,bootMaterial),kneecap=new T.Mesh(kneeGeometry,pants);for(const mesh of [thigh,shin,kneecap,boot]){mesh.castShadow=true;detail.add(mesh);}parts.push({side,thigh,shin,kneecap,boot});}
  const simpleLegGeometry=new T.CylinderGeometry(.105,.085,.70,5);
  for(const side of [-1,1]){const leg=new T.Mesh(simpleLegGeometry,pants),boot=new T.Mesh(bootGeometry,bootMaterial);leg.position.set(side*.15,0,0);boot.position.set(side*.15,-.455,.035);original.add(leg,boot);}
  const positions=[],indices=[],rows=[[-.96,.055,.045],[-.80,.072,.005],[-.35,.062,0],[.25,.065,0],[.77,.085,.025],[.96,.065,.14]];
  for(const [z,w,y]of rows)for(const top of [-1,1])for(const side of [-1,1])positions.push(side*w,y+top*.025,z);
  for(let i=0;i<rows.length-1;i++){const a=i*4,b=a+4;indices.push(a+2,b+2,a+3,a+3,b+2,b+3,a,a+1,b,a+1,b+1,b,a,b,a+2,a+2,b,b+2,a+1,a+3,b+1,a+3,b+3,b+1);}indices.push(0,2,1,1,2,3);const end=(rows.length-1)*4;indices.push(end,end+1,end+2,end+1,end+3,end+2);
  const skiGeometry=new T.BufferGeometry();skiGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));skiGeometry.setIndex(indices);skiGeometry.computeVertexNormals();const oldGeometry=s.skis.children[0]?.geometry;for(const ski of s.skis.children)ski.geometry=skiGeometry;oldGeometry?.dispose();
  const poleMaterial=new T.MeshStandardMaterial({color:0x626b69,roughness:.55,metalness:.35}),poleGeometry=new T.CylinderGeometry(.013,.009,.86,5),poles=[];
  for(const {elbow}of s.arms){const pole=new T.Mesh(poleGeometry,poleMaterial);pole.position.set(0,-.73,-.04);pole.rotation.x=.16;elbow.add(pole);pole.visible=false;poles.push(pole);}
  s.skiRig={original,detail,parts,poles,axis,delta};standing(s);
 }
 function bone(rig,mesh,a,b){rig.delta.subVectors(b,a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.set(1,rig.delta.length(),1);mesh.quaternion.setFromUnitVectors(rig.axis,rig.delta.normalize());}
 function standing(s){
  const rig=s.skiRig;if(!rig)return;rig.original.scale.set(1,1,1);rig.original.position.set(0,.55,0);rig.original.rotation.set(0,0,0);rig.original.visible=true;rig.detail.visible=false;for(const pole of rig.poles)pole.visible=false;
  s.upperBody?.position.set(0,.95,0);s.upperBody?.rotation.set(0,0,0);s.head?.rotation.set(0,0,0);for(const ski of s.skis?.children||[]){ski.rotation.set(0,0,0);ski.position.y=ski.position.z=0;}for(const {arm,elbow,side}of s.arms||[]){arm.rotation.set(0,0,-side*.1);elbow.rotation.x=-.2;}
 }
 function create(ctx){
  const T=ctx.THREE,up=new T.Vector3(),forward=new T.Vector3(),right=new T.Vector3(),normal=new T.Vector3(),basis=new T.Matrix4(),hip=new T.Vector3(),knee=new T.Vector3(),ankle=new T.Vector3();
  function centre(r,d){d=clamp(d,0,r.length);let lo=0,hi=r.distances.length-1;while(lo+1<hi){const mid=(lo+hi)>>1;if(r.distances[mid]<=d)lo=mid;else hi=mid;}const a=r.samples[lo],b=r.samples[hi],u=(d-r.distances[lo])/(r.distances[hi]-r.distances[lo]||1),range=r.sourceRange||[0,1],v=(range[0]+(range[1]-range[0])*d/(r.length||1))*Math.max(1,(r.points?.length||2)-1),i=Math.min((r.points?.length||2)-2,Math.floor(v)),t=v-i;
   return{x:mix(a.x,b.x,u),z:mix(a.z,b.z,u),width:r.points?.length>1?mix(r.points[i]?.width||r.width,r.points[i+1]?.width||r.width,t):r.width};
  }
  function line(r,d,p,push,reverse){
   const c=centre(r,d),a=centre(r,d-2),b=centre(r,d+2),dx=b.x-a.x,dz=b.z-a.z,ds=Math.hypot(dx,dz)||1;
   const before=centre(r,d-4),after=centre(r,d+4),ax=c.x-before.x,az=c.z-before.z,bx=after.x-c.x,bz=after.z-c.z,curvature=Math.abs(Math.atan2(az*bx-ax*bz,ax*bx+az*bz))/(Math.hypot(ax,az)+Math.hypot(bx,bz)||1)*2;
   const half=Math.max(0,c.width/2-1.25),room=Math.min(half,.30/Math.max(.001,curvature)),envelope=smooth(0,Math.min(18,r.length*.24),d)*smooth(0,Math.min(24,r.length*.24),r.length-d),phase=d*Math.PI*2/p.wavelength+p.phase+.12*Math.sin(d*.012+p.phase),offset=push?0:room*envelope*(p.bias+p.amplitude*(.88*Math.sin(phase)+.12*Math.sin(phase*.47+p.phase)));
   const x=c.x+dz/ds*offset,z=c.z-dx/ds*offset,height=push&&ctx.skierSurfaceY?ctx.skierSurfaceY:ctx.terrainY;
   return{x,z,y:height(x,z),offset,room,envelope,reverse};
  }
  function frame(r,d,p,push,reverse){
   const at=line(r,d,p,push,reverse),a=line(r,Math.max(0,d-.45),p,push,reverse),b=line(r,Math.min(r.length,d+.45),p,push,reverse),sign=reverse?-1:1,dx=(b.x-a.x)*sign,dz=(b.z-a.z)*sign,ds=Math.hypot(dx,dz)||1,span=Math.min(r.length,d+.45)-Math.max(0,d-.45),height=push&&ctx.skierSurfaceY?ctx.skierSurfaceY:ctx.terrainY;
   // The contact frame averages the ski footprint instead of locking the body to world up.
   const fx=dx/ds,fz=dz/ds,along=(height(at.x+fx*.85,at.z+fz*.85)-height(at.x-fx*.85,at.z-fz*.85))/1.7,across=(height(at.x+fz*.32,at.z-fx*.32)-height(at.x-fz*.32,at.z+fx*.32))/.64;
   const gx=along*fx+across*fz,gz=along*fz-across*fx;normal.set(-gx,1,-gz).normalize();forward.set(fx,along,fz).normalize();right.crossVectors(normal,forward).normalize();up.crossVectors(forward,right).normalize();basis.makeBasis(right,up,forward);
   return{...at,fx,fz,along,ratio:Math.max(.6,Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)/(span||1)),basis,normal};
  }
  let powder=null,powderMaterial=null;const particles=Array.from({length:256},()=>({life:0})),dummy=new T.Object3D();let nextParticle=0;
  if(ctx.scene){powderMaterial=new T.MeshBasicMaterial({color:0xecf0e9,transparent:true,opacity:.18,depthWrite:false});powder=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),powderMaterial,particles.length);powder.name='Turn powder';powder.visible=false;powder.frustumCulled=false;ctx.scene.add(powder);}
  function advance(s,r,dt,push=false,reverse=false){
   if(!Number.isFinite(dt)||dt<=0)return;const p=personality(s);
   if(s.skiMotion?.route!==r||s.skiMotion.push!==push||s.skiMotion.reverse!==reverse){const run=s.skiRuns||0;s.skiMotion={route:r,push,reverse,speed:push?2.6:3.2,lean:0,emission:0,phase:p.phase,skate:push?1:0,profile:{...p,phase:p.phase+run*.91,wavelength:p.wavelength*(1+.09*Math.sin(run*2.3+p.phase))}};if(!push)s.skiRuns=run+1;s.lastTrack=null;}
   const m=s.skiMotion,steps=Math.max(1,Math.ceil(dt/.05)),h=dt/steps;let contact;
   for(let step=0;step<steps;step++){
    const d=reverse?r.length-s.distance:s.distance,current=frame(r,d,m.profile,push,reverse),look=line(r,clamp(d+(reverse?-2:2),0,r.length),m.profile,push,reverse),far=line(r,clamp(d+(reverse?-4:4),0,r.length),m.profile,push,reverse),aHeading=Math.atan2(current.fx,current.fz),bHeading=Math.hypot(far.x-look.x,far.z-look.z)>.1?Math.atan2(far.x-look.x,far.z-look.z):aHeading,angle=Math.atan2(Math.sin(bHeading-aHeading),Math.cos(bHeading-aHeading)),curvature=angle/Math.max(2,Math.hypot(far.x-current.x,far.z-current.z));
    const turning=clamp(Math.abs(curvature)*26,0,1),remaining=r.length-s.distance,pace=push?2.6:clamp((p.pace-current.along*7)/(1+turning*.45),2.8,13.5),desired=push?pace:mix(2.8,pace,smooth(0,24,remaining));
    m.speed+=clamp(desired-m.speed,-3.5*h,2.2*h);s.distance=Math.min(r.length,s.distance+m.speed*h/current.ratio);m.phase+=m.speed*h*(push?2.5:1.65);
    const nextD=reverse?r.length-s.distance:s.distance;contact=frame(r,nextD,m.profile,push,reverse);m.lean=damp(m.lean,push?0:clamp(-Math.atan(m.speed*m.speed*curvature/9.81)*.75,-.48,.48),9,h);m.turn=turning;m.skate=damp(m.skate,push||contact.along>-.035&&m.speed<6?1:0,6,h);
   }
   s.actualSpeed=m.speed;s.x=contact.x;s.z=contact.z;s.heading=Math.atan2(contact.fx,contact.fz);s.lateralOffset=contact.offset;s.walking=false;
   s.g.quaternion.setFromRotationMatrix(contact.basis);s.g.position.set(contact.x-contact.normal.x*.035,contact.y-contact.normal.y*.035,contact.z-contact.normal.z*.035);
   s.skiPose={lean:m.lean,turn:m.turn,speed:m.speed,push,skating:m.skate,phase:m.phase,brake:push?0:1-smooth(0,24,r.length-s.distance),novice:(s.ability??1)<2,normal:contact.normal.clone(),crouch:push?.12:clamp(.16+m.speed*.024+m.turn*.23,.15,.65)};
   if(powder&&!push&&m.turn>.28&&m.speed>4&&s.distance>8&&s.distance<r.length-12){m.emission+=dt*(2+m.turn*3);while(m.emission>=1){m.emission--;const part=particles[nextParticle++%particles.length],side=m.lean<0?1:-1,x=s.x-contact.fz*side*.28-contact.fx*.65,z=s.z+contact.fx*side*.28-contact.fz*.65;Object.assign(part,{x,z,y:ctx.terrainY(x,z)+.08,vx:-contact.fx*.5-contact.fz*side*.5,vz:-contact.fz*.5+contact.fx*side*.5,vy:.55,life:.65,size:.06+m.turn*.09});}}
  }
  function pose(s){
   const p=s.skiPose,rig=s.skiRig;if(!p||!rig)return;const near=!ctx.camera||ctx.camera.position.distanceToSquared(s.g.position)<150*150,skating=p.skating,phase=p.phase,stroke=Math.sin(phase),lean=p.lean+stroke*.10*skating,crouch=p.crouch,brake=p.brake,hipY=.95-crouch*.22+Math.cos(phase*2)*.018*skating,wedge=brake*(p.novice?.22:.10),pulse=Math.max(0,Math.cos(phase))*skating;
   rig.detail.visible=near;rig.original.visible=!near;rig.original.scale.set(1,1-crouch*.2,1);rig.original.position.set(-lean*.18,.55-crouch*.08,0);rig.original.rotation.z=lean*.25;
   for(const part of rig.parts){
    const side=part.side,kick=Math.max(0,stroke*side)*skating,slide=stroke*side*.17*skating,stance=.16+crouch*.025+brake*.065,x=side*(stance+kick*.12),lift=kick*.035;
    if(near){hip.set(side*.15-lean*.20,hipY,-crouch*.12);knee.set(side*.16-lean*.27,.55-crouch*.10,.10+crouch*.25+slide*.45);ankle.set(x,.22+lift,.04+slide);bone(rig,part.thigh,hip,knee);bone(rig,part.shin,knee,ankle);part.kneecap.position.copy(knee);part.boot.position.set(x,.16+lift,.07+slide);part.boot.rotation.set(0,-side*(wedge+kick*.14),lean*.12);}
    const ski=s.skis.children[side>0?1:0];ski.rotation.set(kick*.035,-side*(wedge+kick*.14),lean*.20);ski.position.set(x,lift,slide);
   }
   s.upperBody.position.set(-lean*.17,hipY,-crouch*.09);s.upperBody.rotation.set(.12+crouch*.25+pulse*.12,lean*.20,lean*.60);s.head.rotation.set(-pulse*.04,-lean*.28,0);
   for(let i=0;i<s.arms.length;i++){
    const {arm,elbow,side}=s.arms[i],inside=Math.sign(lean)===side,plant=Math.max(0,Math.abs(lean)-.10)*(inside?1:-.4),relax=Math.sin(s.t*1.4+side)*.04;
    arm.rotation.set(mix(-.28+crouch*.10+plant*.55+relax,-.24+stroke*.48,skating),-side*brake*.1*(1-skating),-side*(.17+crouch*.05+brake*.08));elbow.rotation.x=-.35-crouch*.24-pulse*.18;rig.poles[i].visible=near;rig.poles[i].rotation.x=mix(.16+plant*.25,.16-stroke*.23,skating);
   }
  }
  function clear(s){standing(s);s.skiMotion=null;s.skiPose=null;s.actualSpeed=0;s.lateralOffset=0;}
  function tick(dt){if(!powder||dt<=0)return;let visible=false;for(let i=0;i<particles.length;i++){const p=particles[i];p.life=Math.max(0,p.life-dt);if(p.life>0){visible=true;p.x+=p.vx*dt;p.z+=p.vz*dt;p.y=Math.max(p.y+p.vy*dt,ctx.terrainY(p.x,p.z)+.025);p.vy-=dt*.65;const size=p.size*(1.8-p.life)*p.life/.65;dummy.position.set(p.x,p.y,p.z);dummy.scale.set(size*1.5,size*.7,size);dummy.rotation.set(0,p.life,0);}else{dummy.position.set(0,-1000,0);dummy.scale.setScalar(0);}dummy.updateMatrix();powder.setMatrixAt(i,dummy.matrix);}powder.visible=visible;powder.instanceMatrix.needsUpdate=true;}
  return{advance,pose,clear,tick,personality,dispose(){powder?.removeFromParent();powder?.dispose();powder?.geometry.dispose();powderMaterial?.dispose();}};
 }
 return{create,attachRig,personality};
})();
