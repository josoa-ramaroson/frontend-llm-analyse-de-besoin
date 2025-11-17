'use client';

import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Message } from './Message';
import { Composer } from './Composer';

export function ChatWindow() {
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">AI</span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">How can I assist you today?</h2>
            <p className="text-foreground/60 max-w-md">
              Send me any document and ask me anything about the document, I can help in extracting need
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <Message key={message.id || index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 p-3 rounded-lg bg-secondary">
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background p-6">
        <Composer />
      </div>
    </div>
  );
}
