# Release checklist

Use this checklist before creating a public tag or publishing the package. A green local build does not replace the browser-evidence or hosted-CI steps.

- [ ] Run `npm ci` with Node 22 or 24.
- [ ] Run `npm run verify`.
- [ ] Inspect `npm pack --dry-run`; it must exclude `.screen-explorer/`, sessions, captured response bodies, and compiled tests.
- [ ] Run `npm run demo:verify -- .screen-explorer/runs/<state-run-id>` against a sanitized, authorized target and retain its private report.
- [ ] Record a short demo with no production fixtures, cookies, API bodies, account data, or private filesystem paths.
- [ ] Confirm the GitHub Actions matrix is green for Node 22 and 24 on Linux, macOS, and Windows.
- [ ] Review `README.md`, `CHANGELOG.md`, `SECURITY.md`, package version, repository description, and license for the tag.
- [ ] Create an annotated `v<version>` tag only after every preceding item is complete.

The private vulnerability-report route is GitHub's security advisory form for this repository. Keep investigations and affected fixture data out of public issues.
