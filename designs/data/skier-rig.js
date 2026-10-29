/* Generated from makeSkier in empty-map.html. Study only, no resort or save access. */
window.LiftCoSkierStudyRig={create(THREE,{dress=window.LiftCoGuestModel.dress,color=0x437b79}={}){
const scene=new THREE.Scene(),lifts=[],skiers=[],JACKETS=[color];let nextTicket=0;
function makeSkier() {
  const g = new THREE.Group();
  const jacket = JACKETS[(Math.random() * JACKETS.length) | 0];
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.75, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x23262e, roughness: 0.9 }));
  legs.position.y = 0.55; legs.castShadow = true; g.add(legs);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.5, 4, 8),
    new THREE.MeshStandardMaterial({ color: jacket, roughness: 0.8 }));
  torso.position.y = 1.25; torso.castShadow = true; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xf1c9a5, roughness: 0.7 }));
  head.position.y = 1.95; head.castShadow = true; g.add(head);
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8, 0, Math.PI * 2, 0, 1.25),
    new THREE.MeshStandardMaterial({ color: jacket, roughness: 0.5 }));
  helm.position.y = 1.98; g.add(helm);
  const skiM = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.4 });
  const skiG = new THREE.BoxGeometry(0.14, 0.06, 1.9);
  const skis = new THREE.Group();
  for (const sx of [-0.16, 0.16]) {
    const ski = new THREE.Mesh(skiG, skiM); ski.position.x = sx; ski.castShadow = true; skis.add(ski);
  }
  skis.position.y = 0.08; g.add(skis);
  const arms=[];
  const sleeveM=new THREE.MeshStandardMaterial({color:jacket,roughness:.8});
  const gloveM=new THREE.MeshStandardMaterial({color:0x242b30,roughness:.85});
  for(const side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.34,1.5,0);
    const sleeve=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.2,3,6),sleeveM);sleeve.position.y=-.15;arm.add(sleeve);
    const elbow=new THREE.Group();elbow.position.y=-.31;arm.add(elbow);
    const forearm=new THREE.Mesh(new THREE.CapsuleGeometry(.07,.18,3,6),sleeveM);forearm.position.y=-.14;elbow.add(forearm);
    const hand=new THREE.Mesh(new THREE.SphereGeometry(.09,7,6),gloveM);hand.position.y=-.3;elbow.add(hand);
    g.add(arm);arms.push({arm,elbow,side});
  }
  const upperBody=new THREE.Group();upperBody.position.y=.95;
  for(const part of [torso,head,helm,...arms.map(a=>a.arm)]){part.position.y-=.95;upperBody.add(part);}
  g.add(upperBody);
  const seatedLegs=new THREE.Group(),pants=legs.material,bootGeometry=window.LiftCoGuestBoots.geometry(THREE),bootMaterial=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.63});
  for(const side of [-1,1]){
   const thigh=new THREE.Mesh(new THREE.BoxGeometry(.17,.17,.54),pants);thigh.position.set(side*.12,.91,.24);thigh.castShadow=true;seatedLegs.add(thigh);
   const shin=new THREE.Mesh(new THREE.BoxGeometry(.16,.56,.17),pants);shin.position.set(side*.12,.57,.49);shin.castShadow=true;seatedLegs.add(shin);
   const boot=new THREE.Mesh(bootGeometry,bootMaterial);boot.position.set(side*.12,.19,.56);seatedLegs.add(boot);
  }
  seatedLegs.visible=false;g.add(seatedLegs);
  scene.add(g);
  const skier={ g, legs, seatedLegs, bootGeometry, bootMaterial, torso, head, skis, upperBody, arms, state: 'arrive', t: Math.random() * 10, qi: -1, chair: -1, seat: -1, u: 0, x: 0, z: 0, speed: 6 + Math.random() * 2.5, wob: Math.random() * 10, liftIndex: lifts.length?skiers.length % lifts.length:0, ticket: nextTicket++, route: null, distance: 0 };
  window.LiftCoSkiMotion.attachRig(THREE,skier);dress(THREE,skier,{helmet:helm});return skier;
}

const s=makeSkier();s.skiSeed=5100;return s;
}};
