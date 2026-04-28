
# ZENTRA CORE — EXECUTION SAYFASI

## Durum
ACTIVE

## Amaç
ZENTRA içinde kararların, görevlerin, aksiyonların ve işletim akışlarının çalıştırıldığı ana sayfadır.

→ Core’da üretilen kararlar burada hayata geçirilir  
→ Ürünler burada çalıştırılır  
→ İş akışı burada yönetilir  

---

## Kapsam

Bu sayfada:

✔ mission oluşturulur  
✔ task açılır  
✔ operator atanır  
✔ action tetiklenir  
✔ workflow çalıştırılır  
✔ execution izlenir  
✔ audit trace tutulur  
✔ snapshot alınır  

---

## İlke

Core karar üretir.  
Execution kararı işe çevirir.

---

## Kritik Kural

Karar üretildi ama:

→ task açılmadıysa  
→ action çalışmadıysa  

YAPILMAMIŞ sayılır.

---

## EXECUTION ŞABLONU

### 1. Mission / İş Adı
(ZENTRA içinde tanım)

### 2. Bağlı Core / Modül
(Hangi modül)

### 3. Amaç
(ne yapılacak)

### 4. Girdi
(veri / tetikleyici)

### 5. Task List
(açılan görevler)

### 6. Operator / Agent
(kim çalıştırır)

### 7. Action
(ne yapıldı)

### 8. Workflow
(adım adım akış)

### 9. Audit / Evidence
(kanıt)

### 10. Snapshot
(durum kaydı)

### 11. Durum
(yok / başladı / partial / tamamlandı)

### 12. Açık Eksik
(ne kaldı)

### 13. GitHub Trace
(dosya + işlem + tarih)

### 14. Üçlü Kitap Bağlantısı
(basit / teknik / github)

---

## EXECUTION TRACKER

| Mission | Modül | Durum | Operator | Not |
|--------|------|------|----------|-----|

---

## EXECUTION CHECKLIST

- [ ] Mission açıldı  
- [ ] Task üretildi  
- [ ] Operator atandı  
- [ ] Action çalıştı  
- [ ] Audit oluştu  
- [ ] Snapshot alındı  
- [ ] Mission kapandı  

---

## DURUM

EXECUTION SYSTEM: % (manuel güncellenecek)

---

## KURAL

Execution yoksa:

❌ sistem çalışmıyor  
❌ ürün aktif değil  
❌ ZENTRA canlı sayılmaz  

---

## NOT

Productization ürünü hazırlar.  
Execution ürünü çalıştırır.

ZENTRA = Core + Execution birlikte çalışır.

