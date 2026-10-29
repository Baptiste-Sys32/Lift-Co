# Goal

V5 is an aesthetic checkpoint: original snow-covered trees, finished stylized guests and a compact resort interface inspired by the two Steam references. Preserve all lift/station designs, simulation, routing, V4 save schema, UI IDs/hooks, rig anchors, scenery placement and hide/restore/dirty-region behavior. No VPS deployment in this checkpoint without a request.

# Plan

- [x] Initial source identification.
- [x] Deeper visual research: official press gallery, both trailers, player footage, multiple camera angles and documented uncertainty. See [research revision 2](v5-research.md) and [reference board](v5-reference-board.html).
- [x] Recover a permanent working baseline and preserve incomplete station-flow sources separately.
- [ ] Trees: revise the first prototype against research revision 2; validate ground, cabin and overview silhouettes before deriving six accepted variants.
- [ ] Skiers: revise padded body volume, goggle frame and headwear against research revision 2; retain all rig anchors and validate standing/skiing/seated views.
- [ ] UI: study a light compact direction using Pinebrook grouping and Ski-E-O status hierarchy. Preserve IDs and all functions. The earlier slate-only choice is superseded.
- [ ] Verify syntax, dependency availability, rig/scenery invariants and V4 document loading with focused checks.
- [ ] Browser acceptance: empty error overlay, full guest journey, laptop frame rate and tablet layout. Requires an available browser; do not mark accepted from CPU-only checks.
- [ ] Optional map surfacing only after trees, skiers and UI pass browser acceptance.

## Initial research notes (2026-10-29, superseded by revision 2)

Canonical identities verified through Steam appdetails and store pages:

- [4493130: Ski-E-O! Ski Resort Tycoon](https://store.steampowered.com/app/4493130/SkiEO_Ski_Resort_Tycoon/), Falling Damage Games. Screenshot evidence: close skiers in screenshot 1, cafe guests in screenshot 5, UI in screenshots 3 and 4. Evergreen silhouettes have irregular layered crowns, dark recessed foliage and broad snow shelves. Characters have rounded padded jackets, compact limbs, large hats/helmets and strong goggle bands. UI uses shallow slate panels, small icon toolbars and localized contextual editing. Adopt readable winter silhouettes and compact task panels; do not reproduce detailed simulation controls or game assets.
- [4960910: Pinebrook Ski Resort](https://store.steampowered.com/app/4960910/Pinebrook_Ski_Resort/), LB_Game. User nickname "Ski Slope Tycoon" differs from the canonical title. Screenshots 0-3 show narrow angular evergreens with stepped, snow-covered branch fans, brown exposed trunks and uneven crown outlines. Characters are small, simplified and brightly dressed, readable in crowds; close face detail is not established by these screenshots. Screenshots hide the management UI, so its panel/typography language cannot be reliably inferred. Do not invent UI findings for this game.

Both store pages report no user reviews. Review API requests returned non-JSON responses; no review claims are used. Community screenshot galleries were checked separately; availability is recorded in the log. Capsules are promotional artwork, not evidence of in-game model geometry. API metadata and six full-resolution screenshots per game were downloaded to /tmp/liftco-v5-references for inspection, not for shipping.

Initial direction, not accepted: snow-laden, irregular alpine firs; friendly padded winter figures with dark goggles and small boots; cold slate interface surfaces, snow-white text, glacier-blue selection and warm amber primary actions. Keep existing layout locations and UI scale options. No additional animated vegetation, textures or runtime geometry regeneration.

# Log

## 2026-10-29

- Research: inspected appdetails and twelve full-resolution Steam screenshots. Extracted tree, character and UI observations above before modeling. Neither game has published user reviews on its store page.
- Recovery: localhost had been serving a temporary published checkpoint because the development copy lacked 13 scripts, including two station-flow modules unavailable on the VPS. Restored that same working published baseline into the permanent repository. Preserved differing incomplete development sources in ignored archive/pre-v5-incomplete-source. docs/v5-recovery.json records restored files. This is baseline recovery, not a lift redesign. The recent station-flow increment remains unavailable and is not represented as completed V5 work.
- Research follow-up: both community screenshot galleries returned HTTP 200 but no additional attributable close model studies were established. Header capsules were inspected as promotional art only. Reference imagery is not bundled into the game.

- Trees: added tools/build-v5-trees.py, regenerated assets/generated/tree-pack.js and added optional vertex colors to empty-map.html asset loading. Six deterministic irregular firs use dark branch undersides, inset snow shelves and exposed tapered trunks. Existing transforms, placement RNG, six instance buckets and scenery editing hooks are unchanged. No tree texture or per-frame updates. Browser acceptance pending.
- Tree budget: 212 triangles per prototype (1,272 total), below the original six-prototype total of 1,324. Six draw buckets retained. Decoded positions, indices, colors, ground origins, height=1 and upward snow normals checked.

- Characters: src/resort/guest-model.js replaces appearance at the existing makeSkier attachment point in empty-map.html. Original torso/head/upperBody/arm/elbow/leg/seat anchors and all movement code retained. Shared padded jacket with collar, zipper and pockets; integrated dark goggle band, amber lens, four skin palettes, fuller sleeves and rounded seated trouser legs. Details merge into existing meshes, adding no draw calls. Geometry cached per Three instance. Boots and ski contacts remain unchanged. Visual and frame-rate acceptance pending.
- Character verification: focused isolated Node/Three construction of 120 actual makeSkier instances passed finite geometry, color attribute counts, original upper-body offset, two animated leg chains, six seated-leg children and head parenting. All guests share the jacket prototype. No repository test suite added or run.


### Research correction after user feedback

- Paused model/UI work. Previous checked tree/skier items meant implementation existed, not that their style matched. Reopened both for visual revision; CPU geometry checks are not aesthetic acceptance.
- Researched the official Ski-E-O press gallery (23 files), all Steam images (8 Ski-E-O, 21 Pinebrook), both official trailers and sampled two player recordings. 52 image files include repeated compositions. Sources, timestamps, inspection method and hashes are in docs/v5-reference-sources.json; findings/constraints in docs/v5-research.md; comparison board in docs/v5-reference-board.html. Original media and sampled frames preserved in ignored archive/v5-reference-study.
- Corrected the first pass: Pinebrook UI is visible in later screenshots and player footage and uses light rounded windows; its people are angular, unlike Ski-E-O's padded rounded characters. A slate reskin is not a common reference style. Recommended targets remain proposals for the next pass.
- Compared front/back/seated clothing views, cabin and ground tree views, catalogs/inspectors and normal tool states. Excluded a Ski-E-O trailer intro from independent gameplay evidence, a Pinebrook unrelated outro, and black/blurred trailer frames from shape analysis. No source topology, exact font identity or measured body proportions claimed.
- Research-only revision. No game models, engine code, simulation, save schema, station designs, UI hooks or live game files changed in this pass. Browser visual/performance acceptance remains pending.
- Research artifact verification: all board anchors/local resources resolve, source media hashes match the register, reference board and a full-resolution image return HTTP 200 from the current local server, and git diff --check passes. This verifies artifact integrity only; no browser rendering or game acceptance is implied.
