window.LiftCoFunitelViewer={start(T,OrbitControls,RoomEnvironment){
 const data=window.LiftCoFunitelStudy,f=data.createFactory(T),$=id=>document.getElementById(id),report='https://www.remontees-mecaniques.net/bdd/reportage-fun-v-rocharbois-poma-4761.html',refPath='../assets/references/funitel/rocharbois/';
 const refs=[
  ['cabin-drawing','Sotelem cabin drawing — three linked sections; drawing credited to Chin@ill in the report.'],
  ['cabin-side','Long side and narrow glazed end, with roof-mounted fixed grips.'],
  ['cabin-front','Cabin end-on: the two ropes sit approximately at the cabin sides.'],
  ['cabin-quarter','Cabin passing a support; view of the skirt, windows and roof.'],
  ['grip-overview','Three double fixed-grip units on each side of the roof.'],
  ['grip-detail','Original attachment detail. The revised proposal uses direct fixed jaws, with no cabin-mounted wheels.'],
  ['tower-head','Yumbo tower: tubular shaft, central crosshead and four longitudinal support trains.'],
  ['tower-p3','Full tower proportions and maintenance access.'],
  ['tower-p4','Second tower proportion reference.'],
  ['return-terminal','Timber return terminal exterior.'],
  ['return-pulley','Return machinery inside the timber terminal.'],
  ['drive-platform','Brown boarding frame, projecting sheaves and cabin at the platform.'],
  ['drive-entrance','Wider Caboche building and exterior boarding frame.'],
  ['drive-double-groove','Double-groove drive wheel inside the machinery building.'],
  ['drive-machinery','Alpha drive machinery; reference for the rear equipment volume.'],
  ['rope-routing','Two-loop rope-routing diagram, credited to Dj_Jean_Jean in the report.'],
  ['drive-rope-deflection','Incoming ropes divert into the drive machinery behind the boarding area.'],
  ['drive-guide-sheaves','Close-up of the guide sheaves beside the double-groove wheel.']
 ];
 const groups={cabins:{title:'Three ways to read Sotelem.',short:'Cabins',items:data.cabins,space:10.5},towers:{title:'Four ropes. One crosshead.',short:'Towers',items:data.towers,space:15.5},stations:{title:'Two bays, open machinery.',short:'Stations',items:data.stations,space:19.5}};
 const state={mode:'cabins',chosen:{cabins:0,towers:0,stations:0},compare:true,view:'quarter',door:0,targetDoor:0,paint:'#355768',glass:.4,cutaway:false,auto:false,paused:false,time:0,manual:null,followZ:null,followY:null,mechanismPaused:false,markers:false};
 document.body.innerHTML=`
 <aside class="sidebar"><div class="brand"><a href="../empty-map.html">Lift Co<i>.</i></a><span>ROPEWAY ATELIER</span></div>
 <nav class="family-nav" aria-label="Study sections"><button data-mode="cabins">01 / Cabins</button><button data-mode="towers">02 / Towers</button><button data-mode="stations">03 / Stations</button><button data-mode="line">04 / Together</button></nav>
 <header class="intro"><span class="eyebrow">ROCHARBOIS / SHAPE STUDY 10 / CABIN A SELECTED</span><h1>A horizontal<br>connection.</h1><p>A long, three-section cabin joined by accordion bellows and clamped directly to two ropes. Selected Sotelem cabin A, with three tower and terminal proposals.</p><span class="route-tag">REVERSIBLE / PARALLEL ROPE PAIRS</span></header>
 <div class="fact-strip"><div><b>2</b><span>Shuttle cabins</span></div><div><b>3 m</b><span>Rope spacing</span></div><div><b>5 m/s</b><span>Reference speed</span></div></div>
 <div class="variants" id="variants" aria-label="Design proposals"></div>
 <section class="section" id="assemblyPanel" hidden><span class="eyebrow">YOUR COMBINATION</span><div class="build-selects">${Object.entries(groups).map(([key,g])=>`<label>${g.short}<select data-combination="${key}">${g.items.map((v,i)=>`<option value="${i}">${v.id} / ${v.name}</option>`).join('')}</select></label>`).join('')}</div></section>
 <section class="section" id="inspectPanel"><span class="eyebrow">INSPECT THE CONSTRUCTION</span><div id="doorPanel"><div class="row spread"><label for="door" class="small">Compartment doors</label><span id="doorValue" class="eyebrow">CLOSED</span></div><input type="range" id="door" min="0" max="1" step=".01" value="0"><button id="toggleDoor" class="door-button">Open all three compartments ↗</button></div><label class="check"><input type="checkbox" id="cutaway">Hide roof / expose the structure</label><div id="stationPanel" hidden><button id="mechanismPause" style="width:100%;margin-top:8px">Pause mechanism</button><label class="check"><input id="motionMarkers" type="checkbox">Rope motion markers</label></div><div id="glassPanel"><label class="small" for="glass">Glass opacity</label><input id="glass" type="range" min=".08" max=".65" step=".01" value=".4"></div></section>
 <section class="section" id="journeyPanel" hidden><span class="eyebrow">PAIRED SHUTTLE / LEVEL TERMINALS</span><div class="row"><button id="pause">Pause</button><button id="crossing">Tower passage</button><button id="dock">Dock</button></div><label for="journey" class="small">Cabin position</label><input id="journey" type="range" min="0" max="1" step=".001" value="0"><p class="machine-note">The cabin’s weight pulls its two ropes down. Weight makes a continuous cable curve. Each level section stays linked to its two clamps through a short roof pivot. The return has three pulleys; the double-groove drive swaps inner and outer strands. Hide the roof to inspect the complete routing.</p></section>
 <section class="section" id="colourPanel"><span class="eyebrow">COLOUR IS INDEPENDENT OF SHAPE</span><div class="color-row"><button data-paint="#355768" style="background:#355768" aria-label="Reference blue"></button><button data-paint="#b7352c" style="background:#b7352c" aria-label="Lift Co. red"></button><button data-paint="#e8e5d8" style="background:#e8e5d8" aria-label="Ivory"></button><input type="color" id="paint" value="#355768" aria-label="Custom cabin colour"></div></section>
 <section class="section"><span class="eyebrow">REPORT PHOTOS & DRAWINGS</span><div class="refs" id="refs"></div><p class="credit">J’ib / Remontées-Mécaniques.net. Original credits preserved. <a href="${report}" target="_blank" rel="noopener">Full Rocharbois report ↗</a></p><button id="allRefs" style="width:100%;margin-top:8px">Browse all 18 references ↗</button></section>
 <p class="footer-note">Cabin A selected. Tower & terminal proposals.<br>Estimated model proportions.<br><a href="../docs/funitel-rocharbois.md">Research & design notes ↗</a> · <a href="../empty-map.html">Resort ↗</a></p></aside>
 <main id="stage" aria-label="Interactive funitel design study"><header class="topbar"><div><span class="eyebrow">MEGÈVE / A CONNECTION BETWEEN MASSIFS</span><strong>Rocharbois · Poma / Sotelem / Yumbo</strong></div><div class="row"><button id="compare" aria-pressed="true">Compare A / B / C</button><button id="rotate" aria-pressed="false">Rotate</button></div></header>
 <nav class="views" aria-label="Camera presets"><button data-view="quarter">¾ view</button><button data-view="front">End-on</button><button data-view="side">Side</button><button data-view="top">Roof / plan</button><button data-view="detail" id="detailButton">Grips</button><button id="reset">Reset ↺</button></nav>
 <div id="phase" hidden></div><div class="caption"><span class="eyebrow" id="captionCode"></span><h2 id="captionTitle"></h2><p id="captionNote"></p><div class="specs" id="specs"></div><p class="estimate" id="estimate">VISUAL ESTIMATES / SHARED METRE SCALE</p></div>
 <p class="hint">left-drag = orbit · right-drag = look in place · scroll = zoom · A / B / C = inspect · Esc = compare</p>
 ${[0,1,2].map(i=>`<div class="model-label" id="label${i}"></div>`).join('')}</main>
 <dialog id="reference"><div class="row"><span class="eyebrow" id="refTitle"></span><button id="closeRef" autofocus>Close ×</button></div><img id="refImage" alt=""><p class="ref-caption" id="refCaption"></p><div class="row"><button id="previousRef">← Previous</button><p id="refCount"></p><button id="nextRef">Next →</button></div></dialog><pre id="error" class="error" hidden></pre>`;
 const stage=$('stage'),renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));renderer.setSize(stage.clientWidth,stage.clientHeight);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;stage.prepend(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color(0xe9e9e0);scene.fog=new T.Fog(0xe9e9e0,300,800);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight(0xfff3dc,0x7f8c79,2));const sun=new T.DirectionalLight(0xffdfae,3.1);sun.position.set(-40,65,28);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-60,right:60,top:65,bottom:-65,near:.5,far:200});sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=.04;sun.shadow.bias=-.00015;sun.shadow.radius=3;scene.add(sun);const fill=new T.DirectionalLight(0xd7e9e7,1.1);fill.position.set(30,15,-30);scene.add(fill);
 const floor=new T.Mesh(new T.PlaneGeometry(1600,1600),new T.MeshStandardMaterial({color:0xe3e5d9,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.04;floor.receiveShadow=true;scene.add(floor);
 const grid=new T.GridHelper(180,90,0xc8cfc0,0xd3d8ca);grid.position.y=-.03;grid.material.transparent=true;grid.material.opacity=.25;scene.add(grid);
 const camera=new T.PerspectiveCamera(37,stage.clientWidth/stage.clientHeight,.04,2000),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;controls.mouseButtons.RIGHT=null;controls.minDistance=.25;controls.maxDistance=600;controls.maxPolarAngle=Math.PI*.98;
 const collections={},root=new T.Group();scene.add(root);let line=null;
 function list(mode){if(!collections[mode])collections[mode]=groups[mode].items.map((v,i)=>{const model=mode==='cabins'?f.makeCabin(i):mode==='towers'?f.makeTower(i):f.makeStation(i);root.add(model.root);return model;});return collections[mode];}
 const lineHeight=8,deck=lineHeight-f.ropeHeight,stop=83;
 function rebuildLine(){
  if(line){root.remove(line.root);line.root.traverse(o=>{if(o.isMesh&&o.userData.lineOnly)o.geometry.dispose();});}
  const g=new T.Group();root.add(g);line={root:g,cabins:[],stations:[],towers:[],ropes:[],route:f.createRoute({height:lineHeight,stationLength:data.stations[state.chosen.stations].length,stop})};
  line.loadedModel=window.LiftCoLoadedRope.create(line.route,{first:-87.35,last:87.35});
  distance=line.route.length;cruiseTime=(distance-accelDistance-brakeDistance)/speed;travelTime=accelTime+cruiseTime+brakeTime;
  for(const [side,role] of [[-1,'return'],[1,'drive']]){
   const station=f.makeStation(state.chosen.stations,{deck,stubs:false,role});station.root.position.z=side*85;station.root.rotation.y=side===-1?Math.PI:0;g.add(station.root);line.stations.push(station);
   // Section-model foundation plinths support both level terminals.
   f.box(g,14.1,deck-.52,26,0,(deck-.52)/2,side*85,f.M.concrete);
  }
  for(const z of [-40,0,40]){const tower=f.makeTower(state.chosen.towers,{height:lineHeight,stubs:false});tower.root.position.z=z;g.add(tower.root);line.towers.push(tower);}
  for(const side of [-1,1]){const c=f.makeCabin(state.chosen.cabins,{stubs:false});c.root.position.set(side*f.lane,deck,side*stop);g.add(c.root);line.cabins.push(c);line.ropes.push([-1,1].map(edge=>f.dynamicRope(g,side*f.lane+edge*1.5,-87.35,87.35)));}
  // Each rebuild uses shared primitive geometries. Dispose just the unique,
  // merged buffers belonging to the discarded assembly, not cached primitives.
  line.root.traverse(o=>{if(o.isMesh&&o.geometry.type==='BufferGeometry')o.userData.lineOnly=true;});
  applyAppearance();updateLine();
 }
 function allCabins(){return[...(collections.cabins||[]),...(line?.cabins||[])];}
 function applyAppearance(){
  allCabins().forEach(c=>{c.paint.color.set(state.paint);c.setCutaway(state.cutaway);c.setOpen(state.door);});f.M.glass.opacity=state.glass;
  for(const s of [...(collections.stations||[]),...(line?.stations||[])]){s.setCutaway(state.cutaway);s.setMarkers(state.markers);}
 }
 function buildCards(){
  const group=groups[state.mode];$('variants').hidden=!group;$('assemblyPanel').hidden=!!group;
  if(group)$('variants').innerHTML=group.items.map((v,i)=>`<button class="variant" data-variant="${i}" aria-pressed="false"><span class="letter">${v.id}</span><span><strong>${v.name}</strong><small>${state.mode==='cabins'?v.w.toFixed(1)+' × '+v.d.toFixed(1)+' × '+v.h.toFixed(2)+' m':state.mode==='towers'?'TUBULAR SHAFT / FOUR SUPPORT TRAINS':v.kind==='return'?'TIMBER / THREE RETURN PULLEYS':'STEEL PORCH / DRIVE MACHINERY'}</small></span></button>`).join('');
  document.querySelectorAll('[data-variant]').forEach(b=>b.onclick=()=>choose(+b.dataset.variant));
  document.querySelectorAll('[data-combination]').forEach(el=>el.value=state.chosen[el.dataset.combination]);
 }
 function showMode(mode){state.mode=mode;state.compare=mode!=='line'&&groups[mode].items.length>1;state.view='quarter';buildCards();if(mode==='line')rebuildLine();else list(mode);updateSelection();}
 function choose(i){if(state.mode==='line'||i>=groups[state.mode].items.length)return;state.chosen[state.mode]=i;state.compare=false;updateSelection();}
 function specHTML(values){return values.map(([value,name])=>`<div><b>${value}</b><span>${name}</span></div>`).join('');}
 function updateSelection(reframe=true){
  for(const [mode,models] of Object.entries(collections))models.forEach((m,i)=>{m.root.visible=state.mode===mode&&(state.compare||i===state.chosen[mode]);m.root.position.x=state.compare&&state.mode===mode?(i-(models.length-1)/2)*groups[mode].space:0;m.root.rotation.y=0;});if(line)line.root.visible=state.mode==='line';
  const isLine=state.mode==='line',isCabin=state.mode==='cabins',isStation=state.mode==='stations';
  stage.classList.toggle('compare',state.compare);stage.classList.toggle('single',!state.compare);$('compare').hidden=isLine||groups[state.mode].items.length===1;$('compare').setAttribute('aria-pressed',String(state.compare));$('phase').hidden=!isLine;
  $('doorPanel').hidden=!isCabin;$('glassPanel').hidden=!(isCabin||isLine);$('colourPanel').hidden=!(isCabin||isLine);$('inspectPanel').hidden=state.mode==='towers';$('journeyPanel').hidden=!isLine;$('stationPanel').hidden=!(isStation||isLine);$('mechanismPause').hidden=isLine;
  $('detailButton').textContent=isCabin?'Grips':isStation?'Machinery':isLine?'Follow cabin':'Wheel trains';
  document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));
  document.querySelectorAll('[data-variant]').forEach(b=>{const active=!state.compare&&+b.dataset.variant===state.chosen[state.mode];b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  if(isLine){$('captionCode').textContent='HORIZONTAL SHUTTLE / YOUR COMBINATION';$('captionTitle').textContent='Two cabins. Back and forth.';$('captionNote').textContent='Equal-height terminals, two rope pairs and three independently loaded, level sections with direct fixed clamps. Cabins stay on their own lanes and reverse together.';$('specs').innerHTML=specHTML([[distance.toFixed(1)+' m','Rope travel'],['5 m/s','Cruise'],['2 × 3','Compartments']]);$('estimate').textContent='COMPACT MOTION SCHEMATIC / NOT THE FULL REAL-WORLD LINE';}
  else{
   const group=groups[state.mode],v=group.items[state.chosen[state.mode]];$('captionCode').textContent=state.compare?'THREE INTERPRETATIONS / '+group.short.toUpperCase():'PROPOSAL '+v.id+' / '+group.short.toUpperCase();$('captionTitle').textContent=state.compare?group.title:v.name;$('captionNote').textContent=v.note;
   $('specs').innerHTML=specHTML(isCabin?[[v.w.toFixed(1)+' m','Width'],[v.d.toFixed(1)+' m','Length'],[v.h.toFixed(2)+' m','Body']]:isStation?[[v.length+' m','Length'],['2','Docking bays'],[v.kind==='return'?'3':'2 grooves','Pulley group']]:[['12 m','Rope height'],['4','Rope lanes'],['12','Sheaves / lane']]);$('estimate').textContent='VISUAL ESTIMATES / SHARED METRE SCALE';
  }
  renderRefs();applyAppearance();if(reframe)frame();
 }
 function frame(view=state.view){
  state.view=view;const isLine=state.mode==='line',models=isLine?[]:list(state.mode),selected=state.chosen[state.mode]||0;
  // In comparison, rotate the objects instead of looking along the row.
  if(state.compare)models.forEach(m=>m.root.rotation.y=view==='side'?Math.PI/2:view==='quarter'?.48:0);
  const bounds=new T.Box3();if(isLine)bounds.setFromObject(line.root);else for(const m of models)if(m.root.visible)bounds.expandByObject(m.root);
  const centre=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
  let distance;
  let direction=new T.Vector3(...({quarter:[1,.42,1.35],front:[0,.08,1],side:[1,.12,0],top:[.001,1,.001],detail:[1,.4,1]}[view]));
  if(state.compare&&view!=='top')direction.set(0,view==='quarter'?.28:.12,1);
  direction.normalize();
  const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),direction).normalize(),up=new T.Vector3().crossVectors(direction,right),extent=axis=>(Math.abs(axis.x)*size.x+Math.abs(axis.y)*size.y+Math.abs(axis.z)*size.z)/2,tan=Math.tan(T.MathUtils.degToRad(18.5));
  distance=(Math.max(extent(right)/(tan*camera.aspect),extent(up)/tan)+extent(direction))*1.18;
  if(view==='detail'){
   state.compare=false;models.forEach((m,i)=>{m.root.visible=i===selected;m.root.position.x=0;m.root.rotation.y=0;});stage.classList.remove('compare');stage.classList.add('single');$('compare').setAttribute('aria-pressed','false');
   if(isLine){const c=line.cabins[0];centre.copy(c.root.position).add(new T.Vector3(0,2.2,0));distance=16;}
   else if(state.mode==='cabins'){centre.set(1.5,f.ropeHeight,0);distance=6.5;}
   else if(state.mode==='towers'){centre.set(3.5,11.8,0);distance=12;}
   else{const s=models[selected];centre.set(0,s.ropeY,s.back-2);distance=13;direction.set(.6,1,-1);}
  }
  if(isLine&&view==='front')distance=70;if(isLine&&view==='side'){direction.set(1,.5,.12);distance=240;}if(isLine&&view==='top')distance=260;
  state.followZ=isLine&&view==='detail'?line.cabins[0].root.position.z:null;state.followY=isLine&&view==='detail'?line.cabins[0].root.position.y:null;
  controls.enableDamping=false;controls.update();controls.target.copy(centre);camera.position.copy(centre).addScaledVector(direction.normalize(),Math.max(3,distance));camera.up.set(0,1,0);camera.lookAt(centre);controls.update();controls.enableDamping=true;
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 }
 function setDoor(value){state.targetDoor=+value;$('door').value=value;$('doorValue').textContent=value==0?'CLOSED':value==1?'OPEN':Math.round(value*100)+'%';$('toggleDoor').textContent=+value>.5?'Close compartments ↙':'Open all three compartments ↗';}
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>showMode(b.dataset.mode));document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{if(b.dataset.view==='detail'&&state.compare){state.compare=false;updateSelection(false);}frame(b.dataset.view);});
 $('compare').onclick=()=>{state.compare=!state.compare;updateSelection();};$('rotate').onclick=()=>{state.auto=!state.auto;$('rotate').setAttribute('aria-pressed',String(state.auto));};$('reset').onclick=()=>frame('quarter');
 $('door').oninput=e=>setDoor(e.target.value);$('toggleDoor').onclick=()=>setDoor(state.targetDoor>.5?0:1);$('mechanismPause').onclick=()=>{state.mechanismPaused=!state.mechanismPaused;$('mechanismPause').textContent=state.mechanismPaused?'Run mechanism':'Pause mechanism';};$('motionMarkers').onchange=e=>{state.markers=e.target.checked;applyAppearance();};
 $('cutaway').onchange=e=>{state.cutaway=e.target.checked;applyAppearance();};$('glass').oninput=e=>{state.glass=+e.target.value;applyAppearance();};
 function paint(value){state.paint=value;$('paint').value=value;applyAppearance();}$('paint').oninput=e=>paint(e.target.value);document.querySelectorAll('[data-paint]').forEach(b=>b.onclick=()=>paint(b.dataset.paint));
 document.querySelectorAll('[data-combination]').forEach(el=>el.onchange=()=>{state.chosen[el.dataset.combination]=+el.value;rebuildLine();updateSelection();});
 function pause(value){state.paused=value;$('pause').textContent=value?'Resume':'Pause';}
 $('pause').onclick=()=>{if(state.paused&&state.manual!==null){const d=state.manual*distance,move=d<accelDistance?Math.sqrt(2*d/(speed/accelTime)):d>distance-brakeDistance?travelTime-Math.sqrt(2*(distance-d)/(speed/brakeTime)):accelTime+(d-accelDistance)/speed;state.time=dwell+move;state.manual=null;}pause(!state.paused);};
 $('journey').oninput=e=>{state.manual=+e.target.value;pause(true);updateLine();};$('crossing').onclick=()=>{state.manual=.5;pause(true);updateLine();frame('detail');};$('dock').onclick=()=>{state.manual=0;pause(true);updateLine();frame('front');};
 const accelTime=3,brakeTime=16,speed=5,accelDistance=speed*accelTime/2,brakeDistance=speed*brakeTime/2,dwell=7,swayAmplitude=T.MathUtils.degToRad(.65);let distance=stop*2,cruiseTime=(distance-accelDistance-brakeDistance)/speed,travelTime=accelTime+cruiseTime+brakeTime;
 function journey(){
  if(state.manual!==null)return{u:state.manual,sway:0,open:state.manual===0||state.manual===1?1:0,phase:'PAUSED / POSITION INSPECTION'};
  const half=travelTime+dwell,t=state.time%(half*2),reverse=t>=half,local=t%half;
  if(local<dwell){
   const open=T.MathUtils.smoothstep(local,1.1,2)*(1-T.MathUtils.smoothstep(local,dwell-2,dwell-.5)),omega=4.2,decay=.8;
   // Match the final braking lean with zero initial angular velocity, then settle.
   const sway=state.time<dwell?0:(reverse?-1:1)*swayAmplitude*Math.exp(-decay*local)*(Math.cos(omega*local)+decay/omega*Math.sin(omega*local));
   return{u:reverse?1:0,open,sway,phase:'DOCKED / '+(local<1.1?'SETTLING':open>.5?'BOARDING':'DOORS CLOSING')};
  }
  const move=local-dwell;let d;
  if(move<accelTime)d=.5*(speed/accelTime)*move*move;
  else if(move<accelTime+cruiseTime)d=accelDistance+(move-accelTime)*speed;
  else{const remaining=travelTime-move;d=distance-.5*(speed/brakeTime)*remaining*remaining;}
  const u=T.MathUtils.clamp(d/distance,0,1),remaining=travelTime-move,sway=(reverse?1:-1)*swayAmplitude*(1-T.MathUtils.smoothstep(remaining,0,3));return{u:reverse?1-u:u,open:0,sway,phase:move<accelTime?'DEPARTING / BOTH CABINS':move>travelTime-brakeTime?'BRAKING / LONG STATION APPROACH':'TRAVELLING / 5 M/S'};
 }
 function updateLine(dt=0){if(!line)return;const j=journey();line.cabins.forEach((c,i)=>{
  const u=i===0?j.u:1-j.u,sway=i===0?j.sway:-j.sway;
  if(c.loadedU!==u||c.loadedSway!==sway){
   const z=line.route.atDistance(u*distance).z,loaded=line.loadedModel.solve({z,sections:c.loadSections,sway});
   c.setLoadedPose(loaded);for(const rope of line.ropes[i])rope.update(loaded.atZ,loaded.knots);c.loadedU=u;c.loadedSway=sway;c.loadedProfile=loaded.atZ;c.loadedZ=z;
  }
  c.setOpen(j.open);
 });
 const drive=j.u*distance,ropeSpeed=dt>0&&line.lastDrive!==undefined?(drive-line.lastDrive)/dt:0;line.lastDrive=drive;
 for(const station of line.stations)station.setDrive(drive);
 for(const tower of line.towers)tower.updateWheels(dt,ropeSpeed,line.cabins.map(c=>c.loadedProfile),line.cabins.map(c=>c.loadedZ));
 if(state.mode==='line'&&state.view==='detail'&&state.followZ!==null){const p=line.cabins[0].root.position,delta=p.z-state.followZ,dy=p.y-state.followY;camera.position.z+=delta;controls.target.z+=delta;camera.position.y+=dy;controls.target.y+=dy;state.followZ=p.z;state.followY=p.y;}$('journey').value=j.u;$('phase').textContent=j.phase;}
 let refIndex=0;
 function showReference(i){refIndex=(i+refs.length)%refs.length;const [file,caption]=refs[refIndex];$('refImage').src=refPath+file+'.jpg';$('refImage').alt=caption;$('refTitle').textContent='ROCHARBOIS / '+file.replaceAll('-',' ').toUpperCase();$('refCaption').textContent=caption;$('refCount').textContent=(refIndex+1)+' / '+refs.length;if(!$('reference').open)$('reference').showModal();}
 function renderRefs(){const indices=state.mode==='cabins'?[0,1,2,3,4,5]:state.mode==='towers'?[6,7,8,3,4,15]:state.mode==='stations'?[9,10,11,13,17,15]:[15,13,17,10,11,4];$('refs').innerHTML=indices.map(i=>`<button data-ref="${i}" aria-label="Enlarge ${refs[i][0].replaceAll('-',' ')}"><img loading="lazy" src="${refPath+refs[i][0]}.jpg" alt="${refs[i][1]}"></button>`).join('');document.querySelectorAll('[data-ref]').forEach(b=>b.onclick=()=>showReference(+b.dataset.ref));}
 $('allRefs').onclick=()=>showReference(0);$('closeRef').onclick=()=>$('reference').close();$('previousRef').onclick=()=>showReference(refIndex-1);$('nextRef').onclick=()=>showReference(refIndex+1);
 addEventListener('keydown',e=>{if($('reference').open){if(e.key==='ArrowLeft')showReference(refIndex-1);if(e.key==='ArrowRight')showReference(refIndex+1);return;}if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(document.activeElement?.tagName))return;const i='abc'.indexOf(e.key.toLowerCase());if(i>=0&&e.key.length===1)choose(i);if(e.key==='Escape'&&state.mode!=='line'){state.compare=groups[state.mode].items.length>1;updateSelection();}});
 let look=null;const euler=new T.Euler(0,0,0,'YXZ'),forward=new T.Vector3();
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==2)return;e.preventDefault();e.stopImmediatePropagation();const position=camera.position.clone(),quaternion=camera.quaternion.clone();controls.enableDamping=false;controls.update();controls.enableDamping=true;camera.position.copy(position);camera.quaternion.copy(quaternion);controls.enabled=false;look={id:e.pointerId,x:e.clientX,y:e.clientY,distance:Math.max(.5,camera.position.distanceTo(controls.target))};euler.setFromQuaternion(camera.quaternion,'YXZ');renderer.domElement.setPointerCapture(e.pointerId);},true);
 renderer.domElement.addEventListener('pointermove',e=>{if(!look||look.id!==e.pointerId)return;euler.y-=(e.clientX-look.x)*.003;euler.x=T.MathUtils.clamp(euler.x-(e.clientY-look.y)*.003,-Math.PI/2+.01,Math.PI/2-.01);euler.z=0;camera.quaternion.setFromEuler(euler);controls.target.copy(camera.position).addScaledVector(camera.getWorldDirection(forward),look.distance);look.x=e.clientX;look.y=e.clientY;});
 function endLook(){if(!look)return;const id=look.id;look=null;if(renderer.domElement.hasPointerCapture(id))renderer.domElement.releasePointerCapture(id);controls.enabled=true;}
 for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,endLook);addEventListener('blur',endLook);renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
 addEventListener('resize',()=>{renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();});
 function error(e){$('error').hidden=false;$('error').textContent+=String(e.message||e.reason||e)+'\n';}addEventListener('error',error);addEventListener('unhandledrejection',error);
 let mechanismTime=0;const clock=new T.Clock(),point=new T.Vector3();showMode('cabins');
 function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);state.door=T.MathUtils.damp(state.door,state.targetDoor,6,dt);(collections.cabins||[]).forEach(c=>c.setOpen(state.door));if(state.mode==='line'){if(!state.paused)state.time+=dt;updateLine(state.paused?0:dt);}
  if(state.mode==='towers')for(const tower of collections.towers)tower.updateWheels(dt,3);
  if(state.mode==='stations'){if(!state.mechanismPaused)mechanismTime+=dt;for(const station of collections.stations)station.setDrive(12*Math.sin(mechanismTime*.25));}
  controls.autoRotate=state.auto&&!look;controls.autoRotateSpeed=.45;if(controls.enabled)controls.update();
  for(let i=0;i<3;i++){const label=$('label'+i);label.hidden=!state.compare||state.mode==='line'||i>=groups[state.mode].items.length;if(label.hidden)continue;const m=list(state.mode)[i],v=groups[state.mode].items[i];point.set(m.root.position.x,-.1,state.mode==='cabins'?5.1:state.mode==='stations'?12:5).project(camera);label.style.left=(point.x*.5+.5)*stage.clientWidth+'px';label.style.top=(-point.y*.5+.5)*stage.clientHeight+'px';label.hidden=point.z>1||point.z<-1;label.innerHTML='<b>'+v.id+' / '+v.name+'</b><span>'+groups[state.mode].short.toUpperCase()+' / PROPOSAL '+v.id+'</span>';}
  renderer.render(scene,camera);
 }animate();
}};
