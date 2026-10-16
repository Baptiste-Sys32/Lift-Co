// Smoothly distributed cabin weight on a tensioned string. The support banks
// impose upward-only contact; roof rockers follow the curve after equilibrium.
// Visual load/tension ratios, not surveyed rope or cabin specifications.
window.LiftCoLoadedRope={create(base,{first=-92,last=92,selfWeight=.0009,carrierWeight=.22,spacing=.30}={}){
 const points=[first,last],supports=base.bank;
 for(const bank of supports){const count=Math.max(1,Math.ceil((bank.end-bank.start)/.15));for(let i=0;i<=count;i++)points.push(bank.start+(bank.end-bank.start)*i/count);points.push((bank.start+bank.end)/2);}
 for(let z=first;z<last;z+=spacing)points.push(z);
 points.sort((a,b)=>a-b);const grid=points.filter((z,i)=>!i||z-points[i-1]>1e-5),n=grid.length;
 const bound=Float64Array.from(grid,z=>obstacle(z)),weights=new Float64Array(n-1),diagonal=new Float64Array(n);
 for(let i=0;i<n-1;i++)weights[i]=1/(grid[i+1]-grid[i]);
 for(let i=0;i<n;i++)diagonal[i]=(i?weights[i-1]:0)+(i<n-1?weights[i]:0);
 function obstacle(z){
  if(z<=supports[0].start||z>=supports[supports.length-1].end)return base.atZ(z).y;
  for(const bank of supports)if(z>=bank.start&&z<=bank.end)return bank.y(z);
  return-Infinity;
 }
 function solve({z,sections,sway=0}){
  // Spread each section's share over a rounded footprint. Point forces / rigid
  // flat cable intervals previously created visible corners and stair steps.
  const sigma=1.05,density=new Float64Array(n),force=new Float64Array(n),active=Uint8Array.from(bound,h=>Number.isFinite(h)?1:0),values=new Float64Array(n),upper=new Float64Array(n),target=new Float64Array(n);
  for(let i=0;i<n;i++){
   let q=selfWeight;
   for(const section of sections){const t=(grid[i]-z-section.offset)/sigma;q+=carrierWeight/sections.length*Math.exp(-.5*t*t)/(Math.sqrt(2*Math.PI)*sigma);}
   density[i]=q;
  }
  for(let i=0;i<n-1;i++){
   const length=grid[i+1]-grid[i];force[i]+=length*(2*density[i]+density[i+1])/6;force[i+1]+=length*(density[i]+2*density[i+1])/6;
  }
  active[0]=active[n-1]=1;
  function linearSolve(){
   for(let i=0;i<n;i++){
    const a=active[i]||!i?0:-weights[i-1],b=active[i]?1:diagonal[i],c=active[i]||i===n-1?0:-weights[i],d=active[i]?bound[i]:-force[i],den=b-(i?a*upper[i-1]:0);
    upper[i]=c/den;target[i]=(d-(i?a*target[i-1]:0))/den;
   }
   values[n-1]=target[n-1];for(let i=n-2;i>=0;i--)values[i]=target[i]-upper[i]*values[i+1];
  }
  for(let iteration=0;iteration<32;iteration++){
   linearSolve();let changed=false;
   for(let i=1;i<n-1;i++)if(!active[i]&&values[i]<bound[i]-1e-6){active[i]=1;changed=true;}
   if(changed)continue;
   for(let i=1;i<n-1;i++)if(active[i]){const reaction=diagonal[i]*values[i]-weights[i-1]*values[i-1]-weights[i]*values[i+1]+force[i];if(reaction<-.000001){active[i]=0;changed=true;}}
   if(!changed)break;
  }
  linearSolve();
  // Hermite interpolation uses the equilibrium tangent at each node, giving
  // one continuous curve without adding visible kinks at sampling boundaries.
  const tangent=new Float64Array(n),secant=new Float64Array(n-1);
  for(let i=0;i<n-1;i++)secant[i]=(values[i+1]-values[i])/(grid[i+1]-grid[i]);
  tangent[0]=secant[0];tangent[n-1]=secant[n-2];
  for(let i=1;i<n-1;i++){
   const left=grid[i]-grid[i-1],right=grid[i+1]-grid[i];
   tangent[i]=(secant[i-1]*right+secant[i]*left)/(left+right);
   if(active[i])tangent[i]=base.atZ(grid[i]).slope;
  }
  function atZ(u){
   if(u<=first)return{z:u,y:values[0],slope:0};if(u>=last)return{z:u,y:values[n-1],slope:0};
   let lo=0,hi=n-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(grid[mid]<=u)lo=mid;else hi=mid;}
   const length=grid[hi]-grid[lo],t=(u-grid[lo])/length,t2=t*t,t3=t2*t,y0=values[lo],y1=values[hi],m0=tangent[lo],m1=tangent[hi];
   const y=(2*t3-3*t2+1)*y0+(t3-2*t2+t)*length*m0+(-2*t3+3*t2)*y1+(t3-t2)*length*m1;
   const slope=((6*t2-6*t)*y0+(3*t2-4*t+1)*length*m0+(-6*t2+6*t)*y1+(3*t2-2*t)*length*m1)/length,limit=obstacle(u);
   return y<limit?{z:u,y:limit,slope:base.atZ(u).slope}:{z:u,y,slope};
  }
  const knots=[],poses=sections.map((section,index)=>{
   const centre=z+section.offset;let dz=section.halfLength,a,b,angle=0;
   // Keep the distance between the rigid jaws fixed while their common roof
   // rocker follows the two actual contact points on the curved cable.
   for(let i=0;i<5;i++){a=atZ(centre-dz);b=atZ(centre+dz);angle=-Math.atan2(b.y-a.y,b.z-a.z);dz=section.halfLength*Math.cos(angle);}
   a=atZ(centre-dz);b=atZ(centre+dz);angle=-Math.atan2(b.y-a.y,b.z-a.z);knots.push(a.z,b.z);
   return{index,z:centre,y:(a.y+b.y)/2,gripPitch:angle,sway};
  });
  return{atZ,z,sections:poses,knots};
 }
 return{solve};
}};
