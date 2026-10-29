# Goal

V5 is an aesthetic checkpoint: original snow-covered trees, finished stylized guests and a compact resort interface inspired by the two Steam references. Preserve all lift/station designs, simulation, routing, V4 save schema, UI IDs/hooks, rig anchors, scenery placement and hide/restore/dirty-region behavior. No VPS deployment in this checkpoint without a request.

# Plan

- [x] Research canonical app IDs, screenshots, capsules, community galleries and available reviews before modeling.
- [x] Recover a permanent working baseline and preserve incomplete station-flow sources separately.
- [ ] Trees: six original normalized prototypes, evergreen branch silhouettes and snow caps within existing instancing budget.
- [ ] Skiers: rounded clothing, goggles and coherent winter equipment using existing rig anchors and poses.
- [ ] UI: compact slate panels, clear controls and restrained accents, preserving IDs and all functions.
- [ ] Verify syntax, dependency availability, rig/scenery invariants and V4 document loading with focused checks.
- [ ] Browser acceptance: empty error overlay, full guest journey, laptop frame rate and tablet layout. Requires an available browser; do not mark accepted from CPU-only checks.
- [ ] Optional map surfacing only after trees, skiers and UI pass browser acceptance.

## Research notes (2026-10-29)

Canonical identities verified through Steam appdetails and store pages:

- [4493130: Ski-E-O! Ski Resort Tycoon](https://store.steampowered.com/app/4493130/SkiEO_Ski_Resort_Tycoon/), Falling Damage Games. Screenshot evidence: close skiers in screenshot 1, cafe guests in screenshot 5, UI in screenshots 3 and 4. Evergreen silhouettes have irregular layered crowns, dark recessed foliage and broad snow shelves. Characters have rounded padded jackets, compact limbs, large hats/helmets and strong goggle bands. UI uses shallow slate panels, small icon toolbars and localized contextual editing. Adopt readable winter silhouettes and compact task panels; do not reproduce detailed simulation controls or game assets.
- [4960910: Pinebrook Ski Resort](https://store.steampowered.com/app/4960910/Pinebrook_Ski_Resort/), LB_Game. User nickname "Ski Slope Tycoon" differs from the canonical title. Screenshots 0-3 show narrow angular evergreens with stepped, snow-covered branch fans, brown exposed trunks and uneven crown outlines. Characters are small, simplified and brightly dressed, readable in crowds; close face detail is not established by these screenshots. Screenshots hide the management UI, so its panel/typography language cannot be reliably inferred. Do not invent UI findings for this game.

Both store pages report no user reviews. Review API requests returned non-JSON responses; no review claims are used. Community screenshot galleries were checked separately; availability is recorded in the log. Capsules are promotional artwork, not evidence of in-game model geometry. API metadata and six full-resolution screenshots per game were downloaded to /tmp/liftco-v5-references for inspection, not for shipping.

Direction: snow-laden, irregular alpine firs; friendly padded winter figures with dark goggles and small boots; cold slate interface surfaces, snow-white text, glacier-blue selection and warm amber primary actions. Keep existing layout locations and UI scale options. No additional animated vegetation, textures or runtime geometry regeneration.

# Log

## 2026-10-29

- Research: inspected appdetails and twelve full-resolution Steam screenshots. Extracted tree, character and UI observations above before modeling. Neither game has published user reviews on its store page.
- Recovery: localhost had been serving a temporary published checkpoint because the development copy lacked 13 scripts, including two station-flow modules unavailable on the VPS. Restored that same working published baseline into the permanent repository. Preserved differing incomplete development sources in ignored archive/pre-v5-incomplete-source. docs/v5-recovery.json records restored files. This is baseline recovery, not a lift redesign. The recent station-flow increment remains unavailable and is not represented as completed V5 work.
- Research follow-up: both community screenshot galleries returned HTTP 200 but no additional attributable close model studies were established. Header capsules were inspected as promotional art only. Reference imagery is not bundled into the game.
