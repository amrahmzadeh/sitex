#!/usr/bin/env bash
set -euo pipefail

SSH_CMD="ssh -i .deploy/hostinger_ed25519 -p 65002 -o StrictHostKeyChecking=no u310078278@195.35.33.112"

$SSH_CMD 'bash -s' << 'EOF'
set -euo pipefail
STAMP=$(date +%Y%m%d-%H%M%S)
NEW_ID="live-$STAMP"
ROOT="/home/u310078278/domains/onlive.az/site/hbuilds"
TARGET="$ROOT/versions/$NEW_ID/nodejs"

echo "1. Versiya qovluğu hazırlanır: $NEW_ID"
mkdir -p "$TARGET"
cp -al "$ROOT/current/nodejs/node_modules" "$TARGET/"
cp "$ROOT/config/.env" "$TARGET/.env"

echo "2. Kod və build çıxarılır..."
tar -xzf "$ROOT/site_bundle.tar.gz" -C "$TARGET"
mkdir -p "$TARGET/.next"
tar -xzf "$ROOT/server_only.tar.gz" -C "$TARGET/.next"
tar -xzf "$ROOT/static_only.tar.gz" -C "$TARGET/.next"

echo "3. Prisma Client generasiyası..."
export PATH=/opt/alt/alt-nodejs22/root/bin:$PATH
cd "$TARGET"
npx prisma generate

echo "4. Canlıya keçid və restart..."
cd "$ROOT"
ln -sfn "versions/$NEW_ID" current.new
mv -T current.new current
mkdir -p "$TARGET/tmp"
touch "$TARGET/tmp/restart.txt"

echo "✓ CANLIYA KEÇİRİLDİ: $NEW_ID"
EOF
