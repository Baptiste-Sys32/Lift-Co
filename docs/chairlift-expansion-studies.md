# Chairlifts and the Palace8 gondola

Reference and design pass, 18 October 2026. The user chose **HTML design studies first**. These pages do not register game types or change the version-2 resort document. Carrier proportions are interpretations of photographs; dimensions, station massing and pylon geometry are estimates rather than manufacturer drawings.

## Carrier selection — locked in

The user selected **B for all four carriers** on 18 October 2026:

- Arcabulle: **B / Full shoulders**.
- Alps n°5: **B / Round crown**.
- Panoramabahn: **B / Deep bubble**.
- Princesse / Palace8: **B / Broad waist**.

The pages now display only the selected B carriers, preserving their selected frame/body geometry and proportions. The later user request changes only the Alps running gear to a simple fixed cable clamp. `approvedVariant` records the selection per family. Earlier A/C definitions are retained in source, and the complete pre-selection studies are backed up in `archive/backups/next-lift-carrier-selection-20261018/`. **The terminal shells for 01, 03 and 04 are retained following user approval. Revised machinery, the new 02 structures and the special intermediate stations remain under review.** This selection does not integrate the lifts into the game.

## Scope agreed with the user

Four additional build choices are intended after design selection:

| Proposed stable ID | Intended dropdown choice | Layout capability |
| --- | --- | --- |
| `chair-arcabulle` | 6-seat detachable bubble chairlift — Arcabulle | Conventional two-terminal straight line |
| `chair-alps5` | 2-seat fixed-grip chairlift — Alps-inspired | Conventional two-terminal straight line |
| `chair-panoramabahn` | 4-seat detachable bubble chairlift — turning station | Two alignments joined by a passenger-free angle station |
| `gondola-princesse8` | 8-person detachable gondola — passenger mid-station | Two alignments joined by an intermediate passenger station |

These IDs are proposals, not enabled catalog entries. **The turning chairlift and the mid-station gondola are dedicated dropdown options. Do not give every existing lift an optional turn or mid-station.** Shared internal helpers may still be reused. Preserve existing IDs, approved models and saved lines.

## Game interpretation of 02 — explicit user override

The user explicitly wants the game's old, inexpensive **fixed-grip double**, despite the real Alps n°5 reference being detachable. The study is now labelled fixed-grip, with a **1.8 m/s** game line speed, one speed in terminals and on the line, a simple cable clamp and no tyre conveyor. Its B chair frame/bench is retained. This is a deliberate fictional adaptation, not a claim about the real Ansaku installation. Future integration must use fixed-grip operation rather than the report's 4 m/s detachable operating data.

## Reference findings

### Arcabulle — Poma

The report describes a 2006 six-seat detachable bubble chairlift: LPA6C Coque vehicles, Multix terminals and a 5 m/s nominal line speed. Its 7.2-second headway corresponds to 36 m at that speed. The photographs show a white swept outer hoop, six dark individual cushions, a wide transparent bubble with a white lower apron, and safety-bar ski rests. The report places the drive at the summit and tensioning at the valley. The chair alternatives vary the hoop, bubble depth, crown and seat-back proportions; paint alone is not a variant.

