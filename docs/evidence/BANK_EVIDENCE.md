---

# ZENTRA — BANK EVIDENCE v1

## Amaç
Bu dosya:
gerçek banka verisi + ZENTRA farkı + kanıt üretimi için referanstır.

---

## MATRİS

| Banka | Dönem | NPL | Cost of Risk | Provision | Not |
|------|------|-----|--------------|-----------|-----|
| Yapı Kredi | 2025 | 3.2% | 162bps | - | baseline |
| Garanti | 2025 | - | - | - | veri çekilecek |
| Akbank | 2025 | - | - | - | veri çekilecek |
| İş Bankası | - | - | - | - | veri çekilecek |
| QNB | - | - | - | - | veri çekilecek |
| Halkbank | - | - | - | - | veri çekilecek |
| Vakıfbank | - | - | - | - | veri çekilecek |
| TEB | - | - | - | - | veri çekilecek |

---

## ZENTRA ANALİZ KATMANI

Her banka için:

### 1. Derived
- debt_to_income
- payment_load
- limit_ratio

### 2. Risk Okuma
- NPL vs ZENTRA Risk Indicator
- Cost of Risk vs Payment Stress

### 3. ZENTRA FARKI
ZENTRA şunları ekler:
- decision trace
- explain layer
- policy enforcement
- proof library
- simulation

---

## ZENTRA İNDİKATÖRLER

- Risk Indicator
- Payment Stress Indicator
- Limit Pressure Indicator
- Reality Gap Indicator
- Proof Strength Indicator

---

## ZENTRA GRAFİKLER

- Bank vs ZENTRA risk dağılımı
- NPL vs ZENTRA risk
- cost of risk vs proof score
- decision flow

---

## KİLİT CÜMLE

ZENTRA:
karar verir
→ nasıl verdiğini gösterir
→ kanıtlar
→ simüle eder
→ indikatöre çevirir

---

## SONRAKİ ADIM

- tüm bankalar doldurulacak
- grafik üretilecek
- demo hazırlanacak

