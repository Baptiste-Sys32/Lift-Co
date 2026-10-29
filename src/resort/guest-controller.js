/* Possession owns input and locomotion. Lift transport remains in the guest network. */
window.LiftCoGuestController=(()=>{
 'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function create(ctx){
  const {THREE:T,camera,controls,canvas,lifts,skiers,guests}=ctx,keys=new Set(),ray=new T.Raycaster(),pointer=new T.Vector2(),forward=new T.Vector3(),right=new T.Vector3(),normal=new T.Vector3(),up=new T.Vector3(0,1,0),basis=new T.Matrix4(),eye=new T.Vector3(),target=new T.Vector3(),desired=new T.Vector3();
  const access=window.LiftCoStationAccess.create({THREE:T,height:ctx.height,stationSettings:ctx.stationSettings,definitions:()=>lifts.map(l=>l.def)});
  const panel=document.createElement('section');panel.id='guestController';panel.hidden=true;panel.setAttribute('aria-label','Control a guest');panel.innerHTML=`<header><div><span class="eyebrow">ON THE MOUNTAIN</span><strong id="playerState">Walking</strong></div><button type="button" id="playerLeave" title="Release control. Guests away from a route return home.">Leave</button></header><div class="player-tools"><button type="button" id="playerWalk">Walk</button><button type="button" id="playerSki">Skis</button><button type="button" id="playerCamera">Third person</button></div><button type="button" id="playerCancelQueue" hidden>Cancel queue</button><div id="playerStation" hidden></div><section id="playerSeats" hidden><strong>Choose a seat</strong><div id="playerSeatChoices"></div></section><p class="player-keys">WASD move · Shift sprint · drag to look · Space brake · E board · scroll zoom · V camera · Esc leave</p><div class="player-pad" aria-label="Movement"><button type="button" data-player-key="KeyW" aria-label="Forward">↑</button><button type="button" data-player-key="KeyA" aria-label="Left">←</button><button type="button" data-player-key="KeyS" aria-label="Back or brake">↓</button><button type="button" data-player-key="KeyD" aria-label="Right">→</button><button type="button" data-player-key="Space">Brake</button></div>`;
  document.body.append(panel);const $=id=>panel.querySelector('#'+id);
  let person=null,mode='walk',firstPerson=true,zoomDistance=0,zoomCurrent=0,lastThirdDistance=5,yaw=0,pitch=-.08,heading=0,velocity=0,down=null,snap=true,lastUI=-1,obstacles=[],nearest=null,stationSignature='',hidden=false,rideHeading=null,seatDestination=null,seatStation='',cabinWalks=[];
  function restore(){if(hidden&&person?.g){person.g.visible=true;hidden=false;}}
  function clearKeys(){keys.clear();if(person)person.playerSprinting=false;if(down&&canvas.hasPointerCapture?.(down.id))canvas.releasePointerCapture(down.id);down=null;}
  function blocked(){return ctx.blocked()||!!document.activeElement?.closest('dialog[open]');}
  function setMode(next){if(!person)return;interruptWalk();if(person.edge?.kind==='lift')return;mode=next;velocity=0;guests.clearPose(person);person.state=mode==='ski'?'ski':'playerWalk';person.g.rotation.set(0,heading,0);refresh();}
  function open(s){
   if(!s||s.retired||s.away||blocked())return false;
   if(person===s)return true;if(person)close();ctx.enterFreeCamera();const wasSki=s.state==='ski'||s.state==='skiPush',oldSpeed=s.actualSpeed||0;
   if(!guests.takeControl(s)){ctx.notice('Leave the bus before taking control of this guest.');return false;}
   person=s;mode=wasSki?'ski':'walk';firstPerson=true;zoomDistance=zoomCurrent=0;lastThirdDistance=5;cabinWalks=[];seatStation='';seatDestination=null;$('playerSeatChoices').dataset.seats='';heading=wasSki?(s.heading??s.g.rotation.y):s.g.rotation.y;yaw=heading+Math.PI;pitch=-.08;velocity=wasSki?oldSpeed:0;keys.clear();snap=true;hidden=false;rideHeading=null;controls.enabled=false;panel.hidden=false;canvas.focus({preventScroll:true});
   obstacles=[];
   for(const l of lifts){const spec=window.LiftCoLiftTypes.find(t=>t.id===l.def.type),ends=spec?.nextModel?window.LiftCoNextAlignment.stationFrames(l.def).map(f=>f.end):window.LiftCoNextAlignment.ends(l.def);for(const [i,b]of window.LiftCoPlacement.terminalBoxes(l.def,spec,ctx.stationSettings(l.def)).entries())obstacles.push({...b,lift:l,end:ends[i]});const path=window.LiftCoNextAlignment.make(l.def);for(const t of l.def.towers||[]){const p=path.at(path.length*t.fraction);obstacles.push({x:p.x,z:p.z,halfWidth:2,halfLength:2,along:{x:p.dx,z:p.dz},across:{x:p.dz,z:-p.dx}});}}
   for(const b of ctx.doc.buildings){const p=window.LiftCoVillage.footprint(b),a=p.yaw||0;obstacles.push({x:p.x,z:p.z,halfWidth:p.width/2,halfLength:p.depth/2,along:{x:Math.sin(a),z:Math.cos(a)},across:{x:Math.cos(a),z:-Math.sin(a)}});}
   if(!person.edge)person.state=mode==='ski'?'ski':'playerWalk';refresh();return true;
  }
  function close(){if(!person)return;restore();clearKeys();const s=person;person=null;panel.hidden=true;nearest=null;guests.releasePlayer(s);const p=camera.position.clone(),q=camera.quaternion.clone();controls.enabled=true;controls.enableDamping=false;controls.update();camera.position.copy(p);camera.quaternion.copy(q);camera.up.copy(up);controls.target.copy(p).addScaledVector(camera.getWorldDirection(forward),12);controls.update();controls.enableDamping=true;}
  function stations(){let best=null;if(!person)return null;for(const lift of lifts)for(const end of window.LiftCoNextAlignment.ends(lift.def)){const dests=window.LiftCoNextAlignment.ends(lift.def).filter(e=>e!==end),info=guests.stationInfo(lift,end,dests[0]);if(!info)continue;const distance=Math.min(Math.hypot(person.x-info.load.x,person.z-info.load.z),Math.hypot(person.x-info.queuePoint(0).x,person.z-info.queuePoint(0).z));if(distance<24&&(!best||distance<best.distance))best={lift,end,dests,distance};}return best;}
  function seatContext(){
   if(!person||person.edge)return null;const found=[];
   for(const lift of lifts)for(const end of window.LiftCoNextAlignment.ends(lift.def)){
    const dests=window.LiftCoNextAlignment.ends(lift.def).filter(e=>e!==end),key=lift.def.id+':'+end,dest=key===seatStation&&dests.includes(seatDestination)?seatDestination:dests.slice().sort((a,b)=>guests.stationInfo(lift,b,end).load.y-guests.stationInfo(lift,a,end).load.y)[0],options=guests.playerCabins(person,lift,end,dest);
    if(options.length)found.push({lift,end,dests,dest,options,distance:options[0].distance});
   }
   return found.sort((a,b)=>a.distance-b.distance)[0]||null;
  }
  function board(queue=false,dest=null,choice=null){
   if(!person||person.edge||blocked())return false;const n=choice?.lift?{lift:choice.lift,end:choice.end}:stations();if(!n)return false;
   if(dest){seatStation=n.lift.def.id+':'+n.end;seatDestination=dest;}const context=choice?{dest:dest||seatDestination}:seatContext();
   if(!queue&&!choice){refreshSeats();const b=$('playerSeatChoices').querySelector('button:not(:disabled)');if(b){b.focus();return true;}ctx.notice('Approach an open cabin to choose a seat.');return false;}
   if(!guests.boardPlayer(person,n.lift,n.end,dest||context?.dest||n.dests?.[0],queue,choice)){ctx.notice(queue?'This lift is closed or stopped.':'That seat is no longer available. Wait for an open carrier.');refreshSeats();return false;}
   clearKeys();velocity=0;refresh();return true;
  }
  function refreshSeats(){
   const section=$('playerSeats'),choices=$('playerSeatChoices');section.hidden=true;if(!person||person.edge)return;
   const context=seatContext();if(!context?.options.length){choices.replaceChildren();choices.dataset.seats='';return;}section.hidden=false;
   const option=context.options.find(o=>o.distance<3.5);if(!option){section.hidden=true;choices.replaceChildren();choices.dataset.seats='';return;}const signature=context.lift.def.id+':'+context.end+':'+context.dest+':'+option.index+':'+option.carrier.riders.map(s=>s?'x':'o').join('');
   if(choices.dataset.seats===signature)return;choices.dataset.seats=signature;choices.replaceChildren();
   for(let i=0;i<option.carrier.riders.length;i++){const b=document.createElement('button');b.type='button';b.textContent='Seat '+(i+1);b.disabled=option.carrier.riders[i]!==null;b.setAttribute('aria-label','Seat '+(i+1)+(b.disabled?', occupied':', available'));b.onclick=()=>board(false,context.dest,{carrier:option.carrier,seat:i,lift:context.lift,end:context.end});choices.append(b);}
  }
  function pickSeat(e){
   if(!person||person.edge)return false;const context=seatContext();if(!context)return false;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);camera.updateMatrixWorld(true);ray.setFromCamera(pointer,camera);
   let best=null;
   for(const option of context.options)for(let i=0;i<option.points.length;i++){
    if(option.carrier.riders[i]!==null||option.points[i].distanceTo(person.g.position)>3.5&&option.distance>3.5)continue;
    const seat=option.points[i].clone();seat.y+=.68;const projected=seat.clone().project(camera);if(projected.z< -1||projected.z>1)continue;
    const pixels=Math.hypot((projected.x-pointer.x)*r.width/2,(projected.y-pointer.y)*r.height/2),hit=ray.ray.intersectSphere(new T.Sphere(seat,.44),new T.Vector3());
    if(!hit&&pixels>18)continue;const score=pixels+(hit?0:10);if(!best||score<best.score)best={option,seat:i,score};
   }
   return best?board(false,context.dest,{carrier:best.option.carrier,seat:best.seat,lift:context.lift,end:context.end}):false;
  }
  function refresh(){if(!person)return;const transport=person.edge?.kind==='lift';$('playerState').textContent=transport?({queue:'Joining queue',load:'Approaching carrier',board:'Boarding',ride:'Riding',unload:'Leaving carrier',networkExit:'Leaving platform'}[person.state]||'At station'):mode==='ski'?'Skiing':person.playerSprinting?'Sprinting':'Walking';for(const m of ['Walk','Ski']){$('player'+m).disabled=transport&&person.state!=='networkExit';$('player'+m).setAttribute('aria-pressed',String(mode===(m==='Walk'?'walk':'ski')));}$('playerCancelQueue').hidden=!transport||!['queue','load'].includes(person.state);$('playerCamera').textContent=firstPerson?'Third person':'First person';nearest=transport?null:stations();const station=$('playerStation');station.hidden=!nearest;if(nearest){const n=nearest,signature=n.lift.def.id+':'+n.end+':'+n.dests.join(',')+':'+n.lift.operations.open+':'+n.lift.operations.running;if(signature!==stationSignature){stationSignature=signature;station.replaceChildren();const name=document.createElement('strong');name.textContent=n.lift.def.name;station.append(name);for(const dest of n.dests){const row=document.createElement('div');row.className='player-tools';const label=dest==='base'?'A':dest==='top'?'B':'Middle';for(const queue of [false,true]){const b=document.createElement('button');b.type='button';b.textContent=(queue?'Queue to ':'Board to ')+label;b.disabled=!n.lift.operations.open||!n.lift.operations.running;b.onclick=()=>board(queue,dest);row.append(b);}station.append(row);}}}else stationSignature='';refreshSeats();}
  function interruptWalk(){
   if(!person)return false;
   if(!guests.resumePlayerWalking(person)&&!guests.cancelPlayerBoarding(person))return false;
   mode='walk';velocity=0;heading=person.g.rotation.y;refresh();return true;
  }
  function setZoom(distance){restore();zoomDistance=clamp(distance,0,32);firstPerson=zoomDistance<.75;if(!firstPerson)lastThirdDistance=zoomDistance;refresh();}
  panel.querySelector('#playerLeave').onclick=close;$('playerCancelQueue').onclick=()=>{if(guests.cancelPlayerBoarding(person)){mode='walk';refresh();}};$('playerWalk').onclick=()=>setMode('walk');$('playerSki').onclick=()=>setMode('ski');$('playerCamera').onclick=()=>{setZoom(firstPerson?lastThirdDistance:0);};
  for(const b of panel.querySelectorAll('[data-player-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(b.dataset.playerKey);if(['KeyW','KeyA','KeyS','KeyD'].includes(b.dataset.playerKey))interruptWalk();b.setPointerCapture?.(e.pointerId);});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>keys.delete(b.dataset.playerKey));}
  function textInput(e){return e.target?.closest?.('input,select,textarea,[contenteditable=true]');}
  window.addEventListener('keydown',e=>{if(!person||textInput(e)||blocked()||e.ctrlKey||e.metaKey||e.altKey)return;const code=e.code;if(e.shiftKey)keys.add('ShiftLeft');if(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','KeyE','KeyV','Escape'].includes(code)){e.preventDefault();e.stopImmediatePropagation();if(code==='Escape'){close();return;}if(code==='KeyE'&&!e.repeat)board();else if(code==='KeyV'&&!e.repeat){setZoom(firstPerson?lastThirdDistance:0);}else{keys.add(code);if(['KeyW','KeyA','KeyS','KeyD'].includes(code))interruptWalk();}}},true);
  window.addEventListener('keyup',e=>{keys.delete(e.code);if(!e.shiftKey&&['ShiftLeft','ShiftRight'].includes(e.code)){keys.delete('ShiftLeft');keys.delete('ShiftRight');}},true);window.addEventListener('blur',clearKeys);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearKeys();});
  function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
  function pick(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);const meshes=[];for(const s of skiers)if(!s.retired&&!s.away&&visible(s.g)){s.g.updateWorldMatrix(true,true);s.g.traverse(o=>{if(o.isMesh&&visible(o))meshes.push(o);});}const hit=ray.intersectObjects(meshes,false)[0];if(!hit)return false;const s=skiers.find(s=>{for(let p=hit.object;p;p=p.parent)if(p===s.g)return true;return false;});if(!s)return false;const cover=ray.intersectObjects(ctx.scene.children.filter(o=>!skiers.some(s=>s.g===o)),true).find(h=>h.object.isMesh&&visible(h.object)&&h.object.material?.transparent!==true);if(cover&&cover.distance<hit.distance-.05)return false;return open(s);}
  canvas.addEventListener('pointerdown',e=>{if(blocked()||e.button!==0&&e.button!==2)return;down={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};if(person){e.preventDefault();e.stopImmediatePropagation();canvas.focus({preventScroll:true});if(!window.LiftCoCapturePointer(canvas,e.pointerId))down=null;}},true);
  canvas.addEventListener('pointermove',e=>{if(!down||down.id!==e.pointerId)return;down.moved||=Math.hypot(e.clientX-down.x,e.clientY-down.y)>5;if(person){yaw-=(e.clientX-down.lastX)*.004;pitch=clamp(pitch-(e.clientY-down.lastY)*.004,-1.15,1.1);}down.lastX=e.clientX;down.lastY=e.clientY;},true);
  canvas.addEventListener('pointerup',e=>{if(!down||down.id!==e.pointerId)return;const click=!down.moved&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<=5;down=null;if(person){if(click&&e.button===0&&!blocked())pickSeat(e);if(canvas.hasPointerCapture?.(e.pointerId))canvas.releasePointerCapture(e.pointerId);e.stopImmediatePropagation();}else if(e.button===0&&click&&!blocked()&&pick(e))e.stopImmediatePropagation();},true);for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{down=null;},true);
  canvas.addEventListener('wheel',e=>{
   if(!person||blocked()||e.ctrlKey||!e.deltaY)return;
   const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?canvas.getBoundingClientRect().height:1);
   setZoom(zoomDistance+clamp(delta,-240,240)*.015*(1+zoomDistance*.12));e.preventDefault();e.stopImmediatePropagation();
  },{capture:true,passive:false});
  function cabinFloor(x,z){
   for(const b of cabinWalks){const dx=x-b.x,dz=z-b.z,across=dx*b.across.x+dz*b.across.z,along=dx*b.along.x+dz*b.along.z;if(across>=b.x0&&across<=b.x1&&along>=b.z0&&along<=b.z1)return b;}
   return null;
  }
  function cabinApproach(x,z){
   for(const b of cabinWalks){const dx=b.x-b.entry.x,dz=b.z-b.entry.z,t=clamp(((x-b.entry.x)*dx+(z-b.entry.z)*dz)/(dx*dx+dz*dz||1),0,1);if(Math.hypot(x-b.entry.x-t*dx,z-b.entry.z-t*dz)<.9)return b;}
   return null;
  }
  function surface(x,z){
   const cabin=cabinFloor(x,z);if(cabin)return cabin.y;
   let y=ctx.surface(x,z);
   for(const r of ctx.paths?.()||[]){if(r.surface!=='timber')continue;let best=null;
    for(let i=1;i<r.samples.length;i++){const a=r.samples[i-1],b=r.samples[i],dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1),0,1),distance=Math.hypot(x-a.x-t*dx,z-a.z-t*dz);if(!best||distance<best.distance)best={distance,d:r.distances[i-1]+t*(r.distances[i]-r.distances[i-1])};}
    if(best&&best.distance<window.LiftCoFootpaths.sample(r,best.d).width/2)y=Math.max(y,window.LiftCoFootpaths.walkY(r,best.d,ctx.surface));
   }
   return y;
  }
  function signed(box,p){const x=p.x-box.x,z=p.z-box.z;return Math.max(Math.abs(x*box.across.x+z*box.across.z)-box.halfWidth,Math.abs(x*box.along.x+z*box.along.z)-box.halfLength);}
  function clear(a,b){if(Math.abs(b.x)>1690||Math.abs(b.z)>1690)return false;for(const box of obstacles){if(window.LiftCoWalkCurves.clear(a,b,[box],.35))continue;if(box.lift){if([cabinFloor(a.x,a.z),cabinFloor(b.x,b.z),cabinApproach(a.x,a.z),cabinApproach(b.x,b.z)].some(c=>c?.lift===box.lift))continue;const points=access.route(box.lift.def,box.end,a,b);if(points?.length===2)continue;}if(signed(box,a)<.35&&signed(box,b)>signed(box,a)+.001)continue;return false;}return true;}
  function simulate(s,dt){if(s!==person)return false;restore();if(blocked()){clearKeys();return true;}if(s.edge?.kind==='lift'){if(['KeyW','KeyA','KeyS','KeyD'].some(key=>keys.has(key)))interruptWalk();if(s.edge?.kind==='lift')return false;}
   if(!skiers.includes(s)||s.retired){close();return true;}if(dt<=0)return true;
   if(!['playerWalk','ski'].includes(s.state)){mode='walk';velocity=0;guests.clearPose(s);s.edge=null;s.state=mode==='ski'?'ski':'playerWalk';s.g.scale.setScalar(1);}
   const context=seatContext();cabinWalks=(context?.options||[]).map(option=>{const angle=option.carrier.yaw+context.lift.root.rotation.y,along={x:Math.sin(angle),z:Math.cos(angle)},across={x:Math.cos(angle),z:-Math.sin(angle)},points=option.points,x=points.reduce((n,p)=>n+p.x,0)/points.length,z=points.reduce((n,p)=>n+p.z,0)/points.length,local=points.map(p=>({x:(p.x-x)*across.x+(p.z-z)*across.z,z:(p.x-x)*along.x+(p.z-z)*along.z}));return{lift:context.lift,entry:option.target,x,z,y:points.reduce((n,p)=>n+p.y,0)/points.length,along,across,x0:Math.min(...local.map(p=>p.x))-.40,x1:Math.max(...local.map(p=>p.x))+.40,z0:Math.min(...local.map(p=>p.z))-.42,z1:Math.max(...local.map(p=>p.z))+.42};});
   s.t+=dt;s.walking=false;s.playerSprinting=mode==='walk'&&['KeyW','KeyA','KeyS','KeyD'].some(k=>keys.has(k))&&(keys.has('ShiftLeft')||keys.has('ShiftRight'));const f=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),side=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),brake=keys.has('Space')||keys.has('KeyS'),steps=Math.max(1,Math.ceil(dt/.035)),h=dt/steps;
   for(let i=0;i<steps;i++){
    let dx=0,dz=0;
    if(mode==='walk'){forward.set(-Math.sin(yaw),0,-Math.cos(yaw));right.set(Math.cos(yaw),0,-Math.sin(yaw));desired.copy(forward).multiplyScalar(f).addScaledVector(right,side);if(desired.lengthSq()>0){desired.normalize();const pace=s.playerSprinting?Math.max(3.8,window.LiftCoGuestWalking.speed(s)*2.25):window.LiftCoGuestWalking.speed(s);dx=desired.x*pace*h;dz=desired.z*pace*h;heading=Math.atan2(desired.x,desired.z);}}
    else{heading-=side*h*(.65+Math.min(velocity,12)*.045);if(side&&firstPerson)yaw=heading+Math.PI;const sx=Math.sin(heading),sz=Math.cos(heading),grade=(ctx.height(s.x+sx*.6,s.z+sz*.6)-ctx.height(s.x-sx*.6,s.z-sz*.6))/1.2;velocity=clamp(velocity+(-9.81*grade/Math.sqrt(1+grade*grade)+(keys.has('KeyW')?2.4*Math.max(0,1-velocity/3.5):0)-(keys.has('KeyW')?.09:.14)*velocity-(brake?12:0))*h,0,18);dx=sx*velocity*h;dz=sz*velocity*h;}
    const a={x:s.x,z:s.z},b={x:s.x+dx,z:s.z+dz};if(clear(a,b)&&(mode==='ski'||Math.abs(surface(b.x,b.z)-surface(a.x,a.z))<Math.hypot(dx,dz)*1.3+.02||((cabinFloor(a.x,a.z)||cabinFloor(b.x,b.z))&&Math.abs(surface(b.x,b.z)-surface(a.x,a.z))<.45))){s.x=b.x;s.z=b.z;s.walking=mode==='walk'&&Math.hypot(dx,dz)>.00001;}else{velocity=0;}
   }
   s.g.scale.setScalar(1);
   if(mode==='walk'){s.state='playerWalk';s.g.rotation.set(0,heading,0);s.g.position.set(s.x,surface(s.x,s.z),s.z);s.skiPose=null;}
   else{const fx=Math.sin(heading),fz=Math.cos(heading),along=(ctx.height(s.x+fx*.7,s.z+fz*.7)-ctx.height(s.x-fx*.7,s.z-fz*.7))/1.4,across=(ctx.height(s.x+fz*.3,s.z-fx*.3)-ctx.height(s.x-fz*.3,s.z+fx*.3))/.6;normal.set(-along*fx-across*fz,1,-along*fz+across*fx).normalize();forward.set(fx,along,fz).normalize();right.crossVectors(normal,forward).normalize();up.crossVectors(forward,right).normalize();basis.makeBasis(right,up,forward);s.g.quaternion.setFromRotationMatrix(basis);s.g.position.set(s.x,ctx.height(s.x,s.z)-.035,s.z);s.state='ski';s.heading=heading;s.actualSpeed=velocity;s.skiPose={lean:clamp(side*velocity*.025,-.4,.4),turn:Math.abs(side),speed:velocity,push:false,skating:velocity<3&&keys.has('KeyW')?1:0,phase:s.t*4,brake:brake?1:0,novice:false,crouch:.2+Math.min(.35,velocity*.02)};ctx.tracks?.(s);}
   ctx.equipment(s);if(mode==='ski')guests.pose(s);return true;
  }
  function updateCamera(dt,now){restore();if(!person)return false;if(!skiers.includes(person)||person.retired){close();return false;}if(blocked()){clearKeys();return true;}if(now-lastUI>.2){refresh();lastUI=now;}controls.enabled=false;if(person.state==='ride'){if(rideHeading!==null)yaw+=Math.atan2(Math.sin(person.g.rotation.y-rideHeading),Math.cos(person.g.rotation.y-rideHeading));else yaw+=Math.atan2(Math.sin(person.g.rotation.y-heading),Math.cos(person.g.rotation.y-heading));rideHeading=person.g.rotation.y;}else rideHeading=null;up.set(0,1,0);person.g.updateWorldMatrix(true,true);person.head.getWorldPosition(eye);
   zoomCurrent+=((firstPerson?0:zoomDistance)-zoomCurrent)*(1-Math.exp(-12*Math.max(0,dt)));if(snap)zoomCurrent=firstPerson?0:zoomDistance;
   forward.set(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));target.copy(eye).add(forward);
   desired.copy(eye).addScaledVector(forward,-zoomCurrent);desired.y+=zoomCurrent*.13;
   if(zoomCurrent>1.1)desired.y=Math.max(desired.y,ctx.height(desired.x,desired.z)+.35);
   if(snap||zoomCurrent<.75)camera.position.copy(desired);else camera.position.lerp(desired,1-Math.exp(-14*dt));camera.up.copy(up);camera.lookAt(target);
   controls.target.copy(target);snap=false;return true;
  }
  function afterVisibility(){if(person&&zoomCurrent<1.1){person.g.visible=false;hidden=true;}}
  return{open,close,pick,pickSeat,board,setMode,simulate,updateCamera,afterVisibility,panel,get active(){return !!person;},get person(){return person;},get firstPerson(){return firstPerson;},get zoomDistance(){return zoomDistance;}};
 }
 return{create};
})();
