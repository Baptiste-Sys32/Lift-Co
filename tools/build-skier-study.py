"""Keep the isolated model study on the game's actual guest rig, without loading a save."""
from pathlib import Path
import hashlib
root=Path(__file__).resolve().parents[1]
text=(root/'empty-map.html').read_text()
start=text.index('function makeSkier()')
end=text.index('function spawnSkier()',start)
source=text[start:end]
assert source.count('window.LiftCoGuestModel.dress(THREE,skier,{helmet:helm});')==1
source=source.replace('window.LiftCoGuestModel.dress(THREE,skier,{helmet:helm});','dress(THREE,skier,{helmet:helm});')
output='''/* Generated from makeSkier in empty-map.html. Study only, no resort or save access. */
window.LiftCoSkierStudyRig={create(THREE,{dress=window.LiftCoGuestModel.dress,color=0x437b79}={}){
const scene=new THREE.Scene(),lifts=[],skiers=[],JACKETS=[color];let nextTicket=0;
'''+source+'''
const s=makeSkier();s.skiSeed=5100;return s;
}};
'''
(root/'designs/data/skier-rig.js').write_text(output)
print('Study rig source hash:',hashlib.sha256(text[start:end].encode()).hexdigest())
