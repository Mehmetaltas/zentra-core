# ZENTRA — SELF HEALING LAUNCH CONTROL

## Durum
ACTIVE — STARTED

---

## Amaç

ZENTRA yayına çıkarken sistemin:

- arızayı algılaması
- kullanıcı akışı koparsa yönlendirmesi
- report / assistant / access hatalarını yakalaması
- otomatik düzeltme veya fallback üretmesi
- gerektiğinde governance’a taşıması

için launch kontrol katmanı kurmak.

---

## Temel İlke

ZENTRA:

insansız çalışabilir  
ama kontrolsüz çalışmaz.

---

## Kritik Cümle

Autonomous execution var.  
Uncontrolled automation yok.

---

# 1. System Availability Check

Durum: OPEN

Kontrol:

- sistem açılıyor mu
- cockpit erişilebilir mi
- report sayfası erişilebilir mi
- assistant çıktı veriyor mu

Fallback:

- kullanıcıya yönlendirme mesajı
- retry
- maintenance note
- audit kaydı

---

# 2. User Flow Continuity

Durum: OPEN

Kontrol:

- kullanıcı girişten cockpit’e ulaşabiliyor mu
- cockpit’ten report’a geçebiliyor mu
- assistant yönlendirme veriyor mu

Fallback:

- assistant guidance devreye girer
- kullanıcıya next step verilir
- kopan akış audit’e yazılır

---

# 3. Report Delivery Control

Durum: OPEN

Kontrol:

- report görüntüleniyor mu
- simple / technical / executive mode çalışıyor mu
- delivery output üretiliyor mu

Fallback:

- basic report
- text report
- email/message format
- export retry

---

# 4. Assistant Guidance Control

Durum: OPEN

Kontrol:

- assistant explain ediyor mu
- action veriyor mu
- warning üretiyor mu
- product-aware konuşuyor mu
- user-level guidance çalışıyor mu

Fallback:

- default simple explanation
- safety warning
- manual guidance note
- governance escalation

---

# 5. Access / Token Control

Durum: OPEN

Kontrol:

- kullanıcı erişimi var mı
- token geçerli mi
- rapor erişimi doğru mu
- corporate / individual ayrımı çalışıyor mu

Fallback:

- access denied
- limited mode
- request new token
- audit event

---

# 6. Audit / Snapshot Control

Durum: OPEN

Kontrol:

- karar izi oluşuyor mu
- audit kaydı var mı
- snapshot üretiliyor mu
- evidence path korunuyor mu

Fallback:

- decision hold
- retry audit
- governance review
- manual override required

---

# 7. Agent / Twin Repair Flow

Durum: OPEN

ZENTRA arıza halinde:

- detection agent sorunu işaretler
- repair agent öneri üretir
- governance agent kontrol eder
- audit agent kayıt alır
- assistant kullanıcıyı bilgilendirir

---

# 8. Governance Escalation

Durum: OPEN

Şu durumlarda otomasyon durur:

- karar izi oluşmuyorsa
- token / access tutarsızsa
- yüksek risk + düşük confidence varsa
- assistant yanlış yönlendiriyorsa
- report kanıtsız üretiliyorsa

Bu durumda:

- action hold
- governance review
- human override
- audit snapshot

---

## Launch Blocker Mantığı

ZENTRA blocker’a sadece yakalanmaz.

ZENTRA:

- blocker’ı tespit eder
- izler
- düzeltir
- fallback üretir
- gerekiyorsa governance’a taşır

---

## Checklist

- [ ] System availability
- [ ] User flow continuity
- [ ] Report delivery
- [ ] Assistant guidance
- [ ] Access / token
- [ ] Audit / snapshot
- [ ] Agent / twin repair
- [ ] Governance escalation

---

## Final Launch Kararı

READY TO LAUNCH  
veya  
LAUNCH BLOCKER VAR

kararı bu katmanın kontrolünden sonra verilir.

