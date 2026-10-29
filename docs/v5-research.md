# V5 visual research, second pass

Research date: 2026-10-29. This supersedes the first visual direction in v5-plan.md. No game code changed during this research pass. The existing V5 trees and clothes are prototypes awaiting revision, not accepted reference matches.

## Evidence and method

Canonical games remain Steam apps 4493130 and 4960910. The latter is **Pinebrook Ski Resort**, not the nickname Ski Slope Tycoon.

The local [source register](v5-reference-sources.json) records links, identities, sampled times and file hashes. A [local visual board](v5-reference-board.html) pairs selected views. Original study media is preserved in ignored archive/v5-reference-study, not temporary storage and not the shipped game assets.

Inspected 52 official image files: eight Ski-E-O store screenshots, 21 Pinebrook store screenshots and 23 Ski-E-O press-gallery images. Some press images repeat store compositions; these are not 52 independent scenes. Reviewed both official trailers through frame sampling, then selected closer timestamps. Also sampled two player recordings to distinguish normal gameplay from cinematic presentation. This was visual frame analysis, not uninterrupted viewing or playing either demo. No claims about animation quality, sound or usability timing follow from these samples.

| Source | Coverage used | Limits |
| --- | --- | --- |
| [Ski-E-O official press kit](https://www.skieogame.com/press) | Close characters, trees, multiple UI states; direct downloadable trailer | Promotional gallery, selected conditions |
| [Official Ski-E-O trailer](https://www.skieogame.com/press/trailer/SkiEO_Trailer_Demo_1080p.mp4) | 56.93 seconds; overview sampled every two seconds; closer studies around 00:26-00:30 and 00:40-00:42 | Crash sequence and cinematic cuts are not normal locomotion |
| [Nivarias player recording](https://www.youtube.com/watch?v=R-KCM3GTYDU) | 39:07 recording; 12 sample points from 00:30 to 38:20; gameplay examples at 03:00, 07:30, 10:00, 20:00, 25:00 and 35:00 | 00:30 is an inserted trailer; excluded as independent gameplay evidence. Sampled at 480p, so fine detail comes from official full-resolution stills |
| [Pinebrook store media](https://store.steampowered.com/app/4960910/Pinebrook_Ski_Resort/) | All 21 screenshots plus official Steam trailer, 123.47 seconds; overview every four seconds; closer cabin and world views | Screenshots include different languages and times of day |
| [Wee Hours Games player recording](https://www.youtube.com/watch?v=-ZlrXwfqBj8) | 21:46 recording; 13 sample points from 00:20 to 21:30; build drawer at 01:00, construction at 02:00, snowy village at 07:00, ski-level view at 13:00 | 21:30 switches to unrelated outro imagery and is excluded. Sampled at 480p |
| [Ski-E-O developer news](https://steamcommunity.com/app/4493130/allnews/) | Cross-check that contextual panels, a build dock and HUD scaling are deliberate systems | Text confirms intent, not exact visual design. No simulation features are imported into Lift Co |

Additional search found other Ski-E-O recordings and a Pinebrook YouTube trailer. They are discovery leads, not additional viewed evidence. Store pages currently list no full-game reviews. Player recordings and public discussions do exist; the initial lack of store reviews must not be described as a lack of player material. YouTube's web reader was throttled; media metadata and the two sampled player videos were retrieved separately. Neither demo was installed or reverse engineered.

## Characters: the references are different

### Ski-E-O: padded, rounded winter figures

Evidence: [front and back cafe view](https://www.skieogame.com/img/carousel/apres-patio-guests.jpg), [seated three-quarter view](https://www.skieogame.com/img/carousel/cabin-porch-dusk.jpg), [rear ski/board poses](https://www.skieogame.com/img/carousel/terrain-park-kicker.jpg), and Nivarias around 20:00 and 25:00.

Observed:

- Rounded heads and conspicuous hats with thick bands; some hats have pom-poms. Headwear is a substantial part of the silhouette.
- Broad shoulders, a thick jacket around the abdomen and rounded sleeve volumes. Several padded horizontal jacket sections are visible from behind.
- A high collar partially hides the neck. Goggles wrap across the upper face; the frame has a nose dip rather than a plain oval. Faces have little visible detail in these examples.
- Mittens, trouser legs and boot cuffs remain distinct even when seated. Strong contrasting clothing colors make guests readable in a crowd.
- Smooth shaded volumes create the softness. Extra tiny decorations are secondary to body and clothing shape.

Interpretation: the appeal comes from dressed character proportions, not adding goggles to an otherwise unchanged mannequin. Exact body ratios are not measured from a neutral model sheet; seated perspective must not be presented as anatomical measurements.

### Pinebrook: visibly angular and economical

Evidence: [queue close view, screenshot 2](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4960910/8a7e8fe7c32d8a2ed56567ff9ae820f74d46b634/ss_8a7e8fe7c32d8a2ed56567ff9ae820f74d46b634.1920x1080.jpg?t=1791811158), the local full-resolution file 4960910-2.jpg, and the first cabin shot around 00:02-00:04 of its Steam trailer.

Observed: box-like heads/headwear, flat torso faces, straight segmented limbs, broad single-color areas and simplified hands. Cabin seating establishes that this angularity is visible close up, not just a distant fallback. Colored torso, trousers and headwear separate people in long queues.

Interpretation: Pinebrook supplies crowd readability and restrained detailing; it does not corroborate Ski-E-O's rounded character style. Combining them indiscriminately would create a third style without a clear target.

**Recommendation for review:** use Ski-E-O as the primary character reference, because the user explicitly wants more finished close-up people and already dislikes box-shaped feet. Borrow Pinebrook's clear color blocking. This recommendation has not been applied as a finished model.

## Trees: silhouette, snow volume and variation

### Ski-E-O

Evidence: [lift-height foreground trees](https://www.skieogame.com/img/carousel/chairlift-ride-view.jpg), [ski-level larch traverse](https://www.skieogame.com/img/carousel/skier-traverse-larches.jpg), trailer 00:26-00:30 and 00:40-00:42.

Observed: long tapered fir crowns with many overlapping, downward-curving branch lobes. Snow is thick on upper branch surfaces, with dark green visible along the underside and tips. Snow-loaded crowns have broad soft edges, not thin white horizontal plates. The gallery also contains shorter bushier evergreens and sparse trunks, so there is no single universal fir silhouette. Golden deciduous trees form separate patches within the forest.

Interpretation: close trees need rounded snow thickness and continuous tapered silhouettes. Randomly rotating a few flat branch fans cannot produce the same visual weight. Broad forest masses and open snow corridors matter more from overview height than individual needle detail.

### Pinebrook

Evidence: [branch tiers, screenshot 3](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4960910/b4bf36ef77d79890b9de97e84f70339e9c0daf4c/ss_b4bf36ef77d79890b9de97e84f70339e9c0daf4c.1920x1080.jpg?t=1791811158) and [ground-level branches, screenshot 14](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4960910/b455b16912fbec5b5ecc5e2577a5327b6724c6c1/ss_b455b16912fbec5b5ecc5e2577a5327b6724c6c1.1920x1080.jpg?t=1791811158); trailer cabin window view at 00:04 and ski-level run around 01:00-01:08; player world view at 01:00 and 07:00.

Observed: angular flattened branch fans, conspicuous dark foliage edges, faceted snow coverage, and more open space between tiers. Exposed trunks are long on some trees. Leafless branching trees are part of the same forest, alongside small firs and shrubs. Weather/fog reduces distant contrast but does not remove the angular nearby silhouettes.

Interpretation: Pinebrook's tree construction is a useful low-cost geometry reference, but its flatness conflicts with Ski-E-O's softer snow-laden close trees. Terrain fog is presentation, not evidence that foliage geometry is detailed.

**Recommendation for review:** build original firs with a few substantial curved snow masses over visible dark branches, in narrow and bushy silhouettes. Preserve current placement and clearances. Evaluate the same prototype from ground, cabin and overview heights before cloning it into six variants. Deciduous species are a later optional dressing choice, not permission to change scenery density or terrain.

## UI: two separate design languages

### Ski-E-O's slate management tools

Evidence: [catalog](https://www.skieogame.com/img/carousel/gp_build-catalog.jpg), [lift panel](https://www.skieogame.com/img/carousel/gp_lift-management.jpg), [trail editing](https://www.skieogame.com/img/carousel/gp_trail-naming.jpg) and the player recording at 03:00 and 07:30.

Observed: a shallow top status strip; bottom-left icon-and-label tool buttons; floating contextual inspectors; a larger catalog with left categories, a regular tile grid and a right preview. Panels use muted blue-gray surfaces, fine pale edges and modest corners. Decorative heavy serif headings contrast with rounded sans-serif control labels. Pale blue indicates selection, green/red distinguish confirmation/cancellation, and warm color appears on selected primary actions.

Interpretation: this is a hierarchy of global tools, local properties and temporary catalogs. It is not just a dark sidebar. The trailer's large white display lettering is promotional text and must not become the control font. The website branding palette is also not automatically the in-game UI palette. Actual font family names are unverified.

### Pinebrook's light compact interface

Evidence: [resort dialog, screenshot 8](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4960910/f2eae7809e7c9b1a5c861359a9c9fa4b5426ab77/ss_f2eae7809e7c9b1a5c861359a9c9fa4b5426ab77.1920x1080.jpg?t=1791811158), [object inspector, screenshot 10](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4960910/aa8f901bd9112d6d4dac78502002aeae7652bc7d/ss_aa8f901bd9112d6d4dac78502002aeae7652bc7d.1920x1080.jpg?t=1791811158), trailer around 00:12-00:20 and 01:20-01:32, and Wee Hours Games around 01:00 and 02:00.

Observed: a narrow pale bottom toolbar with a central circular tools button; white rounded floating windows; gray inset statistic groups; pale blue tab selection. Headings and large values use condensed dark type; smaller labels have a narrow, spaced appearance. Build categories appear in a horizontal drawer. Small inspectors use aligned label/value rows rather than descriptive cards.

Interpretation: this is a credible primary reference for Lift Co's requested compact controls. The earlier claim that Pinebrook's UI could not be established was a limitation of inspecting only its first six screenshots, not of the available evidence. Exact typefaces and hover/focus behavior remain unverified.

**Recommendation for review:** start with Pinebrook's light surfaces, compact grouping and low visual obstruction. Use Ski-E-O's clear icon-plus-label tools and status-first inspector hierarchy. Keep current UI IDs/hooks and layout ownership; a bottom-dock reorganization would be a separate behavior/layout decision. Do not add finances, decorative dashboards, tiny controls or verbose status prose merely because the references contain them. Every essential action retains a visible button and adequate hit area.

## What changes in the V5 implementation plan

Prototype descriptions below come from source geometry construction, not a rendered side-by-side review. They are specific revision hypotheses to check visually.

| Current prototype or assumption | Research finding | Next implementation target |
| --- | --- | --- |
| Five tiers of sparse triangular branch fans | Ski-E-O reads as overlapping curved snow volumes; Pinebrook is flatter | Rework snow mass and taper first, compare one tree in three views, then derive variants |
| Thin oval jacket and small fitted helmet | Ski-E-O's silhouette is broad and padded with substantial headwear | Make clothing volume and headwear coherent while preserving driven joint origins |
| Oval lens and narrow trim details | Reference goggles have a shaped frame; silhouette dominates tiny trim | Shape the visible goggle frame and cap/band before adding decoration |
| One assumed slate palette for both games | Pinebrook is light; Ski-E-O is blue-gray | Separate reference studies; light compact UI is the recommended starting point |
| Passing geometry checks treated as progress toward matching | Checks prove construction, not visual similarity | Keep prototypes unaccepted until actual rendered comparison |

## Constraints and acceptance for the next pass

1. Do not move lift/station geometry, guest joints, seat anchors or contact points to force a reference proportion. Change visible clothing and headwear around existing anchors. Verify walking, skiing and seated silhouettes separately.
2. Preserve scenery instance buckets, stored variant indices, normalized origins/heights, hide/restore and dirty-region updates. No added shadow-casting tree instances or per-frame vegetation animation by default.
3. The first tree prototype's triangle total is a useful baseline, not proof of equivalent GPU cost. Record visible draw calls, triangles, material count and laptop frame timing after real rendering. Reference games' hardware claims do not establish Lift Co performance.
4. Render front, side and back guest views plus a seated pose, a ground-level tree view, a lift-height view and an overview. Match volumes and readability, not just colors. Use current day/night lighting without changing lighting to disguise model problems.
5. Compare UI with an existing V4 resort at normal and compact UI scales. Preserve all buttons, IDs, keyboard hooks, focus states, save schema and routing. No interface reskin has been made in this research pass.
6. Browser/WebGL acceptance remains pending because no browser surface is available to this session. Offline model validation cannot stand in for those images, an empty error overlay, real V4 play-through or actual frame rate.

Unresolved: exact source mesh topology, material construction, font identities and calibrated character dimensions. These are not needed to produce original assets, but they must not be represented as researched facts. A closer reference match may require more geometry near the camera; any performance tradeoff must be recorded and tested rather than hidden.
