# ZENTRA — ASSISTANT INTELLIGENCE LAYER

## Durum
ACTIVE — STARTED

---

## Amaç

ZENTRA Assistant'ı basit açıklama üreten yapıdan çıkarıp,
kararı anlayan, bağlamı okuyan ve kullanıcıyı yönlendiren gerçek zeka katmanına taşımak.

---

## Kapsam

Bu blokta core / engine değişmez.

Sadece assistant'ın:

- karar açıklama kalitesi
- bağlam farkındalığı
- öneri üretme kalitesi
- risk uyarı kalitesi
- ürünler arası yorumlama gücü

artırılır.

---

# 1. Context Awareness

Durum: OPEN

Assistant şunları birlikte okumalı:

- final decision
- risk score
- stress
- macro
- confidence
- product type
- portfolio state
- driver breakdown

---

# 2. Decision Explanation

Durum: OPEN

Assistant şu sorulara cevap vermeli:

- Bu karar neden çıktı?
- Risk nereden geliyor?
- Güven seviyesi yeterli mi?
- Bu karar uygulanabilir mi?

---

# 3. Action Guidance

Durum: OPEN

Assistant sadece açıklamaz, yön verir:

- Proceed
- Caution
- Stop
- Review
- Wait
- Controlled exposure

---

# 4. Product-Aware Intelligence

Durum: OPEN

Assistant ürün tipine göre konuşmalı:

- Risk Intelligence
- Credit Intelligence
- Financial Trade

---

# 5. Warning Logic

Durum: IN PROGRESS

Assistant kritik durumda uyarı vermeli:

- high risk
- low confidence
- conflicting signal
- weak payment capacity
- trade-risk mismatch

---

## Checklist

- [ ] Context awareness
- [ ] Decision explanation
- [ ] Action guidance
- [ ] Product-aware intelligence
- [ ] Warning logic

---

## Kilit Kural

Core değişmez.
Engine değişmez.
Assistant yüzeyi güçlenir.



---

## Context Binding
Durum: IN PROGRESS

- Assistant cockpit verisine bağlandı
- Decision + Risk + Confidence birlikte yorumlanıyor
- İlk context-aware çıktı üretildi



---

## Decision Deepening
Durum: IN PROGRESS

- Assistant WHY (neden) üretir
- ACTION (ne yapılmalı) üretir
- WARNING (risk uyarısı) üretir
- Driver bazlı açıklama eklendi



---

## Product Awareness Binding
Durum: IN PROGRESS

- Assistant activeProduct alanını okumaya başladı
- Risk Intelligence için risk/deviation dili
- Credit Intelligence için payment/approval dili
- Financial Trade için signal/execution dili eklendi
- Assistant ürün tipine göre farklı ACTION ve WARNING üretir



---

## Warning Strengthening
Durum: IN PROGRESS

- Warning sistemi tek mesajdan çoklu uyarı listesine taşındı
- Critical risk / high risk / low confidence / stress / macro alert eklendi
- Financial Trade için trade-risk tension uyarısı eklendi
- Credit için approval risk uyarısı eklendi
- Risk Intelligence için exposure review uyarısı eklendi



---

# 6. User Guidance Intelligence

Durum: IN PROGRESS

Assistant artık sadece yorumlamaz, kullanıcıyı yönlendirir.

---

## Amaç

Kullanıcı:
- sistemi bilmeden kullanabilmeli
- ne yapacağını assistant'tan öğrenmeli
- karmaşık kararları sade anlayabilmeli

---

## Kapsam

Assistant:

✔ halk diliyle anlatır  
✔ teknik seviyede detay açar  
✔ kullanıcıya aksiyon söyler  
✔ sistemi nasıl kullanacağını gösterir  

---

## Davranış

Assistant şu sorulara cevap verir:

- Bu ne demek?
- Ben şimdi ne yapmalıyım?
- Bu riskli mi?
- Hangi ürünü kullanmalıyım?
- Bu karar uygulanır mı?

---

## Dil Seviyesi

1. Basit anlatım (default)

Örnek:
"Risk yüksek, dikkatli ilerlemelisin."

2. Teknik anlatım (isteğe bağlı)

Örnek:
"Risk seviyesi 72, stress 64. Bu durumda kontrollü exposure önerilir."

---

## Guidance Output

Assistant şu çıktıları üretir:

- NEXT STEP: kullanıcı ne yapmalı
- TOOL: hangi ürün / modül kullanılmalı
- RISK NOTE: dikkat edilmesi gereken nokta

---

## Örnek

NEXT STEP: Pozisyona küçük miktarla gir  
TOOL: Financial Trade  
RISK NOTE: Risk yüksek, tam giriş önerilmez  

