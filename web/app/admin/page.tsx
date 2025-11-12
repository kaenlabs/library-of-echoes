'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ManifestoInputForm from '@/components/ManifestoInputForm';

interface EpochStats {
  epoch: {
    name: string;
    id: number;
    startDate: string;
    duration: number;
    totalMessages: number;
    uniqueMessages: number;
    echoCount: number;
    echoPercentage: string;
  };
  topWords: { rank: number; word: string; count: number; percentage: string }[];
  topSentences: { rank: number; text: string; count: number; percentage: string }[];
  timeAnalysis: any;
  contentInsights?: any;
  prompt: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [epochStats, setEpochStats] = useState<EpochStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: isAdminData } = await supabase.rpc('is_admin', { 
        p_user_id: session.user.id 
      });

      setIsAdmin(isAdminData || false);
      setLoading(false);

      if (isAdminData) {
        loadEpochStats();
      }
    } catch (error) {
      console.error('Failed to check admin:', error);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const loadEpochStats = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch('/api/epoch-export', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEpochStats(data);
      }
    } catch (error) {
      console.error('Failed to load epoch stats:', error);
    }
  };

  const downloadJSON = () => {
    if (!epochStats) return;

    const dataStr = JSON.stringify(epochStats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `epoch_${epochStats.epoch.id}_export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyPrompt = () => {
    if (!epochStats) return;
    navigator.clipboard.writeText(epochStats.prompt);
    alert('✅ Prompt kopyalandı! ChatGPT\'ye yapıştır.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 terminal-text text-xl animate-pulse">
          Yükleniyor...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl text-red-500 terminal-text mb-4">🚫 Erişim Engellendi</h1>
          <p className="text-purple-400 terminal-text mb-8">
            Bu sayfa sadece admin kullanıcılar içindir.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600/30 border border-purple-500 rounded-lg
                     text-purple-300 hover:bg-purple-600/50 transition-all terminal-text"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-purple-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-purple-100 terminal-text mb-2">
            🔐 Admin Paneli
          </h1>
          <p className="text-purple-400 terminal-text">
            Epoch yönetimi ve manuel çağ kapanışı sistemi
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-6 bg-purple-900/20 border-2 border-purple-700 rounded-lg
                     hover:bg-purple-900/40 transition-all terminal-text text-left"
          >
            <div className="text-3xl mb-2">🏠</div>
            <div className="text-xl font-bold text-purple-100 mb-2">Ana Sayfa</div>
            <div className="text-sm text-purple-400">Uygulamaya geri dön</div>
          </button>

          <button
            onClick={() => router.push('/babel')}
            className="p-6 bg-pink-900/20 border-2 border-pink-700 rounded-lg
                     hover:bg-pink-900/40 transition-all terminal-text text-left"
          >
            <div className="text-3xl mb-2">🎭</div>
            <div className="text-xl font-bold text-pink-100 mb-2">Babel Moment</div>
            <div className="text-sm text-pink-400">Test için Babel anını aç</div>
          </button>

          <button
            onClick={() => router.push('/layer-moment')}
            className="p-6 bg-blue-900/20 border-2 border-blue-700 rounded-lg
                     hover:bg-blue-900/40 transition-all terminal-text text-left"
          >
            <div className="text-3xl mb-2">🎨</div>
            <div className="text-xl font-bold text-blue-100 mb-2">Katman Geçişi</div>
            <div className="text-sm text-blue-400">Test için katman anını aç</div>
          </button>
        </div>

        {/* Epoch Stats */}
        {epochStats && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="p-6 bg-purple-900/20 border-2 border-purple-700 rounded-lg">
              <h2 className="text-3xl font-bold text-purple-100 terminal-text mb-4">
                📊 {epochStats.epoch.name} - İstatistikler
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-purple-800/20 rounded-lg">
                  <div className="text-sm text-purple-400 terminal-text">Toplam Mesaj</div>
                  <div className="text-3xl font-bold text-purple-100 terminal-text">
                    {epochStats.epoch.totalMessages.toLocaleString()}
                  </div>
                </div>
                
                <div className="p-4 bg-purple-800/20 rounded-lg">
                  <div className="text-sm text-purple-400 terminal-text">Özgün Mesaj</div>
                  <div className="text-3xl font-bold text-purple-100 terminal-text">
                    {epochStats.epoch.uniqueMessages.toLocaleString()}
                  </div>
                </div>
                
                <div className="p-4 bg-purple-800/20 rounded-lg">
                  <div className="text-sm text-purple-400 terminal-text">Yankı</div>
                  <div className="text-3xl font-bold text-purple-100 terminal-text">
                    {epochStats.epoch.echoCount.toLocaleString()}
                  </div>
                </div>
                
                <div className="p-4 bg-purple-800/20 rounded-lg">
                  <div className="text-sm text-purple-400 terminal-text">Süre</div>
                  <div className="text-3xl font-bold text-purple-100 terminal-text">
                    {epochStats.epoch.duration} gün
                  </div>
                </div>
              </div>

              {/* Top Words */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-purple-100 terminal-text mb-3">
                  🔤 En Çok Tekrar Eden Kelimeler (Top 30)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm max-h-96 overflow-y-auto">
                  {epochStats.topWords.slice(0, 30).map((word, i) => (
                    <div key={i} className="p-2 bg-purple-800/20 rounded-lg">
                      <div className="text-purple-200 terminal-text font-bold truncate">
                        #{i + 1} {word.word}
                      </div>
                      <div className="text-xs text-purple-400 terminal-text">
                        {word.count}x ({word.percentage})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Sentences */}
              <div>
                <h3 className="text-xl font-bold text-purple-100 terminal-text mb-3">
                  💬 En Çok Tekrar Eden Cümleler (Top 20)
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {epochStats.topSentences.slice(0, 20).map((sentence, i) => (
                    <div key={i} className="p-3 bg-purple-800/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 terminal-text font-bold text-sm">
                          #{i + 1}
                        </span>
                        <div className="flex-1">
                          <div className="text-purple-200 terminal-text">
                            &quot;{sentence.text}&quot;
                          </div>
                          <div className="text-sm text-purple-400 terminal-text">
                            {sentence.count}x tekrar ({sentence.percentage})
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="p-6 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-2 border-yellow-700 rounded-lg">
              <h2 className="text-3xl font-bold text-yellow-100 terminal-text mb-4">
                📜 Manuel Çağ Kapanışı
              </h2>
              
              <div className="space-y-4">
                <p className="text-yellow-200 terminal-text text-lg">
                  Çağ kapanışı için ChatGPT&apos;ye gönderilecek prompt ve veriler hazır:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={copyPrompt}
                    className="p-4 bg-yellow-600/30 border-2 border-yellow-500 rounded-lg
                             hover:bg-yellow-600/50 transition-all terminal-text font-bold
                             text-yellow-100"
                  >
                    📋 Prompt&apos;u Kopyala (ChatGPT&apos;ye yapıştır)
                  </button>

                  <button
                    onClick={downloadJSON}
                    className="p-4 bg-orange-600/30 border-2 border-orange-500 rounded-lg
                             hover:bg-orange-600/50 transition-all terminal-text font-bold
                             text-orange-100"
                  >
                    💾 JSON Dosyasını İndir
                  </button>
                </div>

                <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                  <p className="text-yellow-300 terminal-text text-sm">
                    <strong>🎯 Nasıl Yapılır:</strong>
                  </p>
                  <ol className="list-decimal list-inside text-yellow-200 terminal-text text-sm space-y-1 mt-2">
                    <li>&quot;Prompt&apos;u Kopyala&quot; butonuna tıkla</li>
                    <li>ChatGPT&apos;ye git ve prompt&apos;u yapıştır</li>
                    <li>ChatGPT&apos;nin ürettiği JSON&apos;ı kopyala</li>
                    <li>Aşağıdaki forma yapıştır ve kaydet</li>
                  </ol>
                </div>

                {/* Manual JSON Input Form */}
                <ManifestoInputForm epochId={epochStats.epoch.id} epochName={epochStats.epoch.name} />
              </div>
            </div>
          </div>
        )}

        {!epochStats && !loading && (
          <div className="p-8 bg-purple-900/20 border-2 border-purple-700 rounded-lg text-center">
            <p className="text-purple-400 terminal-text text-lg">
              Epoch verileri yüklenemedi veya aktif epoch yok.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
