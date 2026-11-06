# mapsen project context

Reviewed on 2026-11-02 (America/Guayaquil), at branch `11-reserva-en-mapa`, commit `cb7dcd2`. The user requested project review and retained context before providing the next instruction. No feature implementation or bug fix was requested.

## Resume here

The application is FiberMap, a geographic fiber-network inventory and design system. Its active root is `fibermap/`, with a React/MapLibre frontend and Nest/Prisma/PostGIS backend. Physical cable routes and device stops are separate from explicit optical connections. Changes to connectivity must account for both representations and the two different tracing implementations.

Start future work from this document and inspect the relevant current source before changing behavior. Findings here are a snapshot, not an instruction to fix everything. No application source/configuration was changed during this review.

## Repository map

| Location | Purpose |
| --- | --- |
| `fibermap/frontend/src/App.tsx` | Main navigation, map, drawing/editing, selection, history, device/trace handoffs |
| `fibermap/frontend/src/components/` | Screens, editors, connection sheets, map controls and dialogs |
| `fibermap/frontend/src/lib/` | API, shared network model, fiber colors, KMZ import, map/pole helpers, history |
| `fibermap/frontend/src/context/AuthContext.tsx` | Session restoration, login/register/logout, preferences, offline state |
| `fibermap/backend/src/` | Nest modules, domain services, REST controllers and unit tests |
| `fibermap/backend/prisma/schema.prisma` | Database model and PostGIS declarations |
| `fibermap/backend/prisma/manual/` | Historical SQL and data transformations; not a standard migration chain |
| `fibermap/backend/scripts/migrate-normal-mangas.mjs` | Separate legacy-to-normal-manga transformation |
| `fibermap/README.md` | Actual operational setup; more useful than starter package READMEs |
| `fibermap/BASE_TECNICA.md` | Domain/HU mapping and documented limitations |
| `backups/` | Database backup, old SQL and removed modules/pages; historical, not active application |
| `fibermap/cambios-*.tar.gz` | Historical patch payloads; do not treat as authoritative current source |
| `.atl/skill-registry.md` | Pre-existing generated index of installed skills |

Initial Git status contained only untracked `.atl/`. Review verification generated one tracked Vitest cache change, independently audited and restored to HEAD. Final tracked status was clean. The context document is the only intentional new project file.

## Stack and operation

Lockfile versions at this commit: backend Nest core 12.0.3, Prisma/client 6.4.1, TypeScript 6.0.3, Vite 8.3.0, Vitest 4.1.11; frontend React 19.3.0, MapLibre 6.10.0, TypeScript 6.0.3, Vite 8.3.0. Manifests use ranges. Local Node was v24.14.1/npm 11.21.1; Dockerfiles use Node 22 Alpine.

`fibermap/docker-compose.yml` provides PostGIS (`postgis/postgis:15-3.3`), Redis, backend and frontend. Ports: frontend 5173, API 3000, PostgreSQL host 5433/container 5432, Redis 6379. MinIO is optional under profile `storage`, ports 9000/9001. Redis is a backend health dependency; application integration was not established by this review.

Documented startup, from `fibermap/`:

```text
docker compose up -d --build
```

Only for a NEW database, README then specifies:

```text
docker compose exec backend npx prisma db push --skip-generate
docker compose exec backend npm run seed
```

Do not push/seed a restored database merely to start it. No infrastructure, seed or migration command was run in this review. Backend image builds Prisma/Nest and starts `node dist/main.js`; frontend container serves Vite in development mode with `--host`.

The example environment lists database/Redis/JWT/storage/tile/API settings. Frontend consumes `VITE_API_URL`, while the root example names `API_BASE_URL`; copying the example alone is not proof that standalone frontend configuration is correct. Secret `.env` contents were not inspected or retained.

PostGIS is required. Historical manual scripts include destructive refactor prerequisites, snapshots in `legacy`, two different scripts numbered `03`, non-idempotent SQL and compiled-code-dependent data transformations. Select a migration for the actual database state; numeric order is not sufficient. `06-relayout-cable-buffers.mjs` and `07-backfill-splitters.mjs` require backup according to comments. No standard Prisma migration history was found.

## Backend architecture and data

`src/main.ts` enables CORS, 10 MB JSON bodies, DTO validation with whitelist/transform, Prisma error translation and shutdown hooks. It binds all interfaces. Uncaught exceptions/rejections are logged without necessarily stopping the process. Prisma initialization retries 15 times at two-second intervals.

