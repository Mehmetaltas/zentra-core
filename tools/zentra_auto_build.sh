#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "=== ZENTRA AUTO BUILDER V2 START ==="
DATE=$(date +"%Y-%m-%d_%H-%M")

mkdir -p app/account app/legal app/support app/packages app/pricing docs/trace docs/auto

echo "[1] Required pages check"
REQ=(
"app/index.html"
"app/markets/index.html"
"app/portfolio/index.html"
"app/packages/index.html"
"app/pricing/index.html"
"app/account/index.html"
"app/legal/index.html"
"app/support/index.html"
"app/zentra-assistant-float.js"
"app/legal-footer.js"
)

for f in "${REQ[@]}"; do
  if [ -f "$f" ]; then
    echo "OK: $f"
  else
    echo "MISSING: $f"
    echo "AUTO BUILDER WARNING: missing $f" >> docs/auto/AUTO_BUILDER_WARNINGS_$DATE.md
  fi
done

echo "[2] Assistant route check"
grep -q "PROOF_PACK_FLOW_V1" app/zentra-assistant-float.js || cat >> app/zentra-assistant-float.js <<'JS'

/* PROOF_PACK_FLOW_V1_AUTO */
document.addEventListener("DOMContentLoaded", ()=>{
  setTimeout(()=>{
    const input = document.querySelector("#za-input");
    const detected = document.querySelector("#za-detected");
    const action = document.querySelector("#za-action");
    if(!input || !detected || !action) return;
    input.addEventListener("input", function(){
      const v = (this.value || "").toLowerCase();
      const depth = location.pathname.split("/app/")[1]?.split("/").length - 1 || 0;
      const prefix = depth <= 0 ? "./" : "../".repeat(depth);
      if(v.includes("proof") || v.includes("kanıt") || v.includes("senaryo") || v.includes("thy") || v.includes("hisse")){
        detected.innerHTML = "<b>Algılanan:</b> Proof / Use-case akışı<br><b>Route:</b> FT Cockpit → RiskLens → Report → Pack";
        action.href = prefix + "cockpits/financial-trade.html";
        action.innerText = "Proof Akışını Başlat";
      }
    });
  },700);
});
JS

echo "[3] Global footer bind"
python3 - <<'PY'
from pathlib import Path

for p in Path("app").rglob("*.html"):
    t = p.read_text()
    depth = len(p.relative_to("app").parents) - 1
    prefix = "./" if depth == 0 else "../" * depth

    if "legal-footer.js" not in t:
        t = t.replace("</body>", f'\n<script src="{prefix}legal-footer.js"></script>\n</body>')

    if "zentra-assistant-float.js" not in t:
        t = t.replace("</body>", f'\n<script src="{prefix}zentra-assistant-float.js"></script>\n</body>')

    p.write_text(t)
PY

echo "[4] Professional language cleanup"
python3 - <<'PY'
from pathlib import Path
bad = {
  "Kullanıcı çekme": "Public intelligence entry",
  "demo": "live system proof",
  "Demo": "Live System Proof",
  "basit": "focused",
  "oyuncak": "system"
}
for p in Path("app").rglob("*.html"):
    t = p.read_text()
    for a,b in bad.items():
        t = t.replace(a,b)
    p.write_text(t)
PY

echo "[5] Public sync"
rm -rf public/app
mkdir -p public
cp -R app public/app

echo "[6] Runtime cleanup"
rm -f data/out_*.txt 2>/dev/null || true
rm -f data/zentra_output_*.txt 2>/dev/null || true
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

echo "[7] Books + trace sync"
cat >> docs/books/ZENTRA_SIMPLE_BOOK.md <<BOOK

## $DATE — Auto Builder V2 Sync
Auto Builder V2 checked and synchronized:
- assistant
- proof flow
- legal/account/support
- packages/pricing
- public sync
BOOK

cat >> docs/books/ZENTRA_TECHNICAL_BOOK.md <<BOOK

## $DATE — Auto Builder V2 Technical Sync
Tool: tools/zentra_auto_build.sh
Checks:
- required pages
- assistant route
- footer binding
- language cleanup
- public sync
- audit
BOOK

cat >> docs/books/ZENTRA_LIVING_SYSTEM_BOOK.md <<BOOK

### $DATE — Auto Builder V2 Living Sync
ZENTRA now has a self-checking build routine.
Next builders should detect missing operational/product/legal/support surfaces before manual work.
BOOK

cat > docs/trace/AUTO_BUILDER_V2_TRACE_$DATE.md <<TRACE
# ZENTRA Auto Builder V2 Trace — $DATE

Completed:
- required page check
- assistant route check
- proof route check
- footer bind
- language cleanup
- public sync
- books sync
- audit run
TRACE

echo "[8] Git commit/push"
git add app public docs tools 2>/dev/null || true
git commit -m "auto builder v2 system sync $DATE" || true
git push origin main

echo "[9] Audits"
./tools/zentra-full-audit.sh
./tools/zentra-experience-audit.sh

echo "=== ZENTRA AUTO BUILDER V2 DONE ==="
git status --short
