'use client';

import { useEffect, useState } from 'react';

interface SystemMessageProps {
  messages: string[];
}

export default function SystemMessage({ messages }: SystemMessageProps) {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);

  useEffect(() => {
    // Reset visible messages first
    setVisibleMessages([]);
    
    // Show messages one by one with delay
    const timeouts: NodeJS.Timeout[] = [];
    messages.forEach((msg, index) => {
      const timeout = setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg]);
      }, index * 500);
      timeouts.push(timeout);
    });

    return () => {
      // Clear all timeouts on cleanup
      timeouts.forEach(timeout => clearTimeout(timeout));
      setVisibleMessages([]);
    };
  }, [messages]);

  if (visibleMessages.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 mb-8">
      {visibleMessages.map((msg, index) => (
        <div
          key={index}
          className="system-message terminal-text text-sm md:text-base 
                   text-purple-300 opacity-90 fade-in
                   px-4 py-3 border-l-2 border-purple-500/50
                   bg-black/20 rounded-r"
        >
          <span className="text-purple-500 mr-2">&gt;</span> {msg}
        </div>
      ))}
    </div>
  );
}
