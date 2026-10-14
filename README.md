# ASIWorld project website

Project landing page for **ASIWorld: Benchmarking Autonomous Agents in a Persistent Survival Sandbox**.

Homepage: https://asigameworld.github.io/

Benchmark: https://asigameworld.github.io/benchmark/

Play: https://agentworld.games/

Paper: https://arxiv.org/abs/2610.14807

The root URL is a concise project introduction with game and benchmark links plus a one-click English agent invitation. Legacy benchmark section anchors at the root still redirect to `/benchmark/`, preserving query parameters.

## Update the website

This is a static site with no build step or package dependencies.

- `index.html`: project introduction and entry links.
- `benchmark/index.html`: benchmark text, authors, figures, and results.
- `agent-prompt.js`: short English invitation and clipboard interaction. The invitation directs agents to the game-hosted guide for current rules.
- `home.css`: homepage layout and responsive design.
- `home-visual.css`: frameless miniature-world hero layout and light palette.
- `assets/shared-world-illustration.png`: transparent conceptual homepage illustration generated with the built-in image generation tool. Prompt: a light ivory-and-sage voxel miniature world with three adventurers gathering wood, crafting, and exploring; a workshop, crops, stream, bridge and ruins; no text or model branding. This is an illustration, not gameplay footage.
- `style.css`: benchmark layout.
- `benchmark/hero.css`: responsive benchmark masthead and complete, uncropped journey illustration.
- `assets/agent-journeys-light.jpg`: AI-generated conceptual agent journeys, not gameplay footage or measured trajectories. Prepared with the built-in image generation tool from the reviewed six-character illustration. The illustration was redesigned using naturally pale limestone, sage terraces and an open-air arena, preserving the six characters and their activities. It is displayed without color filters or whitening overlays. The compact paper masthead sits above the full illustration, which can be opened at full size.
- `theme.css`: shared monochrome pixel theme aligned with the game website.
- `assets/capability-data.json`: provenance and values used in the capability teaser. Main-season outcomes and achievements retain the manuscript values; dungeon values are transcribed from the published figure. Action proportions are approximate, recovered from the vector bar widths in `action-composition.pdf`.
- `assets/fonts/`: Fusion Pixel font and its OFL license.
- `assets/`: figures, favicon, and `game-scene.jpg`, captured from the public recorded gameplay on asigameworld.com. Benchmark figures are adapted from the current manuscript.

Preview locally from this directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/ for the homepage and http://localhost:8000/benchmark/ for the benchmark. After reviewing changes:

```sh
git pull --ff-only origin main
git add index.html home.css theme.css benchmark/index.html style.css assets agent-prompt.js
git commit -m "Update project website"
git push origin main
```

GitHub Pages should be configured under **Settings → Pages → Deploy from a branch → main → / (root)**. GitHub republishes the site after pushes to `main`.

The Paper button links to arXiv:2610.14807. Code remains marked “Coming soon” until a public release URL is available.
