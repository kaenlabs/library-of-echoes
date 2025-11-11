'use client';

import { useEffect, useState } from 'react';
import { getLayerInfo } from '@/lib/layers';

interface LayerVisualizerProps {
  layer: number;
  epochName: string;
  totalMessages: number;
}

export default function LayerVisualizer({ layer, epochName, totalMessages }: LayerVisualizerProps) {
  const [mounted, setMounted] = useState(false);
  const layerInfo = getLayerInfo(layer);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !layerInfo) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 fade-in">
      {/* Epoch and Layer Info */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-purple-300 glow-text mb-2">
          {epochName}
        </h2>
        <div className="text-lg md:text-xl text-purple-400">
          Katman {layerInfo.roman} — {layerInfo.name}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-black/50 rounded-full overflow-hidden border border-purple-500/30">
        <div
          className="absolute h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500"
          style={{
            width: `${Math.min((totalMessages / layerInfo.max) * 100, 100)}%`,
          }}
        />
      </div>

      {/* Stats */}
      <div className="mt-4 flex justify-between text-sm text-purple-500/70 terminal-text">
        <span>{totalMessages.toLocaleString()} yazı</span>
        <span>
          {layerInfo.max === Infinity
            ? 'Sonsuz'
            : `${layerInfo.max.toLocaleString()} / Babil Anı`}
        </span>
      </div>

      {/* Layer Description */}
      <div className="mt-6 text-center text-sm text-purple-400/60 italic">
        {getLayerDescription(layer)}
      </div>
    </div>
  );
}

function getLayerDescription(layer: number): string {
  const descriptions: { [key: number]: string } = {
    1: 'Boşluğun başlangıcı. Sessizlik hüküm sürüyor.',
    2: 'İlk fısıltılar duyuluyor. Yankılar birikmeye başladı.',
    3: 'Gerçeklik titreşiyor. Glitch\'ler beliriyor.',
    4: 'Dalgalar yayılıyor. Sistem şekilleniyor.',
    5: 'Neon ışıkları parlamaya başladı. Bağlantılar güçleniyor.',
    6: 'Ambient titreşimler her yerde. Kelimeler ışıldıyor.',
    7: 'Kaos yükseliyor. Yazılar birbirine karışıyor.',
    8: 'Kritik eşik yaklaşıyor. Sistem patlama noktasında.',
    9: 'Babil Anı başlıyor. Çağ kapanmak üzere.',
  };
  return descriptions[layer] || '';
}
