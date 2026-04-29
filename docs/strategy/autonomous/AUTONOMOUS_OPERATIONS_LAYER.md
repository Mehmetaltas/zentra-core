# ZENTRA — AUTONOMOUS OPERATIONS LAYER

## Durum
ACTIVE — SYSTEM WIDE

---

## Amaç

ZENTRA içinde manuel kalmış tüm işlemleri tespit etmek, otomatik yürütmek, arızayı düzeltmek ve gerekiyorsa governance’a taşımak.

---

## Kapsam

Bu katman tüm sistemde geçerlidir:

- Core
- Cockpit
- Report
- Assistant
- API
- Token / Access
- Delivery
- Legal / Compliance
- Accessibility
- Launch
- Git / logs / files

---

## Çalışma Mantığı

ZENTRA:

1. kontrol eder
2. eksik bulur
3. düzeltir
4. loglar
5. tekrar kontrol eder
6. gerekirse governance hold üretir

---

## Otomatikleşecek İşler

- dosya varlık kontrolü
- eksik dosya fallback üretimi
- local server başlatma
- doğru link üretimi
- report / cockpit / visual kontrolü
- API endpoint kontrolü
- git status kontrolü
- log üretimi
- accessibility kontrol izi
- legal / governance bağlantı kontrolü
- launch readiness kontrolü

---

## Governance Hold Gerektiren Durumlar

Şunlar otomatik geçilmez:

- audit dosyası yok
- legal framework yok
- access/token katmanı yok
- report delivery API yok
- cockpit ana yüz yok
- global control layer yok
- güvenlik governance kapalı değil

---

## Kilit Cümle

ZENTRA kullanıcıdan sistem bilgisi beklemez.

ZENTRA:

- kendi durumunu okur
- kendi eksiklerini görür
- mümkünse düzeltir
- mümkün değilse durdurur ve açıkça söyler

