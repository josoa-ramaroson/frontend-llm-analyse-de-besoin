'use client';

import React, { useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { FileUploader } from './FileUploader';

export function Composer() {
  const [input, setInput] = useState('');
  const [showFileUploader, setShowFileUploader] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isLoading = useChatStore((state) => state.isLoading);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="space-y-4">
      {showFileUploader && (
        <FileUploader onClose={() => setShowFileUploader(false)} />
      )}

      <div className="flex gap-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={isLoading}
          className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
          style={{ minHeight: '48px' }}
          rows={1}
        />
        <div className="flex gap-2">
          <button
            onClick={() => setShowFileUploader(!showFileUploader)}
            disabled={isLoading}
            className="p-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Upload file"
          >
            <Paperclip className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
