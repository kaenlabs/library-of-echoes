# Groq AI Setup (Ücretsiz ve Hızlı)

## Neden Groq?

- ✅ **Tamamen Ücretsiz**: 14,400 request/gün (Gemini'den 10x fazla!)
- ✅ **Çok Hızlı**: 500+ tokens/saniye
- ✅ **Güçlü Modeller**: Mixtral-8x7b, Llama 3.1
- ✅ **Kolay Kullanım**: Basit API

## Kurulum Adımları

### 1. Groq API Key Al (1 dakika)

1. **https://console.groq.com** adresine git
2. **Sign Up** ile kaydol (Google hesabınla)
3. **API Keys** sekmesine tıkla
4. **Create API Key** ile yeni key oluştur
5. Key'i kopyala (örnek: `gsk_abc123def456...`)

### 2. API Key'i Ekle

`.env.local` dosyasını aç ve şunu düzenle:

```env
GROQ_API_KEY=gsk_BURAYA_KOPYALADIGIN_KEY_YAPISTIR
```

### 3. Server'ı Yeniden Başlat

Terminal'de `Ctrl+C` ile durdur, sonra tekrar:

```bash
npm run dev
```

## Kullanım

Artık Babel Moment hesaplanırken Groq AI kullanılacak:
- **Manifesto Oluşturma**: Mixtral-8x7b modeli (akıllı, hızlı)
- **Duygu Analizi**: Mixtral-8x7b (tutarlı sonuçlar)

## Avantajlar

### Gemini vs Groq

| Özellik | Gemini Free | Groq Free |
|---------|-------------|-----------|
| Request/Gün | ~1,500 | 14,400 |
| Hız | Orta | Çok Hızlı |
| Token/Dakika | 1,500 | 6,000 |
| Model | gemini-2.0 | mixtral-8x7b |
| Limit Aşımı | 24 saat ban | Yok |

## Cache Sistemi

✅ **Her epoch sadece 1 kez AI analizi yapılıyor**
- İlk Babel Moment tetiklendiğinde AI çalışır
- Sonuç `epochs.stats` field'ına JSON olarak kaydedilir
- Sonraki tüm kullanıcılar database'den okur (AI kullanmaz)
- **Sonuç**: Tüm kullanıcılar aynı AI analizini görür ✓

## Test

```bash
# 1. Yeni epoch başlat (reset)
curl -X POST http://localhost:3000/api/test-reset

# 2. 5+ mesaj gönder (ana sayfadan)
# ...

# 3. Babel Moment tetikle (bu sefer AI çalışacak ve database'e kaydedecek)
curl -X POST http://localhost:3000/api/test-babel

# 4. Ana sayfayı aç → Babel'i gör
# 5. Tarayıcıyı kapat, tekrar aç → Aynı AI analizini göreceksin (cache'den)
```

## Sorun Giderme

### "GROQ_API_KEY is not set"
- `.env.local` dosyasını kontrol et
- Server'ı yeniden başlat

### "Rate limit exceeded"
- Groq console'a git: https://console.groq.com/usage
- Günlük limitinizi kontrol et (14,400 request)
- Yarın sıfırlanır

### AI analizi çalışmıyor
- Console'da `Groq AI error:` arayin
- Fallback manifesto kullanılır (yine de çalışır)

## Notlar

- AI analizi **sadece epoch kapanırken** yapılır
- Database'e kaydedilir → sonsuza kadar aynı kalır
- Tüm kullanıcılar aynı manifesto'yu görür ✓
- Performans mükemmel (cache sayesinde)
