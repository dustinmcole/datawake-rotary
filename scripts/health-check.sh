#!/bin/bash
# Health check for bryn-rotary — runs every 30 minutes via cron
# Tests: OpenClaw gateway, Slack connection
# Posts status to central monitoring on bryn-monitor
set -euo pipefail

ALERT_CHANNEL="slack:#internal-rotary"
MONITOR_HOST="http://137.184.4.57"
CLIENT="bryn-fullerton-rotary"
STATUS="healthy"
FAILURES=""

# Check OpenClaw gateway
if ! systemctl is-active --quiet openclaw; then
  STATUS="unhealthy"
  FAILURES="${FAILURES}openclaw-down "
fi

# Check gateway port
if ! curl -sf http://127.0.0.1:18789/health >/dev/null 2>&1; then
  # Try basic TCP check
  if ! timeout 5 bash -c "echo > /dev/tcp/127.0.0.1/18789" 2>/dev/null; then
    STATUS="degraded"
    FAILURES="${FAILURES}gateway-unreachable "
  fi
fi

# Check LLM proxy
if ! curl -sf http://127.0.0.1:4010/ >/dev/null 2>&1; then
  # Proxy might not respond to GET / but should be listening
  if ! timeout 5 bash -c "echo > /dev/tcp/127.0.0.1/4010" 2>/dev/null; then
    STATUS="degraded"
    FAILURES="${FAILURES}proxy-down "
  fi
fi

# Check Tailscale
if ! tailscale status >/dev/null 2>&1; then
  STATUS="degraded"
  FAILURES="${FAILURES}tailscale-disconnected "
fi

# Log result
echo "[$(date -Iseconds)] status=$STATUS failures=${FAILURES:-none}"

# Post to monitoring (best-effort)
curl -sf -X POST "${MONITOR_HOST}/api/health" \
  -H "Content-Type: application/json" \
  -d "{\"client\": \"${CLIENT}\", \"status\": \"${STATUS}\", \"failures\": \"${FAILURES:-none}\", \"timestamp\": \"$(date -Iseconds)\"}" \
  2>/dev/null || true
