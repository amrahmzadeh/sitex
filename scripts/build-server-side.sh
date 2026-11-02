#!/usr/bin/env bash
set -euo pipefail

SSH_CMD="ssh -i .deploy/hostinger_ed25519 -p 65002 -o StrictHostKeyChecking=no u310078278@195.35.33.112"

$SSH_CMD 'bash -s' << 'EOF'
set -euo pipefail
STAMP=$(date +%Y%m%d-%H%M%S)
NEW_ID="build-$STAMP"
ROOT="/home/u310078278/domains/onlive.az/site/hbuilds"
TARGET="$ROOT/versions/$NEW_ID/nodejs"

echo "1. Versiya açılır: $NEW_ID"
mkdir -p "$TARGET"
cp -al "$ROOT/current/nodejs/node_modules" "$TARGET/"
cp "$ROOT/config/.env" "$TARGET/.env"
tar -xzf "$ROOT/site_bundle.tar.gz" -C "$TARGET"

echo "2. Asılılıqlar yoxlanılır və quraşdırılır..."
export PATH=/opt/alt/alt-nodejs22/root/bin:$PATH
cd "$TARGET"
npm install --save-dev tailwindcss @tailwindcss/turbopack --no-audit --no-fund

echo "3. Prisma & Next build..."
npx prisma generate
npm run build

echo "4. Canlıya keçirilir..."
cd "$ROOT"
ln -sfn "versions/$NEW_ID" current.new
mv -T current.new current
mkdir -p "$TARGET/tmp"
touch "$TARGET/tmp/restart.txt"

echo "✓ BÜTÜN DƏYİŞİKLİKLƏR UĞURLA YAYIMLANDI: $NEW_ID"
EOF
