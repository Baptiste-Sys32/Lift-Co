/* Protected station approaches remain snowy; skiers push across them on their skis. */
window.LiftCoPisteAccess=(()=>{
 function segment(r,first,last,id){const samples=r.samples.slice(first,last+1),distances=[0];for(let i=1;i<samples.length;i++)distances.push(distances[i-1]+Math.hypot(samples[i].x-samples[i-1].x,samples[i].z-samples[i-1].z));return{...r,id,samples,distances,length:distances.at(-1),width:r.width,pisteId:r.id};}
 function compile(r,doc,height,withoutStation,stationAccess=null){
  if(!r||!withoutStation)return r;const stationKeys=new Set(doc.lifts.flatMap(l=>(window.LiftCoNextAlignment?.ends(l)||['base','top']).map(end=>l.id+':'+end))),last=r.samples.length-1,ends=[0,last],cuts=[0,last];
  for(const end of [0,1]){const key=stationAccess?.canonical(r.connections?.[end])||r.connections?.[end];if(!stationKeys.has(key))continue;const origin=ends[end],direction=end?-1:1;let affected=-1;
   for(let i=origin;i>=0&&i<=last;i+=direction){const p=r.samples[i];if(Math.abs(r.distances[i]-r.distances[origin])>120)break;const a=r.samples[Math.max(0,i-1)],b=r.samples[Math.min(last,i+1)],length=Math.hypot(b.x-a.x,b.z-a.z)||1,w=r.width/2+1,nx=(b.z-a.z)/length,nz=-(b.x-a.x)/length;
    if([-w,0,w].some(d=>Math.abs(height(p.x+nx*d,p.z+nz*d)-withoutStation(p.x+nx*d,p.z+nz*d,key))>.05))affected=i;
   }
   if(affected>=0)cuts[end]=Math.max(0,Math.min(last,affected+direction));
  }
  // A short route wholly inside the platforms has no skiable descent to open.
  if(cuts[0]>=cuts[1]-1)return{...r,stationAccessBlocked:true};
  if(cuts[0]===0&&cuts[1]===last)return r;
  const core=segment(r,cuts[0],cuts[1],r.id);core.width=r.width;core.sourceRange=[cuts[0]/last,cuts[1]/last];core.stationAccess=[cuts[0]>0?segment(r,0,cuts[0],r.id+':station-start'):null,cuts[1]<last?segment(r,cuts[1],last,r.id+':station-end'):null];for(let end=0;end<2;end++){const approach=core.stationAccess[end],station=stationAccess?.resolve(r.connections?.[end]);if(!approach||!station)continue;const around=stationAccess.path(station.definition,station.end,approach.samples[0],approach.samples.at(-1),approach.id);if(around?.samples.length>1)core.stationAccess[end]={...approach,...around,pisteId:r.id};}
  return core;
 }
 return{compile};
})();
