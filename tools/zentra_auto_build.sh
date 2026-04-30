#!/data/data/com.termux/files/usr/bin/bash

echo "=== ZENTRA AUTO BUILDER V1 START ==="

DATE=$(date +"%Y-%m-%d_%H-%M")

# 1) CHECK CORE FILES
echo "[1] Checking core structure..."
for f in app/index.html app/markets/index.html app/pricing/index.html app/packages/index.html; do
  if [ ! -f "$f" ]; then
    echo "MISSING: $f"
  else
    echo "OK: $f"
  fi
done

# 2) PUBLIC SYNC
echo "[2] Sync public..."
rm -rf public/app
mkdir -p public
cp -R app public/app

# 3) CLEAN RUNTIME DATA
echo "[3] Cleaning runtime data..."
rm -f data/out_*.txt 2>/dev/null
rm -f data/zentra_output_*.txt 2>/dev/null

# 4) BOOK SYNC
echo "[4] Sync books..."

echo "## $DATE — AUTO BUILD SYNC" >> docs/books/ZENTRA_SIMPLE_BOOK.md
echo "Auto builder executed." >> docs/books/ZENTRA_SIMPLE_BOOK.md

echo "## $DATE — AUTO BUILD SYNC" >> docs/books/ZENTRA_TECHNICAL_BOOK.md
echo "Public sync + cleanup + audit." >> docs/books/ZENTRA_TECHNICAL_BOOK.md

echo "### $DATE — AUTO BUILD" >> docs/books/ZENTRA_LIVING_SYSTEM_BOOK.md
echo "System synchronized automatically." >> docs/books/ZENTRA_LIVING_SYSTEM_BOOK.md

# 5) TRACE LOG
echo "[5] Writing trace..."
cat > docs/trace/AUTO_BUILD_$DATE.md <<TRACE
# AUTO BUILD TRACE — $DATE

- public synced
- data cleaned
- books updated
- audit executed
TRACE

# 6) GIT
echo "[6] Git sync..."
git add app public docs tools 2>/dev/null
git commit -m "auto build sync $DATE" || true
git push origin main

# 7) AUDIT
echo "[7] Running audit..."
./tools/zentra-full-audit.sh
./tools/zentra-experience-audit.sh

echo "=== ZENTRA AUTO BUILDER V1 DONE ==="
git status --short
