# ZENTRA LIVING BOOK

---

## ZDB-002
Date: 2026-04-23

### Block
Source Intake + Trust Engine

### Why This Transition Exists
Mevcut sistem:
- veri → skor → karar
- veri → model → review → karar

Sorun:
- veri tek gerçeklikte birleşmiyor
- skor gerçekliği sadeleştiriyor
- çelişkiler çözülmeden karar veriliyor
- review / override ile tamponlanıyor

ZENTRA yaklaşımı:
- veri → gerçeklik → karar

Ama bu doğrudan geçiş riskli olduğu için paralel proof hattı açıldı.

### Transition Strategy
Ana sistem korunur.
ZENTRA ayrı çalışır.
Aynı input iki hatta girer.

Akış:

Input
├─ Existing System → Decision A
└─ ZENTRA System   → Decision B

Amaç:
- farkı ölçmek
- sapmayı görmek
- explain ve confidence kalitesini karşılaştırmak

### What We Expect
ZENTRA’dan beklenen:
- daha düşük sapma
- daha az yanlış onay
- daha az yanlış red
- daha az gereksiz review
- daha güçlü explain
- ölçülebilir confidence

### What We Measure
Her vaka için:
- Decision Difference
- Trust-weighted signal analysis
- Contradiction presence
- Explain clarity
- Confidence level

İleri aşamada:
- Loss impact
- Risk deviation
- Review reduction

### Current State
Tamamlananlar:
- Source Intake aktif
- Trust Engine aktif

Henüz yok:
- Reality Classification
- Contradiction Resolver
- Final Aggregation
- Policy
- Explain standardı

### Data Handling Rule
Bu proof hattında üretilen veriler:
- ana sistemle karıştırılmaz
- otomatik merge edilmez
- üretim kararına direkt girmez
- ayrı tutulur
- referans olarak saklanır
- analiz için kullanılır

Amaç:
çorba oluşmasını engellemek

### Future Integration Plan
ZENTRA yalnızca şu durumda ana sisteme alınır:
1. sapma düşüyorsa
2. explain daha güçlüyse
3. risk daha erken yakalanıyorsa
4. regülasyon dili korunuyorsa

Geçiş şekli:
- step-by-step replace
veya
- hybrid decision layer

### Failure Path
Eğer ZENTRA:
- fark üretmezse
- sistem karışırsa
- veri çorba olursa

sistem durdurulur,
yalnızca öğrenme çıktısı alınır,
ana sistem korunur.

### Success Path
Eğer ZENTRA:
- anlamlı fark üretirse
- daha doğru karar verirse
- explain güçlü ise

çekirdeğe entegre edilir,
lisans katmanı olur,
patent / moat süreci başlar.

### Critical Rule
ZENTRA:
- mevcut sistemi bozmaz
- onu test eder
- kanıt üretir
- sonra yerini alır

### Current Output Reference
Runtime file:
- zentra_decision_backbone_v1.py

### Next Step
ZDB-003
Reality Classification

