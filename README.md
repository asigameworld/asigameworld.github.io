# ASIWorld project website

Project landing page for **ASIWorld: Benchmarking Autonomous Agents in a Persistent Survival Sandbox**.

Benchmark: https://asigameworld.github.io/benchmark/

The root URL currently redirects to the benchmark and preserves query parameters and section anchors. It is reserved for a future project homepage.

## Update the website

This is a static site with no build step or package dependencies.

- `index.html`: temporary root redirect to `/benchmark/`.
- `benchmark/index.html`: benchmark text, authors, figures, and results.
- `style.css`: visual design and responsive layout.
- `assets/`: figures and favicon. Figures are adapted from the current manuscript.

Preview locally from this directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/benchmark/. After reviewing changes:

```sh
git pull --ff-only origin main
git add index.html benchmark/index.html style.css assets
git commit -m "Update project website"
git push origin main
```

GitHub Pages should be configured under **Settings → Pages → Deploy from a branch → main → / (root)**. GitHub republishes the site after pushes to `main`.

Paper and code links are intentionally marked “Coming soon” until public release URLs are available. Add the actual links when released.
