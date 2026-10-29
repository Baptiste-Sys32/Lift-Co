import * as T from 'three';

// The four approved shells, shared by the workshop and operational terminals.
export function selectedRefinements(h){
 const {shell,mechanical,M,box,beam,mesh,cylinder,pipe,prism,plaque,machinery,foot,batch,boardingY,architecture={}}=h;
 const V=(x,y,z)=>new T.Vector3(x,y,z);
 function pedestal(p,x,z,w,d){
  box(p,w,.32,d,x,.03,z,M.concrete);box(p,w*.65,.12,d*.65,x,.24,z,M.dark);
  for(const sx of [-1,1])for(const sz of [-1,1]){cylinder(p,.035,.13,x+sx*w*.23,.32,z+sz*d*.23,M.steel);cylinder(p,.065,.035,x+sx*w*.23,.38,z+sz*d*.23,M.steel);}
 }
 function handrail(p,a,b,y){
  const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.5);
  for(let i=0;i<=n;i++){const x=T.MathUtils.lerp(a[0],b[0],i/n),z=T.MathUtils.lerp(a[1],b[1],i/n);beam(p,[x,y,z],[x,y+1.05,z],.04,.04);}
  for(const dy of [.52,1.05])beam(p,[a[0],y+dy,a[1]],[b[0],y+dy,b[1]],.033,.033);
 }
 function frameWindow(p,{x,y,z,w,height,side=false}){
  box(p,side?.045:w,height,side?w:.045,x,y,z,M.glass);
  for(const sign of [-1,1]){box(p,side?.11:w+.12,.10,side?w+.12:.11,x,y+sign*height/2,z,M.dark);box(p,side?.11:.09,height,side?.09:.11,x+(side?0:sign*w/2),y,z+(side?sign*w/2:0),M.dark);}
  const count=Math.max(1,Math.round(w/1.5));for(let i=1;i<count;i++)box(p,side?.085:.065,height,side?.065:.085,x+(side?0:-w/2+w*i/count),y,z+(side?-w/2+w*i/count:0),M.steel);
 }
 function stairs(p,x,z,w,rise,run,steps,direction=1){
  for(let i=0;i<steps;i++)box(p,w,(i+1)*rise/steps,run/steps,x,(i+1)*rise/steps/2,z+direction*(run/2-(i+.5)*run/steps),M.concrete);
 }
 function roofSeam(a,b,material=M.steel){beam(shell,a,b,.025,.035,material);}
 function delta(){
  const half=2.12,z0=-3.85,z1=3.85,Y=5.7,rise=1.28,F=architecture.fixedFrameHalf??4.2;
  // A continuous, closed sheet-metal barrel. End plates use a valid simple
  // polygon instead of the old self-overlapping arc and duplicated base edge.
  const arc=Array.from({length:33},(_,i)=>{const a=i/32*Math.PI;return[half*Math.cos(a),Y+rise*Math.sin(a)];});
  for(let i=1;i<arc.length;i++){
   const [x,y]=arc[i-1],[xx,yy]=arc[i];
   const shape=[[x,y],[xx,yy],[xx,yy-.075],[x,y-.075]];prism(shell,shape,z0,z1,M.ivory);
  }
  box(shell,half*2,.12,z1-z0,0,Y-.04,0,M.steel);
  for(const z of [z0,z1]){
   const end=new T.Shape();arc.forEach(([x,y],i)=>i?end.lineTo(x,y):end.moveTo(x,y));end.closePath();const opening=new T.Path();opening.moveTo(-.775,5.88);opening.lineTo(-.775,6.4);opening.lineTo(.775,6.4);opening.lineTo(.775,5.88);opening.closePath();end.holes.push(opening);mesh(shell,new T.ExtrudeGeometry(end,{depth:.11,bevelEnabled:false}),M.ivory,0,0,z-.055);
   for(let i=1;i<arc.length;i++)beam(shell,[...arc[i-1],z],[...arc[i],z],.055,.065,M.steel);
   frameWindow(shell,{x:0,y:6.14,z:z+Math.sign(z)*.063,w:1.55,height:.52});
   for(const side of [-1,1])for(let i=0;i<6;i++)box(shell,.35,.028,.025,side*1.18,5.92+i*.075,z+Math.sign(z)*.07,M.dark);
  }
  for(let z=z0+.75;z<z1;z+=1.1)for(let i=1;i<arc.length;i++)roofSeam([...arc[i-1],z],[...arc[i],z]);
  // The casing is borne by a real lower cradle and four hanger struts.
  for(const side of [-1,1]){
   beam(mechanical,[side*1.6,5.57,-3.95],[side*1.6,5.57,3.95],.18,.24);
   for(const z of [-2.9,2.9]){beam(mechanical,[side*F,8.3,0],[side*1.6,5.57,z],.095,.12);box(mechanical,.24,.27,.24,side*1.6,5.57,z,M.steel);}
   for(const z of [-5,5])pedestal(mechanical,side*F,z,1.4,1.8);
  }
  for(const z of [-2.9,2.9])beam(mechanical,[-2.7,5.57,z],[2.1,5.57,z],.17,.22);
  plaque('DELTA / FIXED GRIP',2.2,0,5.91,z0-.062);
 }
 function princesse(L){
  const half=architecture.hallHalf??6.7,z0=-2,z1=L+5.8,roofHalf=half+.8,roofEave=8.45,rise=2.15,wallTop=roofEave+rise*(1-half/roofHalf),ridge=roofEave+rise;
  const floor=boardingY,sill=floor+.95,head=4.35;
  // Complete wall build-up: foundation, sill, actual glazed openings, timber
  // upper panels, corner posts and roof gables all share their edges.
  for(const side of [-1,1]){
   box(shell,.32,sill+.15,z1-z0,side*half,(sill-.15)/2,(z0+z1)/2,M.concrete);
   frameWindow(shell,{x:side*(half+.035),y:(sill+head)/2,z:(z0+z1)/2,w:z1-z0-.34,height:head-sill,side:true});
   box(shell,.24,wallTop-head,z1-z0,side*half,(wallTop+head)/2,(z0+z1)/2,M.wood);
   for(let y=head+.12;y<wallTop;y+=.23)box(shell,.025,.022,z1-z0,side*(half+.13),y,(z0+z1)/2,M.woodLight);
   for(let z=z0;z<z1+.01;z+=4.8){box(shell,.3,wallTop+.1,.32,side*half,wallTop/2,z,M.woodLight);beam(shell,[side*half,wallTop-1.45,z],[side*(half-1.45),wallTop,z],.17,.22,M.woodLight);}
   box(shell,.36,wallTop,.36,side*half,wallTop/2,z1,M.woodLight);
   box(shell,.18,.23,z1-z0+.5,side*half,wallTop-.1,(z0+z1)/2,M.woodLight);
  }
  // Two cable mouths and a central pedestrian door at the entrance.
  const portalH=7.25;
  for(const [a,b]of [[-1.45,-1.15],[1.15,1.45]])box(shell,b-a,portalH,.3,(a+b)/2,portalH/2,z0,M.wood);
  // The outer boarding decks have real pedestrian openings through the front
  // wall. Keep a doorway clear instead of routing guests through solid timber.
  for(const side of [-1,1]){const centre=Math.max(5.75,half-1.3),doorHalf=Math.min(.9,half-centre-.15),lo=centre-doorHalf,hi=centre+doorHalf,head=floor+2.6;
   for(const [a,b]of [[4.8,lo],[hi,half]])if(b>a)box(shell,b-a,portalH,.3,side*(a+b)/2,portalH/2,z0,M.wood);
   box(shell,doorHalf*2,portalH-head,.3,side*centre,(portalH+head)/2,z0,M.wood);if(floor>0)box(shell,doorHalf*2,floor,.3,side*centre,floor/2,z0,M.concrete);
   for(const x of [lo,hi])box(shell,.12,head-floor,.42,side*x,(head+floor)/2,z0,M.woodLight);box(shell,2*doorHalf+.2,.15,.42,side*centre,head,z0,M.woodLight);
   stairs(shell,side*centre,z0-1.2,2*doorHalf,floor,2.4,Math.max(1,Math.ceil(floor/.16)),1);
  }
  frameWindow(shell,{x:0,y:floor+1.3,z:z0-.025,w:2.2,height:2.6});box(shell,2.9,portalH-floor-2.65,.3,0,(portalH+floor+2.65)/2,z0,M.wood);
  for(const side of [-1,1]){for(const x of [side*1.45,side*4.8])box(shell,.15,portalH,.38,x,portalH/2,z0,M.woodLight);box(shell,3.35,.18,.38,side*3.125,portalH,z0,M.woodLight);}
  box(shell,half*2,wallTop-portalH,.3,0,(wallTop+portalH)/2,z0,M.wood);
  // The rear is a wall, not another accidental full-width cable exit.
  for(const side of [-1,1])box(shell,half-1.2,wallTop,.3,side*(half+1.2)/2,wallTop/2,z1,M.wood);
  frameWindow(shell,{x:0,y:floor+1.25,z:z1+.04,w:2.2,height:2.5});box(shell,2.4,wallTop-floor-2.55,.3,0,(wallTop+floor+2.55)/2,z1,M.wood);
  for(const z of [z0,z1])prism(shell,[[-half,wallTop],[0,ridge],[half,wallTop]],z-.15,z+.15,M.wood);
  for(const side of [-1,1]){
   const roof=box(shell,Math.hypot(roofHalf,rise),.18,z1-z0+1.8,side*roofHalf/2,roofEave+rise/2,(z0+z1)/2,M.dark);roof.rotation.z=-side*Math.atan2(rise,roofHalf);
   for(let x=.35;x<roofHalf;x+=.65){const y=roofEave+rise*(1-x/roofHalf)+.105;roofSeam([side*x,y,z0-.85],[side*x,y,z1+.85]);}
   beam(shell,[side*roofHalf,roofEave,z0-.9],[side*roofHalf,roofEave,z1+.9],.18,.24,M.dark);
   pipe(shell,[[side*(half+.28),wallTop,z1-.4],[side*(half+.28),.2,z1-.4]],.055,M.steel);
  }
  for(let z=z0+.4;z<z1;z+=4.8){beam(shell,[-half,wallTop-.12,z],[0,ridge-.12,z],.16,.24,M.woodLight);beam(shell,[0,ridge-.12,z],[half,wallTop-.12,z],.16,.24,M.woodLight);}
  box(shell,.25,.16,z1-z0+1.8,0,ridge+.06,(z0+z1)/2,M.steel);
  // An internal operator booth fits outside both moving cabin lanes.
  const x=half-.95,z=L-1.6;box(shell,1.4,1.1,3,x,floor+.55,z,M.wood);frameWindow(shell,{x,y:floor+1.8,z:z-1.51,w:1.3,height:1.4});box(shell,1.6,.14,3.2,x,floor+2.6,z,M.dark);
  for(const end of [-1,1]){const z=end<0?z0:z1;stairs(shell,0,z+end*1.2,2.2,floor,2.4,Math.ceil(floor/.16),-end);}
  plaque('LA PRINCESSE',4,0,8,z0-.155);
 }
 function wedgeWall(side,z0,z1,y0,y1){
  // Extruded concrete with actual holes. Local X is negative world Z.
  const shape=new T.Shape();shape.moveTo(-z0,0);shape.lineTo(-z1,0);shape.lineTo(-z1,y1);shape.lineTo(-z0,y0);shape.closePath();
  for(const z of [-6,0,6,12]){const cy=9.5+(z-z0)/(z1-z0)*(y1-y0),hole=new T.Path();hole.absarc(-z,cy,.37,0,2*Math.PI,true);shape.holes.push(hole);}
  if(side>0){const door=new T.Path();door.moveTo(-1,.6);door.lineTo(-1,3.25);door.lineTo(-3.4,3.25);door.lineTo(-3.4,.6);door.closePath();shape.holes.push(door);}
  const g=new T.ExtrudeGeometry(shape,{depth:.4,bevelEnabled:false,curveSegments:24});g.rotateY(Math.PI/2);mesh(shell,g,M.ivory,side*9.5-.2,0,0);
  for(const z of [-6,0,6,12]){const cy=9.5+(z-z0)/(z1-z0)*(y1-y0);const pane=cylinder(shell,.355,.035,side*9.5,cy,z,M.glass,'x');const ring=mesh(shell,new T.TorusGeometry(.38,.04,8,32),M.steel,side*9.5+side*.22,cy,z);ring.rotation.y=Math.PI/2;}
 }
 function faron(){
  const z0=-13,z1=16.4,y0=11.15,frontH=architecture.portalHeight??11.65,y1=Math.max(16.1,frontH+2),half=9.5;
  for(const side of [-1,1]){wedgeWall(side,z0,z1,y0,y1);box(shell,.7,.48,z1-z0+.7,side*half,.02,(z0+z1)/2,M.concrete);}
  // A substantial slab and fascia seat directly on the sloping side walls.
  const length=Math.hypot(z1-z0,y1-y0),roof=box(shell,20.2,.34,length+1.2,0,(y0+y1)/2+.08,(z0+z1)/2,M.ivory);roof.rotation.x=-Math.atan2(y1-y0,z1-z0);
  for(const side of [-1,1])beam(shell,[side*9.85,y0-.12,z0-.5],[side*9.85,y1-.12,z1+.5],.22,.38,M.concrete);
  // Front facade closes the wedge above two uninterrupted cable portals.
  for(const [a,b]of [[-half,-7],[-3.3,-1.25],[1.25,3.3],[7,half]])box(shell,b-a,frontH,.4,(a+b)/2,frontH/2,z1,M.ivory);
  frameWindow(shell,{x:0,y:1.9,z:z1+.04,w:2.4,height:2.6});frameWindow(shell,{x:0,y:6.1,z:z1+.04,w:2.4,height:5.7});box(shell,2.5,frontH-8.95,.4,0,(frontH+8.95)/2,z1,M.ivory);
  box(shell,half*2,y1-frontH,.4,0,(y1+frontH)/2,z1,M.ivory);
  box(shell,2.5,.6,z1-z0,0,.3,(z0+z1)/2,M.concrete);box(shell,1.6,.6,2.6,9.05,.3,2.2,M.concrete);
  // Back service elevation: a real closed wall and framed access door.
  for(const side of [-1,1])box(shell,half-1.15,y0,.4,side*(half+1.15)/2,y0/2,z0,M.ivory);
  frameWindow(shell,{x:0,y:1.85,z:z0-.035,w:2.2,height:2.5});box(shell,2.3,y0-3.15,.4,0,(y0+3.15)/2,z0,M.ivory);
  for(const side of [-1,1])for(let y=5.2;y<8;y+=.2)box(shell,2.4,.08,.08,side*5,y,z0-.23,M.dark);
  // Closed public wing with its floor on the same .6 m boarding datum.
  const x0=9.7,x1=16.2,a=-5,b=11.8,floor=.6,top=5.1;
  box(shell,x1-x0,.3,b-a,(x0+x1)/2,.45,(a+b)/2,M.concrete);box(shell,x1-x0+.6,.24,b-a+.6,(x0+x1)/2,top,(a+b)/2,M.ivory);
  for(const z of [a,b]){for(const [lo,hi]of [[x0,x0+2.25],[x0+4.25,x1]])box(shell,hi-lo,top-.6,.24,(lo+hi)/2,(top+.6)/2,z,M.ivory);frameWindow(shell,{x:x0+3.25,y:1.9,z,w:1.9,height:2.6});box(shell,2.05,1.75,.24,x0+3.25,4.1,z,M.ivory);}
  box(shell,.24,1.05,b-a,x1,1.125,(a+b)/2,M.ivory);frameWindow(shell,{x:x1+.015,y:3.25,z:(a+b)/2,w:b-a-.3,height:3.1,side:true});
  box(shell,.25,.24,b-a,x1,4.92,(a+b)/2,M.ivory);for(const z of [a,b])box(shell,.3,top,.3,x1,top/2,z,M.ivory);
  for(const z of [a+.4,b-.4])pedestal(shell,x1,z,.9,1.1);
  stairs(shell,x0+3.25,b+1.2,2.2,.6,2.4,4,-1);stairs(shell,0,z1+1.2,2.3,.6,2.4,4,-1);
  plaque('FARON',3.3,x0+3.25,4.25,b+.126).rotation.y=0;
  // Cable portals are deliberate openings. The fascia has supported edges.
  for(const side of [-1,1]){beam(shell,[side*3.3,.6,z1],[side*3.3,frontH,z1],.14,.18,M.steel);beam(shell,[side*7,.6,z1],[side*7,frontH,z1],.14,.18,M.steel);}
 }
 function sheave(p,x,y,z,r=.28){
  const node=new T.Group();node.position.set(x,y,z);p.add(node);
  const profile=[[r-.09,-.12],[r+.022,-.12],[r+.025,-.075],[r-.018,-.028],[r-.018,.028],[r+.025,.075],[r+.022,.12],[r-.09,.12]].map(([a,b])=>new T.Vector2(a,b));
  const rim=new T.LatheGeometry(profile,32);rim.rotateZ(Math.PI/2);mesh(node,rim,M.steel);const web=cylinder(node,r-.085,.09,0,0,0,M.dark,'x');
  cylinder(node,.07,.32,0,0,0,M.steel,'x');for(const side of [-1,1])for(let i=0;i<6;i++){const a=i*Math.PI/3;cylinder(node,.018,.025,side*.067,Math.cos(a)*r*.52,Math.sin(a)*r*.52,M.ivory,'x');}
  node.userData.runningRadius=r;return node;
 }
 function funitelCore(role){
  const H=3.6,front=-11,back=11,deck=.2275,pulleys=[],rollers=[];
  const m={...M,silver:M.steel,rope:M.rubber,woodDark:M.dark,floor:M.dark};
  const terminal=window.LiftCoFunitelTerminals.createFactory(T,{M:m,geo:(_,fn)=>fn(),mesh,box,beam,cylinder,batch,wheel:sheave}).make({parent:mechanical,kind:role==='valley'?'drive':'return',H,back});
  // Remove the old timber station completely; there is one steel load path.
  box(mechanical,3.92,.5,23,0,deck-.25,.5,M.concrete);
  for(const side of [-1,1]){
   box(mechanical,1.9,.5,23,side*5.99,deck-.25,.5,M.concrete);box(mechanical,.07,.025,21.5,side*1.91,deck+.016,0,M.yellow);box(mechanical,.07,.025,21.5,side*5.08,deck+.016,0,M.yellow);
   handrail(mechanical,[side*6.88,-10.7],[side*6.88,11.7],deck);
   for(const x of [side*2,side*5]){
    pipe(mechanical,[[x,H,-26],[x,H,2.35]],.018,M.rubber);
    for(let k=0;k<7;k++){const z=front-2.9+k*.58,w=sheave(mechanical,x,H-.28,z,.28);rollers.push(w);w.userData.direction=-side;beam(mechanical,[x-.17,H-.28,z],[x-.17,H-.70,z],.065,.10);}
    beam(mechanical,[x,H-.7,front-3.25],[x,H-.7,front+.85],.16,.22);
    for(const z of [front-2.7,front+.6])beam(mechanical,[side*6.4,5.7,z],[x,H-.7,z],.13,.18);
   }
  }
  box(mechanical,13.9,.5,2,0,deck-.25,12,M.concrete);
  const motorRotors=[];
  if(role==='valley'){
   for(const x of [-2.9,2.9])box(mechanical,1.3,.25,1.8,x,deck+.125,back-2.25,M.concrete);
   for(const [x,z]of [[-4.6,2.8],[4.6,5.15]]){beam(mechanical,[x,H+.78,z],[x,5.7,z],.13,.17);beam(mechanical,[-6.4,5.7,z],[6.4,5.7,z],.18,.26);}
   const fan=new T.Group();fan.position.set(0,H+1.16,back-2.25-2.02);mechanical.add(fan);
   for(let i=0;i<6;i++){const a=i*Math.PI/3;beam(fan,[.08*Math.cos(a),.08*Math.sin(a),0],[.29*Math.cos(a+.16),.29*Math.sin(a+.16),0],.04,.03,M.dark);}motorRotors.push(fan);
  }else{
   for(const x of [-5.4,5.4]){pedestal(mechanical,x,back-1.65,1.1,1.3);box(mechanical,.4,H-.85-deck,.5,x,(H-.85+deck)/2,back-1.65,M.steel);}
  }
  return{ropeY:H,front,back,length:22,pulleys:terminal.pulleys,rollers,motorRotors,detailTarget:[0,4.3,8],setDrive(d){terminal.setDrive(d);for(const w of rollers)w.rotation.x=w.userData.direction*d/.28;for(const r of motorRotors)r.rotation.z=d/2*48;}};
 }
 function bouquetin(){
  const top=5.7,front=-11,back=12.8;
  for(const side of [-1,1]){
   for(const z of [-10,0,10.5]){const x=side*6.4;pedestal(shell,x+side*.65,z,1.5,1.8);beam(shell,[x+side*.65,.3,z],[x,top,z],.32,.38);beam(shell,[x,3.9,z],[x-side*1.5,top,z],.16,.22);}
   // Steel lattice, not duplicate wood and metal frames in the same place.
   for(const y of [4.65,top])beam(shell,[side*6.4,y,front-3.3],[side*6.4,y,back],.19,.24);
   for(let z=front-3.3;z<back;z+=2.5){const end=Math.min(z+2.5,back);beam(shell,[side*6.4,4.65,z],[side*6.4,top,end],.08,.11);beam(shell,[side*6.4,top,z],[side*6.4,4.65,end],.08,.11);}
   machinery.walk(shell,[V(side*6.4,0,front-3.3),V(side*6.4,0,back)],.9,5.88);
   for(const z of [front-3.3,back])beam(shell,[side*6.4,4.65,z],[side*6.4,top,z],.15,.19);
  }
  for(const z of [-10,0,10.5])beam(shell,[-6.4,top,z],[6.4,top,z],.25,.36);
  // Short rear machine room: closed back and sides, open access from the bays.
  const a=7.6,b=13.1,half=6.95;
  for(const side of [-1,1]){box(shell,.2,1.3,b-a,side*half,.65,(a+b)/2,M.dark);frameWindow(shell,{x:side*(half+.025),y:2.5,z:(a+b)/2,w:b-a-.2,height:2.35,side:true});box(shell,.2,2,b-a,side*half,4.7,(a+b)/2,M.steel);}
  for(const side of [-1,1])box(shell,half-1.05,5.7,.25,side*(half+1.05)/2,2.85,b,M.steel);frameWindow(shell,{x:0,y:1.5275,z:b+.04,w:1.95,height:2.6});box(shell,2.1,2.8725,.25,0,4.26375,b,M.steel);
  box(shell,14.3,.2,b-a+.65,0,5.8,(a+b)/2,M.steel);
  for(let x=-6.8;x<7;x+=.7)roofSeam([x,5.915,a-.3],[x,5.915,b+.3],M.dark);
  // Service ladder lands on the gallery. Posts support the sign and guardrail.
  const x=7.05,z=4.9;for(const dx of [-.22,.22])beam(shell,[x+dx,.2,z],[x+dx,6.9,z],.045,.045);for(let y=.35;y<5.9;y+=.3)beam(shell,[x-.22,y,z],[x+.22,y,z],.035,.035);
  for(const x of [-2.2,2.2])beam(shell,[x,5.7,-10],[x,6.9,-10],.08,.1);beam(shell,[-2.2,6.9,-10],[2.2,6.9,-10],.1,.12);beam(shell,[-2.2,6.4,-10],[2.2,6.4,-10],.08,.12);plaque('3 VALLEES',3.5,0,6.4,-10.065);
 }
 return{delta,princesse,faron,bouquetin,funitelCore};
}
