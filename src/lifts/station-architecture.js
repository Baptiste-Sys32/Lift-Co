import * as T from 'three';
import {mergeGeometries} from '../../assets/vendor/three/BufferGeometryUtils.js';
import {referenceFactory} from './station-reference-buildings.js?v=4.4.0';

// Approved visual architecture only. Cable routing remains owned by each runtime.
function create(style,{length=26,boardingY=.52,radius=2.2,role='valley',fixed=false,deckEnd=23,deckOuter=7.55,portalHeight=14.2}={}){
 const root=new T.Group(),shell=new T.Group(),mechanical=new T.Group();root.add(shell,mechanical);
 root.name='Approved station / '+style;root.userData.stationStyle=style;root.userData.frameHalf=radius+2;
 const mat=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness,side:T.DoubleSide});
 const mats={paint:mat(0x4c746b,.48,.3),steel:mat(0x83908d,.5,.65),ivory:mat(0xeeeade),dark:mat(0x303d3c,.5,.4),concrete:mat(0xb9b9ab,1),wood:mat(0x886342,.85),woodLight:mat(0xb19066,.85),rubber:mat(0x252b2b,.95),yellow:mat(0xc2a347,.5,.3),red:mat(0xac493c,.5,.3),glass:new T.MeshStandardMaterial({color:0x658784,roughness:.18,metalness:.2,transparent:true,opacity:.63,depthWrite:false,side:T.DoubleSide})};
 const box=(p,w,h,d,x,y,z,m=mats.steel)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);p.add(o);return o;};
 const beam=(p,a,b,w=.1,d=w,m=mats.steel)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av),o=box(p,w,delta.length(),d,0,0,0,m);o.position.copy(av).add(bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;};
 const surface=(p,rows,m)=>{const n=rows[0].length,vertices=rows.flat(2),index=[];for(let j=0;j<rows.length-1;j++)for(let i=0;i<n-1;i++){const a=j*n+i;index.push(a,a+1,a+n,a+1,a+n+1,a+n);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(index);g.computeVertexNormals();const o=new T.Mesh(g,m);p.add(o);return o;};
 function plaque(text,width,x,y,z,parent=shell){const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e8e4d7';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#2d4641';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 45px Barlow, sans-serif';ctx.fillText(text.toUpperCase(),512,64,970);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.userData.stationOwned=true;const o=new T.Mesh(new T.PlaneGeometry(width,width/8),new T.MeshBasicMaterial({map,side:T.DoubleSide}));o.position.set(x,y,z);o.rotation.y=Math.PI;parent.add(o);return o;}

 const reference=referenceFactory({root,shell,mechanical,mats,box,beam,surface,plaque,batch,boardingY,fixedRadius:radius,drawRopes:false,architecture:{hallHalf:7.8,portalHeight,fixedFrameHalf:radius+2}});
 const core=fixed?reference.fixedCore('delta',role):null;
 reference.build(style,length);
 if(style==='princesse'){
  // Continue the native outer decks to the enclosed rear service entrance.
  for(const side of [-1,1]){box(mechanical,2.6,.35,length+5.8-deckEnd,side*6.5,boardingY-.175,(length+5.8+deckEnd)/2,mats.concrete);box(mechanical,2.6,.35,2,side*6.5,boardingY-.175,-1,mats.concrete);box(mechanical,7.8-deckOuter,.35,deckEnd,side*(7.8+deckOuter)/2,boardingY-.175,deckEnd/2,mats.concrete);}
  box(mechanical,2.8,.35,length-2.8,0,boardingY-.175,(length-6.8)/2,mats.concrete);
  box(mechanical,15.6,.35,1.3,0,boardingY-.175,length+5.15,mats.concrete);
 }
 if(style==='bouquetin')box(mechanical,13.9,.35,1.4,0,.0525,12.4,mats.concrete);
 batch(shell);batch(mechanical,new Set([...(core?.pulleys||[]),...(core?.motorRotors||[])]));
 return{root,roof:shell,mechanics:mechanical,pulleys:core?.pulleys||[],motorRotors:core?.motorRotors||[],rollers:[],fixedGrip:fixed,allowAccess:true,trackY:5.2};
}
function support(model,groundAt){
 model.root.updateWorldMatrix(true,true);
 const style=model.root.userData.stationStyle,F=model.root.userData.frameHalf||4.2;
 const points=style==='faron'?[[9.5,-12],[9.5,15],[-9.5,-12],[-9.5,15],[16.2,-4.6],[16.2,11.4],[10,3]]:style==='princesse'?[[-7.8,-2],[7.8,-2],[-7.8,15],[7.8,15],[-7.8,31.8],[7.8,31.8]]:style==='delta'?[[-F,-5],[-F,5],[F,-5],[F,5],[-F-2.1,2]]:[[-7.05,-10],[-7.05,0],[-7.05,10.5],[7.05,-10],[7.05,0],[7.05,10.5]];
 const material=new T.MeshStandardMaterial({color:0xb9b9ab,roughness:1});
 for(const [x,z]of points)window.LiftCoFoundations.create(T,{parent:model.root,x,z,top:0,width:style==='faron'?1.6:1.3,depth:1.8,groundAt:(x,z)=>{const p=model.root.localToWorld(new T.Vector3(x,0,z));return groundAt(p.x,p.z)-p.y;},material});
}
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
function batch(root,keep=new Set()){
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),groups=new Map(),remove=[];
 root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||!visible(o))return;for(let p=o;p&&p!==root;p=p.parent)if(keep.has(p))return;const geometry=o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));if(!o.material.map)geometry.deleteAttribute('uv');geometry.deleteAttribute('color');if(!geometry.index){const indices=Array.from({length:geometry.attributes.position.count},(_,i)=>i);geometry.setIndex(indices);}const key=o.material.uuid;if(!groups.has(key))groups.set(key,{material:o.material,geometries:[]});groups.get(key).geometries.push(geometry);remove.push(o);});
 for(const {material,geometries}of groups.values()){const merged=mergeGeometries(geometries);if(!merged)throw Error('Station mesh batching failed');const mesh=new T.Mesh(merged,material);mesh.castShadow=!material.transparent;mesh.receiveShadow=true;root.add(mesh);geometries.forEach(g=>g.dispose());}remove.forEach(o=>{o.removeFromParent();o.geometry.dispose();});
}
window.LiftCoStationArchitecture={create,support};
