from pathlib import Path
import json,base64,numpy as np
root=Path(__file__).resolve().parents[1]
s=(root/'assets/data/terrain-heightmap.js').read_text();d=json.loads(s.split('window.LIFT_TERRAIN_DATA=')[1].rstrip(';\n'))
heights=np.frombuffer(base64.b64decode(d['heights']),'<u2').reshape(d['rows'],d['columns'])
# Exact 10m-grid crop: source x[-400,600], z[-300,900]. Local origin is (100,300).
ix0=int((-400+d['width']/2)/10);iz0=int((-300+d['depth']/2)/10)
a=heights[iz0:iz0+121,ix0:ix0+101].copy()
meta={k:d[k]for k in ['source','sourceURL','attributionURL','originElevation','quantization','accessed']}
meta.update(name='Courchevel lift test',width=1000,depth=1200,columns=101,rows=121,sourceCenterX=100,sourceCenterZ=300,minElevation=float(a.min())*.1,maxElevation=float(a.max())*.1,heights=base64.b64encode(a.tobytes()).decode())
(root/'assets/data/lift-scale-heightmap.js').write_text('// Cropped Alpine data only; the full elevation asset is not loaded by lift-test.html.\nwindow.LIFT_TEST_DATA='+json.dumps(meta,separators=(',',':'))+';\n')
print("Wrote cropped elevation data:", (root/"assets/data/lift-scale-heightmap.js").stat().st_size, "bytes")
