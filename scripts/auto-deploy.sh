#!/usr/bin/env bash
#
# Tüm değişiklikleri GitHub'a push eder ve Hostinger'a deploy eder.
#
#   bash scripts/auto-deploy.sh "commit mesajı"
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MSG="${1:-auto-deploy $(date +%Y%m%d-%H%M%S)}"

# Değişiklik var mı?
if ! git diff --quiet && ! git diff --cached --quiet; then
  echo "→ Değişiklikler commit ediliyor: $MSG"
  git add -A
  git commit -m "$MSG"
else
  echo "→ Yeni değişiklik yok, mevcut commit push edilecek."
fi

# GitHub remote kontrolü
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "✗ GitHub remote (origin) tanımlı değil. Önce ekleyin:" >&2
  echo "    git remote add origin https://github.com/KULLANICI/REPO.git" >&2
  exit 1
fi

echo "→ GitHub'a push ediliyor..."
git push -u origin HEAD

echo "→ Hostinger'a deploy ediliyor..."
bash scripts/deploy-hostinger.sh

echo "✓ Tüm işlemler tamamlandı."
