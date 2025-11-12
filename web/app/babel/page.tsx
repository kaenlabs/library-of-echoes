'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BabelStats {
  epochName: string;
  epochId: number;
  totalMessages: number;
  uniqueMessages: number;
  echoCount: number;
  finalLayer: string;
  duration: number;
  topWords: { word: string; count: number }[];
  topSentences: { text: string; count: number }[];
  aiAnalysis: {
    shortSummary: string;
    detailedManifesto: string;
    emotionalTone: string;
    keyThemes: string[];
    metaphor?: string;
    closingVerse?: string;
    coordinatedAction?: {
      detected: boolean;
      keyword: string;
      count: number;
      commentary: string;
    };
  };
  emotions: { emotion: string; percentage: number; color: string }[];
}

// Dynamic pages - coordinated only included if detected
const getPageList = (hasCoordinatedAction: boolean): readonly PageType[] => {
  if (hasCoordinatedAction) {
    return ['intro', 'stats', 'words', 'sentences', 'emotions', 'coordinated', 'manifesto', 'closure'] as const;
  }
  return ['intro', 'stats', 'words', 'sentences', 'emotions', 'manifesto', 'closure'] as const;
};

type PageType = 'intro' | 'stats' | 'words' | 'sentences' | 'emotions' | 'coordinated' | 'manifesto' | 'closure';

