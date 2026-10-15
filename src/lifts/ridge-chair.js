// Approved Ridge six-seat geometry, adapted for the resort's detachable loop.
// Receives Three.js explicitly; works from file:// without module imports.
window.LiftCoRidge={createFactory(T){
const M={},geoms=new Map(),batchCache=new Map();
const mat=(key,color,roughness=.6,metalness=0)=>M[key]||(M[key]=new T.MeshStandardMaterial({color,roughness,metalness}));
const steel=mat('steel',0xaeb8b5,.4,.65),dark=mat('dark',0x303c3c,.65,.3),black=mat('black',0x242d2e,.9),cream=mat('cream',0xf1e9d4);
function geo(key,build){if(!geoms.has(key))geoms.set(key,build());return geoms.get(key);}
function batch(parent,excluded,key){
 parent.updateMatrixWorld(true);const inverse=parent.matrixWorld.clone().invert(),groups=new Map(),remove=[];
 function collect(o){if(excluded.has(o))return;if(o.isMesh&&!o.material.transparent){const k=o.material.uuid;if(!groups.has(k))groups.set(k,{material:o.material,meshes:[]});groups.get(k).meshes.push(o);remove.push(o);}for(const c of o.children)collect(c);}
 for(const c of [...parent.children])collect(c);
 if(!batchCache.has(key)){const batches=[];for(const group of groups.values()){const positions=[],normals=[];for(const object of group.meshes){const geometry=(object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone()).applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,object.matrixWorld)),p=geometry.attributes.position,n=geometry.attributes.normal;for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));}geometry.dispose();}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.computeBoundingSphere();batches.push({geometry,material:group.material});}batchCache.set(key,batches);}
 for(const object of remove)object.parent.remove(object);for(const b of batchCache.get(key)){const object=new T.Mesh(b.geometry,b.material);object.castShadow=object.receiveShadow=true;parent.add(object);}
}
function mesh(g,geometry,material,x=0,y=0,z=0){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;}
function box(g,w,h,d,x,y,z,m){return mesh(g,geo('b'+[w,h,d],()=>new T.BoxGeometry(w,h,d)),m,x,y,z);}
function bar(g,a,b,r,material){const va=new T.Vector3(...a),vb=new T.Vector3(...b),delta=vb.clone().sub(va),m=mesh(g,geo('c'+r+','+delta.length().toFixed(4),()=>new T.CylinderGeometry(r,r,delta.length(),8)),material);m.position.copy(va).add(vb).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
function tube(g,points,r,material,curved=true){const curve=curved?new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal'):new T.CurvePath();if(!curved)for(let i=1;i<points.length;i++)curve.add(new T.LineCurve3(new T.Vector3(...points[i-1]),new T.Vector3(...points[i])));return mesh(g,geo('tube'+JSON.stringify(points)+r+curved,()=>new T.TubeGeometry(curve,Math.max(20,points.length*9),r,8,false)),material);}
function rounded(g,w,h,d,r,x,y,z,m){const shape=new T.Shape(),a=w/2,b=h/2;shape.moveTo(-a+r,-b);shape.lineTo(a-r,-b);shape.quadraticCurveTo(a,-b,a,-b+r);shape.lineTo(a,b-r);shape.quadraticCurveTo(a,b,a-r,b);shape.lineTo(-a+r,b);shape.quadraticCurveTo(-a,b,-a,b-r);shape.lineTo(-a,-b+r);shape.quadraticCurveTo(-a,-b,-a+r,-b);const geometry=geo('round'+[w,h,d,r],()=>new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:2,curveSegments:6}));return mesh(g,geometry,m,x,y,z-d/2);}
function create(number=1){
 const def={name:"Ridge",width:3.58,seats:6,frame:0x66777a,seat:0x486675,back:0x486675,style:"ridge"};
 const g=new T.Group(),suspension=new T.Group(),body=new T.Group();suspension.position.y=-.18;body.position.y=-.3;suspension.add(body);g.add(suspension);const w=def.width,edge=w/2+.12,silver=mat('frame'+def.name,def.frame,.4,.65),seatMat=mat('seat'+def.name,def.seat,.82),backMat=mat('back'+def.name,def.back,.8);
 // Reuse the gondola's detachable grip dimensions and conveyor running gear.
 box(g,.22,.22,.65,0,-.07,0,steel);box(g,.4,.1,.16,0,.07,0,dark);box(g,.12,.11,.44,-.2,.06,.12,steel);
 const gripJaws=[box(g,.065,.15,.34,-.15,-.065,0,steel),box(g,.065,.15,.34,.15,-.065,0,steel)];
 box(g,.65,.05,1,0,-.27,0,dark);for(let j=0;j<5;j++)box(g,.25,.025,.18,0,.12+j*.035,-.12,dark);
 const runningWheels=[];for(const z of [-.24,.24]){const wheel=mesh(g,geo('grip-wheel',()=>new T.CylinderGeometry(.09,.09,.07,10)),black,-.16,.03,z);wheel.rotation.z=Math.PI/2;runningWheels.push(wheel);}
 tube(body,[[.22,.18,0],[.2,-.7,0],[.55,-1.25,-.04],[.51,-1.56,-.1],[0,-1.75,-.25]],.065,silver);
 const squared=def.style==='ridge';
 const framePoints=squared?[[-edge,-3.5,-.32],[-edge,-2.28,-.45],[-edge+.12,-1.88,-.43],[-edge+.36,-1.77,-.4],[edge-.36,-1.77,-.4],[edge-.12,-1.88,-.43],[edge,-2.28,-.45],[edge,-3.5,-.32]]:[[-edge,-3.5,-.32],[-edge-.1,-3.1,-.44],[-edge,-2.25,-.44],[-edge+.24,-1.87,-.4],[0,-1.76,-.38],[edge-.24,-1.87,-.4],[edge,-2.25,-.44],[edge+.1,-3.1,-.44],[edge,-3.5,-.32]];
 tube(body,framePoints,.055,silver);
 bar(body,[-edge,-3.62,-.4],[edge,-3.62,-.4],.045,silver);bar(body,[-edge,-3.62,.49],[edge,-3.62,.49],.045,silver);
 for(const x of [-w*.32,w*.32]){bar(body,[x,-3.61,-.4],[x,-3.61,.5],.038,silver);if(def.style==='ridge')bar(body,[x,-1.8,-.4],[x,-3.45,-.45],.032,silver);}
 const cushionY=-3.49;
 if(def.style==='classic'){rounded(body,w,.13,.82,.055,0,cushionY,.02,seatMat);rounded(body,w,.31,.11,.07,0,-3.01,-.42,backMat);box(body,w,.06,.08,0,-3.18,-.41,steel);for(let i=1;i<def.seats;i++)box(body,.014,.012,.72,-w/2+w*i/def.seats,cushionY+.08,.02,dark);}
 else for(let i=0;i<def.seats;i++){const x=(i-(def.seats-1)/2)*(w/def.seats);rounded(body,w/def.seats-.035,.16,.82,.065,x,cushionY,.02,seatMat);const pad=rounded(body,w/def.seats-.04,.49,.13,.08,x,-2.99,-.4,backMat);pad.rotation.x=-.07;}
 for(const side of [-1,1])tube(body,[[side*edge,-3.5,.4],[side*edge,-3.1,.5],[side*edge,-3.05,.08],[side*edge,-3.18,-.35]],.035,black);
 if(def.style==='ridge'){box(body,w,.09,.09,0,-3.28,-.49,steel);for(const side of [-1,1])bar(body,[side*w*.43,-3.3,-.48],[0,-1.83,-.42],.028,silver);}
 // Every rail and footrest is parented to one hinge. An opening bar rotates as
 // one assembly; its position is never independently faked for the station view.
 const safety=new T.Group();safety.position.set(0,-2.88,-.27);body.add(safety);
 tube(safety,[[-edge,0,0],[-edge,0,.65],[-edge+.12,-.02,1.03],[edge-.12,-.02,1.03],[edge,0,.65],[edge,0,0]],.034,silver);
 const restCount=def.style==='ridge'?3:2;
 for(let k=0;k<restCount;k++){const x=(k-(restCount-1)/2)*(w/restCount);bar(safety,[x,-.02,1.02],[x,-1.27,.92],.026,silver);bar(safety,[x-.22,-1.27,.92],[x+.22,-1.27,.92],.035,black);}
 if(def.style==='ridge')for(let i=1;i<def.seats;i++)bar(safety,[-w/2+w*i/def.seats,-.02,1.03],[-w/2+w*i/def.seats,-.38,.99],.026,black);
 for(const side of [-1,1]){const pivot=mesh(body,geo('pivot',()=>new T.CylinderGeometry(.095,.095,.11,12)),dark,side*edge,-2.88,-.27);pivot.rotation.z=Math.PI/2;}
 const labelCanvas=document.createElement('canvas');labelCanvas.width=128;labelCanvas.height=64;const c=labelCanvas.getContext('2d');c.fillStyle='#e9e6d7';c.fillRect(0,0,128,64);c.fillStyle='#465447';c.textAlign='center';c.font='bold 29px monospace';c.fillText(String(number).padStart(2,'0'),64,43);const texture=new T.CanvasTexture(labelCanvas);texture.colorSpace=T.SRGBColorSpace;const plaque=new T.Mesh(new T.PlaneGeometry(.3,.15),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}));plaque.position.set(0,-1.81,-.47);plaque.rotation.y=Math.PI;body.add(plaque);
 batch(safety,new Set(),'safety');batch(suspension,new Set([safety,plaque]),'body');batch(g,new Set([suspension,...gripJaws,...runningWheels]),'gear');
 return{g,suspension,safety,gripJaws,runningWheels,seatY:-3.79,seatPitch:w/6,seatScale:.75,eye:new T.Vector3(-w/12,-2.88,.16),riders:Array(6).fill(null),doors:[],rackSkis:[],barOpen:0,door:0,isChair:true};
}

return{create};
}};
