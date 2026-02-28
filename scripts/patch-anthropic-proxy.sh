#!/bin/bash
# Patch pi-ai's anthropic.js to respect ANTHROPIC_BASE_URL env var
# Re-run after every OpenClaw update
set -euo pipefail

OPENCLAW_DIR="/usr/lib/node_modules/openclaw"

# Find the anthropic.js file in pi-ai
ANTHROPIC_JS=$(find "$OPENCLAW_DIR" -path "*/pi-ai/*" -name "anthropic.js" 2>/dev/null | head -1)

if [ -z "$ANTHROPIC_JS" ]; then
  echo "[patch] Could not find pi-ai anthropic.js — skipping"
  exit 0
fi

echo "[patch] Found: $ANTHROPIC_JS"

# Check if already patched
if grep -q "process.env.ANTHROPIC_BASE_URL" "$ANTHROPIC_JS"; then
  echo "[patch] Already patched — no changes needed"
  exit 0
fi

# Backup
cp "$ANTHROPIC_JS" "${ANTHROPIC_JS}.bak"

# Patch: replace baseURL: model.baseUrl with env var fallback
sed -i 's/baseURL: model\.baseUrl/baseURL: process.env.ANTHROPIC_BASE_URL || model.baseUrl/g' "$ANTHROPIC_JS"

# Verify
PATCHED=$(grep -c "process.env.ANTHROPIC_BASE_URL" "$ANTHROPIC_JS")
echo "[patch] Applied $PATCHED patches to $ANTHROPIC_JS"
