'use client';

import { useEffect, useRef } from 'react';

interface RoomHologramProps {
  isActive: boolean;
}

export default function RoomHologram({ isActive }: RoomHologramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const rotationRef = useRef(0);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const cubeSize = 120;

    // Wireframe cube vertices (3D)
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // Back face
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],     // Front face
    ];

    // Cube edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Back face
      [4, 5], [5, 6], [6, 7], [7, 4], // Front face
      [0, 4], [1, 5], [2, 6], [3, 7], // Connecting edges
    ];

    // Project 3D to 2D
    const project = (x: number, y: number, z: number, rotation: number) => {
      // Rotate around Y axis
      const cosY = Math.cos(rotation);
      const sinY = Math.sin(rotation);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate around X axis
      const angleX = rotation * 0.7;
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective projection
      const scale = 300 / (300 + z2);
      return {
        x: centerX + x1 * cubeSize * scale,
        y: centerY + y1 * cubeSize * scale,
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isActive) {
        rotationRef.current += 0.02;

        // Draw wireframe cube
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#10b981';

        edges.forEach(([start, end]) => {
          const v1 = vertices[start];
          const v2 = vertices[end];
          const p1 = project(v1[0], v1[1], v1[2], rotationRef.current);
          const p2 = project(v2[0], v2[1], v2[2], rotationRef.current);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });

        // Draw vertices
        vertices.forEach((v) => {
          const p = project(v[0], v[1], v[2], rotationRef.current);
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        // Particle explosion effect (triggered once at start)
        if (rotationRef.current < 0.1 && particlesRef.current.length === 0) {
          // Generate explosion particles
          for (let i = 0; i < 100; i++) {
            const angle = (Math.PI * 2 * i) / 100;
            const speed = 2 + Math.random() * 3;
            particlesRef.current.push({
              x: centerX,
              y: centerY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
            });
          }
        }

        // Update and draw particles
        particlesRef.current = particlesRef.current.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.015;
          p.vx *= 0.98; // Slow down
          p.vy *= 0.98;

          if (p.life > 0) {
            ctx.fillStyle = `rgba(251, 191, 36, ${p.life})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fbbf24';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
            return true;
          }
          return false;
        });

        // Ripple effect
        if (rotationRef.current < 1) {
          const rippleRadius = rotationRef.current * 200;
          ctx.strokeStyle = `rgba(16, 185, 129, ${1 - rotationRef.current})`;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#10b981';
          ctx.beginPath();
          ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(centerX, centerY, rippleRadius * 0.7, 0, Math.PI * 2);
          ctx.stroke();
        }
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

  // Reset on inactive
  useEffect(() => {
    if (!isActive) {
      rotationRef.current = 0;
      particlesRef.current = [];
    }
  }, [isActive]);

  return (
    <>
      {/* Canvas for hologram */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 20 }}
      />

      {/* Scanlines overlay */}
      {isActive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16, 185, 129, 0.03) 2px, rgba(16, 185, 129, 0.03) 4px)',
            animation: 'scanlines 8s linear infinite',
            zIndex: 21,
          }}
        />
      )}

      {/* Room activation text */}
      {isActive && (
        <div
          className="absolute top-32 left-1/2 -translate-x-1/2 font-mono text-center"
          style={{
            animation: 'fadeIn 0.8s ease-out 0.5s forwards',  // Daha yavaş
            opacity: 0,
            zIndex: 22,
          }}
        >
          <div className="bg-black/80 px-8 py-4 rounded-lg border-2 border-green-400/50 backdrop-blur-md"
               style={{
                 boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
               }}>
            <div className="text-green-400 text-sm mb-2 tracking-widest">
              ✓ ODA HOLOGRAMI AKTİF
            </div>
            <div className="text-green-300 text-xs opacity-70">
              Mesajınız odaya yerleştiriliyor...
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scanlines {
          from { transform: translateY(0); }
          to { transform: translateY(4px); }
        }
      `}</style>
    </>
  );
}
