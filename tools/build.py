#!/usr/bin/env python3
"""Builds the static site into site/ from tools/content.py.

    python3 tools/build.py          # writes site/index.html, site/projects/*.html, site/assets/css/accents.css

Media (screenshots / loops) live in site/assets/media/<name>.webp and optionally <name>.mp4 (a muted loop that
replaces the still). Anything missing renders as a neutral placeholder, so the build never fails on media.
"""
from __future__ import annotations

import hashlib
import html
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
MEDIA = SITE / "assets" / "media"
sys.path.insert(0, str(ROOT / "tools"))
import content as C  # noqa: E402

e = html.escape


def ver() -> str:
    """Cache-busting version: hash of the CSS + JS, so a deploy always serves fresh assets."""
    h = hashlib.sha256()
    for p in sorted((SITE / "assets").rglob("*")):
        if p.suffix in (".css", ".js") and p.is_file():
            h.update(p.read_bytes())
    return h.hexdigest()[:10]


V = ""


# ---------------------------------------------------------------------------------------------------------------
# small pieces
# ---------------------------------------------------------------------------------------------------------------
ICONS = {  # Lucide-style strokes (ISC), drawn inline so there are no extra requests
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    "file": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M12 12v6"/><path d="m9 15 3 3 3-3"/>',
    "in": '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    "code": '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    "chat": '<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.4A8.5 8.5 0 1 1 21 12z"/>',
    "pin": '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    "lock": '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "back": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    "ext": '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    "moon": '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    "play": '<path d="M7 4v16l13-8z"/>',
    "check": '<path d="M5 12.5 10 17 19 7"/>',
}


def icon(name: str, cls: str = "i") -> str:
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>')


def has(name: str, ext: str) -> bool:
    return (MEDIA / f"{name}.{ext}").exists()


def media(name: str, kind: str, alt: str, rel: str, eager: bool = False) -> str:
    """A screenshot or loop in a device frame. kind: phone | desktop | wide."""
    load = "eager" if eager else "lazy"
    src = f"{rel}assets/media/{name}"
    if has(name, "mp4"):
        poster = f' poster="{src}.webp"' if has(name, "webp") else ""
        webm = f'<source src="{src}.webm" type="video/webm">' if has(name, "webm") else ""
        inner = (f'<video class="m"{poster} muted loop playsinline preload="none" data-autoplay aria-label="{e(alt)}">'
                 f'<source src="{src}.mp4" type="video/mp4">{webm}</video>')
    elif has(name, "webp"):
        w, h = dims(name)
        inner = f'<img class="m" src="{src}.webp" alt="{e(alt)}" loading="{load}" decoding="async" width="{w}" height="{h}">'
    else:
        inner = f'<div class="m ph" role="img" aria-label="{e(alt)}"><span>{e(alt)}</span></div>'
    return f'<div class="frame {kind}">{inner}</div>'


def dims(name: str) -> tuple[int, int]:
    """WebP size from the header (VP8/VP8L/VP8X) without Pillow."""
    b = (MEDIA / f"{name}.webp").read_bytes()[:40]
    fmt = b[12:16]
    if fmt == b"VP8X":
        return 1 + int.from_bytes(b[24:27], "little"), 1 + int.from_bytes(b[27:30], "little")
    if fmt == b"VP8L":
        bits = int.from_bytes(b[21:25], "little")
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    return int.from_bytes(b[26:28], "little") & 0x3FFF, int.from_bytes(b[28:30], "little") & 0x3FFF


def chips(items, cls="chip") -> str:
    return "".join(f'<li class="{cls}">{e(x)}</li>' for x in items)


def link_badges(p, rel) -> str:
    out = []
    for url, label in p["links"]:
        private = label == C.PRIVATE
        host = url.split("//", 1)[1]
        out.append(f'<a class="live{" private" if private else ""}" href="{url}" rel="noopener" target="_blank">'
                   f'{icon("lock" if private else "globe")}<span><b>{e(host)}</b><small>{e(label)}</small></span></a>')
    return "".join(out)


# ---------------------------------------------------------------------------------------------------------------
# diagrams (inline SVG, no styles: CSP allows presentation attributes)
# ---------------------------------------------------------------------------------------------------------------
def flow(steps: list[str]) -> str:
    items = "".join(f'<li><span class="n">{i + 1}</span>{e(s)}</li>' for i, s in enumerate(steps))
    return f'<ol class="flow">{items}</ol>'


