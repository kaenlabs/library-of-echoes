# 🚀 Supabase Setup Guide

Bu dosya Library of Echoes projesinin Supabase altyapısını kurmak için adım adım talimatlar içerir.

## 📋 Gereksinimler

- Supabase hesabı (ücretsiz): https://supabase.com

## 🔧 Adım 1: Supabase Projesi Oluşturma

1. **Supabase Dashboard'a gidin**: https://app.supabase.com
2. **"New Project" butonuna tıklayın**
3. **Proje bilgilerini girin:**
   - Name: `library-of-echoes`
   - Database Password: Güçlü bir şifre seçin (kaydedin!)
   - Region: Size en yakın bölgeyi seçin (örn: `Europe West (Ireland)`)
   - Pricing Plan: `Free` (başlangıç için yeterli)
4. **"Create new project" butonuna tıklayın**
5. Projenin oluşmasını bekleyin (1-2 dakika sürer)

## 🗄️ Adım 2: Veritabanı Şemasını Oluşturma

1. **Sol menüden "SQL Editor"'ı açın**
2. **"New Query" butonuna tıklayın**
3. **`backend/supabase/schema.sql` dosyasının içeriğini kopyalayıp SQL Editor'a yapıştırın**
4. **"Run" butonuna tıklayın (veya Ctrl+Enter)**
5. **Success mesajını bekleyin**

### ✅ Kontrol: Tablolar Oluşturuldu mu?

SQL Editor'da bu sorguyu çalıştırın:
```sql
SELECT * FROM epochs;
SELECT * FROM layers WHERE epoch_id = 1;
SELECT * FROM rooms WHERE epoch_id = 1;
```

Sonuçlar:
- `epochs`: 1 satır (Age 1)
- `layers`: 9 satır (Layer I-IX)
- `rooms`: 10 satır (Rooms 0-9 for Layer 1)

## 🔑 Adım 3: API Keys Alma

1. **Sol menüden "Project Settings" > "API"'ye gidin**
2. **Şu bilgileri kopyalayın:**
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key: `eyJhbGc...` (uzun bir token)
   - **service_role** key: `eyJhbGc...` (sadece sunucu tarafı işlemleri için)

## ⚙️ Adım 4: Environment Variables Ayarlama

### Web Uygulaması (Next.js)

1. **`web` dizinine gidin**
2. **`.env.local` dosyası oluşturun** (`.env.example` dosyasını kopyalayabilirsiniz)
3. **Şu içeriği ekleyin:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Değerleri Supabase'den aldığınız bilgilerle değiştirin**

### ⚠️ Önemli
- `.env.local` dosyası `.gitignore`'da var, GitHub'a yüklenmez
- API keys'leri asla public repository'e commit etmeyin

## 🧪 Adım 5: Web Uygulamasını Test Etme

1. **Terminal'de `web` dizinine gidin:**
```bash
cd web
```

2. **Development server'ı başlatın:**
```bash
npm run dev
```

3. **Tarayıcıda açın:** http://localhost:3000

4. **Test:**
   - Sayfa yüklendiğinde "Age 1, Katman I - Void" görünmeli
   - Bir mesaj yazıp gönderin
   - Sistem mesajı: "Yazınız Katman I / Oda X'ye işlendi" görmeli

### 🐛 Sorun mu yaşıyorsunuz?

#### "Sistem durumu alınamadı" hatası:
- `.env.local` dosyasının doğru konumda olduğunu kontrol edin
- API keys'lerin doğru olduğunu kontrol edin
- Development server'ı yeniden başlatın (`npm run dev`)

#### "Failed to fetch" hatası:
- Supabase projesinin active olduğunu kontrol edin
- Internet bağlantınızı kontrol edin
- Browser console'da detaylı hata mesajlarına bakın (F12)

## 📊 Adım 6: Verileri Kontrol Etme

Supabase Dashboard'da:

1. **"Table Editor" sekmesine gidin**
2. **`messages` tablosunu seçin**
3. **Gönderdiğiniz mesajları görebilmelisiniz**

Örnek sorgu (SQL Editor):
```sql
SELECT 
    m.text,
    m.layer_index,
    m.room_index,
    m.created_at,
    e.name as epoch_name
FROM messages m
JOIN epochs e ON m.epoch_id = e.id
ORDER BY m.created_at DESC
LIMIT 10;
```

## 🎨 Katman Geçişini Test Etme

Layer thresholds'ları test etmek için:

```sql
-- Fast forward: Simulate 100+ messages for Layer II
INSERT INTO messages (epoch_id, layer_index, room_index, text, normalized_text)
SELECT 
    1,
    1,
    floor(random() * 10),
    'Test message ' || generate_series,
    'test message ' || generate_series
FROM generate_series(1, 100);
```

Sayfayı yenileyin, Katman II'ye geçtiğini görmelisiniz!

## 🔒 Güvenlik Notları

### Row Level Security (RLS) - Opsiyonel

Şu anda tablolar public'tir. Production'da RLS kuralları ekleyebilirsiniz:

```sql
-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" ON messages
  FOR INSERT TO anon
  WITH CHECK (true);

-- Prevent reading individual messages
CREATE POLICY "No reading messages" ON messages
  FOR SELECT TO anon
  USING (false);
```

## ✅ Kurulum Tamamlandı!

Artık:
- ✅ Supabase veritabanı hazır
- ✅ Web uygulaması çalışıyor
- ✅ Mesajlar kaydediliyor
- ✅ Katman sistemi aktif

## 🚀 Sıradaki Adımlar

1. Mobile uygulama (React Native/Expo) geliştirme
2. Babil Anı (Epoch Closure) ekranı
3. Production deployment (Vercel)
4. Advanced features (AI, analytics, vb.)

---

**Sorun mu yaşıyorsunuz?** Issue açın: https://github.com/kaenlabs/library-of-echoes/issues
