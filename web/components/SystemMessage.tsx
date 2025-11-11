'use client';

import { useEffect, useState } from 'react';

interface SystemMessageProps {
  messages: string[];
}

export default function SystemMessage({ messages }: SystemMessageProps) {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);

  useEffect(() => {
    // Show messages one by one with delay
    messages.forEach((msg, index) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg]);
      }, index * 500);
    });

    return () => {
      setVisibleMessages([]);
    };
  }, [messages]);

  if (visibleMessages.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2 mb-8">
      {visibleMessages.map((msg, index) => (
        <div
          key={index}
          className="system-message terminal-text text-sm md:text-base 
                   text-purple-300 opacity-80 fade-in
                   px-4 py-2 border-l-2 border-purple-500/50"
        >
          <span className="text-purple-500">&gt;</span> {msg}
        </div>
      ))}
    </div>
  );
}
