// Approved Alpine gondola and rounded terminal design, extracted for reuse.
// Receives Three.js explicitly so it also works from a local file without module fetches.
window.createGondolaLift=function(THREE,{scene,heightAt,definition:def,index=0}) {
  const worldTerrainY=heightAt;
  const cabinScale=1.12; // Preserve the approved shape while allowing 1.8m standing clearance.
  function liftFrame(def){const dx=def.base[0]-def.top[0],dz=def.base[1]-def.top[1];return {length:Math.hypot(dx,dz),angle:Math.atan2(dx,dz),x:(def.base[0]+def.top[0])/2,z:(def.base[1]+def.top[1])/2};}
  function planPoint(def,x,z){const f=liftFrame(def);return new THREE.Vector3(f.x+Math.cos(f.angle)*x+Math.sin(f.angle)*z,0,f.z-Math.sin(f.angle)*x+Math.cos(f.angle)*z);}

  const f=liftFrame(def),half=f.length/2;
  const root=new THREE.Group();root.position.set(f.x,0,f.z);root.rotation.y=f.angle;scene.add(root);
  const terrainY=(x,z)=>{const p=planPoint(def,x,z);return worldTerrainY(p.x,p.z);};
const LIFT = {
  base: new THREE.Vector3(0, 0, half), top: new THREE.Vector3(0, 0, -half),
  sideX: 2.2, cabins: def.cabins, capacity: 4,
  cableSpeed: 6.0, stationSpeed: 1.1, stationLen: 13,
};
LIFT.base.y = terrainY(0, half) + 5.5;
LIFT.top.y = terrainY(0, -half) + 5.5;
const count=Math.max(3,Math.ceil((f.length-40)/85));
const towerZ=def.towers?def.towers.map(d=>half-d):Array.from({length:count},(_,i)=>half-38-i*(f.length-76)/(count-1));
const approachZ = [{ z: half - 10, y: LIFT.base.y }, { z: -half + 10, y: LIFT.top.y }]; // entry pylons: catch the rope, deliver it straight+level into each terminal
const supports = [{ z: half, y: LIFT.base.y }, ...towerZ.map(tz => ({ z: tz, y: terrainY(0, tz) + 7.75 })), ...approachZ.map(a => ({ z: a.z, y: a.y })), { z: -half, y: LIFT.top.y }]
    .sort((p, q) => q.z - p.z); // downhill → uphill order so each span is searched correctly
// Fit the rope to the sampled terrain, accounting for the whole cabin footprint.
for(let pass=0;pass<3;pass++)for(let i=0;i<supports.length-1;i++) {
  const a=supports[i],b=supports[i+1];
  for(let k=1;k<24;k++){
    const t=k/24,z=a.z+(b.z-a.z)*t;
    let ground=-Infinity;
    for(const side of [-1,1])for(const dx of [-1.06*cabinScale,1.06*cabinScale])for(const dz of [-1.1*cabinScale,1.1*cabinScale])ground=Math.max(ground,terrainY(side*LIFT.sideX+dx,z+dz));
    const actual=a.y+(b.y-a.y)*t-Math.sin(t*Math.PI)*.9,deficit=ground+5.2-actual;
    if(deficit>0){const wa=i===0?0:1-t,wb=i+1===supports.length-1?0:t,total=wa+wb;if(total){a.y+=deficit*wa/(total*total);b.y+=deficit*wb/(total*total);}}
  }
}
const towerWheels = []; // spinning sheave wheels, animated at cable speed
{
  // Low capsule terminals: timber fascia, snow lip, glazing and open boarding side.
  const frameM=new THREE.MeshStandardMaterial({color:0x596165,metalness:.5,roughness:.5});
  const platM=new THREE.MeshStandardMaterial({color:0x737b7b,roughness:.95});
  const roofColors=[0x536e7a,0x6b7764,0x8b5e51];
  const roofM=new THREE.MeshStandardMaterial({color:roofColors[index],roughness:.7});
  const timberM=new THREE.MeshStandardMaterial({color:0x8c7155,roughness:.9});
  const snowM=new THREE.MeshStandardMaterial({color:0xf5f0e6,roughness:.95});
  const glassM=new THREE.MeshStandardMaterial({color:0x6b8d94,transparent:true,opacity:.48,roughness:.22,depthWrite:false});
  function capsuleGeometry(width,length,depth) {
    const r=width/2,straight=length/2-r,shape=new THREE.Shape();
    shape.moveTo(-r,-straight);shape.lineTo(-r,straight);
    shape.absarc(0,straight,r,Math.PI,0,true);shape.lineTo(r,-straight);
    shape.absarc(0,-straight,r,0,-Math.PI,true);
    const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.13,bevelThickness:.13,curveSegments:16});
    geo.rotateX(-Math.PI/2);return geo;
  }
  for(const end of ['base','top']) {
    const p=end==='base'?LIFT.base:LIFT.top,dirM=end==='base'?-1:1;
    const g=new THREE.Group();g.position.set(0,p.y-5,p.z);root.add(g);
    function box(w,h,d,x,y,z,mat) {
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;
    }
    // Wide apron reaches the queue; its outer edge blends into the graded snow pad.
    // Uniform cabin scaling provides 1.91m headroom. Deck and cabin floors align.
    // Side decks meet that floor while the cabin channels remain unobstructed.
    box(13.5,1,18,1.2,0,dirM*1.5,platM);
    box(4,.28,18,5.95,.604,dirM*1.5,platM);
    box(1.6,.28,18,-4.75,.604,dirM*1.5,platM);
    for(const side of [-1,1])box(.5,.28,5,side*3.7,.604,dirM*5,platM);
    // A gentle ramp connects each boarding deck to the graded snow apron.
    const start=dirM*1.5+9,rampEnd=start+6;
    const leftGround=terrainY(4.3,p.z+rampEnd)-(p.y-5)+.04,rightGround=terrainY(7.1,p.z+rampEnd)-(p.y-5)+.04;
    const vertices=[4.3,.744,start,7.1,.744,start,4.3,leftGround,rampEnd,7.1,rightGround,rampEnd,4.3,0,start,7.1,0,start];
    const rampG=new THREE.BufferGeometry();rampG.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));rampG.setIndex([0,2,1,1,2,3,0,4,2,1,3,5]);rampG.computeVertexNormals();
    const ramp=new THREE.Mesh(rampG,platM);ramp.receiveShadow=true;g.add(ramp);
    const fascia=new THREE.Mesh(capsuleGeometry(10.7,19.2,.8),timberM);fascia.position.set(0,5.5,dirM*3);fascia.castShadow=true;g.add(fascia);
    const roof=new THREE.Mesh(capsuleGeometry(11.1,19.6,.25),roofM);roof.position.set(0,6.35,dirM*3);roof.castShadow=roof.receiveShadow=true;g.add(roof);
    const snowLip=new THREE.Mesh(capsuleGeometry(10.7,19.1,.12),snowM);snowLip.position.set(0,6.68,dirM*3);snowLip.receiveShadow=true;g.add(snowLip);
    // Solid rear glazing and short end screens shelter the machinery, leaving +X open.
    box(.12,3.3,10,-4.7,3.4,dirM*2,glassM);
    for(const z of [-2,2,6]){
      box(.18,5.4,.18,-4.8,2.8,dirM*z,frameM);
      box(.16,5.4,.16,4.8,2.8,dirM*z,frameM);
    }
    for(const z of [-2.6,6.6])box(3.4,1.4,.12,-2.8,4.6,dirM*z,glassM);
    // Warm timber slats on the capsule fascia.
    for(let z=-5.4;z<5.5;z+=.7)box(.055,.64,.05,5.38,5.95,dirM*3+z,frameM);
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,.45,24),frameM);wheel.position.y=4.9;g.add(wheel);
    wheel.add(new THREE.Mesh(new THREE.BoxGeometry(4,.14,.32),platM),new THREE.Mesh(new THREE.BoxGeometry(.32,.14,4),platM));
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,1.1,10),platM);hub.position.y=4.9;g.add(hub);LIFT[end+'Wheel']=wheel;
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.2,.12,8,40),platM);ring.rotation.x=Math.PI/2;ring.position.y=5.15;g.add(ring);
    for(const sx of [-LIFT.sideX,LIFT.sideX]) {
      box(.24,.24,10,sx,5.15,dirM*4.5,platM);
      for(const dd of [1.5,4.5,7.5])box(.12,.65,.12,sx,5.6,dirM*dd,frameM);
    }
    // Station name is readable from either side of the lift.
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#eee8d9';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 60px Georgia';ctx.fillText(def.name.toUpperCase(),512,65,970);
    ctx.font='24px Georgia';ctx.fillText((end==='base'?'VALLEY':'MOUNTAIN')+' STATION  /  LIFT CO.',512,126);
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
    for(const side of [-1,1]) {
      const sign=new THREE.Mesh(new THREE.PlaneGeometry(9,.95),new THREE.MeshBasicMaterial({map:tex,transparent:true}));
      sign.position.set(side*5.49,5.95,dirM*3);sign.rotation.y=side*Math.PI/2;g.add(sign);
    }
    // Perimeter fences leave a broad opening at the actual load/unload point.
    const fenceM=new THREE.MeshStandardMaterial({color:0x8a735a,roughness:1});
    function fence(x,z,length,alongZ=true) {
      const count=Math.ceil(length/2);
      for(let j=0;j<=count;j++)box(.13,1.35,.13,x+(alongZ?0:j*length/count),1.284,z+(alongZ?j*length/count:0),fenceM);
      for(const h of [1.084,1.684])box(alongZ?.1:length,.13,alongZ?length:.1,x+(alongZ?0:length/2),h,z+(alongZ?length/2:0),fenceM);
    }
    fence(-6.2,-7,16);fence(7.5,-1,10);
    if(end==='base') {
      // Queue runs on the exterior side and stays clear of the loading gate at z=-4.2.
      fence(3.9,0,12);fence(7.5,9,3.5,false);
    }else fence(4.7,7,3,false);
    // An amber loading lamp and a small entrance marker make the platform legible.
    box(.32,.22,.32,4.8,4.8,dirM*4,new THREE.MeshStandardMaterial({color:0xffcc7e,emissive:0xffba63,emissiveIntensity:.65}));
  }
  // support pillars with real sheave trains (roller assemblies the cable rides on)
  const towerM = new THREE.MeshStandardMaterial({ color: 0x7d8894, metalness: 0.5, roughness: 0.5 });
  const wheelM = new THREE.MeshStandardMaterial({ color: 0x2c313a, metalness: 0.55, roughness: 0.35 });
  const wheelG = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 14);
  wheelG.rotateZ(Math.PI / 2); // axle along x once, so rotation.x spins the sheave visibly
  // line towers + the tall approach pylon (longer train to ease the rope level)
  const allTowers = [
    ...towerZ.map(z => ({ z, topY: supports.find(s=>s.z===z).y+.85, long: false })),
    ...approachZ.map(a => ({ z: a.z, topY: supports.find(s=>s.z===a.z).y+.85, long: true })),
  ];
  for (const { z, topY, long } of allTowers) {
    const botY = terrainY(0, z) - 0.5, h = topY - botY;
    const t = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.62, h, 8), towerM);
    pole.position.y = h / 2; pole.castShadow = true; t.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.55, 1.0), towerM);
    arm.position.y = h - 0.4; arm.castShadow = true; t.add(arm);
    // 2 lines (up/down) × sheave trains, pitched to bisect the rope angle.
    // twin rows with a slot down the middle so cabin hangers pass between the wheels
    const trainLen = long ? 6 : 4, z0 = long ? -2.25 : -1.35;
    for (const sx of [-LIFT.sideX, LIFT.sideX]) {
      const train = new THREE.Group();
      const beam = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, long ? 5.6 : 3.6), towerM);
      train.add(beam);
      for (const xo of [-0.32, 0.32]) for (let k = 0; k < trainLen; k++) {
        const w = new THREE.Mesh(wheelG, wheelM);
        w.position.set(xo, -0.48, z0 + k * 0.9); // wheel tops meet the cable
        w.castShadow = true;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.68, 0.12), towerM);
        w.add(spoke); // makes the spin visible
        train.add(w);
        towerWheels.push({ m: w, dir: sx > 0 ? -1 : 1 }); // up-line rope runs -z, down-line +z
      }
      const gIn = (cableY(z + 2, 1) - cableY(z, 1)) / 2;
      const gOut = (cableY(z, 1) - cableY(z - 2, 1)) / 2;
      train.rotation.x = -(Math.atan(gIn) + Math.atan(gOut)) / 2; // bisect in/out grades
      train.position.set(sx, h - 0.75, 0);
      t.add(train);
    }
    t.position.set(0, botY, z);
    root.add(t);
  }
}
// cable height profile with sag
function cableY(z, side) {
  for (let i = 0; i < supports.length - 1; i++) {
    const a = supports[i], b = supports[i + 1];
    if ((z <= a.z && z >= b.z)) {
      const t = (a.z - z) / (a.z - b.z);
      const taut = (i === 0 || i >= supports.length - 3); // terminal spans run straight, no sag
      const sag = taut ? 0 : Math.sin(t * Math.PI) * 0.9;
      return a.y + (b.y - a.y) * t - sag;
    }
  }
  return (supports[0].y + supports[supports.length - 1].y) / 2;
}
// loop parametrization: up-run (x=+s), top semicircle, down-run, base semicircle
const LOOP = (() => {
  const sx = LIFT.sideX, zB = half, zT = -half;
  const straight = zB - zT, turn = Math.PI * sx;
  const total = 2 * straight + 2 * turn;
  function pos(s, out) {
    s = ((s % total) + total) % total;
    if (s < straight) { const t = s / straight; out.set(sx, cableY(zB + (zT - zB) * t, 1), zB + (zT - zB) * t); }
    else if (s < straight + turn) {
      const a = (s - straight) / sx; // 0..pi
      out.set(Math.cos(a) * sx, LIFT.top.y, zT - Math.sin(a) * sx);
    } else if (s < 2 * straight + turn) {
      const t = (s - straight - turn) / straight;
      out.set(-sx, cableY(zT + (zB - zT) * t, -1), zT + (zB - zT) * t);
    } else {
      const a = (s - 2 * straight - turn) / sx;
      out.set(-Math.cos(a) * sx, LIFT.base.y, zB + Math.sin(a) * sx);
    }
    return out;
  }
  function dir(s, out) { // travel direction (for yaw)
    const e = 0.5, a = new THREE.Vector3(), b = new THREE.Vector3();
    pos(s - e, a); pos(s + e, b); return out.subVectors(b, a).normalize();
  }
  return { total, pos, dir, straight, turn };
})();
// detachable-gondola helpers: cabins decouple in stations and crawl on tyres
const S_LOAD = 4.5;                       // loop-s where boarding happens (just out of base turn)
const S_UNLOAD = LOOP.straight - 4.5;     // loop-s where alighting happens (just into top turn)
function wrapDist(a, b) {
  const d = Math.abs(a - b) % LOOP.total;
  return d > LOOP.total / 2 ? LOOP.total - d : d;
}
function inStation(s) { // slow tyre-rail zone around each terminal turnaround
  const sTopC = LOOP.straight + LOOP.turn / 2;
  const sBaseC = 2 * LOOP.straight + LOOP.turn + LOOP.turn / 2;
  return wrapDist(s, sTopC) < LIFT.stationLen || wrapDist(s, sBaseC) < LIFT.stationLen;
}
function targetSpeedAt(s) { return inStation(s) ? LIFT.stationSpeed : LIFT.cableSpeed; }
function doorsOpenAt(s) { // doors only while on the station rails — shut before the first pylon
  const sTopC = LOOP.straight + LOOP.turn / 2;
  const sBaseC = 2 * LOOP.straight + LOOP.turn + LOOP.turn / 2;
  return wrapDist(s, sTopC) < 9.5 || wrapDist(s, sBaseC) < 9.5;
}
{ // cable tube
  const pts = [];
  for (let s = 0; s < LOOP.total; s += 2) pts.push(LOOP.pos(s, new THREE.Vector3()).clone());
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 400, 0.07, 6, true),
    new THREE.MeshStandardMaterial({ color: 0x2c313a, roughness: 0.6, metalness: 0.4 }));
  root.add(tube);
}
// Alpine cabins: tapered eight-sided shell, framed panes and true sliding door openings.
const cabins=[];
{
  const bodyM=new THREE.MeshStandardMaterial({color:def.color,roughness:.36,metalness:.18});
  const frameM=new THREE.MeshStandardMaterial({color:0x303b41,roughness:.42,metalness:.55});
  const rubberM=new THREE.MeshStandardMaterial({color:0x182329,roughness:.9});
  const alloyM=new THREE.MeshStandardMaterial({color:0xa9b5b8,metalness:.75,roughness:.32});
  const glassM=new THREE.MeshStandardMaterial({color:0x9cbdc7,transparent:true,opacity:.28,roughness:.12,metalness:.08,side:THREE.DoubleSide,depthWrite:false});
  const creamM=new THREE.MeshStandardMaterial({color:0xf2eee2,roughness:.45});
  const solarM=new THREE.MeshStandardMaterial({color:0x142b42,metalness:.35,roughness:.3});
  const seatM=new THREE.MeshStandardMaterial({color:0x46545b,roughness:.9});
  const outline=[[-.78,-1.02],[.78,-1.02],[1.04,-.76],[1.04,.76],[.78,1.02],[-.78,1.02],[-1.04,.76],[-1.04,-.76]];
  // Geometry is shared by all cabins on this line.
  function shell(rings,caps=true) {
    const positions=[],indices=[],n=outline.length;
    for(const [y,scale] of rings)for(const [x,z] of outline)positions.push(x*scale,y,z*scale);
    for(let k=0;k<rings.length-1;k++)for(let j=0;j<n;j++) {
      const a=k*n+j,b=k*n+(j+1)%n;indices.push(a,a+n,b,b,a+n,b+n);
    }
    if(caps)for(let j=1;j<n-1;j++){indices.push(0,j,j+1);const a=(rings.length-1)*n;indices.push(a,a+j+1,a+j);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
  }
  function pane(a,b,bottom=-3.28,top=-2.08) {
    const vertices=[a[0],bottom,a[1],b[0],bottom,b[1],b[0]*.9,top,b[1]*.9,a[0]*.9,top,a[1]*.9];
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return g;
  }
  const bodyG=shell([[-3.98,.83],[-3.8,.96],[-3.3,1]]);
  const roofG=shell([[-2.09,.9],[-1.96,.96],[-1.86,.88]]);
  const sillG=shell([[-3.33,1.015],[-3.25,1.015]],false);
  const bumperG=shell([[-3.97,.86],[-3.88,.91]],false);
  const stripeG=shell([[-3.49,1.004],[-3.4,1.014]],false);
  const fixedPanes=[];
  for(let j=0;j<outline.length;j++) {
    // The exterior side is split around the opening, with no hidden glass across it.
    if(j===6){fixedPanes.push(pane([-1.04,.76],[-1.04,.57]),pane([-1.04,-.57],[-1.04,-.76]));}
    else fixedPanes.push(pane(outline[j],outline[(j+1)%outline.length]));
  }
  const hangerCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,-.18,0),new THREE.Vector3(-.13,-.65,.08),
    new THREE.Vector3(-.3,-1.2,.05),new THREE.Vector3(-.12,-1.62,0),new THREE.Vector3(.2,-1.86,0)]);
  const hangerG=new THREE.TubeGeometry(hangerCurve,20,.075,7);
  const letterTexture=(()=>{
    const c=document.createElement('canvas');c.width=512;c.height=96;
    const ctx=c.getContext('2d');ctx.fillStyle='#faf6e9';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 48px Georgia';ctx.fillText('L I F T  C O.',256,49);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
  })();
  const brandingM=new THREE.MeshBasicMaterial({map:letterTexture,transparent:true,depthWrite:false});
  for(let i=0;i<LIFT.cabins;i++) {
    const g=new THREE.Group();
    function mesh(geo,mat,shadow=true){const m=new THREE.Mesh(geo,mat);m.castShadow=shadow;m.receiveShadow=shadow;g.add(m);return m;}
    function box(w,h,d,x,y,z,mat){const m=mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);return m;}
    function bar(a,b,r=.025,mat=frameM){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);const m=mesh(new THREE.CylinderGeometry(r,r,d.length(),6),mat);m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
    const grip=box(.22,.22,.65,0,-.07,0,alloyM);
    box(.4,.1,.16,0,.07,0,frameM);
    box(.12,.11,.44,-.2,.06,.12,alloyM);
    // Visible grip spring and small running wheels sit above the slim curved hanger.
    for(let j=0;j<5;j++)box(.25,.025,.18,0,.12+j*.035,-.12,frameM);
    for(const z of [-.24,.24]) {
      const wheel=mesh(new THREE.CylinderGeometry(.09,.09,.07,10),rubberM);wheel.rotation.z=Math.PI/2;wheel.position.set(-.16,.03,z);
    }
    mesh(hangerG,alloyM);box(.5,.12,.35,.13,-1.86,0,frameM);
    mesh(bodyG,bodyM);mesh(roofG,frameM);mesh(sillG,rubberM);mesh(bumperG,rubberM);mesh(stripeG,creamM);
    // An actual floor and two compact benches make the transparent cabin read as occupied.
    box(1.62,.08,1.62,0,-3.84,0,rubberM);
    for(const z of [-.65,.65])box(1.38,.13,.32,0,-3.48,z,seatM);
    for(const pg of fixedPanes)mesh(pg,glassM,false);
    for(const [x,z] of outline)bar([x,-3.3,z],[x*.9,-2.06,z*.9],.032);
    for(const z of [-1,1]) {
      // Split front windscreen, with a thin rubber mullion and a short wiper.
      bar([0,-3.27,z*1.02],[0,-2.08,z*.918],.021);
      bar([-.36,-2.92,z*1.01],[.26,-2.84,z*1.01],.014,rubberM);
      const logo=mesh(new THREE.PlaneGeometry(1.25,.24),brandingM,false);
      logo.position.set(0,-3.12,z*1.026);logo.rotation.y=z<0?Math.PI:0;
    }
    // Framed photovoltaic panels follow the two roof shoulders.
    for(const side of [-1,1]) {
      const solar=new THREE.Group();solar.position.set(side*.56,-1.835,0);solar.rotation.z=-side*.13;g.add(solar);
      const edge=new THREE.Mesh(new THREE.BoxGeometry(.68,.055,1.18),alloyM);solar.add(edge);
      const panel=new THREE.Mesh(new THREE.BoxGeometry(.62,.018,1.12),solarM);panel.position.y=.035;solar.add(panel);
      for(let cell=1;cell<6;cell++){const line=new THREE.Mesh(new THREE.BoxGeometry(.61,.005,.009),alloyM);line.position.set(0,.047,-.56+cell*1.12/6);solar.add(line);}
      const seam=new THREE.Mesh(new THREE.BoxGeometry(.008,.005,1.11),alloyM);seam.position.y=.047;solar.add(seam);
    }
    // Rear rack: open metal basket, holders and occupied-seat skis.
    for(const x of [-.63,.63])bar([x,-3.94,-.99],[x,-3.12,-1.24],.035,alloyM);
    bar([-.7,-3.73,-1.25],[.7,-3.73,-1.25],.035,alloyM);
    bar([-.7,-3.18,-1.24],[.7,-3.18,-1.24],.035,alloyM);
    const rackSkis=[];
    for(let seat=0;seat<4;seat++) {
      const pair=new THREE.Group();pair.position.set(-.45+seat*.3,-3.5,-1.28);pair.rotation.z=(seat-1.5)*.035;
      for(const dx of [-.045,.045]) {
        const ski=new THREE.Mesh(new THREE.BoxGeometry(.065,1.57,.045),seat%2?creamM:bodyM);ski.position.set(dx,.36,0);pair.add(ski);
        const binding=new THREE.Mesh(new THREE.BoxGeometry(.085,.14,.07),rubberM);binding.position.set(dx,.12,.03);pair.add(binding);
      }
      pair.visible=false;g.add(pair);rackSkis.push(pair);
    }
    // Each sliding half has clear glass, a red lower panel, seals and a handle.
    const doors=[];
    for(const half of [-1,1]) {
      const panel=new THREE.Group();panel.position.set(-1.055,-2.95,half*.285);
      const lower=new THREE.Mesh(new THREE.BoxGeometry(.055,.59,.55),bodyM);lower.position.y=-.55;panel.add(lower);
      const glass=new THREE.Mesh(new THREE.PlaneGeometry(.55,1.13),glassM);glass.rotation.y=-Math.PI/2;glass.position.set(0,.23,0);panel.add(glass);
      for(const z of [-.275,.275]) {const edge=new THREE.Mesh(new THREE.BoxGeometry(.065,1.72,.025),frameM);edge.position.set(0,-.05,z);panel.add(edge);}
      for(const y of [-.91,-.27,.81]) {const edge=new THREE.Mesh(new THREE.BoxGeometry(.065,.035,.55),frameM);edge.position.y=y;panel.add(edge);}
      const handle=new THREE.Mesh(new THREE.BoxGeometry(.07,.18,.025),alloyM);handle.position.set(-.055,-.07,-half*.21);panel.add(handle);
      g.add(panel);doors.push({m:panel,closed:half*.285,open:half*.87});
    }
    g.userData.grip=grip;g.scale.setScalar(cabinScale);root.add(g);
    cabins.push({g,s:i/LIFT.cabins*LOOP.total,riders:[null,null,null,null],yaw:0,speed:LIFT.cableSpeed,doors,door:0,rackSkis});
  }
}

  const worldPoint=(x,z)=>{const p=planPoint(def,x,z);p.y=worldTerrainY(p.x,p.z);return p;};
  const queueSlots=Array.from({length:18},(_,i)=>worldPoint(4.6+(i%2)*1.6,half-1+Math.floor(i/2)*1.5));
  const load=worldPoint(3.7,half-4.2),unload=worldPoint(3.6,-half+4.2);
  const v1=new THREE.Vector3(),v2=new THREE.Vector3(),metricA=new THREE.Vector3(),metricB=new THREE.Vector3();
  function update(dt) {
    for(const t of towerWheels)t.m.rotation.x+=t.dir*dt*LIFT.cableSpeed/.38;
    LIFT.baseWheel.rotation.y+=dt*LIFT.cableSpeed/2.2;LIFT.topWheel.rotation.y+=dt*LIFT.cableSpeed/2.2;
    const order=[...cabins].sort((a,b)=>a.s-b.s);
    // Read all neighbours before moving any cabin, avoiding iteration-order effects.
    const next=order.map((c,k)=>{let speed=targetSpeedAt(c.s);const ahead=order[(k+1)%order.length],gap=(ahead.s-c.s+LOOP.total)%LOOP.total,minGap=inStation(c.s)||inStation(ahead.s)?5:9;
      if(gap<minGap)speed=Math.min(speed,Math.max(.1,ahead.speed*gap/minGap));return speed;});
    for(let k=0;k<order.length;k++){
      const c=order[k];c.speed=THREE.MathUtils.damp(c.speed,next[k],4,dt);
      LOOP.pos(c.s-.15,metricA);LOOP.pos(c.s+.15,metricB);const metric=Math.max(.5,metricA.distanceTo(metricB)/.3);
      c.s=(c.s+c.speed*dt/metric)%LOOP.total;LOOP.pos(c.s,v1);c.g.position.copy(v1);LOOP.dir(c.s,v2);
      const target=Math.atan2(v2.x,v2.z);let delta=target-c.yaw;while(delta>Math.PI)delta-=Math.PI*2;while(delta<-Math.PI)delta+=Math.PI*2;
      c.yaw+=delta*Math.min(1,dt*3);c.g.rotation.y=c.yaw;
      c.door=THREE.MathUtils.damp(c.door,doorsOpenAt(c.s)?1:0,3,dt);
      for(const door of c.doors)door.m.position.z=door.closed+(door.open-door.closed)*c.door;
    }
    root.updateMatrixWorld(true);
  }
  for(const c of cabins){LOOP.pos(c.s,c.g.position);LOOP.dir(c.s,v1);c.yaw=Math.atan2(v1.x,v1.z);c.g.rotation.y=c.yaw;}
  root.updateMatrixWorld(true);
  let ropeLength=0;for(let z=half;z>-half;z-=1){const next=Math.max(-half,z-1);ropeLength+=Math.hypot(z-next,cableY(z,1)-cableY(next,1));}
  return {index,def,root,LIFT,LOOP,cabins,towerWheels,supports,frame:f,worldPoint,update,cabinScale,length:ropeLength,rise:LIFT.top.y-LIFT.base.y};
};
