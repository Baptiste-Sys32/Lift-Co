/* A rounded shell, ankle cuff, heel, toe and buckles in one vertex-coloured mesh. */
window.LiftCoGuestBoots={geometry(T){
 const positions=[],colours=[],indices=[],shell=[.19,.27,.31],sole=[.055,.075,.08],trim=[.56,.63,.62],buckle=[.78,.57,.29];
 const outline=(w,rear,toe)=>[[-w*.65,rear],[-w,rear+.025],[-w,toe-.035],[-w*.58,toe],[w*.58,toe],[w,toe-.035],[w,rear+.025],[w*.65,rear]];
 function rings(levels,colour){const start=positions.length/3;for(const [y,w,rear,toe]of levels)for(const [x,z]of outline(w,rear,toe)){positions.push(x,y,z);colours.push(...colour);}for(let j=0;j<levels.length-1;j++)for(let i=0;i<8;i++){const a=start+j*8+i,b=start+j*8+(i+1)%8,c=a+8,d=b+8;indices.push(a,b,c,b,d,c);}for(let i=1;i<7;i++)indices.push(start,start+i+1,start+i);const top=start+(levels.length-1)*8;for(let i=1;i<7;i++)indices.push(top,top+i,top+i+1);}
 rings([[-.085,.078,-.135,.18],[-.065,.085,-.14,.19],[-.045,.080,-.135,.185]],sole);
 rings([[-.045,.077,-.128,.18],[.005,.078,-.12,.175],[.052,.068,-.105,.12],[.085,.060,-.095,.035]],shell);
 rings([[.045,.064,-.105,.045],[.155,.058,-.087,.060],[.19,.060,-.08,.062]],shell);
 rings([[.177,.062,-.083,.064],[.197,.062,-.08,.066]],trim);
 // Two narrow straps across the forward face, with small metal catches.
 for(const y of [.09,.145]){rings([[y,.064,-.088,.064],[y+.013,.064,-.088,.064]],trim);const at=positions.length/3;positions.push(-.025,y,.066,.025,y,.066,.025,y+.014,.066,-.025,y+.014,.066);for(let i=0;i<4;i++)colours.push(...buckle);indices.push(at,at+1,at+2,at,at+2,at+3);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colours,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;
}};
