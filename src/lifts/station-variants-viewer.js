import * as T from 'three';
import {OrbitControls} from '../../assets/vendor/three/OrbitControls.js';
import {categories,lifts,sources,approvedVariants} from './station-variants-data.js';
import {makeStationStudy} from './station-variants-models.js';

const $=id=>document.getElementById(id),storageKey='lift-co-station-workshop-v2';
const report=error=>{$('loading').hidden=true;$('error').hidden=false;$('error').textContent=error?.stack||String(error??'Unknown workshop error');console.error(error);};
window.addEventListener('error',e=>report(e.error||e.message));window.addEventListener('unhandledrejection',e=>report(e.reason));
document.fonts.ready.then(()=>{try{start();}catch(error){report(error);}});
function start(){
 let choices={};try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))choices=saved;}catch{$('saved').textContent='Local preferences could not be read. You can still export choices.';}
 for(const c of categories)for(const role of ['valley','summit']){const key=c.id+':'+role,approved=approvedVariants[c.id];if(approved)choices[key]=approved;else delete choices[key];}
 try{localStorage.setItem(storageKey,JSON.stringify(choices));}catch{}
 const query=new URLSearchParams(location.search),initial=lifts.find(x=>x.id===query.get('lift'))||lifts.find(x=>x.id===(categories.find(c=>c.id===query.get('category'))||categories[0]).default);
 const state={lift:initial,variant:Math.max(0,Math.min(2,'ABC'.indexOf(approvedVariants[initial.category]||query.get('variant')||'A'))),role:'valley',compare:false,current:false,view:'quarter',models:[],distance:0};
 const scene=new T.Scene();scene.background=new T.Color(0xe5ebe1);scene.fog=new T.Fog(0xe5ebe1,250,600);
 const camera=new T.PerspectiveCamera(36,1,.1,1200),renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;$('viewport').appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=3;controls.maxDistance=350;controls.maxPolarAngle=Math.PI*.49;
 scene.add(new T.HemisphereLight(0xfffff0,0x6b8172,1.65));const sun=new T.DirectionalLight(0xfff3dc,2.5);sun.position.set(-40,65,-25);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.035;sun.shadow.bias=-.00015;scene.add(sun,sun.target);const fill=new T.DirectionalLight(0xc3deea,.8);fill.position.set(30,20,40);scene.add(fill);
 const ground=new T.Mesh(new T.PlaneGeometry(1200,1200),new T.MeshStandardMaterial({color:0xe2e7db,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.005;ground.receiveShadow=true;scene.add(ground);
 const grid=new T.GridHelper(400,80,0xcbd4c5,0xd5dccd);grid.position.y=.002;grid.material.transparent=true;grid.material.opacity=.25;scene.add(grid);
 for(const c of categories){const option=document.createElement('option');option.value=c.id;option.textContent=c.name;$('lift').appendChild(option);}$('lift').value=initial.category;
 function carrierOptions(){const options=lifts.filter(l=>l.category===state.lift.category);$('carrier-model').innerHTML='';for(const lift of options){const o=document.createElement('option');o.value=lift.id;o.textContent=lift.name;$('carrier-model').appendChild(o);}$('carrier-model').value=state.lift.id;$('carrier-model').disabled=options.length===1;}
 function choiceKey(){return state.lift.category+':'+state.role;}
 function roles(){$('role').innerHTML='<option value="valley">Valley / drive</option><option value="summit">Summit / return</option>';if(!['valley','summit'].includes(state.role))state.role='valley';$('role').value=state.role;}
 function picked(){const saved=choices[choiceKey()];return ['A','B','C'].includes(saved)?saved:null;}
 function updateCaption(){
  const empty=state.lift.variants.length===0;
  $('empty-state').hidden=!empty;$('references').hidden=empty;$('role').disabled=empty;$('carrier-model').disabled=empty||lifts.filter(l=>l.category===state.lift.category).length<2;
  $('compare').disabled=empty;$('reference-open').disabled=empty;document.querySelectorAll('[data-view],.inspection input').forEach(o=>o.disabled=empty);
  if(empty){
   $('category').textContent=state.lift.group.toUpperCase();$('title').textContent=state.lift.group;$('variant-code').textContent='NO DESIGNS KEPT';$('variant-name').textContent='All three proposals rejected';$('description').textContent='There is no retained detachable-chair station design.';$('dimensions').textContent='';$('mechanics').textContent='';$('variants').replaceChildren();$('compare-labels').replaceChildren();$('pick').disabled=true;$('pick').textContent='None kept';$('saved').textContent='Fixed B, Gondola B, Tramway B and Funitel C remain locked in.';document.body.classList.remove('comparing');return;
  }
  const lift=state.lift,v=lift.variants[state.variant],letter='ABC'[state.variant],isAngle=state.role==='middle'&&lift.special==='turn';
  $('category').textContent=lift.group.toUpperCase()+' / '+(isAngle?'PASSENGER-FREE ANGLE TRANSFER':state.role.toUpperCase()+' STATION');$('title').textContent=lift.group;
  $('variant-code').textContent=state.current?'CURRENT GAME STATION':state.compare?'THREE REAL REFERENCE STRUCTURES':'PROPOSAL '+letter+(picked()===letter?' / LOCKED DESIGN':approvedVariants[lift.category]?' / ARCHIVED OPTION':' / NOT SELECTED');
  $('variant-name').textContent=state.current?'The current design':state.compare?'Compare the silhouettes':v.name;
  $('description').textContent=state.current?'Reference study':state.compare?'Choose A, B or C to inspect one building closely. Each design follows a different real structure. Choose one to see its reference and inspect the details.':v.note;
  const model=state.models[0];if(model){const size=model.bounds.getSize(new T.Vector3());$('dimensions').textContent=`${size.x.toFixed(1)} m wide / ${size.z.toFixed(1)} m long / ${size.y.toFixed(1)} m high`;}
  $('mechanics').textContent=isAngle?'Open angle transfer. Service access only; no passenger platforms.':lift.id==='solo'?'Two reversible docks. Valley approach is inclined; summit inspection uses a flat arrival. Cliff clearance remains a game integration requirement.':lift.id==='funitel-rocharbois'?'Paired reversible rope system. Drive and return equipment stay distinct; both boarding floors remain level.':['classic','chair-alps5'].includes(lift.id)?'Fixed grip: one speed, one bullwheel. No detachment rails or tyre conveyor.':'Detachable: tyre conveyors, grip rails, drive/return wheel and level boarding platforms are retained. Building variants do not change operation.';
  $('variants').innerHTML=lift.variants.map((v,i)=>`<button class="variant" data-variant="${i}" aria-pressed="${!state.current&&!state.compare&&state.variant===i}"><span class="letter">${'ABC'[i]}</span><span><strong>${v.name}${picked()==='ABC'[i]?' *':''}</strong><small>${sources[v.ref].title.replace('Poma / ','').replace('RM / ','')}</small></span></button>`).join('');
  document.querySelectorAll('[data-variant]').forEach(b=>b.onclick=()=>{state.variant=+b.dataset.variant;state.current=state.compare=false;rebuild();});
  $('compare').setAttribute('aria-pressed',String(state.compare));$('current').setAttribute('aria-pressed',String(state.current));$('pick').disabled=true;$('pick').textContent=approvedVariants[lift.category]?approvedVariants[lift.category]+' locked in for this category':'None selected / redesign pending';$('saved').textContent='Approved: Fixed B, Gondola B, Tramway B, Funitel C. Detachable chairs: none.';
  document.body.classList.toggle('comparing',state.compare);$('compare-labels').innerHTML=state.compare?lift.variants.map((v,i)=>`<div class="compare-label" style="left:${(i+.5)/3*100}%"><b>${'ABC'[i]}</b>${v.name}</div>`).join(''):'';
 }
 function referenceDesk(){
  if(!state.lift.variants.length){$('photos').replaceChildren();$('sources').replaceChildren();return;}
  const selected=state.lift.variants[state.variant].ref,refs=[selected,...state.lift.refs.filter(k=>k!==selected)];$('photos').innerHTML='';$('sources').innerHTML='';
  refs.forEach((key,i)=>{const ref=sources[key],button=document.createElement('button'),img=new Image();img.src='../assets/references/'+ref.image;img.alt=ref.title;img.loading='lazy';button.appendChild(img);button.title=ref.title;button.classList.toggle('selected-reference',i===0);button.onclick=()=>{$('large-photo').src=img.src;$('large-photo').alt=ref.title;$('photo-credit').textContent=ref.credit+' '+ref.basis;$('photo-dialog').showModal();};$('photos').appendChild(button);if(i===0){$('reference-title').textContent=ref.title;$('reference-basis').textContent=ref.basis;$('reference-credit').textContent=ref.credit;const link=document.createElement('a');link.href=ref.url;link.target='_blank';link.rel='noopener';link.textContent='Read the original source';$('sources').appendChild(link);}});
 }
 function rebuild(){
  $('error').hidden=true;$('loading').hidden=false;
  try{
   for(const model of state.models){scene.remove(model.root);model.dispose();}state.models=[];state.distance=0;
   if(!state.lift.variants.length)state.compare=false;
   const variants=!state.lift.variants.length?[]:state.compare?[0,1,2]:[state.variant];
   for(const i of variants){const model=makeStationStudy(state.lift,state.lift.variants[i],state.role,{current:state.current});state.models.push(model);scene.add(model.root);}
   state.models.forEach(m=>{m.cutaway($('cutaway').checked);m.carriers.visible=$('carrier').checked;});updateCaption();referenceDesk();frame();$('loading').hidden=true;
   const url=new URL(location.href);url.searchParams.set('category',state.lift.category);url.searchParams.set('lift',state.lift.id);url.searchParams.set('role',state.role);url.searchParams.set('variant','ABC'[state.variant]);history.replaceState(null,'',url);
  }catch(error){report(error);}
 }
 function frame(view=state.view){
  state.view=view;
  const directions={quarter:[1,.52,-1.25],front:[0,.11,-1],side:[1,.12,0],top:[0,1,-.02],detail:[.8,.65,-1]},direction=new T.Vector3(...directions[view]).normalize();if(state.lift.id==='solo'){direction.z*=-1;if(view==='quarter')direction.y*=1.65;direction.normalize();}
  if(state.compare){
   for(const m of state.models)if(m.compareShift){m.root.position.sub(m.compareShift);m.bounds.translate(m.compareShift.clone().negate());m.detail.sub(m.compareShift);}
   const right=new T.Vector3(direction.z,0,-direction.x).normalize(),pitch=Math.max(...state.models.map(m=>{const size=m.bounds.getSize(new T.Vector3());return Math.abs(right.x)*size.x+Math.abs(right.z)*size.z;}))+10;
   state.models.forEach((m,i)=>{m.compareShift=right.clone().multiplyScalar((i-1)*pitch);m.root.position.add(m.compareShift);m.bounds.translate(m.compareShift);m.detail.add(m.compareShift);});
  }
  const bounds=new T.Box3();state.models.forEach(m=>bounds.union(m.bounds));if(bounds.isEmpty())return;
  let center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
  if(view==='detail'&&!state.compare){center=state.models[0].detail.clone();size.set(10,7,10);}
  const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),direction).normalize(),up=new T.Vector3().crossVectors(direction,right).normalize(),tanV=Math.tan(T.MathUtils.degToRad(camera.fov/2)),tanH=tanV*camera.aspect;
  let distance=0;for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){const p=new T.Vector3(x*size.x/2,y*size.y/2,z*size.z/2),depth=p.dot(direction);distance=Math.max(distance,depth+Math.abs(p.dot(right))/tanH,depth+Math.abs(p.dot(up))/tanV);}distance*=1.13;
  const extent=Math.max(20,size.x,size.z)*.75;sun.target.position.copy(center);sun.position.copy(center).add(new T.Vector3(-35,55,-25));Object.assign(sun.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent,near:1,far:150});sun.shadow.camera.updateProjectionMatrix();
  controls.target.copy(center);camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);controls.update();document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
 }
 $('lift').onchange=()=>{const c=categories.find(x=>x.id===$('lift').value);state.lift=lifts.find(l=>l.id===c.default);state.current=false;roles();carrierOptions();const pickedIndex='ABC'.indexOf(picked());state.variant=pickedIndex<0?0:pickedIndex;rebuild();};
 $('carrier-model').onchange=()=>{state.lift=lifts.find(l=>l.id===$('carrier-model').value);rebuild();};
 $('role').onchange=()=>{state.role=$('role').value;state.current=false;const pickedIndex='ABC'.indexOf(picked());state.variant=pickedIndex<0?0:pickedIndex;rebuild();};
 $('compare').onclick=()=>{state.compare=!state.compare;state.current=false;rebuild();};$('current').onclick=()=>{state.current=!state.current;state.compare=false;rebuild();};
 $('cutaway').onchange=()=>state.models.forEach(m=>m.cutaway($('cutaway').checked));$('carrier').onchange=()=>state.models.forEach(m=>m.carriers.visible=$('carrier').checked);
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>frame(b.dataset.view));$('rotate').onchange=()=>controls.autoRotate=$('rotate').checked;
 $('pick').onclick=()=>{};
 $('export').onclick=()=>{const selections=Object.entries(choices).filter(([key,value])=>['A','B','C'].includes(value)&&categories.some(c=>key.startsWith(c.id+':'))).map(([key,variant])=>{const split=key.lastIndexOf(':'),categoryId=key.slice(0,split),role=key.slice(split+1),category=categories.find(c=>c.id===categoryId);return{categoryId,role,variant,design:category.variants['ABC'.indexOf(variant)].name};});const blob=new Blob([JSON.stringify({study:'Lift Co station workshop',version:2,rejectedCategories:['chair'],selections},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='lift-co-station-choices.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('saved').textContent=`Exported ${selections.length} station choices.`;};
 $('reference-open').onclick=()=>document.querySelector('#photos button')?.click();
 $('close-photo').onclick=()=>$('photo-dialog').close();$('photo-dialog').onclick=e=>{if(e.target===$('photo-dialog'))$('photo-dialog').close();};
 const resize=()=>{const rect=$('viewport').getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/Math.max(1,rect.height);camera.updateProjectionMatrix();frame();};new ResizeObserver(resize).observe($('viewport'));
 carrierOptions();roles();if([...$('role').options].some(x=>x.value===query.get('role'))){state.role=query.get('role');$('role').value=state.role;}referenceDesk();resize();rebuild();
 let then=performance.now(),lastDraw=0,lastStats=0;
 const labelPoint=new T.Vector3();
 function tick(now){requestAnimationFrame(tick);const dt=Math.min(.05,(now-then)/1000);then=now;controls.update();if(document.hidden)return;if($('motion').checked){state.distance+=dt;state.models.forEach(m=>m.animate(state.distance));}if(now-lastDraw<1000/30)return;lastDraw=now;renderer.render(scene,camera);if(state.compare)state.models.forEach((m,i)=>{const label=$('compare-labels').children[i];m.bounds.getCenter(labelPoint).project(camera);label.style.left=(labelPoint.x*.5+.5)*100+'%';label.hidden=labelPoint.z>1||labelPoint.z< -1;});if(now-lastStats>1000){lastStats=now;$('stats').textContent=(state.models.length===1?state.models[0].motion.phase+' / ':'')+renderer.info.render.calls+' draws / '+Math.round(renderer.info.render.triangles/1000)+'k triangles';}}
 requestAnimationFrame(tick);
 // Read-only state plus normal selection actions for manual browser probes.
 window.LiftCoStationWorkshop={get state(){return state;},get renderer(){return renderer;},select(id,role='valley',variant=0,compare=false){const lift=lifts.find(x=>x.id===id);if(!lift)throw Error('Unknown lift');state.lift=lift;$('lift').value=lift.category;state.role=role;roles();carrierOptions();state.variant=variant;state.current=false;state.compare=compare;referenceDesk();rebuild();},frame};
}
