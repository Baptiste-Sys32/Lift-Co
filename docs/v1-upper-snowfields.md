# Upper Snowfields — V1

Open [the current game](../empty-map.html).

## Included

- The selected **Upper Snowfields** variation of **Twin Summit Pass**, 3.6 × 3.6 km, with summit terraces and distributed natural ski faces.
- Alpine gondola, Ridge detachable chairlift, Classic fixed-grip chairlift and **Solo reversible téléphérique** construction.
- Solo: two cabins, 12 places each, Heavy Portal pylons, compact inclined stations, 10.25 m/s cruise and 7 m/s pylon passage. No carriers are created in construction previews.
- UI arrow hides the interface except pause/resume; WASD flight, Space-held mouse look and Shift acceleration remain available.
- Laptop defaults: pixel ratio 1, about 115k primary terrain triangles, 800 main trees plus at most 75 close-to-lift trees, reduced snowfall and shadows disabled. Shadow maps can be enabled in the afternoon panel. Small distant carriers and guests are culled from rendering while simulation continues.
- A 10 m terrain sampling cache supports movement and construction. Terrain around built stations is refined locally for their floor-level boarding channels.

## Backup before integration

The complete prior project snapshot is in:

`archive/releases/pre-upper-snowfields-v1-20261015/`

It contains 64 files and its own `SNAPSHOT.json`. Older archive trees and sensitive-file patterns were excluded. This is a source/assets snapshot, not a copied browser profile. No connected browser was available for exporting a live save during the snapshot.

V1 uses `lift-co-upper-snowfields-v1:<slot>` saves. Legacy `lift-co-empty-map-v1:<seed>` entries are never overwritten or transplanted to the changed terrain. On first opening V1 in the original browser origin, their saved values are also copied to `lift-co-pre-v1-backup:<legacy-key>` if that backup key does not yet exist.

The main sidebar's **Download resort backup** button exports the current V1 resort and available legacy save records as JSON. V1 saves progress and camera state on page exit, and saves completed construction/removal before reloading.

## Returning to the previous version

To run the prior game with its original browser save, first keep a copy of the V1 directory, then copy the archived snapshot's files back to the original project location. Open the same original URL/browser origin that held the old save. A different browser, port or `file://` path may have separate storage. Opening the snapshot's HTML directly is useful for looking at the old code version, but does not guarantee access to the save associated with the original URL.

A new V1 slot starts empty. The new map does not reinterpret old lift coordinates, so the previous resort remains recoverable in its old version.
