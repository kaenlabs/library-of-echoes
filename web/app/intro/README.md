# 🎬 Intro Page - Karşılama Animasyonu

## Özellikler

### 🌌 Görsel Efektler
- **Void Başlangıcı**: Karanlık boşluktan başlar
- **Animasyonlu Grid**: Yavaşça beliren dijital ızgara
- **Radial Glow**: Merkezi mor ışık efekti
- **Glitch Lines**: Horizontal glitch çizgileri (3 adet, farklı hızlarda)
- **Floating Particles**: 20 adet süzülen parçacık efekti

### ✨ Aşamalar (Stages)
1. **Stage 0 (0-1s)**: Void + Loading indicator
2. **Stage 1 (1-2.5s)**: Grid ve ışık efektleri başlar
3. **Stage 2 (2.5-4.5s)**: Logo ve başlık belirir (glitch efekti ile)
4. **Stage 3 (4.5-8s)**: Manifesto metni ve istatistikler
5. **Stage 4 (8s+)**: "Kütüphaneye Gir" butonu aktif

### 🎭 Animasyonlar
- **glitchText**: Logo'da sürekli glitch efekti
- **typewriter**: Manifesto metni daktilo gibi yazar
- **floatParticle**: Parçacıklar yukarı doğru süzülür
- **pulseRing**: Buton etrafında nabız efekti
- **glitchLine1/2/3**: Horizontal çizgiler ekranda kayar

### 🎨 Tasarım Özellikleri
- Terminal tarzı font (Courier New)
- Mor-pembe-cyan gradient palette
- Backdrop blur efektleri
- Neon glow shadows
- Responsive tasarım (mobile-friendly)

### ⚙️ Fonksiyonellik
- **localStorage Kontrolü**: Intro bir kez gösterilir
- **Skip Butonu**: 2 saniye sonra atla butonu belirir
- **Auto-redirect**: Intro görüldüyse direkt ana sayfaya
- **Smooth Transition**: Fade-out efekti ile geçiş

## 🧪 Test Etme

1. localStorage'ı temizle: `localStorage.removeItem('intro_seen')`
2. Sayfayı yenile veya `/intro` adresine git
3. Test panel'den "🎬 Intro Tekrar Göster" butonuna bas

## 🎯 Kullanım

İlk ziyaret:
```
/ → (intro_seen yok) → /intro → animasyon → localStorage set → /
```

Sonraki ziyaretler:
```
/ → (intro_seen var) → Ana sayfa
```

## 🎨 CSS Animasyonları

`globals.css` içinde tanımlı:
- `@keyframes glitchText` - Glitch text efekti
- `@keyframes glitchLine1/2/3` - Horizontal line animasyonları
- `@keyframes typewriter` - Daktilo efekti
- `@keyframes floatParticle` - Parçacık hareketi
- `@keyframes shimmer` - Işıltı efekti
- `@keyframes pulseRing` - Nabız efekti

## 📱 Responsive

- Mobile: Tek sütun, küçük fontlar
- Tablet: Orta boyut
- Desktop: Tam deneyim, büyük fontlar

## 🔧 Geliştirme Notları

- Stage timing'leri `useEffect` ile yönetiliyor
- Tüm animasyonlar CSS ile (performans için)
- localStorage "intro_seen" flag'i ile kontrol
- Skip butonu 2 saniye sonra aktif (kullanıcı deneyimi için)
