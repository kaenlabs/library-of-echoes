'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface NewEpochData {
  oldEpoch: string;
  newEpoch: string;
  timestamp: string;
}

interface ClosedEpochManifesto {
  epochName: string;
  duration: number;
  totalMessages: number;
  uniqueMessages: number;
  echoCount: number;
  finalLayer: number;
  layerName: string;
  manifesto: {
    shortSummary: string;
    detailedManifesto: string;
    emotionalTone: string;
    keyThemes: string[];
    metaphor: string;
    closingVerse: string;
    historicalSignificance: string;
    emotions?: {
      emotion: string;
      percentage: number;
      color: string;
    }[];
  };
  topWords: { word: string; count: number }[];
  topSentences: { text: string; count: number }[];
}

export default function NewEpochCelebration() {
  const router = useRouter();
  const [data, setData] = useState<NewEpochData | null>(null);
  const [manifesto, setManifesto] = useState<ClosedEpochManifesto | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get data from sessionStorage
    const storedData = sessionStorage.getItem('newEpochData');
    if (storedData) {
      setData(JSON.parse(storedData));
      fetchClosedEpochManifesto();
    } else {
      // No data, redirect to home
      router.push('/');
    }
  }, [router]);

  const fetchClosedEpochManifesto = async () => {
    try {
      // Check if we're viewing a specific epoch
      const viewingEpochId = sessionStorage.getItem('viewingEpochId');
      const url = viewingEpochId 
        ? `/api/closed-epoch?epochId=${viewingEpochId}`
        : '/api/closed-epoch';
      
      const response = await fetch(url);
      if (response.ok) {
        const manifestoData = await response.json();
        setManifesto(manifestoData);
      }
    } catch (error) {
      console.error('Failed to fetch closed epoch manifesto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Mark as seen (won't show for 3 days) - ONLY if not in view mode
    const viewingEpochId = sessionStorage.getItem('viewingEpochId');
    if (data && !viewingEpochId) {
      const seenKey = `seen_new_epoch_${data.newEpoch}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 3); // 3 days
      localStorage.setItem(seenKey, expiryDate.toISOString());
    }
    
    sessionStorage.removeItem('newEpochData');
    sessionStorage.removeItem('viewingEpochId');
    
    // If viewing from epochs page, go back to epochs instead of home
    if (viewingEpochId) {
      router.push('/epochs');
    } else {
      router.push('/');
    }
  };

  const nextSlide = () => {
    if (currentSlide < 5) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (!data || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 terminal-text animate-pulse">
          Yükleniyor...
        </div>
      </div>
    );
  }

  const slides = [
    // Slide 1: Announcement
    {
      emoji: '✨',
      title: 'Yeni Çağ Başladı!',
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-5xl font-bold text-purple-100 terminal-text mb-4">
            {data.newEpoch}
          </h2>
          <p className="text-2xl text-purple-300 terminal-text">
            Hoş Geldiniz
          </p>
          <div className="mt-8 p-6 bg-purple-900/30 border-2 border-purple-700 rounded-lg">
            <p className="text-lg text-purple-200 terminal-text">
              {data.oldEpoch} sona erdi ve arşivlendi.
            </p>
            <p className="text-lg text-purple-200 terminal-text mt-2">
              Yeni bir sayfa açılıyor.
            </p>
          </div>
        </div>
      ),
    },
    // Slide 2: Closed Epoch Stats
    {
      emoji: '📊',
      title: `${data.oldEpoch} - İstatistikler`,
      content: manifesto ? (
        <div className="space-y-6">
          <div className="text-6xl mb-4 text-center">📊</div>
          <h2 className="text-4xl font-bold text-purple-100 terminal-text mb-6 text-center">
            {manifesto.epochName} - Final İstatistikler
          </h2>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-purple-900/30 border-2 border-purple-700 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-100 terminal-text">
                {manifesto.totalMessages.toLocaleString()}
              </div>
              <div className="text-sm text-purple-400 terminal-text">Toplam Mesaj</div>
            </div>
            <div className="p-4 bg-purple-900/30 border-2 border-purple-700 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-100 terminal-text">
                {manifesto.uniqueMessages.toLocaleString()}
              </div>
              <div className="text-sm text-purple-400 terminal-text">Özgün Mesaj</div>
            </div>
            <div className="p-4 bg-purple-900/30 border-2 border-purple-700 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-100 terminal-text">
                {manifesto.layerName}
              </div>
              <div className="text-sm text-purple-400 terminal-text">Final Katman</div>
            </div>
            <div className="p-4 bg-purple-900/30 border-2 border-purple-700 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-100 terminal-text">
                {manifesto.duration} gün
              </div>
              <div className="text-sm text-purple-400 terminal-text">Süre</div>
            </div>
          </div>

          {/* Short Summary */}
          <div className="p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-lg">
            <p className="text-2xl text-purple-100 terminal-text leading-relaxed font-bold text-center italic">
              &quot;{manifesto.manifesto.shortSummary}&quot;
            </p>
          </div>

          {/* Top Words */}
          {manifesto.topWords.length > 0 && (
            <div className="p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
              <h3 className="text-lg font-bold text-purple-200 terminal-text mb-3 text-center">
                🔤 En Çok Yankılanan Kelimeler
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {manifesto.topWords.slice(0, 12).map((word, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-purple-200 terminal-text text-sm">
                    {word.word} ({word.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-purple-400 terminal-text">
          İstatistikler yükleniyor...
        </div>
      ),
    },
    // Slide 3: Manifesto
    {
      emoji: '📜',
      title: 'Çağ Manifestosu',
      content: manifesto ? (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          <div className="text-6xl mb-4 text-center">📜</div>
          <h2 className="text-4xl font-bold text-purple-100 terminal-text mb-6 text-center">
            {manifesto.epochName} - Manifesto
          </h2>

          {/* Detailed Manifesto */}
          <div className="p-6 bg-purple-900/20 border-2 border-purple-700 rounded-lg">
            <p className="text-lg text-purple-200 terminal-text leading-relaxed whitespace-pre-line text-left">
              {manifesto.manifesto.detailedManifesto}
            </p>
          </div>

          {/* Metaphor */}
          {manifesto.manifesto.metaphor && (
            <div className="p-4 bg-pink-900/30 border border-pink-700 rounded-lg text-center">
              <div className="text-sm text-pink-400 terminal-text mb-2">🔮 Metafor</div>
              <p className="text-xl text-pink-200 terminal-text font-bold italic">
                {manifesto.manifesto.metaphor}
              </p>
            </div>
          )}

          {/* Closing Verse */}
          {manifesto.manifesto.closingVerse && (
            <div className="p-4 bg-purple-900/30 border border-purple-700 rounded-lg text-center">
              <div className="text-sm text-purple-400 terminal-text mb-2">🎭 Kapanış Şiiri</div>
              <p className="text-lg text-purple-200 terminal-text italic whitespace-pre-line">
                {manifesto.manifesto.closingVerse}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-purple-400 terminal-text">
          Manifesto yükleniyor...
        </div>
      ),
    },
    // Slide 4: Key Themes
    {
      emoji: '💭',
      title: 'Temalar ve Duygular',
      content: manifesto ? (
        <div className="space-y-6">
          <div className="text-6xl mb-4 text-center">💭</div>
          <h2 className="text-4xl font-bold text-purple-100 terminal-text mb-6 text-center">
            Çağın Temaları
          </h2>

          {/* Emotional Tone */}
          <div className="p-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-500 rounded-lg text-center">
            <div className="text-sm text-purple-300 terminal-text mb-2">🎭 Duygusal Ton</div>
            <p className="text-3xl font-bold text-purple-100 terminal-text capitalize">
              {manifesto.manifesto.emotionalTone}
            </p>
          </div>

          {/* Emotions Chart */}
          {manifesto.manifesto.emotions && manifesto.manifesto.emotions.length > 0 && (
            <div className="p-6 bg-purple-900/20 border-2 border-purple-700 rounded-lg">
              <h3 className="text-xl font-bold text-purple-200 terminal-text mb-4 text-center">
                🎭 Duygusal Dağılım
              </h3>
              <div className="space-y-3">
                {manifesto.manifesto.emotions.map((emotion: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-purple-300 terminal-text font-bold">
                        {emotion.emotion}
                      </span>
                      <span className="text-purple-400 terminal-text">
                        %{emotion.percentage}
                      </span>
                    </div>
                    <div className="w-full bg-purple-950/50 rounded-full h-3 overflow-hidden border border-purple-800/50">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${emotion.percentage}%`,
                          backgroundColor: emotion.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-xs text-purple-500 terminal-text">
                Toplam: %{manifesto.manifesto.emotions.reduce((sum: number, e: any) => sum + e.percentage, 0)}
              </div>
            </div>
          )}

          {/* Key Themes */}
          {manifesto.manifesto.keyThemes.length > 0 && (
            <div className="p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
              <h3 className="text-lg font-bold text-purple-200 terminal-text mb-3 text-center">
                🔑 Ana Temalar
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {manifesto.manifesto.keyThemes.map((theme, i) => (
                  <span key={i} className="px-5 py-3 bg-pink-600/30 border border-pink-500/50 rounded-full text-pink-200 terminal-text text-lg">
                    #{theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Historical Significance */}
          {manifesto.manifesto.historicalSignificance && (
            <div className="p-6 bg-purple-900/30 border-2 border-purple-700 rounded-lg">
              <h3 className="text-xl font-bold text-purple-200 terminal-text mb-3 text-center">
                📖 Tarihsel Önem
              </h3>
              <p className="text-base text-purple-200 terminal-text leading-relaxed whitespace-pre-line text-left">
                {manifesto.manifesto.historicalSignificance}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-purple-400 terminal-text">
          Temalar yükleniyor...
        </div>
      ),
    },
    // Slide 5: Archive Info
    {
      emoji: '�',
      title: 'Arşivleme',
      content: (
        <div className="space-y-6">
          <div className="text-6xl mb-4 text-center">�</div>
          <h2 className="text-4xl font-bold text-purple-100 terminal-text mb-6 text-center">
            Çağ Arşivlendi
          </h2>
          <div className="p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500 rounded-lg text-center">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="text-2xl font-bold text-purple-100 terminal-text mb-4">
              Hiçbir Şey Silinmedi!
            </h3>
            <p className="text-lg text-purple-200 terminal-text leading-relaxed max-w-2xl mx-auto">
              {data.oldEpoch}&apos;un tüm mesajları, odaları ve verileri 
              <strong className="text-purple-100"> sonsuza kadar veritabanında korunuyor</strong>.
              Sadece yeni bir çağ başladı.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-green-900/30 border-2 border-green-700 rounded-lg">
              <div className="text-3xl mb-2 text-center">✅</div>
              <h3 className="text-xl font-bold text-green-200 terminal-text mb-3 text-center">
                Arşivde Saklanan
              </h3>
              <ul className="text-sm text-green-300 terminal-text space-y-2">
                <li>• <strong>Tüm mesajlar</strong> (epoch_id ile etiketli)</li>
                <li>• <strong>Tüm odalar</strong> (hangi çağa ait olduğu belli)</li>
                <li>• <strong>Manifesto</strong> ve AI analizleri</li>
                <li>• <strong>Katman geçişleri</strong> ve istatistikler</li>
                <li>• <strong>Kelime frekansları</strong> ve duygusal tonlar</li>
              </ul>
            </div>
            <div className="p-6 bg-blue-900/30 border-2 border-blue-700 rounded-lg">
              <div className="text-3xl mb-2 text-center">�</div>
              <h3 className="text-xl font-bold text-blue-200 terminal-text mb-3 text-center">
                Sıfırlanan
              </h3>
              <ul className="text-sm text-blue-300 terminal-text space-y-2">
                <li>• <strong>Mesaj sayacı</strong> (0&apos;dan başlar)</li>
                <li>• <strong>Katman</strong> (Katman I&apos;e döner)</li>
                <li>• <strong>Oda numaraları</strong> (yeni çağın odaları)</li>
                <li>• <strong>Güncel istatistikler</strong> (yeni çağ için)</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
            <p className="text-purple-200 terminal-text text-center text-sm leading-relaxed">
              💡 <strong>Not:</strong> Gelecekte geçmiş çağların mesajlarını görselleştireceğiz 
              (hangi odada, hangi katmanda, hangi çağda yazıldığı)
            </p>
          </div>
          <div className="mt-4 p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
            <p className="text-purple-200 terminal-text text-center">
              📚 Geçmiş çağları görüntülemek için <strong>&quot;Çağlar Arşivi&quot;</strong> sayfasını ziyaret edin.
            </p>
          </div>
        </div>
      ),
    },
    // Slide 6: New Beginning
    {
      emoji: '🚀',
      title: 'Yeni Başlangıç',
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl mb-4 animate-pulse">🚀</div>
          <h2 className="text-4xl font-bold text-purple-100 terminal-text mb-4">
            Hikaye Devam Ediyor
          </h2>
          <p className="text-xl text-purple-300 terminal-text max-w-2xl mx-auto leading-relaxed">
            {data.newEpoch} başladı. Kolektif bilinç yeniden şekilleniyor.
            İlk mesajını gönder ve yeni çağın bir parçası ol.
          </p>
          <div className="mt-8 p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500 rounded-lg">
            <p className="text-2xl text-purple-100 terminal-text font-bold">
              &quot;Her son, yeni bir başlangıçtır.&quot;
            </p>
          </div>
          <div className="mt-8">
            <button
              onClick={handleClose}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg
                       text-white text-xl font-bold hover:from-purple-500 hover:to-pink-500 transition-all terminal-text
                       shadow-lg shadow-purple-500/50"
            >
              Başlayalım! →
            </button>
          </div>
        </div>
      ),
    },
  ];

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-purple-200 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-50 w-12 h-12 flex items-center justify-center
                 bg-purple-900/80 hover:bg-purple-800 border-2 border-purple-600 rounded-full
                 text-white text-2xl transition-all hover:scale-110"
        title="Kapat (3 gün boyunca tekrar gösterilmeyecek)"
      >
        ×
      </button>

      {/* Slide Navigation Dots */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-40 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-purple-400 w-8'
                : 'bg-purple-700 hover:bg-purple-500'
            }`}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl w-full">
          {/* Slide Content */}
          <div className="animate-fadeIn">
            {currentSlideData.content}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12 px-4">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`px-6 py-3 bg-purple-900/50 border-2 border-purple-700 rounded-lg
                       text-purple-300 font-bold transition-all terminal-text
                       ${currentSlide === 0 
                         ? 'opacity-30 cursor-not-allowed' 
                         : 'hover:bg-purple-800 hover:border-purple-600'
                       }`}
            >
              ← Geri
            </button>

            <div className="text-sm text-purple-400 terminal-text">
              {currentSlide + 1} / {slides.length}
            </div>

            <button
              onClick={nextSlide}
              className="px-6 py-3 bg-purple-600 border-2 border-purple-400 rounded-lg
                       text-white font-bold hover:bg-purple-500 transition-all terminal-text"
            >
              {currentSlide === slides.length - 1 ? 'Başla →' : 'İleri →'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <p className="text-xs text-purple-500/70 terminal-text text-center">
          Bu mesaj 3 gün boyunca gösterilmeyecek • X ile kapatabilirsiniz
        </p>
      </div>
    </div>
  );
}
