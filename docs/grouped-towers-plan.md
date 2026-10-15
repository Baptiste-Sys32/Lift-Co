# Future experiment: grouped towers

Status: deferred until the current lift implementation has been reviewed and refined with the user. This is a planning note, not an implemented feature.

## Intended behavior

Allow closely spaced towers where a lift changes grade sharply, such as a summit shoulder. Nearby towers can share one foundation while retaining separate columns, heights and sheave assemblies. A three-column group is the initial reference case.

Create a separate experimental HTML when work begins. The user will supply reference pictures. Research the older Steam ski-lift simulator reference then; its exact title has not been established.

## Questions to explore in the experiment

- Distinguish minimum mechanical clearance from the distance that makes towers eligible to share a foundation. A shared foundation does not make intersecting sheave trains acceptable.
- Measure grouping along the lift alignment. Compare a maximum overall group length with neighbor-to-neighbor grouping, so a chain of nearby towers cannot accidentally create an enormous foundation.
- Show the candidate group and shared footprint during placement. Tune the grouping distance with the user before choosing a default.
- Fit a shared foundation to sloping terrain; explore a stepped plinth where a single level slab would become excessively tall.
- Retain independent tower heights and cable contact points. Shorten or coordinate neighboring cable transitions and sheave trains when the available span becomes small.
- Recompute grouping when towers move or are removed, including splitting an existing group. Preserve stable tower identities and saved layouts.

## Work order

1. User reviews the current gondola, Ridge and Classic integration, terminal guides, station density and deletion/restoration.
2. Refine those systems from feedback.
3. Gather grouped-tower references and identify the simulator example.
4. Build and tune the separate grouped-tower experiment.
5. Integrate into the game after the experiment is approved.
