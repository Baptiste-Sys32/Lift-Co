import json,struct,base64
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[1];b=(root/'assets/models/snowy-trees.glb').read_bytes();size,kind=struct.unpack_from('<II',b,12);g=json.loads(b[20:20+size]);offset=20+size;blen,btype=struct.unpack_from('<II',b,offset);blob=b[offset+8:offset+8+blen]
types={5120:'i1',5121:'u1',5122:'<i2',5123:'<u2',5125:'<u4',5126:'<f4'};widths={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}
def attr(i):
 a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];dt=np.dtype(types[a['componentType']]);n=widths[a['type']];o=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',dt.itemsize*n)
 return np.ndarray((a['count'],n),dtype=dt,buffer=blob,offset=o,strides=(stride,dt.itemsize)).copy()
def enc(a,dtype):return base64.b64encode(np.asarray(a,dtype=dtype).tobytes()).decode()
variants=[]
def visit(i,parent):
 n=g['nodes'][i];local=np.array(n.get('matrix',np.eye(4).flatten(order='F')),dtype=float).reshape(4,4,order='F');m=parent@local
 if 'mesh' in n:
  mesh=g['meshes'][n['mesh']];p=mesh['primitives'][0];a=p['attributes'];v=attr(a['POSITION']);v=(np.column_stack((v,np.ones(len(v))))@m.T)[:,:3];normal=attr(a['NORMAL'])@np.linalg.inv(m[:3,:3]);normal/=np.linalg.norm(normal,axis=1)[:,None];lo=v.min(0);hi=v.max(0);height=hi[1]-lo[1];v=(v-np.array([(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2]))/height
  variants.append({'name':mesh.get('name'),'position':enc(v,'<f4'),'normal':enc(normal,'<f4'),'uv':enc(attr(a['TEXCOORD_0']),'<f4'),'index':enc(attr(p['indices']),'<u2'),'width':float((hi[0]-lo[0])/height),'depth':float((hi[2]-lo[2])/height)})
 for c in n.get('children',[]):visit(c,m)
for i in g['scenes'][0]['nodes']:visit(i,np.eye(4))
im=g['images'][0];view=g['bufferViews'][im['bufferView']];png=blob[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']]
data={'source':'assets/models/snowy-trees.glb','texture':'data:image/png;base64,'+base64.b64encode(png).decode(),'variants':variants}
(root/'assets/generated/tree-pack.js').write_text('// Geometry and palette extracted from the supplied GLB; normalised to ground-level origins.\nwindow.LIFT_TREE_ASSETS='+json.dumps(data,separators=(',',':'))+';\n')
print([(v['name'],round(v['width'],2),len(base64.b64decode(v['index']))//6) for v in variants]);print('Asset bundle bytes:',(root/'assets/generated/tree-pack.js').stat().st_size)
