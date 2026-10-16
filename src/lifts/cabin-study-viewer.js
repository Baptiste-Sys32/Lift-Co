// Shared lightweight inspection room for the three separate reference studies.
window.LiftCoCabinStudyViewer={start(T,OrbitControls,RoomEnvironment,familyId){
 const family=window.LiftCoGondolaStudies.families[familyId],$=id=>document.getElementById(id),families=window.LiftCoGondolaStudies.families;
 const variantNames=family.variants.map(v=>v.id).join(' · '),selectionNote=family.approved?'Selected design'+(family.variants.length>1?'s':''):'Three new interpretations / revision '+(family.revision||1),defaultOpacity=familyId==='jaillet'?.43:.34;
 document.title='Lift Co. — '+family.name+' cabin studies';
 const rootPath='../assets/references/gondolas/megeve/';
 document.body.innerHTML=`
 <aside class="sidebar">
  <div class="brand"><a href="../empty-map.html">Lift Co<i>.</i></a><span>CABIN ATELIER</span></div>
  <nav class="family-nav" aria-label="Cabin families">${Object.entries(families).map(([id,f])=>`<a href="./${f.file}" ${id===familyId?'aria-current="page"':''}>${f.number} / ${id==='arbois'?'Arbois':f.name}</a>`).join('')}</nav>
  <header class="intro"><span class="eyebrow">${family.approved?'SELECTED DESIGN':'REFERENCE STUDY'} / ${family.number}${family.revision?' / V'+family.revision:''}</span><h1>${family.name}</h1><p>${family.note}</p></header>
  <div class="variants" aria-label="Shape variants">${family.variants.map((v,i)=>`<button class="variant" data-variant="${i}" aria-pressed="false"><span class="letter">${v.id}</span><span><strong>${v.name}</strong><small>${v.w.toFixed(2)} × ${v.d.toFixed(2)} × ${v.h.toFixed(2)} m${family.approved?' / KEPT':''}</small></span></button>`).join('')}</div>
  <section class="section"><span class="eyebrow">01 / OPEN & INSPECT</span><div class="row spread"><label for="door" class="small">${familyId==='jaillet'?'Shell opening':'Door opening'}</label><span id="doorValue" class="eyebrow">CLOSED</span></div><input id="door" type="range" min="0" max="1" value="0" step=".01"><button id="toggleDoor" class="door-button">${familyId==='jaillet'?'Slide the shell open ↗':'Open doors ↗'}</button><label class="check"><input id="passengers" type="checkbox">Seated passengers</label>${familyId==='arbois'?'<label class="check"><input id="skis" type="checkbox" checked>Skis in the door pockets</label>':''}<label class="check"><input id="cutaway" type="checkbox">Remove roof & hanger</label><div class="row spread"><label for="glass" class="small">Glass opacity</label><span class="eyebrow" id="glassValue">${Math.round(defaultOpacity*100)}%</span></div><input id="glass" type="range" min=".04" max=".65" value="${defaultOpacity}" step=".01"></section>
  <section class="section"><span class="eyebrow">02 / SAME COLOUR, EVERY SHAPE</span><div class="color-row"><button data-color="#e8e8df" style="background:#e8e8df" aria-label="Reference ivory"></button><button data-color="#b7352c" style="background:#b7352c" aria-label="Lift Co. red"></button><button data-color="#567785" style="background:#567785" aria-label="Glacier blue"></button><input id="paint" type="color" value="#e8e8df" aria-label="Custom cabin paint"><small>INDEPENDENT</small></div></section>
  <section class="section"><span class="eyebrow">03 / ${family.schematic?'PHOTOS & PATENT DRAWING':'YOUR REFERENCE PHOTOS'}</span><div class="refs">${family.references.map((file,i)=>`<button data-ref="${i}" aria-label="Open ${family.name} reference ${i+1}"><img src="${rootPath+file}" alt="${file.startsWith('schematics/')?'POMA patent: closed and open cabin drawings':family.name+' reference '+(i+1)}" loading="lazy"></button>`).join('')}</div><p class="credit">Photos supplied by you; credits preserved.${family.schematic?' <a href="'+family.schematic+'" target="_blank" rel="noopener">POMA patent / source ↗</a>':''} Click to enlarge.</p></section>
  <p class="footer-note">${selectionNote}.<br>Dimensions are visual estimates.<br><a href="../empty-map.html">Back to the resort ↗</a> · <a href="../docs/gondola-megeve-studies.md">Reference notes ↗</a></p>
 </aside>
 <main id="stage" aria-label="Interactive 3D cabin inspection">
  <header class="topbar"><div><span class="eyebrow">MEGÈVE / CABIN GEOMETRY</span><strong>${family.subtitle}</strong></div><div class="row"><button id="compare" aria-pressed="true" ${family.variants.length===1?'hidden':''}>Compare ${variantNames}</button><button id="rotate" aria-pressed="false">Auto rotate</button></div></header>
  <nav class="views" aria-label="Camera views"><button data-view="quarter" class="active">¾ view</button><button data-view="front">Front</button><button data-view="side">Door side</button><button data-view="rear">Rear</button><button data-view="top">Roof</button><button data-view="grip">Grip</button><button id="reset">Reset view ↺</button></nav>
  <div class="caption"><span class="eyebrow" id="captionCode"></span><h2 id="captionTitle"></h2><p id="captionDescription"></p><div class="specs"><div><b id="width"></b><span>Width</span></div><div><b id="depth"></b><span>Along cable</span></div><div><b id="height"></b><span>Body height</span></div></div><p class="estimate">ESTIMATED PROPORTIONS / SAME METRE SCALE</p></div>
  <p class="hint">left-drag = orbit · right-drag = look in place · scroll = zoom · A / B / C = inspect · Esc = compare</p>
  ${family.variants.map((v,i)=>`<div class="model-label" id="label${i}"><b>${v.id} / ${v.name}</b><span>${v.w.toFixed(2)} W · ${v.h.toFixed(2)} H</span></div>`).join('')}
 </main>
 <dialog id="reference"><div class="row"><span class="eyebrow" id="refTitle"></span><button id="closeRef" autofocus>Close ×</button></div><img id="refImage" alt=""><div class="row"><button id="previousRef">← Previous</button><p id="refCount"></p><button id="nextRef">Next →</button></div></dialog><pre class="error" id="error" hidden></pre>`;
 const stage=$('stage'),renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));renderer.setSize(stage.clientWidth,stage.clientHeight);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;stage.prepend(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color(0xe9e9e0);scene.fog=new T.Fog(0xe9e9e0,34,100);
 const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
 const camera=new T.PerspectiveCamera(37,stage.clientWidth/stage.clientHeight,.015,150),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=.3;controls.maxDistance=55;controls.maxPolarAngle=Math.PI*.98;controls.enablePan=false;controls.mouseButtons.RIGHT=null;
 scene.add(new T.HemisphereLight(0xeaf2f6,0x777b61,2));
 const sun=new T.DirectionalLight(0xffecd0,3.2);sun.position.set(-6,11,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-10,right:10,top:9,bottom:-9,near:.5,far:35});sun.shadow.normalBias=.025;sun.shadow.bias=-.0001;sun.shadow.radius=3;scene.add(sun);
 const fill=new T.DirectionalLight(0xd8e7ed,1.5);fill.position.set(5,5,-6);scene.add(fill);
 const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.MeshStandardMaterial({color:0xe2e3d7,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.18;floor.receiveShadow=true;scene.add(floor);
 const grid=new T.GridHelper(30,30,0xc7cec0,0xd6dbce);grid.position.y=-.175;grid.material.transparent=true;grid.material.opacity=.38;scene.add(grid);
 const factory=window.LiftCoGondolaStudies.createFactory(T),models=family.variants.map((v,i)=>{const m=factory.make(familyId,i);scene.add(m.root);return m;});
 const state={selected:0,compare:models.length>1,view:'quarter',auto:false,door:0,doorTarget:0};
 const labelPoint=new T.Vector3();
 function frame(view=state.view){
  state.view=view;const v=family.variants[state.selected],centre=new T.Vector3(0,view==='grip'?v.h+1.85:1.94,0),distance=state.compare?(models.length===2?12:17):7;
  models.forEach(m=>m.root.rotation.y=state.compare?(view==='side'?Math.PI/2:view==='rear'?Math.PI:view==='quarter'?.45:0):0);
  const positions={quarter:[-.48,.20,1],front:[0,.08,1],side:[-1,.08,0],rear:[0,.08,-1],top:[.001,1,.001],grip:[.75,.28,1]};
  const dir=new T.Vector3(...(state.compare&&['quarter','side','rear'].includes(view)?[0,view==='quarter'?.20:.08,1]:positions[view])).normalize();
  controls.enableDamping=false;controls.update();controls.target.copy(centre);camera.position.copy(centre).addScaledVector(dir,view==='grip'&&!state.compare?2.3:distance*(view==='top'?1.05:1));camera.up.set(0,1,0);camera.lookAt(centre);controls.update();controls.enableDamping=true;
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 }
 function updateSelection(reframe=true){
  models.forEach((m,i)=>{m.root.visible=state.compare||i===state.selected;m.root.position.x=state.compare?(i-(models.length-1)/2)*3.8:0;});
  stage.classList.toggle('compare',state.compare);stage.classList.toggle('single',!state.compare);$('compare').setAttribute('aria-pressed',String(state.compare));
  document.querySelectorAll('[data-variant]').forEach(b=>{const active=+b.dataset.variant===state.selected&&!state.compare;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  const v=family.variants[state.selected];$('captionCode').textContent=state.compare?(family.approved?'SELECTED / '+variantNames:'THREE SHAPES / REVISION '+(family.revision||1)):'VARIANT '+v.id+' / '+family.name.toUpperCase();$('captionTitle').textContent=state.compare?(family.approved?'Selected silhouettes.':'An egg-shaped shell.'):v.name;$('captionDescription').textContent=v.description;
  for(const [id,key] of [['width','w'],['depth','d'],['height','h']])$(id).textContent=v[key].toFixed(2)+' m';
  if(reframe)frame();
 }
 function choose(i){state.selected=i;state.compare=false;updateSelection();}
 document.querySelectorAll('[data-variant]').forEach(b=>b.onclick=()=>choose(+b.dataset.variant));
 $('compare').onclick=()=>{state.compare=!state.compare;updateSelection();};
 $('rotate').onclick=()=>{state.auto=!state.auto;$('rotate').setAttribute('aria-pressed',String(state.auto));};
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{if(b.dataset.view==='grip'){state.compare=false;updateSelection(false);}frame(b.dataset.view);});$('reset').onclick=()=>frame('quarter');
 function doorTarget(value){state.doorTarget=+value;$('door').value=value;const percent=Math.round(value*100);$('doorValue').textContent=percent===0?'CLOSED':percent===100?'OPEN':percent+'%';$('toggleDoor').textContent=percent>.5*100?(familyId==='jaillet'?'Close the shell ↙':'Close doors ↙'):(familyId==='jaillet'?'Slide the shell open ↗':'Open doors ↗');}
 $('door').oninput=e=>doorTarget(e.target.value);$('toggleDoor').onclick=()=>doorTarget(state.doorTarget>.5?0:1);
 if($('skis'))$('skis').onchange=e=>models.forEach(m=>m.setSkis(e.target.checked));
 $('passengers').onchange=e=>models.forEach(m=>m.passengers.visible=e.target.checked);$('cutaway').onchange=e=>models.forEach(m=>m.setCutaway(e.target.checked));
 $('glass').oninput=e=>{models.forEach(m=>m.setGlazing(+e.target.value));$('glassValue').textContent=Math.round(+e.target.value*100)+'%';};
 const paint=value=>{models.forEach(m=>m.setColor(value));$('paint').value=value;};$('paint').oninput=e=>paint(e.target.value);document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>paint(b.dataset.color));
 let referenceIndex=0;
 function showReference(i){referenceIndex=(i+family.references.length)%family.references.length;$('refImage').src=rootPath+family.references[referenceIndex];$('refImage').alt=family.name+' supplied reference '+(referenceIndex+1);$('refTitle').textContent=family.name+' / '+family.references[referenceIndex];$('refCount').textContent=(referenceIndex+1)+' of '+family.references.length+(family.references[referenceIndex].startsWith('schematics/')?' · POMA patent US4149471A / figures 1–4':' · supplied photograph');if(!$('reference').open)$('reference').showModal();}
 document.querySelectorAll('[data-ref]').forEach(b=>b.onclick=()=>showReference(+b.dataset.ref));$('closeRef').onclick=()=>$('reference').close();$('previousRef').onclick=()=>showReference(referenceIndex-1);$('nextRef').onclick=()=>showReference(referenceIndex+1);
 $('reference').addEventListener('click',e=>{if(e.target===$('reference')){const r=$('reference').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('reference').close();}});
 addEventListener('keydown',e=>{if($('reference').open){if(e.key==='ArrowRight')showReference(referenceIndex+1);if(e.key==='ArrowLeft')showReference(referenceIndex-1);return;}if(e.target instanceof HTMLInputElement)return;const index=family.variants.findIndex(v=>v.id.toLowerCase()===e.key.toLowerCase());if(index>=0)choose(index);if(e.key==='Escape'){state.compare=models.length>1;updateSelection();}});
 // Right-drag rotates at the eye; never pan around a distant orbit target.
 let look=null;const euler=new T.Euler(0,0,0,'YXZ'),forward=new T.Vector3();
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==2)return;e.preventDefault();e.stopImmediatePropagation();const position=camera.position.clone(),quaternion=camera.quaternion.clone();controls.enableDamping=false;controls.update();controls.enableDamping=true;camera.position.copy(position);camera.quaternion.copy(quaternion);controls.enabled=false;look={id:e.pointerId,x:e.clientX,y:e.clientY,distance:Math.max(.5,camera.position.distanceTo(controls.target))};euler.setFromQuaternion(camera.quaternion,'YXZ');renderer.domElement.setPointerCapture(e.pointerId);},true);
 renderer.domElement.addEventListener('pointermove',e=>{if(!look||look.id!==e.pointerId)return;euler.y-=(e.clientX-look.x)*.003;euler.x=T.MathUtils.clamp(euler.x-(e.clientY-look.y)*.003,-Math.PI/2+.01,Math.PI/2-.01);euler.z=0;camera.quaternion.setFromEuler(euler);controls.target.copy(camera.position).addScaledVector(camera.getWorldDirection(forward),look.distance);look.x=e.clientX;look.y=e.clientY;});
 function endLook(){if(!look)return;const id=look.id;look=null;if(renderer.domElement.hasPointerCapture(id))renderer.domElement.releasePointerCapture(id);controls.enabled=true;}
 for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,endLook);addEventListener('blur',endLook);renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
 function resize(){renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);
 function error(e){$('error').hidden=false;$('error').textContent+=String(e.message||e.reason||e)+'\n';}addEventListener('error',error);addEventListener('unhandledrejection',error);
 const clock=new T.Clock();updateSelection();
 function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);state.door=T.MathUtils.damp(state.door,state.doorTarget,6,dt);models.forEach(m=>m.setDoor(state.door));controls.autoRotate=state.auto&&!look;controls.autoRotateSpeed=.55;if(controls.enabled)controls.update();
  models.forEach((m,i)=>{const label=$('label'+i);labelPoint.set(m.root.position.x,-.05,0).project(camera);label.style.left=(labelPoint.x*.5+.5)*stage.clientWidth+'px';label.style.top=(-labelPoint.y*.5+.5)*stage.clientHeight+14+'px';label.hidden=!state.compare||labelPoint.z>1||labelPoint.z<-1;});
  renderer.render(scene,camera);
 }
 animate();
}};