export default function BabelMoment() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<PageType>('intro');
  const [stats, setStats] = useState<BabelStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get dynamic page list based on coordinated action detection
  const PAGES = stats ? getPageList(!!stats.aiAnalysis?.coordinatedAction?.detected) : getPageList(false);

  useEffect(() => {
    // Fetch Babel Moment data
    fetchBabelData();
  }, []);

  // NO AUTOMATIC REDIRECT - Let users view Babel Moment
  // Only database tracking for authenticated users

  const fetchBabelData = async () => {
    try {
      const response = await fetch('/api/babel-moment');
      if (response.ok) {
        const data = await response.json();
        
        // Check if Babel threshold was reached
        if (data.reached === false) {
          setStats(null);
        } else {
          setStats(data);
        }
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Failed to fetch Babel Moment data:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const nextPage = async () => {
    const currentIndex = PAGES.indexOf(currentPage);
    
    if (currentIndex < PAGES.length - 1) {
      setCurrentPage(PAGES[currentIndex + 1]);
    } else {
      // End of Babel Moment - mark as seen for authenticated users only
      if (stats) {
        try {
          const { supabase } = await import('@/lib/supabase');
          const { data: { session } } = await supabase.auth.getSession();
          
          // Only mark for authenticated users
          if (session?.access_token) {
            const headers: HeadersInit = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            };

            await fetch('/api/mark-babel-seen', {
              method: 'POST',
              headers,
              body: JSON.stringify({ epochId: stats.epochId }),
            });
            
            console.log(`✅ User marked epoch ${stats.epochId} as seen in database`);
            
            // Also mark in localStorage (backup check)
            localStorage.setItem(`seen_babel_${stats.epochId}`, 'true');
          } else {
            console.log(`👤 Guest user - no tracking needed`);
            // Mark in localStorage for guests
            localStorage.setItem(`seen_babel_${stats.epochId}`, 'true');
          }
        } catch (error) {
          console.error('Failed to mark Babel Moment:', error);
        }
      }
      
      // Set flag to prevent redirect loop
      sessionStorage.setItem('justClosedBabel', 'true');
      
      // Redirect to home
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 terminal-text text-xl animate-pulse">
          Babil Anı hazırlanıyor...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 terminal-text text-center">
          <p className="text-xl mb-4">Henüz Babil Anı'na ulaşılmadı.</p>
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
    <div className="min-h-screen bg-black text-purple-200 overflow-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        {/* Page 1: Intro */}
        {currentPage === 'intro' && (
          <div className="text-center space-y-8 fade-in">
            <h1 className="text-7xl md:text-9xl font-bold text-purple-100 glow-text terminal-text animate-pulse">
              🌌
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold text-purple-200 terminal-text">
              Babil Anı
            </h2>
            <p className="text-xl md:text-2xl text-purple-400 terminal-text max-w-2xl mx-auto">
              {stats.epochName} sona erdi.
            </p>
            <p className="text-lg text-purple-500 terminal-text">
              1,024,808 mesaj yazıldı. Kuleler yükseldi.
            </p>
            <button
              onClick={nextPage}
              className="mt-12 px-8 py-4 bg-purple-600/30 border-2 border-purple-500 rounded-lg
                       text-purple-200 text-lg hover:bg-purple-600/50 hover:border-purple-400
                       transition-all duration-300 terminal-text animate-pulse"
            >
              Devam Et →
            </button>
          </div>
        )}

        {/* Page 2: Stats */}
        {currentPage === 'stats' && (
          <div className="text-center space-y-12 fade-in max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-purple-100 terminal-text mb-8">
              📊 Çağın Bilançosu
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-purple-900/30 border-2 border-purple-700 rounded-lg">
                <div className="text-6xl font-bold text-purple-100 terminal-text mb-2">
                  {stats.totalMessages.toLocaleString()}
                </div>
                <div className="text-purple-400 terminal-text">Toplam Mesaj</div>
              </div>

              <div className="p-8 bg-purple-900/30 border-2 border-purple-700 rounded-lg">
                <div className="text-6xl font-bold text-purple-100 terminal-text mb-2">
                  {stats.uniqueMessages.toLocaleString()}
                </div>
                <div className="text-purple-400 terminal-text">Eşsiz Mesaj</div>
              </div>

              <div className="p-8 bg-purple-900/30 border-2 border-purple-700 rounded-lg">
                <div className="text-6xl font-bold text-purple-100 terminal-text mb-2">
                  {(stats.echoCount || (stats.totalMessages - stats.uniqueMessages)).toLocaleString()}
                </div>
                <div className="text-purple-400 terminal-text">Yankılanan</div>
              </div>

              <div className="p-8 bg-purple-900/30 border-2 border-purple-700 rounded-lg">
                <div className="text-6xl font-bold text-purple-100 terminal-text mb-2">
                  {stats.duration || 0}
                </div>
                <div className="text-purple-400 terminal-text">Gün</div>
              </div>
            </div>

            <div className="p-6 bg-purple-900/20 border border-purple-700/50 rounded-lg">
              <p className="text-purple-300 terminal-text text-lg">
                Son Katman: <strong className="text-purple-100">{stats.finalLayer || 'Unknown'}</strong>
              </p>
            </div>

            <button
              onClick={nextPage}
              className="mt-8 px-8 py-4 bg-purple-600/30 border-2 border-purple-500 rounded-lg
                       text-purple-200 text-lg hover:bg-purple-600/50 transition-all terminal-text"
            >
              Devam Et →
            </button>
          </div>
        )}

        {/* Page 3: Top Words - Kelime Bulutu */}
        {currentPage === 'words' && (
          <div className="text-center space-y-8 fade-in max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-purple-100 terminal-text mb-8">
              🔤 Büyüyen Kelimeler
            </h2>
            <p className="text-purple-400 terminal-text text-lg mb-8">
              En çok kullanılan kelimeler
            </p>
            
            {/* Word Cloud Style Display */}
            <div className="relative min-h-[400px] flex flex-wrap items-center justify-center gap-4 p-8">
              {(stats.topWords || []).slice(0, 20).map((item, index) => {
                const size = Math.max(16, 60 - index * 2);
                const opacity = Math.max(0.4, 1 - index * 0.03);
                return (
                  <div
                    key={index}
                    className="inline-block transition-all duration-300 hover:scale-110 cursor-default"
                    style={{
                      fontSize: `${size}px`,
                      opacity,
                      animation: `float ${2 + index * 0.1}s ease-in-out infinite`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <span className="text-purple-300 terminal-text font-bold">
                      {item.word}
                    </span>
                    <span className="text-purple-600 terminal-text text-xs ml-1">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={nextPage}
              className="mt-8 px-8 py-4 bg-purple-600/30 border-2 border-purple-500 rounded-lg
                       text-purple-200 text-lg hover:bg-purple-600/50 transition-all terminal-text"
            >
              Devam Et →
            </button>
          </div>
        )}

        {/* Page 4: Top Sentences - Kayan Cümleler */}
        {currentPage === 'sentences' && (
          <div className="text-center space-y-8 fade-in max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-purple-100 terminal-text mb-8">
              💬 Yankılanan Cümleler
            </h2>
            <p className="text-purple-400 terminal-text text-lg mb-8">
              En çok tekrarlanan mesajlar
            </p>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-purple-900/20">
              {(stats.topSentences || []).map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-purple-900/20 border border-purple-700/30 rounded-lg
                           hover:bg-purple-900/40 hover:border-purple-600/50 transition-all
                           animate-slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-bold text-purple-400 terminal-text min-w-[40px]">
                      #{index + 1}
                    </span>
                    <div className="flex-1 text-left">
                      <p className="text-lg text-purple-100 terminal-text mb-2">
                        &quot;{item.text}&quot;
                      </p>
                      <p className="text-sm text-purple-500 terminal-text">
                        {item.count} kez tekrarlandı
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={nextPage}
              className="mt-8 px-8 py-4 bg-purple-600/30 border-2 border-purple-500 rounded-lg
                       text-purple-200 text-lg hover:bg-purple-600/50 transition-all terminal-text"
            >
              Devam Et →
            </button>
          </div>
        )}

        {/* Page 5: Emotional Distribution - Renkli Bar Chart */}
        {currentPage === 'emotions' && (
          <div className="text-center space-y-8 fade-in max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-purple-100 terminal-text mb-8">
              🎭 Duygusal Dağılım
            </h2>
            <p className="text-purple-400 terminal-text text-lg mb-8">
              AI Analizi: Bu çağın duygusal tonu
            </p>
            
            <div className="space-y-6">
              {(stats.emotions || []).map((emotion, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xl text-purple-200 terminal-text font-bold">
                      {emotion.emotion}
                    </span>
                    <span className="text-2xl text-purple-100 terminal-text font-bold">
                      %{emotion.percentage}
                    </span>
                  </div>
                  <div className="h-8 bg-purple-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out flex items-center justify-end pr-4"
                      style={{
                        width: `${emotion.percentage}%`,
                        backgroundColor: emotion.color,
                        animationDelay: `${index * 0.2}s`
                      }}
                    >
                      <span className="text-white text-sm terminal-text font-bold">
                        {emotion.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-purple-900/20 border border-purple-700/50 rounded-lg mb-8">
              <p className="text-purple-300 terminal-text text-lg">
                <strong className="text-purple-100">Genel Ton:</strong> {stats.aiAnalysis?.emotionalTone || 'Unknown'}
              </p>
            </div>

            <button
              onClick={nextPage}
              className="mt-8 px-8 py-4 bg-purple-600/30 border-2 border-purple-500 rounded-lg
                       text-purple-200 text-lg hover:bg-purple-600/50 transition-all terminal-text"
            >
              Devam Et →
            </button>
          </div>
        )}

        {/* Page 6: Coordinated Action Detection (ONLY if detected) */}
        {currentPage === 'coordinated' && stats.aiAnalysis?.coordinatedAction?.detected && (
          <div className="text-center space-y-8 fade-in max-w-4xl mx-auto">
            <h2 className="text-6xl font-bold text-yellow-300 terminal-text mb-8 animate-pulse">
              🎯 KOORDİNELİ EYLEM TESPİT EDİLDİ!
            </h2>
            
            <div className="p-8 bg-gradient-to-br from-yellow-900/40 via-orange-900/40 to-red-900/40 
                          border-4 border-yellow-500/70 rounded-xl shadow-2xl mb-8">
              <div className="space-y-6">
                {/* Keyword Display */}
                <div className="text-7xl md:text-8xl font-black text-yellow-200 terminal-text 
                              animate-bounce mb-6 uppercase tracking-wider">
                  &quot;{stats.aiAnalysis.coordinatedAction.keyword}&quot;
                </div>
                
                {/* Count Badge */}
                <div className="inline-block px-8 py-4 bg-yellow-600/50 border-2 border-yellow-400 rounded-full">
                  <span className="text-4xl font-bold text-yellow-100 terminal-text">
                    ✨ {stats.aiAnalysis.coordinatedAction.count} KEZ YANKILANDI ✨
                  </span>
                </div>
              </div>
            </div>

            {/* AI Commentary - Sarcastic/Funny */}
            <div className="p-8 bg-purple-900/40 border-2 border-purple-500/50 rounded-lg">
              <p className="text-2xl text-purple-100 terminal-text leading-relaxed">
                🤖 <strong>AI Yorumu:</strong>
              </p>
              <p className="text-xl text-purple-200 terminal-text leading-relaxed mt-4 italic">
                {stats.aiAnalysis.coordinatedAction.commentary}
              </p>
            </div>

            {/* Fun Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                <p className="text-yellow-400 text-sm terminal-text">Organize Hareket</p>
                <p className="text-3xl text-yellow-200 terminal-text font-bold">✓</p>
              </div>
              <div className="p-4 bg-orange-900/20 border border-orange-700/50 rounded-lg">
                <p className="text-orange-400 text-sm terminal-text">Kolektif Şuur</p>
                <p className="text-3xl text-orange-200 terminal-text font-bold">Aktif</p>
              </div>
              <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                <p className="text-red-400 text-sm terminal-text">Dijital Tribün</p>
                <p className="text-3xl text-red-200 terminal-text font-bold">Kuruldu</p>
              </div>
            </div>

            <button
              onClick={nextPage}
              className="mt-8 px-8 py-4 bg-yellow-600/40 border-2 border-yellow-500 rounded-lg
                       text-yellow-200 text-lg hover:bg-yellow-600/60 transition-all terminal-text font-bold"
            >
              Manifesto&apos;yu Gör →
            </button>
          </div>
        )}

        {/* Page 7: AI Manifesto */}
        {currentPage === 'manifesto' && (
          <div className="text-center space-y-8 fade-in max-w-5xl mx-auto">
            <h2 className="text-5xl font-bold text-purple-100 terminal-text mb-8">
              📜 Yeni Dünya Mitolojisi
            </h2>
            
            <p className="text-purple-400 terminal-text text-sm mb-4">
              {stats.epochName} - Kolektif Bilinçaltının Kaydı
            </p>

            {/* Short Summary - Big Text */}
            <div className="p-8 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-lg mb-8">
              <p className="text-3xl md:text-4xl text-purple-100 terminal-text leading-relaxed font-bold">
                &quot;{stats.aiAnalysis?.shortSummary || 'Bir çağ kapandı...'}&quot;
              </p>
            </div>

            {/* Metaphor */}
            {stats.aiAnalysis?.metaphor && (
              <div className="p-4 bg-purple-900/30 border border-purple-700/30 rounded-lg mb-6">
                <p className="text-purple-300 terminal-text text-lg italic">
                  ✨ {stats.aiAnalysis.metaphor}
                </p>
              </div>
            )}

            {/* Detailed Manifesto - Scrollable */}
            <div className="p-8 bg-purple-900/20 border-2 border-purple-700/50 rounded-lg text-left max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-purple-900/20">
              <p className="text-base md:text-lg text-purple-200 terminal-text leading-relaxed whitespace-pre-line">
                {stats.aiAnalysis?.detailedManifesto || 'Manifesto yükleniyor...'}
              </p>
            </div>

            {/* Closing Verse */}
            {stats.aiAnalysis?.closingVerse && (
              <div className="p-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg">
                <p className="text-purple-200 terminal-text text-lg leading-relaxed whitespace-pre-line italic">
                  {stats.aiAnalysis.closingVerse}
                </p>
              </div>
            )}

            {/* Key Themes */}
            <div className="mt-10 pt-8 border-t border-purple-700/50">
              <p className="text-purple-400 text-sm terminal-text mb-5">Ana Temalar:</p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {(stats.aiAnalysis?.keyThemes || []).map((theme, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-full
                             text-purple-200 terminal-text text-sm hover:bg-purple-600/50 transition-all"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Info */}
            <div className="mt-8 mb-8 p-5 bg-purple-900/20 border border-purple-700/30 rounded-lg space-y-3">
              <p className="text-purple-300 terminal-text text-sm">
                🤖 <strong>Duygusal Ton:</strong> {stats.aiAnalysis?.emotionalTone || 'Unknown'}
              </p>
              <p className="text-purple-500 terminal-text text-xs">
                Bu manifesto Groq AI (Llama 3.3 70B) tarafından çağın ruhunu yansıtacak şekilde oluşturuldu
              </p>
            </div>

            {/* Button with extra space */}
            <div className="mt-12 pt-4">
              <button
                onClick={nextPage}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg
                         text-white text-lg hover:from-purple-500 hover:to-pink-500 transition-all terminal-text
                         shadow-lg shadow-purple-500/50"
              >
                Çağı Kapat →
              </button>
            </div>
          </div>
        )}

        {/* Page 8: Closure */}
        {currentPage === 'closure' && (
          <div className="text-center space-y-8 fade-in">
            <h1 className="text-6xl md:text-8xl font-bold text-purple-100 terminal-text animate-pulse">
              ✨
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold text-purple-200 terminal-text">
              Yeni Bir Çağ Başlıyor
            </h2>
            <p className="text-xl text-purple-400 terminal-text max-w-2xl mx-auto">
              {stats.epochName} tamamlandı ve arşivlendi.
            </p>
            <p className="text-lg text-purple-500 terminal-text">
              Tüm odalar ve mesajlar sıfırlandı. Katman I'e hoş geldiniz.
            </p>
            
            <div className="mt-12 space-y-4">
              <button
                onClick={() => router.push('/')}
                className="block mx-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                         border-2 border-purple-400 rounded-lg text-white text-lg 
                         hover:from-purple-500 hover:to-pink-500 transition-all terminal-text
                         shadow-lg shadow-purple-500/50"
              >
                Yeni Çağa Başla →
              </button>
              
              <button
                onClick={() => router.push('/epochs')}
                className="block mx-auto px-6 py-3 bg-purple-900/30 border border-purple-700 rounded-lg
                         text-purple-300 hover:bg-purple-900/50 transition-all terminal-text"
              >
                📚 Çağlar Arşivine Git
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-2">
          {PAGES.map((page, index) => (
            <div
              key={page}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                PAGES.indexOf(currentPage) >= index
                  ? 'bg-purple-400 scale-110'
                  : 'bg-purple-800/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
