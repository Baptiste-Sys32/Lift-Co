# Goal

V5 is an aesthetic checkpoint: original snow-covered trees, finished stylized guests and a compact resort interface inspired by the two Steam references. Preserve all lift/station designs, simulation, routing, V4 save schema, UI IDs/hooks, rig anchors, scenery placement and hide/restore/dirty-region behavior. No VPS deployment in this checkpoint without a request.

# Plan

- [x] Initial source identification.
- [x] Deeper visual research: official press gallery, both trailers, player footage, multiple camera angles and documented uncertainty. See [research revision 2](v5-research.md) and [reference board](v5-reference-board.html).
- [x] Recover a permanent working baseline and preserve incomplete station-flow sources separately.
- [x] Tree study 01: revise only fir variant 1; preserve the other five; provide before/after and three camera viewpoints. Browser acceptance remains pending.
- [ ] Trees: revise the first prototype against research revision 2; validate ground, cabin and overview silhouettes before deriving six accepted variants.
- [x] Skier study 01: one padded clothing prototype on the existing rig, with before/after and standing/walking/skiing/seated comparisons. Browser acceptance remains pending.
- [x] Skier variations: four coordinated helmet/beanie outfits, three subtle coat cuts and a lineup preview. Browser acceptance remains pending.
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


### Tree study 01, one workstream

- User requested a backup, then one small change at a time with commit and push. Verified a source/assets archive (323 files), complete Git bundle at 8bb2464 and the latest exported V4 save (22 October). Additionally archived the exact served localhost checkpoint (320 files). Backups are outside the repository; ignored archive/v5-latest-backup.json records the private location. Current browser-only progress could not be accessed and is not claimed backed up.
- Revised only variant 1 (stored index 0) in tools/build-v5-trees.py and assets/generated/tree-pack.js. Eight overlapping tiers use closed dark branch hulls, inset rounded snow lobes and smooth area-weighted normals. Preserved normalized ground origin/height, six stable variant indices, one material and six instance buckets. The five other variants are byte-for-byte equivalent as decoded records. All horizontal/radial bounds remain within the prior variant envelope.
- Added designs/fir-study.html, src/styles/fir-study.css, generated before/after study data and an explicitly labeled offline geometry comparison. tools/render-fir-study.py reproduces the image. Three camera buttons and orbit controls support inspection without opening a save. Only the tree cache query changes in empty-map.html. No lift/station, character, UI-control, network, terrain or save code changed.
- Cost: revised tree 452 triangles versus 212 before; six-prototype sum 1,512 versus 1,272. Draw calls/material count unchanged, but the increased triangle cost is recorded and real laptop timing is pending. No performance equivalence is claimed.
- Verified reproducible bake; finite/unit normals; valid indices and color counts; normalized bounds; previous radial/axis envelope; five unchanged variants; actual Three instancing, shared material and matrix hide/restore. JS/Python syntax and diff checks pass; isolated study resources return HTTP 200. Inspected offline ground/lift/overview comparisons; browser/WebGL/error-overlay, V4 play and frame-rate acceptance remain pending. No repository test suite added or run.
- Served the isolated study alongside the unchanged current localhost game. This commit is the first tree study, not acceptance of all trees or V5. No VPS deployment. Push includes the four existing local V5 commits plus this single-tree commit through a normal fast-forward.

### Skier study 01, one workstream

- User moved from the fir study to skier models. Kept the fir work unchanged and revised one shared clothing prototype in src/resort/guest-model.js: rounded jacket baffles across front/back, thicker sleeves and mittens, padded trousers, a higher collar, a banded beanie/pom and a shaped wraparound goggle frame. Retained four existing skin palettes. Details remain merged into existing meshes and cached per Three instance/color. No downloaded character assets.
- Preserved all driven joint origins/parents, ski and boot contacts, seated offsets, simulation fields and routing. Only the guest-model cache query changes in empty-map.html. Headwear now reaches 2.325 m versus roughly 2.233 m before; live cabin/roof clearance must be reviewed. No claim that every cabin has been visually accepted.
- Added designs/skier-study.html with Before/New, Stand/Walk/Ski/Sit, Front/Side/Back/Three-quarter and animation controls. The generated study rig comes from the actual makeSkier source, with a fixed personality seed for fair comparisons. Walking/skiing use the existing animation modules. The study never reads or writes resort saves. The seated support is a study prop, not a changed lift/station.
- tools/build-skier-study.py, tools/export-skier-study.mjs and tools/render-skier-study.py reproduce the rig snapshot and labeled offline geometry contact sheet. First software render exposed a collar gap; corrected the collar. Replaced small trim tubes with ribbons to reduce geometry without changing the clothing silhouette.
- Visible resource counts before/after: stand 13 meshes, 2,122/2,876 triangles; walk 19 meshes, 2,330/3,084; ski 21 meshes, 2,418/3,172; sit 15 meshes, 2,194/2,964. Full-rig mesh/material counts remain 31/9. This is extra geometry, not a measured performance improvement. Laptop frame timing remains pending.
- Focused isolated Three checks: 120 guests have finite geometry, matching color counts, one shared jacket/hat for a shared outfit and four cached face palettes. All four poses preserve the same driven transforms over 240 frames each before/after; boot/contact geometry is identical. JS/Python syntax, local HTTP dependencies and diff checks pass. No repository test suite added or run.
- Browser inventory is empty, so WebGL appearance, empty in-game error overlay, V4 play-through and live seat/roof clearance remain unverified. The local server had stopped; restarted the permanent repository at the same 127.0.0.1:8783 origin so the study and current source are available without changing browser save origin. VPS untouched. Commit and push this skier work separately from trees/UI.

