/* V5 appearance only. All driven groups, joints and contact points stay in place. */
window.LiftCoGuestModelBefore=(()=>{
 'use strict';
 const caches=new WeakMap();
 function library(T){
  if(caches.has(T))return caches.get(T);
  function merge(parts){const positions=[],normals=[],colors=[];for(const [source,color]of parts){const g=source.index?source.toNonIndexed():source,c=new T.Color(color),p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));colors.push(c.r,c.g,c.b);}if(g!==source)g.dispose();source.dispose();}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeBoundingSphere();return g;}
  const shell=new T.LatheGeometry([[-.37,.20],[-.34,.25],[-.23,.28],[.05,.30],[.24,.33],[.32,.29],[.37,.20]].map(([y,r])=>new T.Vector2(r,y)),10);shell.scale(1,1,.70);
  const jacket=merge([[shell,0xffffff],[new T.CylinderGeometry(.155,.18,.09,10).translate(0,.385,0),0x293b43],[new T.BoxGeometry(.014,.62,.014).translate(0,.015,.216),0xd9e2df],[new T.BoxGeometry(.11,.014,.016).translate(-.16,-.10,.193),0x31434b],[new T.BoxGeometry(.11,.014,.016).translate(.16,-.10,.193),0x31434b]]);
  const heads=[0xeac6a3,0xc48c67,0x875940,0xf0d7bb].map(skin=>{
   const face=new T.SphereGeometry(.225,10,8);face.scale(1,.94,.96);
   const strap=new T.TorusGeometry(.221,.025,4,12);strap.scale(1,.68,1);strap.rotateX(Math.PI/2);strap.translate(0,.015,0);
   const frame=new T.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI);frame.scale(.217,.088,.051);frame.translate(0,.015,.183);
   const lens=new T.SphereGeometry(1,10,6);lens.scale(.189,.063,.039);lens.translate(0,.018,.219);
   return merge([[face,skin],[strap,0x263641],[frame,0x1d2c37],[lens,0xd5a35b]]);
  });
  const helmet=new T.SphereGeometry(.253,10,6,0,Math.PI*2,0,1.65);helmet.scale(1,1,.98);
  const sleeve=new T.CapsuleGeometry(.087,.2,3,7),forearm=new T.CapsuleGeometry(.079,.18,3,7);
  const thigh=new T.CylinderGeometry(.10,.09,.54,7);thigh.rotateX(Math.PI/2);
  const shin=new T.CylinderGeometry(.086,.074,.56,7);
  const data={jacket,heads,helmet,sleeve,forearm,thigh,shin};caches.set(T,data);return data;
 }
 function dress(T,s,{helmet}){
  const a=library(T),replace=(mesh,geometry)=>{mesh.geometry.dispose();mesh.geometry=geometry;};
  replace(s.torso,a.jacket);s.torso.material.vertexColors=true;s.torso.material.needsUpdate=true;
  replace(s.head,a.heads[(s.ticket>>>0)%a.heads.length]);s.head.material.color.set(0xffffff);s.head.material.vertexColors=true;s.head.material.needsUpdate=true;
  replace(helmet,a.helmet);helmet.material.color.copy(s.torso.material.color).multiplyScalar(.72);helmet.material.roughness=.7;
  for(const {arm,elbow}of s.arms){replace(arm.children[0],a.sleeve);replace(elbow.children[0],a.forearm);}
  for(let i=0;i<s.seatedLegs.children.length;i+=3){replace(s.seatedLegs.children[i],a.thigh);replace(s.seatedLegs.children[i+1],a.shin);}
 }
 return{dress};
})();
