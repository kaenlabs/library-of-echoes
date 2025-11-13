'use client';

import { useState, useEffect, useRef } from 'react';
import InputBox from '@/components/InputBox';
import SystemMessage from '@/components/SystemMessage';
import LayerVisualizer from '@/components/LayerVisualizer';
import AuthModal from '@/components/AuthModal';
import StatsPanel from '@/components/StatsPanel';
import TestPanel from '@/components/TestPanel';
import MessageCinematic from '@/components/MessageCinematic';
import { SystemState, MessageResponse } from '@/lib/supabase';
import { getLayerInfo } from '@/lib/layers';
import { getCurrentUser, signOut } from '@/lib/auth';
import AudioManager from '@/lib/audioManager';

export default function Home() {
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [systemMessages, setSystemMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const [isIntroChecked, setIsIntroChecked] = useState(false);
  
  // Cinematic animation state
  const [showCinematic, setShowCinematic] = useState(false);
  const [cinematicData, setCinematicData] = useState<{
    layer: number;
    room: number;
    echoCount: number;
    remainingMessages: number;
    totalMessages: number;
  } | null>(null);

  // Global audio manager
  const audioManager = useRef<AudioManager | null>(null);
  const [ambientPlaying, setAmbientPlaying] = useState(false);

  // Initialize audio
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get singleton instance (same as intro)
    audioManager.current = AudioManager.getInstance();
    
    // Sync state with audio manager
    setAmbientPlaying(audioManager.current.isAmbientPlaying());

    return () => {
      // Don't cleanup - audio should persist across pages
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

  // Check intro and fetch initial state
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    
    // Skip intro check on mobile - go straight to app
    if (isMobile) {
      console.log('📱 Mobile detected, skipping intro check');
      setIsIntroChecked(true);
      
      // Fetch data
      fetchSystemState();
      checkUser();
      fetchRemainingMessages();
      checkForUnseenBabelMoment();
      return;
    }
    
    // Desktop: Check if intro was seen
    const introSeen = localStorage.getItem('intro_seen');
    if (!introSeen) {
      // Redirect to intro page
      window.location.href = '/intro';
      return;
    }

    // Mark intro as checked
    setIsIntroChecked(true);

    // Fetch data
    fetchSystemState();
    checkUser();
    fetchRemainingMessages();
    checkForUnseenBabelMoment();
  }, []);

  const checkForUnseenBabelMoment = async () => {
    // DISABLED: No automatic redirect to Babel
    // Users will use "Babil Anı" button in test panel or notification
    console.log('🔕 Auto-redirect to Babel disabled - users can view via button');
    return;
    
    /* OLD CODE - DISABLED
    try {
      // Check if we just came from Babel page (avoid redirect loop)
      const justFromBabel = sessionStorage.getItem('justClosedBabel');
      if (justFromBabel) {
        console.log('🚫 Just closed Babel Moment, skipping redirect check');
        sessionStorage.removeItem('justClosedBabel'); // Clear flag
        return;
      }

      const response = await fetch('/api/check-babel');
      if (response.ok) {
        const data = await response.json();
        if (data.hasUnseen) {
          // Check localStorage first (faster than cookie)
          const seenKey = `seen_babel_${data.epochId}`;
          const alreadySeen = localStorage.getItem(seenKey) === 'true';
          
          if (!alreadySeen) {
            console.log(`🔔 Redirecting to unseen Babel Moment: epoch ${data.epochId}`);
            // Redirect to Babel Moment page
            window.location.href = '/babel';
          } else {
            console.log(`✓ Babel Moment already seen in localStorage: epoch ${data.epochId}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check Babel Moment:', error);
    }
    */
  };

  const checkUser = async () => {
    const { user } = await getCurrentUser();
    setUser(user);
    if (user) {
      // Refresh remaining messages when user logs in
      fetchRemainingMessages();
    }
  };

  const fetchRemainingMessages = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/remaining', { headers });
      if (response.ok) {
        const data = await response.json();
        setRemainingMessages(data.remainingMessages);
      }
    } catch (error) {
      console.error('Failed to fetch remaining messages:', error);
    }
  };

  // Apply layer theme to body
  useEffect(() => {
    if (systemState) {
      const layerInfo = getLayerInfo(systemState.layer);
      if (layerInfo) {
        document.body.className = layerInfo.theme;
      }
    }
  }, [systemState]);

  const fetchSystemState = async () => {
    try {
      const response = await fetch('/api/state');
      if (response.ok) {
        const data = await response.json();
        
        // Check for epoch change before updating state
        const lastSeenEpoch = localStorage.getItem('lastSeenEpoch');
        console.log('🔍 Epoch check:', { lastSeenEpoch, currentEpoch: data.epoch });
        
        if (lastSeenEpoch && data.epoch && lastSeenEpoch !== data.epoch) {
          console.log(`🎉 Epoch changed detected: ${lastSeenEpoch} → ${data.epoch}`);
          
          // Check if user already saw this epoch transition (within 3 days)
          const seenKey = `seen_new_epoch_${data.epoch}`;
          const seenDate = localStorage.getItem(seenKey);
          const shouldShow = !seenDate || new Date(seenDate) < new Date();
          
          if (shouldShow) {
            console.log('🚀 Redirecting to new epoch celebration page');
            
            // Save epoch transition data
            const epochData = {
              oldEpoch: lastSeenEpoch,
              newEpoch: data.epoch,
              timestamp: new Date().toISOString(),
            };
            sessionStorage.setItem('newEpochData', JSON.stringify(epochData));
            
            // Update last seen epoch
            localStorage.setItem('lastSeenEpoch', data.epoch);
            
            // Redirect to celebration page
            window.location.href = '/new-epoch';
            return; // Stop execution
          } else {
            console.log('✓ User already saw this epoch transition, skipping celebration');
            // Update last seen epoch
            localStorage.setItem('lastSeenEpoch', data.epoch);
          }
        } else if (data.epoch && !lastSeenEpoch) {
          // First time visiting, just save current epoch
          console.log('📝 First visit, saving epoch:', data.epoch);
          localStorage.setItem('lastSeenEpoch', data.epoch);
        } else {
          console.log('✅ Same epoch, no change');
        }
        
        setSystemState(data);
      }
    } catch (error) {
      console.error('Failed to fetch system state:', error);
      setSystemMessages(['> Sistem durumu alınamadı. Supabase bağlantınızı kontrol edin.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (text: string) => {
    setIsSubmitting(true);
    setSystemMessages([]);

    // Play enter sound on submit
    playSound(audioManager.current?.enter || null);

    try {
      // Get auth token from Supabase
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token if available
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Rate limit exceeded
        if (response.status === 429 && error.requiresAuth) {
          setSystemMessages([
            `> ${error.error}`,
            `> Üye olarak günde 5 mesaj gönderebilirsiniz.`,
          ]);
          // Show auth modal after a delay
          setTimeout(() => setShowAuthModal(true), 2000);
        } else {
          setSystemMessages([`> Hata: ${error.error || 'Mesaj gönderilemedi'}`]);
        }
        return;
      }

      const data: MessageResponse = await response.json();
      
      // Update remaining messages if provided
      if (data.remainingMessages !== undefined) {
        setRemainingMessages(data.remainingMessages);
      }

      // Trigger cinematic animation
      setCinematicData({
        layer: data.layer,
        room: data.room,
        echoCount: data.exactCount,
        remainingMessages: data.remainingMessages ?? remainingMessages ?? 999999,
        totalMessages: 5,
      });
      setShowCinematic(true);

    } catch (error) {
      console.error('Error submitting message:', error);
      setSystemMessages(['> Sistem hatası. Lütfen tekrar deneyin.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="terminal-text text-purple-400 animate-pulse">
          &gt; Sistem başlatılıyor...
        </div>
      </div>
    );
  }

  // Show loading screen until intro check is complete
  if (!isIntroChecked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-purple-400 text-sm terminal-text animate-pulse">
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Test Panel - Development Only */}
      <TestPanel />

      {/* User info / Auth buttons - Fixed position */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1">
              <span className="text-purple-400 text-sm terminal-text bg-black/50 px-3 py-2 rounded-lg border border-purple-500/30">
                {user.email}
              </span>
              {remainingMessages !== null && (
                <span className="text-purple-300 text-xs terminal-text bg-black/50 px-3 py-1 rounded-lg border border-purple-500/30">
                  Kalan: {remainingMessages}/5 mesaj
                </span>
              )}
            </div>
            <button
              onClick={async () => {
                await signOut();
                setUser(null);
                window.location.reload();
              }}
              className="px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg
                       text-purple-300 text-sm hover:bg-purple-600/30 hover:border-purple-500
                       transition-all duration-200 terminal-text"
            >
              Çıkış
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg
                     text-purple-300 text-sm hover:bg-purple-600/30 hover:border-purple-500
                     transition-all duration-200 terminal-text"
          >
            Üye Ol / Giriş Yap
          </button>
        )}
      </div>

      {/* Header */}
      <header className="text-center mb-12 fade-in">
        <h1 className="text-4xl md:text-6xl font-bold text-purple-300 glow-text mb-4">
          Library of Echoes
        </h1>
        <p className="text-sm md:text-base text-purple-500/70 terminal-text">
          Görünmeyen zihin dinliyor. Bir satır yaz.
        </p>
        {!user && (
          <p className="text-xs text-purple-500/50 terminal-text mt-2">
            Anonim: 1 mesaj/gün • Üye: 5 mesaj/gün
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          <a
            href="/epochs"
            onClick={() => playSound(audioManager.current?.whoosh || null)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-700/50 rounded-lg
                     text-purple-300 text-sm hover:bg-purple-900/50 hover:border-purple-600
                     transition-all duration-200 terminal-text"
          >
            📚 Çağlar Arşivi
          </a>
          <a
            href="/message-map"
            onClick={() => playSound(audioManager.current?.whoosh || null)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-700/50 rounded-lg
                     text-purple-300 text-sm hover:bg-purple-900/50 hover:border-purple-600
                     transition-all duration-200 terminal-text"
          >
            🗺️ Mesaj Haritası
          </a>
        </div>
      </header>

      {/* Layer Visualizer */}
      {systemState && (
        <LayerVisualizer
          layer={systemState.layer}
          epochName={systemState.epoch}
          totalMessages={systemState.totalMessages}
        />
      )}

      {/* System Messages */}
      {systemMessages.length > 0 && (
        <div className="mb-8">
          <SystemMessage messages={systemMessages} />
        </div>
      )}

      {/* Input Box */}
      <InputBox onSubmit={handleSubmit} disabled={isSubmitting} />

      {/* Ambient Music Toggle - Bottom Right */}
      <button
        onClick={toggleAmbient}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-lg backdrop-blur-md
                 border-2 transition-all duration-300 shadow-lg
                 ${ambientPlaying 
                   ? 'bg-cyan-900/40 border-cyan-500/50 hover:border-cyan-400 shadow-cyan-500/30' 
                   : 'bg-purple-900/30 border-purple-500/50 hover:border-purple-400 shadow-purple-500/30'
                 }`}
        title={ambientPlaying ? 'Müziği Kapat' : 'Ambient Müzik Aç'}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{ambientPlaying ? '🔊' : '🔇'}</span>
          <span className={`text-xs terminal-text transition-colors ${
            ambientPlaying ? 'text-cyan-300' : 'text-purple-300'
          }`}>
            {ambientPlaying ? 'MÜZIK' : 'KAPALI'}
          </span>
        </div>
      </button>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-purple-500/40 terminal-text">
        <p>Tüm yazılar anonim olarak saklanır.</p>
        <p className="mt-1">Veriler sadece toplu istatistiklerde kullanılır.</p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          checkUser();
          setSystemMessages(['> Başarıyla giriş yaptınız! Artık günde 5 mesaj gönderebilirsiniz.']);
        }}
      />

      {/* Stats Panel - Floating bottom right */}
      <StatsPanel onExpand={() => playSound(audioManager.current?.panelOpen || null)} />

      {/* Message Cinematic Animation */}
      <MessageCinematic
        isActive={showCinematic}
        messageData={cinematicData}
        onComplete={() => {
          setShowCinematic(false);
          
          // Show text messages after animation
          const layerInfo = getLayerInfo(cinematicData?.layer || 1);
          const messages = [
            `> Yazınız Katman ${layerInfo?.roman} / Oda ${cinematicData?.room}'ye işlendi.`,
            `> Bu cümle bu çağda ${cinematicData?.echoCount} kez yankılandı.`,
          ];
          
          if (user && cinematicData?.remainingMessages !== undefined && cinematicData.remainingMessages >= 0) {
            messages.push(`> Kalan mesaj hakkınız: ${cinematicData.remainingMessages}/5`);
          }
          
          setSystemMessages(messages);
          
          // Refresh system state
          fetchSystemState();
          
          // Clear submitting state
          setIsSubmitting(false);
        }}
      />
    </div>
  );
}
