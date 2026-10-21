import * as T from 'three';
import { mergeGeometries } from '../../assets/vendor/three/BufferGeometryUtils.js';

// Original procedural assets. Metres, Y up, +Z forward, tyre contact at Y=0.
// The referenced Sketchfab thumbnails informed vehicle categories only.
export const vehicles = [
 {id:'shuttle',category:'Buses',name:'Village shuttle',note:'A short low-floor bus for narrow village streets.',length:8.2,width:2.45,seats:24,color:'#c76043',kind:'bus'},
 {id:'regional',category:'Buses',name:'Valley regional bus',note:'A full-size two-door bus for links between mountain villages.',length:11.8,width:2.5,seats:40,color:'#447d7a',kind:'bus'},
 {id:'coach',category:'Buses',name:'Alpine coach',note:'Raised passenger deck, luggage bays and a third axle.',length:12.6,width:2.5,seats:48,color:'#ccad68',kind:'bus'},
 {id:'hatch',category:'Cars',name:'Compact hatchback',note:'Short overhangs, upright hatch and a contrasting roof.',length:3.65,width:1.68,color:'#a94c42',kind:'car',roof:1.48},
 {id:'estate',category:'Cars',name:'Touring estate',note:'A long roof, rear quarter windows and roof rails.',length:4.65,width:1.83,color:'#527d79',kind:'car',roof:1.52},
 {id:'sedan',category:'Cars',name:'Village saloon',note:'A separate boot and sloping rear window.',length:4.6,width:1.82,color:'#c5bba4',kind:'car',roof:1.44},
 {id:'suv',category:'Cars',name:'Mountain SUV',note:'Raised body, larger tyres and a roof-mounted ski box.',length:4.45,width:1.88,color:'#6b775d',kind:'car',roof:1.75},
 {id:'coupe',category:'Cars',name:'Sport coupe',note:'A low two-door body with a fastback roof.',length:4.3,width:1.86,color:'#d39b45',kind:'car',roof:1.24},
 {id:'pickup',category:'Cars',name:'Resort pickup',note:'A double cab, open load bed and work lights.',length:5.15,width:1.94,color:'#af5944',kind:'car',roof:1.8},
 {id:'groomer',category:'Winter service',name:'Piste groomer',note:'Wide tracks, front blade, rear tiller and a pivoting work attachment.',length:5.3,width:3.3,color:'#b94938',kind:'tracked'},
 {id:'plough',category:'Winter service',name:'Road snowplough',note:'A three-axle road truck with a supported front blade and salt hopper.',length:7.4,width:2.55,color:'#d68c37',kind:'truck'},
 {id:'crawler',category:'Winter service',name:'Compact snow carrier',note:'A small tracked utility vehicle with a cab and rear load deck.',length:3.5,width:1.9,color:'#ca633e',kind:'tracked'}
];

