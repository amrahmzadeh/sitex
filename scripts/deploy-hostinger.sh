#!/usr/bin/env bash
#
# site.onlive.az → Hostinger (Passenger + hbuilds) deploy.
#
#   bash scripts/deploy-hostinger.sh --check     # SSH + node/npm yoxlaması
#   bash scripts/deploy-hostinger.sh --status    # canlı versiya və son build
#   bash scripts/deploy-hostinger.sh             # deploy
#
# Layout (serverdə):
#   hbuilds/current -> versions/<id>            (symlink, Passenger bunu oxuyur)
#   hbuilds/versions/<id>/nodejs                (canlı tətbiq: .next, node_modules, public, server.js)
#   hbuilds/config/.env                         (production env — TOXUNULMUR)
#
# Deploy strategiyası: yeni versiya qovluğu (mövcudun hardlink surəti) → kod →
# npm ci → prisma generate + db push → build → prune → symlink swap → restart.
# Build uğursuz olarsa symlink dəyişmir, köhnə versiya işləməyə davam edir.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE=".deploy/hostinger.env"
[ -f "$ENV_FILE" ] || { echo "Xəta: $ENV_FILE tapılmadı." >&2; exit 1; }

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

: "${SSH_HOST:?SSH_HOST təyin edilməyib}"
: "${SSH_USER:?SSH_USER təyin edilməyib}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-.deploy/hostinger_ed25519}"
case "$SSH_KEY" in /*) ;; *) SSH_KEY="$ROOT/$SSH_KEY" ;; esac
SITE_URL="${SITE_URL:-https://site.onlive.az}"
REMOTE_ROOT="${REMOTE_ROOT:?REMOTE_ROOT təyin edilməyib}"
NODE_BIN="${NODE_BIN:-/opt/alt/alt-nodejs22/root/bin}"

SSH_OPTS=(
  -p "$SSH_PORT"
  -i "$SSH_KEY"
  -o IdentitiesOnly=yes
  -o BatchMode=yes
  -o StrictHostKeyChecking=accept-new
  -o ConnectTimeout=20
  -o ServerAliveInterval=20
)

remote() {
  ssh "${SSH_OPTS[@]}" "$SSH_USER@$SSH_HOST" "$@"
}

MODE="deploy"
case "${1:-}" in
  --check) MODE="check" ;;
  --status) MODE="status" ;;
  -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
esac

echo "→ SSH: $SSH_USER@$SSH_HOST:$SSH_PORT"
remote "echo '  server:' \$(hostname) && echo '  node:' \$($NODE_BIN/node -v) && echo '  npm:' \$($NODE_BIN/npm -v)"

if [ "$MODE" = "check" ]; then
  remote "echo '  current ->' \$(readlink '$REMOTE_ROOT/current')"
  remote "du -sh '$REMOTE_ROOT/current/nodejs/.next' '$REMOTE_ROOT/current/nodejs/public' 2>/dev/null"
  exit 0
fi

if [ "$MODE" = "status" ]; then
  remote "echo 'current ->' \$(readlink '$REMOTE_ROOT/current'); ls -1 '$REMOTE_ROOT/versions' | tail -5; echo '--- son build logu ---'; ls -t '$REMOTE_ROOT/logs' | head -3"
  exit 0
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
NEW_ID="manual-$STAMP"
NEW_DIR="$REMOTE_ROOT/versions/$NEW_ID/nodejs"
PREV_TARGET="$(remote "readlink '$REMOTE_ROOT/current'" | tr -d '\r')"

echo "→ Yeni versiya hazırlanır: $NEW_ID (əvvəlki: $PREV_TARGET)"
remote "set -e; \
  export PATH=\"$NODE_BIN:\$PATH\"; \
  mkdir -p '$REMOTE_ROOT/versions/$NEW_ID'; \
  cp -al '$REMOTE_ROOT/current/.' '$REMOTE_ROOT/versions/$NEW_ID/'; \
  echo '  hardlink surəti hazır'"

echo "→ Runtime .env hazırlanır (yoxdursa config/.env-dən)..."
remote "test -f '$NEW_DIR/.env' || { cp '$REMOTE_ROOT/config/.env' '$NEW_DIR/.env' && chmod 600 '$NEW_DIR/.env'; echo '  .env config-dən kopyalandı'; }; echo '  .env hazır'"

echo "→ Kod göndərilir (tar over ssh)..."
tar -czf - \
  --exclude='./node_modules' \
  --exclude='./.next' \
  --exclude='./.git' \
  --exclude='./.deploy' \
  --exclude='./.freebuff' \
  --exclude='./shared_uploads' \
  --exclude='./public/uploads' \
  --exclude='./.env' \
  --exclude='./.env.local' \
  --exclude='./.env.production' \
  --exclude='./coverage' \
  --exclude='*.log' \
  . | remote "tar -xzf - -C '$NEW_DIR' && echo '  kod köçürüldü'"

echo "→ Serverdə build (npm ci → prisma generate → db push → next build)..."
remote "set -e; \
  export PATH=\"$NODE_BIN:\$PATH\"; \
  cd '$NEW_DIR'; \
  set -a; . '$REMOTE_ROOT/config/.env'; set +a; \
  npm ci --no-audit --no-fund --include=dev 2>&1 | tail -3; \
  npx prisma generate 2>&1 | tail -2; \
  npx prisma db push --skip-generate 2>&1 | tail -4; \
  npm run build 2>&1 | tail -25"

echo "→ Production asılılıqlarına keçid (dev paketlər silinir)..."
remote "set -e; export PATH=\"$NODE_BIN:\$PATH\"; cd '$NEW_DIR'; npm prune --omit=dev --no-audit --no-fund 2>&1 | tail -2"

echo "→ Symlink dəyişdirilir və tətbiq yenidən başladılır..."
remote "set -e; \
  cd '$REMOTE_ROOT'; \
  ln -sfn 'versions/$NEW_ID' current.new && mv -T current.new current; \
  mkdir -p '$NEW_DIR/tmp' && touch '$NEW_DIR/tmp/restart.txt'; \
  echo '  current ->' \$(readlink current)"

echo "→ Sağlamlıq yoxlaması: $SITE_URL"
CODE="000"
for _ in $(seq 1 20); do
  CODE="$(curl -s -o /dev/null -m 10 -w '%{http_code}' "$SITE_URL" || echo '000')"
  [ "$CODE" = "200" ] && break
  sleep 3
done

if [ "$CODE" != "200" ]; then
  echo "✗ Sağlamlıq yoxlaması uğursuz (status $CODE) — əvvəlki versiyaya qaytarılır." >&2
  remote "cd '$REMOTE_ROOT'; ln -sfn '$PREV_TARGET' current.new && mv -T current.new current; touch '$REMOTE_ROOT/current/nodejs/tmp/restart.txt'; echo '  geri qaytarıldı:' \$(readlink current)"
  exit 1
fi

echo "✓ Deploy uğurlu: $NEW_ID"
echo "  Geri qaytarma: bash scripts/deploy-hostinger.sh --status, sonra symlink-i əvvəlki versiyaya yönəldin."
