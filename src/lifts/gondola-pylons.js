// Standard gondola pylon, shared by straight and passenger-mid-station lifts.
window.LiftCoGondolaPylons={createFactory(THREE){
  const towerM = new THREE.MeshStandardMaterial({ color: 0x9aa5a7, metalness: 0.55, roughness: 0.47 });
  const wheelM = new THREE.MeshStandardMaterial({ color: 0x2c313a, metalness: 0.55, roughness: 0.35 });
  // A single grooved sheave is centred on each rope, rather than two offset
  // rows with the rope floating between them. The groove's running radius is .34 m.
  const rimProfile=[[.12,-.16],[.34,-.16],[.38,-.13],[.38,-.07],[.34,-.045],
    [.34,.045],[.38,.07],[.38,.13],[.34,.16],[.12,.16]];
  const wheelG=new THREE.LatheGeometry(rimProfile.map(([r,x])=>new THREE.Vector2(r,x)),18);
  wheelG.rotateZ(Math.PI/2);
  const hubG=new THREE.CylinderGeometry(.12,.12,.4,10);hubG.rotateZ(Math.PI/2);
  const axleG=new THREE.CylinderGeometry(.055,.055,.68,8);axleG.rotateZ(Math.PI/2);
  const contactRadius=.34+.055;
  const platformM=new THREE.MeshStandardMaterial({color:0x667578,metalness:.6,roughness:.6});
  const rimM=new THREE.MeshStandardMaterial({color:0xd1d5ce,metalness:.65,roughness:.35});
  const darkM=new THREE.MeshStandardMaterial({color:0x4b585d,metalness:.6,roughness:.5});
  const concreteM=new THREE.MeshStandardMaterial({color:0x92948a,roughness:1});
  const silverHubG=new THREE.CylinderGeometry(.27,.27,.35,14);silverHubG.rotateZ(Math.PI/2);

 function create({parent:root,z=0,ropeY,ground,neighbourGap,sideX,compression=false,support={},towerDef=null,fixedFoot=null,groundAt:terrainY,cableAt:cableY,preview=false,lightFixtures=null,lightingRoot=root,night:towerNight=0,ropeContactRadius=contactRadius}){
  const bottom=ground-.25,sign=compression?1:-1,floorY=ropeY-bottom-1.22,headY=ropeY-bottom+2.85,LIFT={sideX},towerWheels=[],holdDownPairs=[];
    const tower=new THREE.Group();tower.position.set(0,bottom,z);
    const deckHalf=Math.min(1.45,Math.max(.45,(neighbourGap-.25)/2));
    tower.userData={number:support.number,towerId:towerDef?.id,compression};
    function box(w,h,d,x,y,z,material=towerM){
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;tower.add(mesh);return mesh;
    }
    function bar(a,b,width=.09,depth=width,material=towerM){
      const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,delta.length(),depth),material);
      mesh.position.copy(start).add(end).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());mesh.castShadow=true;tower.add(mesh);return mesh;
    }
    function girder(a,b,width=.24,depth=.26){
      const mesh=bar(a,b,width,depth,darkM);
      for(const side of [-1,1]){
        const flange=new THREE.Mesh(new THREE.BoxGeometry(width*1.6,mesh.geometry.parameters.height,.045),towerM);
        flange.position.z=side*depth/2;mesh.add(flange);
      }
      return mesh;
    }
    // Columns pivot on their fixed individual or shared foundation; heads follow the cable.
    const column=window.LiftCoTowerMast.create(THREE,{parent:tower,headY:floorY,groundAt:(x,dz)=>terrainY(x,z+dz)-bottom,along:towerDef?.leanAlong??0,across:0,footOverride:fixedFoot,foundation:!support.sharedFoundation,steel:towerM,concrete:concreteM,dark:darkM});
    tower.userData.columnFoot=column.foot;
    // Reference 1: a grating platform, perimeter handrails and a ladder on the mast.
    for(const x of [-2.25,2.25])bar([x,floorY-.12,-deckHalf-.10],[x,floorY-.12,deckHalf+.10],.14,.18,darkM);
    for(const zz of [-deckHalf,deckHalf])bar([-2.3,floorY-.12,zz],[2.3,floorY-.12,zz],.14,.18,darkM);
    for(let x=-2.2;x<=2.21;x+=.22)box(.11,.04,2*deckHalf,x,floorY,0,platformM);
    for(const x of [-2.25,2.25]){
      for(const zz of [-deckHalf,0,deckHalf])bar([x,floorY,zz],[x,floorY+1.02,zz],.045);
      for(const h of [.5,1.02])bar([x,floorY+h,-deckHalf],[x,floorY+h,deckHalf],.045);
    }
    for(const zz of [-deckHalf,deckHalf])for(const side of [-1,1]){
      bar([side*.5,floorY,zz],[side*.5,floorY+1.02,zz],.045);
      for(const h of [.5,1.02])bar([side*.5,floorY+h,zz],[side*2.25,floorY+h,zz],.045);
    }
    // Wide trapezoidal overhead frame, with identical suspension arms on both sides.
    for(const side of [-1,1]){
      girder([side*2.05,floorY-.05,0],[side*3.95,headY,0],.24,.29);
      bar([side*.55,floorY-.5,0],[side*2.1,floorY-.1,0],.12,.16,darkM);
    }
    girder([-4.35,headY,0],[4.35,headY,0],.27,.3);
    // Head access rungs and a small central inspection hoop.
    for(const side of [-1,1])bar([side*.37,floorY,.12],[side*.37,headY+.2,.12],.045);
    for(let y=floorY+.3;y<headY;y+=.32)bar([-.37,y,.12],[.37,y,.12],.04);
    for(const side of [1,-1]){
      const nominal=support.long?8:6,bankHalf=Math.min((nominal-1)*.84/2,Math.max(.40,(neighbourGap-.80)/2)),count=Math.max(2,Math.min(nominal,2*Math.floor((2*bankHalf/.80+1)/2))),wheelPitch=2*bankHalf/(count-1),frameOffset=-side*.38,sx=side*LIFT.sideX,beamPoints=[],axlePoints=[],wheelStates=[];
      const frame=new THREE.Group();frame.position.set(sx,0,0);tower.add(frame);
      for(let k=0;k<count;k++){
        const contactZ=z+(k-(count-1)/2)*wheelPitch;
        const slope=(cableY(contactZ+.025,side)-cableY(contactZ-.025,side))/.05;
        const normalY=1/Math.hypot(1,slope),normalZ=-slope*normalY;
        const contactY=cableY(contactZ,side);
        const cy=contactY+sign*ropeContactRadius*normalY-bottom;
        const cz=contactZ+sign*ropeContactRadius*normalZ-z;
        // Sibling meshes under a non-rendered rotor: hiding a source mesh for
        // instancing must not hide the hub and spokes through parent visibility.
        const wheel=new THREE.Group();wheel.position.set(0,cy,cz);frame.add(wheel);
        const rim=new THREE.Mesh(wheelG,wheelM);rim.castShadow=true;wheel.add(rim);
        const hub=new THREE.Mesh(silverHubG,rimM);wheel.add(hub);
        const centre=new THREE.Mesh(hubG,darkM);wheel.add(centre);
        const spoke=new THREE.Mesh(new THREE.BoxGeometry(.36,.5,.045),darkM);wheel.add(spoke);
        const axle=new THREE.Mesh(axleG,towerM);axle.position.copy(wheel.position);frame.add(axle);
        const beamPoint=new THREE.Vector3(frameOffset,contactY-bottom-.75,contactZ-z);
        const axlePoint=new THREE.Vector3(frameOffset,cy,cz);beamPoints.push(beamPoint);axlePoints.push(axlePoint);
        const delta=beamPoint.clone().sub(axlePoint);
        const mount=new THREE.Mesh(new THREE.BoxGeometry(.1,delta.length(),.14),towerM);
        mount.position.copy(axlePoint).add(beamPoint).multiplyScalar(.5);mount.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());frame.add(mount);
        const state={m:wheel,dir:(side>0?-1:1)*(compression?-1:1),compression,side,contactZ,
          restY:cy,axle,mount,beamPoint,axlePoint,mountLength:mount.geometry.parameters.height};
        towerWheels.push(state);wheelStates.push(state);
      }
      // Long, box-section bogie beams and articulated pairs, as in the reference.
      for(let k=1;k<count;k++){
        const a=beamPoints[k-1],b=beamPoints[k],delta=b.clone().sub(a);
        const mesh=new THREE.Mesh(new THREE.BoxGeometry(.2,.24,delta.length()+.08),towerM);
        mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.normalize());frame.add(mesh);
      }
      for(let k=0;k<count;k+=2){
        const a=axlePoints[k],b=axlePoints[k+1],delta=b.clone().sub(a);
        const pair=new THREE.Mesh(new THREE.BoxGeometry(.13,.15,delta.length()+.15),platformM);
        pair.position.copy(a).add(b).multiplyScalar(.5);pair.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.normalize());frame.add(pair);
        if(compression)holdDownPairs.push({mesh:pair,a:wheelStates[k],b:wheelStates[k+1],length:pair.geometry.parameters.depth});
        const pivot=new THREE.Mesh(hubG,rimM);pivot.scale.set(.65,.65,.65);pivot.position.copy(beamPoints[k]).add(beamPoints[k+1]).multiplyScalar(.5);frame.add(pivot);
      }
      const linkX=sx+frameOffset,linkY=ropeY-bottom-.75;
      girder([linkX,linkY,0],[linkX,headY,0],.14,.18);
      for(const zz of [-.65,.65])bar([linkX,linkY,0],[linkX,headY-.4,zz],.07);
    }
    // Two downward floodlights, one on each side of the pylon crosshead.
    for(const side of [-1,1]){
      const x=side*4.05,y=headY-.28;
      bar([x,headY,0],[x,y,.45],.065);
      const lamp=new THREE.Group();lamp.position.set(x,y,.45);tower.add(lamp);
      const target=new THREE.Object3D();target.position.set(side*4.8,terrainY(side*4.8,z+2)-bottom+.1,2);tower.add(target);
      lamp.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),target.position.clone().sub(lamp.position).normalize());
      const housing=new THREE.Mesh(new THREE.BoxGeometry(.66,.36,.2),darkM);housing.castShadow=true;lamp.add(housing);
      const lensMaterial=new THREE.MeshStandardMaterial({color:0xf0e8d5,emissive:0xffdf9f,emissiveIntensity:towerNight*3,roughness:.35});
      const lens=new THREE.Mesh(new THREE.BoxGeometry(.54,.25,.025),lensMaterial);lens.position.z=.112;lamp.add(lens);
      if(!preview&&lightFixtures)lightFixtures.push({node:lamp,target,root:lightingRoot,lensMaterial});
    }
    root.add(tower);
  const delta=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),axis=new THREE.Vector3(0,0,1);
  return{root:tower,wheels:towerWheels,pairs:holdDownPairs,updateHoldDown(points){
   for(const w of towerWheels){if(!w.compression)continue;let lift=0;for(const p of points){if(Math.abs(p.x-w.side*sideX)>.65)continue;const t=Math.max(0,Math.min(1,(Math.abs(p.z-w.contactZ)-.28)/(.97)));lift=Math.max(lift,.14*(1-t*t*(3-2*t)));}w.m.position.y=w.axle.position.y=w.axlePoint.y=w.restY+lift;delta.subVectors(w.beamPoint,w.axlePoint);w.mount.position.copy(w.axlePoint).add(w.beamPoint).multiplyScalar(.5);w.mount.scale.y=delta.length()/w.mountLength;w.mount.quaternion.setFromUnitVectors(up,delta.normalize());}
   for(const pair of holdDownPairs){const a=pair.a.axlePoint,b=pair.b.axlePoint;delta.subVectors(b,a);pair.mesh.position.copy(a).add(b).multiplyScalar(.5);pair.mesh.scale.z=(delta.length()+.15)/pair.length;pair.mesh.quaternion.setFromUnitVectors(axis,delta.normalize());}
  }};
 }
 return{create,materials:{concrete:concreteM,dark:darkM}};
}};
