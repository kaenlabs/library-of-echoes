'use client';

import { useEffect, useState } from 'react';

interface PortalProps {
  isActive: boolean;
}

export default function Portal({ isActive }: PortalProps) {
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; delay: number }>>([]);

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      angle: (360 / 50) * i,
      delay: Math.random() * 0.3,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Portal Circle */}
      <div
        className={`relative ease-out ${
          isActive ? 'scale-[2] rotate-[1080deg]' : 'scale-0 rotate-0'
        }`}
        style={{
          width: '400px',
          height: '400px',
          transition: 'all 2s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bounce effect
          background: 'radial-gradient(circle, transparent 40%, #8b5cf6 60%, #3b82f6 100%)',
          borderRadius: '50%',
          boxShadow: '0 0 100px #8b5cf6, inset 0 0 100px #3b82f6',
          animation: isActive ? 'portalPulse 1s ease-out' : 'none',
        }}
      >
        {/* Inner glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />

        {/* Rotating rings */}
        <div
          className="absolute inset-4 rounded-full border-2 border-purple-400/30"
          style={{
            animation: 'spin 3s linear infinite',
          }}
        />
        <div
          className="absolute inset-8 rounded-full border-2 border-blue-400/30"
          style={{
            animation: 'spin 2s linear infinite reverse',
          }}
        />

        {/* Lightning effect (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{
            filter: 'drop-shadow(0 0 8px #8b5cf6)',
          }}
        >
          <defs>
            <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${50 + 45 * Math.cos((angle * Math.PI) / 180)}%`}
              y2={`${50 + 45 * Math.sin((angle * Math.PI) / 180)}%`}
              stroke="url(#lightning-gradient)"
              strokeWidth="2"
              opacity="0"
              style={{
                animation: `lightning 0.5s ease-out ${i * 0.1}s`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Particles burst */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: '50%',
            top: '50%',
            animation: isActive ? `particleBurst 0.8s ease-out ${particle.delay}s` : 'none',
            transform: `rotate(${particle.angle}deg) translateX(0)`,
          }}
        />
      ))}

      {/* Portal opening text */}
      {isActive && (
        <div
          className="absolute top-32 left-1/2 -translate-x-1/2 font-mono text-center"
          style={{
            animation: 'fadeIn 1s ease-out 0.3s forwards',  // Daha yavaş fade
            opacity: 0,
            zIndex: 20,
          }}
        >
          <div className="bg-black/80 px-8 py-4 rounded-lg border-2 border-purple-400/50 backdrop-blur-md"
               style={{
                 boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
               }}>
            <div className="text-purple-400 text-lg mb-2 tracking-widest font-bold">
              ⚡ PORTAL AÇILIYOR
            </div>
            <div className="text-purple-300 text-xs opacity-70">
              Yankılar Kütüphanesi'ne bağlanılıyor...
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

        @keyframes portalPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes lightning {
          0% { opacity: 0; }
          10% { opacity: 1; }
          20% { opacity: 0; }
          30% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes particleBurst {
          0% {
            transform: rotate(${0}deg) translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotate(${0}deg) translateX(200px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
