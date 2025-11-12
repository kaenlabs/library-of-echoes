'use client';

interface StatsPanelsProps {
  messageData: {
    layer: number;
    room: number;
    echoCount: number;
    remainingMessages: number;
    totalMessages: number;
  };
}

export default function StatsPanels({ messageData }: StatsPanelsProps) {
  const panels = [
    {
      id: 1,
      title: '📍 KONUM',
      icon: '📍',
      content: (
        <>
          <div className="text-3xl font-bold text-yellow-400 mb-2" style={{ textShadow: '0 0 20px #fbbf24' }}>
            KATMAN {messageData.layer}
          </div>
          <div className="text-xl text-green-300">
            ODA {messageData.room}
          </div>
          <div className="text-xs text-green-400 mt-2 opacity-70">
            Mesajınız başarıyla yerleştirildi
          </div>
        </>
      ),
      delay: 0.5,  // 0 → 0.5s
    },
    {
      id: 2,
      title: '🔊 YANKILANMA',
      icon: '🔊',
      content: (
        <>
          <div className="text-sm text-green-300 mb-1">Bu çağda:</div>
          <div className="text-4xl font-bold text-yellow-400 mb-2" style={{ textShadow: '0 0 20px #fbbf24' }}>
            {messageData.echoCount}
          </div>
          <div className="text-xs text-green-400 opacity-70">
            kez yankılandı
          </div>
        </>
      ),
      delay: 1.2,  // 0.3 → 1.2s
    },
    {
      id: 3,
      title: '💬 MESAJ HAKKI',
      icon: '💬',
      content: (
        <>
          <div className="text-sm text-green-300 mb-1">Kalan hakınız:</div>
          <div className="text-4xl font-bold text-yellow-400 mb-2" style={{ textShadow: '0 0 20px #fbbf24' }}>
            {messageData.remainingMessages}
          </div>
          <div className="text-xs text-green-400 opacity-70">
            / {messageData.totalMessages} mesaj
          </div>
        </>
      ),
      delay: 1.9,  // 0.6 → 1.9s
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center gap-8 px-8" style={{ zIndex: 30 }}>
      {panels.map((panel) => (
        <div
          key={panel.id}
          className="relative w-72 opacity-0"
          style={{
            animation: `panelAppear 1s ease-out ${panel.delay}s forwards`,
          }}
        >
          {/* Glitch effect overlay */}
          <div
            className="absolute inset-0 bg-green-400/10 pointer-events-none"
            style={{
              animation: `glitch 0.3s ease-out ${panel.delay}s`,
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            }}
          />

          {/* Panel container */}
          <div
            className="relative bg-black/80 border-2 border-green-400/50 rounded-lg p-6 backdrop-blur-sm"
            style={{
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3), inset 0 0 30px rgba(16, 185, 129, 0.1)',
            }}
          >
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-400" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-green-400" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-green-400" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-green-400" />

            {/* Title */}
            <div
              className="font-mono text-sm text-green-400 mb-4 tracking-wider flex items-center gap-2 justify-center"
              style={{ textShadow: '0 0 10px #10b981' }}
            >
              <span className="text-lg">{panel.icon}</span>
              <span>{panel.title}</span>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center gap-2 font-mono">
              {panel.content}
            </div>

            {/* Scanline effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16, 185, 129, 0.1) 2px, rgba(16, 185, 129, 0.1) 4px)',
                animation: 'scanlines 4s linear infinite',
              }}
            />
          </div>
        </div>
      ))}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes panelAppear {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glitch {
          0% {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            transform: translateX(0);
          }
          20% {
            clip-path: polygon(0 20%, 100% 20%, 100% 80%, 0 80%);
            transform: translateX(-5px);
          }
          40% {
            clip-path: polygon(0 40%, 100% 40%, 100% 60%, 0 60%);
            transform: translateX(5px);
          }
          60% {
            clip-path: polygon(0 60%, 100% 60%, 100% 40%, 0 40%);
            transform: translateX(-3px);
          }
          80% {
            clip-path: polygon(0 80%, 100% 80%, 100% 20%, 0 20%);
            transform: translateX(3px);
          }
          100% {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            transform: translateX(0);
          }
        }

        @keyframes scanlines {
          from { transform: translateY(0); }
          to { transform: translateY(4px); }
        }

        @keyframes fadeInBounce {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          60% {
            opacity: 1;
            transform: translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
