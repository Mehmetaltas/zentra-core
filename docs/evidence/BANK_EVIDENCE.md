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


---

# GARANTİ BBVA — ZENTRA ANALİZİ

## Dönem
2025

## Resmi Veriler
- NPL: ~2.5% (yaklaşık)
- Cost of Risk: orta seviyede (rapor bazlı)
- güçlü karşılık yapısı

---

## ZENTRA OKUMA

### Risk Yorumu
- NPL düşük/orta
- risk kontrol altında
- ancak:
→ portföy büyüdükçe stres potansiyeli artar

---

## ZENTRA DERIVED MODEL (örnek portföy)

varsayım:
- income: 20.000
- debt: 40.000
- monthly_payment: 6.000
- total_limit: 90.000

çıktı:
- debt_to_income: 2.0x
- payment_load: 30%
- limit_ratio: 4.5x

---

## ZENTRA ANALİZ

- limit_ratio = yüksek (4.5x)
- payment_load = kontrol sınırı
- risk = düşük → ama yapısal risk var

---

## ZENTRA POLICY

- limit_ratio > 4 → policy trigger

karar:
→ İNCELE / RİSK ARTIYOR

---

## ZENTRA İNDİKATÖR

- Risk Indicator: LOW → MEDIUM
- Payment Stress: NORMAL
- Limit Pressure: HIGH
- Reality Gap: HIDDEN RISK
- Proof Strength: MEDIUM

---

## ZENTRA FARKI

Banka:
- düşük risk görür

ZENTRA:
- gizli limit baskısını yakalar ✔
- gelecekteki riski işaret eder ✔
- policy ile sınırlar ✔

---

## SONUÇ

ZENTRA:
- erken risk sinyali üretir
- görünmeyen baskıyı görünür yapar
- büyüme döneminde risk kaçmasını engeller

---


---

# AKBANK — ZENTRA ANALİZİ

## Dönem
2025

## Resmi Veriler
- NPL: ~2.7% (yaklaşık)
- Cost of Risk: kontrollü
- güçlü sermaye ve karşılık yapısı

---

## ZENTRA OKUMA

### Risk Yorumu
- NPL düşük/orta
- risk yönetimi güçlü
- ancak:
→ bireysel kredi tarafında limit baskısı artabilir

---

## ZENTRA DERIVED MODEL (örnek portföy)

varsayım:
- income: 25.000
- debt: 50.000
- monthly_payment: 7.000
- total_limit: 120.000

çıktı:
- debt_to_income: 2.0x
- payment_load: 28%
- limit_ratio: 4.8x

---

## ZENTRA ANALİZ

- limit_ratio = yüksek (4.8x)
- payment_load = makul
- risk = görünürde düşük ama yapısal baskı var

---

## ZENTRA POLICY

- limit_ratio > 4 → policy trigger

karar:
→ İNCELE (gizli risk)

---

## ZENTRA İNDİKATÖR

- Risk Indicator: LOW → MEDIUM
- Payment Stress: NORMAL
- Limit Pressure: HIGH
- Reality Gap: STRUCTURAL RISK
- Proof Strength: MEDIUM

---

## ZENTRA FARKI

Banka:
- risk düşük görür

ZENTRA:
- limit baskısını yakalar ✔
- gelecekteki risk eğilimini gösterir ✔
- policy ile sınırlar ✔

---

## SONUÇ

ZENTRA:
- erken uyarı sistemi kurar
- görünmeyen riskleri açığa çıkarır
- büyüme kaynaklı risk kaçmasını engeller

---


---

# İŞ BANKASI — ZENTRA ANALİZİ

## Dönem
2025

## Resmi Veriler
- NPL: ~3.0% (yaklaşık)
- Cost of Risk: orta
- geniş ve çeşitlenmiş portföy

---

## ZENTRA OKUMA

### Risk Yorumu
- NPL orta
- portföy büyük → dağılım avantajı
- ancak:
→ KOBİ ve ticari segmentte risk yoğunlaşması olabilir

---

## ZENTRA DERIVED MODEL (örnek portföy)

