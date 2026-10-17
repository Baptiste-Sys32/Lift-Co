window.LiftCoOperations={
 attach(lift){
  const spec=window.LiftCoLiftTypes.find(t=>t.id===lift.LIFT.type),max=spec.cableSpeed;
  const op=lift.def.operations??={open:true,running:true,speed:max,count:null};
  op.speed=Math.max(.5,Math.min(max,Number(op.speed)||max));op.open=op.open!==false;op.running=op.running!==false;
  const native=lift.update;let current=op.speed;
  lift.operations=op;lift.catalogSpeed=max;lift.minimumSpacing=spec.minSpacing||spec.stationPitch*max/Math.max(.1,spec.stationSpeed||max);
  lift.maxCount=lift.LIFT.reversible?2:Math.max(2,Math.floor((lift.timetable?.duration||30)/(spec.stationPitch/spec.stationSpeed)));
  lift.setFleetConfiguration=count=>{if(lift.LIFT.reversible)return 2;lift.def.operations.count=Math.max(2,Math.min(lift.maxCount,Math.round(count)));return lift.def.operations.count;};
  lift.fleetLength=(lift.timetable?.duration||0)*max;
  lift.spacing=()=>lift.LIFT.reversible?null:lift.fleetLength/lift.cabins.length;
  lift.setSpeed=value=>lift.def.operations.speed=Math.max(.5,Math.min(max,Number(value)||.5));
  lift.setBoarding=value=>lift.def.operations.open=!!value;
  lift.setRunning=value=>lift.def.operations.running=!!value;
  lift.update=dt=>{const op=lift.def.operations;if(!op.running)return;current+=Math.max(-dt*.65,Math.min(dt*.65,op.speed-current));if(lift.LIFT.reversible){native(dt*current/max);}else{lift.LIFT.cableSpeed=current;native(dt);}};
  lift.cameraCabin=lift.cabins[lift.LIFT.reversible?1:0];if(lift.cameraCabin)lift.cameraCabin.cameraOnly=true;
  lift.dispose=()=>{lift.root.removeFromParent();const geometries=new Set(),materials=new Set();lift.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());};
  return lift;
 }
};
