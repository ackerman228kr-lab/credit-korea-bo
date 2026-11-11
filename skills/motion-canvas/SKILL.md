---
name: motion-canvas
description: Make animations and motion graphics in code with Motion Canvas (TypeScript generator scenes, @motion-canvas/2d) and render them headlessly to MP4. Use when the user asks for Motion Canvas, or for code-driven explainer animation, animated diagrams, math/code animations, or precisely timed vector motion graphics.
---

# Motion Canvas

Motion Canvas 3.17.2: scenes are TypeScript generator functions (`yield* node().prop(value, seconds)`), rendered by a Vite editor in the browser. This skill ships a ready project template and a headless renderer.

## New project
```bash
cp -R ~/.claude/skills/motion-canvas/template ./my-animation
cd my-animation && npm install --no-audit --no-fund
```
Edit `src/scenes/*.tsx`, register scenes in `src/project.ts`.

## Render to MP4 (no window)
```bash
npm run render        # -> output/project.mp4
```
`render.mjs` starts Vite, opens the editor in headless Chromium (preinstalled Playwright), selects the FFmpeg exporter and clicks RENDER. Default output is 1920x1080 @ 60 fps.

## Size / fps / vertical 9:16
Resolution, fps and background live in `src/project.meta` (created on first run of the editor). For vertical shorts set `"size": {"x": 1080, "y": 1920}` and `"fps": 30` under `shared`, and the same values under `rendering`. After render, check with
`ffprobe -v error -show_entries stream=width,height,r_frame_rate:format=duration -of compact output/project.mp4`.

## Preview for the user
`npm start` serves the editor (default port 9000); report the port so the user can open it.

## Notes
- Do not add `"type": "module"` to package.json: the Vite plugins then fail to load ("motionCanvas is not a function").
- Audio: `makeProject({scenes, audio: audioFile})` with `import audioFile from '../audio/voice.mp3'` — the FFmpeg exporter muxes it.
- Docs: https://motioncanvas.io/docs/
