# Demo readiness

The bounded Conduit capture and replay demo passed its local gate on September 10, 2026. This is evidence for one HTTP-driven target and recorded recipe, not universal app support or a completed public release.

## Verified locally

- Started exploration from the canonical dashboard on port 4174 with one-page budget and `/api/` request matcher.
- Captured baseline, loading, empty collection, request failure, and recovery from the independent Conduit app on port 5177.
- Automatic recovery found a visible retry button in the injected failure state and recorded its click.
- All five states have mobile, tablet, desktop, and wide screenshots.
- All 60 fresh-context replay comparisons passed: five states, four viewports, three repetitions each.
- The map presents same-run intervention edges and the recorded failed-to-recovered Retry edge. Focus mode fits the complete graph; a grid remains available.
- Settings and stop controls use aligned SVG icon buttons. Saved workspaces are selectable by origin, with exact run history inside each workspace.
- Type checking, formatting, and local regression tests pass. Package inspection excludes sessions, fixtures, private run files, and compiled tests.

The repeatability report is private at `.screen-explorer/runs/run_23b13ba3-fc58-4991-8235-238758bb2bd9_route_0_states/demo-verification.json`. Re-run with:

```bash
npm run demo:verify -- .screen-explorer/runs/<state-run-id>
```

## Engine walkthrough (verification fixture)

1. Select the verified Conduit state-experiment run and choose **Play exploration**.
2. Start on the large original screen, then select **Reveal states**. The original shrinks as real loading, empty, failure, and recovery screenshots appear over approximately six seconds.
3. Select the failed or recovered screen to expand it. Select **Open this state** to reconstruct its recipe directly in a browser.
4. Show the matched replay result and the live reproduced screen. The recorded-exploration label stays visible throughout.

Short windows use a compact card layout; taller desktop windows show the connected branches. Reduced-motion settings reveal the observations without delayed animation. Evidence details remain available outside the presentation.

Exploration itself takes longer than a 20-second clip. Use an already completed run for this walkthrough, or clearly label any accelerated capture footage. Do not imply the map is generated instantaneously.

## Agent tool loop

The local MCP server now returns multi-state PNGs and evidence directly to a compatible coding agent. The real protocol integration test covers capture, full-size inspection, recovery replay, and fresh capture after a source change. The local suite passes 27 tests. See [agent tools](agent-tools.md) for setup and limitations.

The requested product film now centers on an agent seeing states, editing the app, and observing the result. Conduit is not the intended film target; see the [product film brief](product-film.md). A first 40-second cut now demonstrates an agent inspecting Finefoods state images, improving its empty state, recapturing, and verifying the empty-state replay. See the [film evidence](demo/dashboard-film.md) for the output, reproduction notes, and verification limits.

## Before a public release

- Record and review the short clip for readability and private data.
- Run the configured Linux, macOS, and Windows CI matrix remotely; those jobs have not been executed in this local session.
- Review the final package and repository metadata before publishing. No release or remote publication has been performed.
- Probe additional app architectures before making broad compatibility claims.

## Known limits

Replay comparison uses visible DOM text rather than pixel similarity. Request matching uses exact method and captured URL; body/occurrence matching, service workers, realtime systems, arbitrary server state, and authenticated dashboard discovery are not covered. No retry control means recovery remains unsupported. GET-only filtering is not a universal side-effect guarantee.
