# Lift Co. - V3

A cozy Three.js ski-resort prototype. Serve the folder over local HTTP (e.g. `python3 -m http.server`) and open the pages from there; they do not load via `file://`. There is no build step. The Three.js CDN needs an internet connection.

Local village milestone: [construction, shuttle and resident specification](docs/village-shuttle.md).
The original resort (`index.html`) remains unchanged.

## Start here

| Page | Purpose |
| --- | --- |
| [Station variants workshop](designs/station-variants.html) | Four approved station directions under refinement: Fixed B, Gondola B, Tramway B and Funitel C. Detachable chairs unselected. Closed building shells, supported machinery, animated arrivals and cutaways. [Research notes](docs/station-variants.md). |
| [empty-map.html](empty-map.html) | Current game: Upper Snowfields V3, 3.6 km terrain, thirteen buildable lift choices, scenery, construction/removal, flight controls and a hideable UI. No prebuilt lifts. |
| [index.html](index.html) | Original working resort with Summit Express, skiers and the construction UI. |

The [V3 checkpoint](docs/v3-checkpoint.md) adds graphics presets, focused workspaces, smoother station earthworks and grounded, height-scaled pylon foundations. V1/V2 worlds migrate to V3 after an automatic backup.

These two pages stay at the project root to preserve their browser addresses. Upper Snowfields uses its own browser saves, scoped by resort slot. Earlier empty-map saves remain intact. See [V1 backup and release notes](docs/v1-upper-snowfields.md).

The pre-funitel game sources are preserved in `archive/releases/pre-funitel-integration-20261016/`. The earlier pre-change build is in `archive/releases/pre-solo-hold-20261016/`. See [the October 16 update](docs/2026-10-16-lift-details.md) for save backups and the next cabin studies.

## Approved lift designs

The four approved B designs are now buildable in the game: **Arcabulle** (6-seat detachable bubble chair), **Alps-inspired double** (2-seat fixed-grip), **Panoramabahn** (4-seat bubble chair with its own angle structure) and **Princesse / Palace8** (8-seat gondola with its own passenger mid-station). The special layouts appear as dedicated dropdown choices. Place the two end stations, then drag the automatically placed middle ring to set the bend. Their [inspection pages and reference notes](docs/chairlift-expansion-studies.md) remain available. [Construction, operations and connections](docs/build-operate.md) describe the playable integration.

| Study | Selected models |
| --- | --- |
| [Coblence 3S](designs/3s-coblence.html) | CWA Zeta: **three cabin + three tower proposals**. |
| [Campitello 3S](designs/3s-campitello.html) | CWA Atria: **three cabin + three tower proposals**. |
| [Alpin Express 3S](designs/3s-alpin-express.html) | Gangloff / Von Roll: **three cabin + three tower proposals**. |
| [Rocharbois funitel](designs/funitel-rocharbois.html) | **Integrated in the game**: cabin A / Sotelem, Yumbo towers, timber return and drive terminal, moving-load cables and three independently supported cabin sections. [Notes](docs/funitel-rocharbois.md). |
| [Chairlifts](designs/chairlifts.html) | **Classic** - four seats; **Ridge** - six seats. |
| [Téléphériques](designs/telepheriques.html) | **Heritage** - compact; **Glacier** - panoramic. |
| [Single-arm téléphérique](designs/single-arm.html) | **Solo** - the longer 4.5 m version. |

Design studies include model inspection and animation previews. The [three new 3S studies](docs/3s-studies.md) are separate proposals awaiting selection; use their **Cabins / Towers** buttons to inspect each group. **Buildable families: fixed-grip and detachable chairlifts; six detachable monocable gondola choices; the 12-person reversible aerial tramway (Solo); and the 75-person reversible funitel. All thirteen are buildable in `empty-map.html`.** Classic uses its approved compact terminal and constant fixed-grip speed; its [original station study](experiments/classic-chairlift.html) remains available. Heritage and Glacier remain design studies. Solo is buildable with its timber halls, inclined valley dock, flat or inclined upper dock, Heavy Portal pylons and twin haul circuits. Its arrival requires an open downhill approach; small station cuts are automatic. Circulating lifts have station cable-entry guides, yielding hold-down wheels and pylon floodlights. Solo retains its fixed carrying-rope saddles and recessed traction guides. New lines no longer generate ski slopes automatically. Chairlifts and gondolas support fixed-foot column tilt, closely placed towers on shared foundations, an adjustable grouping distance and gold highlighting for the selected tower.

