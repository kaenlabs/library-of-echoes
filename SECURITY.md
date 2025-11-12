# 🔒 Güvenlik ve Anti-Spam Sistemi

Library of Echoes projesi, spam ve kötüye kullanımı önlemek için çok katmanlı bir güvenlik sistemi kullanır.

## 🛡️ Güvenlik Katmanları

### 1. **IP Bazlı Spam Tespiti**
- Her IP adresi için dakikada maksimum 10 istek
- Limit aşılırsa 1 saat süreyle engelleme
- IP adresleri hash'lenerek saklanır (gizlilik)

### 2. **Rate Limiting (Hız Sınırlama)**
- **Anonim kullanıcılar**: Günde 1 mesaj (IP bazlı)
- **Üye kullanıcılar**: Günde 5 mesaj (user ID bazlı)
- 24 saat cooldown süresi

### 3. **Honeypot Field (Bot Tuzağı)**
- Görünmeyen bir form alanı
- Botlar tarafından doldurulursa form reddedilir
- İnsan kullanıcılar için görünmez

### 4. **Content Moderation (İçerik Denetimi)**
- ✅ URL/Link kontrolü - reddedilir
- ✅ Email/Telefon kontrolü - reddedilir
- ✅ Aşırı tekrar kontrolü (aaaaa gibi)
- ✅ Caps lock kontrolü (%70'den fazla büyük harf)
- ✅ Anlamlı içerik kontrolü

### 5. **Input Validation (Giriş Doğrulama)**
- Minimum 3 karakter
- Maximum 280 karakter
- Tek satır zorunluluğu
- Satır sonu karakterleri temizleniyor

### 6. **Authentication (Kimlik Doğrulama)**
- Supabase Auth ile güvenli oturum
- JWT token ile API iletişimi
- Server-side token doğrulama

## 📊 Güvenlik Metrikleri

Sistemdeki güvenlik olayları console'da loglanır:

```
🚨 Spam detected from: [ip-hash]
❌ Content rejected from [ip-hash]: [reason]
✅ Message accepted from authenticated user
```

## 🔧 Ayarlar (lib/rateLimit.ts)

```typescript
// Değiştirilebilir limitler
const ANONYMOUS_LIMIT = 1;              // Anonim kullanıcı limiti
const AUTHENTICATED_LIMIT = 5;          // Üye kullanıcı limiti
const MAX_ATTEMPTS_PER_MINUTE = 10;     // Dakika başına max istek
const SPAM_BLOCK_DURATION_MS = 3600000; // Spam engelleme süresi (1 saat)
```

## 🚀 Production Önerileri

### Şu anki sistem (Development):
- ✅ In-memory rate limiting
- ✅ IP hash'leme
- ✅ Basic spam detection

### Production için eklenebilir:
- [ ] **Redis** - Distributed rate limiting
- [ ] **Cloudflare** - DDoS protection
- [ ] **Advanced AI** - ML-based spam detection
- [ ] **CAPTCHA** - reCAPTCHA v3 (invisible)
- [ ] **Database logging** - Güvenlik olaylarını kaydetme
- [ ] **IP blacklist** - Bilinen kötü IP'leri engelleme

## 🧪 Test Senaryoları

### Test 1: Rate Limiting
1. Anonim kullanıcı 1 mesaj gönder ✅
2. 2. mesaj dene → "24 saat bekle" ❌
3. Üye ol ve giriş yap
4. 5 mesaj gönder ✅
5. 6. mesaj dene → "Limit doldu" ❌

### Test 2: Spam Detection
1. 1 dakika içinde 10+ istek gönder
2. Sonraki istekler 1 saat engellenecek

### Test 3: Content Moderation
1. URL içeren mesaj → ❌ Reddedilir
2. "aaaaaaaaaa" gibi spam → ❌ Reddedilir
3. "BU MESAJ TAMAMEN BÜYÜK HARF" → ❌ Reddedilir
4. Normal mesaj → ✅ Kabul edilir

### Test 4: Honeypot
1. Bot olarak honeypot field'ı doldur
2. Form submit → Sessizce reddedilir

## ⚠️ Önemli Notlar

1. **IP Adresleri**: Hash'lenerek saklanır, orijinal IP saklanmaz
2. **GDPR Uyumlu**: Kişisel veri saklanmıyor
3. **False Positive**: Çok nadir durumlarda normal kullanıcılar engellenebilir
4. **Server Restart**: In-memory store, server restart'ta sıfırlanır

## 📞 Destek

Güvenlik açığı bulursanız: security@libraryofechoes.com
