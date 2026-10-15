# Lift Co.

A cozy Three.js ski-resort prototype. Open the HTML pages directly in a browser; there is no build step. The Three.js CDN needs an internet connection.

## Start here

| Page | Purpose |
| --- | --- |
| [empty-map.html](empty-map.html) | Current blank-map starting point: larger terrain, scenery, lift construction and removal with undo; no prebuilt lifts. |
| [index.html](index.html) | Original working resort with Summit Express, skiers and the construction UI. |

These two pages stay at the project root to preserve their browser addresses. Each uses its own browser save, scoped by mountain seed.

## Approved lift designs

| Study | Selected models |
| --- | --- |
| [Chairlifts](designs/chairlifts.html) | **Classic** — four seats; **Ridge** — six seats. |
| [Téléphériques](designs/telepheriques.html) | **Heritage** — compact; **Glacier** — panoramic. |
| [Single-arm téléphérique](designs/single-arm.html) | **Solo** — the longer 4.5 m version. |

Design studies include model inspection and animation previews. **Alpine gondola, Ridge and Classic are buildable in `empty-map.html`.** Classic uses its approved compact terminal and constant fixed-grip speed; its [original station study](experiments/classic-chairlift.html) remains available. Téléphériques are still design studies. All buildable lifts have automatic station cable-entry guides.

## Experiments

**Selected map direction: Twin Summit Pass.** Its summit areas and natural ski faces are being refined in the separate study below.

| Page | Purpose |
| --- | --- |
| [Twin Summit upper terrain](experiments/twin-summit-options.html) | Four alternatives based on the selected Twin Summit Pass: summit terraces, high bowls, ridge balconies and broader upper snowfields. |
| [Four mountain maps](experiments/mountain-maps.html) | Four larger 3.6 km terrain designs with station shelves, sparse trees and a laptop rendering preset. |
| [Solo complete line](experiments/solo-line.html) | Two reversible Solo cabins, inclined docking cages (upper terminal over a cliff), supported cable spans and Heavy Portal pylons on flat ground, an uphill slope and a hill crest; 10.25 m/s cruise, 7 m/s pylon passage. |
| [Solo tower & arrival studies](experiments/solo-structures.html) | Three lattice/support tower interpretations and a bare inclined arrival cage with Solo passage animation. |
| [Station housing study](experiments/station-shell.html) | Reference-based rounded upper housing, glazing, roof and cable receptors over the existing foundation. |
| [Classic fixed-grip study](experiments/classic-chairlift.html) | Compact reference-style terminal and four-seat chairs moving at one constant speed. |
| [Lift builder](experiments/lift-builder.html) | Flat-ground station/tower placement and height controls. |
| [Terrain studies](experiments/terrain.html) | Landscape shape comparisons. |
| [Lift scale study](experiments/lift-scale.html) | Gondolas and stations on a cropped Alpine heightmap. |

## Folder guide

```text
ski-lift/
├── README.md                  Project navigation — this file
├── index.html                 Original resort
├── empty-map.html             Large blank map / construction
├── designs/                   Approved lift design pages
├── experiments/               Terrain, placement and scale prototypes
├── src/
│   ├── builder/               Layout model, workshop view, resort editor
│   ├── lifts/                 Reusable gondola/station model
│   └── styles/                Shared resort UI stylesheet
├── assets/
│   ├── data/                  Full/cropped elevation data and source metadata
│   ├── generated/             Browser-ready tree geometry bundle
│   ├── models/                Original tree GLB
│   └── references/            Chairlift and téléphérique reference images
├── docs/                      Construction guide, scale notes, asset sources
├── tools/                     Python asset generators
└── archive/backups/           Historical snapshots
```

## Working on the project

- **Map / simulation:** edit the relevant root HTML page. These still contain their terrain and simulation code inline.
- **Construction rules:** [src/builder/layout.js](src/builder/layout.js) handles the cable profile; [src/builder/resort-editor.js](src/builder/resort-editor.js) handles placement in the resort.
- **Flat workshop geometry:** [src/builder/view.js](src/builder/view.js).
- **Buildable lift catalog / carrier models:** [src/lifts/catalog.js](src/lifts/catalog.js), [src/lifts/ridge-chair.js](src/lifts/ridge-chair.js) and [src/lifts/classic-chair.js](src/lifts/classic-chair.js).
- **Approved detachable station housing:** [src/lifts/detachable-station.js](src/lifts/detachable-station.js), shared by the game and housing study.
- **Station models:** [src/lifts/classic-station.js](src/lifts/classic-station.js) and [src/lifts/station-guides.js](src/lifts/station-guides.js).
- **Scale-study lift model:** [src/lifts/gondola.js](src/lifts/gondola.js). The root resort pages currently retain their own inline lift factory.
- **Resort UI:** [src/styles/resort.css](src/styles/resort.css).
- **Reference pictures:** [assets/references/](assets/references/).

More detail: [lift construction](docs/lift-builder.md), [lift scale](docs/lift-scale.md), [asset sources](docs/asset-sources.md), [buildable lift types](docs/lift-types.md).

## Asset generators

Run these from the project root when intentionally rebuilding assets. Python dependencies include NumPy, and Pillow for terrain generation.

```sh
python3 tools/build-tree-assets.py
python3 tools/build-terrain-data.py
python3 tools/build-lift-test-data.py
```

Tree generation reads `assets/models/snowy-trees.glb` and writes `assets/generated/tree-pack.js`. Terrain generation writes the full heightmap and metadata to `assets/data/`; it downloads source tiles if uncached. The lift-scale generator crops that local full heightmap into `assets/data/lift-scale-heightmap.js`.

Historical `.bak` files are kept in `archive/backups/` as original snapshots. Their embedded paths describe their original layout; restore and adapt them before using them as pages.