export function createVehicle(id, options={}) {
 const spec=vehicles.find(v=>v.id===id);if(!spec)throw Error('Unknown vehicle: '+id);
 const root=new T.Group();root.name=spec.name;root.userData={vehicleId:id,units:'metres',forward:'+Z'};
 const fixed=new T.Group();fixed.name='Body';root.add(fixed);
 const paint=new T.MeshStandardMaterial({color:options.color||spec.color,roughness:.55,metalness:.12});
 const M={paint,dark:new T.MeshStandardMaterial({color:0x263237,roughness:.73}),rubber:new T.MeshStandardMaterial({color:0x252a2c,roughness:.94}),glass:new T.MeshStandardMaterial({color:0x506971,roughness:.23,metalness:.36}),silver:new T.MeshStandardMaterial({color:0xa9b3ae,roughness:.45,metalness:.65}),ivory:new T.MeshStandardMaterial({color:0xe6e3d5,roughness:.7}),snow:new T.MeshStandardMaterial({color:0xf4f2e9,roughness:.95}),lamp:new T.MeshStandardMaterial({color:0xffedb6,emissive:0xffd68b,emissiveIntensity:.6}),red:new T.MeshStandardMaterial({color:0xa72f29,emissive:0x6c1511,emissiveIntensity:.35}),amber:new T.MeshStandardMaterial({color:0xf8b745,emissive:0xe48c20,emissiveIntensity:.4})};
 const wheels=[],tracks=[],doors=[],attachments=[],snow=new T.Group();snow.name='Optional snow';root.add(snow);
 const geometryCache=new Map(),ownedGeometries=new Set();
 function mesh(parent,g,m,x=0,y=0,z=0){ownedGeometries.add(g);const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 const cube=new T.BoxGeometry();
 function box(p,w,h,d,x,y,z,m=M.paint){const o=mesh(p,cube,m,x,y,z);o.scale.set(w,h,d);return o;}
 function cylinder(p,r,l,x,y,z,m=M.dark,axis='y',n=12){const key=[r,l,n].join(':'),g=geometryCache.get(key)||new T.CylinderGeometry(r,r,l,n);geometryCache.set(key,g);const o=mesh(p,g,m,x,y,z);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o;}
 function beam(p,a,b,r=.025,m=M.dark){const A=new T.Vector3(...a),B=new T.Vector3(...b),o=cylinder(p,r,A.distanceTo(B),0,0,0,m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),B.sub(A).normalize());return o;}
 function profile(p,points,width,m=M.paint,holes=[]){const s=new T.Shape();points.forEach(([z,y],i)=>i?s.lineTo(z,y):s.moveTo(z,y));s.closePath();for(const points of holes){const path=new T.Path();points.forEach(([z,y],i)=>i?path.lineTo(z,y):path.moveTo(z,y));path.closePath();s.holes.push(path);}const g=new T.ExtrudeGeometry(s,{depth:width,bevelEnabled:false});g.translate(0,0,-width/2);g.rotateY(-Math.PI/2);return mesh(p,g,m);}
 function panel(p,points,m=M.glass){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();const o=mesh(p,g,m);o.material.side=T.DoubleSide;return o;}
 function sign(p,text,w,h,x,y,z,turn=0){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const c=canvas.getContext('2d');c.fillStyle='#233236';c.fillRect(0,0,512,96);c.fillStyle='#f0d49b';c.font='bold 45px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,51,485);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const o=mesh(p,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}),x,y,z);o.rotation.y=turn;return o;}
 function wheel(x,z,r=.34,width=.2,steer=false){const pivot=new T.Group();pivot.name=steer?'Steering knuckle':'Axle end';pivot.position.set(x,r,z);root.add(pivot);const spin=new T.Group();spin.name='Wheel rotor';pivot.add(spin);cylinder(spin,r,width,0,0,0,M.rubber,'x',16);const side=Math.sign(x);cylinder(spin,r*.67,width+.014,0,0,0,M.silver,'x');cylinder(spin,r*.25,width+.027,0,0,0,M.dark,'x');for(let i=0;i<6;i++){const a=i/6*Math.PI*2;cylinder(spin,.025,.025,side*(width/2+.025),Math.sin(a)*r*.45,Math.cos(a)*r*.45,M.dark,'x',6);}wheels.push({pivot,spin,radius:r,steer});return pivot;}
 function mirrors(w,y,z){const reach=spec.kind==='car'?.53:1;for(const s of [-1,1]){beam(fixed,[s*w/2,y-.12*reach,z-.05],[s*(w/2+.24*reach),y,z+.04]);box(fixed,.12*reach,.29*reach,.19*reach,s*(w/2+.27*reach),y-.05*reach,z,M.dark);box(fixed,.015,.23*reach,.14*reach,s*(w/2+.338*reach),y-.05*reach,z,M.silver);}}
 function lights(w,l,y){for(const s of [-1,1]){box(fixed,.28,.13,.035,s*w*.32,y,l/2+.016,M.lamp);box(fixed,.22,.13,.035,s*w*.34,y,-l/2-.016,M.red);}box(fixed,.4,.1,.025,0,y-.16,l/2+.03,M.ivory);box(fixed,.4,.1,.025,0,y-.16,-l/2-.03,M.ivory);}
 function wipers(w,y,z){for(const s of [-1,1])beam(fixed,[s*w*.20,y,z+.035],[s*w*.30,y+.39,z+.035],.014,M.dark);}
 function beacon(p,x,y,z){cylinder(p,.115,.07,x,y,z,M.dark);cylinder(p,.09,.14,x,y+.10,z,M.amber);}
 function slopedGlass(width,z0,y0,z1,y1,withWipers=false){const at=t=>[T.MathUtils.lerp(z0,z1,t),T.MathUtils.lerp(y0,y1,t)+.022],a=at(.075),b=at(.92);panel(fixed,[[-width/2,a[1],a[0]],[width/2,a[1],a[0]],[width/2,b[1],b[0]],[-width/2,b[1],b[0]]]);if(withWipers){const base=at(.14),tip=at(.51);for(const side of [-1,1])beam(fixed,[side*width*.22,base[1]+.016,base[0]],[side*width*.30,tip[1]+.016,tip[0]],.012,M.dark);}}
 function snowCap(w,d,x,y,z){box(snow,w,.035,d,x,y,z,M.snow);}
 function mergeStatic(parent){parent.updateWorldMatrix(true,true);const groups=new Map(),inverse=parent.matrixWorld.clone().invert();parent.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const a=groups.get(o.material)||[];a.push(o);groups.set(o.material,a);});for(const [material,nodes]of groups){const geometries=nodes.map(o=>{let g=o.geometry.clone();if(g.index){const indexed=g;g=g.toNonIndexed();indexed.dispose();}if(!material.map)g.deleteAttribute('uv');g.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));return g;});const g=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!g)throw Error('Could not batch vehicle geometry');for(const o of nodes)o.removeFromParent();mesh(parent,g,material);}}
 function car(){const l=spec.length,w=spec.width,r=id==='suv'||id==='pickup'?.4:id==='coupe'?.31:.34,axle=l*.32,top=id==='pickup'||id==='suv'?1.11:.94;
  const outline=[[-l/2,.43]];for(const z of [-axle,axle]){const ar=r+.075;outline.push([z-ar,.43],[z-ar,r]);for(let i=0;i<=8;i++){const a=Math.PI-i/8*Math.PI;outline.push([z+Math.cos(a)*ar,r+Math.sin(a)*ar]);}outline.push([z+ar,.43]);}outline.push([l/2,.43],[l/2,.70],[l/2-.15,top-.04],[l*.22,top],[-l*.35,top],[-l/2,top-.1]);profile(fixed,outline,w);
  for(const x of [-w/2+.055,w/2-.055])for(const z of [-axle,axle])wheel(x,z,r,.23,z>0);
  box(fixed,w*.83,.12,l*.72,0,.43,0,M.dark);
  const rear=id==='sedan'?-.80:id==='coupe'?-.95:id==='pickup'?-.55:-l*.36,backRoof=id==='sedan'?-.45:id==='coupe'?-.48:id==='pickup'?-.40:rear+.17,frontRoof=id==='coupe'?.38:.45,front=l*.30,roof=spec.roof,cw=w*.82;
  profile(fixed,[[rear,top-.025],[backRoof,roof-.09],[backRoof+.12,roof],[frontRoof,roof],[front,top-.02]],cw);
  // Separate inset panes with body-colour pillars, rather than a dark solid box.
  const glazingTop=roof-.12,glazingBottom=top+.08;
  for(const side of [-1,1]){const x=side*(cw/2+.007),mid=(backRoof+frontRoof)/2;panel(fixed,[[x,glazingBottom,rear+.13],[x,glazingTop,backRoof+.10],[x,glazingTop,mid-.055],[x,glazingBottom,mid-.055]]);panel(fixed,[[x,glazingBottom,mid+.055],[x,glazingTop,mid+.055],[x,glazingTop,frontRoof-.04],[x,glazingBottom,front-.16]]);box(fixed,.035,.035,.17,side*(w/2+.018),top-.10,mid-.22,M.dark);if(id!=='coupe')box(fixed,.035,.035,.17,side*(w/2+.018),top-.10,rear+.30,M.dark);beam(fixed,[side*(w/2+.005),.48,-axle+.35],[side*(w/2+.005),.48,axle-.35],.035,M.dark);}
  slopedGlass(cw-.16,front,top-.02,frontRoof,roof,true);
  slopedGlass(cw-.16,rear,top-.025,backRoof,roof-.09);
  box(fixed,w*.65,.10,.04,0,.63,l/2+.018,M.dark);box(fixed,w*.98,.11,.08,0,.46,l/2,M.dark);box(fixed,w*.98,.11,.08,0,.46,-l/2,M.dark);lights(w,l,.78);mirrors(w,top+.19,front-.12);
  if(id==='estate'||id==='suv'){for(const s of [-1,1])beam(fixed,[s*cw*.40,roof+.07,backRoof+.15],[s*cw*.40,roof+.07,frontRoof-.05],.035,M.silver);}
  if(id==='suv'){profile(fixed,[[-.95,roof+.15],[-.8,roof+.40],[.65,roof+.40],[.95,roof+.22],[.95,roof+.14]],.73,M.dark);snowCap(.68,1.4,0,roof+.43,-.03);}
  else snowCap(cw*.8,Math.max(.2,frontRoof-backRoof-.18),0,roof+.025,(frontRoof+backRoof)/2);
  if(id==='pickup'){box(fixed,w*.83,.08,1.18,0,top-.12,-l*.34,M.dark);for(const s of [-1,1])box(fixed,.10,.28,1.40,s*(w/2-.12),top+.08,-l*.34);box(fixed,w*.86,.28,.12,0,top+.08,-l/2+.09);beacon(fixed,0,roof+.08,-.05);}
 }
 function bus(){const l=spec.length,w=spec.width,coach=id==='coach',h=coach?3.55:3.05,r=.47,front=l*(coach?.33:.27),rear=-l*.31,bottom=.43,wa=r+.10;
  const outline=[[-l/2,bottom]];const axles=coach?[rear-.60,rear+.68,front]:[rear,front];for(const z of axles){outline.push([z-wa,bottom],[z-wa,r]);for(let i=0;i<=8;i++){const a=Math.PI-i/8*Math.PI;outline.push([z+wa*Math.cos(a),r+wa*Math.sin(a)]);}outline.push([z+wa,bottom]);}outline.push([l/2,bottom],[l/2,h-.36],[l/2-.24,h],[-l/2+.18,h],[-l/2,h-.25]);const doorCentres=[l/2-.63,...(coach?[]:[-.60])],holes=doorCentres.map(z=>[[z-.47,.50],[z+.47,.50],[z+.47,2.43],[z-.47,2.43]]);
  const left=profile(fixed,outline,.06),right=profile(fixed,outline,.06,M.paint,holes);left.position.x=-w/2+.03;right.position.x=w/2-.03;
  box(fixed,w-.10,.13,l-.18,0,.47,0,M.dark);box(fixed,w-.06,.12,l-.40,0,h-.06,0,M.paint);box(fixed,w-.08,h-.52,.06,0,(h+.43)/2,-l/2+.03);box(fixed,w-.08,.85,.06,0,.86,l/2-.03);
  for(let z=-l/2+1;z<l/2-1.4;z+=.83)for(const x of [-w*.31,w*.31]){if(x>0&&doorCentres.some(d=>Math.abs(z-d)<.8))continue;box(fixed,.56,.10,.47,x,.89,z,M.dark);box(fixed,.56,.52,.09,x,1.11,z-.22,M.dark);}
  for(const z of axles)for(const x of [-w/2+.075,w/2-.075])wheel(x,z,r,.27,z===front);
  const trimSpans=(a,b,side)=>{let spans=[[a,b]];if(side>0)for(const d of doorCentres)spans=spans.flatMap(([a,b])=>b<=d-.49||a>=d+.49?[[a,b]]:[[a,Math.min(b,d-.49)],[Math.max(a,d+.49),b]].filter(([a,b])=>b-a>.015));return spans;};
  const windowLow=coach?1.79:1.27,windowHigh=h-.28;for(const side of [-1,1]){for(const [a,b]of trimSpans(-l/2+.1,l/2-.1,side))box(fixed,.025,.12,b-a,side*(w/2+.012),1.03,(a+b)/2,M.ivory);const n=Math.floor((l-.8)/1.16);for(let i=0;i<n;i++){const z=-l/2+.45+(i+.5)*(l-.9)/n,half=((l-.9)/n-.075)/2;for(const [a,b]of trimSpans(z-half,z+half,side))box(fixed,.018,windowHigh-windowLow,b-a,side*(w/2+.016),(windowHigh+windowLow)/2,(a+b)/2,M.glass);}for(const [a,b]of trimSpans(-l/2+.225,l/2-.225,side))box(fixed,.035,.055,b-a,side*(w/2+.025),windowLow-.08,(a+b)/2,M.dark);}
  box(fixed,w-.17,h-1.30,.025,0,(h+.88)/2,l/2+.013,M.glass);box(fixed,w-.22,.7,.025,0,h-.7,-l/2-.018,M.glass);
  sign(fixed,id==='coach'?'UPPER SNOWFIELDS':'01  VILLAGE / LIFTS',w-.4,.25,0,h-.24,l/2+.032);wipers(w,1.1,l/2+.03);
  for(const z of doorCentres){const pivot=new T.Group();pivot.name='Passenger door';pivot.position.set(w/2+.035,.52,z+.45);root.add(pivot);box(pivot,.07,1.94,.96,0,.97,-.45,M.dark);box(pivot,.085,1.40,.72,.012,1.0,-.45,M.glass);box(pivot,.095,.70,.04,.022,.99,-.45,M.ivory);box(pivot,.13,.30,.91,-.1,-.01,-.45,M.silver);doors.push({node:pivot});}
  for(const z of [-l*.27,l*.17]){box(fixed,1.32,.17,1.35,0,h+.04,z,M.ivory);for(let i=0;i<6;i++)box(fixed,.96,.025,.06,0,h+.14,z-.44+i*.17,M.dark);}
  if(coach){for(const s of [-1,1])for(let i=0;i<4;i++){const z=-2.3+i*1.25;box(fixed,.02,.55,1.16,s*(w/2+.02),1.22,z,M.dark);box(fixed,.03,.48,1.09,s*(w/2+.04),1.22,z);box(fixed,.045,.04,.16,s*(w/2+.06),1.35,z,M.silver);}}
  for(let i=0;i<7;i++)box(fixed,.026,.028,.72,-w/2-.025,1.2+i*.08,-l/2+1.1,M.dark);
  box(fixed,w-.18,.24,.06,0,.61,l/2+.02,M.dark);lights(w,l,.83);mirrors(w,h-.80,l/2-.16);snowCap(w*.85,l*.19,0,h+.025,-l*.1);
 }
 function blade(p,width,y,z){const g=new T.Group();g.name='Blade yaw';g.position.set(0,y,z);p.add(g);profile(g,[[-.20,-.30],[.12,-.32],[.32,.35],[.20,.45],[-.04,.13]],width,M.silver);box(g,width+.10,.09,.12,0,-.29,.12,M.dark);for(const s of [-1,1]){box(g,.06,.79,.40,s*width/2,.03,.03,M.paint);beam(g,[s*width*.32,-.18,-.12],[s*width*.32,.17,-.18],.045,M.dark);}for(const x of [-width*.30,width*.30]){beam(p,[x,y+.17,z-.20],[x*.65,y+.18,z-1.05],.045,M.dark);beam(p,[x*.65,y+.18,z-1.05],[x,y-.12,z-.10],.032,M.silver);}attachments.push(g);return g;}
 function trackUnit(x,length,width,r){const g=new T.Group();g.name='Track assembly';g.position.x=x;root.add(g);const half=length/2-r;profile(g,[[-half-r,r*.3],[-half-r,r*1.25],[-half,r*2],[half,r*2],[half+r,r*1.25],[half+r,r*.3],[half,0],[-half,0]],width,M.rubber);for(let i=0;i<5;i++){const z=-half+i*half/2;for(const s of [-1,1]){cylinder(g,r*.69,.055,s*(width/2+.018),r,z,M.dark,'x');cylinder(g,r*.28,.065,s*(width/2+.023),r,z,M.silver,'x');}}const cleats=[];for(let i=0;i<28;i++){const tread=box(g,width+.07,.055,.09,0,0,0,M.silver);cleats.push(tread);}tracks.push({node:g,cleats,half,r});}
 function tracked(){const big=id==='groomer',w=spec.width,l=spec.length,tw=big?.84:.43,tr=big?.48:.33,tl=big?3.4:2.5;
  for(const s of [-1,1])trackUnit(s*(w-tw)/2,tl,tw,tr);
  box(fixed,w-tw*.8,.22,l*.70,0,tr*1.9,0,M.dark);box(fixed,w-tw,.40,l*.72,0,tr*2.15,0);const cabW=big?1.88:1.12,cabFront=big?1.65:1.07,cabRear=big?-.22:-.12,base=tr*2.35,roof=big?2.75:2.12;
  profile(fixed,[[cabRear,base],[cabRear,roof-.08],[cabRear+.10,roof],[cabFront-.37,roof],[cabFront,base+.15]],cabW);
  slopedGlass(cabW-.20,cabFront,base+.15,cabFront-.37,roof,true);
  for(const s of [-1,1]){panel(fixed,[[s*(cabW/2+.01),base+.18,cabRear+.12],[s*(cabW/2+.01),roof-.14,cabRear+.12],[s*(cabW/2+.01),roof-.14,cabFront-.45],[s*(cabW/2+.01),base+.18,cabFront-.12]]);box(fixed,.06,.1,.21,s*(cabW/2+.03),base+.23,cabRear+.23,M.dark);box(fixed,.3,.09,.4,s*(cabW/2+.22),tr*1.9,.20,M.silver);}
  box(fixed,cabW+.14,.12,cabFront-cabRear-.05,0,roof+.04,(cabFront+cabRear)/2-.10,M.dark);snowCap(cabW,.70,0,roof+.12,.25);beacon(fixed,cabW*.32,roof+.16,cabRear+.3);
  for(const s of [-1,1]){box(fixed,.24,.16,.09,s*cabW*.35,roof+.10,cabFront-.25,M.lamp);box(fixed,.23,.18,.04,s*cabW*.33,base+.07,cabFront+.035,M.lamp);}
  mirrors(cabW,roof-.35,cabFront-.36);
  blade(root,big?4.05:2.1,big?.63:.44,l/2+.16);
  if(big){box(fixed,1.45,.26,1.45,0,1.38,-1.12);for(let i=0;i<7;i++)box(fixed,1.21,.025,.045,0,1.52,-1.65+i*.17,M.dark);for(const x of [-.72,.72])beam(fixed,[x,1.05,-1.75],[x,1.05,-3.05],.07);cylinder(fixed,.24,3.5,0,.40,-3.03,M.dark,'x',16);box(fixed,3.60,.09,.64,0,.67,-3.10);for(let i=0;i<18;i++)box(fixed,.045,.15,.34,-1.65+i*.194,.23,-3.10,M.silver);}
  else{box(fixed,1.0,.09,1.15,0,base+.05,-.96,M.dark);for(const s of [-1,1])box(fixed,.07,.35,1.20,s*.54,base+.22,-.96);box(fixed,1.12,.35,.07,0,base+.22,-1.52);}
 }
 function truck(){const w=spec.width,l=spec.length;profile(fixed,[[-3.5,.67],[-3.5,1.05],[3.7,1.05],[3.7,.67]],w*.75,M.dark);for(const z of [-2.65,-1.35,2.35])for(const x of [-1.10,1.10])wheel(x,z,.54,.32,z>0);
  profile(fixed,[[1.13,1.0],[1.13,2.95],[1.38,3.15],[3.23,3.15],[3.70,2.64],[3.70,1.02]],w);
  slopedGlass(2.20,3.70,2.64,3.23,3.15,true);
  box(fixed,2.20,.70,.025,0,2.24,3.718,M.glass);
  for(const s of [-1,1]){panel(fixed,[[s*1.286,1.9,1.40],[s*1.286,3.0,1.40],[s*1.286,3.0,3.13],[s*1.286,1.9,3.52]]);box(fixed,.04,.05,.23,s*1.30,1.65,1.55,M.dark);box(fixed,.28,.08,.48,s*1.30,1.05,1.9,M.silver);}
  profile(fixed,[[-3.20,1.35],[-2.85,2.8],[.65,2.8],[.85,1.35]],2.10,M.ivory);box(fixed,2.2,.11,3.7,0,2.84,-1.12,M.dark);for(const x of [-.75,.75])beam(fixed,[x,1.10,-3.2],[x,1.1,.8],.08);beacon(fixed,-.80,3.22,2.15);beacon(fixed,.80,3.22,2.15);box(fixed,1.7,.28,.03,0,1.45,3.72,M.dark);for(let i=0;i<7;i++)box(fixed,1.52,.018,.04,0,1.35+i*.035,3.75,M.silver);lights(w,l,1.13);mirrors(w,2.65,3.05);wipers(w,1.92,3.74);blade(root,3.30,.63,4.42);snowCap(1.7,1.4,0,3.19,2.05);
 }
 if(spec.kind==='bus')bus();else if(spec.kind==='car')car();else if(spec.kind==='tracked')tracked();else truck();
 mergeStatic(fixed);for(const w of wheels)mergeStatic(w.spin);for(const d of doors)mergeStatic(d.node);for(const t of tracks){const cleats=new Set(t.cleats);const staticPart=new T.Group();t.node.add(staticPart);for(const child of [...t.node.children])if(child!==staticPart&&!cleats.has(child))staticPart.attach(child);mergeStatic(staticPart);}
 snow.visible=!!options.snow;
 let distance=0;
 function update(dt,{speed=0,steer=0,doorsOpen=false,bladeAngle=0}={}){distance+=Math.max(0,dt)*speed;for(const w of wheels){w.spin.rotation.x=distance/w.radius;w.pivot.rotation.y=w.steer?T.MathUtils.clamp(steer,-.55,.55):0;}for(const d of doors)d.node.rotation.y=T.MathUtils.damp(d.node.rotation.y,doorsOpen?-1.32:0,7,Math.max(0,dt));for(const a of attachments)a.rotation.y=T.MathUtils.clamp(bladeAngle,-.45,.45);for(const t of tracks){const straight=t.half*2,total=straight*2+2*Math.PI*t.r;for(let i=0;i<t.cleats.length;i++){const s=((i/t.cleats.length*total-distance)%total+total)%total;let z,y,angle;if(s<straight){z=-t.half+s;y=0;angle=0;}else if(s<straight+Math.PI*t.r){const a=(s-straight)/t.r-Math.PI/2;z=t.half+Math.cos(a)*t.r;y=t.r+Math.sin(a)*t.r;angle=a+Math.PI/2;}else if(s<2*straight+Math.PI*t.r){z=t.half-(s-straight-Math.PI*t.r);y=2*t.r;angle=Math.PI;}else{const a=(s-2*straight-Math.PI*t.r)/t.r+Math.PI/2;z=-t.half+Math.cos(a)*t.r;y=t.r+Math.sin(a)*t.r;angle=a+Math.PI/2;}t.cleats[i].position.set(0,y,z);t.cleats[i].rotation.x=-angle;}}}
 update(0);root.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(root),size=bounds.getSize(new T.Vector3());let triangles=0;root.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;});
 return{root,spec,wheels,tracks,doors,attachments,size,triangles,update,setColor(value){paint.color.set(value);},setSnow(value){snow.visible=!!value;},dispose(){const geometries=new Set([cube,...geometryCache.values(),...ownedGeometries]),materials=new Set(Object.values(M));root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose();});root.removeFromParent();}};
}
