#!/usr/bin/env bash
# BhavX Codespace setup — runs once when the codespace is created
set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║  🛡️  BhavX Codespace Setup                                        ║"
echo "║  India's Metal Exchange — dev environment provisioning            ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# ── 1. Configure git (Mridul's identity) ──────────────────────────────────
echo "→ Configuring git..."
git config --global user.name "mridul0412"
git config --global user.email "mridul041298@gmail.com"
git config --global pull.rebase false
git config --global init.defaultBranch main

# ── 2. Install Claude Code CLI ────────────────────────────────────────────
echo "→ Installing Claude Code CLI..."
npm install -g @anthropic-ai/claude-code 2>&1 | tail -5 || echo "  (Claude Code install may need manual retry — run: npm install -g @anthropic-ai/claude-code)"

# ── 3. Install project dependencies ───────────────────────────────────────
echo "→ Installing frontend dependencies..."
cd "$(dirname "$0")/.."
if [ -d "frontend" ]; then
  cd frontend && npm install --no-audit --no-fund 2>&1 | tail -3
  cd ..
fi

echo "→ Installing backend dependencies..."
if [ -d "backend" ]; then
  cd backend && npm install --no-audit --no-fund 2>&1 | tail -3
  cd ..
fi

# ── 4. Set up convenience aliases ─────────────────────────────────────────
echo "→ Setting up shell aliases..."
cat >> ~/.zshrc <<'EOF'

# BhavX dev aliases
alias dev-fe="cd /workspaces/MetalXpress/frontend && npm run dev"
alias dev-be="cd /workspaces/MetalXpress/backend && npm run dev"
alias bhavx="cd /workspaces/MetalXpress"
alias gst="git status -sb"
alias glg="git log --oneline -10"

# Run welcome banner on shell startup (skip if non-interactive)
[[ $- == *i* ]] && [ -f /workspaces/MetalXpress/.devcontainer/welcome.sh ] && bash /workspaces/MetalXpress/.devcontainer/welcome.sh
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "Quick start:"
echo "  • Run 'claude' to start Claude Code"
echo "  • Run 'dev-fe' to start frontend (port 5173)"
echo "  • Run 'dev-be' to start backend (port 3001)"
echo ""
