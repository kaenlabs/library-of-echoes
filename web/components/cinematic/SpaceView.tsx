'use client';

import { useEffect, useRef, useState } from 'react';
import { CinematicPhase } from '@/hooks/useCinematic';

interface SpaceViewProps {
  phase: CinematicPhase;
  messageData: {
    layer: number;
    room: number;
  } | null;
}

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
}

export default function SpaceView({ phase, messageData }: SpaceViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [isZooming, setIsZooming] = useState(false);

  // Initialize stars
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000,
        size: Math.random() * 2,
        speed: 0.5 + Math.random() * 1.5,
      });
    }
    starsRef.current = stars;
  }, []);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      starsRef.current.forEach((star) => {
        // Move stars (parallax effect)
        if (isZooming) {
          star.z -= star.speed * 3; // Faster during zoom
        } else {
          star.z -= star.speed * 0.5;
        }

        // Reset star if too close
        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
        }

        // Project 3D to 2D
        const scale = 500 / star.z;
        const x2d = centerX + star.x * scale;
        const y2d = centerY + star.y * scale;
        const size = star.size * scale;

        // Draw star (with trail during zoom)
        if (isZooming && star.z < 500) {
          // Star trail
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - star.z / 500})`;
          ctx.lineWidth = size;
          ctx.beginPath();
          const prevScale = 500 / (star.z + star.speed * 3);
          const prevX = centerX + star.x * prevScale;
          const prevY = centerY + star.y * prevScale;
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x2d, y2d);
          ctx.stroke();
        } else {
          // Normal star
          ctx.fillStyle = `rgba(255, 255, 255, ${1 - star.z / 1000})`;
          ctx.beginPath();
          ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', updateSize);
    };
  }, [isZooming]);

  // Update zoom state based on phase
  useEffect(() => {
    setIsZooming(phase === 'travel');
  }, [phase]);

  const layers = [
    { name: 'LAYER I', color: '#8b5cf6', scale: 1.5, opacity: 0.8 },
    { name: 'LAYER II', color: '#3b82f6', scale: 1.2, opacity: 0.7 },
    { name: 'LAYER III', color: '#10b981', scale: 1.0, opacity: 0.6 },
  ];

  const targetLayer = messageData?.layer || 1;

  return (
    <div 
      className="absolute inset-0"
      style={{
        perspective: '1200px',
      }}
    >
      {/* Canvas for stars */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #1a0f2e 0%, #0a0a0a 100%)',
        }}
      />

      {/* 3D Layers */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
          transform: phase === 'travel' 
            ? `translateZ(${400 - targetLayer * 100}px) scale(${2.5 + targetLayer * 0.5})`
            : 'translateZ(0) scale(1)',
          transition: 'transform 3s cubic-bezier(0.22, 1, 0.36, 1)', // Smooth easing
        }}
      >
        {layers.map((layer, index) => {
          const layerNum = index + 1;
          const isTarget = layerNum === targetLayer;
          const shouldBlur = phase === 'travel' && !isTarget;

          return (
            <div
              key={layer.name}
              className="absolute rounded-full border-2 transition-all duration-1000"
              style={{
                width: `${300 * layer.scale}px`,
                height: `${300 * layer.scale}px`,
                borderColor: layer.color,
                backgroundColor: `${layer.color}10`,
                boxShadow: `0 0 60px ${layer.color}, inset 0 0 40px ${layer.color}30`,
                opacity: shouldBlur ? 0.2 : layer.opacity,
                filter: shouldBlur ? 'blur(8px)' : 'blur(0)',
                transform: `translateZ(${-index * 150}px) rotateX(${20 + index * 10}deg)`,
                animation: 'layerRotate 20s linear infinite',
                animationDelay: `${-index * 2}s`,
              }}
            >
              {/* Layer label */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-sm"
                style={{
                  color: layer.color,
                  textShadow: `0 0 20px ${layer.color}`,
                  opacity: phase === 'space' || isTarget ? 1 : 0,
                  transition: 'opacity 0.5s',
                }}
              >
                {layer.name}
              </div>

              {/* Inner rings */}
              <div
                className="absolute inset-8 rounded-full border"
                style={{
                  borderColor: `${layer.color}40`,
                  animation: 'spin 15s linear infinite reverse',
                }}
              />
              <div
                className="absolute inset-16 rounded-full border"
                style={{
                  borderColor: `${layer.color}30`,
                  animation: 'spin 10s linear infinite',
                }}
              />
            </div>
          );
        })}

        {/* Message light orb */}
        {phase !== 'closing' && (
          <div
            className="absolute w-12 h-12 rounded-full transition-all duration-1000"
            style={{
              background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 50%, transparent 100%)',
              boxShadow: '0 0 60px #fbbf24, 0 0 120px #f59e0b',
              animation: 'messagePulse 2s ease-in-out infinite',
              transform: phase === 'travel' ? 'scale(1.5)' : 'scale(1)',
              zIndex: 10,
            }}
          />
        )}
      </div>

      {/* Phase indicator text */}
      {phase === 'space' && (
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 font-mono text-center"
          style={{
            animation: 'fadeIn 0.8s ease-out 0.5s forwards',  // Daha yavaş ve geç
            opacity: 0,
            zIndex: 15,
          }}
        >
          <div className="bg-black/70 px-6 py-3 rounded-lg border border-cyan-400/50 backdrop-blur-sm"
               style={{
                 boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)',
               }}>
            <div className="text-cyan-400 text-sm tracking-widest">
              🌌 KATMAN SİSTEMİ
            </div>
            <div className="text-cyan-300 text-xs mt-1 opacity-70">
              Mesajınız uygun katmana yönlendiriliyor...
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes layerRotate {
          from { transform: translateZ(var(--z)) rotateX(var(--rx)) rotateY(0deg); }
          to { transform: translateZ(var(--z)) rotateX(var(--rx)) rotateY(360deg); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes messagePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
