import * as T from 'three';
import {selectedRefinements} from './station-selected-refinements.js?v=polish-20261020-1';

// Estimated reference geometry from the credited photographs. Shared shells
// have distinct load paths; operational cable routes stay in their runtimes.
export function referenceFactory({root,shell,mechanical,mats,box,beam,surface,plaque,batch,boardingY=.56,gearLift=0,bodyHalf=1.2,fixedRadius=2.2,drawRopes=true,architecture={}}){
 const M=mats,rotors=[],motorRotors=[],cache=new Map();
 const mesh=(p,g,m,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o;};
 const cylinder=(p,r,h,x,y,z,m=M.steel,axis='y')=>{const o=mesh(p,new T.CylinderGeometry(r,r,h,24),m,x,y,z);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o;};
 const pipe=(p,points,r,m)=>{const ps=points.map(v=>v.isVector3?v:new T.Vector3(...v));return mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(ps,false,'centripetal'),Math.max(2,ps.length*3),r,6,false),m);};
 const machinery=window.LiftCoStudyMachinery.createFactory(T,{geo:(k,fn)=>{if(!cache.has(k))cache.set(k,fn());return cache.get(k);},mesh,box,beam,cylinder,pipe,steel:M.steel,dark:M.dark,rubber:M.rubber,yellow:M.yellow});
 function prism(p,points,z0,z1,m){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return mesh(p,new T.ExtrudeGeometry(s,{depth:z1-z0,bevelEnabled:false}),m,0,0,z0);}
 function foot(x,z,w=1.6,d=2){box(mechanical,w,.35,d,x,-.05,z,M.concrete);}
 function pier(x,z,top=6.5,w=.7,d=1){foot(x,z,w+1,d+1);box(mechanical,w,top,d,x,top/2,z,M.concrete);box(mechanical,w+.15,.16,d+.15,x,top,z,M.steel);}
 function tubeLeg(x,z,top=6.5,spread=.6){foot(x+Math.sign(x)*spread,z);beam(mechanical,[x+Math.sign(x)*spread,.15,z],[x,top,z],.34,.4);}
 function panelRoof(half,y,rise,z0,z1,m=M.dark){for(const side of [-1,1]){const slope=box(shell,Math.hypot(half,rise),.15,z1-z0,side*half/2,y+rise/2,(z0+z1)/2,m);slope.rotation.z=-side*Math.atan2(rise,half);}for(let z=z0+.3;z<z1;z+=2.5)for(const side of [-1,1])beam(shell,[0,y+rise-.2,z],[side*half,y-.2,z],.13,.22,M.wood);}
 function timberWall(x,z0,z1,y0,y1){box(shell,.17,y1-y0,z1-z0,x,(y0+y1)/2,(z0+z1)/2,M.wood);for(let y=y0+.2;y<y1;y+=.25)box(shell,.025,.025,z1-z0,x+Math.sign(x)*.1,y,(z0+z1)/2,M.woodLight);}
 function rail(p,x,z0,z1,y=.4){for(let z=z0;z<=z1+.01;z+=1.6)beam(p,[x,y,z],[x,y+1.05,z],.045);for(const dy of [.5,1.05])beam(p,[x,y+dy,z0],[x,y+dy,z1],.035,.035);}
 function hut(x,z,{wood=false}={}){box(shell,2.8,2.65,3.2,x,1.325,z,wood?M.wood:M.ivory);box(shell,2.5,1.1,.035,x,1.8,z-1.62,M.glass);for(const dx of [-1.25,0,1.25])box(shell,.055,1.2,.06,x+dx,1.8,z-1.65,M.dark);box(shell,.04,1.1,2,x-1.42,1.8,z,M.glass);box(shell,3.2,.16,3.65,x,2.78,z,M.dark);}
 function straightRope(x,z0,z1,y){pipe(mechanical,[[x,y,z0],[x,y,z1]],.026,M.rubber);}
 function drivenMotor(parent,options){
  const motor=machinery.motor(parent,options),fan=new T.Group(),coupling=new T.Group();motor.add(fan,coupling);fan.position.set(0,.08,-1.065);coupling.position.set(0,.08,.66);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;beam(fan,[.09*Math.cos(a),.09*Math.sin(a),0],[.31*Math.cos(a+.18),.31*Math.sin(a+.18),0],.045,.035,M.dark);}
  const ring=mesh(coupling,new T.TorusGeometry(.12,.025,6,20),M.steel);box(coupling,.07,.05,.08,.10,0,0,M.red);
  motorRotors.push(fan,coupling);return motor;
 }
 function circularReturn(x,y,z,r,a,b){pipe(mechanical,Array.from({length:65},(_,i)=>{const t=T.MathUtils.lerp(a,b,i/64);return[x+r*Math.cos(t),y,z+r*Math.sin(t)];}),.026,M.rubber);}
 function terminalSample(distance,L,R,start){
  const length=2*(L-start)+Math.PI*R,s=((distance%length)+length)%length;
  if(s<L-start)return{x:R,z:start+s,yaw:0,visible:start+s>start+.35};
  if(s<L-start+Math.PI*R){const a=(s-L+start)/R;return{x:R*Math.cos(a),z:L+R*Math.sin(a),yaw:-a,visible:true};}
  const z=L-(s-(L-start+Math.PI*R));return{x:-R,z,yaw:Math.PI,visible:z>start+.35};
 }
 function fixedCore(form,role){
  const H=5.2,R=fixedRadius,F=architecture.fixedFrameHalf??4.2,Z=0,contactR=R-.018+.026;rotors.push(machinery.bullwheel(mechanical,{y:H,z:Z,radius:R,brakes:role==='valley'}));
  if(drawRopes){straightRope(-contactR,-10,0,H);straightRope(contactR,-10,0,H);circularReturn(0,H,0,contactR,0,Math.PI);}machinery.bearing(mechanical,0,H+.3,0);
  if(form==='delta'){
   for(const x of [-F,F]){for(const z of [-5,5])foot(x,z);beam(mechanical,[x,.15,-5],[x,8.35,0],.25,.34);beam(mechanical,[x,.15,5],[x,8.35,0],.25,.34);beam(mechanical,[x,2,-3.85],[x,2,3.85],.17,.2);}
   beam(mechanical,[-F,8.3,0],[F,8.3,0],.25,.4);for(const x of [-1,1])beam(mechanical,[x,8.3,0],[x,5.65,0],.12,.17);
  }else if(form==='alpha'){
   for(const z of [-2.8,2.8])pier(0,z,5.65,.8,1.1);beam(mechanical,[0,5.65,-4],[0,5.65,4],.45,.55);
  }else{pier(0,0,5.9,1.2,1.8);for(const x of [-2.3,2.3])beam(mechanical,[0,5.5,0],[x,5.9,0],.23,.28);}
  if(role==='valley'){drivenMotor(mechanical,{y:6.6,z:-1.2,scale:.85});box(mechanical,2,.25,3,0,6.1,-1.2,M.steel);}beam(mechanical,[0,5.3,0],[0,6.25,0],.34,.34);
  machinery.walk(mechanical,[new T.Vector3(-2.65,0,-2.5),new T.Vector3(-2.65,0,2.8)],.65,5.8);
  const ladderX=-2.8;for(const x of [ladderX-.18,ladderX+.18])beam(mechanical,[x,.1,2.6],[x,5.9,2.6],.045);for(let y=.3;y<5.9;y+=.3)beam(mechanical,[ladderX-.18,y,2.6],[ladderX+.18,y,2.6],.035);
  hut(form==='delta'?-F-2.1:-5.5,2,{wood:form==='delta'});return{trackY:H,contactR,centerZ:0,length:7,pulleys:rotors,rollers:[],motorRotors,sample:d=>terminalSample(d,0,contactR,-10),detailTarget:[0,5.8,0]};
 }
 function terminalCore(form,category,role){
  const L=category==='gondola'?23:form==='leitner'?17:21,H=5.2,R=3.1;
  const samples=Array.from({length:121},(_,i)=>({x:0,z:i/120*L,nx:1,nz:0,yaw:0}));
  const conveyor=machinery.conveyor(mechanical,samples,{railX:R,trackY:H+gearLift});
  // Each lane joins an actual half-circle rail at the rear of the station.
  const points=[];for(let i=0;i<=60;i++){const a=i/60*Math.PI;points.push([R*Math.cos(a),H-.11+gearLift,L+R*Math.sin(a)]);}
  pipe(mechanical,points,.04,machinery.alloy);
  for(let i=0;i<=14;i++){const a=i/14*Math.PI,x=(R+.12)*Math.cos(a),z=L+(R+.12)*Math.sin(a);const w=machinery.tyre(mechanical,x,H+.33+gearLift,z,-a);w.userData.laneSide=1;conveyor.rollers.push(w);beam(mechanical,[(R-.3)*Math.cos(a),H+1,L+(R-.3)*Math.sin(a)],[x,H+.33+gearLift,z],.07,.1);}
  pipe(mechanical,Array.from({length:40},(_,i)=>{const a=i/39*Math.PI;return[(R-.3)*Math.cos(a),H+1,L+(R-.3)*Math.sin(a)];}),.11,M.dark);
  rotors.push(machinery.bullwheel(mechanical,{z:L,y:H,radius:2.55,brakes:role==='valley'}));for(const x of [-2.558,2.558])straightRope(x,-6,L,H);circularReturn(0,H,L,2.558,0,Math.PI);
  for(const z of [4,L-2]){pier(0,z,H+1.35,.85,1.15);beam(mechanical,[-4.1,H+1.35,z],[4.1,H+1.35,z],.28,.36);}
  for(const x of [-3.85,3.85])beam(mechanical,[x,H+1.35,0],[x,H+1.35,L+1.5],.22,.28);
  if(role==='valley')drivenMotor(mechanical,{y:H+2.05,z:L-1.3,scale:.85});
  machinery.walk(mechanical,[new T.Vector3(0,0,3),new T.Vector3(0,0,L-3)],.9,H+1.65);
  // Gondola passenger floors sit outside the moving cabin envelope.
  if(category==='gondola'){
   const inner=R+bodyHalf+.04,outer=6.45,centerEdge=R-bodyHalf-.04;
   const front=form==='princesse'?-2:-.5,back=form==='princesse'?L+5.8:L+.5;
   for(const side of [-1,1]){box(mechanical,outer-inner,boardingY+.15,back-front,side*(inner+outer)/2,(boardingY-.15)/2,(front+back)/2,M.concrete);rail(mechanical,side*(outer-.1),front,back,boardingY);}
   if(form==='princesse'){box(mechanical,2.2,boardingY+.15,2,0,(boardingY-.15)/2,-1,M.concrete);box(mechanical,13.4,boardingY+.15,1.3,0,(boardingY-.15)/2,L+5.15,M.concrete);}
   box(mechanical,centerEdge*2,boardingY+.15,L-2.4,0,(boardingY-.15)/2,(L-2.4)/2,M.concrete);
  }
  if(form!=='princesse')hut(-7.2,L-2);
  return{trackY:H,centerZ:L/2,length:L,pulleys:rotors,rollers:conveyor.rollers,motorRotors,sample:d=>terminalSample(d,L,R,-7),detailTarget:[0,H+1,L]};
 }
 function upperBody({half=4.55,z0=-1,z1=24,bottom=6.55,eave=8.25,rise=.8,style='satellit'}){
  if(style==='satellit'){
   // Rounded plan ends, pale roof and a separate continuous glazing belt.
   const R=half,front=z0+R,back=z1-R,outline=[];
   for(let i=0;i<=24;i++){const a=Math.PI+i/24*Math.PI;outline.push([R*Math.cos(a),front+R*Math.sin(a)]);}
   for(let i=0;i<=24;i++){const a=i/24*Math.PI;outline.push([R*Math.cos(a),back+R*Math.sin(a)]);}
   const shape=new T.Shape();outline.forEach(([x,z],i)=>i?shape.lineTo(x,z):shape.moveTo(x,z));shape.closePath();const cap=mesh(shell,new T.ExtrudeGeometry(shape,{depth:.15,bevelEnabled:false}),M.ivory);cap.rotation.x=Math.PI/2;cap.position.y=eave+rise;
   for(let i=1;i<outline.length;i++){const a=outline[i-1],b=outline[i];surface(shell,[[[a[0],bottom,a[1]],[b[0],bottom,b[1]]],[[a[0],eave,a[1]],[b[0],eave,b[1]]]],M.glass);beam(shell,[a[0],bottom,a[1]],[a[0],eave+.1,a[1]],.065,.085,M.dark);beam(shell,[a[0],bottom,a[1]],[b[0],bottom,b[1]],.1,.16,M.paint);surface(shell,[[[a[0],eave,a[1]],[b[0],eave,b[1]]],[[a[0]*.88,eave+rise,a[1]],[b[0]*.88,eave+rise,b[1]]]],M.ivory);}
   for(let z=front;z<back;z+=1.5)beam(shell,[-half*.88,eave+rise+.025,z],[half*.88,eave+rise+.025,z],.025,.045,M.steel);
  }else if(style==='leitner'){
   prism(shell,[[-half,bottom],[-half,eave-.5],[-half+.65,eave],[half-.65,eave],[half,eave-.5],[half,bottom],[half-.2,bottom+.2],[-half+.2,bottom+.2]],z0,z1,M.ivory);
   // Clear nose glazing and opaque, ribbed side access panels.
   box(shell,half*1.65,1.25,.035,0,eave-.85,z0-.03,M.glass);for(const x of [-half*.82,0,half*.82])box(shell,.055,1.3,.06,x,eave-.85,z0-.06,M.dark);
   for(const side of [-1,1]){box(shell,.045,.5,z1-z0-.8,side*(half+.025),bottom+.45,(z0+z1)/2,M.dark);for(let z=z0+.5;z<z1;z+=2.5)box(shell,.045,1,z1>z+2?2:1,side*(half+.04),eave-.6,z+.65,M.steel);}
  }else{
   // UNI-G has a barrel profile, repeated transverse ribs and pale end rings.
   const profile=Array.from({length:29},(_,i)=>{const a=i/28*Math.PI;return[Math.cos(a)*half,bottom+Math.sin(a)*(eave+rise-bottom)];});
   for(let i=1;i<profile.length;i++)surface(shell,[[[...profile[i-1],z0],[...profile[i],z0]],[[...profile[i-1],z1],[...profile[i],z1]]],i>7&&i<22?M.dark:M.glass);
   for(let z=z0;z<=z1+.01;z+=1.35)for(let i=1;i<profile.length;i++)beam(shell,[...profile[i-1],z],[...profile[i],z],.07,.09,M.dark);
   for(const z of [z0,z1]){for(let i=1;i<profile.length;i++)beam(shell,[...profile[i-1],z],[...profile[i],z],.22,.3,M.ivory);box(shell,half*2,.23,.3,0,bottom,z,M.ivory);}
   for(const side of [-1,1]){box(shell,.22,.22,z1-z0,side*half,bottom,(z0+z1)/2,M.ivory);box(shell,.32,.42,1.7,side*2.55,5.7,z0-.8,M.red);}
  }
 }
 function alpha(){
  const profile=[[-2.65,5.9],[-2.65,7.05],[-2.2,7.65],[2.2,7.65],[2.65,7.05],[2.65,5.9]];
  // Opaque flat crown and radiused shoulders, not a transparent barrel roof.
  for(let i=1;i<profile.length-1;i++)surface(shell,[[[...profile[i],-3.6],[...profile[i+1],-3.6]],[[...profile[i],3.6],[...profile[i+1],3.6]]],mats.dark);
  for(const z of [-3.6,3.6]){prism(shell,profile,z,z+.04,M.glass);for(let i=1;i<profile.length;i++)beam(shell,[...profile[i-1],z],[...profile[i],z],.10,.11,M.steel);for(const x of [-1.75,-.85,0,.85,1.75])box(shell,.06,1.5,.08,x,6.7,z-.03,M.steel);}
  for(const side of [-1,1]){box(shell,.12,.23,7.3,side*2.65,5.95,0,M.ivory);box(shell,.035,1.05,6.9,side*2.68,6.6,0,M.glass);}
  plaque('ALPHA',1.7,0,6,-3.75);
 }
 function fixedLeitner(){upperBody({half:2.55,z0:-3.5,z1:3.5,bottom:5.7,eave:7.8,rise:.65,style:'satellit'});for(const side of [-1,1])box(shell,.08,.4,6.4,side*2.58,5.85,0,M.red);}
 function satellit(L){upperBody({half:4.5,z0:-1.6,z1:L+4.1,bottom:6.55,eave:8.1,rise:.65});plaque('SATELLIT',2.8,0,7,-1.65);}
 function leitner(L){upperBody({half:4.6,z0:-.7,z1:L+3.8,bottom:6.55,eave:8.5,rise:0,style:'leitner'});plaque('LEITNER',2.3,0,7,-.76);}
 function unig(L){upperBody({half:4.45,z0:-1,z1:L+3.7,bottom:6.55,eave:8.2,rise:.8,style:'unig'});}
 function dline(L){
  const half=7.6,z0=-2,z1=L+5,H=8.6;box(shell,half*2+.5,.38,z1-z0+.5,0,H,(z0+z1)/2,M.dark);
  for(const side of [-1,1]){box(shell,.38,H,z1-z0,side*half,H/2,(z0+z1)/2,M.dark);for(let z=z0+.2;z<z1;z+=.32)box(shell,.035,H,.045,side*(half+.21),H/2,z,M.steel);}
  for(const side of [-1,1]){box(shell,2.9,H,.4,side*6.15,H/2,z0,M.dark);box(shell,2.2,H,.4,side*6.5,H/2,z1,M.dark);}box(shell,9.4,1.4,.4,0,H-.7,z0,M.dark);
  box(shell,5,2.4,7,1,H+1.35,z1-3.6,M.dark);box(shell,4,.8,.05,1,H+1.25,z1-.07,M.glass);plaque('GONDOLA',2.8,-5.9,5.7,z0-.25);
  // A public-side glazed waiting room occupies only the outer wing.
  box(shell,2.1,3.5,7,-6.3,1.75,z1-4,M.glass);for(const z of [z1-7.5,z1-4,z1-.5])box(shell,.1,3.5,.1,-7.7,1.75,z,M.ivory);
 }
 function tramBase(){
  for(const side of [-1,1]){box(shell,1.4,10.8,25,side*9.1,5.4,1,M.concrete);for(const z of [-10,8])foot(side*9.1,z,2,2.5);}
  box(shell,5.8,.4,25,0,.05,1,M.concrete);
 }
 function rochebrune(){
  tramBase();panelRoof(10.1,11.3,.55,-12,16,M.dark);
  for(const side of [-1,1]){timberWall(side*9.85,-12,16,3.5,11.2);box(shell,.06,2.1,20,side*9.96,5.5,1,M.glass);for(let z=-9;z<13;z+=2.3)box(shell,.08,2.2,.09,side*10,5.5,z,M.woodLight);}
  for(const z of [-12,15.5]){box(shell,6.1,11.2,.3,0,5.6,z,M.wood);for(const side of [-1,1])box(shell,3.2,11.2,.3,side*8.3,5.6,z,M.wood);box(shell,13.5,1.3,.3,0,10.55,z,M.wood);}
  plaque('ROCHEBRUNE',4,0,10.6,15.72).rotation.y=0;
 }
 function saleve(){
  // Concrete side beams carry the rounded upper hall, leaving both docks open.
  for(const side of [-1,1]){box(shell,1,9.7,25,side*9,4.85,1,M.concrete);box(shell,1.35,.7,28,side*9,9.7,1,M.ivory);}
  const half=10.1,front=10.5,back=-12,profile=[];
  for(let i=0;i<=40;i++){const a=i/40*Math.PI;profile.push([half*Math.cos(a),front+half*.52*Math.sin(a)]);}
  const outline=[[-half,back],[-half,front],...profile.slice().reverse(),[half,back]],shape=new T.Shape();outline.forEach(([x,z],i)=>i?shape.lineTo(x,z):shape.moveTo(x,z));shape.closePath();
  for(const y of [10.1,14.4]){const cap=mesh(shell,new T.ExtrudeGeometry(shape,{depth:.25,bevelEnabled:false}),M.ivory);cap.rotation.x=Math.PI/2;cap.position.y=y;}
  for(let i=1;i<outline.length;i++){const [x,z]=outline[i-1],[x2,z2]=outline[i];surface(shell,[[[x,10.2,z],[x2,10.2,z2]],[[x,14.2,z],[x2,14.2,z2]]],M.glass);beam(shell,[x,10.1,z],[x,14.4,z],.12,.13,M.steel);}
  for(const side of [-1,1])for(let z=back;z<front;z+=2.2)beam(shell,[side*half,10.1,z],[side*half,14.4,z],.1,.12,M.steel);
  // Central bridge entrance and real side stair, clear of the two cabin bays.
  box(shell,4.5,.35,23,0,.15,1,M.concrete);box(shell,4.6,3.4,.12,0,1.8,15.5,M.glass);for(let i=0;i<18;i++)box(shell,2.3,.25,.62,11.5,.2+i*.27,13-i*.58,M.concrete);box(shell,3,.3,3,11.5,5.1,1,M.concrete);plaque('SALEVE',3,0,9.5,15.6).rotation.y=0;
 }
 function rocharbois(){
  panelRoof(7.1,5.7,1.8,-11.5,12.5);for(const side of [-1,1]){timberWall(side*6.8,-11,12,1,5.7);for(const z of [-10,10]){box(shell,.3,5.7,.3,side*6.8,2.85,z,M.woodLight);beam(shell,[side*6.8,3.8,z],[side*5.1,5.7,z],.18,.2,M.woodLight);}box(shell,.04,1,17,side*6.92,2.4,0,M.glass);}
  for(const z of [-11,12]){box(shell,3.5,5.7,.2,0,2.85,z,M.wood);prism(shell,[[-6.8,5.7],[0,7.5],[6.8,5.7]],z,z+.1,M.wood);}plaque('ROCHARBOIS',3,0,5.4,-11.2);
 }
 function caboche(){
  const front=-11,back=12;surface(shell,[[[-7.5,6,front],[7.5,6,front]],[[-7.5,7.15,back],[7.5,7.15,back]]],M.dark);
  for(const side of [-1,1]){timberWall(side*6.8,2,back,3.8,6.7);for(const z of [-9,0,10]){const H=6+(z-front)/(back-front)*1.15;tubeLeg(side*6.8,z,H,.3);beam(shell,[side*6.8,H-1.7,z],[side*5.3,H,z],.15,.22);beam(shell,[side*6.8,H-1.7,z],[side*6.8,H,z+1.5],.15,.2);}}
  box(shell,3.2,2.5,6,0,5.35,8,M.wood);box(shell,3.22,.9,.04,0,5.4,4.97,M.glass);for(const x of [-6.7,6.7])rail(shell,x,-10,10,.6);plaque('CABOCHE',2.8,0,6.1,-11.1);
 }
 const selected=selectedRefinements({shell,mechanical,M,box,beam,mesh,cylinder,pipe,prism,plaque,machinery,foot,batch,boardingY,architecture});
 const buildings={alpha,delta:selected.delta,'fixed-leitner':fixedLeitner,satellit,leitner,unig,princesse:selected.princesse,dline,rochebrune,faron:selected.faron,saleve,rocharbois,caboche,bouquetin:selected.bouquetin};
 return{fixedCore,terminalCore,funitelCore:selected.funitelCore,build(form,length){if(!buildings[form])throw Error('Unknown station reference: '+form);buildings[form](length);},disposeCache(){for(const g of cache.values())g.dispose();}};
}
