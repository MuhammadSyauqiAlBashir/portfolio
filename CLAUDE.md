# Portfolio: project context for Claude

Public portfolio of Muhammad Syauqi Al Bashir at **https://syauqi.bashir.my.id**: CV, profile and case studies of
the apps he built, with screenshots, short loops and in-browser mini-demos. Design and decisions: `docs/DESIGN.md`.
Server impact: `docs/SERVER-FOOTPRINT.md`. Private context (owner, working style, capture setup) is in the
git-ignored `CLAUDE.local.md`. **This repo is PUBLIC: never commit anything private.**

## Rules

- Never publish: family details, salary floors, personal exclusions, anything confidential from Monotaro (CV-level
  description only), real finance data, Nintendo-named minigames, Clip Studio's brand/accounts, secrets, server
  internals that would help an attacker (ports/paths only at a high level).
- Facts only from the master CV and the candidate profile in the JobRadar repo, and from each app's own docs.
  Title "IT Engineer"; "billions of rupiah in sales" (never the figure); skills rated ≤ 2 = "working proficiency";
  the work is presented honestly as AI-assisted development.
- English only. Calm premium look, light + dark. Plain HTML/CSS/ES modules: no frameworks, no external scripts,
  fonts or trackers. No inline scripts or inline `style` attributes (strict CSP): style changes from JS go through
  the CSSOM (`el.style.x = …`), which CSP allows.
- Screenshots/loops come only from scratch copies with made-up data (or the public shop storefront). Third-party
  footage must be Creative Commons with derivatives allowed and credited on the page.

## Layout

| Path | What |
|---|---|
| `tools/content.py` | All text: profile, experience, skills, projects (highlights, demos, flows, notes) |
| `tools/build.py` | Generates `site/index.html`, `site/projects/*.html`, `404.html`, `robots.txt`, `sitemap.xml`, `assets/css/accents.css`; cache-busts CSS/JS with a content hash; lists missing media |
| `tools/make_icons.py` | Favicon, Apple touch icon, `og.png` (needs Pillow) |
| `site/assets/css/site.css` | All styles (theme tokens on `:root`, dark via `prefers-color-scheme` + `data-theme`) |
| `site/assets/js/` | `theme.js` (before paint), `main.js` (toggle, reveal, loops play only when visible, lazy demos), `demos/*.js` |
| `site/assets/media/` | `<name>.webp` stills, `<name>.mp4` + `.webm` loops (+ `.webp` poster), `credits-<slug>.html` |
| `site/assets/cv/` | The public CV PDF (same as the master CV) |
| `deploy/` | `Caddyfile.portfolio`, `deploy.sh` |

Media naming: a project's `cover` / `highlights` refer to names in `site/assets/media`; an `.mp4` next to a `.webp`
turns the still into a muted loop (with the WebP as poster). Phone shots 390×844 @2x saved at 600 px wide; desktop
1440×900 at 1200 px.

## Mini-demos (`site/assets/js/demos/`)

`dice.js` (BashGames 3D die ported from `bashgames/web/js/games/common.js` + Spot the Twin deck), `karaoke.js` (YIN
pitch from BashGames `audiokit.js`, own worklet `tap-worklet.js`; mic only, nothing uploaded), `parser.js` +
`envelopes.js` (finance parser/redaction port and zero-based budget), `familyset.js` (shop discount 3+ = 5 %,
5+ = 10 %), `lyrics.js` (tap-to-sync), `score.js` (JobRadar weights + caps 60/40), `clippipe.js` (Clip Studio
pipeline animation). Songs used: Twinkle Twinkle Little Star (public domain).

## Build, check, deploy

```bash
python3 tools/build.py                     # writes site/
cd site && python3 -m http.server 8601 --bind 127.0.0.1   # local preview
./deploy/deploy.sh                         # build → /srv/portfolio → Caddy block (backup + validate + reload)
```

Before deploying UI changes: screenshot phone + desktop, light + dark, and check there is no horizontal scroll.

## Git

Work on `develop` → push → PR → merge to `main` (owner's flow for this repo). Default branch is `develop`.
