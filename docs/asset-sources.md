# Assets and references

All paths below are relative to the project root.

## Trees

- Original user-supplied model: `assets/models/snowy-trees.glb`.
- Generated geometry/palette bundle: `assets/generated/tree-pack.js`.
- Generator: `tools/build-tree-assets.py`.

## Elevation data

- Full heightmap: `assets/data/terrain-heightmap.js`.
- Source and processing metadata: [terrain-sources.json](../assets/data/terrain-sources.json).
- Cropped scale-study heightmap: `assets/data/lift-scale-heightmap.js`.

## Reference images

User-provided reference images are grouped by lift type:

- `assets/references/chairlifts/`
- `assets/references/telepheriques/`
- `assets/references/telepheriques/solo-structures/` — two tower views, an arrival-cage view and `long-roz.png` (copied from the user’s `long_roz.png`), used for the Solo structure studies and larger hanging sheave rows.
- `assets/references/stations/shell-study/` — two user-supplied station housing/front views, used by `experiments/station-shell.html`.
- `assets/references/stations/` — compact three-wheel receptor and separate approach-pole references supplied October 15.

## Winter vehicles — reference link

The project previously stored this link in `winter_vehicles.txt`. It is retained here for later scenery work; the linked pack has not been added to the project:

[Cartoon low-poly winter vehicles pack](https://sketchfab.com/3d-models/cartoon-low-poly-winter-vehicles-pack-766d81703bf740928b64ff4e98da3244)

## Four larger mountain designs

`experiments/mountain-maps.html` uses `assets/data/terrain-heightmap.js` as a source of secondary terrain detail. Hand-placed ridge networks, bowls, gorge walls and station shelves define the four fictional landscapes; locally detrended samples from the bundled Alpine elevation context add gullies and ribs. These are altered design maps, not accurate reproductions of the original geography. The original Mapzen/Terrarium source and attribution links remain in `assets/data/terrain-sources.json` and this document's terrain section.

The study's lightweight pine trees are procedural cone/trunk instances, not additional downloaded models. The current game continues to use its supplied tree pack at a reduced placement count.
