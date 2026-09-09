# Demo Target: Conduit

The current demo target is the separate GitHub fork [solhosty/conduit-react](https://github.com/solhosty/conduit-react), derived from the MIT-licensed TypeScript/Vite Conduit application by [yoonge](https://github.com/yoonge/conduit-react).

It is not embedded in this repository. The fork adds only target-local, read-only demo support: a small API that supplies conversation data and UI states for loading, empty results, request failure, and a visible retry control.

## Run the target

```bash
git clone https://github.com/solhosty/conduit-react.git
cd conduit-react
pnpm install
PORT=3000 npm run demo-api
```

In another terminal:

```bash
VITE_API_ORIGIN=http://127.0.0.1:3000 pnpm dev
```

## Run the explorer

With the target served by Vite (normally at `http://127.0.0.1:5173`):

```bash
npm run explore -- \
  --target http://127.0.0.1:5173/ \
  --request-url http://127.0.0.1:3000/api/ \
  --retry '[data-testid="retry"]' \
  --headed
```

The explorer captures the real baseline API response. Its delayed, empty, failed, and recovered states come from controlled interception of that single captured `GET` response; no writes are generated.

## Required browser evidence

Before using this target in a public demo, verify all five captured states in the served browser and replay each supported state from the dashboard. Record the resulting screenshots and DOM-match outcomes in the run artifact.
