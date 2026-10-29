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

def sculpted_fir():
    """One study prototype: overlapping snow pillows over closed dark branches."""
    positions, colors, normals, indices, smoothing = [], [], [], [], []
    rng = random.Random(5100)
    snow = (.81, .88, .91)
    green = (.035, .095, .073)
    bark = (.115, .071, .047)

    def face(a, b, c, color, group, up=None, outward=None):
        def cross():
            u = [b[i]-a[i] for i in range(3)]
            v = [c[i]-a[i] for i in range(3)]
            return [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]
        n = cross()
        if (up is not None and n[1]*up < 0) or (outward is not None and sum(n[i]*outward[i] for i in range(3)) < 0):
            b, c = c, b
            n = cross()
        length = math.sqrt(sum(v*v for v in n))
        if length < 1e-10:
            raise ValueError('Degenerate study triangle')
        offset = len(positions)//3
        for point in [a, b, c]:
            positions.extend(point)
            colors.extend(color)
            normals.extend(n)
            smoothing.append((group, *(round(v, 7) for v in point)))
        indices.extend([offset, offset+1, offset+2])

    for i in range(7):
        a, b = i*math.tau/7, (i+1)*math.tau/7
        p = (math.cos(a)*.017, 0, math.sin(a)*.017)
        q = (math.cos(b)*.017, 0, math.sin(b)*.017)
        r = (math.cos(a)*.007, .92, math.sin(a)*.007)
        t = (math.cos(b)*.007, .92, math.sin(b)*.007)
        outward = (math.cos((a+b)/2), 0, math.sin((a+b)/2))
        face(p, q, r, bark, 'bark', outward=outward)
        face(q, t, r, bark, 'bark', outward=outward)

    # Broad, asymmetric lobes overlap vertically instead of floating as flat fans.
    for tier, y in enumerate([.20, .31, .42, .53, .64, .75, .85, .90]):
        radius = .232*(1-(y-.17)/.91)**.83
        phase = tier*2.23+.2
        for branch in range(3):
            angle = phase+branch*math.tau/3+rng.uniform(-.08, .08)
            reach = radius*rng.uniform(.88, 1.03)
            def point(r, h, turn=0):
                return (math.cos(angle+turn)*r, h, math.sin(angle+turn)*r)
            # The dark hull is closed above and below, including the hanging tip.
            rim = [point(.009, y+.05), point(reach*.35, y+.03, -.90),
                   point(reach*.77, y-.016, -.48), point(reach, y-.083),
                   point(reach*.77, y-.016, .48), point(reach*.35, y+.03, .90)]
            top, bottom = point(reach*.44, y+.043), point(reach*.42, y-.033)
            shade = tuple(c*(.94+branch*.025) for c in green)
            for i in range(6):
                face(rim[i], rim[(i+1)%6], top, shade, 'foliage-top', up=1)
                face(rim[(i+1)%6], rim[i], bottom, shade, 'foliage-bottom', up=-1)
            # One smooth dome has thick shoulders and an inset snow tongue.
            cap = [point(.010, y+.074), point(reach*.34, y+.065, -.85),
                   point(reach*.73, y+.009, -.44), point(reach*.95, y-.058),
                   point(reach*.73, y+.009, .44), point(reach*.34, y+.065, .85)]
            crest = point(reach*.42, y+.085)
            for i in range(6):
                face(cap[i], cap[(i+1)%6], crest, snow, 'snow', up=1)

    # Narrow snow-covered leader; no geometry extends above normalized height 1.
    for i in range(6):
        a, b = i*math.tau/6, (i+1)*math.tau/6
        face((math.cos(a)*.033, .91, math.sin(a)*.033),
             (math.cos(b)*.033, .91, math.sin(b)*.033),
             (.003, 1, 0), snow, 'leader', outward=(math.cos((a+b)/2), 0, math.sin((a+b)/2)))

    # Area-weighted normals soften each snow volume without adding vertices/faces.
    sums = {}
    for i, key in enumerate(smoothing):
        out = sums.setdefault(key, [0., 0., 0.])
        for axis in range(3):
            out[axis] += normals[i*3+axis]
    for i, key in enumerate(smoothing):
        n = sums[key]
        length = math.sqrt(sum(v*v for v in n))
        normals[i*3:i*3+3] = [v/length for v in n]
    # Keep the previous variant's bounding envelope so existing clearance rules hold.
    prior = tree(0)
    raw = base64.b64decode(prior['position'])
    old = struct.unpack('<'+'f'*(len(raw)//4), raw)
    def axis_scale(axis):
        new_lo, new_hi = min(positions[axis::3]), max(positions[axis::3])
        old_lo, old_hi = min(old[axis::3]), max(old[axis::3])
        return min(1., old_lo/new_lo if new_lo < old_lo else 1.,
                   old_hi/new_hi if new_hi > old_hi else 1.)
    old_radius = max(math.hypot(old[i], old[i+2]) for i in range(0, len(old), 3))
    new_radius = max(math.hypot(positions[i], positions[i+2]) for i in range(0, len(positions), 3))
    radius_scale = min(1., old_radius/new_radius)
    x_scale = axis_scale(0)*radius_scale
    z_scale = axis_scale(2)*radius_scale
    for i in range(0, len(positions), 3):
        positions[i] *= x_scale
        positions[i+2] *= z_scale
        n = (normals[i]/x_scale, normals[i+1], normals[i+2]/z_scale)
        length = math.sqrt(sum(v*v for v in n))
        normals[i:i+3] = [v/length for v in n]
    return dict(name='Snow-pillow fir study', position=encode(positions),
                normal=encode(normals), color=encode(colors),
                uv=encode([0.]*(len(positions)//3*2)), index=encode(indices, 'H'),
                width=max(positions[0::3])-min(positions[0::3]),
                depth=max(positions[2::3])-min(positions[2::3]))

variants=[sculpted_fir()]+[tree(i) for i in range(1,6)]
data=dict(source='Original procedural alpine firs, tools/build-v5-trees.py',vertexColors=True,variants=variants)
(ROOT/'assets/generated/tree-pack.js').write_text('// Original V5 alpine firs. Ground origin, normalized height, six instanced variants.\nwindow.LIFT_TREE_ASSETS='+json.dumps(data,separators=(',',':'))+';\n')
(ROOT/'designs/data/fir-after.js').write_text('// Current variant 0, generated with the game asset for the isolated study.\nwindow.LIFT_FIR_AFTER='+json.dumps(variants[0],separators=(',',':'))+';\n')
print('Triangles per variant:',[len(base64.b64decode(v['index']))//6 for v in variants])
