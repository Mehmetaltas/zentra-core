# ZENTRA — SERVICE CREDIT / COMPENSATION POLICY

## Durum
ACTIVE — STARTED

---

## Amaç

ZENTRA sistem kaynaklı hata, kesinti, rapor üretim problemi veya token kullanım problemi durumlarında kullanıcıya adil telafi mekanizması sunar.

---

## Temel İlke

ZENTRA hatayı saklamaz.

ZENTRA:

- hatayı tespit eder
- audit’e yazar
- kullanıcı etkisini ölçer
- düzeltme / telafi üretir
- gerekiyorsa governance review başlatır

---

# 1. Telafi Türleri

## 1.1 Report Token İadesi
Token kullanıldı ama rapor üretilemediğinde uygulanır.

## 1.2 Yeni Rapor Hakkı
Eksik / hatalı / tamamlanmamış rapor çıktısı durumunda uygulanır.

## 1.3 Ücretsiz Ek Kullanım
Kullanıcı sistem kaynaklı kesintiden etkilendiyse uygulanır.

## 1.4 Plan Süresi Uzatma
Ücretli kullanıcı uzun süreli erişim problemi yaşarsa uygulanır.

## 1.5 Kurumsal Service Credit
Kurumsal müşterilerde SLA benzeri hizmet kredisi verilebilir.

## 1.6 Ödeme İadesi
Sadece ağır sistem kaynaklı hizmet verilememe durumunda son seçenek olarak değerlendirilir.

---

# 2. Telafiye Giren Durumlar

- sistem kaynaklı rapor üretilemedi
- token harcandı ama çıktı alınamadı
- kullanıcı erişimi sistem hatasıyla engellendi
- planlı olmayan kesinti oldu
- delivery output üretilemedi
- assistant guidance sistem hatasıyla boş / yanlış format verdi
- audit / snapshot oluşmadığı için karar güvenli kabul edilmedi
- governance hold nedeniyle kullanıcı çıktısı tamamlanamadı

---

# 3. Telafiye Girmeyen Durumlar

- kullanıcı yanlış veri girdiyse
- kullanıcı raporu yanlış yorumladıysa
- piyasa / ekonomi sonucu değiştiyse
- yatırım, kredi veya ticari zarar oluştuysa
- kullanıcı sistemi garanti / yatırım tavsiyesi gibi kullandıysa
- üçüncü taraf veri sağlayıcı hatası varsa ve ZENTRA bunu açıkça işaretlediyse
- dış bağlantı / kullanıcı cihazı / internet problemi varsa

---

# 4. Hata Sınıfları

## Class A — Minor UI / Display Issue
Kullanıcı sonucu yine alabiliyorsa telafi gerekmez; issue loglanır.

## Class B — Output Degradation
Rapor / assistant / delivery kısmi çalıştıysa yeni rapor hakkı veya token iadesi uygulanabilir.

## Class C — Failed Service
Ücretli çıktı hiç üretilemediyse token iadesi veya ücretsiz ek kullanım verilir.

## Class D — Enterprise Impact
Kurumsal kullanıcı iş akışı ciddi etkilendiyse service credit / plan uzatma / governance review uygulanır.

---

# 5. Governance Review

Şu durumlarda otomatik telafi verilmez, governance review gerekir:

- yüksek değerli kurumsal hesap
- ödeme iadesi talebi
- tekrar eden hata
- güvenlik / erişim ihlali
- veri kaybı iddiası
- hukuki risk taşıyan talep

---

# 6. Audit Bağlantısı

Her telafi kararında kayıt tutulur:

- incident id
- user / organization id
- affected product
- affected report / token
- error class
- compensation type
- governance decision
- timestamp

---

# 7. Kullanıcıya Açıklama Dili

## Simple
“Sistem kaynaklı bir sorun tespit edildi. Hakkınız korunarak yeni rapor hakkı tanımlandı.”

## Technical
“Report generation failed after token consumption. Token credit has been restored and incident logged.”

## Enterprise
“A service-impacting incident was recorded. Compensation has been applied according to service credit policy and audit trace is available.”

---

## Kilit Kural

Telafi = sınırsız iade değildir.

Telafi:

- adil
- izlenebilir
- sınıflandırılmış
- governance kontrollü
- kötüye kullanıma kapalı

olmalıdır.

