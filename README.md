# Lift Co. — V1

A cozy Three.js ski-resort prototype. Open the HTML pages directly in a browser; there is no build step. The Three.js CDN needs an internet connection.

## Start here

| Page | Purpose |
| --- | --- |
| [empty-map.html](empty-map.html) | Current game: Upper Snowfields V1, 3.6 km terrain, seven buildable lift styles, scenery, construction/removal, flight controls and a hideable UI. No prebuilt lifts. |
| [index.html](index.html) | Original working resort with Summit Express, skiers and the construction UI. |

These two pages stay at the project root to preserve their browser addresses. V1 uses its own browser saves, scoped by resort slot. Earlier empty-map saves remain intact. See [V1 backup and release notes](docs/v1-upper-snowfields.md).

The pre-change build is preserved in `archive/releases/pre-solo-hold-20261016/`. See [the October 16 update](docs/2026-10-16-lift-details.md) for save backups and the next cabin studies.

## Approved lift designs

| Study | Selected models |
| --- | --- |
| [Rocharbois funitel](designs/funitel-rocharbois.html) | **Cabin A / Sotelem selected** — three tower and station proposals, moving-load cables and three independently supported cabin sections. [Notes](docs/funitel-rocharbois.md). |
| [Chairlifts](designs/chairlifts.html) | **Classic** — four seats; **Ridge** — six seats. |
| [Téléphériques](designs/telepheriques.html) | **Heritage** — compact; **Glacier** — panoramic. |
| [Single-arm téléphérique](designs/single-arm.html) | **Solo** — the longer 4.5 m version. |

Design studies include model inspection and animation previews. **Chair Lift: Classic and 6-Seater. Gondola: Classic, Panorama, Touring, Sigma Arbois and Sigma SP77. All seven are buildable in `empty-map.html`.** Classic uses its approved compact terminal and constant fixed-grip speed; its [original station study](experiments/classic-chairlift.html) remains available. Heritage and Glacier remain design studies. Solo is on hold; its model, runtime and complete-line study remain available for later work. All buildable lifts have station cable-entry guides, with yielding hold-down wheels, and night floodlights on their pylons. New lines no longer generate ski slopes automatically.

## Megève gondola cabin studies

Selected cabins: Arbois A, Jaillet C / Full shoulder, and Princesse A/C. The studies include comparison and single-model views, opening controls, colour controls and enlarged supplied reference photos.

| Reference | Page | Variants |
| --- | --- | --- |
| Mont d’Arbois | [Cabin 1](designs/gondola-mont-arbois.html) | **A Lantern — selected**, reversed hanger, door ski pockets |
| Jaillet | [Cabin 2](designs/gondola-jaillet.html) | **C Full shoulder — selected**, compact front/rear grilles |
| Princesse | [Cabin 3](designs/gondola-princesse.html) | **A Panorama + C Touring — selected**, reversed hangers |

Jaillet V4 has a round footprint, a smaller base, fuller sides and curved shoulders that close over the roof. Shell and glazing share the same egg-shaped profile. The newest station photo and POMA patent drawing are included in the reference gallery. Its complete end shells slide around the fixed interior. Use **Slide the shell open** to inspect the proposal. The four selected cabins are now additional build options; the original Alpine cabin remains available as Classic. See [integration notes](docs/gondola-integration.md). [Reference and implementation notes](docs/gondola-megeve-studies.md).

## Experiments

**Selected map: Upper Snowfields V1**, based on Twin Summit Pass. It is now the main game terrain; earlier map studies remain available below.

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
- **Solo reversible lift:** [src/lifts/solo-runtime.js](src/lifts/solo-runtime.js), [solo.js](src/lifts/solo.js) and [solo-structures.js](src/lifts/solo-structures.js).
- **V1 mountain:** [src/terrain/twin-summit-variants.js](src/terrain/twin-summit-variants.js), layered on the approved Twin Summit Pass.
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
