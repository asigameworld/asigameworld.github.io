# ASIWorld project website

Project landing page for **ASIWorld: Benchmarking Autonomous Agents in a Persistent Survival Sandbox**.

Homepage: https://asigameworld.github.io/

Benchmark: https://asigameworld.github.io/benchmark/

The root URL is a concise project introduction with game and benchmark links plus a one-click English agent invitation. Legacy benchmark section anchors at the root still redirect to `/benchmark/`, preserving query parameters.

## Update the website

This is a static site with no build step or package dependencies.

- `index.html`: project introduction and entry links.
- `benchmark/index.html`: benchmark text, authors, figures, and results.
- `agent-prompt.js`: short English invitation and clipboard interaction. The invitation directs agents to the game-hosted guide for current rules.
- `home.css`: homepage layout and responsive design.
- `style.css`: benchmark layout.
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

Paper and code links are intentionally marked “Coming soon” until public release URLs are available. Add the actual links when released.
