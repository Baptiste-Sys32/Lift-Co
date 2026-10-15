// Hand-shaped ridge networks, bowls, escarpments and station shelves, in metres.
// No dependency on Three.js: these heightfields can also feed the resort builder.
window.LiftCoMountainMaps=(()=>{
 const size=3600,half=size/2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
 const bump=(x,z,cx,cz,rx,rz,h)=>h*Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));
 function ridge(x,z,nodes,width){let best=0;for(let i=1;i<nodes.length;i++){const a=nodes[i-1],b=nodes[i],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1),distance=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t),height=a[2]+(b[2]-a[2])*t;best=Math.max(best,height*(.76*Math.exp(-Math.pow(distance/width,1.65))+.24*Math.exp(-Math.pow(distance/(width*.28),1.12))));}let peaks=0;for(const n of nodes)peaks=Math.max(peaks,n[2]*.14*Math.exp(-Math.pow(Math.hypot(x-n[0],z-n[1])/(width*.4),1.25)));return best+peaks;}
 // Reuse the project's bundled real Alpine relief for secondary gullies and ribs.
 const data=window.LIFT_TERRAIN_DATA;let dem=null;
 if(data){const bytes=Uint8Array.from(atob(data.contextHeights),c=>c.charCodeAt(0)),view=new DataView(bytes.buffer);dem=new Float32Array(bytes.length/2);for(let i=0;i<dem.length;i++)dem[i]=view.getUint16(i*2,true)*data.quantization;}
 function elevation(x,z){if(!dem)return 0;const cols=data.contextColumns,rows=data.contextRows,gx=clamp((x/data.contextWidth+.5)*(cols-1),0,cols-1),gz=clamp((z/data.contextDepth+.5)*(rows-1),0,rows-1),ix=Math.min(Math.floor(gx),cols-2),iz=Math.min(Math.floor(gz),rows-2),u=gx-ix,v=gz-iz,i=iz*cols+ix;return dem[i]*(1-u)*(1-v)+dem[i+1]*u*(1-v)+dem[i+cols]*(1-u)*v+dem[i+cols+1]*u*v;}
 function erosion(x,z){const u=x*.91-z*.21+360,v=x*.21+z*.91-240;return(elevation(u,v)-(elevation(u-280,v)+elevation(u+280,v)+elevation(u,v-280)+elevation(u,v+280)+elevation(u-200,v-200)+elevation(u+200,v+200))/6)*1.65;}
 // Broad overlapping spurs give the whole landscape volume, rather than a peak on a flat floor.
 const folds=(x,z)=>erosion(x,z)+8*Math.sin(x/170+z/310)*Math.cos(z/210-x/410);
 const common=(x,z)=>90+bump(x,z,-1100,1100,800,950,105)+bump(x,z,1050,1050,900,700,130)+bump(x,z,0,-1350,1700,900,100);
 const designs=[
 {id:'crown',name:'Crown Basin',kicker:'01 / A HIGH ENCLOSING MASSIF',description:'A broken horseshoe of peaks above a broad ski bowl. Lower shoulders roll into gullies, with shelves on the rim and beside the valley.',features:['Enclosing summit wall','Open bowl and rolling foothills','Rim and valley station shelves'],camera:[2600,2050,2900],target:[0,330,-100],valley:[0,190,1450],summit:[0,760,-1130],
 sites:[['Valley shoulder',-150,1070,95,66,.12],['West balcony',-870,-50,88,55,-.55],['Bowl terrace',70,-340,100,72,.12],['East shoulder',1040,-360,90,54,.65],['High col',-230,-1130,76,48,-.2]],
 raw(x,z){const u=x+70*Math.sin(z/450),v=z+35*Math.sin(x/650);let h=common(u,v)+ridge(u,v,[[-1470,650,210],[-1220,-300,430],[-900,-980,570],[-150,-1340,735],[780,-1100,660],[1380,-350,420],[1500,530,180]],610);h+=bump(u,v,0,-400,720,850,-145)+bump(u,v,-620,650,420,580,120)+bump(u,v,690,450,460,680,140);h-=bump(u,v,-330,380,135,820,65)+bump(u,v,430,450,125,700,58);return h+folds(u,v);}},
 {id:'spine',name:'Serpentine Ridge',kicker:'02 / A RIDGE THAT TRAVERSES THE MAP',description:'A long S-shaped crest rises through successive shoulders. Side valleys, hanging bowls and short cliff bands create several distinct lift routes.',features:['A continuous winding spine','Branching shoulders and hanging bowls','Successive intermediate station sites'],camera:[2900,1800,2500],target:[0,360,0],valley:[-1100,190,1350],summit:[850,880,-1050],
 sites:[['Lower shoulder',-1120,1050,90,58,-.5],['Middle bench',-480,270,88,52,-.5],['Hanging bowl',510,50,88,70,.2],['Ridge balcony',430,-680,83,48,-.55],['Upper shoulder',1030,-1180,75,48,-.6]],
 raw(x,z){const u=x+48*Math.sin(z/350),v=z;let h=common(u,v)+ridge(u,v,[[-1440,1400,160],[-980,700,320],[-650,180,425],[-30,-200,520],[330,-810,650],[1050,-1180,780],[1450,-1700,650]],560);h+=ridge(u,v,[[-700,200,185],[-1300,-500,205],[-1620,-1050,110]],380)+ridge(u,v,[[300,-800,210],[1100,-160,245],[1600,450,130]],430);h+=bump(u,v,600,130,380,510,-105)+bump(u,v,-400,-900,370,480,-85);const cliff=1-smooth(130,210,Math.abs(u-(120+420*Math.sin(v/700))));h-=cliff*38*smooth(100,900,-v);return h+folds(u+650,v-500);}},
 {id:'gorge',name:'Winding Escarpment',kicker:'03 / CLIFF BALCONIES & A DEEP GORGE',description:'Two uneven uplands flank a twisting gorge. Winding cliff rims and narrow balconies overlook the drop, with broad slopes above the rock faces.',features:['A deep winding gorge','Cliff-edge station balconies','Higher peaks behind the uplands'],camera:[2700,2200,2900],target:[0,380,0],valley:[100,180,1400],summit:[-950,900,-950],
 sites:[['South terrace',-800,1010,105,65,.05],['West cliff balcony',-520,60,85,47,.3],['East cliff balcony',540,-620,90,52,-.35],['Upper plateau',-900,-860,105,68,-.3],['North col',640,-1360,85,52,.1]],
 raw(x,z){const centre=170*Math.sin(z/330)+170*Math.sin(z/850+.4),d=Math.abs(x-centre),floor=95+.026*(1800-z)+17*Math.sin(z/380),upland=common(x,z)+270+bump(x,z,-1100,-850,720,1020,440)+bump(x,z,1120,-1150,760,900,280)+bump(x,z,900,800,660,700,100);let h=floor+(upland-floor)*smooth(120,255,d);h+=smooth(260,500,d)*folds(x-850,z+600);h-=bump(x,z,-1250,500,250,400,90)+bump(x,z,1200,-50,260,500,100);return h;}},
 {id:'saddle',name:'Twin Summit Pass',kicker:'04 / TWO MASSIFS & A HIGH SADDLE',description:'Two substantial summit groups frame a broad pass. Convex ski faces give way to dips, smaller hills and a lower valley that bends between the spurs.',features:['Two separate summit groups','A broad high saddle','Rolling foreground and branching valleys'],camera:[2800,2150,2850],target:[0,360,0],valley:[0,190,1400],summit:[-850,920,-900],
 sites:[['Lower knoll',120,1080,96,62,.15],['West mid-station',-920,170,95,58,-.3],['High saddle',-20,-510,115,74,.1],['East balcony',1040,-190,85,50,.3],['Summit shoulder',-890,-1040,74,47,-.2]],
 raw(x,z){const u=x+45*Math.sin(z/420),v=z;let h=common(u,v)+ridge(u,v,[[-1400,650,180],[-1100,-60,355],[-1040,-920,770],[-610,-1540,650]],640)+ridge(u,v,[[1420,740,175],[1000,-110,340],[880,-1060,650],[1400,-1570,530]],610);h+=bump(u,v,0,-650,750,560,230)+bump(u,v,-400,850,390,460,140)+bump(u,v,510,660,380,490,150);h-=bump(u,v,110,240,180,670,110)+bump(u,v,-450,350,145,390,65)+bump(u,v,600,-530,175,420,70);return h+folds(v,-u);}}
 ];
 function create(id){const design=designs.find(d=>d.id===id)||designs[0];const sites=design.sites.map(([name,desiredX,desiredZ,rx,rz,angle])=>{
  const expected=design.raw(desiredX,desiredZ);let best=null;
  // Find an existing shoulder before easing its surface; avoid isolated flat-topped bumps.
  for(let dz=-240;dz<=240;dz+=60)for(let dx=-240;dx<=240;dx+=60){const x=desiredX+dx,z=desiredZ+dz,y=design.raw(x,z),heights=[design.raw(x+rx*.6,z),design.raw(x-rx*.6,z),design.raw(x,z+rz*.6),design.raw(x,z-rz*.6)],range=Math.max(y,...heights)-Math.min(y,...heights),score=range*3+Math.hypot(dx,dz)*.035+Math.abs(y-expected)*.18;if(!best||score<best.score)best={name,x,z,rx,rz,angle,y,score};}
  return best;
 });
 function height(x,z){let y=design.raw(x,z);for(const site of sites){const dx=x-site.x,dz=z-site.z,c=Math.cos(site.angle),s=Math.sin(site.angle),u=(dx*c+dz*s)/site.rx,v=(-dx*s+dz*c)/site.rz,r=Math.hypot(u,v),weight=1-smooth(.5,1.4,r);if(weight>0){const bench=site.y+dx*.012+dz*.008;y+=clamp(bench-y,-9,9)*weight;}}return y;}
 return{design,height,sites,size,half};}
 return{designs,create,size,half,preferred:'saddle'};
})();
