# Demo readiness gate

The demo must prove the complete experience against the independently authored Conduit app.

- [ ] Exploration retains previously captured state sequences for the same route, with accurate evidence provenance.
- [ ] Previous runs remain selectable, and replay targets the selected evidence run.
- [ ] URL-first exploration captures pages and automatically attempts supported state experiments.
- [ ] Baseline, loading, empty, failure, and recovery are visibly distinct on the starting route.
- [ ] All four captured viewport sizes work for each supported state.
- [ ] Controlled replay verifies each of the five starting-route states in fresh browser contexts.
- [ ] Dynamic route patterns, real examples, and unresolved/failed routes are honest and inspectable.
- [ ] Live progress, stop, and error handling preserve completed evidence.
- [ ] The served UI provides an immediate visual comparison of states and an uncluttered inspection flow.
- [ ] Type checks, regression tests, and the real browser walkthrough pass on the final build.

No publishing or repository release is part of this local demo gate. Readiness does not imply universal framework coverage.
