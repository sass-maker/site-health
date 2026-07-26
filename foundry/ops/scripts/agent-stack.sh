#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FLEET_OPS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FOUNDRY_ROOT="$(cd "$FLEET_OPS_DIR/.." && pwd)"
FLEET_ROOT="$(cd "$FOUNDRY_ROOT/.." && pwd)"
LEGACY_FLEET_OPS_DIR="$FLEET_ROOT/fleet-ops"
EXPOSED_FLEET_SKILLS=(
  daily-learning
  design-workflow
  fleet-deploy-parity
  fleet-ops
  mobile-task-control
  name-domains
  site-health
  spec-driven
  token-budget
)

usage() {
  cat <<'EOF'
usage: agent-stack.sh <command>

Commands:
  install-skills  Link Fleet Ops skills into local agent runtimes.
  install-agents  Register Fleet support projects as OpenClaw agents.
  mobile          Show or configure mobile control surfaces.
  install-cron    Install Fleet Ops Codex cron jobs.
  remove-cron     Remove Fleet Ops Codex cron jobs.
  cron-ui         Render the local Codex cron dashboard.
  notify          Send or inspect a durable Fleet notification.
  console         Start the Fleet Ops public console.
  check           Validate local OpenClaw, optional Hermes, Telegram, and security state.
  start           Start OpenClaw, console, notifications, and scheduled work.
  pause           Stop OpenClaw, console, notifications, and scheduled work.
  resume          Start OpenClaw, console, notifications, and scheduled work.
  restart         Restart OpenClaw, the console, notifications, and scheduled work.
  status          Show gateway, cron, mobile, and paired-device status.
EOF
}

install_impeccable() {
  local skill_file="$FLEET_ROOT/.agents/skills/impeccable/SKILL.md"
  local policy_file="$FLEET_OPS_DIR/config/design-workflow.json"
  local expected_version
  local installed_version

  expected_version="$(
    node -e '
      const policy = require(process.argv[1]);
      if (!/^\d+\.\d+\.\d+$/.test(policy.impeccableVersion ?? "")) process.exit(1);
      process.stdout.write(policy.impeccableVersion);
    ' "$policy_file"
  )" || {
    printf 'Invalid Impeccable version policy: %s\n' "$policy_file" >&2
    return 1
  }
  installed_version="$(
    sed -nE 's/^version:[[:space:]]*["'\'']?([^"'\'']+[[:alnum:]])["'\'']?[[:space:]]*$/\1/p' \
      "$skill_file" 2>/dev/null | head -n 1
  )"

  if [[ "$installed_version" == "$expected_version" ]]; then
    return 0
  fi

  if ! command -v npx >/dev/null 2>&1; then
    printf 'npx is required to install the Impeccable design skill.\n' >&2
    return 1
  fi

  (
    cd "$FLEET_ROOT"
    npx --yes "impeccable@$expected_version" install \
      --providers=codex,claude \
      --scope=project
  )

  installed_version="$(
    sed -nE 's/^version:[[:space:]]*["'\'']?([^"'\'']+[[:alnum:]])["'\'']?[[:space:]]*$/\1/p' \
      "$skill_file" 2>/dev/null | head -n 1
  )"
  if [[ "$installed_version" != "$expected_version" ]]; then
    printf 'Impeccable install drift: expected %s, found %s\n' \
      "$expected_version" "${installed_version:-missing}" >&2
    return 1
  fi
}

is_exposed_fleet_skill() {
  local candidate="$1"
  local exposed

  for exposed in "${EXPOSED_FLEET_SKILLS[@]}"; do
    [[ "$candidate" == "$exposed" ]] && return 0
  done
  return 1
}

