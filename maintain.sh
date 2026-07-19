#!/bin/bash
set +x 2>/dev/null || true
# Flight Crew Files — production maintenance script.
# Daily (via cron, 6am): refresh feeds, verify output, commit+push, notify.
# Sunday only: GTmetrix check, external link audit, log rotation.
# Deferred push retries (via a separate hourly cron entry, see setup notes)
# are handled by invoking this script with --retry-push.
#
# Intentionally does NOT use `set -e` — a single failed step must never take
# down the rest of the run silently. Every step is isolated, logged, and
# failure is reported via Telegram rather than allowed to abort the script.
set -u

REPO_DIR="/home/jayca/projects/flightcrewfiles"
LOG="$REPO_DIR/maintenance.log"
EMERGENCY_LOG="$REPO_DIR/emergency.log"
PUSH_STATE_FILE="$REPO_DIR/.push_retry_state"
VERIFY_FILE="$REPO_DIR/.verify_result.json"
MAX_PUSH_RETRY_HOURS=6

# --------------------------------------------------------------------------
# Logging
# --------------------------------------------------------------------------

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"
}

# --------------------------------------------------------------------------
# .env
# --------------------------------------------------------------------------

load_env() {
  if [ -f "$REPO_DIR/.env" ]; then
    # Only restore xtrace after sourcing if it was actually on before —
    # unconditionally turning it back on would leak GITHUB_TOKEN etc. into
    # maintenance.log the next time a traced command expands the variable
    # (e.g. the base64 auth header built in git_push_with_token).
    local was_xtrace=0
    case "$-" in *x*) was_xtrace=1 ;; esac

    set -a
    { set +x; } 2>/dev/null
    # shellcheck disable=SC1091
    source "$REPO_DIR/.env"
    if [ "$was_xtrace" -eq 1 ]; then
      { set -x; } 2>/dev/null
    fi
    set +a
  else
    log "WARN  .env not found at $REPO_DIR/.env"
  fi
}

# --------------------------------------------------------------------------
# Generic retry helper: retry <attempts> <delay-seconds> <command...>
# --------------------------------------------------------------------------

retry() {
  local attempts="$1"; shift
  local delay="$1"; shift
  local n=1
  until "$@"; do
    if [ "$n" -ge "$attempts" ]; then
      return 1
    fi
    log "WARN  Attempt $n/$attempts failed for: $* — retrying in ${delay}s"
    n=$((n + 1))
    sleep "$delay"
  done
  return 0
}

# --------------------------------------------------------------------------
# Telegram notifications — failures here write to emergency.log instead of
# being allowed to silently vanish.
# --------------------------------------------------------------------------

notify_telegram() {
  local message="$1"

  if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
    log "WARN  TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set — skipping notification"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Telegram not configured. Message was:" >> "$EMERGENCY_LOG"
    echo "$message" >> "$EMERGENCY_LOG"
    return 1
  fi

  local attempt=1
  while [ "$attempt" -le 3 ]; do
    if curl -fsS --max-time 10 \
      -d "chat_id=${TELEGRAM_CHAT_ID}" \
      --data-urlencode "text=${message}" \
      "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" > /dev/null 2>&1; then
      return 0
    fi
    log "WARN  Telegram send attempt $attempt/3 failed"
    attempt=$((attempt + 1))
    sleep 5
  done

  log "ERROR Telegram notification failed after 3 attempts — writing to emergency.log"
  {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] TELEGRAM SEND FAILED. Message was:"
    echo "$message"
  } >> "$EMERGENCY_LOG"
  return 1
}

emergency_alert() {
  local message="EMERGENCY — Flight Crew Files maintenance: $1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message" >> "$EMERGENCY_LOG"
  log "CRIT  $message"
  notify_telegram "🚨 $message"
}

