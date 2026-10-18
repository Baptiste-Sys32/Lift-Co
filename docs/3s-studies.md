# 3S cabin and tower studies

Three separate HTML pages, with three structural variants per subject. Colours are independent of shape. These proposals are not integrated into the game.

| Reference family | Inspection page | Cabin variants | Tower variants |
| --- | --- | --- | --- |
| Coblence / CWA Zeta | [Coblence](../designs/3s-coblence.html) | A Urban Zeta · B Full Corners · C Long Pavilion | A River Lattice · B Slender Portal · C Wide Shoulders |
| Campitello / CWA Atria | [Campitello](../designs/3s-campitello.html) | A Atria Frame · B Swept Atria · C Upright Atria | A Dolomite Portal · B Narrow Waist · C Summit Frame |
| Alpin Express / Gangloff | [Alpin Express](../designs/3s-alpin-express.html) | A Original Facets · B Tall Lantern · C Broad Gangloff | A Von Roll Gantry · B Deep Crosshead · C Compact Crest |

## Reference findings

- **Coblence:** the report identifies CWA Zeta cabins for 35 people, an eight-wheel carriage and two detachable grips. Photographs show a shallow ivory base, dark panoramic glazing and a silver hanger/carriage. The study uses the standard cabin as its shape reference, rather than the separate Urban Concept interior. [Source report](https://www.remontees-mecaniques.net/bdd/reportage-3s-de-coblence-doppelmayr-3506.html).
- **Campitello:** the report identifies CWA Atria cabins for 30 people. The photographed body has broad glass faces, silver perimeter trim, a dark roof and a tall black hanger. Interior references show a central seat island. The P1 photographs inform the flared lattice tower and its broad open crosshead. [Source report](https://www.remontees-mecaniques.net/bdd/reportage-3s-campitello-doppelmayr-9366.html).
- **Alpin Express:** the report identifies Gangloff cabins for 30 people, eight running wheels and three central Von Roll haul grips. Photographs show white lower panels, plum structural ribs, faceted glazing, a curved hanger, a roof hatch and solar panel. Interior fittings are represented as leaning supports, rather than full benches. [Source report](https://www.remontees-mecaniques.net/bdd/reportage-3s-alpin-express-von-roll-3235.html).

The reports and original image credits are preserved in the reference galleries. Photos are copied without changing their contents. Their downloaded URLs and credits are recorded in `assets/references/3s/<family>/sources.json`. Image selection includes cabin exteriors, interiors, carriages and pylons.

## Geometry and scope

Cabins have real double sliding-door apertures at both ends, fixed side windows, solid roof caps with visible undersides, interiors and separate carriage/hanger groups. Rounded profiles are used for Zeta/Atria; planar facets for Gangloff. Variants change corner radii, body proportions, waist fullness, roof taper, mullions and lower-body depth, rather than only paint.

Each carriage has two four-wheel rows on two carrying ropes and a separate central haul rope. The model retains wheel pivots and visible grip/jaw assemblies. Tower heads use continuous carrying-rope saddles and a separate haul-wheel row. Three tower variants per family vary shaft proportions, upper bracing, head depth and saddle length. These are interpretations of the supplied references; dimensions and mechanism geometry are estimates, not manufacturer drawings or engineering calculations.

## Controls

Use **Cabins / Towers**, then select **A / B / C** or compare all three. Left drag orbits; right drag rotates the camera in place; the wheel zooms. Preset views include a carriage/head close-up. Cabin doors open with the button or slider. Roof/carriage cutaway, glazing opacity, optional passengers and independent paint controls are available. Reference thumbnails open an enlarged gallery with previous/next navigation.

The scene uses a pixel ratio capped at 1.4, one shadow map and merged static geometry. Towers are created only when their study tab is opened. Geometry primitives are shared within a page; animated door and wheel pivots remain separate.

## Files

- `src/lifts/three-s-studies.js`: family definitions, nine cabin models and nine tower models.
- `src/lifts/three-s-study-viewer.js`: inspection room and interaction controls.
- `src/styles/three-s-study.css`: small additions to the established cabin-study style.
- `designs/3s-*.html`: the three independent entry pages.

No game catalog, live lift runtime or saved network is modified in this design phase. Browser testing has not been run for this change.
