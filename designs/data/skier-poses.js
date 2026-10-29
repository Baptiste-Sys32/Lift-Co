/* Isolated viewing poses. Uses the actual walking/ski animation modules; never loaded by the resort. */
window.LiftCoSkierStudyPose={create(T,s,camera){
 const motion=window.LiftCoSkiMotion.create({THREE:T,camera,terrainY:()=>0,skierSurfaceY:()=>0}),walking=window.LiftCoGuestAnimation.create({THREE:T,camera,height:()=>0});let pose='stand';
 function set(name){
  pose=name;motion.clear(s);s.g.position.set(0,0,0);s.g.rotation.set(0,0,0);s.seatedLegs.visible=false;s.legs.visible=true;s.skis.visible=name==='ski';s.skis.position.set(0,.08,0);s.skis.rotation.set(0,0,0);s.state=name==='ski'?'ski':name==='seat'?'ride':'networkIdle';s.t=0;s.walking=false;s.bodyMotion=null;
  if(name==='seat'){s.legs.visible=false;s.seatedLegs.visible=true;for(const {arm,elbow,side}of s.arms){arm.rotation.set(0,0,-side*.10);elbow.rotation.x=-.9;}}
  update(0);
 }
 function update(dt){
  s.t+=dt;
  if(pose==='walk'){
   s.walking=true;s.equipmentCarried=1;s.g.position.z=dt*1.7;walking.update(s,dt||1/60);s.g.position.z=0;if(s.bodyMotion)s.bodyMotion.z=0;
  }else if(pose==='ski'){
   s.skiPose={lean:Math.sin(s.t*1.4)*.26,crouch:.42,skating:0,phase:s.t*2,brake:0,novice:false};motion.pose(s);
  }
  s.g.updateMatrixWorld(true);
 }
 set(pose);return{set,update,get pose(){return pose;},dispose:()=>motion.dispose()};
}};
