// Reversible Solo line: shared geometry/profile for construction and live operation.
window.LiftCoSoloRuntime=(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 const angleA=12*Math.PI/180,angleB=20*Math.PI/180,rig={trackY:-.313,haulY:.38};
 const dockOffset=angle=>.6-.18+7.2+rig.trackY*Math.cos(angle);
 const hermite=(a,b,ya,yb,ma,mb,x)=>{const h=b-a,t=(x-a)/h;return(2*t**3-3*t*t+1)*ya+(t**3-2*t*t+t)*h*ma+(-2*t**3+3*t*t)*yb+(t**3-t*t)*h*mb;};
 class Layout{
  constructor(data){Object.assign(this,data);this.length=Math.hypot(this.end.x-this.start.x,this.end.z-this.start.z);this.dx=(this.end.x-this.start.x)/this.length;this.dz=(this.end.z-this.start.z)/this.length;this.ready=this.length>=60;this.terminalGuides=true;this.guideLengths={start:12,end:12};this.nodes=[{id:'start',kind:'station',distance:0,height:this.start.height},...this.towers.map(t=>({...t,kind:'tower',distance:t.fraction*this.length})).sort((a,b)=>a.distance-b.distance),{id:'end',kind:'station',distance:this.length,height:this.end.height}];this.virtual=this.nodes.map(n=>({...n,y:n.height}));
   for(let pass=0;pass<14;pass++){this.rebuild();for(let i=1;i<this.nodes.length-1;i++)this.virtual[i].y+=this.nodes[i].height-this.heightAt(this.nodes[i].distance);}
   this.rebuild();for(const n of this.nodes)n.compression=n.kind==='tower'&&this.slopeAt(n.distance+3)>this.slopeAt(n.distance-3);
  }
  rebuild(){const a=this.virtual,half=4.48,L=this.length;this.spans=[];this.transitions=[];const line=(p,q,x)=>p.y+(q.y-p.y)*(x-p.distance)/(q.distance-p.distance);for(let i=0;i<a.length-1;i++){const p=a[i],q=a[i+1],lo=i===0?12:p.distance+half,hi=i===a.length-2?L-12:q.distance-half,y0=i===0?this.start.height+Math.tan(angleA)*lo:line(p,q,lo),y1=i===a.length-2?this.end.height+Math.tan(angleB)*(hi-L):line(p,q,hi),h=hi-lo,m=(y1-y0)/h,sag=(this.sag??.55)*clamp(h/50,.25,1.8);this.spans.push({a:lo,b:hi,y0,y1,m0:m-4*sag/h,m1:m+4*sag/h,fn:x=>{const t=(x-lo)/h;return y0+(y1-y0)*t-4*sag*t*(1-t);}});}
   const add=(a,b,ya,yb,ma,mb)=>this.transitions.push({a,b,ya,yb,ma,mb});for(let i=1;i<this.spans.length;i++){const p=this.spans[i-1],q=this.spans[i];add(p.b,q.a,p.fn(p.b),q.fn(q.a),p.m1,q.m0);}
   add(6,12,this.start.height+6*Math.tan(angleA),this.spans[0].y0,Math.tan(angleA),this.spans[0].m0);add(L-12,L-6,this.spans.at(-1).y1,this.end.height-6*Math.tan(angleB),this.spans.at(-1).m1,Math.tan(angleB));
  }
  heightAt(s){if(s<=6)return this.start.height+s*Math.tan(angleA);if(s>=this.length-6)return this.end.height+(s-this.length)*Math.tan(angleB);for(const t of this.transitions)if(s>=t.a&&s<=t.b)return hermite(t.a,t.b,t.ya,t.yb,t.ma,t.mb,s);for(const p of this.spans)if(s>=p.a&&s<=p.b)return p.fn(s);return this.start.height;}
  slopeAt(s){return(this.heightAt(s+.01)-this.heightAt(s-.01))/.02;}
  pointAt(s,side=0,height){return{x:this.start.x+this.dx*s+this.dz*side,z:this.start.z+this.dz*s-this.dx*side,y:height??this.heightAt(s)};}
  project(x,z){const dx=x-this.start.x,dz=z-this.start.z,distance=dx*this.dx+dz*this.dz;return{distance,fraction:distance/this.length,lateral:dx*this.dz-dz*this.dx};}
 }
 function layoutFor(def,{frame,planPoint,ground,prepare}){prepare(def);const f=frame(def),half=f.length/2;return new Layout({start:{x:def.base[0],z:def.base[1],height:def.stationGround[1]+dockOffset(angleA)},end:{x:def.top[0],z:def.top[1],height:def.stationGround[-1]+dockOffset(angleB)},towers:def.towers.map((t,i)=>{const p=planPoint(def,0,half-t.fraction*f.length);return{id:t.id??i+1,fraction:t.fraction,height:ground(p.x,p.z)+t.height};}),sag:def.sag});}
 function create(T,def,index,ctx){
  const layout=layoutFor(def,ctx),f=ctx.frame(def),half=f.length/2,L=f.length,lane=5.1,root=new T.Group(),line=new T.Group();root.position.set(f.x,0,f.z);root.rotation.y=f.angle;line.position.z=half;line.rotation.y=Math.PI;root.add(line);ctx.scene.add(root);
  const factory=window.LiftCoSolo.createFactory(T),r=factory.rig,shape=factory.definition,structures=window.LiftCoSoloStructures.createFactory(T,r),cabins=[],models=[],route=s=>layout.heightAt(s),haul=s=>route(s)+(r.haulY-r.trackY)*Math.hypot(1,layout.slopeAt(s));
  const worldPoint=(x,z)=>{const p=ctx.planPoint(def,x,z);p.y=ctx.terrain(p.x,p.z,def.preview?def:null);return p;};
  const groundAt=(s,side=0)=>{const p=ctx.planPoint(def,-side,half-s);return ctx.ground(p.x,p.z);};
  for(const n of layout.nodes.filter(n=>n.kind==='tower')){const t=structures.createTower({z:n.distance,groundY:groundAt(n.distance),route,groundAt});t.root.userData.number=layout.nodes.indexOf(n);models.push(t);line.add(t.root);}
  for(const [z,groundY,inward]of [[0,def.stationGround[1],1],[L,def.stationGround[-1],-1]]){const station=structures.createStation({z,groundY,route,inward,groundAt});models.push(station);line.add(station.root);}
  const cableM=new T.MeshStandardMaterial({color:0x475254,roughness:.65,metalness:.4}),haulM=new T.MeshStandardMaterial({color:0x66777c,roughness:.55,metalness:.5});
  function rope(x,fn,radius,material){class Path extends T.Curve{getPoint(t,target=new T.Vector3()){const s=-6+(L+12)*t;return target.set(x,fn(s),s);}}line.add(new T.Mesh(new T.TubeGeometry(new Path(),Math.max(100,Math.ceil(L/.9)),radius,6,false),material));}
  for(const side of [-1,1]){rope(side*lane,route,r.trackRadius,cableM);rope(side*lane,haul,r.haulRadius,haulM);}
  if(!def.preview)for(let i=0;i<2;i++){const c=factory.create(shape,i+1,false);line.add(c.g);if(i)c.g.rotation.y=Math.PI;Object.assign(c,{isSolo:true,riders:Array(12).fill(null),eye:new T.Vector3(0,1.62,.1),yaw:Math.PI+i*Math.PI,sway:0,s:0,door:0,speed:0,station:null,dwellRemaining:0});cabins.push(c);}
  const samples=[{z:0,s:0}];for(let z=1;z<L;z+=1){const p=samples.at(-1);samples.push({z,s:p.s+Math.hypot(z-p.z,route(z)-route(p.z))});}const last=samples.at(-1);samples.push({z:L,s:last.s+Math.hypot(L-last.z,route(L)-route(last.z))});const distance=samples.at(-1).s;
  function interval(table,value,key){let lo=0,hi=table.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(table[mid][key]<=value)lo=mid;else hi=mid;}return[table[lo],table[hi]];}
  const sAt=z=>{const[a,b]=interval(samples,z,'z');return a.s+(b.s-a.s)*(z-a.z)/(b.z-a.z);},zAt=s=>{const[a,b]=interval(samples,s,'s');return a.z+(b.z-a.z)*clamp((s-a.s)/(b.s-a.s),0,1);};
  const restrictions=layout.nodes.filter(n=>n.kind==='tower').flatMap(n=>{const s=sAt(n.distance);return[s,distance-s];}),acc=.65,table=samples.map(p=>{let v=Math.min(10.25,Math.sqrt(2*acc*p.s),Math.sqrt(2*acc*(distance-p.s)));for(const at of restrictions)v=Math.min(v,Math.sqrt(49+2*acc*Math.max(0,Math.abs(p.s-at)-10)));return{s:p.s,v,t:0};});
  for(let i=1;i<table.length;i++)table[i].v=Math.min(table[i].v,Math.sqrt(table[i-1].v**2+2*acc*(table[i].s-table[i-1].s)));for(let i=table.length-2;i>=0;i--)table[i].v=Math.min(table[i].v,Math.sqrt(table[i+1].v**2+2*acc*(table[i+1].s-table[i].s)));for(let i=1;i<table.length;i++)table[i].t=table[i-1].t+2*(table[i].s-table[i-1].s)/(table[i].v+table[i-1].v);
  const trip=table.at(-1).t,dwell=8,cycle=trip+dwell;let clock=0,previous=0;
  function update(dt){if(def.preview){root.updateMatrixWorld(true);return;}clock+=dt;const back=Math.floor(clock/cycle)%2===1,t=clock%cycle,docked=t<dwell;let s=0,v=0;if(!docked){const[a,b]=interval(table,t-dwell,'t'),elapsed=clamp(t-dwell-a.t,0,b.t-a.t),a0=(b.v-a.v)/(b.t-a.t);s=a.s+a.v*elapsed+.5*a0*elapsed*elapsed;v=a.v+a0*elapsed;}if(back)s=distance-s;const delta=s-previous;previous=s;
   for(let i=0;i<2;i++){const c=cabins[i],travel=i?distance-s:s,z=zAt(travel),theta=-Math.atan(layout.slopeAt(z));c.g.position.set((i?-1:1)*lane,route(z)-r.trackY*Math.cos(theta)-c.trolleyY,z-r.trackY*Math.sin(theta));c.trolley.rotation.x=i?-theta:theta;c.s=z;c.speed=v;c.station=docked?(travel<distance/2?'base':'top'):null;c.dwellRemaining=docked?dwell-t:0;c.door=docked?smooth(0,.8,t)*(1-smooth(dwell-1.5,dwell-.5,t)):0;for(const d of c.doors)d.g.position.z=d.closed+(d.open-d.closed)*c.door;for(const w of c.wheels)w.rotation.x+=delta/r.wheelRadius;}
   root.updateMatrixWorld(true);
   for(const m of models){for(const w of m.sheaves)w.wheel.rotation.x+=delta*w.side/w.radius;for(const w of m.haulSheaves){const c=cabins[w.side>0?0:1],point=c.trolley.localToWorld(new T.Vector3(0,r.haulY,-2.65*.36));line.worldToLocal(point);w.carrier.position.y=.15*(1-smooth(1.5,2.2,Math.abs(point.z-w.worldZ)));w.wheel.rotation.x-=delta*w.side/w.radius;}}
  }
  const LIFT={type:'solo',reversible:true,isChair:false,sideX:lane,capacity:12,carrierName:'Solo cabins',cableSpeed:10.25,stationSpeed:0,base:new T.Vector3(0,layout.start.height,half),top:new T.Vector3(0,layout.end.height,-half)};
  const boardingPoint=(seat,c)=>worldPoint(c?c.g.position.x<0?3.35:-3.35:0,half),unloadPoint=c=>worldPoint(c.g.position.x<0?3.35:-3.35,-half);
  const platformY=(x,z)=>{const dx=x-f.x,dz=z-f.z,lx=Math.cos(f.angle)*dx-Math.sin(f.angle)*dz,lz=Math.sin(f.angle)*dx+Math.cos(f.angle)*dz;for(const end of [-1,1]){const out=end*(lz-end*half);if(out>=-10&&out<=8&&(Math.abs(lx)<3.6||Math.abs(lx)>6.15&&Math.abs(lx)<8.65))return def.stationGround[end]+.6;}return null;};
  update(0);return{index,def,root,LIFT,cabins,layout,supports:layout.nodes.map((n,i)=>({z:half-n.distance,y:n.height,number:i,long:true})),cableHeight:z=>route(half-z),stationRoofs:[],stationTyres:[],towerWheels:[],update,worldPoint,platformY,boardingPoint,unloadPoint,queuePoint:i=>worldPoint(0,half+4+i*.9),skiOff:worldPoint(0,half+5),load:worldPoint(0,half),unload:worldPoint(0,-half),exit:worldPoint(2,-half+7),routes:ctx.routes.filter(r=>r.liftIndex===index),S_LOAD:0,S_UNLOAD:L,wrapDist:(a,b)=>Math.abs(a-b)};
 }
 return{Layout,layoutFor,create,dockOffset,angleA,angleB};
})();
