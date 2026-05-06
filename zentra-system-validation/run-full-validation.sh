#!/data/data/com.termux/files/usr/bin/bash
cd ~/zentra-core-clean

# Önce proof/report döngüsünü güncelle
if [ -f zentra-telegram-stream/send-daily-proof.sh ]; then
  ./zentra-telegram-stream/send-daily-proof.sh >/dev/null 2>&1
fi

# Sonra tüm sistemi doğrula
node zentra-system-validation/src/full-system-validator.js

# Public proof dosyalarını güncelle
mkdir -p public/proof
cp zentra-proof-organization/results/final_combined_report.txt public/proof/final_combined_report.txt 2>/dev/null || true
cp zentra-proof-organization/results/telegram_proof_report.txt public/proof/telegram_proof_report.txt 2>/dev/null || true
cp zentra-proof-organization/results/technical_report.json public/proof/technical_report.json 2>/dev/null || true

# Telegram-ready birleşik günlük çıktı oluştur
cat > zentra-telegram-stream/results/daily_full_stream.txt <<EOT
$(cat zentra-telegram-stream/results/daily_telegram_report.txt 2>/dev/null)

----------------------------

$(cat zentra-telegram-stream/results/system_validation_telegram.txt 2>/dev/null)
EOT

echo ""
echo "DAILY FULL TELEGRAM STREAM:"
cat zentra-telegram-stream/results/daily_full_stream.txt
