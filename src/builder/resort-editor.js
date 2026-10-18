// Shared placement rules for save loading and every construction entry point.
window.LiftCoPlacement=(()=>{
 'use strict';
 const EPS=1e-6;
 const margins=(d,spec)=>({base:spec.terminalSpacing||14,top:d.type==='solo'&&d.arrivalProfile==='flat'?30:spec.terminalSpacing||14});
 function definitionReason(d,types,limits){
  const spec=types.find(t=>t.id===(d?.type||'gondola'));
  if(!d||!spec||typeof d.id!=='string'||!d.id||typeof d.name!=='string')return 'Choose a known lift type and name.';
  if(![d.base,d.top].every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)))return 'Place two finite station positions.';
  if([d.base,d.top].some(p=>p.some(v=>Math.abs(v)>limits.buildLimit)))return 'Move the stations inside the resort boundary.';
  const special=window.LiftCoNextAlignment?.special(d);
  if(special&&(!Array.isArray(d.mid)||d.mid.length!==2||!d.mid.every(Number.isFinite)))return 'Place a finite intermediate station position.';
  if(special&&d.mid.some(v=>Math.abs(v)>limits.buildLimit))return 'Move the intermediate structure inside the resort boundary.';
  const path=window.LiftCoNextAlignment?.make(d),length=special?path.length:Math.hypot(d.top[0]-d.base[0],d.top[1]-d.base[1]);
  if(special&&(path.u.length<75||path.v.length<75))return 'Leave at least 75 m from the intermediate structure to each end station.';
  if(special&&(Math.abs(path.angle)<5*Math.PI/180-1e-6||Math.abs(path.angle)>55*Math.PI/180+1e-6))return 'The dedicated intermediate structure needs a turn between 5° and 55°. Drag its middle ring.';
  if(length<60-EPS||length>limits.maxLineLength+EPS)return 'Lift length must be 60–'+limits.maxLineLength+' m.';
  if(!Array.isArray(d.towers)||d.towers.length>60)return 'A line supports at most 60 towers.';
  const ids=new Set(),margin=margins(d,spec),gap=spec.reversible?10:1.7;
  const towers=d.towers.slice().sort((a,b)=>(a?.fraction??0)-(b?.fraction??0));
  for(let i=0;i<towers.length;i++){
   const t=towers[i];
   if(!t||!Number.isFinite(t.fraction)||!Number.isFinite(t.height)||t.height<3||t.height>(spec.maxTowerHeight??40))return 'Tower heights must be within 3–'+(spec.maxTowerHeight??40)+' m.';
   if([t.leanAlong,t.leanAcross].some(a=>a!==undefined&&(!Number.isFinite(a)||Math.abs(a)>20)))return 'Tower tilt must stay within ±20°.';
   if(t.id!==undefined){if(ids.has(t.id))return 'Each tower needs a distinct identity.';ids.add(t.id);}
   const distance=t.fraction*length;
   if(special&&distance>path.midStart-14-EPS&&distance<path.midEnd+14+EPS)return 'Keep tower foundations at least 14 m outside the intermediate transfer structure.';
   if(distance<margin.base-EPS||distance>length-margin.top+EPS||i>0&&(t.fraction-towers[i-1].fraction)*length<gap-EPS)return 'Tower foundations need '+gap+' m spacing, '+margin.base+' m from A and '+margin.top+' m from B.';
  }
  if(d.arrivalProfile!==undefined&&!['inclined','flat'].includes(d.arrivalProfile))return 'Choose Inclined or Flat for the arrival profile.';
  if(d.groupDistance!==undefined&&(!Number.isFinite(d.groupDistance)||d.groupDistance<0||d.groupDistance>15))return 'Foundation grouping must stay within 0–15 m.';
  if(!Number.isFinite(d.sag)||d.sag<0||d.sag>1.5)return 'Cable sag must stay within 0–1.5 m.';
  if(d.stationElevations&&['base','mid','top'].some(end=>d.stationElevations[end]!==undefined&&!Number.isFinite(d.stationElevations[end])))return 'Station elevations must be finite.';
  if(d.stationFoundations&&['base','mid','top'].some(end=>d.stationFoundations[end]!==undefined&&!['terrace','raised'].includes(d.stationFoundations[end])))return 'Choose Terrace or Raised for each station.';
  return '';
 }
 function terminalBoxes(def,spec,station){
  if(spec.nextModel)return window.LiftCoNextAlignment.stationFrames(def).map(f=>{const along={x:Math.sin(f.yaw),z:Math.cos(f.yaw)},across={x:Math.cos(f.yaw),z:-Math.sin(f.yaw)},points=window.LiftCoNextAlignment.footprint(def,f,10),xx=points.map(p=>(p.x-f.x)*across.x+(p.z-f.z)*across.z),zz=points.map(p=>(p.x-f.x)*along.x+(p.z-f.z)*along.z),x=(Math.min(...xx)+Math.max(...xx))/2,z=(Math.min(...zz)+Math.max(...zz))/2;return{x:f.x+across.x*x+along.x*z,z:f.z+across.z*x+along.z*z,along,across,halfLength:(Math.max(...zz)-Math.min(...zz))/2+4,halfWidth:(Math.max(...xx)-Math.min(...xx))/2};});
  const dx=def.top[0]-def.base[0],dz=def.top[1]-def.base[1],length=Math.hypot(dx,dz),along={x:dx/length,z:dz/length},across={x:along.z,z:-along.x};
  return ['base','top'].map(end=>{const sign=end==='base'?-1:1,p=def[end],offset=spec.id==='solo'&&end==='top'&&def.arrivalProfile==='flat'?-1.25:spec.id==='solo'?.25:spec.funitel?2:station.straight/2;return{x:p[0]+along.x*sign*offset,z:p[1]+along.z*sign*offset,along,across,halfLength:spec.id==='solo'&&end==='top'&&def.arrivalProfile==='flat'?17.5:spec.id==='solo'?16:spec.funitel?15:station.straight/2+10,halfWidth:spec.id==='solo'?11:10};});
 }
 function boxesOverlap(a,b){
  const dx=b.x-a.x,dz=b.z-a.z,dot=(u,v)=>u.x*v.x+u.z*v.z;
  for(const axis of [a.along,a.across,b.along,b.across]){
   const radius=box=>box.halfLength*Math.abs(dot(box.along,axis))+box.halfWidth*Math.abs(dot(box.across,axis));
   if(Math.abs(dx*axis.x+dz*axis.z)>=radius(a)+radius(b)-EPS)return false;
  }
  return true;
 }
 function terminalsOverlap(a,b,types,stationSettings){
  const spec=d=>types.find(t=>t.id===(d.type||'gondola'));
  return terminalBoxes(a,spec(a),stationSettings(a)).some(x=>terminalBoxes(b,spec(b),stationSettings(b)).some(y=>boxesOverlap(x,y)));
 }
 // Check exposed corridors as well as exact intersections. This also catches
 // parallel/coincident lines, which have no line-intersection denominator.
 function linesTooClose(a,b,layoutA,layoutB,types,defaultRail=3.1){
  const spec=d=>types.find(t=>t.id===(d.type||'gondola')),sa=spec(a),sb=spec(b);
  const width=(sa.railX||defaultRail)+sa.halfWidth+(sb.railX||defaultRail)+sb.halfWidth;
  // Segment pairs include the actual transfer curve. Test closest points and
  // exact crossings, including parallel spans, using each cable's own height.
  const segments=l=>{const out=[];for(let s=4;s<l.length-4;s+=4){const end=Math.min(s+4,l.length-4);out.push({a:l.pointAt(s),b:l.pointAt(end),s,end});}return out;};
  const closest=(p,a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1)));return{t,x:a.x+dx*t,z:a.z+dz*t};};
  for(const x of segments(layoutA))for(const y of segments(layoutB)){
   if(Math.max(x.a.x,x.b.x)+width<Math.min(y.a.x,y.b.x)||Math.min(x.a.x,x.b.x)-width>Math.max(y.a.x,y.b.x)||Math.max(x.a.z,x.b.z)+width<Math.min(y.a.z,y.b.z)||Math.min(x.a.z,x.b.z)-width>Math.max(y.a.z,y.b.z))continue;
   const pairs=[];for(const t of [0,.5,1]){const p={x:x.a.x+(x.b.x-x.a.x)*t,z:x.a.z+(x.b.z-x.a.z)*t},q=closest(p,y.a,y.b);pairs.push([t,q.t,p,q]);const r={x:y.a.x+(y.b.x-y.a.x)*t,z:y.a.z+(y.b.z-y.a.z)*t},s=closest(r,x.a,x.b);pairs.push([s.t,t,s,r]);}
   const sample=t=>{const p={x:x.a.x+(x.b.x-x.a.x)*t,z:x.a.z+(x.b.z-x.a.z)*t},q=closest(p,y.a,y.b);return{t,u:q.t,p,q,delta:layoutA.heightAt(x.s+t*(x.end-x.s))-layoutB.heightAt(y.s+q.t*(y.end-y.s))};};
   for(const [lo,hi]of [[0,.5],[.5,1]]){let a=sample(lo),b=sample(hi);if(a.delta*b.delta<0){for(let i=0;i<24;i++){const m=sample((a.t+b.t)/2);if(a.delta*m.delta<=0)b=m;else a=m;}const m=sample((a.t+b.t)/2);pairs.push([m.t,m.u,m.p,m.q]);}}
   const ax=x.b.x-x.a.x,az=x.b.z-x.a.z,bx=y.b.x-y.a.x,bz=y.b.z-y.a.z,den=ax*bz-az*bx;
   if(Math.abs(den)>EPS){const dx=y.a.x-x.a.x,dz=y.a.z-x.a.z,t=(dx*bz-dz*bx)/den,u=(dx*az-dz*ax)/den;if(t>=0&&t<=1&&u>=0&&u<=1){const p={x:x.a.x+t*ax,z:x.a.z+t*az};pairs.push([t,u,p,p]);}}
   for(const [t,u,p,q]of pairs)if(Math.hypot(p.x-q.x,p.z-q.z)<width&&Math.abs(layoutA.heightAt(x.s+t*(x.end-x.s))-layoutB.heightAt(y.s+u*(y.end-y.s)))<7-EPS)return true;
  }return false;
 }
 return{definitionReason,terminalsOverlap,linesTooClose,margins,terminalBoxes,boxesOverlap};
})();

