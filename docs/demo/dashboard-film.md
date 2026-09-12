# Dashboard film v1

Local output: `.screen-explorer/demo/dashboard-film/screen-explorer-demo-v1.mp4`.

40 seconds, 1920 × 1080, 30 fps, H.264, silent. This is a composed edit of real MCP tool captures and the actual code change, with fades, image framing, and staggered state reveals. It is not a continuous screen recording or a recording of a native AI client's chat UI. The footer labels the edited sequence and condensed capture time.

## What actually happened

1. A stdio MCP client invoked `explore_states` on the local Finefoods product dashboard with matcher `api.finefoods.refine.dev/products`.
2. The coding agent received and viewed the returned multi-state image, then requested and viewed the full-size empty-state image through `inspect_states`.
3. The observed empty collection displayed a bare “No rows” message. The agent made a focused source change to provide a useful heading, explanation, and add-product link, using the target's existing MUI components.
4. A second `explore_states` call captured the changed UI. The agent inspected its image.
5. `replay_state` reconstructed the empty state after the change, and its visible DOM text matched.

This was an observed UX improvement, not a claim that a functional bug was discovered. No defective screen was planted for the demonstration.

## Source and reproduction

Target: [Refine Finefoods Material UI](https://github.com/refinedev/refine/tree/main/examples/finefoods-material-ui), revision `2352eb5b6539e2f39ad9aef652279ad1dcf2c467`.

The isolated local checkout is `/private/tmp/screen-explorer-refine/examples/finefoods-material-ui`, served by Vite on fixed target port **5188** with strict-port behavior. This is the target app, not another Screen Explorer dashboard. Screen Explorer remains **4174**.

The example's source referenced unpublished package versions. For the local run, its Refine dependencies were pinned to available releases: core 5.0.12, mui 8.0.2, cli 2.16.52, kbar 2.0.1, react-hook-form 5.0.4, react-router 2.0.4, react-table 6.0.1, and simple-rest 6.0.1. The target uses its original public sample REST API and automatic demo login; no private account was used or changed.

The [empty-state patch](finefoods-empty-state.patch) contains the source improvement, separately from dependency setup. It leaves the error-state overlay unchanged. The full target type check has four pre-existing errors in courier create/edit forms caused by the target's dependency/type combination; the changed product file has no reported type errors. This is not a production-ready upstream patch or an all-target build pass.

## Evidence

- Before run: `run_b9c96fa1-9106-4fe6-8267-e75e2ac852ed`.
- After run: `run_f588afb4-df3a-4cf7-ba59-380d99a268e7`.
- Empty state: replay matched before and after, plus a separate post-change replay matched.
- The baseline replay did not match. Other live requests, including category loading, remain outside the selected fixture. Do not claim all-state repeatability.
- Recovery was unsupported; no recorded retry control was available. The film does not claim recovery was demonstrated.
- The failure capture shows the UI under an injected failure at the engine's observation time, not proof that the final settled error UI is permanently missing.

Call arguments and timing, full tool output, raw PNGs, the compositor script, and QA frames are saved in `.screen-explorer/demo/dashboard-film/`. The renderer uses the bundled Python/Pillow runtime and local ffmpeg. Private run files and the MP4 are Git-ignored.

The clip has been checked via sampled rendered frames and decoding. It has not been published. v1 establishes the story and visual direction; sound design and a live client recording can be added in a later edit.

## Motion revision v2

Local output: `.screen-explorer/demo/dashboard-film/screen-explorer-demo-v2.mp4` (36 seconds, 1080p, 30 fps, silent). The v1 file is preserved.

Replaces the scene-wide fades with persistent card transitions: dashboard-to-state-grid expansion, a selected-state zoom, opposing vertical transitions into the edit, and an aligned before/after wipe. Headlines enter in staggered lines, with restrained settling motion on the cards. The evidence and verification scope are unchanged. The source-edit scene presents the actual implemented UI strings as an editorial summary instead of small code text.

Renderer: `.screen-explorer/demo/dashboard-film/render-film-v2.py`. Transition frames and the closing frame were visually reviewed; the complete H.264 output decoded without errors.

## Personal-project motion revision v3

Local output: `.screen-explorer/demo/dashboard-film/screen-explorer-demo-v3.mp4` (36 seconds, 1920 × 1080, 30 fps, silent). Both earlier cuts are preserved.

Uses Avenir Next with selective Georgia italic accents, warm ivory, and first-person copy identifying this as a side project by Hunter. An original rounded viewfinder character blinks and tilts; letters arrive in a staggered spring motion, state cards fan out with more rotation, source-edit rows enter sequentially, and an animated pen circle points to the observed empty-state message. The before/after handle uses drawn arrows to avoid missing font glyphs.

Renderer: `.screen-explorer/demo/dashboard-film/render-film-v3.py`. Sampled transition frames and the before/after frame were visually inspected. The complete H.264 file decoded without errors. The underlying captures, source change, and evidence limitations above are unchanged; this is still an edited film, not continuous client footage.


## Music-backed v3

Local output: `.screen-explorer/demo/dashboard-film/screen-explorer-demo-v3-music.mp4`. The silent v3 remains available.

Uses the first 36 seconds of **Bossa Antigua** by Kevin MacLeod, with a 0.5-second opening fade and 2.8-second closing fade. The composer lists guitar, bass and drums at 70 BPM. The track is available under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) on the [composer’s track page](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700069). Attribution is required; it appears on the closing frame, with a copyable `MUSIC-CREDIT.txt` beside the export. Include that credit in the description when publishing. The source page and track metadata are saved alongside the local audio.

