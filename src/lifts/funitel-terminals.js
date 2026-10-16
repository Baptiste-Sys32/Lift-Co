// Rocharbois terminal routing. Topology follows the report's two-loop diagram;
// spacing, guide diameters and the 0.30 m groove separation are model estimates.
window.LiftCoFunitelTerminals={createFactory(T,h){
 const {M,geo,mesh,box,beam,cylinder,batch,wheel}=h,routingStart=2.35;
 function make({parent,kind,H,back}){
  const root=new T.Group(),fixed=new T.Group(),paths=new T.Group(),markers=new T.Group(),rotors=[],routes=[];parent.add(root);root.add(fixed,paths,markers);markers.visible=false;
   const V=a=>new T.Vector3(...a);
  function line(a,b){const p=V(a),d=V(b).sub(p);return{length:d.length(),at:t=>p.clone().addScaledVector(d,t)};}
  function arcXZ(x,y,z,r,a,b){return{length:r*Math.abs(b-a),at:t=>{const q=a+(b-a)*t;return new T.Vector3(x+r*Math.cos(q),y,z+r*Math.sin(q));}};}
  function arcYZ(x,y,z,r,from,to,lower=false){return{length:r*Math.abs(to-from),at:t=>{const a=from+(to-from)*t;return new T.Vector3(x,y+(lower?-1:1)*r*Math.cos(a),z+r*Math.sin(a));}};}
  function addRoute(segments){
   const length=segments.reduce((s,p)=>s+p.length,0),ends=[];let d=0;for(const p of segments){d+=p.length;ends.push(d);}
   function point(distance,out=new T.Vector3()){
    const s=T.MathUtils.clamp(distance,0,length);let i=ends.findIndex(e=>s<=e);if(i<0)i=ends.length-1;
    const begin=i?ends[i-1]:0;return out.copy(segments[i].at((s-begin)/segments[i].length));
   }
   class RoutedCurve extends T.Curve{getPoint(t,out=new T.Vector3()){return point(t*length,out);}}
   mesh(paths,new T.TubeGeometry(new RoutedCurve(),Math.ceil(length*16),.018,6,false),M.rope);
   const dots=[];for(let i=0;i<4;i++)dots.push(mesh(markers,geo('rope-motion-dot',()=>new T.SphereGeometry(.065,8,6)),M.yellow));
   routes.push({point,length,dots});return{point,length};
  }
  function rotor(x,y,z,r,{double=false,drive=false,axis='y',direction=1}={}){
   const g=new T.Group();g.position.set(x,y,z);root.add(g);
   if(r<.8){
    // Reuse the classic-lift sheave on every small terminal guide, preserving
    // its existing radius, axis, cable path and rotation sign.
    const sheave=wheel(g,0,0,0,r,'x');sheave.rotation.z=Math.PI/2;batch(g);
    const pivot=new T.Group();pivot.position.copy(g.position);root.remove(g);g.position.set(0,0,0);pivot.add(g);root.add(pivot);if(axis==='x')pivot.rotation.z=Math.PI/2;
    rotors.push({node:g,r,direction});return pivot;
   }
   const rim=drive?M.yellow:M.steel,levels=double?[-.15,.15]:[0];
   for(const level of levels){
    const shape=[[r-.18,-.13],[r+.06,-.13],[r+.075,-.085],[r-.018,-.028],[r-.018,.028],[r+.075,.085],[r+.06,.13],[r-.18,.13],[r-.18,-.13]].map(([a,b])=>new T.Vector2(a,b));
    mesh(g,geo('terminal-rim'+r,()=>new T.LatheGeometry(shape,64)),rim,0,level,0);
    const tyre=mesh(g,geo('terminal-groove'+r,()=>new T.TorusGeometry(r-.025,.012,6,64)),M.rubber,0,level,0);tyre.rotation.x=Math.PI/2;
   }
   // A perforated web, bolted hub and proper grooved rim replace bare spokes.
   const web=new T.Shape();web.absarc(0,0,r-.18,0,Math.PI*2,false);
   if(r>.8)for(let i=0;i<8;i++){const a=i*Math.PI/4,hole=new T.Path();hole.absarc(Math.cos(a)*r*.61,Math.sin(a)*r*.61,r*.11,0,Math.PI*2,true);web.holes.push(hole);}
   const disk=new T.ExtrudeGeometry(web,{depth:.095,bevelEnabled:false,curveSegments:20});disk.rotateX(Math.PI/2);mesh(g,disk,rim,0,double?-.26:-.045,0);
   cylinder(g,r>.8?.29:.10,double?.70:.42,0,0,0,M.silver);
   if(r>.8)for(let i=0;i<12;i++){const a=i*Math.PI/6;cylinder(g,.025,.12,Math.cos(a)*.42,-.24,Math.sin(a)*.42,M.dark);}
   // Off-centre rim mark makes the reversal visible even at slow approach speed.
   box(g,.055,.03,.14,r-.09,levels[0]+.14,0,M.ivory);
   batch(g);
   const pivot=new T.Group();pivot.position.copy(g.position);root.remove(g);g.position.set(0,0,0);pivot.add(g);root.add(pivot);
   if(axis==='x')pivot.rotation.z=Math.PI/2;
   rotors.push({node:g,r,direction});return pivot;
  }
  function bearing(x,y,z,r){
   cylinder(fixed,.16,.50,x,y+.35,z,M.silver);
   box(fixed,.65,.20,.65,x,y+.62,z,M.steel);
   for(const sx of [-1,1])box(fixed,.07,.07,.07,x+sx*.21,y+.76,z-.22,M.dark);
   beam(fixed,[x-1.0,y+.78,z],[x+1.0,y+.78,z],.17,.24,M.steel);
  }
  function guide(x,y,z,r,axis='y',direction=1){
   rotor(x,y,z,r,{axis,direction});
   if(axis==='y')bearing(x,y,z,r);
   else{for(const side of [-1,1])box(fixed,.07,.55,.20,x+side*.16,y,z,M.steel);beam(fixed,[x-.28,y+.25,z],[x+.28,y+.25,z],.08,.12);}
  }
  function bisect(fn){let a=0,b=Math.PI/2;for(let i=0;i<45;i++){const c=(a+b)/2;if(fn(a)*fn(c)<=0)b=c;else a=c;}return(a+b)/2;}
  if(kind==='return'){
   const centreZ=back-3,outerZ=back-1.65,R=1.5;
   rotor(0,H,centreZ,2);bearing(0,H,centreZ,2);
   for(const x of [-3.5,3.5]){rotor(x,H,outerZ,R);bearing(x,H,outerZ,R);}
   // Inner U-turn, then the outer two-quarter-turn return. These are the
   // separate inner/outer returns in the supplied three-pulley schematic.
   addRoute([line([-2,H,routingStart],[-2,H,centreZ]),arcXZ(0,H,centreZ,2,Math.PI,0),line([2,H,centreZ],[2,H,routingStart])]);
   addRoute([line([-5,H,routingStart],[-5,H,outerZ]),arcXZ(-3.5,H,outerZ,R,Math.PI,Math.PI/2),line([-3.5,H,outerZ+R],[3.5,H,outerZ+R]),arcXZ(3.5,H,outerZ,R,Math.PI/2,0),line([5,H,outerZ],[5,H,routingStart])]);
   for(const x of [-3.5,0,3.5])box(fixed,.48,1.4,.48,x,H-.90,x===0?centreZ:outerZ,M.steel);
   beam(fixed,[-5.4,H-.85,outerZ],[5.4,H-.85,outerZ],.25,.38,M.steel);
  }else{
   const R=2,r=.40,cy=back-2.25,gap=.30;
   rotor(0,H+gap/2,cy,R,{double:true,drive:true});bearing(0,H+gap/2,cy,R);
   // Lower groove: OUTER left -> INNER right. The outer left rope is redirected
   // by a horizontal guide before its tangent to the common drive bullwheel.
   const leftZ=2.8,leftAngle=bisect(a=>-4.6*Math.cos(a)+(cy-leftZ)*Math.sin(a)+(R-r));
   const leftExit=[-4.6-r*Math.cos(leftAngle),H,leftZ+r*Math.sin(leftAngle)],leftContact=[-R*Math.cos(leftAngle),H,cy+R*Math.sin(leftAngle)];
   guide(-4.6,H,leftZ,r);
   addRoute([line([-5,H,routingStart],[-5,H,leftZ]),arcXZ(-4.6,H,leftZ,r,Math.PI,Math.PI-leftAngle),line(leftExit,leftContact),arcXZ(0,H,cy,R,Math.PI-leftAngle,0),line([2,H,cy],[2,H,routingStart])]);
   // Upper groove: INNER left -> OUTER right. This swap, together with the
   // return's two U paths, makes one continuous rope passing the drive twice.
   const rightZ=5.15,rightAngle=bisect(a=>4.6*Math.cos(a)+(rightZ-cy)*Math.sin(a)-(R-r));
   const rightContact=[R*Math.cos(rightAngle),H+gap,cy+R*Math.sin(rightAngle)],rightEntry=[4.6+r*Math.cos(rightAngle),H+gap,rightZ+r*Math.sin(rightAngle)];
   guide(4.6,H+gap,rightZ,r);
   function verticalTransfer(x){
    const a=2.9,b=4.9,rr=.32,angle=bisect(t=>(b-a)*Math.sin(t)+(2*rr-gap)*Math.cos(t)-2*rr);
    const p=[x,H+rr*(1-Math.cos(angle)),a+rr*Math.sin(angle)],q=[x,H+gap-rr*(1-Math.cos(angle)),b-rr*Math.sin(angle)];
    guide(x,H+rr,a,rr,'x',1);guide(x,H+gap-rr,b,rr,'x',-1);
    return{a,b,parts:[arcYZ(x,H+rr,a,rr,0,angle,true),line(p,q),arcYZ(x,H+gap-rr,b,rr,-angle,0,false)]};
   }
   const up=verticalTransfer(-2),down=verticalTransfer(5),reverse=p=>({length:p.length,at:t=>p.at(1-t)});
   addRoute([line([-2,H,routingStart],[-2,H,up.a]),...up.parts,line([-2,H+gap,up.b],[-2,H+gap,cy]),arcXZ(0,H+gap,cy,R,Math.PI,rightAngle),line(rightContact,rightEntry),arcXZ(4.6,H+gap,rightZ,r,rightAngle,0),line([5,H+gap,rightZ],[5,H+gap,down.b]),...down.parts.slice().reverse().map(reverse),line([5,H,down.a],[5,H,routingStart])]);
   // The right transfer carries the same rope in the reverse direction.
   for(const rotor of rotors)if(Math.abs(rotor.node.parent.position.x-5)<.01)rotor.direction*=-1;
   // Alpha-like stationary drive carriage, gearbox, motor and hydraulic tension.
   for(const side of [-1,1]){
    box(fixed,1.1,2.7,1.5,side*2.9,H-2.0,cy,M.concrete);
    beam(fixed,[side*3,H+.85,cy-2.4],[side*3,H+.85,cy+2.2],.27,.38,M.steel);
    const ram=cylinder(fixed,.10,1.5,side*3,H+.98,cy-1.3,M.silver);ram.rotation.x=Math.PI/2;
    const sleeve=cylinder(fixed,.16,.85,side*3,H+.98,cy-1.65,M.steel);sleeve.rotation.x=Math.PI/2;
   }
   box(fixed,1.4,.64,1.25,0,H+1.08,cy,M.steel);cylinder(fixed,.35,.70,0,H+.65,cy,M.dark);
   const motor=cylinder(fixed,.34,1.1,0,H+1.16,cy-1.45,M.steel);motor.rotation.x=Math.PI/2;
   const shaft=cylinder(fixed,.065,.75,0,H+1.16,cy-.65,M.silver);shaft.rotation.x=Math.PI/2;
   for(const side of [-1,1])box(fixed,.25,.35,.5,side*1.75,H-.15,cy+.65,M.dark);
  }
  batch(fixed);
  return{root,pulleys:rotors.map(r=>r.node),routingStart,
   setDrive(distance){for(const r of rotors)r.node.rotation.y=r.direction*distance/r.r;for(const route of routes)route.dots.forEach((dot,i)=>{const s=((distance+i*route.length/4)%route.length+route.length)%route.length;route.point(s,dot.position);});},
   setMarkers(show){markers.visible=show;}
  };
 }
 return{make,routingStart};
}};
