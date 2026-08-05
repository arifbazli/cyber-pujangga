#!/usr/bin/env bash
# ============================================================================
#  deploy.sh — build, deploy to Cloudflare Pages, and clean up old deploys
# ----------------------------------------------------------------------------
#  Mirrors the pattern used by ~/projects/tech-journal/deploy.sh.
#  This is the only command you need for the whole Cyber Pujangga pipeline:
#    1. Builds the Astro site (npm run build)
#    2. Deploys ./dist via wrangler pages deploy
#    3. Deletes all previous deployments (keeps only the latest)
#
#  Usage:
#    ./deploy.sh             # full build + deploy + cleanup
#    ./deploy.sh --no-clean  # build + deploy only (skip cleanup step)
#
#  Requirements:
#    - Node.js >= 22.12.0
#    - CLOUDFLARE_API_TOKEN set in env, OR a token that wrangler manages
#    - First run requires 'npm install' (handled automatically)
# ============================================================================

set -euo pipefail

# ----- Config ---------------------------------------------------------------
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/cyber-pujangga-site" && pwd)"
PROJECT_NAME="cyber-pujangga"
ACCOUNT_ID="1c5731ce0fd505c95adb0069d6aa4dd2"
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ----- Args -----------------------------------------------------------------
CLEAN_OLD=true
for arg in "$@"; do
  case "$arg" in
    --no-clean) CLEAN_OLD=false ;;
    -h|--help)
      echo "Usage: $0 [--no-clean]"
      echo "  --no-clean  Skip deleting old deployments (keep history)"
      exit 0
      ;;
  esac
done

# ----- Pre-flight -----------------------------------------------------------
cd "$PROJECT_DIR"

if [ ! -d node_modules ]; then
  echo "→ Running first-time 'npm install'..."
  npm install --no-audit --no-fund --loglevel=error
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && command -v wrangler >/dev/null 2>&1; then
  AUTH_STATUS=$(wrangler whoami 2>&1 || true)
  if echo "$AUTH_STATUS" | grep -qi "invalid access token\|error"; then
    echo ""
    echo "✗ No CLOUDFLARE_API_TOKEN set, and 'wrangler whoami' failed."
    echo "  Set one with:  export CLOUDFLARE_API_TOKEN=cfut_xxxxx"
    echo "  Or run:        wrangler login"
    exit 1
  fi
elif [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
  export CLOUDFLARE_API_TOKEN
fi

# ----- Step 1: Build --------------------------------------------------------
echo ""
echo "▶ Step 1/3 · Building the site"
echo "  cwd: $PROJECT_DIR"
echo "  local time: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "  UTC:        $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
npm run build 2>&1 | tail -8

# ----- Step 2: Deploy -------------------------------------------------------
echo ""
echo "▶ Step 2/3 · Deploying ./dist to Cloudflare Pages"

DEPLOY_OUTPUT=$(wrangler pages deploy ./dist \
  --project-name="$PROJECT_NAME" \
  --branch=main \
  --commit-dirty=true 2>&1)

echo "$DEPLOY_OUTPUT" | tail -6

# Extract the new short_id (8-hex) from the final preview URL
NEW_SHORT_ID=$(echo "$DEPLOY_OUTPUT" \
  | grep -oE 'https://[a-f0-9]+\.'"$PROJECT_NAME"'\.pages\.dev' \
  | head -1 \
  | grep -oE '[a-f0-9]+' \
  | head -1)

if [ -z "$NEW_SHORT_ID" ]; then
  echo ""
  echo "✗ Could not parse new deployment short_id from deploy output."
  echo "  Site is live but old deploys were NOT cleaned."
  exit 0
fi

echo "  new deployment: $NEW_SHORT_ID"

# ----- Step 3: Cleanup ------------------------------------------------------
if [ "$CLEAN_OLD" = false ]; then
  echo ""
  echo "▶ Step 3/3 · Skipped (--no-clean flag set)"
  echo ""
  echo "✓ Done.  Live at:  https://$PROJECT_NAME.pages.dev"
  exit 0
fi

echo ""
echo "▶ Step 3/3 · Cleaning up old deployments (keeping only $NEW_SHORT_ID)"

CF_ACCOUNT_ID="$ACCOUNT_ID" \
CF_PAGES_PROJECT_NAME="$PROJECT_NAME" \
KEEP_SHORT_ID="$NEW_SHORT_ID" \
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}" \
python3 "$SCRIPTS_DIR/cf-pages-cleanup.py" \
  || echo "  (cleanup script exited non-zero; site is still live)"

echo ""
echo "✓ Done.  Live at:  https://$PROJECT_NAME.pages.dev"
echo ""