# --------------------------------------------------------------------------
# Step: DNS
# Appends 8.8.8.8 if missing, rather than overwriting resolv.conf outright —
# a full overwrite would wipe any other resolvers already configured there.
# Requires passwordless sudo (visudo NOPASSWD) since this runs unattended;
# if that isn't set up, this step is skipped and logged, not fatal.
# --------------------------------------------------------------------------

fix_dns() {
  if ! sudo -n true 2>/dev/null; then
    log "WARN  Skipping DNS fix — passwordless sudo not available for this cron user"
    return 0
  fi
  if grep -qs "8.8.8.8" /etc/resolv.conf 2>/dev/null; then
    log "INFO  8.8.8.8 already present in /etc/resolv.conf"
    return 0
  fi
  if echo "nameserver 8.8.8.8" | sudo -n tee -a /etc/resolv.conf > /dev/null 2>&1; then
    log "OK    Added 8.8.8.8 to /etc/resolv.conf"
  else
    log "WARN  Failed to update /etc/resolv.conf (non-fatal, continuing)"
  fi
}

# --------------------------------------------------------------------------
# Step: connectivity check
# --------------------------------------------------------------------------

check_connectivity() {
  if retry 3 5 curl -fsS --max-time 5 -o /dev/null https://github.com; then
    log "OK    Internet connectivity confirmed"
    return 0
  fi
  log "ERROR No internet connectivity after 3 attempts"
  return 1
}

# --------------------------------------------------------------------------
# Step: run the feed updater
# --------------------------------------------------------------------------

run_feed_update() {
  cd "$REPO_DIR" || { log "ERROR Cannot cd to $REPO_DIR"; return 1; }
  log "INFO  Running setup_flightcrewfiles.py"
  python3 setup_flightcrewfiles.py >> "$LOG" 2>&1
  local code=$?
  if [ "$code" -ne 0 ]; then
    log "WARN  setup_flightcrewfiles.py exited with status $code (some feeds may have failed — it degrades per-step on its own)"
  fi
  return 0
}

# --------------------------------------------------------------------------
# Step: verify output. Sets VIDEOS_COUNT / NEWS_COUNT / UAP_COUNT /
# SITEMAP_OK / CRITICAL_FAILURE (1/0) as globals for the caller.
# --------------------------------------------------------------------------

verify_results() {
  cd "$REPO_DIR" || { log "ERROR Cannot cd to $REPO_DIR"; CRITICAL_FAILURE=1; return 1; }

  python3 - <<'PYEOF' >> "$LOG" 2>&1
import json, os

def count(path, key):
    try:
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        return len(data.get(key, []))
    except Exception as exc:
        print(f"ERROR reading {path}: {exc}")
        return -1

videos = count('videos.json', 'items')
news = count('news.json', 'articles')
uap = count('uap_news.json', 'articles')
sitemap_ok = os.path.exists('sitemap.xml') and os.path.getsize('sitemap.xml') > 0

with open('.verify_result.json', 'w', encoding='utf-8') as f:
    json.dump({'videos': videos, 'news': news, 'uap': uap, 'sitemap_ok': sitemap_ok}, f)

print(f"Verify: videos={videos} news={news} uap={uap} sitemap_ok={sitemap_ok}")
PYEOF

  if [ ! -f "$VERIFY_FILE" ]; then
    log "ERROR verify_results produced no output file"
    CRITICAL_FAILURE=1
    return 1
  fi

  VIDEOS_COUNT=$(python3 -c "import json;print(json.load(open('$VERIFY_FILE'))['videos'])")
  NEWS_COUNT=$(python3 -c "import json;print(json.load(open('$VERIFY_FILE'))['news'])")
  UAP_COUNT=$(python3 -c "import json;print(json.load(open('$VERIFY_FILE'))['uap'])")
  SITEMAP_OK=$(python3 -c "import json;print(json.load(open('$VERIFY_FILE'))['sitemap_ok'])")
  rm -f "$VERIFY_FILE"

  CRITICAL_FAILURE=0

  if [ "$VIDEOS_COUNT" -lt 20 ] 2>/dev/null; then
    log "ERROR videos.json has only $VIDEOS_COUNT items (expected >= 20)"
    CRITICAL_FAILURE=1
  fi
  if [ "$NEWS_COUNT" -lt 10 ] 2>/dev/null; then
    log "ERROR news.json has only $NEWS_COUNT items (expected >= 10)"
    CRITICAL_FAILURE=1
  fi
  if [ "$UAP_COUNT" -eq 0 ] 2>/dev/null; then
    log "WARN  uap_news.json is empty this run (non-fatal)"
  fi
  if [ "$SITEMAP_OK" != "True" ]; then
    log "ERROR sitemap.xml was not regenerated or is empty"
    CRITICAL_FAILURE=1
  fi

  return 0
}

