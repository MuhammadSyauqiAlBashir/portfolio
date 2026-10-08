# Portfolio: Muhammad Syauqi Al Bashir

Data & Integration Engineer (Google Cloud). Live at **https://syauqi.bashir.my.id**.

A hand-built static site: plain HTML, CSS and ES modules, no frameworks, no external scripts, fonts or trackers,
served by Caddy on my own server with a strict Content Security Policy. Light and dark themes.

Each project page has screenshots and short loops recorded on scratch copies with made-up data, plus a small demo
that runs in your browser: a 3D dice throw and a projective-plane card game, live pitch tracking (YIN), a bank-email
parser with redaction, zero-based budgeting, a family-set price builder, tap-to-sync lyrics, an explainable job
score, and an animated video-clipping pipeline.

```bash
python3 tools/build.py        # generate site/ from tools/content.py
cd site && python3 -m http.server 8601
```

Content © Muhammad Syauqi Al Bashir. Third-party footage is credited on the page where it appears.
