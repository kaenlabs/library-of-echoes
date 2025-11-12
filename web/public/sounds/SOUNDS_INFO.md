# Intro Page Sound Effects

## Ses Dosyaları

Tüm sesler ücretsiz ve telif hakkı olmayan kaynaklardan alınmıştır.

### 1. whoosh.mp3
- **Kullanım:** Stage geçişleri (1→2→3→4)
- **Kaynak:** Freesound.org / Mixkit.co
- **Süre:** ~0.5s
- **Tip:** Smooth swoosh effect

### 2. typewriter.mp3
- **Kullanım:** Manifesto satırları yazılırken
- **Kaynak:** Freesound.org
- **Süre:** ~0.1s (tek karakter)
- **Tip:** Mechanical keyboard click

### 3. enter.mp3
- **Kullanım:** "Kütüphaneye Gir" butonuna tıklanınca
- **Kaynak:** Mixkit.co
- **Süre:** ~0.8s
- **Tip:** Futuristic confirmation beep

### 4. ambient.mp3
- **Kullanım:** Arka plan müziği (loop)
- **Kaynak:** Pixabay
- **Süre:** ~60s (loop)
- **Tip:** Cyberpunk/Space ambient

### 5. panel-open.mp3 (Optional)
- **Kullanım:** Info panelleri açılırken
- **Kaynak:** Freesound.org
- **Süre:** ~0.3s
- **Tip:** Hologram activation

## İndirme Komutları

Aşağıdaki komutlarla sesleri indirebilirsiniz:

```bash
# public/sounds klasörüne git
cd web/public/sounds

# Whoosh effect
curl -o whoosh.mp3 "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c5b0c3f7d8.mp3"

# Typewriter click
curl -o typewriter.mp3 "https://cdn.pixabay.com/download/audio/2022/03/10/audio_b5b1e3c7d5.mp3"

# Enter button
curl -o enter.mp3 "https://cdn.pixabay.com/download/audio/2022/03/15/audio_d4d4b7c9e2.mp3"

# Ambient music
curl -o ambient.mp3 "https://cdn.pixabay.com/download/audio/2022/08/02/audio_1a6c88e8c6.mp3"

# Panel open (optional)
curl -o panel-open.mp3 "https://cdn.pixabay.com/download/audio/2022/03/15/audio_e3e3a8d9c1.mp3"
```

## Alternatif: Manuel İndirme

Eğer curl çalışmazsa, şu sitelere git ve "sci-fi", "whoosh", "typewriter", "ambient" ara:

1. **Pixabay:** https://pixabay.com/sound-effects/
2. **Freesound:** https://freesound.org/
3. **Mixkit:** https://mixkit.co/free-sound-effects/

## Kullanım

Intro sayfasında otomatik olarak kullanılacak:
- Stage geçişlerinde whoosh
- Her karakter yazılırken typewriter
- Enter butonunda enter sesi
- Arka planda ambient müzik (toggle ile açılıp kapatılabilir)

## Ses Kontrolü

- Tüm sesler varsayılan olarak %50 volume
- Ambient müzik toggle butonu ile açılıp kapatılabilir
- Tarayıcı autoplay policy nedeniyle ilk tıklama sonrası sesler etkinleşir
