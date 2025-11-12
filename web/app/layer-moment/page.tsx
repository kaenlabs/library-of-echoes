'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LayerMomentData {
  layerName: string;
  layerIndex: number;
  totalMessages: number;
  uniqueMessages: number;
  echoCount: number;
  topWords: { word: string; count: number }[];
  topSentences: { text: string; count: number }[];
  aiAnalysis: {
    shortSummary: string;
    detailedManifesto: string;
    emotionalTone: string;
    keyThemes: string[];
  };
  emotions: { emotion: string; percentage: number; color: string }[];
  theme: string;
  comparisons?: {
    comparedWith: string;
    layerName: string;
    messageGrowth: number;
    uniqueGrowth: number;
    echoGrowth: number;
    newTopWords: string[];
  }[];
}

export default function LayerMomentPage() {
  const router = useRouter();
  const [data, setData] = useState<LayerMomentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get data from sessionStorage first
    const storedData = sessionStorage.getItem('layerMomentData');
    if (storedData) {
      setData(JSON.parse(storedData));
      setLoading(false);
    } else {
      // Fetch from API
      fetchLayerMoment();
    }
  }, []);

  const fetchLayerMoment = async () => {
    try {
      const response = await fetch('/api/layer-moment');
      if (response.ok) {
        const layerData = await response.json();
        setData(layerData);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to fetch layer moment:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    sessionStorage.removeItem('layerMomentData');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 terminal-text text-xl animate-pulse">
          Katman Anı hazırlanıyor...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 terminal-text text-center">
          <p className="text-xl mb-4">Veri bulunamadı</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600/30 border border-purple-500 rounded-lg
                     text-purple-300 hover:bg-purple-600/50 transition-all"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${data.theme} text-purple-200 py-8 px-4 sm:px-8 relative`}>
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-50 w-12 h-12 flex items-center justify-center
                 bg-purple-900/80 hover:bg-purple-800 border-2 border-purple-600 rounded-full
                 text-white text-2xl transition-all hover:scale-110"
        title="Kapat"
      >
        ×
      </button>

      <div className="max-w-5xl mx-auto text-center">
        {/* Header */}
        <div className="text-center mb-12 fade-in">
          <div className="text-7xl mb-4 animate-pulse">🎨</div>
          <h1 className="text-6xl font-bold text-purple-100 terminal-text mb-4">
            {data.layerName}
          </h1>
          <p className="text-2xl text-purple-300 terminal-text">
            Katman {data.layerIndex} - Yeni Bir Boyut
          </p>
        </div>

        {/* Summary */}
        <div className="p-8 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-lg mb-8 fade-in">
          <p className="text-3xl text-purple-100 terminal-text leading-relaxed font-bold text-center">
            &quot;{data.aiAnalysis?.shortSummary || 'Yeni katmana hoş geldiniz'}&quot;
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-purple-900/30 border-2 border-purple-700 rounded-lg text-center fade-in">
            <div className="text-4xl font-bold text-purple-100 terminal-text mb-2">
              {data.totalMessages.toLocaleString()}
            </div>
            <div className="text-sm text-purple-400 terminal-text">Toplam Mesaj</div>
          </div>

          <div className="p-6 bg-purple-900/30 border-2 border-purple-700 rounded-lg text-center fade-in">
            <div className="text-4xl font-bold text-purple-100 terminal-text mb-2">
              {data.uniqueMessages.toLocaleString()}
            </div>
            <div className="text-sm text-purple-400 terminal-text">Özgün Ses</div>
          </div>

          <div className="p-6 bg-purple-900/30 border-2 border-purple-700 rounded-lg text-center fade-in">
            <div className="text-4xl font-bold text-purple-100 terminal-text mb-2">
              {data.echoCount.toLocaleString()}
            </div>
            <div className="text-sm text-purple-400 terminal-text">Yankı</div>
          </div>
        </div>

        {/* Comparisons - NEW: Show differences from previous layers */}
        {data.comparisons && data.comparisons.length > 0 && (
          <div className="p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-blue-700 rounded-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-blue-100 terminal-text mb-4">
              📊 Önceki Katmanlarla Karşılaştırma
            </h2>
            <div className="space-y-4">
              {data.comparisons.map((comparison, index) => (
                <div key={index} className="p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg text-center">
                  <h3 className="text-lg font-bold text-blue-200 terminal-text mb-3">
                    {comparison.comparedWith} ({comparison.layerName}) &apos;den bu yana:
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 terminal-text">
                        +{comparison.messageGrowth}
                      </div>
                      <div className="text-xs text-blue-300 terminal-text">Mesaj</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400 terminal-text">
                        +{comparison.uniqueGrowth}
                      </div>
                      <div className="text-xs text-blue-300 terminal-text">Özgün</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400 terminal-text">
                        +{comparison.echoGrowth}
                      </div>
                      <div className="text-xs text-blue-300 terminal-text">Yankı</div>
                    </div>
                  </div>
                  {comparison.newTopWords.length > 0 && (
                    <div>
                      <div className="text-sm text-blue-300 terminal-text mb-2">
                        🆕 Yeni öne çıkan kelimeler:
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {comparison.newTopWords.map((word, i) => (
                          <span key={i} className="px-3 py-1 bg-green-600/30 border border-green-500/50 rounded-full text-green-200 terminal-text text-sm">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emotions */}
        <div className="p-6 bg-purple-900/20 border-2 border-purple-700 rounded-lg mb-8 text-center">
          <h2 className="text-2xl font-bold text-purple-100 terminal-text mb-4">
            🎭 Duygusal Dağılım
          </h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {data.emotions.slice(0, 6).map((emotion, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-purple-200 terminal-text font-bold">
                    {emotion.emotion}
                  </span>
                  <span className="text-xl text-purple-100 terminal-text font-bold">
                    %{emotion.percentage}
                  </span>
                </div>
                <div className="h-6 bg-purple-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${emotion.percentage}%`,
                      backgroundColor: emotion.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Manifesto */}
        <div className="p-8 bg-purple-900/20 border-2 border-purple-700 rounded-lg mb-8 text-center">
          <h2 className="text-3xl font-bold text-purple-100 terminal-text mb-4">
            📜 Katman Analizi
          </h2>
          <p className="text-lg text-purple-200 terminal-text leading-relaxed whitespace-pre-line max-w-4xl mx-auto text-left">
            {data.aiAnalysis?.detailedManifesto || 'Analiz yükleniyor...'}
          </p>
        </div>

        {/* Top Words */}
        <div className="p-6 bg-purple-900/20 border-2 border-purple-700 rounded-lg mb-8 text-center">
          <h2 className="text-2xl font-bold text-purple-100 terminal-text mb-4">
            🔤 En Çok Yankılanan Kelimeler
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {data.topWords.map((word, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-full
                         text-purple-200 terminal-text hover:bg-purple-600/50 transition-all"
              >
                {word.word} ({word.count})
              </span>
            ))}
          </div>
        </div>

        {/* Themes */}
        {data.aiAnalysis?.keyThemes && (
          <div className="p-6 bg-purple-900/20 border-2 border-purple-700 rounded-lg mb-8 text-center">
            <h2 className="text-2xl font-bold text-purple-100 terminal-text mb-4">
              💭 Ana Temalar
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {data.aiAnalysis.keyThemes.map((theme, index) => (
                <span
                  key={index}
                  className="px-5 py-3 bg-pink-600/30 border border-pink-500/50 rounded-full
                           text-pink-200 terminal-text text-lg hover:bg-pink-600/50 transition-all"
                >
                  #{theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleClose}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg
                     text-white text-xl font-bold hover:from-purple-500 hover:to-pink-500 transition-all terminal-text
                     shadow-lg shadow-purple-500/50"
          >
            Devam Et →
          </button>
        </div>
      </div>
    </div>
  );
}
