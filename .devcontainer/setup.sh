#!/usr/bin/env bash
# Runs once, when the Codespace is created. Everything slow happens here so that the
# 90 minutes in the room are not spent watching a progress bar.
set -euo pipefail

echo "──────────────────────────────────────────────"
echo " TURBINE workshop — preparing your environment"
echo "──────────────────────────────────────────────"

echo "› installing project dependencies"
npm ci --no-audit --no-fund

echo "› installing the Chromium build Playwright needs"
npx --yes playwright install --with-deps chromium

echo "› installing the two coding agents"
npm install -g @anthropic-ai/claude-code @openai/codex || {
  echo "  one of the agent CLIs failed to install; you can still install it yourself later:"
  echo "    npm install -g @anthropic-ai/claude-code"
  echo "    npm install -g @openai/codex"
}

echo "› installing the Netlify CLI"
npm install -g netlify-cli || echo "  netlify-cli failed to install; npx netlify will still work"

echo "› warming the build cache"
npm run build >/dev/null 2>&1 || echo "  (starter has no sections yet — expected)"

echo
echo "Environment ready."
