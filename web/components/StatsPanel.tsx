'use client';

import { useState, useEffect } from 'react';

interface Stats {
  epoch: {
    name: string;
    age: number;
    isActive: boolean;
  };
  currentLayer: {
    index: number;
    name: string;
    roman: string;
    progress: number;
    messagesInLayer: number;
    activeRooms: number;
    totalRooms: number;
  };
  messages: {
    total: number;
    unique: number;
    echoes: number;
    echoRate: number;
  };
  progress: {
    current: number;
    nextLayer: number;
    babel: number;
    toNextLayer: number;
    toBabel: number;
  };
}

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="fixed bottom-6 right-6 z-30 bg-black/80 border border-purple-500/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="text-purple-400 text-sm terminal-text animate-pulse">
          Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-30 bg-black/90 border border-purple-500/50 rounded-lg backdrop-blur-md transition-all duration-300 ${
      isExpanded ? 'w-80' : 'w-64'
    }`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-purple-900/20 transition-colors rounded-t-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-purple-300 font-bold terminal-text text-sm">
                {stats.epoch.name}
              </div>
              <div className="text-purple-500 text-xs terminal-text">
                Katman {stats.currentLayer.roman} - {stats.currentLayer.name}
              </div>
            </div>
          </div>
          <span className="text-purple-400 text-xl">
            {isExpanded ? '▼' : '▲'}
          </span>
        </div>
      </button>

      {/* Stats Content */}
      <div className={`px-4 pb-4 space-y-4 ${isExpanded ? 'block' : 'hidden'}`}>
        {/* Main Stats */}
        <div className="text-center py-3 bg-purple-900/20 rounded-lg">
          <div className="text-5xl font-bold text-purple-200 terminal-text mb-1">
            {stats.messages.total}
          </div>
          <div className="text-purple-400 text-sm terminal-text">
            Toplam Mesaj
          </div>
        </div>

        {/* Layer Progress */}
        <div>
          <div className="flex justify-between text-sm text-purple-300 mb-2 terminal-text">
            <span>Sonraki Katman</span>
            <span className="font-bold">{stats.progress.toNextLayer} mesaj kaldı</span>
          </div>
          <div className="h-3 bg-purple-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 transition-all duration-500 animate-pulse"
              style={{ width: `${stats.currentLayer.progress}%` }}
            />
          </div>
        </div>

        {/* Simple Stats Grid */}
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-purple-900/10 rounded">
            <span className="text-purple-400 text-sm terminal-text">🔄 Tekrar Edilen</span>
            <span className="text-purple-200 font-bold terminal-text">{stats.messages.echoes}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-purple-900/10 rounded">
            <span className="text-purple-400 text-sm terminal-text">🚪 Aktif Oda</span>
            <span className="text-purple-200 font-bold terminal-text">{stats.currentLayer.activeRooms}/{stats.currentLayer.totalRooms}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-purple-900/10 rounded">
            <span className="text-purple-400 text-sm terminal-text">⏱️ Çağ Yaşı</span>
            <span className="text-purple-200 font-bold terminal-text">{stats.epoch.age === 0 ? 'Yeni' : `${stats.epoch.age} gün`}</span>
          </div>
        </div>

        {/* Babel Progress (hidden if too far) */}
        {stats.messages.total > 50 && (
          <div className="pt-3 border-t border-purple-500/30">
            <div className="text-xs text-purple-500 text-center terminal-text">
              🌌 Babil'e {stats.progress.toBabel.toLocaleString()} mesaj
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
