# Contributing

Screen State Explorer is intentionally target-agnostic. Keep target applications, captured run artifacts, and credentials out of this repository.

Before opening a change:

1. Run `npm run check` and `npm test`.
2. For browser-facing changes, verify the served dashboard and a real independently authored target; command success is not enough.
3. Keep interception bounded to explicitly selected read-only HTTP `GET` responses. Session state may only be created in the dedicated visible Playwright login flow; never read or copy a user's normal browser profile.

Use focused commits and include the target, request matcher, expected screen state, and browser evidence in a pull request description when changing exploration or replay behavior.
