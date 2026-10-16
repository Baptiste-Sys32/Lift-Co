// Construction tools for the resort. Layouts are saved as data, then reconstructed
// through the same createLift factory as the original operational line.
window.createResortBuilder=function(ctx){
'use strict';
const {THREE:T,scene,camera,controls,renderer,app,lifts,skiers,RESORT,terrainY,prepareStationGround,createLift,liftFrame,planPoint,STATION,seed,SAVE_KEY,enterFreeCamera}=ctx;
const liftTypes=ctx.liftTypes||[{id:'gondola',label:'Alpine gondola',shortName:'Gondola',bottomDrop:4.99,halfWidth:1.1,halfLength:1.15}];
const carrierSpec=()=>liftTypes.find(t=>t.id===(draft?.type||'gondola'))||liftTypes[0];
const buildLimit=ctx.mapLimits?.buildLimit??470,maxLineLength=ctx.mapLimits?.maxLineLength??900,noticeKey=ctx.noticeKey??'lift-co-notice';
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const typeSelector=document.getElementById('liftType');
if(typeSelector){
 const categories=ctx.liftGroups||window.LiftCoLiftGroups||[{id:'chairlift',label:'Chair Lift'},{id:'gondola',label:'Gondola'},{id:'skilift',label:'Ski Lift'}];
 const assigned=new Set();
 for(const category of categories){
  const types=liftTypes.filter(t=>(t.group||(t.isChair?'chairlift':'gondola'))===category.id).sort((a,b)=>(a.order||0)-(b.order||0));
  if(!types.length)continue;const group=document.createElement('optgroup');group.label=category.label;
  for(const type of types){const option=document.createElement('option');option.value=type.id;option.textContent=type.label;group.append(option);assigned.add(type.id);}typeSelector.append(group);
 }
 for(const type of liftTypes)if(!assigned.has(type.id)){const option=document.createElement('option');option.value=type.id;option.textContent=type.label;typeSelector.append(option);}
}
function suggestedName(type){const spec=liftTypes.find(t=>t.id===type)||liftTypes[0];return 'New '+spec.label+' '+(spec.group==='chairlift'||spec.isChair?'chairlift':'gondola')+' '+(lifts.length+1);}
let uiHidden=false;
let active=false,draft=null,editing=null,preview=null,selected=null,tool='base',nextId=1,oldSpeed=1,history=[],liveBefore=null,drag=null,down=null,rebuildTimer=null,profileTransform=null,minimum=Infinity,invalidReason='',lastHover=null;
const ray=new T.Raycaster(),pointer=new T.Vector2(),groundMeshes=scene.children.filter(o=>o.userData.terrain);
const overlay=new T.Group();scene.add(overlay);const ghost=new T.Group();scene.add(ghost);ghost.visible=false;
const dimensionMaterial=new T.LineBasicMaterial({color:0xd29b47,depthTest:false});
const gold=new T.MeshBasicMaterial({color:0xd29b47,depthTest:false}),ghostMat=new T.MeshBasicMaterial({color:0x6c8c69,transparent:true,opacity:.7,depthTest:false});
const ringGeometry=new T.RingGeometry(1.8,2.1,36);ringGeometry.rotateX(-Math.PI/2);
const ghostRing=new T.Mesh(ringGeometry,ghostMat);ghost.add(ghostRing);
const ghostPole=new T.Mesh(new T.CylinderGeometry(.13,.13,8,8),ghostMat);ghostPole.position.y=4;ghost.add(ghostPole);
const canvas=renderer.domElement;
function snapshot(){return JSON.stringify(draft);}
function record(before){if(before!==snapshot()){history.push(before);if(history.length>45)history.shift();}}
function change(fn){const before=snapshot();try{fn();record(before);message('');refresh();}catch(e){draft=JSON.parse(before);message(e.message,true);refresh();}}
function startLive(){if(!liveBefore)liveBefore=snapshot();}
function finishLive(){if(liveBefore){record(liveBefore);liveBefore=null;}refreshUI();}
function message(text,bad=false){$('buildMessage').textContent=text;$('buildMessage').className=bad?'bad':'';}
function ordered(){return draft.towers.slice().sort((a,b)=>a.fraction-b.fraction);}
function frame(){return draft?.base&&draft?.top?liftFrame(draft):null;}
function selectedTower(){return draft?.towers.find(t=>t.id===selected);}
function resize(){camera.aspect=app.clientWidth/app.clientHeight;camera.updateProjectionMatrix();renderer.setSize(app.clientWidth,app.clientHeight);}
function disposeRoot(root){if(!root)return;root.parent?.remove(root);const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m);});materials.forEach(m=>{for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();});textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());}
function disposePreview(){if(preview){disposeRoot(preview.root);preview=null;}}
function clearOverlay(){for(const child of [...overlay.children]){overlay.remove(child);child.traverse(o=>{if(o.geometry&&o.geometry!==ringGeometry)o.geometry.dispose();if(o.material&&o.material!==gold&&o.material!==ghostMat&&o.material!==dimensionMaterial)o.material.dispose();});}}
function localGround(x,z){return terrainY(x,z,draft?.base&&draft?.top?draft:null);}
function buildLayout(){
 const f=frame();if(!f)return null;prepareStationGround(draft);
 const custom=ctx.createLayout?.(draft);if(custom)return custom;
 return new window.LiftBuilderCore.LiftLayout({start:{x:draft.base[0],z:draft.base[1],height:draft.stationGround[1]+5},end:{x:draft.top[0],z:draft.top[1],height:draft.stationGround[-1]+5},towers:draft.towers.map(t=>{const p=planPoint(draft,0,f.length/2-t.fraction*f.length);return{id:t.id,fraction:t.fraction,height:localGround(p.x,p.z)+t.height};}),sag:draft.sag,tautTerminals:true,terminalGuides:!!ctx.terminalGuides});
}
function clearance(layout){
 minimum=Infinity;invalidReason='';if(!layout)return;
 // Decks occupy the ends; measure cabin clearance along both exposed rope lanes.
 const spec=carrierSpec();
 for(let s=4;s<=layout.length-4;s+=1.5)for(const side of [-(spec.railX||STATION.railX),(spec.railX||STATION.railX)])for(const dx of [-spec.halfWidth,0,spec.halfWidth])for(const dz of [-spec.halfLength,0,spec.halfLength]){
  const p=layout.pointAt(s,side+dx),ground=localGround(p.x+layout.dx*dz,p.z+layout.dz*dz),clear=p.y-spec.bottomDrop-ground;minimum=Math.min(minimum,clear);
 }
 if(minimum<-.08)invalidReason=((spec.isChair||spec.id==='ridge')?'A chair or its skis':'A cabin')+' would touch the snow. Raise a tower or shorten a span.';
 for(const def of RESORT.lifts){if(def.id===draft.id)continue;const a=liftFrame(def),station=ctx.stationSettings?.(def)||STATION;
  for(const anchor of [draft.base,draft.top]){const dx=anchor[0]-a.x,dz=anchor[1]-a.z,lx=Math.cos(a.angle)*dx-Math.sin(a.angle)*dz,lz=Math.sin(a.angle)*dx+Math.cos(a.angle)*dz;
   for(const end of [-1,1])if(Math.abs(lx)<24&&Math.abs(lz-end*(a.length/2+station.straight/2))<51)invalidReason='The terminals overlap. Move this station a little farther away.';
  }
 }
 // A second line may cross only where cabins retain vertical separation.
 const f=frame();for(const def of RESORT.lifts){if(def.id===draft.id)continue;const a=liftFrame(def),ax=def.top[0]-def.base[0],az=def.top[1]-def.base[1],bx=draft.top[0]-draft.base[0],bz=draft.top[1]-draft.base[1],den=ax*bz-az*bx;
  if(Math.abs(den)<.001)continue;const dx=draft.base[0]-def.base[0],dz=draft.base[1]-def.base[1],u=(dx*bz-dz*bx)/den,v=(dx*az-dz*ax)/den;
  if(u>0&&u<1&&v>0&&v<1){const other=lifts.find(l=>l.def.id===def.id);if(other&&Math.abs(other.cableHeight(a.length/2-u*a.length)-layout.heightAt(v*f.length))<7)invalidReason='The lines cross too closely. Leave at least 7 m of vertical separation.';}
 }
}
function rebuildPreview(){
 clearTimeout(rebuildTimer);rebuildTimer=null;if(!active)return;disposePreview();
 if(draft.base&&draft.top){prepareStationGround(draft);try{preview=createLift({...draft,preview:true,manual:true},editing?.index??lifts.length);preview.update(0);}catch(e){message('Could not render this alignment: '+e.message,true);}}
}
function refresh(immediate=true){
 clearOverlay();const layout=buildLayout();clearance(layout);
 if(layout){
  const p1=layout.pointAt(0,0,0),p2=layout.pointAt(layout.length,0,0),points=[];for(let s=0;s<=layout.length;s+=2){const p=layout.pointAt(s,0,0);points.push(new T.Vector3(p.x,localGround(p.x,p.z)+.15,p.z));}
  const line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineDashedMaterial({color:0x84946b,dashSize:2,gapSize:1}));line.computeLineDistances();overlay.add(line);
  for(const tower of ordered()){
   const p=layout.pointAt(tower.fraction*layout.length),ground=localGround(p.x,p.z),marker=new T.Mesh(ringGeometry,gold);marker.position.set(p.x,ground+.12,p.z);marker.userData.towerId=tower.id;overlay.add(marker);
   if(tower.id===selected){const handle=new T.Mesh(new T.SphereGeometry(.65,14,10),gold),side=layout.pointAt(tower.fraction*layout.length,6.5);handle.position.set(side.x,p.y+1.1,side.z);handle.userData={towerId:tower.id,heightHandle:true};overlay.add(handle);const dim=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(side.x,ground,side.z),handle.position]),dimensionMaterial);overlay.add(dim);}
  }
 }else if(draft.base){const marker=new T.Mesh(ringGeometry,gold);marker.position.set(draft.base[0],terrainY(...draft.base)+.2,draft.base[1]);overlay.add(marker);}
 if(immediate)rebuildPreview();else{if(!rebuildTimer)rebuildTimer=setTimeout(rebuildPreview,100);}
 refreshUI(layout);
}
function refreshUI(layout=buildLayout()){
 if(!active)return;const f=frame(),tower=selectedTower(),spec=carrierSpec();if(typeSelector)typeSelector.value=spec.id;if($('profileLegend'))$('profileLegend').textContent='Snow — Rope — '+((spec.isChair||spec.id==='ridge')?'Chair / skis':'Cabin floor');if($('typeHelp'))$('typeHelp').textContent=spec.description||'';if(document.activeElement!==$('lineName'))$('lineName').value=draft.name;
 $('placeTop').disabled=!draft.base;$('placeTower').disabled=!f;$('selectTower').disabled=!f;
 for(const [id,name] of [['placeBase','base'],['placeTop','top'],['placeTower','tower'],['selectTower','select']])$(id).classList.toggle('active',tool===name);
 $('buildLength').textContent=f?Math.round(f.length)+' m':'';$('towerInspector').hidden=!tower;
 $('towerTitle').textContent=tower?'Tower '+(ordered().findIndex(t=>t.id===selected)+1):'Your line';
 const helps={base:'Click the snow for the valley station. Leave room behind it for the terminal.',top:'Click higher on the mountain for the arrival station.',tower:'Click along the dashed line. Tower positions snap to the alignment.',select:'Choose a tower, then drag its gold handle or its profile dot.'};$('buildHelp').textContent=helps[tool];
 if(tower){$('towerHeight').value=tower.height;$('towerHeightNumber').value=+tower.height.toFixed(2);$('towerPosition').value=tower.fraction*100;$('towerDistance').textContent=Math.round(tower.fraction*f.length)+' m';const n=layout.nodes.find(n=>n.id===selected);$('towerType').textContent=spec.reversible?(n?.compression?'Upper haul-rope hold-down · fixed running rope below':'Support head · running rope over lower wheels'):(n?.compression?'Hold-down · cable below both wheel banks':'Support · cable above both wheel banks');}
 $('builderSupports').replaceChildren();for(const t of ordered()){const b=document.createElement('button');b.classList.toggle('selected',t.id===selected);const name=document.createElement('span');name.textContent='T'+(ordered().findIndex(n=>n.id===t.id)+1)+' · '+Math.round(t.fraction*(f?.length||0))+' m';const value=document.createElement('span');value.textContent=t.height.toFixed(1)+' m';b.append(name,value);b.onclick=()=>{selected=t.id;tool='select';refresh(false);};$('builderSupports').append(b);}
 $('ropeSag').value=draft.sag;$('ropeSagText').textContent=draft.sag.toFixed(2)+' m / 50 m';
 $('buildClearance').textContent=!layout?'Choose two stations to see the cable profile.':invalidReason||Math.max(0,minimum).toFixed(1)+' m minimum '+((spec.isChair||spec.id==='ridge')?'chair / ski':'cabin')+' clearance.'+(ctx.terminalGuides?' Terminal guide wheels included.':'');$('buildClearance').classList.toggle('bad',!!invalidReason);
 $('openLine').disabled=!f||!!invalidReason;$('openLine').textContent=editing?'Save & reopen lift ↗':'Build & open lift ↗';$('buildUndo').disabled=!history.length;
 $('hint').textContent=helps[tool]+' · drag = orbit · right-drag = '+(ctx.rightDragLook?'look in place':'pan')+' · scroll = zoom';drawProfile(layout);
}
function drawProfile(layout){
 const svg=$('mountainProfile');profileTransform=null;if(!layout){svg.innerHTML='<text x="500" y="95" text-anchor="middle" fill="#8b927d" font-family="Georgia" font-size="18">Choose a valley and a destination.</text>';return;}
 const samples=[];let low=Infinity,high=-Infinity;for(let i=0;i<=220;i++){const s=layout.length*i/220,p=layout.pointAt(s),g=localGround(p.x,p.z);samples.push({s,g,h:p.y});low=Math.min(low,g,p.y-carrierSpec().bottomDrop);high=Math.max(high,g,p.y);}
 low=Math.floor((low-4)/10)*10;high=Math.ceil((high+10)/10)*10;if(drag?.kind==='profile'){low=drag.scale.low;high=drag.scale.high;}const x=s=>40+s/layout.length*935,y=h=>145-(h-low)/(high-low)*122;profileTransform={low,high};
 let html='';for(let i=0;i<=4;i++){const h=low+(high-low)*i/4;html+='<path d="M40 '+y(h)+'H975" stroke="#dedfd2"/><text x="32" y="'+(y(h)+3)+'" text-anchor="end" font-size="9" font-family="monospace" fill="#89907c">'+h.toFixed(0)+'</text>';}
 const path=key=>samples.map((p,i)=>(i?'L':'M')+x(p.s).toFixed(1)+','+y(p[key]).toFixed(1)).join(' ');
 if(layout.terminalGuides){for(const [a,b] of [[0,layout.guideLengths.start],[layout.length-layout.guideLengths.end,layout.length]])html+='<rect x="'+x(a)+'" y="18" width="'+(x(b)-x(a))+'" height="127" fill="#c98f3f" opacity=".13"/>';}

 html+='<path d="'+path('g')+'L975 145H40Z" fill="#dce0ce"/><path d="'+path('g')+'" fill="none" stroke="#9da98b"/><path d="'+samples.map((p,i)=>(i?'L':'M')+x(p.s).toFixed(1)+','+y(p.h-carrierSpec().bottomDrop).toFixed(1)).join(' ')+'" fill="none" stroke="'+(minimum<0?'#b97c5a':'#b7b69e')+'" stroke-dasharray="4 4"/><path d="'+path('h')+'" fill="none" stroke="#3f5545" stroke-width="2.5"/>';
 for(const n of layout.nodes){const p=layout.pointAt(n.distance),ground=localGround(p.x,p.z),id=n.kind==='tower'?' data-id="'+n.id+'"':'',color=n.id===selected?'#d39a44':n.compression?'#b67b55':'#64816c';html+='<path d="M'+x(n.distance)+' '+y(n.height)+'V'+y(ground)+'" stroke="#9aab8b"/><circle'+id+' cx="'+x(n.distance)+'" cy="'+y(n.height)+'" r="7" fill="'+color+'" stroke="#faf7ea" stroke-width="2"/>';}
 for(let i=0;i<=4;i++)html+='<text x="'+x(i/4*layout.length)+'" y="169" text-anchor="middle" font-family="monospace" font-size="9" fill="#89907c">'+Math.round(i/4*layout.length)+' m</text>';
 svg.innerHTML=html;
}
function setTool(value){tool=value;ghost.visible=false;refreshUI();}
function begin(line=null){
 if(active)cancel();enterFreeCamera();oldSpeed=ctx.getSimulation().speed;ctx.setSpeed(0);editing=line;selected=null;history=[];liveBefore=null;nextId=1;
 if(line){const f=liftFrame(line.def);draft=JSON.parse(JSON.stringify({...line.def,manual:true,sag:line.def.sag??.55,towers:line.def.manual?line.def.towers:line.supports.slice(1,-1).map(s=>{const p=planPoint(line.def,0,s.z);return{fraction:(f.length/2-s.z)/f.length,height:line.cableHeight(s.z)-terrainY(p.x,p.z)};})}));draft.towers.forEach(t=>{t.id=nextId++;});line.root.visible=false;tool='select';}else{draft={id:'line-'+Date.now().toString(36),type:'gondola',name:suggestedName('gondola'),base:null,top:null,towers:[],sag:.55,color:0xd94f4f,autoPiste:ctx.autoPistes!==false,cabins:0,manual:true};tool='base';}
 draft.type=draft.type||'gondola';active=true;for(const s of skiers)s.g.visible=false;for(const id of ['btnPause','btnPlay','btnFast','btnAdd'])$(id).disabled=true;$('lineName').value=draft.name;$('buildHeading').textContent=line?'01 / EDIT '+line.def.name.toUpperCase():'01 / PLAN A NEW LINE';$('buildPanel').hidden=false;$('resortPanel').hidden=true;$('buildProfile').hidden=false;document.body.classList.add('building');$('btnBuild').classList.add('on');$('tabResort').classList.remove('on');resize();message('');refresh();
}
function cancel(){
 if(!active)return;finishDrag();clearTimeout(rebuildTimer);rebuildTimer=null;disposePreview();clearOverlay();ghost.visible=false;if(editing)editing.root.visible=true;active=false;for(const s of skiers)s.g.visible=true;draft=null;editing=null;liveBefore=null;
 document.body.classList.remove('building');$('buildPanel').hidden=true;$('resortPanel').hidden=false;$('buildProfile').hidden=true;$('btnBuild').classList.remove('on');$('tabResort').classList.add('on');$('hint').textContent=ctx.freeCameraHint||'drag = orbit · right-drag = pan · scroll = zoom to cursor';for(const id of ['btnPause','btnPlay','btnFast','btnAdd'])$(id).disabled=id==='btnAdd'&&!lifts.length;ctx.setSpeed(oldSpeed);resize();
}
function pointerRay(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);}
function groundPoint(e){pointerRay(e);return ray.intersectObjects(groundMeshes,false)[0]?.point||null;}
function picked(e){pointerRay(e);for(const hit of ray.intersectObjects([...overlay.children,...(preview?[preview.root]:[])],true)){let o=hit.object;while(o){if(o.userData.towerId!==undefined)return{id:o.userData.towerId,handle:!!o.userData.heightHandle};if(o.userData.number!==undefined){const tower=ordered()[o.userData.number-1];if(tower)return{id:tower.id};}o=o.parent;}}return null;}
function project(point){const dx=draft.top[0]-draft.base[0],dz=draft.top[1]-draft.base[1],length=Math.hypot(dx,dz),x=point.x-draft.base[0],z=point.z-draft.base[1];return{distance:(x*dx+z*dz)/length,lateral:(x*dz-z*dx)/length,length};}
function validateStations(which,p){
 if(Math.max(Math.abs(p[0]),Math.abs(p[1]))>buildLimit)throw Error('Keep stations within the resort boundary ('+buildLimit+' m from the centre).');const other=draft[which==='base'?'top':'base'];if(!other)return;const length=Math.hypot(p[0]-other[0],p[1]-other[1]);if(length<60||length>maxLineLength)throw Error('Lines can be between 60 and '+maxLineLength+' m long.');const base=which==='base'?p:other,top=which==='top'?p:other;if(terrainY(...top)<terrainY(...base)+2)throw Error('Place the mountain station at least 2 m above the valley station.');const fractions=[0,...ordered().map(t=>t.fraction),1];for(let i=1;i<fractions.length;i++)if((fractions[i]-fractions[i-1])*length<(i===1||i===fractions.length-1?(carrierSpec().terminalSpacing||14):10))throw Error('This move would crowd the towers. Remove or move a tower first.');
}
function addTower(point){const p=project(point);if(Math.abs(p.lateral)>15)throw Error('Click closer to the dashed lift alignment.');const margin=carrierSpec().terminalSpacing||14;if(p.distance<margin||p.distance>p.length-margin)throw Error('Leave at least '+margin+' m between a tower and a terminal.');if(draft.towers.some(t=>Math.abs(t.fraction*p.length-p.distance)<10))throw Error('Leave at least 10 m between towers.');const tower={id:nextId++,fraction:p.distance/p.length,height:carrierSpec().defaultTowerHeight||8};draft.towers.push(tower);selected=tower.id;}
function setHeight(height){const tower=selectedTower();if(!tower)return;tower.height=clamp(Math.round((+height||3)*4)/4,3,40);refresh(false);}
function finishDrag(){if(drag){drag=null;controls.enabled=true;down=null;finishLive();if(active)refresh();}}
canvas.addEventListener('pointerdown',e=>{if(!active||uiHidden||ctx.isCameraLooking?.()||e.button!==0)return;down={x:e.clientX,y:e.clientY};const hit=picked(e);if(hit?.handle){e.stopImmediatePropagation();e.preventDefault();selected=hit.id;const layout=buildLayout(),p=layout.pointAt(selectedTower().fraction*layout.length,6.5),normal=camera.getWorldDirection(new T.Vector3());normal.y=0;if(normal.lengthSq()<.01)normal.set(0,0,1);normal.normalize();const plane=new T.Plane().setFromNormalAndCoplanarPoint(normal,new T.Vector3(p.x,p.y,p.z));pointerRay(e);const contact=ray.ray.intersectPlane(plane,new T.Vector3());if(!contact)return;startLive();drag={kind:'world',pointer:e.pointerId,plane,offset:p.y-contact.y};controls.enabled=false;canvas.setPointerCapture(e.pointerId);}},true);
canvas.addEventListener('pointermove',e=>{
 if(!active||uiHidden||ctx.isCameraLooking?.())return;if(drag?.kind==='world'&&drag.pointer===e.pointerId){pointerRay(e);const p=ray.ray.intersectPlane(drag.plane,new T.Vector3()),tower=selectedTower();if(p&&tower){const f=frame(),groundPoint=planPoint(draft,0,f.length/2-tower.fraction*f.length);setHeight(p.y+drag.offset-localGround(groundPoint.x,groundPoint.z));}return;}
 ghost.visible=false;if(tool==='select')return;const point=groundPoint(e);if(!point)return;lastHover=point.clone();let p=point;
 if(tool==='tower'&&frame()){const projection=project(point),f=frame();p=planPoint(draft,0,f.length/2-clamp(projection.distance,0,f.length));p.y=terrainY(p.x,p.z);ghostPole.visible=true;ghostMat.color.set(Math.abs(projection.lateral)<=15?0x6c8c69:0xb37552);}else{ghostPole.visible=false;ghostMat.color.set(0x6c8c69);}ghost.position.copy(p);ghost.position.y+=.15;ghost.visible=true;
});
canvas.addEventListener('pointerup',e=>{if(!active||uiHidden||ctx.isCameraLooking?.())return;if(drag?.kind==='world'){finishDrag();if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);return;}if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5){down=null;return;}down=null;
 const hit=picked(e);if(hit&&tool!=='base'&&tool!=='top'){selected=hit.id;tool='select';refresh(false);return;}const point=groundPoint(e);if(!point)return;
 if(tool==='base'||tool==='top'){change(()=>{const p=[Math.round(point.x),Math.round(point.z)];validateStations(tool,p);draft[tool]=p;tool=draft.top?'tower':'top';});}
 else if(tool==='tower')change(()=>addTower(point));else{selected=null;refresh(false);}ghost.visible=false;
},true);
canvas.addEventListener('pointercancel',finishDrag);canvas.addEventListener('lostpointercapture',()=>{if(drag?.kind==='world')finishDrag();});window.addEventListener('blur',finishDrag);
$('mountainProfile').addEventListener('pointerdown',e=>{if(!active||e.target.dataset.id===undefined)return;e.preventDefault();selected=+e.target.dataset.id;startLive();drag={kind:'profile',pointer:e.pointerId,scale:{...profileTransform}};$('mountainProfile').setPointerCapture(e.pointerId);tool='select';refresh(false);});
$('mountainProfile').addEventListener('pointermove',e=>{if(drag?.kind!=='profile'||drag.pointer!==e.pointerId)return;const y=new DOMPoint(e.clientX,e.clientY).matrixTransform($('mountainProfile').getScreenCTM().inverse()).y,absolute=drag.scale.low+(145-y)/122*(drag.scale.high-drag.scale.low),f=frame(),tower=selectedTower(),p=planPoint(draft,0,f.length/2-tower.fraction*f.length);setHeight(absolute-localGround(p.x,p.z));});
$('mountainProfile').addEventListener('pointerup',finishDrag);$('mountainProfile').addEventListener('pointercancel',finishDrag);
$('placeBase').onclick=()=>setTool('base');$('placeTop').onclick=()=>setTool('top');$('placeTower').onclick=()=>setTool('tower');$('selectTower').onclick=()=>setTool('select');$('cancelBuild').onclick=cancel;
if(typeSelector)typeSelector.onchange=e=>{if(!active)return;change(()=>{
 const previous=carrierSpec(),autoNamed=draft.name===suggestedName(draft.type)||draft.name==='New gondola '+(lifts.length+1);
 draft.type=e.target.value;const next=carrierSpec();
 if(draft.towers.length&&next.reversible){const length=frame()?.length||Infinity;if(draft.towers.some(t=>Math.min(t.fraction,1-t.fraction)*length<24))throw Error('Solo needs 24 m between pylons and terminals. Move the end pylons first.');}
 if(autoNamed)draft.name=suggestedName(draft.type);
 if(draft.color===(previous.defaultColor??0xd94f4f))draft.color=next.defaultColor??0xd94f4f;
});};
$('lineName').onchange=e=>{if(active)change(()=>draft.name=e.target.value.trim().slice(0,32)||'New gondola');};
$('towerHeight').oninput=e=>{startLive();setHeight(e.target.value);};$('towerHeight').onchange=()=>{finishLive();refresh();};$('towerHeightNumber').onchange=e=>change(()=>{selectedTower().height=clamp(+e.target.value||3,3,40);});
$('towerPosition').oninput=e=>{if(!selectedTower())return;startLive();const f=frame(),tower=selectedTower(),d=tower.fraction*f.length,others=ordered().filter(t=>t.id!==selected).map(t=>t.fraction*f.length),lo=Math.max(carrierSpec().terminalSpacing||14,...others.filter(v=>v<d).map(v=>v+10)),hi=Math.min(f.length-(carrierSpec().terminalSpacing||14),...others.filter(v=>v>d).map(v=>v-10));tower.fraction=clamp(+e.target.value/100*f.length,lo,hi)/f.length;refresh(false);};$('towerPosition').onchange=()=>{finishLive();refresh();};
$('removeTower').onclick=()=>{if(selectedTower())change(()=>{draft.towers=draft.towers.filter(t=>t.id!==selected);selected=null;});};
$('focusTower').onclick=()=>{const tower=selectedTower();if(!tower)return;const f=frame(),p=planPoint(draft,0,f.length/2-tower.fraction*f.length);p.y=localGround(p.x,p.z)+tower.height*.65;controls.enableDamping=false;controls.update();controls.target.copy(p);camera.position.copy(p).add(new T.Vector3(Math.cos(f.angle)*24,12,-Math.sin(f.angle)*24+14));controls.update();controls.enableDamping=true;};
$('ropeSag').oninput=e=>{startLive();draft.sag=+e.target.value;refresh(false);};$('ropeSag').onchange=()=>{finishLive();refresh();};
$('buildUndo').onclick=()=>{finishLive();if(history.length){draft=JSON.parse(history.pop());selected=null;tool=draft.top?'select':draft.base?'top':'base';refresh();}};
$('buildReset').onclick=()=>change(()=>{draft.base=null;draft.top=null;draft.towers=[];selected=null;tool='base';});
$('openLine').onclick=()=>{
 finishLive();const layout=buildLayout();clearance(layout);if(!layout||invalidReason){message(invalidReason||'Place both stations first.',true);refreshUI(layout);return;}
 draft.name=$('lineName').value.trim().slice(0,32)||'New gondola';const definition={id:draft.id,type:draft.type||'gondola',name:draft.name,base:draft.base,top:draft.top,towers:ordered().map(t=>({fraction:t.fraction,height:t.height})),sag:draft.sag,color:draft.color??carrierSpec().defaultColor??0xd94f4f,autoPiste:draft.autoPiste!==false,cabins:0,manual:true};
 const saved=RESORT.lifts.filter(d=>d.manual&&d.id!==definition.id).map(d=>({id:d.id,type:d.type||'gondola',name:d.name,base:d.base,top:d.top,towers:d.towers,sag:d.sag,color:d.color,autoPiste:d.autoPiste!==false,cabins:0,manual:true}));saved.push(definition);
 try{const state=ctx.getSimulation();ctx.save({version:1,lifts:saved,selectedLineId:definition.id,served:state.served,skierCount:state.skierCount,time:state.time,speed:oldSpeed,camera:{position:camera.position.toArray(),target:controls.target.toArray()}});sessionStorage.setItem(noticeKey,definition.name+' is open.');$('openLine').disabled=true;$('openLine').textContent='Opening your lift…';location.reload();}catch(e){message('Could not save this lift in your browser. '+e.message,true);}
};
window.addEventListener('keydown',e=>{if(!active||uiHidden||e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement)return;if(e.key==='Escape'){finishDrag();setTool('select');}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();$('removeTower').click();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$('buildUndo').click();}});
return{begin,cancel,setUIHidden(value){finishDrag();uiHidden=!!value;down=null;ghost.visible=false;overlay.visible=!uiHidden;},get active(){return active;},update(dt){if(active&&preview)preview.update(dt);}};
};
