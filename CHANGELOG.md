# Changelog

All notable changes are recorded here. This project follows [Semantic Versioning](https://semver.org/).

## 0.1.0 — 2026-09-18

Initial public release candidate.

- Captures observed baseline, loading, empty, failure, and recovery states for supported JSON `GET` responses.
- Replays recorded state recipes in fresh browser contexts and records DOM-text verification results.
- Exposes exploration, inspection, replay, and run listing through a local stdio MCP server.
- Keeps screenshots, captured responses, session files, and run records local under `.screen-explorer/`.

### Known limits

- This is selected response-state coverage, not exhaustive browser or backend testing.
- Replay verification compares visible DOM text; it is not a pixel-equivalence check.
- Only safe-to-repeat targets should be explored. Filtering to `GET` is not a complete side-effect guarantee.
- Authenticated dashboard discovery, service workers, realtime protocols, and arbitrary application state are outside the supported replay model.
