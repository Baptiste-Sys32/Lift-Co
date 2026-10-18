/* Fore/aft chair motion about the hanger pin. The grip stays on its path. */
window.LiftCoChairSway=(()=>{
 'use strict';
 const length=3.6,gravity=9.81,damping=1.1,response=.55,maxAcceleration=1.8,maxAngle=8*Math.PI/180;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function update(carrier,acceleration,dt){
  if(dt<=0)return;
  // The carrier faces local +Z. Positive pitch trails the accelerating grip;
  // braking drives the suspended chair forward. No timed or random rocking.
  // Soften the game's short conveyor ramps without changing cable speeds.
  const drive=clamp(acceleration,-maxAcceleration,maxAcceleration)*response,steps=Math.ceil(dt*120),h=dt/steps;
  for(let i=0;i<steps;i++){
   const torque=(drive*Math.cos(carrier.sway)-gravity*Math.sin(carrier.sway))/length-damping*carrier.swayVelocity;
   carrier.swayVelocity+=torque*h;carrier.sway+=carrier.swayVelocity*h;
   if(Math.abs(carrier.sway)>maxAngle){carrier.sway=Math.sign(carrier.sway)*maxAngle;if(carrier.sway*carrier.swayVelocity>0)carrier.swayVelocity=0;}
  }
 }
 return{update};
})();
