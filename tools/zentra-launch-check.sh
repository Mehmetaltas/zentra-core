#!/data/data/com.termux/files/usr/bin/bash

cd /data/data/com.termux/files/home/ZENTRA_MASTER/zentra-final || exit 1

LOG="logs/zentra-launch-check.log"
echo "=== ZENTRA LAUNCH CHECK $(date) ===" > "$LOG"

check_file(){
  if [ -f "$1" ]; then
    echo "PASS: $1" | tee -a "$LOG"
  else
    echo "FAIL: missing $1" | tee -a "$LOG"
  fi
}

echo "Checking required files..." | tee -a "$LOG"

check_file "app/cockpit-v2.html"
check_file "app/report-v3.html"
check_file "app/report-visual.html"
check_file "api/v1/send-report.js"
check_file "api/v1/report/view.js"
check_file "docs/strategy/launch/FINAL_LAUNCH_CONTROL.md"
check_file "docs/strategy/core/GLOBAL_CONTROL_LAYER.md"

echo "" | tee -a "$LOG"
echo "Git status:" | tee -a "$LOG"
git status --short | tee -a "$LOG"

echo "" | tee -a "$LOG"
echo "Open these in browser, not in bash:" | tee -a "$LOG"
echo "http://127.0.0.1:8080/app/cockpit-v2.html" | tee -a "$LOG"
echo "http://127.0.0.1:8080/app/report-v3.html" | tee -a "$LOG"
echo "http://127.0.0.1:8080/app/report-visual.html" | tee -a "$LOG"

echo "" | tee -a "$LOG"
echo "Starting local server on port 8080..."
echo "If port busy, stop old server with CTRL+C or use another terminal."
python3 -m http.server 8080
