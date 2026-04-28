# ZENTRA — FINANCIAL TRADE AUDIT / EVIDENCE

## Durum
ACTIVE — AUDIT STARTED

---

# 1. Audit Log
Durum: CLOSED

✔ Trade decision kayıt var
✔ Timestamp var
✔ User / System bilgisi var

Standard:
- Trade ID
- Timestamp
- User/System
- Output

Kapanış Notu:
Audit log tüm trade kararlarını saklar.

- [x] Trade decision kayıt
- [x] Timestamp
- [x] User / System

---

# 2. Decision Trace
Durum: CLOSED

✔ Signal → Risk → Decision akışı kayıtlı
✔ Ara çıktılar saklanır
✔ Her adım izlenebilir

Trace Standard:
- Signal Output
- Risk Output
- Final Decision

Kapanış Notu:
Decision trace trade kararının nasıl oluştuğunu gösterir.

- [x] Signal → Risk → Decision
- [x] Ara çıktılar

---

# 3. Data Source
Durum: CLOSED

✔ Kaynak tipi belirtilir
✔ Veri referansı tutulur

Standard:
- Source Type (API / Internal / Manual)
- Source Name
- Timestamp
- Reference ID

Kapanış Notu:
Data source trade analizinin güvenilirliğini sağlar.

- [x] Kaynak tipi
- [x] Veri referansı

---

# 4. Explain Registry
Durum: OPEN

- [ ] Explain kayıt
- [ ] Decision explain

---

## Checklist

- [x] Audit log
- [x] Trace
- [x] Data source
- [ ] Explain

