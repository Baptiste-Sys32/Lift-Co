# Selected gondola integration — October 16, 2026

The current game is `empty-map.html`. Construction offers these groups:

| Group | Display name | Stable type ID |
| --- | --- | --- |
| Chair Lift | Classic | `classic` |
| Chair Lift | 6-Seater | `ridge` |
| Gondola | Classic | `gondola` |
| Gondola | Panorama | `princesse-panorama` |
| Gondola | Touring | `princesse-touring` |
| Gondola | Sigma Arbois | `arbois` |
| Gondola | Sigma SP77 | `jaillet` |

The empty Ski Lift category stays hidden. Sigma Arbois is a descriptive game name; no factory code was confirmed for the rectangular reference. Sigma SP77 is the user-approved identification/name for the rounded reference. The [BEA-TT report](https://www.bea-tt.developpement-durable.gouv.fr/IMG/pdf/rapport_beatt_2018-04.pdf) documents the SP77 composite six-seat model; it does not establish the identity of the supplied Jaillet photos. In-game capacity is four seated guests for each new style, independently of real-world capacity.

## Operation

The selected study geometry is reused without replacing the original Classic gondola. Arbois retains its reversed hanger and ski pockets on moving doors. Panorama and Touring retain their reversed hangers and parallel opening assemblies. SP77 retains its round footprint, curved shoulders, moving end shells and compact front/rear grilles. Actual guest meshes occupy the seats; study display passengers are omitted. External skis follow occupancy, and the ride camera sits inside each cabin.

All four use the existing detachable stations, rope profiles, grip pitch, suspension sway, terminal receptors and pylon response. Floors sit 4.64 m below the rope on station rails, level with the existing platform; hanger length adapts to that alignment. They run at 7.8 m/s on the cable and 0.32 m/s in stations. Dispatch pitch is 2.85 m for the Sigma styles and 3.05 m for Panorama/Touring to account for the different bodies.

Construction previews contain infrastructure only. Once built, each line creates one merged cabin template and shared instanced render parts, including independently animated doors, shells, skis and grip pieces. Original internal type IDs and save schema remain stable; new style IDs persist through the shared editor.

## Files and backup

- `src/lifts/gondola-studies.js`: approved geometry and production motion metadata.
- `src/lifts/gondola-runtime.js`: floor alignment, occupied skis, seats, cameras, shared geometry and animated instances.
- `src/lifts/catalog.js`: grouped labels, dimensions and operating settings.
- `src/builder/resort-editor.js`: grouped selector and type-aware default names/colours.
- `empty-map.html`: live carriers, boarding, camera and animation integration.

The pre-integration source/assets snapshot is `archive/releases/pre-cabin-integration-20261016/`, with 85 files recorded in `SNAPSHOT.json`. Browser saves are not part of that filesystem snapshot. Source was reviewed; no browser or automated tests were run for this integration.
