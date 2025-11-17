'use client';

import React from 'react';
import { Plus, Menu } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

interface HeaderProps {
  onSidebarToggle?: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const clearConversation = useChatStore((state) => state.clearConversation);

  return (
    <header className="bg-background border-b border-border h-16 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">ChatGPT Clone</h1>
      </div>

      <button
        onClick={clearConversation}
        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        New Chat
      </button>
    </header>
  );
}
