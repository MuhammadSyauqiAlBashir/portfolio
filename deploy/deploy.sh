#!/usr/bin/env bash
# Deploy the portfolio: build → copy site/ to /srv/portfolio (only changed files) → add/refresh the Caddy block.
#   ./deploy/deploy.sh            build + copy files (+ Caddy block if it changed)
# The Caddyfile is backed up to ~/work/Caddyfile.bak-portfolio-<time> before any change, validated, then reloaded.
set -euo pipefail
cd "$(dirname "$0")/.."
DEST=/srv/portfolio
python3 tools/build.py

echo "==> files -> $DEST"
sudo mkdir -p "$DEST"
sudo rsync -rlt --delete --chmod=D755,F644 --exclude '*.html.tmp' site/ "$DEST/"
sudo chown -R root:root "$DEST"

echo "==> caddy"
CF=/etc/caddy/Caddyfile
BLOCK=deploy/Caddyfile.portfolio
START="# >>> portfolio (managed by ~/portfolio/deploy/deploy.sh)"
END="# <<< portfolio"
want=$(printf '%s\n%s\n%s\n' "$START" "$(cat "$BLOCK")" "$END")
have=$(sudo awk -v s="$START" -v e="$END" '$0==s{f=1} f{print} $0==e{f=0}' "$CF")
if [ "$want" != "$have" ]; then
  bak=~/work/Caddyfile.bak-portfolio-$(date +%Y%m%d-%H%M%S)
  sudo cp "$CF" "$bak"; sudo chown "$USER" "$bak"
  tmp=$(mktemp)
  sudo awk -v s="$START" -v e="$END" '$0==s{skip=1} !skip{print} $0==e{skip=0}' "$CF" > "$tmp"
  printf '\n%s\n' "$want" >> "$tmp"
  sudo caddy validate --config "$tmp" --adapter caddyfile >/dev/null
  sudo install -m 644 -o root -g root "$tmp" "$CF"; rm -f "$tmp"
  sudo systemctl reload caddy
  echo "    Caddy block updated (backup: $bak)"
else
  echo "    Caddy block unchanged"
fi
systemctl is-active caddy
echo "==> done: https://syauqi.bashir.my.id"
