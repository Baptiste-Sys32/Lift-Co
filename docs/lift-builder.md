# Lift construction workshop

Open `experiments/lift-builder.html` directly in a browser. It uses the same Three.js CDN as the resort, so an internet connection is needed for the library.

## Build a line

1. Click the snow for the start station, then the end station.
2. Click along the dashed centre line to add towers. Towers stay on the straight lift alignment.
3. Select a tower and set its rope height with the slider, number field, gold 3D handle, or a draggable dot in the elevation profile.
4. Use **Along the line** to reposition a selected tower. **Remove tower**, Delete and Undo are available.

Scroll to zoom, drag to orbit, right-drag to pan. **Side**, **Top** and **Frame lift** help inspect the alignment. The sidebar scrolls to reveal **Load example**, **Clear** and **Export JSON**.

Both wheel banks use the same support or hold-down arrangement, chosen from the cable's local curvature. A rounded transition over each train keeps the rope continuous as its angle changes. Heights are measured from flat ground to the rope centre, and remain exactly as entered. Moving cabin guides and the clearance readout expose layouts that would intersect the ground.

Station centres must be at least 30 m apart; towers need 14 m from a terminal and 10 m from another tower. Tower heights range from 3 to 40 m. Moving a station preserves tower positions as fractions of the line length, subject to those spacing limits.

## Reusable pieces

- `src/builder/layout.js`: layout data, placement constraints and smooth cable profile; independent of Three.js.
- `src/builder/view.js`: station/tower geometry, wheel placement and moving cabin guides.
- `experiments/lift-builder.html`: editor controls, picking, undo history, camera and elevation profile.

Exported JSON contains station world coordinates, tower fractions and heights, and sag. This prototype builds one line at a time. Its layout model can later be instantiated per lift and adapted to terrain heights in the resort.

## Main resort construction

The same construction model is now available from **Build a lift** in `index.html`.

- Choose the lower start station and a higher end station (60–900 m apart).
- Place towers along the alignment, then adjust their height above the local snow (3–40 m) and distance along the line.
- Drag profile dots or the gold 3D handle to resize a selected tower; **Focus tower** moves the camera closer.
- Both wheel banks follow the cable curvature. Station approach spans stay taut.
- **Build & open lift** saves the line, reopens the resort and regenerates station grading, vegetation clearings and its return run. It preserves the camera, light setting, speed, skier count and served-run count; individual guest trips restart.
- Select any line in the resort network to ride it, inspect its machinery or edit its towers. Draft edits are discarded with **Close** / **Your resort**.
- Construction pauses the resort. Opening a line requires a clear cable path; the editor also flags overlapping terminals and crossings with less than 7 m vertical separation.

Layouts are stored in browser local storage under `lift-co-resort-v1:<seed>`. Each mountain seed has its own lift network. The flat workshop remains available separately. New lines use the complete existing cabin/station factory, including station density, conveyors, grip release, doors, sway, boarding and ride cameras.

The detailed terrain footprint is now 1,080 × 1,080 m. The selected mountain has been broadened 1.65× across and 1.4× along, with its height preserved; the original line is extended to 405 m.

## Untouched large map

Open `empty-map.html` for a separate 2,160 × 2,160 m map (4.67 km²), four times the detailed footprint of the original resort. It begins with no lifts, pistes, buildings or visitors. Scenery consists of snow, instanced woodland, snow-covered boulders and light snowfall. Visitors begin after the first line opens.

Use **Build your first lift** to enter the existing station/tower editor. Stations may be placed within ±1,000 m of the map centre, with lines up to 1,800 m long. The larger terrain keeps the original hill/saddle character at a broader scale.

This page uses its own `lift-co-empty-map-v1:<seed>` save and restores only lines built on this map. The original `index.html` and its resort save remain available. The shared editor accepts optional map bounds and notification keys; its original defaults remain unchanged.

### Remove a built lift

In `empty-map.html`, select a line under **Your lift network**, choose **Remove lift**, then confirm. The saved network reloads with that line’s stations, towers, carriers, clearing and return piste removed. Other lift layouts, the camera, light, speed and served-run count are preserved; guest trips restart as they do after construction. Removing the last lift returns to the empty-map starting state.

**Restore [lift name]** undoes the most recent removal in the same browser tab, including after deleting the last line. It restores that lift’s type, stations and tower settings. Building or committing an edit clears this undo option.

### Station cable guides and chairlift types

The empty-map builder offers Alpine gondola, detachable six-seat Ridge and fixed-grip four-seat Classic. Classic uses its compact reference terminal and stays at 1.8 m/s throughout the loop. Ridge retains the gondola terminal/conveyor system with 1.8 m station spacing.

Stations have three compact projecting entry sheaves per lane. These provide a short, smooth transition into the level terminal. For steep approaches, use separately placed towers and their height controls to ease the angle in stages; the station does not automatically create a large approach pole. The profile shades the short receptor transitions in gold. Snow clearance and tower spacing still apply.

Future work: [grouped towers sharing one foundation](grouped-towers-plan.md). Deferred until the current lift changes have been reviewed; planned as a separate experiment.
