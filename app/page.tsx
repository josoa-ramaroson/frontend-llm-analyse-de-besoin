'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ChatWindow } from '@/components/ChatWindow';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Header */}
        <div className="w-full lg:hidden">
          <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Hidden header on desktop (part of layout) */}
        <div className="hidden lg:flex w-full flex-col">
          <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
          <ChatWindow />
        </div>

        {/* Chat window for mobile */}
        <div className="lg:hidden flex-1 flex flex-col">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
