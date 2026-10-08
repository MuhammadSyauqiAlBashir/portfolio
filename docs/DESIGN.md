# Portfolio — design (2026-10-08)

Public portfolio of **Muhammad Syauqi Al Bashir** at **https://syauqi.bashir.my.id**: his CV and professional profile
plus case studies of the apps he built and runs on his own server, shown through screenshots, short videos and
small playable demos (the real apps are private, behind login).

## 1. Owner decisions (interview 2026-10-08)

| Topic | Decision |
|---|---|
| Address | `syauqi.bashir.my.id`, static site on his own VPS (Caddy `file_server`), Rp0, no card |
| Repo | `MuhammadSyauqiAlBashir/portfolio`, **public**, default branch `develop`; flow: commit on develop → push → PR → merge to `main` |
| Language | English only |
| Style | Calm premium, light + dark (automatic + toggle) |
| Headline | **Data & Integration Engineer · Google Cloud** (same as the 2026 CV) |
| Public contact | Email, LinkedIn, GitHub, downloadable CV (PDF), phone/WhatsApp, location + "open to remote & relocation" |
| Projects | All: Clip Studio, BashGames, Financial Management, Couple Suits, lyrsync, JobRadar, Monotaro work, the self-hosted platform |
| Showing private apps | 3 layers: (1) screenshots + short looping videos recorded with Playwright on **scratch copies with fake data**, (2) **playable mini-demos** that run in the visitor's browser (no account, no backend), (3) case-study pages (problem, what he built, architecture, decisions, stack) |
| Live links | Each app links to its real address with a "Private · login required" badge; the shop storefront is public (normal link) |
| Clip Studio output pages | **Not linked** (side hustle kept separate); demo footage only |
| Photo | Owner sends one; initials monogram until then |
| Visitor stats | None |

## 2. Content sources (facts only from these)

- `~/jobradar/docs/CV_Muhammad-Syauqi-Al-Bashir_2026.pdf` (the master CV) and `~/jobradar/docs/candidate-profile.md`.
- Each app's `CLAUDE.md` / README in its repo; server facts in `~/.claude/CLAUDE.md`.
- Rules from the profile:
  - The title is **IT Engineer** at Monotaro.
  - Say "billions of rupiah in sales", never the exact figure.
  - Skills rated ≤ 2 → "working proficiency".
  - Present the work honestly as **AI-assisted development**; no invented numbers.
- **Never publish:** family details, salary floors, personal exclusions (values list), anything confidential from
  Monotaro (no internal screens, names or numbers beyond the CV), real finance data, Nintendo character names from
  the BashGames minigames, Clip Studio's brand/accounts, secrets, server internals that help attackers (exact
  ports/usernames/paths are fine at a high level only).

## 3. Structure

- `index.html`: hero (photo, name, headline, availability, CTA: CV / email / LinkedIn / GitHub / WhatsApp),
  key numbers, experience (Monotaro highlights, earlier career), featured projects grid, the platform, skills,
  education & certifications, contact.
- `projects/<slug>.html` (one per project): hero media, problem, what I built, feature highlights (screenshot or
  video + one line each), "Try it" mini-demo, how it works (SVG architecture), engineering notes, stack, links.
- `assets/`: CSS, JS (plain ES modules, no frameworks, no external scripts), images (WebP), videos (MP4/H.264, short,
  muted, looping, 540–720p), the public CV PDF, icons (inline SVG).
- Mini-demos (`assets/js/demos/*.js`), all client-only:

  | Project | Mini-demo |
  |---|---|
  | BashGames | 3D dice roll; Spot-the-twin card round |
  | Karaoke (BashGames) | Sing into the mic: live pitch line over a public-domain melody (mic stays in the browser) |
  | Financial Management | Bank-email parser + redaction on a fake sample email; zero-based envelope budgeting |
  | Clip Studio | Animated pipeline: transcript → loudness → moment → face crop → karaoke captions (synthetic) |
  | lyrsync | Synced-lyrics player with tap-to-sync (public-domain lyrics) |
  | JobRadar | Scoring explainer: move the weights, sample jobs re-score live |
  | Couple Suits | Family-set builder with the family discount (3+ people 5 %, 5+ 10 %) |

## 4. Media capture (no real data)

Playwright (Chromium) against scratch copies only, never production data:
- Financial Management: a scratch database seeded with a made-up couple's month;
- BashGames: scratch database with test players (Andi, Maya, Rafi, Dinda), English UI, no AI calls;
- Couple Suits: the public storefront (demo catalog, browsing only) and older scratch admin shots (AI-generated designs);
- lyrsync: scratch copy, "Amazing Grace" (1779 words, public domain);
- JobRadar: a scratch database with fictional jobs;
- Clip Studio: an isolated copy with only transcription/AI keys (no posting tokens, auto-post off) run on a
  **CC BY 3.0** interview from Wikimedia Commons, credited on the page; nothing was posted.

Phone shots 390×844 @2x (saved 600 px wide), desktop 1440×900 (1200 px). Loops: Playwright video → FFmpeg MP4
(H.264) + WebM (VP9), muted, 540 px wide, with a WebP poster. The capture scripts stay outside this public repo
because they use scratch credentials.

## 5. Hosting & security

Caddy site block `deploy/Caddyfile.portfolio` (root `/srv/portfolio`, `file_server`, gzip/zstd, long cache for
`/assets/*`), the shared `(security)` snippet, strict CSP (`default-src 'self'`, no inline scripts, `media-src 'self'`,
`img-src 'self' data:`), Permissions-Policy `microphone=(self)` (karaoke demo only), everything else off.
Deploy: `deploy/deploy.sh` builds, rsyncs `site/` → `/srv/portfolio`, and (only if the block changed) backs up the Caddyfile, writes the
managed block, validates and reloads Caddy. 404 page, `robots.txt` and `sitemap.xml` are generated.
