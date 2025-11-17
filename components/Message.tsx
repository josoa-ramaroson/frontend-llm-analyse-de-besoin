'use client';

import React from 'react';
import { Message as MessageType } from '@/store/useChatStore';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div
        className={`max-w-lg px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-secondary text-foreground rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <span className={`text-xs mt-1 block opacity-70 ${isUser ? 'text-white' : 'text-foreground'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
