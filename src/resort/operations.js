window.LiftCoOperations={
 attach(lift){
  const spec=window.LiftCoLiftTypes.find(t=>t.id===lift.LIFT.type),max=spec.cableSpeed;
  if(!lift.def.operations||typeof lift.def.operations!=='object'||Array.isArray(lift.def.operations))lift.def.operations={open:true,running:true,speed:max,count:null};
  const op=lift.def.operations,requested=op.speed==null?max:Number(op.speed);
  op.speed=Number.isFinite(requested)?Math.max(.5,Math.min(max,requested)):max;op.open=op.open!==false;op.running=op.running!==false;
  const native=lift.update;let current=op.speed;
  lift.LIFT.cableSpeed=current;
  if(!lift.LIFT.reversible)for(const carrier of lift.cabins)carrier.speed=lift.targetSpeedAt(carrier.s);
  lift.operations=op;lift.catalogSpeed=max;lift.minimumSpacing=lift.LIFT.reversible?0:spec.minSpacing||spec.stationPitch*max/Math.max(.1,spec.stationSpeed||max);
  lift.maxCount=lift.LIFT.reversible?2:Math.max(2,Math.floor((lift.timetable?.duration||30)/(spec.stationPitch/spec.stationSpeed)));
  lift.setFleetConfiguration=count=>{if(lift.LIFT.reversible)return 2;const value=Number(count);lift.def.operations.count=Number.isFinite(value)?Math.max(2,Math.min(lift.maxCount,Math.round(value))):lift.cabins.length;return lift.def.operations.count;};
  lift.fleetLength=(lift.timetable?.duration||0)*max;
  lift.spacing=()=>lift.LIFT.reversible?null:lift.fleetLength/lift.cabins.length;
  lift.setSpeed=value=>{const speed=Number(value);if(Number.isFinite(speed))lift.def.operations.speed=Math.max(.5,Math.min(max,speed));return lift.def.operations.speed;};
  lift.setBoarding=value=>lift.def.operations.open=!!value;
  lift.setRunning=value=>lift.def.operations.running=!!value;
  lift.update=dt=>{const op=lift.def.operations;if(!op.running){lift.updateSuspension?.(dt,0);if(lift.updateSuspension)for(const c of lift.cabins)c.speed=0;return;}current+=Math.max(-dt*.65,Math.min(dt*.65,op.speed-current));if(lift.LIFT.reversible){native(dt*current/max,{deferSway:!!lift.updateSuspension});lift.LIFT.cableSpeed=current;for(const carrier of lift.cabins)carrier.speed*=current/max;lift.updateSuspension?.(dt,current/max);}else{lift.LIFT.cableSpeed=current;native(dt);}};
  // Sample the actual loop geometry. Detachable crawl does not scale with
  // cruise speed, so scaling the entire catalog timetable gives a false capacity.
  const segments=[];
  if(lift.LOOP&&!lift.def.preview){const a=lift.LIFT.base.clone(),b=a.clone(),n=Math.min(1600,Math.max(80,Math.ceil(lift.LOOP.total/4)));lift.LOOP.pos(0,a);for(let i=1;i<=n;i++){const s=i/n*lift.LOOP.total;lift.LOOP.pos(s,b);segments.push({distance:a.distanceTo(b),at:(i-.5)/n*lift.LOOP.total});a.copy(b);}}
  let shuttleCatalogCycle=lift.motion?.cycleSeconds||0;
  if(lift.LIFT.funitel){const length=lift.layout.length,n=Math.max(100,Math.ceil(length));let distance=0,previous=lift.layout.atZ(0);for(let i=1;i<=n;i++){const z=length*i/n,p=lift.layout.atZ(z);distance+=Math.hypot(length/n,p.y-previous.y);previous=p;}
   // The existing train model: 3 s acceleration, 16 s braking, 12 s dwell.
   shuttleCatalogCycle=2*(distance/max+(3+16)/2+12);
  }
  lift.estimatedCycleSeconds=()=>{if(lift.LIFT.reversible)return shuttleCatalogCycle*max/lift.def.operations.speed;const old=lift.LIFT.cableSpeed;lift.LIFT.cableSpeed=lift.def.operations.speed;try{return segments.reduce((sum,s)=>sum+s.distance/lift.targetSpeedAt(s.at),0);}finally{lift.LIFT.cableSpeed=old;}};
  // Reserve before the boarding gate and board only while doors/bars are open.
  lift.boardingWindow=(carrier,end,phase='reserve',dest)=>{const gate=lift.endInfo(end,dest).gate,total=lift.LOOP.total,delta=((carrier.s-gate+total/2)%total+total)%total-total/2;const last=lift.LIFT.isChair?.25:-.2;return carrier.door>.7&&delta>=(phase==='reserve'?-4:-2)&&delta<=last;};
  lift.cameraCabin=lift.cabins[lift.LIFT.reversible?1:0];if(lift.cameraCabin)lift.cameraCabin.cameraOnly=true;
  lift.dispose=()=>{lift.root.removeFromParent();const geometries=new Set(),materials=new Set();lift.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());};
  return lift;
 }
};
