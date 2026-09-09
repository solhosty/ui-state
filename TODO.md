# Screen State Explorer roadmap

## Route-aware exploration

- [ ] Discover eligible JSON `GET` responses independently for each route rather than relying on one global request matcher.
- [ ] Let a user select the response to model for a route from observed safe candidates.
- [ ] Capture the baseline, delay, empty, failure, and recovery sequence for each selected route.
- [ ] Generate mobile, tablet, desktop, and XL-desktop evidence for every captured route/state pair.
- [ ] Replay and verify each route/state pair in a fresh context.
- [ ] Display route coverage with explicit states: captured, awaiting request selection, no eligible response, unreachable, and authentication expired.

## Dynamic application navigation

- [ ] Observe client-side SPA navigation in addition to same-origin rendered links.
- [ ] Keep route crawling bounded and read-only, with a visible route-count limit.
- [ ] Support authorized hidden-route seeds and identify their source in the route catalog.

## Authentication lifecycle

- [ ] Detect expired Playwright storage state before capture and replay.
- [ ] Offer a visible re-login flow that replaces only the isolated session file.
- [ ] Surface the session origin and local-session age without exposing cookies or storage values.

## Demo and release

- [ ] Record a browser walkthrough using the independent Conduit demo target.
- [ ] Draft the X post and wait for explicit approval before publishing.
- [ ] Initialize and publish the Screen State Explorer repository.
- [ ] Add CI for TypeScript checks and tests.
- [ ] Add sanitized example artifacts, versioning, and release notes.
