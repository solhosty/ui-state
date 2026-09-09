# Independent Target Validation

The first target is the unmodified public repository [chambits/zustand-react-query](https://github.com/chambits/zustand-react-query), cloned outside this repository.

It is a TypeScript Vite application using TanStack React Query and a separate JSON Server. Its posts screen reads `http://localhost:8080/posts` and visibly renders a loaded list, `Loading...`, an empty list, and `Error loading posts`.

The explorer was run against the target at `http://127.0.0.1:5175/` using the explicit matcher `:8080/posts`. The captured run contains browser screenshots and DOM text for baseline, delayed loading, empty collection, and injected `500` failure. The target uses automatic React Query retry but exposes no manual retry control, so its recovery observation is intentionally `unsupported`.

The local artifact dashboard has a replay action for every supported observation and opens a fresh controlled Chrome context from its stored fixture. A failed-state replay was launched from the dashboard after the run was captured. Visual verification must be repeated after subsequent replay changes; an HTTP smoke test alone is not browser evidence.

This validates the first proof only. It does not establish framework portability or support for mutation, streaming, service worker, or realtime behavior.
