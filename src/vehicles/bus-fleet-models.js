import * as T from 'three';
import {mergeGeometries} from '../../assets/vendor/three/BufferGeometryUtils.js';

// Original coachwork studies. Metres, Y up, +Z forward. Independent of resort saves.
export const fleet=[
 {id:'sprig',number:'01',name:'Sprig 08',family:'Alpine village shuttle',tag:'Small streets. Big character.',length:8.6,modules:[8.6],width:2.36,height:3.04,color:'#d79b45',route:'08',destination:'VILLAGE',features:['Rear ski carrier','Compact two-axle chassis','Warm timber passenger floor']},
 {id:'current',number:'02',name:'Current 12',family:'Battery electric city bus',tag:'A quieter kind of mountain air.',length:12,modules:[12],width:2.55,height:3.15,color:'#4e887e',route:'12',destination:'SNOWFIELDS',features:['Roof-mounted battery pods','Two wide passenger entrances','Illuminated charging socket']},
 {id:'panorama',number:'03',name:'Panorama DD',family:'Panoramic double-decker',tag:'The view is part of the journey.',length:13.2,modules:[13.2],width:2.55,height:4.12,color:'#355c72',route:'18',destination:'PANORAMA',features:['Two furnished passenger decks','Panoramic upper windscreen','Twin rear axles and rear stairwell']},
 {id:'ribbon',number:'04',name:'Ribbon 18',family:'Articulated mountain bus',tag:'A little flexibility goes a long way.',length:18.15,modules:[9.8,6.9],width:2.55,height:3.15,color:'#c96b46',route:'23',destination:'UPPER VILLAGE',features:['Deforming accordion bellows','Three axles and three entrances','Continuous articulated passenger floor']},
 {id:'tandem',number:'05',name:'Tandem 24',family:'Double-articulated electric bus',tag:'For the whole mountain. And their friends.',length:24.6,modules:[8.4,7.2,6.2],width:2.55,height:3.22,color:'#80576b',route:'24',destination:'SUMMIT LINK',features:['Two independent accordion joints','Four axles with rear steering','Three powered passenger modules']}
];
const letters={
 ' ':['00000','00000','00000','00000','00000','00000','00000'],'.':['0','0','0','0','0','1','1'],
 A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01111','10000','10000','10111','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],I:['11111','00100','00100','00100','00100','00100','11111'],J:['00111','00010','00010','00010','10010','10010','01100'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','11001','10101','10011','10011','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],W:['10001','10001','10001','10101','10101','10101','01010'],X:['10001','10001','01010','00100','01010','10001','10001'],Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111'],
 0:['01110','10011','10101','10101','11001','10001','01110'],1:['00100','01100','00100','00100','00100','00100','01110'],2:['01110','10001','00001','00110','01000','10000','11111'],3:['11110','00001','00001','01110','00001','00001','11110'],4:['00010','00110','01010','10010','11111','00010','00010'],5:['11111','10000','10000','11110','00001','00001','11110'],6:['01110','10000','10000','11110','10001','10001','01110'],7:['11111','00001','00010','00100','01000','01000','01000'],8:['01110','10001','10001','01110','10001','10001','01110'],9:['01110','10001','10001','01111','00001','00001','01110']
};
export function createBus(id,options={}){
 const spec=fleet.find(v=>v.id===id);if(!spec)throw Error('Unknown bus: '+id);
 const root=new T.Group();root.name=spec.name;root.userData={busId:id,forward:'+Z',units:'metres'};
 const owned=new Set(),materials=new Set(),textures=new Set(),wheels=[],doors=[],joints=[],seats=[],cutaway=[],lamps=[],winter=[],modules=[];
 const material=(color,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.57,...extra});materials.add(m);return m;};
 const M={paint:material(options.color||spec.color,{metalness:.16,roughness:.35}),cream:material('#eee9da'),dark:material('#203238'),rubber:material('#20272a',{roughness:.94}),silver:material('#b8c4c1',{metalness:.8,roughness:.29}),glass:material('#6c9caa',{metalness:.18,roughness:.14,transparent:true,opacity:.55,depthWrite:false,side:T.DoubleSide}),floor:material('#9f8263',{roughness:.9}),seat:material('#647d77',{roughness:.98}),seatTrim:material('#e0a263'),pole:material('#d8ae69',{metalness:.55}),snow:material('#fffaf0',{roughness:.98}),black:material('#101e23'),light:material('#fff6d2',{emissive:'#fff0c3',emissiveIntensity:.7}),red:material('#be3d35',{emissive:'#d42e23',emissiveIntensity:.35}),amber:material('#e7a340',{emissive:'#ff9e36',emissiveIntensity:.6}),bellows:material('#606b6a',{roughness:.86,side:T.DoubleSide}),green:material('#b6dc92',{emissive:'#a6dd8c',emissiveIntensity:.6})};
 const cube=new T.BoxGeometry();owned.add(cube);const cylinderCache=new Map(),roundCache=new Map();
 function mesh(parent,g,m){owned.add(g);const o=new T.Mesh(g,m);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function box(p,w,h,d,x,y,z,m=M.paint){const o=mesh(p,cube,m);o.scale.set(w,h,d);o.position.set(x,y,z);return o;}
 function round(p,w,h,d,x,y,z,m=M.paint,r=.075){r=Math.min(r,w/3,h/3,d/3);const key=[w,h,d,r].join(':');let g=roundCache.get(key);if(!g){const s=new T.Shape(),a=w/2-r,b=h/2-r;s.moveTo(-a,-h/2);s.lineTo(a,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-b);s.lineTo(w/2,b);s.quadraticCurveTo(w/2,h/2,a,h/2);s.lineTo(-a,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,b);s.lineTo(-w/2,-b);s.quadraticCurveTo(-w/2,-h/2,-a,-h/2);g=new T.ExtrudeGeometry(s,{depth:d-2*r,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:r,bevelThickness:r,curveSegments:3});g.translate(0,0,-d/2+r);roundCache.set(key,g);}const o=mesh(p,g,m);o.position.set(x,y,z);return o;}
 function cylinder(p,r,h,x,y,z,m=M.silver,axis='y',n=24){const key=[r,h,n].join(':');let g=cylinderCache.get(key);if(!g){g=new T.CylinderGeometry(r,r,h,n);cylinderCache.set(key,g);}const o=mesh(p,g,m);o.position.set(x,y,z);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o;}
 function rod(p,a,b,r=.025,m=M.silver){const av=new T.Vector3(...a),bv=new T.Vector3(...b),o=cylinder(p,r,av.distanceTo(bv),0,0,0,m);o.position.copy(av).add(bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return o;}
 function label(p,text,w,h,x,y,z,ry=0,led=false){text=text.toUpperCase();const scale=3,tw=text.length*6*scale+8,th=29,data=new Uint8Array(tw*th*4);if(led)for(let i=0;i<data.length;i+=4){data[i]=10;data[i+1]=20;data[i+2]=23;data[i+3]=255;}
  for(let k=0;k<text.length;k++)for(let row=0;row<7;row++)for(let col=0;col<5;col++)if((letters[text[k]]||letters[' '])[row]?.[col]==='1')for(let a=0;a<2;a++)for(let b=0;b<2;b++){const i=((row*scale+4+a)*tw+4+k*18+col*scale+b)*4;data[i]=led?255:236;data[i+1]=led?183:235;data[i+2]=led?77:214;data[i+3]=255;}
  const texture=new T.DataTexture(data,tw,th);texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;texture.needsUpdate=true;textures.add(texture);const mat=new T.MeshBasicMaterial({map:texture,transparent:!led,alphaTest:.1,side:T.DoubleSide,toneMapped:false});materials.add(mat);const o=mesh(p,new T.PlaneGeometry(w,h),mat);o.castShadow=false;o.position.set(x,y,z);o.rotation.y=ry;return o;
 }
 function wheel(p,x,z,steer=false,rearSteer=false){const pivot=new T.Group(),spin=new T.Group();p.add(pivot);pivot.add(spin);pivot.position.set(x,.54,z);pivot.name=steer?'Steering knuckle':'Axle';spin.name='Wheel rotor';const side=Math.sign(x);
  cylinder(spin,.54,.34,0,0,0,M.rubber,'x',32);cylinder(spin,.405,.355,0,0,0,M.dark,'x',32);cylinder(spin,.325,.365,0,0,0,M.silver,'x',24);cylinder(spin,.135,.388,0,0,0,M.cream,'x');
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;cylinder(spin,.045,.012,side*.19,Math.sin(a)*.25,Math.cos(a)*.25,M.dark,'x',8);cylinder(spin,.017,.018,side*.205,Math.sin(a)*.1,Math.cos(a)*.1,M.dark,'x',6);}
  for(let i=0;i<36;i++){const a=i/36*Math.PI*2,o=box(spin,.31,.018,.08,0,Math.sin(a)*.539,Math.cos(a)*.539,M.rubber);o.rotation.x=-a;}
  wheels.push({pivot,spin,radius:.54,steer,rearSteer});batch(spin);return pivot;
 }
 function batch(parent){parent.updateWorldMatrix(true,true);const inverse=parent.matrixWorld.clone().invert(),groups=new Map();function collect(o){if(o!==parent&&o.userData.batchBoundary)return;if(o.isMesh&&!Array.isArray(o.material)){const a=groups.get(o.material)||[];a.push(o);groups.set(o.material,a);}for(const c of o.children)collect(c);}collect(parent);for(const [m,nodes]of groups){const gs=nodes.map(o=>{let g=o.geometry.clone();if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}g.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));return g;});const merged=mergeGeometries(gs,false);gs.forEach(g=>g.dispose());if(!merged)throw Error('Bus geometry could not be batched');for(const o of nodes)o.removeFromParent();mesh(parent,merged,m);}}
 function sidePanel(p,L,side,axles,openings){const events=[...axles.map(z=>({a:z-.65,b:z+.65,z,type:'wheel'})),...openings.map(z=>({a:z-.64,b:z+.64,z,type:'door'}))].sort((a,b)=>a.a-b.a),s=new T.Shape();s.moveTo(L/2,.43); // Shape X is negative world Z after rotation.
  for(const e of events){s.lineTo(-e.a,.43);if(e.type==='wheel'){s.lineTo(-e.a,.54);for(let j=0;j<=18;j++){const a=Math.PI-j/18*Math.PI;s.lineTo(-(e.z+Math.cos(a)*.65),.54+Math.sin(a)*.65);}s.lineTo(-e.b,.43);}else{s.lineTo(-e.a,1.52);s.lineTo(-e.b,1.52);s.lineTo(-e.b,.43);}}
  s.lineTo(-L/2,.43);s.lineTo(-L/2,1.52);s.lineTo(L/2,1.52);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:.075,bevelEnabled:false});g.translate(0,0,-.0375);g.rotateY(Math.PI/2);const o=mesh(p,g,M.paint);o.position.x=side*(spec.width/2-.035);
  for(const z of axles){const f=mesh(p,new T.TorusGeometry(.65,.035,6,28,Math.PI),M.dark);f.rotation.y=Math.PI/2;f.position.set(side*(spec.width/2+.007),.54,z);}
 }
 function seat(p,x,z,y=.79){const g=new T.Group();p.add(g);g.position.set(x,y,z);box(g,.43,.10,.51,0,.48,0,M.seat);const back=round(g,.43,.70,.13,0,.82,-.21,M.seat,.04);back.rotation.x=-.08;box(g,.43,.06,.12,0,1.10,-.23,M.seatTrim);rod(g,[-.16,.1,-.14],[-.16,.46,-.14],.023,M.dark);rod(g,[.16,.1,-.14],[.16,.46,-.14],.023,M.dark);box(g,.045,.05,.36,-.24,.72,-.03,M.dark);box(g,.045,.05,.36,.24,.72,-.03,M.dark);seats.push({module:p.userData.module??p.parent?.userData.module??0,x,y:y+.48,z});}
 function passengerDoor(p,z){const w=spec.width,frame=new T.Group();p.add(frame);box(frame,.10,2.1,.055,w/2+.01,1.65,z-.66,M.cream);box(frame,.10,2.1,.055,w/2+.01,1.65,z+.66,M.cream);box(frame,.10,.08,1.38,w/2+.01,2.72,z,M.cream);box(frame,.30,.08,1.25,w/2+.015,.64,z,M.dark);box(frame,.035,.035,1.19,w/2+.17,.70,z,M.seatTrim);
  for(const side of [-1,1]){const pivot=new T.Group();pivot.position.set(w/2+.045,.71,z+side*.625);p.add(pivot);const dz=-side*.305;box(pivot,.065,1.96,.60,0,.98,dz,M.dark);box(pivot,.082,1.34,.48,.01,1.18,dz,M.glass);box(pivot,.089,.30,.48,.018,.26,dz,M.paint);box(pivot,.09,.04,.52,.021,.54,dz,M.cream);box(pivot,.095,.10,.08,.022,.88,dz-side*.19,M.pole);doors.push({pivot,x:pivot.position.x,side});batch(pivot);}
  rod(p,[w/2-.26,.85,z-.58],[w/2-.26,2.5,z-.58],.026,M.pole);box(p,.08,.10,.08,w/2+.07,1.5,z-.79,M.green);label(p,'STEP',.42,.15,w/2+.09,.92,z-.78,Math.PI/2);
 }
 function frontDetails(p,L,H){const w=spec.width,z=L/2;
  round(p,w-.04,.91,.28,0,.95,z-.04,M.paint,.09);round(p,w-.12,1.45,.11,0,2.03,z+.035,M.dark,.10);round(p,w-.28,1.27,.06,0,2.04,z+.108,M.glass,.08);box(p,.055,1.32,.09,0,2.03,z+.15,M.dark);label(p,spec.route+' '+spec.destination,w-.27,.27,0,2.71,z+.12,0,true);
  if(id==='panorama'){round(p,w-.12,1.09,.12,0,3.45,z+.01,M.dark,.09);round(p,w-.29,.93,.05,0,3.45,z+.09,M.glass,.07);box(p,.045,.94,.06,0,3.45,z+.12,M.dark);}
  for(const side of [-1,1]){const x=side*w*.34;if(id==='sprig'){for(const offset of [0,-side*.24]){cylinder(p,.12,.075,x+offset,1.02,z+.16,M.silver,'z');cylinder(p,.088,.085,x+offset,1.02,z+.18,M.light,'z');}}else if(id==='panorama'){round(p,.19,.48,.09,x,1.01,z+.14,M.dark,.04);for(let k=0;k<3;k++)cylinder(p,.057,.035,x,.87+k*.14,z+.20,M.light,'z',16);}else{round(p,.47,.17,.08,x,1.01,z+.14,M.dark,.05);box(p,.35,.055,.025,x,1.04,z+.19,M.light);box(p,.27,.025,.028,x,.97,z+.193,M.light);if(id==='current'||id==='tandem')box(p,.027,.23,.028,side*(w/2-.11),.94,z+.17,M.light);}box(p,.12,.045,.025,side*(w/2-.10),1.15,z+.13,M.amber);lamps.push(M.light);
   rod(p,[side*.28,1.49,z+.17],[side*.55,1.91,z+.18],.013,M.black);rod(p,[side*.47,1.80,z+.185],[side*.77,2.15,z+.185],.015,M.black);
   rod(p,[side*(w/2-.09),2.55,z-.18],[side*(w/2+.32),2.58,z+.18],.036,M.dark);round(p,.14,.48,.25,side*(w/2+.33),2.38,z+.23,M.dark,.05);box(p,.024,.37,.18,side*(w/2+.405),2.39,z+.24,M.silver);
  }
  round(p,w-.10,.14,.12,0,.54,z+.08,M.dark,.04);box(p,.42,.12,.025,0,.75,z+.15,M.cream);label(p,'LIFT CO',.42,.10,0,.76,z+.17);box(p,.69,.04,.04,0,1.21,z+.15,M.cream);if(id==='current'||id==='tandem'){cylinder(p,.10,.022,0,1.04,z+.17,M.dark,'z');label(p,'E',.10,.11,0,1.04,z+.19);}else for(let i=0;i<5;i++)box(p,.38,.018,.022,0,.87+i*.045,z+.16,M.dark);
  const dash=round(p,1.1,.28,.58,-.58,1.47,z-.48,M.dark,.08);dash.rotation.x=.12;box(p,.32,.015,.19,-.68,1.63,z-.53,M.green);for(let i=0;i<5;i++)box(p,.035,.025,.035,-.40+i*.045,1.63,z-.43,M.cream);
  const steering=new T.Group();p.add(steering);steering.position.set(-.60,1.69,z-.90);steering.rotation.x=.45;const ring=mesh(steering,new T.TorusGeometry(.19,.022,7,24),M.dark);ring.rotation.x=Math.PI/2;for(let i=0;i<3;i++){const a=i/3*Math.PI*2;rod(steering,[0,0,0],[Math.cos(a)*.17,0,Math.sin(a)*.17],.015,M.dark);}seat(p,-.64,z-1.45,.79);
 }
 function rearDetails(p,L){const w=spec.width,z=-L/2;
  round(p,w-.03,.90,.16,0,.94,z,M.paint,.07);round(p,w-.12,1.25,.12,0,2.06,z-.02,M.dark,.07);round(p,w-.28,1.04,.07,0,2.08,z-.1,M.glass,.06);label(p,spec.route,.43,.27,.69,2.7,z-.12,Math.PI,true);
  for(const side of [-1,1]){round(p,.17,.50,.09,side*(w/2-.17),1.1,z-.12,M.dark,.04);for(let i=0;i<3;i++)box(p,.10,.09,.025,side*(w/2-.17),.94+i*.15,z-.18,i===1?M.amber:M.red);box(p,.18,.035,.028,side*.66,.60,z-.15,M.red);}
  for(let i=0;i<8;i++)box(p,1.25,.022,.025,0,.72+i*.052,z-.11,M.dark);round(p,w-.12,.12,.14,0,.48,z-.08,M.dark,.03);box(p,.45,.12,.03,0,.54,z-.17,M.cream);label(p,'LIFT CO',1.12,.24,0,1.48,z-.13,Math.PI);
  const kit=new T.Group();kit.userData.batchBoundary=true;p.add(kit);winter.push(kit);for(const x of [-.64,.64])rod(kit,[x,.45,z-.15],[x,.45,z-.65],.04,M.dark);box(kit,1.5,.14,.40,0,.56,z-.59,M.dark);for(const x of [-.65,.65])rod(kit,[x,.56,z-.63],[x,2.55,z-.63],.035,M.silver);box(kit,1.4,.09,.11,0,1.74,z-.64,M.dark);
  for(let i=0;i<8;i++){const x=-.52+i*.15,o=round(kit,.09,2.02,.055,x,1.63,z-.68,i%2?M.cream:M.paint,.025);o.rotation.z=(i%2?1:-1)*.035;box(kit,.065,.14,.07,x,1.37,z-.73,M.dark);}batch(kit);kit.visible=false;
 }
 function roof(p,L,H,index){const top=new T.Group();p.add(top);cutaway.push(top);round(top,spec.width-.03,.24,L-.14,0,H-.10,0,M.cream,.10);for(const side of [-1,1])box(top,.055,.075,L-.2,side*(spec.width/2-.07),H-.01,0,M.dark);
  const electric=id==='current'||id==='tandem',length=Math.min(L*.57,electric?5.3:2.2);round(top,1.63,.28,length,0,H+.13,-L*.07,M.cream,.11);round(top,1.30,.10,length-.20,0,H+.30,-L*.07,M.dark,.04);
  for(let i=0;i<Math.max(6,Math.floor(length/.18));i++)box(top,1.22,.015,.038,0,H+.362,-L*.07-length/2+.14+i*.18,M.silver);
  for(const z of [-L*.07-length*.26,-L*.07+length*.26]){cylinder(top,.34,.022,0,H+.38,z,M.dark);for(let a=0;a<6;a++){const blade=box(top,.085,.018,.53,0,H+.40,z,M.silver);blade.rotation.y=a/6*Math.PI*2;}}
  if(electric){round(top,.8,.16,1.32,0,H+.07,L*.31,M.dark,.06);box(top,.65,.02,1.10,0,H+.16,L*.31,M.paint);}
  const cap=new T.Group();cap.userData.batchBoundary=true;top.add(cap);round(cap,spec.width-.22,.055,L*.25,0,H+.045,-L*.35,M.snow,.02);round(cap,spec.width-.24,.04,L*.21,0,H+.045,L*.35,M.snow,.015);round(cap,1.52,.055,length-.10,0,H+.43,-L*.07,M.snow,.02);winter.push(cap);cap.visible=false;batch(top);
 }
 function moduleBody(L,index){const p=new T.Group(),body=new T.Group(),cabin=new T.Group();p.userData.module=index;p.name='Passenger module '+(index+1);p.add(body,cabin);modules.push(p);const first=index===0,last=index===spec.modules.length-1,H=spec.height,w=spec.width,dd=id==='panorama';
  let axles;if(first){axles=dd?[-L/2+1.3,-L/2+2.95,L/2-2.7]:[-L/2+1.65,L/2-2.65];}else axles=[-L/2+1.8];
  const openings=first?(id==='sprig'?[L/2-1.02]:[L/2-1.02,-.11*L]):[L/2-1.28];
  for(const side of [-1,1]){const wall=new T.Group();body.add(wall);if(side===1){wall.userData.batchBoundary=true;cutaway.push(wall);}sidePanel(wall,L,side,axles,side===1?openings:[]);
   const breaks=[-L/2+.09,...(side===1?openings.flatMap(z=>[z-.65,z+.65]):[]),L/2-.09].sort((a,b)=>a-b);
   for(let k=0;k<breaks.length-1;k++){const a=breaks[k],b=breaks[k+1],center=(a+b)/2;if(side===1&&openings.some(z=>Math.abs(center-z)<.65))continue;box(wall,.08,.17,b-a,side*(w/2-.025),1.46,center,M.cream);box(wall,.04,.10,b-a,side*(w/2+.015),1.26,center,M.cream);
    const count=Math.max(1,Math.ceil((b-a)/1.12));for(let n=0;n<count;n++){const step=(b-a)/count,z=a+step*(n+.5);box(wall,.055,1.13,step-.07,side*(w/2-.015),2.12,z,M.glass);box(wall,.072,1.27,.055,side*(w/2-.01),2.12,a+step*n,M.dark);box(wall,.08,.045,step-.07,side*(w/2+.007),2.48,z,M.silver);if(dd){box(wall,.055,1.0,step-.07,side*(w/2-.015),3.45,z,M.glass);box(wall,.08,1.10,.055,side*(w/2-.01),3.45,a+step*n,M.dark);}}
   }
   box(wall,.08,.16,L,side*(w/2-.02),2.81,0,M.cream);if(dd){box(wall,.095,.15,L,side*(w/2-.02),2.91,0,M.paint);box(wall,.08,.11,L,side*(w/2-.02),4.0,0,M.cream);}
   const marks=new T.Group();wall.add(marks);const markZ=first?-L*.25:0;label(marks,'LIFT CO',1.15,.24,side*(w/2+.043),1.12,markZ,side*Math.PI/2);label(marks,spec.route,.34,.16,side*(w/2+.045),1.37,-L/2+.55,side*Math.PI/2);
   for(const z of [-L*.34,0,L*.32])box(wall,.025,.055,.11,side*(w/2+.052),.58,z,M.amber);
   // Discrete livery slashes sit above the wheel arch rather than painting over it.
   for(let n=0;n<3;n++){const stripe=box(wall,.022,.18,.045,side*(w/2+.05),1.31,-L*.31+n*.13,M.pole);stripe.rotation.x=.42;}
   batch(wall);
  }
  for(const z of axles)for(const side of [-1,1])round(cabin,.43,.38,1.30,side*(w/2-.23),1.02,z,M.dark,.08);
  box(cabin,w-.22,.10,L-.12,0,.76,0,M.floor);for(let x=-w/2+.22;x<w/2-.1;x+=.13)box(cabin,.012,.006,L-.18,x,.814,0,M.dark);
  const lower=new T.Group();lower.userData.module=index;cabin.add(lower);for(let z=-L/2+.72;z<L/2-(first?2.1:.70);z+=.93)for(const side of [-1,1]){if(side===1&&openings.some(d=>Math.abs(z-d)<.80))continue;for(const x of [.56,.99])seat(lower,side*x,z,.80);}
  for(const side of [-1,1]){rod(cabin,[side*.57,2.55,-L/2+.3],[side*.57,2.55,L/2-.35],.022,M.pole);for(let z=-L/2+1;z<L/2-.5;z+=1.7){rod(cabin,[side*.57,.85,z],[side*.57,2.57,z],.023,M.pole);const loop=mesh(cabin,new T.TorusGeometry(.067,.009,5,12),M.dark);loop.position.set(side*.57,2.35,z+.22);rod(cabin,[side*.57,2.55,z+.22],[side*.57,2.42,z+.22],.011,M.dark);}}
  if(dd){box(cabin,w-.20,.12,L-.18,0,2.83,0,M.floor);for(let z=-L/2+2.4;z<L/2-.55;z+=.9)for(const side of [-1,1])for(const x of [.56,.99])seat(lower,side*x,z,2.85);for(let i=0;i<11;i++)box(cabin,.66,.16,.25,.65,.91+i*.17,-L/2+.45+i*.16,M.dark);for(const x of [.27,1.04])rod(cabin,[x,1.15,-L/2+.45],[x,3.28,-L/2+2.3],.025,M.pole);}
  for(const side of [-1,1]){box(cabin,.055,.025,L-.3,side*.75,2.68,0,M.light);if(dd)box(cabin,.045,.025,L-.3,side*.75,3.97,0,M.light);}
  for(const z of openings)passengerDoor(p,z);for(let i=0;i<axles.length;i++)for(const side of [-1,1])wheel(p,side*(w/2-.10),axles[i],first&&i===axles.length-1,!first&&last&&id==='tandem');
  if(first)frontDetails(body,L,H);else{box(body,w-.12,.25,.08,0,.91,L/2,M.dark);}
  if(last)rearDetails(body,L);else box(body,w-.12,.25,.08,0,.91,-L/2,M.dark);
  if(id==='current'||id==='tandem'){const x=-w/2-.04,z=-L*.28;round(body,.06,.38,.40,x,1.16,z,M.dark,.025);box(body,.075,.22,.022,x-.012,1.16,z,M.green);rod(body,[x-.04,1.3,z-.07],[x-.04,1.14,z+.02],.016,M.green);rod(body,[x-.04,1.14,z+.02],[x-.04,1.02,z-.01],.016,M.green);}
  roof(p,L,H,index);batch(body);batch(cabin);return p;
 }
 function accordion(parent,previousLength,rear,L,index){const gap=1.45,pivot=new T.Group();pivot.name='Articulation '+(index+1);pivot.position.z=-previousLength/2-gap/2;parent.add(pivot);rear.position.z=-gap/2-L/2;pivot.add(rear);
  const outline=[[-1.17,.75],[-1.24,.88],[-1.24,2.79],[-1.12,2.99],[1.12,2.99],[1.24,2.79],[1.24,.88],[1.17,.75]],rings=21,n=outline.length,positions=new Float32Array(rings*n*3),indices=[];
  for(let j=0;j<rings-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=(j+1)*n+i,d=(j+1)*n+(i+1)%n;indices.push(a,c,b,b,c,d);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3));g.setIndex(indices);const bellows=mesh(parent,g,M.bellows);bellows.name='Flexible pleated bellows';bellows.position.z=pivot.position.z;
  const floor=box(pivot,spec.width-.38,.12,gap+1,0,.76,0,M.floor);floor.name='Articulated turntable floor';cylinder(pivot,.99,.035,0,.84,0,M.dark);cylinder(pivot,.89,.035,0,.86,0,M.silver);const safety=rod(parent,[-1.29,3.10,pivot.position.z+gap/2],[-1.29,3.10,pivot.position.z-gap/2],.035,M.dark);
  joints.push({pivot,bellows,positions,outline,rings,gap,previous:NaN,safety});return pivot;
 }
 const first=moduleBody(spec.modules[0],0);first.position.z=spec.length/2-spec.modules[0]/2;root.add(first);let previous=first;
 for(let i=1;i<spec.modules.length;i++){const next=moduleBody(spec.modules[i],i);accordion(previous,spec.modules[i-1],next,spec.modules[i],i-1);previous=next;}
 let distance=0,door=0,disposed=false;
 function update(dt,{speed=0,bend=0,doorsOpen=false,lights=true}={}){const seconds=Math.max(0,dt);door=T.MathUtils.damp(door,doorsOpen?1:0,8,seconds);if(Math.abs(door-(doorsOpen?1:0))<.001)door=doorsOpen?1:0;const effectiveSpeed=door>.001||doorsOpen?0:speed;distance+=effectiveSpeed*seconds;
  for(const w of wheels){w.spin.rotation.x=distance/w.radius;w.pivot.rotation.y=w.steer?-bend*.56:w.rearSteer?bend*.24:0;}
  for(const d of doors){d.pivot.rotation.y=-d.side*door*1.40;d.pivot.position.x=d.x+door*.09;}
  for(let k=0;k<joints.length;k++){const j=joints[k],angle=T.MathUtils.clamp(bend*(k===0?1:-.52),-.66,.66);j.pivot.rotation.y=angle;if(Math.abs(j.previous-angle)<1e-5)continue;j.previous=angle;
   const n=j.outline.length;for(let row=0;row<j.rings;row++){const t=row/(j.rings-1),a=angle*t,fold=row===0||row===j.rings-1?0:row%2?.075:-.025;for(let i=0;i<n;i++){const [ox,oy]=j.outline[i],x=ox+Math.sign(ox)*fold,y=oy+(oy>2?fold:0),z=j.gap/2-t*j.gap,at=(row*n+i)*3;j.positions[at]=Math.cos(a)*x+Math.sin(a)*z;j.positions[at+1]=y;j.positions[at+2]=-Math.sin(a)*x+Math.cos(a)*z;}}
   const a=new T.Vector3(-1.29,3.10,j.gap/2),b=new T.Vector3(-1.29,3.10,-j.gap/2).applyAxisAngle(new T.Vector3(0,1,0),angle);j.safety.position.copy(a).add(b).multiplyScalar(.5);j.safety.position.z+=j.pivot.position.z;j.safety.scale.y=a.distanceTo(b)/j.gap;j.safety.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());
   j.bellows.geometry.attributes.position.needsUpdate=true;j.bellows.geometry.computeVertexNormals();j.bellows.geometry.computeBoundingSphere();
  }
  M.light.emissiveIntensity=lights?1.3:.05;M.red.emissiveIntensity=lights?.65:.05;M.amber.emissiveIntensity=lights?.8:.05;
 }
 update(0,{bend:0});root.updateMatrixWorld(true);
 const used=new Set();root.traverse(o=>{if(o.geometry)used.add(o.geometry);});for(const g of [...owned])if(!used.has(g)){g.dispose();owned.delete(g);}cylinderCache.clear();roundCache.clear();
 const size=new T.Box3().setFromObject(root).getSize(new T.Vector3());let triangles=0;root.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;});
 return{root,spec,wheels,doors,joints,seats,size,triangles,update,get door(){return door;},get distance(){return distance;},setColor(c){M.paint.color.set(c);},setWinter(on){winter.forEach(o=>o.visible=on);},setCutaway(on){cutaway.forEach(o=>o.visible=!on);},setWireframe(on){materials.forEach(m=>m.wireframe=on);},dispose(){if(disposed)return;disposed=true;owned.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());root.removeFromParent();}};
}
