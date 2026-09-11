#!/usr/bin/env bash
#
# The whole loop. Twelve lines of logic, and every one of them earns its place.
#
#   bash loop/ralph.sh                 # Claude Code, up to 12 iterations
#   AGENT=codex bash loop/ralph.sh     # Codex CLI instead
#   MAX=3 bash loop/ralph.sh           # stop sooner
#
# The shape is Geoffrey Huntley's: put the instruction in a file, run the agent
# against it, let it fail, run it again. What makes it work is not the loop
# itself — it is the two things around it.
#
#   1. The exit condition is `npm run check`, which is a program. It returns 0 or
#      it does not. The model is not consulted about whether the work is done.
#
#   2. State lives in files, not in the conversation. Each iteration starts with a
#      fresh context and reads loop/PROGRESS.md and checks/report.md to find out
#      where it is. A long conversation degrades; a short one that reads good
#      notes does not.
#
# Everything else here is a guard rail: a hard iteration cap so it cannot run all
# night, a transcript per iteration so you can see what happened, a refusal to
# start if the working tree is dirty, so you can always get back, and a refusal to
# commit an iteration that edited the verifier.

set -uo pipefail
cd "$(dirname "$0")/.."

MAX="${MAX:-12}"
AGENT="${AGENT:-claude}"
RUN_DIR="loop/.runs/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$RUN_DIR"

# ── Guard rails ───────────────────────────────────────────────────────────────

if ! command -v "$AGENT" >/dev/null 2>&1; then
  echo "No '$AGENT' on PATH. Install it, or run: AGENT=codex bash loop/ralph.sh"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty. Commit or stash first — an unattended loop should"
  echo "always be something you can 'git reset --hard' your way out of."
  echo
  git status --short
  exit 1
fi

START_REF="$(git rev-parse --short HEAD)"
echo "Loop starting at $START_REF with $AGENT, at most $MAX iterations."
echo "Transcripts: $RUN_DIR"
echo

# ── The loop ──────────────────────────────────────────────────────────────────

for i in $(seq 1 "$MAX"); do
  echo "──── iteration $i/$MAX ────────────────────────────────────────────────"

  # The verifier runs FIRST. If the gates are already green there is nothing to
  # do, and an agent asked to improve passing work will happily invent a reason.
  if npm run --silent check > "$RUN_DIR/check-$i.log" 2>&1; then
    echo "All gates passed on iteration $i."
    cp checks/report.md "$RUN_DIR/report-final.md" 2>/dev/null || true
    echo
    echo "Changed since $START_REF:"
    git --no-pager diff --stat "$START_REF"
    exit 0
  fi

  FAILED=$(grep -c '^\*\*[0-9]' checks/report.md 2>/dev/null || echo '?')
  echo "$FAILED failure(s). Handing the report back to $AGENT."
  cp checks/report.md "$RUN_DIR/report-$i.md" 2>/dev/null || true

  # One prompt, unchanged every iteration. The thing that varies is the report
  # the agent reads, which is exactly the point: the instruction is stable and
  # the feedback is fresh.
  case "$AGENT" in
    claude)
      claude -p "$(cat loop/PROMPT.md)" \
        --permission-mode acceptEdits \
        < /dev/null \
        > "$RUN_DIR/agent-$i.log" 2>&1
      ;;
    codex)
      # workspace-write lets the agent edit this project and nothing else, which is what
      # you want. On a host where Codex's sandbox cannot initialise, every write fails
      # with "the execution sandbox failed" — set CODEX_SANDBOX=danger-full-access, and
      # only inside a worktree you are willing to throw away.
      # </dev/null is load-bearing. Codex reads instructions from stdin when stdin is a
      # pipe, so an inherited-but-silent stdin makes it wait for an EOF that never
      # arrives — alive, busy-looking, and doing nothing at all.
      codex exec -s "${CODEX_SANDBOX:-workspace-write}" "$(cat loop/PROMPT.md)" \
        < /dev/null > "$RUN_DIR/agent-$i.log" 2>&1
      ;;
    *)
      "$AGENT" "$(cat loop/PROMPT.md)" < /dev/null > "$RUN_DIR/agent-$i.log" 2>&1
      ;;
  esac

  # The agent is told never to touch checks/ or .github/. This is what makes that
  # an enforced rule rather than a request: an iteration that moved the measure is
  # not committed, and the run stops for a person to look at.
  if [ -n "$(git status --porcelain -- checks/ .github/)" ]; then
    echo "Iteration $i changed the verifier:"
    git status --short -- checks/ .github/
    echo
    echo "Stopping. A gate the generator can edit is not a gate. Read the diff, then"
    echo "'git checkout -- checks/ .github/' to put the verifier back."
    exit 1
  fi

  # A commit per iteration. Not for the history — for the ability to see exactly
  # what each pass changed, and to bisect the one that made things worse.
  git add -A
  git commit -q -m "loop: iteration $i" --allow-empty
done

echo
echo "Hit the cap of $MAX iterations without going green."
echo "That is a result, not a crash. Read $RUN_DIR/report-$MAX.md and"
echo "loop/PROGRESS.md — a loop that cannot converge is usually being asked"
echo "to satisfy a gate that the brief never gave it the information to satisfy."
exit 1
