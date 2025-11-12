'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LayerTransition {
  layerIndex: number;
  layerName: string;
  reachedAt: string;
  messageCount: number;
  uniqueMessages: number;
  echoCount: number;
  topWords: { word: string; count: number }[];
  emotions: { emotion: string; percentage: number; color: string }[];
  aiSummary?: string;
  comparisons?: {
    comparedWith: string;
    messageGrowth: number;
    uniqueGrowth: number;
    echoGrowth: number;
    newTopWords: string[];
  }[];
}

interface EpochData {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  closedAt: string | null;
  stats: {
    totalMessages: number;
    uniqueMessages: number;
    finalLayer: number;
    layerName: string;
    duration: number; // days
  } | null;
  layerTransitions: LayerTransition[];
}

export default function EpochsPage() {
  const [epochs, setEpochs] = useState<EpochData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLayers, setExpandedLayers] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchEpochs();
  }, []);

  const fetchEpochs = async () => {
    try {
      const response = await fetch('/api/epochs');
      if (response.ok) {
        const data = await response.json();
        setEpochs(data.epochs);
      }
    } catch (error) {
      console.error('Failed to fetch epochs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLayerExpand = (epochId: number, layerIndex: number) => {
    const key = `${epochId}-${layerIndex}`;
    setExpandedLayers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
    <div className="min-h-screen bg-black text-purple-200 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Link 
              href="/"
              className="inline-block text-purple-400 hover:text-purple-300 terminal-text text-sm transition-colors"
            >
              ← Ana Sayfa
            </Link>
            <span className="text-purple-700">•</span>
            <Link 
              href="/message-map"
              className="inline-block text-purple-400 hover:text-purple-300 terminal-text text-sm transition-colors"
            >
              🗺️ Mesaj Haritası
            </Link>
          </div>
          <h1 className="text-5xl font-bold text-purple-100 terminal-text mb-3">
            📚 Çağlar Arşivi
          </h1>
          <p className="text-purple-400 terminal-text text-lg">
            Library of Echoes'un Geçmişi
          </p>
        </div>

        {/* Epochs Timeline */}
        <div className="space-y-6">
          {epochs.map((epoch, index) => (
            <div
              key={epoch.id}
              className={`
                relative p-6 rounded-lg border-2 transition-all duration-300
                ${epoch.isActive 
                  ? 'bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-500/20' 
                  : 'bg-purple-900/10 border-purple-800/50 hover:border-purple-700'
                }
              `}
            >
              {/* Active Badge */}
              {epoch.isActive && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-purple-500 text-white text-xs terminal-text rounded-full animate-pulse">
                    🔥 Aktif
                  </span>
                </div>
              )}

              {/* Epoch Number */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center border-2 border-purple-500/50">
                  <span className="text-2xl font-bold text-purple-300 terminal-text">
                    #{epoch.id}
                  </span>
                </div>

                <div className="flex-1">
                  {/* Epoch Name */}
                  <h2 className="text-3xl font-bold text-purple-100 terminal-text mb-2">
                    {epoch.name}
                  </h2>

                  {/* Dates */}
                  <div className="text-sm text-purple-400 terminal-text mb-4">
                    <span>📅 Başlangıç: {new Date(epoch.createdAt).toLocaleDateString('tr-TR')}</span>
                    {epoch.closedAt && (
                      <>
                        <span className="mx-2">→</span>
                        <span>🏁 Bitiş: {new Date(epoch.closedAt).toLocaleDateString('tr-TR')}</span>
                      </>
                    )}
                  </div>

                  {/* Stats Grid */}
                  {epoch.stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/30">
                        <div className="text-xs text-purple-400 terminal-text mb-1">
                          Toplam Mesaj
                        </div>
                        <div className="text-2xl font-bold text-purple-200 terminal-text">
                          {epoch.stats.totalMessages.toLocaleString()}
                        </div>
                      </div>

                      <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/30">
                        <div className="text-xs text-purple-400 terminal-text mb-1">
                          Eşsiz Mesaj
                        </div>
                        <div className="text-2xl font-bold text-purple-200 terminal-text">
                          {epoch.stats.uniqueMessages.toLocaleString()}
                        </div>
                      </div>

                      <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/30">
                        <div className="text-xs text-purple-400 terminal-text mb-1">
                          Son Katman
                        </div>
                        <div className="text-2xl font-bold text-purple-200 terminal-text">
                          {epoch.stats.layerName}
                        </div>
                      </div>

                      <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/30">
                        <div className="text-xs text-purple-400 terminal-text mb-1">
                          Süre
                        </div>
                        <div className="text-2xl font-bold text-purple-200 terminal-text">
                          {epoch.stats.duration} gün
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Epoch Message */}
                  {epoch.isActive && !epoch.stats && (
                    <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <p className="text-purple-300 terminal-text text-sm">
                        ⏳ Bu çağ hala devam ediyor. İstatistikler Babil Anı'nda tamamlanacak.
                      </p>
                    </div>
                  )}

                  {/* Babel Moment Badge & View Manifesto Button */}
                  {epoch.closedAt && epoch.stats && (
                    <div className="mt-4 flex items-center gap-4">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm terminal-text rounded-full">
                        🌌 Babil Anı Tamamlandı
                      </span>
                      <button
                        onClick={() => {
                          // Set epoch data and redirect to new-epoch page
                          const epochData = {
                            oldEpoch: epoch.name,
                            newEpoch: epoch.name, // Same epoch for viewing
                            timestamp: epoch.closedAt,
                            viewMode: true, // Special flag to indicate we're just viewing
                          };
                          sessionStorage.setItem('newEpochData', JSON.stringify(epochData));
                          sessionStorage.setItem('viewingEpochId', epoch.id.toString());
                          window.location.href = '/new-epoch';
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/50 hover:bg-purple-800 border-2 border-purple-600 text-purple-200 text-sm terminal-text rounded-lg transition-all"
                      >
                        📜 Manifestoyu Görüntüle
                      </button>
                    </div>
                  )}

                  {/* Layer Transitions Section */}
                  {epoch.layerTransitions && epoch.layerTransitions.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-purple-700/30">
                      <h3 className="text-xl font-bold text-purple-200 terminal-text mb-4 flex items-center gap-2">
                        🎨 Katman Geçişleri ({epoch.layerTransitions.length})
                      </h3>
                      <div className="space-y-3">
                        {epoch.layerTransitions.map((layer, layerIdx) => {
                          const key = `${epoch.id}-${layer.layerIndex}`;
                          const isExpanded = expandedLayers[key];
                          
                          return (
                            <div key={layerIdx} className="bg-purple-900/20 border border-purple-700/40 rounded-lg overflow-hidden">
                              {/* Layer Header - Clickable */}
                              <button
                                onClick={() => toggleLayerExpand(epoch.id, layer.layerIndex)}
                                className="w-full p-4 flex items-center justify-between hover:bg-purple-900/30 transition-colors text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{isExpanded ? '📂' : '📁'}</span>
                                  <div>
                                    <div className="text-lg font-bold text-purple-200 terminal-text">
                                      Katman {layer.layerIndex}: {layer.layerName}
                                    </div>
                                    <div className="text-xs text-purple-400 terminal-text">
                                      {new Date(layer.reachedAt).toLocaleDateString('tr-TR')} • {layer.messageCount.toLocaleString()} mesaj
                                    </div>
                                  </div>
                                </div>
                                <span className="text-purple-400 text-xl">
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                              </button>

                              {/* Layer Details - Collapsible */}
                              {isExpanded && (
                                <div className="p-4 pt-0 space-y-4 animate-fadeIn">
                                  {/* Stats Mini Grid */}
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-purple-900/30 rounded-lg p-3 text-center">
                                      <div className="text-xs text-purple-400 terminal-text">Özgün</div>
                                      <div className="text-xl font-bold text-purple-200 terminal-text">
                                        {layer.uniqueMessages.toLocaleString()}
                                      </div>
                                    </div>
                                    <div className="bg-purple-900/30 rounded-lg p-3 text-center">
                                      <div className="text-xs text-purple-400 terminal-text">Yankı</div>
                                      <div className="text-xl font-bold text-purple-200 terminal-text">
                                        {layer.echoCount.toLocaleString()}
                                      </div>
                                    </div>
                                    <div className="bg-purple-900/30 rounded-lg p-3 text-center">
                                      <div className="text-xs text-purple-400 terminal-text">Oran</div>
                                      <div className="text-xl font-bold text-purple-200 terminal-text">
                                        %{((layer.echoCount / layer.messageCount) * 100).toFixed(0)}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Top Words */}
                                  {layer.topWords && layer.topWords.length > 0 && (
                                    <div>
                                      <div className="text-sm font-bold text-purple-300 terminal-text mb-2">
                                        🔤 En Çok Tekrarlanan Kelimeler
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {layer.topWords.slice(0, 8).map((word, i) => (
                                          <span key={i} className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-purple-200 terminal-text text-xs">
                                            {word.word} ({word.count})
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Emotions */}
                                  {layer.emotions && layer.emotions.length > 0 && (
                                    <div>
                                      <div className="text-sm font-bold text-purple-300 terminal-text mb-2">
                                        🎭 Duygusal Dağılım
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {layer.emotions.slice(0, 4).map((emotion, i) => (
                                          <div key={i} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emotion.color }} />
                                            <span className="text-xs text-purple-300 terminal-text">
                                              {emotion.emotion}: %{emotion.percentage}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* AI Summary */}
                                  {layer.aiSummary && (
                                    <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg text-center">
                                      <div className="text-sm text-purple-200 terminal-text italic">
                                        &quot;{layer.aiSummary}&quot;
                                      </div>
                                    </div>
                                  )}

                                  {/* Comparisons */}
                                  {layer.comparisons && layer.comparisons.length > 0 && (
                                    <div>
                                      <div className="text-sm font-bold text-blue-300 terminal-text mb-2">
                                        📊 Önceki Katmanlardan Farklar
                                      </div>
                                      <div className="space-y-2">
                                        {layer.comparisons.map((comp, i) => (
                                          <div key={i} className="p-2 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                                            <div className="text-xs text-blue-200 terminal-text mb-1">
                                              {comp.comparedWith}
                                            </div>
                                            <div className="flex gap-3 text-xs">
                                              <span className="text-green-400 terminal-text">+{comp.messageGrowth} mesaj</span>
                                              <span className="text-cyan-400 terminal-text">+{comp.uniqueGrowth} özgün</span>
                                              <span className="text-yellow-400 terminal-text">+{comp.echoGrowth} yankı</span>
                                            </div>
                                            {comp.newTopWords.length > 0 && (
                                              <div className="mt-1 flex flex-wrap gap-1">
                                                {comp.newTopWords.slice(0, 3).map((word, j) => (
                                                  <span key={j} className="px-2 py-0.5 bg-green-600/30 text-green-200 rounded text-xs terminal-text">
                                                    {word}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Connector */}
              {index < epochs.length - 1 && (
                <div className="absolute left-8 -bottom-6 w-0.5 h-6 bg-purple-700/50" />
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {epochs.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-purple-400 terminal-text text-lg">
              Henüz tamamlanmış çağ yok.
            </p>
            <p className="text-purple-500 terminal-text text-sm mt-2">
              İlk Babil Anı'nı bekleyin...
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 p-6 bg-purple-900/20 border border-purple-700/30 rounded-lg">
          <h3 className="text-xl font-bold text-purple-300 terminal-text mb-3">
            ℹ️ Çağlar Hakkında
          </h3>
          <p className="text-purple-400 terminal-text text-sm leading-relaxed">
            Her çağ, toplam mesaj sayısı <strong>1,024,808</strong> (π × 326,144) ulaştığında 
            &quot;Babil Anı&quot; ile kapanır. Bu sırada çağın istatistikleri kaydedilir ve 
            yeni bir çağ başlar. Tüm mesajlar ve odalar sıfırlanır, ancak her çağın hikayesi 
            bu arşivde sonsuza kadar saklanır.
          </p>
        </div>
      </div>
    </div>
  );
}
