/* Device preferences only. Resort geometry and simulation never depend on quality. */
window.LiftCoGraphics=(()=>{
 'use strict';
 const key='lift-co-graphics-v3',presets={performance:{scale:.75,shadows:0,vegetation:40,snow:25,machinery:'visible'},balanced:{scale:1,shadows:1024,vegetation:70,snow:60,machinery:'visible'},quality:{scale:1.25,shadows:2048,vegetation:100,snow:100,machinery:'full'}};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function normalize(v={}){return{scale:clamp(Number(v.scale)||.75,.5,1.5),shadows:[0,512,1024,2048].includes(+v.shadows)?+v.shadows:0,vegetation:clamp(Number.isFinite(+v.vegetation)?+v.vegetation:40,20,100),snow:clamp(Number.isFinite(+v.snow)?+v.snow:25,0,100),machinery:v.machinery==='full'?'full':'visible'};}
 let settings=normalize(presets.performance),context=null,dialog=null,original=null,frame=0,lastReadout=0,frameCount=0,elapsed=0;
 try{const saved=JSON.parse(localStorage.getItem(key));if(saved)settings=normalize(saved);}catch{}
 const vegetation=new Map();let frustum,sphere,projection;
 function refreshScenery(mesh){const data=vegetation.get(mesh);if(!data)return;let n=0;const threshold=settings.vegetation/100;
  for(let i=0;i<data.raw.length;i++){const m=data.raw[i],e=m.elements,h=Math.sin(e[12]*12.9898+e[14]*78.233)*43758.5453,hash=h-Math.floor(h);if(hash<threshold&&Math.hypot(e[0],e[1],e[2])>1e-8)data.set(n++,m);}
  mesh.count=n;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();
 }
 function apply(value){settings=normalize(value);if(!context)return;const {renderer,sun,snow}=context;
  renderer.setPixelRatio(settings.scale);renderer.setSize(context.app.clientWidth,context.app.clientHeight);
  renderer.shadowMap.enabled=settings.shadows>0;
  if(sun.shadow.mapSize.x!==settings.shadows&&settings.shadows){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(settings.shadows,settings.shadows);}
  renderer.shadowMap.needsUpdate=true;document.getElementById('softShadows').checked=!!settings.shadows;
  snow.visible=settings.snow>0;snow.geometry.setDrawRange(0,Math.round(snow.geometry.attributes.position.count*settings.snow/100));
  for(const mesh of vegetation.keys())refreshScenery(mesh);
 }
 function writeControls(){for(const name of Object.keys(settings)){const el=document.getElementById('gfx-'+name);el.value=settings[name];}labels();const name=Object.keys(presets).find(p=>JSON.stringify(presets[p])===JSON.stringify(settings));document.getElementById('gfx-preset').value=name||'custom';}
 function labels(){document.getElementById('gfx-scale-value').textContent=Math.round(settings.scale*100)+'%';document.getElementById('gfx-vegetation-value').textContent=settings.vegetation+'%';document.getElementById('gfx-snow-value').textContent=settings.snow+'%';}
 function init(ctx){context=ctx;const T=ctx.THREE;frustum=new T.Frustum();sphere=new T.Sphere(new T.Vector3(),35);projection=new T.Matrix4();
  for(const mesh of ctx.scene.children.filter(o=>o.isInstancedMesh&&o.userData.scenery==='vegetation')){const raw=[],set=mesh.setMatrixAt.bind(mesh),get=mesh.getMatrixAt.bind(mesh);for(let i=0;i<mesh.count;i++){const m=new T.Matrix4();get(i,m);raw.push(m);}vegetation.set(mesh,{raw,set});mesh.setMatrixAt=(i,m)=>{if(raw[i])raw[i].copy(m);};}
  dialog=document.createElement('dialog');dialog.id='graphicsDialog';dialog.setAttribute('aria-labelledby','graphicsTitle');dialog.innerHTML=`<form method="dialog"><header><div><span class="eyebrow">DEVICE SETTINGS</span><h2 id="graphicsTitle">Graphics</h2></div><button id="gfx-close" value="cancel" aria-label="Close graphics settings">×</button></header><p class="small">Tune the mountain for your laptop. Changes preview immediately.</p>
  <label for="gfx-preset">Quality preset</label><select id="gfx-preset"><option value="performance">Performance</option><option value="balanced">Balanced</option><option value="quality">Quality</option><option value="custom" disabled>Custom</option></select>
  <div class="gfx-field"><label for="gfx-scale">Render resolution</label><output id="gfx-scale-value"></output></div><input id="gfx-scale" type="range" min=".5" max="1.5" step=".05"><p class="small">Lower resolution reduces GPU work; interface text stays sharp.</p>
  <label for="gfx-shadows">Sun shadows</label><select id="gfx-shadows"><option value="0">Off · fastest</option><option value="512">Low · 512</option><option value="1024">Medium · 1024</option><option value="2048">High · 2048</option></select>
  <div class="gfx-field"><label for="gfx-vegetation">Vegetation density</label><output id="gfx-vegetation-value"></output></div><input id="gfx-vegetation" type="range" min="20" max="100" step="5"><p class="small">Changes scenery only. Connections and terrain stay the same.</p>
  <div class="gfx-field"><label for="gfx-snow">Snowfall</label><output id="gfx-snow-value"></output></div><input id="gfx-snow" type="range" min="0" max="100" step="5">
  <label for="gfx-machinery">Station machinery detail</label><select id="gfx-machinery"><option value="visible">Animate visible detail</option><option value="full">Animate all detail</option></select><p class="small">Visible station wheels and all pylon wheels keep turning. Off-screen conveyor updates can be skipped. Lift motion and guests always continue.</p>
  <output id="gfx-readout" aria-live="off"></output><p id="gfx-storage" role="status" class="small"></p><footer><button id="gfx-cancel" value="cancel">Cancel</button><button id="gfx-apply" class="primary" value="apply">Apply settings</button></footer></form>`;const form=dialog.querySelector('form'),header=form.querySelector('header'),footer=form.querySelector('footer'),body=document.createElement('div');body.className='gfx-body';for(const child of [...form.children])if(child!==header&&child!==footer)body.append(child);form.append(header,body,footer);document.body.append(dialog);
  const button=document.createElement('button');button.id='graphicsButton';button.textContent='Graphics';button.setAttribute('aria-haspopup','dialog');button.onclick=()=>{original={...settings};writeControls();document.getElementById('gfx-storage').textContent='';ctx.stopFlight();dialog.showModal();};document.querySelector('.brand').append(button);
  let settled=true;function finish(action){if(settled)return;settled=true;if(action!=='apply')apply(original);else try{localStorage.setItem(key,JSON.stringify(settings));}catch{ctx.notice('Graphics applied for this session. Browser storage is full.');}dialog.close(action);button.focus();}
  button.addEventListener('click',()=>{settled=false;});dialog.querySelector('form').addEventListener('submit',e=>{e.preventDefault();finish(e.submitter?.value||'cancel');});dialog.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();finish('cancel');}});dialog.addEventListener('cancel',e=>{e.preventDefault();finish('cancel');});dialog.addEventListener('close',()=>{if(!settled){settled=true;apply(original);}button.focus();});
  document.getElementById('gfx-preset').onchange=e=>{apply(presets[e.target.value]);writeControls();};
  for(const name of Object.keys(settings))document.getElementById('gfx-'+name).oninput=e=>{apply({...settings,[name]:e.target.value});labels();document.getElementById('gfx-preset').value='custom';};
  document.getElementById('softShadows').onchange=e=>apply({...settings,shadows:e.target.checked?1024:0});
  apply(settings);beginFrame(0);return api;
 }
 function beginFrame(dt){if(!context)return;frame++;context.camera.updateMatrixWorld();projection.multiplyMatrices(context.camera.projectionMatrix,context.camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);frameCount++;elapsed+=dt;
  if(performance.now()-lastReadout>700){lastReadout=performance.now();const {renderer}=context,buffer=renderer.getDrawingBufferSize(new context.THREE.Vector2()),fps=elapsed>0?Math.round(frameCount/elapsed):0;document.getElementById('gfx-readout').textContent=fps+' fps · '+buffer.x+' × '+buffer.y+' px\n'+renderer.info.render.calls+' draw calls · '+Math.round(renderer.info.render.triangles/1000)+'k triangles';frameCount=0;elapsed=0;}
 }
 const api={init,apply,refreshScenery,beginFrame,get settings(){return{...settings};},get frame(){return frame;},get modal(){return !!dialog?.open;},animateDetail(point){if(!context||settings.machinery==='full')return true;sphere.center.copy(point);return frustum.intersectsSphere(sphere);},get snowCount(){return context?.snow.geometry.drawRange.count||0;}};return api;
})();
