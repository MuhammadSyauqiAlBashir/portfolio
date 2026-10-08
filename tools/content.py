"""All site content. Facts only from the 2026 CV, docs/candidate-profile (JobRadar repo) and the apps' own docs.
Rules: title "IT Engineer"; "billions of rupiah" (never the figure); skills ≤ 2 = working proficiency; AI-assisted
development stated honestly; no family/salary/exclusion details; nothing confidential from Monotaro."""

NAME = "Muhammad Syauqi Al Bashir"
SHORT = "Syauqi"
HEADLINE = "Data & Integration Engineer · Google Cloud"
SITE = "https://syauqi.bashir.my.id"
LOCATION = "Jakarta, Indonesia (UTC+7)"
AVAILABILITY = "Open to remote & relocation"
EMAIL = "bashirsyauqi@gmail.com"
PHONE = "+62 822-7267-2097"
WHATSAPP = "https://wa.me/6282272672097"
LINKEDIN = "https://www.linkedin.com/in/bashirsyauqi/"
GITHUB = "https://github.com/MuhammadSyauqiAlBashir"
CV_FILE = "assets/cv/Muhammad-Syauqi-Al-Bashir-CV-2026.pdf"

INTRO = ("I build daily data syncs and ERP / e-commerce integrations on Google Cloud at Monotaro Indonesia, the "
         "Indonesian subsidiary of Japan's MonotaRO. Outside work I design, ship and run my own production apps on a "
         "hardened Linux server, using AI-assisted development to move fast without cutting corners.")

NUMBERS = [
    ("7–9M", "records synced per day by batch jobs I built"),
    ("Billions", "of rupiah in sales through my SAP ↔ Magento e-catalog"),
    ("6", "live apps I designed and run on one 2 GB server"),
    ("97.90", "top score of my Hacktiv8 full-stack batch"),
]

EXPERIENCE = [
    {
        "org": "PT Monotaro Indonesia", "role": "IT Engineer", "when": "Jul 2024 – present", "where": "Jakarta · Hybrid",
        "note": "Subsidiary of Japan's MonotaRO (B2B e-commerce for industrial supplies). English is my daily working language with a Japanese manager.",
        "points": [
            "Built an <b>Oracle APEX middle system</b> that syncs enterprise customers' <b>SAP</b> catalogs with the company's <b>Magento</b> store, giving customers an e-catalog inside their own ERP. Live since January 2026 and handling <b>billions of rupiah in sales</b>.",
            "Built batch data-sync jobs processing <b>~7–9 million records per day</b> with concurrent workers and selective sync logic.",
            "Orchestrate data pipelines on <b>Google Cloud</b>: Cloud Workflows, Dataform, Cloud Run (jobs, functions, services), Cloud Scheduler and BigQuery; manage IAM and Workload Identity Federation.",
            "Automated Oracle APEX releases (database schema + application) with <b>GitHub Actions, Playwright and Workload Identity Federation</b>, replacing a manual, effort-heavy deployment.",
            "Develop and support <b>Odoo ERP</b> across sales, purchase, manufacturing and accounting.",
            "Maintain Oracle, BigQuery, PostgreSQL and MongoDB databases under Japanese engineering standards.",
        ],
        "link": ("projects/monotaro.html", "Read the case studies"),
    },
    {
        "org": "Earlier career: customer-facing roles", "role": "", "when": "2021 – 2023", "where": "Indonesia",
        "note": "Years of stakeholder-facing work: the reason I'm at ease with customers and non-technical teams.",
        "points": [
            "<b>Customer Service Agent L1</b>, Tiket.com via PT Infomedia Nusantara (2023): bilingual support in Indonesian and English.",
            "<b>Inpatient Admission</b>, RS Pondok Indah Group (2022).",
            "<b>Children Social Worker</b>, Ministry of Social Affairs (2021).",
        ],
    },
]

