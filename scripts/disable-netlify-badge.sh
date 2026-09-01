#!/usr/bin/env bash
# Desliga o badge "Powered by Netlify" (#nl-badge) no projeto.
# Vale no próximo request — não precisa redeploy.
# Uso: NETLIFY_SITE_ID=... ./scripts/disable-netlify-badge.sh
set -euo pipefail

SITE_ID="${NETLIFY_SITE_ID:-f667a0f1-c9f0-4f68-8753-d0d3b38bf8fb}"

payload="$(python3 -c "import json; print(json.dumps({
  'site_id': '${SITE_ID}',
  'body': {'built_with_badge_enabled': False},
}))")"

netlify api updateSite --data "$payload" | python3 -c '
import json, sys
site = json.load(sys.stdin)
print("site:", site.get("name"))
print("url:", site.get("ssl_url"))
print("built_with_badge_enabled:", site.get("built_with_badge_enabled"))
if site.get("built_with_badge_enabled") is not False:
    sys.exit("o badge ainda está ligado — conferir o payload da API")
'
