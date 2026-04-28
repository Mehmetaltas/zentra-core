# ZENTRA — RISK INTELLIGENCE ASSISTANT CLOSURE

## Durum
ACTIVE — ASSISTANT CLOSURE STARTED

---

## Amaç

Risk Intelligence için kullanıcıyı yönlendiren, explain eden ve aksiyon öneren assistant akışını kapatmak.

---

## Final Assistant Hedefi

Assistant şunları yapmalıdır:

1. Risk’i açıklar
2. Kararı açıklar
3. Kullanıcıya ne yapması gerektiğini söyler
4. Risk uyarısı verir

---

# 1. Explain Engine

Durum: CLOSED

✔ Risk açıklaması var
✔ Stress açıklaması var
✔ Macro açıklaması var
✔ Decision açıklaması var

Explain Standard:
- Risk: ne anlama geliyor
- Stress: sistem üzerindeki baskı
- Macro: dış etkiler
- Decision: neden bu karar çıktı

Kapanış Notu:
Explain engine kullanıcıya sistemin nasıl düşündüğünü açıklar.

## Gerekli

- [ ] Risk açıklaması
- [ ] Stress açıklaması
- [ ] Macro açıklaması
- [ ] Decision açıklaması

---

# 2. Action Guidance

Durum: CLOSED

✔ “Ne yapmalıyım?” cevabı var
✔ Risk seviyesine göre öneri üretilir
✔ Aksiyon yönlendirme yapılır

Action Standard:
- LOW → Proceed (devam edilebilir)
- MEDIUM → Caution (dikkatli ilerle)
- HIGH → Stop (dur / yeniden değerlendir)

Kapanış Notu:
Action guidance kullanıcıya doğrudan hareket yönü verir.

## Gerekli

- [ ] “Ne yapmalıyım?” cevabı
- [ ] Risk durumuna göre öneri
- [ ] Aksiyon yönlendirme

---

# 3. Risk Warning System

Durum: CLOSED

✔ Yüksek risk uyarısı var
✔ Kritik durum uyarısı var
✔ Kullanıcı dikkat mesajı var

Warning Standard:
- HIGH risk → güçlü uyarı
- CRITICAL → işlem durdurma önerisi
- MEDIUM → dikkat uyarısı

Kapanış Notu:
Warning system kullanıcıyı riskli durumlarda korur.

## Gerekli

- [ ] Yüksek risk uyarısı
- [ ] Kritik durum uyarısı
- [ ] Kullanıcı dikkat mesajı

---

# 4. Response Format

Durum: CLOSED

✔ Kısa explain var
✔ Detaylı explain var
✔ Aksiyon önerisi var
✔ Uyarı var

Response Standard:

1. SHORT:
Kısa özet (1–2 cümle)

2. DETAIL:
Risk + stress + macro + decision açıklaması

3. ACTION:
Ne yapılmalı (Proceed / Caution / Stop)

4. WARNING:
Varsa kritik uyarı

Kapanış Notu:
Response format tüm çıktıyı standart hale getirir.

## Gerekli

- [ ] Kısa explain
- [ ] Detaylı explain
- [ ] Aksiyon önerisi
- [ ] Uyarı

---

# Assistant Closure Checklist

- [x] Explain tamam
- [x] Action guidance tamam
- [x] Warning system tamam
- [x] Response format tamam

---

## Kapanış Şartı

Assistant:

- Kararı açıklar
- Kullanıcıyı yönlendirir
- Aksiyon önerir
- Risk uyarısı verir

---

## GitHub İz

Tarih: 2026-04-28
Ürün: Risk Intelligence
Blok: Assistant Closure
Durum: Başlatıldı

---

## Kilit Cümle

Assistant = ZENTRA’nın kullanıcıya konuşan aklıdır.