# --------------------------------------------------------------------------
# Step: git add / commit / push
# Uses GITHUB_TOKEN via a one-off Authorization header on the push command
# only (git -c http.extraheader=...) rather than embedding the token in the
# remote URL or persisting it to .git/config, so it never ends up written
# to disk anywhere outside .env.
# --------------------------------------------------------------------------

git_push_with_token() {
  if [ -z "${GITHUB_TOKEN:-}" ]; then
    log "WARN  GITHUB_TOKEN not set — attempting push with existing git credentials"
    git push
    return $?
  fi
  local auth
  auth=$(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 | tr -d '\n')
  git -c http.extraheader="AUTHORIZATION: basic ${auth}" push
}

commit_and_push() {
  cd "$REPO_DIR" || { log "ERROR Cannot cd to $REPO_DIR"; PUSH_OK=0; return 1; }

  git add videos.json news.json uap_news.json sitemap.xml

  if git diff --cached --quiet; then
    log "INFO  No changes to commit this run"
    PUSH_OK=1
    return 0
  fi

  if ! git commit -m "auto update feeds $(date '+%Y-%m-%d')" >> "$LOG" 2>&1; then
    log "ERROR git commit failed"
    PUSH_OK=0
    return 1
  fi
  log "OK    git commit created"

  if git_push_with_token >> "$LOG" 2>&1; then
    log "OK    git push succeeded"
    rm -f "$PUSH_STATE_FILE"
    PUSH_OK=1
    return 0
  fi

  log "WARN  git push failed — retrying once immediately"
  sleep 10
  if git_push_with_token >> "$LOG" 2>&1; then
    log "OK    git push succeeded on immediate retry"
    rm -f "$PUSH_STATE_FILE"
    PUSH_OK=1
    return 0
  fi

  log "ERROR git push failed twice — deferring to hourly retry for up to ${MAX_PUSH_RETRY_HOURS}h"
  echo "$MAX_PUSH_RETRY_HOURS" > "$PUSH_STATE_FILE"
  PUSH_OK=0
  return 1
}

# --------------------------------------------------------------------------
# Deferred push retry mode — invoked hourly by a separate cron entry as:
#   maintain.sh --retry-push
# No-ops immediately if there's nothing pending, so it's cheap to run hourly.
# --------------------------------------------------------------------------

retry_push_mode() {
  load_env
  if [ ! -f "$PUSH_STATE_FILE" ]; then
    exit 0
  fi

  local remaining
  remaining=$(cat "$PUSH_STATE_FILE" 2>/dev/null || echo 0)
  cd "$REPO_DIR" || exit 1

  log "INFO  Deferred push retry — $remaining attempt(s) remaining"
  if git_push_with_token >> "$LOG" 2>&1; then
    log "OK    Deferred git push succeeded"
    rm -f "$PUSH_STATE_FILE"
    notify_telegram "✅ Flight Crew Files: deferred git push succeeded after earlier failure."
    exit 0
  fi

  remaining=$((remaining - 1))
  if [ "$remaining" -le 0 ]; then
    log "ERROR Deferred git push exhausted all retries over ${MAX_PUSH_RETRY_HOURS}h"
    rm -f "$PUSH_STATE_FILE"
    emergency_alert "git push has failed for ${MAX_PUSH_RETRY_HOURS} hours straight on flightcrewfiles. Manual intervention needed."
  else
    echo "$remaining" > "$PUSH_STATE_FILE"
    log "WARN  Deferred git push failed again — $remaining attempt(s) left"
  fi
  exit 0
}

