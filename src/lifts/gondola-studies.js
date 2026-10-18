// Reference-led cabin studies. Standalone geometry; no change to the live Alpine cabin.
window.LiftCoGondolaStudies={
 families:{
  arbois:{approved:true,number:'01',name:"Mont d’Arbois",subtitle:'The tall, faceted lantern',file:'gondola-mont-arbois.html',references:['gondola1.jpg','gondola1b.jpg','gondola1c.jpg'],note:'Tall green glazing, clipped corners, a shallow black roof and a tapered white lower tub. Selected: A / Lantern. Hanger towards the door side, with open ski pockets carried on the moving doors.',variants:[
   {id:'A',name:'Lantern',description:'The upright reading: tall flat panes, narrow corner facets and a restrained taper beneath the waist.',w:1.76,d:1.66,h:2.22,sill:.60,corner:.20,segments:1,bottom:.86,top:.97,belly:1,waist:.60,roof:.085}
  ]},
  jaillet:{approved:true,number:'02',revision:4,name:'Jaillet',subtitle:'Round footprint / egg-shaped shell',file:'gondola-jaillet.html',references:['jaillet-station-front.jpg','gondola2a.jpg','gondola2b.jpg','gondola2c_doorsopen.jpg','gondola2d.jpg','schematics/poma-US4149471-drawings.png'],schematic:'https://patents.google.com/patent/US4149471A/en',note:'A smaller round base, a gently fuller middle and broad curved shoulders closing over the top. The glazing and whole moving shell follow that egg-shaped profile. Selected: C / Full shoulder. The front and rear grilles are smaller and tucked closer to the shells.',variants:[
   {id:'C',name:'Full shoulder',description:'A slightly broader body, a fuller middle and a later shoulder curve. The whole upper shell curls inward over the glazing.',circular:true,crown:true,w:1.84,d:1.84,h:2.12,sill:.61,top:.34,bottom:.85,belly:.48,shoulder:.76,window:.93,roundY:.17,roundAngle:.10,opening:1.12}
  ]},
  princesse:{approved:true,number:'03',name:'Princesse',subtitle:'The broad panoramic cabin',file:'gondola-princesse.html',references:['gondola3a.jpg','gondola3b.jpg','gondola3c.jpg'],note:'A broad, sloping windscreen above a charcoal waist band and a sculpted white lower shell. Selected: A / Panorama and C / Touring. Both hangers face the door side.',variants:[
   {id:'A',name:'Panorama',description:'A broad waist, swept windscreen and tucked-in lower shell. The balanced reading of the front-view reference.',w:2.19,d:1.84,h:2.15,sill:.64,corner:.37,segments:7,bottom:.79,top:.83,belly:1.04,waist:.98,roof:.085},
   {id:'C',name:'Touring',description:'A taller, less swept glasshouse with straighter end panes and a fuller lower tub.',w:2.12,d:1.83,h:2.28,sill:.67,corner:.29,segments:6,bottom:.86,top:.89,belly:1.02,waist:1.02,roof:.08}
  ]}
 },
 createFactory(T,{ropeHeight=null,runtime=false}={}){
  const geometries=new Map();
  function cached(key,make){if(!geometries.has(key))geometries.set(key,make());return geometries.get(key);}
  function material(color,roughness=.55,metalness=0){return new T.MeshStandardMaterial({color,roughness,metalness});}
  const silver=material(0xaeb8b5,.36,.72),dark=material(0x303b3c,.48,.35),rubber=material(0x1f292a,.84),floorMaterial=material(0x58605b,.95),seatMaterial=material(0x657b73,.84),cream=material(0xe5dfca,.7);
  function mesh(parent,g,m){const o=new T.Mesh(g,m);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function box(parent,w,h,d,x,y,z,m){const o=mesh(parent,cached('box'+[w,h,d],()=>new T.BoxGeometry(w,h,d)),m);o.position.set(x,y,z);return o;}
  function bar(parent,a,b,r,m){const p=new T.Vector3(...a),q=new T.Vector3(...b),v=q.clone().sub(p),o=mesh(parent,cached('bar'+[r,v.length().toFixed(5)],()=>new T.CylinderGeometry(r,r,v.length(),8)),m);o.position.copy(p).add(q).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
  function tube(parent,points,r,m){return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal'),Math.max(12,points.length*4),r,7,false),m);}
  function text(parent,label,w,h,x,y,z,color='#243d49',rotation=0){
   const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='bold 54px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,256,66);
   const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
   const o=mesh(parent,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide}));o.position.set(x,y,z);o.rotation.y=rotation;return o;
  }
  function outline(v){
   const c=v.corner,points=[];
   // Clockwise XZ perimeter; all variants retain flat front and rear windows.
   const corners=[[1-c,1-c,0], [1-c,-1+c,-Math.PI/2], [-1+c,-1+c,-Math.PI], [-1+c,1-c,-3*Math.PI/2]];
   for(const [x,z,a] of corners)for(let k=0;k<=v.segments;k++){
    const angle=a+Math.PI/2-k*Math.PI/2/v.segments;
    points.push([x+c*Math.cos(angle),z+c*Math.sin(angle)]);
   }
   // Extra points on the door flank give a clean split at the centreline.
   const extra=[];
   for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length];extra.push(a);
    if(Math.abs(a[0]+1)<1e-5&&Math.abs(b[0]+1)<1e-5){
     const lo=Math.min(a[1],b[1]),hi=Math.max(a[1],b[1]);
     const zs=[-.53,0,.53].filter(z=>z>lo+1e-5&&z<hi-1e-5).sort((a,b)=>a-b);
     if(b[1]<a[1])zs.reverse();for(const z of zs)extra.push([-1,z]);
    }
   }
   return extra;
  }
  function makeGear(root,gear,v,flip=false){
   // Roof anchor, bent plate hanger, transverse articulation pin and detachable grip.
   const ropeY=ropeHeight??v.h+1.92;
   box(gear,v.w*(v.crown?.25:.60),.12,v.d*(v.crown?.25:.52),0,v.h+.06,0,dark);
   for(const x of [-1,1])box(gear,v.crown?.07:.13,.06,v.d*(v.crown?.23:.46),x*v.w*(v.crown?.085:.23),v.h+.145,0,silver);
   const armPoints=[[0,v.h+.16],[.35,v.h+.32],[.52,v.h+.56],[.53,ropeY-.35],[.27,ropeY-.16],[0,ropeY-.16]];
   const path=new T.CatmullRomCurve3(armPoints.map(([x,y])=>new T.Vector3(x,y,0)),false,'centripetal'),left=[],right=[];
   for(let i=0;i<=32;i++){const p=path.getPoint(i/32),t=path.getTangent(i/32),normal=new T.Vector3(-t.y,t.x,0).multiplyScalar(.065);left.push(p.clone().add(normal));right.push(p.clone().sub(normal));}
   const shape=new T.Shape();shape.moveTo(left[0].x,left[0].y);for(const p of left.slice(1))shape.lineTo(p.x,p.y);for(const p of right.reverse())shape.lineTo(p.x,p.y);shape.closePath();
   const armGeometry=new T.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:2,curveSegments:12});armGeometry.translate(0,0,-.06);mesh(gear,armGeometry,silver);
   for(const t of [.11,.34,.57,.80]){const p=path.getPoint(t);const bolt=mesh(gear,cached('bolt',()=>{const g=new T.CylinderGeometry(.031,.031,.16,6);g.rotateX(Math.PI/2);return g;}),dark);bolt.position.copy(p);}
   const gripPivot=new T.Group();gripPivot.name='cabin-grip';gripPivot.position.y=ropeY;gear.add(gripPivot);
   box(gripPivot,.26,.15,.70,0,-.045,0,dark);
   for(const x of [-.16,.16]){const jaw=box(gripPivot,.06,.13,.35,x,-.04,0,silver);jaw.name=x<0?'grip-jaw-left':'grip-jaw-right';}
   box(gripPivot,.47,.06,.22,0,.10,0,silver);
   for(const z of [-.31,.31]){
    const wheel=mesh(gripPivot,cached('grip-wheel',()=>{const g=new T.CylinderGeometry(.10,.10,.085,14);g.rotateZ(Math.PI/2);return g;}),rubber);wheel.position.set(-.20,.08,z);wheel.name=z<0?'grip-running-wheel-front':'grip-running-wheel-rear';
    const hub=mesh(wheel,cached('wheel-hub',()=>{const g=new T.CylinderGeometry(.042,.042,.095,10);g.rotateZ(Math.PI/2);return g;}),silver);
   }
   for(let k=0;k<7;k++)box(gripPivot,.18,.021,.16,0,.12+k*.025,-.06,silver);
   bar(gripPivot,[-.30,-.16,0],[.30,-.16,0],.08,silver);
   gear.rotation.y=flip?Math.PI:0;
   return bar(root,[0,ropeY,-2.3],[0,ropeY,2.3],.025,rubber);
  }
  // A dedicated shell model: the fixed spine and moving end caps have separate
  // surfaces and window apertures. Plan geometry uses circular arcs, not a squircle.
  function makeJaillet(variantIndex){
   const family=window.LiftCoGondolaStudies.families.jaillet,v=family.variants[variantIndex];
   const root=new T.Group(),body=new T.Group(),roof=new T.Group(),gear=new T.Group(),passengers=new T.Group();root.add(body,roof,gear);body.add(passengers);passengers.visible=false;
   const paint=material(0xe8e8df,.40,.08);paint.side=T.DoubleSide;
   const glass=new T.MeshPhysicalMaterial({color:0x576c62,transparent:true,opacity:.43,roughness:.19,metalness:.04,clearcoat:.55,side:T.DoubleSide,depthWrite:false});
   const alpha=1.25,beta=Math.PI/2-alpha,spine=(v.d-v.w)/2,hingeCentre=spine||.055;
   function smooth(a,b,x){const t=T.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
   function point(theta,y,offset=0){
    // One continuous egg profile drives shell, glazing, window frames and roof.
    // The base opens into the belly; a quarter-ellipse closes the upper shoulder.
    const t=T.MathUtils.clamp(y/v.h,0,1),belly=v.belly,shoulder=v.shoulder;
    let scale;
    if(t<belly){
     const u=T.MathUtils.clamp((t-.06)/(belly-.06),0,1);
     scale=v.bottom+(1-v.bottom)*Math.sin(u*Math.PI/2);
    }else if(t<shoulder){
     scale=1-.018*smooth(belly,shoulder,t);
    }else{
     const u=(t-shoulder)/(1-shoulder);
     scale=.982*Math.sqrt(Math.max(0,1-u*u*(1-v.top*v.top)));
    }
    const radius=v.w*.5*scale+offset;
    if(v.circular)return new T.Vector3(radius*Math.sin(theta),y,radius*Math.cos(theta));
    const a=Math.atan2(Math.sin(theta),Math.cos(theta)),abs=Math.abs(a);
    if(abs<=alpha){const angle=a*Math.PI/(2*alpha);return new T.Vector3(radius*Math.sin(angle),y,spine+radius*Math.cos(angle));}
    if(abs>=Math.PI-alpha){const angle=(a-Math.sign(a)*Math.PI)*Math.PI/(2*alpha);return new T.Vector3(-radius*Math.sin(angle),y,-spine-radius*Math.cos(angle));}
    const u=(abs-alpha)/(Math.PI-2*alpha);
    return new T.Vector3(Math.sign(a)*radius,y,spine*(1-2*u));
   }
   function patch(parent,left,right,bottom,top,m,offset=0){
    const rows=Math.max(4,Math.ceil((top-bottom)/(runtime?.085:.055))),cols=typeof left==='number'&&typeof right==='number'?Math.max(runtime?16:24,Math.ceil((right-left)*(runtime?12:20))):(runtime?16:24),vertices=[],indices=[];
    for(let j=0;j<=rows;j++){
     const y=T.MathUtils.lerp(bottom,top,j/rows),a=typeof left==='function'?left(y):left,b=typeof right==='function'?right(y):right;
     for(let i=0;i<=cols;i++){const p=point(T.MathUtils.lerp(a,b,i/cols),y,offset);vertices.push(p.x,p.y,p.z);}
    }
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+1,c=b+cols+1,d=a+cols+1;indices.push(a,b,d,b,c,d);}
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return mesh(parent,geometry,m);
   }
   function windowAssembly(parent,centre,extent,low,high,half,rY,rAngle){
    function width(y){let w=half;if(y<low+rY){const t=(y-low-rY)/rY;w=half-rAngle+rAngle*Math.sqrt(Math.max(0,1-t*t));}else if(y>high-rY){const t=(y-high+rY)/rY;w=half-rAngle+rAngle*Math.sqrt(Math.max(0,1-t*t));}return w;}
    patch(parent,centre-extent,centre+extent,.13,low,paint);
    patch(parent,centre-extent,y=>centre-width(y),low,high,paint);
    patch(parent,y=>centre+width(y),centre+extent,low,high,paint);
    patch(parent,centre-extent,centre+extent,high,v.h-.055,paint);
    patch(parent,y=>centre-width(y),y=>centre+width(y),low,high,glass,.006);
    const rim=[];
    for(let k=0;k<=32;k++){const y=low+(high-low)*k/32;rim.push(point(centre+width(y),y,.015).toArray());}
    for(let k=0;k<=32;k++){const y=high-(high-low)*k/32;rim.push(point(centre-width(y),y,.015).toArray());}
    rim.push(rim[0]);tube(parent,rim,.023,rubber);
   }
   // The two broad fixed white side panels, each with the little louvred window.
   for(const side of [-1,1]){
    const centre=side*Math.PI/2,low=v.h*.56,high=v.h*.84;
    windowAssembly(body,centre,beta,low,high,.20,.055,.025);
    for(let k=0;k<4;k++){
     const y=low+.08+k*(high-low-.14)/3,ps=[];
     for(let j=0;j<=8;j++)ps.push(point(centre-.16+j*.04,y,.019).toArray());
     tube(body,ps,.012,silver);
    }
    for(const boundary of [centre-beta,centre+beta]){
     const seal=[];for(let k=0;k<=28;k++)seal.push(point(boundary,.13+(v.h-.19)*k/28,.008).toArray());tube(body,seal,.026,rubber);
    }
   }
   const shells=[];
   for(const end of [1,-1]){
    // Each end rotates about its own circle centre, as in the patent plan views.
    const pivot=new T.Group();pivot.position.set(0,v.h*.5,end*hingeCentre);body.add(pivot);
    const shell=new T.Group();shell.position.set(0,-v.h*.5,-hingeCentre);pivot.add(shell);
    pivot.rotation.y=end===1?0:Math.PI;
    windowAssembly(shell,0,alpha,v.sill,v.h-.19,v.window,v.roundY,v.roundAngle);
    // Badges belong to the shell and move with its entire windscreen and skirt.
    const nameY=v.sill-.12,p=point(0,nameY,.018);
    text(shell,'LIFT CO.',v.w*.60,.15,0,nameY,p.z,'#31566a');
    const number=point(.63,v.sill+.12,.022);text(shell,'27',.10,.09,number.x,number.y,number.z,'#eaeadd');
    // Thin interior returns make the moving shell's thickness visible when open.
    for(const edge of [-alpha,alpha])patch(shell,edge-.012,edge+.012,.14,v.h-.06,rubber,-.014);
    const axis=new T.Vector3(0,1,-end*.045).normalize();
    const rest=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),end===1?0:Math.PI);
    pivot.name='cabin-shell-'+end;pivot.userData.cabinMotion={kind:'shell',end,angle:v.opening,axis:axis.toArray(),restYaw:end===1?0:Math.PI};
    shells.push({group:pivot,end,axis,rest});
   }
   // The upper shell continues over a curved shoulder into a small roof cap.
   function sectionPlate(parent,y,depth,m){
    const shape=new T.Shape();
    for(let k=0;k<=128;k++){const p=point(k/128*Math.PI*2,y);if(k)shape.lineTo(p.x,-p.z);else shape.moveTo(p.x,-p.z);}
    shape.closePath();const geometry=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:12});geometry.rotateX(-Math.PI/2);geometry.translate(0,y,0);return mesh(parent,geometry,m);
   }
   patch(roof,-Math.PI,Math.PI,v.h-.055,v.h,paint);
   const lid=sectionPlate(roof,v.h,.025,paint);
   for(const y of [.15,v.h+.018]){
    const rim=[];for(let k=0;k<=128;k++)rim.push(point(k/128*Math.PI*2,y,.012).toArray());tube(y>.5?roof:body,rim,.019,y>.5?silver:rubber);
   }
   const floor=sectionPlate(body,.085,.075,floorMaterial);
   // Visible upper and lower pivots on the stationary central frame.
   for(const end of [-1,1])for(const y of [.16,v.h-.035]){
    const bearing=mesh(y>1?roof:body,cached('shell-pivot-bearing',()=>new T.CylinderGeometry(.065,.065,.06,16)),silver);bearing.position.set(0,y,end*hingeCentre);
   }
   for(const end of [-1,1]){
    box(body,v.w*.72,.13,.37,0,.62,end*.22,seatMaterial);
    const back=box(body,v.w*.72,.43,.075,0,.91,end*.047,seatMaterial);back.rotation.x=end*.035;
    for(const side of [-1,1])bar(body,[side*v.w*.27,.18,end*.22],[side*v.w*.27,.55,end*.22],.026,silver);
    // Compact front/rear grilles sit close to the actual lower shell surface.
    const z=end*(point(0,.35).z+.10),w=v.w*.65;
    box(body,w,.045,.24,0,.15,z,paint);
    for(const side of [-1,1]){
     tube(body,[[side*w/2,.17,z-end*.11],[side*w/2,.46,z-end*.06],[side*w*.42,.52,z+end*.11],[side*w*.38,.17,z+end*.12]],.025,silver);
     const x=side*w*.34,r=point(0,.15).z,anchorZ=end*Math.sqrt(Math.max(0,r*r-x*x));
     bar(body,[x,.15,anchorZ],[x,.15,z-end*.04],.027,dark);
    }
    tube(body,[[-w*.43,.48,z+end*.11],[0,.52,z+end*.12],[w*.43,.48,z+end*.11]],.027,silver);
    bar(body,[0,.17,z+end*.12],[0,.51,z+end*.12],.025,dark);
   }
   for(const side of runtime?[]:[-1,1]){
    const person=new T.Group();person.position.set(side*v.w*.18,.66,-.22);person.rotation.y=Math.PI;passengers.add(person);
    const coat=material(side<0?0xb47955:0x657f7b,.9);
    box(person,.33,.46,.25,0,.27,0,coat);
    const head=mesh(person,cached('head',()=>new T.SphereGeometry(.125,12,9)),cream);head.position.y=.65;
    for(const leg of [-1,1]){bar(person,[leg*.09,.03,0],[leg*.09,-.05,.20],.065,dark);bar(person,[leg*.09,-.05,.20],[leg*.09,-.39,.25],.05,dark);}
   }
   const rope=makeGear(root,gear,v,true);
   const rotation=new T.Quaternion();
   function setDoor(value){
    const sweep=smooth(0,1,value);
    for(const {group,end,axis,rest} of shells){
     rotation.setFromAxisAngle(axis,end*v.opening*sweep);
     group.quaternion.copy(rotation).multiply(rest);
    }
   }
   return {root,body,roof,gear,rope,paint,glass,passengers,definition:v,family,setDoor,
    setSkis:()=>{},setColor:value=>paint.color.set(value),setGlazing:value=>{glass.opacity=value;},setCutaway:value=>{roof.visible=gear.visible=rope.visible=!value;}};
  }
  function make(familyId,variantIndex=0){
   if(familyId==='jaillet')return makeJaillet(variantIndex);
   const family=window.LiftCoGondolaStudies.families[familyId],v=family.variants[variantIndex],isEgg=familyId==='jaillet',isWide=familyId==='princesse';
   const root=new T.Group(),body=new T.Group(),roof=new T.Group(),gear=new T.Group(),passengers=new T.Group();root.add(body,roof,gear);body.add(passengers);passengers.visible=false;
   const paint=material(0xe8e8df,.35,.1);paint.side=T.DoubleSide;
   // Arbois has a solid roof: render both its outside and interior ceiling.
   const roofMaterial=familyId==='arbois'?dark.clone():dark;
   if(familyId==='arbois'){roofMaterial.side=T.DoubleSide;roofMaterial.transparent=false;roofMaterial.opacity=1;roofMaterial.depthWrite=true;}
   const glass=new T.MeshPhysicalMaterial({color:isEgg?0x60786f:isWide?0x71838a:0x6f8271,transparent:true,opacity:.34,roughness:.14,metalness:.05,clearcoat:.7,clearcoatRoughness:.18,side:T.DoubleSide,depthWrite:false});
   const points=outline(v),n=points.length;
   const levels=isEgg?[[.08,v.bottom],[.22,.92],[v.sill,1],[v.waist,v.belly],[v.h*.72,1],[v.h-.24,.93],[v.h-.07,v.top],[v.h,v.top*.93]]:
    isWide?[[.08,v.bottom],[.23,v.bottom+.06],[v.sill,.99],[v.waist,v.belly],[v.h-.20,v.top],[v.h-.06,v.top*.98],[v.h,v.top*.94]]:
    [[.08,v.bottom],[.18,v.bottom+.035],[v.sill,1],[v.h-.15,1],[v.h-.06,v.top],[v.h,v.top*.98]];
   levels.sort((a,b)=>a[0]-b[0]);
   function scaleAt(y){for(let i=1;i<levels.length;i++)if(y<=levels[i][0]){const a=levels[i-1],b=levels[i],u=T.MathUtils.clamp((y-a[0])/(b[0]-a[0]),0,1);return T.MathUtils.lerp(a[1],b[1],u);}return levels.at(-1)[1];}
   function point(i,y,extra=0){const p=points[(i+n)%n],s=scaleAt(y)+extra;return new T.Vector3(p[0]*v.w*.5*s,y,p[1]*v.d*.5*s);}
   const doorSegments=[];
   for(let i=0;i<n;i++){
    const a=points[i],b=points[(i+1)%n],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
    // Exactly these perimeter panels become the moving door: no hidden glass behind it.
    if(isEgg?Math.abs(mz)>.20:mx<-.68&&Math.abs(mz)<(isWide?.70:.66))doorSegments.push(i);
   }
   const doorSet=new Set(doorSegments);
   function surface(parent,from,to,m,include=()=>true,extra=0){
    const ys=[from,...levels.map(l=>l[0]).filter(y=>y>from&&y<to),to],vertices=[],indices=[];
    for(let j=0;j<ys.length;j++)for(let i=0;i<=n;i++){const p=point(i,ys[j],extra);vertices.push(p.x,p.y,p.z);}
    for(let j=0;j<ys.length-1;j++)for(let i=0;i<n;i++)if(include(i)){
     const a=j*(n+1)+i,b=a+1,c=b+n+1,d=a+n+1;indices.push(a,b,d,b,c,d);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
    if(familyId==='arbois'){const flat=g.toNonIndexed();flat.computeVertexNormals();g.dispose();return mesh(parent,flat,m);}
    return mesh(parent,g,m);
   }
   const fixed=i=>!doorSet.has(i),windowTop=v.h-(isEgg?.24:.17),glassBottom=isWide?v.waist+.025:v.sill+.075;
   // Opaque tub, real window openings, and an enclosed roof all use the same profile.
   surface(body,.08,v.sill,paint,fixed);
   surface(body,v.sill,isWide?glassBottom:v.sill+.075,dark,fixed,.004);
   if(isEgg){
    surface(body,v.sill+.075,v.h*.54,paint,fixed);
    surface(body,v.h*.54,v.h*.83,glass,fixed);
    surface(body,v.h*.83,windowTop,paint,fixed);
    surface(roof,windowTop,v.h-.04,paint,fixed);surface(roof,v.h-.04,v.h,paint);
   }else{surface(body,glassBottom,windowTop,glass,fixed);surface(roof,windowTop,v.h,roofMaterial);}
   function cap(parent,y,m,extra=0){const shape=new T.Shape();points.forEach((_,i)=>{const p=point(i,y,extra);if(i)shape.lineTo(p.x,-p.z);else shape.moveTo(p.x,-p.z);});shape.closePath();const g=new T.ShapeGeometry(shape);g.rotateX(-Math.PI/2);g.translate(0,y,0);return mesh(parent,g,m);}
   cap(roof,v.h,isEgg?paint:roofMaterial);cap(body,.09,floorMaterial);
   surface(body,.09,.16,rubber,()=>true,.008);
   // Raised roof rim, drip edge and gaskets.
   const rim=[];for(let i=0;i<=n;i++){const p=point(i,v.h-.025,.012);rim.push(p.toArray());}tube(roof,rim,.025,isEgg?rubber:silver);
   const glassIndices=new Set();for(let i=0;i<n;i++)if(!doorSet.has(i)){
    const previous=(i+n-1)%n;
    const a=points[previous],b=points[i],c=points[(i+1)%n];
    const cross=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);
    if(v.segments===1||Math.abs(cross)>.015||doorSet.has(previous))glassIndices.add(i);
   }
   // The rounded references have broad structural side ribs, not dozens of mullions.
   if(isEgg||isWide){glassIndices.clear();for(let i=0;i<n;i++){
    const a=points[i],b=points[(i+n-1)%n];
    if(doorSet.has(i)!==doorSet.has((i+n-1)%n)||(Math.abs(a[1])>.98&&Math.abs(a[0])>.1&&Math.abs(b[1])<.98))glassIndices.add(i);
   }}
   const shellRibs=[];
   for(const i of glassIndices){const ps=[];for(let k=0;k<=10;k++)ps.push(point(i,v.sill+(windowTop-v.sill)*k/10,.008).toArray());const rib=tube(body,ps,isEgg?.064:.026,isEgg?paint:dark);if(isEgg&&Math.abs(points[i][1])>.20)shellRibs.push({rib,sign:Math.sign(points[i][1])});}
   for(const y of [glassBottom,windowTop]){
    for(let i=0;i<n;i++)if(fixed(i)){const a=point(i,y,.007),b=point(i+1,y,.007);bar(body,a.toArray(),b.toArray(),.019,rubber);}
   }
   // Jaillet's front/rear shell sections ARE the doors: glazing, tub and brow
   // travel as complete assemblies around a fixed floor, seats and central spine.
   const doors=[],halves=isWide?[doorSegments]:[-1,1].map(side=>doorSegments.filter(i=>(points[i][1]+points[(i+1)%n][1])*side>=-1e-6));
   for(let di=0;di<halves.length;di++){
    const set=new Set(halves[di]),panel=new T.Group();body.add(panel);
    const selected=i=>set.has(i);
    surface(panel,.13,v.sill,paint,selected,.008);
    if(isEgg){
     surface(panel,v.sill,v.sill+.045,rubber,selected,.01);
     surface(panel,v.sill+.045,windowTop,glass,selected,.01);
     surface(panel,windowTop,v.h-.045,paint,selected,.01);
     for(const y of [v.sill+.045,windowTop])for(const i of set)bar(panel,point(i,y,.017).toArray(),point(i+1,y,.017).toArray(),.025,rubber);
    }else{
     surface(panel,v.sill,glassBottom,dark,selected,.012);surface(panel,glassBottom,windowTop,glass,selected,.01);
    }
    const boundaries=new Set();for(const i of set){if(!set.has((i+n-1)%n))boundaries.add(i);if(!set.has((i+1)%n))boundaries.add((i+1)%n);}
    for(const i of boundaries){const ps=[];for(let k=0;k<=12;k++)ps.push(point(i,.14+(windowTop-.14)*k/12,.02).toArray());tube(panel,ps,isEgg?.04:.022,isEgg?paint:rubber);}
    const sign=isWide?-1:di===0?-1:1;
    if(!isEgg){const handleX=-v.w*.5*scaleAt(1.07)-.035,handleZ=isWide?.25:sign*.12;bar(panel,[handleX,1.02,handleZ],[handleX,1.24,handleZ],.017,silver);}
    panel.name='cabin-door-'+di;panel.userData.cabinMotion={kind:isWide?'parallel':'split',sign};
    doors.push({group:panel,sign,egg:isEgg,wide:isWide});
   }
   for(const {rib,sign} of shellRibs)doors[sign<0?0:1].group.add(rib);
   // Cabin floor, seats and backrests remain visible through the glass and doorway.
   box(body,v.w*.78,.085,v.d*.74,0,.14,0,floorMaterial);
   const seats=isWide?3:2;
   for(const end of [-1,1]){
    box(body,v.w*.71,.13,.34,0,.61,end*v.d*(isEgg?.16:.27),seatMaterial);
    const back=box(body,v.w*.71,.43,.075,0,.87,end*v.d*(isEgg?.055:.35),seatMaterial);back.rotation.x=(isEgg?end:-end)*.09;
    for(let j=1;j<seats;j++)box(body,.014,.01,.30,-v.w*.355+v.w*.71*j/seats,.681,end*v.d*.27,rubber);
    for(const side of [-1,1])bar(body,[side*v.w*.28,.17,end*v.d*.27],[side*v.w*.28,.56,end*v.d*.27],.023,silver);
   }
   for(let i=0;i<(runtime?0:isWide?4:2);i++){
    const p=new T.Group();p.position.set((i%2?1:-1)*v.w*.20,.65,(i<2?-1:1)*v.d*.22);if(i<2)p.rotation.y=Math.PI;passengers.add(p);
    const coat=material([0xb66a44,0x5d7775,0xc4a455,0x586b87][i],.9);
    const torso=box(p,.34,.46,.24,0,.30,0,coat);torso.rotation.x=.05;
    const head=mesh(p,cached('head',()=>new T.SphereGeometry(.125,12,9)),cream);head.position.set(0,.66,0);
    const hat=mesh(p,cached('hat',()=>new T.SphereGeometry(.136,12,9,0,Math.PI*2,0,Math.PI*.55)),coat);hat.position.set(0,.71,0);
    for(const side of [-1,1]){bar(p,[side*.09,.05,0],[side*.09,-.03,.22],.07,dark);bar(p,[side*.09,-.03,.22],[side*.09,-.38,.26],.055,dark);bar(p,[side*.2,.46,0],[side*.22,.13,.12],.05,coat);}
   }
   // The Jaillet basket is part of its silhouette; the other families have ski bins.
   const rack=new T.Group(),skiGroups=[];body.add(rack);
   if(isEgg){
    const z=v.d*.56,y=.32,w=v.w*.77;
    box(rack,w,.055,.33,0,y,z+.12,paint);
    for(const side of [-1,1])tube(rack,[[side*w/2,y,z-.05],[side*w/2,y+.40,z+.08],[side*w/2,y+.40,z+.34],[side*w/2,y,z+.34]],.027,silver);
    tube(rack,[[-w/2,y+.40,z+.34],[0,y+.44,z+.38],[w/2,y+.40,z+.34]],.026,silver);
    bar(rack,[0,y,z+.34],[0,y+.42,z+.36],.024,dark);
    for(const end of [-1,1])text(doors[end<0?0:1].group,'LIFT CO.',v.w*.62,.19,0,v.sill-.13,end*(v.d*.5*scaleAt(v.sill-.13)+.028),'#2e5067',end<0?Math.PI:0);
   }else if(familyId==='arbois'){
    for(const door of doors){
     const pocket=new T.Group();door.group.add(pocket);
     const z=door.sign*.235,shellX=-v.w*.5*scaleAt(.31),x=shellX-.145,y=.29;
     // Four thin walls and a base leave an actual hollow pocket at the top.
     box(pocket,.27,.045,.36,x,.145,z,paint);
     box(pocket,.028,.27,.36,shellX-.015,y,z,paint);
     box(pocket,.028,.27,.36,shellX-.275,y,z,paint);
     for(const end of [-1,1])box(pocket,.26,.27,.025,x,y,z+end*.18,paint);
     for(const end of [-1,1])bar(pocket,[shellX-.28,.435,z+end*.18],[shellX-.01,.435,z+end*.18],.016,rubber);
     for(const xx of [shellX-.28,shellX-.01])bar(pocket,[xx,.435,z-.18],[xx,.435,z+.18],.016,rubber);
     const skis=new T.Group();skis.name='cabin-ski-placeholder-'+door.sign;skis.userData.cabinSkiPlaceholder=true;pocket.add(skis);skiGroups.push(skis);
     for(const offset of [-.065,.065]){
      const blade=box(skis,.045,1.56,.073,x,.97,z+offset,door.sign>0?dark:cream);blade.rotation.x=-.025;
      box(skis,.065,.17,.09,x-.023,.84,z+offset,rubber);
      box(skis,.06,.09,.10,x-.024,1.07,z+offset,silver);
      const tip=box(skis,.045,.16,.073,x-.025,1.80,z+offset,door.sign>0?dark:cream);tip.rotation.z=-.20;
     }
     for(const zz of [z-.13,z+.13])bar(pocket,[shellX,.90,zz],[shellX-.19,.90,zz],.018,silver);
     bar(pocket,[shellX-.19,.90,z-.13],[shellX-.19,.90,z+.13],.020,rubber);
    }
    for(const end of [-1,1])text(body,'LIFT CO.',v.w*.57,.19,0,v.sill*.49,end*(v.d*.5*scaleAt(v.sill*.49)+.025),'#29495b',end<0?Math.PI:0);
   }else{
    const x=v.w*.54,bin=new T.Group();rack.add(bin);
    box(bin,.23,.40,v.d*.60,x,.36,0,paint);
    box(bin,.22,.045,v.d*.63,x,.58,0,rubber);
    for(const z of [-v.d*.24,0,v.d*.24]){bar(bin,[v.w*.48,.49,z],[x+.13,1.07,z],.022,silver);bar(bin,[x+.13,1.07,z-.08],[x+.13,1.07,z+.08],.022,silver);}
    for(const end of [-1,1])text(body,'LIFT CO.',v.w*.57,.19,0,v.sill*.49,end*(v.d*.5*scaleAt(v.sill*.49)+.025),'#29495b',end<0?Math.PI:0);
   }
   if(familyId==='arbois'){bar(body,[0,-.12,0],[0,.10,0],.04,rubber);for(const end of [-1,1])text(body,'18',.18,.12,v.w*.24,v.sill+.22,end*(v.d*.5*scaleAt(v.sill+.22)+.014),'#e8e8db',end<0?Math.PI:0);}
   if(isWide)for(const end of [-1,1])text(body,'28',.15,.12,-v.w*.30,windowTop-.18,end*(v.d*.5*scaleAt(windowTop-.18)+.017),'#f3eee0',end<0?Math.PI:0);
   const rope=makeGear(root,gear,v,true);
   // Slider shows shape and a plausible door sweep, not a surveyed linkage.
   function setDoor(value){for(const door of doors){
    if(door.wide){door.group.position.set(-.36*value,0,-1.04*value);door.group.rotation.y=-.16*value;}
    else if(door.egg){door.group.position.set((.12+(door.sign>0?.055:0))*value,0,-door.sign*.06*value);door.group.rotation.y=door.sign*1.40*value;}
    else{door.group.position.set(-.07*value,0,door.sign*.62*value);}
   }}
   return {root,body,roof,gear,rope,paint,glass,passengers,definition:v,family,setDoor,
    setSkis:value=>skiGroups.forEach(g=>g.visible=value),setColor:value=>paint.color.set(value),setGlazing:value=>{glass.opacity=value;},setCutaway:value=>{roof.visible=gear.visible=!value;rope.visible=!value;}};
  }
  return {make};
 }
};
