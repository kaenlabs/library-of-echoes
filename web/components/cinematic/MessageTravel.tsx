'use client';

import { useEffect, useRef } from 'react';

interface MessageTravelProps {
  isActive: boolean;
  targetLayer: number;
  targetRoom: number;
}

export default function MessageTravel({ isActive, targetLayer, targetRoom }: MessageTravelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const progressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Trail path points
    const startX = centerX;
    const startY = centerY;
    const controlX = centerX + 200;
    const controlY = centerY - 300;
    const endX = centerX + 100;
    const endY = centerY - 150;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isActive) {
        progressRef.current = Math.min(progressRef.current + 0.01, 1); // Yavaşlatıldı
      }

      const t = progressRef.current;

      // Draw trail (quadratic bezier curve)
      if (t > 0) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fbbf24';
        
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, 'rgba(251, 191, 36, 0.2)');
        gradient.addColorStop(t, 'rgba(251, 191, 36, 1)');
        gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.strokeStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // Draw up to current progress
        for (let i = 0; i <= t; i += 0.01) {
          const x = (1 - i) * (1 - i) * startX + 2 * (1 - i) * i * controlX + i * i * endX;
          const y = (1 - i) * (1 - i) * startY + 2 * (1 - i) * i * controlY + i * i * endY;
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw message orb at current position
        const currentX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
        const currentY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

        // Glow effect
        const glowGradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 30);
        glowGradient.addColorStop(0, 'rgba(251, 191, 36, 1)');
        glowGradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.6)');
        glowGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 30, 0, Math.PI * 2);
        ctx.fill();

        // Core orb
        ctx.fillStyle = '#fbbf24';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#fbbf24';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  // Reset progress when not active
  useEffect(() => {
    if (!isActive) {
      progressRef.current = 0;
    }
  }, [isActive]);

  return (
    <>
      {/* Canvas for trail */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 15 }}
      />

      {/* Coordinate UI - Daha Büyük ve Belirgin */}
      {isActive && (
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 font-mono opacity-0 animate-fadeIn"
          style={{
            animationDelay: '0.5s',  // 0.2s → 0.5s (gecikmeli başla)
            animationFillMode: 'forwards',
          }}
        >
          <div className="flex flex-col items-center gap-2 bg-black/80 px-10 py-6 rounded-lg border-2 border-green-400 backdrop-blur-md"
               style={{
                 boxShadow: '0 0 40px rgba(16, 185, 129, 0.5), inset 0 0 20px rgba(16, 185, 129, 0.1)',
               }}>
            <div className="text-green-300 text-sm tracking-widest mb-2">
              📡 MESAJ TRANSFERİ
            </div>
            <div className="flex items-center gap-4 text-2xl">
              <span className="text-yellow-400 font-bold" style={{ textShadow: '0 0 20px #fbbf24' }}>
                KATMAN {targetLayer}
              </span>
              <span className="text-green-400 animate-pulse text-3xl">→</span>
              <span className="text-yellow-400 font-bold" style={{ textShadow: '0 0 20px #fbbf24' }}>
                ODA {targetRoom}
              </span>
            </div>
            <div className="text-green-300 text-xs mt-2 tracking-wide">
              Transfer devam ediyor...
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
