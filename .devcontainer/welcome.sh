#!/usr/bin/env bash
# Runs every time you attach to the Codespace. Purely informational.
cat <<'BANNER'

   ▄▄▄▄▄ ▄   ▄ ▄▄▄▄  ▄▄▄▄  ▄ ▄   ▄ ▄▄▄▄▄
     █   █   █ █   █ █   █ █ ██  █ █
     █   █   █ █▄▄▄█ █▄▄▄█ █ █ █ █ █▄▄
     █   █   █ █ ▀▄  █   █ █ █  ██ █
     █   ▀▄▄▄▀ █   ▀ ▄▄▄▄▀ █ █   █ █▄▄▄▄

   Build an AI that checks and fixes its own work
   WaysConf 2026 · masterclass

BANNER

echo "You are in a ready environment. Nothing to install."
echo
echo "  1.  Sign in to your agent"
echo "        claude          (Claude Pro / Max)"
echo "        codex           (ChatGPT Plus / Pro)"
echo
echo "  2.  Start the dev server in a second terminal"
echo "        npm run dev     → opens on port 4321"
echo
echo "  3.  Run the gates at any time"
echo "        npm run check   → writes checks/report.md"
echo
echo "Lost? Open docs/GLOSSARY.md. Behind? git checkout step-2 (see CHECKPOINTS.md)."
echo
