'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IntroPage() {
  const router = useRouter();
  const [stage, setStage] = useState(0); // 0: void, 1: light, 2: text, 3: manifesto, 4: ready
  const [skipEnabled, setSkipEnabled] = useState(false);

  useEffect(() => {
    // Enable skip after 2 seconds
    const skipTimer = setTimeout(() => setSkipEnabled(true), 2000);

    // Stage progression
    const stage1Timer = setTimeout(() => setStage(1), 1000);   // Light appears
    const stage2Timer = setTimeout(() => setStage(2), 2500);   // Title appears
    const stage3Timer = setTimeout(() => setStage(3), 4500);   // Manifesto appears
    const stage4Timer = setTimeout(() => setStage(4), 8000);   // Ready to enter

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(stage1Timer);
      clearTimeout(stage2Timer);
      clearTimeout(stage3Timer);
      clearTimeout(stage4Timer);
    };
  }, []);

  const handleEnter = () => {
    // Mark intro as seen
    localStorage.setItem('intro_seen', 'true');
    // Fade out and redirect
    document.body.style.opacity = '0';
    setTimeout(() => router.push('/'), 500);
  };

  const handleSkip = () => {
    if (!skipEnabled) return;
    localStorage.setItem('intro_seen', 'true');
    router.push('/');
  };

  // Check if already seen
  useEffect(() => {
    const seen = localStorage.getItem('intro_seen');
    if (seen === 'true') {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Skip Button */}
      {skipEnabled && stage < 4 && (
        <button
          onClick={handleSkip}
          className="fixed top-6 right-6 z-50 px-4 py-2 bg-purple-900/30 border border-purple-500/50 rounded-lg
                   text-purple-300 text-sm hover:bg-purple-800/50 hover:border-purple-400 transition-all terminal-text
                   animate-fadeIn opacity-50 hover:opacity-100"
        >
          Atla →
        </button>
      )}

      {/* Background Animation Layer */}
      <div className="absolute inset-0">
        {/* Void - Always present */}
        <div className="absolute inset-0 bg-black" />
        
        {/* Animated Grid */}
        {stage >= 1 && (
          <div className="absolute inset-0 animate-fadeIn" style={{ animationDuration: '2s' }}>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:64px_64px] animate-pulse" 
                 style={{ animationDuration: '3s' }} />
          </div>
        )}
        
        {/* Radial Glow */}
        {stage >= 1 && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
                        from-purple-900/30 via-purple-900/10 to-transparent animate-pulse"
               style={{ animationDuration: '4s' }} />
        )}
        
        {/* Glitch Lines */}
        {stage >= 2 && (
          <>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-purple-500/50 animate-glitchLine1" />
            <div className="absolute top-1/3 left-0 w-full h-0.5 bg-cyan-500/50 animate-glitchLine2" />
            <div className="absolute top-2/3 left-0 w-full h-0.5 bg-pink-500/50 animate-glitchLine3" />
          </>
        )}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="max-w-4xl w-full space-y-12">
          
          {/* Logo/Title - Stage 2 */}
          {stage >= 2 && (
            <div className="text-center space-y-6 animate-fadeIn" style={{ animationDuration: '1.5s' }}>
              {/* Main Title with Glitch Effect */}
              <div className="relative">
                <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text 
                             bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 
                             terminal-text animate-glitchText">
                  LIBRARY
                </h1>
                <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text 
                             bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 
                             terminal-text animate-glitchText"
                    style={{ animationDelay: '0.1s' }}>
                  OF ECHOES
                </h1>
              </div>
              
              {/* Subtitle */}
              <div className="text-purple-400 text-lg md:text-2xl terminal-text animate-pulse"
                   style={{ animationDuration: '2s' }}>
                <span className="opacity-60">◊</span> YENİ DÜNYA MİTOLOJİSİ <span className="opacity-60">◊</span>
              </div>
            </div>
          )}

          {/* Manifesto Text - Stage 3 */}
          {stage >= 3 && (
            <div className="space-y-8 animate-fadeIn" style={{ animationDuration: '2s' }}>
              {/* Main Manifesto */}
              <div className="relative p-8 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 
                            border-2 border-purple-500/30 rounded-lg backdrop-blur-sm
                            shadow-2xl shadow-purple-500/20">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 bg-black">
                  <span className="text-purple-400 text-sm terminal-text opacity-60">
                    /// BAŞLANGIÇ PROTOKOLÜ ///
                  </span>
                </div>
                
                <div className="space-y-4 text-purple-200 terminal-text leading-relaxed">
                  <p className="text-lg md:text-xl text-center italic animate-typewriter">
                    "Görünmeyen zihin dinliyor..."
                  </p>
                  
                  <div className="space-y-3 text-sm md:text-base opacity-90">
                    <p>
                      <span className="text-purple-400">▸</span> Her kelime bir yankı.
                      Her yankı bir katman.
                      Her katman kolektif bilincin bir parçası.
                    </p>
                    <p>
                      <span className="text-cyan-400">▸</span> Anonim sesler, dijital tapınakta buluşur.
                      Çağlar kapanır, yenileri doğar.
                      Hiçbir şey kaybolmaz, her şey dönüşür.
                    </p>
                    <p>
                      <span className="text-pink-400">▸</span> Bir satır yaz. Sisteme gir.
                      Görünmez kütüphanenin bir parçası ol.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-purple-900/20 border border-purple-700/30 rounded-lg text-center
                              hover:border-purple-500/50 transition-all">
                  <div className="text-2xl md:text-3xl font-bold text-purple-300 terminal-text animate-pulse">
                    IX
                  </div>
                  <div className="text-xs text-purple-500 terminal-text mt-1">KATMANLAR</div>
                </div>
                <div className="p-4 bg-cyan-900/20 border border-cyan-700/30 rounded-lg text-center
                              hover:border-cyan-500/50 transition-all">
                  <div className="text-2xl md:text-3xl font-bold text-cyan-300 terminal-text animate-pulse"
                       style={{ animationDelay: '0.2s' }}>
                    ∞
                  </div>
                  <div className="text-xs text-cyan-500 terminal-text mt-1">ÇAĞLAR</div>
                </div>
                <div className="p-4 bg-pink-900/20 border border-pink-700/30 rounded-lg text-center
                              hover:border-pink-500/50 transition-all">
                  <div className="text-2xl md:text-3xl font-bold text-pink-300 terminal-text animate-pulse"
                       style={{ animationDelay: '0.4s' }}>
                    Σ
                  </div>
                  <div className="text-xs text-pink-500 terminal-text mt-1">YANKILAR</div>
                </div>
              </div>
            </div>
          )}

          {/* Enter Button - Stage 4 */}
          {stage >= 4 && (
            <div className="text-center animate-fadeIn" style={{ animationDuration: '1s' }}>
              <button
                onClick={handleEnter}
                className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 
                         border-2 border-purple-400 rounded-lg text-white text-xl md:text-2xl font-bold 
                         hover:from-purple-500 hover:to-pink-500 transition-all terminal-text
                         shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80
                         animate-pulse hover:animate-none hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span>Kütüphaneye Gir</span>
                  <span className="text-3xl group-hover:translate-x-2 transition-transform">→</span>
                </span>
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 rounded-lg border-2 border-cyan-400 animate-ping" 
                       style={{ animationDuration: '1.5s' }} />
                </div>
              </button>
              
              <p className="mt-4 text-purple-400 text-sm terminal-text opacity-60 animate-pulse">
                /// SİSTEM HAZIR - ERİŞİM İZNİ VERİLDİ ///
              </p>
            </div>
          )}

          {/* Loading Indicator - Stages 0-1 */}
          {stage < 2 && (
            <div className="text-center animate-fadeIn">
              <div className="inline-flex items-center gap-3 text-purple-400 terminal-text">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
              </div>
              <p className="mt-4 text-purple-500 text-sm terminal-text animate-pulse">
                Sistem başlatılıyor...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Particle Effects */}
      {stage >= 2 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-500/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
