# Village milestone verification

2026-10-20. Focused scenarios ran in headless Chrome with an isolated temporary
profile on localhost. Existing browser profiles, resort slots and the VPS were
not used. No repository test suite was added or run.

| Check | Result |
| --- | --- |
| Syntax | Eight changed/new JavaScript modules and the inline game module passed Node syntax checks. |
| Legacy migration | V1, V2 and V3 catalog records retained lift definitions, operations, tilt and grouping. New collections defaulted empty and world dimensions remained 3600 by 3600 m. |
| New save reload | Two roads, two stops, one shuttle, accommodation, explicit walking connections and a lift loaded with an empty error overlay. |
| Session history | Full new records survived Undo/Redo. Occupied route removal was undone and redone. |
| Terrain ownership | Removing a stop removed its own layer while preserving road, other stop and route layers. Removing one synthetic earthwork retained another owner's height; an unrelated owner survived building placement and deletion in the installed game. |
| Real placement and handles | Mouse events placed a road, set both point heights and applied it. A real endpoint drag and excessive grade stayed editable, blocked Apply and cancelled to the committed road and ground. |
| Foundations and connections | A chalet was placed with a floor and supported foundation, and supplied six visible residents before a lift existed. An entrance path cutting through the home was rejected. |
| Road limits | 12% accepted, excess grade rejected, tight radius rejected, nearby disconnected roads had no path. A graded carriageway matched its desired plane across its full 6 m width within 0.000013 m in the isolated height-field check. |
| Outing eligibility | Unsuitable ability and missing return bus edges prevented departure. Suitable ability with a valid return produced an outing. |
| Complete journey | Six residents each completed two outings: footpath, bus, lift, piste, return bus and home. Exactly 12 new descents were served. |
| Vehicle sequencing | Observed speed at most 8.333334 m/s, zero moving/open-door frames, zero duplicate seat slots and zero vehicle centre samples outside road/terminal surfaces. Wheels tracked distance within 0.000001 m. Steering values remained finite. |
| Capacity | A 48-guest queue filled all 24 unique seat anchors, departed after 8.5 simulation seconds with doors closed and left 24 waiting. |
| Closure | All 24 occupied seats survived closing. Existing passengers unloaded; no new boarding occurred. |
| Occupied removal | Removing a route or stop returned its affected rider home with a notice. Cancel preserved the live route and its rider. Undo restored the route and stop IDs. |
| Home removal | Residents fell back to an existing legacy entrance, or retired when no entrance existed. |
| Shared population | Five hotels filled to 120 guests total, distributed 24 each, with at most one admission per simulation second. |
| Backup failure | A simulated quota failure disabled saving, kept construction pending and left the existing slot byte-for-byte unchanged. |
| Tablet layouts | 1024 by 768 and 768 by 1024 layouts had no horizontal overflow. Village controls remained within the sidebar; portrait actions wrapped and the panel scrolled. Screenshots were visually inspected. |
| Resource lifetime | Three consecutive edit/Cancel cycles ended at the same 1781 geometries and 20 textures, with an empty error overlay. |

The tablet captures reported 1320 geometries and 16 textures for their paused
fixture. Submitted frame geometry varied with the view, approximately 0.39 to
0.50 million triangles and 42 to 1545 draw calls, including the existing lift,
terrain, scenery and shadows. Lazy material/geometry submission and view changes
also affect these diagnostics. These are resource observations, not M1 iPad FPS
measurements. Actual device review remains required before raising map or
population limits.

The final local game loaded with an empty error overlay. The original
`index.html` remained byte-identical to its pre-milestone copy; its SHA-256 is
`5323a8d68078ad30f053b11945eb9adc035e784299c1e392c3ccdbd5aeb8f50e`.
Source files replaced during local installation were backed up before writing.
Browser backups remain governed by the separate blocking save gate.
