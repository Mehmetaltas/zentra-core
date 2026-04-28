# ZENTRA — RISK INTELLIGENCE COCKPIT CLOSURE

## Durum
ACTIVE — COCKPIT CLOSURE STARTED

---

## Amaç

Risk Intelligence cockpit ekranını satışa hazır ürün görünümüne taşımak.

App ayrı sayfadadır.  
Bu dosya sadece cockpit kapanışını izler.

---

## Final Cockpit Hedefi

Kullanıcı cockpit’e girdiğinde 5 saniyede şunları görmelidir:

1. Risk Score
2. Stress Level
3. Macro Pressure
4. Final Decision
5. Driver Breakdown
6. Deviation
7. Before / After karşılaştırma

---

## 1. Risk Score Panel

Durum: CLOSED

✔ Risk score görünür
✔ Risk band mapping aktif
✔ Renk ayrımı aktif
✔ Açıklama eklendi

Band Mapping:
0–40 LOW
40–70 MEDIUM
70–100 HIGH

Gerekli:
- [ ] Ana risk skoru görünür
- [ ] Risk bandı görünür
- [ ] Renk / seviye ayrımı görünür
- [ ] Score açıklaması eklenir

---

## 2. Stress Panel

Durum: CLOSED

✔ Stress skoru görünür
✔ Stress band mapping aktif
✔ Stress açıklaması eklendi

Stress Mapping:
0–35 LOW
35–65 MEDIUM
65–100 HIGH

Kapanış Notu:
Stress paneli kullanıcıya sistem üzerindeki baskıyı tek bakışta gösterir.

Gerekli:
- [ ] Stress skoru görünür
- [ ] Stress bandı görünür
- [ ] Stress açıklaması eklenir

---

## 3. Macro Pressure Panel

Durum: CLOSED

✔ Macro pressure görünür
✔ Macro band mapping aktif
✔ Macro etkisi açıklaması eklendi

Macro Mapping:
0–30 LOW
30–60 MEDIUM
60–100 HIGH

Kapanış Notu:
Macro paneli sistem dışı ekonomik baskıyı kullanıcıya açık şekilde gösterir.

Gerekli:
- [ ] Macro pressure görünür
- [ ] Macro band görünür
- [ ] Macro etkisi açıklanır

---

## 4. Final Decision Panel

Durum: CLOSED

✔ Final decision görünür
✔ Decision nedeni görünür
✔ Proceed / Caution / Stop ayrımı net

Decision Mapping:
0–40 → PROCEED
40–70 → CAUTION
70–100 → STOP

Kapanış Notu:
Decision paneli kullanıcıya doğrudan aksiyon yönü verir.

Gerekli:
- [ ] Final decision görünür
- [ ] Decision nedeni görünür
- [ ] Proceed / Caution / Stop ayrımı netleşir

---

## 5. Driver Breakdown

Durum: CLOSED

✔ İlk 3 ana risk nedeni gösterilir
✔ Her driver için kısa açıklama eklenir
✔ Driver etkisi LOW / MEDIUM / HIGH olarak ayrılır

Driver Standard:
1. Primary Driver
2. Secondary Driver
3. Tertiary Driver

Impact Mapping:
LOW / MEDIUM / HIGH

Kapanış Notu:
Driver Breakdown paneli risk skorunun neden oluştuğunu kullanıcıya açıklar.

Gerekli:
- [ ] İlk 3 ana risk nedeni gösterilir
- [ ] Her driver için kısa açıklama eklenir
- [ ] Driver etkisi low / medium / high olarak ayrılır

---

## 6. Deviation Panel

Durum: OPEN

Gerekli:
- [ ] Normalden sapma gösterilir
- [ ] Sapma nedeni gösterilir
- [ ] Sapma seviyesi belirtilir

---

## 7. Before / After Comparison

Durum: OPEN

Gerekli:
- [ ] Önceki skor
- [ ] Güncel skor
- [ ] Değişim yönü
- [ ] Kısa yorum

---

## Cockpit Closure Checklist

- [ ] Risk Score panel tamam
- [x] Stress panel tamam
- [x] Macro panel tamam
- [x] Decision panel tamam
- [x] Driver Breakdown tamam
- [ ] Deviation panel tamam
- [ ] Before / After tamam

---

## Kapanış Şartı

Cockpit şu sorulara tek ekranda cevap vermelidir:

- Risk kaç?
- Risk neden var?
- Stres ne seviyede?
- Makro baskı var mı?
- Karar ne?
- Önceye göre kötüleşti mi / iyileşti mi?

---

## GitHub İz

Tarih: 2026-04-28
Ürün: Risk Intelligence
Blok: Cockpit Closure
Durum: Başlatıldı

---

## Kilit Cümle

Risk Cockpit = Risk Intelligence ürününün karar ekranıdır.

