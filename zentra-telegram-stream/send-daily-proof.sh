#!/data/data/com.termux/files/usr/bin/bash
cd ~/zentra-core-clean
node zentra-proof-organization/src/proof-organization-core.js
cp zentra-proof-organization/results/final_combined_report.txt public/proof/final_combined_report.txt
cp zentra-proof-organization/results/telegram_proof_report.txt public/proof/telegram_proof_report.txt
echo "Telegram-ready report:"
cat zentra-telegram-stream/results/daily_telegram_report.txt
