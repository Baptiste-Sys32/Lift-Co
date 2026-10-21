# VPS preview deployment

The first legacy VPS is used for this preview: 2 CPUs and about 1 GB RAM. The active ARM bot host and the other legacy machine's console are not changed.

## Published content

- Root opens `empty-map.html`, the Upper Snowfields game.
- `designs/station-variants.html` opens the station workshop.
- The original resort is available separately as `original-resort.html`.
- JavaScript, CSS, fonts, terrain, model and reference assets are copied from explicit public input directories.
- Archives, backups, deployment tools, SSH material, dotfiles and local configuration are excluded. Published text is checked for credential prefixes and local machine paths.

The authored `index.html` and `empty-map.html` are unchanged. Only the staged copy of the game replaces its CDN import-map entries with the already vendored Three.js 0.160.0 and OrbitControls. The main game and station workshop therefore do not depend on the external script CDN.

## Build and service

Run `python3 tools/prepare-preview.py NEW_OUTPUT_DIRECTORY` to make a new release. The output directory must not exist. It contains a file manifest, SHA-256 hashes and smaller precompressed versions of text assets.

The server is [tools/preview-server.cjs](../tools/preview-server.cjs), using Node's built-in modules with no installed application dependencies. It serves only files in the release manifest, has no directory listing, restricts methods to GET/HEAD, and rejects unpublished paths. HTML and assets are revalidated with ETags to avoid stale code after updates. The `/healthz` endpoint identifies the active release.

Remote layout:

```
lift-co/
  preview-server.cjs
  current -> releases/RELEASE_ID
  releases/
  logs/
```

The final web process is `lift-co-web.service`, running as the unprivileged `ubuntu` user on TCP port 80 with only the low-port binding capability and a 100 MB memory limit. `lift-co-tunnel.service` forwards the same local site to a temporary HTTPS preview address. Both are enabled at boot. The initial PM2 preview and its dedicated reboot entry have been removed after final-service verification. No bot or console process is changed.

For updates, upload a new release directory, verify its file hashes, switch the `current` symlink, and restart only `lift-co-web.service`. Leave the tunnel running to preserve the current preview hostname. Retain the preceding release for rollback. Do not rsync the whole project or change the Tokki services.

## Device behaviour

The VPS serves static files; the iPad performs all simulation and WebGL rendering. Performance defaults are unchanged. The IP-address route is not reachable: Oracle blocks incoming web traffic before it reaches the VPS firewall. The VPS accepts port 80, but external probes leave that accept rule at zero packets. No Oracle CLI credentials or signed-in console are available here. A Cloudflare Quick Tunnel supplies temporary HTTPS access from this VPS. Its hostname changes if the tunnel restarts; a stable address requires opening Oracle ingress or configuring a permanent tunnel/domain later. Saves remain in each browser's local storage. Changing hostname, protocol or port changes the browser storage origin, so saved resorts do not automatically follow such a change.

## Verification

The initial release contains 205 published files. All raw-file hashes were verified after transfer. The staged main game loaded with all 13 catalog choices, no JavaScript exceptions, no failed asset requests and no external script requests. Local HTTP checks verified correct module MIME types, gzip transfer and health responses. Requests for deployment scripts, dotfiles, archives, the internal manifest and traversal paths were rejected.

The deployment must also pass a public connection and browser load before its public address is reported as ready. A local VPS health response alone does not establish internet reachability.

## Public verification, 20 October 2026

The HTTPS preview is live at `https://cincinnati-biol-titled-medieval.trycloudflare.com/`. The game is `/empty-map.html`; the station workshop is `/designs/station-variants.html`.

External HTTPS requests returned 200 for the root, health endpoint, main game, workshop and local Three.js module. A fresh browser followed the root redirect, loaded all 13 game types and rendered its canvas in a secure context with no JavaScript exceptions, failed requests or HTTP asset errors. These checks ran against the public hostname, not a local tunnel or SSH-forwarded URL.

The VPS web and tunnel services are active and enabled. The port 80 host-firewall rule is persisted; the original firewall file was backed up outside the web root. The provider firewall still blocks direct-IP web requests. A signed-in Oracle Cloud console or API access is needed to open its ingress; SSH access alone did not provide that access. Other Tokki machines and services were not modified.

Cloudflared 2026.10.1 was downloaded from the official Cloudflare GitHub release, and its SHA-256 matched the release asset digest. The temporary tunnel has no account/domain dependency and its hostname changes if recreated, as documented in [Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/). Do not restart the tunnel as part of a normal game-code deployment.

## Station category study update, 20 October 2026

Release `20261020T073728Z` replaces the station workshop and its research assets. It contains 216 public files. All raw-file SHA-256 hashes and decompressed gzip contents were verified after upload before switching the release symlink. The previous release remains available for rollback. Restarting the web service exposed an incorrect `Requires=lift-co-web.service` dependency in the tunnel unit, which also restarted the quick tunnel and changed its address. The tunnel unit now uses `Wants` and ordering instead, so future web restarts do not stop the tunnel. The updated unit was reloaded without restarting the active tunnel.

The workshop now has five categories and 15 reference-based station proposals. The study uses its own category selection storage key. No resort save is migrated or modified. The authored main game and original resort retain their pre-study checksums.

The current preview is `https://institutions-developing-commercial-velvet.trycloudflare.com/`. The earlier cincinnati address no longer resolves to an active tunnel. Saves remain tied to their original browser origin; this update does not copy them to the new hostname.

Public verification of the new address returned HTTP 200 for the health endpoint, workshop and new architecture module. A fresh browser loaded all five categories at the new HTTPS origin, rendered an iPad-size preview, and reported no script exceptions, failed requests or HTTP asset errors. A terminal tyre changed rotation under the motion probe. The main game also loaded its canvas without script errors. After correcting the unit dependency, an additional web-service restart preserved the active tunnel process and hostname.

## Selected station refinements, 20 October 2026

Release `20261020T080929Z` contains 217 public files. It locks Fixed B, Gondola B, Tramway B and Funitel C, and keeps detachable chairs explicitly unselected. Building closures, structural supports, carrier clearances and synchronized motion were refined in workshop-only modules. All raw hashes and gzip contents were verified on the VPS before activation. The web restart preserved the tunnel process and the existing institutions preview address. Earlier releases remain available for rollback.

The public HTTPS health response identifies the new release. A fresh browser loaded the refined module and all four approved summit inspections with restored approvals, no script errors, no failed requests and no HTTP asset errors. The locked design exports exclude detachable chairs. Authored `index.html` and `empty-map.html` retain their pre-refinement SHA-256 hashes.


## Approved station integration, 20 October 2026

Release `20261020T083912Z` installs the four approved station types in Upper Snowfields. All 219 public file hashes and gzip contents were verified before activation. Only the web service restarted; the tunnel process and existing institutions preview address were preserved. Public health identifies the release, and the main game loads with an empty error overlay and the per-type Station type selector. The source backup is `archive/backups/approved-stations-game/`; previous remote releases remain available for rollback.