Active persisted modules cover Projects, Customers, Poles, ODFs, Boxes, Cables, Fibers, Splitters, OpticalConnections, Trace, Auth and Users. Connection-sheet and optical continuity/validation services cross module boundaries. Regions, Zones, Inventory and Tubes endpoints are registered scaffolds returning generated strings. GIS and several older validator/capacity classes are empty.

Database conventions: UUID text IDs, Decimal coordinates, string domain statuses/types, many soft deletions, unsupported Prisma geometry fields written through raw SQL. `Project -> Cable -> FiberTube -> Fiber` is the inventory hierarchy. Be careful: `Fiber.cable` actually relates to FiberTube; its real cable is `fiber.cable.cable`. `Fiber.cableId` separately stores the Cable ID without a direct Cable relation.

Connectivity has three representations:

| Representation | Meaning |
| --- | --- |
| `CableConnection` | Physical cable stop, polymorphic device ID, order, START/PASS/END role and inclusive fiber range |
| `OpticalTermination` / `OpticalConnection` | Explicit device-scoped optical endpoints and links, optionally exact Fiber IDs |
| `FiberSegment` | Legacy endpoint assignments using raw termination IDs |

Reservations, slack, route nodes, connectors and equipment concepts exist in the schema but are not proof of a completed UI/service feature. Current cable routes are PostGIS LineStrings rather than CableRouteNode writes.

## Cable and device invariants

Important sources: `backend/src/domain/network-rules.ts`, `cables/cable-geometry.ts`, `cables/cables.service.ts`, `boxes/boxes.service.ts`, `odfs/odfs.service.ts`, `splitters/splitters.service.ts`.

- Supported cable fiber counts: 2, 6, 12, 24, 48. Two-fiber is DROP; others DISTRIBUTION. Buffer layouts respectively: 1x2, 1x6, 2x6, 4x6, 4x12. Colors follow a twelve-color sequence.
- Backend requires route vertices within 2 m of a device or pole, preferring device centers. Route starts at a device and may end at a pole. A passing segment alone does not attach a device; a nearby vertex is required. Each device occurs once per cable.
- NAP stops initially reserve one free fiber. Existing NAP ranges take priority; later ODF/manga allocation uses the longest remaining contiguous range. Existing ranges must remain valid and are not silently truncated.
- Cable shrink is rejected. Expansion preserves fiber IDs, labels, statuses and links while relocating buffers with temporary negative positions to avoid unique collisions. Full-cable ranges grow. Custom colors persist.
- Cable creation/update spans transactions plus separate geometry, physical-stop synchronization and automatic optical assignment writes. These operations are not globally atomic. Version counters exist without expected-version optimistic locking.
- Automatic optical assignment selects relevant first fibers; it does not connect every fiber. Normal mangas instead pair eligible same-number fibers.
- Device kinds are ODF, MANGA, NAP. Manga categories: DISTRIBUCION, DISTRIBUCION_NORMAL, PASO, EMPALME.
- NAP placement requires a pole within 5 m. Mangas can exist away from poles. ODF has 1-144 physical ports.
- NAP has one 1:16 or up to two 1:8 splitters, maximum 16 total outputs. Primary DISTRIBUCION manga has one primary 1:8. Normal/pass/splice mangas use direct fiber mapping and no splitter/port sheet.
- Manga capacity denotes fibers; NAP capacity denotes splitter outputs. Shrinking splitters requires FREE outputs; forced deletion removes linked optical connections.

## Connection sheets and tracing

`backend/src/cables/connections-table.service.ts` builds the shared sheet from cable stops, inventory and explicit optical links. Its sequential displayed `fiber.port` is not the same as a physical port number. Device table endpoints show full inventory; tracing uses assigned ranges.

Each sheet port supports two fibers. Modern splitter outputs are 1-8/16; common INPUT is hidden unless legacy links exist, and new INPUT fiber links are rejected. Fiber-to-port links check cable reach, local duplicate assignment and capacity; selection can expand the stored physical range.

`backend/src/optical-connections/optical-connections.service.ts` supports ordinary connections, port links and normal mappings. Normal mapping uses separate FIBER_IN/FIBER_OUT terminations, PASS cables and transactional displacement/swapping. Normal direct splices require distinct fibers from distinct cables. Different creation paths have different validators.

The two trace engines are materially different:

- `trace/trace.service.ts`: traverses physical cable-stop neighbors, sheet partners, mappings and splitter relationships; request-local caches, visited keys, 500-step cap. No terminal means pass-through; a terminal without partners ends a route.
- `optical-continuity-engine/optical-continuity-engine.service.ts`: traverses ACTIVE/nondeleted explicit OpticalConnections, not CableConnections/FiberSegments. Adds zero-loss virtual splitter edges, reports maximum cumulative branch connection loss, and can create missing splitter terminations during GET tracing.

