// Column geometry shared by the game and foundation workshop.
window.LiftCoTowerMast={
 headShift(height,angle=0){return Math.tan(Math.max(-20,Math.min(20,Number(angle)||0))*Math.PI/180)*Math.max(.1,height-1.17);},
 groups({towers,length,groundAt,threshold=7}){
  const ordered=towers.map((t,i)=>({tower:t,sourceIndex:i,distance:t.fraction*length})).sort((a,b)=>a.distance-b.distance),groups=[];
  for(const item of ordered){const group=groups.at(-1);if(group&&threshold>0&&item.distance-group.members.at(-1).distance<=threshold+1e-6)group.members.push(item);else groups.push({members:[item]});}
  for(const [index,group]of groups.entries()){
   group.index=index;group.shared=group.members.length>1;group.start=group.members[0].distance-.93;group.end=group.members.at(-1).distance+.93;group.width=1.86;
   if(group.shared){const heights=[],steps=Math.max(1,Math.ceil((group.end-group.start)/1.5));for(const x of [-.93,0,.93])for(let i=0;i<=steps;i++)heights.push(groundAt(x,group.start+(group.end-group.start)*i/steps));group.top=Math.max(...heights)+.04;group.bottom=Math.min(...heights)-.6;}
   for(const member of group.members){const t=member.tower;member.rawGround=groundAt(0,member.distance);member.anchorGround=group.shared?group.top-.04:member.rawGround;member.height=member.rawGround+t.height;const rise=member.height-1.22-(member.anchorGround-.05);member.valid=rise>.45;member.headDistance=member.distance+Math.tan(Math.max(-20,Math.min(20,t.leanAlong||0))*Math.PI/180)*Math.max(.1,rise);member.group=group;}
   group.valid=group.members.every(m=>m.valid);
  }
  return groups;
 },
 foot({headY,groundAt,along=0,across=0}){
  const limit=v=>Math.max(-20,Math.min(20,Number(v)||0)),a=Math.tan(limit(along)*Math.PI/180),b=Math.tan(limit(across)*Math.PI/180);
  // The foot follows the actual hillside, rather than rotating into empty space.
  const evaluate=r=>r+groundAt(-b*r,a*r)-.05-headY;let lo=0,hi=Math.max(100,headY-groundAt(0,0)+100);
  while(evaluate(hi)<0&&hi<1600)hi*=2;
  const valid=evaluate(lo)<=0&&evaluate(hi)>=0;
  if(valid)for(let i=0;i<42;i++){const mid=(lo+hi)/2;if(evaluate(mid)<0)lo=mid;else hi=mid;}
  const rise=valid?(lo+hi)/2:Math.max(.25,headY-groundAt(0,0)+.05);
  return{x:-b*rise,y:headY-rise,z:a*rise,valid};
 },
 create(T,{parent,headY,groundAt,along=0,across=0,steel,concrete,dark,foundation=true,footOverride=null}){
  const root=new T.Group();root.name='Leaning tower column';parent.add(root);
  const foot=footOverride||this.foot({headY,groundAt,along,across}),bottom=new T.Vector3(foot.x,foot.y,foot.z),top=new T.Vector3(0,headY,0),axis=top.clone().sub(bottom).normalize(),rotation=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),axis);
  function mesh(geometry,material,position,quaternion){const m=new T.Mesh(geometry,material);m.position.copy(position);if(quaternion)m.quaternion.copy(quaternion);m.castShadow=m.receiveShadow=true;root.add(m);return m;}
  function bar(a,b,width,material){const delta=b.clone().sub(a);return mesh(new T.CylinderGeometry(width,width,delta.length(),8),material,a.clone().add(b).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()));}
  if(foundation){if(window.LiftCoFoundations)window.LiftCoFoundations.create(T,{parent:root,x:foot.x,z:foot.z,top:foot.y+.09,width:window.LiftCoFoundations.width(headY-foot.y),groundAt,material:concrete});else mesh(new T.BoxGeometry(1.65,.38,1.65),concrete,new T.Vector3(foot.x,foot.y-.10,foot.z));}
  mesh(new T.CylinderGeometry(.38,.55,top.distanceTo(bottom),12),steel,bottom.clone().add(top).multiplyScalar(.5),rotation);
  const flange=bottom.clone().addScaledVector(axis,.15);mesh(new T.CylinderGeometry(.68,.68,.13,12),dark,flange,rotation);
  for(const x of [-.45,.45])for(const z of [-.45,.45])mesh(new T.BoxGeometry(.1,.13,.1),dark,new T.Vector3(x,.24,z).applyQuaternion(rotation).add(bottom),rotation);
  const ladderOffset=(x,y)=>new T.Vector3(x,y,.66).applyQuaternion(rotation).add(bottom),length=top.distanceTo(bottom);
  for(const x of [-.3,.3])bar(ladderOffset(x,.10),ladderOffset(x,length+1.05),.028,steel);
  for(let h=.3;h<length+1;h+=.31)bar(ladderOffset(-.3,h),ladderOffset(.3,h),.024,steel);
  if(along||across)mesh(new T.SphereGeometry(.4,12,8),dark,top);
  return{root,foot,top};
 }
};
