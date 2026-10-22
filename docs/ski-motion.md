# Skier movement and pose

The local sandbox uses `src/resort/ski-motion.js` for downhill travel and snow approaches. Walking, lift boarding, riding and bus states remain in the guest network.

Each guest has a runtime personality: direct gliding, relaxed cruising, broad carving or short turns. Personal phase, pace, lateral bias and turn spacing differ between guests. Later descents vary the phase and cadence while retaining the guest's preferred style. These simulation details are not new resort save records.

The ski line follows the piste corridor with a lateral offset. Width limits leave room for the skier and skis; offsets reduce around tight bends and converge to the exact connected start and finish. The motion samples actual terrain under the skis rather than using a flat world-up heading. Pitch and cross-slope define a contact frame; body angulation is separate so the skier can lean into turns without rolling the entire pair of skis off the snow.

Speed responds to the gradient, turn curvature and the approach to the finish, with bounded acceleration and braking. Progress accounts for the longer three-dimensional carving line. A fixed maximum integration step keeps normal and accelerated simulation speeds consistent. Station approaches stay slow, centred and on skis, using the boarding surface where available. Only completed downhill edges increment runs served.

Nearby skiers have articulated thighs, shins and boots, bent knees, speed-dependent crouch, counter-rotation and arm/pole movement. The skis have upturned tips. Beyond 150 m, a simpler leg silhouette replaces the articulated detail and poles are hidden. Lifts and buses still use their existing seated/carrying equipment poses. Resetting or completing a ski edge clears the downhill pose so it does not leak into boarding or walking.

Tracks now follow each guest's actual curved line, with short continuous segments even at accelerated simulation speeds. Stronger turns emit a small snow plume from a single pool of 256 low-detail instances. Particles expire, freeze while paused and do not alter the terrain or network. This milestone does not introduce skier collisions, crashes, jumping or full downhill rigid-body physics.

Focused temporary probes verify all four styles, terrain-frame alignment on a longitudinal and sideways slope, ski contact, lateral limits, tight bends, exact endpoint completion, frame-rate consistency, forward/reverse push approaches, animation reset and the particle bound. The isolated contact probe stays within approximately 2.2 cm of its plane and differs by under 0.1 m after ten seconds at 20 versus 60 updates per second. A 120-skier Node motion probe checks CPU cost only; it excludes browser rendering and is not an iPad performance claim. Existing station, completed-run, planting, save and Undo/Redo scenarios are also checked. No repository test suite was added or run. Real-browser appearance and device performance still require a visual/device review.
