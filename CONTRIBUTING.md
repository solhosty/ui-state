# Contributing

Screen State Explorer is intentionally target-agnostic. Keep target applications, captured run artifacts, and credentials out of this repository.

Before opening a change:

1. Run `npm run check` and `npm test`.
2. For browser-facing changes, verify the served dashboard and a real independently authored target; command success is not enough.
3. Keep interception bounded to explicitly selected read-only HTTP `GET` responses. Session state may only be created in the dedicated visible Playwright login flow; never read or copy a user's normal browser profile.

Use focused commits and include the target, request matcher, expected screen state, and browser evidence in a pull request description when changing exploration or replay behavior.

## One dashboard address

The dashboard is fixed at **http://127.0.0.1:4174**. This is a project invariant for people and coding agents. Never start alternate dashboard ports, add automatic port fallback, or work around a port conflict by launching another UI. Reuse the existing server or stop it before running `npm start` or `npm run dev`. Target applications have their own ports; this rule applies to the explorer dashboard.

`npm run dev` rebuilds and reloads that same dashboard. Stop exploration before code edits that restart the worker. Builds remove generated `dist/` output first so obsolete UI assets cannot survive or enter a package. Do not edit `dist/` directly.

Run `npm run format` before `npm run verify`. The tests have a platform-independent launcher; avoid shell-specific globs or macOS-only commands in package scripts.