## Megève gondola cabin studies

Selected cabins: Arbois A, Jaillet C / Full shoulder, and Princesse A/C. The studies include comparison and single-model views, opening controls, colour controls and enlarged supplied reference photos.

| Reference | Page | Variants |
| --- | --- | --- |
| Mont d’Arbois | [Cabin 1](designs/gondola-mont-arbois.html) | **A Lantern - selected**, reversed hanger, door ski pockets |
| Jaillet | [Cabin 2](designs/gondola-jaillet.html) | **C Full shoulder - selected**, compact front/rear grilles |
| Princesse | [Cabin 3](designs/gondola-princesse.html) | **A Panorama + C Touring - selected**, reversed hangers |

Jaillet V4 has a round footprint, a smaller base, fuller sides and curved shoulders that close over the roof. Shell and glazing share the same egg-shaped profile. The newest station photo and POMA patent drawing are included in the reference gallery. Its complete end shells slide around the fixed interior. Use **Slide the shell open** to inspect the proposal. The four selected cabins are now additional build options; the original Alpine cabin remains available as Classic. See [integration notes](docs/gondola-integration.md). [Reference and implementation notes](docs/gondola-megeve-studies.md).

## Experiments

**Selected map: Upper Snowfields V1**, based on Twin Summit Pass. It is now the main game terrain; earlier map studies remain available below.

| Page | Purpose |
| --- | --- |
| [Twin Summit upper terrain](experiments/twin-summit-options.html) | Four alternatives based on the selected Twin Summit Pass: summit terraces, high bowls, ridge balconies and broader upper snowfields. |
| [Four mountain maps](experiments/mountain-maps.html) | Four larger 3.6 km terrain designs with station shelves, sparse trees and a laptop rendering preset. |
| [Solo complete line](experiments/solo-line.html) | Two reversible Solo cabins, enclosed timber halls around inclined docks (upper station over a cliff), supported spans and Heavy Portal pylons; 10.25 m/s cruise, 7 m/s pylon passage. |
| [Solo playground](experiments/solo-playground.html) | Adjustable Solo line with enclosed timber stations, boxed carriage wheels and low pylon guides. Pylon positions/heights, station floors, terrain cases, journey scrubbing, valley drive and summit tension cutaways. Independent of resort saves. |
| [Solo tower & arrival studies](experiments/solo-structures.html) | Three lattice/support tower interpretations and a bare inclined arrival cage with Solo passage animation. |
| [Station housing study](experiments/station-shell.html) | Reference-based rounded upper housing, glazing, roof and cable receptors over the existing foundation. |
| [Classic fixed-grip study](experiments/classic-chairlift.html) | Compact reference-style terminal and four-seat chairs moving at one constant speed. |
| [Grouped tower foundations](experiments/grouped-towers.html) | Adjust close tower positions, grouping distance, individual heights and column lean; one shared foundation per group on flat ground, a crest or a side slope. |
| [Lift builder](experiments/lift-builder.html) | Flat-ground station/tower placement and height controls. |
| [Terrain studies](experiments/terrain.html) | Landscape shape comparisons. |
| [Lift scale study](experiments/lift-scale.html) | Gondolas and stations on a cropped Alpine heightmap. |

## Folder guide

```text
ski-lift/
├── README.md                  Project navigation - this file
├── index.html                 Original resort
├── empty-map.html             Large blank map / construction
├── designs/                   Approved lift design pages
├── experiments/               Terrain, placement and scale prototypes
├── src/
│   ├── builder/               Layout model, workshop view, resort editor
│   ├── lifts/                 Reusable gondola/station model
│   ├── resort/                World data, terrain, routing, operations UI and graphics
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
- **Solo reversible lift:** [src/lifts/solo-runtime.js](src/lifts/solo-runtime.js), [solo.js](src/lifts/solo.js), [solo-structures.js](src/lifts/solo-structures.js) and [solo-machinery.js](src/lifts/solo-machinery.js). [Machinery reference and model notes](docs/solo-machinery.md).
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