The underlying evidence and limitations are unchanged. No music or video has been published.

## Upbeat cut without required attribution

Local output: `.screen-explorer/demo/dashboard-film/screen-explorer-demo-v3-upbeat.mp4`. Uses **Upbeat Jazz** by Francisco Alvear (Mixkit track 644), listed on https://mixkit.co/free-stock-music/jazz/ under the Mixkit Stock Music Free License. Mixkit permits use without attribution, and its music license permits web/social media video projects: https://mixkit.co/license/#musicFree. Source pages and `UPBEAT-MUSIC-LICENSE.txt` are saved beside the export.

The 36-second mix uses loudness normalization, short opening/closing fades, and quiet locally synthesized wooden taps at the card and title entrances. `mix-upbeat.py` reproduces the mix. Video is copied from the silent v3, so it has no music credit overlay. The previous Bossa Antigua cut and its attribution remain intact. The new export decoded without errors; no publication occurred.

## Electronic candidate v4

Local output: `.screen-explorer/demo/dashboard-film/screen-explorer-demo-v4-electronic.mp4`. Replaces the rejected jazz mix with **Digital Clouds** by Alejandro Magaña (A. M.), Mixkit track 175, under the same no-attribution Stock Music Free License for web/social video use. Track source: https://mixkit.co/free-stock-music/chillout/. Saved provenance: `electronic-track-source.html` and `ELECTRONIC-MUSIC-LICENSE.txt`.

Removes synthesized transition taps. The source audio's estimated pulse is 128.98 BPM; `analyze-pulse.py` estimates period/phase from low-frequency spectral flux. `render-film-v4.py` maps seven settled reveals to that pulse, moving them by at most 0.13 seconds; `v4-timing.json` records the mapping. This is a signal-based timing estimate, not an auditory assessment. Visual design and underlying evidence remain the same.

Export: 36 seconds, 1080p/30fps, H.264/AAC. Audio measured -22.98 LUFS integrated and -7.82 dBTP after encoding. Full decode passed, and a sampled retimed landing frame was inspected. The agent could not audition the track directly; musical fit remains for user review. Previous cuts are preserved.
