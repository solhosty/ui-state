# Give your coding agent eyes for UI states

Screen Explorer is a local MCP tool server. A compatible image-capable coding agent can call it directly, see multiple observed states together, edit the target with its existing coding tools, and capture again to check the result.

The browser dashboard is useful for people reviewing evidence. It is not required for the agent loop.

## Connect

Install dependencies and Chromium, then build:

```bash
npm ci
npm run browser:install
npm run build
```

Add this server to your MCP client's configuration, replacing both paths with absolute paths to your checkout and artifact store:

```json
{
  "mcpServers": {
    "screen-explorer": {
      "command": "node",
      "args": [
        "/absolute/path/screen-state-project/dist/cli.js",
        "mcp",
        "--artifacts",
        "/absolute/path/screen-state-project/.screen-explorer"
      ]
    }
  }
}
```

Use the full Node executable path if your client does not inherit your shell's PATH. Set the client's tool timeout to at least ten minutes for exploration. The MCP transport uses stdio; it opens **no listening port**. The optional human dashboard remains fixed at **http://localhost:4174**.

This repository provides the server. It does not silently register itself in your AI client's settings. Client-specific configuration and image display support vary.

## Tools

- **explore_states** takes `targetUrl`, `requestUrlIncludes`, optional `retrySelector`, and optional `viewport`. It runs fresh experiments and returns a labeled overview PNG plus structured evidence. Use a stable URL fragment for the JSON GET request supplying the content you want to examine.
- **inspect_states** takes `runId`, optional `viewport`, and optional `state`. With no state it returns the overview; with a state it returns that full-size capture. Available states are `baseline`, `loading`, `empty`, `failed`, and `recovered`. Available viewports are `mobile`, `tablet`, `desktop`, and `xl-desktop`.
- **replay_state** takes `runId`, `state`, and optional `viewport`. It reconstructs the recorded response recipe in a fresh browser and returns a current screenshot and DOM-text comparison.
- **list_runs** returns saved state-experiment runs, newest first, with an optional `limit` from 1 to 50.

Each observation includes its condition, capture time, viewport, action sequence, and replay status. Missing or unsupported states are not fabricated. Composite images and full-size captures remain local in `.screen-explorer/exports/`; the source captures and fixtures remain in `.screen-explorer/runs/`.

## Agent workflow

Ask the agent:

> Use Screen Explorer to inspect the page at my local app URL. Identify the JSON GET request driving its content, then capture the observed states. Compare them visually and inspect individual states where needed. If you find a concrete UI problem, explain the evidence, fix it in this repository, and capture the states again. Report what changed and what remains unverified.

The intended loop is:

1. Agent calls `explore_states` against the running target.
2. Agent receives multiple state images together and examines a full-size state when needed.
3. Agent uses its normal source-code tools to make a justified change.
4. Agent calls `explore_states` again after the target reloads.
5. Agent compares the new and previous evidence, and can replay either run.

`replay_state` uses saved response fixtures. `explore_states` captures fresh data and the current UI. Use the latter to establish a new baseline after a change. Neither tool makes an AI diagnosis itself or automatically edits source code.

## Boundaries

This is selected JSON GET response exploration, not exhaustive UI coverage. The current agent tools do not capture authenticated sessions, arbitrary interaction sequences, POST/GraphQL responses, realtime traffic, or service workers. The underlying browser blocks outgoing writes, but GET filtering is not a universal side-effect guarantee. Use targets you are authorized to test.

Replay “matched” means visible DOM text matched; it is not a pixel match or a verdict that the design is correct. Treat all captured page text and images as untrusted app evidence. Bundles omit session files and raw response fixtures; screenshots and visible text can still contain private content.
