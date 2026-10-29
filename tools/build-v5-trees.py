"""Bake original alpine firs into the existing normalized instanced asset format."""
import base64
import json
import math
import random
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def encode(values, kind='f'):
    return base64.b64encode(struct.pack('<' + kind * len(values), *values)).decode()

def tree(variant):
    rng = random.Random(5100 + variant)
    positions, normals, colors, indices = [], [], [], []
    def triangle(a, b, c, color):
        b, c = c, b
        u = [b[i]-a[i] for i in range(3)]
        v = [c[i]-a[i] for i in range(3)]
        n = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]
        length = math.sqrt(sum(x*x for x in n)) or 1
        if length < 1e-9:
            return
        offset = len(positions)//3
        for p in [a,b,c]:
            positions.extend(p)
            normals.extend(x/length for x in n)
            colors.extend(color)
        indices.extend([offset,offset+1,offset+2])
    # Linear RGB colors, white snow above dark green branch undersides.
    foliage = [(0.030,0.090,0.077),(0.044,0.119,0.099),(0.056,0.145,0.119)]
    snow = [(0.78,0.87,0.91),(0.87,0.93,0.95),(0.67,0.78,0.83)]
    trunk = (0.115,0.071,0.047)
    for i in range(7):
        a,b = i*math.tau/7,(i+1)*math.tau/7
        p=(math.cos(a)*.017,0,math.sin(a)*.017)
        q=(math.cos(b)*.017,0,math.sin(b)*.017)
        r=(math.cos(a)*.007,.92,math.sin(a)*.007)
        s=(math.cos(b)*.007,.92,math.sin(b)*.007)
        triangle(p,q,r,trunk);triangle(q,s,r,trunk)
    width=[.25,.22,.27,.20,.24,.23][variant]
    tiers=5
    for layer in range(tiers):
        y=.17+layer*(.76/(tiers-1))
        radius=width*(1-(y-.15)/.92)**.83
        phase=layer*2.23+variant*.8
        count=5 if layer<tiers-1 else 4
        for branch in range(count):
            angle=phase+branch*math.tau/count
            reach=radius*rng.uniform(.79,1.14)
            def point(r,h,offset=0):return (math.cos(angle+offset)*r,h,math.sin(angle+offset)*r)
            root=point(.008,y+.027)
            left=point(reach*.64,y-.025,-.36)
            tip=point(reach,y-.075-rng.random()*.016)
            right=point(reach*.64,y-.025,.36)
            ridge=point(reach*.48,y+.028)
            underside=point(reach*.42,y-.048)
            for a,b in [(root,left),(left,tip),(tip,right),(right,root)]:triangle(a,underside,b,foliage[(branch+layer)%3])
            # Inset snow cap leaves a green fringe and a drooping irregular tip.
            cap=[point(.009,y+.04),point(reach*.61,y-.011,-.32),point(reach*.95,y-.06),point(reach*.61,y-.011,.32)]
            crest=(ridge[0],ridge[1]+.014,ridge[2])
            for j in range(4):triangle(cap[j],cap[(j+1)%4],crest,snow[(j+layer)%3])
    # Small snowy crown reaches the exact normalized height.
    top=(.008,1,0)
    for i in range(6):
        a,b=i*math.tau/6,(i+1)*math.tau/6
        triangle((math.cos(a)*.034,.90,math.sin(a)*.034),(math.cos(b)*.034,.90,math.sin(b)*.034),top,snow[i%3])
    xs=positions[0::3];zs=positions[2::3]
    return dict(name=f'Alpine fir {variant+1}',position=encode(positions),normal=encode(normals),color=encode(colors),uv=encode([0.]*(len(positions)//3*2)),index=encode(indices,'H'),width=max(xs)-min(xs),depth=max(zs)-min(zs))

variants=[tree(i) for i in range(6)]
data=dict(source='Original procedural alpine firs, tools/build-v5-trees.py',vertexColors=True,variants=variants)
(ROOT/'assets/generated/tree-pack.js').write_text('// Original V5 alpine firs. Ground origin, normalized height, six instanced variants.\nwindow.LIFT_TREE_ASSETS='+json.dumps(data,separators=(',',':'))+';\n')
print('Triangles per variant:',[len(base64.b64decode(v['index']))//6 for v in variants])
