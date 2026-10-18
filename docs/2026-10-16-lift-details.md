# Lift details — October 16, 2026

## Current game

Open [empty-map.html](../empty-map.html). Alpine gondola, Ridge detachable chair and Classic fixed-grip chair remain available. Solo has been set aside; its source and HTML studies are preserved.

- Station receptor wheels lift only when the rope runs underneath them and a grip passes below. Axles and bearing links follow the wheel.
- Normal tower hold-down wheels retain their matching motion. Grip assemblies pitch along the rope; suspended cabins/chairs remain upright with their existing sway.
- Two downward floodlight fixtures per pylon turn on around dusk and off after dawn. A pool of eight nearby, shadow-free spotlights keeps the number of active lights bounded. Fixtures farther away remain visibly lit but do not cast illumination onto the snow.
- Newly built lines have no automatic ski piste. Earlier lines retain their routes. Guests can still board and unload on the new lines; they pause at the summit and then transfer on foot, without generating a descent or counting a run.

## Backup

The complete source/assets snapshot taken before this update is:

`archive/releases/pre-solo-hold-20261016/`

It includes 64 files and `SNAPSHOT.json`. It excludes older archives, dependency folders and sensitive-file patterns. No live browser profile was copied.

On opening the updated game at the original browser origin, every existing Upper Snowfields save is copied once to:

`lift-co-pre-solo-hold-20261016:<original-save-key>`

This happens before filtering saved Solo lines or writing progress. Current saves continue in the original V1 slots with the supported lift types; the backup copy retains the original Solo definitions. If the local backup cannot be created, saving is disabled to preserve the existing record. The sidebar's **Download resort backup** includes these saved backup records.

To restore the previous build, copy the source snapshot back to the original project location and restore the desired saved backup value to its original save key at the same browser origin. Merely opening an archived HTML path may use a different browser storage area.

## Next: gondola cabin references

The user supplied ten reference images. The three pages are now available in [the Megève cabin study guide](gondola-megeve-studies.md). Keep the original Alpine gondola. For each of the anticipated three distinct cabin models, create one separate HTML study with three interpretations of the cabin's actual shape, proportions, glazing and hanger details. Color is independent of the three geometry variants. Different views of the same reference cabin belong to the same model study. The expected total is three HTML studies and nine proposed models; selected cabins can be integrated later without changing the line machinery.

## Review status

Source reviewed. No browser test or automated test run was performed for this update.
