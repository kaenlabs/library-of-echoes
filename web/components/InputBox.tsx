'use client';

import { useState, FormEvent } from 'react';

interface InputBoxProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export default function InputBox({ onSubmit, disabled }: InputBoxProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Bir satır yaz..."
          disabled={disabled}
          maxLength={500}
          className="w-full px-6 py-4 bg-black/50 border border-purple-500/30 rounded-lg 
                   text-purple-200 placeholder-purple-500/50 
                   focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                   disabled:opacity-50 disabled:cursor-not-allowed
                   terminal-text"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="px-8 py-3 bg-purple-600/20 border border-purple-500/50 rounded-lg
                   text-purple-200 hover:bg-purple-600/30 hover:border-purple-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 terminal-text
                   focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        >
          → Gönder
        </button>
      </div>
      <div className="mt-2 text-sm text-purple-500/50 text-right terminal-text">
        {text.length} / 500
      </div>
    </form>
  );
}
