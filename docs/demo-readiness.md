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

## Recording script

1. Start with Conduit's populated page. In the explorer, select its workspace and the verified state-experiment run.
2. Select the branch map and focus mode to show all five captured screens.
3. Follow Request failed → Retry → Recovered, open the recovered observation, and select Open replay.
4. Show the matched replay result and the live reproduced screen.

Exploration itself takes longer than a 20-second clip. Use an already completed run for this walkthrough, or clearly label any accelerated capture footage. Do not imply the map is generated instantaneously.

## Before a public release

- Record and review the short clip for readability and private data.
- Run the configured Linux, macOS, and Windows CI matrix remotely; those jobs have not been executed in this local session.
- Review the final package and repository metadata before publishing. No release or remote publication has been performed.
- Probe additional app architectures before making broad compatibility claims.

## Known limits

Replay comparison uses visible DOM text rather than pixel similarity. Request matching uses exact method and captured URL; body/occurrence matching, service workers, realtime systems, arbitrary server state, and authenticated dashboard discovery are not covered. No retry control means recovery remains unsupported. GET-only filtering is not a universal side-effect guarantee.
