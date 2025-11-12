# 🎵 Ses Dosyalarını İndirme Rehberi

## Hızlı Başlangıç

### Adım 1: Pixabay'e Git
https://pixabay.com/sound-effects/

### Adım 2: Sesleri İndir

**1. Whoosh Sesi (Zorunlu)**
- Arama: "whoosh" veya "swoosh"
- Öneri: Kısa, smooth bir ses (~0.5 saniye)
- İsim: `whoosh.mp3`

**2. Enter Button Sesi (Zorunlu)**
- Arama: "button click" veya "confirmation"
- Öneri: Futuristik onay sesi (~0.5-1 saniye)
- İsim: `enter.mp3`

**3. Panel Open Sesi (İsteğe Bağlı)**
- Arama: "hologram" veya "interface open"
- Öneri: Kısa teknolojik ses (~0.3 saniye)
- İsim: `panel-open.mp3`

**4. Ambient Müzik (İsteğe Bağlı)**
- **Müzik sekmesine git**: https://pixabay.com/music/
- Arama: "cyberpunk" veya "space ambient"
- Öneri: Sakin, loop edilebilir müzik (~30-60 saniye)
- İsim: `ambient.mp3`

### Adım 3: Dosyaları Yerleştir

İndirilen dosyaları şu klasöre kopyala:
```
web/public/sounds/
```

### Adım 4: İsimleri Kontrol Et

Dosya isimleri tam olarak şunlar olmalı:
- ✅ `whoosh.mp3`
- ✅ `enter.mp3`
- ✅ `panel-open.mp3` (opsiyonel)
- ✅ `ambient.mp3` (opsiyonel)

### Adım 5: Test Et

1. Intro sayfasını aç: http://localhost:3000/intro
2. Sayfaya bir yere tıkla (sesleri etkinleştirmek için)
3. Stage geçişlerini izle → whoosh sesi duyulmalı
4. Sol alttaki 🔇 butonuna tıkla → ambient müzik açılmalı
5. Info kutularına tıkla → panel open sesi duyulmalı
6. "Kütüphaneye Gir" butonuna tıkla → enter sesi duyulmalı

---

## 🎯 En İyi Seçimler (Öneriler)

### Whoosh Sesi
- **"Whoosh Transition 1"** - Smooth geçiş sesi
- **"Swoosh 2"** - Hızlı whoosh efekti

### Enter Button
- **"Button Click Futuristic"** - Modern onay sesi
- **"Confirmation Beep"** - Kısa ve net

### Panel Open
- **"Hologram Activate"** - Teknolojik açılış
- **"Interface Open"** - UI sesi

### Ambient Müzik
- **"Cyberpunk City"** - Karanlık ambient
- **"Space Journey"** - Sakin uzay müziği
- **"Neon Lights"** - Retrofuturistic

---

## ⚠️ Önemli Notlar

1. **MP3 formatı kullan** - En uyumlu format
2. **Dosya boyutları küçük tutun** - İdeal: Her ses <500KB, müzik <5MB
3. **Sesler opsiyonel** - Eksikse kod sessiz çalışır, hata vermez
4. **İlk tıklama gerekli** - Tarayıcı autoplay policy nedeniyle

---

## 🔧 Sorun Giderme

**Sesler çalmıyor:**
- Dosya isimlerini kontrol et (tam eşleşmeli)
- Dosyaların `web/public/sounds/` klasöründe olduğundan emin ol
- Sayfayı yenile (F5)
- Console'u aç (F12) ve hata mesajlarını kontrol et
- Sayfada bir yere tıkladığından emin ol (autoplay policy)

**Ambient müzik loop olmuyor:**
- Müziğin başı ve sonu kesintisiz olmalı
- Eğer loop uyumsuzsa, başka bir müzik dene

**Sesler çok yüksek/düşük:**
- Kod içinde volume ayarları var
- İsterseniz `intro/page.tsx` dosyasında volume değerlerini değiştirebilirsiniz

---

## 🎨 Alternatif Kaynaklar

Eğer Pixabay'de bulamazsan:

1. **Freesound.org** (Ücretsiz, kaydol gerekli)
   - En geniş koleksiyon
   - Arama: "whoosh", "button", "hologram", "cyberpunk"

2. **Mixkit.co** (Ücretsiz, kaydol gereksiz)
   - Yüksek kalite
   - UI sesleri bölümü mükemmel

3. **Zapsplat.com** (Ücretsiz, kaydol gerekli)
   - Profesyonel kalite
   - Sci-fi bölümü zengin

---

## 📝 Ses Entegrasyonu Detayları

### Ana Sesler (Temel Sistem)

| Olay | Ses | Volume |
|------|-----|--------|
| Stage 1 geçiş | whoosh.mp3 | 40% |
| Stage 2 geçiş | whoosh.mp3 | 40% |
| Stage 3 geçiş | whoosh.mp3 | 40% |
| Stage 4 geçiş | whoosh.mp3 | 40% |
| Kütüphaneye Gir | enter.mp3 | 50% |
| Sol panel aç | panel-open.mp3 | 40% |
| Sağ panel aç | panel-open.mp3 | 40% |
| Ambient toggle | ambient.mp3 (loop) | 15% |

### 🎬 Sinematik Animasyon Sesleri (Mesaj Gönderme)

**NOT:** Sinematik ses dosyaları için [bu rehberi](./cinematic/README.md) kullanın!

Mesaj gönderildiğinde çalışan özel ses efektleri:

| Faz | Ses | Volume | Açıklama |
|-----|-----|--------|----------|
| Portal açılış | portal-open.mp3 | 60% | Animasyon başlangıcı |
| Uzay görünümü | space-ambient.mp3 (loop) | 30% | 2 saniye sürer |
| Mesaj yolculuğu | space-travel.mp3 | 70% | Hızlanma efekti |
| Odaya yerleşme | impact.mp3 | 50% | Yumuşak patlama |
| Oda açılımı | hologram-activate.mp3 | 50% | Hologram efekti |
| İstatistikler | ui-beep-sequence.mp3 | 40% | 3 beep sırası |
| Portal kapanış | portal-close.mp3 | 40% | Animasyon bitişi |

**Animasyon sırasında:** Ana ambient müzik otomatik durdurulur, animasyon bitince devam eder.

---

**Başarılar! 🎵**
