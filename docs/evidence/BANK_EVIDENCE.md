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


---

# YAPI KREDİ — ZENTRA ANALİZİ

## Dönem
2025

## Resmi Veriler
- NPL: 3.2%
- Cost of Risk: 162 bps

---

## ZENTRA OKUMA

### Risk Yorumu
- NPL orta seviyede
- Cost of Risk yükselmiş
→ risk maliyeti baskısı var

---

## ZENTRA DERIVED MODEL (örnek portföy)

varsayım:
- income: 20.000
- debt: 60.000
- monthly_payment: 8.000
- total_limit: 80.000

çıktı:
- debt_to_income: 3.0x
- payment_load: 40%
- limit_ratio: 4.0x

---

## ZENTRA ANALİZ

- limit_ratio = yüksek sınır
- payment_load = stres sınırına yakın
- risk = orta → yukarı eğilim

---

## ZENTRA POLICY

- limit_ratio 4x → kritik eşik
- payment_load 40% → izleme gerekli

karar:
→ İNCELE

---

## ZENTRA İNDİKATÖR

- Risk Indicator: MEDIUM
- Payment Stress: MEDIUM
- Limit Pressure: HIGH
- Reality Gap: GROWING
- Proof Strength: MEDIUM

---

## ZENTRA FARKI

Banka:
- risk görür
- karar verir

ZENTRA:
- risk + neden ✔
- decision trace ✔
- policy enforcement ✔
- proof kayıt ✔
- simulation yapılabilir ✔

---

## SONUÇ

ZENTRA:
- aynı veriden daha erken sinyal üretir
- riskin nedenini açıklar
- kararın kanıtını oluşturur

---