SKILLS = [
    ("Cloud & data", ["Google Cloud (Workflows, Dataform, Cloud Run, Scheduler, Cloud Build, BigQuery, IAM, Workload Identity Federation)", "ETL & data integration"]),
    ("Databases", ["SQL", "Oracle (PL/SQL, APEX)", "BigQuery", "PostgreSQL", "MongoDB", "MariaDB", "Firestore", "Redis", "SQLite", "PocketBase"]),
    ("ERP & integration", ["Odoo (sales, purchase, manufacturing, accounting)", "SAP ↔ Magento integration", "REST", "GraphQL", "Google Apps Script"]),
    ("Languages", ["Python (FastAPI, Flask)", "SQL", "JavaScript / TypeScript (Node.js, React, Next.js)", "Go (working proficiency)", "Shell"]),
    ("DevOps & platform", ["Docker", "CI/CD", "GitHub Actions", "Playwright", "Linux (Ubuntu, systemd, Caddy)", "Server hardening", "FFmpeg", "WebSocket", "PWA + Web Push"]),
    ("AI", ["LLM integration (Gemini, Groq Whisper, Cloudflare Workers AI, FLUX)", "AI-assisted development with Claude Code"]),
]

EDUCATION = [
    ("Hacktiv8 Indonesia", "Full Stack JavaScript Immersive · Honor's Award, top score in batch (97.90/100)", "Jan – Apr 2024"),
    ("Politeknik Kesejahteraan Sosial Bandung", "B.A.Sc. Social Work · GPA 3.67/4.00", "2016 – 2020"),
]
CERTS = [
    ("English", "EF SET 75/100 (C2 Proficient) · daily working language"),
    ("Indonesian", "Native"),
    ("HackerRank", "SQL (Intermediate), Problem Solving (Intermediate)"),
]

PRIVATE = "Private · login required"