varsayım:
- income: 30.000
- debt: 90.000
- monthly_payment: 12.000
- total_limit: 150.000

çıktı:
- debt_to_income: 3.0x
- payment_load: 40%
- limit_ratio: 5.0x

---

## ZENTRA ANALİZ

- limit_ratio = çok yüksek (5.0x)
- payment_load = stres sınırı
- risk = orta → yüksek eğilim

---

## ZENTRA POLICY

- limit_ratio > 4 → policy trigger
- payment_load yüksek → risk artışı

karar:
→ RİSK ARTIYOR / İNCELE

---

## ZENTRA İNDİKATÖR

- Risk Indicator: MEDIUM → HIGH
- Payment Stress: HIGH
- Limit Pressure: VERY HIGH
- Reality Gap: EXPANDING
- Proof Strength: MEDIUM

---

## ZENTRA FARKI

Banka:
- portföy seviyesinde risk görür

ZENTRA:
- mikro seviyede risk dağılımını açar ✔
- segment bazlı baskıyı yakalar ✔
- policy ile risk sınırını zorlar ✔

---

## SONUÇ

ZENTRA:
- portföy büyüklüğü içindeki gizli riskleri yakalar
- segment bazlı risk yoğunlaşmasını erken tespit eder
- banka seviyesinde görünmeyen mikro riskleri ortaya çıkarır

---


---

# QNB FİNANSBANK — ZENTRA ANALİZİ

## Dönem
2025

## Resmi Veriler
- NPL: ~3.5% (yaklaşık)
- Cost of Risk: orta → yüksek
- bireysel kredi ağırlıklı yapı

---

## ZENTRA OKUMA

### Risk Yorumu
- NPL sektöre göre yüksek
- bireysel kredi yoğunluğu → volatilite riski
- özellikle:
→ ödeme gücü hassas segment

---

## ZENTRA DERIVED MODEL (örnek portföy)

varsayım:
- income: 18.000
- debt: 70.000
- monthly_payment: 9.000
- total_limit: 90.000

çıktı:
- debt_to_income: 3.9x
- payment_load: 50%
- limit_ratio: 5.0x

---

## ZENTRA ANALİZ

- payment_load = kritik (%50)
- limit_ratio = çok yüksek (5.0x)
- risk = yüksek

---

## ZENTRA POLICY

- payment_load ≥ 0.5 → RED
- limit_ratio > 4 → RED

karar:
→ REDDET

---

## ZENTRA İNDİKATÖR

- Risk Indicator: HIGH
- Payment Stress: CRITICAL
- Limit Pressure: VERY HIGH
- Reality Gap: SEVERE
- Proof Strength: HIGH

---

## ZENTRA FARKI

Banka:
- riskli müşteri segmentini görür

ZENTRA:
- müşteri seviyesinde kırılım yapar ✔
- hangi riskten reddedildiğini gösterir ✔
- policy enforcement ile sınırlar ✔
- proof üretir ✔

---

## SONUÇ

ZENTRA:
- yüksek riskli segmentleri net ayırır
- kredi hatasını erken engeller
- kararın nedenini kanıtlar

---


---

# HALKBANK — ZENTRA ANALİZİ

## Dönem
2025

## Resmi Veriler
- NPL: ~4.0% (yaklaşık)
- Cost of Risk: yüksek
- kamu ağırlıklı kredi yapısı

---

## ZENTRA OKUMA

- NPL yüksek
- kamu destekli yapı → gecikmeli risk görünümü
→ gizli risk birikimi olabilir

---

## ZENTRA DERIVED MODEL

income: 15.000  
debt: 80.000  
monthly_payment: 10.000  
total_limit: 100.000  

çıktı:
- DTI: 5.3x  
- payment_load: 66%  
- limit_ratio: 6.6x  

---

## ZENTRA ANALİZ

- payment_load kritik  
- limit_ratio aşırı yüksek  
- risk = çok yüksek  

---

## ZENTRA POLICY

→ REDDET

---

## SONUÇ

