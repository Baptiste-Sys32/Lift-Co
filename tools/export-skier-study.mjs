/* Export visible rig geometry for offline visual study, without browser or resort state. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'liftco-skier-study-'));
try{
 fs.copyFileSync(path.join(root,'assets/vendor/three/three.module.js'),path.join(temporary,'three.mjs'));
 const T=await import(pathToFileURL(path.join(temporary,'three.mjs')));globalThis.window=globalThis;
 for(const file of ['src/resort/guest-boots.js','src/resort/ski-motion.js','src/resort/guest-animation.js','designs/data/skier-before-model.js','src/resort/guest-model.js','designs/data/skier-rig.js','designs/data/skier-poses.js'])vm.runInThisContext(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
 const camera=new T.PerspectiveCamera();camera.position.set(0,1.3,5.7);
 const result={note:'Offline geometry study only; not a WebGL/game screenshot',models:{}};
 for(const [name,dress]of [['before',window.LiftCoGuestModelBefore.dress],['after',window.LiftCoGuestModel.dress]]){
  const s=window.LiftCoSkierStudyRig.create(T,{dress}),poses=window.LiftCoSkierStudyPose.create(T,s,camera),out={};
  for(const mode of ['stand','walk','ski','seat']){
   poses.set(mode);for(let i=0;i<40;i++)poses.update(1/60);s.g.updateMatrixWorld(true);
   const positions=[],normal=[],colors=[],index=[];let meshes=0;
   s.g.traverseVisible(mesh=>{
    if(!mesh.isMesh)return;meshes++;const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color,m=mesh.material,nm=new T.Matrix3().getNormalMatrix(mesh.matrixWorld),v=new T.Vector3(),co=new T.Color(),offset=positions.length/3;
    for(let i=0;i<p.count;i++){
     v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);positions.push(v.x,v.y,v.z);v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();normal.push(v.x,v.y,v.z);co.copy(m.color);if(m.vertexColors&&c)co.multiply(new T.Color().setRGB(c.getX(i),c.getY(i),c.getZ(i)));colors.push(co.r,co.g,co.b);
    }
    if(g.index)for(const i of g.index.array)index.push(i+offset);else for(let i=0;i<p.count;i++)index.push(offset+i);
   });
   out[mode]={position:positions,normal,color:colors,index,meshes,triangles:index.length/3};
  }
  poses.dispose();result.models[name]=out;
 }
 const dest=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'archive/skier-study-geometry.json');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(result));
 for(const [name,modes]of Object.entries(result.models))console.log(name,Object.fromEntries(Object.entries(modes).map(([k,v])=>[k,{meshes:v.meshes,triangles:v.triangles}])));
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
