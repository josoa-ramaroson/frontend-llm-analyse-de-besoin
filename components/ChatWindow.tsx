'use client';

import { useEffect, useRef } from 'react';
import { ERole, useChatStore } from '@/store/useChatStore';
import Message from './Message';
import { Composer } from './Composer';
import apiService from '@/services/apiService';
// module-level guard to avoid double fetch in StrictMode
let hasFetchedChatHistory = false;

export function ChatWindow() {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const clearConversation = useChatStore((state) => state.clearConversation)
  const isLoading = useChatStore((state) => state.isLoading);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  if (hasFetchedChatHistory) return; // already fetched once
  hasFetchedChatHistory = true;

  (async () => {
    try {
      // don't fetch if we already have messages locally
      if (messages && messages.length > 0) return;

      const messageHistory = await apiService.getChatHistory();
      if (!Array.isArray(messageHistory) || messageHistory.length === 0) return;

      for (const msg of messageHistory) {
        addMessage({
          model_id: msg.model_id,
          uid: msg.uid,
          content: msg.response ?? "",
          file_url: msg.file_url ?? null,
          role: msg.role ?? ERole.ASSISTANT,
        });
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
      // allow retry on next mount if desired:
      hasFetchedChatHistory = false;
    }
  })();
  // empty deps -> run on mount
}, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
<div className="flex flex-col md:flex-row h-screen bg-background">
  {/* ================= LEFT: Messages WRAPPER ================= */}
  <div className="flex-1 flex flex-col min-h-0 md:border-r border-border">
    {/* Messages Container (scrollable) */}
    <div className="flex-1 overflow-y-auto min-h-0 p-3 md:p-6 space-y-4 md:space-y-6">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">AI</span>
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            Assistant sur l'analyse de besoin
          </h2>
          <p className="text-sm md:text-base text-foreground/60 max-w-md">
            Extraire rapidement les exigences depuis un document parlant
            d'un projet (dialogue, Cahier de Charge, document technique, etc...)
          </p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <Message
              key={(message.id || index) + (message.file_url || Math.random().toString())}
              message={message}
            />
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
  </div>

  {/* ================= RIGHT: Composer ================= */}
  <div className="w-full md:w-[360px] md:min-w-[320px] bg-background p-3 md:p-6 border-t md:border-t-0 md:border-l border-border flex-shrink-0">
    <Composer />
  </div>
</div>


  );
}
