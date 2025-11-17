'use client';

import React from 'react';
import { MessageSquare, Trash2, Settings } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const messages = useChatStore((state) => state.messages);
  const clearConversation = useChatStore((state) => state.clearConversation);

  // Get unique conversations (simplified for demo)
  const conversations = messages.length > 0 ? [{ id: 1, title: 'Current Conversation' }] : [];

  return (
    <aside
      className={`fixed lg:relative w-64 h-screen bg-secondary border-r border-border flex flex-col transition-all duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Close button for mobile */}
      {onClose && (
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-background rounded-lg"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4 mt-12 lg:mt-0">
        {conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="p-3 hover:bg-background rounded-lg cursor-pointer transition-colors flex items-center gap-3 group"
              >
                <MessageSquare className="w-4 h-4 text-foreground/60" />
                <span className="text-sm text-foreground truncate">{conv.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-foreground/50">
            <MessageSquare className="w-8 h-8" />
            <p className="text-sm">No conversations yet</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-border p-4 space-y-2">
        <button
          onClick={clearConversation}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-background rounded-lg transition-colors text-sm text-foreground/70 hover:text-foreground"
        >
          <Trash2 className="w-4 h-4" />
          Clear Conversation
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-background rounded-lg transition-colors text-sm text-foreground/70 hover:text-foreground">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
