'use client';

import { useState, useEffect } from 'react';

interface TestStatus {
  testMode: boolean;
  threshold?: number;
  currentEpoch?: string;
  currentMessages?: number;
  canForceClose?: boolean;
}

export default function TestPanel() {
  const [status, setStatus] = useState<TestStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_TEST_MODE === 'true') {
      fetchStatus();
    }
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/test-babel');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch test status:', error);
    }
  };

  const forceClosEpoch = async () => {
    if (!confirm('Çağı kapatıp Babil Anı\'nı tetiklemek istediğinden emin misin?')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/test-babel', { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.closedEpoch.name} kapatıldı! Sayfayı yenile.`);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetToEpoch1 = async () => {
    if (!confirm('Age 1\'e geri dönmek istediğinden emin misin? Diğer çağlar silinecek!')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/test-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEpochId: 1 }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.epoch.name} aktif edildi!`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Don't show panel if test mode is off
  if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true' || !status?.testMode) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-yellow-900/90 border-2 border-yellow-500 rounded-lg p-4 max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🧪</span>
        <h3 className="text-yellow-200 font-bold terminal-text">TEST MODE</h3>
      </div>

      <div className="space-y-2 text-sm text-yellow-100 terminal-text">
        <p>🎯 Eşik: <strong>{status.threshold}</strong> mesaj</p>
        <p>📊 Çağ: <strong>{status.currentEpoch}</strong></p>
        <p>💬 Mesajlar: <strong>{status.currentMessages}/{status.threshold}</strong></p>
        
        {status.canForceClose ? (
          <div className="pt-3 border-t border-yellow-700 space-y-2">
            <button
              onClick={forceClosEpoch}
              disabled={loading}
              className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                       font-bold terminal-text text-sm"
            >
              {loading ? '⏳ İşleniyor...' : '🌌 Babil Anı\'nı Tetikle'}
            </button>
            <button
              onClick={() => window.location.href = '/layer-moment'}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                       font-bold terminal-text text-sm"
            >
              🎨 Katman Geçişini Gör
            </button>
            <button
              onClick={resetToEpoch1}
              disabled={loading}
              className="w-full px-3 py-1.5 bg-red-900/50 hover:bg-red-800/50 border border-red-700 text-red-200 rounded
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                       font-bold terminal-text text-xs"
            >
              🔄 Age 1'e Geri Dön
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                alert('✅ localStorage ve sessionStorage temizlendi!');
              }}
              className="w-full px-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/50 border border-purple-700 text-purple-200 rounded
                       transition-colors font-bold terminal-text text-xs"
            >
              🗑️ Cache Temizle
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('intro_seen');
                window.location.href = '/intro';
              }}
              className="w-full px-3 py-1.5 bg-pink-900/50 hover:bg-pink-800/50 border border-pink-700 text-pink-200 rounded
                       transition-colors font-bold terminal-text text-xs"
            >
              🎬 Intro Tekrar Göster
            </button>
          </div>
        ) : (
          <p className="text-yellow-300 text-xs pt-2">
            ℹ️ En az 5 mesaj gönder
          </p>
        )}

        {message && (
          <p className={`text-xs pt-2 ${message.startsWith('✅') ? 'text-green-300' : 'text-red-300'}`}>
            {message}
          </p>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-yellow-700 text-xs text-yellow-300">
        <p>⚠️ Bu panel sadece development modunda görünür</p>
      </div>
    </div>
  );
}
