# Architecture

Screen Explorer is a local Node process with a browser dashboard and isolated Playwright contexts. The dashboard binds to loopback on the fixed port **4174**. The CLI rejects port overrides and never falls back to a different port. Every development session must reuse this address. One generated UI is served from the current build; previous development servers are not separate product versions.

## Boundaries

- `domain` defines observations, route coverage, fixtures, and evidence aggregation. It does not launch browsers.
- `infrastructure` captures browser evidence and persists artifacts through `ArtifactStore`. Each replay uses a new context and its original fixture.
- `dashboard/server.ts` validates requests, runs one exploration job at a time, and serves an allowlist of artifact paths. Fixture and session files are not exposed by the artifact endpoint.
- `dashboard/view.ts`, `enhancements.ts`, `styles.ts`, and `icons.ts` are the single UI implementation. No alternate template or legacy UI is bundled.

## Evidence identity

Workspace identity is the app origin. Each saved run has an immutable identifier. The latest-observations view aggregates compatible evidence, but each observation retains its evidence and replay run IDs. Exact history selection reads only the selected run. Request matching is restricted to the captured response's method and exact URL after baseline selection.

The branch map connects same-run interventions to their baseline and a recorded recovery click to its failed state. It is a view of executed recipes, not an inferred graph of every reachable state.

## Progress and cancellation

Page exploration persists its current phase, route, viewport or state detail, and experiment counters. The dashboard polls the running job independently of selected history. Completed child observations are saved as they become available. Cancellation closes active capture contexts and preserves already-written artifacts. Interrupted runs remain inspectable and are not labeled complete.

## Open-source implementation checklist

- Reproducible installation from `package-lock.json`.
- Executable CLI with a Node shebang and documented browser installation.
- One documented server port and explicit port-conflict errors.
- MIT license, security policy, contribution instructions, and CI matrix.
- Local credentials and captured data excluded from both Git and the package.
- Domain and HTTP regression tests plus a separate repeatable real-browser gate.
- No analytics, account service, remote artifact upload, or publish step in normal execution.

Remaining scope is explicit: authenticated dashboard discovery, realtime replay, exhaustive request matching by body and occurrence, visual rather than text-only replay comparison, and universal route parsing are not implemented.
