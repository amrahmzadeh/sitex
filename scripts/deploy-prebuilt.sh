#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

STAMP=$(date +%Y%m%d-%H%M%S)
NEW_ID="manual-$STAMP"
REMOTE_ROOT="/home/u310078278/domains/onlive.az/site/hbuilds"
NEW_DIR="$REMOTE_ROOT/versions/$NEW_ID/nodejs"
SSH_CMD="ssh -i .deploy/hostinger_ed25519 -p 65002 -o StrictHostKeyChecking=no u310078278@195.35.33.112"

echo "1. Serverdə qovluq və env hazırlanır..."
$SSH_CMD "mkdir -p '$REMOTE_ROOT/versions/$NEW_ID' && cp -al '$REMOTE_ROOT/current/.' '$REMOTE_ROOT/versions/$NEW_ID/' && test -f '$NEW_DIR/.env' || cp '$REMOTE_ROOT/config/.env' '$NEW_DIR/.env'"

echo "2. Hazır kod və lokal build edilmiş .next arxivlənir və göndərilir..."
ARCHIVE="/tmp/deploy_${STAMP}.tar.gz"
tar -czf "$ARCHIVE" \
  --exclude='node_modules' \
  --exclude='./node_modules' \
  --exclude='.git' \
  --exclude='./.git' \
  --exclude='.deploy' \
  --exclude='./.deploy' \
  --exclude='.freebuff' \
  --exclude='./.freebuff' \
  --exclude='shared_uploads' \
  --exclude='./shared_uploads' \
  --exclude='public/uploads' \
  --exclude='./public/uploads' \
  --exclude='.env*' \
  --exclude='./.env*' \
  --exclude='coverage' \
  --exclude='./coverage' \
  --exclude='*.log' \
  --exclude='*.tar.gz' \
  --exclude='.next/cache' \
  --exclude='./.next/cache' \
  .

scp -i .deploy/hostinger_ed25519 -P 65002 -o StrictHostKeyChecking=no "$ARCHIVE" u310078278@195.35.33.112:"$REMOTE_ROOT/deploy_${STAMP}.tar.gz"
rm -f "$ARCHIVE"

$SSH_CMD "tar -xzf '$REMOTE_ROOT/deploy_${STAMP}.tar.gz' -C '$NEW_DIR' && rm -f '$REMOTE_ROOT/deploy_${STAMP}.tar.gz'"

echo "3. Prisma client yenilənir və tətbiq başladılır..."
$SSH_CMD "export PATH=/opt/alt/alt-nodejs22/root/bin:\$PATH && cd '$NEW_DIR' && npx prisma generate && cd '$REMOTE_ROOT' && ln -sfn 'versions/$NEW_ID' current.new && mv -T current.new current && mkdir -p '$NEW_DIR/tmp' && touch '$NEW_DIR/tmp/restart.txt'"

echo "✓ Tamamlandı: $NEW_ID"

