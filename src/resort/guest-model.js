/* Original V5 winter clothing. Driven joints, seat offsets and contact geometry stay authoritative. */
window.LiftCoGuestModel=(()=>{
 'use strict';
 const caches=new WeakMap();
 const styles=Object.freeze([
  {id:'spruce',name:'Spruce',jacket:0x367c75,pants:0x263c45,headwear:'helmet',hat:0xe5e8df,band:0x34464e,cut:'trim'},
  {id:'ember',name:'Ember',jacket:0xc66b45,pants:0x29313e,headwear:'pom',hat:0x384f62,band:0xe4ca9a,cut:'roomy'},
  {id:'alpine',name:'Alpine',jacket:0x739db3,pants:0x24364b,headwear:'helmet',hat:0x253d50,band:0xd0d8d9,cut:'regular'},
  {id:'berry',name:'Berry',jacket:0x805271,pants:0xc2c4b6,headwear:'beanie',hat:0xe7dbbe,band:0x8f566f,cut:'trim'}
 ].map(Object.freeze));
 function appearanceKey(ticket){let n=(ticket>>>0)^0x9e3779b9;n=Math.imul(n^(n>>>16),0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);return(n^(n>>>16))>>>0;}
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
  // Cut the front of the knit brim above the frame, while keeping coverage at the ears/back.
  function fitBrim(g,band=false){
   const p=g.attributes.position;
   for(let i=0;i<p.count;i++){
    const y=p.getY(i),front=T.MathUtils.smoothstep(p.getZ(i),0,.12),fade=band?1:1-T.MathUtils.smoothstep(y,.025,.242);
    p.setY(i,y+.135*front*fade);p.setZ(i,p.getZ(i)*(1-.16*front*fade));
   }
   g.computeVertexNormals();return g;
  }
  const coats=new Map([['regular',jacket]]);
  function coatCut(cut){
   if(coats.has(cut))return coats.get(cut);
   const g=jacket.clone(),p=g.attributes.position,n=g.attributes.normal,[width,depth]=cut==='roomy'?[1.035,1.03]:[.965,.985];
   for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),t=T.MathUtils.clamp((y-.28)/.09,0,1),w=1-t*t*(3-2*t),dw=-6*t*(1-t)/.09;
    const sx=1+(width-1)*w,sz=1+(depth-1)*w,nx=n.getX(i)/sx,nz=n.getZ(i)/sz,ny=n.getY(i)-x*(width-1)*dw*nx-z*(depth-1)*dw*nz,len=Math.hypot(nx,ny,nz);
    p.setXYZ(i,x*sx,y,z*sz);n.setXYZ(i,nx/len,ny/len,nz/len);
   }
   g.computeBoundingBox();g.computeBoundingSphere();coats.set(cut,g);return g;
  }
  const hats=new Map();
  function hat(style){
   const key=[style.headwear,style.hat,style.band].join(':');if(hats.has(key))return hats.get(key);
   const dye=new T.Color(style.hat),bandColor=new T.Color(style.band);
   if(style.headwear==='helmet'){
    const shell=lathe([[-.032,.255],[-.005,.278],[.07,.273],[.15,.230],[.215,.135],[.242,.03],[.244,0]],12);shell.scale(1,1,.96);
    const edge=lathe([[-.04,.252],[-.032,.274],[-.012,.281],[.001,.271]],12);edge.scale(1,1,.96);
    const pads=[-1,1].map(side=>{const g=new T.SphereGeometry(.056,8,5);g.scale(.50,1.3,1.15);g.translate(side*.245,-.076,-.045);return g;});
    const g=merge([[fitBrim(shell),dye],[fitBrim(edge,true),bandColor],[pads[0],0x34414b],[pads[1],0x34414b]]);hats.set(key,g);return g;
   }
   const dome=lathe([[-.015,.267],[.015,.278],[.09,.268],[.17,.235],[.22,.16],[.24,.065],[.242,0]]);
   dome.scale(1,1,.96);
   const band=lathe([[-.042,.252],[-.035,.284],[-.005,.29],[.025,.284],[.033,.264]]);band.scale(1,1,.96);
   const pom=new T.SphereGeometry(.065,8,6);pom.translate(0,.28,-.007);
   const parts=[[fitBrim(dome),dye],[fitBrim(band,true),bandColor]];if(style.headwear==='pom')parts.push([pom,dye]);else pom.dispose();
   const g=merge(parts);hats.set(key,g);return g;
  }
  const sleeve=new T.CapsuleGeometry(.115,.18,3,7),forearm=new T.CapsuleGeometry(.099,.17,3,7);
  const mittens=[-1,1].map(side=>{
   const palm=new T.SphereGeometry(.10,8,5);palm.scale(.90,1.1,1.02);
   const thumb=new T.SphereGeometry(.043,6,4);thumb.scale(1,1.22,1);thumb.translate(-side*.068,-.005,.024);
   return merge([[palm,0xffffff],[thumb,0xffffff]]);
  });
  const thigh=new T.CylinderGeometry(.105,.095,.54,8);thigh.rotateX(Math.PI/2);
  // The seated visible shin slopes into the boot shaft, rather than ending behind it.
  const shin=new T.CylinderGeometry(.092,.095,.55,8);shin.translate(0,.005,0);
  for(let i=0;i<shin.attributes.position.count;i++){const y=shin.attributes.position.getY(i);shin.attributes.position.setZ(i,shin.attributes.position.getZ(i)+(.28-y)/.55*.04);}
  shin.computeVertexNormals();
  const leg=new T.CylinderGeometry(.115,.10,.70,5),thighDetail=new T.CylinderGeometry(.115,.10,1,6),shinDetail=new T.CylinderGeometry(.10,.095,.86,6).translate(0,.07,0),knee=new T.SphereGeometry(.10,7,5);
  // Tuck only the upper boot shaft under the trouser cuff. Sole, toe and contact vertices stay fixed.
  const boot=window.LiftCoGuestBoots.geometry(T),bp=boot.attributes.position;
  for(let i=0;i<bp.count;i++){
   const amount=T.MathUtils.smoothstep(bp.getY(i),.052,.10),z=bp.getZ(i);
   bp.setX(i,bp.getX(i)*(1-.16*amount));bp.setZ(i,z*(1-(z>0?.61:.20)*amount));
   if(bp.getY(i)>.052)bp.setY(i,.052+(bp.getY(i)-.052)*.5);
  }
  boot.computeVertexNormals();boot.computeBoundingBox();boot.computeBoundingSphere();
  const data={jacket,coatCut,heads,hat,sleeve,forearm,mittens,thigh,shin,leg,thighDetail,shinDetail,knee,boot};caches.set(T,data);return data;
 }
 function dress(T,s,{helmet,style}){
  s.seatVisualLift=.15;
  const key=(s.appearanceKey??=appearanceKey(s.ticket)),look=styles.find(look=>look.id===(style||s.outfitStyle))||styles[key%styles.length];s.outfitStyle=look.id;
  const a=library(T),replace=(mesh,geometry)=>{if(mesh.geometry!==geometry){mesh.geometry.dispose();mesh.geometry=geometry;}};
  replace(s.torso,a.coatCut(look.cut));s.torso.material.color.set(look.jacket);s.torso.material.vertexColors=true;s.torso.material.needsUpdate=true;
  replace(s.head,a.heads[(key>>>8)%a.heads.length]);s.head.material.color.set(0xffffff);s.head.material.vertexColors=true;s.head.material.needsUpdate=true;
  replace(helmet,a.hat(look));helmet.material.color.set(0xffffff);helmet.material.vertexColors=true;helmet.material.roughness=look.headwear==='helmet'?.54:.88;helmet.material.needsUpdate=true;
  // Headwear is a cosmetic child of the driven head, so it cannot cut through turning goggles.
  if(helmet.parent!==s.head){helmet.position.sub(s.head.position);s.head.add(helmet);}
  const originalBoot=s.bootGeometry;s.g.traverse(mesh=>{if(mesh.geometry===originalBoot)mesh.geometry=a.boot;});s.bootGeometry=a.boot;if(originalBoot!==a.boot)originalBoot.dispose();
  for(const {arm,elbow,side}of s.arms){
   arm.children[0].material.color.set(look.jacket);replace(arm.children[0],a.sleeve);replace(elbow.children[0],a.forearm);replace(elbow.children[1],a.mittens[side>0?1:0]);
  }
  s.skiRig.parts[0].thigh.material.color.set(look.pants);
  for(const part of s.skiRig.parts){replace(part.thigh,a.thighDetail);replace(part.shin,a.shinDetail);replace(part.kneecap,a.knee);}
  for(let i=0;i<s.skiRig.original.children.length;i+=2)replace(s.skiRig.original.children[i],a.leg);
  for(let i=0;i<s.seatedLegs.children.length;i+=3){replace(s.seatedLegs.children[i],a.thigh);replace(s.seatedLegs.children[i+1],a.shin);}
 }
 return{dress,styles};
})();
