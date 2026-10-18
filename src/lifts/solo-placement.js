/* Solo has inclined docking cages and an optional level upper hall. Earthworks are derived from
   each station definition, like the other station terraces: moving/deleting or
   undoing the station restores the underlying ordered terrain layers. */
window.LiftCoSoloPlacement=(()=>{
 'use strict';
 const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 function height(y,x,out,datum,end,raised=false,arrivalProfile='inclined'){
  if(raised)return y;
  const u=-out,top=end==='top',slope=Math.tan((top?20:12)*Math.PI/180)*(top?-1:1);
  // Hall: 20.4 m wide, 12 m behind the dock and 15.5 m towards the line.
  const pad=window.LiftCoTerrainSurface?window.LiftCoTerrainSurface.terrace(x,out,10.5,-12,12,datum,y):(1-smooth(10.5,16,Math.abs(x)))*smooth(-20,-12,out)*(1-smooth(12,20,out));
  y+=(datum-y)*pad;
  // Only the two cabin channels are excavated. Keep the centre boarding deck.
  // Full cut through 24 m, blended back to existing hillside by 34 m.
  const lane=1-smooth(1.9,3.6,Math.abs(Math.abs(x)-5.1));
  const length=smooth(-7,-3,u)*(1-smooth(24,34,u));
  const floor=top&&arrivalProfile==='flat'?datum-Math.tan(20*Math.PI/180)*Math.max(0,u+2.5-15)-.5:datum+slope*(u+(top?2.5:-2.5))-.5;
  return y-Math.max(0,y-floor)*lane*length;
 }
 function reason(def,layout,raw,shaped){
  // Sample the whole swept cabin width, not just the station centre. Limit
  // local excavation. A level hall still needs a natural cliff outside it.
  if(def.arrivalProfile==='flat'){
   const cliff=cliffReason(layout,raw);if(cliff)return cliff;
  }
  for(const [end,s0,direction]of [['base',0,1],['top',layout.length,-1]]){
   const datum=def.stationGround[end==='base'?1:-1];
   for(let u=-12;u<=15.5;u+=1)for(let x=-10;x<=10;x+=2){
    const p=layout.pointAt(s0+direction*u,x),ground=raw(p.x,p.z);
    if(ground-height(ground,x,-u,datum,end,def.stationFoundations?.[end]==='raised',def.arrivalProfile)>8+.001)return 'Solo station excavation exceeds 8 m. Raise its floor or move it out of the hillside.';
   }
   for(let u=-12;u<=34;u+=1)for(const side of [-1,1])for(const dx of [-1.1,0,1.1]){
    const x=side*5.1+dx,p=layout.pointAt(s0+direction*u,x),ground=raw(p.x,p.z);
    const cut=height(ground,x,-u,datum,end,def.stationFoundations?.[end]==='raised',def.arrivalProfile);
    if(ground-cut>8+.001)return 'Solo '+(end==='top'?'arrival':'valley')+' needs more than 8 m of excavation. Move the station towards the downhill edge or raise its boarding floor.';
   }
  }
  for(let i=0;i<=Math.ceil(layout.length);i++)for(const side of [-5.1,5.1])for(const dx of [-1.1,0,1.1])for(const dz of [-2.46,0,2.46]){
   const s=Math.min(i,layout.length);
   const angle=-Math.atan(layout.slopeAt(s)),shift=.543*Math.sin(angle),drop=7.39-.543*Math.cos(angle)+.075;
   const p=layout.pointAt(s,side+dx),g=shaped(p.x+layout.dx*(dz+shift),p.z+layout.dz*(dz+shift));
   if(layout.heightAt(s)-drop<g-.08)return 'Solo’s cabin approach intersects terrain. Move the arrival towards an edge, raise the platform or adjust the pylons. The arrival needs an open approach from the valley.';
  }
  return '';
 }
 function cliffReason(layout,raw){
  for(const side of [-5.1,5.1]){
   const at=u=>{const p=layout.pointAt(layout.length-u,side);return raw(p.x,p.z);},dock=at(0);
   let drop=0;for(let u=0;u<=35;u++)drop=Math.max(drop,at(u)-at(u+25));
   if(dock-at(34)<8||drop<10)return 'Solo’s flat arrival must sit over a natural cliff: move the station towards a steeper downhill edge. Raising the floor or excavating channels cannot replace the cliff.';
  }
  return '';
 }
 return{height,reason,cliffReason};
})();
