'use client';

import { useState } from 'react';

interface ManifestoInputFormProps {
  epochId: number;
  epochName: string;
}

export default function ManifestoInputForm({ epochId, epochName }: ManifestoInputFormProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Parse JSON to validate
      const manifestoData = JSON.parse(jsonInput);

      // Validate required fields
      const required = ['shortSummary', 'detailedManifesto', 'emotionalTone', 'keyThemes'];
      const missing = required.filter(field => !manifestoData[field]);
      
      if (missing.length > 0) {
        setMessage(`❌ Eksik alanlar: ${missing.join(', ')}`);
        setLoading(false);
        return;
      }

      // Get auth token
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setMessage('❌ Oturum bulunamadı');
        setLoading(false);
        return;
      }

      // Send to API
      const response = await fetch('/api/epoch-close-manual', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          epochId,
          manifestoData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newEpochName = result.newEpoch?.name || 'Age 2'; // Get new epoch name from response
        
        setMessage(`✅ ${epochName} başarıyla kapatıldı! Yeni çağ başladı. Ana sayfaya yönlendiriliyorsunuz...`);
        setJsonInput('');
        
        // Save OLD epoch name before redirect (so new page can detect change)
        localStorage.setItem('lastSeenEpoch', epochName);
        console.log('💾 Saved old epoch for transition detection:', epochName);
        
        // Clear the "seen" flag for new epoch to force showing celebration
        localStorage.removeItem(`seen_new_epoch_${newEpochName}`);
        console.log(`🗑️ Cleared seen flag for: ${newEpochName}`);
        
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        const error = await response.json();
        setMessage(`❌ Hata: ${error.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ JSON hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-6 bg-orange-900/20 border-2 border-orange-700 rounded-lg">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full text-left flex items-center justify-between p-4 bg-orange-600/30 
                 border border-orange-500 rounded-lg hover:bg-orange-600/50 transition-all"
      >
        <span className="text-xl font-bold text-orange-100 terminal-text">
          📝 Manuel Manifesto Girişi
        </span>
        <span className="text-2xl text-orange-200">
          {showForm ? '▼' : '▶'}
        </span>
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-orange-200 terminal-text text-sm mb-2">
              ChatGPT&apos;den Aldığın JSON&apos;ı Yapıştır:
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`{
  "shortSummary": "...",
  "detailedManifesto": "...",
  "emotionalTone": "...",
  "keyThemes": [...],
  "metaphor": "...",
  "closingVerse": "...",
  "historicalSignificance": "..."
}`}
              className="w-full h-64 p-4 bg-black/50 border-2 border-orange-700 rounded-lg
                       text-orange-100 terminal-text text-sm font-mono
                       focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.startsWith('✅') 
                ? 'bg-green-900/30 border border-green-700 text-green-200' 
                : 'bg-red-900/30 border border-red-700 text-red-200'
            }`}>
              <p className="terminal-text text-sm">{message}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !jsonInput.trim()}
              className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-500 border-2 border-orange-400
                       text-white font-bold rounded-lg transition-all terminal-text
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Kaydediliyor...' : '💾 Çağı Kapat ve Kaydet'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setJsonInput('');
                setMessage('');
              }}
              className="px-6 py-3 bg-red-900/50 hover:bg-red-800/50 border border-red-700
                       text-red-200 rounded-lg transition-all terminal-text"
            >
              🗑️ Temizle
            </button>
          </div>

          <div className="p-3 bg-orange-900/20 border border-orange-700/50 rounded text-xs text-orange-300 terminal-text">
            <strong>⚠️ DİKKAT:</strong> Bu işlem geri alınamaz! Mevcut epoch kapatılacak ve yeni epoch başlatılacak.
          </div>
        </form>
      )}
    </div>
  );
}
