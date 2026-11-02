#!/usr/bin/env bash
set -euo pipefail

SSH_CMD="ssh -i .deploy/hostinger_ed25519 -p 65002 -o StrictHostKeyChecking=no u310078278@195.35.33.112"

$SSH_CMD 'bash -s' << 'EOF'
set -euo pipefail
STAMP=$(date +%Y%m%d-%H%M%S)
NEW_ID="prod-$STAMP"
ROOT="/home/u310078278/domains/onlive.az/site/hbuilds"
TARGET="$ROOT/versions/$NEW_ID/nodejs"

echo "1. Versiya yaradılır: $NEW_ID"
mkdir -p "$TARGET"
cp -al "$ROOT/current/nodejs/node_modules" "$TARGET/"
cp "$ROOT/config/.env" "$TARGET/.env"

echo "2. Paketlər açılır..."
tar -xzf "$ROOT/site_bundle.tar.gz" -C "$TARGET"
tar -xzf "$ROOT/next_build.tar.gz" -C "$TARGET"

echo "3. Prisma və aktivləşdirmə..."
export PATH=/opt/alt/alt-nodejs22/root/bin:$PATH
cd "$TARGET"
npx prisma generate

cd "$ROOT"
ln -sfn "versions/$NEW_ID" current.new
mv -T current.new current
mkdir -p "$TARGET/tmp"
touch "$TARGET/tmp/restart.txt"

echo "✓ BÜTÜN DƏYİŞİKLİKLƏR CANLIYA VERİLDİ: $NEW_ID"
EOF