# ---------------------------------------------------------------------------------------------------------------
# Projects. media: file names in site/assets/media (img .webp / video .mp4). kind: phone | desktop | wide
# ---------------------------------------------------------------------------------------------------------------
PROJECTS = [
    {
        "slug": "clipstudio", "name": "Clip Studio", "accent": "#e8590c",
        "tagline": "Long videos in, captioned vertical clips out. An AI picks the moments; a human approves every clip.",
        "stack": ["Python", "FastAPI", "FFmpeg", "Groq Whisper", "Gemini", "YuNet", "SQLite", "PWA"],
        "links": [("https://clips.bashir.my.id", PRIVATE)],
        "cover": "clip-loop", "cover_kind": "reel",
        "problem": "Turning hours of podcasts and streams into good short clips is slow manual work: find the moment, cut it, reframe it to 9:16, caption it, post it everywhere, and only use sources that allow it.",
        "built": [
            "Paste a link, upload a file, or let <b>watchers</b> follow YouTube channels (WebSub push + RSS + Data API), Twitch (EventSub) and Kick, including <b>live-stream recording</b>.",
            "<b>Word-level transcription</b> (Groq Whisper, Deepgram as backup) and FFmpeg loudness analysis.",
            "<b>Gemini picks the moments</b> as word ranges, writes a hook and caption, and checks the audio (music excluded, laughter boosted). Cuts snap to sentence boundaries.",
            "<b>Face detection</b> (YuNet) decides the layout and drives a smooth crop path; karaoke-style captions are burned in with FFmpeg/libass.",
            "Low-res previews first; <b>approving</b> renders the final 1080×1920 and queues auto-posting (Instagram/Facebook Reels, TikTok drafts) with schedules, pausable queues and plain-language statuses.",
            "Hard rules in code: permission-based sources only, no music, nothing published without approval, creators credited.",
        ],
        "highlights": [
            ("clip-review", "phone", "Review queue: score, length, loudness, laughter, music and face-layout checks on every clip, grouped by source video."),
            ("clip-loop", "reel", "The finished clip: a face-tracked split layout and word-by-word karaoke captions, cut on sentence boundaries."),
            ("clip-ready", "phone", "Ready to post: approved clips with their render and posting queue, each pausable, with plain-language status."),
        ],
        "demo": ("clippipe", "Watch the pipeline", "A synthetic walk-through of what happens to one video: transcript, loudness, the chosen moment, the face crop and the captions."),
        "flow": ["Sources", "Download / record", "Transcribe (words)", "Score moments (LLM + audio)", "Face crop + captions", "Human review", "Render + post"],
        "notes": [
            "Runs next to five other apps on 2 vCPU / 2 GB: the worker is capped at one core and 900 MB, one job at a time, and source files are deleted after rendering.",
            "Every pipeline step is resumable, so a restart never loses work.",
            "Detection is quota-free: YouTube push notifications and RSS, plus 1-unit API lookups, instead of polling search.",
            "Posts never retry blindly: each failure gets a named reason and the next step to take.",
        ],
    },
    {
        "slug": "bashgames", "name": "BashGames", "accent": "#7048e8",
        "tagline": "A real-time multiplayer party platform for family and friends: 69 games over WebSocket.",
        "stack": ["Python", "FastAPI", "WebSocket", "PocketBase", "three.js", "Web Audio", "Gemini", "PWA"],
        "links": [("https://games.bashir.my.id", PRIVATE)],
        "cover": "bg-ludo-loop", "cover_kind": "phone",
        "problem": "Our family and friends wanted to play together on their phones: classic board and card games, quick party games and silly AI-judged contests, without ads or app stores.",
        "built": [
            "<b>Server-authoritative engines</b> for every game: state kept as JSON, its own RNG, a separate view per player so hidden cards stay hidden.",
            "Live rooms over <b>WebSocket</b>, restored after restarts; pause when someone drops, everyone taps Ready, 3-2-1.",
            "Board & card classics (Ludo with real 3D dice throws, UNO, Poker in rupiah, a Monopoly-style game, Gaple, Congklak…), quizzes, speed games, 20 Hz live arenas with latency back-dating.",
            "<b>AI-judged games:</b> drawings, selfies and photo hunts judged by Gemini with a Cloudflare Workers AI backup racing it; voice games with on-phone pitch tracking.",
            "A 3D cooking career game in <b>three.js</b>, plus a live home page, awards, leaderboards and push notifications.",
        ],
        "highlights": [
            ("bg-lobby", "phone", "Live home page: rooms appear on everyone's phone the moment they're created."),
            ("bg-ludo-loop", "phone", "Ludo with a real 3D dice throw; pieces move after the dice land."),
            ("bg-kembar", "phone", "Spot the Twin: every two cards share exactly one picture (a projective-plane deck)."),
            ("bg-karaoke", "phone", "Karaoke: the phone tracks your pitch every 50 ms and scores you note by note, in any key."),
            ("cook-play", "wide", "Cooking career game in three.js: a story, a kitchen to upgrade, and orders to serve."),
        ],
        "demo": ("dice", "Roll the dice", "The same 3D CSS die used in Ludo and Snakes & Ladders, plus a round of Spot the Twin."),
        "flow": ["Phones (PWA)", "WebSocket rooms", "Game engine (server)", "Per-player views", "AI judges (Gemini ⇄ Cloudflare)", "Results, awards, stats"],
        "notes": [
            "Random-play simulation tests drive every engine to the end of a game; around 160 tests run before each deploy.",
            "AI never blocks a game: content is prepared while players wait in the lobby, with bounded waits and built-in fallbacks.",
            "One bug worth remembering: events with a private recipient key were hiding public moves; it was fixed and documented.",
        ],
    },
    {
        "slug": "finance", "name": "Financial Management", "accent": "#2f9e44",
        "tagline": "Household budgeting that reads bank emails, checks receipts and keeps a zero-based plan. In daily use.",
        "stack": ["Python", "FastAPI", "PocketBase", "Gemini", "Google Apps Script", "WebAuthn", "Web Push", "PWA"],
        "links": [("https://financial-management.bashir.my.id", PRIVATE)],
        "cover": "fin-loop", "cover_kind": "phone",
        "problem": "Tracking a household budget by hand never lasts. Every card payment already sends an email, so the app should start there and only ask a person to confirm.",
        "built": [
            "Bank emails (BCA, Mandiri) → a Google Apps Script → an <b>HMAC-signed ingest</b> endpoint; no Google credentials on the server.",
            "Rule-based parsers with an <b>LLM fallback</b> (with an amount cross-check); account and card numbers are <b>redacted before anything reaches the AI</b>.",
            "Confirm each transaction with a receipt photo (AI reads it and checks it matches), split across categories; receipts saved to Google Drive.",
            "<b>Envelope (zero-based) budgeting</b>, e-wallet top-ups as balances, reports with forecasts, an AI advisor, and Web Push tuned for iPhone.",
            "A <b>Face ID lock</b> enforced by the server (passkeys), heartbeat so typing never locks, nightly verified backups.",
        ],
        "highlights": [
            ("fin-home", "phone", "Home: safe-to-spend, wallets and what's waiting to be confirmed. (Demo data.)"),
            ("fin-inbox", "phone", "Inbox: every bank email becomes a card with the parsed details and whose account it is."),
            ("fin-wallets", "phone", "Wallets: the zero-based plan, money left per envelope and pace for the month."),
            ("fin-reports", "phone", "Reports: hand-drawn SVG charts, trends and a month-end forecast."),
        ],
        "demo": ("parser", "Parse a bank email", "A fake bank notification: see the fields the parser pulls out and what gets redacted before any AI call. Then try zero-based envelopes."),
        "flow": ["Bank email", "Gmail + Apps Script", "Signed ingest", "Parse + redact", "Confirm with receipt", "Envelopes, reports, push"],
        "notes": [
            "Real money data lives here, so every screenshot on this page comes from a scratch copy with a made-up household.",
            "Parser tests run on name-scrubbed real emails; forwarded emails taught me to normalise CRLF line endings.",
            "iOS details matter: high-urgency pushes, retrying the first request after a long sleep, and a fixed app frame.",
        ],
    },
    {
        "slug": "couple-suits", "name": "Couple Suits", "accent": "#c2255c",
        "tagline": "A shop for matching family outfits, plus a CMS with an AI design studio for the designer.",
        "stack": ["Python", "FastAPI", "Jinja SSR", "PocketBase", "Gemini", "Cloudflare FLUX", "Pillow", "PWA"],
        "links": [("https://shop.bashir.my.id", "Public storefront (demo catalog)"), ("https://shop-admin.bashir.my.id", PRIVATE)],
        "cover": "cs-home", "cover_kind": "phone",
        "problem": "Matching outfits are usually sold as couple sets only. Families want the same look for parents, kids and siblings, and the designer needed a faster way from sketch to product.",
        "built": [
            "Server-rendered storefront with a <b>family set builder</b> (roles → cuts → sizes), cart re-priced on the server, family-set discounts, vouchers and WhatsApp ordering.",
            "Admin PWA: products, stock, orders with WhatsApp templates, homepage builder, journal, lookbook, reviews, cookie-free analytics, push on new orders.",
            "<b>AI design studio:</b> hand sketch + detail photos → Gemini brief → FLUX design options → flat drawings → the whole family's set → tech pack with graded size charts → PDF → draft product.",
        ],
        "highlights": [
            ("cs-home", "phone", "Storefront home: bilingual, SEO-ready, installable."),
            ("cs-builder", "phone", "Family set builder: choose who's wearing it, the cut and each size."),
            ("csa-products", "desktop", "Admin: products, stock and the demo catalog generated with AI photos."),
            ("csa-studio", "wide", "AI studio output: the family board, every member drawn from the same flat sketch and fabric details."),
        ],
        "demo": ("familyset", "Build a family set", "Pick roles and sizes; the family-set discount kicks in at 3 and 5 people, as in the shop."),
        "flow": ["Sketch + details", "Gemini brief", "FLUX options", "Flats + family board", "Tech pack + size charts", "Draft product"],
        "notes": [
            "Size charts are graded from standard Asian tables using the AI's fit notes, not free-form AI numbers.",
            "Images are processed into WebP sizes; the admin keeps private studio files outside the public media folder.",
        ],
    },
    {
        "slug": "lyrsync", "name": "lyrsync", "accent": "#1c7ed6",
        "tagline": "Hear a song, follow its lyrics in sync on your phone.",
        "stack": ["Python", "FastAPI", "Web Audio (AudioWorklet)", "Shazam (shazamio)", "LRCLIB", "PocketBase", "PWA"],
        "links": [("https://lyrsync.bashir.my.id", PRIVATE)],
        "cover": "lyr-loop", "cover_kind": "phone",
        "problem": "Lyrics apps follow your own player, not the song playing in a café or a car. I wanted one tap: listen, recognise, scroll the lyrics in time.",
        "built": [
            "The browser records the mic and sends a small <b>16 kHz mono WAV</b>; the server identifies it and fetches time-synced lyrics.",
            "Progressive listening (4 s, then longer clips), automatic retries and <b>server-side rate limiting with back-off</b> so the shared IP never gets throttled.",
            "\"Always\" mode, a Resync button, and <b>tap-to-sync</b> for music playing on the same phone (iOS can't share Now Playing with web apps).",
            "Accounts with admin approval; this app owns the login rules every other app reuses.",
        ],
        "highlights": [
            ("lyr-home", "phone", "Listen or Always: one tap to recognise what's playing."),
            ("lyr-synced", "phone", "Synced lyrics with the current line highlighted and nudge buttons."),
        ],
        "demo": ("lyrics", "Try tap-to-sync", "A public-domain song: tap the line you're hearing and the lyrics follow from there."),
        "flow": ["Mic (AudioWorklet)", "16 kHz WAV", "Recognise", "Synced lyrics", "Follow / tap-to-sync"],
        "notes": [
            "Limits per user and per server, plus back-off after a 429, keep an unofficial API usable.",
            "Shown here with a public-domain song; no copyrighted lyrics are reproduced.",
        ],
    },
    {
        "slug": "jobradar", "name": "JobRadar", "accent": "#0b7285",
        "tagline": "A personal job radar: collects openings, scores them against my profile, drafts honest applications. Nothing is sent without a click.",
        "stack": ["Python", "FastAPI", "SQLite", "Gemini", "Google Apps Script", "Web Push", "PWA"],
        "links": [("https://jobs.bashir.my.id", PRIVATE)],
        "cover": "jr-inbox", "cover_kind": "phone",
        "problem": "Job hunting across many boards is noisy. I wanted one inbox of relevant roles, scored honestly, with drafts that only use true facts about me.",
        "built": [
            "Collectors for public feeds and APIs plus my own alert emails (via Apps Script), with dedupe and free rule-based filters before any AI call.",
            "<b>Batched AI scoring</b> (lite models first, per-model quota rests) with an explainable score: skills, seniority, pay, eligibility, preferences.",
            "Drafts and tailored CVs built only from a source-of-truth profile, with honesty checks; sending goes through Gmail on approval only.",
            "Pipeline stages, follow-ups, interview prep and stats; works on phone and desktop.",
        ],
        "highlights": [
            ("jr-inbox", "phone", "Inbox: strong matches first, with the reason for every score."),
            ("jr-job", "phone", "Job detail: the score broken down, then drafts you approve."),
            ("jr-desktop", "desktop", "Desktop layout of the same app."),
        ],
        "demo": ("score", "Re-weight the score", "Move the weights and watch three sample jobs re-score, the way JobRadar explains its numbers."),
        "flow": ["Feeds + alert emails", "Dedupe + free filters", "Batched AI scoring", "Inbox", "Approved drafts", "Gmail send"],
        "notes": [
            "Respects each site's terms: official APIs, RSS and my own alert emails only; no scraping.",
            "Still in progress; built and deployed in its first two days.",
        ],
    },
    {
        "slug": "platform", "name": "The platform", "accent": "#5c7c99",
        "tagline": "Six apps on one 2 GB server: hardened, sandboxed, monitored and backed up every night.",
        "stack": ["Ubuntu 24.04", "Caddy (HTTP/3)", "systemd sandboxing", "PocketBase", "ufw + fail2ban", "SSH key + TOTP", "Let's Encrypt"],
        "links": [],
        "cover": "platform-diagram", "cover_kind": "svg",
        "problem": "Running real apps (one with real money data) on a budget server means security, isolation and recovery have to be designed in, not bolted on.",
        "built": [
            "<b>Layered security:</b> provider firewall + ufw, SSH with key + TOTP and no passwords, fail2ban, unattended security updates, hardened kernel settings, strict HTTPS headers per site.",
            "Each app runs as its <b>own Linux user</b> in a sandboxed systemd unit with memory and CPU caps, listening only on localhost behind Caddy.",
            "Secrets in root-owned env files readable only by their app; never in git.",
            "<b>Nightly verified backups</b> of the shared database to Google Drive, plus per-app backups; restore tested.",
            "One login system shared by every app, with admin approval for new accounts; a separate free AI project per app so quotas never collide.",
        ],
        "highlights": [],
        "demo": None,
        "flow": ["Internet (HTTPS, HTTP/3)", "Caddy + strict headers", "Sandboxed app services", "Shared auth + DB", "Nightly backups"],
        "notes": [
            "Budget rule: free tiers that need no credit card, one small VPS, unlimited traffic.",
            "Each project writes a short server-footprint brief so every new app knows what already runs.",
        ],
    },
    {
        "slug": "monotaro", "name": "Work at Monotaro", "accent": "#d9480f",
        "tagline": "Data and integration work for a Japanese-owned B2B e-commerce company, on Google Cloud.",
        "stack": ["Oracle APEX", "PL/SQL", "SAP", "Magento", "Google Cloud", "BigQuery", "Dataform", "Cloud Run", "GitHub Actions", "Odoo"],
        "links": [],
        "cover": "work-diagram", "cover_kind": "svg",
        "problem": "Enterprise customers buy from their own ERP, product data changes every day, and releases must be safe. (Described at a high level; no internal details are shown.)",
        "built": [
            "<b>SAP ↔ Magento e-catalog:</b> an Oracle APEX middle system that keeps enterprise customers' SAP catalogs in sync with the store, so they can order from inside their ERP. Live since January 2026; billions of rupiah in sales have gone through it. It needed close work with customers and stakeholders.",
            "<b>Daily data syncs at scale:</b> batch jobs moving ~7–9 million records per day with selective sync and concurrent workers.",
            "<b>Pipelines on Google Cloud:</b> Cloud Workflows, Dataform, Cloud Run jobs/functions/services, Cloud Scheduler, BigQuery, IAM and Workload Identity Federation.",
            "<b>CI/CD for Oracle APEX:</b> schema and application releases automated with GitHub Actions + Playwright + Workload Identity Federation, replacing a manual process and improving security.",
            "<b>Odoo ERP</b> development and support across sales, purchase, manufacturing and accounting.",
        ],
        "highlights": [],
        "demo": None,
        "flow": ["Customer SAP", "Oracle APEX middle system", "Magento store", "Orders back to the ERP"],
        "notes": ["Working language: English, with a Japanese manager and Japanese engineering standards."],
    },
]