### Skier fit correction

- User reported hat/goggle and shoe/trouser clipping. In src/resort/guest-model.js, reshaped the front brim upward/inward around the frame and made headwear a cosmetic child of the driven head, preserving its initial world placement. Hat and goggles now turn together; driven head/limb/seat origins stay unchanged.
- Slimmed and shortened only the boot shaft above the instep, widened/raised the animated trouser hem and aligned the seated visible shin/cuff with the boot shaft. Sole, toe/contact vertices and all animation joint transforms remain unchanged. Boot-shaft geometry changes are intentional; the earlier whole-boot identity claim applies to the initial study, not this fit correction.
- Updated the study Before model to the preceding skier revision so the comparison isolates this fix. Added Face and Boots cameras and refreshed the offline image. Updated model cache tags in the game/study. No tree, lift, station, routing, simulation or save changes.
- Focused geometry checks: frame-edge/hat intersections fall from 34 to zero at neutral; zero across five tested head turns. The upper cuff samples remain inside trouser side planes over 90 frames each of standing, walking, skiing and sitting. Four poses over 240 frames each retain identical driven transforms. Thirty constructed models have finite geometry. Unchanged visible mesh/triangle counts: 13/2,876 stand, 19/3,084 walk, 21/3,172 ski and 15/2,964 sit.
- Re-rendered and inspected the offline before/after sheet. Script syntax, HTTP resource and diff checks pass. This is targeted fit verification, not proof of every extreme pose or live WebGL acceptance. Browser/device review remains pending; no repository test suite added or run. Commit/push only this skier fit correction. VPS untouched.

### Seated height and pole pose correction

- User reported sitting too low and inward poles intersecting legs/skis. Added a 0.15 m cosmetic seated-body lift, applied through the existing boarding/unloading pose blend to the upper body and seated leg group. Lift seat anchors, guest root placement, carrier models, queues and seat ownership remain unchanged. Seated ski height/spacing now follow the raised boot soles instead of crossing the feet.
- In src/resort/ski-motion.js, shifted pole geometry so its origin is the hand grip, spread ski arms outward and countered body-roll tilt in the pole splay. In src/resort/guest-animation.js, walking poles also angle outwards while carried-ski arm alignment is retained. No movement speed, route choice or lift timing changes.
- Updated the study's seated pose, cache tags, notes and offline comparison. Earlier clothing remains the Before model, with the same current animation used for both versions. No additional meshes, triangles or materials.
- Focused checks use the actual updateSkierEquipment function: seated thigh undersides meet the study seat top, seated ski tops meet the boot soles, and boarding/unloading blend and walking reset restore the expected offsets. Sampled 640 ski poses across lean, braking, skating and phase: grip endpoints coincide with hands, no inward-pointing shaft, no sampled leg-capsule hit and no crossing within the ski-height/width bounds. Script syntax, HTTP dependencies and diff checks pass. No repository test suite added or run.
- Offline images inspected; live WebGL, every lift-cabin clearance and device frame rate remain pending. Commit/push this visual pose correction only. VPS untouched.


### Four coordinated skier variations

- User approved adding variety on the corrected base. Added Spruce (teal/slate, ivory helmet), Ember (rust/charcoal, navy pom beanie), Alpine (blue/navy, dark helmet) and Berry (plum/stone, cream plain beanie). Three coat cuts vary width/depth by at most 3.5% below the collar; face fit, sleeves, trouser cuffs, boots and joint origins retain the corrected base. Helmet ear pads, shell and trim merge into the existing headwear mesh.
- All choices are original code-native geometry/colors. Outfit/face selection hashes the guest's existing initial ticket and caches that appearance on the runtime guest; no explicit random selection calls, new route choices or saved fields. Queue-ticket changes do not recolor a person. Existing shirt/sleeve and trouser materials receive coordinated colors. No tree, UI skin, lift/station, simulation or save-schema changes.
- Updated designs/skier-study.html with individual outfit selectors and an All four toggle. The lineup shares the walking/skiing/seated poses and gives each seated guest a study support. Framing adjusts for narrow/tablet/desktop aspect ratios; hidden models do not animate. Earlier accepted clothing remains the Before comparison. Added the generated outfit contact sheet and updated its rig/export/render tools.
- Focused isolated checks cover all four looks across standing, walking, skiing and seated animation: driven transforms and boot geometry match the prior base. Each style passes five tested hat/goggle head-turn clearances. A 120-guest sample produces all four outfits, three cached coat geometries, four headwear geometries and four face palettes; every rig retains 31 meshes and nine materials. Appearance remains stable after ticket changes and reapplication. Seat/pole geometry checks still pass.
- Visible ski triangle counts: Spruce/Alpine 3,236; Ember 3,172; Berry 3,092, versus the prior 3,172. Helmets add 64 triangles, the plain beanie removes 80; no extra meshes/materials or new textures. No measured FPS claim. Inspected offline standing/skiing/seated outfit sheet; actual WebGL/device acceptance remains pending because browser inventory is empty.
- Modified JS/Python syntax, source regeneration, local HTTP resource availability, lineup framing bounds and diff checks pass. Game entrypoint changes only the guest-model cache query. No repository test suite added or run. Commit/push this outfit work separately; VPS untouched.
