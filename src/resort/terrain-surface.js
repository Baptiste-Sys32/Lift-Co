/* V3: rounded earthworks, conforming local refinement and shared height normals. */
window.LiftCoTerrainSurface=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),fade=t=>{t=clamp(t,0,1);return t*t*t*(t*(t*6-15)+10);};
 function terrace(x,z,width,start,end,datum,ground){
  // Rounded footprint distance, with a wider bank for deep cut/fill. The small
  // boundary variation lives outside the level deck and has zero endpoint slope.
  const radius=3,cx=Math.abs(x)-(width-radius),cz=Math.abs(z-(start+end)/2)-((end-start)/2-radius),distance=Math.hypot(Math.max(cx,0),Math.max(cz,0))+Math.min(Math.max(cx,cz),0)-radius;
  const bank=Math.min(44,18+Math.abs(datum-ground)*.7),variation=1+.07*Math.sin(x*.17+z*.11)*Math.sin(z*.13-x*.09);
  return 1-fade(Math.max(0,distance)/(bank*variation));
 }
 function regions(defs,frame,point){const out=[];for(const d of defs){if(!d.base||!d.top)continue;const f=frame(d);for(const p of [d.base,d.mid,d.top].filter(Boolean))out.push({x:p[0],z:p[1],r:75});for(const t of d.towers||[]){const p=point(d,0,f.length/2-t.fraction*f.length);out.push({x:p.x,z:p.z,r:t.height>30?18:12});}}return out;}
 function sampler(height){const values=new Map();return(x,z)=>{const key=x+','+z;let y=values.get(key);if(y===undefined){y=height(x,z);values.set(key,y);}return y;};}
 function build(T,cx,cz,height,areas){
  const positions=[],normals=[],colours=[],uvs=[],indices=[],vertices=new Map(),snow=new T.Color(0xf3eee5),rock=new T.Color(0x55575a),c=new T.Color();
  const fine=(x,z)=>areas.some(a=>Math.abs(x-a.x)<a.r+8&&Math.abs(z-a.z)<a.r+8);
  function vertex(x,z){const key=x+','+z;if(vertices.has(key))return vertices.get(key);const y=height(x,z),dx=(height(x+1,z)-height(x-1,z))/2,dz=(height(x,z+1)-height(x,z-1))/2,length=Math.hypot(dx,1,dz),slope=Math.hypot(dx,dz),t=fade((slope-.8)/1),h=fade((y-24)/31);c.copy(snow).lerp(rock,t*h*.85);const i=positions.length/3;positions.push(x,y-.08,z);normals.push(-dx/length,1/length,-dz/length);colours.push(c.r,c.g,c.b);vertices.set(key,i);return i;}
  const tri=(a,b,c)=>indices.push(a,c,b);
  for(let j=0;j<30;j++)for(let i=0;i<30;i++){
   const x=cx-150+i*10,z=cz-150+j*10;
   if(fine(x+5,z+5)){for(let v=0;v<5;v++)for(let u=0;u<5;u++){const a=vertex(x+u*2,z+v*2),b=vertex(x+(u+1)*2,z+v*2),c=vertex(x+u*2,z+(v+1)*2),d=vertex(x+(u+1)*2,z+(v+1)*2);tri(a,b,c);tri(b,d,c);}continue;}
   const splits=[fine(x+5,z-5),fine(x+15,z+5),fine(x+5,z+15),fine(x-5,z+5)];
   if(!splits.some(Boolean)){const a=vertex(x,z),b=vertex(x+10,z),c=vertex(x,z+10),d=vertex(x+10,z+10);tri(a,b,c);tri(b,d,c);continue;}
   const ring=[];for(let edge=0;edge<4;edge++){const n=splits[edge]?5:1;for(let k=0;k<n;k++){const t=k/n;ring.push(edge===0?vertex(x+10*t,z):edge===1?vertex(x+10,z+10*t):edge===2?vertex(x+10-10*t,z+10):vertex(x,z+10-10*t));}}
   const center=vertex(x+5,z+5);for(let k=0;k<ring.length;k++)tri(center,ring[k],ring[(k+1)%ring.length]);
  }
  for(let i=0;i<positions.length;i+=3)uvs.push(positions[i]/300,positions[i+2]/300);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colours,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeBoundingSphere();g.userData.localRefinement=true;return g;
 }
 return{terrace,regions,build,sampler,fade};
})();
