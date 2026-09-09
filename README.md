# Screen State Explorer

Screen State Explorer is a local TypeScript tool for recording and replaying observed screen states in independently authored HTTP-driven web applications.

It records a real baseline response, then runs bounded experiments in fresh browser contexts: delayed response, empty collection, synthetic failure, and optional recovery through a configured retry control. Each observation produces a screenshot, visible text, a DOM hash, and a replay result in local artifacts.

## Scope of the first build

The tool only intercepts an explicitly selected `GET` request that returned JSON during baseline capture. The capture selector is a required URL fragment; every following experiment and replay is narrowed to the exact captured response URL. It never invents write requests, and it does not claim to reproduce realtime, service-worker, server-memory, or arbitrary in-memory JavaScript state.

Target application code does not belong in this repository. The first target will be cloned separately from GitHub and run unchanged.

## Run

Start the dashboard and enter your app URL:

```bash
npm install
npm run build
node dist/cli.js dashboard --port 4174
```

Open http://localhost:4174 and choose **Explore app**. The explorer visits same-origin links recursively and captures each page at four viewport sizes. Results appear as pages finish. **Stop exploration** preserves completed captures.

Under **Advanced**, optionally supply the app's source folder to discover unlinked route declarations. Leave the page limit blank to explore all discovered URLs, or set a limit. Only read-only HTTP requests are allowed during page exploration; forms are not submitted, service workers are blocked, and cross-origin document navigation is blocked.

The same flow is available in the CLI:

```bash
npm run explore -- --target http://localhost:3000 --source /path/to/app
npm run explore -- --target http://localhost:3000 --max-pages 20
```

All discovered pages are explored by default (`--all` is also accepted). Press Ctrl+C to stop and save completed captures. Query-string URLs and hash routes are retained, so apps with endless pagination may need a limit or manual stop.

Source discovery recognizes common literal route declarations and Next, Nuxt, and SvelteKit-style filesystem routes. It is conservative, not a complete framework parser. Dynamic templates can be resolved from observed links with matching path prefixes; parameters are never fabricated. Templates without a captured example remain visible in the dashboard. Computed routes, nested relative route configs, arbitrary API-to-parameter inference, and authenticated page discovery are not yet automatic.

### Controlled state experiments

To capture loading, empty, failure, and recovery states for a specific page, supply a read-only JSON request matcher:

```bash
npm run explore -- \
  --target http://localhost:3000/some-screen \
  --request-url /api/items \
  --retry '[data-testid="retry"]' \
  --headed
```

These schema-5 runs retain controlled replay. URL-only explorations produce schema-6 screenshot runs without replay fixtures. Previous runs remain in `.screen-explorer/runs/`; the dashboard displays the latest run.

### Authenticated applications

Use an isolated, visible Playwright browser to log in once. Complete MFA yourself, then confirm in the terminal to save local session state. The explorer never reads your everyday browser profile or copies its cookies.

```bash
npm run build
node dist/cli.js login \
  --target https://app.example.test/login \
  --session .screen-explorer/sessions/example.json

npm run explore -- \
  --target https://app.example.test/projects \
  --request-url /api/projects \
  --session .screen-explorer/sessions/example.json \
  --headed
```

Session files can contain credentials. Keep them in `.screen-explorer/`, which is Git-ignored, revoke them when no longer needed, and never attach them to a run artifact or issue.

The route inventory is discovered from rendered same-origin links. Add a hidden but authorized route explicitly with repeated `--route` flags; route seeds must stay on the target origin. A route only receives a state sequence after a safe, route-specific `GET` response is selected and observed.

Artifacts are written locally to `.screen-explorer/runs/<run-id>/` and are excluded from Git.

To inspect the latest run, serve the local dashboard:

```bash
npm run build
node dist/cli.js dashboard --port 4174
```

## Repository layout

```text
src/
  cli.ts                       command boundary and input validation
  domain/                      contracts and deterministic fixture transforms
  infrastructure/              Playwright and local artifact adapters
```

## Development

```bash
npm run check
npm test
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution and browser-evidence expectations, and [SECURITY.md](SECURITY.md) for private vulnerability reporting.

## Status

The first capture proof is verified against a separately cloned, independently authored GitHub target. See [independent target validation](docs/independent-target.md). The chosen public-demo target is a separate Conduit fork with an explicit retry UI; see [demo target setup](docs/demo-target.md). The initial browser evidence is complete; route discovery and route-specific request selection remain active work.
# ui-state
