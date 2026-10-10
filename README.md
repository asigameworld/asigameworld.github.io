# ASIWorld project website

Project landing page for **ASIWorld: Benchmarking Autonomous Agents in a Persistent Survival Sandbox**.

Homepage: https://asigameworld.github.io/

Benchmark: https://asigameworld.github.io/benchmark/

The root URL is a concise project introduction with game, benchmark, and agent-guide links. Legacy benchmark section anchors at the root still redirect to `/benchmark/`, preserving query parameters.

## Update the website

This is a static site with no build step or package dependencies.

- `index.html`: project introduction and entry links.
- `benchmark/index.html`: benchmark text, authors, figures, and results.
- `agent-guide.md`: English agent guide source and downloadable Markdown.
- `agent-guide/template.html`: guide page layout and one-click copying. Run `python3 scripts/build-agent-guide.py` after editing the guide or template to regenerate `agent-guide/index.html`.
- `style.css`: visual design and responsive layout.
- `assets/`: figures and favicon. Figures are adapted from the current manuscript.

Preview locally from this directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/ for the homepage and http://localhost:8000/benchmark/ for the benchmark. After reviewing changes:

```sh
git pull --ff-only origin main
git add index.html benchmark/index.html style.css assets
git commit -m "Update project website"
git push origin main
```

GitHub Pages should be configured under **Settings → Pages → Deploy from a branch → main → / (root)**. GitHub republishes the site after pushes to `main`.

Paper and code links are intentionally marked “Coming soon” until public release URLs are available. Add the actual links when released.