// Construction tools for the resort. Layouts are saved as data, then reconstructed
// through the same createLift factory as the original operational line.
window.createResortBuilder=function(ctx){
'use strict';
const {THREE:T,scene,camera,controls,renderer,app,lifts,skiers,RESORT,terrainY,prepareStationGround,createLift,liftFrame,planPoint,STATION,seed,SAVE_KEY,enterFreeCamera}=ctx;
const liftTypes=ctx.liftTypes||[{id:'gondola',label:'Alpine gondola',shortName:'Gondola',bottomDrop:4.99,halfWidth:1.1,halfLength:1.15}];
const carrierSpec=()=>liftTypes.find(t=>t.id===(draft?.type||'gondola'))||liftTypes[0];
const boardingOffset=()=>selectedStation==='mid'&&carrierSpec().layout==='turn'?8.2:carrierSpec().nextModel?(carrierSpec().fixedGrip?.645:carrierSpec().family==='princesse'?1.19:.26):carrierSpec().id==='solo'?.6:carrierSpec().fixedGrip?0:.52;
const towerHeightLimit=()=>carrierSpec().maxTowerHeight??40;
const canGroup=()=>!!ctx.columnLean&&!carrierSpec().reversible;
const minimumTowerGap=()=>canGroup()?1.7:10;
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
function suggestedName(type){const spec=liftTypes.find(t=>t.id===type)||liftTypes[0];return 'New '+(spec.shortName||spec.label)+' '+(lifts.length+1);}
let uiHidden=false;
let active=false,draft=null,editing=null,preview=null,selected=null,tool='base',nextId=1,oldSpeed=1,history=[],redo=[],copiedTower=null,selectedStation=null,projectionOrigin=null,liveBefore=null,drag=null,down=null,rebuildTimer=null,profileTransform=null,minimum=Infinity,invalidReason='',lastHover=null;
let validationDefinitions=null,layoutError='';
const definitions=()=>validationDefinitions||ctx.getDefinitions?.()||RESORT.lifts;
const ray=new T.Raycaster(),pointer=new T.Vector2(),groundMeshes=scene.children.filter(o=>o.userData.terrain);
const overlay=new T.Group();scene.add(overlay);const ghost=new T.Group();scene.add(ghost);ghost.visible=false;
// Reuse the terrain buffers: a shader marks its actual surface near A's altitude.
// This stays separate from selectable tower markers and never changes the terrain.
const elevationLayer=new T.Group();elevationLayer.visible=false;scene.add(elevationLayer);
const elevationMaterial=new T.ShaderMaterial({
 uniforms:{targetHeight:{value:0},tolerance:{value:1},boundary:{value:buildLimit},tint:{value:new T.Color(0x28a8a4)}},
 vertexShader:`varying vec3 surface;void main(){vec4 world=modelMatrix*vec4(position,1.0);surface=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
 fragmentShader:`uniform float targetHeight;uniform float tolerance;uniform float boundary;uniform vec3 tint;varying vec3 surface;
 void main(){float delta=abs(surface.y-targetHeight);if(delta>tolerance||max(abs(surface.x),abs(surface.z))>boundary)discard;
 float edge=1.0-smoothstep(tolerance*.65,tolerance,delta);float contour=1.0-smoothstep(.08,.25,delta);
 gl_FragColor=vec4(mix(tint,vec3(.72,1.0,.94),contour*.55),edge*(.42+.36*contour));}`,
 transparent:true,depthWrite:false,depthTest:true,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3
});
for(const ground of groundMeshes){const tint=new T.Mesh(ground.geometry,elevationMaterial);ground.updateWorldMatrix(true,false);tint.matrixAutoUpdate=false;tint.matrix.copy(ground.matrixWorld);tint.renderOrder=2;elevationLayer.add(tint);}
const elevationLegend=document.createElement('p');elevationLegend.id='elevationGuide';elevationLegend.className='small';elevationLegend.style.color='#268783';elevationLegend.style.marginTop='8px';elevationLegend.hidden=true;$('buildHelp').after(elevationLegend);
function updateElevationGuide(hover=null){
 elevationLayer.children.forEach((mesh,i)=>{mesh.geometry=groundMeshes[i].geometry;});
 const visible=active&&!uiHidden&&carrierSpec().funitel&&!!draft.base&&(tool==='top'||tool==='base');elevationLayer.visible=!!visible;elevationLegend.hidden=!visible;if(!visible)return;
 const height=terrainY(...draft.base);elevationMaterial.uniforms.targetHeight.value=height-.08;
 let text='Teal terrain: '+height.toFixed(1)+' m ±1 m from station A. Station B’s platform automatically matches A.';
 if(hover&&tool==='top'){const delta=terrainY(Math.round(hover.x),Math.round(hover.z))-height;text+=' Here: '+(delta>=0?'+':'')+delta.toFixed(1)+' m.';ghostMat.color.set(Math.abs(delta)<=1?0x28a8a4:0xb37552);}
 if(draft.stationGround&&draft.top){const delta=draft.stationGround[-1]-draft.stationGround[1];text+=' Platform difference: '+(delta>=0?'+':'')+delta.toFixed(1)+' m.';}
 elevationLegend.textContent=text;
}
const dimensionMaterial=new T.LineBasicMaterial({color:0xd29b47,depthTest:false});
const gold=new T.MeshBasicMaterial({color:0xd29b47,depthTest:false}),ghostMat=new T.MeshBasicMaterial({color:0x6c8c69,transparent:true,opacity:.7,depthTest:false});
const invalidTowerM=new T.MeshBasicMaterial({color:0xe04e44,depthTest:false});
const ringGeometry=new T.RingGeometry(1.8,2.1,36);ringGeometry.rotateX(-Math.PI/2);
const ghostRing=new T.Mesh(ringGeometry,ghostMat);ghost.add(ghostRing);
const ghostPole=new T.Mesh(new T.CylinderGeometry(.13,.13,8,8),ghostMat);ghostPole.position.y=4;ghost.add(ghostPole);
const canvas=renderer.domElement;
const stationPanel=document.createElement('div');stationPanel.className='panel-section';stationPanel.innerHTML=`<span class="eyebrow">STATION PLATFORMS</span><div class="row"><button id="inspectBase">Station A</button><button id="inspectTop">Station B</button><button id="inspectMid" hidden>Middle structure</button></div><div id="stationControls" hidden><label for="stationElevation">Boarding floor elevation · m</label><input id="stationElevation" type="number" step=".25"><label for="stationFoundation">Foundation</label><select id="stationFoundation"><option value="terrace">Terrace · cut & fill</option><option value="raised">Raised · preserve hillside</option></select><div id="arrivalControls" hidden><label for="arrivalProfile">Upper station arrival</label><select id="arrivalProfile"><option value="flat">Flat inside · cliff approach</option><option value="inclined">Inclined · 20°</option></select><p class="small">Flat through the hall; compact entrance transition over the cliff, supported by an embedded lattice portal. Keep the last pylon at least 30 m away.</p></div><p id="stationEarthworks" class="small"></p><p class="small">Drag the station ring to move it. Towers project onto the edited alignment. The middle ring moves the dedicated transfer structure.</p></div>`;$('buildHelp').after(stationPanel);
for(const end of ['base','mid','top'])$('inspect'+(end==='base'?'Base':end==='mid'?'Mid':'Top')).onclick=()=>{selectedStation=end;selected=null;tool='select';refresh(false);};
$('stationElevation').onchange=e=>{if(!selectedStation||!draft?.[selectedStation])return;change(()=>{draft.stationElevations??={};const datum=draft.stationGround[selectedStation==='base'?1:selectedStation==='mid'?'mid':-1];draft.stationElevations[selectedStation]=datum+Math.round((Number(e.target.value)-datum-boardingOffset())*4)/4;if(carrierSpec().funitel)draft.stationElevations.base=draft.stationElevations.top=draft.stationElevations[selectedStation];});};
$('stationFoundation').onchange=e=>{if(!selectedStation)return;change(()=>{draft.stationFoundations??={};draft.stationFoundations[selectedStation]=e.target.value;});};
$('arrivalProfile').onchange=e=>{if(carrierSpec().id==='solo'&&selectedStation==='top')change(()=>{draft.arrivalProfile=e.target.value;});};
const copyRow=document.createElement('div');copyRow.className='row';copyRow.innerHTML='<button id="copyTower">Copy tower settings</button><button id="pasteTower">Paste settings</button>';$('removeTower').parentElement.after(copyRow);
$('copyTower').onclick=()=>{const t=selectedTower();if(t){copiedTower={height:t.height,leanAlong:t.leanAlong??0,leanAcross:t.leanAcross??0};message('Tower height and tilt copied.');}};
$('pasteTower').onclick=()=>{if(selectedTower()&&copiedTower)change(()=>Object.assign(selectedTower(),copiedTower));};
const redoButton=document.createElement('button');redoButton.id='buildRedo';redoButton.textContent='Redo';$('buildUndo').after(redoButton);
$('cancelBuild').textContent='Cancel ×';
function moveStation(end,p){
 const old=JSON.parse(JSON.stringify(draft)),oldFrame=old.base&&old.top?liftFrame(old):null;
 if(!projectionOrigin&&oldFrame)projectionOrigin=old;
 draft[end]=p;
 window.LiftCoNextAlignment.ensureMid(draft);
 if(oldFrame&&draft.base&&draft.top&&frame().length>1e-6){const f=frame();for(const t of draft.towers){const source=old.towers.find(o=>o.id===t.id),point=planPoint(old,0,oldFrame.length/2-source.fraction*oldFrame.length);t.fraction=project(point).distance/f.length;}}
}

const levelButton=document.createElement('button');levelButton.id='levelLift';levelButton.type='button';levelButton.textContent='Level lift';levelButton.style.marginTop='10px';levelButton.hidden=true;$('buildHelp').before(levelButton);
const levelStatus=document.createElement('p');levelStatus.id='levelLiftStatus';levelStatus.className='small';levelStatus.style.marginTop='6px';levelStatus.hidden=true;levelButton.after(levelStatus);
function levelInfo(layout){
 const issues=new Map();if(!layout||!carrierSpec().funitel||!draft.levelLift)return{issues};
 const target=layout.nodes[0].height,f=frame(),ground=ctx.rawTerrainY||terrainY;let offLevel=0;
 for(const tower of draft.towers){const p=planPoint(draft,0,f.length/2-tower.fraction*f.length),required=target-ground(p.x,p.z);if(required<3-1e-7||required>towerHeightLimit()+1e-7)issues.set(tower.id,{required,reason:required<3?'too low':'too high'});else if(Math.abs(tower.height-required)>.01)offLevel++;}
 return{issues,target,offLevel,stationDelta:layout.nodes.at(-1).height-target};
}
function applyLevelHeights(){
 const layout=buildLayout();if(!layout)return;const target=layout.nodes[0].height,f=frame(),ground=ctx.rawTerrainY||terrainY;
 for(const tower of draft.towers){const p=planPoint(draft,0,f.length/2-tower.fraction*f.length);tower.height=clamp(target-ground(p.x,p.z),3,towerHeightLimit());}
}
levelButton.onclick=()=>{if(active&&frame()&&carrierSpec().funitel)change(()=>{draft.levelLift=true;applyLevelHeights();});};
function tintInvalidTowers(layout){
 const issues=levelInfo(layout).issues;if(!preview||!issues.size)return;
 for(const node of preview.root.children.flatMap(o=>o.children)){
  const number=node.userData.number;if(number===undefined)continue;const tower=ordered()[number-1];if(!tower||!issues.has(tower.id))continue;
  const material=new T.MeshStandardMaterial({color:0xd7463e,emissive:0x6b1511,emissiveIntensity:.3,roughness:.65});node.traverse(o=>{if(o.isMesh)o.material=material;});
 }
}
const leanPanel=document.createElement('div');leanPanel.id='towerLean';leanPanel.hidden=true;leanPanel.innerHTML=`<div class="row spread"><label for="towerLeanAlong">Side-view tilt · toward A / B</label><span id="towerLeanAlongValue" class="mono">0°</span></div><input id="towerLeanAlong" type="range" min="-20" max="20" step="0.5" value="0"><button id="resetTowerLean" type="button">Reset column upright</button><p class="small">The foundation stays fixed. The top moves along the line and the cable follows it.</p>`;$('towerType').after(leanPanel);
const canLean=()=>!!ctx.columnLean&&!carrierSpec().reversible;
function columnFoot(tower,layout){const p=layout.pointAt(tower.fraction*layout.length),node=layout.nodes.find(n=>n.id===tower.id);return{x:p.x,y:node?.footGround??localGround(p.x,p.z),z:p.z,distance:tower.fraction*layout.length,valid:node?.columnValid!==false};}
function towerHeadDistance(tower,layout){const node=layout.nodes.find(n=>n.id===tower.id);if(node?.headDistance!==undefined)return node.headDistance;return tower.fraction*layout.length+(canLean()?window.LiftCoTowerMast.headShift(tower.height,tower.leanAlong):0);}
$('towerLeanAlong').oninput=e=>{if(!selectedTower()||!canLean())return;startLive();selectedTower().leanAlong=clamp(+e.target.value||0,-20,20);selectedTower().leanAcross=0;refresh(false);};$('towerLeanAlong').onchange=()=>{finishLive();refresh();};
$('resetTowerLean').onclick=()=>{if(selectedTower())change(()=>{selectedTower().leanAlong=0;selectedTower().leanAcross=0;});};
const groupPanel=document.createElement('div');groupPanel.className='panel-section';groupPanel.hidden=true;groupPanel.innerHTML=`<div class="row spread"><label for="towerGroupDistance">Group nearby foundations</label><span id="towerGroupDistanceValue" class="mono"></span></div><input id="towerGroupDistance" type="range" min="0" max="15" step=".5" value="7"><p id="towerGroupReport" class="small"></p>`;$('builderSupports').before(groupPanel);
$('towerGroupDistance').oninput=e=>{if(!active||!canGroup())return;startLive();draft.groupDistance=+e.target.value;refresh(false);};$('towerGroupDistance').onchange=()=>{finishLive();refresh();};
function highlightSelectedTower(){
 if(!preview)return;const issues=levelInfo(preview.layout).issues,chosen=uiHidden?null:selected;
 if(!preview.selectionMaterials)preview.selectionMaterials=new Map();
 preview.root.traverse(tower=>{
  const id=tower.userData.towerId??(tower.userData.number!==undefined?ordered()[tower.userData.number-1]?.id:undefined);if(id===undefined)return;
  tower.traverse(node=>{
   if(!node.isMesh)return;if(node.userData.selectionOriginalMaterial)node.material=node.userData.selectionOriginalMaterial;
   if(id!==chosen||issues.has(id))return;
   const goldMaterial=original=>{if(!preview.selectionMaterials.has(original)){const m=original.clone();m.color?.lerp(new T.Color(0xd6a344),.82);if(m.emissive){m.emissive.set(0x704915);m.emissiveIntensity=.35;}preview.selectionMaterials.set(original,m);}return preview.selectionMaterials.get(original);};
   node.userData.selectionOriginalMaterial=node.material;node.material=Array.isArray(node.material)?node.material.map(goldMaterial):goldMaterial(node.material);
  });
 });
}
function snapshot(){return JSON.stringify(draft);}
function record(before){if(before!==snapshot()){history.push(before);redo=[];if(history.length>45)history.shift();}}
function change(fn){const before=snapshot();try{fn();record(before);message('');refresh();}catch(e){draft=JSON.parse(before);message(e.message,true);refresh();}}
function startLive(){if(!liveBefore)liveBefore=snapshot();}
function finishLive(){if(liveBefore){record(liveBefore);liveBefore=null;}refreshUI();}
function message(text,bad=false){$('buildMessage').textContent=text;$('buildMessage').className=bad?'bad':'';}
function ordered(){return draft.towers.slice().sort((a,b)=>a.fraction-b.fraction);}
function frame(){return draft?.base&&draft?.top?liftFrame(draft):null;}
function selectedTower(){return draft?.towers.find(t=>t.id===selected);}
function resize(){camera.aspect=app.clientWidth/app.clientHeight;camera.updateProjectionMatrix();renderer.setSize(app.clientWidth,app.clientHeight);}
function disposeRoot(root){if(!root)return;root.parent?.remove(root);const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m);const original=o.userData.selectionOriginalMaterial;for(const m of Array.isArray(original)?original:original?[original]:[])materials.add(m);});materials.forEach(m=>{for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();});textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());}
function disposePreview(){if(preview){for(const m of preview.selectionMaterials?.values()||[])m.dispose();disposeRoot(preview.root);preview=null;}}
function clearOverlay(){for(const child of [...overlay.children]){overlay.remove(child);child.traverse(o=>{if(o.geometry&&o.geometry!==ringGeometry)o.geometry.dispose();if(o.material&&o.material!==gold&&o.material!==ghostMat&&o.material!==dimensionMaterial&&o.material!==invalidTowerM)o.material.dispose();});}}
function localGround(x,z){return terrainY(x,z,draft?.base&&draft?.top?draft:null);}
function calculationDraft(){
 const result=JSON.parse(JSON.stringify(draft));
 const sorted=result.towers.sort((a,b)=>a.fraction-b.fraction);for(let i=0;i<sorted.length;i++)sorted[i].fraction=clamp(sorted[i].fraction,.001+i*.0001,.999-(sorted.length-i)*.0001);for(let i=1;i<sorted.length;i++)sorted[i].fraction=Math.max(sorted[i].fraction,sorted[i-1].fraction+.00005);
 return result;
}
function buildLayout(){
 layoutError='';const f=frame();if(!f||f.length<60)return null;prepareStationGround(draft);
 try{
 const custom=ctx.createLayout?.(calculationDraft());if(custom)return custom;
 return new window.LiftBuilderCore.LiftLayout({start:{x:draft.base[0],z:draft.base[1],height:draft.stationGround[1]+5},end:{x:draft.top[0],z:draft.top[1],height:draft.stationGround[-1]+5},towers:draft.towers.map(t=>{const p=planPoint(draft,0,f.length/2-t.fraction*f.length);return{id:t.id,fraction:t.fraction,height:localGround(p.x,p.z)+t.height};}),sag:draft.sag,tautTerminals:true,terminalGuides:!!ctx.terminalGuides});
 }catch(error){layoutError=error.message;return null;}
}
function clearance(layout){
 minimum=Infinity;invalidReason='';if(!layout){if(draft.base&&draft.top)invalidReason=layoutError||'Leave at least 60 m between stations.';return;}
 const f0=frame(),spec0=carrierSpec();
 const definitionError=window.LiftCoPlacement.definitionReason(draft,liftTypes,{buildLimit,maxLineLength});
 if(definitionError){invalidReason=definitionError;return;}
 const own=window.LiftCoPlacement.terminalBoxes(draft,spec0,ctx.stationSettings?.(draft)||STATION);if(own.some((a,i)=>own.slice(i+1).some(b=>window.LiftCoPlacement.boxesOverlap(a,b)))){invalidReason='Stations or transfer structures overlap. Move them farther apart.';return;}
 if(!spec0.horizontal&&draft.stationGround[-1]<draft.stationGround[1]+2-1e-6){invalidReason='Place the mountain platform at least 2 m above the valley platform.';return;}
 if(f0.length<60||f0.length>maxLineLength)invalidReason='Lift length must be 60–'+maxLineLength+' m.';
 if([draft.base,draft.top].some(p=>p.some(v=>Math.abs(v)>buildLimit)))invalidReason='Move the stations inside the resort boundary.';
 const feet=ordered().map(t=>t.fraction*f0.length),margin=window.LiftCoPlacement.margins(draft,spec0);
 if(feet.some((d,i)=>d<margin.base-1e-6||d>f0.length-margin.top+1e-6||i&&d-feet[i-1]<minimumTowerGap()-1e-6))invalidReason='Tower foundations are too close to a station or each other. Drag them apart.';
 for(const end of (carrierSpec().nextModel?window.LiftCoNextAlignment.stationFrames(draft).map(f=>f.end):['base','top']))if(draft.stationFoundations?.[end]==='raised'){
  const sign=end==='base'?1:end==='mid'?'mid':-1,settings=ctx.stationSettings?.(draft)||STATION;
  if(spec0.nextModel){const frame=window.LiftCoNextAlignment.stationFrames(draft).find(f=>f.end===end);for(const p of window.LiftCoNextAlignment.footprint(draft,frame))if(draft.stationGround[sign]<(ctx.rawTerrainY||terrainY)(p.x,p.z)-.05)invalidReason='A raised platform intersects the hillside. Raise it or use a terrace.';continue;}
  for(const x of [-8,0,8])for(const out of (spec0.id==='solo'?[-15.5,0,12]:[0,settings.straight/2,settings.straight])){const p=planPoint(draft,x,sign*(f0.length/2+out));if(draft.stationGround[sign]<(ctx.rawTerrainY||terrainY)(p.x,p.z)-.05)invalidReason='A raised platform intersects the hillside. Raise it or use a terrace.';}
 }


 // Decks occupy the ends; measure cabin clearance along both exposed rope lanes.
 const spec=carrierSpec();
 for(let s=4;s<=layout.length-4;s+=1.5)for(const side of [-(spec.railX||STATION.railX),(spec.railX||STATION.railX)])for(const dx of [-spec.halfWidth,0,spec.halfWidth])for(const dz of [-spec.halfLength,0,spec.halfLength]){
  const p=layout.pointAt(s,side+dx),tangent=layout.path?.at(s)||{dx:layout.dx,dz:layout.dz},ground=localGround(p.x+tangent.dx*dz,p.z+tangent.dz*dz),clear=p.y-spec.bottomDrop-ground;minimum=Math.min(minimum,clear);
 }
 if(minimum<-.08)invalidReason=((spec.isChair||spec.id==='ridge')?'A chair or its skis':'A cabin')+' would touch the snow. Raise a tower or shorten a span.';
 for(const def of definitions()){
  if(def.id===draft.id)continue;
  if(window.LiftCoPlacement.terminalsOverlap(draft,def,liftTypes,d=>ctx.stationSettings?.(d)||STATION)){invalidReason='The terminals overlap. Move this station a little farther away.';continue;}
  prepareStationGround(def);let other;try{other=ctx.createLayout?.(def);}catch(error){invalidReason=def.name+': '+error.message+' Resolve that line before applying.';continue;}
  if(other&&window.LiftCoPlacement.linesTooClose(draft,def,layout,other,liftTypes,STATION.railX))invalidReason='The lines run or cross too closely. Leave at least 7 m of vertical separation.';
 }

 if(spec.id==='solo'){const reason=window.LiftCoSoloPlacement.reason(draft,layout,ctx.rawTerrainY||terrainY,localGround);if(reason)invalidReason=reason;}
 if(spec.nextModel&&layout.path.midStart!==null&&layout.nodes.some(n=>n.kind==='tower'&&n.distance>layout.path.midStart-14&&n.distance<layout.path.midEnd+14))invalidReason='A tilted wheel head enters the intermediate structure. Move the tower or reduce tilt.';
 if(canLean()){
  const heads=ordered().map(t=>towerHeadDistance(t,layout));
  if(heads.some((d,i)=>d<14||d>layout.length-14||i>0&&d-heads[i-1]<1.7-1e-6))invalidReason='Tilting puts wheel heads too close together or to a station. Reduce the tilt or move a foundation.';
 }
 if(canGroup()&&layout.foundationGroups?.some(g=>!g.valid))invalidReason='A shared foundation reaches too close to a wheel head. Raise its towers, reduce grouping distance or move a footing.';
 const issues=levelInfo(layout).issues;if(issues.size)invalidReason='Red towers cannot reach the level cable height within 3–'+towerHeightLimit()+' m. Move or remove them, or relocate station A.';
}
function rebuildPreview(){
 clearTimeout(rebuildTimer);rebuildTimer=null;if(!active)return;disposePreview();
 if(draft.base&&draft.top&&frame().length>=30){prepareStationGround(draft);try{preview=createLift({...calculationDraft(),preview:true,manual:true},editing?.index??lifts.length);preview.update(0);tintInvalidTowers(preview.layout);}catch(e){message('Could not render this alignment: '+e.message,true);}}
}
function refresh(immediate=true){
 clearOverlay();const layout=buildLayout();ctx.previewTerrain?.(draft);clearance(layout);const level=levelInfo(layout);
 if(layout){
  for(const end of (carrierSpec().nextModel?window.LiftCoNextAlignment.stationFrames(draft).map(f=>f.end):['base','top'])){const marker=new T.Mesh(new T.RingGeometry(4,4.6,40),gold);marker.geometry.rotateX(-Math.PI/2);marker.position.set(draft[end][0],draft.stationGround[end==='base'?1:end==='mid'?'mid':-1]+.7,draft[end][1]);marker.userData.stationEnd=end;overlay.add(marker);}
  if(projectionOrigin?.base&&projectionOrigin?.top){const original=liftFrame(projectionOrigin);for(const tower of draft.towers){const old=projectionOrigin.towers.find(t=>t.id===tower.id);if(!old)continue;const a=planPoint(projectionOrigin,0,original.length/2-old.fraction*original.length),b=planPoint(draft,0,layout.length/2-tower.fraction*layout.length);a.y=terrainY(a.x,a.z)+.3;b.y=terrainY(b.x,b.z)+.3;const line=new T.Line(new T.BufferGeometry().setFromPoints([a,b]),dimensionMaterial);overlay.add(line);const ring=new T.Mesh(ringGeometry,ghostMat);ring.position.copy(a);overlay.add(ring);}}
  const p1=layout.pointAt(0,0,0),p2=layout.pointAt(layout.length,0,0),points=[];for(let s=0;s<=layout.length;s+=2){const p=layout.pointAt(s,0,0);points.push(new T.Vector3(p.x,localGround(p.x,p.z)+.15,p.z));}
  const line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineDashedMaterial({color:0x84946b,dashSize:2,gapSize:1}));line.computeLineDistances();overlay.add(line);
  for(const tower of ordered()){
   const p=columnFoot(tower,layout),ground=p.y,marker=new T.Mesh(ringGeometry,level.issues.has(tower.id)?invalidTowerM:gold);marker.position.set(p.x,ground+.12,p.z);marker.userData.towerId=tower.id;overlay.add(marker);
   if(tower.id===selected){const handle=new T.Mesh(new T.SphereGeometry(.65,14,10),gold),side=layout.pointAt(towerHeadDistance(tower,layout),6.5);handle.position.set(side.x,side.y+1.1,side.z);handle.userData={towerId:tower.id,heightHandle:true};overlay.add(handle);const dim=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(side.x,ground,side.z),handle.position]),dimensionMaterial);overlay.add(dim);}
  }
 }else if(draft.base){const marker=new T.Mesh(ringGeometry,gold);marker.position.set(draft.base[0],terrainY(...draft.base)+.2,draft.base[1]);overlay.add(marker);}
 if(immediate)rebuildPreview();else{if(!rebuildTimer)rebuildTimer=setTimeout(rebuildPreview,100);}
 refreshUI(layout);
}
function refreshUI(layout=buildLayout()){
 if(!active)return;
 $('inspectMid').hidden=!window.LiftCoNextAlignment.special(draft);$('inspectMid').textContent=carrierSpec().layout==='turn'?'Angle structure':'Station M';
 $('arrivalControls').hidden=carrierSpec().id!=='solo'||selectedStation!=='top';$('arrivalProfile').value=draft.arrivalProfile||'inclined';
 $('stationControls').hidden=!selectedStation||!draft[selectedStation];stationPanel.querySelector('label[for=stationElevation]').textContent=selectedStation==='mid'&&carrierSpec().layout==='turn'?'Transfer rope elevation · m':'Boarding floor elevation · m';
 if(selectedStation&&draft[selectedStation]){const sign=selectedStation==='base'?1:selectedStation==='mid'?'mid':-1,y=draft.stationGround?.[sign]??terrainY(...draft[selectedStation]),ground=(ctx.rawTerrainY||terrainY)(...draft[selectedStation]);$('stationElevation').value=(y+boardingOffset()).toFixed(4);$('stationElevation').min=y+boardingOffset()-5000;$('stationFoundation').value=draft.stationFoundations?.[selectedStation]||'terrace';$('stationEarthworks').textContent=(selectedStation==='mid'&&carrierSpec().layout==='turn'?'Transfer rope ':'Boarding floor ')+(y+boardingOffset()).toFixed(2)+' m · '+(y>=ground?'Fill / foundation depth ':'Excavation ')+Math.abs(y-ground).toFixed(2)+' m at centre'+(selectedStation==='mid'&&carrierSpec().layout==='turn'?' · machinery only; no pedestrian access.':' · pedestrian access on outer platform.');}
 $('buildRedo').disabled=!redo.length;
 updateElevationGuide();highlightSelectedTower();const f=frame(),tower=selectedTower(),spec=carrierSpec();if(typeSelector)typeSelector.value=spec.id;if($('profileLegend'))$('profileLegend').textContent='Snow — Rope — '+((spec.isChair||spec.id==='ridge')?'Chair / skis':'Cabin floor');if($('typeHelp'))$('typeHelp').textContent=spec.description||'';if(document.activeElement!==$('lineName'))$('lineName').value=draft.name;
 groupPanel.hidden=!canGroup();if(!groupPanel.hidden){const gap=draft.groupDistance??7;$('towerGroupDistance').value=gap;$('towerGroupDistanceValue').textContent=gap===0?'Off':gap.toFixed(1)+' m';const groups=layout?.foundationGroups||[],shared=groups.filter(g=>g.shared);$('towerGroupReport').textContent=!layout?'Nearby towers will share one concrete foundation.':groups.length+' foundations · '+shared.length+' shared. Minimum tower spacing: 1.7 m.';}
 const level=levelInfo(layout);levelButton.hidden=!spec.funitel;levelButton.disabled=!f||!draft.towers.length;levelStatus.hidden=!spec.funitel||!draft.levelLift||!layout;
 if(!levelStatus.hidden){levelStatus.textContent='Tower tops: '+level.target.toFixed(2)+' m. '+(level.issues.size?level.issues.size+' red tower'+(level.issues.size===1?'':'s')+' cannot reach this elevation (3–'+towerHeightLimit()+' m).':level.offLevel?level.offLevel+' tower top'+(level.offLevel===1?' has':'s have')+' moved; press Level lift again.':'All tower tops are level.')+(Math.abs(level.stationDelta)>.1?' Station B cable is '+(level.stationDelta>=0?'+':'')+level.stationDelta.toFixed(2)+' m from A; move station B to match.':' Station cable heights match.');levelStatus.style.color=level.issues.size||level.offLevel||Math.abs(level.stationDelta)>.1?'#ad5037':'#64816c';}
 $('placeTop').disabled=!draft.base;$('placeTower').disabled=!f;$('selectTower').disabled=!f;
 for(const [id,name] of [['placeBase','base'],['placeTop','top'],['placeTower','tower'],['selectTower','select']])$(id).classList.toggle('active',tool===name);
 leanPanel.hidden=!tower||!canLean();if(!leanPanel.hidden){for(const [id,key]of [['towerLeanAlong','leanAlong']]){$(id).value=tower[key]??0;$(id+'Value').textContent=(tower[key]??0).toFixed(1)+'°';}}
 $('buildLength').textContent=f?Math.round(f.length)+' m':'';$('towerInspector').hidden=!tower;
 $('towerTitle').textContent=tower?'Tower '+(ordered().findIndex(t=>t.id===selected)+1):'Your line';
 const helps={base:'Click the snow for the valley station. Leave room behind it for the terminal.',top:spec.id==='solo'?'Place the arrival over a downhill cliff. Station B offers a flat hall or an inclined dock; small approach cuts are automatic.':spec.funitel?'Choose teal terrain for a destination at the same elevation as station A.':spec.horizontal?'Click a destination across the valley or plateau. Equal-height terminals are allowed.':'Click higher on the mountain for the arrival station.',tower:'Click along the dashed line. Tower positions snap to the alignment.',select:'Drag a station ring or tower foundation. Gold side handles and profile dots adjust tower height.'};$('buildHelp').textContent=helps[tool];
 if(tower){$('towerHeight').max=towerHeightLimit();$('towerHeightNumber').max=towerHeightLimit();$('towerHeight').value=tower.height;$('towerHeightNumber').value=+tower.height.toFixed(2);$('towerPosition').value=tower.fraction*100;$('towerDistance').textContent=Math.round(tower.fraction*f.length)+' m';const n=layout?.nodes.find(n=>n.id===selected);$('towerType').textContent=spec.funitel?'Four support banks · two ropes per cabin'+(tower.height>30?' · Reinforced pillar and foundation':'')+(level.issues.has(tower.id)?' · Cannot level: needs '+level.issues.get(tower.id).required.toFixed(2)+' m ('+level.issues.get(tower.id).reason+')':''):spec.id==='solo'?'Heavy Portal · fixed carrying-rope saddle and twin haul guides':spec.reversible?(n?.compression?'Upper haul-rope hold-down · fixed running rope below':'Support head · running rope over lower wheels'):(n?.compression?'Hold-down · cable below both wheel banks':'Support · cable above both wheel banks');}
 $('builderSupports').replaceChildren();for(const t of ordered()){const b=document.createElement('button');b.classList.toggle('selected',t.id===selected);if(level.issues.has(t.id)){b.style.color='#c13e36';b.style.borderColor='#d85a50';b.title='Level height required: '+level.issues.get(t.id).required.toFixed(2)+' m; allowed 3–'+towerHeightLimit()+' m.';}const name=document.createElement('span');name.textContent='T'+(ordered().findIndex(n=>n.id===t.id)+1)+' · '+Math.round(t.fraction*(f?.length||0))+' m';const value=document.createElement('span');value.textContent=t.height.toFixed(1)+' m';b.append(name,value);b.onclick=()=>{selected=t.id;tool='select';refresh(false);};$('builderSupports').append(b);}
 $('ropeSag').value=draft.sag;$('ropeSagText').textContent=spec.id==='solo'?(layout?layout.maxSag.toFixed(2)+' m actual span sag'+(layout.tensionAdjusted?' · adjusted for pylon contact':''):'Requested sag '+draft.sag.toFixed(2)):draft.sag.toFixed(2)+' m / 50 m';
 $('ropeSag').title=spec.id==='solo'?'Requested sag factor. Actual sag is shown above; a low pylon can require looser ropes to keep saddle contact. Raise or move that pylon.':'';
 $('buildClearance').textContent=invalidReason||(!layout?'Choose two stations to see the cable profile.':Math.max(0,minimum).toFixed(1)+' m minimum '+((spec.isChair||spec.id==='ridge')?'chair / ski':'cabin')+' clearance.'+(ctx.terminalGuides?' Terminal guide wheels included.':''));if(!invalidReason&&spec.id==='solo'&&layout?.tensionAdjusted)$('buildClearance').textContent+=' A low pylon requires looser ropes; raise or move it to reduce sag.';$('buildClearance').classList.toggle('bad',!!invalidReason);
 $('openLine').disabled=!f||!!invalidReason;$('openLine').textContent='Apply construction ↗';$('buildUndo').disabled=!history.length;
 $('hint').textContent=helps[tool]+' · drag = orbit · right-drag = '+(ctx.rightDragLook?'look in place':'pan')+' · scroll = zoom';drawProfile(layout);
}
function drawProfile(layout){
 const svg=$('mountainProfile');const level=levelInfo(layout);profileTransform=null;if(!layout){svg.innerHTML='<text x="500" y="95" text-anchor="middle" fill="#8b927d" font-family="Georgia" font-size="18">Choose a valley and a destination.</text>';return;}
 const samples=[];let low=Infinity,high=-Infinity;for(let i=0;i<=220;i++){const s=layout.length*i/220,p=layout.pointAt(s),g=localGround(p.x,p.z);samples.push({s,g,h:p.y});low=Math.min(low,g,p.y-carrierSpec().bottomDrop);high=Math.max(high,g,p.y);}
 low=Math.floor((low-4)/10)*10;high=Math.ceil((high+10)/10)*10;if(drag?.kind==='profile'){low=drag.scale.low;high=drag.scale.high;}const x=s=>40+s/layout.length*935,y=h=>145-(h-low)/(high-low)*122;profileTransform={low,high};
 let html='';for(let i=0;i<=4;i++){const h=low+(high-low)*i/4;html+='<path d="M40 '+y(h)+'H975" stroke="#dedfd2"/><text x="32" y="'+(y(h)+3)+'" text-anchor="end" font-size="9" font-family="monospace" fill="#89907c">'+h.toFixed(0)+'</text>';}
 const path=key=>samples.map((p,i)=>(i?'L':'M')+x(p.s).toFixed(1)+','+y(p[key]).toFixed(1)).join(' ');
 if(layout.terminalGuides){for(const [a,b] of [[0,layout.guideLengths.start],[layout.length-layout.guideLengths.end,layout.length]])html+='<rect x="'+x(a)+'" y="18" width="'+(x(b)-x(a))+'" height="127" fill="#c98f3f" opacity=".13"/>';}

 html+='<path d="'+path('g')+'L975 145H40Z" fill="#dce0ce"/><path d="'+path('g')+'" fill="none" stroke="#9da98b"/><path d="'+samples.map((p,i)=>(i?'L':'M')+x(p.s).toFixed(1)+','+y(p.h-carrierSpec().bottomDrop).toFixed(1)).join(' ')+'" fill="none" stroke="'+(minimum<0?'#b97c5a':'#b7b69e')+'" stroke-dasharray="4 4"/><path d="'+path('h')+'" fill="none" stroke="#3f5545" stroke-width="2.5"/>';
 for(const n of layout.nodes){const p=layout.pointAt(n.distance),foot=n.kind==='tower'?columnFoot(draft.towers.find(t=>t.id===n.id),layout):{distance:n.distance,y:localGround(p.x,p.z)},ground=foot.y,id=n.kind==='tower'?' data-id="'+n.id+'"':'',color=level.issues.has(n.id)?'#e04e44':n.id===selected?'#d39a44':n.compression?'#b67b55':'#64816c';html+='<path d="M'+x(n.distance)+' '+y(n.height)+' L'+x(foot.distance)+' '+y(ground)+'" stroke="#9aab8b"/><circle'+id+' cx="'+x(n.distance)+'" cy="'+y(n.height)+'" r="7" fill="'+color+'" stroke="#faf7ea" stroke-width="2"/>';}
 for(let i=0;i<=4;i++)html+='<text x="'+x(i/4*layout.length)+'" y="169" text-anchor="middle" font-family="monospace" font-size="9" fill="#89907c">'+Math.round(i/4*layout.length)+' m</text>';
 svg.innerHTML=html;
}
function setTool(value){tool=value;ghost.visible=false;refreshUI();}
function begin(line=null){
 if(active)cancel();enterFreeCamera();oldSpeed=ctx.getSimulation().speed;ctx.setSpeed(0);editing=line;selected=null;history=[];redo=[];selectedStation=null;projectionOrigin=null;liveBefore=null;nextId=1;
 if(line){const f=liftFrame(line.def);draft=JSON.parse(JSON.stringify({...line.def,manual:true,sag:line.def.sag??.55,towers:line.def.manual?line.def.towers:line.supports.slice(1,-1).map(s=>{const p=planPoint(line.def,0,s.z);return{fraction:(f.length/2-s.z)/f.length,height:line.cableHeight(s.z)-terrainY(p.x,p.z)};})}));draft.towers.forEach(t=>{t.id??=draft.id+'-tower-'+nextId++;});line.root.visible=false;tool='select';}else{draft={id:'line-'+Date.now().toString(36),type:'gondola',name:suggestedName('gondola'),base:null,top:null,towers:[],sag:.55,color:0xd94f4f,autoPiste:ctx.autoPistes!==false,cabins:0,manual:true};tool='base';}
 draft.type=draft.type||'gondola';active=true;ctx.onConstructionBegin?.();for(const s of skiers)s.g.visible=false;for(const id of ['btnPause','btnPlay','btnFast','btnAdd'])$(id).disabled=true;$('lineName').value=draft.name;$('buildHeading').textContent=line?'01 / EDIT '+line.def.name.toUpperCase():'01 / PLAN A NEW LINE';$('buildPanel').hidden=false;$('resortPanel').hidden=true;$('buildProfile').hidden=false;document.body.classList.add('building');$('btnBuild').classList.add('on');$('tabResort').classList.remove('on');resize();message('');refresh();
}
function cancel(){
 if(!active)return;finishDrag();clearTimeout(rebuildTimer);rebuildTimer=null;disposePreview();clearOverlay();ghost.visible=false;if(editing)editing.root.visible=true;active=false;elevationLayer.visible=false;elevationLegend.hidden=true;for(const s of skiers)s.g.visible=true;draft=null;editing=null;liveBefore=null;ctx.previewTerrain?.(null);
 document.body.classList.remove('building');$('buildPanel').hidden=true;$('resortPanel').hidden=false;$('buildProfile').hidden=true;$('btnBuild').classList.remove('on');$('tabResort').classList.add('on');$('hint').textContent=ctx.freeCameraHint||'drag = orbit · right-drag = pan · scroll = zoom to cursor';for(const id of ['btnPause','btnPlay','btnFast','btnAdd'])$(id).disabled=!!ctx.pendingConstruction?.()||id==='btnAdd'&&!lifts.length;ctx.setSpeed(oldSpeed);resize();ctx.onConstructionEnd?.();
}
function pointerRay(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);}
function groundPoint(e){pointerRay(e);return ray.intersectObjects(groundMeshes,false)[0]?.point||null;}
function picked(e){pointerRay(e);for(const hit of ray.intersectObjects([...overlay.children,...(preview?[preview.root]:[])],true)){let o=hit.object;while(o){if(o.userData.stationEnd)return{station:o.userData.stationEnd};if(o.userData.towerId!==undefined)return{id:o.userData.towerId,handle:!!o.userData.heightHandle};if(o.userData.towerIds?.length){const distance=project(hit.point).distance;const tower=ordered().filter(t=>o.userData.towerIds.includes(t.id)).sort((a,b)=>Math.abs(a.fraction*frame().length-distance)-Math.abs(b.fraction*frame().length-distance))[0];if(tower)return{id:tower.id};}if(o.userData.number!==undefined){const tower=ordered()[o.userData.number-1];if(tower)return{id:tower.id};}o=o.parent;}}return null;}
function project(point){if(window.LiftCoNextAlignment.special(draft)&&draft.mid)return window.LiftCoNextAlignment.make(draft).project(point.x,point.z);const dx=draft.top[0]-draft.base[0],dz=draft.top[1]-draft.base[1],length=Math.hypot(dx,dz),x=point.x-draft.base[0],z=point.z-draft.base[1];return{distance:(x*dx+z*dz)/length,lateral:(x*dz-z*dx)/length,length};}
function addTower(point){const p=project(point);if(Math.abs(p.lateral)>15)throw Error('Click closer to the dashed lift alignment.');const margin=window.LiftCoPlacement.margins(draft,carrierSpec());if(p.distance<margin.base||p.distance>p.length-margin.top)throw Error('Keep pylons '+margin.base+' m from A and '+margin.top+' m from B.');if(draft.towers.some(t=>Math.abs(t.fraction*p.length-p.distance)<minimumTowerGap()))throw Error('Leave at least '+minimumTowerGap()+' m between tower foundations.');const tower={id:draft.id+'-tower-'+Date.now().toString(36)+'-'+nextId++,fraction:p.distance/p.length,height:carrierSpec().defaultTowerHeight||8};draft.towers.push(tower);if(draft.levelLift&&carrierSpec().funitel)applyLevelHeights();selected=tower.id;}
function setHeight(height){const tower=selectedTower();if(!tower)return;tower.height=clamp(Math.round((+height||3)*4)/4,3,towerHeightLimit());refresh(false);}
function finishDrag(){if(drag){drag=null;controls.enabled=true;down=null;finishLive();if(active)refresh();}}
canvas.addEventListener('pointerdown',e=>{if(!active||uiHidden||ctx.isCameraLooking?.()||e.button!==0)return;down={x:e.clientX,y:e.clientY};const hit=picked(e);
 if(hit?.station||hit&&!hit.handle&&hit.id!==undefined&&tool==='select'){
  e.stopImmediatePropagation();e.preventDefault();startLive();
  if(hit.station){selectedStation=hit.station;selected=null;drag={kind:'station',end:hit.station,pointer:e.pointerId,origin:JSON.parse(JSON.stringify(draft))};}
  else {selected=hit.id;selectedStation=null;drag={kind:'foundation',pointer:e.pointerId};}
  controls.enabled=false;canvas.setPointerCapture(e.pointerId);refresh(false);return;
 }
 if(hit?.handle){e.stopImmediatePropagation();e.preventDefault();selected=hit.id;const layout=buildLayout(),p=layout.pointAt(towerHeadDistance(selectedTower(),layout),6.5),normal=camera.getWorldDirection(new T.Vector3());normal.y=0;if(normal.lengthSq()<.01)normal.set(0,0,1);normal.normalize();const plane=new T.Plane().setFromNormalAndCoplanarPoint(normal,new T.Vector3(p.x,p.y,p.z));pointerRay(e);const contact=ray.ray.intersectPlane(plane,new T.Vector3());if(!contact)return;startLive();drag={kind:'world',pointer:e.pointerId,plane,offset:p.y-contact.y};controls.enabled=false;canvas.setPointerCapture(e.pointerId);}},true);
canvas.addEventListener('pointermove',e=>{
 if(!active||uiHidden||ctx.isCameraLooking?.())return;if((drag?.kind==='station'||drag?.kind==='foundation')&&drag.pointer===e.pointerId){const p=groundPoint(e);if(p){if(drag.kind==='station'){const origin=drag.origin;draft=JSON.parse(JSON.stringify(origin));moveStation(drag.end,[Math.round(p.x),Math.round(p.z)]);}else{const t=selectedTower();if(t)t.fraction=clamp(project(p).distance/frame().length,.001,.999);}refresh(false);}return;}
 if(drag?.kind==='world'&&drag.pointer===e.pointerId){pointerRay(e);const p=ray.ray.intersectPlane(drag.plane,new T.Vector3()),tower=selectedTower();if(p&&tower){const f=frame(),groundPoint=planPoint(draft,0,f.length/2-tower.fraction*f.length);setHeight(p.y+drag.offset-localGround(groundPoint.x,groundPoint.z));}return;}
 ghost.visible=false;if(tool==='select')return;const point=groundPoint(e);if(!point)return;lastHover=point.clone();let p=point;
 if(tool==='tower'&&frame()){const projection=project(point),f=frame();p=planPoint(draft,0,f.length/2-clamp(projection.distance,0,f.length));p.y=terrainY(p.x,p.z);ghostPole.visible=true;ghostMat.color.set(Math.abs(projection.lateral)<=15?0x6c8c69:0xb37552);}else{ghostPole.visible=false;ghostMat.color.set(0x6c8c69);}ghost.position.copy(p);ghost.position.y+=.15;ghost.visible=true;updateElevationGuide(point);
});
canvas.addEventListener('pointerup',e=>{if(!active||uiHidden||ctx.isCameraLooking?.())return;if(drag&&drag.kind!=='profile'){finishDrag();if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);return;}if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5){down=null;return;}down=null;
 const hit=picked(e);if(hit?.station){selectedStation=hit.station;tool='select';refresh(false);return;}if(hit&&tool!=='base'&&tool!=='top'){selected=hit.id;tool='select';refresh(false);return;}const point=groundPoint(e);if(!point)return;
 if(tool==='base'||tool==='top'){change(()=>{const p=[Math.round(point.x),Math.round(point.z)];moveStation(tool,p);selectedStation=tool;tool=draft.top?'tower':'top';});}
 else if(tool==='tower')change(()=>addTower(point));else{selected=null;refresh(false);}ghost.visible=false;
},true);
canvas.addEventListener('pointercancel',finishDrag);canvas.addEventListener('lostpointercapture',()=>{if(drag)finishDrag();});window.addEventListener('blur',finishDrag);
$('mountainProfile').addEventListener('pointerdown',e=>{if(!active||e.target.dataset.id===undefined)return;e.preventDefault();selected=draft.towers.find(t=>String(t.id)===e.target.dataset.id)?.id;startLive();drag={kind:'profile',pointer:e.pointerId,scale:{...profileTransform}};$('mountainProfile').setPointerCapture(e.pointerId);tool='select';refresh(false);});
$('mountainProfile').addEventListener('pointermove',e=>{if(drag?.kind!=='profile'||drag.pointer!==e.pointerId)return;const y=new DOMPoint(e.clientX,e.clientY).matrixTransform($('mountainProfile').getScreenCTM().inverse()).y,absolute=drag.scale.low+(145-y)/122*(drag.scale.high-drag.scale.low),f=frame(),tower=selectedTower(),p=planPoint(draft,0,f.length/2-tower.fraction*f.length);setHeight(absolute-localGround(p.x,p.z));});
$('mountainProfile').addEventListener('pointerup',finishDrag);$('mountainProfile').addEventListener('pointercancel',finishDrag);
$('placeBase').onclick=()=>setTool('base');$('placeTop').onclick=()=>setTool('top');$('placeTower').onclick=()=>setTool('tower');$('selectTower').onclick=()=>setTool('select');$('cancelBuild').onclick=cancel;
if(typeSelector)typeSelector.onchange=e=>{if(!active)return;change(()=>{
 const previous=carrierSpec(),autoNamed=draft.name===suggestedName(draft.type)||draft.name==='New gondola '+(lifts.length+1);
 draft.type=e.target.value;const next=carrierSpec();if(!window.LiftCoNextAlignment.special(draft)){delete draft.mid;if(selectedStation==='mid')selectedStation=null;}else window.LiftCoNextAlignment.ensureMid(draft);if(next.id==='solo')draft.arrivalProfile??='flat';
 if(draft.towers.some(t=>t.height>towerHeightLimit()))throw Error(next.label+' towers are limited to '+towerHeightLimit()+' m. Lower the taller towers before changing lift type.');
 if(draft.towers.length&&next.reversible){const length=frame()?.length||Infinity;if(draft.towers.some(t=>Math.min(t.fraction,1-t.fraction)*length<(next.terminalSpacing||24)))throw Error(next.label+' needs '+(next.terminalSpacing||24)+' m between pylons and terminals. Move the end pylons first.');}
 if(previous.id!==next.id)delete draft.levelLift;
 if(next.reversible&&draft.towers.length>1){const length=frame()?.length||0,a=ordered();if(a.some((t,i)=>i&&((t.fraction-a[i-1].fraction)*length<10)))throw Error('This lift type needs at least 10 m between tower foundations. Spread the close towers first.');}
 if(autoNamed)draft.name=suggestedName(draft.type);
 if(draft.color===(previous.defaultColor??0xd94f4f))draft.color=next.defaultColor??0xd94f4f;
});};
$('lineName').onchange=e=>{if(active)change(()=>draft.name=e.target.value.trim().slice(0,32)||'New gondola');};
$('towerHeight').oninput=e=>{startLive();setHeight(e.target.value);};$('towerHeight').onchange=()=>{finishLive();refresh();};$('towerHeightNumber').onchange=e=>change(()=>{selectedTower().height=clamp(+e.target.value||3,3,towerHeightLimit());});
$('towerPosition').oninput=e=>{if(!selectedTower())return;startLive();const f=frame(),tower=selectedTower(),d=tower.fraction*f.length,others=ordered().filter(t=>t.id!==selected).map(t=>t.fraction*f.length),lo=Math.max(window.LiftCoPlacement.margins(draft,carrierSpec()).base,...others.filter(v=>v<d).map(v=>v+minimumTowerGap())),hi=Math.min(f.length-window.LiftCoPlacement.margins(draft,carrierSpec()).top,...others.filter(v=>v>d).map(v=>v-minimumTowerGap()));tower.fraction=clamp(+e.target.value/100*f.length,lo,hi)/f.length;refresh(false);};$('towerPosition').onchange=()=>{finishLive();refresh();};
$('removeTower').onclick=()=>{if(selectedTower())change(()=>{draft.towers=draft.towers.filter(t=>t.id!==selected);selected=null;});};
$('focusTower').onclick=()=>{const tower=selectedTower();if(!tower)return;const f=frame(),p=planPoint(draft,0,f.length/2-tower.fraction*f.length);p.y=localGround(p.x,p.z)+tower.height*.65;controls.enableDamping=false;controls.update();controls.target.copy(p);camera.position.copy(p).add(new T.Vector3(Math.cos(f.angle)*24,12,-Math.sin(f.angle)*24+14));controls.update();controls.enableDamping=true;};
$('ropeSag').oninput=e=>{startLive();draft.sag=+e.target.value;refresh(false);};$('ropeSag').onchange=()=>{finishLive();refresh();};
$('buildUndo').onclick=()=>{finishLive();if(history.length){redo.push(snapshot());draft=JSON.parse(history.pop());selected=null;tool=draft.top?'select':draft.base?'top':'base';refresh();}};
$('buildRedo').onclick=()=>{finishLive();if(redo.length){history.push(snapshot());draft=JSON.parse(redo.pop());selected=null;refresh();}};
$('buildReset').onclick=()=>change(()=>{draft.base=null;draft.top=null;delete draft.mid;draft.towers=[];delete draft.levelLift;selected=null;tool='base';});
$('openLine').onclick=()=>{
 finishLive();const layout=buildLayout();clearance(layout);if(!layout||invalidReason){message(invalidReason||'Place both stations first.',true);refreshUI(layout);return;}
 draft.name=$('lineName').value.trim().slice(0,32)||'New lift';
 draft.stationElevations??={};draft.stationElevations.base??=draft.stationGround[1];draft.stationElevations.top??=draft.stationGround[-1];if(window.LiftCoNextAlignment.special(draft))draft.stationElevations.mid??=draft.stationGround.mid;
 const definition=JSON.parse(JSON.stringify({...draft,manual:true,autoPiste:false,towers:ordered()}));delete definition.preview;
 try{if(ctx.commit){ctx.commit(definition);cancel();}else throw Error('Live resort commit unavailable.');}catch(e){message('Could not apply: '+e.message,true);}

};
window.addEventListener('keydown',e=>{if(!active||uiHidden||e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement)return;if(e.key==='Escape'){finishDrag();setTool('select');}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();$('removeTower').click();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();(e.shiftKey?$('buildRedo'):$('buildUndo')).click();}});
return{begin,cancel,setUIHidden(value){finishDrag();uiHidden=!!value;down=null;ghost.visible=false;overlay.visible=!uiHidden;updateElevationGuide();highlightSelectedTower();},get active(){return active;},get resumeSpeed(){return oldSpeed;},validate(definition,others=null){const old=draft,oldDefinitions=validationDefinitions,oldReason=invalidReason,oldMinimum=minimum;draft=definition;validationDefinitions=others;try{const structural=window.LiftCoPlacement.definitionReason(definition,liftTypes,{buildLimit,maxLineLength});if(structural)return structural;clearance(buildLayout());return invalidReason;}catch(error){return 'Could not validate the lift: '+error.message;}finally{draft=old;validationDefinitions=oldDefinitions;invalidReason=oldReason;minimum=oldMinimum;}},update(dt){if(active&&preview)preview.update(dt);}};
};
