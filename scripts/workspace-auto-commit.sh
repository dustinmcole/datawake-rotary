#!/bin/bash
# Workspace auto-commit — runs every 15 minutes via cron
# Commits workspace changes (MEMORY.md, config, skills) for audit trail
set -euo pipefail

WORKSPACE_DIR="/opt/bryn/rotary/workspace"

cd "$WORKSPACE_DIR" || exit 1

# Initialize git if needed
if [ ! -d .git ]; then
  git init
  git config user.name "Bryn (auto-commit)"
  git config user.email "bryn@datawake.io"
  cat > .gitignore << 'GITIGNORE'
*.sqlite
*.db
*.log
*.tmp
.env
.env.*
node_modules/
__pycache__/
*.pyc
.DS_Store
GITIGNORE
fi

# Stage all changes
git add -A

# Check if there are changes to commit
if ! git diff --cached --quiet; then
  # Build descriptive commit message
  CHANGED=$(git diff --cached --name-only | head -5 | tr '\n' ', ' | sed 's/,$//')
  git commit -m "auto: ${CHANGED}" --no-gpg-sign
fi