link_fleet_skills() {
  local destination="$1"
  local managed
  local source
  local name

  mkdir -p "$destination"

  for managed in "$destination"/*; do
    [[ -L "$managed" ]] || continue
    case "$(readlink "$managed")" in
      "$FLEET_OPS_DIR"/skills/*|"$LEGACY_FLEET_OPS_DIR"/skills/*|"$LEGACY_FLEET_OPS_DIR"/psi-swarm)
        name="$(basename "$managed")"
        if ! is_exposed_fleet_skill "$name"; then
          rm "$managed"
        fi
        ;;
    esac
  done

  for name in "${EXPOSED_FLEET_SKILLS[@]}"; do
    source="$FLEET_OPS_DIR/skills/$name"
    [[ -d "$source" ]] || {
      printf 'Missing exposed Fleet skill: %s\n' "$source" >&2
      return 1
    }
    ln -sfn "$source" "$destination/$name"
  done
}

link_teammate_parent() {
  local destination="$1"
  local managed

  mkdir -p "$destination"
  for managed in "$destination"/call-*; do
    [[ -L "$managed" ]] || continue
    case "$(readlink "$managed")" in
      "$FLEET_OPS_DIR"/teammates/skills/*|"$LEGACY_FLEET_OPS_DIR"/teammates/skills/*)
        [[ "$(basename "$managed")" == "call-teammate" ]] || rm "$managed"
        ;;
    esac
  done
  ln -sfn "$FLEET_OPS_DIR/teammates/skills/call-teammate" "$destination/call-teammate"
}

install_skills() {
  local dir

  # Impeccable is a machine-installed third-party skill. Its generated files
  # stay untracked; child projects receive local links below.
  install_impeccable

  # Keep Codex skills local to Fleet instead of loading them in every repo.
  dir="$FLEET_ROOT/.agents/skills"
  link_fleet_skills "$dir"
  link_teammate_parent "$dir"
  "$FLEET_OPS_DIR/scripts/link-project-agent-assets.sh" --skills-only

  # Gateway runtimes are not repository-scoped, so keep user-level links.
  for dir in "$HOME/.openclaw/skills"; do
    link_fleet_skills "$dir"
    link_teammate_parent "$dir"
  done
  if [ -d "$HOME/.hermes/skills" ]; then
    dir="$HOME/.hermes/skills"
    link_fleet_skills "$dir"
    link_teammate_parent "$dir"
  fi
}

case "${1:-}" in
  install-skills) install_skills ;;
  install-agents) "$FLEET_OPS_DIR/scripts/agent-bin/setup-openclaw-support-agents" "${@:2}" ;;
  mobile) "$FLEET_OPS_DIR/scripts/agent-bin/mobile-control" "${@:2}" ;;
  install-cron) "$FLEET_OPS_DIR/scripts/agent-bin/install-codex-cron" ;;
  remove-cron) "$FLEET_OPS_DIR/scripts/agent-bin/install-codex-cron" --remove ;;
  cron-ui) "$FLEET_OPS_DIR/scripts/agent-bin/render-codex-cron-ui" ;;
  notify) "$FLEET_OPS_DIR/scripts/agent-bin/fleet-notify" "${@:2}" ;;
  console) "$FLEET_OPS_DIR/scripts/agent-bin/ops-console" start ;;
  check)
    openclaw config validate
    openclaw plugins doctor
    openclaw channels status --deep || true
    openclaw security audit
    if command -v hermes >/dev/null 2>&1; then
      hermes doctor || true
      hermes status --deep || true
    fi
    "$FLEET_OPS_DIR/scripts/agent-bin/mobile-control" status
    ;;
  start|resume)
    "$FLEET_OPS_DIR/scripts/agent-stack.sh" install-skills
    openclaw plugins enable telegram >/dev/null 2>&1 || true
    openclaw gateway start
    "$FLEET_OPS_DIR/scripts/agent-bin/ops-console" start
    "$FLEET_OPS_DIR/scripts/agent-bin/fleet-notification-service" start
    "$FLEET_OPS_DIR/scripts/agent-bin/install-codex-cron"
    ;;
  pause)
    openclaw gateway stop
    "$FLEET_OPS_DIR/scripts/agent-bin/ops-console" stop
    "$FLEET_OPS_DIR/scripts/agent-bin/fleet-notification-service" stop
    "$FLEET_OPS_DIR/scripts/agent-bin/install-codex-cron" --remove
    ;;
  restart)
    openclaw gateway restart
    "$FLEET_OPS_DIR/scripts/agent-bin/ops-console" restart
    "$FLEET_OPS_DIR/scripts/agent-bin/fleet-notification-service" restart
    "$FLEET_OPS_DIR/scripts/agent-bin/install-codex-cron"
    ;;
  status)
    openclaw status --all
    openclaw channels list --all | sed -n '/Telegram/p' || true
    if command -v hermes >/dev/null 2>&1; then
      hermes gateway status || true
      hermes status | sed -n '1,120p' || true
    fi
    openclaw cron status
    openclaw nodes status
    "$FLEET_OPS_DIR/scripts/agent-bin/ops-console" status
    "$FLEET_OPS_DIR/scripts/agent-bin/fleet-notification-service" status
    "$FLEET_OPS_DIR/scripts/agent-bin/fleet-notify" status
    "$FLEET_OPS_DIR/scripts/agent-bin/mobile-control" status
    crontab -l 2>/dev/null | sed -n '/BEGIN FLEET OPS CODEX CRON/,/END FLEET OPS CODEX CRON/p' || true
    ;;
  -h|--help|help|"") usage ;;
  *)
    usage >&2
    exit 2
    ;;
esac