def platform_svg() -> str:
    apps = ["Finance", "lyrsync", "Shop", "Shop admin", "BashGames", "Clip Studio", "JobRadar"]
    rows = []
    for i, a in enumerate(apps):
        x = 24 + (i % 4) * 138
        y = 176 + (i // 4) * 58
        rows.append(f'<rect x="{x}" y="{y}" width="126" height="44" rx="10" class="d-box"/>'
                    f'<text x="{x + 63}" y="{y + 27}" class="d-t" text-anchor="middle">{a}</text>')
    return f'''<svg class="diagram" viewBox="0 0 600 360" role="img" aria-label="Server architecture diagram">
  <rect x="200" y="14" width="200" height="40" rx="20" class="d-pill"/><text x="300" y="39" class="d-t" text-anchor="middle">Internet · HTTPS / HTTP3</text>
  <path d="M300 54v22" class="d-line"/>
  <rect x="24" y="76" width="552" height="60" rx="12" class="d-acc"/>
  <text x="300" y="101" class="d-h" text-anchor="middle">Firewall (cloud + ufw) · Caddy reverse proxy</text>
  <text x="300" y="121" class="d-s" text-anchor="middle">TLS by Let's Encrypt · strict security headers per site · SSH: key + TOTP</text>
  <path d="M300 136v14" class="d-line"/>
  <text x="24" y="166" class="d-s">Each app: own Linux user · sandboxed systemd unit · memory/CPU caps · localhost only</text>
  {"".join(rows)}
  <rect x="24" y="300" width="270" height="44" rx="10" class="d-box2"/><text x="159" y="327" class="d-t" text-anchor="middle">Shared login + PocketBase</text>
  <rect x="306" y="300" width="270" height="44" rx="10" class="d-box2"/><text x="441" y="327" class="d-t" text-anchor="middle">Nightly verified backups → Drive</text>
</svg>'''


def work_svg() -> str:
    return '''<svg class="diagram" viewBox="0 0 600 300" role="img" aria-label="SAP to Magento integration diagram">
  <rect x="20" y="40" width="150" height="70" rx="12" class="d-box"/><text x="95" y="72" class="d-h" text-anchor="middle">Customer SAP</text><text x="95" y="92" class="d-s" text-anchor="middle">their ERP</text>
  <rect x="225" y="30" width="150" height="90" rx="12" class="d-acc"/><text x="300" y="66" class="d-h" text-anchor="middle">Oracle APEX</text><text x="300" y="86" class="d-s" text-anchor="middle">middle system</text>
  <rect x="430" y="40" width="150" height="70" rx="12" class="d-box"/><text x="505" y="72" class="d-h" text-anchor="middle">Magento store</text><text x="505" y="92" class="d-s" text-anchor="middle">catalog · prices</text>
  <path d="M170 66h55M375 66h55" class="d-line"/><path d="M225 86h-55M430 86h-55" class="d-line dash"/>
  <rect x="20" y="170" width="560" height="110" rx="14" class="d-box2"/>
  <text x="300" y="196" class="d-h" text-anchor="middle">Google Cloud data platform</text>
  <rect x="40" y="212" width="120" height="48" rx="10" class="d-box"/><text x="100" y="241" class="d-t" text-anchor="middle">Scheduler</text>
  <rect x="175" y="212" width="120" height="48" rx="10" class="d-box"/><text x="235" y="241" class="d-t" text-anchor="middle">Workflows</text>
  <rect x="310" y="212" width="120" height="48" rx="10" class="d-box"/><text x="370" y="241" class="d-t" text-anchor="middle">Cloud Run</text>
  <rect x="445" y="212" width="115" height="48" rx="10" class="d-box"/><text x="502" y="235" class="d-t" text-anchor="middle">Dataform ·</text><text x="502" y="251" class="d-t" text-anchor="middle">BigQuery</text>
  <path d="M160 236h15M295 236h15M430 236h15" class="d-line"/>
  <text x="300" y="150" class="d-s" text-anchor="middle">~7–9 million records synced per day</text>
</svg>'''


def cover(p, rel, eager=False) -> str:
    if p["cover_kind"] == "svg":
        return f'<div class="frame svgf">{platform_svg() if p["slug"] == "platform" else work_svg()}</div>'
    return media(p["cover"], p["cover_kind"], f'{p["name"]} screenshot', rel, eager)


# ---------------------------------------------------------------------------------------------------------------
# layout
# ---------------------------------------------------------------------------------------------------------------
def page(title: str, desc: str, body: str, rel: str, path: str, slug: str = "") -> str:
    canonical = f"{C.SITE}/{path}"
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="author" content="{e(C.NAME)}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f7f5f1" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0f1012" media="(prefers-color-scheme: dark)">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{C.SITE}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{rel}assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{rel}assets/apple-touch-icon.png">
<link rel="stylesheet" href="{rel}assets/css/site.css?v={V}">
<link rel="stylesheet" href="{rel}assets/css/accents.css?v={V}">
<script src="{rel}assets/js/theme.js?v={V}"></script>
<script type="module" src="{rel}assets/js/main.js?v={V}"></script>
</head>
<body{f' data-p="{slug}"' if slug else ''}>
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <div class="wrap bar">
    <a class="brand" href="{rel}index.html" aria-label="Home">{monogram("sm")}<span>{e(C.NAME)}</span></a>
    <nav class="nav" aria-label="Main">
      <a href="{rel}index.html#work">Work</a><a href="{rel}index.html#projects">Projects</a><a href="{rel}index.html#skills">Skills</a><a href="{rel}index.html#contact">Contact</a>
    </nav>
    <button class="theme" type="button" aria-label="Switch light or dark theme">{icon("sun", "i sun")}{icon("moon", "i moon")}</button>
  </div>
</header>
<main id="main">
{body}
</main>
<footer class="foot">
  <div class="wrap">
    <p>© 2026 {e(C.NAME)}. Hand-built static site, hosted on my own server. No trackers, no cookies.</p>
    <p><a href="{C.GITHUB}/portfolio" rel="noopener" target="_blank">Source on GitHub</a> · <a href="{rel}index.html#contact">Contact</a></p>
  </div>
</footer>
</body>
</html>
'''


def monogram(size="lg") -> str:
    photo = SITE / "assets" / "img" / "photo.webp"
    if photo.exists() and size == "lg":
        return '<img class="photo" src="assets/img/photo.webp" alt="Photo of Muhammad Syauqi Al Bashir" width="320" height="320">'
    return f'<span class="mono {size}" aria-hidden="true">SB</span>'


def contact_buttons() -> str:
    return f'''<div class="cta">
  <a class="btn primary" href="{C.CV_FILE}" download>{icon("file")}Download CV</a>
  <a class="btn" href="mailto:{C.EMAIL}">{icon("mail")}Email</a>
  <a class="btn" href="{C.LINKEDIN}" rel="noopener" target="_blank">{icon("in")}LinkedIn</a>
  <a class="btn" href="{C.GITHUB}" rel="noopener" target="_blank">{icon("code")}GitHub</a>
  <a class="btn" href="{C.WHATSAPP}" rel="noopener" target="_blank">{icon("chat")}WhatsApp</a>
</div>'''


# ---------------------------------------------------------------------------------------------------------------
# index
# ---------------------------------------------------------------------------------------------------------------
def index() -> str:
    nums = "".join(f'<li><b>{e(n)}</b><span>{e(t)}</span></li>' for n, t in C.NUMBERS)
    exp = []
    for x in C.EXPERIENCE:
        pts = "".join(f"<li>{p}</li>" for p in x["points"])
        role = f'<p class="role">{e(x["role"])}</p>' if x["role"] else ""
        more = (f'<a class="more" href="{x["link"][0]}">{e(x["link"][1])}{icon("arrow")}</a>' if x.get("link") else "")
        exp.append(f'''<article class="job reveal">
  <div class="when"><span>{e(x["when"])}</span><small>{e(x["where"])}</small></div>
  <div class="what"><h3>{e(x["org"])}</h3>{role}<p class="note">{e(x["note"])}</p><ul class="pts">{pts}</ul>{more}</div>
</article>''')
    cards = []
    for p in C.PROJECTS:
        cards.append(f'''<a class="card reveal" href="projects/{p["slug"]}.html" data-p="{p["slug"]}">
  <div class="shot">{cover(p, "")}</div>
  <div class="body"><h3>{e(p["name"])}</h3><p>{e(p["tagline"])}</p>
  <ul class="chips">{chips(p["stack"][:5])}</ul>
  <span class="more">Case study{icon("arrow")}</span></div>
</a>''')
    skills = "".join(f'<div class="sk reveal"><h3>{e(g)}</h3><ul class="chips">{chips(items)}</ul></div>' for g, items in C.SKILLS)
    edu = "".join(f'<li><div><b>{e(a)}</b><span>{e(b)}</span></div><small>{e(c)}</small></li>' for a, b, c in C.EDUCATION)
    certs = "".join(f'<li><div><b>{e(a)}</b><span>{e(b)}</span></div></li>' for a, b in C.CERTS)
    body = f'''
<section class="hero wrap">
  <div class="hero-text">
    <p class="eyebrow">{e(C.HEADLINE)}</p>
    <h1>{e(C.NAME)}</h1>
    <p class="lede">{e(C.INTRO)}</p>
    <ul class="meta"><li>{icon("pin")}{e(C.LOCATION)}</li><li class="ok">{icon("check")}{e(C.AVAILABILITY)}</li></ul>
    {contact_buttons()}
  </div>
  <div class="hero-pic">{monogram("lg")}</div>
</section>

<section class="wrap numbers" aria-label="Key numbers"><ul>{nums}</ul></section>

<section id="work" class="wrap sec">
  <div class="sec-h"><p class="eyebrow">Experience</p><h2>Where I work</h2></div>
  {"".join(exp)}
</section>

<section id="projects" class="wrap sec">
  <div class="sec-h"><p class="eyebrow">Projects</p><h2>Things I built and run</h2>
  <p class="sub">Six production apps on my own server, plus my work at Monotaro. The apps are private (family and personal use), so each case study shows screenshots and loops recorded on copies with made-up data, and a small demo you can try right here.</p></div>
  <div class="grid">{"".join(cards)}</div>
</section>

<section id="skills" class="wrap sec">
  <div class="sec-h"><p class="eyebrow">Skills</p><h2>What I work with</h2>
  <p class="sub">Strongest in Google Cloud data work, SQL and integrations. I build with AI coding assistants (Claude Code) and review, test and run everything myself.</p></div>
  <div class="skills">{skills}</div>
</section>

<section class="wrap sec two">
  <div class="reveal"><div class="sec-h"><p class="eyebrow">Education</p><h2>Learning</h2></div><ul class="list">{edu}</ul></div>
  <div class="reveal"><div class="sec-h"><p class="eyebrow">Languages & certificates</p><h2>Credentials</h2></div><ul class="list">{certs}</ul></div>
</section>

<section id="contact" class="wrap sec contact reveal">
  <div class="sec-h"><p class="eyebrow">Contact</p><h2>Let's talk</h2>
  <p class="sub">{e(C.AVAILABILITY)}. I usually reply within a day (UTC+7).</p></div>
  <ul class="contact-list">
    <li>{icon("mail")}<a href="mailto:{C.EMAIL}">{e(C.EMAIL)}</a></li>
    <li>{icon("chat")}<a href="{C.WHATSAPP}" rel="noopener" target="_blank">{e(C.PHONE)}</a><small>WhatsApp / phone</small></li>
    <li>{icon("in")}<a href="{C.LINKEDIN}" rel="noopener" target="_blank">linkedin.com/in/bashirsyauqi</a></li>
    <li>{icon("code")}<a href="{C.GITHUB}" rel="noopener" target="_blank">github.com/MuhammadSyauqiAlBashir</a></li>
    <li>{icon("pin")}<span>{e(C.LOCATION)}</span></li>
  </ul>
  <a class="btn primary" href="{C.CV_FILE}" download>{icon("file")}Download CV (PDF)</a>
</section>
'''
    return page(f"{C.NAME} · {C.HEADLINE}", C.INTRO, body, "", "")


# ---------------------------------------------------------------------------------------------------------------
# project pages
# ---------------------------------------------------------------------------------------------------------------
DEMO_EXTRA = {  # second demo on some pages
    "bashgames": ("karaoke", "Sing a line", "Hum or sing along: your phone or laptop tracks your pitch every 50 ms (YIN) and draws it over the melody, in any key. The microphone stays in your browser; nothing is uploaded."),
    "finance": ("envelopes", "Give every rupiah a job", "Zero-based budgeting: assign income to envelopes until nothing is left unassigned, as the app's monthly plan does."),
}


def demo_block(d) -> str:
    key, title, text = d
    return f'''<section class="demo reveal" aria-label="{e(title)}">
  <div class="demo-h"><p class="eyebrow">Try it</p><h3>{e(title)}</h3><p>{e(text)}</p></div>
  <div class="demo-body" data-demo="{key}"><noscript>This demo needs JavaScript.</noscript></div>
</section>'''


def project(p, i) -> str:
    rel = "../"
    built = "".join(f"<li>{b}</li>" for b in p["built"])
    notes = "".join(f"<li>{e(n)}</li>" for n in p["notes"])
    hl = "".join(f'<figure class="hl reveal">{media(n, k, cap, rel)}<figcaption>{e(cap)}</figcaption></figure>'
                 for n, k, cap in p["highlights"])
    demos = ""
    if p["demo"]:
        demos += demo_block(p["demo"])
    if p["slug"] in DEMO_EXTRA:
        demos += demo_block(DEMO_EXTRA[p["slug"]])
    prev_p, next_p = C.PROJECTS[i - 1], C.PROJECTS[(i + 1) % len(C.PROJECTS)]
    credit = ""
    if p["slug"] == "clipstudio":
        credit = ('<p class="credit">Demo footage: a Creative Commons video from Wikimedia Commons, credited in '
                  '<a href="#credits">Credits</a>. No real clips or accounts are shown.</p>')
    body = f'''
<section class="p-hero wrap">
  <a class="back" href="../index.html#projects">{icon("back")}All projects</a>
  <div class="p-top">
    <div>
      <p class="eyebrow">Case study</p>
      <h1>{e(p["name"])}</h1>
      <p class="lede">{e(p["tagline"])}</p>
      <ul class="chips">{chips(p["stack"])}</ul>
      <div class="lives">{link_badges(p, rel)}</div>
    </div>
    <div class="p-cover">{cover(p, rel, eager=True)}</div>
  </div>
</section>

<section class="wrap sec p-grid">
  <div class="reveal"><h2>The problem</h2><p>{e(p["problem"])}</p></div>
  <div class="reveal"><h2>What I built</h2><ul class="pts">{built}</ul></div>
</section>

{f'<section class="wrap sec"><h2 class="reveal">Highlights</h2><div class="hls">{hl}</div>{credit}</section>' if hl else ''}

{f'<section class="wrap sec">{demos}</section>' if demos else ''}

<section class="wrap sec">
  <h2 class="reveal">How it works</h2>
  {flow(p["flow"])}
</section>

<section class="wrap sec p-grid">
  <div class="reveal"><h2>Engineering notes</h2><ul class="pts">{notes}</ul></div>
  <div class="reveal"><h2>How I build</h2><p>Designed, built, tested and deployed by me with an AI coding assistant (Claude Code): I set the requirements, review every change, test on scratch copies with fake data, and run it in production.</p></div>
</section>

{credits(p)}

<nav class="wrap pn" aria-label="More projects">
  <a href="{prev_p["slug"]}.html">{icon("back")}<span><small>Previous</small>{e(prev_p["name"])}</span></a>
  <a href="{next_p["slug"]}.html"><span><small>Next</small>{e(next_p["name"])}</span>{icon("arrow")}</a>
</nav>
'''
    return page(f'{p["name"]} · {C.NAME}', p["tagline"], body, rel, f'projects/{p["slug"]}.html', p["slug"])


CREDITS = {}  # slug -> html, filled from site/assets/media/credits.py-style file if present


def credits(p) -> str:
    f = MEDIA / f'credits-{p["slug"]}.html'
    if not f.exists():
        return ""
    return f'<section id="credits" class="wrap sec credits"><h2>Credits</h2>{f.read_text()}</section>'


def accents() -> str:
    lines = ["/* generated by tools/build.py */"]
    for p in C.PROJECTS:
        lines.append(f'[data-p="{p["slug"]}"] {{ --pa: {p["accent"]}; }}')
    return "\n".join(lines) + "\n"


def main() -> None:
    global V
    (SITE / "assets" / "css" / "accents.css").write_text(accents())
    V = ver()
    (SITE / "projects").mkdir(parents=True, exist_ok=True)
    (SITE / "index.html").write_text(index())
    for i, p in enumerate(C.PROJECTS):
        (SITE / "projects" / f'{p["slug"]}.html').write_text(project(p, i))
    nf = ('<section class="wrap sec"><p class="eyebrow">404</p><h1>Page not found</h1>'
          '<p class="lede">That page does not exist. Try the home page or one of the projects.</p>'
          '<a class="btn primary" href="/index.html">Back to the home page</a></section>')
    (SITE / "404.html").write_text(page(f"Not found · {C.NAME}", "Page not found.", nf, "/", "404.html"))
    (SITE / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {C.SITE}/sitemap.xml\n")
    urls = [f"{C.SITE}/"] + [f'{C.SITE}/projects/{p["slug"]}.html' for p in C.PROJECTS]
    (SITE / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                                      + "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls) + "</urlset>\n")
    missing = sorted({n for p in C.PROJECTS for n, *_ in p["highlights"] if not (has(n, "webp") or has(n, "mp4"))}
                     | {p["cover"] for p in C.PROJECTS if p["cover_kind"] != "svg" and not (has(p["cover"], "webp") or has(p["cover"], "mp4"))})
    print(f"built {1 + len(C.PROJECTS)} pages, v={V}")
    if missing:
        print("missing media:", ", ".join(missing))


if __name__ == "__main__":
    main()
