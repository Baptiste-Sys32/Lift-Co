/* Stable individual walking pace, shared by path travel and station navigation. */
window.LiftCoGuestWalking=(()=>{
 'use strict';
 const averageSpeed=1.7;
 function speed(s,pace=2.8){
  if(!Number.isFinite(s.walkSpeed)){
   let seed=window.LiftCoSkiMotion.personality(s).seed^0x71c839ab;
   seed=Math.imul(seed^(seed>>>16),0x45d9f3b);seed=Math.imul(seed^(seed>>>16),0x45d9f3b);seed=(seed^(seed>>>16))>>>0;
   s.walkSpeed=1.25+seed/4294967296*.9;
  }
  return Math.max(0,pace)*s.walkSpeed/2.8;
 }
 return{speed,averageSpeed};
})();
