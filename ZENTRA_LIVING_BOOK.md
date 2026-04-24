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


---

## ZDB-003
Date: 2026-04-23

### Block
Reality Classification

### Purpose
Signals are now classified into:
- REAL_POWER
- SUPPORT
- ILLUSION

### Logic
REAL_POWER:
- direct indicators of real repayment capacity

SUPPORT:
- supportive but not decisive indicators

ILLUSION:
- signals that may create misleading strength visibility

### Result
ZENTRA can now separate:
- real power
- supportive strength
- misleading appearance

### Runtime file
- zentra_decision_backbone_v1.py

### Next
ZDB-004
Contradiction Resolver


---

## ZDB-004
Date: 2026-04-24

### Block
Contradiction Resolver

### Purpose
Resolve conflicts between signals instead of averaging.

### Key Principle
No averaging under contradiction.

### Example
- real income vs declared income
- system chooses higher trust signal

### Result
ZENTRA now identifies dominant reality.

### Next
ZDB-005 Final Aggregation


---

## ZDB-005
Date: 2026-04-24

### Block
Final Aggregation

### Purpose
Combine all signals into a single decision.

### Key Rule
No averaging under contradiction.

### Decision Types
- APPROVE
- REVIEW
- REJECT

### Result
ZENTRA produces its first real decision.

### Next
ZDB-006 Explain + Confidence refinement


---

## ZDB-006
Date: 2026-04-24

### Block
ZENTRA Internal Decision Committee

### Purpose
Transform decision system into explainable committee structure.

### Structure
- Trust Engine
- Classification
- Contradiction Resolver
- Aggregation
- Confidence

### Result
ZENTRA now produces:
- decision
- explanation
- confidence
- dominant signal

### Next
ZDB-007 Loss Mapping + Proof Metrics


---

## ZDB-007
Date: 2026-04-24

### Block
Loss Mapping + Proof Metrics

### Purpose
Measure real-world impact of decision differences.

### Metrics
- Decision delta
- Loss estimation
- Risk mismatch

### Result
ZENTRA now quantifies:
- wrong approvals
- missed opportunities
- risk exposure

### Next
ZDB-008 Real Scenario Testing