Do not treat these endpoints as equivalent or interpret their output as a complete optical power budget.

## Auth, project scope and customers

JWT and role guards are global. Public registration creates VIEWER users. Access-token roles/status are not reloaded for each request; refresh requires an ACTIVE user. ADMIN is required for Users routes; customer mutations require ADMIN/OPERATOR. Other domain writes lack role decorators and admit a valid VIEWER token. Permission claims have no corresponding enforcement guard.

Project isolation is incomplete. Several create paths choose the first project; boxes/cables can even select deleted projects, whereas ODF/poles choose nondeleted projects. Some listings filter by project, but device lookup and snapping can be global.

Customer viability evaluates the nearest nondeleted NAP, default maximum distance 250 m, using nominal capacity minus usedPorts. Customer creation/movement stores viability and nearest-box information; it does not allocate a real optical port. Pole import receives already-parsed points, accepts up to 5,000, normalizes codes, and deduplicates coordinates to seven decimals.

## Frontend structure and behavior

`src/main.tsx` mounts StrictMode/AuthProvider. `App.tsx` is the approximately 1,362-line coordinator, without a router: `activeTab` switches operations, map, pole import, network elements, clients, connection editor, trace and settings. Reload starts on map. The map stays mounted but is hidden by CSS on other sections, preserving camera/drawing state; returning refreshes datasets.

`src/lib/network.ts` centralizes kinds, endpoints, capacities, color defaults and CRUD conversion. ODF uses `/odfs`; MANGA/NAP use `/boxes`. Numeric latitude/longitude conversion and create/update coordinate payloads differ by device. Several UI/API contracts use `any`.

Map behavior:

- Module-level stable OSM raster style avoids replacing layers on pointer updates. Preserve `maplibre-gl` in Vite `optimizeDeps.exclude` unless worker/GeoJSON behavior is retested.
- Toolbar selects, places ODF/manga/NAP and draws cable. Invisible wide cable hit layers improve picking. Selected device opens properties; cable opens inspection.
- Poles show at zoom 17.4; viewport bounds are padded 25%, limit 30,000, move-end debounce 350 ms. A GeoJSON layer is used rather than individual DOM markers.
- Pole snap radius is 14 CSS pixels, with bounding prefilter before projection. Relevant placement/editing forces poles visible. ODF placement is unrestricted; manga optionally snaps; NAP placement requires a pole.
- New routes snap to device/pole, prefer devices, and must start at a device. Frontend start proximity is approximately 0.000018 degrees; backend enforces metric constraints independently.
- Route editing supports insertion, dragging, removal, undo/redo, discard, save and delete. Drag end snaps or reverts. `useHistory.ts` uses JSON equality and a 100-snapshot cap; drag updates may consume many history entries.
- Map datasets/history/centering refs are local to App and are not fully reset at logout. Some requests lack cancellation/order guards.

Principal screens and extension points:

| Component | Responsibility |
| --- | --- |
| `CableInspectorModal` | Inventory, initialization, reconnect, route edits, capacity, names and physical-stop ranges/loss |
| `ConnectionsTableModal` | Device sheet, pick fiber then port, link/unlink; two fibers per port |
| `BoxEditorPage` | DROP ports, splitters, terminal splices and normal-manga editor selection |
| `NormalSpliceSheet` | Ordered incoming/outgoing inventory and directional normal mapping |
| `FiberConfigurationPanel` / `FiberTable` | Fiber settings/assignment and shared colored inventory display |
| `NodesPage` | Device/cable list, filters, edit/delete and map/inspection handoffs |
| `TracePage` | Device trace, reachable NAPs and route reconstruction |
| `ClientsPage` | Customer CRUD and viability |
| `OperationsPage` | Seven parallel resource loads, inventory/capacity/length/occupancy metrics and CSV export |
| `PoleImportPage` / `lib/kmz.ts` | KMZ preview/filter/import in 2,000-point batches |

Trace recording labels selected fibers `TO <NAP NAME>` and marks USED; it does not create an optical link. Fiber configuration and termination assignment are separate API mutations and can partially succeed. `ConnectDeviceModal.tsx` has an implemented neighbor-connection flow but no importer, so it is currently unreachable.

KMZ parsing uses the first KML entry, chunked JSZip streaming and narrow regex patterns for unprefixed, case-sensitive Placemark/Point tags. There is a 600,000-point cap. Cancellation stops between import batches and leaves completed batches intact.

