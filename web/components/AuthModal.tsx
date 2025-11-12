'use client';

import { useState, FormEvent } from 'react';
import { signUp, signIn } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setError('');
          alert('Kayıt başarılı! Lütfen email adresinizi kontrol edin.');
          onSuccess();
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onSuccess();
        }
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900/50 to-black border border-purple-500/50 rounded-lg p-8 max-w-md w-full relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-400 hover:text-purple-200"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-purple-300 mb-6 terminal-text">
          {mode === 'signin' ? 'Giriş Yap' : 'Üye Ol'}
        </h2>

        {/* Info */}
        <p className="text-purple-400 text-sm mb-6">
          Üye olarak günde <span className="text-purple-200 font-bold">5 mesaj</span> gönderebilirsiniz.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg 
                       text-purple-200 placeholder-purple-500/50 
                       focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                       terminal-text"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre (min 6 karakter)"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg 
                       text-purple-200 placeholder-purple-500/50 
                       focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                       terminal-text"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm terminal-text">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-purple-600/30 border border-purple-500/50 rounded-lg
                     text-purple-200 hover:bg-purple-600/50 hover:border-purple-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 terminal-text font-bold"
          >
            {loading ? 'Yükleniyor...' : mode === 'signin' ? 'Giriş Yap' : 'Üye Ol'}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-purple-400 hover:text-purple-200 text-sm terminal-text"
          >
            {mode === 'signin' ? 'Hesabınız yok mu? Üye olun' : 'Zaten üye misiniz? Giriş yapın'}
          </button>
        </div>
      </div>
    </div>
  );
}
