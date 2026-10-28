#!/usr/bin/env python3
"""Build a public static preview without archives, deployment files or secrets."""
from pathlib import Path
import argparse
import datetime
import gzip
import hashlib
import json
import re
import shutil

project=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('output',type=Path)
parser.add_argument('--shared-saves',type=Path,help='Directory containing approved shared resort snapshots')
arguments=parser.parse_args()
output=arguments.output.resolve()
if output.exists():
    raise SystemExit('Output must be a new directory')
output.mkdir(parents=True)
blocked=re.compile(r'(?:^\.|secret|token|credential|auth\.json|\.pem$|\.key$|\.keystore$)',re.I)
allowed={'.html','.js','.css','.json','.jpg','.jpeg','.png','.webp','.svg','.glb','.bin','.ttf','.woff2','.pdf','.md','.txt'}
paths=[project/'load-resort.html',project/'empty-map.html',project/'index.html',project/'designs/station-variants.html',project/'designs/footpaths.html',project/'docs/station-variants.md',project/'docs/footpath-studies.md']
for folder in ['src','assets']:
    paths.extend(p for p in (project/folder).rglob('*') if p.is_file())
for source in paths:
    relative=source.relative_to(project)
    if source.is_symlink() or any(blocked.search(part) for part in relative.parts):
        raise SystemExit('Unexpected private or linked file in public inputs')
    if source.suffix.lower() not in allowed and source.name!='LICENSE':
        raise SystemExit('Unexpected public file extension: '+str(relative))
    target=output/relative
    if relative==Path('index.html'):
        target=output/'original-resort.html'
    target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(source,target)

# Shared snapshots are explicit deployment inputs, never browser backups/history.
if arguments.shared_saves:
    folder=output/'shared-resorts'
    folder.mkdir()
    for source in sorted(arguments.shared_saves.glob('*.json')):
        if source.is_symlink() or not re.fullmatch(r'[a-f0-9]{24}',source.stem):
            raise SystemExit('Invalid shared-save filename')
        payload=json.loads(source.read_text())
        current=payload.get('current',{})
        if payload.get('format')!='lift-co-shared-save' or current.get('version')!=3 or current.get('mapVersion')!='upper-snowfields-v1' or not isinstance(current.get('lifts'),list):
            raise SystemExit('Unsupported shared resort snapshot')
        (folder/source.name).write_text(json.dumps(payload,separators=(',',':'),allow_nan=False)+'\n')

# Keep the authored game untouched. Only the staged HTML gets local module URLs.
# The flat vendor directory serves both the game and the station workshop.
game=output/'empty-map.html'
text=game.read_text()
text=text.replace('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js','./assets/vendor/three/three.module.js')
text=text.replace('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/','./assets/vendor/three/')
text=text.replace("'three/addons/controls/OrbitControls.js'","'three/addons/OrbitControls.js'")
game.write_text(text)
# The deployed index is the game launcher; keep the original resort reachable.
interface=output/'src/resort/interface.js'
interface.write_text(interface.read_text().replace("window.location.assign('./index.html')", "window.location.assign('./original-resort.html')"))
(output/'index.html').write_text('''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0; url=./empty-map.html"><title>Lift Co.</title></head><body><p><a href="./empty-map.html">Open Upper Snowfields</a></p><p><a href="./designs/station-variants.html">Station workshop</a></p></body></html>
''')
release=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
files=[]
for target in sorted(output.rglob('*')):
    if not target.is_file():
        continue
    data=target.read_bytes()
    if target.suffix.lower() in {'.html','.js','.css','.json','.md','.txt'}:
        text=data.decode('utf-8')
        if re.search(r'/home/|/mnt/storage/|badeparday|sk-or-[A-Za-z0-9]|nvapi-[A-Za-z0-9]|ghp_[A-Za-z0-9]|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY',text):
            raise SystemExit('Private information check failed: '+str(target.relative_to(output)))
    entry={'path':target.relative_to(output).as_posix(),'size':len(data),'sha256':hashlib.sha256(data).hexdigest()}
    if target.suffix.lower() in {'.html','.js','.css','.json','.svg','.md','.txt'} and len(data)>256:
        compressed=gzip.compress(data,compresslevel=9,mtime=0)
        if len(compressed)<len(data):
            target.with_name(target.name+'.gz').write_bytes(compressed)
            entry.update(gzip=True,gzipSize=len(compressed))
    files.append(entry)
(output/'release.json').write_text(json.dumps({'release':release,'files':files},indent=2)+'\n')
print(json.dumps({'release':release,'files':len(files),'source_bytes':sum(f['size'] for f in files),'transfer_bytes':sum(f.get('gzipSize',f['size']) for f in files)}))
