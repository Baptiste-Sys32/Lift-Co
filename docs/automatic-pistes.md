# Automatic piste atelier

The local Upper Snowfields sandbox now creates new pistes from intent. Existing manual pistes retain their point editor.

## Player flow

1. Open Pistes and choose Create a piste.
2. Click a departure and an arrival on the mountain, or choose explicit connections from the selector. Use the higher and lower station rings for a complete lift outing.
3. Choose green, blue, red or black. Blue is the default.
4. Review the snow corridor and shaped ground. Optionally add up to 12 ordered passage points, drag their handles, remove them, or swap the ends.
5. Build piste to apply the shared construction transaction. Cancel restores the committed mountain. Local and session Undo/Redo preserve both intent and geometry.

A free snow endpoint is deliberately disconnected. Proximity to a lift does not create a guest transfer. The groomed snow and boundary poles continue to the actual start and finish. Protected station foundations are crossed on skis using slow push edges. Only the downhill core is used for difficulty and runs served.

## Generator and terrain

`src/resort/piste-planner.js` searches a bounded heightfield using terrain gradient, cross-slope, distance, bends and uphill penalties. Grid search uses multiple headings, then relaxes corners and samples a smooth curve through mandatory passages. The elevation profile must descend within the selected difficulty and within 5 m of existing ground.

Game profiles are green 8 degrees / 18 m width, blue 16 degrees / 15 m, red 25 degrees / 12 m, black 42 degrees / 10 m. These are game rules, not official piste classifications. The measured finished ground still controls guest ability. A generated piste exceeding its requested maximum cannot be applied while open, even if its sign says otherwise.

A feature-owned `piste-corridor` terrain layer flattens across the carriage width and blends into banks. Each heightfield cell uses its nearest corridor segment, preventing cumulative overlapping brush stamps at bends. Cut/fill is limited to 5 m per cell relative to ground before that layer. Lift structures and village footprints are protected. Search avoids buildings, roads and terminal turning areas, with room for earthwork banks. Existing lift clearance validation runs against the preview terrain before Apply.

The generator can fail conservatively. It explains whether the endpoints rise, no corridor was found, obstacles block the smoothed route, or moderate earthworks cannot fit. Checkpoints and endpoints remain available after a failed proposal. No terrain-limit exception is silently enabled.

The explicit sandbox test toggle retains the previous quick-test behavior: direct intent curve, unrestricted terrain and guest ability. Infrastructure conflicts and lift clearance remain validated.

## Lift changes and persistence

Moving stations, changing pylons, or adding a lift near an existing generated route marks affected generated pistes for review. A replacement proposal is opened in pending construction. The player validates its geometry and earthworks before keeping it. Cancelling an independently committed lift change leaves affected runs closed until reviewed; it does not restore the old lift.

Version 3 is retained. Generated piste records add optional `autoPiste` intent (endpoints with connection IDs, target colour on the piste, ordered guides and proposal status), while keeping regular points and explicit connections for simulation. The owner terrain layer stores its sampled elevation profile and protected footprints. Migration, snapshots and history already copy these optional records. Save backup and write failure guards remain in the shared commit path.

## Verification and limits

Focused temporary Node scenarios cover green/blue corridors, a gentle detour on a steep face, mandatory passages, obstacle avoidance, uphill rejection, cross-slope shaping, protected cells, cut/fill limits, optional V1/V2/V3 records and history. Isolated DOM scenarios cover selecting endpoints and difficulty, Apply, save, Undo/Redo, edit/Cancel, passage dragging with Three.js raycasting, local history, storage failure handling, terrain reload and a network outing with walking, lift, suitable piste and return home. Upper Snowfields heightfield probes exercise accepted and rejected mountain routes.

No repository test suite was added or run. A real browser and tablet visual/device review remains necessary: browser control was unavailable in this session. Search is bounded and synchronous; difficult or heavily built-up maps can take longer. The planner is a conservative first route proposal, not a guarantee that every pair supports every difficulty. It does not create a complete piste network, grade arbitrary cliffs into green runs, or automatically apply regenerated geometry.

## Slope presentation and nature

Pistes now use the mountain mesh itself. No white ribbon or station footpath mesh is drawn over the snow. A per-vertex grooming mask feeds the existing snow material: slightly packed snow, softer bump detail and fine corduroy that fades with distance. The irregular feathered edge blends into the surrounding snow. Boundary poles continue along the full route, stopping where their posts would enter terminal structures. The source route remains complete while the network rates only its downhill core. Short station approaches use explicit `push` edges, keep equipment on the skier's feet and follow the boarding surface without counting as descents.

New and existing pistes receive deterministic edge scenery by default. Automatic settings are open snowfield, sparse trees, natural groves or woodland edges. Try another arrangement changes a saved seed. Plant trees and Add rocks place optional owned groves beside the selected run. Planting does not recalculate the piste or modify its terrain layer. Seed, density and manual grove identities live in an optional `nature` record on the piste and participate in the same save, Cancel and Undo/Redo transaction.

Scenery leaves the piste, footpaths, roads, terminal pads, lift structures and cable corridors clear. Trees become sparse near 650 m and are excluded above 920 m; snowy rocks remain available. The renderer borrows the six existing tree prototypes and instances the results, with an overall cap of 900 candidate trees and 400 rocks. Tree visibility respects the graphics vegetation density. Piste scenery uses at most eight additional instanced draws (six tree variants, rocks and snowcaps), and repeated unchanged rebuilds reuse the current instances. Deleting a piste removes only its owned decoration.

World name boards, lift branding text, piste boards and stop signposts are removed from the local sandbox presentation. Names, difficulty controls and construction handles remain in the interface. Lift factories retain their default presentation for the original resort and separate study pages.

Focused isolated scenarios additionally cover deterministic nature, custom groves, obstacle exclusion, the tree line, draw-count bounds, quality density, deletion without disposing shared models, unchanged terrain under grooming, source endpoint coverage, push traversal across station earthworks, platform heights and exactly one run served per completed ski descent. DOM and Three.js raycast scenarios cover manual planting, save, Undo/Redo and unchanged ground after nature-only edits. Real-browser GPU appearance and tablet performance remain a device review; no browser was available during this session.

Skier terrain alignment, individual carving lines, articulated poses and turn powder are described in [Skier movement and pose](ski-motion.md).

Both station sides, multiple connected pistes and open-door passenger circulation are described in [Station sides and passenger circulation](station-access.md).

## Shared piste boundaries

Boundary posts use the combined footprint of all authored pistes. A post inside another piste is omitted; coincident outer edges retain the earlier piste's posts. An incoming run therefore loses its redundant rows in a shared section. Offset overlaps retain only the outer row on each side of the combined snow corridor, while crossings leave an opening and separated branches regain their own posts. Closing a piste keeps its physical boundary footprint; deleting or moving it recomputes the remaining boundary posts.

This is a visual union on the existing groomed terrain, without an additional snow sheet or changes to the individual piste identities, difficulty, endpoints or guest routes. A visual crossing does not create an implicit network junction. Existing saved pistes receive the corrected posts when loaded.
