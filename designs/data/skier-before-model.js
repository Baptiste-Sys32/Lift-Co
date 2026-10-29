/* Original V5 winter clothing. Driven joints, seat offsets and contact geometry stay authoritative. */
window.LiftCoGuestModelBefore=(()=>{
 'use strict';
 const caches=new WeakMap();
 function library(T){
  if(caches.has(T))return caches.get(T);
  function merge(parts){
   const positions=[],normals=[],colors=[];
   for(const [source,color]of parts){
    const g=source.index?source.toNonIndexed():source,c=new T.Color(color),p=g.attributes.position,n=g.attributes.normal;
    for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));colors.push(c.r,c.g,c.b);}
    if(g!==source)g.dispose();source.dispose();
   }
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeBoundingBox();g.computeBoundingSphere();return g;
  }
  const lathe=(profile,segments=10)=>new T.LatheGeometry(profile.map(([y,r])=>new T.Vector2(r,y)),segments);
  function seam(points,width=.006){
   const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),samples=curve.getPoints(8),positions=[],indices=[];
   for(let i=0;i<samples.length;i++){
    const a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],side=new T.Vector3(-(b.y-a.y),b.x-a.x,0).normalize().multiplyScalar(width);
    for(const sign of [1,-1])positions.push(samples[i].x+side.x*sign,samples[i].y+side.y*sign,samples[i].z);
    if(i<samples.length-1){const at=i*2;indices.push(at,at+1,at+2,at+1,at+3,at+2);}
   }
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
  }
  // Rounded baffles form the silhouette, including the back; no stacked floating rings.
  const coat=lathe([[-.40,0],[-.40,.23],[-.37,.28],[-.31,.31],[-.24,.315],[-.20,.284],[-.16,.315],[-.08,.333],[.01,.326],[.05,.289],[.10,.327],[.19,.34],[.27,.315],[.34,.25],[.37,.18],[.44,.17],[.46,0]]);coat.scale(1,1,.83);
  const collar=lathe([[.36,.165],[.42,.185],[.53,.175],[.56,.155],[.56,.135],[.48,.14]]);collar.scale(1,1,.90);
  const hem=lathe([[-.40,.23],[-.39,.267],[-.365,.282]]);hem.scale(1,1,.83);
  const zipper=seam([[0,-.37,.239],[0,-.23,.267],[0,-.18,.26],[0,0,.277],[0,.07,.262],[0,.23,.27],[0,.35,.175],[0,.455,.158]],.0065);
  const pockets=[-1,1].map(side=>seam([[side*.15,-.13,.256],[side*.18,-.11,.247],[side*.21,-.08,.229]],.007));
  const pull=new T.SphereGeometry(.015,6,4);pull.scale(.65,1.6,.45);pull.translate(0,.30,.226);
  const jacket=merge([[coat,0xffffff],[collar,0xbac8c3],[hem,0xd0d9d8],[zipper,0xe4ddd0],[pockets[0],0x829493],[pockets[1],0x829493],[pull,0xd7bd8d]]);

  function goggleShape(){
   const s=new T.Shape();s.moveTo(-.18,.086);s.quadraticCurveTo(0,.108,.18,.086);s.quadraticCurveTo(.25,.08,.244,.005);s.quadraticCurveTo(.237,-.082,.15,-.087);s.quadraticCurveTo(.069,-.087,.036,-.044);s.quadraticCurveTo(0,-.011,-.036,-.044);s.quadraticCurveTo(-.069,-.087,-.15,-.087);s.quadraticCurveTo(-.237,-.082,-.244,.005);s.quadraticCurveTo(-.25,.08,-.18,.086);return s;
  }
  function goggles(inset=false){
   const g=new T.ExtrudeGeometry(goggleShape(),{depth:inset?.011:.020,bevelEnabled:true,bevelSize:inset?.003:.006,bevelThickness:.003,bevelSegments:1,curveSegments:2});
   if(inset)g.scale(.885,.76,1);
   const p=g.attributes.position;
   for(let i=0;i<p.count;i++){const x=p.getX(i),z=(inset?.228:.207)+.037*(1-(x/.25)**2)+p.getZ(i);p.setXYZ(i,x,p.getY(i)+.012,z);}
   g.computeVertexNormals();return g;
  }
  const heads=[0xeac6a3,0xc48c67,0x875940,0xf0d7bb].map(skin=>{
   // The cap covers the open scalp. This avoids adding height above the established head anchor.
   const face=new T.SphereGeometry(.248,12,8,0,Math.PI*2,.68,Math.PI-.68);face.scale(1,.94,.96);
   const strap=new T.TorusGeometry(.245,.021,4,16);strap.rotateX(Math.PI/2);strap.scale(1,1,.96);strap.translate(0,.035,0);
   const nose=new T.SphereGeometry(.031,7,5);nose.scale(.8,1,1);nose.translate(0,-.066,.239);
   return merge([[face,skin],[nose,skin],[strap,0x283641],[goggles(),0x28313a],[goggles(true),0xd9a65b]]);
  });
  const hats=new Map();
  function hat(color){
   const key=color.getHex();if(hats.has(key))return hats.get(key);
   const dye=color.clone().multiplyScalar(.78);
   const dome=lathe([[-.015,.267],[.015,.278],[.09,.268],[.17,.235],[.22,.16],[.24,.065],[.242,0]]);
   dome.scale(1,1,.96);
   const band=lathe([[-.042,.252],[-.035,.284],[-.005,.29],[.025,.284],[.033,.264]]);band.scale(1,1,.96);
   const pom=new T.SphereGeometry(.065,8,6);pom.translate(0,.28,-.007);
   const g=merge([[dome,dye],[band,0xf1d193],[pom,dye]]);hats.set(key,g);return g;
  }
  const sleeve=new T.CapsuleGeometry(.115,.18,3,7),forearm=new T.CapsuleGeometry(.099,.17,3,7);
  const mittens=[-1,1].map(side=>{
   const palm=new T.SphereGeometry(.10,8,5);palm.scale(.90,1.1,1.02);
   const thumb=new T.SphereGeometry(.043,6,4);thumb.scale(1,1.22,1);thumb.translate(-side*.068,-.005,.024);
   return merge([[palm,0xffffff],[thumb,0xffffff]]);
  });
  const thigh=new T.CylinderGeometry(.105,.095,.54,8);thigh.rotateX(Math.PI/2);
  const shin=new T.CylinderGeometry(.092,.077,.56,8);
  const leg=new T.CylinderGeometry(.115,.10,.70,5),thighDetail=new T.CylinderGeometry(.115,.10,1,6),shinDetail=new T.CylinderGeometry(.10,.077,1,6),knee=new T.SphereGeometry(.10,7,5);
  const data={jacket,heads,hat,sleeve,forearm,mittens,thigh,shin,leg,thighDetail,shinDetail,knee};caches.set(T,data);return data;
 }
 function dress(T,s,{helmet}){
  const a=library(T),replace=(mesh,geometry)=>{mesh.geometry.dispose();mesh.geometry=geometry;};
  replace(s.torso,a.jacket);s.torso.material.vertexColors=true;s.torso.material.needsUpdate=true;
  replace(s.head,a.heads[(s.ticket>>>0)%a.heads.length]);s.head.material.color.set(0xffffff);s.head.material.vertexColors=true;s.head.material.needsUpdate=true;
  replace(helmet,a.hat(s.torso.material.color));helmet.material.color.set(0xffffff);helmet.material.vertexColors=true;helmet.material.roughness=.88;helmet.material.needsUpdate=true;
  for(const {arm,elbow,side}of s.arms){
   replace(arm.children[0],a.sleeve);replace(elbow.children[0],a.forearm);replace(elbow.children[1],a.mittens[side>0?1:0]);
  }
  for(const part of s.skiRig.parts){replace(part.thigh,a.thighDetail);replace(part.shin,a.shinDetail);replace(part.kneecap,a.knee);}
  for(let i=0;i<s.skiRig.original.children.length;i+=2)replace(s.skiRig.original.children[i],a.leg);
  for(let i=0;i<s.seatedLegs.children.length;i+=3){replace(s.seatedLegs.children[i],a.thigh);replace(s.seatedLegs.children[i+1],a.shin);}
 }
 return{dress};
})();
