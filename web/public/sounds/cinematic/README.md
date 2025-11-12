# 🎬 Sinematik Animasyon Ses Dosyaları

Bu klasör, mesaj gönderme sinematik animasyonu için gerekli ses dosyalarını içerir.

## 📦 Gerekli Dosyalar

| Dosya | Açıklama | Süre | Kullanım |
|-------|----------|------|----------|
| `portal-open.mp3` | Portal açılış sesi | 0.5s | Animasyon başlangıcı |
| `space-ambient.mp3` | Uzay ambient müziği | 2s+ | Uzay görünümü (loop) |
| `space-travel.mp3` | Hızlı yolculuk sesi | 1.5s | Mesaj yolculuğu |
| `impact.mp3` | Yumuşak patlama | 0.3s | Odaya yerleşme |
| `hologram-activate.mp3` | Hologram açılış | 0.5s | Oda hologramı |
| `ui-beep-sequence.mp3` | UI beep'leri | 0.8s | İstatistik panelleri |
| `portal-close.mp3` | Portal kapanış | 0.5s | Animasyon sonu |

## 🔍 Pixabay'den İndirme

### 1. Portal Açılış (portal-open.mp3)
- Arama: "portal open" veya "sci fi whoosh deep"
- Öneriler:
  - "Portal Activation"
  - "Deep Whoosh"
  - "Sci-Fi Door Open"

### 2. Space Ambient (space-ambient.mp3)
- **Müzik sekmesine git!** https://pixabay.com/music/
- Arama: "space ambient short" veya "sci fi ambient"
- Öneriler:
  - "Space Journey Short"
  - "Cosmic Ambient"
  - "Nebula Sound"
- NOT: Kısa olmalı (30-60 saniye), loop'lanabilir

### 3. Space Travel (space-travel.mp3)
- Arama: "space travel" veya "fast whoosh"
- Öneriler:
  - "Hyperspace Jump"
  - "Fast Travel Whoosh"
  - "Warp Speed"

### 4. Impact (impact.mp3)
- Arama: "soft impact sci fi" veya "thud"
- Öneriler:
  - "Soft Sci-Fi Impact"
  - "Energy Burst"
  - "Gentle Explosion"

### 5. Hologram Activate (hologram-activate.mp3)
- Arama: "hologram" veya "digital activate"
- Öneriler:
  - "Hologram On"
  - "Digital Interface"
  - "Tech Activate"

### 6. UI Beep Sequence (ui-beep-sequence.mp3)
- Arama: "ui beep" veya "notification sequence"
- Öneriler:
  - "UI Beep Triple"
  - "Notification Sequence"
  - "Beep Pattern"

### 7. Portal Close (portal-close.mp3)
- Arama: "portal close" veya "power down"
- Öneriler:
  - "Portal Deactivate"
  - "Sci-Fi Power Down"
  - "Soft Close"

## 🎨 Alternatif Kaynaklar

Eğer Pixabay'de bulamazsan:

1. **Freesound.org** (Ücretsiz, kaydol gerekli)
   - En geniş koleksiyon
   - Arama: "space", "portal", "hologram", "sci-fi"

2. **Mixkit.co** (Ücretsiz)
   - Yüksek kalite
   - "Sci-Fi" kategorisi

3. **Zapsplat.com** (Ücretsiz, kaydol gerekli)
   - Profesyonel kalite
   - "Space" ve "UI" kategorileri

## ⚠️ Önemli Notlar

- **Format:** MP3 (en uyumlu)
- **Boyut:** Her dosya < 500KB (ambient < 2MB)
- **Volume:** Kod içinde ayarlanmış (portal 60%, ambient 30%, vb.)
- **Loop:** Sadece `space-ambient.mp3` loop'lanır
- **Eksik dosyalar:** Ses yoksa animasyon sessiz çalışır, hata vermez

## 🧪 Test

Mesaj gönderdiğinde animasyon başlayacak ve sesler sırayla çalacak:
1. Portal açılış → space ambient başlar
2. Yolculuk sesi
3. Impact + hologram
4. UI beep'ler (3 kez)
5. Portal kapanış → ambient müzik geri döner

---

**Başarılar! 🚀**
