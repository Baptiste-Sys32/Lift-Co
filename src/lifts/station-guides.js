// Compact, three-sheave station receptors. Large approach trains belong to the
// player's separate towers; the terminal itself has no automatic extra pole.
window.LiftCoStationGuides={create(T,{root,layout,half,railX,fixedGrip=false,ropeRadius=.055}){
 const wheelParts=window.LiftCoWheelParts?.createFactory(T);
 const group=new T.Group();group.name='Station cable guides';root.add(group);
 const steel=new T.MeshStandardMaterial({color:fixedGrip?0x315b55:0x819092,roughness:.5,metalness:.55});
 const rubber=new T.MeshStandardMaterial({color:0x293337,roughness:.7,metalness:.2});
 const alloy=new T.MeshStandardMaterial({color:0xc1cbc6,roughness:.4,metalness:.65,side:T.DoubleSide});
 const wheelG=new T.LatheGeometry([[.11,-.13],[.31,-.13],[.35,-.1],[.35,-.065],[.31,-.04],[.31,.04],[.35,.065],[.35,.1],[.31,.13],[.11,.13]].map(([r,y])=>new T.Vector2(r,y)),18);wheelG.rotateZ(Math.PI/2);
 const hubG=new T.CylinderGeometry(.13,.13,.38,12);hubG.rotateZ(Math.PI/2);
 const wheels=[],heads=[];
 function beam(a,b,width=.15,depth=.2){const delta=b.clone().sub(a),m=new T.Mesh(new T.BoxGeometry(width,depth,delta.length()),steel);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),delta.normalize());m.castShadow=true;group.add(m);return m;}
 function point(s,x=0,y=0){return new T.Vector3(x,layout.heightAt(s)+y,half-s);}
 for(const end of ['start','end']){
  const length=layout.guideLengths[end],start=end==='start'?0:layout.length,dir=end==='start'?1:-1;
  const curvature=layout.heightAt(start+dir*length*.75)-layout.heightAt(start+dir*length*.25);
  const sign=curvature>=0?1:-1,count=3;
  heads.push({end,length,count,compression:sign>0});
  for(const side of [-1,1]){
   const frameX=side*(railX+.33),frame=[],contacts=[];
   for(let k=0;k<count;k++){
    const distance=start+dir*(.3+(length-.6)*k/(count-1)),slope=layout.slopeAt(distance),normalY=1/Math.hypot(1,slope);
    const contact=point(distance,side*railX),wheel=new T.Group();
    if(wheelParts)wheelParts.fill(wheel,{radius:.31});else{const tyre=new T.Mesh(wheelG,rubber);tyre.castShadow=true;wheel.add(tyre);wheel.add(new T.Mesh(hubG,alloy));wheel.add(new T.Mesh(new T.BoxGeometry(.39,.4,.04),steel));}
    wheel.position.copy(contact).add(new T.Vector3(0,sign*(.31+ropeRadius)*normalY,sign*(.31+ropeRadius)*slope*normalY));
    const carrier=new T.Group();group.add(carrier);
    carrier.add(wheel);
    const mount=new T.Vector3(frameX,wheel.position.y+sign*.19,wheel.position.z);frame.push(mount);contacts.push(wheel.position.clone());
    const axle=beam(new T.Vector3(side*(railX-.18),wheel.position.y,wheel.position.z),new T.Vector3(frameX,wheel.position.y,wheel.position.z),.09,.09);carrier.add(axle);
    const anchor=mount.clone(),axleEnd=new T.Vector3(frameX,wheel.position.y,wheel.position.z);
    const slider=sign>0?beam(anchor,axleEnd,.07,.08):null;
    wheels.push({m:wheel,dir:(side>0?-1:1)*(sign>0?-1:1),radius:.31,
      compression:sign>0,side,contactZ:contact.z,carrier,anchor,axleEnd,slider,restY:axleEnd.y});
   }
   for(let k=1;k<frame.length;k++)beam(frame[k-1],frame[k],.13,.2);
   // The approved study's swept receptors, fitted to the live rope contacts.
   // Work in a local frame pointing out of each station, then mirror the upper
   // terminal back onto the lift axis without changing its cable height.
   const stationZ=half-start,base=layout.heightAt(start);
   const local=contacts.map(p=>({z:dir*(p.z-stationZ),y:p.y}));
   const [first,middle,last]=local,tip=layout.heightAt(start+dir*length)+sign*.7;
   const anchor=point(start-dir*1.1,frameX,sign*.28);
   beam(anchor,frame[0],.22,.3);
   for(const flank of [-1,1]){
    const shape=new T.Shape();shape.moveTo(.45,base+sign*.1);shape.lineTo(.45,base+sign*.62);
    shape.bezierCurveTo(-.2,base+sign*.82,-.8,middle.y+sign*.3,middle.z,middle.y+sign*.3);
    shape.bezierCurveTo(last.z,last.y+sign*.25,-length+.02,tip-sign*.15,-length-.22,tip);
    shape.quadraticCurveTo(-length-.42,tip-sign*.12,-length-.25,tip-sign*.35);
    shape.bezierCurveTo(-length+.2,last.y-sign*.08,-1,first.y-sign*.06,.45,base+sign*.1);shape.closePath();
    const geometry=new T.ExtrudeGeometry(shape,{depth:.075,bevelEnabled:true,bevelSize:.018,bevelThickness:.012,bevelSegments:2,curveSegments:32});
    geometry.applyMatrix4(new T.Matrix4().set(0,0,1,side*railX+flank*.29,0,1,0,0,dir,0,0,stationZ,0,0,0,1));
    const cheek=new T.Mesh(geometry,alloy);cheek.castShadow=true;cheek.receiveShadow=true;group.add(cheek);
   }
  }
 }
 group.userData.heads=heads;
 const delta=new T.Vector3(),axis=new T.Vector3(0,0,1);
 function update(carriers){
  for(const w of wheels){
   if(!w.compression)continue;
   let lift=0;
   for(const c of carriers){
    if(Math.abs(c.g.position.x-w.side*railX)>.65)continue;
    const d=Math.abs(c.g.position.z-w.contactZ),t=Math.max(0,Math.min(1,(d-.28)/.97));
    lift=Math.max(lift,.14*(1-t*t*(3-2*t)));
   }
   w.carrier.position.y=lift;w.axleEnd.y=w.restY+lift;
   delta.subVectors(w.axleEnd,w.anchor);
   w.slider.position.copy(w.anchor).add(w.axleEnd).multiplyScalar(.5);
   w.slider.scale.z=delta.length()/w.slider.geometry.parameters.depth;
   w.slider.quaternion.setFromUnitVectors(axis,delta.normalize());
  }
 }
 return {group,wheels,heads,update};
}};
