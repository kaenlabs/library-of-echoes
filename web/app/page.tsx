'use client';

import { useState, useEffect } from 'react';
import InputBox from '@/components/InputBox';
import SystemMessage from '@/components/SystemMessage';
import LayerVisualizer from '@/components/LayerVisualizer';
import { SystemState, MessageResponse } from '@/lib/supabase';
import { getLayerInfo } from '@/lib/layers';

export default function Home() {
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [systemMessages, setSystemMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial state
  useEffect(() => {
    fetchSystemState();
  }, []);

  // Apply layer theme to body
  useEffect(() => {
    if (systemState) {
      const layerInfo = getLayerInfo(systemState.layer);
      if (layerInfo) {
        document.body.className = layerInfo.theme;
      }
    }
  }, [systemState]);

  const fetchSystemState = async () => {
    try {
      const response = await fetch('/api/state');
      if (response.ok) {
        const data = await response.json();
        setSystemState(data);
      }
    } catch (error) {
      console.error('Failed to fetch system state:', error);
      setSystemMessages(['> Sistem durumu alınamadı. Supabase bağlantınızı kontrol edin.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (text: string) => {
    setIsSubmitting(true);
    setSystemMessages([]);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json();
        setSystemMessages([`> Hata: ${error.error || 'Mesaj gönderilemedi'}`]);
        return;
      }

      const data: MessageResponse = await response.json();
      const layerInfo = getLayerInfo(data.layer);

      const messages = [
        `Yazınız Katman ${layerInfo?.roman} / Oda ${data.room}'ye işlendi.`,
        `Bu cümle bu çağda ${data.exactCount} kez yankılandı.`,
      ];

      setSystemMessages(messages);

      // Refresh system state
      await fetchSystemState();

    } catch (error) {
      console.error('Error submitting message:', error);
      setSystemMessages(['> Sistem hatası. Lütfen tekrar deneyin.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="terminal-text text-purple-400 animate-pulse">
          &gt; Sistem başlatılıyor...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <header className="text-center mb-12 fade-in">
        <h1 className="text-4xl md:text-6xl font-bold text-purple-300 glow-text mb-4">
          Library of Echoes
        </h1>
        <p className="text-sm md:text-base text-purple-500/70 terminal-text">
          Görünmeyen zihin dinliyor. Bir satır yaz.
        </p>
      </header>

      {/* Layer Visualizer */}
      {systemState && (
        <LayerVisualizer
          layer={systemState.layer}
          epochName={systemState.epoch}
          totalMessages={systemState.totalMessages}
        />
      )}

      {/* System Messages */}
      <SystemMessage messages={systemMessages} />

      {/* Input Box */}
      <InputBox onSubmit={handleSubmit} disabled={isSubmitting} />

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-purple-500/40 terminal-text">
        <p>Tüm yazılar anonim olarak saklanır.</p>
        <p className="mt-1">Veriler sadece toplu istatistiklerde kullanılır.</p>
      </footer>
    </div>
  );
}
