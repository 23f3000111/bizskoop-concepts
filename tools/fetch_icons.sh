#!/usr/bin/env bash
# Downloads the free-licence icon sources into source-assets/ (git-ignored):
#   Lucide (ISC) line icons, Simple Icons (CC0) brand marks, flag-icons (MIT) square flags.
# Run from the project root: bash tools/fetch_icons.sh   then: python -P -E tools/assets.py icons
set -u
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36'
mkdir -p source-assets/icons/lucide source-assets/icons/brands source-assets/flags
LUCIDE="building-2 badge-check compass id-card stamp globe calculator handshake cpu landmark heart-pulse factory shopping-cart
graduation-cap plane plane-takeoff zap briefcase truck layers shield-check message-circle trending-up receipt arrow-right
arrow-up-right arrow-left check x plus minus phone mail map-pin clock star search send chevron-down chevron-left
chevron-right chevron-up menu message-square-text sparkles file-text users user-check calendar-check external-link quote
circle-check file-badge scale bot award info lock map clipboard-check file-check wallet rocket target facebook instagram
linkedin circle-help list-checks route shield building badge-percent hand-coins file-signature book-open-check"
for n in $LUCIDE; do
  f="source-assets/icons/lucide/$n.svg"
  [ -s "$f" ] || curl -sSfL --max-time 30 -A "$UA" "https://cdn.jsdelivr.net/npm/lucide-static@0.460.0/icons/$n.svg" -o "$f" || { echo "missing lucide: $n"; rm -f "$f"; }
done
for n in tiktok whatsapp google facebook instagram; do
  f="source-assets/icons/brands/$n.svg"
  [ -s "$f" ] || curl -sSfL --max-time 30 -A "$UA" "https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/$n.svg" -o "$f" || { echo "missing brand: $n"; rm -f "$f"; }
done
for c in my pk in bd cn sg id ae sa eg kz gb us au; do
  f="source-assets/flags/$c.svg"
  [ -s "$f" ] || curl -sSfL --max-time 30 -A "$UA" "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/1x1/$c.svg" -o "$f" || { echo "missing flag: $c"; rm -f "$f"; }
done
echo "lucide: $(ls source-assets/icons/lucide | wc -l)  brands: $(ls source-assets/icons/brands | wc -l)  flags: $(ls source-assets/flags | wc -l)"
