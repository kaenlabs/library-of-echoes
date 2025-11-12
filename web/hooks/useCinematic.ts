import { useState, useEffect, useCallback, useRef } from 'react';

export type CinematicPhase = 'idle' | 'portal' | 'space' | 'travel' | 'room' | 'stats' | 'closing';

interface MessageData {
  layer: number;
  room: number;
  echoCount: number;
  remainingMessages: number;
  totalMessages: number;
}

interface UseCinematicProps {
  onComplete?: () => void;
  duration?: number;
}

export function useCinematic({ onComplete, duration = 999999 }: UseCinematicProps = {}) {
  const [phase, setPhase] = useState<CinematicPhase>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [messageData, setMessageData] = useState<MessageData | null>(null);
  const [canProgress, setCanProgress] = useState(false); // ENTER için hazır mı
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Minimum wait time - Her faz en az bu kadar bekler
  const minPhaseTime = {
    portal: 2500,     // Portal animasyonu en az 2.5s
    space: 2500,      // Space görünümü en az 2.5s
    travel: 3000,     // Yolculuk en az 3s
    room: 3000,       // Oda en az 3s
    stats: 0,         // Stats'ta minimum yok
  };

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
  }, []);

  const nextPhase = useCallback(() => {
    setCanProgress(false); // ENTER'i tekrar devre dışı bırak
    
    // Bir sonraki faza geç
    if (phase === 'portal') {
      setPhase('space');
      // Space fazı için minimum süre sonra ENTER aktif
      setTimeout(() => setCanProgress(true), minPhaseTime.space);
    } else if (phase === 'space') {
      setPhase('travel');
      setTimeout(() => setCanProgress(true), minPhaseTime.travel);
    } else if (phase === 'travel') {
      setPhase('room');
      setTimeout(() => setCanProgress(true), minPhaseTime.room);
    } else if (phase === 'room') {
      setPhase('stats');
      setCanProgress(true); // Stats'ta hemen aktif
    }
  }, [phase, minPhaseTime]);

  const start = useCallback((data: MessageData) => {
    setMessageData(data);
    setIsPlaying(true);
    setPhase('portal');
    
    // Portal başlangıcı için minimum süre
    const initialTimeout = setTimeout(() => {
      setCanProgress(true);
    }, minPhaseTime.portal);
    
    timeoutRefs.current = [initialTimeout];
  }, [minPhaseTime]);

  const skip = useCallback(() => {
    clearAllTimeouts();
    setPhase('idle');
    setIsPlaying(false);
    onComplete?.();
  }, [clearAllTimeouts, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  // Keyboard handlers (ESC + ENTER)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      if (e.key === 'Escape') {
        skip();
      } else if (e.key === 'Enter' && canProgress) {
        if (phase === 'stats') {
          skip(); // Stats'ta ENTER = kapat
        } else {
          nextPhase(); // Diğer fazlarda ENTER = sonraki faz
        }
      }
    };

    if (isPlaying) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isPlaying, canProgress, phase, skip, nextPhase]);

  return {
    phase,
    isPlaying,
    messageData,
    canProgress,
    start,
    skip,
    nextPhase,
  };
}
