'use client';

import { useEffect, useRef, useState } from 'react';
import { useCinematic } from '@/hooks/useCinematic';
import { CinematicAudioManager } from '@/lib/cinematicAudio';
import Portal from '@/components/cinematic/Portal';
import SpaceView from '@/components/cinematic/SpaceView';
import MessageTravel from '@/components/cinematic/MessageTravel';
import RoomHologram from '@/components/cinematic/RoomHologram';
import StatsPanels from '@/components/cinematic/StatsPanels';

interface MessageCinematicProps {
  isActive: boolean;
  messageData: {
    layer: number;
    room: number;
    echoCount: number;
    remainingMessages: number;
    totalMessages: number;
  } | null;
  onComplete: () => void;
}

export default function MessageCinematic({ isActive, messageData, onComplete }: MessageCinematicProps) {
  const { phase, isPlaying, canProgress, start, skip, nextPhase } = useCinematic({ onComplete });
  const audioManagerRef = useRef<CinematicAudioManager | null>(null);
  const hasStarted = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayPhase, setDisplayPhase] = useState<typeof phase>(phase);

  // Initialize audio manager and load sounds
  useEffect(() => {
    if (!audioManagerRef.current) {
      audioManagerRef.current = new CinematicAudioManager();
      // Load sounds immediately
      audioManagerRef.current.loadSounds().then(() => {
        console.log('🎵 Cinematic sounds loaded');
      }).catch(err => {
        console.warn('⚠️ Could not load cinematic sounds:', err);
      });
    }
  }, []);

  // Start cinematic when active
  useEffect(() => {
    if (isActive && messageData && !hasStarted.current) {
      hasStarted.current = true;
      audioManagerRef.current?.startCinematic();
      start(messageData);
    }
    if (!isActive) {
      hasStarted.current = false;
    }
  }, [isActive, messageData, start]);

  // Handle phase transitions with fade animation
  useEffect(() => {
    if (phase === displayPhase) return;
    
    // Start fade out
    setIsTransitioning(true);
    
    // After fade out, change phase and fade in
    setTimeout(() => {
      setDisplayPhase(phase);
      setIsTransitioning(false);
    }, 400); // 400ms fade duration
  }, [phase, displayPhase]);

  // Play sounds based on phase
  useEffect(() => {
    const audio = audioManagerRef.current;
    if (!audio) return;

    switch (phase) {
      case 'portal':
        audio.playPortalOpen();
        break;
      case 'space':
        audio.playSpaceAmbient();
        break;
      case 'travel':
        audio.playSpaceTravel();
        break;
      case 'room':
        audio.playImpact();
        setTimeout(() => audio.playHologramActivate(), 200);
        break;
      case 'stats':
        audio.playUiBeep();
        break;
      case 'closing':
        audio.playPortalClose();
        break;
      case 'idle':
        audio.endCinematic();
        break;
    }
  }, [phase]);

  if (!isPlaying) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        // Stats fazında tıklama ile kapanabilir
        if (phase === 'stats') {
          skip();
        }
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500"
        style={{
          opacity: phase === 'closing' ? 0 : 1,
        }}
      />

      {/* Close/Skip Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          skip();
        }}
        className="absolute top-8 right-8 z-50 px-6 py-3 rounded-lg font-mono bg-purple-900/50 border-2 border-purple-400/50 backdrop-blur-md text-purple-300 hover:bg-purple-800/60 hover:border-purple-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
        style={{
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">✕</span>
          <span className="text-sm">ATLA</span>
          <span className="text-xs opacity-60">(ESC)</span>
        </div>
      </button>

      {/* Continue/Next Phase Prompt - Üst sağ, liquid glass style */}
      {canProgress && phase !== 'stats' && (
        <div
          className="absolute top-24 right-8 font-mono text-center pointer-events-none"
          style={{
            animation: 'fadeInRight 0.6s ease-out forwards',
            opacity: 0,
            zIndex: 50,
          }}
        >
          <div 
            className="relative px-6 py-3 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Glass shine effect */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
              }}
            />
            
            <div className="relative flex items-center gap-3">
              <div className="text-green-400 text-lg animate-pulse">⏎</div>
              <div className="text-green-300 text-sm font-medium">ENTER</div>
            </div>
            <div className="text-green-400/60 text-[10px] mt-1 tracking-wide">
              Devam et
            </div>
          </div>
        </div>
      )}

      {/* Animation Layers - With fade transition */}
      <div 
        className="relative w-full h-full transition-opacity duration-400"
        style={{
          opacity: isTransitioning ? 0 : 1,
        }}
      >
        {/* Phase 1: Portal */}
        {(displayPhase === 'portal' || displayPhase === 'space') && (
          <Portal isActive={displayPhase === 'portal'} />
        )}

        {/* Phase 2: Space View */}
        {(displayPhase === 'space' || displayPhase === 'travel' || displayPhase === 'room' || displayPhase === 'stats') && (
          <SpaceView phase={displayPhase} messageData={messageData} />
        )}

        {/* Phase 3: Message Travel */}
        {(displayPhase === 'travel' || displayPhase === 'room') && (
          <MessageTravel isActive={displayPhase === 'travel'} targetLayer={messageData?.layer || 1} targetRoom={messageData?.room || 0} />
        )}

        {/* Phase 4: Room Hologram */}
        {(displayPhase === 'room' || displayPhase === 'stats') && (
          <RoomHologram isActive={displayPhase === 'room'} />
        )}

        {/* Phase 5: Stats Panels */}
        {displayPhase === 'stats' && messageData && (
          <>
            <StatsPanels messageData={messageData} />
            
            {/* Continue hint - Stats fazında (sona gelindi) - Liquid glass */}
            <div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 font-mono text-center"
              style={{
                animation: 'fadeInBounce 1s ease-out 1.5s forwards',
                opacity: 0,
                zIndex: 40,
              }}
            >
              <div 
                className="relative px-12 py-6 rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105"
                onClick={skip}
                style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  backdropFilter: 'blur(25px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(25px) saturate(200%)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  boxShadow: '0 12px 48px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                }}
              >
                {/* Glass shine */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)',
                  }}
                />
                
                <div className="relative">
                  <div className="text-purple-300 text-2xl mb-2 tracking-wider animate-pulse font-bold">
                    ⏎ ENTER / TIKLA
                  </div>
                  <div className="text-purple-400/70 text-sm">
                    Devam etmek için
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Global CSS for animations */}
      <style jsx>{`
        @keyframes fadeInBounce {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(30px);
          }
          60% {
            opacity: 1;
            transform: translateX(-50%) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes fadeInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