# --------------------------------------------------------------------------
# Weekly tasks (Sunday only: `date +%u` == 7)
# --------------------------------------------------------------------------

run_weekly_tasks() {
  log "INFO  ---- Weekly tasks (Sunday) ----"

  if [ -n "${GTMETRIX_API_KEY:-}" ]; then
    log "INFO  Requesting GTmetrix report for flightcrewfiles.com"
    if ! curl -fsS --max-time 30 -u "${GTMETRIX_API_KEY}:" \
      -d "url=https://flightcrewfiles.com" \
      https://gtmetrix.com/api/2.0/tests >> "$LOG" 2>&1; then
      log "WARN  GTmetrix request failed (non-fatal)"
    else
      log "OK    GTmetrix test submitted"
    fi
  else
    log "INFO  GTMETRIX_API_KEY not set — skipping speed test"
  fi

  log "INFO  Checking external links in videos.json and news.json"
  python3 - <<'PYEOF' >> "$LOG" 2>&1
import json, urllib.request, urllib.error

def urls_from(path, key, field):
    try:
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        return [item.get(field) for item in data.get(key, []) if item.get(field)]
    except Exception as exc:
        print(f"ERROR reading {path}: {exc}")
        return []

targets = urls_from('videos.json', 'items', 'url') + urls_from('news.json', 'articles', 'url')
broken = 0
for url in targets:
    try:
        req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'fcf-maintenance/1.0'})
        urllib.request.urlopen(req, timeout=8)
    except Exception as exc:
        broken += 1
        print(f"WARN  broken link: {url} -> {exc}")
print(f"Link check complete: {len(targets)} checked, {broken} broken")
PYEOF

  if [ -f "$LOG" ]; then
    local size
    size=$(wc -c < "$LOG")
    if [ "$size" -gt 1048576 ]; then
      mv "$LOG" "${LOG}.old"
      : > "$LOG"
      log "INFO  maintenance.log rotated (was $((size / 1024)) KB)"
    fi
  fi
}

# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

main() {
  load_env
  log "============================================================"
  log "Starting daily maintenance run"

  fix_dns

  if ! check_connectivity; then
    emergency_alert "No internet connectivity after 3 retries — aborting today's run."
    exit 1
  fi

  run_feed_update

  CRITICAL_FAILURE=0
  VIDEOS_COUNT=0; NEWS_COUNT=0; UAP_COUNT=0; SITEMAP_OK=False
  verify_results

  PUSH_OK=0
  commit_and_push

  local push_status="Success"
  [ "$PUSH_OK" -eq 1 ] || push_status="Failed (deferred to hourly retry, up to ${MAX_PUSH_RETRY_HOURS}h)"

  local uap_note=""
  [ "$UAP_COUNT" -eq 0 ] 2>/dev/null && uap_note=" ⚠️ (empty this run)"

  local summary
  summary=$(cat <<EOF
Flight Crew Files — daily maintenance summary
Videos fetched: ${VIDEOS_COUNT}
News articles: ${NEWS_COUNT}
UAP articles: ${UAP_COUNT}${uap_note}
Sitemap regenerated: ${SITEMAP_OK}
Git push: ${push_status}
EOF
)

  if [ "$CRITICAL_FAILURE" -eq 1 ]; then
    emergency_alert "Critical verification failure — see maintenance.log.
${summary}"
  else
    notify_telegram "$summary"
  fi

  if [ "$(date +%u)" -eq 7 ]; then
    run_weekly_tasks
  fi

  log "Maintenance run complete"
  log "============================================================"
}

if [ "${1:-}" = "--retry-push" ]; then
  retry_push_mode
else
  main "$@"
fi
