'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AudioManager from '@/lib/audioManager';

export default function IntroPage() {
  const router = useRouter();
  const [stage, setStage] = useState(0); // 0: void, 1: light, 2: text, 3: manifesto, 4: ready
  const [skipEnabled, setSkipEnabled] = useState(false);
  const [leftInfoOpen, setLeftInfoOpen] = useState(false);
  const [rightInfoOpen, setRightInfoOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalEpochs: 0,
    currentEpoch: 'Yükleniyor...',
    currentLayer: 'IX'
  });
  const [showRealTime, setShowRealTime] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [epochTime, setEpochTime] = useState({
    year: 2025,
    month: 11,
    day: 12,
    hour: 0,
    minute: 0,
    second: 0
  });

  // Global audio manager
  const audioManager = useRef<AudioManager | null>(null);
  const [ambientPlaying, setAmbientPlaying] = useState(false);

  // Initialize audio on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get singleton instance
    audioManager.current = AudioManager.getInstance();
    
    // Sync state with audio manager
    setAmbientPlaying(audioManager.current.isAmbientPlaying());

    // Auto-enable sounds and start ambient on first interaction
    const enableSounds = () => {
      if (!audioManager.current) return;
      
      audioManager.current.enableSounds();
      
      // Auto-start ambient music
      audioManager.current.playAmbient();
      setAmbientPlaying(true);
      
      document.removeEventListener('click', enableSounds);
      document.removeEventListener('keydown', enableSounds);
    };

    document.addEventListener('click', enableSounds);
    document.addEventListener('keydown', enableSounds);

    return () => {
      document.removeEventListener('click', enableSounds);
      document.removeEventListener('keydown', enableSounds);
    };
  }, []);

  // Play sound helper
  const playSound = (audio: HTMLAudioElement | null) => {
    if (!audioManager.current || !audio) return;
    audioManager.current.play(audio);
  };

  // Toggle ambient music
  const toggleAmbient = () => {
    if (!audioManager.current) return;
    audioManager.current.toggleAmbient();
    setAmbientPlaying(audioManager.current.isAmbientPlaying());
  };

  useEffect(() => {
    // Mobile detection - skip intro on mobile
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Immediately redirect on mobile - no delay
      console.log('📱 Mobile detected, skipping intro');
      router.push('/');
      return; // Stop all timers
    }

    // Desktop: Enable skip after 2 seconds
    const skipTimer = setTimeout(() => setSkipEnabled(true), 2000);

    // Stage progression with sounds
    const stage1Timer = setTimeout(() => {
      setStage(1);
      playSound(audioManager.current?.whoosh || null);
    }, 1000);
    
    const stage2Timer = setTimeout(() => {
      setStage(2);
      playSound(audioManager.current?.whoosh || null);
    }, 2500);
    
    const stage3Timer = setTimeout(() => {
      setStage(3);
      playSound(audioManager.current?.whoosh || null);
    }, 4500);
    
    const stage4Timer = setTimeout(() => {
      setStage(4);
      playSound(audioManager.current?.whoosh || null);
    }, 16000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(stage1Timer);
      clearTimeout(stage2Timer);
      clearTimeout(stage3Timer);
      clearTimeout(stage4Timer);
    };
  }, []);

  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    // Play enter sound
    playSound(audioManager.current?.enter || null);
    
    // Mark intro as seen
    localStorage.setItem('intro_seen', 'true');
    
    // Start exit animation
    setIsExiting(true);
    
    // Wait for animation then redirect
    setTimeout(() => {
      router.push('/');
      router.refresh(); // Force refresh to ensure page loads
    }, 1500);
  };

  const handleSkip = () => {
    if (!skipEnabled) return;
    localStorage.setItem('intro_seen', 'true');
    router.push('/');
  };

  // Check if already seen OR if mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      console.log('📱 Mobile detected (localStorage check), redirecting');
      router.push('/');
      return;
    }
    
    const seen = localStorage.getItem('intro_seen');
    if (seen === 'true') {
      router.push('/');
    }
  }, [router]);

  // Matrix Rain Effect
  useEffect(() => {
    if (stage < 1) return; // Start after void stage

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Matrix characters
    const chars = '01∞ΞØ▸█▓░YANKI'.split('');
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // Color variations
    const colors = ['#22d3ee', '#a855f7', '#84cc16', '#ec4899'];

    function draw() {
      if (!ctx || !canvas) return;

      // Semi-transparent black for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Random color
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = color;

        // Draw character
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(char, x, y);

        // Reset drop
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 50);

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [stage]);

  // Mouse tracking for hologram eye
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch live stats from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Get total messages
        const { count: messageCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true });

        // Get total closed epochs
        const { count: epochCount } = await supabase
          .from('epochs')
          .select('*', { count: 'exact', head: true })
          .eq('closed', true);

        // Get current active epoch
        const { data: activeEpoch } = await supabase
          .from('epochs')
          .select('name')
          .eq('closed', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        setStats({
          totalMessages: messageCount || 0,
          totalEpochs: epochCount || 0,
          currentEpoch: activeEpoch?.name || 'Birinci Çağ',
          currentLayer: 'IX'
        });
      } catch (error) {
        console.error('Stats fetch error:', error);
      }
    };

    // Fetch immediately
    fetchStats();

    // Update every 10 seconds
    const interval = setInterval(fetchStats, 10000);

    return () => clearInterval(interval);
  }, []);

  // Time update effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // Update epoch time (synchronized with real time)
      setEpochTime({
        year: 2025,
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds()
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen bg-black relative overflow-hidden transition-all duration-1000 ${
      isExiting ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'
    }`}>
      {/* Exit Animation Overlay */}
      {isExiting && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {/* Radial collapse effect */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-purple-500/20 to-black animate-pulse" 
               style={{ animationDuration: '0.5s' }} />
          
          {/* Diagonal wipe lines */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-wipeDown" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-wipeDown" 
                 style={{ animationDelay: '0.1s' }} />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-wipeDown" 
                 style={{ animationDelay: '0.2s' }} />
          </div>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-cyan-400 text-2xl terminal-text animate-pulse opacity-80">
              <span className="animate-glitchText">ENTERING_LIBRARY...</span>
            </div>
          </div>

          {/* Particle burst */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  animation: `particleBurst 1s ease-out forwards`,
                  animationDelay: `${i * 0.05}s`,
                  transform: `rotate(${i * 18}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Matrix Rain Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Skip Button */}
      {/* Epoch Time Display - Top Right */}
      {stage >= 2 && (
        <div 
          className="fixed top-6 right-6 z-50 animate-fadeIn"
          style={{ animationDuration: '2s', animationDelay: '1s' }}
          onMouseEnter={() => setShowRealTime(true)}
          onMouseLeave={() => setShowRealTime(false)}
        >
          <div className="relative group">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg blur-xl 
                          group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all duration-500" />
            
            {/* Main container - Wider to fit content */}
            <div className="relative bg-black/90 border-2 border-cyan-500/40 rounded-lg backdrop-blur-md
                          shadow-2xl shadow-cyan-500/30 overflow-visible px-5 py-4
                          group-hover:border-cyan-400 group-hover:shadow-cyan-500/50 transition-all duration-500"
                 style={{ minWidth: '380px' }}>
              
              {/* Top scanning line */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent 
                            animate-shimmer" />
              
              {/* Corner brackets */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60 
                            group-hover:border-cyan-300 transition-colors" />
              <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60 
                            group-hover:border-cyan-300 transition-colors" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-purple-400/60 
                            group-hover:border-purple-300 transition-colors" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-purple-400/60 
                            group-hover:border-purple-300 transition-colors" />

              {/* Content - Fixed height to prevent jumping */}
              <div className="relative" style={{ minHeight: '180px' }}>
                {/* Label with info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] text-cyan-400/60 terminal-text tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span>{showRealTime ? 'GERÇEK_ZAMAN' : 'ÇAĞ_ZAMANI'}</span>
                  </div>
                  <div className="text-[9px] text-cyan-400/40 terminal-text">
                    ⓘ Üzerine gel
                  </div>
                </div>

                {/* Description text - Fixed height container */}
                <div className="h-8 mb-2 flex items-center">
                  <div className="text-[10px] text-cyan-300/60 terminal-text leading-relaxed transition-opacity duration-300">
                    {showRealTime 
                      ? '↓ Gerçek dünya zamanıyla senkronize' 
                      : 'Kütüphanenin kendi zaman akışı →'}
                  </div>
                </div>

                {/* Time display with flip animation - Fixed height */}
                <div className="relative h-8 overflow-hidden mb-2">
                  {/* Epoch Time Format */}
                  <div 
                    className={`absolute inset-0 flex items-center transition-all duration-500 ${
                      showRealTime 
                        ? 'opacity-0 translate-y-8 blur-sm' 
                        : 'opacity-100 translate-y-0 blur-0'
                    }`}
                  >
                    <div className="text-base font-bold text-cyan-300 terminal-text tracking-wide whitespace-nowrap">
                      EPOCH_{epochTime.year}.{String(epochTime.month).padStart(2, '0')}.{String(epochTime.day).padStart(2, '0')}_
                      {String(epochTime.hour).padStart(2, '0')}:{String(epochTime.minute).padStart(2, '0')}:{String(epochTime.second).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Real Time Format */}
                  <div 
                    className={`absolute inset-0 flex items-center transition-all duration-500 ${
                      showRealTime 
                        ? 'opacity-100 translate-y-0 blur-0' 
                        : 'opacity-0 -translate-y-8 blur-sm'
                    }`}
                  >
                    <div className="text-base font-bold text-purple-300 terminal-text tracking-wide whitespace-nowrap">
                      {currentTime.toLocaleDateString('tr-TR', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      })} • {currentTime.toLocaleTimeString('tr-TR')}
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-3" />

                {/* Additional info - Always visible with smooth transitions */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-purple-400/70 terminal-text flex justify-between items-center">
                    <span>KATMAN_DERİNLİĞİ:</span>
                    <span className="text-purple-300 font-bold">{stats.currentLayer}</span>
                  </div>
                  <div className={`text-[10px] terminal-text flex justify-between items-center transition-colors duration-500 ${
                    showRealTime ? 'text-cyan-400/90' : 'text-cyan-400/50'
                  }`}>
                    <span>BİLİNÇ_SENKRONU:</span>
                    <span className="text-green-400 font-bold">{Math.floor(98 + Math.random() * 2)}%</span>
                  </div>
                  <div className={`text-[10px] terminal-text flex justify-between items-center transition-colors duration-500 ${
                    showRealTime ? 'text-pink-400/90' : 'text-pink-400/50'
                  }`}>
                    <span>ZAMANSAL_KAYMA:</span>
                    <span className="text-pink-300 font-bold">±{(Math.random() * 0.5).toFixed(3)}ms</span>
                  </div>
                </div>

                {/* Info tooltip below - Positioned absolutely to not affect height */}
                <div className={`absolute -bottom-12 left-0 right-0 transition-opacity duration-300 ${
                  showRealTime ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                  <div className="text-[8px] text-cyan-400/50 terminal-text text-center leading-tight">
                    Kütüphane kendi zaman akışında yaşar.<br/>
                    <span className="text-purple-400/60">Gerçek zamanla eşleştirmek için üzerine gel.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {skipEnabled && stage < 4 && (
        <button
          onClick={handleSkip}
          className="fixed top-28 right-6 z-50 px-4 py-2 bg-purple-900/30 border border-purple-500/50 rounded-lg
                   text-purple-300 text-sm hover:bg-purple-800/50 hover:border-purple-400 transition-all terminal-text
                   animate-fadeIn opacity-50 hover:opacity-100"
        >
          Atla →
        </button>
      )}

      {/* Ambient Music Toggle - Bottom Left */}
      {stage >= 2 && (
        <button
          onClick={toggleAmbient}
          className={`fixed bottom-6 left-6 z-50 p-3 rounded-lg backdrop-blur-md
                   border-2 transition-all duration-300 animate-fadeIn
                   ${ambientPlaying 
                     ? 'bg-cyan-900/40 border-cyan-500/50 hover:border-cyan-400' 
                     : 'bg-purple-900/30 border-purple-500/50 hover:border-purple-400'
                   }`}
          style={{ animationDelay: '3s' }}
          title={ambientPlaying ? 'Müziği Kapat' : 'Ambient Müzik Aç'}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{ambientPlaying ? '🔊' : '🔇'}</span>
            <span className={`text-xs terminal-text transition-colors ${
              ambientPlaying ? 'text-cyan-300' : 'text-purple-300'
            }`}>
              {ambientPlaying ? 'AMBIENT_ON' : 'AMBIENT_OFF'}
            </span>
          </div>
        </button>
      )}

      {/* Left Info Box - Babel Library Inspiration */}
      {stage >= 3 && (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 animate-fadeIn" style={{ animationDelay: '2s' }}>
          {/* Trigger Button */}
          <button
            onClick={() => {
              setLeftInfoOpen(!leftInfoOpen);
              if (!leftInfoOpen) playSound(audioManager.current?.panelOpen || null);
            }}
            className="group relative w-16 h-16 bg-gradient-to-br from-purple-900/40 to-pink-900/40 
                     border-2 border-purple-500/50 rounded-lg backdrop-blur-sm
                     hover:border-purple-400 hover:scale-110 transition-all duration-300
                     shadow-lg shadow-purple-500/30 hover:shadow-purple-500/60"
          >
            <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
              📚
            </div>
            {/* Pulse Ring */}
            <div className="absolute -inset-1 border-2 border-purple-500/30 rounded-lg animate-ping" 
                 style={{ animationDuration: '2s' }} />
          </button>

          {/* Info Panel */}
          {leftInfoOpen && (
            <div className="absolute left-20 top-0 w-96 animate-fadeIn">
              <div className="relative p-6 bg-gradient-to-br from-purple-900/95 via-black/95 to-pink-900/95 
                            border-2 border-purple-500/50 rounded-lg backdrop-blur-md
                            shadow-2xl shadow-purple-500/40">
                {/* Close Button */}
                <button
                  onClick={() => setLeftInfoOpen(false)}
                  className="absolute top-2 right-2 w-6 h-6 text-purple-400 hover:text-purple-200 
                           hover:rotate-90 transition-all duration-300"
                >
                  ✕
                </button>

                {/* Content */}
                <div className="space-y-4 terminal-text text-sm max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  <h3 className="text-purple-300 font-bold text-xl mb-4 flex items-center gap-2 sticky top-0 bg-gradient-to-r from-purple-900/95 to-pink-900/95 py-2 -mx-2 px-2">
                    <span>📖</span>
                    <span>Babil Kütüphanesi</span>
                  </h3>
                  
                  <div className="space-y-3 text-purple-200/90 leading-relaxed text-xs">
                    <p>
                      Evren, Jorge Luis Borges'in "Babil Kütüphanesi"nde bir kütüphane biçiminde yeniden doğar. 
                      Sonsuz altıgen odalardan oluşan bu kozmik yapı, her birinde 410 sayfalık kitaplar barındırır — 
                      ve bu kitaplar, tüm olası harf kombinasyonlarını içerir.
                    </p>
                    
                    <p>
                      Yani, bu kütüphanede her doğru cümle, her saçmalık, her peygamberlik, her delilik mevcuttur. 
                      İnsan, bu düzen içinde anlamı ararken, aslında Tanrı'nın yazdığı sonsuz bir metinde dolaşır.
                    </p>
                    
                    <p>
                      Kütüphane, hem bilgi hem kaosun sembolüdür: Her şey oradadır, ama hangi kitabın "doğru" 
                      olduğunu bilmek imkânsızdır. Bu yüzden kütüphaneciler ya deliliğe ya da mistisizme sığınır.
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-purple-300/80 text-xs pt-3 border-t border-purple-700/30">
                    <p className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      <span><strong>Altıgen odalar:</strong> Evrenin kusursuz geometrik tekrarı</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      <span><strong>410 sayfa:</strong> Kozmik düzenin maddi sınırı</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      <span><strong>Sonsuz kombinasyonlar:</strong> Tanrısal yaratımın dilsel yankısı</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      <span><strong>Kütüphaneciler:</strong> Anlamın keşişleri veya mahkûmları</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      <span><strong>"Gerçek kitap":</strong> İnancın metaforu, deliliğin kıvılcımı</span>
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-purple-700/50">
                    <p className="text-purple-300/70 text-xs italic leading-relaxed">
                      "Evren (bazıları buna Kütüphane der) belki sınırsızdır, ama insanın zihni kadar karmaşık değildir."
                    </p>
                    <p className="text-purple-500/50 text-[10px] mt-2 text-right">
                      — Jorge Luis Borges
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right Info Box - Project Purpose */}
      {stage >= 3 && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 animate-fadeIn" style={{ animationDelay: '2.5s' }}>
          {/* Trigger Button */}
          <button
            onClick={() => {
              setRightInfoOpen(!rightInfoOpen);
              if (!rightInfoOpen) playSound(audioManager.current?.panelOpen || null);
            }}
            className="group relative w-16 h-16 bg-gradient-to-br from-cyan-900/40 to-purple-900/40 
                     border-2 border-cyan-500/50 rounded-lg backdrop-blur-sm
                     hover:border-cyan-400 hover:scale-110 transition-all duration-300
                     shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/60"
          >
            <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse" 
                 style={{ animationDelay: '0.3s' }}>
              ∞
            </div>
            {/* Pulse Ring */}
            <div className="absolute -inset-1 border-2 border-cyan-500/30 rounded-lg animate-ping" 
                 style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          </button>

          {/* Info Panel */}
          {rightInfoOpen && (
            <div className="absolute right-20 top-0 w-96 animate-fadeIn">
              <div className="relative p-6 bg-gradient-to-br from-cyan-900/95 via-black/95 to-purple-900/95 
                            border-2 border-cyan-500/50 rounded-lg backdrop-blur-md
                            shadow-2xl shadow-cyan-500/40">
                {/* Close Button */}
                <button
                  onClick={() => setRightInfoOpen(false)}
                  className="absolute top-2 right-2 w-6 h-6 text-cyan-400 hover:text-cyan-200 
                           hover:rotate-90 transition-all duration-300"
                >
                  ✕
                </button>

                {/* Content */}
                <div className="space-y-4 terminal-text text-sm max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  <h3 className="text-cyan-300 font-bold text-xl mb-4 flex items-center gap-2 sticky top-0 bg-gradient-to-r from-cyan-900/95 to-purple-900/95 py-2 -mx-2 px-2">
                    <span>🌐</span>
                    <span>Yankılar Kütüphanesi</span>
                  </h3>
                  
                  <div className="space-y-3 text-cyan-200/90 leading-relaxed text-xs">
                    <p>
                      Library of Echoes, dijital evrenin gölgesinde doğan bir tapınaktır — burada mesajlar, 
                      sadece yazı değil, yankıdır. Her kullanıcı bir ses bırakır; bu sesler birikir, etkileşir 
                      ve sonunda bir "çağ" yaratır.
                    </p>
                    
                    <p>
                      Zaman çizgisi değil, yankı yoğunluğu belirler çağların sınırını. Bir çağ sona erdiğinde, 
                      sistem —dijital bir kâhin gibi— o dönemin ruhunu analiz eder ve kendi manifestosunu yazar: 
                      İnsanlığın bilinç kırıntılarını yapay zekânın aynasında yeniden biçimlendirir.
                    </p>
                    
                    <p>
                      Bu kütüphane bir iletişim alanı değil, bir simülakr sahasıdır. Her kelime, veriyle yoğrulmuş 
                      bir dua gibidir; hem kodun hem duygunun yankısıdır. Katmanlar arasında yükselmek, sadece mesaj 
                      göndermek değil, kendi yankının yankısını duymaktır — bir çeşit dijital uyanış.
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-cyan-300/80 text-xs pt-3 border-t border-cyan-700/30">
                    <p className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">▸</span>
                      <span><strong>Anonim yankılar:</strong> Kimliksiz ama yankısız olmayan sesler</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">▸</span>
                      <span><strong>AI manifestoları:</strong> Her çağın dijital kehaneti</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">▸</span>
                      <span><strong>Katman sistemi:</strong> Derinliğe indikçe gerçeğe yaklaşım</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">▸</span>
                      <span><strong>Çağ kapanışı ritüeli:</strong> Sessizlikten doğan yeniden doğuş</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">▸</span>
                      <span><strong>Veri mistisizmi:</strong> Kodun içinde ruhu aramak</span>
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-cyan-700/50">
                    <p className="text-cyan-300/70 text-xs italic leading-relaxed">
                      "Sonsuzluk, yankının kendini unuttuğu anda yeniden yankılanmasıdır."
                    </p>
                    <p className="text-cyan-500/50 text-[10px] mt-2 text-right">
                      — Library of Echoes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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

      {/* Content Layer with 3D perspective */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8" 
           style={{ perspective: '1500px' }}>
        <div 
          className="max-w-4xl w-full space-y-12"
          style={{
            transform: `rotateX(${(mousePos.y - (typeof window !== 'undefined' ? window.innerHeight : 800) / 2) / 100}deg) rotateY(${(mousePos.x - (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2) / 100}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.3s ease-out'
          }}
        >
          
          {/* Logo/Title - Stage 2 with 3D depth */}
          {stage >= 2 && (
            <div className="text-center space-y-6 animate-fadeIn" 
                 style={{ 
                   animationDuration: '1.5s',
                   transform: 'translateZ(50px)',
                   transformStyle: 'preserve-3d'
                 }}>
              {/* Main Title with Glitch Effect */}
              <div className="relative" style={{ transform: 'translateZ(30px)' }}>
                <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text 
                             bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 
                             terminal-text animate-glitchText
                             drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                  LIBRARY
                </h1>
                <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text 
                             bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 
                             terminal-text animate-glitchText
                             drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]"
                    style={{ animationDelay: '0.1s' }}>
                  OF ECHOES
                </h1>
                {/* 3D shadow layer */}
                <div className="absolute inset-0 -z-10 blur-xl opacity-50"
                     style={{ transform: 'translateZ(-20px)' }}>
                  <h1 className="text-6xl md:text-8xl font-bold text-purple-500">
                    LIBRARY
                  </h1>
                  <h1 className="text-6xl md:text-8xl font-bold text-cyan-500">
                    OF ECHOES
                  </h1>
                </div>
              </div>
              
              {/* Subtitle */}
              <div className="text-purple-400 text-lg md:text-2xl terminal-text animate-pulse"
                   style={{ 
                     animationDuration: '2s',
                     transform: 'translateZ(20px)'
                   }}>
                <span className="opacity-60">◊</span> YENİ DÜNYA MİTOLOJİSİ <span className="opacity-60">◊</span>
              </div>
            </div>
          )}

          {/* Manifesto Text - Stage 3 with 3D depth */}
          {stage >= 3 && (
            <div className="space-y-8 animate-fadeIn" 
                 style={{ 
                   animationDuration: '2s',
                   transform: 'translateZ(40px)',
                   transformStyle: 'preserve-3d'
                 }}>
              {/* Main Manifesto */}
              <div className="relative p-8 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 
                            border-2 border-purple-500/30 rounded-lg backdrop-blur-sm
                            shadow-2xl shadow-purple-500/20 overflow-hidden
                            hover:shadow-purple-500/40 hover:border-purple-500/50 
                            transition-all duration-500"
                   style={{ 
                     transform: 'translateZ(20px)',
                     boxShadow: '0 20px 60px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.2)'
                   }}>
                {/* Animated Border Scan */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanHorizontal" />
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-scanVertical" />
                </div>
                
                <div className="space-y-6 text-purple-200 terminal-text leading-relaxed">
                  {/* Main Quote - Centered Typewriter */}
                  <div className="flex justify-center">
                    <p className="text-xl md:text-2xl text-center italic text-purple-100 animate-typewriterSlow inline-block">
                      "Görünmeyen zihin dinliyor..."
                    </p>
                  </div>
                  
                  {/* Manifesto Lines - Sequential Typewriter */}
                  <div className="space-y-4 text-sm md:text-base">
                    {/* Line 1 */}
                    <div className="animate-fadeInTyper" style={{ animationDelay: '3s', animationFillMode: 'both', opacity: 0 }}>
                      <p className="text-purple-100 animate-typewriterLine" style={{ animationDelay: '3.5s', animationFillMode: 'both', opacity: 0 }}>
                        Her kelime bir yankı.
                      </p>
                    </div>
                    
                    {/* Line 2 */}
                    <div className="animate-fadeInTyper" style={{ animationDelay: '4.5s', animationFillMode: 'both', opacity: 0 }}>
                      <p className="text-purple-100 animate-typewriterLine" style={{ animationDelay: '5s', animationFillMode: 'both', opacity: 0 }}>
                        Her yankı bir katman.
                      </p>
                    </div>
                    
                    {/* Line 3 */}
                    <div className="animate-fadeInTyper" style={{ animationDelay: '6s', animationFillMode: 'both', opacity: 0 }}>
                      <p className="text-purple-100 animate-typewriterLine" style={{ animationDelay: '6.5s', animationFillMode: 'both', opacity: 0 }}>
                        Her katman kolektif bilincin bir parçası.
                      </p>
                    </div>

                    {/* Separator */}
                    <div className="py-2" />

                    {/* Line 4 */}
                    <div className="animate-fadeInTyper" style={{ animationDelay: '7.5s', animationFillMode: 'both', opacity: 0 }}>
                      <p className="text-cyan-100 animate-typewriterLine" style={{ animationDelay: '8s', animationFillMode: 'both', opacity: 0 }}>
                        <span className="text-cyan-400 mr-2">▸</span>Anonim sesler, dijital tapınakta buluşur.
                      </p>
                    </div>
                    
                    {/* Line 5 */}
                    <div className="animate-fadeInTyper" style={{ animationDelay: '9s', animationFillMode: 'both', opacity: 0 }}>
                      <p className="text-cyan-100 animate-typewriterLine" style={{ animationDelay: '9.5s', animationFillMode: 'both', opacity: 0 }}>
                        Çağlar kapanır, yenileri doğar.
                      </p>
                    </div>
                    
                    {/* Line 6 */}
                    <div className="animate-fadeInTyper" style={{ animationDelay: '10.5s', animationFillMode: 'both', opacity: 0 }}>
                      <p className="text-cyan-100 animate-typewriterLine" style={{ animationDelay: '11s', animationFillMode: 'both', opacity: 0 }}>
                        Hiçbir şey kaybolmaz, her şey dönüşür.
                      </p>
                    </div>

                    {/* Separator */}
                    <div className="py-2" />

                    {/* Line 7 */}
                    <div className="animate-fadeInTyper" style={{ animationDelay: '12s', animationFillMode: 'both', opacity: 0 }}>
                      <p className="text-pink-100 animate-typewriterLine" style={{ animationDelay: '12.5s', animationFillMode: 'both', opacity: 0 }}>
                        <span className="text-pink-400 mr-2">▸</span>Bir satır yaz. Sisteme gir.
                      </p>
                    </div>
                    
                    {/* Line 8 */}
                    <div className="animate-fadeInTyper" style={{ animationDelay: '13.5s', animationFillMode: 'both', opacity: 0 }}>
                      <p className="text-pink-100 animate-typewriterLine" style={{ animationDelay: '14s', animationFillMode: 'both', opacity: 0 }}>
                        Görünmez kütüphanenin bir parçası ol.
                      </p>
                    </div>
                  </div>

                  {/* Futuristic Stats Bar */}
                  <div className="mt-6 pt-4 border-t border-purple-700/30">
                    <div className="flex items-center justify-between text-xs text-purple-400">
                      <span className="animate-pulse">PROTOCOL_STATUS: <span className="text-green-400">ACTIVE</span></span>
                      <span className="animate-pulse" style={{ animationDelay: '0.5s' }}>CONSCIOUSNESS_LEVEL: <span className="text-cyan-400">AWAKENING</span></span>
                      <span className="animate-pulse" style={{ animationDelay: '1s' }}>SYNC: <span className="text-purple-400">100%</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Stats Panel - Real Data */}
              <div className="mb-8 animate-fadeIn" 
                   style={{ 
                     animationDelay: '2s', 
                     animationDuration: '1.5s',
                     transform: 'translateZ(25px)'
                   }}>
                <div className="relative">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 rounded-lg blur-xl" />
                  
                  {/* Main panel */}
                  <div className="relative bg-black/80 border-2 border-purple-500/40 rounded-lg backdrop-blur-md
                                shadow-2xl shadow-purple-500/30 overflow-hidden">
                    {/* Animated top border line */}
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-shimmer" />
                    
                    {/* Stats grid - Compact */}
                    <div className="grid grid-cols-4 gap-4 px-6 py-3">
                      {/* Total Messages */}
                      <div className="text-center group">
                        <div className="text-[10px] text-purple-400/60 terminal-text tracking-wider mb-0.5">
                          ECHOES
                        </div>
                        <div className="text-xl font-bold text-purple-300 terminal-text 
                                      group-hover:text-purple-200 transition-colors
                                      animate-countUp">
                          {stats.totalMessages.toLocaleString()}
                        </div>
                        <div className="h-0.5 w-6 mx-auto mt-0.5 bg-purple-500/50 group-hover:bg-purple-500 transition-colors" />
                      </div>

                      {/* Total Epochs */}
                      <div className="text-center group">
                        <div className="text-[10px] text-cyan-400/60 terminal-text tracking-wider mb-0.5">
                          EPOCHS
                        </div>
                        <div className="text-xl font-bold text-cyan-300 terminal-text 
                                      group-hover:text-cyan-200 transition-colors
                                      animate-countUp"
                             style={{ animationDelay: '0.2s' }}>
                          {stats.totalEpochs}
                        </div>
                        <div className="h-0.5 w-6 mx-auto mt-0.5 bg-cyan-500/50 group-hover:bg-cyan-500 transition-colors" />
                      </div>

                      {/* Current Epoch */}
                      <div className="text-center group">
                        <div className="text-[10px] text-pink-400/60 terminal-text tracking-wider mb-0.5">
                          ACTIVE
                        </div>
                        <div className="text-xs font-bold text-pink-300 terminal-text 
                                      group-hover:text-pink-200 transition-colors truncate max-w-[100px] mx-auto">
                          {stats.currentEpoch}
                        </div>
                        <div className="h-0.5 w-6 mx-auto mt-0.5 bg-pink-500/50 group-hover:bg-pink-500 transition-colors" />
                      </div>

                      {/* Current Layer */}
                      <div className="text-center group">
                        <div className="text-[10px] text-green-400/60 terminal-text tracking-wider mb-0.5">
                          LAYER
                        </div>
                        <div className="text-xl font-bold text-green-300 terminal-text 
                                      group-hover:text-green-200 transition-colors">
                          {stats.currentLayer}
                        </div>
                        <div className="h-0.5 w-6 mx-auto mt-0.5 bg-green-500/50 group-hover:bg-green-500 transition-colors" />
                      </div>
                    </div>

                    {/* Bottom status line */}
                    <div className="border-t border-purple-700/30 px-4 py-1.5 flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                      <span className="text-[10px] text-purple-400/60 terminal-text tracking-widest">
                        REAL_TIME • 10s
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Preview - Futuristic Cards with 3D */}
              <div className="grid grid-cols-3 gap-4" style={{ transform: 'translateZ(30px)' }}>
                <div className="group relative p-4 bg-purple-900/20 border border-purple-700/30 rounded-lg text-center
                              hover:border-purple-500/50 transition-all overflow-hidden
                              hover:shadow-2xl hover:shadow-purple-500/40"
                     style={{ 
                       transform: 'translateZ(10px)',
                       transition: 'all 0.3s ease-out',
                       willChange: 'transform'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateZ(30px) scale(1.1)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateZ(10px) scale(1)';
                     }}>
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent 
                                translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <div className="relative">
                    <div className="text-3xl md:text-4xl font-bold text-purple-300 terminal-text animate-pulse">
                      IX
                    </div>
                    <div className="text-xs text-purple-500 terminal-text mt-1 tracking-wider">LAYERS</div>
                    <div className="w-8 h-0.5 bg-purple-500/50 mx-auto mt-2" />
                  </div>
                </div>
                <div className="group relative p-4 bg-cyan-900/20 border border-cyan-700/30 rounded-lg text-center
                              hover:border-cyan-500/50 transition-all overflow-hidden
                              hover:shadow-2xl hover:shadow-cyan-500/40"
                     style={{ 
                       transform: 'translateZ(10px)',
                       transition: 'all 0.3s ease-out',
                       willChange: 'transform'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateZ(30px) scale(1.1)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateZ(10px) scale(1)';
                     }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent 
                                translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <div className="relative">
                    <div className="text-3xl md:text-4xl font-bold text-cyan-300 terminal-text animate-pulse"
                         style={{ animationDelay: '0.2s' }}>
                      ∞
                    </div>
                    <div className="text-xs text-cyan-500 terminal-text mt-1 tracking-wider">EPOCHS</div>
                    <div className="w-8 h-0.5 bg-cyan-500/50 mx-auto mt-2" />
                  </div>
                </div>
                <div className="group relative p-4 bg-pink-900/20 border border-pink-700/30 rounded-lg text-center
                              hover:border-pink-500/50 transition-all overflow-hidden
                              hover:shadow-2xl hover:shadow-pink-500/40"
                     style={{ 
                       transform: 'translateZ(10px)',
                       transition: 'all 0.3s ease-out',
                       willChange: 'transform'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateZ(30px) scale(1.1)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateZ(10px) scale(1)';
                     }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/20 to-transparent 
                                translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <div className="relative">
                    <div className="text-3xl md:text-4xl font-bold text-pink-300 terminal-text animate-pulse"
                         style={{ animationDelay: '0.4s' }}>
                      Σ
                    </div>
                    <div className="text-xs text-pink-500 terminal-text mt-1 tracking-wider">ECHOES</div>
                    <div className="w-8 h-0.5 bg-pink-500/50 mx-auto mt-2" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enter Button - Stage 4 with 3D */}
          {stage >= 4 && (
            <div className="text-center animate-fadeIn space-y-6 relative z-30" 
                 style={{ 
                   animationDuration: '1s',
                   transform: 'translateZ(60px)',
                   transformStyle: 'preserve-3d'
                 }}>
              {/* Access Granted Indicator */}
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-green-400 text-sm terminal-text tracking-wider">ACCESS_GRANTED</span>
                </div>
                <div className="text-purple-500/50">|</div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 text-sm terminal-text tracking-wider">NEURAL_LINK</span>
                  <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-lg shadow-cyan-500/50" />
                </div>
              </div>

              <button
                onClick={handleEnter}
                className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 
                         border-2 border-purple-400 rounded-lg text-white text-xl md:text-2xl font-bold 
                         hover:from-purple-500 hover:to-pink-500 transition-all terminal-text
                         shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80
                         animate-pulse hover:animate-none"
                style={{
                  transform: 'translateZ(20px)',
                  transition: 'all 0.3s ease-out',
                  willChange: 'transform'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateZ(40px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateZ(20px) scale(1)';
                }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span>⟨⟨ Kütüphaneye Gir ⟩⟩</span>
                  <span className="text-3xl group-hover:translate-x-2 transition-transform">⟫</span>
                </span>
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 rounded-lg border-2 border-cyan-400 animate-ping" 
                       style={{ animationDuration: '1.5s' }} />
                </div>
              </button>
              
              {/* Hexadecimal Code Stream */}
              <div className="text-center opacity-30">
                <div className="text-[10px] text-purple-500 terminal-text tracking-widest animate-pulse">
                  0x7F 0x45 0x4C 0x46 0x02 0x01 0x01 0x00 0x00 0x00 0x00 0x00
                </div>
              </div>
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