[Original report and photographs](https://www.remontees-mecaniques.net/bdd/reportage-tsd6b-arcabulle-poma-413.html).

### Alps n°5 — Ansaku

The report identifies a 1991 **two-seat detachable**, rather than a slow fixed-grip double. It specifies 4 m/s, 24 m spacing, six-second headway and 1,200 passengers/hour. The photographs show a narrow galvanized frame, simple red bench/back slats and a safety bar **without ski rests**. Valley machinery sits in a building shared with another lift; the upper station is an enclosed hydraulic return-tension terminal. The isolated station study uses that upper building as its reference, rather than inventing a second functioning lift in the shared valley hall.

[Original report and photographs](https://www.remontees-mecaniques.net/bdd/reportage-tsd2-alps-n-5-ansaku-8596.html).

### Panoramabahn — Leitner

This is the historical 2004 installation photographed in the report; the page lists its end of service in 2019. It has four-seat bubble chairs, green cushions, 5 m/s travel and an intermediate station that **turns the line without boarding or unloading**. The photographs show an elevated, open structure supporting the deflection and transfer equipment. It must not become a guest-network station. This study does not assign an exact historical turn angle: the adjustable diagram explores the concept. Detailed rope deflection, release, slow transfer and reattachment need a dedicated runtime prototype before game integration.

[Original report and photographs](https://www.remontees-mecaniques.net/bdd/reportage-tsd4b-panoramabahn-leitner-1396.html).

### Princesse — Poma / Sigma Palace8

The 2002 gondola uses eight-seat Sigma Palace8 cabins with OmegaT grips and 6 m/s line speed. Its three timber-clad stations include an angled passenger mid-station. Guests can board or alight there in either direction, and through passengers can remain aboard. The report states that the two sections cannot operate independently. It describes two drive assemblies at the summit, so a visually continuous carrier journey must not be mistaken for proof of a single simple rope circuit. The Palace8 is a **new eight-seat model**; the game's existing four-person Princesse-inspired skins remain separate and unchanged.

[Original report and photographs](https://www.remontees-mecaniques.net/bdd/reportage-tcd8-de-la-princesse-poma-4832.html).

## Playable inspection pages

| Study | A | B | C |
| --- | --- | --- | --- |
| [Arcabulle](../designs/chair-arcabulle.html) | Reference hoop | **Full shoulders — selected** | Low visor |
| [Alps n°5](../designs/chair-alps5.html) | Slender original | **Round crown — selected** | Square shoulders |
| [Panoramabahn](../designs/chair-panoramabahn.html) | Green quartet | **Deep bubble — selected** | Compact crown |
| [Princesse / Palace8](../designs/gondola-princesse8.html) | Palace facets | **Broad waist — selected** | Tall lantern |

The original studies offered three carrier alternatives and comparison views. After selection, each page opens directly on the locked B carrier, with camera presets, look-in-place right drag, opening animation, optional seated occupants, glazing and paint controls, and an enlarged reference-photo gallery. Station and pylon tabs contain adapted concepts awaiting approval. The two special layouts also offer an end-terminal view. Station roofs can be hidden. The line plan shows passenger access separately from the carrier route. Its moving dot represents a journey in either direction, not a mechanical simulation or actual boarding.

Bubble-chair opening currently moves the bubble and safety bar together for inspection. It does not specify their eventual automatic timing. Palace8 has eight seat positions and two independently translated door leaves. Continuous capacity, passenger flow, ski loading and camera reservations remain integration work.

The carrier factories and viewer are new standalone sources (`next-lift-studies.js` and `next-lift-study-viewer.js`). They do not load the resort runtime. Geometry primitives are shared, pixel ratio is capped at 1.4, and one 1024-pixel shadow map is used. Reference photographs are copied unmodified; per-image URLs and credits are recorded in `assets/references/next-lifts/<family>/sources.json`. No redistribution license is asserted.

## Current station, pylon and machinery revision

The accepted terminal shells for **01 / Arcabulle, 03 / Panoramabahn and 04 / Princesse** are retained. Their detailed interior machinery is shared by the study factory; the plain tyre cylinders and simple spoked return wheels are superseded.

- **02 / fixed-grip double:** reuses the existing compact **Classic station** canopy, green frame, inclined supports and service walk. Its study replaces the primitive drive with a detailed fixed-grip bullwheel and motor, without detachment or pneumatic conveyors. The pylon has a dark period mast, compact T-shaped triangular head, narrow access planks, simple hoops, a number plate and four sheaves per lane. It does not reuse the large modern portal.
- **03 / intermediate turn:** an **open elevated transfer structure** on concrete piers, based on the report photographs. Narrow white/green machinery covers sit over the entrance and departure banks; most of the structure and service grating remain open. There are no passenger platforms or boarding points. Separate internal haul-deflection wheels and their tangent cable arcs sit inside the carrier rails. The end terminal still uses the accepted housing.
- **04 / pylon:** follows the game's gondola tower arrangement in `empty-map.html`: full grated maintenance platform, deep trapezoidal girders, head ladder, crown lamps and six-sheave trains, using the shared fixed-foot mast.
- **04 / passenger mid-station:** one continuous curved through shell, rather than two shortened terminal shells with an added centre joint. The approved housing geometry, glazing, roof ribs, underside slots and supports are mapped onto the shared centreline. Both ends have open carrier portals. Passenger platforms follow the curve; an overhead service walk gives access to supported conveyor modules and internal deflection pulleys. The end terminal shell is retained.

Pylon sheaves now have separate cast rims, perforated webs, rubber running grooves, bolted hubs and axle caps. Inboard bearing and rocker frames stay clear of the wheel envelope. Station tyres have rounded pneumatic profiles, pressed rims, tread grooves and small drive pulleys/belts. The running rails sit under the grip's running wheels; the overhead tyre bottoms meet its upper friction pad. Supported longitudinal I-sections and hangers connect the tyre modules to the main structure. Return/drive bullwheels have grooved rubber linings, perforated webs, bolted hubs, bearing stacks and brake calipers. Finned motors, guarded couplings and inspection covers replace plain motor blocks.

These are **static inspection models**, not a finished detachable-transfer or multi-station operating runtime. Wheel dimensions, the internal pulley arrangement, the 35° turn and the 15° mid-station deflection remain visual estimates. Carrier transfer timing, the complete incoming/outgoing rope circuits, synchronized drives and passenger operation still require integration. The photos establish architectural/mechanical character, not surveyed dimensions or a complete rope-routing drawing.

`next-lift-machinery.js` supplies the reusable detailed geometry. Static machinery is merged by material to control draw calls; cutaway roofs and carrier previews remain separate. More original machinery/turn photographs are included in the galleries, with URLs/credits in the per-family `sources.json`. Original sources are preserved in `archive/backups/next-lift-mechanical-detail-20261018/`. The `ClassicStation` factory's new optional arguments default to its original two terminals and drive assembly, preserving current game callers. No game catalog entries or save fields are added in this pass.

## Integration order after model selection

1. Integrate Arcabulle as a detachable bubble chair and 02 as the explicitly requested fixed-grip double first. Generalize the current hard-coded six-chair and four-cabin seat assumptions where needed, using actual seat anchors and each model's catalog speed. Keep Arcabulle’s detachable station speed distinct from line speed; 02 must use the same fixed-grip speed throughout. Verify safety bar, bubble, boarding window, seats and clearance together.
2. Prototype the Panoramabahn angle station with visible cable and carrier paths. Two straight spans need a real station transition, not an unsupported bend at a pylon. Preserve carrier identity, spacing and occupied seats during transfer. No pedestrian snap target or queue at the bend.
3. Extend only the dedicated Princesse8 type to three passenger stations. Support valley–mid, mid–summit and through journeys in both directions, intermediate queues and alighting, seats that remain occupied through the station, coupled stopping and operations, and terrain/foundation validation at all three stations.
4. Integrate construction, edit/cancel/undo, delete/restore, persistence and network return checks for each dedicated layout. The existing builder and guest adapter assume base/top and one straight alignment; registering a catalog entry alone is insufficient. Any optional fields must preserve version 2 and the original migration/backup gates.

Physical garages remain deferred. The source photographs may show them; they are not part of these additions.

## Verification

All five changed/new JavaScript sources pass `node --check`. Temporary isolated-Chrome inspection loaded all four pages with empty error overlays and no runtime exceptions. The approved B carrier bodies compare unchanged against the backup; 02 deliberately substitutes a fixed clamp. Capacities remain 6/2/4/8. 02 displays 1.8 m/s, fixed-grip plan text and zero conveyor tyres. End/intermediate role switching was exercised for both special layouts. All 21 reference image files were checked, and local page dependencies resolve.

A temporary geometric probe sampled **4,992 rays** through all four pylons’ sheave envelopes against their head steelwork, with **zero hits**. The inboard frame has 0.18 m axial clearance from the revised hub/cap envelope. Rope-to-rubber-tread contact matches the displayed cable height. The Classic factory's default two-terminal output has identical vertex/index buffers and world transforms to the pre-change factory, so its optional study arguments do not change existing game callers.

The compact open turn was checked separately after shortening its preview; its internal cable arcs remain tangent to the deflection pulleys. Carrier, station, open-turn, pylon and machinery-detail screenshots were reviewed. No automated test suite was introduced or run. This is not a laptop FPS benchmark or proof of a finished operating lift: these remain isolated design studies, with construction, routing and operation still to integrate.
