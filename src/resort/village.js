/* Replaceable models. Dimensions, entrance and bed contracts live outside models. */
window.LiftCoVillage=(()=>{
 const types={chalet:{name:'Chalet',beds:6,width:10,depth:9,height:6},apartment:{name:'Alpine apartments',beds:24,width:18,depth:12,height:11},hotel:{name:'Mountain lodge',beds:48,width:26,depth:16,height:15}};
 const spec=b=>types[b.type]||types.chalet;
 function world(b,x,z){const c=Math.cos(b.yaw||0),s=Math.sin(b.yaw||0);return{x:b.x+c*x+s*z,z:b.z-s*x+c*z};}
 function entrance(b){return{...world(b,0,spec(b).depth/2+5),id:b.id+':home',name:b.name+' entrance'};}
 function footprint(b){const t=spec(b);return{...b,width:t.width+2,depth:t.depth+9,x:world(b,0,3.5).x,z:world(b,0,3.5).z};}
 function local(box,p){const c=Math.cos(box.yaw||0),s=Math.sin(box.yaw||0),x=p.x-box.x,z=p.z-box.z;return{x:c*x-s*z,z:s*x+c*z};}
 function contains(box,p,pad=0){const q=local(box,p);return Math.abs(q.x)<=box.width/2+pad&&Math.abs(q.z)<=box.depth/2+pad;}
 function corners(b){return[-1,1].flatMap(x=>[-1,1].map(z=>world(b,x*b.width/2,z*b.depth/2)));}
 function overlap(a,b){const ca=corners(a),cb=corners(b);for(const q of [a,b])for(const axis of [{x:Math.cos(q.yaw||0),z:-Math.sin(q.yaw||0)},{x:Math.sin(q.yaw||0),z:Math.cos(q.yaw||0)}]){const aa=ca.map(p=>p.x*axis.x+p.z*axis.z),bb=cb.map(p=>p.x*axis.x+p.z*axis.z);if(Math.max(...aa)<Math.min(...bb)||Math.max(...bb)<Math.min(...aa))return false;}return true;}
 function layer(b,height){const p=entrance(b),level=b.floor??height(b.x,b.z);return{id:'earthworks:'+b.id,owner:b.id,samples:[{mode:'flatten',x:p.x,z:p.z,height:level,radius:7,innerRadius:3,strength:1}]};}
 function widthAt(r,i){const v=i/(r.samples.length-1)*(r.points.length-1),j=Math.min(r.points.length-2,Math.floor(v)),u=v-j;return(r.points[j].width||r.width)*(1-u)+(r.points[j+1].width||r.width)*u;}
 function validate(T,doc,height,terminalBoxes){const errors=[],roads=window.LiftCoRoads.compile(T,doc,height),routes=[...roads,...[...doc.paths,...doc.pistes.filter(f=>f.open!==false)].map(f=>window.LiftCoResort.route(T,f,height)).filter(Boolean)];
  const issue=(id,text)=>errors.push({id,text});for(const b of doc.buildings||[]){const box=footprint(b);if(corners(box).some(p=>Math.abs(p.x)>1700||Math.abs(p.z)>1700))issue(b.id,b.name+': footprint is outside the build area.');for(const other of doc.buildings||[])if(other.id!==b.id&&overlap(box,footprint(other)))issue(b.id,b.name+': overlaps '+other.name+'.');for(const r of routes){const ownPath=doc.paths.some(f=>f.id===r.id)&&r.connections?.includes(b.id+':home');if(r.samples.some((p,i)=>contains(box,p,widthAt(r,i)/2)&&(!ownPath||local(b,p).z<spec(b).depth/2+1)))issue(b.id,b.name+': overlaps '+r.name+'.');}
   for(const t of terminalBoxes||[])if(overlap(box,{x:t.x,z:t.z,width:t.halfWidth*2,depth:t.halfLength*2,yaw:Math.atan2(t.along.x,t.along.z)}))issue(b.id,b.name+': overlaps a lift station.');
   for(const l of doc.lifts)for(const t of l.towers||[]){const p=t.x!==undefined?t:null;if(p&&contains(box,p,5))issue(b.id,b.name+': overlaps a lift tower.');}
   const level=b.floor??height(b.x,b.z);const probes=[];for(let x=-spec(b).width/2;x<=spec(b).width/2;x+=2)for(let z=-spec(b).depth/2;z<=spec(b).depth/2;z+=2)probes.push(world(b,x,z));if(probes.some(p=>height(p.x,p.z)>level+.1))issue(b.id,b.name+': foundation intersects hillside. Raise the floor or move the building.');
  }
  for(const s of doc.stops||[]){const p=window.LiftCoRoads.stopInfo(s,roads,height);if(!p)continue;const box={...p.pad,width:60,depth:60,yaw:0};if(Math.abs(p.pad.x)>1668||Math.abs(p.pad.z)>1668)issue(s.id,s.name+': terminal footprint is outside the build area.');for(const t of terminalBoxes||[])if(window.LiftCoPlacement.boxDistance(t,p.pad.x,p.pad.z)<31)issue(s.id,s.name+': terminal overlaps a lift structure.');for(const b of doc.buildings||[])if(overlap(box,footprint(b)))issue(s.id,s.name+': turning pad overlaps '+b.name+'.');for(const r of routes)if(r.id!==s.roadId&&!doc.paths.some(f=>f.id===r.id&&f.connections?.includes(s.id+':ped'))&&r.samples.some((q,i)=>Math.hypot(q.x-p.pad.x,q.z-p.pad.z)<30+widthAt(r,i)/2))issue(s.id,s.name+': turning pad overlaps '+r.name+'.');for(const o of doc.stops||[])if(o.id!==s.id){const q=window.LiftCoRoads.stopInfo(o,roads,height);if(q&&Math.hypot(q.pad.x-p.pad.x,q.pad.z-p.pad.z)<60)issue(s.id,s.name+': terminal pads overlap.');}}
  return errors;}
 function model(T,b,height,preview=false){return window.LiftCoVillageModels.building(T,b,height,preview);}
 function fit(b,height){const t=spec(b);let floor=-Infinity;for(let x=-t.width/2;x<t.width/2+2;x+=2)for(let z=-t.depth/2;z<t.depth/2+2;z+=2){const p=world(b,Math.min(x,t.width/2),Math.min(z,t.depth/2));floor=Math.max(floor,height(p.x,p.z));}return floor+.18;}
 function dispose(root){const geometries=new Set(),materials=new Set();root.traverse(n=>{if(n.geometry)geometries.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:n.material?[n.material]:[])materials.add(m);if(n.isInstancedMesh)n.dispose();});for(const g of geometries)g.dispose();for(const m of materials){m.map?.dispose();m.dispose();}root.removeFromParent();}

 return{types,spec,world,entrance,footprint,contains,overlap,layer,validate,model,fit,dispose};
})();
