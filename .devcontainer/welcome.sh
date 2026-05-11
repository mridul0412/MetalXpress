#!/usr/bin/env bash
# Welcome banner shown when terminal opens

GOLD='\033[38;5;220m'
DIM='\033[2m'
GREEN='\033[32m'
RESET='\033[0m'

cat <<EOF

${GOLD}╔═══════════════════════════════════════════════════════════════════╗
║  ☼  BhavX  │  ⟨X⟩   India's Metal Exchange                        ║
╚═══════════════════════════════════════════════════════════════════╝${RESET}

${DIM}Codespace dev environment · pushes go to main · branch:${RESET} $(git branch --show-current 2>/dev/null || echo 'main')

${GREEN}Commands:${RESET}
  ${GOLD}claude${RESET}        Start Claude Code agent (your AI pair)
  ${GOLD}dev-fe${RESET}        Start frontend (Vite, port 5173)
  ${GOLD}dev-be${RESET}        Start backend (Express, port 3001)
  ${GOLD}gst${RESET}           Git status
  ${GOLD}glg${RESET}           Git log (last 10)

${DIM}First time using Claude here? Run \`claude\` and follow the auth prompt.${RESET}

EOF
