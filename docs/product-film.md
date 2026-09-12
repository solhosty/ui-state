# Product film: give the agent more than the happy path

## The promise to demonstrate

The coding agent calls Screen Explorer to see several observed states, uses those images to make a justified source change, and calls it again to check the result. The interface is a real MCP tool server, not a manual screenshot handoff or a separate AI diagnosis service.

## Visual direction

Reference: [Introducing Aave App](https://www.youtube.com/watch?v=gJ0suQyznAc). Use a composed product film with clear typography, generous space, focused UI close-ups, and deliberate movement. Actual tool output and working app footage remain the evidence. Use restrained transitions rather than a long unedited desktop capture. Keep the initial cut silent-friendly with captions.

Feature a polished dashboard. Conduit remains an engine verification fixture and is not the desired film subject. Do not build a broken screen just to claim the tool discovered a real defect.

## Sequence, approximately 35–45 seconds

1. **The happy path is only one state.** Start on the target dashboard at normal operating conditions.
2. **Let your agent see the others.** Show the real `explore_states` call, then the labeled multi-state image returned to the agent. Label omitted exploration time as edited/accelerated.
3. **Find the problem in context.** Focus on an actual observed problem. Show the agent inspecting a full-size state with `inspect_states`, and its brief evidence-based diagnosis.
4. **Adjust the app.** Show the focused code change made by the coding agent with its existing editing tools. Do not present a prewritten overlay as actual agent reasoning.
5. **Look again.** Show a second `explore_states` run after reload and compare the relevant before/after states. Include a `replay_state` check when it substantiates the result.
6. **See. Adjust. Verify.** End on the working dashboard and the observed improvement, not just a success badge.

A DOM-text replay match is not proof of visual correctness. The filmed before/after evidence must support the specific improvement claimed.

## First cut completed

The first 40-second dashboard film is recorded as an edited composition of real tool captures, the agent's actual source change, and a matched empty-state replay. See [the film evidence and reproduction notes](demo/dashboard-film.md). The local MP4 is `.screen-explorer/demo/dashboard-film/screen-explorer-demo-v1.mp4`.

The selected target is Refine Finefoods Material UI. The film demonstrates a concrete empty-state improvement. Baseline replay did not match and recovery was unsupported, so neither is presented as verified.

The clip is silent and has not been published. Native AI-client chat recording and sound design are optional next production steps; the first cut uses the actual MCP outputs and source patch instead of simulated chat messages.