`lib/api.ts` stores access/refresh tokens in localStorage, adds Bearer auth, refreshes once on 401 and retries GET/HEAD network failures twice at 400/800 ms. Mutation retries are disabled. Refresh requests are not deduplicated. Auth preserves session on offline/5xx, with health polling/retries; preferences persist through `/auth/preferences`.

Styles are conventional global CSS with class naming, dark shared App tokens and component-specific surfaces. Tailwind content configuration is empty and not the operative styling system. Existing responsive/focus/reduced-motion rules should be preserved when extending UI.

## Code-backed issues to remember, not automatically fix

These are static-review findings; runtime reproduction was not performed.

1. `frontend/src/App.tsx` has offline/loading/unauthenticated early returns around lines 371-381, followed by another `useEffect` around line 513. An auth transition changes hook count, violating Rules of Hooks.
2. Most domain writes are not role-restricted beyond JWT, and project ownership is inconsistently enforced.
3. Cable workflows are not globally atomic; legacy and modern connectivity representations can diverge.
4. Box PATCH updates geometry only when both coordinates are supplied, while a single numeric coordinate can still change.
5. Cable soft deletion removes physical stops but leaves inventory/optical links. Status REMOVED without deletedAt is filtered differently across sheets and tracing engines.
6. General optical creation has weaker polymorphic ownership checks than fiber-link paths. ODF fiber-link upsert accepts positive port numbers beyond configured capacity.
7. NAP usedPorts synchronization counts BoxPorts while current links commonly use SplitterPorts; customer availability can disagree with actual optical occupancy.
8. `BoxEditorPage` generate-port/delete-link paths use `apiFetch` without checking HTTP status; rejected mutations can be silent.
9. Concurrent token refresh, stale pole responses, and retained App state across logout are risks supported by missing guards, not demonstrated runtime failures.

## Test baseline and review limits

The backend has 14 active unit suites covering domain rules/layouts, geometry/snapping, DTOs, display inventory versus assigned ranges, error translation, automatic ports, normal mapping/splices, manual fiber selection, legacy migration and trace continuity. Prisma is mocked for relevant service tests; some starter smoke tests remain. No frontend test suite was found. Auth/customer/project and live PostGIS/transaction/concurrency/browser behavior lack comparable verification in this review.

Ran the existing `npm test` (`vitest run`) in `fibermap/backend`. All 14 suites were blocked before test collection by Windows sandbox EPERM errors renaming Vite SSR temporary files. No assertions were observed executing; this does not establish product test success or failure. No workaround/rerun was attempted. The generated tracked Vitest results cache was independently audited and restored; tracked files are unchanged.

E2E was not executed because its AppModule initialization connects to actual Prisma. Builds, browser interaction, database state, backup restoration, migrations and live API behavior were not verified. `BASE_TECNICA.md` claims 79 passing backend tests historically; that count was not reproduced here.

Coverage included all active module/service structures, controllers/DTOs as relevant, Prisma schema/manual scripts, all frontend component structures and utilities, major mutation/map/auth flows, CSS/configuration conventions, all unit/e2e definitions, docs and historical artifact inventory. Long presentation-only JSX/CSS was sampled; binary backups/images and archive payloads were not exhaustively inspected. No security audit or runtime certification is implied.

## Working conventions for the next instruction

- Reply to this user in concise natural Spanish unless they switch language. Ask at most one question and stop if an answer is required.
- The user will provide the actual implementation instruction next; do not start fixing review findings without that scope.
- Preserve existing work; use conventional commits if later requested, with no AI attribution.
- Strict TDD is enabled by the user's instructions for future implementation. Do not treat mocked tests as proof of live database behavior.
- Follow applicable skills and the existing skill registry; pass exact paths when delegating. Do not recursively orchestrate from concrete executor tasks.
- Avoid `cat`, `grep`, `find`, `sed`, `ls`; `rg` and native PowerShell read tools were used in this review.
- Engram CLI is installed locally. Its default SQLite file is `C:/Users/azule/.engram/engram.db`; ENGRAM_DATABASE_URL and ENGRAM_DATA_DIR were unset. CLI access requires sandbox escalation because SQLite needs its journal outside the writable workspace. Do not configure cloud sync or transmit repository context externally.
- Engram observations #23 (`discovery/frontend-context`) and #24 (`discovery/environment-baseline`) retain additional context. Session ID: `mapsen-context-2026-11-02-01a19f86`. Backend memory save was rejected by automatic review; the full backend context is retained safely in this local document instead.

## Next step

Wait for the user's next instruction and apply this context to the requested scope.
