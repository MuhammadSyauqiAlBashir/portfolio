# Server footprint: portfolio (measured 2026-10-08)

| Item | Value |
|---|---|
| Services | none (static files served by the existing Caddy) |
| RAM / CPU | ~0 (Caddy serves files; a few MB of cache at most) |
| Disk | site ≈ 5 MB in `/srv/portfolio` (media ≈ 4 MB); repo ≈ the same |
| Timers / jobs | none |
| Data | none (no database, no forms, no cookies, no visitor stats) |
| External services | none at runtime (no CDN, no fonts, no analytics). Let's Encrypt via Caddy as for every site |
| Network | static pages; media loops load only when on screen; CSS/JS cached 30 days (versioned), media 1 day |
| Impact on other apps | none; the demos run entirely in the visitor's browser |
| Backups | not needed: everything is in git (GitHub `MuhammadSyauqiAlBashir/portfolio`) |
