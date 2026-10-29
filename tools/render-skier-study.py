"""Offline skier mesh study. Not a game screenshot. Requires NumPy/Pillow and exported rig geometry."""
from pathlib import Path
import json,numpy as np
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'archive/skier-study-geometry.json').read_text())
def render(data,eye,size=(360,570)):
 w,h=size
 def decode(k,dtype,cols):return np.asarray(data[k],dtype=float).reshape(-1,cols)
 p=decode('position','<f4',3);n=decode('normal','<f4',3);color=decode('color','<f4',3);indices=decode('index','<u2',3).astype(int)
 eye=np.array(eye);target=np.array([0,1.12,0]);forward=(target-eye);forward/=np.linalg.norm(forward);right=np.cross(forward,[0,1,0]);right/=np.linalg.norm(right);up=np.cross(right,forward)
 q=p-eye;depth=q@forward;focal=h/2/np.tan(np.radians(32)/2);screen=np.column_stack((w/2+(q@right)/depth*focal,h/2-(q@up)/depth*focal));buffer=np.full((h,w),np.inf);pixels=np.empty((h,w,3));pixels[:]=[.87,.91,.92]
 light=np.array([-.5,.8,.45]);light/=np.linalg.norm(light)
 for tri in indices:
  a,b,c=p[tri];face=np.cross(b-a,c-a)
  if face@(eye-(a+b+c)/3)<=0:continue
  v=screen[tri];x0=max(0,int(np.floor(v[:,0].min())));x1=min(w-1,int(np.ceil(v[:,0].max())));y0=max(0,int(np.floor(v[:,1].min())));y1=min(h-1,int(np.ceil(v[:,1].max())))
  if x1<x0 or y1<y0:continue
  x,y=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5);a,b,c=v;den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
  if abs(den)<1e-9:continue
  u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den;vv=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den;ww=1-u-vv;weights=np.stack([u,vv,ww],axis=-1)/depth[tri];inverse=weights.sum(axis=-1);z=1/inverse;weights/=inverse[...,None]
  view=buffer[y0:y1+1,x0:x1+1];mask=(u>=0)&(vv>=0)&(ww>=0)&(z<view)
  normals=weights@n[tri];normals/=np.maximum(1e-8,np.linalg.norm(normals,axis=-1))[...,None];illum=.38+.62*np.maximum(0,normals@light);rgb=np.clip((weights@color[tri])*illum[...,None],0,1);rgb=np.where(rgb<=.0031308,rgb*12.92,1.055*rgb**(1/2.4)-.055)
  pixels[y0:y1+1,x0:x1+1][mask]=rgb[mask];view[mask]=z[mask]
 return Image.fromarray((pixels*255).clip(0,255).astype('uint8'))

views=[('stand','Stand / front',(0,1.25,5.2)),('stand','Stand / back',(0,1.25,-5.2)),('walk','Walk / side',(5.2,1.25,0)),('ski','Ski / three-quarter',(3.7,1.65,4.1)),('seat','Sit / three-quarter',(3.7,1.65,4.1))]
canvas=Image.new('RGB',(1800,1260),'#24343c');draw=ImageDraw.Draw(canvas)
for row,name in enumerate(['before','after']):
 draw.text((12,row*630+12),'BEFORE'if name=='before'else'CURRENT CLOTHING AND POSE',fill='white')
 for col,(mode,label,eye)in enumerate(views):
  image=render(data['models'][name][mode],eye);canvas.paste(image,(col*360,row*630+35));draw.text((col*360+12,row*630+607),label,fill='white')
path=root/'designs/data/skier-comparison.png';canvas.save(path);print(path.relative_to(root))
