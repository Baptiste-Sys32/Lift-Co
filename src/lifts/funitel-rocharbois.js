// Rocharbois-inspired shape atelier. Estimated geometry, separate from the game.
window.LiftCoFunitelStudy={
 cabins:[
  {id:'A',name:'Sotelem',w:3,d:8.5,h:3.28,corner:.20,base:.95,top:.99,brow:.35,note:'The closest reading of the drawing: long straight sides, clipped end corners, deep brow and three separate glazed modules joined by short bellows.'}

 ],
 towers:[
  {id:'A',name:'Yumbo',shaft:.66,head:.42,brace:2.7,note:'Single tubular mast, broad transverse crosshead, four twelve-sheave trains with flat centres and lowered end pairs and narrow maintenance walks.'},
  {id:'B',name:'Saddle',shaft:.80,head:.56,brace:3.5,note:'A heavier collar and longer diagonal knees support the same four rope lanes. Deeper paired rocker plates follow the drooping ends of each train.'},
  {id:'C',name:'Crossbeam',shaft:.70,head:.70,brace:2.1,note:'Compact reinforced crosshead, short knees and exposed bogie brackets. The central tube and four support trains remain.'}
 ],
 stations:[
  {id:'A',name:'Timber return',kind:'return',length:19,note:'Low timber gable, sheltered parallel docking bays and an exposed three-pulley return group. Based on the Mont-d’Arbois end.'},
  {id:'B',name:'Caboche frame',kind:'drive',length:22,note:'Open brown steel boarding frame in front of a rear machinery room, with large diagonal knees and a double-groove drive wheel.'},
  {id:'C',name:'Open gallery',kind:'drive',length:20,note:'A lighter interpretation of the Caboche frame: two narrow roof strips, a central gallery and clearly exposed receptor banks.'}
 ],
 createFactory(T){
 const cache=new Map(),materials=new Map(),ropeHeight=3.60,lane=3.5,ropeXs=[-5,-2,2,5],H=12;
 const bankHalf=3.48,flatHalf=2.03,departureSlope=.18;let terminalFactory=null;
 // The same profile drives the cable, wheel contact normals and vehicle poses.
 // Eight central wheels are level. Only the two wheels at EACH end descend.
 const crown=z=>{const u=Math.max(0,Math.min(Math.abs(z),bankHalf)-flatHalf);return-departureSlope*u*u/(2*(bankHalf-flatHalf));};
 const crownSlope=z=>-Math.sign(z)*departureSlope*Math.max(0,Math.min(Math.abs(z),bankHalf)-flatHalf)/(bankHalf-flatHalf);
 function mat(key,color,roughness=.65,metalness=.15,extra={}){if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness,metalness,...extra}));return materials.get(key);}
 const M={steel:mat('steel',0x53655d,.62,.65),dark:mat('dark',0x253c38,.62,.5),silver:mat('silver',0xc2c8be,.42,.65),rubber:mat('rubber',0x263332,.9,.05),ivory:mat('ivory',0xe8e5d8,.7,.1),wood:mat('wood',0x796049,.85,.05),woodDark:mat('wood-dark',0x4c4638,.85,.05),concrete:mat('concrete',0xb1b4a5,1,0),floor:mat('floor',0x626c62,.95,.05),yellow:mat('yellow',0xc5a04c,.6,.45),rope:mat('rope',0x48564c,.8,.6),glass:mat('glass',0x779694,.19,.13,{transparent:true,opacity:.40,side:T.DoubleSide,depthWrite:false}),red:mat('red',0xb7352c,.6,.3)};
 function geo(key,fn){if(!cache.has(key))cache.set(key,fn());return cache.get(key);}
 function mesh(parent,g,m,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=!m.transparent;o.receiveShadow=true;parent.add(o);return o;}
 function box(p,w,h,d,x,y,z,m=M.steel){return mesh(p,geo('b'+[w,h,d],()=>new T.BoxGeometry(w,h,d)),m,x,y,z);}
 function cylinder(p,r,h,x,y,z,m=M.steel,r2=r){return mesh(p,geo('c'+[r,r2,h],()=>new T.CylinderGeometry(r2,r,h,20)),m,x,y,z);}
 function beam(p,a,b,w=.08,d=w,m=M.steel){const va=new T.Vector3(...a),vb=new T.Vector3(...b),delta=vb.clone().sub(va),o=box(p,w,d,delta.length(),0,0,0,m);o.position.copy(va).add(vb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),delta.normalize());return o;}
 function tube(p,points,r=.025,m=M.rope){return mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),Math.max(2,points.length*6),r,6,false),m);}
 function wheel(p,x,y,z,r=.28,axis='x'){
  const g=new T.Group();g.position.set(x,y,z);p.add(g);
  // Same sheave construction as empty-map.html / station-guides.js: deep
  // running groove, wide alloy cheeks, raised dark hub and a through axle.
  // Scaled flanges keep the existing 0.58 m bank pitch free of wheel overlap.
  const profile=[[.30,-.36],[.83,-.36],[1.032,-.28],[1.032,-.18],[.936,-.10],[.936,.10],[1.032,.18],[1.032,.28],[.83,.36],[.30,.36],[.30,-.36]];
  mesh(g,geo('classic-sheave-tyre-'+r,()=>{const geometry=new T.LatheGeometry(profile.map(([a,b])=>new T.Vector2(a*r,b*r)),24);geometry.rotateZ(Math.PI/2);return geometry;}),M.rubber);
  const cheekG=geo('classic-sheave-face-'+r,()=>{const geometry=new T.CylinderGeometry(r*.79,r*.79,r*.055,24);geometry.rotateZ(Math.PI/2);return geometry;});
  const boltG=geo('classic-sheave-bolt-'+r,()=>{const geometry=new T.CylinderGeometry(r*.046,r*.046,r*.07,6);geometry.rotateZ(Math.PI/2);return geometry;});
  for(const side of [-1,1]){
   mesh(g,cheekG,M.silver,side*r*.34,0,0);
   // Raised radial rib, like the existing resort sheaves, instead of a painted cross.
   box(g,r*.045,r*1.25,r*.12,side*r*.385,0,0,M.dark);
   for(let i=0;i<6;i++){const a=i*Math.PI/3;mesh(g,boltG,M.dark,side*r*.395,Math.cos(a)*r*.55,Math.sin(a)*r*.55);}
  }
  const hub=cylinder(g,r*.31,r*.97,0,0,0,M.dark);hub.rotation.z=Math.PI/2;
  const axle=cylinder(g,r*.12,r*1.85,0,0,0,M.silver);axle.rotation.z=Math.PI/2;
  for(const side of [-1,1]){const cap=cylinder(g,r*.19,r*.07,side*r*.515,0,0,M.silver);cap.rotation.z=Math.PI/2;}
  if(axis==='y')g.rotation.z=-Math.PI/2;if(axis==='z')g.rotation.y=-Math.PI/2;
  return g;
 }
 // Merge static mesh regions to keep the inspection page light on draw calls.
 function batch(parent,exclude=[]){
  parent.updateWorldMatrix(true,true);const inverse=parent.matrixWorld.clone().invert(),groups=new Map(),blocked=new Set(exclude);
  function walk(o){if(blocked.has(o))return;if(o.isMesh){const k=o.material.uuid;let b=groups.get(k);if(!b)groups.set(k,b={material:o.material,meshes:[],p:[],n:[],uv:[]});b.meshes.push(o);}for(const c of o.children)walk(c);}
  for(const c of parent.children)walk(c);
  for(const b of groups.values()){
   for(const o of b.meshes){const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(inverse.clone().multiply(o.matrixWorld)),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++){b.p.push(p.getX(i),p.getY(i),p.getZ(i));b.n.push(n.getX(i),n.getY(i),n.getZ(i));b.uv.push(uv?uv.getX(i):0,uv?uv.getY(i):0);}g.dispose();}
   for(const o of b.meshes)o.parent.remove(o);
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));mesh(parent,g,b.material);
  }
 }
 function footprint(w,d,r){const points=[];for(const [sx,sz,start] of [[1,1,0],[-1,1,Math.PI/2],[-1,-1,Math.PI],[1,-1,Math.PI*1.5]])for(let i=0;i<=8;i++){const a=start+i*Math.PI/16;points.push(new T.Vector2(sx*(w/2-r)+Math.cos(a)*r,sz*(d/2-r)+Math.sin(a)*r));}return points;}
 function slab(p,w,d,r,height,y,m){const shape=new T.Shape(footprint(w,d,r)),g=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1});g.rotateX(Math.PI/2);g.translate(0,y+height/2,0);return mesh(p,g,m);}
 function surface(p,lower,upper,m,filter=()=>true){const pos=[],idx=[];for(let i=0;i<lower.length;i++){const j=(i+1)%lower.length;if(!filter(lower[i],lower[j]))continue;const n=pos.length/3;pos.push(...lower[i],...lower[j],...upper[j],...upper[i]);idx.push(n,n+2,n+1,n,n+3,n+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return mesh(p,g,m);}
 function label(p,text,w,h,x,y,z,ry=0,ink='#eee9dc',background=null){
  const key='label-'+text+'-'+ink+'-'+background;let m=materials.get(key);
  if(!m){const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');if(background){ctx.fillStyle=background;ctx.fillRect(0,0,1024,160);}ctx.fillStyle=ink;ctx.font='600 95px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,84,995);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;m=new T.MeshBasicMaterial({map:tex,transparent:true,side:T.DoubleSide,depthWrite:false});materials.set(key,m);}
  const o=mesh(p,geo('label-plane'+[w,h],()=>new T.PlaneGeometry(w,h)),m,x,y,z);o.rotation.y=ry;o.castShadow=false;return o;
 }
 function makeCabin(index,{stubs=true}={}){
  const v=window.LiftCoFunitelStudy.cabins[index],root=new T.Group(),body=new T.Group(),roof=new T.Group(),gear=new T.Group(),doors=[],sections=[],segments=[],bellows=new T.Group(),paint=mat('cabin-paint-'+index,0x355768,.5,.25);
  root.add(body,roof,gear);body.add(bellows);bellows.name='two-flexible-bellows';
  const jointGap=.28,moduleLength=(v.d-2*jointGap)/3,pitch=moduleLength+jointGap,hookOffset=moduleLength/2-.30,windowTop=v.h-v.brow;
  // Three complete, separate shells. No continuous tub, roof or side rail
  // crosses either joint; only the flexible gaiter and short walkway connect them.
  function moduleFoot(w,d,outerR,section){
   const points=[];
   for(const [sx,sz,start] of [[1,1,0],[-1,1,Math.PI/2],[-1,-1,Math.PI],[1,-1,Math.PI*1.5]]){
    const outside=section===0&&sz===-1||section===2&&sz===1,r=outside?outerR:.075;
    for(let k=0;k<=8;k++){const a=start+k*Math.PI/16;points.push(new T.Vector2(sx*(w/2-r)+Math.cos(a)*r,sz*(d/2-r)+Math.sin(a)*r));}
   }
   return points;
  }
  function moduleSlab(parent,w,d,r,height,y,material,section){
   const shape=new T.Shape(moduleFoot(w,d,r,section)),geometry=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1});geometry.rotateX(Math.PI/2);geometry.translate(0,y+height/2,0);return mesh(parent,geometry,material);
  }
  function fixedJaw(parent,x,z){
   // A split C-shaped jaw physically encloses the rope. Its axis is along Z.
   // No rollers or trolley wheels are attached to the cabin.
   const shape=new T.Shape(),outer=.076,inner=.027,slit=.20;
   shape.absarc(0,0,outer,slit,Math.PI*2-slit,false);
   shape.lineTo(Math.cos(-slit)*inner,Math.sin(-slit)*inner);
   shape.absarc(0,0,inner,Math.PI*2-slit,slit,true);shape.closePath();
   const jaw=mesh(parent,geo('fixed-rope-jaw',()=>{const g=new T.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:false,curveSegments:12});g.translate(0,0,-.07);return g;}),M.silver,x,ropeHeight,z);
   box(parent,.14,.12,.19,x,ropeHeight-.10,z,M.dark);
   box(parent,.13,.12,.13,x+.10,ropeHeight-.025,z,M.steel);
   const bolt=cylinder(parent,.026,.23,x+.07,ropeHeight-.005,z,M.silver);bolt.rotation.z=Math.PI/2;
   return jaw;
  }
  for(let section=0;section<3;section++){
   const links=[];
   const centre=(section-1)*pitch,shell=new T.Group(),lid=new T.Group(),mount=new T.Group();shell.position.z=centre;lid.position.z=centre;mount.position.z=centre;body.add(shell);roof.add(lid);gear.add(mount);sections.push(shell);segments.push({shell,lid,mount,centre,links});shell.name='cabin-section-'+(section+1);lid.name='section-roof-'+(section+1);
   const ring=(y,w=v.w,d=moduleLength,r=v.corner)=>moduleFoot(w,d,r,section).map(p=>[p.x,y,p.y]);
   const lower=ring(.17,v.w*v.base,moduleLength*.985,v.corner*.85),waist=ring(.49),upper=ring(windowTop,v.w*v.top,moduleLength*(index===1?.985:1)),cap=ring(v.h-.05,Math.min(v.w*v.top,v.w-.28),moduleLength*(index===1?.985:1));
   moduleSlab(shell,v.w*v.base,moduleLength*.985,v.corner*.85,.16,.09,M.dark,section);
   moduleSlab(shell,v.w-.13,moduleLength-.10,v.corner,.055,.20,M.floor,section);
   surface(shell,lower,waist,paint);
   surface(shell,waist,upper,M.glass,(a,b)=>{const z=(a[2]+b[2])/2;return Math.abs(z)>moduleLength/2-v.corner-.01&&(section===0&&z<0||section===2&&z>0);});
   surface(lid,upper,cap,paint);
   moduleSlab(lid,Math.min(v.w*v.top,v.w-.28)+.03,moduleLength*(index===1?.985:1)+.03,v.corner,.10,v.h-.015,paint,section);
   moduleSlab(lid,v.w-.38,moduleLength-.16,v.corner,.045,v.h+.06,M.dark,section);
   const straight=moduleLength-v.corner-.075;
   for(const side of [-1,1]){
    beam(shell,[side*v.w/2,.43,-moduleLength/2+.09],[side*v.w/2,.43,moduleLength/2-.09],.055,.09,M.silver);
    const opening=straight*.52,fixedWidth=(straight-opening)/2,height=windowTop-.49;
    // Fixed side lights remain part of the shell; only the middle pair slides.
    for(const sign of [-1,1]){
     const fixedZ=sign*(opening/2+fixedWidth/2);
     box(shell,.025,height,fixedWidth-.025,side*v.w/2,.49+height/2,fixedZ,M.glass);
     for(const z of [sign*opening/2,sign*straight/2])box(shell,.045,height+.08,.035,side*v.w/2,.47+height/2,z,M.dark);
     for(const y of [.49,windowTop])box(shell,.045,.04,fixedWidth,side*v.w/2,y,fixedZ,M.dark);
     const door=new T.Group();door.position.set(side*v.w/2,0,0);shell.add(door);doors.push({group:door,side,sign,travel:opening*.48});
     const width=opening/2-.035,z=sign*(opening/4-.008);
     box(door,.025,height,width,0,.49+height/2,z,M.glass);box(door,.055,.17,width,0,.40,z,paint);
     for(const dz of [-width/2,width/2])box(door,.045,height+.12,.035,0,.46+height/2,z+dz,M.dark);
     for(const y of [.49,windowTop])box(door,.045,.04,width,0,y,z,M.dark);
     box(door,.065,.33,.025,side*.035,1.48,sign*.055,M.silver);
    }
    for(const end of [-1,1]){
     const outside=section===0&&end===-1||section===2&&end===1,postZ=end*(moduleLength/2-(outside?v.corner:.075));
     box(shell,.075,windowTop-.39,outside?.075:.15,side*(v.w/2+.008),(.39+windowTop)/2,postZ,M.ivory);
    }
    label(lid,section===1?'LIFT CO.':'ROCHARBOIS',1.85,.20,side*(v.w*.48),v.h-v.brow/2,0,side*Math.PI/2);
    // The paired jaws share a short rocking rail, joined to the level roof
    // by a visible central pivot rather than independent floating hooks.
    for(const dz of [-hookOffset,hookOffset])fixedJaw(mount,side*1.5,dz);
    box(mount,.16,.10,2*hookOffset+.22,side*1.5,ropeHeight-.14,0,M.dark);
    const bottom=v.h+.12,top=ropeHeight-.14,strut=beam(gear,[side*1.5,bottom,centre],[side*1.5,top,centre],.085,.10,M.steel),pin=cylinder(gear,.06,.28,side*1.5,top,centre,M.silver);pin.rotation.z=Math.PI/2;links.push({x:side*1.5,strut,pin,length:top-bottom});
   }
   beam(lid,[-1.5,v.h+.12,0],[1.5,v.h+.12,0],.10,.10,paint);
   for(const x of [-.62,.62])cylinder(shell,.025,2.5,x,1.53,0,M.silver);
   // Each rigid module has its own end structure around a central gangway.
   for(const end of [-1,1]){
    const outside=section===0&&end===-1||section===2&&end===1;
    if(outside){
     for(const side of [-1,1]){
      beam(shell,[side*(v.w*v.base/2-v.corner*.6),.25,end*(moduleLength*.49-v.corner*.3)],[side*(v.w*v.top/2-v.corner*.6),windowTop,end*(moduleLength/2-v.corner*.3)],.055,.07,M.dark);
      box(lid,.20,v.brow+.07,.055,side*(v.w/2-.2),v.h-v.brow/2,end*(moduleLength/2+.016),M.ivory);
      for(let k=0;k<6;k++)box(lid,.13,.018,.012,side*(v.w/2-.2),v.h-v.brow+.05+k*.045,end*(moduleLength/2+.05),M.dark);
     }
     label(shell,'LIFT CO.',1.7,.22,0,.32,end*(moduleLength*.49+.025),end===1?0:Math.PI);
     label(lid,'ROCHARBOIS',1.9,.18,0,v.h-v.brow/2,end*(moduleLength/2+.02),end===1?0:Math.PI);
    }else{
     for(const side of [-1,1])box(shell,.11,v.h-.32,.09,side*(v.w/2-.14),(v.h+.18)/2,end*(moduleLength/2-.035),M.dark);
     box(shell,v.w-.16,.10,.09,0,.28,end*(moduleLength/2-.035),M.dark);
    }
   }
  }
  function makeBellows(z){
   const points=[],indices=[],folds=6,slices=folds*2,width=v.w-.015,height=v.h-.23,yCentre=(v.h+.17)/2;
   const outline=footprint(width,height,.13),count=outline.length;
   for(let i=0;i<=slices;i++){
    const inset=i%2?.075:0,zz=z-jointGap/2+i*jointGap/slices;
    for(const p of outline)points.push(p.x-Math.sign(p.x)*inset,yCentre+p.y-Math.sign(p.y)*inset,zz);
   }
   for(let i=0;i<slices;i++)for(let k=0;k<count;k++){const next=(k+1)%count,a=i*count+k,b=i*count+next,c=(i+1)*count+next,d=(i+1)*count+k;indices.push(a,b,c,a,c,d);}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setIndex(indices);g.computeVertexNormals();mesh(bellows,g,M.rubber);
   // Discrete end hoops and a short threshold show where each body ends.
   for(const end of [-1,1]){
    const zz=z+end*(jointGap/2-.015);
    for(const side of [-1,1])box(bellows,.065,v.h-.24,.035,side*(v.w/2-.045),yCentre,zz,M.dark);
    for(const yy of [.22,v.h-.06])box(bellows,v.w-.06,.065,.035,0,yy,zz,M.dark);
   }
   box(bellows,1.5,.055,jointGap+.06,0,.20,z,M.floor);
  }
  makeBellows(-pitch/2);makeBellows(pitch/2);
  if(stubs)for(const side of [-1,1])beam(gear,[side*1.5,ropeHeight,-v.d/2-.65],[side*1.5,ropeHeight,v.d/2+.65],.032,.032,M.rope);
  for(const segment of segments){batch(segment.lid);batch(segment.mount);}for(const d of doors)batch(d.group);for(const shell of sections)batch(shell,doors.map(d=>d.group));batch(bellows);
  const flexible=[];
  bellows.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position,n=o.geometry.attributes.normal;p.setUsage(T.DynamicDrawUsage);n.setUsage(T.DynamicDrawUsage);flexible.push({mesh:o,positions:p.array.slice(),normals:n.array.slice()});o.frustumCulled=false;}});
  const qa=new T.Vector3(),qb=new T.Vector3(),na=new T.Vector3(),nb=new T.Vector3();
  return{root,roof,gear,paint,doors,sections,segments,bellows,v,
   loadSections:segments.map(segment=>({offset:segment.centre,halfLength:hookOffset})),
   setLoadedPose({z,sections:poses}){
    const pinHeight=ropeHeight-.14,floors=poses.map(pose=>pose.y-pinHeight-.14*Math.cos(pose.gripPitch));
    root.rotation.x=0;root.position.z=z;root.position.y=floors[1];
    for(let i=0;i<segments.length;i++){
     const segment=segments[i],pose=poses[i],bodyAngle=pose.sway,angle=pose.gripPitch,pivot=v.h+.12,bodyZ=pose.z-.14*Math.sin(angle);
     // Independent level bodies; only arrival sway rocks them around the roof.
     for(const node of [segment.shell,segment.lid]){node.rotation.x=bodyAngle;node.position.set(0,floors[i]-root.position.y+pivot*(1-Math.cos(bodyAngle)),bodyZ-root.position.z-pivot*Math.sin(bodyAngle));}
     segment.mount.rotation.x=angle;segment.mount.position.set(0,floors[i]-root.position.y+pinHeight*(1-Math.cos(angle)),bodyZ-root.position.z-pinHeight*Math.sin(angle));
     for(const link of segment.links){
      qa.set(link.x,floors[i]-root.position.y+pivot,bodyZ-root.position.z);qb.set(link.x,floors[i]-root.position.y+pinHeight,bodyZ-root.position.z);
      link.pin.position.copy(qb);link.strut.position.copy(qa).add(qb).multiplyScalar(.5);link.strut.scale.set(1,1,1);
     }
    }
    for(const part of flexible){
     const p=part.mesh.geometry.attributes.position,n=part.mesh.geometry.attributes.normal;
     for(let i=0;i<p.count;i++){
      const at=i*3,x=part.positions[at],y=part.positions[at+1],z=part.positions[at+2],left=z<0?0:1,A=segments[left],B=segments[left+1],start=(A.centre+B.centre-jointGap)/2,t=T.MathUtils.clamp((z-start)/jointGap,0,1);
      qa.set(x,y,z-A.centre).applyQuaternion(A.shell.quaternion).add(A.shell.position);qb.set(x,y,z-B.centre).applyQuaternion(B.shell.quaternion).add(B.shell.position);qa.lerp(qb,t);p.setXYZ(i,qa.x,qa.y,qa.z);
      na.fromArray(part.normals,at).applyQuaternion(A.shell.quaternion);nb.fromArray(part.normals,at).applyQuaternion(B.shell.quaternion);na.lerp(nb,t).normalize();n.setXYZ(i,na.x,na.y,na.z);
     }
     p.needsUpdate=true;n.needsUpdate=true;
    }
   },
   setOpen(t){for(const d of doors){d.group.position.x=d.side*(v.w/2+(.045+(d.sign>0?.08:0))*t);d.group.position.z=d.sign*d.travel*t;}},
   setCutaway(on){roof.visible=!on;gear.visible=!on;}
  };
 }

 function sheaveBank(parent,x,y,z=0,count=12,style=0,rotors=[]){
  const g=new T.Group();g.position.set(x,y,z);parent.add(g);const pitch=.58,start=-(count-1)*pitch/2;
  for(let bogie=0;bogie<3;bogie++){
   const c=start+(bogie*4+1.5)*pitch;
   for(const side of [-1,1])beam(g,[side*.17,crown(c-1.02)-.42,c-1.02],[side*.17,crown(c+1.02)-.42,c+1.02],.055,style===1?.26:.18,M.steel);
   cylinder(g,.075,.52,0,crown(c)-.43,c,M.silver).rotation.z=Math.PI/2;
   for(let k=0;k<4;k++){
    const zz=start+(bogie*4+k)*pitch,m=crownSlope(zz),normal=1/Math.hypot(1,m),wy=crown(zz)-.28*normal,wz=zz+.28*m*normal;
    const roller=wheel(g,0,wy,wz,.28);rotors.push({root:roller,lane:x<0?0:1,direction:x<0?1:-1,contactZ:z+zz,contactY:y+crown(zz),radius:.28,angle:0,speed:0});beam(g,[0,crown(zz)-.47,zz],[0,wy,wz],.07,.09,M.dark);
   }
  }
  // Curved backing girders follow the rocker bank rather than a flat rectangle.
  for(const side of [-1,1])for(let i=0;i<12;i++){
   const a=-bankHalf+2*bankHalf*i/12,b=-bankHalf+2*bankHalf*(i+1)/12;beam(g,[side*.25,crown(a)-.64,a],[side*.25,crown(b)-.64,b],.07,.18,M.steel);
  }
  const offset=Math.sign(x)*(Math.abs(x)<3?-.32:.32);
  for(const zz of [-1.74,1.74]){const yy=crown(zz);beam(g,[offset,yy-.62,zz],[offset,yy-1.12,zz],.16,.16,M.steel);beam(g,[offset,yy-.62,zz],[0,yy-.62,zz],.12,.12,M.steel);}
  return g;
 }
 // Hermite spans join the sagging free rope to the supported crown tangentially.
 // Grade transitions occur on the wheel banks, not on invisible approach rails.
 function createRoute({height=8,stationLength=19,stationZ=85,stop=83}={}){
  // A tiny wrap around the FIRST wheel leads into an otherwise flat receptor.
  // All six station wheel centres are level; there is no sloped extension.
  const radius=.28,rightEnd=stationZ-stationLength/2-2,rightStart=rightEnd-radius*departureSlope/Math.hypot(1,departureSlope),bank=[];
  const receptorY=z=>height-radius+Math.sqrt(Math.max(0,radius*radius-(z-rightEnd)**2));
  const receptorSlope=z=>(rightEnd-z)/Math.sqrt(Math.max(1e-8,radius*radius-(z-rightEnd)**2));
  bank.push({start:-rightEnd,end:-rightStart,y:z=>receptorY(-z),slope:z=>-receptorSlope(-z)});
  for(const centre of [-40,0,40])bank.push({start:centre-bankHalf,end:centre+bankHalf,y:z=>height+crown(z-centre),slope:z=>crownSlope(z-centre)});
  bank.push({start:rightStart,end:rightEnd,y:receptorY,slope:receptorSlope});
  function atZ(z){
   if(z<=bank[0].start||z>=bank[bank.length-1].end)return{z,y:height,slope:0};
   for(let i=0;i<bank.length;i++){
    const a=bank[i];if(z<=a.end&&z>=a.start)return{z,y:a.y(z),slope:a.slope(z)};
    const b=bank[i+1];if(b&&z>a.end&&z<b.start){
     const L=b.start-a.end,t=(z-a.end)/L,y0=a.y(a.end),y1=b.y(b.start),m0=a.slope(a.end),m1=b.slope(b.start),t2=t*t,t3=t2*t;
     const y=(2*t3-3*t2+1)*y0+(t3-2*t2+t)*L*m0+(-2*t3+3*t2)*y1+(t3-t2)*L*m1;
     const slope=((6*t2-6*t)*y0+(3*t2-4*t+1)*L*m0+(-6*t2+6*t)*y1+(3*t2-2*t)*L*m1)/L;return{z,y,slope};
    }
   }
   return{z,y:height,slope:0};
  }
  // Arc-length lookup keeps the shuttle's cruise speed constant on the curve.
  const samples=[],steps=1600;let length=0,previous=null;
  for(let i=0;i<=steps;i++){const p=atZ(-stop+2*stop*i/steps);if(previous)length+=Math.hypot(p.z-previous.z,p.y-previous.y);samples.push({...p,s:length});previous=p;}
  function atDistance(s){
   if(s<0)return{z:-stop+s,y:height,slope:0};if(s>length)return{z:stop+s-length,y:height,slope:0};
   let lo=0,hi=samples.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(samples[mid].s<s)lo=mid;else hi=mid;}
   const a=samples[lo],b=samples[hi],t=(s-a.s)/(b.s-a.s||1);return atZ(a.z+(b.z-a.z)*t);
  }
  return{atZ,atDistance,length,bank,receptorY,rightStart,rightEnd};
 }
 function ropeCurve(parent,x,sample,first,last,steps=220){
  // LinearCurve avoids an extra global spline that would round supported joins.
  class ProfileCurve extends T.Curve{getPoint(t,out=new T.Vector3()){const p=sample(first+(last-first)*t);return out.set(x,p.y,p.z);}}
  return mesh(parent,new T.TubeGeometry(new ProfileCurve(),steps,.018,6,false),M.rope);
 }
 function dynamicRope(parent,x,first=-92,last=92,steps=720){
  const rings=6,stride=rings+1,positions=new Float32Array((steps+1)*stride*3),normals=new Float32Array(positions.length),indices=[];
  for(let i=0;i<steps;i++)for(let k=0;k<rings;k++){const a=i*stride+k,b=a+stride;indices.push(a,b,a+1,a+1,b,b+1);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));g.setAttribute('normal',new T.BufferAttribute(normals,3).setUsage(T.DynamicDrawUsage));g.setIndex(indices);
  const o=mesh(parent,g,M.rope);o.frustumCulled=false;
  return{mesh:o,update(sample,knots=[]){
   const samples=Float64Array.from({length:steps+1},(_,i)=>first+(last-first)*i/steps);
   // Put a ring exactly through every fixed jaw, rather than approximating the
   // loaded contact line with a chord whose endpoints miss the attachment.
   for(const z of knots){const i=Math.round((z-first)/(last-first)*steps);if(i>0&&i<steps)samples[i]=z;}
   for(let i=0;i<=steps;i++){
    const p=sample(samples[i]),n=1/Math.hypot(1,p.slope);
    for(let k=0;k<=rings;k++){
     const angle=2*Math.PI*k/rings,c=Math.cos(angle),s=Math.sin(angle),at=(i*stride+k)*3;
     normals[at]=c;normals[at+1]=s*n;normals[at+2]=-s*p.slope*n;
     positions[at]=x+.018*c;positions[at+1]=p.y+.018*normals[at+1];positions[at+2]=p.z+.018*normals[at+2];
    }
   }
   g.attributes.position.needsUpdate=true;g.attributes.normal.needsUpdate=true;
  }};
 }
 function rail(parent,x,y,z1,z2){for(const z of [z1,z2,(z1+z2)/2])box(parent,.045,1,.045,x,y+.5,z,M.silver);for(const yy of [.48,1])beam(parent,[x,y+yy,z1],[x,y+yy,z2],.035,.035,M.silver);}
 function makeTower(index,{height=H,stubs=true}={}){
  const v=window.LiftCoFunitelStudy.towers[index],root=new T.Group(),frame=new T.Group(),head=new T.Group(),rotors=[];root.add(frame,head);
  box(frame,3,.65,3,0,.325,0,M.concrete);cylinder(frame,v.shaft+.22,.25,0,.78,0);cylinder(frame,v.shaft,height-2.15,0,(height-2.15)/2+.9,0,M.steel,v.shaft*.92);
  for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])box(frame,.15,.4,.15,Math.cos(a)*(v.shaft+.10),.91,Math.sin(a)*(v.shaft+.10),M.silver);
  cylinder(frame,v.shaft+.10,.15,0,height-v.brace,0,M.silver);
  // Upper transverse structure stays above the cabin envelope; banks hang outboard.
  for(const z of [-1.35,1.35]){
   beam(head,[-5.65,height+.55,z],[5.65,height+.55,z],.25,v.head,M.steel);
   for(const side of [-1,1])beam(head,[side*.5,height-v.brace,z*.32],[side*1.65,height+.32,z],.18,.22,M.steel);
  }
  box(head,3.1,.09,3.1,0,height+.55,0,M.floor);rail(head,-1.5,height+.60,-1.4,1.4);rail(head,1.5,height+.60,-1.4,1.4);
  for(const x of ropeXs){
   sheaveBank(head,x,height,0,12,index,rotors);
   for(const z of [-1.35,1.35]){const inner=x+Math.sign(x)*(Math.abs(x)<3?-.32:.32);beam(head,[inner,height+.48,z],[inner,height-1.13,z],.12,.15);beam(head,[inner,height-1.13,z],[x,height-1.13,z],.12,.15);}
   const walk=x+Math.sign(x)*(Math.abs(x)<3?-.47:.47);box(head,.55,.065,7.4,walk,height-.8,0,M.floor);rail(head,walk+Math.sign(x)*(Math.abs(x)<3?-.25:.25),height-.76,-3.5,3.5);
   if(stubs)ropeCurve(root,x,z=>({z,y:height+(Math.abs(z)<=bankHalf?crown(z):crown(bankHalf)-departureSlope*(Math.abs(z)-bankHalf))}),-7,7,112);
  }
  // Ladder on the valley-facing side of the round shaft.
  for(const x of [-.20,.20])beam(frame,[x,.7,v.shaft+.10],[x,height+.55,v.shaft+.10],.035,.035,M.silver);
  for(let y=1;y<height+.4;y+=.34)beam(frame,[-.2,y,v.shaft+.13],[.2,y,v.shaft+.13],.032,.032,M.silver);
  batch(frame);batch(head,rotors.map(r=>r.root));
  // Shared wheel meshes keep the 48 independently turning sheaves to three
  // instanced draws per tower, rather than separate mesh calls for every wheel.
  batch(rotors[0].root);root.updateWorldMatrix(true,true);
  const inverse=root.matrixWorld.clone().invert(),bases=rotors.map(r=>new T.Matrix4().multiplyMatrices(inverse,r.root.matrixWorld)),parts=rotors[0].root.children.filter(p=>p.isMesh),instances=parts.map(part=>{
   const mesh=new T.InstancedMesh(part.geometry,part.material,rotors.length);mesh.castShadow=part.castShadow;mesh.receiveShadow=part.receiveShadow;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(mesh);return mesh;
  }),rotation=new T.Matrix4(),matrix=new T.Matrix4();
  for(const roller of rotors)roller.root.visible=false;
  function writeWheels(){for(let i=0;i<rotors.length;i++){rotation.makeRotationX(rotors[i].angle);matrix.multiplyMatrices(bases[i],rotation);for(const mesh of instances)mesh.setMatrixAt(i,matrix);}for(const mesh of instances)mesh.instanceMatrix.needsUpdate=true;}
  writeWheels();
  return{root,head,v,updateWheels(dt,ropeSpeed,profiles=null,carrierZ=null){
   if(dt<=0)return;
   for(const roller of rotors){
    const z=root.position.z+roller.contactZ,profile=profiles?.[roller.lane],car=carrierZ?.[roller.lane];
    const gap=profile?Math.max(0,profile(z).y-root.position.y-roller.contactY):1;
    const contact=1-T.MathUtils.smoothstep(gap,.012,.10),load=car===undefined?0:1-T.MathUtils.smoothstep(Math.abs(car-z),4.2,13);
    const fraction=.055+.945*contact*load,target=roller.direction*ropeSpeed/roller.radius*fraction;
    roller.speed=T.MathUtils.damp(roller.speed,target,Math.abs(target)>Math.abs(roller.speed)?8:3,dt);roller.angle+=roller.speed*dt;
   }
   writeWheels();
  }};
 }
 function makeStation(index,{deck=0,stubs=true,role=null}={}){
  const v=window.LiftCoFunitelStudy.stations[index],kind=role||v.kind,root=new T.Group(),frame=new T.Group(),building=new T.Group(),roof=new T.Group(),machinery=new T.Group(),rollers=[];root.add(frame,building,roof,machinery);
  const L=v.length,front=-L/2,back=L/2,H=deck+ropeHeight,roofY=H+1.45;
  // Recessed channels leave the cabin floors level with the central platform.
  box(frame,3.75,.52,L,0,deck-.26,0,M.concrete);
  for(const side of [-1,1]){
   box(frame,1.6,.52,L,side*6.1,deck-.26,0,M.concrete);
   box(frame,.10,.08,L-.25,side*1.84,deck+.015,0,M.yellow);
   box(frame,.10,.08,L-.25,side*5.30,deck+.015,0,M.yellow);
   rail(frame,side*6.78,deck,front+.15,back-.25);
  }
  box(frame,13.8,.52,2.4,0,deck-.26,back+1.0,M.concrete);
  for(const side of [-1,1]){
   for(const z of [front+.7,back-3]){
    const x=side*6.4;box(frame,.25,roofY-deck,.25,x,(roofY+deck)/2,z,index===0?M.wood:M.woodDark);
    beam(frame,[x,roofY-2,z],[x-side*1.1,roofY,z],.17,.17,index===0?M.wood:M.woodDark);
    beam(frame,[x,roofY-2,z],[x,roofY,z+1.5],.17,.17,index===0?M.wood:M.woodDark);
   }
   beam(frame,[side*6.4,roofY,front],[side*6.4,roofY,back],.24,.29,M.woodDark);
   for(const x of [side*2,side*5]){
    const receptor=new T.Group();receptor.position.z=front+.9;frame.add(receptor);
    for(let k=0;k<6;k++)rollers.push({root:wheel(receptor,x,H-.28,-2.9+k*.58,.28),radius:.28,direction:-Math.sign(x)});
    beam(receptor,[x,H-.65,-3.25],[x,H-.65,.35],.15,.25);
    beam(frame,[side*6.4,roofY,front+.7],[x,H-.65,front+.7],.14,.14,M.woodDark);
    if(stubs)ropeCurve(root,x,z=>{
     const end=front-2,r=.28,start=end-r*departureSlope/Math.hypot(1,departureSlope),contact=H-r+Math.sqrt(r*r-(start-end)**2),y=z<start?contact+departureSlope*(z-start):z>end?H:H-r+Math.sqrt(Math.max(0,r*r-(z-end)**2));return{z,y};
    },front-7,2.35,112);
   }
  }
  for(const z of [front+.7,0,back-3])beam(frame,[-6.4,roofY,z],[6.4,roofY,z],.22,.27,M.woodDark);
  if(!terminalFactory)terminalFactory=window.LiftCoFunitelTerminals.createFactory(T,{M,geo,mesh,box,beam,cylinder,batch,wheel});
  const mechanism=terminalFactory.make({parent:machinery,kind,H,back});
  if(index===0){
   const shape=new T.Shape();shape.moveTo(-7.1,roofY);shape.lineTo(0,roofY+2);shape.lineTo(7.1,roofY);shape.lineTo(7.1,roofY-.14);shape.lineTo(0,roofY+1.83);shape.lineTo(-7.1,roofY-.14);shape.closePath();
   mesh(roof,new T.ExtrudeGeometry(shape,{depth:L+1,bevelEnabled:false}),M.woodDark,0,0,front-.5);
   for(const side of [-1,1])for(let z=front;z<=back;z+=1.3)beam(roof,[0,roofY+1.8,z],[side*7.05,roofY-.05,z],.12,.17,M.wood);
   for(let x=-6.4;x<=6.4;x+=.32)box(building,.27,3.25,.10,x,deck+1.62,back+.12,M.wood);
   box(building,13.1,.6,.15,0,deck+3.5,back+.12,M.woodDark);
  }else{
   // The open front retains the steel porch silhouette in the photographs.
   box(roof,13.8,.20,6,0,roofY+.08,back-1.7,M.woodDark);
   for(const side of [-1,1]){
    if(index===2)box(roof,2.1,.14,L-5,side*5.9,roofY+.1,front+(L-5)/2,M.woodDark);
    box(building,.16,3.6,5,side*6.4,deck+1.8,back-1.5,M.wood);
    beam(frame,[side*6.4,deck+.2,front+3],[side*6.4,roofY,front-.3],.25,.25,M.woodDark);
   }
   box(building,12.9,3.6,.15,0,deck+1.8,back+1,M.wood);
   for(let x=-5.6;x<6;x+=2.8)box(building,2.2,.95,.035,x,deck+2.6,back+1.10,M.glass);
  }
  label(frame,'LIFT CO.  /  ROCHARBOIS',5.5,.29,0,roofY+.05,front-.08,Math.PI);
  box(frame,.4,1,.35,0,deck+.5,front+2,M.steel);box(frame,.65,.08,.45,0,deck+1,front+2,M.yellow);
  batch(frame,rollers.map(r=>r.root));for(const roller of rollers)batch(roller.root);batch(building);batch(roof);
  return{root,roof,building,machinery,pulleys:mechanism.pulleys,v,deck,ropeY:H,front,back,
   setDrive(distance){mechanism.setDrive(distance);for(const roller of rollers)roller.root.rotation.x=roller.direction*distance/roller.radius;},
   setMarkers(show){mechanism.setMarkers(show);},
   setCutaway(on){roof.visible=!on;building.visible=!on;}
  };
 }
 return{makeCabin,makeTower,makeStation,createRoute,ropeCurve,dynamicRope,beam,box,rail,batch,M,ropeHeight,ropeXs,lane,H};
 }
};
