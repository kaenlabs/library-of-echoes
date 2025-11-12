'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RoomData {
  roomId: number;
  messageCount: number;
  layer: number;
  layerName: string;
  firstMessage: string;
  lastMessage: string;
}

interface EpochMapData {
  epochId: number;
  epochName: string;
  isActive: boolean;
  totalMessages: number;
  totalRooms: number;
  createdAt: string;
  closedAt: string | null;
  rooms: RoomData[];
}

export default function MessageMapPage() {
  const [epochs, setEpochs] = useState<EpochMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEpochs, setExpandedEpochs] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchMessageMap();
  }, []);

  const fetchMessageMap = async () => {
    try {
      const response = await fetch('/api/message-map');
      if (response.ok) {
        const data = await response.json();
        setEpochs(data.epochs);
        // Auto-expand active epoch
        const activeEpoch = data.epochs.find((e: EpochMapData) => e.isActive);
        if (activeEpoch) {
          setExpandedEpochs({ [activeEpoch.epochId]: true });
        }
      }
    } catch (error) {
      console.error('Failed to fetch message map:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEpoch = (epochId: number) => {
    setExpandedEpochs(prev => ({
      ...prev,
      [epochId]: !prev[epochId]
    }));
  };

  const getLayerColor = (layer: number) => {
    const colors = [
      'rgb(147, 51, 234)',  // purple-600
      'rgb(168, 85, 247)',  // purple-500
      'rgb(192, 132, 252)', // purple-400
      'rgb(216, 180, 254)', // purple-300
      'rgb(233, 213, 255)', // purple-200
      'rgb(250, 245, 255)', // purple-50
    ];
    return colors[layer - 1] || colors[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 terminal-text animate-pulse">
          Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-purple-200 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link 
            href="/"
            className="inline-block mb-6 text-purple-400 hover:text-purple-300 terminal-text text-sm transition-colors"
          >
            ← Ana Sayfaya Dön
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-purple-100 terminal-text mb-3">
            🗺️ Mesaj Haritası
          </h1>
          <p className="text-purple-400 terminal-text text-base sm:text-lg">
            Tüm çağların mesajları, odaları ve katmanları
          </p>
          <p className="text-purple-500 terminal-text text-xs sm:text-sm mt-2">
            Her mesaj sonsuza kadar arşivde korunur
          </p>
        </div>

        {/* Epochs Timeline */}
        <div className="space-y-6">
          {epochs.map((epoch, index) => (
            <div
              key={epoch.epochId}
              className={`
                relative rounded-lg border-2 transition-all duration-300
                ${epoch.isActive 
                  ? 'bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-500/20' 
                  : 'bg-purple-900/10 border-purple-800/50 hover:border-purple-700'
                }
              `}
            >
              {/* Epoch Header - Clickable */}
              <button
                onClick={() => toggleEpoch(epoch.epochId)}
                className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-purple-900/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-purple-900/50 rounded-full flex items-center justify-center border-2 border-purple-500/50">
                    <span className="text-xl sm:text-2xl font-bold text-purple-300 terminal-text">
                      #{epoch.epochId}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-purple-100 terminal-text mb-1">
                      {epoch.epochName}
                      {epoch.isActive && (
                        <span className="ml-3 px-2 py-1 bg-purple-500 text-white text-xs terminal-text rounded-full animate-pulse">
                          🔥 Aktif
                        </span>
                      )}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-purple-400 terminal-text">
                      <span>📊 {epoch.totalMessages.toLocaleString()} mesaj</span>
                      <span>🏠 {epoch.totalRooms} oda</span>
                      <span>📅 {new Date(epoch.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
                <span className="text-purple-400 text-2xl">
                  {expandedEpochs[epoch.epochId] ? '▼' : '▶'}
                </span>
              </button>

              {/* Epoch Details - Collapsible */}
              {expandedEpochs[epoch.epochId] && (
                <div className="px-4 sm:px-6 pb-6 animate-fadeIn">
                  {/* Room Grid */}
                  {epoch.rooms.length > 0 ? (
                    <div className="space-y-4">
                      {/* Legend */}
                      <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                        <div className="text-xs text-purple-300 terminal-text mb-2">
                          🎨 Katman Renkleri:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5, 6].map(layer => (
                            <div key={layer} className="flex items-center gap-1">
                              <div 
                                className="w-4 h-4 rounded border border-purple-700"
                                style={{ backgroundColor: getLayerColor(layer) }}
                              />
                              <span className="text-xs text-purple-400 terminal-text">
                                Kat {layer}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Room Blocks */}
                      <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-1">
                        {epoch.rooms.map((room) => (
                          <div
                            key={room.roomId}
                            className="relative group"
                            title={`Oda ${room.roomId}: ${room.messageCount} mesaj (${room.layerName})`}
                          >
                            <div
                              className="w-full aspect-square rounded border border-purple-900/50 hover:border-purple-400 transition-all cursor-pointer"
                              style={{
                                backgroundColor: getLayerColor(room.layer),
                                opacity: 0.3 + (room.messageCount / epoch.totalMessages) * 0.7,
                              }}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                              <div className="bg-black border-2 border-purple-500 rounded-lg p-3 text-xs terminal-text whitespace-nowrap shadow-lg">
                                <div className="font-bold text-purple-100 mb-1">
                                  🏠 Oda {room.roomId}
                                </div>
                                <div className="text-purple-300">
                                  📊 {room.messageCount} mesaj
                                </div>
                                <div className="text-purple-400">
                                  🎨 {room.layerName}
                                </div>
                                <div className="text-purple-500 text-xs mt-1">
                                  {new Date(room.firstMessage).toLocaleDateString('tr-TR')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Stats Summary */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg text-center">
                          <div className="text-xl sm:text-2xl font-bold text-purple-100 terminal-text">
                            {epoch.totalMessages.toLocaleString()}
                          </div>
                          <div className="text-xs text-purple-400 terminal-text">Toplam Mesaj</div>
                        </div>
                        <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg text-center">
                          <div className="text-xl sm:text-2xl font-bold text-purple-100 terminal-text">
                            {epoch.totalRooms}
                          </div>
                          <div className="text-xs text-purple-400 terminal-text">Toplam Oda</div>
                        </div>
                        <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg text-center">
                          <div className="text-xl sm:text-2xl font-bold text-purple-100 terminal-text">
                            {Math.max(...epoch.rooms.map(r => r.layer))}
                          </div>
                          <div className="text-xs text-purple-400 terminal-text">Maksimum Katman</div>
                        </div>
                        <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg text-center">
                          <div className="text-xl sm:text-2xl font-bold text-purple-100 terminal-text">
                            {Math.round(epoch.totalMessages / epoch.totalRooms)}
                          </div>
                          <div className="text-xs text-purple-400 terminal-text">Mesaj/Oda Ort.</div>
                        </div>
                      </div>
                    </div>
                  ) : epoch.totalMessages > 0 ? (
                    <div className="text-center py-8">
                      <div className="text-purple-300 terminal-text mb-2">
                        📊 {epoch.totalMessages} mesaj var ama henüz oda oluşturulmamış
                      </div>
                      <div className="text-purple-500 terminal-text text-sm">
                        Mesajlar oda eşiğine (echo count) ulaşınca odalar görünür hale gelecek
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-purple-500 terminal-text">
                      Bu çağda henüz mesaj yok
                    </div>
                  )}
                </div>
              )}

              {/* Timeline Connector */}
              {index < epochs.length - 1 && (
                <div className="absolute left-6 sm:left-8 -bottom-6 w-0.5 h-6 bg-purple-700/50" />
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {epochs.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-purple-400 terminal-text text-lg">
              Henüz mesaj yok
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 p-4 sm:p-6 bg-purple-900/20 border border-purple-700/30 rounded-lg">
          <h3 className="text-lg sm:text-xl font-bold text-purple-300 terminal-text mb-3">
            💡 Harita Nasıl Çalışır?
          </h3>
          <ul className="text-sm text-purple-400 terminal-text space-y-2 leading-relaxed">
            <li>• Her <strong>kare</strong>, bir <strong>odayı</strong> temsil eder</li>
            <li>• <strong>Renk</strong>, odanın hangi <strong>katmanda</strong> oluştuğunu gösterir</li>
            <li>• <strong>Opaklık</strong> (parlaklık), odadaki <strong>mesaj yoğunluğunu</strong> gösterir</li>
            <li>• Kare üzerine gelince <strong>detayları</strong> görebilirsiniz</li>
            <li>• Tüm mesajlar <strong>kalıcıdır</strong> - hiçbir şey silinmez</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