ZENTRA:
- gizli risk birikimini erken yakalar
- kamu etkisiyle maskelenmiş riski açar

---

# VAKIFBANK — ZENTRA ANALİZİ

## Dönem
2025

## Resmi Veriler
- NPL: ~3.5%
- Cost of Risk: orta → yüksek

---

## ZENTRA OKUMA

- portföy büyük
- risk dengeli görünür
→ ama limit baskısı olabilir

---

## ZENTRA DERIVED MODEL

income: 22.000  
debt: 70.000  
monthly_payment: 8.500  
total_limit: 110.000  

çıktı:
- DTI: 3.1x  
- payment_load: 38%  
- limit_ratio: 5.0x  

---

## ZENTRA ANALİZ

- limit_ratio yüksek  
- payment_load orta  
→ risk yukarı eğilim  

---

## ZENTRA POLICY

→ İNCELE

---

## SONUÇ

ZENTRA:
- dengeli görünen portföyde risk eğilimini yakalar

---

# TEB — ZENTRA ANALİZİ

## Dönem
2025

## Resmi Veriler
- NPL: ~3.0%
- Cost of Risk: orta

---

## ZENTRA OKUMA

- NPL orta
- müşteri segmentasyonu kritik
→ bireysel risk dağılımı önemli

---

## ZENTRA DERIVED MODEL

income: 18.000  
debt: 50.000  
monthly_payment: 6.000  
total_limit: 70.000  

çıktı:
- DTI: 2.7x  
- payment_load: 33%  
- limit_ratio: 3.8x  

---

## ZENTRA ANALİZ

- limit_ratio sınır altı  
- payment_load makul  
→ risk kontrol altında  

---

## ZENTRA POLICY

→ ONAY

---

## SONUÇ

ZENTRA:
- sağlıklı müşteri segmentini net ayırır
- riskli segmentten ayrıştırır

---


---

# FULL BANK MATRIX — ZENTRA vs BANKS

| Banka | NPL | Cost of Risk | Limit Pressure | Payment Stress | ZENTRA Risk | Policy | Karar |
|------|-----|--------------|----------------|----------------|-------------|--------|------|
| Yapı Kredi | 3.2% | 162bps | HIGH | MEDIUM | MEDIUM | ACTIVE | İNCELE |
| Garanti | ~2.5% | orta | HIGH | LOW | LOW→MED | ACTIVE | İNCELE |
| Akbank | ~2.7% | kontrollü | HIGH | LOW | LOW→MED | ACTIVE | İNCELE |
| İş Bankası | ~3.0% | orta | VERY HIGH | HIGH | MED→HIGH | ACTIVE | İNCELE |
| QNB | ~3.5% | yüksek | VERY HIGH | CRITICAL | HIGH | HARD | RED |
| Halkbank | ~4.0% | yüksek | EXTREME | CRITICAL | VERY HIGH | HARD | RED |
| Vakıfbank | ~3.5% | orta | HIGH | MEDIUM | MEDIUM | ACTIVE | İNCELE |
| TEB | ~3.0% | orta | NORMAL | LOW | LOW | PASSIVE | ONAY |

---

## ZENTRA ÜSTÜNLÜK MATRİSİ

| Özellik | Bankalar | ZENTRA |
|--------|---------|--------|
| Decision | ✔ | ✔ |
| Explain | ⚠ | ✔ |
| Trace | ❌ | ✔ |
| Proof (DB) | ❌ | ✔ |
| Policy Enforcement | ⚠ | ✔ |
| Simulation | ❌ | ✔ |
| Indicator Layer | ❌ | ✔ |
| Visual Flow | ❌ | ✔ |

---

## NET SONUÇ

Bankalar:
- karar verir

ZENTRA:
- karar verir ✔
- nedenini açıklar ✔
- trace üretir ✔
- kanıtlar ✔
- policy uygular ✔
- simüle eder ✔
- grafikleştirir ✔

---

## SATIŞ CÜMLESİ

ZENTRA:
bankaların ayrı ayrı kullandığı decision, explain, audit ve simulation katmanlarını
tek sistemde birleştirir.

---

