// Experimental grouping only. Main-game tower spacing is deliberately unchanged.
window.LiftCoTowerGroupStudy={start(T,OrbitControls,RoomEnvironment){
 const $=id=>document.getElementById(id),stage=$('stage'),renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));renderer.setSize(stage.clientWidth,stage.clientHeight);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;stage.prepend(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color(0xe9e9e0);scene.fog=new T.Fog(0xe9e9e0,180,550);scene.add(new T.HemisphereLight(0xeaf2f6,0x7c816d,2));const sun=new T.DirectionalLight(0xffe7bc,3.2);sun.position.set(-35,65,25);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-70,right:70,top:70,bottom:-70,far:180});sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;scene.add(sun);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();
 const camera=new T.PerspectiveCamera(39,stage.clientWidth/stage.clientHeight,.04,1200),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=.3;controls.maxDistance=500;controls.enablePan=false;controls.mouseButtons.RIGHT=null;
 const material=(color,roughness=.65,metalness=.15)=>new T.MeshStandardMaterial({color,roughness,metalness,side:T.DoubleSide}),steel=material(0x89999c,.42,.6),dark=material(0x3a494c,.65,.4),concrete=material(0x989d92,.95),selectedM=material(0xb58a47,.6,.3),snow=material(0xe5e8e0,.98),red=material(0xc45a4c),rim=material(0xc6cfcb,.38,.65),rubber=material(0x253133,.9);
 let towers=[],threshold=7,terrain='crest',selected=1,serial=6,history=[],live=null,structures=null,cables=null,ground=null,groups=[],timer=null,cableVisible=true,lineLayout=null;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const terrainY=(x,z)=>terrain==='flat'?0:terrain==='slope'?5+.16*z+.12*x:2+10*Math.exp(-(((z+26)/22)**2))+.07*x;
 function snapshot(){return JSON.stringify({towers,threshold,terrain,selected,serial});}
 function saveUndo(){history.push(snapshot());if(history.length>40)history.shift();}
 function change(fn){saveUndo();fn();rebuild();}
 function startLive(){if(live===null)live=snapshot();}
 function finishLive(){if(live!==null&&live!==snapshot()){history.push(live);if(history.length>40)history.shift();}live=null;clearTimeout(timer);timer=null;rebuild();}
 function later(){clearTimeout(timer);timer=setTimeout(rebuild,45);}
 function dispose(group){if(!group)return;scene.remove(group);const geometries=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});for(const g of geometries)g.dispose();}
 function mesh(parent,g,m,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function box(parent,w,h,d,x,y,z,m){return mesh(parent,new T.BoxGeometry(w,h,d),m,x,y,z);}
 function bar(parent,a,b,r,m=steel){const p=new T.Vector3(...a),q=new T.Vector3(...b),delta=q.clone().sub(p);const o=mesh(parent,new T.CylinderGeometry(r,r,delta.length(),8),m);o.position.copy(p).add(q).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;}
 function merge(parent){parent.updateWorldMatrix(true,true);const inverse=parent.matrixWorld.clone().invert(),parts=new Map();parent.traverse(o=>{if(o.isMesh){const key=o.material.uuid;if(!parts.has(key))parts.set(key,[]);parts.get(key).push(o);}});const used=new Set();for(const list of parts.values()){const positions=[],normals=[];for(const o of list){const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));}g.dispose();used.add(o.geometry);o.parent.remove(o);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.computeBoundingSphere();mesh(parent,g,list[0].material);}for(const g of used)g.dispose();}
 function makeGroups(){const sorted=[...towers].sort((a,b)=>a.z-b.z),result=[];for(const t of sorted){const group=result.at(-1);if(group&&threshold>0&&t.z-group.at(-1).z<=threshold+.0001)group.push(t);else result.push([t]);}return result;}
 function foundationFor(list){
  const bounds={x0:-.93,x1:.93,z0:Math.min(...list.map(t=>t.z))-.93,z1:Math.max(...list.map(t=>t.z))+.93},heights=[];
  for(let i=0;i<=4;i++)for(let j=0;j<=8;j++)heights.push(terrainY(T.MathUtils.lerp(bounds.x0,bounds.x1,i/4),T.MathUtils.lerp(bounds.z0,bounds.z1,j/8)));
  const top=Math.max(...heights)+.04;return{...bounds,top,bottom:Math.min(...heights)-.6,valid:list.every(t=>terrainY(0,t.z)+t.height-1.22>top+.4)};
 }
 function towerPose(t,foundation){
  const ropeY=terrainY(0,t.z)+t.height,footY=(foundation?foundation.top-.04:terrainY(0,t.z))-.05,headY=ropeY-1.22,rise=headY-footY;
  return{ropeY,footY,headY,headZ:t.z-Math.tan(t.along*Math.PI/180)*rise};
 }
 function foundationOf(t){const list=groups.find(g=>g.some(o=>o.id===t.id));return list?.length>1?foundationFor(list):null;}
 function wheel(parent,x,y,z){const g=new T.Group();g.position.set(x,y,z);parent.add(g);const tyre=mesh(g,new T.CylinderGeometry(.34,.34,.20,20),rubber);tyre.rotation.z=Math.PI/2;for(const side of [-1,1]){const plate=mesh(g,new T.CylinderGeometry(.30,.30,.035,20),rim,side*.112,0,0);plate.rotation.z=Math.PI/2;}const hub=mesh(g,new T.CylinderGeometry(.08,.08,.30,10),dark);hub.rotation.z=Math.PI/2;}
 function tower(t,foundation){
  const pose=towerPose(t,foundation),ropeY=pose.ropeY,g=new T.Group();g.position.z=pose.headZ;g.userData.towerId=t.id;structures.add(g);const mastM=t.id===selected?selectedM:steel;
  const column=window.LiftCoTowerMast.create(T,{parent:g,headY:ropeY-1.22,groundAt:foundation?()=>foundation.top-.04:(x,z)=>terrainY(x,t.z+z),along:t.along,across:0,footOverride:{x:0,y:pose.footY,z:t.z-pose.headZ,valid:pose.headY>pose.footY},steel:mastM,concrete,dark,foundation:!foundation});
  const floorY=ropeY-1.22,headY=ropeY+2.85;
  for(const side of [-1,1])bar(g,[side*2.05,floorY,0],[side*3.95,headY,0],.14,mastM);bar(g,[-4.35,headY,0],[4.35,headY,0],.15,mastM);
  for(let x=-2.2;x<=2.21;x+=.3)box(g,.13,.045,2.9,x,floorY,0,dark);
  for(const side of [-1,1]){for(const z of [-1.45,0,1.45])bar(g,[side*2.25,floorY,z],[side*2.25,floorY+1,z],.025);for(const y of [.5,1])bar(g,[side*2.25,floorY+y,-1.45],[side*2.25,floorY+y,1.45],.025);}
  for(const side of [-1,1]){
   const x=side*3.1,gap=Math.min(...towers.filter(o=>o.id!==t.id).map(o=>Math.abs(towerPose(o,foundationOf(o)).headZ-pose.headZ))),half=Math.max(.35,Math.min(1.68,gap/2-.18)),count=Math.max(2,Math.min(5,Math.floor(half*2/.6)+1)),compression=lineLayout.nodes.find(n=>n.id===t.id)?.compression,sign=compression?1:-1,links=[];
   for(const z of Array.from({length:count},(_,i)=>-half+2*half*i/(count-1))){
    const s=pose.headZ+90+z,y=lineLayout.heightAt(s),slope=(lineLayout.heightAt(s+.025)-lineLayout.heightAt(s-.025))/.05,normal=1/Math.hypot(1,slope),cy=y+sign*.34*normal,cz=z-sign*.34*slope*normal;
    wheel(g,x,cy,cz);const mount=[x-side*.2,y+sign*.70,z];links.push(mount);bar(g,mount,[x-side*.2,cy,cz],.05);
   }
   for(let i=1;i<links.length;i++)bar(g,links[i-1],links[i],.10,dark);
   for(const p of [links[0],links.at(-1)])bar(g,p,[x,headY,p[2]*.35],.085,mastM);
  }
  merge(g);return column.foot.valid&&(!foundation||foundation.valid);
 }
 function buildCables(){
  cables=new T.Group();cables.visible=cableVisible;scene.add(cables);
  for(const side of [-1,1]){class Cable extends T.Curve{getPoint(u,out=new T.Vector3()){const z=-90+u*180;return out.set(side*3.1,lineLayout.heightAt(z+90),z);}}mesh(cables,new T.TubeGeometry(new Cable(),900,.035,6,false),dark);}
 }
 function rebuild(){
  dispose(structures);dispose(cables);dispose(ground);structures=new T.Group();scene.add(structures);ground=new T.Group();scene.add(ground);const geo=new T.PlaneGeometry(180,180,100,100);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,terrainY(p.getX(i),p.getZ(i))-.05);geo.computeVertexNormals();mesh(ground,geo,snow);
  groups=makeGroups();
  lineLayout=new window.LiftBuilderCore.LiftLayout({start:{x:0,z:-90,height:terrainY(0,-90)+12},end:{x:0,z:90,height:terrainY(0,90)+12},towers:towers.map(t=>{const p=towerPose(t,foundationOf(t));return{id:t.id,fraction:clamp((p.headZ+90)/180,.001,.999),height:p.ropeY};}),sag:.55,tautTerminals:true});
  let invalid=0,shared=0;
  for(const [i,list] of groups.entries()){
   const foundation=list.length>1?foundationFor(list):null;
   if(foundation){shared++;const c=foundation.valid?concrete:red;const block=box(structures,foundation.x1-foundation.x0,foundation.top-foundation.bottom,foundation.z1-foundation.z0,(foundation.x0+foundation.x1)/2,(foundation.top+foundation.bottom)/2,(foundation.z0+foundation.z1)/2,c);block.userData.groupIds=list.map(t=>t.id);
    // One lower monolithic block and a thin contrasting top edge make the join legible.
    box(structures,foundation.x1-foundation.x0+.12,.08,foundation.z1-foundation.z0+.12,(foundation.x0+foundation.x1)/2,foundation.top-.04,(foundation.z0+foundation.z1)/2,foundation.valid?dark:red);
   }
   for(const t of list)if(!tower(t,foundation))invalid++;
  }
  buildCables();structures.updateMatrixWorld(true);$('summary').textContent=towers.length+' towers · '+groups.length+' foundations · '+shared+' shared';$('gapValue').textContent=threshold.toFixed(1)+' m';$('groupDistance').value=threshold;$('terrain').value=terrain;
  $('towerList').replaceChildren();for(const t of [...towers].sort((a,b)=>a.z-b.z)){const button=document.createElement('button');button.textContent='T'+t.id+' · '+t.z.toFixed(1)+' m · '+t.height.toFixed(1)+' m high';button.classList.toggle('active',t.id===selected);button.onclick=()=>{selected=t.id;rebuild();};$('towerList').append(button);}
  const t=towers.find(t=>t.id===selected);if(t){$('selectedName').textContent='TOWER '+t.id;for(const [id,key]of [['position','z'],['height','height'],['heightSlider','height'],['leanAlong','along']])if(document.activeElement!==$(id))$(id).value=t[key];$('positionValue').textContent=t.z.toFixed(2)+' m';$('leanAlongValue').textContent=t.along.toFixed(1)+'°';}
  $('undo').disabled=!history.length;$('remove').disabled=towers.length<=1;$('add').disabled=towers.length>=12;
  $('status').textContent=groups.map((list,i)=>'Foundation '+(i+1)+': '+list.map(t=>'T'+t.id).join(' + ')).join('\n')+(invalid?'\n'+invalid+' column(s) cannot reach this common footing. Raise them, reduce lean or split the group.':'\nAll columns meet their foundations.');$('status').className=invalid?'bad':'';
 }
 function frame(kind='overview'){
  const t=towers.find(t=>t.id===selected),g=groups.find(g=>g.some(o=>o.id===selected));let target,offset;
  if(kind==='foundation'){const f=g.length>1?foundationFor(g):null;target=new T.Vector3(f?(f.x0+f.x1)/2:0,f?f.top:terrainY(0,t.z),f?(f.z0+f.z1)/2:t.z);offset=new T.Vector3(15,10,16);}
  else if(kind==='focus'){target=new T.Vector3(0,terrainY(0,t.z)+t.height*.6,t.z);offset=new T.Vector3(22,9,19);}
  else{target=new T.Vector3(0,12,-3);offset=kind==='side'?new T.Vector3(90,8,0):new T.Vector3(74,35,62);}
  controls.enableDamping=false;controls.update();controls.target.copy(target);camera.position.copy(target).add(offset);camera.lookAt(target);controls.update();controls.enableDamping=true;
 }
 function reset(){terrain='crest';threshold=7;selected=1;serial=6;towers=[-32,-27,-22,8,36].map((z,i)=>({id:i+1,z,height:12,along:0,across:0}));}
 reset();rebuild();frame();
 $('preset').onclick=()=>change(()=>reset());$('undo').onclick=()=>{if(!history.length)return;const previous=JSON.parse(history.pop());({towers,threshold,terrain,selected,serial}=previous);rebuild();};$('terrain').onchange=e=>change(()=>terrain=e.target.value);
 for(const [id,key]of [['position','z'],['heightSlider','height'],['leanAlong','along']]){$(id).oninput=e=>{startLive();const t=towers.find(t=>t.id===selected);let value=+e.target.value;if(key==='z'){const neighbours=towers.filter(o=>o.id!==t.id);for(const other of neighbours)if(Math.abs(value-other.z)<1.7)value=other.z+(t.z<other.z?-1.7:1.7);value=clamp(value,-58,58);}t[key]=value;later();};$(id).onchange=finishLive;}
 $('height').onchange=e=>change(()=>towers.find(t=>t.id===selected).height=clamp(+e.target.value||3,3,40));$('groupDistance').oninput=e=>{startLive();threshold=+e.target.value;later();};$('groupDistance').onchange=finishLive;
 $('upright').onclick=()=>change(()=>{const t=towers.find(t=>t.id===selected);t.along=t.across=0;});$('remove').onclick=()=>{if(towers.length>1)change(()=>{towers=towers.filter(t=>t.id!==selected);selected=towers[0].id;});};
 $('add').onclick=()=>{if(towers.length>=12)return;change(()=>{const ordered=[-58,...towers.map(t=>t.z).sort((a,b)=>a-b),58];let lo=0;for(let i=1;i<ordered.length-1;i++)if(ordered[i+1]-ordered[i]>ordered[lo+1]-ordered[lo])lo=i;const z=(ordered[lo]+ordered[lo+1])/2;towers.push({id:serial++,z,height:12,along:0,across:0});selected=towers.at(-1).id;});};
 $('focus').onclick=()=>frame('focus');$('overview').onclick=()=>frame();$('sideView').onclick=()=>frame('side');$('foundationView').onclick=()=>frame('foundation');$('toggleCable').onclick=()=>{cableVisible=!cableVisible;cables.visible=cableVisible;$('toggleCable').setAttribute('aria-pressed',String(cableVisible));};
 const ray=new T.Raycaster(),pointer=new T.Vector2();let press=null,look=null;const euler=new T.Euler(0,0,0,'YXZ'),forward=new T.Vector3();
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.button===0)press={x:e.clientX,y:e.clientY};if(e.button!==2)return;e.preventDefault();e.stopImmediatePropagation();const position=camera.position.clone(),orientation=camera.quaternion.clone();controls.enableDamping=false;controls.update();controls.enableDamping=true;camera.position.copy(position);camera.quaternion.copy(orientation);controls.enabled=false;look={id:e.pointerId,x:e.clientX,y:e.clientY,distance:camera.position.distanceTo(controls.target)};euler.setFromQuaternion(camera.quaternion,'YXZ');renderer.domElement.setPointerCapture(e.pointerId);},true);
 renderer.domElement.addEventListener('pointermove',e=>{if(!look||look.id!==e.pointerId)return;euler.y-=(e.clientX-look.x)*.003;euler.x=clamp(euler.x-(e.clientY-look.y)*.003,-Math.PI/2+.01,Math.PI/2-.01);camera.quaternion.setFromEuler(euler);controls.target.copy(camera.position).addScaledVector(camera.getWorldDirection(forward),look.distance);look.x=e.clientX;look.y=e.clientY;});
 function endLook(){if(!look)return;const id=look.id;look=null;controls.enabled=true;if(renderer.domElement.hasPointerCapture(id))renderer.domElement.releasePointerCapture(id);}
 renderer.domElement.addEventListener('pointerup',e=>{if(e.button!==0||!press||Math.hypot(e.clientX-press.x,e.clientY-press.y)>5){press=null;return;}press=null;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);for(const hit of ray.intersectObject(structures,true)){let node=hit.object;while(node&&node.userData.towerId===undefined)node=node.parent;if(node){selected=node.userData.towerId;rebuild();break;}}});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,endLook);renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());addEventListener('blur',()=>{endLook();if(live!==null)finishLive();});
 addEventListener('resize',()=>{renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();});
 const error=e=>{$('error').hidden=false;$('error').textContent+=String(e.message||e.reason||e)+'\n';};addEventListener('error',error);addEventListener('unhandledrejection',error);
 function animate(){requestAnimationFrame(animate);if(controls.enabled)controls.update();renderer.render(scene,camera);}animate();
}};
