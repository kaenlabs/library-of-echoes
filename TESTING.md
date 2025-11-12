# 🧪 TEST MODE - Babil Anı Test Etme

## Nasıl Test Edilir?

### 1️⃣ Test Modunu Aktif Et
`.env.local` dosyasında:
```env
NEXT_PUBLIC_TEST_MODE=true
BABEL_TEST_THRESHOLD=20
```

### 2️⃣ Serveri Başlat
```bash
npm run dev
```

### 3️⃣ Sol Üstte Test Paneli Görünecek
🧪 TEST MODE paneli otomatik görünür:
- 🎯 Eşik: 20 mesaj (test için düşük)
- 📊 Mevcut çağ bilgisi
- 💬 Gönderilen mesaj sayısı

### 4️⃣ Mesaj Gönder
En az **5 mesaj** gönder (farklı cümleler daha iyi sonuç verir)

### 5️⃣ Babil Anı'nı Tetikle
Test panelinde **"🌌 Babil Anı'nı Tetikle"** butonuna tıkla

### 6️⃣ Sayfa Yenilenecek
- Otomatik `/babel` sayfasına yönlendirileceksin
- 7 sayfalık animasyonlu deneyim başlayacak

## Test Endpoint'leri

### Status Kontrolü (GET)
```bash
curl http://localhost:3000/api/test-babel
```

Yanıt:
```json
{
  "testMode": true,
  "threshold": 20,
  "currentEpoch": "Age 1",
  "currentMessages": 8,
  "canForceClose": true
}
```

### Manuel Tetikleme (POST)
```bash
curl -X POST http://localhost:3000/api/test-babel
```

## Neyi Test Edebilirsin?

### ✅ Babil Anı Sayfaları
1. **Intro** - Giriş animasyonu
2. **Stats** - İstatistikler (toplam, eşsiz, yankı)
3. **Words** - Kelime bulutu (büyüyen animasyon)
4. **Sentences** - Yankılanan cümleler
5. **Emotions** - AI duygusal dağılım
6. **Manifesto** - Gemini AI manifestosu
7. **Closure** - Yeni çağ başlangıcı

### ✅ AI Analizi
- Gemini AI'ın ürettiği manifesto
- Duygusal dağılım analizi
- Ana temalar

### ✅ İlk Giriş Kontrolü
- Çağ kapandıktan sonra ana sayfaya git
- Otomatik Babel sayfasına yönlendirileceksin
- Cookie işaretlendikten sonra bir daha gösterilmeyecek

## Production'a Geçerken

`.env.local` dosyasında:
```env
# NEXT_PUBLIC_TEST_MODE=true  ← KALDIR veya false yap
# BABEL_TEST_THRESHOLD=20     ← KALDIR
```

Production'da:
- Eşik: **1,024,808** mesaj
- Test paneli görünmez
- Manuel tetikleme çalışmaz

## Çağı Sıfırlama (Reset)

Eğer testi tekrar yapmak istersen 3 yol var:

### Yöntem 1: Test Panel Butonu (EN KOLAY) ⭐
Test panelinde **"🔄 Age 1'e Geri Dön"** butonuna tıkla
- Tüm ileri çağları siler
- Age 1'i tekrar aktif eder
- Sayfa otomatik yenilenir

### Yöntem 2: API Çağrısı
```bash
curl -X POST http://localhost:3000/api/test-reset \
  -H "Content-Type: application/json" \
  -d '{"targetEpochId": 1}'
```

### Yöntem 3: Supabase SQL Editor
```sql
-- Age 2+ tüm çağları sil
DELETE FROM messages WHERE epoch_id > 1;
DELETE FROM epochs WHERE id > 1;

-- Age 1'i aktif et
UPDATE epochs SET is_active = true, closed_at = NULL, stats = NULL WHERE id = 1;
```

Hangisi daha kolay? **Test panel butonu!** 🎉
