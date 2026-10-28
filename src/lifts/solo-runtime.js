// Reversible Solo line: shared geometry/profile for construction and live operation.
window.LiftCoSoloRuntime=(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 const angleA=12*Math.PI/180,angleB=20*Math.PI/180,rig={trackY:-.313,haulY:.18,frameY:.23};
 const dockOffset=angle=>.6-.18+7.2+rig.trackY*Math.cos(angle)+rig.frameY*(1-Math.cos(angle));
 const hermite=(a,b,ya,yb,ma,mb,x)=>{const h=b-a,t=(x-a)/h;return(2*t**3-3*t*t+1)*ya+(t**3-2*t*t+t)*h*ma+(-2*t**3+3*t*t)*yb+(t**3-t*t)*h*mb;};
 // A long, damped single-arm pendulum, driven by carriage acceleration.
 // It has no turn-around kick or free yaw: the carriage stays on its track rope.
 class SuspensionMotion{
  constructor(){this.reset();}
  reset(){this.pitch=0;this.roll=0;this.pitchVelocity=0;this.rollVelocity=0;this.previous=null;}
  advance(dt,forward,vertical,dock=0){
   if(dt<=0)return;
   const prior=this.previous;this.previous={forward,vertical};
   const az=prior?clamp((forward-prior.forward)/dt,-2.4,2.4):0,ay=prior?clamp((vertical-prior.vertical)/dt,-3,3):0;
   const duration=Math.min(dt,.5),steps=Math.max(1,Math.ceil(duration*120)),h=duration/steps;
   const damping=.65+2.2*dock,gravity=clamp(9.81+ay,6,14),length=5.6;
   const drive=az*.4,rollTarget=clamp(ay*.0009+drive*.003,-.00314,.00314);
   const limit=.028*(1-.86*dock),rollLimit=.00314*(1-.9*dock);
   for(let i=0;i<steps;i++){
    this.pitchVelocity+=((drive*Math.cos(this.pitch)-gravity*Math.sin(this.pitch))/length-damping*this.pitchVelocity)*h;
    this.pitch+=this.pitchVelocity*h;
    this.rollVelocity+=((rollTarget-this.roll)*3.4-(1.3+2*dock)*this.rollVelocity)*h;this.roll+=this.rollVelocity*h;
    for(const [angle,velocity,max]of [['pitch','pitchVelocity',limit],['roll','rollVelocity',rollLimit]])if(Math.abs(this[angle])>max){this[angle]=Math.sign(this[angle])*max;if(this[angle]*this[velocity]>0)this[velocity]=0;}
   }
  }
 }
 class Layout{
  constructor(data){Object.assign(this,data);this.endAngle=data.endAngle??angleB;this.endFlat=this.endAngle===0?15:6;this.endGuide=this.endAngle===0?18:12;this.length=Math.hypot(this.end.x-this.start.x,this.end.z-this.start.z);this.dx=(this.end.x-this.start.x)/this.length;this.dz=(this.end.z-this.start.z)/this.length;this.ready=this.length>=60;this.terminalGuides=true;this.guideLengths={start:12,end:this.endGuide};this.nodes=[{id:'start',kind:'station',distance:0,height:this.start.height},...this.towers.map(t=>({...t,kind:'tower',distance:t.fraction*this.length})).sort((a,b)=>a.distance-b.distance),{id:'end',kind:'station',distance:this.length,height:this.end.height}];
   // A common H/w gives gravity-loaded free spans. Reduce tension only when
   // the requested shallow sag would require an open pylon saddle to pull
   // the rope down. Station transitions are constrained by their docking cages;
   // including them here needlessly slackened every free span on the line.
   const longest=Math.max(...this.nodes.slice(1).map((n,i)=>n.distance-this.nodes[i].distance));
   const requestedA=this.tensionA??longest*longest/(8*Math.max(.12,(this.sag??.55)*1.8));
   const fit=a=>{this.catenaryA=a;this.rebuild();return this.transitions.filter(t=>t.kind==='tower').every(t=>t.ma>=t.mb-1e-8);};
   let high=requestedA,low=requestedA;this.contactValid=fit(high);
   if(!this.contactValid){for(let i=0;i<45&&!this.contactValid;i++){low=Math.max(longest/8,low*.85);this.contactValid=fit(low);if(low===longest/8)break;}if(!this.contactValid)throw Error('Solo cannot seat the ropes on these supports. Adjust tower heights or station elevations.');if(this.contactValid){for(let i=0;i<28;i++){const mid=(low+high)/2;if(fit(mid))low=mid;else high=mid;}fit(low*.995);}}
   this.tensionAdjusted=this.catenaryA<requestedA*.999;
   this.maxSag=Math.max(...this.spans.map(p=>{const slope=(p.y1-p.y0)/(p.b-p.a),x=clamp(p.c+this.catenaryA*Math.asinh(slope),p.a,p.b);return p.y0+slope*(x-p.a)-p.fn(x);}));
   for(const n of this.nodes)n.compression=false;
  }
  rebuild(){
   const nodes=this.nodes,half=4.48,L=this.length,A=this.catenaryA,ma=Math.tan(angleA),mb=Math.tan(this.endAngle);
   const edge=nodes.slice(1).map((q,i)=>{const p=nodes[i],a=i===0?12:p.distance+half,b=i===nodes.length-2?L-this.endGuide:q.distance-half;
    if(b<=a)throw Error('Solo supports are too close for their guide saddles.');
    const line=x=>p.height+(q.height-p.height)*(x-p.distance)/(q.distance-p.distance);
    return{a,b,y0:i===0?this.start.height+ma*a:line(a),y1:i===nodes.length-2?this.end.height+mb*(b-L):line(b)};});
   const span=p=>{const {a,b,y0,y1}=p,h=b-a,c=(a+b)/2-A*Math.asinh((y1-y0)/(2*A*Math.sinh(h/(2*A))));return{...p,c,m0:Math.sinh((a-c)/A),m1:Math.sinh((b-c)/A),fn:x=>y0+2*A*Math.sinh((x-a)/(2*A))*Math.sinh((x+a-2*c)/(2*A))};};
   // Tangent saddle edges and span tensions are solved together. The quadratic
   // saddle passes through the selected tower height and has no inflection.
   for(let pass=0;pass<100;pass++){
    const spans=edge.map(span),wanted=edge.map(p=>({...p}));
    wanted[0].y0=this.start.height+6*ma+3*(ma+spans[0].m0);
    wanted.at(-1).y1=this.end.height-this.endFlat*mb-(this.endGuide-this.endFlat)/2*(spans.at(-1).m1+mb);
    for(let i=1;i<nodes.length-1;i++){
     const incoming=spans[i-1].m1,outgoing=spans[i].m0,H=nodes[i].height;
     wanted[i-1].y1=H-half/4*(3*incoming+outgoing);
     wanted[i].y0=H+half/4*(incoming+3*outgoing);
    }
    let error=0;for(let i=0;i<edge.length;i++)for(const key of ['y0','y1']){const e=wanted[i][key]-edge[i][key];error=Math.max(error,Math.abs(e));edge[i][key]+=e*.8;}if(error<1e-9)break;
   }
   this.spans=edge.map(span);this.transitions=[];
   const add=(a,b,ya,yb,ma,mb,kind='tower')=>this.transitions.push({a,b,ya,yb,ma,mb,kind});
   for(let i=1;i<this.spans.length;i++){const p=this.spans[i-1],q=this.spans[i];add(p.b,q.a,p.y1,q.y0,p.m1,q.m0);}
   add(6,12,this.start.height+6*ma,this.spans[0].y0,ma,this.spans[0].m0,'station');
   add(L-this.endGuide,L-this.endFlat,this.spans.at(-1).y1,this.end.height-this.endFlat*mb,this.spans.at(-1).m1,mb,'station');
  }
  heightAt(s){if(s<=6)return this.start.height+s*Math.tan(angleA);if(s>=this.length-this.endFlat)return this.end.height+(s-this.length)*Math.tan(this.endAngle);for(const t of this.transitions)if(s>=t.a&&s<=t.b)return hermite(t.a,t.b,t.ya,t.yb,t.ma,t.mb,s);for(const p of this.spans)if(s>=p.a&&s<=p.b)return p.fn(s);return this.start.height;}
  slopeAt(s){return(this.heightAt(s+.01)-this.heightAt(s-.01))/.02;}
  offsetHeightAt(s,gap){let contact=s;for(let i=0;i<12;i++){const m=this.slopeAt(contact);contact=s+gap*m/Math.hypot(1,m);}const m=this.slopeAt(contact);return this.heightAt(contact)+gap/Math.hypot(1,m);}
  tractionProfile(gap){
   if(!this.tractionProfiles)this.tractionProfiles=new Map();
   if(!this.tractionProfiles.has(gap)){
    const raised=(node,angle)=>({...node,height:node.height+gap/Math.cos(angle)});
    this.tractionProfiles.set(gap,new Layout({start:raised(this.start,angleA),end:raised(this.end,this.endAngle),endAngle:this.endAngle,towers:this.nodes.filter(n=>n.kind==='tower').map(n=>({...n,height:n.height+gap*Math.hypot(1,this.slopeAt(n.distance))})),tensionA:this.catenaryA}));
   }
   return this.tractionProfiles.get(gap);
  }
  pointAt(s,side=0,height){return{x:this.start.x+this.dx*s+this.dz*side,z:this.start.z+this.dz*s-this.dx*side,y:height??this.heightAt(s)};}
  project(x,z){const dx=x-this.start.x,dz=z-this.start.z,distance=dx*this.dx+dz*this.dz;return{distance,fraction:distance/this.length,lateral:dx*this.dz-dz*this.dx};}
 }
 // Articulated wheel axles and collar pads stay seated on the same curves
 // used to draw the ropes, including the curved saddle transitions.
 function seatCarriage(c,index,layout,r){
  const a=c.trolley.rotation.x,cos=Math.cos(a),sin=Math.sin(a),direction=index?-1:1,baseY=c.g.position.y+c.trolleyY,baseZ=c.g.position.z;
  function seat(z,y,profile){for(let i=0;i<4;i++){const worldZ=baseZ+direction*(sin*y+cos*z),h=profile(worldZ),m=(profile(worldZ+.002)-profile(worldZ-.002))/.004;y-=(baseY+cos*y-sin*z-h)/(cos-direction*sin*m);}return y;}
  for(const wheel of c.wheels)wheel.position.y=seat(wheel.position.z,r.wheelY,z=>layout.offsetHeightAt(z,r.wheelRadius+r.trackRadius));
  for(const grip of c.haulGrips||[]){const y=seat(grip.g.position.z,r.haulY,z=>layout.tractionProfile(r.haulY-r.trackY).heightAt(z)),offset=y-r.haulY;grip.g.position.y=offset;const target=r.haulY+.12+offset;grip.stem.scale.y=(Math.abs(target-grip.stemY)+.06)/grip.stemHeight;grip.stem.position.y=(grip.stemY+target)/2-offset;}
 }
 function layoutFor(def,{frame,planPoint,ground,prepare}){prepare(def);const f=frame(def),half=f.length/2,endAngle=def.arrivalProfile==='flat'?0:angleB;const layout=new Layout({start:{x:def.base[0],z:def.base[1],height:def.stationGround[1]+dockOffset(angleA)},end:{x:def.top[0],z:def.top[1],height:def.stationGround[-1]+dockOffset(endAngle)},towers:def.towers.map((t,i)=>{const p=planPoint(def,0,half-t.fraction*f.length);return{id:t.id??i+1,fraction:t.fraction,height:ground(p.x,p.z)+t.height};}),sag:def.sag,endAngle});layout.tractionProfile(rig.haulY-rig.trackY);return layout;}
 function create(T,def,index,ctx){
  const layout=layoutFor(def,ctx),f=ctx.frame(def),half=f.length/2,L=f.length,lane=5.1,root=new T.Group(),line=new T.Group();root.position.set(f.x,0,f.z);root.rotation.y=f.angle;line.position.z=half;line.rotation.y=Math.PI;root.add(line);ctx.scene.add(root);
  const factory=window.LiftCoSolo.createFactory(T),r=factory.rig,shape=factory.definition,structures=window.LiftCoSoloStructures.createFactory(T,r),cabins=[],models=[],route=s=>layout.heightAt(s),traction=layout.tractionProfile(r.haulY-r.trackY),haul=s=>traction.heightAt(s);
  const worldPoint=(x,z)=>{const p=ctx.planPoint(def,x,z);p.y=ctx.terrain(p.x,p.z,def.preview?def:null);return p;};
  const groundAt=(s,side=0)=>{const p=ctx.planPoint(def,-side,half-s);return ctx.terrain(p.x,p.z,def.preview?def:null);};
  for(const n of layout.nodes.filter(n=>n.kind==='tower')){const t=structures.createTower({z:n.distance,groundY:groundAt(n.distance),route,haul,groundAt});t.root.userData.number=layout.nodes.indexOf(n);models.push(t);line.add(t.root);}
  for(const [z,groundY,inward]of [[0,def.stationGround[1],1],[L,def.stationGround[-1],-1]]){const station=structures.createStation({z,groundY,route,haul,inward,guideLength:inward<0?layout.endGuide:12,flatArrival:inward<0&&layout.endAngle===0,groundAt,style:def.stationStyle});models.push(station);line.add(station.root);if(def.stationStyle==='faron'){station.building.removeFromParent();const model=window.LiftCoStationArchitecture.create('faron',{portalHeight:Math.max(14.2,haul(z+inward*16.4)-groundY+.8)});model.root.rotation.y=inward<0?Math.PI:0;station.root.add(model.root);station.building=model.roof;window.LiftCoStationArchitecture.support(model,ctx.ground);}}
  const cableM=new T.MeshStandardMaterial({color:0x475254,roughness:.65,metalness:.4});
  function rope(x,fn,radius,material){class Path extends T.Curve{getPoint(t,target=new T.Vector3()){const s=-4.5+(L+9)*t;return target.set(x,fn(s),s);}}const mesh=new T.Mesh(new T.TubeGeometry(new Path(),Math.max(100,Math.ceil(L/.9)),radius,6,false),material);mesh.userData.ropeKind='support';line.add(mesh);}
  for(const side of [-1,1])rope(side*lane,route,r.trackRadius,cableM);
  const machinery=window.LiftCoSoloMachinery.create(T,{parent:line,length:L,lane,route,haul,guides:traction.transitions,slope:s=>traction.slopeAt(s),rig:r,baseGround:def.stationGround[1],topGround:def.stationGround[-1]});
  if(!def.preview)for(let i=0;i<2;i++){const c=factory.create(shape,i+1,false);line.add(c.g);if(i)c.g.rotation.y=Math.PI;
   // Separate the fixed carriage from the hanging arm/body, preserving the
   // approved rest pose. The body frame also carries people and the ride camera.
   c.g.add(c.trolley);const pivot=new T.Group();pivot.name='Solo suspension hinge';c.g.add(pivot);pivot.add(c.suspension);c.suspension.add(c.body);
   const hingeHeight=c.trolleyY+r.frameY;c.suspension.position.set(-.4,-hingeHeight,0);pivot.position.set(.4,hingeHeight,0);
   Object.assign(c,{swayPivot:pivot,swayMotion:new SuspensionMotion(),nativeVelocity:{forward:0,vertical:0},isSolo:true,riders:Array(12).fill(null),eye:new T.Vector3(0,1.62,.1),yaw:Math.PI+i*Math.PI,sway:0,s:0,door:0,speed:0,station:null,dwellRemaining:0});cabins.push(c);}
  const samples=[{z:0,s:0}];for(let z=1;z<L;z+=1){const p=samples.at(-1);samples.push({z,s:p.s+Math.hypot(z-p.z,haul(z)-haul(p.z))});}const last=samples.at(-1);samples.push({z:L,s:last.s+Math.hypot(L-last.z,haul(L)-haul(last.z))});const distance=samples.at(-1).s;
  function interval(table,value,key){let lo=0,hi=table.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(table[mid][key]<=value)lo=mid;else hi=mid;}return[table[lo],table[hi]];}
  const sAt=z=>{const[a,b]=interval(samples,z,'z');return a.s+(b.s-a.s)*(z-a.z)/(b.z-a.z);},zAt=s=>{const[a,b]=interval(samples,s,'s');return a.z+(b.z-a.z)*clamp((s-a.s)/(b.s-a.s),0,1);};
  const restrictions=layout.nodes.filter(n=>n.kind==='tower').flatMap(n=>{const s=sAt(n.distance);return[s,distance-s];}),acc=.65,table=samples.map(p=>{let v=Math.min(10.25,Math.sqrt(2*acc*p.s),Math.sqrt(2*acc*(distance-p.s)));for(const at of restrictions)v=Math.min(v,Math.sqrt(49+2*acc*Math.max(0,Math.abs(p.s-at)-10)));return{s:p.s,v,t:0};});
  for(let i=1;i<table.length;i++)table[i].v=Math.min(table[i].v,Math.sqrt(table[i-1].v**2+2*acc*(table[i].s-table[i-1].s)));for(let i=table.length-2;i>=0;i--)table[i].v=Math.min(table[i].v,Math.sqrt(table[i+1].v**2+2*acc*(table[i+1].s-table[i].s)));for(let i=1;i<table.length;i++)table[i].t=table[i-1].t+2*(table[i].s-table[i-1].s)/(table[i].v+table[i-1].v);
  const trip=table.at(-1).t,dwell=8,cycle=trip+dwell;let clock=0,previous=0;
  function update(dt,options={}){if(def.preview){root.updateMatrixWorld(true);return;}clock+=dt;const back=Math.floor(clock/cycle)%2===1,t=clock%cycle,docked=t<dwell;let s=0,v=0;if(!docked){const[a,b]=interval(table,t-dwell,'t'),elapsed=clamp(t-dwell-a.t,0,b.t-a.t),a0=(b.v-a.v)/(b.t-a.t);s=a.s+a.v*elapsed+.5*a0*elapsed*elapsed;v=a.v+a0*elapsed;}if(back)s=distance-s;const delta=s-previous;previous=s;
   for(let i=0;i<2;i++){const c=cabins[i],travel=i?distance-s:s,z=zAt(travel),theta=-Math.atan(layout.slopeAt(z));c.g.position.set((i?-1:1)*lane,route(z)-r.trackY*Math.cos(theta)-c.trolleyY,z-r.trackY*Math.sin(theta));c.trolley.rotation.x=i?-theta:theta;const signedSpeed=v*(back?-1:1)*(i?-1:1),vz=signedSpeed/Math.hypot(1,traction.slopeAt(z));c.nativeVelocity={forward:vz*(i?-1:1),vertical:vz*layout.slopeAt(z)};c.s=z;c.speed=v;c.station=docked?(travel<distance/2?'base':'top'):null;c.dwellRemaining=docked?dwell-t:0;c.door=docked?smooth(0,.8,t)*(1-smooth(dwell-1.5,dwell-.5,t)):0;for(const d of c.doors)d.g.position.z=d.closed+(d.open-d.closed)*c.door;seatCarriage(c,i,layout,r);for(const w of c.wheels)w.rotation.x+=delta/r.wheelRadius;}
   if(!options.deferSway)updateSuspension(dt);
   machinery.setDrive(-s,back?v:-v);root.updateMatrixWorld(true);
   for(const m of models){for(const w of m.sheaves)if(w.rope!=='support')w.wheel.rotation.x=s*w.side/w.radius;for(const w of m.haulSheaves){const c=cabins[w.side>0?0:1],point=c.trolley.localToWorld(new T.Vector3(0,r.haulY,-2.65*.36));line.worldToLocal(point);w.carrier.position.y=.15*(1-smooth(1.5,2.2,Math.abs(point.z-w.worldZ)));w.wheel.rotation.x-=delta*w.side/w.radius;}m.syncRollers?.();}
  }
  function updateSuspension(dt,speedScale=1){
   for(const c of cabins){
    const capture=c.s<L/2?20:layout.endGuide+8,dock=1-smooth(1.5,capture,Math.min(c.s,L-c.s));
    c.swayMotion.advance(dt,c.nativeVelocity.forward*speedScale,c.nativeVelocity.vertical*speedScale,dock);
    c.sway=c.swayMotion.pitch;c.swayRoll=c.swayMotion.roll;
    const angle=c.trolley.rotation.x;c.swayPivot.position.set(.4,c.trolleyY+r.frameY*Math.cos(angle),r.frameY*Math.sin(angle));
    c.swayPivot.rotation.set(c.sway,0,c.swayRoll);
   }
   root.updateMatrixWorld(true);
  }
  const LIFT={type:'solo',reversible:true,isChair:false,sideX:lane,capacity:12,carrierName:'Solo cabins',cableSpeed:10.25,stationSpeed:0,base:new T.Vector3(0,layout.start.height,half),top:new T.Vector3(0,layout.end.height,-half)};
  const dockPoint=(c,x)=>{const top=c?.s>L/2,p=worldPoint(x,top?-half:half);p.y=def.stationGround[top?-1:1]+.6;return p;};
  const passengerAccesses=new Map(['base','top'].map(end=>[end,window.LiftCoSoloPassengers.access(T,def,end,(x,z)=>ctx.terrain(x,z,def.preview?def:null))]));
  const passengerAccess=end=>passengerAccesses.get(end);
  const boardingPoint=(seat,c)=>dockPoint(c,c?.g.position.x<0?3.35:-3.35),unloadPoint=c=>dockPoint(c,c?.g.position.x<0?7.25:-7.25);
  const endInfo=end=>{const p=passengerAccess(end),sign=end==='top'?-1:1;return{end,queuePoint:i=>p.world({x:0,u:-Math.min(i,3)*1.1}),load:p.world({x:0,u:0}),unload:p.world({x:7.25,u:0}),unloadPoints:[-1,1].map(side=>p.world({x:side*7.25,u:0})),entry:p.entry,exits:p.exits};};
  const platformY=(x,z)=>{for(const end of ['base','top']){const y=passengerAccess(end).surface(x,z);if(y!==null)return y;}return null;};
  // Expose the native schedule for isolated inspection without duplicating motion.
  const motion={routeLength:distance,tripSeconds:trip,dwellSeconds:dwell,cycleSeconds:cycle*2,get time(){return clock;},seek(seconds){if(Number.isFinite(seconds)){clock=Math.max(0,seconds);for(const c of cabins)c.swayMotion.reset();update(0);}}};
  update(0);return{index,def,root,LIFT,cabins,layout,traction,motion,machinery,supports:layout.nodes.map((n,i)=>({z:half-n.distance,y:n.height,number:i,long:true})),cableHeight:z=>route(half-z),stationRoofs:models.map(m=>m.building).filter(Boolean),stationTyres:[],towerWheels:[],update,updateSuspension,worldPoint,platformY,passengerAccess,boardingPoint,unloadPoint,endInfo,queuePoint:i=>worldPoint(0,half+4+i*.9),skiOff:worldPoint(0,half+5),load:worldPoint(0,half),unload:worldPoint(0,-half),exit:worldPoint(2,-half+7),routes:ctx.routes.filter(r=>r.liftIndex===index),S_LOAD:0,S_UNLOAD:L,wrapDist:(a,b)=>Math.abs(a-b)};
 }
 return{Layout,layoutFor,create,seatCarriage,dockOffset,angleA,angleB,SuspensionMotion};
})();
