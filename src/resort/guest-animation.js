/* Local body animation only. Route positions, boarding gates and seat ownership stay authoritative. */
window.LiftCoGuestAnimation=(()=>{
 'use strict';
 const mix=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function create(ctx){
  const T=ctx.THREE,hip=new T.Vector3(),knee=new T.Vector3(),ankle=new T.Vector3(),world=new T.Vector3(),direction=new T.Vector3(),feet=[{at:new T.Vector3()},{at:new T.Vector3()}];
  function bone(rig,mesh,a,b){rig.delta.subVectors(b,a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.set(1,rig.delta.length(),1);mesh.quaternion.setFromUnitVectors(rig.axis,rig.delta.normalize());}
  function update(s,dt){
   const rig=s.skiRig;if(!rig||dt<=0||!Number.isFinite(dt))return;
   const p=s.g.position,seed=window.LiftCoSkiMotion.personality(s).seed,u=(seed>>>0)/4294967296;
   let m=s.bodyMotion;if(!m)m=s.bodyMotion={x:p.x,z:p.z,phase:u*Math.PI*2,clock:u*17,amount:0};
   const distance=Math.hypot(p.x-m.x,p.z-m.z);m.x=p.x;m.z=p.z;m.clock+=dt;
   if(s.skiPose&&(s.state==='ski'||s.state==='skiPush')){m.amount=0;return;}
   // Boarding interpolation, suspended seats and bus seats keep their existing poses.
   if(['board','ride','unload','busBoard','busRide','busUnload','networkAway'].includes(s.state)||s.retired||s.away||!s.g.visible){m.amount=0;rig.detail.visible=false;rig.original.visible=true;for(const pole of rig.poles)pole.visible=false;s.upperBody.position.set(0,.95,0);s.upperBody.rotation.set(0,0,0);s.head.rotation.set(0,0,0);return;}
   const moving=s.walking&&distance>.00001&&distance<Math.max(3,dt*6),carried=s.equipmentCarried??1,shuffle=carried<.3,stride=(shuffle?.34:.64)*(1+u*.12)*(s.playerSprinting?1.4:1),speed=moving?distance/dt:0;
   if(moving)m.phase+=distance/stride*Math.PI; // one footfall per stride, independent of frame rate
   m.amount=mix(m.amount,moving?clamp(speed/2.4,.2,1):0,1-Math.exp(-12*dt));
   const amount=m.amount,near=!ctx.camera||ctx.camera.position.distanceToSquared(p)<150*150,bob=(Math.abs(Math.cos(m.phase))-.5)*.018*amount,rootHeight=near&&ctx.height?ctx.height(p.x,p.z):p.y;
   let hipY=.90+bob,pitch=0;
   rig.detail.visible=near;rig.original.visible=!near;rig.original.scale.set(1,1,1);rig.original.position.set(0,.53+bob,0);rig.original.rotation.set(0,0,0);
   if(near){
    direction.set(0,0,1).applyQuaternion(s.g.quaternion);
    if(ctx.height)pitch=clamp(-Math.atan((ctx.height(p.x+direction.x*.18,p.z+direction.z*.18)-ctx.height(p.x-direction.x*.18,p.z-direction.z*.18))/.36),-.30,.30);
    for(let i=0;i<rig.parts.length;i++){
     const part=rig.parts[i],foot=feet[i],q=((m.phase+(part.side>0?Math.PI:0))%(Math.PI*2)+Math.PI*2)%(Math.PI*2),swing=clamp((q-Math.PI)/Math.PI,0,1);
     foot.lift=Math.sin(swing*Math.PI)*(shuffle?.025:s.playerSprinting?.13:.085)*amount;
     const z=(q<=Math.PI?stride*(.5-q/Math.PI):stride*(-.5+swing*swing*(3-2*swing)))*amount,x=part.side*.15;
     foot.at.set(x,.15+foot.lift,z);foot.pitch=pitch-Math.sin(swing*Math.PI)*.06*amount;
     if(ctx.height){world.set(x,0,z).applyQuaternion(s.g.quaternion).add(p);foot.at.y+=clamp(ctx.height(world.x,world.z)-rootHeight,-.16,.16);}
     // Lower the pelvis to stay within two fixed-length leg bones on slopes.
     hipY=Math.min(hipY,foot.at.y+Math.sqrt(Math.max(.01,.819*.819-(z+.025)**2)));
    }
    for(let i=0;i<rig.parts.length;i++){
     const part=rig.parts[i],foot=feet[i];ankle.copy(foot.at);hip.set(part.side*.15,hipY,-.025);
     const dy=ankle.y-hip.y,dz=ankle.z-hip.z,length=Math.max(.001,Math.hypot(dy,dz)),along=(.42*.42-.40*.40+length*length)/(2*length),bendLength=Math.sqrt(Math.max(0,.42*.42-along*along));
     knee.set(hip.x,hip.y+dy/length*along+dz/length*bendLength,hip.z+dz/length*along-dy/length*bendLength);
     bone(rig,part.thigh,hip,knee);bone(rig,part.shin,knee,ankle);part.kneecap.position.copy(knee);
     part.boot.position.copy(ankle);part.boot.position.y-=.055;part.boot.position.z+=.035;part.boot.rotation.set(foot.pitch,0,0);
     const ski=s.skis.children[part.side>0?1:0];if(ski){ski.position.z=shuffle?ankle.z:0;ski.position.y=shuffle?foot.lift:0;ski.rotation.set(shuffle?foot.pitch:0,0,0);}
    }
   }
   const bend=['takeOff','putOn'].includes(s.state)?.48*Math.sin(Math.PI*clamp(s.t/1.15,0,1)):0;
   s.upperBody.position.set(0,hipY,0);s.upperBody.rotation.set(bend+(s.playerSprinting?.10:.025)*amount,Math.sin(m.phase)*.025*amount,Math.sin(m.phase)*.018*amount);
   s.head.rotation.set(0,Math.sin(m.clock*.43+u*5)*.13*(1-amount),0);
   for(let i=0;i<s.arms.length;i++){
    const {arm,elbow,side}=s.arms[i],hold=side>0&&s.skis.visible?carried:0,phase=m.phase+(side>0?Math.PI:0);
    arm.rotation.set(Math.cos(phase)*.34*amount*(1-hold)-hold*.08,0,-side*.1+hold*.45);elbow.rotation.x=-.23-hold*.87-Math.max(0,-Math.cos(phase))*.16*amount*(1-hold);
    rig.poles[i].visible=near&&!shuffle&&hold<.5;rig.poles[i].rotation.x=.12+Math.cos(phase)*.12*amount;
   }
  }
  return{update};
 }
 return{create};
})();
